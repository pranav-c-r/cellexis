from fastapi import FastAPI, Body
from .neo4j_client import driver

app = FastAPI()

# -------------------------
# ROOT / HEALTHCHECK
# -------------------------
@app.get("/")
def root():
    return {"message": "Backend is running"}

@app.get("/pingdb")
def ping_db():
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
    with driver.session() as session:
        if filter_type:
            query = f"MATCH (n:{filter_type})-[r]->(m) RETURN n, r, m LIMIT 50"
            result = session.run(query)
        else:
            result = session.run("MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 50")
        graph = []
        for record in result:
            graph.append({
                "from": dict(record["n"]),
                "to": dict(record["m"]),
                "type": record["r"].type
            })
    return graph

# -------------------------
# QA / RAG ENDPOINT (SKELETON)
# -------------------------
@app.post("/qa")
def qa_endpoint(query: str = Body(...)):
    # Placeholder retrieval (replace later with real chunks)
    retrieved_chunks = [{"paper_id": "paper1", "chunk_text": "Example text", "page_num": 1}]
    
    # Placeholder Gemini answer (replace later)
    answer = f"Answer for '{query}' based on {len(retrieved_chunks)} chunks."
    
    return {
        "query": query,
        "answer": answer,
        "citations": [{"paper_id": c["paper_id"], "page_num": c["page_num"]} for c in retrieved_chunks]
    }

# -------------------------
# KG EXTRACTION ENDPOINT (SKELETON)
# -------------------------
@app.post("/extract-kg")
def extract_kg(chunk_text: str = Body(...)):
    # Placeholder entities & relationships
    extracted_entities = {
        "Organism": ["Arabidopsis"],
        "Gene": ["AT1G01010"],
        "Paper": ["paper1"],
        "Outcome": ["Increased growth"],
        "Assay": ["RNA-seq"],
        "ExperimentType": ["Microgravity"],
        "Mission": ["ISS2025"]
    }
    extracted_relationships = [
        {"from": "paper1", "to": "Arabidopsis", "type": "STUDIES"},
        {"from": "paper1", "to": "AT1G01010", "type": "STUDIED_IN"},
        {"from": "paper1", "to": "Increased growth", "type": "REPORTS"},
        {"from": "paper1", "to": "RNA-seq", "type": "USES"},
        {"from": "paper1", "to": "Microgravity", "type": "PERFORMED_ON"},
        {"from": "paper1", "to": "ISS2025", "type": "CONDUCTED_IN"},
    ]

    with driver.session() as session:
        for entity_type, names in extracted_entities.items():
            for name in names:
                session.run(f"MERGE (n:{entity_type} {{name: $name}})", name=name)
        for rel in extracted_relationships:
            session.run(f"""
                MATCH (from {{name: $from_name}}), (to {{name: $to_name}})
                MERGE (from)-[r:{rel['type']}]->(to)
            """, from_name=rel["from"], to_name=rel["to"])

    return {"message": "KG extraction skeleton executed"}
