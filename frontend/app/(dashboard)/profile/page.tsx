'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Shield, 
  Building2, 
  Calendar, 
  Camera, 
  Edit3,
  BadgeCheck
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-10">
      {/* Header / Cover */}
      <div className="relative h-48 rounded-[2.5rem] bg-gradient-to-r from-indigo-500 to-primary overflow-hidden shadow-soft">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
      </div>

      {/* Profile Info Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] p-10 shadow-soft border border-slate-50 relative -mt-24 mx-6"
      >
        <div className="flex flex-col md:flex-row gap-10 items-start md:items-center">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2rem] bg-slate-100 flex items-center justify-center border-4 border-white shadow-soft overflow-hidden">
               <User size={64} className="text-slate-300" />
            </div>
            <button className="absolute -bottom-2 -right-2 p-3 bg-primary text-white rounded-xl shadow-purple hover:scale-110 transition-all opacity-0 group-hover:opacity-100">
               <Camera size={18} />
            </button>
          </div>

          {/* User Details */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
               <h1 className="text-3xl font-black text-slate-900">{user?.name || 'User Profile'}</h1>
               <div className="px-3 py-1 bg-emerald-50 text-emerald-500 rounded-full flex items-center gap-1.5 border border-emerald-100">
                  <BadgeCheck size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Verified Account</span>
               </div>
            </div>
            <p className="text-slate-400 font-medium text-lg mb-6">{user?.role} at Corporate Office</p>
            
            <div className="flex flex-wrap gap-4">
              <button className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-purple flex items-center gap-2 hover:scale-105 transition-all">
                <Edit3 size={18} />
                Edit Profile
              </button>
              <button className="px-6 py-2.5 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm border border-slate-100 hover:bg-slate-100 transition-all">
                Account Settings
              </button>
            </div>
          </div>
        </div>

        {/* Stats / Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100/50 space-y-4">
             <div className="flex items-center gap-3 text-slate-400">
                <Mail size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Email Address</span>
             </div>
             <p className="font-bold text-slate-900">{user?.email}</p>
          </div>

          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100/50 space-y-4">
             <div className="flex items-center gap-3 text-slate-400">
                <Shield size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Account Role</span>
             </div>
             <p className="font-bold text-slate-900">{user?.role}</p>
          </div>

          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100/50 space-y-4">
             <div className="flex items-center gap-3 text-slate-400">
                <Building2 size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Department</span>
             </div>
             <p className="font-bold text-slate-900">Finance & Operations</p>
          </div>
        </div>
      </motion.div>

      {/* Security Section */}
      <div className="bg-white rounded-[2.5rem] p-10 shadow-soft border border-slate-50">
        <h2 className="text-xl font-black text-slate-900 mb-8">Security & Access</h2>
        <div className="space-y-6">
           <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100/50">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-white rounded-2xl shadow-sm text-primary">
                    <Calendar size={24} />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-900">Last Login Activity</p>
                    <p className="text-xs text-slate-400 font-medium">Today at 10:24 AM • Tunis, TN</p>
                 </div>
              </div>
              <button className="text-xs font-black text-primary uppercase tracking-widest hover:underline">View All</button>
           </div>
        </div>
      </div>
    </div>
  );
}
