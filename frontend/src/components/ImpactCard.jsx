import React, { useState } from 'react';
import { fetchImpact } from '../services/api';
import { useAppContext } from '../context/AppContext';

export default function ImpactCard({ content }) {
  const { language } = useAppContext();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const profession = user.profession || 'PROFESSIONAL';
  
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetchImpact(content, profession, language);
      setImpact(res.impact);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const professionName = profession.toUpperCase();

  const labels = {
    en: { title: `CRITICAL_IMPACT_RATING — FOR: ${professionName}`, button: '[ ANALYZE_IMPACT ]' },
    ta: { title: `முக்கிய_தாக்கம் — ${professionName}`, button: '[ தாக்கத்தை_ஆய்வு_செய் ]' }
  };

  const t = labels[language] || labels.en;

  return (
    <div className="bg-[#111111] p-6 transition-all duration-100 ease-linear relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ff6a00] text-xl">priority_high</span>
          <h3 className="font-mono text-sm font-black tracking-widest text-[#ffffff] uppercase">
            {t.title}
          </h3>
        </div>
        {!impact && !loading && (
          <button
            onClick={handleGenerate}
            className="px-4 py-2 bg-[#ff6a00] text-[#0b0b0b] text-sm font-mono font-black uppercase transition-all duration-0 hover:bg-[#0b0b0b] hover:text-[#ff6a00]"
          >
            {t.button}
          </button>
        )}
      </div>

      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-[#111111] w-full" />
          <div className="h-4 bg-[#111111] w-3/4" />
          <div className="h-4 bg-[#111111] w-1/2" />
        </div>
      )}

      {impact && (
        <div className="relative">
          <p className="font-['Newsreader'] text-2xl italic font-extrabold text-[#ffffff] leading-tight tracking-tighter">
            "{impact}"
          </p>
        </div>
      )}
    </div>
  );
}
