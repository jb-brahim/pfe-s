'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
type Language = 'EN' | 'FR' | 'AR';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const dictionaries: Record<Language, Record<string, any>> = {
  EN: {},
  FR: {},
  AR: {}
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('EN');
  const [isLoaded, setIsLoaded] = useState(false);
  const [dictVersion, setDictVersion] = useState(0);

  useEffect(() => {
    const savedLang = localStorage.getItem('app-lang') as Language;
    if (savedLang && ['EN', 'FR', 'AR'].includes(savedLang)) {
      setLanguageState(savedLang);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const loadDictionary = async () => {
      // Avoid fetching if already loaded and not empty
      if (Object.keys(dictionaries[language]).length > 0) {
        setDictVersion(v => v + 1);
        return;
      }
      try {
        const res = await fetch(`/locales/${language.toLowerCase()}.json?t=${Date.now()}`);
        const data = await res.json();
        dictionaries[language] = data;
        setDictVersion(v => v + 1);
      } catch (error) {
        console.error(`Failed to load ${language} dictionary`, error);
      }
    };
    if (isLoaded) {
      loadDictionary();
    }
  }, [language, isLoaded]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-lang', lang);
  };

  const t = (key: string) => {
    // depend on dictVersion to force re-render
    const version = dictVersion; 
    const keys = key.split('.');
    let value: any = dictionaries[language];
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        value = undefined;
        break;
      }
    }
    return typeof value === 'string' ? value : key;
  };

  const pathname = usePathname();

  // Determine if RTL layout should be applied. 
  // Public pages like home and auth don't support Arabic layout right now.
  const isPublicPage = pathname === '/' || pathname?.startsWith('/auth');
  const applyRtl = language === 'AR' && !isPublicPage;

  if (!isLoaded) return null; // Prevent hydration mismatch

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      <div dir={applyRtl ? 'rtl' : 'ltr'} className={applyRtl ? 'font-arabic' : ''}>
        {children}
      </div>
    </I18nContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
