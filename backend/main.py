"""
FastAPI backend template for data processing applications

Provides generic API endpoints for CSV data upload, preview, and basic processing.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import pandas as pd
import io
import os
import logging

logger = logging.getLogger(__name__)

# Set working directory to backend directory for relative paths
backend_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(backend_dir)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize application on startup"""
    load_default_data()
    yield

app = FastAPI(
    title="Data Processing Application API",
    description="Generic backend API for data processing and analysis",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for data storage
app_data = {
    "data_df": None,
    "data_source": None,
}

def load_default_data():
    """Initialize application - no default data to load"""
    print("Application initialized - ready for data upload")
    return True

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Data Processing Application API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/api/data-status")
async def get_data_status():
    """Check if data is loaded and from what source"""
    data_loaded = app_data["data_df"] is not None
    
    if data_loaded:
        return {
            "data_loaded": True,
            "data_info": {
                "row_count": len(app_data["data_df"]),
                "column_count": len(app_data["data_df"].columns),
                "columns": list(app_data["data_df"].columns)
            },
            "source": app_data["data_source"]
        }
    else:
        return {
            "data_loaded": False,
            "data_info": None,
            "source": None
        }

@app.post("/api/upload-data")
async def upload_data(file: UploadFile = File(...)):
    """Upload and validate CSV data file"""
    try:
        # Validate file type
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
        # Read CSV file
        content = await file.read()
        
        # Parse CSV data
        app_data["data_df"] = pd.read_csv(io.StringIO(content.decode('utf-8')))
        
        # Mark data source as uploaded
        app_data["data_source"] = "upload"
        
        return {
            "message": "Data uploaded successfully",
            "filename": file.filename,
            "data_info": {
                "row_count": len(app_data["data_df"]),
                "column_count": len(app_data["data_df"].columns),
                "columns": list(app_data["data_df"].columns)
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing uploaded data: {str(e)}")

@app.get("/api/data-preview")
async def get_data_preview():
    """Get preview of loaded data"""
    if app_data["data_df"] is None:
        raise HTTPException(status_code=400, detail="No data loaded")
    
    try:
        return {
            "preview": app_data["data_df"].head(10).to_dict('records'),
            "total_rows": len(app_data["data_df"]),
            "columns": list(app_data["data_df"].columns)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating data preview: {str(e)}")

@app.get("/api/data-summary")
async def get_data_summary():
    """Get basic statistical summary of the data"""
    if app_data["data_df"] is None:
        raise HTTPException(status_code=400, detail="No data loaded")
    
    try:
        # Get basic statistics
        summary = app_data["data_df"].describe(include='all').to_dict()
        
        # Get data types
        dtypes = app_data["data_df"].dtypes.to_dict()
        dtypes = {k: str(v) for k, v in dtypes.items()}
        
        # Get null counts
        null_counts = app_data["data_df"].isnull().sum().to_dict()
        
        return {
            "summary_statistics": summary,
            "data_types": dtypes,
            "null_counts": null_counts,
            "shape": {
                "rows": len(app_data["data_df"]),
                "columns": len(app_data["data_df"].columns)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating data summary: {str(e)}")

@app.get("/api/sample-metrics")
async def get_sample_metrics():
    """Sample metrics for testing UI components"""
    return {
        "data_cards": [
            {"title": "Total Records", "value": "125,847", "change": "+12.5%", "trend": "up"},
            {"title": "Processing Rate", "value": "94.2%", "change": "+2.1%", "trend": "up"},
            {"title": "Error Rate", "value": "0.8%", "change": "-0.3%", "trend": "down"},
            {"title": "Avg Response Time", "value": "2.4s", "change": "+0.2s", "trend": "up"}
        ],
        "score_gauge": {
            "value": 85,
            "max": 100,
            "label": "Data Quality Score",
            "color": "green"
        }
    }

@app.get("/api/sample-breakdown")
async def get_sample_breakdown():
    """Sample breakdown data for testing table component"""
    return {
        "title": "Data Processing Breakdown",
        "data": [
            {"Category": "Successful Records", "Count": 118550, "Percentage": "94.2%", "Status": "Good"},
            {"Category": "Warning Records", "Count": 6297, "Percentage": "5.0%", "Status": "Warning"},
            {"Category": "Error Records", "Count": 1000, "Percentage": "0.8%", "Status": "Error"},
            {"Category": "Total Processed", "Count": 125847, "Percentage": "100%", "Status": "Complete"}
        ]
    }

@app.get("/api/project-overview")
async def get_project_overview():
    """Get project management overview data with mock values"""
    return {
        "project_info": {
            "project_name": "Digital Transformation",
            "project_manager": "Sarah Johnson",
            "start_date": "2024-01-15",
            "end_date": "2024-12-15",
            "status": "In Progress"
        },
        "task_metrics": {
            "total_tasks": 156,
            "tasks_completed": 89,
            "tasks_in_progress": 34,
            "tasks_on_hold": 8,
            "tasks_open": 25,
            "completion_percentage": 57.1
        },
        "budget_info": {
            "allocated_budget": 250000,
            "utilized_budget": 142750,
            "budget_utilization_percentage": 57.1,
            "remaining_budget": 107250
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)