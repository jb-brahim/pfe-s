'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import Link from 'next/link';
import { ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import { CreditCard, Wallet, TrendingUp, Building2, Server, Briefcase, Plus, Check, X, FileText, Settings2, Save, AlertTriangle } from 'lucide-react';
import { analyticsAPI, invoiceAPI, budgetAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/i18n-context';
import { toast } from 'sonner';

const expenseCategories = [
  { name: 'Software & SaaS', value: 4500, color: '#D98F8F', icon: Server },
  { name: 'Marketing', value: 3200, color: '#B34E56', icon: TrendingUp },
  { name: 'Office Supplies', value: 1200, color: '#8E1B3A', icon: Building2 },
  { name: 'Travel', value: 800, color: '#4CAF50', icon: Briefcase },
];

const spendingTrend = [
  { day: 'Mon', amount: 120 }, { day: 'Tue', amount: 300 }, { day: 'Wed', amount: 150 },
  { day: 'Thu', amount: 500 }, { day: 'Fri', amount: 200 }, { day: 'Sat', amount: 50 }, { day: 'Sun', amount: 0 }
];



export default function ExpensesPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [pendingInvoices, setPendingInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [editBudgetValue, setEditBudgetValue] = useState('');
  const [realCategories, setRealCategories] = useState<any[]>([]);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const { user: currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await invoiceAPI.uploadFile(file);
      const [statsRes, invoiceRes, budgetRes] = await Promise.all([
        analyticsAPI.getDashboardStats(),
        invoiceAPI.getAll('VERIFIED'),
        budgetAPI.getStatus(),
      ]);
      setStats(statsRes.data);
      setPendingInvoices(invoiceRes.data || []);
      if (budgetRes.data?.categories) {
        setRealCategories(budgetRes.data.categories);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      if (err.response?.status === 403 && err.response?.data?.message === 'LIMIT_REACHED') {
        setShowLimitModal(true);
      } else {
        toast.error(t('invoices.upload_failed') || "Failed to upload file");
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, invoiceRes, budgetRes] = await Promise.all([
          analyticsAPI.getDashboardStats(),
          invoiceAPI.getAll('VERIFIED'),
          budgetAPI.getStatus()
        ]);
        setStats(statsRes.data);
        setPendingInvoices(invoiceRes.data || []);
        
        if (budgetRes.data?.categories) {
          setRealCategories(budgetRes.data.categories);
        }
      } catch (err) {
        console.error('Expenses fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Map pending invoices to "claims" structure
  const mappedClaims = pendingInvoices.map((inv, index) => ({
    id: inv._id,
    name: inv.companyName || 'Unknown Vendor',
    role: 'Supplier',
    amount: inv.totalAmount || 0,
    item: `Invoice #${inv.invoiceNumber || 'N/A'}`,
    status: 'pending',
    date: new Date(inv.createdAt).toLocaleDateString(),
    img: `https://ui-avatars.com/api/?name=${encodeURIComponent(inv.companyName || 'Unknown')}&background=8E1B3A&color=fff&rounded=true&bold=true&size=150`
  }));

  const displayClaims = mappedClaims;

  const totalSpent = stats?.totalAmount || 0;
  const budget = stats?.budgets?.[0]?.limit || 12000;
  const budgetUtil = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-TN', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(val) + ' TND';
  };

  const colors = ['#D98F8F', '#B34E56', '#8E1B3A', '#4CAF50', '#FFC107'];
  const displayCategories = realCategories.length > 0 
    ? realCategories.map((cat, idx) => ({
        name: cat.category,
        value: cat.spent,
        count: cat.itemsCount,
        color: colors[idx % colors.length],
        icon: FileText
      })).sort((a, b) => b.value - a.value)
    : expenseCategories.map(cat => ({
        ...cat,
        count: 0,
        value: 0
      }));

  const topCategoryName = displayCategories.length > 0 ? displayCategories[0].name : 'None';

  const handleApprove = async (id: string) => {
    try {
      await invoiceAPI.approve(id);
      setPendingInvoices(prev => prev.filter(inv => inv._id !== id));
    } catch (err) {
      console.error('Approve error:', err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await invoiceAPI.reject(id, 'Rejected from Expenses page');
      setPendingInvoices(prev => prev.filter(inv => inv._id !== id));
    } catch (err) {
      console.error('Reject error:', err);
    }
  };

  const handleSaveBudget = async () => {
    const val = parseFloat(editBudgetValue);
    if (!isNaN(val) && val > 0) {
      try {
        const d = new Date();
        await budgetAPI.setBudget(val, 80, d.getFullYear(), d.getMonth() + 1);
        setIsEditingBudget(false);
        // Refresh stats to get the new budget
        const statsRes = await analyticsAPI.getDashboardStats();
        setStats(statsRes.data);
        toast.success(t('expenses.toast_budget_success'));
      } catch (err: any) {
        console.error('Failed to save budget', err);
        toast.error(err.response?.data?.message || t('expenses.toast_budget_failed'));
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 w-full pb-10 max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#8E1B3A] rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
          <div>
            <h1 className="text-[36px] font-bold tracking-tight mb-2 flex items-center gap-3 text-[#FFFFFF]">
              {t('expenses.title')}
            </h1>
            <p className="text-[#A69697] text-[16px]">{t('expenses.subtitle')}</p>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-[10px] border border-white/10 rounded-[24px] p-6 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D98F8F] rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <Wallet className="text-[#D98F8F]" size={24} />
              </div>
              <span className="bg-[#8E1B3A]/30 text-[#D98F8F] px-3 py-1 rounded-full text-[12px] font-bold border border-[#8E1B3A]/50">{t('expenses.this_month')}</span>
            </div>
            <p className="text-[#A69697] text-[14px] mb-1">{t('expenses.total_spent')}</p>
            <h2 className="text-[32px] font-bold text-white tracking-tight">{formatCurrency(totalSpent)}</h2>
          </div>

          <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-[10px] border border-white/10 rounded-[24px] p-6 shadow-lg">
            <p className="text-[#A69697] text-[14px] mb-4">{t('expenses.budget_utilization')}</p>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 relative flex items-center justify-center">
                <svg className="transform -rotate-90 w-20 h-20">
                  <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />
                  <circle cx="40" cy="40" r="36" stroke={budgetUtil > 100 ? "#D98F8F" : budgetUtil > 80 ? "#FFC107" : "#4CAF50"} strokeWidth="6" fill="none" strokeDasharray="226" strokeDashoffset={Math.max(0, 226 - (Math.min(budgetUtil, 100) / 100) * 226)} className="transition-all duration-1000" strokeLinecap="round" />
                </svg>
                <span className={`absolute text-[16px] font-bold ${budgetUtil > 100 ? 'text-[#D98F8F]' : budgetUtil > 80 ? 'text-[#FFC107]' : 'text-[#4CAF50]'}`}>{budgetUtil}%</span>
              </div>
              <div className="flex-1">
                {isEditingBudget ? (
                  <div className="flex items-center gap-2 mb-1">
                    <input 
                      type="number" 
                      value={editBudgetValue}
                      onChange={(e) => setEditBudgetValue(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-[8px] py-1 px-2 text-[14px] text-white outline-none focus:border-[#D98F8F] w-24"
                    />
                    <button onClick={handleSaveBudget} className="text-[#4CAF50] hover:text-[#4CAF50]/70 p-1 text-[13px] font-medium">
                      {t('expenses.save')}
                    </button>
                    <button onClick={() => setIsEditingBudget(false)} className="text-[#A69697] hover:text-white p-1 text-[13px] font-medium">
                      {t('expenses.cancel')}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-[20px]">{formatCurrency(budget)}</h3>
                  </div>
                )}
                <p className="text-[#A69697] text-[13px]">{t('expenses.total_budget')}</p>
                <p className={`text-[12px] font-medium mt-1 ${budgetUtil > 100 ? 'text-[#D98F8F]' : budgetUtil > 80 ? 'text-[#FFC107]' : 'text-[#4CAF50]'}`}>
                  {budgetUtil > 100 ? t('expenses.over_budget') : budgetUtil > 80 ? t('expenses.approaching_limit') : t('expenses.looking_good')}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Employee Claims / Receipts Queue */}
        <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-[10px] border border-white/10 rounded-[30px] p-8 shadow-lg flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[#FFFFFF] text-[18px] font-bold">{t('expenses.pending_claims')}</h3>
              <Link href="/invoices" className="text-[#D98F8F] text-[13px] font-bold hover:underline">{t('expenses.view_history')}</Link>
            </div>

            <div className="flex flex-col gap-4">
              {displayClaims.map((claim) => (
                <div key={claim.id} className="relative group bg-[rgba(255,255,255,0.02)] border border-white/5 hover:border-[#D98F8F]/30 rounded-[24px] p-5 flex flex-col sm:flex-row sm:items-center gap-5 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(142,27,58,0.15)] hover:-translate-y-1">
                  
                  {/* Receipt Thumbnail Mock */}
                  <div className="w-16 h-16 rounded-[14px] bg-gradient-to-br from-[#EBD8D8] to-[#D98F8F] flex items-center justify-center flex-shrink-0 shadow-inner overflow-hidden relative group-hover:shadow-[0_0_20px_rgba(217,143,143,0.3)] transition-all">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <FileText className="text-[#1A0A0B] opacity-50" size={24} />
                    <div className="absolute bottom-0 w-full h-1/3 bg-white/20 backdrop-blur-sm"></div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-bold text-[16px] truncate">{claim.item}</h4>
                      {claim.status === 'pending' ? (
                        <span className="bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/30 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">{t('expenses.pending')}</span>
                      ) : (
                        <span className="bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">{t('expenses.approved')}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[13px] text-[#A69697]">
                      <div className="flex items-center gap-1.5">
                        <img src={claim.img} className="w-5 h-5 rounded-full" />
                        <span className="text-white/80">{claim.name}</span>
                      </div>
                      <span>•</span>
                      <span>{claim.date}</span>
                    </div>
                  </div>

                  {/* Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-[200px]">
                    <div className="text-right">
                      <p className="text-[20px] font-bold text-white">{formatCurrency(claim.amount)}</p>
                    </div>
                    
                    {claim.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleApprove(claim.id)}
                          className="w-10 h-10 rounded-full bg-[#4CAF50]/10 border border-[#4CAF50]/30 text-[#4CAF50] flex items-center justify-center hover:bg-[#4CAF50] hover:text-white transition-all hover:scale-110 shadow-lg"
                        >
                          <Check size={18} strokeWidth={3} />
                        </button>
                        <button 
                          onClick={() => handleReject(claim.id)}
                          className="w-10 h-10 rounded-full bg-[#8E1B3A]/20 border border-[#8E1B3A]/50 text-[#D98F8F] flex items-center justify-center hover:bg-[#8E1B3A] hover:text-white transition-all hover:scale-110 shadow-lg"
                        >
                          <X size={18} strokeWidth={3} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-[88px] flex justify-end">
                         <Link href={`/invoices/${claim.id}`} className="text-[#A69697] text-[13px] hover:text-white transition-colors underline">{t('expenses.view')}</Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>


        </div>
      </div>

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
