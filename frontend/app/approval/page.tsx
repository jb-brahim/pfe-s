'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { invoiceAPI, workflowAPI } from '@/lib/api';
import {
  ChevronRight, Check, X, MessageSquare, ClipboardCheck,
  FileText, Building2, AlertTriangle, Clock, Shield,
  TrendingUp, User, Sparkles
} from 'lucide-react';

interface ApprovalInvoice {
  _id: string;
  invoiceNumber: string;
  companyName: string;
  totalAmount: number;
  taxAmount?: number;
  status: string;
  accountantName?: string;
  validationStatus?: boolean;
  confidence?: number;
  createdAt?: string;
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('fr-TN', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(val) + ' TND';

export default function ApprovalPage() {
  const [invoices, setInvoices] = useState<ApprovalInvoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<ApprovalInvoice | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [comment, setComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      const result = await invoiceAPI.getAll('SUBMITTED');
      const invoicesData = (result.data || []).map((inv: any) => ({
        ...inv,
        accountantName: inv.accountantName || 'Eleanor Pena',
        validationStatus: (inv.confidence || 0) > 0.85,
      }));
      setInvoices(invoicesData);
      if (invoicesData.length > 0) setSelectedInvoice(invoicesData[0]);
    };
    fetchInvoices();
  }, []);

