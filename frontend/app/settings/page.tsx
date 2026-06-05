'use client';

import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { authAPI, userAPI } from '@/lib/api';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n-context';
import { User as UserIcon, Lock, Bell, Key, Link as LinkIcon, Save, CheckCircle2, ChevronRight, Network, X, Copy } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
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
  
  // Checkout Modal State removed (moved to Subscription page)

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
      toast.error(t('settings.toast.name_email_req'));
      return;
    }
    try {
      const res = await authAPI.updateProfile(profileName, profileEmail);
      if (res.data) {
        updateUser({ name: res.data.name, email: res.data.email });
        toast.success(t('settings.toast.profile_success'));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('settings.toast.profile_failed'));
    }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await userAPI.uploadProfileImage(file);
      if (res.data) {
        updateUser({ profileImage: res.data.profileImage });
        toast.success(t('settings.toast.img_success'));
      }
    } catch (err: any) {
      toast.error(t('settings.toast.img_failed'));
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
      toast.error(err.response?.data?.message || t('settings.toast.pref_failed'));
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
      toast.error(t('settings.toast.pass_req'));
      return;
    }
    setPasswordLoading(true);
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      toast.success(t('settings.toast.pass_success'));
      setPasswordUpdated(true);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('settings.toast.pass_failed'));
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
        toast.success(t('settings.toast.integ_success'));
      }
    } catch (err) {
      toast.error(t('settings.toast.integ_failed'));
    }
  };

  const [telegramLoading, setTelegramLoading] = useState(false);

  const handleTelegramRequest = async () => {
    setTelegramLoading(true);
    try {
      await userAPI.requestTelegramLink();
      toast.success(t('settings.toast.telegram_success'));
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('settings.toast.telegram_failed'));
    } finally {
      setTelegramLoading(false);
    }
  };

  const toggleIntegrationActive = async (key: 'slackActive' | 'quickbooksActive') => {
    try {
      const current = user?.integrations?.[key] ?? false;
      const integrations = { ...user?.integrations, [key]: !current };
      const res = await userAPI.updateIntegrations(integrations);
      if (res.data) {
        updateUser({ integrations: res.data.integrations });
        toast.success(t('settings.toast.integ_status_success'));
      }
    } catch (err) {
      toast.error(t('settings.toast.integ_status_failed'));
    }
  };

  const handleCompanySave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await userAPI.updateCompanyDetails({ name: companyName, taxId });
      if (res.data) {
        updateUser({ companyDetails: res.data.companyDetails });
        toast.success(t('settings.toast.company_success'));
        setIsCompanyModalOpen(false);
      }
    } catch (err) {
      toast.error(t('settings.toast.company_failed'));
    }
  };

  const generateApiKey = async () => {
    try {
      const res = await userAPI.generateApiKey('New Gen API Key');
      if (res.data) {
        updateUser({ apiKeys: res.data.apiKeys });
        toast.success(t('settings.toast.api_success'));
      }
    } catch (err) {
      toast.error(t('settings.toast.api_failed'));
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
          <h1 className="text-[32px] font-bold tracking-tight mb-1 text-[#FFFFFF]">{t('settings.title')}</h1>
          <p className="text-[#A69697] text-[15px]">{t('settings.subtitle')}</p>
        </div>

        {/* TAB NAVIGATION & CONTENT */}
        <div className="flex flex-col md:flex-row gap-8 mt-6">
          
          {/* Sidebar Nav */}
          <div className="w-full md:w-[240px] shrink-0">
            <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.05)] rounded-[20px] p-2 flex flex-col gap-1">
              {[
                { id: 'general', label: t('settings.tabs.general'), icon: <UserIcon size={16} /> },
                { id: 'security', label: t('settings.tabs.security'), icon: <Lock size={16} /> },
                ...(user?.role === 'ADMIN' ? [
                  { id: 'notifications', label: t('settings.tabs.notifications'), icon: <Bell size={16} /> },
                  { id: 'integrations', label: t('settings.tabs.integrations'), icon: <Network size={16} /> }
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
                  <h3 className="text-[#FFFFFF] text-[16px] font-bold mb-6">{t('settings.profile.title')}</h3>
                  
                  <div className="flex items-center gap-6 mb-8">
                    <div 
                      className="relative cursor-pointer group"
                      onClick={() => profileInputRef.current?.click()}
                    >
                      {user?.profileImage ? (
                        <img 
                          src={`${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}/${user.profileImage}`} 
                          alt="Profile" 
                          className="w-20 h-20 rounded-full border-2 border-[#D98F8F]/50 shadow-[0_0_15px_rgba(217,143,143,0.2)] object-cover group-hover:opacity-70 transition-opacity" 
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full border-2 border-[#D98F8F]/50 shadow-[0_0_15px_rgba(217,143,143,0.2)] bg-[#1A0A0B] flex items-center justify-center group-hover:opacity-70 transition-opacity text-[#A69697]">
                          <UserIcon size={32} />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-[11px] font-bold bg-black/50 px-3 py-1 rounded-full">{t('settings.profile.edit')}</span>
                      </div>
                      <input type="file" accept="image/*" ref={profileInputRef} onChange={handleProfileImageUpload} className="hidden" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-[18px]">{user?.name || 'User'}</p>
                      <p className="text-[#A69697] text-[13px] mt-1">{user?.role === 'ADMIN' ? t('team.admin') : t('team.accountant')} • {t('settings.profile.member_since')}</p>
                    </div>
                  </div>

                  <form onSubmit={handleProfileSave} className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[#A69697] text-[12px] block mb-1">{t('settings.profile.full_name')}</label>
                      <input 
                        type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-[#1A0A0B]/50 border border-white/10 rounded-[12px] py-2.5 px-3 text-[14px] text-white outline-none focus:border-[#D98F8F]" 
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[#A69697] text-[12px] block mb-1">{t('settings.profile.email')}</label>
                      <input 
                        type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full bg-[#1A0A0B]/50 border border-white/10 rounded-[12px] py-2.5 px-3 text-[14px] text-white outline-none focus:border-[#D98F8F]" 
                      />
                    </div>
                    <div className="col-span-2 flex justify-end mt-2">
                      <button type="submit" className="bg-white/10 text-white px-5 py-2.5 rounded-[12px] text-[13px] font-bold hover:bg-white/20 transition-colors flex items-center gap-2">
                        <Save size={16} /> {t('settings.profile.save_changes')}
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
                      {t('settings.security.password_updated')}
                    </div>
                  )}
                  <h3 className="text-[#FFFFFF] text-[16px] font-bold mb-6">{t('settings.security.title')}</h3>



                  <h4 className="text-white text-[14px] font-medium mb-4">{t('settings.security.change_password')}</h4>
                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <input 
                      type="password" placeholder={t('settings.security.current_password')} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-[#1A0A0B]/50 border border-white/10 rounded-[12px] py-2.5 px-3 text-[14px] text-white outline-none focus:border-[#D98F8F]" 
                    />
                    <input 
                      type="password" placeholder={t('settings.security.new_password')} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#1A0A0B]/50 border border-white/10 rounded-[12px] py-2.5 px-3 text-[14px] text-white outline-none focus:border-[#D98F8F]" 
                    />
                    <button 
                      type="submit" disabled={passwordLoading}
                      className="bg-white/10 text-white px-5 py-2.5 rounded-[12px] text-[13px] font-bold hover:bg-white/20 transition-colors disabled:opacity-50 mt-2"
                    >
                      {passwordLoading ? t('settings.security.updating') : t('settings.security.update_password')}
                    </button>
                  </form>
                </div>
              </div>
            )}


            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="flex flex-col gap-6">
                <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.05)] rounded-[24px] p-6 shadow-lg">
                  <h3 className="text-[#FFFFFF] text-[16px] font-bold mb-6">{t('settings.notifications.title')}</h3>

                  <div className="flex justify-end gap-10 mb-4 pr-6">
                    <span className="text-[#A69697] text-[11px] uppercase tracking-wider font-bold">{t('settings.notifications.email')}</span>
                    <span className="text-[#A69697] text-[11px] uppercase tracking-wider font-bold">{t('settings.notifications.in_app')}</span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { label: t('settings.notifications.invoice_alerts'), desc: t('settings.notifications.invoice_alerts_desc'), key: 'invoiceAlerts' },
                      { label: t('settings.notifications.system_updates'), desc: t('settings.notifications.system_updates_desc'), key: 'systemUpdates' },
                      { label: t('settings.notifications.direct_mentions'), desc: t('settings.notifications.direct_mentions_desc'), key: 'directMentions' },
                      { label: t('settings.notifications.weekly_reports'), desc: t('settings.notifications.weekly_reports_desc'), key: 'weeklyReports' },
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
                      <h3 className="text-[#FFFFFF] text-[16px] font-bold">{t('settings.integrations.ttn_title')}</h3>
                      <p className="text-[#A69697] text-[12px] mt-1">{t('settings.integrations.ttn_desc')}</p>
                    </div>
                    <div className="w-12 h-12 bg-[#1A0A0B] rounded-[12px] flex items-center justify-center border border-white/5">
                      <Network className="text-[#D98F8F]" size={24} />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[#A69697] text-[12px] block mb-1">{t('settings.integrations.ttn_account_id')}</label>
                      <input 
                        type="text" value={ttnAccountId} onChange={(e) => setTtnAccountId(e.target.value)} onBlur={handleIntegrationsSave} placeholder={t('settings.integrations.ttn_account_id_placeholder')}
                        className="w-full bg-[#1A0A0B]/80 border border-white/10 rounded-[12px] py-2.5 px-4 text-[14px] text-white outline-none font-mono focus:border-[#D98F8F]" 
                      />
                    </div>
                    <div>
                      <label className="text-[#A69697] text-[12px] block mb-1">{t('settings.integrations.ttn_api_key')}</label>
                      <div className="relative">
                        <input 
                          type="password" value={ttnIntegrationKey} onChange={(e) => setTtnIntegrationKey(e.target.value)} onBlur={handleIntegrationsSave} placeholder={t('settings.integrations.ttn_api_key_placeholder')}
                          className="w-full bg-[#1A0A0B]/80 border border-white/10 rounded-[12px] py-2.5 pl-4 pr-10 text-[14px] text-white outline-none font-mono tracking-widest focus:border-[#D98F8F]" 
                        />
                      </div>
                    </div>
                  </div>
                </div>


                {/* Telegram Bot Setup */}
                <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.05)] rounded-[24px] p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[#FFFFFF] text-[16px] font-bold">{t('settings.integrations.telegram.title')}</h3>
                      <p className="text-[#A69697] text-[12px] mt-1">{t('settings.integrations.telegram.desc')}</p>
                    </div>
                    <button 
                      onClick={handleTelegramRequest}
                      disabled={telegramLoading}
                      className="bg-[#0088cc]/20 text-[#0088cc] border border-[#0088cc]/50 px-5 py-2.5 rounded-[12px] text-[13px] font-bold hover:bg-[#0088cc]/30 transition-colors disabled:opacity-50"
                    >
                      {telegramLoading ? t('settings.integrations.telegram.sending') : t('settings.integrations.telegram.request_link')}
                    </button>
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
                  <h3 className="text-white text-[20px] font-bold">{t('settings.company.title')}</h3>
                  <button type="button" onClick={() => setIsCompanyModalOpen(false)} className="text-[#A69697] hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[#A69697] text-[13px] block mb-1">{t('settings.company.name')}</label>
                    <input 
                      type="text" 
                      placeholder={t('settings.company.name_placeholder')} 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-[12px] py-3 px-4 text-[14px] text-white outline-none focus:border-[#D98F8F] transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="text-[#A69697] text-[13px] block mb-1">{t('settings.company.tax_id')}</label>
                    <input 
                      type="text" 
                      placeholder={t('settings.company.tax_id_placeholder')} 
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-[12px] py-3 px-4 text-[14px] text-white outline-none focus:border-[#D98F8F] transition-colors" 
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button type="button" onClick={() => setIsCompanyModalOpen(false)} className="flex-1 py-3 rounded-[12px] bg-white/5 text-white font-medium hover:bg-white/10 transition-colors">
                    {t('settings.company.cancel')}
                  </button>
                  <button type="submit" className="flex-1 py-3 rounded-[12px] bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white font-bold shadow-lg hover:shadow-[0_0_15px_rgba(217,143,143,0.4)] transition-all">
                    {t('settings.company.save_details')}
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
