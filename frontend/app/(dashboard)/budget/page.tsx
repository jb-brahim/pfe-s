'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Plus, 
  Calendar, 
  Target, 
  Wallet, 
  PieChart, 
  BarChart, 
  ChevronRight,
  Filter,
  RefreshCw
} from 'lucide-react';
import { BudgetAlert } from '@/components/smartfacture/budget-alert';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function BudgetPage() {
  const [stats, setStats] = React.useState<any>(null);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchBudgetStatus = async () => {
      try {
        const response = await api.get('/budget/status');
        setStats(response.data.data);
        setCategories(response.data.data.categories || []);
      } catch (error) {
        toast.error('Failed to load budget data');
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetStatus();
  }, []);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Accessing Financial Data...</p>
      </div>
    );
  }

  const yearlyLimit = (stats?.budget?.monthlyLimit || 0) * 12;
  const utilization = stats?.percentage || 0;
  const monthlyAllocation = stats?.budget?.monthlyLimit || 0;

  return (
    <div className="space-y-10 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="p-1 px-2.5 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-wider border border-primary/20">
                Departmental Allocations
              </span>
           </div>
           <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Budget Forecasting</h1>
           <p className="text-muted-foreground font-semibold">Monitor monthly corporate thresholds and categorical spent limits.</p>
        </div>
        <div className="flex items-center gap-4">
           <button className="px-6 py-3.5 bg-card/40 border border-white/5 text-muted-foreground rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm hover:scale-102 transition-all cursor-pointer">
              <Calendar size={16} />
              Fiscal Year {stats?.budget?.year || 2026}
           </button>
           <button className="px-6 py-3.5 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-purple hover:scale-102 transition-all cursor-pointer">
              <Plus size={16} />
              Create Threshold Limit
           </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <SummaryCard 
          title="Total Yearly Budget" 
          value={`${yearlyLimit.toLocaleString()} DT`} 
          icon={<Wallet size={22} />} 
          trend="Calculated"
          color="primary"
        />
        <SummaryCard 
          title="Current Utilization" 
          value={`${utilization}%`} 
          icon={<Target size={22} />} 
          trend={utilization > 80 ? "High Usage" : "Healthy"}
          color="indigo"
        />
        <SummaryCard 
          title="Monthly Allocation" 
          value={`${monthlyAllocation.toLocaleString()} DT`} 
          icon={<PieChart size={22} />} 
          trend="Per Month"
          color="dark"
        />
      </div>

      {/* Categories Grid */}
      <div className="sf-card p-10">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <BarChart size={22} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-foreground">Categorical Thresholds</h3>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Real-time expenditure ratios</p>
            </div>
          </div>
          <button className="p-3 bg-white/2 hover:bg-white/5 border border-white/5 rounded-xl text-muted-foreground hover:text-foreground transition-all">
            <Filter size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {categories.map((item, idx) => {
            const percentage = (item.spent / item.limit) * 100;
            const severity = percentage > 90 ? 'critical' : percentage > 70 ? 'warning' : 'info';
            
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group p-6 bg-white/2 border border-white/5 rounded-3xl hover:border-white/10 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-primary rounded-full group-hover:scale-y-125 transition-transform" />
                    <span className="font-extrabold text-sm text-foreground tracking-tight">{item.category}</span>
                  </div>
                  <span className="text-[9px] font-black text-muted-foreground bg-white/3 px-2 py-1 rounded uppercase tracking-wider">{item.itemsCount || 0} Invoices</span>
                </div>
                <BudgetAlert 
                  category=""
                  spent={item.spent}
                  limit={item.limit}
                  severity={severity}
                  className="!bg-transparent !p-0 !border-none !rounded-none"
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, trend, color }: any) {
  const colorMap: any = {
    primary: "bg-gradient-to-br from-primary to-indigo-700 text-white shadow-purple",
    indigo: "bg-gradient-to-br from-indigo-600 to-violet-800 text-white shadow-lg shadow-indigo-600/20",
    dark: "bg-card/40 border border-white/5 text-foreground shadow-glass"
  };

  return (
    <div className={cn("rounded-[2rem] p-8 flex flex-col gap-8 relative overflow-hidden", colorMap[color])}>
      <div className="flex items-center justify-between">
        <div className={cn("p-3 rounded-2xl", color === 'dark' ? "bg-white/5 text-primary border border-white/5" : "bg-white/10")}>
          {icon}
        </div>
        <span className={cn("text-[9px] font-black uppercase tracking-widest", color === 'dark' ? "text-muted-foreground" : "text-white/60")}>
          {trend}
        </span>
      </div>
      <div>
        <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1.5", color === 'dark' ? "text-muted-foreground" : "text-white/60")}>
          {title}
        </p>
        <h4 className="text-3xl font-extrabold tracking-tight font-sans">{value}</h4>
      </div>
    </div>
  );
}
