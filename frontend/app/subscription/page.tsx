'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n-context';
import { X, Key } from 'lucide-react';

export default function SubscriptionPage() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  
  // Checkout Modal State
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  if (user?.role !== 'ADMIN') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-[#A69697]">Access denied. Admin only.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 w-full pb-10 max-w-[1600px] mx-auto relative">
        
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-[32px] font-bold tracking-tight mb-1 text-[#FFFFFF]">{t('settings.subscription.title')}</h1>
          <p className="text-[#A69697] text-[15px]">{t('settings.subscription.subtitle')}</p>
        </div>

        <div className="flex-1 max-w-[800px]">
          {/* Current Plan */}
          <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[#D98F8F]/30 rounded-[24px] p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D98F8F]/10 rounded-full blur-3xl"></div>
            
            <div className="flex items-end justify-between bg-[#1A0A0B]/50 p-5 rounded-[16px] border border-white/5 mb-6">
              <div>
                <p className="text-[#A69697] text-[12px] uppercase tracking-wider font-bold mb-1">{t('settings.subscription.active_plan')}</p>
                <p className="text-white text-[24px] font-bold">{user?.billing?.plan || t('settings.subscription.free')}</p>
              </div>
              <div className="text-right">
                <p className="text-[#A69697] text-[12px] uppercase tracking-wider font-bold mb-1">{t('settings.subscription.scans_limit')}</p>
                <p className="text-white text-[16px] font-bold">{user?.billing?.aiScansUsed || 0} / {user?.billing?.aiScansLimit || 50}</p>
              </div>
            </div>

            <h4 className="text-white text-[14px] font-bold mb-4">{t('settings.subscription.upgrade_plan')}</h4>
            <div className="grid md:grid-cols-3 gap-4">
              {['Normal', 'Pro', 'Premium'].map((planTier) => (
                <div key={planTier} className={`border ${user?.billing?.plan === planTier ? 'border-[#D98F8F] bg-[#D98F8F]/5' : 'border-white/10 bg-white/5'} rounded-[16px] p-4 flex flex-col`}>
                  <p className="text-white font-bold text-[16px] mb-1">{planTier}</p>
                  <p className="text-[#A69697] text-[12px] mb-4">{planTier === 'Premium' ? t('settings.subscription.unlimited') : planTier === 'Pro' ? t('settings.subscription.scans_5000') : t('settings.subscription.scans_500')}</p>
                  <button 
                    onClick={() => {
                      setSelectedPlan(planTier);
                      setIsCheckoutModalOpen(true);
                    }}
                    disabled={user?.billing?.plan === planTier}
                    className={`mt-auto py-2 rounded-[8px] text-[13px] font-bold transition-all ${user?.billing?.plan === planTier ? 'bg-[#D98F8F]/20 text-[#D98F8F] cursor-not-allowed' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    {user?.billing?.plan === planTier ? t('settings.subscription.current') : t('settings.subscription.select')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Checkout Modal */}
        {isCheckoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#1A0A0B] border border-white/10 rounded-[24px] w-full max-w-[450px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#D98F8F] to-transparent"></div>
              
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <h3 className="text-white text-[20px] font-bold">Upgrade to {selectedPlan}</h3>
                  <button type="button" onClick={() => setIsCheckoutModalOpen(false)} className="text-[#A69697] hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <p className="text-[#A69697] text-[13px] mt-1">Complete your payment details to upgrade.</p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-[#A69697] text-[13px] block mb-1">Name on Card</label>
                  <input type="text" placeholder="John Doe" value={cardName} onChange={(e) => setCardName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-[12px] py-3 px-4 text-[14px] text-white outline-none focus:border-[#D98F8F]" />
                </div>
                <div>
                  <label className="text-[#A69697] text-[13px] block mb-1">Card Number</label>
                  <input type="text" placeholder="**** **** **** 4242" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-[12px] py-3 px-4 text-[14px] text-white outline-none focus:border-[#D98F8F] font-mono tracking-widest" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#A69697] text-[13px] block mb-1">Expiry (MM/YY)</label>
                    <input type="text" placeholder="12/26" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-[12px] py-3 px-4 text-[14px] text-white outline-none focus:border-[#D98F8F] font-mono" />
                  </div>
                  <div>
                    <label className="text-[#A69697] text-[13px] block mb-1">CVC</label>
                    <input type="text" placeholder="123" value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-[12px] py-3 px-4 text-[14px] text-white outline-none focus:border-[#D98F8F] font-mono" />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white/[0.02] border-t border-white/5">
                <button 
                  onClick={async () => {
                    if (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim()) {
                      toast.error('Please fill in all credit card details to proceed with the upgrade.');
                      return;
                    }
                    
                    setCheckoutLoading(true);
                    try {
                      const { subscriptionAPI } = await import('@/lib/api');
                      const res = await subscriptionAPI.checkout(selectedPlan);
                      if (res.success) {
                        updateUser({ billing: res.billing, apiKeys: res.apiKeys });
                        toast.success(t('settings.toast.plan_success').replace('{{plan}}', selectedPlan));
                        setIsCheckoutModalOpen(false);
                      }
                    } catch (err: any) {
                      toast.error(err.response?.data?.message || t('settings.toast.plan_failed'));
                    } finally {
                      setCheckoutLoading(false);
                    }
                  }}
                  disabled={checkoutLoading}
                  className="w-full py-4 rounded-[12px] bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white font-bold shadow-lg hover:shadow-[0_0_15px_rgba(217,143,143,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {checkoutLoading ? 'Processing...' : `Pay & Upgrade to ${selectedPlan}`}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
