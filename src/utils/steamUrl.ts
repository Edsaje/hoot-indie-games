/**
 * Utilitaires légers d'extraction d'URL et OpenID Steam sans dépendances réseau
 */

export function extractSteamIdFromOpenId(searchParams: URLSearchParams): string | null {
  const claimedId = searchParams.get('openid.claimed_id') || searchParams.get('openid.identity');
  if (!claimedId) return null;

  const match = claimedId.match(/\/id\/(\d{17})/);
  return match ? match[1] : null;
}

export function getAppIdFromSteamUrl(url?: string | null): number | null {
  if (!url) return null;
  const match = url.match(/\/app\/(\d+)/);
  if (!match) return null;
  const num = parseInt(match[1], 10);
  return isNaN(num) ? null : num;
}
