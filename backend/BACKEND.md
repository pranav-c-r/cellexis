# Cellexis Backend Documentation

## Tech Stack Overview

### Core Technologies
- **FastAPI**: Modern, fast web framework for building APIs with Python
- **Neo4j**: Graph database for storing and querying connected data
- **Uvicorn**: ASGI server for running the FastAPI application
- **Python**: Programming language (3.x)

## Architecture

The backend is structured as a FastAPI application that interfaces with a Neo4j graph database, primarily handling biological and research data relationships.

### Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application and routes
│   ├── neo4j_client.py      # Neo4j database connection
│   ├── neo4j_ingest.py      # Data ingestion logic
│   ├── graph_api.py         # Graph API endpoints
│   ├── setup_constraints.py # Database constraints setup
│   └── test_aura_connect.py # Connection testing
├── ingestion/
│   ├── build_metadata.py    # Metadata construction
│   ├── create_chunks.py     # Data chunking logic
│   ├── create_fts.py        # Full-text search setup
│   ├── download_pdfs.py     # PDF download utilities
│   └── read_csv.py          # CSV data processing
└── requirements.txt         # Python dependencies
```

## Database Schema

### Node Types
- Organism
- ExperimentType
- Assay
- Outcome
- Mission
- Gene
- Paper
- Document

### Key Relationships
Various relationships between entities are supported, including:
- PERFORMED_ON
- (Other relationships as defined in the graph schema)

## API Endpoints

### Health Checks
- `GET /`: Backend health check
- `GET /pingdb`: Database connection check

### Node Management
- `POST /organisms/{name}`: Add new organism
- `GET /organisms`: List all organisms
- `POST /papers/{title}`: Add new paper
- `GET /papers`: List all papers
(Additional endpoints available in graph_api.py)

## Data Ingestion

The system supports ingestion of knowledge graph data in JSON format with the following structure:
```json
{
  "paper_id": "string",
  "entities": [
    {
      "type": "string",
      "name": "string",
      "props": {}
    }
  ],
  "relations": [
    {
      "from_name": "string",
      "from_type": "string",
      "to_name": "string",
      "to_type": "string",
      "type": "string",
      "props": {}
    }
  ]
}
```

## Configuration

### Environment Variables
- `NEO4J_URI`: Neo4j database URI
- `NEO4J_USER`: Database username (default: "neo4j")
- `NEO4J_PASSWORD`: Database password

## Development Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables in `.env` file:
```env
NEO4J_URI=your_neo4j_uri
NEO4J_USER=your_username
NEO4J_PASSWORD=your_password
```

3. Run the development server:
```bash
uvicorn app.main:app --reload
```

## Data Processing Pipeline

The backend includes several data processing utilities:
1. PDF Download: Automated download of research papers
2. Metadata Building: Construction of metadata from source materials
3. Text Chunking: Processing of documents into manageable chunks
4. Full-text Search: Setup and indexing for text search capabilities
5. Graph Data Ingestion: Structured data import into Neo4j

## Best Practices

1. Database Operations
   - Use session context managers for Neo4j operations
   - Implement proper error handling for database operations
   - Follow Neo4j best practices for query optimization

2. API Development
   - Follow RESTful principles
   - Implement proper validation for inputs
   - Use appropriate HTTP methods and status codes
   - Document all endpoints using FastAPI's automatic documentation

3. Data Processing
   - Validate data before ingestion
   - Implement proper error handling
   - Log important operations and errors
   - Use batch processing for large datasets

## Security Considerations

1. Database Security
   - Use environment variables for sensitive credentials
   - Implement proper authentication
   - Regular security audits

2. API Security
   - Input validation
   - Rate limiting (when implemented)
   - Authentication and authorization (when implemented)

## Testing

The backend includes test files for various components:
- Database connection testing
- API endpoint testing
- Data ingestion testing

## Maintenance

Regular maintenance tasks:
1. Monitor database performance
2. Update dependencies
3. Backup database regularly
4. Monitor API performance
5. Review and update security measures

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Neo4j Python Driver Documentation](https://neo4j.com/docs/python-manual/current/)
- [Uvicorn Documentation](https://www.uvicorn.org/)