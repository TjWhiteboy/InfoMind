import React from 'react';

export default function SentimentBadge({ sentiment }) {
  const config = {
    positive: { color: 'bg-[#FFE600] text-[#0b0b0b]', label: 'BULLISH_', icon: 'trending_up' },
    negative: { color: 'bg-[#ff6a00] text-[#0b0b0b]', label: 'BEARISH_', icon: 'trending_down' },
    neutral: { color: 'bg-[#111111] text-[#ffffff] border border-[#5C4037]/30', label: 'NEUTRAL_', icon: 'horizontal_rule' }
  };

  const { color, label, icon } = config[sentiment] || config.neutral;

  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 font-mono text-sm font-black uppercase tracking-[0.2em] ${color}`}>
      <span className="material-symbols-outlined text-sm">{icon}</span>
      {label}
    </span>
  );
}
