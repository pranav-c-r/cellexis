from fastapi import FastAPI
from .neo4j_client import driver

app = FastAPI()

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
# NEW ENDPOINTS
# -------------------------

@app.post("/organisms/{name}")
def add_organism(name: str):
    """
    Create a new Organism node with a given name.
    """
    with driver.session() as session:
        session.run("MERGE (o:Organism {name: $name})", name=name)
    return {"message": f"Organism '{name}' added."}


@app.get("/organisms")
def list_organisms():
    """
    List all Organism nodes in the DB.
    """
    with driver.session() as session:
        result = session.run("MATCH (o:Organism) RETURN o.name AS name")
        organisms = [record["name"] for record in result]
    return {"organisms": organisms}

@app.post("/papers/{title}")
def add_paper(title: str):
    """
    Create a new Paper node with a given title.
    """
    with driver.session() as session:
        session.run("MERGE (p:Paper {title: $title})", title=title)
    return {"message": f"Paper '{title}' added."}


@app.get("/papers")
def list_papers():
    """
    List all Paper nodes in the DB.
    """
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

# Paper -> Organism
@app.post("/papers/{paper_title}/studies/{organism_name}")
def link_paper_to_organism(paper_title: str, organism_name: str):
    with driver.session() as session:
        session.run("""
            MATCH (p:Paper {title: $paper_title})
            MATCH (o:Organism {name: $organism_name})
            MERGE (p)-[:STUDIES]->(o)
        """, paper_title=paper_title, organism_name=organism_name)
    return {"message": f"Linked Paper '{paper_title}' to Organism '{organism_name}'"}


# Paper -> Outcome
@app.post("/papers/{paper_title}/reports/{outcome_name}")
def link_paper_to_outcome(paper_title: str, outcome_name: str):
    with driver.session() as session:
        session.run("""
            MATCH (p:Paper {title: $paper_title})
            MATCH (o:Outcome {name: $outcome_name})
            MERGE (p)-[:REPORTS]->(o)
        """, paper_title=paper_title, outcome_name=outcome_name)
    return {"message": f"Linked Paper '{paper_title}' to Outcome '{outcome_name}'"}


# Paper -> Assay
@app.post("/papers/{paper_title}/uses/{assay_name}")
def link_paper_to_assay(paper_title: str, assay_name: str):
    with driver.session() as session:
        session.run("""
            MATCH (p:Paper {title: $paper_title})
            MATCH (a:Assay {name: $assay_name})
            MERGE (p)-[:USES]->(a)
        """, paper_title=paper_title, assay_name=assay_name)
    return {"message": f"Linked Paper '{paper_title}' to Assay '{assay_name}'"}


# Paper -> ExperimentType
@app.post("/papers/{paper_title}/performed_on/{experiment_type_name}")
def link_paper_to_experiment_type(paper_title: str, experiment_type_name: str):
    with driver.session() as session:
        session.run("""
            MATCH (p:Paper {title: $paper_title})
            MATCH (e:ExperimentType {name: $experiment_type_name})
            MERGE (p)-[:PERFORMED_ON]->(e)
        """, paper_title=paper_title, experiment_type_name=experiment_type_name)
    return {"message": f"Linked Paper '{paper_title}' to ExperimentType '{experiment_type_name}'"}


# Paper -> Mission
@app.post("/papers/{paper_title}/conducted_in/{mission_name}")
def link_paper_to_mission(paper_title: str, mission_name: str):
    with driver.session() as session:
        session.run("""
            MATCH (p:Paper {title: $paper_title})
            MATCH (m:Mission {name: $mission_name})
            MERGE (p)-[:CONDUCTED_IN]->(m)
        """, paper_title=paper_title, mission_name=mission_name)
    return {"message": f"Linked Paper '{paper_title}' to Mission '{mission_name}'"}


# Gene -> Paper
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

@app.post("/summarize")
def summarize_paper(req: SummarizeRequest):
    return summarize(req.text)

@app.post("/qa")
def qa_answer(req: QARequest):
    return qa(req.query, req.snippets)

@app.post("/extract_kg")
def extract_kg(req: KGRequest):
    return safe_extract_kg(req.text)

