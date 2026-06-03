'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Shield, Lock, Loader, FileText, PieChart, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      if (user?.role === 'SUPER_ADMIN') {
        router.push('/super-admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="keep-dark relative min-h-screen flex items-center justify-center p-6 font-sans bg-gradient-to-br from-[#FFF0F0] via-[#FFFFFF] to-[#FDF5F5]">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#8E1B3A] rounded-full blur-[150px] opacity-20"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#D98F8F] rounded-full blur-[150px] opacity-20"></div>
      </div>

      {/* Main Glass Container */}
      <div className="w-full max-w-[1100px] backdrop-blur-2xl rounded-[40px] p-12 relative z-10 flex flex-col md:flex-row gap-16 overflow-hidden bg-[rgba(255,255,255,0.6)] border-white shadow-[0_30px_80px_rgba(142,27,58,0.1)]">
        
        {/* Left: Login Form */}
        <div className="w-full md:w-[45%] flex flex-col justify-center relative z-10">
          <h1 className="text-[36px] font-medium mb-10 tracking-tight text-[#1A0A0B]">
            Secure Access
          </h1>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Email */}
            <div>
              <label className="block text-[13px] mb-2 text-[#8E1B3A]/80 font-bold">Email Address</label>
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-[14px] py-4 px-5 text-[15px] outline-none bg-white border border-[#8E1B3A]/10 text-[#1A0A0B] focus:border-[#8E1B3A]/40 shadow-[inset_0_2px_10px_rgba(142,27,58,0.05)] transition-colors"
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full bg-[#8E1B3A]/5 border border-[#8E1B3A]/20 group-focus-within:bg-[#8E1B3A]/10 transition-colors">
                  <Shield size={12} className="text-[#8E1B3A]" />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] mb-2 text-[#8E1B3A]/80 font-bold">Password</label>
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-[14px] py-4 px-5 text-[15px] outline-none bg-white border border-[#8E1B3A]/10 text-[#1A0A0B] focus:border-[#8E1B3A]/40 shadow-[inset_0_2px_10px_rgba(142,27,58,0.05)] transition-colors"
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full border border-[#8E1B3A]/20 group-focus-within:border-[#8E1B3A]/50 transition-colors">
                  <Lock size={12} className="text-[#8E1B3A]/60 group-focus-within:text-[#8E1B3A]" />
                </div>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
                <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                  rememberMe ? 'bg-[#8E1B3A]/20 border border-[#8E1B3A]/40' : 'bg-white border border-gray-200'
                }`}>
                  <div className={`w-3.5 h-3.5 rounded-full transition-transform ${
                    rememberMe ? 'translate-x-4 bg-[#8E1B3A]' : 'translate-x-0 bg-gray-400'
                  }`}></div>
                </div>
                <span className="text-[13px] text-[#1A0A0B] font-medium">Remember Me</span>
              </div>
              <Link href="#" className="text-[13px] text-[#8E1B3A]/80 hover:text-[#8E1B3A] font-medium transition-colors">
                Forgot Password?
              </Link>
            </div>

            {error && <div className="text-[#FF5C77] text-[13px] text-center">{error}</div>}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-4 rounded-full font-bold text-[16px] flex items-center justify-center gap-2 hover:-translate-y-0.5 bg-gradient-to-r from-[#8E1B3A] to-[#6D071A] text-white shadow-[0_10px_25px_rgba(142,27,58,0.2)] hover:shadow-[0_15px_35px_rgba(142,27,58,0.4)] transition-all duration-300"
            >
              {isLoading && <Loader size={18} className="animate-spin" />}
              {isLoading ? 'Signing in...' : 'Log In'}
            </button>

            {/* Redirect link to Register */}
            <div className="text-center mt-6">
              <span className="text-[13px] text-gray-600">Don't have an account? </span>
              <Link href="/register" className="text-[13px] font-bold text-[#8E1B3A] hover:text-[#6D071A] transition-colors">
                Sign Up
              </Link>
            </div>

          </form>
        </div>

        {/* Right: Abstract 3D Security/Analytics Visual */}
        <div className="hidden md:flex w-full md:w-[55%] relative items-center justify-center">
           <div className="absolute inset-0 rounded-[30px] overflow-hidden bg-white/50 border border-[#8E1B3A]/10 shadow-[0_0_50px_rgba(142,27,58,0.05)]">
             
             {/* Center Glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-tr from-[#8E1B3A] to-[#D98F8F] rounded-full blur-[80px] opacity-30"></div>
             
             {/* Orbital Rings */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-dashed border-[#8E1B3A]/20 animate-[spin_40s_linear_infinite]"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border border-[#8E1B3A]/10 animate-[spin_60s_linear_infinite_reverse]"></div>
             
             {/* Central Shield Graphic */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20">
               <div className="w-[200px] h-[200px] relative flex items-center justify-center perspective-1000">
                  {/* Thick 3D Ring */}
                  <div className="absolute w-[220px] h-[60px] border-[4px] border-t-transparent border-b-[#8E1B3A]/80 border-x-[#D98F8F]/50 rounded-[100%] rotate-[-20deg] shadow-[0_20px_30px_rgba(142,27,58,0.4)]"></div>
                  <div className="absolute w-[200px] h-[50px] border-[8px] border-t-transparent border-b-[#D98F8F] border-l-[#8E1B3A] border-r-transparent rounded-[100%] rotate-[10deg]"></div>
                  
                  {/* The Shield */}
                  <div className="border-2 w-28 h-32 rounded-b-[40px] flex items-center justify-center z-10 relative bg-gradient-to-br from-[#FFFFFF] to-[#FDF5F5] border-[#8E1B3A]/30 shadow-[0_0_50px_rgba(142,27,58,0.15)]">
                     <PieChart size={48} className="text-[#8E1B3A]" strokeWidth={1.5} />
                  </div>
               </div>
             </div>

             {/* Floating Documents */}
             <div className="absolute top-[20%] left-[20%] w-16 h-20 backdrop-blur-md rounded-lg p-2 z-30 animate-[float_5s_ease-in-out_infinite] bg-white/80 border border-[#8E1B3A]/20 shadow-lg">
                <div className="w-full h-1 rounded mb-1.5 bg-[#8E1B3A]/20"></div>
                <div className="w-3/4 h-1 rounded mb-1.5 bg-[#8E1B3A]/20"></div>
                <FileText size={14} className="mt-auto absolute bottom-2 right-2 text-[#8E1B3A]" />
             </div>

             <div className="absolute bottom-[25%] right-[20%] w-16 h-20 backdrop-blur-md rounded-lg p-2 z-30 animate-[float_6s_ease-in-out_infinite_1s] bg-white/80 border border-[#8E1B3A]/20 shadow-lg">
                <div className="w-full h-1 rounded mb-1.5 bg-[#8E1B3A]/20"></div>
                <div className="w-1/2 h-1 rounded mb-1.5 bg-[#8E1B3A]/20"></div>
                <BarChart3 size={14} className="mt-auto absolute bottom-2 left-2 text-[#8E1B3A]" />
             </div>

             <div className="absolute bottom-[15%] left-[30%] w-16 h-20 backdrop-blur-sm rounded-lg p-2 z-10 animate-[float_7s_ease-in-out_infinite_2s] bg-[rgba(142,27,58,0.02)] border border-[#8E1B3A]/10 shadow-md">
                <div className="w-full h-1 rounded mb-1.5 bg-[#D98F8F]/40"></div>
                <div className="w-full h-1 rounded mb-1.5 bg-[#D98F8F]/40"></div>
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
