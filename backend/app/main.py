from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8081", "http://127.0.0.1:3000", "http://127.0.0.1:5173", "http://127.0.0.1:8081"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    Main RAG endpoint: FAISS search + Gemini answer generation
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
def get_graph(filter_type: str = None):
    """
    Get knowledge graph data for Cytoscape visualization
    """
    if driver is None:
        return {"nodes": [], "edges": [], "error": "Neo4j driver not initialized"}
    
    with driver.session() as session:
        if filter_type:
            query = f"MATCH (n:{filter_type})-[r]->(m) RETURN n, r, m LIMIT 50"
            result = session.run(query)
        else:
            result = session.run("MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 50")
        
        nodes = set()
        edges = []
        
        for record in result:
            from_node = dict(record["n"])
            to_node = dict(record["m"])
            rel_type = record["r"].type
            
            # Add nodes to set (to avoid duplicates)
            nodes.add((from_node.get("name", "unknown"), from_node.get("labels", ["Unknown"])[0] if "labels" in from_node else "Unknown"))
            nodes.add((to_node.get("name", "unknown"), to_node.get("labels", ["Unknown"])[0] if "labels" in to_node else "Unknown"))
            
            # Add edge
            edges.append({
                "data": {
                    "id": f"{from_node.get('name', 'unknown')}-{to_node.get('name', 'unknown')}",
                    "source": from_node.get("name", "unknown"),
                    "target": to_node.get("name", "unknown"),
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
            "edges": edges
        }
