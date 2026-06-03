'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { useLanguage } from '@/lib/i18n-context';
import { Globe } from 'lucide-react';

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const { language: lang, setLanguage: setLang, t } = useLanguage();

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
          <Link href="/" className="hover:text-white transition-colors">{t('landing.navbar.home') || 'Home'}</Link>
          <Link href="/features" className="hover:text-white transition-colors">{t('landing.navbar.features') || 'Features'}</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">{t('landing.navbar.pricing') || 'Pricing'}</Link>
          <Link href="/ttn" className="hover:text-white transition-colors">{t('landing.navbar.ttn') || 'TTN Integration'}</Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setShowLanguages(!showLanguages)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-transparent border border-transparent text-[#A69697] hover:text-[#FFFFFF] hover:bg-white/[0.04] transition-colors"
              title="Switch Language"
            >
              <Globe className="w-4 h-4" strokeWidth={1.5} />
            </button>
            {showLanguages && (
              <div className="absolute top-12 right-0 w-32 bg-[#1A0A0B] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 py-1">
                {(['EN', 'FR', 'AR'] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => { setLang(l); setShowLanguages(false); }}
                    className={`w-full text-left px-4 py-2 text-[13px] hover:bg-white/5 transition-colors ${lang === l ? 'text-[#D98F8F] font-bold' : 'text-[#A69697]'}`}
                  >
                    {l === 'EN' ? 'English' : l === 'FR' ? 'Français' : 'العربية'}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link href="/login" className="text-[14px] font-medium text-white hover:text-[#D98F8F] transition-colors hidden sm:block">
            {t('landing.navbar.login') || 'Login'}
          </Link>
          <Link href="/auth/register" className="px-5 py-2.5 rounded-full bg-white text-[#1A0A0B] text-[14px] font-bold hover:bg-gray-200 transition-colors">
            {t('landing.navbar.get_started') || 'Get Started'}
          </Link>
        </div>
      </div>
    </nav>
  );
}
