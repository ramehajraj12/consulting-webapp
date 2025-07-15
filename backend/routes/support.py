from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from typing import List
import uuid

from models.user import User
from routes.auth import get_current_user

router = APIRouter(prefix="/support", tags=["Support"])

# Get database connection
from database import db


@router.get("/tickets", response_model=List[dict])
async def get_support_tickets(current_user: User = Depends(get_current_user)):
    """Get all support tickets for the current user"""
    cursor = db.support_tickets.find({"user_id": current_user.id}).sort("created_at", -1)
    tickets = []
    
    async for ticket in cursor:
        ticket['id'] = str(ticket['_id'])
        if '_id' in ticket:
            del ticket['_id']
        # Format created_at for display
        if isinstance(ticket['created_at'], datetime):
            ticket['created_at'] = ticket['created_at'].strftime('%d/%m/%Y %H:%M')
        tickets.append(ticket)
    
    return tickets


@router.post("/tickets", response_model=dict)
async def create_support_ticket(
    ticket_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Create a new support ticket"""
    
    # Create ticket record
    ticket = {
        "_id": str(uuid.uuid4()),
        "user_id": current_user.id,
        "subject": ticket_data.get("subject", ""),
        "description": ticket_data.get("description", ""),
        "priority": ticket_data.get("priority", "medium"),
        "status": "open",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Insert into database
    await db.support_tickets.insert_one(ticket)
    
    # Return response
    response = {k: v for k, v in ticket.items()}
    response['id'] = response.pop('_id')
    response['created_at'] = response['created_at'].strftime('%d/%m/%Y %H:%M')
    
    return response


@router.put("/tickets/{ticket_id}")
async def update_ticket_status(
    ticket_id: str,
    update_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Update a support ticket"""
    
    # Find ticket
    ticket = await db.support_tickets.find_one({
        "_id": ticket_id,
        "user_id": current_user.id
    })
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket nuk u gjet"
        )
    
    # Update ticket
    update_fields = {
        "updated_at": datetime.utcnow()
    }
    
    if "status" in update_data:
        update_fields["status"] = update_data["status"]
    
    await db.support_tickets.update_one(
        {"_id": ticket_id},
        {"$set": update_fields}
    )
    
    return {"message": "Ticket u përditësua me sukses"}


@router.get("/tickets/{ticket_id}")
async def get_ticket_details(
    ticket_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get detailed information about a specific ticket"""
    
    ticket = await db.support_tickets.find_one({
        "_id": ticket_id,
        "user_id": current_user.id
    })
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket nuk u gjet"
        )
    
    ticket['id'] = str(ticket['_id'])
    if '_id' in ticket:
        del ticket['_id']
    
    return ticket