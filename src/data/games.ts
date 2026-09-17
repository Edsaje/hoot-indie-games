import type { Game } from '../types/game';

export const INDIE_GAMES: Game[] = [
  {
    id: 'hollow-knight',
    title: 'Hollow Knight',
    releaseYear: 2017,
    genre: ['Metroidvania', 'Action', 'Souls-like', 'Platformer'],
    artStyle: {
      fr: 'Dessiné à la main en 2D',
      en: '2D Hand-drawn',
    },
    camera: {
      fr: 'Vue de côté 2D (Side-scroller)',
      en: '2D Side-scroller',
    },
    developer: 'Team Cherry',
    steamUrl: 'https://store.steampowered.com/app/367520/Hollow_Knight/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/367520/ss_868f763f9104fa2e558832a8dd936cb077e685f0.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/367520/ss_9107ffdc69c3a30c52eb4be1c6cc8c4b794fbd81.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/367520/ss_e1e5b8d2bbfa8d4389069d3e8a4a58eb6b7858c2.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/367520/ss_a43e49df9c9164287c2b3dc10b1069b22a0bb8ad.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/367520/ss_96eef667a4216e4fae7592cf1eef4f954316d5ba.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Explorez un vaste royaume en ruine peuplé d\'insectes et de héros oubliés.',
        en: 'Forge your own path in Hollow Knight! An epic action adventure through a vast ruined kingdom of insects.',
      },
      composer: 'Christopher Larkin',
    },
  },
  {
    id: 'celeste',
    title: 'Celeste',
    releaseYear: 2018,
    genre: ['Platformer', 'Precision', 'Aventure', 'Récit'],
    artStyle: {
      fr: 'Pixel Art rétro soigné',
      en: 'Crisp Retro Pixel Art',
    },
    camera: {
      fr: 'Vue de côté 2D (Side-scroller)',
      en: '2D Side-scroller',
    },
    developer: 'Maddy Makes Games',
    steamUrl: 'https://store.steampowered.com/app/504230/Celeste/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/504230/ss_fa73b438258296eb4cbb7928e3b08e2ecadba9ee.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/504230/ss_ef79ee5e11400d7fb4936d93e87fc4dcad30d5b4.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/504230/ss_d36bfa5880d75c3dbb90875e54d89617255169a8.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/504230/ss_89ca05256e2eb9b6cebcda7c29ae82136a546ce3.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/504230/ss_598007ae08f237bfb1cf8f600f723650170a417a.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/504230/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Aidez Madeline à gravir une montagne mystique tout en affrontant ses démons intérieurs.',
        en: 'Help Madeline survive her inner demons on her journey to the top of Celeste Mountain.',
      },
      composer: 'Lena Raine',
    },
  },
  {
    id: 'outer-wilds',
    title: 'Outer Wilds',
    releaseYear: 2019,
    genre: ['Exploration', 'Mystère', 'Sci-Fi', 'Puzzle'],
    artStyle: {
      fr: '3D Stylisée & Planétaire',
      en: 'Stylized 3D & Planetary',
    },
    camera: {
      fr: 'Vue à la première personne (FPS)',
      en: 'First Person (FPS)',
    },
    developer: 'Mobius Digital',
    steamUrl: 'https://store.steampowered.com/app/753640/Outer_Wilds/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/753640/ss_4996fbcefcfa11b069d511516e87754eb5e7096e.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/753640/ss_c7c4904eb12d46e01a884ec8136ff9c3a372eb06.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/753640/ss_e1e12ea993f39a7970d49479b007887aa85467ef.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/753640/ss_a1e5052994474775e5331ae0a0f67caae0d8ebf9.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/753640/ss_694cf6e1d51c4a4e12c1c6e1c79caadbe92e1069.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/753640/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Un système solaire pris au piège d\'une boucle temporelle sans fin de 22 minutes.',
        en: 'A hand-crafted solar system trapped in an endless 22-minute time loop.',
      },
      composer: 'Andrew Prahlow',
    },
  },
  {
    id: 'hades',
    title: 'Hades',
    releaseYear: 2020,
    genre: ['Roguelike', 'Action RPG', 'Hack and Slash', 'Mythologie'],
    artStyle: {
      fr: 'Dessin Isométrique peint à la main',
      en: 'Hand-painted Isometric 2D/3D',
    },
    camera: {
      fr: 'Vue Isométrique 3D',
      en: 'Isometric 3D',
    },
    developer: 'Supergiant Games',
    steamUrl: 'https://store.steampowered.com/app/1145360/Hades/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/ss_164b36fa33c2a9ec6ca495d4d39f4ad164e26ee7.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/ss_493c0fec44a30e84b54e3d368e7ec89f41df5bc2.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/ss_7be9719eb79bb410b0a562ef674a22ad3fb936d6.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/ss_ff68ce49ea3aa5a1a1f044bbd2df807353f47e30.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/ss_09904323672ea4fc69317d722dbfc05d0458b297.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Défiez le dieu des Enfers et frayez-vous un chemin vers la surface.',
        en: 'Defy the god of the dead as you hack and slash out of the Underworld of Greek myth.',
      },
      composer: 'Darren Korb',
    },
  },
  {
    id: 'dead-cells',
    title: 'Dead Cells',
    releaseYear: 2018,
    genre: ['Roguelite', 'Metroidvania', 'Action', 'Souls-lite'],
    artStyle: {
      fr: 'Pixel Art 2.5D dynamique',
      en: 'Dynamic 2.5D Pixel Art',
    },
    camera: {
      fr: 'Vue de côté 2D (Side-scroller)',
      en: '2D Side-scroller',
    },
    developer: 'Motion Twin',
    steamUrl: 'https://store.steampowered.com/app/588650/Dead_Cells/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/588650/ss_055fa053267d643d9c72f7ad4bc81d68377cb761.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/588650/ss_0d10c1f54cfebbeeaaeae2bf80b2a59a7fdbdbf0.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/588650/ss_5d6dafc02187b5bccecf6b509d3c52e46b328131.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/588650/ss_b831fa4358a9e64e5256e6bf4ea69a1ff099eaee.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/588650/ss_d44e5fae5ffeb68e1a1796d1354bb4a6433e387f.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/588650/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Tuez, mourez, apprenez, recommencez dans un château labyrinthique en perpétuelle mutation.',
        en: 'Kill, die, learn, repeat. A rogue-lite, metroidvania action-platformer.',
      },
      composer: 'Yoann Laulan',
    },
  },
  {
    id: 'undertale',
    title: 'Undertale',
    releaseYear: 2015,
    genre: ['RPG', 'Bullet Hell', 'Narratif', 'Comédie'],
    artStyle: {
      fr: 'Pixel Art rétro 8-bit & Noir/Blanc',
      en: '8-bit Retro Pixel Art',
    },
    camera: {
      fr: 'Vue du dessus 2D (Top-down)',
      en: '2D Top-down',
    },
    developer: 'tobyfox',
    steamUrl: 'https://store.steampowered.com/app/391540/Undertale/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/391540/ss_75e8d890cf2c68a4b3d7967b66a50e932bce37bb.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/391540/ss_f8a00259f51fc8931168ad08c5c7d1e07b587cf5.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/391540/ss_91e0a297926e85501ae13768d60124caae4b29bb.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/391540/ss_5bbd5668ef19c3514a6026a798993f3c3065da4a.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/391540/ss_c7df0e02ebbe7f67724a7ba31379f8feef7eb3d0.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/391540/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Le RPG où vous n\'êtes pas obligé de tuer qui que ce soit.',
        en: 'The RPG game where you don\'t have to destroy anyone.',
      },
      composer: 'Toby Fox',
    },
  },
  {
    id: 'slay-the-spire',
    title: 'Slay the Spire',
    releaseYear: 2019,
    genre: ['Roguelike', 'Deckbuilder', 'Stratégie', 'Cartes'],
    artStyle: {
      fr: 'Illustration 2D Peinte',
      en: '2D Painted Illustration',
    },
    camera: {
      fr: 'Vue de profil 2D fixe',
      en: '2D Frontal Combat View',
    },
    developer: 'Mega Crit Games',
    steamUrl: 'https://store.steampowered.com/app/646570/Slay_the_Spire/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/646570/ss_5f58c70e01764619d8544d6dbdb91c953ae2ea70.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/646570/ss_20b5e396ba2f58be6107b7b134d1cfcfc8c50533.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/646570/ss_49fc8466b03ebc3b6f29420790e6677f5f4ef035.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/646570/ss_56cb6715fbc74d812c3f05ad42caeb1aa37ebfd5.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/646570/ss_602b9e658ecdd3552097e3a9686007b8b42247bc.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/646570/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Fusionnez jeu de cartes et roguelike pour concevoir le deck ultime et gravir la Flèche.',
        en: 'Craft a unique deck, encounter bizarre creatures, discover relics of immense power, and Slay the Spire!',
      },
      composer: 'Clark Aboud',
    },
  },
  {
    id: 'tunic',
    title: 'Tunic',
    releaseYear: 2022,
    genre: ['Action', 'Aventure', 'Puzzle', 'Souls-lite'],
    artStyle: {
      fr: '3D Low-poly Isométrique éclatante',
      en: 'Vibrant Low-poly Isometric 3D',
    },
    camera: {
      fr: 'Vue Isométrique 3D',
      en: 'Isometric 3D',
    },
    developer: 'Andrew Shouldice',
    steamUrl: 'https://store.steampowered.com/app/553420/TUNIC/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/553420/ss_37a1f592477383a18a54d6fc48bc9614f85e49cf.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/553420/ss_16ca74378f8ff4b830d93be7839ec9bce768656d.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/553420/ss_1c6cb9916ec0e0c03b1236fb6552431fa1a2c3a5.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/553420/ss_2c0d8328bf5858cfd7be875e533c3f9154f24f5c.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/553420/ss_19139589d825dd67746fa0d15197f805a5a1e2f9.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/553420/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Explorez une contrée de légendes oubliées en reconstituant le manuel d\'instructions du jeu.',
        en: 'Explore a land filled with lost legends, ancient powers, and ferocious monsters with an in-game manual.',
      },
      composer: 'Lifeformed & Janice Kwan',
    },
  },
  {
    id: 'cuphead',
    title: 'Cuphead',
    releaseYear: 2017,
    genre: ['Action', 'Run and Gun', 'Boss Rush', 'Co-op'],
    artStyle: {
      fr: 'Animation traditionnelle style années 1930',
      en: '1930s Traditional Hand-drawn Cartoon',
    },
    camera: {
      fr: 'Vue de côté 2D (Side-scroller)',
      en: '2D Side-scroller',
    },
    developer: 'Studio MDHR',
    steamUrl: 'https://store.steampowered.com/app/268910/Cuphead/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/268910/ss_911ce20f864e2621748259d81d2db40ec0a0ba61.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/268910/ss_b8fc17b439c3c1ca75635c15ee4e366b595b1e06.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/268910/ss_f8bfad73ae2c4bb47f9a8cb40428c946e382d6c1.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/268910/ss_544e3cb41b9d4f9bf34fca240f2f3e8271e16c90.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/268910/ss_4905a8f0a0e5b9826f5d5351e3c233cba799c922.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/268910/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Remboursez votre dette envers le Diable dans un cartoon interactif frénétique.',
        en: 'A classic run and gun action game heavily focused on boss battles, inspired by 1930s cartoons.',
      },
      composer: 'Kristofer Maddigan',
    },
  },
  {
    id: 'disco-elysium',
    title: 'Disco Elysium',
    releaseYear: 2019,
    genre: ['RPG', 'Narratif', 'Enquête', 'Psychologie'],
    artStyle: {
      fr: 'Peinture à l\'huile expressionniste Isométrique',
      en: 'Expressionist Oil Painting Isometric',
    },
    camera: {
      fr: 'Vue Isométrique 3D',
      en: 'Isometric 3D',
    },
    developer: 'ZA/UM',
    steamUrl: 'https://store.steampowered.com/app/632470/Disco_Elysium/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/632470/ss_b83141103fdf56f9166da2018ea69894e6cb9515.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/632470/ss_c5d9a9cbba05e83ec6c2b1e8471c26c117d69b92.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/632470/ss_07981b2a95c967675fa8ea97a9f95f417f7b309e.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/632470/ss_26e7a6b0c20a48d88fa7b2cb1e3dc32d84422e86.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/632470/ss_9fe811807d885a53930b8c634047d13b418a0a65.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/632470/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Incarnez un détective amnésique doté d\'un système de compétences psychologiques unique.',
        en: 'A groundbreaking open world role playing game. You\'re a detective with a unique skill system.',
      },
      composer: 'British Sea Power',
    },
  },
  {
    id: 'inscryption',
    title: 'Inscryption',
    releaseYear: 2021,
    genre: ['Roguelike', 'Deckbuilder', 'Horreur', 'Escape Game'],
    artStyle: {
      fr: '3D Rétro Sombre & Cartes en bois',
      en: 'Dark Retro 3D & Woodblock Cards',
    },
    camera: {
      fr: 'Vue à la première personne (FPS)',
      en: 'First Person (FPS)',
    },
    developer: 'Daniel Mullins Games',
    steamUrl: 'https://store.steampowered.com/app/1092790/Inscryption/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1092790/ss_868b4226ba5cb830c2c31e9c20aa19aa36a7ea4b.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1092790/ss_d7d6f54c9f131da4a0375a02568ea4cefb1b83df.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1092790/ss_752a78122d250325066dc10ae950a7b4f2c9ef89.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1092790/ss_f6efd55737dc1e8284534e62dc6990d0b7d7aa79.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1092790/ss_2644ff7284b395d985a97bc8a7cf282b0d771037.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1092790/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Une odyssée noire à base de cartes qui mêle roguelike, puzzles et horreur psychologique.',
        en: 'An inky black card-based odyssey that blends the deckbuilding roguelike, escape-room style puzzles, and psychological horror.',
      },
      composer: 'Jonah Senzel',
    },
  },
  {
    id: 'stardew-valley',
    title: 'Stardew Valley',
    releaseYear: 2016,
    genre: ['Simulation', 'RPG', 'Farming', 'Artisanat'],
    artStyle: {
      fr: 'Pixel Art bucolique 16-bit',
      en: 'Charming 16-bit Pixel Art',
    },
    camera: {
      fr: 'Vue du dessus 2D (Top-down)',
      en: '2D Top-down',
    },
    developer: 'ConcernedApe',
    steamUrl: 'https://store.steampowered.com/app/413150/Stardew_Valley/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/ss_37a91689dfbbba16dfaa0d226a27e02e23075677.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/ss_8217bb3a0b5f13d806d20875c75bf69f104d49d9.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/ss_df94d216fe0290b2b8006bf203ea5ebba285746b.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/ss_89daecf701c385566ee2682df6a0b7692e105e4b.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/ss_6dc03fce5fe283f6f1680abcf4ebc3d790d96525.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Héritez de la vieille parcelle agricole de votre grand-père et apprenez à vivre de la terre.',
        en: 'You\'ve inherited your grandfather\'s old farm plot in Stardew Valley. Can you learn to live off the land?',
      },
      composer: 'ConcernedApe',
    },
  },
  {
    id: 'subnautica',
    title: 'Subnautica',
    releaseYear: 2018,
    genre: ['Survie', 'Exploration', 'Sous-marin', 'Sci-Fi'],
    artStyle: {
      fr: '3D Réaliste & Bioluminescente',
      en: 'Vibrant Bioluminescent 3D',
    },
    camera: {
      fr: 'Vue à la première personne (FPS)',
      en: 'First Person (FPS)',
    },
    developer: 'Unknown Worlds Entertainment',
    steamUrl: 'https://store.steampowered.com/app/264710/Subnautica/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/264710/ss_3a6a9be59e9a4bb3c1ae110b6562ba76579b12a8.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/264710/ss_752a1baefc4ca1fc746f33c06d814c8d5045ea7c.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/264710/ss_4955b41cf434e7f8b965c71d9d83d1fe5ee36b28.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/264710/ss_34f6e4a2e5c8e3ca91094ea8e7b16524ca9ebbf7.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/264710/ss_efb4592ca07b0493b86cb4886616a695e0c609df.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/264710/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Plongez dans les profondeurs d\'un monde océanique extraterrestre fascinant et périlleux.',
        en: 'Descend into the depths of an alien underwater world filled with wonder and peril.',
      },
      composer: 'Simon Chylinski',
    },
  },
  {
    id: 'balatro',
    title: 'Balatro',
    releaseYear: 2024,
    genre: ['Roguelike', 'Deckbuilder', 'Poker', 'Stratégie'],
    artStyle: {
      fr: 'Pixel Art CRT Rétro & Holographique',
      en: 'Retro CRT Pixel Art & Holographic',
    },
    camera: {
      fr: 'Vue de dessus 2D (Top-down)',
      en: '2D Top-down',
    },
    developer: 'LocalThunk',
    steamUrl: 'https://store.steampowered.com/app/2379780/Balatro/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/2379780/ss_5d774f9d2d8cb30bf04f7cbe8078ef3a4b64f9ef.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/2379780/ss_9c8ca17945d81cb4e4fce5ad9fa345cbbeabf0c3.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/2379780/ss_e15112cb927bb8cffaf21cbbd42531e2840ff636.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/2379780/ss_963b652bb113f3dbcb9cbb5aa3f350c39f0469b8.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/2379780/ss_9b96eb9753c15aa1f9dbb900eb4d7d9e87595309.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/2379780/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Le roguelike de poker hypnotique où vous combinez jokers farfelus et multiplicateurs explosifs.',
        en: 'The poker roguelike. Balatro is a hypnotically satisfying deckbuilder where you play illegal poker hands.',
      },
      composer: 'LouisF',
    },
  },
  {
    id: 'animal-well',
    title: 'Animal Well',
    releaseYear: 2024,
    genre: ['Metroidvania', 'Puzzle', 'Atmosphérique', 'Exploration'],
    artStyle: {
      fr: 'Pixel Art Néon dense & Effets volumétriques',
      en: 'Dense Neon Pixel Art & Volumetric Lighting',
    },
    camera: {
      fr: 'Vue de côté 2D (Side-scroller)',
      en: '2D Side-scroller',
    },
    developer: 'Shared Memory',
    steamUrl: 'https://store.steampowered.com/app/813230/ANIMAL_WELL/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/813230/ss_a5957d19e0a29486c738e4a9081e4b9bbd05fe31.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/813230/ss_493f06e90299f1165319f71c4cce8f0c976f3f01.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/813230/ss_93beab90c563e46c764a8eb9c661ef4b8981f4a9.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/813230/ss_2d95a56763aa875f564f8ca8be114e9f78eaecb4.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/813230/ss_81e18bc2536b068e8e77519ff09c06634d0b04c8.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/813230/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Explorez un labyrinthe dense et énigmatique dissimulant d\'innombrables secrets emboîtés.',
        en: 'Hatch from a flower and explore the labyrinthine world of ANIMAL WELL.',
      },
      composer: 'Billy Basso',
    },
  },
  {
    id: 'sea-of-stars',
    title: 'Sea of Stars',
    releaseYear: 2023,
    genre: ['RPG', 'Tour par tour', 'Aventure', 'Rétro'],
    artStyle: {
      fr: 'Pixel Art Moderne Haute Définition',
      en: 'Modern High-Definition Pixel Art',
    },
    camera: {
      fr: 'Vue Isométrique / Plongée 2D',
      en: 'Top-down / Isometric 2D',
    },
    developer: 'Sabotage Studio',
    steamUrl: 'https://store.steampowered.com/app/1244090/Sea_of_Stars/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1244090/ss_5a49ca8cbf7f87178051755ee0a82b95b866c1f1.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1244090/ss_e95267be85aeef3294314e30018f6d6c62c26f0c.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1244090/ss_8716bceb7f14b6fc70c1cb336183ef999b70b55a.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1244090/ss_75e21fbfaebfe7876a3d93b39fbfa7f2ef8bc164.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1244090/ss_40cfebce1c56f8f172551cf18b5cf3c95a09289d.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1244090/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Deux Enfants du Solstice combinent les pouvoirs du soleil et de la lune pour vaincre le Fleshmancer.',
        en: 'Sea of Stars is a turn-based RPG inspired by the classics, featuring seamless exploration and timed hits.',
      },
      composer: 'Eric W. Brown & Yasunori Mitsuda',
    },
  },
  {
    id: 'blasphemous',
    title: 'Blasphemous',
    releaseYear: 2019,
    genre: ['Metroidvania', 'Souls-like', 'Action', 'Dark Fantasy'],
    artStyle: {
      fr: 'Pixel Art Gothique baroque',
      en: 'Baroque Gothic Pixel Art',
    },
    camera: {
      fr: 'Vue de côté 2D (Side-scroller)',
      en: '2D Side-scroller',
    },
    developer: 'The Game Kitchen',
    steamUrl: 'https://store.steampowered.com/app/774360/Blasphemous/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/774360/ss_a5a7dc788fc23f663fe57e937d7a5b3a3c1a8e1b.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/774360/ss_89eb4257121287941011dcebbf7b8979e83e5a55.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/774360/ss_efb4592ca07b0493b86cb4886616a695e0c609df.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/774360/ss_6eaef7e98a1f76cf8b2b9f36f6d2f976a4dfc08b.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/774360/ss_a7c8be21fb7a641a9cb3a59daebfb4c58cf35b44.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/774360/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Incarnez le Pénitent dans les terres maudites de Cvstodia et brisez le cycle éternel de la douleur.',
        en: 'A punishing action-platformer that combines fast-paced, skilled combat with a deep and evocative narrative.',
      },
      composer: 'Carlos Viola',
    },
  },
  {
    id: 'ori-and-the-blind-forest',
    title: 'Ori and the Blind Forest',
    releaseYear: 2015,
    genre: ['Metroidvania', 'Platformer', 'Aventure', 'Féérique'],
    artStyle: {
      fr: 'Peinture 2D Féérique & Effets de Particules',
      en: 'Fairytale 2D Painterly & Particles',
    },
    camera: {
      fr: 'Vue de côté 2D (Side-scroller)',
      en: '2D Side-scroller',
    },
    developer: 'Moon Studios',
    steamUrl: 'https://store.steampowered.com/app/387290/Ori_and_the_Blind_Forest_Definitive_Edition/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/387290/ss_81b37651a7b4578b5e525ae7d9d832448378c74d.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/387290/ss_91e0a297926e85501ae13768d60124caae4b29bb.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/387290/ss_164b36fa33c2a9ec6ca495d4d39f4ad164e26ee7.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/387290/ss_37a91689dfbbba16dfaa0d226a27e02e23075677.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/387290/ss_07981b2a95c967675fa8ea97a9f95f417f7b309e.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/387290/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Restaurez la forêt mourante de Nibel avec l\'aide de la lumière ancestrale.',
        en: 'The forest of Nibel is dying. After a powerful storm sets a series of devastating events in motion, Ori must journey.',
      },
      composer: 'Gareth Coker',
    },
  },
  {
    id: 'signalis',
    title: 'Signalis',
    releaseYear: 2022,
    genre: ['Survival Horror', 'Psychologique', 'Sci-Fi', 'Rétro'],
    artStyle: {
      fr: '3D Rétro Low-poly PS1 & Anime',
      en: 'Retro PS1 Low-poly 3D & Anime',
    },
    camera: {
      fr: 'Vue Isométrique / Plongée 2D',
      en: 'Top-down / Isometric',
    },
    developer: 'rose-engine',
    steamUrl: 'https://store.steampowered.com/app/1262350/SIGNALIS/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1262350/ss_94229415c1e34df4e67277eefce2632b85fa1b66.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1262350/ss_ea4ea25d886fa31eeabac6504a75aa882c943806.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1262350/ss_2a5aa44ff7fc3f0bc333c1f24d777651a5e1ae77.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1262350/ss_69e4c1945f44e1837fcfc258d4a960fb5ce110c7.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1262350/ss_754bf28488e17812ec56fb2b4923f66ccefa935f.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1262350/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Un survival-horror psychologique dystopique empreint d\'une angoisse cosmique et de mélancolie.',
        en: 'A classic survival horror experience set in a dystopian future where humanity has uncovered a dark secret.',
      },
      composer: '1000 Eyes & Cicada Sirens',
    },
  },
  {
    id: 'dave-the-diver',
    title: 'Dave the Diver',
    releaseYear: 2023,
    genre: ['Aventure', 'Gestion', 'Simulation', 'Pêche'],
    artStyle: {
      fr: 'Hybride Pixel Art & Décors 3D',
      en: 'Hybrid Pixel Art & 3D Environments',
    },
    camera: {
      fr: 'Vue de côté 2D (Side-scroller)',
      en: '2D Side-scroller',
    },
    developer: 'MINTROCKET',
    steamUrl: 'https://store.steampowered.com/app/1868140/DAVE_THE_DIVER/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1868140/ss_f8f10640df483aa3ae1908bf41164ebfeefcfd61.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1868140/ss_d497c366ff5bc4e5ba8489cf3066367332f1465e.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1868140/ss_31c81ef447ff7a8848d5b8ff303ef252f4a47683.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1868140/ss_4955b41cf434e7f8b965c71d9d83d1fe5ee36b28.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1868140/ss_164b36fa33c2a9ec6ca495d4d39f4ad164e26ee7.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1868140/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Explorez le trou bleu le jour et servez des sushis d\'exception le soir.',
        en: 'A casual, single-player adventure RPG featuring deep-sea exploration and fishing during the day, and sushi restaurant management at night.',
      },
      composer: 'Dday',
    },
  },
  {
    id: 'nine-sols',
    title: 'Nine Sols',
    releaseYear: 2024,
    genre: ['Metroidvania', 'Action', 'Souls-like', 'Taopunk'],
    artStyle: {
      fr: 'Dessin animé Taopunk fait main',
      en: 'Hand-drawn Taopunk Manga 2D',
    },
    camera: {
      fr: 'Vue de côté 2D (Side-scroller)',
      en: '2D Side-scroller',
    },
    developer: 'Red Candle Games',
    steamUrl: 'https://store.steampowered.com/app/1809540/Nine_Sols/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1809540/ss_868b4226ba5cb830c2c31e9c20aa19aa36a7ea4b.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1809540/ss_752a78122d250325066dc10ae950a7b4f2c9ef89.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1809540/ss_5d774f9d2d8cb30bf04f7cbe8078ef3a4b64f9ef.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1809540/ss_164b36fa33c2a9ec6ca495d4d39f4ad164e26ee7.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1809540/ss_493c0fec44a30e84b54e3d368e7ec89f41df5bc2.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1809540/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Un périple de vengeance taopunk aux combats intenses axés sur la déviation et le rythme.',
        en: 'A lore-rich, hand-drawn 2D action-platformer featuring Sekiro-inspired deflection combat in an Asian fantasy world.',
      },
      composer: 'Red Candle Sound Team',
    },
  },
  {
    id: 'crow-country',
    title: 'Crow Country',
    releaseYear: 2024,
    genre: ['Survival Horror', 'Puzzle', 'Rétro', 'Mystère'],
    artStyle: {
      fr: '3D Low-poly Rétro ère PS1',
      en: 'Retro PS1 Low-poly 3D',
    },
    camera: {
      fr: 'Vue Isométrique 3D libre',
      en: 'Isometric 3D Camera',
    },
    developer: 'SFB Games',
    steamUrl: 'https://store.steampowered.com/app/1996010/Crow_Country/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1996010/ss_94229415c1e34df4e67277eefce2632b85fa1b66.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1996010/ss_ea4ea25d886fa31eeabac6504a75aa882c943806.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1996010/ss_868f763f9104fa2e558832a8dd936cb077e685f0.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1996010/ss_2a5aa44ff7fc3f0bc333c1f24d777651a5e1ae77.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1996010/ss_69e4c1945f44e1837fcfc258d4a960fb5ce110c7.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1996010/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Explorez un parc d\'attractions abandonné et élucidez la disparition mystérieuse d\'Edward Crow.',
        en: 'A survival horror game where you investigate the eerie quiet of an abandoned theme park.',
      },
      composer: 'Tom Vian',
    },
  },
  {
    id: 'pizza-tower',
    title: 'Pizza Tower',
    releaseYear: 2023,
    genre: ['Platformer', 'Fast-paced', 'Comédie', 'Score Attack'],
    artStyle: {
      fr: 'Animation Cartoon 90s déjantée',
      en: 'Zany 90s Cartoon Hand-drawn',
    },
    camera: {
      fr: 'Vue de côté 2D (Side-scroller)',
      en: '2D Side-scroller',
    },
    developer: 'Tour De Pizza',
    steamUrl: 'https://store.steampowered.com/app/2231450/Pizza_Tower/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/2231450/ss_b8fc17b439c3c1ca75635c15ee4e366b595b1e06.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/2231450/ss_911ce20f864e2621748259d81d2db40ec0a0ba61.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/2231450/ss_f8bfad73ae2c4bb47f9a8cb40428c946e382d6c1.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/2231450/ss_544e3cb41b9d4f9bf34fca240f2f3e8271e16c90.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/2231450/ss_4905a8f0a0e5b9826f5d5351e3c233cba799c922.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/2231450/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Sauvez votre pizzeria en détruisant la Tour de Pizza à une vitesse supersonique.',
        en: 'A fast-paced 2D platformer inspired by the Wario Land series, with an emphasis on movement and destruction.',
      },
      composer: 'Ronan de Castel & ClascyJitto',
    },
  },
  {
    id: 'pacific-drive',
    title: 'Pacific Drive',
    releaseYear: 2024,
    genre: ['Survie', 'Conduite', 'Sci-Fi', 'Roguelite'],
    artStyle: {
      fr: '3D Atmosphérique Réaliste & Anomale',
      en: 'Atmospheric Anomaly-Rich 3D',
    },
    camera: {
      fr: 'Vue à la première personne (FPS)',
      en: 'First Person (FPS)',
    },
    developer: 'Ironwood Studios',
    steamUrl: 'https://store.steampowered.com/app/1458140/Pacific_Drive/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1458140/ss_4996fbcefcfa11b069d511516e87754eb5e7096e.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1458140/ss_c7c4904eb12d46e01a884ec8136ff9c3a372eb06.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1458140/ss_e1e12ea993f39a7970d49479b007887aa85467ef.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1458140/ss_a1e5052994474775e5331ae0a0f67caae0d8ebf9.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1458140/ss_694cf6e1d51c4a4e12c1c6e1c79caadbe92e1069.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1458140/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Affrontez les périls surnaturels de la Zone d\'exclusion olympique avec votre break pour seul refuge.',
        en: 'Face the supernatural dangers of the Olympic Exclusion Zone with a car as your only lifeline.',
      },
      composer: 'Wilbert Roget II',
    },
  },
  {
    id: 'katana-zero',
    title: 'Katana Zero',
    releaseYear: 2019,
    genre: ['Action', 'Slash', 'Cyberpunk', 'Récit'],
    artStyle: {
      fr: 'Pixel Art Néon Néo-noir tranchant',
      en: 'Neo-noir Neon Pixel Art',
    },
    camera: {
      fr: 'Vue de côté 2D (Side-scroller)',
      en: '2D Side-scroller',
    },
    developer: 'Askiisoft',
    steamUrl: 'https://store.steampowered.com/app/460950/Katana_ZERO/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/460950/ss_055fa053267d643d9c72f7ad4bc81d68377cb761.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/460950/ss_0d10c1f54cfebbeeaaeae2bf80b2a59a7fdbdbf0.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/460950/ss_5d6dafc02187b5bccecf6b509d3c52e46b328131.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/460950/ss_b831fa4358a9e64e5256e6bf4ea69a1ff099eaee.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/460950/ss_d44e5fae5ffeb68e1a1796d1354bb4a6433e387f.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/460950/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Tranchez, esquivez et manipulez le temps dans un ballet sanglant au katana néo-noir.',
        en: 'A stylish neo-noir, action-platformer featuring breakneck action and instant-death combat.',
      },
      composer: 'LudoWic & Bill Kiley',
    },
  },
  {
    id: 'hotline-miami',
    title: 'Hotline Miami',
    releaseYear: 2012,
    genre: ['Action', 'Brutal', 'Top-down', 'Synthwave'],
    artStyle: {
      fr: 'Pixel Art Psychédélique Rétro 80s',
      en: 'Psychedelic Retro 80s Pixel Art',
    },
    camera: {
      fr: 'Vue du dessus 2D (Top-down)',
      en: '2D Top-down',
    },
    developer: 'Dennaton Games',
    steamUrl: 'https://store.steampowered.com/app/219150/Hotline_Miami/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/219150/ss_75e8d890cf2c68a4b3d7967b66a50e932bce37bb.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/219150/ss_f8a00259f51fc8931168ad08c5c7d1e07b587cf5.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/219150/ss_91e0a297926e85501ae13768d60124caae4b29bb.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/219150/ss_5bbd5668ef19c3514a6026a798993f3c3065da4a.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/219150/ss_c7df0e02ebbe7f67724a7ba31379f8feef7eb3d0.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/219150/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Aimez-vous faire du mal aux autres ? Une fusillade néon sanglante dans le Miami de 1989.',
        en: 'A high-octane action game overflowing with raw brutality, hard-boiled gunplay and skull crushing close combat.',
      },
      composer: 'Moon, Sun Araw & Jasper Byrne',
    },
  },
  {
    id: 'dredge',
    title: 'Dredge',
    releaseYear: 2023,
    genre: ['Pêche', 'Horreur cosmique', 'Aventure', 'Gestion'],
    artStyle: {
      fr: '3D Low-poly Stylisée et Brumeuse',
      en: 'Misty Low-poly Stylized 3D',
    },
    camera: {
      fr: 'Vue Isométrique 3D / Troisième personne',
      en: 'Isometric 3D / Third Person',
    },
    developer: 'Black Salt Games',
    steamUrl: 'https://store.steampowered.com/app/1562430/DREDGE/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1562430/ss_37a1f592477383a18a54d6fc48bc9614f85e49cf.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1562430/ss_16ca74378f8ff4b830d93be7839ec9bce768656d.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1562430/ss_1c6cb9916ec0e0c03b1236fb6552431fa1a2c3a5.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1562430/ss_2c0d8328bf5858cfd7be875e533c3f9154f24f5c.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1562430/ss_19139589d825dd67746fa0d15197f805a5a1e2f9.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1562430/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Pilotez votre chalutier, pêchez des créatures sous-marines et bravez les abominations de la nuit.',
        en: 'A single-player fishing adventure with a sinister undercurrent.',
      },
      composer: 'David Webster',
    },
  },
  {
    id: 'chants-of-sennaar',
    title: 'Chants of Sennaar',
    releaseYear: 2023,
    genre: ['Puzzle', 'Aventure', 'Linguistique', 'Exploration'],
    artStyle: {
      fr: 'Ligne claire inspirée de Moebius',
      en: 'Moebius-inspired European Ligne Claire',
    },
    camera: {
      fr: 'Vue Isométrique 3D fixe',
      en: 'Fixed Isometric 3D',
    },
    developer: 'Rundisc',
    steamUrl: 'https://store.steampowered.com/app/1931770/Chants_of_Sennaar/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1931770/ss_5a49ca8cbf7f87178051755ee0a82b95b866c1f1.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1931770/ss_e95267be85aeef3294314e30018f6d6c62c26f0c.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1931770/ss_8716bceb7f14b6fc70c1cb336183ef999b70b55a.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1931770/ss_75e21fbfaebfe7876a3d93b39fbfa7f2ef8bc164.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1931770/ss_40cfebce1c56f8f172551cf18b5cf3c95a09289d.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1931770/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Déchiffrez d\'anciens glyphes et réunissez les peuples de la Tour de Babel.',
        en: 'Unravel mysteries across the Tower of Babel by deciphering ancient languages.',
      },
      composer: 'Thomas Brunet',
    },
  },
  {
    id: 'a-short-hike',
    title: 'A Short Hike',
    releaseYear: 2019,
    genre: ['Aventure', 'Exploration', 'Cozy', 'Vol'],
    artStyle: {
      fr: 'Pixel Art 3D Doux & Pastel',
      en: 'Pastel Pixelated 3D',
    },
    camera: {
      fr: 'Vue Isométrique 3D / Plongée',
      en: 'Top-down / Isometric 3D',
    },
    developer: 'adamgryu',
    steamUrl: 'https://store.steampowered.com/app/1055540/A_Short_Hike/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1055540/ss_37a91689dfbbba16dfaa0d226a27e02e23075677.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1055540/ss_8217bb3a0b5f13d806d20875c75bf69f104d49d9.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1055540/ss_df94d216fe0290b2b8006bf203ea5ebba285746b.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1055540/ss_89daecf701c385566ee2682df6a0b7692e105e4b.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1055540/ss_6dc03fce5fe283f6f1680abcf4ebc3d790d96525.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1055540/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Randonnez, planez et grimpez jusqu\'au sommet paisible de Hawk Peak Provincial Park.',
        en: 'Hike, climb, and soar through the peaceful mountainside landscapes of Hawk Peak Provincial Park.',
      },
      composer: 'Mark Sparling',
    },
  },
  {
    id: 'fez',
    title: 'Fez',
    releaseYear: 2012,
    genre: ['Puzzle', 'Platformer', 'Perspective', 'Rétro'],
    artStyle: {
      fr: 'Pixel Art 2D cubique dans un monde 3D',
      en: '2D Pixel Art in a 3D Multiverse',
    },
    camera: {
      fr: 'Vue de profil 2D rotative sur 4 axes',
      en: '2D Rotating Perspective',
    },
    developer: 'Polytron Corporation',
    steamUrl: 'https://store.steampowered.com/app/224760/FEZ/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/224760/ss_fa73b438258296eb4cbb7928e3b08e2ecadba9ee.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/224760/ss_ef79ee5e11400d7fb4936d93e87fc4dcad30d5b4.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/224760/ss_d36bfa5880d75c3dbb90875e54d89617255169a8.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/224760/ss_89ca05256e2eb9b6cebcda7c29ae82136a546ce3.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/224760/ss_598007ae08f237bfb1cf8f600f723650170a417a.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/224760/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Gomez découvre l\'existence d\'une mystérieuse troisième dimension en recevant un fez magique.',
        en: 'Gomez is a 2D creature living in a 2D world until the existence of a mysterious 3rd dimension is revealed to him.',
      },
      composer: 'Disasterpeace',
    },
  },
  {
    id: 'gris',
    title: 'Gris',
    releaseYear: 2018,
    genre: ['Platformer', 'Aventure', 'Émotion', 'Artistique'],
    artStyle: {
      fr: 'Aquarelle Peinte à la Main',
      en: 'Hand-painted Watercolor 2D',
    },
    camera: {
      fr: 'Vue de côté 2D (Side-scroller)',
      en: '2D Side-scroller',
    },
    developer: 'Nomada Studio',
    steamUrl: 'https://store.steampowered.com/app/683320/GRIS/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/683320/ss_81b37651a7b4578b5e525ae7d9d832448378c74d.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/683320/ss_91e0a297926e85501ae13768d60124caae4b29bb.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/683320/ss_164b36fa33c2a9ec6ca495d4d39f4ad164e26ee7.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/683320/ss_37a91689dfbbba16dfaa0d226a27e02e23075677.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/683320/ss_07981b2a95c967675fa8ea97a9f95f417f7b309e.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/683320/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Rendez les couleurs à un monde brisé à travers le deuil d\'une jeune fille pleine d\'espoir.',
        en: 'GRIS is a serene and evocative experience, free of danger, frustration or death.',
      },
      composer: 'Berlinist',
    },
  },
  {
    id: 'darkest-dungeon',
    title: 'Darkest Dungeon',
    releaseYear: 2016,
    genre: ['Roguelike', 'RPG', 'Tour par tour', 'Dark Fantasy'],
    artStyle: {
      fr: 'Comics Gothique encré façon Mignola',
      en: 'Inked Gothic Comic Illustration',
    },
    camera: {
      fr: 'Vue de profil 2D fixe en couloir',
      en: '2D Side Exploration & Combat',
    },
    developer: 'Red Hook Studios',
    steamUrl: 'https://store.steampowered.com/app/262060/Darkest_Dungeon/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/262060/ss_a5a7dc788fc23f663fe57e937d7a5b3a3c1a8e1b.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/262060/ss_89eb4257121287941011dcebbf7b8979e83e5a55.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/262060/ss_efb4592ca07b0493b86cb4886616a695e0c609df.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/262060/ss_6eaef7e98a1f76cf8b2b9f36f6d2f976a4dfc08b.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/262060/ss_a7c8be21fb7a641a9cb3a59daebfb4c58cf35b44.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/262060/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Gérez le stress et la folie de héros meurtris dans les catacombes d\'un manoir maudit.',
        en: 'A challenging gothic roguelike turn-based RPG about the psychological stresses of adventuring.',
      },
      composer: 'Stuart Chatwood',
    },
  },
  {
    id: 'bramble',
    title: 'Bramble: The Mountain King',
    releaseYear: 2023,
    genre: ['Horreur', 'Aventure', 'Folklore', 'Sombre'],
    artStyle: {
      fr: '3D Réaliste Cinématique Nordique',
      en: 'Cinematic Nordic Photorealistic 3D',
    },
    camera: {
      fr: 'Vue à la troisième personne cinématique',
      en: 'Cinematic Third Person',
    },
    developer: 'Dimfrost Studios',
    steamUrl: 'https://store.steampowered.com/app/1623940/Bramble_The_Mountain_King/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1623940/ss_164b36fa33c2a9ec6ca495d4d39f4ad164e26ee7.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1623940/ss_493c0fec44a30e84b54e3d368e7ec89f41df5bc2.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1623940/ss_7be9719eb79bb410b0a562ef674a22ad3fb936d6.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1623940/ss_ff68ce49ea3aa5a1a1f044bbd2df807353f47e30.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1623940/ss_09904323672ea4fc69317d722dbfc05d0458b297.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1623940/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Traversez une terre sinistre inspirée des contes nordiques pour sauver votre sœur d\'un infâme troll.',
        en: 'A grim adventure set in a world inspired by dark, Nordic fables.',
      },
      composer: 'Martin Hall',
    },
  },
  {
    id: 'axiom-verge',
    title: 'Axiom Verge',
    releaseYear: 2015,
    genre: ['Metroidvania', 'Sci-Fi', 'Action', 'Rétro'],
    artStyle: {
      fr: 'Pixel Art 16-bit Biomécanique Rétro',
      en: 'Biomechanical 16-bit CRT Pixel Art',
    },
    camera: {
      fr: 'Vue de côté 2D (Side-scroller)',
      en: '2D Side-scroller',
    },
    developer: 'Thomas Happ Games LLC',
    steamUrl: 'https://store.steampowered.com/app/332200/Axiom_Verge/',
    screenshots: [
      'https://cdn.cloudflare.steamstatic.com/steam/apps/332200/ss_868f763f9104fa2e558832a8dd936cb077e685f0.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/332200/ss_9107ffdc69c3a30c52eb4be1c6cc8c4b794fbd81.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/332200/ss_e1e5b8d2bbfa8d4389069d3e8a4a58eb6b7858c2.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/332200/ss_a43e49df9c9164287c2b3dc10b1069b22a0bb8ad.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/332200/ss_96eef667a4216e4fae7592cf1eef4f954316d5ba.1920x1080.jpg',
      'https://cdn.cloudflare.steamstatic.com/steam/apps/332200/header.jpg',
    ],
    hints: {
      tagline: {
        fr: 'Explorez et débloquez un monde extraterrestre labyrinthique à l\'aide de glitchs et d\'armes biomécaniques.',
        en: 'The retro sci-fi action adventure you\'ve been waiting for, crafted by a solo developer.',
      },
      composer: 'Thomas Happ',
    },
  },
];

// Helper pour retrouver un jeu par son ID
export function getGameById(id: string): Game | undefined {
  return INDIE_GAMES.find((game) => game.id === id);
}

// Fonction pour déterminer le jeu du jour basé sur une date "YYYY-MM-DD"
export function getDailyGame(dateStr: string, modeOffset: number = 0): Game {
  // Hash simple et déterministe
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash + modeOffset) % INDIE_GAMES.length;
  return INDIE_GAMES[index];
}
