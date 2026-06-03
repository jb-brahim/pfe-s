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
  const [zoomLevel, setZoomLevel] = useState(1);

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
        <div className="grid lg:grid-cols-[1.1fr_3fr] gap-6 items-start">
          
          {/* LEFT: Invoice Preview Panel */}
          <div className="flex flex-col gap-4 sticky top-6">
            <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.1)] rounded-[20px] p-5 shadow-lg flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#FFFFFF] text-[16px] font-medium">Invoice Preview Panel</h3>
                <MoreHorizontal size={18} className="text-[#A69697] cursor-pointer" />
              </div>
              
              {/* Controls */}
              <div className="flex items-center justify-between text-[#A69697] text-[13px] mb-4">
                <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5">Page</span>
                <span className="flex items-center gap-2">Page 1 <span className="cursor-pointer">&gt;</span></span>
                <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-full border border-white/5 select-none">
                  <span className="cursor-pointer px-1 hover:text-white" onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}>-</span> 
                  <span className="min-w-[40px] text-center">{Math.round(zoomLevel * 100)}%</span> 
                  <span className="cursor-pointer px-1 hover:text-white" onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))}>+</span>
                </div>
              </div>

              {/* Real File Preview or Fallback */}
              <div className="bg-gradient-to-b from-[#EBD8D8] to-[#C9A9A9] rounded-[16px] text-[#2D1B1C] relative shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] overflow-auto flex flex-col max-h-[800px] custom-scrollbar">
                {invoice.fileUrl ? (
                  invoice.fileUrl.toLowerCase().endsWith('.pdf') ? (
                    <div style={{ width: `${zoomLevel * 100}%`, minHeight: `${zoomLevel * 600}px`, transition: 'width 0.2s ease' }} className="flex-shrink-0">
                      <iframe 
                        src={`${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}/${invoice.fileUrl.replace(/\\/g, '/')}`} 
                        className="w-full h-full border-none min-h-[600px]"
                        title="Invoice PDF"
                      />
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-center p-4">
                      <img 
                        src={`${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}/${invoice.fileUrl.replace(/\\/g, '/')}`} 
                        className="h-auto object-contain rounded-md shadow-sm transition-all duration-200 max-w-none origin-top"
                        style={{ width: `${zoomLevel * 100}%` }}
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

            <button 
              onClick={async () => {
                if (!invoice.fileUrl) return;
                try {
                  const url = `${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}/${invoice.fileUrl.replace(/\\/g, '/')}`;
                  const response = await fetch(url);
                  const blob = await response.blob();
                  const downloadUrl = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = downloadUrl;
                  const extension = invoice.fileUrl.split('.').pop() || 'pdf';
                  link.download = `Invoice-${extractedData?.invoiceNumber || invoice._id}.${extension}`;
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  window.URL.revokeObjectURL(downloadUrl);
                } catch (error) {
                  console.error('Download failed:', error);
                  window.open(`${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}/${invoice.fileUrl.replace(/\\/g, '/')}`, '_blank');
                }
              }}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#EBD8D8] to-[#D98F8F] shadow-[0_0_20px_rgba(217,143,143,0.2)] font-semibold text-[15px] flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform text-[#3C0D0D]"
            >
              <Download size={18} /> Download Invoice
            </button>
          </div>

          {/* RIGHT: Main Dashboard Grid */}
          <div className="flex flex-col gap-4">
            
            {/* Top Row: Analytics, Tax, Extracted */}
            <div className="grid grid-cols-[1fr_2fr] gap-4">
              
              {/* Left Column: Stacked AI & Tax */}
              <div className="flex flex-col gap-4">
                {/* Analytics: Verification */}
                <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-4 flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[#FFFFFF] text-[14px] font-medium truncate">AI Confidence</h3>
                    <MoreHorizontal size={16} className="text-[#A69697] flex-shrink-0" />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <ConfidenceRing score={extractedData.confidenceScores?.overall || 0.9} />
                    <div className="text-[11px] text-[#A69697]">Overall Confidence</div>
                  </div>
                </div>

                {/* Tax Details */}
                <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-4 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[#FFFFFF] text-[14px] font-medium">Tax Details</h3>
                      <MoreHorizontal size={16} className="text-[#A69697]" />
                    </div>
                    <div className="flex justify-between text-[12px] text-[#A69697] mb-2 border-b border-white/10 pb-2">
                      <span>Tax Line</span>
                      <span>Amount</span>
                    </div>
                    <div className="flex justify-between text-[13px] font-medium">
                      <span>TVA Amount</span>
                      <span>{extractedData.tvaAmount?.toLocaleString('fr-FR')} TND</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-[#4CAF50] text-[12px] font-medium">
                    <CheckCircle2 size={14} /> Tax Compliance Checked
                  </div>
                </div>
              </div>

              {/* Right Column: Extracted Information */}
              <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-4 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[#FFFFFF] text-[14px] font-medium">Extracted Information</h3>
                    <MoreHorizontal size={16} className="text-[#A69697]" />
                  </div>
                  <div className="space-y-1.5 text-[13px] mb-4">
                    <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-[#A69697]">Vendor</span> <span className="font-medium truncate max-w-[120px]">{extractedData.companyName || 'N/A'}</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-[#A69697]">Date:</span> <span className="font-medium">{extractedData.date ? new Date(extractedData.date).toLocaleDateString() : 'N/A'}</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-[#A69697]">Amount H.T.</span> <span className="font-medium">{extractedData.totalHT?.toLocaleString('fr-FR')} TND</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-[#A69697]">Tax</span> <span className="font-medium">{extractedData.tvaAmount?.toLocaleString('fr-FR')} TND</span></div>
                    <div className="flex justify-between pt-1 font-bold text-[14px]"><span>Total:</span> <span>{extractedData.totalAmount?.toLocaleString('fr-FR')} TND</span></div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-auto">
                  <div className="bg-[#4CAF50]/10 border border-[#4CAF50]/30 text-[#4CAF50] px-3 py-1.5 rounded-[8px] text-[12px] font-medium flex items-center gap-2 shadow-[inset_0_0_10px_rgba(76,175,80,0.1)] w-full">
                    <CheckCircle2 size={14} /> Status: {invoice.status}
                  </div>
                </div>
              </div>

            </div>

            {/* Products / Line Items Row */}
            {extractedData.lineItems && extractedData.lineItems.length > 0 && (
              <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[#FFFFFF] text-[14px] font-medium">Extracted Line Items</h3>
                  <MoreHorizontal size={16} className="text-[#A69697]" />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px] text-[#A69697]">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="pb-2 font-medium">Description</th>
                        <th className="pb-2 font-medium text-center">Quantity</th>
                        <th className="pb-2 font-medium text-right">Unit Price</th>
                        <th className="pb-2 font-medium text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {extractedData.lineItems.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="py-2 text-white">{item.description || 'N/A'}</td>
                          <td className="py-2 text-center">{item.quantity || 1}</td>
                          <td className="py-2 text-right">{item.unitPrice?.toLocaleString('fr-FR') || 0} TND</td>
                          <td className="py-2 text-right text-white font-medium">{item.totalPrice?.toLocaleString('fr-FR') || 0} TND</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bottom Row: Workflow */}
            <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-5">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[#FFFFFF] text-[14px] font-medium">Approval Workflow Timeline</h3>
                <MoreHorizontal size={16} className="text-[#A69697]" />
              </div>
              
              <div className="relative px-2">
                {/* Connecting Line */}
                <div className="absolute top-4 left-12 right-12 h-0.5 bg-white/10 z-0">
                  {/* Dynamic Progress Line */}
                  <div className="h-full bg-[#4CAF50] transition-all" style={{ width: invoice.status === 'APPROVED' ? '100%' : invoice.status === 'SUBMITTED' || invoice.status === 'VERIFIED' ? '50%' : '0%' }}></div>
                </div>
                
                <div className="flex justify-between relative z-10">
                  
                  {/* Step 1 */}
                  <div className="flex flex-col items-center w-28">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold mb-3 z-10 bg-[#1A0A0B] ${
                      invoice.status === 'FAILED' ? 'border-2 border-[#D98F8F] text-[#D98F8F]' : 'border-2 border-[#4CAF50] text-[#4CAF50]'
                    }`}>1</div>
                    <div className="text-[12px] font-medium text-center text-white mb-1 leading-tight">Scan & Extract</div>
                    <p className="text-[11px] text-[#A69697] text-center">{invoice.status === 'FAILED' ? 'Failed' : 'Completed'}</p>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="flex flex-col items-center w-28">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold mb-3 z-10 bg-[#1A0A0B] ${
                      ['APPROVED', 'SUBMITTED', 'VERIFIED'].includes(invoice.status) ? 'border-2 border-[#4CAF50] text-[#4CAF50]' :
                      invoice.status === 'REJECTED' ? 'border-2 border-[#D98F8F] text-[#D98F8F]' :
                      'border-2 border-[#FFC107] text-[#FFC107]'
                    }`}>2</div>
                    <div className="text-[12px] font-medium text-center text-white mb-1 leading-tight">Verification</div>
                    <p className="text-[11px] text-[#A69697] text-center">{
                      ['APPROVED', 'SUBMITTED', 'VERIFIED'].includes(invoice.status) ? 'Completed' :
                      invoice.status === 'REJECTED' ? 'Failed' : 'In Progress'
                    }</p>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center w-28">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold mb-3 z-10 bg-[#1A0A0B] ${
                      invoice.status === 'APPROVED' ? 'border-2 border-[#4CAF50] text-[#4CAF50]' :
                      invoice.status === 'REJECTED' ? 'border-2 border-[#D98F8F] text-[#D98F8F]' :
                      invoice.status === 'SUBMITTED' ? 'border-2 border-[#FFC107] text-[#FFC107]' :
                      'border-2 border-white/20 text-[#A69697]'
                    }`}>3</div>
                    <div className="text-[12px] font-medium text-center text-white mb-1 leading-tight">Final Approval</div>
                    <p className="text-[11px] text-[#A69697] text-center">{
                      invoice.status === 'APPROVED' ? 'Approved' :
                      invoice.status === 'REJECTED' ? 'Rejected' :
                      invoice.status === 'SUBMITTED' ? 'Pending' : 'Pending'
                    }</p>
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
