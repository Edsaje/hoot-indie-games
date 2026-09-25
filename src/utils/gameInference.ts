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
 * 6 styles canoniques stricts :
 * - Pixel Art
 * - 2D Dessiné à la main (Hand-drawn)
 * - 3D Stylisée (Stylized 3D)
 * - 3D Rétro Low-poly (Retro Low-poly 3D)
 * - 3D Réaliste (Realistic 3D)
 * - Monochrome / Minimaliste (Monochrome)
 */
export function inferCanonicalArtStyle(
  rawText: string,
  genres: string[] = []
): { fr: string; en: string } {
  const clean = cleanTextForAnalysis(rawText);
  const lower = (clean + ' ' + genres.join(' ')).toLowerCase();

  // 1. Détection 3D Rétro / Low-poly (PS1, N64, boomer shooters rétro 3D, dithered)
  if (
    /\blow[\s-]poly\b/.test(lower) ||
    /\b(ps1|psx|psone|n64|retro 3d|3d rétro|polygonal 3d|chunky 3d|low-poly 3d|dithered|software renderer|boomer shooter|crunchy polygons|crt filter)\b/.test(lower)
  ) {
    return { fr: '3D Rétro Low-poly', en: 'Retro Low-poly 3D' };
  }

  // 2. Détection Monochrome / Minimaliste (1-bit, noir et blanc)
  if (
    /\b(monochrome|black and white|noir et blanc|1-bit|1 bit|monochromatic|minimalist art|noir & blanc)\b/.test(lower)
  ) {
    return { fr: 'Monochrome / Minimaliste', en: 'Monochrome' };
  }

  // 3. Détection 3D Réaliste (UE5, photoréaliste, ray tracing)
  if (
    /\b(photorealist|photorealistic|ultra-realistic|réaliste|unreal engine 5|ue5|ray tracing|photogrammétrie)\b/.test(lower) &&
    /\b(3d|first-person|fps|third-person|simulation|simulation réaliste)\b/.test(lower)
  ) {
    return { fr: '3D Réaliste', en: 'Realistic 3D' };
  }

  // 4. Détection Pixel Art (priorité sur la 2D si explicite)
  if (
    /\bpixel(\s*art|ated)?\b/.test(lower) ||
    /\b(16-bit|8-bit|retro 2d|pixel art|pixel-art|sprites 2d|bit graphics|pixel-based|pixels)\b/.test(lower)
  ) {
    return { fr: 'Pixel Art', en: 'Pixel Art' };
  }

  // 5. Détection 2D Dessiné à la main (vectoriel, flash, aquarelle, cartoon, anime, illustration)
  if (
    /\b(hand-drawn|hand drawn|dessiné à la main|dessiné main|dessiné|watercolor|aquarelle|cartoon|anime|manga|sketch|crayonné|peint|illustration|bande dessinée|comic|vector|vectoriel|flash|cutout|traditionally animated|paper art|2d animation)\b/.test(
      lower
    ) ||
    /\b(deckbuilder|card battler|visual novel|point & click|cartes)\b/.test(lower) && !/\b3d\b/.test(lower)
  ) {
    // Si explicitement 3D (ex: cel-shading sur modèles 3D), basculer vers 3D Stylisée
    if (/\b(3d|third-person|first-person|vr|ragdoll 3d|modèles 3d)\b/.test(lower) && !/\b(2d|sprites)\b/.test(lower)) {
      return { fr: '3D Stylisée', en: 'Stylized 3D' };
    }
    return { fr: '2D Dessiné à la main', en: '2D Hand-drawn' };
  }

  // 6. Détection 3D Stylisée (cel-shading, ragdoll 3D, voxel, low-poly stylisé, VR)
  if (
    /\b(stylized 3d|3d stylisée|cel-shaded|cel shading|toon|claymation|voxel|ragdoll 3d|stick figures 3d|low-poly stylized|colorful 3d|physics-based 3d)\b/.test(lower) ||
    /\b(vr|virtual reality|réalité virtuelle|beat saber|first-person|troisième personne)\b/.test(lower) ||
    genres.some((g) => ['Fast-FPS', 'Fast FPS', 'Rythme', 'Physique'].includes(g))
  ) {
    return { fr: '3D Stylisée', en: 'Stylized 3D' };
  }

  // 7. Détection contexte 2D vs 3D
  const has2D = /\b(2d|side-scroller|sidescroller|top-down|topdown|sprites|metroidvania|plateforme 2d|platformer 2d)\b/.test(lower);
  const has3D = /\b(3d|fps|tps|first-person|third-person|vr|open world 3d)\b/.test(lower);

  if (has2D && !has3D) {
    return { fr: '2D Dessiné à la main', en: '2D Hand-drawn' };
  }

  if (has3D) {
    return { fr: '3D Stylisée', en: 'Stylized 3D' };
  }

  return { fr: '3D Stylisée', en: 'Stylized 3D' };
}

