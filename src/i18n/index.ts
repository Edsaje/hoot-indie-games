import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr.json';
import { getAppLanguage, type AppLanguage } from '../utils/localization';

const SUPPORTED_LANGS: AppLanguage[] = ['fr', 'en', 'es', 'de', 'ja', 'pt-BR'];

const localeLoaders: Record<string, () => Promise<{ default: any }>> = {
  en: () => import('./locales/en.json'),
  es: () => import('./locales/es.json'),
  de: () => import('./locales/de.json'),
  ja: () => import('./locales/ja.json'),
  'pt-BR': () => import('./locales/pt-BR.json'),
};

export const ensureLanguageLoaded = async (lng: string): Promise<void> => {
  if (!i18n.hasResourceBundle(lng, 'translation') && localeLoaders[lng]) {
    const mod = await localeLoaders[lng]();
    i18n.addResourceBundle(lng, 'translation', (mod.default || mod) as any, true, true);
  }
};

const getInitialLanguage = (): AppLanguage => {
  if (typeof window === 'undefined') return 'fr';
  const saved = localStorage.getItem('hoot_lang');
  if (saved && SUPPORTED_LANGS.includes(saved as AppLanguage)) {
    return saved as AppLanguage;
  }
  const browserLang = navigator.language || '';
  return getAppLanguage(browserLang);
};

const initialLang = getInitialLanguage();

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
  },
  lng: initialLang,
  fallbackLng: 'fr',
  interpolation: {
    escapeValue: false, // React handles XSS
  },
});

if (initialLang !== 'fr') {
  ensureLanguageLoaded(initialLang).then(() => {
    i18n.changeLanguage(initialLang);
  });
}

i18n.on('languageChanged', async (lng) => {
  if (!i18n.hasResourceBundle(lng, 'translation') && localeLoaders[lng]) {
    await ensureLanguageLoaded(lng);
  }
  localStorage.setItem('hoot_lang', lng);
  document.documentElement.lang = lng;
});

export default i18n;
