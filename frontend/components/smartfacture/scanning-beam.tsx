import React from 'react';
import { cn } from '@/lib/utils';

interface ScanningBeamProps {
  className?: string;
  direction?: 'horizontal' | 'vertical';
  color?: 'blue' | 'emerald' | 'purple';
  speed?: 'slow' | 'normal' | 'fast';
}

export function ScanningBeam({
  className,
  direction = 'horizontal',
  color = 'blue',
  speed = 'normal',
}: ScanningBeamProps) {
  const colorClasses = {
    blue: 'bg-gradient-to-r from-transparent via-blue-500 to-transparent',
    emerald: 'bg-gradient-to-r from-transparent via-emerald-500 to-transparent',
    purple: 'bg-gradient-to-r from-transparent via-purple-500 to-transparent',
  };

  const speedClasses = {
    slow: '[animation-duration:3s]',
    normal: '[animation-duration:2s]',
    fast: '[animation-duration:1s]',
  };

  const directionClasses = {
    horizontal: 'h-1 w-full animate-scanning-beam',
    vertical: 'w-1 h-full',
  };

  return (
    <div
      className={cn(
        'absolute opacity-60 blur-sm',
        colorClasses[color],
        directionClasses[direction],
        speedClasses[speed],
        className
      )}
    />
  );
}
