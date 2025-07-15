from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from typing import List
import uuid

from models.user import User
from routes.auth import get_current_user

router = APIRouter(prefix="/chat", tags=["Chat"])

# Get database connection
from database import db


@router.get("/messages", response_model=List[dict])
async def get_chat_messages(current_user: User = Depends(get_current_user)):
    """Get all chat messages for the current user"""
    cursor = db.chat_messages.find({"user_id": current_user.id}).sort("timestamp", 1)
    messages = []
    
    async for msg in cursor:
        msg['id'] = str(msg['_id'])
        if '_id' in msg:
            del msg['_id']
        messages.append(msg)
    
    return messages


@router.post("/send", response_model=dict)
async def send_message(
    message_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Send a chat message"""
    
    # Create message record
    message = {
        "_id": str(uuid.uuid4()),
        "user_id": current_user.id,
        "sender": "user",
        "message": message_data.get("message", ""),
        "timestamp": datetime.utcnow().isoformat(),
        "created_at": datetime.utcnow()
    }
    
    # Insert into database
    await db.chat_messages.insert_one(message)
    
    # Auto-reply from system (simulate expert response)
    auto_reply = {
        "_id": str(uuid.uuid4()),
        "user_id": current_user.id,
        "sender": "expert",
        "message": "Faleminderit për mesazhin tuaj! Një nga ekspertët tanë do t'ju përgjigjet së shpejti.",
        "timestamp": datetime.utcnow().isoformat(),
        "created_at": datetime.utcnow()
    }
    
    await db.chat_messages.insert_one(auto_reply)
    
    # Return user message
    response = {k: v for k, v in message.items()}
    response['id'] = response.pop('_id')
    
    return response


@router.post("/mark-read")
async def mark_messages_read(current_user: User = Depends(get_current_user)):
    """Mark all messages as read"""
    
    await db.chat_messages.update_many(
        {"user_id": current_user.id},
        {"$set": {"read": True}}
    )
    
    return {"message": "Mesazhet u shënuan si të lexuara"}