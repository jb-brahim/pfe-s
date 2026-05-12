'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  ShieldCheck, 
  Percent, 
  DollarSign, 
  Users, 
  Plus, 
  Save, 
  Trash2, 
  AlertTriangle,
  Globe,
  Info,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

interface SystemRule {
  _id: string;
  name: string;
  type: 'MAX_AMOUNT' | 'REQUIRED_FIELDS' | 'TVA_CHECK' | 'VENDOR_WHITELIST';
  value: any;
  isActive: boolean;
}

export default function RulesPage() {
  const { user } = useAuth();
  const [rules, setRules] = useState<SystemRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<SystemRule | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<any>('TVA_CHECK');
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await api.get('/rules');
      setRules(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load rules');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) return;
    try {
      await api.delete(`/rules/${id}`);
      toast.success('Rule deleted');
      fetchRules();
    } catch (error) {
      toast.error('Failed to delete rule');
    }
  };

  const handleToggleRule = async (rule: SystemRule) => {
    try {
      await api.post('/rules', { ...rule, isActive: !rule.isActive });
      fetchRules();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/rules', {
        name,
        type,
        value: type === 'MAX_AMOUNT' || type === 'TVA_CHECK' ? Number(value) : value,
        isActive: true
      });
      toast.success(editingRule ? 'Rule updated' : 'Rule created');
      setIsModalOpen(false);
      setEditingRule(null);
      fetchRules();
    } catch (error) {
      toast.error('Failed to save rule');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (rule: SystemRule) => {
    setEditingRule(rule);
    setName(rule.name);
    setType(rule.type);
    setValue(String(rule.value));
    setIsModalOpen(true);
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="h-[70vh] flex items-center justify-center p-6">
        <div className="text-center p-12 sf-card max-w-md">
           <AlertTriangle size={48} className="mx-auto text-amber-500 mb-6" />
           <h2 className="text-2xl font-black text-foreground mb-4">Access Denied</h2>
           <p className="text-muted-foreground font-semibold">Only System Administrators are authorized to configure global compliance rules.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="p-1 px-2.5 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-wider border border-primary/20">
                Governance Desk
              </span>
           </div>
           <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Compliance Rules</h1>
           <p className="text-muted-foreground font-semibold">Define the automated OCR extraction validations and risk guardrails.</p>
        </div>
        <button 
          onClick={() => {
            setEditingRule(null);
            setName('');
            setValue('');
            setIsModalOpen(true);
          }}
          className="px-6 py-3.5 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-purple hover:scale-102 transition-all cursor-pointer"
        >
          <Plus size={16} />
          Create Rule Assert
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Active Rules Grid */}
        <div className="lg:col-span-8 space-y-6">
           {loading ? (
             <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Accessing compliance rules...</p>
             </div>
           ) : rules.map((rule) => (
             <motion.div 
               key={rule._id}
               layout
               className={cn(
                 "sf-card p-6 border transition-all flex items-center justify-between gap-6",
                 rule.isActive ? "border-white/5 bg-card/60" : "border-white/1 bg-white/1 opacity-50"
               )}
             >
                <div className="flex items-center gap-6">
                  <div 
                    onClick={() => openEdit(rule)}
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform",
                      rule.type === 'TVA_CHECK' ? "bg-emerald-500/10 text-emerald-400" :
                      rule.type === 'MAX_AMOUNT' ? "bg-amber-500/10 text-amber-400" :
                      "bg-indigo-500/10 text-indigo-400"
                    )}
                  >
                    {rule.type === 'TVA_CHECK' ? <Percent size={20} /> :
                     rule.type === 'MAX_AMOUNT' ? <DollarSign size={20} /> :
                     <ShieldCheck size={20} />}
                  </div>

                  <div className="cursor-pointer" onClick={() => openEdit(rule)}>
                     <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-extrabold text-foreground tracking-tight">{rule.name}</h3>
                        <span className="px-2.5 py-1 bg-white/4 border border-white/5 rounded-md text-[8px] font-black uppercase tracking-widest text-slate-400">
                          {rule.type.replace('_', ' ')}
                        </span>
                     </div>
                     <p className="text-xs text-muted-foreground font-semibold">Value threshold assert: <span className="text-primary font-bold font-mono">{rule.value}</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                   {/* Switch Toggle */}
                   <button 
                     onClick={() => handleToggleRule(rule)}
                     className={cn(
                       "w-12 h-7 rounded-full transition-all relative",
                       rule.isActive ? "bg-primary" : "bg-white/10"
                     )}
                   >
                      <div className={cn(
                        "absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all shadow-md",
                        rule.isActive ? "right-0.5" : "left-0.5"
                      )} />
                   </button>
                   <button 
                     onClick={() => handleDelete(rule._id)}
                     className="p-2.5 rounded-xl bg-white/2 hover:bg-red-500/10 hover:text-red-400 border border-white/5 text-muted-foreground transition-all cursor-pointer"
                   >
                      <Trash2 size={15} />
                   </button>
                </div>
             </motion.div>
           ))}

           {(!loading && rules.length === 0) && (
             <div className="sf-card text-center py-16">
               <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-4" />
               <h4 className="text-lg font-bold text-foreground">No active rules</h4>
               <p className="text-muted-foreground text-xs font-semibold mt-1">Configure compliance rules to enforce automatic OCR checking.</p>
             </div>
           )}
        </div>

        {/* Rules Sidebar Meta info */}
        <div className="lg:col-span-4 space-y-6">
           <div className="sf-card bg-gradient-to-b from-[#1E1B4B] to-card/60">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <ShieldCheck size={140} className="text-primary" />
              </div>
              <div className="relative z-10">
                 <h3 className="text-xl font-extrabold text-white mb-3">Auditing Policy</h3>
                 <p className="text-white/60 text-xs font-medium leading-relaxed mb-6">
                   Validation criteria configured on this page execute in real time when accountants submit extractions. Failures will result in a compliance flag on the manager detail page.
                 </p>
                 <div className="p-4 bg-white/2 border border-white/5 rounded-2xl flex items-start gap-3">
                   <Info size={16} className="text-indigo-300 mt-0.5" />
                   <p className="text-[11px] text-white/50 leading-normal font-medium">To keep verification highly accurate, we recommend keeping active TVA rate checks and maximum monthly spending boundaries.</p>
                 </div>
              </div>
           </div>
        </div>

      </div>

      {/* Modern Pop-up Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-card border border-white/5 rounded-[2rem] shadow-2xl p-8"
            >
              <h3 className="text-2xl font-black text-foreground mb-6 tracking-tight">
                {editingRule ? 'Modify Governance Assert' : 'Create Compliance Assert'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 px-1">Rule Identifier</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Standard Corporate Spending Boundary"
                    className="w-full px-4 py-3 bg-white/3 border border-white/5 rounded-xl outline-none focus:border-primary/40 transition-all font-bold text-foreground text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 px-1">Evaluation Type</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-3 bg-white/3 border border-white/5 rounded-xl outline-none focus:border-primary/40 transition-all font-bold text-foreground text-sm"
                  >
                    <option value="TVA_CHECK" className="bg-card">TVA Percentage Matching Check</option>
                    <option value="MAX_AMOUNT" className="bg-card">Maximum Spending Budget Boundary</option>
                    <option value="VENDOR_WHITELIST" className="bg-card">Vendor Credibility Check</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 px-1">Threshold Assert Target</label>
                  <input 
                    type="text" 
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="e.g. 5000 (limits) or 19 (TVA check)"
                    className="w-full px-4 py-3 bg-white/3 border border-white/5 rounded-xl outline-none focus:border-primary/40 transition-all font-bold text-foreground text-sm font-mono"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-white/2 border border-white/5 text-muted-foreground hover:text-foreground rounded-2xl font-extrabold text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Close
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-extrabold text-xs uppercase tracking-wider shadow-purple hover:scale-102 transition-all cursor-pointer"
                  >
                    {isSubmitting ? 'Configuring...' : 'Establish Assert'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
