import type { MicroIndieGame } from '../types/microIndie';

/**
 * 🦉 Hoot Indie Games — La Clairière des Micro-Indés & Pépites Itch.io
 * Espace d'exposition dédié aux créateurs solo, aux jeux de game jams et aux pépites émergentes.
 * Total de pépites sélectionnées : 35
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
    "id": "micro-crescent-bloom-2d61c0",
    "title": "Crescent Bloom",
    "developer": "Nox Metrica",
    "releaseYear": 2022,
    "platform": "steam",
    "steamUrl": "https://store.steampowered.com/app/1953920/Crescent_Bloom/",
    "isFree": false,
    "pricingText": {
      "fr": "Payant / Steam 💎",
      "en": "Paid / Steam 💎",
      "es": "De pago / Steam 💎",
      "de": "Kostenpflichtig / Steam 💎",
      "ja": "有料 / Steam 💎",
      "pt-BR": "Pago / Steam 💎"
    },
    "genre": [
      "Aventure",
      "Platformer",
      "Puzzle"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "Hand-drawn 2D"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
    },
    "tagline": {
      "fr": "Une aventure narrative 2D sur les pas d'Ignis à la recherche de son frère dans un empire fantastique mystérieux.",
      "en": "A story-rich 2D adventure following Ignis on a perilous journey to rescue her missing brother.",
      "es": "Una aventura narrativa en 2D que sigue el peligroso viaje de Ignis en busca de su hermano desaparecido.",
      "de": "Ein geschichtenreiches 2D-Abenteuer über Ignis' gefährliche Reise auf der Suche nach ihrem verschwundenen Bruder.",
      "ja": "失踪した兄を探すイグニスの危険に満ちた旅を描く、物語重視の2Dアドベンチャー。",
      "pt-BR": "Uma aventura 2D rica em história seguindo a perigosa jornada de Ignis em busca de seu irmão desaparecido."
    },
    "description": {
      "fr": "Incarnez la jeune pyromancienne Ignis dans l'Empire Constantin. Lancez de puissants sorts, résolvez des énigmes de couleurs et de sons et élucidez l'invasion des redoutables créatures végétales Trians.",
      "en": "Play as the young pyromancer Ignis in the Constantin Empire. Cast powerful spells, solve clever color and sound puzzles, and unravel the invasion of the plant-lizard Trians.",
      "es": "Juega como la joven piromante Ignis en el Imperio Constantin. Lanza poderosos hechizos, resuelve acertijos y detén a los invasores.",
      "de": "Schlüpfe in die Rolle der jungen Pyromantin Ignis im Konstantinischen Reich. Löse Rätsel und entdecke das Geheimnis der Trian-Invasion.",
      "ja": "コンスタンティン帝国の若き火術師イグニスとなり、魔法を駆使して色彩と音のパズルを解き明かせ。",
      "pt-BR": "Jogue como a jovem piromante Ignis no Império Constantin. Lance feitiços poderosos e resolva quebra-cabeças."
    },
    "discoveredBy": "Hibouxe",
    "likesCount": 8,
    "featured": true,
    "coverImage": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1953920/header.jpg",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1953920/header.jpg"
    ],
    "dateAdded": "2026-09-25",
    "approved": true
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
    "discoveredBy": "Hibouxe",
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
    "discoveredBy": "Hibouxe",
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
    "discoveredBy": "Hibouxe",
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
    "title": "Our Life: Beginnings & Always",
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
    "discoveredBy": "Hibouxe",
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
    "discoveredBy": "Hibouxe",
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
    "discoveredBy": "Hibouxe",
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
    "discoveredBy": "Hibouxe",
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
    "title": "Don't eat the cashier!",
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
    "discoveredBy": "Hibouxe",
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
    "title": "\"Voices Of The Void\" Alpha",
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
    "discoveredBy": "Hibouxe",
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
      "fr": "He's always going to be with you...",
      "en": "He's always going to be with you..."
    },
    "discoveredBy": "Hibouxe",
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
    "title": "Our Life: Now & Forever",
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
    "discoveredBy": "Hibouxe",
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
    "discoveredBy": "Hibouxe",
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
    "discoveredBy": "Hibouxe",
    "likesCount": 1,
    "featured": false,
    "coverImage": "https://img.itch.zone/aW1hZ2UvMTA2NTk5LzU4NjAxMi5naWY=/original/%2Fz0let.gif",
    "screenshots": [
      "https://img.itch.zone/aW1hZ2UvMTA2NTk5LzU4NjAxMi5naWY=/original/%2Fz0let.gif"
    ],
    "dateAdded": "2026-09-24"
  },
  {
    "id": "itch-killer-chat-original-edition",
    "title": "Killer Chat! Original Edition",
    "developer": "rosesrot",
    "releaseYear": 2026,
    "platform": "itch",
    "itchUrl": "https://rosesrot.itch.io/killer-chat",
    "isFree": true,
    "pricingText": {
      "fr": "Gratuit / Free 🆓",
      "en": "100% Free 🆓"
    },
    "genre": [
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
    "tagline": {
      "fr": "You're a writer that's been (mistakenly) invited to a serial killer server. Uh oh.",
      "en": "You're a writer that's been (mistakenly) invited to a serial killer server. Uh oh."
    },
    "description": {
      "fr": "You're a writer that's been (mistakenly) invited to a serial killer server. Uh oh.",
      "en": "You're a writer that's been (mistakenly) invited to a serial killer server. Uh oh."
    },
    "discoveredBy": "Hibouxe",
    "likesCount": 1,
    "featured": false,
    "coverImage": "https://img.itch.zone/aW1nLzE4MDAyMzYzLnBuZw==/315x250%23c/ASJcG4.png",
    "screenshots": [
      "https://img.itch.zone/aW1nLzE4MDAyMzYzLnBuZw==/315x250%23c/ASJcG4.png"
    ],
    "dateAdded": "2026-09-25"
  },
  {
    "id": "itch-butterfly-soup",
    "title": "Butterfly Soup",
    "developer": "brianna-lei",
    "releaseYear": 2026,
    "platform": "itch",
    "itchUrl": "https://brianna-lei.itch.io/butterfly-soup",
    "isFree": true,
    "pricingText": {
      "fr": "Gratuit / Free 🆓",
      "en": "100% Free 🆓"
    },
    "genre": [
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
    "tagline": {
      "fr": "Gay girls playing baseball and falling in love",
      "en": "Gay girls playing baseball and falling in love"
    },
    "description": {
      "fr": "Gay girls playing baseball and falling in love",
      "en": "Gay girls playing baseball and falling in love"
    },
    "discoveredBy": "Hibouxe",
    "likesCount": 1,
    "featured": false,
    "coverImage": "https://img.itch.zone/aW1hZ2UvMTQzODk5LzgzMTY0OC5wbmc=/315x250%23c/Q6ST2A.png",
    "screenshots": [
      "https://img.itch.zone/aW1hZ2UvMTQzODk5LzgzMTY0OC5wbmc=/315x250%23c/Q6ST2A.png"
    ],
    "dateAdded": "2026-09-25"
  },
  {
    "id": "friday-night-funkin",
    "title": "Friday Night Funkin'",
    "developer": "ninjamuffin99, PhantomArcade, evilsk8r & Kawai Sprite",
    "releaseYear": 2020,
    "platform": "itch",
    "itchUrl": "https://ninja-muffin24.itch.io/funkin",
    "playInBrowserUrl": "https://ninja-muffin24.itch.io/funkin",
    "isFree": true,
    "pricingText": {
      "fr": "100% Gratuit / Jouable en direct 🌐",
      "en": "100% Free / Playable in Browser 🌐"
    },
    "jam": "Ludum Dare 47",
    "genre": [
      "Rythme",
      "Musique",
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
    "tagline": {
      "fr": "Le phénomène mondial de jeu de rythme open-source né lors de la Ludum Dare 47.",
      "en": "The worldwide open-source rhythm game sensation born during Ludum Dare 47."
    },
    "description": {
      "fr": "Affrontez le père de votre petite amie et une ribambelle d’adversaires charismatiques dans des duels musicaux effrénés au clavier. Jouable directement dans votre navigateur !",
      "en": "Rap battle against charismatic opponents in rhythm-fueled musical showdowns. Playable directly in your browser!"
    },
    "developerMessage": {
      "fr": "Conçu en quelques jours pour la Ludum Dare 47 sous le thème \"Stuck in a loop\". L'énergie de la communauté a propulsé le jeu vers les sommets.",
      "en": "Made in a single weekend for Ludum Dare 47. The open-source community support turned it into an instant cultural touchstone."
    },
    "discoveredBy": "Hibouxe",
    "likesCount": 230,
    "featured": true,
    "coverImage": "https://img.itch.zone/aW1hZ2UvNzkyNzc4LzQ1MjMzNTkucG5n/original/OUw2Vg.png",
    "screenshots": [
      "https://img.itch.zone/aW1hZ2UvNzk2NjA2LzQ1MTU3MzcucG5n/original/Jk6xP3.png"
    ],
    "dateAdded": "2026-09-25"
  },
  {
    "id": "minit-itch",
    "title": "Minit",
    "developer": "JW, Kitty, Jukio, Dom",
    "releaseYear": 2018,
    "platform": "both",
    "itchUrl": "https://devolverdigital.itch.io/minit",
    "steamUrl": "https://store.steampowered.com/app/609490/",
    "isFree": false,
    "pricingText": {
      "fr": "9,99 € sur Itch.io & Steam",
      "en": "$9.99 on Itch.io & Steam"
    },
    "genre": [
      "Aventure",
      "Puzzle",
      "Rétro"
    ],
    "artStyle": {
      "fr": "Monochrome / Minimaliste",
      "en": "Monochrome"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
      "en": "2D Top-down"
    },
    "tagline": {
      "fr": "Une aventure singulière jouée 60 secondes à la fois, dans un style 1-bit culte.",
      "en": "A peculiar little adventure played sixty seconds at a time in iconic 1-bit monochrome."
    },
    "description": {
      "fr": "Quittez le confort de votre maison pour aider les habitants, percer d’innombrables secrets et briser une malédiction qui termine chaque journée après 60 secondes.",
      "en": "Journey outside the comfort of your home to help unusual folks, uncover secrets, and overcome dangerous foes, all in 60-second bursts."
    },
    "discoveredBy": "Hibouxe",
    "likesCount": 115,
    "featured": false,
    "coverImage": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/609490/header.jpg",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/609490/ss_8e5352c3c90cb64670c50bc596328a90ec4db1d9.1920x1080.jpg"
    ],
    "dateAdded": "2026-09-25"
  },
  {
    "id": "sort-the-court",
    "title": "Sort the Court!",
    "developer": "Graebor",
    "releaseYear": 2015,
    "platform": "itch",
    "itchUrl": "https://graebor.itch.io/sort-the-court",
    "playInBrowserUrl": "https://graebor.itch.io/sort-the-court",
    "isFree": true,
    "pricingText": {
      "fr": "100% Gratuit / Jouable en direct 🌐",
      "en": "100% Free / Playable in Browser 🌐"
    },
    "jam": "Ludum Dare 34",
    "genre": [
      "Gestion",
      "Simulation",
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
    "tagline": {
      "fr": "Régnez sur votre royaume médiéval en répondant simplement par Oui ou par Non à vos sujets.",
      "en": "Rule your medieval realm by simply answering Yes or No to requests from your subjects."
    },
    "description": {
      "fr": "Un jeu de gestion narratif charmant conçu pour la Ludum Dare 34 où chaque décision impacte l’or, le bonheur et la population de votre cour.",
      "en": "A delightful narrative management gem created for Ludum Dare 34 where every decree balances gold, population, and happiness."
    },
    "discoveredBy": "Hibouxe",
    "likesCount": 95,
    "featured": false,
    "coverImage": "https://img.itch.zone/aW1hZ2UvNDczNjcvMjA1ODcxLnBuZw==/original/VFJ3Yl.png",
    "screenshots": [
      "https://img.itch.zone/aW1hZ2UvNDczNjcvMjA2NjM0LnBuZw==/original/Hw4wO3.png"
    ],
    "dateAdded": "2026-09-25"
  },
  {
    "id": "windowkill-itch",
    "title": "Windowkill",
    "developer": "torcado",
    "releaseYear": 2024,
    "platform": "both",
    "itchUrl": "https://torcado.itch.io/windowkill",
    "steamUrl": "https://store.steampowered.com/app/2726450/",
    "isFree": false,
    "pricingText": {
      "fr": "3,99 €",
      "en": "$3.99"
    },
    "genre": [
      "Action",
      "Twin-stick",
      "Expérimental"
    ],
    "artStyle": {
      "fr": "Monochrome / Minimaliste",
      "en": "Monochrome"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
      "en": "2D Top-down"
    },
    "tagline": {
      "fr": "Un twin-stick shooter subversif où la fenêtre du jeu rétrécit constamment sur votre bureau.",
      "en": "A subversive twin-stick shooter where the game window itself constantly shrinks on your desktop."
    },
    "description": {
      "fr": "Tirez sur les bords de la fenêtre d’application pour l’agrandir et repousser les vagues d’ennemis dans un concept méta réjouissant.",
      "en": "Shoot the borders of the operating system window to push them back, dodge enemies, and upgrade your abilities in this clever meta concept."
    },
    "discoveredBy": "Hibouxe",
    "likesCount": 88,
    "featured": false,
    "coverImage": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2726450/header.jpg",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2726450/ss_225a66699cfef0ff86a51d18476b7b252084c759.1920x1080.jpg"
    ],
    "dateAdded": "2026-09-25"
  },
  {
    "id": "anatomy-itch",
    "title": "Anatomy",
    "developer": "Kitty Horrorshow",
    "releaseYear": 2016,
    "platform": "itch",
    "itchUrl": "https://kittyhorrorshow.itch.io/anatomy",
    "isFree": false,
    "pricingText": {
      "fr": "2,99 $ (~2,75 €)",
      "en": "$2.99"
    },
    "genre": [
      "Horreur",
      "Psychologique",
      "Exploration"
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
      "fr": "Le chef-d’œuvre de l’horreur psychologique lo-fi explorant l’anatomie d’une maison hantée.",
      "en": "The iconic lo-fi psychological horror masterpiece dissecting the anatomy of a suburban house."
    },
    "description": {
      "fr": "Parcourez une maison plongée dans le noir à la recherche de cassettes audio décortiquant la relation terrifiante entre l’architecture domestique et le corps humain.",
      "en": "A short lo-fi psychological horror game about wandering an empty house in the dark, collecting cassette tapes, and listening to what they have to say."
    },
    "discoveredBy": "Hibouxe",
    "likesCount": 140,
    "featured": true,
    "coverImage": "https://img.itch.zone/aW1hZ2UvNTUwMjMvMjQ2MDYzLnBuZw==/original/WVrLz4.png",
    "screenshots": [
      "https://img.itch.zone/aW1hZ2UvNTM1ODIvMjQxMDgxLmpwZw==/original/GZ1M4E.jpg"
    ],
    "dateAdded": "2026-09-25"
  },
  {
    "id": "lost-constellation",
    "title": "Night in the Woods: Lost Constellation",
    "developer": "Finji / Infinite Fall",
    "releaseYear": 2014,
    "platform": "itch",
    "itchUrl": "https://finji.itch.io/lost-constellation",
    "isFree": true,
    "pricingText": {
      "fr": "Prix libre / Gratuit 🆓",
      "en": "Name your own price / Free 🆓"
    },
    "genre": [
      "Aventure",
      "Narratif",
      "Poétique"
    ],
    "artStyle": {
      "fr": "2D Dessiné à la main",
      "en": "2D Hand-drawn"
    },
    "camera": {
      "fr": "Vue de côté 2D",
      "en": "2D Side-scroller"
    },
    "tagline": {
      "fr": "Le conte hivernal et poétique précurseur du chef-d’œuvre Night in the Woods.",
      "en": "The poetic winter ghost story and narrative precursor to Night in the Woods."
    },
    "description": {
      "fr": "Incarnez l’astronome Adina Astra traversant la Forêt Gelée lors de la plus longue nuit de l’année. Dialogue avec des bonhommes de neige et énigmes mélancoliques.",
      "en": "Travel into the Frozen Woods on the longest night of the year in this narrative ghost story companion to Night in the Woods."
    },
    "discoveredBy": "Hibouxe",
    "likesCount": 102,
    "featured": false,
    "coverImage": "https://img.itch.zone/aW1hZ2UvMTYxMDYvNTg5MjkucG5n/original/qKm4Ja.png",
    "screenshots": [
      "https://img.itch.zone/aW1hZ2UvMTQ2OTkvNDQwNDYucG5n/original/tD0H9%2B.png"
    ],
    "dateAdded": "2026-09-25"
  },
  {
    "id": "a-good-snowman-itch",
    "title": "A Good Snowman Is Hard To Build",
    "developer": "Draknek & Friends",
    "releaseYear": 2015,
    "platform": "both",
    "itchUrl": "https://draknek.itch.io/a-good-snowman",
    "steamUrl": "https://store.steampowered.com/app/316610/",
    "isFree": false,
    "pricingText": {
      "fr": "9,99 €",
      "en": "$9.99"
    },
    "genre": [
      "Puzzle",
      "Réflexion",
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
    "tagline": {
      "fr": "Un jeu de puzzle adorable sur un monstre qui construit des bonhommes de neige.",
      "en": "An adorable puzzle game about being a monster and making snowmen."
    },
    "description": {
      "fr": "Roulez des boules de neige à travers des labyrinthes de haies soigneusement conçus. Une mécanique sokoban épurée et réconfortante.",
      "en": "Roll balls of snow through beautifully crafted garden mazes in this charming and relaxing sokoban puzzle adventure."
    },
    "discoveredBy": "Hibouxe",
    "likesCount": 76,
    "featured": false,
    "coverImage": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/316610/header.jpg",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/316610/ss_e1e17bc84b5c777d19cfb30349f7d3077eb4fa4a.1920x1080.jpg"
    ],
    "dateAdded": "2026-09-25"
  },
  {
    "id": "baba-is-you-prototype",
    "title": "BABA IS YOU (Game Jam Prototype)",
    "developer": "Arvi Teikari (Hempuli)",
    "releaseYear": 2017,
    "platform": "itch",
    "itchUrl": "https://hempuli.itch.io/baba-is-you",
    "playInBrowserUrl": "https://hempuli.itch.io/baba-is-you",
    "isFree": true,
    "pricingText": {
      "fr": "100% Gratuit / Jouable en direct 🌐",
      "en": "100% Free / Playable in Browser 🌐"
    },
    "jam": "Nordic Game Jam 2017",
    "genre": [
      "Puzzle",
      "Réflexion",
      "Expérimental"
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
      "fr": "Le prototype historique vainqueur de la Nordic Game Jam 2017 réinventant les règles de la logique.",
      "en": "The historic Nordic Game Jam 2017 winning prototype where you rewrite the rules of logic."
    },
    "description": {
      "fr": "Poussez des blocs de mots pour changer la nature même des objets : FLAG IS WIN, WALL IS STOP, BABA IS YOU. Jouable directement dans votre navigateur.",
      "en": "Push word blocks to rewrite reality: WALL IS STOP, ROCK IS PUSH, BABA IS YOU. Playable directly in your browser!"
    },
    "discoveredBy": "Hibouxe",
    "likesCount": 198,
    "featured": true,
    "coverImage": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/736260/header.jpg",
    "screenshots": [
      "https://img.itch.zone/aW1hZ2UvMTM2Mjc1LzYyMzU4My5wbmc=/original/Q5j2yq.png"
    ],
    "dateAdded": "2026-09-25"
  },
  {
    "id": "the-hex-itch",
    "title": "The Hex",
    "developer": "Daniel Mullins Games",
    "releaseYear": 2018,
    "platform": "both",
    "itchUrl": "https://danielmullinsgames.itch.io/the-hex",
    "steamUrl": "https://store.steampowered.com/app/510420/",
    "isFree": false,
    "pricingText": {
      "fr": "7,99 €",
      "en": "$9.99"
    },
    "genre": [
      "Mystère",
      "Aventure",
      "Expérimental"
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
      "fr": "Six protagonistes de jeux vidéo enfermés dans une auberge sous la pluie, par le créateur d’Inscryption.",
      "en": "Six video game protagonists trapped in a stormy tavern, from the creator of Inscryption and Pony Island."
    },
    "description": {
      "fr": "Un meurtre est sur le point d’être commis. Revivez les souvenirs des suspects à travers 6 styles de gameplay radicalement différents (RPG, plateforme, tactique, combat).",
      "en": "Six game protagonists reside in an old inn. Someone is planning a murder. Uncover the culprit by diving into their dark pasts across multiple genres."
    },
    "discoveredBy": "Hibouxe",
    "likesCount": 82,
    "featured": false,
    "coverImage": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/510420/header.jpg",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/510420/ss_8d34346fa0dbd7a7ff2908f02f928e4e7e60058e.1920x1080.jpg"
    ],
    "dateAdded": "2026-09-25"
  },
  {
    "id": "vvvvvv-itch",
    "title": "VVVVVV",
    "developer": "Terry Cavanagh",
    "releaseYear": 2010,
    "platform": "both",
    "itchUrl": "https://terrycavanagh.itch.io/vvvvvv",
    "steamUrl": "https://store.steampowered.com/app/70110/",
    "isFree": false,
    "pricingText": {
      "fr": "4,99 €",
      "en": "$4.99"
    },
    "genre": [
      "Plateforme",
      "Rétro",
      "Précision"
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
      "fr": "Le chef-d’œuvre rétro où l’on inverse la gravité au lieu de sauter.",
      "en": "The beloved retro platformer where you invert gravity instead of jumping."
    },
    "description": {
      "fr": "Contrôlez le Capitaine Viridian à travers une dimension hostile pour secourir votre équipage sur l’inoubliable bande-son chiptune de Magnus Pålsson (SoulEye).",
      "en": "Control Captain Viridian as you flip gravity to traverse a dangerous dimension and rescue your scattered crew to SoulEye’s chiptune soundtrack."
    },
    "discoveredBy": "Hibouxe",
    "likesCount": 160,
    "featured": true,
    "coverImage": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/70110/header.jpg",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/70110/ss_37000e318cf1bfa49c3ce36735168434771638bc.1920x1080.jpg"
    ],
    "dateAdded": "2026-09-25"
  },
  {
    "id": "super-hexagon-itch",
    "title": "Super Hexagon",
    "developer": "Terry Cavanagh & Chipzel",
    "releaseYear": 2012,
    "platform": "both",
    "itchUrl": "https://terrycavanagh.itch.io/super-hexagon",
    "steamUrl": "https://store.steampowered.com/app/221640/",
    "isFree": false,
    "pricingText": {
      "fr": "2,99 €",
      "en": "$2.99"
    },
    "genre": [
      "Action",
      "Arcade",
      "Rythme"
    ],
    "artStyle": {
      "fr": "Monochrome / Minimaliste",
      "en": "Monochrome"
    },
    "camera": {
      "fr": "Vue du dessus 2D",
      "en": "2D Top-down"
    },
    "tagline": {
      "fr": "Le jeu d’action minimaliste hypnotique et frénétique au rythme d’une chiptune endiablée.",
      "en": "A hyper-fast minimalist action game that will test your reflexes and rhythm."
    },
    "description": {
      "fr": "Pivotez autour d’un hexagone central pour esquiver des murs convergents dans un tourbillon visuel et sonore ultra-addictif.",
      "en": "Rotate around a central shape to avoid incoming geometric walls to the relentless beats of Chipzel’s chiptune."
    },
    "discoveredBy": "Hibouxe",
    "likesCount": 130,
    "featured": false,
    "coverImage": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/221640/header.jpg",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/221640/ss_164b73b5f25ae87747e4eb1e6d1976bb58972b22.1920x1080.jpg"
    ],
    "dateAdded": "2026-09-25"
  },
  {
    "id": "nuclear-throne-itch",
    "title": "Nuclear Throne",
    "developer": "Vlambeer",
    "releaseYear": 2015,
    "platform": "both",
    "itchUrl": "https://vlambeer.itch.io/nuclear-throne",
    "steamUrl": "https://store.steampowered.com/app/242680/",
    "isFree": false,
    "pricingText": {
      "fr": "11,99 €",
      "en": "$11.99"
    },
    "genre": [
      "Roguelike",
      "Action",
      "Twin-stick"
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
      "fr": "Le rogue-like post-apocalyptique nerveux et viscéral développé en direct par Vlambeer.",
      "en": "The iconic post-apocalyptic roguelike-like top-down shooter developed live by Vlambeer."
    },
    "description": {
      "fr": "Frayez-vous un chemin à travers des terres désolées irradiées avec des mutants aux pouvoirs destructeurs pour atteindre le Trône Nucléaire.",
      "en": "Fight your way through the post-apocalyptic wastelands with powerful mutant abilities and heavy weaponry to reach the Nuclear Throne."
    },
    "discoveredBy": "Hibouxe",
    "likesCount": 155,
    "featured": true,
    "coverImage": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/242680/header.jpg",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/242680/ss_07b9ad0964724a9191d4e028b122f4bda7b2f676.1920x1080.jpg"
    ],
    "dateAdded": "2026-09-25"
  },
  {
    "id": "vampire-survivors-itch",
    "title": "Vampire Survivors (Original Web Prototype)",
    "developer": "poncle (Luca Galante)",
    "releaseYear": 2021,
    "platform": "both",
    "itchUrl": "https://poncle.itch.io/vampire-survivors",
    "playInBrowserUrl": "https://poncle.itch.io/vampire-survivors",
    "steamUrl": "https://store.steampowered.com/app/1794680/",
    "isFree": true,
    "pricingText": {
      "fr": "Gratuit en direct 🌐 / 4,99 € sur Steam",
      "en": "Free in Browser 🌐 / $4.99 on Steam"
    },
    "genre": [
      "Roguelite",
      "Survie",
      "Bullet Hell"
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
      "fr": "La version Web originelle jouable en direct qui a lancé la déferlante mondiale des \"survivors-like\".",
      "en": "The original browser prototype that sparked the worldwide survivor-like gaming phenomenon."
    },
    "description": {
      "fr": "Fauchez des milliers de créatures nocturnes et survivez jusqu’à l’aube. Directement jouable dans votre navigateur !",
      "en": "Mow down thousands of night creatures and survive until dawn. Playable directly in your web browser!"
    },
    "discoveredBy": "Hibouxe",
    "likesCount": 210,
    "featured": true,
    "coverImage": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1794680/header.jpg",
    "screenshots": [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1794680/ss_f8cfc38a16db49fe8e0e98031d77759ad45ad2b9.1920x1080.jpg"
    ],
    "dateAdded": "2026-09-25"
  },
  {
    "id": "birdsong-linssen",
    "title": "Birdsong",
    "developer": "Daniel Linssen (managore)",
    "releaseYear": 2016,
    "platform": "itch",
    "itchUrl": "https://managore.itch.io/birdsong",
    "playInBrowserUrl": "https://managore.itch.io/birdsong",
    "isFree": true,
    "pricingText": {
      "fr": "100% Gratuit / Jouable en direct 🌐",
      "en": "100% Free / Playable in Browser 🌐"
    },
    "genre": [
      "Metroidvania",
      "Poétique",
      "Puzzle"
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
      "fr": "Une pépite minimaliste et contemplative par le maître des micro-metroidvanias de Game Jam.",
      "en": "A contemplative minimalist micro-metroidvania by the master of game jam game design."
    },
    "description": {
      "fr": "Guidez un petit oiseau à travers une forêt de cavernes interconnectées. Explorez, chantez pour activer des mécanismes et trouvez vos oisillons.",
      "en": "Fly through an interconnected maze of caves, sing to activate mystical mechanisms, and reunite your bird family."
    },
    "discoveredBy": "Hibouxe",
    "likesCount": 94,
    "featured": false,
    "coverImage": "https://img.itch.zone/aW1hZ2UvMTUzNjUvNTQ2NDYucG5n/original/khg%2BhM.png",
    "screenshots": [
      "https://img.itch.zone/aW1hZ2UvMTUzNjUvNTQ2NDYucG5n/original/khg%2BhM.png"
    ],
    "dateAdded": "2026-09-25"
  },
  {
    "id": "reap-linssen",
    "title": "Reap",
    "developer": "Daniel Linssen (managore)",
    "releaseYear": 2015,
    "platform": "itch",
    "itchUrl": "https://managore.itch.io/reap",
    "playInBrowserUrl": "https://managore.itch.io/reap",
    "isFree": true,
    "pricingText": {
      "fr": "100% Gratuit / Jouable en direct 🌐",
      "en": "100% Free / Playable in Browser 🌐"
    },
    "jam": "Ludum Dare 34",
    "genre": [
      "Survie",
      "Gestion",
      "Minimaliste"
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
      "fr": "Un micro-jeu de survie et d’agriculture insulaire conçu pour la Ludum Dare 34.",
      "en": "A poignant island survival and farming micro-game crafted for Ludum Dare 34."
    },
    "description": {
      "fr": "Échoué sur un archipel désert, plantez des graines, entretenez vos feux et gérez votre endurance jour après jour.",
      "en": "Stranded on an empty island, plant crops, tend to fires, and manage your daily energy in this poetic micro-survival."
    },
    "discoveredBy": "Hibouxe",
    "likesCount": 91,
    "featured": false,
    "coverImage": "https://img.itch.zone/aW1hZ2UvNDgwNjIvMjEwNTY0LmdpZg==/original/8bMoIe.gif",
    "screenshots": [
      "https://img.itch.zone/aW1hZ2UvNDczMTMvMjA0MTYwLnBuZw==/original/g4T5g6.png"
    ],
    "dateAdded": "2026-09-25"
  },
  {
    "id": "itch-we-become-what-we-behold",
    "title": "We Become What We Behold",
    "developer": "ncase",
    "releaseYear": 2026,
    "platform": "itch",
    "itchUrl": "https://ncase.itch.io/wbwwb",
    "playInBrowserUrl": "https://ncase.itch.io/wbwwb",
    "isFree": true,
    "pricingText": {
      "fr": "Gratuit / Free 🆓",
      "en": "100% Free 🆓"
    },
    "genre": [
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
    "tagline": {
      "fr": "a game about news cycles, vicious cycles, infinite cycles",
      "en": "a game about news cycles, vicious cycles, infinite cycles"
    },
    "description": {
      "fr": "a game about news cycles, vicious cycles, infinite cycles",
      "en": "a game about news cycles, vicious cycles, infinite cycles"
    },
    "discoveredBy": "Hibouxe",
    "likesCount": 1,
    "featured": false,
    "coverImage": "https://img.itch.zone/aW1hZ2UvOTIxMTUvNDU0MDMxLnBuZw==/315x250%23c/cxthdQ.png",
    "screenshots": [
      "https://img.itch.zone/aW1hZ2UvOTIxMTUvNDU0MDMxLnBuZw==/315x250%23c/cxthdQ.png"
    ],
    "dateAdded": "2026-09-25"
  },
  {
    "id": "itch-mushroom-oasis",
    "title": "Mushroom Oasis",
    "developer": "deerspherestudios",
    "releaseYear": 2026,
    "platform": "itch",
    "itchUrl": "https://deerspherestudios.itch.io/mushroom-oasis",
    "isFree": true,
    "pricingText": {
      "fr": "Gratuit / Free 🆓",
      "en": "100% Free 🆓"
    },
    "genre": [
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
    "tagline": {
      "fr": "beware of toxic fungi. a slow burn yandere vn (in development)",
      "en": "beware of toxic fungi. a slow burn yandere vn (in development)"
    },
    "description": {
      "fr": "beware of toxic fungi. a slow burn yandere vn (in development)",
      "en": "beware of toxic fungi. a slow burn yandere vn (in development)"
    },
    "discoveredBy": "Hibouxe",
    "likesCount": 1,
    "featured": false,
    "coverImage": "https://img.itch.zone/aW1nLzExNTkxMzIxLmdpZg==/original/pECVwW.gif",
    "screenshots": [
      "https://img.itch.zone/aW1nLzExNTkxMzIxLmdpZg==/original/pECVwW.gif"
    ],
    "dateAdded": "2026-09-25"
  }
];
