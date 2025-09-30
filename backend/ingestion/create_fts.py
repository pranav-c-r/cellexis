import sqlite3
import json
import os

# Paths
jsonl_file = "chunks.jsonl"
db_file = "chunks.db"

# Remove old database if exists
if os.path.exists(db_file):
    os.remove(db_file)

# Connect to SQLite
conn = sqlite3.connect(db_file)
c = conn.cursor()

# Create FTS table
c.execute("""
CREATE VIRTUAL TABLE chunks USING fts5(
    paper_id UNINDEXED,
    text
)
""")

# Insert data from chunks.jsonl
with open(jsonl_file, "r", encoding="utf-8") as f:
    for line in f:
        chunk = json.loads(line)
        c.execute("INSERT INTO chunks (paper_id, text) VALUES (?, ?)",
                  (chunk["paper_id"], chunk["text"]))

# Commit and close
conn.commit()
conn.close()

print(f"{db_file} created with {jsonl_file} data!")
