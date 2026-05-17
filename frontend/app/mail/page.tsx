'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Mail, Search, Paperclip, CheckCircle2, AlertCircle, FileText, ArrowRight, Clock, RefreshCw, Bot, ChevronRight, Zap, Loader, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { mailAPI } from '@/lib/api';

export default function MailScannerPage() {
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const result = await mailAPI.getAll();
        if (result.data && result.data.length > 0) {
          setEmails(result.data);
          setSelectedEmail(result.data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch emails:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmails();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
          <Loader size={32} className="animate-spin text-[#D98F8F]" />
        </div>
      </DashboardLayout>
    );
  }

  if (!selectedEmail) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-100px)] text-[#A69697]">
          No emails found.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 w-full pb-10 max-w-[1500px] mx-auto h-[calc(100vh-100px)]">
        
        {/* Header & n8n Status */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-[36px] font-bold tracking-tight mb-2 flex items-center gap-3 text-[#FFFFFF]">
              Email Ingestion Hub
            </h1>
            <p className="text-[#A69697] text-[16px]">Automated n8n webhook scanner. Detects incoming emails, extracts attachments, and feeds them to the AI.</p>
          </div>
          
          {/* n8n Status Widget */}
          <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-white/10 rounded-[16px] p-1 flex items-center gap-1 shadow-lg">
            <div className="bg-[#1A0A0B] rounded-[12px] px-4 py-2 flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#4CAF50] opacity-30 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4CAF50]"></span>
              </div>
              <span className="text-[#FFFFFF] text-[13px] font-bold tracking-wide">n8n Webhook Active</span>
            </div>
            <div className="px-4 py-2 flex items-center gap-2 text-[#A69697] text-[13px]">
              <RefreshCw size={14} className="animate-[spin_4s_linear_infinite]" />
              Listening...
            </div>
          </div>
        </div>

        {/* Main Interface Layout */}
        <div className="flex-1 min-h-0 bg-[rgba(255,255,255,0.02)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.1)] rounded-[30px] shadow-2xl overflow-hidden flex relative">
          
          {/* LEFT: Email Inbox List */}
          <div className="w-[400px] border-r border-white/10 flex flex-col bg-[#1A0A0B]/50 shrink-0">
            {/* Search */}
            <div className="p-4 border-b border-white/5 shrink-0">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A69697]" />
                <input
                  type="text"
                  placeholder="Search scanned emails..."
                  className="w-full bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-[13px] text-[#FFFFFF] outline-none focus:border-[#D98F8F]/50 transition-all placeholder:text-[#A69697]"
                />
              </div>
            </div>

            {/* Email List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {emails.map((email) => (
                <div 
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`p-5 cursor-pointer transition-all border-l-4 ${
                    selectedEmail.id === email.id 
                      ? 'bg-[rgba(255,255,255,0.05)] border-l-[#D98F8F]' 
                      : 'border-l-transparent hover:bg-[rgba(255,255,255,0.02)] border-b border-b-white/5'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[#FFFFFF] font-bold text-[15px] truncate pr-2">{email.name}</span>
                    <span className="text-[#A69697] text-[11px] whitespace-nowrap">{email.date}</span>
                  </div>
                  <h4 className="text-[#EBD8D8] text-[13px] font-medium mb-2 truncate">{email.subject}</h4>
                  <p className="text-[#A69697] text-[12px] line-clamp-2 leading-relaxed mb-3">
                    {email.snippet}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-auto">
                    {email.hasAttachment && (
                      <div className="bg-white/5 border border-white/10 text-[#A69697] px-2 py-0.5 rounded-[6px] text-[10px] flex items-center gap-1">
                        <Paperclip size={10} /> 1 PDF
                      </div>
                    )}
                    
                    {email.status === 'extracted' && (
                      <div className="bg-[#4CAF50]/10 border border-[#4CAF50]/30 text-[#4CAF50] px-2 py-0.5 rounded-[6px] text-[10px] font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(76,175,80,0.1)]">
                        <CheckCircle2 size={10} /> Extracted
                      </div>
                    )}
                    {email.status === 'processing' && (
                      <div className="bg-[#FFC107]/10 border border-[#FFC107]/30 text-[#FFC107] px-2 py-0.5 rounded-[6px] text-[10px] font-bold flex items-center gap-1">
                        <Loader size={10} className="animate-spin" /> Scanning
                      </div>
                    )}
                    {email.status === 'ignored' && (
                      <div className="bg-white/5 border border-white/10 text-[#A69697] px-2 py-0.5 rounded-[6px] text-[10px] font-bold flex items-center gap-1">
                        Ignored (No Invoice)
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Email Details & n8n Logs */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#8E1B3A]/10 to-transparent">
            
            {/* Action Bar */}
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-8 shrink-0">
              <div className="flex items-center gap-4 text-[#A69697]">
                <button className="hover:text-white transition-colors"><Mail size={18} /></button>
                <button className="hover:text-white transition-colors"><Trash2 size={18} /></button>
              </div>
              <div className="text-[12px] text-[#A69697] font-medium flex items-center gap-2">
                Processed via n8n <Bot size={16} className="text-[#D98F8F]" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
              {/* Email Headers */}
              <div className="mb-8">
                <h2 className="text-[24px] font-bold text-[#FFFFFF] mb-6 tracking-tight">{selectedEmail.subject}</h2>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D98F8F] to-[#8E1B3A] flex items-center justify-center text-[#FFFFFF] font-bold shadow-lg">
                      {selectedEmail.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[#FFFFFF] text-[14px] font-bold">{selectedEmail.name}</p>
                      <p className="text-[#A69697] text-[12px]">&lt;{selectedEmail.sender}&gt;</p>
                    </div>
                  </div>
                  <div className="text-[#A69697] text-[12px] flex items-center gap-1">
                    <Clock size={12} /> {selectedEmail.date}
                  </div>
                </div>
              </div>

              {/* Email Body */}
              <div className="text-[#EBD8D8] text-[14px] leading-relaxed whitespace-pre-wrap bg-[rgba(0,0,0,0.2)] p-6 rounded-[20px] border border-white/5 mb-8">
                {selectedEmail.body}
              </div>

              {/* Attachment Zone */}
              {selectedEmail.hasAttachment && (
                <div className="mb-8">
                  <h3 className="text-[#FFFFFF] text-[14px] font-bold mb-3 flex items-center gap-2">
                    <Paperclip size={16} className="text-[#D98F8F]" /> Attachments (1)
                  </h3>
                  <div className="inline-flex items-center gap-4 bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-[16px] p-3 pr-6 hover:bg-[rgba(255,255,255,0.05)] transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-[12px] bg-[#8E1B3A]/20 flex items-center justify-center group-hover:bg-[#8E1B3A]/40 transition-colors">
                      <FileText className="text-[#D98F8F]" size={20} />
                    </div>
                    <div>
                      <p className="text-[#FFFFFF] text-[13px] font-medium group-hover:text-[#D98F8F] transition-colors">invoice_document.pdf</p>
                      <p className="text-[#A69697] text-[11px]">1.2 MB</p>
                    </div>
                  </div>
                </div>
              )}

              {/* n8n Automation Log Console */}
              <div className="mt-auto">
                <div className="bg-[#1A0A0B] rounded-[24px] border border-[#D98F8F]/20 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                  <div className="bg-[#8E1B3A]/10 border-b border-[#D98F8F]/20 px-6 py-3 flex items-center justify-between">
                    <h3 className="text-[#D98F8F] text-[13px] font-bold flex items-center gap-2 uppercase tracking-widest">
                      <Zap size={14} className="animate-pulse" /> n8n Automation Log
                    </h3>
                    <span className="text-[#A69697] text-[11px] font-mono">Job #882-XQ</span>
                  </div>
                  
                  <div className="p-6 font-mono text-[12px] space-y-3">
                    <div className="flex gap-4">
                      <span className="text-[#A69697]">[{selectedEmail.date}]</span>
                      <span className="text-white">Webhook triggered. Email received from <span className="text-[#D98F8F]">{selectedEmail.sender}</span></span>
                    </div>
                    
                    {selectedEmail.hasAttachment ? (
                      <>
                        <div className="flex gap-4">
                          <span className="text-[#A69697]">[{selectedEmail.date}]</span>
                          <span className="text-[#4CAF50]">Attachment detected: invoice_document.pdf</span>
                        </div>
                        <div className="flex gap-4">
                          <span className="text-[#A69697]">[{selectedEmail.date}]</span>
                          <span className="text-white">Pushing PDF to Aura AI Vision Engine...</span>
                        </div>
                        
                        {selectedEmail.status === 'extracted' ? (
                          <>
                            <div className="flex gap-4">
                              <span className="text-[#A69697]">[{selectedEmail.date}]</span>
                              <span className="text-[#4CAF50] font-bold">SUCCESS: Data extracted accurately.</span>
                            </div>
                            <div className="flex gap-4 mt-4 pt-4 border-t border-white/5">
                              <Link href={`/invoices/${selectedEmail.invoiceId}`} className="text-[#1A0A0B] bg-[#D98F8F] hover:bg-white transition-colors px-4 py-2 rounded-full font-sans font-bold text-[13px] flex items-center gap-2">
                                View Created Invoice <ArrowRight size={14} />
                              </Link>
                            </div>
                          </>
                        ) : (
                          <div className="flex gap-4">
                            <span className="text-[#A69697]">[{selectedEmail.date}]</span>
                            <span className="text-[#FFC107] animate-pulse">PROCESSING: AI is scanning document...</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex gap-4">
                        <span className="text-[#A69697]">[{selectedEmail.date}]</span>
                        <span className="text-[#A69697]">No attachments found. Ignoring email. Workflow terminated.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
          
        </div>

      </div>
    </DashboardLayout>
  );
}
