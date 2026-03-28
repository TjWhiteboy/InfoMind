import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { summarizeArticle, fetchNews, saveArticle } from "../services/api";
import { motion } from "motion/react";
import Navbar from "../components/Navbar";
import ImpactCard from "../components/ImpactCard";
import ChatPanel from "../components/ChatPanel";

const ArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const news = await fetchNews();
        const found = news.find(a => a.id.toString() === id);
        if (found) {
          setArticle(found);
        }
      } catch (err) {
        console.error("Error loading article:", err);
      } finally {
        setFetching(false);
      }
    };
    loadArticle();
  }, [id]);

  const handleSummarize = async () => {
    if (!article) return;
    setLoading(true);

    try {
      const data = await summarizeArticle(article.content);
      // Backend returns { bullets: [...] }
      setSummary(data.bullets || data.summary || []);
    } catch (err) {
      console.error(err);
      alert("Error summarizing");
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!article) return;
    setSaving(true);
    try {
      await saveArticle({
        title: article.title,
        content: article.content
      });
      alert("ARTICLE_SAVED_SUCCESSFULLY_");
    } catch (err) {
      console.error(err);
      alert("FAILED_TO_SAVE_ARTICLE_");
    }
    setSaving(false);
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] text-[#ffffff]">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-[#ff6a00] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] text-[#ffffff]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-32 text-center">
          <h1 className="text-4xl font-bold mb-8">ARTICLE_NOT_FOUND</h1>
          <button onClick={() => navigate('/news')} className="text-[#ff6a00] font-mono">BACK_TO_HOME</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-[#ffffff]">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button 
          onClick={() => navigate('/news')}
          className="flex items-center gap-2 font-mono text-sm font-bold text-[#ffffff] opacity-40 hover:opacity-100 mb-12 uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>BACK_TO_HOME</span>
        </button>

        <div className="mb-12">
          <h1 className="font-['Newsreader'] text-5xl md:text-7xl font-extrabold mb-8 leading-tight tracking-tighter uppercase">
            {article.title}
          </h1>
          
          <div className="flex items-center gap-4 text-sm font-mono opacity-40 mb-12">
            <span>{article.source}</span>
            <span>•</span>
            <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
          </div>

          <div className="aspect-video bg-[#111111] border border-[#5C4037]/15 mb-12 overflow-hidden">
            {article.imageUrl && (
              <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover opacity-80" />
            )}
          </div>

          <div className="font-['Space_Grotesk'] text-lg leading-relaxed opacity-80 mb-12">
            {article.content}
          </div>

          <div className="border-t border-[#5C4037]/20 pt-12 space-y-12">
            <div className="flex flex-col md:flex-row gap-6">
              <button
                onClick={handleSummarize}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-[#ff6a00] text-[#0b0b0b] font-mono font-black text-sm uppercase tracking-[0.2em] transition-all duration-0 hover:bg-[#0b0b0b] hover:text-[#ff6a00]"
              >
                <span className="material-symbols-outlined text-sm">
                  {loading ? 'sync' : 'auto_awesome'}
                </span>
                <span>{loading ? "SUMMARIZING..." : "AI_SUMMARIZE"}</span>
              </button>
              
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-3 px-8 py-5 border-2 border-[#5C4037]/30 text-[#ffffff] font-mono font-black text-sm uppercase tracking-[0.2em] transition-all duration-0 hover:bg-[#FFE600] hover:text-[#0b0b0b] hover:border-[#FFE600]"
              >
                <span className="material-symbols-outlined text-sm">save</span>
                <span>{saving ? "SAVING..." : "SAVE_ARTICLE"}</span>
              </button>
            </div>

            {summary && summary.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 bg-[#111111] border-l-4 border-[#ff6a00]"
              >
                <h3 className="font-mono text-sm font-black text-[#ff6a00] mb-6 uppercase tracking-widest">NEURAL_SUMMARY_</h3>
                <div className="space-y-4">
                  {summary.map((point, i) => (
                    <p key={i} className="font-['Space_Grotesk'] text-[#ffffff] opacity-80 leading-relaxed flex gap-3">
                      <span className="text-[#ff6a00] font-bold">0{i+1}_</span>
                      {point}
                    </p>
                  ))}
                </div>
              </motion.div>
            )}

            <ImpactCard content={article.content} />
            
            <div className="pt-12">
              <ChatPanel content={article.content} articleId={article.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ArticlePage;
