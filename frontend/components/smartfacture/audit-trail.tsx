import React from 'react';
import { cn } from '@/lib/utils';

export interface AuditEntry {
  id: string;
  timestamp: Date;
  action: string;
  user: string;
  details?: string;
  status?: 'success' | 'pending' | 'error' | 'warning';
}

interface AuditTrailProps {
  entries: AuditEntry[];
  className?: string;
  maxHeight?: string;
}

export function AuditTrail({
  entries,
  className,
  maxHeight = 'max-h-96',
}: AuditTrailProps) {
  const statusColor = {
    success: 'text-emerald-500 bg-emerald-500/10',
    pending: 'text-amber-500 bg-amber-500/10',
    warning: 'text-amber-600 bg-amber-500/10',
    error: 'text-red-500 bg-red-500/10',
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className={cn('overflow-y-auto', maxHeight)}>
        {entries.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            No audit entries yet
          </p>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-card rounded-2xl p-4 flex items-start gap-4 border border-border shadow-sm"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-foreground font-semibold text-sm">
                      {entry.action}
                    </span>
                    {entry.status && (
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter',
                          statusColor[entry.status]
                        )}
                      >
                        {entry.status}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs mb-1">
                    {entry.user} •{' '}
                    {entry.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {entry.details && (
                    <p className="text-muted-foreground text-xs">{entry.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
