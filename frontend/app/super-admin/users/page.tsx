'use client';

import { useState, useEffect } from 'react';
import { Search, Users as UsersIcon, Loader, Lock, KeyRound, Unlock } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '@/lib/i18n-context';

export default function GlobalUsersPage() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get(`${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}/api/super-admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching global users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleLock = async (userId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.put(`${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}/api/super-admin/users/${userId}/lock`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, status: res.data.data.status } : u));
      }
    } catch (error) {
      console.error('Error toggling user lock:', error);
      alert('Failed to update user status.');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesQuery = (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All Roles' || u.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  return (
    <div className="animate-in fade-in duration-500 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[24px] font-semibold text-white tracking-tight mb-1">{t('superadmin.users_page.title')}</h1>
          <p className="text-[13px] text-[#A69697]">
            {t('superadmin.users_page.subtitle')}
          </p>
        </div>
      </div>

      <div className="bg-[#1A050A] border border-white/5 rounded-lg flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-b border-white/5">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A69697]" size={14} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('superadmin.users_page.search_placeholder')} 
              className="w-full pl-9 pr-4 py-2 rounded-md border outline-none text-[12px] transition-colors bg-[#1E0A0B] border-white/5 text-white focus:border-[#D98F8F]/50 placeholder:text-[#A69697]"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors bg-white/5 border border-white/5 text-white outline-none appearance-none"
            >
              <option value="All Roles">{t('superadmin.users_page.all_roles')}</option>
              <option value="ADMIN">{t('superadmin.users_page.org_admin')}</option>
              <option value="ACCOUNTANT">{t('superadmin.users_page.accountant')}</option>
              <option value="SUPER_ADMIN">{t('superadmin.users_page.super_admin')}</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="py-3 px-5 text-[11px] uppercase tracking-wider text-[#A69697] font-medium">{t('superadmin.users_page.user_details')}</th>
                <th className="py-3 px-5 text-[11px] uppercase tracking-wider text-[#A69697] font-medium">{t('superadmin.users_page.role')}</th>
                <th className="py-3 px-5 text-[11px] uppercase tracking-wider text-[#A69697] font-medium">{t('superadmin.users_page.status')}</th>
                <th className="py-3 px-5 text-right w-[10%]">{t('superadmin.users_page.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <Loader size={20} className="animate-spin text-[#A69697] mx-auto" />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-[#A69697] text-[12px]">
                    {t('superadmin.users_page.no_users')}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded border border-white/5 bg-[#1E0A0B] flex items-center justify-center">
                          <UsersIcon size={14} className="text-[#D98F8F]" />
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-white">{u.name}</p>
                          <p className="text-[11px] text-[#A69697]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                        u.role === 'SUPER_ADMIN' ? 'bg-[#8E1B3A]/20 text-[#D98F8F] border-[#8E1B3A]/30' :
                        u.role === 'ADMIN' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-white/5 text-white border-white/10'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-[12px] text-white">{u.status}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded hover:bg-white/10 text-[#A69697] hover:text-white" title="Reset Password (Placeholder)">
                          <KeyRound size={14} />
                        </button>
                        <button 
                          onClick={() => handleToggleLock(u._id)}
                          className="p-1.5 rounded hover:bg-red-500/20 text-[#A69697] hover:text-red-400" 
                          title={u.status === 'Locked' ? 'Unlock Account' : 'Lock Account'}
                        >
                          {u.status === 'Locked' ? <Unlock size={14} /> : <Lock size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
