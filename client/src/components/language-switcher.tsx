import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Languages, Check, Globe } from "lucide-react";
import { supportedLanguages, changeLanguage, getCurrentLanguage, getLanguageInfo } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  variant?: "dropdown" | "compact" | "button";
  showLabel?: boolean;
  className?: string;
}

export function LanguageSwitcher({ 
  variant = "dropdown", 
  showLabel = true, 
  className 
}: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setCurrentLang(lng);
      setIsChanging(false);
    };

    i18n.on('languageChanged', handleLanguageChanged);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode === currentLang) return;
    
    setIsChanging(true);
    const success = await changeLanguage(languageCode);
    
    if (!success) {
      setIsChanging(false);
      console.error('Failed to change language');
    }
  };

  const currentLanguage = getLanguageInfo(currentLang);

  if (variant === "dropdown") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {showLabel && (
          <div className="flex items-center gap-1">
            <Languages className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700 hidden sm:inline">
              {t('common.language')}
            </span>
          </div>
        )}
        <Select 
          value={currentLang} 
          onValueChange={handleLanguageChange}
          disabled={isChanging}
        >
          <SelectTrigger className="w-[140px] sm:w-[160px]">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span className="text-lg">{currentLanguage.flag}</span>
                <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
                <span className="sm:hidden">{currentLanguage.code.toUpperCase()}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {supportedLanguages.map((language) => (
              <SelectItem key={language.code} value={language.code}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{language.flag}</span>
                  <span>{language.nativeName}</span>
                  {language.code === currentLang && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className={cn("h-8 w-8 p-0", className)}
            disabled={isChanging}
          >
            <Globe className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48" align="end">
          <div className="space-y-1">
            <h4 className="font-medium text-sm mb-2">{t('common.selectLanguage')}</h4>
            {supportedLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-gray-100",
                  language.code === currentLang && "bg-blue-50 text-blue-700"
                )}
                disabled={isChanging}
              >
                <span className="text-lg">{language.flag}</span>
                <span className="flex-1 text-left">{language.nativeName}</span>
                {language.code === currentLang && (
                  <Check className="h-4 w-4" />
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  if (variant === "button") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {supportedLanguages.map((language) => (
          <Button
            key={language.code}
            variant={language.code === currentLang ? "default" : "ghost"}
            size="sm"
            onClick={() => handleLanguageChange(language.code)}
            disabled={isChanging}
            className="h-8 px-2"
          >
            <span className="text-lg mr-1">{language.flag}</span>
            <span className="hidden sm:inline text-xs">{language.code.toUpperCase()}</span>
          </Button>
        ))}
      </div>
    );
  }

  return null;
}

// Hook for language switching in components
export function useLanguageSwitcher() {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setCurrentLanguage(lng);
    };

    i18n.on('languageChanged', handleLanguageChanged);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  return {
    currentLanguage,
    supportedLanguages,
    changeLanguage: async (code: string) => {
      return await changeLanguage(code);
    },
    getLanguageInfo: (code: string) => getLanguageInfo(code)
  };
}

// Mobile-optimized language switcher for small screens
export function MobileLanguageSwitcher({ className }: { className?: string }) {
  const { t } = useTranslation();
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2">
        <Languages className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium">{t('common.language')}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {supportedLanguages.map((language) => (
          <button
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={cn(
              "flex flex-col items-center gap-1 p-3 rounded-lg border text-center transition-colors",
              language.code === currentLang 
                ? "bg-blue-50 border-blue-200 text-blue-700" 
                : "hover:bg-gray-50"
            )}
          >
            <span className="text-2xl">{language.flag}</span>
            <span className="text-xs font-medium">{language.nativeName}</span>
          </button>
        ))}
      </div>
    </div>
  );
}