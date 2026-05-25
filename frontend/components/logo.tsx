import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 rounded-md text-[14px]',
    md: 'w-8 h-8 rounded-xl text-[20px]',
    lg: 'w-12 h-12 rounded-2xl text-[28px]',
    xl: 'w-16 h-16 rounded-3xl text-[36px]',
  };

  return (
    <div 
      className={`flex items-center justify-center bg-[#FFB6C1] shadow-sm flex-shrink-0 ${sizeClasses[size]} ${className}`}
      style={{ fontFamily: 'Arial Black, Impact, sans-serif' }}
    >
      <span className="font-black text-black leading-none transform translate-y-[1px]">A</span>
    </div>
  );
}
