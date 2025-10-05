// Configuration for different environments
const getApiBaseUrl = () => {
  // Priority order:
  // 1. Environment variable from .env files
  // 2. Smart detection based on environment
  // 3. Fallback to deployed backend
  
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  
  if (envUrl) {
    console.log('📍 Using API URL from environment:', envUrl);
    return envUrl;
  }
  
  // In production (deployed), always use the deployed backend
  if (import.meta.env.PROD || (typeof window !== 'undefined' && window.location.hostname !== 'localhost')) {
    console.log('📍 Production mode detected, using deployed backend');
    return 'https://cellexis-wlgs.onrender.com';
  }
  
  // Development fallback
  console.log('📍 Development mode, using deployed backend as fallback');
  return 'https://cellexis-wlgs.onrender.com';
};

export const config = {
  // API Configuration with smart environment detection
  API_BASE_URL: getApiBaseUrl(),
  
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
