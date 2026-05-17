'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { notificationAPI, mockNotifications } from '@/lib/api';
import { AlertCircle, Info, AlertTriangle, Check } from 'lucide-react';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const result = await notificationAPI.getAll();
        setNotifications(result.data || mockNotifications);
      } catch {
        setNotifications(mockNotifications);
      }
    };

    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter((n) => filter === 'ALL' || n.severity === filter);

  const getSeverityStyles = (severity: string) => {
    const styles: Record<string, { bg: string; border: string; icon: React.ReactNode }> = {
      HIGH: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        icon: <AlertCircle className="text-red-400" size={20} />,
      },
      MEDIUM: {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        icon: <AlertTriangle className="text-amber-400" size={20} />,
      },
      LOW: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        icon: <Info className="text-blue-400" size={20} />,
      },
    };
    return styles[severity] || styles.LOW;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Notifications Center</h1>
          <p className="text-white/60">Alerts and updates from your invoice processing system.</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-[#B76E79] to-[#D4969F] text-white'
                  : 'glass-card text-white/70 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Check className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-white font-medium">All caught up!</p>
              <p className="text-white/60 text-sm mt-1">No {filter !== 'ALL' ? filter.toLowerCase() : ''} notifications</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const { bg, border, icon } = getSeverityStyles(notification.severity);
              return (
                <div key={notification._id} className={`glass-card p-6 border ${border} ${bg}`}>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 pt-1">{icon}</div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-sm">{notification.title}</h3>
                      <p className="text-white/70 text-sm mt-2">{notification.message}</p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-white/40 text-xs">
                          {new Date(notification.timestamp).toLocaleDateString()} at{' '}
                          {new Date(notification.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <button className="text-[#B76E79] hover:text-[#D4969F] text-sm font-medium">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { label: 'Critical Alerts', count: notifications.filter((n) => n.severity === 'HIGH').length },
            { label: 'Warnings', count: notifications.filter((n) => n.severity === 'MEDIUM').length },
            { label: 'Info Messages', count: notifications.filter((n) => n.severity === 'LOW').length },
          ].map((stat, idx) => (
            <div key={idx} className="glass-card p-6">
              <p className="text-white/60 text-sm mb-2">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white">{stat.count}</h3>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
