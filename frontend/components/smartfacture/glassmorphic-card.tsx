import React from 'react';
import { cn } from '@/lib/utils';

interface GlassmorphicCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'cobalt' | 'emerald' | 'none';
  interactive?: boolean;
}

export function GlassmorphicCard({
  children,
  className,
  glow = 'cobalt',
  interactive = false,
}: GlassmorphicCardProps) {
  const glowClasses = {
    cobalt: 'hover:shadow-[0_0_30px_rgba(56,189,248,0.3)]',
    emerald: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]',
    none: '',
  };

  return (
    <div
      className={cn(
        'glass rounded-lg p-6 transition-all duration-300',
        interactive && glowClasses[glow],
        className
      )}
    >
      {children}
    </div>
  );
}
