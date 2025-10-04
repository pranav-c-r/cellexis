#!/bin/bash

echo "🚀 Starting Cellexis Backend (Simple Version)"
echo "============================================="

cd /home/lenovo/cellexis/backend

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "✅ Virtual environment activated"
else
    echo "❌ Virtual environment not found"
    exit 1
fi

# Set PYTHONPATH to include backend directory
export PYTHONPATH="/home/lenovo/cellexis/backend:$PYTHONPATH"

echo "🔧 PYTHONPATH set to: $PYTHONPATH"
echo ""

# Test imports first
echo "🧪 Testing imports..."
python3 -c "
import sys
print('Python path:', sys.path[:3])
try:
    from app.main import app
    print('✅ FastAPI app imported successfully')
except Exception as e:
    print(f'❌ Import failed: {e}')
    sys.exit(1)
"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎯 Starting server..."
    echo "Backend: http://localhost:8000"
    echo "API Docs: http://localhost:8000/docs"
    echo ""
    
    # Start uvicorn
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
else
    echo "❌ Import test failed, not starting server"
    exit 1
fi
