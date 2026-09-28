/**
 * 🦉 Hoot Indie Games — Service de Formatage & Conversion Monétaire Locale
 * Gère l'affichage multidevises selon la langue et la localisation de l'utilisateur :
 * - EUR (€) pour Français (fr), Espagnol (es), Allemand (de)
 * - USD ($) pour Anglais (en / global)
 * - JPY (¥ / 円) pour Japonais (ja)
 * - BRL (R$) pour Portugais Brésilien (pt-BR)
 */

import type { AppLanguage } from './localization';
import { getAppLanguage } from './localization';
import type { SteamStoreGameData } from '../data/steamStoreData';

export type SupportedCurrency = 'EUR' | 'USD' | 'JPY' | 'BRL';

export interface CurrencyConfig {
  currency: SupportedCurrency;
  symbol: string;
  position: 'before' | 'after';
  space: boolean;
  decimals: number;
  rateFromEur: number; // Taux de parité standard pour Steam régional
  freeLabel: string;
  storeSuffix: {
    steam: string;
    itch: string;
  };
}

export const CURRENCY_CONFIGS: Record<AppLanguage, CurrencyConfig> = {
  fr: {
    currency: 'EUR',
    symbol: '€',
    position: 'after',
    space: true,
    decimals: 2,
    rateFromEur: 1.0,
    freeLabel: 'Gratuit',
    storeSuffix: {
      steam: 'sur Steam',
      itch: 'sur Itch.io',
    },
  },
  en: {
    currency: 'USD',
    symbol: '$',
    position: 'before',
    space: false,
    decimals: 2,
    rateFromEur: 1.08,
    freeLabel: 'Free',
    storeSuffix: {
      steam: 'on Steam',
      itch: 'on Itch.io',
    },
  },
  es: {
    currency: 'EUR',
    symbol: '€',
    position: 'after',
    space: true,
    decimals: 2,
    rateFromEur: 1.0,
    freeLabel: 'Gratis',
    storeSuffix: {
      steam: 'en Steam',
      itch: 'en Itch.io',
    },
  },
  de: {
    currency: 'EUR',
    symbol: '€',
    position: 'after',
    space: true,
    decimals: 2,
    rateFromEur: 1.0,
    freeLabel: 'Kostenlos',
    storeSuffix: {
      steam: 'auf Steam',
      itch: 'auf Itch.io',
    },
  },
  ja: {
    currency: 'JPY',
    symbol: '¥',
    position: 'before',
    space: false,
    decimals: 0, // Le Yen ne possède pas de centimes
    rateFromEur: 160.0,
    freeLabel: '無料',
    storeSuffix: {
      steam: 'Steamにて',
      itch: 'Itch.ioにて',
    },
  },
  'pt-BR': {
    currency: 'BRL',
    symbol: 'R$',
    position: 'before',
    space: true,
    decimals: 2,
    rateFromEur: 5.5,
    freeLabel: 'Grátis',
    storeSuffix: {
      steam: 'no Steam',
      itch: 'no Itch.io',
    },
  },
};

/**
 * Mappage des paramètres Steam Store API (Country Code et Langue) pour chaque locale
 */
export const STEAM_LOCALE_PARAMS: Record<AppLanguage, { cc: string; l: string }> = {
  fr: { cc: 'fr', l: 'french' },
  en: { cc: 'us', l: 'english' },
  es: { cc: 'es', l: 'spanish' },
  de: { cc: 'de', l: 'german' },
  ja: { cc: 'jp', l: 'japanese' },
  'pt-BR': { cc: 'br', l: 'brazilian' },
};

/**
 * Formate un montant numérique dans la monnaie locale de la langue sélectionnée
 */
