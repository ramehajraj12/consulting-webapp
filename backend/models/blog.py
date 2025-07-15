from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
import uuid


class BlogPost(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    excerpt: str
    author_id: str
    author_name: str
    category: str
    tags: List[str] = []
    featured_image: Optional[str] = None
    status: str = "draft"  # draft, published, archived
    views: int = 0
    likes: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    published_at: Optional[datetime] = None
    meta_description: Optional[str] = None
    reading_time: Optional[int] = None  # in minutes

    class Config:
        json_encoders = {
            ObjectId: str
        }


class BlogPostCreate(BaseModel):
    title: str
    content: str
    excerpt: str
    category: str
    tags: List[str] = []
    featured_image: Optional[str] = None
    status: str = "draft"
    meta_description: Optional[str] = None


class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    featured_image: Optional[str] = None
    status: Optional[str] = None
    meta_description: Optional[str] = None


class BlogPostResponse(BaseModel):
    id: str
    title: str
    content: str
    excerpt: str
    author_id: str
    author_name: str
    category: str
    tags: List[str]
    featured_image: Optional[str]
    status: str
    views: int
    likes: int
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime]
    meta_description: Optional[str]
    reading_time: Optional[int]


class BlogCategory(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    slug: str
    post_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {
            ObjectId: str
        }


class BlogCategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    slug: str


class BlogCategoryResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    slug: str
    post_count: int
    created_at: datetime


class BlogComment(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    post_id: str
    author_id: str
    author_name: str
    content: str
    status: str = "pending"  # pending, approved, rejected
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {
            ObjectId: str
        }


class BlogCommentCreate(BaseModel):
    post_id: str
    content: str


class BlogCommentResponse(BaseModel):
    id: str
    post_id: str
    author_id: str
    author_name: str
    content: str
    status: str
    created_at: datetime
    updated_at: datetime