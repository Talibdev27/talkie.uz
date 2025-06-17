import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import type { Wedding } from '@shared/schema';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'uz', name: 'O\'zbekcha', flag: '🇺🇿' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'kk', name: 'Қазақша', flag: '🇰🇿' },
  { code: 'kaa', name: 'Qaraqalpaqsha', flag: '🇺🇿' }
];

interface WeddingLanguageSwitcherProps {
  wedding: Wedding;
  className?: string;
}

export function WeddingLanguageSwitcher({ wedding, className = '' }: WeddingLanguageSwitcherProps) {
  const [currentLanguage, setCurrentLanguage] = useState(wedding.defaultLanguage || 'en');
  
  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  const changeLanguage = (langCode: string) => {
    setCurrentLanguage(langCode);
    // Trigger a page reload with the new language
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Globe className="h-4 w-4 mr-2" />
          <span className="mr-1">{currentLang.flag}</span>
          {currentLang.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className="flex items-center cursor-pointer"
          >
            <span className="mr-2">{language.flag}</span>
            <span>{language.name}</span>
            {currentLanguage === language.code && (
              <span className="ml-auto text-blue-600">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}