import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage, saveChatHistory, fetchChatHistory } from '../services/api';
import { useAppContext } from '../context/AppContext';

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1611974717482-9721703666b6?auto=format&fit=crop&q=80&w=1200";

export default function ChatPanel({ content, articleId }) {
  const { language } = useAppContext();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const profession = user.profession || 'PROFESSIONAL';
  
  // messages: [{ role: 'user'|'ai', text, time }]
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const scrollRef = useRef(null);

  // ── Load history from MongoDB on mount ──────────────────────────
  useEffect(() => {
    if (!articleId) return;
    const loadHistory = async () => {
      try {
        const hist = await fetchChatHistory(articleId);
        if (Array.isArray(hist) && hist.length > 0) {
          const loaded = hist.map(m => ({
            role: m.role === 'assistant' ? 'ai' : 'user',
            text: m.content || '',
            time: m.timestamp
              ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : ''
          }));
          setMessages(loaded);
        }
      } catch (err) {
        console.warn('History load skipped:', err.message);
      } finally {
        setHistoryLoaded(true);
      }
    };
    loadHistory();
  }, [articleId, profession]);

  // ── Auto-scroll ──────────────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // ── Send message ─────────────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { role: 'user', text: input, time: now };
    const currentInput = input;
    setInput('');
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // Build OpenAI-compatible history from current messages
      const history = messages.map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text
      }));

      const res = await sendChatMessage(content || '', currentInput, profession, language, history);
      const replyText = res?.reply || "I couldn't generate a response. Please try again.";
      const aiMsg = { role: 'ai', text: replyText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };

      const next = [...messages, userMsg, aiMsg];
      setMessages(next);

      // ── Persist to MongoDB (non-blocking) ──────────────────────
      if (articleId) {
        saveChatHistory(articleId, next.map(m => ({
          role: m.role === 'ai' ? 'assistant' : 'user',
          content: m.text
        })));
      }
    } catch (err) {
      console.error('Chat send error:', err);
      setMessages(prev => [...prev, {
        role: 'ai',
        text: "I encountered an error. Please try again.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-[550px] bg-[#0b0b0b] overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#111111]">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#ff6a00] text-xl">terminal</span>
          <span className="font-['Space_Grotesk'] text-sm font-black tracking-widest text-[#ffffff] uppercase">
            NEURAL_CHAT
          </span>
          <div className="flex items-center gap-1.5 ml-2">
            <div className="w-[6px] h-[6px] bg-[#FFE600] animate-pulse rounded-full" />
            <span className="font-mono text-sm text-[#FFE600]">LIVE</span>
          </div>
        </div>
        <div className="bg-[#ff6a00] px-2 py-1">
          <span className="font-mono text-sm font-bold text-[#0b0b0b] uppercase">
            MODE: {profession.toUpperCase()}
          </span>
        </div>
      </div>

      {/* MESSAGES */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#111111]">
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <p className="font-mono text-[#ff6a00] text-sm mb-1">{">"} NEURAL_CHAT_INITIALIZED</p>
            <p className="font-mono text-[#ffffff] opacity-40 text-sm">{">"} AWAITING_INPUT</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="mb-1">
                <span className={`font-mono text-sm uppercase ${msg.role === 'user' ? 'opacity-40 text-[#ffffff]' : 'text-[#FFE600]'}`}>
                  {msg.role === 'user' ? 'YOU_' : 'AI_CORE_'}
                </span>
              </div>
              <div className={`p-4 ${msg.role === 'user' ? 'bg-[#111111] border-r-[3px] border-[#ff6a00]' : 'bg-[#111111] border-l-[3px] border-[#FFE600]'}`}>
                <p className={`font-['Space_Grotesk'] text-sm leading-relaxed ${msg.role === 'user' ? 'text-[#ffffff]' : 'text-[#FFE600]'}`}>
                  {msg.text}
                </p>
              </div>
              {msg.time && (
                <div className="mt-1">
                  <span className="font-mono text-sm opacity-30 text-[#ffffff]">{msg.time}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] flex flex-col items-start">
              <span className="font-mono text-sm text-[#FFE600] uppercase mb-1">AI_CORE_PROCESSING...</span>
              <div className="bg-[#111111] border-l-[3px] border-[#FFE600] p-4">
                <div className="flex gap-2">
                  {[0, 0.3, 0.6].map((delay, i) => (
                    <div key={i} className="w-2 h-2 bg-[#FFE600] animate-pulse" style={{ animationDelay: `${delay}s` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="bg-[#111111] p-4 border-t-2 border-[#111111]">
        <form onSubmit={handleSend} className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="> ENTER_QUERY..."
            className="flex-1 bg-[#111111] px-4 py-3 font-['Space_Grotesk'] text-sm text-[#ffffff] placeholder:text-[#ffffff] placeholder:opacity-40 focus:outline-none focus:border-l-2 focus:border-[#ff6a00] transition-all duration-100"
            style={{ caretColor: '#FFE600' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className={`px-6 py-3 font-mono font-black text-sm uppercase transition-all duration-0 ${
              !input.trim() || loading
                ? 'bg-[#111111] text-[#ffffff] opacity-40 cursor-not-allowed'
                : 'bg-[#ff6a00] text-[#0b0b0b] hover:bg-[#0b0b0b] hover:text-[#ff6a00]'
            }`}
          >
            TRANSMIT_
          </button>
        </form>
        <p className="font-mono text-sm opacity-30 text-[#ffffff] uppercase tracking-widest mt-2">
          [ CONTEXT: CURRENT_ARTICLE_ONLY — PROFESSION: {profession.toUpperCase()} ]
        </p>
      </div>
    </div>
  );
}
