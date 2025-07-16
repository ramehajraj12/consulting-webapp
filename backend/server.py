from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, Form, Depends, status
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional, Dict, Any, Union
import uuid
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
import json
import io
import base64
from scipy import stats
import openpyxl
import xlrd
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_squared_error
import statsmodels.api as sm
from statsmodels.formula.api import ols

# Import custom modules
from .models import *
from .auth import *
from .ai_assistant import StatisticalAIAssistant

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize AI Assistant
ai_assistant = StatisticalAIAssistant()

# Create the main app
app = FastAPI(
    title="SPSSAU - Professional Statistical Analysis Platform", 
    version="2.0.0",
    description="Professional web-based statistical analysis platform with AI-powered recommendations"
)

# Create routers
auth_router = APIRouter(prefix="/api/auth", tags=["Authentication"])
admin_router = APIRouter(prefix="/api/admin", tags=["Administration"])
analysis_router = APIRouter(prefix="/api/analysis", tags=["Statistical Analysis"])
dataset_router = APIRouter(prefix="/api/datasets", tags=["Dataset Management"])
ai_router = APIRouter(prefix="/api/ai", tags=["AI Assistant"])

# ===============================
# AUTHENTICATION ENDPOINTS
# ===============================

@auth_router.post("/register", response_model=Dict[str, Any])
async def register_user(user_create: UserCreate):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = await db.users.find_one({"$or": [{"email": user_create.email}, {"username": user_create.username}]})
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Hash password
        hashed_password = get_password_hash(user_create.password)
        
        # Create user
        user = User(
            email=user_create.email,
            username=user_create.username,
            full_name=user_create.full_name,
            role=user_create.role,
            organization=user_create.organization,
            department=user_create.department
        )
        
        user_dict = json.loads(user.json())
        user_dict["password"] = hashed_password
        
        await db.users.insert_one(user_dict)
        
        return {
            "message": "User registered successfully",
            "user": user.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@auth_router.post("/login")
async def login(user_login: UserLogin):
    """User login"""
    try:
        # Find user
        user_data = await db.users.find_one({"username": user_login.username})
        if not user_data:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Verify password
        if not verify_password(user_login.password, user_data["password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Check if user is active
        if user_data["status"] != "active":
            raise HTTPException(status_code=401, detail="Account inactive")
        
        # Update last login
        await db.users.update_one(
            {"_id": user_data["_id"]},
            {"$set": {"last_login": datetime.utcnow()}}
        )
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_data["username"]}, 
            expires_delta=access_token_expires
        )
        
        user = User(**user_data)
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@auth_router.get("/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    return current_user

@auth_router.put("/change-password")
async def change_password(
    password_reset: UserPasswordReset,
    current_user: User = Depends(get_current_active_user)
):
    """Change user password"""
    try:
        # Get user with password
        user_data = await db.users.find_one({"id": current_user.id})
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Verify current password
        if not verify_password(password_reset.current_password, user_data["password"]):
            raise HTTPException(status_code=400, detail="Current password incorrect")
        
        # Update password
        new_hashed_password = get_password_hash(password_reset.new_password)
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": {"password": new_hashed_password}}
        )
        
        return {"message": "Password changed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ===============================
# ADMIN ENDPOINTS
# ===============================

@admin_router.get("/dashboard")
async def admin_dashboard(admin_user: User = Depends(get_admin_user)):
    """Get admin dashboard statistics"""
    try:
        # Get system statistics
        total_users = await db.users.count_documents({})
        active_users = await db.users.count_documents({"status": "active"})
        total_datasets = await db.datasets.count_documents({})
        total_analyses = await db.analyses.count_documents({})
        
        # Get storage usage (approximate)
        storage_used = await db.datasets.aggregate([
            {"$group": {"_id": None, "total_size": {"$sum": "$file_size"}}}
        ]).to_list(1)
        storage_used = storage_used[0]["total_size"] if storage_used else 0
        
        # Get top analysis types
        top_analysis_types = await db.analyses.aggregate([
            {"$group": {"_id": "$analysis_type", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]).to_list(10)
        
        # Get recent user activity
        user_activity = await db.users.aggregate([
            {"$match": {"last_login": {"$exists": True}}},
            {"$sort": {"last_login": -1}},
            {"$limit": 10},
            {"$project": {"username": 1, "full_name": 1, "last_login": 1, "organization": 1}}
        ]).to_list(10)
        
        return SystemStats(
            total_users=total_users,
            active_users=active_users,
            total_datasets=total_datasets,
            total_analyses=total_analyses,
            storage_used=storage_used,
            top_analysis_types=top_analysis_types,
            user_activity=user_activity
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.get("/users")
async def get_all_users(admin_user: User = Depends(get_admin_user)):
    """Get all users (admin only)"""
    try:
        users = await db.users.find({}, {"password": 0}).to_list(1000)
        return [User(**user) for user in users]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    admin_user: User = Depends(get_admin_user)
):
    """Update user (admin only)"""
    try:
        update_data = {k: v for k, v in user_update.dict().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        result = await db.users.update_one(
            {"id": user_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"message": "User updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    admin_user: User = Depends(get_admin_user)
):
    """Delete user (admin only)"""
    try:
        result = await db.users.delete_one({"id": user_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Also delete user's datasets and analyses
        await db.datasets.delete_many({"user_id": user_id})
        await db.analyses.delete_many({"user_id": user_id})
        
        return {"message": "User deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ===============================
# DATASET ENDPOINTS (Enhanced)
# ===============================

@dataset_router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    name: str = Form(...),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    current_user: User = Depends(get_current_active_user)
):
    """Upload and process a dataset"""
    try:
        # Parse tags
        tag_list = []
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
        
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        
        # Determine file type and read data
        filename = file.filename.lower()
        
        if filename.endswith('.csv'):
            df = pd.read_csv(io.StringIO(file_content.decode('utf-8')))
            file_type = 'csv'
        elif filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(file_content))
            file_type = 'excel'
        elif filename.endswith('.json'):
            data = json.loads(file_content.decode('utf-8'))
            df = pd.DataFrame(data)
            file_type = 'json'
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please use CSV, Excel, or JSON.")
        
        # Analyze dataset
        column_info = analyze_dataset(df)
        
        # Create dataset info
        dataset_info = DatasetInfo(
            name=name,
            filename=file.filename,
            file_size=file_size,
            file_type=file_type,
            rows=len(df),
            columns=len(df.columns),
            column_info=column_info,
            description=description,
            tags=tag_list,
            user_id=current_user.id,
            organization=current_user.organization
        )
        
        # Save to database
        await save_dataset_to_db(dataset_info, df)
        
        return JSONResponse(content={
            "message": "Dataset uploaded successfully",
            "dataset": json.loads(dataset_info.json())
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@dataset_router.get("", response_model=List[DatasetInfo])
async def get_datasets(current_user: User = Depends(get_current_active_user)):
    """Get user's datasets"""
    try:
        query = {"user_id": current_user.id}
        if current_user.role == UserRole.ADMIN:
            query = {}  # Admin can see all datasets
        
        datasets = await db.datasets.find(query).to_list(1000)
        return [DatasetInfo(**dataset) for dataset in datasets]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving datasets: {str(e)}")

# ===============================
# ENHANCED ANALYSIS ENDPOINTS
# ===============================

@analysis_router.post("/analyze")
async def analyze_dataset_endpoint(
    request: AnalysisRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Perform statistical analysis with AI recommendations"""
    try:
        import time
        start_time = time.time()
        
        # Get dataset
        dataset = await db.datasets.find_one({"id": request.dataset_id})
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        # Check permissions
        if dataset["user_id"] != current_user.id and current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Load dataset data
        chunks = await db.dataset_chunks.find({"dataset_id": request.dataset_id}).sort("chunk_index", 1).to_list(None)
        all_data = []
        for chunk in chunks:
            all_data.extend(chunk['data'])
        
        df = pd.DataFrame(all_data)
        
        # Perform analysis
        results = await perform_statistical_analysis(request.analysis_type, request.parameters, df, dataset)
        
        # Generate APA table
        apa_table = await ai_assistant.generate_apa_table(request.analysis_type, results)
        
        # Generate AI recommendations
        ai_recommendations = await ai_assistant.generate_analysis_recommendations(
            request.analysis_type, 
            results, 
            dataset,
            {"user_role": current_user.role, "organization": current_user.organization}
        )
        
        # Save analysis result
        execution_time = time.time() - start_time
        analysis_result = AnalysisResult(
            dataset_id=request.dataset_id,
            user_id=current_user.id,
            analysis_type=request.analysis_type,
            parameters=request.parameters,
            results=results,
            apa_table=apa_table,
            ai_recommendations=ai_recommendations,
            execution_time=execution_time
        )
        
        await db.analyses.insert_one(json.loads(analysis_result.json()))
        
        return analysis_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error performing analysis: {str(e)}")

@analysis_router.get("/results/{dataset_id}")
async def get_analysis_results(
    dataset_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get analysis results for a dataset"""
    try:
        # Check dataset permissions
        dataset = await db.datasets.find_one({"id": dataset_id})
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        if dataset["user_id"] != current_user.id and current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Access denied")
        
        analyses = await db.analyses.find({"dataset_id": dataset_id}).to_list(1000)
        return [AnalysisResult(**analysis) for analysis in analyses]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving analyses: {str(e)}")

# ===============================
# AI ASSISTANT ENDPOINTS
# ===============================

@ai_router.post("/chat")
async def chat_with_ai(
    request: ChatRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Chat with AI assistant"""
    try:
        # Get user's datasets and analyses for context
        datasets = await db.datasets.find({"user_id": current_user.id}).to_list(100)
        analyses = await db.analyses.find({"user_id": current_user.id}).sort("created_date", -1).to_list(50)
        
        # Generate response
        response = await ai_assistant.generate_study_recommendations(
            datasets, 
            analyses, 
            {
                "role": current_user.role,
                "organization": current_user.organization,
                "department": current_user.department
            }
        )
        
        # Save chat message
        chat_message = ChatMessage(
            session_id=request.session_id,
            user_id=current_user.id,
            message=request.message,
            response=response
        )
        
        await db.chat_messages.insert_one(json.loads(chat_message.json()))
        
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in AI chat: {str(e)}")

@ai_router.post("/explain/{concept}")
async def explain_concept(
    concept: str,
    context: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """Explain statistical concept"""
    try:
        explanation = await ai_assistant.explain_statistical_concept(concept, context)
        return {"explanation": explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error explaining concept: {str(e)}")

def detect_data_type(series):
    """Detect the appropriate data type for a pandas Series"""
    if series.dtype == 'object':
        # Try to convert to numeric
        try:
            pd.to_numeric(series)
            return 'numeric'
        except:
            # Try to convert to datetime
            try:
                pd.to_datetime(series)
                return 'datetime'
            except:
                return 'categorical'
    elif pd.api.types.is_numeric_dtype(series):
        return 'numeric'
    elif pd.api.types.is_datetime64_any_dtype(series):
        return 'datetime'
    else:
        return 'categorical'

def get_column_statistics(series, data_type):
    """Get statistical summary for a column"""
    stats = {}
    
    if data_type == 'numeric':
        stats.update({
            'mean': float(series.mean()) if not series.empty else 0,
            'median': float(series.median()) if not series.empty else 0,
            'std': float(series.std()) if not series.empty else 0,
            'min': float(series.min()) if not series.empty else 0,
            'max': float(series.max()) if not series.empty else 0,
            'q25': float(series.quantile(0.25)) if not series.empty else 0,
            'q75': float(series.quantile(0.75)) if not series.empty else 0
        })
    elif data_type == 'categorical':
        value_counts = series.value_counts()
        stats.update({
            'mode': str(value_counts.index[0]) if not value_counts.empty else None,
            'mode_count': int(value_counts.iloc[0]) if not value_counts.empty else 0,
            'categories': value_counts.head(10).to_dict()
        })
    
    return stats

def analyze_dataset(df):
    """Analyze a dataset and return column information"""
    column_info = {}
    
    for col in df.columns:
        series = df[col]
        data_type = detect_data_type(series)
        
        # Get sample values (non-null)
        sample_values = series.dropna().head(5).tolist()
        
        # Convert numpy types to Python types for JSON serialization
        sample_values = [
            item.item() if hasattr(item, 'item') else item 
            for item in sample_values
        ]
        
        column_info[col] = {
            'name': col,
            'data_type': data_type,
            'null_count': int(series.isnull().sum()),
            'unique_count': int(series.nunique()),
            'sample_values': sample_values,
            'statistics': get_column_statistics(series, data_type)
        }
    
    return column_info

async def save_dataset_to_db(dataset_info: DatasetInfo, df: pd.DataFrame):
    """Save dataset info and data to MongoDB"""
    # Save dataset info - convert to dict with proper datetime handling
    dataset_dict = json.loads(dataset_info.json())
    await db.datasets.insert_one(dataset_dict)
    
    # Save actual data in chunks to avoid document size limits
    chunk_size = 1000
    chunks = []
    
    for i in range(0, len(df), chunk_size):
        chunk = df.iloc[i:i + chunk_size]
        chunk_data = {
            'dataset_id': dataset_info.id,
            'chunk_index': i // chunk_size,
            'data': chunk.to_dict('records')
        }
        chunks.append(chunk_data)
    
    if chunks:
        await db.dataset_chunks.insert_many(chunks)

# ===============================
# API ENDPOINTS
# ===============================

@api_router.get("/")
async def root():
    return {"message": "SPSSAU Statistical Analysis Platform API", "version": "1.0.0"}

@api_router.post("/datasets/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    name: str = Form(...),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None)
):
    """Upload and process a dataset (CSV, Excel, JSON)"""
    try:
        # Parse tags
        tag_list = []
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
        
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        
        # Determine file type and read data
        filename = file.filename.lower()
        
        if filename.endswith('.csv'):
            df = pd.read_csv(io.StringIO(file_content.decode('utf-8')))
            file_type = 'csv'
        elif filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(file_content))
            file_type = 'excel'
        elif filename.endswith('.json'):
            data = json.loads(file_content.decode('utf-8'))
            df = pd.DataFrame(data)
            file_type = 'json'
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please use CSV, Excel, or JSON.")
        
        # Analyze dataset
        column_info = analyze_dataset(df)
        
        # Create dataset info
        dataset_info = DatasetInfo(
            name=name,
            filename=file.filename,
            file_size=file_size,
            file_type=file_type,
            rows=len(df),
            columns=len(df.columns),
            column_info=column_info,
            description=description,
            tags=tag_list
        )
        
        # Save to database
        await save_dataset_to_db(dataset_info, df)
        
        return JSONResponse(content={
            "message": "Dataset uploaded successfully",
            "dataset": json.loads(dataset_info.json())
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@api_router.get("/datasets", response_model=List[DatasetInfo])
async def get_datasets():
    """Get all datasets"""
    try:
        datasets = await db.datasets.find().to_list(1000)
        return [DatasetInfo(**dataset) for dataset in datasets]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving datasets: {str(e)}")

@api_router.get("/datasets/{dataset_id}")
async def get_dataset(dataset_id: str):
    """Get specific dataset information"""
    try:
        dataset = await db.datasets.find_one({"id": dataset_id})
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
        return DatasetInfo(**dataset)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving dataset: {str(e)}")

@api_router.get("/datasets/{dataset_id}/preview")
async def get_dataset_preview(dataset_id: str, limit: int = 100):
    """Get preview of dataset data"""
    try:
        # Get dataset info
        dataset = await db.datasets.find_one({"id": dataset_id})
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        # Get first chunk of data
        chunks = await db.dataset_chunks.find({"dataset_id": dataset_id}).sort("chunk_index", 1).to_list(None)
        
        if not chunks:
            return DataPreview(
                dataset_id=dataset_id,
                columns=list(dataset['column_info'].keys()),
                data=[],
                total_rows=dataset['rows'],
                preview_rows=0
            )
        
        # Combine chunks up to limit
        all_data = []
        for chunk in chunks:
            all_data.extend(chunk['data'])
            if len(all_data) >= limit:
                break
        
        preview_data = all_data[:limit]
        
        return DataPreview(
            dataset_id=dataset_id,
            columns=list(dataset['column_info'].keys()),
            data=preview_data,
            total_rows=dataset['rows'],
            preview_rows=len(preview_data)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving dataset preview: {str(e)}")

@api_router.delete("/datasets/{dataset_id}")
async def delete_dataset(dataset_id: str):
    """Delete a dataset"""
    try:
        # Delete dataset info
        result = await db.datasets.delete_one({"id": dataset_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        # Delete dataset chunks
        await db.dataset_chunks.delete_many({"dataset_id": dataset_id})
        
        # Delete related analyses
        await db.analyses.delete_many({"dataset_id": dataset_id})
        
        return {"message": "Dataset deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting dataset: {str(e)}")

@api_router.post("/datasets/{dataset_id}/analyze")
async def analyze_dataset_endpoint(dataset_id: str, request: AnalysisRequest):
    """Perform statistical analysis on dataset"""
    try:
        import time
        start_time = time.time()
        
        # Get dataset
        dataset = await db.datasets.find_one({"id": dataset_id})
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        # Load dataset data
        chunks = await db.dataset_chunks.find({"dataset_id": dataset_id}).sort("chunk_index", 1).to_list(None)
        all_data = []
        for chunk in chunks:
            all_data.extend(chunk['data'])
        
        df = pd.DataFrame(all_data)
        
        # Perform analysis based on type
        results = {}
        
        if request.analysis_type == "descriptive":
            # Descriptive statistics
            numeric_cols = [col for col, info in dataset['column_info'].items() 
                          if info['data_type'] == 'numeric']
            
            if numeric_cols:
                desc_stats = df[numeric_cols].describe()
                results = {
                    'descriptive_statistics': desc_stats.to_dict(),
                    'column_count': len(numeric_cols),
                    'analyzed_columns': numeric_cols
                }
            else:
                results = {'message': 'No numeric columns found for descriptive analysis'}
        
        elif request.analysis_type == "frequency":
            # Frequency analysis
            column = request.parameters.get('column')
            if not column:
                raise HTTPException(status_code=400, detail="Column parameter required for frequency analysis")
            
            if column not in df.columns:
                raise HTTPException(status_code=400, detail=f"Column '{column}' not found in dataset")
            
            freq_table = df[column].value_counts()
            results = {
                'frequency_table': freq_table.to_dict(),
                'total_count': len(df),
                'unique_values': len(freq_table),
                'column': column
            }
        
        elif request.analysis_type == "correlation":
            # Correlation analysis
            numeric_cols = [col for col, info in dataset['column_info'].items() 
                          if info['data_type'] == 'numeric']
            
            if len(numeric_cols) < 2:
                raise HTTPException(status_code=400, detail="At least 2 numeric columns required for correlation analysis")
            
            corr_matrix = df[numeric_cols].corr()
            results = {
                'correlation_matrix': corr_matrix.to_dict(),
                'columns': numeric_cols,
                'significant_correlations': []
            }
            
            # Find significant correlations (> 0.7 or < -0.7)
            for i in range(len(numeric_cols)):
                for j in range(i+1, len(numeric_cols)):
                    corr_val = corr_matrix.iloc[i, j]
                    if abs(corr_val) > 0.7:
                        results['significant_correlations'].append({
                            'column1': numeric_cols[i],
                            'column2': numeric_cols[j],
                            'correlation': corr_val
                        })
        
        elif request.analysis_type == "ttest_one":
            # One-sample t-test
            column = request.parameters.get('column')
            test_value = request.parameters.get('test_value', 0)
            
            if not column or column not in df.columns:
                raise HTTPException(status_code=400, detail="Valid column parameter required")
            
            from scipy import stats
            data = df[column].dropna()
            
            if len(data) < 2:
                raise HTTPException(status_code=400, detail="Insufficient data for t-test")
            
            t_stat, p_value = stats.ttest_1samp(data, test_value)
            
            results = {
                'test_type': 'One-sample t-test',
                'column': column,
                'test_value': test_value,
                't_statistic': float(t_stat),
                'p_value': float(p_value),
                'degrees_of_freedom': len(data) - 1,
                'sample_mean': float(data.mean()),
                'sample_std': float(data.std()),
                'sample_size': len(data),
                'significant': p_value < 0.05
            }
            
        elif request.analysis_type == "ttest_two":
            # Two-sample t-test
            column1 = request.parameters.get('column1')
            column2 = request.parameters.get('column2')
            
            if not column1 or not column2 or column1 not in df.columns or column2 not in df.columns:
                raise HTTPException(status_code=400, detail="Valid column1 and column2 parameters required")
            
            from scipy import stats
            data1 = df[column1].dropna()
            data2 = df[column2].dropna()
            
            if len(data1) < 2 or len(data2) < 2:
                raise HTTPException(status_code=400, detail="Insufficient data for t-test")
            
            t_stat, p_value = stats.ttest_ind(data1, data2)
            
            results = {
                'test_type': 'Two-sample t-test',
                'column1': column1,
                'column2': column2,
                't_statistic': float(t_stat),
                'p_value': float(p_value),
                'degrees_of_freedom': len(data1) + len(data2) - 2,
                'group1_mean': float(data1.mean()),
                'group2_mean': float(data2.mean()),
                'group1_std': float(data1.std()),
                'group2_std': float(data2.std()),
                'group1_size': len(data1),
                'group2_size': len(data2),
                'significant': p_value < 0.05
            }
            
        elif request.analysis_type == "anova":
            # One-way ANOVA
            dependent_var = request.parameters.get('dependent_var')
            independent_var = request.parameters.get('independent_var')
            
            if not dependent_var or not independent_var:
                raise HTTPException(status_code=400, detail="dependent_var and independent_var parameters required")
            
            if dependent_var not in df.columns or independent_var not in df.columns:
                raise HTTPException(status_code=400, detail="Specified columns not found in dataset")
            
            from scipy import stats
            import statsmodels.api as sm
            from statsmodels.formula.api import ols
            
            # Clean data
            clean_df = df[[dependent_var, independent_var]].dropna()
            
            if len(clean_df) < 3:
                raise HTTPException(status_code=400, detail="Insufficient data for ANOVA")
            
            # Group data by independent variable
            groups = [group[dependent_var].values for name, group in clean_df.groupby(independent_var)]
            
            if len(groups) < 2:
                raise HTTPException(status_code=400, detail="At least 2 groups required for ANOVA")
            
            # Perform ANOVA
            f_stat, p_value = stats.f_oneway(*groups)
            
            # Calculate group statistics
            group_stats = []
            for name, group in clean_df.groupby(independent_var):
                group_stats.append({
                    'group': str(name),
                    'mean': float(group[dependent_var].mean()),
                    'std': float(group[dependent_var].std()),
                    'count': len(group)
                })
            
            results = {
                'test_type': 'One-way ANOVA',
                'dependent_variable': dependent_var,
                'independent_variable': independent_var,
                'f_statistic': float(f_stat),
                'p_value': float(p_value),
                'degrees_of_freedom_between': len(groups) - 1,
                'degrees_of_freedom_within': len(clean_df) - len(groups),
                'group_statistics': group_stats,
                'significant': p_value < 0.05
            }
            
        elif request.analysis_type == "chi_square":
            # Chi-square test of independence
            var1 = request.parameters.get('var1')
            var2 = request.parameters.get('var2')
            
            if not var1 or not var2:
                raise HTTPException(status_code=400, detail="var1 and var2 parameters required")
            
            if var1 not in df.columns or var2 not in df.columns:
                raise HTTPException(status_code=400, detail="Specified columns not found in dataset")
            
            from scipy import stats
            
            # Create contingency table
            contingency_table = pd.crosstab(df[var1], df[var2])
            
            if contingency_table.empty:
                raise HTTPException(status_code=400, detail="Unable to create contingency table")
            
            # Perform chi-square test
            chi2, p_value, dof, expected = stats.chi2_contingency(contingency_table)
            
            results = {
                'test_type': 'Chi-square test of independence',
                'variable1': var1,
                'variable2': var2,
                'chi2_statistic': float(chi2),
                'p_value': float(p_value),
                'degrees_of_freedom': int(dof),
                'contingency_table': contingency_table.to_dict(),
                'expected_frequencies': pd.DataFrame(expected, 
                                                   index=contingency_table.index,
                                                   columns=contingency_table.columns).to_dict(),
                'significant': p_value < 0.05
            }
            
        elif request.analysis_type == "regression":
            # Linear regression
            dependent_var = request.parameters.get('dependent_var')
            independent_vars = request.parameters.get('independent_vars', [])
            
            if not dependent_var:
                raise HTTPException(status_code=400, detail="dependent_var parameter required")
            
            if not independent_vars:
                raise HTTPException(status_code=400, detail="independent_vars parameter required")
            
            if isinstance(independent_vars, str):
                independent_vars = [independent_vars]
            
            from sklearn.linear_model import LinearRegression
            from sklearn.metrics import r2_score, mean_squared_error
            import statsmodels.api as sm
            
            # Check if all variables exist
            all_vars = [dependent_var] + independent_vars
            missing_vars = [var for var in all_vars if var not in df.columns]
            if missing_vars:
                raise HTTPException(status_code=400, detail=f"Variables not found: {missing_vars}")
            
            # Clean data
            clean_df = df[all_vars].dropna()
            
            if len(clean_df) < len(independent_vars) + 2:
                raise HTTPException(status_code=400, detail="Insufficient data for regression")
            
            X = clean_df[independent_vars]
            y = clean_df[dependent_var]
            
            # Fit regression model
            model = LinearRegression()
            model.fit(X, y)
            
            # Get predictions
            y_pred = model.predict(X)
            
            # Calculate statistics
            r2 = r2_score(y, y_pred)
            mse = mean_squared_error(y, y_pred)
            
            # Use statsmodels for more detailed statistics
            X_sm = sm.add_constant(X)
            sm_model = sm.OLS(y, X_sm).fit()
            
            results = {
                'test_type': 'Linear Regression',
                'dependent_variable': dependent_var,
                'independent_variables': independent_vars,
                'r_squared': float(r2),
                'adjusted_r_squared': float(sm_model.rsquared_adj),
                'f_statistic': float(sm_model.fvalue),
                'f_pvalue': float(sm_model.f_pvalue),
                'mse': float(mse),
                'rmse': float(np.sqrt(mse)),
                'coefficients': {
                    'intercept': float(model.intercept_),
                    'slopes': {var: float(coef) for var, coef in zip(independent_vars, model.coef_)}
                },
                'coefficient_stats': {
                    'coefficients': sm_model.params.to_dict(),
                    'std_errors': sm_model.bse.to_dict(),
                    't_values': sm_model.tvalues.to_dict(),
                    'p_values': sm_model.pvalues.to_dict()
                },
                'sample_size': len(clean_df),
                'significant': sm_model.f_pvalue < 0.05
            }
            
        elif request.analysis_type == "visualization":
            # Generate visualization
            chart_type = request.parameters.get('chart_type', 'histogram')
            columns = request.parameters.get('columns', [])
            
            if not columns:
                raise HTTPException(status_code=400, detail="columns parameter required")
            
            import matplotlib.pyplot as plt
            import seaborn as sns
            import base64
            from io import BytesIO
            
            # Set style
            plt.style.use('default')
            sns.set_palette("husl")
            
            fig, ax = plt.subplots(figsize=(10, 6))
            
            if chart_type == 'histogram':
                column = columns[0] if columns else df.columns[0]
                if column not in df.columns:
                    raise HTTPException(status_code=400, detail=f"Column '{column}' not found")
                
                data = df[column].dropna()
                ax.hist(data, bins=30, alpha=0.7, edgecolor='black')
                ax.set_title(f'Histogram of {column}')
                ax.set_xlabel(column)
                ax.set_ylabel('Frequency')
                
            elif chart_type == 'boxplot':
                column = columns[0] if columns else df.columns[0]
                if column not in df.columns:
                    raise HTTPException(status_code=400, detail=f"Column '{column}' not found")
                
                data = df[column].dropna()
                ax.boxplot(data)
                ax.set_title(f'Boxplot of {column}')
                ax.set_ylabel(column)
                
            elif chart_type == 'scatter':
                if len(columns) < 2:
                    raise HTTPException(status_code=400, detail="Two columns required for scatter plot")
                
                x_col, y_col = columns[0], columns[1]
                if x_col not in df.columns or y_col not in df.columns:
                    raise HTTPException(status_code=400, detail="Specified columns not found")
                
                clean_df = df[[x_col, y_col]].dropna()
                ax.scatter(clean_df[x_col], clean_df[y_col], alpha=0.6)
                ax.set_title(f'Scatter Plot: {x_col} vs {y_col}')
                ax.set_xlabel(x_col)
                ax.set_ylabel(y_col)
                
            elif chart_type == 'bar':
                column = columns[0] if columns else df.columns[0]
                if column not in df.columns:
                    raise HTTPException(status_code=400, detail=f"Column '{column}' not found")
                
                value_counts = df[column].value_counts().head(10)
                ax.bar(range(len(value_counts)), value_counts.values)
                ax.set_title(f'Bar Chart of {column}')
                ax.set_xlabel(column)
                ax.set_ylabel('Count')
                ax.set_xticks(range(len(value_counts)))
                ax.set_xticklabels(value_counts.index, rotation=45)
                
            # Convert plot to base64 string
            buffer = BytesIO()
            plt.tight_layout()
            plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
            buffer.seek(0)
            
            # Encode to base64
            plot_data = base64.b64encode(buffer.getvalue()).decode()
            plt.close()
            
            results = {
                'chart_type': chart_type,
                'columns': columns,
                'image_data': plot_data,
                'image_format': 'png'
            }
        
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported analysis type: {request.analysis_type}")
        
        # Save analysis result
        execution_time = time.time() - start_time
        analysis_result = AnalysisResult(
            dataset_id=dataset_id,
            analysis_type=request.analysis_type,
            parameters=request.parameters,
            results=results,
            execution_time=execution_time
        )
        
        await db.analyses.insert_one(json.loads(analysis_result.json()))
        
        return analysis_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error performing analysis: {str(e)}")

@api_router.get("/datasets/{dataset_id}/analyses")
async def get_dataset_analyses(dataset_id: str):
    """Get all analyses for a dataset"""
    try:
        analyses = await db.analyses.find({"dataset_id": dataset_id}).to_list(1000)
        return [AnalysisResult(**analysis) for analysis in analyses]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving analyses: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
