import type { LocalizedText } from '../types/game';

export type AppLanguage = 'fr' | 'en' | 'es' | 'de' | 'ja' | 'pt-BR';

export interface LanguageOption {
  id: AppLanguage;
  label: string;
  nativeLabel: string;
  flag: string;
  shortCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { id: 'fr', label: 'Français', nativeLabel: 'Français', flag: '🇫🇷', shortCode: 'FR' },
  { id: 'en', label: 'Anglais', nativeLabel: 'English', flag: '🇬🇧', shortCode: 'EN' },
  { id: 'es', label: 'Espagnol', nativeLabel: 'Español', flag: '🇪🇸', shortCode: 'ES' },
  { id: 'de', label: 'Allemand', nativeLabel: 'Deutsch', flag: '🇩🇪', shortCode: 'DE' },
  { id: 'ja', label: 'Japonais', nativeLabel: '日本語', flag: '🇯🇵', shortCode: 'JA' },
  { id: 'pt-BR', label: 'Portugais (BR)', nativeLabel: 'Português (BR)', flag: '🇧🇷', shortCode: 'PT-BR' },
];

/**
 * Normalise n'importe quel code de langue vers un des 6 idiomes supportés
 */
export function getAppLanguage(lng?: string): AppLanguage {
  if (!lng) return 'en';
  const clean = lng.toLowerCase();
  if (clean.startsWith('fr')) return 'fr';
  if (clean.startsWith('es')) return 'es';
  if (clean.startsWith('de')) return 'de';
  if (clean.startsWith('ja')) return 'ja';
  if (clean.startsWith('pt')) return 'pt-BR';
  return 'en';
}

/**
 * Dictionnaire multilingue des évaluations officielles Steam
 */
export const STEAM_REVIEW_SCORE_TRANSLATIONS: Record<string, Record<AppLanguage, string>> = {
  'Overwhelmingly Positive': {
    fr: 'Extrêmement positifs',
    en: 'Overwhelmingly Positive',
    es: 'Extremadamente positivos',
    de: 'Äußerst positiv',
    ja: '圧倒的に好評',
    'pt-BR': 'Extremamente positivas',
  },
  'Very Positive': {
    fr: 'Très positifs',
    en: 'Very Positive',
    es: 'Muy positivos',
    de: 'Sehr positiv',
    ja: '非常に好評',
    'pt-BR': 'Muito positivas',
  },
  'Mostly Positive': {
    fr: 'Plutôt positifs',
    en: 'Mostly Positive',
    es: 'Mayormente positivos',
    de: 'Größtenteils positiv',
    ja: 'やや好評',
    'pt-BR': 'Ligeiramente positivas',
  },
  Positive: {
    fr: 'Positifs',
    en: 'Positive',
    es: 'Positivos',
    de: 'Positiv',
    ja: '好評',
    'pt-BR': 'Positivas',
  },
  Mixed: {
    fr: 'Moyen',
    en: 'Mixed',
    es: 'Variadas',
    de: 'Ausgeglichen',
    ja: '賛否両論',
    'pt-BR': 'Neutras',
  },
  'Extrêmement positifs': {
    fr: 'Extrêmement positifs',
    en: 'Overwhelmingly Positive',
    es: 'Extremadamente positivos',
    de: 'Äußerst positiv',
    ja: '圧倒的に好評',
    'pt-BR': 'Extremamente positivas',
  },
  'Très positifs': {
    fr: 'Très positifs',
    en: 'Very Positive',
    es: 'Muy positivos',
    de: 'Sehr positiv',
    ja: '非常に好評',
    'pt-BR': 'Muito positivas',
  },
  'Plutôt positifs': {
    fr: 'Plutôt positifs',
    en: 'Mostly Positive',
    es: 'Mayormente positivos',
    de: 'Größtenteils positiv',
    ja: 'やや好評',
    'pt-BR': 'Ligeiramente positivas',
  },
  Positifs: {
    fr: 'Positifs',
    en: 'Positive',
    es: 'Positivos',
    de: 'Positiv',
    ja: '好評',
    'pt-BR': 'Positivas',
  },
  Moyen: {
    fr: 'Moyen',
    en: 'Mixed',
    es: 'Variadas',
    de: 'Ausgeglichen',
    ja: '賛否両論',
    'pt-BR': 'Neutras',
  },
};

