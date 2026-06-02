import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Logo } from '@/components/logo';

export function LandingFooter() {
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
              Aura Finance is an enterprise-grade platform designed to revolutionize financial operations. By leveraging advanced artificial intelligence, we automate tedious tasks like invoice extraction, expense tracking, and complex approval workflows. Our mission is to empower modern finance teams to reduce manual errors, scale efficiently, and make data-driven decisions with absolute confidence.
            </p>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-7 flex flex-col md:flex-row justify-between gap-12 md:gap-8">
            <div>
              <h4 className="text-white font-bold mb-6">Platform</h4>
              <ul className="space-y-4">
                <li><Link href="/" className="text-[#A69697] hover:text-[#D98F8F] text-sm transition-colors">Home</Link></li>
                <li><Link href="/features" className="text-[#A69697] hover:text-[#D98F8F] text-sm transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-[#A69697] hover:text-[#D98F8F] text-sm transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Resources</h4>
              <ul className="space-y-4">
                <li><Link href="/ttn" className="text-[#A69697] hover:text-[#D98F8F] text-sm transition-colors">TTN Integration</Link></li>
                <li><Link href="/about" className="text-[#A69697] hover:text-[#D98F8F] text-sm transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-[#A69697] hover:text-[#D98F8F] text-sm transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Contact</h4>
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
            © {new Date().getFullYear()} Aura Finance. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