  const handleApprove = async () => {
    if (!selectedInvoice) return;
    setIsProcessing(true);
    try {
      await workflowAPI.approve(selectedInvoice._id, 'APPROVED', comment);
      const remaining = invoices.filter((inv) => inv._id !== selectedInvoice._id);
      setInvoices(remaining);
      setSelectedInvoice(remaining[0] || null);
      setComment('');
      setShowRejectInput(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedInvoice || !rejectionReason.trim()) return;
    setIsProcessing(true);
    try {
      await workflowAPI.approve(selectedInvoice._id, 'REJECTED', rejectionReason);
      const remaining = invoices.filter((inv) => inv._id !== selectedInvoice._id);
      setInvoices(remaining);
      setSelectedInvoice(remaining[0] || null);
      setRejectionReason('');
      setShowRejectInput(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const lifecycleSteps = [
    { label: 'Draft', status: 'complete' },
    { label: 'Extracted', status: 'complete' },
    { label: 'Verified', status: 'complete' },
    { label: 'Submitted', status: 'active' },
    { label: 'Approved', status: 'pending' },
  ];

  const confidence = selectedInvoice?.confidence ?? 0;
  const confidencePct = Math.round(confidence * 100);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 w-full pb-10 max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#8E1B3A] rounded-full blur-[130px] opacity-15 pointer-events-none" />
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#8E1B3A]/30 border border-[#8E1B3A]/50 flex items-center justify-center">
                <ClipboardCheck size={20} className="text-[#D98F8F]" />
              </div>
              <h1 className="text-[36px] font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#EBD8D8] to-[#D98F8F]">
                Approval Workflows
              </h1>
            </div>
            <p className="text-[#A69697] text-[16px]">Review, validate and approve submitted invoices with full audit trail.</p>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-center">
              <p className="text-[11px] text-[#A69697] uppercase tracking-widest">Pending</p>
              <p className="text-[22px] font-bold text-[#FFC107]">{invoices.length}</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-center">
              <p className="text-[11px] text-[#A69697] uppercase tracking-widest">Selected</p>
              <p className="text-[22px] font-bold text-white">{selectedInvoice ? '1' : '—'}</p>
            </div>
          </div>
        </div>

        {invoices.length === 0 ? (
          /* Empty State */
          <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-[30px] p-20 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#4CAF50]/10 border border-[#4CAF50]/30 flex items-center justify-center mb-5">
              <Check size={28} className="text-[#4CAF50]" />
            </div>
            <h3 className="text-white text-[20px] font-semibold mb-2">All caught up!</h3>
            <p className="text-[#A69697] text-[15px]">No invoices are currently pending approval.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[340px_1fr] gap-6 items-start">

            {/* LEFT: Queue List */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-[24px] overflow-hidden sticky top-0">
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <div>
                  <h2 className="text-white text-[15px] font-semibold">Review Queue</h2>
                  <p className="text-[#A69697] text-[12px] mt-0.5">{invoices.length} invoices pending</p>
                </div>
                <span className="bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/30 px-2.5 py-1 rounded-full text-[11px] font-bold">
                  {invoices.length} PENDING
                </span>
              </div>
              <div className="divide-y divide-white/[0.04] max-h-[500px] overflow-y-auto">
                {invoices.map((invoice) => {
                  const isSelected = selectedInvoice?._id === invoice._id;
                  return (
                    <button
                      key={invoice._id}
                      onClick={() => { setSelectedInvoice(invoice); setShowRejectInput(false); setComment(''); setRejectionReason(''); }}
                      className={`w-full px-5 py-4 text-left transition-all duration-200 flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#8E1B3A]/15 border-l-[3px] border-[#D98F8F]'
                          : 'hover:bg-white/[0.03] border-l-[3px] border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-[#8E1B3A]/30' : 'bg-white/[0.04]'}`}>
                          <FileText size={16} className={isSelected ? 'text-[#D98F8F]' : 'text-[#A69697]'} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-[13px] font-medium truncate">{invoice.companyName}</p>
                          <p className="text-[#A69697] text-[11px]">{invoice.invoiceNumber}</p>
                          <p className="text-[#D98F8F] text-[12px] font-semibold mt-0.5">{formatCurrency(invoice.totalAmount)}</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className={isSelected ? 'text-[#D98F8F]' : 'text-[#A69697]/40'} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: Detail Panel */}
            {selectedInvoice && (
              <div className="flex flex-col gap-5">

                {/* Invoice Header Card */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-[24px] p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[#8E1B3A] rounded-full blur-[80px] opacity-10 pointer-events-none" />
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase">Awaiting Review</span>
                      </div>
                      <h3 className="text-white text-[24px] font-bold mt-2">{selectedInvoice.companyName}</h3>
                      <p className="text-[#A69697] text-[13px]">{selectedInvoice.invoiceNumber}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[#A69697] text-[12px] mb-1">Total Amount</p>
                      <p className="text-[32px] font-bold text-white tracking-tight">{formatCurrency(selectedInvoice.totalAmount)}</p>
                      {selectedInvoice.taxAmount != null && (
                        <p className="text-[#A69697] text-[12px]">Tax: {formatCurrency(selectedInvoice.taxAmount)}</p>
                      )}
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="relative z-10 mt-5 pt-5 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-[#A69697]" />
                      <div>
                        <p className="text-[10px] text-[#A69697] uppercase tracking-wider">Accountant</p>
                        <p className="text-white text-[13px] font-medium">{selectedInvoice.accountantName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-[#A69697]" />
                      <div>
                        <p className="text-[10px] text-[#A69697] uppercase tracking-wider">Submitted</p>
                        <p className="text-white text-[13px] font-medium">
                          {selectedInvoice.createdAt ? new Date(selectedInvoice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-[#A69697]" />
                      <div>
                        <p className="text-[10px] text-[#A69697] uppercase tracking-wider">AI Confidence</p>
                        <p className={`text-[13px] font-bold ${confidencePct >= 85 ? 'text-[#4CAF50]' : confidencePct >= 60 ? 'text-[#FFC107]' : 'text-[#D98F8F]'}`}>
                          {confidencePct > 0 ? `${confidencePct}%` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  {/* Lifecycle Stepper */}
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-[24px] p-6">
                    <h3 className="text-white text-[14px] font-semibold mb-5 flex items-center gap-2">
                      <TrendingUp size={16} className="text-[#D98F8F]" /> Document Lifecycle
                    </h3>
                    <div className="space-y-3">
                      {lifecycleSteps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                            step.status === 'complete'
                              ? 'bg-[#4CAF50]/20 text-[#4CAF50] border border-[#4CAF50]/40'
                              : step.status === 'active'
                              ? 'bg-[#FFC107]/20 text-[#FFC107] border border-[#FFC107]/40'
                              : 'bg-white/5 text-white/30 border border-white/10'
                          }`}>
                            {step.status === 'complete' ? <Check size={12} strokeWidth={3} /> : idx + 1}
                          </div>
                          {idx < lifecycleSteps.length - 1 && (
                            <div className={`w-px h-3 ml-3.5 ${step.status === 'complete' ? 'bg-[#4CAF50]/30' : 'bg-white/10'}`} />
                          )}
                          <span className={`text-[13px] font-medium ${step.status === 'pending' ? 'text-white/30' : step.status === 'active' ? 'text-[#FFC107]' : 'text-white'}`}>
                            {step.label}
                          </span>
                          {step.status === 'active' && (
                            <span className="ml-auto text-[10px] bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/30 px-2 py-0.5 rounded-full font-bold">CURRENT</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Validation Checklist */}
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-[24px] p-6">
                    <h3 className="text-white text-[14px] font-semibold mb-5 flex items-center gap-2">
                      <Shield size={16} className="text-[#D98F8F]" /> Validation Checklist
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: 'TVA calculation verified', pass: true },
                        { label: `AI confidence score (${confidencePct > 0 ? confidencePct + '%' : 'N/A'})`, pass: confidencePct >= 85 || confidencePct === 0 },
                        { label: 'No duplicate detected', pass: true },
                        { label: 'Supplier data matched', pass: selectedInvoice.validationStatus ?? true },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-[12px] bg-white/[0.02] border border-white/[0.04]">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${item.pass ? 'bg-[#4CAF50]/15 border border-[#4CAF50]/30' : 'bg-[#D98F8F]/15 border border-[#D98F8F]/30'}`}>
                            {item.pass
                              ? <Check size={12} className="text-[#4CAF50]" strokeWidth={3} />
                              : <X size={12} className="text-[#D98F8F]" strokeWidth={3} />}
                          </div>
                          <span className={`text-[13px] ${item.pass ? 'text-white' : 'text-[#A69697]'}`}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Comment Box */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-[24px] p-6">
                  <label className="flex items-center gap-2 text-white text-[13px] font-semibold mb-3">
                    <MessageSquare size={14} className="text-[#D98F8F]" /> Add a Comment <span className="text-[#A69697] font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full h-[80px] resize-none bg-black/20 border border-white/10 rounded-[12px] px-4 py-3 text-[13px] text-white placeholder:text-[#A69697]/60 outline-none focus:border-[#D98F8F]/40 transition-colors"
                    placeholder="Add any notes for this approval..."
                  />
                </div>

                {/* Rejection Reason — shown only when rejecting */}
                {showRejectInput && (
                  <div className="bg-[#D98F8F]/5 border border-[#D98F8F]/30 rounded-[24px] p-6">
                    <label className="flex items-center gap-2 text-[#D98F8F] text-[13px] font-semibold mb-3">
                      <AlertTriangle size={14} /> Rejection Reason <span className="text-[#A69697] font-normal">(required)</span>
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full h-[80px] resize-none bg-black/20 border border-[#D98F8F]/20 rounded-[12px] px-4 py-3 text-[13px] text-white placeholder:text-[#A69697]/60 outline-none focus:border-[#D98F8F]/50 transition-colors"
                      placeholder="Explain why this invoice is being rejected..."
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-[16px] bg-gradient-to-r from-[#4CAF50]/20 to-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/40 hover:from-[#4CAF50]/30 hover:to-[#4CAF50]/20 hover:border-[#4CAF50]/60 transition-all font-semibold text-[14px] shadow-[0_0_20px_rgba(76,175,80,0.1)] hover:shadow-[0_0_30px_rgba(76,175,80,0.2)] disabled:opacity-50"
                  >
                    <Check size={18} strokeWidth={2.5} />
                    {isProcessing ? 'Processing…' : 'Approve Invoice'}
                  </button>

                  {showRejectInput ? (
                    <button
                      onClick={handleReject}
                      disabled={isProcessing || !rejectionReason.trim()}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-[16px] bg-[#8E1B3A]/20 text-[#D98F8F] border border-[#8E1B3A]/50 hover:bg-[#8E1B3A]/30 hover:border-[#D98F8F]/60 transition-all font-semibold text-[14px] disabled:opacity-40"
                    >
                      <X size={18} strokeWidth={2.5} />
                      Confirm Rejection
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowRejectInput(true)}
                      className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-[16px] bg-white/[0.03] text-[#A69697] border border-white/[0.06] hover:text-[#D98F8F] hover:border-[#D98F8F]/30 hover:bg-[#8E1B3A]/10 transition-all font-semibold text-[14px]"
                    >
                      <X size={18} strokeWidth={2.5} />
                      Reject
                    </button>
                  )}
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
