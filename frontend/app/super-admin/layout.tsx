'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader, ShieldCheck, LogOut, Settings, Users, LayoutDashboard, Menu, X, ChevronDown, Building, CreditCard, Megaphone, Activity, Globe, Bell, Check } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { useLanguage } from '@/lib/i18n-context';
import { notificationAPI } from '@/lib/api';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await notificationAPI.getAll();
        setNotifications(response.data || []);
      } catch (error) {
        console.log('Failed to fetch notifications');
      }
    };

    if (isAuthenticated && user?.role === 'SUPER_ADMIN') {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  const unreadCount = notifications.filter((n) => !n.isRead && !n.read).length;

  const handleMarkAsRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true, read: true } : n));
    await notificationAPI.markAsRead(id);
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
    await notificationAPI.markAllAsRead();
  };

  const handleNotifClick = async (notif: any) => {
    if (!notif.isRead && !notif.read) {
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true, read: true } : n));
      await notificationAPI.markAsRead(notif._id);
    }
    setShowNotifications(false);
    
    // Super admin routing for notifs
    if (notif.type === 'NEW_MESSAGE') {
      router.push('/super-admin/messages');
    }
  };

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
        { name: t('sidebar.messages') || 'Messages', href: '/super-admin/messages', icon: Megaphone },
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
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-transparent border border-transparent text-[#A69697] hover:text-[#FFFFFF] hover:bg-white/[0.04] transition-colors relative"
              >
                <Bell className="w-4 h-4" strokeWidth={1.5} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#B34E56] rounded-full" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute top-12 right-0 w-80 bg-[#1A0A0B] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white text-[14px]">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-[#B34E56] text-white px-1.5 py-0.5 rounded-full font-bold">{unreadCount}</span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-[#D98F8F] hover:text-white transition-colors font-medium flex items-center gap-1"
                      >
                        <Check size={10} /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-[#A69697] text-[13px] px-4 py-6 text-center">No notifications yet</p>
                    ) : (
                      notifications.slice(0, 10).map((notif) => {
                        const isUnread = !notif.isRead && !notif.read;
                        return (
                          <div
                            key={notif._id}
                            onClick={() => handleNotifClick(notif)}
                            className={`group px-4 py-3 transition-colors cursor-pointer border-b border-white/[0.03] last:border-0 ${
                              isUnread ? 'bg-white/[0.03] hover:bg-white/[0.06]' : 'hover:bg-white/[0.02]'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                notif.type === 'NEW_MESSAGE' ? 'bg-[#D98F8F]' : 'bg-white/40'
                              } ${!isUnread ? 'opacity-30' : ''}`} />
                              <div className="flex-1 min-w-0">
                                <p className={`text-[13px] leading-tight truncate ${
                                  isUnread ? 'text-white font-medium' : 'text-[#A69697]'
                                }`}>
                                  {notif.title || notif.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

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
