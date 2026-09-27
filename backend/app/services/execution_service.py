"""
Python code execution engine.

Design notes (read this before touching timeout/input logic):

- User code is NEVER executed with exec()/eval() inside the FastAPI process.
  It is written to a temporary .py file and run as a separate OS subprocess
  via the configured Python interpreter. This is the isolation boundary.

- Because input() needs to work interactively from the browser, we cannot
  just call subprocess.run() and wait for completion. Instead we:
    1. Spawn the subprocess with stdin/stdout/stderr as pipes.
    2. Start background reader threads that continuously drain stdout/stderr
       into an in-memory buffer (ExecutionState) as text arrives.
    3. The frontend polls GET /api/executions/{id}/poll every ~300ms and
       receives the buffer content + status.
    4. "waiting_for_input" is a heuristic: if the process is still alive and
       no new output has arrived for IDLE_THRESHOLD seconds, we assume the
       script is blocked on input() and let the user type a value, which is
       written to the subprocess's stdin.
       This is a heuristic (we cannot see into the subprocess), but it is a
       standard, documented approach for this kind of lightweight IDE and
       works well in practice for typical learning exercises.

- A watchdog thread enforces EXECUTION_TIMEOUT and forcibly kills the
  process (and, on POSIX, its process group) if it runs too long — this is
  what stops `while True: pass` from freezing the app.
"""
from __future__ import annotations

import os
import signal
import subprocess
import sys
import tempfile
import threading
import time
from dataclasses import dataclass, field

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.execution import Execution
from app.models.file import PythonFile

IDLE_THRESHOLD = 0.6  # seconds of silence before we guess the script wants input()
MAX_OUTPUT_CHARS = 200_000  # hard cap so runaway output can't exhaust memory


@dataclass
class ExecutionState:
    process: subprocess.Popen
    output: list[str] = field(default_factory=list)
    error: list[str] = field(default_factory=list)
    lock: threading.Lock = field(default_factory=threading.Lock)
    last_output_time: float = field(default_factory=time.time)
    start_time: float = field(default_factory=time.time)
    status: str = "running"  # running | success | error | timeout | stopped
    finished_event: threading.Event = field(default_factory=threading.Event)
    tmp_path: str | None = None
    exec_time: float = 0.0


# In-memory registry of currently/recently running executions, keyed by DB execution id.
_REGISTRY: dict[int, ExecutionState] = {}
_REGISTRY_LOCK = threading.Lock()


def _reader_thread(state: ExecutionState, stream, target: list[str]) -> None:
    try:
        for chunk in iter(lambda: stream.read(1), ""):
            with state.lock:
                if sum(len(s) for s in target) < MAX_OUTPUT_CHARS:
                    target.append(chunk)
                state.last_output_time = time.time()
    except Exception:
        pass
    finally:
        try:
            stream.close()
        except Exception:
            pass


def _kill_process_tree(process: subprocess.Popen) -> None:
    try:
        if os.name == "nt":
            subprocess.run(
                ["taskkill", "/F", "/T", "/PID", str(process.pid)],
                capture_output=True, timeout=5,
            )
        else:
            os.killpg(os.getpgid(process.pid), signal.SIGKILL)
    except Exception:
        try:
            process.kill()
        except Exception:
            pass


def _watchdog(state: ExecutionState, timeout: int) -> None:
    deadline = state.start_time + timeout
    while time.time() < deadline:
        if state.finished_event.wait(timeout=0.2):
            return  # process finished naturally before the deadline
    if not state.finished_event.is_set():
        with state.lock:
            state.status = "timeout"
            state.error.append(f"\n[Execution stopped: exceeded {timeout}s timeout]\n")
        _kill_process_tree(state.process)


def start_execution(db: Session, file: PythonFile, code: str) -> Execution:
    """Persist a 'running' Execution row and spawn the subprocess for it."""
    if len(code) > settings.max_code_size:
        raise ValueError(f"Code exceeds the maximum allowed size of {settings.max_code_size} characters.")

    execution = Execution(
        project_id=file.project_id,
        file_id=file.id,
        filename=file.filename,
        code=code,
        output="",
        error="",
        status="running",
        execution_time=0.0,
    )
    db.add(execution)
    db.commit()
    db.refresh(execution)

    tmp = tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False, encoding="utf-8")
    tmp.write(code)
    tmp.close()

    popen_kwargs = dict(
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1,
        encoding="utf-8",
    )
    if os.name != "nt":
        popen_kwargs["preexec_fn"] = os.setsid
    else:
        popen_kwargs["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP

    python_exe = settings.python_executable or sys.executable
    process = subprocess.Popen([python_exe, "-u", tmp.name], **popen_kwargs)

    state = ExecutionState(process=process, tmp_path=tmp.name)
    with _REGISTRY_LOCK:
        _REGISTRY[execution.id] = state

    threading.Thread(target=_reader_thread, args=(state, process.stdout, state.output), daemon=True).start()
    threading.Thread(target=_reader_thread, args=(state, process.stderr, state.error), daemon=True).start()
    threading.Thread(target=_watchdog, args=(state, settings.execution_timeout), daemon=True).start()
    threading.Thread(target=_finalize_when_done, args=(execution.id,), daemon=True).start()

    return execution


def _finalize_when_done(execution_id: int) -> None:
    """Waits for the subprocess to exit, then freezes final status/timing."""
    with _REGISTRY_LOCK:
        state = _REGISTRY.get(execution_id)
    if state is None:
        return

    returncode = state.process.wait()
    state.finished_event.set()
    state.exec_time = round(time.time() - state.start_time, 4)

    with state.lock:
        if state.status == "running":
            state.status = "success" if returncode == 0 else "error"
        try:
            if state.tmp_path and os.path.exists(state.tmp_path):
                os.remove(state.tmp_path)
        except Exception:
            pass


def poll_execution(execution_id: int) -> dict | None:
    with _REGISTRY_LOCK:
        state = _REGISTRY.get(execution_id)
    if state is None:
        return None

    with state.lock:
        output = "".join(state.output)
        error = "".join(state.error)
        status = state.status
        idle = time.time() - state.last_output_time
        alive = state.process.poll() is None
        waiting_for_input = alive and status == "running" and idle > IDLE_THRESHOLD
        exec_time = state.exec_time if not alive else round(time.time() - state.start_time, 4)

    return {
        "id": execution_id,
        "status": status,
        "output": output,
        "error": error,
        "waiting_for_input": waiting_for_input,
        "execution_time": exec_time,
    }


def submit_input(execution_id: int, value: str) -> bool:
    with _REGISTRY_LOCK:
        state = _REGISTRY.get(execution_id)
    if state is None or state.process.poll() is not None:
        return False
    try:
        state.process.stdin.write(value + "\n")
        state.process.stdin.flush()
        with state.lock:
            state.last_output_time = time.time()
        return True
    except Exception:
        return False


def stop_execution(execution_id: int) -> bool:
    with _REGISTRY_LOCK:
        state = _REGISTRY.get(execution_id)
    if state is None:
        return False
    with state.lock:
        state.status = "stopped"
    _kill_process_tree(state.process)
    state.finished_event.set()
    return True


def persist_final_state(db: Session, execution: Execution) -> Execution:
    """Copy the in-memory buffer into the DB row once the run has finished."""
    result = poll_execution(execution.id)
    if result is None:
        return execution
    execution.output = result["output"]
    execution.error = result["error"]
    execution.status = result["status"]
    execution.execution_time = result["execution_time"]
    db.commit()
    db.refresh(execution)
    return execution
