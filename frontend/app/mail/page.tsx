'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Mail, Search, Paperclip, CheckCircle2, AlertCircle, FileText, ArrowRight, Clock, RefreshCw, Bot, ChevronRight, Zap, Loader, Trash2, Inbox, Archive, Star, Share, MoreHorizontal, Download, Eye, Tag, User, Phone, Calendar, DollarSign, Percent, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import { mailAPI, invoiceAPI } from '@/lib/api';

export default function MailScannerPage() {
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'invoices', 'archived'
  
  // Local state for actions not supported by backend yet
  const [starredEmails, setStarredEmails] = useState<string[]>([]);
  const [archivedEmails, setArchivedEmails] = useState<string[]>([]);

  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      const result = await mailAPI.getAll();
      if (result.data && result.data.length > 0) {
        const normalized = result.data.map((email: any) => ({
          ...email,
          id: email._id || email.id
        }));
        setEmails(normalized);
        setSelectedEmail(normalized[0]);
      } else {
        setEmails([]);
        setSelectedEmail(null);
      }
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      if (selectedEmail && selectedEmail.invoiceId) {
        setIsLoadingInvoice(true);
        try {
          const res = await invoiceAPI.getById(selectedEmail.invoiceId);
          setSelectedInvoice(res.data);
        } catch (error) {
          console.error('Failed to fetch invoice:', error);
          setSelectedInvoice(null);
        } finally {
          setIsLoadingInvoice(false);
        }
      } else {
        setSelectedInvoice(null);
      }
    };

    fetchInvoiceDetails();
  }, [selectedEmail]);

  const toggleStar = (id: string) => {
    setStarredEmails(prev => 
      prev.includes(id) ? prev.filter(emailId => emailId !== id) : [...prev, id]
    );
  };

  const toggleArchive = (id: string) => {
    setArchivedEmails(prev => 
      prev.includes(id) ? prev.filter(emailId => emailId !== id) : [...prev, id]
    );
    // If we archive the selected email and we are in 'all' view, deselect it or select next
    if (selectedEmail?.id === id && filter === 'all') {
      const nextEmail = filteredEmails.find(e => e.id !== id);
      setSelectedEmail(nextEmail || null);
    }
  };

  const filteredEmails = emails.filter(email => {
    const isArchived = archivedEmails.includes(email.id);
    
    if (filter === 'archived') return isArchived;
    if (isArchived) return false; // Hide archived emails in other views
    
    if (filter === 'all') return true;
    if (filter === 'invoices') return email.status === 'extracted';
    return true;
  });

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-64px)] bg-[#0d0507]">
        
        {/* Left Sidebar - Categories */}
        <div className="w-64 border-r border-[#2d1217] bg-[#14070a] p-4 flex flex-col gap-2 shrink-0">
          <div className="font-semibold text-white text-sm mb-2 px-2">Mailboxes</div>
          <button 
            onClick={() => setFilter('all')}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-[#2d1217] text-white' : 'text-[#a38f93] hover:bg-[#2d1217]/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Inbox size={16} className={filter === 'all' ? 'text-[#a38f93]' : 'text-[#5c3a40]'} />
              <span>All Mails</span>
            </div>
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${
              filter === 'all' ? 'bg-[#421d24] text-white' : 'bg-[#2d1217] text-[#a38f93]'
            }`}>{emails.filter(e => !archivedEmails.includes(e.id)).length}</span>
          </button>
          <button 
            onClick={() => setFilter('invoices')}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'invoices' ? 'bg-[#2d1217] text-white' : 'text-[#a38f93] hover:bg-[#2d1217]/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Tag size={16} className={filter === 'invoices' ? 'text-[#a38f93]' : 'text-[#5c3a40]'} />
              <span>Invoices</span>
            </div>
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${
              filter === 'invoices' ? 'bg-[#421d24] text-white' : 'bg-[#2d1217] text-[#a38f93]'
            }`}>
              {emails.filter(e => e.status === 'extracted' && !archivedEmails.includes(e.id)).length}
            </span>
          </button>
          <button 
            onClick={() => setFilter('archived')}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'archived' ? 'bg-[#2d1217] text-white' : 'text-[#a38f93] hover:bg-[#2d1217]/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Archive size={16} className={filter === 'archived' ? 'text-[#a38f93]' : 'text-[#5c3a40]'} />
              <span>Archived</span>
            </div>
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${
              filter === 'archived' ? 'bg-[#421d24] text-white' : 'bg-[#2d1217] text-[#a38f93]'
            }`}>{archivedEmails.length}</span>
          </button>
          
          <div className="mt-6 font-semibold text-white text-sm mb-2 px-2">Automation</div>
          <div className="bg-[#2d1217]/30 border border-[#2d1217] rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#e0c3c7]">n8n Status</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[11px] text-[#8c6d73]">Webhook listener active and waiting for incoming emails.</p>
          </div>
        </div>

        {/* Middle Pane - Email List */}
        <div className="w-[420px] border-r border-[#2d1217] bg-[#14070a] flex flex-col shrink-0">
          {/* List Header */}
          <div className="p-4 border-b border-[#2d1217]">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-white">Inbox</h1>
              <button 
                onClick={fetchEmails}
                className="text-[#a38f93] hover:text-white transition-colors p-1.5 hover:bg-[#2d1217] rounded-full"
                title="Refresh"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>
            
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c3a40]" />
              <input
                type="text"
                placeholder="Search by sender or subject..."
                className="w-full bg-[#1c0c0e] border border-[#2d1217] rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder-[#5c3a40] focus:outline-none focus:border-[#421d24] transition-colors"
              />
            </div>
          </div>

          {/* Email List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {isLoading && filteredEmails.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[#a38f93] gap-2">
                <Loader size={24} className="animate-spin text-[#421d24]" />
                <span className="text-sm font-medium">Loading emails...</span>
              </div>
            ) : filteredEmails.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[#a38f93] gap-3 p-6">
                <Inbox size={40} strokeWidth={1} className="text-[#421d24]" />
                <div className="text-center">
                  <p className="text-sm font-semibold text-white">No emails found</p>
                  <p className="text-xs text-[#8c6d73] mt-1">Invoices sent to your tracking email will appear here.</p>
                </div>
              </div>
            ) : (
              filteredEmails.map((email) => (
                <div 
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`p-4 cursor-pointer transition-colors border-b border-[#2d1217] flex flex-col gap-1 relative ${
                    selectedEmail?.id === email.id 
                      ? 'bg-[#2d1217]/50' 
                      : 'hover:bg-[#2d1217]/20'
                  }`}
                >
                  {selectedEmail?.id === email.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#e64980]"></div>
                  )}
                  <div className="flex justify-between items-baseline">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#421d24] flex items-center justify-center text-white font-bold text-xs">
                        {(email.name || email.sender).charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-semibold text-sm truncate max-w-[180px]">
                        {email.name || email.sender}
                      </span>
                    </div>
                    <span className="text-[#8c6d73] text-xs whitespace-nowrap">
                      {email.date || 'Just now'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <h4 className="text-[#e0c3c7] text-xs font-medium truncate">{email.subject}</h4>
                    {starredEmails.includes(email.id) && (
                      <Star size={12} className="text-amber-400 fill-amber-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[#a38f93] text-xs line-clamp-2 leading-relaxed mt-0.5">
                    {email.snippet || email.body}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    {email.hasAttachment && (
                      <div className="bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                        <Paperclip size={10} /> PDF
                      </div>
                    )}
                    
                    {email.status === 'extracted' && (
                      <div className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 size={10} /> Extracted
                      </div>
                    )}
                    {email.status === 'processing' && (
                      <div className="bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                        <Loader size={10} className="animate-spin" /> Processing
                      </div>
                    )}
                    {email.status === 'ignored' && (
                      <div className="bg-[#421d24] text-[#e0c3c7] px-1.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                        Ignored
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Pane - Email Details */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0d0507]">
          {selectedEmail ? (
            <>
              {/* Action Bar */}
              <div className="h-14 border-b border-[#2d1217] flex items-center justify-between px-6 shrink-0 bg-[#14070a]">
                <div className="flex items-center gap-2">
                  <button className="text-[#a38f93] hover:bg-[#2d1217] p-2 rounded-lg transition-colors" title="Back">
                    <ArrowRight size={18} className="rotate-180" />
                  </button>
                  <div className="h-6 w-px bg-[#2d1217] mx-1"></div>
                  <button 
                    onClick={() => toggleArchive(selectedEmail.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      archivedEmails.includes(selectedEmail.id) ? 'text-[#e64980] bg-[#2d1217]' : 'text-[#a38f93] hover:bg-[#2d1217]'
                    }`}
                    title="Archive"
                  >
                    <Archive size={18} />
                  </button>
                  <button 
                    onClick={() => toggleStar(selectedEmail.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      starredEmails.includes(selectedEmail.id) ? 'text-amber-400 bg-[#2d1217]' : 'text-[#a38f93] hover:bg-[#2d1217]'
                    }`}
                    title="Star"
                  >
                    <Star size={18} fill={starredEmails.includes(selectedEmail.id) ? 'currentColor' : 'none'} />
                  </button>
                  <button className="text-[#a38f93] hover:bg-[#2d1217] p-2 rounded-lg transition-colors" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-[#8c6d73] font-medium flex items-center gap-1.5">
                    <Bot size={14} className="text-[#5c3a40]" /> Processed via n8n
                  </div>
                  <button className="text-[#a38f93] hover:bg-[#2d1217] p-2 rounded-lg transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>

              {/* Email Content */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                
                {/* Main Email Card */}
                <div className="bg-[#14070a] border border-[#2d1217] rounded-xl shadow-sm p-6 mb-6">
                  {/* Email Headers */}
                  <div className="mb-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-2xl font-bold text-white tracking-tight">{selectedEmail.subject}</h2>
                      {selectedEmail.status === 'extracted' && (
                        <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={12} /> Auto-categorized by AI
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-start justify-between border-t border-b border-[#2d1217] py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#2d1217] flex items-center justify-center text-white font-bold text-sm">
                          {(selectedEmail.name || selectedEmail.sender).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">{selectedEmail.name || 'Unknown'}</p>
                          <p className="text-[#a38f93] text-xs">&lt;{selectedEmail.sender}&gt;</p>
                        </div>
                      </div>
                      <div className="text-[#8c6d73] text-xs flex flex-col items-end gap-1">
                        <span className="font-medium text-[#e0c3c7]">{selectedEmail.date || 'Recent'}</span>
                        <div className="flex items-center gap-1 text-[#5c3a40]">
                          <Clock size={12} /> Received
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email Body */}
                  <div className="text-[#e0c3c7] text-sm leading-relaxed whitespace-pre-wrap font-sans mb-6">
                    {selectedEmail.body}
                  </div>

                  {/* Attachment Zone */}
                  {selectedEmail.hasAttachment && (
                    <div className="border-t border-[#2d1217] pt-6">
                      <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-1.5">
                        <Paperclip size={14} className="text-[#a38f93]" /> Attachments (1)
                      </h3>
                      <div className="inline-flex items-center justify-between gap-4 bg-[#1c0c0e] border border-[#2d1217] rounded-lg p-3 pr-4 hover:bg-[#2d1217]/50 transition-colors cursor-pointer group w-full max-w-md">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium group-hover:text-white transition-colors">invoice_document.pdf</p>
                            <p className="text-[#8c6d73] text-xs">1.2 MB</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[#a38f93]">
                          <button className="p-1.5 hover:bg-[#2d1217] rounded-md transition-colors" title="Download (Click to View)">
                            <Link href={selectedEmail.invoiceId ? `/invoices/${selectedEmail.invoiceId}` : '#'}>
                              <Download size={16} />
                            </Link>
                          </button>
                          <button className="p-1.5 hover:bg-[#2d1217] rounded-md transition-colors" title="View Profile">
                            <Link href={selectedEmail.invoiceId ? `/invoices/${selectedEmail.invoiceId}` : '#'}>
                              <Eye size={16} />
                            </Link>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Extracted Information Section */}
                <div className="bg-[#14070a] border border-[#2d1217] rounded-xl shadow-sm p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white text-sm font-semibold flex items-center gap-1.5">
                      <Zap size={14} className="text-[#e64980]" /> AI Extracted Information
                    </h3>
                    {selectedInvoice && (
                      <span className="text-[#e64980] text-xs font-semibold hover:underline cursor-pointer">
                        Show Raw Data
                      </span>
                    )}
                  </div>

                  {isLoadingInvoice ? (
                    <div className="flex items-center justify-center py-6 text-[#a38f93] text-sm gap-2">
                      <Loader size={16} className="animate-spin" />
                      Loading extracted data...
                    </div>
                  ) : selectedInvoice ? (
                    <div className="grid grid-cols-2 gap-4">
                      {/* Grid Items */}
                      <div className="bg-[#1c0c0e] p-3 rounded-lg flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                          <Tag size={16} />
                        </div>
                        <div>
                          <p className="text-[#8c6d73] text-[11px] font-medium uppercase">Invoice Number</p>
                          <p className="text-white text-sm font-bold">{selectedInvoice.invoiceNumber}</p>
                        </div>
                      </div>
                      
                      <div className="bg-[#1c0c0e] p-3 rounded-lg flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="text-[#8c6d73] text-[11px] font-medium uppercase">Company Name</p>
                          <p className="text-white text-sm font-bold">{selectedInvoice.companyName}</p>
                        </div>
                      </div>

                      <div className="bg-[#1c0c0e] p-3 rounded-lg flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400">
                          <Percent size={16} />
                        </div>
                        <div>
                          <p className="text-[#8c6d73] text-[11px] font-medium uppercase">TVA Amount</p>
                          <p className="text-white text-sm font-bold">{selectedInvoice.taxAmount?.toLocaleString('fr-FR')} TND</p>
                        </div>
                      </div>

                      <div className="bg-[#1c0c0e] p-3 rounded-lg flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                          <Calendar size={16} />
                        </div>
                        <div>
                          <p className="text-[#8c6d73] text-[11px] font-medium uppercase">Date</p>
                          <p className="text-white text-sm font-bold">{selectedInvoice.extractedData?.date ? new Date(selectedInvoice.extractedData.date).toLocaleDateString('fr-FR') : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-[#a38f93] text-sm">
                      <p>No extraction data available for this email.</p>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="bg-[#14070a] border border-[#2d1217] rounded-xl shadow-sm p-6">
                  <h3 className="text-white text-sm font-semibold mb-4">Quick Actions</h3>
                  <div className="flex gap-3">
                    {selectedEmail.invoiceId && (
                      <Link href={`/invoices/${selectedEmail.invoiceId}`} className="flex-1 bg-[#e64980] text-white hover:bg-[#d6336c] transition-colors py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                        View Invoice Profile <ArrowRight size={14} />
                      </Link>
                    )}
                    <button className="flex-1 border border-[#2d1217] text-[#e0c3c7] hover:bg-[#1c0c0e] transition-colors py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                      Mark as Reviewed
                    </button>
                    <button className="border border-[#fa5252]/20 text-[#fa5252] hover:bg-[#fa5252]/10 transition-colors px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[#a38f93] gap-3">
              <Mail size={40} strokeWidth={1} className="text-[#2d1217]" />
              <div className="text-center">
                <p className="text-sm font-semibold text-white">No email selected</p>
                <p className="text-xs text-[#8c6d73] mt-1">Select an email from the list to view details.</p>
              </div>
            </div>
          )}
        </div>
        
      </div>
    </DashboardLayout>
  );
}
