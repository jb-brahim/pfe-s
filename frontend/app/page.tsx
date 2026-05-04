'use client';
// Fixed Activity icon reference

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

export default function LandingPage() {
  const [showDemo, setShowDemo] = useState(false);
  
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-primary/20 selection:text-primary scroll-smooth">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-bold text-white shadow-purple">
              SF
            </div>
            <span className="font-extrabold text-slate-900 text-xl tracking-tight">
              SmartFacture
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#about" className="hover:text-primary transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors px-4 py-2">
              Login
            </Link>
            <Link href="/register" className="px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-purple hover:scale-105 active:scale-95 transition-all text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-8">
              <Sparkles size={14} />
              AI-Powered Invoice Intelligence
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 max-w-4xl mx-auto leading-[1.1]">
              Automate your <span className="text-primary italic">Finance Workflow</span> with Gemini AI.
            </h1>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
              SmartFacture extracts data from any invoice with 99.9% accuracy, tracks budgets in real-time, and manages approvals automatically.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <Link href="/register" className="w-full md:w-auto px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-purple hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                Start for free
                <ArrowRight size={20} />
              </Link>
              <button 
                onClick={() => setShowDemo(true)}
                className="w-full md:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Activity size={20} className="text-primary" />
                Watch Demo
              </button>
            </div>
          </motion.div>

          {/* Hero Image Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-indigo-500 rounded-[3rem] blur-2xl opacity-20" />
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-4 group cursor-pointer overflow-hidden" onClick={() => setShowDemo(true)}>
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 backdrop-blur-sm">
                 <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-primary shadow-xl scale-90 group-hover:scale-100 transition-transform">
                    <Zap size={40} fill="currentColor" />
                 </div>
              </div>
              <img 
                src="/dashboard-demo.png" 
                alt="SmartFacture Dashboard" 
                className="w-full h-auto rounded-[1.8rem] border border-slate-200/50 group-hover:scale-[1.02] transition-transform duration-700"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Everything you need to <span className="text-primary">Scale</span></h2>
            <p className="text-slate-500 font-medium">Built for modern finance teams and construction project managers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8 bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 hover:shadow-soft transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white mb-8 shadow-purple group-hover:scale-110 transition-transform">
                <Cpu size={28} />
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Gemini Vision AI Extraction</h3>
              <p className="text-slate-500 text-lg font-medium max-w-xl">
                Our advanced OCR engine powered by Google Gemini handles Arabic and French invoices with extreme precision. No manual entry required.
              </p>
            </div>

            <div className="md:col-span-4 bg-primary rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
               <Zap size={100} className="absolute -right-4 -bottom-4 text-white/10 group-hover:rotate-12 transition-transform duration-500" />
               <h3 className="text-2xl font-bold mb-4">Instant Processing</h3>
               <p className="text-white/80 font-medium">Upload, extract, and validate in under 5 seconds per document.</p>
            </div>

            <div className="md:col-span-4 bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
               <ShieldCheck size={28} className="text-emerald-400 mb-8" />
               <h3 className="text-2xl font-bold mb-4">Audit Ready</h3>
               <p className="text-slate-400 font-medium">Every action is logged. Full history of edits and approvals for your PFE jury or tax authorities.</p>
            </div>

            <div className="md:col-span-8 bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 hover:shadow-soft transition-all group">
              <div className="flex flex-col md:flex-row gap-10">
                 <div className="flex-1">
                    <BarChart3 size={28} className="text-primary mb-8" />
                    <h3 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Real-time Budget Guard</h3>
                    <p className="text-slate-500 text-lg font-medium">
                      Never exceed your monthly limits again. SmartFacture alerts you before you approve an over-budget invoice.
                    </p>
                 </div>
                 <div className="w-full md:w-64 h-48 bg-white rounded-3xl shadow-soft border border-slate-100 p-6 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-[12px] border-slate-100 border-t-primary animate-[spin_3s_linear_infinite]" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="about" className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">How it <span className="text-primary">Works</span></h2>
            <p className="text-slate-500 font-medium">From paper to digital vault in three simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
             {[
               { icon: Globe, title: '1. Upload Invoices', desc: 'Drag and drop your PDF or image files. Our system supports batch processing for high volume.' },
               { icon: Cpu, title: '2. AI Extraction', desc: 'Gemini AI automatically identifies vendor, amounts, taxes, and fiscal data with zero effort.' },
               { icon: Lock, title: '3. Verify & Vault', desc: 'Review the extracted data, approve the entry, and securely archive it in your financial vault.' }
             ].map((step, idx) => (
               <div key={idx} className="text-center group">
                 <div className="w-20 h-20 rounded-3xl bg-white shadow-soft flex items-center justify-center mx-auto mb-8 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <step.icon size={32} />
                 </div>
                 <h4 className="text-2xl font-bold text-slate-900 mb-4">{step.title}</h4>
                 <p className="text-slate-500 font-medium leading-relaxed">{step.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Simple, <span className="text-primary">Transparent</span> Pricing</h2>
            <p className="text-slate-500 font-medium">Choose the plan that fits your company size.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
             <PricingCard title="Starter" price="0" desc="Perfect for PFE and freelancers" features={['10 Invoices / month', 'Gemini AI Standard', 'Basic Vault', 'Email Support']} />
             <PricingCard title="Professional" price="49" desc="Best for growing businesses" features={['Unlimited Invoices', 'Gemini AI Vision Pro', 'Advanced Budget Guard', 'Priority Support']} highlighted />
             <PricingCard title="Enterprise" price="Custom" desc="For large construction firms" features={['Custom AI Training', 'SLA Guarantee', 'Dedicated Manager', 'API Access']} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto bg-primary rounded-[3rem] p-12 md:p-20 text-center text-white shadow-purple relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-8 tracking-tight leading-tight">Ready to modernize your <br/> invoice processing?</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <Link href="/register" className="w-full md:w-auto px-10 py-5 bg-white text-primary rounded-2xl font-black text-lg shadow-xl hover:scale-105 active:scale-95 transition-all">
                Create Free Account
              </Link>
              <button className="w-full md:w-auto px-10 py-5 bg-primary border-2 border-white/20 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all">
                Contact Sales
              </button>
            </div>
            <p className="mt-8 text-white/60 font-medium">No credit card required • Unlimited free trial for PFE students</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 text-slate-400 font-medium text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center font-bold text-white">
              SF
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight">SmartFacture</span>
          </div>
          <div className="flex items-center gap-8 uppercase tracking-widest text-[10px] font-black">
            <a href="#" className="hover:text-primary transition-colors">Twitter</a>
            <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          </div>
          <p>© 2026 SmartFacture AI. All rights reserved.</p>
        </div>
      </footer>
      {/* Demo Modal */}
      <AnimatePresence>
        {showDemo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-lg"
            onClick={() => setShowDemo(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl aspect-video bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-white/20"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowDemo(false)}
                className="absolute top-6 right-6 z-20 w-12 h-12 rounded-full bg-slate-900/50 text-white flex items-center justify-center hover:bg-slate-900 transition-colors backdrop-blur-md"
              >
                <ArrowRight size={24} className="rotate-45" />
              </button>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white">
                 <img 
                   src="/dashboard-demo.png" 
                   className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm scale-110"
                   alt="Background"
                 />
                 <div className="relative z-10 text-center px-6">
                    <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mx-auto mb-8 shadow-purple animate-pulse">
                       <Sparkles size={48} fill="currentColor" />
                    </div>
                    <h2 className="text-5xl font-black mb-4 tracking-tight">Experience the Power of AI</h2>
                    <p className="text-xl text-white/70 max-w-2xl mx-auto font-medium">
                      SmartFacture isn't just OCR. It's a financial brain that learns your vendors and protects your budget.
                    </p>
                    <div className="mt-12 flex items-center justify-center gap-4">
                       <div className="px-6 py-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md text-sm font-bold uppercase tracking-widest">
                          Gemini 1.5 Flash
                       </div>
                       <div className="px-6 py-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md text-sm font-bold uppercase tracking-widest">
                          99.9% Accuracy
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
      "p-10 rounded-[2.5rem] border transition-all flex flex-col",
      highlighted 
        ? "bg-slate-900 text-white border-slate-800 shadow-2xl scale-105 z-10" 
        : "bg-white text-slate-900 border-slate-100 hover:shadow-soft"
    )}>
      <h4 className="text-xl font-bold mb-2 uppercase tracking-widest text-primary">{title}</h4>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-4xl font-black">{price === 'Custom' ? '' : '$'}{price}</span>
        {price !== 'Custom' && <span className={cn("text-sm font-medium", highlighted ? "text-slate-400" : "text-slate-500")}>/month</span>}
      </div>
      <p className={cn("text-sm font-medium mb-8", highlighted ? "text-slate-400" : "text-slate-500")}>{desc}</p>
      
      <div className="space-y-4 mb-10 flex-1">
        {features.map((f: string, i: number) => (
          <div key={i} className="flex items-center gap-3 text-sm font-bold">
            <CheckCircle2 size={18} className="text-primary flex-shrink-0" />
            <span className={highlighted ? "text-slate-200" : "text-slate-600"}>{f}</span>
          </div>
        ))}
      </div>

      <button className={cn(
        "w-full py-4 rounded-2xl font-bold transition-all",
        highlighted 
          ? "bg-primary text-white shadow-purple hover:scale-[1.02]" 
          : "bg-slate-50 text-slate-900 hover:bg-slate-100"
      )}>
        Choose {title}
      </button>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
