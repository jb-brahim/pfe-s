import React from 'react';
import { cn } from '@/lib/utils';
import { NeonBadge } from './neon-badge';

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  vendor: string;
  amount: number;
  currency?: string;
  date: Date;
  dueDate: Date;
  status: 'pending' | 'approved' | 'paid' | 'overdue';
  category?: string;
}

interface InvoiceCardProps {
  invoice: InvoiceData;
  onView?: (id: string) => void;
  onApprove?: (id: string) => void;
  className?: string;
}

export function InvoiceCard({
  invoice,
  onView,
  onApprove,
  className,
}: InvoiceCardProps) {
  const statusConfig = {
    pending: { badge: 'warning', text: 'Pending' },
    approved: { badge: 'cobalt' as const, text: 'Approved' },
    paid: { badge: 'success', text: 'Paid' },
    overdue: { badge: 'error', text: 'Overdue' },
  };

  const isOverdue =
    invoice.status === 'overdue' ||
    (invoice.dueDate < new Date() && invoice.status !== 'paid');

  const config = statusConfig[invoice.status];

  return (
    <div
      className={cn(
        'glass rounded-lg p-5 border border-slate-700/50 hover:border-blue-500/30 transition-all group cursor-pointer',
        className
      )}
      onClick={() => onView?.(invoice.id)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-slate-400 text-xs mb-1">Invoice</p>
          <p className="text-slate-100 font-bold">{invoice.invoiceNumber}</p>
        </div>
        <NeonBadge variant={config.badge as any}>{config.text}</NeonBadge>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-slate-400 text-xs">Vendor</p>
          <p className="text-slate-200 text-sm font-semibold">{invoice.vendor}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-slate-400 text-xs">Amount</p>
            <p className="text-blue-300 text-sm font-bold">
              {invoice.currency || 'DT'}
              {invoice.amount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Due Date</p>
            <p className={cn('text-sm font-semibold', isOverdue ? 'text-red-400' : 'text-slate-200')}>
              {invoice.dueDate.toLocaleDateString()}
            </p>
          </div>
        </div>

        {invoice.category && (
          <div>
            <p className="text-slate-400 text-xs">Category</p>
            <p className="text-slate-300 text-xs">{invoice.category}</p>
          </div>
        )}
      </div>

      {invoice.status === 'pending' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onApprove?.(invoice.id);
          }}
          className="w-full mt-4 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
        >
          Approve
        </button>
      )}
    </div>
  );
}
