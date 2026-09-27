"""Detects the local Python interpreter used to run user code."""
import shutil
import subprocess

from app.core.config import settings


def detect_python() -> dict:
    """Return interpreter path/version info, or a helpful message if missing."""
    candidate = settings.python_executable
    path = shutil.which(candidate)

    if not path:
        # Common fallback names on some systems.
        for name in ("python3", "python", "py"):
            path = shutil.which(name)
            if path:
                break

    if not path:
        return {
            "found": False,
            "path": None,
            "version": None,
            "message": "Python interpreter not found. Install Python 3.10+ and make sure "
                       "it is on your PATH, or set PYTHON_EXECUTABLE in backend/.env.",
        }

    try:
        result = subprocess.run([path, "--version"], capture_output=True, text=True, timeout=5)
        version = (result.stdout or result.stderr).strip()
    except Exception as exc:  # pragma: no cover - defensive
        return {
            "found": False,
            "path": path,
            "version": None,
            "message": f"Found a Python executable but could not run it: {exc}",
        }

    return {"found": True, "path": path, "version": version, "message": f"{version} detected ✓"}
