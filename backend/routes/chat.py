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


@router.get("/conversations", response_model=List[dict])
async def get_conversations(current_user: User = Depends(get_current_user)):
    """Get all conversations for admin/expert management"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vetëm administratorët mund të aksesojnë këtë funksion"
        )
    
    # Aggregate conversations by user
    pipeline = [
        {
            "$group": {
                "_id": "$user_id",
                "last_message": {"$last": "$message"},
                "last_timestamp": {"$last": "$timestamp"},
                "message_count": {"$sum": 1},
                "unread_count": {
                    "$sum": {
                        "$cond": [{"$eq": ["$read", False]}, 1, 0]
                    }
                }
            }
        }
    ]
    
    conversations = []
    async for conv in db.chat_messages.aggregate(pipeline):
        # Get user info
        user = await db.users.find_one({"_id": conv["_id"]})
        if user:
            conversations.append({
                "id": conv["_id"],
                "user_name": user.get("name", "Unknown"),
                "user_email": user.get("email", ""),
                "last_message": conv["last_message"],
                "last_message_time": conv["last_timestamp"],
                "status": "active",  # Default status
                "unread_count": conv["unread_count"],
                "priority": "medium"  # Default priority
            })
    
    return conversations


@router.get("/conversation/{conversation_id}/messages", response_model=List[dict])
async def get_conversation_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get messages for a specific conversation"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vetëm administratorët mund të aksesojnë këtë funksion"
        )
    
    cursor = db.chat_messages.find({"user_id": conversation_id}).sort("timestamp", 1)
    messages = []
    
    async for msg in cursor:
        msg['id'] = str(msg['_id'])
        if '_id' in msg:
            del msg['_id']
        messages.append(msg)
    
    return messages


@router.post("/send-reply", response_model=dict)
async def send_reply(
    reply_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Send a reply to a conversation"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vetëm administratorët mund të dërgojnë përgjigje"
        )
    
    # Create reply message
    reply = {
        "_id": str(uuid.uuid4()),
        "user_id": reply_data.get("conversation_id"),
        "sender": "expert",
        "message": reply_data.get("message", ""),
        "timestamp": datetime.utcnow().isoformat(),
        "expert_name": current_user.name,
        "expert_id": current_user.id,
        "created_at": datetime.utcnow()
    }
    
    # Insert into database
    await db.chat_messages.insert_one(reply)
    
    # Return response
    response = {k: v for k, v in reply.items()}
    response['id'] = response.pop('_id')
    
    return response


@router.put("/conversation/{conversation_id}/status")
async def update_conversation_status(
    conversation_id: str,
    status_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Update conversation status"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vetëm administratorët mund të përditësojnë statusin"
        )
    
    # For now, we'll store status in a separate collection
    # In a real app, you'd have a conversations table
    await db.conversation_status.update_one(
        {"conversation_id": conversation_id},
        {
            "$set": {
                "status": status_data.get("status", "active"),
                "updated_by": current_user.id,
                "updated_at": datetime.utcnow()
            }
        },
        upsert=True
    )
    
    return {"message": "Status u përditësua me sukses"}