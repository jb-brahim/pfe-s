import React from 'react';
import { cn } from '@/lib/utils';

interface NeonBadgeProps {
  children: React.ReactNode;
  variant?: 'cobalt' | 'emerald' | 'success' | 'warning' | 'error';
  className?: string;
  glow?: boolean;
}

export function NeonBadge({
  children,
  variant = 'cobalt',
  className,
  glow = true,
}: NeonBadgeProps) {
  const variantClasses = {
    cobalt: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
    success: 'bg-green-500/20 text-green-300 border-green-500/50',
    warning: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
    error: 'bg-red-500/20 text-red-300 border-red-500/50',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium transition-all',
        variantClasses[variant],
        glow && 'animate-neon-glow',
        className
      )}
    >
      {children}
    </span>
  );
}
