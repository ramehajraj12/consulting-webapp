from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from typing import List
import os
import uuid
import base64

from models.user import User
from routes.auth import get_current_user

router = APIRouter(prefix="/documents", tags=["Documents"])

# Get database connection
from database import db


@router.get("/", response_model=List[dict])
async def get_documents(current_user: User = Depends(get_current_user)):
    """Get all documents for the current user"""
    cursor = db.documents.find({"user_id": current_user.id})
    documents = []
    
    async for doc in cursor:
        doc['id'] = str(doc['_id'])
        if '_id' in doc:
            del doc['_id']
        documents.append(doc)
    
    return documents


@router.post("/upload", response_model=dict)
async def upload_document(
    file: UploadFile = File(...),
    description: str = "",
    current_user: User = Depends(get_current_user)
):
    """Upload a document"""
    
    # Read file content
    file_content = await file.read()
    
    # Convert to base64 for storage
    file_base64 = base64.b64encode(file_content).decode('utf-8')
    
    # Create document record
    document = {
        "_id": str(uuid.uuid4()),
        "user_id": current_user.id,
        "name": file.filename,
        "description": description,
        "content": file_base64,
        "content_type": file.content_type,
        "size": len(file_content),
        "type": file.content_type.split('/')[-1] if file.content_type else "unknown",
        "upload_date": datetime.utcnow().isoformat(),
        "created_at": datetime.utcnow()
    }
    
    # Insert into database
    await db.documents.insert_one(document)
    
    # Return response without content
    response = {k: v for k, v in document.items() if k != 'content'}
    response['id'] = response.pop('_id')
    response['size'] = f"{document['size'] / 1024:.1f} KB"
    
    return response


@router.get("/{document_id}/download")
async def download_document(
    document_id: str,
    current_user: User = Depends(get_current_user)
):
    """Download a document"""
    
    # Find document
    document = await db.documents.find_one({
        "_id": document_id,
        "user_id": current_user.id
    })
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dokumenti nuk u gjet"
        )
    
    # Decode base64 content
    file_content = base64.b64decode(document['content'])
    
    return {
        "filename": document['name'],
        "content": document['content'],
        "content_type": document['content_type']
    }


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a document"""
    
    result = await db.documents.delete_one({
        "_id": document_id,
        "user_id": current_user.id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dokumenti nuk u gjet"
        )
    
    return {"message": "Dokumenti u fshi me sukses"}