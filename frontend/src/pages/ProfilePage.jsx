import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '../components/Navbar';
import { fetchProfile, updateProfile, updatePassword, updatePhoto, deleteAccount } from '../services/api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('account'); // account, security, danger
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await fetchProfile();
      setUser(data);
      setName(data.name || '');
      setEmail(data.email || '');
    } catch (err) {
      console.error(err);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await updateProfile({ name, email });
      setUser(res.user);
      // Update local storage too
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, fullName: name, email }));
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Update failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await updatePassword({ currentPassword, newPassword });
      setMessage({ type: 'success', text: 'Password updated successfully' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Password update failed' });
    } finally {
      setSaving(false);
    }
  };

  const processAvatarFile = async (file) => {
    if (!file) return;
    
    // File Validation
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Invalid format. Please use JPG or PNG.' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image too large. Maximum size is 10MB.' });
      return;
    }
    
    // Immediate local preview
    const previewUrl = URL.createObjectURL(file);
    setUser(prev => ({ ...prev, profilePic: previewUrl }));
    
    setUploadingAvatar(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await updatePhoto(file);
      if (res.success) {
        // Construct full URL (backend returns relative path /uploads/...)
        const API_URL = import.meta.env.VITE_API_URL;
        const fullImageUrl = `${API_URL}${res.imageUrl}`;
        
        setUser(res.user);
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...stored, profilePic: fullImageUrl }));
        
        // Dispatch custom event to sync Navbar avatar instantly
        window.dispatchEvent(new Event('user-updated'));
        
        setMessage({ type: 'success', text: 'Avatar updated successfully' });
      }
    } catch (err) {
      console.error("Upload error:", err);
      setMessage({ type: 'error', text: 'Avatar upload failed. Please try again.' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePhotoUpload = (e) => {
    processAvatarFile(e.target.files[0]);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processAvatarFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleDeleteAccount = async () => {
    setSaving(true);
    try {
      const res = await deleteAccount(deleteInput);
      if (res && res.success) {
        localStorage.clear();
        navigate('/login');
      } else {
        setMessage({ type: 'error', text: res?.error || 'Account deletion failed' });
        setSaving(false);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Account deletion failed' });
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center text-[#ff6a00]">
        <div className="animate-spin material-symbols-outlined text-4xl">neurology</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-[#ffffff] font-['Space_Grotesk']">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-20">
        <header className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <span className="w-2 h-2 bg-[#ff6a00] rounded-full animate-pulse" />
            <p className="font-mono text-sm text-[#ff6a00] uppercase tracking-[0.4em] font-black">User Profile Management</p>
          </div>
          <h1 className="font-['Newsreader'] text-6xl font-extrabold uppercase tracking-tighter leading-none mb-4">Profile</h1>
          <p className="font-mono text-sm opacity-40 uppercase tracking-widest">Update your account details and security settings</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Sidebar Tabs */}
          <div className="space-y-2">
            {[
              { id: 'account', label: 'Identity', icon: 'person' },
              { id: 'security', label: 'Security', icon: 'shield' },
              { id: 'danger', label: 'Danger Zone', icon: 'dangerous' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { 
                  setActiveTab(tab.id); 
                  setMessage({ type: '', text: '' }); 
                  setShowDeleteConfirm(false); 
                  setDeleteInput(''); 
                }}
                className={`w-full flex items-center gap-3 px-4 py-4 font-mono text-sm sm:text-base font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[#ff6a00] text-[#0b0b0b]' 
                    : 'bg-[#111111] text-[#ffffff] opacity-40 hover:opacity-100 border border-[#5C4037]/10'
                }`}
              >
                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-3 bg-[#111111] border border-[#5C4037]/20 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff6a00]/5 blur-[60px]" />
            
            {message.text && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`mb-8 p-4 font-mono text-sm font-black uppercase tracking-widest border ${
                  message.type === 'success' ? 'bg-[#ff6a00]/10 border-[#ff6a00]/30 text-[#ff6a00]' : 'bg-red-500/10 border-red-500/30 text-red-500'
                }`}
              >
                {message.text}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {activeTab === 'account' && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <div className="flex flex-col sm:flex-row items-center gap-10 mb-12">
                    <div className="relative group">
                      <div 
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        className={`w-32 h-32 rounded-full overflow-hidden bg-[#0b0b0b] border-2 transition-all duration-300 relative ${
                          isDragging 
                            ? 'border-[#FFE600] scale-105 shadow-[0_0_30px_rgba(255,230,0,0.3)]' 
                            : 'border-[#ff6a00]/20 group-hover:border-[#ff6a00]'
                        }`}
                      >
                        {uploadingAvatar && (
                          <div className="absolute inset-0 z-20 bg-[#0b0b0b]/80 flex flex-col items-center justify-center backdrop-blur-sm">
                            <span className="material-symbols-outlined text-[#ff6a00] animate-spin mb-1">sync</span>
                            <span className="font-mono text-sm text-[#ff6a00] uppercase font-black tracking-widest">Uploading</span>
                          </div>
                        )}
                        {isDragging && (
                          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none bg-[#ff6a00]/10 backdrop-blur-sm">
                            <span className="material-symbols-outlined text-[#FFE600] text-3xl">cloud_upload</span>
                          </div>
                        )}
                        {user?.profilePic ? (
                          <img 
                            src={user.profilePic.startsWith('http') ? user.profilePic : `${import.meta.env.VITE_API_URL}${user.profilePic}`} 
                            alt="Avatar" 
                            className={`w-full h-full object-cover transition-opacity ${uploadingAvatar ? 'opacity-50' : ''}`} 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#ff6a00]/10 text-[#ff6a00] font-['Newsreader'] text-4xl font-extrabold pb-1">
                            {user?.name?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 w-10 h-10 bg-[#ff6a00] text-[#0b0b0b] rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-[#FFE600] hover:scale-110 transition-all z-30">
                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploadingAvatar} />
                        <span className="material-symbols-outlined text-sm">photo_camera</span>
                      </label>
                    </div>
                    <div>
                      <h2 className="font-mono text-sm text-[#ff6a00] font-black uppercase tracking-widest mb-1 underline">Profession</h2>
                      <p className="font-['Newsreader'] text-3xl font-extrabold uppercase mb-2">{user?.profession || 'Member'}</p>
                      <p className="font-mono text-sm opacity-30 uppercase tracking-[0.2em]">Joined: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="space-y-2">
                      <label className="font-mono text-sm text-[#ff6a00] uppercase tracking-widest font-black">Full Name</label>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-[#0b0b0b] border border-[#5C4037]/20 p-4 font-mono text-base md:text-lg text-[#ffffff] outline-none focus:border-[#ff6a00] transition-colors uppercase"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-mono text-sm text-[#ff6a00] uppercase tracking-widest font-black">Email Address</label>
                      <input 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-[#0b0b0b] border border-[#5C4037]/20 p-4 font-mono text-base md:text-lg text-[#ffffff] outline-none focus:border-[#ff6a00] transition-colors uppercase"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={saving}
                      className="w-full py-5 bg-[#ff6a00] text-[#0b0b0b] font-mono font-black text-base uppercase tracking-[0.2em] hover:bg-[#FFE600] disabled:opacity-50 transition-all"
                    >
                      {saving ? 'Updating...' : 'Save Changes'}
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <h3 className="font-mono text-sm sm:text-base text-[#ff6a00] font-black uppercase tracking-widest mb-8 underline">Update Password</h3>
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div className="space-y-2">
                      <label className="font-mono text-sm text-[#ff6a00] uppercase tracking-widest font-black">Current Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        className="w-full bg-[#0b0b0b] border border-[#5C4037]/20 p-4 font-mono text-base md:text-lg text-[#ffffff] outline-none focus:border-[#ff6a00] transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-mono text-sm text-[#ff6a00] uppercase tracking-widest font-black">New Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full bg-[#0b0b0b] border border-[#5C4037]/20 p-4 font-mono text-base md:text-lg text-[#ffffff] outline-none focus:border-[#ff6a00] transition-colors"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={saving}
                      className="w-full py-5 bg-[#ff6a00] text-[#0b0b0b] font-mono font-black text-base uppercase tracking-[0.2em] hover:bg-[#FFE600] disabled:opacity-50 transition-all"
                    >
                      {saving ? 'Encrypting...' : 'Update Password'}
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'danger' && (
                <motion.div
                  key="danger"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8"
                >
                  <div className="p-6 bg-red-500/10 border border-red-500/20">
                    <h3 className="font-mono text-sm sm:text-base text-red-500 font-black uppercase tracking-widest mb-4">Dangerous Section</h3>
                    {!showDeleteConfirm ? (
                      <>
                        <p className="font-['Newsreader'] text-xl text-[#ffffff] opacity-80 mb-8 lowercase italic">
                          deleting your account will result in the immediate and permanent destruction of all saved intelligence, chat histories, and personalization parameters. this action cannot be undone.
                        </p>
                        <button 
                          onClick={() => setShowDeleteConfirm(true)}
                          className="w-full py-5 border border-red-500 text-red-500 font-mono font-black text-base uppercase tracking-[0.2em] hover:bg-red-500 hover:text-[#0b0b0b] transition-all"
                        >
                          Delete My Account
                        </button>
                      </>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <p className="font-['Newsreader'] text-xl text-[#ffffff] opacity-80 mb-4 lowercase italic text-red-400">
                          type "delete" to confirm the permanent destruction of this account.
                        </p>
                        <input 
                          type="text" 
                          value={deleteInput}
                          onChange={(e) => setDeleteInput(e.target.value)}
                          placeholder="Type delete to confirm"
                          className={`w-full bg-[#0b0b0b] border p-4 font-mono text-base outline-none transition-colors mb-6 ${
                            deleteInput.toLowerCase() === 'delete' 
                              ? 'border-green-500/50 text-green-500 focus:border-green-500 placeholder-green-500/30' 
                              : 'border-red-500/50 text-red-500 focus:border-red-500 placeholder-red-500/30'
                          }`}
                        />
                        <div className="flex gap-4">
                          <button 
                            onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                            disabled={saving}
                            className="flex-1 py-5 border border-red-500/30 text-red-500/70 font-mono font-black text-base uppercase tracking-[0.2em] hover:text-red-500 hover:border-red-500 transition-all disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={handleDeleteAccount}
                            disabled={deleteInput.toLowerCase() !== 'delete' || saving}
                            className={`flex-1 py-5 text-[#0b0b0b] font-mono font-black text-base uppercase tracking-[0.2em] transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed ${
                              deleteInput.toLowerCase() === 'delete'
                                ? 'bg-green-500 hover:bg-green-400 disabled:hover:bg-green-500'
                                : 'bg-red-500 hover:bg-red-400 disabled:hover:bg-red-500'
                            }`}
                          >
                            {saving ? 'Deleting...' : 'Confirm Delete'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
