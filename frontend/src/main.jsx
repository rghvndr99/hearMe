import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import './styles.css';
import './styles/components.css';
import Footer from './components/Footer';
import Header from './components/Header';
import ChatBubble from './components/ChatBubble';

import i18n from './i18n';
// Keep <html lang> in sync with selected language
if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language || 'en';
  i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng || 'en';
  });
  // Ensure Chat language (hm-language) is aligned on initial load
  try {
    const map = { en: 'en-US', hi: 'hi-IN' };
    const ui = i18n.language || 'en';
    const chat = localStorage.getItem('hm-language');
    if (map[ui] && chat !== map[ui]) {
      localStorage.setItem('hm-language', map[ui]);
    }
  } catch {}

}

// Initialize theme before app renders (backup in case index.html script didn't run)
const savedTheme = localStorage.getItem('hm-theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
const colorScheme = (savedTheme === 'light') ? 'light' : 'dark';
document.documentElement.style.colorScheme = colorScheme;

// Lazy-loaded pages for faster performance
const Home = lazy(() => import('./pages/Home'));
const Chat = lazy(() => import('./pages/Chat'));
const Stories = lazy(() => import('./pages/Stories'));
const Volunteer = lazy(() => import('./pages/Volunteer'));
const Resources = lazy(() => import('./pages/Resources'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const ChangeEmail = lazy(() => import('./pages/ChangeEmail'));
const VoiceMate = lazy(() => import('./pages/VoiceMate'));

function Loader() {
  return (
    <div
      className="flex flex-col items-center justify-center h-screen"
      style={{
        backgroundColor: 'var(--hm-color-bg)',
        color: 'var(--hm-color-text-primary)'
      }}
    >
      <div className="relative w-16 h-16">
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-30"
          style={{ backgroundColor: 'var(--hm-color-brand)' }}
        ></div>
        <div
          className="relative flex items-center justify-center w-full h-full text-2xl rounded-full animate-pulse"
          style={{
            backgroundColor: 'var(--hm-color-brand)',
            color: 'var(--hm-color-bg)'
          }}
        >💜</div>
      </div>
      <div className="flex mt-6 space-x-2">
        <div
          className="w-3 h-3 rounded-full animate-bounce [animation-delay:-0.3s]"
          style={{ backgroundColor: 'var(--hm-color-accent-purple)' }}
        ></div>
        <div
          className="w-3 h-3 rounded-full animate-bounce [animation-delay:-0.15s]"
          style={{ backgroundColor: 'var(--hm-color-accent-purple)' }}
        ></div>
        <div
          className="w-3 h-3 rounded-full animate-bounce"
          style={{ backgroundColor: 'var(--hm-color-accent-purple)' }}
        ></div>
      </div>
      <p
        className="mt-4 font-medium"
        style={{ color: 'var(--hm-color-text-muted)' }}
      >Preparing a safe space for you...</p>
    </div>
  );
}

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Header />
        <Suspense fallback={<Loader />}>
          <Box as="main" w={["100%","80%"]} mx="auto" px={[6,8]}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/stories" element={<Stories />} />
              <Route path="/volunteer" element={<Volunteer />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/change-email" element={<ChangeEmail />} />
              <Route path="/voicemate" element={<VoiceMate />} />
            </Routes>
          </Box>
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
