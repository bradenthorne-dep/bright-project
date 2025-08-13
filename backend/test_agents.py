"""
Test script for the AI Agent System
"""
import asyncio
import sys
from ai_agent_system import AIAgentSystem

async def test_agents():
    """Test the AI agent system functionality."""
    try:
        print("Initializing AI Agent System...")
        system = AIAgentSystem()
        
        print("\nAvailable agents:")
        agents = system.list_agents()
        for agent in agents:
            status = "Enabled" if agent["enabled"] else "Disabled"
            print(f"  - {agent['id']}: {agent['name']} ({agent['model']}) - {status}")
        
        print(f"\nTesting project_info_extractor...")
        result = await system.execute_agent('project_info_extractor')
        
        print(f"Status: {result['status']}")
        if result['status'] == 'success':
            print(f"Success! Output saved to: {result.get('output_file', 'N/A')}")
            if result.get('result_preview'):
                print(f"Preview: {result['result_preview'][:100]}...")
        else:
            print(f"Failed: {result.get('error', 'Unknown error')}")
        
        return result['status'] == 'success'
        
    except Exception as e:
        print(f"Test failed with error: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_agents())
    sys.exit(0 if success else 1)