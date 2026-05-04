import React from 'react';
import { cn } from '@/lib/utils';

interface GlowingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  loading?: boolean;
}

export function GlowingButton({
  children,
  variant = 'primary',
  size = 'md',
  glow = true,
  loading = false,
  className,
  disabled,
  ...props
}: GlowingButtonProps) {
  const variantClasses = {
    primary:
      'bg-blue-600 hover:bg-blue-700 text-white border border-blue-500/50 hover:border-blue-400',
    secondary:
      'bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700/50 hover:border-blue-500/50',
    success:
      'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500/50 hover:border-emerald-400',
    ghost: 'text-slate-300 hover:text-white hover:bg-slate-800/50 border border-slate-700/30',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const glowClasses = {
    primary: glow ? 'hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]' : '',
    secondary: glow ? 'hover:shadow-[0_0_20px_rgba(56,189,248,0.3)]' : '',
    success: glow ? 'hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]' : '',
    ghost: glow ? 'hover:shadow-[0_0_15px_rgba(56,189,248,0.2)]' : '',
  };

  return (
    <button
      className={cn(
        'relative rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        glowClasses[variant],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
