# 🧬 Cellexis - RAG-Powered NASA Bioscience Search Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-latest-009688.svg)](https://fastapi.tiangolo.com/)

Cellexis is an intelligent research platform that leverages advanced AI technologies to make NASA's bioscience research publications more accessible and discoverable. Using RAG (Retrieval-Augmented Generation), knowledge graphs, and natural language processing, Cellexis enables researchers to explore, query, and analyze complex biological datasets from space missions.

## 🌟 Key Features

### 🔍 **Intelligent Search & RAG**
- **Semantic Search**: AI-powered search across NASA bioscience publications
- **Question Answering**: Natural language queries with contextual answers
- **Citation Tracking**: Automatic citation generation with relevance scores
- **Multi-document Analysis**: Cross-reference findings across multiple papers

### 📊 **Knowledge Graph Visualization**
- **Interactive Network**: Dynamic visualization of research relationships
- **Entity Recognition**: Automatic extraction of biological entities and concepts
- **Connection Mapping**: Discover hidden relationships between research areas
- **Fullscreen Mode**: Immersive graph exploration experience

### 🎯 **Advanced Research Tools**
- **Paper Comparison**: Side-by-side analysis with consensus detection
- **Smart Bookmarks**: Organized research collection with notes
- **Export Options**: Multiple formats for research findings
- **Voice Assistant**: Hands-free navigation and search capabilities

### 🚀 **Modern User Experience**
- **Responsive Design**: Optimized for all device sizes
- **Real-time Updates**: Live search results and graph updates
- **Authentication**: Secure Firebase-based user management
- **Progressive Web App**: Install and use offline capabilities

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│    Frontend     │────│   Backend API    │────│   Databases     │
│   React + TS    │    │   FastAPI + AI   │    │ Neo4j + Vector │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         v                       v                       v
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Web Client    │    │   AI Services    │    │  File Storage   │
│ Voice Commands  │    │  Google Gemini   │    │  PDF Documents  │
│ Real-time UI    │    │  Embeddings      │    │  Vector Index   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Technology Stack

**Frontend:**
- React 18.3.1 with TypeScript
- Vite build system
- Tailwind CSS + shadcn/ui components
- Firebase Authentication
- Cytoscape.js for graph visualization
- Web Speech API for voice commands

**Backend:**
- FastAPI with Python 3.8+
- Google Gemini AI for text generation
- Sentence Transformers for embeddings
- FAISS for vector similarity search
- Neo4j graph database
- PDFPlumber for document processing

**Infrastructure:**
- Frontend: Deployed on Netlify/Vercel
- Backend: Deployed on Render
- Database: Neo4j AuraDB (cloud)
- Authentication: Firebase Auth

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ and npm/pnpm
- **Python** 3.8+
- **Neo4j** Database (local or cloud)
- **Google AI Studio API Key**
- **Firebase Project** (for authentication)

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/cellexis.git
cd cellexis
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

**Required Environment Variables:**
```bash
# API Keys
GOOGLE_API_KEY=your_google_api_key_here
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password

# Optional
OLLAMA_BASE_URL=http://localhost:11434  # If using Ollama
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install  # or pnpm install

# Set up environment variables
cp .env.example .env.development
# Edit .env.development with your configuration
```

**Frontend Environment Variables:**
```bash
# API Configuration
VITE_API_URL=http://localhost:8000

# Firebase Configuration (from your Firebase project)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### 4. Database Setup

**Option A: Local Neo4j**
```bash
# Download and start Neo4j Desktop
# Create a new database with password
# Update NEO4J_* variables in backend/.env
```

**Option B: Neo4j AuraDB (Cloud)**
```bash
# Create account at neo4j.com/cloud/aura
# Create new instance
# Update connection details in backend/.env
```

### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Load Sample Data

```bash
cd backend

# Create embeddings for sample documents
python create_embeddings.py

