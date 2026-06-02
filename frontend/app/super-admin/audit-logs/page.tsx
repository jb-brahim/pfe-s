'use client';

import { Activity, ShieldAlert, KeyRound, UserMinus, Search, Loader, Users, LogIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(`${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}/api/super-admin/audit-logs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.success) {
          setLogs(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getLogIcon = (action: string) => {
    if (action.includes('Delete') || action.includes('Lock') || action.includes('Suspend')) return { icon: UserMinus, color: 'text-yellow-500' };
    if (action.includes('Fail') || action.includes('Brute')) return { icon: ShieldAlert, color: 'text-red-500' };
    if (action.includes('Password') || action.includes('Key')) return { icon: KeyRound, color: 'text-blue-400' };
    if (action.includes('Log')) return { icon: LogIn, color: 'text-purple-400' };
    if (action.includes('Create') || action.includes('Add')) return { icon: Users, color: 'text-green-400' };
    return { icon: Activity, color: 'text-gray-400' };
  };

  const filteredLogs = logs.filter(log => 
    (log.action || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.entityType || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold text-white tracking-tight mb-1">Audit Logs</h1>
        <p className="text-[13px] text-[#A69697]">
          Chronological feed of all critical system and security actions.
        </p>
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
              placeholder="Search logs by actor, IP, or action..." 
              className="w-full pl-9 pr-4 py-2 rounded-md border outline-none text-[12px] transition-colors bg-[#1E0A0B] border-white/5 text-white focus:border-[#D98F8F]/50 placeholder:text-[#A69697]"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors bg-white/5 hover:bg-white/10 border border-white/5 text-[#A69697] hover:text-white">
              Export CSV
            </button>
          </div>
        </div>

        {/* Log Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="py-3 px-5 text-[11px] uppercase tracking-wider text-[#A69697] font-medium">Action</th>
                <th className="py-3 px-5 text-[11px] uppercase tracking-wider text-[#A69697] font-medium">Target Entity</th>
                <th className="py-3 px-5 text-[11px] uppercase tracking-wider text-[#A69697] font-medium">Actor</th>
                <th className="py-3 px-5 text-[11px] uppercase tracking-wider text-[#A69697] font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <Loader size={20} className="animate-spin text-[#A69697] mx-auto" />
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-[#A69697] text-[12px]">
                    No audit logs match your search.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const { icon: Icon, color } = getLogIcon(log.action);
                  return (
                    <tr key={log._id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded bg-[#1E0A0B] border border-white/5 flex items-center justify-center">
                            <Icon size={12} className={color} />
                          </div>
                          <span className="text-[13px] font-medium text-white">{log.action}</span>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-[13px] text-[#A69697]">{log.entityType} ({log.entityId?.substring(0,6)})</td>
                      <td className="py-3 px-5 text-[13px] text-white">{log.userId?.email || 'System'}</td>
                      <td className="py-3 px-5 text-[12px] text-[#A69697]">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
