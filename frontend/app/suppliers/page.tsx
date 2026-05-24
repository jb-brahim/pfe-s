'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Building2, Search, ChevronDown, ChevronUp, FileText, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { analyticsAPI } from '@/lib/api';

const mockSuppliers = [
  {
    id: 'sup-1',
    name: 'Techcorp Solutions',
    category: 'IT Infrastructure',
    totalSpend: 145000,
    invoiceCount: 24,
    recentInvoices: [
      { id: 'TC-2023-10-15', date: 'Oct 15, 2023', amount: 7560, status: 'APPROVED' },
      { id: 'TC-2023-09-15', date: 'Sep 15, 2023', amount: 7560, status: 'APPROVED' },
    ]
  },
  {
    id: 'sup-2',
    name: 'AWS Cloud Services',
    category: 'Cloud Hosting',
    totalSpend: 34200,
    invoiceCount: 12,
    recentInvoices: [
      { id: 'AWS-99281', date: 'Oct 01, 2023', amount: 2850, status: 'VERIFIED' },
      { id: 'AWS-88192', date: 'Sep 01, 2023', amount: 2700, status: 'APPROVED' },
    ]
  },
  {
    id: 'sup-3',
    name: 'Figma Design',
    category: 'Software',
    totalSpend: 5400,
    invoiceCount: 1,
    recentInvoices: [
      { id: 'FIG-1029', date: 'Oct 14, 2023', amount: 450, status: 'PROCESSING' },
    ]
  },
  {
    id: 'sup-4',
    name: 'Office Supplies Co',
    category: 'Operations',
    totalSpend: 12000,
    invoiceCount: 8,
    recentInvoices: [
      { id: 'OSC-4421', date: 'Sep 28, 2023', amount: 1500, status: 'APPROVED' },
    ]
  }
];

