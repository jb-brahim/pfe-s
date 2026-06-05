'use client';

import { useState, useEffect } from 'react';
import { Save, Key, Globe, Check, Loader } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '@/lib/i18n-context';

export default function SettingsPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('General');

  // General Settings
  const [platformName, setPlatformName] = useState("Aura Finance");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Security
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(`${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}/api/super-admin/settings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.success && res.data.data) {
          const d = res.data.data;
          if (d.platformName) setPlatformName(d.platformName);
          if (d.maintenanceMode !== undefined) setMaintenanceMode(d.maintenanceMode);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const cardClasses = "bg-[#1A050A] border border-white/5 rounded-lg p-6";

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}/api/super-admin/settings`, {
        platformName,
        maintenanceMode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMessage(t('superadmin.settings_page.toast_success'));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New passwords don't match");
      return;
    }
    setIsChangingPassword(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}/api/auth/change-password`, {
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage(t('superadmin.settings_page.password_success'));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error changing password:', error);
      alert(error.response?.data?.message || 'Failed to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader className="animate-spin text-[#D98F8F]" /></div>;
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl relative">
      
      {/* Toast Notification */}
      <div className={`fixed top-6 right-6 bg-[#4ADE80]/10 border border-[#4ADE80]/30 text-[#4ADE80] px-4 py-3 rounded-lg flex items-center gap-2 shadow-xl transition-all duration-300 z-50 ${showSuccess ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0 pointer-events-none'}`}>
        <div className="w-5 h-5 rounded-full bg-[#4ADE80] flex items-center justify-center">
          <Check size={12} className="text-black" />
        </div>
        <span className="text-[13px] font-medium">{successMessage}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[24px] font-semibold text-white tracking-tight mb-1">{t('superadmin.settings_page.title')}</h1>
          <p className="text-[13px] text-[#A69697]">
            {t('superadmin.settings_page.subtitle')}
          </p>
        </div>
        {activeTab === 'General' && (
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-[12px] font-medium bg-white text-[#1A0A0B] hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader size={14} className="animate-spin"/> : <Save size={14} />}
            {isSaving ? t('superadmin.settings_page.saving_btn') : t('superadmin.settings_page.save_btn')}
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-56 flex-shrink-0 space-y-1">
          {[
            { name: 'General', label: t('superadmin.settings_page.tab_general'), icon: Globe },
            { name: 'Security', label: t('superadmin.settings_page.tab_security'), icon: Key },
          ].map((item, i) => (
            <button 
              key={i} 
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[12px] transition-colors ${
                activeTab === item.name
                  ? 'bg-white/10 text-white font-medium border border-white/5'
                  : 'text-[#A69697] hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <item.icon size={14} className={activeTab === item.name ? 'text-white' : 'text-inherit'} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-4">
          
          {activeTab === 'General' && (
            <div className={cardClasses}>
              <h2 className="text-[14px] font-semibold text-white mb-5 border-b border-white/5 pb-3">
                {t('superadmin.settings_page.general_title')}
              </h2>
              <div className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-[11px] font-medium text-[#A69697] mb-1.5 uppercase tracking-wider">{t('superadmin.settings_page.platform_name')}</label>
                  <input 
                    type="text" 
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border outline-none text-[12px] transition-colors bg-[#1E0A0B] border-white/5 text-white focus:border-[#D98F8F]/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#A69697] mb-1.5 uppercase tracking-wider">{t('superadmin.settings_page.maintenance_mode')}</label>
                  <div 
                    className="px-4 py-3 rounded-md border border-white/5 bg-[#1E0A0B] flex items-center justify-between cursor-pointer group"
                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                  >
                    <div>
                      <p className="font-medium text-[12px] text-white">{t('superadmin.settings_page.enable_maintenance')}</p>
                      <p className="text-[11px] text-[#A69697] mt-0.5">{t('superadmin.settings_page.maintenance_desc')}</p>
                    </div>
                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${maintenanceMode ? 'bg-[#D98F8F]' : 'bg-white/10'}`}>
                      <div className={`w-3 h-3 rounded-full transition-transform ${maintenanceMode ? 'translate-x-4 bg-[#1E0A0B]' : 'translate-x-0 bg-[#A69697]'}`}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Security' && (
            <div className={cardClasses}>
              <h2 className="text-[14px] font-semibold text-white mb-5 border-b border-white/5 pb-3">
                {t('superadmin.settings_page.change_password')}
              </h2>
              <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                <div>
                  <label className="block text-[11px] font-medium text-[#A69697] mb-1.5 uppercase tracking-wider">{t('superadmin.settings_page.new_password')}</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-3 py-2 rounded-md border outline-none text-[12px] transition-colors bg-[#1E0A0B] border-white/5 text-white focus:border-[#D98F8F]/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#A69697] mb-1.5 uppercase tracking-wider">{t('superadmin.settings_page.confirm_password')}</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-3 py-2 rounded-md border outline-none text-[12px] transition-colors bg-[#1E0A0B] border-white/5 text-white focus:border-[#D98F8F]/50"
                  />
                </div>
                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={isChangingPassword}
                    className="flex items-center gap-2 px-4 py-2 rounded-md text-[12px] font-medium bg-[#D98F8F] text-[#1A0A0B] hover:bg-[#D98F8F]/90 transition-colors disabled:opacity-50"
                  >
                    {isChangingPassword ? <Loader size={14} className="animate-spin"/> : <Key size={14} />}
                    {t('superadmin.settings_page.update_password')}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