/**
 * Récupère le texte localisé avec chaîne de repli garantie (target -> en -> fr -> '')
 */
export function getLocalizedText(text?: LocalizedText | null, lang?: string): string {
  if (!text) return '';
  const target = getAppLanguage(lang);
  if (text[target]) return text[target] as string;

  // Interception et traduction automatique des mentions d'évaluation Steam
  const scoreKey = text.en || text.fr;
  if (scoreKey && STEAM_REVIEW_SCORE_TRANSLATIONS[scoreKey]?.[target]) {
    return STEAM_REVIEW_SCORE_TRANSLATIONS[scoreKey][target];
  }

  if (text.en) return text.en;
  if (text.fr) return text.fr;
  const firstAvailable = Object.values(text).find((val) => typeof val === 'string' && val.trim() !== '');
  return (firstAvailable as string) || '';
}

/**
 * Dictionnaire multilingue des 65 genres canoniques
 */
export const GENRE_TRANSLATIONS: Record<string, Record<AppLanguage, string>> = {
  Action: { fr: 'Action', en: 'Action', es: 'Acción', de: 'Action', ja: 'アクション', 'pt-BR': 'Ação' },
  Anthologie: { fr: 'Anthologie', en: 'Anthology', es: 'Antología', de: 'Anthologie', ja: 'アンソロジー', 'pt-BR': 'Antologia' },
  Artisanat: { fr: 'Artisanat', en: 'Crafting', es: 'Artesanía', de: 'Handwerk', ja: 'クラフト', 'pt-BR': 'Artesanato / Criação' },
  'Arts martiaux': { fr: 'Arts martiaux', en: 'Martial Arts', es: 'Artes marciales', de: 'Kampfkunst', ja: '格闘技', 'pt-BR': 'Artes Marciais' },
  Atmosphérique: { fr: 'Atmosphérique', en: 'Atmospheric', es: 'Atmosférico', de: 'Atmosphärisch', ja: '雰囲気', 'pt-BR': 'Atmosférico' },
  'Auto-Shooter': { fr: 'Auto-Shooter', en: 'Auto-Shooter', es: 'Auto-Shooter', de: 'Auto-Shooter', ja: 'オートシューター', 'pt-BR': 'Auto-Shooter' },
  Automatisation: { fr: 'Automatisation', en: 'Automation', es: 'Automatización', de: 'Automatisierung', ja: '自動化 / 工場', 'pt-BR': 'Automação' },
  Aventure: { fr: 'Aventure', en: 'Adventure', es: 'Aventura', de: 'Abenteuer', ja: 'アドベンチャー', 'pt-BR': 'Aventura' },
  'Beat them all': { fr: 'Beat them all', en: 'Beat \'em up', es: 'Beat \'em up', de: 'Beat \'em up', ja: 'ベルトスクロールアクション', 'pt-BR': 'Beat \'em up' },
  'Bullet Hell': { fr: 'Bullet Hell', en: 'Bullet Hell', es: 'Bullet Hell', de: 'Bullet Hell', ja: '弾幕系シューティング', 'pt-BR': 'Bullet Hell' },
  'City Builder': { fr: 'City Builder', en: 'City Builder', es: 'Construcción de ciudades', de: 'City Builder', ja: '都市開発 / 街づくり', 'pt-BR': 'Construção de Cidades' },
  'Colony Sim': { fr: 'Colony Sim', en: 'Colony Sim', es: 'Simulador de colonia', de: 'Kolonie-Simulation', ja: 'コロニーシミュレーション', 'pt-BR': 'Simulador de Colônia' },
  'Co-op': { fr: 'Co-op', en: 'Co-op', es: 'Cooperativo', de: 'Koop', ja: '協力プレイ', 'pt-BR': 'Cooperativo' },
  Comédie: { fr: 'Comédie', en: 'Comedy', es: 'Comedia', de: 'Komödie', ja: 'コメディ', 'pt-BR': 'Comédia' },
  Conduite: { fr: 'Conduite', en: 'Driving', es: 'Conducción', de: 'Fahren', ja: 'ドライブ', 'pt-BR': 'Corrida / Direção' },
  Cozy: { fr: 'Cozy', en: 'Cozy', es: 'Acogedor', de: 'Gemütlich', ja: '癒し系 / コージー', 'pt-BR': 'Aconchegante' },
  Cyberpunk: { fr: 'Cyberpunk', en: 'Cyberpunk', es: 'Cyberpunk', de: 'Cyberpunk', ja: 'サイバーパンク', 'pt-BR': 'Cyberpunk' },
  'Dark Fantasy': { fr: 'Dark Fantasy', en: 'Dark Fantasy', es: 'Fantasía oscura', de: 'Dark Fantasy', ja: 'ダークファンタジー', 'pt-BR': 'Fantasia Sombria' },
  Deckbuilder: { fr: 'Deckbuilder', en: 'Deckbuilder', es: 'Construcción de mazos', de: 'Deckbuilder', ja: 'デッキ構築', 'pt-BR': 'Construção de Baralho' },
  Destruction: { fr: 'Destruction', en: 'Destruction', es: 'Destrucción', de: 'Zerstörung', ja: '破壊', 'pt-BR': 'Destruição' },
  'Déduction Sociale': { fr: 'Déduction Sociale', en: 'Social Deduction', es: 'Deducción Social', de: 'Soziale Deduktion', ja: '人狼 / 社会的推論', 'pt-BR': 'Dedução Social' },
  'Dungeon Crawler': { fr: 'Dungeon Crawler', en: 'Dungeon Crawler', es: 'Exploración de mazmorras', de: 'Dungeon Crawler', ja: 'ダンジョン探索', 'pt-BR': 'Exploração de Masmorras' },
  Enquête: { fr: 'Enquête', en: 'Investigation', es: 'Investigación', de: 'Ermittlung', ja: '捜査・推理', 'pt-BR': 'Investigação' },
  Escalade: { fr: 'Escalade', en: 'Climbing', es: 'Escalada', de: 'Klettern', ja: 'クライミング', 'pt-BR': 'Escalada' },
  Exploration: { fr: 'Exploration', en: 'Exploration', es: 'Exploración', de: 'Erkundung', ja: '探索', 'pt-BR': 'Exploração' },
  Farming: { fr: 'Farming', en: 'Farming Sim', es: 'Granja', de: 'Bauernhof-Simulation', ja: '農業シミュレーション', 'pt-BR': 'Simulador de Fazenda' },
  'Fast-FPS': { fr: 'Fast-FPS', en: 'Fast-FPS', es: 'FPS Rápido', de: 'Fast-FPS', ja: '高速FPS', 'pt-BR': 'FPS Rápido' },
  Folklorique: { fr: 'Folklorique', en: 'Folklore', es: 'Folclore', de: 'Folklore', ja: '民間伝承 / 伝奇', 'pt-BR': 'Folclore' },
  Gestion: { fr: 'Gestion', en: 'Management', es: 'Gestión', de: 'Management', ja: '経営 / 管理', 'pt-BR': 'Gerenciamento' },
  'Hack and Slash': { fr: 'Hack and Slash', en: 'Hack and Slash', es: 'Hack and Slash', de: 'Hack and Slay', ja: 'ハックアンドスラッシュ', 'pt-BR': 'Hack and Slash' },
  Historique: { fr: 'Historique', en: 'Historical', es: 'Histórico', de: 'Historisch', ja: '歴史', 'pt-BR': 'Histórico' },
  Horreur: { fr: 'Horreur', en: 'Horror', es: 'Terror', de: 'Horror', ja: 'ホラー', 'pt-BR': 'Terror' },
  'Idle / Clicker': { fr: 'Idle / Clicker', en: 'Idle / Clicker', es: 'Idle / Clicker', de: 'Idle / Clicker', ja: '放置 / クリッカー', 'pt-BR': 'Idle / Clicker' },
  'Immersive Sim': { fr: 'Immersive Sim', en: 'Immersive Sim', es: 'Simulador Inmersivo', de: 'Immersive Sim', ja: 'イマーシブシム', 'pt-BR': 'Simulador Imersivo' },
  Incrémental: { fr: 'Incrémental', en: 'Incremental', es: 'Incremental', de: 'Inkrementell', ja: 'インクリメンタル', 'pt-BR': 'Incremental' },
  'Massivement multijoueur': { fr: 'Massivement multijoueur', en: 'MMO', es: 'Multijugador masivo', de: 'MMO', ja: 'MMO', 'pt-BR': 'Multijogador Massivo' },
  Metroidvania: { fr: 'Metroidvania', en: 'Metroidvania', es: 'Metroidvania', de: 'Metroidvania', ja: 'メトロイドヴァニア', 'pt-BR': 'Metroidvania' },
  Mystère: { fr: 'Mystère', en: 'Mystery', es: 'Misterio', de: 'Mysterium', ja: 'ミステリー', 'pt-BR': 'Mistério' },
  Mythologie: { fr: 'Mythologie', en: 'Mythology', es: 'Mitología', de: 'Mythologie', ja: '神話', 'pt-BR': 'Mitologia' },
  Méditatif: { fr: 'Méditatif', en: 'Meditative', es: 'Meditativo', de: 'Meditativ', ja: '瞑想的 / リラックス', 'pt-BR': 'Meditativo' },
  Médiéval: { fr: 'Médiéval', en: 'Medieval', es: 'Medieval', de: 'Mittelalterlich', ja: '中世', 'pt-BR': 'Medieval' },
  Narratif: { fr: 'Narratif', en: 'Story Rich', es: 'Narrativo', de: 'Narrativ', ja: 'ストーリー重視', 'pt-BR': 'Rico em História' },
  'Party Game': { fr: 'Party Game', en: 'Party Game', es: 'Juego de fiesta', de: 'Partyspiel', ja: 'パーティーゲーム', 'pt-BR': 'Jogo de Festa' },
  Physique: { fr: 'Physique', en: 'Physics Sandbox', es: 'Física', de: 'Physik-Sandbox', ja: '物理演算 / 物理パズル', 'pt-BR': 'Física' },
  Platformer: { fr: 'Platformer', en: 'Platformer', es: 'Plataformas', de: 'Plattformer', ja: 'プラットフォーマー', 'pt-BR': 'Plataforma' },
  'Point & Click': { fr: 'Point & Click', en: 'Point & Click', es: 'Point & Click', de: 'Point & Click', ja: 'ポイント＆クリック', 'pt-BR': 'Point & Click' },
  Psychologique: { fr: 'Psychologique', en: 'Psychological', es: 'Psicológico', de: 'Psychologisch', ja: 'サイコロジカル', 'pt-BR': 'Psicológico' },
  Puzzle: { fr: 'Puzzle', en: 'Puzzle', es: 'Puzle', de: 'Rätsel', ja: 'パズル', 'pt-BR': 'Quebra-cabeça' },
  Pêche: { fr: 'Pêche', en: 'Fishing', es: 'Pesca', de: 'Angeln', ja: '釣り', 'pt-BR': 'Pesca' },
  RPG: { fr: 'RPG', en: 'RPG', es: 'Rol / RPG', de: 'RPG', ja: 'RPG', 'pt-BR': 'RPG' },
  Roguelike: { fr: 'Roguelike', en: 'Roguelike', es: 'Roguelike', de: 'Roguelike', ja: 'ローグライク', 'pt-BR': 'Roguelike' },
  Roguelite: { fr: 'Roguelite', en: 'Roguelite', es: 'Roguelite', de: 'Roguelite', ja: 'ローグライト', 'pt-BR': 'Roguelite' },
  Rythme: { fr: 'Rythme', en: 'Rhythm', es: 'Ritmo', de: 'Rhythmus', ja: 'リズム', 'pt-BR': 'Ritmo' },
  Rétro: { fr: 'Rétro', en: 'Retro', es: 'Retro', de: 'Retro', ja: 'レトロ', 'pt-BR': 'Retrô' },
  Sandbox: { fr: 'Sandbox', en: 'Sandbox', es: 'Sandbox', de: 'Sandbox', ja: 'サンドボックス', 'pt-BR': 'Sandbox' },
  'Sci-Fi': { fr: 'Sci-Fi', en: 'Sci-Fi', es: 'Ciencia ficción', de: 'Sci-Fi', ja: 'SF', 'pt-BR': 'Ficção Científica' },
  Simulation: { fr: 'Simulation', en: 'Simulation', es: 'Simulación', de: 'Simulation', ja: 'シミュレーション', 'pt-BR': 'Simulação' },
  'Souls-like': { fr: 'Souls-like', en: 'Souls-like', es: 'Souls-like', de: 'Souls-like', ja: 'ソウルライク', 'pt-BR': 'Souls-like' },
  Stratégie: { fr: 'Stratégie', en: 'Strategy', es: 'Estrategia', de: 'Strategie', ja: '戦略', 'pt-BR': 'Estratégia' },
  Survie: { fr: 'Survie', en: 'Survival', es: 'Supervivencia', de: 'Überleben', ja: 'サバイバル', 'pt-BR': 'Sobrevivência' },
  Tactique: { fr: 'Tactique', en: 'Tactical', es: 'Táctico', de: 'Taktik', ja: '戦術', 'pt-BR': 'Tático' },
  'Tour par tour': { fr: 'Tour par tour', en: 'Turn-Based', es: 'Por turnos', de: 'Rundenbasiert', ja: 'ターン制', 'pt-BR': 'Em Turnos' },
  'Twin-stick': { fr: 'Twin-stick', en: 'Twin-stick Shooter', es: 'Twin-stick', de: 'Twin-Stick', ja: 'ツインスティック', 'pt-BR': 'Twin-stick' },
  'Visual Novel': { fr: 'Visual Novel', en: 'Visual Novel', es: 'Novela Visual', de: 'Visual Novel', ja: 'ビジュアルノベル', 'pt-BR': 'Visual Novel' },
  Western: { fr: 'Western', en: 'Western', es: 'Wéstern', de: 'Western', ja: '西部劇', 'pt-BR': 'Faroeste' },
};

