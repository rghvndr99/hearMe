import React, { Suspense, lazy, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import theme from './theme';
import './styles.css';
import './styles/components.css';
import Footer from './components/Footer';
import Header from './components/Header';
import ChatBubble from './components/ChatBubble';
import { useTranslation } from 'react-i18next';


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
const Pricing = lazy(() => import('./pages/Pricing'));
const Payment = lazy(() => import('./pages/Payment'));


function RouteMetaSetter() {
  const { pathname } = useLocation();
  const { t } = useTranslation('common');

  useEffect(() => {
    const metaMap = {
      '/': {
        title: t('meta.home.title', 'HearMe — Support that listens'),
        description: t('meta.home.description', 'Chat or talk in Hindi and English with an empathetic AI and volunteers.'),
      },
      '/chat': {
        title: t('meta.chat.title', 'Chat — HearMe'),
        description: t('meta.chat.description', 'Start a caring conversation in Hindi or English. Talk or type; we listen.'),
      },
      '/stories': {
        title: t('meta.stories.title', 'Stories — HearMe'),
        description: t('meta.stories.description', 'Real stories of resilience and healing from our community.'),
      },
      '/volunteer': {
        title: t('meta.volunteer.title', 'Volunteer — HearMe'),
        description: t('meta.volunteer.description', 'Join as a caring listener and support people when it matters.'),
      },
      '/resources': {
        title: t('meta.resources.title', 'Resources — HearMe'),
        description: t('meta.resources.description', 'Guides and tools for mental well-being in Hindi and English.'),
      },
      '/about': {
        title: t('meta.about.title', 'About — HearMe'),
        description: t('meta.about.description', 'Why we built HearMe and how we support you compassionately.'),
      },
      '/contact': {
        title: t('meta.contact.title', 'Contact — HearMe'),
        description: t('meta.contact.description', 'Reach our team for questions, feedback, or support.'),
      },
      '/login': {
        title: t('meta.login.title', 'Login — HearMe'),
        description: t('meta.login.description', 'Sign in to access your conversations, settings, and membership.'),
      },
      '/register': {
        title: t('meta.register.title', 'Register — HearMe'),
        description: t('meta.register.description', 'Create your account to start chatting or talking with HearMe.'),
      },
      '/profile': {
        title: t('meta.profile.title', 'Profile — HearMe'),
        description: t('meta.profile.description', 'Manage your account, language, and voice preferences.'),
      },
      '/forgot-password': {
        title: t('meta.forgot.title', 'Forgot Password — HearMe'),
        description: t('meta.forgot.description', 'Recover access to your HearMe account securely.'),
      },
      '/reset-password': {
        title: t('meta.reset.title', 'Reset Password — HearMe'),
        description: t('meta.reset.description', 'Set a new password to protect your account.'),
      },
      '/change-password': {
        title: t('meta.changePassword.title', 'Change Password — HearMe'),
        description: t('meta.changePassword.description', 'Update your account password securely.'),
      },
      '/change-email': {
        title: t('meta.changeEmail.title', 'Change Email — HearMe'),
        description: t('meta.changeEmail.description', 'Update your email address for sign-in and notifications.'),
      },
      '/pricing': {
        title: t('meta.pricing.title', 'Pricing — HearMe'),
        description: t('meta.pricing.description', 'Choose a plan that fits your rhythm: Free, Care, or Companion.'),
      },
      '/payment': {
        title: t('meta.payment.title', 'Payment — HearMe'),
        description: t('meta.payment.description', 'Secure UPI payment to activate your HearMe membership.'),
      },
      '/voicemate': {
        title: t('meta.voicemate.title', 'VoiceMate — HearMe'),
        description: t('meta.voicemate.description', 'Create and manage your personalized voice for conversations.'),
      },
      '/privacy': {
        title: t('meta.privacy.title', 'Privacy — HearMe'),
        description: t('meta.privacy.description', 'Learn how we protect your data and conversations.'),
      },
    };

    const meta = metaMap[pathname] || { title: 'HearMe', description: 'Mental health support in Hindi and English.' };
    try {
      document.title = meta.title;
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', meta.description);
    } catch {}
  }, [pathname, t]);

  return null;
}


const Privacy = lazy(() => import('./pages/Privacy'));

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
    <ChakraProvider theme={theme}>
      <Router>
        <Header />
        <RouteMetaSetter />
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
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/payment" element={<Payment />} />

              <Route path="/voicemate" element={<VoiceMate />} />
              <Route path="/privacy" element={<Privacy />} />

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
