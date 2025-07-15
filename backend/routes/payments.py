from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from datetime import datetime, timedelta
from typing import List, Dict, Any
import os
import json
import uuid
from decimal import Decimal

from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
from models.payment import (
    PaymentTransaction, PaymentRequest, PaymentResponse, PaymentStatusResponse,
    PaymentStatus, PaymentMethod, PaymentType, PaymentPackage, WebhookEvent,
    Invoice, Subscription, PaymentReport
)
from models.user import User
from routes.auth import get_current_user
from database import db

router = APIRouter(prefix="/payments", tags=["Payments"])

# Professional Payment Packages - Server-side definitions only
PAYMENT_PACKAGES = {
    # Training Courses
    "spss_basic": PaymentPackage(
        id="spss_basic",
        name="SPSS për Fillestarë",
        description="Kurs bazë i SPSS për fillestarë me certifikim",
        price=99.0,
        currency="EUR",
        duration_days=60,
        features=[
            "20 orë video tutorial",
            "Materialet e kursit",
            "Certifikim profesional",
            "Suport 24/7",
            "Akses i përhershëm"
        ],
        popular=False,
        category=PaymentType.COURSE
    ),
    "spss_advanced": PaymentPackage(
        id="spss_advanced",
        name="SPSS i Avancuar",
        description="Kurs i avancuar me analiza komplekse dhe regressions",
        price=199.0,
        currency="EUR",
        duration_days=90,
        features=[
            "40 orë video tutorial",
            "Analiza të avancuara",
            "Regressions dhe modeling",
            "Certifikim profesional",
            "Konsultim personal",
            "Akses i përhershëm"
        ],
        popular=True,
        category=PaymentType.COURSE
    ),
    "spss_professional": PaymentPackage(
        id="spss_professional",
        name="SPSS Profesional",
        description="Program i plotë profesional me mentorim personal",
        price=399.0,
        currency="EUR",
        duration_days=120,
        features=[
            "80 orë video tutorial",
            "Mentorim personal",
            "Projekte praktike",
            "Certifikim profesional",
            "Job placement support",
            "Akses i përhershëm"
        ],
        popular=False,
        category=PaymentType.COURSE
    ),
    
    # Consultations
    "consultation_1hour": PaymentPackage(
        id="consultation_1hour",
        name="Konsultim 1 Orë",
        description="Konsultim personal 1 orë me ekspert",
        price=49.0,
        currency="EUR",
        duration_days=30,
        features=[
            "1 orë konsultim live",
            "Analizë personale",
            "Rekomandime specifike",
            "Raport i detajuar",
            "Follow-up email"
        ],
        popular=False,
        category=PaymentType.CONSULTATION
    ),
    "consultation_package": PaymentPackage(
        id="consultation_package",
        name="Paketa 5 Konsultime",
        description="Paketa 5 konsultimesh me discount",
        price=199.0,
        currency="EUR",
        duration_days=90,
        features=[
            "5 orë konsultim live",
            "Analizë e plotë e projektit",
            "Interpretim rezultatesh",
            "Raporte të detajuara",
            "Priority support"
        ],
        popular=True,
        category=PaymentType.CONSULTATION
    ),
    
    # Services
    "data_analysis": PaymentPackage(
        id="data_analysis",
        name="Analizë të Dhënash",
        description="Shërbim i plotë i analizës së të dhënave",
        price=299.0,
        currency="EUR",
        duration_days=14,
        features=[
            "Analizë e plotë statistikore",
            "Raport profesional",
            "Interpretim rezultatesh",
            "Grafikë dhe tabela",
            "Prezantim final"
        ],
        popular=False,
        category=PaymentType.SERVICE
    ),
    
    # Subscriptions
    "monthly_support": PaymentPackage(
        id="monthly_support",
        name="Suport Mujor",
        description="Suport dhe mentoring mujor",
        price=49.0,
        currency="EUR",
        duration_days=30,
        features=[
            "Suport i pakufizuar",
            "Konsultime prioritare",
            "Materialet e reja",
            "Webinars ekskluziv",
            "Community access"
        ],
        popular=False,
        category=PaymentType.SUBSCRIPTION
    )
}


