#!/bin/bash

# Production Build Script for Cellexis Frontend
echo "🚀 Building Cellexis Frontend for Production..."

# Set production environment variables
export VITE_API_URL=https://cellexis.onrender.com
export VITE_GEMINI_API_KEY=${GEMINI_API_KEY:-""}

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build for production
echo "🔨 Building for production..."
pnpm build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Output directory: dist/spa"
    echo "🌐 Ready for deployment to Vercel"
else
    echo "❌ Build failed!"
    exit 1
fi
