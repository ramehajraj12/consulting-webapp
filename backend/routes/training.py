from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.training import TrainingProgram, TrainingProgramCreate, TrainingProgramResponse, TrainingProgramUpdate
from models.training import TrainingEnrollment, TrainingEnrollmentCreate, TrainingEnrollmentResponse
from models.user import User
from routes.auth import get_current_user
from database import db

router = APIRouter(prefix="/training", tags=["Training"])


@router.get("/", response_model=List[TrainingProgramResponse])
async def get_training_programs():
    """Get all active training programs"""
    programs = await db.training_programs.find({"is_active": True}).to_list(1000)
    
    # Enrich with instructor names
    enriched_programs = []
    for program in programs:
        program['id'] = str(program['_id'])
        
        # Get instructor name
        instructor = await db.users.find_one({"_id": program['instructor_id']})
        program['instructor_name'] = instructor['name'] if instructor else "Unknown"
        
        enriched_programs.append(TrainingProgramResponse(**{k: v for k, v in program.items() if k != '_id'}))
    
    return enriched_programs


@router.get("/{training_id}", response_model=TrainingProgramResponse)
async def get_training_program(training_id: str):
    """Get specific training program"""
    program_doc = await db.training_programs.find_one({"_id": training_id})
    if not program_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training program not found"
        )
    
    program_doc['id'] = str(program_doc['_id'])
    
    # Get instructor name
    instructor = await db.users.find_one({"_id": program_doc['instructor_id']})
    program_doc['instructor_name'] = instructor['name'] if instructor else "Unknown"
    
    return TrainingProgramResponse(**{k: v for k, v in program_doc.items() if k != '_id'})


@router.post("/", response_model=TrainingProgramResponse)
async def create_training_program(
    program_data: TrainingProgramCreate,
    current_user: User = Depends(get_current_user)
):
    """Create new training program (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vetëm administratorët mund të krijojnë trajnime të reja"
        )
    
    program = TrainingProgram(
        instructor_id=current_user.id,
        **program_data.dict()
    )
    
    # Insert into database
    program_dict = program.dict()
    program_dict['_id'] = program_dict.pop('id')
    result = await db.training_programs.insert_one(program_dict)
    program.id = str(result.inserted_id)
    
    return TrainingProgramResponse(
        **program.dict(),
        instructor_name=current_user.name
    )


@router.put("/{training_id}", response_model=TrainingProgramResponse)
async def update_training_program(
    training_id: str,
    program_update: TrainingProgramUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update training program (instructor only)"""
    if current_user.role != "consultant":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only consultants can update training programs"
        )
    
    # Check if program exists and user is the instructor
    program_doc = await db.training_programs.find_one({"_id": training_id})
    if not program_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training program not found"
        )
    
    if program_doc['instructor_id'] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own training programs"
        )
    
    update_data = program_update.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data provided for update"
        )
    
    # Add updated timestamp
    update_data['updated_at'] = datetime.utcnow()
    
    result = await db.training_programs.update_one(
        {"_id": training_id},
        {"$set": update_data}
    )
    
    # Get updated program
    updated_program = await db.training_programs.find_one({"_id": training_id})
    updated_program['id'] = str(updated_program['_id'])
    
    return TrainingProgramResponse(
        **{k: v for k, v in updated_program.items() if k != '_id'},
        instructor_name=current_user.name
    )


@router.get("/my/programs", response_model=List[TrainingProgramResponse])
async def get_my_training_programs(current_user: User = Depends(get_current_user)):
    """Get consultant's training programs"""
    if current_user.role != "consultant":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only consultants can view their training programs"
        )
    
    programs = await db.training_programs.find({"instructor_id": current_user.id}).to_list(1000)
    
    # Convert to response format
    program_responses = []
    for program in programs:
        program['id'] = str(program['_id'])
        program['instructor_name'] = current_user.name
        program_responses.append(TrainingProgramResponse(**{k: v for k, v in program.items() if k != '_id'}))
    
    return program_responses


@router.delete("/{training_id}")
async def delete_training_program(
    training_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete training program (instructor only)"""
    if current_user.role != "consultant":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only consultants can delete training programs"
        )
    
    # Check if program exists and user is the instructor
    program_doc = await db.training_programs.find_one({"_id": training_id})
    if not program_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training program not found"
        )
    
    if program_doc['instructor_id'] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own training programs"
        )
    
    # Soft delete - set as inactive
    await db.training_programs.update_one(
        {"_id": training_id},
        {"$set": {"is_active": False}}
    )
    
    return {"message": "Training program deleted successfully"}