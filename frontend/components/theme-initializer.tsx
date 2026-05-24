'use client';

import { useLayoutEffect } from 'react';

export function ThemeInitializer() {
  useLayoutEffect(() => {
    const theme = localStorage.getItem('app-theme') || 'light';
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
  }, []);

  return null;
}
