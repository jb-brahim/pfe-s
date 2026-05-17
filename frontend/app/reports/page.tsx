'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { ResponsiveContainer, ComposedChart, Line, Area, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { FileText, Download, Calendar, Filter, ChevronDown, Sparkles, Folder, FileBarChart, PieChart, RefreshCw, Zap } from 'lucide-react';
import { analyticsAPI } from '@/lib/api';

const reportData = [
  { month: 'Jan', revenue: 4200, expenses: 2400, margin: 1800 },
  { month: 'Feb', revenue: 5100, expenses: 3100, margin: 2000 },
  { month: 'Mar', revenue: 4800, expenses: 2800, margin: 2000 },
  { month: 'Apr', revenue: 6000, expenses: 3500, margin: 2500 },
  { month: 'May', revenue: 7500, expenses: 4200, margin: 3300 },
  { month: 'Jun', revenue: 6800, expenses: 3800, margin: 3000 },
  { month: 'Jul', revenue: 8200, expenses: 4600, margin: 3600 },
  { month: 'Aug', revenue: 9500, expenses: 5100, margin: 4400 },
];

const generatedReports = [
  { id: 1, title: 'Q3 Financial Summary', type: 'PDF', date: 'Oct 15, 2023', size: '2.4 MB', icon: FileBarChart, status: 'Ready' },
  { id: 2, title: 'Tax Compliance Audit', type: 'CSV', date: 'Oct 10, 2023', size: '1.1 MB', icon: FileText, status: 'Ready' },
  { id: 3, title: 'Vendor Spend Analysis', type: 'PDF', date: 'Oct 01, 2023', size: '3.8 MB', icon: PieChart, status: 'Ready' },
  { id: 4, title: 'AI Extraction Accuracy', type: 'XLSX', date: 'Sep 28, 2023', size: '0.8 MB', icon: Zap, status: 'Ready' },
];

