"""Business logic for Project CRUD, kept separate from the API layer."""
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.project import Project
from app.models.file import PythonFile
from app.schemas.project import ProjectCreate, ProjectUpdate

DEFAULT_MAIN_TEMPLATE = '''"""
main.py

Start writing your Python code here.
Press Ctrl+Enter (or click Run) to execute.
"""

print("Hello from RTB's Tech!")
'''


def list_projects(db: Session) -> list[Project]:
    return list(db.scalars(select(Project).order_by(Project.updated_at.desc())).all())


def get_project(db: Session, project_id: int) -> Project | None:
    return db.get(Project, project_id)


def create_project(db: Session, data: ProjectCreate) -> Project:
    project = Project(name=data.name.strip(), description=data.description.strip())
    db.add(project)
    db.flush()  # get project.id before creating the default file

    main_file = PythonFile(project_id=project.id, filename="main.py", content=DEFAULT_MAIN_TEMPLATE)
    db.add(main_file)

    db.commit()
    db.refresh(project)
    return project


def update_project(db: Session, project: Project, data: ProjectUpdate) -> Project:
    if data.name is not None:
        project.name = data.name.strip()
    if data.description is not None:
        project.description = data.description.strip()
    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, project: Project) -> None:
    db.delete(project)
    db.commit()
