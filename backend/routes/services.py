from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.service import Service, ServiceCreate, ServiceResponse, ServiceUpdate
from models.user import User
from routes.auth import get_current_user

router = APIRouter(prefix="/services", tags=["Services"])

# Get database connection
from ..server import db


@router.get("/", response_model=List[ServiceResponse])
async def get_services():
    services = await db.services.find().to_list(1000)
    return [ServiceResponse(id=str(service['_id']), **{k: v for k, v in service.items() if k != '_id'}) for service in services]


@router.get("/{service_id}", response_model=ServiceResponse)
async def get_service(service_id: str):
    service_doc = await db.services.find_one({"_id": service_id})
    if not service_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    return ServiceResponse(id=str(service_doc['_id']), **{k: v for k, v in service_doc.items() if k != '_id'})


@router.post("/", response_model=ServiceResponse)
async def create_service(
    service_data: ServiceCreate,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "consultant":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only consultants can create services"
        )
    
    service = Service(**service_data.dict())
    result = await db.services.insert_one(service.dict())
    service.id = str(result.inserted_id)
    
    return ServiceResponse(**service.dict())


@router.put("/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: str,
    service_update: ServiceUpdate,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "consultant":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only consultants can update services"
        )
    
    update_data = service_update.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data provided for update"
        )
    
    result = await db.services.update_one(
        {"_id": service_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    service_doc = await db.services.find_one({"_id": service_id})
    return ServiceResponse(id=str(service_doc['_id']), **{k: v for k, v in service_doc.items() if k != '_id'})


@router.delete("/{service_id}")
async def delete_service(
    service_id: str,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "consultant":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only consultants can delete services"
        )
    
    result = await db.services.delete_one({"_id": service_id})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    return {"message": "Service deleted successfully"}