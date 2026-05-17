'use client';

import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import Link from 'next/link';
import { ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import { CreditCard, Wallet, TrendingUp, Building2, Server, Briefcase, Plus, Check, X, FileText } from 'lucide-react';
import { analyticsAPI, invoiceAPI } from '@/lib/api';

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

const teamClaims = [
  { id: 1, name: 'Ben Carter', role: 'Engineering', amount: 120.50, item: 'GitHub Copilot Subs', status: 'pending', date: 'Today, 10:42 AM', img: 'https://i.pravatar.cc/150?u=1' },
  { id: 2, name: 'Eleanor Pena', role: 'Design', amount: 450.00, item: 'Figma Annual', status: 'approved', date: 'Yesterday', img: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  { id: 3, name: 'Sarah Connor', role: 'Marketing', amount: 85.00, item: 'Facebook Ads', status: 'pending', date: 'Oct 14', img: 'https://i.pravatar.cc/150?u=2' },
];

export default function ExpensesPage() {
  const [stats, setStats] = useState<any>(null);
  const [pendingInvoices, setPendingInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await invoiceAPI.uploadFile(file);
      const [statsRes, invoiceRes] = await Promise.all([
        analyticsAPI.getDashboardStats(),
        invoiceAPI.getAll('VERIFIED'),
      ]);
      setStats(statsRes.data);
      setPendingInvoices(invoiceRes.data || []);
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, invoiceRes] = await Promise.all([
          analyticsAPI.getDashboardStats(),
          invoiceAPI.getAll('VERIFIED'),
        ]);
        setStats(statsRes.data);
        setPendingInvoices(invoiceRes.data || []);
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
    img: `https://i.pravatar.cc/150?u=${index}` // Mock avatar
  }));

  const displayClaims = mappedClaims.length > 0 ? mappedClaims : [
    { id: 1, name: 'Ben Carter', role: 'Engineering', amount: 120.50, item: 'GitHub Copilot Subs', status: 'pending', date: 'Today, 10:42 AM', img: 'https://i.pravatar.cc/150?u=1' },
    { id: 2, name: 'Eleanor Pena', role: 'Design', amount: 450.00, item: 'Figma Annual', status: 'approved', date: 'Yesterday', img: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  ];

  const totalSpent = stats?.totalAmount || 9700.00;
  const budget = 12000;
  const budgetUtil = Math.round((totalSpent / budget) * 100);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('fr-TN', { style: 'currency', currency: 'TND' }).replace('TND', '').trim() + ' TND';
  };

  const displayCategories = expenseCategories.map(cat => ({
    ...cat,
    value: (cat.value / 9700) * totalSpent
  }));

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

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 w-full pb-10 max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#8E1B3A] rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
          <div>
            <h1 className="text-[36px] font-bold tracking-tight mb-2 flex items-center gap-3 text-[#FFFFFF]">
              Corporate Expenses
            </h1>
            <p className="text-[#A69697] text-[16px]">Track team spending, manage budgets, and approve employee claims.</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            className="hidden"
            accept="image/*,application/pdf"
          />
          <button 
            onClick={handleUploadClick}
            className="bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white px-6 py-3 rounded-[16px] font-bold shadow-[0_0_20px_rgba(142,27,58,0.4)] hover:shadow-[0_0_30px_rgba(217,143,143,0.5)] transition-all hover:-translate-y-1 flex items-center gap-2"
          >
            <Plus size={18} /> New Expense
          </button>
        </div>

        {/* Top KPI Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-[10px] border border-white/10 rounded-[24px] p-6 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D98F8F] rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <Wallet className="text-[#D98F8F]" size={24} />
              </div>
              <span className="bg-[#8E1B3A]/30 text-[#D98F8F] px-3 py-1 rounded-full text-[12px] font-bold border border-[#8E1B3A]/50">This Month</span>
            </div>
            <p className="text-[#A69697] text-[14px] mb-1">Total Spent</p>
            <h2 className="text-[32px] font-bold text-white tracking-tight">{formatCurrency(totalSpent)}</h2>
          </div>

          <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-[10px] border border-white/10 rounded-[24px] p-6 shadow-lg">
            <p className="text-[#A69697] text-[14px] mb-4">Budget Utilization</p>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 relative flex items-center justify-center">
                <svg className="transform -rotate-90 w-20 h-20">
                  <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />
                  <circle cx="40" cy="40" r="36" stroke="#4CAF50" strokeWidth="6" fill="none" strokeDasharray="226" strokeDashoffset={226 - (budgetUtil / 100) * 226} className="transition-all duration-1000" strokeLinecap="round" />
                </svg>
                <span className="absolute text-[16px] font-bold text-[#4CAF50]">{budgetUtil}%</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-[20px]">{formatCurrency(budget)}</h3>
                <p className="text-[#A69697] text-[13px]">Total Budget</p>
                <p className="text-[#4CAF50] text-[12px] font-medium mt-1">Looking good!</p>
              </div>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-[10px] border border-white/10 rounded-[24px] p-6 shadow-lg flex flex-col justify-between">
             <div className="flex items-start justify-between">
              <p className="text-[#A69697] text-[14px]">Weekly Trend</p>
            </div>
            <div className="h-[70px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spendingTrend}>
                  <defs>
                    <linearGradient id="trendColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D98F8F" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#D98F8F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ backgroundColor: '#1A0A0B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="amount" stroke="#D98F8F" strokeWidth={3} fillOpacity={1} fill="url(#trendColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid xl:grid-cols-[1fr_1.5fr] gap-8">
          
          {/* Categories Pie Chart */}
          <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-[10px] border border-white/10 rounded-[30px] p-8 shadow-lg flex flex-col items-center">
            <h3 className="text-[#FFFFFF] text-[18px] font-bold w-full mb-6">Spending by Category</h3>
            
            <div className="w-[220px] h-[220px] relative mb-8">
              <div className="absolute inset-0 bg-[#8E1B3A] blur-[60px] opacity-20 rounded-full"></div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={displayCategories} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                    {displayCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity cursor-pointer outline-none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A0A0B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                    itemStyle={{ color: '#EBD8D8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[#A69697] text-[12px]">Top Category</span>
                <span className="text-white font-bold text-[18px] text-center px-4 leading-tight">Software</span>
              </div>
            </div>

            <div className="w-full space-y-3">
              {displayCategories.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between p-3 rounded-[16px] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                      <cat.icon size={18} />
                    </div>
                    <div>
                      <p className="text-white font-medium text-[14px]">{cat.name}</p>
                      <p className="text-[#A69697] text-[12px] group-hover:text-white/70 transition-colors">24 Transactions</p>
                    </div>
                  </div>
                  <span className="font-bold text-white">{formatCurrency(cat.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Employee Claims / Receipts Queue */}
          <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-[10px] border border-white/10 rounded-[30px] p-8 shadow-lg flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[#FFFFFF] text-[18px] font-bold">Pending Team Claims</h3>
              <Link href="/invoices" className="text-[#D98F8F] text-[13px] font-bold hover:underline">View All History</Link>
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
                        <span className="bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/30 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Pending</span>
                      ) : (
                        <span className="bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Approved</span>
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
                         <Link href={`/invoices/${claim.id}`} className="text-[#A69697] text-[13px] hover:text-white transition-colors underline">View</Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Virtual Corporate Card Visual */}
            <div className="mt-8 rounded-[24px] bg-gradient-to-tr from-[#1A0A0B] to-[#2D1B1C] border border-white/10 p-6 flex items-center justify-between relative overflow-hidden group cursor-pointer hover:border-[#D98F8F]/30 transition-all">
              <div className="absolute right-0 top-0 w-64 h-64 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#8E1B3A]/40 to-transparent opacity-50 transform translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform duration-700"></div>
              
              <div className="relative z-10">
                <p className="text-[#D98F8F] text-[12px] font-bold tracking-widest uppercase mb-1">Active Corporate Card</p>
                <h4 className="text-white font-bold text-[20px] flex items-center gap-3">
                  •••• •••• •••• 4209
                </h4>
                <p className="text-[#A69697] text-[13px] mt-2">Available Balance: <span className="text-white font-bold">24,500.00 TND</span></p>
              </div>
              
              <div className="relative z-10 w-16 h-12 rounded-[8px] bg-gradient-to-r from-white/10 to-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
                 <CreditCard className="text-[#D98F8F]" size={24} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
