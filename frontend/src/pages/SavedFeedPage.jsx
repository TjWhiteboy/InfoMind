import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "../components/Navbar";
import { getSavedArticles, removeArticle } from "../services/api";

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1611974717482-9721703666b6?auto=format&fit=crop&q=80&w=800";

function SavedCard({ article, onRemove, index }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group bg-[#111111] border border-[#5C4037]/15 hover:border-[#ff6a00]/50 overflow-hidden relative transition-all duration-300"
    >
      {/* Remove Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(article._id || article.id); }}
        className="absolute top-4 right-4 z-20 w-10 h-10 bg-[#0b0b0b]/80 backdrop-blur-md border border-[#FE3131]/30 text-[#FE3131] flex items-center justify-center hover:bg-[#FE3131] hover:text-[#0b0b0b] transition-all duration-200"
        title="Remove from saved"
      >
        <span className="material-symbols-outlined text-base">delete</span>
      </button>

      {/* Image Area */}
      <div 
        onClick={() => navigate("/news-details", { state: { article } })}
        className="aspect-video overflow-hidden bg-[#111111] cursor-pointer relative"
      >
        <img
          src={imgError ? PLACEHOLDER_IMG : (article.imageUrl || article.image || PLACEHOLDER_IMG)}
          alt={article.title}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 opacity-40 group-hover:opacity-100 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b] via-transparent to-transparent opacity-80" />
        <span className="absolute bottom-4 left-4 px-3 py-1.5 bg-[#0b0b0b]/90 text-[#ff6a00] font-mono text-sm font-black uppercase tracking-[0.2em] border border-[#ff6a00]/30">
          {article.category || "Saved"}
        </span>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4 font-mono text-sm uppercase tracking-widest text-[#ffffff] opacity-40">
          <span>{article.source || "UNKNOWN"}</span>
          <span>/</span>
          <span>{article.publishedAt || "NO DATE"}</span>
        </div>
        
        <h3 
          onClick={() => navigate("/news-details", { state: { article } })}
          className="font-['Newsreader'] text-xl md:text-2xl font-extrabold text-[#ffffff] leading-tight tracking-tighter uppercase mb-6 line-clamp-2 cursor-pointer group-hover:text-[#ff6a00] transition-colors"
        >
          {article.title}
        </h3>
        
        <button
          onClick={() => navigate("/news-details", { state: { article } })}
          className="flex items-center gap-3 font-mono text-sm sm:text-base font-black text-[#ff6a00] uppercase tracking-widest hover:translate-x-1 transition-transform"
        >
          Read More
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </button>
      </div>
    </motion.div>
  );
}

export default function SavedFeedPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSaved();
  }, []);

  const loadSaved = async () => {
    setLoading(true);
    try {
      const data = await getSavedArticles();
      setArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      const res = await removeArticle(id);
      if (res.success) {
        setArticles(prev => prev.filter(a => (a._id || a.id) !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-[#ffffff]">
      <Navbar />

      <header className="border-b border-[#5C4037]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2.5 h-2.5 bg-[#ff6a00] rounded-full" />
              <p className="font-mono text-sm sm:text-base text-[#ff6a00] uppercase tracking-[0.4em] font-black">
                Secure Archive
              </p>
            </div>
            <h1 className="font-['Newsreader'] text-6xl md:text-8xl font-extrabold uppercase tracking-tighter leading-[0.85] mb-6">
              Saved Feed
            </h1>
            <p className="font-mono text-sm opacity-50 uppercase tracking-widest max-w-xl">
              Your personal vault of curated news and market insights
            </p>
          </motion.div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#111111] border border-[#5C4037]/10 aspect-[4/5] animate-pulse" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-32 border border-[#5C4037]/15 bg-[#111111]/50">
            <span className="material-symbols-outlined text-6xl text-[#ff6a00] opacity-30 mb-6 block">folder_open</span>
            <p className="font-mono text-sm sm:text-base text-[#ffffff] opacity-40 uppercase tracking-[0.3em] mb-8 font-black">
              Your saved feed is currently empty
            </p>
            <button
              onClick={() => navigate("/news")}
              className="px-10 py-5 bg-[#ff6a00] text-[#0b0b0b] font-mono font-black text-sm sm:text-base uppercase tracking-[0.2em] hover:bg-[#FFE600] transition-all"
            >
              Browse News Feed
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {articles.map((article, i) => (
                <SavedCard 
                  key={article._id || article.id} 
                  article={article} 
                  onRemove={handleRemove}
                  index={i}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
