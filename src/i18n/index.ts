import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr.json';
import en from './locales/en.json';
import es from './locales/es.json';
import de from './locales/de.json';
import ja from './locales/ja.json';
import ptBR from './locales/pt-BR.json';
import { getAppLanguage, type AppLanguage } from '../utils/localization';

const SUPPORTED_LANGS: AppLanguage[] = ['fr', 'en', 'es', 'de', 'ja', 'pt-BR'];

const getInitialLanguage = (): AppLanguage => {
  const saved = localStorage.getItem('hoot_lang');
  if (saved && SUPPORTED_LANGS.includes(saved as AppLanguage)) {
    return saved as AppLanguage;
  }
  const browserLang = navigator.language || '';
  return getAppLanguage(browserLang);
};

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
    es: { translation: es },
    de: { translation: de },
    ja: { translation: ja },
    'pt-BR': { translation: ptBR },
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
