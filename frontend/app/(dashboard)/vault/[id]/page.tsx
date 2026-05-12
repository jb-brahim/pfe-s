'use client';

import React, { useState, useEffect } from 'react';
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
  Trash2,
  Save,
  AlertCircle,
  ArrowRight,
  Send,
  Calendar,
  Layers,
  Sparkles,
  Lock,
  ChevronDown,
  Info
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import { toast } from 'sonner';

interface AuditEntry {
  id: string;
  timestamp: Date;
  action: string;
  user: string;
  details: string;
  status: string;
}

interface Comment {
  _id: string;
  text: string;
  userId: {
    _id: string;
    name: string;
    role: string;
  };
  createdAt: string;
}

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'details' | 'audit' | 'comments'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Real Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/invoices/${id}`);
      const { invoice, extractedData, auditLogs, validation, comments: fetchedComments } = response.data;
      
      setInvoiceData({
        _id: invoice._id,
        id: extractedData?.invoiceNumber || invoice?.invoiceNumber || 'N/A',
        vendor: extractedData?.companyName || invoice?.vendor || 'Unknown Vendor',
        mf: extractedData?.matriculeFiscal || 'N/A',
        date: extractedData?.date || invoice?.date || 'N/A',
        client: extractedData?.client || 'N/A',
        ht: extractedData?.totalHT || 0,
        tva: extractedData?.tvaRate || extractedData?.tva || 19,
        tvaAmount: extractedData?.tvaAmount || 0,
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
          details: log.details || ''
        })),
        confidenceScores: extractedData?.confidenceScores || {
          companyName: 0.95,
          invoiceNumber: 0.98,
          date: 0.92,
          totalAmount: 0.99
        },
        validation: validation || null
      });

      setComments(fetchedComments || []);
    } catch (error) {
      toast.error('Failed to load invoice details');
      router.push('/vault');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchInvoice();
    }
  }, [id]);

  const handleSave = async () => {
    try {
      await api.put(`/invoices/${id}/extracted`, {
        companyName: invoiceData.vendor,
        matriculeFiscal: invoiceData.mf,
        date: invoiceData.date,
        totalHT: invoiceData.ht,
        tva: invoiceData.tva,
        tvaAmount: invoiceData.tvaAmount,
        timbre: invoiceData.timbre,
        totalAmount: invoiceData.total,
        client: invoiceData.client
      });
      toast.success('Invoice details updated successfully');
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
      toast.success('Invoice submitted to compliance reviews');
      fetchInvoice();
    } catch (error) {
      toast.error('Failed to submit invoice');
    }
  };

  const handleApprove = async () => {
    try {
      await api.post(`/invoices/${id}/approve`);
      toast.success('Invoice fully approved and logged!');
      fetchInvoice();
    } catch (error) {
      toast.error('Failed to approve invoice');
    }
  };

  const handleReject = async () => {
    const reason = window.prompt('Please write comments indicating why this invoice was rejected:');
    if (!reason) return;

    try {
      await api.post(`/invoices/${id}/reject`, { reason });
      toast.success('Invoice rejected and feedback recorded.');
      fetchInvoice();
    } catch (error) {
      toast.error('Failed to reject invoice');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    try {
      setSubmittingComment(true);
      const response = await api.post(`/comments/${id}`, { text: newCommentText });
      setComments(prev => [response.data, ...prev]);
      setNewCommentText('');
      toast.success('Comment published');
    } catch (err) {
      toast.error('Failed to publish comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/remove/${commentId}`);
      setComments(prev => prev.filter(c => c._id !== commentId));
      toast.success('Comment deleted');
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  if (loading || !invoiceData) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Analyzing Invoice Data...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6">
      
      {/* Header section with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/vault')}
            className="p-3 bg-card/40 border border-white/5 rounded-2xl text-muted-foreground hover:text-primary transition-all shadow-sm cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
               <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Invoice {invoiceData.id}</h1>
               <span className={cn(
                 "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-block border",
                 invoiceData.status === 'APPROVED' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" :
                 invoiceData.status === 'REJECTED' ? "bg-red-500/10 text-red-400 border-red-500/10" :
                 invoiceData.status === 'VERIFIED' ? "bg-amber-500/10 text-amber-400 border-amber-500/10" :
                 "bg-indigo-500/10 text-indigo-400 border-indigo-500/10"
               )}>
                 {invoiceData.status === 'SUBMITTED' ? 'In Review' : 
                  invoiceData.status === 'VERIFIED' ? 'Pending' : invoiceData.status}
               </span>
            </div>
            <p className="text-muted-foreground text-xs font-semibold">Cognitive audit and verification registry.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* ACCOUNTANT ACTION: SUBMIT */}
          {user?.role === 'ACCOUNTANT' && (invoiceData.status === 'DRAFT' || invoiceData.status === 'EXTRACTED' || invoiceData.status === 'VERIFIED') && (
            <button 
              onClick={handleSubmit}
              className="px-6 py-3 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-purple hover:scale-102 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save size={16} />
              Submit For Review
            </button>
          )}

          {/* ADMIN ACTIONS: APPROVE / REJECT */}
          {user?.role === 'ADMIN' && invoiceData.status === 'SUBMITTED' && (
            <div className="flex items-center gap-3">
              <button 
                onClick={handleReject}
                className="px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <XCircle size={16} />
                Reject
              </button>
              <button 
                onClick={handleApprove}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-102 transition-all flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 size={16} />
                Approve Invoice
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Dual-Panel Split View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
        
        {/* Left Panel: Invoice Image Viewer or Glassmorphism Summary */}
        <div className="lg:col-span-7 bg-card/20 rounded-[2.5rem] border border-white/5 overflow-hidden relative group shadow-inner min-h-[400px]">
           <div className="absolute inset-0 flex items-center justify-center p-6">
              {invoiceData.fileUrl && invoiceData.fileUrl !== 'MANUAL_ENTRY' ? (
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/${invoiceData.fileUrl.replace(/\\/g, '/')}`} 
                  alt="Scanned Invoice" 
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/5"
                />
              ) : (
                <div className="w-full h-full bg-white/2 flex items-center justify-center rounded-3xl border border-dashed border-white/5 p-8">
                  <div className="flex flex-col items-center gap-4 text-center max-w-md">
                    <FileText size={70} className="text-indigo-400/20" />
                    <h4 className="text-xl font-bold text-foreground">{invoiceData.vendor}</h4>
                    <p className="text-xs text-muted-foreground font-semibold">
                      This invoice was entered manually. No attachment is associated with this record.
                    </p>
                    <div className="mt-4 px-6 py-3.5 bg-primary/5 border border-primary/20 rounded-2xl font-mono text-2xl font-black text-primary">
                       {invoiceData.total.toLocaleString()} DT
                    </div>
                  </div>
                </div>
              )}
           </div>
        </div>

        {/* Right Panel: Data, Audit Log, and Live Comments */}
        <div className="lg:col-span-5 sf-card p-0 flex flex-col overflow-hidden">
          
          {/* Menu Selection tabs */}
          <div className="flex items-center border-b border-white/5 p-2 gap-1 bg-white/1">
            {[
              { id: 'details', label: 'Extracted Fields', icon: Edit3 },
              { id: 'audit', label: 'Compliance Audit', icon: History },
              { id: 'comments', label: 'Collaborate', icon: MessageSquare },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
                  activeTab === tab.id 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dynamic Tab Body content */}
          <div className="flex-1 overflow-y-auto p-8 scrollbar">
            <AnimatePresence mode="wait">
              {activeTab === 'details' && (
                <motion.div 
                  key="details"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-extrabold text-foreground">Tax Metrics</h3>
                    {(user?.role === 'ADMIN' || (user?.role === 'ACCOUNTANT' && (invoiceData.status === 'DRAFT' || invoiceData.status === 'EXTRACTED'))) && (
                      <button 
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        {isEditing ? <><Save size={14}/> Save Changes</> : <><Edit3 size={14}/> Edit Values</>}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <DataField 
                      label="Vendor / Company" 
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
                      <DataField label="Workflow Status" value={invoiceData.status === 'SUBMITTED' ? 'In Review' : invoiceData.status} isReadOnly />
                    </div>

                    {/* High-density financial tax grids */}
                    <div className="p-6 bg-white/2 rounded-3xl space-y-4 border border-white/5">
                      <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-4">Financial Ledger</h4>
                      <FinancialRow label="Total HT (Net Amount)" value={invoiceData.ht} />
                      <FinancialRow label={`TVA (${invoiceData.tva}%)`} value={invoiceData.tvaAmount || (invoiceData.ht * (invoiceData.tva / 100))} />
                      <FinancialRow label="Timbre Fiscal" value={invoiceData.timbre} />
                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-sm font-black text-foreground">TOTAL TTC</span>
                        <span className="text-xl font-black text-primary font-mono">{invoiceData.total?.toLocaleString(undefined, { minimumFractionDigits: 2 })} DT</span>
                      </div>
                    </div>
                  </div>

                  {/* Rejection Feed if rejected */}
                  {invoiceData.status === 'REJECTED' && (
                    <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
                      <AlertCircle size={18} className="text-red-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-extrabold text-red-400">Rejection Audit Feedback</p>
                        <p className="text-xs text-red-300 mt-1 font-medium italic">"{invoiceData.rejectionReason || 'No feedback left'}"</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'audit' && (
                <motion.div 
                  key="audit"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-extrabold text-foreground">Compliance & Verification Rules</h3>
                  
                  {invoiceData.validation && (
                    <div className="space-y-4 mb-6">
                      <div className={cn(
                        "flex items-center gap-2 px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest",
                        invoiceData.validation.overallStatus === 'PASS' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" :
                        "bg-red-500/10 text-red-400 border-red-500/10"
                      )}>
                        <Info size={14} />
                        Automated compliance checks: {invoiceData.validation.overallStatus}
                      </div>

                      <div className="space-y-3">
                        {invoiceData.validation.rules?.map((rule: any, idx: number) => (
                          <div key={idx} className="p-4 bg-white/2 border border-white/5 rounded-2xl flex items-center justify-between">
                            <div>
                               <p className="text-xs font-bold text-foreground">{rule.ruleName}</p>
                               <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{rule.message}</p>
                            </div>
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-wider",
                              rule.passed ? "text-emerald-400" : "text-red-400"
                            )}>
                              {rule.passed ? 'PASSED' : 'FLAGGED'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-white/5">
                    <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-4">Operations History Log</h4>
                    <div className="space-y-4">
                      {invoiceData.auditLogs?.map((log: any) => (
                        <div key={log.id} className="p-4 bg-white/1 border border-white/5 rounded-2xl flex justify-between items-center text-xs">
                          <div>
                            <p className="font-extrabold text-foreground">{log.action}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{log.details}</p>
                          </div>
                          <div className="text-right">
                             <span className="font-bold text-muted-foreground block text-[10px]">{log.user}</span>
                             <span className="text-[9px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'comments' && (
                <motion.div 
                  key="comments"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="h-full flex flex-col justify-between"
                >
                  <div className="space-y-6 flex-1 min-h-[300px]">
                     <h3 className="text-lg font-extrabold text-foreground mb-4">Internal Discussion Feed</h3>
                     
                     <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 scrollbar">
                       {comments.map((comment) => (
                         <div key={comment._id} className="p-4 bg-white/2 border border-white/5 rounded-2xl relative group">
                           <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-2">
                               <span className="font-black text-sm text-foreground">{comment.userId?.name}</span>
                               <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400 px-2 py-0.5 bg-indigo-500/10 rounded">
                                 {comment.userId?.role}
                               </span>
                             </div>
                             <span className="text-[9px] text-slate-500">
                               {new Date(comment.createdAt).toLocaleDateString()}
                             </span>
                           </div>
                           <p className="text-xs text-muted-foreground font-medium leading-relaxed">{comment.text}</p>
                           
                           {/* Allow delete if user matches or admin */}
                           {(user?.role === 'ADMIN' || user?.id === comment.userId?._id) && (
                             <button 
                               onClick={() => handleDeleteComment(comment._id)}
                               className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-red-500/5 text-red-400 hover:bg-red-500/10 border border-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                               title="Delete Comment"
                             >
                               <Trash2 size={12} />
                             </button>
                           )}
                         </div>
                       ))}

                       {comments.length === 0 && (
                         <div className="py-12 text-center text-muted-foreground">
                           <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-4" />
                           <p className="text-sm font-bold">No internal comments logged</p>
                           <p className="text-xs font-semibold mt-1">Start a discussion between the accountant and reviewers below.</p>
                         </div>
                       )}
                     </div>
                  </div>

                  {/* Comment Input Field */}
                  <form onSubmit={handleAddComment} className="pt-6 border-t border-white/5 mt-6">
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Write dynamic feedback notes..." 
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        className="w-full px-5 py-4 bg-white/3 border border-white/5 rounded-2xl outline-none focus:border-primary/40 transition-all text-sm font-semibold pr-14 text-foreground"
                        required
                        disabled={submittingComment}
                      />
                      <button 
                        type="submit"
                        disabled={submittingComment || !newCommentText.trim()}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 bg-primary text-white rounded-xl shadow-purple hover:scale-105 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
                      >
                        <Send size={15} />
                      </button>
                    </div>
                  </form>
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
interface DataFieldProps {
  label: string;
  value: any;
  isEditing?: boolean;
  isReadOnly?: boolean;
  mono?: boolean;
  onChange?: (val: string) => void;
  confidence?: number;
}

function DataField({ label, value, isEditing, isReadOnly, mono, onChange, confidence }: DataFieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</label>
        {confidence !== undefined && (
          <span className={cn(
            "text-[9px] font-bold px-2 py-0.5 rounded",
            confidence >= 0.9 ? "bg-emerald-500/10 text-emerald-400" :
            confidence >= 0.7 ? "bg-amber-500/10 text-amber-400" :
            "bg-red-500/10 text-red-400"
          )}>
            AI Accuracy: {Math.round(confidence * 100)}%
          </span>
        )}
      </div>
      {isEditing && !isReadOnly ? (
        <input 
          type="text" 
          value={value || ''} 
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full px-4 py-3 bg-white/3 border border-white/5 rounded-xl outline-none focus:border-primary/40 transition-all text-sm font-bold text-foreground"
        />
      ) : (
        <div className={cn(
          "px-4 py-3 bg-white/2 rounded-xl text-sm font-bold text-foreground border border-transparent",
          mono && "font-mono tracking-wider text-indigo-300"
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
      <span className="text-sm font-bold text-foreground font-mono">{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DT</span>
    </div>
  );
}
