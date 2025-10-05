import os
from dotenv import load_dotenv
from neo4j import GraphDatabase

# Load environment variables
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(backend_dir, ".env")
print(f"Loading .env from: {env_path}")
load_dotenv(env_path)

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "")

# Initialize driver only if URI is provided
if NEO4J_URI and NEO4J_PASSWORD:
    try:
        driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
        print(f"SUCCESS: Neo4j driver initialized successfully")
    except Exception as e:
        print(f"ERROR: Failed to initialize Neo4j driver: {e}")
        driver = None
else:
    print("WARNING: Neo4j environment variables not set. Graph features will be disabled.")
    driver = None

def get_driver():
    """Get the Neo4j driver instance"""
    return driver
