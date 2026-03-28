import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { fetchNavigator, fetchNews } from '../services/api';
import Navbar from '../components/Navbar';
import NewsNavigatorPanel from '../components/NewsNavigatorPanel';

export default function NavigatorPage() {
  const { selectedArticles, toggleArticleSelection, clearArticleSelection, language } = useAppContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState([]);
  const [briefing, setBriefing] = useState(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const data = await fetchNews();
        setNews(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadNews();
  }, []);

  const handleGenerate = async () => {
    if (selectedArticles.length < 2) return;
    setLoading(true);
    try {
      // Map IDs to full article objects for the AI
      const articlesToAnalyze = news.filter(a => selectedArticles.includes(a.id));
      const res = await fetchNavigator(articlesToAnalyze);
      setBriefing(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    setBriefing(null);
    clearArticleSelection();
    navigate('/news');
  };

  const labels = {
    en: { title: "News Navigator", subtext: "Synthesize multiple perspectives into a single intelligence briefing", ready: "Ready to Generate?", readySub: "Select at least 2 articles from the home feed to build your personalized intelligence briefing.", button: "Generate Briefing", analyzing: "Analyzing Connections...", analyzingSub: "Our AI is synthesizing your selected articles", summary: "Neural Summary", insights: "Key Insights", questions: "Questions to Explore", startOver: "Start Over", share: "Share Briefing" },
    ta: { title: "நேவிகேட்டர்", subtext: "பல கண்ணோட்டங்களை ஒரே சுருக்கமாக இணைக்கவும்", ready: "உருவாக்கத் தயாரா?", readySub: "உங்கள் தனிப்பயனாக்கப்பட்ட செய்தியை உருவாக்க முகப்புப் பக்கத்திலிருந்து குறைந்தது 2 செய்திகளைத் தேர்ந்தெடுக்கவும்.", button: "[ சுருக்கம் உருவாக்கு ]", analyzing: "பகுப்பாய்வு செய்கிறது...", analyzingSub: "எங்கள் AI உங்கள் செய்திகளை இணைக்கிறது", summary: "சுருக்கம்", insights: "முக்கிய நுண்ணறிவு", questions: "ஆராய வேண்டிய கேள்விகள்", startOver: "[ மீண்டும் தொடங்கவும் ]", share: "[ பகிரவும் ]" }
  };

  const t = labels[language] || labels.en;

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-[#ffffff]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={() => navigate('/news')}
            className="flex items-center gap-2 font-mono text-sm sm:text-base font-bold text-[#ffffff] opacity-40 hover:opacity-100 hover:text-[#ff6a00] transition-all duration-100 uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Back to Home</span>
          </button>
        </div>

        <div className="mb-16">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-[#ff6a00] animate-pulse" />
            <span className="font-mono text-sm sm:text-base font-black text-[#ff6a00] uppercase tracking-[0.2em]">
              Intelligence Synthesis
            </span>
          </div>
          <h1 className="font-['Newsreader'] text-6xl md:text-8xl font-extrabold text-[#ffffff] mb-6 leading-[0.85] tracking-tighter uppercase">
            {t.title}
          </h1>
          <p className="font-mono text-sm sm:text-base opacity-40 uppercase tracking-[0.15em] max-w-2xl leading-relaxed">
            {t.subtext}
          </p>
        </div>

        <div className="bg-[#111111] border border-[#5C4037]/15 p-1 mb-12">
          <NewsNavigatorPanel 
            selectedArticles={selectedArticles} 
            articles={news} 
            onRemove={toggleArticleSelection} 
          />
        </div>

        {!briefing && !loading && (
          <div className="flex flex-col items-center justify-center py-24 bg-[#111111] border border-[#5C4037]/15">
            <span className="material-symbols-outlined text-6xl text-[#ff6a00] mb-6 opacity-20">inventory_2</span>
            <h3 className="font-['Newsreader'] text-3xl font-extrabold text-[#ffffff] mb-4 uppercase tracking-tighter">{t.ready}</h3>
            <p className="font-mono text-sm sm:text-base text-[#ffffff] opacity-40 mb-10 max-w-md text-center uppercase tracking-widest leading-relaxed">
              {t.readySub}
            </p>
            <button
              onClick={handleGenerate}
              disabled={selectedArticles.length < 2}
              className="px-10 py-5 bg-[#ff6a00] text-[#0b0b0b] font-mono font-black text-sm sm:text-base uppercase tracking-[0.2em] transition-all duration-0 hover:bg-[#0b0b0b] hover:text-[#ff6a00] disabled:opacity-20 disabled:cursor-not-allowed flex items-center gap-3"
            >
              <span className="material-symbols-outlined text-base">auto_awesome</span>
              <span>{t.button}</span>
            </button>
          </div>
        )}

        {loading && (
          <div className="space-y-16 py-12">
            <div className="text-center">
              <div className="inline-block p-6 bg-[#111111] border border-[#ff6a00]/20 mb-6 animate-pulse">
                <span className="material-symbols-outlined text-4xl text-[#FFE600]">auto_awesome</span>
              </div>
              <h2 className="font-['Newsreader'] text-4xl font-extrabold text-[#ffffff] mb-4 uppercase tracking-tighter">{t.analyzing}</h2>
              <p className="font-mono text-sm sm:text-base text-[#ffffff] opacity-40 uppercase tracking-widest">{t.analyzingSub}</p>
            </div>
            <div className="bg-[#111111] p-10 border border-[#5C4037]/15 space-y-10">
              <div className="space-y-4">
                <div className="h-4 bg-[#111111] w-3/4 animate-pulse" />
                <div className="h-4 bg-[#111111] w-full animate-pulse" />
                <div className="h-4 bg-[#111111] w-5/6 animate-pulse" />
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-[#111111] w-1/2 animate-pulse" />
                <div className="h-4 bg-[#111111] w-full animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {briefing && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {/* Summary Section */}
            <section className="bg-[#111111] p-10 border border-[#5C4037]/15">
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-[#ff6a00] text-2xl">description</span>
                <h2 className="font-['Newsreader'] text-3xl font-extrabold text-[#ffffff] uppercase tracking-tighter">{t.summary}</h2>
              </div>
              <p className="font-['Space_Grotesk'] text-[#ffffff] text-lg leading-relaxed opacity-80">
                {briefing?.summary || "No summary available."}
              </p>
            </section>

            {/* Insights Section */}
            <section className="bg-[#111111] p-10 border border-[#5C4037]/15">
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-[#FFE600] text-2xl">lightbulb</span>
                <h2 className="font-['Newsreader'] text-3xl font-extrabold text-[#ffffff] uppercase tracking-tighter">{t.insights}</h2>
              </div>
              <div className="space-y-6">
                {briefing?.insights?.map((insight, i) => (
                  <div key={i} className="flex items-start gap-6 p-6 bg-[#111111] border-l-4 border-[#FFE600]">
                    <div className="font-mono text-sm font-black text-[#FFE600]">
                      0{i + 1}.
                    </div>
                    <p className="font-['Space_Grotesk'] text-[#FFE600] text-lg leading-relaxed">{insight}</p>
                  </div>
                )) || <p className="font-mono text-sm opacity-40 uppercase tracking-widest">No insights generated.</p>}
              </div>
            </section>

            {/* Questions Section */}
            <section className="bg-[#111111] p-10 border border-[#5C4037]/15">
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-[#ff6a00] text-2xl">help</span>
                <h2 className="font-['Newsreader'] text-3xl font-extrabold text-[#ffffff] uppercase tracking-tighter">{t.questions}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {briefing?.questions?.map((q, i) => (
                  <button 
                    key={i}
                    className="p-6 bg-[#111111] border border-[#5C4037]/20 text-[#ffffff] font-mono text-sm sm:text-base font-bold text-left uppercase tracking-widest hover:border-[#ff6a00] hover:text-[#ff6a00] transition-all duration-100"
                  >
                    {q}
                  </button>
                )) || <p className="font-mono text-sm opacity-40 uppercase tracking-widest col-span-2">No questions curated.</p>}
              </div>
            </section>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12">
              <button
                onClick={handleStartOver}
                className="w-full sm:w-auto px-10 py-5 bg-[#111111] border border-[#5C4037]/20 text-[#ffffff] font-mono font-black text-sm sm:text-base uppercase tracking-[0.2em] hover:bg-[#ff6a00] hover:text-[#0b0b0b] transition-all duration-0"
              >
                {t.startOver}
              </button>
              <button
                className="w-full sm:w-auto px-10 py-5 bg-[#ff6a00] text-[#0b0b0b] font-mono font-black text-sm sm:text-base uppercase tracking-[0.2em] hover:bg-[#0b0b0b] hover:text-[#ff6a00] transition-all duration-0 flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined text-base">share</span>
                <span>{t.share}</span>
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
