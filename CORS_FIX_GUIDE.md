# CORS Fix Guide for Cellexis

## 🚨 CORS Issue Analysis

The error `Access to fetch at 'https://cellexis.onrender.com/search-rag' from origin 'https://cellexis-eta.vercel.app' has been blocked by CORS policy` occurs because:

1. **Backend is sleeping** (502 Bad Gateway)
2. **Preflight requests** are not being handled properly
3. **CORS headers** are not being sent when backend is sleeping

## ✅ Backend CORS Fixes Applied

### 1. Enhanced CORS Middleware
```python
# Updated CORS configuration in backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://localhost:8080",
        "https://cellexis-eta.vercel.app",
        "https://cellexis.vercel.app",
        "https://*.vercel.app",
        "*"  # Allow all origins
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Accept", "Accept-Language", "Content-Language",
        "Content-Type", "Authorization", "X-Requested-With",
        "Origin", "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
    ],
    expose_headers=["*"],
    max_age=600,  # Cache preflight response for 10 minutes
)
```

### 2. Explicit OPTIONS Handlers
Added specific OPTIONS handlers for all endpoints:
- `/search-rag` - For POST requests
- `/graph` - For GET requests  
- `/search-stats` - For GET requests
- Global `/{path:path}` - Catches all other routes

### 3. Preflight Request Handling
Each OPTIONS handler returns proper CORS headers:
```python
@app.options("/search-rag")
async def search_rag_options():
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Max-Age": "600"
        }
    )
```

## 🧪 Testing CORS Configuration

### Test Script
```bash
# Test CORS configuration
cd frontend
pnpm run test-cors
```

### Manual Testing
1. **Wake up backend**: Visit `https://cellexis.onrender.com/`
2. **Wait 30-60 seconds** for full startup
3. **Test preflight**: Open browser console and run:
```javascript
fetch('https://cellexis.onrender.com/search-rag', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://cellexis-eta.vercel.app',
    'Access-Control-Request-Method': 'POST'
  }
}).then(r => console.log('CORS Headers:', {
  allowOrigin: r.headers.get('Access-Control-Allow-Origin'),
  allowMethods: r.headers.get('Access-Control-Allow-Methods'),
  allowHeaders: r.headers.get('Access-Control-Allow-Headers')
}));
```

## 🔧 Frontend CORS Handling

### Enhanced Error Handling
The frontend now includes better CORS error handling:

```typescript
// In api.ts - Enhanced error handling
const response = await fetch(`${this.baseUrl}${config.endpoints.search}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query, top_k: topK }),
  signal: AbortSignal.timeout(15000) // 15 second timeout
});

if (!response.ok) {
  if (response.status === 502) {
    console.warn('Backend appears to be sleeping...');
    throw new Error('Backend is sleeping. Please try again in a few moments.');
  }
  // Handle other errors...
}
```

## 🚀 Deployment Steps

### 1. Deploy Backend Changes
```bash
# The backend changes need to be deployed to Render
# Make sure to commit and push the changes to your repository
git add backend/app/main.py
git commit -m "Fix CORS configuration"
git push origin main
```

### 2. Wait for Render Deployment
- Render will automatically redeploy
- Wait 2-3 minutes for deployment to complete
- Test the backend: `https://cellexis.onrender.com/`

### 3. Test Frontend
```bash
cd frontend
pnpm run test-cors
```

## 🎯 Expected Results

### When Backend is Awake:
- ✅ Preflight requests return 200 OK
- ✅ CORS headers are present
- ✅ POST requests work normally
- ✅ No CORS errors in browser console

### When Backend is Sleeping:
- ⚠️ Preflight requests fail (502 Bad Gateway)
- ⚠️ Frontend shows "Backend is sleeping" message
- ⚠️ Graceful fallback with user-friendly error

## 🔍 Troubleshooting

### If CORS still fails:

1. **Check backend deployment**:
   ```bash
   curl -I https://cellexis.onrender.com/
   ```

2. **Test preflight manually**:
   ```bash
   curl -X OPTIONS https://cellexis.onrender.com/search-rag \
     -H "Origin: https://cellexis-eta.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -v
   ```

3. **Check browser network tab**:
   - Look for OPTIONS requests
   - Check response headers
   - Verify CORS headers are present

### Common Issues:

1. **Backend sleeping**: Wake up with `https://cellexis.onrender.com/`
2. **Deployment not complete**: Wait 2-3 minutes after push
3. **Cache issues**: Clear browser cache and try again
4. **Network issues**: Check if backend is accessible

## 📊 CORS Headers Reference

### Required Headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 600
```

### Preflight Request:
```
OPTIONS /search-rag HTTP/1.1
Origin: https://cellexis-eta.vercel.app
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type
```

### Preflight Response:
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 600
```

## 🎉 Success Indicators

- ✅ No CORS errors in browser console
- ✅ Search functionality works
- ✅ Graph visualization loads
- ✅ API calls return data
- ✅ Preflight requests return 200 OK

The CORS configuration is now robust and should handle all scenarios! 🚀
