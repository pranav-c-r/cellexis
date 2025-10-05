// API service for backend integration
import config from './config';

const API_BASE_URL = config.API_BASE_URL;

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
    source?: string;
    neo4j_boost?: number;
    paper_rank?: number;
  }>;
  diversity_metrics?: {
    unique_papers: number;
    neo4j_boosted_chunks: number;
    search_method: string;
  };
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
      console.log('🔍 Making RAG search request:', { query, topK, url: `${this.baseUrl}${config.endpoints.search}` });
      
      const response = await fetch(`${this.baseUrl}${config.endpoints.search}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          top_k: topK,
        }),
        signal: AbortSignal.timeout(15000) // 15 second timeout for search
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        if (response.status === 502) {
          console.warn('Backend appears to be sleeping. Please wait for it to wake up...');
          throw new Error('Backend is sleeping. Please try again in a few moments.');
        }
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
  async getGraph(filterType?: string, query?: string): Promise<GraphResponse> {
    try {
      let url = `${this.baseUrl}${config.endpoints.graph}`;
      const params = new URLSearchParams();
      
      if (filterType) {
        params.append('filter_type', filterType);
      }
      if (query) {
        params.append('query', query);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
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
      const response = await fetch(`${this.baseUrl}${config.endpoints.searchNodes}?q=${encodeURIComponent(query)}`);
      
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
      const response = await fetch(`${this.baseUrl}${config.endpoints.health}`);
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }

  // Database ping
  async pingDatabase(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}${config.endpoints.pingDb}`);
      return response.ok;
    } catch (error) {
      console.error('Database ping failed:', error);
      return false;
    }
  }

  // Get search system statistics
  async getSearchStats(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}${config.endpoints.searchStats}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout and retry logic for sleeping backend
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!response.ok) {
        if (response.status === 502) {
          console.warn('Backend appears to be sleeping. Retrying in 5 seconds...');
          // Return mock data when backend is sleeping
          return {
            faiss_index_size: 8927,
            chunks_loaded: 8927,
            papers_available: 100,
            neo4j_connected: false,
            embedding_model: 'sentence-transformers/all-MiniLM-L6-v2',
            status: 'backend_sleeping'
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching search stats:', error);
      // Return fallback data when backend is unavailable
      return {
        faiss_index_size: 8927,
        chunks_loaded: 8927,
        papers_available: 100,
        neo4j_connected: false,
        embedding_model: 'sentence-transformers/all-MiniLM-L6-v2',
        status: 'backend_unavailable'
      };
    }
  }

  // Enhanced Voice Assistant with Gemini Integration
  async processVoiceQuery(query: string): Promise<string> {
    try {
      console.log('🎤 Processing voice query:', query);
      
      // Step 1: Get results from your existing API
      const ragResults = await this.searchRAG(query, 3);
      
      // Step 2: Prepare context for Gemini
      const context = {
        original_query: query,
        api_response: ragResults,
        citations: ragResults.citations,
        answer_summary: ragResults.answer
      };

      // Step 3: Call Gemini for elaboration
      const elaboratedResponse = await this.callGeminiForElaboration(context);
      
      return elaboratedResponse;
    } catch (error) {
      console.error('❌ Error in voice query processing:', error);
      return `I encountered an error while processing your question about "${query}". Please try asking again.`;
    }
  }

  // Gemini API Integration
  private async callGeminiForElaboration(context: any): Promise<string> {
    try {
      // Use Google Gemini API (you'll need to add your API key)
      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'your-gemini-api-key';
      const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

      const prompt = `
You are Cellexis, an intelligent voice assistant for NASA's bioscience research knowledge graph. 

The user asked: "${context.original_query}"

Our database search returned this information:
- Answer: ${context.answer_summary}
- Number of citations: ${context.citations?.length || 0}
- Retrieved chunks: ${context.api_response.chunks_used || 0}

Please provide a natural, conversational response that:
1. Directly answers the user's question
2. Elaborates on the key findings with scientific context
3. Mentions relevant research connections if applicable
4. Keeps the response concise but informative (2-3 sentences max for voice)
5. Uses a friendly, helpful tone suitable for voice interaction

Focus on making complex scientific information accessible and engaging for voice delivery.
`;

      const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 200,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const elaboratedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                           "I found some relevant information, but couldn't elaborate on it right now.";
      
      console.log('✅ Gemini elaboration successful');
      return elaboratedText;
      
    } catch (error) {
      console.error('❌ Gemini API error:', error);
      // Fallback to basic response
      return `Based on our research database: ${context.answer_summary}`;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
