'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: {
    value: number;
    direction: 'up' | 'down';
  };
  icon?: React.ReactNode;
  trend?: 'positive' | 'negative' | 'neutral';
  className?: string;
  onClick?: () => void;
}

export function MetricCard({
  label,
  value,
  unit,
  change,
  icon,
  trend = 'neutral',
  className,
  onClick,
}: MetricCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'bg-card rounded-[2rem] p-6 shadow-soft border border-border flex flex-col gap-4 transition-all group cursor-pointer',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="p-3 rounded-2xl bg-muted text-primary group-hover:bg-primary/10 transition-colors">
          {icon}
        </div>
        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-border text-muted-foreground group-hover:border-primary/20 group-hover:text-primary transition-all">
          <TrendingUp size={14} className="group-hover:rotate-45 transition-transform" />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-foreground tracking-tight">{value}</span>
          {unit && <span className="text-muted-foreground text-sm font-bold">{unit}</span>}
        </div>
      </div>

      {change && (
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <div className={cn(
            'flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter',
            trend === 'positive' ? 'text-emerald-500' : 
            trend === 'negative' ? 'text-red-500' : 
            'text-blue-500'
          )}>
            {change.direction === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {change.value}%
          </div>
          <span className="text-slate-400 text-[10px] font-bold">VS LAST MONTH</span>
        </div>
      )}
    </motion.div>
  );
}
