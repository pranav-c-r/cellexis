import faiss
import json
import os
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Set, Tuple
import sys
import re
from collections import defaultdict

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)

# Import Neo4j client
try:
    from .neo4j_client import get_driver
except ImportError:
    try:
        from neo4j_client import get_driver
    except ImportError:
        print("WARNING: Neo4j client not available")
        get_driver = None

from gemini.gemini_utils import qa

class RAGService:
    def __init__(self):
        """Initialize the RAG service with FAISS index and embedding model"""
        # Use absolute paths
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.index_path = os.path.join(backend_dir, "data", "embeddings", "faiss_index.idx")
        self.metadata_path = os.path.join(backend_dir, "data", "embeddings", "chunk_metadata.json")
        self.model_name = "sentence-transformers/all-MiniLM-L6-v2"
        
        # Load FAISS index
        if os.path.exists(self.index_path):
            try:
                self.index = faiss.read_index(self.index_path)
                print(f"SUCCESS: FAISS index loaded with {self.index.ntotal} vectors")
            except Exception as e:
                print(f"ERROR: Failed to load FAISS index: {e}")
                self.index = None
        else:
            print(f"WARNING: FAISS index not found at {self.index_path}")
            self.index = None
        
        # Load chunk metadata
        if os.path.exists(self.metadata_path):
            try:
                with open(self.metadata_path, "r", encoding="utf-8") as f:
                    self.chunks = json.load(f)
                print(f"SUCCESS: Loaded metadata for {len(self.chunks)} chunks")
            except Exception as e:
                print(f"ERROR: Failed to load chunk metadata: {e}")
                self.chunks = []
        else:
            print(f"WARNING: Chunk metadata not found at {self.metadata_path}")
            self.chunks = []
        
        # Load embedding model
        try:
            self.model = SentenceTransformer(self.model_name)
            print("SUCCESS: Embedding model loaded")
        except Exception as e:
            print(f"ERROR: Failed to load embedding model: {e}")
            self.model = None
        
        # Initialize Neo4j driver
        self.driver = None
        if get_driver:
            try:
                self.driver = get_driver()
                print("SUCCESS: Neo4j driver initialized")
            except Exception as e:
                print(f"WARNING: Failed to initialize Neo4j driver: {e}")
        
        # Create paper ID to chunks mapping for faster lookup
        self.paper_chunks_map = self._build_paper_chunks_map()
    
    def _build_paper_chunks_map(self) -> Dict[str, List[Dict[str, Any]]]:
        """Build a mapping from paper_id to list of chunks for faster lookup"""
        paper_map = defaultdict(list)
        for i, chunk in enumerate(self.chunks):
            paper_id = chunk.get("paper_id", f"unknown_{i}")
            paper_map[paper_id].append({
                "chunk_id": chunk.get("chunk_id", i),
                "text": chunk.get("text", ""),
                "page_num": chunk.get("page_num", 1),
                "index": i
            })
        return dict(paper_map)
    
    def _extract_entities_from_query(self, query: str) -> List[str]:
        """Extract potential entity names from the query for Neo4j search"""
        # Simple entity extraction - look for capitalized words and common scientific terms
        words = re.findall(r'\b[A-Z][a-zA-Z]*\b', query)
        # Add common scientific terms that might be entities
        scientific_terms = re.findall(r'\b(?:gene|protein|cell|DNA|RNA|mitochondria|immune|microgravity|space|mission|experiment|assay|organism|outcome)\b', query.lower())
        return list(set(words + scientific_terms))
    
    def _search_neo4j_entities(self, query: str, entities: List[str]) -> List[Dict[str, Any]]:
        """Search Neo4j for entities and related papers"""
        if not self.driver:
            return []
        
        try:
            with self.driver.session() as session:
                # Build a comprehensive query to find papers through multiple paths
                cypher_query = """
                MATCH (p:Paper)-[r1]-(e1)-[r2]-(e2)-[r3]-(p2:Paper)
                WHERE ANY(entity IN $entities WHERE 
                    toLower(e1.name) CONTAINS toLower(entity) OR 
                    toLower(e2.name) CONTAINS toLower(entity) OR
                    toLower(p.title) CONTAINS toLower(entity) OR
                    toLower(p2.title) CONTAINS toLower(entity)
                )
                WITH DISTINCT p, p2, 
                    collect(DISTINCT e1.name) as entities1,
                    collect(DISTINCT e2.name) as entities2,
                    collect(DISTINCT type(r1)) as rel_types1,
                    collect(DISTINCT type(r2)) as rel_types2,
                    collect(DISTINCT type(r3)) as rel_types3
                RETURN DISTINCT p.paper_id as paper_id, 
                    p.title as title,
                    entities1 + entities2 as all_entities,
                    rel_types1 + rel_types2 + rel_types3 as all_relationships,
                    size(entities1 + entities2) as entity_count
                ORDER BY entity_count DESC
                LIMIT 20
                """
                
                result = session.run(cypher_query, entities=entities)
                papers = []
                for record in result:
                    papers.append({
                        "paper_id": record["paper_id"],
                        "title": record["title"],
                        "entities": record["all_entities"],
                        "relationships": record["all_relationships"],
                        "entity_count": record["entity_count"],
                        "source": "neo4j"
                    })
                return papers
        except Exception as e:
            print(f"ERROR: Neo4j search error: {e}")
            return []
    
    def _get_related_papers_from_neo4j(self, paper_ids: List[str]) -> List[Dict[str, Any]]:
        """Get papers related to the given paper IDs through Neo4j relationships"""
        if not self.driver or not paper_ids:
            return []
        
        try:
            with self.driver.session() as session:
                cypher_query = """
                MATCH (p:Paper)-[r]-(e)-[r2]-(p2:Paper)
                WHERE p.paper_id IN $paper_ids
                WITH DISTINCT p2, 
                    collect(DISTINCT e.name) as shared_entities,
                    collect(DISTINCT type(r)) as relationship_types
                RETURN p2.paper_id as paper_id,
                    p2.title as title,
                    shared_entities,
                    relationship_types,
                    size(shared_entities) as shared_entity_count
                ORDER BY shared_entity_count DESC
                LIMIT 15
                """
                
                result = session.run(cypher_query, paper_ids=paper_ids)
                related_papers = []
                for record in result:
                    related_papers.append({
                        "paper_id": record["paper_id"],
                        "title": record["title"],
                        "shared_entities": record["shared_entities"],
                        "relationship_types": record["relationship_types"],
                        "shared_entity_count": record["shared_entity_count"],
                        "source": "neo4j_related"
                    })
                return related_papers
        except Exception as e:
            print(f"ERROR: Neo4j related papers search error: {e}")
            return []
    
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
    
    def enhanced_search_chunks(self, query: str, top_k: int = 10) -> List[Dict[str, Any]]:
        """
        Enhanced search that prioritizes relevance over diversity
        
        Args:
            query: Search query text
            top_k: Number of top results to return
            
        Returns:
            List of chunk dictionaries with enhanced metadata
        """
        print(f"Enhanced search for: '{query}'")
        
        # Step 1: Get FAISS semantic results (prioritize relevance)
        faiss_results = self.search_chunks(query, top_k=top_k * 2)  # Get more results for better selection
        print(f"FAISS found {len(faiss_results)} chunks")
        
        # Step 2: Extract entities and search Neo4j
        entities = self._extract_entities_from_query(query)
        print(f"Extracted entities: {entities}")
        
        neo4j_papers = self._search_neo4j_entities(query, entities)
        print(f"Neo4j found {len(neo4j_papers)} papers")
        
        # Step 3: Get related papers from Neo4j based on FAISS results
        faiss_paper_ids = [r["paper_id"] for r in faiss_results]
        related_papers = self._get_related_papers_from_neo4j(faiss_paper_ids)
        print(f"Neo4j found {len(related_papers)} related papers")
        
        # Step 4: Prioritize FAISS results (most relevant) and add Neo4j diversity
        enhanced_results = []
        
        # First, add all FAISS results (they are already sorted by relevance)
        for result in faiss_results:
            enhanced_results.append({
                "score": result["score"],
                "paper_id": result["paper_id"],
                "chunk_id": result["chunk_id"],
                "text": result["text"],
                "page_num": result["page_num"],
                "source": "faiss",
                "neo4j_boost": 0,
                "paper_rank": 1
            })
        
        # Then add some diversity from Neo4j if we have space
        neo4j_paper_ids = set(paper["paper_id"] for paper in neo4j_papers + related_papers)
        faiss_paper_ids_set = set(faiss_paper_ids)
        
        # Add chunks from Neo4j papers that aren't already in FAISS results
        for paper_id in neo4j_paper_ids:
            if paper_id not in faiss_paper_ids_set and paper_id in self.paper_chunks_map:
                chunks = self.paper_chunks_map[paper_id]
                # Take top 1-2 chunks from each Neo4j paper for diversity
                for i, chunk in enumerate(chunks[:2]):
                    if len(enhanced_results) < top_k * 1.5:  # Don't add too many
                        enhanced_results.append({
                            "score": 0.5,  # Lower score for Neo4j diversity
                            "paper_id": paper_id,
                            "chunk_id": chunk["chunk_id"],
                            "text": chunk["text"],
                            "page_num": chunk["page_num"],
                            "source": "neo4j_diversity",
                            "neo4j_boost": 1,
                            "paper_rank": i + 1
                        })
        
        # Sort by score and limit results
        enhanced_results.sort(key=lambda x: x["score"], reverse=True)
        final_results = enhanced_results[:top_k]
        
        print(f"SUCCESS: Enhanced search returning {len(final_results)} chunks from {len(set(r['paper_id'] for r in final_results))} papers")
        return final_results
    
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
        Complete RAG pipeline: enhanced search + generate answer
        
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
        
        # Step 1: Use enhanced search that combines FAISS + Neo4j
        chunks = self.enhanced_search_chunks(query, top_k)
        
        if not chunks:
            return {
                "query": query,
                "answer": "No relevant information found for your query.",
                "citations": [],
                "chunks_used": 0
            }
        
        # Step 2: Generate answer using Gemini
        answer_data = self.generate_answer(query, chunks)
        
        # Step 3: Add diversity information to response
        unique_papers = len(set(chunk["paper_id"] for chunk in chunks))
        neo4j_boost_count = sum(1 for chunk in chunks if chunk.get("neo4j_boost", 0) > 0)
        
        return {
            "query": query,
            "answer": answer_data["answer"],
            "citations": answer_data["citations"],
            "chunks_used": answer_data["chunks_used"],
            "retrieved_chunks": chunks,
            "diversity_metrics": {
                "unique_papers": unique_papers,
                "neo4j_boosted_chunks": neo4j_boost_count,
                "search_method": "enhanced_faiss_neo4j"
            }
        }

# Global RAG service instance
rag_service = None

def get_rag_service() -> RAGService:
    """Get or create RAG service instance"""
    global rag_service
    if rag_service is None:
        rag_service = RAGService()
    return rag_service
