'use client';

import { Activity, ShieldAlert, KeyRound, UserMinus, Search, Loader, Users, LogIn, Building, Shield, FileText, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '@/lib/i18n-context';

export default function AuditLogsPage() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'SUPER_ADMIN' | 'ORGS'>('ALL');

  useEffect(() => {
    const fetchLogsAndCompanies = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const [logsRes, compRes] = await Promise.all([
          axios.get(`${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}/api/super-admin/audit-logs`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}/api/super-admin/companies`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (logsRes.data && logsRes.data.success) {
          setLogs(logsRes.data.data);
        }
        if (compRes.data && compRes.data.success) {
          setCompanies(compRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogsAndCompanies();
  }, []);

  const getLogIcon = (action: string) => {
    if (action.includes('Delete') || action.includes('Lock') || action.includes('Suspend')) return { icon: UserMinus, color: 'text-yellow-500' };
    if (action.includes('Fail') || action.includes('Brute')) return { icon: ShieldAlert, color: 'text-red-500' };
    if (action.includes('Password') || action.includes('Key')) return { icon: KeyRound, color: 'text-blue-400' };
    if (action.includes('Log')) return { icon: LogIn, color: 'text-purple-400' };
    if (action.includes('Create') || action.includes('Add')) return { icon: Users, color: 'text-green-400' };
    return { icon: Activity, color: 'text-gray-400' };
  };

  const getCompanyName = (user: any) => {
    if (!user) return t('superadmin.audit_logs_page.system');
    if (user.role === 'SUPER_ADMIN') return t('superadmin.audit_logs_page.super_admin');
    if (user.role === 'ADMIN') return user.companyDetails?.name || user.name || t('superadmin.audit_logs_page.organization');
    
    // If accountant, find their company via the companies array
    const company = companies.find(c => 
      c._id === user.managedBy || c.employees?.some((e: any) => e._id === user._id)
    );
    if (company) return company.companyDetails?.name || company.name || t('superadmin.audit_logs_page.organization');
    
    return t('superadmin.audit_logs_page.unknown_org');
  };

  const getEntityBadge = (type: string, id: string) => {
    let icon = Activity;
    let bg = 'bg-gray-500/10';
    let text = 'text-gray-400';
    let label = type || 'Unknown';

    if (label.includes('User')) {
      icon = Users;
      bg = 'bg-blue-500/10 border border-blue-500/20';
      text = 'text-blue-400';
    } else if (label.includes('Invoice')) {
      icon = FileText;
      bg = 'bg-emerald-500/10 border border-emerald-500/20';
      text = 'text-emerald-400';
    } else if (label.includes('Setting') || label.includes('System')) {
      icon = Settings;
      bg = 'bg-purple-500/10 border border-purple-500/20';
      text = 'text-purple-400';
    }

    const Icon = icon;

    return (
      <div className="flex items-center gap-2.5">
        <div className={`px-2 py-0.5 rounded flex items-center gap-1.5 ${bg} ${text}`}>
          <Icon size={12} />
          <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        </div>
        {id && <span className="text-[11px] text-[#A69697] font-mono">#{id.substring(0,6)}</span>}
      </div>
    );
  };

  const filteredLogs = logs.filter(log => 
    (log.action || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.entityType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.userId?.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  let displayedLogs = filteredLogs;
  if (activeTab === 'SUPER_ADMIN') {
    displayedLogs = filteredLogs.filter(log => log.userId?.role === 'SUPER_ADMIN');
  } else if (activeTab === 'ORGS') {
    displayedLogs = filteredLogs.filter(log => log.userId?.role !== 'SUPER_ADMIN' && log.userId !== null);
  }

  // If in ORGS tab, group logs by organization
  const groupedByOrg: Record<string, any[]> = {};
  if (activeTab === 'ORGS') {
    displayedLogs.forEach(log => {
      const orgName = getCompanyName(log.userId);
      if (!groupedByOrg[orgName]) groupedByOrg[orgName] = [];
      groupedByOrg[orgName].push(log);
    });
  }

  const renderLogTable = (logsToRender: any[]) => (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-white/5 bg-white/[0.02]">
          <th className="py-3 px-5 text-[11px] uppercase tracking-wider text-[#A69697] font-medium">{t('superadmin.audit_logs_page.table_action')}</th>
          <th className="py-3 px-5 text-[11px] uppercase tracking-wider text-[#A69697] font-medium">{t('superadmin.audit_logs_page.table_target')}</th>
          <th className="py-3 px-5 text-[11px] uppercase tracking-wider text-[#A69697] font-medium">{t('superadmin.audit_logs_page.table_actor')}</th>
          <th className="py-3 px-5 text-[11px] uppercase tracking-wider text-[#A69697] font-medium">{t('superadmin.audit_logs_page.table_timestamp')}</th>
        </tr>
      </thead>
      <tbody>
        {logsToRender.length === 0 ? (
          <tr>
            <td colSpan={4} className="py-12 text-center text-[#A69697] text-[12px]">
              {t('superadmin.audit_logs_page.no_logs')}
            </td>
          </tr>
        ) : (
          logsToRender.map((log) => {
            const { icon: Icon, color } = getLogIcon(log.action);
            const orgName = getCompanyName(log.userId);
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
                <td className="py-3 px-5">{getEntityBadge(log.entityType, log.entityId)}</td>
                <td className="py-3 px-5">
                  <div className="flex flex-col">
                    <span className="text-[13px] text-white">{log.userId?.email || t('superadmin.audit_logs_page.system')}</span>
                    {activeTab === 'ALL' && log.userId?.role !== 'SUPER_ADMIN' && log.userId && (
                      <span className="text-[10px] text-[#A69697]">{orgName}</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-5 text-[12px] text-[#A69697]">{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold text-white tracking-tight mb-1">{t('superadmin.audit_logs_page.title')}</h1>
        <p className="text-[13px] text-[#A69697]">
          {t('superadmin.audit_logs_page.subtitle')}
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-6 mb-6 border-b border-white/10">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`pb-3 text-[13px] font-medium transition-all ${
            activeTab === 'ALL' ? 'text-white border-b-2 border-[#D98F8F]' : 'text-[#A69697] hover:text-white border-b-2 border-transparent'
          }`}
        >
          {t('superadmin.audit_logs_page.tab_all')}
        </button>
        <button
          onClick={() => setActiveTab('SUPER_ADMIN')}
          className={`pb-3 text-[13px] font-medium transition-all flex items-center gap-2 ${
            activeTab === 'SUPER_ADMIN' ? 'text-white border-b-2 border-[#D98F8F]' : 'text-[#A69697] hover:text-white border-b-2 border-transparent'
          }`}
        >
          <Shield size={14} className={activeTab === 'SUPER_ADMIN' ? 'text-[#D98F8F]' : ''} />
          {t('superadmin.audit_logs_page.tab_superadmin')}
        </button>
        <button
          onClick={() => setActiveTab('ORGS')}
          className={`pb-3 text-[13px] font-medium transition-all flex items-center gap-2 ${
            activeTab === 'ORGS' ? 'text-white border-b-2 border-[#D98F8F]' : 'text-[#A69697] hover:text-white border-b-2 border-transparent'
          }`}
        >
          <Building size={14} className={activeTab === 'ORGS' ? 'text-[#D98F8F]' : ''} />
          {t('superadmin.audit_logs_page.tab_orgs')}
        </button>
      </div>

      <div className="bg-[#1A050A] border border-white/5 rounded-lg flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-b border-white/5">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A69697]" size={14} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('superadmin.audit_logs_page.search_placeholder')} 
              className="w-full pl-9 pr-4 py-2 rounded-md border outline-none text-[12px] transition-colors bg-[#1E0A0B] border-white/5 text-white focus:border-[#D98F8F]/50 placeholder:text-[#A69697]"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors bg-white/5 hover:bg-white/10 border border-white/5 text-[#A69697] hover:text-white">
              {t('superadmin.audit_logs_page.export_csv')}
            </button>
          </div>
        </div>

        {/* Log Table Container */}
        <div className="overflow-y-auto flex-1 h-[500px]">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Loader size={20} className="animate-spin text-[#A69697]" />
            </div>
          ) : activeTab === 'ORGS' ? (
            // Grouped by Organizations View
            Object.keys(groupedByOrg).length === 0 ? (
              <div className="py-12 text-center text-[#A69697] text-[12px]">{t('superadmin.audit_logs_page.no_org_logs')}</div>
            ) : (
              Object.keys(groupedByOrg).sort().map(orgName => (
                <div key={orgName} className="mb-6">
                  <div className="bg-[#1E0A0B] px-5 py-3 border-b border-y border-white/5 sticky top-0 z-10 flex items-center gap-2">
                    <Building size={14} className="text-[#A69697]" />
                    <h3 className="text-[13px] font-semibold text-white">{orgName}</h3>
                    <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full ml-2">
                      {groupedByOrg[orgName].length} {t('superadmin.audit_logs_page.events')}
                    </span>
                  </div>
                  {renderLogTable(groupedByOrg[orgName])}
                </div>
              ))
            )
          ) : (
            // Default View
            renderLogTable(displayedLogs)
          )}
        </div>
      </div>
    </div>
  );
}
