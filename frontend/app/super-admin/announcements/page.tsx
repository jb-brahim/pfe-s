'use client';

import { Megaphone, Send, Info, AlertTriangle, XCircle, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState({ title: '', message: '', severity: 'info' });

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get('http://localhost:5000/api/super-admin/announcements', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.success) {
        setAnnouncements(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.message) return alert("Title and message are required.");
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('http://localhost:5000/api/super-admin/announcements', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForm({ title: '', message: '', severity: 'info' });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Failed to publish announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`http://localhost:5000/api/super-admin/announcements/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error toggling announcement:', error);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold text-white tracking-tight mb-1">System Announcements</h1>
        <p className="text-[13px] text-[#A69697]">
          Broadcast messages and banners to all tenant organizations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Composer */}
        <div className="bg-[#1A050A] border border-white/5 rounded-lg p-6 h-fit">
          <h2 className="text-[14px] font-semibold text-white mb-5 border-b border-white/5 pb-3">
            Draft New Announcement
          </h2>
          <form onSubmit={handlePublish} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-[#A69697] mb-1.5 uppercase tracking-wider">Announcement Title</label>
              <input 
                type="text" 
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                placeholder="e.g. Scheduled Maintenance"
                className="w-full px-3 py-2 rounded-md border outline-none text-[12px] transition-colors bg-[#1E0A0B] border-white/5 text-white focus:border-[#D98F8F]/50"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#A69697] mb-1.5 uppercase tracking-wider">Message Body</label>
              <textarea 
                rows={4}
                value={form.message}
                onChange={(e) => setForm({...form, message: e.target.value})}
                placeholder="Details of the announcement..."
                className="w-full px-3 py-2 rounded-md border outline-none text-[12px] transition-colors bg-[#1E0A0B] border-white/5 text-white focus:border-[#D98F8F]/50 resize-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#A69697] mb-1.5 uppercase tracking-wider">Severity / Type</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="severity" checked={form.severity === 'info'} onChange={() => setForm({...form, severity: 'info'})} className="accent-[#60A5FA]" />
                  <span className="text-[12px] text-white flex items-center gap-1"><Info size={14} className="text-blue-400"/> Info</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="severity" checked={form.severity === 'warning'} onChange={() => setForm({...form, severity: 'warning'})} className="accent-[#F59E0B]" />
                  <span className="text-[12px] text-white flex items-center gap-1"><AlertTriangle size={14} className="text-yellow-500"/> Warning</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="severity" checked={form.severity === 'critical'} onChange={() => setForm({...form, severity: 'critical'})} className="accent-[#EF4444]" />
                  <span className="text-[12px] text-white flex items-center gap-1"><XCircle size={14} className="text-red-500"/> Critical</span>
                </label>
              </div>
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium bg-[#D98F8F] text-[#1A050A] hover:bg-[#D98F8F]/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader size={14} className="animate-spin" /> : <Send size={14} />} 
              {isSubmitting ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </form>
        </div>

        {/* History */}
        <div className="bg-[#1A050A] border border-white/5 rounded-lg p-6">
          <h2 className="text-[14px] font-semibold text-white mb-5 border-b border-white/5 pb-3">
            Recent Announcements
          </h2>
          <div className="space-y-3">
            {isLoading ? (
              <div className="py-8 text-center"><Loader className="animate-spin text-[#A69697] mx-auto" size={20} /></div>
            ) : announcements.length === 0 ? (
              <div className="py-8 text-center text-[#A69697] text-[12px]">No announcements published yet.</div>
            ) : (
              announcements.map(a => (
                <div key={a._id} className="p-4 rounded-md border border-white/5 bg-[#1E0A0B]">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {a.severity === 'info' && <Info size={14} className="text-blue-400" />}
                      {a.severity === 'warning' && <AlertTriangle size={14} className="text-yellow-500" />}
                      {a.severity === 'critical' && <XCircle size={14} className="text-red-500" />}
                      <h3 className="text-[13px] font-medium text-white">{a.title}</h3>
                    </div>
                    <span className="text-[10px] text-[#A69697]">{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${a.active ? 'text-green-400' : 'text-[#A69697]'}`}>
                      {a.active ? 'Currently Active' : 'Archived'}
                    </span>
                    <button 
                      onClick={() => handleToggleActive(a._id)}
                      className="text-[11px] text-[#D98F8F] hover:text-white transition-colors"
                    >
                      {a.active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