export function getTranslatedGenre(genre: string, lang?: string): string {
  const target = getAppLanguage(lang);
  const found = GENRE_TRANSLATIONS[genre];
  if (found && found[target]) return found[target];
  return genre;
}

/**
 * Dictionnaire multilingue des 6 styles artistiques
 */
export const ART_STYLE_TRANSLATIONS: Record<string, Record<AppLanguage, string>> = {
  'Pixel Art': { fr: 'Pixel Art', en: 'Pixel Art', es: 'Pixel Art', de: 'Pixel-Art', ja: 'ドット絵 / ピクセルアート', 'pt-BR': 'Pixel Art' },
  '2D Hand-drawn': { fr: '2D Dessiné à la main', en: '2D Hand-drawn', es: '2D Dibujado a mano', de: '2D Handgezeichnet', ja: '2D 手描き', 'pt-BR': '2D Desenhado à Mão' },
  'Stylized 3D': { fr: '3D Stylisé', en: 'Stylized 3D', es: '3D Estilizado', de: 'Stilisierte 3D', ja: 'スタイライズド 3D', 'pt-BR': '3D Estilizado' },
  'Retro Low-poly 3D': { fr: '3D Rétro Low-poly', en: 'Retro Low-poly 3D', es: '3D Retro Low-poly', de: 'Retro Low-Poly 3D', ja: 'レトロ ローポリ 3D', 'pt-BR': '3D Retrô Low-poly' },
  'Realistic 3D': { fr: '3D Réaliste', en: 'Realistic 3D', es: '3D Realista', de: 'Realistische 3D', ja: 'リアル 3D', 'pt-BR': '3D Realista' },
  Monochrome: { fr: 'Monochrome', en: 'Monochrome', es: 'Monocromo', de: 'Monochrom', ja: 'モノクロ', 'pt-BR': 'Monocromático' },
};

