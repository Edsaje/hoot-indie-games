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
    "id": "haunted-chocolatier",
    "title": "Haunted Chocolatier",
    "developer": "ConcernedApe",
    "publisher": "ConcernedApe",
    "expectedDate": {
      "fr": "En développement actif (TBA)",
      "en": "In Active Development (TBA)"
    },
    "genres": [
      {
        "fr": "RPG / Simulation",
        "en": "RPG / Simulation"
      },
      {
        "fr": "Pixel Art",
        "en": "Pixel Art"
      },
      {
        "fr": "Aventure",
        "en": "Adventure"
      }
    ],
    "platforms": [
      "PC",
      "Consoles"
    ],
    "description": {
      "fr": "Par Eric Barone, créateur solo de Stardew Valley. Établissez votre chocolaterie hantée dans une nouvelle ville, collectez des ingrédients rares et liez-vous d'amitié avec les habitants et les fantômes.",
      "en": "From Eric Barone, the solo creator of Stardew Valley. Run a haunted chocolate shop in a magical town, gather rare ingredients, and form bonds with townsfolk and spirits."
    },
    "highlight": {
      "fr": "La nouvelle œuvre majeure de ConcernedApe axée sur l'artisanat, l'exploration et le fantastique.",
      "en": "ConcernedApe's highly anticipated follow-up emphasizing confectionery craft and enchanting action."
    },
    "hypeScore": 98,
    "coverUrl": "https://img.youtube.com/vi/kYky1xV2Fh8/maxresdefault.jpg"
  },
  {
    "id": "crowsworn",
    "title": "Crowsworn",
    "developer": "Mongoose Rodeo",
    "publisher": "Mongoose Rodeo",
    "expectedDate": {
      "fr": "Fin 2026 / 2027",
      "en": "Late 2026 / 2027"
    },
    "genres": [
      {
        "fr": "Metroidvania",
        "en": "Metroidvania"
      },
      {
        "fr": "Action Sombre",
        "en": "Dark Action"
      },
      {
        "fr": "Platformer 2D",
        "en": "2D Platformer"
      }
    ],
    "platforms": [
      "PC",
      "Consoles"
    ],
    "steamUrl": "https://store.steampowered.com/app/1614330/Crowsworn/",
    "description": {
      "fr": "Explorez le royaume maudit de Fearanndal dans la peau d'un corbeau armé d'une faux, de pistolets et de pouvoirs obscurs dans un Metroidvania nerveux dessiné à la main.",
      "en": "Explore the cursed realm of Fearanndal as a plague-masked crow wielding a scythe, dual pistols, and dark magic in a hand-drawn, high-intensity Metroidvania."
    },
    "highlight": {
      "fr": "Combats ultra-dynamiques et fluidité exemplaire salués par la communauté Metroidvania.",
      "en": "Kinetic combat loop and stylish hand-drawn animation praised across the indie community."
    },
    "hypeScore": 95,
    "coverUrl": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1614330/header.jpg"
  },
  {
    "id": "light-no-fire",
    "title": "Light No Fire",
    "developer": "Hello Games",
    "publisher": "Hello Games",
    "expectedDate": {
      "fr": "2027+ (TBA)",
      "en": "2027+ (TBA)"
    },
    "genres": [
      {
        "fr": "Survie / Sandbox",
        "en": "Survival / Sandbox"
      },
      {
        "fr": "Monde Ouvert",
        "en": "Open World"
      },
      {
        "fr": "Aventure Coop",
        "en": "Co-op Adventure"
      }
    ],
    "platforms": [
      "PC"
    ],
    "steamUrl": "https://store.steampowered.com/app/2719590/Light_No_Fire/",
    "description": {
      "fr": "Par l'équipe de No Man's Sky. Une planète fantastique entière générée de façon procédurale à l'échelle 1:1, à explorer librement à pied, en bateau ou à dos de dragon.",
      "en": "From Hello Games. An entire Earth-sized procedural fantasy planet rendered at true 1:1 scale, shared online with seamless exploration on foot, boat, or flying mounts."
    },
    "highlight": {
      "fr": "Une planète partagée sans aucun écran de chargement avec construction de royaumes.",
      "en": "A boundless shared world with procedural geography, deep building systems, and aerial mount flight."
    },
    "hypeScore": 96,
    "coverUrl": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2719590/header.jpg"
  },
  {
    "id": "the-eternal-life-of-goldman",
    "title": "The Eternal Life of Goldman",
    "developer": "Weappy Studio",
    "publisher": "THQ Nordic",
    "expectedDate": {
      "fr": "Prochainement",
      "en": "Prochainement"
    },
    "genres": [
      {
        "fr": "Plateforme 2D",
        "en": "2D Platformer"
      },
      {
        "fr": "Aventure",
        "en": "Adventure"
      },
      {
        "fr": "Animation Traditionnelle",
        "en": "Traditional Animation"
      }
    ],
    "platforms": [
      "PC",
      "PlayStation 5",
      "Xbox Series X/S",
      "Nintendo Switch"
    ],
    "steamUrl": "https://store.steampowered.com/app/2254950/The_Eternal_Life_of_Goldman/",
    "description": {
      "fr": "Une aventure de plateformes féerique et sombre entièrement dessinée et animée image par image à la main, sans aucune interpolation numérique.",
      "en": "A dark, whimsical platforming adventure meticulously hand-drawn frame-by-frame with zero digital tweening or procedural cut-outs."
    },
    "highlight": {
      "fr": "Un hommage authentique à l'âge d'or des films d'animation et des classiques 16-bits.",
      "en": "An uncompromising celebration of classic hand-animated cinema and golden-age 16-bit design."
    },
    "hypeScore": 94,
    "coverUrl": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2254950/header.jpg"
  },
  {
    "id": "witchbrook",
    "title": "Witchbrook",
    "developer": "Chucklefish",
    "publisher": "Chucklefish",
    "expectedDate": {
      "fr": "2026",
      "en": "2026"
    },
    "genres": [
      {
        "fr": "Simulation de Vie",
        "en": "Life Sim"
      },
      {
        "fr": "École de Magie",
        "en": "Magic School"
      },
      {
        "fr": "Pixel Art Isométrique",
        "en": "Isometric Pixel Art"
      }
    ],
    "platforms": [
      "PC",
      "Consoles"
    ],
    "steamUrl": "https://store.steampowered.com/app/1846700/Witchbrook/",
    "description": {
      "fr": "Intégrez une académie de sorcellerie en bord de mer. Suivez vos cours de magie, cultivez des herbes mystiques, personnalisez votre intérieur et nouez des liens avec vos camarades.",
      "en": "Enroll as a witch-in-training at a coastal magical academy. Attend classes, brew potions, cultivate botanical gardens, and forge lasting relationships with townsfolk."
    },
    "highlight": {
      "fr": "Pixel art isométrique d'une minutie spectaculaire par les créateurs de Wargroove et éditeurs de Stardew Valley.",
      "en": "Detailed isometric pixel art craftsmanship by the publishers of Stardew Valley and creators of Wargroove."
    },
    "hypeScore": 94,
    "coverUrl": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1846700/header.jpg"
  },
  {
    "id": "screenbound",
    "title": "Screenbound",
    "developer": "Crescent Moon Games & Almost Human",
    "publisher": "Crescent Moon Games",
    "expectedDate": {
      "fr": "Fin 2026 / 2027",
      "en": "Late 2026 / 2027"
    },
    "genres": [
      {
        "fr": "Puzzle Platformer 5D",
        "en": "5D Puzzle Platformer"
      },
      {
        "fr": "Hybride 2D / 3D",
        "en": "2D / 3D Hybrid"
      }
    ],
    "platforms": [
      "PC",
      "Consoles"
    ],
    "steamUrl": "https://store.steampowered.com/app/2805070/Screenbound/",
    "description": {
      "fr": "Un concept de gameplay révolutionnaire : vous avancez simultanément en vue subjective 3D dans le monde réel et en 2D sur l'écran d'une console rétro portable entre vos mains.",
      "en": "A dual-dimensional platformer where you navigate simultaneously in 3D first-person while playing in 2D on a handheld console screen inside the game."
    },
    "highlight": {
      "fr": "Un puzzle game dimensionnel inventif salué pour son audace de game design.",
      "en": "An inventive dimensional concept celebrated across indie showcases for genuine gameplay innovation."
    },
    "hypeScore": 93,
    "coverUrl": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2805070/header.jpg"
  },
  {
    "id": "grave-seasons",
    "title": "Grave Seasons",
    "developer": "Perfect Garbage",
    "publisher": "Perfect Garbage",
    "expectedDate": {
      "fr": "2026",
      "en": "2026"
    },
    "genres": [
      {
        "fr": "Ferme & Enquête",
        "en": "Farming & Mystery"
      },
      {
        "fr": "Horreur Surnaturelle",
        "en": "Supernatural Horror"
      },
      {
        "fr": "Pixel Art",
        "en": "Pixel Art"
      }
    ],
    "platforms": [
      "PC"
    ],
    "steamUrl": "https://store.steampowered.com/app/3255110/Grave_Seasons/",
    "description": {
      "fr": "Un simulateur de vie rurale et agricole chaleureux où un tueur en série sévit dans l'ombre et élimine un habitant à chaque saison. Gérez votre ferme tout en menant l'enquête.",
      "en": "A charming farming life simulator set in a picturesque town where a supernatural serial killer strikes once per season. Grow crops and solve town mysteries before it is too late."
    },
    "highlight": {
      "fr": "Rencontre surprenante entre la douceur d'un cozy game et l'angoisse d'un thriller criminel.",
      "en": "A dark, addictive blend of cozy agricultural routines and high-stakes serial killer investigation."
    },
    "hypeScore": 92,
    "coverUrl": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3255110/header.jpg"
  },
  {
    "id": "judas",
    "title": "Judas",
    "developer": "Ghost Story Games",
    "publisher": "Take-Two Interactive",
    "expectedDate": {
      "fr": "Prochainement",
      "en": "Prochainement"
    },
    "genres": [
      {
        "fr": "FPS Narratif",
        "en": "Narrative FPS"
      },
      {
        "fr": "Immersive Sim",
        "en": "Immersive Sim"
      },
      {
        "fr": "Sci-Fi",
        "en": "Sci-Fi"
      }
    ],
    "platforms": [
      "PC",
      "PlayStation 5",
      "Xbox Series X/S"
    ],
    "steamUrl": "https://store.steampowered.com/app/388860/Judas/",
    "description": {
      "fr": "Dirigé par Ken Levine, créateur de BioShock et System Shock 2. Échappez à un vaisseau spatial en perdition où chaque décision et alliance forge une narration organique sur mesure.",
      "en": "Directed by Ken Levine (BioShock, System Shock 2). Escape a disintegrating starship where your decisions, rivalries, and alliances dynamically reshape the narrative."
    },
    "highlight": {
      "fr": "Le concept de « LEGO narratifs » de Ken Levine pour une liberté narrative inédite.",
      "en": "Ken Levine's \"narrative LEGOs\" architecture delivering responsive, player-driven immersive simulation."
    },
    "hypeScore": 95,
    "coverUrl": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/388860/header.jpg"
  },
  {
    "id": "nivalis",
    "title": "Nivalis",
    "developer": "ION LANDS",
    "publisher": "505 Games",
    "expectedDate": {
      "fr": "Automne 2026",
      "en": "Fall 2026"
    },
    "genres": [
      {
        "fr": "Simulation de Vie",
        "en": "Life Sim"
      },
      {
        "fr": "Cyberpunk",
        "en": "Cyberpunk"
      },
      {
        "fr": "Gestion & Aventure",
        "en": "Management & Adventure"
      }
    ],
    "platforms": [
      "PC"
    ],
    "steamUrl": "https://store.steampowered.com/app/1488490/Nivalis/",
    "description": {
      "fr": "Par les créateurs de Cloudpunk. Développez votre commerce, gérez des restaurants et boîtes de nuit dans la métropole cyberpunk de Nivalis, liez des amitiés et explorez la ville.",
      "en": "From the makers of Cloudpunk. Grow your business, manage restaurants and nightclubs in the cyberpunk city of Nivalis, make friends and explore the vertical metropolis."
    },
    "highlight": {
      "fr": "Un simulateur de vie cyberpunk immersif dans un univers vertical somptueux.",
      "en": "An immersive slice-of-life cyberpunk simulation set in a stunning vertical metropolis."
    },
    "hypeScore": 95,
    "coverUrl": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1488490/header.jpg"
  }
];
