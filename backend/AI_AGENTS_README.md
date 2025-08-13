# AI Agent System

A scalable AI agent system for document processing and information extraction, integrated with the existing FastAPI project management application.

## Features

- **Centralized Configuration**: All agent prompts and settings in `agent_config.json`
- **Claude Integration**: Uses Anthropic Claude Sonnet 4 via AWS Bedrock
- **Scalable Architecture**: Easy to add new agents without code changes
- **Error Handling**: Retry logic, backups, and comprehensive error handling
- **API Integration**: FastAPI endpoints for agent execution
- **Flexible Output**: JSON parsing with fallback to text output

## Files

- `agent_config.json` - Centralized configuration for all agents
- `ai_agent_system.py` - Core agent framework
- `test_agents.py` - Test script for agent functionality
- API endpoints added to `main.py`

## Available Agents

### project_info_extractor
- **Model**: Claude Sonnet 4
- **Purpose**: Extracts project information from design documents
- **Input**: `design_doc.txt`
- **Output**: `project_info.json`
- **Status**: Enabled

### task_extractor
- **Model**: Claude Sonnet 4
- **Purpose**: Extracts tasks and requirements from design documents
- **Output**: `extracted_tasks.json`
- **Status**: Disabled (can be enabled via API)

### risk_analyzer
- **Model**: Claude Sonnet 4
- **Purpose**: Analyzes project documents for potential risks
- **Output**: `risk_assessment.json`
- **Status**: Disabled (can be enabled via API)

## API Endpoints

- `GET /api/agents` - List all available agents
- `POST /api/agents/execute` - Execute a specific agent
- `POST /api/agents/execute-all` - Execute all enabled agents
- `POST /api/agents/{agent_id}/enable` - Enable an agent
- `POST /api/agents/{agent_id}/disable` - Disable an agent
- `POST /api/agents/extract-project-info` - Convenience endpoint for project info extraction

## Usage

### Command Line
```bash
python test_agents.py
```

### API Usage
```bash
# List agents
curl http://localhost:8000/api/agents

# Execute project info extractor
curl -X POST http://localhost:8000/api/agents/extract-project-info

# Execute specific agent
curl -X POST http://localhost:8000/api/agents/execute \
  -H "Content-Type: application/json" \
  -d '{"agent_id": "project_info_extractor"}'
```

### Python Usage
```python
from ai_agent_system import AIAgentSystem
import asyncio

async def main():
    system = AIAgentSystem()
    
    # List agents
    agents = system.list_agents()
    
    # Execute agent
    result = await system.execute_agent("project_info_extractor")
    print(result)

asyncio.run(main())
```

## Configuration

All agent configuration is centralized in `agent_config.json`:

- **Agent Settings**: Model, temperature, prompts, input/output files
- **API Configuration**: Claude model settings (AWS Bedrock)
- **System Settings**: Retry logic, timeouts, backup options

### Claude Configuration
The system uses AWS Bedrock to access Claude Sonnet 4:
- **Model**: `us.anthropic.claude-sonnet-4-20250514-v1:0`
- **Authentication**: AWS credentials via `~/.aws/credentials`
- **Region**: US East 1 (us-east-1)

## Adding New Agents

1. Add agent configuration to `agent_config.json`
2. No code changes required - the system automatically loads new agents
3. Enable the agent via API or configuration file

## Dependencies

- `anthropic>=0.7.0` - Anthropic API client
- `boto3>=1.28.0` - AWS SDK for Bedrock access

## Error Handling

- Automatic retry with exponential backoff
- File backup before overwriting
- Comprehensive logging
- Rate limit handling for Claude API

## Prerequisites

### AWS Configuration
1. **AWS Credentials**: Configure AWS credentials in `~/.aws/credentials`
2. **Bedrock Access**: Ensure your AWS account has access to Claude Sonnet 4 in Bedrock
3. **Region**: The system uses `us-east-1` region by default

### Example AWS Credentials Setup
```bash
# Configure AWS credentials
aws configure

# Or manually edit ~/.aws/credentials
[default]
aws_access_key_id = YOUR_ACCESS_KEY
aws_secret_access_key = YOUR_SECRET_KEY
region = us-east-1
```