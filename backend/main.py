"""
FastAPI backend for project management applications

Provides API endpoints for project overview, task tracking, and file uploads.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
import json

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
    """Get project management overview data with mock values"""
    try:
        # Load tasks from tasks.json
        with open('tasks.json', 'r') as file:
            tasks_data = json.load(file)
        
        # Calculate task metrics from actual data
        total_tasks = len(tasks_data)
        tasks_completed = sum(1 for task in tasks_data if task['status'].lower() == 'complete')
        tasks_in_progress = sum(1 for task in tasks_data if task['status'].lower() == 'in progress')
        tasks_on_hold = sum(1 for task in tasks_data if task['status'].lower() == 'on hold')
        tasks_open = sum(1 for task in tasks_data if task['status'].lower() not in ['complete', 'in progress', 'on hold'])
        
        # Calculate completion percentage based on actual completion percentages
        avg_completion = sum(task['completion_percentage'] for task in tasks_data) / total_tasks if total_tasks > 0 else 0
        
        # Get top 5 tasks by billable hours
        sorted_tasks = sorted(tasks_data, key=lambda x: x['billable_hours'], reverse=True)
        hourly_rate = 145
        top_tasks = []
        
        for task in sorted_tasks[:5]:
            top_tasks.append({
                "task": task['task_name'],
                "billable_hours": task['billable_hours'],
                "total_cost": task['billable_hours'] * hourly_rate
            })
        
        # Calculate total spent budget from billable hours
        total_billable_hours = sum(task['billable_hours'] for task in tasks_data)
        spent_budget = total_billable_hours * hourly_rate
        allocated_budget = 750000
        remaining_budget = allocated_budget - spent_budget
        budget_utilization = (spent_budget / allocated_budget) * 100 if allocated_budget > 0 else 0
        
        return {
            "project_info": {
                "client": "TechCorp Solutions",
                "project_manager": "Sarah Johnson",
                "start_date": "2024-01-15",
                "end_date": "2024-12-15",
                "projected_go_live": "2024-12-01",
                "current_phase": "Development",
                "status": "In Progress"
            },
            "task_metrics": {
                "total_tasks": total_tasks,
                "tasks_completed": tasks_completed,
                "tasks_in_progress": tasks_in_progress,
                "tasks_on_hold": tasks_on_hold,
                "tasks_open": tasks_open,
                "completion_percentage": round(avg_completion, 1)
            },
            "budget_info": {
                "allocated_budget": allocated_budget,
                "spent_budget": round(spent_budget, 2),
                "utilized_budget": round(spent_budget, 2),
                "budget_utilization_percentage": round(budget_utilization, 1),
                "remaining_budget": round(remaining_budget, 2)
            },
            "hourly_rate": hourly_rate,
            "top_tasks": top_tasks
        }
        
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Tasks data file not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error parsing tasks data file")
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)