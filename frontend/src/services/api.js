import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = `${API_URL}/api`;

const API = axios.create({ baseURL: BASE_URL });

// ── Auth token helper ────────────────────────────────────────────
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// ── AUTH ─────────────────────────────────────────────────────────
export const login = async (email, password) => {
  const res = await API.post('/auth/login', { email, password });
  return res.data;
};

export const register = async (name, email, password, profession) => {
  const res = await API.post('/auth/register', { name, email, password, profession });
  return res.data;
};

export const checkEmailVerification = async (email) => {
  try {
    const res = await API.post('/auth/check-email', { email });
    return res.data;
  } catch (err) {
    return { exists: false };
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
};

export const fetchProfile = async () => {
  const res = await API.get('/auth/profile', { headers: getHeaders() });
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await API.put('/auth/profile', data, { headers: getHeaders() });
  return res.data;
};

export const updatePassword = async (data) => {
  const res = await API.put('/auth/password', data, { headers: getHeaders() });
  return res.data;
};

export const updatePhoto = async (file) => {
  const formData = new FormData();
  formData.append("photo", file);
  
  const token = localStorage.getItem('token');
  const res = await axios.put(`${BASE_URL}/auth/photo`, formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
};

export const deleteAccount = async (confirmationText) => {
  const res = await API.delete('/auth/profile', { 
    data: { confirmationText },
    headers: getHeaders() 
  });
  return res.data;
};

// ── NEWS ─────────────────────────────────────────────────────────
export const fetchNews = async (category = 'business', profession = '', lang = 'en', personalized = false, page = 1) => {
  try {
    const res = await API.get('/news', { 
      params: { category, profession, lang, personalized, page, _t: Date.now() },
      headers: getHeaders()
    });
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error('fetchNews error:', error.message);
    return [];
  }
};

// ── AI FEATURES ──────────────────────────────────────────────────
export const fetchSummary = async (content, lang) => {
  try {
    const res = await axios.post(`${BASE_URL}/summary`, { content, lang }, { headers: getHeaders() });
    return res.data;
  } catch {
    return { bullets: [] };
  }
};

export const fetchImpact = async (content, profession, lang) => {
  try {
    const res = await axios.post(`${BASE_URL}/impact`, { content, profession, lang }, { headers: getHeaders() });
    return res.data;
  } catch {
    return { impact: "Impact analysis unavailable." };
  }
};

// Primary chat function — sends content + message + history to backend
export const sendChatMessage = async (content, message, profession, lang, history = []) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/chat`,
      { content, message, profession, lang, history },
      { headers: getHeaders() }
    );
    return res.data;
  } catch {
    return { reply: "Chat is temporarily unavailable. Please try again." };
  }
};

export const fetchSentiment = async (title, description) => {
  try {
    const res = await axios.post(`${BASE_URL}/sentiment`, { title, description }, { headers: getHeaders() });
    return res.data;
  } catch {
    return { sentiment: "neutral", score: 0.5 };
  }
};

export const fetchWatchNext = async (content) => {
  try {
    const res = await axios.post(`${BASE_URL}/watchnext`, { content }, { headers: getHeaders() });
    return res.data;
  } catch {
    return { predictions: [] };
  }
};

export const fetchNavigator = async (articles) => {
  try {
    const res = await axios.post(`${BASE_URL}/navigator`, { articles }, { headers: getHeaders() });
    return res.data;
  } catch {
    return { summary: "Navigator unavailable.", insights: [], questions: [] };
  }
};

export const translateContent = async (text, targetLang) => {
  try {
    const res = await axios.post(`${BASE_URL}/translate`, { text, targetLang }, { headers: getHeaders() });
    return res.data;
  } catch {
    return { translatedText: text };
  }
};

// ── CHAT HISTORY (MongoDB) ────────────────────────────────────────
export const saveChatHistory = async (articleId, messages) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user?.id || user?._id || 'anonymous';
    await axios.post(
      `${BASE_URL}/chat/save`,
      { userId, articleId, messages },
      { headers: getHeaders() }
    );
  } catch (err) {
    console.warn('Chat history save failed (non-critical):', err.message);
  }
};

export const fetchChatHistory = async (articleId) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user?.id || user?._id || 'anonymous';
    const res = await axios.get(`${BASE_URL}/chat/history/${encodeURIComponent(articleId)}`, {
      params: { userId },
      headers: getHeaders()
    });
    return res.data?.messages || [];
  } catch {
    return [];
  }
};

// ── ARTICLES ─────────────────────────────────────────────────────
// Save an article (full object)
export const saveArticle = async (article) => {
  try {
    const res = await API.post("/articles/save", { article }, { headers: getHeaders() });
    return res.data;
  } catch (err) {
    console.error('saveArticle error:', err.message);
    return { success: false, error: err.message };
  }
};

// Get all saved articles for logged-in user
export const getSavedArticles = async () => {
  try {
    const res = await API.get("/articles", { headers: getHeaders() });
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error('getSavedArticles error:', err.message);
    return [];
  }
};

// Check if a specific article (by URL) is already saved
export const checkArticleSaved = async (url) => {
  try {
    const res = await API.get(`/articles/check`, {
      params: { url },
      headers: getHeaders()
    });
    return res.data; // { isSaved: bool, id: string|null }
  } catch {
    return { isSaved: false, id: null };
  }
};

// Remove a saved article by its MongoDB _id
export const removeArticle = async (id) => {
  try {
    const res = await API.delete(`/articles/${id}`, { headers: getHeaders() });
    return res.data;
  } catch (err) {
    console.error('removeArticle error:', err.message);
    return { success: false };
  }
};


// ── LEGACY ALIASES (kept for backward compatibility) ─────────────
export const summarizeArticle = (content) => fetchSummary(content);
export const navigatorAI = (articles) => fetchNavigator(articles);

// sendChat: accepts either (data object) or direct args — safe wrapper
export const sendChat = async (dataOrContent, message, profession, lang, history) => {
  // Support legacy: sendChat({ article, question, userId, persona, lang })
  if (dataOrContent && typeof dataOrContent === 'object' && !message) {
    const d = dataOrContent;
    return sendChatMessage(d.content || d.article || '', d.message || d.question || '', d.profession || d.persona, d.lang, d.history || []);
  }
  return sendChatMessage(dataOrContent, message, profession, lang, history);
};

// getHistory: re-mapped to new route
export const getHistory = (userId, articleId) => fetchChatHistory(articleId);

export default API;
