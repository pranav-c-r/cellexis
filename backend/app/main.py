# backend/app/main.py
from fastapi import FastAPI
from .graph_api import router as graph_router

app = FastAPI(title="KG Backend")

@app.get("/")
def root():
    return {"message": "Backend is alive 🚀"}

app.include_router(graph_router, prefix="")
