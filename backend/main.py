"""
FastAPI backend for project management applications

Provides API endpoints for project overview, task tracking, file uploads, and AI agent execution.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import logging
import json
import asyncio
from project_calculations import calculate_project_overview, calculate_risk_assessment, get_ai_risk_assessment
from pdf_processor import pdf_processor, PDFProcessor
from docx_processor import docx_processor, DOCXProcessor
from ai_agents import AIAgentSystem

logger = logging.getLogger(__name__)

# Set working directory to backend directory for relative paths
backend_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(backend_dir)

app = FastAPI(
    title="Project Management API",
    description="Backend API for project management, task tracking, and AI agent execution",
    version="1.0.0"
)

# Initialize AI Agent System
agent_system = AIAgentSystem()

# Initialize MSA-specific processors (reuse existing classes with different output files)
msa_pdf_processor = PDFProcessor()
msa_pdf_processor.output_file = "msa.txt"
msa_docx_processor = DOCXProcessor()
msa_docx_processor.output_file = "msa.txt"

# Pydantic models for API requests/responses
class AgentExecuteRequest(BaseModel):
    agent_id: str

class AgentResponse(BaseModel):
    agent_id: str
    status: str
    message: Optional[str] = None
    error: Optional[str] = None
    output_file: Optional[str] = None
    result_preview: Optional[str] = None

class AgentInfo(BaseModel):
    id: str
    name: str
    description: str
    model: str
    enabled: bool

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

@app.get("/")
async def read_root():
    """Root endpoint for API health check"""
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

@app.post("/api/upload-msa")
async def upload_msa(file: UploadFile = File(...)):
    """MSA PDF and DOCX file upload endpoint with text extraction to msa.txt"""
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
        
        # Determine file type and process accordingly using MSA processors
        if filename_lower.endswith('.pdf'):
            file_type = "pdf"
            extraction_result = msa_pdf_processor.extract_text_from_pdf(content, file.filename)
            success_message = "MSA PDF uploaded and processed successfully"
            error_message = "MSA PDF uploaded but text extraction failed"
        else:  # .docx
            file_type = "docx"
            extraction_result = msa_docx_processor.extract_text_from_docx(content, file.filename)
            success_message = "MSA DOCX uploaded and processed successfully"
            error_message = "MSA DOCX uploaded but text extraction failed"
        
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
        raise HTTPException(status_code=400, detail=f"Error processing MSA file: {str(e)}")

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
        project_info = project_data.get("project_info", {})
        allocated_budget = project_data.get("budget_info", {}).get("allocated_budget")
        hourly_rate = project_data.get("budget_info", {}).get("hourly_rate")
        
        # Calculate project overview
        result = calculate_project_overview(tasks_data, project_info, allocated_budget, hourly_rate)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading project overview: {str(e)}")

@app.get("/api/projects")
async def get_projects():
    """Get list of available projects"""
    try:
        project_data_dir = "../project_data/raw"
        projects = []
        
        if os.path.exists(project_data_dir):
            for item in os.listdir(project_data_dir):
                project_path = os.path.join(project_data_dir, item)
                if os.path.isdir(project_path):
                    # Look for JSON tracker files in the project directory
                    json_files = [f for f in os.listdir(project_path) if f.endswith('.json') and 'tracker' in f.lower()]
                    if json_files:
                        projects.append({
                            "id": item,
                            "name": item,
                            "tracker_file": json_files[0]
                        })
        
        return {"projects": projects}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading projects: {str(e)}")

@app.get("/api/tasks")
async def get_tasks(project: Optional[str] = None):
    """Get all task tracking data from tasks.json or project-specific data"""
    try:
        if project:
            # Load tasks from specific project
            project_dir = f"../project_data/raw/{project}"
            if not os.path.exists(project_dir):
                raise HTTPException(status_code=404, detail=f"Project '{project}' not found")
            
            # Find the tracker JSON file
            json_files = [f for f in os.listdir(project_dir) if f.endswith('.json') and 'tracker' in f.lower()]
            if not json_files:
                raise HTTPException(status_code=404, detail=f"No tracker file found for project '{project}'")
            
            tracker_file = os.path.join(project_dir, json_files[0])
            with open(tracker_file, 'r') as file:
                tasks_data = json.load(file)
        else:
            # Default behavior - load from tasks.json
            with open('tasks.json', 'r') as file:
                tasks_data = json.load(file)
        
        return {"tasks": tasks_data}
    except FileNotFoundError:
        if project:
            raise HTTPException(status_code=404, detail=f"Tasks data file not found for project '{project}'")
        else:
            raise HTTPException(status_code=404, detail="Tasks data file not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error parsing tasks data file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading tasks data: {str(e)}")

@app.get("/api/risk-assessment")
async def get_risk_assessment():
    """Get risk assessment data from tasks.json"""
    try:
        # Load tasks from tasks.json
        with open('tasks.json', 'r') as file:
            tasks_data = json.load(file)
        
        # Calculate risk assessment
        result = calculate_risk_assessment(tasks_data)
        
        return result
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
        
        return {"text": content}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving extracted text: {str(e)}")

@app.get("/api/msa-text")
async def get_msa_text():
    """Get the extracted text from the most recent MSA document upload (PDF or DOCX)"""
    try:
        # Check if either processor has extracted text (they both use the same output file)
        if not msa_pdf_processor.has_extracted_text() and not msa_docx_processor.has_extracted_text():
            raise HTTPException(status_code=404, detail="No MSA text available. Please upload an MSA PDF or DOCX file first.")
        
        # Try to get content from either processor (both use same output file)
        content = msa_pdf_processor.get_extracted_text()
        if content is None:
            content = msa_docx_processor.get_extracted_text()
        
        return {"text": content}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving MSA text: {str(e)}")

@app.get("/api/agents")
async def list_agents():
    """List all available AI agents"""
    try:
        agents = agent_system.list_agents()
        return {"agents": agents}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing agents: {str(e)}")

@app.post("/api/agents/execute")
async def execute_agent(request: AgentExecuteRequest):
    """Execute a specific AI agent"""
    try:
        result = await agent_system.execute_agent(request.agent_id)
        return AgentResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error executing agent: {str(e)}")

@app.post("/api/agents/execute-all")
async def execute_all_agents():
    """Execute all enabled AI agents"""
    try:
        results = await agent_system.execute_all_agents()
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error executing agents: {str(e)}")

@app.post("/api/agents/{agent_id}/enable")
async def enable_agent(agent_id: str):
    """Enable a specific AI agent"""
    try:
        result = agent_system.enable_agent(agent_id)
        if not result:
            raise HTTPException(status_code=404, detail=f"Agent not found: {agent_id}")
        return {"message": f"Agent {agent_id} enabled successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error enabling agent: {str(e)}")

@app.post("/api/agents/{agent_id}/disable")
async def disable_agent(agent_id: str):
    """Disable a specific AI agent"""
    try:
        result = agent_system.disable_agent(agent_id)
        if not result:
            raise HTTPException(status_code=404, detail=f"Agent not found: {agent_id}")
        return {"message": f"Agent {agent_id} disabled successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error disabling agent: {str(e)}")

@app.post("/api/agents/extract-project-info")
async def extract_project_info():
    """Convenience endpoint to execute project_info_extractor agent"""
    try:
        result = await agent_system.execute_agent("project_info_extractor")
        return AgentResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting project info: {str(e)}")

@app.post("/api/agents/analyze-risks")
async def analyze_risks():
    """Convenience endpoint to analyze project risks from design document"""
    try:
        result = await agent_system.execute_agent("risk_analyzer")
        if result["status"] == "success":
            return {
                "message": "Risks analyzed successfully",
                "output_file": result.get("output_file"),
                "result_preview": result.get("result_preview")
            }
        else:
            raise HTTPException(
                status_code=500, 
                detail=result.get("error", "Failed to analyze risks")
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing risks: {str(e)}")

@app.get("/api/ai-risks")
async def get_ai_risks():
    """Get risk assessment data from AI analysis"""
    try:
        ai_risks = get_ai_risk_assessment()
        if not ai_risks:
            return {
                "risks": [],
                "summary": {
                    "high_risk_count": 0,
                    "medium_risk_count": 0,
                    "low_risk_count": 0
                }
            }
              
        return ai_risks
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading AI risk assessment: {str(e)}")



# Run the server when executed directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)