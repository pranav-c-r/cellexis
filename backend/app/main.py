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

app = FastAPI()

# Add CORS middleware for frontend integration
# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://localhost:8080",
        "http://localhost:8081",  
        "https://cellexis-eta.vercel.app",
        "https://cellexis.vercel.app",
        "https://*.vercel.app",
        "https://*.onrender.com",  
        "*" 
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Simplified
    allow_headers=["*"],  # Simplified
    expose_headers=["*"],
)

# -------------------------
# CORS PREFLIGHT HANDLERS
# -------------------------
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

@app.options("/graph")
async def graph_options():
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Max-Age": "600"
        }
    )

@app.options("/search-stats")
async def search_stats_options():
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Max-Age": "600"
        }
    )

# Global OPTIONS handler for all routes
@app.options("/{path:path}")
async def global_options(path: str):
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
            "Access-Control-Max-Age": "600"
        }
    )

# -------------------------
# ROOT / HEALTHCHECK
# -------------------------
@app.get("/")
def root():
    return {"message": "Backend is running"}

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
# NODE ENDPOINTS
# -------------------------
@app.post("/organisms/{name}")
def add_organism(name: str):
    with driver.session() as session:
        session.run("MERGE (o:Organism {name: $name})", name=name)
    return {"message": f"Organism '{name}' added."}

@app.get("/organisms")
def list_organisms():
    with driver.session() as session:
        result = session.run("MATCH (o:Organism) RETURN o.name AS name")
        organisms = [record["name"] for record in result]
    return {"organisms": organisms}

@app.post("/papers/{title}")
def add_paper(title: str):
    with driver.session() as session:
        session.run("MERGE (p:Paper {title: $title})", title=title)
    return {"message": f"Paper '{title}' added."}

@app.get("/papers")
def list_papers():
    with driver.session() as session:
        result = session.run("MATCH (p:Paper) RETURN p.title AS title")
        papers = [record["title"] for record in result]
    return {"papers": papers}

@app.post("/genes/{name}")
def add_gene(name: str):
    with driver.session() as session:
        session.run("MERGE (g:Gene {name: $name})", name=name)
    return {"message": f"Gene '{name}' added."}

@app.post("/missions/{name}")
def add_mission(name: str):
    with driver.session() as session:
        session.run("MERGE (m:Mission {name: $name})", name=name)
    return {"message": f"Mission '{name}' added."}

@app.post("/experimenttypes/{name}")
def add_experiment_type(name: str):
    with driver.session() as session:
        session.run("MERGE (e:ExperimentType {name: $name})", name=name)
    return {"message": f"ExperimentType '{name}' added."}

@app.post("/outcomes/{name}")
def add_outcome(name: str):
    with driver.session() as session:
        session.run("MERGE (o:Outcome {name: $name})", name=name)
    return {"message": f"Outcome '{name}' added."}

@app.post("/assays/{name}")
def add_assay(name: str):
    with driver.session() as session:
        session.run("MERGE (a:Assay {name: $name})", name=name)
    return {"message": f"Assay '{name}' added."}

# -------------------------
# RELATIONSHIP ENDPOINTS
# -------------------------
@app.post("/papers/{paper_title}/studies/{organism_name}")
def link_paper_to_organism(paper_title: str, organism_name: str):
    with driver.session() as session:
        session.run("""
            MATCH (p:Paper {title: $paper_title})
            MATCH (o:Organism {name: $organism_name})
            MERGE (p)-[:STUDIES]->(o)
        """, paper_title=paper_title, organism_name=organism_name)
    return {"message": f"Linked Paper '{paper_title}' to Organism '{organism_name}'"}

@app.post("/papers/{paper_title}/reports/{outcome_name}")
def link_paper_to_outcome(paper_title: str, outcome_name: str):
    with driver.session() as session:
        session.run("""
            MATCH (p:Paper {title: $paper_title})
            MATCH (o:Outcome {name: $outcome_name})
            MERGE (p)-[:REPORTS]->(o)
        """, paper_title=paper_title, outcome_name=outcome_name)
    return {"message": f"Linked Paper '{paper_title}' to Outcome '{outcome_name}'"}

@app.post("/papers/{paper_title}/uses/{assay_name}")
def link_paper_to_assay(paper_title: str, assay_name: str):
    with driver.session() as session:
        session.run("""
            MATCH (p:Paper {title: $paper_title})
            MATCH (a:Assay {name: $assay_name})
            MERGE (p)-[:USES]->(a)
        """, paper_title=paper_title, assay_name=assay_name)
    return {"message": f"Linked Paper '{paper_title}' to Assay '{assay_name}'"}

@app.post("/papers/{paper_title}/performed_on/{experiment_type_name}")
def link_paper_to_experiment_type(paper_title: str, experiment_type_name: str):
    with driver.session() as session:
        session.run("""
            MATCH (p:Paper {title: $paper_title})
            MATCH (e:ExperimentType {name: $experiment_type_name})
            MERGE (p)-[:PERFORMED_ON]->(e)
        """, paper_title=paper_title, experiment_type_name=experiment_type_name)
    return {"message": f"Linked Paper '{paper_title}' to ExperimentType '{experiment_type_name}'"}

