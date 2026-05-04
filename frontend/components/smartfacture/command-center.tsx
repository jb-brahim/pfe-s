'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Upload, 
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
  Users
} from 'lucide-react';
import { MetricCard } from './metric-card';
import { BudgetAlert } from './budget-alert';
import { AuditTrail, AuditEntry } from './audit-trail';
import { SpendingChart } from './spending-chart';
import { cn } from '@/lib/utils';

const mockMetrics = [
  {
    label: 'Total balance',
    value: '$15,700.00',
    change: { value: 12.1, direction: 'up' as const },
    trend: 'positive' as const,
    icon: <DollarSign className="w-5 h-5" />,
  },
  {
    label: 'Income',
    value: '$8,500.00',
    change: { value: 6.3, direction: 'up' as const },
    trend: 'positive' as const,
    icon: <ArrowUpRight className="w-5 h-5" />,
  },
  {
    label: 'Expense',
    value: '$6,222.00',
    change: { value: 2.4, direction: 'up' as const },
    trend: 'negative' as const,
    icon: <Activity className="w-5 h-5" />,
  },
  {
    label: 'Total savings',
    value: '$32,913.00',
    change: { value: 12.1, direction: 'up' as const },
    trend: 'positive' as const,
    icon: <PieChart className="w-5 h-5" />,
  },
];

const mockBudgets = [
  { category: 'Cafe & Restaurants', spent: 400, limit: 1000, severity: 'info' as const },
  { category: 'Entertainment', spent: 600, limit: 1200, severity: 'warning' as const },
  { category: 'Investments', spent: 1500, limit: 2000, severity: 'critical' as const },
];

const mockAuditEntries: AuditEntry[] = [
  {
    id: '1',
    timestamp: new Date('2026-05-04T07:26:00Z'),
    action: 'Invoice Processed',
    user: 'System',
    details: 'Invoice #INV-2024-001 extracted successfully',
    status: 'success',
  },
  {
    id: '2',
    timestamp: new Date('2026-05-04T07:16:00Z'),
    action: 'Budget Alert',
    user: 'System',
    details: 'Investments category at 75% of budget limit',
    status: 'warning',
  },
  {
    id: '3',
    timestamp: new Date('2026-05-04T06:46:00Z'),
    action: 'Invoice Approved',
    user: 'Adaline Lively',
    details: 'Approved invoice #INV-2024-002 for $5,230',
    status: 'success',
  },
];

