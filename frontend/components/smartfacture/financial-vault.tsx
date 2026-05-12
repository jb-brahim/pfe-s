'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronRight, 
  FileText, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit3,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  Check
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
  totalHT: number;
  tvaRate: number;
  tvaAmount: number;
  timbre: number;
  totalTTC: number;
  status: string;
  date: string;
  rejectionReason?: string;
}

export function FinancialVault() {
  const router = useRouter();
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/invoices');
      const data = Array.isArray(response.data) ? response.data : response.data.data;
      
      setInvoices(data.map((inv: any) => ({
        _id: inv._id,
        invoiceNumber: inv.extractedData?.invoiceNumber || inv.invoiceNumber || 'N/A',
        vendor: inv.extractedData?.companyName || inv.vendor || 'Unknown Vendor',
        totalHT: inv.extractedData?.totalHT || 0,
        tvaRate: inv.extractedData?.tva || 19,
        tvaAmount: inv.extractedData?.tvaAmount || 0,
        timbre: inv.extractedData?.timbre || 0,
        totalTTC: inv.extractedData?.totalAmount || inv.totalTTC || 0,
        status: inv.status,
        date: inv.extractedData?.date || inv.date || inv.createdAt,
        rejectionReason: inv.rejectionReason
      })));
    } catch (error) {
      toast.error('Failed to fetch invoices from the vault');
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
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      toast.success('Invoice deleted successfully');
    } catch (error) {
      toast.error('Failed to delete invoice');
    }
  };

  const handleToggleSelect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredInvoices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredInvoices.map(inv => inv._id));
    }
  };

  const handleExportCSV = () => {
    const itemsToExport = invoices.filter(inv => 
      selectedIds.length === 0 ? true : selectedIds.includes(inv._id)
    );

    if (itemsToExport.length === 0) {
      toast.error('No invoices available to export');
      return;
    }

    const headers = ['Vendor', 'Invoice Number', 'Date', 'Total HT', 'TVA Rate (%)', 'TVA Amount', 'Timbre', 'Total TTC', 'Status'];
    const csvRows = [
      headers.join(','),
      ...itemsToExport.map(inv => [
        `"${inv.vendor.replace(/"/g, '""')}"`,
        `"${inv.invoiceNumber}"`,
        `"${inv.date}"`,
        inv.totalHT,
        inv.tvaRate,
        inv.tvaAmount,
        inv.timbre,
        inv.totalTTC,
        inv.status
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SmartFacture_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Successfully exported ${itemsToExport.length} invoices to CSV!`);
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
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="p-1 px-2.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase tracking-wider border border-white/5">
                Financial Ledger
              </span>
           </div>
           <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Financial Vault</h1>
           <p className="text-muted-foreground font-semibold">Fully searchable corporate archive for all processed tax invoices.</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={handleExportCSV}
             className="px-6 py-3.5 bg-card/40 border border-white/5 text-muted-foreground hover:text-foreground rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm transition-all cursor-pointer"
           >
              <Download size={16} />
              {selectedIds.length > 0 ? `Export CSV (${selectedIds.length})` : 'Export All CSV'}
           </button>
           {user?.role === 'ACCOUNTANT' && (
             <button 
               onClick={() => router.push('/processing-lab')}
               className="px-6 py-3.5 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-purple hover:scale-102 transition-all cursor-pointer"
             >
                Upload Invoice
             </button>
           )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="sf-card p-4 flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 w-full group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
           <input 
             type="text" 
             placeholder="Search by supplier name, document number..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-11 pr-6 py-4 bg-white/2 border border-transparent rounded-2xl outline-none focus:bg-card/20 focus:border-white/5 transition-all text-sm font-semibold text-foreground"
           />
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-white/2 rounded-2xl overflow-x-auto w-full lg:w-auto border border-white/5">
           {['ALL', 'SUBMITTED', 'VERIFIED', 'APPROVED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  statusFilter === status 
                    ? "bg-primary text-white shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {status === 'SUBMITTED' ? 'In Review' : 
                 status === 'VERIFIED' ? 'Pending' : status}
              </button>
           ))}
        </div>
      </div>

      {/* High-Density Ledger Table */}
      <div className="sf-card p-0 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
             <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
             <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Accessing Safe...</p>
          </div>
        ) : filteredInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <th className="py-5 px-6 w-12 text-center">
                    <button 
                      onClick={handleSelectAll}
                      className={cn(
                        "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                        selectedIds.length === filteredInvoices.length
                          ? "bg-primary border-primary text-white"
                          : "border-white/10 hover:border-white/20"
                      )}
                    >
                      {selectedIds.length === filteredInvoices.length && <Check size={12} />}
                    </button>
                  </th>
                  <th className="py-5 px-4">Supplier / Vendor</th>
                  <th className="py-5 px-4">Invoice #</th>
                  <th className="py-5 px-4">Date</th>
                  <th className="py-5 px-4 text-right">Total HT</th>
                  <th className="py-5 px-4 text-right">TVA (%)</th>
                  <th className="py-5 px-4 text-right">Timbre</th>
                  <th className="py-5 px-4 text-right text-primary">Total TTC</th>
                  <th className="py-5 px-4 text-center">Audit Status</th>
                  <th className="py-5 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => {
                  const isSelected = selectedIds.includes(inv._id);
                  return (
                    <motion.tr
                      key={inv._id}
                      onClick={() => router.push(`/vault/${inv._id}`)}
                      className={cn(
                        "border-b border-white/5 hover:bg-white/2 transition-colors cursor-pointer group",
                        isSelected && "bg-primary/5 hover:bg-primary/5"
                      )}
                      layout
                    >
                      {/* Bulk Select Checkbox */}
                      <td className="py-5 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={(e) => handleToggleSelect(e, inv._id)}
                          className={cn(
                            "w-5 h-5 rounded-md border flex items-center justify-center transition-all mx-auto",
                            isSelected
                              ? "bg-primary border-primary text-white"
                              : "border-white/10 hover:border-white/20"
                          )}
                        >
                          {isSelected && <Check size={12} />}
                        </button>
                      </td>
                      
                      {/* Vendor name */}
                      <td className="py-5 px-4 font-extrabold text-foreground text-sm tracking-tight">
                        {inv.vendor}
                      </td>

                      {/* Number */}
                      <td className="py-5 px-4 font-mono text-xs text-muted-foreground tracking-wider">
                        {inv.invoiceNumber}
                      </td>

                      {/* Date */}
                      <td className="py-5 px-4 text-xs font-semibold text-muted-foreground">
                        {inv.date}
                      </td>

                      {/* HT */}
                      <td className="py-5 px-4 text-right font-mono text-xs font-bold text-muted-foreground">
                        {inv.totalHT.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DT
                      </td>

                      {/* TVA */}
                      <td className="py-5 px-4 text-right font-mono text-xs font-bold text-muted-foreground">
                        {inv.tvaRate}%
                      </td>

                      {/* Timbre */}
                      <td className="py-5 px-4 text-right font-mono text-xs font-bold text-muted-foreground">
                        {inv.timbre.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DT
                      </td>

                      {/* TTC */}
                      <td className="py-5 px-4 text-right font-mono text-sm font-black text-primary">
                        {inv.totalTTC.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DT
                      </td>

                      {/* Status */}
                      <td className="py-5 px-4 text-center">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-block",
                          inv.status === 'APPROVED' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" :
                          inv.status === 'REJECTED' ? "bg-red-500/10 text-red-400 border border-red-500/10" :
                          inv.status === 'VERIFIED' ? "bg-amber-500/10 text-amber-400 border border-amber-500/10" :
                          "bg-indigo-500/10 text-indigo-400 border border-indigo-500/10"
                        )}>
                          {inv.status === 'SUBMITTED' ? 'In Review' : 
                           inv.status === 'VERIFIED' ? 'Pending' : inv.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-5 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                           <button 
                             onClick={() => router.push(`/vault/${inv._id}`)}
                             className="p-2.5 rounded-xl bg-white/2 hover:bg-primary/10 hover:text-primary border border-white/5 text-muted-foreground transition-all"
                             title="Audit Invoice"
                           >
                              <Edit3 size={15} />
                           </button>
                           <button 
                             onClick={(e) => handleDelete(e, inv._id)}
                             className="p-2.5 rounded-xl bg-white/2 hover:bg-red-500/10 hover:text-red-400 border border-white/5 text-muted-foreground transition-all"
                             title="Delete Record"
                           >
                              <Trash2 size={15} />
                           </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 p-8">
             <div className="w-16 h-16 bg-white/5 border border-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                <Search size={28} />
             </div>
             <h3 className="text-xl font-bold text-foreground">No invoices archived</h3>
             <p className="text-muted-foreground text-sm font-semibold mt-1">We couldn't find any documents matching your filters.</p>
             <button 
               onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
               className="text-primary text-xs font-black uppercase tracking-wider hover:underline mt-6"
             >
                Clear Filters
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
