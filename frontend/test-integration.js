// Integration Test Script for Cellexis Frontend-Backend
// Run this script to test the connection between frontend and hosted backend

const API_BASE_URL = 'https://cellexis-wlgs.onrender.com';

async function testBackendConnection() {
  console.log('🧪 Testing Cellexis Backend Integration...\n');
  
  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test 2: Database Connection
    console.log('\n2️⃣ Testing database connection...');
    const dbResponse = await fetch(`${API_BASE_URL}/pingdb`);
    const dbData = await dbResponse.json();
    console.log('✅ Database ping:', dbData);
    
    // Test 3: Search Stats
    console.log('\n3️⃣ Testing search stats...');
    const statsResponse = await fetch(`${API_BASE_URL}/search-stats`);
    const statsData = await statsResponse.json();
    console.log('✅ Search stats:', statsData);
    
    // Test 4: RAG Search (with a simple query)
    console.log('\n4️⃣ Testing RAG search...');
    const searchResponse = await fetch(`${API_BASE_URL}/search-rag`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'test',
        top_k: 3
      })
    });
    const searchData = await searchResponse.json();
    console.log('✅ RAG search:', {
      query: searchData.query,
      answer: searchData.answer?.substring(0, 100) + '...',
      chunks_used: searchData.chunks_used
    });
    
    // Test 5: Graph Data
    console.log('\n5️⃣ Testing graph endpoint...');
    const graphResponse = await fetch(`${API_BASE_URL}/graph`);
    const graphData = await graphResponse.json();
    console.log('✅ Graph data:', {
      nodes: graphData.nodes?.length || 0,
      edges: graphData.edges?.length || 0
    });
    
    console.log('\n🎉 All tests passed! Backend is ready for frontend integration.');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if backend is deployed and running on Render');
    console.log('2. Verify the API_BASE_URL is correct');
    console.log('3. Check CORS settings on the backend');
    console.log('4. Ensure all environment variables are set on Render');
  }
}

// Run the test
testBackendConnection();
