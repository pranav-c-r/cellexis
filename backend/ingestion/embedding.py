import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# Input file (chunks)
input_file = "data/papers/1_chunks.jsonl"

# Load chunks
chunks = []
with open(input_file, "r", encoding="utf-8") as f:
    for line in f:
        chunks.append(json.loads(line))

print(f"Loaded {len(chunks)} chunks.")

# Load free embedding model
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# Encode all chunk texts
texts = [chunk["text"] for chunk in chunks]
embeddings = model.encode(texts, convert_to_numpy=True, show_progress_bar=True)

# Create FAISS index (cosine similarity)
dimension = embeddings.shape[1]
index = faiss.IndexFlatIP(dimension)  # inner product for cosine
faiss.normalize_L2(embeddings)        # normalize for cosine sim
index.add(embeddings)

print(f"✅ FAISS index built with {index.ntotal} vectors")

# Save the index
faiss.write_index(index, "data/faiss_index.idx")

# Save mapping from FAISS ids -> chunk metadata
with open("data/chunk_metadata.json", "w", encoding="utf-8") as f:
    json.dump(chunks, f, ensure_ascii=False, indent=2)

print("✅ Saved FAISS index + metadata")
