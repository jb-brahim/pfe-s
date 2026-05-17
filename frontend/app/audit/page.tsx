'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { auditAPI, mockAuditLog } from '@/lib/api';
import { Download, Filter } from 'lucide-react';

interface AuditEntry {
  _id: string;
  action: string;
  user: string;
  timestamp: string;
  invoiceId: string;
}

export default function AuditPage() {
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(mockAuditLog);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const fetchAuditLog = async () => {
      try {
        const result = await auditAPI.getTrail();
        setAuditLog(result.data || mockAuditLog);
      } catch {
        setAuditLog(mockAuditLog);
      }
    };

    fetchAuditLog();
  }, []);

  const actionColors: Record<string, { border: string; bg: string; dot: string }> = {
    UPLOAD: { border: 'border-blue-500/30', bg: 'bg-blue-500/10', dot: 'bg-blue-500' },
    AI_EXTRACTION: { border: 'border-purple-500/30', bg: 'bg-purple-500/10', dot: 'bg-purple-500' },
    VERIFICATION: { border: 'border-amber-500/30', bg: 'bg-amber-500/10', dot: 'bg-amber-500' },
    APPROVE: { border: 'border-green-500/30', bg: 'bg-green-500/10', dot: 'bg-green-500' },
    REJECT: { border: 'border-red-500/30', bg: 'bg-red-500/10', dot: 'bg-red-500' },
    UPDATE: { border: 'border-cyan-500/30', bg: 'bg-cyan-500/10', dot: 'bg-cyan-500' },
  };

  const filteredLogs = auditLog.filter((log) => {
    if (selectedAction && log.action !== selectedAction) return false;
    if (dateFrom) {
      const logDate = new Date(log.timestamp).getTime();
      const fromDate = new Date(dateFrom).getTime();
      if (logDate < fromDate) return false;
    }
    if (dateTo) {
      const logDate = new Date(log.timestamp).getTime();
      const toDate = new Date(dateTo).getTime();
      if (logDate > toDate) return false;
    }
    return true;
  });

  const uniqueActions = Array.from(new Set(auditLog.map((log) => log.action)));

  const handleExport = () => {
    const csv = [
      ['Date', 'Action', 'User', 'Invoice ID'],
      ...filteredLogs.map((log) => [
        new Date(log.timestamp).toLocaleString(),
        log.action,
        log.user,
        log.invoiceId,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Audit Trails</h1>
            <p className="text-white/60">Immutable record of all system activities and changes.</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 btn-rose-gold text-sm"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Filter size={20} className="text-[#B76E79]" />
            <h2 className="text-lg font-bold text-white">Filters</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {/* Action Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Action Type</label>
              <select
                value={selectedAction || ''}
                onChange={(e) => setSelectedAction(e.target.value || null)}
                className="glass-input w-full"
              >
                <option value="">All Actions</option>
                {uniqueActions.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="glass-input w-full"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="glass-input w-full"
              />
            </div>

            {/* Reset */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedAction(null);
                  setDateFrom('');
                  setDateTo('');
                }}
                className="w-full px-4 py-2 rounded-lg glass-card text-white/70 hover:text-white transition-colors font-medium"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {filteredLogs.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <p className="text-white/60">No audit entries found</p>
            </div>
          ) : (
            filteredLogs.map((log, index) => {
              const colors = actionColors[log.action] || actionColors.UPDATE;
              return (
                <div key={log._id} className={`glass-card p-6 border-l-4 ${colors.border}`}>
                  <div className="flex gap-4">
                    {/* Timeline Dot */}
                    <div className="relative flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full ${colors.dot} border-4 border-[#121212]`}></div>
                      {index < filteredLogs.length - 1 && (
                        <div className={`w-1 h-16 ${colors.dot} opacity-20 mt-2`}></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-white font-bold">{log.action}</h3>
                          <p className="text-white/60 text-sm">
                            By <span className="text-white font-medium">{log.user}</span>
                          </p>
                        </div>
                        <span className="text-white/40 text-sm">
                          {new Date(log.timestamp).toLocaleDateString()} at{' '}
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-white/50 text-sm">
                        Invoice ID: <span className="text-white/70">{log.invoiceId}</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { label: 'Total Activities', value: auditLog.length },
            { label: 'Uploads', value: auditLog.filter((l) => l.action === 'UPLOAD').length },
            { label: 'Approvals', value: auditLog.filter((l) => l.action === 'APPROVE').length },
            { label: 'Rejections', value: auditLog.filter((l) => l.action === 'REJECT').length },
          ].map((stat, idx) => (
            <div key={idx} className="glass-card p-6">
              <p className="text-white/60 text-sm mb-2">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
