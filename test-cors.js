// CORS Test Script
// This script tests CORS configuration for the backend

const BACKEND_URL = 'https://cellexis-wlgs.onrender.com';

async function testCORS() {
  console.log('🧪 Testing CORS Configuration...\n');
  
  try {
    // Test 1: Preflight request for search-rag
    console.log('1️⃣ Testing preflight request for /search-rag...');
    const preflightResponse = await fetch(`${BACKEND_URL}/search-rag`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://cellexis-eta.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('Preflight status:', preflightResponse.status);
    console.log('CORS headers:', {
      'Access-Control-Allow-Origin': preflightResponse.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': preflightResponse.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': preflightResponse.headers.get('Access-Control-Allow-Headers')
    });
    
    // Test 2: Actual POST request
    console.log('\n2️⃣ Testing actual POST request...');
    const postResponse = await fetch(`${BACKEND_URL}/search-rag`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://cellexis-eta.vercel.app'
      },
      body: JSON.stringify({
        query: 'test',
        top_k: 3
      })
    });
    
    console.log('POST status:', postResponse.status);
    if (postResponse.ok) {
      const data = await postResponse.json();
      console.log('✅ CORS working! Response:', data.query);
    } else {
      console.log('❌ POST request failed:', postResponse.status);
    }
    
  } catch (error) {
    console.error('❌ CORS test failed:', error.message);
    
    if (error.message.includes('Failed to fetch')) {
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Backend might be sleeping - visit https://cellexis.onrender.com/');
      console.log('2. Wait 30-60 seconds for backend to wake up');
      console.log('3. Check if backend is deployed correctly');
    }
  }
}

// Run the test
testCORS();
