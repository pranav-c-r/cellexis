from fastapi import FastAPI
from app.neo4j_client import driver

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Backend is running!"}

@app.get("/pingdb")
def ping_db():
    try:
        with driver.session() as session:
            result = session.run("RETURN 'Neo4j connected' AS msg")
            return {"status": result.single()["msg"]}
    except Exception as e:
        return {"error": str(e)}
