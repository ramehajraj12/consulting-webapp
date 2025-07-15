from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import timedelta
import os

from ..models.user import User, UserCreate, UserResponse, UserUpdate
from ..models.user import Consultant, ConsultantCreate, ConsultantResponse
from ..utils.auth import verify_password, get_password_hash, create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

# Get database connection
from ..server import db


@router.post("/register", response_model=dict)
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        role=user_data.role,
        name=user_data.name,
        phone=user_data.phone,
        company=user_data.company
    )
    
    # Insert user into database
    result = await db.users.insert_one(user.dict())
    user.id = str(result.inserted_id)
    
    # Create access token
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.id, "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(**user.dict())
    }


@router.post("/login", response_model=dict)
async def login(email: str, password: str):
    # Find user by email
    user_doc = await db.users.find_one({"email": email})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    user = User(**user_doc)
    
    # Verify password
    if not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.id, "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(**user.dict())
    }


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    user_id = decode_access_token(token)
    
    user_doc = await db.users.find_one({"_id": user_id})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    user_doc['id'] = str(user_doc['_id'])
    return User(**user_doc)


@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    return UserResponse(**current_user.dict())


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    update_data = user_update.dict(exclude_unset=True)
    if update_data:
        await db.users.update_one(
            {"_id": current_user.id},
            {"$set": update_data}
        )
    
    updated_user = await db.users.find_one({"_id": current_user.id})
    updated_user['id'] = str(updated_user['_id'])
    return UserResponse(**updated_user)


@router.post("/consultant-profile", response_model=ConsultantResponse)
async def create_consultant_profile(
    consultant_data: ConsultantCreate,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "consultant":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only consultants can create consultant profiles"
        )
    
    # Check if consultant profile already exists
    existing_consultant = await db.consultants.find_one({"user_id": current_user.id})
    if existing_consultant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Consultant profile already exists"
        )
    
    consultant = Consultant(
        user_id=current_user.id,
        **consultant_data.dict()
    )
    
    result = await db.consultants.insert_one(consultant.dict())
    consultant.id = str(result.inserted_id)
    
    return ConsultantResponse(
        **consultant.dict(),
        user=UserResponse(**current_user.dict())
    )


@router.get("/consultant-profile", response_model=ConsultantResponse)
async def get_consultant_profile(current_user: User = Depends(get_current_user)):
    if current_user.role != "consultant":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only consultants can access consultant profiles"
        )
    
    consultant_doc = await db.consultants.find_one({"user_id": current_user.id})
    if not consultant_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultant profile not found"
        )
    
    consultant_doc['id'] = str(consultant_doc['_id'])
    consultant = Consultant(**consultant_doc)
    
    return ConsultantResponse(
        **consultant.dict(),
        user=UserResponse(**current_user.dict())
    )


@router.post("/logout")
async def logout():
    return {"message": "Successfully logged out"}