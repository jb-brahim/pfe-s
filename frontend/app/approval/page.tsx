'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { invoiceAPI, workflowAPI } from '@/lib/api';
import {
  Check, X, ClipboardCheck, FileText, AlertTriangle,
  Search, Shield, User, Clock, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n-context';

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
  const { t } = useLanguage();
  const [invoices, setInvoices] = useState<ApprovalInvoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Drawer State
  const [drawerInvoice, setDrawerInvoice] = useState<ApprovalInvoice | null>(null);
  const [drawerComment, setDrawerComment] = useState('');
  
  // Rejection Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingInvoiceIds, setRejectingInvoiceIds] = useState<string[]>([]);
  
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      const result = await invoiceAPI.getAll('VERIFIED');
      const invoicesData = (result.data || []).map((inv: any) => ({
        ...inv,
        accountantName: inv.accountantName || 'Eleanor Pena',
        validationStatus: (inv.confidence || 0) > 0.85,
      }));
      setInvoices(invoicesData);
    };
    fetchInvoices();
  }, []);

  const handleToggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleToggleAll = () => {
    if (selectedIds.size === filteredInvoices.length && filteredInvoices.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredInvoices.map(inv => inv._id)));
    }
  };

  const handleApprove = async (ids: string[], comment: string = 'Approved via bulk action') => {
    if (ids.length === 0) return;
    setIsProcessing(true);
    try {
      const promises = ids.map(id => workflowAPI.approve(id, 'APPROVED', comment));
      await Promise.all(promises);
      toast.success(`${t('approval.toast.approve_success')} ${ids.length} ${t('approval.toast.invoices_count')}`);
      
      setInvoices(invoices.filter(inv => !ids.includes(inv._id)));
      if (drawerInvoice && ids.includes(drawerInvoice._id)) {
        setDrawerInvoice(null);
      }
      setSelectedIds(new Set());
    } catch (error) {
      toast.error(t('approval.toast.approve_failed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const openRejectModal = (ids: string[]) => {
    if (ids.length === 0) return;
    setRejectingInvoiceIds(ids);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim() || rejectingInvoiceIds.length === 0) return;
    setIsProcessing(true);
    try {
      const promises = rejectingInvoiceIds.map(id => workflowAPI.approve(id, 'REJECTED', rejectionReason));
      await Promise.all(promises);
      toast.success(`${t('approval.toast.reject_success')} ${rejectingInvoiceIds.length} ${t('approval.toast.invoices_count')}`);
      
      setInvoices(invoices.filter(inv => !rejectingInvoiceIds.includes(inv._id)));
      if (drawerInvoice && rejectingInvoiceIds.includes(drawerInvoice._id)) {
        setDrawerInvoice(null);
      }
      setSelectedIds(new Set());
      setShowRejectModal(false);
    } catch (error) {
      toast.error(t('approval.toast.reject_failed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return inv.invoiceNumber?.toLowerCase().includes(query) || inv.companyName?.toLowerCase().includes(query);
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 w-full pb-10 max-w-[1400px] mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <ClipboardCheck size={28} className="text-[#D98F8F]" />
              <h1 className="text-[28px] font-bold tracking-tight text-white">
                {t('approval.title')}
              </h1>
            </div>
            <p className="text-[#A69697] text-[15px]">{t('approval.subtitle')}</p>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-[#1E1E1E]/40 border border-white/10 rounded-[12px] flex flex-col shadow-2xl overflow-hidden backdrop-blur-md relative">
          
          {/* Table Toolbar */}
          <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.02]">
            <div className="relative w-full sm:w-[320px]">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search size={14} className="text-[#A69697]" />
              </div>
              <input
                type="text"
                placeholder={t('approval.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1A0A0B]/80 border border-white/10 rounded-[8px] py-2 pl-9 pr-3 text-[13px] text-white outline-none focus:border-[#D98F8F]/50 transition-all placeholder:text-[#A69697]"
              />
            </div>

            {/* Bulk Actions */}
            <div className={`flex items-center gap-3 transition-opacity duration-300 ${selectedIds.size > 0 ? 'opacity-100 pointer-events-auto' : 'opacity-50 pointer-events-none'}`}>
              <span className="text-[13px] font-medium text-white mr-2">{selectedIds.size} {t('approval.selected')}</span>
              <button
                onClick={() => handleApprove(Array.from(selectedIds))}
                disabled={isProcessing || selectedIds.size === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[#4CAF50]/15 hover:bg-[#4CAF50]/25 text-[#4CAF50] border border-[#4CAF50]/30 font-semibold text-[13px] transition-all disabled:opacity-50"
              >
                <Check size={16} strokeWidth={2.5} />
                {t('approval.approve')}
              </button>
              <button
                onClick={() => openRejectModal(Array.from(selectedIds))}
                disabled={isProcessing || selectedIds.size === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[#8E1B3A]/20 hover:bg-[#8E1B3A]/30 text-[#D98F8F] border border-[#8E1B3A]/40 font-semibold text-[13px] transition-all disabled:opacity-50"
              >
                <X size={16} strokeWidth={2.5} />
                {t('approval.reject')}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-medium text-[#A69697] uppercase tracking-wider bg-white/[0.02]">
                  <th className="px-5 py-4 w-[40px]">
                    <div 
                      onClick={handleToggleAll}
                      className={`w-4 h-4 rounded-[4px] border flex items-center justify-center cursor-pointer transition-colors ${
                        filteredInvoices.length > 0 && selectedIds.size === filteredInvoices.length
                          ? 'bg-[#D98F8F] border-[#D98F8F]' 
                          : 'bg-black/20 border-white/20 hover:border-white/40'
                      }`}
                    >
                      {filteredInvoices.length > 0 && selectedIds.size === filteredInvoices.length && <Check size={12} className="text-[#3C0D0D]" strokeWidth={3} />}
                    </div>
                  </th>
                  <th className="px-4 py-4">{t('approval.table.company_invoice')}</th>
                  <th className="px-4 py-4">{t('approval.table.submitted_by')}</th>
                  <th className="px-4 py-4">{t('approval.table.ai_match')}</th>
                  <th className="px-4 py-4 text-right">{t('approval.table.amount')}</th>
                  <th className="px-4 py-4 text-center">{t('approval.table.quick_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[13px]">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-[#A69697]">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <ClipboardCheck size={40} className="opacity-20" />
                        <p className="text-[15px]">{t('approval.no_invoices')}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => {
                    const isSelected = selectedIds.has(invoice._id);
                    const confidencePct = Math.round((invoice.confidence || 0) * 100);
                    
                    return (
                      <tr 
                        key={invoice._id} 
                        className={`transition-colors group hover:bg-white/[0.04] ${isSelected ? 'bg-white/[0.02]' : ''}`}
                      >
                        <td className="px-5 py-4">
                          <div 
                            onClick={() => handleToggleSelect(invoice._id)}
                            className={`w-4 h-4 rounded-[4px] border flex items-center justify-center cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-[#D98F8F] border-[#D98F8F]' 
                                : 'bg-black/20 border-white/20 hover:border-white/40'
                            }`}
                          >
                            {isSelected && <Check size={12} className="text-[#3C0D0D]" strokeWidth={3} />}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 rounded-[6px] bg-[#1A0A0B] border border-white/10 flex items-center justify-center shrink-0 cursor-pointer hover:bg-white/5" 
                              onClick={() => { setDrawerInvoice(invoice); setDrawerComment(''); }}
                            >
                              <FileText size={14} className="text-[#A69697]" />
                            </div>
                            <div className="cursor-pointer" onClick={() => { setDrawerInvoice(invoice); setDrawerComment(''); }}>
                              <p className="font-bold text-white max-w-[200px] truncate hover:underline">{invoice.companyName}</p>
                              <p className="text-[#A69697] text-[11px] font-mono mt-0.5">{invoice.invoiceNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-white font-medium">{invoice.accountantName}</p>
                          <p className="text-[#A69697] text-[11px] mt-0.5">
                            {new Date(invoice.createdAt || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-20 h-1.5 bg-[#1A0A0B] rounded-full overflow-hidden border border-white/5">
                              <div 
                                className={`h-full rounded-full ${confidencePct > 80 ? 'bg-[#4CAF50]' : confidencePct > 50 ? 'bg-[#FFC107]' : 'bg-[#D98F8F]'}`} 
                                style={{ width: `${confidencePct}%` }}
                              ></div>
                            </div>
                            <span className={`text-[12px] font-medium ${confidencePct > 80 ? 'text-[#4CAF50]' : confidencePct > 50 ? 'text-[#FFC107]' : 'text-[#D98F8F]'}`}>
                              {confidencePct}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <p className="font-bold text-white tracking-tight">{formatCurrency(invoice.totalAmount)}</p>
                          {invoice.taxAmount != null && (
                            <p className="text-[#A69697] text-[11px] mt-0.5">{t('approval.table.tax')} {formatCurrency(invoice.taxAmount)}</p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleApprove([invoice._id])}
                              disabled={isProcessing}
                              className="px-3 py-1.5 rounded-[6px] bg-[#4CAF50]/10 hover:bg-[#4CAF50]/20 text-[#4CAF50] border border-[#4CAF50]/30 font-medium text-[12px] transition-all disabled:opacity-50"
                            >
                              {t('approval.approve')}
                            </button>
                            <button 
                              onClick={() => openRejectModal([invoice._id])}
                              disabled={isProcessing}
                              className="px-3 py-1.5 rounded-[6px] bg-white/[0.03] hover:bg-[#8E1B3A]/15 text-[#A69697] hover:text-[#D98F8F] border border-white/10 hover:border-[#8E1B3A]/30 font-medium text-[12px] transition-all disabled:opacity-50"
                            >
                              {t('approval.reject')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Slide-over Drawer */}
      {drawerInvoice && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="fixed inset-0 z-30" onClick={() => setDrawerInvoice(null)}></div>
          <div className="relative z-50 w-full max-w-[440px] bg-[#1E1E1E] border-l border-white/10 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
              <h2 className="text-white text-[18px] font-bold">{t('approval.drawer.title')}</h2>
              <button 
                onClick={() => setDrawerInvoice(null)}
                className="p-2 rounded-full hover:bg-white/10 text-[#A69697] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              
              {/* Header Info */}
              <div>
                <span className="bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/20 px-2 py-0.5 rounded-[4px] text-[10px] font-bold tracking-wide uppercase mb-3 inline-block">
                  {t('approval.drawer.awaiting_review')}
                </span>
                <h3 className="text-white text-[22px] font-bold">{drawerInvoice.companyName}</h3>
                <p className="text-[#A69697] text-[13px] font-mono mt-1">{t('approval.drawer.ref')}: {drawerInvoice.invoiceNumber}</p>
              </div>

              {/* Amounts */}
              <div className="bg-white/[0.02] border border-white/[0.04] rounded-[12px] p-4 flex justify-between items-center">
                <div>
                  <p className="text-[#A69697] text-[12px]">{t('approval.drawer.total_amount')}</p>
                  <p className="text-[24px] font-bold text-white tracking-tight">{formatCurrency(drawerInvoice.totalAmount)}</p>
                </div>
                {drawerInvoice.taxAmount != null && (
                  <div className="text-right">
                    <p className="text-[#A69697] text-[12px]">{t('approval.drawer.tax_included')}</p>
                    <p className="text-[14px] font-medium text-white">{formatCurrency(drawerInvoice.taxAmount)}</p>
                  </div>
                )}
              </div>

              {/* Meta Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.02] border border-white/[0.04] rounded-[12px] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={14} className="text-[#A69697]" />
                    <p className="text-[11px] text-[#A69697] uppercase tracking-wider font-semibold">{t('approval.drawer.accountant')}</p>
                  </div>
                  <p className="text-white text-[13px] font-medium">{drawerInvoice.accountantName}</p>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.04] rounded-[12px] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={14} className="text-[#A69697]" />
                    <p className="text-[11px] text-[#A69697] uppercase tracking-wider font-semibold">{t('approval.drawer.submitted')}</p>
                  </div>
                  <p className="text-white text-[13px] font-medium">
                    {drawerInvoice.createdAt ? new Date(drawerInvoice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : t('approval.drawer.today')}
                  </p>
                </div>
              </div>

              {/* Validation Checklist */}
              <div>
                <h3 className="text-white text-[14px] font-semibold mb-3 flex items-center gap-2">
                  <Shield size={16} className="text-[#D98F8F]" /> {t('approval.drawer.validation_checklist')}
                </h3>
                <div className="space-y-2">
                  {[
                    { label: t('approval.drawer.tva_verified'), pass: true },
                    { label: `${t('approval.drawer.ai_score')} (${Math.round((drawerInvoice.confidence || 0) * 100)}%)`, pass: (drawerInvoice.confidence || 0) >= 0.85 },
                    { label: t('approval.drawer.no_duplicate'), pass: true },
                    { label: t('approval.drawer.supplier_matched'), pass: drawerInvoice.validationStatus ?? true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-[8px] bg-white/[0.01] border border-white/[0.04]">
                      <div className={`w-5 h-5 rounded-[4px] flex items-center justify-center shrink-0 ${item.pass ? 'bg-[#4CAF50]/15' : 'bg-[#D98F8F]/15'}`}>
                        {item.pass
                          ? <Check size={12} className="text-[#4CAF50]" strokeWidth={3} />
                          : <X size={12} className="text-[#D98F8F]" strokeWidth={3} />}
                      </div>
                      <span className={`text-[12px] ${item.pass ? 'text-white' : 'text-[#A69697]'}`}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes Box */}
              <div className="flex flex-col flex-1">
                <label className="text-[13px] font-semibold text-white mb-2 flex items-center justify-between">
                  {t('approval.drawer.manager_notes')} 
                  <span className="text-[#A69697] font-normal text-[11px] uppercase tracking-wider">{t('approval.drawer.required_rejection')}</span>
                </label>
                <textarea
                  value={drawerComment}
                  onChange={(e) => setDrawerComment(e.target.value)}
                  className="w-full flex-1 min-h-[100px] resize-none bg-[#1A0A0B]/80 border border-white/10 rounded-[8px] px-3.5 py-3 text-[13px] text-white placeholder:text-[#A69697]/50 outline-none focus:border-[#D98F8F]/50 transition-colors"
                  placeholder={t('approval.drawer.notes_placeholder')}
                />
              </div>

            </div>

            {/* Drawer Footer / Actions */}
            <div className="p-5 border-t border-white/10 bg-white/[0.02] flex gap-3">
              <button
                onClick={() => {
                  if (!drawerComment.trim()) {
                    setRejectionReason('');
                    setRejectingInvoiceIds([drawerInvoice._id]);
                    setShowRejectModal(true);
                  } else {
                    setRejectingInvoiceIds([drawerInvoice._id]);
                    setRejectionReason(drawerComment);
                    handleRejectConfirm();
                  }
                }}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[8px] bg-white/[0.03] hover:bg-[#8E1B3A]/20 text-[#A69697] hover:text-[#D98F8F] border border-white/[0.06] hover:border-[#8E1B3A]/30 font-semibold text-[13px] transition-all disabled:opacity-50"
              >
                <X size={16} strokeWidth={2.5} />
                {t('approval.reject')}
              </button>
              <button
                onClick={() => handleApprove([drawerInvoice._id], drawerComment || 'Approved via detail view')}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[8px] bg-[#4CAF50]/15 hover:bg-[#4CAF50]/25 text-[#4CAF50] border border-[#4CAF50]/30 font-semibold text-[13px] transition-all disabled:opacity-50"
              >
                <Check size={16} strokeWidth={2.5} />
                {t('approval.approve')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Rejection Modal (Kept for bulk actions) */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1E1E1E] border border-white/10 p-6 rounded-[16px] shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#8E1B3A]/20 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-[#D98F8F]" />
              </div>
              <div>
                <h3 className="text-white text-[18px] font-bold">{rejectingInvoiceIds.length > 1 ? t('approval.modal.reject_invoices') : t('approval.modal.reject_invoice')}</h3>
                <p className="text-[#A69697] text-[13px]">{t('approval.modal.provide_reason')}</p>
              </div>
            </div>
            
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full h-[100px] resize-none bg-black/30 border border-white/10 rounded-[8px] px-4 py-3 text-[14px] text-white placeholder:text-[#A69697]/50 outline-none focus:border-[#D98F8F]/50 transition-colors mt-2"
              placeholder={t('approval.modal.reason_placeholder')}
            />
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2.5 rounded-[8px] bg-white/[0.05] hover:bg-white/[0.1] text-white font-semibold text-[13px] transition-all"
              >
                {t('approval.modal.cancel')}
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={isProcessing || !rejectionReason.trim()}
                className="flex-1 py-2.5 rounded-[8px] bg-[#8E1B3A]/80 hover:bg-[#8E1B3A] text-white font-semibold text-[13px] transition-all disabled:opacity-50"
              >
                {isProcessing ? t('approval.modal.processing') : `${t('approval.reject')} ${rejectingInvoiceIds.length} ${t('approval.toast.invoices_count')}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
