# Cellexis Development Guide

This guide provides detailed information for developers who want to contribute to or extend the Cellexis platform.

## Table of Contents

- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Style & Standards](#code-style--standards)
- [Testing](#testing)
- [Database Development](#database-development)
- [Frontend Development](#frontend-development)
- [Backend Development](#backend-development)
- [Contributing](#contributing)

## Development Environment Setup

### Prerequisites

Make sure you have the following installed:

- **Node.js** 16+ and npm/pnpm
- **Python** 3.8+
- **Git**
- **Neo4j** (local installation or Docker)
- **VS Code** (recommended) with extensions:
  - Python
  - TypeScript and JavaScript
  - ESLint
  - Prettier
  - Neo4j Cypher

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/your-repo/cellexis.git
cd cellexis

# Setup backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration

# Setup frontend
cd ../frontend
npm install
cp .env.example .env.development
# Edit .env.development with your configuration

# Start Neo4j (using Docker)
docker run --name neo4j-dev \
  -p7474:7474 -p7687:7687 \
  -v neo4j_data:/data \
  --env NEO4J_AUTH=neo4j/devpassword \
  -d neo4j:latest
```

### IDE Configuration

#### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "python.defaultInterpreterPath": "./backend/venv/bin/python",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "eslint.workingDirectories": ["frontend"]
}
```

#### VS Code Extensions

```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.black-formatter",
    "ms-vscode.vscode-typescript-next",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "neo4j.cypher",
    "bradlc.vscode-tailwindcss"
  ]
}
```

## Project Structure

```
cellexis/
├── backend/                     # Python FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI application entry point
│   │   ├── models.py           # Pydantic data models
│   │   ├── rag_system.py       # RAG implementation
│   │   ├── graph_api.py        # Neo4j graph operations
│   │   └── utils.py            # Utility functions
│   ├── documents/              # PDF documents for processing
│   ├── tests/                  # Backend tests
│   │   ├── __init__.py
│   │   ├── test_api.py
│   │   ├── test_rag.py
│   │   └── test_graph.py
│   ├── scripts/                # Utility scripts
│   │   ├── create_embeddings.py
│   │   ├── extract_entities.py
│   │   └── backup_db.py
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example           # Environment variables template
│   └── README.md              # Backend-specific documentation
├── frontend/                   # React TypeScript frontend
│   ├── client/
│   │   ├── components/         # React components
│   │   │   ├── ui/            # Base UI components
│   │   │   ├── BookmarksNotes.tsx
│   │   │   ├── PaperComparison.tsx
│   │   │   └── ...
│   │   ├── pages/             # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Login.tsx
│   │   │   └── ...
│   │   ├── lib/               # Utilities and services
│   │   │   ├── api.ts         # API client
│   │   │   ├── firebase.ts    # Firebase configuration
│   │   │   └── utils.ts       # Utility functions
│   │   ├── contexts/          # React contexts
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── use-mobile.tsx
│   │   │   └── use-toast.ts
│   │   └── App.tsx           # Main application component
│   ├── public/               # Static assets
│   ├── tests/                # Frontend tests
│   ├── package.json          # Node dependencies
│   ├── vite.config.ts        # Vite configuration
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   └── .env.example         # Environment variables template
├── docs/                     # Documentation
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── DEVELOPMENT.md
├── .gitignore
├── README.md                 # Main project documentation
└── LICENSE
```

## Development Workflow

### Git Workflow

We use a feature branch workflow:

1. **Create feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and commit**:
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

3. **Push and create PR**:
   ```bash
   git push origin feature/your-feature-name
   # Create pull request on GitHub
   ```

### Commit Message Convention

We follow conventional commits:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or modifying tests
- `chore:` - Maintenance tasks

Examples:
```bash
git commit -m "feat: add voice command support to dashboard"
git commit -m "fix: resolve CORS issue with API endpoints"
git commit -m "docs: update API documentation with new endpoints"
```

### Branch Naming

- `feature/description` - New features
- `fix/issue-description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

## Code Style & Standards

### Python (Backend)

#### Style Guide
- Follow [PEP 8](https://pep8.org/) style guidelines
- Use [Black](https://black.readthedocs.io/) for code formatting
- Maximum line length: 88 characters
- Use type hints for all function parameters and return values

#### Setup Tools
```bash
cd backend
pip install black pylint mypy

# Format code
black .

# Lint code
pylint app/

# Type checking
mypy app/
```

#### Example Code Style

```python
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

class SearchRequest(BaseModel):
    """Request model for RAG search endpoint."""
    
    query: str
    top_k: int = 5
    filter_type: Optional[str] = None

async def search_documents(
    request: SearchRequest,
    embeddings_service: EmbeddingsService
) -> Dict[str, Any]:
    """
    Search documents using RAG approach.
    
    Args:
        request: Search request with query and parameters
        embeddings_service: Service for handling embeddings
        
    Returns:
        Dictionary containing search results and metadata
        
    Raises:
        ValueError: If query is empty or invalid
    """
    if not request.query.strip():
        raise ValueError("Query cannot be empty")
    
    logger.info(f"Searching for: {request.query}")
    
    # Implementation here
    results = await embeddings_service.search(
        query=request.query,
        top_k=request.top_k
    )
    
    return {
        "query": request.query,
        "results": results,
        "metadata": {"total_found": len(results)}
    }
```

### TypeScript/React (Frontend)

#### Style Guide
- Use TypeScript strict mode
- Follow React best practices and hooks patterns
- Use functional components with hooks
- Prefer const assertions and proper typing

#### Setup Tools
```bash
cd frontend
npm install --save-dev eslint prettier @typescript-eslint/parser

# Format code
npm run format

# Lint code
npm run lint

# Type check
npm run typecheck
```

#### Example Code Style

```typescript
import { useState, useEffect, useCallback } from 'react';
import { apiService, RAGResponse } from '@/lib/api';

interface SearchResultsProps {
  query: string;
  onResultsChange?: (results: RAGResponse | null) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  onResultsChange
}) => {
  const [results, setResults] = useState<RAGResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const searchResults = await apiService.searchRAG(query, 5);
      setResults(searchResults);
      onResultsChange?.(searchResults);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Search failed';
      setError(errorMessage);
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [query, onResultsChange]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  if (isLoading) {
    return <div className="text-center">Searching...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="search-results">
      {results && (
        <div className="space-y-4">
          <h3 className="font-semibold">Results for: {results.query}</h3>
          <p className="text-sm text-gray-600">{results.answer}</p>
        </div>
      )}
    </div>
  );
};
```

## Testing

### Backend Testing

#### Setup
```bash
cd backend
pip install pytest pytest-asyncio pytest-cov

# Run tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_api.py

# Run specific test
pytest tests/test_api.py::test_search_endpoint
```

#### Test Structure

```python
# tests/test_rag.py
import pytest
from app.rag_system import RAGSystem
from app.models import SearchRequest

@pytest.fixture
async def rag_system():
    """Create RAG system for testing."""
    system = RAGSystem()
    await system.initialize()
    return system

class TestRAGSystem:
    """Tests for RAG functionality."""
    
    async def test_search_valid_query(self, rag_system):
        """Test search with valid query."""
        request = SearchRequest(
            query="microgravity effects on immune system",
            top_k=3
        )
        
        results = await rag_system.search(request)
        
        assert results is not None
        assert results.query == request.query
        assert len(results.citations) <= request.top_k
        assert results.answer is not None
        assert len(results.answer) > 0
    
    async def test_search_empty_query(self, rag_system):
        """Test search with empty query should raise error."""
        request = SearchRequest(query="", top_k=5)
        
        with pytest.raises(ValueError, match="Query cannot be empty"):
            await rag_system.search(request)
    
    @pytest.mark.parametrize("query,expected_type", [
        ("immune response", "biological_process"),
        ("T-cell activation", "cellular_process"),
        ("microgravity", "environmental_factor")
    ])
    async def test_search_categorization(self, rag_system, query, expected_type):
        """Test that searches return appropriate categories."""
        request = SearchRequest(query=query, top_k=1)
        results = await rag_system.search(request)
        
        # Check if results contain expected biological category
        assert any(
            expected_type in citation.paper_id.lower() 
            for citation in results.citations
        )
```

### Frontend Testing

#### Setup
```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest jsdom

# Run tests
npm run test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

#### Test Structure

```typescript
// tests/SearchResults.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { SearchResults } from '@/components/SearchResults';
import { apiService } from '@/lib/api';

// Mock API service
vi.mock('@/lib/api', () => ({
  apiService: {
    searchRAG: vi.fn()
  }
}));

const mockApiService = apiService as any;

describe('SearchResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays loading state initially', () => {
    render(<SearchResults query="test query" />);
    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  it('displays search results when API call succeeds', async () => {
    const mockResults = {
      query: 'test query',
      answer: 'Test answer',
      citations: [
        {
          paper_id: 'test-paper',
          page_num: 1,
          score: 0.9
        }
      ],
      chunks_used: 1
    };

    mockApiService.searchRAG.mockResolvedValue(mockResults);

    render(<SearchResults query="test query" />);

    await waitFor(() => {
      expect(screen.getByText('Results for: test query')).toBeInTheDocument();
      expect(screen.getByText('Test answer')).toBeInTheDocument();
    });
  });

  it('displays error message when API call fails', async () => {
    mockApiService.searchRAG.mockRejectedValue(new Error('API Error'));

    render(<SearchResults query="test query" />);

    await waitFor(() => {
      expect(screen.getByText('Error: API Error')).toBeInTheDocument();
    });
  });

  it('calls onResultsChange callback when results are loaded', async () => {
    const mockResults = {
      query: 'test query',
      answer: 'Test answer',
      citations: [],
      chunks_used: 0
    };

    mockApiService.searchRAG.mockResolvedValue(mockResults);
    const onResultsChange = vi.fn();

    render(
      <SearchResults 
        query="test query" 
        onResultsChange={onResultsChange} 
      />
    );

    await waitFor(() => {
      expect(onResultsChange).toHaveBeenCalledWith(mockResults);
    });
  });
});
```

## Database Development

### Neo4j Schema Design

#### Node Types
```cypher
// Entity types in our knowledge graph
CREATE CONSTRAINT entity_id IF NOT EXISTS FOR (e:Entity) REQUIRE e.id IS UNIQUE;
CREATE CONSTRAINT paper_id IF NOT EXISTS FOR (p:Paper) REQUIRE p.id IS UNIQUE;
CREATE CONSTRAINT experiment_id IF NOT EXISTS FOR (exp:Experiment) REQUIRE exp.id IS UNIQUE;

// Main entity types
(:Protein {id, name, function, organism})
(:Gene {id, name, chromosome, function})  
(:BiologicalProcess {id, name, description, go_term})
(:CellType {id, name, tissue, organism})
(:Experiment {id, name, mission, date, conditions})
(:Paper {id, title, authors, year, doi})

// Environmental factors
(:Microgravity {id, name, description})
(:Radiation {id, name, type, level})
(:Stressor {id, name, type, description})
```

#### Relationships
```cypher
// Entity relationships
(:Protein)-[:INTERACTS_WITH]->(:Protein)
(:Gene)-[:CODES_FOR]->(:Protein)
(:Protein)-[:PARTICIPATES_IN]->(:BiologicalProcess)
(:BiologicalProcess)-[:OCCURS_IN]->(:CellType)

// Experimental relationships  
(:Experiment)-[:STUDIES]->(:Entity)
(:Experiment)-[:CONDUCTED_IN]->(:Microgravity)
(:Experiment)-[:EXPOSED_TO]->(:Radiation)

// Literature relationships
(:Paper)-[:DESCRIBES]->(:Experiment)
(:Paper)-[:MENTIONS]->(:Entity)
(:Entity)-[:CITED_IN {page: int, confidence: float}]->(:Paper)
```

### Database Development Workflow

#### 1. Local Development
```bash
# Start Neo4j with development data
docker run --name neo4j-dev \
  -p7474:7474 -p7687:7687 \
  -v neo4j_dev_data:/data \
  --env NEO4J_AUTH=neo4j/devpassword \
  -d neo4j:latest

# Load development data
cd backend
python scripts/load_dev_data.py
```

#### 2. Schema Changes
```python
# scripts/migrate_schema.py
from neo4j import GraphDatabase
import os

def migrate_schema(driver):
    """Apply schema migrations to database."""
    
    with driver.session() as session:
        # Add new constraints
        session.run("""
            CREATE CONSTRAINT mission_id IF NOT EXISTS 
            FOR (m:Mission) REQUIRE m.id IS UNIQUE
        """)
        
        # Add new indexes
        session.run("""
            CREATE INDEX entity_name_index IF NOT EXISTS
            FOR (e:Entity) ON (e.name)
        """)
        
        # Migrate data
        session.run("""
            MATCH (e:Experiment)
            WHERE e.mission_id IS NOT NULL AND NOT EXISTS((e)-[:PART_OF]->(:Mission))
            MERGE (m:Mission {id: e.mission_id})
            CREATE (e)-[:PART_OF]->(m)
        """)

if __name__ == "__main__":
    driver = GraphDatabase.driver(
        os.getenv("NEO4J_URI"),
        auth=(os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))
    )
    migrate_schema(driver)
    print("Schema migration completed")
```

#### 3. Query Development

```python
# app/graph_queries.py
from typing import List, Dict, Any
from neo4j import Session

class GraphQueries:
    """Centralized graph database queries."""
    
    @staticmethod
    def find_related_entities(
        session: Session, 
        entity_id: str, 
        relationship_types: List[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Find entities related to given entity."""
        
        if relationship_types:
            rel_filter = f"WHERE type(r) IN {relationship_types}"
        else:
            rel_filter = ""
        
        query = f"""
            MATCH (e1:Entity {{id: $entity_id}})-[r]-(e2:Entity)
            {rel_filter}
            RETURN e2.id as id, e2.name as name, type(r) as relationship,
                   labels(e2) as types, r.confidence as confidence
            ORDER BY r.confidence DESC
            LIMIT $limit
        """
        
        result = session.run(query, entity_id=entity_id, limit=limit)
        return [dict(record) for record in result]
    
    @staticmethod
    def search_entities_by_text(
        session: Session,
        search_text: str,
        entity_types: List[str] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Search entities by text similarity."""
        
        if entity_types:
            type_filter = f"WHERE any(label IN labels(e) WHERE label IN {entity_types})"
        else:
            type_filter = ""
        
        query = f"""
            MATCH (e:Entity)
            {type_filter}
            WHERE e.name CONTAINS $search_text OR e.description CONTAINS $search_text
            RETURN e.id as id, e.name as name, e.description as description,
                   labels(e) as types
            ORDER BY length(e.name) ASC
            LIMIT $limit
        """
        
        result = session.run(query, search_text=search_text, limit=limit)
        return [dict(record) for record in result]
```

## Frontend Development

### Component Development

#### Creating New Components

1. **Create component file**:
   ```typescript
   // components/MyNewComponent.tsx
   import React from 'react';
   import { Button } from '@/components/ui/button';

   interface MyNewComponentProps {
     title: string;
     onAction?: () => void;
   }

   export const MyNewComponent: React.FC<MyNewComponentProps> = ({ 
     title, 
     onAction 
   }) => {
     return (
       <div className="p-4 border rounded-lg">
         <h3 className="font-semibold mb-2">{title}</h3>
         <Button onClick={onAction}>
           Click me
         </Button>
       </div>
     );
   };
   ```

2. **Add to exports**:
   ```typescript
   // components/index.ts
   export { MyNewComponent } from './MyNewComponent';
   ```

3. **Create tests**:
   ```typescript
   // tests/MyNewComponent.test.tsx
   import { render, screen, fireEvent } from '@testing-library/react';
   import { MyNewComponent } from '@/components/MyNewComponent';

   describe('MyNewComponent', () => {
     it('renders title correctly', () => {
       render(<MyNewComponent title="Test Title" />);
       expect(screen.getByText('Test Title')).toBeInTheDocument();
     });

     it('calls onAction when button is clicked', () => {
       const mockAction = vi.fn();
       render(<MyNewComponent title="Test" onAction={mockAction} />);
       
       fireEvent.click(screen.getByText('Click me'));
       expect(mockAction).toHaveBeenCalledOnce();
     });
   });
   ```

### State Management

#### Using React Context

```typescript
// contexts/SearchContext.tsx
import React, { createContext, useContext, useReducer } from 'react';

interface SearchState {
  query: string;
  results: any[];
  isLoading: boolean;
  error: string | null;
}

type SearchAction = 
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_RESULTS'; payload: any[] }
  | { type: 'SET_ERROR'; payload: string | null };

const SearchContext = createContext<{
  state: SearchState;
  dispatch: React.Dispatch<SearchAction>;
} | null>(null);

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'SET_QUERY':
      return { ...state, query: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_RESULTS':
      return { ...state, results: action.payload, isLoading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
}

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [state, dispatch] = useReducer(searchReducer, {
    query: '',
    results: [],
    isLoading: false,
    error: null
  });

  return (
    <SearchContext.Provider value={{ state, dispatch }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};
```

### API Integration

#### Error Handling

```typescript
// lib/api-client.ts
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData.code
      );
    }
    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', 0);
    }
  }
}
```

## Backend Development

### API Endpoint Development

#### Creating New Endpoints

```python
# app/routers/new_feature.py
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from app.models import ResponseModel
from app.dependencies import get_db_session

router = APIRouter(prefix="/api/v1", tags=["new-feature"])

@router.post("/new-endpoint", response_model=ResponseModel)
async def create_new_resource(
    data: CreateResourceRequest,
    db_session: Session = Depends(get_db_session)
) -> ResponseModel:
    """
    Create a new resource.
    
    Args:
        data: Request data for creating resource
        db_session: Database session dependency
        
    Returns:
        ResponseModel with created resource data
        
    Raises:
        HTTPException: If resource creation fails
    """
    try:
        # Validate input
        if not data.name.strip():
            raise HTTPException(
                status_code=400, 
                detail="Name cannot be empty"
            )
        
        # Business logic here
        result = await create_resource_service(data, db_session)
        
        return ResponseModel(
            success=True,
            data=result,
            message="Resource created successfully"
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating resource: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Internal server error"
        )
```

#### Dependency Injection

```python
# app/dependencies.py
from fastapi import Depends
from neo4j import Session
from app.database import get_database_driver
from app.services import RAGService, GraphService

async def get_db_session() -> Session:
    """Get database session dependency."""
    driver = get_database_driver()
    with driver.session() as session:
        yield session

async def get_rag_service(
    db_session: Session = Depends(get_db_session)
) -> RAGService:
    """Get RAG service dependency."""
    return RAGService(db_session)

async def get_graph_service(
    db_session: Session = Depends(get_db_session)
) -> GraphService:
    """Get graph service dependency."""
    return GraphService(db_session)
```

## Contributing

### Pull Request Process

1. **Fork and clone** the repository
2. **Create a feature branch** from main
3. **Make your changes** following code style guidelines
4. **Add/update tests** for your changes
5. **Update documentation** if needed
6. **Run tests** to ensure everything passes
7. **Submit a pull request** with detailed description

### Pull Request Template

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Code is documented (docstrings, comments)
- [ ] Changes generate no new warnings
- [ ] Tests added/updated and pass
- [ ] Documentation updated
```

### Code Review Guidelines

#### For Reviewers

- **Be constructive**: Suggest improvements, don't just point out problems
- **Ask questions**: If something is unclear, ask for clarification
- **Check functionality**: Does the code do what it's supposed to do?
- **Review tests**: Are there adequate tests for the changes?
- **Consider security**: Are there any security implications?

#### For Contributors

- **Respond to feedback**: Address all reviewer comments
- **Be open to suggestions**: Consider alternative approaches
- **Keep PRs focused**: One feature/fix per pull request
- **Update documentation**: Keep docs in sync with code changes

### Release Process

1. **Version bump**: Update version numbers in package.json, requirements.txt
2. **Update CHANGELOG**: Document new features, fixes, breaking changes
3. **Create release branch**: `release/v1.2.0`
4. **Final testing**: Run full test suite, manual testing
5. **Merge to main**: Create pull request to main branch
6. **Tag release**: Create git tag and GitHub release
7. **Deploy**: Follow deployment process for staging/production

---

For questions about development, please:
- Check existing GitHub issues
- Create new issue for bugs/feature requests
- Join our development discussions
- Contact the maintainers

*Happy coding! 🚀*