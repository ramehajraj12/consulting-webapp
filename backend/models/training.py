from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId


class TrainingProgram(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(ObjectId()))
    title: str
    description: str
    level: str  # "Fillestar", "I mesëm", "I avancuar", "Specializim"
    duration: str  # "4 javë", "6 javë", etc.
    price: float
    rating: float = 0.0
    students: int = 0
    instructor_id: str
    modules: List[str] = []
    video_urls: List[str] = []  # Lista e URL-ve të videove
    materials: List[str] = []   # Lista e materialeve
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {
            ObjectId: str
        }


class TrainingProgramCreate(BaseModel):
    title: str
    description: str
    level: str
    duration: str
    price: float
    modules: List[str] = []
    video_urls: List[str] = []
    materials: List[str] = []


class TrainingProgramUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    level: Optional[str] = None
    duration: Optional[str] = None
    price: Optional[float] = None
    modules: Optional[List[str]] = None
    video_urls: Optional[List[str]] = None
    materials: Optional[List[str]] = None
    is_active: Optional[bool] = None


class TrainingProgramResponse(BaseModel):
    id: str
    title: str
    description: str
    level: str
    duration: str
    price: float
    rating: float
    students: int
    instructor_id: str
    modules: List[str]
    video_urls: List[str]
    materials: List[str]
    is_active: bool
    created_at: datetime
    instructor_name: Optional[str] = None


class TrainingEnrollment(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(ObjectId()))
    student_id: str
    training_id: str
    enrolled_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    progress: int = 0  # 0-100%
    current_module: int = 0
    status: str = "active"  # "active", "completed", "cancelled"

    class Config:
        json_encoders = {
            ObjectId: str
        }


class TrainingEnrollmentCreate(BaseModel):
    training_id: str


class TrainingEnrollmentResponse(BaseModel):
    id: str
    student_id: str
    training_id: str
    enrolled_at: datetime
    completed_at: Optional[datetime]
    progress: int
    current_module: int
    status: str
    training_title: Optional[str] = None
    student_name: Optional[str] = None