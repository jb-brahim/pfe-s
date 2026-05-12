'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Moon, 
  Globe, 
  Lock, 
  Smartphone,
  Eye,
  Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [mfa, setMfa] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await api.get('/auth/profile');
        // Handle both standardized {data: user} and flat user object responses
        const userData = response.data?.data || response.data;
        const prefs = userData?.preferences;
        
        if (prefs) {
          setNotifications(prefs.notifications);
          setDarkMode(prefs.darkMode);
          setMfa(prefs.mfa);
          
          // Apply initial dark mode state
          if (prefs.darkMode) {
            document.documentElement.classList.add('dark');
          }
        }
      } catch (error) {
        console.error('Failed to fetch preferences', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPreferences();
  }, []);

  const handleSave = async () => {
    try {
      await api.put('/auth/preferences', {
        preferences: {
          notifications,
          darkMode,
          mfa
        }
      });
      toast.success('Settings updated successfully');
      
      // Apply dark mode to document if changed
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Preferences...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-10">
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight mb-2">Account Settings</h1>
        <p className="text-muted-foreground font-medium">Manage your preferences and system configuration.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Tabs */}
        <div className="space-y-2">
           {[
             { label: 'General', icon: SettingsIcon, active: true },
             { label: 'Notifications', icon: Bell },
             { label: 'Security', icon: Lock },
             { label: 'Integrations', icon: Globe },
           ].map((item) => (
             <button 
               key={item.label}
               className={cn(
                 "w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all",
                 item.active ? "bg-card text-primary shadow-soft border border-border" : "text-muted-foreground hover:text-foreground hover:bg-muted"
               )}
             >
                <item.icon size={18} />
                {item.label}
             </button>
           ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8">
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="bg-card rounded-[2.5rem] p-10 shadow-soft border border-border space-y-10"
           >
              {/* Display Section */}
              <section className="space-y-6">
                 <div className="flex items-center gap-3 border-b border-border pb-4">
                    <Monitor size={20} className="text-primary" />
                    <h3 className="text-lg font-black text-foreground uppercase tracking-wider text-sm">System Appearance</h3>
                 </div>
                 
                 <div className="flex items-center justify-between">
                    <div>
                       <p className="font-bold text-foreground">Dark Mode</p>
                       <p className="text-xs text-muted-foreground font-medium">Switch between light and dark themes.</p>
                    </div>
                    <button 
                      onClick={() => setDarkMode(!darkMode)}
                      className={cn(
                        "w-14 h-8 rounded-full transition-all relative border border-border/50",
                        darkMode ? "bg-primary border-primary" : "bg-muted"
                      )}
                    >
                       <div className={cn(
                         "absolute top-1 w-6 h-6 bg-card rounded-full transition-all shadow-sm",
                         darkMode ? "right-1" : "left-1"
                       )} />
                    </button>
                 </div>
              </section>

              {/* Notifications Section */}
              <section className="space-y-6">
                 <div className="flex items-center gap-3 border-b border-border pb-4">
                    <Bell size={20} className="text-primary" />
                    <h3 className="text-lg font-black text-foreground uppercase tracking-wider text-sm">Notifications</h3>
                 </div>
                 
                 <div className="flex items-center justify-between">
                    <div>
                       <p className="font-bold text-foreground">Email Alerts</p>
                       <p className="text-xs text-muted-foreground font-medium">Receive weekly spending summaries.</p>
                    </div>
                    <button 
                      onClick={() => setNotifications(!notifications)}
                      className={cn(
                        "w-14 h-8 rounded-full transition-all relative",
                        notifications ? "bg-primary" : "bg-muted"
                      )}
                    >
                       <div className={cn(
                         "absolute top-1 w-6 h-6 bg-card rounded-full transition-all shadow-sm",
                         notifications ? "right-1" : "left-1"
                       )} />
                    </button>
                 </div>
              </section>

              {/* Security Section */}
              <section className="space-y-6">
                 <div className="flex items-center gap-3 border-b border-border pb-4">
                    <Lock size={20} className="text-primary" />
                    <h3 className="text-lg font-black text-foreground uppercase tracking-wider text-sm">Security</h3>
                 </div>
                 
                 <div className="flex items-center justify-between">
                    <div>
                       <p className="font-bold text-foreground">Two-Factor Auth</p>
                       <p className="text-xs text-muted-foreground font-medium">Add an extra layer of protection.</p>
                    </div>
                    <button 
                      onClick={() => setMfa(!mfa)}
                      className={cn(
                        "w-14 h-8 rounded-full transition-all relative",
                        mfa ? "bg-primary" : "bg-muted"
                      )}
                    >
                       <div className={cn(
                         "absolute top-1 w-6 h-6 bg-card rounded-full transition-all shadow-sm",
                         mfa ? "right-1" : "left-1"
                       )} />
                    </button>
                 </div>
              </section>

              <div className="pt-6">
                 <button 
                   onClick={handleSave}
                   className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-purple hover:scale-[1.01] transition-all"
                 >
                   Save Preferences
                 </button>
              </div>
           </motion.div>
        </div>

      </div>
    </div>
  );
}
