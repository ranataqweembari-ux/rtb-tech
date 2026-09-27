from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.setting import SettingsBulkUpdate
from app.services import setting_service

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("")
def get_settings(db: Session = Depends(get_db)):
    return setting_service.get_all_settings(db)


@router.put("")
def update_settings(payload: SettingsBulkUpdate, db: Session = Depends(get_db)):
    return setting_service.update_settings(db, payload.settings)
