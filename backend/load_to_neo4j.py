from neo4j import GraphDatabase
import json
import os
from dotenv import load_dotenv

# Load .env
load_dotenv()

URI = os.getenv("NEO4J_URI")
USER = os.getenv("NEO4J_USER")
PASSWORD = os.getenv("NEO4J_PASSWORD")

driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))

def create_nodes_and_relationships(tx, data):
    # Nodes
    for org in data.get("organism", []):
        tx.run("MERGE (o:Organism {name: $name})", name=org)

    for assay in data.get("assay", []):
        tx.run("MERGE (a:Assay {name: $name})", name=assay)

    for gene in data.get("gene", []):
        tx.run("MERGE (g:Gene {name: $name})", name=gene)

    for mission in data.get("mission", []):
        tx.run("MERGE (m:Mission {name: $name})", name=mission)

    for exp in data.get("experimenttype", []):
        tx.run("MERGE (e:Experiment {name: $name})", name=exp)

    for out in data.get("outcome", []):
        tx.run("MERGE (o:Outcome {description: $desc})", desc=out)

    # Relationships
    if data.get("organism") and data.get("mission"):
        tx.run("""
            MATCH (o:Organism {name: $org}), (m:Mission {name: $mission})
            MERGE (o)-[:INVOLVED_IN]->(m)
        """, org=data["organism"][0], mission=data["mission"][0])

    if data.get("assay") and data.get("outcome"):
        tx.run("""
            MATCH (a:Assay {name: $assay}), (o:Outcome {description: $outcome})
            MERGE (a)-[:HAS_RESULT]->(o)
        """, assay=data["assay"][0], outcome=data["outcome"][0])

def main():
    with driver.session() as session:
        with open("data/papers/1_entities.jsonl", "r", encoding="utf-8") as f:
            for line in f:
                data = json.loads(line)
                session.execute_write(create_nodes_and_relationships, data)

    print("✅ Data loaded into Neo4j")

if __name__ == "__main__":
    main()
