'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function Header({ title, subtitle, actions, className }: HeaderProps) {
  const [notificationCount, setNotificationCount] = useState(3);

  return (
    <header
      className={cn(
        'glass border-b border-slate-700/50 sticky top-0 z-40',
        className
      )}
    >
      <div className="px-8 py-6 flex items-center justify-between">
        {/* Title Section */}
        <div>
          <h1 className="text-3xl font-bold text-slate-100 mb-1">{title}</h1>
          {subtitle && (
            <p className="text-slate-400 text-sm">{subtitle}</p>
          )}
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-4">
          {actions}

          {/* Notifications */}
          <button className="relative p-2 hover:bg-slate-800/50 rounded-lg transition-colors text-slate-400 hover:text-slate-200">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>

          {/* User Menu */}
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-800/50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
              AD
            </div>
            <span className="text-slate-300 text-sm font-medium">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
}
