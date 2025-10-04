import faiss
import json
import os
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any
import sys

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)

from gemini.gemini_utils import qa

class RAGService:
    def __init__(self):
        """Initialize the RAG service with FAISS index and embedding model"""
        # Use absolute paths
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.index_path = os.path.join(backend_dir, "data", "faiss_index.idx")
        self.metadata_path = os.path.join(backend_dir, "data", "chunk_metadata.json")
        self.model_name = "sentence-transformers/all-MiniLM-L6-v2"
        
        # Load FAISS index
        if os.path.exists(self.index_path):
            try:
                self.index = faiss.read_index(self.index_path)
                print(f"✅ FAISS index loaded with {self.index.ntotal} vectors")
            except Exception as e:
                print(f"❌ Failed to load FAISS index: {e}")
                self.index = None
        else:
            print(f"⚠️ FAISS index not found at {self.index_path}")
            self.index = None
        
        # Load chunk metadata
        if os.path.exists(self.metadata_path):
            try:
                with open(self.metadata_path, "r", encoding="utf-8") as f:
                    self.chunks = json.load(f)
                print(f"✅ Loaded metadata for {len(self.chunks)} chunks")
            except Exception as e:
                print(f"❌ Failed to load chunk metadata: {e}")
                self.chunks = []
        else:
            print(f"⚠️ Chunk metadata not found at {self.metadata_path}")
            self.chunks = []
        
        # Load embedding model
        try:
            self.model = SentenceTransformer(self.model_name)
            print("✅ Embedding model loaded")
        except Exception as e:
            print(f"❌ Failed to load embedding model: {e}")
            self.model = None
    
    def search_chunks(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Search for relevant chunks using FAISS
        
        Args:
            query: Search query text
            top_k: Number of top results to return
            
        Returns:
            List of chunk dictionaries with metadata
        """
        if not self.index or not self.model or not self.chunks:
            return []
        
        try:
            # Encode query
            query_embedding = self.model.encode([query], convert_to_numpy=True)
            faiss.normalize_L2(query_embedding)
            
            # Search FAISS index
            distances, indices = self.index.search(query_embedding, top_k)
            
            results = []
            for idx, score in zip(indices[0], distances[0]):
                if idx < len(self.chunks):
                    chunk_info = self.chunks[idx]
                    results.append({
                        "score": float(score),
                        "paper_id": chunk_info.get("paper_id", "unknown"),
                        "chunk_id": chunk_info.get("chunk_id", idx),
                        "text": chunk_info.get("text", ""),
                        "page_num": chunk_info.get("page_num", 1)
                    })
            
            return results
        except Exception as e:
            print(f"Error in search_chunks: {e}")
            return []
    
    def generate_answer(self, query: str, chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate answer using Gemini based on retrieved chunks
        
        Args:
            query: User query
            chunks: Retrieved chunks from FAISS search
            
        Returns:
            Dictionary with answer and citations
        """
        # Format chunks for Gemini
        snippets = []
        citations = []
        
        for chunk in chunks:
            snippet_text = f"[{chunk['paper_id']}:{chunk['page_num']}] {chunk['text']}"
            snippets.append(snippet_text)
            citations.append({
                "paper_id": chunk['paper_id'],
                "page_num": chunk['page_num'],
                "score": chunk['score']
            })
        
        # Generate answer using Gemini
        try:
            gemini_response = qa(query, snippets)
            answer = gemini_response.get("answer", "Unable to generate answer")
        except Exception as e:
            print(f"Error generating answer with Gemini: {e}")
            answer = "Error generating answer. Please try again."
        
        return {
            "answer": answer,
            "citations": citations,
            "chunks_used": len(chunks)
        }
    
    def process_query(self, query: str, top_k: int = 5) -> Dict[str, Any]:
        """
        Complete RAG pipeline: search + generate answer
        
        Args:
            query: User query
            top_k: Number of chunks to retrieve
            
        Returns:
            Complete response with answer, citations, and metadata
        """
        # Check if RAG components are available
        if not self.index or not self.model or not self.chunks:
            return {
                "query": query,
                "answer": "RAG system not fully initialized. Please check FAISS index and embedding model.",
                "citations": [],
                "chunks_used": 0,
                "error": "Missing RAG components"
            }
        
        # Step 1: Search for relevant chunks
        chunks = self.search_chunks(query, top_k)
        
        if not chunks:
            return {
                "query": query,
                "answer": "No relevant information found for your query.",
                "citations": [],
                "chunks_used": 0
            }
        
        # Step 2: Generate answer using Gemini
        answer_data = self.generate_answer(query, chunks)
        
        return {
            "query": query,
            "answer": answer_data["answer"],
            "citations": answer_data["citations"],
            "chunks_used": answer_data["chunks_used"],
            "retrieved_chunks": chunks
        }

# Global RAG service instance
rag_service = None

def get_rag_service() -> RAGService:
    """Get or create RAG service instance"""
    global rag_service
    if rag_service is None:
        rag_service = RAGService()
    return rag_service
