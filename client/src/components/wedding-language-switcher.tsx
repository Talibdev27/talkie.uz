import { useTranslation } from 'react-i18next';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import type { Wedding } from '@shared/schema';

interface WeddingLanguageSwitcherProps {
  wedding: Wedding;
  className?: string;
}

const LANGUAGE_NAMES = {
  en: { name: 'English', flag: '🇺🇸' },
  uz: { name: "O'zbekcha", flag: '🇺🇿' },
  ru: { name: 'Русский', flag: '🇷🇺' },
  kk: { name: 'Қазақша', flag: '🇰🇿' },
  kaa: { name: 'Qaraqalpaqsha', flag: '🇺🇿' }
} as const;

export function WeddingLanguageSwitcher({ wedding, className = '' }: WeddingLanguageSwitcherProps) {
  const { i18n } = useTranslation();

  // Get available languages from wedding settings, fallback to ['en']
  const availableLanguages = wedding.availableLanguages || ['en'];
  const defaultLanguage = wedding.defaultLanguage || 'en';

  // If only one language is available, don't show the switcher
  if (availableLanguages.length <= 1) {
    return null;
  }

  // Determine current language - check if current language is available for this wedding
  const currentLanguage = availableLanguages.includes(i18n.language) 
    ? i18n.language 
    : defaultLanguage;

  // Update language if current language is not available for this wedding
  if (i18n.language !== currentLanguage) {
    i18n.changeLanguage(currentLanguage);
  }

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
    
    // Update URL to include language parameter for SEO and sharing
    const url = new URL(window.location.href);
    url.searchParams.set('lang', langCode);
    window.history.replaceState({}, '', url.toString());
  };

  const currentLangInfo = LANGUAGE_NAMES[currentLanguage as keyof typeof LANGUAGE_NAMES];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`bg-white/90 backdrop-blur-sm border-white/20 hover:bg-white ${className}`}
        >
          <Globe className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">{currentLangInfo?.flag}</span>
          <span className="ml-1 hidden md:inline">{currentLangInfo?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        {availableLanguages.map((langCode) => {
          const langInfo = LANGUAGE_NAMES[langCode as keyof typeof LANGUAGE_NAMES];
          if (!langInfo) return null;
          
          return (
            <DropdownMenuItem
              key={langCode}
              onClick={() => handleLanguageChange(langCode)}
              className={`flex items-center gap-2 cursor-pointer ${
                currentLanguage === langCode ? 'bg-primary/10 font-medium' : ''
              }`}
            >
              <span className="text-base">{langInfo.flag}</span>
              <span>{langInfo.name}</span>
              {langCode === defaultLanguage && (
                <span className="text-xs text-muted-foreground ml-auto">Default</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}