'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  UserCheck,
  Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ACCOUNTANT';
  status?: string;
  createdAt?: string;
}

export default function TeamPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'ACCOUNTANT'>('ACCOUNTANT');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      // Logic to fetch users in the same organization/project
      // In a real app, this would be api.get('/users/team')
      const response = await api.get('/users');
      setMembers(response.data.data);
    } catch (error) {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Actual API call to register internal user
      await api.post('/auth/register', {
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole
      });
      toast.success(`${newRole} created successfully!`);
      setIsModalOpen(false);
      fetchTeam();
      // Reset form
      setNewName('');
      setNewEmail('');
      setNewPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Team Management</h1>
           <p className="text-slate-400 font-medium">Manage permissions and add new members to your organization.</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-primary text-white rounded-2xl font-bold flex items-center gap-2 shadow-purple hover:scale-105 transition-all"
          >
            <UserPlus size={20} />
            Add Team Member
          </button>
        )}
      </div>

      {/* Team List Card */}
      <div className="bg-white rounded-[2.5rem] p-10 shadow-soft border border-slate-50">
        <div className="flex items-center gap-4 mb-10 px-2">
           <div className="p-3 bg-primary/5 text-primary rounded-2xl">
              <Users size={24} />
           </div>
           <div>
              <h3 className="text-xl font-extrabold text-slate-900">Active Members</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Full control over team access</p>
           </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
             <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
             <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Fetching Team...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {(members || []).map((member) => (
              <div 
                key={member._id}
                className="group p-6 rounded-3xl bg-slate-50/50 border border-transparent hover:border-primary/10 hover:bg-white hover:shadow-lg transition-all flex items-center gap-6"
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg",
                  member.role === 'ADMIN' ? "bg-indigo-50 text-indigo-500" :
                  "bg-primary/5 text-primary"
                )}>
                  {member.name.charAt(0)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-extrabold text-slate-900 tracking-tight">{member.name}</h4>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      member.role === 'ADMIN' ? "bg-indigo-50 text-indigo-500" :
                      "bg-primary/5 text-primary"
                    )}>
                      {member.role}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-400">{member.email}</p>
                </div>

                <div className="hidden md:block text-right">
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                   <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                   </div>
                </div>

                <div className="flex items-center gap-2">
                   <button className="p-3 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                      <Edit3 size={18} />
                   </button>
                   {member.role !== 'ADMIN' && (
                     <button className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 size={18} />
                     </button>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 opacity-5">
                 <UserPlus size={160} className="text-primary" />
              </div>

              <div className="relative z-10">
                <h3 className="text-2xl font-black text-slate-900 mb-2">Create Team Account</h3>
                <p className="text-slate-400 font-medium mb-8">
                  The user will be able to log in immediately with the credentials you provide.
                </p>

                <form className="space-y-6" onSubmit={handleCreateUser}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {(['ADMIN', 'ACCOUNTANT'] as const)
                      .map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setNewRole(r)}
                        className={cn(
                          "p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all",
                          newRole === r 
                            ? "border-primary bg-primary/5 text-primary" 
                            : "border-slate-100 text-slate-400 hover:border-slate-200"
                        )}
                      >
                        {r === 'ADMIN' ? <Briefcase size={20} /> : <UserCheck size={20} />}
                        <span className="text-[10px] font-black uppercase tracking-widest">{r}</span>
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Full Name</label>
                    <input 
                      type="text" 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Enter name"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary/30 transition-all font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Login Email</label>
                    <input 
                      type="email" 
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="email@company.com"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary/30 transition-all font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Initial Password</label>
                    <input 
                      type="text" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Temporary password"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary/30 transition-all font-medium"
                      required
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-purple hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Creating...' : <>Confirm Create <ArrowRight size={18}/></>}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
