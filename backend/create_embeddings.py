import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from pathlib import Path
from tqdm import tqdm

class BatchEmbeddingCreator:
    """
    Creates embeddings for multiple PDF chunks and builds a unified FAISS index
    """
    
    def __init__(self, chunks_directory, output_directory, model_name="sentence-transformers/all-MiniLM-L6-v2"):
        """
        Args:
            chunks_directory: Directory containing JSONL chunk files
            output_directory: Directory to save FAISS index and metadata
            model_name: HuggingFace model name for embeddings
        """
        self.chunks_dir = Path(chunks_directory)
        self.output_dir = Path(output_directory)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"🤖 Loading embedding model: {model_name}")
        self.model = SentenceTransformer(model_name)
        print(f"✅ Model loaded (dimension: {self.model.get_sentence_embedding_dimension()})")
    
    def load_all_chunks(self, max_files=100):
        """Load chunks from all JSONL files in the directory"""
        chunk_files = sorted(list(self.chunks_dir.glob("*_chunks.jsonl")))[:max_files]
        
        if not chunk_files:
            raise FileNotFoundError(f"No chunk files found in {self.chunks_dir}")
        
        print(f"\n📂 Found {len(chunk_files)} chunk files")
        
        all_chunks = []
        stats = {
            'total_files': len(chunk_files),
            'total_chunks': 0,
            'failed_files': 0
        }
        
        for chunk_file in tqdm(chunk_files, desc="Loading chunks"):
            try:
                with open(chunk_file, "r", encoding="utf-8") as f:
                    file_chunks = [json.loads(line) for line in f]
                    all_chunks.extend(file_chunks)
                    stats['total_chunks'] += len(file_chunks)
            except Exception as e:
                print(f"⚠️  Error loading {chunk_file.name}: {str(e)}")
                stats['failed_files'] += 1
        
        print(f"\n📊 Loading Summary:")
        print(f"   ✅ Successfully loaded: {stats['total_files'] - stats['failed_files']} files")
        print(f"   ❌ Failed: {stats['failed_files']} files")
        print(f"   📝 Total chunks: {stats['total_chunks']}")
        
        return all_chunks
    
    def create_embeddings(self, chunks, batch_size=32):
        """Create embeddings for all chunks"""
        print(f"\n🔄 Creating embeddings for {len(chunks)} chunks...")
        
        texts = [chunk["text"] for chunk in chunks]
        
        # Encode with progress bar
        embeddings = self.model.encode(
            texts,
            convert_to_numpy=True,
            show_progress_bar=True,
            batch_size=batch_size
        )
        
        print(f"✅ Created embeddings: shape {embeddings.shape}")
        
        return embeddings
    
    def build_faiss_index(self, embeddings):
        """Build FAISS index with cosine similarity"""
        print(f"\n🔨 Building FAISS index...")
        
        dimension = embeddings.shape[1]
        
        # Create index (Inner Product for cosine similarity)
        index = faiss.IndexFlatIP(dimension)
        
        # Normalize embeddings for cosine similarity
        faiss.normalize_L2(embeddings)
        
        # Add to index
        index.add(embeddings)
        
        print(f"✅ FAISS index built with {index.ntotal} vectors")
        
        return index
    
    def save_index_and_metadata(self, index, chunks):
        """Save FAISS index and chunk metadata"""
        # Save FAISS index
        index_path = self.output_dir / "faiss_index.idx"
        faiss.write_index(index, str(index_path))
        print(f"💾 Saved FAISS index to: {index_path}")
        
        # Save chunk metadata (maps FAISS ID → chunk data)
        metadata_path = self.output_dir / "chunk_metadata.json"
        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(chunks, f, ensure_ascii=False, indent=2)
        print(f"💾 Saved metadata to: {metadata_path}")
        
        # Save index statistics
        stats_path = self.output_dir / "index_stats.json"
        stats = {
            "total_vectors": index.ntotal,
            "dimension": index.d,
            "total_chunks": len(chunks),
            "unique_papers": len(set(chunk["paper_id"] for chunk in chunks)),
            "model": self.model._model_card_vars.get("model_name", "unknown")
        }
        with open(stats_path, "w", encoding="utf-8") as f:
            json.dump(stats, f, indent=2)
        print(f"💾 Saved statistics to: {stats_path}")
        
        return index_path, metadata_path
    
    def create_paper_index_mapping(self, chunks):
        """Create a mapping of paper_id to chunk indices for quick filtering"""
        paper_mapping = {}
        for idx, chunk in enumerate(chunks):
            paper_id = chunk["paper_id"]
            if paper_id not in paper_mapping:
                paper_mapping[paper_id] = []
            paper_mapping[paper_id].append(idx)
        
        mapping_path = self.output_dir / "paper_index_mapping.json"
        with open(mapping_path, "w", encoding="utf-8") as f:
            json.dump(paper_mapping, f, indent=2)
        
        print(f"💾 Saved paper mapping to: {mapping_path}")
        return paper_mapping
    
    def run_pipeline(self, max_files=100, batch_size=32):
        """Run the complete embedding pipeline"""
        print("="*70)
        print("🚀 BATCH EMBEDDING CREATION PIPELINE")
        print("="*70)
        
        # Step 1: Load all chunks
        chunks = self.load_all_chunks(max_files=max_files)
        
        if not chunks:
            print("❌ No chunks to process!")
            return
        
        # Step 2: Create embeddings
        embeddings = self.create_embeddings(chunks, batch_size=batch_size)
        
        # Step 3: Build FAISS index
        index = self.build_faiss_index(embeddings)
        
        # Step 4: Save everything
        index_path, metadata_path = self.save_index_and_metadata(index, chunks)
        
        # Step 5: Create paper mapping (useful for filtering)
        paper_mapping = self.create_paper_index_mapping(chunks)
        
        # Final summary
        print("\n" + "="*70)
        print("🎉 PIPELINE COMPLETE!")
        print("="*70)
        print(f"📊 Total Papers: {len(paper_mapping)}")
        print(f"📝 Total Chunks: {len(chunks)}")
        print(f"🔢 Embedding Dimension: {embeddings.shape[1]}")
        print(f"📂 Output Directory: {self.output_dir}")
        print("="*70)
        
        return {
            'index': index,
            'chunks': chunks,
            'embeddings': embeddings,
            'paper_mapping': paper_mapping
        }


