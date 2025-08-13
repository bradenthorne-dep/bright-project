import logging
import asyncio
logging.basicConfig(level=logging.DEBUG)

from ai_agent_system import AIAgentSystem

async def test_risk_analyzer():
    print('Attempting to initialize AI agent system...')
    try:
        agent_system = AIAgentSystem()
        print('AI agent system initialized successfully')
        
        # List available agents
        agents = agent_system.list_agents()
        print("\nAvailable agents:")
        for agent in agents:
            status = "✓" if agent["enabled"] else "✗"
            print(f"  {status} {agent['id']}: {agent['name']}")
        
        # Execute the risk analyzer agent
        print("\nExecuting risk_analyzer...")
        result = await agent_system.execute_agent("risk_analyzer")
        print(f"Result status: {result['status']}")
        if result['status'] == 'success':
            print(f"Output file: {result.get('output_file')}")
            print(f"Preview: {result.get('result_preview')[:200]}...")
        else:
            print(f"Error: {result.get('error')}")
        
    except Exception as e:
        print(f'Error testing risk analyzer: {str(e)}')

if __name__ == "__main__":
    asyncio.run(test_risk_analyzer())