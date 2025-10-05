// Configuration for different environments
export const config = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_URL || 'https://cellexis.onrender.com',
  
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
  }
};

export default config;
