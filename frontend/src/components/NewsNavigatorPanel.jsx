import React from 'react';

export default function NewsNavigatorPanel({ selectedArticles, articles, onRemove }) {
  const selectedData = articles.filter(a => selectedArticles.includes(a.id));

  if (selectedData.length === 0) return null;

  return (
    <div className="bg-[#111111] border border-[#5C4037]/15 p-6">
      <h3 className="font-mono text-sm sm:text-base font-black text-[#ff6a00] uppercase tracking-[0.2em] mb-6">
        SELECTED_FOR_SYNTHESIS ({selectedData.length})
      </h3>
      <div className="flex flex-wrap gap-4">
        {selectedData.map((article) => (
          <div 
            key={article.id}
            className="flex items-center gap-4 bg-[#111111] px-6 py-4 border border-[#5C4037]/20 group"
          >
            <span className="font-mono text-sm sm:text-base text-[#ffffff] opacity-60 truncate max-w-[200px] uppercase tracking-widest">
              {article.title}
            </span>
            <button 
              onClick={() => onRemove(article.id)}
              className="flex items-center justify-center p-2 hover:bg-[#ff6a00] hover:text-[#0b0b0b] transition-all duration-100"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
