from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from neo4j import GraphDatabase
import os
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="Cellexis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    driver = GraphDatabase.driver(
        os.getenv("NEO4J_URI"),
        auth=(os.getenv("NEO4J_USER"), os.getenv("NEO4J_PASSWORD"))
    )
    print("✅ Connected to Neo4j")
except Exception as e:
    print(f"❌ Neo4j connection failed: {e}")
    driver = None

class SearchRequest(BaseModel):
    query: str

def search_papers(query: str):
    """Search across Neo4j knowledge graph"""
    if not driver:
        return [{
            "id": "mock001",
            "title": f"Mock result for '{query}'",
            "summary": "Neo4j database not available. This is mock data for demonstration.",
            "year": 2023,
            "relationship": "Mock -> DEMO -> Data"
        }]
    
    try:
        with driver.session() as session:
            # First try to get any nodes to check if database has data
            test_result = session.run("MATCH (n) RETURN count(n) as total LIMIT 1")
            total_nodes = test_result.single()["total"]
            
            if total_nodes == 0:
                # No data in database, return mock data
                return [{
                    "id": "empty001",
                    "title": f"No data found for '{query}'",
                    "summary": "Neo4j database is empty. Please load data first.",
                    "year": 2023,
                    "relationship": "Empty -> DATABASE -> NoData"
                }]
            
            # Simplified query that should work even with basic node structure
            result = session.run("""
                MATCH (n)
                WHERE toLower(toString(n.name)) CONTAINS toLower($search_term) 
                   OR toLower(toString(n.description)) CONTAINS toLower($search_term)
                   OR toLower(toString(n.type)) CONTAINS toLower($search_term)
                RETURN DISTINCT 
                    coalesce(n.name, n.type, "Unknown") as title,
                    coalesce(n.description, n.summary, "No description available") as summary,
                    labels(n)[0] as node_type,
                    elementId(n) as id
                LIMIT 10
            """, search_term=query)
            
            papers = []
            for record in result:
                papers.append({
                    "id": str(record["id"])[-8:],  # Last 8 chars of element ID
                    "title": record["title"] or "Unknown",
                    "summary": record["summary"] or "No summary available",
                    "year": 2023,  # Default year
                    "relationship": f"{record['node_type']} node"
                })
            
            if not papers:
                # No matches found, return helpful message
                papers = [{
                    "id": "noresult",
                    "title": f"No matches for '{query}'",
                    "summary": f"No nodes found containing '{query}'. Try searching for: organism, gene, mission, experiment, or assay.",
                    "year": 2023,
                    "relationship": "Search -> NO_MATCH -> Query"
                }]
            
            return papers
            
    except Exception as e:
        print(f"Neo4j query error: {e}")
        # Return error as a result instead of throwing exception
        return [{
            "id": "error001",
            "title": f"Search error for '{query}'",
            "summary": f"Database query failed: {str(e)}. Using fallback data.",
            "year": 2023,
            "relationship": "Error -> QUERY -> Failed"
        }]

@app.post("/api/search")
async def search_endpoint(request: SearchRequest):
    """Search papers endpoint"""
    try:
        print(f"🔍 Searching for: {request.query}")
        results = search_papers(request.query)
        print(f"✅ Found {len(results)} results")
        return {"results": results, "query": request.query, "total": len(results)}
    except Exception as e:
        print(f"❌ Search endpoint error: {e}")
        # Return error information instead of throwing HTTP exception
        return {
            "results": [{
                "id": "api_error",
                "title": f"API Error for '{request.query}'",
                "summary": f"API endpoint failed: {str(e)}",
                "year": 2023,
                "relationship": "API -> ERROR -> Backend"
            }],
            "error": str(e),
            "query": request.query,
            "total": 1
        }

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "Cellexis API is running"}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Cellexis RAG API on port 8002...")
    uvicorn.run(app, host="0.0.0.0", port=8002)