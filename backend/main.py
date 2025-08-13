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
from pdf_processor import pdf_processor
from docx_processor import docx_processor
from ai_agent_system import AIAgentSystem

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
    enabled: bool
    model: str

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

# AI Agent System Endpoints

@app.get("/api/agents", response_model=List[AgentInfo])
async def list_agents():
    """Get list of available AI agents"""
    try:
        agents = agent_system.list_agents()
        return [AgentInfo(**agent) for agent in agents]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing agents: {str(e)}")

@app.post("/api/agents/execute", response_model=AgentResponse)
async def execute_agent(request: AgentExecuteRequest):
    """Execute a specific AI agent"""
    try:
        result = await agent_system.execute_agent(request.agent_id)
        return AgentResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error executing agent: {str(e)}")

@app.post("/api/agents/execute-all", response_model=List[AgentResponse])
async def execute_all_agents():
    """Execute all enabled AI agents"""
    try:
        results = await agent_system.execute_all_agents()
        return [AgentResponse(**result) for result in results]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error executing agents: {str(e)}")

@app.post("/api/agents/{agent_id}/enable")
async def enable_agent(agent_id: str):
    """Enable a specific AI agent"""
    try:
        success = agent_system.enable_agent(agent_id)
        if not success:
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
        success = agent_system.disable_agent(agent_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Agent not found: {agent_id}")
        return {"message": f"Agent {agent_id} disabled successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error disabling agent: {str(e)}")

@app.post("/api/agents/extract-project-info")
async def extract_project_info():
    """Convenience endpoint to extract project info from design document"""
    try:
        result = await agent_system.execute_agent("project_info_extractor")
        if result["status"] == "success":
            return {
                "message": "Project information extracted successfully",
                "output_file": result.get("output_file"),
                "result_preview": result.get("result_preview")
            }
        else:
            raise HTTPException(
                status_code=500, 
                detail=result.get("error", "Failed to extract project information")
            )
    except HTTPException:
        raise
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



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)