# backend/app/neo4j_ingest.py
import json
import sys
from neo4j_client import get_driver

ALLOWED_LABELS = {"Organism","ExperimentType","Assay","Outcome","Mission","Gene","Paper","Document"}

def ingest_kg_json(kg_json):
    """
    expected kg_json format:
    {
      "paper_id": "paper50",
      "entities": [
        {"type":"Organism","name":"Arabidopsis thaliana","props": {"taxonomy_id":"3702"}},
        {"type":"ExperimentType","name":"microgravity assay"}
      ],
      "relations": [
        {
          "from_name":"microgravity assay",
          "from_type":"ExperimentType",
          "to_name":"Arabidopsis thaliana",
          "to_type":"Organism",
          "type":"PERFORMED_ON",
          "props":{"page":2}
        }
      ]
    }
    """
    driver = get_driver()
    paper_id = kg_json.get("paper_id")
    entities = kg_json.get("entities", [])
    relations = kg_json.get("relations", [])

    # Build nodes map per label
    nodes_by_label = {}
    for e in entities:
        label = e.get("type")
        name = e.get("name")
        props = e.get("props", {}) or {}
        if label not in ALLOWED_LABELS:
            raise ValueError(f"Unexpected label: {label}")
        nodes_by_label.setdefault(label, []).append({"name": name, "props": props, "paper_id": paper_id})

    # Group relations by (from_type, to_type, rel_type)
    from collections import defaultdict
    rel_groups = defaultdict(list)
    for r in relations:
        key = (r.get("from_type"), r.get("to_type"), r.get("type"))
        rel_groups[key].append(r)

    with driver.session() as session:
        # Insert nodes (UNWIND + MERGE)
        for label, rows in nodes_by_label.items():
            cypher = f"""
            UNWIND $rows AS row
            MERGE (n:{label} {{name: row.name}})
            SET n += row.props
            SET n.sources = coalesce(n.sources, []) + row.paper_id
            """
            session.run(cypher, rows=rows)

        # Insert relationships
        for (from_label, to_label, rel_type), rows in rel_groups.items():
            if from_label not in ALLOWED_LABELS or to_label not in ALLOWED_LABELS:
                raise ValueError("Invalid labels in relations")
            cypher = f"""
            UNWIND $rows AS r
            MATCH (a:{from_label} {{name: r.from_name}})
            MATCH (b:{to_label} {{name: r.to_name}})
            MERGE (a)-[rel:{rel_type}]->(b)
            SET rel.papers = coalesce(rel.papers, []) + r.paper_id
            SET rel += coalesce(r.props, {{}})
            """
            session.run(cypher, rows=rows)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage: python neo4j_ingest.py sample_kg.json")
        sys.exit(1)
    path = sys.argv[1]
    with open(path, "r", encoding="utf-8") as f:
        kg = json.load(f)
    ingest_kg_json(kg)
    print("Ingest finished for", path)
