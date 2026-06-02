'use client';

import { Zap, CheckCircle2, BarChart3, Users, Network, Shield, ArrowRight } from 'lucide-react';
import { LandingNavbar } from '@/components/landing-navbar';
import { LandingFooter } from '@/components/landing-footer';
import Link from 'next/link';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#1A0A0B] text-white selection:bg-[#D98F8F]/30 font-sans">
      <LandingNavbar />

      {/* Dynamic Background */}
      <div className="fixed top-0 right-0 w-[50%] h-[50%] bg-[#D98F8F] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

      <main className="pt-32 pb-20 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="text-center max-w-[800px] mx-auto mb-20">
          <h1 className="text-[48px] md:text-[64px] font-extrabold tracking-tight mb-6">
            Powerful Features for Modern Finance
          </h1>
          <p className="text-[#A69697] text-[18px] md:text-[22px] leading-relaxed">
            Everything you need to automate, track, and scale your financial operations with enterprise-grade security and advanced AI capabilities.
          </p>
        </div>

        <div className="space-y-32">
          {/* Feature 1 */}
          <section className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-[#8E1B3A]/20 flex items-center justify-center mb-6 border border-[#8E1B3A]/30">
                <Zap size={32} className="text-[#D98F8F]" />
              </div>
              <h2 className="text-[36px] font-bold mb-4">Aura AI Invoice Automation</h2>
              <p className="text-[#A69697] text-[18px] leading-relaxed mb-6">
                Say goodbye to manual data entry. Our proprietary AI models automatically extract key information from uploaded invoices with 99.9% accuracy. From line items to tax totals, Aura understands complex documents instantly.
              </p>
              <ul className="space-y-4 text-[16px]">
                <li className="flex items-center gap-3"><CheckCircle2 className="text-[#D98F8F]" size={20} /> Multi-language OCR extraction</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-[#D98F8F]" size={20} /> Smart vendor matching</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-[#D98F8F]" size={20} /> Automatic anomaly detection</li>
              </ul>
            </div>
            <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-[30px] p-8 shadow-2xl relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D98F8F]/5 to-transparent rounded-[30px]"></div>
              <div className="space-y-4 relative z-10">
                <div className="bg-[#1A0A0B] p-4 rounded-xl border border-white/5 flex justify-between items-center">
                  <div>
                    <p className="text-[#A69697] text-sm">Extracted Total</p>
                    <p className="text-2xl font-bold">$12,450.00</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">
                    100% Confidence
                  </div>
                </div>
                <div className="bg-[#1A0A0B] p-4 rounded-xl border border-white/5">
                  <p className="text-[#A69697] text-sm mb-2">Line Items Found</p>
                  <div className="w-full h-2 bg-white/10 rounded-full"><div className="w-[85%] h-full bg-[#D98F8F] rounded-full"></div></div>
                </div>
              </div>
            </div>
          </section>

          {/* Feature 2 */}
          <section className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-[30px] p-8 shadow-2xl">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 bg-[#1A0A0B] p-4 rounded-xl border border-white/5">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">{i}</div>
                    <div className="flex-1">
                      <div className="w-1/2 h-3 bg-white/20 rounded mb-2"></div>
                      <div className="w-1/3 h-2 bg-white/10 rounded"></div>
                    </div>
                    {i === 1 ? <span className="text-green-400 text-xs font-bold">Approved</span> : <span className="text-yellow-400 text-xs font-bold">Pending</span>}
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="w-16 h-16 rounded-2xl bg-[#8E1B3A]/20 flex items-center justify-center mb-6 border border-[#8E1B3A]/30">
                <Network size={32} className="text-[#D98F8F]" />
              </div>
              <h2 className="text-[36px] font-bold mb-4">Custom Approval Workflows</h2>
              <p className="text-[#A69697] text-[18px] leading-relaxed mb-6">
                Route expenses exactly how your company operates. Build custom, multi-tiered approval chains based on department, amount thresholds, or specific project codes.
              </p>
              <ul className="space-y-4 text-[16px]">
                <li className="flex items-center gap-3"><CheckCircle2 className="text-[#D98F8F]" size={20} /> Drag-and-drop workflow builder</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-[#D98F8F]" size={20} /> Automated escalation policies</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-[#D98F8F]" size={20} /> Email & Slack notifications</li>
              </ul>
            </div>
          </section>

          {/* Feature 3 */}
          <section className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-[#8E1B3A]/20 flex items-center justify-center mb-6 border border-[#8E1B3A]/30">
                <BarChart3 size={32} className="text-[#D98F8F]" />
              </div>
              <h2 className="text-[36px] font-bold mb-4">Advanced Analytics</h2>
              <p className="text-[#A69697] text-[18px] leading-relaxed mb-6">
                Turn your raw financial data into actionable insights. Aura generates real-time reports on cash flow, departmental spending, and forecast models using machine learning.
              </p>
              <ul className="space-y-4 text-[16px]">
                <li className="flex items-center gap-3"><CheckCircle2 className="text-[#D98F8F]" size={20} /> Real-time dashboard widgets</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-[#D98F8F]" size={20} /> Custom report generation</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-[#D98F8F]" size={20} /> Predictive spending models</li>
              </ul>
            </div>
            <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-[30px] p-8 shadow-2xl relative">
              <div className="w-full h-48 border-b-2 border-l-2 border-white/20 flex items-end gap-2 p-4">
                <div className="w-1/6 bg-[#8E1B3A] rounded-t-sm h-[40%]"></div>
                <div className="w-1/6 bg-[#8E1B3A] rounded-t-sm h-[60%]"></div>
                <div className="w-1/6 bg-[#D98F8F] rounded-t-sm h-[90%] shadow-[0_0_20px_rgba(217,143,143,0.5)]"></div>
                <div className="w-1/6 bg-[#8E1B3A] rounded-t-sm h-[50%]"></div>
                <div className="w-1/6 bg-[#8E1B3A] rounded-t-sm h-[70%]"></div>
              </div>
            </div>
          </section>

          {/* Feature 4 */}
          <section className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-[30px] p-8 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <Shield size={32} className="text-[#D98F8F]" />
                <div>
                  <p className="font-bold text-white">Bank-Grade Security</p>
                  <p className="text-sm text-[#A69697]">AES-256 Encryption Standard</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full bg-white/10 rounded overflow-hidden"><div className="h-full w-full bg-green-500"></div></div>
                <p className="text-right text-xs text-green-400">Secure Connection Verified</p>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="w-16 h-16 rounded-2xl bg-[#8E1B3A]/20 flex items-center justify-center mb-6 border border-[#8E1B3A]/30">
                <Users size={32} className="text-[#D98F8F]" />
              </div>
              <h2 className="text-[36px] font-bold mb-4">Enterprise Security & Roles</h2>
              <p className="text-[#A69697] text-[18px] leading-relaxed mb-6">
                Your financial data is protected by best-in-class encryption. Manage granular permissions to ensure employees only see the data relevant to their roles.
              </p>
              <ul className="space-y-4 text-[16px]">
                <li className="flex items-center gap-3"><CheckCircle2 className="text-[#D98F8F]" size={20} /> Granular RBAC (Role-Based Access Control)</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-[#D98F8F]" size={20} /> Comprehensive Audit Logging</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-[#D98F8F]" size={20} /> SSO & Two-Factor Authentication</li>
              </ul>
            </div>
          </section>
        </div>

        <div className="mt-32 text-center bg-gradient-to-br from-[#1A0A0B] to-[#2D1B1C] border border-[#8E1B3A]/30 rounded-[40px] p-16 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
          <h2 className="text-[36px] font-bold mb-6 relative z-10">Ready to transform your financial stack?</h2>
          <Link href="/auth/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white font-bold text-[18px] shadow-[0_0_20px_rgba(142,27,58,0.5)] hover:scale-105 transition-transform relative z-10">
            Start Free Trial <ArrowRight size={20} />
          </Link>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
