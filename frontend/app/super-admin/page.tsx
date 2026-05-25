'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Users, Server, Activity, ShieldAlert, BarChart3, ArrowUpRight } from 'lucide-react';
import axios from 'axios';

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    admins: 0,
    accountants: 0,
    superAdmins: 0,
    systemStatus: 'Loading...'
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
            systemStatus: res.data.data.systemStatus
          });
        }
      } catch (error) {
        console.error('Failed to fetch super admin stats:', error);
        setStats(prev => ({ ...prev, systemStatus: 'Error' }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cardClasses = "bg-[#1A050A] border border-white/5 rounded-lg p-5";

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-[#D98F8F]', trend: '+12% this month' },
    { title: 'System Health', value: stats.systemStatus, icon: Activity, color: 'text-[#4ADE80]', trend: 'All services operational' },
    { title: 'Server Load', value: '24%', icon: Server, color: 'text-[#60A5FA]', trend: 'Stable metrics' },
    { title: 'Security Alerts', value: '0', icon: ShieldAlert, color: 'text-[#FF5C77]', trend: 'No active threats' },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold text-white tracking-tight">System Overview</h1>
        <p className="text-[13px] text-[#A69697] mt-1">
          Global platform metrics and infrastructure status.
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
              Platform Growth
            </h2>
          </div>
          <div className="flex-1 min-h-[250px] w-full flex items-center justify-center border-t border-white/5 pt-4">
            <p className="text-[12px] text-[#A69697]">Analytics chart data will be visualized here.</p>
          </div>
        </div>

        <div className={`${cardClasses} flex flex-col`}>
          <h2 className="text-[14px] font-semibold text-white mb-6">User Role Distribution</h2>
          
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <div>
              <div className="flex justify-between text-[12px] mb-2">
                <span className="text-[#A69697]">Accountants</span>
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
                <span className="text-[#A69697]">Admins</span>
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
                <span className="text-[#A69697]">Super Admins</span>
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
