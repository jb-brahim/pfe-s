'use client';

import { useState, useEffect } from 'react';
import { messageAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Mail, Send, X, Inbox } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function SuperAdminMessagesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'inbox' | 'outbox'>('inbox');
  const [messages, setMessages] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeForm, setComposeForm] = useState({
    receiverIds: [] as string[],
    subject: '',
    body: ''
  });
  const [sending, setSending] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

  useEffect(() => {
    fetchMessages();
    fetchContacts();
  }, [activeTab]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'inbox') {
        const res = await messageAPI.getInbox();
        setMessages(res.data || []);
      } else {
        const res = await messageAPI.getOutbox();
        setMessages(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await messageAPI.getContacts();
      setContacts(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (composeForm.receiverIds.length === 0 || !composeForm.subject || !composeForm.body) {
      toast.error('Please fill all fields and select at least one recipient.');
      return;
    }
    
    setSending(true);
    try {
      await messageAPI.sendMessage(composeForm.receiverIds, composeForm.subject, composeForm.body);
      toast.success('Message sent successfully!');
      setIsComposeOpen(false);
      setComposeForm({ receiverIds: [], subject: '', body: '' });
      if (activeTab === 'outbox') fetchMessages();
    } catch (err) {
      toast.error('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const openMessage = async (msg: any) => {
    setSelectedMessage(msg);
    if (activeTab === 'inbox' && !msg.isRead) {
      await messageAPI.markAsRead(msg._id);
      setMessages(messages.map(m => m._id === msg._id ? { ...m, isRead: true } : m));
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full max-w-[1200px] mx-auto bg-[#1A050A] border border-white/5 rounded-[24px] shadow-2xl overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/5">
        <div>
          <h1 className="text-[24px] font-bold text-white flex items-center gap-2">
            <Mail className="text-[#D98F8F]" size={24} /> Administrator Inbox
          </h1>
          <p className="text-[#A69697] text-[13px] mt-1">Communicate with company admins across the platform.</p>
        </div>
        <button 
          onClick={() => setIsComposeOpen(true)}
          className="bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white px-5 py-2.5 rounded-[12px] text-[14px] font-bold shadow-lg hover:shadow-[0_0_15px_rgba(217,143,143,0.4)] transition-all flex items-center gap-2"
        >
          <Send size={16} /> Compose Broadcast
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-[200px] border-r border-white/5 flex flex-col p-4 gap-2 bg-[#1A0A0B]/30">
          <button
            onClick={() => { setActiveTab('inbox'); setSelectedMessage(null); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-[14px] font-medium ${
              activeTab === 'inbox' ? 'bg-[#D98F8F]/20 text-white' : 'text-[#A69697] hover:text-white hover:bg-white/5'
            }`}
          >
            <Inbox size={18} className={activeTab === 'inbox' ? 'text-[#D98F8F]' : ''} /> Inbox
          </button>
          <button
            onClick={() => { setActiveTab('outbox'); setSelectedMessage(null); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-[14px] font-medium ${
              activeTab === 'outbox' ? 'bg-[#D98F8F]/20 text-white' : 'text-[#A69697] hover:text-white hover:bg-white/5'
            }`}
          >
            <Send size={18} className={activeTab === 'outbox' ? 'text-[#D98F8F]' : ''} /> Sent
          </button>
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedMessage ? (
            // Message View
            <div className="flex-1 p-6 overflow-y-auto">
              <button onClick={() => setSelectedMessage(null)} className="text-[#A69697] hover:text-white text-[13px] flex items-center gap-1 mb-6">
                &larr; Back to {activeTab}
              </button>
              <div className="bg-[#1A0A0B]/50 p-6 rounded-2xl border border-white/5">
                <h2 className="text-[20px] font-bold text-white mb-4">{selectedMessage.subject}</h2>
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#8E1B3A] flex items-center justify-center text-white font-bold">
                      {activeTab === 'inbox' 
                        ? (selectedMessage.sender?.name?.charAt(0) || 'U') 
                        : (selectedMessage.receiver?.name?.charAt(0) || 'U')}
                    </div>
                    <div>
                      <p className="text-white text-[14px] font-medium">
                        {activeTab === 'inbox' ? selectedMessage.sender?.name : `To: ${selectedMessage.receiver?.name}`}
                      </p>
                      <p className="text-[#A69697] text-[12px]">
                        {activeTab === 'inbox' ? selectedMessage.sender?.email : selectedMessage.receiver?.email}
                      </p>
                    </div>
                  </div>
                  <span className="text-[#A69697] text-[12px]">
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="text-white text-[14px] whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.body}
                </div>
              </div>
            </div>
          ) : (
            // Message List
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center p-10"><span className="text-[#A69697]">Loading...</span></div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center p-10"><span className="text-[#A69697]">No messages found.</span></div>
              ) : (
                messages.map(msg => (
                  <div 
                    key={msg._id} 
                    onClick={() => openMessage(msg)}
                    className={`flex items-center justify-between p-4 border-b border-white/5 cursor-pointer transition-colors ${
                      activeTab === 'inbox' && !msg.isRead ? 'bg-white/[0.04] hover:bg-white/[0.08]' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1 overflow-hidden">
                      {activeTab === 'inbox' && !msg.isRead && (
                        <div className="w-2 h-2 rounded-full bg-[#D98F8F] flex-shrink-0" />
                      )}
                      <div className="w-8 h-8 rounded-full bg-[#3C0D0D] flex items-center justify-center text-white flex-shrink-0 text-[12px] font-bold">
                        {activeTab === 'inbox' 
                          ? (msg.sender?.name?.charAt(0) || 'U') 
                          : (msg.receiver?.name?.charAt(0) || 'U')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[14px] truncate ${activeTab === 'inbox' && !msg.isRead ? 'text-white font-bold' : 'text-[#A69697]'}`}>
                          {activeTab === 'inbox' ? msg.sender?.name : `To: ${msg.receiver?.name}`}
                        </p>
                        <p className={`text-[13px] truncate ${activeTab === 'inbox' && !msg.isRead ? 'text-white' : 'text-[#A69697]'}`}>
                          {msg.subject}
                        </p>
                      </div>
                    </div>
                    <span className="text-[#A69697] text-[11px] whitespace-nowrap ml-4">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A050A] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl p-6 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[18px] font-bold text-white flex items-center gap-2">
                <Send size={18} className="text-[#D98F8F]" /> Compose Broadcast
              </h2>
              <button onClick={() => setIsComposeOpen(false)} className="text-[#A69697] hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="flex flex-col gap-4 overflow-y-auto pr-2">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[#A69697] text-[13px]">To:</label>
                  <button 
                    type="button"
                    onClick={() => {
                      if (composeForm.receiverIds.length === contacts.length) {
                        setComposeForm({ ...composeForm, receiverIds: [] });
                      } else {
                        setComposeForm({ ...composeForm, receiverIds: contacts.map(c => c._id) });
                      }
                    }}
                    className="text-[#D98F8F] text-[11px] hover:underline"
                  >
                    Toggle All Admins
                  </button>
                </div>
                <div className="bg-[#1A0A0B]/50 border border-white/10 rounded-xl max-h-[150px] overflow-y-auto p-2">
                  {contacts.map(c => (
                    <label key={c._id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={composeForm.receiverIds.includes(c._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setComposeForm({ ...composeForm, receiverIds: [...composeForm.receiverIds, c._id] });
                          } else {
                            setComposeForm({ ...composeForm, receiverIds: composeForm.receiverIds.filter(id => id !== c._id) });
                          }
                        }}
                        className="rounded border-white/10 bg-[#1A0A0B] text-[#D98F8F]"
                      />
                      <span className="text-white text-[13px]">{c.name}</span>
                      <span className="text-[#A69697] text-[11px]">({c.companyDetails?.name || 'Admin'})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[#A69697] text-[13px] mb-1 block">Subject:</label>
                <input 
                  type="text" 
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                  className="w-full bg-[#1A0A0B]/50 border border-white/10 rounded-xl py-2 px-3 text-white text-[14px] outline-none focus:border-[#D98F8F]" 
                  placeholder="Enter subject"
                />
              </div>

              <div className="flex-1 min-h-[200px]">
                <label className="text-[#A69697] text-[13px] mb-1 block">Message:</label>
                <textarea 
                  value={composeForm.body}
                  onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })}
                  className="w-full h-[200px] bg-[#1A0A0B]/50 border border-white/10 rounded-xl py-3 px-3 text-white text-[14px] outline-none focus:border-[#D98F8F] resize-none" 
                  placeholder="Type your message here..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setIsComposeOpen(false)}
                  className="px-5 py-2 rounded-xl text-white bg-white/5 hover:bg-white/10 transition-colors text-[14px] font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={sending}
                  className="px-6 py-2 rounded-xl text-white bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] shadow-lg hover:opacity-90 transition-opacity text-[14px] font-bold flex items-center gap-2"
                >
                  {sending ? 'Sending...' : <><Send size={16} /> Send Message</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
