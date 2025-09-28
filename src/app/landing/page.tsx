'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to home page with search query
      window.location.href = `/home?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
      
      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-sm"></div>
            </div>
            <span className="text-2xl font-bold text-white">CELLEXIS</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-white hover:text-blue-400 transition-colors">Research</a>
            <a href="#" className="text-white hover:text-blue-400 transition-colors">Database</a>
            <a href="#" className="text-white hover:text-blue-400 transition-colors">Collaboration</a>
            <a href="#" className="text-white hover:text-blue-400 transition-colors">Publications</a>
          </nav>

          {/* Sign In Button */}
          <Link 
            href="/home"
            className="px-6 py-2 bg-transparent border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Title */}
          <h1 className="text-6xl md:text-7xl font-bold mb-8">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
              SPACE BIOLOGY
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]">
              KNOWLEDGE ENGINE
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Unlock the mysteries of life beyond Earth. Access cutting-edge research, collaborate with leading scientists, and explore the frontiers of astrobiology and space biotechnology.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-16">
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
        </div>
      </main>

      {/* Statistics Section */}
      <section className="relative z-10 px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Research Papers */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">50,247</div>
              <div className="text-gray-300">Research Papers</div>
            </div>

            {/* Active Researchers */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">3,892</div>
              <div className="text-gray-300">Active Researchers</div>
            </div>

            {/* Space Missions */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">127</div>
              <div className="text-gray-300">Space Missions</div>
            </div>

            {/* Biological Samples */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">15,634</div>
              <div className="text-gray-300">Biological Samples</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
