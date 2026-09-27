"""Key/value application settings, persisted in the database."""
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.setting import Setting

DEFAULTS: dict[str, str] = {
    "editor.fontSize": "14",
    "editor.tabSize": "4",
    "editor.wordWrap": "off",
    "editor.minimap": "true",
    "editor.autoSave": "true",
    "appearance.theme": "dark",
    "execution.timeout": "5",
    "execution.pythonPath": "python",
    "app.confirmBeforeDelete": "true",
    "app.notifications": "true",
}


def get_all_settings(db: Session) -> dict[str, str]:
    rows = db.scalars(select(Setting)).all()
    result = dict(DEFAULTS)
    for row in rows:
        result[row.key] = row.value
    return result


def update_settings(db: Session, updates: dict[str, str]) -> dict[str, str]:
    for key, value in updates.items():
        row = db.scalar(select(Setting).where(Setting.key == key))
        if row is None:
            row = Setting(key=key, value=value)
            db.add(row)
        else:
            row.value = value
    db.commit()
    return get_all_settings(db)
