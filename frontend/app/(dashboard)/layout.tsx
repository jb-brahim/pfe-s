'use client';

import React, { useState } from 'react';
import { Sidebar, NavItem } from '@/components/smartfacture/sidebar';
import { MainLayout } from '@/components/smartfacture/main-layout';
import { LayoutDashboard, FlaskConical, Database, Target, Users, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const navItems: NavItem[] = [
  {
    label: 'Command Center',
    href: '/dashboard',
    icon: LayoutDashboard,
    badge: 3,
  },
  {
    label: 'Processing Lab',
    href: '/processing-lab',
    icon: FlaskConical,
  },
  {
    label: 'Financial Vault',
    href: '/vault',
    icon: Database,
    badge: 5,
  },
  {
    label: 'Budget Guard',
    href: '/budget',
    icon: Target,
  },
  {
    label: 'Team Hub',
    href: '/team',
    icon: Users,
  },
  {
    label: 'Governance',
    href: '/rules',
    icon: ShieldCheck,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  
  const filteredItems = navItems.filter(item => {
    // Hide 'Processing Lab' for Admin as requested
    if (user?.role === 'ADMIN' && item.href === '/processing-lab') return false;
    
    // Hide 'Team Hub' and 'Governance' for Accountants
    if (user?.role === 'ACCOUNTANT' && (item.href === '/team' || item.href === '/rules')) return false;

    return true;
  });

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar items={filteredItems} className="flex-shrink-0 shadow-lg" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Area */}
        <MainLayout>
          <div className="px-10 py-10 overflow-y-auto h-full">
            {children}
          </div>
        </MainLayout>
      </div>
    </div>
  );
}
