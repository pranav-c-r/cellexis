#!/bin/bash

# Start the frontend development server
echo "Starting Cellexis Frontend..."
echo "Make sure the backend is running on http://localhost:8000"
echo ""

cd /home/lenovo/cellexis/frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    pnpm install
fi

# Start the development server
pnpm dev
