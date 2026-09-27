"""
Database engine/session setup (SQLAlchemy ORM, SQLite by default).

SQLite is the single source of truth for projects, files, executions and
settings — nothing important is kept only in the browser.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}

engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a scoped DB session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create all tables if they do not exist yet."""
    # Import models so they are registered on Base.metadata before create_all.
    from app.models import project, file, execution, setting  # noqa: F401
    Base.metadata.create_all(bind=engine)
