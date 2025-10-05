// API service for backend integration
const API_BASE_URL = 'http://localhost:8000';

export interface RAGResponse {
  query: string;
  answer: string;
  citations: Array<{
    paper_id: string;
    page_num: number;
    score: number;
  }>;
  chunks_used: number;
  retrieved_chunks?: Array<{
    score: number;
    paper_id: string;
    chunk_id: string;
    text: string;
    page_num: number;
  }>;
}

export interface GraphResponse {
  nodes: Array<{
    data: {
      id: string;
      label: string;
      type: string;
    };
  }>;
  edges: Array<{
    data: {
      id: string;
      source: string;
      target: string;
      label: string;
    };
  }>;
}

export interface SearchResponse {
  query: string;
  results: Array<{
    name: string;
    [key: string]: any;
  }>;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // RAG Search - Main functionality
  async searchRAG(query: string, topK: number = 5): Promise<RAGResponse> {
    try {
      console.log('🔍 Making RAG search request:', { query, topK, url: `${this.baseUrl}/search-rag` });
      
      const response = await fetch(`${this.baseUrl}/search-rag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          top_k: topK,
        }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ RAG search successful:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in RAG search:', error);
      throw error;
    }
  }

  // Get Knowledge Graph data
  async getGraph(filterType?: string): Promise<GraphResponse> {
    try {
      const url = filterType 
        ? `${this.baseUrl}/graph?filter_type=${encodeURIComponent(filterType)}`
        : `${this.baseUrl}/graph`;
      
      console.log('📊 Fetching graph from:', url);
      
      const response = await fetch(url);
      
      console.log('📊 Graph response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Graph data received:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching graph:', error);
      throw error;
    }
  }

  // Search nodes in Neo4j
  async searchNodes(query: string): Promise<SearchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching nodes:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }

  // Database ping
  async pingDatabase(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/pingdb`);
      return response.ok;
    } catch (error) {
      console.error('Database ping failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
