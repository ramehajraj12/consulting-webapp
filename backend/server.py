from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
import uuid
from datetime import datetime
import pandas as pd
import numpy as np
import json
import io
import base64
from scipy import stats
import openpyxl
import xlrd

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="SPSSAU - Statistical Analysis Platform", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ===============================
# DATA MODELS
# ===============================

class DatasetInfo(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    filename: str
    upload_date: datetime = Field(default_factory=datetime.utcnow)
    file_size: int
    file_type: str
    rows: int
    columns: int
    column_info: Dict[str, Any]
    description: Optional[str] = None
    tags: List[str] = []
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class DatasetCreate(BaseModel):
    name: str
    description: Optional[str] = None
    tags: List[str] = []

class ColumnInfo(BaseModel):
    name: str
    data_type: str
    null_count: int
    unique_count: int
    sample_values: List[Any]
    statistics: Optional[Dict[str, Any]] = None

class DataPreview(BaseModel):
    dataset_id: str
    columns: List[str]
    data: List[Dict[str, Any]]
    total_rows: int
    preview_rows: int

class AnalysisRequest(BaseModel):
    dataset_id: str
    analysis_type: str
    parameters: Dict[str, Any]

class AnalysisResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    dataset_id: str
    analysis_type: str
    parameters: Dict[str, Any]
    results: Dict[str, Any]
    created_date: datetime = Field(default_factory=datetime.utcnow)
    execution_time: float
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# ===============================
# UTILITY FUNCTIONS
# ===============================

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
    # Save dataset info
    await db.datasets.insert_one(dataset_info.dict())
    
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
            "dataset": dataset_info.dict()
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
        
        await db.analyses.insert_one(analysis_result.dict())
        
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
