'use client';

import { Upload, Camera, FileText, CheckCircle2, Clock, XCircle, ChevronRight, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { invoiceAPI } from '@/lib/api';
import Link from 'next/link';

export default function DeliveryDashboard() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await invoiceAPI.uploadFile(file);
      setUploadSuccess(true);
      await fetchInvoices(); // Refresh list to show new pending invoice
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setIsUploading(false);
      // Reset inputs
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  // Helper to map DB status to UI state
  const getStatusUI = (status: string) => {
    if (status === 'APPROVED') return 'approved';
    if (status === 'REJECTED') return 'rejected';
    return 'pending'; // DRAFT, SUBMITTED, EXTRACTED all count as pending for delivery
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      
      {/* Upload Section - Mobile Optimized */}
      <section className="glass-card overflow-hidden">
        <div className="p-6 md:p-8 relative z-10 flex flex-col items-center justify-center text-center">
          
          {uploadSuccess ? (
             <div className="py-8 flex flex-col items-center animate-in fade-in zoom-in duration-300">
               <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4 border border-green-500/30">
                 <CheckCircle2 size={32} />
               </div>
               <h2 className="text-[20px] font-bold text-white mb-2">Upload Successful!</h2>
               <p className="text-[#A69697] text-sm">Invoice sent to Aura AI for processing.</p>
             </div>
          ) : isUploading ? (
             <div className="py-12 flex flex-col items-center">
               <div className="w-12 h-12 border-4 border-[#8E1B3A]/30 border-t-[#8E1B3A] rounded-full animate-spin mb-4"></div>
               <h2 className="text-[18px] font-bold text-white mb-1">Processing...</h2>
               <p className="text-[#A69697] text-sm">Uploading document securely</p>
             </div>
          ) : (
             <>
                <div className="w-16 h-16 bg-white/[0.05] border border-white/10 text-[#D98F8F] rounded-full flex items-center justify-center mb-4">
                  <Camera size={28} />
                </div>
                <h2 className="text-[22px] font-bold text-white mb-2">Capture Invoice</h2>
                <p className="text-[#A69697] text-sm mb-8">
                  Take a clear photo of the receipt. No data entry required.
                </p>
                
                <div className="flex flex-col gap-3 w-full">
                   <button 
                     onClick={() => cameraInputRef.current?.click()}
                     className="w-full bg-[#8E1B3A] text-white py-4 rounded-xl font-bold text-[15px] hover:bg-[#7B112C] transition-colors flex items-center justify-center gap-2"
                   >
                     <Camera size={20} /> Take Photo
                   </button>
                   <button 
                     onClick={() => fileInputRef.current?.click()}
                     className="w-full bg-white/[0.05] border border-white/10 text-white py-4 rounded-xl font-bold text-[15px] hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                   >
                     <ImageIcon size={20} /> Choose from Library
                   </button>
                   
                   {/* Hidden inputs */}
                   <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileUpload} />
                   <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf" onChange={handleFileUpload} />
                </div>
             </>
          )}

        </div>
      </section>

      {/* Info Banner */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="text-[#D98F8F] shrink-0 mt-0.5" size={18} />
        <div>
          <p className="text-white text-sm font-bold mb-0.5">Lighting Tips</p>
          <p className="text-[#A69697] text-xs leading-relaxed">
            Aura extracts data faster when shadows are minimized. Lay receipts flat on a dark surface.
          </p>
        </div>
      </div>

      {/* Recent History */}
      <section className="pt-2">
        <div className="flex justify-between items-end mb-4 px-1">
          <h3 className="text-[16px] font-bold text-white">Recent Uploads</h3>
          <Link href="/delivery/history" className="text-[12px] font-medium text-[#D98F8F] hover:text-white transition-colors flex items-center gap-1">
            View All <ChevronRight size={14} />
          </Link>
        </div>

        <div className="space-y-2">
          {invoices.length === 0 ? (
            <p className="text-[#A69697] text-[13px] text-center py-4">No recent uploads</p>
          ) : (
            invoices.slice(0, 4).map((item) => {
              const uiStatus = getStatusUI(item.status);
              
              return (
                <div key={item._id} className="glass-card p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/[0.05] rounded-lg flex items-center justify-center border border-white/5">
                      <FileText className="text-[#A69697]" size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-white text-[14px] truncate max-w-[140px]">
                        {item.fileUrl ? item.fileUrl.split('/').pop() : `Invoice #${item.invoiceNumber || 'Pending'}`}
                      </p>
                      <p className="text-[#A69697] text-[11px] flex items-center gap-1 mt-0.5">
                        <Clock size={10}/> {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
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
                      <div className="flex flex-col items-end">
                        <span className="badge-error">
                          <XCircle size={12} /> Rejected
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

    </div>
  );
}
