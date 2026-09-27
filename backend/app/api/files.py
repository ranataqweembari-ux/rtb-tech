from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.file import FileCreate, FileOut, FileUpdate
from app.services import file_service, project_service

router = APIRouter(prefix="/api", tags=["files"])


@router.get("/projects/{project_id}/files", response_model=list[FileOut])
def list_project_files(project_id: int, db: Session = Depends(get_db)):
    if not project_service.get_project(db, project_id):
        raise HTTPException(status_code=404, detail="Project not found.")
    return file_service.list_files(db, project_id)


@router.post("/projects/{project_id}/files", response_model=FileOut, status_code=201)
def create_file(project_id: int, payload: FileCreate, db: Session = Depends(get_db)):
    if not project_service.get_project(db, project_id):
        raise HTTPException(status_code=404, detail="Project not found.")
    return file_service.create_file(db, project_id, payload)


@router.get("/files/{file_id}", response_model=FileOut)
def get_file(file_id: int, db: Session = Depends(get_db)):
    file = file_service.get_file(db, file_id)
    if not file:
        raise HTTPException(status_code=404, detail="File not found.")
    return file


@router.put("/files/{file_id}", response_model=FileOut)
def update_file(file_id: int, payload: FileUpdate, db: Session = Depends(get_db)):
    file = file_service.get_file(db, file_id)
    if not file:
        raise HTTPException(status_code=404, detail="File not found.")
    return file_service.update_file(db, file, payload)


@router.delete("/files/{file_id}", status_code=204)
def delete_file(file_id: int, db: Session = Depends(get_db)):
    file = file_service.get_file(db, file_id)
    if not file:
        raise HTTPException(status_code=404, detail="File not found.")
    if len(file.project.files) <= 1:
        raise HTTPException(status_code=400, detail="A project must have at least one file.")
    file_service.delete_file(db, file)
