import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useAppContext } from './context/AppContext';
import { NarratorProvider } from './context/NarratorContext';
import Home from './pages/Home';
import NavigatorPage from './pages/NavigatorPage';
import MyFeedPage from './pages/MyFeedPage';
import NewsDetailsPage from './pages/NewsDetailsPage';
import SavedFeedPage from './pages/SavedFeedPage';
import ProfilePage from './pages/ProfilePage';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const { darkMode } = useAppContext();
  const location = useLocation();
  
  return (
    <div className={
      darkMode 
        ? 'dark min-h-screen bg-[#0b0b0b] text-[#ffffff]' 
        : 'min-h-screen bg-[#F0F0F0] text-[#0b0b0b]'
    }>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <Routes location={location}>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />

            {/* Protected Routes */}
            <Route path="/news" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/navigator" element={<ProtectedRoute><NavigatorPage /></ProtectedRoute>} />
            <Route path="/myfeed" element={<ProtectedRoute><MyFeedPage /></ProtectedRoute>} />
            <Route path="/my-feed" element={<ProtectedRoute><MyFeedPage /></ProtectedRoute>} />
            <Route path="/news-details" element={<ProtectedRoute><NewsDetailsPage /></ProtectedRoute>} />
            <Route path="/saved-feed" element={<ProtectedRoute><SavedFeedPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <NarratorProvider>
          <AppContent />
        </NarratorProvider>
      </Router>
    </AppProvider>
  );
}
