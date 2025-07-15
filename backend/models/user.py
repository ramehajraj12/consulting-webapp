from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
import uuid


class User(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(ObjectId()))
    email: EmailStr
    password_hash: str
    role: str  # "client", "consultant", or "admin"
    name: str
    phone: Optional[str] = None
    company: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    is_approved: bool = False  # For approval system
    approved_by: Optional[str] = None  # Admin who approved
    approved_at: Optional[datetime] = None

    class Config:
        json_encoders = {
            ObjectId: str
        }


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str
    name: str
    phone: Optional[str] = None
    company: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    name: str
    phone: Optional[str] = None
    company: Optional[str] = None
    created_at: datetime
    is_active: bool
    is_approved: bool
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None


class Consultant(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(ObjectId()))
    user_id: str
    title: str
    specialization: str
    experience: str
    bio: str
    rating: float = 0.0
    hourly_rate: float
    availability: dict = {}
    certifications: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {
            ObjectId: str
        }


class ConsultantCreate(BaseModel):
    title: str
    specialization: str
    experience: str
    bio: str
    hourly_rate: float
    certifications: List[str] = []


class ConsultantUpdate(BaseModel):
    title: Optional[str] = None
    specialization: Optional[str] = None
    experience: Optional[str] = None
    bio: Optional[str] = None
    hourly_rate: Optional[float] = None
    certifications: Optional[List[str]] = None


class ConsultantResponse(BaseModel):
    id: str
    user_id: str
    title: str
    specialization: str
    experience: str
    bio: str
    rating: float
    hourly_rate: float
    availability: dict
    certifications: List[str]
    user: UserResponse