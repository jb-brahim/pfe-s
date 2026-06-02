'use client';

import { LandingNavbar } from '@/components/landing-navbar';
import { LandingFooter } from '@/components/landing-footer';
import { MapPin, Phone, Mail, Send, MessageSquare, Globe2 } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/lib/i18n-context';

export default function ContactPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#1A0A0B] text-white selection:bg-[#D98F8F]/30 font-sans">
      <LandingNavbar />

      <main className="pt-32 pb-20 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="text-center max-w-[800px] mx-auto mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#D98F8F] text-sm font-medium mb-6">
            <Globe2 size={16} />
            {t('landing.contact.badge') || 'Global Support'}
          </div>
          <h1 className="text-[48px] md:text-[64px] font-extrabold tracking-tight mb-6">
            {t('landing.contact.title') || "Let's build something"} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A]">{t('landing.contact.title_highlight') || "amazing."}</span>
          </h1>
          <p className="text-[#A69697] text-[18px] md:text-[22px] leading-relaxed">
            {t('landing.contact.subtitle') || "Our enterprise sales and support teams are ready to help you transform your financial operations."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 max-w-[1100px] mx-auto">
          {/* Contact Information */}
          <div className="flex flex-col justify-center space-y-12 bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-[30px] p-10 relative overflow-hidden">
             <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#8E1B3A] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
            
            <div>
              <h3 className="text-2xl font-bold mb-8">Coordonnées</h3>
              
              <div className="space-y-8">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-full bg-[#8E1B3A]/20 flex items-center justify-center border border-[#8E1B3A]/40 shrink-0">
                    <Phone className="text-[#D98F8F]" size={24} />
                  </div>
                  <div>
                    <p className="text-[#A69697] text-sm mb-1">Téléphone</p>
                    <p className="font-bold text-lg">+1 (800) 123-AURA</p>
                    <p className="font-bold text-lg">+216 71 123 456</p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-full bg-[#8E1B3A]/20 flex items-center justify-center border border-[#8E1B3A]/40 shrink-0">
                    <Mail className="text-[#D98F8F]" size={24} />
                  </div>
                  <div>
                    <p className="text-[#A69697] text-sm mb-1">Email</p>
                    <p className="font-bold text-lg">support@aurafinance.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-full bg-[#8E1B3A]/20 flex items-center justify-center border border-[#8E1B3A]/40 shrink-0">
                    <MapPin className="text-[#D98F8F]" size={24} />
                  </div>
                  <div>
                    <p className="text-[#A69697] text-sm mb-1">Adresse</p>
                    <p className="font-bold text-lg leading-relaxed">Aura Finance HQ<br/>Tunis, Tunisia</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-[30px] p-8 md:p-10 shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#D98F8F]/5 to-transparent rounded-[30px] pointer-events-none"></div>
            <h3 className="text-2xl font-bold mb-6 relative z-10">Envoyez-nous un message</h3>
            
            {isSubmitted ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center flex flex-col items-center justify-center h-[300px]">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <Send size={30} className="text-green-400" />
                </div>
                <h4 className="text-xl font-bold text-green-400 mb-2">Message envoyé !</h4>
                <p className="text-[#A69697]">Nous vous répondrons dans les plus brefs délais.</p>
                <button onClick={() => setIsSubmitted(false)} className="mt-6 text-sm text-[#D98F8F] hover:text-white transition-colors">Envoyer un autre message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm text-[#A69697]">Nom complet</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full bg-[#1A0A0B] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D98F8F]/50 focus:ring-1 focus:ring-[#D98F8F]/50 transition-all"
                      placeholder="Jean Dupont"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[#A69697]">Email</label>
                    <input 
                      required 
                      type="email" 
                      className="w-full bg-[#1A0A0B] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D98F8F]/50 focus:ring-1 focus:ring-[#D98F8F]/50 transition-all"
                      placeholder="jean@example.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-[#A69697]">Sujet</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full bg-[#1A0A0B] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D98F8F]/50 focus:ring-1 focus:ring-[#D98F8F]/50 transition-all"
                    placeholder="Comment pouvons-nous vous aider ?"
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-[#A69697]">Message</label>
                  <textarea 
                    required 
                    rows={4}
                    className="w-full bg-[#1A0A0B] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D98F8F]/50 focus:ring-1 focus:ring-[#D98F8F]/50 transition-all resize-none"
                    placeholder="Parlez-nous de votre projet..."
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(217,143,143,0.4)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>Envoyer <Send size={18} /></>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