# Extract and load entities into Neo4j
python extract_entities.py
```

## 📖 Detailed Setup Guide

### Backend Configuration

The backend requires several services and configurations:

#### 1. Google AI Setup
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create an API key
3. Add to `.env` as `GOOGLE_API_KEY`

#### 2. Neo4j Database Setup

**Local Installation:**
```bash
# Using Docker
docker run \
    --name neo4j \
    -p7474:7474 -p7687:7687 \
    -d \
    -v $HOME/neo4j/data:/data \
    -v $HOME/neo4j/logs:/logs \
    -v $HOME/neo4j/import:/var/lib/neo4j/import \
    -v $HOME/neo4j/plugins:/plugins \
    --env NEO4J_AUTH=neo4j/your-password \
    neo4j:latest
```

**Cloud Setup (Recommended):**
1. Visit [Neo4j Aura](https://neo4j.com/cloud/aura/)
2. Create free instance
3. Download connection details
4. Update `.env` with connection URI and credentials

#### 3. Document Processing
Place your PDF documents in `backend/documents/` directory:

```bash
backend/
├── documents/
│   ├── NASA_paper_1.pdf
│   ├── NASA_paper_2.pdf
│   └── ...
├── create_embeddings.py
└── extract_entities.py
```

### Frontend Configuration

#### 1. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project
3. Enable Authentication
4. Enable Email/Password and Google providers
5. Get configuration object
6. Update frontend `.env.development`

#### 2. Build Configuration

The project uses Vite with the following key configurations:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
    },
  },
  server: {
    port: 8080,
    host: true,
  }
})
```

## 🔧 Development

### Project Structure

```
cellexis/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI app entry point
│   │   ├── rag_system.py   # RAG implementation
│   │   ├── graph_api.py    # Neo4j graph operations
│   │   └── models.py       # Pydantic models
│   ├── documents/          # PDF documents for processing
│   ├── create_embeddings.py # Vector embeddings creation
│   ├── extract_entities.py # Entity extraction for graph
│   └── requirements.txt
├── frontend/               # React frontend
│   ├── client/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and API client
│   │   └── contexts/       # React contexts
│   ├── public/            # Static assets
│   └── package.json
└── README.md
```

### API Endpoints

The backend provides these main endpoints:

#### Search & RAG
```
POST /search-rag
- Query: { "query": "string", "top_k": number }
- Response: { "query", "answer", "citations", "chunks_used" }
```

#### Knowledge Graph
```
GET /graph
- Optional: ?filter_type=entity_type
- Response: { "nodes": [...], "edges": [...] }
```

#### Search Nodes
```
GET /search?q=query
- Response: { "query", "results": [...] }
```

#### Health Checks
```
GET /health    # Application health
GET /pingdb    # Database connectivity
```

### Frontend Components

#### Main Pages
- **Dashboard**: Main search and visualization interface
- **Login**: Firebase authentication
- **Features**: Feature showcase
- **Contact**: Contact information

#### Key Components
- **PaperComparison**: Side-by-side paper analysis
- **BookmarksNotes**: Research organization
- **VisualizationEnhancements**: Advanced graph features
- **ExportShare**: Export and sharing functionality
- **UserFeedback**: User feedback collection

### Voice Commands

The platform supports voice navigation:

**Activation:**
- Say "Hey Cellexis" or press Ctrl+Space
- Say "Stop" or press Escape to deactivate

**Navigation Commands:**
- "Go to search" / "Search"
- "Go to bookmarks" / "Bookmarks"  
- "Go to comparison" / "Compare"
- "Go to visualization" / "Visualize"

**Panel Commands:**
- "Open left panel" / "Close left panel"
- "Open right panel" / "Close right panel"
- "Toggle left" / "Toggle right"

## 🚀 Deployment

### Backend Deployment (Render)

1. **Connect Repository**
   - Link your GitHub repository to Render
   - Select the backend directory as root

2. **Environment Variables**
   ```bash
   GOOGLE_API_KEY=your_api_key
   NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
   NEO4J_USERNAME=neo4j  
   NEO4J_PASSWORD=your_password
   ```

3. **Build Configuration**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend Deployment (Netlify/Vercel)

1. **Build Settings**
   - Build Command: `npm run build`
   - Publish Directory: `dist`

2. **Environment Variables**
   ```bash
   VITE_API_URL=https://your-backend.onrender.com
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   ```

### Production Considerations

