# Cellexis Deployment Guide

This guide covers deploying Cellexis to production environments, including cloud platforms and self-hosted solutions.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Monitoring & Logging](#monitoring--logging)
- [Security Considerations](#security-considerations)
- [Backup & Recovery](#backup--recovery)
- [Troubleshooting](#troubleshooting)

## Overview

Cellexis consists of three main components that need to be deployed:

1. **Backend API** (FastAPI/Python)
2. **Frontend Web App** (React/TypeScript)
3. **Database** (Neo4j Graph Database)

### Architecture

```
Internet → CDN/Load Balancer → Frontend (Static Files)
                             ↓
Internet → API Gateway → Backend API → Neo4j Database
                         ↓
                    Google AI Services
```

## Prerequisites

### Required Accounts & Services

- **Google AI Studio**: For API key ([aistudio.google.com](https://aistudio.google.com))
- **Neo4j AuraDB**: For cloud database ([neo4j.com/cloud/aura](https://neo4j.com/cloud/aura))
- **Firebase**: For authentication ([console.firebase.google.com](https://console.firebase.google.com))
- **Render**: For backend hosting ([render.com](https://render.com))
- **Netlify/Vercel**: For frontend hosting

### Local Requirements

- **Git** for version control
- **Node.js 16+** for frontend builds
- **Python 3.8+** for backend testing

## Backend Deployment

### Option 1: Render (Recommended)

Render provides excellent support for Python applications with automatic deployments.

#### 1. Repository Setup

```bash
# Ensure your backend code is in a Git repository
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### 2. Render Configuration

1. **Connect Repository**
   - Go to [render.com](https://render.com)
   - Create new account or sign in
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Service Configuration**
   ```yaml
   Name: cellexis-backend
   Environment: Python 3
   Region: Oregon (US West) or closest to your users
   Branch: main
   Root Directory: backend
   ```

3. **Build & Start Commands**
   ```bash
   # Build Command
   pip install -r requirements.txt

   # Start Command  
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

4. **Environment Variables**
   ```bash
   # Required
   GOOGLE_API_KEY=your_google_api_key_here
   NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
   NEO4J_USERNAME=neo4j
   NEO4J_PASSWORD=your_secure_password

   # Optional
   PYTHON_VERSION=3.8.10
   LOG_LEVEL=INFO
   ```

#### 3. Custom Domain (Optional)

```bash
# In Render dashboard:
# Settings → Custom Domains → Add Custom Domain
# Example: api.cellexis.com
```

### Option 2: Railway

Alternative deployment platform with similar features to Render.

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway deploy
```

### Option 3: Google Cloud Run

For more advanced deployment with better scaling:

#### 1. Create Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.8-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

#### 2. Deploy to Cloud Run

```bash
# Install Google Cloud CLI
# https://cloud.google.com/sdk/docs/install

# Login and set project
gcloud auth login
gcloud config set project your-project-id

# Deploy
gcloud run deploy cellexis-backend \
  --source . \
  --port 8080 \
  --allow-unauthenticated \
  --region us-central1
```

## Frontend Deployment

### Option 1: Netlify (Recommended)

Netlify provides excellent static site hosting with automatic deployments.

#### 1. Build Configuration

Create `netlify.toml` in frontend root:

```toml
[build]
  base = "frontend/"
  publish = "dist/"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  VITE_API_URL = "https://your-backend.onrender.com"

[context.deploy-preview.environment]
  VITE_API_URL = "https://your-backend.onrender.com"
```

#### 2. Deployment Steps

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - "Add new site" → "Import an existing project"
   - Connect your GitHub repository

2. **Build Settings**
   ```yaml
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/dist
   ```

3. **Environment Variables**
   ```bash
   VITE_API_URL=https://your-backend.onrender.com
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcd1234
   ```

#### 3. Custom Domain

```bash
# In Netlify dashboard:
# Domain settings → Add custom domain
# Example: cellexis.com or app.cellexis.com
```

### Option 2: Vercel

Similar to Netlify with excellent Next.js support:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from frontend directory
cd frontend
vercel --prod
```

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Option 3: AWS S3 + CloudFront

For enterprise-level hosting:

#### 1. Build and Upload

```bash
# Build the application
cd frontend
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete
```

#### 2. CloudFront Distribution

```bash
# Create CloudFront distribution pointing to S3
# Configure custom domain and SSL certificate
```

## Database Setup

### Neo4j AuraDB (Recommended)

#### 1. Create Instance

1. Go to [neo4j.com/cloud/aura](https://neo4j.com/cloud/aura)
2. "Create Free Instance"
3. Choose region closest to your backend
4. Generate and save credentials securely

#### 2. Connection Configuration

```bash
# Example connection string
NEO4J_URI=neo4j+s://abcd1234.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-generated-password
```

#### 3. Data Loading

```bash
# From your local machine, load initial data
cd backend
python create_embeddings.py
python extract_entities.py
```

### Self-Hosted Neo4j

For more control or cost savings:

#### 1. Docker Deployment

```yaml
# docker-compose.yml
version: '3.8'
services:
  neo4j:
    image: neo4j:5.15
    restart: unless-stopped
    ports:
      - 7474:7474
      - 7687:7687
    volumes:
      - neo4j_data:/data
      - neo4j_logs:/logs
    environment:
      NEO4J_AUTH: neo4j/your-secure-password
      NEO4J_PLUGINS: '["graph-data-science"]'
      NEO4J_dbms_security_procedures_unrestricted: gds.*
      NEO4J_dbms_memory_heap_initial__size: 2G
      NEO4J_dbms_memory_heap_max__size: 4G
      NEO4J_dbms_memory_pagecache_size: 2G

volumes:
  neo4j_data:
  neo4j_logs:
```

#### 2. Start Database

```bash
docker-compose up -d
```

## Environment Configuration

### Production Environment Variables

#### Backend (.env)

```bash
# API Services
GOOGLE_API_KEY=your_production_api_key
OLLAMA_BASE_URL=http://localhost:11434

# Database
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_secure_password

# Application
LOG_LEVEL=INFO
DEBUG=False
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Optional: Rate Limiting
RATE_LIMIT_ENABLED=True
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
```

#### Frontend (.env.production)

```bash
# API
VITE_API_URL=https://your-backend.onrender.com

# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcd1234

# Optional: Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Monitoring & Logging

### Application Monitoring

#### 1. Health Check Endpoints

Ensure your backend has health endpoints:

```python
# Already implemented in app/main.py
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

@app.get("/pingdb")
async def ping_database():
    # Test database connection
    pass
```

#### 2. Uptime Monitoring

Set up monitoring with services like:

- **UptimeRobot**: Free website monitoring
- **Pingdom**: Professional uptime monitoring
- **StatusCake**: Alternative monitoring service

Example configuration:
```bash
# Monitor these endpoints every 5 minutes
https://your-backend.onrender.com/health
https://yourdomain.com

# Alert contacts
- Email: alerts@yourdomain.com
- Slack: #alerts channel
```

### Error Tracking

#### 1. Sentry Setup (Recommended)

**Backend:**
```python
# pip install sentry-sdk[fastapi]

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[FastApiIntegration(auto_enabling=True)],
    traces_sample_rate=1.0,
)
```

**Frontend:**
```typescript
// npm install @sentry/react @sentry/tracing

import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
});
```

### Logging Configuration

#### Backend Logging

```python
# app/main.py
import logging
from pythonjsonlogger import jsonlogger

# Configure logging
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)
logger = logging.getLogger()
logger.addHandler(logHandler)
logger.setLevel(logging.INFO)
```

#### Log Aggregation

For production, consider:
- **Render Logs**: Built-in logging dashboard
- **Datadog**: Professional log management
- **ELK Stack**: Self-hosted logging solution

## Security Considerations

### HTTPS/SSL

#### 1. Automatic SSL

Both Render and Netlify provide automatic SSL certificates:
- Render: Automatic for `.onrender.com` domains
- Netlify: Automatic for all domains via Let's Encrypt

#### 2. Custom Domain SSL

```bash
# Netlify: Automatic with custom domains
# Render: Automatic with custom domains
# Both services handle certificate renewal
```

### CORS Configuration

```python
# app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://yourdomain.com",
        "https://www.yourdomain.com",
        "https://your-netlify-app.netlify.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### API Security

#### 1. Rate Limiting

```python
# pip install slowapi

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/search-rag")
@limiter.limit("30/minute")
async def search_rag(request: Request, ...):
    pass
```

#### 2. Input Validation

```python
from pydantic import BaseModel, validator

class SearchRequest(BaseModel):
    query: str
    top_k: int = 5
    
    @validator('query')
    def query_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Query cannot be empty')
        return v
    
    @validator('top_k')
    def top_k_must_be_reasonable(cls, v):
        if v < 1 or v > 20:
            raise ValueError('top_k must be between 1 and 20')
        return v
```

### Environment Variables Security

Never commit sensitive data:

```bash
# .gitignore
.env
.env.production
.env.local
```

Use platform-specific secure variable storage:
- Render: Environment variables dashboard
- Netlify: Environment variables settings
- Vercel: Environment variables panel

## Backup & Recovery

### Database Backup

#### Neo4j AuraDB

- **Automatic backups** included in AuraDB
- **Point-in-time recovery** available
- **Export data** via Neo4j Browser or cypher-shell

#### Manual Backup Script

```python
# scripts/backup_neo4j.py
from neo4j import GraphDatabase
import json
import os
from datetime import datetime

def backup_database():
    driver = GraphDatabase.driver(
        os.getenv("NEO4J_URI"),
        auth=(os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))
    )
    
    with driver.session() as session:
        # Export all nodes and relationships
        result = session.run("MATCH (n) RETURN n")
        nodes = [record["n"] for record in result]
        
        result = session.run("MATCH ()-[r]->() RETURN r")
        relationships = [record["r"] for record in result]
    
    backup_data = {
        "timestamp": datetime.now().isoformat(),
        "nodes": nodes,
        "relationships": relationships
    }
    
    filename = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, 'w') as f:
        json.dump(backup_data, f, default=str)
    
    print(f"Backup saved to {filename}")

if __name__ == "__main__":
    backup_database()
```

### Application Data

#### Document Embeddings

```python
# Backup vector embeddings and document data
# This should be done regularly if you're adding new documents

import pickle
import os

def backup_embeddings():
    # Backup FAISS index
    if os.path.exists("document_index.faiss"):
        import shutil
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        shutil.copy2("document_index.faiss", f"backup_index_{timestamp}.faiss")
    
    # Backup document metadata
    if os.path.exists("document_metadata.pkl"):
        shutil.copy2("document_metadata.pkl", f"backup_metadata_{timestamp}.pkl")
```

## Troubleshooting

### Common Deployment Issues

#### 1. Backend Won't Start

**Symptoms:**
- Build succeeds but service crashes
- 502/503 errors from frontend

**Solutions:**
```bash
# Check logs in Render dashboard
# Common issues:

# Missing environment variables
echo $GOOGLE_API_KEY  # Should not be empty

# Database connection
python -c "from neo4j import GraphDatabase; print('Testing DB connection...')"

# Python version
python --version  # Should be 3.8+

# Dependencies
pip list | grep fastapi  # Ensure FastAPI is installed
```

#### 2. Frontend Build Fails

**Symptoms:**
- Build process fails in Netlify/Vercel
- TypeScript errors
- Missing environment variables

**Solutions:**
```bash
# Local test
cd frontend
npm install
npm run build  # Should complete without errors

# Check environment variables
# Ensure all VITE_ prefixed variables are set

# TypeScript issues
npm run typecheck  # Fix any type errors
```

#### 3. API CORS Errors

**Symptoms:**
- Frontend can't connect to backend
- CORS policy errors in browser console

**Solutions:**
```python
# Update CORS origins in backend
CORS_ORIGINS = [
    "https://yourdomain.com",
    "https://your-netlify-app.netlify.app"
]
```

#### 4. Database Connection Issues

**Symptoms:**
- Neo4j connection timeouts
- Authentication errors

**Solutions:**
```bash
# Test connection string
export NEO4J_URI="neo4j+s://your-instance.databases.neo4j.io"
export NEO4J_USERNAME="neo4j"
export NEO4J_PASSWORD="your-password"

python -c "
from neo4j import GraphDatabase
driver = GraphDatabase.driver('$NEO4J_URI', auth=('$NEO4J_USERNAME', '$NEO4J_PASSWORD'))
driver.verify_connectivity()
print('Connection successful')
"
```

### Performance Optimization

#### 1. Frontend Optimization

```bash
# Enable compression in Netlify
echo '_headers' > public/_headers
echo '/*' >> public/_headers
echo '  X-Frame-Options: DENY' >> public/_headers
echo '  X-Content-Type-Options: nosniff' >> public/_headers

# Optimize build
npm run build -- --analyze  # Check bundle size
```

#### 2. Backend Optimization

```python
# Enable gzip compression
from fastapi.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Add caching headers for static responses
from fastapi.responses import JSONResponse

@app.get("/graph")
async def get_graph():
    response = JSONResponse(graph_data)
    response.headers["Cache-Control"] = "public, max-age=300"
    return response
```

### Monitoring Checklist

- [ ] Health endpoints responding (200 OK)
- [ ] Database connectivity working
- [ ] Search functionality operational
- [ ] Frontend loading correctly
- [ ] Authentication working
- [ ] Error tracking configured
- [ ] Backup procedures tested
- [ ] SSL certificates valid
- [ ] Performance within acceptable limits

---

For additional deployment support, consult:
- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **Netlify Documentation**: [docs.netlify.com](https://docs.netlify.com)
- **Neo4j AuraDB Guide**: [neo4j.com/docs/aura](https://neo4j.com/docs/aura)

*Last updated: January 2024*