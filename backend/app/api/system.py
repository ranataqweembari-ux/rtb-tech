from fastapi import APIRouter

from app.services.python_service import detect_python
from app.core.config import settings

router = APIRouter(prefix="/api", tags=["system"])


@router.get("/health")
def health():
    return {"status": "ok", "app": settings.app_name}


@router.get("/system/python")
def python_info():
    return detect_python()
