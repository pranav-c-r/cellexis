# backend/app/test_aura_connect.py
from dotenv import load_dotenv
import os
from neo4j import GraphDatabase

# load .env relative to this file (backend/.env)
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

uri = os.getenv("NEO4J_URI")
user = os.getenv("NEO4J_USER")
# support both names in case .env uses NEO4J_PASS or NEO4J_PASSWORD
pwd = os.getenv("NEO4J_PASSWORD") 

print("NEO4J_URI:", uri)
print("NEO4J_USER:", user)
print("PASSWORD present?:", bool(pwd))
print("PASSWORD length (masked):", len(pwd) if pwd else 0)

try:
    driver = GraphDatabase.driver(uri, auth=(user, pwd))
    with driver.session() as session:
        r = session.run("RETURN 'ok' AS status")
        print("DB response:", r.single())
except Exception as e:
    print("CONNECT ERROR:", repr(e))
