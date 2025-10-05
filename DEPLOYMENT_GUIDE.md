# Cellexis Deployment Guide

## 🚀 Frontend-Backend Integration Complete

Your frontend has been successfully configured to work with the hosted backend at `https://cellexis.onrender.com`.

## 📋 What's Been Updated

### 1. API Configuration
- ✅ Updated `frontend/client/lib/api.ts` to use hosted backend URL
- ✅ Created `frontend/client/lib/config.ts` for environment-based configuration
- ✅ All API endpoints now point to `https://cellexis.onrender.com`

### 2. Environment Setup
- ✅ Created deployment configuration files
- ✅ Updated Vercel configuration (`vercel.json`)
- ✅ Added production build scripts

### 3. Testing Infrastructure
- ✅ Created integration test script (`test-integration.js`)
- ✅ Added npm scripts for testing and building

## 🧪 How to Test the Integration

### Option 1: Test Backend Connection (When Render is Active)
```bash
cd frontend
node test-integration.js
```

This will test:
- ✅ Backend health check
- ✅ Database connection
- ✅ Search functionality
- ✅ Graph data retrieval

### Option 2: Test Frontend Locally
```bash
cd frontend
# Set environment variable
export VITE_API_URL=https://cellexis.onrender.com
# or on Windows:
# set VITE_API_URL=https://cellexis.onrender.com

# Start development server
pnpm dev
```

### Option 3: Build for Production
```bash
cd frontend
pnpm run build:production
```

## 🚀 Vercel Deployment Instructions

### Step 1: Environment Variables in Vercel
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:

```
VITE_API_URL = https://cellexis.onrender.com
VITE_GEMINI_API_KEY = your_gemini_api_key_here (optional)
```

### Step 2: Build Settings
In your Vercel project settings:
- **Framework Preset**: Vite
- **Build Command**: `pnpm build`
- **Output Directory**: `dist/spa`
- **Install Command**: `pnpm install`

### Step 3: Deploy
1. Push your changes to your Git repository
2. Vercel will automatically deploy
3. Your frontend will be available at your Vercel domain

## 🔧 Troubleshooting

### If Backend is Sleeping on Render:
1. **Wake up the backend**: Visit `https://cellexis.onrender.com/` in your browser
2. **Wait 30 seconds** for the backend to fully start
3. **Test the connection** using the integration test script

### If CORS Issues Occur:
The backend should already have CORS configured, but if you encounter issues:
1. Check that the backend is running
2. Verify the API URL is correct
3. Check browser console for specific error messages

### If Build Fails on Vercel:
1. **Check environment variables** are set correctly
2. **Verify build command** is `pnpm build`
3. **Check output directory** is `dist/spa`
4. **Review build logs** in Vercel dashboard

## 📊 Testing Checklist

### Before Deployment:
- [ ] Backend is running on Render
- [ ] Environment variables are set
- [ ] Local build works (`pnpm run build:production`)
- [ ] Integration test passes (`pnpm run test:integration`)

### After Deployment:
- [ ] Frontend loads without errors
- [ ] Search functionality works
- [ ] Graph visualization loads
- [ ] API calls are successful
- [ ] No CORS errors in browser console

## 🎯 Expected Behavior

### Working Integration:
1. **Frontend loads** at your Vercel domain
2. **Search queries** return AI-generated answers
3. **Graph visualization** shows knowledge graph
4. **Citations** display source papers
5. **Voice commands** work (if Gemini API key is set)

### API Endpoints Being Used:
- `https://cellexis.onrender.com/search-rag` - Main search
- `https://cellexis.onrender.com/graph` - Knowledge graph
- `https://cellexis.onrender.com/search-stats` - System statistics
- `https://cellexis.onrender.com/` - Health check

## 🚀 Quick Start Commands

```bash
# Test integration (when backend is awake)
cd frontend && pnpm run test:integration

# Build for production
cd frontend && pnpm run build:production

# Deploy to Vercel
# Just push to your Git repository - Vercel auto-deploys
```

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify the backend is running on Render
3. Test the backend endpoints directly
4. Check Vercel deployment logs

Your Cellexis platform is now ready for production deployment! 🎉
