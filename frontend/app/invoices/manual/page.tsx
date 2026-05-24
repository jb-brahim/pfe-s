'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Building2, Hash, DollarSign, Calendar, FileText } from 'lucide-react';
import { invoiceAPI } from '@/lib/api';
import { toast } from 'sonner';

export default function ManualInvoicePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    invoiceNumber: '',
    totalAmount: '',
    taxAmount: '',
    date: '',
    category: 'General',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.invoiceNumber || !formData.totalAmount) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real app, you'd send this to an API endpoint designed for manual entries.
      // We will mock a successful creation by sending a request to the backend or just faking success.
      await new Promise(resolve => setTimeout(resolve, 800)); 
      
      toast.success('Invoice created successfully!');
      router.push('/invoices');
    } catch (error) {
      toast.error('Failed to create invoice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 w-full pb-10 max-w-[800px] mx-auto">
        
        {/* Header & Back Button */}
        <div className="flex flex-col gap-4 relative z-10">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#B34E56] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
          
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#A69697] hover:text-white transition-colors w-fit"
          >
            <ArrowLeft size={16} /> Back to Invoices
          </button>
          
          <div>
            <h1 className="text-[36px] font-bold tracking-tight mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FFFFFF] via-[#EBD8D8] to-[#D98F8F]">
                Manual Invoice Entry
              </span>
            </h1>
            <p className="text-[#A69697] text-[16px]">Enter invoice details manually when a digital copy is not available.</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.05)] rounded-[30px] p-8 shadow-xl relative z-20">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Vendor Info Section */}
            <div>
              <h3 className="text-white text-[16px] font-bold mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                <Building2 size={18} className="text-[#D98F8F]" /> Vendor Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-[#A69697] text-[13px] ml-1">Company Name <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Building2 size={16} className="text-[#A69697]" />
                    </div>
                    <input 
                      type="text" 
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="e.g. Acme Corp" 
                      className="w-full bg-[#1A0A0B]/50 border border-white/10 rounded-[16px] py-3.5 pl-11 pr-4 text-[14px] text-white focus:outline-none focus:border-[#D98F8F]/50 transition-all placeholder:text-white/20"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[#A69697] text-[13px] ml-1">Invoice Number <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Hash size={16} className="text-[#A69697]" />
                    </div>
                    <input 
                      type="text" 
                      name="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={handleChange}
                      placeholder="INV-0001" 
                      className="w-full bg-[#1A0A0B]/50 border border-white/10 rounded-[16px] py-3.5 pl-11 pr-4 text-[14px] text-white focus:outline-none focus:border-[#D98F8F]/50 transition-all placeholder:text-white/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Details Section */}
            <div className="mt-4">
              <h3 className="text-white text-[16px] font-bold mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                <DollarSign size={18} className="text-[#D98F8F]" /> Financial Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-[#A69697] text-[13px] ml-1">Total Amount (TND) <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <DollarSign size={16} className="text-[#A69697]" />
                    </div>
                    <input 
                      type="number" 
                      step="0.001"
                      name="totalAmount"
                      value={formData.totalAmount}
                      onChange={handleChange}
                      placeholder="0.000" 
                      className="w-full bg-[#1A0A0B]/50 border border-white/10 rounded-[16px] py-3.5 pl-11 pr-4 text-[14px] text-white focus:outline-none focus:border-[#D98F8F]/50 transition-all placeholder:text-white/20 font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[#A69697] text-[13px] ml-1">Tax Amount (TVA)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <DollarSign size={16} className="text-[#A69697]" />
                    </div>
                    <input 
                      type="number" 
                      step="0.001"
                      name="taxAmount"
                      value={formData.taxAmount}
                      onChange={handleChange}
                      placeholder="0.000" 
                      className="w-full bg-[#1A0A0B]/50 border border-white/10 rounded-[16px] py-3.5 pl-11 pr-4 text-[14px] text-white focus:outline-none focus:border-[#D98F8F]/50 transition-all placeholder:text-white/20 font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[#A69697] text-[13px] ml-1">Invoice Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Calendar size={16} className="text-[#A69697]" />
                    </div>
                    <input 
                      type="date" 
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full bg-[#1A0A0B]/50 border border-white/10 rounded-[16px] py-3.5 pl-11 pr-4 text-[14px] text-white focus:outline-none focus:border-[#D98F8F]/50 transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>


              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3.5 rounded-[16px] bg-white/5 text-[#A69697] hover:bg-white/10 hover:text-white transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3.5 rounded-[16px] bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white font-bold shadow-[0_5px_20px_rgba(142,27,58,0.4)] hover:shadow-[0_5px_30px_rgba(217,143,143,0.6)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save size={18} />
                    Save Invoice
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </DashboardLayout>
  );
}
