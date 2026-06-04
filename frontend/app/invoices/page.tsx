'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { invoiceAPI } from '@/lib/api';
import { Upload, Loader, Eye, Edit, Trash2, Search, FileText, Zap, Sparkles, CheckCircle2, ChevronRight, AlertTriangle, Download, FileDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n-context';
import { exportInvoicesPDF } from '@/lib/exportPDF';

type InvoiceStatus = 'ALL' | 'DRAFT' | 'EXTRACTED' | 'VERIFIED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'FAILED';

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
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const statuses: InvoiceStatus[] = ['ALL', 'SUBMITTED', 'APPROVED', 'REJECTED', 'FAILED'];

  useEffect(() => {
    const fetchInvoices = async () => {
      const status = selectedStatus === 'ALL' ? undefined : selectedStatus;
      const result = await invoiceAPI.getAll(status, searchQuery);
      setInvoices(result.data || []);
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
            extractedData: newInvoice.extractedData || {},
            userId: newInvoice.userId || { name: 'You' }
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
            extractedData: {},
            userId: { name: 'You' }
          }, ...prev]);
        }
      } catch (error: any) {
        console.error('Upload failed:', error);
        if (error.response?.status === 409) {
          toast.error(`${t('invoices.duplicate_invoice')}: ${file.name} ${t('invoices.has_been_uploaded')}`);
        } else if (error.response?.status === 403 && error.response?.data?.message === 'LIMIT_REACHED') {
          setShowLimitModal(true);
        } else {
          toast.error(`${t('invoices.upload_failed')} ${file.name}`);
        }
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

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(t('invoices.delete_confirm'))) return;
    try {
      await invoiceAPI.delete(id);
      setInvoices(invoices.filter(inv => inv._id !== id));
      toast.success(t('invoices.delete_success'));
    } catch (error) {
      toast.error(t('invoices.delete_failed'));
    }
  };

  const handleExportCSV = () => {
    if (invoices.length === 0) return toast.error(t('invoices.export_empty'));
    
    // Professional header structure for accounting/detailed view
    const headers = [
      'Invoice Number',
      'Vendor / Company',
      'Status',
      'Date Added',
      'Total H.T. (TND)',
      'TVA (TND)',
      'Total T.T.C. (TND)',
      'AI Confidence',
      'Product / Service Description',
      'Quantity',
      'Unit Price (TND)',
      'Total Price (TND)'
    ];

    const escapeCSV = (value: any) => {
      if (value === null || value === undefined) return '""';
      const str = String(value);
      return `"${str.replace(/"/g, '""')}"`; // Escape quotes to prevent CSV breakage
    };

    const rows: string[] = [];
    rows.push(headers.join(','));

    invoices.forEach(inv => {
      const invNum = inv.invoiceNumber || 'N/A';
      const company = inv.companyName || 'N/A';
      const status = inv.status;
      const date = new Date(inv.createdAt).toLocaleDateString();
      const totalHT = inv.extractedData?.totalHT || 0;
      const tvaAmount = inv.taxAmount || 0;
      const totalAmount = inv.totalAmount || 0;
      const confidence = inv.confidence || 0;

      const lineItems = inv.extractedData?.lineItems || [];

      if (lineItems.length === 0) {
        // Invoice without extracted products
        rows.push([
          escapeCSV(invNum),
          escapeCSV(company),
          escapeCSV(status),
          escapeCSV(date),
          escapeCSV(totalHT),
          escapeCSV(tvaAmount),
          escapeCSV(totalAmount),
          escapeCSV(Math.round(confidence * 100) + '%'),
          escapeCSV('No line items extracted'),
          escapeCSV(''),
          escapeCSV(''),
          escapeCSV('')
        ].join(','));
      } else {
        // Create one row per product (Standard accounting format)
        // To keep it clean, only show the Invoice details on the first row of each invoice
        lineItems.forEach((item: any, index: number) => {
          rows.push([
            escapeCSV(index === 0 ? invNum : ''),
            escapeCSV(index === 0 ? company : ''),
            escapeCSV(index === 0 ? status : ''),
            escapeCSV(index === 0 ? date : ''),
            escapeCSV(index === 0 ? totalHT : ''),
            escapeCSV(index === 0 ? tvaAmount : ''),
            escapeCSV(index === 0 ? totalAmount : ''),
            escapeCSV(index === 0 ? Math.round(confidence * 100) + '%' : ''),
            escapeCSV(item.description || 'N/A'),
            escapeCSV(item.quantity || 1),
            escapeCSV(item.unitPrice || 0),
            escapeCSV(item.totalPrice || 0)
          ].join(','));
        });
      }
    });

    const csvContent = rows.join('\n');
    // Add BOM (\uFEFF) to enforce UTF-8 encoding so Microsoft Excel reads special characters correctly
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Invoices_Detailed_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(t('invoices.export_success'));
  };

  const handleExportPDF = async () => {
    if (invoices.length === 0) return toast.error(t('invoices.export_empty'));
    try {
      await exportInvoicesPDF(filteredInvoices.length > 0 ? filteredInvoices : invoices);
      toast.success('PDF exporté avec succès !');
    } catch (err) {
      console.error(err);
      toast.error('Échec de la génération du PDF. Veuillez réessayer.');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'VERIFIED':
        return { bg: 'bg-[#4CAF50]/10', text: 'text-[#4CAF50]', border: 'border-[#4CAF50]/30', dot: 'bg-[#4CAF50]' };
      case 'SUBMITTED':
      case 'EXTRACTED':
        return { bg: 'bg-[#FFC107]/10', text: 'text-[#FFC107]', border: 'border-[#FFC107]/30', dot: 'bg-[#FFC107]' };
      case 'REJECTED':
        return { bg: 'bg-[#8E1B3A]/30', text: 'text-[#D98F8F]', border: 'border-[#8E1B3A]/50', dot: 'bg-[#D98F8F]' };
      case 'FAILED':
        return { bg: 'bg-[#8E1B3A]', text: 'text-white', border: 'border-[#FF5252]', dot: 'bg-[#FF5252]' };
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
      <div className="w-full pb-10 max-w-[1400px] mx-auto flex flex-col gap-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-white tracking-tight">{t('invoices.title')}</h1>
            <p className="text-[#A69697] text-[14px]">{t('invoices.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-[8px] text-[13px] font-medium transition-colors text-white"
            >
              <Download size={16} /> {t('invoices.export_csv')}
            </button>
            <button 
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-[#8E1B3A]/20 border border-[#8E1B3A]/40 hover:bg-[#8E1B3A]/30 rounded-[8px] text-[13px] font-medium transition-colors text-[#D98F8F]"
            >
              <FileDown size={16} /> Export PDF
            </button>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          
          {/* AI Dropzone Card */}
          <label 
            htmlFor="file-upload" 
            className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-[#1E1E1E]/40 border border-white/10 hover:border-[#D98F8F]/40 hover:bg-[#1E1E1E]/60 rounded-[12px] cursor-pointer transition-all overflow-hidden shadow-lg backdrop-blur-md gap-4"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#D98F8F]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex items-center gap-5 z-10">
              <div className="w-12 h-12 rounded-lg bg-[#8E1B3A]/20 border border-[#8E1B3A]/30 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                {isUploading ? <Loader className="animate-spin text-[#D98F8F]" size={24} /> : <Zap className="text-[#D98F8F]" size={24} />}
              </div>
              <div>
                <h3 className="text-white font-bold text-[16px] mb-1">
                  {isUploading ? `${t('invoices.extracting_data')} (${Math.round(uploadProgress)}%)` : t('invoices.ai_dropzone')}
                </h3>
                <p className="text-[#A69697] text-[13px] hidden xl:block">
                  {isUploading ? t('invoices.dropzone_desc_1') : t('invoices.dropzone_desc_2')}
                </p>
              </div>
            </div>
            
            <div className="z-10 bg-white/5 border border-white/10 px-4 py-2 rounded-md text-[12px] text-white font-medium group-hover:bg-[#8E1B3A] group-hover:border-[#8E1B3A] transition-colors whitespace-nowrap">
              {t('invoices.browse_files')}
            </div>
            
            <input
              id="file-upload"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>

          {/* Add Manually Card */}
          <Link 
            href="/invoices/manual" 
            className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-[#1E1E1E]/40 border border-white/10 hover:border-white/20 hover:bg-[#1E1E1E]/60 rounded-[12px] transition-all overflow-hidden shadow-lg backdrop-blur-md gap-4"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex items-center gap-5 z-10">
              <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <Edit className="text-[#A69697] group-hover:text-white transition-colors" size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold text-[16px] mb-1">{t('invoices.add_manually')}</h3>
                <p className="text-[#A69697] text-[13px] hidden xl:block">{t('invoices.add_manually_desc')}</p>
              </div>
            </div>
            
            <div className="z-10 flex items-center gap-2 text-[#A69697] group-hover:text-white transition-colors">
              <span className="text-[13px] font-medium whitespace-nowrap">{t('invoices.create_new')}</span>
              <ChevronRight size={16} />
            </div>
          </Link>
          
        </div>

        {/* Table Container */}
        <div className="bg-[#1E1E1E]/40 border border-white/10 rounded-[12px] flex flex-col shadow-2xl overflow-hidden backdrop-blur-md">
          
          {/* Table Toolbar */}
          <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.02]">
            <div className="flex gap-6 overflow-x-auto w-full sm:w-auto scrollbar-none">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`pb-4 -mb-4 text-[13px] font-medium transition-colors border-b-2 whitespace-nowrap ${
                    selectedStatus === status 
                      ? 'text-white border-[#D98F8F]' 
                      : 'text-[#A69697] border-transparent hover:text-white'
                  }`}
                >
                  {status === 'ALL' ? t('invoices.all') : t(`status.${status.toLowerCase()}`)}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-[280px]">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search size={14} className="text-[#A69697]" />
              </div>
              <input
                type="text"
                placeholder={t('invoices.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1A0A0B]/80 border border-white/10 rounded-[6px] py-1.5 pl-9 pr-3 text-[13px] text-white outline-none focus:border-[#D98F8F]/50 transition-all placeholder:text-[#A69697]"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-medium text-[#A69697] uppercase tracking-wider bg-white/[0.02]">
                  <th className="px-6 py-4">{t('invoices.table.company_invoice')}</th>
                  <th className="px-6 py-4">{t('invoices.table.date_added')}</th>
                  <th className="px-6 py-4">{t('invoices.table.status')}</th>
                  <th className="px-6 py-4">{t('invoices.table.ai_match')}</th>
                  <th className="px-6 py-4 text-right">{t('invoices.table.amount')}</th>
                  <th className="px-6 py-4 text-center">{t('invoices.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[13px]">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-[#A69697]">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <FileText size={32} className="opacity-20" />
                        <p>{t('invoices.no_invoices')}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => {
                    const style = getStatusStyle(invoice.status);
                    return (
                      <tr 
                        key={invoice._id} 
                        className="hover:bg-white/[0.04] transition-colors group cursor-pointer"
                        onClick={() => router.push(`/invoices/${invoice._id}`)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-[#1A0A0B] border border-white/10 flex items-center justify-center shrink-0">
                              <FileText size={14} className="text-[#A69697]" />
                            </div>
                            <div>
                              <p className="font-bold text-white max-w-[200px] truncate">{invoice.companyName}</p>
                              <p className="text-[#A69697] text-[12px] font-mono mt-0.5">{invoice.invoiceNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white text-[13px]">{new Date(invoice.createdAt || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          <p className="text-[#A69697] text-[11px] mt-0.5">By: {invoice.userId?.name || invoice.userId?.email || 'System'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${style.bg} ${style.text} ${style.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                            {t(`status.${invoice.status.toLowerCase()}`)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {invoice.status === 'FAILED' ? (
                            <span className="text-[#FF5252] text-[12px] flex items-center gap-1.5 font-medium"><AlertTriangle size={14}/> {t('invoices.failed')}</span>
                          ) : invoice.confidence ? (
                            <div className="flex items-center gap-3">
                              <div className="w-20 h-1.5 bg-[#1A0A0B] rounded-full overflow-hidden border border-white/5">
                                <div 
                                  className={`h-full rounded-full ${invoice.confidence > 0.8 ? 'bg-[#4CAF50]' : invoice.confidence > 0.5 ? 'bg-[#FFC107]' : 'bg-[#D98F8F]'}`} 
                                  style={{ width: `${invoice.confidence * 100}%` }}
                                ></div>
                              </div>
                              <span className={`text-[12px] font-medium ${invoice.confidence > 0.8 ? 'text-[#4CAF50]' : invoice.confidence > 0.5 ? 'text-[#FFC107]' : 'text-[#D98F8F]'}`}>{Math.round(invoice.confidence * 100)}%</span>
                            </div>
                          ) : (
                            <span className="text-[#A69697] text-[12px] italic">{t('invoices.not_scanned')}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="font-bold text-white">{invoice.totalAmount?.toLocaleString() || '0'} TND</p>
                          <p className="text-[#A69697] text-[11px] mt-0.5">{t('invoices.tax')}: {invoice.taxAmount?.toLocaleString() || '0'} TND</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <button 
                              onClick={(e) => { e.stopPropagation(); router.push(`/invoices/${invoice._id}`); }}
                              className="p-2 rounded-md hover:bg-white/10 text-[#A69697] hover:text-white transition-colors"
                              title={t('invoices.edit')}
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={(e) => handleDelete(e, invoice._id)}
                              className="p-2 rounded-md hover:bg-[#8E1B3A]/30 text-[#A69697] hover:text-[#D98F8F] transition-colors"
                              title={t('invoices.delete')}
                            >
                              <Trash2 size={14} />
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

      {/* Limit Reached Upgrade Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-[420px] shadow-2xl relative overflow-hidden bg-[#3A0A14]/95 border-[#8E1B3A]/40 text-center">
            <div className="p-8">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                <AlertTriangle size={36} className="text-red-400" />
              </div>
              
              <h2 className="text-white text-[24px] font-bold mb-3">Limit Reached</h2>
              <p className="text-white/70 text-[15px] mb-8 leading-relaxed">
                You have exhausted your free AI scans. Please upgrade your subscription to continue processing invoices.
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => router.push('/settings?tab=subscription')}
                  className="w-full btn-burgundy py-3.5 text-[15px] font-bold shadow-lg"
                >
                  Upgrade Plan
                </button>
                <button 
                  onClick={() => setShowLimitModal(false)}
                  className="w-full py-3.5 text-white/50 hover:text-white transition-colors text-[14px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
