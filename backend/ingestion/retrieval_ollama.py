import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import subprocess
import textwrap

# === Load FAISS index and metadata ===
index = faiss.read_index("data/faiss_index.idx")

with open("data/chunk_metadata.json", "r", encoding="utf-8") as f:
    chunks = json.load(f)

# === Load the same embedding model used before ===
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

print("✅ FAISS index + embeddings model loaded.")

# === Retrieval loop ===
while True:
    query = input("\nEnter query (type 'exit' to quit):\n>> ").strip()
    if query.lower() == "exit":
        break

    # Step 1: Embed the query
    query_emb = model.encode([query], convert_to_numpy=True)
    faiss.normalize_L2(query_emb)

    # Step 2: Search FAISS index (top 3)
    k = 3
    scores, indices = index.search(query_emb, k)
    results = [(chunks[i], float(scores[0][idx])) for idx, i in enumerate(indices[0])]

    # Step 3: Format context for LLM
    context = "\n\n".join([
        f"Chunk {i+1} (Score {r[1]:.3f}):\n{textwrap.shorten(r[0]['text'], width=800)}"
        for i, r in enumerate(results)
    ])

    prompt = f"""You are a helpful research assistant.
Use the following extracted text chunks to answer the query **accurately** and **concisely**.

### Context
{context}

### Query
{query}

### Answer
"""

    # Step 4: Run Ollama llama2:7b-chat (streaming + UTF-8 safe)
    process = subprocess.Popen(
        [r"C:\Users\Sona Jomon\AppData\Local\Programs\Ollama\ollama.exe", "run", "llama2:7b-chat"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace"  # prevent UnicodeDecodeError
    )

    # Feed the prompt
    process.stdin.write(prompt)
    process.stdin.close()

    print("\n=== Ollama Response ===\n")
    for line in process.stdout:
        print(line, end="")
    process.wait()
    print("\n========================\n")
