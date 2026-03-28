import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { login, register, checkEmailVerification } from '../services/api';

export default function AuthPage() {
  const { clearPersona } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname === '/login';
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    profession: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailCheckStatus, setEmailCheckStatus] = useState('idle');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      profession: ''
    });
    setErrors({});
    setEmailCheckStatus('idle');
    setSuccessMessage('');
  }, [isLogin]);

  // Real-time email debouncer
  useEffect(() => {
    if (isLogin) {
      setEmailCheckStatus('idle');
      return;
    }
    
    if (formData.email.trim() === '') {
      setEmailCheckStatus('idle');
      return;
    }
    
    if (!formData.email.includes('@')) {
      setEmailCheckStatus('invalid');
      return;
    }
    
    const checkTimer = setTimeout(async () => {
      setEmailCheckStatus('checking');
      try {
        const res = await checkEmailVerification(formData.email);
        if (res.exists) {
          setEmailCheckStatus('exists');
          setErrors(prev => ({ ...prev, email: '⚠️ Account already exists. Please login.' }));
        } else {
          setEmailCheckStatus('available');
          setErrors(prev => { 
            const newErrors = { ...prev };
            delete newErrors.email;
            return newErrors;
          });
        }
      } catch (err) {
        setEmailCheckStatus('idle');
      }
    }, 500);
    
    return () => clearTimeout(checkTimer);
  }, [formData.email, isLogin]);

  const validate = () => {
    const newErrors = {};
    if (!isLogin && !formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!isLogin && !formData.profession) newErrors.profession = 'Please select a profession';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    
    try {
      if (isLogin) {
        const data = await login(formData.email, formData.password);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isLoggedIn', 'true');
        
        navigate('/news');
      } else {
        const res = await register(formData.fullName, formData.email, formData.password, formData.profession);
        if (res.success) {
          setSuccessMessage('✅ Account created successfully');
          setTimeout(() => {
            navigate('/login');
          }, 1500);
        }
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 409) {
        setErrors({ email: err.response?.data?.message || '⚠️ Account already exists. Please login.' });
        setEmailCheckStatus('exists');
      } else if (err.response?.data?.error || err.response?.data?.message) {
        setErrors({ email: err.response.data.error || err.response.data.message });
      } else {
        setErrors({ email: 'Registration failed. Try again' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const professions = ["Student", "Engineer", "Entrepreneur", "Businessman", "Trader", "Sports"];

  return (
    <div className="min-h-screen flex bg-[#0b0b0b] text-[#ffffff] selection:bg-[#ff6a00] selection:text-[#0b0b0b] relative overflow-hidden">
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
      `}</style>
      {/* Left Panel - Brutalist Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#111111] p-16 flex-col justify-between border-r border-[#5C4037]/20">
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="bg-[#ff6a00] p-2 transition-all duration-100 group-hover:bg-[#FFE600]">
              <span className="material-symbols-outlined text-[#0b0b0b] text-3xl font-black">terminal</span>
            </div>
            <span className="font-['Space_Grotesk'] text-2xl font-black tracking-tighter text-[#ffffff] uppercase">
              INFO<span className="text-[#ff6a00]">MIND</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-xl">
          <h1 className="font-['Newsreader'] text-8xl font-extrabold text-[#ffffff] mb-12 leading-[0.85] tracking-tighter uppercase">
            Your News.<br />
            Your Way.<br />
            <span className="text-[#ff6a00]">AI Powered.</span>
          </h1>

          <div className="space-y-8">
            {[
              { icon: "target", text: "Personalized Feeds" },
              { icon: "auto_awesome", text: "Neural Summaries" },
              { icon: "terminal", text: "Interactive Query" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-6">
                <span className="material-symbols-outlined text-[#FFE600] text-2xl">{item.icon}</span>
                <span className="font-mono text-sm font-black tracking-widest opacity-60 uppercase">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 font-mono text-sm opacity-20 uppercase tracking-[0.3em]">
          [ System Version: 4.0.2 — Est. 2026 ]
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-20 bg-[#0b0b0b] relative">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="w-full max-w-md relative z-10">
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-[#ff6a00] animate-pulse" />
              <span className="font-mono text-sm font-black text-[#ff6a00] uppercase tracking-[0.2em]">
                {isLogin ? 'Access Request' : 'Initialize User'}
              </span>
            </div>
            <h2 className="font-['Newsreader'] text-5xl font-extrabold text-[#ffffff] mb-2 uppercase tracking-tighter">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="font-mono text-sm opacity-40 uppercase tracking-widest">
              {isLogin ? 'Login to proceed' : 'Create your new account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <AnimatePresence mode="popLayout">
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-green-500/10 border border-green-500/30 p-4 text-green-500 font-mono font-black text-sm uppercase tracking-widest flex items-center gap-3 mb-8"
                >
                  <span className="material-symbols-outlined">check_circle</span>
                  {successMessage}
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="font-mono text-sm font-black text-[#ffffff] opacity-40 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter your name..."
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className={`w-full bg-[#111111] px-4 py-4 font-['Space_Grotesk'] text-sm text-[#ffffff] placeholder:text-[#ffffff]/20 outline-none transition-all border-l-4 ${
                        errors.fullName ? 'border-[#ff6a00]' : 'border-transparent focus:border-[#FFE600]'
                      } [&:-webkit-autofill]:shadow-[0_0_0_1000px_#111111_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff]`}
                    />
                    {errors.fullName && <p className="font-mono text-sm text-[#ff6a00] ml-1 tracking-widest">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="font-mono text-sm font-black text-[#ffffff] opacity-40 uppercase tracking-widest ml-1">Profession</label>
                    <select
                      value={formData.profession}
                      onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                      className={`w-full bg-[#111111] px-4 py-4 font-['Space_Grotesk'] text-sm text-[#ffffff] outline-none transition-all border-l-4 appearance-none ${
                        errors.profession ? 'border-[#ff6a00]' : 'border-transparent focus:border-[#FFE600]'
                      }`}
                    >
                      <option value="" disabled className="text-[#ffffff]/20">Select your profession...</option>
                      {professions.map(p => (
                        <option key={p} value={p} className="bg-[#111111] text-[#ffffff]">{p.toUpperCase()}</option>
                      ))}
                    </select>
                    {errors.profession && <p className="font-mono text-sm text-[#ff6a00] ml-1 tracking-widest">{errors.profession}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="font-mono text-sm font-black text-[#ffffff] opacity-40 uppercase tracking-widest ml-1">Email Address</label>
              <input
                type="email"
                placeholder="Enter your email..."
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full bg-[#111111] px-4 py-4 font-['Space_Grotesk'] text-sm text-[#ffffff] placeholder:text-[#ffffff]/20 outline-none transition-all border-l-4 ${
                  errors.email ? 'border-red-500' : 
                  emailCheckStatus === 'available' ? 'border-green-500 focus:border-green-500' :
                  emailCheckStatus === 'checking' ? 'border-[#ff6a00]' :
                  'border-transparent focus:border-[#FFE600]'
                } [&:-webkit-autofill]:shadow-[0_0_0_1000px_#111111_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff]`}
              />
              
              {/* Dynamic Feedback below email */}
              {emailCheckStatus === 'checking' && (
                <p className="font-mono text-sm text-[#ff6a00] ml-1 tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm animate-spin">refresh</span> Checking availability...
                </p>
              )}
              {emailCheckStatus === 'available' && !isLogin && (
                <p className="font-mono text-sm text-green-500 ml-1 tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">check_circle</span> Email available
                </p>
              )}
              {errors.email && (
                <div className="font-mono text-sm text-red-500 ml-1 tracking-widest mt-1">
                  {emailCheckStatus === 'exists' && !isLogin ? (
                    <div className="flex flex-col gap-1">
                      <p>{errors.email}</p>
                      <Link to="/login" className="text-[#FFE600] hover:underline hover:text-[#ff6a00] mt-1 transition-colors block border border-[#FFE600]/20 p-2 bg-[#FFE600]/5 hover:bg-[#FFE600]/10 w-max">
                        Already have an account? Login here →
                      </Link>
                    </div>
                  ) : (
                    <p>{errors.email}</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="font-mono text-sm font-black text-[#ffffff] opacity-40 uppercase tracking-widest">Password</label>
                {isLogin && (
                  <button type="button" className="font-mono text-sm font-black text-[#FFE600] hover:underline uppercase tracking-widest">Forgot password?</button>
                )}
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password..."
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full bg-[#111111] px-4 py-4 font-['Space_Grotesk'] text-sm text-[#ffffff] placeholder:text-[#ffffff]/20 outline-none transition-all border-l-4 ${
                    errors.password ? 'border-[#ff6a00]' : 'border-transparent focus:border-[#FFE600]'
                  } [&:-webkit-autofill]:shadow-[0_0_0_1000px_#111111_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff]`}
                />
                 <button
                  type="button"
                  title={showPassword ? "Hide Password" : "Show Password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ffffff] opacity-20 hover:opacity-100 transition-opacity"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password && <p className="font-mono text-sm text-[#ff6a00] ml-1 tracking-widest">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="font-mono text-sm font-black text-[#ffffff] opacity-40 uppercase tracking-widest ml-1">Confirm Password</label>
                <div className="relative group">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password..."
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={`w-full bg-[#111111] px-4 py-4 font-['Space_Grotesk'] text-sm text-[#ffffff] placeholder:text-[#ffffff]/20 outline-none transition-all border-l-4 ${
                      errors.confirmPassword ? 'border-[#ff6a00]' : 'border-transparent focus:border-[#FFE600]'
                    } [&:-webkit-autofill]:shadow-[0_0_0_1000px_#111111_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff]`}
                  />
                  <button
                    type="button"
                    title={showConfirmPassword ? "Hide Password" : "Show Password"}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ffffff] opacity-20 hover:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {errors.confirmPassword && <p className="font-mono text-sm text-[#ff6a00] ml-1 tracking-widest">{errors.confirmPassword}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-[#ff6a00] text-[#0b0b0b] font-mono font-black text-sm uppercase tracking-[0.2em] transition-all duration-0 hover:bg-[#0b0b0b] hover:text-[#ff6a00] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-[#0b0b0b] border-t-transparent animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Login' : 'Register'}
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </>
              )}
            </button>

            <div className="relative py-4 mt-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#5C4037]/10"></div>
              </div>
              <div className="relative flex justify-center text-sm font-mono font-black uppercase tracking-[0.3em]">
                <span className="bg-[#0b0b0b] px-4 text-[#ffffff] opacity-20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">shield_lock</span>
                  Secure Login with Email & Password
                </span>
              </div>
            </div>
          </form>

          <div className="mt-12 text-center">
            <p className="font-mono text-sm text-[#ffffff] opacity-40 uppercase tracking-widest">
              {isLogin ? "Need an account?" : "Already have an account?"}{' '}
              <Link 
                to={isLogin ? '/register' : '/login'} 
                className="text-[#FFE600] font-black hover:underline ml-2"
              >
                {isLogin ? '[ Register Now ]' : '[ Sign In ]'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
