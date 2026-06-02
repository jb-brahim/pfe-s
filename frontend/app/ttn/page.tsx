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
            <h3 className="text-[20px] font-bold mb-3">Multi-Region Compliance</h3>
            <p className="text-[#A69697] leading-relaxed">
              Data is localized and stored according to regional compliance laws (GDPR, CCPA, etc.). TTN seamlessly routes requests to the geographically nearest compliant data center.
            </p>
          </div>
          <div className="bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-[24px] p-8 hover:bg-[rgba(255,255,255,0.04)] transition-colors">
            <Server size={32} className="text-[#D98F8F] mb-6" />
            <h3 className="text-[20px] font-bold mb-3">High Availability</h3>
            <p className="text-[#A69697] leading-relaxed">
              With 99.99% guaranteed uptime, our infrastructure is distributed across highly available clusters, ensuring your finance operations never skip a beat.
            </p>
          </div>
          <div className="bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-[24px] p-8 hover:bg-[rgba(255,255,255,0.04)] transition-colors">
            <Database size={32} className="text-[#D98F8F] mb-6" />
            <h3 className="text-[20px] font-bold mb-3">Bespoke Enterprise Training</h3>
            <p className="text-[#A69697] leading-relaxed">
              We provide isolated environments for large organizations to train our machine learning models on their specific, proprietary invoice formats.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#1E0A0B] to-[#2D1B1C] border border-[#D98F8F]/20 rounded-[40px] p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-[36px] font-bold mb-6">Secure Connectivity & APIs</h2>
              <p className="text-[#A69697] text-[18px] leading-relaxed mb-8">
                Connect your existing ERPs and accounting software (like SAP, Oracle, or QuickBooks) directly into the TTN using our robust REST and GraphQL APIs. Webhooks ensure your systems are updated the millisecond an invoice is approved.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-[#1A0A0B] p-4 rounded-xl border border-white/10">
                  <ShieldCheck className="text-green-400" />
                  <span className="font-medium">End-to-End Encryption (TLS 1.3)</span>
                </div>
                <div className="flex items-center gap-4 bg-[#1A0A0B] p-4 rounded-xl border border-white/10">
                  <ShieldCheck className="text-green-400" />
                  <span className="font-medium">Rate Limiting & DDoS Protection</span>
                </div>
              </div>
            </div>
            <div className="bg-[#1A0A0B] rounded-2xl border border-white/10 p-6 font-mono text-sm text-[#A69697] overflow-x-auto">
              <span className="text-[#D98F8F]">POST</span> /api/v1/invoices<br/><br/>
              {`{`}<br/>
              &nbsp;&nbsp;<span className="text-white">"file_url"</span>: <span className="text-green-400">"https://storage.aura.ttn/inv_123.pdf"</span>,<br/>
              &nbsp;&nbsp;<span className="text-white">"auto_approve"</span>: <span className="text-yellow-400">true</span>,<br/>
              &nbsp;&nbsp;<span className="text-white">"webhook_target"</span>: <span className="text-green-400">"https://erp.yourcompany.com/webhook"</span><br/>
              {`}`}<br/><br/>
              <span className="text-green-400">// Response 200 OK</span><br/>
              {`{`}<br/>
              &nbsp;&nbsp;<span className="text-white">"status"</span>: <span className="text-green-400">"processing_started"</span>,<br/>
              &nbsp;&nbsp;<span className="text-white">"job_id"</span>: <span className="text-green-400">"job_9a8b7c6d"</span><br/>
              {`}`}
            </div>
          </div>
        </div>

        <div className="mt-20 text-center">
          <Link href="/auth/login" className="inline-flex items-center gap-2 text-[#D98F8F] font-bold text-[18px] hover:text-white transition-colors">
            Talk to an architect about TTN deployment <ArrowRight size={20} />
          </Link>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