export function getTranslatedArtStyle(style: string | LocalizedText, lang?: string): string {
  const target = getAppLanguage(lang);
  if (typeof style === 'object' && style !== null) {
    if (style[target]) return style[target] as string;
    const base = style.en || style.fr || '';
    return ART_STYLE_TRANSLATIONS[base]?.[target] || base;
  }
  return ART_STYLE_TRANSLATIONS[style]?.[target] || style;
}

/**
 * Dictionnaire multilingue des 5 perspectives de caméra
 */
export const CAMERA_TRANSLATIONS: Record<string, Record<AppLanguage, string>> = {
  '2D Side-scroller': { fr: 'Vue de côté 2D', en: '2D Side-scroller', es: '2D Desplazamiento lateral', de: '2D Side-Scroller', ja: '2D 横スクロール', 'pt-BR': '2D Rolagem Lateral' },
  '2D Top-down': { fr: 'Vue de dessus 2D', en: '2D Top-down', es: '2D Vista cenital', de: '2D Vogelperspektive', ja: '2D 見下ろし視点', 'pt-BR': '2D Visão Superior' },
  'Isometric / 2.5D': { fr: 'Isométrique / 2.5D', en: 'Isometric / 2.5D', es: 'Isométrica / 2.5D', de: 'Isometrisch / 2.5D', ja: 'アイソメトリック / 2.5D', 'pt-BR': 'Isométrica / 2.5D' },
  'First-Person': { fr: 'Première personne (FPS)', en: 'First-Person', es: 'Primera persona (FPS)', de: 'Egoperspektive (First-Person)', ja: '一人称視点 (FPS)', 'pt-BR': 'Primeira Pessoa (FPS)' },
  'Third-Person': { fr: 'Troisième personne 3D', en: 'Third-Person', es: 'Tercera persona', de: 'Dritte Person (Third-Person)', ja: '三人称視点 (TPS)', 'pt-BR': 'Terceira Pessoa' },
};

