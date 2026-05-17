'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Zap, ShieldCheck, BarChart3, Users, CheckCircle2, ChevronDown, Network, FileText, ChevronRight, Search, Upload, LineChart as LineChartIcon, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis } from 'recharts';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const mockChartData = [
    { name: 'Jan', val: 4000 }, { name: 'Feb', val: 3000 }, { name: 'Mar', val: 2000 },
    { name: 'Apr', val: 2780 }, { name: 'May', val: 1890 }, { name: 'Jun', val: 2390 },
    { name: 'Jul', val: 3490 }, { name: 'Aug', val: 4000 }
  ];

  return (
    <div className="min-h-screen bg-[#1A0A0B] text-white selection:bg-[#D98F8F]/30 overflow-x-hidden font-sans pb-20">
      
      {/* Dynamic Background Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#8E1B3A] rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
      <div className="fixed top-[40%] right-[-10%] w-[40%] h-[40%] bg-[#D98F8F] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-[#8E1B3A] rounded-full blur-[150px] opacity-15 pointer-events-none"></div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#1A0A0B]/90 backdrop-blur-xl border-b border-white/10 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D98F8F] to-[#8E1B3A] flex items-center justify-center shadow-[0_0_15px_rgba(217,143,143,0.4)]">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-[20px] font-bold tracking-tight text-white">Aura Finance</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-[14px] text-[#A69697] font-medium">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#ttn" className="hover:text-white transition-colors">TTN</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="hidden md:block text-[#A69697] text-[14px] font-bold hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/auth/login" className="bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white px-6 py-2.5 rounded-full text-[14px] font-bold shadow-[0_0_15px_rgba(142,27,58,0.4)] hover:shadow-[0_0_25px_rgba(217,143,143,0.6)] transition-all hover:-translate-y-0.5">
              Request Demo
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex flex-col gap-32">
        {/* 1. HERO SECTION */}
        <section className="relative pt-40 px-6 md:px-12 max-w-[1400px] mx-auto flex flex-col items-center text-center w-full">
          {/* Abstract Hero Visual */}
          <div className="relative w-full max-w-[800px] h-[400px] mb-8 perspective-1000 flex items-center justify-center">
            <div className="absolute w-[600px] h-[150px] border border-cyan-400/20 rounded-[100%] rotate-[-15deg] shadow-[0_0_50px_rgba(34,211,238,0.15)] animate-[pulse_4s_ease-in-out_infinite]"></div>
            <div className="absolute w-[700px] h-[180px] border border-[#D98F8F]/30 rounded-[100%] rotate-[10deg] shadow-[0_0_60px_rgba(217,143,143,0.2)]"></div>
            
            <div className="absolute top-[10%] left-[30%] w-32 h-44 bg-[rgba(255,255,255,0.03)] backdrop-blur-xl border border-[#D98F8F]/40 rounded-xl shadow-2xl z-20 flex flex-col p-3 transform rotate-[-8deg] animate-[float_6s_ease-in-out_infinite]">
               <div className="w-8 h-8 rounded bg-[#8E1B3A]/40 mb-3"></div>
               <div className="w-full h-2 bg-[#D98F8F]/50 rounded mb-2"></div>
               <div className="w-3/4 h-2 bg-white/20 rounded mb-1"></div>
            </div>
            
            <div className="absolute top-[20%] right-[30%] w-28 h-40 bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-white/10 rounded-xl shadow-xl z-10 p-3 transform rotate-[12deg] animate-[float_7s_ease-in-out_infinite_1s]">
               <div className="w-full h-2 bg-white/20 rounded mb-2"></div>
               <div className="w-1/2 h-2 bg-white/20 rounded"></div>
            </div>
            
            <div className="absolute bottom-[20%] left-[40%] w-36 h-48 bg-[rgba(255,255,255,0.04)] backdrop-blur-2xl border border-[#D98F8F]/30 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-30 p-4 transform rotate-[5deg] animate-[float_5s_ease-in-out_infinite_0.5s]">
               <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                 <div className="w-10 h-3 bg-white/30 rounded"></div>
                 <div className="w-6 h-3 bg-[#D98F8F] rounded"></div>
               </div>
               <div className="space-y-2">
                 <div className="w-full h-2 bg-white/10 rounded"></div>
                 <div className="w-full h-2 bg-white/10 rounded"></div>
                 <div className="w-2/3 h-2 bg-white/10 rounded"></div>
               </div>
            </div>
          </div>

          <h1 className="text-[52px] md:text-[72px] font-extrabold tracking-tight leading-[1.05] mb-6 max-w-[900px]">
            Revolutionize Your Finance: <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] via-[#EBD8D8] to-[#D98F8F]">
              AI-Powered Invoicing
            </span> <br/>
            & Expense Management.
          </h1>
          <p className="text-[#A69697] text-[18px] md:text-[22px] mb-10 max-w-[700px] leading-relaxed">
            Automate, Optimize, and Scale with Aura Finance's enterprise-grade platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Link href="/auth/login" className="w-full sm:w-auto px-10 py-4 rounded-full bg-[rgba(255,255,255,0.1)] backdrop-blur-md border border-[#D98F8F]/50 text-white font-bold text-[18px] shadow-[0_0_30px_rgba(217,143,143,0.3)] hover:bg-[#D98F8F] hover:text-[#1A0A0B] transition-all flex items-center justify-center gap-2">
              Request Demo
            </Link>
            <button className="w-full sm:w-auto px-10 py-4 rounded-full bg-[rgba(255,255,255,0.02)] border border-white/10 text-[#A69697] font-bold text-[18px] hover:text-white hover:border-white/30 transition-all">
              Request Demo
            </button>
          </div>
        </section>

        {/* 2. FEATURES SHOWCASE */}
        <section id="features" className="px-6 md:px-12 max-w-[1400px] mx-auto w-full">
          <div className="mb-8">
            <h2 className="text-[28px] font-bold text-white">Features Showcase</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: 'AI Invoice Automation', desc: 'AI models optimize and automate manual invoice tasks.' },
              { icon: CheckCircle2, title: 'Expense Tracking & Approval', desc: 'Expense management under intuitive hierarchy and approval protocols.' },
              { icon: BarChart3, title: 'Smart Statistics', desc: 'Generate actionable insights with advanced AI.' },
              { icon: Users, title: 'Team Management', desc: 'Intuitive management of team roles and operations.' },
            ].map((f, i) => (
              <div key={i} className="bg-gradient-to-b from-[rgba(255,255,255,0.05)] to-[rgba(255,255,255,0.01)] backdrop-blur-md border border-[rgba(255,255,255,0.08)] p-8 rounded-[24px] hover:border-[#D98F8F]/40 transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded-[14px] bg-[#1A0A0B]/80 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-[#8E1B3A]/30 transition-colors shadow-inner">
                  <f.icon className="text-[#A69697] group-hover:text-[#D98F8F]" size={24} />
                </div>
                <h3 className="text-white text-[16px] font-bold mb-3">{f.title}</h3>
                <p className="text-[#A69697] text-[13px] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. AI INVOICE AUTOMATION DEMO */}
        <section className="px-6 md:px-12 max-w-[1400px] mx-auto w-full">
          <div className="mb-8">
            <h2 className="text-[28px] font-bold text-white">AI Invoice Automation Demo</h2>
          </div>
          
          <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-lg border border-[rgba(255,255,255,0.05)] rounded-[30px] p-6 md:p-10 shadow-2xl">
             <div className="grid lg:grid-cols-2 gap-6">
               
               {/* Left: Drag & Drop + OCR Preview */}
               <div className="space-y-6">
                 {/* Drag & Drop */}
                 <div className="bg-[#1A0A0B]/80 border border-white/10 rounded-[20px] p-8 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[200px] group border-dashed hover:border-[#D98F8F]/50 cursor-pointer">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-[#D98F8F] rounded-full blur-[60px] opacity-10"></div>
                    <Upload className="text-[#D98F8F] mb-4" size={32} />
                    <p className="text-white font-bold">Drag & Drop Invoices Here</p>
                 </div>
                 
                 {/* OCR Preview */}
                 <div className="bg-[#1A0A0B]/80 border border-white/10 rounded-[20px] p-6 relative">
                    <p className="text-[#A69697] text-[13px] mb-4 flex justify-between items-center">
                      <span>OCR Extraction Preview</span>
                      <span className="flex gap-1"><span className="w-2 h-2 rounded-full bg-white/20"></span><span className="w-2 h-2 rounded-full bg-white/20"></span><span className="w-2 h-2 rounded-full bg-white/20"></span></span>
                    </p>
                    <div className="w-full h-[180px] bg-gradient-to-br from-[#EBD8D8] to-[#D98F8F] rounded-[12px] p-4 flex flex-col">
                       <div className="flex justify-between items-start border-b border-[#8E1B3A]/20 pb-2 mb-2">
                         <div className="flex items-center gap-2">
                           <Sparkles size={16} className="text-[#8E1B3A]" /> <span className="font-bold text-[#8E1B3A]">Aura</span>
                         </div>
                         <div className="text-right text-[#8E1B3A] text-[10px]">
                           <p className="font-bold text-[14px]">INVOICE</p>
                           <p>Oct 15, 2023</p>
                         </div>
                       </div>
                       <div className="space-y-2 mt-2">
                         <div className="w-full h-2 bg-[#8E1B3A]/20 rounded"></div>
                         <div className="w-full h-2 bg-[#8E1B3A]/20 rounded"></div>
                         <div className="w-1/2 h-2 bg-[#8E1B3A]/20 rounded"></div>
                       </div>
                    </div>
                 </div>
               </div>

               {/* Right: Extracted Data Cards */}
               <div className="bg-[#1A0A0B]/80 border border-white/10 rounded-[20px] p-6">
                 <p className="text-[#A69697] text-[13px] mb-4">Extracted Data Cards</p>
                 
                 <div className="space-y-4">
                   <div className="bg-[rgba(255,255,255,0.03)] border border-white/5 rounded-[16px] p-5 flex justify-between items-center">
                     <div>
                       <p className="text-[#A69697] text-[12px] mb-1">Amount</p>
                       <p className="text-white font-bold">5,000.00 TND</p>
                     </div>
                     <div className="text-right">
                       <p className="text-[#A69697] text-[12px] mb-1">Tax</p>
                       <p className="text-white font-bold">500.00 TND</p>
                     </div>
                   </div>

                   <div className="bg-[rgba(255,255,255,0.03)] border border-white/5 rounded-[16px] p-5">
                     <p className="text-[#A69697] text-[12px] mb-1">Total</p>
                     <p className="text-[#D98F8F] text-[24px] font-bold">5,500.00 TND</p>
                   </div>

                   <div className="bg-[rgba(255,255,255,0.03)] border border-white/5 rounded-[16px] p-5">
                     <div className="flex justify-between items-center mb-2">
                       <span className="text-[#A69697] text-[12px]">Totals</span>
                       <span className="text-white font-bold text-[12px]">7,500 TND</span>
                     </div>
                     <div className="w-full h-1.5 bg-[#1A0A0B] rounded-full overflow-hidden">
                       <div className="w-[80%] h-full bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] rounded-full"></div>
                     </div>
                   </div>
                 </div>
               </div>
               
             </div>
          </div>
        </section>

        {/* 4. TTN INTEGRATION PRESENTATION */}
        <section id="ttn" className="px-6 md:px-12 max-w-[1400px] mx-auto w-full">
          <div className="mb-8">
            <h2 className="text-[28px] font-bold text-white">TTN Integration Presentation</h2>
          </div>
          
          <div className="bg-gradient-to-r from-[#1E0A0B] to-[#2D1B1C] border border-[#D98F8F]/20 rounded-[30px] p-10 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
            
            <div className="w-full md:w-[40%] relative z-10 flex flex-col items-start border-r border-white/10 pr-10">
              <div className="flex items-center gap-4 mb-8">
                 <Network className="text-[#D98F8F]" size={64} strokeWidth={1} />
                 <h2 className="text-[48px] font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] to-[#D98F8F]">TTN</h2>
              </div>
              <ul className="space-y-4 text-[15px] text-[#A69697]">
                <li className="flex items-center gap-2">• Bespoke Solutions</li>
                <li className="flex items-center gap-2">• Multi-Region Compliance</li>
                <li className="flex items-center gap-2">• Deep AI Model Custom Training</li>
              </ul>
            </div>

            <div className="w-full md:w-[60%] relative z-10">
              <h3 className="text-[28px] font-bold text-white mb-4">Secure Connection</h3>
              <p className="text-[#A69697] text-[16px] leading-relaxed mb-6">
                Procure connection and automation placement, in-region compliance across instances and regions are offered natively.
              </p>
              <p className="text-white text-[16px] font-medium leading-relaxed">
                Automate, Optimize, and Scale with Aura Finance's secure platform.
              </p>
            </div>
          </div>
        </section>

        {/* 5. ANALYTICS PREVIEW */}
        <section className="px-6 md:px-12 max-w-[1400px] mx-auto w-full">
          <div className="mb-8 flex justify-between items-center">
            <h2 className="text-[28px] font-bold text-white">Analytics Preview</h2>
            <button className="bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-full px-4 py-1.5 text-[12px] text-white">Smart Statistics</button>
          </div>
          
          <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.05)] rounded-[30px] p-6 shadow-2xl grid lg:grid-cols-2 gap-6">
            
            {/* Main Chart */}
            <div className="bg-[#1A0A0B]/80 border border-white/10 rounded-[24px] p-8 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#D98F8F] blur-[100px] opacity-10"></div>
              <p className="text-[#A69697] text-[14px] mb-2">Revenue</p>
              <h3 className="text-[36px] font-bold text-white mb-1">$1,066.37</h3>
              <p className="text-[#4CAF50] text-[12px] font-bold mb-8 flex items-center gap-1">Dynamic <ArrowUpRight size={14}/> 70.0%</p>
              
              <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockChartData}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D98F8F" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#D98F8F" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#A69697" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                    <Area type="monotone" dataKey="val" stroke="#D98F8F" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Side Widgets */}
            <div className="grid grid-rows-2 gap-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#1A0A0B]/80 border border-white/10 rounded-[24px] p-6 flex flex-col justify-between">
                  <p className="text-[#A69697] text-[14px]">Revenue</p>
                  <div className="h-[60px] my-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockChartData}><Line type="monotone" dataKey="val" stroke="#D98F8F" strokeWidth={2} dot={false} /></LineChart>
                    </ResponsiveContainer>
                  </div>
                  <button className="w-full bg-[rgba(255,255,255,0.05)] text-white py-2 rounded-[10px] text-[12px]">Quick View</button>
                </div>
                <div className="bg-[#1A0A0B]/80 border border-white/10 rounded-[24px] p-6 flex flex-col justify-between">
                  <p className="text-[#A69697] text-[14px]">Expenses</p>
                  <div className="h-[60px] my-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mockChartData}><Bar dataKey="val" fill="#8E1B3A" radius={[2,2,0,0]} /></BarChart>
                    </ResponsiveContainer>
                  </div>
                  <button className="w-full bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white py-2 rounded-[10px] text-[12px] font-bold">Add Expense</button>
                </div>
              </div>

              <div className="bg-[#1A0A0B]/80 border border-white/10 rounded-[24px] p-6">
                <p className="text-[#A69697] text-[14px] mb-6">Cash Flow</p>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[#A69697] text-[11px] mb-1">Revenue</p>
                    <div className="flex items-center gap-2"><span className="text-white font-bold">$30K</span> <span className="bg-[#8E1B3A]/30 text-[#D98F8F] px-1.5 py-0.5 rounded text-[10px]">-7.0%</span></div>
                  </div>
                  <div>
                    <p className="text-[#A69697] text-[11px] mb-1">Total</p>
                    <div className="flex items-center gap-2"><span className="text-white font-bold">$53,100</span> <span className="bg-[#4CAF50]/10 text-[#4CAF50] px-1.5 py-0.5 rounded text-[10px]">+1.25%</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. TESTIMONIALS */}
        <section className="px-6 md:px-12 max-w-[1400px] mx-auto w-full text-center">
          <h2 className="text-[32px] font-bold text-white mb-12">Testimonials</h2>
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {['AI Automation', 'Expenses & Approvals', 'AI Statistics', 'Team Management'].map((tab, i) => (
              <button key={i} className={`px-6 py-3 rounded-xl border ${i===0 ? 'bg-[rgba(255,255,255,0.05)] border-[#D98F8F]/50 text-white' : 'bg-transparent border-white/10 text-[#A69697]'} transition-colors`}>{tab}</button>
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-[24px] p-8 hover:border-[#D98F8F]/30 transition-colors">
                 <div className="w-12 h-12 rounded-full mb-6 mx-auto bg-gradient-to-br from-[#D98F8F] to-[#8E1B3A]">
                    <img src={`https://i.pravatar.cc/150?u=${i}`} className="w-full h-full rounded-full object-cover p-0.5 bg-black" />
                 </div>
                 <p className="text-[#EBD8D8] text-[14px] leading-relaxed mb-6 italic">"Elegant processes within the platform ensure smooth automation of finances, freeing valuable manpower."</p>
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-white/10">
                     <img src={`https://i.pravatar.cc/150?u=${i}`} className="w-full h-full rounded-full" />
                   </div>
                   <div>
                     <p className="text-white font-bold text-[14px]">C-Level Executive</p>
                     <p className="text-[#A69697] text-[12px]">Financial Director</p>
                   </div>
                 </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. PRICING */}
        <section id="pricing" className="px-6 md:px-12 max-w-[1400px] mx-auto w-full">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-[32px] font-bold text-white">Pricing</h2>
            <div className="bg-[#1A0A0B] border border-white/10 p-1 rounded-full flex gap-2">
               <button className="px-4 py-1.5 rounded-full text-[#A69697] text-[13px]">Monthly</button>
               <button className="px-4 py-1.5 rounded-full bg-white/10 text-white text-[13px] font-bold">Yearly</button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Basic */}
            <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-[30px] p-10">
              <h3 className="text-white text-[24px] font-bold mb-4">Basic</h3>
              <div className="mb-8">
                <span className="text-[48px] font-bold text-white">29 TND</span><span className="text-[#A69697]">/mo</span>
                <p className="text-[#A69697] text-[12px] mt-1">(Billed annually)</p>
              </div>
              <ul className="space-y-4 mb-10 text-[15px] text-[#A69697]">
                <li>• 50 Scans</li>
                <li>• 5 API Keys</li>
                <li>• 100 Dashboards</li>
              </ul>
              <button className="w-full py-4 rounded-full border border-white/20 text-[#A69697] font-bold hover:bg-white/10 transition-colors">Demo Details</button>
            </div>

            {/* Pro */}
            <div className="bg-[rgba(255,255,255,0.05)] border border-[#D98F8F]/50 rounded-[30px] p-10 relative transform md:-translate-y-4 shadow-[0_20px_50px_rgba(142,27,58,0.3)]">
              <div className="absolute inset-0 rounded-[30px] ring-1 ring-inset ring-[#D98F8F] shadow-[inset_0_0_20px_rgba(217,143,143,0.2)] pointer-events-none"></div>
              <h3 className="text-white text-[24px] font-bold mb-4">Pro</h3>
              <div className="mb-8">
                <span className="text-[48px] font-bold text-white">99 TND</span><span className="text-[#D98F8F]">/mo</span>
                <p className="text-[#D98F8F]/70 text-[12px] mt-1">(Billed annually)</p>
              </div>
              <ul className="space-y-4 mb-10 text-[15px] text-white">
                <li>• 5000 Scans</li>
                <li>• 100 API Keys</li>
                <li>• System Performance</li>
              </ul>
              <button className="w-full py-4 rounded-full bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white font-bold shadow-lg hover:shadow-[0_0_20px_rgba(217,143,143,0.4)] transition-all">View Plan Details</button>
            </div>

            {/* Enterprise */}
            <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-[30px] p-10">
              <h3 className="text-white text-[24px] font-bold mb-4">Enterprise</h3>
              <div className="mb-8">
                <span className="text-[48px] font-bold text-white">199 TND</span><span className="text-[#A69697]">/mo</span>
                <p className="text-[#A69697] text-[12px] mt-1">(Billed annually)</p>
              </div>
              <ul className="space-y-4 mb-10 text-[15px] text-[#A69697]">
                <li>• 5000 Scans</li>
                <li>• 5 API Keys</li>
                <li>• System Performance</li>
              </ul>
              <button className="w-full py-4 rounded-full bg-white/10 text-white font-bold hover:bg-white/20 transition-colors">Plan Details</button>
            </div>
          </div>
        </section>

        {/* 8. FAQ & CTA */}
        <section className="px-6 md:px-12 max-w-[1400px] mx-auto w-full mb-20">
          <h2 className="text-[32px] font-bold text-white mb-8">FAQ Section</h2>
          
          <div className="space-y-4 mb-16">
            {['What is accordion glass pane?', 'What is custom accordion pane?', 'What is modern accordion?', 'What is custom glass pane?'].map((q, i) => (
              <div key={i} className="bg-[rgba(255,255,255,0.03)] border border-white/5 rounded-[16px] p-5 flex justify-between items-center cursor-pointer hover:bg-white/10 transition-colors">
                <span className="text-[#A69697] text-[15px]">{q}</span>
                <ChevronDown size={18} className="text-[#A69697]" />
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
             <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-[30px] p-10">
               <h3 className="text-[28px] font-bold text-white mb-4">Request a Demo</h3>
               <p className="text-[#A69697] mb-8">AI-Powered Invoicing & Expense Management.</p>
               <button className="px-8 py-3 rounded-full border border-[#D98F8F]/50 text-[#D98F8F] hover:bg-[#D98F8F]/10 transition-colors font-bold">Request a Demo</button>
             </div>
             
             <div className="bg-gradient-to-br from-[#2D1B1C] to-[#1A0A0B] border border-[#8E1B3A]/40 rounded-[30px] p-10 relative overflow-hidden">
               <div className="flex items-center gap-3 mb-4">
                 <Network className="text-[#D98F8F]" size={24} />
                 <h3 className="text-[28px] font-bold text-white">Enterprise</h3>
               </div>
               <p className="text-white font-bold text-[20px] mb-2 leading-tight">Contact Sales for Enterprise Custom Quotes</p>
               <p className="text-[#A69697] mb-8 text-[14px]">Enterprise Tier Enterprise Custom Quotes</p>
               <button className="px-8 py-3 rounded-full bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white font-bold shadow-lg">Contact Sales For</button>
             </div>
          </div>
        </section>

      </main>
    </div>
  );
}