export function formatCurrencyAmount(amount: number, langInput?: string): string {
  const lang = getAppLanguage(langInput);
  const cfg = CURRENCY_CONFIGS[lang];

  if (amount <= 0) {
    return cfg.freeLabel;
  }

  if (cfg.decimals === 0) {
    // Japonais : arrondi entier sans centimes, séparateur de milliers
    const rounded = Math.round(amount);
    const numStr = rounded.toLocaleString(lang === 'ja' ? 'ja-JP' : 'en-US');
    return `${cfg.symbol}${numStr}`;
  }

  // Décimales avec virgule ou point selon locale
  const isCommaDecimal = lang === 'fr' || lang === 'es' || lang === 'de' || lang === 'pt-BR';
  const fixed = amount.toFixed(cfg.decimals);
  const numStr = isCommaDecimal ? fixed.replace('.', ',') : fixed;

  if (cfg.position === 'before') {
    return cfg.space ? `${cfg.symbol} ${numStr}` : `${cfg.symbol}${numStr}`;
  }
  return cfg.space ? `${numStr} ${cfg.symbol}` : `${numStr}${cfg.symbol}`;
}

/**
 * Convertit un montant en centimes d'Euros vers la devise ciblée
 */
export function convertEurCentsToLocale(cents: number, langInput?: string): string {
  const lang = getAppLanguage(langInput);
  const cfg = CURRENCY_CONFIGS[lang];

  if (cents <= 0) {
    return cfg.freeLabel;
  }

  const eurValue = cents / 100;
  const targetValue = eurValue * cfg.rateFromEur;
  return formatCurrencyAmount(targetValue, lang);
}

export interface LocalizedPriceResult {
  formattedFinal: string;
  formattedInitial?: string;
  isFree: boolean;
  discountPercent: number;
}

/**
 * Formate le prix officiel d'un jeu Steam selon la locale courante du visiteur
 */
export function formatSteamPrice(
  storeData?: SteamStoreGameData | null,
  langInput?: string,
  fallbackFree?: boolean
): LocalizedPriceResult {
  const lang = getAppLanguage(langInput);
  const cfg = CURRENCY_CONFIGS[lang];

  if (!storeData) {
    return {
      formattedFinal: fallbackFree ? cfg.freeLabel : '',
      isFree: Boolean(fallbackFree),
      discountPercent: 0,
    };
  }

  if (storeData.isFree || storeData.finalPriceCents === 0) {
    return {
      formattedFinal: cfg.freeLabel,
      isFree: true,
      discountPercent: 0,
    };
  }

  // Pour les langues européennes (FR, ES, DE) avec prix original en EUR,
  // conserver la chaîne officielle pré-formatée si disponible
  if ((lang === 'fr' || lang === 'es' || lang === 'de') && storeData.currency === 'EUR' && storeData.formattedFinalPrice) {
    return {
      formattedFinal: storeData.formattedFinalPrice,
      formattedInitial: storeData.formattedInitialPrice || undefined,
      isFree: false,
      discountPercent: storeData.discountPercent,
    };
  }

  // Conversion dynamique pour USD ($), JPY (¥) et BRL (R$)
  const finalConverted = convertEurCentsToLocale(storeData.finalPriceCents, lang);
  const initialConverted =
    storeData.discountPercent > 0 && storeData.initialPriceCents > 0
      ? convertEurCentsToLocale(storeData.initialPriceCents, lang)
      : undefined;

  return {
    formattedFinal: finalConverted,
    formattedInitial: initialConverted,
    isFree: false,
    discountPercent: storeData.discountPercent,
  };
}

/**
 * Formate le prix d'un micro-indé en tenant compte de `pricingText` multilingue ou en convertissant
 */