class FAISSSearcher:
    """
    Helper class for searching the FAISS index
    """
    
    def __init__(self, index_path, metadata_path, model_name="sentence-transformers/all-MiniLM-L6-v2"):
        """Load FAISS index and metadata"""
        print(f"📂 Loading FAISS index from: {index_path}")
        self.index = faiss.read_index(str(index_path))
        
        print(f"📂 Loading metadata from: {metadata_path}")
        with open(metadata_path, "r", encoding="utf-8") as f:
            self.chunks = json.load(f)
        
        print(f"🤖 Loading model: {model_name}")
        self.model = SentenceTransformer(model_name)
        
        print(f"✅ Loaded index with {self.index.ntotal} vectors")
    
    def search(self, query, top_k=5, filter_paper_id=None):
        """
        Search for similar chunks
        
        Args:
            query: Search query text
            top_k: Number of results to return
            filter_paper_id: Optional paper_id to filter results
        """
        # Encode query
        query_embedding = self.model.encode([query], convert_to_numpy=True)
        faiss.normalize_L2(query_embedding)
        
        # Search
        if filter_paper_id:
            # Filter by paper_id (simple post-filtering)
            distances, indices = self.index.search(query_embedding, top_k * 10)
            
            filtered_results = []
            for dist, idx in zip(distances[0], indices[0]):
                if self.chunks[idx]["paper_id"] == filter_paper_id:
                    filtered_results.append((dist, idx))
                    if len(filtered_results) >= top_k:
                        break
            
            return [(self.chunks[idx], float(dist)) for dist, idx in filtered_results]
        else:
            distances, indices = self.index.search(query_embedding, top_k)
            return [(self.chunks[idx], float(dist)) for idx, dist in zip(indices[0], distances[0])]


# ==================== USAGE ====================

if __name__ == "__main__":
    # Configuration
    CHUNKS_DIRECTORY = "data/chunks"
    OUTPUT_DIRECTORY = "data/embeddings"
    MAX_FILES = 100  # Process first 100 PDFs
    BATCH_SIZE = 32  # Adjust based on your GPU/CPU memory
    
    # Create embeddings
    creator = BatchEmbeddingCreator(
        chunks_directory=CHUNKS_DIRECTORY,
        output_directory=OUTPUT_DIRECTORY
    )
    
    results = creator.run_pipeline(max_files=MAX_FILES, batch_size=BATCH_SIZE)
    
    # Optional: Test the search functionality
    print("\n" + "="*70)
    print("🔍 TESTING SEARCH FUNCTIONALITY")
    print("="*70)
    
    searcher = FAISSSearcher(
        index_path=OUTPUT_DIRECTORY + "/faiss_index.idx",
        metadata_path=OUTPUT_DIRECTORY + "/chunk_metadata.json"
    )
    
    # Example search
    test_query = "microgravity effects on mice"
    print(f"\n🔎 Query: '{test_query}'")
    print("\nTop 3 Results:")
    
    search_results = searcher.search(test_query, top_k=3)
    for i, (chunk, score) in enumerate(search_results, 1):
        print(f"\n{i}. Score: {score:.4f} | Paper: {chunk['paper_id']} | Chunk: {chunk['chunk_id']}")
        print(f"   Text: {chunk['text'][:150]}...")