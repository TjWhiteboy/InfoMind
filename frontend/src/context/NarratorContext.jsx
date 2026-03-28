import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const NarratorContext = createContext();

export function NarratorProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentArticleId, setCurrentArticleId] = useState(null);
  const [rate, setRate] = useState(1);
  const location = useLocation();

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentArticleId(null);
  }, []);

  // Stop reading when route changes
  useEffect(() => {
    stop();
  }, [location.pathname, stop]);

  // Handle voices changing to ensure we have voices loaded
  useEffect(() => {
    const handleVoicesChanged = () => {
      window.speechSynthesis.getVoices();
    };
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    handleVoicesChanged(); // Initial load
  }, []);

  const play = useCallback((text, articleId = null) => {
    // Prevent overlap
    window.speechSynthesis.cancel();
    
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    
    // Attempt to set a natural English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.includes('en-US')) || voices.find(v => v.lang.includes('en'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentArticleId(articleId);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentArticleId(null);
    };

    utterance.onerror = (e) => {
      console.error('Narrator error:', e);
      stop();
    };

    window.speechSynthesis.speak(utterance);
  }, [rate, stop]);

  const pause = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, []);

  const toggleRate = useCallback(() => {
    setRate(prev => (prev === 1 ? 1.5 : 1));
  }, []);

  return (
    <NarratorContext.Provider value={{
      isPlaying,
      isPaused,
      currentArticleId,
      rate,
      play,
      pause,
      resume,
      stop,
      toggleRate
    }}>
      {children}
    </NarratorContext.Provider>
  );
}

export const useNarrator = () => useContext(NarratorContext);
