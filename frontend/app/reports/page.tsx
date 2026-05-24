'use client';

import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { ResponsiveContainer, ComposedChart, Line, Area, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { FileText, Download, Calendar, Filter, ChevronDown, Sparkles, Folder, FileBarChart, PieChart, RefreshCw, Zap, Trash2, Mail, Plus, X } from 'lucide-react';
import { analyticsAPI, reportAPI } from '@/lib/api';
import { toast } from 'sonner';

// Report icons mapping
const iconMap: Record<string, any> = {
  'Profit & Loss Statement': FileBarChart,
  'Tax Compliance Audit': FileText,
  'Vendor Spend Analysis': PieChart,
  'AI Extraction Accuracy': Zap,
};

// Helper to format dates consistently
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ReportsPage() {
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Dropdown options
  const reportTypes = [
    'Profit & Loss Statement',
    'Tax Compliance Audit',
    'Vendor Spend Analysis',
    'AI Extraction Accuracy'
  ];

  const dateRanges = [
    'Q1 (Jan - Mar 2026)',
    'Q2 (Apr - Jun 2026)',
    'Q3 (Jul - Sep 2026)',
    'Q4 (Oct - Dec 2026)',
    'Full Year 2026',
    'Custom Range'
  ];

  const formats = ['PDF', 'CSV', 'XLSX'];

  // Selected state
  const [selectedType, setSelectedType] = useState(reportTypes[0]);
  const [selectedRange, setSelectedRange] = useState(dateRanges[1]); // Q2 is current for May 2026
  const [selectedFormat, setSelectedFormat] = useState(formats[0]);
  
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Dropdown open states
  const [openType, setOpenType] = useState(false);
  const [openRange, setOpenRange] = useState(false);
  const [openFormat, setOpenFormat] = useState(false);

  // Vault Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFormat, setFilterFormat] = useState('ALL');

  // Schedule Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedType, setSchedType] = useState(reportTypes[0]);
  const [schedFreq, setSchedFreq] = useState('Monthly');
  const [schedFormat, setSchedFormat] = useState(formats[0]);
  const [schedRecipients, setSchedRecipients] = useState('');

  // Refs for closing dropdowns on click outside
  const typeRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLDivElement>(null);
  const formatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) setOpenType(false);
      if (rangeRef.current && !rangeRef.current.contains(e.target as Node)) setOpenRange(false);
      if (formatRef.current && !formatRef.current.contains(e.target as Node)) setOpenFormat(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, reportsRes, schedulesRes] = await Promise.all([
        analyticsAPI.getMonthlyStats(2026),
        reportAPI.getAll(),
        reportAPI.getSchedules()
      ]);
      setMonthlyData(statsRes.data || []);
      setReports(reportsRes.data || []);
      setSchedules(schedulesRes.data || []);
    } catch (err) {
      console.error('Reports load error:', err);
      toast.error('Failed to retrieve reports data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      if (selectedRange === 'Custom Range' && (!customStartDate || !customEndDate)) {
        toast.error('Please select both start and end dates.');
        setGenerating(false);
        return;
      }
      const rangeToSend = selectedRange === 'Custom Range' ? `${customStartDate} to ${customEndDate}` : selectedRange;

      const res = await reportAPI.generate({
        type: selectedType,
        dateRange: rangeToSend,
        format: selectedFormat,
      });
      if (res.success) {
        toast.success(`Generated ${selectedType} successfully!`);
        // Refresh report vault
        const reportsRes = await reportAPI.getAll();
        setReports(reportsRes.data || []);
      } else {
        toast.error(res.message || 'Report generation failed.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error generating report.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      const res = await reportAPI.delete(id);
      if (res.success) {
        toast.success('Report deleted.');
        setReports(prev => prev.filter(r => r._id !== id));
      } else {
        toast.error(res.message || 'Failed to delete report.');
      }
    } catch (err) {
      toast.error('Error deleting report.');
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedRecipients.trim()) {
      toast.error('Please enter at least one recipient email.');
      return;
    }
    try {
      const res = await reportAPI.createSchedule({
        reportType: schedType,
        frequency: schedFreq,
        format: schedFormat,
        recipients: schedRecipients,
      });
      if (res.success) {
        toast.success('Report schedule created!');
        setShowScheduleModal(false);
        setSchedRecipients('');
        // Refresh schedule list
        const schedsRes = await reportAPI.getSchedules();
        setSchedules(schedsRes.data || []);
      } else {
        toast.error(res.message || 'Failed to create schedule.');
      }
    } catch (err) {
      toast.error('Error saving schedule.');
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Cancel this automated report schedule?')) return;
    try {
      const res = await reportAPI.deleteSchedule(id);
      if (res.success) {
        toast.success('Schedule cancelled.');
        setSchedules(prev => prev.filter(s => s._id !== id));
      } else {
        toast.error(res.message || 'Failed to delete schedule.');
      }
    } catch (err) {
      toast.error('Error deleting schedule.');
    }
  };

  const handleDownload = (report: any) => {
    // Open dynamic download
    const backendUrl = 'http://localhost:5000';
    window.open(`${backendUrl}${report.fileUrl}`, '_blank');
  };

  // Filtered reports list
  const filteredReports = reports.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFormat = filterFormat === 'ALL' || r.format === filterFormat;
    return matchesSearch && matchesFormat;
  });

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

        </div>

        {/* Report Generation Engine */}
        <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-[10px] border border-white/10 rounded-[30px] p-8 shadow-lg relative z-20 overflow-visible">
          <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#8E1B3A]/30 to-transparent blur-[80px] rounded-full pointer-events-none"></div>
          
          <h3 className="text-white text-[20px] font-bold flex items-center gap-2 mb-8 relative z-10">
            Report Generation Engine
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-20">
            {/* Type selector */}
            <div className="flex flex-col gap-2 relative" ref={typeRef}>
              <label className="text-[#A69697] text-[13px] ml-1">Report Type</label>
              <div 
                onClick={() => setOpenType(!openType)}
                className="bg-white/[0.12] backdrop-blur-md border border-white/20 rounded-[16px] p-4 flex items-center justify-between cursor-pointer hover:border-[#D98F8F]/50 hover:bg-white/[0.15] transition-colors shadow-inner"
              >
                 <span className="text-white text-[14px] truncate">{selectedType}</span>
                 <ChevronDown size={16} className={`text-[#A69697] transition-transform duration-200 ${openType ? 'rotate-180' : ''}`} />
              </div>
              {openType && (
                <div className="absolute top-[80px] left-0 w-full bg-[#2A0808] backdrop-blur-lg border border-white/20 rounded-[16px] shadow-2xl z-50 overflow-hidden py-1">
                  {reportTypes.map((t) => (
                    <div 
                      key={t}
                      onClick={() => { setSelectedType(t); setOpenType(false); }}
                      className={`px-4 py-3 text-[14px] cursor-pointer transition-colors ${selectedType === t ? 'text-[#D98F8F] bg-[#8E1B3A]/20 font-medium' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}
                    >
                      {t}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Date Range selector */}
            <div className="flex flex-col gap-2 relative" ref={rangeRef}>
              <label className="text-[#A69697] text-[13px] ml-1">Date Range</label>
              <div 
                onClick={() => setOpenRange(!openRange)}
                className="bg-white/[0.06] backdrop-blur-md border border-white/15 rounded-[16px] p-4 flex items-center justify-between cursor-pointer hover:border-[#D98F8F]/50 hover:bg-white/[0.09] transition-colors shadow-inner"
              >
                 <div className="flex items-center gap-2 text-white text-[14px] truncate">
                   <Calendar size={16} className="text-[#D98F8F] shrink-0" />
                   <span className="truncate">{selectedRange}</span>
                 </div>
                 <ChevronDown size={16} className={`text-[#A69697] transition-transform duration-200 ${openRange ? 'rotate-180' : ''}`} />
              </div>
              {openRange && (
                <div className="absolute top-[80px] left-0 w-full bg-[#2A0808] backdrop-blur-lg border border-white/20 rounded-[16px] shadow-2xl z-50 overflow-hidden py-1">
                  {dateRanges.map((r) => (
                    <div 
                      key={r}
                      onClick={() => { setSelectedRange(r); setOpenRange(false); }}
                      className={`px-4 py-3 text-[14px] cursor-pointer transition-colors ${selectedRange === r ? 'text-[#D98F8F] bg-[#8E1B3A]/20 font-medium' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}
                    >
                      {r}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Format selector */}
            <div className="flex flex-col gap-2 relative" ref={formatRef}>
              <label className="text-[#A69697] text-[13px] ml-1">Format</label>
              <div 
                onClick={() => setOpenFormat(!openFormat)}
                className="bg-white/[0.06] backdrop-blur-md border border-white/15 rounded-[16px] p-4 flex items-center justify-between cursor-pointer hover:border-[#D98F8F]/50 hover:bg-white/[0.09] transition-colors shadow-inner"
              >
                 <span className="text-white text-[14px]">{selectedFormat}</span>
                 <ChevronDown size={16} className={`text-[#A69697] transition-transform duration-200 ${openFormat ? 'rotate-180' : ''}`} />
              </div>
              {openFormat && (
                <div className="absolute top-[80px] left-0 w-full bg-[#2A0808] backdrop-blur-lg border border-white/20 rounded-[16px] shadow-2xl z-50 overflow-hidden py-1">
                  {formats.map((f) => (
                    <div 
                      key={f}
                      onClick={() => { setSelectedFormat(f); setOpenFormat(false); }}
                      className={`px-4 py-3 text-[14px] cursor-pointer transition-colors ${selectedFormat === f ? 'text-[#D98F8F] bg-[#8E1B3A]/20 font-medium' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}
                    >
                      {f}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-end">
              <button 
                onClick={handleGenerateReport}
                disabled={generating}
                className="h-[54px] rounded-[16px] bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white font-bold shadow-[0_0_20px_rgba(142,27,58,0.4)] hover:shadow-[0_0_30px_rgba(217,143,143,0.5)] transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    Generate Report <ChevronDown className="rotate-[-90deg]" size={18} />
                  </>
                )}
              </button>
            </div>
            
            {/* Custom Date Inputs Row */}
            {selectedRange === 'Custom Range' && (
              <div className="col-span-1 md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-6 mt-[-10px] mb-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[#A69697] text-[13px] ml-1">Start Date</label>
                  <input 
                    type="date" 
                    value={customStartDate} 
                    onChange={(e) => setCustomStartDate(e.target.value)} 
                    className="bg-white/[0.06] backdrop-blur-md border border-white/15 rounded-[16px] p-3 text-[14px] text-white focus:outline-none focus:border-[#D98F8F]/50 shadow-inner [color-scheme:dark]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[#A69697] text-[13px] ml-1">End Date</label>
                  <input 
                    type="date" 
                    value={customEndDate} 
                    onChange={(e) => setCustomEndDate(e.target.value)} 
                    className="bg-white/[0.06] backdrop-blur-md border border-white/15 rounded-[16px] p-3 text-[14px] text-white focus:outline-none focus:border-[#D98F8F]/50 shadow-inner [color-scheme:dark]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>



        {/* Report schedules section */}
        {schedules.length > 0 && (
          <div className="bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-[24px] p-6">
            <h4 className="text-white text-[18px] font-bold mb-4 flex items-center gap-2">
              <Mail className="text-[#D98F8F]" size={18} /> Active Auto-Report Schedules
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {schedules.map(sched => (
                <div key={sched._id} className="bg-[#3C0D0D]/80 border border-white/10 p-4 rounded-[16px] flex items-center justify-between shadow-md">
                  <div>
                    <h5 className="text-white text-[14px] font-semibold">{sched.reportType}</h5>
                    <p className="text-[#A69697] text-[12px] mt-0.5">Frequency: <span className="text-[#D98F8F]">{sched.frequency}</span> | Format: <span className="text-[#D98F8F]">{sched.format}</span></p>
                    <p className="text-white/60 text-[11px] mt-1 truncate max-w-[220px]" title={sched.recipients}>To: {sched.recipients}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteSchedule(sched._id)}
                    className="p-2 bg-red-950/20 text-red-400 border border-red-900/30 rounded-[10px] hover:bg-red-900/40 hover:text-red-200 transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generated Reports Vault */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-[#FFFFFF] text-[20px] font-bold flex items-center gap-2">
              <Folder className="text-[#D98F8F]" size={20} /> Report Vault
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex bg-[#3C0D0D] p-1.5 rounded-[12px] border border-white/10">
                {['ALL', 'PDF', 'CSV'].map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setFilterFormat(fmt)}
                    className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-colors cursor-pointer ${filterFormat === fmt ? 'bg-[#8E1B3A]/30 text-[#D98F8F] border border-[#8E1B3A]/40' : 'text-[#A69697] hover:text-white'}`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>

            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div className="bg-[rgba(255,255,255,0.01)] border border-white/5 rounded-[24px] p-16 text-center">
              <Folder className="mx-auto text-white/20 mb-4" size={48} />
              <p className="text-white/60 font-semibold text-[16px]">No generated reports found</p>
              <p className="text-[#A69697] text-[14px] mt-1">Configure parameters above and click generate to create a report.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredReports.map((report) => {
                const Icon = iconMap[report.type] || FileText;
                return (
                  <div key={report._id} className="group relative bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-white/5 rounded-[24px] p-5 transition-all duration-300 hover:bg-[rgba(255,255,255,0.04)] hover:border-[#D98F8F]/30 hover:shadow-[0_10px_30px_rgba(142,27,58,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
                    {/* Left Accent Line */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#D98F8F] to-[#8E1B3A] scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300"></div>
                    
                    <div className="flex flex-col md:flex-row md:items-center gap-5 flex-1">
                      <div className="w-14 h-14 rounded-[16px] shrink-0 bg-[#3C0D0D] border border-white/10 flex items-center justify-center group-hover:bg-[#8E1B3A]/20 transition-colors shadow-inner">
                        <Icon size={26} className="text-[#A69697] group-hover:text-[#D98F8F] transition-colors" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white text-[16px] font-bold mb-1.5 leading-tight truncate">{report.title}</h4>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[#A69697] text-[13px]">
                          <span>{formatDate(report.createdAt)}</span>
                          <span className="w-1 h-1 rounded-full bg-white/20"></span>
                          <span>{report.size}</span>
                          <span className="w-1 h-1 rounded-full bg-white/20"></span>
                          <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-[10px]">{report.format}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row items-center gap-6 md:w-auto w-full justify-between md:justify-end shrink-0 pl-1">

                      
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleDownload(report)}
                          className="px-6 py-2.5 rounded-[12px] bg-[#3C0D0D] border border-white/10 text-[#A69697] font-bold text-[13px] flex items-center justify-center gap-2 group-hover:bg-gradient-to-r group-hover:from-[#D98F8F] group-hover:to-[#8E1B3A] group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-lg cursor-pointer whitespace-nowrap"
                        >
                          <Download size={16} /> Download
                        </button>
                        
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteReport(report._id); }}
                          className="w-10 h-10 flex items-center justify-center rounded-[12px] bg-red-950/20 text-red-400 border border-red-900/30 hover:bg-red-900/40 hover:text-red-200 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer shrink-0"
                          title="Delete Report"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Schedule Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-[#000000]/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-[#3C0D0D] border border-white/10 rounded-[30px] p-8 max-w-[500px] w-full shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#8E1B3A]/30 to-transparent blur-[60px] rounded-full pointer-events-none"></div>
              
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <h3 className="text-white text-[20px] font-bold flex items-center gap-2">
                  <Mail className="text-[#D98F8F]" size={20} /> Schedule Auto-Report
                </h3>
                <button 
                  onClick={() => setShowScheduleModal(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-[#A69697] hover:text-white transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateSchedule} className="flex flex-col gap-5 relative z-10">
                <div className="flex flex-col gap-2">
                  <label className="text-[#A69697] text-[13px]">Report Type</label>
                  <select 
                    value={schedType}
                    onChange={(e) => setSchedType(e.target.value)}
                    className="bg-[#100506] border border-white/10 rounded-[14px] p-3 text-[14px] text-white focus:outline-none focus:border-[#D98F8F]/50"
                  >
                    {reportTypes.map(t => (
                      <option key={t} value={t} className="bg-[#3C0D0D] text-white">{t}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[#A69697] text-[13px]">Frequency</label>
                    <select 
                      value={schedFreq}
                      onChange={(e) => setSchedFreq(e.target.value)}
                      className="bg-[#100506] border border-white/10 rounded-[14px] p-3 text-[14px] text-white focus:outline-none focus:border-[#D98F8F]/50"
                    >
                      <option value="Daily" className="bg-[#3C0D0D]">Daily</option>
                      <option value="Weekly" className="bg-[#3C0D0D]">Weekly</option>
                      <option value="Monthly" className="bg-[#3C0D0D]">Monthly</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[#A69697] text-[13px]">Format</label>
                    <select 
                      value={schedFormat}
                      onChange={(e) => setSchedFormat(e.target.value)}
                      className="bg-[#100506] border border-white/10 rounded-[14px] p-3 text-[14px] text-white focus:outline-none focus:border-[#D98F8F]/50"
                    >
                      {formats.map(f => (
                        <option key={f} value={f} className="bg-[#3C0D0D]">{f}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[#A69697] text-[13px]">Recipient Emails (comma separated)</label>
                  <input 
                    type="text"
                    placeholder="accountant@aura.com, admin@aura.com"
                    value={schedRecipients}
                    onChange={(e) => setSchedRecipients(e.target.value)}
                    className="bg-[#100506] border border-white/10 rounded-[14px] p-3 text-[14px] text-white focus:outline-none focus:border-[#D98F8F]/50 placeholder:text-white/20"
                  />
                </div>

                <div className="flex gap-4 mt-4 border-t border-white/10 pt-5">
                  <button 
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="flex-1 py-3 border border-white/10 rounded-[14px] text-[#A69697] font-semibold hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white rounded-[14px] font-semibold hover:shadow-[0_0_20px_rgba(217,143,143,0.3)] transition-all cursor-pointer"
                  >
                    Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
