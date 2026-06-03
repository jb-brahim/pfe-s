'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Zap, ShieldCheck, BarChart3, Users, CheckCircle2, ChevronDown, Network, FileText, ChevronRight, Search, Upload, LineChart as LineChartIcon, ArrowUpRight, Loader } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis } from 'recharts';
import { LandingNavbar } from '@/components/landing-navbar';
import { LandingFooter } from '@/components/landing-footer';
import { useLanguage } from '@/lib/i18n-context';
import { toast } from 'sonner';

export default function LandingPage() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [demoData, setDemoData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsExtracting(true);
    setDemoData(null);
    try {
      const formData = new FormData();
      formData.append('invoiceFile', file);
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${API_URL}/api/invoices/demo-extract`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data?.data?.extractedData) {
        setDemoData(res.data.data.extractedData);
      }
    } catch (err: any) {
      console.error('Demo extraction failed', err);
      const errorMessage = err.response?.data?.message || err.message || 'Demo extraction failed';
      toast.error(errorMessage);
    } finally {
      setIsExtracting(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const mockChartData: any[] = [];

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
            {t('landing.home.hero_title_1')} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] via-[#EBD8D8] to-[#D98F8F]">
              {t('landing.home.hero_title_highlight')}
            </span> <br/>
            {t('landing.home.hero_title_2')}
          </h1>
          <p className="text-[#A69697] text-[18px] md:text-[22px] mb-10 max-w-[700px] leading-relaxed">
            {t('landing.home.hero_subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
             <Link href="/features" className="w-full sm:w-auto px-10 py-4 rounded-full bg-[rgba(255,255,255,0.1)] backdrop-blur-md border border-[#D98F8F]/50 text-white font-bold text-[16px] shadow-[0_0_30px_rgba(217,143,143,0.3)] hover:bg-[#D98F8F] hover:text-[#1A0A0B] transition-all flex items-center justify-center gap-2">
               {t('landing.home.explore_features')} <ArrowRight size={18} />
             </Link>
          </div>
        </section>

        {/* 2. AI INVOICE AUTOMATION DEMO */}
        <section className="px-6 md:px-12 max-w-[1400px] mx-auto w-full">
          <div className="mb-8">
            <h2 className="text-[28px] font-bold text-white">{t('landing.home_sections.demo_title') || 'AI Invoice Automation Demo'}</h2>
          </div>
          
          <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-lg border border-[rgba(255,255,255,0.05)] rounded-[30px] p-6 md:p-10 shadow-2xl">
             <div className="grid lg:grid-cols-2 gap-6">
               
               {/* Left: Drag & Drop + OCR Preview */}
               <div className="space-y-6">
                 {/* Drag & Drop */}
                 <div 
                    className="bg-[#1A0A0B]/80 border border-white/10 rounded-[20px] p-8 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[200px] group border-dashed hover:border-[#D98F8F]/50 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={onDrop}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                      accept=".pdf,.png,.jpg,.jpeg"
                    />
                    <div className="absolute right-0 top-0 w-32 h-32 bg-[#D98F8F] rounded-full blur-[60px] opacity-10"></div>
                    {isExtracting ? (
                      <div className="flex flex-col items-center">
                        <Loader className="text-[#D98F8F] mb-4 animate-spin" size={32} />
                        <p className="text-[#D98F8F] font-bold animate-pulse">Extracting Data...</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="text-[#D98F8F] mb-4" size={32} />
                        <p className="text-white font-bold">
                          {t('landing.home_sections.drag_drop') || 'Drag & Drop Invoices Here'}
                        </p>
                      </>
                    )}
                 </div>
                 
                 {/* OCR Preview */}
                 <div className="bg-[#1A0A0B]/80 border border-white/10 rounded-[20px] p-6 relative">

                    <div className="w-full min-h-[180px] bg-gradient-to-br from-[#EBD8D8] to-[#D98F8F] rounded-[12px] p-4 flex flex-col">
                       {demoData ? (
                         <div className="animate-fade-in">
                           <div className="flex justify-between items-start border-b border-[#8E1B3A]/20 pb-2 mb-2">
                             <div className="flex flex-col gap-1">
                               <div className="flex items-center gap-2">
                                 <Sparkles size={16} className="text-[#8E1B3A]" /> 
                                 <span className="font-bold text-[#8E1B3A]">{demoData.companyName || 'Unknown Vendor'}</span>
                               </div>
                               {demoData.matriculeFiscal && <span className="text-[#8E1B3A] text-[10px]">MF: {demoData.matriculeFiscal}</span>}
                             </div>
                             <div className="text-right text-[#8E1B3A] text-[10px]">
                               <p className="font-bold text-[14px]">{demoData.invoiceNumber || 'INVOICE'}</p>
                               <p>{demoData.date ? new Date(demoData.date).toLocaleDateString() : 'No Date'}</p>
                             </div>
                           </div>
                           <div className="flex flex-col gap-1 mt-2 text-[#8E1B3A] text-[12px]">
                             {demoData.lineItems && demoData.lineItems.map((item: any, i: number) => (
                               <div key={i} className="flex justify-between border-b border-[#8E1B3A]/10 pb-1">
                                 <span className="truncate w-[60%]">{item.description}</span>
                                 <span>{item.total || item.totalPrice}</span>
                               </div>
                             ))}
                           </div>
                         </div>
                       ) : (
                         <>
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
                         </>
                       )}
                    </div>
                 </div>
               </div>

               {/* Right: Extracted Data Cards */}
               <div className="bg-[#1A0A0B]/80 border border-white/10 rounded-[20px] p-6">
                 <p className="text-[#A69697] text-[13px] mb-4">{t('landing.home_sections.extracted_data') || 'Extracted Data Cards'}</p>
                 
                 <div className="space-y-4">
                   <div className="bg-[rgba(255,255,255,0.03)] border border-white/5 rounded-[16px] p-5 flex justify-between items-center">
                     <div>
                       <p className="text-[#A69697] text-[12px] mb-1">Amount HT</p>
                       <p className="text-white font-bold">{demoData ? (demoData.totalHT || 0).toFixed(2) : '5,000.00'} TND</p>
                     </div>
                     <div className="text-right">
                       <p className="text-[#A69697] text-[12px] mb-1">Tax (TVA)</p>
                       <p className="text-white font-bold">{demoData ? (demoData.tvaAmount || 0).toFixed(2) : '500.00'} TND</p>
                     </div>
                   </div>

                   <div className="bg-[rgba(255,255,255,0.03)] border border-white/5 rounded-[16px] p-5">
                     <p className="text-[#A69697] text-[12px] mb-1">Total TTC</p>
                     <p className="text-[#D98F8F] text-[24px] font-bold">{demoData ? (demoData.totalAmount || 0).toFixed(2) : '5,500.00'} TND</p>
                   </div>

                   <div className="bg-[rgba(255,255,255,0.03)] border border-white/5 rounded-[16px] p-5">
                     <div className="flex justify-between items-center mb-2">
                       <span className="text-[#A69697] text-[12px]">Confidence Score</span>
                       <span className="text-white font-bold text-[12px]">
                         {demoData ? Math.round((demoData.confidenceScores?.overall || 0.95) * 100) : '95'}%
                       </span>
                     </div>
                     <div className="w-full h-1.5 bg-[#1A0A0B] rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] rounded-full transition-all duration-1000"
                         style={{ width: `${demoData ? Math.round((demoData.confidenceScores?.overall || 0.95) * 100) : 95}%` }}
                       ></div>
                     </div>
                   </div>
                 </div>
               </div>
               
             </div>
          </div>
        </section>



      </main>

      <LandingFooter />
    </div>
  );
}
