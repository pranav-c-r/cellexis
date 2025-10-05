from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .neo4j_client import driver
from .rag_service import get_rag_service
from pydantic import BaseModel
import sys
import os

# Add backend directory to path for gemini imports
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)

from gemini.gemini_utils import summarize, qa, safe_extract_kg

app = FastAPI(title="Cellexis API", description="NASA Space Biology Knowledge Graph API")

# CLEAN CORS CONFIGURATION
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://localhost:8080",
        "http://localhost:8081",
        "https://cellexis-eta.vercel.app",
        "https://cellexis.vercel.app", 
        "https://cellexis-wlgs.onrender.com",
        "*"  # Allow all origins for development
    ],
    allow_credentials=False,  # Must be False when using "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# ROOT / HEALTHCHECK
# -------------------------
@app.get("/")
def root():
    return {"message": "Cellexis Backend API is running", "status": "healthy"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "cellexis-backend"}

@app.get("/pingdb")
def ping_db():
    if driver is None:
        return {"error": "Neo4j driver not initialized. Check environment variables."}
    try:
        with driver.session() as session:
            result = session.run("RETURN 'pong' AS msg")
            return {"status": result.single()["msg"]}
    except Exception as e:
        return {"error": str(e)}

# -------------------------
# PYDANTIC MODELS
# -------------------------
class SummarizeRequest(BaseModel):
    text: str

class QARequest(BaseModel):
    query: str
    snippets: list[str]

class KGRequest(BaseModel):
    text: str

class RAGRequest(BaseModel):
    query: str
    top_k: int = 5

# -------------------------
# RAG ENDPOINT (MAIN SEARCH)
# -------------------------
@app.post("/search-rag")
def search_rag(req: RAGRequest):
    """
    Main RAG endpoint: Enhanced FAISS + Neo4j search + Gemini answer generation
    """
    try:
        rag_service = get_rag_service()
        result = rag_service.process_query(req.query, req.top_k)
        return result
    except Exception as e:
        return {
            "query": req.query,
            "answer": f"Error processing query: {str(e)}",
            "citations": [],
            "chunks_used": 0
        }

# Add alias for frontend compatibility
@app.post("/api/search")
def api_search_alias(req: RAGRequest):
    """Alternative endpoint for frontend compatibility"""
    return search_rag(req)

@app.get("/search-stats")
def get_search_stats():
    """Get search system statistics"""
    try:
        rag_service = get_rag_service()
        stats = {
            "faiss_index_size": rag_service.index.ntotal if rag_service.index else 0,
            "chunks_loaded": len(rag_service.chunks),
            "papers_available": len(rag_service.paper_chunks_map),
            "neo4j_connected": rag_service.driver is not None,
            "embedding_model": rag_service.model_name if rag_service.model else None
        }
        return stats
    except Exception as e:
        return {"error": str(e)}

# -------------------------
# GEMINI ENDPOINTS 
# -------------------------
@app.post("/summarize")
def summarize_paper(req: SummarizeRequest):
    return summarize(req.text)

@app.post("/qa-direct")
def qa_answer(req: QARequest):
    return qa(req.query, req.snippets)

@app.post("/extract_kg")
def extract_kg(req: KGRequest):
    return safe_extract_kg(req.text)

# -------------------------
# GRAPH ENDPOINT
# -------------------------
@app.get("/graph")
def get_graph(filter_type: str = None, query: str = None):
    """Get knowledge graph data for Cytoscape visualization"""
    if driver is None:
        return {"nodes": [], "edges": [], "error": "Neo4j driver not initialized"}
    
    with driver.session() as session:
        if query:
            cypher_query = """
            MATCH (n)-[r]->(m)
            WHERE (n.name IS NOT NULL AND toLower(n.name) CONTAINS toLower($search_query)) 
               OR (m.name IS NOT NULL AND toLower(m.name) CONTAINS toLower($search_query))
            RETURN n, r, m LIMIT 100
            """
            try:
                result = session.run(cypher_query, search_query=query)
            except Exception as e:
                print(f"Error with query search: {e}")
                result = session.run("MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 50")
        else:
            result = session.run("MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 50")
        
        nodes = set()
        edges = []
        
        for record in result:
            from_node = dict(record["n"])
            to_node = dict(record["m"])
            rel_type = record["r"].type
            
            from_name = from_node.get("name", "unknown")
            to_name = to_node.get("name", "unknown")
            from_type = list(record["n"].labels)[0] if record["n"].labels else "Unknown"
            to_type = list(record["m"].labels)[0] if record["m"].labels else "Unknown"
            
            nodes.add((from_name, from_type))
            nodes.add((to_name, to_type))
            
            edges.append({
                "data": {
                    "id": f"{from_name}-{to_name}",
                    "source": from_name,
                    "target": to_name,
                    "label": rel_type
                }
            })
        
        nodes_list = []
        for node_name, node_type in nodes:
            nodes_list.append({
                "data": {
                    "id": node_name,
                    "label": node_name,
                    "type": node_type.lower()
                }
            })
        
        return {
            "nodes": nodes_list,
            "edges": edges,
            "query": query,
            "total_nodes": len(nodes_list),
            "total_edges": len(edges)
        }