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
      "en": "In Active Development (TBA)",
      "es": "En desarrollo activo (TBA)",
      "de": "In aktiver Entwicklung (TBA)",
      "ja": "鋭意開発中（時期未定）",
      "pt-BR": "Em desenvolvimento ativo (TBA)"
    },
    "genres": [
      {
        "fr": "RPG / Simulation",
        "en": "RPG / Simulation",
        "es": "RPG / Simulación",
        "de": "RPG / Simulation",
        "ja": "RPG / シミュレーション",
        "pt-BR": "RPG / Simulação"
      },
      {
        "fr": "Pixel Art",
        "en": "Pixel Art",
        "es": "Pixel Art",
        "de": "Pixel-Art",
        "ja": "ドット絵",
        "pt-BR": "Pixel Art"
      },
      {
        "fr": "Aventure",
        "en": "Adventure",
        "es": "Aventura",
        "de": "Abenteuer",
        "ja": "アドベンチャー",
        "pt-BR": "Aventura"
      }
    ],
    "platforms": [
      "PC",
      "Consoles"
    ],
    "description": {
      "fr": "Par Eric Barone, créateur solo de Stardew Valley. Établissez votre chocolaterie hantée dans une nouvelle ville, collectez des ingrédients rares et liez-vous d'amitié avec les habitants et les fantômes.",
      "en": "From Eric Barone, the solo creator of Stardew Valley. Run a haunted chocolate shop in a magical town, gather rare ingredients, and form bonds with townsfolk and spirits.",
      "es": "De Eric Barone, creador en solitario de Stardew Valley. Dirige una chocolatería embrujada en una ciudad mágica, recolecta ingredientes raros y entabla amistad con habitantes y fantasmas.",
      "de": "Von Eric Barone, dem Solo-Schöpfer von Stardew Valley. Leite einen Spuk-Schokoladenladen in einer magischen Stadt, sammle seltene Zutaten und schließe Freundschaft mit Bewohnern und Geistern.",
      "ja": "『Stardew Valley』の生みの親Eric Barone氏が手掛ける新作。魔法の街でお化けのチョコレート店を営み、珍しい材料を集め、住人や幽霊たちと心を通わせましょう。",
      "pt-BR": "De Eric Barone, o criador solo de Stardew Valley. Comande uma chocolateria assombrada em uma cidade mágica, reúna ingredientes raros e faça amizade com moradores e espíritos."
    },
    "highlight": {
      "fr": "La nouvelle œuvre majeure de ConcernedApe axée sur l'artisanat, l'exploration et le fantastique.",
      "en": "ConcernedApe's highly anticipated follow-up emphasizing confectionery craft and enchanting action.",
      "es": "La esperadísima nueva obra de ConcernedApe centrada en la repostería artesanal, la exploración y la fantasía.",
      "de": "ConcernedApes mit Spannung erwarteter Nachfolger mit Fokus auf Konditoreikunst, Erkundung und Magie.",
      "ja": "製菓クラフト、探検、魅惑的なアクションに焦点を当てたConcernedApeの待望の最新作。",
      "pt-BR": "A nova obra tão esperada de ConcernedApe com ênfase na fabricação de chocolates, exploração e encanto."
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
      "en": "Late 2026 / 2027",
      "es": "Finales de 2026 / 2027",
      "de": "Ende 2026 / 2027",
      "ja": "2026年後半 / 2027年",
      "pt-BR": "Final de 2026 / 2027"
    },
    "genres": [
      {
        "fr": "Metroidvania",
        "en": "Metroidvania",
        "es": "Metroidvania",
        "de": "Metroidvania",
        "ja": "メトロイドヴァニア",
        "pt-BR": "Metroidvania"
      },
      {
        "fr": "Action Sombre",
        "en": "Dark Action",
        "es": "Acción Oscura",
        "de": "Düstere Action",
        "ja": "ダークアクション",
        "pt-BR": "Ação Sombria"
      },
      {
        "fr": "Platformer 2D",
        "en": "2D Platformer",
        "es": "Plataformas 2D",
        "de": "2D-Plattformer",
        "ja": "2Dプラットフォーマー",
        "pt-BR": "Plataforma 2D"
      }
    ],
    "platforms": [
      "PC",
      "Consoles"
    ],
    "steamUrl": "https://store.steampowered.com/app/1614330/Crowsworn/",
    "description": {
      "fr": "Explorez le royaume maudit de Fearanndal dans la peau d'un corbeau armé d'une faux, de pistolets et de pouvoirs obscurs dans un Metroidvania nerveux dessiné à la main.",
      "en": "Explore the cursed realm of Fearanndal as a plague-masked crow wielding a scythe, dual pistols, and dark magic in a hand-drawn, high-intensity Metroidvania.",
      "es": "Explora el reino maldito de Fearanndal encarnando a un cuervo con máscara de peste que empuña una guadaña, dos pistolas y magia oscura en un intenso Metroidvania dibujado a mano.",
      "de": "Erkunde das verfluchte Reich Fearanndal als Pestmasken-Krähe mit Sense, Zwillingspistolen und dunkler Magie in einem handgezeichneten, rasanten Metroidvania.",
      "ja": "ペストマスクを被ったカラスとなり、大鎌、二丁拳銃、闇の魔術を操り、手描きアニメーションの超高難度メトロイドヴァニアで呪われた地フィアランダルを探索しよう。",
      "pt-BR": "Explore o reino amaldiçoado de Fearanndal como um corvo mascarado empunhando uma foice, pistolas duplas e magia sombria em um Metroidvania dinâmico desenhado à mão."
    },
    "highlight": {
      "fr": "Combats ultra-dynamiques et fluidité exemplaire salués par la communauté Metroidvania.",
      "en": "Kinetic combat loop and stylish hand-drawn animation praised across the indie community.",
      "es": "Combates ultradinámicos y una fluidez ejemplar elogiados por la comunidad de Metroidvania.",
      "de": "Ultra-dynamische Kämpfe und stilvolle Handzeichnungen, gefeiert von der Metroidvania-Community.",
      "ja": "メトロイドヴァニア界隈で絶賛される、疾走感あふれる戦闘と流麗な手描きアニメーション。",
      "pt-BR": "Combates ultra-dinâmicos e fluidez exemplar aclamados pela comunidade de Metroidvania."
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
      "en": "2027+ (TBA)",
      "es": "2027+ (TBA)",
      "de": "2027+ (TBA)",
      "ja": "2027年以降（時期未定）",
      "pt-BR": "2027+ (TBA)"
    },
    "genres": [
      {
        "fr": "Survie / Sandbox",
        "en": "Survival / Sandbox",
        "es": "Supervivencia / Sandbox",
        "de": "Überleben / Sandbox",
        "ja": "サバイバル / サンドボックス",
        "pt-BR": "Sobrevivência / Sandbox"
      },
      {
        "fr": "Monde Ouvert",
        "en": "Open World",
        "es": "Mundo Abierto",
        "de": "Offene Welt",
        "ja": "オープンワールド",
        "pt-BR": "Mundo Aberto"
      },
      {
        "fr": "Aventure Coop",
        "en": "Co-op Adventure",
        "es": "Aventura Cooperativa",
        "de": "Koop-Abenteuer",
        "ja": "協力アドベンチャー",
        "pt-BR": "Aventura Cooperativa"
      }
    ],
    "platforms": [
      "PC"
    ],
    "steamUrl": "https://store.steampowered.com/app/2719590/Light_No_Fire/",
    "description": {
      "fr": "Par l'équipe de No Man's Sky. Une planète fantastique entière générée de façon procédurale à l'échelle 1:1, à explorer librement à pied, en bateau ou à dos de dragon.",
      "en": "From Hello Games. An entire Earth-sized procedural fantasy planet rendered at true 1:1 scale, shared online with seamless exploration on foot, boat, or flying mounts.",
      "es": "Del equipo de No Man's Sky. Un planeta de fantasía completo generado proceduralmente a escala 1:1, para explorar libremente a pie, en barco o a lomos de dragón.",
      "de": "Vom No Man's Sky-Team. Ein ganzer, prozedural generierter Fantasy-Planet im echten 1:1-Maßstab, nahtlos zu Fuß, per Boot oder auf Flugdrachen erkundbar.",
      "ja": "『No Man's Sky』の開発陣が贈る完全新作。1:1の実寸大スケールでプロシージャル生成された広大なファンタジー惑星を、徒歩、船、そして空飛ぶドラゴンで自由に冒険。",
      "pt-BR": "Pela equipe de No Man's Sky. Um planeta de fantasia inteiro gerado proceduralmente em escala real 1:1, para explorar livremente a pé, de barco ou no dorso de um dragão."
    },
    "highlight": {
      "fr": "Une planète partagée sans aucun écran de chargement avec construction de royaumes.",
      "en": "A boundless shared world with procedural geography, deep building systems, and aerial mount flight.",
      "es": "Un planeta compartido sin pantallas de carga con construcción de reinos y vuelos montados.",
      "de": "Ein nahtlos geteilter Planet ohne Ladebildschirme mit tiefgreifendem Städtebau und Drachenflügen.",
      "ja": "ロード画面一切なしの共有ワールドで繰り広げられる王国建築と壮大な空中飛行。",
      "pt-BR": "Um planeta compartilhado sem telas de carregamento com construção de reinos e montarias voadoras."
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
      "en": "Prochainement",
      "es": "Próximamente",
      "de": "Demnächst",
      "ja": "近日公開",
      "pt-BR": "Em breve"
    },
    "genres": [
      {
        "fr": "Plateforme 2D",
        "en": "2D Platformer",
        "es": "Plataformas 2D",
        "de": "2D-Plattformer",
        "ja": "2Dプラットフォーマー",
        "pt-BR": "Plataforma 2D"
      },
      {
        "fr": "Aventure",
        "en": "Adventure",
        "es": "Aventura",
        "de": "Abenteuer",
        "ja": "アドベンチャー",
        "pt-BR": "Aventura"
      },
      {
        "fr": "Animation Traditionnelle",
        "en": "Traditional Animation",
        "es": "Animación Tradicional",
        "de": "Traditionelle Animation",
        "ja": "手描きアニメーション",
        "pt-BR": "Animação Tradicional"
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
      "en": "A dark, whimsical platforming adventure meticulously hand-drawn frame-by-frame with zero digital tweening or procedural cut-outs.",
      "es": "Una aventura de plataformas mágica y oscura, meticulosamente dibujada y animada a mano fotograma a fotograma, sin interpolación digital ni recortes automáticos.",
      "de": "Ein düsteres, märchenhaftes Plattform-Abenteuer, sorgfältig Bild für Bild per Hand animiert – ganz ohne digitale Interpolation.",
      "ja": "デジタルの自動補間を一切使わず、1コマずつ丹念に手描きされた、ダークで幻想的な2Dプラットフォーム・アドベンチャー。",
      "pt-BR": "Uma aventura de plataforma sombria e mágica meticulosamente desenhada quadro a quadro à mão, sem qualquer interpolação digital."
    },
    "highlight": {
      "fr": "Un hommage authentique à l'âge d'or des films d'animation et des classiques 16-bits.",
      "en": "An uncompromising celebration of classic hand-animated cinema and golden-age 16-bit design.",
      "es": "Un homenaje sincero a la era dorada de las películas animadas clásicas y las joyas de 16 bits.",
      "de": "Eine kompromisslose Würdigung klassischer Zeichentrickfilme und des goldenen 16-Bit-Spieldesigns.",
      "ja": "往年のクラシックアニメ映画と16ビット黄金期への妥協なきオマージュ。",
      "pt-BR": "Uma homenagem autêntica à era de ouro do cinema de animação e aos clássicos 16-bits."
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
      "en": "2026",
      "es": "2026",
      "de": "2026",
      "ja": "2026年",
      "pt-BR": "2026"
    },
    "genres": [
      {
        "fr": "Simulation de Vie",
        "en": "Life Sim",
        "es": "Simulador de Vida",
        "de": "Lebenssimulation",
        "ja": "生活シミュレーション",
        "pt-BR": "Simulador de Vida"
      },
      {
        "fr": "École de Magie",
        "en": "Magic School",
        "es": "Escuela de Magia",
        "de": "Zauberschule",
        "ja": "魔法学校",
        "pt-BR": "Escola de Magia"
      },
      {
        "fr": "Pixel Art Isométrique",
        "en": "Isometric Pixel Art",
        "es": "Pixel Art Isométrico",
        "de": "Isometrische Pixel-Art",
        "ja": "クォータービュー・ドット絵",
        "pt-BR": "Pixel Art Isométrico"
      }
    ],
    "platforms": [
      "PC",
      "Consoles"
    ],
    "steamUrl": "https://store.steampowered.com/app/1846700/Witchbrook/",
    "description": {
      "fr": "Intégrez une académie de sorcellerie en bord de mer. Suivez vos cours de magie, cultivez des herbes mystiques, personnalisez votre intérieur et nouez des liens avec vos camarades.",
      "en": "Enroll as a witch-in-training at a coastal magical academy. Attend classes, brew potions, cultivate botanical gardens, and forge lasting relationships with townsfolk.",
      "es": "Inscríbete en una academia costera de brujería. Asiste a clases de magia, cultiva hierbas místicas, decora tu hogar y forja amistades duraderas con los habitantes.",
      "de": "Schreibe dich an einer magischen Küstenakademie ein. Besuche Unterrichtsstunden, braue Tränke, gestalte deine Bleibe und knüpfe tiefe Freundschaften.",
      "ja": "海沿いの魔法学園に入学しよう。魔術の講義を受け、薬草を育て、部屋を自分好みに飾り、個性豊かな住人たちと友情を育もう。",
      "pt-BR": "Matricule-se em uma academia mágica à beira-mar. Assista às aulas de magia, cultive ervas místicas, decore sua casa e faça amizades com os habitantes."
    },
    "highlight": {
      "fr": "Pixel art isométrique d'une minutie spectaculaire par les créateurs de Wargroove et éditeurs de Stardew Valley.",
      "en": "Detailed isometric pixel art craftsmanship by the publishers of Stardew Valley and creators of Wargroove.",
      "es": "Pixel art isométrico de una minuciosidad espectacular de los creadores de Wargroove y editores de Stardew Valley.",
      "de": "Spektakulär detaillierte isometrische Pixel-Art von den Machern von Wargroove und Publishern von Stardew Valley.",
      "ja": "『Wargroove』の開発元であり『Stardew Valley』を送り出したChucklefishによる、極めて精緻なクォータービュードット絵。",
      "pt-BR": "Pixel art isométrico de detalhes espetaculares dos criadores de Wargroove e distribuidores de Stardew Valley."
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
      "en": "Late 2026 / 2027",
      "es": "Finales de 2026 / 2027",
      "de": "Ende 2026 / 2027",
      "ja": "2026年後半 / 2027年",
      "pt-BR": "Final de 2026 / 2027"
    },
    "genres": [
      {
        "fr": "Puzzle Platformer 5D",
        "en": "5D Puzzle Platformer",
        "es": "Puzles y Plataformas 5D",
        "de": "5D-Rätsel-Plattformer",
        "ja": "5Dパズルプラットフォーマー",
        "pt-BR": "Quebra-cabeça e Plataforma 5D"
      },
      {
        "fr": "Hybride 2D / 3D",
        "en": "2D / 3D Hybrid",
        "es": "Híbrido 2D / 3D",
        "de": "2D/3D-Hybrid",
        "ja": "2D / 3Dハイブリッド",
        "pt-BR": "Híbrido 2D / 3D"
      }
    ],
    "platforms": [
      "PC",
      "Consoles"
    ],
    "steamUrl": "https://store.steampowered.com/app/2805070/Screenbound/",
    "description": {
      "fr": "Un concept de gameplay révolutionnaire : vous avancez simultanément en vue subjective 3D dans le monde réel et en 2D sur l'écran d'une console rétro portable entre vos mains.",
      "en": "A dual-dimensional platformer where you navigate simultaneously in 3D first-person while playing in 2D on a handheld console screen inside the game.",
      "es": "Un concepto de juego revolucionario: avanzas simultáneamente en primera persona en 3D por el entorno real y en 2D en la pantalla de una consola retro portátil en tus manos.",
      "de": "Ein revolutionäres Konzept: Bewege dich gleichzeitig aus der First-Person-3D-Sicht und in 2D auf dem Bildschirm einer tragbaren Retro-Konsole in deinen Händen.",
      "ja": "革新的なゲームプレイ：プレイヤーは3Dの主観視点で現実空間を進みながら、手元の携帯型レトロゲーム機の2D画面を同時に操作して進む。",
      "pt-BR": "Um conceito revolucionário: avance simultaneamente em primeira pessoa 3D no ambiente real e em 2D na tela de um console portátil retrô em suas mãos."
    },
    "highlight": {
      "fr": "Un puzzle game dimensionnel inventif salué pour son audace de game design.",
      "en": "An inventive dimensional concept celebrated across indie showcases for genuine gameplay innovation.",
      "es": "Un juego de puzles dimensionales ingenioso y elogiado por su audaz diseño de niveles.",
      "de": "Ein innovatives dimensionales Rätselspiel, gefeiert für mutiges und frisches Gameplay-Design.",
      "ja": "次元を跨ぐ独創的なアイデアと大胆なゲームデザインで世界中から称賛される意欲作。",
      "pt-BR": "Um puzzle dimensional inventivo aclamado por sua ousadia e originalidade no design."
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
      "en": "2026",
      "es": "2026",
      "de": "2026",
      "ja": "2026年",
      "pt-BR": "2026"
    },
    "genres": [
      {
        "fr": "Ferme & Enquête",
        "en": "Farming & Mystery",
        "es": "Granja e Investigación",
        "de": "Landwirtschaft & Detektivspiel",
        "ja": "農業＆ミステリー捜査",
        "pt-BR": "Fazenda e Investigação"
      },
      {
        "fr": "Horreur Surnaturelle",
        "en": "Supernatural Horror",
        "es": "Terror Sobrenatural",
        "de": "Übernatürlicher Horror",
        "ja": "超自然的ホラー",
        "pt-BR": "Terror Sobrenatural"
      },
      {
        "fr": "Pixel Art",
        "en": "Pixel Art",
        "es": "Pixel Art",
        "de": "Pixel-Art",
        "ja": "ドット絵",
        "pt-BR": "Pixel Art"
      }
    ],
    "platforms": [
      "PC"
    ],
    "steamUrl": "https://store.steampowered.com/app/3255110/Grave_Seasons/",
    "description": {
      "fr": "Un simulateur de vie rurale et agricole chaleureux où un tueur en série sévit dans l'ombre et élimine un habitant à chaque saison. Gérez votre ferme tout en menant l'enquête.",
      "en": "A charming farming life simulator set in a picturesque town where a supernatural serial killer strikes once per season. Grow crops and solve town mysteries before it is too late.",
      "es": "Un simulador de vida rural y agrícola acogedor donde un asesino en serie sobrenatural acecha en las sombras y mata a un aldeano cada estación. Cuida tu granja e investiga los misterios.",
      "de": "Eine gemütliche ländliche Lebenssimulation, in der ein übernatürlicher Serienmörder lauert und jede Jahreszeit einen Bewohner holt. Baue Gemüse an und löse den Fall.",
      "ja": "心安らぐ農場生活シミュレーションでありながら、季節ごとに村人が一人ずつ犠牲になる超自然的連続殺人鬼が潜む。作物を育てながら真相を究明しよう。",
      "pt-BR": "Um aconchegante simulador de fazenda onde um assassino em série sobrenatural age nas sombras e mata um habitante a cada estação. Cuide da sua lavoura e desvende o mistério."
    },
    "highlight": {
      "fr": "Rencontre surprenante entre la douceur d'un cozy game et l'angoisse d'un thriller criminel.",
      "en": "A dark, addictive blend of cozy agricultural routines and high-stakes serial killer investigation.",
      "es": "Un encuentro sorprendente entre la calidez de un juego relajante y la tensión de un thriller criminal.",
      "de": "Unerwartetes Zusammenspiel aus gemütlicher Landidylle und Hochspannung eines Kriminalthrillers.",
      "ja": "心温まるスローライフ農業と、緊迫したサイコホラー・サスペンスの見事な融合。",
      "pt-BR": "Um encontro surpreendente entre o aconchego da vida no campo e a angústia de um thriller criminal."
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
      "en": "Prochainement",
      "es": "Próximamente",
      "de": "Demnächst",
      "ja": "近日公開",
      "pt-BR": "Em breve"
    },
    "genres": [
      {
        "fr": "FPS Narratif",
        "en": "Narrative FPS",
        "es": "FPS Narrativo",
        "de": "Narrativer FPS",
        "ja": "ストーリー主導FPS",
        "pt-BR": "FPS Narrativo"
      },
      {
        "fr": "Immersive Sim",
        "en": "Immersive Sim",
        "es": "Simulador Inmersivo",
        "de": "Immersive Sim",
        "ja": "イマーシブシム",
        "pt-BR": "Simulador Imersivo"
      },
      {
        "fr": "Sci-Fi",
        "en": "Sci-Fi",
        "es": "Ciencia Ficción",
        "de": "Sci-Fi",
        "ja": "SF",
        "pt-BR": "Ficção Científica"
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
      "en": "Directed by Ken Levine (BioShock, System Shock 2). Escape a disintegrating starship where your decisions, rivalries, and alliances dynamically reshape the narrative.",
      "es": "Dirigido por Ken Levine, creador de BioShock y System Shock 2. Escapa de una nave espacial en ruinas donde cada decisión y alianza transforma de forma orgánica la narrativa.",
      "de": "Unter der Regie von Ken Levine (BioShock, System Shock 2). Entkomme einem zerfallenden Raumschiff, auf dem jede Entscheidung und Rivalität den Handlungsverlauf neu formt.",
      "ja": "『BioShock』や『System Shock 2』のKen Levine氏が率いる最新作。崩壊する宇宙船を舞台に、プレイヤーの決断や同盟が物語をリアルタイムに変貌させていく。",
      "pt-BR": "Dirigido por Ken Levine, criador de BioShock e System Shock 2. Escape de uma nave espacial à deriva onde cada decisão e aliança molda organicamente a narrativa."
    },
    "highlight": {
      "fr": "Le concept de « LEGO narratifs » de Ken Levine pour une liberté narrative inédite.",
      "en": "Ken Levine's \"narrative LEGOs\" architecture delivering responsive, player-driven immersive simulation.",
      "es": "El concepto de «LEGOs narrativos» de Ken Levine para una libertad argumental nunca antes vista.",
      "de": "Ken Levines revolutionäre „narrative LEGOs“-Architektur für ungeahnte erzählerische Freiheit.",
      "ja": "前例のない物語の自由度をもたらす、Ken Levine氏提唱の「ナラティブLEGO」システム。",
      "pt-BR": "O inovador conceito de «LEGO narrativo» de Ken Levine garantindo liberdade de escolha sem precedentes."
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
      "fr": "29 sept. 2026",
      "en": "29 sept. 2026",
      "es": "29 de septiembre de 2026",
      "de": "29. September 2026",
      "ja": "2026年9月29日",
      "pt-BR": "29 de setembro de 2026"
    },
    "genres": [
      {
        "fr": "Simulation de Vie",
        "en": "Life Sim",
        "es": "Simulador de Vida",
        "de": "Lebenssimulation",
        "ja": "生活シミュレーション",
        "pt-BR": "Simulador de Vida"
      },
      {
        "fr": "Cyberpunk",
        "en": "Cyberpunk",
        "es": "Ciberpunk",
        "de": "Cyberpunk",
        "ja": "サイバーパンク",
        "pt-BR": "Cyberpunk"
      },
      {
        "fr": "Gestion & Aventure",
        "en": "Management & Adventure",
        "es": "Gestión y Aventura",
        "de": "Wirtschaft & Abenteuer",
        "ja": "経営＆アドベンチャー",
        "pt-BR": "Gerenciamento e Aventura"
      }
    ],
    "platforms": [
      "PC"
    ],
    "steamUrl": "https://store.steampowered.com/app/1488490/Nivalis/",
    "description": {
      "fr": "Par les créateurs de Cloudpunk. Développez votre commerce, gérez des restaurants et boîtes de nuit dans la métropole cyberpunk de Nivalis, liez des amitiés et explorez la ville.",
      "en": "From the makers of Cloudpunk. Grow your business, manage restaurants and nightclubs in the cyberpunk city of Nivalis, make friends and explore the vertical metropolis.",
      "es": "De los creadores de Cloudpunk. Desarrolla tus negocios, administra restaurantes y discotecas en la metrópolis ciberpunk de Nivalis, entabla amistades y explora la ciudad vertical.",
      "de": "Von den Schöpfern von Cloudpunk. Baue dein Unternehmen auf, manage Restaurants und Nachtclubs in Nivalis, schließe Freundschaften und erkunde die Metropole.",
      "ja": "『Cloudpunk』のION LANDSが贈る新作。サイバーパンクの大都市ニヴァリスで店舗を構え、レストランやクラブを経営し、住人たちと交流しながら垂直都市を散策しよう。",
      "pt-BR": "Dos criadores de Cloudpunk. Expanda seus negócios, administre restaurantes e casas noturnas na metrópole cyberpunk de Nivalis, faça amizades e explore a cidade vertical."
    },
    "highlight": {
      "fr": "Un simulateur de vie cyberpunk immersif dans un univers vertical somptueux.",
      "en": "An immersive slice-of-life cyberpunk simulation set in a stunning vertical metropolis.",
      "es": "Un simulador de vida ciberpunk inmersivo en una urbe vertical deslumbrante.",
      "de": "Eine fesselnde Cyberpunk-Lebenssimulation in einer atemberaubenden vertikalen Zukunftsstadt.",
      "ja": "壮大な多層構造のサイバーパンク都市で味わう、超没入型のスライス・オブ・ライフ生活。",
      "pt-BR": "Um simulador de vida cyberpunk imersivo em uma metrópole vertical deslumbrante."
    },
    "hypeScore": 95,
    "coverUrl": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1488490/header.jpg"
  }
];
