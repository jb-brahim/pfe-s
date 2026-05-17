'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Building2, Search, Filter, ShieldCheck, Zap, ChevronDown, ChevronUp, FileText, ArrowUpRight, CheckCircle2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { analyticsAPI } from '@/lib/api';

const mockSuppliers = [
  {
    id: 'sup-1',
    name: 'Techcorp Solutions',
    category: 'IT Infrastructure',
    autoCreated: false,
    risk: 'Low',
    totalSpend: 145000,
    invoiceCount: 24,
    recentInvoices: [
      { id: 'TC-2023-10-15', date: 'Oct 15, 2023', amount: 7560, status: 'APPROVED' },
      { id: 'TC-2023-09-15', date: 'Sep 15, 2023', amount: 7560, status: 'APPROVED' },
      { id: 'TC-2023-08-15', date: 'Aug 15, 2023', amount: 7560, status: 'APPROVED' },
    ]
  },
  {
    id: 'sup-2',
    name: 'AWS Cloud Services',
    category: 'Cloud Hosting',
    autoCreated: true, // "AI Detected"
    risk: 'Low',
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
    autoCreated: true,
    risk: 'Low',
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
    autoCreated: false,
    risk: 'Medium',
    totalSpend: 12000,
    invoiceCount: 8,
    recentInvoices: [
      { id: 'OSC-4421', date: 'Sep 28, 2023', amount: 1500, status: 'APPROVED' },
    ]
  }
];

