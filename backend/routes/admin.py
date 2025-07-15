from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from typing import List
import os

from models.user import User, UserApproval, UserResponse
from routes.auth import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin"])

# Get database connection
from database import db


def admin_required(current_user: User = Depends(get_current_user)):
    """Ensure current user is an admin"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vetëm administratorët kanë akses në këtë funksion"
        )
    return current_user


@router.get("/pending-users", response_model=List[UserResponse])
async def get_pending_users(admin_user: User = Depends(admin_required)):
    """Get all users pending approval"""
    cursor = db.users.find({"is_approved": False})
    pending_users = []
    
    async for user_doc in cursor:
        user_doc['id'] = str(user_doc['_id'])
        if '_id' in user_doc:
            del user_doc['_id']
        user = User(**user_doc)
        pending_users.append(UserResponse(**user.dict()))
    
    return pending_users


@router.get("/all-users", response_model=List[UserResponse])
async def get_all_users(admin_user: User = Depends(admin_required)):
    """Get all users in the system"""
    cursor = db.users.find({})
    all_users = []
    
    async for user_doc in cursor:
        user_doc['id'] = str(user_doc['_id'])
        if '_id' in user_doc:
            del user_doc['_id']
        user = User(**user_doc)
        all_users.append(UserResponse(**user.dict()))
    
    return all_users


@router.post("/approve-user")
async def approve_user(
    approval: UserApproval,
    admin_user: User = Depends(admin_required)
):
    """Approve or reject a user"""
    user_doc = await db.users.find_one({"_id": approval.user_id})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Përdoruesi nuk u gjet"
        )
    
    update_data = {
        "is_approved": approval.approved,
        "approved_by": admin_user.id,
        "approved_at": datetime.utcnow()
    }
    
    # If rejecting, also deactivate the user
    if not approval.approved:
        update_data["is_active"] = False
    
    await db.users.update_one(
        {"_id": approval.user_id},
        {"$set": update_data}
    )
    
    action = "aprovuar" if approval.approved else "refuzuar"
    return {
        "message": f"Përdoruesi u {action} me sukses",
        "user_id": approval.user_id,
        "approved": approval.approved
    }


@router.post("/toggle-user-status/{user_id}")
async def toggle_user_status(
    user_id: str,
    admin_user: User = Depends(admin_required)
):
    """Toggle user active/inactive status"""
    user_doc = await db.users.find_one({"_id": user_id})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Përdoruesi nuk u gjet"
        )
    
    new_status = not user_doc.get("is_active", True)
    
    await db.users.update_one(
        {"_id": user_id},
        {"$set": {"is_active": new_status}}
    )
    
    status_text = "aktivizuar" if new_status else "çaktivizuar"
    return {
        "message": f"Përdoruesi u {status_text} me sukses",
        "user_id": user_id,
        "is_active": new_status
    }


@router.get("/dashboard-stats")
async def get_dashboard_stats(admin_user: User = Depends(admin_required)):
    """Get dashboard statistics for admin"""
    
    # Count total users
    total_users = await db.users.count_documents({})
    
    # Count pending users
    pending_users = await db.users.count_documents({"is_approved": False})
    
    # Count active users
    active_users = await db.users.count_documents({"is_active": True, "is_approved": True})
    
    # Count users by role
    clients = await db.users.count_documents({"role": "client"})
    consultants = await db.users.count_documents({"role": "consultant"})
    
    # Count total services
    total_services = await db.services.count_documents({})
    
    # Count total trainings
    total_trainings = await db.trainings.count_documents({})
    
    # Count total consultations
    total_consultations = await db.consultations.count_documents({})
    
    return {
        "total_users": total_users,
        "pending_users": pending_users,
        "active_users": active_users,
        "clients": clients,
        "consultants": consultants,
        "total_services": total_services,
        "total_trainings": total_trainings,
        "total_consultations": total_consultations
    }