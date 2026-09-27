# RTB's Tech — Python Learning IDE

A local, browser-based Python IDE built for learning and practicing Python fundamentals and
Object-Oriented Programming. Created by **Rana Taqweem Bari** — Software Engineering Student &
Backend Developer.

RTB's Tech runs entirely on your own machine: a FastAPI backend executes your Python code as a
real subprocess (with timeouts and interactive `input()` support), and a React + Monaco frontend
gives you a VS Code–style editing experience. Everything — projects, files, and execution
history — is stored in a local SQLite database, so it's still there after you close and reopen
the app.

---

## Features

- **Projects & files** — create multiple projects, each with multiple `.py` files; rename,
  delete, and switch between them from a VS Code–style file explorer.
- **Monaco code editor** — Python syntax highlighting, bracket matching, code folding, minimap,
  multiple tabs, unsaved-changes indicator, adjustable font size / tab size / word wrap.
- **Real code execution** — your code runs as an actual `python` subprocess (never `exec()`
  inside the server process), with a configurable timeout that kills runaway loops
  (`while True: pass` is stopped automatically), full stdout/stderr capture, and execution timing.
- **Interactive `input()`** — programs that call `input()` pause and show a live input box in the
  Output panel; typed values are sent straight to the running program's stdin.
- **Execution history** — every run is saved to the database with its code, output, error,
  status, and duration, and can be reopened from the History tab.
- **Python Learning section** — 17 built-in topics (fundamentals + OOP) with an explanation and a
  "Run example" button that opens the example in the editor and executes it immediately.
- **Settings** — editor preferences, dark/light theme, autosave, and a "Detect Python" button
  that checks which interpreter the backend will use.
- **Toasts, autosave, keyboard shortcuts** — `Ctrl+S` save, `Ctrl+Enter` / `F5` run.

## Technology stack

| Layer      | Technology                                             |
|------------|---------------------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, Monaco Editor, lucide-react |
| Backend    | Python, FastAPI, Uvicorn                                |
| Database   | SQLite via SQLAlchemy ORM                               |
| Execution  | `subprocess` (isolated child process, not `exec()`)     |

## Architecture

```
Python code in Monaco editor
        │  Ctrl+Enter / Run button
        ▼
React frontend  ──POST /api/run──▶  FastAPI (execution.py)
                                          │
                                          ▼
                              execution_service.start_execution()
                                          │
                              subprocess.Popen([python, "-u", tmp.py])
                                    /            \
                        reader threads         watchdog thread
                     (stdout / stderr)         (kills on timeout)
                                          │
React polls  ◀──GET /api/executions/{id}/poll── in-memory execution state
   (300ms)          (output, status, waiting_for_input)
        │
        └─ if waiting_for_input: shows an input box →
                POST /api/executions/{id}/input → written to subprocess stdin
```

```
rtb-tech/
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI app, CORS, startup, sample project seed
│   │   ├── api/                   # projects, files, execution, history, settings, system
│   │   ├── models/                # SQLAlchemy models: Project, PythonFile, Execution, Setting
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   ├── services/               # business logic (project/file/execution/python/settings)
│   │   ├── database/database.py    # engine, session, init_db()
│   │   └── core/config.py          # environment-driven settings
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/             # TopBar, Sidebar, EditorTabs, CodeEditor, OutputPanel, Modal, ToastContainer
    │   ├── pages/                  # Dashboard, IDE, Learning, SettingsPage, About
    │   ├── context/AppContext.jsx  # theme, settings, toasts
    │   ├── services/api.js         # REST client
    │   ├── data/learningContent.js # fundamentals + OOP topic content
    │   └── monacoSetup.js          # configures Monaco to load locally, not from a CDN
    ├── index.html
    └── package.json
```

---

## Requirements

- **Python 3.10+** on your PATH (this is the interpreter your code runs in — check with
  `python --version`)
- **Node.js 18+** and npm

## Installation & running locally (Windows CMD)

Open two Command Prompt windows — one for the backend, one for the frontend.

### 1. Backend setup

```cmd
cd rtb-tech\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

The first time it starts, the backend creates `rtb_tech.db` in the `backend` folder and seeds a
sample project called **"RTB Python Basics"** with 6 files (`main.py`, `variables.py`,
`conditions.py`, `loops.py`, `functions.py`, `oop.py`).

Leave this window running. Check it worked by visiting **http://127.0.0.1:8000/docs** — you
should see the interactive Swagger API docs.

### 2. Frontend setup (in a second CMD window)

```cmd
cd rtb-tech\frontend
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser. That's RTB's Tech.

