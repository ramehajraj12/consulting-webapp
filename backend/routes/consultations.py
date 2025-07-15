from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.consultation import Consultation, ConsultationCreate, ConsultationResponse, ConsultationUpdate
from models.user import User
from routes.auth import get_current_user

router = APIRouter(prefix="/consultations", tags=["Consultations"])

# Get database connection
from ..server import db


@router.get("/", response_model=List[ConsultationResponse])
async def get_consultations(current_user: User = Depends(get_current_user)):
    if current_user.role == "client":
        consultations = await db.consultations.find({"client_id": current_user.id}).to_list(1000)
    else:
        consultations = await db.consultations.find({"consultant_id": current_user.id}).to_list(1000)
    
    # Enrich with user and service names
    enriched_consultations = []
    for consultation in consultations:
        consultation['id'] = str(consultation['_id'])
        
        # Get client name
        client = await db.users.find_one({"_id": consultation['client_id']})
        consultation['client_name'] = client['name'] if client else "Unknown"
        
        # Get consultant name
        consultant = await db.users.find_one({"_id": consultation['consultant_id']})
        consultation['consultant_name'] = consultant['name'] if consultant else "Unknown"
        
        # Get service title
        service = await db.services.find_one({"_id": consultation['service_id']})
        consultation['service_title'] = service['title'] if service else "Unknown"
        
        enriched_consultations.append(ConsultationResponse(**{k: v for k, v in consultation.items() if k != '_id'}))
    
    return enriched_consultations


@router.get("/{consultation_id}", response_model=ConsultationResponse)
async def get_consultation(consultation_id: str, current_user: User = Depends(get_current_user)):
    consultation_doc = await db.consultations.find_one({"_id": consultation_id})
    if not consultation_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation not found"
        )
    
    # Check if user has access to this consultation
    if (current_user.role == "client" and consultation_doc['client_id'] != current_user.id) or \
       (current_user.role == "consultant" and consultation_doc['consultant_id'] != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this consultation"
        )
    
    consultation_doc['id'] = str(consultation_doc['_id'])
    
    # Get client name
    client = await db.users.find_one({"_id": consultation_doc['client_id']})
    consultation_doc['client_name'] = client['name'] if client else "Unknown"
    
    # Get consultant name
    consultant = await db.users.find_one({"_id": consultation_doc['consultant_id']})
    consultation_doc['consultant_name'] = consultant['name'] if consultant else "Unknown"
    
    # Get service title
    service = await db.services.find_one({"_id": consultation_doc['service_id']})
    consultation_doc['service_title'] = service['title'] if service else "Unknown"
    
    return ConsultationResponse(**{k: v for k, v in consultation_doc.items() if k != '_id'})


@router.post("/", response_model=ConsultationResponse)
async def create_consultation(
    consultation_data: ConsultationCreate,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients can create consultations"
        )
    
    consultation = Consultation(
        client_id=current_user.id,
        **consultation_data.dict()
    )
    
    result = await db.consultations.insert_one(consultation.dict())
    consultation.id = str(result.inserted_id)
    
    # Get enriched data
    client = await db.users.find_one({"_id": consultation.client_id})
    consultant = await db.users.find_one({"_id": consultation.consultant_id})
    service = await db.services.find_one({"_id": consultation.service_id})
    
    return ConsultationResponse(
        **consultation.dict(),
        client_name=client['name'] if client else "Unknown",
        consultant_name=consultant['name'] if consultant else "Unknown",
        service_title=service['title'] if service else "Unknown"
    )


@router.put("/{consultation_id}", response_model=ConsultationResponse)
async def update_consultation(
    consultation_id: str,
    consultation_update: ConsultationUpdate,
    current_user: User = Depends(get_current_user)
):
    consultation_doc = await db.consultations.find_one({"_id": consultation_id})
    if not consultation_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation not found"
        )
    
    # Check if user has access to this consultation
    if (current_user.role == "client" and consultation_doc['client_id'] != current_user.id) or \
       (current_user.role == "consultant" and consultation_doc['consultant_id'] != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this consultation"
        )
    
    update_data = consultation_update.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data provided for update"
        )
    
    result = await db.consultations.update_one(
        {"_id": consultation_id},
        {"$set": update_data}
    )
    
    # Get updated consultation with enriched data
    updated_consultation = await db.consultations.find_one({"_id": consultation_id})
    updated_consultation['id'] = str(updated_consultation['_id'])
    
    # Get enriched data
    client = await db.users.find_one({"_id": updated_consultation['client_id']})
    consultant = await db.users.find_one({"_id": updated_consultation['consultant_id']})
    service = await db.services.find_one({"_id": updated_consultation['service_id']})
    
    return ConsultationResponse(
        **{k: v for k, v in updated_consultation.items() if k != '_id'},
        client_name=client['name'] if client else "Unknown",
        consultant_name=consultant['name'] if consultant else "Unknown",
        service_title=service['title'] if service else "Unknown"
    )


@router.delete("/{consultation_id}")
async def delete_consultation(
    consultation_id: str,
    current_user: User = Depends(get_current_user)
):
    consultation_doc = await db.consultations.find_one({"_id": consultation_id})
    if not consultation_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation not found"
        )
    
    # Check if user has access to this consultation
    if (current_user.role == "client" and consultation_doc['client_id'] != current_user.id) or \
       (current_user.role == "consultant" and consultation_doc['consultant_id'] != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this consultation"
        )
    
    result = await db.consultations.delete_one({"_id": consultation_id})
    return {"message": "Consultation deleted successfully"}