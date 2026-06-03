import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Logo } from '@/components/logo';
import { useLanguage } from '@/lib/i18n-context';

export function LandingFooter() {
  const { t } = useLanguage();
  return (
    <footer className="relative border-t border-white/10 pt-20 pb-10 overflow-hidden bg-[#1A0A0B]">
      {/* Background glow for footer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[200px] bg-[#8E1B3A] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
      
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-5">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Logo size="md" className="shadow-[0_0_15px_rgba(217,143,143,0.4)]" />
              <span className="text-[20px] font-bold text-white tracking-tight">Aura Finance</span>
            </Link>
            <p className="text-[#A69697] text-sm leading-relaxed mb-6">
              {t('landing.footer.desc')}
            </p>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-7 flex flex-col md:flex-row justify-between gap-12 md:gap-8">
            <div>
              <h4 className="text-white font-bold mb-6">{t('landing.footer.platform')}</h4>
              <ul className="space-y-4">
                <li><Link href="/" className="text-[#A69697] hover:text-[#D98F8F] text-sm transition-colors">{t('landing.navbar.home')}</Link></li>
                <li><Link href="/features" className="text-[#A69697] hover:text-[#D98F8F] text-sm transition-colors">{t('landing.navbar.features')}</Link></li>
                <li><Link href="/pricing" className="text-[#A69697] hover:text-[#D98F8F] text-sm transition-colors">{t('landing.navbar.pricing')}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">{t('landing.footer.resources')}</h4>
              <ul className="space-y-4">
                <li><Link href="/ttn" className="text-[#A69697] hover:text-[#D98F8F] text-sm transition-colors">{t('landing.navbar.ttn')}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">{t('landing.navbar.contact')}</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-[#A69697] text-sm">
                  <Mail size={18} className="text-[#D98F8F] shrink-0 mt-0.5" />
                  <span>support@aurafinance.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex justify-center items-center text-center">
          <p className="text-[#A69697] text-sm">
            © {new Date().getFullYear()} {t('landing.footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
