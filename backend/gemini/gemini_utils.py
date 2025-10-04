import google.generativeai as genai
import json
import os
from dotenv import load_dotenv

# Load env variables from the correct location
# Get the backend directory (parent of gemini directory)
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(backend_dir, ".env")
print(f"Loading .env from: {env_path}")
load_dotenv(env_path)

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError(f"⚠️ GEMINI_API_KEY not found in .env file at {env_path}")

# Configure Gemini
genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-2.0-flash")


# 1️⃣ Summarize function
def summarize(text: str) -> dict:
    """
    Summarize a paper chunk in exactly 1 line + 3 bullets (Experiment → Result → Implication).
    """
    prompt = f"""
Summarize the following text in exactly 1 line + 3 concise bullets.
Bullets must follow the format: Experiment → Result → Implication.

Text:
{text}
"""
    response = model.generate_content(prompt)
    return {"summary": response.text.strip()}


# 2️⃣ Question Answering (QA) function
def qa(query: str, snippets: list) -> dict:
    """
    Answer a question using only the provided snippets.
    Always include citations in [paper_id:page_num] format.
    """
    snippets_text = "\n".join(snippets)
    prompt = f"""
Answer the question using ONLY the following snippets.
Always cite sources using [paper_id:page_num].

Question: {query}
Snippets:
{snippets_text}
"""
    response = model.generate_content(prompt)
    return {"answer": response.text.strip()}


# 3️⃣ Knowledge Graph Extraction
def extract_kg(text: str) -> dict:
    """
    Extract entities (Organism, ExperimentType, Assay, Outcome, Mission)
    and relationships (STUDIES, USES, PERFORMED_ON, REPORTS).
    Return strictly in JSON format.
    """
    prompt = f"""
Extract entities (Organism, ExperimentType, Assay, Outcome, Mission)
and relations (STUDIES, USES, PERFORMED_ON, REPORTS) from the text below.
Return strictly in JSON with two keys: "entities", "relations".

Text:
{text}
"""
    response = model.generate_content(prompt)
    return {"kg_json": response.text.strip()}


# 4️⃣ Safe KG extraction (with validation)
def safe_extract_kg(text: str) -> dict:
    """
    Ensures KG JSON is valid. Returns empty lists if parsing fails.
    """
    try:
        kg = extract_kg(text)
        parsed = json.loads(kg["kg_json"])
        return {
            "entities": parsed.get("entities", []),
            "relations": parsed.get("relations", [])
        }
    except Exception:
        return {"entities": [], "relations": []}
