# Cellexis Troubleshooting Guide

## 🚨 Common Issues and Solutions

### 1. CORS Policy Error
**Error**: `Access to fetch at 'https://cellexis.onrender.com/search-stats' from origin 'https://cellexis-eta.vercel.app' has been blocked by CORS policy`

**Solution**: 
- The backend CORS is already configured to allow all origins
- This error usually means the backend is sleeping (502 Bad Gateway)

### 2. 502 Bad Gateway Error
**Error**: `GET https://cellexis.onrender.com/search-stats net::ERR_FAILED 502 (Bad Gateway)`

**Cause**: Render free tier puts apps to sleep after 15 minutes of inactivity

**Solutions**:

#### Option A: Wake up the backend manually
```bash
# Run the wake-up script
cd frontend
pnpm run wake-backend
```

#### Option B: Visit the backend URL directly
1. Open `https://cellexis.onrender.com/` in your browser
2. Wait 30-60 seconds for the backend to fully start
3. Try your frontend again

#### Option C: Use the wake-up script in browser console
```javascript
// Open browser console and run:
fetch('https://cellexis.onrender.com/')
  .then(response => response.json())
  .then(data => console.log('Backend awake:', data))
  .catch(error => console.log('Still sleeping:', error));
```

### 3. Backend Sleeping Prevention

#### For Development:
- Keep the backend URL open in a browser tab
- Use a service like UptimeRobot to ping your backend every 14 minutes
- Consider upgrading to Render's paid plan for always-on hosting

#### For Production:
- Upgrade to Render's paid plan ($7/month for always-on)
- Or implement a keep-alive mechanism

### 4. Frontend Error Handling

The frontend now includes better error handling:

#### Search Stats:
- Returns mock data when backend is sleeping
- Shows "Backend Sleeping" status in UI
- Graceful fallback for unavailable data

#### Search Functionality:
- 15-second timeout for search requests
- Clear error messages for sleeping backend
- User-friendly error messages

### 5. Testing Backend Status

#### Check if backend is awake:
```bash
curl https://cellexis.onrender.com/
```

#### Expected response when awake:
```json
{"message": "Backend is running"}
```

#### Expected response when sleeping:
- Connection timeout
- 502 Bad Gateway
- No response

### 6. Render Backend Configuration

Make sure your Render backend has:

#### Environment Variables:
```
GEMINI_API_KEY=your_gemini_api_key
NEO4J_URI=your_neo4j_uri
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
```

#### Build Command:
```
pip install -r requirements.txt
```

#### Start Command:
```
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### 7. Vercel Frontend Configuration

Make sure your Vercel project has:

#### Environment Variables:
```
VITE_API_URL=https://cellexis.onrender.com
VITE_GEMINI_API_KEY=your_gemini_api_key (optional)
```

#### Build Settings:
- Framework: Vite
- Build Command: `pnpm build`
- Output Directory: `dist/spa`
- Install Command: `pnpm install`

### 8. Quick Fixes

#### If search doesn't work:
1. Check if backend is awake: `https://cellexis.onrender.com/`
2. Wait 30-60 seconds if it was sleeping
3. Try the search again
4. Check browser console for specific errors

#### If graph doesn't load:
1. Same as above - backend might be sleeping
2. Check Neo4j connection in backend logs
3. Verify environment variables are set

#### If voice commands don't work:
1. Check if `VITE_GEMINI_API_KEY` is set in Vercel
2. Verify the API key is valid
3. Check browser console for Gemini API errors

### 9. Monitoring Backend Health

#### Add to your frontend dashboard:
```javascript
// Check backend health
const checkBackendHealth = async () => {
  try {
    const response = await fetch('https://cellexis.onrender.com/');
    const data = await response.json();
    console.log('Backend status:', data);
    return true;
  } catch (error) {
    console.log('Backend is sleeping or unavailable');
    return false;
  }
};
```

### 10. Production Recommendations

#### For Always-On Backend:
1. **Upgrade Render Plan**: $7/month for always-on hosting
2. **Use Railway**: Alternative hosting with better free tier
3. **Use Heroku**: More reliable for production apps

#### For Better Error Handling:
1. Implement retry logic in frontend
2. Add loading states for backend wake-up
3. Show user-friendly messages for sleeping backend

## 🎯 Quick Commands

```bash
# Wake up backend
cd frontend && pnpm run wake-backend

# Test integration
cd frontend && pnpm run test:integration

# Build for production
cd frontend && pnpm run build:production
```

## 📞 Still Having Issues?

1. Check Render backend logs in dashboard
2. Verify all environment variables are set
3. Test backend endpoints directly
4. Check Vercel deployment logs
5. Verify CORS configuration

The most common issue is the sleeping backend - just wake it up and you should be good to go! 🚀
