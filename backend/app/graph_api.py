# backend/app/graph_api.py
from fastapi import APIRouter, Query
from neo4j_client import get_driver

router = APIRouter()

CYTOSCAPE_LIMIT = 2000

GRAPH_QUERY = """
MATCH p=(s {name:$name})-[*1..$hops]-(t)
WITH collect(DISTINCT p) as paths
UNWIND paths as path
UNWIND nodes(path) as n
UNWIND relationships(path) as r
WITH collect(DISTINCT {id:id(n), name: n.name, labels: labels(n), props: properties(n)}) as nodes,
     collect(DISTINCT {id:id(r), source: id(startNode(r)), target: id(endNode(r)), type: type(r), props: properties(r)}) as rels
RETURN nodes, rels
"""

@router.get("/")
def root():
    return {"ok": True, "note": "Use /graph?name=...&hops=1"}

@router.get("/graph")
def get_graph(name: str = Query(..., description="node name"), hops: int = Query(1, ge=1, le=4)):
    driver = get_driver()
    with driver.session() as session:
        rec = session.run(GRAPH_QUERY, name=name, hops=hops).single()
        if not rec:
            return {"elements": {"nodes": [], "edges": []}}
        nodes = rec["nodes"]
        rels = rec["rels"]

        cy_nodes = []
        for n in nodes:
            props = n.get("props", {}) or {}
            cy_nodes.append({"data": {"id": str(n["id"]), "label": n.get("name"), "type": (n.get("labels") or [None])[0], **props}})

        cy_edges = []
        for r in rels:
            props = r.get("props", {}) or {}
            cy_edges.append({"data": {"id": str(r["id"]), "source": str(r["source"]), "target": str(r["target"]), "type": r.get("type"), **props}})

        return {"elements": {"nodes": cy_nodes[:CYTOSCAPE_LIMIT], "edges": cy_edges[:CYTOSCAPE_LIMIT]}}
