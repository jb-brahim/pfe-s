'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Loader, FileText, PieChart, BarChart3, Eye, EyeOff, ArrowLeft, Globe } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n-context';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { t, language: lang, setLanguage: setLang } = useLanguage();
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('app-theme') as 'dark' | 'light') || 'light';
    }
    return 'light';
  });
  const [mounted, setMounted] = useState(false);
  const [transitionReady, setTransitionReady] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as 'dark' | 'light';
    if (savedTheme && savedTheme !== theme) {
      setTheme(savedTheme);
    }
    setMounted(true);
    
    const timer = setTimeout(() => {
      setTransitionReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
  };

  const isDark = theme === 'dark';

  const [mode, setMode] = useState<'register' | 'verify'>('register');
  const [verificationCode, setVerificationCode] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      await register(name, email, password, 'ADMIN', companyName);
      setMode('verify');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to create account. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Assuming context has verifyEmail, if not it was added earlier
      const { authAPI } = await import('@/lib/api');
      const result = await authAPI.verifyEmail(email, verificationCode);
      if (result.data) {
        localStorage.setItem('authToken', result.data.token);
        // Force reload to dashboard
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid verification code.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`keep-dark relative min-h-screen flex items-center justify-center p-6 font-sans ${
      transitionReady ? 'transition-colors duration-700 ease-in-out' : 'transition-none'
    } ${
      mounted ? 'opacity-100' : 'opacity-0'
    } ${
      isDark ? 'bg-gradient-to-br from-[#120507] via-[#1A0A0B] to-[#2D1B1C]' : 'bg-gradient-to-br from-[#FFF0F0] via-[#FFFFFF] to-[#FDF5F5]'
    }`}>
      
      {/* Back to Home Button */}
      <Link href="/" className={`absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 backdrop-blur-md rounded-full font-medium transition-all shadow-sm hover:shadow-md ${
        isDark 
          ? 'bg-[#1A0A0B]/40 hover:bg-[#1A0A0B]/70 border border-white/10 text-white'
          : 'bg-white/40 hover:bg-white/70 border border-white/50 text-[#8E1B3A]'
      }`}>
        <ArrowLeft size={16} />
        <span className="text-[13px]">{t('auth.back_to_home') || 'Back to Home'}</span>
      </Link>

      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={() => setShowLanguages(!showLanguages)}
          className={`w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-md shadow-sm transition-all border ${
            isDark 
              ? 'bg-[#1A0A0B]/40 border-white/10 text-[#A69697] hover:text-white hover:bg-[#1A0A0B]/70'
              : 'bg-white/40 border-white/50 text-[#8E1B3A]/70 hover:text-[#8E1B3A] hover:bg-white/70'
          }`}
          title="Switch Language"
        >
          <Globe className="w-5 h-5" strokeWidth={1.5} />
        </button>
        {showLanguages && (
          <div className={`absolute top-12 right-0 w-32 border rounded-xl shadow-2xl overflow-hidden py-1 ${
            isDark ? 'bg-[#1A0A0B] border-white/10' : 'bg-white border-gray-200'
          }`}>
            {(['EN', 'FR', 'AR'] as const).map(l => (
              <button
                key={l}
                onClick={() => { setLang(l); setShowLanguages(false); }}
                className={`w-full text-left px-4 py-2 text-[13px] transition-colors ${
                  isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                } ${
                  lang === l 
                    ? isDark ? 'text-[#D98F8F] font-bold' : 'text-[#8E1B3A] font-bold'
                    : isDark ? 'text-[#A69697]' : 'text-gray-700'
                }`}
              >
                {l === 'EN' ? 'English' : l === 'FR' ? 'Français' : 'العربية'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#8E1B3A] rounded-full blur-[150px] opacity-20 transition-opacity duration-700"></div>
        <div className={`absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#D98F8F] rounded-full blur-[150px] transition-opacity duration-700 ${isDark ? 'opacity-10' : 'opacity-20'}`}></div>
      </div>

      {/* Main Glass Container */}
      <div className={`w-full max-w-[1100px] backdrop-blur-2xl rounded-[40px] p-12 relative z-10 flex flex-col md:flex-row gap-16 overflow-hidden transition-all duration-700 ease-in-out ${
        isDark 
          ? 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] shadow-[0_30px_80px_rgba(0,0,0,0.5)]' 
          : 'bg-[rgba(255,255,255,0.6)] border-white shadow-[0_30px_80px_rgba(142,27,58,0.1)]'
      }`}>
        
        {/* Left: Register Form */}
        <div className="w-full md:w-[45%] flex flex-col justify-center relative z-10">
          
          {mode === 'register' && (
            <>
              <h1 className={`text-[36px] font-medium mb-8 tracking-tight transition-colors duration-700 ${isDark ? 'text-white' : 'text-[#1A0A0B]'}`}>
                {t('auth.create_account') || 'Create Account'}
              </h1>

              <form onSubmit={handleRegister} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className={`block text-[13px] mb-2 transition-colors duration-700 ${isDark ? 'text-[#A69697]' : 'text-[#8E1B3A]/80 font-bold'}`}>{t('auth.full_name') || 'Full Name'}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full rounded-[14px] py-4 px-5 text-[15px] outline-none transition-all duration-700 ${
                      isDark 
                        ? 'bg-[#1A0A0B]/60 border border-[rgba(255,255,255,0.08)] text-white focus:border-[#D98F8F]/50 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]'
                        : 'bg-white border border-[#8E1B3A]/10 text-[#1A0A0B] focus:border-[#8E1B3A]/40 shadow-[inset_0_2px_10px_rgba(142,27,58,0.05)]'
                    }`}
                    required
                  />
                </div>

                {/* Company Name */}
                <div>
                  <label className={`block text-[13px] mb-2 transition-colors duration-700 ${isDark ? 'text-[#A69697]' : 'text-[#8E1B3A]/80 font-bold'}`}>{t('auth.company_name') || 'Company / Organization Name'}</label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder={t('auth.company_placeholder') || 'e.g., Pereira S.A.R.L.'}
                      className={`w-full rounded-[14px] py-4 px-5 text-[15px] outline-none transition-all duration-700 ${
                        isDark 
                          ? 'bg-[#1A0A0B]/60 border border-[rgba(255,255,255,0.08)] text-white focus:border-[#D98F8F]/50 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]'
                          : 'bg-white border border-[#8E1B3A]/10 text-[#1A0A0B] focus:border-[#8E1B3A]/40 shadow-[inset_0_2px_10px_rgba(142,27,58,0.05)]'
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className={`block text-[13px] mb-2 transition-colors duration-700 ${isDark ? 'text-[#A69697]' : 'text-[#8E1B3A]/80 font-bold'}`}>{t('auth.email_address') || 'Email Address'}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full rounded-[14px] py-4 px-5 text-[15px] outline-none transition-all duration-700 ${
                      isDark 
                        ? 'bg-[#1A0A0B]/60 border border-[rgba(255,255,255,0.08)] text-white focus:border-[#D98F8F]/50 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]'
                        : 'bg-white border border-[#8E1B3A]/10 text-[#1A0A0B] focus:border-[#8E1B3A]/40 shadow-[inset_0_2px_10px_rgba(142,27,58,0.05)]'
                    }`}
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className={`block text-[13px] mb-2 transition-colors duration-700 ${isDark ? 'text-[#A69697]' : 'text-[#8E1B3A]/80 font-bold'}`}>{t('auth.password') || 'Password'}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full rounded-[14px] py-4 pl-5 pr-12 text-[15px] outline-none transition-all duration-700 ${
                        isDark 
                          ? 'bg-[#1A0A0B]/60 border border-[rgba(255,255,255,0.08)] text-white focus:border-[#D98F8F]/50 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]'
                          : 'bg-white border border-[#8E1B3A]/10 text-[#1A0A0B] focus:border-[#8E1B3A]/40 shadow-[inset_0_2px_10px_rgba(142,27,58,0.05)]'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                        isDark ? 'text-[#A69697] hover:text-white' : 'text-[#8E1B3A]/50 hover:text-[#8E1B3A]'
                      }`}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className={`block text-[13px] mb-2 transition-colors duration-700 ${isDark ? 'text-[#A69697]' : 'text-[#8E1B3A]/80 font-bold'}`}>{t('auth.confirm_password') || 'Confirm Password'}</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full rounded-[14px] py-4 pl-5 pr-12 text-[15px] outline-none transition-all duration-700 ${
                        isDark 
                          ? 'bg-[#1A0A0B]/60 border border-[rgba(255,255,255,0.08)] text-white focus:border-[#D98F8F]/50 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]'
                          : 'bg-white border border-[#8E1B3A]/10 text-[#1A0A0B] focus:border-[#8E1B3A]/40 shadow-[inset_0_2px_10px_rgba(142,27,58,0.05)]'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                        isDark ? 'text-[#A69697] hover:text-white' : 'text-[#8E1B3A]/50 hover:text-[#8E1B3A]'
                      }`}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && <div className="text-[#FF5C77] text-[13px] text-center">{error}</div>}

                {/* Register Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full mt-4 py-4 rounded-full font-bold text-[16px] transition-all duration-700 flex items-center justify-center gap-2 hover:-translate-y-0.5 ${
                    isDark
                      ? 'bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white shadow-[0_10px_25px_rgba(142,27,58,0.4)] hover:shadow-[0_15px_35px_rgba(217,143,143,0.5)]'
                      : 'bg-gradient-to-r from-[#8E1B3A] to-[#6D071A] text-white shadow-[0_10px_25px_rgba(142,27,58,0.2)] hover:shadow-[0_15px_35px_rgba(142,27,58,0.4)]'
                  }`}
                >
                  {isLoading && <Loader size={18} className="animate-spin" />}
                  {isLoading ? (t('auth.creating_account') || 'Creating account...') : (t('auth.sign_up') || 'Sign Up')}
                </button>

                {/* Redirect link to Login */}
                <div className="text-center mt-6">
                  <span className={`text-[13px] ${isDark ? 'text-[#A69697]' : 'text-gray-600'}`}>{t('auth.have_account') || 'Already have an account?'} </span>
                  <Link href="/auth/login" className={`text-[13px] font-bold transition-colors duration-700 ${
                    isDark ? 'text-[#D98F8F] hover:text-white' : 'text-[#8E1B3A] hover:text-[#6D071A]'
                  }`}>
                    {t('auth.log_in') || 'Log In'}
                  </Link>
                </div>
              </form>
            </>
          )}

          {mode === 'verify' && (
            <>
              <h1 className={`text-[36px] font-medium mb-4 tracking-tight transition-colors duration-700 ${isDark ? 'text-white' : 'text-[#1A0A0B]'}`}>
                {t('auth.verify_email') || 'Verify Email'}
              </h1>
              <p className={`text-[14px] mb-8 ${isDark ? 'text-[#A69697]' : 'text-gray-600'}`}>
                {t('auth.verify_email_desc') || "We've sent a 6-digit verification code to"} <strong>{email}</strong>. {t('auth.verify_email_desc_2') || "Enter it below to unlock your account."}
              </p>

              <form onSubmit={handleVerify} className="space-y-6">
                <div>
                  <label className={`block text-[13px] mb-2 transition-colors duration-700 ${isDark ? 'text-[#A69697]' : 'text-[#8E1B3A]/80 font-bold'}`}>{t('auth.six_digit_code') || '6-Digit Code'}</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className={`w-full rounded-[14px] py-4 px-5 text-[20px] tracking-[0.5em] text-center font-mono outline-none transition-all duration-700 ${
                      isDark 
                        ? 'bg-[#1A0A0B]/60 border border-[rgba(255,255,255,0.08)] text-white focus:border-[#D98F8F]/50 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]'
                        : 'bg-white border border-[#8E1B3A]/10 text-[#1A0A0B] focus:border-[#8E1B3A]/40 shadow-[inset_0_2px_10px_rgba(142,27,58,0.05)]'
                    }`}
                    required
                  />
                </div>

                {error && <div className="text-[#FF5C77] text-[13px] text-center">{error}</div>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full mt-4 py-4 rounded-full font-bold text-[16px] transition-all duration-700 flex items-center justify-center gap-2 hover:-translate-y-0.5 ${
                    isDark
                      ? 'bg-gradient-to-r from-[#D98F8F] to-[#8E1B3A] text-white shadow-[0_10px_25px_rgba(142,27,58,0.4)]'
                      : 'bg-gradient-to-r from-[#8E1B3A] to-[#6D071A] text-white shadow-[0_10px_25px_rgba(142,27,58,0.2)]'
                  }`}
                >
                  {isLoading && <Loader size={18} className="animate-spin" />}
                  {isLoading ? (t('auth.verifying') || 'Verifying...') : (t('auth.verify_email') || 'Verify Email')}
                </button>
              </form>
            </>
          )}

        </div>

        {/* Right: Abstract 3D Security/Analytics Visual */}
        <div className="hidden md:flex w-full md:w-[55%] relative items-center justify-center">
           <div className={`absolute inset-0 rounded-[30px] overflow-hidden transition-all duration-700 ${
             isDark ? 'bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]' : 'bg-white/50 border border-[#8E1B3A]/10 shadow-[0_0_50px_rgba(142,27,58,0.05)]'
           }`}>
             
             {/* Center Glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-tr from-[#8E1B3A] to-[#D98F8F] rounded-full blur-[80px] opacity-30"></div>
             
             {/* Orbital Rings */}
             <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border-dashed animate-[spin_40s_linear_infinite] transition-colors duration-700 ${isDark ? 'border-white/5' : 'border-[#8E1B3A]/20'}`}></div>
             <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full animate-[spin_60s_linear_infinite_reverse] transition-colors duration-700 ${isDark ? 'border-[#D98F8F]/10' : 'border-[#8E1B3A]/10'}`}></div>
             
             {/* Central Shield Graphic */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20">
               <div className="w-[200px] h-[200px] relative flex items-center justify-center perspective-1000">
                  {/* Thick 3D Ring */}
                  <div className="absolute w-[220px] h-[60px] border-[4px] border-t-transparent border-b-[#8E1B3A]/80 border-x-[#D98F8F]/50 rounded-[100%] rotate-[-20deg] shadow-[0_20px_30px_rgba(142,27,58,0.4)]"></div>
                  <div className="absolute w-[200px] h-[50px] border-[8px] border-t-transparent border-b-[#D98F8F] border-l-[#8E1B3A] border-r-transparent rounded-[100%] rotate-[10deg]"></div>
                  
                  {/* The Shield */}
                  <div className={`border-2 w-28 h-32 rounded-b-[40px] flex items-center justify-center z-10 relative transition-all duration-700 ${
                    isDark 
                      ? 'bg-gradient-to-br from-[#1A0A0B] to-[#2D1B1C] border-[#D98F8F]/50 shadow-[0_0_50px_rgba(217,143,143,0.3)]'
                      : 'bg-gradient-to-br from-[#FFFFFF] to-[#FDF5F5] border-[#8E1B3A]/30 shadow-[0_0_50px_rgba(142,27,58,0.15)]'
                  }`}>
                     <PieChart size={48} className={isDark ? "text-[#D98F8F]" : "text-[#8E1B3A]"} strokeWidth={1.5} />
                  </div>
               </div>
             </div>

             {/* Floating Documents */}
             <div className={`absolute top-[20%] left-[20%] w-16 h-20 backdrop-blur-md rounded-lg p-2 z-30 animate-[float_5s_ease-in-out_infinite] transition-all duration-700 ${
               isDark ? 'bg-[#1A0A0B]/80 border border-[#D98F8F]/40 shadow-xl' : 'bg-white/80 border border-[#8E1B3A]/20 shadow-lg'
             }`}>
                <div className={`w-full h-1 rounded mb-1.5 ${isDark ? 'bg-white/20' : 'bg-[#8E1B3A]/20'}`}></div>
                <div className={`w-3/4 h-1 rounded mb-1.5 ${isDark ? 'bg-white/20' : 'bg-[#8E1B3A]/20'}`}></div>
                <FileText size={14} className={`mt-auto absolute bottom-2 right-2 ${isDark ? 'text-[#D98F8F]' : 'text-[#8E1B3A]'}`} />
             </div>

             <div className={`absolute bottom-[25%] right-[20%] w-16 h-20 backdrop-blur-md rounded-lg p-2 z-30 animate-[float_6s_ease-in-out_infinite_1s] transition-all duration-700 ${
               isDark ? 'bg-[#1A0A0B]/80 border border-[#D98F8F]/40 shadow-xl' : 'bg-white/80 border border-[#8E1B3A]/20 shadow-lg'
             }`}>
                <div className={`w-full h-1 rounded mb-1.5 ${isDark ? 'bg-white/20' : 'bg-[#8E1B3A]/20'}`}></div>
                <div className={`w-1/2 h-1 rounded mb-1.5 ${isDark ? 'bg-white/20' : 'bg-[#8E1B3A]/20'}`}></div>
                <BarChart3 size={14} className={`mt-auto absolute bottom-2 left-2 ${isDark ? 'text-[#D98F8F]' : 'text-[#8E1B3A]'}`} />
             </div>

             {/* Orbital Particles */}
             <div className="absolute top-[30%] right-[30%] w-3 h-3 bg-[#D98F8F] rounded-full shadow-[0_0_15px_#D98F8F]"></div>
             <div className="absolute bottom-[40%] left-[15%] w-2 h-2 bg-[#8E1B3A] rounded-full shadow-[0_0_10px_#8E1B3A]"></div>

           </div>
        </div>
      </div>
    </div>
  );
}
