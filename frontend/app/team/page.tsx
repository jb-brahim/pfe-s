'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import { Search, Plus, MoreHorizontal, CheckCircle2, Shield, ArrowRight, UserPlus, X, Clock, Activity, Settings2 } from 'lucide-react';

const employees = [
  { id: 1, user: 'Eleanor Pena', title: 'Financial Analyst', dept: 'Finance', role: 'Analyst', status: 'Active', img: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  { id: 2, user: 'Ben Carter', title: 'Senior Manager', dept: 'Operations', role: 'Manager', status: 'Active', img: 'https://i.pravatar.cc/150?u=1' },
  { id: 3, user: 'System Admin', title: 'IT Administrator', dept: 'IT', role: 'Admin', status: 'Active', img: 'https://i.pravatar.cc/150?u=3' },
  { id: 4, user: 'Bandr Miere', title: 'Junior Analyst', dept: 'Finance', role: 'Analyst', status: 'Pending', img: 'https://i.pravatar.cc/150?u=4' },
  { id: 5, user: 'Jane Doe', title: 'Department Head', dept: 'Operations', role: 'Manager', status: 'Active', img: 'https://i.pravatar.cc/150?u=2' },
];

const activityLogs = [
  { id: 1, user: 'Admin', action: 'added Jane Doe to Finance', time: '2 hours ago', img: 'https://i.pravatar.cc/150?u=3' },
  { id: 2, user: 'Ben Carter', action: 'approved invoice #TC-4533', time: '5 hours ago', img: 'https://i.pravatar.cc/150?u=1' },
  { id: 3, user: 'Jane Doe', action: 'accepted invitation', time: '1 day ago', img: 'https://i.pravatar.cc/150?u=2' },
];

const performanceData = [
  { month: 'Jan', processed: 120, time: 45 },
  { month: 'Feb', processed: 180, time: 42 },
  { month: 'Mar', processed: 150, time: 38 },
  { month: 'Apr', processed: 250, time: 35 },
  { month: 'May', processed: 220, time: 36 },
];

export default function TeamPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'Admin': return <span className="bg-[#8E1B3A]/30 text-[#D98F8F] border border-[#8E1B3A]/50 px-2.5 py-0.5 rounded-[8px] text-[11px] font-bold tracking-wide">Admin</span>;
      case 'Manager': return <span className="bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/30 px-2.5 py-0.5 rounded-[8px] text-[11px] font-bold tracking-wide">Manager</span>;
      case 'Analyst': return <span className="bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30 px-2.5 py-0.5 rounded-[8px] text-[11px] font-bold tracking-wide">Analyst</span>;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'Active' 
      ? <span className="flex items-center gap-1.5 text-[#4CAF50] text-[12px] font-medium"><span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] animate-pulse"></span>Active</span>
      : <span className="flex items-center gap-1.5 text-[#FFC107] text-[12px] font-medium"><span className="w-1.5 h-1.5 rounded-full bg-[#FFC107]"></span>Pending Invite</span>;
  };

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
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white px-5 py-2.5 rounded-[12px] text-[14px] font-bold shadow-[0_0_15px_rgba(142,27,58,0.4)] hover:shadow-[0_0_25px_rgba(217,143,143,0.5)] transition-all flex items-center gap-2"
            >
              <UserPlus size={16} /> Invite Employee
            </button>
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
                    <th className="py-4 px-6 font-semibold">Status</th>
                    <th className="py-4 px-6 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-[#FFFFFF] text-[14px]">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img src={emp.img} alt={emp.user} className="w-10 h-10 rounded-full border border-white/10" />
                          <div>
                            <p className="font-bold text-[14px] text-white">{emp.user}</p>
                            <p className="text-[#A69697] text-[12px]">{emp.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[#A69697] text-[13px]">{emp.dept}</td>
                      <td className="py-4 px-6">{getRoleBadge(emp.role)}</td>
                      <td className="py-4 px-6">{getStatusBadge(emp.status)}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end">
                          <button className="text-[#A69697] hover:text-[#D98F8F] p-2 transition-colors">
                            <MoreHorizontal size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
              {/* Analyst Role Card */}
              <div className="bg-[#1A0A0B]/50 border border-white/5 rounded-[16px] p-5 hover:border-[#D98F8F]/30 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  {getRoleBadge('Analyst')}
                </div>
                <ul className="space-y-3">
                  {['View assigned invoices', 'Create draft reports', 'Approve invoices up to 500 TND', 'Leave comments on workflow'].map((perm, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] text-[#A69697]">
                      <CheckCircle2 size={14} className="text-[#4CAF50] mt-0.5 shrink-0" />
                      <span>{perm}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Manager Role Card */}
              <div className="bg-[#1A0A0B]/50 border border-[#8E1B3A]/30 rounded-[16px] p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#8E1B3A] rounded-full blur-[50px] opacity-20 pointer-events-none"></div>
                <div className="flex items-center gap-2 mb-4 relative z-10">
                  {getRoleBadge('Manager')}
                </div>
                <ul className="space-y-3 relative z-10">
                  {['View all department invoices', 'Approve invoices up to 5,000 TND', 'Re-assign invoices to team', 'Export final financial reports'].map((perm, i) => (
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
              <div className="relative z-10 flex flex-col items-center gap-2">
                <p className="text-[#A69697] text-[11px] uppercase tracking-widest font-bold">Level 1</p>
                <div className="bg-[#1A0A0B] border border-white/10 rounded-[12px] p-2 flex flex-col items-center shadow-lg hover:border-[#D98F8F]/50 transition-all cursor-pointer">
                  <img src={employees[0].img} className="w-8 h-8 rounded-full mb-2" />
                  <p className="text-white text-[12px] font-bold">{employees[0].user}</p>
                  <p className="text-[#4CAF50] text-[10px]">Limit: $500</p>
                </div>
              </div>

              {/* Level 2 */}
              <div className="relative z-10 flex flex-col items-center gap-2 mt-8">
                <p className="text-[#A69697] text-[11px] uppercase tracking-widest font-bold">Level 2</p>
                <div className="bg-[#1A0A0B] border border-[#8E1B3A]/50 rounded-[12px] p-2 flex flex-col items-center shadow-[0_0_15px_rgba(142,27,58,0.3)] hover:border-[#D98F8F] transition-all cursor-pointer">
                  <img src={employees[1].img} className="w-8 h-8 rounded-full mb-2" />
                  <p className="text-white text-[12px] font-bold">{employees[1].user}</p>
                  <p className="text-[#D98F8F] text-[10px]">Limit: $5,000</p>
                </div>
              </div>

              {/* Level 3 */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <p className="text-[#A69697] text-[11px] uppercase tracking-widest font-bold">Level 3</p>
                <div className="bg-[#1A0A0B] border border-white/10 rounded-[12px] p-2 flex flex-col items-center shadow-lg hover:border-[#D98F8F]/50 transition-all cursor-pointer">
                  <img src={employees[2].img} className="w-8 h-8 rounded-full mb-2" />
                  <p className="text-white text-[12px] font-bold">Admin</p>
                  <p className="text-[#A69697] text-[10px]">Limit: Unlmtd</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-6 shadow-lg">
            <h3 className="text-[#FFFFFF] text-[16px] font-bold mb-6 flex items-center gap-2">
              <Activity className="text-[#D98F8F]" size={16}/> Activity Logs
            </h3>
            
            <div className="flex flex-col gap-5">
              {activityLogs.map((log) => (
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
              ))}
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
                -12%
              </div>
            </div>
            
            <h2 className="text-[36px] font-bold text-white tracking-tight mb-4">
              36.09 <span className="text-[16px] text-[#A69697] font-normal tracking-normal">hrs</span>
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
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white text-[20px] font-bold">Invite Employee</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-[#A69697] hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[#A69697] text-[13px] block mb-1">Email Address</label>
                    <input type="email" placeholder="e.g. employee@company.com" className="w-full bg-white/5 border border-white/10 rounded-[12px] py-3 px-4 text-[14px] text-white outline-none focus:border-[#D98F8F] transition-colors" />
                  </div>
                  <div>
                    <label className="text-[#A69697] text-[13px] block mb-1">Full Name</label>
                    <input type="text" placeholder="e.g. Jane Doe" className="w-full bg-white/5 border border-white/10 rounded-[12px] py-3 px-4 text-[14px] text-white outline-none focus:border-[#D98F8F] transition-colors" />
                  </div>
                  <div>
                    <label className="text-[#A69697] text-[13px] block mb-1">Primary Role</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-[12px] py-3 px-4 text-[14px] text-white outline-none focus:border-[#D98F8F] transition-colors appearance-none cursor-pointer">
                      <option className="bg-[#1A0A0B]">Analyst</option>
                      <option className="bg-[#1A0A0B]">Manager</option>
                      <option className="bg-[#1A0A0B]">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-[12px] bg-white/5 text-white font-medium hover:bg-white/10 transition-colors">
                    Cancel
                  </button>
                  <button className="flex-1 py-3 rounded-[12px] bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white font-bold shadow-lg hover:shadow-[0_0_15px_rgba(217,143,143,0.4)] transition-all">
                    Send Invite
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
