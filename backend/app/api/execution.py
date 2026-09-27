from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.execution import Execution
from app.schemas.execution import RunRequest, ExecutionOut, ExecutionPoll, InputSubmit
from app.services import execution_service, file_service

router = APIRouter(prefix="/api", tags=["execution"])

# Executions whose final state has already been written to the DB, so we
# don't re-persist on every poll once finished.
_PERSISTED: set[int] = set()


@router.post("/run", response_model=ExecutionOut, status_code=201)
def run_code(payload: RunRequest, db: Session = Depends(get_db)):
    file = file_service.get_file(db, payload.file_id)
    if not file:
        raise HTTPException(status_code=404, detail="File not found.")
    try:
        execution = execution_service.start_execution(db, file, payload.code)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return execution


@router.get("/executions/{execution_id}/poll", response_model=ExecutionPoll)
def poll(execution_id: int, db: Session = Depends(get_db)):
    result = execution_service.poll_execution(execution_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Execution not found or already cleaned up.")

    if result["status"] != "running" and execution_id not in _PERSISTED:
        execution = db.get(Execution, execution_id)
        if execution:
            execution_service.persist_final_state(db, execution)
        _PERSISTED.add(execution_id)

    return result


@router.post("/executions/{execution_id}/input")
def send_input(execution_id: int, payload: InputSubmit):
    ok = execution_service.submit_input(execution_id, payload.value)
    if not ok:
        raise HTTPException(status_code=400, detail="Execution is not running or does not accept input.")
    return {"ok": True}


@router.post("/executions/{execution_id}/stop")
def stop(execution_id: int, db: Session = Depends(get_db)):
    ok = execution_service.stop_execution(execution_id)
    execution = db.get(Execution, execution_id)
    if execution:
        execution_service.persist_final_state(db, execution)
        _PERSISTED.add(execution_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Execution not found.")
    return {"ok": True}
