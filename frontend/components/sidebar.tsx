'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Logo } from '@/components/logo';
import { useLanguage } from '@/lib/i18n-context';
import {
  LayoutGrid,
  FileText,
  ClipboardCheck,
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
  Building2,
  Key
} from 'lucide-react';
import { useState } from 'react';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { language, t } = useLanguage();

  const mainItems = [
    { href: '/dashboard', label: t('sidebar.dashboard'), icon: LayoutGrid, adminOnly: false },
    { href: '/invoices', label: t('sidebar.invoices'), icon: FileText, adminOnly: false },
    { href: '/approval', label: t('sidebar.approval'), icon: ClipboardCheck, adminOnly: true },
    { href: '/reports', label: t('sidebar.reports'), icon: BarChart3, adminOnly: true },
  ];

  const managementItems = [
    { href: '/suppliers', label: t('sidebar.suppliers'), icon: Building2, adminOnly: true },
    { href: '/team', label: t('sidebar.team'), icon: Users, adminOnly: true },
    { href: '/subscription', label: t('sidebar.subscription') || 'Subscription', icon: Key, adminOnly: true },
    { href: '/services', label: t('sidebar.services') || 'Services', icon: Zap, adminOnly: true },
    { href: '/messages', label: t('sidebar.messages') || 'Messages', icon: Mail, adminOnly: false },
    { href: '/settings', label: t('sidebar.settings'), icon: Settings, adminOnly: false },
  ];

  const filteredMain = mainItems.filter(i => user?.role === 'ADMIN' || !i.adminOnly);
  const filteredManagement = managementItems.filter(i => user?.role === 'ADMIN' || !i.adminOnly);

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
        className={`fixed ${language === 'AR' ? 'right-0' : 'left-0'} top-0 h-screen w-[260px] bg-[#1E0A0B]/50 backdrop-blur-xl border-x border-white/[0.06] flex flex-col z-40 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : (language === 'AR' ? 'translate-x-full' : '-translate-x-full')
        }`}
      >
        {/* Logo */}
        <div className="pt-8 pb-6 px-7 flex items-center gap-3">
          <Logo size="sm" />
          <h1 className="text-[18px] font-semibold text-[#FFFFFF] tracking-tight">{t('sidebar.title')} <span className="text-[#A69697] font-normal">{t('sidebar.subtitle')}</span></h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-3 overflow-y-auto scrollbar-none">
          <p className="text-[11px] uppercase tracking-widest text-[#A69697]/60 font-semibold px-4 pt-2 pb-3">{t('sidebar.main')}</p>
          {filteredMain.map(({ href, label, icon: Icon }) => (
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

          {filteredManagement.length > 0 && (
            <>
              <p className="text-[11px] uppercase tracking-widest text-[#A69697]/60 font-semibold px-4 pt-6 pb-3">{t('sidebar.management')}</p>
              {filteredManagement.map(({ href, label, icon: Icon }) => (
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
            </>
          )}


        </nav>

        {/* User Profile Footer */}
        <div className="p-4 mt-auto">
          <button 
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-transparent border border-transparent hover:bg-white/[0.04] transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-[#8E1B3A] flex items-center justify-center">
              {user?.profileImage ? (
                <img src={`${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}/${user.profileImage}`} alt="User" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-[12px] font-semibold">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
              )}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[13px] font-medium text-[#FFFFFF] truncate">{user?.name || 'User'}</p>
              <p className="text-[11px] text-[#A69697] group-hover:text-[#D98F8F] transition-colors">{t('sidebar.logout')}</p>
            </div>
            <LogOut size={16} className="text-[#A69697] group-hover:text-[#D98F8F] transition-colors" />
          </button>
        </div>
      </aside>
    </>
  );
}
