#!/bin/bash

echo "🔍 Testing Environment Variables Loading"
echo "======================================"

cd /home/lenovo/cellexis/backend

# Check if .env file exists
if [ -f ".env" ]; then
    echo "✅ .env file found"
    echo "📄 Contents of .env file:"
    cat .env | head -5
    echo "..."
else
    echo "❌ .env file not found in backend directory"
    exit 1
fi

echo ""
echo "🐍 Testing Python environment loading..."

# Test environment loading
python3 -c "
import os
from dotenv import load_dotenv

# Load from the correct path - we're already in backend directory
env_path = os.path.join(os.getcwd(), '.env')
print(f'Current directory: {os.getcwd()}')
print(f'Loading .env from: {env_path}')

load_dotenv(env_path)

neo4j_uri = os.getenv('NEO4J_URI')
gemini_key = os.getenv('GEMINI_API_KEY')

print(f'NEO4J_URI: {\"✅ Set\" if neo4j_uri else \"❌ Not set\"}')
print(f'GEMINI_API_KEY: {\"✅ Set\" if gemini_key else \"❌ Not set\"}')

if neo4j_uri:
    print(f'NEO4J_URI value: {neo4j_uri[:20]}...')
if gemini_key:
    print(f'GEMINI_API_KEY value: {gemini_key[:10]}...')
"

echo ""
echo "🚀 Now testing FastAPI import..."

# Test FastAPI import
python3 -c "
try:
    from app.main import app
    print('✅ FastAPI app imports successfully')
    print('✅ All environment variables loaded correctly')
except Exception as e:
    print(f'❌ FastAPI import failed: {e}')
    exit(1)
"
