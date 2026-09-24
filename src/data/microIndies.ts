import type { MicroIndieGame } from '../types/microIndie';

/**
 * 🦉 Hoot Indie Games — La Clairière des Micro-Indés & Pépites Itch.io
 * Espace d'exposition dédié aux créateurs solo, aux jeux de game jams et aux pépites émergentes.
 */

export const INITIAL_MICRO_INDIES: MicroIndieGame[] = [
  {
    "id": "celeste-classic-pico8",
    "title": "Celeste Classic (PICO-8)",
    "developer": "Maddy Thorson & Noel Berry",
    "releaseYear": 2015,
    "platform": "itch",
    "itchUrl": "https://maddymakesgamesinc.itch.io/celesteclassic",
    "playInBrowserUrl": "https://www.lexaloffle.com/bbs/?tid=2145",
    "isFree": true,
    "pricingText": {
      "fr": "Gratuit / Jouable en direct 🌐",
      "en": "Free / Playable in Browser 🌐",
      "es": "Gratis / Jugable en el navegador 🌐",
      "de": "Kostenlos / Im Browser spielbar 🌐",
      "ja": "無料 / ブラウザで即プレイ可能 🌐",
      "pt-BR": "Grátis / Jogável no navegador 🌐"
    },
    "jam": "PICO-8 4-day Game Jam",
    "genre": [
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
    "tagline": {
      "fr": "Le prototype PICO-8 mythique conçu en 4 jours qui a donné naissance au chef-d'œuvre Celeste.",
      "en": "The legendary 4-day PICO-8 prototype that gave birth to the acclaimed indie masterpiece Celeste.",
      "es": "El legendario prototipo de 4 días en PICO-8 que dio origen a la obra maestra Celeste.",
      "de": "Der legendäre 4-Tage-PICO-8-Prototyp, aus dem das gefeierte Meisterwerk Celeste hervorging.",
      "ja": "わずか4日間のゲームジャムで生み出され、後に不朽の傑作『Celeste』へと結実した伝説のPICO-8プロトタイプ。",
      "pt-BR": "O lendário protótipo de 4 dias no PICO-8 que deu origem à aclamada obra-prima Celeste."
    },
    "description": {
      "fr": "Grimpez une montagne hostile grâce à des sauts millimétrés et une mécanique de dash aérien viscérale. Directement jouable dans votre navigateur !",
      "en": "Climb a treacherous mountain using razor-sharp jumps and visceral aerial dashes. Playable directly inside your browser!",
      "es": "Escala una montaña traicionera con saltos milimétricos y mecánicas de impulsos aéreos. ¡Jugable directamente en tu navegador!",
      "de": "Erklimme einen tückischen Berg mit punktgenauen Sprüngen und Luft-Dashes. Direkt im Browser spielbar!",
      "ja": "正確無比なジャンプとダッシュを駆使して危険な霊峰を踏破せよ。ブラウザ上で今すぐプレイ可能！",
      "pt-BR": "Escale uma montanha traiçoeira com saltos milimétricos e impulsos no ar viscerais. Jogue direto no navegador!"
    },
    "developerMessage": {
      "fr": "Créé lors d'une jam d'expérimentation technique. Tout le gameplay et le game feel sont déjà intacts dans ces 30 niveaux emblématiques.",
      "en": "Built during a rapid prototyping sprint. The entire jumping physics and responsive game feel were born right here."
    },
    "discoveredBy": "Hibouxe",
    "likesCount": 142,
    "featured": true,
    "coverImage": "https://img.itch.zone/aW1hZ2UvMzEzMTgvMTMzNjQyLmdpZg==/original/vIUIrE.gif",
    "screenshots": [
      "https://www.lexaloffle.com/bbs/cposts/1/15133.p8.png"
    ],
    "dateAdded": "2026-09-21"
  },
  {
    "id": "buckshot-roulette-itch",
    "title": "Buckshot Roulette",
    "developer": "Mike Klubnika",
    "releaseYear": 2023,
    "platform": "both",
    "itchUrl": "https://mikeklubnika.itch.io/buckshot-roulette",
    "steamUrl": "https://store.steampowered.com/app/2835570/",
    "isFree": false,
    "pricingText": {
      "fr": "1,20 € sur Itch.io · 2,99 € sur Steam",
      "en": "$1.20 on Itch.io · $2.99 on Steam",
      "es": "1,20 € en Itch.io · 2,99 € en Steam",
      "de": "1,20 € auf Itch.io · 2,99 € auf Steam",
      "ja": "Itch.ioにて1.20ドル · Steamにて2.99ドル",
      "pt-BR": "R$ 6,00 no Itch.io · R$ 14,99 no Steam"
    },
    "genre": [
      "Horreur",
      "Psychologique",
      "Stratégie"
    ],
    "artStyle": {
      "fr": "3D Rétro Low-poly",
      "en": "Retro Low-poly 3D"
    },
    "camera": {
      "fr": "Première personne",
      "en": "First-Person"
    },
    "tagline": {
      "fr": "Une roulette russe angoissante au fusil à pompe calibre 12 dans un club clandestin poisseux.",
      "en": "A high-stakes 12-gauge shotgun Russian roulette against an uncanny dealer in a grime-soaked underground club.",
      "es": "Una angustiosa ruleta rusa con escopeta de calibre 12 contra un crupier siniestro en un club clandestino.",
      "de": "Nervenzerreißendes russisches Roulette mit einer Schrotflinte Kaliber 12 in einem düsteren Untergrundclub.",
      "ja": "薄暗い地下クラブで不気味なディーラーと対峙する、命がけの12ゲージ散弾銃ロシアンルーレット。",
      "pt-BR": "Uma roleta-russa aterradora com escopeta calibre 12 contra um negociante sinistro em um clube imundo."
    },
    "description": {
      "fr": "Affrontez un croupier terrifiant au tour par tour. Observez la charge des cartouches, utilisez vos objets tactiques (menottes, scie, bière) et survivez à la tension.",
      "en": "Face off against an uncanny artificial dealer. Count shotgun shells, deploy tactical items (handcuffs, saw, burner phone) and outlast the nerve-wracking tension.",
      "es": "Enfréntate a un crupier perturbador por turnos. Cuenta los cartuchos, usa objetos tácticos y sobrevive a la tensión.",
      "de": "Tritt rundenbasiert gegen einen unheimlichen Croupier an. Zähle die Patronen und setze taktische Gegenstände clever ein.",
      "ja": "ターン制でディーラーと対決。実包と空砲の数を数え、手錠やノコギリなどのアイテムを駆使して緊張感を生き延びろ。",
      "pt-BR": "Enfrente um crupiê assustador por turnos. Conte os cartuchos, use itens táticos e sobreviva à tensão extrema."
    },
    "developerMessage": {
      "fr": "Développé en solo sous Godot Engine. La version initiale Itch.io a prouvé que les expériences brutes et courtes ont un pouvoir immense.",
      "en": "Crafted solo using Godot Engine. The original Itch.io release proved that bite-sized tactile experiences can strike a huge chord."
    },
    "discoveredBy": "Quentin Beaud",
    "likesCount": 98,
    "featured": true,
    "coverImage": "https://img.itch.zone/aW1nLzE0NjIyNDk0LnBuZw==/original/iTohTc.png",
    "screenshots": [
      "https://img.itch.zone/aW1hZ2UvMjQ0MzYyMy8xNDQ3NjM3Ni5wbmc=/original/c1Ca3c.png"
    ],
    "dateAdded": "2026-09-21"
  },
  {
    "id": "holocure-micro",
    "title": "HoloCure - Save the Fans!",
    "developer": "KayAnimate",
    "releaseYear": 2022,
    "platform": "both",
    "itchUrl": "https://kay-yu.itch.io/holocure",
    "steamUrl": "https://store.steampowered.com/app/2420510/",
    "isFree": true,
    "pricingText": {
      "fr": "100% Gratuit / Sans Microtransactions 🆓",
      "en": "100% Free / Zero Microtransactions 🆓",
      "es": "100% Gratis / Sin micropagos 🆓",
      "de": "100% Kostenlos / Keine Mikrotransaktionen 🆓",
      "ja": "完全無料 / 課金要素ゼロ 🆓",
      "pt-BR": "100% Grátis / Sem microtransações 🆓"
    },
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
    "tagline": {
      "fr": "Le phénomène rogue-lite gratuit né sur Itch.io avant de conquérir Steam avec 99% d'évaluations positives.",
      "en": "The phenomenal free survivor roguelite born on Itch.io before conquering Steam with a 99% positive score.",
      "es": "El fenómeno gratuito de supervivencia rogue-lite nacido en Itch.io antes de conquistar Steam con 99% de reseñas positivas.",
      "de": "Das kostenlose Rogue-lite-Phänomen von Itch.io, das Steam mit 99% positiven Reviews im Sturm eroberte.",
      "ja": "Itch.ioから誕生し、Steamでも圧倒的好評99％を記録した大人気無料サバイバー・ローグライト。",
      "pt-BR": "O fenômeno rogue-lite gratuito nascido no Itch.io que conquistou o Steam com 99% de avaliações positivas."
    },
    "description": {
      "fr": "Un hommage indie bourré de contenu avec des dizaines de personnages uniques, une bande-son synthwave énergique, de la pêche, de la déco et zéro micro-transaction.",
      "en": "A massive passion project with dozens of unlockable characters, energetic original soundtracks, mini-games, home decoration, and zero microtransactions."
    },
    "discoveredBy": "Communauté Hoot",
    "likesCount": 165,
    "featured": true,
    "coverImage": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2420510/header.jpg",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2420510/ss_0b4a50d12f737a522960ba3b3229546f536ff57f.1920x1080.jpg?t=1740642230"
    ],
    "dateAdded": "2026-09-21"
  },
  {
    "id": "grimms-hollow-micro",
    "title": "Grimm's Hollow",
    "developer": "ghosthunter",
    "releaseYear": 2019,
    "platform": "both",
    "itchUrl": "https://ghosthum.itch.io/grimms-hollow",
    "steamUrl": "https://store.steampowered.com/app/1170880/",
    "isFree": true,
    "pricingText": {
      "fr": "100% Gratuit / Free",
      "en": "100% Free"
    },
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
    "tagline": {
      "fr": "Une faucheuse novice cherche son frère à travers un au-delà hanté et bienveillant.",
      "en": "A novice reaper searches for her brother across a gentle, haunted afterlife.",
      "es": "Una segadora novata busca a su hermano a través de un más allá encantado y entrañable.",
      "de": "Eine frischgebackene Seelenfängerin sucht im Jenseits nach ihrem verschollenen Bruder.",
      "ja": "見習い死神の少女が、不思議で優しい幽霊の世界で行方不明の弟を探すゴシック短編RPG。",
      "pt-BR": "Uma ceifadora novata procura seu irmão em um além assombrado e acolhedor."
    },
    "description": {
      "fr": "Un RPG bienveillant et mélancolique sur le deuil et la fraternité. Combattez des esprits à coup de faux, cuisinez des friandises spectrales et découvrez de multiples fins.",
      "en": "A tender, melancholic indie RPG exploring grief and family bonds. Reap spirits in active turn-based battles, craft ghostly treats and unlock several endings."
    },
    "discoveredBy": "Hibouxe",
    "likesCount": 84,
    "featured": false,
    "coverImage": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1170880/header.jpg",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1170880/ss_ed5e129fa0f0b819c15b5dca2c6d43c83c6f86a6.1920x1080.jpg?t=1630243141"
    ],
    "dateAdded": "2026-09-21"
  },
  {
    "id": "a-short-hike-micro",
    "title": "A Short Hike",
    "developer": "adamgryu (Adam Robinson-Yu)",
    "releaseYear": 2019,
    "platform": "both",
    "itchUrl": "https://adamgryu.itch.io/a-short-hike",
    "steamUrl": "https://store.steampowered.com/app/1055540/",
    "isFree": false,
    "pricingText": {
      "fr": "6,99 €",
      "en": "$7.99"
    },
    "genre": [
      "Aventure",
      "Exploration",
      "Cozy"
    ],
    "artStyle": {
      "fr": "3D Rétro Low-poly",
      "en": "Retro Low-poly 3D"
    },
    "camera": {
      "fr": "Troisième personne",
      "en": "Third-Person"
    },
    "tagline": {
      "fr": "Une balade paisible et revigorante sur les sentiers verdoyants du parc de Hawk Peak.",
      "en": "A heartwarming, peaceful stroll up the scenic trails of Hawk Peak.",
      "es": "Un paseo conmovedor y pacífico por los hermosos senderos de Hawk Peak.",
      "de": "Eine herzerwärmende, friedvolle Wanderung auf den malerischen Pfaden des Hawk Peak.",
      "ja": "ホークピークの風光明媚なトレイルを登る、心温まる穏やかなお散歩アドベンチャー。",
      "pt-BR": "Uma caminhada relaxante e reconfortante pelas belas trilhas de Hawk Peak."
    },
    "description": {
      "fr": "Incarnez Claire le petit oiseau. Parcourez la montagne à votre rythme, planez avec le vent d'automne, pêchez, discutez avec d'adorables randonneurs et prenez de la hauteur.",
      "en": "Play as Claire the little bird. Explore mountain paths at your own pace, glide through the autumn breeze, chat with quirky hikers and reach the summit."
    },
    "discoveredBy": "Quentin Beaud",
    "likesCount": 119,
    "featured": true,
    "coverImage": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1055540/header.jpg",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1055540/ss_f2123fea859e299736a3e99d130238c784d53e75.1920x1080.jpg?t=1777758958"
    ],
    "dateAdded": "2026-09-21"
  },
  {
    "id": "the-looker-micro",
    "title": "The Looker",
    "developer": "Subcreation Studio",
    "releaseYear": 2022,
    "platform": "steam",
    "steamUrl": "https://store.steampowered.com/app/1985690/",
    "isFree": true,
    "pricingText": {
      "fr": "100% Gratuit / Free",
      "en": "100% Free"
    },
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
    "tagline": {
      "fr": "La parodie d'énigmes la plus drôle et affûtée du chef-d'œuvre The Witness.",
      "en": "The funniest, sharpest puzzle parody of the masterpiece The Witness.",
      "es": "La parodia de puzles más divertida e ingeniosa de la obra maestra The Witness.",
      "de": "Die witzigste und treffsicherste Rätselparodie auf das Meisterwerk The Witness.",
      "ja": "名作『The Witness』への愛ある爆笑と冴えわたるパロディが詰まった最高の一筆書きパズル。",
      "pt-BR": "A paródia de quebra-cabeças mais engraçada e genial da obra-prima The Witness."
    },
    "description": {
      "fr": "Vous vous réveillez seul sur une île étrangement familière. Tracez des lignes absurdes pour ouvrir des portes inutiles et rigoler des poncifs du jeu d'énigme cérébral.",
      "en": "Wake up on a mysteriously familiar island filled with absurd line puzzles. Laugh out loud as you trace nonsensical solutions through a satirical open world."
    },
    "discoveredBy": "Hibouxe",
    "likesCount": 76,
    "featured": false,
    "coverImage": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1985690/header.jpg",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1985690/ss_e4373d3ead1db7e44fd72371c2f7e7fe12f222a4.1920x1080.jpg?t=1663378276"
    ],
    "dateAdded": "2026-09-21"
  },
  {
    "id": "itch-our-life-beginnings-amp-always",
    "title": "​Our Life: Beginnings &amp; Always",
    "developer": "gbpatch",
    "releaseYear": 2026,
    "platform": "itch",
    "itchUrl": "https://gbpatch.itch.io/our-life",
    "isFree": true,
    "pricingText": {
      "fr": "Gratuit / Free 🆓",
      "en": "100% Free 🆓"
    },
    "genre": [
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
    "tagline": {
      "fr": "Grandissez de l'enfance à l'âge adulte aux côtés du garçon solitaire de la maison voisine.",
      "en": "Grow from childhood to adulthood with the lonely boy next door in this heartwarming visual novel.",
      "es": "Crece desde la infancia hasta la madurez junto al chico de al lado en una conmovedora novela visual.",
      "de": "Wachse gemeinsam mit dem Jungen von nebenan vom Kind zum Erwachsenen heran in dieser herzlichen Visual Novel.",
      "ja": "隣の家に住む内気な少年コーヴとともに、幼少期から大人へと成長していく心温まるノベルゲーム。",
      "pt-BR": "Cresça da infância à vida adulta ao lado do garoto da casa ao lado nesta emocionante visual novel."
    },
    "description": {
      "fr": "Grow from childhood to adulthood with the lonely boy next door in this near-fully customizable visual novel.",
      "en": "Grow from childhood to adulthood with the lonely boy next door in this near-fully customizable visual novel."
    },
    "discoveredBy": "Hoot Bot (Itch Moissonnage)",
    "likesCount": 1,
    "featured": false,
    "coverImage": "https://img.itch.zone/aW1nLzcwMTIxNDMucG5n/315x250%23c/BalGQb.png",
    "screenshots": [
      "https://img.itch.zone/aW1nLzcwMTIxNDMucG5n/315x250%23c/BalGQb.png"
    ],
    "dateAdded": "2026-09-21"
  },
  {
    "id": "itch-adventures-with-anxiety",
    "title": "Adventures With Anxiety!",
    "developer": "ncase",
    "releaseYear": 2026,
    "platform": "itch",
    "itchUrl": "https://ncase.itch.io/anxiety",
    "playInBrowserUrl": "https://ncase.itch.io/anxiety",
    "isFree": true,
    "pricingText": {
      "fr": "Gratuit / Free 🆓",
      "en": "100% Free 🆓"
    },
    "genre": [
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
    "tagline": {
      "fr": "Une histoire interactive bouleversante sur l'anxiété où vous incarnez l'anxiété elle-même.",
      "en": "An empathetic interactive story about anxiety. You play *as* the anxiety itself.",
      "es": "Una conmovedora historia interactiva sobre la ansiedad donde juegas como la propia ansiedad.",
      "de": "Eine einfühlsame interaktive Geschichte über Ängste, in der du die innere Angst selbst verkörperst.",
      "ja": "主人公の心に宿る「不安」そのものとなり、飼い主を守ろうと奮闘する心に響く対話型ストーリー。",
      "pt-BR": "Uma emocionante história interativa sobre a ansiedade, onde você joga como a própria ansiedade."
    },
    "description": {
      "fr": "An interactive story about anxiety. You play *as* the anxiety",
      "en": "An interactive story about anxiety. You play *as* the anxiety"
    },
    "discoveredBy": "Hoot Bot (Itch Moissonnage)",
    "likesCount": 1,
    "featured": false,
    "coverImage": "https://img.itch.zone/aW1nLzI3NjQ4NjUucG5n/315x250%23c/DZfV4W.png",
    "screenshots": [
      "https://img.itch.zone/aW1nLzI3NjQ4NjUucG5n/315x250%23c/DZfV4W.png"
    ],
    "dateAdded": "2026-09-21"
  },
  {
    "id": "itch-a-date-with-death",
    "title": "A Date with Death",
    "developer": "twoandahalfstudios",
    "releaseYear": 2026,
    "platform": "itch",
    "itchUrl": "https://twoandahalfstudios.itch.io/a-date-with-death",
    "isFree": true,
    "pricingText": {
      "fr": "Gratuit / Free 🆓",
      "en": "100% Free 🆓"
    },
    "genre": [
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
    "tagline": {
      "fr": "Pariez votre âme contre la Faucheuse lors d'appels vidéo... et tombez peut-être sous son charme ?",
      "en": "Enter a week-long bet against the Grim Reaper to keep your soul... and maybe fall in love along the way?",
      "es": "Apuesta tu alma contra la Muerte en videollamadas... ¿y quizás te enamores por el camino?",
      "de": "Wette eine Woche per Webcam gegen den Sensenmann um deine Seele... und verliebe dich vielleicht?",
      "ja": "死神と魂を賭けた1週間のビデオ通話勝負...その過程で思わぬ恋が芽生えるオカルトロマンス？",
      "pt-BR": "Aposte sua alma contra a Morte em chamadas de vídeo... e quem sabe encontre o amor pelo caminho?"
    },
    "description": {
      "fr": "Enter a week long bet against the Grim Reaper to keep your soul... and maybe fall in love along the way?",
      "en": "Enter a week long bet against the Grim Reaper to keep your soul... and maybe fall in love along the way?"
    },
    "discoveredBy": "Hoot Bot (Itch Moissonnage)",
    "likesCount": 1,
    "featured": false,
    "coverImage": "https://img.itch.zone/aW1nLzEzMjI3MDAyLnBuZw==/315x250%23c/kVaU3H.png",
    "screenshots": [
      "https://img.itch.zone/aW1nLzEzMjI3MDAyLnBuZw==/315x250%23c/kVaU3H.png"
    ],
    "dateAdded": "2026-09-21"
  },
  {
    "id": "itch-blooming-panic",
    "title": "Blooming Panic",
    "developer": "robobarbie",
    "releaseYear": 2026,
    "platform": "itch",
    "itchUrl": "https://robobarbie.itch.io/blooming-panic",
    "isFree": true,
    "pricingText": {
      "fr": "Gratuit / Free 🆓",
      "en": "100% Free 🆓"
    },
    "genre": [
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
    "tagline": {
      "fr": "Rejoignez un serveur de discussion rétro et liez-vous d'amitié avec une communauté attachante.",
      "en": "Join a cozy chat server and bond with an eccentric web community in this text-based romance simulation.",
      "es": "Entra en un servidor de chat retro y haz amigos en una peculiar comunidad virtual.",
      "de": "Tritt einem gemütlichen Nostalgie-Chatserver bei und knüpfe tiefe Freundschaften online.",
      "ja": "レトロなチャットサーバーに参加し、個性豊かなネットコミュニティの仲間と心を通わせる会話ゲーム。",
      "pt-BR": "Entre em um servidor de bate-papo nostálgico e faça amigos com uma comunidade virtual inesquecível."
    },
    "description": {
      "fr": "Welcome to our server!",
      "en": "Welcome to our server!"
    },
    "discoveredBy": "Hoot Bot (Itch Moissonnage)",
    "likesCount": 1,
    "featured": false,
    "coverImage": "https://img.itch.zone/aW1nLzc2OTc0OTEucG5n/315x250%23c/b%2FgqIz.png",
    "screenshots": [
      "https://img.itch.zone/aW1nLzc2OTc0OTEucG5n/315x250%23c/b%2FgqIz.png"
    ],
    "dateAdded": "2026-09-21"
  },
  {
    "id": "itch-don-039-t-eat-the-cashier",
    "title": "Don&#039;t eat the cashier!",
    "developer": "detcc",
    "releaseYear": 2026,
    "platform": "itch",
    "itchUrl": "https://detcc.itch.io/dont-eat-the-cashier",
    "isFree": true,
    "pricingText": {
      "fr": "Gratuit / Free 🆓",
      "en": "100% Free 🆓"
    },
    "genre": [
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
    "tagline": {
      "fr": "Servez des clients monstres terrifiants et gardez votre sang-froid derrière la caisse !",
      "en": "All customers are terrifying monsters. Serve them quickly and keep your head cool behind the counter!",
      "es": "Todos los clientes son monstruos aterradores. ¡Sírveles rápido y no dejes que te coman!",
      "de": "Alle Kunden sind furchterregende Monster. Bedient sie zügig und lasst euch nicht fressen!",
      "ja": "来店する客は全員恐ろしいモンスター！ 食べられないように冷静にレジを打つドタバタ接客ゲーム。",
      "pt-BR": "Todos os clientes são monstros aterrorizantes. Atenda-os rápido e tente não ser devorado no caixa!"
    },
    "description": {
      "fr": "All customers are monsters. Oh no. Oh yeah?",
      "en": "All customers are monsters. Oh no. Oh yeah?"
    },
    "discoveredBy": "Hoot Bot (Itch Moissonnage)",
    "likesCount": 1,
    "featured": false,
    "coverImage": "https://img.itch.zone/aW1nLzIzMzk5OTE0LnBuZw==/315x250%23c/xwM6QL.png",
    "screenshots": [
      "https://img.itch.zone/aW1nLzIzMzk5OTE0LnBuZw==/315x250%23c/xwM6QL.png"
    ],
    "dateAdded": "2026-09-22"
  },
  {
    "id": "itch-quot-voices-of-the-void-quot-alpha",
    "title": "&quot;Voices Of The Void&quot; Alpha",
    "developer": "mrdrnose",
    "releaseYear": 2026,
    "platform": "itch",
    "itchUrl": "https://mrdrnose.itch.io/votv",
    "isFree": true,
    "pricingText": {
      "fr": "Gratuit / Free 🆓",
      "en": "100% Free 🆓"
    },
    "genre": [
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
    "tagline": {
      "fr": "Captez et analysez d'étranges signaux venus des confins silencieux et angoissants de l'espace.",
      "en": "Gather and decipher unknown signals from the deep, terrifying silence of space in this analog horror sim.",
      "es": "Capta y descifra señales desconocidas procedentes del profundo y misterioso silencio del espacio.",
      "de": "Fange unheimliche Signale aus den Tiefen des Weltalls auf in dieser beklemmenden Radioastronomie-Simulation.",
      "ja": "深遠なる宇宙の静寂から謎の電波シグナルを受信し、未知の怪異に備えるアナログホラーシミュレーター。",
      "pt-BR": "Capte e decifre sinais desconhecidos vindos do silêncio aterrorizante do espaço profundo."
    },
    "description": {
      "fr": "Gather unknown signals from deep, silent space",
      "en": "Gather unknown signals from deep, silent space"
    },
    "discoveredBy": "Hoot Bot (Itch Moissonnage)",
    "likesCount": 1,
    "featured": false,
    "coverImage": "https://img.itch.zone/aW1nLzI2NDI5NTgzLmpwZw==/315x250%23c/5lRRHP.jpg",
    "screenshots": [
      "https://img.itch.zone/aW1nLzI2NDI5NTgzLmpwZw==/315x250%23c/5lRRHP.jpg"
    ],
    "dateAdded": "2026-09-22"
  },
  {
    "id": "itch-14-days-with-you",
    "title": "14 Days With You",
    "developer": "cutiesai",
    "releaseYear": 2026,
    "platform": "itch",
    "itchUrl": "https://cutiesai.itch.io/14dayswithyou",
    "isFree": true,
    "pricingText": {
      "fr": "Gratuit / Free 🆓",
      "en": "100% Free 🆓"
    },
    "genre": [
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
    "tagline": {
      "fr": "Une rencontre troublante qui tourne à l'obsession dans ce thriller psychologique oppressant.",
      "en": "A deeply unsettling encounter spirals into obsession over 14 unforgettable days.",
      "es": "Un perturbador encuentro que se convierte en una obsesión asfixiante durante 14 días.",
      "de": "Eine beunruhigende Bekanntschaft entwickelt sich über 14 Tage zu einer gefährlichen Obsession.",
      "ja": "奇妙な出会いが次第に歪んだ執着へと狂い咲く、14日間の心理サスペンスビジュアルノベル。",
      "pt-BR": "Um encontro perturbador que se transforma em uma obsessão perigosa ao longo de 14 dias."
    },
    "description": {
      "fr": "He&#039;s always going to be with you...",
      "en": "He&#039;s always going to be with you..."
    },
    "discoveredBy": "Hoot Bot (Itch Moissonnage)",
    "likesCount": 1,
    "featured": false,
    "coverImage": "https://img.itch.zone/aW1nLzIxNDc2NzkxLmdpZg==/original/AWPx1Z.gif",
    "screenshots": [
      "https://img.itch.zone/aW1nLzIxNDc2NzkxLmdpZg==/original/AWPx1Z.gif"
    ],
    "dateAdded": "2026-09-23"
  },
  {
    "id": "itch-our-life-now-amp-forever",
    "title": "Our Life: Now &amp; Forever",
    "developer": "gbpatch",
    "releaseYear": 2026,
    "platform": "itch",
    "itchUrl": "https://gbpatch.itch.io/our-life-nf",
    "isFree": true,
    "pricingText": {
      "fr": "Gratuit / Free 🆓",
      "en": "100% Free 🆓"
    },
    "genre": [
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
    "tagline": {
      "fr": "Un avion en papier, deux nouveaux voisins et quatre automnes inoubliables dans une vie unique.",
      "en": "A paper airplane, two new neighbors, four autumns, and a one of a kind life.",
      "es": "Un avión de papel, dos nuevos vecinos, cuatro otoños y una vida inolvidable.",
      "de": "Ein Papierflieger, zwei neue Nachbarn, vier Herbste und ein einzigartiges Leben.",
      "ja": "紙飛行機、ふたりの新しい隣人、巡りゆく4つの秋。かけがえのない人生を紡ぐ感動のノベル。",
      "pt-BR": "Um avião de papel, dois novos vizinhos, quatro outonos e uma vida inesquecível."
    },
    "description": {
      "fr": "A paper airplane, two new neighbors, four autumns, and a one of a kind life.",
      "en": "A paper airplane, two new neighbors, four autumns, and a one of a kind life."
    },
    "discoveredBy": "Hoot Bot (Itch Moissonnage)",
    "likesCount": 1,
    "featured": false,
    "coverImage": "https://img.itch.zone/aW1nLzc5MTY4NzQucG5n/315x250%23c/Nu7e5v.png",
    "screenshots": [
      "https://img.itch.zone/aW1nLzc5MTY4NzQucG5n/315x250%23c/Nu7e5v.png"
    ],
    "dateAdded": "2026-09-23"
  },
  {
    "id": "itch-serenitrove",
    "title": "Serenitrove",
    "developer": "alfredncy",
    "releaseYear": 2026,
    "platform": "itch",
    "itchUrl": "https://alfredncy.itch.io/serenitrove",
    "playInBrowserUrl": "https://alfredncy.itch.io/serenitrove",
    "isFree": true,
    "pricingText": {
      "fr": "Gratuit / Free 🆓",
      "en": "100% Free 🆓"
    },
    "genre": [
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
    "tagline": {
      "fr": "Dig, upgrade, expand... then dig deeper!",
      "en": "Dig, upgrade, expand... then dig deeper!"
    },
    "description": {
      "fr": "Dig, upgrade, expand... then dig deeper!",
      "en": "Dig, upgrade, expand... then dig deeper!"
    },
    "discoveredBy": "Hoot Bot (Itch Moissonnage)",
    "likesCount": 1,
    "featured": false,
    "coverImage": "https://img.itch.zone/aW1nLzI1MDU0ODE5LnBuZw==/315x250%23c/oNTRwi.png",
    "screenshots": [
      "https://img.itch.zone/aW1nLzI1MDU0ODE5LnBuZw==/315x250%23c/oNTRwi.png"
    ],
    "dateAdded": "2026-09-24"
  },
  {
    "id": "itch-doki-doki-literature-club",
    "title": "Doki Doki Literature Club!",
    "developer": "teamsalvato",
    "releaseYear": 2026,
    "platform": "itch",
    "itchUrl": "https://teamsalvato.itch.io/ddlc",
    "isFree": true,
    "pricingText": {
      "fr": "Gratuit / Free 🆓",
      "en": "100% Free 🆓"
    },
    "genre": [
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
    "tagline": {
      "fr": "Will you write the way into her heart?",
      "en": "Will you write the way into her heart?"
    },
    "description": {
      "fr": "Will you write the way into her heart?",
      "en": "Will you write the way into her heart?"
    },
    "discoveredBy": "Hoot Bot (Itch Moissonnage)",
    "likesCount": 1,
    "featured": false,
    "coverImage": "https://img.itch.zone/aW1hZ2UvMTA2NTk5LzU4NjAxMi5naWY=/original/%2Fz0let.gif",
    "screenshots": [
      "https://img.itch.zone/aW1hZ2UvMTA2NTk5LzU4NjAxMi5naWY=/original/%2Fz0let.gif"
    ],
    "dateAdded": "2026-09-24"
  }
];