export default function SuppliersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('sup-2');
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      try {
        const res = await analyticsAPI.getSuppliers();
        setSuppliers(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  const displaySuppliers = suppliers.length > 0 ? suppliers.map((s, index) => ({
    id: `sup-${index}`,
    name: s.name,
    category: 'General Vendor',
    autoCreated: s.name === 'Unknown Vendor' ? false : true, // Mark AI extracted as autoCreated
    risk: 'Low',
    totalSpend: s.totalSpend,
    invoiceCount: s.invoiceCount,
    recentInvoices: []
  })) : mockSuppliers; // Fallback to mock if empty for demo

  const filteredSuppliers = displaySuppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'APPROVED': return <span className="bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30 px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase">Approved</span>;
      case 'VERIFIED': return <span className="bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30 px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase">Verified</span>;
      case 'PROCESSING': return <span className="bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/30 px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase animate-pulse">Processing</span>;
      default: return <span className="bg-white/5 text-[#A69697] border border-white/10 px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase">{status}</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 w-full pb-10 max-w-[1200px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
          <div>
            <h1 className="text-[36px] font-bold tracking-tight mb-2 flex items-center gap-3 text-[#FFFFFF]">
              Supplier Directory
            </h1>
            <p className="text-[#A69697] text-[16px]">
              Every invoice is automatically categorized here. When the AI scans an invoice from an unknown vendor, <span className="text-[#D98F8F] font-bold">it creates a new Supplier automatically.</span>
            </p>
          </div>
          
          <div className="bg-[#1A0A0B] border border-white/10 rounded-[16px] px-6 py-3 flex items-center gap-8 shadow-lg">
             <div>
               <p className="text-[#A69697] text-[12px] font-bold uppercase tracking-wider mb-1">Total Suppliers</p>
               <p className="text-white text-[24px] font-bold leading-none">{mockSuppliers.length}</p>
             </div>
             <div className="w-px h-10 bg-white/10"></div>
             <div>
               <p className="text-[#A69697] text-[12px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Zap size={12} className="text-[#D98F8F]"/> AI Auto-Created</p>
               <p className="text-[#D98F8F] text-[24px] font-bold leading-none">{mockSuppliers.filter(s => s.autoCreated).length}</p>
             </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.05)] rounded-[20px] p-2 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
          <div className="relative md:w-[400px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A69697]" />
            <input
              type="text"
              placeholder="Search suppliers or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1A0A0B]/50 border border-white/5 rounded-[16px] py-3.5 pl-12 pr-4 text-[14px] text-[#FFFFFF] outline-none focus:border-[#D98F8F]/50 focus:bg-[#1E0A0B] transition-all placeholder:text-[#A69697]"
            />
          </div>
          
          <div className="flex gap-2 pr-2">
            <button className="flex items-center gap-2 px-5 py-3 rounded-[14px] bg-white/5 text-[#A69697] text-[14px] font-medium hover:text-white hover:bg-white/10 transition-colors">
              <Filter size={16} /> Filter
            </button>
            <button className="flex items-center gap-2 px-5 py-3 rounded-[14px] bg-[#8E1B3A]/20 border border-[#8E1B3A]/50 text-[#D98F8F] text-[14px] font-bold hover:bg-[#8E1B3A]/40 transition-colors shadow-[0_0_15px_rgba(142,27,58,0.3)]">
              <Zap size={16} /> View AI-Created Only
            </button>
          </div>
        </div>

        {/* Suppliers List */}
        <div className="flex flex-col gap-4">
          {filteredSuppliers.map((supplier) => {
            const isExpanded = expandedId === supplier.id;
            
            return (
              <div 
                key={supplier.id} 
                className={`group relative backdrop-blur-xl border transition-all duration-500 overflow-hidden ${
                  isExpanded 
                    ? 'bg-[rgba(255,255,255,0.05)] border-[#D98F8F]/40 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[30px]' 
                    : 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] hover:border-[#D98F8F]/20 hover:bg-[rgba(255,255,255,0.03)] rounded-[24px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:-translate-y-0.5'
                }`}
              >
                {/* AI Glow Effect for autoCreated */}
                {supplier.autoCreated && (
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#D98F8F] rounded-full blur-[80px] opacity-10 pointer-events-none"></div>
                )}

                {/* Main Card Header (Always visible) */}
                <div 
                  className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6 cursor-pointer relative z-10"
                  onClick={() => setExpandedId(isExpanded ? null : supplier.id)}
                >
                  {/* Left Logo */}
                  <div className={`w-16 h-16 rounded-[16px] flex items-center justify-center flex-shrink-0 transition-colors ${
                    supplier.autoCreated 
                      ? 'bg-gradient-to-br from-[#8E1B3A]/40 to-[#D98F8F]/20 border border-[#D98F8F]/30 shadow-[inset_0_0_20px_rgba(217,143,143,0.2)]'
                      : 'bg-[#1A0A0B] border border-white/10'
                  }`}>
                    {supplier.autoCreated ? (
                      <Zap className="text-[#D98F8F]" size={28} />
                    ) : (
                      <Building2 className="text-[#A69697]" size={28} />
                    )}
                  </div>

                  {/* Supplier Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-[#FFFFFF] text-[20px] font-bold truncate">{supplier.name}</h2>
                      {supplier.autoCreated && (
                        <span className="bg-[#8E1B3A]/30 text-[#D98F8F] border border-[#D98F8F]/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(217,143,143,0.2)]">
                          <Sparkles size={10} /> AI Auto-Created
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-[#A69697] text-[13px]">
                      <span>{supplier.category}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20"></span>
                      <span className="flex items-center gap-1 text-[#4CAF50]">
                        <ShieldCheck size={14} /> Risk: {supplier.risk}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-8 md:pr-4">
                    <div className="text-right">
                      <p className="text-[#A69697] text-[12px] mb-1">Total Spent</p>
                      <p className="text-[#FFFFFF] text-[18px] font-bold tracking-tight">{supplier.totalSpend.toLocaleString()} TND</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#A69697] text-[12px] mb-1">Invoices</p>
                      <p className="text-[#FFFFFF] text-[18px] font-bold">{supplier.invoiceCount}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${
                      isExpanded ? 'bg-white/10 border-white/20 text-white' : 'bg-[#1A0A0B] border-white/5 text-[#A69697] group-hover:border-white/20 group-hover:text-white'
                    }`}>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Section (Invoices grouped under this supplier) */}
                <div 
                  className={`transition-all duration-500 ease-in-out relative z-10 ${
                    isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 md:px-8 pb-8">
                    <div className="bg-[#1A0A0B]/60 rounded-[24px] border border-white/5 p-6 shadow-inner">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-[#FFFFFF] text-[16px] font-bold flex items-center gap-2">
                          <FileText size={18} className="text-[#D98F8F]" /> Invoices from {supplier.name}
                        </h4>
                        <button className="text-[#A69697] text-[13px] hover:text-white transition-colors flex items-center gap-1">
                          View all {supplier.invoiceCount} invoices <ArrowUpRight size={14} />
                        </button>
                      </div>

                      <div className="flex flex-col gap-3">
                        {supplier.recentInvoices.map((inv) => (
                          <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-[16px] bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group cursor-pointer">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-[12px] bg-[#8E1B3A]/20 flex items-center justify-center text-[#D98F8F] group-hover:scale-110 transition-transform">
                                <FileText size={16} />
                              </div>
                              <div>
                                <p className="text-white font-bold text-[14px]">{inv.id}</p>
                                <p className="text-[#A69697] text-[12px]">{inv.date}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-6 mt-4 sm:mt-0">
                              <p className="text-white font-bold text-[16px]">{inv.amount.toLocaleString()} TND</p>
                              <div className="w-24 flex justify-end">
                                {getStatusBadge(inv.status)}
                              </div>
                              <Link 
                                href={`/invoices/${inv.id}`}
                                className="w-8 h-8 rounded-full bg-[#1A0A0B] border border-white/10 flex items-center justify-center text-[#A69697] group-hover:bg-[#D98F8F] group-hover:text-[#1A0A0B] group-hover:border-transparent transition-all"
                              >
                                <ArrowUpRight size={16} />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>

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
