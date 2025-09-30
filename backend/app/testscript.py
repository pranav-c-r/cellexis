from neo4j import GraphDatabase
import os
from dotenv import load_dotenv

# load backend/.env
load_dotenv("../.env")  # relative path from app/testscript.py to backend/.env

uri = os.getenv("NEO4J_URI")
user = os.getenv("NEO4J_USER")
password = os.getenv("NEO4J_PASSWORD")

driver = GraphDatabase.driver(uri, auth=(user, password))

with driver.session() as session:
    res = session.run("RETURN 1 AS ok")
    print(res.single())
