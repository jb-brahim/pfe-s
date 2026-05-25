'use client';

import { DollarSign, TrendingUp, CreditCard, ArrowUpRight, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function BillingPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get('http://localhost:5000/api/super-admin/billing-stats', {
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
    { label: 'Monthly Recurring Revenue', value: `$${stats?.mrr || 0}`, trend: '+0.0%' },
    { label: 'Active Subscriptions', value: stats?.activeSubscriptions || 0, trend: '+0' },
    { label: 'Avg Revenue Per User', value: `$${stats?.avgRevenuePerUser || 0}`, trend: '+$0.00' },
  ];

  const total = stats?.activeSubscriptions || 1; // prevent div by zero
  const entPercent = ((stats?.distribution?.Enterprise || 0) / total) * 100;
  const proPercent = ((stats?.distribution?.Pro || 0) / total) * 100;
  const basicPercent = ((stats?.distribution?.Basic || 0) / total) * 100;

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold text-white tracking-tight mb-1">Billing & Subscriptions</h1>
        <p className="text-[13px] text-[#A69697]">
          Platform revenue metrics and organization subscription tiers.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {metrics.map((m, i) => (
          <div key={i} className="bg-[#1A050A] border border-white/5 rounded-lg p-5">
            <p className="text-[12px] font-medium text-[#A69697] uppercase tracking-wider mb-3">{m.label}</p>
            <h3 className="text-[28px] font-semibold text-white mb-2 leading-none">{m.value}</h3>
            <div className="flex items-center text-[11px] font-medium text-[#4ADE80]">
              <ArrowUpRight size={12} className="mr-1" />
              {m.trend} from last month
            </div>
          </div>
        ))}
      </div>

      {/* Subscription Breakdown */}
      <div className="bg-[#1A050A] border border-white/5 rounded-lg p-6">
        <h2 className="text-[14px] font-semibold text-white mb-6">Subscription Tier Distribution</h2>
        <div className="space-y-6 max-w-2xl">
          <div>
            <div className="flex justify-between text-[12px] mb-2">
              <span className="text-white font-medium">Enterprise ($299/mo)</span>
              <span className="text-[#A69697]">{stats?.distribution?.Enterprise || 0} organizations</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/5">
              <div className="h-full bg-[#D98F8F] rounded-full transition-all duration-1000" style={{ width: `${entPercent}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[12px] mb-2">
              <span className="text-white font-medium">Pro ($99/mo)</span>
              <span className="text-[#A69697]">{stats?.distribution?.Pro || 0} organizations</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/5">
              <div className="h-full bg-blue-400 rounded-full transition-all duration-1000" style={{ width: `${proPercent}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[12px] mb-2">
              <span className="text-white font-medium">Basic (Free)</span>
              <span className="text-[#A69697]">{stats?.distribution?.Basic || 0} organizations</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/5">
              <div className="h-full bg-gray-400 rounded-full transition-all duration-1000" style={{ width: `${basicPercent}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