export default function SuppliersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      try {
        const res = await analyticsAPI.getSuppliers();
        setSuppliers(res.data && res.data.length > 0 ? res.data : mockSuppliers);
      } catch (err) {
        console.error(err);
        setSuppliers(mockSuppliers);
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  const displaySuppliers = suppliers.map((s, index) => ({
    id: s._id || s.id || `sup-${index}`,
    name: s.name,
    category: s.category || 'General Vendor',
    totalSpend: s.totalSpend || 0,
    invoiceCount: s.invoiceCount || (s.recentInvoices ? s.recentInvoices.length : 0),
    recentInvoices: s.recentInvoices || []
  }));

  const filteredSuppliers = displaySuppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'APPROVED': return <span className="bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30 px-3 py-1 rounded-[8px] text-[10px] font-bold uppercase">Approved</span>;
      case 'VERIFIED': return <span className="bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30 px-3 py-1 rounded-[8px] text-[10px] font-bold uppercase">Verified</span>;
      case 'PROCESSING': return <span className="bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/30 px-3 py-1 rounded-[8px] text-[10px] font-bold uppercase animate-pulse">Processing</span>;
      default: return <span className="bg-white/5 text-[#A69697] border border-white/10 px-3 py-1 rounded-[8px] text-[10px] font-bold uppercase">{status}</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 w-full pb-10 max-w-[1200px] mx-auto pt-4 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
          <div>
            <h1 className="text-[36px] font-bold tracking-tight mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#EBD8D8] to-[#D98F8F]">
                Suppliers Directory
              </span>
            </h1>
            <p className="text-[#A69697] text-[15px] max-w-[600px]">
              Manage your vendors and track invoice history seamlessly.
            </p>
          </div>
          
          <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.05)] rounded-[20px] px-6 py-4 shadow-lg flex flex-col justify-center min-w-[180px]">
            <p className="text-[#A69697] text-[11px] font-bold uppercase tracking-wider mb-1">Total Suppliers</p>
            <p className="text-white text-[28px] font-bold leading-none">{displaySuppliers.length}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full shadow-lg rounded-[20px] overflow-hidden backdrop-blur-md border border-[rgba(255,255,255,0.05)]">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#A69697]" />
          <input
            type="text"
            placeholder="Search suppliers by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1A0A0B]/50 py-4 pl-12 pr-4 text-[15px] text-white outline-none focus:bg-[#1E0A0B] transition-all placeholder:text-[#A69697]"
          />
        </div>

        {/* Suppliers List */}
        <div className="flex flex-col gap-3 mt-4">
          {filteredSuppliers.map((supplier) => {
            const isExpanded = expandedId === supplier.id;
            
            return (
              <div 
                key={supplier.id} 
                className={`group relative backdrop-blur-xl border rounded-[24px] transition-all duration-400 overflow-hidden ${
                  isExpanded 
                    ? 'bg-[rgba(255,255,255,0.05)] border-[#D98F8F]/40 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' 
                    : 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] hover:border-[#D98F8F]/20 hover:bg-[rgba(255,255,255,0.04)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)]'
                }`}
              >
                {/* Accent Line */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#D98F8F] to-[#8E1B3A] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                {/* Main Card Header */}
                <div 
                  className="p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-5 cursor-pointer pl-6 md:pl-8"
                  onClick={() => setExpandedId(isExpanded ? null : supplier.id)}
                >
                  {/* Avatar/Icon */}
                  <div className="w-14 h-14 rounded-[16px] bg-[#1A0A0B] border border-white/5 flex items-center justify-center flex-shrink-0 text-[#A69697] group-hover:text-[#D98F8F] group-hover:border-[#D98F8F]/30 transition-all shadow-inner">
                    <Building2 size={24} />
                  </div>

                  {/* Supplier Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-white text-[18px] font-bold truncate mb-1">{supplier.name}</h2>
                    <p className="text-[#A69697] text-[13px]">{supplier.category}</p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-8 md:pr-4">
                    <div className="text-right hidden sm:block w-[140px]">
                      <p className="text-[#A69697] text-[11px] uppercase tracking-wider mb-1 font-bold">Total Spent</p>
                      <p className="text-white text-[18px] font-bold tracking-tight">{supplier.totalSpend.toLocaleString()} TND</p>
                    </div>
                    <div className="text-right hidden sm:block w-[80px]">
                      <p className="text-[#A69697] text-[11px] uppercase tracking-wider mb-1 font-bold">Invoices</p>
                      <p className="text-white text-[18px] font-bold tracking-tight">{supplier.invoiceCount}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                      isExpanded ? 'bg-white/10 border-white/20 text-white' : 'bg-[#1A0A0B] border-white/5 text-[#A69697] group-hover:border-white/20 group-hover:text-white'
                    }`}>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Section */}
                <div 
                  className={`transition-all duration-500 ease-in-out ${
                    isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-6 md:p-8 pt-0 pl-6 md:pl-8 border-t border-white/5">
                    <div className="flex items-center justify-between mb-4 mt-2">
                      <h4 className="text-white text-[15px] font-semibold flex items-center gap-2">
                        Recent Invoices
                      </h4>
                      <button className="text-[#A69697] hover:text-white text-[13px] transition-colors flex items-center gap-1 font-medium">
                        View all invoices <ArrowUpRight size={14} />
                      </button>
                    </div>

                    <div className="flex flex-col gap-3">
                      {supplier.recentInvoices && supplier.recentInvoices.length > 0 ? (
                        supplier.recentInvoices.map((inv: any) => (
                          <Link 
                            href={`/invoices/${inv.id}`}
                            key={inv.id} 
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-[16px] bg-[#1A0A0B]/40 border border-white/5 hover:border-white/10 hover:bg-[#1A0A0B]/80 transition-all group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-[12px] bg-white/5 flex items-center justify-center text-[#A69697] group-hover:text-[#D98F8F] transition-colors">
                                <FileText size={16} />
                              </div>
                              <div>
                                <p className="text-white font-bold text-[14px]">{inv.id.substring(0, 8).toUpperCase()}</p>
                                <p className="text-[#A69697] text-[12px]">{new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-6 mt-3 sm:mt-0">
                              <p className="text-white font-bold text-[15px]">{inv.amount.toLocaleString()} TND</p>
                              <div className="w-24 flex justify-end">
                                {getStatusBadge(inv.status)}
                              </div>
                              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#A69697] group-hover:bg-[#D98F8F] group-hover:text-[#1A0A0B] transition-all">
                                <ArrowUpRight size={14} />
                              </div>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#1A0A0B]/20 rounded-[12px] border border-white/5">
                          <div>
                            <p className="text-white text-[14px] font-medium mb-1">No invoices found</p>
                            <p className="text-[#A69697] text-[13px]">This supplier hasn't billed you recently. When they do, invoices will appear here.</p>
                          </div>
                          <Link href="/invoices/manual" className="mt-4 sm:mt-0 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[13px] font-medium rounded-lg border border-white/10 transition-colors">
                            Add manual invoice
                          </Link>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </DashboardLayout>
  );
}
