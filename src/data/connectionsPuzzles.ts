import type { DailyConnectionsPuzzle, ConnectionCategory, DifficultyLevel, Game, LocalizedText } from '../types/game';
import { INDIE_GAMES } from './games';

/**
 * 🦉 Hoot Indie Games — Moteur de Connexions Dynamique & Procédural (Linkle)
 * Évolue automatiquement avec la bibliothèque de jeux grandissante (Steam & Pépites Itch.io).
 * Garantit :
 * - 4 catégories thématiques par grille (1 Facile 🟨, 1 Moyen 🟩, 1 Difficile 🟦, 1 Expert 🟪)
 * - 4 jeux distincts par catégorie
 * - Exactement 16 jeux mutuellement exclusifs (zéro doublon de jeu entre catégories)
 * - Déterminisme temporel absolu (même grille pour tous les joueurs le même jour)
 */

export interface CategoryRule {
  id: string;
  label: LocalizedText;
  difficulty: DifficultyLevel;
  filter: (g: Game) => boolean;
}

export const CATEGORY_RULES: CategoryRule[] = [
  // ==========================================
  // FACILE (Jaune 🟨) — Styles visuels, perspectives et genres majeurs
  // ==========================================
  {
    id: 'cat-pixel-art',
    label: {
      fr: 'Direction artistique en Pixel Art',
      en: 'Pixel Art Aesthetics',
      es: 'Dirección artística en Pixel Art',
      de: 'Pixel-Art-Grafikstil',
      ja: 'ドット絵（ピクセルアート）の美学',
      'pt-BR': 'Direção de arte em Pixel Art'
    },
    difficulty: 'easy',
    filter: (g) => g.artStyle.en === 'Pixel Art',
  },
  {
    id: 'cat-hand-drawn',
    label: {
      fr: 'Direction artistique 2D dessinée à la main',
      en: 'Hand-Drawn 2D Art',
      es: 'Arte 2D dibujado a mano',
      de: 'Handgezeichnete 2D-Grafik',
      ja: '手描き2Dグラフィック',
      'pt-BR': 'Arte 2D desenhada à mão'
    },
    difficulty: 'easy',
    filter: (g) => g.artStyle.en === '2D Hand-drawn',
  },
  {
    id: 'cat-stylized-3d',
    label: {
      fr: 'Direction artistique 3D Stylisée',
      en: 'Stylized 3D Worlds',
      es: 'Mundos 3D estilizados',
      de: 'Stilisierte 3D-Welten',
      ja: 'スタイライズド3Dグラフィック',
      'pt-BR': 'Mundos 3D estilizados'
    },
    difficulty: 'easy',
    filter: (g) => g.artStyle.en === 'Stylized 3D',
  },
  {
    id: 'cat-side-scroller',
    label: {
      fr: 'Jeux en vue de côté (2D Side-scroller)',
      en: '2D Side-scrollers',
      es: 'Desplazamiento lateral 2D (Side-scroller)',
      de: '2D-Side-Scroller',
      ja: '2D横スクロール視点',
      'pt-BR': 'Jogos em visão lateral (Side-scroller 2D)'
    },
    difficulty: 'easy',
    filter: (g) => g.camera.en === '2D Side-scroller',
  },
  {
    id: 'cat-top-down',
    label: {
      fr: 'Jeux en vue du dessus (2D Top-down)',
      en: '2D Top-down Perspective',
      es: 'Perspectiva cenital (2D Top-down)',
      de: '2D-Vogelperspektive (Top-down)',
      ja: '見下ろし型2D視点（トップダウン）',
      'pt-BR': 'Perspectiva de cima (2D Top-down)'
    },
    difficulty: 'easy',
    filter: (g) => g.camera.en === '2D Top-down',
  },
  {
    id: 'cat-first-person',
    label: {
      fr: 'Jeux en vue à la première personne',
      en: 'First-Person Perspective',
      es: 'Perspectiva en primera persona',
      de: 'Egoperspektive (First-Person)',
      ja: '一人称視点（ファーストパーソン）',
      'pt-BR': 'Perspectiva em primeira pessoa'
    },
    difficulty: 'easy',
    filter: (g) => g.camera.en === 'First-Person',
  },
  {
    id: 'cat-rpg',
    label: {
      fr: 'Jeux de rôle & Action RPG',
      en: 'Action RPG & Role Playing',
      es: 'Juegos de rol y Action RPG',
      de: 'Rollenspiele & Action-RPGs',
      ja: 'ロールプレイング＆アクションRPG',
      'pt-BR': 'Jogos de interpretação e Action RPG'
    },
    difficulty: 'easy',
    filter: (g) => g.genre.includes('RPG'),
  },
  {
    id: 'cat-puzzle-brain',
    label: {
      fr: 'Casse-têtes & Énigmes cérébrales',
      en: 'Puzzles & Brain Teasers',
      es: 'Rompecabezas y acertijos mentales',
      de: 'Rätsel- & Denkspiele',
      ja: 'パズル＆思考型謎解き',
      'pt-BR': 'Quebra-cabeças e enigmas intelectuais'
    },
    difficulty: 'easy',
    filter: (g) => g.genre.includes('Puzzle'),
  },
  {
    id: 'cat-platformer',
    label: {
      fr: 'Jeux de plateforme & sauts millimétrés',
      en: 'Precision & Platforming',
      es: 'Plataformas y saltos de precisión',
      de: 'Präzisions-Plattformer & Geschicklichkeit',
      ja: '精密ジャンプ＆プラットフォーマー',
      'pt-BR': 'Jogos de plataforma e saltos milimétricos'
    },
    difficulty: 'easy',
    filter: (g) => g.genre.includes('Platformer'),
  },
  {
    id: 'cat-year-2024',
    label: {
      fr: 'Pépites parues durant l’année 2024',
      en: 'Indie Hits Released in 2024',
      es: 'Éxitos indie lanzados en 2024',
      de: 'Indie-Erfolge des Jahres 2024',
      ja: '2024年に発売されたインディー名作',
      'pt-BR': 'Sucessos indie lançados no ano de 2024'
    },
    difficulty: 'easy',
    filter: (g) => g.releaseYear === 2024,
  },
  {
    id: 'cat-year-2018',
    label: {
      fr: 'Pépites parues durant l’âge d’or 2018',
      en: 'Indie Hits Released in 2018',
      es: 'Joyas indie del año dorado 2018',
      de: 'Indie-Klassiker aus dem Goldjahr 2018',
      ja: '黄金期2018年に登場したインディー名作',
      'pt-BR': 'Joias indie lançadas na era de ouro de 2018'
    },
    difficulty: 'easy',
    filter: (g) => g.releaseYear === 2018,
  },
  {
    id: 'cat-deckbuilding',
    label: {
      fr: 'Mécanique centrale de cartes & deckbuilding',
      en: 'Deckbuilding & Card Mechanics',
      es: 'Construcción de mazos y cartas',
      de: 'Deckbuilding & Kartenmechaniken',
      ja: 'デッキ構築＆カードバトル',
      'pt-BR': 'Construção de baralhos e cartas'
    },
    difficulty: 'easy',
    filter: (g) => g.genre.some((x) => x.toLowerCase().includes('deck') || x.toLowerCase().includes('carte')),
  },

  // ==========================================
  // MOYEN (Vert 🟩) — Thèmes, boucles de gameplay et origines
  // ==========================================
  {
    id: 'cat-roguelike',
    label: {
      fr: 'Boucles de mort permanente & Roguelike',
      en: 'Roguelike & Permadeath Runs',
      es: 'Bucles de muerte permanente y Roguelike',
      de: 'Roguelikes & Permadeath-Runs',
      ja: 'ローグライク＆パーマデス進行',
      'pt-BR': 'Loops de morte permanente e Roguelike'
    },
    difficulty: 'medium',
    filter: (g) => g.genre.includes('Roguelike') || g.genre.includes('Roguelite'),
  },
  {
    id: 'cat-metroidvania',
    label: {
      fr: 'Exploration labyrinthique (Metroidvania)',
      en: 'Metroidvania Exploration',
      es: 'Exploración laberíntica (Metroidvania)',
      de: 'Labyrinthartige Erkundung (Metroidvania)',
      ja: '迷宮探索型（メトロイドヴァニア）',
      'pt-BR': 'Exploração labiríntica (Metroidvania)'
    },
    difficulty: 'medium',
    filter: (g) => g.genre.includes('Metroidvania'),
  },
  {
    id: 'cat-cozy-relax',
    label: {
      fr: 'Ambiance réconfortante & Cozy',
      en: 'Wholesome & Cozy Vibes',
      es: 'Ambiente acogedor y relajante',
      de: 'Herzerwärmende & gemütliche Stimmung',
      ja: '心温まる癒やし系（Cozy）な世界',
      'pt-BR': 'Atmosfera acolhedora e relaxante'
    },
    difficulty: 'medium',
    filter: (g) =>
      g.genre.includes('Cozy') ||
      [
        'a-short-hike',
        'stardew-valley',
        'dorfromantik',
        'spiritfarer',
        'unpacking',
        'chicory-a-colorful-tale',
        'our-life-beginnings-and-always',
        'townscaper',
      ].includes(g.id),
  },
  {
    id: 'cat-itch-gems',
    label: {
      fr: 'Pépites nées ou hébergées sur Itch.io',
      en: 'Indie Gems on Itch.io',
      es: 'Joyas nacidas en Itch.io',
      de: 'Indie-Perlen auf Itch.io',
      ja: 'Itch.io発のインディー宝石',
      'pt-BR': 'Joias nascidas ou hospedadas no Itch.io'
    },
    difficulty: 'medium',
    filter: (g) => Boolean(g.itchUrl || g.playInBrowserUrl),
  },
  {
    id: 'cat-scifi-cosmos',
    label: {
      fr: 'Aventures spatiales & Science-fiction',
      en: 'Space & Sci-Fi Adventures',
      es: 'Aventuras espaciales y ciencia ficción',
      de: 'Weltraum- & Sci-Fi-Abenteuer',
      ja: '宇宙冒険＆SFアドベンチャー',
      'pt-BR': 'Aventuras espaciais e ficção científica'
    },
    difficulty: 'medium',
    filter: (g) => g.genre.includes('Sci-Fi'),
  },
  {
    id: 'cat-horror-survival',
    label: {
      fr: 'Survie angoissante & Horreur psychologique',
      en: 'Psychological Horror & Survival',
      es: 'Supervivencia angustiante y terror psicológico',
      de: 'Beklemmender Survival- & Psycho-Horror',
      ja: '心理的恐怖＆サバイバルホラー',
      'pt-BR': 'Sobrevivência angustiante e terror psicológico'
    },
    difficulty: 'medium',
    filter: (g) => g.genre.includes('Horreur') || g.genre.includes('Psychologique'),
  },
  {
    id: 'cat-isometric',
    label: {
      fr: 'Perspective isométrique & 2.5D',
      en: 'Isometric & 2.5D Perspective',
      es: 'Perspectiva isométrica y 2.5D',
      de: 'Isometrische & 2.5D-Perspektive',
      ja: 'クォータービュー（アイソメトリック）＆2.5D',
      'pt-BR': 'Perspectiva isométrica e 2.5D'
    },
    difficulty: 'medium',
    filter: (g) => g.camera.en === 'Isometric / 2.5D',
  },
  {
    id: 'cat-management-build',
    label: {
      fr: 'Gestion, colonie & automatisation',
      en: 'Management & Automation',
      es: 'Gestión, colonia y automatización',
      de: 'Aufbau, Koloniemanagement & Automation',
      ja: 'コロニー運営・経営＆自動化',
      'pt-BR': 'Gerenciamento, colônia e automação'
    },
    difficulty: 'medium',
    filter: (g) => g.genre.includes('Gestion') || g.genre.includes('Simulation'),
  },
  {
    id: 'cat-retro-lowpoly',
    label: {
      fr: 'Esthétique 3D Rétro Low-poly (ère PS1/N64)',
      en: 'Retro Low-poly 3D (PS1 Era)',
      es: 'Estética 3D retro low-poly (era PS1/N64)',
      de: 'Retro-Low-Poly-3D-Stil (PS1/N64-Ära)',
      ja: 'レトロなローポリゴン3D（初代PS/N64世代）',
      'pt-BR': 'Estética 3D retrô low-poly (era PS1/N64)'
    },
    difficulty: 'medium',
    filter: (g) => g.artStyle.en === 'Retro Low-poly 3D',
  },
  {
    id: 'cat-survival-hostile',
    label: {
      fr: 'Survie & artisanat en milieu hostile',
      en: 'Survival & Crafting in Hostile Worlds',
      es: 'Supervivencia y artesanía en entornos hostiles',
      de: 'Überleben & Handwerk in feindseligen Welten',
      ja: '過酷な世界でのサバイバル＆クラフト',
      'pt-BR': 'Sobrevivência e criação em mundos hostis'
    },
    difficulty: 'medium',
    filter: (g) => g.genre.includes('Survie'),
  },
  {
    id: 'cat-year-2023',
    label: {
      fr: 'Pépites parues en 2023',
      en: 'Indie Hits Released in 2023',
      es: 'Éxitos indie lanzados en 2023',
      de: 'Indie-Erfolge des Jahres 2023',
      ja: '2023年に発売されたインディー名作',
      'pt-BR': 'Sucessos indie lançados em 2023'
    },
    difficulty: 'medium',
    filter: (g) => g.releaseYear === 2023,
  },
  {
    id: 'cat-year-2022',
    label: {
      fr: 'Pépites parues en 2022',
      en: 'Indie Hits Released in 2022',
      es: 'Éxitos indie lanzados en 2022',
      de: 'Indie-Erfolge des Jahres 2022',
      ja: '2022年に発売されたインディー名作',
      'pt-BR': 'Sucessos indie lançados em 2022'
    },
    difficulty: 'medium',
    filter: (g) => g.releaseYear === 2022,
  },

  // ==========================================
  // DIFFICILE (Bleu 🟦) — Concepteurs, protagonistes et atmosphères
  // ==========================================
  {
    id: 'cat-solo-creators',
    label: {
      fr: 'Créés quasi-intégralement en solo (Solo Dev)',
      en: 'Created Almost Entirely by a Solo Dev',
      es: 'Creados casi íntegramente en solitario (Solo Dev)',
      de: 'Fast vollständig von einem Solo-Entwickler erschaffen',
      ja: 'ほぼ全編を一人の個人開発者（ソロ開発）が制作',
      'pt-BR': 'Criados quase integralmente em carreira solo (Solo Dev)'
    },
    difficulty: 'hard',
    filter: (g) =>
      [
        'stardew-valley',
        'undertale',
        'balatro',
        'axiom-verge',
        'binding-of-isaac-rebirth',
        'vampire-survivors',
        'return-of-the-obra-dinn',
        'baba-is-you',
        'pony-island',
        'buckshot-roulette',
        'animal-well',
        'a-short-hike',
        'adventures-with-anxiety',
        'dusk',
        'rollerdrome',
      ].includes(g.id),
  },
  {
    id: 'cat-animals',
    label: {
      fr: 'Héros incarnés par un animal ou insecte',
      en: 'Animal or Insect Protagonists',
      es: 'Protagonistas animales o insectos',
      de: 'Tier- oder Insekten-Protagonisten',
      ja: '動物や昆虫が主人公のゲーム',
      'pt-BR': 'Protagonistas animais ou insetos'
    },
    difficulty: 'hard',
    filter: (g) =>
      [
        'hollow-knight',
        'tunic',
        'animal-well',
        'stray',
        'a-short-hike',
        'cult-of-the-lamb',
        'rain-world',
        'chicory-a-colorful-tale',
        'frog-detective-the-haunted-island',
        'baba-is-you',
        'night-in-the-woods',
        'owlboy',
      ].includes(g.id),
  },
  {
    id: 'cat-aquatic',
    label: {
      fr: 'Mondes marins, pêche & plongées sous-marines',
      en: 'Underwater & Nautical Adventures',
      es: 'Mundos marinos, pesca y buceo submarino',
      de: 'Unterwasserwelten, Angeln & Tiefsee',
      ja: '深海、釣り、海洋探索アドベンチャー',
      'pt-BR': 'Mundos marinhos, pesca e mergulho oceânico'
    },
    difficulty: 'hard',
    filter: (g) =>
      [
        'dave-the-diver',
        'subnautica',
        'dredge',
        'subnautica-below-zero',
        'iron-lung',
        'soma',
      ].includes(g.id),
  },
  {
    id: 'cat-dark-fantasy',
    label: {
      fr: 'Atmosphères sombres de Dark Fantasy & pénitence',
      en: 'Grim Dark Fantasy Worlds & Penance',
      es: 'Mundos oscuros de Dark Fantasy y penitencia',
      de: 'Düstere Dark-Fantasy-Welten & Buße',
      ja: '贖罪と深淵のダークファンタジー世界',
      'pt-BR': 'Atmosferas sombrias de Dark Fantasy e penitência'
    },
    difficulty: 'hard',
    filter: (g) =>
      [
        'blasphemous',
        'darkest-dungeon',
        'darkest-dungeon-2',
        'no-rest-for-the-wicked',
        'cult-of-the-lamb',
        'dont-starve',
      ].includes(g.id),
  },
  {
    id: 'cat-era-pioneers',
    label: {
      fr: 'Piliers parus entre 2010 et 2016',
      en: 'Indie Classics Released 2010-2016',
      es: 'Clásicos pioneros lanzados entre 2010 y 2016',
      de: 'Indie-Klassiker erschienen zwischen 2010 und 2016',
      ja: '2010年〜2016年に登場したインディー草創期の金字塔',
      'pt-BR': 'Clássicos pioneiros lançados entre 2010 e 2016'
    },
    difficulty: 'hard',
    filter: (g) => g.releaseYear >= 2010 && g.releaseYear <= 2016,
  },
  {
    id: 'cat-investigation',
    label: {
      fr: 'Enquêtes & déductions narratives',
      en: 'Mystery & Narrative Deduction',
      es: 'Investigación y deducción narrativa',
      de: 'Ermittlungen & narrative Deduktion',
      ja: '事件捜査＆物語的ロジック推理',
      'pt-BR': 'Investigação e dedução narrativa'
    },
    difficulty: 'hard',
    filter: (g) =>
      [
        'disco-elysium',
        'return-of-the-obra-dinn',
        'outer-wilds',
        'pentiment',
        'the-case-of-the-golden-idol',
        'chants-of-sennaar',
        'frog-detective-the-haunted-island',
        'shadows-of-doubt',
      ].includes(g.id),
  },
  {
    id: 'cat-bullet-fast',
    label: {
      fr: 'Esquives intenses, Bullet Hell & frénésie',
      en: 'Intense Dodging & Bullet Hell',
      es: 'Esquivas extremas y Bullet Hell frenético',
      de: 'Extremes Ausweichen & rasantes Bullet Hell',
      ja: '超絶回避＆白熱の弾幕（バレットヘル）',
      'pt-BR': 'Esquivas intensas, Bullet Hell e adrenalina'
    },
    difficulty: 'hard',
    filter: (g) => g.genre.includes('Bullet Hell') || g.genre.includes('Fast-FPS'),
  },
  {
    id: 'cat-comedy',
    label: {
      fr: 'Humour décalé, satire & comédie',
      en: 'Satire & Quirky Comedy',
      es: 'Humor extravagante, sátira y comedia',
      de: 'Schräger Humor, Satire & Comedy',
      ja: 'シュールな笑い、風刺＆コメディ',
      'pt-BR': 'Humor excêntrico, sátira e comédia'
    },
    difficulty: 'hard',
    filter: (g) => g.genre.includes('Comédie'),
  },

  // ==========================================
  // EXPERT (Violet 🟪) — Méta-concepts, narration cryptique et jeux cultes
  // ==========================================
  {
    id: 'cat-time-mysteries',
    label: {
      fr: 'Boucles temporelles & mémoires fragmentées',
      en: 'Time Loops & Fragmented Memories',
      es: 'Bucles temporales y recuerdos fragmentados',
      de: 'Zeitschleifen & bruchstückhafte Erinnerungen',
      ja: 'タイムループ＆断片化された記憶',
      'pt-BR': 'Loops temporais e memórias fragmentadas'
    },
    difficulty: 'expert',
    filter: (g) =>
      [
        'outer-wilds',
        'disco-elysium',
        'signalis',
        'hades',
        'minit',
        'loop-hero',
        'the-stanley-parable-ultra-deluxe',
      ].includes(g.id),
  },
  {
    id: 'cat-meta-fourth-wall',
    label: {
      fr: 'Brisage du 4e mur & détournement méta',
      en: 'Breaking the 4th Wall & Meta Puzzles',
      es: 'Ruptura de la cuarta pared y enigmas meta',
      de: 'Durchbrechen der 4. Wand & Meta-Rätsel',
      ja: '第四の壁の破壊＆メタフィクション謎解き',
      'pt-BR': 'Quebra da 4ª parede e enigmas metalinguísticos'
    },
    difficulty: 'expert',
    filter: (g) =>
      [
        'the-stanley-parable-ultra-deluxe',
        'inscryption',
        'doki-doki-literature-club',
        'pony-island',
        'baba-is-you',
        'the-looker',
        'undertale',
      ].includes(g.id),
  },
  {
    id: 'cat-souls-like',
    label: {
      fr: 'Exigence impitoyable & mécaniques Souls-like',
      en: 'Brutal Souls-like Mechanics',
      es: 'Dificultad implacable y mecánicas Souls-like',
      de: 'Erbarmungslose Härte & Souls-like-Mechaniken',
      ja: '容赦なき高難度＆ソウルライク要素',
      'pt-BR': 'Dificuldade implacável e mecânicas Souls-like'
    },
    difficulty: 'expert',
    filter: (g) => g.genre.includes('Souls-like'),
  },
  {
    id: 'cat-ost-tribute',
    label: {
      fr: 'Bandes originales cultes primées',
      en: 'Award-Winning Iconic Soundtracks',
      es: 'Bandas sonoras de culto galardonadas',
      de: 'Preisgekrönte ikonische Soundtracks',
      ja: '名誉ある賞を受賞した伝説的サウンドトラック',
      'pt-BR': 'Trilhas sonoras cult premiadas'
    },
    difficulty: 'expert',
    filter: (g) =>
      [
        'cuphead',
        'sea-of-stars',
        'ori-and-the-blind-forest',
        'hades',
        'celeste',
        'undertale',
        'hollow-knight',
        'risk-of-rain-2',
        'hotline-miami',
      ].includes(g.id),
  },
  {
    id: 'cat-game-jam-roots',
    label: {
      fr: 'Conçus initialement lors d’une Game Jam',
      en: 'Born in a Game Jam',
      es: 'Nacidos originalmente en una Game Jam',
      de: 'Ursprünglich bei einer Game Jam entstanden',
      ja: 'ゲームジャム（Game Jam）で誕生した作品',
      'pt-BR': 'Criados originalmente durante uma Game Jam'
    },
    difficulty: 'expert',
    filter: (g) =>
      [
        'celeste',
        'vampire-survivors',
        'baba-is-you',
        'buckshot-roulette',
        'minit',
        'canabalt-classic',
        'celeste-classic-pico8',
        'superhot',
        'goat-simulator',
      ].includes(g.id),
  },
  {
    id: 'cat-philosophical-existential',
    label: {
      fr: 'Thématiques existentielles, deuil ou psyché',
      en: 'Existential Themes, Grief & Psyche',
      es: 'Temas existenciales, duelo y psique',
      de: 'Existenzielle Themen, Trauer & Psyche',
      ja: '実存的な思索、喪失と受容、深層心理',
      'pt-BR': 'Temas existenciais, luto e psique'
    },
    difficulty: 'expert',
    filter: (g) =>
      [
        'gris',
        'spiritfarer',
        'celeste',
        'omori',
        'disco-elysium',
        'what-remains-of-edith-finch',
        'signalis',
        'before-your-eyes',
        'grimms-hollow',
        'adventures-with-anxiety',
      ].includes(g.id),
  },
];

