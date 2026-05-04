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
  Globe
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
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-10 bg-white rounded-[2.5rem] shadow-soft border border-slate-100 max-w-md">
           <AlertTriangle size={48} className="mx-auto text-amber-500 mb-6" />
           <h2 className="text-2xl font-black text-slate-900 mb-4">Access Denied</h2>
           <p className="text-slate-400 font-medium">Only System Administrators can manage global validation rules.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">System Governance</h1>
           <p className="text-slate-400 font-medium">Define the AI validation rules and compliance guardrails.</p>
        </div>
        <button 
          onClick={() => {
            setEditingRule(null);
            setName('');
            setValue('');
            setIsModalOpen(true);
          }}
          className="px-8 py-4 bg-primary text-white rounded-2xl font-bold flex items-center gap-2 shadow-purple hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} />
          New Rule
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Rule Types Column */}
        <div className="lg:col-span-2 space-y-6">
           {rules.map((rule) => (
             <motion.div 
               key={rule._id}
               layout
               className={cn(
                 "p-8 rounded-[2.5rem] border transition-all flex items-center gap-8",
                 rule.isActive ? "bg-white border-slate-50 shadow-soft" : "bg-slate-50/50 border-transparent opacity-60"
               )}
             >
                <div 
                  onClick={() => openEdit(rule)}
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform",
                    rule.type === 'TVA_CHECK' ? "bg-emerald-50 text-emerald-500" :
                    rule.type === 'MAX_AMOUNT' ? "bg-amber-50 text-amber-500" :
                    "bg-primary/5 text-primary"
                  )}
                >
                  {rule.type === 'TVA_CHECK' ? <Percent size={24} /> :
                   rule.type === 'MAX_AMOUNT' ? <DollarSign size={24} /> :
                   <ShieldCheck size={24} />}
                </div>

                <div className="flex-1 cursor-pointer" onClick={() => openEdit(rule)}>
                   <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-extrabold text-slate-900">{rule.name}</h3>
                      <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {rule.type.replace('_', ' ')}
                      </span>
                   </div>
                   <p className="text-sm text-slate-400 font-medium">Value threshold: <span className="text-slate-900 font-bold">{rule.value}</span></p>
                </div>

                <div className="flex items-center gap-4">
                   <button 
                     onClick={() => handleToggleRule(rule)}
                     className={cn(
                       "w-14 h-8 rounded-full transition-all relative",
                       rule.isActive ? "bg-primary" : "bg-slate-200"
                     )}
                   >
                      <div className={cn(
                        "absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm",
                        rule.isActive ? "right-1" : "left-1"
                      )} />
                   </button>
                   <button 
                     onClick={() => handleDelete(rule._id)}
                     className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                   >
                      <Trash2 size={20} />
                   </button>
                </div>
             </motion.div>
           ))}

           <button 
             onClick={() => setIsModalOpen(true)}
             className="w-full py-8 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-slate-300 font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:border-primary/20 hover:text-primary transition-all"
           >
              <Plus size={24} />
              Add New Governance Rule
           </button>
        </div>

        {/* Info Column */}
        <div className="space-y-8">
           <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-soft">
              <div className="absolute -top-10 -right-10 opacity-10">
                 <ShieldCheck size={200} />
              </div>
              <div className="relative z-10">
                 <h3 className="text-xl font-bold mb-4">Rule Engine Info</h3>
                 <p className="text-white/60 text-sm font-medium leading-relaxed mb-6">
                    Rules defined here are applied automatically by the AI during the extraction phase. Invoices that violate these rules will be flagged for Manager review.
                 </p>
              </div>
           </div>
        </div>

      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100"
            >
              <h3 className="text-2xl font-black text-slate-900 mb-8">{editingRule ? 'Edit Rule' : 'Create New Rule'}</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Rule Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Max Monthly Spend"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary/30 transition-all font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Rule Type</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary/30 transition-all font-medium"
                  >
                    <option value="TVA_CHECK">TVA Check</option>
                    <option value="MAX_AMOUNT">Max Amount</option>
                    <option value="VENDOR_WHITELIST">Vendor Whitelist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Threshold Value</label>
                  <input 
                    type="text" 
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Value (number or text)"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary/30 transition-all font-medium"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-purple hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Rule'}
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
