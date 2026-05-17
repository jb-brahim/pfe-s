'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutGrid,
  FileText,
  Wallet,
  BarChart3,
  Mail,
  Users,
  Settings,
  Zap,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Building2
} from 'lucide-react';
import { useState } from 'react';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { href: '/invoices', label: 'Invoices', icon: FileText },
    { href: '/expenses', label: 'Expenses', icon: Wallet },
    { href: '/reports', label: 'Reports', icon: BarChart3 },
    { href: '/mail', label: 'Mail', icon: Mail },
    { href: '/suppliers', label: 'Suppliers', icon: Building2 },
    { href: '/team', label: 'Team', icon: Users },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-6 left-6 z-50 lg:hidden p-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-white/10 text-[#FFFFFF]"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-[260px] bg-[#1E0A0B]/50 backdrop-blur-xl border-r border-white/[0.06] flex flex-col z-40 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="pt-8 pb-6 px-7 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#8E1B3A] flex items-center justify-center">
            <span className="text-white font-semibold text-[14px]">A</span>
          </div>
          <h1 className="text-[18px] font-semibold text-[#FFFFFF] tracking-tight">Aura <span className="text-[#A69697] font-normal">Finance</span></h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-3 overflow-y-auto scrollbar-none">
          <p className="text-[11px] uppercase tracking-widest text-[#A69697]/60 font-semibold px-4 pt-2 pb-3">Main</p>
          {navItems.slice(0, 5).map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-150 group ${
                isActive(href)
                  ? 'bg-white/[0.08] text-white'
                  : 'text-[#A69697] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon size={18} strokeWidth={1.5} className={isActive(href) ? 'text-[#D98F8F]' : 'text-inherit'} />
              <span className={`text-[14px] ${isActive(href) ? 'font-medium' : 'font-normal'}`}>{label}</span>
            </Link>
          ))}

          <p className="text-[11px] uppercase tracking-widest text-[#A69697]/60 font-semibold px-4 pt-6 pb-3">Management</p>
          {navItems.slice(5).map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-150 group ${
                isActive(href)
                  ? 'bg-white/[0.08] text-white'
                  : 'text-[#A69697] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon size={18} strokeWidth={1.5} className={isActive(href) ? 'text-[#D98F8F]' : 'text-inherit'} />
              <span className={`text-[14px] ${isActive(href) ? 'font-medium' : 'font-normal'}`}>{label}</span>
            </Link>
          ))}

          <div className="pt-4">
            <Link
              href="/ai-insights"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-150 group ${
                isActive('/ai-insights')
                  ? 'bg-white/[0.08] text-white'
                  : 'text-[#A69697] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Zap size={18} strokeWidth={1.5} className={isActive('/ai-insights') ? 'text-[#D98F8F]' : 'text-inherit'} />
              <span className={`text-[14px] ${isActive('/ai-insights') ? 'font-medium' : 'font-normal'}`}>AI Insights</span>
            </Link>
          </div>
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 mt-auto relative">
          
          {/* Dropdown Menu */}
          {profileOpen && (
            <div className="absolute bottom-[72px] left-4 right-4 bg-[#1A0A0B] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-white text-[13px] font-semibold">{user?.name || 'User'}</p>
                <p className="text-[#A69697] text-[11px]">{user?.email || ''}</p>
              </div>
              <div className="p-1.5">
                <Link href="/settings" className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#A69697] hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  <Settings size={14} /> Account Settings
                </Link>
                <button 
                  onClick={() => {
                    logout();
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#D98F8F] hover:text-white hover:bg-[#8E1B3A]/20 rounded-lg transition-colors"
                >
                  <LogOut size={14} /> Log Out
                </button>
              </div>
            </div>
          )}

          <div 
            onClick={() => setProfileOpen(!profileOpen)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
              profileOpen ? 'bg-white/[0.06] border-white/10' : 'bg-transparent border-transparent hover:bg-white/[0.04]'
            }`}
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-[#8E1B3A] flex items-center justify-center">
              <span className="text-white text-[12px] font-semibold">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#FFFFFF] truncate">{user?.name || 'User'}</p>
            </div>
            <ChevronDown size={14} className={`text-[#A69697] transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </aside>
    </>
  );
}
