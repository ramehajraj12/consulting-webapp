from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId


class Project(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(ObjectId()))
    client_id: str
    consultant_id: str
    title: str
    description: str
    status: str = "pending"  # "pending", "in-progress", "completed", "cancelled"
    progress: int = 0
    deadline: Optional[datetime] = None
    price: Optional[float] = None
    type: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {
            ObjectId: str
        }


class ProjectCreate(BaseModel):
    consultant_id: str
    title: str
    description: str
    deadline: Optional[datetime] = None
    price: Optional[float] = None
    type: str


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[int] = None
    deadline: Optional[datetime] = None
    price: Optional[float] = None
    type: Optional[str] = None


class ProjectResponse(BaseModel):
    id: str
    client_id: str
    consultant_id: str
    title: str
    description: str
    status: str
    progress: int
    deadline: Optional[datetime]
    price: Optional[float]
    type: str
    created_at: datetime
    updated_at: datetime
    client_name: Optional[str] = None
    consultant_name: Optional[str] = None


class ProjectFile(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(ObjectId()))
    project_id: str
    filename: str
    original_filename: str
    file_path: str
    file_type: str
    file_size: int
    uploaded_by: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {
            ObjectId: str
        }


class ProjectFileCreate(BaseModel):
    project_id: str
    filename: str
    original_filename: str
    file_path: str
    file_type: str
    file_size: int


class ProjectFileResponse(BaseModel):
    id: str
    project_id: str
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    uploaded_by: str
    uploaded_at: datetime
    uploader_name: Optional[str] = None