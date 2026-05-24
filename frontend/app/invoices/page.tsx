'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { invoiceAPI, mockInvoices } from '@/lib/api';
import { Upload, Loader, Eye, Edit, Trash2, Search, FileText, Zap, Sparkles, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
  const [invoices, setInvoices] = useState(mockInvoices);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const statuses: InvoiceStatus[] = ['ALL', 'SUBMITTED', 'APPROVED', 'REJECTED', 'FAILED'];

  useEffect(() => {
    const fetchInvoices = async () => {
      const status = selectedStatus === 'ALL' ? undefined : selectedStatus;
      const result = await invoiceAPI.getAll(status, searchQuery);
      setInvoices(result.data || mockInvoices);
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
            extractedData: newInvoice.extractedData || {}
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
            extractedData: {}
          }, ...prev]);
        }
      } catch (error: any) {
        console.error('Upload failed:', error);
        if (error.response?.status === 409) {
          toast.error(`Duplicate Invoice: ${file.name} has already been uploaded.`);
        } else {
          toast.error(`Failed to upload ${file.name}`);
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
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await invoiceAPI.delete(id);
      setInvoices(invoices.filter(inv => inv._id !== id));
      toast.success('Invoice deleted successfully');
    } catch (error) {
      toast.error('Failed to delete invoice');
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
            <h1 className="text-[28px] font-bold text-white tracking-tight">Invoices</h1>
            <p className="text-[#A69697] text-[14px]">Manage, verify, and track your processed documents.</p>
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
                  {isUploading ? `Extracting Data (${Math.round(uploadProgress)}%)` : 'AI Dropzone'}
                </h3>
                <p className="text-[#A69697] text-[13px] hidden xl:block">
                  {isUploading ? 'Analyzing document layout and fields...' : 'Drag & drop PDF, JPG, or PNG files here.'}
                </p>
              </div>
            </div>
            
            <div className="z-10 bg-white/5 border border-white/10 px-4 py-2 rounded-md text-[12px] text-white font-medium group-hover:bg-[#8E1B3A] group-hover:border-[#8E1B3A] transition-colors whitespace-nowrap">
              Browse Files
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
                <h3 className="text-white font-bold text-[16px] mb-1">Add Manually</h3>
                <p className="text-[#A69697] text-[13px] hidden xl:block">Create an invoice record without AI extraction.</p>
              </div>
            </div>
            
            <div className="z-10 flex items-center gap-2 text-[#A69697] group-hover:text-white transition-colors">
              <span className="text-[13px] font-medium whitespace-nowrap">Create New</span>
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
                  {status}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-[280px]">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search size={14} className="text-[#A69697]" />
              </div>
              <input
                type="text"
                placeholder="Search invoice # or company..."
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
                  <th className="px-6 py-4">Company & Invoice</th>
                  <th className="px-6 py-4">Date Added</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">AI Match</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[13px]">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-[#A69697]">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <FileText size={32} className="opacity-20" />
                        <p>No invoices found matching your criteria.</p>
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
                        <td className="px-6 py-4 text-[#A69697]">
                          {new Date(invoice.createdAt || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${style.bg} ${style.text} ${style.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {invoice.status === 'FAILED' ? (
                            <span className="text-[#FF5252] text-[12px] flex items-center gap-1.5 font-medium"><AlertTriangle size={14}/> Failed</span>
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
                            <span className="text-[#A69697] text-[12px] italic">Not scanned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="font-bold text-white">${invoice.totalAmount?.toLocaleString() || '0'}</p>
                          <p className="text-[#A69697] text-[11px] mt-0.5">Tax: ${invoice.taxAmount?.toLocaleString() || '0'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => { e.stopPropagation(); router.push(`/invoices/${invoice._id}`); }}
                              className="p-2 rounded-md hover:bg-white/10 text-[#A69697] hover:text-white transition-colors"
                              title="Edit"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={(e) => handleDelete(e, invoice._id)}
                              className="p-2 rounded-md hover:bg-[#8E1B3A]/30 text-[#A69697] hover:text-[#D98F8F] transition-colors"
                              title="Delete"
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
    </DashboardLayout>
  );
}
