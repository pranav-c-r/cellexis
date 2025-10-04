import os
import re
import json

# Input cleaned text file
input_file = "data/papers/1_cleaned.txt"
paper_id = "1"

# Output JSONL file (one chunk per line)
output_file = "data/papers/1_chunks.jsonl"

# Load the text
with open(input_file, "r", encoding="utf-8") as f:
    text = f.read()

# --- Step 1: Pre-cleaning ---
# Remove excessive spaces, fix word merges (optional hack)
text = re.sub(r"\s+", " ", text)   # collapse multiple spaces/newlines
text = re.sub(r"([a-z])([A-Z])", r"\1. \2", text)  # sometimes fixes "wordWord" merges

# --- Step 2: Chunking ---
def chunk_text(text, max_chars=800, overlap=100):
    """
    Split text into chunks with sliding window overlap.
    Keeps semantic continuity.
    """
    chunks = []
    start = 0
    while start < len(text):
        end = start + max_chars
        chunk = text[start:end]
        # try to break at last period near the limit
        if end < len(text):
            period = chunk.rfind(".")
            if period != -1 and period > max_chars * 0.5:
                chunk = chunk[:period+1]
                end = start + period + 1
        chunks.append(chunk.strip())
        start = end - overlap  # sliding window overlap
    return chunks

chunks = chunk_text(text, max_chars=800, overlap=100)

# --- Step 3: Save to JSONL ---
with open(output_file, "w", encoding="utf-8") as f:
    for i, chunk in enumerate(chunks):
        obj = {
            "paper_id": paper_id,
            "chunk_id": f"{paper_id}_{i}",
            "text": chunk,
            "organism": [],
            "assay": [],
            "gene": [],
            "mission": [],
            "experimenttype": [],
            "outcome": []
        }
        f.write(json.dumps(obj, ensure_ascii=False) + "\n")

print(f"✅ Chunked {len(chunks)} segments saved to {output_file}")
