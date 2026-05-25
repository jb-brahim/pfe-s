'use client';

import { useState, useEffect } from 'react';
import { Save, Shield, Bell, Key, Database, Globe, Check, Loader } from 'lucide-react';
import axios from 'axios';

export default function SettingsPage() {
  const [platformName, setPlatformName] = useState("Aura Finance");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowPublicRegistration, setAllowPublicRegistration] = useState(true);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get('http://localhost:5000/api/super-admin/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.success && res.data.data) {
          setPlatformName(res.data.data.platformName);
          setMaintenanceMode(res.data.data.maintenanceMode);
          setAllowPublicRegistration(res.data.data.allowPublicRegistration);
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
      await axios.put('http://localhost:5000/api/super-admin/settings', {
        platformName,
        maintenanceMode,
        allowPublicRegistration
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings.');
    } finally {
      setIsSaving(false);
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
        <span className="text-[13px] font-medium">Settings saved successfully</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[24px] font-semibold text-white tracking-tight mb-1">System Settings</h1>
          <p className="text-[13px] text-[#A69697]">
            Global configuration, security, and integration rules.
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-[12px] font-medium bg-white text-[#1A0A0B] hover:bg-white/90 transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader size={14} className="animate-spin"/> : <Save size={14} />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-56 flex-shrink-0 space-y-1">
          {[
            { name: 'General', icon: Globe, active: true },
            { name: 'Security', icon: Shield, active: false },
            { name: 'Database', icon: Database, active: false },
            { name: 'API Keys', icon: Key, active: false },
            { name: 'Notifications', icon: Bell, active: false },
          ].map((item, i) => (
            <button 
              key={i} 
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[12px] transition-colors ${
                item.active
                  ? 'bg-white/10 text-white font-medium border border-white/5'
                  : 'text-[#A69697] hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <item.icon size={14} className={item.active ? 'text-white' : 'text-inherit'} />
              {item.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-4">
          <div className={cardClasses}>
            <h2 className="text-[14px] font-semibold text-white mb-5 border-b border-white/5 pb-3">
              Platform General Settings
            </h2>
            
            <div className="space-y-5 max-w-lg">
              <div>
                <label className="block text-[11px] font-medium text-[#A69697] mb-1.5 uppercase tracking-wider">Platform Name</label>
                <input 
                  type="text" 
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border outline-none text-[12px] transition-colors bg-[#1E0A0B] border-white/5 text-white focus:border-[#D98F8F]/50"
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-medium text-[#A69697] mb-1.5 uppercase tracking-wider">Maintenance Mode</label>
                <div 
                  className="px-4 py-3 rounded-md border border-white/5 bg-[#1E0A0B] flex items-center justify-between cursor-pointer group"
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                >
                  <div>
                    <p className="font-medium text-[12px] text-white">Enable Maintenance</p>
                    <p className="text-[11px] text-[#A69697] mt-0.5">Locks out all non-system administrators.</p>
                  </div>
                  {/* Toggle Switch */}
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${maintenanceMode ? 'bg-[#D98F8F]' : 'bg-white/10'}`}>
                    <div className={`w-3 h-3 rounded-full transition-transform ${maintenanceMode ? 'translate-x-4 bg-[#1E0A0B]' : 'translate-x-0 bg-[#A69697]'}`}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={cardClasses}>
            <h2 className="text-[14px] font-semibold text-white mb-5 border-b border-white/5 pb-3">
              Tenant Registration
            </h2>
            
            <div className="space-y-5 max-w-lg">
              <div className="flex items-start justify-between cursor-pointer group" onClick={() => setAllowPublicRegistration(!allowPublicRegistration)}>
                <div>
                  <p className="font-medium text-[12px] text-white">Allow Public Registration</p>
                  <p className="text-[11px] text-[#A69697] mt-0.5">Enables the public signup page for new tenants.</p>
                </div>
                {/* Toggle Switch */}
                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${allowPublicRegistration ? 'bg-green-500/40 border border-green-500/50' : 'bg-white/10 border border-transparent'}`}>
                  <div className={`w-3 h-3 rounded-full transition-transform ${allowPublicRegistration ? 'translate-x-4 bg-green-400' : 'translate-x-0 bg-[#A69697]'}`}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