export default function ReportsPage() {
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await analyticsAPI.getMonthlyStats();
        setMonthlyData(res.data || []);
      } catch (err) {
        console.error('Reports fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const chartData = monthlyData.map(m => ({
    month: m.month,
    expenses: m.totalExpenses || 0,
    count: m.invoiceCount || 0,
    revenue: (m.totalExpenses || 0) * 1.5, // Mock revenue
    margin: (m.totalExpenses || 0) * 0.5 // Mock margin
  }));

  const displayData = chartData.length > 0 ? chartData : reportData;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 w-full pb-10 max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
          <div>
            <h1 className="text-[36px] font-bold tracking-tight mb-2 flex items-center gap-3 text-[#FFFFFF]">
              Intelligence Reports
            </h1>
            <p className="text-[#A69697] text-[16px]">Generate, analyze, and export comprehensive financial and operational insights.</p>
          </div>
          <button className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[#D98F8F] px-6 py-3 rounded-[16px] font-bold shadow-lg hover:bg-[rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(217,143,143,0.2)] transition-all flex items-center gap-2">
            <RefreshCw size={18} /> Schedule Auto-Report
          </button>
        </div>

        {/* Report Generation Engine */}
        <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-[10px] border border-white/10 rounded-[30px] p-8 shadow-lg relative overflow-hidden">
          {/* Glowing background effect */}
          <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#8E1B3A]/30 to-transparent blur-[80px] rounded-full pointer-events-none"></div>
          
          <h3 className="text-white text-[20px] font-bold flex items-center gap-2 mb-8 relative z-10">
            <Sparkles className="text-[#D98F8F]" size={20} /> Report Generation Engine
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
            <div className="flex flex-col gap-2">
              <label className="text-[#A69697] text-[13px] ml-1">Report Type</label>
              <div className="bg-[#1A0A0B]/80 backdrop-blur-md border border-white/10 rounded-[16px] p-4 flex items-center justify-between cursor-pointer hover:border-[#D98F8F]/50 transition-colors shadow-inner">
                 <span className="text-white text-[14px]">Profit & Loss Statement</span>
                 <ChevronDown size={16} className="text-[#A69697]" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#A69697] text-[13px] ml-1">Date Range</label>
              <div className="bg-[#1A0A0B]/80 backdrop-blur-md border border-white/10 rounded-[16px] p-4 flex items-center justify-between cursor-pointer hover:border-[#D98F8F]/50 transition-colors shadow-inner">
                 <div className="flex items-center gap-2 text-white text-[14px]">
                   <Calendar size={16} className="text-[#D98F8F]" />
                   <span>Q3 (Jul - Sep 2023)</span>
                 </div>
                 <ChevronDown size={16} className="text-[#A69697]" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#A69697] text-[13px] ml-1">Format</label>
              <div className="bg-[#1A0A0B]/80 backdrop-blur-md border border-white/10 rounded-[16px] p-4 flex items-center justify-between cursor-pointer hover:border-[#D98F8F]/50 transition-colors shadow-inner">
                 <span className="text-white text-[14px]">PDF Document</span>
                 <ChevronDown size={16} className="text-[#A69697]" />
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <button className="h-[54px] rounded-[16px] bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white font-bold shadow-[0_0_20px_rgba(142,27,58,0.4)] hover:shadow-[0_0_30px_rgba(217,143,143,0.5)] transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
                Generate Report <ChevronDown className="rotate-[-90deg]" size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Insights Visualizer */}
        <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-[10px] border border-white/10 rounded-[30px] p-8 shadow-lg flex flex-col">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-[#FFFFFF] text-[20px] font-bold">Real-time Financial Overview</h3>
              <p className="text-[#A69697] text-[14px] mt-1">Live preview of Revenue vs Expenses before report generation.</p>
            </div>
            <div className="flex items-center gap-4 bg-[#1A0A0B] p-1.5 rounded-full border border-white/10">
              <div className="flex items-center gap-2 px-3">
                <span className="w-3 h-3 rounded-sm bg-[#D98F8F]"></span>
                <span className="text-[12px] text-white">Revenue</span>
              </div>
              <div className="flex items-center gap-2 px-3">
                <span className="w-3 h-3 rounded-sm bg-[#8E1B3A]"></span>
                <span className="text-[12px] text-white">Expenses</span>
              </div>
              <div className="flex items-center gap-2 px-3 border-l border-white/10">
                <span className="w-3 h-1 rounded-sm bg-[#4CAF50]"></span>
                <span className="text-[12px] text-white">Margin</span>
              </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={displayData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenueBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D98F8F" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#D98F8F" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient id="colorExpenseArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8E1B3A" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#8E1B3A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="#A69697" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#A69697" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A0A0B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
                  itemStyle={{ color: '#FFFFFF' }}
                />
                
                <Bar dataKey="revenue" fill="url(#colorRevenueBar)" barSize={20} radius={[4, 4, 0, 0]} />
                <Area type="monotone" dataKey="expenses" fill="url(#colorExpenseArea)" stroke="#8E1B3A" strokeWidth={3} />
                <Line type="monotone" dataKey="margin" stroke="#4CAF50" strokeWidth={3} dot={{ r: 4, fill: '#1A0A0B', stroke: '#4CAF50', strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Generated Reports Vault */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[#FFFFFF] text-[20px] font-bold flex items-center gap-2">
              <Folder className="text-[#D98F8F]" size={20} /> Report Vault
            </h3>
            <button className="text-[#A69697] text-[14px] hover:text-white transition-colors flex items-center gap-1">
              <Filter size={16} /> Filter Vault
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {generatedReports.map((report) => (
              <div key={report.id} className="group relative bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-white/5 rounded-[24px] p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-[rgba(255,255,255,0.04)] hover:border-[#D98F8F]/30 hover:shadow-[0_20px_40px_rgba(142,27,58,0.2)]">
                {/* Top Accent Line */}
                <div className="absolute top-0 left-8 w-12 h-1 bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] rounded-b-full scale-0 group-hover:scale-100 transition-transform origin-left duration-300"></div>
                
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 rounded-[16px] bg-[#1A0A0B] border border-white/10 flex items-center justify-center group-hover:bg-[#8E1B3A]/20 transition-colors shadow-inner">
                    <report.icon size={26} className="text-[#A69697] group-hover:text-[#D98F8F] transition-colors" />
                  </div>
                  <span className="bg-[#4CAF50]/10 border border-[#4CAF50]/30 text-[#4CAF50] px-2 py-1 rounded-[8px] text-[10px] font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(76,175,80,0.1)]">
                    {report.status}
                  </span>
                </div>

                <h4 className="text-white text-[18px] font-bold mb-2 leading-tight">{report.title}</h4>
                <div className="flex items-center gap-2 text-[#A69697] text-[13px] mb-6">
                  <span>{report.date}</span>
                  <span className="w-1 h-1 rounded-full bg-white/20"></span>
                  <span>{report.size}</span>
                  <span className="w-1 h-1 rounded-full bg-white/20"></span>
                  <span className="font-mono bg-white/5 px-1.5 rounded">{report.type}</span>
                </div>

                <button className="w-full py-3.5 rounded-[14px] bg-[#1A0A0B] border border-white/10 text-[#A69697] font-bold text-[14px] flex items-center justify-center gap-2 group-hover:bg-gradient-to-r group-hover:from-[#D98F8F] group-hover:to-[#8E1B3A] group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-lg">
                  <Download size={18} /> Download
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
