'use client';

import { ThemeInitializer } from '@/components/theme-initializer';
import { Camera, Clock, Settings, LogOut, Moon, Sun, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('app-theme') || 'light';
    setTheme(stored);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#3C0D0D]">
        <Loader size={32} className="animate-spin text-[#8E1B3A]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
  };

  const isDark = theme === 'dark';

  const navItems = [
    { name: 'Upload', href: '/delivery', icon: Camera },
    { name: 'History', href: '/delivery/history', icon: Clock },
    { name: 'Settings', href: '/delivery/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#3C0D0D] text-white flex flex-col font-sans relative selection:bg-[#8E1B3A]/30">
      <ThemeInitializer />
      
      {/* Background glow effects matching main app */}
      <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-[#7B112C] blur-[200px] rounded-full opacity-15 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[30%] h-[30%] bg-[#6D071A] blur-[180px] rounded-full opacity-10 pointer-events-none"></div>

      {/* Top Header */}
      <header className="h-16 border-b border-white/10 bg-[#3C0D0D]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#8E1B3A]/40 border border-[#8E1B3A]/50 flex items-center justify-center text-white font-bold text-sm">
            D
          </div>
          <h1 className="text-lg font-bold">Delivery Portal</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {mounted && (
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#A69697] hover:text-white transition-all"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}
          <Link href="/auth/login" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#A69697] hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut size={16} />
          </Link>
        </div>
      </header>

      {/* Main Content Area - padded bottom for mobile nav */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full max-w-lg mx-auto pb-24 md:pb-8 relative z-10">
        {children}
      </main>

      {/* Bottom Navigation for Mobile (and constrained width on desktop) */}
      <nav className="fixed bottom-0 left-0 w-full z-40 bg-[#3C0D0D]/90 backdrop-blur-xl border-t border-white/10 pb-safe pt-2 px-4 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
        <div className="max-w-lg mx-auto flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 w-20 transition-all ${
                  isActive ? 'text-white translate-y-[-2px]' : 'text-[#A69697] hover:text-white/80'
                }`}
              >
                <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-[#8E1B3A] shadow-md shadow-[#8E1B3A]/30' : ''}`}>
                  <item.icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
}
