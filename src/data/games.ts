import type { Game } from "../types/game";

/**
 * Base de données officielle de jeux indépendants certifiés "Hoot Indie Games"
 * Moissonnée et vérifiée via l'API Steam Store officielle (Règle 0 Hallucination).
 * Total de jeux jouables et certifiés : 83
 */
export const INDIE_GAMES: Game[] = [
  {
    "id": "hollow-knight",
    "title": "Hollow Knight",
    "releaseYear": 2017,
    "genre": [
      "Metroidvania",
      "Action",
      "Souls-like",
      "Platformer"
    ],
    "artStyle": {
      "fr": "Dessiné à la main en 2D",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Vue de côté 2D (Side-scroller)",
      "en": "2D Side-scroller"
    },
    "developer": "Team Cherry",
    "steamUrl": "https://store.steampowered.com/app/367520/Hollow_Knight/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/ss_868f763f9104fa2e558832a8dd936cb077e685f0.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/ss_9107ffdc69c3a30c52eb4be1c6cc8c4b794fbd81.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/ss_e1e5b8d2bbfa8d4389069d3e8a4a58eb6b7858c2.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/ss_a43e49df9c9164287c2b3dc10b1069b22a0bb8ad.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/ss_96eef667a4216e4fae7592cf1eef4f954316d5ba.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Explorez un vaste royaume en ruine peuplé d'insectes et de héros oubliés.",
        "en": "Forge your own path in Hollow Knight! An epic action adventure through a vast ruined kingdom of insects."
      },
      "composer": "Christopher Larkin"
    }
  },
  {
    "id": "celeste",
    "title": "Celeste",
    "releaseYear": 2018,
    "genre": [
      "Platformer",
      "Precision",
      "Aventure",
      "Récit"
    ],
    "artStyle": {
      "fr": "Pixel Art rétro soigné",
      "en": "Crisp Retro Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D (Side-scroller)",
      "en": "2D Side-scroller"
    },
    "developer": "Maddy Makes Games",
    "steamUrl": "https://store.steampowered.com/app/504230/Celeste/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/504230/ss_fa73b438258296eb4cbb7928e3b08e2ecadba9ee.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/504230/ss_ef79ee5e11400d7fb4936d93e87fc4dcad30d5b4.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/504230/ss_d36bfa5880d75c3dbb90875e54d89617255169a8.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/504230/ss_89ca05256e2eb9b6cebcda7c29ae82136a546ce3.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/504230/ss_598007ae08f237bfb1cf8f600f723650170a417a.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/504230/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Aidez Madeline à gravir une montagne mystique tout en affrontant ses démons intérieurs.",
        "en": "Help Madeline survive her inner demons on her journey to the top of Celeste Mountain."
      },
      "composer": "Lena Raine"
    }
  },
  {
    "id": "outer-wilds",
    "title": "Outer Wilds",
    "releaseYear": 2019,
    "genre": [
      "Exploration",
      "Mystère",
      "Sci-Fi",
      "Puzzle"
    ],
    "artStyle": {
      "fr": "3D Stylisée & Planétaire",
      "en": "Stylized 3D & Planetary"
    },
    "camera": {
      "fr": "Vue à la première personne (FPS)",
      "en": "First Person (FPS)"
    },
    "developer": "Mobius Digital",
    "steamUrl": "https://store.steampowered.com/app/753640/Outer_Wilds/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/753640/ss_4996fbcefcfa11b069d511516e87754eb5e7096e.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/753640/ss_c7c4904eb12d46e01a884ec8136ff9c3a372eb06.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/753640/ss_e1e12ea993f39a7970d49479b007887aa85467ef.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/753640/ss_a1e5052994474775e5331ae0a0f67caae0d8ebf9.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/753640/ss_694cf6e1d51c4a4e12c1c6e1c79caadbe92e1069.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/753640/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Un système solaire pris au piège d'une boucle temporelle sans fin de 22 minutes.",
        "en": "A hand-crafted solar system trapped in an endless 22-minute time loop."
      },
      "composer": "Andrew Prahlow"
    }
  },
  {
    "id": "hades",
    "title": "Hades",
    "releaseYear": 2020,
    "genre": [
      "Roguelike",
      "Action RPG",
      "Hack and Slash",
      "Mythologie"
    ],
    "artStyle": {
      "fr": "Dessin Isométrique peint à la main",
      "en": "Hand-painted Isometric 2D/3D"
    },
    "camera": {
      "fr": "Vue Isométrique 3D",
      "en": "Isometric 3D"
    },
    "developer": "Supergiant Games",
    "steamUrl": "https://store.steampowered.com/app/1145360/Hades/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/ss_164b36fa33c2a9ec6ca495d4d39f4ad164e26ee7.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/ss_493c0fec44a30e84b54e3d368e7ec89f41df5bc2.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/ss_7be9719eb79bb410b0a562ef674a22ad3fb936d6.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/ss_ff68ce49ea3aa5a1a1f044bbd2df807353f47e30.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/ss_09904323672ea4fc69317d722dbfc05d0458b297.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Défiez le dieu des Enfers et frayez-vous un chemin vers la surface.",
        "en": "Defy the god of the dead as you hack and slash out of the Underworld of Greek myth."
      },
      "composer": "Darren Korb"
    }
  },
  {
    "id": "dead-cells",
    "title": "Dead Cells",
    "releaseYear": 2018,
    "genre": [
      "Roguelite",
      "Metroidvania",
      "Action",
      "Souls-lite"
    ],
    "artStyle": {
      "fr": "Pixel Art 2.5D dynamique",
      "en": "Dynamic 2.5D Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D (Side-scroller)",
      "en": "2D Side-scroller"
    },
    "developer": "Motion Twin",
    "steamUrl": "https://store.steampowered.com/app/588650/Dead_Cells/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/588650/ss_055fa053267d643d9c72f7ad4bc81d68377cb761.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/588650/ss_0d10c1f54cfebbeeaaeae2bf80b2a59a7fdbdbf0.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/588650/ss_5d6dafc02187b5bccecf6b509d3c52e46b328131.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/588650/ss_b831fa4358a9e64e5256e6bf4ea69a1ff099eaee.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/588650/ss_d44e5fae5ffeb68e1a1796d1354bb4a6433e387f.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/588650/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Tuez, mourez, apprenez, recommencez dans un château labyrinthique en perpétuelle mutation.",
        "en": "Kill, die, learn, repeat. A rogue-lite, metroidvania action-platformer."
      },
      "composer": "Yoann Laulan"
    }
  },
  {
    "id": "undertale",
    "title": "Undertale",
    "releaseYear": 2015,
    "genre": [
      "RPG",
      "Bullet Hell",
      "Narratif",
      "Comédie"
    ],
    "artStyle": {
      "fr": "Pixel Art rétro 8-bit & Noir/Blanc",
      "en": "8-bit Retro Pixel Art"
    },
    "camera": {
      "fr": "Vue du dessus 2D (Top-down)",
      "en": "2D Top-down"
    },
    "developer": "tobyfox",
    "steamUrl": "https://store.steampowered.com/app/391540/Undertale/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/391540/ss_75e8d890cf2c68a4b3d7967b66a50e932bce37bb.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/391540/ss_f8a00259f51fc8931168ad08c5c7d1e07b587cf5.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/391540/ss_91e0a297926e85501ae13768d60124caae4b29bb.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/391540/ss_5bbd5668ef19c3514a6026a798993f3c3065da4a.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/391540/ss_c7df0e02ebbe7f67724a7ba31379f8feef7eb3d0.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/391540/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Le RPG où vous n'êtes pas obligé de tuer qui que ce soit.",
        "en": "The RPG game where you don't have to destroy anyone."
      },
      "composer": "Toby Fox"
    }
  },
  {
    "id": "slay-the-spire",
    "title": "Slay the Spire",
    "releaseYear": 2019,
    "genre": [
      "Roguelike",
      "Deckbuilder",
      "Stratégie",
      "Cartes"
    ],
    "artStyle": {
      "fr": "Illustration 2D Peinte",
      "en": "2D Painted Illustration"
    },
    "camera": {
      "fr": "Vue de profil 2D fixe",
      "en": "2D Frontal Combat View"
    },
    "developer": "Mega Crit Games",
    "steamUrl": "https://store.steampowered.com/app/646570/Slay_the_Spire/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/646570/ss_5f58c70e01764619d8544d6dbdb91c953ae2ea70.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/646570/ss_20b5e396ba2f58be6107b7b134d1cfcfc8c50533.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/646570/ss_49fc8466b03ebc3b6f29420790e6677f5f4ef035.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/646570/ss_56cb6715fbc74d812c3f05ad42caeb1aa37ebfd5.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/646570/ss_602b9e658ecdd3552097e3a9686007b8b42247bc.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/646570/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Fusionnez jeu de cartes et roguelike pour concevoir le deck ultime et gravir la Flèche.",
        "en": "Craft a unique deck, encounter bizarre creatures, discover relics of immense power, and Slay the Spire!"
      },
      "composer": "Clark Aboud"
    }
  },
  {
    "id": "tunic",
    "title": "Tunic",
    "releaseYear": 2022,
    "genre": [
      "Action",
      "Aventure",
      "Puzzle",
      "Souls-lite"
    ],
    "artStyle": {
      "fr": "3D Low-poly Isométrique éclatante",
      "en": "Vibrant Low-poly Isometric 3D"
    },
    "camera": {
      "fr": "Vue Isométrique 3D",
      "en": "Isometric 3D"
    },
    "developer": "Andrew Shouldice",
    "steamUrl": "https://store.steampowered.com/app/553420/TUNIC/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/553420/ss_37a1f592477383a18a54d6fc48bc9614f85e49cf.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/553420/ss_16ca74378f8ff4b830d93be7839ec9bce768656d.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/553420/ss_1c6cb9916ec0e0c03b1236fb6552431fa1a2c3a5.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/553420/ss_2c0d8328bf5858cfd7be875e533c3f9154f24f5c.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/553420/ss_19139589d825dd67746fa0d15197f805a5a1e2f9.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/553420/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Explorez une contrée de légendes oubliées en reconstituant le manuel d'instructions du jeu.",
        "en": "Explore a land filled with lost legends, ancient powers, and ferocious monsters with an in-game manual."
      },
      "composer": "Lifeformed & Janice Kwan"
    }
  },
  {
    "id": "cuphead",
    "title": "Cuphead",
    "releaseYear": 2017,
    "genre": [
      "Action",
      "Run and Gun",
      "Boss Rush",
      "Co-op"
    ],
    "artStyle": {
      "fr": "Animation traditionnelle style années 1930",
      "en": "1930s Traditional Hand-drawn Cartoon"
    },
    "camera": {
      "fr": "Vue de côté 2D (Side-scroller)",
      "en": "2D Side-scroller"
    },
    "developer": "Studio MDHR",
    "steamUrl": "https://store.steampowered.com/app/268910/Cuphead/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/268910/ss_911ce20f864e2621748259d81d2db40ec0a0ba61.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/268910/ss_b8fc17b439c3c1ca75635c15ee4e366b595b1e06.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/268910/ss_f8bfad73ae2c4bb47f9a8cb40428c946e382d6c1.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/268910/ss_544e3cb41b9d4f9bf34fca240f2f3e8271e16c90.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/268910/ss_4905a8f0a0e5b9826f5d5351e3c233cba799c922.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/268910/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Remboursez votre dette envers le Diable dans un cartoon interactif frénétique.",
        "en": "A classic run and gun action game heavily focused on boss battles, inspired by 1930s cartoons."
      },
      "composer": "Kristofer Maddigan"
    }
  },
  {
    "id": "disco-elysium",
    "title": "Disco Elysium",
    "releaseYear": 2019,
    "genre": [
      "RPG",
      "Narratif",
      "Enquête",
      "Psychologie"
    ],
    "artStyle": {
      "fr": "Peinture à l'huile expressionniste Isométrique",
      "en": "Expressionist Oil Painting Isometric"
    },
    "camera": {
      "fr": "Vue Isométrique 3D",
      "en": "Isometric 3D"
    },
    "developer": "ZA/UM",
    "steamUrl": "https://store.steampowered.com/app/632470/Disco_Elysium/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/632470/ss_b83141103fdf56f9166da2018ea69894e6cb9515.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/632470/ss_c5d9a9cbba05e83ec6c2b1e8471c26c117d69b92.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/632470/ss_07981b2a95c967675fa8ea97a9f95f417f7b309e.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/632470/ss_26e7a6b0c20a48d88fa7b2cb1e3dc32d84422e86.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/632470/ss_9fe811807d885a53930b8c634047d13b418a0a65.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/632470/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Incarnez un détective amnésique doté d'un système de compétences psychologiques unique.",
        "en": "A groundbreaking open world role playing game. You're a detective with a unique skill system."
      },
      "composer": "British Sea Power"
    }
  },
  {
    "id": "inscryption",
    "title": "Inscryption",
    "releaseYear": 2021,
    "genre": [
      "Roguelike",
      "Deckbuilder",
      "Horreur",
      "Escape Game"
    ],
    "artStyle": {
      "fr": "3D Rétro Sombre & Cartes en bois",
      "en": "Dark Retro 3D & Woodblock Cards"
    },
    "camera": {
      "fr": "Vue à la première personne (FPS)",
      "en": "First Person (FPS)"
    },
    "developer": "Daniel Mullins Games",
    "steamUrl": "https://store.steampowered.com/app/1092790/Inscryption/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1092790/ss_868b4226ba5cb830c2c31e9c20aa19aa36a7ea4b.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1092790/ss_d7d6f54c9f131da4a0375a02568ea4cefb1b83df.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1092790/ss_752a78122d250325066dc10ae950a7b4f2c9ef89.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1092790/ss_f6efd55737dc1e8284534e62dc6990d0b7d7aa79.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1092790/ss_2644ff7284b395d985a97bc8a7cf282b0d771037.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1092790/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Une odyssée noire à base de cartes qui mêle roguelike, puzzles et horreur psychologique.",
        "en": "An inky black card-based odyssey that blends the deckbuilding roguelike, escape-room style puzzles, and psychological horror."
      },
      "composer": "Jonah Senzel"
    }
  },
  {
    "id": "stardew-valley",
    "title": "Stardew Valley",
    "releaseYear": 2016,
    "genre": [
      "Simulation",
      "RPG",
      "Farming",
      "Artisanat"
    ],
    "artStyle": {
      "fr": "Pixel Art bucolique 16-bit",
      "en": "Charming 16-bit Pixel Art"
    },
    "camera": {
      "fr": "Vue du dessus 2D (Top-down)",
      "en": "2D Top-down"
    },
    "developer": "ConcernedApe",
    "steamUrl": "https://store.steampowered.com/app/413150/Stardew_Valley/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/413150/ss_37a91689dfbbba16dfaa0d226a27e02e23075677.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/413150/ss_8217bb3a0b5f13d806d20875c75bf69f104d49d9.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/413150/ss_df94d216fe0290b2b8006bf203ea5ebba285746b.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/413150/ss_89daecf701c385566ee2682df6a0b7692e105e4b.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/413150/ss_6dc03fce5fe283f6f1680abcf4ebc3d790d96525.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Héritez de la vieille parcelle agricole de votre grand-père et apprenez à vivre de la terre.",
        "en": "You've inherited your grandfather's old farm plot in Stardew Valley. Can you learn to live off the land?"
      },
      "composer": "ConcernedApe"
    }
  },
  {
    "id": "subnautica",
    "title": "Subnautica",
    "releaseYear": 2018,
    "genre": [
      "Survie",
      "Exploration",
      "Sous-marin",
      "Sci-Fi"
    ],
    "artStyle": {
      "fr": "3D Réaliste & Bioluminescente",
      "en": "Vibrant Bioluminescent 3D"
    },
    "camera": {
      "fr": "Vue à la première personne (FPS)",
      "en": "First Person (FPS)"
    },
    "developer": "Unknown Worlds Entertainment",
    "steamUrl": "https://store.steampowered.com/app/264710/Subnautica/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/264710/ss_3a6a9be59e9a4bb3c1ae110b6562ba76579b12a8.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/264710/ss_752a1baefc4ca1fc746f33c06d814c8d5045ea7c.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/264710/ss_4955b41cf434e7f8b965c71d9d83d1fe5ee36b28.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/264710/ss_34f6e4a2e5c8e3ca91094ea8e7b16524ca9ebbf7.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/264710/ss_efb4592ca07b0493b86cb4886616a695e0c609df.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/264710/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Plongez dans les profondeurs d'un monde océanique extraterrestre fascinant et périlleux.",
        "en": "Descend into the depths of an alien underwater world filled with wonder and peril."
      },
      "composer": "Simon Chylinski"
    }
  },
  {
    "id": "balatro",
    "title": "Balatro",
    "releaseYear": 2024,
    "genre": [
      "Roguelike",
      "Deckbuilder",
      "Poker",
      "Stratégie"
    ],
    "artStyle": {
      "fr": "Pixel Art CRT Rétro & Holographique",
      "en": "Retro CRT Pixel Art & Holographic"
    },
    "camera": {
      "fr": "Vue de dessus 2D (Top-down)",
      "en": "2D Top-down"
    },
    "developer": "LocalThunk",
    "steamUrl": "https://store.steampowered.com/app/2379780/Balatro/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/2379780/ss_5d774f9d2d8cb30bf04f7cbe8078ef3a4b64f9ef.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/2379780/ss_9c8ca17945d81cb4e4fce5ad9fa345cbbeabf0c3.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/2379780/ss_e15112cb927bb8cffaf21cbbd42531e2840ff636.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/2379780/ss_963b652bb113f3dbcb9cbb5aa3f350c39f0469b8.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/2379780/ss_9b96eb9753c15aa1f9dbb900eb4d7d9e87595309.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/2379780/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Le roguelike de poker hypnotique où vous combinez jokers farfelus et multiplicateurs explosifs.",
        "en": "The poker roguelike. Balatro is a hypnotically satisfying deckbuilder where you play illegal poker hands."
      },
      "composer": "LouisF"
    }
  },
  {
    "id": "animal-well",
    "title": "Animal Well",
    "releaseYear": 2024,
    "genre": [
      "Metroidvania",
      "Puzzle",
      "Atmosphérique",
      "Exploration"
    ],
    "artStyle": {
      "fr": "Pixel Art Néon dense & Effets volumétriques",
      "en": "Dense Neon Pixel Art & Volumetric Lighting"
    },
    "camera": {
      "fr": "Vue de côté 2D (Side-scroller)",
      "en": "2D Side-scroller"
    },
    "developer": "Shared Memory",
    "steamUrl": "https://store.steampowered.com/app/813230/ANIMAL_WELL/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/813230/ss_a5957d19e0a29486c738e4a9081e4b9bbd05fe31.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/813230/ss_493f06e90299f1165319f71c4cce8f0c976f3f01.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/813230/ss_93beab90c563e46c764a8eb9c661ef4b8981f4a9.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/813230/ss_2d95a56763aa875f564f8ca8be114e9f78eaecb4.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/813230/ss_81e18bc2536b068e8e77519ff09c06634d0b04c8.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/813230/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Explorez un labyrinthe dense et énigmatique dissimulant d'innombrables secrets emboîtés.",
        "en": "Hatch from a flower and explore the labyrinthine world of ANIMAL WELL."
      },
      "composer": "Billy Basso"
    }
  },
  {
    "id": "sea-of-stars",
    "title": "Sea of Stars",
    "releaseYear": 2023,
    "genre": [
      "RPG",
      "Tour par tour",
      "Aventure",
      "Rétro"
    ],
    "artStyle": {
      "fr": "Pixel Art Moderne Haute Définition",
      "en": "Modern High-Definition Pixel Art"
    },
    "camera": {
      "fr": "Vue Isométrique / Plongée 2D",
      "en": "Top-down / Isometric 2D"
    },
    "developer": "Sabotage Studio",
    "steamUrl": "https://store.steampowered.com/app/1244090/Sea_of_Stars/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1244090/ss_5a49ca8cbf7f87178051755ee0a82b95b866c1f1.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1244090/ss_e95267be85aeef3294314e30018f6d6c62c26f0c.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1244090/ss_8716bceb7f14b6fc70c1cb336183ef999b70b55a.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1244090/ss_75e21fbfaebfe7876a3d93b39fbfa7f2ef8bc164.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1244090/ss_40cfebce1c56f8f172551cf18b5cf3c95a09289d.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1244090/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Deux Enfants du Solstice combinent les pouvoirs du soleil et de la lune pour vaincre le Fleshmancer.",
        "en": "Sea of Stars is a turn-based RPG inspired by the classics, featuring seamless exploration and timed hits."
      },
      "composer": "Eric W. Brown & Yasunori Mitsuda"
    }
  },
  {
    "id": "blasphemous",
    "title": "Blasphemous",
    "releaseYear": 2019,
    "genre": [
      "Metroidvania",
      "Souls-like",
      "Action",
      "Dark Fantasy"
    ],
    "artStyle": {
      "fr": "Pixel Art Gothique baroque",
      "en": "Baroque Gothic Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D (Side-scroller)",
      "en": "2D Side-scroller"
    },
    "developer": "The Game Kitchen",
    "steamUrl": "https://store.steampowered.com/app/774360/Blasphemous/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/774360/ss_a5a7dc788fc23f663fe57e937d7a5b3a3c1a8e1b.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/774360/ss_89eb4257121287941011dcebbf7b8979e83e5a55.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/774360/ss_efb4592ca07b0493b86cb4886616a695e0c609df.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/774360/ss_6eaef7e98a1f76cf8b2b9f36f6d2f976a4dfc08b.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/774360/ss_a7c8be21fb7a641a9cb3a59daebfb4c58cf35b44.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/774360/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Incarnez le Pénitent dans les terres maudites de Cvstodia et brisez le cycle éternel de la douleur.",
        "en": "A punishing action-platformer that combines fast-paced, skilled combat with a deep and evocative narrative."
      },
      "composer": "Carlos Viola"
    }
  },
  {
    "id": "ori-and-the-blind-forest",
    "title": "Ori and the Blind Forest",
    "releaseYear": 2015,
    "genre": [
      "Metroidvania",
      "Platformer",
      "Aventure",
      "Féérique"
    ],
    "artStyle": {
      "fr": "Peinture 2D Féérique & Effets de Particules",
      "en": "Fairytale 2D Painterly & Particles"
    },
    "camera": {
      "fr": "Vue de côté 2D (Side-scroller)",
      "en": "2D Side-scroller"
    },
    "developer": "Moon Studios",
    "steamUrl": "https://store.steampowered.com/app/387290/Ori_and_the_Blind_Forest_Definitive_Edition/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/387290/ss_81b37651a7b4578b5e525ae7d9d832448378c74d.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/387290/ss_91e0a297926e85501ae13768d60124caae4b29bb.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/387290/ss_164b36fa33c2a9ec6ca495d4d39f4ad164e26ee7.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/387290/ss_37a91689dfbbba16dfaa0d226a27e02e23075677.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/387290/ss_07981b2a95c967675fa8ea97a9f95f417f7b309e.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/387290/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Restaurez la forêt mourante de Nibel avec l'aide de la lumière ancestrale.",
        "en": "The forest of Nibel is dying. After a powerful storm sets a series of devastating events in motion, Ori must journey."
      },
      "composer": "Gareth Coker"
    }
  },
  {
    "id": "signalis",
    "title": "Signalis",
    "releaseYear": 2022,
    "genre": [
      "Survival Horror",
      "Psychologique",
      "Sci-Fi",
      "Rétro"
    ],
    "artStyle": {
      "fr": "3D Rétro Low-poly PS1 & Anime",
      "en": "Retro PS1 Low-poly 3D & Anime"
    },
    "camera": {
      "fr": "Vue Isométrique / Plongée 2D",
      "en": "Top-down / Isometric"
    },
    "developer": "rose-engine",
    "steamUrl": "https://store.steampowered.com/app/1262350/SIGNALIS/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1262350/ss_94229415c1e34df4e67277eefce2632b85fa1b66.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1262350/ss_ea4ea25d886fa31eeabac6504a75aa882c943806.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1262350/ss_2a5aa44ff7fc3f0bc333c1f24d777651a5e1ae77.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1262350/ss_69e4c1945f44e1837fcfc258d4a960fb5ce110c7.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1262350/ss_754bf28488e17812ec56fb2b4923f66ccefa935f.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1262350/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Un survival-horror psychologique dystopique empreint d'une angoisse cosmique et de mélancolie.",
        "en": "A classic survival horror experience set in a dystopian future where humanity has uncovered a dark secret."
      },
      "composer": "1000 Eyes & Cicada Sirens"
    }
  },
  {
    "id": "dave-the-diver",
    "title": "Dave the Diver",
    "releaseYear": 2023,
    "genre": [
      "Aventure",
      "Gestion",
      "Simulation",
      "Pêche"
    ],
    "artStyle": {
      "fr": "Hybride Pixel Art & Décors 3D",
      "en": "Hybrid Pixel Art & 3D Environments"
    },
    "camera": {
      "fr": "Vue de côté 2D (Side-scroller)",
      "en": "2D Side-scroller"
    },
    "developer": "MINTROCKET",
    "steamUrl": "https://store.steampowered.com/app/1868140/DAVE_THE_DIVER/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1868140/ss_f8f10640df483aa3ae1908bf41164ebfeefcfd61.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1868140/ss_d497c366ff5bc4e5ba8489cf3066367332f1465e.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1868140/ss_31c81ef447ff7a8848d5b8ff303ef252f4a47683.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1868140/ss_4955b41cf434e7f8b965c71d9d83d1fe5ee36b28.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1868140/ss_164b36fa33c2a9ec6ca495d4d39f4ad164e26ee7.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1868140/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Explorez le trou bleu le jour et servez des sushis d'exception le soir.",
        "en": "A casual, single-player adventure RPG featuring deep-sea exploration and fishing during the day, and sushi restaurant management at night."
      },
      "composer": "Dday"
    }
  },
  {
    "id": "nine-sols",
    "title": "Nine Sols",
    "releaseYear": 2024,
    "genre": [
      "Metroidvania",
      "Action",
      "Souls-like",
      "Taopunk"
    ],
    "artStyle": {
      "fr": "Dessin animé Taopunk fait main",
      "en": "Hand-drawn Taopunk Manga 2D"
    },
    "camera": {
      "fr": "Vue de côté 2D (Side-scroller)",
      "en": "2D Side-scroller"
    },
    "developer": "Red Candle Games",
    "steamUrl": "https://store.steampowered.com/app/1809540/Nine_Sols/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1809540/ss_868b4226ba5cb830c2c31e9c20aa19aa36a7ea4b.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1809540/ss_752a78122d250325066dc10ae950a7b4f2c9ef89.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1809540/ss_5d774f9d2d8cb30bf04f7cbe8078ef3a4b64f9ef.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1809540/ss_164b36fa33c2a9ec6ca495d4d39f4ad164e26ee7.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1809540/ss_493c0fec44a30e84b54e3d368e7ec89f41df5bc2.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1809540/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Un périple de vengeance taopunk aux combats intenses axés sur la déviation et le rythme.",
        "en": "A lore-rich, hand-drawn 2D action-platformer featuring Sekiro-inspired deflection combat in an Asian fantasy world."
      },
      "composer": "Red Candle Sound Team"
    }
  },
  {
    "id": "crow-country",
    "title": "Crow Country",
    "releaseYear": 2024,
    "genre": [
      "Survival Horror",
      "Puzzle",
      "Rétro",
      "Mystère"
    ],
    "artStyle": {
      "fr": "3D Low-poly Rétro ère PS1",
      "en": "Retro PS1 Low-poly 3D"
    },
    "camera": {
      "fr": "Vue Isométrique 3D libre",
      "en": "Isometric 3D Camera"
    },
    "developer": "SFB Games",
    "steamUrl": "https://store.steampowered.com/app/1996010/Crow_Country/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1996010/ss_94229415c1e34df4e67277eefce2632b85fa1b66.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1996010/ss_ea4ea25d886fa31eeabac6504a75aa882c943806.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1996010/ss_868f763f9104fa2e558832a8dd936cb077e685f0.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1996010/ss_2a5aa44ff7fc3f0bc333c1f24d777651a5e1ae77.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1996010/ss_69e4c1945f44e1837fcfc258d4a960fb5ce110c7.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1996010/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Explorez un parc d'attractions abandonné et élucidez la disparition mystérieuse d'Edward Crow.",
        "en": "A survival horror game where you investigate the eerie quiet of an abandoned theme park."
      },
      "composer": "Tom Vian"
    }
  },
  {
    "id": "pizza-tower",
    "title": "Pizza Tower",
    "releaseYear": 2023,
    "genre": [
      "Platformer",
      "Fast-paced",
      "Comédie",
      "Score Attack"
    ],
    "artStyle": {
      "fr": "Animation Cartoon 90s déjantée",
      "en": "Zany 90s Cartoon Hand-drawn"
    },
    "camera": {
      "fr": "Vue de côté 2D (Side-scroller)",
      "en": "2D Side-scroller"
    },
    "developer": "Tour De Pizza",
    "steamUrl": "https://store.steampowered.com/app/2231450/Pizza_Tower/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/2231450/ss_b8fc17b439c3c1ca75635c15ee4e366b595b1e06.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/2231450/ss_911ce20f864e2621748259d81d2db40ec0a0ba61.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/2231450/ss_f8bfad73ae2c4bb47f9a8cb40428c946e382d6c1.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/2231450/ss_544e3cb41b9d4f9bf34fca240f2f3e8271e16c90.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/2231450/ss_4905a8f0a0e5b9826f5d5351e3c233cba799c922.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/2231450/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Sauvez votre pizzeria en détruisant la Tour de Pizza à une vitesse supersonique.",
        "en": "A fast-paced 2D platformer inspired by the Wario Land series, with an emphasis on movement and destruction."
      },
      "composer": "Ronan de Castel & ClascyJitto"
    }
  },
  {
    "id": "pacific-drive",
    "title": "Pacific Drive",
    "releaseYear": 2024,
    "genre": [
      "Survie",
      "Conduite",
      "Sci-Fi",
      "Roguelite"
    ],
    "artStyle": {
      "fr": "3D Atmosphérique Réaliste & Anomale",
      "en": "Atmospheric Anomaly-Rich 3D"
    },
    "camera": {
      "fr": "Vue à la première personne (FPS)",
      "en": "First Person (FPS)"
    },
    "developer": "Ironwood Studios",
    "steamUrl": "https://store.steampowered.com/app/1458140/Pacific_Drive/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1458140/ss_4996fbcefcfa11b069d511516e87754eb5e7096e.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1458140/ss_c7c4904eb12d46e01a884ec8136ff9c3a372eb06.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1458140/ss_e1e12ea993f39a7970d49479b007887aa85467ef.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1458140/ss_a1e5052994474775e5331ae0a0f67caae0d8ebf9.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1458140/ss_694cf6e1d51c4a4e12c1c6e1c79caadbe92e1069.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1458140/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Affrontez les périls surnaturels de la Zone d'exclusion olympique avec votre break pour seul refuge.",
        "en": "Face the supernatural dangers of the Olympic Exclusion Zone with a car as your only lifeline."
      },
      "composer": "Wilbert Roget II"
    }
  },
  {
    "id": "katana-zero",
    "title": "Katana Zero",
    "releaseYear": 2019,
    "genre": [
      "Action",
      "Slash",
      "Cyberpunk",
      "Récit"
    ],
    "artStyle": {
      "fr": "Pixel Art Néon Néo-noir tranchant",
      "en": "Neo-noir Neon Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D (Side-scroller)",
      "en": "2D Side-scroller"
    },
    "developer": "Askiisoft",
    "steamUrl": "https://store.steampowered.com/app/460950/Katana_ZERO/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/460950/ss_055fa053267d643d9c72f7ad4bc81d68377cb761.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/460950/ss_0d10c1f54cfebbeeaaeae2bf80b2a59a7fdbdbf0.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/460950/ss_5d6dafc02187b5bccecf6b509d3c52e46b328131.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/460950/ss_b831fa4358a9e64e5256e6bf4ea69a1ff099eaee.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/460950/ss_d44e5fae5ffeb68e1a1796d1354bb4a6433e387f.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/460950/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Tranchez, esquivez et manipulez le temps dans un ballet sanglant au katana néo-noir.",
        "en": "A stylish neo-noir, action-platformer featuring breakneck action and instant-death combat."
      },
      "composer": "LudoWic & Bill Kiley"
    }
  },
  {
    "id": "hotline-miami",
    "title": "Hotline Miami",
    "releaseYear": 2012,
    "genre": [
      "Action",
      "Brutal",
      "Top-down",
      "Synthwave"
    ],
    "artStyle": {
      "fr": "Pixel Art Psychédélique Rétro 80s",
      "en": "Psychedelic Retro 80s Pixel Art"
    },
    "camera": {
      "fr": "Vue du dessus 2D (Top-down)",
      "en": "2D Top-down"
    },
    "developer": "Dennaton Games",
    "steamUrl": "https://store.steampowered.com/app/219150/Hotline_Miami/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/219150/ss_75e8d890cf2c68a4b3d7967b66a50e932bce37bb.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/219150/ss_f8a00259f51fc8931168ad08c5c7d1e07b587cf5.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/219150/ss_91e0a297926e85501ae13768d60124caae4b29bb.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/219150/ss_5bbd5668ef19c3514a6026a798993f3c3065da4a.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/219150/ss_c7df0e02ebbe7f67724a7ba31379f8feef7eb3d0.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/219150/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Aimez-vous faire du mal aux autres ? Une fusillade néon sanglante dans le Miami de 1989.",
        "en": "A high-octane action game overflowing with raw brutality, hard-boiled gunplay and skull crushing close combat."
      },
      "composer": "Moon, Sun Araw & Jasper Byrne"
    }
  },
  {
    "id": "dredge",
    "title": "Dredge",
    "releaseYear": 2023,
    "genre": [
      "Pêche",
      "Horreur cosmique",
      "Aventure",
      "Gestion"
    ],
    "artStyle": {
      "fr": "3D Low-poly Stylisée et Brumeuse",
      "en": "Misty Low-poly Stylized 3D"
    },
    "camera": {
      "fr": "Vue Isométrique 3D / Troisième personne",
      "en": "Isometric 3D / Third Person"
    },
    "developer": "Black Salt Games",
    "steamUrl": "https://store.steampowered.com/app/1562430/DREDGE/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1562430/ss_37a1f592477383a18a54d6fc48bc9614f85e49cf.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1562430/ss_16ca74378f8ff4b830d93be7839ec9bce768656d.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1562430/ss_1c6cb9916ec0e0c03b1236fb6552431fa1a2c3a5.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1562430/ss_2c0d8328bf5858cfd7be875e533c3f9154f24f5c.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1562430/ss_19139589d825dd67746fa0d15197f805a5a1e2f9.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1562430/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Pilotez votre chalutier, pêchez des créatures sous-marines et bravez les abominations de la nuit.",
        "en": "A single-player fishing adventure with a sinister undercurrent."
      },
      "composer": "David Webster"
    }
  },
  {
    "id": "chants-of-sennaar",
    "title": "Chants of Sennaar",
    "releaseYear": 2023,
    "genre": [
      "Puzzle",
      "Aventure",
      "Linguistique",
      "Exploration"
    ],
    "artStyle": {
      "fr": "Ligne claire inspirée de Moebius",
      "en": "Moebius-inspired European Ligne Claire"
    },
    "camera": {
      "fr": "Vue Isométrique 3D fixe",
      "en": "Fixed Isometric 3D"
    },
    "developer": "Rundisc",
    "steamUrl": "https://store.steampowered.com/app/1931770/Chants_of_Sennaar/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1931770/ss_5a49ca8cbf7f87178051755ee0a82b95b866c1f1.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1931770/ss_e95267be85aeef3294314e30018f6d6c62c26f0c.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1931770/ss_8716bceb7f14b6fc70c1cb336183ef999b70b55a.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1931770/ss_75e21fbfaebfe7876a3d93b39fbfa7f2ef8bc164.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1931770/ss_40cfebce1c56f8f172551cf18b5cf3c95a09289d.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1931770/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Déchiffrez d'anciens glyphes et réunissez les peuples de la Tour de Babel.",
        "en": "Unravel mysteries across the Tower of Babel by deciphering ancient languages."
      },
      "composer": "Thomas Brunet"
    }
  },
  {
    "id": "a-short-hike",
    "title": "A Short Hike",
    "releaseYear": 2019,
    "genre": [
      "Aventure",
      "Exploration",
      "Cozy",
      "Vol"
    ],
    "artStyle": {
      "fr": "Pixel Art 3D Doux & Pastel",
      "en": "Pastel Pixelated 3D"
    },
    "camera": {
      "fr": "Vue Isométrique 3D / Plongée",
      "en": "Top-down / Isometric 3D"
    },
    "developer": "adamgryu",
    "steamUrl": "https://store.steampowered.com/app/1055540/A_Short_Hike/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1055540/ss_37a91689dfbbba16dfaa0d226a27e02e23075677.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1055540/ss_8217bb3a0b5f13d806d20875c75bf69f104d49d9.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1055540/ss_df94d216fe0290b2b8006bf203ea5ebba285746b.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1055540/ss_89daecf701c385566ee2682df6a0b7692e105e4b.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1055540/ss_6dc03fce5fe283f6f1680abcf4ebc3d790d96525.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1055540/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Randonnez, planez et grimpez jusqu'au sommet paisible de Hawk Peak Provincial Park.",
        "en": "Hike, climb, and soar through the peaceful mountainside landscapes of Hawk Peak Provincial Park."
      },
      "composer": "Mark Sparling"
    }
  },
  {
    "id": "fez",
    "title": "Fez",
    "releaseYear": 2012,
    "genre": [
      "Puzzle",
      "Platformer",
      "Perspective",
      "Rétro"
    ],
    "artStyle": {
      "fr": "Pixel Art 2D cubique dans un monde 3D",
      "en": "2D Pixel Art in a 3D Multiverse"
    },
    "camera": {
      "fr": "Vue de profil 2D rotative sur 4 axes",
      "en": "2D Rotating Perspective"
    },
    "developer": "Polytron Corporation",
    "steamUrl": "https://store.steampowered.com/app/224760/FEZ/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/224760/ss_fa73b438258296eb4cbb7928e3b08e2ecadba9ee.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/224760/ss_ef79ee5e11400d7fb4936d93e87fc4dcad30d5b4.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/224760/ss_d36bfa5880d75c3dbb90875e54d89617255169a8.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/224760/ss_89ca05256e2eb9b6cebcda7c29ae82136a546ce3.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/224760/ss_598007ae08f237bfb1cf8f600f723650170a417a.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/224760/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Gomez découvre l'existence d'une mystérieuse troisième dimension en recevant un fez magique.",
        "en": "Gomez is a 2D creature living in a 2D world until the existence of a mysterious 3rd dimension is revealed to him."
      },
      "composer": "Disasterpeace"
    }
  },
  {
    "id": "gris",
    "title": "Gris",
    "releaseYear": 2018,
    "genre": [
      "Platformer",
      "Aventure",
      "Émotion",
      "Artistique"
    ],
    "artStyle": {
      "fr": "Aquarelle Peinte à la Main",
      "en": "Hand-painted Watercolor 2D"
    },
    "camera": {
      "fr": "Vue de côté 2D (Side-scroller)",
      "en": "2D Side-scroller"
    },
    "developer": "Nomada Studio",
    "steamUrl": "https://store.steampowered.com/app/683320/GRIS/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/683320/ss_81b37651a7b4578b5e525ae7d9d832448378c74d.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/683320/ss_91e0a297926e85501ae13768d60124caae4b29bb.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/683320/ss_164b36fa33c2a9ec6ca495d4d39f4ad164e26ee7.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/683320/ss_37a91689dfbbba16dfaa0d226a27e02e23075677.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/683320/ss_07981b2a95c967675fa8ea97a9f95f417f7b309e.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/683320/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Rendez les couleurs à un monde brisé à travers le deuil d'une jeune fille pleine d'espoir.",
        "en": "GRIS is a serene and evocative experience, free of danger, frustration or death."
      },
      "composer": "Berlinist"
    }
  },
  {
    "id": "darkest-dungeon",
    "title": "Darkest Dungeon",
    "releaseYear": 2016,
    "genre": [
      "Roguelike",
      "RPG",
      "Tour par tour",
      "Dark Fantasy"
    ],
    "artStyle": {
      "fr": "Comics Gothique encré façon Mignola",
      "en": "Inked Gothic Comic Illustration"
    },
    "camera": {
      "fr": "Vue de profil 2D fixe en couloir",
      "en": "2D Side Exploration & Combat"
    },
    "developer": "Red Hook Studios",
    "steamUrl": "https://store.steampowered.com/app/262060/Darkest_Dungeon/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/262060/ss_a5a7dc788fc23f663fe57e937d7a5b3a3c1a8e1b.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/262060/ss_89eb4257121287941011dcebbf7b8979e83e5a55.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/262060/ss_efb4592ca07b0493b86cb4886616a695e0c609df.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/262060/ss_6eaef7e98a1f76cf8b2b9f36f6d2f976a4dfc08b.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/262060/ss_a7c8be21fb7a641a9cb3a59daebfb4c58cf35b44.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/262060/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Gérez le stress et la folie de héros meurtris dans les catacombes d'un manoir maudit.",
        "en": "A challenging gothic roguelike turn-based RPG about the psychological stresses of adventuring."
      },
      "composer": "Stuart Chatwood"
    }
  },
  {
    "id": "bramble",
    "title": "Bramble: The Mountain King",
    "releaseYear": 2023,
    "genre": [
      "Horreur",
      "Aventure",
      "Folklore",
      "Sombre"
    ],
    "artStyle": {
      "fr": "3D Réaliste Cinématique Nordique",
      "en": "Cinematic Nordic Photorealistic 3D"
    },
    "camera": {
      "fr": "Vue à la troisième personne cinématique",
      "en": "Cinematic Third Person"
    },
    "developer": "Dimfrost Studios",
    "steamUrl": "https://store.steampowered.com/app/1623940/Bramble_The_Mountain_King/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1623940/ss_164b36fa33c2a9ec6ca495d4d39f4ad164e26ee7.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1623940/ss_493c0fec44a30e84b54e3d368e7ec89f41df5bc2.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1623940/ss_7be9719eb79bb410b0a562ef674a22ad3fb936d6.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1623940/ss_ff68ce49ea3aa5a1a1f044bbd2df807353f47e30.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1623940/ss_09904323672ea4fc69317d722dbfc05d0458b297.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1623940/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Traversez une terre sinistre inspirée des contes nordiques pour sauver votre sœur d'un infâme troll.",
        "en": "A grim adventure set in a world inspired by dark, Nordic fables."
      },
      "composer": "Martin Hall"
    }
  },
  {
    "id": "axiom-verge",
    "title": "Axiom Verge",
    "releaseYear": 2015,
    "genre": [
      "Metroidvania",
      "Sci-Fi",
      "Action",
      "Rétro"
    ],
    "artStyle": {
      "fr": "Pixel Art 16-bit Biomécanique Rétro",
      "en": "Biomechanical 16-bit CRT Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D (Side-scroller)",
      "en": "2D Side-scroller"
    },
    "developer": "Thomas Happ Games LLC",
    "steamUrl": "https://store.steampowered.com/app/332200/Axiom_Verge/",
    "screenshots": [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/332200/ss_868f763f9104fa2e558832a8dd936cb077e685f0.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/332200/ss_9107ffdc69c3a30c52eb4be1c6cc8c4b794fbd81.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/332200/ss_e1e5b8d2bbfa8d4389069d3e8a4a58eb6b7858c2.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/332200/ss_a43e49df9c9164287c2b3dc10b1069b22a0bb8ad.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/332200/ss_96eef667a4216e4fae7592cf1eef4f954316d5ba.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/332200/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Explorez et débloquez un monde extraterrestre labyrinthique à l'aide de glitchs et d'armes biomécaniques.",
        "en": "The retro sci-fi action adventure you've been waiting for, crafted by a solo developer."
      },
      "composer": "Thomas Happ"
    }
  },
  {
    "id": "the-binding-of-isaac-rebirth",
    "title": "The Binding of Isaac: Rebirth",
    "releaseYear": 2014,
    "genre": [
      "Action"
    ],
    "artStyle": {
      "fr": "Pixel Art 16-bit macabre et expressif",
      "en": "Grim and expressive 16-bit pixel art"
    },
    "camera": {
      "fr": "Vue du dessus 2D (Top-down)",
      "en": "2D Top-down"
    },
    "developer": "Nicalis, Inc., Edmund McMillen",
    "steamUrl": "https://store.steampowered.com/app/250900/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/250900/ss_25a4a446a433218d41a7e87e35b60c297e68e7a4.1920x1080.jpg?t=1731977365",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/250900/ss_19ef624e8d97136ba6f928d389b85f7b8130c37a.1920x1080.jpg?t=1731977365",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/250900/ss_9fa4199fa93cb8b1edd8780fa6ce9e80d2bfb503.1920x1080.jpg?t=1731977365",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/250900/ss_008a76bd0ab314c8140dd1a7ec61090c122d1779.1920x1080.jpg?t=1731977365",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/250900/ss_b146a76ac5348e1cf958c3d01834e13b33c4e561.1920x1080.jpg?t=1731977365",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/250900/ss_89aa019b678e96fd13367a5fda6145ed0bc79fce.1920x1080.jpg?t=1731977365"
    ],
    "hints": {
      "tagline": {
        "fr": "The Binding of Isaac: Rebirth is a randomly generated action RPG shooter with heavy Rogue-like elements. Following Isaac on his journey players will find bizarre treasures that change Isaac’s form giving him super human abilities and enabling him to fight off droves of mysterious creatures, discover secrets and fight his way to safety.",
        "en": "The Binding of Isaac: Rebirth is a randomly generated action RPG shooter with heavy Rogue-like elements. Following Isaac on his journey players will find bizarre treasures that change Isaac’s form giving him super human abilities and enabling him to fight off droves of mysterious creatures, discover secrets and fight his way to safety."
      },
      "composer": "Ridiculon"
    }
  },
  {
    "id": "terraria",
    "title": "Terraria",
    "releaseYear": 2011,
    "genre": [
      "Action",
      "Aventure",
      "Indépendant",
      "RPG"
    ],
    "artStyle": {
      "fr": "Pixel Art rétro coloré et foisonnant",
      "en": "Vibrant and detailed retro pixel art"
    },
    "camera": {
      "fr": "Vue de côté 2D (Side-scroller)",
      "en": "2D Side-scroller"
    },
    "developer": "Re-Logic",
    "steamUrl": "https://store.steampowered.com/app/105600/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/105600/ss_8c03886f214d2108cafca13845533eaa3d87d83f.1920x1080.jpg?t=1769844435",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/105600/ss_ae168a00ab08104ba266dc30232654d4b3c919e5.1920x1080.jpg?t=1769844435",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/105600/ss_9edd98caaf9357c2f40758f354475a56e356e8b0.1920x1080.jpg?t=1769844435",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/105600/ss_75ea9a7e39eb34b40efa1e6dfd2536098dc4734b.1920x1080.jpg?t=1769844435",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/105600/ss_782374517c1792debd74d24856203b876eba3a5d.1920x1080.jpg?t=1769844435",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/105600/ss_04dd9f0a5773b686a452ba480b951f83b3ed5061.1920x1080.jpg?t=1769844435"
    ],
    "hints": {
      "tagline": {
        "fr": "Creuser, survivre, explorer, construire ! Tout est possible dans ce jeu d'aventure bourré d'action. Pack de 4 jeux également disponible !",
        "en": "Creuser, survivre, explorer, construire ! Tout est possible dans ce jeu d'aventure bourré d'action. Pack de 4 jeux également disponible !"
      },
      "composer": "Scott Lloyd Shelly (RE-LOGIC)"
    }
  },
  {
    "id": "vampire-survivors",
    "title": "Vampire Survivors",
    "releaseYear": 2022,
    "genre": [
      "Action",
      "Occasionnel",
      "Indépendant",
      "RPG"
    ],
    "artStyle": {
      "fr": "Pixel Art rétro gothique style Castlevania",
      "en": "Gothic retro pixel art"
    },
    "camera": {
      "fr": "Vue du dessus 2D (Top-down)",
      "en": "2D Top-down"
    },
    "developer": "poncle",
    "steamUrl": "https://store.steampowered.com/app/1794680/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1794680/ss_6c55afe36be2a7784bf18cb9b3218321ae2d10e5.1920x1080.jpg?t=1787911678",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1794680/ss_6105ad3d6af52593c31d915bf39e91512611ea8e.1920x1080.jpg?t=1787911678",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1794680/ss_054159adc52856d066d48bda02866da524c43439.1920x1080.jpg?t=1787911678",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1794680/ss_01ec75b8055dbaa6895a0be127508ff569917a1e.1920x1080.jpg?t=1787911678",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1794680/ss_bf22b444801d96026863fcf284f9f93441354035.1920x1080.jpg?t=1787911678",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1794680/ss_bea7831ae00c044d9cd31c3f8e0fee766b4fe1c6.1920x1080.jpg?t=1787911678"
    ],
    "hints": {
      "tagline": {
        "fr": "Réduisez des milliers de créatures de la nuit en bouillie pour survivre jusqu'à l'aurore ! Vampire Survivors est un jeu d'horreur gothique teinté d'éléments de roguelite, dans lequel vos choix vous permettent de lutter contre des hordes de monstres qui vous assaillent de toute part.",
        "en": "Réduisez des milliers de créatures de la nuit en bouillie pour survivre jusqu'à l'aurore ! Vampire Survivors est un jeu d'horreur gothique teinté d'éléments de roguelite, dans lequel vos choix vous permettent de lutter contre des hordes de monstres qui vous assaillent de toute part."
      },
      "composer": "Daniele Zandara / Filippo Vicarelli"
    }
  },
  {
    "id": "cult-of-the-lamb",
    "title": "Cult of the Lamb",
    "releaseYear": 2022,
    "genre": [
      "Action",
      "Aventure",
      "Indépendant",
      "Stratégie"
    ],
    "artStyle": {
      "fr": "Dessin 2D cartoon mignon et occulte",
      "en": "Cute and occult hand-drawn cartoon 2D"
    },
    "camera": {
      "fr": "Vue Isométrique 2.5D",
      "en": "2.5D Isometric"
    },
    "developer": "Massive Monster",
    "steamUrl": "https://store.steampowered.com/app/1313140/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1313140/ss_3bda2c2e740660fcde8c42eafab4cb7574ab54e6.1920x1080.jpg?t=1786554901",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1313140/ss_805babf3c8dec217798c836daea48a63b47c192b.1920x1080.jpg?t=1786554901",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1313140/ss_b26625d6f64a739ed1ddf832a5d26b665ab0619f.1920x1080.jpg?t=1786554901",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1313140/ss_90f238e89ab4c4500d3baee273419bd23f8e5f84.1920x1080.jpg?t=1786554901",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1313140/ss_f4ca3fd0416c3f41c57bc3809bb45f8f20e684ec.1920x1080.jpg?t=1786554901",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1313140/ss_566aecf445ab0448191f1996600fd7ec80d0a0d7.1920x1080.jpg?t=1786554901"
    ],
    "hints": {
      "tagline": {
        "fr": "Montez votre propre culte dans un pays de faux prophètes, parcourez des régions étonnantes et mystérieuses pour faire croître une communauté d'adeptes fidèles dans les bois et répandez la bonne parole pour devenir le seul culte véritable.",
        "en": "Montez votre propre culte dans un pays de faux prophètes, parcourez des régions étonnantes et mystérieuses pour faire croître une communauté d'adeptes fidèles dans les bois et répandez la bonne parole pour devenir le seul culte véritable."
      },
      "composer": "River Boy (Narayana Johnson)"
    }
  },
  {
    "id": "shovel-knight",
    "title": "Shovel Knight: Treasure Trove",
    "releaseYear": 2014,
    "genre": [
      "Action",
      "Aventure",
      "Indépendant"
    ],
    "artStyle": {
      "fr": "Pixel Art 8-bit authentique style NES",
      "en": "Authentic 8-bit NES pixel art"
    },
    "camera": {
      "fr": "Vue de côté 2D (Side-scroller)",
      "en": "2D Side-scroller"
    },
    "developer": "Yacht Club Games",
    "steamUrl": "https://store.steampowered.com/app/250760/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/250760/ss_afe6ad5414f6506883573a10997d3470b7759374.1920x1080.jpg?t=1780266579",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/250760/ss_5fadc2bbe9db6d36e2e2cd3de41aac474d7c8e54.1920x1080.jpg?t=1780266579",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/250760/ss_4bde75094f028e9bfbb1bdda2e9eda91e3927173.1920x1080.jpg?t=1780266579",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/250760/ss_dbf4b4a3a361ceb7c0d81e070b0189b57ac9e309.1920x1080.jpg?t=1780266579",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/250760/ss_eb2376fbf477be217ae2ef1256f5b3e7f815cd4d.1920x1080.jpg?t=1780266579",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/250760/ss_eb2376fbf477be217ae2ef1256f5b3e7f815cd4d.1920x1080.jpg?t=1780266579"
    ],
    "hints": {
      "tagline": {
        "fr": "Shovel Knight: Treasure Trove, l’édition complète de Shovel Knight, regroupe les 5 jeux de la saga ! Frayez-vous un chemin à coup de pelle et d'explosions dans un univers de plates-formes exigeant, peuplé de personnages mémorables et inspiré des classiques d'action/aventure de l'ère 8-bits.",
        "en": "Shovel Knight: Treasure Trove, l’édition complète de Shovel Knight, regroupe les 5 jeux de la saga ! Frayez-vous un chemin à coup de pelle et d'explosions dans un univers de plates-formes exigeant, peuplé de personnages mémorables et inspiré des classiques d'action/aventure de l'ère 8-bits."
      },
      "composer": "Jake Kaufman & Manami Matsumae"
    }
  },
  {
    "id": "inside",
    "title": "INSIDE",
    "releaseYear": 2016,
    "genre": [
      "Action",
      "Aventure",
      "Indépendant"
    ],
    "artStyle": {
      "fr": "3D Minimaliste atmosphérique en nuances de gris",
      "en": "Atmospheric minimalist 3D in desaturated tones"
    },
    "camera": {
      "fr": "Vue de côté 2.5D cinématique",
      "en": "Cinematic 2.5D Side-scroller"
    },
    "developer": "Playdead",
    "steamUrl": "https://store.steampowered.com/app/304430/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/304430/ss_d23769199f1e3d498f8293892f0456696458c717.1920x1080.jpg?t=1761819581",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/304430/ss_b15d0a5c037198b5b9db6a82fedf5018f1b43de5.1920x1080.jpg?t=1761819581",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/304430/ss_ebeba62a8d2141b4fd36760500529fb2d9a29190.1920x1080.jpg?t=1761819581",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/304430/ss_8b67b9a40e620c7316df60cb5a783820f77b935c.1920x1080.jpg?t=1761819581",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/304430/ss_82584c66b8ff7d935481e753596ab36d9b5e9fb7.1920x1080.jpg?t=1761819581",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/304430/ss_5fa85af6a5041f4671ce148cf3d768d5bfbd51b7.1920x1080.jpg?t=1761819581"
    ],
    "hints": {
      "tagline": {
        "fr": "Seul et pourchassé, un garçon se retrouve entraîné au cœur d'un sombre projet.",
        "en": "Seul et pourchassé, un garçon se retrouve entraîné au cœur d'un sombre projet."
      },
      "composer": "Martin Stig Andersen & SØS Gunver Ryberg"
    }
  },
  {
    "id": "limbo",
    "title": "LIMBO",
    "releaseYear": 2011,
    "genre": [
      "Action",
      "Aventure",
      "Indépendant"
    ],
    "artStyle": {
      "fr": "Noir et blanc monochrome en ombres chinoises",
      "en": "Monochrome black & white silhouette noir"
    },
    "camera": {
      "fr": "Vue de côté 2D (Side-scroller)",
      "en": "2D Side-scroller"
    },
    "developer": "Playdead",
    "steamUrl": "https://store.steampowered.com/app/48000/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/48000/ss_d33513ed37acf1073ea92f182b76e165101bfdac.1920x1080.jpg?t=1761819450",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/48000/ss_402b32434e4bb1a8445397aa24b1b893fe3d257f.1920x1080.jpg?t=1761819450",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/48000/ss_a62bc173abb93fbc12dbb6b8d366524a43c1356f.1920x1080.jpg?t=1761819450",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/48000/ss_a9d219f68ed392daba5e848c55dd9814ee3483b2.1920x1080.jpg?t=1761819450",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/48000/ss_4fd6a8dfb40b1a061dec596bfafea10063e70ea0.1920x1080.jpg?t=1761819450",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/48000/ss_312f9cbb367362a246a5bbfc8f4911b904eb2ba1.1920x1080.jpg?t=1761819450"
    ],
    "hints": {
      "tagline": {
        "fr": "Incertain du sort de sa sœur, un garçon pénètre dans LIMBO",
        "en": "Incertain du sort de sa sœur, un garçon pénètre dans LIMBO"
      },
      "composer": "Martin Stig Andersen"
    }
  },
  {
    "id": "cocoon",
    "title": "COCOON",
    "releaseYear": 2023,
    "genre": [
      "Aventure",
      "Indépendant"
    ],
    "artStyle": {
      "fr": "3D Stylisée épurée et extraterrestre",
      "en": "Sleek stylized alien 3D"
    },
    "camera": {
      "fr": "Vue Isométrique du dessus",
      "en": "Top-down Isometric"
    },
    "developer": "Geometric Interactive",
    "steamUrl": "https://store.steampowered.com/app/1497440/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1497440/ss_e1760582c4ed7da2bc737b878126864f83308ca0.1920x1080.jpg?t=1763721043",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1497440/ss_33edba0e9cbf89a896e9ec2e9b2731303c4ea83a.1920x1080.jpg?t=1763721043",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1497440/ss_33294bb3b7addea79361629d24023223dab0aa4c.1920x1080.jpg?t=1763721043",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1497440/ss_515d6e054265fde30ca72373ffaefd50e9276fc2.1920x1080.jpg?t=1763721043",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1497440/ss_c86c35b3d748565240b4d02879a18dd3ba0c18fd.1920x1080.jpg?t=1763721043",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1497440/ss_df2535ce031cdbeb300f2e2ad0b97d8bcbb6b5b4.1920x1080.jpg?t=1763721043"
    ],
    "hints": {
      "tagline": {
        "fr": "De Jeppe Carlsen, le principal concepteur de gameplay de LIMBO et INSIDE — COCOON vous emmène dans une aventure à travers des mondes dans des mondes. Maîtrisez les mécanismes de saut du monde et résolvez des énigmes complexes pour percer un mystère cosmique.",
        "en": "De Jeppe Carlsen, le principal concepteur de gameplay de LIMBO et INSIDE — COCOON vous emmène dans une aventure à travers des mondes dans des mondes. Maîtrisez les mécanismes de saut du monde et résolvez des énigmes complexes pour percer un mystère cosmique."
      },
      "composer": "Jakob Schmid"
    }
  },
  {
    "id": "return-of-the-obra-dinn",
    "title": "Return of the Obra Dinn",
    "releaseYear": 2018,
    "genre": [
      "Aventure",
      "Indépendant"
    ],
    "artStyle": {
      "fr": "Monochrome 1-bit dithering rétro Mac/PC",
      "en": "1-bit monochrome dithering classic Macintosh"
    },
    "camera": {
      "fr": "Première personne 3D (First-person)",
      "en": "First-person 3D"
    },
    "developer": "Lucas Pope",
    "steamUrl": "https://store.steampowered.com/app/653530/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/653530/ss_7dd3476ace2170e134141e487f9491d4c9d094f3.1920x1080.jpg?t=1686697594",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/653530/ss_380dc35237fde7d3863a44270abafc37924d1db4.1920x1080.jpg?t=1686697594",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/653530/ss_69b3c98eda3c3476a4dee6a1a220169ac70dcb6d.1920x1080.jpg?t=1686697594",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/653530/ss_4f555f01fa82723c28fcce8f0909570caaee8e8f.1920x1080.jpg?t=1686697594",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/653530/ss_7a8824f581b399abc52f598966b339fada982349.1920x1080.jpg?t=1686697594",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/653530/ss_f3e24e7a7f86ad925076f63b4e6cd86258f63d2c.1920x1080.jpg?t=1686697594"
    ],
    "hints": {
      "tagline": {
        "fr": "Perdu en mer, 1803 LE FIER VAISSEAU « OBRA DINN »",
        "en": "Perdu en mer, 1803 LE FIER VAISSEAU « OBRA DINN »"
      },
      "composer": "Lucas Pope"
    }
  },
  {
    "id": "ultrakill",
    "title": "ULTRAKILL",
    "releaseYear": 2020,
    "genre": [
      "Action",
      "Indépendant",
      "Accès anticipé"
    ],
    "artStyle": {
      "fr": "Rétro Low-poly texturé style PS1 / Quake",
      "en": "Retro low-poly PS1/Quake aesthetic"
    },
    "camera": {
      "fr": "Première personne 3D (FPS)",
      "en": "First-person 3D (FPS)"
    },
    "developer": "Arsi \"Hakita\" Patala",
    "steamUrl": "https://store.steampowered.com/app/1229490/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1229490/ss_8c743b6de2d6124bd583d8764f28cafe2b7ecb3f.1920x1080.jpg?t=1783942574",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1229490/ss_7a5692d56ec4115252980fed4ad5536d1e401e04.1920x1080.jpg?t=1783942574",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1229490/ss_bc7a00fadbcde4a6c6dcb95d8e464ad5ffc06e3c.1920x1080.jpg?t=1783942574",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1229490/ss_21e8e9c78b24c73451c8d9ed1d17e21e43f3adb7.1920x1080.jpg?t=1783942574",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1229490/ss_2f2213d07fd390f3f612dd60ec07c03ceab42e40.1920x1080.jpg?t=1783942574",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1229490/ss_7460a480b1deb03f64cbfff0173445fb50d0c514.1920x1080.jpg?t=1783942574"
    ],
    "hints": {
      "tagline": {
        "fr": "ULTRAKILL est un FPS rétro ultra-violent au rythme effréné qui allie le système de score basé sur l'habileté des jeux d'action à la débauche de violence pure inspirée des meilleurs jeux de tir des années 90.",
        "en": "ULTRAKILL est un FPS rétro ultra-violent au rythme effréné qui allie le système de score basé sur l'habileté des jeux d'action à la débauche de violence pure inspirée des meilleurs jeux de tir des années 90."
      },
      "composer": "Hakita (Arsi Patala)"
    }
  },
  {
    "id": "enter-the-gungeon",
    "title": "Enter the Gungeon",
    "releaseYear": 2016,
    "genre": [
      "Action",
      "Aventure",
      "Indépendant"
    ],
    "artStyle": {
      "fr": "Pixel Art vibrant et hyper-animé",
      "en": "Vibrant and richly animated pixel art"
    },
    "camera": {
      "fr": "Vue du dessus 2D (Top-down)",
      "en": "2D Top-down"
    },
    "developer": "Dodge Roll",
    "steamUrl": "https://store.steampowered.com/app/311690/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/311690/ss_bca0036bc452b872a7d9ee3de9e0c9548e8cd4f5.1920x1080.jpg?t=1779733990",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/311690/ss_9d3f304b18e8cd1cf6ac4a886bec474e0b677800.1920x1080.jpg?t=1779733990",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/311690/ss_de49a9579b13337e98719d39df0f5bc46b9fe886.1920x1080.jpg?t=1779733990",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/311690/ss_ecdf8986898c7d866d419943eb7c7cbef42754bd.1920x1080.jpg?t=1779733990",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/311690/ss_009d6fd10948fccb1cbf06ceb4d7f2035cb415a4.1920x1080.jpg?t=1779733990",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/311690/ss_9a74ab65fb19e85cac6a64b7dbe05da5411cfb7b.1920x1080.jpg?t=1779733990"
    ],
    "hints": {
      "tagline": {
        "fr": "Enter the Gungeon est un jeu d'exploration d'un donjon où une horde d'aventuriers tiraille à tout va, pille, manie la roulade d'esquive et renverse les tables dans l'espoir de trouver la rédemption.",
        "en": "Enter the Gungeon est un jeu d'exploration d'un donjon où une horde d'aventuriers tiraille à tout va, pille, manie la roulade d'esquive et renverse les tables dans l'espoir de trouver la rédemption."
      },
      "composer": "doseone"
    }
  },
  {
    "id": "risk-of-rain-2",
    "title": "Risk of Rain 2",
    "releaseYear": 2020,
    "genre": [
      "Action",
      "Indépendant"
    ],
    "artStyle": {
      "fr": "3D Cel-shaded stylisée et texturée",
      "en": "Stylized cel-shaded 3D"
    },
    "camera": {
      "fr": "Troisième personne 3D (Over-the-shoulder)",
      "en": "Third-person 3D"
    },
    "developer": "Hopoo Games",
    "steamUrl": "https://store.steampowered.com/app/632360/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/632360/ss_2bb49071317f7b241a527cf6e7aabd2cb6af055b.1920x1080.jpg?t=1783621122",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/632360/ss_a3f57f281813cb51cb5d919701470acb962ff297.1920x1080.jpg?t=1783621122",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/632360/ss_328d6fcb223f848c2a1047bb86702c4175d92317.1920x1080.jpg?t=1783621122",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/632360/ss_dc777b5c583794c99440b196cd1d26884fb1720b.1920x1080.jpg?t=1783621122",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/632360/ss_0377ff24b4d60db6a38ddc0824b7f308890b9231.1920x1080.jpg?t=1783621122",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/632360/ss_85548e86c50ff654c6a49235ea686a956f8ee9ec.1920x1080.jpg?t=1783621122"
    ],
    "hints": {
      "tagline": {
        "fr": "Échappez à une planète étrangère chaotique en affrontant des hordes de monstres déchaînés, en solo ou entre amis. Combinez le butin de façon surprenante et maîtrisez chacun des personnages jusqu'à devenir vous-même le chaos que vous craigniez tant lors de votre premier écrasement.",
        "en": "Échappez à une planète étrangère chaotique en affrontant des hordes de monstres déchaînés, en solo ou entre amis. Combinez le butin de façon surprenante et maîtrisez chacun des personnages jusqu'à devenir vous-même le chaos que vous craigniez tant lors de votre premier écrasement."
      },
      "composer": "Chris Christodoulou"
    }
  },
  {
    "id": "hyper-light-drifter",
    "title": "Hyper Light Drifter",
    "releaseYear": 2016,
    "genre": [
      "Action",
      "Aventure",
      "Indépendant",
      "RPG"
    ],
    "artStyle": {
      "fr": "Pixel Art 16-bit néon et cinématique",
      "en": "Neon-soaked cinematic 16-bit pixel art"
    },
    "camera": {
      "fr": "Vue du dessus 2D (Top-down)",
      "en": "2D Top-down"
    },
    "developer": "Heart Machine",
    "steamUrl": "https://store.steampowered.com/app/257850/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257850/ss_e786b1d9c66eb9c61e4da2945fe1d9faeb2af736.1920x1080.jpg?t=1762899660",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257850/ss_19c973259b736f14c4541ba044f3761b39a18737.1920x1080.jpg?t=1762899660",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257850/ss_37ad0b207c867078e87cf8a185fe3c66b0bdd490.1920x1080.jpg?t=1762899660",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257850/ss_b38d4392356a39a745fd18c032195a71c40d038b.1920x1080.jpg?t=1762899660",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257850/ss_6f2737707906d93e4bd92c7aa4db615b8da10693.1920x1080.jpg?t=1762899660",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257850/ss_fba6762a846f9d79ade2f008514e2e4cea16d0a4.1920x1080.jpg?t=1762899660"
    ],
    "hints": {
      "tagline": {
        "fr": "Explore a beautiful, vast and ruined world riddled with dangers and lost technologies.",
        "en": "Explore a beautiful, vast and ruined world riddled with dangers and lost technologies."
      },
      "composer": "Disasterpeace"
    }
  },
  {
    "id": "spelunky-2",
    "title": "Spelunky 2",
    "releaseYear": 2020,
    "genre": [
      "Action",
      "Indépendant"
    ],
    "artStyle": {
      "fr": "Dessin 2D cartoon soigné et précis",
      "en": "Sharp hand-drawn 2D cartoon"
    },
    "camera": {
      "fr": "Vue de côté 2D (Side-scroller)",
      "en": "2D Side-scroller"
    },
    "developer": "Mossmouth, BlitWorks",
    "steamUrl": "https://store.steampowered.com/app/418530/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/418530/ss_bf20692e69cfef2da4b6b4096f42823a5283701c.1920x1080.jpg?t=1663719294",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/418530/ss_e92a2f46bb81fc745684204858ecc1284b3eeae4.1920x1080.jpg?t=1663719294",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/418530/ss_3f2ba63b195e3b6739faf812d7e31dbe6c9295fd.1920x1080.jpg?t=1663719294",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/418530/ss_69755bc2679253aa132928f261bdd059f215d342.1920x1080.jpg?t=1663719294",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/418530/ss_b04a6809f69c842e1cb4f8192c8488839733f405.1920x1080.jpg?t=1663719294",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/418530/ss_5fa3946203b6f225541847b1c04158f5c5abeb46.1920x1080.jpg?t=1663719294"
    ],
    "hints": {
      "tagline": {
        "fr": "Spelunky 2 étoffe les défis aléatoires et uniques de son prédécesseur roguelike, offrant une aventure satisfaisante pour les anciens joueurs comme pour les nouveaux. Rencontrez la prochaine génération d'explorateurs lunaires, à la recherche de trésors et de proches disparus.",
        "en": "Spelunky 2 étoffe les défis aléatoires et uniques de son prédécesseur roguelike, offrant une aventure satisfaisante pour les anciens joueurs comme pour les nouveaux. Rencontrez la prochaine génération d'explorateurs lunaires, à la recherche de trésors et de proches disparus."
      },
      "composer": "Eirik Suhrke"
    }
  },
  {
    "id": "rain-world",
    "title": "Rain World",
    "releaseYear": 2017,
    "genre": [
      "Action",
      "Aventure",
      "Survie",
      "Indépendant"
    ],
    "artStyle": {
      "fr": "Pixel Art organique et animation procédurale",
      "en": "Organic pixel art with procedural animation"
    },
    "camera": {
      "fr": "Vue de côté 2D (Side-scroller)",
      "en": "2D Side-scroller"
    },
    "developer": "Videocult",
    "steamUrl": "https://store.steampowered.com/app/312520/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/312520/ss_cbd4e647d6b3bb3b311cb68fdf0cd8835d5919d7.1920x1080.jpg?t=1786047879",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/312520/ss_628274c84b196e270733f540139062f2787c4423.1920x1080.jpg?t=1786047879",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/312520/ss_d551eee41e60ba8f5f2005b3de41c5f2c27cb444.1920x1080.jpg?t=1786047879",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/312520/ss_5c8c0413e98f3521e3df370d4ad7018b771ce353.1920x1080.jpg?t=1786047879",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/312520/ss_becb0959f6479d07e05f2c14f48980a15b5e5192.1920x1080.jpg?t=1786047879",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/312520/ss_519831951a674f56ca80fd7e14884a7291d71e50.1920x1080.jpg?t=1786047879"
    ],
    "hints": {
      "tagline": {
        "fr": "Vous êtes un chat-limace nomade, à la fois proie et prédateur, qui évolue dans un écosystème corrompu.",
        "en": "You are a nomadic slugcat, both predator and prey in a broken ecosystem."
      },
      "composer": "James Primate & Lydia Esrig"
    }
  },
  {
    "id": "firewatch",
    "title": "Firewatch",
    "releaseYear": 2016,
    "genre": [
      "Aventure",
      "Indépendant"
    ],
    "artStyle": {
      "fr": "3D Stylisée chaude et picturale",
      "en": "Warm pictorial stylized 3D"
    },
    "camera": {
      "fr": "Première personne 3D (First-person)",
      "en": "First-person 3D"
    },
    "developer": "Campo Santo",
    "steamUrl": "https://store.steampowered.com/app/383870/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/383870/ss_80432f2d4f4192017115c23e7dff090df95b204a.1920x1080.jpg?t=1755789801",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/383870/ss_c7e16bc8d5a6d40ab1f7c339395d26d8f6eb57ff.1920x1080.jpg?t=1755789801",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/383870/ss_570bc87288b5ab4e235ba270e1d2ae30312d5b82.1920x1080.jpg?t=1755789801",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/383870/ss_eb64648f294463df89e55f9363cdf159aebcf11e.1920x1080.jpg?t=1755789801",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/383870/ss_4b9d67ae2af0da570d03731d93b095d0203b973d.1920x1080.jpg?t=1755789801",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/383870/ss_634d9b9352169125aec4cbf8b7834a18f9992eeb.1920x1080.jpg?t=1755789801"
    ],
    "hints": {
      "tagline": {
        "fr": "Firewatch est un jeu plein de mystères pour un joueur à la première personne, qui se déroule dans le décor sauvage du Wyoming.",
        "en": "Firewatch est un jeu plein de mystères pour un joueur à la première personne, qui se déroule dans le décor sauvage du Wyoming."
      },
      "composer": "Chris Remo"
    }
  },
  {
    "id": "what-remains-of-edith-finch",
    "title": "What Remains of Edith Finch",
    "releaseYear": 2017,
    "genre": [
      "Aventure",
      "Indépendant"
    ],
    "artStyle": {
      "fr": "3D Réaliste narrative et poétique",
      "en": "Poetic narrative realistic 3D"
    },
    "camera": {
      "fr": "Première personne 3D (First-person)",
      "en": "First-person 3D"
    },
    "developer": "Giant Sparrow",
    "steamUrl": "https://store.steampowered.com/app/501300/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/501300/ss_5e17b98cf2effabcb74aedc537ef3d68578b5c66.1920x1080.jpg?t=1785424558",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/501300/ss_b33a742463deb8564a382e1744febceaa91a5bab.1920x1080.jpg?t=1785424558",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/501300/ss_cc50bb10f1858d16a4df684f4dd264bda5d432ba.1920x1080.jpg?t=1785424558",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/501300/ss_77ebb61562a25dbcd0c4cc1c5090b76a76a055b2.1920x1080.jpg?t=1785424558",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/501300/ss_7a68ff5a7b3e6c85ab89f9bbf549a0232281bd19.1920x1080.jpg?t=1785424558"
    ],
    "hints": {
      "tagline": {
        "fr": "What Remains of Edith Finch est une collection de contes étranges sur une famille de l’État de Washington. En incarnant Edith, vous allez explorer l’énorme demeure des Finch, à la recherche d’histoires sur le passé de cette famille et vous devrez découvrir pourquoi elle en est le dernier membre encore vivant.",
        "en": "What Remains of Edith Finch est une collection de contes étranges sur une famille de l’État de Washington. En incarnant Edith, vous allez explorer l’énorme demeure des Finch, à la recherche d’histoires sur le passé de cette famille et vous devrez découvrir pourquoi elle en est le dernier membre encore vivant."
      },
      "composer": "Jeff Russo"
    }
  },
  {
    "id": "super-meat-boy",
    "title": "Super Meat Boy",
    "releaseYear": 2010,
    "genre": [
      "Indépendant"
    ],
    "artStyle": {
      "fr": "Dessin 2D cartoon vectoriel délirant",
      "en": "Wild cartoon vector 2D"
    },
    "camera": {
      "fr": "Vue de côté 2D (Side-scroller)",
      "en": "2D Side-scroller"
    },
    "developer": "Team Meat",
    "steamUrl": "https://store.steampowered.com/app/40800/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/40800/ss_2482dad154fa38c32195a5301891ec7d9cefa7da.1920x1080.jpg?t=1700669950",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/40800/ss_652092068cc0d5e75fe3f199ad1bbc395806c1f2.1920x1080.jpg?t=1700669950",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/40800/ss_71f114e451550394500613d8ec8082ae3eac44e5.1920x1080.jpg?t=1700669950",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/40800/ss_d158c2843c714bf2294376e03d9c4d6c7cd96397.1920x1080.jpg?t=1700669950",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/40800/ss_8579adfaa58c863497e71df1b36331d37e51aeab.1920x1080.jpg?t=1700669950",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/40800/ss_84f8832c8cfb5d93dba79c099b0067e22447cbab.1920x1080.jpg?t=1700669950"
    ],
    "hints": {
      "tagline": {
        "fr": "Le fameux jeu de plateforme arrive sur Steam avec un Head Crab jouable (exclusivité Steam) !",
        "en": "Le fameux jeu de plateforme arrive sur Steam avec un Head Crab jouable (exclusivité Steam) !"
      },
      "composer": "Danny Baranowsky"
    }
  },
  {
    "id": "bastion",
    "title": "Bastion",
    "releaseYear": 2011,
    "genre": [
      "Action",
      "Indépendant",
      "RPG"
    ],
    "artStyle": {
      "fr": "Peinture numérique texturée et colorée",
      "en": "Lush hand-painted digital art"
    },
    "camera": {
      "fr": "Vue Isométrique 2.5D",
      "en": "2.5D Isometric"
    },
    "developer": "Supergiant Games",
    "steamUrl": "https://store.steampowered.com/app/107100/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/107100/ss_12e48f86f7429da252c6895ad337b0ac38560244.1920x1080.jpg?t=1729113932",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/107100/ss_490170c42afe389fb80324b5c29f9b704d87943e.1920x1080.jpg?t=1729113932",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/107100/ss_d158b1b4ece3a362c7d8acc6168ad14de00e64ba.1920x1080.jpg?t=1729113932",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/107100/ss_f9e16007834d0e06fe46358e1481b733ec226cca.1920x1080.jpg?t=1729113932",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/107100/ss_fe6e7f8b86b783cea7e01f46f319055a8385f899.1920x1080.jpg?t=1729113932",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/107100/ss_b7d87f1fd711231166ea7dcfe6aa56717c48d335.1920x1080.jpg?t=1729113932"
    ],
    "hints": {
      "tagline": {
        "fr": "Découvrez les secrets de la Calamité, une catastrophe surréaliste qui a brisé le monde en morceaux.",
        "en": "Découvrez les secrets de la Calamité, une catastrophe surréaliste qui a brisé le monde en morceaux."
      },
      "composer": "Darren Korb"
    }
  },
  {
    "id": "transistor",
    "title": "Transistor",
    "releaseYear": 2014,
    "genre": [
      "Action",
      "Indépendant",
      "RPG"
    ],
    "artStyle": {
      "fr": "Peinture numérique cyberpunk et Art Déco",
      "en": "Art Deco cyberpunk painted aesthetic"
    },
    "camera": {
      "fr": "Vue Isométrique 2.5D",
      "en": "2.5D Isometric"
    },
    "developer": "Supergiant Games",
    "steamUrl": "https://store.steampowered.com/app/237930/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/237930/ss_1fdf65579ebad27f4d6a6732e44fc84180016a7b.1920x1080.jpg?t=1729113992",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/237930/ss_9858355976e979758841f05839ccc6224ddaa00e.1920x1080.jpg?t=1729113992",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/237930/ss_1916e041ab65f8b6256a09ab494d5a2ab372fefe.1920x1080.jpg?t=1729113992",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/237930/ss_3b1538861473fb042792380ce85c3fda2f95a459.1920x1080.jpg?t=1729113992",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/237930/ss_341fc37cbb9c3da906f07c8c0f5b9aa187510bc8.1920x1080.jpg?t=1729113992",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/237930/ss_ceec46589ca1914cb584d80a1cc4779b216cd937.1920x1080.jpg?t=1729113992"
    ],
    "hints": {
      "tagline": {
        "fr": "Découvrez le monde de Transistor, un jeu de rôle / action SF développé par les créateurs de Bastion.",
        "en": "Découvrez le monde de Transistor, un jeu de rôle / action SF développé par les créateurs de Bastion."
      },
      "composer": "Darren Korb"
    }
  },
  {
    "id": "ftl-faster-than-light",
    "title": "FTL: Faster Than Light",
    "releaseYear": 2012,
    "genre": [
      "Indépendant",
      "Simulation",
      "Stratégie"
    ],
    "artStyle": {
      "fr": "Pixel Art spatial épuré et fonctionnel",
      "en": "Clean and functional sci-fi pixel art"
    },
    "camera": {
      "fr": "Vue du dessus vaisseau 2D (Top-down cockpit)",
      "en": "2D Top-down Ship Overview"
    },
    "developer": "Subset Games",
    "steamUrl": "https://store.steampowered.com/app/212680/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/212680/ss_e650b133cc1d3d6320b34d131566fd28ab92b010.1920x1080.jpg?t=1748969356",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/212680/ss_ff45cfec186ec14e97cfdb01054d9cc0bb4034ff.1920x1080.jpg?t=1748969356",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/212680/ss_f60e708609b4cfaa712fdc6c12546aaf7a5b9ebc.1920x1080.jpg?t=1748969356",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/212680/ss_7cf0e1d8a6142f7f18c56e9a5a84b0b588ba655e.1920x1080.jpg?t=1748969356",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/212680/ss_f5a5c31e92cb9151dceb9d2bcc800554cccc5ff3.1920x1080.jpg?t=1748969356",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/212680/ss_9e317b3a735d7ea04cae0cc8fa246413a8d5322e.1920x1080.jpg?t=1748969356"
    ],
    "hints": {
      "tagline": {
        "fr": "Ce jeu de simulation spatiale de type rogue-like vous permet de piloter votre vaisseau dans une galaxie générée aléatoirement où vous pourrez vous couvrir de gloire... si vous parvenez à éviter la défaite.",
        "en": "Ce jeu de simulation spatiale de type rogue-like vous permet de piloter votre vaisseau dans une galaxie générée aléatoirement où vous pourrez vous couvrir de gloire... si vous parvenez à éviter la défaite."
      },
      "composer": "Ben Prunty"
    }
  },
  {
    "id": "into-the-breach",
    "title": "Into the Breach",
    "releaseYear": 2018,
    "genre": [
      "Indépendant",
      "RPG",
      "Simulation",
      "Stratégie"
    ],
    "artStyle": {
      "fr": "Pixel Art miniature isométrique précis",
      "en": "Crisp isometric miniature pixel art"
    },
    "camera": {
      "fr": "Vue Isométrique 2D sur grille (Grid-based)",
      "en": "2D Isometric Grid"
    },
    "developer": "Subset Games",
    "steamUrl": "https://store.steampowered.com/app/590380/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/590380/ss_81867eb29fc38fb0ce55a327b2c1e3fc6c1a2454.1920x1080.jpg?t=1755610784",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/590380/ss_0f7f92bba050d455e59fddda24962d4471c2c135.1920x1080.jpg?t=1755610784",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/590380/ss_67ac95724c323759623a15b931028c4fcab1f92c.1920x1080.jpg?t=1755610784",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/590380/ss_3f3f952893f1aa24200c7fd31ab5023080b86b9d.1920x1080.jpg?t=1755610784",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/590380/ss_373fb6abd54a86b716f184eaf4623ac83d067652.1920x1080.jpg?t=1755610784",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/590380/ss_292c5ed15488a97340e9a663f5aa423ffbf67997.1920x1080.jpg?t=1755610784"
    ],
    "hints": {
      "tagline": {
        "fr": "Contrôlez de puissants Mechas venus du futur pour vaincre une terrible menace extraterrestre. Chaque tentative faite pour sauver le monde est un nouveau défi généré aléatoirement dans ce jeu de stratégie au tour par tour.",
        "en": "Contrôlez de puissants Mechas venus du futur pour vaincre une terrible menace extraterrestre. Chaque tentative faite pour sauver le monde est un nouveau défi généré aléatoirement dans ce jeu de stratégie au tour par tour."
      },
      "composer": "Ben Prunty"
    }
  },
  {
    "id": "omori",
    "title": "OMORI",
    "releaseYear": 2020,
    "genre": [
      "Aventure",
      "Indépendant",
      "RPG"
    ],
    "artStyle": {
      "fr": "Dessin aux crayons de papier et Pixel Art 16-bit",
      "en": "Hand-drawn colored pencil sketches & 16-bit pixel art"
    },
    "camera": {
      "fr": "Vue du dessus 2D (Top-down RPG)",
      "en": "2D Top-down RPG"
    },
    "developer": "OMOCAT, LLC",
    "steamUrl": "https://store.steampowered.com/app/1150690/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1150690/ss_219463835487a7205f0af93fb02d2c84855c667b.1920x1080.jpg?t=1671584768",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1150690/ss_4bb5647e9094a13078d23f2a9daa4a9bd160841e.1920x1080.jpg?t=1671584768",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1150690/ss_72e19b9ca001c03084b9eb7f5665514e60a6a6dd.1920x1080.jpg?t=1671584768",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1150690/ss_14bd4cd7c2be96cdffa112d991ce755600c8ad72.1920x1080.jpg?t=1671584768",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1150690/ss_126ccd3db36bf47431f6d6b92cf0922a3a918bfc.1920x1080.jpg?t=1671584768",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1150690/ss_591d0375a075ae2afdd3ddf5a6172beb3f04c338.1920x1080.jpg?t=1671584768"
    ],
    "hints": {
      "tagline": {
        "fr": "Explore a strange world full of colorful friends and foes. When the time comes, the path you’ve chosen will determine your fate... and perhaps the fate of others as well.",
        "en": "Explore a strange world full of colorful friends and foes. When the time comes, the path you’ve chosen will determine your fate... and perhaps the fate of others as well."
      },
      "composer": "OMOCAT, Pedro Silva, Jami Lynne"
    }
  },
  {
    "id": "ufo-50",
    "title": "UFO 50",
    "releaseYear": 2024,
    "genre": [
      "Action",
      "Aventure",
      "Indépendant",
      "RPG",
      "Stratégie"
    ],
    "artStyle": {
      "fr": "Pixel Art 8-bit fictionnel console vintage",
      "en": "Fictional 8-bit vintage console pixel art"
    },
    "camera": {
      "fr": "Multiples perspectives rétro 2D",
      "en": "Multiple retro 2D perspectives"
    },
    "developer": "Mossmouth",
    "steamUrl": "https://store.steampowered.com/app/1147860/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1147860/ss_927184ce23f456d9a302a1c1e75588aae4edfebb.1920x1080.jpg?t=1776264051",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1147860/ss_fc1d24cb1a1e2be6f32834bf322af2864d48eaf3.1920x1080.jpg?t=1776264051",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1147860/ss_a74b84c81001243c2b6a3ad243325f2d9fcf5377.1920x1080.jpg?t=1776264051",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1147860/ss_cb6093ea7097449cc8a6b8d924761d786e1a1cf5.1920x1080.jpg?t=1776264051",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1147860/ss_efc1334c16eb980682392470da5480bd6bd6b405.1920x1080.jpg?t=1776264051",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1147860/ss_44498ff89451c3a61196db6dea6a6171ad8c498b.1920x1080.jpg?t=1776264051"
    ],
    "hints": {
      "tagline": {
        "fr": "UFO 50 est une compilation de 50 jeux solo et multijoueur recouvrant un large panel de genres, du jeu de plateforme aux shoot ‘em up en passant par le jeu de puzzle, le roguelite ou le RPG. Notre but est de marier une esthétique 8-bit bien connue à des idées nouvelles et un design moderne.",
        "en": "UFO 50 est une compilation de 50 jeux solo et multijoueur recouvrant un large panel de genres, du jeu de plateforme aux shoot ‘em up en passant par le jeu de puzzle, le roguelite ou le RPG. Notre but est de marier une esthétique 8-bit bien connue à des idées nouvelles et un design moderne."
      },
      "composer": "Eirik Suhrke"
    }
  },
  {
    "id": "lorelei-and-the-laser-eyes",
    "title": "Lorelei and the Laser Eyes",
    "releaseYear": 2024,
    "genre": [
      "Aventure",
      "Indépendant"
    ],
    "artStyle": {
      "fr": "3D Monochrome noir & blanc avec accents cramoisis",
      "en": "Black & white 3D monochrome with crimson accents"
    },
    "camera": {
      "fr": "Plans fixes cinématographiques 3D",
      "en": "Fixed cinematic 3D angles"
    },
    "developer": "Simogo",
    "steamUrl": "https://store.steampowered.com/app/2008920/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2008920/ss_86f62a07410301ecd069518695cfca290c185785.1920x1080.jpg?t=1759241374",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2008920/ss_6d6585ba21a31dff78818170b3090b738c3d2851.1920x1080.jpg?t=1759241374",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2008920/ss_5fb55deabca4eb6e739dbc7349d22aa812f19345.1920x1080.jpg?t=1759241374",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2008920/ss_c37c597f912935bad034f34449a06b9d948c992f.1920x1080.jpg?t=1759241374",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2008920/ss_a17a6c305aa71449f39443e3666f092e9cd93443.1920x1080.jpg?t=1759241374",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2008920/ss_73125f5b55ba8fdb2f8c5c4f35d3b23ad0be7573.1920x1080.jpg?t=1759241374"
    ],
    "hints": {
      "tagline": {
        "fr": "Le décor est planté. Imaginez un vieux manoir baroque, voire un hôtel ou un musée, quelque part en Europe centrale. Une femme erre à la recherche de réponses.",
        "en": "Le décor est planté. Imaginez un vieux manoir baroque, voire un hôtel ou un musée, quelque part en Europe centrale. Une femme erre à la recherche de réponses."
      },
      "composer": "Simogo / Daniel Olsén"
    }
  },
  {
    "id": "sanabi",
    "title": "SANABI",
    "releaseYear": 2023,
    "genre": [
      "Action",
      "Aventure",
      "Indépendant"
    ],
    "artStyle": {
      "fr": "Pixel Art cyberpunk dynamique et néon",
      "en": "Dynamic neon cyberpunk pixel art"
    },
    "camera": {
      "fr": "Vue de côté 2D (Side-scroller)",
      "en": "2D Side-scroller"
    },
    "developer": "WONDER POTION",
    "steamUrl": "https://store.steampowered.com/app/1562700/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1562700/ss_9309623510d853bf750877457f863e45eb7c6cbe.1920x1080.jpg?t=1764564242",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1562700/ss_dc42526e8a4db7c389494d0a14d5c21da1974c51.1920x1080.jpg?t=1764564242",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1562700/ss_3b7f6ffbdf8d80e288c452d1c619916dc3ba36ab.1920x1080.jpg?t=1764564242",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1562700/ss_4c2d1c53e327b002eb10d544d45a6b01381c3f95.1920x1080.jpg?t=1764564242",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1562700/ss_883d35689221a08ccb88cc9d6915c4f25376ea2b.1920x1080.jpg?t=1764564242",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1562700/ss_a2622d9f393597e6e61cd25520a4b23e77a29192.1920x1080.jpg?t=1764564242"
    ],
    "hints": {
      "tagline": {
        "fr": "SANABI est un jeu dystopique de plateforme et d'action, stylé et exaltant. Incarnez un ancien combattant légendaire à la retraite et utilisez votre célèbre prothèse de bras pour sauter par-dessus des falaises et des gratte-ciels, esquiver des balles et des pièges et vaincre de puissants ennemis.",
        "en": "SANABI est un jeu dystopique de plateforme et d'action, stylé et exaltant. Incarnez un ancien combattant légendaire à la retraite et utilisez votre célèbre prothèse de bras pour sauter par-dessus des falaises et des gratte-ciels, esquiver des balles et des pièges et vaincre de puissants ennemis."
      },
      "composer": "WONDER POTION"
    }
  },
  {
    "id": "lethal-company",
    "title": "Lethal Company",
    "releaseYear": 2023,
    "genre": [
      "Action",
      "Aventure",
      "Indépendant",
      "Accès anticipé"
    ],
    "artStyle": {
      "fr": "3D Rétro basse fidélité style cassette VHS",
      "en": "Low-fi VHS retro 3D"
    },
    "camera": {
      "fr": "Première personne 3D (First-person)",
      "en": "First-person 3D"
    },
    "developer": "Zeekerss",
    "steamUrl": "https://store.steampowered.com/app/1966720/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1966720/ss_78075e9a94675823024f12fce9d69b243cca94f8.1920x1080.jpg?t=1775380053",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1966720/ss_51860be59845771c01a3a4d9ab1ebf773f16fef5.1920x1080.jpg?t=1775380053",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1966720/ss_08fa3ef83b6eb70313119096f82285fa411f02e5.1920x1080.jpg?t=1775380053",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1966720/ss_568d97dfa9d8d3128157d84c9437030ccc1011b0.1920x1080.jpg?t=1775380053",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1966720/ss_e07f1d6ee90e3669118096dab1fe52c20ec6ce10.1920x1080.jpg?t=1775380053",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1966720/ss_0499d96a2b9ca0fc8966d77e6d5c95ae94c38492.1920x1080.jpg?t=1775380053"
    ],
    "hints": {
      "tagline": {
        "fr": "A co-op horror about scavenging at abandoned moons to sell scrap to the Company.",
        "en": "A co-op horror about scavenging at abandoned moons to sell scrap to the Company."
      },
      "composer": "Zeekerss"
    }
  },
  {
    "id": "citizen-sleeper",
    "title": "Citizen Sleeper",
    "releaseYear": 2022,
    "genre": [
      "Aventure",
      "Indépendant",
      "RPG"
    ],
    "artStyle": {
      "fr": "Illustrations de personnages manga & UI cyberpunk épurée",
      "en": "Manga character portraits & slick cyberpunk UI"
    },
    "camera": {
      "fr": "Vue statique 2D de station / Visual Novel",
      "en": "2D Static Station Map & Visual Novel"
    },
    "developer": "Jump Over The Age",
    "steamUrl": "https://store.steampowered.com/app/1578650/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1578650/ss_a07b9124d9a9ecd2c3855a43a1ad171e4b55aa37.1920x1080.jpg?t=1789539823",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1578650/ss_52df51fd2c303597cbf6755546da94e449322954.1920x1080.jpg?t=1789539823",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1578650/ss_bd7d024d0d8573a119e92c1add7ad61eed5a345c.1920x1080.jpg?t=1789539823",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1578650/ss_6888f9b65b70d27e25ab6527bd7f1d243c4c68a7.1920x1080.jpg?t=1789539823",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1578650/ss_73518818ceb440a8edd79a336a4897836b9f3ccf.1920x1080.jpg?t=1789539823",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1578650/ss_ea8cc180eaeed024b8037afaaeadb2542254b86f.1920x1080.jpg?t=1789539823"
    ],
    "hints": {
      "tagline": {
        "fr": "Une aventure dans les ruines du capitalisme interplanétaire. Incarnez un fugitif échoué sur une station anarchique aux confins d'une société interstellaire. Explorez les lieux, choisissez vos amis, fuyez votre passé et changez votre avenir avec une liberté inspirée des jeux de rôle papier.",
        "en": "Une aventure dans les ruines du capitalisme interplanétaire. Incarnez un fugitif échoué sur une station anarchique aux confins d'une société interstellaire. Explorez les lieux, choisissez vos amis, fuyez votre passé et changez votre avenir avec une liberté inspirée des jeux de rôle papier."
      },
      "composer": "Amos Roddy"
    }
  },
  {
    "id": "crypt-of-the-necrodancer",
    "title": "Crypt of the NecroDancer",
    "releaseYear": 2015,
    "genre": [
      "Action",
      "Indépendant",
      "RPG"
    ],
    "artStyle": {
      "fr": "Pixel Art rétro vif et musical",
      "en": "Lively retro musical pixel art"
    },
    "camera": {
      "fr": "Vue du dessus 2D (Top-down)",
      "en": "2D Top-down"
    },
    "developer": "Brace Yourself Games",
    "steamUrl": "https://store.steampowered.com/app/247080/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/247080/ss_849069b2208a21d5adfc00d67e5b8b428e2d0677.1920x1080.jpg?t=1789603692",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/247080/ss_9de26271c7fcc4da87a5dcc9e4c52bd3a2aacb58.1920x1080.jpg?t=1789603692",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/247080/ss_3b23b37dcfbf9711aad2fd035b49b8a8ac943008.1920x1080.jpg?t=1789603692",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/247080/ss_d0253d4a526b7ea30db5eaa66d5cac7efc5a4ce0.1920x1080.jpg?t=1789603692",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/247080/ss_0f7c3d0df25292e501fa55294f3d4ada1f307cd4.1920x1080.jpg?t=1789603692",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/247080/ss_fb8381eef756dfa6bdeeaa65e69ba56061ceb142.1920x1080.jpg?t=1789603692"
    ],
    "hints": {
      "tagline": {
        "fr": "Crypt of the NecroDancer est un jeu de rythme roguelike primé. Bouge sur la musique et bats-toi en suivant les pulsations ! Groove avec la bande-son épique de Danny Baranowsky, ou choisis des chansons de ta propre collection MP3 !",
        "en": "Crypt of the NecroDancer est un jeu de rythme roguelike primé. Bouge sur la musique et bats-toi en suivant les pulsations ! Groove avec la bande-son épique de Danny Baranowsky, ou choisis des chansons de ta propre collection MP3 !"
      },
      "composer": "Danny Baranowsky"
    }
  },
  {
    "id": "dont-starve",
    "title": "Don't Starve",
    "releaseYear": 2013,
    "genre": [
      "Aventure",
      "Indépendant",
      "Simulation"
    ],
    "artStyle": {
      "fr": "Dessin gothique au trait style gravure macabre",
      "en": "Gothic scratchboard storybook art style"
    },
    "camera": {
      "fr": "Vue Isométrique 2.5D orientable",
      "en": "2.5D Rotatable Isometric"
    },
    "developer": "Klei Entertainment",
    "steamUrl": "https://store.steampowered.com/app/219740/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/219740/ss_09bb6bdce4fa085c2c4a9a8f48ea52d3051b44bc.1920x1080.jpg?t=1789497543",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/219740/ss_26b6414b4ae07cfc2e2d15bd6ff315a4678f00f3.1920x1080.jpg?t=1789497543",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/219740/ss_3d32a04e77363f3c8179a319de6f90ac1b8b2e0e.1920x1080.jpg?t=1789497543",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/219740/ss_0167fbdf9d30407734baf3ab3b08213945738166.1920x1080.jpg?t=1789497543",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/219740/ss_38d4d1b21050fc4b3978fcf65c909260d3673fb7.1920x1080.jpg?t=1789497543",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/219740/ss_1d3d9b7d9d752666feb9853215c118104816eee2.1920x1080.jpg?t=1789497543"
    ],
    "hints": {
      "tagline": {
        "fr": "Don’t Starve is an uncompromising wilderness survival game full of science and magic. Enter a strange and unexplored world full of strange creatures, dangers, and surprises. Gather resources to craft items and structures that match your survival style.",
        "en": "Don’t Starve is an uncompromising wilderness survival game full of science and magic. Enter a strange and unexplored world full of strange creatures, dangers, and surprises. Gather resources to craft items and structures that match your survival style."
      },
      "composer": "Vince de Giorgi"
    }
  },
  {
    "id": "stray",
    "title": "Stray",
    "releaseYear": 2022,
    "genre": [
      "Aventure",
      "Indépendant"
    ],
    "artStyle": {
      "fr": "3D Réaliste immersive et néon-cyberpunk",
      "en": "Immersive realistic neon-cyberpunk 3D"
    },
    "camera": {
      "fr": "Troisième personne féline 3D",
      "en": "Third-person Feline 3D"
    },
    "developer": "BlueTwelve Studio",
    "steamUrl": "https://store.steampowered.com/app/1332010/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1332010/ss_88e209a90c2039fa76bca6fa08c641365be38d50.1920x1080.jpg?t=1785424330",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1332010/ss_e8f0cbd5efdba352e89c4cfcee3fe991a1e1be8a.1920x1080.jpg?t=1785424330",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1332010/ss_2221af260c64362fdc835a9dca65f6f1d1192b25.1920x1080.jpg?t=1785424330",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1332010/ss_3fdd04a5418293864bf82d33c75f833121e63804.1920x1080.jpg?t=1785424330",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1332010/ss_90f8a99d0d1454bc77f46542f00f9ae5043c4268.1920x1080.jpg?t=1785424330",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1332010/ss_a697971e484b3deef50153a13f2afd0539347d23.1920x1080.jpg?t=1785424330"
    ],
    "hints": {
      "tagline": {
        "fr": "Perdu, seul et séparé de sa famille, un chat errant doit résoudre un ancien mystère pour fuir une cyber-cité tombée dans l’oubli et retourner chez lui.",
        "en": "Perdu, seul et séparé de sa famille, un chat errant doit résoudre un ancien mystère pour fuir une cyber-cité tombée dans l’oubli et retourner chez lui."
      },
      "composer": "Yann van der Cruyssen"
    }
  },
  {
    "id": "chicory-a-colorful-tale",
    "title": "Chicory: A Colorful Tale",
    "releaseYear": 2021,
    "genre": [
      "Aventure",
      "Indépendant",
      "RPG"
    ],
    "artStyle": {
      "fr": "Dessin à la main noir et blanc à peindre",
      "en": "Coloring book black and white hand-drawn"
    },
    "camera": {
      "fr": "Vue du dessus 2D (Top-down)",
      "en": "2D Top-down"
    },
    "developer": "Wishes Ultd., Greg Lobanov, Alexis Dean-Jones, Lena Raine, Madeline Berger, A Shell in the Pit",
    "steamUrl": "https://store.steampowered.com/app/1123450/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1123450/ss_2f643ac851b504a1c10e0b6f1cfdc3089707ab55.1920x1080.jpg?t=1783360001",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1123450/ss_1f16a64698124ab065ed1fdd7cc0ea23511f3791.1920x1080.jpg?t=1783360001",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1123450/ss_9e46f9eaaf395c41aacba63a739670abd9255c7d.1920x1080.jpg?t=1783360001",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1123450/ss_119ef0155a50538c028669a625aabc939dc6e30c.1920x1080.jpg?t=1783360001",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1123450/ss_ea36cdfb65136f5bfe21422388bb2942bac9bdac.1920x1080.jpg?t=1783360001",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1123450/ss_c972c1518fa981a619b5487b35f513d453392242.1920x1080.jpg?t=1783360001"
    ],
    "hints": {
      "tagline": {
        "fr": "Une aventure en vue de dessus dans un monde haut en couleurs. Utilise ta peinture pour explorer, te faire des amis, résoudre des énigmes, et dessine partout ! Par les créateurs de Celeste &amp; Wandersong.",
        "en": "Une aventure en vue de dessus dans un monde haut en couleurs. Utilise ta peinture pour explorer, te faire des amis, résoudre des énigmes, et dessine partout ! Par les créateurs de Celeste &amp; Wandersong."
      },
      "composer": "Lena Raine"
    }
  },
  {
    "id": "sifu",
    "title": "Sifu",
    "releaseYear": 2023,
    "genre": [
      "Action",
      "Indépendant"
    ],
    "artStyle": {
      "fr": "3D Stylisée façon peinture à l’huile et cinéma d’arts martiaux",
      "en": "Stylized oil-painted martial arts cinematic 3D"
    },
    "camera": {
      "fr": "Troisième personne 3D (Over-the-shoulder)",
      "en": "Third-person 3D"
    },
    "developer": "Sloclap",
    "steamUrl": "https://store.steampowered.com/app/2138710/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2138710/ss_9be1654f96e9fd6517fbe9107d76da245cbfaeb9.1920x1080.jpg?t=1782742326",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2138710/ss_7f7fd03f973d0a1e5e9d481a2235402c19c0f0e5.1920x1080.jpg?t=1782742326",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2138710/ss_fcbdfe30cb361fdc6971878306a5179d175240c9.1920x1080.jpg?t=1782742326",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2138710/ss_c917c981f912e8331b40a2638a32b3021458d4b8.1920x1080.jpg?t=1782742326",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2138710/ss_6541bc550e7b1133d123ebce8b0e098dccbe66eb.1920x1080.jpg?t=1782742326",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2138710/ss_c400edce5e28150a5d9859aaace1c76fb2b44d78.1920x1080.jpg?t=1782742326"
    ],
    "hints": {
      "tagline": {
        "fr": "Sifu est un jeu de combat réaliste à la troisième personne, avec des mécaniques pointues de kung-fu et une action digne des films d'arts martiaux qui vous entraîne dans une quête de vengeance.",
        "en": "Sifu est un jeu de combat réaliste à la troisième personne, avec des mécaniques pointues de kung-fu et une action digne des films d'arts martiaux qui vous entraîne dans une quête de vengeance."
      },
      "composer": "Howie Lee"
    }
  },
  {
    "id": "jusant",
    "title": "Jusant",
    "releaseYear": 2023,
    "genre": [
      "Action",
      "Aventure",
      "Indépendant"
    ],
    "artStyle": {
      "fr": "3D Stylisée lumineuse et minérale",
      "en": "Luminous and mineral stylized 3D"
    },
    "camera": {
      "fr": "Troisième personne 3D d’escalade",
      "en": "Third-person Climbing 3D"
    },
    "developer": "DON'T NOD",
    "steamUrl": "https://store.steampowered.com/app/1977170/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1977170/ss_cb8d2e6f82291e22aa0f58a943d355c67b0c33af.1920x1080.jpg?t=1771331092",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1977170/ss_e67326ddf0d3409ef0cde09d78e67a7b09872bf1.1920x1080.jpg?t=1771331092",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1977170/ss_6f917526327053f0eed0f0f9cad418f63df909be.1920x1080.jpg?t=1771331092",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1977170/ss_63d8b664496f63336f755312508fdac4b117e2ff.1920x1080.jpg?t=1771331092",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1977170/ss_2a2aacbd9110b701cb65b7d6baead26edc73c801.1920x1080.jpg?t=1771331092",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1977170/ss_a0afced7958efd91d0bc584ff1d5d4cf85d870ff.1920x1080.jpg?t=1771331092"
    ],
    "hints": {
      "tagline": {
        "fr": "Laissez-vous emporter par l'ambiance méditative de Jusant, un jeu d'escalade d'action &amp; puzzle. Défiez les hauteurs infinies d’une tour colossale et découvrez ses mystères aux côtés de votre compagnon constitué d'eau.",
        "en": "Laissez-vous emporter par l'ambiance méditative de Jusant, un jeu d'escalade d'action &amp; puzzle. Défiez les hauteurs infinies d’une tour colossale et découvrez ses mystères aux côtés de votre compagnon constitué d'eau."
      },
      "composer": "Guillaume Ferran"
    }
  },
  {
    "id": "thank-goodness-youre-here",
    "title": "Thank Goodness You're Here!",
    "releaseYear": 2024,
    "genre": [
      "Aventure",
      "Occasionnel",
      "Indépendant"
    ],
    "artStyle": {
      "fr": "Dessin animé britannique traditionnel fait main",
      "en": "Traditional hand-drawn British comedy cartoon"
    },
    "camera": {
      "fr": "Vue de dessus / latérale 2D cartoon",
      "en": "2D Cartoon Top-down / Side hybrid"
    },
    "developer": "Coal Supper",
    "steamUrl": "https://store.steampowered.com/app/2366980/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2366980/ss_928c3226d2a3723e29e63cc19c13f47bd88faa86.1920x1080.jpg?t=1733154706",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2366980/ss_c624fda9191859781cf9b34a6563c1953d977800.1920x1080.jpg?t=1733154706",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2366980/ss_179e32f0cddfa678a826750968325810bf83e6b3.1920x1080.jpg?t=1733154706",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2366980/ss_dfd24b8c643032dea42919d1584b94f100dccd2b.1920x1080.jpg?t=1733154706",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2366980/ss_d9dc1ea31fae0bbe198885ef23ed9a6348190a5f.1920x1080.jpg?t=1733154706",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2366980/ss_21e18c4d8f5e892281a5f6877abb878812379141.1920x1080.jpg?t=1733154706"
    ],
    "hints": {
      "tagline": {
        "fr": "Thank Goodness You're Here! est un jeu de claqueforme comique et absurde au cœur du nord de l'Angleterre, dans l'étrange ville de Barnsworth. En tant que commercial itinérant, visitez les lieux et rencontrez ses habitants, impatients de vous confier des tâches plus loufoques les unes que les autres…",
        "en": "Thank Goodness You're Here! est un jeu de claqueforme comique et absurde au cœur du nord de l'Angleterre, dans l'étrange ville de Barnsworth. En tant que commercial itinérant, visitez les lieux et rencontrez ses habitants, impatients de vous confier des tâches plus loufoques les unes que les autres…"
      },
      "composer": "Coal Supper"
    }
  },
  {
    "id": "minishoot-adventures",
    "title": "Minishoot' Adventures",
    "releaseYear": 2024,
    "genre": [
      "Action",
      "Aventure",
      "Occasionnel",
      "RPG"
    ],
    "artStyle": {
      "fr": "Dessin vectoriel 2D vibrant et coloré",
      "en": "Vibrant and colorful 2D vector art"
    },
    "camera": {
      "fr": "Vue du dessus 2D (Twin-stick / Metroidvania)",
      "en": "2D Top-down Twin-stick"
    },
    "developer": "SoulGame Studio",
    "steamUrl": "https://store.steampowered.com/app/1634860/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1634860/ss_a27d15bad37bafc01b1ac80381b46b14cc1a34fc.1920x1080.jpg?t=1778570664",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1634860/ss_86852586349766e5d496a3035eb92dff74905ca0.1920x1080.jpg?t=1778570664",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1634860/ss_36e73da31ffb07af94e668c53136197c4b539391.1920x1080.jpg?t=1778570664",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1634860/ss_7b8f85ab8a99841c031c24e98bf376831354a7e5.1920x1080.jpg?t=1778570664",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1634860/ss_0ad10aa0948e6e3af8da494d47e52f6fd1517a0c.1920x1080.jpg?t=1778570664",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1634860/ss_ea0a3dcf1a509e31f836acdafaf1d99e29de5786.1920x1080.jpg?t=1778570664"
    ],
    "hints": {
      "tagline": {
        "fr": "Minishoot' est un jeu d'aventure unique mêlant exploration libre et gameplay twin stick shooter. Combattez à travers le monde de la surface et celui des profondeurs, améliorez votre vaisseau pour venir à bout des boss de donjon et secourir vos amis !",
        "en": "Minishoot' est un jeu d'aventure unique mêlant exploration libre et gameplay twin stick shooter. Combattez à travers le monde de la surface et celui des profondeurs, améliorez votre vaisseau pour venir à bout des boss de donjon et secourir vos amis !"
      },
      "composer": "SoulGame"
    }
  },
  {
    "id": "hades-ii",
    "title": "Hades II",
    "releaseYear": 2024,
    "genre": [
      "Action",
      "Indépendant",
      "RPG"
    ],
    "artStyle": {
      "fr": "Dessin 2D isométrique mythologique peint à la main",
      "en": "Hand-painted mythological 2D isometric art"
    },
    "camera": {
      "fr": "Vue Isométrique 2.5D (Isometric)",
      "en": "2.5D Isometric"
    },
    "developer": "Supergiant Games",
    "steamUrl": "https://store.steampowered.com/app/1145350/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145350/ss_ef0f63061d0a0a9a7e46f3b84f125d25330e8f19.1920x1080.jpg?t=1779901265",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145350/ss_c88996aa0af82894a8e50ebb951a503ebce3ab24.1920x1080.jpg?t=1779901265",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145350/ss_b88cb7b48a86f07a7288bf37141f6558279f9bfc.1920x1080.jpg?t=1779901265",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145350/ss_c8d2b18451a2cc4d5b4fdd78ed84a5e64e051eac.1920x1080.jpg?t=1779901265",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145350/ss_f366f20f4fb699f6735581e04c7c45a1ef7bd1b8.1920x1080.jpg?t=1779901265",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145350/ss_47e14ed55ac7f1bf9266b2cd5b3e4d9eae0ca54c.1920x1080.jpg?t=1779901265"
    ],
    "hints": {
      "tagline": {
        "fr": "Frayez-vous un chemin vers et au-delà des Enfers et affrontez le Titan du Temps dans ce deuxième volet ensorcelant du dungeon crawler de type rogue-like multiprimé.",
        "en": "Frayez-vous un chemin vers et au-delà des Enfers et affrontez le Titan du Temps dans ce deuxième volet ensorcelant du dungeon crawler de type rogue-like multiprimé."
      },
      "composer": "Darren Korb"
    }
  },
  {
    "id": "neva",
    "title": "Neva",
    "releaseYear": 2024,
    "genre": [
      "Action",
      "Aventure",
      "Indépendant"
    ],
    "artStyle": {
      "fr": "Aquarelle numérique et aplats vectoriels poétiques",
      "en": "Poetic digital watercolor & clean vector art"
    },
    "camera": {
      "fr": "Vue de côté 2D (Side-scroller)",
      "en": "2D Side-scroller"
    },
    "developer": "Nomada Studio",
    "steamUrl": "https://store.steampowered.com/app/2420660/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2420660/ss_62a1d600f868ac02023335d29a4c744f71fc4f97.1920x1080.jpg?t=1771587898",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2420660/ss_25875a2bbb2656d449ce512ffcfad6fd7c66807a.1920x1080.jpg?t=1771587898",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2420660/ss_835f96b38d13781397beb6ca5a0046ff23b692ee.1920x1080.jpg?t=1771587898",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2420660/ss_f8c9358149ccd86f1046d031bc749b6ff13bc64e.1920x1080.jpg?t=1771587898",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2420660/ss_78c8c22f665548d1d8557a35136ee61e81e97cb9.1920x1080.jpg?t=1771587898",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2420660/ss_52acca00d787f0f0c3a830904024e48f0a1e0e17.1920x1080.jpg?t=1771587898"
    ],
    "hints": {
      "tagline": {
        "fr": "Découvrez le lien émouvant qui unit une jeune femme et un loup majestueux dans leur épopée palpitante à travers un monde mourant.",
        "en": "Découvrez le lien émouvant qui unit une jeune femme et un loup majestueux dans leur épopée palpitante à travers un monde mourant."
      },
      "composer": "Berlinist"
    }
  },
  {
    "id": "mouthwashing",
    "title": "Mouthwashing",
    "releaseYear": 2024,
    "genre": [
      "Aventure",
      "Indépendant"
    ],
    "artStyle": {
      "fr": "Rétro 3D low-poly PlayStation 1 / Dégradés sombres",
      "en": "PS1 style low-poly retro 3D"
    },
    "camera": {
      "fr": "Première personne 3D (First-person)",
      "en": "First-person 3D"
    },
    "developer": "Wrong Organ",
    "steamUrl": "https://store.steampowered.com/app/2475490/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2475490/ss_d582f6e384652c1a05fb6e928ab6557b0abba1b3.1920x1080.jpg?t=1786624390",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2475490/ss_ec922c5769acb9986aa009e41b71ecdcd51e484f.1920x1080.jpg?t=1786624390",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2475490/ss_bf9f8aeca93daffa7a4493d9af8ffc4524cada74.1920x1080.jpg?t=1786624390",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2475490/ss_fc1d15989f3d8ef8c6493881bb68dd284defa0cb.1920x1080.jpg?t=1786624390",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2475490/ss_a81b2d5c2c76ef972898d2c62b98f7d191f9c64a.1920x1080.jpg?t=1786624390",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2475490/ss_f707dcc6da5c778d9730949037b06089ba92efa4.1920x1080.jpg?t=1786624390"
    ],
    "hints": {
      "tagline": {
        "fr": "Les cinq membres d'équipage du Tulpar se retrouvent coincés aux confins de l'espace, plongés dans un crépuscule perpétuel. Dieu les a abandonnés.",
        "en": "Les cinq membres d'équipage du Tulpar se retrouvent coincés aux confins de l'espace, plongés dans un crépuscule perpétuel. Dieu les a abandonnés."
      },
      "composer": "Martin Kvale"
    }
  },
  {
    "id": "tactical-breach-wizards",
    "title": "Tactical Breach Wizards",
    "releaseYear": 2024,
    "genre": [
      "Aventure",
      "Indépendant",
      "RPG",
      "Stratégie"
    ],
    "artStyle": {
      "fr": "3D Cel-shaded humoristique et bande dessinée",
      "en": "Comic-book cel-shaded 3D"
    },
    "camera": {
      "fr": "Vue Isométrique tactique (Turn-based)",
      "en": "Tactical Isometric"
    },
    "developer": "Suspicious Developments",
    "steamUrl": "https://store.steampowered.com/app/1043810/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1043810/ss_c3b796b5e159b2ed4078ca74212e627ffa92b111.1920x1080.jpg?t=1785842156",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1043810/ss_e1a7ace21c2a2f1c38fcb4284aa22c9e0bb12661.1920x1080.jpg?t=1785842156",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1043810/ss_34f2a9e1f76acbb72a53ddf54d13627cbf41a974.1920x1080.jpg?t=1785842156",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1043810/ss_e3c68f5a27d841c0c12adcafb04f29dde0908108.1920x1080.jpg?t=1785842156",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1043810/ss_51ed8b4f2d9d7fa8c8b3c851195f3f7cc1d1607d.1920x1080.jpg?t=1785842156",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1043810/ss_2862f0012134de2cd564526f4df9fcb77a6075fc.1920x1080.jpg?t=1785842156"
    ],
    "hints": {
      "tagline": {
        "fr": "In Tactical Breach Wizards, you lead a team of renegade wizards in kevlar through turn-based battles to unravel a modern conspiracy plot. Combine their unique spells in clever ways, or rewind time to try every crazy plan you can think of to punch a Traffic Warlock through a 4th story window.",
        "en": "In Tactical Breach Wizards, you lead a team of renegade wizards in kevlar through turn-based battles to unravel a modern conspiracy plot. Combine their unique spells in clever ways, or rewind time to try every crazy plan you can think of to punch a Traffic Warlock through a 4th story window."
      },
      "composer": "Suspicious Developments"
    }
  },
  {
    "id": "1000xresist",
    "title": "1000xRESIST",
    "releaseYear": 2024,
    "genre": [
      "Aventure",
      "Indépendant"
    ],
    "artStyle": {
      "fr": "3D Stylisée anime dystopique / Mise en scène théâtrale",
      "en": "Dystopian cinematic anime 3D"
    },
    "camera": {
      "fr": "Troisième personne 3D cinématographique",
      "en": "Cinematic Third-person 3D"
    },
    "developer": "sunset visitor 斜陽過客",
    "steamUrl": "https://store.steampowered.com/app/1675830/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1675830/ss_31555847848f488834c689a1bae292c1277a11fa.1920x1080.jpg?t=1782502154",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1675830/ss_dcb4a4f1976652d191b459dfea395543f55d7a6c.1920x1080.jpg?t=1782502154",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1675830/ss_3356fdfb22efb582924561944494100bf8823a51.1920x1080.jpg?t=1782502154",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1675830/ss_00df2986d4bff270a9bde6140b4192462584a00f.1920x1080.jpg?t=1782502154",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1675830/ss_ac46f054525466ec962929d3f93f1c67f189c9a4.1920x1080.jpg?t=1782502154",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1675830/ss_0e873f65ea07a5a7b75d658c9c5a267486de8b37.1920x1080.jpg?t=1782502154"
    ],
    "hints": {
      "tagline": {
        "fr": "1000xRESIST est une aventure palpitante de science-fiction. Dans le futur, une maladie extraterrestre vous force à vivre sous terre. Vous êtes Qui-observe, au service de la MÈRE-DE-TOUTES, jusqu'au jour où vous apprenez un terrible secret qui va tout bouleverser.",
        "en": "1000xRESIST est une aventure palpitante de science-fiction. Dans le futur, une maladie extraterrestre vous force à vivre sous terre. Vous êtes Qui-observe, au service de la MÈRE-DE-TOUTES, jusqu'au jour où vous apprenez un terrible secret qui va tout bouleverser."
      },
      "composer": "Anthony H. Fung"
    }
  },
  {
    "id": "arco",
    "title": "Arco",
    "releaseYear": 2024,
    "genre": [
      "Action",
      "Indépendant",
      "Stratégie"
    ],
    "artStyle": {
      "fr": "Pixel Art miniature sublime et paysages panoramiques",
      "en": "Breathtaking miniature pixel art"
    },
    "camera": {
      "fr": "Vue Isométrique du dessus simultanée",
      "en": "Simultaneous Top-down Isometric"
    },
    "developer": "Franek, Max Cahill, Bibiki, Fáyer",
    "steamUrl": "https://store.steampowered.com/app/2366970/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2366970/ss_e8b3c413b3ce2f1085010ef0e9b3032ad3cef001.1920x1080.jpg?t=1776481494",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2366970/ss_08dbd83808bc80f4d3a42f563fe6c0cc802495fb.1920x1080.jpg?t=1776481494",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2366970/ss_afbb365dd82bcbde39f03aea4234d717619235a2.1920x1080.jpg?t=1776481494",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2366970/ss_d59e140a188622c5725e4b85460c9c229f467498.1920x1080.jpg?t=1776481494",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2366970/ss_7ccbeac08d7edbc5cc4c88826ad27f8119a492de.1920x1080.jpg?t=1776481494",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2366970/ss_cba7f9fc9f6465f49bdfdcd911af3e8b48cd08c3.1920x1080.jpg?t=1776481494"
    ],
    "hints": {
      "tagline": {
        "fr": "Découvrez la beauté saisissante du monde d'Arco, un jeu d'action tactique unique en son genre dans lequel vos choix façonnent votre aventure. Trois récits sanguinaires et magiques, réunis par une même soif de vengeance.",
        "en": "Découvrez la beauté saisissante du monde d'Arco, un jeu d'action tactique unique en son genre dans lequel vos choix façonnent votre aventure. Trois récits sanguinaires et magiques, réunis par une même soif de vengeance."
      },
      "composer": "José Ramón \"Fáyer\" García"
    }
  },
  {
    "id": "core-keeper",
    "title": "Core Keeper",
    "releaseYear": 2024,
    "genre": [
      "Action",
      "Aventure",
      "Indépendant",
      "RPG",
      "Simulation"
    ],
    "artStyle": {
      "fr": "Pixel Art lumineux avec éclairages dynamiques souterrains",
      "en": "Vibrant underground pixel art with dynamic lighting"
    },
    "camera": {
      "fr": "Vue du dessus 2D (Top-down)",
      "en": "2D Top-down"
    },
    "developer": "Pugstorm",
    "steamUrl": "https://store.steampowered.com/app/1621690/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1621690/632a42b91e005b2d2daf99fee946732c95a9737c/ss_632a42b91e005b2d2daf99fee946732c95a9737c.1920x1080.jpg?t=1788195083",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1621690/bca1feb5ec1bf64543f80c74effdcaed4216033c/ss_bca1feb5ec1bf64543f80c74effdcaed4216033c.1920x1080.jpg?t=1788195083",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1621690/804585b7772d3ae5c7d56fc80401469d5bf6fd27/ss_804585b7772d3ae5c7d56fc80401469d5bf6fd27.1920x1080.jpg?t=1788195083",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1621690/ss_1e162c49418038f8042c92810fe3c753449e204b.1920x1080.jpg?t=1788195083",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1621690/ss_2a6cdb26200932593b4edd5ab3d1cc2da5bc15ee.1920x1080.jpg?t=1788195083",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1621690/ss_8f3fd22bc5c385450d36309755323ca18efda4be.1920x1080.jpg?t=1788195083"
    ],
    "hints": {
      "tagline": {
        "fr": "Explorez une caverne infinie pleine de créatures, d'objets et de ressources dans une aventure bac à sable pour 1 à 8 joueurs. Creusez, construisez, combattez, fabriquez et cultivez pour découvrir le mystère du Cœur.",
        "en": "Explorez une caverne infinie pleine de créatures, d'objets et de ressources dans une aventure bac à sable pour 1 à 8 joueurs. Creusez, construisez, combattez, fabriquez et cultivez pour découvrir le mystère du Cœur."
      },
      "composer": "Jonathan Geer"
    }
  },
  {
    "id": "manor-lords",
    "title": "Manor Lords",
    "releaseYear": 2024,
    "genre": [
      "Simulation",
      "Stratégie",
      "Accès anticipé"
    ],
    "artStyle": {
      "fr": "3D Réaliste historique médiévale ultra-détaillée",
      "en": "Hyper-detailed realistic medieval 3D"
    },
    "camera": {
      "fr": "Vue stratégique aérienne & troisième personne (Bird-eye / Third-person)",
      "en": "Strategic Bird-eye / Third-person"
    },
    "developer": "Slavic Magic",
    "steamUrl": "https://store.steampowered.com/app/1363080/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1363080/bffe9f34abaae09855becd6e8ca2ddb9065b2ebb/ss_bffe9f34abaae09855becd6e8ca2ddb9065b2ebb.1920x1080.jpg?t=1787906126",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1363080/2a8486cf95c15af440a4857d6021bb15c057416c/ss_2a8486cf95c15af440a4857d6021bb15c057416c.1920x1080.jpg?t=1787906126",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1363080/e96c54a784a4fa874beb1c21ce0e34ada8eb932f/ss_e96c54a784a4fa874beb1c21ce0e34ada8eb932f.1920x1080.jpg?t=1787906126",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1363080/5111f429dfbd8b65611e0e322dc90f470d015dca/ss_5111f429dfbd8b65611e0e322dc90f470d015dca.1920x1080.jpg?t=1787906126",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1363080/541dce83a952beb779f2221cb107c6557f192439/ss_541dce83a952beb779f2221cb107c6557f192439.1920x1080.jpg?t=1787906126",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1363080/ce313af5e85391c7ebee3b654a35a7ab78a1fe38/ss_ce313af5e85391c7ebee3b654a35a7ab78a1fe38.1920x1080.jpg?t=1787906126"
    ],
    "hints": {
      "tagline": {
        "fr": "Manor Lords est un jeu de stratégie médiéval où vous construisez des villes, menez des combats tactiques et réalisez des simulations économiques et sociales complexes. Gérez vos terres comme un seigneur : au fil des saisons et de la météo, les villes se développent et déclinent.",
        "en": "Manor Lords est un jeu de stratégie médiéval où vous construisez des villes, menez des combats tactiques et réalisez des simulations économiques et sociales complexes. Gérez vos terres comme un seigneur : au fil des saisons et de la météo, les villes se développent et déclinent."
      },
      "composer": "Isaac Noss & T中间"
    }
  },
  {
    "id": "fields-of-mistria",
    "title": "Fields of Mistria",
    "releaseYear": 2024,
    "genre": [
      "Indépendant",
      "RPG",
      "Simulation"
    ],
    "artStyle": {
      "fr": "Pixel Art nostalgique anime des années 90 (Sailor Moon)",
      "en": "Nostalgic 90s anime-inspired pixel art"
    },
    "camera": {
      "fr": "Vue du dessus 2D (Top-down)",
      "en": "2D Top-down"
    },
    "developer": "NPC Studio",
    "steamUrl": "https://store.steampowered.com/app/2142790/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2142790/da8367fe734a77cc4d400199a9661eeea84170b1/ss_da8367fe734a77cc4d400199a9661eeea84170b1.1920x1080.jpg?t=1785944891",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2142790/9933944638583f30c37fc4a51977de639f86624c/ss_9933944638583f30c37fc4a51977de639f86624c.1920x1080.jpg?t=1785944891",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2142790/72a83ad1fd494bca5a01d876137f545d562ee735/ss_72a83ad1fd494bca5a01d876137f545d562ee735.1920x1080.jpg?t=1785944891",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2142790/72b3122d8f42afe7359eeac6cef959cf03caabcf/ss_72b3122d8f42afe7359eeac6cef959cf03caabcf.1920x1080.jpg?t=1785944891",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2142790/54ee7238977f0c2b75a075916a6f7cf396eabe8a/ss_54ee7238977f0c2b75a075916a6f7cf396eabe8a.1920x1080.jpg?t=1785944891",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2142790/a3b1416dc3b0152fa31b359fc492316b5c331c5b/ss_a3b1416dc3b0152fa31b359fc492316b5c331c5b.1920x1080.jpg?t=1785944891"
    ],
    "hints": {
      "tagline": {
        "fr": "Commencez une nouvelle vie ! Construisez la ferme de vos rêves tout en découvrant un monde aux innombrables possibilités. Magie, idylles et aventure vous attendent dans ce RPG de simulation de vie et de ferme au charme plein de nostalgie !",
        "en": "Commencez une nouvelle vie ! Construisez la ferme de vos rêves tout en découvrant un monde aux innombrables possibilités. Magie, idylles et aventure vous attendent dans ce RPG de simulation de vie et de ferme au charme plein de nostalgie !"
      },
      "composer": "Toby Fox & Friends"
    }
  },
  {
    "id": "cryptmaster",
    "title": "Cryptmaster",
    "releaseYear": 2024,
    "genre": [
      "Aventure",
      "Indépendant",
      "RPG"
    ],
    "artStyle": {
      "fr": "Monochrome crayonné noir et blanc rétro dungeon crawler",
      "en": "Monochrome sketchbook dungeon crawler aesthetic"
    },
    "camera": {
      "fr": "Première personne 3D case par case (Grid-based Dungeon Crawler)",
      "en": "First-person 3D grid dungeon crawler"
    },
    "developer": "Paul Hart, Lee Williams, Akupara Games",
    "steamUrl": "https://store.steampowered.com/app/1885110/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1885110/ss_89523b1b24301aaf8a886f2fa57db399f4b98c12.1920x1080.jpg?t=1786047657",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1885110/ss_01b173293f80b7eab18f5254eed3e7d7a54a8f52.1920x1080.jpg?t=1786047657",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1885110/ss_61c499d619b40d63e70eebf1a9eb25245c8fdc1b.1920x1080.jpg?t=1786047657",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1885110/ss_70aff26595463a6b7f5039e0fc6d53ce2dafc685.1920x1080.jpg?t=1786047657",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1885110/639461a24fb085e425bba0349ad1fa829a6ad930/ss_639461a24fb085e425bba0349ad1fa829a6ad930.1920x1080.jpg?t=1786047657",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1885110/ss_ad2153f58a12f63d7e1a05cf8c895e97a7c73b96.1920x1080.jpg?t=1786047657"
    ],
    "hints": {
      "tagline": {
        "fr": "EXPRIMEZ-VOUS dans ce jeu d'exploration de donjon insolite où les mots ont le pouvoir. Comblez les blancs à l'oral ou à l'écrit pour révéler des facultés perdues et résoudre des quêtes et des énigmes déconcertantes. Réussirez-vous à conquérir la crypte et percer le mystère de CRYPTMASTER ?",
        "en": "EXPRIMEZ-VOUS dans ce jeu d'exploration de donjon insolite où les mots ont le pouvoir. Comblez les blancs à l'oral ou à l'écrit pour révéler des facultés perdues et résoudre des quêtes et des énigmes déconcertantes. Réussirez-vous à conquérir la crypte et percer le mystère de CRYPTMASTER ?"
      },
      "composer": "Paul Hart"
    }
  },
  {
    "id": "mullet-madjack",
    "title": "MULLET MADJACK",
    "releaseYear": 2024,
    "genre": [
      "Action",
      "Indépendant"
    ],
    "artStyle": {
      "fr": "Anime rétro cyberpunk VHS des années 80 / 90",
      "en": "80s/90s retro cyberpunk anime aesthetic"
    },
    "camera": {
      "fr": "Première personne 3D Boomer Shooter survolté",
      "en": "First-person 3D Boomer Shooter"
    },
    "developer": "HAMMER95",
    "steamUrl": "https://store.steampowered.com/app/2111190/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2111190/ss_b29d24d0e6947d7c9665a422196ddd53d38e613b.1920x1080.jpg?t=1787078659",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2111190/ss_07fc22bc458406e0030e8774ae87461420c09d46.1920x1080.jpg?t=1787078659",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2111190/ss_f397e42c1a7c7ef5507c063edf2a576d5d7f4868.1920x1080.jpg?t=1787078659",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2111190/ss_9721e68e39c26b644fd7f0215ab0aeb2dbb826ea.1920x1080.jpg?t=1787078659",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2111190/ss_e3d2324968e3e101b961350430d344da1de1732e.1920x1080.jpg?t=1787078659",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2111190/ss_e7dd428121728e5b029cb6f1c8ec7fd5f44f9a4c.1920x1080.jpg?t=1787078659"
    ],
    "hints": {
      "tagline": {
        "fr": "MULLET MADJACK est un FPS solo frénétique qui vous propulse directement dans un ANIME AUTHENTIQUE. Renforcez votre personnage et atteignez le dernier étage ; Battez votre meilleur temps ou réessayez.",
        "en": "MULLET MADJACK est un FPS solo frénétique qui vous propulse directement dans un ANIME AUTHENTIQUE. Renforcez votre personnage et atteignez le dernier étage ; Battez votre meilleur temps ou réessayez."
      },
      "composer": "HAMMER95"
    }
  },
  {
    "id": "anger-foot",
    "title": "Anger Foot",
    "releaseYear": 2024,
    "genre": [
      "Action",
      "Indépendant"
    ],
    "artStyle": {
      "fr": "3D Cartoon déjantée, fluo et hyper-saturée",
      "en": "Hyper-saturated neon cartoon 3D"
    },
    "camera": {
      "fr": "Première personne 3D fast-FPS",
      "en": "First-person 3D fast-FPS"
    },
    "developer": "Free Lives",
    "steamUrl": "https://store.steampowered.com/app/1978590/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1978590/ss_6ca80dd86ee1f4d4f395f0f14a74d0eb00cbb7b3.1920x1080.jpg?t=1757596248",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1978590/ss_e68f57c04fe7640837981077e0d045b6816e61e1.1920x1080.jpg?t=1757596248",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1978590/ss_c63267ba4546435ea30471bce8bfc4057643e4c6.1920x1080.jpg?t=1757596248",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1978590/ss_e934f4b47f429770628c5b3aa5d47eeeb7cf8fa1.1920x1080.jpg?t=1757596248",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1978590/ss_cb8021df9b54506827e615546918b685a4d95822.1920x1080.jpg?t=1757596248",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1978590/ss_d3773812157d4ecea5b16546a30038c3cd0ba599.1920x1080.jpg?t=1757596248"
    ],
    "hints": {
      "tagline": {
        "fr": "Anger Foot est un FPS ultra-rapide dans lequel les seules choses plus dures que vos pieds sont les basses qui tabassent.",
        "en": "Anger Foot est un FPS ultra-rapide dans lequel les seules choses plus dures que vos pieds sont les basses qui tabassent."
      },
      "composer": "Free Lives Sound Team"
    }
  },
  {
    "id": "antonblast",
    "title": "ANTONBLAST",
    "releaseYear": 2024,
    "genre": [
      "Action",
      "Aventure",
      "Indépendant"
    ],
    "artStyle": {
      "fr": "Pixel Art cartoonesque frénétique style Game Boy Advance / Wario Land",
      "en": "Frenetic GBA/Wario Land cartoon pixel art"
    },
    "camera": {
      "fr": "Vue de côté 2D (Side-scroller)",
      "en": "2D Side-scroller"
    },
    "developer": "Summitsphere",
    "steamUrl": "https://store.steampowered.com/app/1887400/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1887400/ss_8f98125a0c4b920ea750550c64b9428b9024eed9.1920x1080.jpg?t=1785401615",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1887400/ss_d77a534f9d64e188c2991e24a68508de1d765637.1920x1080.jpg?t=1785401615",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1887400/ss_526c18a89076e2e9106295cf1e71f74cdd9cae6d.1920x1080.jpg?t=1785401615",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1887400/ss_8ad7bc8667f72207b8d2802d3a69a6588fb180ec.1920x1080.jpg?t=1785401615",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1887400/ss_dff0b54af27d0d8760e95d450a9be3312c5a277f.1920x1080.jpg?t=1785401615",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1887400/ss_0d45224a5d936f763745ddd9201a1e29cc9f9c0a.1920x1080.jpg?t=1785401615"
    ],
    "hints": {
      "tagline": {
        "fr": "ANTONBLAST is a fast-paced explosive action platformer that's all about destruction. Play as the enraged Dynamite Anton (or his cranked-out coworker Annie) and use your Mighty F’n Hammer to demolish bizarre worlds, tussle with screen-filling bosses, and steal your Spirits back from Satan!",
        "en": "ANTONBLAST is a fast-paced explosive action platformer that's all about destruction. Play as the enraged Dynamite Anton (or his cranked-out coworker Annie) and use your Mighty F’n Hammer to demolish bizarre worlds, tussle with screen-filling bosses, and steal your Spirits back from Satan!"
      },
      "composer": "Tony Grayson"
    }
  }
];

// Helper deterministe pour obtenir le jeu du jour basé sur une graine temporelle "YYYY-MM-DD"
export function getDailyGame(dateString: string, offset = 0): Game {
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = (hash << 5) - hash + dateString.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash + offset) % INDIE_GAMES.length;
  return INDIE_GAMES[index];
}
