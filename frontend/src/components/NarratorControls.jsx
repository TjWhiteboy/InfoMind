import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNarrator } from '../context/NarratorContext';

export default function NarratorControls() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { isPlaying, isPaused, stop, pause, resume, rate, toggleRate } = useNarrator();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = isPlaying || isPaused;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${
          isActive 
            ? 'border-[#ff6a00] text-[#ff6a00] bg-[#ff6a00]/10' 
            : 'border-[#5C4037]/30 text-[#ffffff] hover:border-[#ff6a00]'
        }`}
        title="Narrator Controls"
      >
        <span className="material-symbols-outlined text-lg">mic</span>
        {isPlaying && !isPaused && (
           <span className="absolute -top-1 -right-1 flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff6a00] opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ff6a00]"></span>
           </span>
        )}
      </button>

      {/* Control Panel Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-14 w-64 bg-[#111111] border border-[#5C4037]/40 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[200] overflow-hidden"
          >
            <div className="p-4 border-b border-[#5C4037]/20 bg-[#0b0b0b]/50">
              <h4 className="font-mono text-sm text-[#ff6a00] font-black uppercase tracking-widest mb-1">
                AI Narrator
              </h4>
              <p className="font-['Space_Grotesk'] text-sm text-[#ffffff] opacity-60 leading-tight">
                {isActive ? (isPaused ? 'Paused' : 'Currently active') : 'Select an article to play'}
              </p>
            </div>

            <div className="p-4 flex flex-col gap-4">
              {/* Controls */}
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={isActive ? stop : null}
                  disabled={!isActive}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isActive ? 'bg-[#111111] text-[#ffffff] hover:text-[#ff6a00]' : 'opacity-30 cursor-not-allowed text-[#ffffff]'
                  }`}
                  title="Stop"
                >
                  <span className="material-symbols-outlined">stop</span>
                </button>

                <button
                  onClick={isPlaying ? (isPaused ? resume : pause) : null}
                  disabled={!isActive}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-105 ${
                    isActive ? 'bg-[#ff6a00] text-[#0b0b0b]' : 'bg-[#ff6a00]/20 text-[#0b0b0b]/50 cursor-not-allowed'
                  }`}
                  title={isPaused ? "Resume" : "Pause"}
                >
                  <span className="material-symbols-outlined text-3xl">
                    {isPaused ? 'play_arrow' : (isPlaying ? 'pause' : 'play_arrow')}
                  </span>
                </button>

                <button
                  onClick={toggleRate}
                  className="w-10 h-10 rounded-full bg-[#111111] text-[#ffffff] hover:text-[#ff6a00] flex items-center justify-center transition-colors font-mono text-sm font-black"
                  title={`Speed: ${rate}x`}
                >
                  {rate}x
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