**Security:**
- Use HTTPS for all communications
- Implement rate limiting on API endpoints
- Secure Firebase rules for authentication
- Use environment variables for all secrets

**Performance:**
- Enable CDN for static assets
- Implement caching strategies
- Monitor API response times
- Optimize bundle sizes

**Monitoring:**
- Set up error tracking (Sentry)
- Monitor API usage and costs
- Database performance monitoring
- User analytics

## 🔍 Usage Examples

### Basic Search
```typescript
// Using the API service
import { apiService } from '@/lib/api';

const results = await apiService.searchRAG(
  "How does microgravity affect immune response?", 
  5
);
console.log(results.answer);
console.log(results.citations);
```

### Graph Visualization
```typescript
// Load and render knowledge graph
const graphData = await apiService.getGraph();
// Graph is automatically rendered using Cytoscape.js
```

### Voice Commands
```typescript
// Voice commands are handled automatically
// Users can activate with "Hey Cellexis" or Ctrl+Space
// Commands like "Go to search" navigate to different tabs
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Code Standards

**Backend:**
- Follow PEP 8 style guidelines
- Add type hints to all functions
- Include docstrings for modules and functions
- Write unit tests for new features

**Frontend:**
- Use TypeScript strictly
- Follow React best practices
- Use consistent naming conventions
- Add JSDoc comments for complex functions

### Testing

**Backend Tests:**
```bash
cd backend
pytest tests/
```

**Frontend Tests:**
```bash
cd frontend
npm run test
```

## 📊 Performance & Monitoring

### Metrics to Monitor

**API Performance:**
- Response times for search endpoints
- RAG query processing time  
- Graph generation performance
- Database query optimization

**User Experience:**
- Page load times
- Search result relevance
- Voice command accuracy
- Mobile responsiveness

**Resource Usage:**
- API rate limiting
- Database connection pooling
- Memory usage optimization
- Vector index efficiency

## 🔒 Security

### Authentication
- Firebase Authentication with email/password
- JWT token validation on backend
- Protected routes for authenticated users
- Session management and refresh tokens

### API Security
- CORS configuration for frontend domains
- Input validation and sanitization
- Rate limiting to prevent abuse
- Error handling without information disclosure

### Data Protection
- Encrypted connections (HTTPS/TLS)
- Secure environment variable handling
- No sensitive data in client-side code
- Regular security audits

## 🐛 Troubleshooting

### Common Issues

**Backend Not Starting:**
```bash
# Check Python version
python --version  # Should be 3.8+

# Verify dependencies
pip install -r requirements.txt

# Check environment variables
cat .env
```

**Frontend Build Errors:**
```bash
# Clear cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript configuration
npm run typecheck
```

**Database Connection Issues:**
```bash
# Test Neo4j connection
python -c "from neo4j import GraphDatabase; driver = GraphDatabase.driver('bolt://localhost:7687', auth=('neo4j', 'password')); print('Connected!')"

# Check database status
docker ps  # If using Docker
```

**API Integration Problems:**
- Verify CORS settings match frontend domain
- Check API_URL environment variable
- Validate Google API key permissions
- Monitor network requests in browser dev tools

### Debug Mode

**Backend Debug:**
```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
uvicorn app.main:app --reload --log-level debug
```

**Frontend Debug:**
```bash
# Development mode with source maps
npm run dev

# Check console for errors
# Use React Developer Tools
```

## 📚 Additional Resources

### Documentation
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://reactjs.org/docs/)
- [Neo4j Developer Guide](https://neo4j.com/developer/)
- [Firebase Documentation](https://firebase.google.com/docs)

### Related Projects
- [LangChain](https://python.langchain.com/) - RAG framework
- [Sentence Transformers](https://www.sbert.net/) - Text embeddings
- [Cytoscape.js](https://cytoscape.org/) - Graph visualization

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- NASA for providing public access to bioscience research data
- Google AI team for Gemini API access
- Neo4j for graph database technology
- Open source community for the amazing tools and libraries

## 📞 Support

For support and questions:

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions  
- **Email**: support@cellexis.com
- **Documentation**: [docs.cellexis.com](https://docs.cellexis.com)

---

**Built with ❤️ for the scientific research community**
