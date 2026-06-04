'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader, ShieldCheck, LogOut, Settings, Users, LayoutDashboard, Menu, X, ChevronDown, Building, CreditCard, Megaphone, Activity, Globe } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { useLanguage } from '@/lib/i18n-context';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (l: any) => {
    setLanguage(l);
    setShowLanguages(false);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (user?.role !== 'SUPER_ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading || !isAuthenticated || user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1E0A0B]">
        <Loader size={24} className="animate-spin text-[#D98F8F]" />
      </div>
    );
  }

  const navLinks = [
    {
      category: t('superadmin.tenant_management'),
      items: [
        { name: t('superadmin.organizations'), href: '/super-admin/organizations', icon: Building },
      ]
    },
    {
      category: t('superadmin.configuration'),
      items: [
        { name: t('superadmin.system_settings'), href: '/super-admin/settings', icon: Settings },
        { name: t('superadmin.announcements'), href: '/super-admin/announcements', icon: Megaphone },
      ]
    },
    {
      category: t('superadmin.security'),
      items: [
        { name: t('superadmin.audit_logs'), href: '/super-admin/audit-logs', icon: Activity },
      ]
    }
  ];

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen text-[#FFFFFF] font-sans bg-[#2D0A13]">
      
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-md bg-[#1E0A0B] border border-white/10 text-white"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 lg:hidden z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Enterprise Sidebar */}
      <aside
        className={`fixed ${language === 'AR' ? 'right-0' : 'left-0'} top-0 h-screen w-[240px] bg-[#1A050A] border-x border-white/5 flex flex-col z-40 transition-transform duration-300 lg:translate-x-0 shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/5 gap-3">
          <Logo size="sm" />
          <h1 className="text-[15px] font-semibold text-white tracking-wide">
            {t('superadmin.title')} <span className="text-[#A69697] font-normal">{t('superadmin.subtitle')}</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto scrollbar-none">
          <Link
            href="/super-admin"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              pathname === '/super-admin'
                ? 'bg-[#8E1B3A]/20 text-white border border-[#8E1B3A]/30'
                : 'text-[#A69697] hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <LayoutDashboard size={16} className={pathname === '/super-admin' ? 'text-[#D98F8F]' : 'text-[#A69697]'} />
            <span className="text-[13px] font-medium">{t('superadmin.overview')}</span>
          </Link>

          {navLinks.map((section) => (
            <div key={section.category} className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-[#A69697]/70 font-semibold px-3 pb-2">{section.category}</p>
              {section.items.map(({ href, name, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      isActive
                        ? 'bg-[#8E1B3A]/20 text-white border border-[#8E1B3A]/30'
                        : 'text-[#A69697] hover:bg-white/5 hover:text-white border border-transparent'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-[#D98F8F]' : 'text-[#A69697]'} />
                    <span className="text-[13px] font-medium">{name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-between mb-4 px-2">
            <div>
              <p className="text-[13px] font-medium text-white leading-none">{user?.name || 'Super Admin'}</p>
              <p className="text-[11px] text-[#A69697] mt-1">{user?.email || 'admin@aura.finance'}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              logout();
              router.push('/auth/login');
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-[12px] font-medium text-[#A69697] hover:text-white hover:bg-white/5 border border-white/10 rounded-md transition-colors"
          >
            <LogOut size={14} /> {t('superadmin.logout')}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 ${language === 'AR' ? 'lg:mr-[240px]' : 'lg:ml-[240px]'} flex flex-col h-screen overflow-hidden`}>
        {/* Top Navbar */}
        <header className="h-16 border-b border-white/5 bg-[#1A050A]/80 backdrop-blur-md flex items-center px-8 justify-between sticky top-0 z-30">
          <div className="text-[13px] font-medium text-[#A69697]">
            {t('superadmin.system_admin')}
          </div>
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowLanguages(!showLanguages)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-transparent border border-transparent text-[#A69697] hover:text-[#FFFFFF] hover:bg-white/[0.04] transition-colors"
                title="Switch Language"
              >
                <Globe className="w-4 h-4" strokeWidth={1.5} />
              </button>
              {showLanguages && (
                <div className="absolute top-12 right-0 w-32 bg-[#1A0A0B] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 py-1">
                  {['EN', 'FR', 'AR'].map(l => (
                    <button
                      key={l}
                      onClick={() => handleLanguageChange(l)}
                      className={`w-full text-left px-4 py-2 text-[13px] hover:bg-white/5 transition-colors ${language === l ? 'text-[#D98F8F] font-bold' : 'text-[#A69697]'}`}
                    >
                      {l === 'EN' ? 'English' : l === 'FR' ? 'Français' : 'العربية'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => {
                const isLight = document.documentElement.classList.toggle('theme-light');
                localStorage.setItem('app-theme', isLight ? 'light' : 'dark');
              }}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-transparent border border-transparent text-[#A69697] hover:text-[#FFFFFF] hover:bg-white/[0.04] transition-colors"
              title="Toggle theme"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            </button>

          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 w-full mx-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
