import os
import re
import pandas as pd
from PyPDF2 import PdfReader
import json

METADATA_FILE = "backend/data/metadata2.csv"
PAPERS_DIR = "backend/data/papers"
OUTPUT_FILE = "backend/data/chunks.jsonl"

# Load metadata
metadata_df = pd.read_csv(METADATA_FILE)
metadata_df['paper_id'] = metadata_df['paper_id'].astype(str)

def extract_paper_id(filename):
    match = re.match(r"^(\d+)_", filename)
    return match.group(1) if match else None

with open(OUTPUT_FILE, "w", encoding="utf-8") as out_file:
    for pdf_file in os.listdir(PAPERS_DIR):
        if not pdf_file.endswith(".pdf"):
            continue

        paper_id = extract_paper_id(pdf_file)
        if paper_id is None:
            print(f"⚠️ Could not extract paper_id from {pdf_file}, skipping.")
            continue

        # Match metadata by paper_id
        row = metadata_df[metadata_df['paper_id'] == paper_id]
        if row.empty:
            print(f"⚠️ No metadata found for {pdf_file}, skipping.")
            continue

        title = row.iloc[0]['title']

        try:
            reader = PdfReader(os.path.join(PAPERS_DIR, pdf_file))
            for page_num, page in enumerate(reader.pages, start=1):
                text = page.extract_text()
                if not text:
                    continue
                # Split into 6 chunks per page
                words = text.split()
                chunk_size = max(1, len(words) // 6)
                for i in range(6):
                    chunk_words = words[i*chunk_size:(i+1)*chunk_size]
                    if not chunk_words:
                        continue
                    chunk_text = " ".join(chunk_words)
                    out_file.write(json.dumps({
                        "paper_id": paper_id,
                        "title": title,
                        "page": page_num,
                        "chunk_index": i,
                        "text": chunk_text
                    }, ensure_ascii=False) + "\n")
        except Exception as e:
            print(f"❌ Error reading {pdf_file}: {e}")

print(f"✅ Finished creating {OUTPUT_FILE}")
