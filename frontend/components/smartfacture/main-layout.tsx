import React from 'react';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <main
      className={cn(
        'flex-1 overflow-auto',
        className
      )}
    >
      <div className="min-h-full">
        {children}
      </div>
    </main>
  );
}
