import React from 'react';

export default function CategoryFilter({ activeCategory, onCategoryChange }) {
  const categories = ['All', 'Trending', 'Markets', 'Startups', 'Economy', 'Tech', 'Policy', 'Business'];

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-4">
      <div className="flex gap-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-6 py-3 font-mono text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap border ${
              activeCategory.toLowerCase() === category.toLowerCase()
                ? 'bg-[#ff6a00] text-[#0b0b0b] border-[#ff6a00] shadow-[0_0_15px_rgba(255,77,0,0.4)]'
                : 'bg-[#111111] text-[#ffffff] opacity-40 hover:opacity-100 border-[#5C4037]/15 hover:border-[#ff6a00]/50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
