// Configuration for different environments
export const config = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_URL || 'https://cellexis-wlgs.onrender.com',
  
  // Environment detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Feature flags
  enableVoiceCommands: true,
  enableGraphVisualization: true,
  enableAdvancedSearch: true,
  
  // API endpoints
  endpoints: {
    search: '/search-rag',
    graph: '/graph',
    searchNodes: '/search',
    health: '/',
    pingDb: '/pingdb',
    searchStats: '/search-stats'
  },
  
  // Development fallback for sleeping backend
  fallbackData: {
    searchStats: {
      faiss_index_size: 8927,
      chunks_loaded: 8927,
      papers_available: 100,
      neo4j_connected: false,
      embedding_model: 'sentence-transformers/all-MiniLM-L6-v2',
      status: 'backend_sleeping'
    }
  }
};

export default config;
