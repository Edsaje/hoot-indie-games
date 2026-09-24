/**
 * translationService.ts
 * Service de traduction automatique pour le tchat multilingue de Hoot Indie Games.
 * Utilise l'API MyMemory sécurisée avec cache en mémoire, limitation de requêtes
 * et fallback gracieux sans blocage.
 */

// Cache en mémoire pour éviter les requêtes répétées
const translationCache = new Map<string, string>();

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
): Promise<{ translatedText: string; success: boolean; isCached?: boolean }> {
  const trimmed = text.trim();
  if (!trimmed) {
    return { translatedText: text, success: true };
  }

  const normTarget = normalizeLanguageCode(targetLang);
  const normSource = sourceLang && sourceLang !== 'global' && sourceLang !== 'feedback'
    ? normalizeLanguageCode(sourceLang)
    : 'autodetect';

  // Si source et cible sont identiques et qu'on ne demande pas d'autodétection, aucun besoin de traduire
  if (normSource !== 'autodetect' && normSource === normTarget) {
    return { translatedText: text, success: true };
  }

  const cacheKey = `${normSource}|${normTarget}|${trimmed}`;
  if (translationCache.has(cacheKey)) {
    return { translatedText: translationCache.get(cacheKey)!, success: true, isCached: true };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const langpair = `${normSource}|${normTarget}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${encodeURIComponent(langpair)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { translatedText: text, success: false };
    }

    const data = await response.json();
    if (data && data.responseData && typeof data.responseData.translatedText === 'string') {
      const decoded = decodeHtmlEntities(data.responseData.translatedText);
      // Si la réponse n'est pas vide et ne commence pas par un avertissement de quota dépassé
      if (decoded && !decoded.toUpperCase().startsWith('MYMEMORY WARNING:')) {
        translationCache.set(cacheKey, decoded);
        return { translatedText: decoded, success: true };
      }
    }

    return { translatedText: text, success: false };
  } catch (err) {
    // Échec réseau, timeout ou hors-ligne : renvoie le texte d'origine sans perturber l'expérience
    return { translatedText: text, success: false };
  }
}
