import type { LocalizedText } from '../types/game';

export interface UpcomingGame {
  id: string;
  title: string;
  developer: string;
  publisher: string;
  expectedDate: LocalizedText;
  genres: LocalizedText[];
  platforms: string[];
  steamUrl?: string;
  description: LocalizedText;
  highlight: LocalizedText;
  hypeScore: number; // 1-100
  coverUrl: string;
}

export const UPCOMING_INDIE_GAMES: UpcomingGame[] = [
  {
    id: 'silksong',
    title: 'Hollow Knight: Silksong',
    developer: 'Team Cherry',
    publisher: 'Team Cherry',
    expectedDate: {
      fr: 'À confirmer (En développement)',
      en: 'TBA (In Active Development)',
    },
    genres: [
      { fr: 'Metroidvania', en: 'Metroidvania' },
      { fr: 'Action', en: 'Action' },
      { fr: 'Souls-like', en: 'Souls-like' },
    ],
    platforms: ['PC', 'Nintendo Switch', 'PlayStation 5', 'Xbox Series X/S'],
    steamUrl: 'https://store.steampowered.com/app/1030300/Hollow_Knight_Silksong/',
    description: {
      fr: 'Incarnez Hornet, princesse-protectrice d’Hallownest, capturée et emmenée dans un royaume inconnu et mortel régi par la soie et la musique.',
      en: 'Play as Hornet, princess-protector of Hallownest, captured and brought to a deadly new kingdom ruled by silk and song.',
    },
    highlight: {
      fr: 'L’un des jeux indépendants les plus ardemment attendus de l’histoire.',
      en: 'One of the most feverishly anticipated indie titles in gaming history.',
    },
    hypeScore: 99,
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'slaythespire2',
    title: 'Slay the Spire 2',
    developer: 'Mega Crit',
    publisher: 'Mega Crit',
    expectedDate: {
      fr: 'Accès Anticipé 2025/2026',
      en: 'Early Access 2025/2026',
    },
    genres: [
      { fr: 'Roguelike Deckbuilder', en: 'Roguelike Deckbuilder' },
      { fr: 'Stratégie', en: 'Strategy' },
    ],
    platforms: ['PC (Steam)'],
    steamUrl: 'https://store.steampowered.com/app/2868840/Slay_the_Spire_2/',
    description: {
      fr: 'La suite du roi incontesté du deckbuilder rogue-like. Un tout nouveau moteur (Godot Engine !), de nouveaux tueurs, reliques et malédictions.',
      en: 'The sequel to the landmark roguelike deckbuilder. Rebuilt from scratch in Godot Engine with new slayers, relics, and curses.',
    },
    highlight: {
      fr: 'Conçu avec passion sur le moteur libre Godot Engine.',
      en: 'Proudly re-engineered with the open-source Godot Engine.',
    },
    hypeScore: 97,
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'hades2-v1',
    title: 'Hades II (Version 1.0)',
    developer: 'Supergiant Games',
    publisher: 'Supergiant Games',
    expectedDate: {
      fr: 'Sortie officielle 1.0 (2025/2026)',
      en: 'Official 1.0 Launch (2025/2026)',
    },
    genres: [
      { fr: 'Roguelike Action', en: 'Action Roguelike' },
      { fr: 'Mythologie', en: 'Mythology' },
    ],
    platforms: ['PC', 'Consoles'],
    steamUrl: 'https://store.steampowered.com/app/1145350/Hades_II/',
    description: {
      fr: 'Battez-vous au-delà des Enfers en incarnant Melinoë, princesse immortelle des Enfers et sorcière d’Hécate, pour abattre Chronos.',
      en: 'Battle beyond the Underworld as Melinoë, the immortal Princess of the Underworld, to vanquish Chronos, the Titan of Time.',
    },
    highlight: {
      fr: 'La première véritable suite directe signée Supergiant Games.',
      en: 'The first-ever direct sequel crafted by Supergiant Games.',
    },
    hypeScore: 96,
    coverUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'mina-hollower',
    title: 'Mina the Hollower',
    developer: 'Yacht Club Games',
    publisher: 'Yacht Club Games',
    expectedDate: {
      fr: 'Fin 2025 / 2026',
      en: 'Late 2025 / 2026',
    },
    genres: [
      { fr: 'Action-Aventure 8-bit', en: '8-bit Action-Adventure' },
      { fr: 'Gothique', en: 'Gothic Horror' },
    ],
    platforms: ['PC', 'Nintendo Switch', 'PlayStation', 'Xbox'],
    steamUrl: 'https://store.steampowered.com/app/1875580/Mina_the_Hollower/',
    description: {
      fr: 'Par les créateurs de Shovel Knight, un vibrant hommage aux légendes Game Boy Color (Link’s Awakening, Castlevania) avec un gameplay vif et souterrain.',
      en: 'From the creators of Shovel Knight, a bone-chilling love letter to classic Game Boy Color adventures with burrowing mechanics.',
    },
    highlight: {
      fr: 'Direction artistique Game Boy sublime avec musique par Jake Kaufman & Yuzo Koshiro.',
      en: 'Stunning GBC aesthetics with a soundtrack by Jake Kaufman and Yuzo Koshiro.',
    },
    hypeScore: 92,
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'earthblade',
    title: 'Earthblade',
    developer: 'Extremely OK Games',
    publisher: 'Extremely OK Games',
    expectedDate: {
      fr: '2026',
      en: '2026',
    },
    genres: [
      { fr: 'Action Explorateur', en: 'Explor-Action Platformer' },
      { fr: 'Pixel Art', en: 'Pixel Art' },
    ],
    platforms: ['PC (Steam)', 'Consoles'],
    steamUrl: 'https://store.steampowered.com/app/2240700/Earthblade/',
    description: {
      fr: 'Le nouveau chef-d’œuvre des créateurs de Celeste et TowerFall. Voyagez à travers un monde ruiné et mystérieux dans la peau de Névoa.',
      en: 'The next masterpiece from the creators of Celeste and TowerFall. Travel through a ruined, enigmatic world as Névoa.',
    },
    highlight: {
      fr: 'Bande originale envoûtante par Lena Raine.',
      en: 'Mesmerizing musical score composed by Lena Raine.',
    },
    hypeScore: 94,
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'mewgenics',
    title: 'Mewgenics',
    developer: 'Edmund McMillen & Tyler Glaiel',
    publisher: 'Edmund McMillen',
    expectedDate: {
      fr: '2025 / 2026',
      en: '2025 / 2026',
    },
    genres: [
      { fr: 'Tactique au tour par tour', en: 'Turn-Based Tactics' },
      { fr: 'Génétique Féline Roguelike', en: 'Cat Breeding Roguelike' },
    ],
    platforms: ['PC (Steam)'],
    steamUrl: 'https://store.steampowered.com/app/686060/Mewgenics/',
    description: {
      fr: 'Le projet de vie d’Edmund McMillen (The Binding of Isaac, Super Meat Boy). Élevez, croisez et faites combattre des armées de chats mutants dans un monde chaotique.',
      en: "Edmund McMillen's magnum opus. Breed, mutate, and send cats into tactical turn-based battles across an unpredictable world.",
    },
    highlight: {
      fr: 'Plus de 10 ans de gestation pour un RPG tactique d’une profondeur colossale.',
      en: 'Over a decade in the making for a turn-based tactical RPG of massive depth.',
    },
    hypeScore: 91,
    coverUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
  },
];
