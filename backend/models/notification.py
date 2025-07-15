from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId


class Notification(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(ObjectId()))
    user_id: str
    type: str  # "success", "info", "warning", "error"
    message: str
    title: Optional[str] = None
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {
            ObjectId: str
        }


class NotificationCreate(BaseModel):
    user_id: str
    type: str
    message: str
    title: Optional[str] = None


class NotificationUpdate(BaseModel):
    read: Optional[bool] = None


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    type: str
    message: str
    title: Optional[str]
    read: bool
    created_at: datetime
    time_ago: Optional[str] = None