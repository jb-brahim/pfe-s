'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageSquare, 
  History,
  Edit3,
  Download,
  Share2,
  Trash2,
  Save,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { AuditTrail, AuditEntry } from '@/components/smartfacture/audit-trail';

// Mock data for a single invoice
const mockInvoice = {
  id: 'INV-2024-001',
  vendor: 'SARL BATI-PRO',
  mf: '12345678901',
  date: '2026-05-01',
  client: 'PROJET RESIDENCE EL BASSMA',
  ht: 120000.00,
  tva: 22800.00,
  timbre: 100.00,
  total: 142900.00,
  status: 'EXTRACTED' as const,
  fileUrl: '/invoice_100_page1.jpg', // Placeholder for the actual file
};

const mockAuditEntries: AuditEntry[] = [
  { id: '1', timestamp: new Date('2026-05-04T07:26:00Z'), action: 'Invoice Processed', user: 'Gemini AI', status: 'success' },
  { id: '2', timestamp: new Date('2026-05-04T08:10:00Z'), action: 'Data Verified', user: 'System', status: 'success' },
];

import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'audit' | 'comments'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/invoices/${id}`);
      const { invoice, extractedData, auditLogs, validation } = response.data;
      
      setInvoiceData({
        id: extractedData?.invoiceNumber || invoice?.invoiceNumber || 'N/A',
        vendor: extractedData?.companyName || invoice?.vendor || 'Unknown Vendor',
        mf: extractedData?.matriculeFiscal || 'N/A',
        date: extractedData?.date || invoice?.date || 'N/A',
        client: extractedData?.client || 'N/A',
        ht: extractedData?.totalHT || 0,
        tva: extractedData?.tvaAmount || 0,
        timbre: extractedData?.timbre || 0,
        total: extractedData?.totalAmount || invoice?.totalTTC || 0,
        status: invoice.status,
        fileUrl: invoice.fileUrl,
        rejectionReason: invoice.rejectionReason,
        auditLogs: (auditLogs || []).map((log: any) => ({
          id: log._id,
          timestamp: new Date(log.createdAt),
          action: log.action,
          user: log.userId?.name || 'System',
          details: log.details
        })),
        confidenceScores: extractedData?.confidenceScores || {},
        validation: validation || null
      });
    } catch (error) {
      toast.error('Failed to load invoice details');
      router.push('/vault');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleSave = async () => {
    try {
      await api.put(`/invoices/${id}/extracted`, {
        companyName: invoiceData.vendor,
        matriculeFiscal: invoiceData.mf,
        date: invoiceData.date,
        totalHT: invoiceData.ht,
        tvaAmount: invoiceData.tva,
        totalAmount: invoiceData.total,
        client: invoiceData.client
      });
      toast.success('Invoice updated successfully');
      setIsEditing(false);
      fetchInvoice();
    } catch (error) {
      toast.error('Failed to save changes');
    }
  };

  const updateField = (field: string, value: any) => {
    setInvoiceData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      await api.post(`/invoices/${id}/submit`);
      toast.success('Invoice submitted for review');
      fetchInvoice();
    } catch (error) {
      toast.error('Failed to submit invoice');
    }
  };

  const handleApprove = async () => {
    try {
      await api.post(`/invoices/${id}/approve`);
      toast.success('Invoice approved successfully');
      fetchInvoice();
    } catch (error) {
      toast.error('Failed to approve invoice');
    }
  };

  const handleReject = async () => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await api.post(`/invoices/${id}/reject`, { reason });
      toast.success('Invoice rejected');
      fetchInvoice();
    } catch (error) {
      toast.error('Failed to reject invoice');
    }
  };

  if (loading || !invoiceData) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Loading Invoice Data...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Action Buttons Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-3 bg-card border border-border rounded-2xl text-muted-foreground hover:text-primary transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Invoice {invoiceData.id}</h1>
            <p className="text-muted-foreground text-sm font-medium">Review and manage extraction results</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-card border border-border text-muted-foreground rounded-xl font-bold text-sm shadow-sm hover:bg-muted transition-all flex items-center gap-2">
            <Download size={18} />
            Export
          </button>

          {/* EMPLOYEE ACTION: SUBMIT */}
          {user?.role === 'EMPLOYEE' && (invoiceData.status === 'DRAFT' || invoiceData.status === 'EXTRACTED' || invoiceData.status === 'VERIFIED') && (
            <button 
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-all flex items-center gap-2"
            >
              <Save size={18} />
              Submit for Review
            </button>
          )}

          {/* MANAGER/ADMIN ACTIONS: APPROVE / REJECT */}
          {(user?.role === 'MANAGER' || user?.role === 'ADMIN') && invoiceData.status === 'SUBMITTED' && (
            <>
              <button 
                onClick={handleReject}
                className="px-5 py-2.5 bg-red-500/10 text-red-500 rounded-xl font-bold text-sm hover:bg-red-500/20 transition-all flex items-center gap-2"
              >
                <XCircle size={18} />
                Reject
              </button>
              <button 
                onClick={handleApprove}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-purple hover:scale-105 transition-all flex items-center gap-2"
              >
                <CheckCircle2 size={18} />
                Approve Invoice
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
        
        {/* Left: Invoice Image Preview */}
        <div className="lg:col-span-7 bg-muted rounded-[2.5rem] border border-border overflow-hidden relative group shadow-inner">
           <div className="absolute inset-0 flex items-center justify-center">
              {/* This would be the actual image or PDF viewer */}
              {invoiceData.fileUrl && invoiceData.fileUrl !== 'MANUAL_ENTRY' ? (
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/${invoiceData.fileUrl.replace(/\\/g, '/')}`} 
                  alt="Invoice" 
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <FileText size={80} className="text-muted-foreground/30" />
                    <span className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
                      {invoiceData.fileUrl === 'MANUAL_ENTRY' ? 'Manual Entry (No Image)' : 'No Image Available'}
                    </span>
                  </div>
                </div>
              )}
           </div>
           
           {/* Zoom Controls Overlay */}
           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-md rounded-2xl shadow-xl border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 hover:bg-muted rounded-lg text-foreground transition-colors">-</button>
              <span className="text-xs font-bold text-foreground px-2">100%</span>
              <button className="p-2 hover:bg-muted rounded-lg text-foreground transition-colors">+</button>
           </div>
        </div>

        {/* Right: Data & Activity Panel */}
        <div className="lg:col-span-5 bg-card rounded-[2.5rem] border border-border shadow-soft flex flex-col overflow-hidden">
          
          {/* Panel Tabs */}
          <div className="flex items-center border-b border-border p-2">
            {[
              { id: 'details', label: 'Data Details', icon: Edit3 },
              { id: 'audit', label: 'Audit Trail', icon: History },
              { id: 'comments', label: 'Comments', icon: MessageSquare },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-xs font-bold transition-all",
                  activeTab === tab.id 
                    ? "bg-primary/5 text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'details' && (
                <motion.div 
                  key="details"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-extrabold text-foreground">Extracted Fields</h3>
                    {(user?.role === 'MANAGER' || user?.role === 'ADMIN' || (user?.role === 'EMPLOYEE' && (invoiceData.status === 'DRAFT' || invoiceData.status === 'EXTRACTED'))) && (
                      <button 
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                      >
                        {isEditing ? <><Save size={14}/> Save Changes</> : <><Edit3 size={14}/> Edit Fields</>}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <DataField 
                      label="Vendor Name" 
                      value={invoiceData.vendor} 
                      isEditing={isEditing} 
                      onChange={(val: string) => updateField('vendor', val)}
                      confidence={invoiceData.confidenceScores?.companyName}
                    />
                    <DataField 
                      label="Matricule Fiscal (MF)" 
                      value={invoiceData.mf} 
                      isEditing={isEditing} 
                      onChange={(val: string) => updateField('mf', val)}
                      confidence={invoiceData.confidenceScores?.matriculeFiscal}
                      mono 
                    />
                    <div className="grid grid-cols-2 gap-6">
                      <DataField 
                        label="Invoice Date" 
                        value={invoiceData.date} 
                        isEditing={isEditing} 
                        onChange={(val: string) => updateField('date', val)}
                        confidence={invoiceData.confidenceScores?.date}
                      />
                      <DataField label="Status" value={invoiceData.status === 'SUBMITTED' ? 'Pending' : invoiceData.status} isReadOnly />
                    </div>
                    <div className="p-6 bg-muted/50 rounded-3xl space-y-4 border border-border">
                      <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Financial Summary</h4>
                      <FinancialRow label="Total HT" value={invoiceData.ht} />
                      <FinancialRow label="TVA (19%)" value={invoiceData.tva} />
                      <FinancialRow label="Timbre" value={invoiceData.timbre} />
                      <div className="pt-4 border-t border-border flex items-center justify-between">
                        <span className="text-sm font-black text-foreground">TOTAL TTC</span>
                        <span className="text-xl font-black text-primary font-mono">${invoiceData.total?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                   {/* AI Verification Engine Highlights */}
                   {(invoiceData.status === 'SUBMITTED' || invoiceData.status === 'VERIFIED') && invoiceData.validation && (
                     <div className="space-y-3">
                        <div className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest",
                          invoiceData.validation.overallStatus === 'PASS' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                          invoiceData.validation.overallStatus === 'WARNING' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                          "bg-red-500/10 text-red-500 border-red-500/20"
                        )}>
                           <AlertCircle size={14} />
                           Verification Engine: {invoiceData.validation.overallStatus}
                        </div>
                        
                        <div className="p-4 bg-muted/50 rounded-2xl border border-border space-y-3">
                           {invoiceData.validation.rules.map((rule: any, idx: number) => (
                             <div key={idx} className="flex items-center justify-between">
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-foreground/80">{rule.ruleName}</span>
                                  <span className="text-[10px] text-muted-foreground">{rule.message}</span>
                                </div>
                                <span className={cn(
                                  "text-[10px] font-black uppercase",
                                  rule.passed ? "text-emerald-500" : "text-red-500"
                                )}>
                                  {rule.passed ? 'Passed' : 'Flagged'}
                                </span>
                             </div>
                           ))}
                        </div>
                     </div>
                   )}

                   {/* Rejection Feedback */}
                   {invoiceData.status === 'REJECTED' && (
                     <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
                       <AlertCircle size={18} className="text-red-500 mt-0.5" />
                       <div>
                         <p className="text-xs font-bold text-red-500">Rejection Feedback</p>
                         <p className="text-[10px] text-red-400 mt-1 font-medium italic">"{invoiceData.rejectionReason || 'No reason provided'}"</p>
                       </div>
                     </div>
                   )}

                   {/* Validation Notice */}
                   {invoiceData.status === 'APPROVED' && (
                     <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
                       <CheckCircle2 size={18} className="text-emerald-500 mt-0.5" />
                       <div>
                         <p className="text-xs font-bold text-emerald-500">Audit Complete & Approved</p>
                         <p className="text-[10px] text-emerald-400 mt-1 font-medium">This invoice has been verified and stored as a valid corporate expense.</p>
                       </div>
                     </div>
                   )}
                </motion.div>
              )}

              {activeTab === 'audit' && (
                <motion.div 
                  key="audit"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-extrabold text-foreground">Action History</h3>
                  <AuditTrail entries={invoiceData.auditLogs || []} maxHeight="max-h-full" />
                </motion.div>
              )}

              {activeTab === 'comments' && (
                <motion.div 
                  key="comments"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="h-full flex flex-col"
                >
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground/30">
                      <MessageSquare size={32} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">No comments yet</p>
                      <p className="text-xs text-muted-foreground font-medium mt-1">Start a discussion about this invoice.</p>
                    </div>
                  </div>
                  <div className="mt-auto pt-6 border-t border-border">
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Type a comment..." 
                        className="w-full px-6 py-4 bg-muted/50 border border-border rounded-2xl outline-none focus:border-primary/30 transition-all text-sm font-medium pr-14 text-foreground"
                      />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-xl shadow-purple">
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
}

// Sub-components for cleaner code
function DataField({ label, value, isEditing, isReadOnly, mono, onChange, confidence }: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</label>
        {confidence !== undefined && (
          <span className={cn(
            "text-[9px] font-bold px-1.5 py-0.5 rounded-md",
            confidence >= 0.9 ? "bg-emerald-500/10 text-emerald-500" :
            confidence >= 0.7 ? "bg-amber-500/10 text-amber-500" :
            "bg-red-500/10 text-red-500"
          )}>
            AI: {Math.round(confidence * 100)}%
          </span>
        )}
      </div>
      {isEditing && !isReadOnly ? (
        <input 
          type="text" 
          value={value || ''} 
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full px-4 py-3 bg-muted border border-primary/20 rounded-xl outline-none focus:border-primary transition-all text-sm font-bold text-foreground"
        />
      ) : (
        <div className={cn(
          "px-4 py-3 bg-muted/50 rounded-xl text-sm font-bold text-foreground border border-transparent",
          mono && "font-mono tracking-wider"
        )}>
          {value || 'N/A'}
        </div>
      )}
    </div>
  );
}

function FinancialRow({ label, value }: { label: string, value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className="text-sm font-bold text-foreground font-mono">${value.toLocaleString()}</span>
    </div>
  );
}
