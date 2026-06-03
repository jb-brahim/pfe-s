'use client';

import React, { useState, useEffect } from 'react';
import { Search, Loader, Building, Mail, FileText } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '@/lib/i18n-context';

export default function InvoicesDetailsPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(`${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}/api/super-admin/invoices-by-enterprise`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.success) {
          setData(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching invoices by enterprise:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const filteredData = data.filter(item => {
    const name = item.enterpriseName?.toLowerCase() || '';
    const email = item.email?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  return (
    <div className="animate-in fade-in duration-500 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[24px] font-semibold text-white tracking-tight mb-1">Invoices by Enterprise</h1>
          <p className="text-[13px] text-[#A69697]">
            Overview of total extracted invoices for each organization on the platform.
          </p>
        </div>
      </div>

      <div className="bg-[#1A050A] border border-white/5 rounded-lg flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-b border-white/5">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A69697]" size={14} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search enterprise or email..."
              className="w-full pl-9 pr-4 py-2 rounded-md border outline-none text-[12px] transition-colors bg-[#1E0A0B] border-white/5 text-white focus:border-[#D98F8F]/50 placeholder:text-[#A69697]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="py-3 px-5 text-[11px] uppercase tracking-wider text-[#A69697] font-medium w-[40%]">Enterprise Name</th>
                <th className="py-3 px-5 text-[11px] uppercase tracking-wider text-[#A69697] font-medium w-[40%]">Admin Email</th>
                <th className="py-3 px-5 text-[11px] uppercase tracking-wider text-[#A69697] font-medium w-[20%] text-right">Invoices Extracted</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center">
                    <Loader size={20} className="animate-spin text-[#A69697] mx-auto" />
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-[12px] text-[#A69697]">
                    No enterprises found matching your search.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={index} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded border border-white/5 bg-[#1E0A0B] flex items-center justify-center">
                          <Building size={14} className="text-[#D98F8F]" />
                        </div>
                        <p className="text-[13px] font-medium text-white">{item.enterpriseName}</p>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2 text-[13px] text-[#A69697]">
                        <Mail size={14} />
                        {item.email}
                      </div>
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="inline-flex flex-col items-end">
                        <span className="text-[14px] font-semibold text-white flex items-center gap-1.5">
                          {item.invoiceCount} <FileText size={14} className="text-[#A69697]" />
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
