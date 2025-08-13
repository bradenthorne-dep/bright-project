# AI Agent System

A scalable AI agent system for document processing and information extraction, integrated with the existing FastAPI project management application.

## Features

- **Centralized Configuration**: All agent prompts and settings in `agent_config.json`
- **Claude Integration**: Uses Anthropic Claude Sonnet 4 via AWS Bedrock
- **Template-Based Output**: JSON templates ensure consistent output format
- **Multiple Input Files**: Agents can process multiple input documents
- **Scalable Architecture**: Easy to add new agents without code changes
- **Error Handling**: Retry logic, backups, and comprehensive error handling
- **API Integration**: FastAPI endpoints for agent execution
- **Consolidated Module**: Single `ai_agents.py` module for all functionality

## Files

- `agent_config.json` - Centralized configuration for all agents
- `ai_agents.py` - Consolidated agent system and execution module
- `json_templates/` - JSON templates for structured output
  - `project_info_template.json` - Template for project information
  - `tasks_template.json` - Template for task extraction
- API endpoints added to `main.py`

## Available Agents

### project_info_extractor
- **Model**: Claude Sonnet 4
- **Purpose**: Extracts project information from design documents
- **Input**: `design_doc.txt` (supports multiple files)
- **Output**: `ai_project_info.json`
- **Template**: `json_templates/project_info_template.json`
- **Status**: Enabled

### task_extractor
- **Model**: Claude Sonnet 4
- **Purpose**: Extracts tasks and requirements from design documents
- **Input**: `design_doc.txt` (supports multiple files)
- **Output**: `ai_tasks.json`
- **Template**: `json_templates/tasks_template.json`
- **Status**: Enabled

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
# Run all enabled agents
python ai_agents.py

# Or import and use programmatically
python -c "
import asyncio
from ai_agents import run_agents
asyncio.run(run_agents())
"
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
from ai_agents import AIAgentSystem, run_agents
import asyncio

# Option 1: Use the consolidated run_agents function
async def main():
    success = await run_agents()
    print(f"All agents completed successfully: {success}")

# Option 2: Use the AIAgentSystem class directly
async def main():
    system = AIAgentSystem()
    
    # List agents
    agents = system.list_agents()
    
    # Execute specific agent
    result = await system.execute_agent("project_info_extractor")
    print(result)
    
    # Execute all enabled agents
    results = await system.execute_all_agents()
    print(results)

asyncio.run(main())
```

## Configuration

All agent configuration is centralized in `agent_config.json`:

- **Agent Settings**: Model, temperature, prompts, input files (array), output files, templates
- **API Configuration**: Claude model settings (AWS Bedrock)
- **System Settings**: Retry logic, timeouts, backup options

### Input Files Configuration
Agents now support multiple input files:
```json
{
  "input_files": ["design_doc.txt", "requirements.txt", "specification.pdf"]
}
```

### Template System
Each agent uses a JSON template to ensure consistent output format:
- Templates are stored in `json_templates/` directory
- Templates define the exact structure agents should follow
- Agents populate template fields with extracted information

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