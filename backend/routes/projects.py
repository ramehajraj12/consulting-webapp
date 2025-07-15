from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.project import Project, ProjectCreate, ProjectResponse, ProjectUpdate
from models.user import User
from routes.auth import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])

# Get database connection
from ..server import db


@router.get("/", response_model=List[ProjectResponse])
async def get_projects(current_user: User = Depends(get_current_user)):
    if current_user.role == "client":
        projects = await db.projects.find({"client_id": current_user.id}).to_list(1000)
    else:
        projects = await db.projects.find({"consultant_id": current_user.id}).to_list(1000)
    
    # Enrich with user names
    enriched_projects = []
    for project in projects:
        project['id'] = str(project['_id'])
        
        # Get client name
        client = await db.users.find_one({"_id": project['client_id']})
        project['client_name'] = client['name'] if client else "Unknown"
        
        # Get consultant name
        consultant = await db.users.find_one({"_id": project['consultant_id']})
        project['consultant_name'] = consultant['name'] if consultant else "Unknown"
        
        enriched_projects.append(ProjectResponse(**{k: v for k, v in project.items() if k != '_id'}))
    
    return enriched_projects


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, current_user: User = Depends(get_current_user)):
    project_doc = await db.projects.find_one({"_id": project_id})
    if not project_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if user has access to this project
    if (current_user.role == "client" and project_doc['client_id'] != current_user.id) or \
       (current_user.role == "consultant" and project_doc['consultant_id'] != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this project"
        )
    
    project_doc['id'] = str(project_doc['_id'])
    
    # Get client name
    client = await db.users.find_one({"_id": project_doc['client_id']})
    project_doc['client_name'] = client['name'] if client else "Unknown"
    
    # Get consultant name
    consultant = await db.users.find_one({"_id": project_doc['consultant_id']})
    project_doc['consultant_name'] = consultant['name'] if consultant else "Unknown"
    
    return ProjectResponse(**{k: v for k, v in project_doc.items() if k != '_id'})


@router.post("/", response_model=ProjectResponse)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients can create projects"
        )
    
    project = Project(
        client_id=current_user.id,
        **project_data.dict()
    )
    
    result = await db.projects.insert_one(project.dict())
    project.id = str(result.inserted_id)
    
    # Get enriched data
    client = await db.users.find_one({"_id": project.client_id})
    consultant = await db.users.find_one({"_id": project.consultant_id})
    
    return ProjectResponse(
        **project.dict(),
        client_name=client['name'] if client else "Unknown",
        consultant_name=consultant['name'] if consultant else "Unknown"
    )


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_update: ProjectUpdate,
    current_user: User = Depends(get_current_user)
):
    project_doc = await db.projects.find_one({"_id": project_id})
    if not project_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if user has access to this project
    if (current_user.role == "client" and project_doc['client_id'] != current_user.id) or \
       (current_user.role == "consultant" and project_doc['consultant_id'] != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this project"
        )
    
    update_data = project_update.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data provided for update"
        )
    
    result = await db.projects.update_one(
        {"_id": project_id},
        {"$set": update_data}
    )
    
    # Get updated project with enriched data
    updated_project = await db.projects.find_one({"_id": project_id})
    updated_project['id'] = str(updated_project['_id'])
    
    # Get enriched data
    client = await db.users.find_one({"_id": updated_project['client_id']})
    consultant = await db.users.find_one({"_id": updated_project['consultant_id']})
    
    return ProjectResponse(
        **{k: v for k, v in updated_project.items() if k != '_id'},
        client_name=client['name'] if client else "Unknown",
        consultant_name=consultant['name'] if consultant else "Unknown"
    )


@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    project_doc = await db.projects.find_one({"_id": project_id})
    if not project_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if user has access to this project
    if (current_user.role == "client" and project_doc['client_id'] != current_user.id) or \
       (current_user.role == "consultant" and project_doc['consultant_id'] != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this project"
        )
    
    result = await db.projects.delete_one({"_id": project_id})
    return {"message": "Project deleted successfully"}