/**
 * Générateur pseudo-aléatoire déterministe (Lehmer LCG)
 */
function createPseudoRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export const KNOWN_GAME_COVERS: Record<string, string> = {
  'how-to-fish':
    'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4001890/45c4ddff4901e32c4b8b643e1b97d0d01898d299/header.jpg?t=1788788717',
  'rv-there-yet':
    'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3949040/df3b0e300632f3cd1caf0aa9dc6213ebe79dac43/header_alt_assets_0.jpg?t=1789134289',
  'iron-nest-heavy-turret-simulator':
    'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2950790/e6c9e990560078611472e5dab98e79a405ed33f4/header.jpg?t=1789499918',
  'bombanana':
    'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4656000/99c086faba625a8d3bc459bab444087d257ccbe1/header.jpg?t=1789738286',
  'bugarden':
    'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4289410/75c44fc15c78405cee2442ec67ccc464baaa4e49/header.jpg?t=1790050993',
  'openfront':
    'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3560670/b33eddb983569a4b0b4ac6ba5a23554b3dc3755f/header.jpg?t=1789729231',
  'igtap-an-incremental-game-that-s-also-a-platformer':
    'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4364730/baee180cfd51a94a559ffeace1f5c00d4c9a8fc2/header.jpg?t=1789991871',
  'video-game-menu-the-game':
    'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3949620/4577e66f9092240f68a6c9fdc37f36b521ba16b7/header.jpg?t=1790010257',
  'celeste-classic-pico8':
    'https://img.itch.zone/aW1hZ2UvMzEzMTgvMTMzNjQyLmdpZg==/original/vIUIrE.gif',
  'adventures-with-anxiety':
    'https://img.itch.zone/aW1hZ2UvNTMxNzg0LzI3NjQ4NDUucG5n/original/zH2u1U.png',
  'blooming-panic':
    'https://img.itch.zone/aW1hZ2UvMTEwMzY1MS83Njk3NTM1LnBuZw==/original/J%2BNMeT.png',
};

