'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/i18n-context';
import { Brain, Network, Code, Send, Scale, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ServicesPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const planLevels: { [key: string]: number } = {
    'free': 0,
    'basic': 1,
    'normal': 2,
    'pro': 3,
    'premium': 4,
    'ultra': 4
  };

  const getPlanLevel = (planName: string) => {
    return planLevels[String(planName).toLowerCase()] ?? 0;
  };

  const currentPlan = user?.billing?.plan || 'Free';
  const currentLevel = getPlanLevel(currentPlan);

  const services = [
    {
      id: 'extraction',
      icon: Brain,
      title: t('services_page.extraction.title') || "Service d'Extraction",
      desc: t('services_page.extraction.desc') || "Extraction automatique et intelligente des données de vos factures avec une précision de 99.9%.",
      minPlan: 'Basic',
      color: 'from-pink-500/20 to-purple-500/20',
      glowColor: 'rgba(236,72,153,0.15)',
      borderColor: 'border-pink-500/30 text-pink-400'
    },
    {
      id: 'ttn',
      icon: Network,
      title: t('services_page.ttn.title') || "Connexion au TTN",
      desc: t('services_page.ttn.desc') || "Vérification et synchronisation transparentes de vos factures électroniques avec le réseau Tunisian TradeNet.",
      minPlan: 'Basic',
      color: 'from-blue-500/20 to-indigo-500/20',
      glowColor: 'rgba(59,130,246,0.15)',
      borderColor: 'border-blue-500/30 text-blue-400'
    },
    {
      id: 'app_conn',
      icon: Code,
      title: t('services_page.app_conn.title') || "Connexion à des Apps (API)",
      desc: t('services_page.app_conn.desc') || "Clé d'intégration API pour synchroniser et lier Aura Finance avec vos ERP et outils internes.",
      minPlan: 'Normal',
      color: 'from-green-500/20 to-emerald-500/20',
      glowColor: 'rgba(16,185,129,0.15)',
      borderColor: 'border-green-500/30 text-green-400'
    },
    {
      id: 'telegram',
      icon: Send,
      title: t('services_page.telegram.title') || "Services Telegram",
      desc: t('services_page.telegram.desc') || "Recevez des alertes et envoyez des factures directement via notre bot Telegram Sarah PFE intelligent.",
      minPlan: 'Pro',
      color: 'from-sky-500/20 to-cyan-500/20',
      glowColor: 'rgba(14,165,233,0.15)',
      borderColor: 'border-sky-500/30 text-sky-400'
    },
    {
      id: 'comparison',
      icon: Scale,
      title: t('services_page.comparison.title') || "Service de Comparaison",
      desc: t('services_page.comparison.desc') || "Analysez et comparez les prix de vos fournisseurs avec le marché pour optimiser vos coûts.",
      minPlan: 'Premium',
      color: 'from-amber-500/20 to-orange-500/20',
      glowColor: 'rgba(245,158,11,0.15)',
      borderColor: 'border-amber-500/30 text-amber-400'
    }
  ];

  if (user?.role !== 'ADMIN') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-[#A69697]">{t('settings.access_denied_admin') || "Accès refusé. Administrateur uniquement."}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 w-full pb-10 max-w-[1600px] mx-auto relative animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-[32px] font-bold tracking-tight mb-1 text-[#FFFFFF]">
            {t('sidebar.services') || "Services"}
          </h1>
          <p className="text-[#A69697] text-[15px]">
            {t('services_page.subtitle') || "Découvrez et activez les services intelligents disponibles sur la plateforme Aura Finance."}
          </p>
        </div>

        {/* Current Plan Status Box */}
        <div className="bg-[#1A0A0B]/30 border border-white/5 p-4 rounded-[16px] max-w-[1200px] mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8E1B3A]/20 border border-[#8E1B3A]/30 flex items-center justify-center">
              <CheckCircle2 className="text-[#D98F8F]" size={20} />
            </div>
            <div>
              <p className="text-[#A69697] text-[12px] uppercase tracking-wider font-bold">{t('settings.subscription.active_plan') || "Plan Actuel"}</p>
              <p className="text-white text-[15px] font-bold">{currentPlan}</p>
            </div>
          </div>
          <Link href="/subscription" className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[13px] font-bold transition-all">
            {t('settings.subscription.upgrade_plan') || "Changer de plan"}
          </Link>
        </div>

        <div className="w-full max-w-[1200px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {services.map((service) => {
              const IconComponent = service.icon;
              const isServiceActive = currentLevel >= getPlanLevel(service.minPlan);

              return (
                <div
                  key={service.id}
                  className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-white/5 hover:border-white/10 rounded-[24px] p-6 lg:p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 relative group overflow-hidden shadow-lg"
                  style={{
                    boxShadow: `0 10px 30px -15px ${service.glowColor}`
                  }}
                >
                  {/* Card accent glow */}
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${service.color} rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity`}></div>

                  <div>
                    {/* Icon Wrapper */}
                    <div className={`w-12 h-12 rounded-[16px] border ${service.borderColor} bg-white/5 flex items-center justify-center mb-6`}>
                      <IconComponent size={24} strokeWidth={1.5} />
                    </div>

                    <h3 className="text-white font-bold text-[18px] mb-3">{service.title}</h3>
                    <p className="text-[#A69697] text-[13px] leading-relaxed mb-8">{service.desc}</p>
                  </div>

                  <div className="w-full">
                    {isServiceActive ? (
                      <div className="w-full py-3 rounded-[12px] bg-[#4CAF50]/10 border border-[#4CAF50]/20 text-[#4CAF50] font-bold text-[13px] text-center flex items-center justify-center gap-1.5">
                        <CheckCircle2 size={15} />
                        <span>{t('services_page.actif') || "Actif"}</span>
                      </div>
                    ) : (
                      <Link
                        href={`/subscription?plan=${service.minPlan}`}
                        className="w-full py-3 rounded-[12px] bg-[#8E1B3A]/80 hover:bg-[#D98F8F] text-white font-bold text-[13px] border border-white/5 hover:border-[#D98F8F] transition-all duration-200 shadow-md flex items-center justify-center gap-1"
                      >
                        <span>{t('services_page.obtenir') || "Obtenir"}</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
