"""Business logic for file (Python source file) CRUD within a project."""
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.file import PythonFile
from app.schemas.file import FileCreate, FileUpdate


def list_files(db: Session, project_id: int) -> list[PythonFile]:
    stmt = select(PythonFile).where(PythonFile.project_id == project_id).order_by(PythonFile.filename)
    return list(db.scalars(stmt).all())


def get_file(db: Session, file_id: int) -> PythonFile | None:
    return db.get(PythonFile, file_id)


def create_file(db: Session, project_id: int, data: FileCreate) -> PythonFile:
    filename = data.filename.strip()
    if not filename.endswith(".py"):
        filename += ".py"
    file = PythonFile(project_id=project_id, filename=filename, content=data.content)
    db.add(file)
    db.commit()
    db.refresh(file)
    return file


def update_file(db: Session, file: PythonFile, data: FileUpdate) -> PythonFile:
    if data.filename is not None and data.filename.strip():
        filename = data.filename.strip()
        if not filename.endswith(".py"):
            filename += ".py"
        file.filename = filename
    if data.content is not None:
        file.content = data.content
    db.commit()
    db.refresh(file)
    return file


def delete_file(db: Session, file: PythonFile) -> None:
    db.delete(file)
    db.commit()