export function getGameImageUrl(game: Game): string {
  if (game.headerImage) return game.headerImage;
  if (KNOWN_GAME_COVERS[game.id]) return KNOWN_GAME_COVERS[game.id];
  if (game.steamUrl) {
    const match = game.steamUrl.match(/\/app\/(\d+)/);
    if (match) {
      return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${match[1]}/header.jpg`;
    }
  }
  return game.screenshots?.[0] || '';
}

export function getGameFallbackImageUrl(game: Game): string {
  if (game.screenshots && game.screenshots.length > 0) {
    return game.screenshots[0];
  }
  if (game.steamUrl) {
    const match = game.steamUrl.match(/\/app\/(\d+)/);
    if (match) {
      return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${match[1]}/header.jpg`;
    }
  }
  return '';
}

/**
 * Puzzles manuellement ciselés pour des dates historiques
 */
export const CONNECTIONS_PUZZLES: DailyConnectionsPuzzle[] = [
  {
    id: 'connections-01',
    date: '2026-09-17',
    categories: [
      {
        id: 'cat-2018',
        label: {
          fr: 'Pépites indépendantes parues en 2018',
          en: 'Indie masterpieces released in 2018',
      es: 'Obras maestras independientes de 2018',
      de: 'Indie-Meisterwerke des Jahres 2018',
      ja: '2018年に発表されたインディーの傑作群',
      'pt-BR': 'Obras-primas independentes lançadas em 2018'
        },
        difficulty: 'easy',
        items: [
          {
            gameId: 'celeste',
            gameTitle: 'Celeste',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/504230/header.jpg',
          },
          {
            gameId: 'dead-cells',
            gameTitle: 'Dead Cells',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/588650/header.jpg',
          },
          {
            gameId: 'subnautica',
            gameTitle: 'Subnautica',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/264710/header.jpg',
          },
          {
            gameId: 'gris',
            gameTitle: 'Gris',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/683320/header.jpg',
          },
        ],
      },
      {
        id: 'cat-animals',
        label: {
          fr: 'Héros animaux ou insectes silencieux',
          en: 'Animal or Insect Protagonists',
      es: 'Héroes animales o insectos silenciosos',
      de: 'Stumme Tier- oder Insektenhelden',
      ja: '無口な動物や昆虫の主人公たち',
      'pt-BR': 'Heróis animais ou insetos silenciosos'
        },
        difficulty: 'medium',
        items: [
          {
            gameId: 'hollow-knight',
            gameTitle: 'Hollow Knight',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg',
          },
          {
            gameId: 'tunic',
            gameTitle: 'Tunic',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/553420/header.jpg',
          },
          {
            gameId: 'animal-well',
            gameTitle: 'Animal Well',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/813230/header.jpg',
          },
          {
            gameId: 'frog-detective-the-haunted-island',
            gameTitle: 'Frog Detective 1',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/963000/header.jpg',
          },
        ],
      },
      {
        id: 'cat-deckbuilding',
        label: {
          fr: 'Mécanique centrale de cartes & deckbuilding',
          en: 'Core Deckbuilding & Card Mechanics',
      es: 'Construcción de mazos y cartas',
      de: 'Deckbuilding & Kartenmechaniken',
      ja: 'デッキ構築＆カードバトル',
      'pt-BR': 'Construção de baralhos e cartas'
        },
        difficulty: 'hard',
        items: [
          {
            gameId: 'slay-the-spire',
            gameTitle: 'Slay the Spire',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/646570/header.jpg',
          },
          {
            gameId: 'balatro',
            gameTitle: 'Balatro',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2379780/header.jpg',
          },
          {
            gameId: 'inscryption',
            gameTitle: 'Inscryption',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1092790/header.jpg',
          },
          {
            gameId: 'monster-train',
            gameTitle: 'Monster Train',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1102190/header.jpg',
          },
        ],
      },
      {
        id: 'cat-time-mysteries',
        label: {
          fr: 'Boucles temporelles & mémoires fragmentées',
          en: 'Time Loops & Fragmented Memories',
      es: 'Bucles temporales y recuerdos fragmentados',
      de: 'Zeitschleifen & bruchstückhafte Erinnerungen',
      ja: 'タイムループ＆断片化された記憶',
      'pt-BR': 'Loops temporais e memórias fragmentadas'
        },
        difficulty: 'expert',
        items: [
          {
            gameId: 'outer-wilds',
            gameTitle: 'Outer Wilds',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/753640/header.jpg',
          },
          {
            gameId: 'disco-elysium',
            gameTitle: 'Disco Elysium',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/632470/header.jpg',
          },
          {
            gameId: 'signalis',
            gameTitle: 'Signalis',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1262350/header.jpg',
          },
          {
            gameId: 'hades',
            gameTitle: 'Hades',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145360/header.jpg',
          },
        ],
      },
    ],
  },
  {
    id: 'connections-02',
    date: '2026-09-18',
    categories: [
      {
        id: 'cat-ost-tribute',
        label: {
          fr: 'Bandes originales cultes primées',
          en: 'Iconic Award-Winning Original Soundtracks',
      es: 'Bandas sonoras de culto galardonadas',
      de: 'Preisgekrönte ikonische Soundtracks',
      ja: '名誉ある賞を受賞した伝説的サウンドトラック',
      'pt-BR': 'Trilhas sonoras cult premiadas'
        },
        difficulty: 'easy',
        items: [
          {
            gameId: 'cuphead',
            gameTitle: 'Cuphead',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/268910/header.jpg',
          },
          {
            gameId: 'sea-of-stars',
            gameTitle: 'Sea of Stars',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1244090/header.jpg',
          },
          {
            gameId: 'ori-and-the-blind-forest',
            gameTitle: 'Ori and the Blind Forest',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/387290/header.jpg',
          },
          {
            gameId: 'hades',
            gameTitle: 'Hades',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145360/header.jpg',
          },
        ],
      },
      {
        id: 'cat-aquatic',
        label: {
          fr: 'Mondes marins & plongées sous-marines',
          en: 'Underwater & Ocean Exploration',
      es: 'Mundos marinos y buceo submarino',
      de: 'Unterwasserwelten & Tiefseetauchen',
      ja: '深海探索＆スキューバダイビングの世界',
      'pt-BR': 'Mundos marinhos e mergulho subaquático'
        },
        difficulty: 'medium',
        items: [
          {
            gameId: 'dave-the-diver',
            gameTitle: 'Dave the Diver',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1868140/header.jpg',
          },
          {
            gameId: 'subnautica',
            gameTitle: 'Subnautica',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/264710/header.jpg',
          },
          {
            gameId: 'dredge',
            gameTitle: 'Dredge',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1562430/header.jpg',
          },
          {
            gameId: 'iron-lung',
            gameTitle: 'Iron Lung',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1846170/header.jpg',
          },
        ],
      },
      {
        id: 'cat-solo-creators',
        label: {
          fr: 'Créés quasi-intégralement en solo (Solo Dev)',
          en: 'Crafted Almost Entirely by a Solo Developer',
      es: 'Creados casi íntegramente en solitario (Solo Dev)',
      de: 'Fast vollständig von einem Solo-Entwickler erschaffen',
      ja: 'ほぼ全編を一人の個人開発者（ソロ開発）が制作',
      'pt-BR': 'Criados quase integralmente em carreira solo (Solo Dev)'
        },
        difficulty: 'hard',
        items: [
          {
            gameId: 'stardew-valley',
            gameTitle: 'Stardew Valley',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/header.jpg',
          },
          {
            gameId: 'undertale',
            gameTitle: 'Undertale',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/391540/header.jpg',
          },
          {
            gameId: 'balatro',
            gameTitle: 'Balatro',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2379780/header.jpg',
          },
          {
            gameId: 'axiom-verge',
            gameTitle: 'Axiom Verge',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/332200/header.jpg',
          },
        ],
      },
      {
        id: 'cat-gothic-dark',
        label: {
          fr: 'Atmosphères sombres de dark fantasy & pénitence',
          en: 'Bleak Dark Fantasy & Penance',
      es: 'Atmósferas sombrías de dark fantasy y penitencia',
      de: 'Düstere Dark-Fantasy & Buße',
      ja: '暗黒のダークファンタジーと苦行の戒律',
      'pt-BR': 'Atmosferas sombrias de dark fantasy e penitência'
        },
        difficulty: 'expert',
        items: [
          {
            gameId: 'blasphemous',
            gameTitle: 'Blasphemous',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/774361/header.jpg',
          },
          {
            gameId: 'darkest-dungeon',
            gameTitle: 'Darkest Dungeon',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/262060/header.jpg',
          },
          {
            gameId: 'darkest-dungeon-2',
            gameTitle: 'Darkest Dungeon II',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1940340/header.jpg',
          },
          {
            gameId: 'no-rest-for-the-wicked',
            gameTitle: 'No Rest for the Wicked',
            imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1371980/header.jpg',
          },
        ],
      },
    ],
  },
];

