'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  FlaskConical, 
  Database, 
  HelpCircle,
  LucideIcon,
  User,
  Settings,
  PieChart,
  Wallet,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: number;
}

interface SidebarProps {
  items: NavItem[];
  className?: string;
}

export function Sidebar({ items, className }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false);
  const { logout } = useAuth();

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <aside
      className={cn(
        'bg-card border-r border-border transition-all duration-500 ease-in-out z-50 flex flex-col',
        collapsed ? 'w-20' : 'w-72',
        className
      )}
    >
      {/* Header / Logo */}
      <div className="px-8 py-10">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-bold text-white shadow-purple">
                SF
              </div>
              <span className="font-extrabold text-foreground text-xl tracking-tight">
                SmartFacture
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-muted rounded-xl transition-all text-slate-400 hover:text-primary"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        <div className="px-4 mb-4">
          {!collapsed && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Menu</span>}
        </div>
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon || LayoutDashboard;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300',
                isActive
                  ? 'bg-primary text-white shadow-purple'
                  : 'text-slate-500 hover:text-primary hover:bg-muted'
              )}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 font-bold text-sm">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={cn(
                      'px-2 py-0.5 rounded-lg text-[10px] font-bold',
                      isActive ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                    )}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}

        {/* Secondary Menu */}
        <div className="pt-6 pb-2 px-4">
           {!collapsed && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Settings</span>}
        </div>
        <Link href="/profile" className="group flex items-center gap-3 px-5 py-4 rounded-2xl text-slate-500 hover:text-primary hover:bg-muted transition-all">
          <User size={20} />
          {!collapsed && <span className="font-bold text-sm">Profile</span>}
        </Link>
        <Link href="/settings" className="group flex items-center gap-3 px-5 py-4 rounded-2xl text-slate-500 hover:text-primary hover:bg-muted transition-all">
          <Settings size={20} />
          {!collapsed && <span className="font-bold text-sm">Settings</span>}
        </Link>
      </nav>

      {/* Premium Upgrade Card */}
      {!collapsed && (
        <div className="p-6 mt-auto">
          <div className="bg-gradient-to-br from-indigo-500 to-primary rounded-3xl p-6 text-white shadow-purple relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <p className="text-sm font-bold mb-1">Get a Premium Account</p>
            <p className="text-[10px] text-white/80 mb-4 font-medium">Unlock advanced AI features and unlimited storage.</p>
            <button className="w-full py-2.5 rounded-xl bg-white text-primary text-xs font-bold hover:bg-slate-50 transition-all shadow-sm">
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className={cn("p-4 space-y-2", collapsed ? "flex flex-col items-center" : "px-6 pb-6")}>
         <button 
           onClick={toggleTheme}
           className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-muted transition-all w-full font-bold text-sm"
         >
            {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
            {!collapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
         </button>
         <button 
           onClick={logout}
           className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all w-full font-bold text-sm"
         >
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
         </button>
      </div>
    </aside>
  );
}
