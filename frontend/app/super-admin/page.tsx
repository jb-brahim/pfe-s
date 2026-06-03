'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Users, Server, Activity, ShieldAlert, BarChart3, ArrowUpRight, FileText, Link as LinkIcon, Percent } from 'lucide-react';
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
    chartData: []
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
            chartData: res.data.data.chartData || []
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

  const cardClasses = "bg-[#1A050A] border border-white/5 rounded-lg p-5";

  const statCards = [
    { title: 'TTN Linked Apps', value: stats.ttnLinked, icon: LinkIcon, color: 'text-[#60A5FA]', trend: 'Active integrations' },
    { title: 'Invoices Extracted', value: stats.totalInvoices, icon: FileText, color: 'text-[#D98F8F]', trend: 'Total processed', href: '/super-admin/invoices' },
    { title: 'TTN Adoption', value: stats.admins > 0 ? `${((stats.ttnLinked / stats.admins) * 100).toFixed(0)}%` : '0%', icon: Percent, color: 'text-[#4ADE80]', trend: 'Of total enterprises' },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold text-white tracking-tight">{t('superadmin.dashboard.system_overview')}</h1>
        <p className="text-[13px] text-[#A69697] mt-1">
          {t('superadmin.dashboard.system_overview_desc')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat, i) => {
          const CardContent = (
            <>
              <div className="flex justify-between items-start mb-4">
                <p className="text-[12px] font-medium text-[#A69697] uppercase tracking-wider">{stat.title}</p>
                <stat.icon size={16} className={stat.color} />
              </div>
              <h3 className="text-[28px] font-semibold text-white mb-2 leading-none">
                {isLoading ? <span className="animate-pulse bg-white/10 h-8 w-16 rounded block"></span> : stat.value}
              </h3>
              <div className="flex items-center text-[11px] font-medium text-[#A69697]">
                <ArrowUpRight size={12} className="mr-1 text-[#D98F8F]" />
                {stat.trend}
              </div>
            </>
          );

          if (stat.href) {
            return (
              <Link href={stat.href} key={i} className={`${cardClasses} block hover:border-[#D98F8F]/50 transition-colors cursor-pointer`}>
                {CardContent}
              </Link>
            );
          }

          return (
            <div key={i} className={cardClasses}>
              {CardContent}
            </div>
          );
        })}
      </div>

    </div>
  );
}
