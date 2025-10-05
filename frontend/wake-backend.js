// Backend Wake-up Utility
// This script helps wake up the sleeping Render backend

const BACKEND_URL = 'https://cellexis.onrender.com';

async function wakeUpBackend() {
  console.log('🔄 Attempting to wake up backend...');
  
  try {
    // Try multiple endpoints to wake up the backend
    const endpoints = ['/', '/pingdb', '/search-stats'];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`📡 Trying ${endpoint}...`);
        const response = await fetch(`${BACKEND_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(30000) // 30 second timeout
        });
        
        if (response.ok) {
          console.log(`✅ Backend is awake! ${endpoint} responded successfully.`);
          return true;
        } else {
          console.log(`⚠️ ${endpoint} returned status: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint} failed:`, error.message);
      }
    }
    
    console.log('⏰ Backend is still sleeping. Please wait 30-60 seconds and try again.');
    return false;
    
  } catch (error) {
    console.error('❌ Failed to wake up backend:', error);
    return false;
  }
}

// Auto-run if called directly
if (typeof window === 'undefined') {
  wakeUpBackend().then(success => {
    if (success) {
      console.log('🎉 Backend is ready for requests!');
    } else {
      console.log('😴 Backend is still sleeping. Try again later.');
    }
  });
}

module.exports = { wakeUpBackend };
