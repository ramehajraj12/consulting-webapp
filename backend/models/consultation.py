from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId


class Consultation(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(ObjectId()))
    client_id: str
    consultant_id: str
    service_id: str
    consultation_type: str  # "online", "phone", "in-person"
    date: datetime
    duration: int = 60  # in minutes
    status: str = "pending"  # "pending", "confirmed", "completed", "cancelled"
    notes: Optional[str] = None
    meeting_link: Optional[str] = None
    project_description: Optional[str] = None
    urgency: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {
            ObjectId: str
        }


class ConsultationCreate(BaseModel):
    consultant_id: str
    service_id: str
    consultation_type: str
    date: datetime
    duration: int = 60
    project_description: Optional[str] = None
    urgency: Optional[str] = None


class ConsultationUpdate(BaseModel):
    consultation_type: Optional[str] = None
    date: Optional[datetime] = None
    duration: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    meeting_link: Optional[str] = None
    project_description: Optional[str] = None
    urgency: Optional[str] = None


class ConsultationResponse(BaseModel):
    id: str
    client_id: str
    consultant_id: str
    service_id: str
    consultation_type: str
    date: datetime
    duration: int
    status: str
    notes: Optional[str]
    meeting_link: Optional[str]
    project_description: Optional[str]
    urgency: Optional[str]
    created_at: datetime
    client_name: Optional[str] = None
    consultant_name: Optional[str] = None
    service_title: Optional[str] = None