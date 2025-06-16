import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from '../locales/en.json';
import uz from '../locales/uz.json';
import ru from '../locales/ru.json';

const resources = {
  en: { translation: en },
  uz: { translation: uz },
  ru: { translation: ru }
};

// Language persistence configuration
const detectionOptions = {
  order: ['cookie', 'localStorage', 'navigator', 'htmlTag'],
  lookupCookie: 'wedding_language',
  lookupLocalStorage: 'wedding_language',
  cookieMinutes: 43200, // 30 days
  caches: ['localStorage', 'cookie']
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    detection: detectionOptions,
    
    interpolation: {
      escapeValue: false
    },
    
    // Namespace configuration
    defaultNS: 'translation',
    ns: ['translation'],
    
    // Language switching behavior
    load: 'languageOnly',
    
    // React-specific options
    react: {
      useSuspense: false
    }
  });

// Language change handler for user profile updates
i18n.on('languageChanged', (lng) => {
  // Save to localStorage for persistence
  localStorage.setItem('wedding_language', lng);
  
  // Save to cookie for server-side detection
  document.cookie = `wedding_language=${lng}; max-age=${43200 * 60}; path=/; SameSite=Lax`;
  
  // Update HTML lang attribute for accessibility
  document.documentElement.lang = lng;
  
  // Update text direction for RTL languages (future enhancement)
  const rtlLanguages = ['ar', 'he', 'fa'];
  document.documentElement.dir = rtlLanguages.includes(lng) ? 'rtl' : 'ltr';
});

export default i18n;

// Helper functions for language management
export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'uz', name: 'Uzbek', nativeName: 'O\'zbekcha', flag: '🇺🇿' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' }
];

export const getCurrentLanguage = () => i18n.language;

export const changeLanguage = async (languageCode: string) => {
  try {
    await i18n.changeLanguage(languageCode);
    return true;
  } catch (error) {
    console.error('Failed to change language:', error);
    return false;
  }
};

export const getLanguageInfo = (code: string) => {
  return supportedLanguages.find(lang => lang.code === code) || supportedLanguages[0];
};

// Date and number formatting utilities
export const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const locale = i18n.language === 'uz' ? 'uz-UZ' : i18n.language === 'ru' ? 'ru-RU' : 'en-US';
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  }).format(dateObj);
};

export const formatNumber = (number: number, options?: Intl.NumberFormatOptions) => {
  const locale = i18n.language === 'uz' ? 'uz-UZ' : i18n.language === 'ru' ? 'ru-RU' : 'en-US';
  
  return new Intl.NumberFormat(locale, options).format(number);
};