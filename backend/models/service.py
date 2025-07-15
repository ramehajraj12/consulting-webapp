from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId


class Service(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(ObjectId()))
    title: str
    description: str
    price_range: str
    duration: str
    features: List[str] = []
    category: str
    icon: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {
            ObjectId: str
        }


class ServiceCreate(BaseModel):
    title: str
    description: str
    price_range: str
    duration: str
    features: List[str] = []
    category: str
    icon: str


class ServiceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price_range: Optional[str] = None
    duration: Optional[str] = None
    features: Optional[List[str]] = None
    category: Optional[str] = None
    icon: Optional[str] = None


class ServiceResponse(BaseModel):
    id: str
    title: str
    description: str
    price_range: str
    duration: str
    features: List[str]
    category: str
    icon: str
    created_at: datetime