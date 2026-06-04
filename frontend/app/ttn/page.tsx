'use client';

import { Network, Server, Globe2, ShieldCheck, Database, ArrowRight } from 'lucide-react';
import { LandingNavbar } from '@/components/landing-navbar';
import { LandingFooter } from '@/components/landing-footer';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n-context';

export default function TTNPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-[#1A0A0B] text-white selection:bg-[#D98F8F]/30 font-sans">
      <LandingNavbar />

      <main className="pt-32 pb-20 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="text-center max-w-[900px] mx-auto mb-20">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#8E1B3A]/20 border border-[#8E1B3A]/30 text-[#D98F8F] font-bold text-sm tracking-wide mb-6">
            {t('landing.ttn.badge') || 'OFFICIAL INTEGRATION'}
          </div>
          <h1 className="text-[48px] md:text-[64px] font-extrabold tracking-tight mb-6">
            {t('landing.ttn.title') || 'Seamless TTN Compliance'}
          </h1>
          <p className="text-[#A69697] text-[18px] md:text-[22px] leading-relaxed max-w-3xl mx-auto">
            {t('landing.ttn.subtitle') || "Aura Finance is fully integrated with Tunisia's TradeNet (TTN). Automatically validate, extract, and submit electronic invoices in perfect compliance with national standards."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-[24px] p-8 hover:bg-[rgba(255,255,255,0.04)] transition-colors">
            <Globe2 size={32} className="text-[#D98F8F] mb-6" />
            <h3 className="text-[20px] font-bold mb-3">{t('landing.ttn.multi_region') || 'Multi-Region Compliance'}</h3>
            <p className="text-[#A69697] leading-relaxed">
              {t('landing.ttn.multi_region_desc') || 'Data is localized and stored according to regional compliance laws (GDPR, CCPA, etc.). TTN seamlessly routes requests to the geographically nearest compliant data center.'}
            </p>
          </div>
          <div className="bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-[24px] p-8 hover:bg-[rgba(255,255,255,0.04)] transition-colors">
            <Server size={32} className="text-[#D98F8F] mb-6" />
            <h3 className="text-[20px] font-bold mb-3">{t('landing.ttn.high_availability') || 'High Availability'}</h3>
            <p className="text-[#A69697] leading-relaxed">
              {t('landing.ttn.high_availability_desc') || 'With 99.99% guaranteed uptime, our infrastructure is distributed across highly available clusters, ensuring your finance operations never skip a beat.'}
            </p>
          </div>
          <div className="bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-[24px] p-8 hover:bg-[rgba(255,255,255,0.04)] transition-colors">
            <Database size={32} className="text-[#D98F8F] mb-6" />
            <h3 className="text-[20px] font-bold mb-3">{t('landing.ttn.bespoke_training') || 'Bespoke Enterprise Training'}</h3>
            <p className="text-[#A69697] leading-relaxed">
              {t('landing.ttn.bespoke_desc') || 'We provide isolated environments for large organizations to train our machine learning models on their specific, proprietary invoice formats.'}
            </p>
          </div>
        </div>



      </main>
      <LandingFooter />
    </div>
  );
}
