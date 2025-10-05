// Backend Switching Utility
// This script helps switch between local and hosted backend

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'client', 'lib', 'config.ts');

function switchBackend(type) {
  let configContent;
  
  if (type === 'local') {
    configContent = `// Configuration for different environments
export const config = {
  // API Configuration - LOCAL DEVELOPMENT
  API_BASE_URL: 'http://localhost:8000',
  
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

export default config;`;
    console.log('🔄 Switched to LOCAL backend (http://localhost:8000)');
  } else {
    configContent = `// Configuration for different environments
export const config = {
  // API Configuration - HOSTED BACKEND
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

export default config;`;
    console.log('🔄 Switched to HOSTED backend (https://cellexis.onrender.com)');
  }
  
  try {
    fs.writeFileSync(configPath, configContent);
    console.log('✅ Configuration updated successfully!');
    console.log('💡 Restart your development server to apply changes.');
  } catch (error) {
    console.error('❌ Failed to update configuration:', error.message);
  }
}

// Command line usage
const args = process.argv.slice(2);
const backendType = args[0] || 'hosted';

if (backendType === 'local' || backendType === 'hosted') {
  switchBackend(backendType);
} else {
  console.log('Usage: node switch-backend.js [local|hosted]');
  console.log('  local  - Use http://localhost:8000');
  console.log('  hosted - Use https://cellexis.onrender.com');
}
