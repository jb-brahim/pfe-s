'use client';

import { useEffect, useState, useRef } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Upload, MoreHorizontal, ChevronDown, FileText, TrendingUp, Users, CheckCircle2, Loader } from 'lucide-react';
import { invoiceAPI, analyticsAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [invoiceRes, statsRes, monthlyRes] = await Promise.all([
        invoiceAPI.getAll(),
        analyticsAPI.getDashboardStats(),
        analyticsAPI.getMonthlyStats(),
      ]);

      const allInvoices = invoiceRes.data || [];
      const sorted = [...allInvoices].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setInvoices(sorted);
      setDashboardStats(statsRes.data);
      setMonthlyData(monthlyRes.data || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      try {
        await invoiceAPI.uploadFile(e.target.files[0]);
        await fetchAllData(); // Refresh all data after upload
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  // Compute KPI values from real data
  const totalRevenue = dashboardStats?.totalAmount || 0;
  const totalInvoices = invoices.length;
  const approvedCount = invoices.filter((inv: any) => inv.status === 'APPROVED').length;
  const pendingCount = invoices.filter((inv: any) => inv.status === 'SUBMITTED' || inv.status === 'EXTRACTED').length;
  const outstandingTotal = invoices
    .filter((inv: any) => inv.status !== 'APPROVED' && inv.status !== 'REJECTED')
    .reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);
  const approvalRate = totalInvoices > 0 ? Math.round((approvedCount / totalInvoices) * 100) : 0;

  // Build revenue chart from monthly data
  const revenueChartData = monthlyData.map((m: any) => ({
    month: m.month,
    revenue: m.totalExpenses || 0,
    invoices: m.invoiceCount || 0,
  }));

  // Build cash flow chart from monthly data
  const cashFlowData = monthlyData.slice(0, 6).map((m: any) => ({
    name: m.month,
    value: m.totalExpenses || 0,
  }));

  // Build expense tracking from monthly data (split into two stacked values)
  const expenseTrackingData = monthlyData.slice(0, 6).map((m: any) => ({
    name: m.month?.substring(0, 2) || '',
    approved: m.totalExpenses || 0,
    pending: (m.invoiceCount || 0) * 50, // Rough estimate for pending costs
  }));

  // Recent 5 invoices for the transactions table
  const recentInvoices = invoices.slice(0, 5);

  // Status badge helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="bg-[#4CAF50]/10 text-[#4CAF50] px-3 py-1 rounded-full text-[12px] border border-[#4CAF50]/20">Approved</span>;
      case 'SUBMITTED':
        return <span className="bg-[#FFC107]/10 text-[#FFC107] px-3 py-1 rounded-full text-[12px] border border-[#FFC107]/20">Submitted</span>;
      case 'EXTRACTED':
        return <span className="bg-[#D98F8F]/10 text-[#D98F8F] px-3 py-1 rounded-full text-[12px] border border-[#D98F8F]/20">Extracted</span>;
      case 'REJECTED':
        return <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-[12px] border border-red-500/20">Rejected</span>;
      default:
        return <span className="bg-white/5 text-[#A69697] px-3 py-1 rounded-full text-[12px] border border-white/10">{status || 'Draft'}</span>;
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-TN', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val) + ' TND';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 w-full pb-10">
        
        {/* ROW 1: KPI Cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {/* Total Revenue */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl relative overflow-hidden h-[170px]">
            <div className="p-5 relative z-10">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-[#A69697] text-[13px] font-medium">Total Revenue</h3>
                <div className="flex items-center gap-2">
                  {totalRevenue > 0 && (
                    <div className="bg-[#4CAF50]/10 text-[#4CAF50] text-[11px] px-2 py-0.5 rounded-md font-medium flex items-center border border-[#4CAF50]/20">
                      <TrendingUp size={10} className="mr-1" /> Active
                    </div>
                  )}
                </div>
              </div>
              <h2 className="text-[32px] font-bold text-white leading-tight tracking-tight">
                {loading ? '...' : formatCurrency(totalRevenue)}
              </h2>
              <p className="text-[#A69697] text-[12px] mt-1">{totalInvoices} invoices processed</p>
            </div>
            <div className="absolute bottom-[-10px] left-0 right-0 h-[80px] z-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData.length > 0 ? revenueChartData : [{ revenue: 0 }]}>
                  <defs>
                    <linearGradient id="sparklineColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D98F8F" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#8E1B3A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="revenue" stroke="#D98F8F" strokeWidth={2} fillOpacity={1} fill="url(#sparklineColor)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Outstanding Invoices */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 flex flex-col justify-between h-[170px]">
            <div className="flex items-start justify-between">
              <h3 className="text-[#A69697] text-[13px] font-medium">Outstanding Invoices</h3>
              <span className="text-white text-[13px] font-bold">{pendingCount}</span>
            </div>
            <div className="mt-3">
              <p className="text-white text-[14px] font-medium mb-2">Approval Rate</p>
              <div className="w-full h-2 bg-black/30 border border-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#8E1B3A] to-[#D98F8F] rounded-full transition-all duration-1000" 
                  style={{ width: `${approvalRate}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-[#A69697] text-[12px]">{approvalRate}% approved</p>
                <p className="text-[#A69697] text-[12px]">Outstanding: {formatCurrency(outstandingTotal)}</p>
              </div>
            </div>
          </div>

          {/* Cash Flow */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 flex flex-col justify-between h-[170px]">
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-[#A69697] text-[13px] font-medium">Monthly Volume</h3>
            </div>
            <div className="h-[90px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlowData.length > 0 ? cashFlowData : [{ name: '—', value: 0 }]} barSize={10} margin={{ bottom: -10 }}>
                  <XAxis dataKey="name" stroke="#A69697" fontSize={10} tickLine={false} axisLine={false} dy={5} />
                  <Bar dataKey="value" radius={[3, 3, 3, 3]}>
                    {cashFlowData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.value === Math.max(...cashFlowData.map((d: any) => d.value || 0)) ? '#D98F8F' : '#6D071A'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ROW 2: AI Processing & Revenue Analytics */}
        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-5">
          {/* AI Invoice Processing */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-white text-[14px] font-medium">AI Invoice Processing</h3>
            </div>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 border border-dashed border-white/20 rounded-xl hover:border-[#D98F8F]/50 transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center group min-h-[140px] ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {isUploading ? (
                <Loader size={24} className="animate-spin text-[#D98F8F] mb-3" />
              ) : (
                <div className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center mb-3 text-[#D98F8F] group-hover:scale-105 transition-transform bg-white/[0.03]">
                  <Upload size={16} strokeWidth={2} />
                </div>
              )}
              <h4 className="text-white text-[14px] font-medium mb-0.5">
                {isUploading ? 'Processing...' : 'Drag & Drop Invoices'}
              </h4>
              <p className="text-[#A69697] text-[11px]">PDF, JPG, PNG supported</p>
              <input type="file" className="hidden" ref={fileInputRef} accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileUpload} />
            </div>

            <div className="mt-4">
              <h4 className="text-[#A69697] text-[12px] font-medium uppercase tracking-wider mb-3">Recent Scans</h4>
              {invoices.length === 0 && !loading ? (
                <p className="text-[#A69697] text-[13px] text-center py-4">No invoices yet. Upload one above!</p>
              ) : (
                invoices.slice(0, 3).map((inv: any) => (
                  <Link href={`/invoices/${inv._id}`} key={inv._id}
                    className="flex items-center justify-between text-[13px] px-2 py-2 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {getStatusBadge(inv.status)}
                    </div>
                    <span className="text-[#A69697] truncate max-w-[120px]">{inv.companyName || 'Unknown'}</span>
                    <span className="text-white font-medium">{formatCurrency(inv.totalAmount || 0)}</span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Revenue Analytics */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl flex flex-col overflow-hidden">
            <div className="flex items-start justify-between p-5">
              <h3 className="text-white text-[14px] font-medium">Revenue Analytics</h3>
              <div className="flex items-center gap-2">
                <span className="text-[#A69697] text-[12px]">{new Date().getFullYear()}</span>
              </div>
            </div>
            
            <div className="flex-1 w-full h-full min-h-[280px] mt-[-10px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData.length > 0 ? revenueChartData : [{ month: '—', revenue: 0 }]} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(217, 143, 143, 0.3)" />
                      <stop offset="100%" stopColor="rgba(142, 27, 58, 0)" />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#A69697" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#A69697" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val: number) => val === 0 ? '0' : `${(val/1000).toFixed(1)}k`} dx={-10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A0A0B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '13px' }} 
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#D98F8F" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ROW 3: Recent Transactions & Expense Tracking */}
        <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
          {/* Recent Transactions */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-[14px] font-medium">Recent Transactions</h3>
              <Link href="/invoices" className="text-[#D98F8F] text-[12px] hover:text-white transition-colors">
                View all →
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[#A69697] text-[12px] uppercase tracking-wider border-b border-white/[0.04]">
                    <th className="pb-3 font-medium px-2">Date</th>
                    <th className="pb-3 font-medium px-2">Vendor</th>
                    <th className="pb-3 font-medium px-2">Invoice #</th>
                    <th className="pb-3 font-medium px-2">Amount</th>
                    <th className="pb-3 font-medium px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="text-[14px]">
                  {loading ? (
                    <tr><td colSpan={5} className="py-8 text-center text-[#A69697]"><Loader size={20} className="animate-spin inline-block" /></td></tr>
                  ) : recentInvoices.length === 0 ? (
                    <tr><td colSpan={5} className="py-8 text-center text-[#A69697] text-[13px]">No transactions yet</td></tr>
                  ) : (
                    recentInvoices.map((inv: any) => (
                      <tr key={inv._id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer">
                        <td className="py-3 px-2 text-[#A69697] text-[13px]">{formatDate(inv.createdAt)}</td>
                        <td className="py-3 px-2 text-white">{inv.companyName || 'Unknown Vendor'}</td>
                        <td className="py-3 px-2 text-[#A69697] text-[13px] font-mono">{inv.invoiceNumber || '—'}</td>
                        <td className="py-3 px-2 text-white font-medium">{formatCurrency(inv.totalAmount || 0)}</td>
                        <td className="py-3 px-2">{getStatusBadge(inv.status)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expense Tracking */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-white text-[14px] font-medium">Monthly Expenses</h3>
            </div>
            
            <div className="h-[200px] w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseTrackingData.length > 0 ? expenseTrackingData : [{ name: '—', approved: 0 }]} barSize={12} margin={{ left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#A69697" fontSize={10} tickLine={false} axisLine={false} dy={8} />
                  <YAxis stroke="#A69697" fontSize={10} tickLine={false} axisLine={false} dx={-5} tickFormatter={(val: number) => val === 0 ? '0' : `${(val/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1A0A0B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '13px' }} />
                  <Bar dataKey="approved" stackId="a" fill="#D98F8F" radius={[0, 0, 3, 3]} name="Approved" />
                  <Bar dataKey="pending" stackId="a" fill="#8E1B3A" opacity={0.7} radius={[3, 3, 0, 0]} name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <Link href="/expenses" className="w-full py-3 rounded-xl bg-[#8E1B3A] text-white font-medium text-[14px] hover:bg-[#7B112C] transition-colors text-center block">
              View Expenses
            </Link>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