def get_stripe_checkout():
    """Initialize Stripe checkout with proper configuration"""
    api_key = os.getenv("STRIPE_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stripe API key not configured"
        )
    
    return StripeCheckout(
        api_key=api_key,
        webhook_url=f"{os.getenv('BACKEND_URL', 'http://localhost:8001')}/api/webhook/stripe"
    )


def generate_invoice_number() -> str:
    """Generate unique invoice number"""
    return f"INV-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"


@router.get("/packages", response_model=List[PaymentPackage])
async def get_payment_packages(category: str = None):
    """Get all available payment packages"""
    packages = list(PAYMENT_PACKAGES.values())
    
    if category:
        packages = [p for p in packages if p.category == category]
    
    return packages


@router.get("/packages/{package_id}", response_model=PaymentPackage)
async def get_payment_package(package_id: str):
    """Get specific payment package"""
    if package_id not in PAYMENT_PACKAGES:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package nuk u gjet"
        )
    
    return PAYMENT_PACKAGES[package_id]


@router.post("/checkout", response_model=PaymentResponse)
async def create_checkout_session(
    payment_request: PaymentRequest,
    current_user: User = Depends(get_current_user)
):
    """Create Stripe checkout session"""
    
    # Validate package
    if payment_request.package_id not in PAYMENT_PACKAGES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Package i pavlefshëm"
        )
    
    package = PAYMENT_PACKAGES[payment_request.package_id]
    
    # Create payment transaction record
    payment_transaction = PaymentTransaction(
        user_id=current_user.id,
        user_email=current_user.email,
        package_id=package.id,
        package_name=package.name,
        amount=package.price,
        currency=package.currency,
        payment_method=PaymentMethod.STRIPE,
        payment_status=PaymentStatus.INITIATED,
        metadata={
            "package_category": package.category,
            "user_name": current_user.name,
            "origin_url": payment_request.origin_url,
            **payment_request.metadata
        },
        expires_at=datetime.utcnow() + timedelta(minutes=30)
    )
    
    # Insert transaction into database
    transaction_dict = payment_transaction.dict()
    transaction_dict['_id'] = transaction_dict.pop('id')
    await db.payment_transactions.insert_one(transaction_dict)
    
    # Create Stripe checkout session
    stripe_checkout = get_stripe_checkout()
    
    success_url = f"{payment_request.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{payment_request.origin_url}/payment/cancel"
    
    checkout_request = CheckoutSessionRequest(
        amount=package.price,
        currency=package.currency.lower(),
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "payment_id": payment_transaction.id,
            "user_id": current_user.id,
            "package_id": package.id,
            "user_email": current_user.email
        }
    )
    
    try:
        session = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Update transaction with session ID
        await db.payment_transactions.update_one(
            {"_id": payment_transaction.id},
            {
                "$set": {
                    "stripe_session_id": session.session_id,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return PaymentResponse(
            payment_id=payment_transaction.id,
            checkout_url=session.url,
            session_id=session.session_id,
            expires_at=payment_transaction.expires_at
        )
        
    except Exception as e:
        # Update transaction status to failed
        await db.payment_transactions.update_one(
            {"_id": payment_transaction.id},
            {
                "$set": {
                    "payment_status": PaymentStatus.FAILED,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gabim në krijimin e sesionit të pagesës: {str(e)}"
        )


@router.get("/status/{session_id}", response_model=PaymentStatusResponse)
async def get_payment_status(
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get payment status for a session"""
    
    # Find payment transaction
    transaction = await db.payment_transactions.find_one({
        "stripe_session_id": session_id,
        "user_id": current_user.id
    })
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment session nuk u gjet"
        )
    
    # Get status from Stripe
    stripe_checkout = get_stripe_checkout()
    
    try:
        checkout_status = await stripe_checkout.get_checkout_status(session_id)
        
        # Update transaction status if changed
        new_status = PaymentStatus.COMPLETED if checkout_status.payment_status == "paid" else PaymentStatus.PENDING
        
        if transaction["payment_status"] != new_status:
            update_data = {
                "payment_status": new_status,
                "updated_at": datetime.utcnow()
            }
            
            if new_status == PaymentStatus.COMPLETED:
                update_data["paid_at"] = datetime.utcnow()
                update_data["invoice_number"] = generate_invoice_number()
                
                # Process successful payment
                await process_successful_payment(transaction, checkout_status)
            
            await db.payment_transactions.update_one(
                {"_id": transaction["_id"]},
                {"$set": update_data}
            )
            
            transaction.update(update_data)
        
        return PaymentStatusResponse(
            payment_id=transaction["_id"],
            status=new_status,
            payment_status=checkout_status.payment_status,
            amount=transaction["amount"],
            currency=transaction["currency"],
            package_name=transaction["package_name"],
            paid_at=transaction.get("paid_at"),
            receipt_url=transaction.get("receipt_url"),
            invoice_number=transaction.get("invoice_number")
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gabim në kontrollimin e statusit: {str(e)}"
        )


@router.get("/history", response_model=List[PaymentTransaction])
async def get_payment_history(
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 50
):
    """Get user's payment history"""
    
    cursor = db.payment_transactions.find({
        "user_id": current_user.id
    }).sort("created_at", -1).skip(skip).limit(limit)
    
    transactions = []
    async for transaction in cursor:
        transaction['id'] = str(transaction['_id'])
        if '_id' in transaction:
            del transaction['_id']
        transactions.append(PaymentTransaction(**transaction))
    
    return transactions


@router.post("/refund/{payment_id}")
async def request_refund(
    payment_id: str,
    current_user: User = Depends(get_current_user)
):
    """Request refund for a payment"""
    
    # Find payment transaction
    transaction = await db.payment_transactions.find_one({
        "_id": payment_id,
        "user_id": current_user.id,
        "payment_status": PaymentStatus.COMPLETED
    })
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment i vlefshëm për refund nuk u gjet"
        )
    
    # Update status to refund requested
    await db.payment_transactions.update_one(
        {"_id": payment_id},
        {
            "$set": {
                "payment_status": PaymentStatus.REFUNDED,
                "refunded_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Kërkesa për refund u dërgua me sukses"}


async def process_successful_payment(transaction: dict, checkout_status: CheckoutStatusResponse):
    """Process successful payment - grant access, send emails, etc."""
    
    # Grant access to course/service
    package_id = transaction["package_id"]
    user_id = transaction["user_id"]
    
    # Add user to course/service
    await grant_access_to_package(user_id, package_id)
    
    # Send confirmation email (would be implemented with email service)
    # await send_payment_confirmation_email(transaction)
    
    # Generate invoice
    await generate_invoice(transaction)
    
    # Update user's subscription if applicable
    if package_id in ["monthly_support"]:
        await create_or_update_subscription(user_id, package_id)


async def grant_access_to_package(user_id: str, package_id: str):
    """Grant user access to purchased package"""
    
    access_record = {
        "_id": str(uuid.uuid4()),
        "user_id": user_id,
        "package_id": package_id,
        "granted_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(days=PAYMENT_PACKAGES[package_id].duration_days or 365),
        "status": "active"
    }
    
    await db.user_access.insert_one(access_record)


async def generate_invoice(transaction: dict):
    """Generate invoice for completed payment"""
    
    invoice = Invoice(
        payment_id=transaction["_id"],
        user_id=transaction["user_id"],
        user_name=transaction["metadata"].get("user_name", ""),
        user_email=transaction["user_email"],
        invoice_number=transaction.get("invoice_number", generate_invoice_number()),
        amount=transaction["amount"],
        currency=transaction["currency"],
        total_amount=transaction["amount"],
        items=[{
            "name": transaction["package_name"],
            "quantity": 1,
            "price": transaction["amount"]
        }],
        status="paid",
        paid_at=transaction.get("paid_at", datetime.utcnow())
    )
    
    invoice_dict = invoice.dict()
    invoice_dict['_id'] = invoice_dict.pop('id')
    await db.invoices.insert_one(invoice_dict)


async def create_or_update_subscription(user_id: str, package_id: str):
    """Create or update user subscription"""
    
    # Check if subscription exists
    existing_subscription = await db.subscriptions.find_one({
        "user_id": user_id,
        "package_id": package_id,
        "status": "active"
    })
    
    if existing_subscription:
        # Extend subscription
        await db.subscriptions.update_one(
            {"_id": existing_subscription["_id"]},
            {
                "$set": {
                    "current_period_end": existing_subscription["current_period_end"] + timedelta(days=30),
                    "updated_at": datetime.utcnow()
                }
            }
        )
    else:
        # Create new subscription
        subscription = Subscription(
            user_id=user_id,
            package_id=package_id,
            current_period_start=datetime.utcnow(),
            current_period_end=datetime.utcnow() + timedelta(days=30)
        )
        
        subscription_dict = subscription.dict()
        subscription_dict['_id'] = subscription_dict.pop('id')
        await db.subscriptions.insert_one(subscription_dict)


# Admin endpoints
@router.get("/admin/transactions", response_model=List[PaymentTransaction])
async def get_all_transactions(
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
):
    """Get all payment transactions (admin only)"""
    
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vetëm administratorët mund të aksesojnë këtë funksion"
        )
    
    cursor = db.payment_transactions.find({}).sort("created_at", -1).skip(skip).limit(limit)
    transactions = []
    
    async for transaction in cursor:
        transaction['id'] = str(transaction['_id'])
        if '_id' in transaction:
            del transaction['_id']
        transactions.append(PaymentTransaction(**transaction))
    
    return transactions


@router.get("/admin/report", response_model=PaymentReport)
async def get_payment_report(
    current_user: User = Depends(get_current_user),
    days: int = 30
):
    """Generate payment report (admin only)"""
    
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vetëm administratorët mund të aksesojnë këtë funksion"
        )
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Aggregate payment data
    pipeline = [
        {
            "$match": {
                "created_at": {"$gte": start_date, "$lte": end_date}
            }
        },
        {
            "$group": {
                "_id": None,
                "total_revenue": {
                    "$sum": {
                        "$cond": [
                            {"$eq": ["$payment_status", "completed"]},
                            "$amount",
                            0
                        ]
                    }
                },
                "total_transactions": {"$sum": 1},
                "successful_payments": {
                    "$sum": {
                        "$cond": [{"$eq": ["$payment_status", "completed"]}, 1, 0]
                    }
                },
                "failed_payments": {
                    "$sum": {
                        "$cond": [{"$eq": ["$payment_status", "failed"]}, 1, 0]
                    }
                },
                "pending_payments": {
                    "$sum": {
                        "$cond": [{"$eq": ["$payment_status", "pending"]}, 1, 0]
                    }
                }
            }
        }
    ]
    
    result = await db.payment_transactions.aggregate(pipeline).to_list(1)
    
    if not result:
        return PaymentReport(
            total_revenue=0.0,
            total_transactions=0,
            successful_payments=0,
            failed_payments=0,
            pending_payments=0,
            refunded_amount=0.0,
            period_start=start_date,
            period_end=end_date
        )
    
    data = result[0]
    
    return PaymentReport(
        total_revenue=data.get("total_revenue", 0.0),
        total_transactions=data.get("total_transactions", 0),
        successful_payments=data.get("successful_payments", 0),
        failed_payments=data.get("failed_payments", 0),
        pending_payments=data.get("pending_payments", 0),
        refunded_amount=0.0,  # Would calculate from refunded transactions
        period_start=start_date,
        period_end=end_date
    )


@router.post("/webhook/stripe")
async def handle_stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    
    body = await request.body()
    signature = request.headers.get("stripe-signature")
    
    stripe_checkout = get_stripe_checkout()
    
    try:
        webhook_event = await stripe_checkout.handle_webhook(body, signature)
        
        # Process webhook event
        await process_webhook_event(webhook_event)
        
        return {"status": "success"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Webhook error: {str(e)}"
        )


async def process_webhook_event(webhook_event):
    """Process webhook event"""
    
    if webhook_event.event_type == "checkout.session.completed":
        session_id = webhook_event.session_id
        
        # Update payment transaction
        await db.payment_transactions.update_one(
            {"stripe_session_id": session_id},
            {
                "$set": {
                    "payment_status": PaymentStatus.COMPLETED,
                    "paid_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Get transaction details for processing
        transaction = await db.payment_transactions.find_one({
            "stripe_session_id": session_id
        })
        
        if transaction:
            # Process successful payment
            await process_successful_payment(transaction, webhook_event)
    
    # Store webhook event
    webhook_record = WebhookEvent(
        event_type=webhook_event.event_type,
        event_id=webhook_event.event_id,
        session_id=webhook_event.session_id,
        payment_status=webhook_event.payment_status,
        metadata=webhook_event.metadata
    )
    
    webhook_dict = webhook_record.dict()
    webhook_dict['_id'] = str(uuid.uuid4())
    await db.webhook_events.insert_one(webhook_dict)