export function getTranslatedCamera(camera: string | LocalizedText, lang?: string): string {
  const target = getAppLanguage(lang);
  if (typeof camera === 'object' && camera !== null) {
    if (camera[target]) return camera[target] as string;
    const base = camera.en || camera.fr || '';
    return CAMERA_TRANSLATIONS[base]?.[target] || base;
  }
  return CAMERA_TRANSLATIONS[camera]?.[target] || camera;
}

/**
 * Dictionnaire multilingue des intitulés d'indices (Pixel, BlindTest, Review)
 */
export const CLUE_LABEL_TRANSLATIONS: Record<string, Record<AppLanguage, string>> = {
  'Perspective & Époque': {
    fr: 'Perspective & Époque',
    en: 'Perspective & Era',
    es: 'Perspectiva y Época',
    de: 'Perspektive & Ära',
    ja: '視点と時代',
    'pt-BR': 'Perspectiva e Época',
  },
  Genres: {
    fr: 'Genres',
    en: 'Genres',
    es: 'Géneros',
    de: 'Genres',
    ja: 'ジャンル',
    'pt-BR': 'Gêneros',
  },
  'Genres & Perspective': {
    fr: 'Genres & Perspective',
    en: 'Genres & Camera',
    es: 'Géneros y Perspectiva',
    de: 'Genres & Perspektive',
    ja: 'ジャンルと視点',
    'pt-BR': 'Gêneros e Perspectiva',
  },
  'Genres & Caméra': {
    fr: 'Genres & Caméra',
    en: 'Genres & Camera',
    es: 'Géneros y Cámara',
    de: 'Genres & Kamera',
    ja: 'ジャンルとカメラ',
    'pt-BR': 'Gêneros e Câmera',
  },
  'Année & Style Visuel': {
    fr: 'Année & Style Visuel',
    en: 'Year & Art Style',
    es: 'Año y Estilo Visual',
    de: 'Jahr & Grafikstil',
    ja: '発売年とビジュアル',
    'pt-BR': 'Ano e Estilo Visual',
  },
  'Année & Style Artistique': {
    fr: 'Année & Style Artistique',
    en: 'Year & Art Style',
    es: 'Año y Estilo Artístico',
    de: 'Jahr & Grafikstil',
    ja: '発売年とアートスタイル',
    'pt-BR': 'Ano e Estilo Artístico',
  },
  'Année & Style Graphique': {
    fr: 'Année & Style Graphique',
    en: 'Year & Art Style',
    es: 'Año y Estilo Gráfico',
    de: 'Jahr & Grafikstil',
    ja: '発売年とグラフィック',
    'pt-BR': 'Ano e Estilo Gráfico',
  },
  'Période de Sortie': {
    fr: 'Période de Sortie',
    en: 'Release Window',
    es: 'Período de Lanzamiento',
    de: 'Erscheinungszeitraum',
    ja: 'リリース時期',
    'pt-BR': 'Período de Lançamento',
  },
  'Studio Développeur': {
    fr: 'Studio Développeur',
    en: 'Developer Studio',
    es: 'Estudio Desarrollador',
    de: 'Entwicklerstudio',
    ja: '開発スタジオ',
    'pt-BR': 'Estúdio Desenvolvedor',
  },
  'Compositeur & Période': {
    fr: 'Compositeur & Période',
    en: 'Composer & Era',
    es: 'Compositor y Época',
    de: 'Komponist & Ära',
    ja: '作曲者と時代',
    'pt-BR': 'Compositor e Época',
  },
  "Phrase d'accroche": {
    fr: "Phrase d'accroche",
    en: 'Tagline',
    es: 'Lema / Frase destacada',
    de: 'Slogan / Teaser',
    ja: 'キャッチコピー',
    'pt-BR': 'Frase de Destaque',
  },
};

