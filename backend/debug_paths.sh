#!/bin/bash

echo "🔍 Debugging File Structure and .env Location"
echo "============================================="

cd /home/lenovo/cellexis/backend

echo "📁 Current directory: $(pwd)"
echo "📄 Files in current directory:"
ls -la | grep -E "\.(env|py)$"

echo ""
echo "🔍 Looking for .env files:"
find /home/lenovo/cellexis -name ".env" -type f 2>/dev/null

echo ""
echo "📄 If .env exists in backend, showing first few lines:"
if [ -f ".env" ]; then
    echo "✅ .env found in backend directory"
    head -3 .env
else
    echo "❌ .env not found in backend directory"
fi

echo ""
echo "🐍 Testing Python path resolution:"
python3 -c "
import os
print('Current working directory:', os.getcwd())
print('Script file location:', __file__ if '__file__' in globals() else 'N/A')

# Test the path resolution used in the code
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath('app/main.py')))
print('Backend dir (from app/main.py):', backend_dir)
env_path = os.path.join(backend_dir, '.env')
print('Calculated .env path:', env_path)
print('Env file exists:', os.path.exists(env_path))
"
