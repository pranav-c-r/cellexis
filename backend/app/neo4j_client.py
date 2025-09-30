# backend/app/neo4j_client.py
import os
import logging
from neo4j import GraphDatabase
from dotenv import load_dotenv

# Load .env from project root (backend/.env)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASS = os.getenv("NEO4J_PASS", "testpassword")

_driver = None

def get_driver():
    global _driver
    if _driver is None:
        logger.info("Connecting to Neo4j at %s", NEO4J_URI)
        _driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASS))
    return _driver

def close_driver():
    global _driver
    if _driver:
        _driver.close()
        _driver = None
