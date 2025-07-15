from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any
from datetime import datetime
from enum import Enum
import uuid


class PaymentStatus(str, Enum):
    PENDING = "pending"
    INITIATED = "initiated"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    EXPIRED = "expired"


class PaymentMethod(str, Enum):
    STRIPE = "stripe"
    PAYPAL = "paypal"
    BANK_TRANSFER = "bank_transfer"
    CASH = "cash"


class PaymentType(str, Enum):
    COURSE = "course"
    CONSULTATION = "consultation"
    SERVICE = "service"
    SUBSCRIPTION = "subscription"


class PaymentPackage(BaseModel):
    id: str
    name: str
    description: str
    price: float
    currency: str = "EUR"
    duration_days: Optional[int] = None
    features: List[str] = []
    popular: bool = False
    category: PaymentType


class PaymentTransaction(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_email: str
    package_id: str
    package_name: str
    amount: float
    currency: str = "EUR"
    payment_method: PaymentMethod
    payment_status: PaymentStatus = PaymentStatus.PENDING
    stripe_session_id: Optional[str] = None
    stripe_payment_intent_id: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    metadata: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    paid_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    refunded_at: Optional[datetime] = None
    invoice_number: Optional[str] = None
    receipt_url: Optional[str] = None

    class Config:
        use_enum_values = True


class PaymentRequest(BaseModel):
    package_id: str
    origin_url: str
    metadata: Optional[Dict[str, Any]] = {}


class PaymentResponse(BaseModel):
    payment_id: str
    checkout_url: str
    session_id: str
    expires_at: datetime


class PaymentStatusResponse(BaseModel):
    payment_id: str
    status: PaymentStatus
    payment_status: str
    amount: float
    currency: str
    package_name: str
    paid_at: Optional[datetime] = None
    receipt_url: Optional[str] = None
    invoice_number: Optional[str] = None


class WebhookEvent(BaseModel):
    event_type: str
    event_id: str
    session_id: str
    payment_status: str
    metadata: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Invoice(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    payment_id: str
    user_id: str
    user_name: str
    user_email: str
    invoice_number: str
    amount: float
    currency: str = "EUR"
    tax_amount: float = 0.0
    total_amount: float
    items: List[Dict[str, Any]] = []
    issued_at: datetime = Field(default_factory=datetime.utcnow)
    due_at: Optional[datetime] = None
    paid_at: Optional[datetime] = None
    status: str = "draft"  # draft, sent, paid, overdue, cancelled
    notes: Optional[str] = None

    class Config:
        use_enum_values = True


class Subscription(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    package_id: str
    stripe_subscription_id: Optional[str] = None
    status: str = "active"  # active, cancelled, expired, paused
    current_period_start: datetime
    current_period_end: datetime
    cancel_at_period_end: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        use_enum_values = True


class PaymentReport(BaseModel):
    total_revenue: float
    total_transactions: int
    successful_payments: int
    failed_payments: int
    pending_payments: int
    refunded_amount: float
    currency: str = "EUR"
    period_start: datetime
    period_end: datetime
    top_packages: List[Dict[str, Any]] = []
    payment_methods: Dict[str, int] = {}
    daily_revenue: List[Dict[str, Any]] = []