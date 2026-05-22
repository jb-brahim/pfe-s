'use client';

import { useLayoutEffect } from 'react';

export function ThemeInitializer() {
  useLayoutEffect(() => {
    const theme = localStorage.getItem('app-theme') || 'light';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return null;
}
