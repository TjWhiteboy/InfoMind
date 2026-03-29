import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import NarratorControls from './NarratorControls';

export default function Navbar() {
  const { language } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');

  useEffect(() => {
    const handleUserUpdate = () => {
      setUser(JSON.parse(localStorage.getItem('user') || 'null'));
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    };
    
    window.addEventListener('user-updated', handleUserUpdate);
    window.addEventListener('storage', handleUserUpdate);
    
    return () => {
      window.removeEventListener('user-updated', handleUserUpdate);
      window.removeEventListener('storage', handleUserUpdate);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/news', icon: 'home' },
    { name: 'My Feed', path: '/my-feed', icon: 'auto_awesome' },
    { name: 'Saved', path: '/saved-feed', icon: 'bookmark' },
  ];

  return (
    <nav className="sticky top-0 z-[100] bg-[#0b0b0b]/90 backdrop-blur-md border-b border-[#5C4037]/20 px-4 sm:px-6 lg:px-8 h-20">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        
        {/* LOGO */}
        <div 
          onClick={() => navigate('/news')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-[#ff6a00] flex items-center justify-center">
            <span className="material-symbols-outlined text-[#0b0b0b] font-black group-hover:rotate-180 transition-transform duration-300">
              neurology
            </span>
          </div>
          <div>
            <h1 className="font-['Newsreader'] text-xl font-black text-[#ffffff] leading-none tracking-tighter uppercase">
              INFO<span className="text-[#ff6a00]">MIND</span>
            </h1>
            <p className="font-mono text-sm text-[#ff6a00] tracking-[0.3em] font-black uppercase mt-1">
              Neural Intelligence Layer
            </p>
          </div>
        </div>

        {/* NAV LINKS (DESKTOP) */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => navigate(link.path)}
              className={`flex items-center gap-2 font-mono text-base font-black tracking-widest transition-all duration-150 relative group ${
                location.pathname === link.path ? 'text-[#ff6a00]' : 'text-[#ffffff] opacity-40 hover:opacity-100'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{link.icon}</span>
              <span>{link.name}</span>
              {location.pathname === link.path && (
                <motion.div layoutId="nav-underline" className="absolute -bottom-8 left-0 w-full h-[2px] bg-[#ff6a00]" />
              )}
            </button>
          ))}
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-6">
          <NarratorControls />

          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full bg-[#111111] border border-[#5C4037]/30 hover:border-[#ff6a00] transition-all group"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-[#111111] border border-[#ff6a00]/20 group-hover:border-[#ff6a00]">
                  {user?.profilePic ? (
                    <img 
                      src={user.profilePic.startsWith('http') ? user.profilePic : `${import.meta.env.VITE_API_URL}${user.profilePic}`} 
                      alt="P" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#ff6a00]/10 text-[#ff6a00] font-mono text-base font-black">
                      {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <span className="font-mono text-sm sm:text-base font-black text-[#ffffff] uppercase tracking-widest hidden sm:inline">
                  {user?.fullName?.split(' ')[0] || 'USER'}
                </span>
                <span className={`material-symbols-outlined text-sm text-[#ff6a00] transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {/* DROPDOWN */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-56 bg-[#111111] border border-[#5C4037]/40 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
                  >
                    <div className="p-4 border-b border-[#5C4037]/20 bg-[#0b0b0b]/50">
                      <p className="font-mono text-sm text-[#ff6a00] font-black uppercase tracking-widest mb-1">Current Session</p>
                      <p className="font-['Newsreader'] text-base font-extrabold text-[#ffffff] truncate">{user?.fullName || user?.email}</p>
                      <p className="font-mono text-sm text-[#ffffff] opacity-30 truncate">{user?.profession || 'Member'}</p>
                    </div>
                    
                    <div className="p-2">
                      <button 
                        onClick={() => { navigate('/profile'); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 font-mono text-sm font-black text-[#ffffff] opacity-60 hover:opacity-100 hover:bg-[#ff6a00]/10 hover:text-[#ff6a00] transition-all text-left"
                      >
                        <span className="material-symbols-outlined text-sm">person</span>
                        Profile
                      </button>
                      <button 
                        onClick={() => { navigate('/saved-feed'); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 font-mono text-sm font-black text-[#ffffff] opacity-60 hover:opacity-100 hover:bg-[#ff6a00]/10 hover:text-[#ff6a00] transition-all text-left"
                      >
                        <span className="material-symbols-outlined text-sm">bookmark</span>
                        Saved Articles
                      </button>
                    </div>

                    <div className="p-2 border-t border-[#5C4037]/20">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 font-mono text-sm font-black text-[#FE3131] hover:bg-[#FE3131]/10 transition-all text-left"
                      >
                        <span className="material-symbols-outlined text-sm">logout</span>
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 bg-[#ff6a00] text-[#0b0b0b] font-mono font-black text-sm sm:text-base uppercase tracking-[0.2em] hover:bg-[#FFE600] transition-colors"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
