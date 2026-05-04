'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronRight, 
  FileText, 
  DollarSign, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ArrowUpRight,
  Trash2,
  Edit3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  vendor: string;
  totalTTC: number;
  status: string;
  date: string;
  category?: string;
  rejectionReason?: string;
}

export function FinancialVault() {
  const router = useRouter();
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/invoices');
      // The backend returns an array directly or inside data? 
      // Based on getInvoices controller, it returns res.json(invoices)
      const data = Array.isArray(response.data) ? response.data : response.data.data;
      
      setInvoices(data.map((inv: any) => ({
        _id: inv._id,
        invoiceNumber: inv.extractedData?.invoiceNumber || inv.invoiceNumber || 'N/A',
        vendor: inv.extractedData?.companyName || inv.vendor || 'Unknown Vendor',
        totalTTC: inv.extractedData?.totalAmount || inv.totalTTC || 0,
        status: inv.status,
        date: inv.extractedData?.date || inv.date || inv.createdAt,
        rejectionReason: inv.rejectionReason
      })));
    } catch (error) {
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) return;

    try {
      await api.delete(`/invoices/${id}`);
      setInvoices(prev => prev.filter(inv => inv._id !== id));
      toast.success('Invoice deleted successfully');
    } catch (error) {
      toast.error('Failed to delete invoice');
    }
  };

  const filteredInvoices = (invoices || []).filter(inv => {
    const vendor = inv.vendor || '';
    const invoiceNumber = inv.invoiceNumber || '';
    const matchesSearch = vendor.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-10 pb-10">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Financial Vault</h1>
           <p className="text-muted-foreground font-medium">Your central archive for all processed invoices.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="px-6 py-3 bg-card border border-border text-muted-foreground rounded-2xl font-bold flex items-center gap-2 shadow-sm hover:bg-muted transition-all">
              <Download size={20} />
              Export CSV
           </button>
           {user?.role === 'EMPLOYEE' && (
             <button 
               onClick={() => router.push('/processing-lab')}
               className="px-6 py-3 bg-primary text-white rounded-2xl font-bold flex items-center gap-2 shadow-purple hover:scale-105 transition-all"
             >
                Upload New
             </button>
           )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-card rounded-[2.5rem] p-4 shadow-soft border border-border flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
           <input 
             type="text" 
             placeholder="Search by vendor, number..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-11 pr-6 py-4 bg-muted/50 border border-transparent rounded-2xl outline-none focus:bg-card focus:border-primary/20 transition-all text-sm font-medium text-foreground"
           />
        </div>
        <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-2xl overflow-x-auto">
           {['ALL', 'SUBMITTED', 'VERIFIED', 'APPROVED', 'REJECTED', 'FAILED'].map((status) => (
             <button
               key={status}
               onClick={() => setStatusFilter(status)}
               className={cn(
                 "px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                 statusFilter === status 
                   ? "bg-card text-primary shadow-sm" 
                   : "text-muted-foreground hover:text-foreground"
               )}
             >
               {status === 'SUBMITTED' ? 'In Review' : 
                status === 'VERIFIED' ? 'Pending' : status}
             </button>
           ))}
        </div>
        <button className="p-4 bg-muted/50 text-muted-foreground rounded-2xl hover:text-primary transition-all">
           <Filter size={20} />
        </button>
      </div>

      {/* Invoice List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
             <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
             <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Accessing Vault...</p>
          </div>
        ) : filteredInvoices.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredInvoices.map((inv) => (
              <motion.div
                key={inv._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => router.push(`/vault/${inv._id}`)}
                className="bg-card rounded-3xl p-6 shadow-soft border border-border flex flex-col md:flex-row md:items-center gap-6 hover:shadow-lg hover:border-primary/10 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                   <FileText size={24} />
                </div>
                
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-lg font-extrabold text-foreground tracking-tight">{inv.vendor}</h4>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        inv.status === 'PAID' ? "bg-emerald-500/10 text-emerald-500" :
                        inv.status === 'APPROVED' ? "bg-primary/10 text-primary" :
                        inv.status === 'REJECTED' ? "bg-red-500/10 text-red-500" :
                        "bg-amber-500/10 text-amber-500"
                      )}>
                        {inv.status === 'SUBMITTED' ? 'Pending' : inv.status}
                      </span>
                   </div>
                   <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                     {inv.invoiceNumber} • {new Date(inv.date).toLocaleDateString()}
                   </p>
                   
                   {inv.status === 'REJECTED' && inv.rejectionReason && (
                     <div className="mt-3 flex items-center gap-2 text-red-500 text-[10px] font-bold bg-red-500/5 p-2 rounded-lg border border-red-500/10">
                        <AlertCircle size={12} />
                        Feedback: {inv.rejectionReason}
                     </div>
                   )}
                </div>

                <div className="text-right">
                   <p className="text-2xl font-black text-foreground tracking-tighter">
                     ${inv.totalTTC.toLocaleString()}
                   </p>
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Amount TTC</p>
                </div>

                <div className="flex items-center gap-2">
                   <button 
                     onClick={(e) => {
                       e.stopPropagation();
                       router.push(`/vault/${inv._id}`);
                     }}
                     className="p-3 rounded-xl bg-muted text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                     title="Edit / View"
                   >
                      <Edit3 size={18} />
                   </button>
                   <button 
                     onClick={(e) => handleDelete(e, inv._id)}
                     className="p-3 rounded-xl bg-muted text-muted-foreground hover:text-red-500 hover:bg-red-500/5 transition-all"
                     title="Delete"
                   >
                      <Trash2 size={18} />
                   </button>
                   <div className="p-3 rounded-xl bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/5 transition-all">
                      <ChevronRight size={20} />
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-[2.5rem] p-20 text-center border border-dashed border-border">
             <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                <Search size={40} />
             </div>
             <h3 className="text-xl font-bold text-foreground mb-2">No invoices found</h3>
             <p className="text-muted-foreground font-medium mb-8">Try adjusting your filters or search terms.</p>
             <button 
               onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
               className="text-primary font-bold text-sm hover:underline"
             >
                Clear all filters
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
