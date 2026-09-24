/**
 * 🦉 Hoot Indie Games — Moteur d'Inférence Canonique des Métadonnées de Jeu
 * Analyse le texte brut (sans HTML ni hashes d'URL) et les genres pour déduire
 * avec précision l'artStyle, la caméra et les genres enrichis (Règle 0 Hallucination).
 */

export function cleanTextForAnalysis(htmlOrText: string): string {
  if (!htmlOrText) return '';
  return htmlOrText
    // Supprimer les URLs complètes pour éviter que les hashes hexadécimaux (ex: ...3de...) soient confondus avec "3d"
    .replace(/https?:\/\/[^\s"'>]+/gi, ' ')
    // Supprimer toutes les balises HTML
    .replace(/<[^>]+>/g, ' ')
    // Décoder les entités HTML courantes
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Espaces multiples
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Inférence intelligente du Art Style canonique
 */
export function inferCanonicalArtStyle(
  rawText: string,
  genres: string[] = []
): { fr: string; en: string } {
  const clean = cleanTextForAnalysis(rawText);
  const lower = (clean + ' ' + genres.join(' ')).toLowerCase();

  // 1. Détection 3D Rétro / Low-poly
  if (
    /\blow[\s-]poly\b/.test(lower) ||
    /\b(ps1|psx|polygonal|retro 3d|chunky 3d)\b/.test(lower)
  ) {
    return { fr: '3D Rétro Low-poly', en: 'Retro Low-poly 3D' };
  }

  // 2. Détection 3D Réaliste
  if (
    /\brealistic\b/.test(lower) ||
    /\b(photorealist|photorealistic|réaliste|unreal engine 5|ue5)\b/.test(lower)
  ) {
    return { fr: '3D Réaliste', en: 'Realistic 3D' };
  }

  // 3. Détection Monochrome / Minimaliste
  if (
    /\b(monochrome|black and white|noir et blanc|minimalist)\b/.test(lower)
  ) {
    return { fr: 'Monochrome / Minimaliste', en: 'Monochrome' };
  }

  // 4. Détection formelle 2D explicite
  const hasExplicit2D =
    /\b2d\b/.test(lower) ||
    lower.includes('side-scroller') ||
    lower.includes('sidescroller') ||
    lower.includes('platformer') ||
    lower.includes('metroidvania') ||
    lower.includes('pixel') ||
    lower.includes('sprites');

  // 5. Détection Pixel Art
  if (
    /\bpixel(\s*art|ated)?\b/.test(lower) ||
    /\b(16-bit|8-bit|retro 2d|pixel art|pixel-art|sprites)\b/.test(lower)
  ) {
    return { fr: 'Pixel Art', en: 'Pixel Art' };
  }

  // 6. Détection 2D Dessiné à la main
  if (
    /\b(hand-drawn|hand drawn|dessiné à la main|dessiné|watercolor|cartoon|anime|sketch|peint|illustration)\b/.test(
      lower
    )
  ) {
    if (!hasExplicit2D && /\b(3d|third-person|first-person)\b/.test(lower)) {
      return { fr: '3D Stylisée', en: 'Stylized 3D' };
    }
    return { fr: '2D Dessiné à la main', en: '2D Hand-drawn' };
  }

  // 7. Détection Contexte 3D réel (avec délimiteurs de mots \b3d\b ou indices contextuels 3D)
  const has3DContext =
    /\b3d\b/.test(lower) ||
    /\b(third-person|third person|first-person|first person|open world|monde ouvert|action-adventure|stealth|infiltration|assassin|pirate|naval|realistic|moteur 3d|unreal|cryengine|frostbite|driving|course 3d|fps)\b/.test(lower) ||
    genres.some((g) => ['3D', 'Action 3D', 'Aventure 3D', 'FPS', 'Course', 'Simulation'].includes(g));

  if (has3DContext && !hasExplicit2D) {
    if (/\b(realistic|photorealist|photorealistic|réaliste|cinematic|cinématique|aaa|blockbuster)\b/.test(lower)) {
      return { fr: '3D Réaliste', en: 'Realistic 3D' };
    }
    return { fr: '3D Stylisée', en: 'Stylized 3D' };
  }

  // Si 2D explicite mais pas pixel-art ou dessiné spécifique
  if (hasExplicit2D) {
    return { fr: '2D Dessiné à la main', en: '2D Hand-drawn' };
  }

  // Si le contexte n'a aucune mention de pixel art ni 2D, mais des genres d'action/aventure
  if (genres.some((g) => ['Action', 'Aventure', 'RPG', 'Stratégie'].includes(g))) {
    return { fr: '3D Stylisée', en: 'Stylized 3D' };
  }

  // Défaut : 2D Dessiné à la main ou 3D Stylisée
  return { fr: '3D Stylisée', en: 'Stylized 3D' };
}

/**
 * Inférence intelligente de la Caméra canonique
 */
export function inferCanonicalCamera(
  rawText: string,
  genres: string[] = []
): { fr: string; en: string } {
  const clean = cleanTextForAnalysis(rawText);
  const lower = (clean + ' ' + genres.join(' ')).toLowerCase();

  // 1. Première personne
  if (
    /\b(first-person|first person|première personne|fps|fpv|vue subjective)\b/.test(
      lower
    ) ||
    genres.includes('FPS')
  ) {
    return { fr: 'Première personne', en: 'First-Person' };
  }

  // 2. Isométrique / 2.5D
  if (
    /\b(isometric|isométrique|2\.5d|diablo-like|quarter view)\b/.test(lower)
  ) {
    return { fr: 'Isométrique / 2.5D', en: 'Isometric / 2.5D' };
  }

  // 3. Vue du dessus 2D
  if (
    /\b(top-down|topdown|vue du dessus|vue de dessus|twin-stick|vertical shooter)\b/.test(
      lower
    )
  ) {
    return { fr: 'Vue du dessus 2D', en: '2D Top-down' };
  }

  // 4. Vue de côté 2D (Platformers, Metroidvanias, etc.)
  if (
    /\b(side-scroller|sidescroller|platformer|plateforme|metroidvania|vue de côté|défilement horizontal)\b/.test(
      lower
    )
  ) {
    return { fr: 'Vue de côté 2D', en: '2D Side-scroller' };
  }

  // 5. Troisième personne
  if (
    /\b(third-person|third person|troisième personne|tps|over-the-shoulder|3d platformer|open world|monde ouvert|action-adventure|stealth|infiltration|assassin|pirate|naval)\b/.test(
      lower
    ) ||
    /\b3d\b/.test(lower) ||
    genres.some((g) => ['Action', 'Aventure', 'RPG'].includes(g))
  ) {
    return { fr: 'Troisième personne', en: 'Third-Person' };
  }

  if (/\b2d\b/.test(lower)) {
    return { fr: 'Vue de côté 2D', en: '2D Side-scroller' };
  }

  return { fr: 'Troisième personne', en: 'Third-Person' };
}

export interface NonIndieCheckResult {
  isLikelyNonIndie: boolean;
  reason?: string;
  majorEntity?: string;
}

/**
 * 🛡️ Détection souveraine des jeux majeurs / AAA / non-indépendants
 * Avertit les administrateurs si une suggestion concerne un mastodonte de l'industrie.
 */
export function detectNonIndieStatus(input: {
  title?: string;
  developer?: string;
  publisher?: string;
  comment?: string;
  genres?: string[];
}): NonIndieCheckResult {
  const text = `${input.title || ''} ${input.developer || ''} ${input.publisher || ''} ${input.comment || ''}`.toLowerCase();

  // 1. Grands éditeurs et conglomérats AAA
  const MAJOR_PUBLISHERS = [
    { name: 'Ubisoft', regex: /\bubisoft\b/i },
    { name: 'Electronic Arts (EA)', regex: /\b(electronic arts|ea games|ea sports|\bea\b)\b/i },
    { name: 'Activision / Blizzard', regex: /\b(activision|blizzard|king|treyarch|infinity ward)\b/i },
    { name: 'Sony / PlayStation Studios', regex: /\b(sony interactive|playstation studios|naughty dog|insomniac games|santa monica studio|guerrilla games|sucker punch)\b/i },
    { name: 'Microsoft / Xbox Game Studios', regex: /\b(xbox game studios|microsoft studios|bethesda|zenimax|343 industries|turn 10|playground games|the coalition)\b/i },
    { name: 'Take-Two / 2K / Rockstar', regex: /\b(take-two|take two|rockstar games|2k games|2k sports|hangar 13|firaxis)\b/i },
    { name: 'Square Enix', regex: /\bsquare enix\b/i },
    { name: 'Capcom', regex: /\bcapcom\b/i },
    { name: 'Bandai Namco', regex: /\bbandai namco\b/i },
    { name: 'Warner Bros. Games', regex: /\b(warner bros|wb games|netherrealm|rocksteady)\b/i },
    { name: 'Konami', regex: /\bkonami\b/i },
    { name: 'Sega', regex: /\b(sega|atlus|creative assembly)\b/i },
    { name: 'Valve', regex: /\bvalve\b/i },
    { name: 'CD Projekt', regex: /\bcd projekt\b/i },
    { name: 'Riot Games', regex: /\briot games\b/i },
    { name: 'Epic Games', regex: /\bepic games\b/i },
    { name: 'Nintendo', regex: /\bnintendo\b/i },
    { name: 'Tencent', regex: /\btencent\b/i },
    { name: 'NetEase', regex: /\bnetease\b/i },
    { name: 'Krafton', regex: /\bkrafton\b/i },
  ];

  for (const pub of MAJOR_PUBLISHERS) {
    if (pub.regex.test(text)) {
      return {
        isLikelyNonIndie: true,
        reason: `Éditeur / Studio majeur identifié (${pub.name})`,
        majorEntity: pub.name,
      };
    }
  }

  // 2. Franchises et licences AAA mondiales
  const MAJOR_FRANCHISES = [
    { franchise: "Assassin's Creed", regex: /\bassassin'?s\s*creed\b/i },
    { franchise: 'Far Cry', regex: /\bfar\s*cry\b/i },
    { franchise: 'Watch Dogs', regex: /\bwatch\s*dogs\b/i },
    { franchise: 'Tom Clancy', regex: /\btom\s*clancy\b/i },
    { franchise: 'Call of Duty', regex: /\bcall\s*of\s*duty|\bcod\b/i },
    { franchise: 'Battlefield', regex: /\bbattlefield\b/i },
    { franchise: 'FIFA / EA Sports FC', regex: /\b(fifa|ea sports fc)\b/i },
    { franchise: 'Grand Theft Auto (GTA)', regex: /\b(grand\s*theft\s*auto|\bgta\b)\b/i },
    { franchise: 'Red Dead Redemption', regex: /\bred\s*dead\b/i },
    { franchise: 'The Elder Scrolls / Skyrim', regex: /\b(elder\s*scrolls|skyrim|oblivion|morrowind)\b/i },
    { franchise: 'Fallout', regex: /\bfallout\b/i },
    { franchise: 'Final Fantasy', regex: /\bfinal\s*fantasy\b/i },
    { franchise: 'Resident Evil', regex: /\bresident\s*evil\b/i },
    { franchise: 'Monster Hunter', regex: /\bmonster\s*hunter\b/i },
    { franchise: 'Street Fighter', regex: /\bstreet\s*fighter\b/i },
    { franchise: 'Tekken', regex: /\btekken\b/i },
    { franchise: 'Halo', regex: /\bhalo\b/i },
    { franchise: 'Forza', regex: /\bforza\b/i },
    { franchise: 'God of War', regex: /\bgod\s*of\s*war\b/i },
    { franchise: 'Uncharted', regex: /\buncharted\b/i },
    { franchise: 'The Last of Us', regex: /\bthe\s*last\s*of\s*us\b/i },
    { franchise: 'Cyberpunk 2077', regex: /\bcyberpunk\s*2077\b/i },
    { franchise: 'The Witcher', regex: /\bthe\s*witcher\b/i },
    { franchise: 'Borderlands', regex: /\bborderlands\b/i },
    { franchise: 'BioShock', regex: /\bbioshock\b/i },
    { franchise: 'Diablo', regex: /\bdiablo\b/i },
    { franchise: 'World of Warcraft', regex: /\bworld\s*of\s*warcraft\b/i },
    { franchise: 'Star Wars AAA', regex: /\bstar\s*wars\b/i },
    { franchise: 'Hogwarts Legacy', regex: /\bhogwarts\s*legacy\b/i },
  ];

  for (const fr of MAJOR_FRANCHISES) {
    if (fr.regex.test(text)) {
      return {
        isLikelyNonIndie: true,
        reason: `Franchise AAA majeure reconnue (${fr.franchise})`,
        majorEntity: fr.franchise,
      };
    }
  }

  return { isLikelyNonIndie: false };
}

/**
 * Détection et enrichissement des genres canoniques
 */
export function inferEnrichedGenres(
  steamGenres: string[] = [],
  rawText: string = ''
): string[] {
  const clean = cleanTextForAnalysis(rawText);
  const lower = (clean + ' ' + steamGenres.join(' ')).toLowerCase();
  const set = new Set<string>();

  // Conserver les genres Steam de base valides
  const genreMapping: Record<string, string> = {
    action: 'Action',
    aventure: 'Aventure',
    adventure: 'Aventure',
    rpg: 'RPG',
    stratégie: 'Stratégie',
    strategy: 'Stratégie',
    simulation: 'Simulation',
    course: 'Course',
    racing: 'Course',
    sport: 'Sport',
    sports: 'Sport',
    'point & click': 'Point & Click',
    'point-and-click': 'Point & Click',
    'city builder': 'City Builder',
    'colony sim': 'Colony Sim',
    'visual novel': 'Visual Novel',
    'party game': 'Party Game',
    'immersive sim': 'Immersive Sim',
    automation: 'Automatisation',
    automatisation: 'Automatisation',
    idle: 'Idle / Clicker',
    clicker: 'Idle / Clicker',
    incremental: 'Incrémental',
    incrémental: 'Incrémental',
    physics: 'Physique',
    physique: 'Physique',
    'auto shooter': 'Auto-Shooter',
    'auto-shooter': 'Auto-Shooter',
    'social deduction': 'Déduction Sociale',
    'déduction sociale': 'Déduction Sociale',
  };

  for (const g of steamGenres) {
    const norm = g.trim().toLowerCase();
    if (genreMapping[norm]) {
      set.add(genreMapping[norm]);
    } else if (
      !['indépendant', 'accès anticipé', 'indie', 'early access'].includes(norm)
    ) {
      set.add(g.trim());
    }
  }

  // Enrichissement sémantique basé sur le pitch / texte
  if (/\b(platformer|plateforme|precision platformer)\b/.test(lower)) {
    set.add('Platformer');
  }
  if (/\b(metroidvania)\b/.test(lower)) {
    set.add('Metroidvania');
  }
  if (/\b(roguelike|roguelite|rogue-like|rogue-lite)\b/.test(lower)) {
    set.add('Roguelike');
  }
  if (/\b(deckbuilder|deck-builder|card battler)\b/.test(lower)) {
    set.add('Deckbuilder');
  }
  if (/\b(puzzle|énigme|casse-tête)\b/.test(lower)) {
    set.add('Puzzle');
  }
  if (/\b(survie|survival)\b/.test(lower)) {
    set.add('Survie');
  }
  if (/\b(horreur|horror)\b/.test(lower)) {
    set.add('Horreur');
  }
  if (/\b(bullet hell|danmaku|shmup|shoot.*em up)\b/.test(lower)) {
    set.add('Bullet Hell');
  }
  if (/\b(auto-shooter|survivors-like|survivor-like|horde survival|reverse bullet hell)\b/.test(lower)) {
    set.add('Auto-Shooter');
  }
  if (/\b(automation|automatisation|factory|usine)\b/.test(lower)) {
    set.add('Automatisation');
  }
  if (/\b(city builder|city-builder|bâtisseur de ville)\b/.test(lower)) {
    set.add('City Builder');
  }
  if (/\b(colony sim|colony-sim|gestion de colonie)\b/.test(lower)) {
    set.add('Colony Sim');
  }
  if (/\b(social deduction|déduction sociale|impostor|traitor)\b/.test(lower)) {
    set.add('Déduction Sociale');
  }
  if (/\b(idle|clicker|cliqueur)\b/.test(lower)) {
    set.add('Idle / Clicker');
  }
  if (/\b(incremental|incrémental)\b/.test(lower)) {
    set.add('Incrémental');
  }
  if (/\b(immersive sim|simulateur immersif)\b/.test(lower)) {
    set.add('Immersive Sim');
  }
  if (/\b(party game|party-game|jeu de société)\b/.test(lower)) {
    set.add('Party Game');
  }
  if (/\b(physics|physique|physics-based|ragdoll)\b/.test(lower)) {
    set.add('Physique');
  }
  if (/\b(point & click|point and click|point-and-click)\b/.test(lower)) {
    set.add('Point & Click');
  }
  if (/\b(visual novel|roman visuel)\b/.test(lower)) {
    set.add('Visual Novel');
  }
  if (/\b(narratif|narrative|story-rich)\b/.test(lower)) {
    set.add('Narratif');
  }
  if (/\b(souls-like|soulslike)\b/.test(lower)) {
    set.add('Souls-like');
  }

  const result = Array.from(set);
  return result.length > 0 ? result.slice(0, 4) : ['Action', 'Aventure'];
}
