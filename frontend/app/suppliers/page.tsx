'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Building2, Search, ChevronDown, ChevronUp, FileText, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { analyticsAPI } from '@/lib/api';
import { useLanguage } from '@/lib/i18n-context';

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
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
        setSuppliers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  const displaySuppliers = suppliers.map((s, index) => ({
    id: s._id || s.id || `sup-${index}`,
    name: s.name,
    category: s.category || t('suppliers.general_vendor'),
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
      case 'APPROVED': return <span className="bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30 px-3 py-1 rounded-[8px] text-[10px] font-bold uppercase">{t('status.approved')}</span>;
      case 'VERIFIED': return <span className="bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30 px-3 py-1 rounded-[8px] text-[10px] font-bold uppercase">{t('status.verified')}</span>;
      case 'PROCESSING': return <span className="bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/30 px-3 py-1 rounded-[8px] text-[10px] font-bold uppercase animate-pulse">{t('status.processing')}</span>;
      default: return <span className="bg-white/5 text-[#A69697] border border-white/10 px-3 py-1 rounded-[8px] text-[10px] font-bold uppercase">{t(`status.${status.toLowerCase()}`)}</span>;
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
                {t('suppliers.title')}
              </span>
            </h1>
            <p className="text-[#A69697] text-[15px] max-w-[600px]">
              {t('suppliers.subtitle')}
            </p>
          </div>
          
          <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.05)] rounded-[20px] px-6 py-4 shadow-lg flex flex-col justify-center min-w-[180px]">
            <p className="text-[#A69697] text-[11px] font-bold uppercase tracking-wider mb-1">{t('suppliers.total_suppliers')}</p>
            <p className="text-white text-[28px] font-bold leading-none">{displaySuppliers.length}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full shadow-lg rounded-[20px] overflow-hidden backdrop-blur-md border border-[rgba(255,255,255,0.05)]">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#A69697]" />
          <input
            type="text"
            placeholder={t('suppliers.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1A0A0B]/50 py-4 pl-12 pr-4 text-[15px] text-white outline-none focus:bg-[#1E0A0B] transition-all placeholder:text-[#A69697]"
          />
        </div>

        {/* Suppliers Table */}
        <div className="mt-6 bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.05)] rounded-[16px] overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/5 text-[#A69697] text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-4 px-6">{t('suppliers.supplier')}</th>
                  <th className="py-4 px-6">{t('suppliers.category')}</th>
                  <th className="py-4 px-6 text-right">{t('suppliers.total_spent')}</th>
                  <th className="py-4 px-6 text-center">{t('suppliers.invoices')}</th>
                  <th className="py-4 px-6 text-center w-[80px]"></th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-[#1A0A0B] flex items-center justify-center text-[#A69697] mb-4 shadow-inner">
                          <Building2 size={24} />
                        </div>
                        <h3 className="text-white text-[16px] font-semibold mb-2">{t('suppliers.no_suppliers')}</h3>
                        <p className="text-[#A69697] text-[14px] max-w-[400px]">
                          {t('suppliers.no_suppliers_desc')}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((supplier) => {
                    const isExpanded = expandedId === supplier.id;
                    
                    return (
                      <Fragment key={supplier.id}>
                        <tr 
                          onClick={() => setExpandedId(isExpanded ? null : supplier.id)}
                          className={`group cursor-pointer transition-all border-b border-white/5 last:border-0 ${
                            isExpanded ? 'bg-white/5' : 'hover:bg-white/[0.03]'
                          }`}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-[10px] bg-[#1A0A0B] border border-white/10 flex items-center justify-center flex-shrink-0 text-[#A69697] group-hover:text-[#D98F8F] group-hover:border-[#D98F8F]/30 transition-all shadow-sm">
                                <Building2 size={18} />
                              </div>
                              <span className="text-white text-[14px] font-medium">{supplier.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-[#A69697] text-[13px]">{supplier.category}</span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className="text-white text-[14px] font-medium">{supplier.totalSpend.toLocaleString()} TND</span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/5 text-[#A69697] text-[12px] font-medium group-hover:text-white group-hover:bg-white/10 transition-colors">
                              {supplier.invoiceCount}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                isExpanded ? 'bg-white/10 text-white' : 'text-[#A69697] group-hover:text-white group-hover:bg-white/5'
                              }`}>
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </div>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Expanded Row */}
                        {isExpanded && (
                          <tr className="bg-white/[0.01] border-b border-white/5 last:border-0">
                            <td colSpan={5} className="p-0">
                              <div className="px-6 py-5 border-l-2 border-[#D98F8F] ml-[2px]">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="text-white text-[13px] font-semibold flex items-center gap-2">
                                    {t('suppliers.recent_invoices')}
                                  </h4>
                                  <button className="text-[#A69697] hover:text-white text-[12px] transition-colors flex items-center gap-1 font-medium">
                                    {t('suppliers.view_all')} <ArrowUpRight size={14} />
                                  </button>
                                </div>
                                <div className="grid gap-2">
                                  {supplier.recentInvoices && supplier.recentInvoices.length > 0 ? (
                                    supplier.recentInvoices.map((inv: any) => (
                                      <Link 
                                        href={`/invoices/${inv.id}`}
                                        key={inv.id} 
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 px-4 rounded-[10px] bg-[#1A0A0B]/40 border border-white/5 hover:border-white/10 hover:bg-[#1A0A0B]/60 transition-all group"
                                      >
                                        <div className="flex items-center gap-4">
                                          <div className="w-8 h-8 rounded-[8px] bg-white/5 flex items-center justify-center text-[#A69697] group-hover:text-[#D98F8F] transition-colors">
                                            <FileText size={14} />
                                          </div>
                                          <div>
                                            <p className="text-white font-medium text-[13px]">{inv.id.substring(0, 8).toUpperCase()}</p>
                                            <p className="text-[#A69697] text-[11px] mt-0.5">{new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-5 mt-2 sm:mt-0">
                                          <p className="text-white font-medium text-[13px]">{inv.amount.toLocaleString()} TND</p>
                                          <div className="w-[88px] flex justify-end">
                                            {getStatusBadge(inv.status)}
                                          </div>
                                          <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#A69697] group-hover:bg-[#D98F8F] group-hover:text-[#1A0A0B] transition-all">
                                            <ArrowUpRight size={12} />
                                          </div>
                                        </div>
                                      </Link>
                                    ))
                                  ) : (
                                    <div className="flex items-center justify-between p-4 bg-[#1A0A0B]/20 rounded-[10px] border border-white/5">
                                      <div>
                                        <p className="text-white text-[13px] font-medium mb-0.5">{t('suppliers.no_invoices')}</p>
                                        <p className="text-[#A69697] text-[12px]">{t('suppliers.no_invoices_desc')}</p>
                                      </div>
                                      <Link href="/invoices/manual" className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-[12px] font-medium rounded-md border border-white/10 transition-colors">
                                        {t('suppliers.add_manual')}
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
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
