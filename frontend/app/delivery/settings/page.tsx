'use client';

import { User, Bell, Shield, LogOut, ChevronRight, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function DeliverySettingsPage() {
  return (
    <div className="space-y-6 pb-4">
      
      <h2 className="text-[22px] font-bold text-white">Settings</h2>

      {/* Profile Summary */}
      <div className="glass-card p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D98F8F] to-[#8E1B3A] flex items-center justify-center text-white text-xl font-bold shadow-lg border-2 border-white/10">
          JD
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-white">John Doe</h3>
          <p className="text-[#A69697] text-[14px]">Field Submitter</p>
        </div>
      </div>

      {/* Options List */}
      <div className="space-y-4">
        
        <div className="glass-card overflow-hidden">
          <div className="px-4 py-2 bg-white/[0.02] border-b border-white/5">
            <span className="text-[#A69697] text-[12px] font-bold uppercase tracking-wider">Account</span>
          </div>
          
          <div className="divide-y divide-white/5">
            <button className="w-full flex items-center justify-between p-4 hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center"><User size={18} /></div>
                <span className="text-white font-medium">Personal Information</span>
              </div>
              <ChevronRight size={18} className="text-[#A69697]" />
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center"><Bell size={18} /></div>
                <span className="text-white font-medium">Notifications</span>
              </div>
              <ChevronRight size={18} className="text-[#A69697]" />
            </button>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="px-4 py-2 bg-white/[0.02] border-b border-white/5">
            <span className="text-[#A69697] text-[12px] font-bold uppercase tracking-wider">Support</span>
          </div>
          
          <div className="divide-y divide-white/5">
            <button className="w-full flex items-center justify-between p-4 hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center"><HelpCircle size={18} /></div>
                <span className="text-white font-medium">Help Center</span>
              </div>
              <ChevronRight size={18} className="text-[#A69697]" />
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center"><Shield size={18} /></div>
                <span className="text-white font-medium">Privacy Policy</span>
              </div>
              <ChevronRight size={18} className="text-[#A69697]" />
            </button>
          </div>
        </div>
      </div>

      <Link 
        href="/auth/login"
        className="w-full mt-8 flex items-center justify-center gap-2 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 font-bold hover:bg-red-500/10 transition-colors"
      >
        <LogOut size={18} /> Sign Out
      </Link>

    </div>
  );
}
