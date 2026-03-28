import React, { useState } from 'react';
import { fetchSummary } from '../services/api';
import { useAppContext } from '../context/AppContext';

export default function AISummaryCard({ content }) {
  const { language } = useAppContext();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetchSummary(content, language);
      setSummary(res.bullets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const labels = {
    en: { title: 'AI_CORE_SUMMARY', button: '[ GENERATE_SUMMARY ]' },
    ta: { title: 'AI_CORE_சுருக்கம்', button: '[ சுருக்கம்_உருவாக்கு ]' }
  };

  const t = labels[language] || labels.en;

  return (
    <div className="bg-[#111111] p-6 transition-all duration-100 ease-linear relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#FFE600] text-xl">auto_awesome</span>
          <h3 className="font-mono text-sm font-black tracking-widest text-[#ffffff] uppercase">
            {t.title}
          </h3>
        </div>
        {!summary && !loading && (
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
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 bg-[#111111] w-full" />
          ))}
        </div>
      )}

      {summary && (
        <ul className="space-y-6">
          {summary.map((bullet, i) => (
            <li key={i} className="flex items-start gap-4">
              <span className="font-mono text-sm font-black text-[#ff6a00] flex-shrink-0">
                {(i + 1).toString().padStart(2, '0')}_
              </span>
              <p className="font-mono text-sm text-[#FFE600] leading-relaxed">
                {bullet}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
