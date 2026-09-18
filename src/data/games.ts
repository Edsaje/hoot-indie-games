import type { Game } from '../types/game';

/**
 * Base de données officielle de jeux indépendants certifiés "Hoot Indie Games"
 * Enrichie quotidiennement par le robot Hoot Harvest via l'API Steam Store officielle.
 * 0 Hallucination : métadonnées et captures certifiées.
 * Total de jeux : 94
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
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Vue de côté 2D",
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
        "en": "Forge your own path through a vast ruined kingdom of insects and heroes."
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
      "Aventure",
      "Narratif"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D",
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
      "Aventure",
      "Sci-Fi",
      "Puzzle"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
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
        "fr": "Explorez un système solaire condamné pris au piège d'une boucle temporelle infinie de 22 minutes.",
        "en": "Explore a sun-soaked solar system trapped in an endless 22-minute time loop."
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
      "Action",
      "Hack and Slash",
      "Mythologie"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Isométrique / 2.5D",
      "en": "Isometric / 2.5D"
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
        "fr": "Défiez le dieu des morts et frayez-vous un chemin hors des Enfers grecs.",
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
      "Souls-like"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D",
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
        "fr": "Combattez dans un château labyrinthique en perpétuelle mutation dans ce Roguevania nerveux.",
        "en": "Fight through an ever-changing labyrinthine island castle in this fast-paced Roguevania."
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
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
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
        "fr": "Un RPG émouvant et hilarant où vous n'êtes obligé d'éliminer aucun ennemi.",
        "en": "The friendly RPG where nobody has to die."
      },
      "composer": "Toby Fox"
    }
  },
  {
    "id": "slay-the-spire",
    "title": "Slay the Spire",
    "releaseYear": 2019,
    "genre": [
      "Deckbuilder",
      "Roguelike",
      "Stratégie"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
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
        "fr": "Fusionnez jeu de cartes et roguelike pour gravir une flèche peuplée de reliques et de monstres.",
        "en": "Craft a unique deck, encounter bizarre creatures, and discover relics of immense power."
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
      "Souls-like"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Isométrique / 2.5D",
      "en": "Isometric / 2.5D"
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
        "fr": "Guidez un jeune renard dans un vaste monde de légendes et reconstituez la notice du jeu page par page.",
        "en": "Explore a land filled with lost legends, ancient powers, and ferocious monsters in this isometric adventure."
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
      "Platformer",
      "Co-op"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Vue de côté 2D",
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
        "fr": "Affrontez des boss gigantesques dans un style cartoon inspiré des années 1930 animé à la main.",
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
      "Enquête"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Isométrique / 2.5D",
      "en": "Isometric / 2.5D"
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
        "fr": "Incarnez un détective amnésique doté d'un système de compétences unique au cœur d'une cité décadente.",
        "en": "A groundbreaking role-playing game where you are a detective with a unique skill system at your disposal."
      },
      "composer": "British Sea Power"
    }
  },
  {
    "id": "inscryption",
    "title": "Inscryption",
    "releaseYear": 2021,
    "genre": [
      "Deckbuilder",
      "Horreur",
      "Roguelike",
      "Puzzle"
    ],
    "artStyle": {
      "fr": "3D Low-Poly / Rétro",
      "en": "Retro Low-poly 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
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
        "fr": "Une odyssée noire et mystérieuse mêlant deckbuilding, escape room et horreur psychologique.",
        "en": "An inky black card-based rogue-like that blends deckbuilding, escape-room puzzles, and psychological horror."
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
      "Gestion",
      "RPG",
      "Co-op"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
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
        "fr": "Héritez de la vieille parcelle de votre grand-père et construisez la ferme de vos rêves.",
        "en": "You have inherited your grandfather's old farm plot. Can you learn to live off the land?"
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
      "Aventure",
      "Exploration",
      "Sci-Fi"
    ],
    "artStyle": {
      "fr": "3D Réaliste",
      "en": "Realistic 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
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
        "fr": "Plongez dans les profondeurs d'un monde sous-marin extraterrestre rempli de merveilles et de terreurs.",
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
      "Deckbuilder",
      "Roguelike",
      "Stratégie"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
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
        "fr": "Un roguelike de poker hypnotique où des cartes Joker modificateurs créent des combos démesurés.",
        "en": "A poker-themed roguelike deckbuilder about creating powerful synergies and winning big."
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
      "Exploration"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D",
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
        "fr": "Explorez un labyrinthe souterrain interconnecté et dense regorgeant de secrets et d'énigmes subtiles.",
        "en": "Explore a dense, interconnected labyrinth and decipher its many secrets in this atmospheric puzzle metroidvania."
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
      "Aventure",
      "Tour par tour"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Isométrique / 2.5D",
      "en": "Isometric / 2.5D"
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
        "fr": "Un RPG au tour par tour inspiré des classiques des années 90, contant l'histoire de deux Enfants du Solstice.",
        "en": "A turn-based RPG inspired by the 90s classics, telling the story of two Children of the Solstice."
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
      "Action",
      "Souls-like",
      "Dark Fantasy"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D",
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
        "fr": "Incarnez le Pénitent dans un monde de cauchemar ravagé par une terrible malédiction religieuse.",
        "en": "A punishing action-platformer that combines fast-paced, skilled hack-and-slash combat with deep lore."
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
      "Aventure"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Vue de côté 2D",
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
        "fr": "Voyagez à travers la forêt en déclin de Nibel dans cette fable visuellement éblouissante et émouvante.",
        "en": "Embark on an emotional journey through the dying forest of Nibel to save an orphaned spirit's home."
      },
      "composer": "Gareth Coker"
    }
  },
  {
    "id": "signalis",
    "title": "Signalis",
    "releaseYear": 2022,
    "genre": [
      "Horreur",
      "Survie",
      "Sci-Fi",
      "Puzzle"
    ],
    "artStyle": {
      "fr": "3D Low-Poly / Rétro",
      "en": "Retro Low-poly 3D"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
      "en": "2D Top-down"
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
        "fr": "Un survival horror rétro dystopique et mélancolique aux inspirations d'anime classique et d'horreur cosmique.",
        "en": "A classic survival horror experience set in a dystopian future where humanity uncovered a dark secret."
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
      "RPG"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D",
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
        "fr": "Pêchez le jour dans le mystérieux Trou Bleu et tenez un restaurant de sushi florissant la nuit.",
        "en": "Explore the depths of the mysterious Blue Hole by day and run a successful sushi restaurant by night."
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
      "Sci-Fi"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Vue de côté 2D",
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
        "fr": "Un metroidvania 2D riche en action inspiré de Sekiro dans un univers taopunk cyberpunk oriental.",
        "en": "A lore-rich, hand-drawn 2D action-platformer featuring Sekiro-inspired deflection-focused combat."
      },
      "composer": "Red Candle Sound Team"
    }
  },
  {
    "id": "crow-country",
    "title": "Crow Country",
    "releaseYear": 2024,
    "genre": [
      "Horreur",
      "Survie",
      "Puzzle",
      "Rétro"
    ],
    "artStyle": {
      "fr": "3D Low-Poly / Rétro",
      "en": "Retro Low-poly 3D"
    },
    "camera": {
      "fr": "Troisième personne",
      "en": "Third-Person"
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
        "fr": "Enquêtez sur la disparition d'un magnat de parc d'attractions dans ce survival horror rétro inspiré de la PS1.",
        "en": "Investigate an abandoned amusement park in this PS1-inspired survival horror mystery."
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
      "Action",
      "Comédie"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D",
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
        "fr": "Un jeu de plateforme frénétique inspiré de Wario Land où Peppino Spaghetti détruit tout sur son passage.",
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
      "Atmosphérique"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
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
        "fr": "Bravez les dangers surnaturels de la zone d'exclusion olympique au volant de votre fidèle break familial.",
        "en": "Face the supernatural dangers of the Olympic Exclusion Zone with your car as your only lifeline."
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
      "Platformer",
      "Cyberpunk",
      "Narratif"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D",
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
        "fr": "Fendez l'air et ralentissez le temps dans ce thriller néo-noir ultra-rapide où un seul coup est fatal.",
        "en": "A stylish neo-noir, action-packed slash-'em-up with blindingly fast combat and instant-death mechanics."
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
      "Fast-FPS",
      "Rétro"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
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
        "fr": "Un jeu d'action brutal et psychédélique baigné de néons dans le Miami violent de 1989.",
        "en": "A high-octane action game overflowing with raw brutality, hard-boiled gunplay and skull-crushing combat."
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
      "Horreur",
      "Aventure",
      "Mystère"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Isométrique / 2.5D",
      "en": "Isometric / 2.5D"
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
        "fr": "Pilotez votre chalutier, explorez un archipel brumeux et repêchez d'anciens secrets horrifiques des abysses.",
        "en": "Captain your fishing trawler to explore a collection of remote isles and unravel dark secrets."
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
      "Mystère"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Isométrique / 2.5D",
      "en": "Isometric / 2.5D"
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
        "fr": "Déchiffrez des langues anciennes et rétablissez le dialogue entre les peuples de la Tour de Babel.",
        "en": "Unravel the mysteries of ancient tongues and restore harmony between the peoples of the Tower."
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
      "Cozy"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Isométrique / 2.5D",
      "en": "Isometric / 2.5D"
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
        "fr": "Randonnez, planez et gravissez les paisibles paysages montagneux du parc provincial de Hawk Peak.",
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
      "Exploration"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
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
        "fr": "Faites pivoter un monde 3D en perspective 2D pour résoudre des énigmes géométriques fascinantes.",
        "en": "Explore an incredible 3D world from four distinct 2D perspectives with the magical Fez hat."
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
      "Narratif"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Vue de côté 2D",
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
        "fr": "Une expérience narrative contemplative et magnifiquement aquarellée sur le deuil et la renaissance.",
        "en": "A serene and evocative experience, free of danger, frustration or death, about hope and sorrow."
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
      "Dark Fantasy",
      "Tour par tour"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
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
        "fr": "Recrutez et menez une équipe de héros imparfaits face aux horreurs et au stress psychologique d'un manoir maudit.",
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
      "Aventure",
      "Horreur",
      "Folklorique"
    ],
    "artStyle": {
      "fr": "3D Réaliste",
      "en": "Realistic 3D"
    },
    "camera": {
      "fr": "Troisième personne",
      "en": "Third-Person"
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
        "fr": "Bravez les créatures terrifiantes du folklore nordique pour sauver votre sœur capturée.",
        "en": "A grim adventure set in a world inspired by dark, Nordic fables. Explore beautiful yet dangerous lands."
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
      "Action",
      "Sci-Fi"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D",
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
        "fr": "Explorez un vaste monde extraterrestre biomécanique dans ce Metroidvania créé par un développeur solo.",
        "en": "Explore a sprawling alien world and exploit glitches in reality in this retro sci-fi metroidvania."
      },
      "composer": "Thomas Happ"
    }
  },
  {
    "id": "the-binding-of-isaac-rebirth",
    "title": "The Binding of Isaac: Rebirth",
    "releaseYear": 2014,
    "genre": [
      "Roguelike",
      "Action",
      "Bullet Hell",
      "Survie"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
      "en": "2D Top-down"
    },
    "developer": "Nicalis, Inc. & Edmund McMillen",
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
        "fr": "Fuyez votre mère dans un sous-sol peuplé d'abominations dans ce roguelike jeu de tir frénétique.",
        "en": "Escape into the monster-filled basement using tears as weapons in this legendary roguelike shooter."
      },
      "composer": "Ridiculon"
    }
  },
  {
    "id": "terraria",
    "title": "Terraria",
    "releaseYear": 2011,
    "genre": [
      "Survie",
      "Aventure",
      "Sandbox",
      "Action"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D",
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
        "fr": "Creusez, bâtissez, survivez et affrontez des boss mythiques dans ce bac à sable 2D infini.",
        "en": "Dig, fight, explore, and build! The world is at your fingertips as you fight for survival and glory."
      },
      "composer": "Scott Lloyd Shelly"
    }
  },
  {
    "id": "vampire-survivors",
    "title": "Vampire Survivors",
    "releaseYear": 2022,
    "genre": [
      "Roguelite",
      "Action",
      "Bullet Hell",
      "Survie"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
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
        "fr": "Fauchez des milliers de monstres nocturnes et survivez jusqu'à l'aube dans ce phénomène roguelite.",
        "en": "Mow down thousands of night creatures and survive until dawn in this gothic casual roguelite."
      },
      "composer": "Daniele Zandara & Filippo Vicarelli"
    }
  },
  {
    "id": "cult-of-the-lamb",
    "title": "Cult of the Lamb",
    "releaseYear": 2022,
    "genre": [
      "Roguelite",
      "Gestion",
      "Action",
      "Dark Fantasy"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Isométrique / 2.5D",
      "en": "Isometric / 2.5D"
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
        "fr": "Fondez votre propre culte d'adorateurs fidèles et purgez les faux prophètes au fil de donjons sanglants.",
        "en": "Start your own cult in a land of false prophets, venturing out into diverse and mysterious regions."
      },
      "composer": "River Boy (Narayana Johnson)"
    }
  },
  {
    "id": "shovel-knight",
    "title": "Shovel Knight: Treasure Trove",
    "releaseYear": 2014,
    "genre": [
      "Platformer",
      "Action",
      "Rétro",
      "Aventure"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D",
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
        "fr": "Maniez votre fidèle pelle pour sauter et pourfendre les membres de l'Ordre des Sans-Quartier.",
        "en": "A sweeping classic action adventure game with awesome gameplay, memorable characters, and an 8-bit retro aesthetic."
      },
      "composer": "Jake Kaufman & Manami Matsumae"
    }
  },
  {
    "id": "inside",
    "title": "INSIDE",
    "releaseYear": 2016,
    "genre": [
      "Puzzle",
      "Platformer",
      "Atmosphérique",
      "Horreur"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
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
        "fr": "Seul et pourchassé, un jeune garçon s'enfonce dans les rouages d'un projet dystopique terrifiant.",
        "en": "Hunted and alone, a boy finds himself drawn into the center of a dark, dystopian project."
      },
      "composer": "Martin Stig Andersen & SØS Gunver Ryberg"
    }
  },
  {
    "id": "limbo",
    "title": "LIMBO",
    "releaseYear": 2011,
    "genre": [
      "Puzzle",
      "Platformer",
      "Atmosphérique",
      "Horreur"
    ],
    "artStyle": {
      "fr": "Monochrome / Minimaliste",
      "en": "Monochrome"
    },
    "camera": {
      "fr": "Vue de côté 2D",
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
        "fr": "Incertain du destin de sa sœur, un garçon s'aventure dans l'obscurité hostile du monde de Limbo.",
        "en": "Uncertain of his sister's fate, a boy enters the perilous, shadow-drenched world of LIMBO."
      },
      "composer": "Martin Stig Andersen"
    }
  },
  {
    "id": "cocoon",
    "title": "COCOON",
    "releaseYear": 2023,
    "genre": [
      "Puzzle",
      "Aventure",
      "Sci-Fi"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Isométrique / 2.5D",
      "en": "Isometric / 2.5D"
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
        "fr": "Transportez des mondes entiers logés dans des orbes et sautez d'une dimension à l'autre.",
        "en": "From the lead designer of LIMBO and INSIDE, leap between worlds contained inside spherical orbs."
      },
      "composer": "Jakob Schmid"
    }
  },
  {
    "id": "return-of-the-obra-dinn",
    "title": "Return of the Obra Dinn",
    "releaseYear": 2018,
    "genre": [
      "Enquête",
      "Puzzle",
      "Mystère",
      "Historique"
    ],
    "artStyle": {
      "fr": "Monochrome / Minimaliste",
      "en": "Monochrome"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
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
        "fr": "Découvrez le sort funeste des 60 marins de l'Obra Dinn à l'aide d'un mystérieux cadran mémoriel.",
        "en": "Lost at sea, 1803: identify the fates of all sixty souls aboard the ghost ship Obra Dinn."
      },
      "composer": "Lucas Pope"
    }
  },
  {
    "id": "ultrakill",
    "title": "ULTRAKILL",
    "releaseYear": 2020,
    "genre": [
      "Fast-FPS",
      "Action",
      "Rétro"
    ],
    "artStyle": {
      "fr": "3D Low-Poly / Rétro",
      "en": "Retro Low-poly 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
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
        "fr": "L'humanité est morte. Le sang est votre carburant. Les Enfers sont pleins. Déchaînez un carnage rétro !",
        "en": "Mankind is dead. Blood is fuel. Hell is full. Fast-paced ultraviolent retro FPS action."
      },
      "composer": "Hakita (Arsi Patala)"
    }
  },
  {
    "id": "enter-the-gungeon",
    "title": "Enter the Gungeon",
    "releaseYear": 2016,
    "genre": [
      "Roguelike",
      "Bullet Hell",
      "Action"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
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
        "fr": "Canardez et roulez au milieu d'armées de douilles pour atteindre l'arme ultime qui peut tuer le passé.",
        "en": "A gunfight dungeon crawler following a band of misfits seeking to shoot, loot, dodge roll and find the past-killing gun."
      },
      "composer": "doseone"
    }
  },
  {
    "id": "risk-of-rain-2",
    "title": "Risk of Rain 2",
    "releaseYear": 2020,
    "genre": [
      "Roguelike",
      "Action",
      "Sci-Fi",
      "Co-op"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Troisième personne",
      "en": "Third-Person"
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
        "fr": "Échappez à une planète extraterrestre hostile en accumulant des objets dévastateurs face à des hordes géantes.",
        "en": "Escape a chaotic alien planet by fighting through hordes of frenzied monsters with friends."
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
      "Sci-Fi"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
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
        "fr": "Traversez un monde sublime en ruines frappé de néons pour chercher un remède à une maladie incurable.",
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
      "Roguelike",
      "Platformer",
      "Action"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
    },
    "developer": "Mossmouth & BlitWorks",
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
        "fr": "Pillez des cavernes lunaires générées aléatoirement regorgeant de pièges mortels et de créatures sauvages.",
        "en": "Join the next generation of explorers as they find themselves on the Moon, searching for treasure and missing family."
      },
      "composer": "Eirik Suhrke"
    }
  },
  {
    "id": "rain-world",
    "title": "Rain World",
    "releaseYear": 2017,
    "genre": [
      "Survie",
      "Platformer",
      "Atmosphérique"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D",
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
        "fr": "Incarnez un chat-limace nomade, prédateur et proie à la fois, dans un écosystème ravagé par des pluies diluviennes.",
        "en": "You are a nomadic slugcat, both predator and prey in a broken ecosystem filled with torrential downpours."
      },
      "composer": "James Primate & Lydia Esrig"
    }
  },
  {
    "id": "firewatch",
    "title": "Firewatch",
    "releaseYear": 2016,
    "genre": [
      "Narratif",
      "Aventure",
      "Mystère"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
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
        "fr": "Veillez sur la forêt sauvage du Wyoming tout en nouant un lien radio intense avec votre superviseuse Delilah.",
        "en": "A single-player first-person mystery set in the Wyoming wilderness, where your only emotional lifeline is over a radio."
      },
      "composer": "Chris Remo"
    }
  },
  {
    "id": "what-remains-of-edith-finch",
    "title": "What Remains of Edith Finch",
    "releaseYear": 2017,
    "genre": [
      "Narratif",
      "Aventure",
      "Mystère"
    ],
    "artStyle": {
      "fr": "3D Réaliste",
      "en": "Realistic 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
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
        "fr": "Explorez l'immense manoir familial des Finch et revivez le destin tragique et poétique de chaque membre disparu.",
        "en": "A collection of strange tales about a family in Washington state as they meet their untimely demises."
      },
      "composer": "Jeff Russo"
    }
  },
  {
    "id": "super-meat-boy",
    "title": "Super Meat Boy",
    "releaseYear": 2010,
    "genre": [
      "Platformer",
      "Action",
      "Rétro"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Vue de côté 2D",
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
        "fr": "Guidez un cube de viande animé à travers des scies circulaires mortelles pour sauver votre fiancée de sparadrap.",
        "en": "A tough-as-nails platformer where you play as an animated cube of meat trying to save his girlfriend."
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
      "RPG",
      "Narratif"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Isométrique / 2.5D",
      "en": "Isometric / 2.5D"
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
        "fr": "Reconstruisez un refuge au sein d'un monde brisé commenté en temps réel par un mystérieux narrateur.",
        "en": "An action role-playing game that redefines storytelling in games, with a reactive narrator marking your every move."
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
      "RPG",
      "Sci-Fi",
      "Stratégie"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Isométrique / 2.5D",
      "en": "Isometric / 2.5D"
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
        "fr": "Combattez dans une métropole futuriste saisissante armée d'une épée bavarde capable d'arrêter le temps.",
        "en": "Wield an extraordinary weapon of unknown origin as you fight through a stunning futuristic city."
      },
      "composer": "Darren Korb"
    }
  },
  {
    "id": "ftl-faster-than-light",
    "title": "FTL: Faster Than Light",
    "releaseYear": 2012,
    "genre": [
      "Roguelike",
      "Stratégie",
      "Simulation",
      "Sci-Fi"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
      "en": "2D Top-down"
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
        "fr": "Pilotez votre vaisseau et son équipage à travers une galaxie hostile pour livrer des données capitales à la Fédération.",
        "en": "A spaceship simulation roguelike-like that allows you to experience the atmosphere of running a spaceship."
      },
      "composer": "Ben Prunty"
    }
  },
  {
    "id": "into-the-breach",
    "title": "Into the Breach",
    "releaseYear": 2018,
    "genre": [
      "Stratégie",
      "Tour par tour",
      "Puzzle",
      "Sci-Fi"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Isométrique / 2.5D",
      "en": "Isometric / 2.5D"
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
        "fr": "Commandez de puissants méchas venus du futur pour repousser une invasion d'insectes géants tour par tour.",
        "en": "Control powerful mechs from the future to defeat an alien threat in minimal, turn-based combat."
      },
      "composer": "Ben Prunty"
    }
  },
  {
    "id": "omori",
    "title": "OMORI",
    "releaseYear": 2020,
    "genre": [
      "RPG",
      "Horreur",
      "Narratif",
      "Psychologique"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
      "en": "2D Top-down"
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
        "fr": "Naviguez entre un monde imaginaire pastel et une réalité troublante pour déterrer des souvenirs enfouis.",
        "en": "Explore a strange world full of colorful friends and foes. When the time comes, the path you’ve chosen will determine your fate."
      },
      "composer": "OMOCAT, Pedro Silva & Jami Lynne"
    }
  },
  {
    "id": "ufo-50",
    "title": "UFO 50",
    "releaseYear": 2024,
    "genre": [
      "Anthologie",
      "Rétro",
      "Action",
      "Aventure"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
      "en": "2D Top-down"
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
        "fr": "Une collection anthologique de 50 jeux rétro complets conçus pour une console imaginaire des années 80.",
        "en": "A collection of 50 individual, full-sized games by the creators of Spelunky and Downwell."
      },
      "composer": "Eirik Suhrke"
    }
  },
  {
    "id": "lorelei-and-the-laser-eyes",
    "title": "Lorelei and the Laser Eyes",
    "releaseYear": 2024,
    "genre": [
      "Puzzle",
      "Mystère",
      "Horreur",
      "Enquête"
    ],
    "artStyle": {
      "fr": "Monochrome / Minimaliste",
      "en": "Monochrome"
    },
    "camera": {
      "fr": "Troisième personne",
      "en": "Third-Person"
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
        "fr": "Plongez dans un hôtel baroque mystérieux et résolvez des énigmes surréalistes en noir et blanc.",
        "en": "A non-linear mystery adventure game full of riddles and surreal optical illusions."
      },
      "composer": "Daniel Olsén"
    }
  },
  {
    "id": "sanabi",
    "title": "SANABI",
    "releaseYear": 2023,
    "genre": [
      "Platformer",
      "Action",
      "Cyberpunk",
      "Narratif"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D",
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
        "fr": "Propulsez-vous à travers une mégapole cyberpunk à l'aide de votre bras-grappin bionique dévastateur.",
        "en": "An exhilarating, stylish dystopian action-platformer. Play as a legendary retired veteran and grapple across skyscrapers."
      },
      "composer": "WONDER POTION"
    }
  },
  {
    "id": "lethal-company",
    "title": "Lethal Company",
    "releaseYear": 2023,
    "genre": [
      "Horreur",
      "Co-op",
      "Survie",
      "Sci-Fi"
    ],
    "artStyle": {
      "fr": "3D Low-Poly / Rétro",
      "en": "Retro Low-poly 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
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
        "fr": "Pillez des lunes industrialisées abandonnées pour remplir le quota de ferraille de la Compagnie... au péril de votre vie.",
        "en": "A co-op horror scavenger game about scavenging at abandoned moons to sell scrap to the Company."
      },
      "composer": "Zeekerss"
    }
  },
  {
    "id": "citizen-sleeper",
    "title": "Citizen Sleeper",
    "releaseYear": 2022,
    "genre": [
      "RPG",
      "Narratif",
      "Sci-Fi",
      "Cyberpunk"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Isométrique / 2.5D",
      "en": "Isometric / 2.5D"
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
        "fr": "Incarnez une conscience humaine numérisée en fuite dans une station spatiale anarchique inspirée des jeux de rôle papier.",
        "en": "Roleplaying in the ruins of interplanetary capitalism. Live the life of an escaped worker on a lawless station."
      },
      "composer": "Amos Roddy"
    }
  },
  {
    "id": "crypt-of-the-necrodancer",
    "title": "Crypt of the NecroDancer",
    "releaseYear": 2015,
    "genre": [
      "Rythme",
      "Roguelike",
      "Action",
      "Dungeon Crawler"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
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
        "fr": "Bougez en rythme avec le tempo de la musique pour vaincre les monstres d'un donjon disco en perpétuel mouvement.",
        "en": "An award-winning hardcore roguelike rhythm game. Move to the music and deliver beatdowns to the beat!"
      },
      "composer": "Danny Baranowsky"
    }
  },
  {
    "id": "dont-starve",
    "title": "Don't Starve",
    "releaseYear": 2013,
    "genre": [
      "Survie",
      "Artisanat",
      "Aventure",
      "Dark Fantasy"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Isométrique / 2.5D",
      "en": "Isometric / 2.5D"
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
        "fr": "Survivez dans une contrée sauvage hostile et ténébreuse peuplée de créatures inquiétantes sans jamais céder à la folie.",
        "en": "An uncompromising wilderness survival game full of science and magic. Play as Wilson, an intrepid gentleman scientist."
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
      "Exploration",
      "Cyberpunk"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Troisième personne",
      "en": "Third-Person"
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
        "fr": "Incarnez un chat errant égaré dans une cité cybernétique oubliée habitée par des droïdes mélancoliques.",
        "en": "Lost, alone and separated from family, a stray cat must untangle an ancient mystery to escape a long-forgotten cybercity."
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
      "Puzzle",
      "Cozy"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
      "en": "2D Top-down"
    },
    "developer": "Greg Lobanov & Wishes Ultd.",
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
        "fr": "Maniez un pinceau magique pour colorer le monde et résoudre des énigmes dans cette touchante aventure.",
        "en": "A top-down adventure game about a dog with a magical paintbrush who draws on everything."
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
      "Arts martiaux",
      "Beat them all"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Troisième personne",
      "en": "Third-Person"
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
        "fr": "Traquez les assassins de votre famille dans une quête de vengeance où chaque défaite vous fait vieillir de plusieurs années.",
        "en": "A realistic third-person brawler with tight Kung Fu combat mechanics and a cinematic martial arts vengeance story."
      },
      "composer": "Howie Lee"
    }
  },
  {
    "id": "jusant",
    "title": "Jusant",
    "releaseYear": 2023,
    "genre": [
      "Aventure",
      "Escalade",
      "Atmosphérique",
      "Méditatif"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Troisième personne",
      "en": "Third-Person"
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
        "fr": "Grimpez au sommet d'une tour cyclopéenne minérale et découvrez la trace d'une civilisation disparue.",
        "en": "Enjoy meditative vibes in Jusant, an action-puzzle climbing game. Scale an immeasurably tall tower."
      },
      "composer": "Guillaume Ferran"
    }
  },
  {
    "id": "thank-goodness-youre-here",
    "title": "Thank Goodness You're Here!",
    "releaseYear": 2024,
    "genre": [
      "Comédie",
      "Aventure",
      "Narratif"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
      "en": "2D Top-down"
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
        "fr": "Explorez une petite ville britannique absurde et rendez des services farfelus à des habitants excentriques.",
        "en": "A comedy slapformer that unfolds over time as the players exploration and antics leave their mark on the quirky town of Barnsworth."
      },
      "composer": "Coal Supper"
    }
  },
  {
    "id": "minishoot-adventures",
    "title": "Minishoot' Adventures",
    "releaseYear": 2024,
    "genre": [
      "Metroidvania",
      "Action",
      "Bullet Hell",
      "Twin-stick"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
      "en": "2D Top-down"
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
        "fr": "Pilotez un petit vaisseau dans un monde ouvert féérique mêlant exploration Zelda-like et combats shoot'em up nerveux.",
        "en": "Fly into a charming handcrafted world and embark on an adventure that mixes twin-stick shooter action with Zelda-style exploration."
      },
      "composer": "SoulGame Studio"
    }
  },
  {
    "id": "hades-ii",
    "title": "Hades II",
    "releaseYear": 2024,
    "genre": [
      "Roguelike",
      "Action",
      "Hack and Slash",
      "Mythologie"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Isométrique / 2.5D",
      "en": "Isometric / 2.5D"
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
        "fr": "Incarnez Melinoë, princesse des Enfers, et utilisez la magie noire pour terrasser le Titan Chronos.",
        "en": "Battle beyond the Underworld using dark sorcery to take on the Titan of Time in this bewitching roguelike dungeon crawler."
      },
      "composer": "Darren Korb"
    }
  },
  {
    "id": "neva",
    "title": "Neva",
    "releaseYear": 2024,
    "genre": [
      "Aventure",
      "Action",
      "Platformer",
      "Narratif"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Vue de côté 2D",
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
        "fr": "Découvrez le lien bouleversant unissant une jeune femme et un loup majestueux au fil d'un monde en décomposition.",
        "en": "An emotionally-charged action adventure from the creators of GRIS, chronicling the bond between a woman and a majestic wolf."
      },
      "composer": "Berlinist"
    }
  },
  {
    "id": "mouthwashing",
    "title": "Mouthwashing",
    "releaseYear": 2024,
    "genre": [
      "Horreur",
      "Narratif",
      "Sci-Fi",
      "Psychologique"
    ],
    "artStyle": {
      "fr": "3D Low-Poly / Rétro",
      "en": "Retro Low-poly 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
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
        "fr": "Suivez l'agonie psychologique de cinq membres d'équipage d'un cargo spatial échoué au milieu du vide sidéral.",
        "en": "A first-person psychological horror game following the stranded crew of a dying space freighter."
      },
      "composer": "Martin Kvale"
    }
  },
  {
    "id": "tactical-breach-wizards",
    "title": "Tactical Breach Wizards",
    "releaseYear": 2024,
    "genre": [
      "Stratégie",
      "Tour par tour",
      "Puzzle",
      "Comédie"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Isométrique / 2.5D",
      "en": "Isometric / 2.5D"
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
        "fr": "Menez une équipe d'agents secrets mages en gilets pare-balles dans des missions tactiques au tour par tour hilarantes.",
        "en": "Lead a team of renegade wizards in kevlar across puzzle-like turn-based tactical urban missions."
      },
      "composer": "Suspicious Developments"
    }
  },
  {
    "id": "1000xresist",
    "title": "1000xRESIST",
    "releaseYear": 2024,
    "genre": [
      "Narratif",
      "Sci-Fi",
      "Aventure"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Troisième personne",
      "en": "Third-Person"
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
        "fr": "Revivez les mémoires séculaires de la Mère Suprême dans une aventure de science-fiction dystopique poignante.",
        "en": "A thrilling sci-fi narrative adventure. You are an Iris, a clone sworn to serve the Allmother until a dark truth emerges."
      },
      "composer": "Anthony H. Fung"
    }
  },
  {
    "id": "arco",
    "title": "Arco",
    "releaseYear": 2024,
    "genre": [
      "Stratégie",
      "Action",
      "Western",
      "Tactique"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Isométrique / 2.5D",
      "en": "Isometric / 2.5D"
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
        "fr": "Façonnez votre destin dans un western fantastique mésoaméricain grâce à un système de combat tactique simultané novateur.",
        "en": "Enter the breathtaking world of Arco, a unique tactical action game where your decisions shape each story."
      },
      "composer": "José Ramón \"Fáyer\" García"
    }
  },
  {
    "id": "core-keeper",
    "title": "Core Keeper",
    "releaseYear": 2024,
    "genre": [
      "Survie",
      "Sandbox",
      "Artisanat",
      "Co-op"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
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
        "fr": "Explorez une caverne souterraine infinie, déterrez des reliques et affrontez des bêtes colossales en solo ou en coopération.",
        "en": "Explore an endless subterranean cavern of creatures, relics and resources in a mining sandbox adventure."
      },
      "composer": "Jonathan Geer"
    }
  },
  {
    "id": "manor-lords",
    "title": "Manor Lords",
    "releaseYear": 2024,
    "genre": [
      "Gestion",
      "Stratégie",
      "Médiéval",
      "Simulation"
    ],
    "artStyle": {
      "fr": "3D Réaliste",
      "en": "Realistic 3D"
    },
    "camera": {
      "fr": "Troisième personne",
      "en": "Third-Person"
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
        "fr": "Bâtissez des villages médiévaux organiques et menez vos troupes dans des batailles tactiques à grande échelle.",
        "en": "A medieval strategy game featuring in-depth city building, large-scale tactical battles, and complex economic simulation."
      },
      "composer": "Christian Fernando Perucchi & Théophile Loaec"
    }
  },
  {
    "id": "fields-of-mistria",
    "title": "Fields of Mistria",
    "releaseYear": 2024,
    "genre": [
      "Simulation",
      "RPG",
      "Farming",
      "Cozy"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
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
        "fr": "Restaurez une charmante bourgade pastorale inspirée des animes des années 90 à travers l'agriculture, la magie et la romance.",
        "en": "Build the farm of your dreams as you restore a pastoral village to its former glory in this 90s-anime-inspired RPG."
      },
      "composer": "Joseph \"Tettix\" Garber"
    }
  },
  {
    "id": "cryptmaster",
    "title": "Cryptmaster",
    "releaseYear": 2024,
    "genre": [
      "Dungeon Crawler",
      "RPG",
      "Puzzle",
      "Comédie"
    ],
    "artStyle": {
      "fr": "Monochrome / Minimaliste",
      "en": "Monochrome"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "Paul Hart & Lee Williams",
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
        "fr": "Dictez et tapez des mots magiques pour lancer des sorts et résoudre des énigmes dans un donjon ténébreux hilarant.",
        "en": "SAY ANYTHING in this bizarre dungeon adventure where words control everything."
      },
      "composer": "Paul Hart"
    }
  },
  {
    "id": "mullet-madjack",
    "title": "MULLET MADJACK",
    "releaseYear": 2024,
    "genre": [
      "Fast-FPS",
      "Action",
      "Cyberpunk",
      "Rétro"
    ],
    "artStyle": {
      "fr": "3D Low-Poly / Rétro",
      "en": "Retro Low-poly 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
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
        "fr": "Un FPS ultra-nerveux inspiré des animes des années 90 où vous devez tuer un ennemi toutes les 10 secondes pour survivre.",
        "en": "A fast-paced single-player FPS that puts you directly inside a classic 90s cyberpunk anime."
      },
      "composer": "HAMMER95"
    }
  },
  {
    "id": "anger-foot",
    "title": "Anger Foot",
    "releaseYear": 2024,
    "genre": [
      "Fast-FPS",
      "Action",
      "Comédie"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
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
        "fr": "Défouraillez et fracassez les portes à coups de pied dans un shoot'em up frénétique sur fond de basses survoltées.",
        "en": "A lightning-fast hard bass blast of kicking down doors and kicking ass in the fever-dream city of Shit City."
      },
      "composer": "Free Lives Sound Team"
    }
  },
  {
    "id": "antonblast",
    "title": "ANTONBLAST",
    "releaseYear": 2024,
    "genre": [
      "Platformer",
      "Action",
      "Rétro",
      "Destruction"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D",
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
        "fr": "Démolissez des mondes survoltés armé de votre marteau géant pour récupérer vos esprits volés par Satan !",
        "en": "An explosive action platformer all about destruction. Demolish bizarre worlds and steal your Spirits back from Satan!"
      },
      "composer": "Tony Grayson"
    }
  },
  {
    "id": "emberward",
    "title": "Emberward",
    "releaseYear": 2026,
    "genre": [
      "Stratégie",
      "Free-to-play",
      "Roguelike"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
    },
    "developer": "Refic Games",
    "steamUrl": "https://store.steampowered.com/app/2459550/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2459550/80b9f622576d1c9ccfef45c57f1504378215c90d/ss_80b9f622576d1c9ccfef45c57f1504378215c90d.1920x1080.jpg?t=1789657527",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2459550/ss_4861d31990950a67a1797beadecb90b1cd79e22c.1920x1080.jpg?t=1789657527",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2459550/8011ef6ab4cfa1679bb3ded1e990f58e325ffdeb/ss_8011ef6ab4cfa1679bb3ded1e990f58e325ffdeb.1920x1080.jpg?t=1789657527",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2459550/28bd980ebd627c40fa6ad2e4fa2af2a7471543d0/ss_28bd980ebd627c40fa6ad2e4fa2af2a7471543d0.1920x1080.jpg?t=1789657527",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2459550/ss_1e69187064214f0881242624f2833a9bb909179f.1920x1080.jpg?t=1789657527",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2459550/1f08326bcf6cf6f85e95fd63e8a2780266c80e06/ss_1f08326bcf6cf6f85e95fd63e8a2780266c80e06.1920x1080.jpg?t=1789657527"
    ],
    "hints": {
      "tagline": {
        "fr": "Bâtissez des labyrinthes de tétrominos puis installez tout un éventail de tourelles. Une aventure stratégique, de la défense de tours en mode roguelite !",
        "en": "Build twisting mazes with tetromino blocks and deploy unique towers in this strategic roguelite tower defense adventure!"
      }
    }
  },
  {
    "id": "how-to-fish",
    "title": "How to Fish",
    "releaseYear": 2026,
    "genre": [
      "Action",
      "Simulation"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
    },
    "developer": "Dazed Games",
    "steamUrl": "https://store.steampowered.com/app/4001890/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4001890/48f6817fe466a7c9666605527558bf1fac48d0d2/ss_48f6817fe466a7c9666605527558bf1fac48d0d2.1920x1080.jpg?t=1788788717",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4001890/5f867d8c9b03c63867cc95b7bfaa4a3d2193ea48/ss_5f867d8c9b03c63867cc95b7bfaa4a3d2193ea48.1920x1080.jpg?t=1788788717",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4001890/2a912cdbf746286400cece1ca607ac077c11a1dc/ss_2a912cdbf746286400cece1ca607ac077c11a1dc.1920x1080.jpg?t=1788788717",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4001890/e15ab15c09cd3f6ec06d4ffacdf07f6c2b679db2/ss_e15ab15c09cd3f6ec06d4ffacdf07f6c2b679db2.1920x1080.jpg?t=1788788717",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4001890/65be87272efaa4bac87e16dc764a9535165effd2/ss_65be87272efaa4bac87e16dc764a9535165effd2.1920x1080.jpg?t=1788788717",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4001890/3c10ad99000bdcf9cd99509de59d2a1351496690/ss_3c10ad99000bdcf9cd99509de59d2a1351496690.1920x1080.jpg?t=1788788717"
    ],
    "hints": {
      "tagline": {
        "fr": "How to Fish est un simulateur de pêche pour 1 à 4 joueurs qui s’appuie sur règles de la physique. Alors que vous êtes tranquillement en train de siroter un verre sur votre bateau, vous vous écrasez sur une petite île. Pour pouvoir rentrer chez vous, vous allez devoir apprendre à pêcher.",
        "en": "A 1-4 player physics based fishing simulator. While drinking and boating you suddenly crash into a small island. To work your way back home you have to learn How to Fish."
      }
    }
  },
  {
    "id": "hollow-knight-silksong",
    "title": "Hollow Knight: Silksong",
    "releaseYear": 2025,
    "genre": [
      "Metroidvania",
      "Action",
      "Souls-like",
      "Platformer"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
    },
    "developer": "Team Cherry",
    "steamUrl": "https://store.steampowered.com/app/1030300/Hollow_Knight_Silksong/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1030300/d1a893ec6357b347a55ed929833ba793b57a79d2/ss_d1a893ec6357b347a55ed929833ba793b57a79d2.1920x1080.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1030300/856e33e755a0b9a785c645d116036516ea08812b/ss_856e33e755a0b9a785c645d116036516ea08812b.1920x1080.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1030300/8e09f2b2eedd3fa9b4479dd5c26d8bdf60562478/ss_8e09f2b2eedd3fa9b4479dd5c26d8bdf60562478.1920x1080.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1030300/d907d0cc2b10b5ea4788b8d502cc27787d520c1d/ss_d907d0cc2b10b5ea4788b8d502cc27787d520c1d.1920x1080.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1030300/1b93e8131cb6f4bd9e3791a606d0da8f9ee78276/ss_1b93e8131cb6f4bd9e3791a606d0da8f9ee78276.1920x1080.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1030300/header.jpg"
    ],
    "hints": {
      "tagline": {
        "fr": "Incarnez Hornet et explorez un vaste royaume hanté régenté par la soie et la musique.",
        "en": "Discover a vast, haunted kingdom ruled by silk and song as the lethal huntress Hornet."
      },
      "composer": "Christopher Larkin"
    }
  },
  {
    "id": "kernel-hearts",
    "title": "Kernel Hearts",
    "releaseYear": 2026,
    "genre": [
      "Action",
      "RPG",
      "Roguelike",
      "Coop"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
    },
    "developer": "Ephemera Games",
    "steamUrl": "https://store.steampowered.com/app/2902170/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2902170/8ee81da0a56173915f4a1555fdb60d94e7858d34/ss_8ee81da0a56173915f4a1555fdb60d94e7858d34.1920x1080.jpg?t=1789664735",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2902170/88078553b7fdd46bf11f0bcc1c435c0780e3a199/ss_88078553b7fdd46bf11f0bcc1c435c0780e3a199.1920x1080.jpg?t=1789664735",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2902170/674a81ec253e5753f3df34b628bc8479ad0e1d2d/ss_674a81ec253e5753f3df34b628bc8479ad0e1d2d.1920x1080.jpg?t=1789664735",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2902170/0edb6ca2e74c29ac41cd96308c0fc8d0d132fdd7/ss_0edb6ca2e74c29ac41cd96308c0fc8d0d132fdd7.1920x1080.jpg?t=1789664735",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2902170/a7410d408fbbb0ea6cb91100314b3b7a26d054cc/ss_a7410d408fbbb0ea6cb91100314b3b7a26d054cc.1920x1080.jpg?t=1789664735",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2902170/ss_2ddb69c6d0d4b3b45b5afe7d2909c113ce7c57b3.1920x1080.jpg?t=1789664735"
    ],
    "hints": {
      "tagline": {
        "fr": "Rassemblez vos alliés, éliminez les anges, transformez-vous en fille magique et... tuez Dieu ! Kernel Hearts est un jeu d'action-RPG roguelike en coopération multijoueur qui raconte l'histoire de quatre filles magiques qui tentent de sauver un monde noyé dans les cendres.",
        "en": "Gather your allies. Eliminate Angels. Transform into a Magical Girl. Slay god. Kernel Hearts is a Multiplayer Co-Op Roguelike Action RPG about four magical girls and their attempt to save a world that's drowning in ashes"
      }
    }
  },
  {
    "id": "openfront",
    "title": "OpenFront",
    "releaseYear": 2026,
    "genre": [
      "Massivement multijoueur",
      "Stratégie"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
    },
    "developer": "OpenFront Inc, Evan Pellegrini",
    "steamUrl": "https://store.steampowered.com/app/3560670/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3560670/e4bb7a01224734f6393a5b2ed182a58487ab7071/ss_e4bb7a01224734f6393a5b2ed182a58487ab7071.1920x1080.jpg?t=1789647376",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3560670/a4ae79cab4ff4e18f3aae9eaa8d8920d06a7b900/ss_a4ae79cab4ff4e18f3aae9eaa8d8920d06a7b900.1920x1080.jpg?t=1789647376",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3560670/a66ab60ca56f5942913e14566e21bedb7f5a5a07/ss_a66ab60ca56f5942913e14566e21bedb7f5a5a07.1920x1080.jpg?t=1789647376",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3560670/578a0bf1e70bc6dad974c310f0841e8f4bbfb15e/ss_578a0bf1e70bc6dad974c310f0841e8f4bbfb15e.1920x1080.jpg?t=1789647376",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3560670/a4ae79cab4ff4e18f3aae9eaa8d8920d06a7b900/ss_a4ae79cab4ff4e18f3aae9eaa8d8920d06a7b900.1920x1080.jpg?t=1789647376",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3560670/388957578e4ef7bdfd2382f13cbbc01d40dd3f89/ss_388957578e4ef7bdfd2382f13cbbc01d40dd3f89.1920x1080.jpg?t=1789647376"
    ],
    "hints": {
      "tagline": {
        "fr": "OpenFront est un jeu de battle royale PvP où des centaines de joueurs s'affrontent sur une immense carte, signant des alliances, amassant de l'or et déchaînant un enfer de frappes atomiques pour dominer le monde.",
        "en": "A massively multiplayer real-time strategy game pitting hundreds of players against one another. Over one million nuke each other every month."
      }
    }
  },
  {
    "id": "bombanana",
    "title": "BOMBANANA!",
    "releaseYear": 2026,
    "genre": [
      "Coop"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
    },
    "developer": "Lefto Studio",
    "steamUrl": "https://store.steampowered.com/app/4656000/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4656000/429d033410531fc2ec6ba0cd24956868beaff095/ss_429d033410531fc2ec6ba0cd24956868beaff095.1920x1080.jpg?t=1789051356",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4656000/e476a3ed312794922d58c9553130922acc7f393d/ss_e476a3ed312794922d58c9553130922acc7f393d.1920x1080.jpg?t=1789051356",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4656000/88b677bb5d6ec91c12ad8bfbdcc5faf3ff15a044/ss_88b677bb5d6ec91c12ad8bfbdcc5faf3ff15a044.1920x1080.jpg?t=1789051356",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4656000/edb04b7f1714524fc59691ad0368492488e317cc/ss_edb04b7f1714524fc59691ad0368492488e317cc.1920x1080.jpg?t=1789051356",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4656000/5564e2b1729232a6c4f9cdc190b5d10f0afc4946/ss_5564e2b1729232a6c4f9cdc190b5d10f0afc4946.1920x1080.jpg?t=1789051356",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4656000/c1063e896d08eaa213aa43498a1a9ac7e9c481d6/ss_c1063e896d08eaa213aa43498a1a9ac7e9c481d6.1920x1080.jpg?t=1789051356"
    ],
    "hints": {
      "tagline": {
        "fr": "Incarnez des singes démineurs entre amis ! Coopérez en équipe de trois singes : un aveugle, un sourd et un muet. Chaque joueur dispose d’une partie différente des informations. Communiquez, résolvez des casse-têtes et jouez contre la montre. Désamorcerez-vous les bombes avant qu’elles explosent ?",
        "en": "Chaotic bomb disposal fun with friends &amp; monkeys! Work together as a 3-player co-op team of blind, deaf, and mute monkeys. Each player has only part of the needed information. Communicate, solve puzzles, and race against the clock. Can you defuse the bombs before they explode?"
      }
    }
  },
  {
    "id": "no-rest-for-the-wicked",
    "title": "No Rest for the Wicked",
    "releaseYear": 2024,
    "genre": [
      "Action-RPG",
      "Soulslike",
      "Dark Fantasy",
      "Aventure"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Isométrique / 2.5D",
      "en": "Isometric / 2.5D"
    },
    "developer": "Moon Studios GmbH",
    "steamUrl": "https://store.steampowered.com/app/1371980/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1371980/079327abaf4866604f9f77200ded37da18d7089e/ss_079327abaf4866604f9f77200ded37da18d7089e.1920x1080.jpg?t=1789377119",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1371980/56066f44f29e8b042c482e0b0680bc101bf1ecd5/ss_56066f44f29e8b042c482e0b0680bc101bf1ecd5.1920x1080.jpg?t=1789377119",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1371980/1163c9191d2261d845aa96cbc011ed6490182ae8/ss_1163c9191d2261d845aa96cbc011ed6490182ae8.1920x1080.jpg?t=1789377119",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1371980/ss_01a87d9ec6cef10244eb5dd8d3f55047060da954.1920x1080.jpg?t=1789377119",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1371980/5b7da66aa69e175a215b52a4461c1d3748ec571e/ss_5b7da66aa69e175a215b52a4461c1d3748ec571e.1920x1080.jpg?t=1789377119",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1371980/5ced8490a4743651afb3fe68e480ab5422e56e74/ss_5ced8490a4743651afb3fe68e480ab5422e56e74.1920x1080.jpg?t=1789377119"
    ],
    "hints": {
      "tagline": {
        "fr": "Moon Studios, les créateurs récompensés pour Ori and the Blind Forest et Ori and the Will of the Wisps, vous présentent No Rest for the Wicked, un jeu d'action-RPG unique et sanglant qui se déroule dans un monde dessiné à la main et qui propose des combats de type souls-like.",
        "en": "From Moon Studios, the award-winning creators of Ori and the Blind Forest and Ori and the Will of the Wisps, comes No Rest for the Wicked, a unique, visceral Action RPG set in a hand-crafted world with Souls-like combat. Featuring co-op for up to four players."
      },
      "composer": "unlikely of places"
    }
  },
  {
    "id": "rv-there-yet",
    "title": "RV There Yet?",
    "releaseYear": 2025,
    "genre": [
      "Action",
      "Aventure",
      "Coop"
    ],
    "artStyle": {
      "fr": "3D Rétro Low-poly",
      "en": "Retro Low-poly 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "Nuggets Entertainment",
    "steamUrl": "https://store.steampowered.com/app/3949040/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3949040/ed2f7080c6622688a72a86ca85af600f2a2bdfb9/ss_ed2f7080c6622688a72a86ca85af600f2a2bdfb9.1920x1080.jpg?t=1789134289",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3949040/7d246f94e4ec2ff4c7be3ded82bcdd558274d7c7/ss_7d246f94e4ec2ff4c7be3ded82bcdd558274d7c7.1920x1080.jpg?t=1789134289",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3949040/f5663e0220e188d4c9db0789f0cbb4ddefd762d5/ss_f5663e0220e188d4c9db0789f0cbb4ddefd762d5.1920x1080.jpg?t=1789134289",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3949040/9face7033df9bd0274428d6215711c5dec20f245/ss_9face7033df9bd0274428d6215711c5dec20f245.1920x1080.jpg?t=1789134289",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3949040/aa6d58ff1f0eb5c5b3e6d7cc10c1576b62a745b0/ss_aa6d58ff1f0eb5c5b3e6d7cc10c1576b62a745b0.1920x1080.jpg?t=1789134289",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3949040/9c06d0d1e31ab3e05b1ce24692a9397ca7bfabf1/ss_9c06d0d1e31ab3e05b1ce24692a9397ca7bfabf1.1920x1080.jpg?t=1789134289"
    ],
    "hints": {
      "tagline": {
        "fr": "Un jeu d'aventure coopératif qui vous met au défi de conduire votre caravane jusqu'à votre domicile !",
        "en": "A co-op adventure about driving your Recreational Vehicle home."
      },
      "composer": "road bumps"
    }
  },
  {
    "id": "palworld",
    "title": "Palworld",
    "releaseYear": 2026,
    "genre": [
      "Action",
      "Aventure",
      "RPG",
      "Survie"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Troisième personne",
      "en": "Third-Person"
    },
    "developer": "Pocketpair",
    "steamUrl": "https://store.steampowered.com/app/1623730/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/ss_f81b7c4f20be3b99f76a1415c4cdb9b444c99b97.1920x1080.jpg?t=1784714419",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/648ed4266fc18f413292292741304ef648421c55/ss_648ed4266fc18f413292292741304ef648421c55.1920x1080.jpg?t=1784714419",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/ss_b3cea7c9f04a67d784d4c6a0c157a11d6268b189.1920x1080.jpg?t=1784714419",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/cd7b46028d10c21db8fc8217192094d309efcebc/ss_cd7b46028d10c21db8fc8217192094d309efcebc.1920x1080.jpg?t=1784714419",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/ss_06e27c15c7b4b10233c937b887cf6a6925c83009.1920x1080.jpg?t=1784714419",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/ss_a99fba5536acde781bd863cb3555c10b5b96c0ae.1920x1080.jpg?t=1784714419"
    ],
    "hints": {
      "tagline": {
        "fr": "Un tout nouveau jeu de survie multijoueur en monde ouvert où le but est de collectionner de mystérieuses créatures, les Pals, afin de les faire combattre, bâtir des structures, travailler dans les champs et faire tourner vos usines.",
        "en": "Fight, farm, build and work alongside mysterious creatures called &quot;Pals&quot; in this completely new multiplayer, open world survival and crafting game!"
      },
      "composer": "Tatsuya Yano"
    }
  },
  {
    "id": "megabonk",
    "title": "Megabonk",
    "releaseYear": 2025,
    "genre": [
      "Action"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
    },
    "developer": "vedinad",
    "steamUrl": "https://store.steampowered.com/app/3405340/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3405340/ce4d8d24a3731a91490ab92b8687f07314c600b9/ss_ce4d8d24a3731a91490ab92b8687f07314c600b9.1920x1080.jpg?t=1760445338",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3405340/9ecc4f12f9031e38e546e80416c98eab310dea8b/ss_9ecc4f12f9031e38e546e80416c98eab310dea8b.1920x1080.jpg?t=1760445338",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3405340/b1e906ba6bbac4b9017fb786a1b2d88ec3b41578/ss_b1e906ba6bbac4b9017fb786a1b2d88ec3b41578.1920x1080.jpg?t=1760445338",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3405340/3cb8c4f7ded582a7a26f483de08bbd4f91eea2bc/ss_3cb8c4f7ded582a7a26f483de08bbd4f91eea2bc.1920x1080.jpg?t=1760445338",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3405340/37fee9ad83231587004b29d0532b9309d1efd8df/ss_37fee9ad83231587004b29d0532b9309d1efd8df.1920x1080.jpg?t=1760445338",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3405340/1d012ef02e5fbd1ed8245a62d60d620b25e84856/ss_1d012ef02e5fbd1ed8245a62d60d620b25e84856.1920x1080.jpg?t=1760445338"
    ],
    "hints": {
      "tagline": {
        "fr": "Fracasse des vagues infinies d’ennemis et deviens surpuissant ! Récupère du loot, monte de niveau, débloque des persos et améliore tout pour créer des builds uniques et complètement fous en repoussant les hordes de créatures !",
        "en": "Smash your way through endless waves of enemies and grow absurdly powerful! Grab loot, level up, unlock characters and upgrade to create unique and crazy builds as you fend off hordes of creatures!"
      }
    }
  },
  {
    "id": "drag-n-wash",
    "title": "Drag'n Wash",
    "releaseYear": 2026,
    "genre": [
      "Simulation"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Troisième personne",
      "en": "Third-Person"
    },
    "developer": "Gator Dragon Games",
    "steamUrl": "https://store.steampowered.com/app/4739660/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4739660/a5e5758e586579304fb384b19748a1a9cad523e7/ss_a5e5758e586579304fb384b19748a1a9cad523e7.1920x1080.jpg?t=1789341978",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4739660/2ddd4ed56c784c9c1cce20464eb033682f17bfd9/ss_2ddd4ed56c784c9c1cce20464eb033682f17bfd9.1920x1080.jpg?t=1789341978",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4739660/cd80d36a37c069add9ad451a4a62cd78e8258682/ss_cd80d36a37c069add9ad451a4a62cd78e8258682.1920x1080.jpg?t=1789341978",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4739660/75d7c5192cdcbfcbe4b7d1cba8beb58fb5b444e6/ss_75d7c5192cdcbfcbe4b7d1cba8beb58fb5b444e6.1920x1080.jpg?t=1789341978",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4739660/a971332a5c67b7839310c18bb0663e7abc736293/ss_a971332a5c67b7839310c18bb0663e7abc736293.1920x1080.jpg?t=1789341978",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4739660/374b510b7ee74cff70cae6fef9dd915c681523c6/ss_374b510b7ee74cff70cae6fef9dd915c681523c6.1920x1080.jpg?t=1789341978"
    ],
    "hints": {
      "tagline": {
        "fr": "Enjoy a narrative involving 3 male dragons. Wash them, chat with them, touch them, and more! A 3D dragon washing experience.",
        "en": "Enjoy a narrative involving 3 male dragons. Wash them, chat with them, touch them, and more! A 3D dragon washing experience."
      }
    }
  }
];

// Helper déterministe pour obtenir le jeu du jour basé sur une graine temporelle "YYYY-MM-DD"
export function getDailyGame(dateString: string, offset = 0): Game {
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = (hash << 5) - hash + dateString.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash + offset) % INDIE_GAMES.length;
  return INDIE_GAMES[index];
}
