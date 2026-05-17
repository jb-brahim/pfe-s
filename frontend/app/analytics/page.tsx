'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import { mockAnalyticsData } from '@/lib/api';

export default function AnalyticsPage() {
  const topSuppliers = [
    { name: 'Techcorp Solutions', amount: 12500, invoices: 24 },
    { name: 'Office Supplies Co', amount: 8900, invoices: 18 },
    { name: 'Finance Services LLC', amount: 7200, invoices: 14 },
    { name: 'Digital Solutions Inc', amount: 5600, invoices: 11 },
    { name: 'Business Consulting', amount: 4300, invoices: 8 },
  ];

  const accountantLeaderboard = [
    { name: 'Eleanor Pena', submissions: 125, approvalRate: 94, avgTime: '1.2h' },
    { name: 'Ben Carter', submissions: 98, approvalRate: 91, avgTime: '1.5h' },
    { name: 'Jane Doe', submissions: 87, approvalRate: 96, avgTime: '1.1h' },
    { name: 'Admin User', submissions: 156, approvalRate: 98, avgTime: '0.9h' },
  ];

  const handleExport = () => {
    alert('CSV export functionality would be implemented here');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
            <p className="text-white/60">Comprehensive insights into invoice processing and team performance.</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 btn-rose-gold text-sm"
          >
            <Download size={18} />
            Export Report
          </button>
        </div>

        {/* Multi-Series Chart */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-white mb-4">Spending & Invoice Volume Trend</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={mockAnalyticsData}>
              <defs>
                <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8E1B3A" stopOpacity={1} />
                  <stop offset="95%" stopColor="#8E1B3A" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="#A0A0A0" />
              <YAxis stroke="#A0A0A0" yAxisId="left" />
              <YAxis stroke="#A0A0A0" yAxisId="right" orientation="right" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E1E1E',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="spending"
                stroke="#B76E79"
                strokeWidth={2}
                dot={{ fill: '#B76E79', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="invoices"
                stroke="#D4969F"
                strokeWidth={2}
                dot={{ fill: '#D4969F', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Suppliers */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-white mb-6">Top 5 Suppliers by Spending</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topSuppliers}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#A0A0A0" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#A0A0A0" />
              <Tooltip contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Bar dataKey="amount" fill="#B76E79" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Accountant Leaderboard */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-white mb-6">Accountant Performance Leaderboard</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Submissions</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Approval Rate</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Avg Processing Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {accountantLeaderboard.map((acc, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-[#B76E79]">#{idx + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-white">{acc.name}</td>
                    <td className="px-6 py-4 text-sm text-white/70">{acc.submissions}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="badge-success">{acc.approvalRate}%</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/70">{acc.avgTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { label: 'Total Revenue Processed', value: '$125,430', change: '+18.2%' },
            { label: 'Avg Invoice Value', value: '$1,245', change: '+5.3%' },
            { label: 'Processing Efficiency', value: '94.2%', change: '+2.1%' },
            { label: 'Monthly Growth', value: '+12.8%', change: 'vs last month' },
          ].map((metric, idx) => (
            <div key={idx} className="glass-card p-6">
              <p className="text-white/60 text-sm font-medium mb-2">{metric.label}</p>
              <h3 className="text-2xl font-bold text-white">{metric.value}</h3>
              <p className="text-green-400 text-xs mt-2 font-medium">{metric.change}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
