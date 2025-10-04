#!/bin/bash

echo "🧪 Testing Frontend-Backend Integration"
echo "======================================"

# Test CORS preflight request
echo "1. Testing CORS preflight request..."
curl -X OPTIONS "http://localhost:8000/search-rag" \
  -H "Origin: http://localhost:8081" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v 2>&1 | grep -E "(access-control|HTTP/1.1)"

echo ""
echo "2. Testing actual search request..."
curl -X POST "http://localhost:8000/search-rag" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:8081" \
  -d '{"query": "microgravity effects on mice", "top_k": 3}' \
  -s | jq '.answer' 2>/dev/null || echo "Response received (jq not available)"

echo ""
echo "3. Testing graph endpoint..."
curl -X GET "http://localhost:8000/graph" \
  -H "Origin: http://localhost:8081" \
  -s | jq '.nodes | length' 2>/dev/null || echo "Graph data received (jq not available)"

echo ""
echo "✅ Integration test completed!"
