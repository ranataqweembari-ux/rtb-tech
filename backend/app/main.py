"""
RTB's Tech — backend entrypoint.

Run with:
    uvicorn app.main:app --reload --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.core.config import settings
from app.database.database import init_db, SessionLocal
from app.models.project import Project
from app.services import project_service
from app.schemas.project import ProjectCreate
from app.api import projects, files, execution, history, settings as settings_api, system

SAMPLE_FILES = {
    "main.py": '''print("Hello from RTB Python Basics!")

name = input("What is your name? ")
print(f"Welcome, {name}! Let's learn Python.")
''',
    "variables.py": '''# Variables and data types
age = 21
height = 5.9
name = "Rana"
is_student = True

print(name, age, height, is_student)
print(type(age), type(height), type(name), type(is_student))
''',
    "conditions.py": '''score = 78

if score >= 90:
    print("Grade: A")
elif score >= 75:
    print("Grade: B")
elif score >= 60:
    print("Grade: C")
else:
    print("Grade: F")
''',
    "loops.py": '''# for loop
for i in range(1, 6):
    print(f"Iteration {i}")

# while loop
count = 0
while count < 3:
    print("count =", count)
    count += 1
''',
    "functions.py": '''def greet(name: str) -> str:
    return f"Hello, {name}!"

def add(a: int, b: int) -> int:
    return a + b

print(greet("RTB's Tech"))
print("2 + 3 =", add(2, 3))
''',
    "oop.py": '''class Student:
    def __init__(self, name, roll_no):
        self.name = name
        self.roll_no = roll_no

    def introduce(self):
        print(f"My name is {self.name}, roll no {self.roll_no}")


class GraduateStudent(Student):
    def __init__(self, name, roll_no, thesis):
        super().__init__(name, roll_no)
        self.thesis = thesis

    def introduce(self):
        super().introduce()
        print(f"My thesis topic is: {self.thesis}")


student = Student("Rana", 101)
student.introduce()

grad = GraduateStudent("Taqweem", 102, "AI in Education")
grad.introduce()
''',
}


def seed_sample_project() -> None:
    """Create the default 'RTB Python Basics' sample project on first run."""
    db = SessionLocal()
    try:
        exists = db.scalar(select(Project).where(Project.name == "RTB Python Basics"))
        if exists:
            return
        project = project_service.create_project(
            db, ProjectCreate(name="RTB Python Basics", description="Sample project with fundamentals & OOP examples.")
        )
        from app.services import file_service
        from app.schemas.file import FileCreate

        # Replace the auto-created main.py with our richer sample, then add the rest.
        existing_main = project.files[0]
        existing_main.content = SAMPLE_FILES["main.py"]
        db.commit()

        for filename, content in SAMPLE_FILES.items():
            if filename == "main.py":
                continue
            file_service.create_file(db, project.id, FileCreate(filename=filename, content=content))
    finally:
        db.close()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        description="A modern, local Python learning & development environment.",
        version="1.0.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(system.router)
    app.include_router(projects.router)
    app.include_router(files.router)
    app.include_router(execution.router)
    app.include_router(history.router)
    app.include_router(settings_api.router)

    @app.on_event("startup")
    def on_startup():
        init_db()
        seed_sample_project()

    return app


app = create_app()
