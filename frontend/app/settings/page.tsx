'use client';

import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { authAPI, userAPI } from '@/lib/api';
import { toast } from 'sonner';
import { User as UserIcon, Lock, Bell, Key, Link as LinkIcon, Save, CheckCircle2, ChevronRight, Network, X, Copy } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications' | 'integrations'>('general');
  const profileInputRef = useRef<HTMLInputElement>(null);

  // Profile fields state
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileRole, setProfileRole] = useState('');

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
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
      
      // Deep clone to avoid mutating React state directly
      let updatedPrefs = JSON.parse(JSON.stringify(currentPrefs));

      if (key === 'darkMode' || key === 'mfa') {
        updatedPrefs[key] = value;
      } else if (subKey) {
        // Notification updates
        const notifObj = updatedPrefs.notifications || {} as any;
        if (!notifObj[key]) notifObj[key] = { email: true, inApp: true };
        notifObj[key][subKey] = value;
        updatedPrefs.notifications = notifObj;
      }

      // Optimistic Update: Make the UI feel responsive instantly
      updateUser({ preferences: updatedPrefs });
      if (key === 'darkMode') {
        document.documentElement.classList.toggle('theme-light', !value);
      }

      const res = await authAPI.updatePreferences(updatedPrefs);
      if (res.data) {
        // Confirm with server data
        updateUser({ preferences: res.data.preferences });
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

  useEffect(() => {
    if (passwordUpdated) {
      const timer = setTimeout(() => setPasswordUpdated(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [passwordUpdated]);

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
      setPasswordUpdated(true);
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
          <p className="text-[#A69697] text-[15px]">Manage your profile, security, and integrations preferences.</p>
        </div>

        {/* TAB NAVIGATION & CONTENT */}
        <div className="flex flex-col md:flex-row gap-8 mt-6">
          
          {/* Sidebar Nav */}
          <div className="w-full md:w-[240px] shrink-0">
            <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.05)] rounded-[20px] p-2 flex flex-col gap-1">
              {[
                { id: 'general', label: 'General', icon: <UserIcon size={16} /> },
                { id: 'security', label: 'Security', icon: <Lock size={16} /> },
                { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
                ...(user?.role === 'ADMIN' ? [
                  { id: 'integrations', label: 'Integrations', icon: <Network size={16} /> }
                ] : [])
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#D98F8F]/20 to-transparent text-[#FFFFFF] border-l-2 border-[#D98F8F]'
                      : 'text-[#A69697] hover:text-[#FFFFFF] hover:bg-white/5 border-l-2 border-transparent'
                  }`}
                >
                  <span className={activeTab === tab.id ? 'text-[#D98F8F]' : 'text-[#A69697]'}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 max-w-[800px]">
            
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="flex flex-col gap-6">
                
                {/* Profile Settings */}
                <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.05)] rounded-[24px] p-6 shadow-lg">
                  <h3 className="text-[#FFFFFF] text-[16px] font-bold mb-6">Profile Information</h3>
                  
                  <div className="flex items-center gap-6 mb-8">
                    <div 
                      className="relative cursor-pointer group"
                      onClick={() => profileInputRef.current?.click()}
                    >
                      {user?.profileImage ? (
                        <img 
                          src={`http://localhost:5000/${user.profileImage}`} 
                          alt="Profile" 
                          className="w-20 h-20 rounded-full border-2 border-[#D98F8F]/50 shadow-[0_0_15px_rgba(217,143,143,0.2)] object-cover group-hover:opacity-70 transition-opacity" 
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full border-2 border-[#D98F8F]/50 shadow-[0_0_15px_rgba(217,143,143,0.2)] bg-[#1A0A0B] flex items-center justify-center group-hover:opacity-70 transition-opacity text-[#A69697]">
                          <UserIcon size={32} />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-[11px] font-bold bg-black/50 px-3 py-1 rounded-full">Edit</span>
                      </div>
                      <input type="file" accept="image/*" ref={profileInputRef} onChange={handleProfileImageUpload} className="hidden" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-[18px]">{user?.name || 'User'}</p>
                      <p className="text-[#A69697] text-[13px] mt-1">{user?.role === 'ADMIN' ? 'Administrator' : 'Accountant'} • Member Since 2026</p>
                    </div>
                  </div>

                  <form onSubmit={handleProfileSave} className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[#A69697] text-[12px] block mb-1">Full Name</label>
                      <input 
                        type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-[#1A0A0B]/50 border border-white/10 rounded-[12px] py-2.5 px-3 text-[14px] text-white outline-none focus:border-[#D98F8F]" 
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[#A69697] text-[12px] block mb-1">Email</label>
                      <input 
                        type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full bg-[#1A0A0B]/50 border border-white/10 rounded-[12px] py-2.5 px-3 text-[14px] text-white outline-none focus:border-[#D98F8F]" 
                      />
                    </div>
                    <div className="col-span-2 flex justify-end mt-2">
                      <button type="submit" className="bg-white/10 text-white px-5 py-2.5 rounded-[12px] text-[13px] font-bold hover:bg-white/20 transition-colors flex items-center gap-2">
                        <Save size={16} /> Save Changes
                      </button>
                    </div>
                  </form>
                </div>



              </div>
            )}


            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="flex flex-col gap-6">
                <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.05)] rounded-[24px] p-6 shadow-lg">
                  {passwordUpdated && (
                    <div className="mb-4 p-3 bg-[#4CAF50]/20 border border-[#4CAF50]/50 rounded-[12px] text-[#4CAF50] font-medium">
                      Password has been updated successfully.
                    </div>
                  )}
                  <h3 className="text-[#FFFFFF] text-[16px] font-bold mb-6">Security & Authentication</h3>



                  <h4 className="text-white text-[14px] font-medium mb-4">Change Password</h4>
                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <input 
                      type="password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-[#1A0A0B]/50 border border-white/10 rounded-[12px] py-2.5 px-3 text-[14px] text-white outline-none focus:border-[#D98F8F]" 
                    />
                    <input 
                      type="password" placeholder="New secure password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#1A0A0B]/50 border border-white/10 rounded-[12px] py-2.5 px-3 text-[14px] text-white outline-none focus:border-[#D98F8F]" 
                    />
                    <button 
                      type="submit" disabled={passwordLoading}
                      className="bg-white/10 text-white px-5 py-2.5 rounded-[12px] text-[13px] font-bold hover:bg-white/20 transition-colors disabled:opacity-50 mt-2"
                    >
                      {passwordLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              </div>
            )}


            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="flex flex-col gap-6">
                <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.05)] rounded-[24px] p-6 shadow-lg">
                  <h3 className="text-[#FFFFFF] text-[16px] font-bold mb-6">Notification Preferences</h3>

                  <div className="flex justify-end gap-10 mb-4 pr-6">
                    <span className="text-[#A69697] text-[11px] uppercase tracking-wider font-bold">Email</span>
                    <span className="text-[#A69697] text-[11px] uppercase tracking-wider font-bold">In-App</span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { label: 'Invoice Alerts', desc: 'When invoices are assigned to you or approved', key: 'invoiceAlerts' },
                      { label: 'System Updates', desc: 'Platform maintenance and feature releases', key: 'systemUpdates' },
                      { label: 'Direct Mentions', desc: 'When someone mentions you in a comment', key: 'directMentions' },
                      { label: 'Weekly Reports', desc: 'Summary of your processing metrics', key: 'weeklyReports' },
                    ].map((notif, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-[16px] hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-colors">
                        <div>
                          <p className="text-white text-[14px] font-medium">{notif.label}</p>
                          <p className="text-[#A69697] text-[12px] mt-0.5">{notif.desc}</p>
                        </div>
                        <div className="flex items-center gap-12 pr-6">
                          <ToggleSwitch checked={getNotif(notif.key, 'email')} onChange={() => handlePreferenceToggle(notif.key, !getNotif(notif.key, 'email'), 'email')} />
                          <ToggleSwitch checked={getNotif(notif.key, 'inApp')} onChange={() => handlePreferenceToggle(notif.key, !getNotif(notif.key, 'inApp'), 'inApp')} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}


            {/* INTEGRATIONS TAB */}
            {activeTab === 'integrations' && user?.role === 'ADMIN' && (
              <div className="flex flex-col gap-6">
                
                {/* TTN Setup */}
                <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.05)] rounded-[24px] p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-[#FFFFFF] text-[16px] font-bold">TTN Network Integration</h3>
                      <p className="text-[#A69697] text-[12px] mt-1">Connect to the national e-invoicing network</p>
                    </div>
                    <div className="w-12 h-12 bg-[#1A0A0B] rounded-[12px] flex items-center justify-center border border-white/5">
                      <Network className="text-[#D98F8F]" size={24} />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[#A69697] text-[12px] block mb-1">TTN Account ID</label>
                      <input 
                        type="text" value={ttnAccountId} onChange={(e) => setTtnAccountId(e.target.value)} onBlur={handleIntegrationsSave} placeholder="Enter Account ID"
                        className="w-full bg-[#1A0A0B]/80 border border-white/10 rounded-[12px] py-2.5 px-4 text-[14px] text-white outline-none font-mono focus:border-[#D98F8F]" 
                      />
                    </div>
                    <div>
                      <label className="text-[#A69697] text-[12px] block mb-1">Integration API Key</label>
                      <div className="relative">
                        <input 
                          type="password" value={ttnIntegrationKey} onChange={(e) => setTtnIntegrationKey(e.target.value)} onBlur={handleIntegrationsSave} placeholder="Enter API Key"
                          className="w-full bg-[#1A0A0B]/80 border border-white/10 rounded-[12px] py-2.5 pl-4 pr-10 text-[14px] text-white outline-none font-mono tracking-widest focus:border-[#D98F8F]" 
                        />
                      </div>
                    </div>
                  </div>
                </div>


              </div>
            )}

          </div>
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
