'use client';

import { useState, useEffect } from 'react';
import { Search, Building, Plus, Loader, Trash2, Edit2, X, UserSquare } from 'lucide-react';
import axios from 'axios';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newOrgForm, setNewOrgForm] = useState({ name: '', email: '', plan: 'Pro' });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editOrgForm, setEditOrgForm] = useState({ id: '', name: '', email: '', plan: 'Pro', status: 'Active' });

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get('http://localhost:5000/api/super-admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.success) {
        const admins = res.data.data.filter((u: any) => u.role === 'ADMIN');
        setOrganizations(admins);
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
        await axios.delete(`http://localhost:5000/api/super-admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrganizations(organizations.filter(org => org._id !== id));
      } catch (error) {
        console.error('Error deleting organization:', error);
        alert('Failed to delete organization');
      }
    }
  };

  const handleAddOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('http://localhost:5000/api/super-admin/users', newOrgForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsAddModalOpen(false);
      setNewOrgForm({ name: '', email: '', plan: 'Pro' });
      fetchOrganizations();
    } catch (error: any) {
      console.error('Error adding organization:', error);
      alert(error.response?.data?.message || 'Failed to create organization');
    }
  };

  const openEditModal = (org: any) => {
    setEditOrgForm({
      id: org._id,
      name: org.companyDetails?.name || '',
      email: org.email,
      plan: org.billing?.plan || 'Enterprise',
      status: org.status || 'Active'
    });
    setIsEditModalOpen(true);
  };

  const handleEditOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`http://localhost:5000/api/super-admin/users/${editOrgForm.id}`, {
        plan: editOrgForm.plan,
        status: editOrgForm.status
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

  const filteredOrgs = organizations.filter(org => {
    const name = org.companyDetails?.name?.toLowerCase() || '';
    const email = org.email?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  return (
    <div className="animate-in fade-in duration-500 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[24px] font-semibold text-white tracking-tight mb-1">Organizations</h1>
          <p className="text-[13px] text-[#A69697]">
            Tenant workspaces and platform subscriptions.
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-[12px] font-medium bg-white text-[#1A0A0B] hover:bg-white/90 transition-colors"
        >
          <Plus size={14} />
          New Organization
        </button>
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
              placeholder="Search by name or email..." 
              className="w-full pl-9 pr-4 py-2 rounded-md border outline-none text-[12px] transition-colors bg-[#1E0A0B] border-white/5 text-white focus:border-[#D98F8F]/50 placeholder:text-[#A69697]"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors bg-white/5 hover:bg-white/10 border border-white/5 text-[#A69697] hover:text-white">
              Filter
            </button>
            <button className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors bg-white/5 hover:bg-white/10 border border-white/5 text-[#A69697] hover:text-white">
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="py-3 px-5 text-[11px] uppercase tracking-wider text-[#A69697] font-medium w-[30%]">Organization</th>
                <th className="py-3 px-5 text-[11px] uppercase tracking-wider text-[#A69697] font-medium w-[30%]">Owner / Contact</th>
                <th className="py-3 px-5 text-[11px] uppercase tracking-wider text-[#A69697] font-medium w-[15%]">Plan</th>
                <th className="py-3 px-5 text-[11px] uppercase tracking-wider text-[#A69697] font-medium w-[15%]">Status</th>
                <th className="py-3 px-5 text-right w-[10%]"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Loader size={20} className="animate-spin text-[#A69697] mx-auto" />
                  </td>
                </tr>
              ) : filteredOrgs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[12px] text-[#A69697]">
                    No organizations found matching your search.
                  </td>
                </tr>
              ) : (
                filteredOrgs.map((org) => (
                  <tr key={org._id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group cursor-pointer">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded border border-white/5 bg-[#1E0A0B] flex items-center justify-center">
                          <Building size={14} className="text-[#D98F8F]" />
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-white">{org.companyDetails?.name || 'Unnamed Org'}</p>
                          <p className="text-[11px] text-[#A69697]">ID: {org._id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <p className="text-[13px] text-white">{org.email}</p>
                      <p className="text-[11px] text-[#A69697]">Created {new Date(org.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="py-3 px-5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-white border border-white/10">
                        {org.billing?.plan || 'Enterprise'}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span className="text-[12px] text-white">Active</span>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(org);
                          }}
                          className="p-1.5 rounded hover:bg-white/10 text-[#A69697] hover:text-white" 
                          title="Manage"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(org._id);
                          }}
                          className="p-1.5 rounded hover:bg-red-500/20 text-[#A69697] hover:text-red-400" 
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A050A] border border-white/10 rounded-xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[18px] font-semibold text-white">New Organization</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#A69697] hover:text-white">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddOrg} className="space-y-4">
              <div>
                <label className="block text-[12px] text-[#A69697] mb-1.5">Company Name</label>
                <input 
                  required
                  type="text" 
                  value={newOrgForm.name}
                  onChange={(e) => setNewOrgForm({...newOrgForm, name: e.target.value})}
                  className="w-full px-3 py-2 rounded-md bg-[#1E0A0B] border border-white/5 text-white text-[13px] focus:border-[#D98F8F]/50 outline-none"
                />
              </div>
              <div>
                <label className="block text-[12px] text-[#A69697] mb-1.5">Owner Email</label>
                <input 
                  required
                  type="email" 
                  value={newOrgForm.email}
                  onChange={(e) => setNewOrgForm({...newOrgForm, email: e.target.value})}
                  className="w-full px-3 py-2 rounded-md bg-[#1E0A0B] border border-white/5 text-white text-[13px] focus:border-[#D98F8F]/50 outline-none"
                />
              </div>
              <div>
                <label className="block text-[12px] text-[#A69697] mb-1.5">Subscription Plan</label>
                <select 
                  value={newOrgForm.plan}
                  onChange={(e) => setNewOrgForm({...newOrgForm, plan: e.target.value})}
                  className="w-full px-3 py-2 rounded-md bg-[#1E0A0B] border border-white/5 text-white text-[13px] focus:border-[#D98F8F]/50 outline-none appearance-none"
                >
                  <option value="Basic">Basic</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
              
              <div className="pt-4 flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-md text-[13px] font-medium text-[#A69697] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-md text-[13px] font-medium bg-white text-black hover:bg-white/90 transition-colors"
                >
                  Create Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A050A] border border-white/10 rounded-xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[18px] font-semibold text-white">Manage Organization</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-[#A69697] hover:text-white">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleEditOrg} className="space-y-5">
              {/* Read-Only Info */}
              <div className="p-3 rounded-md bg-[#1E0A0B] border border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-[#A69697] uppercase tracking-wider">Company</span>
                  <span className="text-[12px] font-medium text-white">{editOrgForm.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-[#A69697] uppercase tracking-wider">Owner Email</span>
                  <span className="text-[12px] font-medium text-white">{editOrgForm.email}</span>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-4 pt-2 border-t border-white/5">
                <div>
                  <label className="block text-[12px] text-[#A69697] mb-1.5 font-medium">Subscription Plan</label>
                  <select 
                    value={editOrgForm.plan}
                    onChange={(e) => setEditOrgForm({...editOrgForm, plan: e.target.value})}
                    className="w-full px-3 py-2 rounded-md bg-[#1E0A0B] border border-white/5 text-white text-[13px] focus:border-[#D98F8F]/50 outline-none appearance-none"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] text-[#A69697] mb-1.5 font-medium">Account Status</label>
                  <select 
                    value={editOrgForm.status}
                    onChange={(e) => setEditOrgForm({...editOrgForm, status: e.target.value})}
                    className="w-full px-3 py-2 rounded-md bg-[#1E0A0B] border border-white/5 text-white text-[13px] focus:border-[#D98F8F]/50 outline-none appearance-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Pending Deletion">Pending Deletion</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-md text-[13px] font-medium text-[#A69697] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-md text-[13px] font-medium bg-[#D98F8F] text-[#1E0A0B] hover:bg-[#D98F8F]/90 transition-colors"
                >
                  Apply Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
