'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  BarChart3, 
  Cpu,
  Layers,
  Sparkles,
  Activity,
  MousePointer2,
  Lock,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const [showDemo, setShowDemo] = useState(false);
  
  return (
    <div className="min-h-screen bg-[#080710] text-foreground font-sans selection:bg-primary/30 selection:text-white scroll-smooth relative overflow-hidden">
      {/* Decorative cosmic background glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#080710]/60 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-indigo-600 flex items-center justify-center font-bold text-white shadow-purple">
              SF
            </div>
            <span className="font-extrabold text-white text-xl tracking-tight">
              SmartFacture
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#about" className="hover:text-primary transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors px-4 py-2">
              Login
            </Link>
            <Link href="/register" className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-purple hover:scale-105 active:scale-95 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-44 pb-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 text-primary text-[10px] font-black uppercase tracking-widest mb-8 border border-primary/20">
              <Sparkles size={12} className="text-primary" />
              Cognitive Invoice Intelligence
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 max-w-4xl mx-auto leading-[1.1]">
              Automate corporate billing <br />
              with <span className="sf-gradient-text italic">Gemini Optical AI</span>.
            </h1>
            <p className="text-lg text-muted-foreground font-semibold max-w-2xl mx-auto mb-12 leading-relaxed">
              SmartFacture extracts data from tax invoices with 99.9% accuracy, tracks monthly departmental budgets, and manages validation checklists.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <Link href="/register" className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-purple hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                Launch Free Workspace
                <ArrowRight size={16} />
              </Link>
              <button 
                onClick={() => setShowDemo(true)}
                className="w-full md:w-auto px-8 py-4 bg-white/2 border border-white/5 text-muted-foreground hover:text-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Activity size={16} className="text-primary animate-pulse" />
                Live Demo Preview
              </button>
            </div>
          </motion.div>

          {/* Hero Image Mockup with sweep beam */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative max-w-5xl mx-auto"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-indigo-500 rounded-[3rem] blur-3xl opacity-10" />
            <div className="relative bg-card/40 rounded-[2.5rem] shadow-glass border border-white/5 p-4 group cursor-pointer overflow-hidden" onClick={() => setShowDemo(true)}>
               <div className="absolute inset-0 bg-[#080710]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 backdrop-blur-sm">
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white shadow-purple scale-90 group-hover:scale-100 transition-transform">
                     <Zap size={30} fill="currentColor" />
                  </div>
               </div>
               
               {/* Pulse laser sweep effect */}
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent blur-sm group-hover:animate-[ping_2s_infinite]" />
               
               <div className="h-[450px] bg-white/1 rounded-3xl border border-white/5 flex flex-col items-center justify-center space-y-4">
                  <Cpu size={60} className="text-primary/40 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tap to view live workspace interactive panels</span>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">Autonomous Compliance Control</h2>
            <p className="text-muted-foreground font-semibold">Purpose-built features designed for high-scale enterprise expense operations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8 sf-card group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-indigo-600 flex items-center justify-center text-white mb-8 shadow-purple group-hover:scale-105 transition-transform">
                <Cpu size={22} />
              </div>
              <h3 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Gemini Optical Document Extractor</h3>
              <p className="text-muted-foreground text-sm font-semibold max-w-xl leading-relaxed">
                Autonomous data extraction powered by Google Gemini Vision. Seamlessly parses French and Arabic tax invoices, calculates TVA totals, and extracts supplier Matricule Fiscal metrics with flawless accuracy.
              </p>
            </div>

            <div className="md:col-span-4 bg-gradient-to-br from-primary to-indigo-700 rounded-[2.5rem] p-10 text-white relative overflow-hidden group shadow-purple">
               <Zap size={100} className="absolute -right-4 -bottom-4 text-white/10 group-hover:rotate-12 transition-transform duration-500 pointer-events-none" />
               <h3 className="text-2xl font-black uppercase tracking-wide mb-4">Zero Overheads</h3>
               <p className="text-white/80 text-xs font-semibold leading-relaxed">Processing pipeline takes less than ~2.4s per invoice. Eliminates manual bookkeeping errors completely.</p>
            </div>

            <div className="md:col-span-4 bg-card/60 border border-white/5 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
               <ShieldCheck size={32} className="text-emerald-400 mb-8" />
               <h3 className="text-xl font-bold mb-4">Audit Validation Trails</h3>
               <p className="text-muted-foreground text-xs font-semibold leading-relaxed">Comprehensive immutable audit logs record every single manual edit, approval decision, and role modification instantly.</p>
            </div>

            <div className="md:col-span-8 sf-card group">
              <div className="flex flex-col md:flex-row gap-10">
                 <div className="flex-1">
                    <BarChart3 size={24} className="text-primary mb-8" />
                    <h3 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Real-Time Budget Guard</h3>
                    <p className="text-muted-foreground text-sm font-semibold leading-relaxed">
                      Proactively protect company cash outflow. Categorical alerts instantly flag invoices that threaten monthly limits before final approval.
                    </p>
                 </div>
                 <div className="w-full md:w-64 h-48 bg-white/2 border border-white/5 rounded-3xl p-6 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border-[10px] border-white/5 border-t-primary animate-[spin_2s_linear_infinite]" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="about" className="py-24 px-6 relative z-10 bg-white/1 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">The Bookkeeping Pipeline</h2>
            <p className="text-muted-foreground font-semibold">From raw paper files to indexed compliance secure vaults in three steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
             {[
               { icon: Globe, title: '1. Secure Upload', desc: 'Accountants batch upload PDF or image receipts into the interactive Processing Lab.' },
               { icon: Cpu, title: '2. Cognitive Parsing', desc: 'Optical AI instantly processes tax totals (HT, TVA, Timbre, TTC) and checks against active system rules.' },
               { icon: Lock, title: '3. Admin Audit', desc: 'Admins review extracted parameters, view automatic rule results, and approve items to complete transaction posting.' }
             ].map((step, idx) => (
               <div key={idx} className="text-center group">
                 <div className="w-20 h-20 rounded-3xl bg-card/60 border border-white/5 shadow-glass flex items-center justify-center mx-auto mb-8 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <step.icon size={26} />
                 </div>
                 <h4 className="text-xl font-extrabold text-white mb-4 tracking-tight">{step.title}</h4>
                 <p className="text-muted-foreground text-xs font-semibold leading-relaxed">{step.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">Flexible Subscriptions</h2>
            <p className="text-muted-foreground font-semibold">Tailored models that scale perfectly with your enterprise billing volumes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
             <PricingCard title="Starter" price="0" desc="Ideal for students and project evaluation" features={['10 Monthly OCR operations', 'Gemini AI standard model', 'Full financial vault', 'Basic audit trail log']} />
             <PricingCard title="Professional" price="49" desc="Best for growing construction firms" features={['Unlimited OCR operations', 'Gemini AI Pro cognitive model', 'Interactive category budgets', 'Real-time validation engine']} highlighted />
             <PricingCard title="Enterprise" price="Custom" desc="For multinational operations" features={['Dedicated SLA bounds', 'Multi-tenant database support', 'Personal integration engineer', 'Custom compliance rule builders']} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5 relative z-10 bg-[#080710]/40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 text-muted-foreground font-semibold text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-indigo-600 flex items-center justify-center font-bold text-white shadow-purple">
              SF
            </div>
            <span className="font-extrabold text-white tracking-tight">SmartFacture</span>
          </div>
          <div className="flex items-center gap-8 uppercase tracking-widest text-[9px] font-black">
            <a href="#" className="hover:text-primary transition-colors">Twitter</a>
            <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          </div>
          <p>© 2026 SmartFacture AI. All rights reserved.</p>
        </div>
      </footer>

      {/* Demo Video Modal */}
      <AnimatePresence>
        {showDemo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/95 backdrop-blur-md"
            onClick={() => setShowDemo(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative w-full max-w-4xl aspect-video bg-card border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowDemo(false)}
                className="absolute top-6 right-6 z-20 w-11 h-11 rounded-full bg-slate-950/50 text-white flex items-center justify-center hover:bg-slate-900 transition-colors backdrop-blur-md"
              >
                <ArrowRight size={20} className="rotate-45" />
              </button>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-card">
                 <div className="relative z-10 text-center px-6">
                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-8 shadow-purple">
                       <Sparkles size={36} className="text-white" />
                    </div>
                    <h2 className="text-4xl font-extrabold mb-4 text-white tracking-tight">SmartFacture OCR Console</h2>
                    <p className="text-sm text-muted-foreground max-w-lg mx-auto font-semibold">
                      This is a professional document scanning workstation utilizing Google Gemini Vision for cognitive, context-aware billing extraction.
                    </p>
                    <div className="mt-8 flex items-center justify-center gap-3">
                       <div className="px-5 py-2.5 rounded-xl bg-white/2 border border-white/5 text-[9px] font-black uppercase tracking-wider text-muted-foreground">
                          Gemini 1.5 Flash API
                       </div>
                       <div className="px-5 py-2.5 rounded-xl bg-white/2 border border-white/5 text-[9px] font-black uppercase tracking-wider text-muted-foreground">
                          99.9% Optical extraction accuracy
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PricingCard({ title, price, desc, features, highlighted }: any) {
  return (
    <div className={cn(
      "p-10 rounded-[2rem] border transition-all flex flex-col relative overflow-hidden",
      highlighted 
        ? "bg-gradient-to-b from-[#15132A] to-card/40 border-primary/20 shadow-purple scale-105 z-10" 
        : "bg-card/40 border-white/5 hover:border-white/10"
    )}>
      {highlighted && (
        <span className="absolute top-5 right-5 bg-primary/20 text-primary text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded">
          Popular CHOICE
        </span>
      )}
      <h4 className="text-xs font-black uppercase tracking-widest mb-2 text-primary">{title}</h4>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-4xl font-extrabold tracking-tight text-white">{price === 'Custom' ? '' : '$'}{price}</span>
        {price !== 'Custom' && <span className="text-xs font-semibold text-muted-foreground">/month</span>}
      </div>
      <p className="text-xs text-muted-foreground font-semibold mb-8">{desc}</p>
      
      <div className="space-y-4 mb-10 flex-1">
        {features.map((f: string, i: number) => (
          <div key={i} className="flex items-center gap-3 text-xs font-semibold">
            <CheckCircle2 size={16} className="text-primary flex-shrink-0" />
            <span className="text-foreground/80">{f}</span>
          </div>
        ))}
      </div>

      <button className={cn(
        "w-full py-4 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer",
        highlighted 
          ? "bg-primary text-white shadow-purple hover:scale-102" 
          : "bg-white/2 border border-white/5 text-muted-foreground hover:text-foreground"
      )}>
        Choose {title}
      </button>
    </div>
  );
}
