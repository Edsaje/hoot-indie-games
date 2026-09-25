import type { Game } from '../types/game';
import { getScheduledDailyGame, getScheduledDay } from '../utils/monthlyScheduler';

/**
 * Base de données officielle de jeux indépendants certifiés "Hoot Indie Games"
 * Enrichie quotidiennement par le robot Hoot Harvest via l'API Steam Store officielle.
 * 0 Hallucination : métadonnées et captures certifiées.
 * Total de jeux : 185
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/ss_5384f9f8b96a0b9934b2bc35a4058376211636d2.1920x1080.jpg?t=1776125684",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/ss_d5b6edd94e77ba6db31c44d8a3c09d807ab27751.1920x1080.jpg?t=1776125684",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/ss_a81e4231cc8d55f58b51a4a938898af46503cae5.1920x1080.jpg?t=1776125684",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/ss_62e10cf506d461e11e050457b08aa0e2a1c078d0.1920x1080.jpg?t=1776125684",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/ss_bd76bd88bc5334ee56ae3d5f0d8dec4455e8e3b8.1920x1080.jpg?t=1776125684",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/ss_33a645903d6dd9beec39f272a3daf57174a6cc26.1920x1080.jpg?t=1776125684"
    ],
    "hints": {
      "tagline": {
        "fr": "Explorez un vaste royaume en ruine peuplé d'insectes et de héros oubliés.",
        "en": "Forge your own path through a vast ruined kingdom of insects and heroes.",
        "es": "Forja tu propio camino a través de un vasto reino en ruinas de insectos y héroes.",
        "de": "Bahne dir deinen eigenen Weg durch ein riesiges, verfallenes Königreich aus Insekten und Helden.",
        "ja": "昆虫と英雄が眠る滅びゆく広大な王国の廃墟で、自分だけの道を切り拓け。",
        "pt-BR": "Trilhe seu próprio caminho por um vasto reino em ruínas de insetos e heróis."
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
    "itchUrl": "https://maddymakesgamesinc.itch.io/celeste",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/504230/ss_1ad297c2044cdcf450ee83e56350cafb590da755.1920x1080.jpg?t=1714089525",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/504230/ss_03bfe6bd5ddac7f747c8d2aa1a4f82cfd53c6dcb.1920x1080.jpg?t=1714089525",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/504230/ss_4b0f0222341b64a37114033aca9994551f27c161.1920x1080.jpg?t=1714089525",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/504230/ss_1012b11ad364ad6c138a25a654108de28de56c5f.1920x1080.jpg?t=1714089525",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/504230/ss_832ef0f27c3d6efdaa4b5d1cc896dce0999bc9e8.1920x1080.jpg?t=1714089525",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/504230/ss_1098b655a622720cfd549b104736a4eca8948100.1920x1080.jpg?t=1714089525"
    ],
    "hints": {
      "tagline": {
        "fr": "Aidez Madeline à gravir une montagne mystique tout en affrontant ses démons intérieurs.",
        "en": "Help Madeline survive her inner demons on her journey to the top of Celeste Mountain.",
        "es": "Ayuda a Madeline a sobrevivir a sus demonios internos en su viaje a la cima de la montaña Celeste.",
        "de": "Hilf Madeline auf ihrer Reise zum Gipfel des Celeste Mountain, ihre inneren Dämonen zu bezwingen.",
        "ja": "心の闇と向き合いながら、少女マデリンとともに霊峰セレステ山の頂上を目指せ。",
        "pt-BR": "Ajude Madeline a enfrentar seus demônios internos em sua jornada até o cume da Montanha Celeste."
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/753640/ss_ec95a283483f0438be40d033f08b9d956e748d54.1920x1080.jpg?t=1785424341",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/753640/ss_09f0fa8d9b8d7da1408cf4e03303d896cbd9be18.1920x1080.jpg?t=1785424341",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/753640/ss_c624a6b8edca0d451605592edd927dbcc14917a8.1920x1080.jpg?t=1785424341",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/753640/ss_8683942f8d09eec32daeebe94867287424968f97.1920x1080.jpg?t=1785424341",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/753640/ss_fe4a6504c49efa6e7cb9ecda7aeddb6f7451a2cc.1920x1080.jpg?t=1785424341"
    ],
    "hints": {
      "tagline": {
        "fr": "Explorez un système solaire condamné pris au piège d'une boucle temporelle infinie de 22 minutes.",
        "en": "Explore a sun-soaked solar system trapped in an endless 22-minute time loop.",
        "es": "Explora un sistema solar atrapado en un bucle temporal infinito de 22 minutos.",
        "de": "Erkunde ein Sonnensystem, das in einer endlosen 22-minütigen Zeitschleife gefangen ist.",
        "ja": "22分間の無限のタイムループに囚われた太陽系を探索し、星々の謎を解き明かせ。",
        "pt-BR": "Explore um sistema solar condenado preso em um loop temporal infinito de 22 minutos."
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145360/ss_c0fed447426b69981cf1721756acf75369801b31.1920x1080.jpg?t=1758127023",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145360/ss_8a9f0953e8a014bd3df2789c2835cb787cd3764d.1920x1080.jpg?t=1758127023",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145360/ss_68300459a8c3daacb2ec687adcdbf4442fcc4f47.1920x1080.jpg?t=1758127023",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145360/ss_bcb499a0dd001f4101823f99ec5094d2872ba6ee.1920x1080.jpg?t=1758127023",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145360/ss_8e07e477fa7ff2f88c8984bc89b9652a655da0e9.1920x1080.jpg?t=1758127023",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145360/ss_34e6660705cfe47d2b2f95189c37f7cb77f75ca6.1920x1080.jpg?t=1758127023"
    ],
    "hints": {
      "tagline": {
        "fr": "Défiez le dieu des morts et frayez-vous un chemin hors des Enfers grecs.",
        "en": "Defy the god of the dead as you hack and slash out of the Underworld of Greek myth.",
        "es": "Desafía al dios de los muertos y ábrete camino fuera del Inframundo de la mitología griega.",
        "de": "Trotze dem Gott der Toten und kämpfe dich durch die griechische Unterwelt in die Freiheit.",
        "ja": "死者の国の神に抗い、ギリシャ神話の冥界を突破して地上を目指せ。",
        "pt-BR": "Desafie o deus dos mortos e lute para escapar do submundo da mitologia grega."
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/588650/ss_ac28000ade40cc2fe5c128f32ac98ba33c008a7a.1920x1080.jpg?t=1779086887",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/588650/ss_7bde51ea6c8f6289e85ea1d8c1c941e1f8bfee91.1920x1080.jpg?t=1779086887",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/588650/ss_e87e72a247918d8493892e035d5e1b4b84470d2f.1920x1080.jpg?t=1779086887",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/588650/ss_a099416b9f3e09d47c42f87667e6ad6f394ba652.1920x1080.jpg?t=1779086887",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/588650/ss_a8b0439ad7750cab1bdec86ecef0daa280e9f93f.1920x1080.jpg?t=1779086887",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/588650/ss_21c61aca6a66745a2abb3f72b93553398fc7fe32.1920x1080.jpg?t=1779086887"
    ],
    "hints": {
      "tagline": {
        "fr": "Combattez dans un château labyrinthique en perpétuelle mutation dans ce Roguevania nerveux.",
        "en": "Fight through an ever-changing labyrinthine island castle in this fast-paced Roguevania.",
        "es": "Lucha a través de un castillo laberíntico en constante mutación en este frenético Roguevania.",
        "de": "Kämpfe dich in diesem rasanten Roguevania durch eine sich ständig wandelnde Insellabyrinth-Burg.",
        "ja": "変化し続ける巨大な城塞迷宮を戦い抜く、ハイテンポなローグヴァニア。",
        "pt-BR": "Lute por um castelo labiríntico em constante mutação neste frenético Roguevania."
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/391540/ss_6ded97a2c98473ac1e8a2b3c1419d93fb31b1186.1920x1080.jpg?t=1757349115",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/391540/ss_b9018c41cea2bdfb150609bedfca99b16a5af02a.1920x1080.jpg?t=1757349115",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/391540/ss_b9ec4c53a8ed37f764649c970757c0a1f4948ec1.1920x1080.jpg?t=1757349115",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/391540/ss_edab41f7c9fa287b0d90ebfa3b9219fec6e1b3ed.1920x1080.jpg?t=1757349115",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/391540/ss_a11393d4b437ca75c10521f6baf53fbba9006f0f.1920x1080.jpg?t=1757349115",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/391540/ss_85d6f0db4b5d6207534120c4b51e37dfd2f8dd83.1920x1080.jpg?t=1757349115"
    ],
    "hints": {
      "tagline": {
        "fr": "Un RPG émouvant et hilarant où vous n'êtes obligé d'éliminer aucun ennemi.",
        "en": "The friendly RPG where nobody has to die.",
        "es": "El entrañable RPG donde nadie tiene que morir.",
        "de": "Das herzliche Rollenspiel, in dem niemand sterben muss.",
        "ja": "誰も倒さなくていい、心温まる優しい名作RPG。",
        "pt-BR": "O RPG acolhedor onde ninguém precisa morrer."
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/646570/ss_c171816f7ecd35b5b46d2fa27532f4c5b8ca3cc5.1920x1080.jpg?t=1774015376",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/646570/ss_01aa3e7759e457bfbf2422f31c325d7b3ba8a6eb.1920x1080.jpg?t=1774015376",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/646570/ss_b757436d08ba08292796bfed9c60e7cc99d5f2c3.1920x1080.jpg?t=1774015376",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/646570/ss_1299d7fe55771cf564848c5046fbef7936178440.1920x1080.jpg?t=1774015376",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/646570/ss_8af73365121b1b1e2d8004fca2cbffb9b9f6d7a5.1920x1080.jpg?t=1774015376",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/646570/ss_5b2b32f09da5a5bed99d5c5168b50fd681a4690c.1920x1080.jpg?t=1774015376"
    ],
    "hints": {
      "tagline": {
        "fr": "Fusionnez jeu de cartes et roguelike pour gravir une flèche peuplée de reliques et de monstres.",
        "en": "Craft a unique deck, encounter bizarre creatures, and discover relics of immense power.",
        "es": "Crea una baraja única, encuentra criaturas extrañas y descubre reliquias de inmenso poder.",
        "de": "Erstelle ein einzigartiges Kartendeck, begegne bizarren Kreaturen und entdecke mächtige Relikte.",
        "ja": "独自のデッキを構築し、奇妙な怪物を倒しながら強大な遺物を集めて塔の頂を目指せ。",
        "pt-BR": "Crie um baralho único, enfrente criaturas bizarras e descubra relíquias de poder imenso."
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/553420/ss_9c0184ba83022786f74f4a70ebae5c47d2a3c35c.1920x1080.jpg?t=1783359656",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/553420/ss_5fc49d3c5fa34b0d0e6b6a5621f9062bec7ac4d7.1920x1080.jpg?t=1783359656",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/553420/ss_04ac7db623d3e88751134eb87f5c465c392fa108.1920x1080.jpg?t=1783359656",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/553420/ss_cce46eba03270e47fab2f955ec148c43f71fdb49.1920x1080.jpg?t=1783359656",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/553420/ss_a19c43feb20d7c6aeda4e0bf6abb6e9ca10c3974.1920x1080.jpg?t=1783359656",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/553420/ss_37434cb739e8b0690f939840bf6a0167141e2929.1920x1080.jpg?t=1783359656"
    ],
    "hints": {
      "tagline": {
        "fr": "Guidez un jeune renard dans un vaste monde de légendes et reconstituez la notice du jeu page par page.",
        "en": "Explore a land filled with lost legends, ancient powers, and ferocious monsters in this isometric adventure.",
        "es": "Explora una tierra llena de leyendas perdidas, poderes antiguos y monstruos feroces en esta aventura isométrica.",
        "de": "Erkunde in diesem isometrischen Abenteuer ein Land voller verlorener Legenden und uralter Mächte.",
        "ja": "小さなキツネを導き、古代の伝説と神秘の取扱説明書を復元するクォータービューの冒険。",
        "pt-BR": "Guie uma pequena raposa por um vasto mundo de lendas e reconstrua o manual do jogo página por página."
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/268910/ss_e3096a5555cb77d88db165c83d5ef3a24af1354a.1920x1080.jpg?t=1709068852",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/268910/ss_615455299355eaf552c638c7ea5b24a8b46e02dd.1920x1080.jpg?t=1709068852",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/268910/ss_483fb089be0093beeef03525276803a9ca4f66a1.1920x1080.jpg?t=1709068852",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/268910/ss_48477e4a865827aa0be6a44f00944d8d2a3e5eb9.1920x1080.jpg?t=1709068852",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/268910/ss_380296effbf1073bbedfd480e50cf246eb542b66.1920x1080.jpg?t=1709068852",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/268910/ss_aefad3850c3bc04000cbe0d620bea6807e0a0331.1920x1080.jpg?t=1709068852"
    ],
    "hints": {
      "tagline": {
        "fr": "Affrontez des boss gigantesques dans un style cartoon inspiré des années 1930 animé à la main.",
        "en": "A classic run and gun action game heavily focused on boss battles, inspired by 1930s cartoons.",
        "es": "Un juego de acción clásico centrado en combates contra jefes, inspirado en los dibujos animados de los años 30.",
        "de": "Ein klassisches Run-and-Gun-Actionspiel mit epischen Bosskämpfen im handgezeichneten Stil der 1930er.",
        "ja": "1930年代のカートゥーンアニメにインスパイアされた、手描きセル画のボスバトルアクション。",
        "pt-BR": "Enfrente chefes gigantescos em um estilo de desenho animado dos anos 1930 feito à mão."
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/632470/ss_b3694e99ffdb686d1bbbbe16a540d3d2ccd509c4.1920x1080.jpg?t=1780913406",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/632470/ss_9125a718ee9ba85386ae5d4eb820f3266073fc97.1920x1080.jpg?t=1780913406",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/632470/ss_4f5fdc3cf42feca8dafb1f7d2910ef96e62708a2.1920x1080.jpg?t=1780913406",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/632470/ss_fc6969799ebf19fd2a2c8a986c9419e053606a17.1920x1080.jpg?t=1780913406",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/632470/ss_dec29c440fab2f7817d68c1380c019290eb1755e.1920x1080.jpg?t=1780913406",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/632470/ss_ab38615b3a1d0d4309f06772db4bd9db5c250ef7.1920x1080.jpg?t=1780913406"
    ],
    "hints": {
      "tagline": {
        "fr": "Incarnez un détective amnésique doté d'un système de compétences unique au cœur d'une cité décadente.",
        "en": "A groundbreaking role-playing game where you are a detective with a unique skill system at your disposal.",
        "es": "Un juego de rol revolucionario donde encarnas a un detective con un sistema de habilidades único.",
        "de": "Ein bahnbrechendes Rollenspiel, in dem du als Detektiv mit einem einzigartigen Fähigkeitssystem ermittelst.",
        "ja": "記憶喪失の刑事が独自のスキルを駆使して殺人事件の真相を追う、革新的な推理RPG。",
        "pt-BR": "Encarne um detetive com amnésia e um sistema de habilidades único no coração de uma cidade decadente."
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
      "fr": "3D Rétro Low-poly",
      "en": "Retro Low-poly 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "Daniel Mullins Games",
    "steamUrl": "https://store.steampowered.com/app/1092790/Inscryption/",
    "itchUrl": "https://danielmullinsgames.itch.io/inscryption",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1092790/ss_0191a69b0e94a9a7784f5b81e27f06379910645a.1920x1080.jpg?t=1777572925",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1092790/ss_3b714682e9e0a214df1630a234e9f6764528eece.1920x1080.jpg?t=1777572925",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1092790/ss_7bfe728822807d232398df1cb1a5d64addd3d8fb.1920x1080.jpg?t=1777572925",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1092790/ss_79a146c36a3f0b728a8e0085327cec8c7fba82d6.1920x1080.jpg?t=1777572925",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1092790/ss_738220c84b63522c4ca8c77fbff1ddb252ea0fe9.1920x1080.jpg?t=1777572925",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1092790/ss_e3338b329e4d92b56121f2e849486ee805a56169.1920x1080.jpg?t=1777572925"
    ],
    "hints": {
      "tagline": {
        "fr": "Une odyssée noire et mystérieuse mêlant deckbuilding, escape room et horreur psychologique.",
        "en": "An inky black card-based rogue-like that blends deckbuilding, escape-room puzzles, and psychological horror.",
        "es": "Un oscuro roguelike de cartas que combina construcción de mazos, puzles de escape room y terror psicológico.",
        "de": "Ein düsteres kartenbasiertes Roguelike, das Deckbuilding, Escape-Room-Rätsel und psychologischen Horror vereint.",
        "ja": "デッキ構築、脱出ゲームパズル、そしてサイコロジカルホラーが融合した闇のカードアドベンチャー。",
        "pt-BR": "Uma odisseia sombria que mistura construção de baralho, enigmas de escape room e terror psicológico."
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/ss_b887651a93b0525739049eb4194f633de2df75be.1920x1080.jpg?t=1786554168",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/ss_9ac899fe2cda15d48b0549bba77ef8c4a090a71c.1920x1080.jpg?t=1786554168",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/ss_4fa0866709ede3753fdf2745349b528d5e8c4054.1920x1080.jpg?t=1786554168",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/ss_d836f0a5b0447fb6a2bdb0a6ac5f954949d3c41e.1920x1080.jpg?t=1786554168",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/ss_10628b4a811c0a925a1433d4323f78c7017dbbe4.1920x1080.jpg?t=1786554168",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/ss_6422d297347258086b389e3d5d9c0e0c698312e4.1920x1080.jpg?t=1786554168"
    ],
    "hints": {
      "tagline": {
        "fr": "Héritez de la vieille parcelle de votre grand-père et construisez la ferme de vos rêves.",
        "en": "You have inherited your grandfather's old farm plot. Can you learn to live off the land?",
        "es": "Has heredado la vieja granja de tu abuelo. ¿Podrás aprender a vivir de la tierra?",
        "de": "Du hast den alten Bauernhof deines Großvaters geerbt. Schaffst du es, vom Land zu leben?",
        "ja": "祖父の荒れ果てた農場を受け継ぎ、自給自足の豊かな生活を築き上げるカントリーライフRPG。",
        "pt-BR": "Herde a antiga fazenda do seu avô e construa o refúgio rural dos seus sonhos."
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/264710/ss_e182b6b20bb797500f9f63c561586d920d44e37c.1920x1080.jpg?t=1777456112",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/264710/ss_970a13f246e33e0df26d93baf9f8e975732adb4b.1920x1080.jpg?t=1777456112",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/264710/ss_5f2f2ea498cdc632cbffd6cf37c1a09670eb3272.1920x1080.jpg?t=1777456112",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/264710/ss_cebc378d2f7bc78978c21db4e3c5e12ccd067349.1920x1080.jpg?t=1777456112",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/264710/ss_0ace7f8b4350b8fbdd16345a76bc30545256e918.1920x1080.jpg?t=1777456112",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/264710/ss_f0eeabe108c2bc2b3e370b9828fb280035b50db2.1920x1080.jpg?t=1777456112"
    ],
    "hints": {
      "tagline": {
        "fr": "Plongez dans les profondeurs d'un monde sous-marin extraterrestre rempli de merveilles et de terreurs.",
        "en": "Descend into the depths of an alien underwater world filled with wonder and peril.",
        "es": "Desciende a las profundidades de un mundo submarino alienígena lleno de maravillas y peligros.",
        "de": "Tauche ein in die Tiefen einer außerirdischen Unterwasserwelt voller Wunder und Gefahren.",
        "ja": "未知の海洋惑星の深海へと潜り、驚異と恐怖が渦巻く海で生き残れ。",
        "pt-BR": "Mergulhe nas profundezas de um mundo oceânico alienígena repleto de maravilhas e perigos."
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
      "Stratégie",
      "Cartes"
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2379780/96208723dbedef49d71bf1b0a74aee1689018c50/ss_96208723dbedef49d71bf1b0a74aee1689018c50.1920x1080.jpg?t=1788961800",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2379780/ss_4862112e5030f74a5818cd4c31347d699ac5adf3.1920x1080.jpg?t=1788961800",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2379780/ss_3be65a7dd3be072d567e11883d208861a7e959fa.1920x1080.jpg?t=1788961800",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2379780/ss_e32ac94d7d1d6be7dd015d78f2b52aeb4cc282ed.1920x1080.jpg?t=1788961800",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2379780/ss_b8455573ec1fd2c9412f22bd8df05f2d8027a95b.1920x1080.jpg?t=1788961800",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2379780/ss_075cb45cbfa97d8139fb11f21667d6e35f908640.1920x1080.jpg?t=1788961800"
    ],
    "hints": {
      "tagline": {
        "fr": "Un roguelike de poker hypnotique où des cartes Joker modificateurs créent des combos démesurés.",
        "en": "A poker-themed roguelike deckbuilder about creating powerful synergies and winning big.",
        "es": "Un roguelike de póker hipnótico donde las cartas comodín crean sinergias demoledoras.",
        "de": "Ein fesselndes Poker-Roguelike, in dem Joker-Karten mächtige Synergien und riesige Gewinne entfesseln.",
        "ja": "ポーカーとローグライクが融合した、ジョーカーの相乗効果で大勝を狙うデッキビルダー。",
        "pt-BR": "Um roguelike de pôquer hipnótico onde curingas criam sinergias devastadoras e pontuações astronômicas."
      },
      "composer": "Louis F."
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/813230/ss_87a9f2941e114a2bb834db6350ccbedc1ade794d.1920x1080.jpg?t=1788379439",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/813230/ss_ca955f6bb4f0c164dcffa59082ae985fb530582a.1920x1080.jpg?t=1788379439",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/813230/ss_6c242925256158897426f3e90e7e8a8f8f0bbee9.1920x1080.jpg?t=1788379439",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/813230/ss_f9f088275737d81e0eb998e0c076282c5c1955c3.1920x1080.jpg?t=1788379439",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/813230/ss_e8450943c2393103ef5e51d9c968c3ae1a610a55.1920x1080.jpg?t=1788379439",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/813230/ss_8773f0939bfd96fe25fbb7395bbae3d725044b12.1920x1080.jpg?t=1788379439"
    ],
    "hints": {
      "tagline": {
        "fr": "Explorez un labyrinthe souterrain interconnecté et dense regorgeant de secrets et d'énigmes subtiles.",
        "en": "Explore a dense, interconnected labyrinth and decipher its many secrets in this atmospheric puzzle metroidvania.",
        "es": "Explora un laberinto subterráneo denso y conectado, descifrando sus secretos en este metroidvania atmosférico.",
        "de": "Erkunde ein dichtes, miteinander verbundenes Labyrinth und lüfte seine Geheimnisse in diesem Puzzle-Metroidvania.",
        "ja": "濃密に絡み合う地下迷宮を探索し、無数の謎と秘密を解き明かすパズルメトロイドヴァニア。",
        "pt-BR": "Explore um labirinto subterrâneo denso e interconectado, repleto de segredos e enigmas engenhosos."
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1244090/ss_f756ff477590284c7192ffcef99237de056e4aeb.1920x1080.jpg?t=1780931183",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1244090/ss_c250a7fd789b3cbab5ca8e99e3530cf933656ad1.1920x1080.jpg?t=1780931183",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1244090/ss_889d4ddea7d0884d9d370dd280878570824e68fe.1920x1080.jpg?t=1780931183",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1244090/ss_cb9259d083c9d42db9b1f1197e030f8f85d42198.1920x1080.jpg?t=1780931183",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1244090/ss_e7ac3a6e5ebe5f4561fc46d116c33678cf4ba811.1920x1080.jpg?t=1780931183",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1244090/ss_3fe41c00a7122c63aa05b4ea331c6f995e356788.1920x1080.jpg?t=1780931183"
    ],
    "hints": {
      "tagline": {
        "fr": "Un RPG au tour par tour inspiré des classiques des années 90, contant l'histoire de deux Enfants du Solstice.",
        "en": "A turn-based RPG inspired by the 90s classics, telling the story of two Children of the Solstice.",
        "es": "Un RPG por turnos inspirado en los clásicos de los 90 que narra la historia de dos Hijos del Solsticio.",
        "de": "Ein rundenbasiertes RPG im Geiste der 90er-Klassiker über das Schicksal zweier Kinder der Sonnenwende.",
        "ja": "90年代の名作JRPGに敬意を表した、至日の戦士たちが織り成す壮大なターン制RPG。",
        "pt-BR": "Um RPG em turnos inspirado nos clássicos dos anos 90, narrando a história de dois Filhos do Solstício."
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
    "steamUrl": "https://store.steampowered.com/app/774361/Blasphemous/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/774361/ss_770720a3db9408ae7ae6625ba157bfb9195a3a68.1920x1080.jpg?t=1780479368",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/774361/ss_b74f57919e88283fac75389e76ead2fed73997e5.1920x1080.jpg?t=1780479368",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/774361/ss_bd57bcb1e9183cbea61339727a97bcc5206677b2.1920x1080.jpg?t=1780479368",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/774361/ss_933510ac0fd13c6bd4ecc4c187e0506d520f2e70.1920x1080.jpg?t=1780479368",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/774361/ss_957b6216519c614984ee71c6f6a524d75ea6353b.1920x1080.jpg?t=1780479368",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/774361/ss_959ffc1230d2ca57e18a9c96f3c56f5643b5cce7.1920x1080.jpg?t=1780479368"
    ],
    "hints": {
      "tagline": {
        "fr": "Incarnez le Pénitent dans un monde de cauchemar ravagé par une terrible malédiction religieuse.",
        "en": "A punishing action-platformer that combines fast-paced, skilled hack-and-slash combat with deep lore.",
        "es": "Un implacable juego de acción y plataformas que combina combates hack and slash con una mitología oscura.",
        "de": "Ein kompromissloser Action-Plattformer mit rasanten Kämpfen und düsterer religiöser Lore.",
        "ja": "過酷な呪いに苛まれた悪夢の世界で、悔悛者として過激な戦闘に身を投じるアクションRPG。",
        "pt-BR": "Encarne o Penitente em um mundo de pesadelo assolado por uma terrível maldição religiosa."
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/387290/ss_304ededbbfd607cb37e708cd83e7160c7d840863.1920x1080.jpg?t=1701967651",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/387290/ss_68ae1c1b4ff550c6e436e0b45419a03ee9581386.1920x1080.jpg?t=1701967651",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/387290/ss_c1a7eb159190ffc77af529ea99ae81365c354312.1920x1080.jpg?t=1701967651",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/387290/ss_2916ec51b4970fc661cd820e42a7057d595a2c68.1920x1080.jpg?t=1701967651",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/387290/ss_38320eca2cbcae2ade9c18ba56aa9b4ecc2cae50.1920x1080.jpg?t=1701967651",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/387290/ss_56f57022e1e0e8666a9fd141fe0933c1e8b36137.1920x1080.jpg?t=1701967651"
    ],
    "hints": {
      "tagline": {
        "fr": "Voyagez à travers la forêt en déclin de Nibel dans cette fable visuellement éblouissante et émouvante.",
        "en": "Embark on an emotional journey through the dying forest of Nibel to save an orphaned spirit's home.",
        "es": "Embárcate en un emotivo viaje a través del bosque agonizante de Nibel para salvar tu hogar.",
        "de": "Begib dich auf eine emotionale Reise durch den sterbenden Wald von Nibel in diesem visuellen Meisterwerk.",
        "ja": "枯れゆくニベルの森を救うため、小さな精霊オリが壮大な旅に出る感動の美麗アクション。",
        "pt-BR": "Embarque em uma jornada emocionante pela floresta decadente de Nibel nesta fábula visual deslumbrante."
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
      "fr": "3D Rétro Low-poly",
      "en": "Retro Low-poly 3D"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
      "en": "2D Top-down"
    },
    "developer": "rose-engine",
    "steamUrl": "https://store.steampowered.com/app/1262350/SIGNALIS/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1262350/ss_a2603694154878b8260c1dd498a06168cad012a4.1920x1080.jpg?t=1773697315",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1262350/ss_9d602346170b19121e4baec94f5fab54cc43637c.1920x1080.jpg?t=1773697315",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1262350/ss_dc87789ecfa2f83dd58ac778866fbf7fdc1ec99a.1920x1080.jpg?t=1773697315",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1262350/ss_bb676746c44db01c2bd7ca78616032984f958106.1920x1080.jpg?t=1773697315",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1262350/ss_4ec0c13288054a99bc3987680a914ccda834e7f6.1920x1080.jpg?t=1773697315",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1262350/ss_f7eb1a1944c4c9d3142bedb800ad3a43a6f82a60.1920x1080.jpg?t=1773697315"
    ],
    "hints": {
      "tagline": {
        "fr": "Un survival horror rétro dystopique et mélancolique aux inspirations d'anime classique et d'horreur cosmique.",
        "en": "A classic survival horror experience set in a dystopian future where humanity uncovered a dark secret.",
        "es": "Una experiencia clásica de terror de supervivencia ambientada en un futuro distópico y melancólico.",
        "de": "Klassischer Survival-Horror in einer dystopischen Zukunft voller melancholischer Geheimnisse.",
        "ja": "レトロクラシックな恐怖と宇宙的狂気が交錯する、ディストピアSFサバイバルホラー。",
        "pt-BR": "Um clássico survival horror retrô distópico e melancólico inspirado em ficção científica sombria."
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1868140/ss_7c86a17d545b6260ecdcfdd62622e49dcc9011bd.1920x1080.jpg?t=1789456375",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1868140/ss_783e1f6c2d4c358fb494d055c47c0e888922abd5.1920x1080.jpg?t=1789456375",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1868140/ss_6eac5a3b59e181d1ffa26757b041be521bfe1779.1920x1080.jpg?t=1789456375",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1868140/ss_bc9150385c6fcd41ac7195be36597469f54a792c.1920x1080.jpg?t=1789456375",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1868140/ss_3a459e9ea8b54c3864379fcad38bff3ae7fe4e8c.1920x1080.jpg?t=1789456375",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1868140/ss_92a713e2f0ce374a446367c57f962ef942b2c173.1920x1080.jpg?t=1789456375"
    ],
    "hints": {
      "tagline": {
        "fr": "Pêchez le jour dans le mystérieux Trou Bleu et tenez un restaurant de sushi florissant la nuit.",
        "en": "Explore the depths of the mysterious Blue Hole by day and run a successful sushi restaurant by night.",
        "es": "Explora las profundidades del misterioso Agujero Azul de día y gestiona un restaurante de sushi de noche.",
        "de": "Erkunde tagsüber das geheimnisvolle Blue Hole und leite nachts ein florierendes Sushi-Restaurant.",
        "ja": "昼は神秘的なブルーホールを探検して魚を獲り、夜は繁盛寿司屋を経営する海洋アドベンチャー。",
        "pt-BR": "Explore as profundezas do misterioso Buraco Azul de dia e administre um restaurante de sushi à noite."
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1809540/ss_514e766f27fcfccf375c85a842099d53e9542258.1920x1080.jpg?t=1782464830",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1809540/ss_a48f85ae073148d13332b1a7741a764a046f83be.1920x1080.jpg?t=1782464830",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1809540/ss_75017574e6cac5233b32492509fe47825dc530bf.1920x1080.jpg?t=1782464830",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1809540/ss_bf5096e3682d7d2fb1d3fa7cccb5398fb934144a.1920x1080.jpg?t=1782464830",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1809540/ss_4be552cc9f6b03f0918e55b17145d3f5cbd36065.1920x1080.jpg?t=1782464830",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1809540/ss_628bc8052f48cd68ae42e4b54c3a9af97f560c06.1920x1080.jpg?t=1782464830"
    ],
    "hints": {
      "tagline": {
        "fr": "Un metroidvania 2D dessiné à la main aux combats viscéraux centrés sur les parades et inspiré du taoïsme.",
        "en": "A lore-rich, hand-drawn 2D action-platformer featuring Sekiro-inspired deflection-focused combat.",
        "es": "Un metroidvania en 2D dibujado a mano con intensos combates centrados en el desvío y folclore taoísta.",
        "de": "Ein handgezeichnetes 2D-Action-Metroidvania mit intensiven, parierfokussierten Kämpfen.",
        "ja": "道教とサイバーパンクが融合した「タオパンク」世界で、弾きを駆使して戦う高難度2Dアクション。",
        "pt-BR": "Um metroidvania 2D desenhado à mão com combate visceral focado em aparadas e mitologia taoista."
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
      "fr": "3D Rétro Low-poly",
      "en": "Retro Low-poly 3D"
    },
    "camera": {
      "fr": "Troisième personne",
      "en": "Third-Person"
    },
    "developer": "SFB Games",
    "steamUrl": "https://store.steampowered.com/app/1996010/Crow_Country/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1996010/ss_70a23ec71b5d6775264d14c0560fd59b05d073e4.1920x1080.jpg?t=1784319079",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1996010/ss_2ea75bced43507f9f35c833ed308fbd51cb426fb.1920x1080.jpg?t=1784319079",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1996010/ss_68a24dd60730d5112cd7a7f1c68b77ed464d7729.1920x1080.jpg?t=1784319079",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1996010/ss_64602ca091b765de074fc5106db2daca034a1d00.1920x1080.jpg?t=1784319079",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1996010/ss_1c6d4ffb6329a19701038fa87706c7266e7d3cfa.1920x1080.jpg?t=1784319079",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1996010/ss_b7c8066257201011d2e283c8796d386436007e3b.1920x1080.jpg?t=1784319079"
    ],
    "hints": {
      "tagline": {
        "fr": "Enquêtez dans un parc d'attractions abandonné et sinistre dans cet hommage vibrant aux survival horror PS1.",
        "en": "Investigate an abandoned amusement park in this PS1-inspired survival horror mystery.",
        "es": "Investiga un misterioso parque de atracciones abandonado en este survival horror inspirado en PS1.",
        "de": "Untersuche einen verlassenen Vergnügungspark in diesem atmosphärischen PS1-Survival-Horror.",
        "ja": "閉園した不気味なテーマパークを探索し、闇の真相を追う初代PS風サバイバルホラー。",
        "pt-BR": "Investigue um parque de diversões abandonado neste mistério nostálgico inspirado no terror da era PS1."
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2231450/ss_3e70c43ffd6f492f6e4dce7965499d41fad47052.1920x1080.jpg?t=1732516978",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2231450/ss_e165922b81019058ca5b3b61b9e1d7141731a59c.1920x1080.jpg?t=1732516978",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2231450/ss_67981a8a9103f19f661ad983481e9f7a55f52302.1920x1080.jpg?t=1732516978",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2231450/ss_809837af19c71d183c4f67f08916cacf10f384e7.1920x1080.jpg?t=1732516978",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2231450/ss_b1a38d0541d2428c9864e30071625cb5472c32da.1920x1080.jpg?t=1732516978",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2231450/ss_367286326c9a6ba91d4b2f08d0ca5fd1a47f2455.1920x1080.jpg?t=1732516978"
    ],
    "hints": {
      "tagline": {
        "fr": "Foncez à toute allure, détruisez les décors et sauvez votre pizzeria dans ce platformer frénétique inspiré de Wario Land.",
        "en": "A fast-paced 2D platformer inspired by the Wario Land series, with an emphasis on movement and destruction.",
        "es": "Un frenético juego de plataformas en 2D inspirado en Wario Land, enfocado en velocidad y destrucción.",
        "de": "Ein rasanter 2D-Plattformer im Geiste von Wario Land mit Fokus auf Tempo, Zerstörung und Highscores.",
        "ja": "ワリオランドの系譜を継ぐ、ハイスピードで爽快な破壊アクションが炸裂する2Dプラットフォーマー。",
        "pt-BR": "Corra em alta velocidade, destrua tudo pelo caminho e salve sua pizzaria neste frenético jogo de plataforma."
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1458140/ss_a753a13813556eb20e02763e82877485dac848ab.1920x1080.jpg?t=1788198836",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1458140/ss_7dfb1b9087a859b49debadb941269f971b212277.1920x1080.jpg?t=1788198836",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1458140/ss_930c6e45bb3ea4510af967f94650007ea9b73383.1920x1080.jpg?t=1788198836",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1458140/ss_d3a7abac1b8cc4a09aff0ff023998c6aa0404c3c.1920x1080.jpg?t=1788198836",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1458140/ss_95e6fcee0a43efdc430e01c9660b3ab2b61658bc.1920x1080.jpg?t=1788198836",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1458140/ss_1b7b6b59d66bc85538302850b873eb2797f33205.1920x1080.jpg?t=1788198836"
    ],
    "hints": {
      "tagline": {
        "fr": "Affrontez les anomalies surnaturelles d'une zone d'exclusion hostile avec pour seul refuge votre break aménagé.",
        "en": "Face the supernatural dangers of the Olympic Exclusion Zone with your car as your only lifeline.",
        "es": "Enfrenta los peligros sobrenaturales de una zona de exclusión con tu coche como único salvavidas.",
        "de": "Stelle dich den übernatürlichen Gefahren der Olympic Exclusion Zone mit deinem Kombi als Rettungsanker.",
        "ja": "異常現象が蔓延る隔離ゾーンを、唯一の相棒であるステーションワゴンとともに生き延びろ。",
        "pt-BR": "Enfrente os perigos sobrenaturais de uma zona de exclusão com sua perua velha como único refúgio."
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/460950/ss_c269a57182b021d2aac2bb8d42421d0ef301360d.1920x1080.jpg?t=1761066027",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/460950/ss_d4f8ef350ac44c096f8137208c381cac31e68242.1920x1080.jpg?t=1761066027",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/460950/ss_fce2aae6d24fbca70a8196e04f66c51d49a353b0.1920x1080.jpg?t=1761066027",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/460950/ss_9c5b43f5a2ab00b35857b8ccb0c4a24a9755091f.1920x1080.jpg?t=1761066027",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/460950/ss_88140bc0e7d761fc4f998aa6c0850aad4d53cd3b.1920x1080.jpg?t=1761066027",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/460950/ss_0c7402fc60b0863fa2b9187a4db5aba86d3f7eaa.1920x1080.jpg?t=1761066027"
    ],
    "hints": {
      "tagline": {
        "fr": "Tranchez vos ennemis avec une précision chirurgicale et manipulez le temps dans ce néo-noir ultra-stylisé.",
        "en": "A stylish neo-noir, action-packed slash-'em-up with blindingly fast combat and instant-death mechanics.",
        "es": "Un elegante juego de acción neo-noir con combates fulgurantes y mecánicas de muerte instantánea.",
        "de": "Ein stylisches Neo-Noir-Actionspiel mit rasantem Zeitlupenkampf und One-Hit-Kills.",
        "ja": "スタイリッシュなネオ・ノワールの街を駆け、時間を操りながら敵を瞬殺する電光石火のアクション。",
        "pt-BR": "Desfira golpes cirúrgicos e manipule o tempo neste estiloso jogo de ação neo-noir com morte instantânea."
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
      "Rétro",
      "Twin-stick",
      "Cyberpunk"
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/219150/ss_263387d83df0626c58a484baa8f78f9394074b76.1920x1080.jpg?t=1785434922",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/219150/ss_bdf28f59652e53e725d96d94cdc8db97fc277cf2.1920x1080.jpg?t=1785434922",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/219150/ss_a868b45895c06a2e45a6f6a8646c4574b0157525.1920x1080.jpg?t=1785434922",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/219150/ss_a2aa276b25345368d00338cfe54ebbcfa0c60168.1920x1080.jpg?t=1785434922",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/219150/ss_75386edf15a48d844dc28ffdc61eb5c458d68533.1920x1080.jpg?t=1785434922"
    ],
    "hints": {
      "tagline": {
        "fr": "Un jeu d'action ultra-violent en vue du dessus baigné de néons rétro et d'une bande-son synthwave culte.",
        "en": "A high-octane action game overflowing with raw brutality, hard-boiled gunplay and neon 80s aesthetics.",
        "es": "Un juego de acción frenético lleno de brutalidad, tiroteos salvajes y estética de neón ochentera.",
        "de": "Ein adrenalingeladenes Actionspiel voller schonungsloser Härte und pulsierender 80er-Neon-Ästhetik.",
        "ja": "容赦なき暴力と熱狂的なシンセウェーブサントラが交錯する、80年代ネオンの見下ろし型アクション。",
        "pt-BR": "Um jogo de ação frenético e violento com tiroteios implacáveis e estética retrô banhada a néon."
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1562430/ss_70f88014423ed93eaa111c0d0daca2c500f76908.1920x1080.jpg?t=1780479732",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1562430/ss_d4d4b14c5cd071307e27b4e9737f23f28b096248.1920x1080.jpg?t=1780479732",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1562430/ss_9529104cde1af2ffbb715cab42bbb3012fb9b7d8.1920x1080.jpg?t=1780479732",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1562430/ss_b60f2ff50997c5da29fcd783770053263aac26c0.1920x1080.jpg?t=1780479732",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1562430/ss_e964290b6a6a6941e299ba5be00fd3d98aec6d06.1920x1080.jpg?t=1780479732",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1562430/ss_87d0d9ba6e7851a07778ac696d56af8e0ab71a21.1920x1080.jpg?t=1780479732"
    ],
    "hints": {
      "tagline": {
        "fr": "Pêchez des créatures étranges et percez les sombres secrets d'un archipel hanté par l'horreur cosmique.",
        "en": "Captain your fishing trawler to explore a collection of remote isles and their surrounding depths for dark secrets.",
        "es": "Capitanea tu barco de pesca para explorar islas remotas y desenterrar los oscuros secretos de las profundidades.",
        "de": "Steuere deinen Trawler, erkunde entlegene Inseln und lüfte die finsteren Geheimnisse der Tiefsee.",
        "ja": "不気味な海をトロール船で進み、奇妙な魚を釣り上げながら深海の恐るべき秘密に迫るフィッシングホラー。",
        "pt-BR": "Comande seu barco de pesca e desvende os mistérios aterrorizantes de um arquipélago amaldiçoado."
      },
      "composer": "David Webster"
    }
  },
  {
    "id": "chants-of-sennaar",
    "title": "Chants of Sennaar",
    "releaseYear": 2023,
    "genre": [
      "Point & Click",
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1931770/ss_0461966d2cf288b631165c5e1e00399483bb52c7.1920x1080.jpg?t=1774006124",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1931770/ss_0c7b55a542bab74ccb3bbab18346c0f68296ebf4.1920x1080.jpg?t=1774006124",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1931770/ss_adcaa7de0b90bc02a927ec7119f889a0834e8484.1920x1080.jpg?t=1774006124",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1931770/ss_d194cfba045634d86c99aec5ed7ecbf7270cb8a2.1920x1080.jpg?t=1774006124",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1931770/ss_8315f825c350f04faba1cba86835d8fbb445191d.1920x1080.jpg?t=1774006124",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1931770/ss_d3bbb61945d1fdbb2cc54bd09e80d691bd0c8afc.1920x1080.jpg?t=1774006124"
    ],
    "hints": {
      "tagline": {
        "fr": "Déchiffrez des langues anciennes et réunifiez les peuples d'une immense Tour inspirée du mythe de Babel.",
        "en": "Restore the connections between the Peoples of the Tower by deciphering ancient glyphs and languages.",
        "es": "Restaura la conexión entre los Pueblos de la Torre descifrando lenguajes y glifos antiguos.",
        "de": "Verbinde die Völker des Turms wieder miteinander, indem du uralte Glyphen und Sprachen entschlüsselst.",
        "ja": "古代のグリフや言語を解読し、バベルの塔に分断された諸民族の絆を取り戻すパズルアドベンチャー。",
        "pt-BR": "Decifre línguas antigas e restaure a união entre os povos de uma colossal torre inspirada no mito de Babel."
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
    "itchUrl": "https://adamgryu.itch.io/a-short-hike",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1055540/ss_f2123fea859e299736a3e99d130238c784d53e75.1920x1080.jpg?t=1777758958",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1055540/ss_0e864bf975bb71f238de6861fc8fd3d6ed6e4ce8.1920x1080.jpg?t=1777758958",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1055540/ss_a22817e259c4220cad0c25db315f417b6d3641b8.1920x1080.jpg?t=1777758958",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1055540/ss_c9c8a8e6062511c5ae9259c68c66754cd09ae971.1920x1080.jpg?t=1777758958",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1055540/ss_4c7c9650606ac7b451f8d2e5b71b503649e43edc.1920x1080.jpg?t=1777758958",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1055540/ss_783252636e3a44ff5ba636d817c462358933ba89.1920x1080.jpg?t=1777758958"
    ],
    "hints": {
      "tagline": {
        "fr": "Grimpez, planez et explorez les paysages paisibles du parc provincial de Hawk Peak à votre propre rythme.",
        "en": "Hike, climb, and soar through the peaceful mountainside landscapes of Provincial Park.",
        "es": "Camina, escala y planea por los tranquilos paisajes montañosos del Parque Provincial.",
        "de": "Wandere, klettere und gleite in deinem eigenen Tempo durch die friedvollen Landschaften des Hawk Peak.",
        "ja": "ホークピークの穏やかな大自然を散策し、滑空しながら自分のペースで山頂を目指す癒しのアドベンチャー。",
        "pt-BR": "Caminhe, escale e plane pelas paisagens serenas do Parque Provincial no seu próprio ritmo."
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/224760/ss_f9ecd9ef063e380c38350bf97a234ac8fb20e738.1920x1080.jpg?t=1572375251",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/224760/ss_38a73fa1ebe9fcf4f7c8ee3b80e5de067a6e8897.1920x1080.jpg?t=1572375251",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/224760/ss_a187b036f7bf387b9d2137403d915320bef7c55b.1920x1080.jpg?t=1572375251",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/224760/ss_b6f3865dd7d626e8b6ec5c2df3c7c5f1fc8ce12f.1920x1080.jpg?t=1572375251",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/224760/ss_9636de102a517bc272e66acc525179cd34be9a1b.1920x1080.jpg?t=1572375251",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/224760/ss_c433accea78008474b03f027bc4aacec765f968f.1920x1080.jpg?t=1572375251"
    ],
    "hints": {
      "tagline": {
        "fr": "Percevez une dimension cachée et manipulez la perspective 3D dans un monde en pixel art enchanteur.",
        "en": "Explore an expansive world in this puzzle platformer by shifting perspectives between 2D and 3D.",
        "es": "Explora un mundo asombroso en este juego de plataformas cambiando la perspectiva entre 2D y 3D.",
        "de": "Erkunde eine faszinierende Welt in diesem Rätsel-Plattformer, indem du die Perspektive von 2D zu 3D drehst.",
        "ja": "2Dの世界を回転させて3次元の奥行きを発見し、隠された秘密を解き明かす名作パズルアクション。",
        "pt-BR": "Descubra uma dimensão oculta e manipule a perspectiva 3D em um mundo mágico em pixel art."
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/683320/ss_4fa618f5a2141d48a05716d43598a260235b0aaa.1920x1080.jpg?t=1759429603",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/683320/ss_a155ad5423e11e3e764a1a270dcf4f30323f0a35.1920x1080.jpg?t=1759429603",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/683320/ss_62883bfa8a341db3f9c5c03768f5c14f938fe8fc.1920x1080.jpg?t=1759429603",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/683320/ss_9c717701f0a67af52d227f69001e1415c932ae60.1920x1080.jpg?t=1759429603",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/683320/ss_5d1782d0ec36f4ca8b5ffc96a3cc5e255f5ac502.1920x1080.jpg?t=1759429603",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/683320/ss_973175ba1865c5716c5f37588d00ac135b7d34ba.1920x1080.jpg?t=1759429603"
    ],
    "hints": {
      "tagline": {
        "fr": "Traversez un voyage poétique et aquarellé sur le deuil et la guérison, sans mort ni violence.",
        "en": "A serene and evocative experience, free of danger, frustration or death, painted in delicate watercolor.",
        "es": "Una experiencia serena y evocadora, libre de peligros o frustración, pintada en delicadas acuarelas.",
        "de": "Eine poetische, feinfühlige Reise über Trauer und Hoffnung, kunstvoll gemalt in zarten Aquarelltönen.",
        "ja": "喪失と再生の旅を水彩画のような息をのむ映像美と音楽で描く、静謐で詩的なプラットフォーマー。",
        "pt-BR": "Vivencie uma jornada poética em aquarela sobre o luto e a superação, sem perigo ou frustração."
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/262060/ss_04572edc979601b038756f87861c6f8c6c337806.1920x1080.jpg?t=1789168187",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/262060/ss_799c78932c87f2be0cbd45dd1b80ebd0a355e575.1920x1080.jpg?t=1789168187",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/262060/ss_a967c2d7344433cdf72a53ef1922586b0d7cce69.1920x1080.jpg?t=1789168187",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/262060/ss_c9d41e74d574f6fa9bf53c0cf74f8430c2072cc2.1920x1080.jpg?t=1789168187",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/262060/ss_b78c562dc67379f42691dcc8522b40d5385bb32e.1920x1080.jpg?t=1789168187",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/262060/ss_ac1f594bf8128e376ca95ff266d400d404b639bf.1920x1080.jpg?t=1789168187"
    ],
    "hints": {
      "tagline": {
        "fr": "Gérez le stress psychologique et la déchéance de vos héros dans ce RPG tactique impitoyable.",
        "en": "Recruit, train, and lead a team of flawed heroes against unimaginable horrors and psychological stress.",
        "es": "Recluta, entrena y lidera a héroes imperfectos frente a horrores inimaginables y el estrés psicológico.",
        "de": "Führe fehlerhafte Helden gegen unvorstellbare Schrecken und das zermürbende Gewicht des Stresses.",
        "ja": "不完全な英雄たちを率い、狂気とストレスの重圧に耐えながら挑む、容赦なきダークファンタジーRPG。",
        "pt-BR": "Gerencie o estresse e a sanidade de heróis falhos neste impiedoso RPG tático por turnos."
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623940/ss_5f7e80cd42199d60c1b1fdb3d67a39a1e76d5b4c.1920x1080.jpg?t=1787164429",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623940/ss_b22e285d4e478ed12633610b8e9caeb28c8d1a07.1920x1080.jpg?t=1787164429",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623940/ss_b8b6546a5038ce007f0e8400ce6a49469cf898c0.1920x1080.jpg?t=1787164429",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623940/ss_bed248c06cbd7800a83136884f2263a11c4af89e.1920x1080.jpg?t=1787164429",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623940/ss_669e1c472823c64995e0ae7318453d579f507a88.1920x1080.jpg?t=1787164429",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623940/ss_cbd57d7325ad610b1b2f6ca3ef903b5e02144f2a.1920x1080.jpg?t=1787164429"
    ],
    "hints": {
      "tagline": {
        "fr": "Affrontez les créatures terrifiantes du folklore nordique pour sauver votre sœur d'un sort funeste.",
        "en": "A grim adventure set in a world inspired by dark, Nordic fables. Rescue your kidnapped sister.",
        "es": "Una sombría aventura inspirada en las fábulas nórdicas. Rescata a tu hermana secuestrada.",
        "de": "Ein düsteres Abenteuer in der unheimlichen Welt nordischer Fabeln auf der Suche nach deiner Schwester.",
        "ja": "北欧神話の不気味な伝承の世界で、連れ去られた姉を救うために巨大な怪異に立ち向かうダークホラーアドベンチャー。",
        "pt-BR": "Enfrente criaturas aterrorizantes do folclore nórdico para salvar sua irmã sequestrada."
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/332200/ss_978607583bf147d520f488bb9acdb1c00ea3349b.1920x1080.jpg?t=1645563574",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/332200/ss_6fa9f9993bd867660e70f42f4e37f66c1359feb1.1920x1080.jpg?t=1645563574",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/332200/ss_8c53e6096552ecc60f875f6d4bdf3d60215f8ad5.1920x1080.jpg?t=1645563574",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/332200/ss_1f481f0be3273cc9dca73a054e4745740cefda59.1920x1080.jpg?t=1645563574",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/332200/ss_4aaaa46e1448faa76504c80bc2622fa57dc0aaff.1920x1080.jpg?t=1645563574",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/332200/ss_967afb29b7e117b08b931c850251daba3da86df9.1920x1080.jpg?t=1645563574"
    ],
    "hints": {
      "tagline": {
        "fr": "Explorez un monde biomécanique extraterrestre et glitché dans ce metroidvania de science-fiction rétro.",
        "en": "Explore and discover a sprawling alien world, glitching reality in this retro sci-fi metroidvania.",
        "es": "Explora y descubre un extenso mundo alienígena, alterando la realidad en este metroidvania de ciencia ficción.",
        "de": "Erkunde eine riesige außerirdische Welt und manipuliere die Realität in diesem Sci-Fi-Metroidvania.",
        "ja": "現実をグリッチさせながら異形のバイオメカニカル世界を探索する、重厚なSFメトロイドヴァニア。",
        "pt-BR": "Explore um vasto mundo alienígena biomecânico e altere a realidade neste metroidvania retrô de ficção científica."
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
        "fr": "Fuyez les monstres de votre sous-sol avec vos larmes pour seules armes dans ce roguelike mythique.",
        "en": "A randomly generated action RPG shooter with heavy roguelike elements, fighting bizarre monsters with tears.",
        "es": "Un shooter roguelike generado proceduralmente donde luchas contra monstruos grotescos usando tus lágrimas.",
        "de": "Ein legendärer Roguelike-Shooter, in dem du mit deinen Tränen gegen bizarre Albträume kämpfst.",
        "ja": "自らの涙を武器にグロテスクな地下室の怪物たちと戦う、無限のリプレイ性を誇る伝説のローグライク。",
        "pt-BR": "Fuja dos pesadelos do porão usando suas próprias lágrimas como arma neste lendário roguelike."
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
        "fr": "Creusez, bâtissez, combattez et explorez un monde bac à sable infini en pixel art regorgeant de boss et trésors.",
        "en": "Dig, fight, explore, build! Nothing is impossible in this action-packed sandbox adventure.",
        "es": "¡Cava, lucha, explora, construye! Nada es imposible en esta aventura sandbox llena de acción.",
        "de": "Grabe, kämpfe, erkunde, baue! In diesem actiongeladenen 2D-Sandbox-Abenteuer ist alles möglich.",
        "ja": "掘って、戦って、建てて、探検しよう！ 無限の可能性が広がる大人気2Dサンドボックスアドベンチャー。",
        "pt-BR": "Escriave, lute, construa e explore um mundo infinito em pixel art repleto de chefes e tesouros."
      },
      "composer": "Scott Lloyd Shelly"
    }
  },
  {
    "id": "vampire-survivors",
    "title": "Vampire Survivors",
    "releaseYear": 2022,
    "genre": [
      "Auto-Shooter",
      "Roguelite",
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
    "itchUrl": "https://poncle.itch.io/vampire-survivors",
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
        "fr": "Survivez à des hordes infinies de monstres et créez des synergies dévastatrices dans ce phénomène rogue-lite.",
        "en": "Mow down thousands of night creatures and survive until dawn in this gothic horror casual rogue-lite.",
        "es": "Aniquila miles de criaturas nocturnas y sobrevive hasta el amanecer en este adictivo rogue-lite.",
        "de": "Mähe Tausende von Nachtkreaturen nieder und überlebe bis zur Morgendämmerung in diesem Rogue-lite-Phänomen.",
        "ja": "何千もの夜の魔物たちをなぎ倒し、夜明けまで生き残る中毒性抜群のゴシックホラー・ローグライト。",
        "pt-BR": "Sobreviva a ondas infinitas de monstros e crie sinergias devastadoras neste viciante fenômeno rogue-lite."
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
        "fr": "Fondez votre propre culte d'adorateurs dévoués et purgez les hérétiques au nom du tout-puissant Agneau.",
        "en": "Start your own cult in a land of false prophets, venturing out into diverse and mysterious regions.",
        "es": "Funda tu propia secta en una tierra de falsos profetas y purga a los infieles en nombre del Cordero.",
        "de": "Gründe deinen eigenen Kult in einem Land falscher Propheten und führe deine Anhänger zur Erleuchtung.",
        "ja": "熱心な信者を集めて教団を拡大し、偽りの預言者たちを討伐するキュートでダークな教団運営アクションRPG。",
        "pt-BR": "Funde seu próprio culto em uma terra de falsos profetas e expurgue os infiéis em nome do Cordeiro."
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
        "fr": "Brandissez votre pelle justicière et défiez l'Ordre des Sans-Merci dans cet hommage légendaire aux jeux 8-bit.",
        "en": "A sweeping classic action-adventure game with awesome gameplay, memorable characters, and an 8-bit retro aesthetic.",
        "es": "Un clásico juego de acción y aventura con una jugabilidad legendaria y estética retro de 8 bits.",
        "de": "Ein gefeiertes Action-Adventure mit grandiosem 8-Bit-Charme, erinnerungswürdigen Helden und packendem Gameplay.",
        "ja": "愛用のショベルを手に正義のために戦う、8ビット愛に満ちた傑作レトロアクションアドベンチャー。",
        "pt-BR": "Empunhe sua pá justiceira e desafie a Ordem Impiedosa nesta aclamada obra-prima com estética 8-bit."
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
        "fr": "Fuyez dans l'obscurité d'un complexe industriel dystopique au cœur d'un projet secret effroyable.",
        "en": "Hunted and alone, a boy finds himself drawn into the center of a dark, dystopian project.",
        "es": "Perseguido y solo, un niño se encuentra en el centro de un oscuro proyecto distópico.",
        "de": "Gejagt und allein gerät ein Junge ins Zentrum eines verstörenden dystopischen Experiments.",
        "ja": "追われ、独りきりの少年が不気味なディストピア施設の中枢へと引き込まれていく傑作サスペンス。",
        "pt-BR": "Perseguido e solitário, um garoto é atraído para o centro de um tenebroso projeto distópico."
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
        "fr": "Traversez un purgatoire d'ombres et de brume à la recherche éperdue de votre sœur disparue.",
        "en": "Uncertain of his sister's fate, a boy enters LIMBO in this monochrome atmospheric masterpiece.",
        "es": "Inseguro sobre el destino de su hermana, un niño se adentra en LIMBO en este clásico atmosférico.",
        "de": "Ungewiss über das Schicksal seiner Schwester betritt ein Junge das bedrückende Schattenreich von LIMBO.",
        "ja": "失われた姉の行方を追い、少年は影と静寂に包まれた危険なリンボの世界へと足を踏み入れる。",
        "pt-BR": "Inseguro sobre o destino de sua irmã, um garoto adentra o assombroso mundo em sombras de LIMBO."
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
        "fr": "Portez des mondes entiers sur votre dos et plongez dans leurs dimensions imbriquées pour résoudre des énigmes cosmiques.",
        "en": "From the lead gameplay designer of LIMBO and INSIDE, COCOON takes you on an adventure across worlds within worlds.",
        "es": "Lleva mundos dentro de otros mundos en tu espalda en esta aventura de puzles cósmica única.",
        "de": "Trage ganze Welten auf deinem Rücken und tauche ein in ein kosmisches Rätselabenteuer der Meisterklasse.",
        "ja": "オーブに宿る世界そのものを背負い、世界と世界を行き来して謎を解き明かす新感覚パズルアドベンチャー。",
        "pt-BR": "Carregue mundos inteiros nas costas e salte entre dimensões interligadas neste inovador enigma cósmico."
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
        "fr": "Reconstituez les derniers instants des 60 marins disparus à l'aide d'une mystérieuse montre de poche temporelle.",
        "en": "An insurance mystery with minimal color and maximum deduction aboard a ghost ship.",
        "es": "Un misterio de seguros con deducción lógica implacable a bordo de un barco fantasma.",
        "de": "Ein meisterhaftes Deduktionsrätsel auf einem Geisterschiff mit einer magischen Taschenuhr.",
        "ja": "不思議な懐中時計で過去の最期の瞬間を再生し、幽霊船の乗員60名の運命を推理する傑作ミステリー。",
        "pt-BR": "Reconstitua os momentos finais dos 60 tripulantes desaparecidos a bordo de um navio fantasma."
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
      "fr": "3D Rétro Low-poly",
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
        "fr": "Faites couler le sang pour vous soigner dans ce Fast-FPS brutal et survitaminé au cœur des Neuf Cercles de l'Enfer.",
        "en": "A fast-paced ultraviolent retro FPS where blood is fuel and hell is full.",
        "es": "Un FPS retro ultraviolento y frenético donde la sangre es combustible y el infierno está lleno.",
        "de": "Ein rasanter, brutaler Retro-FPS, in dem Blut dein Treibstoff ist und die Hölle überquillt.",
        "ja": "血こそが生命の燃料。地獄の深淵をハイスピードで殲滅し尽くす超暴力レトロFPS。",
        "pt-BR": "Derramar sangue é sua única cura neste frenético e brutal FPS retrô pelas profundezas do inferno."
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
        "fr": "Tirez, esquivez et pillez pour atteindre l'arme ultime capable de tuer le passé dans ce bullet hell effréné.",
        "en": "A bullet hell dungeon crawler following a band of misfits seeking to shoot, loot, and dodge roll their way to absolve their past.",
        "es": "Un frenético dungeon crawler de bullet hell donde disparas y ruedas para alcanzar el arma que puede matar el pasado.",
        "de": "Ein rasanter Bullet-Hell-Dungeon-Crawler, in dem du schießt, ausweichst und die Vergangenheit bezwingst.",
        "ja": "銃弾が飛び交うガンジョンをドッジロールで潜り抜け、過去を抹消する伝説の銃を求める弾幕ローグライク。",
        "pt-BR": "Atire, role e saqueie para encontrar a arma suprema capaz de matar o passado neste alucinante bullet hell."
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
        "fr": "Échappez-vous d'une planète extraterrestre chaotique en terrassant des hordes d'ennemis aux côtés de vos amis.",
        "en": "Escape a chaotic alien planet by fighting through hordes of frenzied monsters with your friends.",
        "es": "Escapa de un planeta alienígena caótico luchando contra hordas de monstruos junto a tus amigos.",
        "de": "Kämpfe dich mit deinen Freunden durch Horden wilder Monster, um von einem feindlichen Planeten zu entkommen.",
        "ja": "仲間とともにモンスターの大群を殲滅し、過酷な異星からの脱出を目指す大乱闘3Dローグライク。",
        "pt-BR": "Escape de um planeta alienígena caótico combatendo hordas implacáveis de monstros com seus amigos."
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
        "fr": "Parcourez une terre magnifique mais dévastée en quête d'un remède à votre maladie mortelle.",
        "en": "Echoes of a dark and violent past resonate throughout a savage land, steeped in treasure and blood.",
        "es": "Los ecos de un pasado oscuro y violento resuenan en una tierra salvaje llena de tesoros y sangre.",
        "de": "Erkunde ein wunderschönes, aber zerstörtes Land auf der Suche nach der Heilung einer tödlichen Krankheit.",
        "ja": "息を呑む美麗なドット絵で描かれた荒廃の大地を駆け、不治の病の治療法を求めて戦うスラッシュアクション。",
        "pt-BR": "Viaje por uma terra deslumbrante e devastada em busca de uma cura para sua doença mortal."
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
        "fr": "Frayez-vous un chemin à travers des grottes lunaires impitoyables et dynamiques dans ce roguelike culte.",
        "en": "Join Ana and her friends on the Moon as you delve deep into challenging, ever-shifting caves.",
        "es": "Únete a Ana y sus amigos en la Luna mientras exploras cuevas desafiantes en constante cambio.",
        "de": "Tauche ein in die tückischen, sich stetig wandelnden Höhlen des Mondes in diesem legendären Roguelike.",
        "ja": "月面の危険に満ちたランダム生成の洞窟を探索し、一瞬の油断も許されない伝説のローグライクアクション。",
        "pt-BR": "Explore cavernas lunares impiedosas e dinâmicas neste cultuado e desafiador roguelike de plataforma."
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
        "fr": "Incarnez un limace-chat vulnérable dans un écosystème prédateur impitoyable et pluvieux.",
        "en": "You are a nomadic slugcat, both predator and prey in a broken, relentless ecosystem.",
        "es": "Eres un gato-babosa nómada, a la vez depredador y presa en un ecosistema despiadado.",
        "de": "Du bist eine nomadische Schneckenkatze in einem faszinierenden, aber gnadenlosen Ökosystem.",
        "ja": "捕食者と被食者が交錯する過酷な生態系で、幼いスラッグキャットとして生き延びる終末サバイバル。",
        "pt-BR": "Encarne um gato-lesma vulnerável em um ecossistema hostil e implacável assolado por chuvas torrenciais."
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
        "fr": "Surveillez les forêts sauvages du Wyoming et tissez des liens intimes à travers la radio dans ce drame immersif.",
        "en": "A single-player first-person mystery set in the Wyoming wilderness, where your only connection is over a handheld radio.",
        "es": "Un misterio en primera persona en la naturaleza salvaje de Wyoming, donde tu único contacto es una radio.",
        "de": "Ein packendes First-Person-Geheimnis in der Wildnis von Wyoming, verbunden nur über ein Funkgerät.",
        "ja": "ワイオミングの大自然を監視しながら、無線越しに語り合う相手と心の絆を深めるサスペンスアドベンチャー。",
        "pt-BR": "Vigie as florestas do Wyoming e forje laços íntimos pelo rádio neste envolvente drama de mistério."
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
        "fr": "Découvrez les destins tragiques et poétiques de la famille Finch à travers leurs dernières heures.",
        "en": "A collection of strange tales about a family in Washington state as you explore the sprawling Finch house.",
        "es": "Una conmovedora colección de relatos sobre una familia maldita en el estado de Washington.",
        "de": "Erlebe die poetischen und tragischen Geschichten der Finch-Familie in ihrem verwinkelten Anwesen.",
        "ja": "巨大な邸宅を探索し、一族の奇妙で詩的な最期の瞬間を追体験する短編ストーリーの傑作。",
        "pt-BR": "Descubra as histórias trágicas e poéticas da família Finch explorando sua mansão misteriosa."
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
        "fr": "Bondissez sur les murs et esquivez les scies circulaires pour sauver votre petite amie dans ce platformer culte.",
        "en": "A tough-as-nails platformer where you play as an animated cube of meat trying to save his girlfriend.",
        "es": "Un juego de plataformas exigente donde eres un cubo de carne animado que intenta salvar a su novia.",
        "de": "Ein knallharter Plattformer, in dem du als Fleischklops deine Freundin vor fiesen Sägen rettest.",
        "ja": "さらわれた恋人を救うため、回転ノコギリが待ち受ける危険なステージを突破する超高難度アクション。",
        "pt-BR": "Pule paredes e desvie de serras mortais para salvar sua namorada neste lendário jogo de plataforma."
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
        "fr": "Reconstruisez un monde brisé guidé par une voix off envoûtante dans cet Action-RPG chaleureux.",
        "en": "An action role-playing experience that redefines storytelling in games, with a reactive narrator.",
        "es": "Un juego de rol y acción que redefine la narrativa con un narrador reactivo inolvidable.",
        "de": "Ein gefeiertes Action-RPG mit einem dynamischen Erzähler, der jeden deiner Schritte kommentiert.",
        "ja": "プレイヤーの行動に反応するナレーションとともに、崩壊した世界を修復していく名作アクションRPG。",
        "pt-BR": "Reconstrua um mundo despedaçado guiado por uma narração memorável neste aclamado RPG de ação."
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
        "fr": "Planifiez vos attaques avec précision au cœur d'une métropole futuriste rythmée par le jazz et l'électro.",
        "en": "A sci-fi themed action RPG that invites you to wield an extraordinary weapon of unknown origin.",
        "es": "Un RPG de acción de ciencia ficción donde empuñas un arma legendaria de origen desconocido.",
        "de": "Ein stilvolles Sci-Fi-Action-RPG, in dem du eine mächtige, sprechende Waffe führst und Angriffe planst.",
        "ja": "息を呑むサイバーパンク都市で、知性を持つ大剣とともに戦略的な戦闘を繰り広げるSFアクションRPG。",
        "pt-BR": "Planeje seus ataques em uma metrópole futurista com uma arma falante neste sofisticado RPG de ação."
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
        "fr": "Pilotez votre vaisseau à travers une galaxie hostile pour livrer un message crucial à la Fédération.",
        "en": "A spaceship simulation roguelike-like where you manage your crew and ship across a dangerous galaxy.",
        "es": "Un simulador espacial roguelike donde gestionas tripulación y naves en una galaxia peligrosa.",
        "de": "Steuere dein Raumschiff durch eine gnadenlose Galaxie, um eine lebenswichtige Botschaft zu überbringen.",
        "ja": "クルーと船のシステムを管理しながら、銀河の脅威を突破して連邦へ向かう宇宙戦略ローグライク。",
        "pt-BR": "Comande sua nave e tripulação através de uma galáxia perigosa para salvar a Federação."
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
        "fr": "Défendez les villes humaines contre les assauts de monstres géants à l'aide de mechs temporels.",
        "en": "Control powerful mechs from the future to defeat an alien threat in this turn-based strategy game.",
        "es": "Controla poderosos mechs del futuro para derrotar a monstruos gigantes en este juego de estrategia táctica.",
        "de": "Befehlige mächtige Mechs aus der Zukunft, um Städte vor riesigen Insektenmonstern zu schützen.",
        "ja": "未来から送り込まれた巨大人型兵器を指揮し、巨大昆虫の侵略から都市を守る完璧な戦術パズルRPG。",
        "pt-BR": "Controle mechs futuristas e defenda as cidades da Terra contra monstros colossais por turnos."
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
        "fr": "Naviguez entre deux mondes colorés et angoissants pour déterrer un secret refoulé et déchirant.",
        "en": "Explore a strange world full of colorful friends and foes to uncover a forgotten past in this psychological RPG.",
        "es": "Explora un mundo extraño lleno de amigos y enemigos para descubrir un pasado olvidado.",
        "de": "Reise zwischen einer bunten Fantasiewelt und düsteren Ängsten, um ein herzzerreißendes Geheimnis zu lüften.",
        "ja": "鮮やかな夢の世界と心の暗部を行き来しながら、忘れ去られた過去の真実に迫るサイコロジカルホラーRPG。",
        "pt-BR": "Navegue entre dois mundos contrastantes para desvendar um segredo doloroso neste RPG psicológico."
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
        "fr": "Une collection de 50 jeux rétro complets conçus par un studio fictif des années 1980.",
        "en": "A collection of 50 brand-new full games spanning various genres from the creators of Spelunky.",
        "es": "Una antología de 50 juegos completos de diversos géneros creados por un estudio ficticio de los 80.",
        "de": "Eine Sammlung von 50 vollständigen Retro-Spielen eines fiktiven 80er-Jahre-Entwicklerstudios.",
        "ja": "80年代の架空のゲーム会社が遺した、多彩なジャンルの完全新作レトロゲーム50本を収録した傑作集。",
        "pt-BR": "Uma coleção antológica de 50 jogos retrô completos criados por um estúdio fictício dos anos 80."
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
        "fr": "Résolvez des dizaines d'énigmes surréalistes dans un manoir baroque au cœur d'un polar halluciné.",
        "en": "A non-linear mystery adventure game full of riddles and surreal optical illusions.",
        "es": "Una aventura de misterio no lineal repleta de acertijos ingeniosos e ilusiones ópticas surrealistas.",
        "de": "Löse faszinierende surreale Rätsel in einem alten barocken Hotel voller optischer Täuschungen.",
        "ja": "奇妙な古城ホテルを舞台に、無数の暗号と視覚の錯覚を解き明かすシュルレアリスム推理パズル。",
        "pt-BR": "Resolva enigmas surreais em uma mansão barroca neste alucinante mistério de ilusões de ótica."
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
        "fr": "Foncez à travers une mégalopole cyberpunk suspendue grâce à un bras grappin dévastateur.",
        "en": "An exhilarating and stylish dystopian action-platformer featuring a chain-hook prosthetic arm.",
        "es": "Un trepidante juego de acción y plataformas distópico protagonizado por un brazo con gancho de cadena.",
        "de": "Rase mit deinem kybernetischen Kletterhaken-Arm durch eine atemberaubende Cyberpunk-Metropole.",
        "ja": "巨大なチェーンフック義手を駆使し、サイバーパンク都市の闇を暴く爽快ハイスピードアクション。",
        "pt-BR": "Atravesse uma megacidade cyberpunk em alta velocidade usando um braço mecânico com gancho."
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
      "fr": "3D Rétro Low-poly",
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
        "fr": "Pillez des complexes industriels désaffectés sur des lunes extraterrestres pour satisfaire la Compagnie.",
        "en": "A co-op horror scavenger game about scavenging at abandoned moons to sell scrap to the Company.",
        "es": "Un juego de terror cooperativo sobre explorar lunas abandonadas para vender chatarra a la Compañía.",
        "de": "Sammle mit deiner Crew Schrott auf feindseligen Monden, um die Quote der Company zu erfüllen.",
        "ja": "見捨てられた月面施設をチームで探索し、恐怖の怪異を避けながらスクラップを回収する協力サバイバル。",
        "pt-BR": "Vasculhe complexos industriais abandonados em luas alienígenas para cumprir a cota da Companhia."
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
        "fr": "Survivez à bord d'une station spatiale anarchique dans la peau d'une conscience synthétique en fuite.",
        "en": "Roleplaying in the ruins of interplanetary capitalism. Play as an escaped worker in a lawless space station.",
        "es": "Sobrevive como una conciencia sintética fugitiva a bordo de una estación espacial al margen de la ley.",
        "de": "Überlebe an Bord einer anarchischen Raumstation als geflohener synthetischer Arbeiter mit Würfelmechanik.",
        "ja": "法なき巨大宇宙ステーションを舞台に、サイコロを振って運命を切り拓くサイバーパンクRPG。",
        "pt-BR": "Sobreviva a bordo de uma estação espacial anárquica na pele de uma consciência sintética foragida."
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
        "fr": "Déplacez-vous et attaquez en rythme sur des dalles lumineuses dans ce dungeon crawler musical culte.",
        "en": "An award-winning hardcore roguelike rhythm game. Move to the music and deliver beatdowns!",
        "es": "Un premiado juego de ritmo y exploración de mazmorras. ¡Muévete al compás de la música!",
        "de": "Kämpfe dich im Rhythmus des Beats durch finstere Verliese in diesem genialen Musik-Dungeon-Crawler.",
        "ja": "ビートに合わせてステップを踏み、リズミカルにダンジョンを踏破する伝説のリズムローグライク。",
        "pt-BR": "Mova-se e ataque no compasso da música neste inovador dungeon crawler rítmico premiado."
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
        "fr": "Apprenez à chasser, cultiver et garder votre santé mentale dans une contrée sauvage et impitoyable.",
        "en": "An uncompromising wilderness survival game full of science and magic. Don't starve!",
        "es": "Un juego de supervivencia implacable lleno de ciencia y magia. ¡No te mueras de hambre!",
        "de": "Ein kompromissloses Wildnis-Survivalspiel voller Magie und Wissenschaft. Verhungere nicht!",
        "ja": "科学と魔法が息づく未開の荒野で、正気度と飢えを克服しながら生き延びるダークサバイバル。",
        "pt-BR": "Cace, cultive e preserve sua sanidade para sobreviver em uma selva hostil cheia de perigos."
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
        "fr": "Incarnez un chat errant perdu dans une cité cyberpunk peuplée de robots mélancoliques.",
        "en": "Lost, alone and separated from family, a stray cat must untangle an ancient mystery to escape a long-forgotten cybercity.",
        "es": "Perdido, solo y separado de su familia, un gato callejero debe desentrañar un misterio para escapar de una ciberciudad.",
        "de": "Verloren in einer von Robotern bewohnten Cyberstadt sucht eine streunende Katze ihren Weg nach Hause.",
        "ja": "人影のない退廃的なサイバーシティで、一匹の野良猫となって街の謎を解き明かし脱出を目指せ。",
        "pt-BR": "Encarne um gato de rua solitário tentando escapar de uma cidade futurista habitada por robôs."
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
        "fr": "Redonnez des couleurs à un monde devenu monochrome grâce à un pinceau magique débordant de vie.",
        "en": "A top-down adventure game in a coloring book world where you can draw on anything.",
        "es": "Una aventura en vista superior ambientada en un libro para colorear donde puedes pintar cualquier cosa.",
        "de": "Bringe mit einem magischen Pinsel Farbe zurück in eine verblasste Welt voller liebenswerter Charaktere.",
        "ja": "魔法の絵筆を手に、色彩を失った世界を自由に塗り絵しながら進む心温まる見下ろし型アドベンチャー。",
        "pt-BR": "Pinte e traga as cores de volta a um mundo monocromático com seu pincel mágico neste belo conto."
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
        "fr": "Vengez votre famille au prix de votre jeunesse grâce à des arts martiaux exigeants et authentiques.",
        "en": "Is one life enough to know Kung-Fu? Hunt down the assassins of your family in this intense beat 'em up.",
        "es": "¿Basta una vida para dominar el kung-fu? Caza a los asesinos de tu familia en intensos combates de artes marciales.",
        "de": "Reicht ein Leben, um Kung-Fu zu meistern? Räche deine Familie in knallharten, flüssigen Nahkämpfen.",
        "ja": "家族の復讐を果たすため、倒れるたびに年齢を重ねながらカンフーの奥義を極める本格格闘アクション。",
        "pt-BR": "Vingue sua família ao preço de sua própria juventude em combates exigentes de kung fu."
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
        "fr": "Grimpez une tour titanesque abandonnée en gérant votre corde et votre endurance dans une ambiance méditative.",
        "en": "Enjoy meditative vibes in Jusant, an action-puzzle climbing game. Scale an immeasurably tall tower.",
        "es": "Disfruta de la calma de Jusant, un juego de escalada y puzles donde asciendes por una torre infinita.",
        "de": "Erklimme einen gigantischen verlassenen Felsturm mit Seil und Haken in diesem meditativen Kletterabenteuer.",
        "ja": "ロープとスタミナを操り、神秘の相棒とともに天へとそびえる巨大な岩塔を登る瞑想的クライミングゲーム。",
        "pt-BR": "Escale uma torre colossal abandonada gerenciando sua corda e fôlego nesta escalada meditativa."
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
        "fr": "Plongez dans l'absurdité du folklore britannique du nord dans cette comédie interactive hilarante.",
        "en": "A comedy slapformer, which unfolds over time as the players' exploration and antics leave their mark on the strange town of Barnsworth.",
        "es": "Una comedia interactiva británica delirante llena de personajes estrafalarios y situaciones absurdas.",
        "de": "Eine herrlich schräge britische Komödie, in der du als Handlungsreisender das Chaos in Barnsworth stiftest.",
        "ja": "奇妙なイギリスの田舎町バーンズワースで巻き起こる、不条理で抱腹絶倒のコメディアドベンチャー。",
        "pt-BR": "Mergulhe no humor britânico mais absurdo e excêntrico nesta hilária comédia interativa animada."
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
        "fr": "Explorez un vaste monde interconnecté aux commandes d'un petit vaisseau dans un shooter-aventure enchanteur.",
        "en": "Fly into a charming handcrafted world and go on an adventure that mixes the thrill of open-ended exploration with twin-stick shooter action.",
        "es": "Pilota una pequeña nave en una encantadora aventura que combina exploración metroidvania y tiroteos twin-stick.",
        "de": "Steuere ein kleines Raumschiff durch eine handgezeichnete, vernetzte Welt voller Verliese und Bosse.",
        "ja": "手描き風の鮮やかな世界を小さな宇宙船で飛び回り、探索と弾幕バトルを楽しむツインスティックアドベンチャー。",
        "pt-BR": "Explore um mundo interconectado pilotando uma pequena nave nesta charmosa aventura com tiros estilo twin-stick."
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
        "fr": "Affrontez le Titan du Temps au-delà des Enfers dans cette suite envoûtante imprégnée de sorcellerie.",
        "en": "Battle beyond the Underworld using dark sorcery to take on the Titan of Time in this bewitching sequel.",
        "es": "Lucha más allá del Inframundo usando brujería oscura para enfrentarte al Titán del Tiempo.",
        "de": "Kämpfe dich mit dunkler Hexerei durch neue Reiche, um dem Titanen der Zeit die Stirn zu bieten.",
        "ja": "闇の魔術を操り、時の巨神クロノスを討つべく冥界の先へと挑む大人気ローグライクの正統続編。",
        "pt-BR": "Enfrente o Titã do Tempo além do Submundo usando feitiçaria sombria nesta sequência hipnotizante."
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
        "fr": "Nouez un lien indéfectible avec un loup magique dans un monde en déclin menacé par des forces corrompues.",
        "en": "Experience the moving tale of a young woman and her lifelong bond with a magnificent wolf in a dying world.",
        "es": "Vive la emotiva historia de una joven y su vínculo eterno con un magnífico lobo en un mundo que agoniza.",
        "de": "Erlebe die berührende Geschichte einer Kriegerin und ihres treuen Wolfsgefährten in einer zerfallenden Welt.",
        "ja": "滅びゆく美しい世界で、誇り高き狼の相棒とともに心温まる絆を紡ぐ美麗アクションアドベンチャー。",
        "pt-BR": "Construa um vínculo eterno com um lobo mágico em um mundo deslumbrante ameaçado pela escuridão."
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
      "fr": "3D Rétro Low-poly",
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
        "fr": "Vivez la détresse psychologique de l'équipage d'un cargo spatial naufragé au fin fond de l'espace.",
        "en": "A first-person psychological horror narrative following the dying days of a shipwrecked space crew.",
        "es": "Una perturbadora historia de terror psicológico sobre los últimos días de la tripulación de un carguero espacial.",
        "de": "Erlebe den beklemmenden psychologischen Zerfall der Besatzung eines gestrandeten Raumfrachters.",
        "ja": "宇宙の深淵に遭難した輸送船の中で、極限状態に追い詰められた乗組員たちの崩壊を描くサイコホラー。",
        "pt-BR": "Vivencie o colapso psicológico da tripulação de um cargueiro espacial naufragado no vazio."
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
        "fr": "Menez une escouade de sorciers en kevlar dans des assauts tactiques urbains combinant magie et flingues.",
        "en": "Lead a team of renegade wizards in kevlar across puzzle-like turn-based tactical urban missions.",
        "es": "Lidera a un grupo de magos renegados con chaleco antibalas en misiones tácticas urbanas por turnos.",
        "de": "Führe eine Truppe abtrünniger Magier in Kevlarwesten durch clevere rundenbasierte Taktikeinsätze.",
        "ja": "防弾チョッキを着た現代の魔法使い部隊を率いて、部屋を急襲する爽快ターン制タクティカルパズル。",
        "pt-BR": "Comande magos rebeldes de colete à prova de balas em invasões táticas urbanas hilárias por turnos."
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
        "fr": "Explorez les souvenirs des clones d'une déesse toute-puissante dans un thriller narratif vertigineux.",
        "en": "A hyper-cinematic narrative adventure. A thousand years in the future, humanity is all but extinct.",
        "es": "Una aventura narrativa cinematográfica donde revives los recuerdos de los clones de una deidad omnipotente.",
        "de": "Erkunde die Erinnerungen der Klone einer allmächtigen Göttin in diesem tiefgründigen Sci-Fi-Thriller.",
        "ja": "人類が死滅した千年後の未来で、全能の神となった少女の記憶の謎を追う圧巻のSFシネマティック体験。",
        "pt-BR": "Explore as memórias dos clones de uma deusa onipotente em um suspense de ficção científica cinematográfico."
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
        "fr": "Guidez quatre héros autochtones contre la cupidité des colonisateurs dans un système tactique simultané unique.",
        "en": "Enter the breathtaking world of Arco, a unique tactical action game where your decisions shape the story.",
        "es": "Entra en el asombroso mundo de Arco, un juego de acción táctica donde tus decisiones forjan el destino.",
        "de": "Führe vier indigene Helden in einem innovativen simultanen Taktiksystem gegen skrupellose Invasoren.",
        "ja": "美しい南米風の荒野を舞台に、同時に行動する独自の戦術システムで運命を切り拓くタクティカルアクション。",
        "pt-BR": "Guie quatro heróis indígenas contra colonizadores impiedosos em combates táticos simultâneos inovadores."
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
        "fr": "Explorez une caverne souterraine infinie pleine de créatures, reliques et ressources avec vos amis.",
        "en": "Explore an endless cavern of creatures, relics and resources in a mining sandbox adventure for 1-8 players.",
        "es": "Explora una caverna subterránea infinita de criaturas, reliquias y recursos para 1 a 8 jugadores.",
        "de": "Erkunde eine geheimnisvolle unterirdische Höhlenwelt voller Relikte und Bosse allein oder im Koop.",
        "ja": "古代の核が眠る広大な地下世界を採掘し、拠点や装備を作って強大なボスに挑むサンドボックスアドベンチャー。",
        "pt-BR": "Explore uma caverna subterrânea infinita repleta de recursos, relíquias e chefes misteriosos com seus amigos."
      },
      "composer": "Jonathan Geer"
    }
  },
  {
    "id": "manor-lords",
    "title": "Manor Lords",
    "releaseYear": 2024,
    "genre": [
      "City Builder",
      "Gestion",
      "Médiéval",
      "Stratégie"
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1363080/bffe9f34abaae09855becd6e8ca2ddb9065b2ebb/ss_bffe9f34abaae09855becd6e8ca2ddb9065b2ebb.1920x1080.jpg?t=1789670136",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1363080/2a8486cf95c15af440a4857d6021bb15c057416c/ss_2a8486cf95c15af440a4857d6021bb15c057416c.1920x1080.jpg?t=1789670136",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1363080/e96c54a784a4fa874beb1c21ce0e34ada8eb932f/ss_e96c54a784a4fa874beb1c21ce0e34ada8eb932f.1920x1080.jpg?t=1789670136",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1363080/5111f429dfbd8b65611e0e322dc90f470d015dca/ss_5111f429dfbd8b65611e0e322dc90f470d015dca.1920x1080.jpg?t=1789670136",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1363080/541dce83a952beb779f2221cb107c6557f192439/ss_541dce83a952beb779f2221cb107c6557f192439.1920x1080.jpg?t=1789670136",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1363080/ce313af5e85391c7ebee3b654a35a7ab78a1fe38/ss_ce313af5e85391c7ebee3b654a35a7ab78a1fe38.1920x1080.jpg?t=1789670136"
    ],
    "hints": {
      "tagline": {
        "fr": "Bâtissez une cité médiévale florissante et menez des batailles tactiques réalistes en temps réel.",
        "en": "A medieval strategy game featuring in-depth city building, large-scale tactical battles, and complex economic simulation.",
        "es": "Un juego de estrategia medieval con construcción orgánica de aldeas y batallas tácticas a gran escala.",
        "de": "Erbaue deine eigene mittelalterliche Stadt und führe deine Truppen in fesselnde Echtzeitschlachten.",
        "ja": "中世の領主となってリアルな村づくりを進め、緻密な経済と大規模な合戦を指揮する本格戦略シミュレーション。",
        "pt-BR": "Construa uma cidade medieval orgânica e comande batalhas táticas realistas em grande escala."
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
        "fr": "Redonnez vie à un village magique dans cette simulation de ferme nostalgique et colorée.",
        "en": "Build the farm of your dreams as you discover a world full of magic, romance, and adventure in this farming sim.",
        "es": "Construye la granja de tus sueños mientras descubres magia, romance y amistad en este encantador simulador.",
        "de": "Erwecke ein verträumtes Dorf zu neuem Glanz in dieser nostalgischen Farmsimulation voller Magie und Charme.",
        "ja": "魔法とロマンス、そして冒険が待つ美しい町で、夢の牧場生活を築き上げる心温まる農場シミュレーション。",
        "pt-BR": "Restaure uma vila mágica e viva a vida no campo nesta charmosa e nostálgica simulação de fazenda."
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
        "fr": "Prononcez ou tapez des mots pour lancer des sorts et résoudre des énigmes dans ce dungeon crawler rétro.",
        "en": "Say anything in this bizarre dungeon adventure where words control everything. Speak or type your way through.",
        "es": "Pronuncia o escribe palabras para lanzar hechizos y resolver acertijos en este ingenioso dungeon crawler.",
        "de": "Tippe oder sprich Worte, um Zauber zu wirken und Rätsel zu lösen in diesem herrlich schrägen Verlies-RPG.",
        "ja": "言葉をタイプして呪文を放ち、ユーモア溢れるスケルトンとともに暗黒の地下迷宮を探索する怪作RPG。",
        "pt-BR": "Digite ou fale palavras em voz alta para lançar feitiços e resolver enigmas neste criativo dungeon crawler."
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
      "fr": "3D Rétro Low-poly",
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
        "fr": "Tuez toutes les dix secondes pour recharger votre jauge de vie dans ce FPS rétro anime survitaminé.",
        "en": "An anime-inspired single-player fast-paced FPS that brings you inside a classic 90s anime cyberpunk world.",
        "es": "Un frenético FPS noventero donde debes matar cada 10 segundos para sobrevivir en un rascacielos cyberpunk.",
        "de": "Töte alle zehn Sekunden, um deine Lebenszeit aufzuladen in diesem rasanten 90er-Anime-Cyberpunk-Shooter.",
        "ja": "90年代の黄金期アニメを彷彿とさせるサイバーパンク都市で、10秒の命を繋ぎ止める超高速レトロFPS。",
        "pt-BR": "Elimine inimigos a cada 10 segundos para recarregar sua vida neste alucinante FPS com estética de anime anos 90."
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
        "fr": "Dégommez des portes et défoncez des gangsters à coups de pied dans un shooter déjanté à la vitesse de l'éclair.",
        "en": "A lightning-fast hard bass blast of kicking down doors and kicking ass in the fever-dream city of Shit City.",
        "es": "Derriba puertas a patadas y aniquila gánsteres al ritmo de hard bass en este frenético shooter.",
        "de": "Tritt Türen ein und fege Gangster im Sekundentakt von den Beinen in diesem abgedrehten Hard-Bass-Shooter.",
        "ja": "ハードベースの重低音が鳴り響く街で、強力な蹴りと銃撃でギャングの巣窟を蹴散らす超高速アクション。",
        "pt-BR": "Arrombe portas a pontapés e detone gângsteres no ritmo do hard bass neste shooter veloz e alucinante."
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
        "fr": "Démolissez des décors destructibles à grands coups de masse dans un jeu de plateforme d'action explosif.",
        "en": "An explosive, retro-inspired action-platformer all about destruction, dynamic mechanics, and heart-pumping boss fights.",
        "es": "Un explosivo juego de plataformas y acción retro donde la destrucción de escenarios es tu mejor aliada.",
        "de": "Ein explosives Retro-Action-Plattformspiel mit Fokus auf Zerstörung, pure Wucht und mitreißende Musik.",
        "ja": "巨大なハンマーを振り回してステージを豪快に破壊し、盗まれた魂を取り戻す痛快爆発プラットフォーマー。",
        "pt-BR": "Destrua cenários com golpes avassaladores de marreta neste explosivo jogo de plataforma retrô."
      },
      "composer": "Tony Grayson"
    }
  },
  {
    "id": "emberward",
    "title": "Emberward",
    "releaseYear": 2024,
    "genre": [
      "Stratégie",
      "Roguelike",
      "Puzzle"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Isométrique / 2.5D",
      "en": "Isometric / 2.5D"
    },
    "developer": "Refic Games",
    "steamUrl": "https://store.steampowered.com/app/2459550/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2459550/80b9f622576d1c9ccfef45c57f1504378215c90d/ss_80b9f622576d1c9ccfef45c57f1504378215c90d.1920x1080.jpg?t=1789814007",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2459550/ss_4861d31990950a67a1797beadecb90b1cd79e22c.1920x1080.jpg?t=1789814007",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2459550/8011ef6ab4cfa1679bb3ded1e990f58e325ffdeb/ss_8011ef6ab4cfa1679bb3ded1e990f58e325ffdeb.1920x1080.jpg?t=1789814007",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2459550/28bd980ebd627c40fa6ad2e4fa2af2a7471543d0/ss_28bd980ebd627c40fa6ad2e4fa2af2a7471543d0.1920x1080.jpg?t=1789814007",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2459550/ss_1e69187064214f0881242624f2833a9bb909179f.1920x1080.jpg?t=1789814007",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2459550/1f08326bcf6cf6f85e95fd63e8a2780266c80e06/ss_1f08326bcf6cf6f85e95fd63e8a2780266c80e06.1920x1080.jpg?t=1789814007"
    ],
    "hints": {
      "tagline": {
        "fr": "Bâtissez des labyrinthes de blocs façon Tetris pour repousser les ténèbres dans ce tower defense roguelite.",
        "en": "A roguelite tower defense game featuring unique block placement mechanics to create winding labyrinths.",
        "es": "Un tower defense roguelite donde colocas bloques tipo Tetris para canalizar y derrotar a los monstruos.",
        "de": "Baue Tetris-förmige Blocklabyrinthe und verteidige das heilige Licht in diesem Tower-Defense-Roguelite.",
        "ja": "ブロックを組み合わせて敵の進行ルートを迷路のように誘導する、新感覚タワーディフェンス・ローグライト。",
        "pt-BR": "Construa labirintos com blocos estilo Tetris para conter as trevas neste inteligente tower defense roguelite."
      },
      "composer": "Refic Games"
    }
  },
  {
    "id": "how-to-fish",
    "title": "How to Fish",
    "releaseYear": 2026,
    "genre": [
      "Simulation",
      "Pêche",
      "Cozy",
      "Méditatif"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "Dazed Games",
    "steamUrl": "https://store.steampowered.com/app/4001890/",
    "headerImage": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4001890/45c4ddff4901e32c4b8b643e1b97d0d01898d299/header.jpg?t=1788788717",
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
        "fr": "Pêchez tranquillement en pleine nature dans une expérience relaxante à la première personne.",
        "en": "A peaceful first-person fishing adventure where patience and serenity take center stage.",
        "es": "Una tranquila aventura de pesca en primera persona donde la serenidad y la naturaleza son protagonistas.",
        "de": "Ein friedvolles First-Person-Angelspiel, das dich mit ruhigen Gewässern und Naturgeräuschen entspannen lässt.",
        "ja": "美しい大自然のほとりで、水面の波紋を眺めながらゆったりと魚を釣り上げる癒しのフィッシング体験。",
        "pt-BR": "Pesque com calma no coração da natureza nesta relaxante e imersiva experiência em primeira pessoa."
      },
      "composer": "Dazed Games"
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
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1030300/26950369fe4b03c2268620eb9815c8a246aa0b06/ss_26950369fe4b03c2268620eb9815c8a246aa0b06.1920x1080.jpg?t=1776125736",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1030300/09ccaa6c16f158f9df8298feb5d196098506a028/ss_09ccaa6c16f158f9df8298feb5d196098506a028.1920x1080.jpg?t=1776125736",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1030300/d1a893ec6357b347a55ed929833ba793b57a79d2/ss_d1a893ec6357b347a55ed929833ba793b57a79d2.1920x1080.jpg?t=1776125736",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1030300/856e33e755a0b9a785c645d116036516ea08812b/ss_856e33e755a0b9a785c645d116036516ea08812b.1920x1080.jpg?t=1776125736",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1030300/8e09f2b2eedd3fa9b4479dd5c26d8bdf60562478/ss_8e09f2b2eedd3fa9b4479dd5c26d8bdf60562478.1920x1080.jpg?t=1776125736",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1030300/d907d0cc2b10b5ea4788b8d502cc27787d520c1d/ss_d907d0cc2b10b5ea4788b8d502cc27787d520c1d.1920x1080.jpg?t=1776125736"
    ],
    "hints": {
      "tagline": {
        "fr": "Incarnez Hornet dans un royaume inconnu et mortel gouverné par la soie et le chant.",
        "en": "Play as Hornet, princess-protector of Hallownest, and adventure through a whole new kingdom ruled by silk and song.",
        "es": "Encarna a Hornet en un reino completamente nuevo gobernado por la seda y la melodía.",
        "de": "Schlüpfe in die Rolle von Hornet und erkunde ein brandneues, von Seide und Gesang beherrschtes Reich.",
        "ja": "ハロウネストの姫騎士ホーネットとなり、絹と歌に支配された新たな王国を駆け抜ける期待の超大作。",
        "pt-BR": "Jogue como Hornet em um novo reino letal e majestoso governado pela seda e pela canção."
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
    "developer": "Ephemera Games",
    "steamUrl": "https://store.steampowered.com/app/2902170/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2902170/8ee81da0a56173915f4a1555fdb60d94e7858d34/ss_8ee81da0a56173915f4a1555fdb60d94e7858d34.1920x1080.jpg?t=1789680826",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2902170/88078553b7fdd46bf11f0bcc1c435c0780e3a199/ss_88078553b7fdd46bf11f0bcc1c435c0780e3a199.1920x1080.jpg?t=1789680826",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2902170/674a81ec253e5753f3df34b628bc8479ad0e1d2d/ss_674a81ec253e5753f3df34b628bc8479ad0e1d2d.1920x1080.jpg?t=1789680826",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2902170/0edb6ca2e74c29ac41cd96308c0fc8d0d132fdd7/ss_0edb6ca2e74c29ac41cd96308c0fc8d0d132fdd7.1920x1080.jpg?t=1789680826",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2902170/a7410d408fbbb0ea6cb91100314b3b7a26d054cc/ss_a7410d408fbbb0ea6cb91100314b3b7a26d054cc.1920x1080.jpg?t=1789680826",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2902170/ss_2ddb69c6d0d4b3b45b5afe7d2909c113ce7c57b3.1920x1080.jpg?t=1789680826"
    ],
    "hints": {
      "tagline": {
        "fr": "Affrontez une tour mécanique en fusionnant combats hack-and-slash intenses et liens intimes.",
        "en": "A fast-paced action RPG combining stylish combat with character-driven relationship building in a colossal mechanical tower.",
        "es": "Un juego de rol y acción que combina combates vertiginosos con profundas relaciones entre personajes.",
        "de": "Ein temporeiches Action-RPG, das anspruchsvolle Nahkämpfe mit bewegenden Bindungen verwebt.",
        "ja": "巨大な機械の塔を舞台に、電光石火のハック＆スラッシュと仲間との絆を紡ぐスタイリッシュアクションRPG。",
        "pt-BR": "Enfrente uma torre colossal mecânica unindo combate estilizado e laços profundos entre personagens."
      },
      "composer": "Patterns"
    }
  },
  {
    "id": "openfront",
    "title": "OpenFront",
    "releaseYear": 2026,
    "genre": [
      "Massivement multijoueur",
      "Stratégie",
      "Simulation",
      "Gestion"
    ],
    "artStyle": {
      "fr": "Monochrome / Minimaliste",
      "en": "Monochrome"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
      "en": "2D Top-down"
    },
    "developer": "OpenFront Inc, Evan Pellegrini",
    "steamUrl": "https://store.steampowered.com/app/3560670/",
    "headerImage": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3560670/b33eddb983569a4b0b4ac6ba5a23554b3dc3755f/header.jpg?t=1789729231",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3560670/e4bb7a01224734f6393a5b2ed182a58487ab7071/ss_e4bb7a01224734f6393a5b2ed182a58487ab7071.1920x1080.jpg?t=1789729231",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3560670/a4ae79cab4ff4e18f3aae9eaa8d8920d06a7b900/ss_a4ae79cab4ff4e18f3aae9eaa8d8920d06a7b900.1920x1080.jpg?t=1789729231",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3560670/a66ab60ca56f5942913e14566e21bedb7f5a5a07/ss_a66ab60ca56f5942913e14566e21bedb7f5a5a07.1920x1080.jpg?t=1789729231",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3560670/578a0bf1e70bc6dad974c310f0841e8f4bbfb15e/ss_578a0bf1e70bc6dad974c310f0841e8f4bbfb15e.1920x1080.jpg?t=1789729231",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3560670/a4ae79cab4ff4e18f3aae9eaa8d8920d06a7b900/ss_a4ae79cab4ff4e18f3aae9eaa8d8920d06a7b900.1920x1080.jpg?t=1789729231",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3560670/388957578e4ef7bdfd2382f13cbbc01d40dd3f89/ss_388957578e4ef7bdfd2382f13cbbc01d40dd3f89.1920x1080.jpg?t=1789729231"
    ],
    "hints": {
      "tagline": {
        "fr": "Prenez le commandement d'armées massives dans un jeu de stratégie multijoueur colossal en temps réel.",
        "en": "A massively multiplayer real-time strategy game pitting hundreds of players against one another in grand campaigns.",
        "es": "Un juego de estrategia en tiempo real masivo donde cientos de jugadores compiten en batallas geopolíticas.",
        "de": "Befehlige riesige Armeen in diesem massiven Multiplayer-Echtzeit-Strategiespiel um globale Vorherrschaft.",
        "ja": "何百人ものプレイヤーが領土を奪い合う、壮大なスケールで展開される大規模マルチプレイヤー戦略シミュレーション。",
        "pt-BR": "Comande exércitos massivos em uma gigantesca guerra geopolítica multijogador em tempo real."
      },
      "composer": "Evan Pellegrini"
    }
  },
  {
    "id": "bombanana",
    "title": "BOMBANANA!",
    "releaseYear": 2026,
    "genre": [
      "Puzzle",
      "Party Game",
      "Co-op",
      "Comédie",
      "Physique"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Troisième personne",
      "en": "Third-Person"
    },
    "developer": "Lefto Studio",
    "steamUrl": "https://store.steampowered.com/app/4656000/",
    "headerImage": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4656000/99c086faba625a8d3bc459bab444087d257ccbe1/header.jpg?t=1789738286",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4656000/429d033410531fc2ec6ba0cd24956868beaff095/ss_429d033410531fc2ec6ba0cd24956868beaff095.1920x1080.jpg?t=1789738286",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4656000/e476a3ed312794922d58c9553130922acc7f393d/ss_e476a3ed312794922d58c9553130922acc7f393d.1920x1080.jpg?t=1789738286",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4656000/88b677bb5d6ec91c12ad8bfbdcc5faf3ff15a044/ss_88b677bb5d6ec91c12ad8bfbdcc5faf3ff15a044.1920x1080.jpg?t=1789738286",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4656000/edb04b7f1714524fc59691ad0368492488e317cc/ss_edb04b7f1714524fc59691ad0368492488e317cc.1920x1080.jpg?t=1789738286",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4656000/5564e2b1729232a6c4f9cdc190b5d10f0afc4946/ss_5564e2b1729232a6c4f9cdc190b5d10f0afc4946.1920x1080.jpg?t=1789738286",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4656000/c1063e896d08eaa213aa43498a1a9ac7e9c481d6/ss_c1063e896d08eaa213aa43498a1a9ac7e9c481d6.1920x1080.jpg?t=1789738286"
    ],
    "hints": {
      "tagline": {
        "fr": "Résolvez des énigmes explosives et coopérez avec vos amis dans un univers fruité délirant.",
        "en": "A quirky explosive puzzle adventure filled with physics-based comedy and cooperative antics.",
        "es": "Una disparatada aventura cooperativa de puzles donde las bananas explosivas causan estragos cómicos.",
        "de": "Ein herrlich chaotisches Koop-Puzzlespiel voller explosiver Bananen und alberner Physik-Gags.",
        "ja": "爆発するバナナを投げ合い、コミカルな物理演算でギミックを解き明かすカオスな協力パズルアクション。",
        "pt-BR": "Resolva quebra-cabeças explosivos com física divertida e cooperação maluca com seus amigos."
      },
      "composer": "Lefto Studio"
    }
  },
  {
    "id": "no-rest-for-the-wicked",
    "title": "No Rest for the Wicked",
    "releaseYear": 2024,
    "genre": [
      "Action",
      "RPG",
      "Souls-like",
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
        "fr": "Redécouvrez l'Action-RPG avec des combats viscéraux et une direction artistique saisissante signée Moon Studios.",
        "en": "A visceral, precision Action RPG crafted by Moon Studios, creators of Ori and the Blind Forest.",
        "es": "Un implacable juego de rol y acción con combates precisos y una deslumbrante dirección de arte de Moon Studios.",
        "de": "Ein düsteres, hochpräzises Action-RPG von den Machern von Ori mit atemberaubender handgemalter Ästhetik.",
        "ja": "『Ori』のクリエイターが贈る、精密な戦闘と絵画のように美しい世界が織り成す骨太のアクションRPG。",
        "pt-BR": "Redescubra o RPG de ação com combates precisos e direção de arte magistral dos criadores de Ori."
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
      "Co-op"
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
    "headerImage": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3949040/df3b0e300632f3cd1caf0aa9dc6213ebe79dac43/header_alt_assets_0.jpg?t=1789134289",
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
        "fr": "Embarquez pour un road-trip chaotique et hilarant en camping-car à travers des routes périlleuses.",
        "en": "Pack up and set out on a hilarious physics-based road trip across wild terrain with your trusty motorhome.",
        "es": "Emprende un accidentado y divertidísimo viaje por carretera en autocaravana con física alocada.",
        "de": "Begib dich auf einen chaotischen Camping-Roadtrip mit physikbasierten Pannen und wildem Gelände.",
        "ja": "ガタゴト揺れるキャンピングカーを運転し、ハプニング満載の悪路を仲間と突き進むドライブアクション。",
        "pt-BR": "Embarque em uma viagem hilária de motorhome cheia de percalços e física imprevisível pelas estradas."
      },
      "composer": "road bumps"
    }
  },
  {
    "id": "palworld",
    "title": "Palworld",
    "releaseYear": 2024,
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
        "fr": "Capturez d'adorables créatures pour combattre, construire des usines et explorer un immense monde ouvert.",
        "en": "Fight, farm, build and work alongside mysterious creatures called 'Pals' in this vast open-world survival game.",
        "es": "Lucha, cultiva, construye y sobrevive junto a criaturas misteriosas llamadas 'Pals' en un inmenso mundo abierto.",
        "de": "Kämpfe, baue und arbeite mit geheimnisvollen Wesen namens 'Pals' in einem gewaltigen Open-World-Abenteuer.",
        "ja": "不思議な生物「パル」とともに戦い、農場を営み、巨大な拠点を作り上げる広大なオープンワールドサバイバル。",
        "pt-BR": "Capture criaturas misteriosas para lutar, trabalhar em fábricas e explorar um vasto mundo aberto."
      },
      "composer": "Tatsuya Yano"
    }
  },
  {
    "id": "megabonk",
    "title": "Megabonk",
    "releaseYear": 2025,
    "genre": [
      "Auto-Shooter",
      "Action",
      "Roguelike",
      "Bullet Hell"
    ],
    "artStyle": {
      "fr": "3D Rétro Low-poly",
      "en": "Retro Low-poly 3D"
    },
    "camera": {
      "fr": "Troisième personne",
      "en": "Third-Person"
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
        "fr": "Écrasez des vagues de monstres grotesques à grands coups de massue dans ce délire d'action survolté.",
        "en": "A bonkers, fast-paced action roguelite where crushing enemies with a massive club is the only path forward.",
        "es": "Un alocado juego de acción roguelite donde aplastar enemigos con una cachiporra gigante lo soluciona todo.",
        "de": "Schlage Monsterhorden mit riesigen Keulen in die Flucht in diesem urkomischen Retro-Action-Roguelite.",
        "ja": "巨大なこん棒を豪快に振り回し、群がる怪物を爽快にブッ叩く痛快ローグライトアクション。",
        "pt-BR": "Esmague hordas de monstros grotescos com porretes gigantes neste jogo de ação eletrizante."
      },
      "composer": "Miguelangell960"
    }
  },
  {
    "id": "soma",
    "title": "SOMA",
    "releaseYear": 2015,
    "genre": [
      "Aventure",
      "Survie",
      "Horreur",
      "Sci-Fi",
      "Psychologique"
    ],
    "artStyle": {
      "fr": "3D Réaliste",
      "en": "Realistic 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "Frictional Games",
    "steamUrl": "https://store.steampowered.com/app/282140/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/282140/ss_21b43d4cb49ef3332eefbb4957ec96e075543ef1.1920x1080.jpg?t=1786607913",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/282140/ss_5ee5231b847ec7397554af8b2efe25caeef5d7c5.1920x1080.jpg?t=1786607913",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/282140/ss_4f83ec9749915f42276cf6a96ee9e8e5d8fcec60.1920x1080.jpg?t=1786607913",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/282140/ss_e19b8e8b9b453aff00651ebd3e8a2639b581bc73.1920x1080.jpg?t=1786607913",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/282140/ss_d2fa7284b9610be9655700c6fa60bf44f7affce8.1920x1080.jpg?t=1786607913",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/282140/ss_710730af566289fac26be35af9eeb9580020f6e8.1920x1080.jpg?t=1786607913"
    ],
    "hints": {
      "tagline": {
        "fr": "Questionnez l'essence de l'humanité et de la conscience dans les profondeurs sous-marines d'une station abandonnée.",
        "en": "From the creators of Amnesia comes SOMA, a sci-fi horror game about identity, consciousness, and what it means to be human.",
        "es": "Un sobrecogedor juego de terror de ciencia ficción que explora la identidad y la conciencia en las profundidades oceánicas.",
        "de": "Ein beklemmender philosophischer Sci-Fi-Horror der Amnesia-Macher in den Tiefen einer verlassenen Unterseestation.",
        "ja": "深海に沈む密閉施設を舞台に、人間の意識とアイデンティティの境界を問う傑作SFサイコホラー。",
        "pt-BR": "Questione a essência da consciência e da humanidade nas profundezas oceânicas de uma estação isolada."
      },
      "composer": "Mikko Tarmia"
    }
  },
  {
    "id": "the-witness",
    "title": "The Witness",
    "releaseYear": 2016,
    "genre": [
      "Puzzle",
      "Exploration",
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
    "developer": "Thekla, Inc.",
    "steamUrl": "https://store.steampowered.com/app/210970/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/210970/ss_9c73ac83c8acfb69db6166f239fdba2ffa099b32.1920x1080.jpg?t=1720810823",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/210970/ss_6a7964a4dede8ad7d8b4e413e8b291defbbaa55b.1920x1080.jpg?t=1720810823",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/210970/ss_583fdbf6aa66a179d60a2261bab7b10c102e36e8.1920x1080.jpg?t=1720810823",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/210970/ss_05033717114ac8a697fbf45c149d26bb1cfc6893.1920x1080.jpg?t=1720810823",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/210970/ss_86c4e2f0fd7cc62d3bfbc4a6cd8f7423650610bb.1920x1080.jpg?t=1720810823",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/210970/ss_fabb0939200a1f2bbb40b775c8e07645f21dc44a.1920x1080.jpg?t=1720810823"
    ],
    "hints": {
      "tagline": {
        "fr": "Percez les secrets d'une île mystérieuse et solitaire en résolvant des centaines de tracés énigmatiques.",
        "en": "An open-world puzzle game with dozens of locations to explore and over 500 puzzles on a quiet, beautiful island.",
        "es": "Un juego de puzles en mundo abierto con más de 500 ingeniosos acertijos en una isla solitaria y hermosa.",
        "de": "Erkunde eine friedliche, malerische Insel und löse hunderte von cleveren Linienrätseln in deinem eigenen Rhythmus.",
        "ja": "美しく静寂な島を自由に巡り、世界そのものに隠された500以上の直線パズルを解き明かす傑作オープンワールド。",
        "pt-BR": "Desvende os segredos de uma ilha solitária e fascinante resolvendo centenas de labirintos reflexivos."
      },
      "composer": "Wabi Sabi Sound"
    }
  },
  {
    "id": "braid",
    "title": "Braid, Anniversary Edition",
    "releaseYear": 2024,
    "genre": [
      "Platformer",
      "Puzzle",
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
    "developer": "Thekla, Inc.",
    "steamUrl": "https://store.steampowered.com/app/499180/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/499180/ss_320fc2bf5c2b9b42c73a10451c4a710cb08a3d96.1920x1080.jpg?t=1730925816",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/499180/ss_59e3348fa79118f5e2f37db0c0e7695e82393771.1920x1080.jpg?t=1730925816",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/499180/ss_654230af657b4300ed692da96b2782665d9b3b48.1920x1080.jpg?t=1730925816",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/499180/ss_14971642f27908991469cb28dbec355fa0823c84.1920x1080.jpg?t=1730925816",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/499180/ss_d03aea70b6ff74909161aa7410c96546135c5a14.1920x1080.jpg?t=1730925816",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/499180/ss_59ed5ec0e0923491188be0b276687d805125ca1b.1920x1080.jpg?t=1730925816"
    ],
    "hints": {
      "tagline": {
        "fr": "Manipulez l'écoulement du temps pour surmonter des énigmes cérébrales et retrouver la princesse.",
        "en": "A puzzle-platformer, drawn in a painterly style, where you can manipulate the flow of time in strange and unusual ways.",
        "es": "Un clásico de plataformas y puzles con estilo pictórico donde manipulas el flujo del tiempo de formas ingeniosas.",
        "de": "Manipuliere den Lauf der Zeit, um verblüffende Rätsel zu lösen und eine verlorene Prinzessin zu retten.",
        "ja": "時間を自在に進めたり巻き戻したりしながら、絵画のような世界で難解な謎を解く不朽の名作パズルアクション。",
        "pt-BR": "Manipule o fluxo do tempo de formas surpreendentes para resolver quebra-cabeças e encontrar a princesa."
      },
      "composer": "Martin Stig Andersen"
    }
  },
  {
    "id": "loop-hero",
    "title": "Loop Hero",
    "releaseYear": 2021,
    "genre": [
      "Roguelike",
      "Deckbuilder",
      "Stratégie",
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
    "developer": "Four Quarters",
    "steamUrl": "https://store.steampowered.com/app/1282730/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1282730/ss_500e7212653fa6586f7a84c89b4c60be4e425fbb.1920x1080.jpg?t=1751489185",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1282730/ss_455789884ed94fd20410ac5a139e8c3bb8f6f369.1920x1080.jpg?t=1751489185",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1282730/ss_d6cf090e7c644756cc66443c0740f5497e6afbba.1920x1080.jpg?t=1751489185",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1282730/ss_6a416c70c8f1bc80c84a02a0627d2050061b0e39.1920x1080.jpg?t=1751489185",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1282730/ss_d03a4b7460d5da83d7a208c7500d73861922664b.1920x1080.jpg?t=1751489185",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1282730/ss_58039fc526fe3f2006826a8ea11ca64c145b7a24.1920x1080.jpg?t=1751489185"
    ],
    "hints": {
      "tagline": {
        "fr": "Placez des cartes de terrain pour forger le destin d'un chevalier prisonnier d'une boucle temporelle infinie.",
        "en": "Use an expanding deck of mystical cards to place enemies, buildings, and terrain along each unique expedition loop.",
        "es": "Coloca cartas místicas para reconstruir el mundo y derrotar enemigos en una expedición cíclica sin fin.",
        "de": "Erbaue mit einem mystischen Kartendeck die Welt um deinen Helden neu in dieser endlosen Schleife.",
        "ja": "カードを使って敵や地形を配置し、世界を取り戻すために終わりのないループを周回する独創的ローグライクRPG。",
        "pt-BR": "Use cartas místicas para moldar o caminho de um herói preso em um ciclo temporal infinito."
      },
      "composer": "blinch"
    }
  },
  {
    "id": "slay-the-princess",
    "title": "Slay the Princess",
    "releaseYear": 2023,
    "genre": [
      "Visual Novel",
      "Narratif",
      "Horreur",
      "Psychologique"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "Black Tabby Games",
    "steamUrl": "https://store.steampowered.com/app/1989270/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1989270/ss_5262a1ed60b5f1f8419f0c0be3dafa92a7167eba.1920x1080.jpg?t=1775751748",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1989270/ss_d48a0403c8ce84a614120fa419109151f166fb40.1920x1080.jpg?t=1775751748",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1989270/ss_9d91e5ccfe3f0ee5484054d7b535d4a3209e3c0e.1920x1080.jpg?t=1775751748",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1989270/ss_a21403e66530a55daf306332893ce6cfa3c76948.1920x1080.jpg?t=1775751748",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1989270/ss_e703b1c4504bc117b73cf664146968237886a3fa.1920x1080.jpg?t=1775751748",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1989270/ss_b712f6a2527719b7af9d3a2e92bab2ea91633803.1920x1080.jpg?t=1775751748"
    ],
    "hints": {
      "tagline": {
        "fr": "Vous devez assassiner la princesse enfermée dans la cabane, mais chaque mensonge change sa forme mortelle.",
        "en": "You're on a path in the woods, and at the end of that path is a cabin. And in the basement is a Princess. You have to slay her.",
        "es": "Estás en un sendero en el bosque, al final hay una cabaña y en el sótano una Princesa. Tienes que matarla.",
        "de": "Du bist auf einem Pfad im Wald. Am Ende steht eine Hütte, und im Keller wartet eine Prinzessin. Töte sie.",
        "ja": "森の奥の小屋に囚われた姫を討伐せよ。あなたの選択と疑念によって姫の姿と世界の運命が変貌する異色の心理ホラー。",
        "pt-BR": "Você deve assassinar a princesa na cabana da floresta, mas cada palavra sua altera sua forma terrível."
      },
      "composer": "Brandon Boone"
    }
  },
  {
    "id": "chained-echoes",
    "title": "Chained Echoes",
    "releaseYear": 2022,
    "genre": [
      "RPG",
      "Tour par tour",
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
    "developer": "Matthias Linda",
    "steamUrl": "https://store.steampowered.com/app/1229240/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1229240/ss_b25ed2e671e7b616ec14e7ed3a2f483909e368c4.1920x1080.jpg?t=1788522273",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1229240/ss_b350a5ee81b0eff7c044c99b2d809489d35a665c.1920x1080.jpg?t=1788522273",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1229240/ss_cfba4c66d14e860d381374d252381f7469f39582.1920x1080.jpg?t=1788522273",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1229240/ss_02152fa16493a1fe30ce307864c7b2d6f82daede.1920x1080.jpg?t=1788522273",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1229240/ss_d9d4918974f20e9bd1480c2920ddffd010d617a5.1920x1080.jpg?t=1788522273",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1229240/ss_a243fbe03c0cbf775eec0b139d4b429cae982e17.1920x1080.jpg?t=1788522273"
    ],
    "hints": {
      "tagline": {
        "fr": "Montez à bord de mechs géants et délivrez un continent déchiré par la guerre dans ce JRPG classique acclamé.",
        "en": "A story-driven JRPG where a group of heroes travel around the vast continent of Valandis to bring an end to the war.",
        "es": "Un aclamado JRPG clásico por turnos donde viajas por el continente de Valandis a pie y en mechas de combate.",
        "de": "Ein gefeiertes klassisches JRPG mit Mechs, tiefgründigen Charakteren und taktischen rundenbasierten Schlachten.",
        "ja": "大空を翔ける巨大メカを駆り、戦乱のバランディス大陸に平和をもたらす16ビット黄金期リスペクトJRPG。",
        "pt-BR": "Embarque em mechs gigantes e liberte um continente dilacerado pela guerra neste aclamado JRPG clássico."
      },
      "composer": "Eddie Marianukroh"
    }
  },
  {
    "id": "cassette-beasts",
    "title": "Cassette Beasts",
    "releaseYear": 2023,
    "genre": [
      "RPG",
      "Tour par tour",
      "Exploration"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Isométrique / 2.5D",
      "en": "Isometric / 2.5D"
    },
    "developer": "Bytten Studio",
    "steamUrl": "https://store.steampowered.com/app/1321440/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1321440/ss_8c6d904950b675f8cb2e0255a1f5b06d7898bc5b.1920x1080.jpg?t=1789482081",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1321440/ss_580f8e3d83ab9357cface16e0272eb541f51984e.1920x1080.jpg?t=1789482081",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1321440/ss_aaa30fb9959b16d8026ac1e83a3bb0e8c591ed8b.1920x1080.jpg?t=1789482081",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1321440/ss_4b4231e199091054d443b319f97811646fbab9d4.1920x1080.jpg?t=1789482081",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1321440/ss_e06730aacd65dbeb420adbc7dcdb71226ea979aa.1920x1080.jpg?t=1789482081",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1321440/ss_ab46d3e31213f572e72b7284ef7fad1fc1bcf8d1.1920x1080.jpg?t=1789482081"
    ],
    "hints": {
      "tagline": {
        "fr": "Enregistrez des monstres sur des cassettes audio et fusionnez-les lors de combats au tour par tour captivants.",
        "en": "Collect awesome monsters to use during turn-based battles in this open-world RPG. Combine any two monster forms!",
        "es": "Graba monstruos en cintas de casete y fusiónalos en apasionantes combates por turnos en mundo abierto.",
        "de": "Nimm geheimnisvolle Monster auf Kassetten auf und fusioniere sie in packenden rundenbasierten Kämpfen.",
        "ja": "カセットテープにモンスターを録音して変身し、2体の魔物を合体させて戦うオープンワールドRPG。",
        "pt-BR": "Grave monstros em fitas cassete e combine duas criaturas para criar fusões incríveis em turnos."
      },
      "composer": "Joel Baylis"
    }
  },
  {
    "id": "crosscode",
    "title": "CrossCode",
    "releaseYear": 2018,
    "genre": [
      "Action",
      "RPG",
      "Puzzle",
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
    "developer": "Radical Fish Games",
    "steamUrl": "https://store.steampowered.com/app/368340/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/368340/ss_5bf282c8d5bef2f479b7e55aed91118245ad213b.1920x1080.jpg?t=1788522282",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/368340/ss_7fecc64f6470652a1464371fa9e7a767a84fd95d.1920x1080.jpg?t=1788522282",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/368340/ss_4a517a0780eaca5fa87c98ba5d1095812f415378.1920x1080.jpg?t=1788522282",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/368340/ss_0fe430dc028a518b12db45858cbb2bacd660db6d.1920x1080.jpg?t=1788522282",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/368340/ss_32cba6041d0988d0d40e184f1eb103ac0884ce47.1920x1080.jpg?t=1788522282",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/368340/ss_e15bb7ee21196d50e45d41b0c7602d346d4086d2.1920x1080.jpg?t=1788522282"
    ],
    "hints": {
      "tagline": {
        "fr": "Plongez dans un MMO virtuel en 2D alliant combats ultra-nerveux à la Zelda et énigmes de balles rebondissantes.",
        "en": "A retro-inspired 2D Action RPG set in the distant future, combining 16-bit SNES-style graphics with butter-smooth physics.",
        "es": "Un trepidante RPG de acción retro en 2D que combina combates vertiginosos con ingeniosos puzles.",
        "de": "Ein fulminantes 2D-Action-RPG im 16-Bit-Stil mit rasanten Kämpfen und kniffligen Ball-Abprall-Rätseln.",
        "ja": "近未来の仮想MMO世界を舞台に、流麗なハイスピード戦闘と緻密な反射パズルが融合した傑作2DアクションRPG。",
        "pt-BR": "Mergulhe em um MMO virtual em 2D unindo combates intensos e enigmas de bolas saltitantes."
      },
      "composer": "Deniz Akbulut"
    }
  },
  {
    "id": "subnautica-below-zero",
    "title": "Subnautica: Below Zero",
    "releaseYear": 2021,
    "genre": [
      "Survie",
      "Exploration",
      "Sci-Fi",
      "Aventure"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "Unknown Worlds Entertainment",
    "steamUrl": "https://store.steampowered.com/app/848450/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/848450/ss_5011daad83f8494eda0826e4bbc91181239ad5d7.1920x1080.jpg?t=1777456254",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/848450/ss_69bdcf6ce29ba61650f0b2551a3494af67be09ac.1920x1080.jpg?t=1777456254",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/848450/ss_3c3403337b972d4913e3a6b4f34e0f47e484c042.1920x1080.jpg?t=1777456254",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/848450/ss_5bc21362aa200d08fe25203cbe50debedd8f11a3.1920x1080.jpg?t=1777456254",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/848450/ss_9e3d6ab0db5442f7bcbeb923da47d3a80023f50f.1920x1080.jpg?t=1777456254",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/848450/ss_e5c0f0272552f4aff9129ce3683131bdabd5983c.1920x1080.jpg?t=1777456254"
    ],
    "hints": {
      "tagline": {
        "fr": "Survivez au froid glacial des fonds marins d'une planète arctique et percez le mystère de votre sœur.",
        "en": "Dive into a freezing underwater adventure on an alien planet. Below Zero is set two years after the original Subnautica.",
        "es": "Sumérgete en una gélida aventura submarina alienígena dos años después del Subnautica original.",
        "de": "Tauche ein in ein arktisches Unterwasserabenteuer auf einem eisigen Planeten und überlebe die Kälte.",
        "ja": "極寒の氷海に包まれた未知の惑星で、過酷な吹雪と海の脅威を生き抜き姉の足跡を追う水中サバイバル。",
        "pt-BR": "Sobreviva ao frio congelante das profundezas árticas de um planeta alienígena e desvende a verdade."
      },
      "composer": "Ben Prunty"
    }
  },
  {
    "id": "ori-and-the-will-of-the-wisps",
    "title": "Ori and the Will of the Wisps",
    "releaseYear": 2020,
    "genre": [
      "Metroidvania",
      "Platformer",
      "Aventure"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
    },
    "developer": "Moon Studios",
    "steamUrl": "https://store.steampowered.com/app/1057090/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1057090/ss_0cf0ec6681ae5771173790dbc99ddb3bf3b886ad.1920x1080.jpg?t=1759530749",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1057090/ss_f8ac174b7949e89fe1939a7bd2c471785dee55f0.1920x1080.jpg?t=1759530749",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1057090/ss_3ae04b208aaff3869f69617c47449ec1d7a06513.1920x1080.jpg?t=1759530749",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1057090/ss_608e317acbb76258bedcf1a79e6673a61475908f.1920x1080.jpg?t=1759530749",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1057090/ss_d33bc7bb1d106b841a28d1cf3403fb7b1188252f.1920x1080.jpg?t=1759530749",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1057090/ss_57ea45c3711319429b19ac62c0a21997b10e1042.1920x1080.jpg?t=1759530749"
    ],
    "hints": {
      "tagline": {
        "fr": "Affrontez un périple déchirant au-delà de la forêt de Nibel pour percer le véritable destin d'Ori.",
        "en": "Embark on a new journey in a vast world filled with new friends and foes that come to life in stunning, hand-painted artwork.",
        "es": "Embárcate en un viaje conmovedor en un vasto mundo dibujado a mano para descubrir el destino de Ori.",
        "de": "Begib dich auf eine emotionale Reise durch ein gewaltiges, handgemaltes Reich voller neuer Herausforderungen.",
        "ja": "ニベルの森を越えた未知なる大地で、真の運命を解き明かす小さな精霊オリの壮大で胸を打つ冒険譚。",
        "pt-BR": "Embarque em uma jornada emocionante por um mundo desenhado à mão para desvendar o verdadeiro destino de Ori."
      },
      "composer": "Gareth Coker"
    }
  },
  {
    "id": "the-messenger",
    "title": "The Messenger",
    "releaseYear": 2018,
    "genre": [
      "Platformer",
      "Metroidvania",
      "Action",
      "Rétro"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
    },
    "developer": "Sabotage Studio",
    "steamUrl": "https://store.steampowered.com/app/764790/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/764790/ss_8e0fa7f8226d8f8fd0dd313e26e6b4d97562f7a3.1920x1080.jpg?t=1751460481",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/764790/ss_245d381f3b4a280818c73ef3769a92ea3a5a23b7.1920x1080.jpg?t=1751460481",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/764790/ss_105fd3de6a4dbf2cb848f2c265212ae3eb7434e5.1920x1080.jpg?t=1751460481",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/764790/ss_8dd705de7ce4ae51d6f6c70fa577fbb3232c0ce0.1920x1080.jpg?t=1751460481",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/764790/ss_480583aad07967ee7792e15528d1493280e904b2.1920x1080.jpg?t=1751460481",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/764790/ss_9b2577846d890f6fd008bfe465322126b5ce1c54.1920x1080.jpg?t=1751460481"
    ],
    "hints": {
      "tagline": {
        "fr": "Livrez un parchemin sacré pour sauver votre clan dans ce jeu de ninja virtuose oscillant entre 8-bit et 16-bit.",
        "en": "As a demon army besieges his village, a young ninja ventures through a cursed world to deliver a scroll paramount to his clan's survival.",
        "es": "Un joven ninja viaja a través de un mundo maldito entre eras de 8 y 16 bits para entregar un pergamino vital.",
        "de": "Ein meisterhaftes Ninja-Actionspiel, das nahtlos zwischen klassischem 8-Bit und prachtvollem 16-Bit wechselt.",
        "ja": "一族を救う巻物を届けるため、8ビットと16ビットの時空を行き来する爽快忍者アクションアドベンチャー。",
        "pt-BR": "Entregue um pergaminho sagrado entre eras de 8 e 16 bits nesta magistral aventura ninja de ação."
      },
      "composer": "Rainbowdragoneyes"
    }
  },
  {
    "id": "spiritfarer",
    "title": "Spiritfarer: Farewell Edition",
    "releaseYear": 2020,
    "genre": [
      "Gestion",
      "Aventure",
      "Cozy",
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
    "developer": "Thunder Lotus Games",
    "steamUrl": "https://store.steampowered.com/app/972660/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/972660/ss_a751970e68bc928538fbc4f52d6090c6ff1d8974.1920x1080.jpg?t=1752503178",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/972660/ss_6ae155cb7c5f65f46a8f0dc43ba57aff8f57616c.1920x1080.jpg?t=1752503178",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/972660/ss_cb5c5af0cdef3ec3a5317c162c32e956ec7aa76b.1920x1080.jpg?t=1752503178",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/972660/ss_5a2001d7df99bfe5f2a77b45e62560ad71b8c329.1920x1080.jpg?t=1752503178",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/972660/ss_8ca8378ece2771a04e5d435a3a92d9f57c0d9f24.1920x1080.jpg?t=1752503178",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/972660/ss_13be8ec2a11cf1f012abbbe9d526447cfff6cdea.1920x1080.jpg?t=1752503178"
    ],
    "hints": {
      "tagline": {
        "fr": "Accompagnez des âmes errantes vers l'au-delà à bord de votre bateau dans une fable douce et bienveillante.",
        "en": "A cozy management game about dying. Build a boat to explore the world, care for your spirit friends, and release them into the afterlife.",
        "es": "Un entrañable juego de gestión sobre la muerte. Cuida a tus amigos espíritus antes de guiarlos al más allá.",
        "de": "Ein warmherziges Managementspiel über das Abschiednehmen. Begleite Geisterseelen liebevoll ins Jenseits.",
        "ja": "迷える魂たちを船に乗せて世話をし、安らかな旅立ちを見届ける優しさと愛に満ちた癒しの航海アドベンチャー。",
        "pt-BR": "Acolha almas em seu barco e guie-as para o além nesta emocionante e acolhedora fábula de despedida."
      },
      "composer": "Maxime Lacoste-Lebuis"
    }
  },
  {
    "id": "oxygen-not-included",
    "title": "Oxygen Not Included",
    "releaseYear": 2019,
    "genre": [
      "Colony Sim",
      "Gestion",
      "Survie",
      "Simulation"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
    },
    "developer": "Klei Entertainment",
    "steamUrl": "https://store.steampowered.com/app/457140/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/457140/ss_78d1c92edeecc7b17cafa9248867fe7d4390a0a0.1920x1080.jpg?t=1789589869",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/457140/ss_67ab224dd8c781d5a27ee52657173298873d439a.1920x1080.jpg?t=1789589869",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/457140/ss_ba2b8c362327add29b08182d13b04bf502e065cd.1920x1080.jpg?t=1789589869",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/457140/ss_c5e20abaf2c82f9156da9c80b2ec7c0aefc46254.1920x1080.jpg?t=1789589869",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/457140/ss_24a4ffeaf41ea6d782fef203177243d36c185506.1920x1080.jpg?t=1789589869",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/457140/ss_02af9f36ca186bba1d0f2d5819d169e741076b46.1920x1080.jpg?t=1789589869"
    ],
    "hints": {
      "tagline": {
        "fr": "Gérez l'oxygène, la plomberie et la thermodynamique pour faire prospérer une colonie spatiale souterraine.",
        "en": "A space-colony simulation game where you manage oxygen, resources, and temperature deep inside an alien rock.",
        "es": "Gestiona oxígeno, temperatura y recursos para hacer prosperar una colonia espacial subterránea.",
        "de": "Baue eine blühende Kolonie im Inneren eines Asteroiden und meistere Sauerstoff, Druck und Thermodynamik.",
        "ja": "小惑星の地下深くで酸素や水流、温度を精密に管理し、入植者たちを繁栄させる本格コロニーシミュレーション。",
        "pt-BR": "Gerencie oxigênio, encanamento e temperatura para prosperar uma colônia espacial nas profundezas de um asteroide."
      },
      "composer": "Vince de Jorba"
    }
  },
  {
    "id": "to-the-moon",
    "title": "To the Moon",
    "releaseYear": 2011,
    "genre": [
      "Narratif",
      "Aventure",
      "RPG"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
      "en": "2D Top-down"
    },
    "developer": "Freebird Games",
    "steamUrl": "https://store.steampowered.com/app/206440/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/206440/ss_9885a7091273a238f86165b85350d35fec639c3f.1920x1080.jpg?t=1780927584",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/206440/ss_5e021433f5a32ec7ad031ce61c52c1ba4b2ecf9f.1920x1080.jpg?t=1780927584",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/206440/ss_23b844b452cacfaaef177f78f99793ae527bb273.1920x1080.jpg?t=1780927584",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/206440/ss_0135a9334d5c3493e9f3b769288d78c9e3bebfcf.1920x1080.jpg?t=1780927584",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/206440/ss_0a25120991ec89dc4272d5020dc08d9de1e42156.1920x1080.jpg?t=1780927584",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/206440/ss_1ad788262b8d672b5fd70299320c5c2323ba15ef.1920x1080.jpg?t=1780927584"
    ],
    "hints": {
      "tagline": {
        "fr": "Explorez les souvenirs d'un vieillard mourant pour exaucer son ultime vœu : voyager sur la Lune.",
        "en": "A story-driven experience about two doctors traversing backwards through the memories of a dying man to fulfill his last wish.",
        "es": "Una conmovedora historia sobre dos médicos que viajan por los recuerdos de un anciano para cumplir su último deseo.",
        "de": "Reise rückwärts durch die Erinnerungen eines sterbenden Mannes, um seinen Lebenstraum vom Mond zu erfüllen.",
        "ja": "人生の最期を迎える老人の記憶を過去へと遡り、月へ行くという生涯の願いを叶える感動の名作ストーリーRPG。",
        "pt-BR": "Viaje pelas memórias de um senhor em seus últimos dias para realizar seu último desejo: ir à Lua."
      },
      "composer": "Kan Gao"
    }
  },
  {
    "id": "gorogoa",
    "title": "Gorogoa",
    "releaseYear": 2017,
    "genre": [
      "Puzzle",
      "Aventure",
      "Méditatif"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "Buried Signal",
    "steamUrl": "https://store.steampowered.com/app/557600/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/557600/ss_9493c2549394df3f4675078b1f6eab9f4d82d3bd.1920x1080.jpg?t=1729099787",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/557600/ss_ae5c2e784e2fab9b8512dd31b7e31300cf3241a6.1920x1080.jpg?t=1729099787",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/557600/ss_aa212d776cb3cd25316b3932c218c08f4843f4dd.1920x1080.jpg?t=1729099787",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/557600/ss_a2c2926eaf4b50ef6a329f3964d2ef2ea39f54d9.1920x1080.jpg?t=1729099787",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/557600/ss_5fc6c828c5455bb30d066b7a61bbba4a16748f66.1920x1080.jpg?t=1729099787"
    ],
    "hints": {
      "tagline": {
        "fr": "Glissez et imbriquez des vignettes illustrées à la main dans un chef-d'œuvre de puzzle visuel silencieux.",
        "en": "An elegant evolution of the puzzle genre, told through a beautifully hand-drawn story designed and illustrated by Jason Roberts.",
        "es": "Una elegante evolución del género de puzles con ilustraciones hechas a mano que se conectan de formas mágicas.",
        "de": "Ein kunstvolles, handgezeichnetes Meisterwerk, in dem du Bildtafeln verschiebst und faszinierende Zusammenhänge knüpfst.",
        "ja": "手描きの美しいパネルを重ねたり並べ替えたりしながら、静かに紡がれる物語を解き明かす革新的パズルアート。",
        "pt-BR": "Mova e sobreponha ilustrações feitas à mão em um quebra-cabeça visual silencioso e inovador."
      },
      "composer": "Joel Corelitz"
    }
  },
  {
    "id": "baba-is-you",
    "title": "Baba Is You",
    "releaseYear": 2019,
    "genre": [
      "Puzzle",
      "Exploration",
      "Stratégie",
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
    "developer": "Hempuli",
    "steamUrl": "https://store.steampowered.com/app/736260/",
    "itchUrl": "https://hempuli.itch.io/baba-is-you",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/736260/ss_908c8a4fd0ffec9f29341eb50eb7f074c105342f.1920x1080.jpg?t=1760102539",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/736260/ss_9eadb1cdc09f574d49d32a722d7bda5813c96a64.1920x1080.jpg?t=1760102539",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/736260/ss_c535fc337bdb15bfe35a164cc13db7ec92fd1f44.1920x1080.jpg?t=1760102539",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/736260/ss_e421ba3fb93e902eb4af05564ebf3afcabaae951.1920x1080.jpg?t=1760102539",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/736260/ss_4e489dcc482e3f094cd8caf0a10317fdc71345af.1920x1080.jpg?t=1760102539",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/736260/ss_ac1cc1552628933847698ea79ec65bd8531b4274.1920x1080.jpg?t=1760102539"
    ],
    "hints": {
      "tagline": {
        "fr": "Réécrivez les lois de la physique et les règles du jeu en déplaçant des blocs de mots logiques.",
        "en": "A puzzle game where the rules you have to follow are present as blocks you can interact with. Change the rules to win!",
        "es": "Un juego de lógica donde las reglas existen como bloques físicos que puedes cambiar para alterar la realidad.",
        "de": "Ein geniales Rätselspiel, in dem du die Spielregeln selbst als Wörter verschieben und die Welt neu definieren kannst.",
        "ja": "ルールそのものが言葉のブロックとして置かれた世界で、法則を書き換えて勝利を掴む天才的ひらめきパズル。",
        "pt-BR": "Reescreva as regras da física e a lógica do jogo empurrando blocos de palavras neste quebra-cabeça genial."
      },
      "composer": "Arvi Teikari"
    }
  },
  {
    "id": "dusk",
    "title": "Dusk",
    "releaseYear": 2018,
    "genre": [
      "Fast-FPS",
      "Action",
      "Rétro",
      "Horreur"
    ],
    "artStyle": {
      "fr": "3D Rétro Low-poly",
      "en": "Retro Low-poly 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "David Szymanski",
    "steamUrl": "https://store.steampowered.com/app/519860/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/519860/ss_1ed571301ad0b5f952fc4e793d7357084405c467.1920x1080.jpg?t=1767216306",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/519860/ss_e2f865387e9e82dbb80be51a58ab7473d825be6f.1920x1080.jpg?t=1767216306",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/519860/ss_b2668c79d271be9b62a988682e30683ac8e5f410.1920x1080.jpg?t=1767216306",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/519860/ss_c06144635326bc14ee7ee3ab07c2f5b00248d499.1920x1080.jpg?t=1767216306",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/519860/ss_042aeeb45c1ac9988e0df38af58755d099ba9bfb.1920x1080.jpg?t=1767216306",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/519860/ss_9aee1812cc88cd8e9b2ca66b32029049dddad665.1920x1080.jpg?t=1767216306"
    ],
    "hints": {
      "tagline": {
        "fr": "Pulvérisez des cultistes fanatiques au double fusil de chasse dans un Fast-FPS rétro ultra-rapide.",
        "en": "Battle through an onslaught of mystical cultists, possessed militants and darker forces in this retro FPS homage.",
        "es": "Aniquila a sectarios fanáticos con escopetas dobles en este brutal y vertiginoso homenaje a los FPS clásicos.",
        "de": "Zerschmettere finstere Kultisten und Monster mit zwei Schrotflinten in einem rasanten 90er-Retro-Shooter.",
        "ja": "二連装ショットガンを手に、狂信的なカルト教団の群れを電光石火のスピードで殲滅する本格90年代レトロFPS。",
        "pt-BR": "Aniquile cultistas fanáticos e horrores ocultos com escopetas duplas neste frenético FPS retrô."
      },
      "composer": "Andrew Hulshult"
    }
  },
  {
    "id": "valheim",
    "title": "Valheim",
    "releaseYear": 2021,
    "genre": [
      "Survie",
      "Co-op",
      "Sandbox",
      "Aventure"
    ],
    "artStyle": {
      "fr": "3D Rétro Low-poly",
      "en": "Retro Low-poly 3D"
    },
    "camera": {
      "fr": "Troisième personne",
      "en": "Third-Person"
    },
    "developer": "Iron Gate Studio",
    "steamUrl": "https://store.steampowered.com/app/892970/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/892970/5a31353178f635b67f0c8720ebb8a1a95b637276/ss_5a31353178f635b67f0c8720ebb8a1a95b637276.1920x1080.jpg?t=1789470462",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/892970/bc7c361dab1780543a3ceca50c8fba831e5bc8db/ss_bc7c361dab1780543a3ceca50c8fba831e5bc8db.1920x1080.jpg?t=1789470462",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/892970/ss_a600a7d4ca954543e22f571a9629521a13f82143.1920x1080.jpg?t=1789470462",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/892970/f7a47b4bd150ce1a2c6ec88f7d79fd57e7c538c8/ss_f7a47b4bd150ce1a2c6ec88f7d79fd57e7c538c8.1920x1080.jpg?t=1789470462",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/892970/ss_cd0262c5abf8a90ee5e1059acafc5a92b6be0e73.1920x1080.jpg?t=1789470462",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/892970/ss_3db385fc1223914dadb199ac8682683a8c59454e.1920x1080.jpg?t=1789470462"
    ],
    "hints": {
      "tagline": {
        "fr": "Forgez vos armes, bâtissez d'immenses forteresses et terrassez les monstres primordiaux au nom d'Odin.",
        "en": "A brutal exploration and survival game for 1-10 players, set in a procedurally-generated purgatory inspired by Viking culture.",
        "es": "Un desafiante juego de exploración y supervivencia vikinga en un vasto purgatorio procedural.",
        "de": "Erkunde, baue und kämpfe in einer rauen, von der Wikingerkultur inspirierten Welt für die Gunst Odins.",
        "ja": "北欧神話の第十世界を舞台に、仲間とともに巨大な城塞を築き太古の巨神たちを討つバイキングサバイバルRPG。",
        "pt-BR": "Forje armas, construa fortalezas vikings e derrote feras primordiais em nome de Odin."
      },
      "composer": "Patrik Jarlestam"
    }
  },
  {
    "id": "superhot",
    "title": "SUPERHOT",
    "releaseYear": 2016,
    "genre": [
      "Fast-FPS",
      "Action",
      "Puzzle"
    ],
    "artStyle": {
      "fr": "Monochrome / Minimaliste",
      "en": "Monochrome"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "SUPERHOT Team",
    "steamUrl": "https://store.steampowered.com/app/322500/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/322500/ss_ae4a994de7b15e3cec3e56ae714cf7a44c7188cf.1920x1080.jpg?t=1726509130",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/322500/ss_1e3ef7d9d9654c6189e6680502a0ce3068d1aef7.1920x1080.jpg?t=1726509130",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/322500/ss_fbd718c60719f045e4e4ee1d23d159ecabb3a171.1920x1080.jpg?t=1726509130",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/322500/ss_7d2f3db42595a665912155fa44a9b65f807fd483.1920x1080.jpg?t=1726509130",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/322500/ss_82e641a68d684effec7b1c9ad5d17a70f9cb82ea.1920x1080.jpg?t=1726509130",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/322500/ss_98b769b11caf672fda92891b325c9a3525bff2d7.1920x1080.jpg?t=1726509130"
    ],
    "hints": {
      "tagline": {
        "fr": "Le temps n'avance que lorsque vous bougez : planifiez chaque tir et chaque esquive dans ce FPS chorégraphié.",
        "en": "The smash-hit FPS where time moves only when you move. No regenerating health bars. No conveniently placed ammo drops.",
        "es": "El innovador shooter en primera persona donde el tiempo solo se mueve cuando tú te mueves.",
        "de": "Der innovative Zeitlupen-FPS, in dem die Zeit nur vergeht, wenn du dich bewegst. Pure kinetische Eleganz.",
        "ja": "自分が動く時だけ時間が進む。銃弾を優雅にかわし、敵の武器を奪って倒す究極のタイムコントロールFPS。",
        "pt-BR": "O tempo só se move quando você se move neste inovador FPS coreografado de estratégia e reflexos."
      },
      "composer": "SUPERHOT Team"
    }
  },
  {
    "id": "slime-rancher",
    "title": "Slime Rancher",
    "releaseYear": 2017,
    "genre": [
      "Simulation",
      "Aventure",
      "Cozy",
      "Exploration"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "Monomi Park",
    "steamUrl": "https://store.steampowered.com/app/433340/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/433340/ss_5339a74c4563d40a1d8a5638db2a9ed59c5b883b.1920x1080.jpg?t=1758651509",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/433340/ss_d0e6a30325a9f7ff4fb3d6ba344c4131bb5f98cb.1920x1080.jpg?t=1758651509",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/433340/ss_58bea16c1d3147c47b0b36cef82008b949c18d97.1920x1080.jpg?t=1758651509",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/433340/ss_e03a3526536a7da15dc1b89dc4e6285a87e8e2db.1920x1080.jpg?t=1758651509",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/433340/ss_d923566424cee1c6d82ccde7336b02057d3409fc.1920x1080.jpg?t=1758651509",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/433340/ss_633faaacb74e2da5baa356e0f18f9f73e777c4d2.1920x1080.jpg?t=1758651509"
    ],
    "hints": {
      "tagline": {
        "fr": "Aspirez, nourrissez et élevez d'adorables slimes rebondissants à des années-lumière de la Terre.",
        "en": "Explore a vast, alien frontier, collect colorful bouncy slimes, grow crops, and harvest plorts in this colorful sandbox.",
        "es": "Explora una colorida frontera alienígena, cría adorables slimes saltarines y amasa una gran fortuna.",
        "de": "Züchte und füttere putzige, hüpfende Schleime auf einer bunten fernen Alien-Farm in der ersten Person.",
        "ja": "掃除機型バックパックで色とりどりのプルプルしたスライムを集めて育てる、ほのぼの惑星牧場アドベンチャー。",
        "pt-BR": "Aspire, alimente e crie adoráveis slimes saltitantes em uma colorida fronteira alienígena."
      },
      "composer": "Harry Mack"
    }
  },
  {
    "id": "kingdom-two-crowns",
    "title": "Kingdom Two Crowns",
    "releaseYear": 2018,
    "genre": [
      "Stratégie",
      "Gestion",
      "Co-op"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
    },
    "developer": "Fury Studios",
    "steamUrl": "https://store.steampowered.com/app/701160/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/701160/ss_ca9df45386d8ead4a0cf62a16c2524095a610f6c.1920x1080.jpg?t=1789557974",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/701160/ss_fb33eeb33590f492c39c714fd673e059599895a5.1920x1080.jpg?t=1789557974",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/701160/ss_7b16a9ab8f9498ec1a28507120ab3ae7eb7c7217.1920x1080.jpg?t=1789557974",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/701160/ss_55d314b0e9f6f52a34d03a5851fedbf3f13b3ff8.1920x1080.jpg?t=1789557974",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/701160/1b1bdd1e3fc0b508cd3ef86dfc555bf520c5bf57/ss_1b1bdd1e3fc0b508cd3ef86dfc555bf520c5bf57.1920x1080.jpg?t=1789557974",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/701160/ss_e5516ce05a5fdc5ea88e2342a568e8cc611269cd.1920x1080.jpg?t=1789557974"
    ],
    "hints": {
      "tagline": {
        "fr": "Montez sur votre destrier, distribuez des pièces d'or et défendez votre royaume insulaire contre les Rapaces nocturnes.",
        "en": "Build your kingdom and secure it from the threat of the Greed in the award-winning micro-strategy series.",
        "es": "Erige tu reino, recluta súbditos leales y defiéndelo del ataque nocturno de la Avaricia a caballo.",
        "de": "Baue dein Königreich zu Pferde auf und verteidige es Nacht für Nacht gegen die finstere Gier.",
        "ja": "愛馬に跨がりコインを配って臣民を導き、夜な夜な襲来する魔物の軍勢から島を守るミニマル戦略ゲーム。",
        "pt-BR": "Monte seu cavalo, invista moedas e proteja seu reino contra os ataques noturnos da Ganância."
      },
      "composer": "Amos Roddy"
    }
  },
  {
    "id": "neon-white",
    "title": "Neon White",
    "releaseYear": 2022,
    "genre": [
      "Fast-FPS",
      "Platformer",
      "Action"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "Angel Matrix",
    "steamUrl": "https://store.steampowered.com/app/1533420/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1533420/ss_d8c2c0eb97bc25344f24da92e55b6420ca94c607.1920x1080.jpg?t=1785424399",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1533420/ss_27ea65326988eeeaa504bb8c0d2c892aae894b57.1920x1080.jpg?t=1785424399",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1533420/ss_38fc87620e7706535193143404488e5c10863813.1920x1080.jpg?t=1785424399",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1533420/ss_7ebe34f5d96739a0901619b31b8f5a2a1c43bc50.1920x1080.jpg?t=1785424399",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1533420/ss_ca814762dba95590d9dc0aca6bd1add9de5fe0f6.1920x1080.jpg?t=1785424399"
    ],
    "hints": {
      "tagline": {
        "fr": "Exterminez les démons du Paradis à la vitesse de l'éclair à l'aide de cartes d'âmes dans ce speedrunner culte.",
        "en": "Neon White is a lightning-fast first-person action game about exterminating demons in Heaven.",
        "es": "Un juego de acción en primera persona frenético donde aniquilas demonios en el Cielo usando cartas de velocidad.",
        "de": "Jage blitzschnell Dämonen im Paradies mit kartenbasierten Waffen in diesem gefeierten Speedrunner-FPS.",
        "ja": "天国の悪魔たちを魂のカードで神速のごとく殲滅し、最短ルートを極めるハイスピード・スピードランFPS。",
        "pt-BR": "Extermine demônios no Paraíso na velocidade da luz usando cartas de almas neste speedrunner frenético."
      },
      "composer": "Machine Girl"
    }
  },
  {
    "id": "ghostrunner",
    "title": "Ghostrunner",
    "releaseYear": 2020,
    "genre": [
      "Action",
      "Cyberpunk",
      "Fast-FPS"
    ],
    "artStyle": {
      "fr": "3D Réaliste",
      "en": "Realistic 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "One More Level",
    "steamUrl": "https://store.steampowered.com/app/1139900/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1139900/ss_6f7ea1399cdf74cfafb0ddbf397ccb1f04f2bb04.1920x1080.jpg?t=1786099137",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1139900/ss_b3685fcab4d6f60c9fd54ffe8757ccaaef803d9e.1920x1080.jpg?t=1786099137",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1139900/ss_8f6b985f8568ccca30ddfe28b9b26fcf4468eaa5.1920x1080.jpg?t=1786099137",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1139900/ss_4df66f282c6aed12f941b3f7eb4c6fc3de3a8ea8.1920x1080.jpg?t=1786099137",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1139900/ss_8f91ee2a403f257dce6ad4b199c4ef2079bb09ca.1920x1080.jpg?t=1786099137",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1139900/ss_c2c721768fa6759bb9d0fe0c39e86aa27ed80d10.1920x1080.jpg?t=1786099137"
    ],
    "hints": {
      "tagline": {
        "fr": "Fendez l'air et découpez vos ennemis au katana en grimpant une tour cyberpunk oppressante.",
        "en": "Ghostrunner offers a unique single-player experience: fast-paced, violent combat, and an original setting that blends science fiction with post-apocalyptic themes.",
        "es": "Asciende por una megatorre cyberpunk aniquilando enemigos al instante con tu katana en combates vertiginosos.",
        "de": "Kämpfe dich mit Katana und Kletterhaken im Affenzahn durch eine dystopische Cyberpunk-Megastruktur.",
        "ja": "サイバーパンクの巨大都市タワーをパルクールで駆け上がり、一撃必殺の刀で敵を切り捨てる電光石火アクション。",
        "pt-BR": "Corte o ar e fatie inimigos com sua katana enquanto escala uma megatorre cyberpunk implacável."
      },
      "composer": "Daniel Deluxe"
    }
  },
  {
    "id": "darkest-dungeon-2",
    "title": "Darkest Dungeon II",
    "releaseYear": 2023,
    "genre": [
      "Roguelike",
      "Tour par tour",
      "Dark Fantasy",
      "RPG"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
    },
    "developer": "Red Hook Studios",
    "steamUrl": "https://store.steampowered.com/app/1940340/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1940340/ss_bc4c7aec5704ed4108a181ec9a790c3fea4a9f12.1920x1080.jpg?t=1759351183",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1940340/ss_254e72f3356e62496b02c1faf7852bb5053e0338.1920x1080.jpg?t=1759351183",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1940340/ss_19b4a3415f5c4167121cb2acd12b7d6d90555e2c.1920x1080.jpg?t=1759351183",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1940340/ss_9fab75b3c27e5dfc4b55a105b457623d0a76f924.1920x1080.jpg?t=1759351183",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1940340/ss_7c63e2d7ec491bf2b4a94209742a75b869b47814.1920x1080.jpg?t=1759351183",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1940340/ss_e25bc022fa98e7b235eb7146a3e54507893f3ab0.1920x1080.jpg?t=1759351183"
    ],
    "hints": {
      "tagline": {
        "fr": "Traversez un monde à l'agonie à bord d'une diligence pour prévenir l'apocalypse dans ce road-trip rogue-lite.",
        "en": "A roguelike road trip of the damned. Form a party, equip your stagecoach, and set off across the decaying landscape.",
        "es": "Un viaje roguelike desesperado en diligencia a través de un mundo en ruinas para evitar el apocalipsis.",
        "de": "Führe eine zerbrechliche Truppe in einer Postkutsche durch eine zerfallende Welt voller Schrecken und Verdammnis.",
        "ja": "駅馬車に乗り込み、世界の終焉を食い止めるため絶望の荒野を突き進むダークファンタジー・ローグライトRPG。",
        "pt-BR": "Viaje por um mundo agonizante em uma carruagem sombria para conter o apocalipse neste RPG tático."
      },
      "composer": "Stuart Chatwood"
    }
  },
  {
    "id": "tinykin",
    "title": "Tinykin",
    "releaseYear": 2022,
    "genre": [
      "Platformer",
      "Aventure",
      "Exploration"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Troisième personne",
      "en": "Third-Person"
    },
    "developer": "Splashteam",
    "steamUrl": "https://store.steampowered.com/app/1599020/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1599020/ss_a2beb6a28dc775403399e1add5c37d17ac2e4cb8.1920x1080.jpg?t=1784211806",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1599020/ss_6125cf9aca7965264a5ace6fe347314dc59e8bb1.1920x1080.jpg?t=1784211806",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1599020/ss_3659426586b49eaba4f01c8f6a4de468288328fc.1920x1080.jpg?t=1784211806",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1599020/ss_33d06f2ee9bf6825f06adec09f1434e8aef5e2b0.1920x1080.jpg?t=1784211806",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1599020/ss_e3a0af7a60de8f3c3b767bc5489fdeedd66b14a2.1920x1080.jpg?t=1784211806",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1599020/ss_9430a6cdb1b2f9278e1c7408023e9d065646c552.1920x1080.jpg?t=1784211806"
    ],
    "hints": {
      "tagline": {
        "fr": "Capturez des centaines de créatures miniatures pour bâtir des échelles et explorer une maison géante des années 90.",
        "en": "Catch hundreds of tinykin and use their unique powers to create ladders, build bridges, and explore a giant house.",
        "es": "Atrapa a cientos de diminutas criaturas para construir escaleras, puentes y explorar una gigantesca casa.",
        "de": "Fange winzige, fleißige Wesen und nutze ihre Kräfte, um ein riesiges 90er-Jahre-Haus zu erkunden.",
        "ja": "個性豊かな小さな生き物「タイニーキン」を指揮し、巨大な屋敷の部屋中を大冒険する3Dパズルアクション。",
        "pt-BR": "Colete centenas de criaturinhas para construir escadas e explorar uma casa gigantesca dos anos 90."
      },
      "composer": "Alexis Laugier"
    }
  },
  {
    "id": "dorfromantik",
    "title": "Dorfromantik",
    "releaseYear": 2022,
    "genre": [
      "City Builder",
      "Puzzle",
      "Cozy",
      "Gestion"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Isométrique / 2.5D",
      "en": "Isometric / 2.5D"
    },
    "developer": "Toukana Interactive",
    "steamUrl": "https://store.steampowered.com/app/1455840/",
    "itchUrl": "https://toukana.itch.io/dorfromantik",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1455840/ss_a49e5fcc5301e8a05a1da7ce233a5377cf680e98.1920x1080.jpg?t=1786951108",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1455840/ss_5388583373f0895184a83c4db492e6f6dff5af2d.1920x1080.jpg?t=1786951108",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1455840/ss_2232950021d44e7fab5ca387470d4dd909548080.1920x1080.jpg?t=1786951108",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1455840/ss_7ea026a23427e733f6aa3b88bd1f06c1ad465852.1920x1080.jpg?t=1786951108",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1455840/ss_137bc5e9ff3d2e08bed463e8ea2d09d8f255fe2e.1920x1080.jpg?t=1786951108",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1455840/ss_7e3751efef33d4ceb3563b28d9f1f1f19612e0b6.1920x1080.jpg?t=1786951108"
    ],
    "hints": {
      "tagline": {
        "fr": "Disposez des tuiles hexagonales bucoliques pour créer des paysages idylliques dans ce puzzle relaxant.",
        "en": "A peaceful building strategy and puzzle game where you create an ever-expanding, idyllic village landscape.",
        "es": "Un relajante juego de estrategia y puzles donde colocas losetas hexagonales para crear hermosos paisajes.",
        "de": "Ein friedvolles Aufbauspiel, in dem du durch das geschickte Platzieren von Kacheln idyllische Landschaften erschaffst.",
        "ja": "六角形のタイルを並べて村や森、川を広げ、穏やかな田園風景を創り上げる心安らぐ癒しのパズルゲーム。",
        "pt-BR": "Encaixe ladrilhos hexagonais para criar paisagens campestres idílicas neste relaxante quebra-cabeça."
      },
      "composer": "Laryssa Okada"
    }
  },
  {
    "id": "unpacking",
    "title": "Unpacking",
    "releaseYear": 2021,
    "genre": [
      "Cozy",
      "Puzzle",
      "Narratif"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Isométrique / 2.5D",
      "en": "Isometric / 2.5D"
    },
    "developer": "Witch Beam",
    "steamUrl": "https://store.steampowered.com/app/1135690/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1135690/ss_b32bfdd3f68e1f9e264bd37e10a464629ca034f8.1920x1080.jpg?t=1789426289",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1135690/ss_9b358510285a4b70e446237de5996bc434415c01.1920x1080.jpg?t=1789426289",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1135690/ss_8ad1858b98d2a04212a44b65ce2ae199e02a87cd.1920x1080.jpg?t=1789426289",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1135690/ss_e0be82259f402c277973c5d0c4f2a22d01d9b1c2.1920x1080.jpg?t=1789426289",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1135690/ss_e63c93af0d56632ed0c6ddb0e566725dbb0e9f3a.1920x1080.jpg?t=1789426289",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1135690/ss_2066e90763952aac24e03657038977abcf1f7453.1920x1080.jpg?t=1789426289"
    ],
    "hints": {
      "tagline": {
        "fr": "Déballez des cartons pour meubler des chambres et découvrez la vie intime de son occupante au fil des déménagements.",
        "en": "A zen puzzle game about the familiar experience of pulling possessions out of boxes and fitting them into a new room.",
        "es": "Un juego de puzles relajante sobre sacar pertenencias de cajas y colocarlas en nuevas habitaciones a lo largo de los años.",
        "de": "Ein wunderbar entspannendes Puzzlespiel über das Auspacken von Umzugskartons und das Erzählen einer Lebensgeschichte.",
        "ja": "引っ越しの段ボールを開けて持ち物を部屋に並べながら、持ち主の人生の軌跡を静かに見つめる禅パズルゲーム。",
        "pt-BR": "Desembale caixas para organizar quartos e acompanhe a história íntima de uma vida a cada mudança."
      },
      "composer": "Jeff van Dyck"
    }
  },
  {
    "id": "a-little-to-the-left",
    "title": "A Little to the Left",
    "releaseYear": 2022,
    "genre": [
      "Cozy",
      "Puzzle",
      "Méditatif"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "Max Inferno",
    "steamUrl": "https://store.steampowered.com/app/1629520/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1629520/ss_dfd3c87efd52db3ea48b4de22de569bd9eb42ca2.1920x1080.jpg?t=1789552143",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1629520/ss_830a67e3cace3216bfb5b591b86a441fce3bc6fb.1920x1080.jpg?t=1789552143",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1629520/ss_503c02f55a3e873a0bd5a177aee5a07c462b27b8.1920x1080.jpg?t=1789552143",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1629520/ss_fd61e2eff377c9ecae9ea5ade13876d88eef9e47.1920x1080.jpg?t=1789552143",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1629520/ss_d6cbf5f38a4d14b673f8d7e2cc595a3da3a18dd6.1920x1080.jpg?t=1789552143",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1629520/ss_e6cd2f2ed8d46c018fd78ad0857478156380caf9.1920x1080.jpg?t=1789552143"
    ],
    "hints": {
      "tagline": {
        "fr": "Rangez, triez et empilez des objets du quotidien avec un chat malicieux qui adore tout déranger.",
        "en": "A cozy puzzle game that has you sort, stack, and organize household items into pleasing arrangements with a mischievous cat.",
        "es": "Un acogedor juego de puzles donde ordenas y apilas objetos cotidianos mientras un travieso gato intenta estorbarte.",
        "de": "Sortiere, staple und ordne Haushaltsgegenstände harmonisch an, während eine verspielte Katze für Chaos sorgt.",
        "ja": "引き出しや棚の小物をきれいに整理整頓する、いたずら好きな猫の邪魔が入る心和む片付けパズルゲーム。",
        "pt-BR": "Arrume, organize e empilhe objetos do cotidiano enquanto um gato travesso tenta desarrumar tudo."
      },
      "composer": "Justin Bell"
    }
  },
  {
    "id": "the-talos-principle",
    "title": "The Talos Principle",
    "releaseYear": 2014,
    "genre": [
      "Puzzle",
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
    "developer": "Croteam",
    "steamUrl": "https://store.steampowered.com/app/257510/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257510/ss_8061dc63743404a7829eabdd47590421652c318d.1920x1080.jpg?t=1744327639",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257510/ss_56f8a07f7c2ac684cfec3b17bc0668c24b905b4b.1920x1080.jpg?t=1744327639",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257510/ss_3f16d21674b27dad893ccb27b581670b5bb8043a.1920x1080.jpg?t=1744327639",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257510/ss_bf869965e8e972acb4dfe3f8d4bf7baa2c2cdf29.1920x1080.jpg?t=1744327639",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257510/ss_ded5cd1a34df5b4d9015f71caf35db247b2579c4.1920x1080.jpg?t=1744327639",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257510/ss_b42acabe63d45a11580a2949e34f305e1bd10fc7.1920x1080.jpg?t=1744327639"
    ],
    "hints": {
      "tagline": {
        "fr": "Résolvez des énigmes philosophiques complexes avec des lasers et des clones au service d'une IA créatrice.",
        "en": "A philosophical first-person puzzle game where you solve increasingly complex laser riddles amidst ancient ruins.",
        "es": "Un juego filosófico de puzles en primera persona donde resuelves acertijos de láseres entre ruinas antiguas.",
        "de": "Löse anspruchsvolle philosophische Rätsel mit Laserstrahlen und Klonen in einer Welt voller antiker Ruinen.",
        "ja": "古代の遺跡と高度なテクノロジーが融合した仮想世界で、レーザーや反射器を用いて自己の存在を問う哲学パズル。",
        "pt-BR": "Resolva enigmas filosóficos com lasers e clones temporais em meio a ruínas antigas e tecnologia futurista."
      },
      "composer": "Damjan Mravunac"
    }
  },
  {
    "id": "the-talos-principle-2",
    "title": "The Talos Principle 2",
    "releaseYear": 2023,
    "genre": [
      "Puzzle",
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
    "developer": "Croteam",
    "steamUrl": "https://store.steampowered.com/app/835960/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/835960/ss_97419974d92d1699357f950d452925852080a372.1920x1080.jpg?t=1775138468",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/835960/ss_4f849d7ecfa4a7bf7d3f181fb797eecebf6f3bc2.1920x1080.jpg?t=1775138468",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/835960/ss_3aa4b4a649800952141ecfee0c9b046c30554f44.1920x1080.jpg?t=1775138468",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/835960/ss_50ef9c47289f15137be62db739d754979a54d6ec.1920x1080.jpg?t=1775138468",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/835960/ss_de7044dd268994b6deb30106ee28a41de405aaf4.1920x1080.jpg?t=1775138468",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/835960/ss_9822028978b61e262399e0b4456730e3a11e5bee.1920x1080.jpg?t=1775138468"
    ],
    "hints": {
      "tagline": {
        "fr": "Explorez une cité d'androïdes et des mégastructures mystérieuses dans cette suite philosophique monumentale.",
        "en": "A thought-provoking first-person puzzle experience that greatly expands on the first game's philosophical themes.",
        "es": "Una profunda experiencia de puzles en primera persona que expande los dilemas filosóficos del primer juego.",
        "de": "Erkunde monumentale Megastrukturen und diskutiere philosophische Fragen über die Zukunft der künstlichen Menschheit.",
        "ja": "ロボットたちが暮らす未来都市と壮大な巨石建造物を巡り、人類の未来と意識を思索する傑作パズルアドベンチャー。",
        "pt-BR": "Explore uma cidade de androides e megastruturas enigmáticas nesta grandiosa sequência filosófica."
      },
      "composer": "Damjan Mravunac"
    }
  },
  {
    "id": "pony-island",
    "title": "Pony Island",
    "releaseYear": 2016,
    "genre": [
      "Puzzle",
      "Horreur",
      "Psychologique"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "Daniel Mullins Games",
    "steamUrl": "https://store.steampowered.com/app/405640/",
    "itchUrl": "https://dmullinsgames.itch.io/pony-island",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/405640/ss_c9745cc5f077e5e49b83d3afc42337e187dcaae2.1920x1080.jpg?t=1784911389",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/405640/ss_03b5aa443d4ad92516543e24e70998d1b7d50549.1920x1080.jpg?t=1784911389",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/405640/ss_e037d9675e1ec881682d0c5b4bcb4c3159149718.1920x1080.jpg?t=1784911389",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/405640/ss_c064bce75252b2ad141b6afa2d39151eb196a6d6.1920x1080.jpg?t=1784911389",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/405640/ss_b38a055c62deb55c58e90d9ec7342180c0c32931.1920x1080.jpg?t=1784911389",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/405640/ss_d15b9dedb18844484796fe7127aa220acfd861a6.1920x1080.jpg?t=1784911389"
    ],
    "hints": {
      "tagline": {
        "fr": "Détournez le code d'une borne d'arcade possédée par Lucifer pour échapper à votre damnation éternelle.",
        "en": "Pony Island is a suspense puzzle game in disguise, trapped in a malfunctioning arcade machine devised by the devil.",
        "es": "Un juego de suspense y puzles oculto dentro de una máquina recreativa poseída por el mismísimo diablo.",
        "de": "Knacke den Code eines vom Teufel verfluchten Spielautomaten, um deiner ewigen Gefangenschaft zu entkommen.",
        "ja": "悪魔が作った不具合だらけのゲーム機に閉じ込められたプレイヤーが、コードをハックして脱出を図るメタパズル。",
        "pt-BR": "Invada o código de um fliperama possuído pelo diabo para escapar de uma danação eterna."
      },
      "composer": "Jonah Senzel"
    }
  },
  {
    "id": "world-of-goo",
    "title": "World of Goo",
    "releaseYear": 2008,
    "genre": [
      "Physique",
      "Puzzle",
      "Simulation"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
    },
    "developer": "2D BOY",
    "steamUrl": "https://store.steampowered.com/app/22000/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/22000/0000005585.1920x1080.jpg?t=1764881559",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/22000/0000005589.1920x1080.jpg?t=1764881559",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/22000/0000005588.1920x1080.jpg?t=1764881559",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/22000/0000005584.1920x1080.jpg?t=1764881559",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/22000/0000005583.1920x1080.jpg?t=1764881559",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/22000/0000005591.1920x1080.jpg?t=1764881559"
    ],
    "hints": {
      "tagline": {
        "fr": "Collez des boules gluantes pour ériger des tours, ponts et architectures branlantes défiant la gravité.",
        "en": "Drag and drop living, squirming, talking globs of goo to build structures, bridges, cannonballs, and giant towers.",
        "es": "Conecta bolas de baba vivas y temblorosas para construir torres, puentes y estructuras que desafían la gravedad.",
        "de": "Verbinde lebendige, klebrige Schleimbällchen zu erstaunlichen Brücken und wackligen Türmen in diesem Physik-Klassiker.",
        "ja": "プルプル動く不思議なグーの塊をつなぎ合わせ、巨大なタワーや橋を建設する伝説の物理パズルアクション。",
        "pt-BR": "Conecte bolinhas elásticas de gosma para construir pontes e torres fascinantes que desafiam a gravidade."
      },
      "composer": "Kyle Gabler"
    }
  },
  {
    "id": "furi",
    "title": "Furi",
    "releaseYear": 2016,
    "genre": [
      "Action",
      "Bullet Hell",
      "Hack and Slash"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Troisième personne",
      "en": "Third-Person"
    },
    "developer": "The Game Bakers",
    "steamUrl": "https://store.steampowered.com/app/423230/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/423230/ss_99a46681e5cbf7078be1e8cb22c7b885b6dcbc54.1920x1080.jpg?t=1769717975",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/423230/ss_6df6ec0ab472fffe1d18a4dce7ec9b91f44411cc.1920x1080.jpg?t=1769717975",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/423230/ss_e84d81c8fd6ab25f7f91e499e9ffe728e6ea5a90.1920x1080.jpg?t=1769717975",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/423230/ss_981ce381433948666cc6ed4c611f20cc3d567578.1920x1080.jpg?t=1769717975",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/423230/ss_8eb0947db73b59a2fb20e6a961362bc6eb909759.1920x1080.jpg?t=1769717975",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/423230/ss_c8e726dc261e4180224d5f0d459e609390594c8e.1920x1080.jpg?t=1769717975"
    ],
    "hints": {
      "tagline": {
        "fr": "Battez-vous pour reconquérir votre liberté dans une succession de duels de boss intenses combinant sabre et tir.",
        "en": "Fight your way free in this ultra-responsive, fast-paced sword-fighting and dual-stick shooting boss rush.",
        "es": "Lucha por tu libertad en una serie de duelos intensos contra jefes que combinan espada y disparos.",
        "de": "Kämpfe dich in atemberaubenden Boss-Duellen mit Katana und Schusswaffen deinen Weg in die Freiheit frei.",
        "ja": "自由を取り戻すため、銃と剣を手に立ちはだかるガーディアンたちと1対1で死闘を演じる緊迫のボスバトルアクション。",
        "pt-BR": "Lute pela sua liberdade em uma sucessão implacável de duelos com espada e tiros contra chefes memoráveis."
      },
      "composer": "Carpenter Brut"
    }
  },
  {
    "id": "haven",
    "title": "Haven",
    "releaseYear": 2020,
    "genre": [
      "RPG",
      "Aventure",
      "Co-op",
      "Sci-Fi"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Troisième personne",
      "en": "Third-Person"
    },
    "developer": "The Game Bakers",
    "steamUrl": "https://store.steampowered.com/app/983970/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/983970/ss_149d23880c846f5730b56d578e99efa366b9be69.1920x1080.jpg?t=1783017691",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/983970/ss_035809455a074db8107d2de0526591f8ee49e0bb.1920x1080.jpg?t=1783017691",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/983970/ss_d85749431725711359091cb94db17eaf38b37223.1920x1080.jpg?t=1783017691",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/983970/ss_9ed3e97d6ef028317c85bee8da0ec4eb4a29d73a.1920x1080.jpg?t=1783017691",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/983970/ss_f771e49842e27c5c5eca6c1e8f4d42cbc8b87096.1920x1080.jpg?t=1783017691",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/983970/ss_b5abf9c78d0629651887428c911ce7d3faa57512.1920x1080.jpg?t=1783017691"
    ],
    "hints": {
      "tagline": {
        "fr": "Partagez le quotidien d'un couple d'amoureux en fuite sur une planète oubliée dans un RPG poétique et fluide.",
        "en": "Two lovers gave up everything and fled to a lost planet to be together. Glide through a mysterious landscape.",
        "es": "Dos amantes lo dejaron todo para escapar juntos a un planeta perdido en este hermoso y fluido RPG.",
        "de": "Zwei Liebende sind auf einen verlassenen Planeten geflohen. Gleite über farbenfrohe Gräser und erkunde ihre Welt.",
        "ja": "愛し合う2人が全てを捨てて逃避行した未知の惑星で、滑空しながら絆を育む爽快でロマンチックなRPG。",
        "pt-BR": "Compartilhe o dia a dia de dois amantes fugitivos em um planeta esquecido neste poético e fluido RPG."
      },
      "composer": "DANGER"
    }
  },
  {
    "id": "wartales",
    "title": "Wartales",
    "releaseYear": 2023,
    "genre": [
      "RPG",
      "Stratégie",
      "Tactique",
      "Tour par tour",
      "Médiéval"
    ],
    "artStyle": {
      "fr": "3D Réaliste",
      "en": "Realistic 3D"
    },
    "camera": {
      "fr": "Isométrique / 2.5D",
      "en": "Isometric / 2.5D"
    },
    "developer": "Shiro Games",
    "steamUrl": "https://store.steampowered.com/app/1527950/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1527950/ss_09714a62ca142a8a1eb27fa5a408cfc168d9e786.1920x1080.jpg?t=1788942263",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1527950/ss_184553d9a5ca514c9fcb11cd8931d5e2f6635223.1920x1080.jpg?t=1788942263",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1527950/ss_e407391b8719bb941b74f6edec9f95f91e9c043b.1920x1080.jpg?t=1788942263",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1527950/ss_6654e16f9b86732b1be46f246bef63359219c02a.1920x1080.jpg?t=1788942263",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1527950/ss_1bfaa045d41a258ee7072078a55738f78a42cbf9.1920x1080.jpg?t=1788942263",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1527950/ss_70c3ff89b9d7552bf92d36e9abbdeca7ba9fd1e5.1920x1080.jpg?t=1788942263"
    ],
    "hints": {
      "tagline": {
        "fr": "Menez une troupe de mercenaires en quête de fortune dans un univers médiéval ravagé par la peste.",
        "en": "Lead a troop of mercenaries in their search for wealth and recognition across a medieval universe ravaged by plague.",
        "es": "Lidera a un grupo de mercenarios en su búsqueda de riqueza y prestigio en un universo medieval devastado.",
        "de": "Führe eine Söldnertruppe auf der Suche nach Ruhm und Reichtum durch eine finstere, von Seuchen geplagte Welt.",
        "ja": "疫病と貧困に喘ぐ中世の世界で、傭兵団を率いて富と名声を掴み取る重厚なオープンワールド戦術RPG。",
        "pt-BR": "Lidere um bando de mercenários em busca de ouro e respeito em um mundo medieval assolado pela peste."
      },
      "composer": "Shiro Games"
    }
  },
  {
    "id": "northgard",
    "title": "Northgard",
    "releaseYear": 2018,
    "genre": [
      "Stratégie",
      "Gestion",
      "Mythologie"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Isométrique / 2.5D",
      "en": "Isometric / 2.5D"
    },
    "developer": "Shiro Games",
    "steamUrl": "https://store.steampowered.com/app/466560/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/466560/ss_eb6ecfd37f68dc5cadabf603c4ab890d2a545730.1920x1080.jpg?t=1786542947",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/466560/e2677588df00827df20758e56f96a825f0f741fd/ss_e2677588df00827df20758e56f96a825f0f741fd.1920x1080.jpg?t=1786542947",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/466560/5452d42c32e21f999d2f2e29e312653d2344294d/ss_5452d42c32e21f999d2f2e29e312653d2344294d.1920x1080.jpg?t=1786542947",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/466560/e71a1c785c3864a22b2d507e3e511f2e15368812/ss_e71a1c785c3864a22b2d507e3e511f2e15368812.1920x1080.jpg?t=1786542947",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/466560/ss_13fc33e3ad933bac47419d80892ebaabfe502d8b.1920x1080.jpg?t=1786542947",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/466560/ss_d55c0b95e12e233ea529c1eb7d2b89a5af7ea1e4.1920x1080.jpg?t=1786542947"
    ],
    "hints": {
      "tagline": {
        "fr": "Fondez votre colonie viking et affrontez les rigueurs de l'hiver dans un jeu de stratégie nordique captivant.",
        "en": "Control a clan of Vikings vying for the control of a mysterious newfound continent in this RTS.",
        "es": "Controla a un clan de vikingos que lucha por el dominio de un nuevo y misterioso continente.",
        "de": "Führe deinen Wikinger-Clan durch harte Winter und feindliche Überfälle in diesem packenden Echtzeit-Strategiespiel.",
        "ja": "北欧神話の未知なる大陸でバイキングの部族を率い、厳しい冬を乗り越えて覇権を競うリアルタイム戦略ゲーム。",
        "pt-BR": "Funde sua colônia viking e enfrente os perigos do inverno e de feras mitológicas neste estratégico RTS nórdico."
      },
      "composer": "Shiro Games"
    }
  },
  {
    "id": "broforce",
    "title": "Broforce",
    "releaseYear": 2015,
    "genre": [
      "Action",
      "Platformer",
      "Co-op",
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
    "developer": "Free Lives",
    "steamUrl": "https://store.steampowered.com/app/274190/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/274190/ss_b77d3d5ba767df4b2d58017804331e90a7ae4eaa.1920x1080.jpg?t=1764247760",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/274190/ss_700cda119dab1d0333b8d91771cf216ac7f8cafa.1920x1080.jpg?t=1764247760",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/274190/ss_bda2885ff80a5e383e287270680b0d9d420685ef.1920x1080.jpg?t=1764247760",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/274190/ss_c1963fe76c883f40f8d0c53827dd0c194a9a4a6e.1920x1080.jpg?t=1764247760",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/274190/ss_973dd48d209d4e457ff5845c8067e675f554edd5.1920x1080.jpg?t=1764247760",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/274190/ss_d11ef17ce48cea603c0305029e7c4b5c4be70a27.1920x1080.jpg?t=1764247760"
    ],
    "hints": {
      "tagline": {
        "fr": "Libérez le monde au nom de la liberté dans un déluge d'explosions et de héros cultes du cinéma d'action.",
        "en": "An action-packed side-scrolling run and gun homage to freedom, featuring an under-funded, over-powered paramilitary team.",
        "es": "Libera el mundo a base de dinamita y héroes de acción ochenteros en este explosivo shooter cooperativo.",
        "de": "Verbreite Freiheit mit brachialer Zerstörungswut an der Seite legendärer 80er-Action-Helden im Koop.",
        "ja": "懐かしのアクション映画ヒーローたちが集結し、超絶的な火力でテロリストを粉砕する痛快爆発横スクロールアクション。",
        "pt-BR": "Liberte o mundo em nome da liberdade em uma enxurrada explosiva com paródias hilárias de heróis do cinema."
      },
      "composer": "Deon van Heerden"
    }
  },
  {
    "id": "rhythm-doctor",
    "title": "Rhythm Doctor",
    "releaseYear": 2021,
    "genre": [
      "Rythme",
      "Action",
      "Narratif",
      "Rétro"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
    },
    "developer": "7th Beat Games",
    "steamUrl": "https://store.steampowered.com/app/774181/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/774181/ss_e361a4f2de7594952b61522bb21a66713fe3f808.1920x1080.jpg?t=1786548815",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/774181/ss_a8427224faf8062ed4eea2d3af9637934914a85c.1920x1080.jpg?t=1786548815",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/774181/ss_0ad870eb7a1cc4315b17c2aaa2e54c0b5f220684.1920x1080.jpg?t=1786548815",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/774181/ss_cb3a0ab6aaaf1bfb929e32bd8df05a3ffd7140e3.1920x1080.jpg?t=1786548815",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/774181/ss_303950f5da20e6f81c8aa6b709e7f1f6e75851e2.1920x1080.jpg?t=1786548815",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/774181/ss_69d7b976a41c43d5bf77693cef3c5a95d1374e6f.1920x1080.jpg?t=1786548815"
    ],
    "hints": {
      "tagline": {
        "fr": "Soignez les cœurs de vos patients en appuyant en rythme sur le 7e battement dans ce jeu musical d'une précision chirurgicale.",
        "en": "Heal patients by defibrillating in time to their heartbeats on the 7th beat in this challenging rhythm game.",
        "es": "Cura a tus pacientes desafiando síncopas y arritmias presionando la tecla exactamente en el séptimo pulso.",
        "de": "Heile Patienten durch präzise Rhythmus-Defibrillation genau auf dem siebten Herzschlag.",
        "ja": "不整脈を抱える患者たちの心臓を、第7拍の完璧なタイミングで除細動して救う感動の医療リズムゲーム。",
        "pt-BR": "Cure o coração dos seus pacientes pressionando exatamente no 7º compasso neste emocionante jogo de ritmo."
      },
      "composer": "Hafiz Azman"
    }
  },
  {
    "id": "20-minutes-till-dawn",
    "title": "20 Minutes Till Dawn",
    "releaseYear": 2023,
    "genre": [
      "Auto-Shooter",
      "Roguelite",
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
    "developer": "flanne",
    "steamUrl": "https://store.steampowered.com/app/1966900/",
    "itchUrl": "https://flanne.itch.io/10-minutes-till-dawn",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1966900/ss_0ee0797519f432d01614ff20027ccbf4568255b7.1920x1080.jpg?t=1785102761",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1966900/ss_e7709844afbd28c7596f832e396e9af59cb7577b.1920x1080.jpg?t=1785102761",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1966900/ss_60af2304749b9e512b75265b2349d3c79eb38856.1920x1080.jpg?t=1785102761",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1966900/ss_9c6155d820182d5f2e3298f38011e61cbd5f5966.1920x1080.jpg?t=1785102761",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1966900/ss_66b8a57cfb1e17e5365ec599eabf66a81ba27307.1920x1080.jpg?t=1785102761",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1966900/ss_180cd9a21b11cb6e7eee998c7d416624f213d793.1920x1080.jpg?t=1785102761"
    ],
    "hints": {
      "tagline": {
        "fr": "Tirez sur des nuées d'abominations lovecraftiennes et survivez jusqu'aux premières lueurs de l'aube.",
        "en": "Shoot down an ever-growing horde of Lovecraftian monsters to survive the night in this roguelite shooter.",
        "es": "Dispara contra hordas crecientes de monstruos lovecraftianos y sobrevive a la noche durante 20 minutos.",
        "de": "Überstehe 20 nervenaufreibende Minuten gegen alptraumhafte Lovecraft-Kreaturen in diesem Roguelite-Shooter.",
        "ja": "暗闇から迫り来る無数のクトゥルフ系モンスターを銃火器で撃退し、夜明けまでの20分間を生き延びる爽快シューター。",
        "pt-BR": "Dispare contra hordas de horrores lovecraftianos e sobreviva até o amanhecer neste intenso roguelite."
      },
      "composer": "flanne"
    }
  },
  {
    "id": "brotato",
    "title": "Brotato",
    "releaseYear": 2023,
    "genre": [
      "Auto-Shooter",
      "Roguelite",
      "Bullet Hell",
      "Action"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
      "en": "2D Top-down"
    },
    "developer": "Blobfish",
    "steamUrl": "https://store.steampowered.com/app/1942280/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1942280/ss_79be0eea0299da76bc50cef160fb669509f74e0b.1920x1080.jpg?t=1789029155",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1942280/ss_61ad3d242282311207828c1a7d87c1c9d7b4d8bf.1920x1080.jpg?t=1789029155",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1942280/ss_9d7d1532397e65d39a3b63e3b25bd3adf7a81b37.1920x1080.jpg?t=1789029155",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1942280/ss_8d4467bb3278d7f50bf457337bbe76d0053ebd83.1920x1080.jpg?t=1789029155",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1942280/ss_d4b4c0b552e655169719e35c964765bd27d05900.1920x1080.jpg?t=1789029155",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1942280/ss_ddc4374c23a6776fb566d8c0af126d8166ce78bb.1920x1080.jpg?t=1789029155"
    ],
    "hints": {
      "tagline": {
        "fr": "Armez une patate belliqueuse de six pétoires simultanées pour massacrer des vagues d'extraterrestres.",
        "en": "A top-down arena shooter roguelite where you play a potato wielding up to 6 weapons at a time to fight off alien hordes.",
        "es": "Un shooter roguelite cenital donde juegas como una patata que blande hasta 6 armas a la vez contra aliens.",
        "de": "Kämpfe als schwer bewaffnete Kartoffel mit bis zu 6 Waffen gleichzeitig gegen endlose Alienwellen.",
        "ja": "最大6つの武器を同時にぶっ放し、エイリアンの大群をなぎ倒す怒れるポテトの爽快アリーナシューター。",
        "pt-BR": "Arme uma batata guerreira com até seis armas simultâneas para estraçalhar ondas alienígenas."
      },
      "composer": "Blobfish"
    }
  },
  {
    "id": "peglin",
    "title": "Peglin",
    "releaseYear": 2024,
    "genre": [
      "Roguelike",
      "Puzzle",
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
    "developer": "Red Nexus Games Inc.",
    "steamUrl": "https://store.steampowered.com/app/1296610/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1296610/ss_1a2afdad48b809a7adecea90516889316d4f21bc.1920x1080.jpg?t=1779945876",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1296610/ss_71770eca91f44432783fbb971543b36f5f1023e1.1920x1080.jpg?t=1779945876",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1296610/ss_a2148dcb2289ea71fe88911e39267f389e3488f5.1920x1080.jpg?t=1779945876",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1296610/ss_ac8f1e46cf60585360ff4f0fc9bd5044c9fd1b59.1920x1080.jpg?t=1779945876",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1296610/ss_7f3795f1512e60d0b75a501bdfe01f7006f0e939.1920x1080.jpg?t=1779945876",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1296610/ss_320848b6c9ab0e7c1c350e3e3b254cb94535c59a.1920x1080.jpg?t=1779945876"
    ],
    "hints": {
      "tagline": {
        "fr": "Envoyez des orbes sur des clous magiques pour déclencher de puissantes attaques dans un mélange de Peggle et de roguelike.",
        "en": "Peglin is a Pachinko Roguelike - Fight enemies by collecting special orbs and popping pegs to deal damage.",
        "es": "Lucha contra enemigos recolectando orbes especiales y rebotando en clavijas en este adictivo roguelike tipo pachinko.",
        "de": "Kombiniere Pachinko und Roguelike: Feuere magische Kugeln ab, sammle Relikte und besiege fiese Monster.",
        "ja": "ピンにオーブを跳ね返らせて攻撃力を高め、モンスターたちを撃退するパチンコ×ローグライクRPG。",
        "pt-BR": "Atire esferas em pinos mágicos para desferir ataques arrasadores nesta fusão brilhante de pachinko e roguelike."
      },
      "composer": "Eisner Altheim"
    }
  },
  {
    "id": "backpack-hero",
    "title": "Backpack Hero",
    "releaseYear": 2023,
    "genre": [
      "Roguelike",
      "Deckbuilder",
      "Gestion"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
      "en": "2D Top-down"
    },
    "developer": "Jaspel",
    "steamUrl": "https://store.steampowered.com/app/1970580/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1970580/ss_34b2c0a700a0b3486233b5d73d0643433593975e.1920x1080.jpg?t=1771527569",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1970580/ss_35d0be5367e06332d1e7f82bf3d21759c0697cb6.1920x1080.jpg?t=1771527569",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1970580/ss_e39025fae7fd8cc1f0f9c15cc7c66748e92d4773.1920x1080.jpg?t=1771527569",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1970580/ss_c7c33e8f7564465b8ccc1ac0ada1cd7f1f3cdf65.1920x1080.jpg?t=1771527569",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1970580/ss_c32b0f5d7a3efdb3d935f8090d8790afbcd18433.1920x1080.jpg?t=1771527569",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1970580/ss_65bf0d971c8c135dd4f2124ca321db2cc6db1920.1920x1080.jpg?t=1771527569"
    ],
    "hints": {
      "tagline": {
        "fr": "Organisez minutieusement l'inventaire de votre sac à dos pour déclencher des combos d'armes et terrasser vos rivaux.",
        "en": "The inventory management roguelike! Collect rare items, organize your bag, and vanquish foes.",
        "es": "¡El roguelike de gestión de inventario! Organiza tu mochila meticulosamente para activar sinergias letales.",
        "de": "Das geniale Inventar-Roguelike! Platziere Waffen und Relikte clever in deinem Rucksack für mächtige Synergien.",
        "ja": "バックパックの中身をテトリスのように整理し、アイテム同士の位置関係で強力なコンボを叩き出すインベントリ管理RPG。",
        "pt-BR": "Organize cada espaço da sua mochila para ativar sinergias mortais neste inovador roguelike de gerenciamento."
      },
      "composer": "Jaspel"
    }
  },
  {
    "id": "deaths-door",
    "title": "Death's Door",
    "releaseYear": 2021,
    "genre": [
      "Action",
      "Aventure",
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
    "developer": "Acid Nerve",
    "steamUrl": "https://store.steampowered.com/app/894020/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/894020/ss_dd9b5a2e40d3d512d1c978a5dfda5999c458a517.1920x1080.jpg?t=1788311627",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/894020/ss_46cbadf5477da2909c9ef5c4539a977314da03e0.1920x1080.jpg?t=1788311627",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/894020/ss_bf0108947fe505dc28e4cf0cad288c57b4efeca0.1920x1080.jpg?t=1788311627",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/894020/ss_83e57d823ecb8559cd3c70cef500b33d4b841787.1920x1080.jpg?t=1788311627",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/894020/ss_5052e94b4c36c5cdd39de4aa11bbc60af55cb3d7.1920x1080.jpg?t=1788311627",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/894020/ss_e3daf6b07bb732c199d6be1088bda90f6527dd84.1920x1080.jpg?t=1788311627"
    ],
    "hints": {
      "tagline": {
        "fr": "Incarnez un corbeau moissonneur d'âmes et pourfendez des tyrans dans un royaume où nul ne meurt jamais.",
        "en": "Reaping souls of the dead and punching a clock might get monotonous but it's honest work for a Crow.",
        "es": "Cosechar almas de los muertos puede ser monótono, pero es un trabajo honrado para un pequeño cuervo.",
        "de": "Kämpfe dich als seelenerntende Krähe mit Schwert und Pfeilen durch ein Land, in dem niemand altern will.",
        "ja": "死者の魂を刈り取る仕事に就いたカラスとなり、死を拒む巨大なモンスターたちと戦う美麗アクションアドベンチャー。",
        "pt-BR": "Encarne um corvo ceifador de almas e enfrente tiranos com sua espada em um reino sem morte."
      },
      "composer": "David Fenn"
    }
  },
  {
    "id": "moonlighter",
    "title": "Moonlighter",
    "releaseYear": 2018,
    "genre": [
      "Action",
      "Roguelite",
      "Gestion",
      "RPG"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
      "en": "2D Top-down"
    },
    "developer": "Digital Sun",
    "steamUrl": "https://store.steampowered.com/app/606150/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/606150/ss_12301c80d516d688eb1d18e214df8459679e8e60.1920x1080.jpg?t=1788472788",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/606150/ss_af36aa1ca2e534a999938cff0eb04409668f5b10.1920x1080.jpg?t=1788472788",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/606150/ss_c7c33eb041627f7a5fdbdefb0e41269178faf372.1920x1080.jpg?t=1788472788",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/606150/ss_c0221de85444acca32ce4441b11a78105d8a9928.1920x1080.jpg?t=1788472788",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/606150/ss_6264f9e73fe2db8a427c5bc3d250123eaef79456.1920x1080.jpg?t=1788472788",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/606150/ss_2c8e7f51ab20634d404634d2efa7b6c90940f40d.1920x1080.jpg?t=1788472788"
    ],
    "hints": {
      "tagline": {
        "fr": "Tenez votre boutique d'antiquités le jour et plongez dans des donjons procéduraux périlleux la nuit.",
        "en": "An Action RPG with rogue-lite elements following the everyday routines of Will, an adventurous shopkeeper.",
        "es": "Un juego de acción y rol con elementos rogue-lite sobre la doble vida de Will, un tendero aventurero.",
        "de": "Führe tagsüber deinen florierenden Laden und plündere nachts gefährliche Dungeons nach wertvoller Beute.",
        "ja": "昼は仕入れた品を並べて自分のお店を切り盛りし、夜は未知のダンジョンへと潜る商売＆冒険アクションRPG。",
        "pt-BR": "Administre sua loja de dia e enfrente masmorras procedurais à noite neste carismático RPG de ação."
      },
      "composer": "David Housden"
    }
  },
  {
    "id": "starbound",
    "title": "Starbound",
    "releaseYear": 2016,
    "genre": [
      "Sandbox",
      "Survie",
      "Aventure",
      "Sci-Fi",
      "Co-op"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
    },
    "developer": "Chucklefish",
    "steamUrl": "https://store.steampowered.com/app/211820/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/211820/ss_2dcc1e0c07f7597edc6556b31b8df9902fddac1a.1920x1080.jpg?t=1782391980",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/211820/ss_c8bb844f59b490bbfee6d179879e47272044ca34.1920x1080.jpg?t=1782391980",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/211820/ss_af82dfaaa6521c92cb311f7ba54ecf5257bf880e.1920x1080.jpg?t=1782391980",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/211820/ss_a911c976aeb84fcd25c8866eba08e1ca642d25d4.1920x1080.jpg?t=1782391980",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/211820/ss_974323d818a04ed7657aa87eef74f8cf0811548a.1920x1080.jpg?t=1782391980",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/211820/ss_d825ae99fa02dca4c770fef9a9429f6f3fc4598d.1920x1080.jpg?t=1782391980"
    ],
    "hints": {
      "tagline": {
        "fr": "Parcourez une galaxie infinie générée procéduralement, terraformez des planètes et construisez votre colonie.",
        "en": "Explore, craft, build and battle across a vast procedurally generated universe with your customizable ship.",
        "es": "Explora, construye, lucha y coloniza una galaxia infinita generada proceduralmente con tu nave espacial.",
        "de": "Reise mit deinem Raumschiff durch eine grenzenlose Galaxie, erkunde fremde Planeten und baue Kolonien.",
        "ja": "宇宙船で広大な銀河を旅し、未知の惑星で素材を集めて拠点を建設するSFサンドボックスアドベンチャー。",
        "pt-BR": "Viaje por uma galáxia infinita gerada proceduralmente, terraforme planetas e construa sua própria civilização."
      },
      "composer": "Curtis Schweitzer"
    }
  },
  {
    "id": "eastward",
    "title": "Eastward",
    "releaseYear": 2021,
    "genre": [
      "Action",
      "Aventure",
      "RPG",
      "Narratif"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
      "en": "2D Top-down"
    },
    "developer": "Pixpil",
    "steamUrl": "https://store.steampowered.com/app/977880/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/977880/ss_5d50545b49db3a8502666b4195d2fabd0e31a29d.1920x1080.jpg?t=1782290198",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/977880/ss_b3512f7576dbdd1e35dd3fb27a04f29174efb00d.1920x1080.jpg?t=1782290198",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/977880/ss_2c7516dbcfba035a359a2eb7257356809a3f5eaa.1920x1080.jpg?t=1782290198",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/977880/ss_ddd76431b1df70e234494c92370e2391680c98ef.1920x1080.jpg?t=1782290198",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/977880/ss_fc97f011126b32f77cbb66a9dc59e22cc353c2b8.1920x1080.jpg?t=1782290198",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/977880/ss_cde0e802a2ce50572e16be8422479d5b54181577.1920x1080.jpg?t=1782290198"
    ],
    "hints": {
      "tagline": {
        "fr": "Guidez un mineur taciturne et une mystérieuse fillette dans un monde post-apocalyptique en pixel art sublime.",
        "en": "Escape the tyrannical grip of a subterranean society and join Eastward’s unlikely duo on an exciting adventure.",
        "es": "Escapa del control tiránico de una sociedad subterránea y acompaña a un dúo entrañable hacia el exterior.",
        "de": "Begleite einen bärbeißigen Minenarbeiter und ein geheimnisvolles Mädchen auf einer Reise durch eine zauberhafte Pixel-Welt.",
        "ja": "無口な炭鉱夫ジョンと不思議な少女サムが、終末後の美しくも切ない地上世界を旅する珠玉のピクセルアートRPG。",
        "pt-BR": "Acompanhe um mineiro durão e uma jovem enigmática em uma jornada pós-apocalíptica em pixel art sublime."
      },
      "composer": "Joel Corelitz"
    }
  },
  {
    "id": "iron-lung",
    "title": "Iron Lung",
    "releaseYear": 2022,
    "genre": [
      "Horreur",
      "Simulation",
      "Psychologique"
    ],
    "artStyle": {
      "fr": "3D Rétro Low-poly",
      "en": "Retro Low-poly 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "David Szymanski",
    "steamUrl": "https://store.steampowered.com/app/1846170/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1846170/ss_8f6028d45627c23f4818e881860aec6ef029fbbf.1920x1080.jpg?t=1770061280",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1846170/ss_1c62a35a9022be7973eacaa117f6c5b4a37d71d1.1920x1080.jpg?t=1770061280",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1846170/ss_88dfadc6433914520fa9b48c91260bd5a1251c27.1920x1080.jpg?t=1770061280",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1846170/ss_2356416dc8749fb2ec956e83b7b714dab974b69a.1920x1080.jpg?t=1770061280",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1846170/ss_e17953b908d595b7e9009f426442a5ce21b4130b.1920x1080.jpg?t=1770061280",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1846170/ss_d05f13e01909ca215c998fb346b4caba55eef40c.1920x1080.jpg?t=1770061280"
    ],
    "hints": {
      "tagline": {
        "fr": "Pilotez un sous-marin aveugle dans un océan de sang extraterrestre au fond d'une lune désolée.",
        "en": "A short horror game where you pilot a tiny submarine through an ocean of blood on an alien moon.",
        "es": "Un asfixiante juego de terror donde pilotas un diminuto submarino a ciegas por un océano de sangre.",
        "de": "Steuere ein klaustrophobisches Mini-U-Boot blind durch ein außerirdisches Blutmeer auf einem fremden Mond.",
        "ja": "窓のない超小型潜水艦を計器だけで操縦し、異星の血の海深くに潜る息苦しく不気味な極限ホラー。",
        "pt-BR": "Pilote um minúsculo submarino às cegas por um oceano de sangue em uma lua alienígena esquecida."
      },
      "composer": "David Szymanski"
    }
  },
  {
    "id": "buckshot-roulette",
    "title": "Buckshot Roulette",
    "releaseYear": 2024,
    "genre": [
      "Horreur",
      "Stratégie",
      "Psychologique",
      "Action",
      "Rétro"
    ],
    "artStyle": {
      "fr": "3D Rétro Low-poly",
      "en": "Retro Low-poly 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "Mike Klubnika",
    "steamUrl": "https://store.steampowered.com/app/2835570/",
    "itchUrl": "https://mikeklubnika.itch.io/buckshot-roulette",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2835570/ss_c9c2df013e1c2d1b97f2c5cce57c22c24efd5178.1920x1080.jpg?t=1783085442",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2835570/ss_aa132ad8e9bfc79d9ff5bd60e89e7f2d69af1d84.1920x1080.jpg?t=1783085442",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2835570/ss_3ef4fc68827fa9ba6a713f314925c6d5d7a05d16.1920x1080.jpg?t=1783085442",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2835570/ss_3644e6813bba9e87add09ad5e7b150bb9283a850.1920x1080.jpg?t=1783085442",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2835570/ss_a1b2abfd4ca49b2d5982dbc5a5a9f2af905897fd.1920x1080.jpg?t=1783085442",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2835570/ss_d2a1e047a3e3834ca6a7583241c360afc67d0680.1920x1080.jpg?t=1783085442"
    ],
    "hints": {
      "tagline": {
        "fr": "Affrontez un croupier sinistre dans une roulette russe mortelle au fusil à pompe de calibre 12.",
        "en": "Play Russian roulette with a 12-gauge shotgun. Two enter. One leaves. Roll the dice with your life.",
        "es": "Juega a la ruleta rusa con una escopeta de calibre 12 en una habitación oscura. Dos entran, uno sale.",
        "de": "Spiele russisches Roulette mit einer Schrotflinte Kaliber 12 in einer düsteren Hinterzimmer-Atmosphäre.",
        "ja": "12ゲージの散弾銃を用いた命がけのロシアンルーレット。闇のディーラーと駆け引きを繰り広げる究極の心理戦。",
        "pt-BR": "Enfrente um negociante sinistro em uma roleta-russa mortal com uma escopeta calibre 12."
      },
      "composer": "Mike Klubnika"
    }
  },
  {
    "id": "oxenfree",
    "title": "Oxenfree",
    "releaseYear": 2016,
    "genre": [
      "Aventure",
      "Mystère",
      "Narratif",
      "Horreur"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
    },
    "developer": "Night School Studio",
    "steamUrl": "https://store.steampowered.com/app/388880/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/388880/ss_72abbfd384f1825b6d68ed8977b373b78dfbc30f.1920x1080.jpg?t=1718924110",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/388880/ss_a976add91216ecd7f5b9530a3928dc32b658c7dd.1920x1080.jpg?t=1718924110",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/388880/ss_5ef1b9268958d76272708b411960a00a81050aba.1920x1080.jpg?t=1718924110",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/388880/ss_75af452f6e7f6c5dc1ada4f001abcccac6c57db7.1920x1080.jpg?t=1718924110",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/388880/ss_4c3b72bb9925f3156e17ec2b2cb7121c5af2e85c.1920x1080.jpg?t=1718924110",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/388880/ss_e834b826affdd025d524a4ee4db5efee3362d1e8.1920x1080.jpg?t=1718924110"
    ],
    "hints": {
      "tagline": {
        "fr": "Déchirez le voile entre les mondes lors d'une fête nocturne sur une île militaire abandonnée.",
        "en": "A supernatural thriller about a group of friends who unwittingly open a ghostly rift during an overnight party.",
        "es": "Un thriller sobrenatural sobre amigos que abren accidentalmente una brecha espectral en una isla abandonada.",
        "de": "Ein packender Mystery-Thriller über eine Gruppe Jugendlicher, die auf einer verlassenen Insel Geisterfunk empfangen.",
        "ja": "閉鎖された軍事島の夜、ティーンエイジャーたちがラジオを通じて怪異の周波数を呼び覚ます超常サスペンス。",
        "pt-BR": "Rasgue o véu entre as dimensões durante uma festa noturna em uma misteriosa ilha militar abandonada."
      },
      "composer": "scntfc"
    }
  },
  {
    "id": "night-in-the-woods",
    "title": "Night in the Woods",
    "releaseYear": 2017,
    "genre": [
      "Aventure",
      "Narratif",
      "Exploration"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
    },
    "developer": "Infinite Fall",
    "steamUrl": "https://store.steampowered.com/app/480490/",
    "itchUrl": "https://finji.itch.io/night-in-the-woods",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/480490/ss_06b6c27c834b5639c54d470b3b5c711cf72a94af.1920x1080.jpg?t=1784141088",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/480490/ss_ff6b4efb3add6ea9a1d67f5c6c0fae6661ed9fd8.1920x1080.jpg?t=1784141088",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/480490/ss_976f1d181de3dc8bc86c78fe900c98be457d0942.1920x1080.jpg?t=1784141088",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/480490/ss_788d370761d6b3c488f4314ea2752170621573c6.1920x1080.jpg?t=1784141088",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/480490/ss_570af3ccb6cea896e3fb063d19ff87ce652c040b.1920x1080.jpg?t=1784141088",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/480490/ss_8fcc1a7b13352ad4d0b13d6b32bcd77929f0bc2b.1920x1080.jpg?t=1784141088"
    ],
    "hints": {
      "tagline": {
        "fr": "Retrouvez votre ville natale déclinante et affrontez les doutes de l'âge adulte dans une chronique mélancolique.",
        "en": "College dropout Mae Borowski returns home to the crumbling former mining town of Possum Springs.",
        "es": "Mae regresa a su decadente pueblo natal para reencontrarse con viejos amigos y desentrañar sus misterios.",
        "de": "Kehre als Studienabbrecherin Mae in deine zerfallende Heimatstadt zurück und entdecke deren düstere Geheimnisse.",
        "ja": "大学を中退して故郷の田舎町に戻ってきたメイが、旧友たちと過ごしながら街の不穏な真実に迫る青春物語。",
        "pt-BR": "Volte para sua decadente cidade natal e enfrente as angústias do amadurecimento nesta crônica tocante."
      },
      "composer": "Alec Holowka"
    }
  },
  {
    "id": "far-lone-sails",
    "title": "FAR: Lone Sails",
    "releaseYear": 2018,
    "genre": [
      "Atmosphérique",
      "Aventure",
      "Méditatif"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
    },
    "developer": "Okomotive",
    "steamUrl": "https://store.steampowered.com/app/609320/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/609320/ss_1985fdcbf2bdf0d9f739176fc2c7951cf6d4aacb.1920x1080.jpg?t=1769095038",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/609320/ss_f6ca3dd20cb0d266fad1cd6176e554e9c774d814.1920x1080.jpg?t=1769095038",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/609320/ss_e38ac00696bb7a1f292b051dc46dc5ba6d367049.1920x1080.jpg?t=1769095038",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/609320/ss_200474e7e298b365734e400f70c2f8c09d1a1876.1920x1080.jpg?t=1769095038",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/609320/ss_6a6b0709345798688ea6159f15ffee7e4646ab96.1920x1080.jpg?t=1769095038",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/609320/ss_fbc1c98368ba6826ec5efab3e7e46d6e2dd4f407.1920x1080.jpg?t=1769095038"
    ],
    "hints": {
      "tagline": {
        "fr": "Entretenez votre immense véhicule à voile et traversez un lit océanique asséché baigné de solitude.",
        "en": "Travel across a dried-out seabed following the tracks of a once burgeoning civilization in your unique vehicle.",
        "es": "Viaja por un lecho marino seco siguiendo el rastro de una civilización perdida a bordo de tu navío terrestre.",
        "de": "Steuere ein gewaltiges Landsegelschiff durch eine einsame, trostlos-schöne postapokalyptische Landschaft.",
        "ja": "巨大な蒸気動力の帆走車をメンテナンスしながら、干上がった海底の荒野を一人旅する情緒溢れる静かな冒険。",
        "pt-BR": "Mantenha sua gigantesca locomotiva a vapor e cruze um oceano seco e desértico banhado em solidão poética."
      },
      "composer": "Joel Schoch"
    }
  },
  {
    "id": "planet-of-lana",
    "title": "Planet of Lana",
    "releaseYear": 2023,
    "genre": [
      "Platformer",
      "Aventure",
      "Puzzle",
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
    "developer": "Wishfully",
    "steamUrl": "https://store.steampowered.com/app/1608230/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1608230/ss_73b0b2da6ced61844f4ad07e97613ebbb2c7bd65.1920x1080.jpg?t=1772728759",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1608230/ss_6f4a2ba6f5946be25ef2cd5cc9b8bf932b9178ff.1920x1080.jpg?t=1772728759",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1608230/ss_393d5e36d6c9d3e920e9f8066bf420ca61215709.1920x1080.jpg?t=1772728759",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1608230/ss_d62aa7852b06c638a777235bf93b642fb5e7e2e3.1920x1080.jpg?t=1772728759",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1608230/ss_ea3f85b0a5aa9379eed8c3e935e37962d2b5329c.1920x1080.jpg?t=1772728759",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1608230/ss_6dfcaacba7308d7988ff2a7ecbd5ed1827683413.1920x1080.jpg?t=1772728759"
    ],
    "hints": {
      "tagline": {
        "fr": "Parcourez une planète idyllique menacée par une armée de robots aux côtés d'une adorable créature noire.",
        "en": "A young girl and her loyal friend embark on a rescue mission through a colorful world full of cold machines.",
        "es": "Una joven y su fiel compañero se embarcan en una misión de rescate a través de un mundo lleno de máquinas frías.",
        "de": "Begib dich mit einem treuen Gefährten auf eine Rettungsmission durch eine atemberaubende, bedrohte Welt.",
        "ja": "ロボット軍団の侵略を受けた美しい惑星で、不思議な小動物ムイとともに家族を救い出す映画的パズルアドベンチャー。",
        "pt-BR": "Aventure-se por um planeta deslumbrante ameaçado por máquinas sem alma com seu pequeno amigo felino."
      },
      "composer": "Takeshi Furukawa"
    }
  },
  {
    "id": "the-stanley-parable-ultra-deluxe",
    "title": "The Stanley Parable: Ultra Deluxe",
    "releaseYear": 2022,
    "genre": [
      "Narratif",
      "Comédie",
      "Exploration"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "Crows Crows Crows",
    "steamUrl": "https://store.steampowered.com/app/1703340/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1703340/ss_b28f3003aac31f59d469468c8c74bbe410279a21.1920x1080.jpg?t=1712065263",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1703340/ss_eec7001b1e0fde761c5425bef747d17d57fec235.1920x1080.jpg?t=1712065263",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1703340/ss_44c19694ab4b0300c2c51dd0b3d69320ddf6a5a1.1920x1080.jpg?t=1712065263",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1703340/ss_a1df7d4b2546d11789b1e15a7627daccab13ff33.1920x1080.jpg?t=1712065263",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1703340/ss_1a0059da2e4f496f313acb7c65b58294d8f539f4.1920x1080.jpg?t=1712065263",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1703340/ss_12cfc84d1cd91027132e8d47eb2acaf1cc069349.1920x1080.jpg?t=1712065263"
    ],
    "hints": {
      "tagline": {
        "fr": "Défiez ou écoutez la voix omniprésente d'un narrateur narquois dans ce chef-d'œuvre de la satire métatextuelle.",
        "en": "You will play as Stanley, and you will not play as Stanley. You will make a choice, and you will have your choice taken.",
        "es": "Jugarás como Stanley y no jugarás como Stanley. Tomarás decisiones y el narrador se burlará de ellas.",
        "de": "Du spielst als Stanley, und du spielst nicht als Stanley. Ein genialer satirischer Bruch der vierten Wand.",
        "ja": "あなたはスタンリーであり、スタンリーではない。ナレーターの語りに従うか背くか、選択そのものを風刺する怪作。",
        "pt-BR": "Desafie ou obedeça à voz onisciente do narrador nesta genial e hilária sátira metalinguística sobre escolhas."
      },
      "composer": "Blake Robinson"
    }
  },
  {
    "id": "teardown",
    "title": "Teardown",
    "releaseYear": 2022,
    "genre": [
      "Physique",
      "Destruction",
      "Sandbox",
      "Action"
    ],
    "artStyle": {
      "fr": "3D Rétro Low-poly",
      "en": "Retro Low-poly 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "Tuxedo Labs",
    "steamUrl": "https://store.steampowered.com/app/1167630/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1167630/ss_b140eeaf8e489dfa4451411ae23c28a0ecb26729.1920x1080.jpg?t=1786967199",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1167630/f266c2457a6b183a89abce8659bac7419fdfc5f0/ss_f266c2457a6b183a89abce8659bac7419fdfc5f0.1920x1080.jpg?t=1786967199",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1167630/560d42a1125ebee850a1740f92f31da84c4c88e5/ss_560d42a1125ebee850a1740f92f31da84c4c88e5.1920x1080.jpg?t=1786967199",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1167630/ss_9a48b92d7144b7f4a27c0b5bc7dac1e687698f5b.1920x1080.jpg?t=1786967199",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1167630/ss_9fd3e8de605efc42e29ba98f72432cb78a15d7ac.1920x1080.jpg?t=1786967199",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1167630/123496e2e880b88162a8b79f5e620fd85beb744a/ss_123496e2e880b88162a8b79f5e620fd85beb744a.1920x1080.jpg?t=1786967199"
    ],
    "hints": {
      "tagline": {
        "fr": "Préparez le casse parfait en détruisant murs et fondations dans un monde aux voxels 100% destructibles.",
        "en": "Plan the perfect heist using creative problem solving, brute force, and everything around you in a fully destructible world.",
        "es": "Planea el robo perfecto usando fuerza bruta, vehículos y demolición en un mundo de vóxeles completamente destructible.",
        "de": "Plane den perfekten Raubzug mit Vorschlaghammer, Sprengstoff und Fahrzeugen in einer voll zerstörbaren Voxel-Welt.",
        "ja": "壁を爆破し、車両で突き破り、あらゆる建造物を完全に破壊して逃走ルートを切り拓くリアルボクセル強盗アクション。",
        "pt-BR": "Planeje o roubo perfeito demolindo paredes e edifícios em um mundo de voxels totalmente destrutível."
      },
      "composer": "Douglas Holmquist"
    }
  },
  {
    "id": "slay-the-spire-2",
    "title": "Slay the Spire 2",
    "releaseYear": 2026,
    "genre": [
      "Stratégie",
      "Roguelike",
      "Deckbuilder"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
    },
    "developer": "Mega Crit",
    "steamUrl": "https://store.steampowered.com/app/2868840/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2868840/1a373a95229aab0cfd97f553ecbe86092364bb9c/ss_1a373a95229aab0cfd97f553ecbe86092364bb9c.1920x1080.jpg?t=1787169309",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2868840/f3af7cb9693b9c4b6a7555227db3fef943db3992/ss_f3af7cb9693b9c4b6a7555227db3fef943db3992.1920x1080.jpg?t=1787169309",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2868840/c3db69efd984ef012ae85c5b426663720152f0a4/ss_c3db69efd984ef012ae85c5b426663720152f0a4.1920x1080.jpg?t=1787169309",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2868840/0fdb2940c0d367a40b2be6433daf12e3634089cf/ss_0fdb2940c0d367a40b2be6433daf12e3634089cf.1920x1080.jpg?t=1787169309",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2868840/18e8bda7bc4cdb37b90e0e2ce546967cbec87076/ss_18e8bda7bc4cdb37b90e0e2ce546967cbec87076.1920x1080.jpg?t=1787169309",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2868840/0aa6bff0eff26e37ccfdb07ad6cab52f8ab1ed4b/ss_0aa6bff0eff26e37ccfdb07ad6cab52f8ab1ed4b.1920x1080.jpg?t=1787169309"
    ],
    "hints": {
      "tagline": {
        "fr": "Repartez à l'assaut de la Flèche avec de nouveaux aventuriers, mécaniques et reliques maudites.",
        "en": "Return to the Spire with new characters, archetypes, and curses in the legendary deckbuilder sequel.",
        "es": "Regresa a la Aguja con nuevos personajes, mecánicas y reliquias en la esperada secuela del deckbuilder.",
        "de": "Kehre zum Turm zurück mit brandneuen Charakteren, Zaubern und Relikten im heißersehnten Nachfolger.",
        "ja": "新たなキャラクターとカード、未知の呪いとともに再び伝説の塔へと挑む大本命デッキ構築ローグライク続編。",
        "pt-BR": "Retorne à Torre com novos heróis, sinergias inéditas e relíquias misteriosas nesta aguardada sequência."
      },
      "composer": "Clark Aboud"
    }
  },
  {
    "id": "iron-nest-heavy-turret-simulator",
    "title": "IRON NEST: Heavy Turret Simulator",
    "releaseYear": 2026,
    "genre": [
      "Action",
      "Simulation",
      "Fast-FPS",
      "Sci-Fi"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "Nick Nieuwoudt, Dominik Latos",
    "steamUrl": "https://store.steampowered.com/app/2950790/",
    "headerImage": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2950790/e6c9e990560078611472e5dab98e79a405ed33f4/header.jpg?t=1789499918",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2950790/be3e941061112698ad333230e045b1be84e32235/ss_be3e941061112698ad333230e045b1be84e32235.1920x1080.jpg?t=1789499918",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2950790/40d186452e7d1baf038ea858719f73f8542539e8/ss_40d186452e7d1baf038ea858719f73f8542539e8.1920x1080.jpg?t=1789499918",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2950790/c27067644522be8b011bbad116f31cb177392a7c/ss_c27067644522be8b011bbad116f31cb177392a7c.1920x1080.jpg?t=1789499918",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2950790/9cc17a0ae638e8da7e65d461191c6fda9d14a3a0/ss_9cc17a0ae638e8da7e65d461191c6fda9d14a3a0.1920x1080.jpg?t=1789499918",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2950790/7cabb4bad2ea2918374676bfdef0654ee1054ee0/ss_7cabb4bad2ea2918374676bfdef0654ee1054ee0.1920x1080.jpg?t=1789499918",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2950790/fa422058a1d373c9e41588f226bf6e37eb182315/ss_fa422058a1d373c9e41588f226bf6e37eb182315.1920x1080.jpg?t=1789499918"
    ],
    "hints": {
      "tagline": {
        "fr": "Pilotez une tourelle de défense lourde et repoussez des vagues d'assaillants mécaniques sans faiblir.",
        "en": "Operate heavy industrial turret systems and withstand massive waves of armored mechanical invaders.",
        "es": "Opera pesadas torretas defensivas e intercepta oleadas masivas de invasores mecánicos blindados.",
        "de": "Bediene schwere Abwehrtürme und vernichte anrollende Kolonnen mechanischer Angreifer mit purer Feuerkraft.",
        "ja": "重量級の防衛タレットを操縦し、四方から押し寄せる強固な装甲機械軍団を圧倒的な火力で迎撃せよ。",
        "pt-BR": "Opere torres de artilharia pesada e repila ondas colossais de invasores mecânicos sem vacilar."
      },
      "composer": "Nick Nieuwoudt, Dominik Latos"
    }
  },
  {
    "id": "project-zomboid",
    "title": "Project Zomboid",
    "releaseYear": 2013,
    "genre": [
      "Survie",
      "RPG",
      "Simulation",
      "Horreur",
      "Sandbox"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Isométrique / 2.5D",
      "en": "Isometric / 2.5D"
    },
    "developer": "The Indie Stone",
    "steamUrl": "https://store.steampowered.com/app/108600/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/108600/e0dd37d69051f7da85896d11027ab018d23893fa/ss_e0dd37d69051f7da85896d11027ab018d23893fa.1920x1080.jpg?t=1787740093",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/108600/d9df2102dd12526700b15660bc5ec8f039dc8742/ss_d9df2102dd12526700b15660bc5ec8f039dc8742.1920x1080.jpg?t=1787740093",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/108600/4c8860818ac52c685bbe0988aa137d52bad4aac5/ss_4c8860818ac52c685bbe0988aa137d52bad4aac5.1920x1080.jpg?t=1787740093",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/108600/ss_eb1862af5109e4658e2538d897cbd16b87ad1818.1920x1080.jpg?t=1787740093",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/108600/ss_507e952789822b69868d768e1e4476946f37b1fb.1920x1080.jpg?t=1787740093",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/108600/ss_eca8be032b3f5508bf5bea74cfbc823a4df047ce.1920x1080.jpg?t=1787740093"
    ],
    "hints": {
      "tagline": {
        "fr": "Voici comment vous êtes mort : survivez à l'apocalypse zombie dans ce bac à sable impitoyable et ultra-détaillé.",
        "en": "The ultimate zombie survival sandbox: scavenge, build, craft, fight and survive alone or with friends.",
        "es": "El simulador definitivo de supervivencia zombi: saquea, construye, fabrica y sobrevive solo o con amigos.",
        "de": "Das ultimative Zombie-Survival-Erlebnis: Plündere, baue, koche und überlebe in einer gnadenlosen Apokalypse.",
        "ja": "物資調達、バリケード構築、感染への恐怖。細部まで徹底して再現された究極のゾンビサバイバルRPG。",
        "pt-BR": "Esta é a história de como você morreu: sobreviva ao apocalipse zumbi neste impiedoso e detalhado sandbox."
      },
      "composer": "Zach Beever"
    }
  },
  {
    "id": "igtap-an-incremental-game-that-s-also-a-platformer",
    "title": "IGTAP: an Incremental Game That's Also a Platformer",
    "releaseYear": 2026,
    "genre": [
      "Incrémental",
      "Platformer",
      "Simulation"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
    },
    "developer": "Pepper Tango Games",
    "steamUrl": "https://store.steampowered.com/app/4364730/",
    "headerImage": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4364730/baee180cfd51a94a559ffeace1f5c00d4c9a8fc2/header.jpg?t=1789991871",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4364730/906007825ebe11940edc76e3c99ec7be6b12081c/ss_906007825ebe11940edc76e3c99ec7be6b12081c.1920x1080.jpg?t=1789991871",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4364730/5789e3715c0067bc373bb1ecb8f5756d78eacfac/ss_5789e3715c0067bc373bb1ecb8f5756d78eacfac.1920x1080.jpg?t=1789991871",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4364730/27d9496a561731dab04a5dd971642b2fe0644445/ss_27d9496a561731dab04a5dd971642b2fe0644445.1920x1080.jpg?t=1789991871",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4364730/85905761083920e4acae4ab25b48aa2179c0280e/ss_85905761083920e4acae4ab25b48aa2179c0280e.1920x1080.jpg?t=1789991871",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4364730/6af73feee9b46dc7d083a91e118cf720bad34643/ss_6af73feee9b46dc7d083a91e118cf720bad34643.1920x1080.jpg?t=1789991871",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4364730/5e9b263a39a0b1ed5f241ca846995f041d127edf/ss_5e9b263a39a0b1ed5f241ca846995f041d127edf.1920x1080.jpg?t=1789991871"
    ],
    "hints": {
      "tagline": {
        "fr": "Progressez et sautez d'étage en étage dans ce mélange atypique entre idle game et jeu de plateforme.",
        "en": "An inventive incremental platformer where every jump and upgrade propels your endless numeric climb.",
        "es": "Un ingenioso juego de plataformas incremental donde tus mejoras multiplican tus saltos y estadísticas.",
        "de": "Ein origineller Mix aus Plattformer und Incremental Game, in dem jede Zahl dein Können exponentiell steigert.",
        "ja": "ジャンプアクションと放置クリッカーの数値インフレが融合した、中毒性の高い新感覚インクリメンタルゲーム。",
        "pt-BR": "Pule e acumule melhorias numéricas neste criativo e viciante jogo incremental com elementos de plataforma."
      },
      "composer": "Varii"
    }
  },
  {
    "id": "holocure",
    "title": "HoloCure - Save the Fans!",
    "releaseYear": 2023,
    "genre": [
      "Auto-Shooter",
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
    "developer": "KayAnimate",
    "steamUrl": "https://store.steampowered.com/app/2420510/",
    "itchUrl": "https://kay-yu.itch.io/holocure",
    "isFree": true,
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2420510/ss_0b4a50d12f737a522960ba3b3229546f536ff57f.1920x1080.jpg?t=1740642230",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2420510/ss_a393d743965dc088d53d97c493ee6728d74b384d.1920x1080.jpg?t=1740642230",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2420510/ss_f678c4dd81fd2c42b0682cba66317e6914bde75b.1920x1080.jpg?t=1740642230",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2420510/ss_7a15a419e71af6c3e27cf077056ec497fe411649.1920x1080.jpg?t=1740642230",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2420510/ss_bb2bc42e3f60aca430e72a2806a8425f57564da5.1920x1080.jpg?t=1740642230",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2420510/ss_ed3167797ee64fb25c72d6f32201d4e8a54fc272.1920x1080.jpg?t=1740642230"
    ],
    "hints": {
      "tagline": {
        "fr": "Repoussez des vagues d'admirateurs en délire aux commandes de vos idoles virtuelles préférées.",
        "en": "Fight through endless mobs of fans with unique skills and weapons in this action-packed rogue-lite homage.",
        "es": "Enfrenta hordas interminables de fans delirantes usando habilidades y armas extravagantes.",
        "de": "Wehre endlose Fan-Horden mit einzigartigen Fähigkeiten deiner virtuellen Lieblings-Idole ab.",
        "ja": "個性豊かなホロライブのタレントたちを操作し、熱狂的なファンたちを撃退する大人気ローグライトアクション。",
        "pt-BR": "Derrote hordas intermináveis de fãs enlouquecidos usando suas idols virtuais favoritas neste rogue-lite frenético."
      },
      "composer": "Eufrik"
    }
  },
  {
    "id": "doki-doki-literature-club",
    "title": "Doki Doki Literature Club!",
    "releaseYear": 2017,
    "genre": [
      "Visual Novel",
      "Psychologique",
      "Horreur",
      "Narratif"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "Team Salvato",
    "steamUrl": "https://store.steampowered.com/app/698780/",
    "itchUrl": "https://teamsalvato.itch.io/ddlc",
    "isFree": true,
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/698780/ss_3941e57f278958dd15c9855f42ab069da3a19608.1920x1080.jpg?t=1681943582",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/698780/ss_fb10c409c498a8f2f512d2195a169fed0bbb1526.1920x1080.jpg?t=1681943582",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/698780/ss_3030d47cf865cb5910746bc3897217c9cc8ce5fb.1920x1080.jpg?t=1681943582",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/698780/ss_c60999c236a809c04321017aa14e97e5ac9856a1.1920x1080.jpg?t=1681943582",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/698780/ss_34bca0d2db214a00dc0d02d006ae7f86506e3157.1920x1080.jpg?t=1681943582"
    ],
    "hints": {
      "tagline": {
        "fr": "Rejoignez un club de poésie aux apparences mignonnes qui bascule dans l'horreur psychologique pure.",
        "en": "Join a seemingly cheerful poetry club that unravels into a disturbing psychological narrative experience.",
        "es": "Únete a un club escolar de poesía aparentemente adorable que oculta un oscuro descenso al terror psicológico.",
        "de": "Tritt einem scheinbar harmlosen Literaturklub bei, der sich schleichend in puren psychologischen Horror verwandelt.",
        "ja": "可愛い女の子たちとの穏やかな文芸部での日々が、次第に背筋の凍る悪夢へと変貌していく伝説のメタホラー。",
        "pt-BR": "Entre em um clube de poesia aparentemente fofo que se transforma em uma perturbadora experiência de horror psicológico."
      },
      "composer": "Dan Salvato"
    }
  },
  {
    "id": "grimms-hollow",
    "title": "Grimm's Hollow",
    "releaseYear": 2019,
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
      "fr": "Vue du dessus 2D",
      "en": "2D Top-down"
    },
    "developer": "ghosthunter",
    "steamUrl": "https://store.steampowered.com/app/1170880/",
    "itchUrl": "https://ghosthum.itch.io/grimms-hollow",
    "isFree": true,
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1170880/ss_ed5e129fa0f0b819c15b5dca2c6d43c83c6f86a6.1920x1080.jpg?t=1630243141",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1170880/ss_e4ba936452b251a0868772142064c8073610efc7.1920x1080.jpg?t=1630243141",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1170880/ss_eef37bf7518c77b4c34cd1b22ceadac6c74f7c4c.1920x1080.jpg?t=1630243141",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1170880/ss_27c9504016a5fae08c38e4604026417db34dd596.1920x1080.jpg?t=1630243141",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1170880/ss_191f8b48123d7c2f2ec3ca72b4f70845e2ef1319.1920x1080.jpg?t=1630243141",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1170880/ss_2cc4b5ab0c14021626bfd3959c76c3b2ab3fc30d.1920x1080.jpg?t=1630243141"
    ],
    "hints": {
      "tagline": {
        "fr": "Explorez l'au-delà et fauchez des fantômes pour retrouver votre frère dans ce charmant RPG gothique.",
        "en": "A cozy, spooky RPG about ghost-hunting, eating cookies, and finding your lost brother in the afterlife.",
        "es": "Un encantador RPG gótico sobre cosechar espíritus, comer galletas y rescatar a tu hermano en el más allá.",
        "de": "Ein charmantes Geister-RPG über das Seelenernten, Keksebacken und die Suche nach deinem Bruder im Jenseits.",
        "ja": "クッキーを食べながら見習い死神として霊を刈り、冥界で行方不明になった弟を探す愛らしいゴシック短編RPG。",
        "pt-BR": "Ceife espíritos e coma doces enquanto procura seu irmão desaparecido no além neste charmoso RPG gótico."
      },
      "composer": "evelyn graph"
    }
  },
  {
    "id": "the-looker",
    "title": "The Looker",
    "releaseYear": 2022,
    "genre": [
      "Puzzle",
      "Comédie",
      "Aventure"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "Subcreation Studio",
    "steamUrl": "https://store.steampowered.com/app/1985690/",
    "isFree": true,
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1985690/ss_e4373d3ead1db7e44fd72371c2f7e7fe12f222a4.1920x1080.jpg?t=1663378276",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1985690/ss_39161fddb28930c4ce77d9a1e8d14acff5611f41.1920x1080.jpg?t=1663378276",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1985690/ss_bd11c6f8cc55036c574bed6b5c65d356fe388a44.1920x1080.jpg?t=1663378276",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1985690/ss_05f09a551b2a4e0c61e209505e37b43609e8f991.1920x1080.jpg?t=1663378276",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1985690/ss_ba1906729d47e083007cf3b26ac76587f32b4435.1920x1080.jpg?t=1663378276",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1985690/ss_4b045ccb8d15c04437131118767a8d7f02d497ec.1920x1080.jpg?t=1663378276"
    ],
    "hints": {
      "tagline": {
        "fr": "Explorez une île mystérieuse et résolvez des tracés absurdes dans cette parodie hilarante de The Witness.",
        "en": "Explore a mysterious island and solve hilarious line puzzles in this sharp, affectionate parody of The Witness.",
        "es": "Explora una isla misteriosa resolviendo disparatados acertijos de líneas en esta brillante parodia de The Witness.",
        "de": "Löse aberwitzige Linienrätsel auf einer idyllischen Insel in dieser genialen Liebeserklärung und Parodie auf The Witness.",
        "ja": "美しい孤島に散りばめられた線引きパズルを解き明かす、『The Witness』への愛と爆笑が詰まった痛快パロディ。",
        "pt-BR": "Explore uma ilha misteriosa e resolva quebra-cabeças de linhas hilários nesta sátira afiada a The Witness."
      },
      "composer": "Matthew Gallant"
    }
  },
  {
    "id": "cry-of-fear",
    "title": "Cry of Fear",
    "releaseYear": 2013,
    "genre": [
      "Horreur",
      "Survie",
      "Action"
    ],
    "artStyle": {
      "fr": "3D Rétro Low-poly",
      "en": "Retro Low-poly 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "Team Psykskallar",
    "steamUrl": "https://store.steampowered.com/app/223710/",
    "isFree": true,
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/223710/ss_06811c73bdf1e754ab15d5a0cc13fb431007cd4d.1920x1080.jpg?t=1643567513",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/223710/ss_2c6067afbda80f61deb5b3c1da7041e57adbecf0.1920x1080.jpg?t=1643567513",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/223710/ss_4c8f7ae3717f5708d4210f1c2ae725dcf27284e3.1920x1080.jpg?t=1643567513",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/223710/ss_7efc0d9d9daeca2a71bfaf4bf02ae15f2d838e08.1920x1080.jpg?t=1643567513",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/223710/ss_c73e57fc117e3722909a8afbb3de07be6569c96d.1920x1080.jpg?t=1643567513",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/223710/ss_ac194cf529c170a63dde2f1a35142a7fc94eb0ef.1920x1080.jpg?t=1643567513"
    ],
    "hints": {
      "tagline": {
        "fr": "Affrontez vos démons dans les rues glaciales et cauchemardesques d'une ville abandonnée.",
        "en": "A terrifying psychological descent into madness through the cold streets of an abandoned Swedish city.",
        "es": "Un sobrecogedor descenso a la locura a través de las gélidas calles de una solitaria ciudad escandinava.",
        "de": "Ein beklemmender psychologischer Alptraum durch die düsteren, feindseligen Straßen einer schwedischen Stadt.",
        "ja": "凍てつく夜の廃墟を携帯電話の灯りだけでさまよい、自らの心の闇と戦う本格サイコロジカルホラーFPS。",
        "pt-BR": "Enfrente seus pesadelos interiores pelas ruas gélidas e sombrias de uma cidade sueca abandonada."
      },
      "composer": "Andreas Rönnberg"
    }
  },
  {
    "id": "muck",
    "title": "Muck",
    "releaseYear": 2021,
    "genre": [
      "Survie",
      "Roguelike",
      "Action",
      "Co-op",
      "Artisanat"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "Dani",
    "steamUrl": "https://store.steampowered.com/app/1625450/",
    "isFree": true,
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1625450/ss_9427bb428a690b6898197b9ed2663adaf0210ea2.1920x1080.jpg?t=1625163481",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1625450/ss_4444042826bdb68fbf2cc1289207effaf5c0252a.1920x1080.jpg?t=1625163481",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1625450/ss_8e2f644cd54c790fdff9d6656976a5b8f06723ee.1920x1080.jpg?t=1625163481",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1625450/ss_ce4bb5567c2e12129757ecaaa4853146c2c8e763.1920x1080.jpg?t=1625163481",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1625450/ss_d14e2fddfc38e437929732749308ecd2597c1796.1920x1080.jpg?t=1625163481",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1625450/ss_5dac5aab55bd1b1361e95495d5bba785f3a6bbe7.1920x1080.jpg?t=1625163481"
    ],
    "hints": {
      "tagline": {
        "fr": "Récoltez des ressources, fabriquez des armes et défendez votre camp contre des raids nocturnes brutaux.",
        "en": "Gather resources, craft weapons and build your base to survive brutal nocturnal boss raids on a wild island.",
        "es": "Reúne recursos, fabrica armas y fortifica tu base para resistir aterradores asaltos nocturnos de titanes.",
        "de": "Sammle Ressourcen, crafte legendäre Waffen und überlebe die nächtlichen Angriffe riesiger Golems.",
        "ja": "無人島で木や鉱石を採集して装備を強化し、毎夜押し寄せる凶悪なボス軍勢を撃退するマルチサバイバルアクション。",
        "pt-BR": "Colete recursos, forje armas e construa sua base para repelir invasões colossais de chefes à noite."
      },
      "composer": "Badges"
    }
  },
  {
    "id": "factorio",
    "title": "Factorio",
    "releaseYear": 2020,
    "genre": [
      "Automatisation",
      "Gestion",
      "Sandbox",
      "Survie"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
      "en": "2D Top-down"
    },
    "developer": "Wube Software LTD.",
    "steamUrl": "https://store.steampowered.com/app/427520/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/427520/ss_36e4d8e5540805f5ed492d24d784ed9ba661752b.1920x1080.jpg?t=1787348817",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/427520/ss_171f398a8e347fad650a9c1b6c3b77c612781510.1920x1080.jpg?t=1787348817",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/427520/ss_0bf814493f247b6baa093511b46c352cf9e98435.1920x1080.jpg?t=1787348817",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/427520/ss_2533e54b0bd90a29adbedb60108ed277536ad445.1920x1080.jpg?t=1787348817",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/427520/ss_192864c00fc38b5ef97b97ca7fa655a9aed7c0da.1920x1080.jpg?t=1787348817",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/427520/ss_e301bde0fc0e996ba93e92639cd49dd90ae47b36.1920x1080.jpg?t=1787348817"
    ],
    "hints": {
      "tagline": {
        "fr": "Automatisez l'extraction, concevez des usines colossales et défendez votre réseau contre la faune locale hostile.",
        "en": "Build and maintain factories, automate production lines, and defend your industrial empire on an alien world.",
        "es": "Diseña gigantescas fábricas automatizadas, optimiza redes logísticas y defiéndelas de hordas alienígenas.",
        "de": "Konstruiere gigantische automatisierte Industrieanlagen und verteidige sie gegen aggressive einheimische Insekten.",
        "ja": "資源を掘り、コンベアをつなぎ、巨大な生産ラインを無限に最適化していく究極の工場自動化シミュレーション。",
        "pt-BR": "Automatize linhas de montagem, construa fábricas colossais e defenda seu império industrial contra insetos alienígenas."
      },
      "composer": "Daniel James Taylor"
    }
  },
  {
    "id": "rimworld",
    "title": "RimWorld",
    "releaseYear": 2018,
    "genre": [
      "Colony Sim",
      "Gestion",
      "Survie",
      "Sandbox"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
      "en": "2D Top-down"
    },
    "developer": "Ludeon Studios",
    "steamUrl": "https://store.steampowered.com/app/294100/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/294100/80e383ef19353058791efe17a6485849246c9c17/ss_80e383ef19353058791efe17a6485849246c9c17.1920x1080.jpg?t=1782756789",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/294100/a6158c5cef23ac8157b37dd3eb17f3c2d2649e93/ss_a6158c5cef23ac8157b37dd3eb17f3c2d2649e93.1920x1080.jpg?t=1782756789",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/294100/cccfece4c643fd32d438642fbea1b980bc519a48/ss_cccfece4c643fd32d438642fbea1b980bc519a48.1920x1080.jpg?t=1782756789",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/294100/57c3e8d556d47bb5ad048699643528aefc652aa6/ss_57c3e8d556d47bb5ad048699643528aefc652aa6.1920x1080.jpg?t=1782756789",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/294100/59a1400eff99e2b620d623d3d76a02c1592a72e7/ss_59a1400eff99e2b620d623d3d76a02c1592a72e7.1920x1080.jpg?t=1782756789",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/294100/1e3a2734b23daaa4eb60ea33dd87806aa65e0c8f/ss_1e3a2734b23daaa4eb60ea33dd87806aa65e0c8f.1920x1080.jpg?t=1782756789"
    ],
    "hints": {
      "tagline": {
        "fr": "Générez des histoires inoubliables en gérant les humeurs, blessures et drames de colons spatiaux naufragés.",
        "en": "A sci-fi colony sim driven by an intelligent AI storyteller, simulating psychology, combat, and relationships.",
        "es": "Un simulador de colonias de ciencia ficción guiado por una IA narrativa que genera historias humanas únicas.",
        "de": "Ein genialer Sci-Fi-Koloniesimulator, in dem ein KI-Geschichtenerzähler dramatische Überlebensdramen entfacht.",
        "ja": "AIストーリーテラーが巻き起こす予期せぬ事件やドラマを乗り越え、未知の惑星でコロニーを発展させる傑作シム。",
        "pt-BR": "Gere histórias inesquecíveis gerenciando as emoções, tragédias e triunfos de colonos espaciais náufragos."
      },
      "composer": "Alistair Lindsay"
    }
  },
  {
    "id": "cookie-clicker",
    "title": "Cookie Clicker",
    "releaseYear": 2021,
    "genre": [
      "Idle / Clicker",
      "Incrémental",
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
    "developer": "Orteil",
    "steamUrl": "https://store.steampowered.com/app/1454400/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1454400/ss_33b5eb6d3b3d582c9acc69739a920cd5a0b18693.1920x1080.jpg?t=1789371238",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1454400/ss_36c8a99a696f818801aaef980bb3b9b6baeeeaf5.1920x1080.jpg?t=1789371238",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1454400/ss_ff9c72abf6cc8feea1f96e816abe9e860e8e445e.1920x1080.jpg?t=1789371238",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1454400/ss_5d75e52f96f5f742fcc9a5c0ada88b487287c119.1920x1080.jpg?t=1789371238",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1454400/ss_ade4f966735b0489065c5ad3c363204589fc0517.1920x1080.jpg?t=1789371238",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1454400/ss_7a6add51071906277f48a2abaf50bc04f3d03a15.1920x1080.jpg?t=1789371238"
    ],
    "hints": {
      "tagline": {
        "fr": "Cliquez sur un cookie géant, embauchez des grand-mères et déformez l'espace-temps pour fabriquer des milliards de biscuits.",
        "en": "The original baking incremental game where you bake billions of cookies using time machines and portal magic.",
        "es": "Hornea miles de millones de galletas contratando abuelas y doblando el espacio-tiempo en este clásico incremental.",
        "de": "Backe Abermilliarden Kekse mit Hilfe von Großmüttern, Portalen und Zeitmaschinen im Urvater aller Klicker-Spiele.",
        "ja": "巨大なクッキーをクリックし、おばあちゃんを雇い、時空を歪めて天文学的な枚数を焼き上げる元祖クリッカーゲーム。",
        "pt-BR": "Clique no biscoito, contrate vovós e dobre o espaço-tempo para assar bilhões de cookies neste clássico viciante."
      },
      "composer": "C418"
    }
  },
  {
    "id": "townscaper",
    "title": "Townscaper",
    "releaseYear": 2021,
    "genre": [
      "City Builder",
      "Méditatif",
      "Cozy",
      "Sandbox"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Isométrique / 2.5D",
      "en": "Isometric / 2.5D"
    },
    "developer": "Oskar Stålberg",
    "steamUrl": "https://store.steampowered.com/app/1291340/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1291340/ss_989ff1808d9416c7b22da3e16ee54874697b1cea.1920x1080.jpg?t=1790002949",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1291340/ss_fcd697b91c82dfd151954070ce20bda18fcb6475.1920x1080.jpg?t=1790002949",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1291340/ss_07f2bedd6f510cb08bf5a0708e3a2e8ed299fbbd.1920x1080.jpg?t=1790002949",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1291340/ss_b059439bad0f695551cb3ecaf66f94c53c0380b3.1920x1080.jpg?t=1790002949",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1291340/ss_62b79af5ca542ddc946df86d1ee8c1abbe9bfc97.1920x1080.jpg?t=1790002949",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1291340/ss_ef8284a0132ff40e34d4a87c4c122070458091c8.1920x1080.jpg?t=1790002949"
    ],
    "hints": {
      "tagline": {
        "fr": "Bâtissez des villages côtiers pittoresques et des citadelles sur pilotis d'un simple clic sans objectif imposé.",
        "en": "An instant town-building toy where you click to create quaint island towns with curving streets and cathedrals.",
        "es": "Un relajante juguete de construcción donde creas pintorescos pueblos costeros con torres y arcos en un clic.",
        "de": "Erschaffe mit jedem Klick malerische Küstenstädtchen auf Stelzen in diesem herrlich entschleunigenden Bauspiel.",
        "ja": "グリッドをクリックするだけで、カラフルな家々屋根、アーチが自動で生まれ美しい港町を創れる癒しのトイゲーム。",
        "pt-BR": "Construa charmosas vilas costeiras e fortalezas sobre a água a cada clique, sem pressa nem metas rígidas."
      },
      "composer": "Martin Kvale"
    }
  },
  {
    "id": "shapez",
    "title": "shapez",
    "releaseYear": 2020,
    "genre": [
      "Automatisation",
      "Puzzle",
      "Sandbox",
      "Gestion"
    ],
    "artStyle": {
      "fr": "Monochrome / Minimaliste",
      "en": "Monochrome"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
      "en": "2D Top-down"
    },
    "developer": "Tobias Springer",
    "steamUrl": "https://store.steampowered.com/app/1318690/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1318690/ss_ee76fa2e3259ab077b8a711b394cf6668d4ec93a.1920x1080.jpg?t=1788789036",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1318690/ss_13235b05cdd091dc835c68419fa440e6bbfd5114.1920x1080.jpg?t=1788789036",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1318690/ss_61485350ef27278b9986c183c6c31f1054a7a328.1920x1080.jpg?t=1788789036",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1318690/ss_c29698e5ed36295747bc6a6aec94a8ddcc0896ee.1920x1080.jpg?t=1788789036",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1318690/ss_72e11e9a4f32d1f9d464322698a29f8d8e3cd610.1920x1080.jpg?t=1788789036",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1318690/ss_745de21042356e854b505f5c6d117a9975c5850f.1920x1080.jpg?t=1788789036"
    ],
    "hints": {
      "tagline": {
        "fr": "Extrayez, découpez, assemblez et peignez des formes géométriques dans une usine minimaliste à l'infini.",
        "en": "A relaxed game about building factories to automate the creation and combination of increasingly complex shapes.",
        "es": "Automatiza la extracción, corte y combinación de formas geométricas en un mapa infinito y relajante.",
        "de": "Schneide, färbe und kombiniere geometrische Formen auf Förderbändern in einer unendlichen Fabriklandschaft.",
        "ja": "幾何学模様の図形を切り分け、回転させ、着色して要求通りの形を組み上げる純粋な工場合理化パズル。",
        "pt-BR": "Extraia, corte, pinte e combine formas geométricas abstratas em uma fábrica minimalista infinita."
      },
      "composer": "Tobias Springer"
    }
  },
  {
    "id": "rusty-s-retirement",
    "title": "Rusty's Retirement",
    "releaseYear": 2024,
    "genre": [
      "Idle / Clicker",
      "Farming",
      "Cozy",
      "Simulation"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
      "en": "2D Top-down"
    },
    "developer": "Mister Morris Games",
    "steamUrl": "https://store.steampowered.com/app/2666510/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2666510/ss_f15441bfd5758bae1c69fa51a068c9869d26a200.1920x1080.jpg?t=1782364605",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2666510/ss_3496a84df0dbe09dd5949e2e9d6b47892a80311f.1920x1080.jpg?t=1782364605",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2666510/ss_19d23f2a13644dc3a1d41825562d985b2362d937.1920x1080.jpg?t=1782364605",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2666510/ss_85bb3668f2a3df2c32977da4d3971e730e58ab06.1920x1080.jpg?t=1782364605",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2666510/ss_6bbf47b0651ac753e303e77da2ae8b5b586f52c4.1920x1080.jpg?t=1782364605",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2666510/ss_b47c58abd7cebd95394962c4ff5f0e291acf3f8c.1920x1080.jpg?t=1782364605"
    ],
    "hints": {
      "tagline": {
        "fr": "Occupez-vous d'une petite ferme automatisée en bas de votre écran tout en travaillant sur votre ordinateur.",
        "en": "A relaxing idle-farming simulator that sits comfortably at the bottom of your screen while you do other things.",
        "es": "Un relajante simulador de granja que vive en la parte inferior de tu pantalla mientras haces otras tareas.",
        "de": "Eine entspannte Idle-Farm, die gemütlich am unteren Bildschirmrand wächst, während du am PC arbeitest.",
        "ja": "PC作業の邪魔をせず、画面最下部で小さなロボットがのんびりと作物を育てる画期的なデスクトップ放置農場。",
        "pt-BR": "Cuide de uma horta automatizada no rodapé da sua tela enquanto trabalha ou navega no computador."
      },
      "composer": "Mister Morris Games"
    }
  },
  {
    "id": "frostpunk",
    "title": "Frostpunk",
    "releaseYear": 2018,
    "genre": [
      "City Builder",
      "Survie",
      "Gestion",
      "Stratégie"
    ],
    "artStyle": {
      "fr": "3D Réaliste",
      "en": "Realistic 3D"
    },
    "camera": {
      "fr": "Isométrique / 2.5D",
      "en": "Isometric / 2.5D"
    },
    "developer": "11 bit studios",
    "steamUrl": "https://store.steampowered.com/app/323190/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/323190/ss_183ec20d8e38877d1599ae8f001e98fccc793b2d.1920x1080.jpg?t=1784897899",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/323190/ss_2fc6ed1e46755d6ad6091d8c1f75d94b912d1144.1920x1080.jpg?t=1784897899",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/323190/ss_28db92509d505c855b07d480d749119fc147c84c.1920x1080.jpg?t=1784897899",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/323190/ss_710aea3085400765ce450261ecb405ab1207552c.1920x1080.jpg?t=1784897899",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/323190/ss_03fc3089daf0785e3bf34b32c385e80defefaeb4.1920x1080.jpg?t=1784897899",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/323190/ss_a14917814ab134f26326aca4b97dadf1c9db060b.1920x1080.jpg?t=1784897899"
    ],
    "hints": {
      "tagline": {
        "fr": "Maintenez le dernier bastion de l'humanité au chaud face à un hiver apocalyptique dans des dilemmes moraux déchirants.",
        "en": "A society survival game where heat means life and every decision comes at a heavy moral price.",
        "es": "El calor es vida y cada decisión cuesta caro en este juego de supervivencia y gestión de una sociedad helada.",
        "de": "Führe die letzte Stadt der Menschheit durch eine eisige Apokalypse und triff schmerzhafte moralische Entscheidungen.",
        "ja": "極寒の氷河期に沈んだ世界で巨大な蒸気ジェネレーターを中心に都市を築き、過酷な決断を下す社会サバイバル。",
        "pt-BR": "Mantenha a última cidade da Terra aquecida contra o gelo extremo em dilemas morais dilacerantes."
      },
      "composer": "Piotr Musiał"
    }
  },
  {
    "id": "shadows-of-doubt",
    "title": "Shadows of Doubt",
    "releaseYear": 2024,
    "genre": [
      "Immersive Sim",
      "Enquête",
      "Mystère",
      "Sci-Fi"
    ],
    "artStyle": {
      "fr": "3D Rétro Low-poly",
      "en": "Retro Low-poly 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "ColePowered Games",
    "steamUrl": "https://store.steampowered.com/app/986130/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/986130/ss_ca595338d1dcb9ae46601ef917bbe38ade9119c4.1920x1080.jpg?t=1787842717",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/986130/ss_6e8b247fbef7b2be4d87b4a7ef9d6bae191e39f8.1920x1080.jpg?t=1787842717",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/986130/ss_36346e86ecfb3d72d2280f83bdbd5b9cfdb07385.1920x1080.jpg?t=1787842717",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/986130/ss_0a39da1f95ff7dfd98c1ed5066308b1ab929f840.1920x1080.jpg?t=1787842717",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/986130/ss_370787d0cae29638e7d55c325ed699d5b12df7ad.1920x1080.jpg?t=1787842717",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/986130/ss_8fdc47d3a0d3d55539107e62c535366de852f861.1920x1080.jpg?t=1787842717"
    ],
    "hints": {
      "tagline": {
        "fr": "Traquez des meurtriers dans une métropole dystopique générée procéduralement où chaque citoyen a une vie propre.",
        "en": "An immersive detective stealth game set in a fully simulated, sci-fi noir city of crime and corruption.",
        "es": "Un juego detectivesco inmersivo en una ciudad noir donde cada ciudadano tiene una rutina, huellas y secretos.",
        "de": "Ermittle als Detektiv in einer lebendigen Sci-Fi-Noir-Stadt, in der jeder Bewohner ein reales Leben führt.",
        "ja": "住民全員に名前や生活習慣、指紋がシミュレートされた陰鬱な街で、手がかりを追う没入型探偵ステルスシム。",
        "pt-BR": "Rastreie assassinos em uma metrópole noir simulada onde cada cidadão possui rotinas, impressões digitais e álibis."
      },
      "composer": "Nick Dymond"
    }
  },
  {
    "id": "duck-game",
    "title": "Duck Game",
    "releaseYear": 2015,
    "genre": [
      "Party Game",
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
    "developer": "Landon Podbielski",
    "steamUrl": "https://store.steampowered.com/app/312530/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/312530/ss_e0d4c29f0c6b93903916d35ec79ea5f2560932d5.1920x1080.jpg?t=1719772984",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/312530/ss_6da6723e0908f866142d69cebb5c13ec60063cab.1920x1080.jpg?t=1719772984",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/312530/ss_b20f323e1d27e4573a2afae3f4db9021da89dd3c.1920x1080.jpg?t=1719772984",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/312530/ss_250bcab1b9bbb209bf90ef4fe3a3178e4a33e184.1920x1080.jpg?t=1719772984",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/312530/ss_8b1837eecbbcd5850a4e997027a206eebf78ddc3.1920x1080.jpg?t=1719772984",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/312530/ss_f7ad193dffc42fecbe388411cea8bbe27573b8cf.1920x1080.jpg?t=1719772984"
    ],
    "hints": {
      "tagline": {
        "fr": "Affrontez vos amis dans des arènes futuristes chaotiques peuplées de canards armés de fusils laser et de mégaphones.",
        "en": "Enter the futuristic duck battlefield in frantic local and online multiplayer duck-blasting party combat.",
        "es": "Enfréntate a tus amigos en caóticos tiroteos entre patos armados con lásers, escopetas y graznidos sonoros.",
        "de": "Tritt in aberwitzigen Duck-Kämpfen mit Lasergewehren, Trompeten und lauten Quaks gegen deine Freunde an.",
        "ja": "多種多様な銃火器とクワッという鳴き声を響かせ、カオスなステージで撃ち合う大乱闘アヒルパーティーゲーム。",
        "pt-BR": "Duele contra amigos em arenas futuristas caóticas com patos armados até as penas de lasers e espingardas."
      },
      "composer": "Landon Podbielski"
    }
  },
  {
    "id": "return-to-monkey-island",
    "title": "Return to Monkey Island",
    "releaseYear": 2022,
    "genre": [
      "Point & Click",
      "Aventure",
      "Comédie",
      "Puzzle"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
    },
    "developer": "Terrible Toybox",
    "steamUrl": "https://store.steampowered.com/app/2060130/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2060130/ss_bd989f1025e559eec8d6993666323c9d06181a04.1920x1080.jpg?t=1711536318",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2060130/ss_2f7e407b460e4053d142dd1dbae050407d84fe4d.1920x1080.jpg?t=1711536318",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2060130/ss_df2537e4ebf236fb9782baea0ab5f782ca344327.1920x1080.jpg?t=1711536318",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2060130/ss_2d2ec4d82af7ef0df626b7867adca9cdd7cb698d.1920x1080.jpg?t=1711536318",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2060130/ss_c8f41062e3c2845eda201ac87f17e4b28b476c78.1920x1080.jpg?t=1711536318",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2060130/ss_ed9413e842d0a863453351bb924582015200ab29.1920x1080.jpg?t=1711536318"
    ],
    "hints": {
      "tagline": {
        "fr": "Reprenez la mer avec Guybrush Threepwood dans le grand retour de la franchise culte du jeu d'aventure point-and-click.",
        "en": "An unexpected, thrilling return of series creator Ron Gilbert that continues the story of the legendary adventure games.",
        "es": "El esperado y brillante regreso de Guybrush Threepwood de la mano de su creador original Ron Gilbert.",
        "de": "Das triumphale Wiedersehen mit Guybrush Threepwood unter der Regie von Serienschöpfer Ron Gilbert.",
        "ja": "海賊ガイブラシ・スリープウッドが再び大海原へ！ シリーズ生みの親ロン・ギルバートが手掛けた傑作ポイント＆クリック。",
        "pt-BR": "Zarpe novamente com Guybrush Threepwood no triunfal retorno da franquia clássica de aventura point-and-click."
      },
      "composer": "Peter McConnell"
    }
  },
  {
    "id": "minit",
    "title": "Minit",
    "releaseYear": 2018,
    "genre": [
      "Aventure",
      "Puzzle",
      "Rétro",
      "Action"
    ],
    "artStyle": {
      "fr": "Monochrome / Minimaliste",
      "en": "Monochrome"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
      "en": "2D Top-down"
    },
    "developer": "JW, Kitty, Jukio, and Dom",
    "steamUrl": "https://store.steampowered.com/app/609490/",
    "itchUrl": "https://devolverdigital.itch.io/minit",
    "headerImage": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/609490/header.jpg?t=1751460640",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/609490/ss_2749c2026b00c96399114ab44a3f060fe9784901.1920x1080.jpg?t=1751460640",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/609490/ss_804e71c05660889e2541010f27e5ccfd76cfa886.1920x1080.jpg?t=1751460640",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/609490/ss_44aafcc1cc9653be731e8196cf49738525c91935.1920x1080.jpg?t=1751460640",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/609490/ss_0e8169d3178e0b6ec8ab564e9cbea1e5fefd35d6.1920x1080.jpg?t=1751460640",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/609490/ss_2984d1941ba33f6393a5a6de7969c53f646e4e05.1920x1080.jpg?t=1751460640",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/609490/ss_90ed1d51476b950d9e8e80e78a5362040f414c97.1920x1080.jpg?t=1751460640"
    ],
    "hints": {
      "tagline": {
        "fr": "Vivez une aventure épique condensée en tranches de 60 secondes pour briser la malédiction d'une épée ensorcelée.",
        "en": "A peculiar little adventure played sixty seconds at a time to lift an unusual curse.",
        "es": "Una peculiar aventura que se juega en fragmentos de sesenta segundos para romper una misteriosa maldición.",
        "de": "Ein charmantes monochromes Mini-Abenteuer, das du in intensiven 60-Sekunden-Takten bestreitest.",
        "ja": "呪われた剣を手にしてしまった主人公が、60秒ごとに訪れる死を繰り返しながら呪いを解くユニークな短編アドベンチャー。",
        "pt-BR": "Viva uma aventura única jogada em doses de 60 segundos por vida para quebrar uma maldição ancestral."
      },
      "composer": "Jukio Kallio"
    }
  },
  {
    "id": "anodyne",
    "title": "Anodyne",
    "releaseYear": 2013,
    "genre": [
      "Aventure",
      "Rétro",
      "Action",
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
    "developer": "Analgesic Productions",
    "steamUrl": "https://store.steampowered.com/app/234900/",
    "itchUrl": "https://han-tani.itch.io/anodyne",
    "headerImage": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/234900/header.jpg?t=1766101656",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/234900/ss_8413b03a99fe5fead1868f216e783164ae2e1144.1920x1080.jpg?t=1766101656",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/234900/ss_a6d267d178198f40a975c7ed612fb4df1017688f.1920x1080.jpg?t=1766101656",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/234900/ss_e688c64779934bfb315754048d2a711941643662.1920x1080.jpg?t=1766101656",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/234900/ss_9533f5b16fccaa11069f098f5cf4ea14d3bf2d2b.1920x1080.jpg?t=1766101656",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/234900/ss_a157524bdb265c2a9ac2d2f37b56ae598e639431.1920x1080.jpg?t=1766101656",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/234900/ss_9dcc4232e29021b05562ccf96d834526c531318f.1920x1080.jpg?t=1766101656"
    ],
    "hints": {
      "tagline": {
        "fr": "Explorez les recoins oniriques et inquiétants du subconscient d'un jeune homme armé d'un simple balai.",
        "en": "Explore the subconscious mind of Young in a moody, surreal 16-bit adventure inspired by classic Zelda titles.",
        "es": "Explora los rincones oníricos del subconsciente de Young en una aventura surrealista inspirada en los clásicos de Zelda.",
        "de": "Reise durch das surreale, melancholische Unterbewusstsein eines jungen Helden mit nichts als einem Besen.",
        "ja": "一本の掃除用ほうきを武器に、少年ヤングの奇妙でノスタルジックな無意識の世界を探訪するゼルダ風アドベンチャー。",
        "pt-BR": "Explore os recessos oníricos do subconsciente de um jovem com uma vassoura nesta aventura surrealista."
      },
      "composer": "Melos Han-Tani"
    }
  },
  {
    "id": "frog-detective-the-haunted-island",
    "title": "Frog Detective 1: The Haunted Island",
    "releaseYear": 2018,
    "genre": [
      "Enquête",
      "Comédie",
      "Aventure",
      "Point & Click"
    ],
    "artStyle": {
      "fr": "3D Rétro Low-poly",
      "en": "Retro Low-poly 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "Grace Bruxner & Thomas Bowker",
    "steamUrl": "https://store.steampowered.com/app/963000/",
    "itchUrl": "https://fisho.itch.io/haunted-island",
    "headerImage": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/963000/header.jpg?t=1746201247",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/963000/ss_481ae2fef229e200d82beacbe4f3d0175dd89c40.1920x1080.jpg?t=1746201247",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/963000/ss_6d6244720e610fb4126fd9f54439d5ae589c1a36.1920x1080.jpg?t=1746201247",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/963000/ss_2a9357849b9740f22b3b2633d2012b2b9ccf1e7d.1920x1080.jpg?t=1746201247",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/963000/ss_b28cf3b77bc8b20c385972d743bca33745642eed.1920x1080.jpg?t=1746201247",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/963000/ss_a7031e53b7224d39da92133aaab19367ce44b4e4.1920x1080.jpg?t=1746201247",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/963000/ss_e16fa53459291e1b8a6af298f816c7ca428883bd.1920x1080.jpg?t=1746201247"
    ],
    "hints": {
      "tagline": {
        "fr": "Interrogez des suspects farfelus pour résoudre le mystère d'un fantôme farceur dans une comédie animalière attachante.",
        "en": "You're a detective and a frog, and it's time to solve a mystery! Talk to eccentric beasts on a haunted island.",
        "es": "Eres un detective y además una rana: investiga una isla encantada interrogando a personajes absurdos.",
        "de": "Du bist ein Frosch und gleichzeitig Detektiv! Befrage liebenswerte, kauzige Gestalten auf einer Geisterinsel.",
        "ja": "世界で2番目に優秀な探偵カエルとなり、陽気な動物たちから証言を集めて幽霊騒動の謎に挑むほのぼのコメディ。",
        "pt-BR": "Interrogue suspeitos excêntricos para resolver o caso de um fantasma travesso nesta divertida comédia."
      },
      "composer": "Dan Golding"
    }
  },
  {
    "id": "canabalt",
    "title": "Canabalt",
    "releaseYear": 2015,
    "genre": [
      "Runner",
      "Action",
      "Platformer",
      "Rétro"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
    },
    "developer": "Finji",
    "steamUrl": "https://store.steampowered.com/app/358960/",
    "itchUrl": "https://finji.itch.io/canabalt-classic",
    "headerImage": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/358960/header.jpg?t=1667408434",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/358960/ss_f22f1ab991443b4495228db6f66345e37c3f2b27.1920x1080.jpg?t=1667408434",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/358960/ss_e8adf01c01969386781884cfd3b2193aefb02d59.1920x1080.jpg?t=1667408434",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/358960/ss_b8948e01090e477c4ac6430bcd03cf6a6f10aac4.1920x1080.jpg?t=1667408434",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/358960/ss_93fcdbe59076e835b890571c31b54d5c0c8bc20a.1920x1080.jpg?t=1667408434",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/358960/ss_f1c3453c44e849cbe09192ba2fd8cea71fe5ece6.1920x1080.jpg?t=1667408434",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/358960/ss_6299d7f7c858506657ad55390e7acf1bcf4f9612.1920x1080.jpg?t=1667408434"
    ],
    "hints": {
      "tagline": {
        "fr": "Fuyez la destruction de votre métropole à grandes enjambées dans le pionnier du genre endless runner.",
        "en": "The pioneering endless runner where you outrun the destruction of your city with only one button.",
        "es": "El legendario pionero de las carreras infinitas donde saltas tejados para escapar del colapso de tu ciudad.",
        "de": "Entkomme der einstürzenden Skyline mit nur einer einzigen Taste im Urvater aller Endless-Runner-Spiele.",
        "ja": "ビル街が崩壊していく中、たった1つのボタン操作で屋根から屋根へと跳び移り逃げ続ける元祖エンドレスランナー。",
        "pt-BR": "Fuja do colapso da sua cidade saltando telhados com apenas um botão no clássico pioneiro dos endless runners."
      },
      "composer": "Danny Baranowsky"
    }
  },
  {
    "id": "a-monsters-expedition",
    "title": "A Monster's Expedition",
    "releaseYear": 2020,
    "genre": [
      "Puzzle",
      "Cozy",
      "Exploration",
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
    "developer": "Draknek & Friends",
    "steamUrl": "https://store.steampowered.com/app/1052990/",
    "itchUrl": "https://draknek.itch.io/a-monsters-expedition",
    "headerImage": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1052990/10d66b8b0bce06dabdfec1f770b36039a8daa258/header.jpg?t=1781709589",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1052990/ss_63731ffd4a9659b88021a354ffd675676b30099e.1920x1080.jpg?t=1781709589",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1052990/ss_0afd2fe1e7f29bc8016f24c01fb0ee48c9d769b6.1920x1080.jpg?t=1781709589",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1052990/ss_ae51cff26969456b2b91d9ac2da74fe19848bed9.1920x1080.jpg?t=1781709589",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1052990/ss_c952ba48db32d00a6e5a17aec4baf5a6d256e806.1920x1080.jpg?t=1781709589",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1052990/ss_d8321b6b0e76e74b181ccb2466479259e7add995.1920x1080.jpg?t=1781709589",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1052990/ss_63731ffd4a9659b88021a354ffd675676b30099e.1920x1080.jpg?t=1781709589"
    ],
    "hints": {
      "tagline": {
        "fr": "Abattez des troncs d'arbres pour créer des ponts et explorer des îles paisibles aux yeux de monstres curieux.",
        "en": "A charming and relaxing open-world puzzle adventure about monsters exploring human artifacts across cozy islands.",
        "es": "Una encantadora aventura de puzles en mundo abierto donde talas troncos para cruzar entre islas serenas.",
        "de": "Fälle Bäume und baue Brücken zwischen idyllischen Inseln in diesem zauberhaften Open-World-Denkspiel.",
        "ja": "木を倒して丸太の橋を作り、のどかな島々を渡り歩きながら人間の遺物を観察する心温まるオープンワールドパズル。",
        "pt-BR": "Derrube troncos para criar pontes e explorar ilhas pacíficas sob o olhar curioso de monstros gentis."
      },
      "composer": "Eli Rainsberry"
    }
  },
  {
    "id": "later-alligator",
    "title": "Later Alligator",
    "releaseYear": 2019,
    "genre": [
      "Point & Click",
      "Comédie",
      "Mini-Jeux",
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
    "developer": "Pillow Fight & SmallBü",
    "steamUrl": "https://store.steampowered.com/app/966320/",
    "itchUrl": "https://pillowfight.itch.io/later-alligator",
    "headerImage": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/966320/header.jpg?t=1789578781",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/966320/ss_7fb90a8b867cf913f5e5ed6ab51dd238b2ce812a.1920x1080.jpg?t=1789578781",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/966320/ss_bf8fb175f0b99b208507136bb6b13b817ef3a6a5.1920x1080.jpg?t=1789578781",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/966320/ss_c90eea63e8c352e850b54d73289502eb7d6f56c9.1920x1080.jpg?t=1789578781",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/966320/ss_0c8805535f1fb49772df1d2ac0a9a141506ccf7f.1920x1080.jpg?t=1789578781",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/966320/ss_0fe50629cbd71366d616b6c3cb64eab4e0c3f739.1920x1080.jpg?t=1789578781",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/966320/ss_80437d2253ae5d05a77ab8ac68a75d9359f8b3cd.1920x1080.jpg?t=1789578781"
    ],
    "hints": {
      "tagline": {
        "fr": "Aidez Pat l'alligator à déjouer un complot familial dans une comédie animée regorgeant de mini-jeux délirants.",
        "en": "Help Pat the alligator uncover what conspiracy his family is planning in this animated, mini-game rich mystery.",
        "es": "Ayuda a Pat el caimán a descubrir la conspiración que trama su familia en una comedia llena de minijuegos.",
        "de": "Löse eine schrullige Alligator-Familienverschwörung in einer handgezeichneten Stadt voller Mini-Spiele.",
        "ja": "個性豊かで怪しいワニの一族と多彩なミニゲームで交流し、秘密の陰謀の真相を暴くユーモラスな推理アドベンチャー。",
        "pt-BR": "Ajude o jacaré Pat a desvendar a conspiração que sua família está tramando nesta animada comédia cheia de minijogos."
      },
      "composer": "2 Mello"
    }
  },
  {
    "id": "bugarden",
    "title": "BuGarden",
    "releaseYear": 2026,
    "genre": [
      "Simulation",
      "Cozy",
      "Farming",
      "Méditatif"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
    },
    "developer": "西梅树工作室",
    "steamUrl": "https://store.steampowered.com/app/4289410/",
    "headerImage": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4289410/75c44fc15c78405cee2442ec67ccc464baaa4e49/header.jpg?t=1790050993",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4289410/99b779ef4400ecb7f4ae4e9412ca34ad95dea34a/ss_99b779ef4400ecb7f4ae4e9412ca34ad95dea34a.1920x1080.jpg?t=1790050993",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4289410/2862bfb39b3e1b4ffa8ffbbec9b1d989ee4966a1/ss_2862bfb39b3e1b4ffa8ffbbec9b1d989ee4966a1.1920x1080.jpg?t=1790050993",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4289410/103555223a508bdd24a1ad87e07fb5185c20d1ba/ss_103555223a508bdd24a1ad87e07fb5185c20d1ba.1920x1080.jpg?t=1790050993",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4289410/f83e2b83bd0a9928a3e6b98fc481e3a0f92864ec/ss_f83e2b83bd0a9928a3e6b98fc481e3a0f92864ec.1920x1080.jpg?t=1790050993",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4289410/504117c3fd5b66612e87ee1767eb69026838eac9/ss_504117c3fd5b66612e87ee1767eb69026838eac9.1920x1080.jpg?t=1790050993",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4289410/a33c9ef2e7158e03530b608422988ff490657df5/ss_a33c9ef2e7158e03530b608422988ff490657df5.1920x1080.jpg?t=1790050993"
    ],
    "hints": {
      "tagline": {
        "fr": "Cultivez un jardin secret peuplé d'insectes charmants dans une parenthèse relaxante au bas de votre bureau.",
        "en": "A cozy little flower garden that lives at the bottom of your screen, buzzing with gentle critters.",
        "es": "Un acogedor jardín de flores que florece tranquilamente en la parte inferior de tu pantalla.",
        "de": "Ein friedvoller digitaler Blumengarten mit sanftem Insektensummen für den unteren Bildschirmrand.",
        "ja": "画面の隅で色とりどりの花が咲き誇り、愛らしい虫たちが集う穏やかで心地よいデスクトップガーデン。",
        "pt-BR": "Cultive um jardim encantador repleto de insetos simpáticos no rodapé da sua tela nesta experiência relaxante."
      },
      "composer": "西梅树工作室 (Plum Tree Studio)"
    }
  },
  {
    "id": "celeste-classic-pico8",
    "title": "Celeste Classic (PICO-8)",
    "releaseYear": 2015,
    "genre": [
      "Platformer",
      "Action",
      "Rétro"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
    },
    "developer": "Maddy Thorson & Noel Berry",
    "itchUrl": "https://maddymakesgamesinc.itch.io/celesteclassic",
    "playInBrowserUrl": "https://www.lexaloffle.com/bbs/?tid=2145",
    "isFree": true,
    "headerImage": "https://img.itch.zone/aW1hZ2UvMzEzMTgvMTMzNjQyLmdpZg==/original/vIUIrE.gif",
    "screenshots": [
      "https://img.itch.zone/aW1hZ2UvMzEzMTgvMTMzNjQyLmdpZg==/original/vIUIrE.gif",
      "https://www.lexaloffle.com/bbs/cposts/1/15133.p8.png",
      "https://img.itch.zone/aW1hZ2UvMzEzMTgvMTMzNjQyLmdpZg==/original/vIUIrE.gif",
      "https://www.lexaloffle.com/bbs/cposts/1/15133.p8.png",
      "https://img.itch.zone/aW1hZ2UvMzEzMTgvMTMzNjQyLmdpZg==/original/vIUIrE.gif",
      "https://www.lexaloffle.com/bbs/cposts/1/15133.p8.png"
    ],
    "hints": {
      "tagline": {
        "fr": "Le prototype mythique développé en quatre jours qui a donné naissance au chef-d'œuvre de la plateforme moderne.",
        "en": "The legendary 4-day PICO-8 prototype that gave birth to the acclaimed masterpiece Celeste.",
        "es": "El legendario prototipo de 4 días en PICO-8 que dio origen a la aclamada obra maestra Celeste.",
        "de": "Der legendäre 4-Tage-PICO-8-Prototyp, aus dem das gefeierte Meisterwerk Celeste hervorging.",
        "ja": "わずか4日間のゲームジャムで生み出され、後に不朽の傑作『Celeste』へと結実した伝説のPICO-8プロトタイプ。",
        "pt-BR": "O lendário protótipo de 4 dias no PICO-8 que deu origem à aclamada obra-prima Celeste."
      },
      "composer": "Lena Raine"
    }
  },
  {
    "id": "adventures-with-anxiety",
    "title": "Adventures With Anxiety!",
    "releaseYear": 2019,
    "genre": [
      "Narratif",
      "Psychologique",
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
    "developer": "Nicky Case",
    "itchUrl": "https://ncase.itch.io/anxiety",
    "playInBrowserUrl": "https://ncase.itch.io/anxiety",
    "isFree": true,
    "headerImage": "https://img.itch.zone/aW1hZ2UvNTMxNzg0LzI3NjQ4NDUucG5n/original/zH2u1U.png",
    "screenshots": [
      "https://img.itch.zone/aW1hZ2UvNTMxNzg0LzI3NjQ4NDUucG5n/original/zH2u1U.png",
      "https://img.itch.zone/aW1hZ2UvNTMxNzg0LzI3NjQ4NDMucG5n/original/nz97AT.png",
      "https://img.itch.zone/aW1hZ2UvNTMxNzg0LzI3NjQ4NDYucG5n/original/jdO3ce.png",
      "https://img.itch.zone/aW1nLzI3NjQ4NjUucG5n/original/E5vd8l.png",
      "https://img.itch.zone/aW1hZ2UvNTMxNzg0LzI3NjQ4NDUucG5n/original/zH2u1U.png",
      "https://img.itch.zone/aW1hZ2UvNTMxNzg0LzI3NjQ4NDMucG5n/original/nz97AT.png"
    ],
    "hints": {
      "tagline": {
        "fr": "Incarnez votre propre anxiété sous la forme d'un loup protecteur dans une expérience narrative bouleversante.",
        "en": "An empathetic interactive story where you play as your human's anxious inner watchdog trying to keep them safe.",
        "es": "Una conmovedora historia interactiva donde encarnas a la ansiedad interior que intenta proteger a su dueño.",
        "de": "Ein einfühlsames interaktives Erlebnis, in dem du die innere Angst deines Menschen als treuer Wachhund verkörperst.",
        "ja": "飼い主をあらゆる危険から守ろうと必死に警告を発する「不安」そのものとなり、心の内面を見つめる対話型ストーリー。",
        "pt-BR": "Encarne sua própria ansiedade na forma de um cão de guarda protetor nesta tocante narrativa interativa."
      },
      "composer": "Nicky Case"
    }
  },
  {
    "id": "our-life-beginnings-and-always",
    "title": "Our Life: Beginnings & Always",
    "releaseYear": 2020,
    "genre": [
      "Narratif",
      "Visual Novel",
      "Cozy",
      "Aventure"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "GB Patch Games",
    "steamUrl": "https://store.steampowered.com/app/1129190/Our_Life_Beginnings__Always/",
    "itchUrl": "https://gbpatch.itch.io/our-life",
    "isFree": true,
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1129190/ss_ec7d7dfbdbefea8918fd1142304e31d9c53c806d.1920x1080.jpg?t=1745249279",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1129190/ss_b04ea1b8ce57acd86133397939ab962ce1157876.1920x1080.jpg?t=1745249279",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1129190/ss_f439ca6120cca2ded91f5a4937cd49198af6a4b3.1920x1080.jpg?t=1745249279",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1129190/ss_d7440247c5e93deae54d2dfde4de843c43eed440.1920x1080.jpg?t=1745249279",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1129190/ss_9f7d110b4eb63be810122d4d0e7786a9b7ada214.1920x1080.jpg?t=1745249279",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1129190/ss_4ddcc021634fde9668275b0c2c79bff2cb2533ae.1920x1080.jpg?t=1745249279"
    ],
    "hints": {
      "tagline": {
        "fr": "Grandissez de l'enfance à l'âge adulte aux côtés du garçon d'à côté dans un visual novel profondément réconfortant.",
        "en": "Grow from childhood to adulthood alongside the boy next door in a deeply comforting, customizable visual novel.",
        "es": "Crece desde la infancia hasta la madurez junto al chico de al lado en una reconfortante novela visual.",
        "de": "Begleite das Aufwachsen zweier Jugendlicher vom Kindesalter bis zum Erwachsenwerden in einer warmherzigen Visual Novel.",
        "ja": "幼少期から青年期へと移ろう日々を隣人の少年コーヴとともに歩み、心を通わせていく温かく優しい選択型ノベル。",
        "pt-BR": "Cresça da infância à vida adulta ao lado do garoto da casa vizinha nesta acolhedora e comovente visual novel."
      },
      "composer": "GB Patch"
    }
  },
  {
    "id": "a-date-with-death",
    "title": "A Date with Death",
    "releaseYear": 2023,
    "genre": [
      "Narratif",
      "Visual Novel",
      "Comédie",
      "Aventure"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "Two and a Half Studios",
    "steamUrl": "https://store.steampowered.com/app/2415010/A_Date_with_Death/",
    "itchUrl": "https://twoandahalfstudios.itch.io/a-date-with-death",
    "isFree": true,
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2415010/ss_c5a1b3158e3fd43d1ee6173a54db51c4f0249fb2.1920x1080.jpg?t=1771278803",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2415010/ss_d683e3d0ec38f9933fd9eb3e716ecdeaf73c3e2b.1920x1080.jpg?t=1771278803",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2415010/ss_8f0da3866afd3c49589c368217db302df93851ba.1920x1080.jpg?t=1771278803",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2415010/ss_6e7974fa469762617bfa7484a5382874261a6f41.1920x1080.jpg?t=1771278803",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2415010/ss_5048c9a401ecf34a91606a4b8189b84fc9ae6957.1920x1080.jpg?t=1771278803",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2415010/ss_4153ea4c60fe55046c5abc79227f6b2fcf6503ed.1920x1080.jpg?t=1771278803"
    ],
    "hints": {
      "tagline": {
        "fr": "Pariez votre âme contre la Faucheuse lors d'appels vidéo quotidiens dans une comédie romantique surnaturelle.",
        "en": "Enter a week-long webcam bet against the Grim Reaper to keep your soul in this supernatural romance chat.",
        "es": "Apuesta tu alma contra la Muerte en una semana de videollamadas en esta divertida comedia romántica.",
        "de": "Wette eine Woche lang per Webcam gegen den Sensenmann um deine Seele in diesem übernatürlichen Romantik-Chat.",
        "ja": "自分の魂の存亡を賭けて、画面の向こうの死神と7日間のビデオチャットを交わすユーモラスなオカルトロマンスノベル。",
        "pt-BR": "Aposte sua alma contra a Morte em chamadas de vídeo diárias nesta envolvente comédia romântica sobrenatural."
      },
      "composer": "Two and a Half Studios"
    }
  },
  {
    "id": "blooming-panic",
    "title": "Blooming Panic",
    "releaseYear": 2021,
    "genre": [
      "Narratif",
      "Simulation",
      "Comédie"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "robobarbie",
    "itchUrl": "https://robobarbie.itch.io/blooming-panic",
    "isFree": true,
    "headerImage": "https://img.itch.zone/aW1hZ2UvMTEwMzY1MS83Njk3NTM1LnBuZw==/original/J%2BNMeT.png",
    "screenshots": [
      "https://img.itch.zone/aW1hZ2UvMTEwMzY1MS83Njk3NTM1LnBuZw==/original/J%2BNMeT.png",
      "https://img.itch.zone/aW1hZ2UvMTEwMzY1MS83Njk3NTM2LnBuZw==/original/wzBsJY.png",
      "https://img.itch.zone/aW1hZ2UvMTEwMzY1MS83Njk3NTM4LnBuZw==/original/rwA2DG.png",
      "https://img.itch.zone/aW1hZ2UvMTEwMzY1MS83Njk3NTM3LnBuZw==/original/tOMipD.png",
      "https://img.itch.zone/aW1hZ2UvMTEwMzY1MS83Njk3NTM5LnBuZw==/original/XPAgAX.png",
      "https://img.itch.zone/aW1hZ2UvMTEwMzY1MS83Njk3NTQwLnBuZw==/original/KFooG4.png"
    ],
    "hints": {
      "tagline": {
        "fr": "Rejoignez un serveur de discussion rétro et tissez des amitiés chaleureuses au cœur d'une communauté virtuelle.",
        "en": "Join a cozy chat server and bond with an eccentric web community in this text-based romance simulation.",
        "es": "Entra en un servidor de chat retro y forja amistades inolvidables con una peculiar comunidad en línea.",
        "de": "Tritt einem gemütlichen Nostalgie-Chatserver bei und knüpfe tiefe Freundschaften in einer lebendigen Community.",
        "ja": "レトロなチャットサーバーに飛び込み、個性豊かなネットの仲間たちとテキストを交わして絆を深める会話シミュレーター。",
        "pt-BR": "Entre em um servidor de bate-papo nostálgico e faça amizades sinceras com uma comunidade virtual inesquecível."
      },
      "composer": "robobarbie"
    }
  },
  {
    "id": "owlboy",
    "title": "Owlboy",
    "releaseYear": 2016,
    "genre": [
      "Aventure",
      "Platformer",
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
    "developer": "D-Pad Studio",
    "steamUrl": "https://store.steampowered.com/app/115800/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/115800/ss_96a87f5244c853e2c26b179180871cde7657d0a7.1920x1080.jpg?t=1789585814",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/115800/ss_bc3d33f0f888e90feb0d5c884b7e66b2a5685804.1920x1080.jpg?t=1789585814",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/115800/ss_4f712f38ab777676d092a0975e24c0cb37aea67e.1920x1080.jpg?t=1789585814",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/115800/ss_e49871a898aec8c8c30290eff66f421a792d3fc2.1920x1080.jpg?t=1789585814",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/115800/ss_936b81b9cf2fb3ad18191660b63fedeab8248857.1920x1080.jpg?t=1789585814",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/115800/ss_5d7ceffe78305efe3125b2f806cb301f59531963.1920x1080.jpg?t=1789585814"
    ],
    "hints": {
      "tagline": {
        "fr": "Prenez votre envol dans la peau d'un jeune hibou muet à travers un monde céleste aux panoramas somptueux.",
        "en": "Fly through gorgeous pixel-art skies and carry your companions into battle in this acclaimed story-driven adventure.",
        "es": "Vuela por cielos deslumbrantes en pixel art encarnando a un joven búho mudo en una aventura inolvidable.",
        "de": "Fliege als stummer Eulenjunge Otus durch malerische Himmelsinseln und rette dein Dorf in einem herzerwärmenden Epos.",
        "ja": "声を出せない心優しきフクロウ族の少年オータスが、仲間たちを運んで大空を翔ける美しいピクセルアート冒険活劇。",
        "pt-BR": "Voe por céus deslumbrantes em pixel art como um jovem garoto-coruja mudo em uma jornada inesquecible."
      },
      "composer": "Jonathan Geer"
    }
  },
  {
    "id": "happy-wheels",
    "title": "Happy Wheels",
    "releaseYear": 2026,
    "genre": [
      "Physique",
      "Platformer",
      "Comédie",
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
    "developer": "Jim Bonacci",
    "steamUrl": "https://store.steampowered.com/app/4705510/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4705510/5f3e3805198aa6db2ed7d8b2282834878471e8a0/ss_5f3e3805198aa6db2ed7d8b2282834878471e8a0.1920x1080.jpg?t=1790029771",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4705510/528077b2bc970c98dd1036a6755306fe2a905fa8/ss_528077b2bc970c98dd1036a6755306fe2a905fa8.1920x1080.jpg?t=1790029771",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4705510/f1c083b29cf042e5880c847f9fc84cb36d601dde/ss_f1c083b29cf042e5880c847f9fc84cb36d601dde.1920x1080.jpg?t=1790029771",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4705510/124b6da23f37f0eb5ac8e2dcbb9001a6bc5bdcc8/ss_124b6da23f37f0eb5ac8e2dcbb9001a6bc5bdcc8.1920x1080.jpg?t=1790029771",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4705510/47673307554fd9b20b26726765968e084b5387fd/ss_47673307554fd9b20b26726765968e084b5387fd.1920x1080.jpg?t=1790029771",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4705510/b804fc475fc6bbf6a7e48e66d5f8f795fb922998/ss_b804fc475fc6bbf6a7e48e66d5f8f795fb922998.1920x1080.jpg?t=1790029771"
    ],
    "hints": {
      "tagline": {
        "fr": "Franchissez des parcours d'obstacles mortels sur des véhicules de fortune aux chutes spectaculaires et hilarantes.",
        "en": "Choose your inadequately prepared racer and disregard severe consequences in your pursuit of victory.",
        "es": "Supera pistas de obstáculos caóticas con sillas de ruedas y carritos en este clásico de humor negro.",
        "de": "Steuere unzureichend ausgerüstete Fahrer durch mörderische Hindernisparcours voller schwarzem Humor.",
        "ja": "車椅子やセグウェイに乗った無防備なキャラを操り、トラップだらけの悪路を疾走する伝説の物理アクション死にゲー。",
        "pt-BR": "Ultrapasse pistas de obstáculos letais em veículos improvisados com física hilária e momentos caóticos."
      },
      "composer": "Jim Bonacci"
    }
  },
  {
    "id": "beat-saber",
    "title": "Beat Saber",
    "releaseYear": 2019,
    "genre": [
      "Rythme",
      "Action",
      "Simulation",
      "Sci-Fi"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "developer": "Beat Games",
    "steamUrl": "https://store.steampowered.com/app/620980/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/620980/6204b8e313db035cbcaf30ad02ed8ee7cbdcfb18/ss_6204b8e313db035cbcaf30ad02ed8ee7cbdcfb18.1920x1080.jpg?t=1789636674",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/620980/ss_7df971fd7781d69dc455b15a400a6973ed7d3f36.1920x1080.jpg?t=1789636674",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/620980/ss_e1b161014deff483fa6bd8147a102b83b053e201.1920x1080.jpg?t=1789636674",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/620980/ss_b39d40cd4c53c9fd737ffde535cfdffc17662862.1920x1080.jpg?t=1789636674",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/620980/ss_1881ae4f153faf0d1ccecca60fbdac5b43ad57eb.1920x1080.jpg?t=1789636674",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/620980/ss_114dc9a9f27666b2d56801ba49a1db8fa202b6ee.1920x1080.jpg?t=1789636674"
    ],
    "hints": {
      "tagline": {
        "fr": "Tranchez les cubes en rythme au son de morceaux électro envoûtants dans le roi des jeux musicaux en VR.",
        "en": "Slash the beats of adrenaline-pumping music as they fly towards you in this world-famous VR rhythm sensation.",
        "es": "Corta los cubos al compás de canciones energéticas armado con sables de luz en la cumbre del ritmo en realidad virtual.",
        "de": "Zerteile im Takt pulsierender Beats anfliegende Rhythmus-Würfel mit leuchtenden Lichtschwertern in VR.",
        "ja": "飛来するキューブを両手の光るサーベルでリズムに乗って両断する、世界中を熱狂させたVRリズムゲームの金字塔。",
        "pt-BR": "Corte os cubos luminosos no ritmo da música com sabres de energia no jogo mais aclamado de realidade virtual."
      },
      "composer": "Jaroslav Beck"
    }
  },
  {
    "id": "graveyard-keeper",
    "title": "Graveyard Keeper",
    "releaseYear": 2018,
    "genre": [
      "Gestion",
      "RPG",
      "Simulation",
      "Artisanat",
      "Dark Fantasy"
    ],
    "artStyle": {
      "fr": "Pixel Art",
      "en": "Pixel Art"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
      "en": "2D Top-down"
    },
    "developer": "Lazy Bear Games",
    "steamUrl": "https://store.steampowered.com/app/599140/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/599140/ss_7616d4343808620c0853a9ee5f1e21597a20b042.1920x1080.jpg?t=1789490186",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/599140/ss_9533ec3b7abd3300e9873dcd0d2bd5794a8fe54b.1920x1080.jpg?t=1789490186",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/599140/ss_13f5648759859d6e681200be67581ca3cc4aecda.1920x1080.jpg?t=1789490186",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/599140/ss_2edf1779ad9992da1ae8f0f982a80f8945506154.1920x1080.jpg?t=1789490186",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/599140/ss_a929a220c5acd0ed33e47eda1448fcd2347dd718.1920x1080.jpg?t=1789490186",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/599140/ss_ed94df58a35110c78a5de4ea20a6922a5f13aaa9.1920x1080.jpg?t=1789490186"
    ],
    "hints": {
      "tagline": {
        "fr": "Gérez un cimetière médiéval en jonglant avec des dilemmes moraux douteux et une bonne dose d'humour noir.",
        "en": "Build and manage a medieval graveyard while making ethically questionable decisions in this dark comedy sim.",
        "es": "Gestiona un cementerio medieval, optimiza recursos y toma decisiones éticamente dudosas con humor negro.",
        "de": "Leite einen mittelalterlichen Friedhof mit fragwürdiger Moral, finsterem Witz und cleverem Handwerk.",
        "ja": "中世の墓守となり、遺体の埋葬から臓器の密売まで倫理を問われる選択を重ねながら発展させるブラックコメディ経営シム。",
        "pt-BR": "Administre um cemitério medieval enfrentando dilemas éticos duvidosos com muito humor negro e comércio."
      },
      "composer": "Hamza El Hamri"
    }
  },
  {
    "id": "drapline",
    "title": "DRAPLINE",
    "releaseYear": 2026,
    "genre": [
      "Aventure",
      "RPG",
      "Simulation",
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
    "developer": "KANAWO",
    "steamUrl": "https://store.steampowered.com/app/3103780/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3103780/28fed18f3fcb7a0f714751dc4480c41786011e79/ss_28fed18f3fcb7a0f714751dc4480c41786011e79.1920x1080.jpg?t=1790232428",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3103780/259518be7f4f0cc76931607eb1b9b3eba11f04b7/ss_259518be7f4f0cc76931607eb1b9b3eba11f04b7.1920x1080.jpg?t=1790232428",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3103780/29690c5270b66a364227c0d6227c0f51adf42487/ss_29690c5270b66a364227c0d6227c0f51adf42487.1920x1080.jpg?t=1790232428",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3103780/8b0f9225bea7fa7d14c5c6dc01377de905690599/ss_8b0f9225bea7fa7d14c5c6dc01377de905690599.1920x1080.jpg?t=1790232428",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3103780/61f948b1f27a627ef921e57ebb5d3ff8fa2a6151/ss_61f948b1f27a627ef921e57ebb5d3ff8fa2a6151.1920x1080.jpg?t=1790232428",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3103780/f01fd9a71a7daac0733e2dff1a5de67666cf594c/ss_f01fd9a71a7daac0733e2dff1a5de67666cf594c.1920x1080.jpg?t=1790232428"
    ],
    "hints": {
      "tagline": {
        "fr": "DRAPLINE est un jeu d'entraînement rogue-lite où vous élevez une jeune fille dragon gloutonne pour la rendre la plus puissante en un an. Nourrissez-la pour développer ses compétences et repousser le cataclysme !",
        "en": "&quot;DRAPLINE&quot; is a roguelite training game where you raise a dragon girl who eats anything and train her to become the strongest in one year. Feed her a variety of things to increase her abilities, combine various skills to build your own strategy, and defeat the impending catastrophe!"
      },
      "composer": "KANAWO"
    }
  },
  {
    "id": "stick-it-to-the-stickman",
    "title": "Stick It to the Stickman",
    "releaseYear": 2026,
    "genre": [
      "Beat them all",
      "Roguelite",
      "Action",
      "Physique",
      "Comédie"
    ],
    "artStyle": {
      "fr": "3D Stylisée",
      "en": "Stylized 3D"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
    },
    "developer": "Free Lives",
    "steamUrl": "https://store.steampowered.com/app/2085540/",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2085540/91888fdf60da6e911c5d1df8e4372cb6937a1e24/ss_91888fdf60da6e911c5d1df8e4372cb6937a1e24.1920x1080.jpg?t=1790179341",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2085540/9d793d6103d59d439f1d864edc1e679597015cb8/ss_9d793d6103d59d439f1d864edc1e679597015cb8.1920x1080.jpg?t=1790179341",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2085540/6c75a999d9dff4ac141b992b861b62768f0df1f6/ss_6c75a999d9dff4ac141b992b861b62768f0df1f6.1920x1080.jpg?t=1790179341",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2085540/976c437f1cba6a15f72ba13de4423cf663a1d428/ss_976c437f1cba6a15f72ba13de4423cf663a1d428.1920x1080.jpg?t=1790179341",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2085540/637b578979d6866dc3d413a4c62c93801a7cdc67/ss_637b578979d6866dc3d413a4c62c93801a7cdc67.1920x1080.jpg?t=1790179341",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2085540/2b22bfe5c4c3f9e65cccfd83558502918c6c78e2/ss_2b22bfe5c4c3f9e65cccfd83558502918c6c78e2.1920x1080.jpg?t=1790179341"
    ],
    "hints": {
      "tagline": {
        "fr": "Stick it to the Stickman est un beat them all rogue-lite dans lequel vous vous hissez au sommet de la hiérarchie par la violence. Développez des portfolios de combat dévastateurs pour débloquer de nouveaux employés et modes de jeu tout en augmentant votre valeur actionnariale.",
        "en": "Stick it to the Stickman is a rogue-lite physics brawler where you brutally displace your way up the corporate ladder. Assemble devastating combat portfolios, unlocking new workers and game modes as you increase shareholder value."
      },
      "composer": "Jaybooty"
    }
  }
];

// Pool dynamique pour les jeux quotidiens (permet d'inclure les pépites promues via l'admin et exclure les jeux retirés)
// Pool stable pour les jeux quotidiens (sanctuarisé sur INDIE_GAMES pour garantir l'immutabilité stricte des défis du jour et du jeu mis en avant)
export function getActiveDailyPool(): Game[] {
  return INDIE_GAMES;
}

export function setCustomDailyPool(_pool: Game[] | null) {
  // Sanctuarisé : le pool des défis quotidiens suit le cycle mensuel déterministe
}

// Helper déterministe pour obtenir le jeu du jour basé sur le calendrier mensuel équitable
export function getDailyGame(dateString: string, offset = 0, pool?: Game[]): Game {
  if (offset === 0) {
    return getScheduledDailyGame(dateString, 'screenle', pool);
  }
  if (offset === 3) {
    return getScheduledDailyGame(dateString, 'indledle', pool);
  }
  if (offset === 17) {
    return getScheduledDailyGame(dateString, 'dailyGem', pool);
  }

  // Repli déterministe si offset personnalisé
  const gamesPool = pool && pool.length > 0 ? pool : INDIE_GAMES;
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = (hash << 5) - hash + dateString.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash + offset) % gamesPool.length;
  return gamesPool[index];
}

// Helper déterministe pour obtenir le jeu du jour pour Profille (sans collision avec Screenle ni Indledle)
export function getDailyProfilleGame(dateString: string, pool?: Game[]): Game {
  return getScheduledDailyGame(dateString, 'profille', pool);
}

export { getScheduledDailyGame, getScheduledDay };


