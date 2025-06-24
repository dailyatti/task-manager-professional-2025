import { useState, useEffect, useMemo } from 'react';
import { TRANSLATIONS, type StringTranslationKey, type TranslationKeys } from '../utils/translations'; // Added StringTranslationKey and TranslationKeys

export const useLanguage = () => {
  const [language, setLanguage] = useState<string>(() => {
    // Try to get language from localStorage, then from navigator, then default to 'en'
    let initialLanguage: string | null = localStorage.getItem('language');
    if (!initialLanguage && typeof navigator !== 'undefined' && navigator.language) {
      const browserLang = navigator.language.split('-')[0];
      if (browserLang && Object.prototype.hasOwnProperty.call(TRANSLATIONS, browserLang)) {
        initialLanguage = browserLang;
      }
    }
    return initialLanguage || 'en';
  });

  // RTL languages
  const rtlLanguages = useMemo(() => ['ar', 'he', 'fa', 'ur'], []);

  useEffect(() => {
    localStorage.setItem('language', language);
    
    // Set document direction for RTL languages
    document.documentElement.dir = rtlLanguages.includes(language) ? 'rtl' : 'ltr';
    // Always set document lang attribute
    document.documentElement.lang = language;
  }, [language, rtlLanguages]);

  const t = (key: StringTranslationKey): string => {
    const currentLangTranslations = TRANSLATIONS[language as keyof typeof TRANSLATIONS];
    const fallbackLangTranslations = TRANSLATIONS['en' as keyof typeof TRANSLATIONS];

    // Ensure key is a valid key of TranslationKeys for type safety
    if (currentLangTranslations && Object.prototype.hasOwnProperty.call(currentLangTranslations, key)) {
      return currentLangTranslations[key as keyof TranslationKeys] as string;
    }
    if (fallbackLangTranslations && Object.prototype.hasOwnProperty.call(fallbackLangTranslations, key)) {
      return fallbackLangTranslations[key as keyof TranslationKeys] as string;
    }
    return key; // Return the key itself if no translation is found
  };

  const isRTL = rtlLanguages.includes(language);

  return { language, setLanguage, t, isRTL };
};