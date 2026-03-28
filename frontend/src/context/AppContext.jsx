import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const getUserFromStorage = () => {
    try {
      const user = localStorage.getItem('user');
      if (!user || user === 'undefined') return null;
      return JSON.parse(user);
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
      return null;
    }
  };


  const [language, setLanguageState] = useState(() => {
    const user = getUserFromStorage();
    return user?.language || 'en';
  });

  const [selectedArticles, setSelectedArticles] = useState([]);

  useEffect(() => {
    const user = getUserFromStorage();
    if (user) {
      user.language = language;
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [language]);

  const setLanguage = (l) => setLanguageState(l);

  const toggleArticleSelection = (id) => {
    setSelectedArticles(prev => 
      prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]
    );
  };

  const clearArticleSelection = () => setSelectedArticles([]);

  return (
    <AppContext.Provider value={{
      language,
      setLanguage,
      selectedArticles,
      toggleArticleSelection,
      clearArticleSelection
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
