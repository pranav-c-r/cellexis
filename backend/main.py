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
    allow_origins=["http://localhost:8080", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

driver = GraphDatabase.driver(
    os.getenv("NEO4J_URI"),
    auth=(os.getenv("NEO4J_USER"), os.getenv("NEO4J_PASSWORD"))
)

class SearchRequest(BaseModel):
    query: str

def search_papers(query: str):
    """Search across Neo4j knowledge graph"""
    with driver.session() as session:
        result = session.run("""
            MATCH (n)-[r]-(m)
            WHERE n.name CONTAINS $query 
               OR m.name CONTAINS $query 
               OR m.description CONTAINS $query
            RETURN DISTINCT 
                coalesce(n.name, m.name) as title,
                coalesce(m.description, n.name) as summary,
                labels(n)[0] + " -> " + type(r) + " -> " + labels(m)[0] as relationship,
                randomUUID() as id
            LIMIT 10
        """, query=query)
        
        papers = []
        for record in result:
            papers.append({
                "id": record["id"][:8],
                "title": record["title"],
                "summary": record["summary"] or "No summary available",
                "year": 2023,  # Default year
                "relationship": record["relationship"]
            })
        
        return papers

@app.post("/api/search")
async def search_endpoint(request: SearchRequest):
    """Search papers endpoint"""
    try:
        results = search_papers(request.query)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "Cellexis API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)