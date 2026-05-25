'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader, ShieldCheck, LogOut, Settings, Users, LayoutDashboard, Menu, X, ChevronDown, Building, CreditCard, Megaphone, Activity } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
      category: 'Tenant Management',
      items: [
        { name: 'Organizations', href: '/super-admin/organizations', icon: Building },
        { name: 'Global Users', href: '/super-admin/users', icon: Users },
      ]
    },
    {
      category: 'Finance',
      items: [
        { name: 'Billing & Subscriptions', href: '/super-admin/billing', icon: CreditCard },
      ]
    },
    {
      category: 'Configuration',
      items: [
        { name: 'System Settings', href: '/super-admin/settings', icon: Settings },
        { name: 'Announcements', href: '/super-admin/announcements', icon: Megaphone },
      ]
    },
    {
      category: 'Security & Compliance',
      items: [
        { name: 'Audit Logs', href: '/super-admin/audit-logs', icon: Activity },
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
        className={`fixed left-0 top-0 h-screen w-[240px] bg-[#1A050A] border-r border-white/5 flex flex-col z-40 transition-transform duration-300 lg:translate-x-0 shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/5 gap-3">
          <Logo size="sm" />
          <h1 className="text-[15px] font-semibold text-white tracking-wide">
            Aura <span className="text-[#A69697] font-normal">SuperAdmin</span>
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
            <span className="text-[13px] font-medium">Overview</span>
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
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-[240px] flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-white/5 bg-[#1A050A]/80 backdrop-blur-md flex items-center px-8 justify-between sticky top-0 z-30">
          <div className="text-[13px] font-medium text-[#A69697]">
            System Administration
          </div>
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-[12px] text-[#A69697]">All Systems Operational</span>
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
