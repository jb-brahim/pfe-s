'use client';

import React from 'react';
import { CommandCenter } from '@/components/smartfacture/command-center';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  const handleNavigate = (page: string) => {
    // In the new routing system, we use real URLs
    if (page === 'processing-lab') {
      router.push('/processing-lab');
    } else if (page === 'financial-vault') {
      router.push('/vault');
    }
  };

  return <CommandCenter onNavigate={handleNavigate} />;
}
