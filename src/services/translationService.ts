/**
 * translationService.ts
 * Service de traduction automatique pour le tchat multilingue de Hoot Indie Games.
 * Utilise l'API MyMemory sécurisée avec cache en mémoire, limitation de requêtes
 * et fallback gracieux sans blocage.
 */

/**
 * translationService.ts
 * Service souverain de traduction automatique pour le tchat multilingue de Hoot Indie Games.
 * 
 * Architecture résiliente multi-niveaux :
 * 1. Cache mémoire instantané (évite toute requête répétée)
 * 2. Moteur principal : API de traduction Google Translate (instantanée, détection auto fiable, pas d'entités HTML)
 * 3. Moteur de secours (fallback) : API MyMemory avec e-mail officiel (quota étendu 10k mots/jour et gestion du status 403 même langue)
 * 4. Fallback gracieux sans bloquer ni perturber l'expérience utilisateur
 */

export interface TranslationResult {
  translatedText: string;
  success: boolean;
  isCached?: boolean;
  isSameLanguage?: boolean;
  detectedLang?: string;
}

// Cache en mémoire pour éviter les requêtes réseau répétées
const translationCache = new Map<string, { translatedText: string; isSameLanguage?: boolean; detectedLang?: string }>();

// Mappage des langues de l'application vers les codes ISO standards
export function normalizeLanguageCode(lang: string): string {
  if (!lang) return 'en';
  const lower = lang.toLowerCase();
  if (lower.startsWith('fr')) return 'fr';
  if (lower.startsWith('en')) return 'en';
  if (lower.startsWith('de')) return 'de';
  if (lower.startsWith('es')) return 'es';
  if (lower.startsWith('ja')) return 'ja';
  if (lower.startsWith('pt')) return 'pt';
  return lower.slice(0, 2);
}

// Décodage des entités HTML renvoyées par certaines API de traduction
function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&nbsp;/g, ' ');
}

/**
 * Traduit un texte vers la langue cible donnée.
 * @param text Le texte source à traduire
 * @param targetLang Code de la langue cible (ex: 'fr', 'en', 'de', 'es', 'ja', 'pt')
 * @param sourceLang Code de la langue source optionnelle (ex: 'de', ou 'autodetect' par défaut)
 */
export async function translateChatMessage(
  text: string,
  targetLang: string,
  sourceLang?: string
): Promise<TranslationResult> {
  const trimmed = text.trim();
  if (!trimmed) {
    return { translatedText: text, success: true, isSameLanguage: true };
  }

  // Ne pas appeler d'API si le texte ne contient aucune lettre (ex: seulement des emojis, des chiffres ou des liens)
  const hasLetters = /\p{L}/u.test(trimmed);
  if (!hasLetters) {
    return { translatedText: text, success: true, isSameLanguage: true };
  }

  const normTarget = normalizeLanguageCode(targetLang);
  const explicitSource = sourceLang && sourceLang !== 'global' && sourceLang !== 'feedback' && sourceLang !== 'autodetect'
    ? normalizeLanguageCode(sourceLang)
    : undefined;

  // Si une source explicite identique à la cible est fournie, aucun besoin de traduire
  if (explicitSource && explicitSource === normTarget) {
    return { translatedText: text, success: true, isSameLanguage: true, detectedLang: explicitSource };
  }

  const cacheKey = `${normTarget}|${trimmed}`;
  if (translationCache.has(cacheKey)) {
    const cached = translationCache.get(cacheKey)!;
    return { ...cached, success: true, isCached: true };
  }

  // Moteur 1 : Passerelle interne souveraine /api/translate.php (même-origine 'self', immunisée CSP et ad-blockers)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const sl = explicitSource || 'autodetect';
    const proxyUrl = `/api/translate.php?q=${encodeURIComponent(trimmed)}&tl=${normTarget}&sl=${sl}`;

    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.success && typeof data.translatedText === 'string') {
        const isSame = Boolean(data.isSameLanguage) || data.translatedText === trimmed;
        const result: TranslationResult = {
          translatedText: isSame ? text : data.translatedText,
          success: true,
          isSameLanguage: isSame,
          detectedLang: data.detectedLang,
        };
        translationCache.set(cacheKey, result);
        return result;
      }
    }
  } catch {
    // Si la passerelle locale n'est pas joignable (ex: dev local Vite sans serveur PHP), basculer sur les moteurs directs
  }

  // Moteur 2 : Google Translate (direct navigateur, rapide, sans clé, détection auto fiable)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const sl = explicitSource || 'auto';
    const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${normTarget}&dt=t&q=${encodeURIComponent(trimmed)}`;

    const response = await fetch(gtxUrl, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translatedParts = data[0].map((part: any) => (part && part[0] ? String(part[0]) : '')).join('');
        const detected = typeof data[2] === 'string' ? normalizeLanguageCode(data[2]) : undefined;

        if (detected === normTarget || translatedParts.trim() === trimmed) {
          const result: TranslationResult = {
            translatedText: text,
            success: true,
            isSameLanguage: true,
            detectedLang: detected || normTarget,
          };
          translationCache.set(cacheKey, result);
          return result;
        }

        if (translatedParts.trim().length > 0) {
          const result: TranslationResult = {
            translatedText: translatedParts,
            success: true,
            detectedLang: detected,
          };
          translationCache.set(cacheKey, result);
          return result;
        }
      }
    }
  } catch {
    // Si Google Translate échoue ou timeout, basculer sur le moteur de secours MyMemory
  }

  // Moteur 3 (Secours) : MyMemory Translated API avec e-mail officiel
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const langpair = `${explicitSource || 'autodetect'}|${normTarget}`;
    const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${encodeURIComponent(langpair)}&de=contact@hootindiegames.com`;

    const response = await fetch(myMemoryUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const status = Number(data?.responseStatus);
      const details = String(data?.responseDetails || '').toUpperCase();

      // Cas où MyMemory signale que la langue source est déjà la langue cible
      if (status === 403 && details.includes('PLEASE SELECT TWO DISTINCT LANGUAGES')) {
        const result: TranslationResult = {
          translatedText: text,
          success: true,
          isSameLanguage: true,
          detectedLang: normTarget,
        };
        translationCache.set(cacheKey, result);
        return result;
      }

      if (status === 200 && data?.responseData?.translatedText) {
        const decoded = decodeHtmlEntities(String(data.responseData.translatedText)).trim();
        const detected = typeof data?.responseData?.detectedLanguage === 'string'
          ? normalizeLanguageCode(data.responseData.detectedLanguage)
          : undefined;

        if (
          decoded &&
          !decoded.toUpperCase().startsWith('MYMEMORY WARNING:') &&
          !decoded.toUpperCase().includes('PLEASE SELECT TWO DISTINCT LANGUAGES')
        ) {
          if (detected === normTarget || decoded === trimmed) {
            const result: TranslationResult = {
              translatedText: text,
              success: true,
              isSameLanguage: true,
              detectedLang: detected || normTarget,
            };
            translationCache.set(cacheKey, result);
            return result;
          }

          const result: TranslationResult = {
            translatedText: decoded,
            success: true,
            detectedLang: detected,
          };
          translationCache.set(cacheKey, result);
          return result;
        }
      }
    }
  } catch {
    // Échec réseau, timeout ou hors-ligne : renvoie le texte d'origine sans perturber l'expérience
  }

  return { translatedText: text, success: false };
}
