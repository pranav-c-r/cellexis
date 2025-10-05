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
