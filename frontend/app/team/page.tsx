'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { userAPI } from '@/lib/api';
import { toast } from 'sonner';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import { Search, Plus, MoreHorizontal, CheckCircle2, Shield, ArrowRight, UserPlus, X, Clock, Activity, Settings2 } from 'lucide-react';

interface Employee {
  userId: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ACCOUNTANT';
  approvalLevel?: number;
  profileImage?: string;
  totalInvoices: number;
  approved: number;
  rejected: number;
  pending: number;
  totalExpenses: number;
  approvalRate: number;
}

const activityLogs: any[] = [];

const performanceData = [
  { month: 'Jan', processed: 0, time: 0 },
];

export default function TeamPage() {
  const { user: currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeesList, setEmployeesList] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Invite modal fields
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteRole, setInviteRole] = useState('Analyst');

  // Action menu tracking
  const [actionMenuUserId, setActionMenuUserId] = useState<string | null>(null);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const res = await userAPI.getStats();
      if (res.data) {
        setEmployeesList(res.data);
      }
    } catch (err) {
      toast.error('Failed to load team directory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim() || !invitePassword.trim()) {
      toast.error('Email, Full Name, and Password are required.');
      return;
    }
    
    // Map UI role to backend DB role enum
    const apiRole: 'ADMIN' | 'ACCOUNTANT' = inviteRole === 'Admin' ? 'ADMIN' : 'ACCOUNTANT';

    try {
      const res = await userAPI.invite(inviteEmail, apiRole, inviteName, invitePassword);
      if (res.success) {
        toast.success(`Successfully invited ${inviteName}!`);
        setIsModalOpen(false);
        setInviteEmail('');
        setInviteName('');
        setInvitePassword('');
        setInviteRole('Analyst');
        loadEmployees();
      } else {
        toast.error('Failed to invite employee');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to invite employee');
    }
  };

  const handleRoleToggle = async (userId: string, currentRole: 'ADMIN' | 'ACCOUNTANT') => {
    if (userId === currentUser?._id) {
      toast.error('You cannot change your own role.');
      return;
    }
    const newRole = currentRole === 'ADMIN' ? 'ACCOUNTANT' : 'ADMIN';
    try {
      await userAPI.updateRole(userId, newRole);
      toast.success('Employee role updated successfully');
      loadEmployees();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleLevelToggle = async (userId: string, currentLevel: number) => {
    const newLevel = currentLevel === 1 ? 2 : 1;
    try {
      await userAPI.updateLevel(userId, newLevel);
      toast.success(`Accountant level updated successfully`);
      loadEmployees();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update user level');
    }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (userId === currentUser?._id) {
      toast.error('You cannot delete your own account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to remove ${name} from the team?`)) {
      return;
    }
    try {
      await userAPI.deleteUser(userId);
      toast.success(`${name} has been removed from the team.`);
      loadEmployees();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const getRoleBadge = (role: string, level?: number) => {
    switch(role) {
      case 'ADMIN': return <span className="bg-[#8E1B3A]/30 text-[#D98F8F] border border-[#8E1B3A]/50 px-2.5 py-0.5 rounded-[8px] text-[11px] font-bold tracking-wide">Admin</span>;
      case 'ACCOUNTANT': return <span className="bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/30 px-2.5 py-0.5 rounded-[8px] text-[11px] font-bold tracking-wide">Accountant {level === 2 ? 'L2' : 'L1'}</span>;
      default: return <span className="bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30 px-2.5 py-0.5 rounded-[8px] text-[11px] font-bold tracking-wide">{role}</span>;
    }
  };

  const getTitle = (empName: string, role: string) => {
    if (empName.includes('Sarah') || empName.includes('Admin') || role === 'ADMIN') return 'IT Administrator';
    if (empName.includes('Eleanor') || empName.includes('Pena')) return 'Finance Manager';
    if (empName.includes('Carter') || empName.includes('Ben')) return 'Senior Manager';
    return 'Financial Analyst';
  };

  const getDept = (empName: string, role: string) => {
    if (empName.includes('Sarah') || empName.includes('Admin') || role === 'ADMIN') return 'IT';
    if (empName.includes('Carter') || empName.includes('Ben')) return 'Operations';
    return 'Finance';
  };

  // Filtered employees by search
  const filteredEmployees = employeesList.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Dynamic hierarchy mapping based on loaded data
  const accountants = employeesList.filter(e => e.role === 'ACCOUNTANT');
  const admins = employeesList.filter(e => e.role === 'ADMIN');

  const lvl1 = accountants.filter(e => (e.approvalLevel || 1) === 1)[0] || null;
  const lvl2 = accountants.filter(e => e.approvalLevel === 2)[0] || null;
  const lvl3 = admins[0] || null;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 w-full pb-10 max-w-[1600px] mx-auto relative">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-[32px] font-bold tracking-tight mb-1 text-[#FFFFFF]">Team Management</h1>
            <p className="text-[#A69697] text-[15px]">Manage access controls, approval hierarchies, and team performance.</p>
          </div>
          
          <div className="flex gap-3">
            <button className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[#A69697] px-4 py-2.5 rounded-[12px] text-[14px] font-medium hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2">
              <Settings2 size={16} /> Manage Roles
            </button>
            {currentUser?.role === 'ADMIN' && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white px-5 py-2.5 rounded-[12px] text-[14px] font-bold shadow-[0_0_15px_rgba(142,27,58,0.4)] hover:shadow-[0_0_25px_rgba(217,143,143,0.5)] transition-all flex items-center gap-2"
              >
                <UserPlus size={16} /> Invite Employee
              </button>
            )}
          </div>
        </div>

        {/* TOP ROW: Employee Table & Roles */}
        <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
          
          {/* Employee Directory */}
          <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.08)] rounded-[24px] shadow-lg flex flex-col overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-[#FFFFFF] text-[18px] font-bold">Employee Directory</h3>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A69697]" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#1A0A0B] border border-white/10 rounded-[10px] py-2 pl-9 pr-4 text-[13px] text-[#FFFFFF] outline-none focus:border-[#D98F8F]/50 transition-colors placeholder:text-[#A69697] w-[200px]"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[#A69697] text-[12px] uppercase tracking-wider bg-[rgba(0,0,0,0.2)]">
                    <th className="py-4 px-6 font-semibold">User</th>
                    <th className="py-4 px-6 font-semibold">Department</th>
                    <th className="py-4 px-6 font-semibold">Role</th>
                    <th className="py-4 px-6 font-semibold">Invoices Processed</th>
                    <th className="py-4 px-6 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-[#FFFFFF] text-[14px]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-[#A69697]">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-6 h-6 border-2 border-[#D98F8F] border-t-transparent rounded-full animate-spin"></div>
                          Loading employee data...
                        </div>
                      </td>
                    </tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-[#A69697]">
                        No employees found.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <tr key={emp.userId} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img 
                              src={emp.profileImage ? `http://localhost:5000/${emp.profileImage}` : `https://i.pravatar.cc/150?u=${emp.email}`} 
                              alt={emp.name} 
                              className="w-10 h-10 rounded-full border border-white/10 object-cover" 
                            />
                            <div>
                              <p className="font-bold text-[14px] text-white">{emp.name}</p>
                              <p className="text-[#A69697] text-[12px]">{getTitle(emp.name, emp.role)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-[#A69697] text-[13px]">{getDept(emp.name, emp.role)}</td>
                        <td className="py-4 px-6">{getRoleBadge(emp.role, emp.approvalLevel)}</td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-white text-[13px] font-bold">{emp.totalInvoices} Invoices</span>
                            <span className="text-[#A69697] text-[11px]">Approval rate: {emp.approvalRate}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 relative">
                          <div className="flex items-center justify-end">
                            <button 
                              onClick={() => setActionMenuUserId(actionMenuUserId === emp.userId ? null : emp.userId)}
                              className="text-[#A69697] hover:text-[#D98F8F] p-2 transition-colors"
                            >
                              <MoreHorizontal size={18} />
                            </button>
                            
                            {actionMenuUserId === emp.userId && (
                              <div className="absolute right-6 top-12 bg-[#1A0A0B] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-30 w-44">
                                <div className="p-1">
                                  {currentUser?.role === 'ADMIN' && emp.userId !== currentUser?._id && (
                                    <>
                                      <button 
                                        onClick={() => {
                                          handleRoleToggle(emp.userId, emp.role);
                                          setActionMenuUserId(null);
                                        }}
                                        className="w-full text-left px-3 py-2 text-[12px] text-[#A69697] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                      >
                                        Change to {emp.role === 'ADMIN' ? 'Accountant' : 'Admin'}
                                      </button>
                                      {emp.role === 'ACCOUNTANT' && (
                                        <button 
                                          onClick={() => {
                                            handleLevelToggle(emp.userId, emp.approvalLevel || 1);
                                            setActionMenuUserId(null);
                                          }}
                                          className="w-full text-left px-3 py-2 text-[12px] text-[#FFC107] hover:text-white hover:bg-[#FFC107]/20 rounded-lg transition-colors"
                                        >
                                          {(emp.approvalLevel || 1) === 1 ? 'Promote to Level 2' : 'Demote to Level 1'}
                                        </button>
                                      )}
                                      <button 
                                        onClick={() => {
                                          handleDelete(emp.userId, emp.name);
                                          setActionMenuUserId(null);
                                        }}
                                        className="w-full text-left px-3 py-2 text-[12px] text-[#D98F8F] hover:text-white hover:bg-[#8E1B3A]/20 rounded-lg transition-colors"
                                      >
                                        Delete Employee
                                      </button>
                                    </>
                                  )}
                                  {emp.userId === currentUser?._id && (
                                    <span className="block px-3 py-2 text-[11px] text-[#A69697]/50 italic">
                                      You (Current User)
                                    </span>
                                  )}
                                  {currentUser?.role !== 'ADMIN' && emp.userId !== currentUser?._id && (
                                    <span className="block px-3 py-2 text-[11px] text-[#A69697]/50 italic">
                                      Admin access required
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Roles & Permissions Reference */}
          <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.08)] rounded-[24px] shadow-lg p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#FFFFFF] text-[18px] font-bold flex items-center gap-2">
                <Shield className="text-[#D98F8F]" size={18} /> Roles & Permissions
              </h3>
            </div>

            <div className="flex flex-col gap-4 flex-1">
              {/* Accountant Role Card */}
              <div className="bg-[#1A0A0B]/50 border border-white/5 rounded-[16px] p-5 hover:border-[#D98F8F]/30 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  {getRoleBadge('ACCOUNTANT')}
                </div>
                <ul className="space-y-3">
                  {['View all invoices & logs', 'Upload and extract invoice details', 'Approve invoices up to 5,000 TND', 'Manage layouts & settings'].map((perm, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] text-[#A69697]">
                      <CheckCircle2 size={14} className="text-[#4CAF50] mt-0.5 shrink-0" />
                      <span>{perm}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Admin Role Card */}
              <div className="bg-[#1A0A0B]/50 border border-[#8E1B3A]/30 rounded-[16px] p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#8E1B3A] rounded-full blur-[50px] opacity-20 pointer-events-none"></div>
                <div className="flex items-center gap-2 mb-4 relative z-10">
                  {getRoleBadge('ADMIN')}
                </div>
                <ul className="space-y-3 relative z-10">
                  {['Full administrative system control', 'Invite, delete and edit team members', 'Change platform-wide parameters', 'Unlimited approval thresholds'].map((perm, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] text-white/80">
                      <CheckCircle2 size={14} className="text-[#D98F8F] mt-0.5 shrink-0" />
                      <span>{perm}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
        </div>

        {/* BOTTOM ROW: Hierarchy, Activity, Performance */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Approval Hierarchy */}
          <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-6 shadow-lg">
            <h3 className="text-[#FFFFFF] text-[16px] font-bold mb-6">Approval Hierarchy</h3>
            
            <div className="flex items-center justify-between relative mt-4">
              {/* Connecting Line */}
              <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-gradient-to-r from-[#D98F8F]/50 to-[#8E1B3A]/50 -translate-y-1/2 z-0"></div>
              
              {/* Level 1 */}
              {lvl1 && (
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <p className="text-[#A69697] text-[11px] uppercase tracking-widest font-bold">Level 1</p>
                  <div className="bg-[#1A0A0B] border border-white/10 rounded-[12px] p-2.5 flex flex-col items-center shadow-lg hover:border-[#D98F8F]/50 transition-all cursor-pointer">
                    <img src={lvl1.profileImage ? `http://localhost:5000/${lvl1.profileImage}` : `https://i.pravatar.cc/150?u=${lvl1.name}`} className="w-8 h-8 rounded-full mb-2 object-cover" />
                    <p className="text-white text-[12px] font-bold">{lvl1.name}</p>
                    <p className="text-[#4CAF50] text-[10px]">Limit: 500 TND</p>
                  </div>
                </div>
              )}

              {/* Level 2 */}
              {lvl2 && (
                <div className="relative z-10 flex flex-col items-center gap-2 mt-8">
                  <p className="text-[#A69697] text-[11px] uppercase tracking-widest font-bold">Level 2</p>
                  <div className="bg-[#1A0A0B] border border-[#8E1B3A]/50 rounded-[12px] p-2.5 flex flex-col items-center shadow-[0_0_15px_rgba(142,27,58,0.3)] hover:border-[#D98F8F] transition-all cursor-pointer">
                    <img src={lvl2.profileImage ? `http://localhost:5000/${lvl2.profileImage}` : `https://i.pravatar.cc/150?u=${lvl2.name}`} className="w-8 h-8 rounded-full mb-2 object-cover" />
                    <p className="text-white text-[12px] font-bold">{lvl2.name}</p>
                    <p className="text-[#D98F8F] text-[10px]">Limit: 5,000 TND</p>
                  </div>
                </div>
              )}

              {/* Level 3 */}
              {lvl3 && (
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <p className="text-[#A69697] text-[11px] uppercase tracking-widest font-bold">Level 3</p>
                  <div className="bg-[#1A0A0B] border border-white/10 rounded-[12px] p-2.5 flex flex-col items-center shadow-lg hover:border-[#D98F8F]/50 transition-all cursor-pointer">
                    <img src={lvl3.profileImage ? `http://localhost:5000/${lvl3.profileImage}` : `https://i.pravatar.cc/150?u=${lvl3.name}`} className="w-8 h-8 rounded-full mb-2 object-cover" />
                    <p className="text-white text-[12px] font-bold">{lvl3.name}</p>
                    <p className="text-[#A69697] text-[10px]">Limit: Unlimited</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-6 shadow-lg">
            <h3 className="text-[#FFFFFF] text-[16px] font-bold mb-6 flex items-center gap-2">
              <Activity className="text-[#D98F8F]" size={16}/> Activity Logs
            </h3>
            
            <div className="flex flex-col gap-5">
              {activityLogs.length === 0 ? (
                <p className="text-[#A69697] text-[13px] text-center py-4">No recent activity</p>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="flex gap-4 items-start">
                    <img src={log.img} className="w-8 h-8 rounded-full border border-white/10 shrink-0" />
                    <div>
                      <p className="text-[13px] text-white leading-snug">
                        <span className="font-bold">{log.user}</span> {log.action}
                      </p>
                      <p className="text-[11px] text-[#A69697] flex items-center gap-1 mt-1">
                        <Clock size={10} /> {log.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Performance Widgets */}
          <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-6 shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#D98F8F] rounded-full blur-[80px] opacity-10 pointer-events-none"></div>
            
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-[#FFFFFF] text-[16px] font-bold">Avg. Approval Time</h3>
                <p className="text-[#A69697] text-[12px]">Team wide metric</p>
              </div>
              <div className="bg-[#4CAF50]/10 text-[#4CAF50] px-2 py-1 rounded-[6px] text-[11px] font-bold">
                0%
              </div>
            </div>
            
            <h2 className="text-[36px] font-bold text-white tracking-tight mb-4">
              0.00 <span className="text-[16px] text-[#A69697] font-normal tracking-normal">hrs</span>
            </h2>

            <div className="h-[80px] w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="perfColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D98F8F" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#D98F8F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ backgroundColor: '#1A0A0B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="time" stroke="#D98F8F" strokeWidth={3} fillOpacity={1} fill="url(#perfColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Modal Overlay */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#1A0A0B] border border-white/10 rounded-[24px] w-full max-w-[400px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative overflow-hidden">
              {/* Modal Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#D98F8F] to-transparent"></div>
              
              <form onSubmit={handleInvite} className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white text-[20px] font-bold">Invite Employee</h3>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="text-[#A69697] hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[#A69697] text-[13px] block mb-1">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="e.g. employee@company.com" 
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-[12px] py-3 px-4 text-[14px] text-white outline-none focus:border-[#D98F8F] transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="text-[#A69697] text-[13px] block mb-1">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Jane Doe" 
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-[12px] py-3 px-4 text-[14px] text-white outline-none focus:border-[#D98F8F] transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="text-[#A69697] text-[13px] block mb-1">Temporary Password</label>
                    <input 
                      type="password" 
                      placeholder="Enter a secure password" 
                      value={invitePassword}
                      onChange={(e) => setInvitePassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-[12px] py-3 px-4 text-[14px] text-white outline-none focus:border-[#D98F8F] transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="text-[#A69697] text-[13px] block mb-1">Primary Role</label>
                    <select 
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-[12px] py-3 px-4 text-[14px] text-white outline-none focus:border-[#D98F8F] transition-colors appearance-none cursor-pointer"
                    >
                      <option className="bg-[#1A0A0B]">Analyst</option>
                      <option className="bg-[#1A0A0B]">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-[12px] bg-white/5 text-white font-medium hover:bg-white/10 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-3 rounded-[12px] bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white font-bold shadow-lg hover:shadow-[0_0_15px_rgba(217,143,143,0.4)] transition-all">
                    Send Invite
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
