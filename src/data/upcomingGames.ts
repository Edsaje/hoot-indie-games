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
      fr: 'En développement actif (TBA)',
      en: 'In Active Development (TBA)',
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
    id: 'earthblade',
    title: 'Earthblade',
    developer: 'Extremely OK Games',
    publisher: 'Extremely OK Games',
    expectedDate: {
      fr: '2027',
      en: '2027',
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
      fr: 'Bande originale envoûtante composée par Lena Raine.',
      en: 'Mesmerizing musical score composed by Lena Raine.',
    },
    hypeScore: 95,
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'mewgenics',
    title: 'Mewgenics',
    developer: 'Edmund McMillen & Tyler Glaiel',
    publisher: 'Edmund McMillen',
    expectedDate: {
      fr: 'Fin 2026 / 2027',
      en: 'Late 2026 / 2027',
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
    hypeScore: 94,
    coverUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'possessors',
    title: 'Possessor(s)',
    developer: 'Heart Machine',
    publisher: 'Devolver Digital',
    expectedDate: {
      fr: '2027',
      en: '2027',
    },
    genres: [
      { fr: 'Action Platformer / Horreur Sci-Fi', en: 'Sci-Fi Action Horror Platformer' },
      { fr: 'Combat Précis', en: 'Precision Combat' },
    ],
    platforms: ['PC (Steam)', 'Consoles'],
    steamUrl: 'https://store.steampowered.com/app/2811450/Possessors/',
    description: {
      fr: 'Par les créateurs de Hyper Light Drifter et Solar Ash. Incarnez Luca et son hôte démoniaque Rehm au cœur d’une mégapole en quarantaine inondée par une catastrophe interdimensionnelle.',
      en: 'From the creators of Hyper Light Drifter and Solar Ash. Play as Luca and her demon counterpart Rehm through a flooded quarantine megacity.',
    },
    highlight: {
      fr: 'Animation 2D peinte à la main combinée à des arrière-plans 3D saisissants.',
      en: 'Hand-drawn 2D animation integrated into striking 3D environments.',
    },
    hypeScore: 93,
    coverUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'wanderstop',
    title: 'Wanderstop',
    developer: 'Ivy Road',
    publisher: 'Annapurna Interactive',
    expectedDate: {
      fr: 'Fin 2026 / 2027',
      en: 'Late 2026 / 2027',
    },
    genres: [
      { fr: 'Aventure Narrative / Salon de Thé', en: 'Narrative Tea Shop Adventure' },
      { fr: 'Psychologique', en: 'Psychological' },
    ],
    platforms: ['PC (Steam)', 'PlayStation 5'],
    steamUrl: 'https://store.steampowered.com/app/2056970/Wanderstop/',
    description: {
      fr: 'Conçu par Davey Wreden (The Stanley Parable, The Beginner’s Guide) et Karla Zimonja (Gone Home, Tacoma). Incarnez Alta, une guerrière déchue tentant de tenir un salon de thé paisible au cœur d’une forêt magique.',
      en: "From Davey Wreden (The Stanley Parable) and Karla Zimonja (Gone Home). Play as Alta, a fallen warrior managing a peaceful tea shop in a magical forest.",
    },
    highlight: {
      fr: 'Une déconstruction poignante de la paix intérieure et du trauma.',
      en: 'A poignant, narrative deconstruction of inner peace and rest.',
    },
    hypeScore: 92,
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'citizen-sleeper-2',
    title: 'Citizen Sleeper 2: Starward Vector',
    developer: 'Jump Over the Age',
    publisher: 'Fellow Traveller',
    expectedDate: {
      fr: 'Fin 2026 / 2027',
      en: 'Late 2026 / 2027',
    },
    genres: [
      { fr: 'RPG Narratif / Lancer de Dés', en: 'Narrative Dice RPG' },
      { fr: 'Cyberpunk', en: 'Cyberpunk' },
    ],
    platforms: ['PC', 'Xbox Series X/S', 'PlayStation 5', 'Nintendo Switch'],
    steamUrl: 'https://store.steampowered.com/app/2442460/Citizen_Sleeper_2_Starward_Vector/',
    description: {
      fr: 'La suite très attendue du RPG spatial plébiscité. Avec un vaisseau en ruine, un corps défaillant et une prime sur votre tête, formez un équipage dans la Ceinture d’Hélion.',
      en: 'The sequel to the acclaimed space RPG. With a malfunctioning body and a bounty on your head, build a crew in the Helion Belt.',
    },
    highlight: {
      fr: 'Musique à nouveau composée par Amos Roddy.',
      en: 'Atmospheric electronic score again composed by Amos Roddy.',
    },
    hypeScore: 93,
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'skate-story',
    title: 'Skate Story',
    developer: 'Sam Eng',
    publisher: 'Devolver Digital',
    expectedDate: {
      fr: 'Fin 2026',
      en: 'Late 2026',
    },
    genres: [
      { fr: 'Skateboard Psychédélique', en: 'Psychedelic Skateboarding' },
      { fr: 'Aventure Onirique', en: 'Dreamlike Adventure' },
    ],
    platforms: ['PC (Steam)'],
    steamUrl: 'https://store.steampowered.com/app/1263240/Skate_Story/',
    description: {
      fr: 'Vous êtes un démon fait de verre et de douleur. Le Diable vous a confié une mission : skatez jusqu’à la Lune et dévorez-la pour être libéré.',
      en: 'You are a demon made of glass and pain. The Devil gave you a quest: skate to the Moon and swallow it to gain freedom.',
    },
    highlight: {
      fr: 'Direction artistique époustouflante avec musique par Blood Cultures.',
      en: 'Jaw-dropping crystalline visuals with music by Blood Cultures.',
    },
    hypeScore: 91,
    coverUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'replaced',
    title: 'REPLACED',
    developer: 'Sad Cat Studios',
    publisher: 'Coatsink',
    expectedDate: {
      fr: 'Fin 2026 / 2027',
      en: 'Late 2026 / 2027',
    },
    genres: [
      { fr: 'Plateforme 2.5D Cinématique', en: 'Cinematic 2.5D Platformer' },
      { fr: 'Cyberpunk Rétro-futuriste', en: 'Retro-futuristic Cyberpunk' },
    ],
    platforms: ['PC', 'Xbox Series X/S'],
    steamUrl: 'https://store.steampowered.com/app/1663850/REPLACED/',
    description: {
      fr: 'Un jeu d’action 2.5D rétro-futuriste se déroulant dans une Amérique alternative des années 80. Incarnez R.E.A.C.H., une intelligence artificielle piégée dans un corps humain contre son gré.',
      en: 'A 2.5D retro-futuristic action platformer set in an alternate 1980s America. Play as R.E.A.C.H., an AI trapped in a human body against its will.',
    },
    highlight: {
      fr: 'Pixel art volumétrique 2.5D révolutionnaire avec éclairage cinématographique.',
      en: 'Groundbreaking volumetric 2.5D pixel art with cinematic lighting.',
    },
    hypeScore: 92,
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
  },
];
