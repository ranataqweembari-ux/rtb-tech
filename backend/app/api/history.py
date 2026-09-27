from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, desc

from app.database.database import get_db
from app.models.execution import Execution
from app.schemas.execution import ExecutionOut

router = APIRouter(prefix="/api/executions", tags=["history"])


@router.get("", response_model=list[ExecutionOut])
def list_executions(project_id: int | None = Query(None), limit: int = Query(50, le=200), db: Session = Depends(get_db)):
    stmt = select(Execution).order_by(desc(Execution.created_at)).limit(limit)
    if project_id is not None:
        stmt = stmt.where(Execution.project_id == project_id)
    return list(db.scalars(stmt).all())


@router.get("/{execution_id}", response_model=ExecutionOut)
def get_execution(execution_id: int, db: Session = Depends(get_db)):
    execution = db.get(Execution, execution_id)
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found.")
    return execution


@router.delete("/{execution_id}", status_code=204)
def delete_execution(execution_id: int, db: Session = Depends(get_db)):
    execution = db.get(Execution, execution_id)
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found.")
    db.delete(execution)
    db.commit()
