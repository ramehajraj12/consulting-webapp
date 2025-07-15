from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timedelta

from models.user import User
from models.notification import Notification, NotificationResponse
from routes.auth import get_current_user
from utils.auth import get_time_ago

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

# Get database connection
from database import db


@router.get("/client", response_model=Dict[str, Any])
async def get_client_dashboard(current_user: User = Depends(get_current_user)):
    if current_user.role != "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients can access client dashboard"
        )
    
    # Get projects count
    projects_count = await db.projects.count_documents({"client_id": current_user.id})
    active_projects = await db.projects.count_documents({
        "client_id": current_user.id,
        "status": {"$in": ["pending", "in-progress"]}
    })
    completed_projects = await db.projects.count_documents({
        "client_id": current_user.id,
        "status": "completed"
    })
    
    # Get consultations count
    consultations_count = await db.consultations.count_documents({"client_id": current_user.id})
    
    # Get recent projects
    recent_projects = await db.projects.find(
        {"client_id": current_user.id}
    ).sort("created_at", -1).limit(5).to_list(5)
    
    # Enrich projects with consultant names
    for project in recent_projects:
        project['id'] = str(project['_id'])
        consultant = await db.users.find_one({"_id": project['consultant_id']})
        project['consultant_name'] = consultant['name'] if consultant else "Unknown"
    
    # Get upcoming consultations
    upcoming_consultations = await db.consultations.find({
        "client_id": current_user.id,
        "date": {"$gte": datetime.utcnow()},
        "status": "confirmed"
    }).sort("date", 1).limit(3).to_list(3)
    
    # Enrich consultations
    for consultation in upcoming_consultations:
        consultation['id'] = str(consultation['_id'])
        consultant = await db.users.find_one({"_id": consultation['consultant_id']})
        consultation['consultant_name'] = consultant['name'] if consultant else "Unknown"
        service = await db.services.find_one({"_id": consultation['service_id']})
        consultation['service_title'] = service['title'] if service else "Unknown"
    
    # Get notifications
    notifications = await db.notifications.find(
        {"user_id": current_user.id}
    ).sort("created_at", -1).limit(5).to_list(5)
    
    # Enrich notifications
    for notification in notifications:
        notification['id'] = str(notification['_id'])
        notification['time_ago'] = get_time_ago(notification['created_at'])
    
    return {
        "stats": {
            "total_projects": projects_count,
            "active_projects": active_projects,
            "completed_projects": completed_projects,
            "consultations": consultations_count
        },
        "recent_projects": recent_projects,
        "upcoming_consultations": upcoming_consultations,
        "notifications": notifications
    }


@router.get("/consultant", response_model=Dict[str, Any])
async def get_consultant_dashboard(current_user: User = Depends(get_current_user)):
    if current_user.role != "consultant":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only consultants can access consultant dashboard"
        )
    
    # Get projects count
    projects_count = await db.projects.count_documents({"consultant_id": current_user.id})
    active_projects = await db.projects.count_documents({
        "consultant_id": current_user.id,
        "status": {"$in": ["pending", "in-progress"]}
    })
    completed_projects = await db.projects.count_documents({
        "consultant_id": current_user.id,
        "status": "completed"
    })
    
    # Get consultations count
    consultations_count = await db.consultations.count_documents({"consultant_id": current_user.id})
    
    # Get earnings (mock calculation)
    # In a real app, you'd have a more sophisticated earnings calculation
    earnings = await db.projects.aggregate([
        {"$match": {"consultant_id": current_user.id, "status": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$price"}}}
    ]).to_list(1)
    total_earnings = earnings[0]['total'] if earnings else 0
    
    # Get recent projects
    recent_projects = await db.projects.find(
        {"consultant_id": current_user.id}
    ).sort("created_at", -1).limit(5).to_list(5)
    
    # Enrich projects with client names
    for project in recent_projects:
        project['id'] = str(project['_id'])
        client = await db.users.find_one({"_id": project['client_id']})
        project['client_name'] = client['name'] if client else "Unknown"
    
    # Get upcoming consultations
    upcoming_consultations = await db.consultations.find({
        "consultant_id": current_user.id,
        "date": {"$gte": datetime.utcnow()},
        "status": "confirmed"
    }).sort("date", 1).limit(3).to_list(3)
    
    # Enrich consultations
    for consultation in upcoming_consultations:
        consultation['id'] = str(consultation['_id'])
        client = await db.users.find_one({"_id": consultation['client_id']})
        consultation['client_name'] = client['name'] if client else "Unknown"
        service = await db.services.find_one({"_id": consultation['service_id']})
        consultation['service_title'] = service['title'] if service else "Unknown"
    
    # Get pending consultation requests
    pending_consultations = await db.consultations.find({
        "consultant_id": current_user.id,
        "status": "pending"
    }).sort("created_at", -1).limit(5).to_list(5)
    
    # Enrich pending consultations
    for consultation in pending_consultations:
        consultation['id'] = str(consultation['_id'])
        client = await db.users.find_one({"_id": consultation['client_id']})
        consultation['client_name'] = client['name'] if client else "Unknown"
        service = await db.services.find_one({"_id": consultation['service_id']})
        consultation['service_title'] = service['title'] if service else "Unknown"
    
    # Get notifications
    notifications = await db.notifications.find(
        {"user_id": current_user.id}
    ).sort("created_at", -1).limit(5).to_list(5)
    
    # Enrich notifications
    for notification in notifications:
        notification['id'] = str(notification['_id'])
        notification['time_ago'] = get_time_ago(notification['created_at'])
    
    return {
        "stats": {
            "total_projects": projects_count,
            "active_projects": active_projects,
            "completed_projects": completed_projects,
            "consultations": consultations_count,
            "earnings": total_earnings
        },
        "recent_projects": recent_projects,
        "upcoming_consultations": upcoming_consultations,
        "pending_consultations": pending_consultations,
        "notifications": notifications
    }