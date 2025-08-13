"""
Consolidated AI Agent System for document processing and information extraction.
"""
import asyncio
import json
import os
import shutil
from datetime import datetime
from typing import Any, Dict, List, Optional

from anthropic import AsyncAnthropicBedrock


class AIAgentSystem:
    """Scalable AI agent system for document processing and information extraction."""
    
    def __init__(self, config_path: str = "agent_config.json"):
        self.config_path = config_path
        self.config = self._load_config()
        self.claude_client = AsyncAnthropicBedrock()
    
    def _load_config(self) -> Dict[str, Any]:
        """Load agent configuration from JSON file."""
        with open(self.config_path, 'r') as f:
            return json.load(f)
    
    def _backup_file(self, file_path: str) -> Optional[str]:
        """Create a backup of the original file if backup is enabled."""
        if not self.config.get("settings", {}).get("backup_original_files", False):
            return None
        
        if not os.path.exists(file_path):
            return None
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = f"{file_path}.backup_{timestamp}"
        shutil.copy2(file_path, backup_path)
        return backup_path
    
    def _load_template(self, template_file: str) -> Optional[Dict[str, Any]]:
        """Load template file as a template structure."""
        if not template_file or not os.path.exists(template_file):
            return None
        
        with open(template_file, 'r', encoding='utf-8') as f:
            content = f.read().strip()
        
        if not content:
            return None
        
        return json.loads(content)
    
    async def _call_claude_api(self, prompt: str, agent_config: Dict[str, Any]) -> str:
        """Make API call to Claude via Bedrock."""
        model = self.config.get("api_config", {}).get("claude", {}).get("default_model", "us.anthropic.claude-sonnet-4-20250514-v1:0")
        max_tokens = agent_config.get("max_tokens", 2000)
        temperature = agent_config.get("temperature", 0.1)
        
        response = await self.claude_client.messages.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            messages=[{"role": "user", "content": prompt}]
        )
        
        return response.content[0].text
    
    async def _execute_agent(self, agent_id: str, agent_config: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a single agent."""
        # Read input files
        input_files = agent_config.get("input_files", [])
        
        input_content = ""
        if input_files:
            combined_content = []
            for file_path in input_files:
                if os.path.exists(file_path):
                    with open(file_path, 'r', encoding='utf-8') as f:
                        file_content = f.read()
                    combined_content.append(f"--- Content from {file_path} ---\n{file_content}\n")
            
            input_content = "\n".join(combined_content)
        
        # Prepare prompt with template if available
        base_prompt = agent_config.get("prompt", "")
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
        
        # Make API call to Claude with retry logic
        max_retries = self.config.get("settings", {}).get("max_retries", 3)
        
        for attempt in range(max_retries):
            try:
                result = await self._call_claude_api(full_prompt, agent_config)
                break
            except Exception as e:
                if attempt < max_retries - 1:
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
                else:
                    raise
        
        # Process and save result
        output_file = agent_config.get("output_file")
        if output_file:
            self._backup_file(output_file)
            
            try:
                # Clean up markdown formatting if present
                cleaned_result = result.strip()
                if cleaned_result.startswith('```json'):
                    cleaned_result = cleaned_result[7:]
                if cleaned_result.endswith('```'):
                    cleaned_result = cleaned_result[:-3]
                cleaned_result = cleaned_result.strip()
                
                parsed_result = json.loads(cleaned_result)
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(parsed_result, f, indent=2, ensure_ascii=False)
            except json.JSONDecodeError:
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write(result)
        
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
        with open(self.config_path, 'w') as f:
            json.dump(self.config, f, indent=2)


async def run_agents() -> bool:
    """Execute all enabled AI agents."""
    try:
        print("Initializing AI Agent System...")
        system = AIAgentSystem()
        
        print("\nAvailable agents:")
        agents = system.list_agents()
        for agent in agents:
            status = "Enabled" if agent["enabled"] else "Disabled"
            print(f"  - {agent['id']}: {agent['name']} ({agent['model']}) - {status}")
        
        enabled_agents = [agent for agent in agents if agent["enabled"]]
        all_success = True
        
        for agent in enabled_agents:
            print(f"\nExecuting {agent['id']}...")
            result = await system.execute_agent(agent['id'])
            
            print(f"Status: {result['status']}")
            if result['status'] == 'success':
                print(f"Success! Output saved to: {result.get('output_file', 'N/A')}")
                if result.get('result_preview'):
                    print(f"Preview: {result['result_preview'][:100]}...")
            else:
                print(f"Failed: {result.get('error', 'Unknown error')}")
                all_success = False
        
        return all_success
        
    except Exception as e:
        print(f"Execution failed with error: {e}")
        return False


def main():
    """Main entry point for running agents."""
    success = asyncio.run(run_agents())
    return success


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)