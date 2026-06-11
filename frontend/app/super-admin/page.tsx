'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Brain, Network, Code, Send, Scale, CheckCircle2, ArrowLeft, Search, Loader, Building } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '@/lib/i18n-context';

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();

  // Services & Organizations State
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [selectedServiceForTable, setSelectedServiceForTable] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const getActiveOrganizationsForService = (minPlan: string) => {
    const minLevel = getPlanLevel(minPlan);
    return organizations.filter(org => {
      const orgPlan = org.billing?.plan || 'Free';
      const orgLevel = getPlanLevel(orgPlan);
      return orgLevel >= minLevel;
    });
  };

  useEffect(() => {
    const fetchOrganizations = async () => {
      setLoadingOrgs(true);
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(`${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}/api/super-admin/companies`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.success) {
          setOrganizations(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching organizations:', error);
      } finally {
        setLoadingOrgs(false);
      }
    };

    fetchOrganizations();
  }, []);

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


  // DRILL-DOWN TABLE VIEW
  if (selectedServiceForTable) {
    const activeService = services.find(s => s.id === selectedServiceForTable);
    if (!activeService) return null;

    const orgsList = getActiveOrganizationsForService(activeService.minPlan);
    const filteredOrgsList = orgsList.filter(org => {
      const name = org.companyDetails?.name?.toLowerCase() || '';
      const email = org.email?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      return name.includes(query) || email.includes(query);
    });

    const getDaysRemaining = (dateString: string) => {
      if (!dateString) return 0;
      const diff = new Date(dateString).getTime() - new Date().getTime();
      return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
    };

    const handleExportCSV = () => {
      if (filteredOrgsList.length === 0) return alert('No organizations to export');
      
      const headers = [
        'Organization Name',
        'Admin Email',
        'Subscription Plan',
        'Renewal Date',
        'Status'
      ];

      const escapeCSV = (value: any) => {
        if (value === null || value === undefined) return '""';
        const str = String(value);
        return `"${str.replace(/"/g, '""')}"`;
      };

      const rows: string[] = [];
      rows.push(headers.join(','));

      filteredOrgsList.forEach(org => {
        const name = org.companyDetails?.name || org.name || 'Unnamed Org';
        const email = org.email || 'N/A';
        const plan = org.billing?.plan || 'Ultra';
        const status = org.status || 'Active';
        const renewal = org.billing?.renewalDate ? new Date(org.billing?.renewalDate).toLocaleDateString() : 'N/A';

        rows.push([
          escapeCSV(name),
          escapeCSV(email),
          escapeCSV(plan),
          escapeCSV(renewal),
          escapeCSV(status)
        ].join(','));
      });

      const csvContent = rows.join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Organizations_Service_${activeService.id}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const handleExportPDF = async () => {
      if (filteredOrgsList.length === 0) return alert('No organizations to export');
      try {
        const { exportOrgsPDF } = await import('@/lib/exportOrgsPDF');
        await exportOrgsPDF(filteredOrgsList, `Aura_Organisations_Service_${activeService.id}.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF');
      }
    };

    return (
      <div className="flex flex-col gap-6 w-full pb-10 max-w-[1200px] mx-auto relative animate-in fade-in duration-300">
        {/* Header with Back Button */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
          <div>
            <button 
              onClick={() => { setSelectedServiceForTable(null); setSearchQuery(''); }}
              className="flex items-center gap-2 text-[#A69697] hover:text-white transition-colors text-[14px] font-medium mb-3"
            >
              <ArrowLeft size={16} />
              <span>{t('services_page.back_to_services') || "Retour aux services"}</span>
            </button>
            <h1 className="text-[28px] font-bold text-white tracking-tight flex items-center gap-3">
              <activeService.icon className={activeService.borderColor.split(' ')[1]} size={28} />
              {activeService.title} - {t('services_page.active_organizations') || "Organisations Actives"}
            </h1>
            <p className="text-[#A69697] text-[14px] mt-1">
              {t('services_page.active_organizations_desc') || "Liste des organisations bénéficiant de ce service."}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleExportPDF}
              className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors bg-white/5 hover:bg-white/10 border border-white/5 text-[#A69697] hover:text-white"
            >
              {t('organizations.export_pdf') || "Exporter PDF"}
            </button>
            <button 
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors bg-white/5 hover:bg-white/10 border border-white/5 text-[#A69697] hover:text-white"
            >
              {t('organizations.export') || "Exporter"} CSV
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-[#1A050A] border border-white/5 rounded-lg flex-1 flex flex-col mt-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-b border-white/5">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A69697]" size={14} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('services_page.search_orgs') || "Rechercher des organisations..."}
                className="w-full pl-9 pr-4 py-2 rounded-md border outline-none text-[12px] transition-colors bg-[#1E0A0B] border-white/5 text-white focus:border-[#D98F8F]/50 placeholder:text-[#A69697]"
              />
            </div>
            <div className="text-[12px] text-[#A69697] font-medium">
              {filteredOrgsList.length} {filteredOrgsList.length === 1 ? (t('services_page.org_count_single', { count: 1 }).replace('{{count}}', '1') || "1 Organisation") : (t('services_page.org_count_plural', { count: filteredOrgsList.length }).replace('{{count}}', String(filteredOrgsList.length)) || `${filteredOrgsList.length} Organisations`)}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="py-3 px-5 text-[11px] uppercase tracking-wider text-[#A69697] font-medium">{t('organizations.table.organization') || "Organisation"}</th>
                  <th className="py-3 px-5 text-[11px] uppercase tracking-wider text-[#A69697] font-medium">{t('organizations.table.client_admin') || "Administrateur"}</th>
                  <th className="py-3 px-5 text-[11px] uppercase tracking-wider text-[#A69697] font-medium">{t('organizations.table.subscription') || "Abonnement"}</th>
                  <th className="py-3 px-5 text-[11px] uppercase tracking-wider text-[#A69697] font-medium">{t('organizations.table.time_left') || "Temps restant"}</th>
                  <th className="py-3 px-5 text-right">{t('organizations.table.status') || "Statut"}</th>
                </tr>
              </thead>
              <tbody>
                {loadingOrgs ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <Loader size={20} className="animate-spin text-[#A69697] mx-auto" />
                    </td>
                  </tr>
                ) : filteredOrgsList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[12px] text-[#A69697]">
                      {t('organizations.no_results') || "Aucun résultat trouvé"}
                    </td>
                  </tr>
                ) : (
                  filteredOrgsList.map((org) => {
                    const plan = org.billing?.plan || 'Ultra';
                    const price = org.billing?.amount || 49;
                    const daysRemaining = getDaysRemaining(org.billing?.renewalDate);
                    
                    return (
                      <tr key={org._id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded border border-white/5 bg-[#1E0A0B] flex items-center justify-center">
                              <Building size={14} className="text-[#D98F8F]" />
                            </div>
                            <div>
                              <p className="text-[13px] font-medium text-white">{org.companyDetails?.name || org.name || 'Unnamed Org'}</p>
                              <p className="text-[11px] text-[#A69697]">{t('organizations.employees_count', { count: org.employees?.length || 0 }).replace('{{count}}', String(org.employees?.length || 0))}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-5">
                          <p className="text-[13px] text-white">{org.name}</p>
                          <p className="text-[11px] text-[#A69697]">{org.email}</p>
                        </td>
                        <td className="py-3 px-5">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-white border border-[#D98F8F]/50">
                              {plan}
                            </span>
                            <span className="text-[11px] text-[#A69697]">{t('organizations.per_month', { price }).replace('{{price}}', String(price))}</span>
                          </div>
                        </td>
                        <td className="py-3 px-5">
                          <div className="flex flex-col gap-1">
                            <p className="text-[12px] text-white">{org.billing?.renewalDate ? new Date(org.billing?.renewalDate).toLocaleDateString() : 'N/A'}</p>
                            {daysRemaining <= 7 ? (
                              <span className="text-[11px] font-semibold text-[#D98F8F]">{t('organizations.days_left', { days: daysRemaining }).replace('{{days}}', String(daysRemaining))}</span>
                            ) : (
                              <span className="text-[11px] text-[#A69697]">{t('organizations.days_remaining', { days: daysRemaining }).replace('{{days}}', String(daysRemaining))}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-5 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${
                            org.status === 'Active' ? 'bg-[#4CAF50]/10 text-[#4CAF50] border-[#4CAF50]/30' : 'bg-[#8E1B3A]/30 text-[#D98F8F] border-[#8E1B3A]/50'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${org.status === 'Active' ? 'bg-[#4CAF50]' : 'bg-[#D98F8F]'}`}></span>
                            {org.status === 'Active' ? (t('organizations.active') || 'Actif') : (t('organizations.suspended') || 'Suspendu')}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      {/* Services Grid Section embedded in Platform Overview */}
      <div>
        <div className="mb-6">
          <h2 className="text-[22px] font-bold text-white tracking-tight mb-1">{t('services_page.title') || "Aperçu"}</h2>
          <p className="text-[#A69697] text-[13px]">{t('services_page.subtitle') || "Aperçu de l'état des services et des intégrations actives."}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service) => {
            const IconComponent = service.icon;

            return (
              <div
                key={service.id}
                className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-white/5 hover:border-white/10 rounded-[24px] p-6 lg:p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 relative group overflow-hidden shadow-lg"
                style={{
                  boxShadow: `0 10px 30px -15px ${service.glowColor}`
                }}
              >
                {/* Subtle card accent glow */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${service.color} rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity`}></div>

                <div>
                  {/* Icon wrapper */}
                  <div className={`w-12 h-12 rounded-[16px] border ${service.borderColor} bg-white/5 flex items-center justify-center mb-6`}>
                    <IconComponent size={24} strokeWidth={1.5} />
                  </div>

                  <h3 className="text-white font-bold text-[18px] mb-3">{service.title}</h3>
                  <p className="text-[#A69697] text-[13px] leading-relaxed mb-8">{service.desc}</p>
                </div>

                <div className="flex flex-col gap-3 w-full">
                  <div className="text-[13px] text-[#A69697] text-center font-medium">
                    {(() => {
                      const count = getActiveOrganizationsForService(service.minPlan).length;
                      return count === 1 
                        ? (t('services_page.org_count_single', { count }).replace('{{count}}', String(count)) || "1 Organisation") 
                        : (t('services_page.org_count_plural', { count }).replace('{{count}}', String(count)) || `${count} Organisations`);
                    })()}
                  </div>
                  <button
                    onClick={() => setSelectedServiceForTable(service.id)}
                    className="w-full py-3 rounded-[12px] bg-white/5 hover:bg-[#D98F8F] text-white hover:text-white font-bold text-[13px] border border-white/5 hover:border-[#D98F8F] transition-all duration-200 shadow-md flex items-center justify-center gap-1 group/btn"
                  >
                    <span>{t('services_page.view_organizations') || "Voir les organisations"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
