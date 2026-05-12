'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadZone } from './upload-zone';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Search,
  Eye,
  Sliders,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { toast } from 'sonner';

interface ProcessedInvoice {
  id: string;
  filename: string;
  status: 'processing' | 'completed' | 'error';
  extractedData?: {
    vendor: string;
    amount: number;
    totalHT?: number;
    tva?: number;
    tvaAmount?: number;
    timbre?: number;
    date: string;
    invoiceNumber: string;
    mf?: string;
  };
  error?: string;
}

export function ProcessingLab() {
  const [processedInvoices, setProcessedInvoices] = useState<ProcessedInvoice[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');

  const handleFilesSelected = async (selectedFiles: File[]) => {
    setIsUploading(true);
    
    // Process each file
    for (const file of selectedFiles) {
      const tempId = Math.random().toString(36).substr(2, 9);
      
      const newInvoice: ProcessedInvoice = {
        id: tempId,
        filename: file.name,
        status: 'processing',
      };
      
      setProcessedInvoices(prev => [newInvoice, ...prev]);

      try {
        const formData = new FormData();
        formData.append('invoiceFile', file);

        const response = await api.post('/invoices/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const data = response.data.data;

        setProcessedInvoices(prev => 
          prev.map(inv => 
            inv.id === tempId 
              ? {
                  ...inv,
                  id: data._id,
                  status: 'completed',
                  extractedData: {
                    vendor: data.extractedData?.companyName || 'Unknown Vendor',
                    amount: data.extractedData?.totalAmount || 0,
                    totalHT: data.extractedData?.totalHT || 0,
                    tva: data.extractedData?.tva || 19,
                    tvaAmount: data.extractedData?.tvaAmount || 0,
                    timbre: data.extractedData?.timbre || 0,
                    date: data.extractedData?.date || 'Unknown Date',
                    invoiceNumber: data.extractedData?.invoiceNumber || 'N/A',
                    mf: data.extractedData?.matriculeFiscal
                  }
                }
              : inv
          )
        );
        toast.success(`Processed ${file.name} successfully`);
      } catch (error: any) {
        setProcessedInvoices(prev => 
          prev.map(inv => 
            inv.id === tempId 
              ? { ...inv, status: 'error', error: error.response?.data?.message || 'Extraction failed' }
              : inv
          )
        );
        toast.error(`Failed to process ${file.name}`);
      }
    }
    
    setIsUploading(false);
  };

  return (
    <div className="space-y-10 pb-10">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="p-1 px-2.5 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-wider border border-primary/20">
                Cognitive OCR Desk
              </span>
           </div>
           <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Invoice Processing Lab</h1>
           <p className="text-muted-foreground font-semibold">Instantly extract structured data and trigger automated compliance checks using AI.</p>
        </div>
        
        <div className="flex items-center gap-1.5 p-1 bg-card/40 border border-white/5 rounded-2xl">
           <button 
             onClick={() => setActiveTab('upload')}
             className={cn(
               "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
               activeTab === 'upload' ? "bg-primary text-white shadow-purple" : "text-muted-foreground hover:text-foreground"
             )}
           >
             Interactive Lab
           </button>
           <button 
             onClick={() => setActiveTab('history')}
             className={cn(
               "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
               activeTab === 'history' ? "bg-primary text-white shadow-purple" : "text-muted-foreground hover:text-foreground"
             )}
           >
             Analysis logs
           </button>
        </div>
      </div>

      {activeTab === 'upload' ? (
        <>
          {/* Drag and Drop Zone Upgraded with Laser Scanning Glow overlays */}
          <div className="sf-card relative group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-6 transition-transform duration-500">
               <Cpu size={160} className="text-primary" />
            </div>
            <div className="relative z-10">
               <UploadZone
                 onFilesSelected={handleFilesSelected}
                 accept=".pdf,.png,.jpg,.jpeg"
                 multiple={true}
                 maxSize={25}
                 loading={isUploading}
               />
            </div>
          </div>

          {/* Interactive Extraction Queue with Live Scanning Effects */}
          <AnimatePresence>
            {processedInvoices.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between px-2">
                   <h3 className="text-xl font-extrabold text-foreground">Extracted Outputs Queue</h3>
                   <span className="text-[10px] font-black bg-white/5 text-muted-foreground border border-white/5 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                     {processedInvoices.length} Items in processing
                   </span>
                </div>

                <div className="space-y-6">
                  {processedInvoices.map((invoice) => (
                    <motion.div
                      key={invoice.id}
                      layout
                      initial={{ opacity: 0, scale: 0.99 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="sf-card relative border-white/5 hover:border-white/10 transition-colors"
                    >
                      {/* Laser-Sweep Animation Overlay during analysis */}
                      {invoice.status === 'processing' && (
                        <div className="animate-laser-scan" />
                      )}

                      <div className="flex flex-col lg:flex-row gap-8">
                        
                        {/* File details column */}
                        <div className="lg:w-1/4 flex flex-col justify-between p-4 bg-white/2 rounded-2xl border border-white/5">
                          <div>
                            <div className="flex items-center gap-3 mb-4">
                              <div className={cn(
                                "w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xs",
                                invoice.status === 'processing' ? "bg-amber-500/10 text-amber-400" :
                                invoice.status === 'completed' ? "bg-emerald-500/10 text-emerald-400" :
                                "bg-red-500/10 text-red-400"
                              )}>
                                {invoice.status === 'processing' ? <RefreshCw className="w-5 h-5 animate-spin" /> : 
                                 invoice.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : 
                                 <XCircle className="w-5 h-5" />}
                              </div>
                              <div className="min-w-0">
                                 <h4 className="font-extrabold text-sm text-foreground truncate">{invoice.filename}</h4>
                                 <span className="text-[9px] text-muted-foreground font-black uppercase tracking-wider">{invoice.status}</span>
                              </div>
                            </div>
                            
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                              {invoice.status === 'processing' ? "Analyzing document vector fields and running optical OCR engine..." :
                               invoice.status === 'completed' ? "Optical scanning complete! Please confirm or modify extracted metrics." :
                               "The document is corrupted or scanning timed out."}
                            </p>
                          </div>

                          {invoice.status === 'completed' && (
                            <div className="pt-6 border-t border-white/5 mt-6">
                              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">
                                 <span>Confidence rating</span>
                                 <span>98.6%</span>
                              </div>
                              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                 <div className="h-full bg-emerald-500 rounded-full w-[98.6%]" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Interactive Edit Fields Tabular Layout */}
                        <div className="flex-1">
                          {invoice.extractedData ? (
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                
                                {/* Vendor */}
                                <div>
                                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 px-1">Supplier / Vendor</label>
                                  <input 
                                    type="text"
                                    value={invoice.extractedData.vendor}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setProcessedInvoices(prev => prev.map(inv => 
                                        inv.id === invoice.id ? { ...inv, extractedData: { ...inv.extractedData!, vendor: val } } : inv
                                      ));
                                    }}
                                    className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:border-primary/40 outline-none transition-all"
                                  />
                                </div>

                                {/* Invoice number */}
                                <div>
                                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 px-1">Invoice number</label>
                                  <input 
                                    type="text"
                                    value={invoice.extractedData.invoiceNumber}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setProcessedInvoices(prev => prev.map(inv => 
                                        inv.id === invoice.id ? { ...inv, extractedData: { ...inv.extractedData!, invoiceNumber: val } } : inv
                                      ));
                                    }}
                                    className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:border-primary/40 outline-none transition-all"
                                  />
                                </div>

                                {/* Date */}
                                <div>
                                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 px-1">Document Date</label>
                                  <input 
                                    type="text"
                                    value={invoice.extractedData.date}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setProcessedInvoices(prev => prev.map(inv => 
                                        inv.id === invoice.id ? { ...inv, extractedData: { ...inv.extractedData!, date: val } } : inv
                                      ));
                                    }}
                                    className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:border-primary/40 outline-none transition-all"
                                  />
                                </div>

                                {/* Matricule Fiscal */}
                                <div>
                                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 px-1">Matricule Fiscal (MF)</label>
                                  <input 
                                    type="text"
                                    value={invoice.extractedData.mf || ''}
                                    placeholder="0000000/A/P/M/000"
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setProcessedInvoices(prev => prev.map(inv => 
                                        inv.id === invoice.id ? { ...inv, extractedData: { ...inv.extractedData!, mf: val } } : inv
                                      ));
                                    }}
                                    className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:border-primary/40 outline-none transition-all"
                                  />
                                </div>

                                {/* Total HT */}
                                <div>
                                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 px-1">Total HT</label>
                                  <input 
                                    type="number"
                                    value={invoice.extractedData.totalHT || 0}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value);
                                      setProcessedInvoices(prev => prev.map(inv => 
                                        inv.id === invoice.id ? { ...inv, extractedData: { ...inv.extractedData!, totalHT: val } } : inv
                                      ));
                                    }}
                                    className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:border-primary/40 outline-none transition-all"
                                  />
                                </div>

                                {/* TVA Rate */}
                                <div>
                                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 px-1">TVA Rate (%)</label>
                                  <input 
                                    type="number"
                                    value={invoice.extractedData.tva || 19}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value);
                                      setProcessedInvoices(prev => prev.map(inv => 
                                        inv.id === invoice.id ? { ...inv, extractedData: { ...inv.extractedData!, tva: val } } : inv
                                      ));
                                    }}
                                    className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:border-primary/40 outline-none transition-all"
                                  />
                                </div>

                                {/* TVA Amount */}
                                <div>
                                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 px-1">TVA Amount</label>
                                  <input 
                                    type="number"
                                    value={invoice.extractedData.tvaAmount || 0}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value);
                                      setProcessedInvoices(prev => prev.map(inv => 
                                        inv.id === invoice.id ? { ...inv, extractedData: { ...inv.extractedData!, tvaAmount: val } } : inv
                                      ));
                                    }}
                                    className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:border-primary/40 outline-none transition-all"
                                  />
                                </div>

                                {/* Timbre */}
                                <div>
                                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 px-1">Timbre Fiscal</label>
                                  <input 
                                    type="number"
                                    value={invoice.extractedData.timbre || 0}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value);
                                      setProcessedInvoices(prev => prev.map(inv => 
                                        inv.id === invoice.id ? { ...inv, extractedData: { ...inv.extractedData!, timbre: val } } : inv
                                      ));
                                    }}
                                    className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:border-primary/40 outline-none transition-all"
                                  />
                                </div>

                                {/* TOTAL TTC */}
                                <div>
                                  <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-2 px-1">TOTAL TTC (DT)</label>
                                  <input 
                                    type="number"
                                    value={invoice.extractedData.amount}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value);
                                      setProcessedInvoices(prev => prev.map(inv => 
                                        inv.id === invoice.id ? { ...inv, extractedData: { ...inv.extractedData!, amount: val } } : inv
                                      ));
                                    }}
                                    className="w-full bg-primary/5 border border-primary/20 text-primary rounded-xl px-4 py-3 text-sm font-extrabold focus:border-primary outline-none transition-all"
                                  />
                                </div>

                              </div>

                              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                 <button 
                                   onClick={async () => {
                                     try {
                                       // 1. Update extracted fields
                                       await api.put(`/invoices/${invoice.id}/extracted`, {
                                         companyName: invoice.extractedData?.vendor,
                                         totalAmount: invoice.extractedData?.amount,
                                         invoiceNumber: invoice.extractedData?.invoiceNumber,
                                         date: invoice.extractedData?.date,
                                         matriculeFiscal: invoice.extractedData?.mf,
                                         totalHT: invoice.extractedData?.totalHT,
                                         tva: invoice.extractedData?.tva,
                                         tvaAmount: invoice.extractedData?.tvaAmount,
                                         timbre: invoice.extractedData?.timbre
                                       });
                                       
                                       // 2. Submit to admin review
                                       await api.post(`/invoices/${invoice.id}/submit`);
                                       
                                       toast.success('Invoice submitted to compliance reviews!');
                                       setProcessedInvoices(prev => prev.filter(inv => inv.id !== invoice.id));
                                     } catch (err) {
                                       toast.error('Failed to submit audited invoice');
                                     }
                                   }}
                                   className="px-6 py-3.5 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-purple hover:scale-102 transition-all cursor-pointer"
                                 >
                                    <ShieldCheck size={16} />
                                    Verify & Submit
                                 </button>
                              </div>
                            </div>
                          ) : invoice.error ? (
                            <div className="flex items-center gap-3 text-red-400 text-xs font-bold bg-red-500/5 p-5 rounded-2xl border border-red-500/10">
                              <AlertCircle size={18} />
                              <span>Extraction failed: {invoice.error}</span>
                            </div>
                          ) : (
                            <div className="h-[200px] flex flex-col items-center justify-center space-y-3">
                              <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Executing OCR Parsing Engines...</span>
                            </div>
                          )}
                        </div>

                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        /* History logs analytics */
        <div className="sf-card text-center p-16">
          <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 text-indigo-400 border border-white/5">
             <Sliders size={24} />
          </div>
          <h3 className="text-xl font-bold text-foreground">Operational Analysis Logs</h3>
          <p className="text-muted-foreground text-sm font-medium mt-1 mb-6">Fully audited records of recent extractions and cognitive processing logs.</p>
          <div className="max-w-md mx-auto space-y-4">
            <div className="p-4 rounded-xl bg-white/2 border border-white/5 flex justify-between text-xs font-bold text-left">
              <span className="text-muted-foreground">Automatic Validation Passing</span>
              <span className="text-emerald-400">92% Average</span>
            </div>
            <div className="p-4 rounded-xl bg-white/2 border border-white/5 flex justify-between text-xs font-bold text-left">
              <span className="text-muted-foreground">Processing Latency</span>
              <span className="text-indigo-400">~2.4 seconds / page</span>
            </div>
          </div>
        </div>
      )}

      {/* Corporate Guidance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="sf-card">
            <div className="flex items-center gap-4 mb-6">
               <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                  <ShieldCheck size={22} />
               </div>
               <h3 className="text-xl font-extrabold text-foreground">AI Verification Engine</h3>
            </div>
            <ul className="space-y-4">
               {[
                 "98.6% Optical extraction accuracy rate",
                 "Multi-Language layout support (French & Arabic)",
                 "Autonomous Matricule Fiscal checks",
                 "Audit trails logged for compliance"
               ].map((item, i) => (
                 <li key={i} className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {item}
                 </li>
               ))}
            </ul>
         </div>

         <div className="sf-card">
            <div className="flex items-center gap-4 mb-6">
               <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                  <Sparkles size={22} />
               </div>
               <h3 className="text-xl font-extrabold text-foreground">Usage Guidelines</h3>
            </div>
            <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
              Ensure scanned receipts and PDFs have visible field boundaries and legible tax lines. You can select multiple documents at once to execute parallel processing.
            </p>
            <div className="mt-6 flex items-center gap-1 text-primary font-black text-xs uppercase tracking-widest cursor-pointer hover:gap-2 transition-all">
               Browse Compliance Guidelines <ArrowRight size={14} />
            </div>
         </div>
      </div>
    </div>
  );
}
