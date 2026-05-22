'use client';

import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { authAPI, userAPI } from '@/lib/api';
import { toast } from 'sonner';
import { User as UserIcon, Lock, Bell, Palette, Building, CreditCard, Key, Link as LinkIcon, Save, Copy, CheckCircle2, ChevronRight, Network, X } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [theme, setTheme] = useState('dark');
  const profileInputRef = useRef<HTMLInputElement>(null);

  // Profile fields state
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileRole, setProfileRole] = useState('');

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Integrations & Company
  const [ttnAccountId, setTtnAccountId] = useState('');
  const [ttnIntegrationKey, setTtnIntegrationKey] = useState('');
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');

  // Sync fields from Auth User context
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileEmail(user.email || '');
      setProfileRole(user.role || 'ACCOUNTANT');
      setTheme(user.preferences?.darkMode === false ? 'light' : 'dark');
      setTtnAccountId(user.integrations?.ttnAccountId || '');
      setTtnIntegrationKey(user.integrations?.ttnIntegrationKey || '');
      setCompanyName(user.companyDetails?.name || '');
      setTaxId(user.companyDetails?.taxId || '');
    }
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim() || !profileEmail.trim()) {
      toast.error('Name and email cannot be empty');
      return;
    }
    try {
      const res = await authAPI.updateProfile(profileName, profileEmail);
      if (res.data) {
        updateUser({ name: res.data.name, email: res.data.email });
        toast.success('Profile updated successfully!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await userAPI.uploadProfileImage(file);
      if (res.data) {
        updateUser({ profileImage: res.data.profileImage });
        toast.success('Profile image updated successfully!');
      }
    } catch (err: any) {
      toast.error('Failed to upload profile image');
    }
  };

  const handlePreferenceToggle = async (key: string, value: boolean, subKey?: 'email' | 'inApp') => {
    try {
      const currentPrefs = user?.preferences || { darkMode: true, mfa: false, notifications: {} };
      
      let updatedPrefs = { ...currentPrefs };

      if (key === 'darkMode' || key === 'mfa') {
        updatedPrefs[key] = value;
      } else if (subKey) {
        // Notification updates
        const notifObj = updatedPrefs.notifications || {} as any;
        if (!notifObj[key]) notifObj[key] = { email: true, inApp: true };
        notifObj[key][subKey] = value;
        updatedPrefs.notifications = notifObj;
      }

      const res = await authAPI.updatePreferences(updatedPrefs);
      if (res.data) {
        updateUser({ preferences: res.data.preferences });
        if (key === 'darkMode') {
          document.documentElement.classList.toggle('theme-light', !value);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update preferences');
    }
  };

  const toggleTheme = (mode: 'dark' | 'light') => {
    const isDark = mode === 'dark';
    setTheme(mode);
    handlePreferenceToggle('darkMode', isDark);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Both passwords are required');
      return;
    }
    setPasswordLoading(true);
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleIntegrationsSave = async () => {
    try {
      const integrations = { ...user?.integrations, ttnAccountId, ttnIntegrationKey };
      const res = await userAPI.updateIntegrations(integrations);
      if (res.data) {
        updateUser({ integrations: res.data.integrations });
        toast.success('TTN Integrations updated!');
      }
    } catch (err) {
      toast.error('Failed to update integrations');
    }
  };

  const toggleIntegrationActive = async (key: 'slackActive' | 'quickbooksActive') => {
    try {
      const current = user?.integrations?.[key] ?? false;
      const integrations = { ...user?.integrations, [key]: !current };
      const res = await userAPI.updateIntegrations(integrations);
      if (res.data) {
        updateUser({ integrations: res.data.integrations });
        toast.success('Integration status updated!');
      }
    } catch (err) {
      toast.error('Failed to toggle integration');
    }
  };

  const handleCompanySave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await userAPI.updateCompanyDetails({ name: companyName, taxId });
      if (res.data) {
        updateUser({ companyDetails: res.data.companyDetails });
        toast.success('Company details saved!');
        setIsCompanyModalOpen(false);
      }
    } catch (err) {
      toast.error('Failed to save company details');
    }
  };

  const generateApiKey = async () => {
    try {
      const res = await userAPI.generateApiKey('New Gen API Key');
      if (res.data) {
        updateUser({ apiKeys: res.data.apiKeys });
        toast.success('New API Key generated successfully!');
      }
    } catch (err) {
      toast.error('Failed to generate API Key');
    }
  };

  // Helper for custom Toggle Switch
  const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <div 
      className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${checked ? 'bg-[#D98F8F]' : 'bg-white/10'}`}
      onClick={onChange}
    >
      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </div>
  );

  const getNotif = (key: string, type: 'email' | 'inApp') => {
    const notifs = user?.preferences?.notifications as any;
    if (!notifs || !notifs[key]) return true; // Default true
    return notifs[key][type] ?? true;
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 w-full pb-10 max-w-[1600px] mx-auto relative">
        
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-[32px] font-bold tracking-tight mb-1 text-[#FFFFFF]">Platform Settings</h1>
          <p className="text-[#A69697] text-[15px]">Manage your profile, security, integrations, and billing preferences.</p>
        </div>

        {/* BENTO BOX GRID */}
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* ================= COLUMN 1 (Left) ================= */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Profile Settings */}
            <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.08)] rounded-[24px] p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[#FFFFFF] text-[16px] font-bold flex items-center gap-2">
                  <UserIcon className="text-[#D98F8F]" size={18} /> Profile
                </h3>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div 
                  className="relative cursor-pointer group"
                  onClick={() => profileInputRef.current?.click()}
                >
                  <img 
                    src={user?.profileImage ? `http://localhost:5000/${user.profileImage}` : `https://i.pravatar.cc/150?u=${user?.email}`} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full border-2 border-[#D98F8F]/50 shadow-[0_0_15px_rgba(217,143,143,0.3)] object-cover group-hover:opacity-70 transition-opacity" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-[10px] font-bold bg-black/50 px-2 py-1 rounded-full">Edit</span>
                  </div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#4CAF50] border-2 border-[#1A0A0B] rounded-full"></div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={profileInputRef} 
                    onChange={handleProfileImageUpload} 
                    className="hidden" 
                  />
                </div>
                <div>
                  <p className="text-white font-bold text-[16px]">{user?.name || 'User'}</p>
                  <p className="text-[#A69697] text-[12px]">Member Since 2026</p>
                </div>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div>
                  <label className="text-[#A69697] text-[12px] block mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={profileName} 
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-[#1A0A0B]/50 border border-white/10 rounded-[12px] py-2.5 px-3 text-[14px] text-white outline-none focus:border-[#D98F8F] transition-colors" 
                  />
                </div>
                <div>
                  <label className="text-[#A69697] text-[12px] block mb-1">Email</label>
                  <input 
                    type="email" 
                    value={profileEmail} 
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full bg-[#1A0A0B]/50 border border-white/10 rounded-[12px] py-2.5 px-3 text-[14px] text-white outline-none focus:border-[#D98F8F] transition-colors" 
                  />
                </div>
                <div>
                  <label className="text-[#A69697] text-[12px] block mb-1">System Role</label>
                  <select 
                    disabled 
                    value={profileRole} 
                    className="w-full bg-[#1A0A0B]/50 border border-white/10 rounded-[12px] py-2.5 px-3 text-[14px] text-[#A69697] outline-none cursor-not-allowed appearance-none"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="ACCOUNTANT">Accountant</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  className="w-full mt-2 bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white py-3 rounded-[12px] font-bold shadow-[0_0_15px_rgba(142,27,58,0.4)] hover:shadow-[0_0_25px_rgba(217,143,143,0.5)] transition-all flex items-center justify-center gap-2"
                >
                  <Save size={16} /> Save Changes
                </button>
              </form>
            </div>

            {/* Security */}
            <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.08)] rounded-[24px] p-6 shadow-lg">
              <h3 className="text-[#FFFFFF] text-[16px] font-bold flex items-center gap-2 mb-6">
                <Lock className="text-[#D98F8F]" size={18} /> Security
              </h3>

              <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/5">
                <div>
                  <p className="text-white text-[14px] font-medium">Two-Factor Authentication</p>
                  <p className="text-[#A69697] text-[11px] mt-0.5">Secure your account with 2FA</p>
                </div>
                <ToggleSwitch 
                  checked={user?.preferences?.mfa ?? false} 
                  onChange={() => handlePreferenceToggle('mfa', !(user?.preferences?.mfa ?? false))} 
                />
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <p className="text-white text-[14px] font-medium">Change Password</p>
                <input 
                  type="password" 
                  placeholder="Current password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#1A0A0B]/50 border border-white/10 rounded-[12px] py-2.5 px-3 text-[14px] text-white outline-none focus:border-[#D98F8F]" 
                />
                <input 
                  type="password" 
                  placeholder="New secure password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#1A0A0B]/50 border border-white/10 rounded-[12px] py-2.5 px-3 text-[14px] text-white outline-none focus:border-[#D98F8F]" 
                />
                <button 
                  type="submit" 
                  disabled={passwordLoading}
                  className="w-full bg-white/5 border border-white/10 text-white py-2.5 rounded-[12px] text-[13px] font-bold hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>

          </div>

          {/* ================= COLUMN 2 (Middle) ================= */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* TTN Master Integration Card */}
            {user?.role === 'ADMIN' && (
            <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-xl border border-[#D98F8F]/30 rounded-[24px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-[#D98F8F] rounded-full blur-[90px] opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none"></div>
              
              <div className="flex flex-col items-center mb-8 relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-[#1A0A0B] to-[#2D1B1C] border border-[#D98F8F]/50 rounded-[20px] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(217,143,143,0.2)]">
                   <Network className="text-[#D98F8F]" size={40} strokeWidth={1.5} />
                </div>
                <h2 className="text-[28px] font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] to-[#D98F8F]">TTN</h2>
                <div className="bg-[#4CAF50]/10 border border-[#4CAF50]/30 text-[#4CAF50] px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mt-3 flex items-center gap-1.5 shadow-[0_0_15px_rgba(76,175,80,0.2)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] animate-pulse"></span> Connected
                </div>
              </div>

              <div className="space-y-5 relative z-10">
                <div>
                  <label className="text-[#A69697] text-[12px] block mb-1">TTN Account ID</label>
                  <input 
                    type="text" 
                    value={ttnAccountId}
                    onChange={(e) => setTtnAccountId(e.target.value)}
                    onBlur={handleIntegrationsSave}
                    placeholder="Enter Account ID"
                    className="w-full bg-[#1A0A0B]/80 border border-white/10 rounded-[12px] py-3 px-4 text-[14px] text-white outline-none font-mono focus:border-[#D98F8F]" 
                  />
                </div>
                <div>
                  <label className="text-[#A69697] text-[12px] block mb-1">Integration Key</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      value={ttnIntegrationKey}
                      onChange={(e) => setTtnIntegrationKey(e.target.value)}
                      onBlur={handleIntegrationsSave}
                      placeholder="Enter API Key"
                      className="w-full bg-[#1A0A0B]/80 border border-white/10 rounded-[12px] py-3 pl-4 pr-10 text-[14px] text-white outline-none font-mono tracking-widest focus:border-[#D98F8F]" 
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A69697] hover:text-[#D98F8F] transition-colors">
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* Notification Preferences */}
            <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.08)] rounded-[24px] p-6 shadow-lg">
              <h3 className="text-[#FFFFFF] text-[16px] font-bold flex items-center gap-2 mb-6">
                <Bell className="text-[#D98F8F]" size={18} /> Notification Preferences
              </h3>

              <div className="flex justify-end gap-6 mb-4 pr-2">
                <span className="text-[#A69697] text-[11px] uppercase tracking-wider font-bold">Email</span>
                <span className="text-[#A69697] text-[11px] uppercase tracking-wider font-bold">In-App</span>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Invoice Alerts', key: 'invoiceAlerts' },
                  { label: 'System Updates', key: 'systemUpdates' },
                  { label: 'Direct Mentions', key: 'directMentions' },
                  { label: 'Weekly Reports', key: 'weeklyReports' },
                ].map((notif, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <span className="text-white text-[14px]">{notif.label}</span>
                    <div className="flex items-center gap-8">
                      <ToggleSwitch 
                        checked={getNotif(notif.key, 'email')} 
                        onChange={() => handlePreferenceToggle(notif.key, !getNotif(notif.key, 'email'), 'email')} 
                      />
                      <ToggleSwitch 
                        checked={getNotif(notif.key, 'inApp')} 
                        onChange={() => handlePreferenceToggle(notif.key, !getNotif(notif.key, 'inApp'), 'inApp')} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Theme & Company Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.08)] rounded-[20px] p-5 shadow-lg flex flex-col justify-center items-center">
                <Palette className="text-[#A69697] mb-3" size={20} />
                <p className="text-white text-[13px] font-medium mb-3">System Theme</p>
                <div className="flex bg-[#1A0A0B] p-1 rounded-full border border-white/5">
                  <button 
                    className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all ${theme === 'dark' ? 'bg-[#8E1B3A]/40 text-[#D98F8F]' : 'text-[#A69697]'}`} 
                    onClick={() => toggleTheme('dark')}
                  >
                    Dark
                  </button>
                  <button 
                    className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all ${theme === 'light' ? 'bg-[#8E1B3A]/40 text-[#D98F8F]' : 'text-[#A69697]'}`} 
                    onClick={() => toggleTheme('light')}
                  >
                    Light
                  </button>
                </div>
              </div>

              {user?.role === 'ADMIN' && (
              <div 
                onClick={() => setIsCompanyModalOpen(true)}
                className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.08)] rounded-[20px] p-5 shadow-lg flex flex-col justify-center items-center cursor-pointer hover:border-[#D98F8F]/30 transition-colors"
              >
                <Building className="text-[#A69697] mb-3" size={20} />
                <p className="text-white text-[13px] font-medium mb-1 truncate text-center w-full">{user?.companyDetails?.name || 'Company Details'}</p>
                <p className="text-[#D98F8F] text-[11px]">Edit Tax ID & Name <ChevronRight size={12} className="inline"/></p>
              </div>
              )}
            </div>

          </div>

          {/* ================= COLUMN 3 (Right) ================= */}
          {user?.role === 'ADMIN' && (
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* API Keys Management */}
            <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.08)] rounded-[24px] p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[#FFFFFF] text-[16px] font-bold flex items-center gap-2">
                  <Key className="text-[#D98F8F]" size={18} /> API Keys
                </h3>
                <button onClick={generateApiKey} className="bg-white/5 border border-white/10 text-white px-3 py-1.5 rounded-[8px] text-[11px] font-bold hover:bg-white/10 transition-colors">
                  Generate Key
                </button>
              </div>

              <div className="space-y-3">
                {user?.apiKeys?.map((k: any, i: number) => (
                  <div key={i} className="bg-[#1A0A0B]/50 border border-white/5 rounded-[12px] p-3 flex justify-between items-center group cursor-pointer hover:border-white/20 transition-colors">
                    <div>
                      <p className="text-white text-[13px] font-medium">{k.name}</p>
                      <p className="text-[#A69697] text-[11px] font-mono mt-0.5">{k.key.substring(0,12)}...</p>
                    </div>
                    <button onClick={() => {navigator.clipboard.writeText(k.key); toast.success('Key copied!');}}><Copy size={16} className="text-[#A69697] hover:text-white transition-colors" /></button>
                  </div>
                ))}
                {(!user?.apiKeys || user.apiKeys.length === 0) && (
                  <p className="text-[#A69697] text-[13px] text-center py-4">No API Keys generated yet.</p>
                )}
              </div>
            </div>

            {/* Billing and Subscription */}
            <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.08)] rounded-[24px] p-6 shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D98F8F] to-[#8E1B3A] rounded-full blur-[60px] opacity-20 pointer-events-none"></div>
              
              <h3 className="text-[#FFFFFF] text-[16px] font-bold flex items-center gap-2 mb-6">
                <CreditCard className="text-[#D98F8F]" size={18} /> Billing & Subscriptions
              </h3>

              <div className="mb-6">
                <p className="text-[#D98F8F] text-[11px] font-bold uppercase tracking-wider mb-1">Current Plan</p>
                <div className="flex items-end justify-between">
                  <h2 className="text-white text-[24px] font-bold leading-none">{user?.billing?.plan || 'Pro Quarterly'}</h2>
                  <span className="text-[#A69697] text-[13px]">Renews {user?.billing?.renewalDate ? new Date(user.billing.renewalDate).toLocaleDateString() : 'Nov 1'}</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between text-[12px] mb-2">
                    <span className="text-white">AI Vision Scans</span>
                    <span className="text-[#A69697]">{user?.billing?.aiScansUsed || 0} / {user?.billing?.aiScansLimit || 5000}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1A0A0B] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] rounded-full"
                      style={{ width: `${Math.min(100, ((user?.billing?.aiScansUsed || 0) / (user?.billing?.aiScansLimit || 5000)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-[12px] mb-2">
                    <span className="text-white">Data Storage</span>
                    <span className="text-[#A69697]">{user?.billing?.storageUsedGB || 0}GB / {user?.billing?.storageLimitGB || 50}GB</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1A0A0B] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] rounded-full"
                      style={{ width: `${Math.min(100, ((user?.billing?.storageUsedGB || 0) / (user?.billing?.storageLimitGB || 50)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <button className="w-full py-3 rounded-[12px] bg-white/5 border border-white/10 text-white text-[13px] font-bold hover:bg-white/10 transition-colors">
                View Detailed Invoices
              </button>
            </div>

            {/* Connected Services */}
            <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.08)] rounded-[24px] p-6 shadow-lg">
              <h3 className="text-[#FFFFFF] text-[16px] font-bold flex items-center gap-2 mb-6">
                <LinkIcon className="text-[#D98F8F]" size={18} /> Connected Services
              </h3>

              <div className="space-y-3">
                <div className="bg-[#1A0A0B]/50 border border-white/5 rounded-[12px] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[8px] bg-white flex items-center justify-center p-1.5">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg" alt="Slack" className="w-full h-full" />
                    </div>
                    <div>
                      <p className="text-white text-[14px] font-bold">Slack</p>
                      <p className="text-[#A69697] text-[11px]">Notifications</p>
                    </div>
                  </div>
                  <button onClick={() => toggleIntegrationActive('slackActive')}>
                    {user?.integrations?.slackActive ? (
                      <span className="bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30 px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase">Active</span>
                    ) : (
                      <span className="bg-white/10 text-[#A69697] border border-white/20 px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase hover:bg-white/20 transition-colors">Connect</span>
                    )}
                  </button>
                </div>

                <div className="bg-[#1A0A0B]/50 border border-white/5 rounded-[12px] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[8px] bg-white flex items-center justify-center p-1.5">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/9/9c/Intuit_QuickBooks_logo.svg" alt="Quickbooks" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="text-white text-[14px] font-bold">Quickbooks</p>
                      <p className="text-[#A69697] text-[11px]">Accounting Sync</p>
                    </div>
                  </div>
                  <button onClick={() => toggleIntegrationActive('quickbooksActive')}>
                    {user?.integrations?.quickbooksActive ? (
                      <span className="bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30 px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase">Active</span>
                    ) : (
                      <span className="bg-white/10 text-[#A69697] border border-white/20 px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase hover:bg-white/20 transition-colors">Connect</span>
                    )}
                  </button>
                </div>
              </div>
            </div>

          </div>
          )}

        </div>

        {/* Company Modal */}
        {isCompanyModalOpen && user?.role === 'ADMIN' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#1A0A0B] border border-white/10 rounded-[24px] w-full max-w-[400px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#D98F8F] to-transparent"></div>
              
              <form onSubmit={handleCompanySave} className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white text-[20px] font-bold">Company Details</h3>
                  <button type="button" onClick={() => setIsCompanyModalOpen(false)} className="text-[#A69697] hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[#A69697] text-[13px] block mb-1">Company Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Acme Corp" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-[12px] py-3 px-4 text-[14px] text-white outline-none focus:border-[#D98F8F] transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="text-[#A69697] text-[13px] block mb-1">Tax ID / Matricule Fiscal</label>
                    <input 
                      type="text" 
                      placeholder="e.g. TN123456789" 
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-[12px] py-3 px-4 text-[14px] text-white outline-none focus:border-[#D98F8F] transition-colors" 
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button type="button" onClick={() => setIsCompanyModalOpen(false)} className="flex-1 py-3 rounded-[12px] bg-white/5 text-white font-medium hover:bg-white/10 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-3 rounded-[12px] bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white font-bold shadow-lg hover:shadow-[0_0_15px_rgba(217,143,143,0.4)] transition-all">
                    Save Details
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
