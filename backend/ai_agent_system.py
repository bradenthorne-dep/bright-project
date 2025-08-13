import asyncio
import json
import logging
import os
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from anthropic import AsyncAnthropicBedrock


class AIAgentSystem:
    """Scalable AI agent system for document processing and information extraction."""
    
    def __init__(self, config_path: str = "agent_config.json"):
        self.config_path = config_path
        self.config = self._load_config()
        self.logger = self._setup_logging()
        
        # Initialize API client
        self.claude_client = None
        self._init_api_client()
    
    def _load_config(self) -> Dict[str, Any]:
        """Load agent configuration from JSON file."""
        try:
            with open(self.config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            raise FileNotFoundError(f"Configuration file not found: {self.config_path}")
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in configuration file: {e}")
    
    def _setup_logging(self) -> logging.Logger:
        """Set up logging configuration."""
        log_level = self.config.get("settings", {}).get("log_level", "INFO")
        logging.basicConfig(
            level=getattr(logging, log_level),
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        return logging.getLogger(__name__)
    
    def _init_api_client(self):
        """Initialize Claude API client based on configuration."""
        try:
            # Initialize Claude client
            self.claude_client = AsyncAnthropicBedrock()
            self.logger.info("Claude client initialized successfully")
            
        except Exception as e:
            self.logger.error(f"Error initializing Claude client: {e}")
    
    def _backup_file(self, file_path: str) -> Optional[str]:
        """Create a backup of the original file if backup is enabled."""
        if not self.config.get("settings", {}).get("backup_original_files", True):
            return None
        
        if not os.path.exists(file_path):
            return None
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = f"{file_path}.backup_{timestamp}"
        
        try:
            shutil.copy2(file_path, backup_path)
            self.logger.info(f"Created backup: {backup_path}")
            return backup_path
        except Exception as e:
            self.logger.error(f"Failed to create backup for {file_path}: {e}")
            return None
    
    def _load_template(self, template_file: str) -> Optional[Dict[str, Any]]:
        """Load template file as a template structure."""
        if not template_file or not os.path.exists(template_file):
            return None
        
        try:
            with open(template_file, 'r', encoding='utf-8') as f:
                content = f.read().strip()
            
            if not content:
                return None
            
            # Try to parse as JSON
            template = json.loads(content)
            self.logger.info(f"Loaded template from {template_file}")
            return template
            
        except json.JSONDecodeError:
            self.logger.warning(f"Could not parse {template_file} as JSON template")
            return None
        except Exception as e:
            self.logger.error(f"Error loading template from {template_file}: {e}")
            return None
    
    async def _call_claude_api(self, prompt: str, agent_config: Dict[str, Any]) -> str:
        """Make API call to Claude via Bedrock."""
        if not self.claude_client:
            raise ValueError("Claude client not initialized")
        
        try:
            model = self.config.get("api_config", {}).get("claude", {}).get("default_model", "us.anthropic.claude-sonnet-4-20250514-v1:0")
            max_tokens = agent_config.get("max_tokens", 2000)
            temperature = agent_config.get("temperature", 0.1)
            
            self.logger.info(f"Making Claude API call with model: {model}")
            self.logger.info(f"API parameters - max_tokens: {max_tokens}, temperature: {temperature}")
            self.logger.info(f"Prompt length being sent: {len(prompt)} characters")
            self.logger.info(f"Prompt preview: '{prompt[:300]}...'")
            
            response = await self.claude_client.messages.create(
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[{"role": "user", "content": prompt}]
            )
            
            # Extract content from Claude response
            content = response.content[0].text
            self.logger.info(f"Claude response length: {len(content)} characters")
            self.logger.info(f"Claude response preview: '{content[:200]}...'")
            
            return content
            
        except Exception as e:
            self.logger.error(f"Claude API call failed: {e}")
            raise
    
    
    async def _execute_agent(self, agent_id: str, agent_config: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a single agent."""
        self.logger.info(f"Executing agent: {agent_id}")
        
        # Read input file (optional for testing)
        input_file = agent_config.get("input_file")
        self.logger.info(f"Input file: {input_file}")
        
        input_content = ""
        if input_file and os.path.exists(input_file):
            try:
                with open(input_file, 'r', encoding='utf-8') as f:
                    input_content = f.read()
                self.logger.info(f"Input content length: {len(input_content)} characters")
                self.logger.info(f"Input content preview: {input_content[:100]}...")
            except Exception as e:
                self.logger.warning(f"Error reading input file {input_file}: {e}")
                input_content = ""
        else:
            self.logger.info("No input file specified or file not found, using prompt only")
        
        # Prepare prompt with template if available
        base_prompt = agent_config.get("prompt", "")
        self.logger.info(f"Base prompt: '{base_prompt}'")
        
        # Load template from template file if specified
        template_file = agent_config.get("template_file")
        template = self._load_template(template_file) if template_file else None
        
        if template:
            template_str = f"\n\nUse this exact JSON structure as your template:\n{json.dumps(template, indent=2)}\n\nFill in the values based on the document content, but maintain this exact structure and field names."
        else:
            template_str = ""
        
        if input_content:
            full_prompt = f"{base_prompt}{template_str}\n\nDocument to analyze:\n{input_content}"
        else:
            full_prompt = f"{base_prompt}{template_str}"
            
        self.logger.info(f"Full prompt length: {len(full_prompt)} characters")
        self.logger.info(f"Template included: {bool(template)}")
        self.logger.info(f"Full prompt preview: {full_prompt[:200]}...")
        
        # Make API call to Claude
        max_retries = self.config.get("settings", {}).get("max_retries", 3)
        
        for attempt in range(max_retries):
            try:
                result = await self._call_claude_api(full_prompt, agent_config)
                break
                
            except Exception as e:
                if attempt < max_retries - 1:
                    self.logger.warning(f"Attempt {attempt + 1} failed for agent {agent_id}: {e}. Retrying...")
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
                else:
                    raise
        
        # Process and save result
        output_file = agent_config.get("output_file")
        if output_file:
            # Backup existing file if it exists
            self._backup_file(output_file)
            
            # Try to parse as JSON for validation
            try:
                # Clean up markdown formatting if present
                cleaned_result = result.strip()
                if cleaned_result.startswith('```json'):
                    cleaned_result = cleaned_result[7:]  # Remove ```json
                if cleaned_result.endswith('```'):
                    cleaned_result = cleaned_result[:-3]  # Remove ```
                cleaned_result = cleaned_result.strip()
                
                parsed_result = json.loads(cleaned_result)
                # Write formatted JSON
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(parsed_result, f, indent=2, ensure_ascii=False)
                self.logger.info(f"Results saved to: {output_file}")
            except json.JSONDecodeError:
                # If not valid JSON, save as text
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write(result)
                self.logger.warning(f"Result was not valid JSON, saved as text to: {output_file}")
        
        return {
            "agent_id": agent_id,
            "status": "success",
            "output_file": output_file,
            "result_preview": result[:200] + "..." if len(result) > 200 else result
        }
    
    async def execute_agent(self, agent_id: str) -> Dict[str, Any]:
        """Execute a specific agent by ID."""
        agents = self.config.get("agents", {})
        
        if agent_id not in agents:
            raise ValueError(f"Agent not found: {agent_id}")
        
        agent_config = agents[agent_id]
        
        if not agent_config.get("enabled", True):
            return {
                "agent_id": agent_id,
                "status": "skipped",
                "message": "Agent is disabled"
            }
        
        try:
            return await self._execute_agent(agent_id, agent_config)
        except Exception as e:
            self.logger.error(f"Agent {agent_id} failed: {e}")
            return {
                "agent_id": agent_id,
                "status": "error",
                "error": str(e)
            }
    
    async def execute_all_agents(self) -> List[Dict[str, Any]]:
        """Execute all enabled agents."""
        agents = self.config.get("agents", {})
        results = []
        
        for agent_id, agent_config in agents.items():
            if agent_config.get("enabled", True):
                result = await self.execute_agent(agent_id)
                results.append(result)
            else:
                results.append({
                    "agent_id": agent_id,
                    "status": "skipped",
                    "message": "Agent is disabled"
                })
        
        return results
    
    def list_agents(self) -> List[Dict[str, Any]]:
        """List all available agents."""
        agents = self.config.get("agents", {})
        return [
            {
                "id": agent_id,
                "name": config.get("name", agent_id),
                "description": config.get("description", ""),
                "enabled": config.get("enabled", True),
                "model": "claude"
            }
            for agent_id, config in agents.items()
        ]
    
    def enable_agent(self, agent_id: str) -> bool:
        """Enable a specific agent."""
        if agent_id in self.config.get("agents", {}):
            self.config["agents"][agent_id]["enabled"] = True
            self._save_config()
            return True
        return False
    
    def disable_agent(self, agent_id: str) -> bool:
        """Disable a specific agent."""
        if agent_id in self.config.get("agents", {}):
            self.config["agents"][agent_id]["enabled"] = False
            self._save_config()
            return True
        return False
    
    def _save_config(self):
        """Save current configuration to file."""
        try:
            with open(self.config_path, 'w') as f:
                json.dump(self.config, f, indent=2)
        except Exception as e:
            self.logger.error(f"Failed to save configuration: {e}")


async def main():
    """Example usage of the AI Agent System."""
    try:
        # Initialize the agent system
        agent_system = AIAgentSystem()
        
        # List available agents
        agents = agent_system.list_agents()
        print("Available agents:")
        for agent in agents:
            status = "✓" if agent["enabled"] else "✗"
            print(f"  {status} {agent['id']}: {agent['name']}")
        
        # Execute the project info extractor
        print("\nExecuting project_info_extractor...")
        result = await agent_system.execute_agent("project_info_extractor")
        print(f"Result: {result}")
        
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    asyncio.run(main())