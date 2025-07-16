from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
import uuid
from enum import Enum

# ===============================
# USER MANAGEMENT MODELS
# ===============================

class UserRole(str, Enum):
    ADMIN = "admin"
    RESEARCHER = "researcher"
    STUDENT = "student"
    ANALYST = "analyst"

class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    username: str
    full_name: str
    role: UserRole = UserRole.USER
    status: UserStatus = UserStatus.ACTIVE
    created_date: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    organization: Optional[str] = None
    department: Optional[str] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    password: str
    role: UserRole = UserRole.USER
    organization: Optional[str] = None
    department: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    organization: Optional[str] = None
    department: Optional[str] = None

class UserPasswordReset(BaseModel):
    current_password: str
    new_password: str

# ===============================
# ANALYSIS MODELS
# ===============================

class AnalysisType(str, Enum):
    DESCRIPTIVE = "descriptive"
    CORRELATION = "correlation"
    FREQUENCY = "frequency"
    TTEST_ONE = "ttest_one"
    TTEST_TWO = "ttest_two"
    ANOVA = "anova"
    CHI_SQUARE = "chi_square"
    REGRESSION = "regression"
    VISUALIZATION = "visualization"

class DatasetInfo(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    filename: str
    upload_date: datetime = Field(default_factory=datetime.utcnow)
    file_size: int
    file_type: str
    rows: int
    columns: int
    column_info: Dict[str, Any]
    description: Optional[str] = None
    tags: List[str] = []
    user_id: str
    organization: Optional[str] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class AnalysisResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    dataset_id: str
    user_id: str
    analysis_type: AnalysisType
    parameters: Dict[str, Any]
    results: Dict[str, Any]
    apa_table: Optional[str] = None
    ai_recommendations: Optional[str] = None
    created_date: datetime = Field(default_factory=datetime.utcnow)
    execution_time: float
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class AnalysisRequest(BaseModel):
    dataset_id: str
    analysis_type: AnalysisType
    parameters: Dict[str, Any]

# ===============================
# ADMIN MODELS
# ===============================

class SystemStats(BaseModel):
    total_users: int
    active_users: int
    total_datasets: int
    total_analyses: int
    storage_used: int
    top_analysis_types: List[Dict[str, Any]]
    user_activity: List[Dict[str, Any]]

class AdminReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    data: Dict[str, Any]
    created_by: str
    created_date: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# ===============================
# CHAT MODELS
# ===============================

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    user_id: str
    message: str
    response: str
    created_date: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ChatRequest(BaseModel):
    session_id: str
    message: str
    context: Optional[Dict[str, Any]] = None

# ===============================
# NOTIFICATION MODELS
# ===============================

class NotificationType(str, Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    SUCCESS = "success"

class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    message: str
    type: NotificationType = NotificationType.INFO
    read: bool = False
    created_date: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }