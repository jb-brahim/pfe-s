'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from './sidebar';
import { Navbar } from './navbar';
import { Loader } from 'lucide-react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1E0A0B]">
        <Loader size={32} className="animate-spin text-[#8E1B3A]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen relative text-[#FFFFFF] font-sans overflow-hidden selection:bg-[#8E1B3A]/30 bg-[#1E0A0B]">
      {/* Subtle ambient glow — toned down from the AI-ish massive blurs */}
      <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-[#7B112C] blur-[200px] rounded-full opacity-15 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[30%] h-[30%] bg-[#6D071A] blur-[180px] rounded-full opacity-10 pointer-events-none"></div>

      <div className="relative z-10 flex w-full h-full">
        <Sidebar />
        <div className="flex-1 lg:ml-[260px] flex flex-col h-screen overflow-hidden relative">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6 md:p-8 w-full max-w-[1600px] mx-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
