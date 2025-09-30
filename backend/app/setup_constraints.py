# backend/app/setup_constraints.py
from neo4j_client import get_driver

CONSTRAINTS = [
    ("Organism", "name"),
    ("ExperimentType", "name"),
    ("Assay", "name"),
    ("Outcome", "name"),
    ("Mission", "name"),
    ("Gene", "name"),
    ("Paper", "paper_id"),
    ("Document", "id"),
]

CREATE_TEMPLATE = "CREATE CONSTRAINT IF NOT EXISTS FOR (n:{label}) REQUIRE n.{prop} IS UNIQUE"

def run():
    driver = get_driver()
    with driver.session() as session:
        for label, prop in CONSTRAINTS:
            cypher = CREATE_TEMPLATE.format(label=label, prop=prop)
            session.run(cypher)
            print("Ensured constraint:", cypher)

if __name__ == "__main__":
    run()
    print("Constraints created.")
