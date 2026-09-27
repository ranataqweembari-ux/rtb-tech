from datetime import datetime
from pydantic import BaseModel, Field


class FileCreate(BaseModel):
    filename: str = Field(..., min_length=1, max_length=255)
    content: str = Field("", max_length=200_000)


class FileUpdate(BaseModel):
    filename: str | None = Field(None, min_length=1, max_length=255)
    content: str | None = Field(None, max_length=200_000)


class FileOut(BaseModel):
    id: int
    project_id: int
    filename: str
    content: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FileMeta(BaseModel):
    """Lightweight file listing without full content, for the file tree."""
    id: int
    project_id: int
    filename: str
    updated_at: datetime

    class Config:
        from_attributes = True