export function formatMicroIndiePrice(
  pricingText: Record<string, string | undefined> | string | undefined,
  isFree: boolean | undefined,
  langInput?: string
): string {
  const lang = getAppLanguage(langInput);
  const cfg = CURRENCY_CONFIGS[lang];

  if (isFree) {
    return `${cfg.freeLabel} 🆓`;
  }

  if (!pricingText) {
    return '';
  }

  // Si un dictionnaire multilingue est déjà renseigné
  if (typeof pricingText === 'object' && pricingText !== null) {
    const val = pricingText[lang];
    if (val) {
      return val;
    }
    // Replis intelligents
    if (lang === 'en' && pricingText.en) return pricingText.en;
    if (pricingText.fr) {
      // Si seule la version FR existe (ex: "1,99 € sur Steam"), convertir pour les devises étrangères
      return convertExistingPriceString(pricingText.fr, lang);
    }
  }

  // Si pricingText est une simple chaîne (ex: "1,99 € sur Steam")
  if (typeof pricingText === 'string') {
    return convertExistingPriceString(pricingText, lang);
  }

  return '';
}

/**
 * Extrait et convertit une chaîne de prix existante (ex: "2,99 € sur Steam" ou "$4.99 on Itch")
 */
function convertExistingPriceString(raw: string, targetLang: AppLanguage): string {
  const cfg = CURRENCY_CONFIGS[targetLang];
  const isFree = /gratuit|free|gratis|kostenlos|無料/i.test(raw);
  if (isFree) {
    return `${cfg.freeLabel} 🆓`;
  }

  // Extraction d'un montant numérique (ex: "1,99", "1.99", "12")
  const match = raw.match(/(\d+(?:[.,]\d{1,2})?)/);
  if (!match) {
    return raw;
  }

  const num = parseFloat(match[1].replace(',', '.'));
  if (isNaN(num)) {
    return raw;
  }

  // Déterminer la source (si $ ou USD -> convertir depuis USD, sinon depuis EUR)
  const isUsd = raw.includes('$') || /usd/i.test(raw);
  const eurEquivalent = isUsd ? num / 1.08 : num;
  const targetConverted = eurEquivalent * cfg.rateFromEur;
  const formattedNum = formatCurrencyAmount(targetConverted, targetLang);

  // Conserver la plateforme mentionnée (Steam, Itch)
  const isSteam = /steam/i.test(raw);
  const isItch = /itch/i.test(raw);

  if (isSteam && isItch) {
    return targetLang === 'ja'
      ? `Steam / Itch.ioにて ${formattedNum}`
      : `${formattedNum} (${isSteam ? 'Steam' : ''} / Itch)`;
  }
  if (isSteam) {
    return targetLang === 'ja' ? `Steamにて${formattedNum}` : `${formattedNum} ${cfg.storeSuffix.steam}`;
  }
  if (isItch) {
    return targetLang === 'ja' ? `Itch.ioにて${formattedNum}` : `${formattedNum} ${cfg.storeSuffix.itch}`;
  }

  return formattedNum;
}

/**
 * Génère automatiquement le dictionnaire multilingue de prix pour les 6 langues
 */
export function generateMultilingualPricingText(
  eurAmount: number,
  platform: 'steam' | 'itch' | 'both',
  isFree?: boolean
): Record<AppLanguage, string> {
  const result: Record<string, string> = {};
  const languages: AppLanguage[] = ['fr', 'en', 'es', 'de', 'ja', 'pt-BR'];

  for (const lang of languages) {
    const cfg = CURRENCY_CONFIGS[lang];
    if (isFree || eurAmount <= 0) {
      result[lang] = `${cfg.freeLabel} 🆓`;
      continue;
    }

    const converted = formatCurrencyAmount(eurAmount * cfg.rateFromEur, lang);
    const store =
      platform === 'both'
        ? lang === 'ja'
          ? 'Steam & Itch.ioにて'
          : `Steam & Itch.io`
        : platform === 'itch'
        ? cfg.storeSuffix.itch
        : cfg.storeSuffix.steam;

    if (lang === 'ja') {
      result[lang] = platform === 'both' ? `Steam & Itch.ioにて ${converted}` : `${store} ${converted}`;
    } else {
      result[lang] = `${converted} ${store}`;
    }
  }

  return result as Record<AppLanguage, string>;
}
