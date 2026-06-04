'use client';

import { Megaphone, Send, Info, AlertTriangle, XCircle, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '@/lib/i18n-context';

export default function AnnouncementsPage() {
  const { t } = useLanguage();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState({ 
    title: '', 
    message: '', 
    severity: 'info',
    targetAudience: 'ALL',
    targetUsers: [] as string[]
  });

  const TEMPLATES = [
    {
      label: "Maintenance",
      title: "Maintenance Programmée - {DATE}",
      message: "Chers utilisateurs,\n\nVeuillez noter qu'Aura Finance fera l'objet d'une maintenance programmée le {DATE}. Pendant cette période, la plateforme pourra être temporairement indisponible.\n\nMerci de votre compréhension.",
      severity: "warning"
    },
    {
      label: "Mise à jour",
      title: "Mise à jour de la Plateforme",
      message: "Nous sommes heureux de vous annoncer une nouvelle mise à jour d'Aura Finance ! Cette mise à jour inclut des améliorations de performance et de nouvelles fonctionnalités.\n\nVeuillez rafraîchir votre page pour en profiter.",
      severity: "info"
    },
    {
      label: "Interruption",
      title: "Interruption de Service",
      message: "Nous rencontrons actuellement une interruption de service inattendue. Nos ingénieurs travaillent activement à la résolution du problème.\n\nNous vous tiendrons informés.",
      severity: "critical"
    }
  ];

  const handleApplyTemplate = (tpl: typeof TEMPLATES[0]) => {
    const dateStr = new Date().toLocaleDateString('fr-FR');
    setForm({
      ...form,
      title: tpl.title.replace('{DATE}', dateStr),
      message: tpl.message.replace('{DATE}', dateStr),
      severity: tpl.severity
    });
  };

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get(`${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}/api/super-admin/announcements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.success) {
        setAnnouncements(res.data.data);
      }
      const compRes = await axios.get(`${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}/api/super-admin/companies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (compRes.data && compRes.data.success) {
        setCompanies(compRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
      await axios.post(`${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}/api/super-admin/announcements`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForm({ title: '', message: '', severity: 'info', targetAudience: 'ALL', targetUsers: [] });
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
      await axios.put(`${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}/api/super-admin/announcements/${id}/toggle`, {}, {
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
        <h1 className="text-[24px] font-semibold text-white tracking-tight mb-1">{t('superadmin.announcements_page.title')}</h1>
        <p className="text-[13px] text-[#A69697]">
          {t('superadmin.announcements_page.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Composer */}
        <div className="bg-[#1A050A] border border-white/5 rounded-lg p-6 h-fit">
          <h2 className="text-[14px] font-semibold text-white mb-5 border-b border-white/5 pb-3">
            {t('superadmin.announcements_page.draft_title')}
          </h2>
          
          <div className="mb-5">
            <label className="block text-[11px] font-medium text-[#A69697] mb-2 uppercase tracking-wider">Modèles Rapides</label>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-white hover:bg-white/10 transition-colors"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handlePublish} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-[#A69697] mb-1.5 uppercase tracking-wider">{t('superadmin.announcements_page.announcement_title')}</label>
              <input 
                type="text" 
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                placeholder={t('superadmin.announcements_page.title_placeholder')}
                className="w-full px-3 py-2 rounded-md border outline-none text-[12px] transition-colors bg-[#1E0A0B] border-white/5 text-white focus:border-[#D98F8F]/50"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#A69697] mb-1.5 uppercase tracking-wider">{t('superadmin.announcements_page.message_body')}</label>
              <textarea 
                rows={4}
                value={form.message}
                onChange={(e) => setForm({...form, message: e.target.value})}
                placeholder={t('superadmin.announcements_page.message_placeholder')}
                className="w-full px-3 py-2 rounded-md border outline-none text-[12px] transition-colors bg-[#1E0A0B] border-white/5 text-white focus:border-[#D98F8F]/50 resize-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#A69697] mb-1.5 uppercase tracking-wider">{t('superadmin.announcements_page.severity_type')}</label>
              <div className="flex gap-3 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="severity" checked={form.severity === 'info'} onChange={() => setForm({...form, severity: 'info'})} className="accent-[#60A5FA]" />
                  <span className="text-[12px] text-white flex items-center gap-1"><Info size={14} className="text-blue-400"/> {t('superadmin.announcements_page.info')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="severity" checked={form.severity === 'warning'} onChange={() => setForm({...form, severity: 'warning'})} className="accent-[#F59E0B]" />
                  <span className="text-[12px] text-white flex items-center gap-1"><AlertTriangle size={14} className="text-yellow-500"/> {t('superadmin.announcements_page.warning')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="severity" checked={form.severity === 'critical'} onChange={() => setForm({...form, severity: 'critical'})} className="accent-[#EF4444]" />
                  <span className="text-[12px] text-white flex items-center gap-1"><XCircle size={14} className="text-red-500"/> {t('superadmin.announcements_page.critical')}</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#A69697] mb-1.5 uppercase tracking-wider">Target Audience</label>
              <div className="flex gap-4 mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="audience" checked={form.targetAudience === 'ALL'} onChange={() => setForm({...form, targetAudience: 'ALL'})} className="accent-[#D98F8F]" />
                  <span className="text-[12px] text-white">All Organizations</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="audience" checked={form.targetAudience === 'SPECIFIC'} onChange={() => setForm({...form, targetAudience: 'SPECIFIC'})} className="accent-[#D98F8F]" />
                  <span className="text-[12px] text-white">Specific Users/Companies</span>
                </label>
              </div>

              {form.targetAudience === 'SPECIFIC' && (
                <div className="max-h-40 overflow-y-auto bg-[#1E0A0B] border border-white/5 rounded-md p-2 space-y-1 mt-2">
                  {companies.map(c => (
                    <label key={c._id} className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="accent-[#D98F8F]"
                        checked={form.targetUsers.includes(c._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm({ ...form, targetUsers: [...form.targetUsers, c._id] });
                          } else {
                            setForm({ ...form, targetUsers: form.targetUsers.filter(id => id !== c._id) });
                          }
                        }}
                      />
                      <span className="text-[12px] text-white">{c.name} ({c.email})</span>
                    </label>
                  ))}
                  {companies.length === 0 && <p className="text-[11px] text-[#A69697] p-2">No companies found.</p>}
                </div>
              )}
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium bg-[#D98F8F] text-[#1A050A] hover:bg-[#D98F8F]/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader size={14} className="animate-spin" /> : <Send size={14} />} 
              {isSubmitting ? t('superadmin.announcements_page.publishing_btn') : t('superadmin.announcements_page.publish_btn')}
            </button>
          </form>
        </div>

        {/* History */}
        <div className="bg-[#1A050A] border border-white/5 rounded-lg p-6">
          <h2 className="text-[14px] font-semibold text-white mb-5 border-b border-white/5 pb-3">
            {t('superadmin.announcements_page.recent_title')}
          </h2>
          <div className="space-y-3">
            {isLoading ? (
              <div className="py-8 text-center"><Loader className="animate-spin text-[#A69697] mx-auto" size={20} /></div>
            ) : announcements.length === 0 ? (
              <div className="py-8 text-center text-[#A69697] text-[12px]">{t('superadmin.announcements_page.no_announcements')}</div>
            ) : (
              announcements.map(a => (
                <div key={a._id} className="p-4 rounded-md border border-white/5 bg-[#1E0A0B]">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-[13px] font-medium text-white flex items-center gap-2">
                        {a.severity === 'info' && <Info size={14} className="text-blue-400"/>}
                        {a.severity === 'warning' && <AlertTriangle size={14} className="text-yellow-500"/>}
                        {a.severity === 'critical' && <XCircle size={14} className="text-red-500"/>}
                        {a.title}
                      </h3>
                      <p className="text-[12px] text-[#A69697] mt-1 whitespace-pre-wrap">{a.message}</p>
                      <p className="text-[10px] text-[#A69697] mt-2">
                        <strong>Target:</strong> {a.targetAudience === 'ALL' ? 'All Organizations' : `${a.targetUsers?.length || 0} Specific Users`}
                      </p>
                    </div>
                    <span className="text-[10px] text-[#A69697]">{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${a.active ? 'text-green-400' : 'text-[#A69697]'}`}>
                      {a.active ? t('superadmin.announcements_page.active') : t('superadmin.announcements_page.archived')}
                    </span>
                    <button 
                      onClick={() => handleToggleActive(a._id)}
                      className="text-[11px] text-[#D98F8F] hover:text-white transition-colors"
                    >
                      {a.active ? t('superadmin.announcements_page.deactivate') : t('superadmin.announcements_page.reactivate')}
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
