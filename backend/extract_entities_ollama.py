import json
import subprocess
from tqdm import tqdm

# Input (chunks file)
CHUNKS_FILE = "data/papers/1_chunks.jsonl"
OUTPUT_FILE = "data/papers/1_entities.jsonl"

# Load chunks
chunks = []
with open(CHUNKS_FILE, "r", encoding="utf-8") as f:
    for line in f:
        chunks.append(json.loads(line))

print(f"Loaded {len(chunks)} chunks.")

# Define the prompt template
PROMPT_TEMPLATE = """
Extract the following fields from the given scientific text:

- organism (e.g., "Mus musculus", "Arabidopsis", "Drosophila")
- assay (e.g., "RNA-seq", "in vivo", "PCR")
- gene (e.g., "AT1G01010", "GAPDH")
- mission (e.g., "Bion-M1", "ISS2025")
- experimenttype (e.g., "Microgravity", "Control")
- outcome (summary of experimental findings)

Return the output **strictly in JSON**, no explanation.

Example:
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

model = "phi3:mini"  # lighter & faster

# Process each chunk
with open(OUTPUT_FILE, "w", encoding="utf-8") as out_f:
    for chunk in tqdm(chunks, desc="Extracting entities"):
        prompt = PROMPT_TEMPLATE.format(chunk_text=chunk["text"])
        response = run_ollama(model, prompt)

        try:
            parsed = json.loads(response)
        except json.JSONDecodeError:
            parsed = {
                "organism": [],
                "assay": [],
                "gene": [],
                "mission": [],
                "experimenttype": [],
                "outcome": [response.strip()[:200]],
            }

        # Merge with chunk metadata
        chunk.update(parsed)
        out_f.write(json.dumps(chunk, ensure_ascii=False) + "\n")

print(f"✅ Saved structured data → {OUTPUT_FILE}")
