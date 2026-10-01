import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Product } from '../types';
import en from './en.json';
import hi from './hi.json';
import gu from './gu.json';

const dictionaries: Record<Language, any> = {
  en,
  hi,
  gu,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
  getLocalizedName: (product: Partial<Product>) => string;
  getLocalizedDesc: (product: Partial<Product>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('chamunda_lang');
    if (saved === 'hi' || saved === 'gu' || saved === 'en') {
      return saved as Language;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('chamunda_lang', lang);
  };

  const t = (key: string, variables?: Record<string, string | number>): string => {
    const dict = dictionaries[language] || dictionaries.en;
    const parts = key.split('.');
    let current: any = dict;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        // Fallback to English
        let fallback: any = dictionaries.en;
        for (const fbPart of parts) {
          if (fallback && typeof fallback === 'object' && fbPart in fallback) {
            fallback = fallback[fbPart];
          } else {
            return key;
          }
        }
        current = fallback;
        break;
      }
    }

    if (typeof current !== 'string') {
      return key;
    }

    let text = current;
    if (variables) {
      for (const [vKey, val] of Object.entries(variables)) {
        text = text.replace(new RegExp(`{{${vKey}}}`, 'g'), String(val));
      }
    }
    return text;
  };

  const getLocalizedName = (product: Partial<Product>): string => {
    if (!product) return '';
    if (language === 'hi' && product.name_hi && product.name_hi.trim()) {
      return product.name_hi;
    }
    if (language === 'gu' && product.name_gu && product.name_gu.trim()) {
      return product.name_gu;
    }
    return product.name || '';
  };

  const getLocalizedDesc = (product: Partial<Product>): string => {
    if (!product) return '';
    if (language === 'hi' && product.description_hi && product.description_hi.trim()) {
      return product.description_hi;
    }
    if (language === 'gu' && product.description_gu && product.description_gu.trim()) {
      return product.description_gu;
    }
    return product.description || '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getLocalizedName, getLocalizedDesc }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
