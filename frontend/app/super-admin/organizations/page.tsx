'use client';

import React, { useState, useEffect } from 'react';
import { Search, Building, Loader, Trash2, Edit2, X, ChevronDown, ChevronRight, Users, MoreVertical, Key, Copy, CheckCircle2, Calendar, Shield, Zap } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '@/lib/i18n-context';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();
  
  // Expanded rows
  const [expandedOrgs, setExpandedOrgs] = useState<Record<string, boolean>>({});

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editOrgForm, setEditOrgForm] = useState({ 
    id: '', 
    name: '', 
    email: '', 
    plan: 'Pro', 
    status: 'Active', 
    amount: 49,
    durationMonths: 0,
    currentRenewalDate: '' 
  });

  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageForm, setMessageForm] = useState({ id: '', email: '', subject: '', message: '' });

  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [apiOrg, setApiOrg] = useState<any>(null);
  const [generatedApiKey, setGeneratedApiKey] = useState('');
  const [isGeneratingApi, setIsGeneratingApi] = useState(false);

  const fetchOrganizations = async () => {
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this organization?")) {
      try {
        const token = localStorage.getItem('authToken');
        await axios.delete(`${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}/api/super-admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrganizations(organizations.filter(org => org._id !== id));
      } catch (error) {
        console.error('Error deleting organization:', error);
        alert('Failed to delete organization');
      }
    }
  };

  const openEditModal = (org: any) => {
    setEditOrgForm({
      id: org._id,
      name: org.companyDetails?.name || '',
      email: org.email,
      plan: org.billing?.plan || 'Ultra',
      status: org.status || 'Active',
      amount: org.billing?.amount || 49,
      durationMonths: 0,
      currentRenewalDate: org.billing?.renewalDate || new Date().toISOString()
    });
    setIsEditModalOpen(true);
  };

  const handleEditOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      
      let newRenewalDate = editOrgForm.currentRenewalDate;
      if (editOrgForm.durationMonths > 0) {
        const d = new Date(editOrgForm.currentRenewalDate);
        d.setMonth(d.getMonth() + editOrgForm.durationMonths);
        newRenewalDate = d.toISOString();
      }

      await axios.put(`${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}/api/super-admin/users/${editOrgForm.id}`, {
        plan: editOrgForm.plan,
        amount: editOrgForm.amount,
        status: editOrgForm.status,
        renewalDate: newRenewalDate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsEditModalOpen(false);
      fetchOrganizations();
    } catch (error) {
      console.error('Error updating organization:', error);
      alert('Failed to update organization');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedOrgs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredOrgs = organizations.filter(org => {
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

  const submitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(`${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}/api/super-admin/users/${messageForm.id}/send-reminder`, {
        subject: messageForm.subject,
        message: messageForm.message
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsMessageModalOpen(false);
      alert(`Reminder message successfully sent to ${messageForm.email} via SMTP.`);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send reminder. Check server logs.');
    }
  };

  const openMessageModal = (org: any) => {
    const daysLeft = getDaysRemaining(org.billing?.renewalDate);
    setMessageForm({
      id: org._id,
      email: org.email,
      subject: `Urgent: Your Subscription to Aura Finance is ending soon!`,
      message: `Hello ${org.companyDetails?.name || org.name || 'Admin'},\n\nYour subscription plan (${org.billing?.plan || 'Ultra'}) is set to expire in ${daysLeft} days. Please renew your subscription to avoid service interruption.\n\nThank you,\nAura Finance Team`
    });
    setIsMessageModalOpen(true);
  };

  const openApiModal = (org: any) => {
    setApiOrg(org);
    setGeneratedApiKey('');
    setIsApiModalOpen(true);
  };

  const handleGenerateApiKey = async () => {
    if (!apiOrg) return;
    setIsGeneratingApi(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.post(`${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}/api/super-admin/users/${apiOrg._id}/generate-api-key`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.success) {
        setGeneratedApiKey(res.data.apiKey);
      }
    } catch (error) {
      console.error('Error generating API key:', error);
      alert('Failed to generate API Key');
    } finally {
      setIsGeneratingApi(false);
    }
  };

  const handleCopyApi = () => {
    navigator.clipboard.writeText(generatedApiKey);
    alert('API Key copied to clipboard!');
  };

  const handleExportCSV = () => {
    if (filteredOrgs.length === 0) return alert('No organizations to export');
    
    // Professional header structure including employee details
    const headers = [
      'Organization Name',
      'Admin Email',
      'Subscription Plan',
      'Monthly Amount (TND)',
      'Status',
      'Renewal Date',
      'Employees Count',
      'Employee Name',
      'Employee Email',
      'Employee Role'
    ];

    const escapeCSV = (value: any) => {
      if (value === null || value === undefined) return '""';
      const str = String(value);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows: string[] = [];
    rows.push(headers.join(','));

    filteredOrgs.forEach(org => {
      const name = org.companyDetails?.name || org.name || 'Unnamed Org';
      const email = org.email || 'N/A';
      const plan = org.billing?.plan || 'Ultra';
      const amount = org.billing?.amount || 49;
      const status = org.status || 'Active';
      const renewal = org.billing?.renewalDate ? new Date(org.billing?.renewalDate).toLocaleDateString() : 'N/A';
      const employeesCount = org.employees?.length || 0;
      const employeesList = org.employees || [];

      if (employeesList.length === 0) {
        // Organization with no employees
        rows.push([
          escapeCSV(name),
          escapeCSV(email),
          escapeCSV(plan),
          escapeCSV(amount),
          escapeCSV(status),
          escapeCSV(renewal),
          escapeCSV(employeesCount),
          escapeCSV('No employees'),
          escapeCSV(''),
          escapeCSV('')
        ].join(','));
      } else {
        // One row per employee, cleanly grouped by leaving org details blank on subsequent rows
        employeesList.forEach((emp: any, index: number) => {
          rows.push([
            escapeCSV(index === 0 ? name : ''),
            escapeCSV(index === 0 ? email : ''),
            escapeCSV(index === 0 ? plan : ''),
            escapeCSV(index === 0 ? amount : ''),
            escapeCSV(index === 0 ? status : ''),
            escapeCSV(index === 0 ? renewal : ''),
            escapeCSV(index === 0 ? employeesCount : ''),
            escapeCSV(emp.name || 'N/A'),
            escapeCSV(emp.email || 'N/A'),
            escapeCSV(emp.role || 'N/A')
          ].join(','));
        });
      }
    });

    const csvContent = rows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Organizations_Detailed_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-in fade-in duration-500 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[24px] font-semibold text-white tracking-tight mb-1">{t('organizations.title')}</h1>
          <p className="text-[13px] text-[#A69697]">
            {t('organizations.subtitle')}
          </p>
        </div>
      </div>

      <div className="bg-[#1A050A] border border-white/5 rounded-lg flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-b border-white/5">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A69697]" size={14} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('organizations.search')}
              className="w-full pl-9 pr-4 py-2 rounded-md border outline-none text-[12px] transition-colors bg-[#1E0A0B] border-white/5 text-white focus:border-[#D98F8F]/50 placeholder:text-[#A69697]"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors bg-white/5 hover:bg-white/10 border border-white/5 text-[#A69697] hover:text-white"
            >
              {t('organizations.export')}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="py-3 px-5 w-[5%]"></th>
                <th className="py-3 px-5 text-[11px] uppercase tracking-wider text-[#A69697] font-medium w-[20%]">{t('organizations.table.organization')}</th>
                <th className="py-3 px-5 text-[11px] uppercase tracking-wider text-[#A69697] font-medium w-[20%]">{t('organizations.table.client_admin')}</th>
                <th className="py-3 px-5 text-[11px] uppercase tracking-wider text-[#A69697] font-medium w-[20%]">{t('organizations.table.subscription')}</th>
                <th className="py-3 px-5 text-[11px] uppercase tracking-wider text-[#A69697] font-medium w-[15%]">{t('organizations.table.time_left')}</th>
                <th className="py-3 px-5 text-right w-[20%]">{t('organizations.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Loader size={20} className="animate-spin text-[#A69697] mx-auto" />
                  </td>
                </tr>
              ) : filteredOrgs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[12px] text-[#A69697]">
                    {t('organizations.no_results')}
                  </td>
                </tr>
              ) : (
                filteredOrgs.map((org) => {
                  const plan = org.billing?.plan || 'Ultra';
                  const price = org.billing?.amount || 49;
                  const daysRemaining = getDaysRemaining(org.billing?.renewalDate);
                  
                  return (
                  <React.Fragment key={org._id}>
                    <tr className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => toggleExpand(org._id)}>
                      <td className="py-3 px-5 text-center">
                        <button className="text-[#A69697] hover:text-white">
                          {expandedOrgs[org._id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded border border-white/5 bg-[#1E0A0B] flex items-center justify-center">
                            <Building size={14} className="text-[#D98F8F]" />
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-white">{org.companyDetails?.name || org.name || 'Unnamed Org'}</p>
                            <p className="text-[11px] text-[#A69697]">Employees: {org.employees?.length || 0}</p>
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
                          <span className="text-[11px] text-[#A69697]">{price} TND / month</span>
                        </div>
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex flex-col gap-1">
                          <p className="text-[12px] text-white">{org.billing?.renewalDate ? new Date(org.billing?.renewalDate).toLocaleDateString() : 'N/A'}</p>
                          {daysRemaining <= 7 ? (
                            <span className="text-[11px] font-semibold text-[#D98F8F]">{daysRemaining} days left!</span>
                          ) : (
                            <span className="text-[11px] text-[#A69697]">{daysRemaining} days remaining</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              openMessageModal(org);
                            }}
                            className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#D98F8F]/10 border border-[#D98F8F]/30 text-[#D98F8F] hover:bg-[#D98F8F]/20 transition-colors text-[11px] font-medium"
                            title={t('organizations.send_message')}
                          >
                            {t('organizations.send_message')}
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(org);
                            }}
                            className="p-1.5 rounded hover:bg-white/10 text-[#A69697] hover:text-white" 
                            title={t('organizations.manage')}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(org._id);
                            }}
                            className="p-1.5 rounded hover:bg-red-500/10 text-[#A69697] hover:text-red-400 transition-colors" 
                            title="Delete Organization"
                          >
                            <Trash2 size={14} />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              openApiModal(org);
                            }}
                            className="p-1.5 rounded hover:bg-white/10 text-[#A69697] hover:text-white" 
                            title="API Settings"
                          >
                            <MoreVertical size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedOrgs[org._id] && (
                      <tr className="bg-[#1A0A0B]/50 border-b border-white/[0.02]">
                        <td colSpan={6} className="py-4 px-12">
                          <div className="flex flex-col gap-2">
                            <h4 className="text-[#A69697] text-[11px] uppercase font-bold tracking-wider mb-2 flex items-center gap-2"><Users size={14} /> Organization Employees</h4>
                            {org.employees?.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {org.employees.map((emp: any) => (
                                  <div key={emp._id} className="bg-white/5 border border-white/5 rounded-md p-3 flex justify-between items-center">
                                    <div>
                                      <p className="text-[13px] text-white font-medium">{emp.name}</p>
                                      <p className="text-[11px] text-[#A69697]">{emp.email}</p>
                                    </div>
                                    <span className="text-[10px] px-2 py-0.5 bg-[#D98F8F]/20 text-[#D98F8F] rounded-full border border-[#D98F8F]/30">{emp.role}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[12px] text-[#A69697] italic">No employees found under this organization.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A050A] border border-white/10 rounded-xl w-full max-w-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[18px] font-semibold text-white">{t('organizations.manage')} Subscription</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-[#A69697] hover:text-white">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleEditOrg} className="space-y-6">
              {/* Read-Only Info */}
              <div className="p-4 rounded-lg bg-[#1E0A0B] border border-white/5 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                <div>
                  <span className="text-[11px] text-[#A69697] uppercase tracking-wider block mb-1">Company</span>
                  <span className="text-[14px] font-medium text-white">{editOrgForm.name}</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#A69697] uppercase tracking-wider block mb-1">Owner Email</span>
                  <span className="text-[14px] font-medium text-white">{editOrgForm.email}</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#A69697] uppercase tracking-wider block mb-1">Current Expiry</span>
                  <span className="text-[14px] font-medium text-white">
                    {editOrgForm.currentRenewalDate ? new Date(editOrgForm.currentRenewalDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[13px] text-white font-medium">Select Plan</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'Basic', name: 'Basic', price: 19, icon: <Shield size={16} />, desc: 'Core features' },
                    { id: 'Pro', name: 'Pro', price: 49, icon: <Zap size={16} />, desc: 'Advanced tools' },
                    { id: 'Ultra', name: 'Ultra', price: 89, icon: <Building size={16} />, desc: 'Unlimited usage' }
                  ].map(plan => (
                    <div 
                      key={plan.id}
                      onClick={() => setEditOrgForm({...editOrgForm, plan: plan.id, amount: plan.price})}
                      className={`relative p-4 rounded-xl border cursor-pointer transition-all ${editOrgForm.plan === plan.id ? 'border-[#D98F8F] bg-[#D98F8F]/10' : 'border-white/5 bg-[#1E0A0B] hover:border-white/20'}`}
                    >
                      {editOrgForm.plan === plan.id && (
                        <div className="absolute top-3 right-3 text-[#D98F8F]">
                          <CheckCircle2 size={18} className="fill-[#D98F8F]/20" />
                        </div>
                      )}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${editOrgForm.plan === plan.id ? 'bg-[#D98F8F]/20 text-[#D98F8F]' : 'bg-white/5 text-[#A69697]'}`}>
                        {plan.icon}
                      </div>
                      <h3 className="text-white font-medium text-[14px] mb-1">{plan.name}</h3>
                      <p className="text-[#A69697] text-[11px] mb-3">{plan.desc}</p>
                      <div className="text-white font-semibold">{plan.price} TND <span className="text-[#A69697] text-[11px] font-normal">/mo</span></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-white/5">
                <div>
                  <label className="block text-[12px] text-[#A69697] mb-1.5 font-medium flex items-center gap-1.5"><Calendar size={14} /> Add Duration</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'None', val: 0 },
                      { label: '1M', val: 1 },
                      { label: '6M', val: 6 },
                      { label: '1Y', val: 12 }
                    ].map(dur => (
                      <button
                        type="button"
                        key={dur.label}
                        onClick={() => setEditOrgForm({...editOrgForm, durationMonths: dur.val})}
                        className={`py-2 text-[12px] rounded-md font-medium transition-colors border ${editOrgForm.durationMonths === dur.val ? 'bg-[#D98F8F] text-[#1E0A0B] border-[#D98F8F]' : 'bg-[#1E0A0B] text-[#A69697] border-white/5 hover:border-white/20'}`}
                      >
                        {dur.label}
                      </button>
                    ))}
                  </div>
                  {editOrgForm.durationMonths > 0 && editOrgForm.currentRenewalDate && (
                    <p className="text-[11px] text-[#D98F8F] mt-2">
                      New expiry: {(() => {
                        const d = new Date(editOrgForm.currentRenewalDate);
                        d.setMonth(d.getMonth() + editOrgForm.durationMonths);
                        return d.toLocaleDateString();
                      })()}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[12px] text-[#A69697] mb-1.5 font-medium">Account Status</label>
                  <select 
                    value={editOrgForm.status}
                    onChange={(e) => setEditOrgForm({...editOrgForm, status: e.target.value})}
                    className="w-full px-3 py-2 rounded-md bg-[#1E0A0B] border border-white/5 text-white text-[13px] focus:border-[#D98F8F]/50 outline-none appearance-none h-[38px]"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Pending Deletion">Pending Deletion</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg text-[13px] font-medium text-[#A69697] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white shadow-lg hover:shadow-xl hover:opacity-90 transition-all"
                >
                  Apply Subscription Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Send Message Modal */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A050A] border border-white/10 rounded-xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[18px] font-semibold text-white">{t('organizations.send_direct_message')}</h2>
              <button onClick={() => setIsMessageModalOpen(false)} className="text-[#A69697] hover:text-white">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={submitMessage} className="space-y-4">
              <div className="p-3 rounded-md bg-[#1E0A0B] border border-white/5 flex justify-between items-center">
                <span className="text-[11px] text-[#A69697] uppercase tracking-wider">To:</span>
                <span className="text-[12px] font-medium text-white">{messageForm.email}</span>
              </div>

              <div>
                <label className="block text-[12px] text-[#A69697] mb-1.5 font-medium">Subject</label>
                <input 
                  type="text"
                  value={messageForm.subject}
                  onChange={(e) => setMessageForm({...messageForm, subject: e.target.value})}
                  required
                  className="w-full px-3 py-2 rounded-md bg-[#1E0A0B] border border-white/5 text-white text-[13px] focus:border-[#D98F8F]/50 outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] text-[#A69697] mb-1.5 font-medium">Message Body</label>
                <textarea 
                  value={messageForm.message}
                  onChange={(e) => setMessageForm({...messageForm, message: e.target.value})}
                  required
                  rows={6}
                  className="w-full px-3 py-2 rounded-md bg-[#1E0A0B] border border-white/5 text-white text-[13px] focus:border-[#D98F8F]/50 outline-none resize-none"
                />
              </div>
              
              <div className="pt-4 flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsMessageModalOpen(false)}
                  className="px-4 py-2 rounded-md text-[13px] font-medium text-[#A69697] hover:text-white transition-colors"
                >
                  {t('organizations.cancel')}
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-md text-[13px] font-medium bg-[#D98F8F] text-[#1E0A0B] hover:bg-[#D98F8F]/90 transition-colors"
                >
                  {t('organizations.send_message')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {isApiModalOpen && apiOrg && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A050A] border border-white/10 rounded-xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#D98F8F]/10 flex items-center justify-center">
                  <Key size={16} className="text-[#D98F8F]" />
                </div>
                <h2 className="text-[18px] font-semibold text-white">API Settings</h2>
              </div>
              <button onClick={() => setIsApiModalOpen(false)} className="text-[#A69697] hover:text-white">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-[13px] text-[#A69697] leading-relaxed">
                Generate an API key for <strong className="text-white">{apiOrg.companyDetails?.name || apiOrg.name}</strong>. 
                This key allows external systems to integrate with their Aura Finance account.
              </p>

              {generatedApiKey ? (
                <div className="space-y-3">
                  <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg text-[13px]">
                    API Key generated successfully! Please copy it now, as you won't be able to see it again.
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={generatedApiKey} 
                      readOnly 
                      className="w-full bg-[#1E0A0B] border border-white/5 rounded-lg px-3 py-2.5 text-white font-mono text-[13px] outline-none"
                    />
                    <button 
                      onClick={handleCopyApi}
                      className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-white transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2">
                  <button 
                    onClick={handleGenerateApiKey}
                    disabled={isGeneratingApi}
                    className="w-full bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white py-2.5 rounded-lg text-[13px] font-semibold flex justify-center items-center gap-2 disabled:opacity-50 transition-all"
                  >
                    {isGeneratingApi ? <Loader size={16} className="animate-spin" /> : <><Key size={16} /> Generate New API Key</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
