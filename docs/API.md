# Cellexis API Documentation

This document provides detailed information about the Cellexis backend API endpoints, request/response formats, and usage examples.

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://cellexis.onrender.com`

## Authentication

Currently, the API does not require authentication for most endpoints. Future versions may include API key authentication for rate limiting and usage tracking.

## Content Type

All API requests should use `Content-Type: application/json` unless otherwise specified.

## Response Format

All API responses follow this general structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "error": null
}
```

Error responses:
```json
{
  "success": false,
  "data": null,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

## Endpoints

### Health Check

#### GET `/`
Basic health check endpoint.

**Response:**
```json
{
  "message": "Cellexis API is running",
  "status": "healthy",
  "version": "1.0.0"
}
```

#### GET `/health`
Detailed health check with system information.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "services": {
    "database": "connected",
    "ai_service": "available"
  }
}
```

#### GET `/pingdb`
Database connectivity check.

**Response:**
```json
{
  "status": "connected",
  "database": "neo4j",
  "response_time_ms": 45
}
```

### Search & RAG

#### POST `/search-rag`
Perform semantic search with RAG (Retrieval-Augmented Generation).

**Request Body:**
```json
{
  "query": "How does microgravity affect immune response?",
  "top_k": 5
}
```

**Parameters:**
- `query` (string, required): The search query or question
- `top_k` (integer, optional): Number of relevant chunks to retrieve (default: 5, max: 20)

**Response:**
```json
{
  "query": "How does microgravity affect immune response?",
  "answer": "Based on NASA research, microgravity significantly impacts immune response by reducing T-cell activation and decreasing overall immune function by approximately 15-20%. This immunosuppression is observed consistently across multiple studies and missions.",
  "citations": [
    {
      "paper_id": "NASA_2021_immune_microgravity",
      "page_num": 15,
      "score": 0.89
    },
    {
      "paper_id": "NASA_2020_tcell_space",
      "page_num": 8,
      "score": 0.76
    }
  ],
  "chunks_used": 5,
  "retrieved_chunks": [
    {
      "score": 0.89,
      "paper_id": "NASA_2021_immune_microgravity",
      "chunk_id": "chunk_001",
      "text": "Our analysis of astronaut blood samples reveals a significant decrease in T-cell activation markers during long-duration spaceflight...",
      "page_num": 15
    }
  ]
}
```

**HTTP Status Codes:**
- `200`: Success
- `400`: Invalid request parameters
- `422`: Query validation error
- `500`: Internal server error

### Knowledge Graph

#### GET `/graph`
Retrieve knowledge graph data for visualization.

**Query Parameters:**
- `filter_type` (string, optional): Filter nodes by type (e.g., "gene", "protein", "experiment")

**Example:**
```
GET /graph?filter_type=protein
```

**Response:**
```json
{
  "nodes": [
    {
      "data": {
        "id": "node_1",
        "label": "T-cell activation",
        "type": "biological_process",
        "connections": 15,
        "mission_or_experiment": "ISS Expedition 45"
      }
    },
    {
      "data": {
        "id": "node_2",
        "label": "Microgravity",
        "type": "environmental_factor",
        "connections": 23
      }
    }
  ],
  "edges": [
    {
      "data": {
        "id": "edge_1",
        "source": "node_1",
        "target": "node_2",
        "label": "affected_by",
        "weight": 0.85
      }
    }
  ],
  "metadata": {
    "total_nodes": 150,
    "total_edges": 342,
    "filtered": true,
    "filter_type": "protein"
  }
}
```

### Node Search

#### GET `/search`
Search for specific nodes in the knowledge graph.

**Query Parameters:**
- `q` (string, required): Search query
- `limit` (integer, optional): Maximum number of results (default: 10, max: 50)

**Example:**
```
GET /search?q=immune+response&limit=10
```

**Response:**
```json
{
  "query": "immune response",
  "results": [
    {
      "name": "T-cell activation",
      "id": "node_tcell_001",
      "type": "biological_process",
      "description": "Process of T-cell stimulation and activation",
      "relevance_score": 0.92,
      "connected_experiments": [
        "ISS_2021_immune_study",
        "Mars_simulation_immune_2020"
      ]
    }
  ],
  "total_results": 25,
  "page": 1,
  "limit": 10
}
```

### Document Management

#### GET `/documents`
List all processed documents in the system.

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 20, max: 100)
- `type` (string, optional): Filter by document type

**Response:**
```json
{
  "documents": [
    {
      "id": "doc_001",
      "title": "Effects of Microgravity on Immune Function",
      "filename": "NASA_2021_immune_microgravity.pdf",
      "pages": 45,
      "processed_date": "2024-01-01T00:00:00Z",
      "status": "processed",
      "chunks_created": 128
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "total_pages": 8
  }
}
```

#### POST `/documents/upload`
Upload and process a new document.

**Request:** Multipart form data
- `file`: PDF file (max size: 50MB)
- `metadata` (optional): JSON string with additional metadata

**Response:**
```json
{
  "document_id": "doc_new_001",
  "status": "processing",
  "message": "Document uploaded successfully and processing started",
  "estimated_completion": "2024-01-01T00:05:00Z"
}
```

### Analytics

#### GET `/analytics/search`
Get search analytics and statistics.

**Query Parameters:**
- `period` (string, optional): Time period ("day", "week", "month") - default: "week"

**Response:**
```json
{
  "period": "week",
  "total_searches": 1247,
  "unique_users": 89,
  "average_response_time_ms": 245,
  "top_queries": [
    {
      "query": "microgravity immune response",
      "count": 156
    },
    {
      "query": "space medicine cardiovascular",
      "count": 89
    }
  ],
  "search_success_rate": 0.94
}
```

#### GET `/analytics/graph`
Get knowledge graph usage statistics.

**Response:**
```json
{
  "total_nodes": 2456,
  "total_edges": 5678,
  "most_connected_nodes": [
    {
      "id": "microgravity",
      "label": "Microgravity",
      "connections": 234
    }
  ],
  "graph_queries_today": 45,
  "average_render_time_ms": 120
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_QUERY` | Search query is empty or invalid |
| `PROCESSING_ERROR` | Error during document processing |
| `DATABASE_ERROR` | Neo4j database connection or query error |
| `AI_SERVICE_ERROR` | Google AI service unavailable or error |
| `RATE_LIMIT_EXCEEDED` | Too many requests from client |
| `FILE_TOO_LARGE` | Uploaded file exceeds size limit |
| `UNSUPPORTED_FORMAT` | File format not supported |

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **General endpoints**: 100 requests per minute per IP
- **Search endpoints**: 30 requests per minute per IP
- **Upload endpoints**: 5 requests per minute per IP

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## SDKs and Client Libraries

### JavaScript/TypeScript

```javascript
import { ApiService } from './api-client';

const api = new ApiService('https://cellexis.onrender.com');

// Search documents
const results = await api.searchRAG('microgravity effects', 5);

// Get knowledge graph
const graph = await api.getGraph();

// Search nodes
const nodes = await api.searchNodes('immune system');
```

### Python

```python
import requests

class CellexisAPI:
    def __init__(self, base_url):
        self.base_url = base_url
    
    def search_rag(self, query, top_k=5):
        response = requests.post(
            f"{self.base_url}/search-rag",
            json={"query": query, "top_k": top_k}
        )
        return response.json()
    
    def get_graph(self, filter_type=None):
        params = {"filter_type": filter_type} if filter_type else {}
        response = requests.get(f"{self.base_url}/graph", params=params)
        return response.json()

# Usage
api = CellexisAPI("https://cellexis.onrender.com")
results = api.search_rag("How does space affect bone density?")
```

### cURL Examples

**Search with RAG:**
```bash
curl -X POST "https://cellexis.onrender.com/search-rag" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "effects of microgravity on cardiovascular system",
    "top_k": 3
  }'
```

**Get Knowledge Graph:**
```bash
curl "https://cellexis.onrender.com/graph?filter_type=gene"
```

**Search Nodes:**
```bash
curl "https://cellexis.onrender.com/search?q=bone%20density&limit=5"
```

## Webhooks (Future Feature)

Future versions will support webhooks for real-time notifications:

### Document Processing Complete
```json
{
  "event": "document.processed",
  "document_id": "doc_001",
  "status": "completed",
  "chunks_created": 85,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Search Analytics
```json
{
  "event": "analytics.daily",
  "date": "2024-01-01",
  "total_searches": 1456,
  "top_query": "microgravity bone loss"
}
```

## API Versioning

The API uses URL-based versioning for future compatibility:

- Current version: `v1` (default, no prefix required)
- Future versions: `/v2/search-rag`, `/v2/graph`, etc.

Breaking changes will be introduced in new versions while maintaining backward compatibility for at least 6 months.

## Support

For API support:
- **Technical Issues**: GitHub Issues
- **Integration Help**: developer@cellexis.com  
- **Rate Limit Increases**: enterprise@cellexis.com

---

*Last updated: January 2024*