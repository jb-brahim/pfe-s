'use client';

import { DollarSign, TrendingUp, CreditCard, ArrowUpRight, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '@/lib/i18n-context';

export default function BillingPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(`${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}/api/super-admin/billing-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.success) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching billing stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader className="animate-spin text-[#D98F8F]" /></div>;
  }

  const metrics = [
    { label: t('superadmin.billing_page.mrr'), value: `${stats?.mrr || 0} TND` },
    { label: t('superadmin.billing_page.active_subs'), value: stats?.activeSubscriptions || 0 },
    { label: t('superadmin.billing_page.arpu'), value: `${stats?.avgRevenuePerUser || 0} TND` },
  ];

  const total = stats?.activeSubscriptions || 1; // prevent div by zero
  const entPercent = ((stats?.distribution?.Enterprise || stats?.distribution?.Premium || 0) / total) * 100;
  const proPercent = ((stats?.distribution?.Pro || 0) / total) * 100;
  const normalPercent = ((stats?.distribution?.Normal || 0) / total) * 100;
  const basicPercent = ((stats?.distribution?.Basic || 0) / total) * 100;

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-[32px] font-bold text-white tracking-tight mb-2">{t('superadmin.billing_page.title')}</h1>
        <p className="text-[15px] text-[#A69697]">
          {t('superadmin.billing_page.subtitle')}
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {metrics.map((m, i) => (
          <div key={i} className="glass-card p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none transform translate-x-10 -translate-y-10"></div>
            <p className="text-[13px] font-bold text-[#A69697] uppercase tracking-widest mb-4">{m.label}</p>
            <h3 className="text-[42px] font-extrabold text-white leading-none tracking-tighter">{m.value}</h3>
          </div>
        ))}
      </div>

      {/* Subscription Breakdown */}
      <div className="glass-card p-8">
        <h2 className="text-[16px] font-bold text-white mb-8 tracking-wide">{t('superadmin.billing_page.distribution_title')}</h2>
        <div className="space-y-8 max-w-3xl">
          <div>
            <div className="flex justify-between items-end mb-3">
              <div>
                <span className="text-white font-bold text-[15px] block">Premium / Enterprise</span>
                <span className="text-[#A69697] text-[13px]">89 TND/mo (or custom)</span>
              </div>
              <span className="text-white font-bold text-[15px]">{stats?.distribution?.Enterprise || stats?.distribution?.Premium || 0} {t('superadmin.billing_page.orgs')}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-black/40 border border-white/5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] rounded-full transition-all duration-1000" style={{ width: `${entPercent}%` }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-end mb-3">
              <div>
                <span className="text-white font-bold text-[15px] block">Pro</span>
                <span className="text-[#A69697] text-[13px]">69 TND/mo</span>
              </div>
              <span className="text-white font-bold text-[15px]">{stats?.distribution?.Pro || 0} {t('superadmin.billing_page.orgs')}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-black/40 border border-white/5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000" style={{ width: `${proPercent}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-3">
              <div>
                <span className="text-white font-bold text-[15px] block">Normal</span>
                <span className="text-[#A69697] text-[13px]">49 TND/mo</span>
              </div>
              <span className="text-white font-bold text-[15px]">{stats?.distribution?.Normal || 0} {t('superadmin.billing_page.orgs')}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-black/40 border border-white/5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-1000" style={{ width: `${normalPercent}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-3">
              <div>
                <span className="text-white font-bold text-[15px] block">Basic</span>
                <span className="text-[#A69697] text-[13px]">19 TND/mo</span>
              </div>
              <span className="text-white font-bold text-[15px]">{stats?.distribution?.Basic || 0} {t('superadmin.billing_page.orgs')}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-black/40 border border-white/5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-gray-400 to-gray-600 rounded-full transition-all duration-1000" style={{ width: `${basicPercent}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Organizations Billing Table */}
      <div className="mt-12 glass-card overflow-hidden">
        <div className="p-8 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.01]">
          <div>
            <h2 className="text-[16px] font-bold text-white tracking-wide">{t('superadmin.billing_page.table_title')}</h2>
            <p className="text-[#A69697] text-[13px] mt-1">{t('superadmin.billing_page.table_subtitle')}</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="py-4 px-8 font-semibold text-[11px] uppercase tracking-widest text-[#A69697] border-b border-white/[0.06]">{t('superadmin.billing_page.table_org')}</th>
                <th className="py-4 px-8 font-semibold text-[11px] uppercase tracking-widest text-[#A69697] border-b border-white/[0.06]">{t('superadmin.billing_page.table_email')}</th>
                <th className="py-4 px-8 font-semibold text-[11px] uppercase tracking-widest text-[#A69697] border-b border-white/[0.06]">{t('superadmin.billing_page.table_tier')}</th>
                <th className="py-4 px-8 font-semibold text-[11px] uppercase tracking-widest text-[#A69697] border-b border-white/[0.06] text-right">{t('superadmin.billing_page.table_mrr')}</th>
              </tr>
            </thead>
            <tbody>
              {stats?.organizations?.length > 0 ? (
                stats.organizations.map((org: any, i: number) => {
                  // Get initials for avatar
                  const initials = org.name ? org.name.substring(0, 2).toUpperCase() : 'OR';
                  
                  return (
                    <tr key={i} className="group hover:bg-white/[0.03] transition-colors border-b border-white/[0.04] last:border-0 cursor-pointer">
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8E1B3A] to-[#3A0A14] flex items-center justify-center text-white font-bold text-[13px] shadow-inner border border-white/10 group-hover:scale-105 transition-transform">
                            {initials}
                          </div>
                          <div>
                            <p className="text-[14px] font-bold text-white group-hover:text-[#D98F8F] transition-colors">{org.name}</p>
                            <p className="text-[12px] text-[#A69697] mt-0.5">ID: {org.id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-8 text-[#A69697] text-[13px] font-medium">{org.email}</td>
                      <td className="py-5 px-8">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                          org.plan?.includes('Premium') || org.plan?.includes('Primum') || org.plan?.includes('Enterprise') ? 'bg-[#8E1B3A]/20 text-[#D98F8F] border-[#8E1B3A]/30' : 
                          org.plan?.includes('Pro') ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                          org.plan?.includes('Normal') ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-white/5 text-[#A69697] border-white/10'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                            org.plan?.includes('Premium') || org.plan?.includes('Primum') || org.plan?.includes('Enterprise') ? 'bg-[#D98F8F]' : 
                            org.plan?.includes('Pro') ? 'bg-blue-400' : 
                            org.plan?.includes('Normal') ? 'bg-purple-400' : 'bg-[#A69697]'
                          }`}></span>
                          {org.plan}
                        </span>
                      </td>
                      <td className="py-5 px-8 text-right">
                        <p className="font-bold text-white text-[15px]">{org.mrr} TND</p>
                        <p className="text-[11px] text-[#A69697] mt-0.5 uppercase tracking-wider">{t('superadmin.billing_page.per_month')}</p>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-[#A69697] text-[14px]">
                    {t('superadmin.billing_page.no_subs')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
