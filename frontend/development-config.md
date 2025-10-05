# Development Configuration

## Local Development Setup

### Option 1: Use Local Backend
Create a `.env.local` file in the frontend directory:
```env
VITE_API_URL=http://localhost:8000
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Option 2: Use Hosted Backend (Current)
The frontend is configured to use `https://cellexis.onrender.com` by default.

## Quick Fixes for CORS Issues

### 1. Wake Up Backend
```bash
# Visit this URL to wake up the backend
open https://cellexis.onrender.com/
```

### 2. Test Backend Status
```bash
cd frontend
pnpm run wake-backend
```

### 3. Use Fallback Data
The frontend now includes fallback data when the backend is sleeping, so the app will still work with mock data.

## Environment Variables

### For Local Development:
```env
VITE_API_URL=http://localhost:8000
```

### For Production:
```env
VITE_API_URL=https://cellexis.onrender.com
```

## Troubleshooting

### If CORS errors persist:
1. **Backend is sleeping**: Visit `https://cellexis.onrender.com/` and wait 30-60 seconds
2. **CORS not deployed**: The backend changes need to be deployed to Render
3. **Use local backend**: Set `VITE_API_URL=http://localhost:8000` for local development

### Quick Commands:
```bash
# Wake up backend
cd frontend && pnpm run wake-backend

# Test CORS
cd frontend && pnpm run test-cors

# Build for production
cd frontend && pnpm run build:production
```
