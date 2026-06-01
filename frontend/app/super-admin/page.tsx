'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Users, Server, Activity, ShieldAlert, BarChart3, ArrowUpRight } from 'lucide-react';
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
    chartData: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get('http://localhost:5000/api/super-admin/stats', {
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
    { title: t('superadmin.dashboard.total_users'), value: stats.totalUsers, icon: Users, color: 'text-[#D98F8F]', trend: `+12% ${t('superadmin.dashboard.this_month')}` },
    { title: t('superadmin.dashboard.system_health'), value: stats.systemStatus, icon: Activity, color: 'text-[#4ADE80]', trend: t('superadmin.dashboard.all_services') },
    { title: t('superadmin.dashboard.server_load'), value: stats.serverLoad, icon: Server, color: 'text-[#60A5FA]', trend: t('superadmin.dashboard.stable_metrics') },
    { title: t('superadmin.dashboard.security_alerts'), value: stats.securityAlerts.toString(), icon: ShieldAlert, color: 'text-[#FF5C77]', trend: t('superadmin.dashboard.no_active_threats') },
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className={cardClasses}>
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
          </div>
        ))}
      </div>

      {/* Charts & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`col-span-2 ${cardClasses} flex flex-col`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[14px] font-semibold text-white flex items-center gap-2">
              <BarChart3 className="text-[#A69697]" size={16} />
              {t('superadmin.dashboard.platform_growth')}
            </h2>
          </div>
          <div className="flex-1 min-h-[250px] w-full pt-4">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-[12px] text-[#A69697]">{t('superadmin.dashboard.loading')}</p>
              </div>
            ) : stats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D98F8F" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#D98F8F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#A69697" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="#A69697" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E0A0B', border: '1px solid #ffffff10', borderRadius: '8px' }}
                    itemStyle={{ color: '#D98F8F' }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#D98F8F" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border-t border-white/5">
                <p className="text-[12px] text-[#A69697]">No data available.</p>
              </div>
            )}
          </div>
        </div>

        <div className={`${cardClasses} flex flex-col`}>
          <h2 className="text-[14px] font-semibold text-white mb-6">{t('superadmin.dashboard.user_role_distribution')}</h2>
          
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <div>
              <div className="flex justify-between text-[12px] mb-2">
                <span className="text-[#A69697]">{t('superadmin.dashboard.accountants')}</span>
                <span className="font-medium text-white">{isLoading ? '-' : stats.accountants}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/5">
                <div 
                  className="h-full bg-[#D98F8F] rounded-full" 
                  style={{ width: isLoading || stats.totalUsers === 0 ? '0%' : `${(stats.accountants / stats.totalUsers) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[12px] mb-2">
                <span className="text-[#A69697]">{t('superadmin.dashboard.admins')}</span>
                <span className="font-medium text-white">{isLoading ? '-' : stats.admins}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/5">
                <div 
                  className="h-full bg-[#60A5FA] rounded-full" 
                  style={{ width: isLoading || stats.totalUsers === 0 ? '0%' : `${(stats.admins / stats.totalUsers) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[12px] mb-2">
                <span className="text-[#A69697]">{t('superadmin.dashboard.super_admins')}</span>
                <span className="font-medium text-white">{isLoading ? '-' : stats.superAdmins}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/5">
                <div 
                  className="h-full bg-[#F59E0B] rounded-full" 
                  style={{ width: isLoading || stats.totalUsers === 0 ? '0%' : `${(stats.superAdmins / stats.totalUsers) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
