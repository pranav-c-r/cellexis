#!/bin/bash

echo "🚀 Testing Cellexis Backend Integration"
echo "======================================"

cd /home/lenovo/cellexis/backend

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "✅ Virtual environment activated"
else
    echo "❌ Virtual environment not found"
    exit 1
fi

# Test basic imports
echo "🔍 Testing Python imports..."
python3 -c "
try:
    from app.main import app
    print('✅ FastAPI app imports successfully')
except Exception as e:
    print(f'❌ FastAPI import failed: {e}')
    exit(1)

try:
    from app.neo4j_client import driver
    if driver:
        print('✅ Neo4j driver initialized')
    else:
        print('⚠️ Neo4j driver not initialized (check .env file)')
except Exception as e:
    print(f'❌ Neo4j import failed: {e}')

try:
    from app.rag_service import get_rag_service
    rag = get_rag_service()
    print('✅ RAG service initialized')
except Exception as e:
    print(f'❌ RAG service import failed: {e}')
"

echo ""
echo "🎯 Starting backend server..."
echo "Backend will be available at: http://localhost:8000"
echo "API docs will be at: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
