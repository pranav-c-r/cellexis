import faiss
import json
from sentence_transformers import SentenceTransformer
import numpy as np

# --- Load FAISS index ---
faiss_index_file = "data/faiss_index.idx"
index = faiss.read_index(faiss_index_file)
print(f"✅ FAISS index loaded with {index.ntotal} vectors")

# --- Load chunk metadata ---
with open("data/chunk_metadata.json", "r", encoding="utf-8") as f:
    chunks = json.load(f)
print(f"✅ Loaded metadata for {len(chunks)} chunks")

# --- Load embedding model ---
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
print("✅ Embedding model loaded")

# --- Helper: search function ---
def search_faiss(query, top_k=5):
    query_embedding = model.encode([query], convert_to_numpy=True)
    # normalize for cosine similarity
    faiss.normalize_L2(query_embedding)
    
    distances, indices = index.search(query_embedding, top_k)
    
    results = []
    for idx, score in zip(indices[0], distances[0]):
        chunk_info = chunks[idx]
        results.append({
            "score": float(score),
            "paper_id": chunk_info["paper_id"],
            "chunk_id": chunk_info["chunk_id"],
            "text": chunk_info["text"]
        })
    return results

# --- Interactive querying ---
if __name__ == "__main__":
    print("\nEnter your query (type 'exit' to quit):")
    while True:
        query = input(">> ").strip()
        if query.lower() in ["exit", "quit"]:
            break
        results = search_faiss(query, top_k=5)
        print("\nTop results:\n")
        for i, r in enumerate(results, 1):
            print(f"{i}. [Paper {r['paper_id']} | Chunk {r['chunk_id']} | Score {r['score']:.3f}]")
            print(r["text"][:500] + "...\n")  # print first 500 chars
        print("-" * 80)
