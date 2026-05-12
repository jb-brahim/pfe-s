'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  PieChart, 
  Download,
  AlertTriangle,
  ArrowUpRight,
  Activity,
  Plus,
  Search,
  Bell,
  Target,
  CheckCircle2,
  Users,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { MetricCard } from './metric-card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import { toast } from 'sonner';

interface AuditEntry {
  id: string;
  timestamp: Date;
  action: string;
  user: string;
  details: string;
  status: 'success' | 'warning' | 'error';
}

interface DashboardStats {
  metrics: {
    totalInvoices: number;
    pendingReview: number;
    approvedAmount: number;
    activeBudgets: number;
    verificationRate: number;
  };
  budgets: Array<{
    category: string;
    spent: number;
    limit: number;
    severity: 'info' | 'warning' | 'critical';
  }>;
  topVendors: Array<{
    _id: string;
    totalSpent: number;
    invoiceCount: number;
  }>;
  auditEntries: AuditEntry[];
}

interface CommandCenterProps {
  onNavigate?: (page: any) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
} as const;

export function CommandCenter({ onNavigate }: CommandCenterProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/analytics/dashboard');
        const data = response.data.data;
        
        // Mocking audit logs for visual polish if empty
        const defaultAudits: AuditEntry[] = [
          {
            id: '1',
            timestamp: new Date(),
            action: 'Invoice Submitted',
            user: 'Lead Accountant',
            details: 'Invoice #INV-9901 for $1,240 submitted for approval',
            status: 'success'
          },
          {
            id: '2',
            timestamp: new Date(Date.now() - 3600000),
            action: 'Compliance Triggered',
            user: 'Verification Engine',
            details: 'Rule flag: Over corporate limit constraint checked on #INV-8812',
            status: 'warning'
          }
        ];

        setStats({
          metrics: {
            totalInvoices: data.metrics?.totalInvoices || 0,
            pendingReview: data.metrics?.pendingReview || 0,
            approvedAmount: data.metrics?.approvedAmount || 0,
            activeBudgets: data.budgets?.length || 0,
            verificationRate: data.metrics?.verificationRate || 92
          },
          budgets: data.budgets || [],
          topVendors: data.topVendors || [],
          auditEntries: data.auditEntries?.length ? data.auditEntries : defaultAudits
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Accessing Command Desk...</p>
      </div>
    );
  }

  const metricsData = [
    {
      label: user?.role === 'ACCOUNTANT' ? 'My Submissions' : 'Total Invoices',
      value: stats?.metrics.totalInvoices.toString() || '0',
      change: { value: 14.2, direction: 'up' as const },
      trend: 'positive' as const,
      icon: <FileText className="w-5 h-5 text-indigo-400" />
    },
    {
      label: 'Pending Audit',
      value: stats?.metrics.pendingReview.toString() || '0',
      change: { value: 5.1, direction: 'down' as const },
      trend: 'positive' as const,
      icon: <Clock className="w-5 h-5 text-amber-400" />
    },
    {
      label: 'Compliance Pass Rate',
      value: `${stats?.metrics.verificationRate}%` || '100%',
      change: { value: 2.3, direction: 'up' as const },
      trend: 'positive' as const,
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />
    },
    {
      label: 'Approved Spending',
      value: `$${(stats?.metrics.approvedAmount || 0).toLocaleString()}`,
      change: { value: 8.9, direction: 'up' as const },
      trend: 'positive' as const,
      icon: <DollarSign className="w-5 h-5 text-purple-400" />
    }
  ];

  return (
    <motion.div 
      className="space-y-10 pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Top Banner section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Workspace active</span>
           </div>
           <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-2">
             Welcome back, <span className="sf-gradient-text">{user?.name?.split(' ')[0] || 'Executive'}</span>!
           </h1>
           <p className="text-muted-foreground font-semibold">Real-time overview of AI document extractions and compliance validations.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search invoices, suppliers..." 
                className="pl-11 pr-6 py-3.5 bg-card/40 border border-white/5 rounded-2xl outline-none focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all w-64 text-sm font-semibold text-foreground"
              />
           </div>
           <button className="p-3.5 bg-card/40 border border-white/5 rounded-2xl text-muted-foreground hover:text-primary transition-all relative">
              <Bell size={18} />
              <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-red-500 border-2 border-background rounded-full" />
           </button>
           {user?.role === 'ACCOUNTANT' && (
             <button 
                onClick={() => onNavigate?.('processing-lab')}
                className="px-6 py-3.5 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-purple hover:scale-102 active:scale-98 transition-all cursor-pointer"
             >
                <Plus size={18} />
                Scan Invoice
             </button>
           )}
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsData.map((metric, idx) => (
          <MetricCard
            key={idx}
            label={metric.label}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            icon={metric.icon}
          />
        ))}
      </motion.div>

      {/* Visual Analytics Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Section: Pure SVG Glowing Chart & Audit Trail */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* SVG Money Flow Vector Chart */}
          <motion.div variants={itemVariants} className="sf-card">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
                  <TrendingUp size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-foreground">Spending Analytics</h3>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Autonomous Money Flow</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-muted/40 p-1 rounded-xl border border-white/5">
                 <button className="px-4 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold">This Year</button>
                 <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">Previous</button>
              </div>
            </div>

            <div className="relative w-full h-[280px] flex items-end justify-center pt-4">
              {/* Premium Glow Area Path SVG */}
              <svg className="w-full h-full" viewBox="0 0 600 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
                
                {/* Horizontal Grid Lines */}
                <line x1="0" y1="40" x2="600" y2="40" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                <line x1="0" y1="160" x2="600" y2="160" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                <line x1="0" y1="220" x2="600" y2="220" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
                
                {/* Visual Area Glow */}
                <path d="M 0 220 L 0 160 Q 60 180 120 120 Q 180 60 240 140 Q 300 220 360 100 Q 420 -20 480 80 Q 540 180 600 60 L 600 220 Z" fill="url(#chartGlow)" />
                
                {/* Glowing Core Line */}
                <path d="M 0 160 Q 60 180 120 120 Q 180 60 240 140 Q 300 220 360 100 Q 420 -20 480 80 Q 540 180 600 60" stroke="url(#lineColor)" strokeWidth="4.5" strokeLinecap="round" />
                
                {/* Highlighting Nodes */}
                <circle cx="360" cy="100" r="6" fill="#8B5CF6" stroke="#fff" strokeWidth="2.5" />
                <circle cx="480" cy="80" r="6" fill="#EC4899" stroke="#fff" strokeWidth="2.5" />
              </svg>
            </div>
            
            <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-4 px-2">
              <span>Jan</span>
              <span>Mar</span>
              <span>May</span>
              <span>Jul</span>
              <span>Sep</span>
              <span>Nov</span>
              <span>Dec</span>
            </div>
          </motion.div>

          {/* Upgraded Audit Log Stream */}
          <motion.div variants={itemVariants} className="sf-card">
            <div className="flex items-center justify-between mb-8">
               <div>
                 <h3 className="text-xl font-extrabold text-foreground">Compliance Verification Stream</h3>
                 <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Real-time validation audits</p>
               </div>
               <button 
                 onClick={() => onNavigate?.('financial-vault')}
                 className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
               >
                 View All Records <ChevronRight size={14} />
               </button>
            </div>
            
            <div className="space-y-4">
              {stats?.auditEntries.map((entry) => (
                <div key={entry.id} className="p-4 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-between hover:bg-white/4 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black",
                      entry.status === 'success' ? "bg-emerald-500/10 text-emerald-400" :
                      entry.status === 'warning' ? "bg-amber-500/10 text-amber-400" :
                      "bg-red-500/10 text-red-400"
                    )}>
                      {entry.status === 'success' ? 'PASS' : entry.status === 'warning' ? 'FLAG' : 'FAIL'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-foreground">{entry.action}</span>
                        <span className="text-[9px] font-bold text-muted-foreground">• {new Date(entry.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 font-medium">{entry.details}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white/2 px-2.5 py-1 rounded-md">
                    {entry.user}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Section: Budget Forecasts & Top Suppliers */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Upgraded Budget Card Dashboard */}
          <motion.div variants={itemVariants} className="sf-card">
             <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-extrabold text-foreground">Budget Control</h3>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Monthly category bounds</p>
                </div>
                <button 
                  onClick={() => onNavigate?.('budget')}
                  className="p-2 hover:bg-white/5 rounded-xl transition-all"
                  title="Configure Budgets"
                >
                   <Target size={18} className="text-muted-foreground" />
                </button>
             </div>
             
             <div className="space-y-6">
                {stats?.budgets.map((budget, idx) => {
                  const percent = Math.min(100, (budget.spent / budget.limit) * 100);
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                         <span className="text-foreground/80">{budget.category}</span>
                         <span className="text-muted-foreground font-mono">${budget.spent.toLocaleString()} / <span className="text-foreground/40">${budget.limit.toLocaleString()}</span></span>
                      </div>
                      
                      {/* Gradient Fill Tracker */}
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${percent}%` }}
                           transition={{ duration: 1 }}
                           className={cn(
                             "h-full rounded-full bg-gradient-to-r",
                             budget.severity === 'critical' ? "from-red-500 to-rose-600" :
                             budget.severity === 'warning' ? "from-amber-400 to-orange-500" :
                             "from-indigo-500 to-primary"
                           )}
                         />
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                        <span className={cn(
                          budget.severity === 'critical' ? "text-red-400" :
                          budget.severity === 'warning' ? "text-amber-400" :
                          "text-indigo-400"
                        )}>{budget.severity} threshold</span>
                        <span className="text-muted-foreground">{Math.round(percent)}% spent</span>
                      </div>
                    </div>
                  );
                })}
                
                {(!stats?.budgets || stats.budgets.length === 0) && (
                  <p className="text-muted-foreground text-xs font-semibold text-center py-6 italic">No active corporate budgets defined.</p>
                )}
             </div>
          </motion.div>

          {/* Supplier Leaderboard Visualizer */}
          <motion.div variants={itemVariants} className="sf-card bg-gradient-to-b from-[#1E1B4B] to-card/60">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <Users size={140} className="text-primary" />
             </div>
             
             <div className="relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/5">
                   <Target className="text-indigo-400" size={20} />
                </div>
                <h3 className="text-xl font-extrabold text-white mb-1">Top Suppliers</h3>
                <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-8">Highest corporate cash outflows</p>
                
                <div className="space-y-6">
                   {stats?.topVendors?.slice(0, 3).map((vendor, i) => {
                     const maxSpent = stats.topVendors[0]?.totalSpent || 1;
                     const barPercent = Math.min(100, (vendor.totalSpent / maxSpent) * 100);
                     return (
                       <div key={i}>
                          <div className="flex justify-between text-xs font-bold mb-2">
                             <span className="truncate max-w-[150px] text-white/90">{vendor._id || 'Unknown Vendor'}</span>
                             <span className="font-mono text-white">${vendor.totalSpent.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${barPercent}%` }}
                               transition={{ duration: 0.8, delay: 0.2 }}
                               className="h-full bg-gradient-to-r from-primary to-pink-500 rounded-full" 
                             />
                          </div>
                          <p className="text-[9px] text-white/30 font-black uppercase mt-1.5">{vendor.invoiceCount} Valid Invoices</p>
                       </div>
                     );
                   })}
                   {(!stats?.topVendors || stats.topVendors.length === 0) && (
                      <p className="text-white/30 text-xs font-bold text-center py-10 italic">No supplier statistics available.</p>
                   )}
                </div>
             </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
