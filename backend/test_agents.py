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
        
        # Test all enabled agents
        enabled_agents = [agent for agent in agents if agent["enabled"]]
        all_success = True
        
        for agent in enabled_agents:
            print(f"\nTesting {agent['id']}...")
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
        print(f"Test failed with error: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_agents())
    sys.exit(0 if success else 1)