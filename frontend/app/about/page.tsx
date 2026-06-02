'use client';

import { LandingNavbar } from '@/components/landing-navbar';
import { LandingFooter } from '@/components/landing-footer';
import { Users, Target, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n-context';

export default function AboutPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-[#1A0A0B] text-white selection:bg-[#D98F8F]/30 overflow-x-hidden flex flex-col">
      <LandingNavbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              {t('landing.about.title_1') || 'Empowering Modern'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A]">{t('landing.about.title_highlight') || 'Finance Teams'}</span>
            </h1>
            <p className="text-[#A69697] text-lg md:text-xl leading-relaxed">
              {t('landing.about.subtitle') || 'Aura Finance was built with a single mission: to eliminate the friction from financial operations so businesses can focus on growth.'}
            </p>
          </div>

          {/* Our Story Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8E1B3A]/20 to-transparent rounded-3xl blur-2xl"></div>
              <div className="relative bg-[#1E0A0B] border border-white/5 p-8 rounded-3xl h-full flex flex-col justify-center min-h-[400px]">
                <h2 className="text-3xl font-bold mb-6 text-white">{t('landing.about.our_story') || 'Our Story'}</h2>
                <div className="space-y-4 text-[#A69697] text-[15px] leading-relaxed">
                  <p>
                    {t('landing.about.story_p1') || "We realized that finance teams were spending countless hours on manual data entry, invoice processing, and navigating clunky legacy software. This wasn't just inefficient; it was holding businesses back."}
                  </p>
                  <p>
                    {t('landing.about.story_p2') || "Aura Finance was born out of the necessity for a smarter, faster, and more intuitive financial platform. By leveraging cutting-edge Artificial Intelligence, we automate the tedious tasks, ensure compliance with national standards like TTN, and provide real-time insights that actually matter."}
                  </p>
                  <p>
                    {t('landing.about.story_p3') || "Today, we are proud to serve enterprises that trust us to handle their most critical financial workflows, giving them back their most valuable asset: time."}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: <Zap className="text-[#D98F8F]" size={24} />, title: t('landing.about.innovation') || "Innovation First", desc: t('landing.about.innovation_desc') || "We constantly push the boundaries of what AI can do for finance." },
                { icon: <Shield className="text-[#D98F8F]" size={24} />, title: t('landing.about.security') || "Absolute Security", desc: t('landing.about.security_desc') || "Bank-grade encryption and strict compliance protocols." },
                { icon: <Users className="text-[#D98F8F]" size={24} />, title: t('landing.about.user_centric') || "User-Centric", desc: t('landing.about.user_centric_desc') || "Software that your team will actually love to use." },
                { icon: <Target className="text-[#D98F8F]" size={24} />, title: t('landing.about.precision') || "Data Precision", desc: t('landing.about.precision_desc') || "Near 100% accuracy in invoice and receipt extraction." }
              ].map((val, idx) => (
                <div key={idx} className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl hover:bg-white/[0.04] transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-[#D98F8F]/10 flex items-center justify-center mb-4">
                    {val.icon}
                  </div>
                  <h3 className="text-white font-bold mb-2">{val.title}</h3>
                  <p className="text-[#A69697] text-sm leading-relaxed">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#8E1B3A]/40 to-[#1A0A0B] border border-[#8E1B3A]/30 p-12 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t('landing.about.ready_to_transform') || 'Ready to transform your finance operations?'}</h2>
            <p className="text-[#D98F8F] text-lg mb-8 max-w-2xl mx-auto">
              {t('landing.about.join_growing') || 'Join the growing number of companies that use Aura Finance to scale effortlessly.'}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/contact" className="px-8 py-3.5 rounded-full bg-white text-[#1A0A0B] font-semibold text-sm hover:bg-gray-100 transition-colors">
                {t('landing.about.contact_sales') || 'Contact Sales'}
              </Link>
              <Link href="/pricing" className="px-8 py-3.5 rounded-full bg-[#1A0A0B] border border-white/20 text-white font-semibold text-sm hover:bg-white/5 transition-colors">
                {t('landing.about.view_pricing') || 'View Pricing'}
              </Link>
            </div>
          </div>

        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
