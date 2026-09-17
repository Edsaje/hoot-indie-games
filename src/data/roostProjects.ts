import type { RoostProject } from '../types/game';

export const ROOST_PROJECTS: RoostProject[] = [
  {
    id: 'la-foret-du-hibou',
    title: 'La Forêt du Hibou',
    tagline: {
      fr: 'Exploration atmosphérique et mystique au cœur d\'une sylve nocturne',
      en: 'An atmospheric and mystical dark forest exploration adventure',
    },
    description: {
      fr: 'Une expérience contemplative et interactive développée en Canvas 2D avec un système de lucioles dynamiques, une palette ardoise et or, et des secrets disséminés dans la brume.',
      en: 'A contemplative and interactive Canvas 2D experience featuring dynamic firefly particles, a slate and gold aesthetic, and secrets scattered across the fog.',
    },
    category: 'game',
    tags: ['Canvas 2D', 'Atmospheric', 'JavaScript ES6+', 'Audio Synth'],
    releaseYear: 2026,
    status: 'featured',
    imageUrl: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=1200&q=80',
    links: {
      demoUrl: 'https://quentinbeaud.com/',
      githubUrl: 'https://github.com/Edsaje/Portfolio_Hibou',
      playUrl: 'https://quentinbeaud.com/',
    },
    highlights: [
      {
        fr: 'Rendu 60 FPS sans dépendance tierce ni framework lourd',
        en: '60 FPS custom rendering with zero external library overhead',
      },
      {
        fr: 'Manette tactile virtuelle adaptative pour smartphones',
        en: 'Adaptive virtual touch gamepad for mobile web',
      },
      {
        fr: 'Système météo dynamique de particules de lucioles',
        en: 'Dynamic firefly and ambient mist particle engine',
      },
    ],
  },
  {
    id: 'vectrex-mine-storm',
    title: 'Mine Storm Vectrex Revival',
    tagline: {
      fr: 'Hommage vectoriel pur à la console mythique Vectrex de 1982',
      en: 'Vector-line arcade tribute to the legendary 1982 Vectrex console',
    },
    description: {
      fr: 'Reconstitution fidèle des graphismes vectoriels cathodiques ultra-lumineux et de la physique inertielle de Mine Storm. Accessible via code secret ou easter egg rétro.',
      en: 'Faithful recreation of radiant CRT vector glow graphics and zero-g inertial physics from Mine Storm. Discoverable via retro secret code.',
    },
    category: 'game',
    tags: ['Retro Gaming', 'Vector Graphics', 'Arcade', 'Glow Shaders'],
    releaseYear: 2026,
    status: 'released',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    links: {
      demoUrl: 'https://quentinbeaud.com/',
      githubUrl: 'https://github.com/Edsaje/Portfolio_Hibou',
    },
    highlights: [
      {
        fr: 'Effets de bloom et persistance phosphorique calculés en temps réel',
        en: 'Real-time phosphor persistence and beam bloom simulation',
      },
      {
        fr: 'Physique de poussée spatiale à faible friction',
        en: 'Authentic frictionless Newtonian thrust physics',
      },
    ],
  },
  {
    id: 'hibou-clicker',
    title: 'Hibou Clicker : Plumes Célestes',
    tagline: {
      fr: 'Jeu incrémental et prestige astrale au clair de lune',
      en: 'Incremental clicker game with cosmic owl prestige under the moonlight',
    },
    description: {
      fr: 'Collectez des plumes nocturnes, améliorez votre perchoir, invoquez des constellations de chouettes et débloquez le rituel du Grand Hibou Céleste avec sauvegarde locale continue.',
      en: 'Gather nocturnal feathers, upgrade your roost, summon owl constellations, and trigger celestial ascension with continuous local state persistence.',
    },
    category: 'game',
    tags: ['Idle Clicker', 'LocalStorage', 'Achievements', 'Progression'],
    releaseYear: 2026,
    status: 'released',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    links: {
      demoUrl: 'https://quentinbeaud.com/',
      githubUrl: 'https://github.com/Edsaje/idle_clicker_adventure',
    },
    highlights: [
      {
        fr: 'Multiplicateurs exponentiels et arbre de prestige céleste',
        en: 'Exponential multi-tier prestige ascension tree',
      },
      {
        fr: 'Sauvegarde automatique discrète dans le navigateur',
        en: 'Seamless local storage persistence and export',
      },
    ],
  },
  {
    id: 'hibouxe-lore-analyst',
    title: 'Hibouxe : Lore Analyst & Essais Vidéo',
    tagline: {
      fr: 'Décryptages narratifs approfondis des grands chefs-d\'œuvre du jeu vidéo indé',
      en: 'In-depth narrative dissections of iconic indie gaming lore masterpieces',
    },
    description: {
      fr: 'Chaîne YouTube et réflexions analytiques dédiées aux secrets de Hollow Knight, Outer Wilds, Rain World et Dark Souls : storytelling environnemental, symbolisme et philosophie de gameplay.',
      en: 'Video essays and architectural narrative breakdowns analyzing environmental storytelling, cosmic philosophy, and worldbuilding in Hollow Knight, Outer Wilds, and Rain World.',
    },
    category: 'lore',
    tags: ['Video Essays', 'Lore Analysis', 'YouTube', 'Narrative Design'],
    releaseYear: 2025,
    status: 'featured',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    links: {
      videoUrl: 'https://www.youtube.com/@Hibouxe',
    },
    highlights: [
      {
        fr: 'Analyses poussées de la narration par l\'environnement',
        en: 'Comprehensive dissections of diegetic level design',
      },
      {
        fr: 'Communauté de passionnés d\'indés et de secrets de lore',
        en: 'Engaged community of indie world-explorers and lore enthusiasts',
      },
    ],
  },
  {
    id: 'arcade-secrete',
    title: 'La Salle d\'Arcade Secrète',
    tagline: {
      fr: '8 mini-jeux rétro immersifs intégrés directement dans le navigateur',
      en: '8 retro arcade mini-games integrated directly in the browser',
    },
    description: {
      fr: 'Snake Doré, Pong Magique, Casse-Briques, Flappy Hibou, Hibou Invaders, Forest Run, Tetris Mystique et Mine Storm Vectrex 1982 : un concentré de game design classique taillé pour le web rapide.',
      en: 'Golden Snake, Magic Pong, Brick Breaker, Flappy Owl, Owl Invaders, Forest Run, Mystic Tetris, and Mine Storm Vectrex: timeless game loops optimized for instantaneous browser play.',
    },
    category: 'prototype',
    tags: ['Arcade', 'Canvas 2D', 'Retro Audio', 'Mobile Ready'],
    releaseYear: 2026,
    status: 'released',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
    links: {
      demoUrl: 'https://quentinbeaud.com/',
      githubUrl: 'https://github.com/Edsaje/Portfolio_Hibou',
    },
    highlights: [
      {
        fr: '7 boucles de gameplay arcade indépendantes et fluides',
        en: '7 distinct zero-dependency arcade engines',
      },
      {
        fr: 'Tableau des records et gestion des scores locaux',
        en: 'Local high scores and instant replay mechanics',
      },
    ],
  },
  {
    id: 'naheulbeuk-tactical',
    title: 'Donjon de Naheulbeuk 2.0 (Prototype)',
    tagline: {
      fr: 'Moteur tactique au tour par tour et donjon crawler rétro',
      en: 'Turn-based tactical dungeon crawler prototype',
    },
    description: {
      fr: 'Expérimentation de grilles hexagonales, gestion de ligne de mire, probabilités de dés et combats tactiques d\'escarmouche inspirés des aventures donjonnesques humoristiques.',
      en: 'Exploration of grid movement, line-of-sight algorithms, dice probability tables, and humorous tactical dungeon encounters.',
    },
    category: 'prototype',
    tags: ['Java / C#', 'Tactical RPG', 'Turn-based', 'Algorithms'],
    releaseYear: 2026,
    status: 'in-development',
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80',
    links: {
      githubUrl: 'https://github.com/Edsaje',
    },
    highlights: [
      {
        fr: 'Algorithmes de champ de vision (FOV) et de pathfinding A*',
        en: 'Precise field of view (FOV) and A* pathfinding',
      },
      {
        fr: 'Système d\'initiatives et d\'états d\'altération',
        en: 'Initiative queue and deep status-effect system',
      },
    ],
  },
];
