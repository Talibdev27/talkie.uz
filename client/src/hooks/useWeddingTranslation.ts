import { useState, useEffect } from 'react';
import { weddingTranslations } from '@/translations/wedding';
import type { Wedding } from '@shared/schema';

export function useWeddingTranslation(wedding: Wedding | undefined) {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');

  useEffect(() => {
    if (wedding) {
      // Check URL parameter first
      const urlParams = new URLSearchParams(window.location.search);
      const langFromUrl = urlParams.get('lang');
      
      if (langFromUrl && wedding.availableLanguages?.includes(langFromUrl)) {
        setCurrentLanguage(langFromUrl);
      } else {
        // Use wedding default language
        setCurrentLanguage(wedding.defaultLanguage || 'en');
      }
    }
  }, [wedding]);

  const changeLanguage = (langCode: string) => {
    if (wedding?.availableLanguages?.includes(langCode)) {
      setCurrentLanguage(langCode);
      
      // Update URL parameter
      const url = new URL(window.location.href);
      url.searchParams.set('lang', langCode);
      window.history.replaceState({}, '', url.toString());
      
      // Store in sessionStorage for persistence
      sessionStorage.setItem('wedding-language', langCode);
    }
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = weddingTranslations[currentLanguage as keyof typeof weddingTranslations];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return {
    currentLanguage,
    changeLanguage,
    t,
    availableLanguages: wedding?.availableLanguages || ['en']
  };
}