'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#1A0A0B]/90 backdrop-blur-xl border-b border-white/10 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo size="md" className="shadow-[0_0_15px_rgba(217,143,143,0.4)]" />
          <span className="text-[20px] font-bold tracking-tight text-white">Aura Finance</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-[14px] text-[#A69697] font-medium">
          <Link href="/features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/ttn" className="hover:text-white transition-colors">TTN</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-white px-5 py-2.5 rounded-full text-[14px] font-bold border border-white/20 hover:bg-white/10 transition-all hover:-translate-y-0.5">
            Login
          </Link>
          <Link href="/auth/register" className="bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white px-6 py-2.5 rounded-full text-[14px] font-bold shadow-[0_0_15px_rgba(142,27,58,0.4)] hover:shadow-[0_0_25px_rgba(217,143,143,0.6)] transition-all hover:-translate-y-0.5">
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}
