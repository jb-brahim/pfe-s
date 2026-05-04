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
  Cpu
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
        formData.append('invoiceFile', file); // Field name must match backend (invoiceFile)

        // Actual API call to backend
        const response = await api.post('/invoices/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const data = response.data.data; // Standardized backend response wrapper

        setProcessedInvoices(prev => 
          prev.map(inv => 
            inv.id === tempId 
              ? {
                  ...inv,
                  id: data._id, // Use real ID from backend
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Processing Lab</h1>
        <p className="text-slate-400 font-medium">Upload invoices for high-precision AI data extraction.</p>
      </div>

      {/* Upload Zone */}
      <div className="bg-white rounded-[2.5rem] p-10 shadow-soft border border-slate-50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform duration-700">
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

      {/* Processing Queue */}
      <AnimatePresence>
        {processedInvoices.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between px-2">
               <h3 className="text-xl font-extrabold text-slate-900">Current Queue</h3>
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{processedInvoices.length} Items</span>
            </div>

            <div className="space-y-4">
              {processedInvoices.map((invoice) => (
                <motion.div
                  key={invoice.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl p-6 shadow-soft border border-slate-50 flex flex-col md:flex-row md:items-center gap-6"
                >
                  {/* Status Indicator */}
                  <div className="flex-shrink-0">
                    {invoice.status === 'processing' ? (
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      </div>
                    ) : invoice.status === 'completed' ? (
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                        <CheckCircle2 size={24} />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
                        <XCircle size={24} />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                       <h4 className="font-bold text-slate-900 truncate">{invoice.filename}</h4>
                       <span className={cn(
                         "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                         invoice.status === 'processing' ? "bg-amber-50 text-amber-500" :
                         invoice.status === 'completed' ? "bg-emerald-50 text-emerald-500" :
                         "bg-red-50 text-red-500"
                       )}>
                         {invoice.status}
                       </span>
                    </div>

                    {/* Result Grid with Edit capability */}
                    {invoice.extractedData && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 p-6 bg-muted/50 rounded-3xl border border-border">
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Vendor / Company</p>
                            <input 
                              type="text"
                              value={invoice.extractedData.vendor}
                              onChange={(e) => {
                                const val = e.target.value;
                                setProcessedInvoices(prev => prev.map(inv => 
                                  inv.id === invoice.id ? { ...inv, extractedData: { ...inv.extractedData!, vendor: val } } : inv
                                ));
                              }}
                              className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm font-bold focus:border-primary outline-none transition-all"
                            />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Total Amount (TTC)</p>
                            <input 
                              type="number"
                              value={invoice.extractedData.amount}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setProcessedInvoices(prev => prev.map(inv => 
                                  inv.id === invoice.id ? { ...inv, extractedData: { ...inv.extractedData!, amount: val } } : inv
                                ));
                              }}
                              className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm font-bold text-primary focus:border-primary outline-none transition-all"
                            />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Invoice #</p>
                            <input 
                              type="text"
                              value={invoice.extractedData.invoiceNumber}
                              onChange={(e) => {
                                const val = e.target.value;
                                setProcessedInvoices(prev => prev.map(inv => 
                                  inv.id === invoice.id ? { ...inv, extractedData: { ...inv.extractedData!, invoiceNumber: val } } : inv
                                ));
                              }}
                              className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm font-bold focus:border-primary outline-none transition-all"
                            />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Date</p>
                            <input 
                              type="text"
                              value={invoice.extractedData.date}
                              onChange={(e) => {
                                const val = e.target.value;
                                setProcessedInvoices(prev => prev.map(inv => 
                                  inv.id === invoice.id ? { ...inv, extractedData: { ...inv.extractedData!, date: val } } : inv
                                ));
                              }}
                              className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm font-bold focus:border-primary outline-none transition-all"
                            />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Matricule Fiscal</p>
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
                              className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm font-bold focus:border-primary outline-none transition-all"
                            />
                          </div>
                          {/* Financial Details Row */}
                          <div className="md:col-span-1">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Total HT</p>
                            <input 
                              type="number"
                              value={invoice.extractedData.totalHT || 0}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setProcessedInvoices(prev => prev.map(inv => 
                                  inv.id === invoice.id ? { ...inv, extractedData: { ...inv.extractedData!, totalHT: val } } : inv
                                ));
                              }}
                              className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm font-bold focus:border-primary outline-none transition-all"
                            />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">TVA Rate (%)</p>
                            <input 
                              type="number"
                              value={invoice.extractedData.tva || 19}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setProcessedInvoices(prev => prev.map(inv => 
                                  inv.id === invoice.id ? { ...inv, extractedData: { ...inv.extractedData!, tva: val } } : inv
                                ));
                              }}
                              className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm font-bold focus:border-primary outline-none transition-all"
                            />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">TVA Amount</p>
                            <input 
                              type="number"
                              value={invoice.extractedData.tvaAmount || 0}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setProcessedInvoices(prev => prev.map(inv => 
                                  inv.id === invoice.id ? { ...inv, extractedData: { ...inv.extractedData!, tvaAmount: val } } : inv
                                ));
                              }}
                              className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm font-bold focus:border-primary outline-none transition-all"
                            />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Timbre</p>
                            <input 
                              type="number"
                              value={invoice.extractedData.timbre || 0}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setProcessedInvoices(prev => prev.map(inv => 
                                  inv.id === invoice.id ? { ...inv, extractedData: { ...inv.extractedData!, timbre: val } } : inv
                                ));
                              }}
                              className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm font-bold focus:border-primary outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                           <button 
                             onClick={async () => {
                               try {
                                 // 1. Update the data with any manual fixes
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
                                 
                                 // 2. Submit for manager review
                                 await api.post(`/invoices/${invoice.id}/submit`);
                                 
                                 toast.success('Invoice submitted for verification!');
                                 setProcessedInvoices(prev => prev.filter(inv => inv.id !== invoice.id));
                               } catch (err) {
                                 toast.error('Failed to submit invoice');
                               }
                             }}
                             className="px-6 py-3 bg-primary text-white rounded-2xl font-bold flex items-center gap-2 shadow-purple hover:scale-105 transition-all"
                           >
                              <ShieldCheck size={18} />
                              Submit for Verification
                           </button>
                        </div>
                      </div>
                    )}

                    {invoice.error && (
                      <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                        <AlertCircle size={14} />
                        {invoice.error}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-slate-50">
            <div className="flex items-center gap-4 mb-6">
               <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl">
                  <ShieldCheck size={24} />
               </div>
               <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">AI Reliability</h3>
            </div>
            <ul className="space-y-4">
               {[
                 "99.9% Extraction accuracy",
                 "Support for French & Arabic",
                 "Automatic MF validation",
                 "Audit trail for every file"
               ].map((item, i) => (
                 <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {item}
                 </li>
               ))}
            </ul>
         </div>

         <div className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-slate-50">
            <div className="flex items-center gap-4 mb-6">
               <div className="p-3 bg-primary/5 text-primary rounded-2xl">
                  <Sparkles size={24} />
               </div>
               <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Smart Tips</h3>
            </div>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">
              For best results, ensure your invoices are well-lit and the text is clear. You can upload up to 25 files at once for batch processing.
            </p>
            <div className="mt-6 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest cursor-pointer hover:gap-3 transition-all">
               View documentation <ArrowRight size={14} />
            </div>
         </div>
      </div>
    </div>
  );
}
