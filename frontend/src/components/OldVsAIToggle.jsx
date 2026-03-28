import React from 'react';
import { motion } from 'motion/react';

export default function OldVsAIToggle({ mode, onChange }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[#ff6a00] text-sm">compare_arrows</span>
        <span className="font-mono text-sm sm:text-base font-bold text-[#ffffff] opacity-40 uppercase tracking-[0.2em]">
          SELECT_VIEW_MODE
        </span>
      </div>
      
      <div className="relative flex bg-[#111111] border border-[#5C4037]/15 p-1 w-64">
        <motion.div
          className="absolute inset-y-1 bg-[#ff6a00]"
          initial={false}
          animate={{
            left: mode === 'old' ? '4px' : 'calc(50% + 2px)',
            width: 'calc(50% - 6px)'
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        />
        
        <button
          onClick={() => onChange('old')}
          className={`relative flex-1 flex items-center justify-center py-2 px-4 gap-2 font-mono text-sm sm:text-base font-black uppercase tracking-widest transition-all duration-100 z-10 ${
            mode === 'old' ? 'text-[#0b0b0b]' : 'text-[#ffffff] opacity-40 hover:opacity-100'
          }`}
        >
          <span>OLD_WAY</span>
        </button>
        
        <button
          onClick={() => onChange('ai')}
          className={`relative flex-1 flex items-center justify-center py-2 px-4 gap-2 font-mono text-sm sm:text-base font-black uppercase tracking-widest transition-all duration-100 z-10 ${
            mode === 'ai' ? 'text-[#0b0b0b]' : 'text-[#ffffff] opacity-40 hover:opacity-100'
          }`}
        >
          <span>AI_WAY</span>
        </button>
      </div>
    </div>
  );
}
