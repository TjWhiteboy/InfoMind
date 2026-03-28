import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  fetchSummary, 
  fetchImpact, 
  sendChatMessage, 
  fetchSentiment, 
  fetchWatchNext,
  saveChatHistory,
  fetchChatHistory 
} from '../services/api';
import { useAppContext } from '../context/AppContext';

export default function AIInteractionPanel({ article }) {
  const navigate = useNavigate();
  const { language } = useAppContext();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const profession = user.profession || 'Professional';
  
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── AI States (Cache) ──────────────────────────────────────────
  const [summary, setSummary] = useState(null);
  const [impact, setImpact] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  
  const scrollRef = useRef(null);

  // ── Tabs Config ────────────────────────────────────────────────
  const tabs = [
    { id: 'summary', label: 'Summarize', icon: 'subject' },
    { id: 'impact', label: 'Impact', icon: 'bolt' },
    { id: 'chat', label: 'AI Chat', icon: 'forum' },
    { id: 'sentiment', label: 'Sentiment', icon: 'analytics' },
    { id: 'related', label: 'Related', icon: 'article' },
  ];

  // ── Load Chat History on Mount ─────────────────────────────────
  useEffect(() => {
    if (article?.url || article?._id) {
      const articleId = article._id || article.url;
      fetchChatHistory(articleId).then(hist => {
        if (hist && hist.length > 0) {
          setChatMessages(hist.map(m => ({
            role: m.role === 'assistant' ? 'ai' : 'user',
            text: m.content,
            time: new Date(m.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })));
        }
      });
    }
  }, [article]);

  // ── Auto-scroll Chat ───────────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'chat' && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, loading, activeTab]);

  // ── Logic Handlers ─────────────────────────────────────────────
  
  const handleAction = async (tabId) => {
    setActiveTab(tabId);
    setError(null);

    const content = article.content || article.description || article.title;

    if (tabId === 'summary' && !summary) {
      setLoading(true);
      const res = await fetchSummary(content, language);
      setSummary(res.bullets || []);
      setLoading(false);
    } 
    
    else if (tabId === 'impact' && !impact) {
      setLoading(true);
      const res = await fetchImpact(content, profession, language);
      setImpact(res.impact);
      setLoading(false);
    }

    else if (tabId === 'sentiment' && !sentiment) {
      setLoading(true);
      const res = await fetchSentiment(article.title, article.description);
      setSentiment(res);
      setLoading(false);
    }

    else if (tabId === 'related' && !predictions) {
      setLoading(true);
      try {
        const res = await fetchWatchNext(content);
        setPredictions(res.predictions || []);
      } catch (err) {
        setPredictions([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || loading) return;

    const userMsg = { 
      role: 'user', 
      text: chatInput, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    const currentInput = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = chatMessages.map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text
      }));

      const res = await sendChatMessage(
        article.content || article.description, 
        currentInput, 
        profession, 
        language, 
        history
      );

      const aiMsg = { 
        role: 'ai', 
        text: res.reply, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };

      const nextMessages = [...chatMessages, userMsg, aiMsg];
      setChatMessages(nextMessages);

      // Persist
      const articleId = article._id || article.url;
      saveChatHistory(articleId, nextMessages.map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text
      })));

    } catch (err) {
      setError("AI core connection failed.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render Helpers ─────────────────────────────────────────────
  
  const renderLoading = () => (
    <div className="py-12 flex flex-col items-center justify-center space-y-6">
      <div className="w-10 h-10 border-4 border-[#ff6a00] border-t-transparent animate-spin rounded-full" />
      <p className="font-mono text-sm sm:text-base text-[#ff6a00] font-black animate-pulse uppercase tracking-[0.3em]">Processing Intelligence...</p>
    </div>
  );

  return (
    <div className="bg-[#111111] border border-[#5C4037]/20 overflow-hidden shadow-2xl">
      {/* HEADER / TABS */}
      <div className="grid grid-cols-2 md:grid-cols-5 border-b border-[#5C4037]/20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleAction(tab.id)}
            className={`flex flex-col items-center justify-center py-6 gap-3 transition-all relative ${
              activeTab === tab.id 
                ? 'bg-[#0b0b0b] text-[#ff6a00]' 
                : 'text-[#ffffff] opacity-40 hover:opacity-100 hover:bg-[#0b0b0b]/50'
            }`}
          >
            <span className="material-symbols-outlined text-2xl mb-1">{tab.icon}</span>
            <span className="font-mono text-sm sm:text-base font-black uppercase tracking-widest">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div layoutId="panel-tab" className="absolute bottom-0 left-0 w-full h-[3px] bg-[#ff6a00]" />
            )}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="p-8 min-h-[300px] bg-[#0b0b0b]/50">
        <AnimatePresence mode="wait">
          {loading && activeTab !== 'chat' ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              {renderLoading()}
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* SUMMARY VIEW */}
              {activeTab === 'summary' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="w-2 h-8 bg-[#ff6a00]" />
                    <h4 className="font-mono text-sm sm:text-base font-black text-[#ffffff] uppercase tracking-widest">Executive Summary</h4>
                  </div>
                  <ul className="space-y-4">
                    {(summary || []).map((bullet, i) => (
                      <motion.li 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="flex gap-4 items-start"
                      >
                        <span className="font-mono text-[#ff6a00] mt-1">[{i+1}]</span>
                        <p className="font-['Space_Grotesk'] text-lg text-[#ffffff] opacity-80 leading-relaxed">
                          {bullet}
                        </p>
                      </motion.li>
                    ))}
                    {!summary && !loading && (
                      <div className="py-16 text-center opacity-40 italic font-mono text-sm sm:text-base uppercase tracking-widest">
                        Click 'Summarize' to generate briefing...
                      </div>
                    )}
                  </ul>
                </div>
              )}

              {/* IMPACT VIEW */}
              {activeTab === 'impact' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="w-2 h-8 bg-[#FFE600]" />
                    <h4 className="font-mono text-sm sm:text-base font-black text-[#ffffff] uppercase tracking-widest">Global Impact Analysis</h4>
                  </div>
                  <div className="p-8 bg-[#0b0b0b] border-l-4 border-[#FFE600] shadow-lg">
                    <p className="font-mono text-sm sm:text-base text-[#FFE600] uppercase tracking-widest mb-6 opacity-80 font-black">Context: {profession}</p>
                    <p className="font-['Newsreader'] text-3xl font-bold italic text-[#ffffff] leading-relaxed">
                       {impact ? `"${impact}"` : "Calculating impact vectors based on your profession..."}
                    </p>
                  </div>
                </div>
              )}

              {/* CHAT VIEW */}
              {activeTab === 'chat' && (
                <div className="flex flex-col h-[600px] md:h-[700px]">
                  <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-8 pr-4 scrollbar-thin scrollbar-thumb-[#ff6a00]/30 scrollbar-track-transparent">
                    {chatMessages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center opacity-30 space-y-6">
                        <span className="material-symbols-outlined text-6xl shadow-[#ff6a00]">terminal</span>
                        <p className="font-mono text-sm sm:text-base font-black uppercase tracking-widest">Neural Link Synchronized. Ask anything.</p>
                      </div>
                    )}
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-[#ff6a00] text-[#0b0b0b]' : 'bg-[#111111] text-[#FFE600] border-l-4 border-[#FFE600]'} p-6 shadow-xl group`}>
                          <div className="flex justify-between items-center mb-3 md:mb-4 gap-8">
                            <span className="font-mono text-sm font-black uppercase tracking-widest opacity-80">
                              {msg.role === 'user' ? 'Transmission_In' : 'AI_Response_Out'}
                            </span>
                            <span className="font-mono text-sm font-black opacity-60">{msg.time}</span>
                          </div>
                          <p className="font-['Space_Grotesk'] text-lg md:text-xl font-medium leading-relaxed">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-[#111111] p-4 border-l-2 border-[#FFE600] animate-pulse">
                          <div className="flex gap-2">
                            <div className="w-2 h-2 bg-[#FFE600] rounded-full" />
                            <div className="w-2 h-2 bg-[#FFE600] rounded-full" />
                            <div className="w-2 h-2 bg-[#FFE600] rounded-full" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleSendChat} className="mt-8 flex gap-4">
                    <input 
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask the AI about this news..."
                      className="flex-1 bg-[#111111] border border-[#5C4037]/30 p-5 font-['Space_Grotesk'] text-lg text-[#ffffff] outline-none focus:border-[#ff6a00] transition-colors"
                    />
                    <button 
                      type="submit"
                      disabled={loading || !chatInput.trim()}
                      className="px-8 bg-[#ff6a00] text-[#0b0b0b] font-mono font-black text-sm sm:text-base flex items-center justify-center uppercase tracking-widest hover:bg-[#FFE600] transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-xl">send</span>
                    </button>
                  </form>
                </div>
              )}

              {/* SENTIMENT VIEW */}
              {activeTab === 'sentiment' && (
                <div className="space-y-12 py-8">
                  <div className="text-center">
                    <p className="font-mono text-sm sm:text-base text-[#ffffff] opacity-50 font-black uppercase tracking-[0.3em] mb-10">Market Sentiment Engine</p>
                    
                    {sentiment ? (
                      <div className="flex flex-col items-center">
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={`px-16 py-10 border-4 flex items-center gap-6 shadow-xl ${
                            sentiment.sentiment === 'positive' ? 'border-green-500 text-green-500 bg-green-500/10' :
                            sentiment.sentiment === 'negative' ? 'border-red-500 text-red-500 bg-red-500/10' :
                            'border-yellow-500 text-yellow-500 bg-yellow-500/10'
                          }`}
                        >
                          <span className="material-symbols-outlined text-6xl">
                            {sentiment.sentiment === 'positive' ? 'trending_up' : 
                             sentiment.sentiment === 'negative' ? 'trending_down' : 'trending_flat'}
                          </span>
                          <span className="font-['Newsreader'] text-6xl md:text-7xl font-black uppercase tracking-tighter">
                            {sentiment.sentiment}
                          </span>
                        </motion.div>
                        <p className="mt-12 font-mono text-sm sm:text-base font-medium text-[#ffffff] opacity-70 max-w-lg uppercase tracking-widest leading-relaxed">
                          Probability score of {Math.round(sentiment.score * 100)}% based on linguistic analysis of headline and core article vectors.
                        </p>
                      </div>
                    ) : (
                      <div className="py-16 opacity-40 italic font-mono text-sm sm:text-base font-black uppercase tracking-widest">Initializing sentiment scanner...</div>
                    )}
                  </div>
                </div>
              )}

              {/* RELATED ARTICLES VIEW */}
              {activeTab === 'related' && (
                <div className="space-y-10">
                  <div className="flex items-center gap-4 mb-4">
                     <span className="w-2 h-8 bg-[#ff6a00]" />
                     <h4 className="font-mono text-sm sm:text-base font-black text-[#ffffff] uppercase tracking-widest">Related Articles</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {(predictions || []).map((pred, i) => (
                      <motion.div 
                        key={pred.id || i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }}
                        onClick={() => {
                          if (pred.title) {
                            navigate("/news-details", { state: { article: pred } });
                          }
                        }}
                        className="p-8 bg-[#0b0b0b] border border-[#5C4037]/20 hover:border-[#ff6a00] flex flex-col md:flex-row items-start md:items-center gap-8 group cursor-pointer transition-all hover:shadow-[0_0_30px_rgba(255,106,0,0.15)]"
                      >
                        <div className="w-12 h-12 shrink-0 rounded-full border-2 border-[#ff6a00]/40 flex items-center justify-center font-mono text-sm sm:text-base font-black text-[#ff6a00] group-hover:bg-[#ff6a00] group-hover:text-[#0b0b0b] transition-all">
                          {i + 1}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-[#ff6a00]/10 text-[#ff6a00] font-mono text-sm sm:text-base font-black uppercase tracking-widest border border-[#ff6a00]/30">
                              {pred.category || "RELATED"}
                            </span>
                            <span className="font-mono text-sm sm:text-base font-medium text-[#ffffff] opacity-40 uppercase tracking-widest">
                              {pred.source || "Insight Network"}
                            </span>
                          </div>
                          <h5 className="font-['Newsreader'] text-2xl font-extrabold text-[#ffffff] leading-tight group-hover:text-[#ff6a00] transition-colors">
                            {pred.title}
                          </h5>
                          <p className="font-['Space_Grotesk'] text-lg font-medium text-[#ffffff] opacity-60 leading-relaxed line-clamp-2">
                            {pred.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 font-mono text-sm sm:text-base font-black text-[#ff6a00] opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest">
                          <span>Read Next</span>
                          <span className="material-symbols-outlined text-lg sm:text-xl">arrow_forward</span>
                        </div>
                      </motion.div>
                    ))}
                    {!predictions && !loading && (
                       <div className="py-16 text-center opacity-40 italic font-mono text-sm sm:text-base font-medium uppercase tracking-widest">
                         Click to analyze and discover related stories...
                       </div>
                    )}
                    {predictions && predictions.length === 0 && !loading && (
                       <div className="py-16 text-center opacity-40 italic font-mono text-sm sm:text-base font-medium uppercase tracking-widest">
                         No related articles found for this topic.
                       </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER INDICATOR */}
      <div className="px-8 py-6 bg-[#111111] border-t border-[#5C4037]/30 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
          <span className="font-mono text-sm font-black text-[#ffffff] opacity-40 uppercase tracking-[0.2em]">Neural Processor Active</span>
        </div>
        <div className="font-mono text-sm text-[#ff6a00] font-black uppercase tracking-widest">
          InfoMind Intelligence Layer v1.0
        </div>
      </div>
    </div>
  );
}
