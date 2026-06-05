'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Users, Server, Activity, ShieldAlert, BarChart3, ArrowUpRight, FileText, Link as LinkIcon, Percent, Key, CreditCard } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '@/lib/i18n-context';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalUsers: 0,
    admins: 0,
    accountants: 0,
    superAdmins: 0,
    systemStatus: t('superadmin.dashboard.loading'),
    serverLoad: '0%',
    securityAlerts: 0,
    ttnLinked: 0,
    totalInvoices: 0,
    chartData: [],
    advanced: {
      adminGrowth: 0,
      invoiceGrowth: 0,
      activeTokens: 0,
      ttnPending: 0,
      avgAccuracy: 'N/A',
      totalMRR: 0,
      planCounts: { Premium: 0, Pro: 0, Normal: 0, Basic: 0 }
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(`${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}/api/super-admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.success) {
          setStats({
            totalUsers: res.data.data.totalUsers,
            admins: res.data.data.breakdown.admins,
            accountants: res.data.data.breakdown.accountants,
            superAdmins: res.data.data.breakdown.superAdmins,
            systemStatus: res.data.data.systemStatus,
            serverLoad: res.data.data.serverLoad || '0%',
            securityAlerts: res.data.data.securityAlerts || 0,
            ttnLinked: res.data.data.ttnLinked || 0,
            totalInvoices: res.data.data.totalInvoices || 0,
            chartData: res.data.data.chartData || [],
            advanced: res.data.data.advanced || {
              adminGrowth: 0, invoiceGrowth: 0, activeTokens: 0, ttnPending: 0, avgAccuracy: 'N/A', totalMRR: 0, planCounts: { Premium: 0, Pro: 0, Normal: 0, Basic: 0 }
            }
          });
        }
      } catch (error) {
        console.error('Failed to fetch super admin stats:', error);
        setStats(prev => ({ ...prev, systemStatus: t('superadmin.dashboard.error') }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cardClasses = "glass-card p-8 transition-all hover:bg-white/[0.05] hover:border-white/[0.08] shadow-xl relative overflow-hidden group flex flex-col h-full min-h-[320px] cursor-pointer";

  const statCards = [
    {
      title: t('superadmin.dashboard.apps_connected_aura') || 'Applications connected with Aura',
      value: stats.admins,
      icon: Key,
      color: 'text-[#F59E0B]',
      iconBg: 'bg-[#F59E0B]/10',
      trend: stats.advanced.adminGrowth > 0 ? `+${stats.advanced.adminGrowth}% ${t('superadmin.dashboard.this_month')}` : `${stats.advanced.adminGrowth}% ${t('superadmin.dashboard.this_month')}`,
      trendUp: stats.advanced.adminGrowth >= 0,
      href: '/super-admin/organizations',
      description: t('superadmin.dashboard.apps_connected_aura_desc') || 'API keys issued to enterprises for external system integrations. This represents the core usage of our developer API and drives B2B revenue streams.'
    },
    {
      title: t('superadmin.dashboard.apps_connected_ttn') || 'Applications connectées au TTN',
      value: stats.ttnLinked,
      icon: LinkIcon,
      color: 'text-[#60A5FA]',
      iconBg: 'bg-[#60A5FA]/10',
      trend: stats.advanced.ttnPending === 0 ? t('superadmin.dashboard.all_linked') : `${stats.advanced.ttnPending} ${t('superadmin.dashboard.pending')}`,
      trendUp: stats.advanced.ttnPending === 0,
      description: t('superadmin.dashboard.apps_connected_ttn_desc') || 'Enterprise ERP systems successfully linked to the Tunisian TradeNet (TTN) network for automated e-invoicing and tax compliance.'
    },
    {
      title: t('superadmin.dashboard.invoices_extracted') || 'Invoices Extracted via AI',
      value: stats.totalInvoices,
      icon: FileText,
      color: 'text-[#D98F8F]',
      iconBg: 'bg-[#D98F8F]/10',
      trend: stats.advanced.invoiceGrowth > 0 ? `+${stats.advanced.invoiceGrowth}% ${t('superadmin.dashboard.this_month')}` : `${stats.advanced.invoiceGrowth}% ${t('superadmin.dashboard.this_month')}`,
      trendUp: stats.advanced.invoiceGrowth >= 0,
      href: '/super-admin/invoices',
      description: t('superadmin.dashboard.invoices_extracted_desc') || 'Total volume of invoices processed automatically by the Aura proprietary AI extraction engine across all tenant organizations.'
    },
    {
      title: t('superadmin.dashboard.mrr') || 'Monthly Recurring Revenue',
      value: `${stats.advanced.totalMRR} TND`,
      icon: CreditCard,
      color: 'text-[#10B981]',
      iconBg: 'bg-[#10B981]/10',
      trend: `${stats.advanced.planCounts?.Premium || 0} ${t('superadmin.dashboard.premium')}`,
      trendUp: true,
      href: '/super-admin/billing',
      description: t('superadmin.dashboard.mrr_desc') || 'Calculated Monthly Recurring Revenue (MRR) driven by active tenant subscriptions across our Basic, Normal, Pro, and Premium tiers.'
    }
  ];

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-[32px] font-bold text-white tracking-tight mb-2">{t('superadmin.dashboard.system_overview')}</h1>
        <p className="text-[15px] text-[#A69697] max-w-2xl leading-relaxed">
          {t('superadmin.dashboard.system_overview_desc_long')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {statCards.map((stat, i) => {
          const CardContent = (
            <>
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none transform translate-x-10 -translate-y-10"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <p className="text-[11px] font-bold text-[#A69697] uppercase tracking-widest max-w-[140px] leading-relaxed">
                  {stat.title}
                </p>
                <div className={`p-3 rounded-xl ${stat.iconBg} border border-white/5 shadow-inner transition-transform group-hover:scale-110`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>

              <div className="flex-grow relative z-10 flex flex-col justify-center mb-6">
                <div className="flex flex-col gap-2">
                  <h3 className="text-[42px] font-extrabold text-white leading-none tracking-tighter">
                    {isLoading ? <span className="animate-pulse bg-white/10 h-10 w-24 rounded-lg block"></span> : stat.value}
                  </h3>
                  {!isLoading && stat.trend && (
                    <div className="flex items-center mt-1">
                      <span className={`inline-flex items-center text-[12px] font-bold px-2.5 py-1 rounded-md border ${stat.trendUp ? 'bg-[#4CAF50]/10 text-[#4CAF50] border-[#4CAF50]/20' : 'bg-[#F44336]/10 text-[#F44336] border-[#F44336]/20'}`}>
                        {stat.trend}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-[#A69697] text-[13px] leading-relaxed mb-6 relative z-10 line-clamp-3">
                {stat.description}
              </p>

              {/* Footer Link if available */}
              {stat.href && (
                <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                  <div className="bg-white/10 p-2 rounded-full border border-white/20">
                    <ArrowUpRight size={16} className="text-white" />
                  </div>
                </div>
              )}
            </>
          );

          return stat.href ? (
            <Link href={stat.href} key={i} className={cardClasses}>
              {CardContent}
            </Link>
          ) : (
            <div key={i} className={cardClasses}>
              {CardContent}
            </div>
          );
        })}
      </div>

    </div>
  );
}
