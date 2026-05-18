'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { invoiceAPI, mockInvoices } from '@/lib/api';
import { Upload, Loader, Eye, Edit, Trash2, Search, FileText, Zap, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

type InvoiceStatus = 'ALL' | 'DRAFT' | 'EXTRACTED' | 'VERIFIED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

const ConfidenceRing = ({ score }: { score: number }) => {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score * circumference);
  const color = score > 0.8 ? '#4CAF50' : score > 0.5 ? '#FFC107' : '#D98F8F';
  
  return (
    <div className="relative flex items-center justify-center w-12 h-12" title={`AI Confidence: ${Math.round(score * 100)}%`}>
      <svg className="transform -rotate-90 w-12 h-12">
        <circle cx="24" cy="24" r="16" stroke="rgba(255,255,255,0.05)" strokeWidth="3" fill="none" />
        <circle 
          cx="24" cy="24" r="16" 
          stroke={color} 
          strokeWidth="3" 
          fill="none" 
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
          className="transition-all duration-1000 ease-out" 
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[10px] font-bold" style={{ color }}>{Math.round(score * 100)}%</span>
    </div>
  )
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState(mockInvoices);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const statuses: InvoiceStatus[] = ['ALL', 'DRAFT', 'EXTRACTED', 'VERIFIED', 'SUBMITTED', 'APPROVED', 'REJECTED'];

  useEffect(() => {
    const fetchInvoices = async () => {
      const status = selectedStatus === 'ALL' ? undefined : selectedStatus;
      const result = await invoiceAPI.getAll(status, searchQuery);
      setInvoices(result.data || mockInvoices);
    };

    fetchInvoices();
  }, [selectedStatus, searchQuery]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const interval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + Math.random() * 30, 90));
      }, 300);

      try {
        const result = await invoiceAPI.uploadFile(file);
        const newInvoice = result.data?.data;
        if (newInvoice) {
          const mappedInvoice = {
            _id: newInvoice._id,
            status: newInvoice.status,
            invoiceNumber: newInvoice.extractedData?.invoiceNumber || 'NEW',
            companyName: newInvoice.extractedData?.companyName || file.name,
            totalAmount: newInvoice.extractedData?.totalAmount || 0,
            taxAmount: newInvoice.extractedData?.tvaAmount || 0,
            confidence: newInvoice.extractedData?.confidenceScores?.overall || 0.92,
            createdAt: newInvoice.createdAt || new Date().toISOString(),
            extractedData: newInvoice.extractedData || {}
          };
          setInvoices((prev) => [mappedInvoice, ...prev]);
        } else {
          setInvoices((prev) => [result.data || { 
            _id: Date.now().toString(), 
            status: 'EXTRACTED', 
            invoiceNumber: 'NEW', 
            companyName: file.name, 
            totalAmount: 0, 
            taxAmount: 0,
            confidence: 0.92,
            createdAt: new Date().toISOString(),
            extractedData: {}
          }, ...prev]);
        }
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        clearInterval(interval);
        setUploadProgress(100);
      }
    }

    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }, 1000);
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'APPROVED':
      case 'VERIFIED':
        return { bg: 'bg-[#4CAF50]/10', text: 'text-[#4CAF50]', border: 'border-[#4CAF50]/30', dot: 'bg-[#4CAF50]' };
      case 'SUBMITTED':
      case 'EXTRACTED':
        return { bg: 'bg-[#FFC107]/10', text: 'text-[#FFC107]', border: 'border-[#FFC107]/30', dot: 'bg-[#FFC107]' };
      case 'REJECTED':
        return { bg: 'bg-[#8E1B3A]/30', text: 'text-[#D98F8F]', border: 'border-[#8E1B3A]/50', dot: 'bg-[#D98F8F]' };
      default:
        return { bg: 'bg-white/5', text: 'text-[#A69697]', border: 'border-white/10', dot: 'bg-[#A69697]' };
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (selectedStatus !== 'ALL' && inv.status !== selectedStatus) return false;
    if (searchQuery && !inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 w-full pb-10 max-w-[1400px] mx-auto">
        
        {/* Dynamic Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#B34E56] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
          <div>
            <h1 className="text-[36px] font-bold tracking-tight mb-2 flex items-center gap-3">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#EBD8D8] to-[#D98F8F]">
                AI Invoice Center
              </span>
              <div className="bg-[#8E1B3A]/30 border border-[#8E1B3A] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(142,27,58,0.4)]">
                <Sparkles size={14} className="text-[#D98F8F]" />
                <span className="text-[12px] text-[#D98F8F] font-bold tracking-widest uppercase">Vision Active</span>
              </div>
            </h1>
            <p className="text-[#A69697] text-[16px]">Drop files into the AI vision zone to magically extract and verify data.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[350px_1fr] gap-8 items-start">
          
          {/* LEFT COLUMN: AI Vision Scanner */}
          <div className="flex flex-col gap-6 sticky top-0">
            {/* Holographic Upload Zone */}
            <div className="relative group perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-b from-[#D98F8F]/10 to-transparent rounded-[30px] blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50"></div>
              
              <label 
                htmlFor="file-upload" 
                className="relative flex flex-col items-center justify-center cursor-pointer border border-white/10 rounded-[30px] p-10 text-center overflow-hidden transition-all duration-500 hover:border-[#D98F8F]/50 bg-[rgba(255,255,255,0.02)] backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_rgba(142,27,58,0.15)] min-h-[350px]"
              >
                {/* Animated Background Grid */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity"></div>
                
                {isUploading ? (
                  <div className="text-center w-full z-10 flex flex-col items-center">
                    <div className="relative w-24 h-24 mb-6">
                      <div className="absolute inset-0 border-t-2 border-r-2 border-[#D98F8F] rounded-full animate-spin"></div>
                      <div className="absolute inset-2 border-b-2 border-l-2 border-[#8E1B3A] rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[20px] font-bold text-white">{Math.round(uploadProgress)}%</span>
                      </div>
                    </div>
                    <p className="text-[#D98F8F] text-[15px] font-medium mb-1 animate-pulse tracking-wide">Extracting Data...</p>
                    <p className="text-[#A69697] text-[12px]">Analyzing layout and fields</p>
                  </div>
                ) : (
                  <div className="z-10 flex flex-col items-center">
                    <div className="relative w-24 h-24 mb-8 group-hover:scale-110 transition-transform duration-500">
                      <div className="absolute inset-0 border-2 border-dashed border-[#D98F8F]/30 rounded-2xl animate-[spin_15s_linear_infinite] group-hover:border-[#D98F8F]"></div>
                      <div className="absolute inset-3 bg-gradient-to-tr from-[#8E1B3A] to-[#D98F8F] rounded-[14px] flex items-center justify-center shadow-[0_0_30px_rgba(217,143,143,0.3)] group-hover:shadow-[0_0_50px_rgba(217,143,143,0.6)]">
                        <Zap className="text-white w-8 h-8" />
                      </div>
                    </div>
                    <h3 className="text-[#FFFFFF] font-bold text-[22px] mb-2 tracking-tight">AI Dropzone</h3>
                    <p className="text-[#A69697] text-[14px] mb-6 px-4">Upload invoices here for instant AI extraction.</p>
                    <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[12px] text-[#A69697] flex items-center gap-2">
                      <FileText size={14} /> PDF, JPG, PNG
                    </div>
                  </div>
                )}
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Glassmorphic Invoice List */}
          <div className="flex flex-col gap-6">
            
            {/* Top Toolbar */}
            <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-2 flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-lg relative z-20">
              
              <div className="flex gap-1 overflow-x-auto scrollbar-none p-1">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-5 py-2.5 rounded-[16px] text-[13px] font-bold transition-all duration-300 whitespace-nowrap ${
                      selectedStatus === status
                        ? 'bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-[#FFFFFF] shadow-[0_5px_15px_rgba(142,27,58,0.4)] translate-y-[-2px]'
                        : 'text-[#A69697] hover:text-[#FFFFFF] hover:bg-white/5'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="relative px-2 xl:px-0 xl:w-[300px]">
                <div className="absolute inset-y-0 left-6 xl:left-4 flex items-center pointer-events-none">
                  <Search size={16} className="text-[#A69697]" />
                </div>
                <input
                  type="text"
                  placeholder="Search invoice # or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1A0A0B]/50 border border-white/10 rounded-[16px] py-3 pl-10 pr-4 text-[14px] text-[#FFFFFF] outline-none focus:border-[#D98F8F]/50 focus:bg-[#1E0A0B] transition-all placeholder:text-[#A69697]"
                />
              </div>
            </div>

            {/* Invoices List View (Card based instead of boring table) */}
            <div className="flex flex-col gap-4">
              {filteredInvoices.length === 0 ? (
                <div className="bg-[rgba(255,255,255,0.02)] border border-dashed border-white/10 rounded-[30px] p-16 text-center flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10 text-[#A69697]">
                    <Search size={32} />
                  </div>
                  <h3 className="text-[#FFFFFF] font-medium text-[20px] mb-2">No invoices found</h3>
                  <p className="text-[#A69697] text-[15px]">Try adjusting your filters or upload a new document.</p>
                </div>
              ) : (
                filteredInvoices.map((invoice, idx) => {
                  const style = getStatusStyle(invoice.status);
                  return (
                    <Link 
                      href={`/invoices/${invoice._id}`}
                      key={invoice._id} 
                      className="group relative bg-[rgba(255,255,255,0.03)] backdrop-blur-xl border border-[rgba(255,255,255,0.05)] hover:border-[#D98F8F]/40 hover:bg-[rgba(255,255,255,0.05)] rounded-[24px] p-5 flex flex-col md:flex-row md:items-center gap-6 transition-all duration-400 hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      {/* Left Accent Bar on Hover */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-0 group-hover:h-1/2 bg-gradient-to-b from-[#D98F8F] to-[#8E1B3A] rounded-r-full transition-all duration-500"></div>
                      
                      {/* Icon */}
                      <div className="w-14 h-14 rounded-[16px] bg-[#1A0A0B] border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-[#8E1B3A]/20 group-hover:border-[#D98F8F]/30 transition-colors shadow-inner">
                        <FileText className="text-[#A69697] group-hover:text-[#D98F8F] transition-colors" size={24} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-white font-bold text-[18px] truncate">{invoice.companyName}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase border flex items-center gap-1.5 ${style.bg} ${style.text} ${style.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                            {invoice.status}
                          </span>
                        </div>
                        <p className="text-[#A69697] text-[14px] flex items-center gap-2">
                          <span className="font-mono text-[#EBD8D8] bg-white/5 px-2 py-0.5 rounded text-[12px]">{invoice.invoiceNumber}</span>
                          • Added {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>

                      {/* Amount */}
                      <div className="md:w-[150px] md:text-right">
                        <p className="text-[12px] text-[#A69697] mb-1">Total Amount</p>
                        <p className="text-[22px] font-bold text-white tracking-tight">${invoice.totalAmount?.toLocaleString() || '0'}</p>
                      </div>

                      {/* AI Match */}
                      <div className="md:w-[120px] flex md:justify-center border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
                        {invoice.confidence ? (
                          <div className="flex items-center gap-3">
                            <ConfidenceRing score={invoice.confidence} />
                          </div>
                        ) : (
                          <div className="text-[#A69697] text-[13px] italic">Not scanned</div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 md:pl-4 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                          onClick={(e) => e.stopPropagation()} 
                          className="p-3 rounded-[14px] bg-[#1A0A0B] border border-white/5 text-[#A69697] hover:border-white/20 hover:text-white transition-all hover:scale-105"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={(e) => e.stopPropagation()} 
                          className="p-3 rounded-[14px] bg-[#1A0A0B] border border-white/5 text-[#A69697] hover:border-[#D98F8F]/50 hover:text-[#D98F8F] transition-all hover:scale-105"
                        >
                          <Trash2 size={18} />
                        </button>
                        <div
                          className="ml-2 p-3 rounded-[14px] bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white shadow-[0_0_15px_rgba(142,27,58,0.4)] hover:shadow-[0_0_25px_rgba(217,143,143,0.6)] transition-all hover:scale-105 flex items-center justify-center"
                        >
                          <ChevronRight size={20} />
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