@app.post("/papers/{paper_title}/conducted_in/{mission_name}")
def link_paper_to_mission(paper_title: str, mission_name: str):
    with driver.session() as session:
        session.run("""
            MATCH (p:Paper {title: $paper_title})
            MATCH (m:Mission {name: $mission_name})
            MERGE (p)-[:CONDUCTED_IN]->(m)
        """, paper_title=paper_title, mission_name=mission_name)
    return {"message": f"Linked Paper '{paper_title}' to Mission '{mission_name}'"}

@app.post("/genes/{gene_name}/studied_in/{paper_title}")
def link_gene_to_paper(gene_name: str, paper_title: str):
    with driver.session() as session:
        session.run("""
            MATCH (g:Gene {name: $gene_name})
            MATCH (p:Paper {title: $paper_title})
            MERGE (g)-[:STUDIED_IN]->(p)
        """, gene_name=gene_name, paper_title=paper_title)
    return {"message": f"Linked Gene '{gene_name}' to Paper '{paper_title}'"}

# -------------------------

# GEMINI ENDPOINTS 
# -------------------------
from pydantic import BaseModel
from gemini.gemini_utils import summarize, qa, safe_extract_kg

class SummarizeRequest(BaseModel):
    text: str

class QARequest(BaseModel):
    query: str
    snippets: list[str]  # include [paper_id:page_num] in snippets

class KGRequest(BaseModel):
    text: str

class RAGRequest(BaseModel):
    query: str
    top_k: int = 5

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

@app.get("/search-stats")
def get_search_stats():
    """
    Get search system statistics
    """
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

# QUERY / SEARCH / GRAPH ENDPOINTS
# -------------------------
@app.get("/search")
def search_nodes(q: str):
    with driver.session() as session:
        result = session.run("""
            MATCH (n)
            WHERE toLower(n.name) CONTAINS toLower($q)
            RETURN n LIMIT 20
        """, q=q)
        nodes = [dict(record["n"]) for record in result]
    return {"query": q, "results": nodes}

@app.get("/paper/{paper_title}")
def get_paper(paper_title: str):
    with driver.session() as session:
        result = session.run("""
            MATCH (p:Paper {title: $paper_title})-[r]->(n)
            RETURN p, type(r) AS rel, n
        """, paper_title=paper_title)
        data = []
        for record in result:
            data.append({
                "paper": dict(record["p"]),
                "relationship": record["rel"],
                "node": dict(record["n"])
            })
    return data

@app.get("/graph")
def get_graph(filter_type: str = None, query: str = None):
    """
    Get knowledge graph data for Cytoscape visualization
    If query is provided, find nodes related to the search query
    """
    if driver is None:
        return {"nodes": [], "edges": [], "error": "Neo4j driver not initialized"}
    
    with driver.session() as session:
        if query:
            # Search for nodes related to the query
            cypher_query = """
            MATCH (n)-[r]->(m)
            WHERE (n.name IS NOT NULL AND toLower(n.name) CONTAINS toLower($search_query)) 
               OR (m.name IS NOT NULL AND toLower(m.name) CONTAINS toLower($search_query))
            RETURN n, r, m
            LIMIT 100
            """
            try:
                result = session.run(cypher_query, search_query=query)
            except Exception as e:
                print(f"Error with query search: {e}")
                # Fallback to basic query
                result = session.run("MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 50")
        elif filter_type:
            cypher_query = f"MATCH (n:{filter_type})-[r]->(m) RETURN n, r, m LIMIT 50"
            result = session.run(cypher_query)
        else:
            # Default: get a sample of all relationships
            result = session.run("MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 50")
        
        nodes = set()
        edges = []
        
        for record in result:
            from_node = dict(record["n"])
            to_node = dict(record["m"])
            rel_type = record["r"].type
            
            # Add nodes to set (to avoid duplicates)
            from_name = from_node.get("name", "unknown")
            to_name = to_node.get("name", "unknown")
            from_type = from_node.get("labels", ["Unknown"])[0] if "labels" in from_node else "Unknown"
            to_type = to_node.get("labels", ["Unknown"])[0] if "labels" in to_node else "Unknown"
            
            nodes.add((from_name, from_type))
            nodes.add((to_name, to_type))
            
            # Add edge
            edges.append({
                "data": {
                    "id": f"{from_name}-{to_name}",
                    "source": from_name,
                    "target": to_name,
                    "label": rel_type
                }
            })
        
        # Convert nodes set to list
        nodes_list = []
        for node_name, node_type in nodes:
            nodes_list.append({
                "data": {
                    "id": node_name,
                    "label": node_name,
                    "type": node_type
                }
            })
        
        return {
            "nodes": nodes_list,
            "edges": edges,
            "query": query,
            "total_nodes": len(nodes_list),
            "total_edges": len(edges)
        }
