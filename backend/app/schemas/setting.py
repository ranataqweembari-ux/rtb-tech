from pydantic import BaseModel


class SettingItem(BaseModel):
    key: str
    value: str


class SettingsBulkUpdate(BaseModel):
    settings: dict[str, str]