export function getClueLabel(labelFr: string, lang?: string): string {
  const target = getAppLanguage(lang);
  return CLUE_LABEL_TRANSLATIONS[labelFr]?.[target] || labelFr;
}

export function getClueValue(
  clue: { valueFr?: string; valueEn?: string; valueLocalized?: LocalizedText },
  lang?: string
): string {
  const target = getAppLanguage(lang);
  if (clue.valueLocalized) {
    const val = getLocalizedText(clue.valueLocalized, target);
    if (val) return val;
  }
  if (target === 'fr') return clue.valueFr || '';
  return clue.valueEn || clue.valueFr || '';
}

/**
 * Sélectionne la chaîne appropriée pour les contenus bilingues FR/EN ou objets LocalizedText
 * (FR si langue cible fr, sinon EN avec repli sur FR)
 */
export function getBilingualText(
  textOrFr?: LocalizedText | string | null,
  textEnOrLang?: string,
  lang?: string
): string {
  if (textOrFr && typeof textOrFr === 'object') {
    const targetLang = lang || textEnOrLang;
    return getLocalizedText(textOrFr as LocalizedText, targetLang);
  }
  const target = getAppLanguage(lang);
  if (target === 'fr') return (textOrFr as string) || (textEnOrLang as string) || '';
  return (textEnOrLang as string) || (textOrFr as string) || '';
}

/**
 * Sélectionne le tableau approprié pour les contenus bilingues FR/EN
 * (FR si langue cible fr, sinon EN avec repli sur FR)
 */
export function getBilingualArray<T>(arrFr: T[], arrEn: T[], lang?: string): T[] {
  const target = getAppLanguage(lang);
  if (target === 'fr') return arrFr.length > 0 ? arrFr : arrEn;
  return arrEn.length > 0 ? arrEn : arrFr;
}



