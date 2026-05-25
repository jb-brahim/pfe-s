'use client';

import { FileText, Clock, CheckCircle2, XCircle, Search, Filter, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { invoiceAPI } from '@/lib/api';
import { toast } from 'sonner';

export default function DeliveryHistoryPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchInvoices = async () => {
    try {
      const res = await invoiceAPI.getAll();
      if (res.data) {
        // Sort newest first
        const sorted = [...res.data].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setInvoices(sorted);
      }
    } catch (err) {
      console.error("Failed to load invoices", err);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await invoiceAPI.delete(id);
      toast.success('Invoice deleted successfully');
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete invoice');
    }
  };

  const getStatusUI = (status: string) => {
    if (status === 'APPROVED') return 'approved';
    if (status === 'REJECTED') return 'rejected';
    return 'pending'; 
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (val?: number) => {
    if (val == null || val === 0) return null;
    return new Intl.NumberFormat('fr-TN', { style: 'decimal', minimumFractionDigits: 2 }).format(val) + ' TND';
  };

  const filteredInvoices = invoices.filter(item => {
    const fileName = item.fileUrl ? item.fileUrl.split('/').pop()?.toLowerCase() : '';
    const invNum = (item.invoiceNumber || '').toLowerCase();
    const vendor = (item.companyName || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return fileName?.includes(query) || invNum.includes(query) || vendor.includes(query);
  });

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <h2 className="text-[22px] font-bold text-white">My History</h2>
        <button className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
          <Filter size={18} />
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-[#A69697]" />
        </div>
        <input 
          type="text" 
          placeholder="Search uploads..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-[#D98F8F]/50 focus:bg-white/[0.05] transition-all"
        />
      </div>

      <div className="space-y-3 pb-8">
        {filteredInvoices.length === 0 ? (
           <p className="text-[#A69697] text-[13px] text-center py-8">No uploads found.</p>
        ) : (
          filteredInvoices.map((item) => {
            const uiStatus = getStatusUI(item.status);
            const fileName = item.fileUrl ? item.fileUrl.split('/').pop() : `Invoice #${item.invoiceNumber || 'Pending'}`;
            const amount = formatCurrency(item.totalAmount);
            
            return (
              <div key={item._id} className="glass-card p-4 flex flex-col gap-3">
                
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/[0.05] rounded-xl flex items-center justify-center border border-white/5 shrink-0">
                      <FileText className="text-[#A69697]" size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-white text-[15px] truncate max-w-[200px]">{fileName}</p>
                      <p className="text-[#A69697] text-[12px] flex items-center gap-1 mt-1"><Clock size={12}/> {formatDate(item.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0">
                    {uiStatus === 'pending' && (
                      <span className="badge-warning">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></div> Processing
                      </span>
                    )}
                    {uiStatus === 'approved' && (
                      <span className="badge-success">
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    )}
                    {uiStatus === 'rejected' && (
                      <span className="badge-error">
                        <XCircle size={12} /> Rejected
                      </span>
                    )}
                  </div>
                </div>

                {/* Extra details row */}
                <div className="pt-3 mt-1 border-t border-white/5 flex justify-between items-center">
                  <div className="flex flex-col gap-1">
                    {amount && (
                      <div className="text-[13px] text-[#A69697]">
                        Total: <span className="text-white font-medium">{amount}</span>
                      </div>
                    )}
                    {item.companyName && (
                      <div className="text-[12px] text-[#A69697] max-w-[150px] truncate">
                        Vendor: {item.companyName}
                      </div>
                    )}
                  </div>
                  
                  {/* Delete Button */}
                  <button 
                    onClick={() => handleDelete(item._id)}
                    className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                    title="Delete Upload"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