/**
 * Inférence intelligente de la Caméra canonique
 * 5 perspectives canoniques strictes :
 * - 2D Side-scroller (Vue de côté 2D)
 * - 2D Top-down (Vue du dessus 2D)
 * - Isometric / 2.5D (Isométrique / 2.5D)
 * - First-Person (Première personne)
 * - Third-Person (Troisième personne)
 */
export function inferCanonicalCamera(
  rawText: string,
  genres: string[] = []
): { fr: string; en: string } {
  const clean = cleanTextForAnalysis(rawText);
  const lower = (clean + ' ' + genres.join(' ')).toLowerCase();

  // 1. Première personne (FPS, VR, vue cockpit, horreur subjective, boomer shooters)
  const isVR = /\b(vr|virtual reality|réalité virtuelle|htc vive|oculus|meta quest|valve index)\b/.test(lower);
  const isFirstPerson =
    /\b(first-person|first person|première personne|fps|fpv|vue subjective|through the eyes|cockpit|behind the wheel|movement shooter|boomer shooter|fast-fps|fast fps|immersive sim)\b/.test(lower) ||
    genres.includes('FPS') ||
    genres.includes('Fast-FPS') ||
    genres.includes('Immersive Sim');

  if (isVR || isFirstPerson) {
    return { fr: 'Première personne', en: 'First-Person' };
  }

  // 2. Isométrique / 2.5D (Hades, Bastion, Project Zomboid, Diablo-like, Disco Elysium)
  if (
    /\b(isometric|isométrique|2\.5d|quarter view|vue isométrique|perspective isométrique|diablo-like|arpg isométrique|tactical isométrique)\b/.test(lower)
  ) {
    return { fr: 'Isométrique / 2.5D', en: 'Isometric / 2.5D' };
  }

  // 3. Vue du dessus 2D (Top-down, twin-stick, bullet heaven, roguelites vue aérienne, Stardew/Graveyard-like)
  if (
    /\b(top-down|topdown|top down|vue du dessus|vue de dessus|vue plongeante|overhead view|bird's-eye view|vue aérienne)\b/.test(lower) ||
    /\b(twin-stick|twin stick|dual-stick|vertical shooter|bullet heaven|reverse bullet hell|survivors-like|survivor-like)\b/.test(lower) ||
    genres.includes('Twin-stick') ||
    genres.includes('Auto-Shooter') ||
    /\b(graveyard keeper|vampire survivors|brotato|hotline miami|binding of isaac|enter the gungeon|undertale|baba is you)\b/.test(lower)
  ) {
    return { fr: 'Vue du dessus 2D', en: '2D Top-down' };
  }

  // 4. Vue de côté 2D (Platformers 2D, Metroidvanias, side-scrollers défilement horizontal)
  const is3DPlatformer = /\b(3d platformer|plateforme 3d|3d platform|collectathon 3d)\b/.test(lower);
  if (
    !is3DPlatformer &&
    (/\b(side-scroller|sidescroller|side-scrolling|défilement horizontal|vue de côté|vue latérale)\b/.test(lower) ||
     /\b(platformer|plateforme|metroidvania|precision platformer|runner|auto-runner)\b/.test(lower) ||
     genres.includes('Platformer') ||
     genres.includes('Metroidvania'))
  ) {
    return { fr: 'Vue de côté 2D', en: '2D Side-scroller' };
  }

  // 5. Troisième personne (3D Action-Adventure, 3D Platformers, Souls-like 3D, TPS)
  if (
    /\b(third-person|third person|troisième personne|tps|over-the-shoulder|behind-the-back)\b/.test(lower) ||
    is3DPlatformer ||
    /\b(3d action|open world 3d|monde ouvert 3d|souls-like 3d|hack and slash 3d)\b/.test(lower)
  ) {
    return { fr: 'Troisième personne', en: 'Third-Person' };
  }

  // 6. Analyse contextuelle robuste
  if (/\b(2d|sprites|pixel art|pixel)\b/.test(lower)) {
    // Si c'est un jeu de gestion, puzzle sur grille, ou rogue-lite 2D non-platformer
    if (/\b(gestion|puzzle|farming|management|simulation|carte|table)\b/.test(lower)) {
      return { fr: 'Vue du dessus 2D', en: '2D Top-down' };
    }
    return { fr: 'Vue de côté 2D', en: '2D Side-scroller' };
  }

  if (/\b(3d)\b/.test(lower)) {
    if (/\b(shooter|gun|turret|tir|cockpit|horror|peur)\b/.test(lower)) {
      return { fr: 'Première personne', en: 'First-Person' };
    }
    return { fr: 'Troisième personne', en: 'Third-Person' };
  }

  // Défaut équilibré
  return { fr: 'Vue de côté 2D', en: '2D Side-scroller' };
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
  if (/\b(rhythm|rythme|musical|music-based|beat|saber|en rythme|morceaux)\b/.test(lower)) {
    set.add('Rythme');
  }
  if (/\b(cozy|cosy|wholesome|relaxing|détente|apaisant|chaleureux|douillet)\b/.test(lower)) {
    set.add('Cozy');
  }
  if (/\b(méditatif|meditative|zen|contemplatif|peaceful|calme|sérénité)\b/.test(lower)) {
    set.add('Méditatif');
  }
  if (/\b(dark fantasy|dark-fantasy|grimdark|gothique|fantaisie sombre)\b/.test(lower)) {
    set.add('Dark Fantasy');
  }
  if (/\b(artisanat|crafting|craft|fabriquer|forge|artisan|bâtir)\b/.test(lower)) {
    set.add('Artisanat');
  }
  if (/\b(farming|agriculture|ferme|récolte|cultiver|plantation)\b/.test(lower)) {
    set.add('Farming');
  }
  if (/\b(fast-fps|fast fps|boomer shooter|movement shooter|retro fps|speed shooter)\b/.test(lower)) {
    set.add('Fast-FPS');
  }
  if (/\b(beat 'em up|beat them up|beat them all|brawler|bagarreur|beat-them-all)\b/.test(lower)) {
    set.add('Beat them all');
  }
  if (/\b(comedy|comédie|funny|humor|humour|hilarious|comique|délirant|absurde)\b/.test(lower)) {
    set.add('Comédie');
  }
  if (/\b(psychological|psychologique|angoisse mentale|folie|démence)\b/.test(lower)) {
    set.add('Psychologique');
  }
  if (/\b(investigation|enquête|detective|détective|élucider|indices|mystère policier)\b/.test(lower)) {
    set.add('Enquête');
  }
  if (/\b(mystery|mystère|mystérieux|secrets|énigmes mystiques)\b/.test(lower)) {
    set.add('Mystère');
  }
  if (/\b(turn-based|tour par tour|tactique au tour par tour)\b/.test(lower)) {
    set.add('Tour par tour');
  }
  if (/\b(fishing|pêche|poisson|pêcher|poissons)\b/.test(lower)) {
    set.add('Pêche');
  }
  if (/\b(sandbox|bac à sable|monde ouvert créatif|liberté totale)\b/.test(lower)) {
    set.add('Sandbox');
  }
  if (/\b(dungeon crawler|exploration de donjon|donjons)\b/.test(lower)) {
    set.add('Dungeon Crawler');
  }
  if (/\b(cyberpunk|dystopie néon|implants cybernétiques)\b/.test(lower)) {
    set.add('Cyberpunk');
  }
  if (/\b(mmo|massively multiplayer|massivement multijoueur)\b/.test(lower)) {
    set.add('Massivement multijoueur');
  }
  if (/\b(co-op|coop|cooperative|coopératif|jouez ensemble|multijoueur coop|coopération)\b/.test(lower)) {
    set.add('Co-op');
  }
  if (/\b(sci-fi|science-fiction|spatial|espace|extraterrestre|vaisseau|futuriste)\b/.test(lower)) {
    set.add('Sci-Fi');
  }
  if (/\b(rétro|retro|nostalgie|années 80|années 90|pixel|ps1|8-bit|16-bit)\b/.test(lower)) {
    set.add('Rétro');
  }

  // Filtrer les termes interdits ou non-genres
  set.delete('Indépendant');
  set.delete('Accès anticipé');
  set.delete('Early Access');
  set.delete('Indie');
  set.delete('Occasionnel');
  set.delete('Casual');

  const result = Array.from(set);
  return result.length > 0 ? result.slice(0, 5) : ['Action', 'Aventure'];
}

/**
 * Extrait intelligemment le compositeur d'une description textuelle (si présent)
 */
export function extractComposerFromText(text: string): string | undefined {
  if (!text) return undefined;
  const clean = cleanTextForAnalysis(text);

  const patterns = [
    /(?:composed by|composer|compositeur|music by|musique par|soundtrack by|ost by|original score by)\s*[:\-–]\s*([A-ZÀ-ÖØ-ß][a-zA-ZÀ-ÿ\s\-\.]{2,35})/i,
    /(?:musique et sons par|sound design and music by)\s*[:\-–]\s*([A-ZÀ-ÖØ-ß][a-zA-ZÀ-ÿ\s\-\.]{2,35})/i,
    /(?:musique composée par|music composed by)\s+([A-ZÀ-ÖØ-ß][a-zA-ZÀ-ÿ\s\-\.]{2,35})/i,
  ];

  for (const pat of patterns) {
    const match = clean.match(pat);
    if (match && match[1]) {
      const candidate = match[1].trim().replace(/[,;\(\)\.\n\r].*$/, '').trim();
      if (candidate.length >= 3 && candidate.length <= 40 && !/^(the|and|steam|valve|game|play|with|all)\b/i.test(candidate)) {
        return candidate;
      }
    }
  }
  return undefined;
}
