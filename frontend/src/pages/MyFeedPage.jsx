import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "../components/Navbar";
import { getSavedArticles, removeArticle } from "../services/api";
import { useNarrator } from "../context/NarratorContext";

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1611974717482-9721703666b6?auto=format&fit=crop&q=80&w=1200";

function PersonalizedCard({ article, index }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const handleClick = () => {
    navigate("/news-details", { state: { article } });
  };
  
  const { play, currentArticleId, isPlaying, isPaused, stop } = useNarrator();

  const isThisArticlePlaying = currentArticleId === article.id;
  const isCurrentlyActive = isThisArticlePlaying && (isPlaying || isPaused);

  const handlePlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCurrentlyActive) {
      stop();
    } else {
      play(`${article.title}. ${article.description}`, article.id);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      onClick={handleClick}
      className="group bg-[#111111] border border-[#5C4037]/15 hover:border-[#ff6a00]/50 overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(255,165,0,0.08)] relative"
    >
      {/* Personalized badge */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-[#ff6a00] text-[#0b0b0b]">
        <span className="material-symbols-outlined text-base">auto_awesome</span>
        <span className="font-mono text-sm font-black uppercase">Personalized</span>
      </div>

      {/* Image */}
      <div className="aspect-video overflow-hidden bg-[#111111] relative">
        <img
          src={imgError ? PLACEHOLDER_IMG : (article.imageUrl || article.image || PLACEHOLDER_IMG)}
          alt={article.title}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
        />
        <span className="absolute top-3 left-3 px-3 py-1.5 bg-[#0b0b0b]/90 text-[#ff6a00] font-mono text-sm font-black uppercase tracking-[0.2em] border border-[#ff6a00]/30">
          {article.category || "BUSINESS"}
        </span>
      </div>

      {/* Content */}
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4 font-mono text-sm uppercase tracking-widest">
          <span className="text-[#ff6a00] font-black">{article.source || "UNKNOWN"}</span>
          <span className="opacity-20">/</span>
          <span className="text-[#ffffff] opacity-30">{article.publishedAt || ""}</span>
        </div>

        <h3 className="font-['Newsreader'] text-xl md:text-2xl font-extrabold text-[#ffffff] leading-tight tracking-tighter uppercase mb-3 line-clamp-2 group-hover:text-[#ff6a00] transition-colors duration-200">
          {article.title}
        </h3>

        <p className="font-['Space_Grotesk'] text-base md:text-lg text-[#ffffff] opacity-50 line-clamp-2 leading-relaxed tracking-wide mb-6">
          {article.description || "No description available."}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#5C4037]/10">
          <button
            onClick={handlePlayClick}
            className={`flex items-center gap-2 font-mono text-sm font-black uppercase tracking-widest transition-all duration-100 ${
              isCurrentlyActive ? 'text-[#ff6a00]' : 'text-[#ffffff] opacity-30 group-hover:opacity-100 group-hover:text-[#ff6a00]'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {isCurrentlyActive ? 'stop_circle' : 'play_circle'}
            </span>
            <span>{isCurrentlyActive ? 'Stop' : 'Listen'}</span>
          </button>
          
          <div className="flex items-center gap-2 font-mono text-sm font-black text-[#ff6a00] opacity-30 group-hover:opacity-100 uppercase tracking-widest transition-all duration-150">
            <span>Read More</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function MyFeedPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const observerTarget = useRef(null);

  useEffect(() => {
    setPage(1);
    setHasMore(true);

    const loadMyNews = async (showLoading = true) => {
      if (showLoading) setLoading(true);
      else setIsRefreshing(true);
      
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (!isLoggedIn) {
        setLoading(false);
        setIsRefreshing(false);
        return;
      }
      
      try {
        const { fetchNews } = await import("../services/api");
        const data = await fetchNews('all', '', 'en', true, 1);
        setArticles(Array.isArray(data) ? data : []);
        setLastUpdated(new Date());

        // Auto-retry if empty
        if (data.length === 0 && !showLoading) {
           console.warn("My Feed empty. Retrying sync...");
           const retryData = await fetchNews('all', '', 'en', true, 1);
           if (retryData.length > 0) {
             setArticles(retryData);
             if (retryData.length < 10) setHasMore(false);
           } else {
             setHasMore(false);
           }
        } else if (data.length < 10) {
           setHasMore(false);
        }
      } catch (err) {
        setArticles([]);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };

    loadMyNews();

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      loadMyNews(false);
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  // Infinite Scroll Load More
  useEffect(() => {
    if (page > 1) {
      const loadMoreNews = async () => {
        setLoadingMore(true);
        try {
          const { fetchNews } = await import("../services/api");
          const data = await fetchNews('all', '', 'en', true, page);
          if (data.length === 0) {
            setHasMore(false);
          } else {
            setArticles(prev => {
              const prevIds = new Set(prev.map(a => a.id));
              const newItems = data.filter(a => !prevIds.has(a.id));
              return [...prev, ...newItems];
            });
            if (data.length < 10) setHasMore(false);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingMore(false);
        }
      };
      loadMoreNews();
    }
  }, [page]);

  // Intersection Observer setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.5 }
    );
    
    const target = observerTarget.current;
    if (target) observer.observe(target);
    
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore, loading, loadingMore]);

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-[#ffffff]">
      <Navbar />

      {/* Header */}
      <div className="border-b border-[#5C4037]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2.5 h-2.5 bg-[#ff6a00] animate-pulse rounded-full" />
              <p className="font-mono text-sm sm:text-base text-[#ff6a00] uppercase tracking-[0.3em] flex items-center gap-3 font-black">
                <span>My Personalized Feed</span>
                <span className="opacity-40">•</span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#ff6a00] rounded-full animate-pulse" />
                  <span className="text-[#ff6a00]">LIVE</span>
                </span>
                <span className="opacity-40">•</span>
                <span className="text-[#ffffff] opacity-40">Sync: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </p>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="font-['Newsreader'] text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-none mb-4">
                  My Feed
                </h1>
                {user.profession && (
                  <span className="inline-block px-4 py-2 mt-4 bg-[#ff6a00]/10 border border-[#ff6a00]/20 text-[#ff6a00] font-mono text-sm sm:text-base font-black uppercase tracking-widest">
                    Based on your profession: {user.profession}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                {!loading && articles.length > 0 && (
                  <span className="font-mono text-sm sm:text-base text-[#ffffff] opacity-30 uppercase tracking-widest hidden md:inline-block">
                    {articles.length} relevant articles found
                  </span>
                )}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    const loadMyNews = async (showLoading = true) => {
                      if (showLoading) setLoading(true);
                      else setIsRefreshing(true);
                      setPage(1);
                      setHasMore(true);
                      try {
                        const { fetchNews } = await import("../services/api");
                        const data = await fetchNews('all', '', 'en', true, 1);
                        setArticles(Array.isArray(data) ? data : []);
                        setLastUpdated(new Date());
                        if (data.length < 10) setHasMore(false);
                      } catch (err) { setArticles([]); }
                      finally { setLoading(false); setIsRefreshing(false); }
                    };
                    loadMyNews(false);
                  }}
                  disabled={isRefreshing || loading}
                  className="flex items-center gap-2 px-6 py-4 border border-[#5C4037]/30 text-[#ffffff] font-mono text-sm sm:text-base font-black uppercase tracking-widest hover:border-[#ff6a00] hover:text-[#ff6a00] disabled:opacity-50 transition-all duration-150"
                >
                  <span className={`material-symbols-outlined text-base ${isRefreshing ? 'animate-spin' : ''}`}>sync</span>
                  <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
                </button>
                <button
                  onClick={() => navigate("/news")}
                  className="flex items-center gap-2 px-6 py-4 border border-[#5C4037]/30 text-[#ffffff] font-mono text-sm sm:text-base font-black uppercase tracking-widest hover:border-[#ff6a00] hover:text-[#ff6a00] transition-all duration-150"
                >
                  <span className="material-symbols-outlined text-base">grid_view</span>
                  All News
                </button>
              </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Not logged in */}
        {!isLoggedIn ? (
          <div className="text-center py-32 border border-[#5C4037]/20 bg-[#111111]">
            <span className="material-symbols-outlined text-6xl text-[#ff6a00] opacity-30 mb-6 block">lock</span>
            <p className="font-mono text-sm sm:text-base text-[#ff6a00] font-black uppercase tracking-widest mb-4">Login Required</p>
            <p className="font-['Space_Grotesk'] text-lg md:text-xl text-[#ffffff] opacity-60 max-w-lg mx-auto mb-10 leading-relaxed">Please log in to view your personalized news stream engineered precisely for your active profession.</p>
            <button
              onClick={() => navigate("/login")}
              className="px-10 py-5 bg-[#ff6a00] text-[#0b0b0b] font-mono font-black text-sm sm:text-base uppercase tracking-[0.2em] hover:bg-[#FFE600] transition-colors inline-flex items-center gap-3"
            >
              Sign In to Intel Stream
            </button>
          </div>
        ) : loading ? (
          /* Skeleton loading */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#111111] border border-[#5C4037]/15 overflow-hidden animate-pulse">
                <div className="aspect-video bg-[#111111]" />
                <div className="p-6 space-y-3">
                  <div className="h-2 w-16 bg-[#111111] rounded" />
                  <div className="h-5 w-full bg-[#111111] rounded" />
                  <div className="h-5 w-4/5 bg-[#111111] rounded" />
                  <div className="h-3 w-full bg-[#111111] rounded mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32 bg-[#111111] border border-[#5C4037]/15 flex flex-col items-center gap-6"
          >
            <div className="w-16 h-16 border-2 border-[#ff6a00]/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-[#ff6a00] animate-spin">sync</span>
            </div>
            <div className="space-y-4">
              <p className="font-mono text-sm sm:text-base text-[#ff6a00] font-black uppercase tracking-[0.3em]">Personalized Link Scaling</p>
              <p className="font-['Space_Grotesk'] text-base md:text-lg text-[#ffffff] opacity-40 max-w-lg mx-auto leading-relaxed">
                No articles matched your profile exactly. We are broadening your discovery feed now.
              </p>
            </div>
          </motion.div>
        ) : (
          /* Article grid */
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {articles.map((article, i) => (
                <PersonalizedCard
                  key={article.id}
                  article={article}
                  index={i}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Intersection Observer Target */}
        {articles.length > 0 && hasMore && (
           <div ref={observerTarget} className="w-full py-16 flex justify-center mt-12">
             <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-xl text-[#ff6a00] animate-spin">sync</span>
                <span className="font-mono text-sm sm:text-base text-[#ff6a00] font-black uppercase tracking-[0.2em] animate-pulse">
                  Aggregating More Intelligence...
                </span>
             </div>
           </div>
        )}
        
        {articles.length > 0 && !hasMore && (
           <div className="w-full py-20 text-center mt-12 border-t border-[#5C4037]/20">
             <span className="font-mono text-sm sm:text-base text-[#ffffff] opacity-30 font-black uppercase tracking-[0.2em]">
               End of Personalized Feed
             </span>
           </div>
        )}
      </main>
    </div>
  );
}
