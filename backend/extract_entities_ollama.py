import json
import subprocess
from tqdm import tqdm
import re
from dotenv import load_dotenv
import os

# Load environment variables if needed (not strictly required here)
load_dotenv()

# Input/Output files
CHUNKS_FILE = "data/papers/1_chunks.jsonl"
OUTPUT_FILE = "data/papers/1_entities.jsonl"

# Load chunks
chunks = []
with open(CHUNKS_FILE, "r", encoding="utf-8") as f:
    for line in f:
        chunks.append(json.loads(line))

print(f"Loaded {len(chunks)} chunks.")

# Prompt template
PROMPT_TEMPLATE = """
Extract the following fields from the scientific text:

- organism (e.g., "Mus musculus", "Arabidopsis", "Drosophila")
- assay (e.g., "RNA-seq", "in vivo", "PCR")
- gene (e.g., "AT1G01010", "GAPDH")
- mission (e.g., "Bion-M1", "ISS2025")
- experimenttype (e.g., "Microgravity", "Control")
- outcome (summary of experimental findings)

⚠️ **Return STRICT JSON ONLY, no extra text, no explanation.**
⚠️ If a field is unknown or not mentioned, return it as an empty list.

Output Example:
{{
  "organism": ["Mus musculus"],
  "assay": ["in vivo"],
  "gene": [],
  "mission": ["Bion-M1"],
  "experimenttype": ["Microgravity"],
  "outcome": ["Increased bone loss"]
}}

Text:
{chunk_text}
"""

# Function to call Ollama
def run_ollama(model, prompt):
    result = subprocess.run(
        ["ollama", "run", model],
        input=prompt.encode("utf-8"),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    return result.stdout.decode("utf-8", errors="ignore")

# Robust JSON extractor to prevent hallucinations from breaking the pipeline
def extract_json_from_string(s):
    try:
        return json.loads(s)
    except json.JSONDecodeError:
        # Attempt to find JSON inside text
        match = re.search(r"\{.*\}", s, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except:
                pass
        # fallback to empty fields
        return {
            "organism": [],
            "assay": [],
            "gene": [],
            "mission": [],
            "experimenttype": [],
            "outcome": []
        }

# Model to use
model = "phi3:mini"  # or replace with "llama2:7b-chat" for higher accuracy

# Process each chunk
with open(OUTPUT_FILE, "w", encoding="utf-8") as out_f:
    for chunk in tqdm(chunks, desc="Extracting entities"):
        prompt = PROMPT_TEMPLATE.format(chunk_text=chunk["text"])
        response = run_ollama(model, prompt)
        parsed = extract_json_from_string(response)

        # Merge parsed entities with original chunk metadata
        chunk.update(parsed)
        out_f.write(json.dumps(chunk, ensure_ascii=False) + "\n")

print(f"✅ Saved structured entity data → {OUTPUT_FILE}")