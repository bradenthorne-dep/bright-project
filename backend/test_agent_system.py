import logging
logging.basicConfig(level=logging.DEBUG)

from ai_agent_system import AIAgentSystem

print('Attempting to initialize AI agent system...')
try:
    agent_system = AIAgentSystem()
    print('AI agent system initialized successfully')
except Exception as e:
    print(f'Error initializing AI agent system: {str(e)}')