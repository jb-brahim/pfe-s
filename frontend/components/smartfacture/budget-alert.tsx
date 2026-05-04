'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BudgetAlertProps {
  category: string;
  spent: number;
  limit: number;
  currency?: string;
  severity?: 'info' | 'warning' | 'critical';
  className?: string;
}

export function BudgetAlert({
  category,
  spent,
  limit,
  currency = '$',
  severity = 'info',
  className,
}: BudgetAlertProps) {
  const percentage = (spent / limit) * 100;

  const severityColors = {
    info: 'bg-primary',
    warning: 'bg-amber-500',
    critical: 'bg-red-500',
  };

  const severityText = {
    info: 'text-primary',
    warning: 'text-amber-500',
    critical: 'text-red-500',
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-700 text-sm">{category}</span>
        <span className={cn('text-xs font-black uppercase tracking-tighter', severityText[severity])}>
          {percentage.toFixed(0)}% used
        </span>
      </div>

      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-1000 ease-out', severityColors[severity])}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        <span>
          {currency}{spent.toLocaleString()}
        </span>
        <span>
          {currency}{limit.toLocaleString()} limit
        </span>
      </div>
    </div>
  );
}