/**
 * Génère une grille quotidienne de 16 jeux dynamiques à partir de la bibliothèque.
 * Garantit l'absence totale d'ambiguïté (aucun jeu sélectionné ne correspond au filtre d'une autre catégorie active).
 */
export function generateDailyConnectionsPuzzle(
  dateStr: string,
  allGames: Game[] = INDIE_GAMES
): DailyConnectionsPuzzle {
  const rand = createPseudoRandom(stringToSeed(dateStr));
  const tiers: DifficultyLevel[] = ['easy', 'medium', 'hard', 'expert'];

  const easyRules = CATEGORY_RULES.filter((r) => r.difficulty === 'easy').sort(() => rand() - 0.5);
  const mediumRules = CATEGORY_RULES.filter((r) => r.difficulty === 'medium').sort(() => rand() - 0.5);
  const hardRules = CATEGORY_RULES.filter((r) => r.difficulty === 'hard').sort(() => rand() - 0.5);
  const expertRules = CATEGORY_RULES.filter((r) => r.difficulty === 'expert').sort(() => rand() - 0.5);

  let selectedRules: CategoryRule[] | null = null;
  let categoryPureGames: Game[][] | null = null;

  // Recherche d'un ensemble de 4 règles (1 par difficulté) où chaque catégorie dispose d'au moins 4 jeux
  // qui ne satisfont AUCUNE des 3 autres catégories actives de la grille.
  outer: for (const r1 of easyRules) {
    for (const r2 of mediumRules) {
      for (const r3 of hardRules) {
        for (const r4 of expertRules) {
          const rules = [r1, r2, r3, r4];
          const candidateLists: Game[][] = [];
          let valid = true;

          for (let i = 0; i < 4; i++) {
            const currentRule = rules[i];
            const otherRules = rules.filter((_, idx) => idx !== i);
            const pure = allGames.filter(
              (g) => currentRule.filter(g) && !otherRules.some((or) => or.filter(g))
            );
            if (pure.length < 4) {
              valid = false;
              break;
            }
            candidateLists.push(pure);
          }

          if (valid) {
            selectedRules = rules;
            categoryPureGames = candidateLists;
            break outer;
          }
        }
      }
    }
  }

  const categories: ConnectionCategory[] = [];

  if (selectedRules && categoryPureGames) {
    for (let i = 0; i < 4; i++) {
      const rule = selectedRules[i];
      const tier = tiers[i];
      const pureGames = categoryPureGames[i];
      const shuffledGames = [...pureGames].sort(() => rand() - 0.5);
      const selected = shuffledGames.slice(0, 4);

      categories.push({
        id: `${rule.id}-${dateStr}`,
        label: rule.label,
        difficulty: tier,
        items: selected.map((g) => ({
          gameId: g.id,
          gameTitle: g.title,
          imageUrl: getGameImageUrl(g),
          fallbackUrl: getGameFallbackImageUrl(g),
        })),
      });
    }
  } else {
    // Fallback de sécurité glouton si aucune combinaison pure n'était trouvée
    const chosenGameIds = new Set<string>();
    for (const tier of tiers) {
      const tierRules = CATEGORY_RULES.filter((r) => r.difficulty === tier);
      const shuffledRules = [...tierRules].sort(() => rand() - 0.5);

      for (const rule of shuffledRules) {
        const eligibleGames = allGames.filter((g) => rule.filter(g) && !chosenGameIds.has(g.id));
        if (eligibleGames.length >= 4) {
          const shuffledGames = [...eligibleGames].sort(() => rand() - 0.5);
          const selected = shuffledGames.slice(0, 4);
          selected.forEach((g) => chosenGameIds.add(g.id));

          categories.push({
            id: `${rule.id}-${dateStr}-fallback`,
            label: rule.label,
            difficulty: tier,
            items: selected.map((g) => ({
              gameId: g.id,
              gameTitle: g.title,
              imageUrl: getGameImageUrl(g),
              fallbackUrl: getGameFallbackImageUrl(g),
            })),
          });
          break;
        }
      }
    }
  }

  return {
    id: `dyn-conn-${dateStr}`,
    date: dateStr,
    categories,
  };
}

/**
 * Récupère le puzzle Linkle du jour (curé si date spéciale, ou généré dynamiquement)
 */
export function getDailyConnectionsPuzzle(dateStr: string): DailyConnectionsPuzzle {
  const curated = CONNECTIONS_PUZZLES.find((p) => p.date === dateStr);
  if (curated) return curated;

  return generateDailyConnectionsPuzzle(dateStr, INDIE_GAMES);
}
