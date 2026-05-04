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
  Filter
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
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Accessing Financial Data...</p>
      </div>
    );
  }

  const yearlyLimit = (stats?.budget?.monthlyLimit || 0) * 12;
  const utilization = stats?.percentage || 0;
  const monthlyAllocation = stats?.budget?.monthlyLimit || 0;

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Budget Management</h1>
           <p className="text-slate-400 font-medium">Monitor your corporate spending and categorical limits.</p>
        </div>
        <div className="flex items-center gap-4">
           <button className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-all">
              <Calendar size={20} />
              Fiscal Year {stats?.budget?.year || 2026}
           </button>
           <button className="px-6 py-3 bg-primary text-white rounded-2xl font-bold flex items-center gap-2 shadow-purple hover:scale-105 transition-all">
              <Plus size={20} />
              New Budget Limit
           </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <SummaryCard 
          title="Total Yearly Budget" 
          value={`$${yearlyLimit.toLocaleString()}`} 
          icon={<Wallet size={24} />} 
          trend="Calculated"
          color="primary"
        />
        <SummaryCard 
          title="Current Utilization" 
          value={`${utilization}%`} 
          icon={<Target size={24} />} 
          trend={utilization > 80 ? "High Usage" : "Healthy"}
          color="indigo"
        />
        <SummaryCard 
          title="Monthly Allocation" 
          value={`$${monthlyAllocation.toLocaleString()}`} 
          icon={<PieChart size={24} />} 
          trend="Per Month"
          color="slate"
        />
      </div>

      {/* Categories Grid */}
      <div className="bg-white rounded-[2.5rem] p-10 shadow-soft border border-slate-50">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/5 text-primary rounded-2xl">
              <BarChart size={24} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Categorical Breakdown</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time usage tracking</p>
            </div>
          </div>
          <button className="p-3 border border-slate-100 rounded-xl text-slate-400 hover:text-primary transition-all">
            <Filter size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {categories.map((item, idx) => {
            const percentage = (item.spent / item.limit) * 100;
            const severity = percentage > 90 ? 'critical' : percentage > 70 ? 'warning' : 'info';
            
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-primary rounded-full group-hover:scale-y-125 transition-transform" />
                    <span className="font-bold text-slate-900">{item.category}</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{item.itemsCount || 0} Invoices</span>
                </div>
                <BudgetAlert 
                  category=""
                  spent={item.spent}
                  limit={item.limit}
                  severity={severity}
                  className="!bg-slate-50 !p-6 !border-none !rounded-2xl"
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
    primary: "bg-primary text-white shadow-purple",
    indigo: "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20",
    slate: "bg-white text-slate-900 shadow-soft border border-slate-100"
  };

  return (
    <div className={cn("rounded-[2.5rem] p-8 flex flex-col gap-6", colorMap[color])}>
      <div className="flex items-center justify-between">
        <div className={cn("p-3 rounded-2xl", color === 'slate' ? "bg-slate-50 text-slate-400" : "bg-white/10")}>
          {icon}
        </div>
        <span className={cn("text-[10px] font-black uppercase tracking-widest", color === 'slate' ? "text-slate-400" : "text-white/60")}>
          {trend}
        </span>
      </div>
      <div>
        <p className={cn("text-xs font-bold uppercase tracking-widest mb-1", color === 'slate' ? "text-slate-400" : "text-white/60")}>
          {title}
        </p>
        <h4 className="text-3xl font-black">{value}</h4>
      </div>
    </div>
  );
}
