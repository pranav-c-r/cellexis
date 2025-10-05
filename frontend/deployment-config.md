# Deployment Configuration

## Environment Variables

### For Vercel Deployment:

1. **VITE_API_URL**: `https://cellexis.onrender.com`
2. **VITE_GEMINI_API_KEY**: Your Gemini API key (optional, for voice features)

### For Local Development:

1. **VITE_API_URL**: `http://localhost:8000` (for local backend)
2. **VITE_GEMINI_API_KEY**: Your Gemini API key (optional)

## Vercel Configuration

### Environment Variables in Vercel Dashboard:
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:

```
VITE_API_URL = https://cellexis.onrender.com
VITE_GEMINI_API_KEY = your_gemini_api_key_here
```

### Build Settings:
- **Framework Preset**: Vite
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

## Testing Configuration

### Local Testing:
1. Set `VITE_API_URL=http://localhost:8000` in your local environment
2. Run backend locally: `cd backend && uvicorn app.main:app --reload`
3. Run frontend: `cd frontend && pnpm dev`

### Production Testing:
1. Set `VITE_API_URL=https://cellexis.onrender.com`
2. Deploy to Vercel with environment variables
3. Test the deployed frontend with the hosted backend
