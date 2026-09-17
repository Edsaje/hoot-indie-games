import type { Achievement } from '../types/achievements';

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: 'first_flight',
    title: {
      fr: 'Premier Envol',
      en: 'First Flight',
    },
    description: {
      fr: 'Jouer et terminer votre première partie quotidienne sur Hoot Indie Games.',
      en: 'Play and finish your first daily challenge on Hoot Indie Games.',
    },
    icon: 'Feather',
    feathersReward: 10,
    category: 'gameplay',
  },
  {
    id: 'owl_eyes',
    title: {
      fr: 'Œil de Hibou',
      en: "Owl's Gaze",
    },
    description: {
      fr: "Deviner le jeu dans Screenle dès l'étape 1 ou 2 avec un zoom extrême.",
      en: 'Guess the game in Screenle on Stage 1 or 2 under extreme magnification.',
    },
    icon: 'Eye',
    feathersReward: 25,
    category: 'mastery',
  },
  {
    id: 'linkle_flawless',
    title: {
      fr: 'Harmonie Parfaite',
      en: 'Flawless Connection',
    },
    description: {
      fr: 'Résoudre la grille Linkle en 4 sélections consécutives sans aucune erreur.',
      en: 'Solve the Linkle 4x4 puzzle in 4 straight moves with zero mistakes.',
    },
    icon: 'Sparkles',
    feathersReward: 30,
    category: 'mastery',
  },
  {
    id: 'polyglot',
    title: {
      fr: 'Indie Polyglotte',
      en: 'Indie Polyglot',
    },
    description: {
      fr: 'Basculer la plateforme entre le Français et l’Anglais.',
      en: 'Toggle the platform between French and English.',
    },
    icon: 'Globe',
    feathersReward: 5,
    category: 'exploration',
  },
  {
    id: 'night_watch',
    title: {
      fr: 'Vigie Nocturne',
      en: 'Night Owl Watch',
    },
    description: {
      fr: 'Jouer à Hoot Indie Games entre 23h00 et 05h00 du matin.',
      en: 'Play Hoot Indie Games between 11:00 PM and 5:00 AM.',
    },
    icon: 'Moon',
    feathersReward: 15,
    category: 'exploration',
  },
  {
    id: 'archive_master',
    title: {
      fr: 'Encyclopédie Vivante',
      en: 'Walking Archive',
    },
    description: {
      fr: 'Trouver le bon jeu dans Indledle en 4 propositions ou moins.',
      en: 'Find the secret title in Indledle in 4 guesses or fewer.',
    },
    icon: 'BookOpen',
    feathersReward: 20,
    category: 'mastery',
  },
  {
    id: 'roulette_gambler',
    title: {
      fr: 'Roue de la Fortune Indé',
      en: 'Indie Roulette Wheel',
    },
    description: {
      fr: 'Tourner la Roulette des pépites au moins 3 fois dans la boîte à outils.',
      en: 'Spin the Indie Gem Roulette at least 3 times in the toolbox.',
    },
    icon: 'Dices',
    feathersReward: 10,
    category: 'exploration',
  },
  {
    id: 'roost_explorer',
    title: {
      fr: 'Arpenteur du Perchoir',
      en: 'Roost Pioneer',
    },
    description: {
      fr: 'Visiter l’espace Le Perchoir et explorer les créations de Hibouxe.',
      en: "Visit The Roost showcase and inspect Hibouxe's indie projects.",
    },
    icon: 'Compass',
    feathersReward: 15,
    category: 'exploration',
  },
  {
    id: 'secret_owl',
    title: {
      fr: 'Murmure des Bois',
      en: 'Whisper of the Woods',
    },
    description: {
      fr: 'Réveiller le hibou sacré et découvrir le secret de la bannière nocturne.',
      en: 'Awaken the sacred owl and uncover the secret within the top night bar.',
    },
    icon: 'Award',
    feathersReward: 50,
    category: 'exploration',
    secret: true,
  },
  {
    id: 'daily_trifecta',
    title: {
      fr: 'Tiercé Nocturne',
      en: 'Nightly Trifecta',
    },
    description: {
      fr: 'Remporter les trois mini-jeux quotidiens (Screenle, Indledle, Linkle) le même jour.',
      en: 'Win all three daily challenges (Screenle, Indledle, Linkle) on the same day.',
    },
    icon: 'Trophy',
    feathersReward: 40,
    category: 'mastery',
  },
  {
    id: 'custom_linkle_builder',
    title: {
      fr: 'Architecte de Liens',
      en: 'Connection Architect',
    },
    description: {
      fr: 'Créer votre propre grille Linkle personnalisée ou tester une grille créée par un joueur.',
      en: 'Craft your own custom Linkle puzzle or test a player-crafted challenge.',
    },
    icon: 'Puzzle',
    feathersReward: 20,
    category: 'exploration',
  },
  {
    id: 'versus_champion',
    title: {
      fr: 'Gladiateur du Perchoir',
      en: 'Roost Gladiator',
    },
    description: {
      fr: 'Remporter un duel en mode Versus 1v1 contre un ami ou un rival en ligne.',
      en: 'Win a 1v1 Versus duel against a friend or an online rival.',
    },
    icon: 'Swords',
    feathersReward: 35,
    category: 'mastery',
  },
];
