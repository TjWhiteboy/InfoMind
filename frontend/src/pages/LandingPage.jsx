import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({ readers: 0, personas: 0, features: 0, languages: 0 });
  const statsRef = useRef(null);
  const observerRef = useRef(null);

  // Scroll listener for Navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for fade-ins and stats
  useEffect(() => {
    const options = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal');
          if (entry.target.id === 'stats-bar') {
            startCountUp();
          }
        }
      });
    }, options);

    const targets = document.querySelectorAll('.animate-on-scroll');
    targets.forEach(t => observer.observe(t));
    observerRef.current = observer;

    return () => observer.disconnect();
  }, []);

  const startCountUp = () => {
    const duration = 2000;
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easeOutQuad = (t) => t * (2 - t);
      const currentProgress = easeOutQuad(progress);

      setStats({
        readers: Math.floor(currentProgress * 10000),
        personas: Math.floor(currentProgress * 4),
        features: Math.floor(currentProgress * 8),
        languages: Math.floor(currentProgress * 2)
      });

      if (frame === totalFrames) clearInterval(timer);
    }, frameRate);
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="bg-[#0b0b0b] text-[#ffffff] font-['Space_Grotesk'] selection:bg-[#ff6a00] selection:text-[#0b0b0b] overflow-x-hidden relative">
      <div className="scanline fixed inset-0 pointer-events-none z-[100]" />
      <style>{`
        @keyframes scanline {
          0% { transform: translate3d(0, -100%, 0); }
          100% { transform: translate3d(0, 100%, 0); }
        }
        .scanline {
          width: 100%;
          height: 100px;
          background: linear-gradient(to bottom, transparent, rgba(255, 77, 0, 0.05), transparent);
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
          animation: scanline 8s linear infinite;
          z-index: 50;
          will-change: transform;
        }
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, opacity;
        }
        .animate-on-scroll.reveal {
          opacity: 1;
          transform: translateY(0);
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-container {
          overflow: hidden;
          white-space: nowrap;
          background: #ff6a00;
          padding: 20px 0;
          border-y: 2px solid #0b0b0b;
        }
        .marquee-content {
          display: inline-block;
          animation: marquee 30s linear infinite;
          font-family: 'Newsreader', serif;
          font-weight: 900;
          font-size: 4rem;
          text-transform: uppercase;
          color: #0b0b0b;
          letter-spacing: -0.05em;
        }
        .brutalist-border {
          border: 1px solid rgba(92, 64, 55, 0.15);
        }
        .brutalist-border-strong {
          border: 2px solid #ff6a00;
        }
        .text-outline {
          -webkit-text-stroke: 1px rgba(245, 245, 245, 0.3);
          color: transparent;
        }
      `}</style>

      {/* Section 1: Navbar */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'py-4 bg-[#0b0b0b]/95 border-b border-[#5C4037]/20 backdrop-blur-md' : 'py-8 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#ff6a00] flex items-center justify-center text-[#0b0b0b] shadow-[4px_4px_0px_0px_#5C4037] group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] group-hover:shadow-[6px_6px_0px_0px_#5C4037] transition-all">
              <span className="material-symbols-outlined font-black">terminal</span>
            </div>
            <span className="font-['Newsreader'] text-2xl font-extrabold tracking-tighter uppercase text-[#ffffff]">
            <span className="font-['Space_Grotesk'] text-2xl font-black tracking-tighter text-[#ffffff] uppercase">
              INFO<span className="text-[#ff6a00]">MIND</span>
            </span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            <button onClick={() => scrollTo('features-grid')} className="font-mono text-sm font-black tracking-[0.2em] text-[#ffffff]/60 hover:text-[#ff6a00] uppercase transition-colors">Features</button>
            <button onClick={() => scrollTo('how-it-works')} className="font-mono text-sm font-black tracking-[0.2em] text-[#ffffff]/60 hover:text-[#ff6a00] uppercase transition-colors">Protocol</button>
            <div className="w-[1px] h-4 bg-[#5C4037]/30"></div>
            <Link to="/login" className="font-mono text-sm font-black tracking-[0.2em] text-[#ffffff]/60 hover:text-[#ff6a00] uppercase transition-colors">Sign In</Link>
            <Link to="/register" className="bg-[#ff6a00] px-6 py-2.5 font-mono text-sm font-black tracking-[0.2em] text-[#0b0b0b] hover:bg-[#ffffff] transition-all uppercase">
              Join Now
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-[#ffffff]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-[#0b0b0b] border-b border-[#5C4037]/20 py-10 px-6 flex flex-col gap-8 md:hidden">
            <button onClick={() => scrollTo('features-grid')} className="font-mono text-sm font-black tracking-widest text-left uppercase">Features</button>
            <button onClick={() => scrollTo('how-it-works')} className="font-mono text-sm font-black tracking-widest text-left uppercase">Protocol</button>
            <Link to="/login" className="font-mono text-sm font-black tracking-widest uppercase">Sign In</Link>
            <Link to="/register" className="w-full py-4 bg-[#ff6a00] text-[#0b0b0b] text-center font-mono font-black tracking-widest uppercase">
              Join Now
            </Link>
          </div>
        )}
      </nav>

      {/* Section 2: Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-6 overflow-hidden bg-[#0b0b0b]">
        <div className="scanline"></div>
        
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2 bg-[#111111] border border-[#5C4037]/30 mb-10">
            <div className="w-2 h-2 bg-[#ff6a00] animate-pulse" />
            <span className="font-mono text-sm font-black tracking-[0.3em] uppercase text-[#ff6a00]">
              System Status: Optimized for 2026
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-['Newsreader'] text-7xl md:text-[120px] font-extrabold mb-10 leading-[0.85] tracking-[-0.05em] uppercase text-[#ffffff]">
            Business News<br />
            <span className="text-outline">Rewired by AI</span>
          </h1>

          {/* Subheadline */}
          <p className="font-mono text-lg md:text-xl text-[#ffffff]/60 max-w-3xl mx-auto mb-16 leading-relaxed uppercase tracking-widest">
            Cut through the noise. InfoMind delivers contextual intelligence tailored to your professional profile.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-24">
            <button 
              onClick={() => navigate('/register')}
              className="group relative px-12 py-6 bg-[#ff6a00] text-[#0b0b0b] font-mono font-black text-sm uppercase tracking-[0.2em] transition-all hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_0px_#ffffff]"
            >
              Explore News
            </button>
            <button 
              onClick={() => scrollTo('features')}
              className="px-12 py-6 border-2 border-[#ffffff]/20 font-mono font-black text-sm uppercase tracking-[0.2em] text-[#ffffff] hover:bg-[#ffffff] hover:text-[#0b0b0b] transition-all"
            >
              View Protocol
            </button>
          </div>

          {/* Bento Grid */}
          <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-1 px-1 bg-[#5C4037]/10 brutalist-border">
            {/* Main Feature */}
            <div className="md:col-span-2 bg-[#111111] p-10 flex flex-col justify-between h-[450px] text-left group">
              <div>
                <span className="material-symbols-outlined text-[#ff6a00] text-4xl mb-8">bolt</span>
                <h3 className="font-['Newsreader'] text-4xl font-extrabold text-[#ffffff] mb-6 uppercase tracking-tighter">Neural Streaming</h3>
                <p className="font-mono text-[#ffffff]/50 text-base leading-relaxed max-w-md uppercase tracking-widest">
                  Scanning thousands of global news sources per second. Delivering only high-signal data to your feed.
                </p>
              </div>
              <div className="flex gap-6">
                <div className="font-mono text-sm font-black text-[#ff6a00] uppercase tracking-widest">Accuracy: 99.9%</div>
                <div className="font-mono text-sm font-black text-[#FFE600] uppercase tracking-widest">Latency: 0.2s</div>
              </div>
            </div>

            {/* Side Feature 1 */}
            <div className="bg-[#111111] p-10 flex flex-col h-[450px] text-left group border-l border-[#5C4037]/10">
              <span className="material-symbols-outlined text-[#FFE600] text-4xl mb-8">auto_awesome</span>
              <h3 className="font-['Newsreader'] text-3xl font-extrabold text-[#ffffff] mb-6 uppercase tracking-tighter">AI Synthesis</h3>
              <p className="font-mono text-[#FFE600]/70 text-sm leading-relaxed uppercase tracking-widest">
                Instant extraction of core insights. No fluff, just the facts.
              </p>
              <div className="mt-auto pt-8 border-t border-[#5C4037]/10">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 border-2 border-[#0b0b0b] bg-[#111111] grayscale hover:grayscale-0 transition-all cursor-crosshair">
                      <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="User" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Side Feature 2 */}
            <div className="bg-[#111111] p-10 flex flex-col h-[450px] text-left group border-r border-[#5C4037]/10">
              <span className="material-symbols-outlined text-[#ff6a00] text-4xl mb-8">chat_bubble</span>
              <h3 className="font-['Newsreader'] text-3xl font-extrabold text-[#ffffff] mb-6 uppercase tracking-tighter">Expert Query</h3>
              <p className="font-mono text-[#ffffff]/50 text-sm leading-relaxed uppercase tracking-widest">
                Direct link to AI analysts. Ask anything, get context instantly.
              </p>
              <div className="mt-auto bg-[#111111] p-4 border border-[#5C4037]/20">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#ff6a00] animate-blink-dot"></div>
                  <span className="font-mono text-sm text-[#ff6a00] uppercase tracking-widest">AI Core Online</span>
                </div>
              </div>
            </div>

            {/* Main Feature 2 */}
            <div className="md:col-span-2 bg-[#111111] p-10 flex flex-col justify-between h-[450px] text-left group">
              <div>
                <span className="material-symbols-outlined text-[#ff6a00] text-4xl mb-8">analytics</span>
                <h3 className="font-['Newsreader'] text-4xl font-extrabold text-[#ffffff] mb-6 uppercase tracking-tighter">Sentiment Vectors</h3>
                <p className="font-mono text-[#ffffff]/50 text-base leading-relaxed max-w-md uppercase tracking-widest">
                  Quantifying market emotion. Mapping the psychological impact of global events.
                </p>
              </div>
              <div className="h-32 flex items-end gap-2">
                {[30, 60, 40, 80, 55, 70, 45, 90, 65, 85].map((h, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-[#ff6a00] opacity-30 hover:opacity-100 transition-opacity" 
                    style={{ height: `${h}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Stats Bar */}
      <section id="stats-bar" className="py-20 border-y border-[#5C4037]/20 bg-[#111111] animate-on-scroll">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { value: stats.readers.toLocaleString() + '+', label: 'News Nodes' },
            { value: stats.personas, label: 'Profession Profiles' },
            { value: stats.features, label: 'AI Protocols' },
            { value: stats.languages, label: 'Languages Supported' }
          ].map((stat, i) => (
            <div key={i} className="space-y-4">
              <div className="font-['Newsreader'] text-5xl md:text-6xl font-extrabold text-[#ffffff] uppercase tracking-tighter">{stat.value}</div>
              <div className="font-mono text-sm font-black text-[#ff6a00] uppercase tracking-[0.3em]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Marquee Section */}
      <div className="marquee-container border-y-2 border-[#0b0b0b] z-20 relative">
        <div className="marquee-content">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="mx-10">
              Cut the Noise • Upgrade Your Perspective • InfoMind • Pro Personalization • 
            </span>
          ))}
        </div>
      </div>

      {/* Section 4: Profession Section */}
      <section className="py-32 px-6 relative bg-[#0b0b0b]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 animate-on-scroll">
            <h2 className="font-['Newsreader'] text-5xl md:text-7xl font-extrabold mb-8 uppercase tracking-tighter">Professional Profiles</h2>
            <p className="font-mono text-lg text-[#ffffff]/50 max-w-2xl mx-auto uppercase tracking-widest">Select your domain expert. The system adapts to your field of interest.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-[#5C4037]/10 brutalist-border">
            {[
              {
                icon: "engineering",
                title: "The Engineer",
                tagline: "Tech stacks and innovation vectors.",
                color: "#ff6a00",
                features: ["AI Model Analytics", "Architecture Insights", "Impact Analysis", "Dev Trend Tracking"]
              },
              {
                icon: "rocket_launch",
                title: "The Entrepreneur",
                tagline: "Every headline is an opportunity.",
                color: "#FFE600",
                features: ["Competitor Intelligence", "Tech Disruption Alerts", "Strategic Impact Analysis", "Industry Shift Briefings"]
              },
              {
                icon: "payments",
                title: "The Trader",
                tagline: "Markets move fast. Stay ahead.",
                color: "#ffffff",
                features: ["Market Sentiment", "Financial Mapping", "Portfolio Dynamics", "Regulatory Alerts"]
              },
              {
                icon: "school",
                title: "The Student",
                tagline: "Learn business the smart way.",
                color: "#ff6a00",
                features: ["Easy Summaries", "Jargon Decryption", "Interactive AI Tutor", "Knowledge Building"]
              }
            ].map((prof, i) => (
              <div 
                key={i} 
                className="group p-12 bg-[#111111] hover:bg-[#111111] transition-all duration-300 animate-on-scroll"
              >
                <div className="flex items-start justify-between mb-10">
                  <span className="material-symbols-outlined text-5xl text-[#ff6a00]">{prof.icon}</span>
                  <div className="bg-[#111111] px-4 py-1.5 border border-[#5C4037]/30">
                    <span className="font-mono text-sm font-black uppercase tracking-[0.2em] text-[#ffffff]/60">
                      Profile ID: 00{i+1}
                    </span>
                  </div>
                </div>
                <h3 className="font-['Newsreader'] text-4xl font-extrabold mb-4 uppercase tracking-tighter text-[#ffffff]">{prof.title}</h3>
                <p className="font-mono text-sm text-[#ffffff]/40 mb-10 uppercase tracking-widest">{prof.tagline}</p>
                <ul className="space-y-4">
                  {prof.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-4 font-mono text-sm text-[#ffffff]/70 uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 bg-[#ff6a00]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Old Way vs AI Way */}
      <section id="features" className="py-32 px-6 bg-[#111111]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 animate-on-scroll">
            <h2 className="font-['Newsreader'] text-5xl md:text-7xl font-extrabold mb-8 uppercase tracking-tighter">Legacy vs Neural</h2>
            <p className="font-mono text-lg text-[#ffffff]/50 max-w-2xl mx-auto uppercase tracking-widest">The old framework is obsolete. Upgrade your perspective.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 bg-[#5C4037]/10 brutalist-border">
            {/* Old Way */}
            <div className="p-12 bg-[#111111] opacity-40 grayscale hover:grayscale-0 transition-all duration-700 animate-on-scroll">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#111111] border border-[#5C4037]/30 mb-10">
                <h3 className="font-mono text-sm font-black uppercase tracking-[0.2em] text-[#ffffff]/40">Legacy System</h3>
              </div>
              <div className="flex items-center gap-6 mb-10">
                <span className="material-symbols-outlined text-4xl text-[#ffffff]/30">newspaper</span>
                <h4 className="font-['Newsreader'] text-3xl font-extrabold text-[#ffffff]/40 uppercase tracking-tighter">The Old Way</h4>
              </div>
              
              {/* Mock Article */}
              <div className="bg-[#111111] p-8 mb-12 space-y-4 border border-[#5C4037]/10">
                <div className="w-full h-4 bg-[#ffffff]/5" />
                <div className="w-full h-3 bg-[#ffffff]/5" />
                <div className="w-full h-3 bg-[#ffffff]/5" />
                <div className="w-4/5 h-3 bg-[#ffffff]/5" />
                <div className="w-full h-3 bg-[#ffffff]/5" />
              </div>

              <ul className="space-y-6">
                {[
                  "Read 500 words for 1 insight",
                  "Static content for all users",
                  "Zero context, zero explanation",
                  "Manual impact calculation",
                  "Monolingual restriction"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 font-mono text-sm text-[#ffffff]/30 uppercase tracking-widest">
                    <span className="material-symbols-outlined text-sm">close</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Way */}
            <div className="relative p-12 bg-[#111111] brutalist-border-strong animate-on-scroll">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#111111] border border-[#ff6a00]/30 mb-10">
                <div className="w-2 h-2 bg-[#ff6a00] animate-pulse" />
                <h3 className="font-mono text-sm font-black uppercase tracking-[0.2em] text-[#ff6a00]">Neural Upgrade</h3>
              </div>
              <div className="flex items-center gap-6 mb-10">
                <span className="material-symbols-outlined text-4xl text-[#ff6a00]">bolt</span>
                <h4 className="font-['Newsreader'] text-3xl font-extrabold text-[#ffffff] uppercase tracking-tighter">The AI Way</h4>
              </div>

              {/* Mock Experience */}
              <div className="bg-[#111111] p-8 mb-12 border border-[#ff6a00]/20 space-y-6">
                <div className="w-2/3 h-5 bg-[#ff6a00]/20" />
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#FFE600] text-sm">auto_awesome</span>
                    <div className="w-32 h-2.5 bg-[#FFE600]/20" />
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1.5 h-1.5 bg-[#FFE600] mt-1" />
                    <div className="flex-1 h-2 bg-[#ffffff]/10" />
                  </div>
                </div>
              </div>

              <ul className="space-y-6">
                {[
                  "5-second neural synthesis",
                  "Profession-based adaptation",
                  "Plain language impact mapping",
                  "Real-time expert query",
                  "Multi-lingual core support"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 font-mono text-sm text-[#ffffff] uppercase tracking-widest">
                    <span className="material-symbols-outlined text-sm text-[#ff6a00]">check</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Feature Grid */}
      <section id="features-grid" className="py-32 px-6 bg-[#0b0b0b]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 animate-on-scroll">
            <h2 className="font-['Newsreader'] text-5xl md:text-7xl font-extrabold mb-8 uppercase tracking-tighter">Core Protocols</h2>
            <p className="font-mono text-lg text-[#ffffff]/50 max-w-2xl mx-auto uppercase tracking-widest">Advanced AI features built into every article.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 bg-[#5C4037]/10 brutalist-border">
            {[
              { icon: "auto_awesome", title: "AI Summary", text: "Every article distilled into 5 clear points. Zero noise." },
              { icon: "target", title: "Why It Matters", text: "Profession-aware impact analysis. Understand why news affects you." },
              { icon: "chat_bubble", title: "AI Chat", text: "Ask anything about the article. Get tailored answers." },
              { icon: "trending_up", title: "What's Next", text: "AI predicts the next developments in the story. Stay one step ahead." },
              { icon: "explore", title: "News Navigator", text: "Combine 3-5 articles into one briefing. Full picture, one doc." },
              { icon: "language", title: "Tamil Support", text: "Full AI experience in Tamil. Culturally adapted language." }
            ].map((feature, i) => (
              <div key={i} className="group p-12 bg-[#111111] hover:bg-[#111111] transition-all duration-300 animate-on-scroll">
                <div className="w-16 h-16 bg-[#111111] border border-[#5C4037]/20 flex items-center justify-center mb-10 group-hover:border-[#ff6a00] transition-colors">
                  <span className="material-symbols-outlined text-3xl text-[#ff6a00]">{feature.icon}</span>
                </div>
                <h3 className="font-['Newsreader'] text-3xl font-extrabold mb-6 uppercase tracking-tighter text-[#ffffff]">{feature.title}</h3>
                <p className="font-mono text-sm text-[#ffffff]/40 leading-relaxed uppercase tracking-widest">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7: How It Works */}
      <section id="how-it-works" className="py-32 px-6 relative overflow-hidden bg-[#111111]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 animate-on-scroll">
            <h2 className="font-['Newsreader'] text-5xl md:text-7xl font-extrabold mb-8 uppercase tracking-tighter text-[#ffffff]">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-[#5C4037]/10 brutalist-border">
            {[
              { num: "01", icon: "person_search", title: "Pick Your Profession", desc: "Tell us who you are at registration. Your experience adapts instantly." },
              { num: "02", icon: "feed", title: "Get Your Feed", desc: "See business news curated and filtered for your exact role." },
              { num: "03", icon: "smart_toy", title: "Interact with AI", desc: "Summarize, analyze impact, predict, and chat with articles." }
            ].map((step, i) => (
              <div key={i} className="p-12 bg-[#111111] flex flex-col items-center text-center animate-on-scroll">
                <div className="relative mb-12">
                  <div className="w-24 h-24 bg-[#111111] border border-[#5C4037]/20 flex items-center justify-center shadow-[8px_8px_0px_0px_#ff6a00]">
                    <span className="material-symbols-outlined text-4xl text-[#ff6a00]">{step.icon}</span>
                  </div>
                  <div className="absolute -top-4 -right-4 w-10 h-10 bg-[#ff6a00] flex items-center justify-center font-mono font-black text-sm text-[#0b0b0b]">
                    {step.num}
                  </div>
                </div>
                <h3 className="font-['Newsreader'] text-3xl font-extrabold mb-6 uppercase tracking-tighter text-[#ffffff]">{step.title}</h3>
                <p className="font-mono text-sm text-[#ffffff]/40 leading-relaxed uppercase tracking-widest">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8: Testimonials */}
      <section className="py-32 px-6 bg-[#0b0b0b]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 animate-on-scroll">
            <h2 className="font-['Newsreader'] text-5xl md:text-7xl font-extrabold mb-8 uppercase tracking-tighter text-[#ffffff]">User Feedback</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-[#5C4037]/10 brutalist-border">
            {[
              { name: "Arjun Mehta", role: "Portfolio Manager", initial: "AM", quote: "I used to spend 2 hours reading business news every morning. Now I get everything I need in 15 minutes. The Investor Persona is incredible." },
              { name: "Priya Krishnan", role: "Startup Founder", initial: "PK", quote: "The News Navigator feature is a game changer. I combined 5 union budget articles into one briefing and understood everything in 3 minutes." },
              { name: "Senthil Kumar", role: "Business Student", initial: "SK", quote: "Tamil support is what got me. Not just translated, actually explained in a way that makes sense culturally. Brilliant product." }
            ].map((t, i) => (
              <div key={i} className="p-12 bg-[#111111] flex flex-col animate-on-scroll">
                <div className="flex gap-1 mb-8 text-[#FFE600]">
                  {[...Array(5)].map((_, j) => <span key={j} className="material-symbols-outlined text-sm">star</span>)}
                </div>
                <p className="font-mono text-sm text-[#ffffff]/60 leading-relaxed mb-12 uppercase tracking-widest italic">"{t.quote}"</p>
                <div className="mt-auto flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#111111] border border-[#5C4037]/30 flex items-center justify-center font-mono font-black text-[#ff6a00]">
                    {t.initial}
                  </div>
                  <div>
                    <div className="font-mono text-sm font-black text-[#ffffff] uppercase tracking-widest">{t.name}</div>
                    <div className="font-mono text-sm font-black text-[#ff6a00] uppercase tracking-[0.2em]">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 9: Final CTA */}
      <section className="py-40 px-6 relative overflow-hidden bg-[#0b0b0b] border-t border-[#5C4037]/20">
        <div className="relative z-10 max-w-5xl mx-auto text-center animate-on-scroll">
          <h2 className="font-['Newsreader'] text-6xl md:text-[100px] font-extrabold mb-12 leading-[0.85] tracking-tighter uppercase text-[#ffffff]">
            Upgrade Your<br />
            <span className="text-[#ff6a00]">Perspective Now</span>
          </h2>
          <p className="font-mono text-xl text-[#ffffff]/40 max-w-2xl mx-auto mb-16 uppercase tracking-widest">
            Join thousands of users already connected to our network.
          </p>
          <button 
            onClick={() => navigate('/register')}
            className="group relative px-16 py-8 bg-[#ff6a00] text-[#0b0b0b] font-mono font-black text-lg uppercase tracking-[0.3em] transition-all hover:translate-x-[-6px] hover:translate-y-[-6px] hover:shadow-[12px_12px_0px_0px_#ffffff]"
          >
            INITIALIZE_ACCOUNT_
          </button>
          <div className="mt-16 flex flex-wrap justify-center gap-10 font-mono text-sm font-black text-[#ffffff]/30 uppercase tracking-[0.3em]">
            <span>No Credit Card Required</span>
            <span>·</span>
            <span>30-Second Setup</span>
            <span>·</span>
            <span>Cancel Anytime</span>
          </div>
        </div>
      </section>

      {/* Section 10: Footer */}
      <footer className="py-24 px-6 bg-[#111111] border-t border-[#5C4037]/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20 mb-24">
            <div className="space-y-8">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#ff6a00] flex items-center justify-center text-[#0b0b0b]">
                  <span className="material-symbols-outlined font-black">terminal</span>
                </div>
                <span className="font-['Newsreader'] text-2xl font-extrabold tracking-tighter uppercase text-[#ffffff]">INFO<span className="text-[#ff6a00]">MIND</span></span>
              </Link>
              <p className="font-mono text-sm text-[#ffffff]/40 leading-relaxed uppercase tracking-widest">
                Transforming business news into a personalized, interactive, and intelligent experience.
              </p>
              <div className="font-mono text-sm font-black uppercase tracking-[0.3em] text-[#ff6a00]">Built for ET Hackathon 2026</div>
            </div>

            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-6">
                <h4 className="font-mono text-sm font-black uppercase tracking-[0.3em] text-[#ffffff]">Product</h4>
                <ul className="space-y-4 font-mono text-sm text-[#ffffff]/40 uppercase tracking-widest">
                  <li><button onClick={() => scrollTo('features-grid')} className="hover:text-[#ff6a00] transition-colors">Features</button></li>
                  <li><button onClick={() => scrollTo('how-it-works')} className="hover:text-[#ff6a00] transition-colors">Protocol</button></li>
                  <li><Link to="/register" className="hover:text-[#ff6a00] transition-colors">Register</Link></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="font-mono text-sm font-black uppercase tracking-[0.3em] text-[#ffffff]">Network</h4>
                <ul className="space-y-4 font-mono text-sm text-[#ffffff]/40 uppercase tracking-widest">
                  <li><Link to="/login" className="hover:text-[#ff6a00] transition-colors">Sign In</Link></li>
                  <li><Link to="/register" className="hover:text-[#ff6a00] transition-colors">Register</Link></li>
                  <li><Link to="/" className="hover:text-[#ff6a00] transition-colors">Home</Link></li>
                </ul>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <h4 className="font-mono text-sm font-black uppercase tracking-[0.3em] text-[#ffffff]">Languages</h4>
                <p className="font-mono text-sm text-[#ffffff]/40 uppercase tracking-widest">English / Tamil</p>
              </div>
              <div className="space-y-3">
                <h4 className="font-mono text-sm font-black uppercase tracking-[0.3em] text-[#ffffff]">Intelligence</h4>
                <p className="font-mono text-sm text-[#ffffff]/40 uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[#ff6a00]">auto_awesome</span>
                  AI Powered by Claude
                </p>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-[#5C4037]/10 flex flex-col md:flex-row justify-between items-center gap-6 font-mono text-sm text-[#ffffff]/30 uppercase tracking-widest">
            <p>© 2026 InfoMind. All Rights Reserved.</p>
            <div className="flex gap-10">
              <a href="#" className="hover:text-[#ff6a00] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#ff6a00] transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
