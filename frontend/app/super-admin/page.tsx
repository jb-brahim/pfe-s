'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Users, Server, Activity, ShieldAlert, BarChart3, ArrowUpRight, FileText, Link as LinkIcon, Percent, Key } from 'lucide-react';
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

  const cardClasses = "bg-[#1A050A] border border-white/5 rounded-xl p-5 transition-all hover:bg-[#1f0a10]";

  const statCards = [
    {
      title: 'Applications connected with Aura',
      value: stats.admins,
      icon: Key,
      color: 'text-[#F59E0B]',
      trend: 'Revenue generating',
      description: 'API keys issued to enterprises for external integrations. This drives the core revenue stream.'
    },
    {
      title: 'Applications connectées au TTNadd',
      value: stats.ttnLinked,
      icon: LinkIcon,
      color: 'text-[#60A5FA]',
      trend: 'Active integrations',
      description: 'External enterprise systems successfully linked into the TTN network.'
    },
    {
      title: 'Invoices Extracted',
      value: stats.totalInvoices,
      icon: FileText,
      color: 'text-[#D98F8F]',
      trend: 'Total processed',
      href: '/super-admin/invoices',
      description: 'Total volume of invoices processed by the AI extraction engine.'
    }
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
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <p className="text-[12px] font-bold text-[#A69697] uppercase tracking-wider">{stat.title}</p>
                <div className={`p-1.5 rounded-md bg-white/5 ${stat.color}`}>
                  <stat.icon size={16} />
                </div>
              </div>

              <div className="flex-grow">
                <h3 className="text-[28px] font-bold text-white mb-2 leading-none tracking-tight">
                  {isLoading ? <span className="animate-pulse bg-white/10 h-8 w-20 rounded block"></span> : stat.value}
                </h3>
                <p className="text-[#A69697] text-[12px] leading-snug mb-4">
                  {stat.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                <div className="flex items-center text-[11px] font-medium text-[#A69697]">
                  <ArrowUpRight size={12} className={`mr-1 ${stat.color}`} />
                  {stat.trend}
                </div>
                {stat.href && (
                  <span className="text-[11px] font-medium text-white opacity-50 hover:opacity-100 transition-opacity">
                    View Details &rarr;
                  </span>
                )}
              </div>
            </div>
          );

          if (stat.href) {
            return (
              <Link href={stat.href} key={i} className={`${cardClasses} block border-white/5 hover:border-[#D98F8F]/50 cursor-pointer`}>
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
