import type { RoostProject } from '../types/game';

export const ROOST_PROJECTS: RoostProject[] = [
  {
    id: 'la-foret-du-hibou',
    title: 'La Forêt du Hibou',
    tagline: {
      fr: 'Jeu d\'exploration et d\'ambiance développé en Canvas 2D',
      en: 'Atmospheric forest exploration adventure built in Canvas 2D',
    },
    description: {
      fr: 'Expérience interactive fluide avec moteur de rendu 2D sur mesure, système de particules de lucioles, ambiance sonore synthétisée et contrôles tactiles pour mobiles.',
      en: 'Contemplative 2D browser game featuring a custom Canvas rendering engine, dynamic firefly particles, and responsive touch controls.',
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
      fr: 'Hommage vectoriel à la console culte Vectrex de 1982',
      en: 'Vector-line tribute to the legendary 1982 Vectrex console',
    },
    description: {
      fr: 'Reconstitution fidèle des graphismes vectoriels cathodiques lumineux et de la physique inertielle de Mine Storm dans l\'espace.',
      en: 'Faithful recreation of radiant CRT vector line graphics and zero-gravity inertial physics inspired by the 1982 classic.',
    },
    category: 'game',
    tags: ['Retro Gaming', 'Vector Graphics', 'Arcade', 'Canvas 2D'],
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
        fr: 'Physique spatiale à inertie sans frottement',
        en: 'Authentic frictionless Newtonian thrust physics',
      },
    ],
  },
  {
    id: 'hibou-clicker',
    title: 'Hibou Clicker',
    tagline: {
      fr: 'Jeu incrémental et système de progression',
      en: 'Incremental clicker game with progression and prestige',
    },
    description: {
      fr: 'Développez votre perchoir, optimisez vos multiplicateurs et débloquez des paliers d\'améliorations avec sauvegarde locale automatique continue.',
      en: 'Gather feathers, unlock roost upgrades, and climb the progression tree with automated local storage saving.',
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
        fr: 'Multiplicateurs exponentiels et arbre d\'améliorations',
        en: 'Exponential multi-tier progression tree',
      },
      {
        fr: 'Sauvegarde automatique discrète dans le navigateur',
        en: 'Seamless local storage persistence and export',
      },
    ],
  },
  {
    id: 'hibouxe-lore-analyst',
    title: 'Hibouxe : Analyses & Essais Vidéo',
    tagline: {
      fr: 'Décryptages narratifs et game design des chefs-d\'œuvre du jeu vidéo indé',
      en: 'In-depth narrative dissections and game design essays on indie classics',
    },
    description: {
      fr: 'Chaîne YouTube et réflexions analytiques dédiées aux secrets de Hollow Knight, Outer Wilds, Rain World et Dark Souls : storytelling environnemental, symbolisme et philosophie de gameplay.',
      en: 'Video essays analyzing environmental storytelling, cosmic philosophy, and worldbuilding in Hollow Knight, Outer Wilds, and Rain World.',
    },
    category: 'lore',
    tags: ['Video Essays', 'Game Design', 'YouTube', 'Narrative Design'],
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
        fr: 'Vidéos de fond pour passionnés d\'indés et de secrets de lore',
        en: 'Engaged community of indie world-explorers and lore enthusiasts',
      },
    ],
  },
  {
    id: 'arcade-secrete',
    title: 'La Salle d\'Arcade',
    tagline: {
      fr: '8 mini-jeux rétro jouables directement dans le navigateur',
      en: '8 retro arcade mini-games playable directly in the browser',
    },
    description: {
      fr: 'Snake, Pong, Casse-Briques, Flappy Hibou, Invaders, Forest Run, Tetris et Mine Storm Vectrex 1982 : mini-jeux classiques calibrés à 60 FPS pour des parties immédiates.',
      en: 'Snake, Pong, Breakout, Flappy Owl, Invaders, Forest Run, Tetris, and Mine Storm Vectrex: classic arcade game loops calibrated at 60 FPS.',
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
        fr: '8 mini-jeux rétro indépendants calibrés à 60 FPS constants',
        en: '8 distinct arcade engines calibrated at solid 60 FPS',
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
      fr: 'Expérimentation de grilles de déplacement, gestion de ligne de mire, probabilités de dés et combats tactiques d\'escarmouche.',
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
