'use client';

import { useState } from 'react';
import { LandingNavbar } from '@/components/landing-navbar';
import { LandingFooter } from '@/components/landing-footer';
import { ChevronDown, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n-context';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const { t } = useLanguage();

  const faqs = [
    { 
      q: t('landing.pricing_faq.q1') || 'How does the billing cycle work?', 
      a: t('landing.pricing_faq.a1') || 'We offer both monthly and annual billing options. Annual plans come with a 20% discount applied automatically.' 
    },
    { 
      q: t('landing.pricing_faq.q2') || 'Can I change plans later?', 
      a: t('landing.pricing_faq.a2') || 'Yes, you can upgrade or downgrade your plan at any time. Prorated charges or credits will automatically be applied to your account.' 
    },
    { 
      q: t('landing.pricing_faq.q3') || 'What payment methods do you accept?', 
      a: t('landing.pricing_faq.a3') || 'We accept all major credit cards, wire transfers for Enterprise customers, and standard local bank transfers.' 
    },
    { 
      q: t('landing.pricing_faq.q4') || 'Is there a long-term contract?', 
      a: t('landing.pricing_faq.a4') || 'No, unless you choose an Enterprise custom agreement. Standard plans are strictly month-to-month or year-to-year.' 
    },
    { q: t('landing.pricing_faq.q5') || 'Is there a free trial available?', a: t('landing.pricing_faq.a5') || 'Yes! We offer a 14-day free trial on the Pro plan so you can test our automation capabilities with your own documents.' },
    { q: t('landing.pricing_faq.q6') || 'What kind of support is included?', a: t('landing.pricing_faq.a6') || 'Basic includes email support. Pro includes priority email and chat support. Enterprise includes a dedicated account manager and 24/7 phone support.' },
  ];

  return (
    <div className="min-h-screen bg-[#1A0A0B] text-white selection:bg-[#D98F8F]/30 font-sans">
      <LandingNavbar />

      <main className="pt-32 pb-20 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="text-center max-w-[800px] mx-auto mb-16">
          <h1 className="text-[48px] md:text-[64px] font-extrabold tracking-tight mb-6">
            {t('landing.pricing.title') || 'Transparent Pricing for Every Scale'}
          </h1>
          <p className="text-[#A69697] text-[18px] md:text-[22px] leading-relaxed mb-10">
            {t('landing.pricing.subtitle') || 'Start automating your financial operations today. Simple pricing, no hidden fees.'}
          </p>
          
          <div className="inline-flex bg-[#1A0A0B] border border-white/10 p-1.5 rounded-full">
            <button 
              onClick={() => setIsAnnual(false)}
              className={`px-8 py-2.5 rounded-full text-[15px] transition-all font-bold ${!isAnnual ? 'bg-white/10 text-white' : 'text-[#A69697] hover:text-white'}`}
            >
              {t('landing.pricing_cards.monthly') || 'Monthly'}
            </button>
            <button 
              onClick={() => setIsAnnual(true)}
              className={`px-8 py-2.5 rounded-full text-[15px] transition-all font-bold ${isAnnual ? 'bg-white/10 text-white shadow-sm' : 'text-[#A69697] hover:text-white'}`}
            >
              {t('landing.pricing_cards.yearly') || 'Yearly'} <span className="text-[#D98F8F] ml-1 text-xs px-2 py-0.5 bg-[#8E1B3A]/20 rounded-full border border-[#8E1B3A]/30">-20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-32">
          {/* Basic */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-[30px] p-10 flex flex-col hover:border-white/10 transition-colors">
            <h3 className="text-white text-[24px] font-bold mb-2">Basic</h3>
            <p className="text-[#A69697] text-[14px] mb-8">Core features</p>
            <div className="mb-8">
              <span className="text-[54px] font-bold text-white">{isAnnual ? '15' : '19'}</span><span className="text-[#A69697] font-bold"> TND</span><span className="text-[#A69697]">/mo</span>
              <p className="text-[#A69697] text-[12px] mt-1">{isAnnual ? (t('landing.pricing_cards.billed_annually') || 'Billed annually') : (t('landing.pricing_cards.billed_monthly') || 'Billed monthly')}</p>
            </div>
            <ul className="space-y-4 mb-10 text-[15px] text-[#A69697] flex-1">
              <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-white/30" /> {t('landing.pricing_cards.f_basic_1') || "Module d'extraction 200 scans/mois"}</li>
              <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-white/30" /> {t('landing.pricing_cards.f_basic_2') || "Module d'intégration TTN"}</li>
            </ul>
            <Link href="/auth/register" className="w-full py-4 rounded-full border border-white/20 text-center text-[#A69697] font-bold hover:bg-white/10 hover:text-white transition-colors">{t('landing.pricing_cards.get_started') || 'Get Started'}</Link>
          </div>

          {/* Pro */}
          <div className="bg-[rgba(255,255,255,0.05)] border border-[#D98F8F]/50 rounded-[30px] p-10 relative transform md:-translate-y-4 shadow-[0_20px_50px_rgba(142,27,58,0.3)] flex flex-col">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white text-xs font-bold px-4 py-1 rounded-full">{t('landing.pricing_cards.most_popular') || 'MOST POPULAR'}</div>
            <div className="absolute inset-0 rounded-[30px] ring-1 ring-inset ring-[#D98F8F] shadow-[inset_0_0_20px_rgba(217,143,143,0.2)] pointer-events-none"></div>
            
            <h3 className="text-white text-[24px] font-bold mb-2">Pro</h3>
            <p className="text-[#A69697] text-[14px] mb-8">Advanced tools</p>
            <div className="mb-8">
              <span className="text-[54px] font-bold text-white">{isAnnual ? '39' : '49'}</span><span className="text-[#D98F8F] font-bold"> TND</span><span className="text-[#D98F8F]">/mo</span>
              <p className="text-[#D98F8F]/70 text-[12px] mt-1">{isAnnual ? (t('landing.pricing_cards.billed_annually') || 'Billed annually') : (t('landing.pricing_cards.billed_monthly') || 'Billed monthly')}</p>
            </div>
            <ul className="space-y-4 mb-10 text-[15px] text-white flex-1">
              <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#D98F8F]" /> {t('landing.pricing_cards.f_pro_1') || "Module d'extraction 5000 scans/mois"}</li>
              <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#D98F8F]" /> {t('landing.pricing_cards.f_pro_2') || "Module d'intégration TTN disponible"}</li>
              <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#D98F8F]" /> {t('landing.pricing_cards.f_pro_3') || "Module de connexion avec votre application"}</li>
            </ul>
            <Link href="/auth/register" className="w-full py-4 rounded-full bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white text-center font-bold shadow-lg hover:shadow-[0_0_20px_rgba(217,143,143,0.4)] transition-all">{t('landing.pricing_cards.start_trial') || 'Start 14-Day Free Trial'}</Link>
          </div>

          {/* Primum */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-[30px] p-10 flex flex-col hover:border-white/10 transition-colors">
            <h3 className="text-white text-[24px] font-bold mb-2">{t('landing.pricing_cards.premium') || 'Premium'}</h3>
            <p className="text-[#A69697] text-[14px] mb-8">Unlimited usage</p>
            <div className="mb-8">
              <span className="text-[54px] font-bold text-white">{isAnnual ? '71' : '89'}</span><span className="text-[#A69697] font-bold"> TND</span><span className="text-[#A69697]">/mo</span>
              <p className="text-[#A69697] text-[12px] mt-1">{isAnnual ? (t('landing.pricing_cards.billed_annually') || 'Billed annually') : (t('landing.pricing_cards.billed_monthly') || 'Billed monthly')}</p>
            </div>
            <ul className="space-y-4 mb-10 text-[15px] text-[#A69697] flex-1">
              <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-white/30" /> {t('landing.pricing_cards.f_premium_1') || "Module d'extraction illimité"}</li>
              <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-white/30" /> {t('landing.pricing_cards.f_pro_2') || "Module d'intégration TTN disponible"}</li>
              <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-white/30" /> {t('landing.pricing_cards.f_pro_3') || "Module de connexion avec votre application"}</li>
              <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-white/30" /> {t('landing.pricing_cards.f_premium_4') || "Module de comparaison des prix avec les concurrents"}</li>
            </ul>
            <Link href="/auth/login" className="w-full py-4 rounded-full bg-white/10 text-white font-bold hover:bg-white/20 transition-colors text-center">Contact Sales</Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[32px] font-bold text-white mb-4">{t('landing.pricing_faq.title') || 'Frequently Asked Questions'}</h2>
            <p className="text-[#A69697]">{t('landing.pricing_faq.subtitle') || 'Everything you need to know about billing and plans.'}</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-[rgba(255,255,255,0.03)] border border-white/5 rounded-[20px] p-6 hover:bg-[rgba(255,255,255,0.05)] transition-colors group">
                <details className="cursor-pointer group">
                  <summary className="flex justify-between items-center text-[16px] font-bold list-none">
                    {faq.q}
                    <span className="bg-white/5 rounded-full p-2 group-open:rotate-180 transition-transform">
                      <ChevronDown size={18} className="text-[#A69697]" />
                    </span>
                  </summary>
                  <p className="text-[#A69697] mt-4 leading-relaxed pr-8">
                    {faq.a}
                  </p>
                </details>
              </div>
            ))}
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
