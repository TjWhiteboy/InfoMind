import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "../components/Navbar";
import { saveArticle, checkArticleSaved, removeArticle } from "../services/api";
import AIInteractionPanel from "../components/AIInteractionPanel";
import { useNarrator } from "../context/NarratorContext";

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1611974717482-9721703666b6?auto=format&fit=crop&q=80&w=1200";

export default function NewsDetailsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const article = state?.article;
  const { play, currentArticleId, isPlaying, isPaused, stop } = useNarrator();

  const isThisArticlePlaying = currentArticleId === article?.id;
  const isCurrentlyActive = isThisArticlePlaying && (isPlaying || isPaused);

  const handlePlayClick = () => {
    if (isCurrentlyActive) {
      stop();
    } else {
      play(`${article.title}. ${article.description || ''}. ${article.content || ''}`, article.id);
    }
  };

  // ── Save state ─────────────────────────────────────────────────
  const [isSaved, setIsSaved] = useState(false);
  const [savedId, setSavedId] = useState(null);  // MongoDB _id for delete
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Check if this article is already saved on mount + Scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!article?.url) return;
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) return;
    checkArticleSaved(article.url).then(({ isSaved: s, id }) => {
      setIsSaved(s);
      setSavedId(id);
    }).catch(() => {});
  }, [article?.url]);

  // Not-found guard
  if (!article) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] text-[#ffffff]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-32 text-center">
          <p className="font-mono text-sm text-[#ff6a00] uppercase tracking-widest mb-6">
            404: Article Not Found
          </p>
          <h1 className="font-['Newsreader'] text-5xl font-extrabold uppercase tracking-tighter mb-10">
            No Article Data
          </h1>
          <p className="font-['Space_Grotesk'] text-lg opacity-50 mb-10">
            This page must be accessed by clicking a news card.
          </p>
          <button
            onClick={() => navigate("/news")}
            className="flex items-center gap-2 mx-auto font-mono text-sm font-black text-[#ff6a00] uppercase tracking-widest hover:opacity-70 transition-opacity"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Back to News</span>
          </button>
        </div>
      </div>
    );
  }

  const imgSrc = article.imageUrl || article.image || PLACEHOLDER_IMG;
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  // ── Save / Unsave handler ──────────────────────────────────────
  const handleSaveToggle = async () => {
    if (!isLoggedIn) {
      setSaveMsg("Please log in to save articles.");
      setTimeout(() => setSaveMsg(""), 3000);
      return;
    }
    setSaving(true);
    try {
      if (isSaved && savedId) {
        // Unsave
        await removeArticle(savedId);
        setIsSaved(false);
        setSavedId(null);
        setSaveMsg("Article removed from My Feed.");
      } else {
        // Save
        const res = await saveArticle(article);
        if (res?.success || res?.article) {
          setIsSaved(true);
          setSavedId(res?.article?._id || res?._id || null);
          setSaveMsg("Article saved to My Feed! ✓");
        } else {
          setSaveMsg("Could not save article. Please try again.");
        }
      }
    } catch {
      setSaveMsg("An error occurred. Please try again.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-[#ffffff]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 font-mono text-sm font-bold text-[#ffffff] opacity-40 hover:opacity-100 hover:text-[#ff6a00] mb-12 uppercase tracking-widest transition-all duration-150"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Back to News</span>
        </motion.button>

        {/* Category + Source Meta */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="flex flex-wrap items-center gap-3 mb-6"
        >
          <span className="px-3 py-1 bg-[#ff6a00] text-[#0b0b0b] font-mono text-sm font-black uppercase tracking-[0.2em]">
            {article.category || "Business"}
          </span>
          <span className="font-mono text-sm text-[#ff6a00] font-black uppercase tracking-widest">
            {article.source || "Unknown Source"}
          </span>
          <span className="font-mono text-sm text-[#ffffff] opacity-30 uppercase tracking-widest">
            {article.publishedAt || ""}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="font-['Newsreader'] text-4xl md:text-6xl font-extrabold leading-tight tracking-tighter uppercase mb-10"
        >
          {article.title}
        </motion.h1>

        {/* Play Article Button */}
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.35, delay: 0.15 }}
           className="mb-10 flex"
        >
          <button 
             onClick={handlePlayClick}
             className={`flex items-center gap-3 px-6 py-3 border transition-colors duration-150 font-mono text-sm sm:text-base font-black uppercase tracking-widest ${
               isCurrentlyActive 
                 ? 'bg-[#ff6a00] text-[#0b0b0b] border-[#ff6a00]' 
                 : 'bg-[#111111] text-[#ffffff] border-[#5C4037]/30 hover:border-[#ff6a00]'
             }`}
          >
            <span className="material-symbols-outlined text-base">
              {isCurrentlyActive ? 'stop_circle' : 'play_circle'}
            </span>
            <span>{isCurrentlyActive ? 'Stop Reading' : 'Listen to Article'}</span>
          </button>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="w-full aspect-video bg-[#111111] border border-[#5C4037]/15 overflow-hidden mb-10"
        >
          <img
            src={imgSrc}
            alt={article.title}
            referrerPolicy="no-referrer"
            onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG; }}
            className="w-full h-full object-cover opacity-85 hover:opacity-100 transition-opacity duration-300"
          />
        </motion.div>

        {/* Description */}
        {article.description && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="font-['Space_Grotesk'] text-xl md:text-2xl leading-relaxed opacity-70 mb-8 border-l-4 border-[#ff6a00] pl-6"
          >
            {article.description}
          </motion.p>
        )}

        {/* Divider */}
        <div className="w-full h-px bg-[#5C4037]/20 mb-8" />

        {/* Full Content */}
        {article.content && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="font-['Space_Grotesk'] text-lg md:text-xl leading-[1.7] opacity-80 mb-12 whitespace-pre-line"
          >
            {article.content.replace(/\[\+\d+ chars\]$/, "").trim()}
            {article.content.includes("[+") && (
              <span className="block mt-4 font-mono text-sm text-[#ff6a00] opacity-70 uppercase tracking-widest">
                [ Content trimmed — read full article below ]
              </span>
            )}
          </motion.div>
        )}

        {/* ── ACTION BUTTONS ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="pt-6 border-t border-[#5C4037]/20 space-y-4"
        >
          {/* Row 1: Read + Save */}
          <div className="flex flex-col sm:flex-row gap-4">
            {article.url && (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-[#ff6a00] text-[#0b0b0b] font-mono font-black text-base uppercase tracking-[0.2em] hover:bg-[#FFE600] transition-colors duration-150"
              >
                <span className="material-symbols-outlined text-lg">open_in_new</span>
                <span>Read Full Article</span>
              </a>
            )}

            {/* Save / Unsave Toggle */}
            <button
              onClick={handleSaveToggle}
              disabled={saving}
              className={`flex-1 flex items-center justify-center gap-3 px-8 py-5 font-mono font-black text-base uppercase tracking-[0.2em] border transition-all duration-150 ${
                isSaved
                  ? "bg-[#FFE600] text-[#0b0b0b] border-[#FFE600] hover:bg-transparent hover:text-[#FFE600]"
                  : "bg-transparent text-[#ffffff] border-[#5C4037]/40 hover:border-[#FFE600] hover:text-[#FFE600]"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <span className="material-symbols-outlined text-lg">
                {saving ? "sync" : isSaved ? "bookmark_added" : "bookmark"}
              </span>
              <span>
                {saving ? "Saving..." : isSaved ? "Saved ✓" : "Save Article"}
              </span>
            </button>
          </div>

          {/* Row 2: Back to feed */}
          <button
            onClick={() => navigate("/news")}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 border border-[#5C4037]/20 text-[#ffffff] font-mono font-black text-base uppercase tracking-[0.2em] hover:bg-[#111111] transition-colors duration-150 opacity-60 hover:opacity-100"
          >
            <span className="material-symbols-outlined text-lg">grid_view</span>
            <span>Back to News</span>
          </button>

          {/* Toast notification */}
          <AnimatePresence>
            {saveMsg && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`text-center font-mono text-sm uppercase tracking-widest py-3 px-4 ${
                  saveMsg.includes("✓") || saveMsg.includes("saved")
                    ? "bg-[#FFE600]/10 text-[#FFE600] border border-[#FFE600]/20"
                    : "bg-[#ff6a00]/10 text-[#ff6a00] border border-[#ff6a00]/20"
                }`}
              >
                {saveMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Link to My Feed if saved */}
          {isSaved && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => navigate("/my-feed")}
              className="w-full flex items-center justify-center gap-2 font-mono text-sm text-[#FFE600] uppercase tracking-widest hover:opacity-70 transition-opacity"
            >
              <span className="material-symbols-outlined text-base">collections_bookmark</span>
              <span>View My Feed →</span>
            </motion.button>
          )}
        </motion.div>

        {/* ── AI INTELLIGENCE LAYER ───────────────────────────────── */}
        <div className="mt-20">
          <AIInteractionPanel article={article} />
        </div>
      </main>
    </div>
  );
}
