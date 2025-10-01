import csv
import json
#from neo4j_client import get_driver

ALLOWED_LABELS = {"Organism","ExperimentType","Assay","Outcome","Mission","Gene","Paper","Document"}

def ingest_from_metadata_and_chunks(metadata_path, chunks_path):
    from neo4j_client import driver


    # 1️⃣ Load metadata
    papers = {}
    with open(metadata_path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            papers[row['paper_id']] = row

    # 2️⃣ Load chunks
    chunks = []
    with open(chunks_path, 'r', encoding='utf-8') as f:
        for line in f:
            chunks.append(json.loads(line))

    with driver.session() as session:
        # 3️⃣ Insert Paper nodes
        for paper_id, paper in papers.items():
            session.run(
                "MERGE (p:Paper {paper_id: $pid, title: $title})",
                pid=paper_id, title=paper['title']
            )

        # 4️⃣ Insert Chunk nodes (as Document nodes)
        for chunk in chunks:
            session.run(
                """
                MERGE (d:Document {text: $text, paper_id: $pid, source: $source})
                """,
                text=chunk['text'], pid=chunk['paper_id'], source=chunk.get('source','unknown')
            )

        # OPTIONAL: create Paper->Document relationship
        for chunk in chunks:
            session.run(
                """
                MATCH (p:Paper {paper_id: $pid})
                MATCH (d:Document {text: $text, paper_id: $pid})
                MERGE (p)-[:HAS_CHUNK]->(d)
                """,
                pid=chunk['paper_id'], text=chunk['text']
            )

if __name__ == "__main__":
    metadata_path = "data/metadata2.csv"
    chunks_path = "data/chunks.jsonl"
    ingest_from_metadata_and_chunks(metadata_path, chunks_path)
    print(f"Ingest finished for metadata: {metadata_path} and chunks: {chunks_path}")