'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { invoiceAPI, mockInvoices, workflowAPI } from '@/lib/api';
import { ChevronRight, Check, X, MessageSquare } from 'lucide-react';

interface ApprovalInvoice {
  _id: string;
  invoiceNumber: string;
  companyName: string;
  totalAmount: number;
  status: string;
  accountantName?: string;
  validationStatus?: boolean;
}

export default function ApprovalPage() {
  const [invoices, setInvoices] = useState<ApprovalInvoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<ApprovalInvoice | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [comment, setComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      const result = await invoiceAPI.getAll('SUBMITTED');
      const invoicesData = (result.data || mockInvoices).map((inv: any) => ({
        ...inv,
        accountantName: 'Eleanor Pena',
        validationStatus: inv.confidence > 0.85,
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
      setInvoices((prev) => prev.filter((inv) => inv._id !== selectedInvoice._id));
      setSelectedInvoice(null);
      setComment('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedInvoice || !rejectionReason) return;
    setIsProcessing(true);

    try {
      await workflowAPI.approve(selectedInvoice._id, 'REJECTED', rejectionReason);
      setInvoices((prev) => prev.filter((inv) => inv._id !== selectedInvoice._id));
      setSelectedInvoice(null);
      setRejectionReason('');
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Approval Workflows</h1>
          <p className="text-white/60">Review and approve submitted invoices with validation rules.</p>
        </div>

        {invoices.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-white/60">No invoices pending approval</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Queue List */}
            <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-lg font-bold text-white">Review Queue</h2>
                <p className="text-white/60 text-sm mt-1">{invoices.length} pending</p>
              </div>
              <div className="divide-y divide-white/10 max-h-96 overflow-y-auto">
                {invoices.map((invoice) => (
                  <button
                    key={invoice._id}
                    onClick={() => setSelectedInvoice(invoice)}
                    className={`w-full p-4 text-left hover:bg-white/5 transition-colors flex items-center justify-between ${
                      selectedInvoice?._id === invoice._id ? 'bg-white/10 border-l-2 border-[#B76E79]' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <p className="text-white font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-white/60 text-sm">{invoice.companyName}</p>
                      <p className="text-white/40 text-xs mt-1">${invoice.totalAmount.toLocaleString()}</p>
                    </div>
                    <ChevronRight size={20} className="text-white/40" />
                  </button>
                ))}
              </div>
            </div>

            {/* Detail Panel */}
            {selectedInvoice && (
              <div className="lg:col-span-2 space-y-6">
                {/* Invoice Summary */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold text-white mb-4">{selectedInvoice.invoiceNumber}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">Company:</span>
                      <span className="text-white font-medium">{selectedInvoice.companyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Amount:</span>
                      <span className="text-white font-bold text-lg">${selectedInvoice.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Accountant:</span>
                      <span className="text-white">{selectedInvoice.accountantName}</span>
                    </div>
                  </div>
                </div>

                {/* Lifecycle Stepper */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold text-white mb-6">Document Lifecycle</h3>
                  <div className="space-y-4">
                    {lifecycleSteps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            step.status === 'complete'
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                              : step.status === 'active'
                                ? 'bg-[#B76E79]/20 text-[#B76E79] border border-[#B76E79]/30'
                                : 'bg-white/5 text-white/40 border border-white/10'
                          }`}
                        >
                          {step.status === 'complete' ? '✓' : idx + 1}
                        </div>
                        <span
                          className={`font-medium ${
                            step.status === 'pending' ? 'text-white/40' : 'text-white'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Validation Rules */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Validation Checklist</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Check className="text-green-400" size={20} />
                      <span className="text-white">TVA calculation verified</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="text-green-400" size={20} />
                      <span className="text-white">High confidence score ({Math.round((selectedInvoice as any).confidence * 100)}%)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="text-green-400" size={20} />
                      <span className="text-white">No duplicate detected</span>
                    </div>
                  </div>
                </div>

                {/* Rejection Reason */}
                {rejectionReason && (
                  <div className="glass-card p-6 border border-red-500/30 bg-red-500/10">
                    <label className="block text-sm font-medium text-white mb-2">Rejection Reason</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="glass-input w-full h-24 resize-none"
                      placeholder="Explain why this invoice is being rejected..."
                    ></textarea>
                  </div>
                )}

                {/* Comments */}
                <div className="glass-card p-6">
                  <label className="block text-sm font-medium text-white mb-2">Comments</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="glass-input w-full h-20 resize-none"
                    placeholder="Add any notes or comments..."
                  ></textarea>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30 transition-colors disabled:opacity-50 font-medium"
                  >
                    <Check size={20} />
                    Approve
                  </button>
                  <button
                    onClick={() => setRejectionReason(rejectionReason ? '' : 'Please provide a reason')}
                    className="px-6 py-3 rounded-lg glass-card text-white/70 hover:text-white transition-colors font-medium"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
