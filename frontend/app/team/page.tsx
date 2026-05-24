'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { userAPI, auditAPI } from '@/lib/api';
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



const performanceData = [
  { month: 'Jan', processed: 0, time: 0 },
];

export default function TeamPage() {
  const { user: currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeesList, setEmployeesList] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  // Invite modal fields
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('Analyst');

  // Action menu tracking
  const [actionMenuUserId, setActionMenuUserId] = useState<string | null>(null);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const [res, auditRes] = await Promise.all([
        userAPI.getStats(),
        auditAPI.getTrail()
      ]);
      
      if (res.data) {
        setEmployeesList(res.data);
      }
      
      if (auditRes.data) {
        const formattedLogs = auditRes.data.slice(0, 50).map((log: any) => ({
          id: log._id,
          user: log.userId?.name || log.user || 'System',
          action: log.action === 'CREATE' || log.action === 'UPLOAD' ? 'uploaded a new invoice' : 
                 log.action === 'APPROVE' ? 'approved an invoice' : 
                 log.action === 'REJECT' ? 'rejected an invoice' : 
                 log.action === 'EXTRACT' ? 'extracted data from an invoice' : 
                 log.action === 'AI_EXTRACTION' ? 'ran AI data extraction' :
                 log.action === 'VERIFICATION' ? 'verified invoice data' :
                 `${log.action.toLowerCase().replace(/_/g, ' ')}`,
          rawAction: log.action || 'UPDATE',
          time: new Date(log.createdAt || log.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          img: log.userId?.profileImage ? `http://localhost:5000/${log.userId.profileImage}` : `https://i.pravatar.cc/150?u=${log.userId?.email || 'user'}`,
          entityId: log.entityId || log.invoiceId || 'N/A',
          entityType: log.entityType || 'Invoice'
        }));
        setActivityLogs(formattedLogs);
      }
    } catch (err) {
      toast.error('Failed to load team data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) {
      toast.error('Email and Full Name are required.');
      return;
    }
    
    // Generate a secure random password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let generatedPassword = '';
    for (let i = 0; i < 12; i++) {
      generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Map UI role to backend DB role enum
    const apiRole: 'ADMIN' | 'ACCOUNTANT' = inviteRole === 'Admin' ? 'ADMIN' : 'ACCOUNTANT';

    try {
      const res = await userAPI.invite(inviteEmail, apiRole, inviteName, generatedPassword);
      if (res.success) {
        toast.success(`Invite sent to ${inviteName}! They will receive an email with their auto-generated password.`);
        
        // Log the generated password to the console for demonstration purposes
        console.log(`[EMAIL SIMULATION] Sent to: ${inviteEmail} | Role: ${inviteRole} | Password: ${generatedPassword}`);
        
        setInviteEmail('');
        setInviteName('');
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
        </div>

        {/* TOP ROW: Employee Table & Invite Form */}
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_350px] gap-6">
          
          {/* Invite Employee Form (Always Visible) */}
          {currentUser?.role === 'ADMIN' && (
            <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.08)] rounded-[24px] shadow-lg flex flex-col h-fit overflow-hidden relative order-first lg:order-last">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#D98F8F] to-transparent"></div>
              <form onSubmit={handleInvite} className="p-6">
                <div className="flex items-center mb-6">
                  <h3 className="text-white text-[18px] font-bold flex items-center gap-2">
                    <UserPlus size={18} className="text-[#D98F8F]"/> Invite Employee
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[#A69697] text-[13px] block mb-1">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="e.g. employee@company.com" 
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full bg-[#1A0A0B] border border-white/10 rounded-[12px] py-2.5 px-4 text-[13px] text-white outline-none focus:border-[#D98F8F] transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="text-[#A69697] text-[13px] block mb-1">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Jane Doe" 
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="w-full bg-[#1A0A0B] border border-white/10 rounded-[12px] py-2.5 px-4 text-[13px] text-white outline-none focus:border-[#D98F8F] transition-colors" 
                    />
                  </div>

                  <div>
                    <label className="text-[#A69697] text-[13px] block mb-1">Primary Role</label>
                    <select 
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full bg-[#1A0A0B] border border-white/10 rounded-[12px] py-2.5 px-4 text-[13px] text-white outline-none focus:border-[#D98F8F] transition-colors appearance-none cursor-pointer"
                    >
                      <option className="bg-[#1A0A0B]">Analyst</option>
                      <option className="bg-[#1A0A0B]">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button type="submit" className="w-full py-2.5 rounded-[12px] bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white font-bold text-[13px] shadow-lg hover:shadow-[0_0_15px_rgba(217,143,143,0.4)] transition-all">
                    Send Invite
                  </button>
                </div>
              </form>
            </div>
          )}
          
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
          
        </div>

        {/* BOTTOM ROW: Activity */}
        <div className="w-full mt-2">
          
          {/* Recent Activity */}
          <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-6 shadow-lg">
            <h3 className="text-[#FFFFFF] text-[16px] font-bold mb-6 flex items-center gap-2">
              <Activity className="text-[#D98F8F]" size={16}/> Activity Logs
            </h3>
            
            <div className="flex flex-col gap-5 max-h-[320px] overflow-y-auto pr-4 custom-scrollbar">
              {activityLogs.length === 0 ? (
                <p className="text-[#A69697] text-[13px] text-center py-4">No recent activity</p>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="flex gap-4 items-center justify-between p-4 rounded-[12px] bg-[#1A0A0B]/30 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex gap-4 items-center">
                      <img src={log.img} className="w-10 h-10 rounded-full border border-white/10 shrink-0 object-cover" />
                      <div>
                        <p className="text-[14px] text-white leading-snug">
                          <span className="font-bold">{log.user}</span> {log.action}
                        </p>
                        <p className="text-[12px] text-[#A69697] flex items-center gap-1 mt-1">
                          <Clock size={12} /> {log.time}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8 pr-4 hidden md:flex">
                      <div className="flex flex-col items-end">
                        <span className="text-[#A69697] text-[11px] uppercase tracking-wider font-bold">Document ID</span>
                        <span className="text-white text-[13px] font-mono mt-0.5">#{log.entityId.substring(0, 8).toUpperCase()}</span>
                      </div>
                      <div className="flex flex-col items-end w-24">
                        <span className="text-[#A69697] text-[11px] uppercase tracking-wider font-bold">Type</span>
                        <span className="text-[#D98F8F] text-[13px] font-medium mt-0.5">{log.entityType}</span>
                      </div>
                      <div className="w-24 flex justify-end">
                        {log.rawAction === 'APPROVE' ? (
                           <span className="bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30 px-2.5 py-1 rounded-[8px] text-[11px] font-bold tracking-wide">APPROVED</span>
                        ) : log.rawAction === 'REJECT' ? (
                           <span className="bg-[#D98F8F]/10 text-[#D98F8F] border border-[#D98F8F]/30 px-2.5 py-1 rounded-[8px] text-[11px] font-bold tracking-wide">REJECTED</span>
                        ) : log.rawAction === 'VERIFICATION' ? (
                           <span className="bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/30 px-2.5 py-1 rounded-[8px] text-[11px] font-bold tracking-wide">VERIFIED</span>
                        ) : (
                           <span className="bg-white/5 text-[#A69697] border border-white/10 px-2.5 py-1 rounded-[8px] text-[11px] font-bold tracking-wide">{log.rawAction}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>



      </div>
    </DashboardLayout>
  );
}
