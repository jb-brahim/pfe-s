'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Zap, ShieldCheck, BarChart3, Users, CheckCircle2, ChevronDown, Network, FileText, ChevronRight, Search, Upload, LineChart as LineChartIcon, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis } from 'recharts';
import { LandingNavbar } from '@/components/landing-navbar';

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

      <LandingNavbar />

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
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
             <Link href="/features" className="w-full sm:w-auto px-10 py-4 rounded-full bg-[rgba(255,255,255,0.1)] backdrop-blur-md border border-[#D98F8F]/50 text-white font-bold text-[16px] shadow-[0_0_30px_rgba(217,143,143,0.3)] hover:bg-[#D98F8F] hover:text-[#1A0A0B] transition-all flex items-center justify-center gap-2">
               Explore Features <ArrowRight size={18} />
             </Link>
          </div>
        </section>

        {/* 2. AI INVOICE AUTOMATION DEMO */}
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

        {/* 3. ANALYTICS PREVIEW */}
        <section className="px-6 md:px-12 max-w-[1400px] mx-auto w-full mb-20">
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

      </main>
    </div>
  );
}
