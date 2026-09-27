from datetime import datetime
from pydantic import BaseModel, Field


class RunRequest(BaseModel):
    file_id: int
    code: str = Field(..., max_length=200_000)


class InputSubmit(BaseModel):
    value: str = Field("", max_length=5000)


class ExecutionOut(BaseModel):
    id: int
    project_id: int
    file_id: int
    filename: str
    code: str
    output: str
    error: str
    status: str
    execution_time: float
    created_at: datetime

    class Config:
        from_attributes = True


class ExecutionPoll(BaseModel):
    id: int
    status: str
    output: str
    error: str
    waiting_for_input: bool
    execution_time: float
