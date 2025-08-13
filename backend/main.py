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
from pdf_processor import pdf_processor
from docx_processor import docx_processor

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
    """PDF and DOCX file upload endpoint with text extraction"""
    try:
        # Validate file type - accept PDF and DOCX files
        supported_types = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if file.content_type not in supported_types:
            raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
        
        # Validate file extension
        if not file.filename:
            raise HTTPException(status_code=400, detail="Filename is required")
        
        filename_lower = file.filename.lower()
        if not (filename_lower.endswith('.pdf') or filename_lower.endswith('.docx')):
            raise HTTPException(status_code=400, detail="File must have a .pdf or .docx extension")
        
        # Read file content
        content = await file.read()
        
        # Get file information
        file_size = len(content)
        
        # Determine file type and process accordingly
        if filename_lower.endswith('.pdf'):
            file_type = "pdf"
            extraction_result = pdf_processor.extract_text_from_pdf(content, file.filename)
            success_message = "PDF uploaded and processed successfully"
            error_message = "PDF uploaded but text extraction failed"
        else:  # .docx
            file_type = "docx"
            extraction_result = docx_processor.extract_text_from_docx(content, file.filename)
            success_message = "DOCX uploaded and processed successfully"
            error_message = "DOCX uploaded but text extraction failed"
        
        # Prepare response
        response_data = {
            "message": success_message,
            "filename": file.filename,
            "file_info": {
                "size_bytes": file_size,
                "size_mb": round(file_size / (1024 * 1024), 2),
                "file_type": file_type,
                "content_type": file.content_type
            },
            "extraction_result": extraction_result
        }
        
        # Add processing status to message if extraction failed
        if not extraction_result.get("success", False):
            response_data["message"] = error_message
        
        return response_data
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

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

@app.get("/api/extracted-text")
async def get_extracted_text():
    """Get the extracted text from the most recent document upload (PDF or DOCX)"""
    try:
        # Check if either processor has extracted text (they both use the same output file)
        if not pdf_processor.has_extracted_text() and not docx_processor.has_extracted_text():
            raise HTTPException(status_code=404, detail="No extracted text available. Please upload a PDF or DOCX file first.")
        
        # Try to get content from either processor (both use same output file)
        content = pdf_processor.get_extracted_text()
        if content is None:
            content = docx_processor.get_extracted_text()
        
        if content is None:
            raise HTTPException(status_code=500, detail="Error reading extracted text file")
        
        return {
            "content": content,
            "size": len(content),
            "available": True
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving extracted text: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)