'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Upload, MoreHorizontal, ChevronDown, FileText, TrendingUp, Users, CheckCircle2, Loader, XCircle, AlertTriangle } from 'lucide-react';
import { invoiceAPI, analyticsAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/i18n-context';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      const hasSeen = localStorage.getItem(`welcome_${user._id}`);
      if (!hasSeen) {
        setShowWelcome(true);
      }
    }
  }, [user]);

  const closeWelcome = () => {
    if (user) {
      localStorage.setItem(`welcome_${user._id}`, 'true');
    }
    setShowWelcome(false);
  };

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
      } catch (error: any) {
        console.error('Upload failed:', error);
        if (error.response?.status === 403 && error.response?.data?.message === 'LIMIT_REACHED') {
          setShowLimitModal(true);
        }
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
  const rejectedCount = invoices.filter((inv: any) => inv.status === 'REJECTED').length;
  const pendingCount = invoices.filter((inv: any) => ['SUBMITTED', 'EXTRACTED', 'VERIFIED'].includes(inv.status)).length;
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
        return <span className="bg-[#4CAF50]/10 text-[#4CAF50] px-3 py-1 rounded-full text-[12px] border border-[#4CAF50]/20">{t('status.approved')}</span>;
      case 'SUBMITTED':
        return <span className="bg-[#FFC107]/10 text-[#FFC107] px-3 py-1 rounded-full text-[12px] border border-[#FFC107]/20">{t('status.submitted')}</span>;
      case 'EXTRACTED':
        return <span className="bg-[#D98F8F]/10 text-[#D98F8F] px-3 py-1 rounded-full text-[12px] border border-[#D98F8F]/20">{t('status.extracted')}</span>;
      case 'REJECTED':
        return <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-[12px] border border-red-500/20">{t('status.rejected')}</span>;
      default:
        return <span className="bg-white/5 text-[#A69697] px-3 py-1 rounded-full text-[12px] border border-white/10">{status || t('status.draft')}</span>;
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
        <div className="grid md:grid-cols-2 gap-5">
          {/* Total Revenue */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl relative overflow-hidden h-[170px]">
            <div className="p-5 relative z-10">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-[#A69697] text-[13px] font-medium">{user?.role === 'ADMIN' ? t('dashboard.total_revenue') : t('dashboard.my_total_submissions')}</h3>
                <div className="flex items-center gap-2">
                  {totalRevenue > 0 && (
                    <div className="bg-[#4CAF50]/10 text-[#4CAF50] text-[11px] px-2 py-0.5 rounded-md font-medium flex items-center border border-[#4CAF50]/20">
                      <TrendingUp size={10} className="mr-1" /> {t('dashboard.active')}
                    </div>
                  )}
                </div>
              </div>
              <h2 className="text-[32px] font-bold text-white leading-tight tracking-tight">
                {loading ? '...' : formatCurrency(totalRevenue)}
              </h2>
              <p className="text-[#A69697] text-[12px] mt-1">{totalInvoices} {t('dashboard.invoices_processed')}</p>
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

          {/* Pending Approvals & Verifications */}
          {user?.role === 'ADMIN' ? (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 flex flex-col h-[170px] overflow-hidden relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                  <h3 className="text-white text-[14px] font-medium">{t('dashboard.pending_approvals')}</h3>
                </div>
                <span className="bg-yellow-500/10 text-yellow-500 text-[11px] font-bold px-2 py-1 rounded-md border border-yellow-500/20">{pendingCount} {t('dashboard.action_required')}</span>
              </div>

              <div className="overflow-auto scrollbar-none">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[#A69697] text-[11px] uppercase tracking-wider border-b border-white/[0.04]">
                      <th className="pb-2 font-medium px-2">{t('dashboard.table.uploaded')}</th>
                      <th className="pb-2 font-medium px-2">{t('dashboard.table.company')}</th>
                      <th className="pb-2 font-medium px-2">{t('dashboard.table.status')}</th>
                      <th className="pb-2 font-medium px-2 text-right">{t('dashboard.table.action')}</th>
                    </tr>
                  </thead>
                  <tbody className="text-[12px]">
                    {loading ? (
                      <tr><td colSpan={4} className="py-4 text-center text-[#A69697]"><Loader size={16} className="animate-spin inline-block" /></td></tr>
                    ) : invoices.filter((inv: any) => ['SUBMITTED', 'EXTRACTED', 'VERIFIED'].includes(inv.status)).length === 0 ? (
                      <tr><td colSpan={4} className="py-4 text-center text-[#A69697] text-[12px]">{t('dashboard.no_pending_actions')}</td></tr>
                    ) : (
                      invoices.filter((inv: any) => ['SUBMITTED', 'EXTRACTED', 'VERIFIED'].includes(inv.status)).slice(0, 5).map((inv: any) => (
                        <tr key={inv._id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer group">
                          <td className="py-2 px-2 text-[#A69697]">{formatDate(inv.createdAt)}</td>
                          <td className="py-2 px-2 text-white truncate max-w-[80px]">{inv.companyName || t('dashboard.unknown_vendor')}</td>
                          <td className="py-2 px-2">{getStatusBadge(inv.status)}</td>
                          <td className="py-2 px-2 text-right">
                            <Link href={`/invoices/${inv._id}`} className="px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-bold group-hover:bg-[#D98F8F] group-hover:text-[#1A0A0B] transition-all whitespace-nowrap">{t('dashboard.review')}</Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 flex flex-row items-center justify-center gap-12 h-[170px]">
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-[#4CAF50]/10 border border-[#4CAF50]/20 flex items-center justify-center mb-3">
                  <CheckCircle2 size={24} className="text-[#4CAF50]" />
                </div>
                <h3 className="text-white text-[32px] font-bold leading-none mb-1">{approvedCount}</h3>
                <p className="text-[#A69697] text-[12px] uppercase tracking-wider">{t('status.approved')}</p>
              </div>
              <div className="w-[1px] h-20 bg-white/10"></div>
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3">
                  <XCircle size={24} className="text-red-400" />
                </div>
                <h3 className="text-white text-[32px] font-bold leading-none mb-1">{rejectedCount}</h3>
                <p className="text-[#A69697] text-[12px] uppercase tracking-wider">{t('status.rejected')}</p>
              </div>
            </div>
          )}

        </div>

        {/* ROW 2: AI Processing & Revenue Analytics */}
        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-5">
          {/* AI Invoice Processing */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-white text-[14px] font-medium">{t('dashboard.invoice_processing')}</h3>
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
                {isUploading ? t('dashboard.processing') : t('dashboard.drag_drop')}
              </h4>
              <p className="text-[#A69697] text-[11px]">{t('dashboard.supported_formats')}</p>
              <input type="file" className="hidden" ref={fileInputRef} accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileUpload} />
            </div>

            <div className="mt-4">
              <h4 className="text-[#A69697] text-[12px] font-medium uppercase tracking-wider mb-3">{t('dashboard.recent_scans')}</h4>
              {invoices.length === 0 && !loading ? (
                <p className="text-[#A69697] text-[13px] text-center py-4">{t('dashboard.no_invoices_yet')}</p>
              ) : (
                invoices.slice(0, 3).map((inv: any) => (
                  <Link href={`/invoices/${inv._id}`} key={inv._id}
                    className="flex items-center justify-between text-[13px] px-2 py-2 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {getStatusBadge(inv.status)}
                    </div>
                    <span className="text-[#A69697] truncate max-w-[120px]">{inv.companyName || t('dashboard.unknown_vendor')}</span>
                    <span className="text-white font-medium">{formatCurrency(inv.totalAmount || 0)}</span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Revenue Analytics */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl flex flex-col overflow-hidden">
            <div className="flex items-start justify-between p-5">
              <h3 className="text-white text-[14px] font-medium">{user?.role === 'ADMIN' ? t('dashboard.revenue_analytics') : t('dashboard.submission_analytics')}</h3>
              <div className="flex items-center gap-2">
                <span className="text-[#A69697] text-[12px]">{new Date().getFullYear()}</span>
              </div>
            </div>

            <div className="flex-1 w-full h-full min-h-[280px] mt-[-10px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData.length > 0 ? revenueChartData : [{ month: '—', revenue: 0 }]} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(217, 143, 143, 0.3)" />
                      <stop offset="100%" stopColor="rgba(142, 27, 58, 0)" />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#A69697" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#A69697" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val: number) => new Intl.NumberFormat('en', { notation: 'compact', compactDisplay: 'short' }).format(val)} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1A0A0B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '13px' }}
                    formatter={(value: number) => [formatCurrency(value), user?.role === 'ADMIN' ? t('dashboard.revenue') : t('dashboard.submitted')]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#D98F8F" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ROW 3: Recent Transactions */}
        <div className="grid grid-cols-1 gap-5">
          {/* Recent Transactions */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-[14px] font-medium">{user?.role === 'ADMIN' ? t('dashboard.recent_transactions') : t('dashboard.my_recent_uploads')}</h3>
              <Link href="/invoices" className="text-[#D98F8F] text-[12px] hover:text-white transition-colors">
                {t('dashboard.view_all')}
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[#A69697] text-[12px] uppercase tracking-wider border-b border-white/[0.04]">
                    <th className="pb-3 font-medium px-2">{t('dashboard.table.date')}</th>
                    <th className="pb-3 font-medium px-2">{t('dashboard.table.vendor')}</th>
                    <th className="pb-3 font-medium px-2">{t('dashboard.table.invoice_num')}</th>
                    <th className="pb-3 font-medium px-2">{t('invoices.table.source')}</th>
                    <th className="pb-3 font-medium px-2">{t('dashboard.table.status')}</th>
                  </tr>
                </thead>
                <tbody className="text-[14px]">
                  {loading ? (
                    <tr><td colSpan={5} className="py-8 text-center text-[#A69697]"><Loader size={20} className="animate-spin inline-block" /></td></tr>
                  ) : recentInvoices.length === 0 ? (
                    <tr><td colSpan={5} className="py-8 text-center text-[#A69697] text-[13px]">{t('dashboard.no_transactions_yet')}</td></tr>
                  ) : (
                    recentInvoices.map((inv: any) => (
                      <tr key={inv._id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer">
                        <td className="py-3 px-2 text-[#A69697] text-[13px]">{formatDate(inv.createdAt)}</td>
                        <td className="py-3 px-2 text-white">{inv.companyName || t('dashboard.unknown_vendor')}</td>
                        <td className="py-3 px-2 text-[#A69697] text-[13px] font-mono">{inv.invoiceNumber || '—'}</td>
                        <td className="py-3 px-2">
                          {inv.source === 'TELEGRAM' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase border bg-blue-500/10 text-blue-400 border-blue-500/20">
                              {t('source.telegram')}
                            </span>
                          ) : inv.source === 'EMAIL' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase border bg-purple-500/10 text-purple-400 border-purple-500/20">
                              {t('source.email')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase border bg-white/5 text-[#A69697] border-white/10">
                              {t('source.aura_app')}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2">{getStatusBadge(inv.status)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>



      </div>

      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-[480px] shadow-2xl relative overflow-hidden bg-[#3A0A14]/90 border-[#8E1B3A]/30">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#D98F8F] to-transparent"></div>
            
            <div className="p-8">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                <CheckCircle2 size={32} className="text-[#D98F8F]" />
              </div>
              
              <h2 className="text-white text-[24px] font-bold mb-2">{t('dashboard.welcome.title')}</h2>
              <p className="text-white/70 text-[15px] mb-6 leading-relaxed">
                {t('dashboard.welcome.subtitle_1')} <strong className="text-white">{t('dashboard.welcome.free_plan')}</strong>.
              </p>
              
              <div className="bg-black/20 border border-white/10 rounded-xl p-4 mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/70 text-[13px]">{t('dashboard.welcome.scans_label')}</span>
                  <span className="text-white font-bold text-[14px]">{user?.billing?.aiScansLimit || 3} {t('dashboard.welcome.scans')}</span>
                </div>
                <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#D98F8F] h-full rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, ((user?.billing?.aiScansUsed || 0) / (user?.billing?.aiScansLimit || 3)) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-white/60 text-[12px] mt-3">
                  {t('dashboard.welcome.upgrade_hint')}
                </p>
              </div>

              <button 
                onClick={closeWelcome}
                className="w-full btn-burgundy py-3.5 text-[15px] shadow-lg hover:shadow-[0_0_15px_rgba(217,143,143,0.2)] transition-all transform hover:-translate-y-0.5"
              >
                {t('dashboard.welcome.start_btn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Limit Reached Upgrade Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-[420px] shadow-2xl relative overflow-hidden bg-[#3A0A14]/95 border-[#8E1B3A]/40 text-center">
            <div className="p-8">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                <AlertTriangle size={36} className="text-red-400" />
              </div>
              
              <h2 className="text-white text-[24px] font-bold mb-3">{t('invoices.limit_reached_title')}</h2>
              <p className="text-white/70 text-[15px] mb-8 leading-relaxed">
                {t('invoices.limit_reached_desc')}
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => router.push('/subscription')}
                  className="w-full btn-burgundy py-3.5 text-[15px] font-bold shadow-lg"
                >
                  {t('invoices.upgrade_plan')}
                </button>
                <button 
                  onClick={() => setShowLimitModal(false)}
                  className="w-full py-3.5 text-white/50 hover:text-white transition-colors text-[14px]"
                >
                  {t('settings.company.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
