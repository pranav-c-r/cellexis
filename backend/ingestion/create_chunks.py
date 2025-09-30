import pandas as pd
import json
import os

# Load metadata
df = pd.read_csv("metadata.csv")

# Output file
output_file = "chunks.jsonl"

# Function to split text into chunks of ~500 chars
def chunk_text(text, chunk_size=500):
    text = str(text).replace("\n", " ").strip()
    return [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]

with open(output_file, "w", encoding="utf-8") as f:
    for _, row in df.iterrows():
        paper_id = row["paper_id"]
        text = row["title"]  # use title since abstract not available
        chunks = chunk_text(text)
        for chunk in chunks:
            json_obj = {
                "paper_id": paper_id,
                "text": chunk,
                "source": "title"
            }
            f.write(json.dumps(json_obj, ensure_ascii=False) + "\n")

print(f"{output_file} created successfully!")
