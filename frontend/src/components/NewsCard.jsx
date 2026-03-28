import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import SentimentBadge from './SentimentBadge';
import { useNarrator } from '../context/NarratorContext';

export default function NewsCard({ article, isSelectable, isSelected, onToggleSelect }) {
  const [isShared, setIsShared] = useState(false);
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

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/article/${article.id}`;
    const shareData = {
      title: article.title,
      text: article.description,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`group relative bg-[#111111] border transition-all duration-100 ${
        isSelected ? 'border-[#ff6a00] ring-1 ring-[#ff6a00]' : 'border-[#5C4037]/15 hover:border-[#ff6a00]/40'
      }`}
    >
      <div className="relative aspect-video overflow-hidden bg-[#111111]">
        <img 
          src={article.imageUrl} 
          alt={article.title}
          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300 grayscale group-hover:grayscale-0"
          referrerPolicy="no-referrer"
        />
        
        <div className="absolute top-0 left-0 p-4 flex flex-col gap-2">
          <span className="inline-block px-3 py-1 bg-[#0b0b0b] text-[#ffffff] text-sm font-black uppercase tracking-[0.2em] border border-[#5C4037]/30">
            {article.category}
          </span>
          <SentimentBadge sentiment={article.sentiment} />
        </div>

        {isSelectable && (
          <div 
            onClick={(e) => {
              e.preventDefault();
              onToggleSelect(article.id);
            }}
            className={`absolute inset-0 flex items-center justify-center transition-all duration-100 cursor-pointer ${
              isSelected ? 'bg-[#ff6a00]/20' : 'bg-black/0 hover:bg-[#ff6a00]/10'
            }`}
          >
            <div className={`w-12 h-12 flex items-center justify-center transition-all duration-100 ${
              isSelected ? 'bg-[#ff6a00] text-[#0b0b0b]' : 'bg-[#0b0b0b] text-[#ffffff] opacity-0 group-hover:opacity-100 border border-[#ff6a00]'
            }`}>
              <span className="material-symbols-outlined text-2xl">
                {isSelected ? 'check_circle' : 'add_circle'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-8">
        <div className="flex items-center gap-3 font-mono text-sm font-bold text-[#ffffff] opacity-40 mb-4 uppercase tracking-widest">
          <span className="text-[#ff6a00] font-black">{article.source}</span>
          <span>/</span>
          <span>{article.publishedAt}</span>
        </div>
        
        <Link to="/news-details" state={{ article }}>
          <h3 className="font-['Newsreader'] text-xl md:text-2xl font-extrabold text-[#ffffff] mb-4 line-clamp-2 group-hover:text-[#ff6a00] transition-colors uppercase tracking-tighter leading-tight">
            {article.title}
          </h3>
        </Link>
        
        <p className="font-['Space_Grotesk'] text-[15px] sm:text-base text-[#B0B0B0] opacity-90 mb-8 line-clamp-3 leading-relaxed tracking-wide">
          {article.description}
        </p>

        <div className="flex items-center justify-between pt-6 border-t border-[#5C4037]/10">
          <div className="flex items-center gap-5">
            <button
              onClick={handlePlayClick}
              className={`flex items-center gap-2 font-mono text-sm sm:text-base font-black uppercase tracking-widest transition-all duration-100 ${
                isCurrentlyActive ? 'text-[#ff6a00]' : 'text-[#ffffff] opacity-40 hover:opacity-100 hover:text-[#ff6a00]'
              }`}
              title={isCurrentlyActive ? 'Stop Audio' : 'Listen to Summary'}
            >
              <span className="material-symbols-outlined text-base">
                {isCurrentlyActive ? 'stop_circle' : 'play_circle'}
              </span>
              <span>{isCurrentlyActive ? 'Stop' : 'Listen'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 font-mono text-sm sm:text-base font-black text-[#ffffff] opacity-40 hover:opacity-100 hover:text-[#ff6a00] transition-all duration-100 uppercase tracking-widest"
            >
            <AnimatePresence mode="wait">
              {isShared ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="flex items-center gap-2 text-[#FFE600]"
                >
                  <span className="material-symbols-outlined text-sm">check</span>
                  <span>Copied</span>
                </motion.div>
              ) : (
                <motion.div
                  key="share"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">share</span>
                  <span>Share</span>
                </motion.div>
              )}
            </AnimatePresence>
            </button>
          </div>

          <Link 
            to="/news-details" 
            state={{ article }}
            className="flex items-center gap-2 font-mono text-sm sm:text-base font-black text-[#ff6a00] uppercase tracking-widest group/read"
          >
            <span>Read Full Report</span>
            <span className="material-symbols-outlined text-base transition-transform group-hover/read:translate-x-1">arrow_forward</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
