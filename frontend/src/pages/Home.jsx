import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)'
    }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Flowing gradient shapes */}
        <div
          className="absolute rounded-full animate-pulse"
          style={{
            top: '0',
            left: '0',
            width: '384px',
            height: '384px',
            background: 'linear-gradient(to right, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))',
            filter: 'blur(48px)'
          }}
        ></div>
        <div
          className="absolute rounded-full animate-pulse"
          style={{
            top: '25%',
            right: '0',
            width: '320px',
            height: '320px',
            background: 'linear-gradient(to right, rgba(236, 72, 153, 0.3), rgba(239, 68, 68, 0.3))',
            filter: 'blur(48px)',
            animationDelay: '1s'
          }}
        ></div>
        <div
          className="absolute rounded-full animate-pulse"
          style={{
            bottom: '0',
            left: '25%',
            width: '288px',
            height: '288px',
            background: 'linear-gradient(to right, rgba(249, 115, 22, 0.3), rgba(234, 179, 8, 0.3))',
            filter: 'blur(48px)',
            animationDelay: '2s'
          }}
        ></div>
        <div
          className="absolute rounded-full animate-pulse"
          style={{
            bottom: '25%',
            right: '25%',
            width: '256px',
            height: '256px',
            background: 'linear-gradient(to right, rgba(6, 182, 212, 0.3), rgba(59, 130, 246, 0.3))',
            filter: 'blur(48px)',
            animationDelay: '3s'
          }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="relative container mx-auto px-6 py-20" style={{ zIndex: 10 }}>
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center mb-6">
            <div
              className="rounded-xl flex items-center justify-center mr-4"
              style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(to right, #3b82f6, #9333ea)'
              }}
            >
              <span className="text-white text-2xl">💬</span>
            </div>
          </div>

          <h1
            className="font-bold text-white mb-6"
            style={{
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              lineHeight: '1.1'
            }}
          >
            Hear yourself.<br />
            <span
              style={{
                background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Feel heard.
            </span>
          </h1>

          <p
            className="text-gray-300 mb-12 mx-auto"
            style={{
              fontSize: '1.25rem',
              maxWidth: '42rem'
            }}
          >
            Your space to express, create, and connect freely.
          </p>

          <div className="flex items-center justify-center mb-4" style={{ gap: '1.5rem' }}>
            <span style={{ color: '#fbbf24', fontSize: '1.5rem' }}>✨</span>
          </div>

          <div
            className="flex justify-center"
            style={{
              flexDirection: 'column',
              gap: '1rem',
              '@media (min-width: 640px)': {
                flexDirection: 'row'
              }
            }}
          >
            <Link
              to="/chat"
              className="text-white px-8 py-4 font-semibold text-lg transition-all duration-300"
              style={{
                background: 'linear-gradient(to right, #9333ea, #2563eb)',
                borderRadius: '9999px',
                textDecoration: 'none',
                display: 'inline-block',
                textAlign: 'center',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(to right, #7c3aed, #1d4ed8)';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(to right, #9333ea, #2563eb)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              Start Building
            </Link>
            <Link
              to="/about"
              className="text-gray-300 px-8 py-4 font-semibold text-lg transition-all duration-300"
              style={{
                border: '1px solid #9ca3af',
                borderRadius: '9999px',
                textDecoration: 'none',
                display: 'inline-block',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#ffffff';
                e.target.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#9ca3af';
                e.target.style.color = '#d1d5db';
              }}
            >
              Explore the Community
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div
          className="mb-20"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}
        >
          {/* Create Freely */}
          <div
            className="p-8 transition-all duration-300"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '1rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            <div
              className="flex items-center justify-center mb-6 transition-transform duration-300"
              style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(to right, #f97316, #ec4899)',
                borderRadius: '1rem'
              }}
            >
              <span className="text-white text-2xl">🎨</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Create Freely</h3>
            <p className="text-gray-300" style={{ lineHeight: '1.6' }}>
              Drag, drop, and design your emotions into expression.
            </p>
          </div>

          {/* Collaborate Instantly */}
          <div
            className="p-8 transition-all duration-300"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '1rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            <div
              className="flex items-center justify-center mb-6 transition-transform duration-300"
              style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(to right, #3b82f6, #9333ea)',
                borderRadius: '1rem'
              }}
            >
              <span className="text-white text-2xl">🤝</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Collaborate Instantly</h3>
            <p className="text-gray-300" style={{ lineHeight: '1.6' }}>
              Invite friends to co-create in real time.
            </p>
          </div>

          {/* Understand Your Voice */}
          <div
            className="p-8 transition-all duration-300"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '1rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            <div
              className="flex items-center justify-center mb-6 transition-transform duration-300"
              style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(to right, #06b6d4, #3b82f6)',
                borderRadius: '1rem'
              }}
            >
              <span className="text-white text-2xl">📊</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Understand Your Voice</h3>
            <p className="text-gray-300" style={{ lineHeight: '1.6' }}>
              Track engagement and insights on your expressions.
            </p>
          </div>
        </div>

        {/* Community Showcase Section */}
        <div className="text-center mb-16">
          <h2
            className="font-bold text-white mb-16"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)'
            }}
          >
            See how others express themselves.
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {/* Community Card 1 */}
            <div
              className="p-6 cursor-pointer transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.5), rgba(30, 58, 138, 0.5))',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '1rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <div className="flex items-center mb-4">
                <div
                  className="flex items-center justify-center mr-3"
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(to right, #9333ea, #ec4899)',
                    borderRadius: '50%'
                  }}
                >
                  <span className="text-white text-sm">👤</span>
                </div>
              </div>
              <h3 className="text-white font-semibold mb-2">My Next Idea</h3>
              <p className="text-gray-400 text-sm mb-4">Fresh arguments</p>
              <div className="flex items-center" style={{ color: '#f87171' }}>
                <span className="mr-1">❤️</span>
                <span className="text-sm">8</span>
              </div>
            </div>

            {/* Community Card 2 */}
            <div className="bg-gradient-to-br from-orange-900/50 to-red-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:scale-105 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">👤</span>
                </div>
              </div>
              <h3 className="text-white font-semibold mb-2">Shared Playlist</h3>
              <p className="text-gray-400 text-sm mb-4">In real time</p>
              <div className="flex items-center text-red-400">
                <span className="mr-1">❤️</span>
                <span className="text-sm">4</span>
              </div>
            </div>

            {/* Community Card 3 */}
            <div className="bg-gradient-to-br from-orange-600/50 to-yellow-600/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:scale-105 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">⭕</span>
                </div>
              </div>
              <h3 className="text-white font-semibold mb-2">Time to Create</h3>
              <p className="text-gray-400 text-sm mb-4"></p>
              <div className="flex items-center text-red-400">
                <span className="mr-1">❤️</span>
                <span className="text-sm">620</span>
              </div>
            </div>

            {/* Community Card 4 */}
            <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:scale-105 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">👤</span>
                </div>
              </div>
              <h3 className="text-white font-semibold mb-2">Reflecting 🎭</h3>
              <p className="text-gray-400 text-sm mb-4"></p>
              <div className="flex items-center text-red-400">
                <span className="mr-1">❤️</span>
                <span className="text-sm">339</span>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Your voice deserves be heard.<br />
            Start creating today.
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link
              to="/chat"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Join For Free
            </Link>
            <button className="border border-gray-400 hover:border-white text-gray-300 hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}