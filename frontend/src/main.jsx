import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import './styles.css';
import Footer from './components/Footer';
import Header from './components/Header';
import ChatBubble from './components/ChatBubble';

// Initialize theme before app renders
const savedTheme = localStorage.getItem('hm-theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

// Lazy-loaded pages for faster performance
const Home = lazy(() => import('./pages/Home'));
const Chat = lazy(() => import('./pages/Chat'));
const Stories = lazy(() => import('./pages/Stories'));
const Volunteer = lazy(() => import('./pages/Volunteer'));
const Resources = lazy(() => import('./pages/Resources'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));

function Loader() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-indigo-600 bg-gradient-to-b from-indigo-50 to-white">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 bg-indigo-400 rounded-full animate-ping opacity-30"></div>
        <div className="relative flex items-center justify-center w-full h-full bg-indigo-500 text-white text-2xl rounded-full animate-pulse">💜</div>
      </div>
      <div className="flex mt-6 space-x-2">
        <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce"></div>
      </div>
      <p className="mt-4 text-slate-600 font-medium">Preparing a safe space for you...</p>
    </div>
  );
}

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Header />
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/volunteer" element={<Volunteer />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </Suspense>
        <ChatBubble />
        <Footer />
      </Router>
    </ChakraProvider>
  );
}

// Render the app
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

export default App;
