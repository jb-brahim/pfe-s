'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { User, Lock, Bell, Palette, Building, CreditCard, Key, Link as LinkIcon, Save, Copy, CheckCircle2, ChevronRight, Hexagon, Network } from 'lucide-react';

export default function SettingsPage() {
  const [theme, setTheme] = useState('dark');

  // Helper for custom Toggle Switch
  const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <div 
      className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${checked ? 'bg-[#D98F8F]' : 'bg-white/10'}`}
      onClick={onChange}
    >
      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 w-full pb-10 max-w-[1600px] mx-auto">
        
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
                  <User className="text-[#D98F8F]" size={18} /> Profile
                </h3>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" className="w-16 h-16 rounded-full border-2 border-[#D98F8F]/50 shadow-[0_0_15px_rgba(217,143,143,0.3)]" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#4CAF50] border-2 border-[#1A0A0B] rounded-full"></div>
                </div>
                <div>
                  <p className="text-white font-bold text-[16px]">Eleanor Pena</p>
                  <p className="text-[#A69697] text-[12px]">Change Avatar</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[#A69697] text-[12px] block mb-1">Full Name</label>
                  <input type="text" defaultValue="Eleanor Pena" className="w-full bg-[#1A0A0B]/50 border border-white/10 rounded-[12px] py-2.5 px-3 text-[14px] text-white outline-none focus:border-[#D98F8F] transition-colors" />
                </div>
                <div>
                  <label className="text-[#A69697] text-[12px] block mb-1">Email</label>
                  <input type="email" defaultValue="eleanorPena@gmail.com" className="w-full bg-[#1A0A0B]/50 border border-white/10 rounded-[12px] py-2.5 px-3 text-[14px] text-white outline-none focus:border-[#D98F8F] transition-colors" />
                </div>
                <div>
                  <label className="text-[#A69697] text-[12px] block mb-1">Title</label>
                  <select className="w-full bg-[#1A0A0B]/50 border border-white/10 rounded-[12px] py-2.5 px-3 text-[14px] text-white outline-none focus:border-[#D98F8F] transition-colors appearance-none">
                    <option>Finance Manager</option>
                    <option>Admin</option>
                    <option>Analyst</option>
                  </select>
                </div>
                <button className="w-full mt-2 bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white py-3 rounded-[12px] font-bold shadow-[0_0_15px_rgba(142,27,58,0.4)] hover:shadow-[0_0_25px_rgba(217,143,143,0.5)] transition-all flex items-center justify-center gap-2">
                  <Save size={16} /> Save Changes
                </button>
              </div>
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
                <ToggleSwitch checked={true} onChange={() => {}} />
              </div>

              <div className="space-y-4">
                <p className="text-white text-[14px] font-medium">Change Password</p>
                <input type="password" placeholder="Current password" className="w-full bg-[#1A0A0B]/50 border border-white/10 rounded-[12px] py-2.5 px-3 text-[14px] text-white outline-none focus:border-[#D98F8F]" />
                <input type="password" placeholder="New secure password" className="w-full bg-[#1A0A0B]/50 border border-white/10 rounded-[12px] py-2.5 px-3 text-[14px] text-white outline-none focus:border-[#D98F8F]" />
              </div>

              <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-[#A69697] text-[12px] mb-1">Login Session Management</p>
                <p className="text-white text-[13px]">Active Sessions: <span className="font-bold text-[#D98F8F]">1</span></p>
              </div>
            </div>

          </div>


          {/* ================= COLUMN 2 (Middle) ================= */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* TTN Master Integration Card */}
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
                  <input type="text" readOnly defaultValue="12234566867" className="w-full bg-[#1A0A0B]/80 border border-white/10 rounded-[12px] py-3 px-4 text-[14px] text-white outline-none cursor-default font-mono" />
                </div>
                <div>
                  <label className="text-[#A69697] text-[12px] block mb-1">Integration Key</label>
                  <div className="relative">
                    <input type="password" readOnly defaultValue="************************" className="w-full bg-[#1A0A0B]/80 border border-white/10 rounded-[12px] py-3 pl-4 pr-10 text-[14px] text-white outline-none cursor-default font-mono tracking-widest" />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A69697] hover:text-[#D98F8F] transition-colors">
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

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
                  { label: 'Invoice Alerts', email: true, app: true },
                  { label: 'System Updates', email: false, app: true },
                  { label: 'Direct Mentions', email: true, app: true },
                  { label: 'Weekly Reports', email: true, app: false },
                ].map((notif, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <span className="text-white text-[14px]">{notif.label}</span>
                    <div className="flex items-center gap-8">
                      <ToggleSwitch checked={notif.email} onChange={() => {}} />
                      <ToggleSwitch checked={notif.app} onChange={() => {}} />
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
                  <button className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all ${theme === 'dark' ? 'bg-[#8E1B3A]/40 text-[#D98F8F]' : 'text-[#A69697]'}`} onClick={() => setTheme('dark')}>Dark</button>
                  <button className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all ${theme === 'light' ? 'bg-[#8E1B3A]/40 text-[#D98F8F]' : 'text-[#A69697]'}`} onClick={() => setTheme('light')}>Light</button>
                </div>
              </div>

              <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.08)] rounded-[20px] p-5 shadow-lg flex flex-col justify-center items-center cursor-pointer hover:border-[#D98F8F]/30 transition-colors">
                <Building className="text-[#A69697] mb-3" size={20} />
                <p className="text-white text-[13px] font-medium mb-1">Company Details</p>
                <p className="text-[#D98F8F] text-[11px]">Edit Tax ID & Name <ChevronRight size={12} className="inline"/></p>
              </div>
            </div>

          </div>


          {/* ================= COLUMN 3 (Right) ================= */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* API Keys Management */}
            <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.08)] rounded-[24px] p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[#FFFFFF] text-[16px] font-bold flex items-center gap-2">
                  <Key className="text-[#D98F8F]" size={18} /> API Keys
                </h3>
                <button className="bg-white/5 border border-white/10 text-white px-3 py-1.5 rounded-[8px] text-[11px] font-bold hover:bg-white/10 transition-colors">
                  Generate Key
                </button>
              </div>

              <div className="space-y-3">
                <div className="bg-[#1A0A0B]/50 border border-white/5 rounded-[12px] p-3 flex justify-between items-center group cursor-pointer hover:border-white/20 transition-colors">
                  <div>
                    <p className="text-white text-[13px] font-medium">Core Finance API</p>
                    <p className="text-[#A69697] text-[11px] font-mono mt-0.5">sk_live_****892a</p>
                  </div>
                  <ChevronRight size={16} className="text-[#A69697] group-hover:text-white transition-colors" />
                </div>
                
                <div className="bg-[#1A0A0B]/50 border border-white/5 rounded-[12px] p-3 flex justify-between items-center group cursor-pointer hover:border-white/20 transition-colors">
                  <div>
                    <p className="text-white text-[13px] font-medium">n8n Ingestion Webhook</p>
                    <p className="text-[#A69697] text-[11px] font-mono mt-0.5">sk_test_****104f</p>
                  </div>
                  <ChevronRight size={16} className="text-[#A69697] group-hover:text-white transition-colors" />
                </div>
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
                  <h2 className="text-white text-[24px] font-bold leading-none">Pro Quarterly</h2>
                  <span className="text-[#A69697] text-[13px]">Renews Nov 1</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between text-[12px] mb-2">
                    <span className="text-white">AI Vision Scans</span>
                    <span className="text-[#A69697]">1,240 / 5,000</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1A0A0B] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] w-[25%] rounded-full"></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-[12px] mb-2">
                    <span className="text-white">Data Storage</span>
                    <span className="text-[#A69697]">12GB / 50GB</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1A0A0B] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] w-[24%] rounded-full"></div>
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
                  <span className="bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30 px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase">Active</span>
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
                  <span className="bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30 px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase">Active</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
