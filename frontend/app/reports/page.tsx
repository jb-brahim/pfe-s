'use client';

import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { ResponsiveContainer, ComposedChart, Line, Area, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { FileText, Download, Calendar, Filter, ChevronDown, Sparkles, Folder, FileBarChart, PieChart, RefreshCw, Zap, Trash2, Mail, Plus, X, FileDown } from 'lucide-react';
import { analyticsAPI, reportAPI, invoiceAPI } from '@/lib/api';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n-context';// Report icons mapping
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
  const { t } = useLanguage();
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Type Maps for Translation
  const typeMap: Record<string, string> = {
    'Profit & Loss Statement': 'profit_loss',
    'Tax Compliance Audit': 'tax_compliance',
    'Vendor Spend Analysis': 'vendor_spend',
    'AI Extraction Accuracy': 'ai_extraction',
  };

  const rangeMap: Record<string, string> = {
    'Q1 (Jan - Mar 2026)': 'q1',
    'Q2 (Apr - Jun 2026)': 'q2',
    'Q3 (Jul - Sep 2026)': 'q3',
    'Q4 (Oct - Dec 2026)': 'q4',
    'Full Year 2026': 'full_year',
    'Custom Range': 'custom_range',
  };

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
        toast.error(t('reports.select_dates'));
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
        toast.success(t('reports.generated_success'));
        // Refresh report vault
        const reportsRes = await reportAPI.getAll();
        setReports(reportsRes.data || []);
      } else {
        toast.error(res.message || t('reports.generation_failed'));
      }
    } catch (error) {
      console.error(error);
      toast.error(t('reports.generation_failed'));
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm(t('reports.delete_confirm'))) return;
    try {
      const res = await reportAPI.delete(id);
      if (res.success) {
        toast.success(t('reports.delete_success'));
        setReports(prev => prev.filter(r => r._id !== id));
      } else {
        toast.error(res.message || t('reports.delete_failed'));
      }
    } catch (err) {
      toast.error(t('reports.delete_failed'));
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedRecipients.trim()) {
      toast.error(t('reports.recipient_required'));
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
        toast.success(t('reports.schedule_success'));
        setShowScheduleModal(false);
        setSchedRecipients('');
        // Refresh schedule list
        const schedsRes = await reportAPI.getSchedules();
        setSchedules(schedsRes.data || []);
      } else {
        toast.error(res.message || t('reports.schedule_failed'));
      }
    } catch (err) {
      toast.error(t('reports.schedule_failed'));
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm(t('reports.cancel_schedule_confirm'))) return;
    try {
      const res = await reportAPI.deleteSchedule(id);
      if (res.success) {
        toast.success(t('reports.schedule_cancelled'));
        setSchedules(prev => prev.filter(s => s._id !== id));
      } else {
        toast.error(res.message || t('reports.delete_failed'));
      }
    } catch (err) {
      toast.error(t('reports.delete_failed'));
    }
  };

  const handleDownload = (report: any) => {
    // Open dynamic download
    const backendUrl = `${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}`;
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
              {t('reports.title')}
            </h1>
            <p className="text-[#A69697] text-[16px]">{t('reports.subtitle')}</p>
          </div>

        </div>

        {/* Report Generation Engine */}
        <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-white/5 rounded-[16px] p-6 relative z-20">
          <h3 className="text-white text-[15px] font-semibold mb-5">
            {t('reports.engine_title')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-20">
            {/* Type selector */}
            <div className="flex flex-col gap-1.5 relative" ref={typeRef}>
              <label className="text-[#A69697] text-[12px] ml-1">{t('reports.report_type')}</label>
              <div 
                onClick={() => setOpenType(!openType)}
                className="bg-[rgba(0,0,0,0.2)] border border-white/10 rounded-[10px] p-2.5 flex items-center justify-between cursor-pointer hover:border-white/20 transition-colors"
              >
                 <span className="text-white text-[13px] truncate">{typeMap[selectedType] ? t(`reports.types.${typeMap[selectedType]}`) : selectedType}</span>
                 <ChevronDown size={14} className={`text-[#A69697] transition-transform duration-200 ${openType ? 'rotate-180' : ''}`} />
              </div>
              {openType && (
                <div className="absolute top-[60px] left-0 w-full bg-[#1A0A0B] border border-white/10 rounded-[10px] shadow-xl z-50 overflow-hidden py-1">
                  {reportTypes.map((t_type) => (
                    <div 
                      key={t_type}
                      onClick={() => { setSelectedType(t_type); setOpenType(false); }}
                      className={`px-3 py-2 text-[13px] cursor-pointer transition-colors ${selectedType === t_type ? 'bg-white/10 text-white font-medium' : 'text-[#A69697] hover:bg-white/5 hover:text-white'}`}
                    >
                      {typeMap[t_type] ? t(`reports.types.${typeMap[t_type]}`) : t_type}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Date Range selector */}
            <div className="flex flex-col gap-1.5 relative" ref={rangeRef}>
              <label className="text-[#A69697] text-[12px] ml-1">{t('reports.date_range')}</label>
              <div 
                onClick={() => setOpenRange(!openRange)}
                className="bg-[rgba(0,0,0,0.2)] border border-white/10 rounded-[10px] p-2.5 flex items-center justify-between cursor-pointer hover:border-white/20 transition-colors"
              >
                 <div className="flex items-center gap-2 text-white text-[13px] truncate">
                   <Calendar size={14} className="text-[#A69697]" />
                   <span className="truncate">{rangeMap[selectedRange] ? t(`reports.ranges.${rangeMap[selectedRange]}`) : selectedRange}</span>
                 </div>
                 <ChevronDown size={14} className={`text-[#A69697] transition-transform duration-200 ${openRange ? 'rotate-180' : ''}`} />
              </div>
              {openRange && (
                <div className="absolute top-[60px] left-0 w-full bg-[#1A0A0B] border border-white/10 rounded-[10px] shadow-xl z-50 overflow-hidden py-1">
                  {dateRanges.map((r) => (
                    <div 
                      key={r}
                      onClick={() => { setSelectedRange(r); setOpenRange(false); }}
                      className={`px-3 py-2 text-[13px] cursor-pointer transition-colors ${selectedRange === r ? 'bg-white/10 text-white font-medium' : 'text-[#A69697] hover:bg-white/5 hover:text-white'}`}
                    >
                      {rangeMap[r] ? t(`reports.ranges.${rangeMap[r]}`) : r}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Format selector */}
            <div className="flex flex-col gap-1.5 relative" ref={formatRef}>
              <label className="text-[#A69697] text-[12px] ml-1">{t('reports.format')}</label>
              <div 
                onClick={() => setOpenFormat(!openFormat)}
                className="bg-[rgba(0,0,0,0.2)] border border-white/10 rounded-[10px] p-2.5 flex items-center justify-between cursor-pointer hover:border-white/20 transition-colors"
              >
                 <span className="text-white text-[13px]">{selectedFormat}</span>
                 <ChevronDown size={14} className={`text-[#A69697] transition-transform duration-200 ${openFormat ? 'rotate-180' : ''}`} />
              </div>
              {openFormat && (
                <div className="absolute top-[60px] left-0 w-full bg-[#1A0A0B] border border-white/10 rounded-[10px] shadow-xl z-50 overflow-hidden py-1">
                  {formats.map((f) => (
                    <div 
                      key={f}
                      onClick={() => { setSelectedFormat(f); setOpenFormat(false); }}
                      className={`px-3 py-2 text-[13px] cursor-pointer transition-colors ${selectedFormat === f ? 'bg-white/10 text-white font-medium' : 'text-[#A69697] hover:bg-white/5 hover:text-white'}`}
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
                className="h-[40px] rounded-[10px] bg-white/10 text-white text-[13px] font-medium hover:bg-white/20 border border-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> {t('reports.generating')}
                  </>
                ) : (
                  <>
                    <FileText size={14} /> {t('reports.generate_report')}
                  </>
                )}
              </button>
            </div>
            
            {/* Custom Date Inputs Row */}
            {selectedRange === 'Custom Range' && (
              <div className="col-span-1 md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#A69697] text-[12px] ml-1">{t('reports.start_date')}</label>
                  <input 
                    type="date" 
                    value={customStartDate} 
                    onChange={(e) => setCustomStartDate(e.target.value)} 
                    className="bg-[rgba(0,0,0,0.2)] border border-white/10 rounded-[10px] p-2 text-[13px] text-white focus:outline-none focus:border-white/30 [color-scheme:dark]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#A69697] text-[12px] ml-1">{t('reports.end_date')}</label>
                  <input 
                    type="date" 
                    value={customEndDate} 
                    onChange={(e) => setCustomEndDate(e.target.value)} 
                    className="bg-[rgba(0,0,0,0.2)] border border-white/10 rounded-[10px] p-2 text-[13px] text-white focus:outline-none focus:border-white/30 [color-scheme:dark]"
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
              <Mail className="text-[#D98F8F]" size={18} /> {t('reports.active_schedules')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {schedules.map(sched => (
                <div key={sched._id} className="bg-[#3C0D0D]/80 border border-white/10 p-4 rounded-[16px] flex items-center justify-between shadow-md">
                  <div>
                    <h5 className="text-white text-[14px] font-semibold">{typeMap[sched.reportType] ? t(`reports.types.${typeMap[sched.reportType]}`) : sched.reportType}</h5>
                    <p className="text-[#A69697] text-[12px] mt-0.5">{t('reports.frequency')}: <span className="text-[#D98F8F]">{t(`reports.modal.${sched.frequency.toLowerCase()}`)}</span> | {t('reports.format')}: <span className="text-[#D98F8F]">{sched.format}</span></p>
                    <p className="text-white/60 text-[11px] mt-1 truncate max-w-[220px]" title={sched.recipients}>{t('reports.to')}: {sched.recipients}</p>
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
              <Folder className="text-[#D98F8F]" size={20} /> {t('reports.report_vault')}
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex bg-[#3C0D0D] p-1.5 rounded-[12px] border border-white/10">
                {['ALL', 'PDF', 'CSV'].map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setFilterFormat(fmt)}
                    className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-colors cursor-pointer ${filterFormat === fmt ? 'bg-[#8E1B3A]/30 text-[#D98F8F] border border-[#8E1B3A]/40' : 'text-[#A69697] hover:text-white'}`}
                  >
                    {fmt === 'ALL' ? t('reports.all') : fmt}
                  </button>
                ))}
              </div>

            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div className="bg-[rgba(255,255,255,0.01)] border border-white/5 rounded-[16px] p-16 text-center">
              <Folder className="mx-auto text-white/20 mb-4" size={40} />
              <p className="text-white/60 font-medium text-[15px]">{t('reports.no_reports')}</p>
              <p className="text-[#A69697] text-[13px] mt-1">{t('reports.no_reports_desc')}</p>
            </div>
          ) : (
            <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-white/5 rounded-[16px] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[11px] text-[#A69697] uppercase tracking-wider bg-white/5">
                    <th className="px-6 py-3 font-medium">{t('reports.report_type')}</th>
                    <th className="px-6 py-3 font-medium">{t('reports.date')}</th>
                    <th className="px-6 py-3 font-medium">{t('reports.format')}</th>
                    <th className="px-6 py-3 font-medium">{t('reports.size')}</th>
                    <th className="px-6 py-3 text-right font-medium">{t('reports.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[13px] text-white">
                  {filteredReports.map((report) => {
                    const Icon = iconMap[report.type] || FileText;
                    return (
                      <tr key={report._id} className="group hover:bg-white/[0.03] transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-[6px] bg-white/5 flex items-center justify-center shrink-0">
                              <Icon size={14} className="text-[#A69697]" />
                            </div>
                            <span className="font-medium text-[13px] truncate">{typeMap[report.type] ? t(`reports.types.${typeMap[report.type]}`) : report.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-[#A69697] whitespace-nowrap">
                          {formatDate(report.createdAt)}
                        </td>
                        <td className="px-6 py-3">
                          <span className="bg-white/10 text-white/80 px-2 py-0.5 rounded text-[11px] font-mono">{report.format}</span>
                        </td>
                        <td className="px-6 py-3 text-[#A69697] whitespace-nowrap">
                          {report.size}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleDownload(report)}
                              className="px-3 py-1.5 rounded-[6px] bg-white/5 border border-white/10 text-[#A69697] hover:text-white hover:bg-white/10 transition-colors text-[12px] flex items-center gap-1.5 cursor-pointer"
                            >
                              <Download size={13} /> {t('reports.download')}
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDeleteReport(report._id); }}
                              className="w-7 h-7 flex items-center justify-center rounded-[6px] hover:bg-red-900/40 text-[#A69697] hover:text-red-400 transition-colors cursor-pointer"
                              title="Delete Report"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
                  <Mail className="text-[#D98F8F]" size={20} /> {t('reports.modal.schedule_title')}
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
                  <label className="text-[#A69697] text-[13px]">{t('reports.report_type')}</label>
                  <select 
                    value={schedType}
                    onChange={(e) => setSchedType(e.target.value)}
                    className="bg-[#100506] border border-white/10 rounded-[14px] p-3 text-[14px] text-white focus:outline-none focus:border-[#D98F8F]/50"
                  >
                    {reportTypes.map(t_type => (
                      <option key={t_type} value={t_type} className="bg-[#3C0D0D] text-white">{typeMap[t_type] ? t(`reports.types.${typeMap[t_type]}`) : t_type}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[#A69697] text-[13px]">{t('reports.modal.frequency')}</label>
                    <select 
                      value={schedFreq}
                      onChange={(e) => setSchedFreq(e.target.value)}
                      className="bg-[#100506] border border-white/10 rounded-[14px] p-3 text-[14px] text-white focus:outline-none focus:border-[#D98F8F]/50"
                    >
                      <option value="Daily" className="bg-[#3C0D0D]">{t('reports.modal.daily')}</option>
                      <option value="Weekly" className="bg-[#3C0D0D]">{t('reports.modal.weekly')}</option>
                      <option value="Monthly" className="bg-[#3C0D0D]">{t('reports.modal.monthly')}</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[#A69697] text-[13px]">{t('reports.format')}</label>
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
                  <label className="text-[#A69697] text-[13px]">{t('reports.modal.recipients')}</label>
                  <input 
                    type="text"
                    placeholder={t('reports.modal.recipients_placeholder')}
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
                    {t('reports.modal.cancel')}
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white rounded-[14px] font-semibold hover:shadow-[0_0_20px_rgba(217,143,143,0.3)] transition-all cursor-pointer"
                  >
                    {t('reports.modal.schedule')}
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
