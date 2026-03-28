import React, { useState } from 'react';
import { fetchWatchNext } from '../services/api';
import { useAppContext } from '../context/AppContext';

export default function WatchNextCard({ content }) {
  const { language } = useAppContext();
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetchWatchNext(content);
      setPredictions(res.predictions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const labels = {
    en: { title: 'WHATS_NEXT_PREDICTIONS', button: '[ RUN_PREDICTIONS ]' },
    ta: { title: 'அடுத்து_என்ன_கணிப்புகள்', button: '[ கணிப்புகளை_இயக்கு ]' }
  };

  const t = labels[language] || labels.en;

  return (
    <div className="bg-[#111111] p-6 transition-all duration-100 ease-linear relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ff6a00] text-xl">trending_up</span>
          <h3 className="font-mono text-sm font-black tracking-widest text-[#ff6a00] uppercase">
            {t.title}
          </h3>
        </div>
        {!predictions && !loading && (
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
          <div className="h-3 bg-[#111111] w-full" />
          <div className="h-3 bg-[#111111] w-5/6" />
          <div className="h-3 bg-[#111111] w-4/6" />
        </div>
      )}

      {predictions && (
        <ul className="space-y-4">
          {predictions.map((pred, i) => (
            <li key={i} className={`flex items-center gap-3 ${i === 0 ? 'animate-pulse' : ''}`}>
              <div className="w-2 h-2 bg-[#FFE600] flex-shrink-0" />
              <p className="font-mono text-sm text-[#FFE600] uppercase tracking-tight">
                {pred}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
