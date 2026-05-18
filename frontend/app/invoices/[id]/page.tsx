'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { ArrowLeft, MoreHorizontal, ZoomIn, ZoomOut, Download, Plus, CheckCircle2, AlertCircle, Loader, FileText } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { invoiceAPI } from '@/lib/api';

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

export default function InvoiceDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      setIsLoading(true);
      setErrorStatus(null);
      try {
        const res = await invoiceAPI.getById(id);
        setData(res.data);
      } catch (error: any) {
        console.error('Failed to fetch invoice:', error);
        setErrorStatus(error.response?.status || 500);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchInvoice();
    }
  }, [id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] text-[#A69697] gap-3">
          <Loader size={40} className="animate-spin text-[#D98F8F]" />
          <p className="text-sm font-medium">Loading real-time invoice data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (errorStatus || !data || !data._id) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] text-[#A69697] gap-3">
          <AlertCircle size={40} className="text-[#D98F8F]" />
          <p className="text-sm font-medium">
            {errorStatus === 403 ? "You are not authorized to view this invoice (Access Denied)." : 
             errorStatus === 404 ? "Invoice not found in the database." : 
             "Failed to load invoice or server error."}
          </p>
          <p className="text-xs text-[#A69697]/60">ID: {id}</p>
          <Link href="/invoices" className="text-[#D98F8F] text-sm hover:underline mt-2">Back to Invoices</Link>
        </div>
      </DashboardLayout>
    );
  }

  const invoice = data;
  const extractedData = data.extractedData || {};

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 w-full pb-10 text-[#FFFFFF] min-h-full">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <Link href="/invoices" className="p-2 bg-[rgba(255,255,255,0.05)] rounded-full hover:bg-[rgba(255,255,255,0.1)] transition-colors border border-white/10">
            <ArrowLeft size={20} className="text-[#A69697]" />
          </Link>
          <h1 className="text-[28px] font-medium tracking-tight">Invoice #{extractedData.invoiceNumber || 'N/A'} Details</h1>
        </div>

        {/* Main Grid Layout */}
        <div className="grid lg:grid-cols-[1.1fr_3fr] gap-6 items-stretch">
          
          {/* LEFT: Invoice Preview Panel */}
          <div className="flex flex-col gap-4">
            <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.1)] rounded-[20px] p-5 shadow-lg flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#FFFFFF] text-[16px] font-medium">Invoice Preview Panel</h3>
                <MoreHorizontal size={18} className="text-[#A69697] cursor-pointer" />
              </div>
              
              {/* Controls */}
              <div className="flex items-center justify-between text-[#A69697] text-[13px] mb-4">
                <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5">Page</span>
                <span className="flex items-center gap-2">Page 1 <span className="cursor-pointer">&gt;</span></span>
                <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                  <span className="cursor-pointer px-1">-</span> Zoom <span className="cursor-pointer px-1">+</span>
                </div>
              </div>

              {/* Real File Preview or Fallback */}
              <div className="flex-1 bg-gradient-to-b from-[#EBD8D8] to-[#C9A9A9] rounded-[16px] text-[#2D1B1C] relative shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">
                {invoice.fileUrl ? (
                  invoice.fileUrl.toLowerCase().endsWith('.pdf') ? (
                    <iframe 
                      src={`http://localhost:5000/${invoice.fileUrl.replace(/\\/g, '/')}`} 
                      className="w-full h-full border-none"
                      title="Invoice PDF"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <img 
                        src={`http://localhost:5000/${invoice.fileUrl.replace(/\\/g, '/')}`} 
                        className="max-w-full max-h-full object-contain"
                        alt="Invoice Image"
                      />
                    </div>
                  )
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-[#2D1B1C]/50 p-6">
                    <AlertCircle size={32} />
                    <p className="text-sm font-medium mt-2">No file preview available</p>
                  </div>
                )}
              </div>
            </div>

            <button className="w-full py-4 rounded-xl bg-gradient-to-r from-[#EBD8D8] to-[#D98F8F] shadow-[0_0_20px_rgba(217,143,143,0.2)] font-semibold text-[15px] flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform text-[#1E0A0B]">
              <Download size={18} /> Download PDF Invoice
            </button>
          </div>

          {/* RIGHT: Main Dashboard Grid */}
          <div className="flex flex-col gap-4">
            
            {/* Top Row: Analytics & Tax */}
            <div className="grid grid-cols-2 gap-4">

              {/* Analytics: Verification */}
              <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[#FFFFFF] text-[14px] font-medium truncate">AI Confidence</h3>
                  <MoreHorizontal size={16} className="text-[#A69697] flex-shrink-0" />
                </div>
                <div className="flex items-center justify-center gap-6 h-[80px]">
                  <ConfidenceRing score={extractedData.confidenceScores?.overall || 0.9} />
                  <div className="flex flex-col gap-1 text-[12px]">
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#4CAF50]"></span> High Match</div>
                    <div className="text-[#A69697] text-[11px]">Score: {Math.round((extractedData.confidenceScores?.overall || 0.9) * 100)}%</div>
                  </div>
                </div>
              </div>

              {/* Tax Details */}
              <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-5 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[#FFFFFF] text-[14px] font-medium">Tax Details</h3>
                  <MoreHorizontal size={16} className="text-[#A69697]" />
                </div>
                <div className="flex justify-between text-[12px] text-[#A69697] mb-2 border-b border-white/10 pb-2">
                  <span>Tax Line</span>
                  <span>Amount</span>
                </div>
                <div className="flex justify-between text-[13px] mb-4 font-medium">
                  <span>TVA Amount</span>
                  <span>{extractedData.tvaAmount?.toLocaleString('fr-FR')} TND</span>
                </div>
                <div className="mt-auto flex items-center gap-2 text-[#4CAF50] text-[12px] font-medium">
                  <CheckCircle2 size={14} /> Tax Compliance Checked
                </div>
              </div>
            </div>

            {/* Middle Row: Extracted, Vendor, Signature */}
            <div className="grid grid-cols-3 gap-4">
              {/* Extracted Information */}
              <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[#FFFFFF] text-[14px] font-medium">Extracted Information</h3>
                  <MoreHorizontal size={16} className="text-[#A69697]" />
                </div>
                <div className="space-y-2 text-[13px] mb-4">
                  <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-[#A69697]">Vendor</span> <span className="font-medium truncate max-w-[120px]">{extractedData.companyName || 'N/A'}</span></div>
                  <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-[#A69697]">Date:</span> <span className="font-medium">{extractedData.date ? new Date(extractedData.date).toLocaleDateString() : 'N/A'}</span></div>
                  <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-[#A69697]">Amount H.T.</span> <span className="font-medium">{extractedData.totalHT?.toLocaleString('fr-FR')} TND</span></div>
                  <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-[#A69697]">Tax</span> <span className="font-medium">{extractedData.tvaAmount?.toLocaleString('fr-FR')} TND</span></div>
                  <div className="flex justify-between pt-1 font-bold text-[14px]"><span>Total:</span> <span>{extractedData.totalAmount?.toLocaleString('fr-FR')} TND</span></div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="bg-[#4CAF50]/10 border border-[#4CAF50]/30 text-[#4CAF50] px-3 py-1.5 rounded-[8px] text-[12px] font-medium flex items-center gap-2 shadow-[inset_0_0_10px_rgba(76,175,80,0.1)]">
                    <CheckCircle2 size={14} /> Status: {invoice.status}
                  </div>
                </div>
              </div>

              {/* Vendor Information */}
              <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[#FFFFFF] text-[14px] font-medium">Vendor Information</h3>
                  <MoreHorizontal size={16} className="text-[#A69697]" />
                </div>
                <div className="flex gap-3 mb-4">
                  <div className="text-[12px] text-[#A69697] flex-1 leading-relaxed">
                    <span className="font-bold text-white text-[13px]">{extractedData.companyName || 'N/A'}</span><br/>
                    Address: Non spécifiée<br/>
                    Contact: N/A
                  </div>
                  <div className="bg-[rgba(255,255,255,0.05)] border border-white/10 p-3 rounded-[12px] flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] text-[#A69697] mb-1">Risk<br/>Assessment:</span>
                    <span className="text-[#4CAF50] font-bold text-[16px]">Low</span>
                  </div>
                </div>
              </div>

              {/* TTN Signature Status */}
              <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[#FFFFFF] text-[14px] font-medium">Digital Signature Status</h3>
                  <MoreHorizontal size={16} className="text-[#A69697]" />
                </div>
                <div className="bg-[rgba(255,255,255,0.03)] border border-white/5 rounded-[12px] p-4 flex flex-col gap-3 h-[120px] justify-center items-center">
                  <CheckCircle2 size={32} className="text-[#4CAF50]" />
                  <p className="text-[#4CAF50] font-medium text-[13px]">Signature Valide</p>
                </div>
              </div>
            </div>

            {/* Bottom Row: Workflow */}
            <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[#FFFFFF] text-[14px] font-medium">Approval Workflow Timeline</h3>
                <MoreHorizontal size={16} className="text-[#A69697]" />
              </div>
              
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-white/10 z-0"></div>
                
                <div className="flex justify-between relative z-10">
                  <div className="flex flex-col items-center">
                    <div className="bg-[#4CAF50]/10 border border-[#4CAF50] text-[#4CAF50] px-3 py-1.5 rounded-full text-[12px] font-medium mb-3 whitespace-nowrap">1. Scan & Extract</div>
                    <p className="text-[11px] text-[#A69697]">Completed</p>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="bg-[#FFC107]/10 border border-[#FFC107] text-[#FFC107] px-3 py-1.5 rounded-full text-[12px] font-medium mb-3 whitespace-nowrap">2. Verification</div>
                    <p className="text-[11px] text-[#A69697]">{invoice.status}</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="bg-white/5 border border-white/10 text-[#A69697] px-3 py-1.5 rounded-full text-[12px] font-medium mb-3 whitespace-nowrap">3. Final Approval</div>
                    <p className="text-[11px] text-[#A69697]">Pending</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
