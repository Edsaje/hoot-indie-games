import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr.json';
import en from './locales/en.json';

const getInitialLanguage = (): string => {
  const saved = localStorage.getItem('hoot_lang');
  if (saved && (saved === 'fr' || saved === 'en')) {
    return saved;
  }
  const browserLang = navigator.language.toLowerCase();
  return browserLang.startsWith('fr') ? 'fr' : 'en';
};

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React handles XSS
  },
});

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('hoot_lang', lng);
  document.documentElement.lang = lng;
});

export default i18n;
