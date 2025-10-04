#!/bin/bash

# Start the FastAPI backend server
echo "Starting Cellexis Backend Server..."
echo "Make sure you have:"
echo "1. FAISS index at data/faiss_index.idx"
echo "2. Chunk metadata at data/chunk_metadata.json"
echo "3. Neo4j Aura database connection configured"
echo "4. Gemini API key in .env file"
echo ""

cd /home/lenovo/cellexis/backend

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

# Install dependencies if needed
if [ ! -f "venv/pyvenv.cfg" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
fi

# Start the server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