interface CommandCenterProps {
  onNavigate?: (page: any) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import { toast } from 'sonner';

interface DashboardStats {
  metrics: any[];
  budgets: any[];
  auditEntries: AuditEntry[];
}

export function CommandCenter({ onNavigate }: CommandCenterProps) {
  const { user } = useAuth();
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/analytics/dashboard');
        setStats(response.data.data);
      } catch (error) {
        // Only show error if it's not a 403 (e.g., for Employees who might not have access yet)
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Executive Dashboard...</p>
      </div>
    );
  }

  // Fallback for empty data
  const metrics = stats?.metrics || [
    user?.role === 'EMPLOYEE' ? { label: 'My Submissions', value: '0', trend: 'neutral', icon: <FileText className="w-5 h-5" /> } :
    { label: 'Pending Review', value: '0', trend: 'neutral', icon: <Clock className="w-5 h-5" /> },
    
    user?.role === 'MANAGER' || user?.role === 'ADMIN' ? 
      { label: 'Suspicious Flagged', value: '0', trend: 'neutral', icon: <AlertTriangle className="w-5 h-5" /> } :
      { label: 'Approved', value: '0', trend: 'neutral', icon: <CheckCircle2 className="w-5 h-5" /> },

    { label: 'Total Amount', value: '$0.00', trend: 'neutral', icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Active Budgets', value: '0', trend: 'neutral', icon: <Target className="w-5 h-5" /> }
  ];

  const budgets = stats?.budgets || [];
  const auditEntries = stats?.auditEntries || [];

  return (
    <motion.div 
      className="space-y-10 pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Top Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Welcome back, {user?.name?.split(' ')[0] || 'Executive'}!</h1>
           <p className="text-muted-foreground font-medium">Here is a real-time overview of your financial operations.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="pl-11 pr-6 py-3 bg-card border border-border rounded-2xl outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all w-64 text-sm font-medium text-foreground"
              />
           </div>
           <button className="p-3 bg-card border border-border rounded-2xl text-muted-foreground hover:text-primary transition-all relative">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 border-2 border-card rounded-full" />
           </button>
           {user?.role === 'EMPLOYEE' && (
             <button 
                onClick={() => onNavigate?.('processing-lab')}
                className="px-6 py-3 bg-primary text-white rounded-2xl font-bold flex items-center gap-2 shadow-purple hover:scale-105 active:scale-95 transition-all"
             >
                <Plus size={20} />
                Add new invoice
             </button>
           )}
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => (
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Section: Chart & Transactions */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Spending Analytics */}
          <motion.div variants={itemVariants} className="bg-card rounded-[2.5rem] p-8 shadow-soft border border-border">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/5 text-primary rounded-2xl">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-foreground">Money flow</h3>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Extraction Analytics</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-muted p-1 rounded-xl">
                 <button className="px-4 py-2 bg-card rounded-lg shadow-sm text-xs font-bold text-foreground">This year</button>
                 <button className="px-4 py-2 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">Previous</button>
              </div>
            </div>
            <div className="h-[350px]">
              <SpendingChart />
            </div>
          </motion.div>

          {/* Activity Stream */}
          <motion.div variants={itemVariants} className="bg-card rounded-[2.5rem] p-8 shadow-soft border border-border">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-extrabold text-foreground">Recent Transactions</h3>
               <button className="text-sm font-bold text-primary hover:underline">See all transactions</button>
            </div>
            <AuditTrail entries={auditEntries} maxHeight="max-h-[300px]" />
          </motion.div>
        </div>

        {/* Right Section: Budget & Goals */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Budget Progress */}
          <motion.div variants={itemVariants} className="bg-card rounded-[2.5rem] p-8 shadow-soft border border-border">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-extrabold text-foreground">Budget</h3>
                <button className="p-2 hover:bg-muted rounded-xl transition-all">
                   <Plus size={20} className="text-muted-foreground" />
                </button>
             </div>
             <div className="space-y-6">
                {budgets.map((budget: any, idx: number) => (
                  <BudgetAlert
                    key={idx}
                    category={budget.category}
                    spent={budget.spent}
                    limit={budget.limit}
                    currency="$"
                    severity={budget.severity}
                  />
                ))}
                {budgets.length === 0 && (
                  <p className="text-muted-foreground text-xs font-bold text-center py-4">No active budgets found.</p>
                )}
             </div>
             <button className="w-full mt-8 py-4 rounded-2xl border-2 border-dashed border-border text-muted-foreground font-bold text-sm hover:border-primary/30 hover:text-primary transition-all">
                Manage widgets
             </button>
          </motion.div>

          {/* Top Suppliers Insight */}
          <motion.div variants={itemVariants} className="bg-indigo-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-soft">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                <Users size={120} />
             </div>
             <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                   <Target className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Top Suppliers</h3>
                <p className="text-white/60 text-sm mb-8 font-medium">Tracking your most frequent spending partners.</p>
                
                <div className="space-y-6">
                   {(stats as any)?.topVendors?.map((vendor: any, i: number) => (
                     <div key={i}>
                        <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wider">
                           <span className="truncate max-w-[150px]">{vendor._id || 'Unknown'}</span>
                           <span>${vendor.totalSpent.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${Math.min(100, (vendor.totalSpent / (stats as any).totalAmount) * 100)}%` }}
                             transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                             className="h-full bg-white" 
                           />
                        </div>
                        <p className="text-[10px] text-white/40 font-bold mt-1 uppercase">{vendor.invoiceCount} Invoices</p>
                     </div>
                   ))}
                   {(!(stats as any)?.topVendors || (stats as any)?.topVendors.length === 0) && (
                     <p className="text-white/40 text-xs font-bold text-center py-10 italic">No supplier data available yet.</p>
                   )}
                </div>
             </div>
          </motion.div>

        </div>

      </div>
    </motion.div>
  );
}
