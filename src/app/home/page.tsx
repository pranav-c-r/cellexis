'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SearchResult {
  id: string;
  title: string;
  authors: string[];
  summary: string;
  snippet: string;
  year: number;
  citations: number;
  consensus: number;
  pdfUrl: string;
}

interface QAResponse {
  question: string;
  answer: string;
  citations: string[];
  confidence: number;
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [qaQuestion, setQaQuestion] = useState('');
  const [qaResponse, setQaResponse] = useState<QAResponse | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<SearchResult | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'qa' | 'explorer'>('search');
  const [filters, setFilters] = useState({
    organism: '',
    mission: '',
    experimentType: ''
  });

  // Mock data for demonstration
  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: 'Microgravity Effects on Plant Root Development in Arabidopsis thaliana',
      authors: ['Dr. Sarah Chen', 'Prof. Michael Rodriguez'],
      summary: 'This study examines how microgravity conditions affect root growth patterns in Arabidopsis thaliana, revealing significant changes in gravitropic responses.',
      snippet: 'Root growth in microgravity showed 23% increased lateral branching compared to ground controls...',
      year: 2023,
      citations: 47,
      consensus: 85,
      pdfUrl: '/papers/arabidopsis-microgravity-2023.pdf'
    },
    {
      id: '2',
      title: 'Bacterial Adaptation to Space Environment: ISS Microbial Analysis',
      authors: ['Dr. Elena Petrov', 'Dr. James Wilson'],
      summary: 'Comprehensive analysis of bacterial communities aboard the International Space Station reveals adaptive mechanisms to space conditions.',
      snippet: 'Bacterial diversity decreased by 15% after 6 months in space, with increased resistance to UV radiation...',
      year: 2023,
      citations: 32,
      consensus: 78,
      pdfUrl: '/papers/iss-microbial-analysis-2023.pdf'
    },
    {
      id: '3',
      title: 'Radiation Effects on DNA Repair Mechanisms in Space',
      authors: ['Dr. Alex Kim', 'Prof. Maria Santos'],
      summary: 'Investigation of DNA repair efficiency under cosmic radiation exposure, focusing on double-strand break repair pathways.',
      snippet: 'DNA repair efficiency decreased by 40% under simulated cosmic radiation conditions...',
      year: 2022,
      citations: 89,
      consensus: 92,
      pdfUrl: '/papers/dna-repair-space-2022.pdf'
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchResults(mockResults);
      setActiveTab('search');
    }
  };

  const handleQA = (e: React.FormEvent) => {
    e.preventDefault();
    if (qaQuestion.trim()) {
      setQaResponse({
        question: qaQuestion,
        answer: "Based on the current research database, microgravity significantly affects plant root development by altering gravitropic responses. Studies show 23% increased lateral branching in Arabidopsis thaliana under microgravity conditions. The primary mechanism involves changes in auxin distribution patterns.",
        citations: [
          "Chen et al. (2023) - Microgravity Effects on Plant Root Development",
          "Rodriguez & Kim (2022) - Gravitropic Responses in Space",
          "Petrov et al. (2023) - Plant Adaptation Mechanisms"
        ],
        confidence: 87
      });
      setActiveTab('qa');
    }
  };

  const getConsensusColor = (consensus: number) => {
    if (consensus >= 80) return 'text-green-400';
    if (consensus >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConsensusBg = (consensus: number) => {
    if (consensus >= 80) return 'bg-green-400/20';
    if (consensus >= 60) return 'bg-yellow-400/20';
    return 'bg-red-400/20';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
      
      {/* Header */}
      <header className="relative z-10 px-6 py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-sm"></div>
            </div>
            <span className="text-2xl font-bold text-white">CELLEXIS</span>
          </div>
          <Link 
            href="/landing"
            className="px-6 py-2 bg-transparent border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            Back to Landing
          </Link>
        </div>
      </header>

      <div className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8 bg-slate-800/50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-6 py-3 rounded-md transition-all ${
                activeTab === 'search'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Search & Results
            </button>
            <button
              onClick={() => setActiveTab('qa')}
              className={`px-6 py-3 rounded-md transition-all ${
                activeTab === 'qa'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Q&A Panel
            </button>
            <button
              onClick={() => setActiveTab('explorer')}
              className={`px-6 py-3 rounded-md transition-all ${
                activeTab === 'explorer'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Graph Explorer
            </button>
          </div>

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-4xl">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search research papers, experiments, organisms..."
                    className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white mb-6">Search Results</h2>
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-slate-700/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedPaper(result)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold text-white mb-2">{result.title}</h3>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConsensusBg(result.consensus)} ${getConsensusColor(result.consensus)}`}>
                          {result.consensus}% consensus
                        </div>
                      </div>
                      
                      <div className="text-gray-300 mb-3">
                        <p className="font-medium">{result.authors.join(', ')} • {result.year}</p>
                        <p className="text-sm text-gray-400">{result.citations} citations</p>
                      </div>
                      
                      <p className="text-gray-300 mb-3">{result.summary}</p>
                      <p className="text-blue-300 text-sm italic">"{result.snippet}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Q&A Tab */}
          {activeTab === 'qa' && (
            <div className="max-w-4xl">
              <form onSubmit={handleQA} className="mb-8">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={qaQuestion}
                    onChange={(e) => setQaQuestion(e.target.value)}
                    placeholder="Ask a natural language question about space biology..."
                    className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-green-500/25"
                  >
                    Ask
                  </button>
                </div>
              </form>

              {qaResponse && (
                <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Question:</h3>
                    <p className="text-gray-300">{qaResponse.question}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Answer:</h3>
                    <p className="text-gray-300 mb-4">{qaResponse.answer}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">Confidence:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-400 h-2 rounded-full" 
                            style={{ width: `${qaResponse.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-green-400 font-medium">{qaResponse.confidence}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Citations:</h3>
                    <ul className="space-y-2">
                      {qaResponse.citations.map((citation, index) => (
                        <li key={index} className="text-blue-300 text-sm hover:text-blue-200 cursor-pointer">
                          {citation}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Graph Explorer Tab */}
          {activeTab === 'explorer' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Graph Explorer</h2>
              
              {/* Filters */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Filter by:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Organism</label>
                    <select
                      value={filters.organism}
                      onChange={(e) => setFilters({...filters, organism: e.target.value})}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">All Organisms</option>
                      <option value="arabidopsis">Arabidopsis thaliana</option>
                      <option value="bacteria">Bacteria</option>
                      <option value="mice">Mice</option>
                      <option value="algae">Algae</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Mission</label>
                    <select
                      value={filters.mission}
                      onChange={(e) => setFilters({...filters, mission: e.target.value})}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">All Missions</option>
                      <option value="iss">International Space Station</option>
                      <option value="mars">Mars Missions</option>
                      <option value="moon">Lunar Missions</option>
                      <option value="satellite">Satellite Missions</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Experiment Type</label>
                    <select
                      value={filters.experimentType}
                      onChange={(e) => setFilters({...filters, experimentType: e.target.value})}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">All Types</option>
                      <option value="microgravity">Microgravity Studies</option>
                      <option value="radiation">Radiation Studies</option>
                      <option value="growth">Growth Studies</option>
                      <option value="behavior">Behavioral Studies</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Graph Visualization Placeholder */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Interactive Graph Explorer</h3>
                <p className="text-gray-400">Visualize relationships between organisms, missions, and experiments</p>
                <p className="text-sm text-gray-500 mt-2">Graph visualization would be implemented here with a library like D3.js or Cytoscape.js</p>
              </div>
            </div>
          )}

          {/* Paper Detail Pane */}
          {selectedPaper && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-800 rounded-xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-white">{selectedPaper.title}</h2>
                    <button
                      onClick={() => setSelectedPaper(null)}
                      className="text-gray-400 hover:text-white text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {/* TL;DR */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">TL;DR</h3>
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <ul className="space-y-2 text-gray-300">
                          <li>• {selectedPaper.summary}</li>
                          <li>• Key finding: {selectedPaper.snippet}</li>
                          <li>• Published in {selectedPaper.year} with {selectedPaper.citations} citations</li>
                          <li>• {selectedPaper.consensus}% consensus among researchers</li>
                        </ul>
                      </div>
                    </div>
                    
                    {/* Key Points */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Key Findings</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-gray-300">Significant changes in biological processes under space conditions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-gray-300">Adaptive mechanisms observed in multiple species</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <span className="text-gray-300">Implications for long-term space missions</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-4">
                      <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        View Source Snippet
                      </button>
                      <a
                        href={selectedPaper.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Download PDF
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
