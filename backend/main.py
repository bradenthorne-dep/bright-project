"""
FastAPI backend for project management applications

Provides API endpoints for project overview, task tracking, and file uploads.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
import json
from project_calculations import calculate_project_overview, calculate_risk_assessment

logger = logging.getLogger(__name__)

# Set working directory to backend directory for relative paths
backend_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(backend_dir)

app = FastAPI(
    title="Project Management API",
    description="Backend API for project management and task tracking",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Project Management API",
        "version": "1.0.0",
        "status": "running"
    }

@app.post("/api/upload-file")
async def upload_file(file: UploadFile = File(...)):
    """Generic file upload endpoint"""
    try:
        # Read file content
        content = await file.read()
        
        # Get file information
        file_size = len(content)
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'unknown'
        
        return {
            "message": "File uploaded successfully",
            "filename": file.filename,
            "file_info": {
                "size_bytes": file_size,
                "size_mb": round(file_size / (1024 * 1024), 2),
                "file_type": file_extension,
                "content_type": file.content_type
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing uploaded file: {str(e)}")

@app.get("/api/project-overview")
async def get_project_overview():
    """Get project management overview data from project_info.json and tasks.json"""
    try:
        # Load project info from project_info.json
        with open('project_info.json', 'r') as file:
            project_data = json.load(file)
        
        # Load tasks from tasks.json
        with open('tasks.json', 'r') as file:
            tasks_data = json.load(file)
        
        # Extract values from project_data
        project_info = project_data['project_info']
        allocated_budget = project_data['budget_info']['allocated_budget']
        hourly_rate = project_data['budget_info']['hourly_rate']
        
        # Calculate and return project overview using the calculations module
        return calculate_project_overview(tasks_data, project_info, allocated_budget, hourly_rate)
        
    except FileNotFoundError as e:
        if 'project_info.json' in str(e):
            raise HTTPException(status_code=404, detail="Project info data file not found")
        else:
            raise HTTPException(status_code=404, detail="Tasks data file not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error parsing data files")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading project overview: {str(e)}")

@app.get("/api/tasks")
async def get_tasks():
    """Get all task tracking data from tasks.json"""
    try:
        with open('tasks.json', 'r') as file:
            tasks_data = json.load(file)
        return {"tasks": tasks_data}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Tasks data file not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error parsing tasks data file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading tasks data: {str(e)}")

@app.get("/api/risk-assessment")
async def get_risk_assessment():
    """Get risk assessment data with pre-calculated risk levels and summary statistics"""
    try:
        # Load tasks from tasks.json
        with open('tasks.json', 'r') as file:
            tasks_data = json.load(file)
        
        # Calculate and return risk assessment using the calculations module
        return calculate_risk_assessment(tasks_data)
        
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Tasks data file not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error parsing tasks data file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading risk assessment: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)