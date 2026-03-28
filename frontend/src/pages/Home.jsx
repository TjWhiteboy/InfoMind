import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { fetchNews } from '../services/api';
import Navbar from '../components/Navbar';
import CategoryFilter from '../components/CategoryFilter';
import NewsCard from '../components/NewsCard';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { language, selectedArticles, toggleArticleSelection } = useAppContext();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeCategory, setActiveCategory] = useState('All');
  const [isNavigatorMode, setIsNavigatorMode] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const profession = user.profession || '';
  const navigate = useNavigate();
  const observerTarget = useRef(null);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    
    const loadNews = async (showLoading = true) => {
      if (showLoading) setLoading(true);
      else setIsRefreshing(true);
      
      try {
        const data = await fetchNews(activeCategory, profession, language, false, 1);
        setNews(data);
        setLastUpdated(new Date());

        // Auto-retry once if data is empty and not refreshing
        if (data.length === 0 && !showLoading) {
          console.warn("Feed empty. Retrying synchronization...");
          const retryData = await fetchNews(activeCategory, profession, language, false, 1);
          if (retryData.length > 0) setNews(retryData);
        } else if (data.length < 10) {
          setHasMore(false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };
    loadNews();

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      loadNews(false);
    }, 300000);

    return () => clearInterval(interval);
  }, [activeCategory, profession, language]);

  // Infinite Scroll Load More
  useEffect(() => {
    if (page > 1) {
      const loadMoreNews = async () => {
        setLoadingMore(true);
        try {
          const data = await fetchNews(activeCategory, profession, language, false, page);
          if (data.length === 0) {
            setHasMore(false);
          } else {
            setNews(prev => {
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
  }, [page]); // Intentionally omitting category, profession, language so it only fires on page change

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    const profName = profession ? profession.toUpperCase() : 'USER';
    
    if (language === 'ta') {
      if (hour < 12) return `காலை வணக்கம், ${profName}!`;
      if (hour < 18) return `மதிய வணக்கம், ${profName}!`;
      return `மாலை வணக்கம், ${profName}!`;
    }

    if (hour < 12) return `Good Morning, ${profName}`;
    if (hour < 18) return `Good Afternoon, ${profName}`;
    return `Good Evening, ${profName}`;
  };

  const labels = {
    en: { subtext: "Here is your personalized news briefing", select: "Select Articles", exit: "Exit Selection", build: "Build Briefing" },
    ta: { subtext: "உங்கள் தனிப்பயனாக்கப்பட்ட வணிகச் சுருக்கம் இதோ", select: "செய்திகளைத் தேர்ந்தெடுக்கவும்", exit: "வெளியேறு", build: "சுருக்கம் உருவாக்கு" }
  };

  const t = labels[language] || labels.en;

  const ProfessionIcon = () => {
    switch (profession?.toLowerCase()) {
      case 'engineer': return <span className="material-symbols-outlined text-sm">engineering</span>;
      case 'entrepreneur': return <span className="material-symbols-outlined text-sm">rocket_launch</span>;
      case 'student': return <span className="material-symbols-outlined text-sm">school</span>;
      case 'trader': return <span className="material-symbols-outlined text-sm">payments</span>;
      case 'businessman': return <span className="material-symbols-outlined text-sm">business_center</span>;
      case 'sports': return <span className="material-symbols-outlined text-sm">sports_soccer</span>;
      default: return <span className="material-symbols-outlined text-sm">person</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-[#ffffff] selection:bg-[#ff6a00] selection:text-[#0b0b0b]">
      <style>{`
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
          will-change: transform;
        }
      `}</style>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#ff6a00] text-[#0b0b0b] font-mono text-sm sm:text-base font-black uppercase tracking-[0.2em]">
              <ProfessionIcon />
              <span>{profession || 'GUEST'}</span>
            </div>
            <div className="w-2 h-2 bg-[#ff6a00] animate-pulse" />
          </div>
          <h1 className="font-['Newsreader'] text-6xl md:text-8xl font-extrabold text-[#ffffff] mb-4 leading-[0.85] tracking-tighter uppercase">
            {getGreeting()}
          </h1>
          <p className="font-mono text-sm sm:text-base opacity-40 uppercase tracking-[0.15em] mt-6 flex items-center gap-3">
            <span>{t.subtext}</span>
            <span className="opacity-40">•</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#ff6a00] rounded-full animate-pulse" />
              <span className="text-[#ff6a00] font-black">LIVE SYNC ACTIVE</span>
            </span>
            <span className="opacity-40">•</span>
            <span>Last Synchronized: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </p>
        </div>

        {/* Marquee Section */}
        <div className="w-full border-y border-[#5C4037]/20 bg-[#111111] py-4 mb-16 overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-8 mx-4">
                <span className="font-mono text-sm font-black text-[#ff6a00] uppercase tracking-[0.2em]">
                  Latest Intelligence
                </span>
                <div className="w-1 h-1 bg-[#5C4037]/40 rounded-full" />
                <span className="font-mono text-sm font-black text-[#ffffff] opacity-40 uppercase tracking-[0.2em]">
                  Real-time Synthesis
                </span>
                <div className="w-1 h-1 bg-[#5C4037]/40 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
          <CategoryFilter 
            activeCategory={activeCategory} 
            onCategoryChange={setActiveCategory} 
          />
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const loadNews = async (showLoading = true) => {
                  if (showLoading) setLoading(true);
                  else setIsRefreshing(true);
                  setPage(1);
                  setHasMore(true);
                  try {
                    const data = await fetchNews(activeCategory, profession, language, false, 1);
                    setNews(data);
                    setLastUpdated(new Date());
                    if (data.length < 10) setHasMore(false);
                  } catch (err) { console.error(err); }
                  finally { setLoading(false); setIsRefreshing(false); }
                };
                loadNews(false);
              }}
              disabled={isRefreshing}
              className="flex items-center gap-3 px-6 py-4 bg-[#111111] text-[#ffffff] border border-[#5C4037]/20 font-mono font-black text-sm sm:text-base uppercase tracking-[0.2em] hover:border-[#ff6a00] hover:text-[#ff6a00] disabled:opacity-50 transition-all duration-0"
            >
              <span className={`material-symbols-outlined text-base sm:text-lg ${isRefreshing ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>{isRefreshing ? 'Syncing...' : 'Refresh News'}</span>
            </button>

            <button
              onClick={() => setIsNavigatorMode(!isNavigatorMode)}
              className={`flex items-center gap-3 px-8 py-4 font-mono font-black text-sm sm:text-base uppercase tracking-[0.2em] transition-all duration-0 ${
                isNavigatorMode 
                  ? 'bg-[#ff6a00] text-[#0b0b0b]' 
                  : 'bg-[#111111] text-[#ffffff] border border-[#5C4037]/20 hover:bg-[#ff6a00] hover:text-[#0b0b0b]'
              }`}
            >
              <span className="material-symbols-outlined text-base sm:text-lg">{isNavigatorMode ? 'close' : 'checklist'}</span>
              <span>{isNavigatorMode ? t.exit : t.select}</span>
            </button>
          </div>
        </div>

        {/* News Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-[#111111] border border-[#5C4037]/15 p-1">
                  <div className="aspect-video bg-[#111111] mb-6 animate-pulse" />
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-[#111111] w-3/4 animate-pulse" />
                    <div className="h-4 bg-[#111111] w-full animate-pulse" />
                    <div className="h-4 bg-[#111111] w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : news.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-32 bg-[#111111] border border-[#5C4037]/15 flex flex-col items-center gap-6"
            >
              <div className="w-12 h-12 border border-[#ff6a00]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#ff6a00] text-2xl animate-spin">sync</span>
              </div>
              <div className="space-y-4">
                <p className="font-mono text-sm sm:text-base text-[#ff6a00] font-black uppercase tracking-[0.3em]">Neural Link Status: Synchronizing</p>
                <p className="font-['Space_Grotesk'] text-base md:text-lg text-[#ffffff] opacity-40 max-w-md mx-auto leading-relaxed">
                  Fetching latest intelligence from global nodes. Your feed will update shortly.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
            >
              {news.map((article) => (
                <NewsCard 
                  key={article.id} 
                  article={article} 
                  isSelectable={isNavigatorMode}
                  isSelected={selectedArticles.includes(article.id)}
                  onToggleSelect={toggleArticleSelection}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Intersection Observer Target */}
        {news.length > 0 && hasMore && (
           <div ref={observerTarget} className="w-full py-12 flex justify-center mt-8">
             <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#ff6a00] text-xl animate-spin">sync</span>
                <span className="font-mono text-sm sm:text-base text-[#ff6a00] font-black uppercase tracking-[0.2em] animate-pulse">
                  Fetching More Data...
                </span>
             </div>
           </div>
        )}
        
        {news.length > 0 && !hasMore && (
           <div className="w-full py-16 text-center mt-8 border-t border-[#5C4037]/20">
             <span className="font-mono text-sm sm:text-base text-[#ffffff] opacity-30 font-black uppercase tracking-[0.2em]">
               End of Intelligence Feed
             </span>
           </div>
        )}
      </main>

      {/* Floating Action Button for Navigator */}
      {isNavigatorMode && selectedArticles.length >= 2 && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50"
        >
          <button
            onClick={() => navigate('/navigator')}
            className="flex items-center gap-4 px-10 py-5 bg-[#ff6a00] text-[#0b0b0b] font-mono font-black text-sm sm:text-base uppercase tracking-[0.2em] shadow-[0_0_50px_rgba(255,77,0,0.3)] hover:bg-[#0b0b0b] hover:text-[#ff6a00] transition-all duration-0"
          >
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            <span>{t.build} ({selectedArticles.length} selected)</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
