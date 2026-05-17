'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, AlertTriangle, Zap } from 'lucide-react';

export default function AIInsightsPage() {
  const growthData = [
    { month: 'Jan', predicted: 8000, actual: 7900 },
    { month: 'Feb', predicted: 9200, actual: 9150 },
    { month: 'Mar', predicted: 7800, actual: 8100 },
    { month: 'Apr', predicted: 9500, actual: 9600 },
    { month: 'May', predicted: 8700, actual: 8800 },
    { month: 'Jun', predicted: 10200, actual: 10100 },
  ];

  const anomalyData = [
    { activity: 'Duplicate Payments', risk: 'High', count: 3 },
    { activity: 'Unusual Amounts', risk: 'Medium', count: 7 },
    { activity: 'Late Submissions', risk: 'Low', count: 12 },
  ];

  const taxComplianceData = [
    { category: 'Compliant', value: 94 },
    { category: 'Review Needed', value: 5 },
    { category: 'Non-Compliant', value: 1 },
  ];

  const COLORS = ['#8E1B3A', '#D4969F', '#A0A0A0'];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">AI-Powered Insights</h1>
          <p className="text-white/60">Advanced analytics powered by machine learning models.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              label: 'AI Predicted Growth',
              value: '+3.55%',
              icon: TrendingUp,
              color: 'from-green-500 to-teal-500',
            },
            {
              label: 'Anomalies Detected',
              value: '22',
              icon: AlertTriangle,
              color: 'from-amber-500 to-orange-500',
            },
            {
              label: 'Tax Compliance Score',
              value: '94.2%',
              icon: Zap,
              color: 'from-blue-500 to-purple-500',
            },
            {
              label: 'Cost Optimization',
              value: 'Save $2.1K',
              icon: TrendingUp,
              color: 'from-rose-500 to-pink-500',
            },
          ].map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div key={idx} className={`glass-card p-6 border-t-2`} style={{ borderColor: '#B76E79' }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-white/60 text-sm font-medium">{metric.label}</p>
                    <h3 className="text-3xl font-bold text-white mt-2">{metric.value}</h3>
                  </div>
                  <Icon className="text-[#B76E79]" size={24} />
                </div>
                <p className="text-white/40 text-xs">Custom AI Model</p>
              </div>
            );
          })}
        </div>

        {/* Financial Forecasting */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-white mb-4">Financial Forecasting (6-Month Prediction)</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={growthData}>
              <defs>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B76E79" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#B76E79" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="#A0A0A0" />
              <YAxis stroke="#A0A0A0" />
              <Tooltip contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#B76E79"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#B76E79', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#D4969F"
                strokeWidth={2}
                dot={{ fill: '#D4969F', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Anomaly Detection */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-white mb-6">Anomaly Detection Alert</h2>
            <div className="space-y-4">
              {anomalyData.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-white/5">
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.activity}</p>
                    <p className="text-white/60 text-sm">Detected {item.count} instances</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.risk === 'High'
                        ? 'bg-red-500/20 text-red-300'
                        : item.risk === 'Medium'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-blue-500/20 text-blue-300'
                    }`}
                  >
                    {item.risk}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tax Compliance */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-white mb-4">Tax Compliance Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taxComplianceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {taxComplianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid rgba(255,255,255,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-6 space-y-2">
              {taxComplianceData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                    <span className="text-white/70 text-sm">{item.category}</span>
                  </div>
                  <span className="text-white font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-white mb-6">AI-Generated Recommendations</h2>
          <div className="space-y-4">
            {[
              {
                title: 'Optimize Supplier Management',
                desc: 'Consolidate payments to top 3 suppliers to reduce processing time by 23%',
              },
              {
                title: 'Budget Reallocation',
                desc: 'Travel category is 12% over budget. Recommend reallocating to Software',
              },
              {
                title: 'Duplicate Invoice Detection',
                desc: 'Found 2 potential duplicate invoices from Office Supplies Co. Worth $4,200',
              },
              {
                title: 'Process Improvement',
                desc: 'Implement automated pre-approval for invoices under $1,000 to save 15 hours/month',
              },
            ].map((rec, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-white/10 hover:border-[#B76E79]/50 transition-colors cursor-pointer">
                <p className="text-white font-medium text-sm">{rec.title}</p>
                <p className="text-white/60 text-sm mt-2">{rec.desc}</p>
                <button className="text-[#B76E79] hover:text-[#D4969F] text-xs font-medium mt-3">
                  Learn More →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
