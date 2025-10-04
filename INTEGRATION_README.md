# Cellexis Frontend-Backend Integration

## 🚀 Complete Integration Setup

The frontend and backend are now fully integrated! Here's what has been implemented:

### ✅ What's Working:

1. **RAG Search Pipeline**: 
   - User query → FAISS search → Gemini answer generation
   - Real-time search with loading states
   - Citation tracking with paper IDs and page numbers

2. **Knowledge Graph Integration**:
   - Neo4j Aura database connection
   - Cytoscape.js compatible data format
   - Real-time graph updates after search

3. **Frontend Features**:
   - Search page with live results
   - QA page with AI-powered answers
   - Knowledge graph visualization panel
   - Loading states and error handling

4. **Backend API Endpoints**:
   - `/search-rag` - Main RAG search endpoint
   - `/graph` - Knowledge graph data
   - `/search` - Neo4j node search
   - CORS enabled for frontend integration

## 🛠️ How to Run:

### 1. Start Backend Server:
```bash
cd /home/lenovo/cellexis/backend
./start_server.sh
```
This will:
- Create virtual environment if needed
- Install all dependencies
- Start FastAPI server on http://localhost:8000

### 2. Start Frontend Server:
```bash
cd /home/lenovo/cellexis/frontend
./start_frontend.sh
```
This will:
- Install dependencies if needed
- Start Vite dev server on http://localhost:5173

## 📋 Prerequisites:

Make sure you have these files in place:

1. **Backend Data Files**:
   - `backend/data/faiss_index.idx` - FAISS vector index
   - `backend/data/chunk_metadata.json` - Chunk metadata

2. **Environment Configuration**:
   - `backend/.env` with `GEMINI_API_KEY`
   - Neo4j Aura connection configured in `backend/app/neo4j_client.py`

3. **Dependencies**:
   - Python 3.8+ with virtual environment support
   - Node.js with pnpm

## 🔄 How It Works:

1. **User enters query** in Search or QA page
2. **Frontend sends request** to `/search-rag` endpoint
3. **Backend loads FAISS index** and searches for relevant chunks
4. **Gemini processes chunks** and generates structured answer
5. **Knowledge graph data** is fetched from Neo4j
6. **Results displayed** with citations and graph visualization

## 🎯 Test the Integration:

1. Open http://localhost:5173
2. Login to dashboard
3. Go to Search page (default)
4. Enter a query like: "How does microgravity affect cell growth?"
5. See AI-generated answer with citations
6. Check knowledge graph panel for related entities

## 🐛 Troubleshooting:

- **Backend won't start**: Check if FAISS index and metadata files exist
- **Frontend can't connect**: Ensure backend is running on port 8000
- **No search results**: Verify Gemini API key is set
- **Graph not loading**: Check Neo4j Aura connection

The integration is complete and ready to use! 🎉