> The frontend dev server proxies `/api/*` requests to `http://127.0.0.1:8000`, so make sure the
> backend is running first.

### Building a production frontend bundle

```cmd
cd rtb-tech\frontend
npm run build
npm run preview
```

`npm run build` outputs static files to `frontend/dist`. For a fully "production" deployment you
would serve those static files (e.g. with a simple static file server, or by having FastAPI serve
them) while the FastAPI backend continues running on port 8000 — this is left as a future
improvement (see below) since local development mode (`npm run dev` + `uvicorn --reload`) is the
primary supported way to run RTB's Tech today.

---

## Configuration

Backend configuration lives in `backend/.env` (copy from `.env.example`):

```env
DATABASE_URL=sqlite:///./rtb_tech.db
PYTHON_EXECUTABLE=python
EXECUTION_TIMEOUT=5
MAX_CODE_SIZE=50000
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

- `PYTHON_EXECUTABLE` — the interpreter used to run user code. Change this if `python` isn't on
  your PATH, or to point at a specific virtual environment's interpreter.
- `EXECUTION_TIMEOUT` — seconds before a running program is force-killed.
- `MAX_CODE_SIZE` — maximum characters accepted per run, to guard against pathological input.

## API documentation

With the backend running, visit:

- **http://127.0.0.1:8000/docs** — interactive Swagger UI
- **http://127.0.0.1:8000/redoc** — ReDoc reference

Key endpoints: `GET/POST /api/projects`, `GET/POST/PUT/DELETE /api/projects/{id}/files` &
`/api/files/{id}`, `POST /api/run`, `GET /api/executions/{id}/poll`,
`POST /api/executions/{id}/input`, `POST /api/executions/{id}/stop`, `GET /api/executions`,
`GET/PUT /api/settings`, `GET /api/system/python`, `GET /api/health`.

## Security notes

RTB's Tech is built **for local, single-user, educational use** — not as a multi-tenant or
internet-facing code execution service. It treats submitted code as untrusted and takes these
precautions:

- Code is **never** run with `exec()`/`eval()` inside the FastAPI process — it always runs as a
  separate OS subprocess of the configured Python interpreter.
- Every run is subject to a timeout (default 5s) enforced by a watchdog thread, which forcibly
  kills the process (and its process group/tree, cross-platform) if exceeded.
- Submitted code size is capped (`MAX_CODE_SIZE`) to avoid pathological input.
- The backend only accepts requests from the configured `CORS_ORIGINS`.
- There is **no OS-level sandboxing** (no container, no seccomp, no filesystem/network
  restriction) beyond the subprocess boundary and timeout. Don't expose this backend to the
  public internet or run untrusted third-party code with it — for that, run the backend inside a
  container (e.g. Docker) with dropped capabilities and no network access, which is noted below
  as a future improvement.

## Known limitations / scope notes

Being upfront about what's simplified in this build:

- **Interactive input detection is a heuristic.** The backend can't literally see that a script
  is blocked inside `input()`; it infers "waiting for input" from ~0.6 seconds of stdout silence
  while the process is still alive. This works well for typical learning exercises but can
  occasionally show the input box a little early/late for scripts with unusual timing (e.g. a
  slow computation right before output).
- **No Docker/OS-level sandbox** is included by default (see Security notes above).
- **The "Terminal" tab** in the Output panel is a placeholder — there's no free-form interactive
  shell, only the Output tab tied to a specific run.
- **The Learning section covers 17 curated topics** (all fundamentals + all 5 OOP topics named
  in the brief) rather than a fully separate progress-tracking system with per-topic completion
  percentages.
- **Quick Open (Ctrl+P)** and **Save As (Ctrl+Shift+S)** are not implemented in this build.

## Future improvements

- Optional Docker-based sandboxing for stronger isolation of untrusted code.
- A "production" launch mode where FastAPI serves the built frontend directly from one process/port.
- Real pseudo-terminal (PTY) execution for a true interactive terminal tab.
- Per-topic progress tracking in the Learning section, persisted per user.
- Quick Open / fuzzy file search, Save As, and multi-window layouts.
- User accounts, if RTB's Tech is ever used by more than one person on the same machine.

---

## Developer

**Rana Taqweem Bari** — Software Engineering Student & Backend Developer
