import json
import subprocess
from tqdm import tqdm
import re
from dotenv import load_dotenv
from pathlib import Path
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

load_dotenv()


class BatchEntityExtractor:
    """
    Extract entities from multiple PDF chunks using Ollama
    """
    
    def __init__(self, chunks_directory, output_directory, model="phi3:mini", max_workers=4):
        """
        Args:
            chunks_directory: Directory containing chunk JSONL files
            output_directory: Directory to save entity-enriched JSONL files
            model: Ollama model to use
            max_workers: Number of parallel workers (adjust based on your system)
        """
        self.chunks_dir = Path(chunks_directory)
        self.output_dir = Path(output_directory)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.model = model
        self.max_workers = max_workers
        
        # Thread lock for safe file writing
        self.write_lock = threading.Lock()
        
        self.prompt_template = """
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
    
    def run_ollama(self, prompt):
        """Call Ollama with the given prompt"""
        try:
            result = subprocess.run(
                [r"C:\Users\Sona Jomon\AppData\Local\Programs\Ollama\ollama.exe", "run", self.model],
                input=prompt.encode("utf-8"),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=30  # 30 second timeout per chunk
            )
            return result.stdout.decode("utf-8", errors="ignore")
        except subprocess.TimeoutExpired:
            print(f"⚠️  Timeout for chunk")
            return "{}"
        except Exception as e:
            print(f"⚠️  Error calling Ollama: {str(e)}")
            return "{}"
    
    def extract_json_from_string(self, s):
        """Robust JSON extractor to handle hallucinations"""
        try:
            return json.loads(s)
        except json.JSONDecodeError:
            # Try to find JSON inside text
            match = re.search(r"\{.*\}", s, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group())
                except:
                    pass
            # Fallback to empty fields
            return {
                "organism": [],
                "assay": [],
                "gene": [],
                "mission": [],
                "experimenttype": [],
                "outcome": []
            }
    
    def process_single_chunk(self, chunk):
        """Process a single chunk and extract entities"""
        prompt = self.prompt_template.format(chunk_text=chunk["text"])
        response = self.run_ollama(prompt)
        parsed_entities = self.extract_json_from_string(response)
        
        # Merge entities with original chunk
        chunk.update(parsed_entities)
        return chunk
    
    def process_chunks_file(self, chunks_file):
        """Process all chunks in a single file"""
        paper_id = chunks_file.stem.replace("_chunks", "")
        output_file = self.output_dir / f"{paper_id}_entities.jsonl"
        
        try:
            # Load chunks from file
            chunks = []
            with open(chunks_file, "r", encoding="utf-8") as f:
                for line in f:
                    chunks.append(json.loads(line))
            
            if not chunks:
                print(f"⚠️  No chunks in {chunks_file.name}")
                return None
            
            # Process each chunk with progress bar
            enriched_chunks = []
            for chunk in tqdm(chunks, desc=f"Processing {paper_id}", leave=False):
                enriched_chunk = self.process_single_chunk(chunk)
                enriched_chunks.append(enriched_chunk)
            
            # Save to output file
            with open(output_file, "w", encoding="utf-8") as f:
                for chunk in enriched_chunks:
                    f.write(json.dumps(chunk, ensure_ascii=False) + "\n")
            
            return {
                'paper_id': paper_id,
                'chunks_processed': len(enriched_chunks),
                'status': 'success'
            }
            
        except Exception as e:
            print(f"❌ Error processing {chunks_file.name}: {str(e)}")
            return {
                'paper_id': paper_id,
                'chunks_processed': 0,
                'status': 'failed',
                'error': str(e)
            }
    
    def process_all_files(self, max_files=100):
        """Process all chunk files"""
        chunk_files = sorted(list(self.chunks_dir.glob("*_chunks.jsonl")))[:max_files]
        
        if not chunk_files:
            print(f"❌ No chunk files found in {self.chunks_dir}")
            return
        
        print("="*70)
        print(f"🚀 BATCH ENTITY EXTRACTION")
        print("="*70)
        print(f"📂 Input Directory: {self.chunks_dir}")
        print(f"📂 Output Directory: {self.output_dir}")
        print(f"🤖 Model: {self.model}")
        print(f"📄 Files to process: {len(chunk_files)}")
        print(f"⚙️  Workers: {self.max_workers}")
        print("="*70)
        
        stats = {
            'total_files': len(chunk_files),
            'successful': 0,
            'failed': 0,
            'total_chunks': 0
        }
        
        start_time = time.time()
        
        # Process files sequentially (to avoid overwhelming Ollama)
        # If you want parallel processing, use ThreadPoolExecutor
        for chunk_file in tqdm(chunk_files, desc="Processing files"):
            result = self.process_chunks_file(chunk_file)
            
            if result:
                if result['status'] == 'success':
                    stats['successful'] += 1
                    stats['total_chunks'] += result['chunks_processed']
                else:
                    stats['failed'] += 1
        
        elapsed_time = time.time() - start_time
        
        # Print final summary
        print("\n" + "="*70)
        print("🎉 ENTITY EXTRACTION COMPLETE!")
        print("="*70)
        print(f"✅ Successfully processed: {stats['successful']} files")
        print(f"❌ Failed: {stats['failed']} files")
        print(f"📝 Total chunks enriched: {stats['total_chunks']}")
        print(f"⏱️  Time elapsed: {elapsed_time/60:.2f} minutes")
        print(f"⚡ Average speed: {stats['total_chunks']/(elapsed_time/60):.1f} chunks/minute")
        print(f"📂 Output location: {self.output_dir}")
        print("="*70)
        
        return stats


class ParallelEntityExtractor(BatchEntityExtractor):
    """
    Faster version using parallel processing
    WARNING: May overwhelm Ollama if max_workers is too high
    """
    
    def process_all_files_parallel(self, max_files=100):
        """Process all chunk files in parallel"""
        chunk_files = sorted(list(self.chunks_dir.glob("*_chunks.jsonl")))[:max_files]
        
        if not chunk_files:
            print(f"❌ No chunk files found in {self.chunks_dir}")
            return
        
        print("="*70)
        print(f"🚀 PARALLEL ENTITY EXTRACTION")
        print("="*70)
        print(f"📂 Input Directory: {self.chunks_dir}")
        print(f"📂 Output Directory: {self.output_dir}")
        print(f"🤖 Model: {self.model}")
        print(f"📄 Files to process: {len(chunk_files)}")
        print(f"⚙️  Parallel Workers: {self.max_workers}")
        print("="*70)
        
        stats = {
            'total_files': len(chunk_files),
            'successful': 0,
            'failed': 0,
            'total_chunks': 0
        }
        
        start_time = time.time()
        
        # Process files in parallel
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            future_to_file = {
                executor.submit(self.process_chunks_file, chunk_file): chunk_file 
                for chunk_file in chunk_files
            }
            
            with tqdm(total=len(chunk_files), desc="Processing files") as pbar:
                for future in as_completed(future_to_file):
                    result = future.result()
                    
                    if result:
                        if result['status'] == 'success':
                            stats['successful'] += 1
                            stats['total_chunks'] += result['chunks_processed']
                        else:
                            stats['failed'] += 1
                    
                    pbar.update(1)
        
        elapsed_time = time.time() - start_time
        
        # Print final summary
        print("\n" + "="*70)
        print("🎉 PARALLEL EXTRACTION COMPLETE!")
        print("="*70)
        print(f"✅ Successfully processed: {stats['successful']} files")
        print(f"❌ Failed: {stats['failed']} files")
        print(f"📝 Total chunks enriched: {stats['total_chunks']}")
        print(f"⏱️  Time elapsed: {elapsed_time/60:.2f} minutes")
        print(f"⚡ Average speed: {stats['total_chunks']/(elapsed_time/60):.1f} chunks/minute")
        print(f"📂 Output location: {self.output_dir}")
        print("="*70)
        
        return stats


# ==================== USAGE ====================

if __name__ == "__main__":
    # Configuration
    CHUNKS_DIRECTORY = "data/chunks"
    OUTPUT_DIRECTORY = "data/entities"
    MODEL = "phi3:mini"  # or "llama2:7b-chat" for better accuracy
    MAX_FILES = 100
    
    # Choose extraction method:
    
    # OPTION 1: Sequential Processing (RECOMMENDED - more stable)
    # print("Using Sequential Processing (recommended for stability)")
    # extractor = BatchEntityExtractor(
    #     chunks_directory=CHUNKS_DIRECTORY,
    #     output_directory=OUTPUT_DIRECTORY,
    #     model=MODEL
    # )
    # stats = extractor.process_all_files(max_files=MAX_FILES)
    
    # OPTION 2: Parallel Processing (FASTER but may overwhelm Ollama)
    # Uncomment below to use parallel processing:
    
    print("Using Parallel Processing (faster but more resource intensive)")
    extractor = ParallelEntityExtractor(
        chunks_directory=CHUNKS_DIRECTORY,
        output_directory=OUTPUT_DIRECTORY,
        model=MODEL,
        max_workers=2  # Start with 2, increase if your system can handle it
    )
    stats = extractor.process_all_files_parallel(max_files=MAX_FILES)
    
    
    # Optional: Validate results
    print("\n📊 VALIDATION CHECK")
    print("="*70)
    
    entities_dir = Path(OUTPUT_DIRECTORY)
    entity_files = list(entities_dir.glob("*_entities.jsonl"))
    
    if entity_files:
        # Check first file as sample
        sample_file = entity_files[0]
        print(f"Sample file: {sample_file.name}")
        
        with open(sample_file, "r") as f:
            sample_chunk = json.loads(f.readline())
            print(f"\nSample enriched chunk:")
            print(f"  Paper ID: {sample_chunk.get('paper_id', 'N/A')}")
            print(f"  Chunk ID: {sample_chunk.get('chunk_id', 'N/A')}")
            print(f"  Organism: {sample_chunk.get('organism', [])}")
            print(f"  Assay: {sample_chunk.get('assay', [])}")
            print(f"  Gene: {sample_chunk.get('gene', [])}")
            print(f"  Mission: {sample_chunk.get('mission', [])}")
            print(f"  Experiment Type: {sample_chunk.get('experimenttype', [])}")
            print(f"  Outcome: {sample_chunk.get('outcome', [])}")