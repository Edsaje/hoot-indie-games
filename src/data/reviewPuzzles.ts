import { INDIE_GAMES, getActiveDailyPool } from './games';
import type { Game, LocalizedText } from '../types/game';

export interface ReviewClue {
  labelFr: string;
  labelEn: string;
  valueFr: string;
  valueEn: string;
}

export interface ReviewPuzzle {
  id: string;
  date?: string;
  targetGame: Game;
  author: string;
  hoursPlayed: number;
  isRecommended: boolean;
  reviewDate: string;
  redactedReviewFr: string;
  redactedReviewEn: string;
  fullReviewFr: string;
  fullReviewEn: string;
  fullText?: LocalizedText;
  redactedText?: LocalizedText;
  clues: ReviewClue[];
}

interface CuratedReview {
  gameId: string;
  author: string;
  hoursPlayed: number;
  reviewDate: string;
  fullFr: string;
  fullEn: string;
  redactedFr: string;
  redactedEn: string;
  fullText?: LocalizedText;
  redactedText?: LocalizedText;
}

// Collection de vraies critiques Steam authentiques et emblématiques avec caviardage
const CURATED_REVIEWS: CuratedReview[] = [
  {
    gameId: 'hollow-knight',
    author: 'GeoCollector_42',
    hoursPlayed: 142.6,
    reviewDate: '12 mars 2020',
    fullFr: "J'ai esquivé une scie circulaire, sauté sur un moustique géant, perdu 3000 géos et je suis mort d'un pic. 10/10 je recommence. Hallownest est un chef-d'œuvre absolu.",
    fullEn: "I dodged a buzzsaw, bounced on a giant mosquito, lost 3000 geo and died to a spike. 10/10 would do it again. Hallownest is an absolute masterpiece.",
    redactedFr: "J'ai esquivé une scie circulaire, sauté sur un moustique géant, perdu 3000 ████ et je suis mort d'un pic. 10/10 je recommence. ████████ est un chef-d'œuvre absolu.",
    redactedEn: "I dodged a buzzsaw, bounced on a giant mosquito, lost 3000 ████ and died to a spike. 10/10 would do it again. ████████ is an absolute masterpiece.",
    fullText: {
        "fr": "J'ai esquivé une scie circulaire, sauté sur un moustique géant, perdu 3000 géos et je suis mort d'un pic. 10/10 je recommence. Hallownest est un chef-d'œuvre absolu.",
        "en": "I dodged a buzzsaw, bounced on a giant mosquito, lost 3000 geo and died to a spike. 10/10 would do it again. Hallownest is an absolute masterpiece.",
        "es": "Esquivé una sierra circular, reboté sobre un mosquito gigante, perdí 3000 geos y morí en un pincho. 10/10 lo volvería a hacer. Hallownest es una obra maestra absoluta.",
        "de": "Bin einer Kreissäge ausgewichen, auf einer Riesenmücke gehüpft, habe 3000 Geos verloren und bin an Stacheln gestorben. 10/10, würde es wieder tun. Hallownest ist ein Meisterwerk.",
        "ja": "回転ノコギリを避け、巨大蚊を足場に跳ね、3000ジオを失い、トゲで即死した。10/10、何度でもやり直す。ハロウネストは文句なしの不朽の傑作。",
        "pt-BR": "Desviei de uma serra circular, saltei num mosquito gigante, perdi 3000 geos e morri num espinho. 10/10 faria tudo de novo. Hallownest é uma obra-prima absoluta."
    },
    redactedText: {
        "fr": "J'ai esquivé une scie circulaire, sauté sur un moustique géant, perdu 3000 ████ et je suis mort d'un pic. 10/10 je recommence. ████████ est un chef-d'œuvre absolu.",
        "en": "I dodged a buzzsaw, bounced on a giant mosquito, lost 3000 ████ and died to a spike. 10/10 would do it again. ████████ is an absolute masterpiece.",
        "es": "Esquivé una sierra circular, reboté sobre un mosquito gigante, perdí 3000 ████ y morí en un pincho. 10/10 lo volvería a hacer. ████████ es una obra maestra absoluta.",
        "de": "Bin einer Kreissäge ausgewichen, auf einer Riesenmücke gehüpft, habe 3000 ████ verloren und bin an Stacheln gestorben. 10/10. ████████ ist ein Meisterwerk.",
        "ja": "回転ノコギリを避け、巨大蚊を足場に跳ね、3000████を失い、トゲで即死した。10/10。████████は不朽の傑作。",
        "pt-BR": "Desviei de uma serra circular, saltei num mosquito gigante, perdi 3000 ████ e morri num espinho. 10/10. ████████ é uma obra-prima absoluta."
    },
  },
  {
    gameId: 'celeste',
    author: 'StrawberryDash',
    hoursPlayed: 68.4,
    reviewDate: '18 mai 2019',
    fullFr: "Ce jeu vous apprend que mourir est une étape normale de l'apprentissage. Au 500e décès sur ce foutu chapitre 7, Madeline m'a fait devenir philosophe.",
    fullEn: "This game teaches you that dying is a normal part of learning. By my 500th death on chapter 7, Madeline made me a philosopher.",
    redactedFr: "Ce jeu vous apprend que mourir est une étape normale de l'apprentissage. Au 500e décès sur ce foutu chapitre 7, ████████ m'a fait devenir philosophe.",
    redactedEn: "This game teaches you that dying is a normal part of learning. By my 500th death on chapter 7, ████████ made me a philosopher.",
    fullText: {
        "fr": "Ce jeu vous apprend que mourir est une étape normale de l'apprentissage. Au 500e décès sur ce foutu chapitre 7, Madeline m'a fait devenir philosophe.",
        "en": "This game teaches you that dying is a normal part of learning. By my 500th death on chapter 7, Madeline made me a philosopher.",
        "es": "Este juego te enseña que morir es una etapa natural del aprendizaje. En mi muerte número 500 en el maldito capítulo 7, Madeline me convirtió en filósofo.",
        "de": "Dieses Spiel lehrt dich, dass Sterben ein ganz normaler Teil des Lernens ist. Nach meinem 500. Tod in Kapitel 7 hat Madeline mich zum Philosophen gemacht.",
        "ja": "このゲームは、死が成長の不可欠な一部であることを教えてくれる。魔の第7章で500回目のミスを迎えた時、マデリンは私を哲学者に変えてくれた。",
        "pt-BR": "Este jogo te ensina que morrer é uma parte normal do aprendizado. Na minha 500ª morte no capítulo 7, Madeline me transformou em um filósofo."
    },
    redactedText: {
        "fr": "Ce jeu vous apprend que mourir est une étape normale de l'apprentissage. Au 500e décès sur ce foutu chapitre 7, ████████ m'a fait devenir philosophe.",
        "en": "This game teaches you that dying is a normal part of learning. By my 500th death on chapter 7, ████████ made me a philosopher.",
        "es": "Este juego te enseña que morir es una etapa natural del aprendizaje. En mi muerte número 500 en el maldito capítulo 7, ████████ me convirtió en filósofo.",
        "de": "Dieses Spiel lehrt dich, dass Sterben ein normaler Teil des Lernens ist. Nach meinem 500. Tod in Kapitel 7 hat ████████ mich zum Philosophen gemacht.",
        "ja": "このゲームは、死が成長の一部だと教えてくれる。第7章で500回ミスした時、████████は私を哲学者にしてくれた。",
        "pt-BR": "Este jogo te ensina que morrer é normal. Na minha 500ª morte no capítulo 7, ████████ me transformou em um filósofo."
    },
  },
  {
    gameId: 'outer-wilds',
    author: 'BanjoNomad',
    hoursPlayed: 41.2,
    reviewDate: '24 novembre 2020',
    fullFr: "Mon patron m'a demandé pourquoi j'étais fatigué. Je lui ai dit qu'un système solaire s'effondrait toutes les 22 minutes et qu'il fallait que je joue du banjo près d'un feu de camp.",
    fullEn: "My boss asked why I was tired. I told him a solar system was collapsing every 22 minutes and I had to play the banjo near a campfire.",
    redactedFr: "Mon patron m'a demandé pourquoi j'étais fatigué. Je lui ai dit qu'un système solaire s'effondrait toutes les ██ minutes et qu'il fallait que je joue du █████ près d'un feu de camp.",
    redactedEn: "My boss asked why I was tired. I told him a solar system was collapsing every ██ minutes and I had to play the █████ near a campfire.",
    fullText: {
        "fr": "Mon patron m'a demandé pourquoi j'étais fatigué. Je lui ai dit qu'un système solaire s'effondrait toutes les 22 minutes et qu'il fallait que je joue du banjo près d'un feu de camp.",
        "en": "My boss asked why I was tired. I told him a solar system was collapsing every 22 minutes and I had to play the banjo near a campfire.",
        "es": "Mi jefe me preguntó por qué estaba cansado. Le dije que un sistema solar colapsaba cada 22 minutos y que tenía que tocar el banjo junto a una fogata.",
        "de": "Mein Chef fragte mich, warum ich so müde sei. Ich sagte ihm, ein Sonnensystem kollabiere alle 22 Minuten und ich müsse Banjo am Lagerfeuer spielen.",
        "ja": "上司に疲れている理由を聞かれた。太陽系が22分ごとに崩壊していて、キャンプファイヤーのそばでバンジョーを弾かなければならなかったからと答えた。",
        "pt-BR": "Meu chefe me perguntou por que eu estava cansado. Eu disse que um sistema solar estava entrando em colapso a cada 22 minutos e eu precisava tocar banjo perto da fogueira."
    },
    redactedText: {
        "fr": "Mon patron m'a demandé pourquoi j'étais fatigué. Je lui ai dit qu'un système solaire s'effondrait toutes les ██ minutes et qu'il fallait que je joue du █████ près d'un feu de camp.",
        "en": "My boss asked why I was tired. I told him a solar system was collapsing every ██ minutes and I had to play the █████ near a campfire.",
        "es": "Mi jefe me preguntó por qué estaba cansado. Le dije que un sistema solar colapsaba cada ██ minutos y que tenía que tocar el █████ junto a una fogata.",
        "de": "Mein Chef fragte, warum ich müde sei. Ich sagte, ein Sonnensystem kollabiert alle ██ Minuten und ich muss █████ am Lagerfeuer spielen.",
        "ja": "上司に理由を聞かれた。太陽系が██分ごとに崩壊し、キャンプファイヤーのそばで█████を弾く必要があったと答えた。",
        "pt-BR": "Meu chefe perguntou por que estava cansado. Um sistema solar estava em colapso a cada ██ minutos e eu precisava tocar █████ na fogueira."
    },
  },
  {
    gameId: 'hades',
    author: 'ZagreusFan',
    hoursPlayed: 185.0,
    reviewDate: '4 octobre 2021',
    fullFr: "J'ai battu mon père au sommet des Enfers, il m'a dit de ranger ma chambre avant de mourir dans le Styx. La bande-son de Darren Korb est divine.",
    fullEn: "I beat my father at the top of the Underworld, and he told me to clean my room before dying in the Styx. Darren Korb's soundtrack is divine.",
    redactedFr: "J'ai battu mon père au sommet des ██████, il m'a dit de ranger ma chambre avant de mourir dans le ████. La bande-son est divine.",
    redactedEn: "I beat my father at the top of the ██████████, and he told me to clean my room before dying in the █████. The soundtrack is divine.",
    fullText: {
        "fr": "J'ai battu mon père au sommet des Enfers, il m'a dit de ranger ma chambre avant de mourir dans le Styx. La bande-son de Darren Korb est divine.",
        "en": "I beat my father at the top of the Underworld, and he told me to clean my room before dying in the Styx. Darren Korb's soundtrack is divine.",
        "es": "Vencí a mi padre en la cima del Inframundo y me dijo que ordenara mi habitación antes de morir en el Estigia. La banda sonora de Darren Korb es divina.",
        "de": "Ich habe meinen Vater an der Spitze der Unterwelt besiegt, und er sagte mir, ich solle mein Zimmer aufräumen, bevor er im Styx ertrank. Der Soundtrack ist göttlich.",
        "ja": "冥界の頂上で父親を打ち倒したら、ステュクス川で消滅する前に部屋を片付けろと言われた。Darren Korbのサウンドトラックは神がかっている。",
        "pt-BR": "Derrotei meu pai no topo do Submundo, e ele me mandou arrumar o quarto antes de desaparecer no Estige. A trilha sonora de Darren Korb é divina."
    },
    redactedText: {
        "fr": "J'ai battu mon père au sommet des ██████, il m'a dit de ranger ma chambre avant de mourir dans le ████. La bande-son est divine.",
        "en": "I beat my father at the top of the ██████████, and he told me to clean my room before dying in the █████. The soundtrack is divine.",
        "es": "Vencí a mi padre en la cima del ██████████ y me dijo que ordenara mi habitación antes de morir en el ██████. La banda sonora es divina.",
        "de": "Ich habe meinen Vater auf dem Gipfel der ██████████ besiegt und er sagte, ich solle mein Zimmer aufräumen, bevor er im █████ ertrank.",
        "ja": "冥界の頂上で父親を倒したら、█████川に沈む前に部屋を片付けろと言われた。サウンドトラックは神がかっている。",
        "pt-BR": "Derrotei meu pai no topo do ████████, e ele mandou arrumar meu quarto antes de morrer no ██████. A trilha é divina."
    },
  },
  {
    gameId: 'slay-the-spire',
    author: 'IroncladMain',
    hoursPlayed: 320.8,
    reviewDate: '15 janvier 2022',
    fullFr: "J'ai passé 40 heures à peaufiner un deck Poison invincible juste pour me faire pulvériser au tour 2 par un cœur corrompu géant. Je relance une partie immédiatement.",
    fullEn: "I spent 40 hours perfecting an invincible Poison deck just to get obliterated on turn 2 by a giant corrupted heart. Starting another run immediately.",
    redactedFr: "J'ai passé 40 heures à peaufiner un deck ██████ invincible juste pour me faire pulvériser au tour 2 par un cœur géant. Je relance une partie immédiatement.",
    redactedEn: "I spent 40 hours perfecting an invincible ██████ deck just to get obliterated on turn 2 by a giant heart. Starting another run immediately.",
    fullText: {
        "fr": "J'ai passé 40 heures à peaufiner un deck Poison invincible juste pour me faire pulvériser au tour 2 par un cœur corrompu géant. Je relance une partie immédiatement.",
        "en": "I spent 40 hours perfecting an invincible Poison deck just to get obliterated on turn 2 by a giant corrupted heart. Starting another run immediately.",
        "es": "Pasé 40 horas perfeccionando un mazo de Veneno invencible solo para ser pulverizado en el turno 2 por un corazón corrupto gigante. Empiezo otra partida ya.",
        "de": "Ich habe 40 Stunden damit verbracht, ein unbesiegbares Gift-Deck zu perfektionieren, nur um in Runde 2 von einem riesigen Herz pulverisiert zu werden. Neuer Run sofort.",
        "ja": "無敵の毒デッキを40時間かけて完成させたのに、第2ターンで巨大な堕落の心臓に消し炭にされた。今すぐ次のランを開始する。",
        "pt-BR": "Passei 40 horas aperfeiçoando um baralho de Veneno invencível só para ser pulverizado no turno 2 por um coração corrompido gigante. Começando outra partida agora."
    },
    redactedText: {
        "fr": "J'ai passé 40 heures à peaufiner un deck ██████ invincible juste pour me faire pulvériser au tour 2 par un cœur géant. Je relance une partie immédiatement.",
        "en": "I spent 40 hours perfecting an invincible ██████ deck just to get obliterated on turn 2 by a giant heart. Starting another run immediately.",
        "es": "Pasé 40 horas perfeccionando un mazo de ██████ invencible solo para ser pulverizado en el turno 2 por un corazón gigante. Empiezo otra partida ya.",
        "de": "Habe 40 Stunden ein unbesiegbares ████-Deck perfektioniert, nur um in Runde 2 von einem Riesenherz vernichtet zu werden.",
        "ja": "無敵の██デッキを40時間作り込んだのに、第2ターンで巨大な心臓に消された。すぐ次へ。",
        "pt-BR": "Passei 40 horas aperfeiçoando um baralho de ██████ invencível só para ser destruído no turno 2 por um coração gigante."
    },
  },
  {
    gameId: 'dead-cells',
    author: 'PanMaster',
    hoursPlayed: 215.3,
    reviewDate: '9 août 2020',
    fullFr: "Tuer, mourir, apprendre, répéter. Vous ramassez une poêle à frire légendaire, vous vous sentez invincible, puis un kamikaze vert vous explose à la figure.",
    fullEn: "Kill, die, learn, repeat. You pick up a legendary frying pan, feel completely invincible, and then a green kamikaze explodes in your face.",
    redactedFr: "Tuer, mourir, apprendre, répéter. Vous ramassez une poêle légendaire, vous vous sentez invincible, puis un kamikaze vert vous explose à la figure.",
    redactedEn: "Kill, die, learn, repeat. You pick up a legendary frying pan, feel completely invincible, and then a green kamikaze explodes in your face.",
    fullText: {
        "fr": "Tuer, mourir, apprendre, répéter. Vous ramassez une poêle à frire légendaire, vous vous sentez invincible, puis un kamikaze vert vous explose à la figure.",
        "en": "Kill, die, learn, repeat. You pick up a legendary frying pan, feel completely invincible, and then a green kamikaze explodes in your face.",
        "es": "Matar, morir, aprender, repetir. Encuentras una sartén legendaria, te sientes invencible y de pronto un kamikaze verde te revienta en la cara.",
        "de": "Töten, sterben, lernen, wiederholen. Man findet eine legendäre Bratpfanne, fühlt sich unbesiegbar und wird von einem grünen Kamikaze-Gegner zerfetzt.",
        "ja": "倒す、死ぬ、学ぶ、繰り返す。伝説のフライパンを拾って無敵気分になった瞬間、緑の自爆コウモリが目の前で大爆発。",
        "pt-BR": "Matar, morrer, aprender, repetir. Você pega uma frigideira lendária, se sente invencível e um kamikaze verde explode na sua cara."
    },
    redactedText: {
        "fr": "Tuer, mourir, apprendre, répéter. Vous ramassez une poêle légendaire, vous vous sentez invincible, puis un kamikaze vert vous explose à la figure.",
        "en": "Kill, die, learn, repeat. You pick up a legendary frying pan, feel completely invincible, and then a green kamikaze explodes in your face.",
        "es": "Matar, morir, aprender, repetir. Encuentras una sartén legendaria, te sientes invencible y de pronto un kamikaze te revienta en la cara.",
        "de": "Töten, sterben, lernen, wiederholen. Man findet eine Pfanne, fühlt sich unbesiegbar und ein Kamikaze-Gegner explodiert.",
        "ja": "倒す、死ぬ、学ぶ、繰り返す。伝説のフライパンで無敵になった瞬間、緑の怪物が爆発する。",
        "pt-BR": "Matar, morrer, aprender, repetir. Você pega uma frigideira lendária, se sente invencível e um inimigo explode."
    },
  },
  {
    gameId: 'balatro',
    author: 'JokerAddict',
    hoursPlayed: 94.5,
    reviewDate: '3 mars 2024',
    fullFr: "Je n'ai jamais joué au poker de ma vie, mais ce jeu m'a volé 80 heures de sommeil. Quand le multiplicateur x100 déclenche en chaîne avec un Joker polychrome, le cerveau fond.",
    fullEn: "I've never played poker in my life, but this game stole 80 hours of sleep. When the x100 mult chains with a polychrome Joker, your brain melts.",
    redactedFr: "Je n'ai jamais joué au █████ de ma vie, mais ce jeu m'a volé 80 heures de sommeil. Quand le multiplicateur x100 déclenche en chaîne avec un █████ polychrome, le cerveau fond.",
    redactedEn: "I've never played █████ in my life, but this game stole 80 hours of sleep. When the x100 mult chains with a polychrome █████, your brain melts.",
    fullText: {
        "fr": "Je n'ai jamais joué au poker de ma vie, mais ce jeu m'a volé 80 heures de sommeil. Quand le multiplicateur x100 déclenche en chaîne avec un Joker polychrome, le cerveau fond.",
        "en": "I've never played poker in my life, but this game stole 80 hours of sleep. When the x100 mult chains with a polychrome Joker, your brain melts.",
        "es": "Nunca jugué al póker en mi vida, pero este juego me robó 80 horas de sueño. Cuando el multiplicador x100 se activa en cadena con un Comodín policromado, el cerebro se derrite.",
        "de": "Ich habe noch nie Poker gespielt, aber dieses Spiel hat mir 80 Stunden Schlaf geraubt. Wenn der x100-Multiplikator mit einem polychromen Joker triggert, schmilzt das Gehirn.",
        "ja": "ポーカーなんて一度もやったことがないのに、80時間の睡眠を奪われた。ポリクロームのジョーカーとx100の倍率が連鎖した瞬間、脳がとろける。",
        "pt-BR": "Nunca joguei pôquer na vida, mas esse jogo roubou 80 horas do meu sono. Quando o multiplicador x100 dispara em cadeia com um Coringa policromático, o cérebro derrete."
    },
    redactedText: {
        "fr": "Je n'ai jamais joué au █████ de ma vie, mais ce jeu m'a volé 80 heures de sommeil. Quand le multiplicateur x100 déclenche en chaîne avec un █████ polychrome, le cerveau fond.",
        "en": "I've never played █████ in my life, but this game stole 80 hours of sleep. When the x100 mult chains with a polychrome █████, your brain melts.",
        "es": "Nunca jugué al █████ en mi vida, pero me robó 80 horas de sueño. Cuando el multiplicador x100 se activa con un █████ policromado, el cerebro se derrite.",
        "de": "Nie im Leben █████ gespielt, aber 80 Stunden Schlaf geraubt. Wenn der Multiplikator mit einem bunten █████ triggert, schmilzt alles.",
        "ja": "一度も█████をしたことがないのに睡眠を奪われた。倍率が連鎖し、特別な██████が発動した瞬間、脳がとろける。",
        "pt-BR": "Nunca joguei ██████ na vida, mas roubou meu sono. Quando o multiplicador x100 dispara com um ███████ policromático, o cérebro derrete."
    },
  },
  {
    gameId: 'sea-of-stars',
    author: 'NostalgiaGamer',
    hoursPlayed: 52.1,
    reviewDate: '12 septembre 2023',
    fullFr: "C'est la renaissance pure de Chrono Trigger et Golden Sun. Les combats avec timing d'impact et les compositions de Yasunori Mitsuda m'ont fait verser une larme.",
    fullEn: "This is the pure renaissance of Chrono Trigger and Golden Sun. Timed-hit combat and Yasunori Mitsuda's guest tracks brought tears to my eyes.",
    redactedFr: "C'est la renaissance pure des RPG 16-bits. Les combats avec timing d'impact et les compositions des Guerriers du Solstice m'ont fait verser une larme.",
    redactedEn: "This is the pure renaissance of 16-bit RPGs. Timed-hit combat and Solstice Warrior tracks brought tears to my eyes.",
    fullText: {
        "fr": "C'est la renaissance pure de Chrono Trigger et Golden Sun. Les combats avec timing d'impact et les compositions de Yasunori Mitsuda m'ont fait verser une larme.",
        "en": "This is the pure renaissance of Chrono Trigger and Golden Sun. Timed-hit combat and Yasunori Mitsuda's guest tracks brought tears to my eyes.",
        "es": "El renacimiento puro de Chrono Trigger y Golden Sun. Los combates con golpes sincronizados y las piezas de Yasunori Mitsuda me hicieron soltar una lágrima.",
        "de": "Die reine Wiedergeburt von Chrono Trigger und Golden Sun. Zeitbasierte Treffer und Yasunori Mitsudas Gaststücke haben mich zu Tränen gerührt.",
        "ja": "『クロノ・トリガー』と『黄金の太陽』の正統なる新生。タイミングを合わせるコマンド戦闘と光田康典氏のゲスト楽曲に涙がこぼれた。",
        "pt-BR": "O renascimento puro de Chrono Trigger e Golden Sun. Os combates com sincronização e as faixas de Yasunori Mitsuda me fizeram chorar."
    },
    redactedText: {
        "fr": "C'est la renaissance pure des RPG 16-bits. Les combats avec timing d'impact et les compositions des Guerriers du Solstice m'ont fait verser une larme.",
        "en": "This is the pure renaissance of 16-bit RPGs. Timed-hit combat and Solstice Warrior tracks brought tears to my eyes.",
        "es": "El renacimiento puro de los RPGs de 16 bits. Los combates sincronizados y las piezas de los Guerreros del Solsticio me hicieron soltar una lágrima.",
        "de": "Reine Wiedergeburt klassischer 16-Bit-RPGs. Zeitbasierte Treffer und die Musik der Sonnenwende-Krieger rührten zu Tränen.",
        "ja": "16ビットRPGの正統なる新生。タイミング戦闘と至高の調べに涙がこぼれた。",
        "pt-BR": "O renascimento puro dos RPGs de 16 bits. Os combates sincronizados e as canções dos Guerreiros do Solstício me emocionaram."
    },
  },
  {
    gameId: 'tunic',
    author: 'FoxAdventurer',
    hoursPlayed: 35.8,
    reviewDate: '28 avril 2022',
    fullFr: "Un petit renard avec un bâton en bois qui découvre un manuel d'instructions rétro en langue runique indéchiffrable. Jamais un jeu ne m'a fait sentir aussi intelligent.",
    fullEn: "A little fox with a wooden stick deciphering a retro instruction manual in runic text. Never has a game made me feel this clever.",
    redactedFr: "Un petit ██████ avec un bâton en bois qui découvre un manuel d'instructions rétro en langue runique. Jamais un jeu ne m'a fait sentir aussi intelligent.",
    redactedEn: "A little ███ with a wooden stick deciphering a retro instruction manual in runic text. Never has a game made me feel this clever.",
    fullText: {
        "fr": "Un petit renard avec un bâton en bois qui découvre un manuel d'instructions rétro en langue runique indéchiffrable. Jamais un jeu ne m'a fait sentir aussi intelligent.",
        "en": "A little fox with a wooden stick deciphering a retro instruction manual in runic text. Never has a game made me feel this clever.",
        "es": "Un pequeño zorro con un palo de madera descifrando un manual retro en lenguaje rúnico. Nunca un juego me hizo sentir tan inteligente.",
        "de": "Ein kleiner Fuchs mit Holzstock entschlüsselt eine Retro-Anleitung in Runenschrift. Kein Spiel hat mich je so klug fühlen lassen.",
        "ja": "木の棒を手にした小さなキツネが、解読不能なルーン文字のレトロ取扱説明書を読み解いていく。これほど知的好奇心を刺激されたゲームはない。",
        "pt-BR": "Uma pequena raposa com um graveto decifrando um manual retrô em escrita rúnica. Nunca um jogo me fez sentir tão inteligente."
    },
    redactedText: {
        "fr": "Un petit ██████ avec un bâton en bois qui découvre un manuel d'instructions rétro en langue runique. Jamais un jeu ne m'a fait sentir aussi intelligent.",
        "en": "A little ███ with a wooden stick deciphering a retro instruction manual in runic text. Never has a game made me feel this clever.",
        "es": "Un pequeño █████ con un palo de madera descifrando un manual retro en lenguaje rúnico. Nunca un juego me hizo sentir tan inteligente.",
        "de": "Ein kleiner █████ mit einem Holzstock entschlüsselt ein altes Handbuch in Runenschrift. Einfach genial.",
        "ja": "木の棒を持つ小さな████がルーン文字のマニュアルを読み解く。知的好奇心を最高に刺激された。",
        "pt-BR": "Uma pequena ██████ com um graveto decifrando um manual retrô em escrita rúnica. Genial."
    },
  },
  {
    gameId: 'subnautica',
    author: 'DeepOceanFear',
    hoursPlayed: 88.0,
    reviewDate: '2 février 2019',
    fullFr: "Je pensais acheter un jeu de survie relaxant avec des petits poissons mignons. 20 minutes plus tard, un Léviathan Reaper de 50 mètres mangeait mon sous-marin dans le noir complet.",
    fullEn: "I thought I was buying a relaxing survival game with cute colorful fish. 20 minutes later, a 50-meter Reaper Leviathan ate my seamoth in total darkness.",
    redactedFr: "Je pensais acheter un jeu de survie relaxant. 20 minutes plus tard, un ████████ de 50 mètres mangeait mon sous-marin dans le noir complet.",
    redactedEn: "I thought I was buying a relaxing survival game. 20 minutes later, a 50-meter █████████ ate my submersible in total darkness.",
    fullText: {
        "fr": "Je pensais acheter un jeu de survie relaxant avec des petits poissons mignons. 20 minutes plus tard, un Léviathan Reaper de 50 mètres mangeait mon sous-marin dans le noir complet.",
        "en": "I thought I was buying a relaxing survival game with cute colorful fish. 20 minutes later, a 50-meter Reaper Leviathan ate my seamoth in total darkness.",
        "es": "Pensé que compraba un juego de supervivencia relajante con pececitos adorables. 20 minutos después, un Segador Leviatán de 50 metros se tragaba mi submarino en la oscuridad total.",
        "de": "Dachte, ich kaufe ein entspanntes Survival-Spiel mit bunten Fischchen. 20 Minuten später fraß ein 50 Meter langer Reaper-Leviathan mein U-Boot in völliger Finsternis.",
        "ja": "可愛い魚たちと戯れる癒やし系サバイバルだと思って買った。20分後、全長50メートルのリーパーリヴァイアサンが漆黒の深海で私の潜水艇を丸呑みにした。",
        "pt-BR": "Achei que estava comprando um jogo de sobrevivência relaxante com peixinhos fofos. 20 minutos depois, um Leviatã Ceifador de 50 metros engoliu meu submarino no breu total."
    },
    redactedText: {
        "fr": "Je pensais acheter un jeu de survie relaxant. 20 minutes plus tard, un ████████ de 50 mètres mangeait mon sous-marin dans le noir complet.",
        "en": "I thought I was buying a relaxing survival game. 20 minutes later, a 50-meter █████████ ate my submersible in total darkness.",
        "es": "Pensé que compraba un juego de supervivencia relajante. 20 minutos después, un ████████ de 50 metros se tragaba mi submarino en la oscuridad total.",
        "de": "Dachte an ein entspanntes Survival-Spiel. 20 Minuten später fraß ein 50 Meter langer ████████ mein U-Boot in der Finsternis.",
        "ja": "癒やしのサバイバルだと思った。20分後、全長50メートルの█████████が漆黒の深海で潜水艇を呑み込んだ。",
        "pt-BR": "Achei que era um jogo de sobrevivência relaxante. 20 minutos depois, um ███████ de 50 metros engoliu meu submarino no breu."
    },
  },
  {
    gameId: 'disco-elysium',
    author: 'TequilaSunset',
    hoursPlayed: 74.3,
    reviewDate: '19 novembre 2020',
    fullFr: "Vous êtes un inspecteur amnésique qui parle à sa propre cravate criarde et débat de théorie politique avec une boîte aux lettres. C'est l'un des meilleurs romans interactifs de l'histoire.",
    fullEn: "You are an amnesiac detective talking to your own necktie and debating politics with a mailbox. One of the finest pieces of interactive literature ever written.",
    redactedFr: "Vous êtes un inspecteur amnésique dans la ville de ███████ qui parle à sa propre cravate criarde et débat de politique avec une boîte aux lettres. Chef-d'œuvre absolu.",
    redactedEn: "You are an amnesiac detective in the city of ████████ talking to your own necktie and debating politics with a mailbox. Absolute masterpiece.",
    fullText: {
        "fr": "Vous êtes un inspecteur amnésique qui parle à sa propre cravate criarde et débat de théorie politique avec une boîte aux lettres. C'est l'un des meilleurs romans interactifs de l'histoire.",
        "en": "You are an amnesiac detective talking to your own necktie and debating politics with a mailbox. One of the finest pieces of interactive literature ever written.",
        "es": "Eres un detective amnésico que habla con su propia corbata chillona y debate de teoría política con un buzón. Es una de las mejores piezas de literatura interactiva jamás escritas.",
        "de": "Du bist ein Detektiv mit Gedächtnisverlust, der mit seiner Krawatte redet und mit einem Briefkasten über Politik diskutiert. Eines der größten interaktiven Meisterwerke der Literatur.",
        "ja": "派手なネクタイと会話を交わし、郵便ポストと政治思想を論じ合う記憶喪失の刑事。インタラクティブ小説の歴史に輝く至高の文学的傑作。",
        "pt-BR": "Você é um detetive com amnésia que conversa com a própria gravata espalhafatosa e debate teoria política com uma caixa de correio. Uma das maiores obras da literatura interativa."
    },
    redactedText: {
        "fr": "Vous êtes un inspecteur amnésique dans la ville de ███████ qui parle à sa propre cravate criarde et débat de politique avec une boîte aux lettres. Chef-d'œuvre absolu.",
        "en": "You are an amnesiac detective in the city of ████████ talking to your own necktie and debating politics with a mailbox. Absolute masterpiece.",
        "es": "Eres un detective amnésico en la ciudad de ███████ que habla con su propia corbata chillona y debate de política con un buzón. Obra maestra absoluta.",
        "de": "Du bist ein Detektiv mit Gedächtnisverlust in der Stadt ████████, der mit seiner Krawatte spricht und politisiert. Absolutes Meisterwerk.",
        "ja": "記憶喪失の刑事が都市████████でネクタイと話し、ポストと論争する。不朽の文学的傑作。",
        "pt-BR": "Você é um detetive amnésico na cidade de ████████ que conversa com sua gravata e debate política com uma caixa de correio. Obra-prima absoluta."
    },
  },
  {
    gameId: 'return-of-the-obra-dinn',
    author: 'InsuranceClerk',
    hoursPlayed: 16.5,
    reviewDate: '10 décembre 2018',
    fullFr: "Une montre de poche magique qui fige l'instant exact de la mort, un carnet d'assurances de la Compagnie des Indes et 60 cadavres à identifier. Lucas Pope est un génie.",
    fullEn: "A magic pocket watch freezing the exact moment of death, an East India Company insurance log, and 60 corpses to identify. Lucas Pope is a genius.",
    redactedFr: "Une montre magique qui fige l'instant de la mort, un carnet d'assurances maritime et 60 marins à identifier sur le ████ ████. Lucas Pope est un génie.",
    redactedEn: "A magic watch freezing the moment of death, a maritime insurance log, and 60 crewmates to identify on the ████ ████. Lucas Pope is a genius.",
    fullText: {
        "fr": "Une montre de poche magique qui fige l'instant exact de la mort, un carnet d'assurances de la Compagnie des Indes et 60 cadavres à identifier. Lucas Pope est un génie.",
        "en": "A magic pocket watch freezing the exact moment of death, an East India Company insurance log, and 60 corpses to identify. Lucas Pope is a genius.",
        "es": "Un reloj de bolsillo mágico que congela el instante exacto de la muerte, un libro de seguros de la Compañía de las Indias y 60 cadáveres por identificar. Lucas Pope es un genio.",
        "de": "Eine magische Taschenuhr, die den Todeszeitpunkt einfriert, ein Logbuch der Ostindien-Kompanie und 60 Tote zum Identifizieren. Lucas Pope ist ein Genie.",
        "ja": "死の瞬間を正確にフリーズさせる魔法の懐中時計、東インド会社の損害保険台帳、そして身元を特定すべき60人の死者。Lucas Popeは天才だ。",
        "pt-BR": "Um relógio de bolso mágico que congela o instante exato da morte, um registro de seguros da Companhia das Índias e 60 tripulantes para identificar. Lucas Pope é um gênio."
    },
    redactedText: {
        "fr": "Une montre magique qui fige l'instant de la mort, un carnet d'assurances maritime et 60 marins à identifier sur le ████ ████. Lucas Pope est un génie.",
        "en": "A magic watch freezing the moment of death, a maritime insurance log, and 60 crewmates to identify on the ████ ████. Lucas Pope is a genius.",
        "es": "Un reloj mágico que congela el instante de la muerte, un cuaderno de seguros marítimos y 60 marineros por identificar en el ████ ████. Lucas Pope es un genio.",
        "de": "Eine magische Uhr, die den Todesmoment einfriert, und 60 Matrosen zum Identifizieren auf der ████ ████. Lucas Pope ist ein Genie.",
        "ja": "死の瞬間を止める時計と海難台帳、そして████ ████号の60人の乗組員を特定する。Lucas Popeは天才だ。",
        "pt-BR": "Um relógio mágico congelando o instante da morte e 60 marinheiros para identificar no ████ ████. Lucas Pope é um gênio."
    },
  },
  {
    gameId: 'chants-of-sennaar',
    author: 'TowerLinguist',
    hoursPlayed: 14.8,
    reviewDate: '20 octobre 2023',
    fullFr: "Déchiffrer 5 dialectes oubliés uniquement en observant les gestes des pèlerins et les panneaux de la Tour. Le travail sur la sémiotique et les énigmes est prodigieux.",
    fullEn: "Deciphering 5 forgotten dialects just by watching pilgrim gestures and Tower signs. The semiotic puzzle work is astonishing.",
    redactedFr: "Déchiffrer 5 dialectes oubliés uniquement en observant les gestes et les panneaux de la ████. Le travail sur la sémiotique est prodigieux.",
    redactedEn: "Deciphering 5 forgotten dialects just by watching gestures and signs across the █████. The semiotic puzzle work is astonishing.",
    fullText: {
        "fr": "Déchiffrer 5 dialectes oubliés uniquement en observant les gestes des pèlerins et les panneaux de la Tour. Le travail sur la sémiotique et les énigmes est prodigieux.",
        "en": "Deciphering 5 forgotten dialects just by watching pilgrim gestures and Tower signs. The semiotic puzzle work is astonishing.",
        "es": "Descifrar 5 dialectos olvidados simplemente observando los gestos de los peregrinos y los letreros de la Torre. El diseño semiótico y los puzles son prodigiosos.",
        "de": "Fünf vergessene Dialekte entschlüsseln, nur durch Gesten der Pilger und Tafeln des Turms. Die semiotischen Rätsel sind eine Wucht.",
        "ja": "巡礼者の身振りや塔の看板だけを手がかりに、5つの忘れ去られた言語を解読していく。記号論とパズルデザインの完成度は驚異的。",
        "pt-BR": "Decifrar 5 dialetos esquecidos apenas observando os gestos dos peregrinos e as placas da Torre. O trabalho semiótico e os enigmas são prodigiosos."
    },
    redactedText: {
        "fr": "Déchiffrer 5 dialectes oubliés uniquement en observant les gestes et les panneaux de la ████. Le travail sur la sémiotique est prodigieux.",
        "en": "Deciphering 5 forgotten dialects just by watching gestures and signs across the █████. The semiotic puzzle work is astonishing.",
        "es": "Descifrar 5 dialectos olvidados observando gestos y carteles por toda la ████. El trabajo de semiótica es prodigioso.",
        "de": "Fünf vergessene Sprachen entschlüsseln, nur durch Gesten und Schilder im gesamten ████. Faszinierende Semiotik.",
        "ja": "巡礼者の身振りと██の看板から5つの言語を解き明かす。記号論のパズルが素晴らしい。",
        "pt-BR": "Decifrar 5 dialetos esquecidos observando os gestos e sinais pela █████. O trabalho semiótico é incrível."
    },
  },
  {
    gameId: 'dave-the-diver',
    author: 'SushiHarpoon',
    hoursPlayed: 62.4,
    reviewDate: '14 juillet 2023',
    fullFr: "Je pensais juste harponner deux mérous le matin. Au bout de 40 heures, je gère un bar à sushis réputé, j'élève des hippocampes et j'explore une civilisation sous-marine secrète.",
    fullEn: "I just wanted to spear two groupers in the morning. 40 hours in, I manage a world-class sushi bar, breed seahorses, and uncover an ancient undersea civilization.",
    redactedFr: "Je pensais juste harponner deux poissons le matin. Au bout de 40 heures, je gère un bar à sushis réputé avec Bancho et j'explore un Trou Bleu sans fond.",
    redactedEn: "I just wanted to spear two fish in the morning. 40 hours in, I manage a world-class sushi bar with Bancho and explore a bottomless Blue Hole.",
    fullText: {
        "fr": "Je pensais juste harponner deux mérous le matin. Au bout de 40 heures, je gère un bar à sushis réputé, j'élève des hippocampes et j'explore une civilisation sous-marine secrète.",
        "en": "I just wanted to spear two groupers in the morning. 40 hours in, I manage a world-class sushi bar, breed seahorses, and uncover an ancient undersea civilization.",
        "es": "Pensaba que solo arponearía un par de meros por la mañana. A las 40 horas, gestiono un bar de sushi de lujo, crío caballitos de mar y descubro una civilización submarina.",
        "de": "Wollte morgens nur zwei Fische harpunieren. Nach 40 Stunden führe ich eine edle Sushi-Bar, züchte Seepferdchen und erforsche eine uralte Unterwasserzivilisation.",
        "ja": "朝方にハタを2匹銛で突くだけのつもりだった。40時間後、名店寿司屋を取り仕切り、タツノオトシゴを育て、海底の古代文明を探索していた。",
        "pt-BR": "Eu só queria arpoar dois peixes de manhã. Com 40 horas, gerencio um restaurante de sushi renomado, crio cavalos-marinhos e desvendo uma civilização submarina."
    },
    redactedText: {
        "fr": "Je pensais juste harponner deux poissons le matin. Au bout de 40 heures, je gère un bar à sushis réputé avec Bancho et j'explore un Trou Bleu sans fond.",
        "en": "I just wanted to spear two fish in the morning. 40 hours in, I manage a world-class sushi bar with Bancho and explore a bottomless Blue Hole.",
        "es": "Solo quería pescar dos peces de mañana. A las 40 horas, gestiono un bar de sushi con Bancho y exploro un Agujero Azul sin fondo.",
        "de": "Wollte nur zwei Fische fangen. 40 Stunden später leite ich mit Bancho eine Sushi-Bar und erkunde ein bodenloses Blue Hole.",
        "ja": "魚を2匹突くだけのはずだった。40時間後、番長と寿司屋を経営し、底なしのブルーホールを潜っていた。",
        "pt-BR": "Só queria pescar de manhã. Com 40 horas, gerencio um sushi bar com Bancho e exploro o Buraco Azul."
    },
  },
  {
    gameId: 'pizza-tower',
    author: 'PeppinoSpeedrun',
    hoursPlayed: 45.2,
    reviewDate: '18 février 2023',
    fullFr: "Ce jeu vous donne l'impression d'avoir bu 12 expressos en regardant un dessin animé des années 90 en avance rapide. Peppino Spaghetti court plus vite que Sonic.",
    fullEn: "This game feels like drinking 12 espressos while watching a 90s cartoon on fast forward. Peppino Spaghetti runs faster than Sonic.",
    redactedFr: "Ce jeu vous donne l'impression d'avoir bu 12 expressos en regardant un dessin animé des années 90 en avance rapide. ███████ court plus vite que le vent.",
    redactedEn: "This game feels like drinking 12 espressos while watching a 90s cartoon on fast forward. ███████ runs faster than the wind.",
    fullText: {
        "fr": "Ce jeu vous donne l'impression d'avoir bu 12 expressos en regardant un dessin animé des années 90 en avance rapide. Peppino Spaghetti court plus vite que Sonic.",
        "en": "This game feels like drinking 12 espressos while watching a 90s cartoon on fast forward. Peppino Spaghetti runs faster than Sonic.",
        "es": "Este juego te hace sentir como si hubieras bebido 12 expresos viendo dibujos animados de los 90 en cámara rápida. Peppino Spaghetti corre más rápido que Sonic.",
        "de": "Fühlt sich an, als hätte man 12 Espressi getrunken und 90er-Cartoons im Schnellvorlauf geschaut. Peppino Spaghetti rennt schneller als Sonic.",
        "ja": "エスプレッソを12杯一気飲みして90年代カートゥーンを倍速で見ているような感覚。Peppino Spaghettiはソニックより速い。",
        "pt-BR": "Esse jogo parece tomar 12 expressos assistindo a um desenho dos anos 90 no modo acelerado. Peppino Spaghetti corre mais rápido que o Sonic."
    },
    redactedText: {
        "fr": "Ce jeu vous donne l'impression d'avoir bu 12 expressos en regardant un dessin animé des années 90 en avance rapide. ███████ court plus vite que le vent.",
        "en": "This game feels like drinking 12 espressos while watching a 90s cartoon on fast forward. ███████ runs faster than the wind.",
        "es": "Este juego te hace sentir como si hubieras bebido 12 expresos viendo dibujos animados de los 90 en cámara rápida. ███████ corre más rápido que el viento.",
        "de": "Fühlt sich an wie 12 Espressi bei 90er-Jahre-Cartoons auf Vorlauf. ███████ rennt schneller als der Wind.",
        "ja": "エスプレッソ12杯を飲んで90年代アニメを倍速再生した疾走感。███████の脚は風よりも速い。",
        "pt-BR": "Esse jogo parece tomar 12 expressos assistindo desenho dos anos 90 acelerado. ███████ corre mais rápido que o vento."
    },
  },
  {
    gameId: 'stardew-valley',
    author: 'JunimoWhisperer',
    hoursPlayed: 410.2,
    reviewDate: '23 août 2021',
    fullFr: "Je voulais juste planter 6 panais avant d'aller me coucher. Il est 4 heures du matin, j'ai une brasserie artisanale, 14 vaches et je suis marié avec Sebastian.",
    fullEn: "I just wanted to plant 6 parsnips before bed. It's 4 AM, I own an artisan brewery, 14 cows, and I'm married to Sebastian.",
    redactedFr: "Je voulais juste planter 6 panais avant d'aller me coucher. Il est 4 heures du matin, j'ai une brasserie artisanale, 14 vaches et les ██████ m'adorent.",
    redactedEn: "I just wanted to plant 6 parsnips before bed. It's 4 AM, I own an artisan brewery, 14 cows, and the ███████ adore me.",
    fullText: {
        "fr": "Je voulais juste planter 6 panais avant d'aller me coucher. Il est 4 heures du matin, j'ai une brasserie artisanale, 14 vaches et je suis marié avec Sebastian.",
        "en": "I just wanted to plant 6 parsnips before bed. It's 4 AM, I own an artisan brewery, 14 cows, and I'm married to Sebastian.",
        "es": "Solo quería plantar 6 chirivías antes de ir a dormir. Son las 4 de la mañana, tengo una cervecería artesanal, 14 vacas y me casé con Sebastian.",
        "de": "Wollte vor dem Schlafengehen nur 6 Pastinaken pflanzen. Es ist 4 Uhr morgens, ich besitze eine Brauerei, 14 Kühe und bin mit Sebastian verheiratet.",
        "ja": "寝る前にパースニップを6株植えるだけのはずだった。気づけば午前4時、クラフト醸造所を持ち、牛を14頭飼い、セバスチャンと結婚していた。",
        "pt-BR": "Eu só queria plantar 6 pastinacas antes de dormir. São 4 da manhã, tenho uma cervejaria artesanal, 14 vacas e estou casado com o Sebastian."
    },
    redactedText: {
        "fr": "Je voulais juste planter 6 panais avant d'aller me coucher. Il est 4 heures du matin, j'ai une brasserie artisanale, 14 vaches et les ██████ m'adorent.",
        "en": "I just wanted to plant 6 parsnips before bed. It's 4 AM, I own an artisan brewery, 14 cows, and the ███████ adore me.",
        "es": "Solo quería plantar 6 chirivías antes de dormir. Son las 4 de la mañana, tengo una cervecería artesanal, 14 vacas y los ██████ me adoran.",
        "de": "Wollte nur 6 Pastinaken pflanzen. Es ist 4 Uhr morgens, ich habe eine Brauerei, 14 Kühe und die ███████ lieben mich.",
        "ja": "寝る前に6株植えるだけのはずが午前4時。醸造所を持ち、14頭の牛を飼い、森の小人██████に好かれている。",
        "pt-BR": "Só queria plantar 6 sementes antes de dormir. São 4 da manhã, tenho uma cervejaria, 14 vacas e os ██████ me amam."
    },
  },
  {
    gameId: 'undertale',
    author: 'SpaghettiPapyrus',
    hoursPlayed: 56.7,
    reviewDate: '15 novembre 2016',
    fullFr: "Vous pouvez terminer tout le jeu sans tuer un seul monstre, simplement en parlant et en esquivant leurs attaques. Sans et Papyrus resteront gravés dans ma mémoire pour toujours.",
    fullEn: "You can finish the entire game without killing a single monster, just by talking and dodging attacks. Sans and Papyrus will stay in my heart forever.",
    redactedFr: "Vous pouvez terminer tout le jeu sans tuer un seul monstre, simplement en parlant. Cela vous remplit de █████████████.",
    redactedEn: "You can finish the entire game without killing a single monster, just by talking. It fills you with ██████████████.",
    fullText: {
        "fr": "Vous pouvez terminer tout le jeu sans tuer un seul monstre, simplement en parlant et en esquivant leurs attaques. Sans et Papyrus resteront gravés dans ma mémoire pour toujours.",
        "en": "You can finish the entire game without killing a single monster, just by talking and dodging attacks. Sans and Papyrus will stay in my heart forever.",
        "es": "Puedes pasarte todo el juego sin matar a un solo monstruo, solo hablando y esquivando ataques. Sans y Papyrus se quedarán en mi memoria para siempre.",
        "de": "Man kann das ganze Spiel beenden, ohne ein einziges Monster zu töten – nur durch Reden und Ausweichen. Sans und Papyrus bleiben für immer im Herzen.",
        "ja": "誰一人としてモンスターを倒すことなく、ただ会話と弾幕回避だけでクリアできる。サンズとパピルスは永遠に私の心に残り続ける。",
        "pt-BR": "Você pode zerar o jogo inteiro sem matar um único monstro, apenas conversando e desviando de ataques. Sans e Papyrus ficarão na minha memória para sempre."
    },
    redactedText: {
        "fr": "Vous pouvez terminer tout le jeu sans tuer un seul monstre, simplement en parlant. Cela vous remplit de █████████████.",
        "en": "You can finish the entire game without killing a single monster, just by talking. It fills you with ██████████████.",
        "es": "Puedes pasarte todo el juego sin matar a un solo monstruo, solo hablando. Te llena de ██████████████.",
        "de": "Das ganze Spiel ohne einen einzigen Kill beenden, nur durch Reden. Es erfüllt dich mit ██████████████.",
        "ja": "モンスターを誰一人殺さずに会話だけで進める。それはあなたを████████で満たす。",
        "pt-BR": "Você pode zerar sem matar nenhum monstro, apenas conversando. Isso te enche de █████████████."
    },
  },
  {
    gameId: 'inside',
    author: 'DystopiaEscape',
    hoursPlayed: 9.3,
    reviewDate: '5 juillet 2016',
    fullFr: "Zéro tutoriel, pas un seul mot prononcé, mais une atmosphère oppressante inégalée. La dernière demi-heure est la chose la plus folle et troublante que j'aie jouée.",
    fullEn: "Zero tutorial, not a single spoken word, yet an unmatched oppressive atmosphere. The final half hour is the most bizarre, disturbing thing I've played.",
    redactedFr: "Zéro tutoriel, pas un seul mot prononcé par le petit garçon au pull rouge, mais une atmosphère oppressante. La fin vous marquera à vie.",
    redactedEn: "Zero tutorial, not a single spoken word by the boy in the red sweater, yet an unmatched oppressive atmosphere. The climax will haunt you.",
    fullText: {
        "fr": "Zéro tutoriel, pas un seul mot prononcé, mais une atmosphère oppressante inégalée. La dernière demi-heure est la chose la plus folle et troublante que j'aie jouée.",
        "en": "Zero tutorial, not a single spoken word, yet an unmatched oppressive atmosphere. The final half hour is the most bizarre, disturbing thing I've played.",
        "es": "Cero tutoriales, ni una palabra dicha, pero una atmósfera opresiva inigualable. La última media hora es lo más bizarro e inquietante que he jugado.",
        "de": "Kein Tutorial, kein einziges gesprochenes Wort, aber eine unvergleichliche beklemmende Atmosphäre. Die letzte halbe Stunde ist das Verrückteste überhaupt.",
        "ja": "チュートリアルなし、言葉も一切発せられないのに、息を呑む圧倒的な不穏な空気感。ラスト30分はこれまでプレイしたどの作品よりも狂気的で衝撃的だった。",
        "pt-BR": "Zero tutoriais, nenhuma palavra falada, mas uma atmosfera opressiva sem igual. A última meia hora é a coisa mais bizarra e perturbadora que já joguei."
    },
    redactedText: {
        "fr": "Zéro tutoriel, pas un seul mot prononcé par le petit garçon au pull rouge, mais une atmosphère oppressante. La fin vous marquera à vie.",
        "en": "Zero tutorial, not a single spoken word by the boy in the red sweater, yet an unmatched oppressive atmosphere. The climax will haunt you.",
        "es": "Cero tutoriales, ni una sola palabra dicha por el chico del suéter rojo, pero una atmósfera opresiva. El final te marcará para siempre.",
        "de": "Kein Tutorial, kein Wort vom Jungen im roten Pullover, aber beklemmende Atmosphäre. Das Finale vergisst man nie.",
        "ja": "チュートリアルなし、赤い服の少年は一言も話さないが息苦しいほどの空気感。結末は一生忘れられない。",
        "pt-BR": "Zero tutoriais, nenhuma palavra dita pelo garoto de suéter vermelho, mas uma atmosfera opressiva. O final é inesquecível."
    },
  },
  {
    gameId: 'gris',
    author: 'WaterColorHeart',
    hoursPlayed: 8.5,
    reviewDate: '14 décembre 2018',
    fullFr: "Une lettre d'amour aquarellée sur le deuil et la reconstruction personnelle. Les compositions de Berlinist combinées aux animations dessinées à la main sont sublimes.",
    fullEn: "A watercolor love letter on grief and rebuilding oneself. Berlinist's soundtrack paired with handcrafted art is sublime.",
    redactedFr: "Une lettre d'amour aquarellée sur le deuil et le retour des couleurs dans le monde. La robe magique et la musique sont sublimes.",
    redactedEn: "A watercolor love letter on grief and bringing colors back into the world. The magical dress and music are sublime.",
    fullText: {
        "fr": "Une lettre d'amour aquarellée sur le deuil et la reconstruction personnelle. Les compositions de Berlinist combinées aux animations dessinées à la main sont sublimes.",
        "en": "A watercolor love letter on grief and rebuilding oneself. Berlinist's soundtrack paired with handcrafted art is sublime.",
        "es": "Una carta de amor en acuarela sobre el duelo y la reconstrucción personal. Las composiciones de Berlinist unidas a la animación artesanal son sublimes.",
        "de": "Ein Aquarell-Liebesbrief über Trauer und Selbstfindung. Berlinists Kompositionen gepaart mit handgezeichneter Kunst sind schlicht erhaben.",
        "ja": "喪失の悲嘆と自己の再生を描いた水彩画のラブレター。Berlinistによる旋律と繊細な手描きアニメーションの調和が息を呑むほど美しい。",
        "pt-BR": "Uma carta de amor em aquarela sobre o luto e a reconstrução pessoal. As composições de Berlinist combinadas com a arte feita à mão são sublimes."
    },
    redactedText: {
        "fr": "Une lettre d'amour aquarellée sur le deuil et le retour des couleurs dans le monde. La robe magique et la musique sont sublimes.",
        "en": "A watercolor love letter on grief and bringing colors back into the world. The magical dress and music are sublime.",
        "es": "Una carta de amor en acuarela sobre el duelo y el regreso del color al mundo. El vestido mágico y la música son sublimes.",
        "de": "Ein Aquarell-Liebesbrief über Trauer und die Rückkehr der Farben in die Welt. Das magische Kleid und die Musik sind erhaben.",
        "ja": "水彩で描かれる喪失と世界に色彩が蘇る物語。魔法のドレスと音楽が感動的。",
        "pt-BR": "Uma carta de amor em aquarela sobre o luto e o retorno das cores ao mundo. O vestido mágico e a música são sublimes."
    },
  },
  {
    gameId: 'furi',
    author: 'ParryMaster',
    hoursPlayed: 32.4,
    reviewDate: '8 juillet 2017',
    fullFr: "Uniquement des combats de boss intenses, mêlant duels au sabre et bullet hell millimétré. La bande-son avec Carpenter Brut et The Toxic Avenger vous transporte.",
    fullEn: "Strictly intense boss fights blending sword duels and pixel-perfect bullet hell. The soundtrack featuring Carpenter Brut and The Toxic Avenger carries you.",
    redactedFr: "Uniquement des combats de boss intenses, mêlant duels au sabre et bullet hell. Le gardien au masque de lapin vous attend au tournant.",
    redactedEn: "Strictly intense boss fights blending sword duels and bullet hell. The rabbit-masked jailer awaits at every turn.",
    fullText: {
        "fr": "Uniquement des combats de boss intenses, mêlant duels au sabre et bullet hell millimétré. La bande-son avec Carpenter Brut et The Toxic Avenger vous transporte.",
        "en": "Strictly intense boss fights blending sword duels and pixel-perfect bullet hell. The soundtrack featuring Carpenter Brut and The Toxic Avenger carries you.",
        "es": "Únicamente combates intensos contra jefes, combinando duelos de katanas y bullet hell milimétrico. La banda sonora con Carpenter Brut y The Toxic Avenger te atrapa.",
        "de": "Ausschließlich intensive Bosskämpfe zwischen Schwertduellen und millimetergenauem Bullet Hell. Der Soundtrack mit Carpenter Brut und The Toxic Avenger reißt mit.",
        "ja": "刀による白兵戦と精密無比な弾幕（バレットヘル）が融合した、超高密度のボス戦のみで構成。Carpenter BrutやThe Toxic Avengerが彩るBGMが魂を揺さぶる。",
        "pt-BR": "Apenas lutas intensas contra chefes, mesclando duelos de espada e bullet hell milimétrico. A trilha sonora com Carpenter Brut e The Toxic Avenger é arrebatadora."
    },
    redactedText: {
        "fr": "Uniquement des combats de boss intenses, mêlant duels au sabre et bullet hell. Le gardien au masque de lapin vous attend au tournant.",
        "en": "Strictly intense boss fights blending sword duels and bullet hell. The rabbit-masked jailer awaits at every turn.",
        "es": "Únicamente combates intensos contra jefes, combinando duelos de espada y bullet hell. El guardián con máscara de conejo te espera en cada esquina.",
        "de": "Ausschließlich Bosskämpfe mit Schwert und Bullet Hell. Der Wärter mit der Hasenmaske wartet an jeder Ecke.",
        "ja": "ボス戦のみが連続する電光石火のデュエルと弾幕。ウサギの仮面を被った看守が待ち受ける。",
        "pt-BR": "Apenas combates intensos contra chefes mesclando espadas e bullet hell. O carcereiro de máscara de coelho te aguarda."
    },
  },
  {
    gameId: 'terraria',
    author: 'UnderworldMiner',
    hoursPlayed: 480.5,
    reviewDate: '15 juillet 2021',
    fullFr: "J'ai creusé tout droit vers le bas, trouvé les Enfers, et je me suis fait découper par un œil géant avec des dents. 10/10 meilleur jeu 2D bac à sable.",
    fullEn: "Dug straight down, found the Underworld, and got sliced in half by a giant flying eye with teeth. 10/10 best 2D sandbox.",
    redactedFr: "J'ai creusé tout droit vers le bas, trouvé les ██████, et je me suis fait découper par un œil géant avec des dents. 10/10 meilleur jeu 2D.",
    redactedEn: "Dug straight down, found the ██████████, and got sliced in half by a giant flying eye with teeth. 10/10 best 2D game.",
    fullText: {
      fr: "J'ai creusé tout droit vers le bas, trouvé les Enfers, et je me suis fait découper par un œil géant avec des dents. 10/10 meilleur jeu 2D bac à sable.",
      en: "Dug straight down, found the Underworld, and got sliced in half by a giant flying eye with teeth. 10/10 best 2D sandbox.",
      es: "Dug straight down, found the Underworld, and got sliced in half by a giant flying eye with teeth. 10/10 best 2D sandbox.",
      de: "Dug straight down, found the Underworld, and got sliced in half by a giant flying eye with teeth. 10/10 best 2D sandbox.",
      ja: "Dug straight down, found the Underworld, and got sliced in half by a giant flying eye with teeth. 10/10 best 2D sandbox.",
      'pt-BR': "Dug straight down, found the Underworld, and got sliced in half by a giant flying eye with teeth. 10/10 best 2D sandbox."
    },
    redactedText: {
      fr: "J'ai creusé tout droit vers le bas, trouvé les ██████, et je me suis fait découper par un œil géant avec des dents. 10/10 meilleur jeu 2D.",
      en: "Dug straight down, found the ██████████, and got sliced in half by a giant flying eye with teeth. 10/10 best 2D game.",
      es: "Dug straight down, found the ██████████, and got sliced in half by a giant flying eye with teeth. 10/10 best 2D game.",
      de: "Dug straight down, found the ██████████, and got sliced in half by a giant flying eye with teeth. 10/10 best 2D game.",
      ja: "Dug straight down, found the ██████████, and got sliced in half by a giant flying eye with teeth. 10/10 best 2D game.",
      'pt-BR': "Dug straight down, found the ██████████, and got sliced in half by a giant flying eye with teeth. 10/10 best 2D game."
    }
  },
  {
    gameId: 'the-binding-of-isaac-rebirth',
    author: 'TearsOfGuppy',
    hoursPlayed: 620.2,
    reviewDate: '3 novembre 2018',
    fullFr: "Ma mère a entendu une voix divine et a voulu me sacrifier. J'ai sauté dans la cave et j'ai vaincu Satan en pleurant sur des cacas.",
    fullEn: "My mother heard a divine voice and tried to sacrifice me. I jumped into the basement and defeated Satan by crying on poops.",
    redactedFr: "Ma mère a entendu une voix divine et a voulu me sacrifier. J'ai sauté dans la ████ et j'ai vaincu Satan en pleurant sur des monstres.",
    redactedEn: "My mother heard a divine voice and tried to sacrifice me. I jumped into the ████████ and defeated Satan by crying on monsters.",
    fullText: {
      fr: "Ma mère a entendu une voix divine et a voulu me sacrifier. J'ai sauté dans la cave et j'ai vaincu Satan en pleurant sur des cacas.",
      en: "My mother heard a divine voice and tried to sacrifice me. I jumped into the basement and defeated Satan by crying on poops.",
      es: "My mother heard a divine voice and tried to sacrifice me. I jumped into the basement and defeated Satan by crying on poops.",
      de: "My mother heard a divine voice and tried to sacrifice me. I jumped into the basement and defeated Satan by crying on poops.",
      ja: "My mother heard a divine voice and tried to sacrifice me. I jumped into the basement and defeated Satan by crying on poops.",
      'pt-BR': "My mother heard a divine voice and tried to sacrifice me. I jumped into the basement and defeated Satan by crying on poops."
    },
    redactedText: {
      fr: "Ma mère a entendu une voix divine et a voulu me sacrifier. J'ai sauté dans la ████ et j'ai vaincu Satan en pleurant sur des monstres.",
      en: "My mother heard a divine voice and tried to sacrifice me. I jumped into the ████████ and defeated Satan by crying on monsters.",
      es: "My mother heard a divine voice and tried to sacrifice me. I jumped into the ████████ and defeated Satan by crying on monsters.",
      de: "My mother heard a divine voice and tried to sacrifice me. I jumped into the ████████ and defeated Satan by crying on monsters.",
      ja: "My mother heard a divine voice and tried to sacrifice me. I jumped into the ████████ and defeated Satan by crying on monsters.",
      'pt-BR': "My mother heard a divine voice and tried to sacrifice me. I jumped into the ████████ and defeated Satan by crying on monsters."
    }
  },
  {
    gameId: 'cuphead',
    author: 'JazzParryMaster',
    hoursPlayed: 54,
    reviewDate: '9 octobre 2017',
    fullFr: "J'ai vendu mon âme au Diable dans un casino des années 30. Je suis mort 42 fois sur une grenouille chanteuse de jazz et une carotte géante.",
    fullEn: "Gambled my soul away to the Devil in a 1930s casino. Died 42 times to a jazz-singing frog and a giant psychic carrot.",
    redactedFr: "J'ai parié mon âme contre le Diable dans un casino des années 30. Je suis mort 42 fois sur une grenouille chanteuse de jazz et une carotte géante.",
    redactedEn: "Gambled my soul away in a 1930s casino. Died 42 times to a jazz-singing frog and a giant psychic carrot.",
    fullText: {
      fr: "J'ai vendu mon âme au Diable dans un casino des années 30. Je suis mort 42 fois sur une grenouille chanteuse de jazz et une carotte géante.",
      en: "Gambled my soul away to the Devil in a 1930s casino. Died 42 times to a jazz-singing frog and a giant psychic carrot.",
      es: "Gambled my soul away to the Devil in a 1930s casino. Died 42 times to a jazz-singing frog and a giant psychic carrot.",
      de: "Gambled my soul away to the Devil in a 1930s casino. Died 42 times to a jazz-singing frog and a giant psychic carrot.",
      ja: "Gambled my soul away to the Devil in a 1930s casino. Died 42 times to a jazz-singing frog and a giant psychic carrot.",
      'pt-BR': "Gambled my soul away to the Devil in a 1930s casino. Died 42 times to a jazz-singing frog and a giant psychic carrot."
    },
    redactedText: {
      fr: "J'ai parié mon âme contre le Diable dans un casino des années 30. Je suis mort 42 fois sur une grenouille chanteuse de jazz et une carotte géante.",
      en: "Gambled my soul away in a 1930s casino. Died 42 times to a jazz-singing frog and a giant psychic carrot.",
      es: "Gambled my soul away in a 1930s casino. Died 42 times to a jazz-singing frog and a giant psychic carrot.",
      de: "Gambled my soul away in a 1930s casino. Died 42 times to a jazz-singing frog and a giant psychic carrot.",
      ja: "Gambled my soul away in a 1930s casino. Died 42 times to a jazz-singing frog and a giant psychic carrot.",
      'pt-BR': "Gambled my soul away in a 1930s casino. Died 42 times to a jazz-singing frog and a giant psychic carrot."
    }
  },
  {
    gameId: 'vampire-survivors',
    author: 'GarlicEnjoyer',
    hoursPlayed: 112.3,
    reviewDate: '18 mars 2022',
    fullFr: "J'ai acheté un jeu à 3 euros où on contrôle uniquement les flèches directionnelles. Il est 4h du matin et l'ail est devenu ma religion.",
    fullEn: "Bought a $3 game where you only walk around. It's now 4 AM and garlic has become my personal religion.",
    redactedFr: "J'ai acheté un jeu à 3 euros où on contrôle uniquement les déplacements. Il est 4h du matin et l'███ est devenu ma religion.",
    redactedEn: "Bought a $3 game where you only walk around. It's now 4 AM and ██████ has become my personal religion.",
    fullText: {
      fr: "J'ai acheté un jeu à 3 euros où on contrôle uniquement les flèches directionnelles. Il est 4h du matin et l'ail est devenu ma religion.",
      en: "Bought a $3 game where you only walk around. It's now 4 AM and garlic has become my personal religion.",
      es: "Bought a $3 game where you only walk around. It's now 4 AM and garlic has become my personal religion.",
      de: "Bought a $3 game where you only walk around. It's now 4 AM and garlic has become my personal religion.",
      ja: "Bought a $3 game where you only walk around. It's now 4 AM and garlic has become my personal religion.",
      'pt-BR': "Bought a $3 game where you only walk around. It's now 4 AM and garlic has become my personal religion."
    },
    redactedText: {
      fr: "J'ai acheté un jeu à 3 euros où on contrôle uniquement les déplacements. Il est 4h du matin et l'███ est devenu ma religion.",
      en: "Bought a $3 game where you only walk around. It's now 4 AM and ██████ has become my personal religion.",
      es: "Bought a $3 game where you only walk around. It's now 4 AM and ██████ has become my personal religion.",
      de: "Bought a $3 game where you only walk around. It's now 4 AM and ██████ has become my personal religion.",
      ja: "Bought a $3 game where you only walk around. It's now 4 AM and ██████ has become my personal religion.",
      'pt-BR': "Bought a $3 game where you only walk around. It's now 4 AM and ██████ has become my personal religion."
    }
  },
  {
    gameId: 'papers-please',
    author: 'InspectorEast',
    hoursPlayed: 38.7,
    reviewDate: '22 août 2014',
    fullFr: "Gloire à l'Arstotzka. J'ai recalé une grand-mère parce que son passeport était périmé d'un jour. Mon fils a froid mais la frontière est sûre.",
    fullEn: "Glory to Arstotzka. Denied entry to a grandma because her passport expired yesterday. My son is freezing but the border is safe.",
    redactedFr: "Gloire à l'████████. J'ai recalé une grand-mère parce que son passeport était périmé d'un jour. Mon fils a froid mais le poste frontière est sûr.",
    redactedEn: "Glory to █████████. Denied entry to a grandma because her passport expired yesterday. My son is freezing but the checkpoint is safe.",
    fullText: {
      fr: "Gloire à l'Arstotzka. J'ai recalé une grand-mère parce que son passeport était périmé d'un jour. Mon fils a froid mais la frontière est sûre.",
      en: "Glory to Arstotzka. Denied entry to a grandma because her passport expired yesterday. My son is freezing but the border is safe.",
      es: "Glory to Arstotzka. Denied entry to a grandma because her passport expired yesterday. My son is freezing but the border is safe.",
      de: "Glory to Arstotzka. Denied entry to a grandma because her passport expired yesterday. My son is freezing but the border is safe.",
      ja: "Glory to Arstotzka. Denied entry to a grandma because her passport expired yesterday. My son is freezing but the border is safe.",
      'pt-BR': "Glory to Arstotzka. Denied entry to a grandma because her passport expired yesterday. My son is freezing but the border is safe."
    },
    redactedText: {
      fr: "Gloire à l'████████. J'ai recalé une grand-mère parce que son passeport était périmé d'un jour. Mon fils a froid mais le poste frontière est sûr.",
      en: "Glory to █████████. Denied entry to a grandma because her passport expired yesterday. My son is freezing but the checkpoint is safe.",
      es: "Glory to █████████. Denied entry to a grandma because her passport expired yesterday. My son is freezing but the checkpoint is safe.",
      de: "Glory to █████████. Denied entry to a grandma because her passport expired yesterday. My son is freezing but the checkpoint is safe.",
      ja: "Glory to █████████. Denied entry to a grandma because her passport expired yesterday. My son is freezing but the checkpoint is safe.",
      'pt-BR': "Glory to █████████. Denied entry to a grandma because her passport expired yesterday. My son is freezing but the checkpoint is safe."
    }
  },
  {
    gameId: 'inscryption',
    author: 'CabinCardist',
    hoursPlayed: 45.9,
    reviewDate: '28 octobre 2021',
    fullFr: "Une simple partie de cartes dans une cabane sombre avec un vieil homme aux yeux luisants. Puis l'hermine s'est mise à me parler.",
    fullEn: "Just a card game in a dark cabin with a glowing-eyed old man. Then the stoat started talking to me.",
    redactedFr: "Une simple partie de cartes dans une cabane sombre avec un vieil homme aux yeux luisants. Puis l'███████ s'est mise à me parler.",
    redactedEn: "Just a card game in a dark cabin with a glowing-eyed old man. Then the █████ started talking to me.",
    fullText: {
      fr: "Une simple partie de cartes dans une cabane sombre avec un vieil homme aux yeux luisants. Puis l'hermine s'est mise à me parler.",
      en: "Just a card game in a dark cabin with a glowing-eyed old man. Then the stoat started talking to me.",
      es: "Just a card game in a dark cabin with a glowing-eyed old man. Then the stoat started talking to me.",
      de: "Just a card game in a dark cabin with a glowing-eyed old man. Then the stoat started talking to me.",
      ja: "Just a card game in a dark cabin with a glowing-eyed old man. Then the stoat started talking to me.",
      'pt-BR': "Just a card game in a dark cabin with a glowing-eyed old man. Then the stoat started talking to me."
    },
    redactedText: {
      fr: "Une simple partie de cartes dans une cabane sombre avec un vieil homme aux yeux luisants. Puis l'███████ s'est mise à me parler.",
      en: "Just a card game in a dark cabin with a glowing-eyed old man. Then the █████ started talking to me.",
      es: "Just a card game in a dark cabin with a glowing-eyed old man. Then the █████ started talking to me.",
      de: "Just a card game in a dark cabin with a glowing-eyed old man. Then the █████ started talking to me.",
      ja: "Just a card game in a dark cabin with a glowing-eyed old man. Then the █████ started talking to me.",
      'pt-BR': "Just a card game in a dark cabin with a glowing-eyed old man. Then the █████ started talking to me."
    }
  },
  {
    gameId: 'cult-of-the-lamb',
    author: 'WoolyProphet',
    hoursPlayed: 56.4,
    reviewDate: '19 août 2022',
    fullFr: "J'ai nourri mes adeptes avec des bols d'excréments, épousé un hérisson et sacrifié un vieux disciple pour organiser une soirée disco.",
    fullEn: "Fed my followers poop bowls, married a hedgehog, and sacrificed a dissenting elder to host a cozy disco party.",
    redactedFr: "J'ai nourri mes adeptes avec des bols douteux, épousé un hérisson et sacrifié un vieux disciple pour organiser une fête religieuse.",
    redactedEn: "Fed my followers questionable bowls, married a hedgehog, and sacrificed an elder to host a holy ritual.",
    fullText: {
      fr: "J'ai nourri mes adeptes avec des bols d'excréments, épousé un hérisson et sacrifié un vieux disciple pour organiser une soirée disco.",
      en: "Fed my followers poop bowls, married a hedgehog, and sacrificed a dissenting elder to host a cozy disco party.",
      es: "Fed my followers poop bowls, married a hedgehog, and sacrificed a dissenting elder to host a cozy disco party.",
      de: "Fed my followers poop bowls, married a hedgehog, and sacrificed a dissenting elder to host a cozy disco party.",
      ja: "Fed my followers poop bowls, married a hedgehog, and sacrificed a dissenting elder to host a cozy disco party.",
      'pt-BR': "Fed my followers poop bowls, married a hedgehog, and sacrificed a dissenting elder to host a cozy disco party."
    },
    redactedText: {
      fr: "J'ai nourri mes adeptes avec des bols douteux, épousé un hérisson et sacrifié un vieux disciple pour organiser une fête religieuse.",
      en: "Fed my followers questionable bowls, married a hedgehog, and sacrificed an elder to host a holy ritual.",
      es: "Fed my followers questionable bowls, married a hedgehog, and sacrificed an elder to host a holy ritual.",
      de: "Fed my followers questionable bowls, married a hedgehog, and sacrificed an elder to host a holy ritual.",
      ja: "Fed my followers questionable bowls, married a hedgehog, and sacrificed an elder to host a holy ritual.",
      'pt-BR': "Fed my followers questionable bowls, married a hedgehog, and sacrificed an elder to host a holy ritual."
    }
  },
  {
    gameId: 'untitled-goose-game',
    author: 'HonkMenace',
    hoursPlayed: 14.2,
    reviewDate: '29 septembre 2019',
    fullFr: "C'est un beau matin dans un charmant village anglais, et vous êtes une oie insupportable. Coin.",
    fullEn: "It is a lovely morning in the village, and you are a horrible goose. Honk.",
    redactedFr: "C'est un beau matin dans un charmant village anglais, et vous êtes un animal à plumes insupportable. Coin.",
    redactedEn: "It is a lovely morning in the village, and you are a horrible winged creature. Honk.",
    fullText: {
      fr: "C'est un beau matin dans un charmant village anglais, et vous êtes une oie insupportable. Coin.",
      en: "It is a lovely morning in the village, and you are a horrible goose. Honk.",
      es: "It is a lovely morning in the village, and you are a horrible goose. Honk.",
      de: "It is a lovely morning in the village, and you are a horrible goose. Honk.",
      ja: "It is a lovely morning in the village, and you are a horrible goose. Honk.",
      'pt-BR': "It is a lovely morning in the village, and you are a horrible goose. Honk."
    },
    redactedText: {
      fr: "C'est un beau matin dans un charmant village anglais, et vous êtes un animal à plumes insupportable. Coin.",
      en: "It is a lovely morning in the village, and you are a horrible winged creature. Honk.",
      es: "It is a lovely morning in the village, and you are a horrible winged creature. Honk.",
      de: "It is a lovely morning in the village, and you are a horrible winged creature. Honk.",
      ja: "It is a lovely morning in the village, and you are a horrible winged creature. Honk.",
      'pt-BR': "It is a lovely morning in the village, and you are a horrible winged creature. Honk."
    }
  },
  {
    gameId: 'hotline-miami',
    author: 'RoosterMask_89',
    hoursPlayed: 62.8,
    reviewDate: '5 novembre 2013',
    fullFr: "Aimez-vous faire du mal aux autres ? Un masque de coq sur la tête, de la synthwave à fond dans les oreilles, et 50 morts en 2 minutes.",
    fullEn: "Do you like hurting other people? A rooster mask on, blasting synthwave in your ears, and 50 deaths in under 2 minutes.",
    redactedFr: "Aimez-vous faire du mal aux autres ? Un masque de ████ sur la tête, de la synthwave à fond, et 50 morts en 2 minutes.",
    redactedEn: "Do you like hurting other people? A ███████ mask on, blasting synthwave, and 50 deaths in under 2 minutes.",
    fullText: {
      fr: "Aimez-vous faire du mal aux autres ? Un masque de coq sur la tête, de la synthwave à fond dans les oreilles, et 50 morts en 2 minutes.",
      en: "Do you like hurting other people? A rooster mask on, blasting synthwave in your ears, and 50 deaths in under 2 minutes.",
      es: "Do you like hurting other people? A rooster mask on, blasting synthwave in your ears, and 50 deaths in under 2 minutes.",
      de: "Do you like hurting other people? A rooster mask on, blasting synthwave in your ears, and 50 deaths in under 2 minutes.",
      ja: "Do you like hurting other people? A rooster mask on, blasting synthwave in your ears, and 50 deaths in under 2 minutes.",
      'pt-BR': "Do you like hurting other people? A rooster mask on, blasting synthwave in your ears, and 50 deaths in under 2 minutes."
    },
    redactedText: {
      fr: "Aimez-vous faire du mal aux autres ? Un masque de ████ sur la tête, de la synthwave à fond, et 50 morts en 2 minutes.",
      en: "Do you like hurting other people? A ███████ mask on, blasting synthwave, and 50 deaths in under 2 minutes.",
      es: "Do you like hurting other people? A ███████ mask on, blasting synthwave, and 50 deaths in under 2 minutes.",
      de: "Do you like hurting other people? A ███████ mask on, blasting synthwave, and 50 deaths in under 2 minutes.",
      ja: "Do you like hurting other people? A ███████ mask on, blasting synthwave, and 50 deaths in under 2 minutes.",
      'pt-BR': "Do you like hurting other people? A ███████ mask on, blasting synthwave, and 50 deaths in under 2 minutes."
    }
  },
  {
    gameId: 'firewatch',
    author: 'TowerTwoWatcher',
    hoursPlayed: 18.5,
    reviewDate: '14 février 2016',
    fullFr: "Un homme brisé s'isole au sommet d'une tour dans la forêt du Wyoming avec un talkie-walkie. Une histoire humaine inoubliable.",
    fullEn: "A broken man takes a fire lookout job in the Wyoming wilderness with just a handheld radio. An unforgettable human story.",
    redactedFr: "Un homme brisé s'isole au sommet d'une tour de guet dans la forêt avec un talkie-walkie. Une histoire humaine inoubliable.",
    redactedEn: "A broken man takes a lookout job in the wilderness with just a handheld radio. An unforgettable human story.",
    fullText: {
      fr: "Un homme brisé s'isole au sommet d'une tour dans la forêt du Wyoming avec un talkie-walkie. Une histoire humaine inoubliable.",
      en: "A broken man takes a fire lookout job in the Wyoming wilderness with just a handheld radio. An unforgettable human story.",
      es: "A broken man takes a fire lookout job in the Wyoming wilderness with just a handheld radio. An unforgettable human story.",
      de: "A broken man takes a fire lookout job in the Wyoming wilderness with just a handheld radio. An unforgettable human story.",
      ja: "A broken man takes a fire lookout job in the Wyoming wilderness with just a handheld radio. An unforgettable human story.",
      'pt-BR': "A broken man takes a fire lookout job in the Wyoming wilderness with just a handheld radio. An unforgettable human story."
    },
    redactedText: {
      fr: "Un homme brisé s'isole au sommet d'une tour de guet dans la forêt avec un talkie-walkie. Une histoire humaine inoubliable.",
      en: "A broken man takes a lookout job in the wilderness with just a handheld radio. An unforgettable human story.",
      es: "A broken man takes a lookout job in the wilderness with just a handheld radio. An unforgettable human story.",
      de: "A broken man takes a lookout job in the wilderness with just a handheld radio. An unforgettable human story.",
      ja: "A broken man takes a lookout job in the wilderness with just a handheld radio. An unforgettable human story.",
      'pt-BR': "A broken man takes a lookout job in the wilderness with just a handheld radio. An unforgettable human story."
    }
  },
  {
    gameId: 'what-remains-of-edith-finch',
    author: 'HouseChronicles',
    hoursPlayed: 9.3,
    reviewDate: '2 mai 2017',
    fullFr: "La malédiction d'une famille racontée à travers une succession de récits magiques : j'ai incarné un chat, un requin et un coupeur de poisson.",
    fullEn: "A cursed family history told through surreal vignettes: I played as a cat, a shark, and a fish-cannery worker dreaming of royalty.",
    redactedFr: "La malédiction d'une famille racontée à travers des récits poétiques dans une immense maison isolée sur une falaise.",
    redactedEn: "A cursed family history told through poetic vignettes inside an eccentric cliffside house.",
    fullText: {
      fr: "La malédiction d'une famille racontée à travers une succession de récits magiques : j'ai incarné un chat, un requin et un coupeur de poisson.",
      en: "A cursed family history told through surreal vignettes: I played as a cat, a shark, and a fish-cannery worker dreaming of royalty.",
      es: "A cursed family history told through surreal vignettes: I played as a cat, a shark, and a fish-cannery worker dreaming of royalty.",
      de: "A cursed family history told through surreal vignettes: I played as a cat, a shark, and a fish-cannery worker dreaming of royalty.",
      ja: "A cursed family history told through surreal vignettes: I played as a cat, a shark, and a fish-cannery worker dreaming of royalty.",
      'pt-BR': "A cursed family history told through surreal vignettes: I played as a cat, a shark, and a fish-cannery worker dreaming of royalty."
    },
    redactedText: {
      fr: "La malédiction d'une famille racontée à travers des récits poétiques dans une immense maison isolée sur une falaise.",
      en: "A cursed family history told through poetic vignettes inside an eccentric cliffside house.",
      es: "A cursed family history told through poetic vignettes inside an eccentric cliffside house.",
      de: "A cursed family history told through poetic vignettes inside an eccentric cliffside house.",
      ja: "A cursed family history told through poetic vignettes inside an eccentric cliffside house.",
      'pt-BR': "A cursed family history told through poetic vignettes inside an eccentric cliffside house."
    }
  },
  {
    gameId: 'darkest-dungeon',
    author: 'AncestralEcho',
    hoursPlayed: 188,
    reviewDate: '24 janvier 2016',
    fullFr: "Rappelez-vous que l'excès de confiance est un tueur lent et insidieux. Mon croisé a volé mes torches en pleine paranoïa et est mort d'une crise cardiaque.",
    fullEn: "Remind yourself that overconfidence is a slow and insidious killer. My crusader had a paranoid breakdown, stole my torches, and died of a heart attack.",
    redactedFr: "Rappelez-vous que l'excès de confiance est un tueur lent et insidieux. Mon aventurier est mort de crise cardiaque dans les cryptes.",
    redactedEn: "Remind yourself that overconfidence is a slow and insidious killer. My hero died of a heart attack deep within the crypts.",
    fullText: {
      fr: "Rappelez-vous que l'excès de confiance est un tueur lent et insidieux. Mon croisé a volé mes torches en pleine paranoïa et est mort d'une crise cardiaque.",
      en: "Remind yourself that overconfidence is a slow and insidious killer. My crusader had a paranoid breakdown, stole my torches, and died of a heart attack.",
      es: "Remind yourself that overconfidence is a slow and insidious killer. My crusader had a paranoid breakdown, stole my torches, and died of a heart attack.",
      de: "Remind yourself that overconfidence is a slow and insidious killer. My crusader had a paranoid breakdown, stole my torches, and died of a heart attack.",
      ja: "Remind yourself that overconfidence is a slow and insidious killer. My crusader had a paranoid breakdown, stole my torches, and died of a heart attack.",
      'pt-BR': "Remind yourself that overconfidence is a slow and insidious killer. My crusader had a paranoid breakdown, stole my torches, and died of a heart attack."
    },
    redactedText: {
      fr: "Rappelez-vous que l'excès de confiance est un tueur lent et insidieux. Mon aventurier est mort de crise cardiaque dans les cryptes.",
      en: "Remind yourself that overconfidence is a slow and insidious killer. My hero died of a heart attack deep within the crypts.",
      es: "Remind yourself that overconfidence is a slow and insidious killer. My hero died of a heart attack deep within the crypts.",
      de: "Remind yourself that overconfidence is a slow and insidious killer. My hero died of a heart attack deep within the crypts.",
      ja: "Remind yourself that overconfidence is a slow and insidious killer. My hero died of a heart attack deep within the crypts.",
      'pt-BR': "Remind yourself that overconfidence is a slow and insidious killer. My hero died of a heart attack deep within the crypts."
    }
  },
  {
    gameId: 'risk-of-rain-2',
    author: 'CritGlassesGod',
    hoursPlayed: 245.6,
    reviewDate: '16 août 2020',
    fullFr: "J'ai ramassé 40 paires de lunettes critiques et 25 canettes énergisantes. Je cours plus vite que la lumière et mon PC a failli exploser.",
    fullEn: "Collected 40 pairs of crit glasses and 25 energy drinks. I am running faster than light and my GPU is on fire.",
    redactedFr: "J'ai ramassé 40 paires de lunettes critiques et 25 canettes énergisantes. Je cours plus vite que la lumière sur cette planète alien.",
    redactedEn: "Collected 40 pairs of crit glasses and 25 energy drinks. Running faster than light across an unforgiving alien world.",
    fullText: {
      fr: "J'ai ramassé 40 paires de lunettes critiques et 25 canettes énergisantes. Je cours plus vite que la lumière et mon PC a failli exploser.",
      en: "Collected 40 pairs of crit glasses and 25 energy drinks. I am running faster than light and my GPU is on fire.",
      es: "Collected 40 pairs of crit glasses and 25 energy drinks. I am running faster than light and my GPU is on fire.",
      de: "Collected 40 pairs of crit glasses and 25 energy drinks. I am running faster than light and my GPU is on fire.",
      ja: "Collected 40 pairs of crit glasses and 25 energy drinks. I am running faster than light and my GPU is on fire.",
      'pt-BR': "Collected 40 pairs of crit glasses and 25 energy drinks. I am running faster than light and my GPU is on fire."
    },
    redactedText: {
      fr: "J'ai ramassé 40 paires de lunettes critiques et 25 canettes énergisantes. Je cours plus vite que la lumière sur cette planète alien.",
      en: "Collected 40 pairs of crit glasses and 25 energy drinks. Running faster than light across an unforgiving alien world.",
      es: "Collected 40 pairs of crit glasses and 25 energy drinks. Running faster than light across an unforgiving alien world.",
      de: "Collected 40 pairs of crit glasses and 25 energy drinks. Running faster than light across an unforgiving alien world.",
      ja: "Collected 40 pairs of crit glasses and 25 energy drinks. Running faster than light across an unforgiving alien world.",
      'pt-BR': "Collected 40 pairs of crit glasses and 25 energy drinks. Running faster than light across an unforgiving alien world."
    }
  },
  {
    gameId: 'ftl-faster-than-light',
    author: 'KestrelCaptain',
    hoursPlayed: 310.4,
    reviewDate: '20 septembre 2013',
    fullFr: "La salle d'oxygène est en feu, les araignées extraterrestres géantes ne sont pas une blague, et le vaisseau amiral rebelle vient de tirer 15 missiles.",
    fullEn: "The oxygen room is ablaze, giant alien spiders are no joke, and the rebel flagship just fired 15 missiles simultaneously.",
    redactedFr: "La salle d'oxygène est en feu, les araignées extraterrestres géantes ne sont pas une blague, et le vaisseau amiral ennemi approche.",
    redactedEn: "The oxygen room is ablaze, giant alien spiders are no joke, and the rebel flagship is closing in.",
    fullText: {
      fr: "La salle d'oxygène est en feu, les araignées extraterrestres géantes ne sont pas une blague, et le vaisseau amiral rebelle vient de tirer 15 missiles.",
      en: "The oxygen room is ablaze, giant alien spiders are no joke, and the rebel flagship just fired 15 missiles simultaneously.",
      es: "The oxygen room is ablaze, giant alien spiders are no joke, and the rebel flagship just fired 15 missiles simultaneously.",
      de: "The oxygen room is ablaze, giant alien spiders are no joke, and the rebel flagship just fired 15 missiles simultaneously.",
      ja: "The oxygen room is ablaze, giant alien spiders are no joke, and the rebel flagship just fired 15 missiles simultaneously.",
      'pt-BR': "The oxygen room is ablaze, giant alien spiders are no joke, and the rebel flagship just fired 15 missiles simultaneously."
    },
    redactedText: {
      fr: "La salle d'oxygène est en feu, les araignées extraterrestres géantes ne sont pas une blague, et le vaisseau amiral ennemi approche.",
      en: "The oxygen room is ablaze, giant alien spiders are no joke, and the rebel flagship is closing in.",
      es: "The oxygen room is ablaze, giant alien spiders are no joke, and the rebel flagship is closing in.",
      de: "The oxygen room is ablaze, giant alien spiders are no joke, and the rebel flagship is closing in.",
      ja: "The oxygen room is ablaze, giant alien spiders are no joke, and the rebel flagship is closing in.",
      'pt-BR': "The oxygen room is ablaze, giant alien spiders are no joke, and the rebel flagship is closing in."
    }
  },
  {
    gameId: 'into-the-breach',
    author: 'GridCommander',
    hoursPlayed: 142.1,
    reviewDate: '3 mars 2018',
    fullFr: "Une partie d'échecs temporelle avec des méchas géants contre des insectes géants. Vous passerez 20 minutes à fixer un seul tour pour sauver un immeuble civil.",
    fullEn: "Time-traveling chess with giant mechs fighting giant insects. You will stare at a single turn for 20 minutes just to save one apartment building.",
    redactedFr: "Une partie d'échecs temporelle avec des méchas géants contre les Vek. Vous passerez 20 minutes à fixer un tour pour sauver le réseau électrique.",
    redactedEn: "Time-traveling chess with giant mechs fighting the Vek. You will stare at a single turn for 20 minutes just to protect the power grid.",
    fullText: {
      fr: "Une partie d'échecs temporelle avec des méchas géants contre des insectes géants. Vous passerez 20 minutes à fixer un seul tour pour sauver un immeuble civil.",
      en: "Time-traveling chess with giant mechs fighting giant insects. You will stare at a single turn for 20 minutes just to save one apartment building.",
      es: "Time-traveling chess with giant mechs fighting giant insects. You will stare at a single turn for 20 minutes just to save one apartment building.",
      de: "Time-traveling chess with giant mechs fighting giant insects. You will stare at a single turn for 20 minutes just to save one apartment building.",
      ja: "Time-traveling chess with giant mechs fighting giant insects. You will stare at a single turn for 20 minutes just to save one apartment building.",
      'pt-BR': "Time-traveling chess with giant mechs fighting giant insects. You will stare at a single turn for 20 minutes just to save one apartment building."
    },
    redactedText: {
      fr: "Une partie d'échecs temporelle avec des méchas géants contre les Vek. Vous passerez 20 minutes à fixer un tour pour sauver le réseau électrique.",
      en: "Time-traveling chess with giant mechs fighting the Vek. You will stare at a single turn for 20 minutes just to protect the power grid.",
      es: "Time-traveling chess with giant mechs fighting the Vek. You will stare at a single turn for 20 minutes just to protect the power grid.",
      de: "Time-traveling chess with giant mechs fighting the Vek. You will stare at a single turn for 20 minutes just to protect the power grid.",
      ja: "Time-traveling chess with giant mechs fighting the Vek. You will stare at a single turn for 20 minutes just to protect the power grid.",
      'pt-BR': "Time-traveling chess with giant mechs fighting the Vek. You will stare at a single turn for 20 minutes just to protect the power grid."
    }
  },
  {
    gameId: 'shovel-knight',
    author: 'PogoKnight',
    hoursPlayed: 48.3,
    reviewDate: '12 juillet 2014',
    fullFr: "Frappez la terre ! Un vibrant hommage à l'ère NES 8-bits avec des contrôles parfaits, un saut à la pelle façon pogo et une bande-son chiptune intemporelle.",
    fullEn: "Strike the earth! A brilliant tribute to 8-bit NES classics with tight controls, shovel pogo jumping, and an unforgettable chiptune score.",
    redactedFr: "Frappez la terre ! Un vibrant hommage à l'ère 8-bits avec des contrôles parfaits, un saut à la pelle et les chevaliers de l'Ordre Sans Quartier.",
    redactedEn: "Strike the earth! A brilliant tribute to 8-bit classics with tight controls, shovel pogo jumping, and knights of the Order of No Quarter.",
    fullText: {
      fr: "Frappez la terre ! Un vibrant hommage à l'ère NES 8-bits avec des contrôles parfaits, un saut à la pelle façon pogo et une bande-son chiptune intemporelle.",
      en: "Strike the earth! A brilliant tribute to 8-bit NES classics with tight controls, shovel pogo jumping, and an unforgettable chiptune score.",
      es: "Strike the earth! A brilliant tribute to 8-bit NES classics with tight controls, shovel pogo jumping, and an unforgettable chiptune score.",
      de: "Strike the earth! A brilliant tribute to 8-bit NES classics with tight controls, shovel pogo jumping, and an unforgettable chiptune score.",
      ja: "Strike the earth! A brilliant tribute to 8-bit NES classics with tight controls, shovel pogo jumping, and an unforgettable chiptune score.",
      'pt-BR': "Strike the earth! A brilliant tribute to 8-bit NES classics with tight controls, shovel pogo jumping, and an unforgettable chiptune score."
    },
    redactedText: {
      fr: "Frappez la terre ! Un vibrant hommage à l'ère 8-bits avec des contrôles parfaits, un saut à la pelle et les chevaliers de l'Ordre Sans Quartier.",
      en: "Strike the earth! A brilliant tribute to 8-bit classics with tight controls, shovel pogo jumping, and knights of the Order of No Quarter.",
      es: "Strike the earth! A brilliant tribute to 8-bit classics with tight controls, shovel pogo jumping, and knights of the Order of No Quarter.",
      de: "Strike the earth! A brilliant tribute to 8-bit classics with tight controls, shovel pogo jumping, and knights of the Order of No Quarter.",
      ja: "Strike the earth! A brilliant tribute to 8-bit classics with tight controls, shovel pogo jumping, and knights of the Order of No Quarter.",
      'pt-BR': "Strike the earth! A brilliant tribute to 8-bit classics with tight controls, shovel pogo jumping, and knights of the Order of No Quarter."
    }
  },
  {
    gameId: 'super-meat-boy',
    author: 'BandageRunner',
    hoursPlayed: 85,
    reviewDate: '4 décembre 2010',
    fullFr: "12 000 morts sur un seul écran de scies circulaires. Voir tous vos échecs rejoués en même temps à la fin du niveau est la meilleure thérapie.",
    fullEn: "12,000 deaths on a single screen of spinning sawblades. Watching all your failed attempts splatter simultaneously at the end is pure therapy.",
    redactedFr: "12 000 morts sur un seul écran de scies circulaires pour sauver Bandage Girl. Voir tous vos échecs rejoués ensemble au replay est un régal.",
    redactedEn: "12,000 deaths on a single screen of spinning sawblades to save Bandage Girl. Watching all your attempts splatter at the replay is pure joy.",
    fullText: {
      fr: "12 000 morts sur un seul écran de scies circulaires. Voir tous vos échecs rejoués en même temps à la fin du niveau est la meilleure thérapie.",
      en: "12,000 deaths on a single screen of spinning sawblades. Watching all your failed attempts splatter simultaneously at the end is pure therapy.",
      es: "12,000 deaths on a single screen of spinning sawblades. Watching all your failed attempts splatter simultaneously at the end is pure therapy.",
      de: "12,000 deaths on a single screen of spinning sawblades. Watching all your failed attempts splatter simultaneously at the end is pure therapy.",
      ja: "12,000 deaths on a single screen of spinning sawblades. Watching all your failed attempts splatter simultaneously at the end is pure therapy.",
      'pt-BR': "12,000 deaths on a single screen of spinning sawblades. Watching all your failed attempts splatter simultaneously at the end is pure therapy."
    },
    redactedText: {
      fr: "12 000 morts sur un seul écran de scies circulaires pour sauver Bandage Girl. Voir tous vos échecs rejoués ensemble au replay est un régal.",
      en: "12,000 deaths on a single screen of spinning sawblades to save Bandage Girl. Watching all your attempts splatter at the replay is pure joy.",
      es: "12,000 deaths on a single screen of spinning sawblades to save Bandage Girl. Watching all your attempts splatter at the replay is pure joy.",
      de: "12,000 deaths on a single screen of spinning sawblades to save Bandage Girl. Watching all your attempts splatter at the replay is pure joy.",
      ja: "12,000 deaths on a single screen of spinning sawblades to save Bandage Girl. Watching all your attempts splatter at the replay is pure joy.",
      'pt-BR': "12,000 deaths on a single screen of spinning sawblades to save Bandage Girl. Watching all your attempts splatter at the replay is pure joy."
    }
  },
  {
    gameId: 'limbo',
    author: 'SilhouettedBoy',
    hoursPlayed: 16.8,
    reviewDate: '10 août 2011',
    fullFr: "Une araignée géante m'a empalé, un piège à ours m'a décapité et des vers luisants ont pris le contrôle de mon cerveau. Tout ça en noir et blanc.",
    fullEn: "A giant spider impaled me, a bear trap decapitated me, and glowing brain-slugs forced me into deep water. All in stark black and white.",
    redactedFr: "Une araignée géante m'a empalé, un piège à ours m'a décapité et des vers luisants m'ont aveuglé. Tout ça en noir et blanc brumeux.",
    redactedEn: "A giant spider impaled me, a bear trap decapitated me, and glowing brain-slugs blinded me. All in stark black and white mist.",
    fullText: {
      fr: "Une araignée géante m'a empalé, un piège à ours m'a décapité et des vers luisants ont pris le contrôle de mon cerveau. Tout ça en noir et blanc.",
      en: "A giant spider impaled me, a bear trap decapitated me, and glowing brain-slugs forced me into deep water. All in stark black and white.",
      es: "A giant spider impaled me, a bear trap decapitated me, and glowing brain-slugs forced me into deep water. All in stark black and white.",
      de: "A giant spider impaled me, a bear trap decapitated me, and glowing brain-slugs forced me into deep water. All in stark black and white.",
      ja: "A giant spider impaled me, a bear trap decapitated me, and glowing brain-slugs forced me into deep water. All in stark black and white.",
      'pt-BR': "A giant spider impaled me, a bear trap decapitated me, and glowing brain-slugs forced me into deep water. All in stark black and white."
    },
    redactedText: {
      fr: "Une araignée géante m'a empalé, un piège à ours m'a décapité et des vers luisants m'ont aveuglé. Tout ça en noir et blanc brumeux.",
      en: "A giant spider impaled me, a bear trap decapitated me, and glowing brain-slugs blinded me. All in stark black and white mist.",
      es: "A giant spider impaled me, a bear trap decapitated me, and glowing brain-slugs blinded me. All in stark black and white mist.",
      de: "A giant spider impaled me, a bear trap decapitated me, and glowing brain-slugs blinded me. All in stark black and white mist.",
      ja: "A giant spider impaled me, a bear trap decapitated me, and glowing brain-slugs blinded me. All in stark black and white mist.",
      'pt-BR': "A giant spider impaled me, a bear trap decapitated me, and glowing brain-slugs blinded me. All in stark black and white mist."
    }
  },
  {
    gameId: 'dont-starve',
    author: 'WilsonTheGentleman',
    hoursPlayed: 195.4,
    reviewDate: '27 avril 2013',
    fullFr: "J'ai mangé de la viande de monstre crue, perdu la raison, été pourchassé par des ombres et je suis mort de faim en hiver avec un sac à dos plein.",
    fullEn: "Ate raw monster meat, lost all my sanity, got hunted by shadow creatures, and starved in winter with a full inventory.",
    redactedFr: "J'ai mangé de la viande crue, perdu la raison, été pourchassé par des ombres et suis mort de froid sous les railleries de Maxwell.",
    redactedEn: "Ate raw monster meat, lost all sanity, got hunted by shadow creatures, and died freezing in the dark mocked by Maxwell.",
    fullText: {
      fr: "J'ai mangé de la viande de monstre crue, perdu la raison, été pourchassé par des ombres et je suis mort de faim en hiver avec un sac à dos plein.",
      en: "Ate raw monster meat, lost all my sanity, got hunted by shadow creatures, and starved in winter with a full inventory.",
      es: "Ate raw monster meat, lost all my sanity, got hunted by shadow creatures, and starved in winter with a full inventory.",
      de: "Ate raw monster meat, lost all my sanity, got hunted by shadow creatures, and starved in winter with a full inventory.",
      ja: "Ate raw monster meat, lost all my sanity, got hunted by shadow creatures, and starved in winter with a full inventory.",
      'pt-BR': "Ate raw monster meat, lost all my sanity, got hunted by shadow creatures, and starved in winter with a full inventory."
    },
    redactedText: {
      fr: "J'ai mangé de la viande crue, perdu la raison, été pourchassé par des ombres et suis mort de froid sous les railleries de Maxwell.",
      en: "Ate raw monster meat, lost all sanity, got hunted by shadow creatures, and died freezing in the dark mocked by Maxwell.",
      es: "Ate raw monster meat, lost all sanity, got hunted by shadow creatures, and died freezing in the dark mocked by Maxwell.",
      de: "Ate raw monster meat, lost all sanity, got hunted by shadow creatures, and died freezing in the dark mocked by Maxwell.",
      ja: "Ate raw monster meat, lost all sanity, got hunted by shadow creatures, and died freezing in the dark mocked by Maxwell.",
      'pt-BR': "Ate raw monster meat, lost all sanity, got hunted by shadow creatures, and died freezing in the dark mocked by Maxwell."
    }
  },
  {
    gameId: 'katana-zero',
    author: 'ChronosSamurai',
    hoursPlayed: 34.6,
    reviewDate: '22 avril 2019',
    fullFr: "Ralentir le temps, renvoyer les balles au katana, et rembobiner la cassette audio à chaque échec. Une chorégraphie d'action néon sans égal.",
    fullEn: "Slow down time, deflect bullets with a katana, and rewind the cassette tape upon dying. Peak neon cyberpunk action choreography.",
    redactedFr: "Ralentir le temps, renvoyer les balles au sabre, et rembobiner la cassette audio à chaque échec. « Oui, cela fonctionnera ».",
    redactedEn: "Slow down time, deflect bullets with a blade, and rewind the cassette tape upon dying. 'Yes, that will work'.",
    fullText: {
      fr: "Ralentir le temps, renvoyer les balles au katana, et rembobiner la cassette audio à chaque échec. Une chorégraphie d'action néon sans égal.",
      en: "Slow down time, deflect bullets with a katana, and rewind the cassette tape upon dying. Peak neon cyberpunk action choreography.",
      es: "Slow down time, deflect bullets with a katana, and rewind the cassette tape upon dying. Peak neon cyberpunk action choreography.",
      de: "Slow down time, deflect bullets with a katana, and rewind the cassette tape upon dying. Peak neon cyberpunk action choreography.",
      ja: "Slow down time, deflect bullets with a katana, and rewind the cassette tape upon dying. Peak neon cyberpunk action choreography.",
      'pt-BR': "Slow down time, deflect bullets with a katana, and rewind the cassette tape upon dying. Peak neon cyberpunk action choreography."
    },
    redactedText: {
      fr: "Ralentir le temps, renvoyer les balles au sabre, et rembobiner la cassette audio à chaque échec. « Oui, cela fonctionnera ».",
      en: "Slow down time, deflect bullets with a blade, and rewind the cassette tape upon dying. 'Yes, that will work'.",
      es: "Slow down time, deflect bullets with a blade, and rewind the cassette tape upon dying. 'Yes, that will work'.",
      de: "Slow down time, deflect bullets with a blade, and rewind the cassette tape upon dying. 'Yes, that will work'.",
      ja: "Slow down time, deflect bullets with a blade, and rewind the cassette tape upon dying. 'Yes, that will work'.",
      'pt-BR': "Slow down time, deflect bullets with a blade, and rewind the cassette tape upon dying. 'Yes, that will work'."
    }
  },
  {
    gameId: 'baba-is-you',
    author: 'LogicMelter',
    hoursPlayed: 72.1,
    reviewDate: '15 mars 2019',
    fullFr: "BABA IS YOU. WALL IS STOP. ROCK IS PUSH. FLAG IS WIN. MON CERVEAU IS FONDU.",
    fullEn: "BABA IS YOU. WALL IS STOP. ROCK IS PUSH. FLAG IS WIN. MY BRAIN IS MELTED.",
    redactedFr: "████ IS YOU. WALL IS STOP. ROCK IS PUSH. FLAG IS WIN. MON CERVEAU EST EN SURCHAUFFE.",
    redactedEn: "████ IS YOU. WALL IS STOP. ROCK IS PUSH. FLAG IS WIN. MY BRAIN HAS CEASED FUNCTIONING.",
    fullText: {
      fr: "BABA IS YOU. WALL IS STOP. ROCK IS PUSH. FLAG IS WIN. MON CERVEAU IS FONDU.",
      en: "BABA IS YOU. WALL IS STOP. ROCK IS PUSH. FLAG IS WIN. MY BRAIN IS MELTED.",
      es: "BABA IS YOU. WALL IS STOP. ROCK IS PUSH. FLAG IS WIN. MY BRAIN IS MELTED.",
      de: "BABA IS YOU. WALL IS STOP. ROCK IS PUSH. FLAG IS WIN. MY BRAIN IS MELTED.",
      ja: "BABA IS YOU. WALL IS STOP. ROCK IS PUSH. FLAG IS WIN. MY BRAIN IS MELTED.",
      'pt-BR': "BABA IS YOU. WALL IS STOP. ROCK IS PUSH. FLAG IS WIN. MY BRAIN IS MELTED."
    },
    redactedText: {
      fr: "████ IS YOU. WALL IS STOP. ROCK IS PUSH. FLAG IS WIN. MON CERVEAU EST EN SURCHAUFFE.",
      en: "████ IS YOU. WALL IS STOP. ROCK IS PUSH. FLAG IS WIN. MY BRAIN HAS CEASED FUNCTIONING.",
      es: "████ IS YOU. WALL IS STOP. ROCK IS PUSH. FLAG IS WIN. MY BRAIN HAS CEASED FUNCTIONING.",
      de: "████ IS YOU. WALL IS STOP. ROCK IS PUSH. FLAG IS WIN. MY BRAIN HAS CEASED FUNCTIONING.",
      ja: "████ IS YOU. WALL IS STOP. ROCK IS PUSH. FLAG IS WIN. MY BRAIN HAS CEASED FUNCTIONING.",
      'pt-BR': "████ IS YOU. WALL IS STOP. ROCK IS PUSH. FLAG IS WIN. MY BRAIN HAS CEASED FUNCTIONING."
    }
  },
  {
    gameId: 'dredge',
    author: 'OldSaltFisher',
    hoursPlayed: 42,
    reviewDate: '1er avril 2023',
    fullFr: "À midi, c'est une charmante partie de pêche relaxante. À 22h dans le brouillard, l'eau s'agite et des horreurs cosmiques lovecraftiennes me fixent.",
    fullEn: "At noon, it's a cozy relaxing fishing trip. At 10 PM in the thick fog, cosmic eldritch horrors are staring into my soul.",
    redactedFr: "À midi, c'est une charmante partie de pêche relaxante dans l'archipel. À 22h dans la brume, l'œil de panique s'ouvre et les abysses s'éveillent.",
    redactedEn: "At noon, it's a cozy relaxing fishing trip. At 10 PM in the thick fog, the panic eye opens and the deep abyss awakens.",
    fullText: {
      fr: "À midi, c'est une charmante partie de pêche relaxante. À 22h dans le brouillard, l'eau s'agite et des horreurs cosmiques lovecraftiennes me fixent.",
      en: "At noon, it's a cozy relaxing fishing trip. At 10 PM in the thick fog, cosmic eldritch horrors are staring into my soul.",
      es: "At noon, it's a cozy relaxing fishing trip. At 10 PM in the thick fog, cosmic eldritch horrors are staring into my soul.",
      de: "At noon, it's a cozy relaxing fishing trip. At 10 PM in the thick fog, cosmic eldritch horrors are staring into my soul.",
      ja: "At noon, it's a cozy relaxing fishing trip. At 10 PM in the thick fog, cosmic eldritch horrors are staring into my soul.",
      'pt-BR': "At noon, it's a cozy relaxing fishing trip. At 10 PM in the thick fog, cosmic eldritch horrors are staring into my soul."
    },
    redactedText: {
      fr: "À midi, c'est une charmante partie de pêche relaxante dans l'archipel. À 22h dans la brume, l'œil de panique s'ouvre et les abysses s'éveillent.",
      en: "At noon, it's a cozy relaxing fishing trip. At 10 PM in the thick fog, the panic eye opens and the deep abyss awakens.",
      es: "At noon, it's a cozy relaxing fishing trip. At 10 PM in the thick fog, the panic eye opens and the deep abyss awakens.",
      de: "At noon, it's a cozy relaxing fishing trip. At 10 PM in the thick fog, the panic eye opens and the deep abyss awakens.",
      ja: "At noon, it's a cozy relaxing fishing trip. At 10 PM in the thick fog, the panic eye opens and the deep abyss awakens.",
      'pt-BR': "At noon, it's a cozy relaxing fishing trip. At 10 PM in the thick fog, the panic eye opens and the deep abyss awakens."
    }
  },
  {
    gameId: 'animal-well',
    author: 'SubterraneanExplorer',
    hoursPlayed: 31.5,
    reviewDate: '12 mai 2024',
    fullFr: "Vous êtes une petite boule dans un labyrinthe souterrain sans aucune indication. Un yoyo, un slinky, un chien fantôme terrifiant et des secrets partout.",
    fullEn: "You are a tiny blob in a subterranean labyrinth with zero hand-holding. A yoyo, a slinky, a terrifying ghost dog, and layers of secrets.",
    redactedFr: "Vous êtes une petite boule dans un puits souterrain mystérieux. Un yoyo, un frisbee, une bulle de savon et des secrets enfouis.",
    redactedEn: "You are a tiny blob in a mysterious well. A yoyo, a frisbee, a bubble wand, and layers of enigmatic puzzles.",
    fullText: {
      fr: "Vous êtes une petite boule dans un labyrinthe souterrain sans aucune indication. Un yoyo, un slinky, un chien fantôme terrifiant et des secrets partout.",
      en: "You are a tiny blob in a subterranean labyrinth with zero hand-holding. A yoyo, a slinky, a terrifying ghost dog, and layers of secrets.",
      es: "You are a tiny blob in a subterranean labyrinth with zero hand-holding. A yoyo, a slinky, a terrifying ghost dog, and layers of secrets.",
      de: "You are a tiny blob in a subterranean labyrinth with zero hand-holding. A yoyo, a slinky, a terrifying ghost dog, and layers of secrets.",
      ja: "You are a tiny blob in a subterranean labyrinth with zero hand-holding. A yoyo, a slinky, a terrifying ghost dog, and layers of secrets.",
      'pt-BR': "You are a tiny blob in a subterranean labyrinth with zero hand-holding. A yoyo, a slinky, a terrifying ghost dog, and layers of secrets."
    },
    redactedText: {
      fr: "Vous êtes une petite boule dans un puits souterrain mystérieux. Un yoyo, un frisbee, une bulle de savon et des secrets enfouis.",
      en: "You are a tiny blob in a mysterious well. A yoyo, a frisbee, a bubble wand, and layers of enigmatic puzzles.",
      es: "You are a tiny blob in a mysterious well. A yoyo, a frisbee, a bubble wand, and layers of enigmatic puzzles.",
      de: "You are a tiny blob in a mysterious well. A yoyo, a frisbee, a bubble wand, and layers of enigmatic puzzles.",
      ja: "You are a tiny blob in a mysterious well. A yoyo, a frisbee, a bubble wand, and layers of enigmatic puzzles.",
      'pt-BR': "You are a tiny blob in a mysterious well. A yoyo, a frisbee, a bubble wand, and layers of enigmatic puzzles."
    }
  },
  {
    gameId: 'lethal-company',
    author: 'ScrapCollector_V45',
    hoursPlayed: 98.4,
    reviewDate: '24 novembre 2023',
    fullFr: "On est descendus dans un complexe abandonné pour ramasser de la ferraille pour La Compagnie. J'ai entendu un bébé pleurer et j'ai sauté sur une mine.",
    fullEn: "Went down into an abandoned moon facility to collect scrap for The Company. Heard a baby laughing in the dark, stepped on a landmine.",
    redactedFr: "On est descendus sur une lune industrielle pour remplir le quota de ferraille. Un bruit dans le noir, une tourelle automatique, et fin de mission.",
    redactedEn: "Landed on an industrial moon to meet the scrap quota. A noise in the dark, a ceiling turret, and mission failed.",
    fullText: {
      fr: "On est descendus dans un complexe abandonné pour ramasser de la ferraille pour La Compagnie. J'ai entendu un bébé pleurer et j'ai sauté sur une mine.",
      en: "Went down into an abandoned moon facility to collect scrap for The Company. Heard a baby laughing in the dark, stepped on a landmine.",
      es: "Went down into an abandoned moon facility to collect scrap for The Company. Heard a baby laughing in the dark, stepped on a landmine.",
      de: "Went down into an abandoned moon facility to collect scrap for The Company. Heard a baby laughing in the dark, stepped on a landmine.",
      ja: "Went down into an abandoned moon facility to collect scrap for The Company. Heard a baby laughing in the dark, stepped on a landmine.",
      'pt-BR': "Went down into an abandoned moon facility to collect scrap for The Company. Heard a baby laughing in the dark, stepped on a landmine."
    },
    redactedText: {
      fr: "On est descendus sur une lune industrielle pour remplir le quota de ferraille. Un bruit dans le noir, une tourelle automatique, et fin de mission.",
      en: "Landed on an industrial moon to meet the scrap quota. A noise in the dark, a ceiling turret, and mission failed.",
      es: "Landed on an industrial moon to meet the scrap quota. A noise in the dark, a ceiling turret, and mission failed.",
      de: "Landed on an industrial moon to meet the scrap quota. A noise in the dark, a ceiling turret, and mission failed.",
      ja: "Landed on an industrial moon to meet the scrap quota. A noise in the dark, a ceiling turret, and mission failed.",
      'pt-BR': "Landed on an industrial moon to meet the scrap quota. A noise in the dark, a ceiling turret, and mission failed."
    }
  },
  {
    gameId: 'stray',
    author: 'MeowButtonSpammer',
    hoursPlayed: 14.8,
    reviewDate: '21 juillet 2022',
    fullFr: "Appuyer sur B pour miauler. Explorer une cybercité peuplée de robots avec un petit sac à dos et un drone amical. 10/10 pour les amoureux des félins.",
    fullEn: "Press B to meow. Roam a cyberpunk city inhabited by robots with a cute little backpack and a friendly drone. 10/10 cat simulator.",
    redactedFr: "Appuyer sur une touche pour miauler. Se faufiler sur les toits d'une ville fortifiée oubliée parmi des robots mélancoliques.",
    redactedEn: "Press a button to meow. Sneak across the neon rooftops of a forgotten walled city among melancholic companions.",
    fullText: {
      fr: "Appuyer sur B pour miauler. Explorer une cybercité peuplée de robots avec un petit sac à dos et un drone amical. 10/10 pour les amoureux des félins.",
      en: "Press B to meow. Roam a cyberpunk city inhabited by robots with a cute little backpack and a friendly drone. 10/10 cat simulator.",
      es: "Press B to meow. Roam a cyberpunk city inhabited by robots with a cute little backpack and a friendly drone. 10/10 cat simulator.",
      de: "Press B to meow. Roam a cyberpunk city inhabited by robots with a cute little backpack and a friendly drone. 10/10 cat simulator.",
      ja: "Press B to meow. Roam a cyberpunk city inhabited by robots with a cute little backpack and a friendly drone. 10/10 cat simulator.",
      'pt-BR': "Press B to meow. Roam a cyberpunk city inhabited by robots with a cute little backpack and a friendly drone. 10/10 cat simulator."
    },
    redactedText: {
      fr: "Appuyer sur une touche pour miauler. Se faufiler sur les toits d'une ville fortifiée oubliée parmi des robots mélancoliques.",
      en: "Press a button to meow. Sneak across the neon rooftops of a forgotten walled city among melancholic companions.",
      es: "Press a button to meow. Sneak across the neon rooftops of a forgotten walled city among melancholic companions.",
      de: "Press a button to meow. Sneak across the neon rooftops of a forgotten walled city among melancholic companions.",
      ja: "Press a button to meow. Sneak across the neon rooftops of a forgotten walled city among melancholic companions.",
      'pt-BR': "Press a button to meow. Sneak across the neon rooftops of a forgotten walled city among melancholic companions."
    }
  },
  {
    gameId: 'project-zomboid',
    author: 'SpiffoSurvivor',
    hoursPlayed: 412,
    reviewDate: '10 janvier 2022',
    fullFr: "Voici comment vous êtes mort. J'ai survécu 2 mois en me barricadant, puis je me suis coupé en ouvrant une boîte de conserve et je suis mort d'infection.",
    fullEn: "This is how you died. Survived 2 months strictly fortified, then cut my hand on a soup can and died of a fever. Peak zombie survival.",
    redactedFr: "Voici comment vous êtes mort. J'ai fortifié une maison à Muldraugh, puis j'ai couru à travers une vitre brisée et péri d'hémorragie.",
    redactedEn: "This is how you died. Barricaded a suburban home in Kentucky, then sprinted through broken glass and bled out in the rain.",
    fullText: {
      fr: "Voici comment vous êtes mort. J'ai survécu 2 mois en me barricadant, puis je me suis coupé en ouvrant une boîte de conserve et je suis mort d'infection.",
      en: "This is how you died. Survived 2 months strictly fortified, then cut my hand on a soup can and died of a fever. Peak zombie survival.",
      es: "This is how you died. Survived 2 months strictly fortified, then cut my hand on a soup can and died of a fever. Peak zombie survival.",
      de: "This is how you died. Survived 2 months strictly fortified, then cut my hand on a soup can and died of a fever. Peak zombie survival.",
      ja: "This is how you died. Survived 2 months strictly fortified, then cut my hand on a soup can and died of a fever. Peak zombie survival.",
      'pt-BR': "This is how you died. Survived 2 months strictly fortified, then cut my hand on a soup can and died of a fever. Peak zombie survival."
    },
    redactedText: {
      fr: "Voici comment vous êtes mort. J'ai fortifié une maison à Muldraugh, puis j'ai couru à travers une vitre brisée et péri d'hémorragie.",
      en: "This is how you died. Barricaded a suburban home in Kentucky, then sprinted through broken glass and bled out in the rain.",
      es: "This is how you died. Barricaded a suburban home in Kentucky, then sprinted through broken glass and bled out in the rain.",
      de: "This is how you died. Barricaded a suburban home in Kentucky, then sprinted through broken glass and bled out in the rain.",
      ja: "This is how you died. Barricaded a suburban home in Kentucky, then sprinted through broken glass and bled out in the rain.",
      'pt-BR': "This is how you died. Barricaded a suburban home in Kentucky, then sprinted through broken glass and bled out in the rain."
    }
  },
  {
    gameId: 'buckshot-roulette',
    author: 'ShotgunGambler',
    hoursPlayed: 28.5,
    reviewDate: '5 avril 2024',
    fullFr: "Face à un croupier monstrueux dans un bar miteux avec un fusil à pompe de calibre 12, des cigarettes et des menottes. La tension est insoutenable.",
    fullEn: "Sitting across a terrifying dealer in a grimy bathroom with a 12-gauge shotgun, beer, and handcuffs. Peak psychological tension.",
    redactedFr: "Face à un croupier métallique dans une boîte de nuit crasseuse. Une cartouche réelle, deux à blanc, et un fusil à pompe scié sur la table.",
    redactedEn: "Facing a metallic dealer in a dingy nightclub backroom. One live round, two blanks, and a sawed-off shotgun on the table.",
    fullText: {
      fr: "Face à un croupier monstrueux dans un bar miteux avec un fusil à pompe de calibre 12, des cigarettes et des menottes. La tension est insoutenable.",
      en: "Sitting across a terrifying dealer in a grimy bathroom with a 12-gauge shotgun, beer, and handcuffs. Peak psychological tension.",
      es: "Sitting across a terrifying dealer in a grimy bathroom with a 12-gauge shotgun, beer, and handcuffs. Peak psychological tension.",
      de: "Sitting across a terrifying dealer in a grimy bathroom with a 12-gauge shotgun, beer, and handcuffs. Peak psychological tension.",
      ja: "Sitting across a terrifying dealer in a grimy bathroom with a 12-gauge shotgun, beer, and handcuffs. Peak psychological tension.",
      'pt-BR': "Sitting across a terrifying dealer in a grimy bathroom with a 12-gauge shotgun, beer, and handcuffs. Peak psychological tension."
    },
    redactedText: {
      fr: "Face à un croupier métallique dans une boîte de nuit crasseuse. Une cartouche réelle, deux à blanc, et un fusil à pompe scié sur la table.",
      en: "Facing a metallic dealer in a dingy nightclub backroom. One live round, two blanks, and a sawed-off shotgun on the table.",
      es: "Facing a metallic dealer in a dingy nightclub backroom. One live round, two blanks, and a sawed-off shotgun on the table.",
      de: "Facing a metallic dealer in a dingy nightclub backroom. One live round, two blanks, and a sawed-off shotgun on the table.",
      ja: "Facing a metallic dealer in a dingy nightclub backroom. One live round, two blanks, and a sawed-off shotgun on the table.",
      'pt-BR': "Facing a metallic dealer in a dingy nightclub backroom. One live round, two blanks, and a sawed-off shotgun on the table."
    }
  },
  {
    gameId: 'phasmophobia',
    author: 'SpiritBoxScreamer',
    hoursPlayed: 165.2,
    reviewDate: '14 octobre 2020',
    fullFr: "Mon pote a crié le nom du fantôme dans la boîte vocale, la porte s'est verrouillée, sa lampe torche s'est mise à clignoter et on a tous hurlé.",
    fullEn: "My friend shouted the ghost's name into the spirit box, front door locked, flashlights started flickering, and we all screamed in Discord.",
    redactedFr: "Poser le thermomètre, repérer une température glaciale, crier le nom de l'entité et paniquer quand la porte de la maison se verrouille d'un coup.",
    redactedEn: "Checking freezing temps, shouting into the EMF reader, and panicking when the front door slams shut during a sudden hunt.",
    fullText: {
      fr: "Mon pote a crié le nom du fantôme dans la boîte vocale, la porte s'est verrouillée, sa lampe torche s'est mise à clignoter et on a tous hurlé.",
      en: "My friend shouted the ghost's name into the spirit box, front door locked, flashlights started flickering, and we all screamed in Discord.",
      es: "My friend shouted the ghost's name into the spirit box, front door locked, flashlights started flickering, and we all screamed in Discord.",
      de: "My friend shouted the ghost's name into the spirit box, front door locked, flashlights started flickering, and we all screamed in Discord.",
      ja: "My friend shouted the ghost's name into the spirit box, front door locked, flashlights started flickering, and we all screamed in Discord.",
      'pt-BR': "My friend shouted the ghost's name into the spirit box, front door locked, flashlights started flickering, and we all screamed in Discord."
    },
    redactedText: {
      fr: "Poser le thermomètre, repérer une température glaciale, crier le nom de l'entité et paniquer quand la porte de la maison se verrouille d'un coup.",
      en: "Checking freezing temps, shouting into the EMF reader, and panicking when the front door slams shut during a sudden hunt.",
      es: "Checking freezing temps, shouting into the EMF reader, and panicking when the front door slams shut during a sudden hunt.",
      de: "Checking freezing temps, shouting into the EMF reader, and panicking when the front door slams shut during a sudden hunt.",
      ja: "Checking freezing temps, shouting into the EMF reader, and panicking when the front door slams shut during a sudden hunt.",
      'pt-BR': "Checking freezing temps, shouting into the EMF reader, and panicking when the front door slams shut during a sudden hunt."
    }
  },
  {
    gameId: 'factorio',
    author: 'ConveyorBeltAddict',
    hoursPlayed: 1450,
    reviewDate: '15 août 2020',
    fullFr: "L'usine doit grandir. Je n'ai pas vu la lumière du jour depuis trois semaines. Quand je ferme les yeux, je vois des tapis roulants.",
    fullEn: "The factory must grow. I haven't seen natural sunlight in three weeks. When I close my eyes, I only see conveyor belts.",
    redactedFr: "L'█████ doit grandir. Optimiser les ratios de circuits électroniques verts et repousser les vagues d'indigènes avec des tourelles laser.",
    redactedEn: "The ████████ must grow. Optimizing green circuit ratios and holding off waves of native biters with perimeter laser turrets.",
    fullText: {
      fr: "L'usine doit grandir. Je n'ai pas vu la lumière du jour depuis trois semaines. Quand je ferme les yeux, je vois des tapis roulants.",
      en: "The factory must grow. I haven't seen natural sunlight in three weeks. When I close my eyes, I only see conveyor belts.",
      es: "The factory must grow. I haven't seen natural sunlight in three weeks. When I close my eyes, I only see conveyor belts.",
      de: "The factory must grow. I haven't seen natural sunlight in three weeks. When I close my eyes, I only see conveyor belts.",
      ja: "The factory must grow. I haven't seen natural sunlight in three weeks. When I close my eyes, I only see conveyor belts.",
      'pt-BR': "The factory must grow. I haven't seen natural sunlight in three weeks. When I close my eyes, I only see conveyor belts."
    },
    redactedText: {
      fr: "L'█████ doit grandir. Optimiser les ratios de circuits électroniques verts et repousser les vagues d'indigènes avec des tourelles laser.",
      en: "The ████████ must grow. Optimizing green circuit ratios and holding off waves of native biters with perimeter laser turrets.",
      es: "The ████████ must grow. Optimizing green circuit ratios and holding off waves of native biters with perimeter laser turrets.",
      de: "The ████████ must grow. Optimizing green circuit ratios and holding off waves of native biters with perimeter laser turrets.",
      ja: "The ████████ must grow. Optimizing green circuit ratios and holding off waves of native biters with perimeter laser turrets.",
      'pt-BR': "The ████████ must grow. Optimizing green circuit ratios and holding off waves of native biters with perimeter laser turrets."
    }
  },
  {
    gameId: 'rimworld',
    author: 'StoryWeaver99',
    hoursPlayed: 890.3,
    reviewDate: '18 octobre 2018',
    fullFr: "Générateur d'histoires tragiques : fabriquer des chapeaux en cuir humain et subir une crise de démence parce que quelqu'un a mangé sans table.",
    fullEn: "Tragic story generator: crafted human-leather dusters, only to have a colonist burn the base down because they ate without a table.",
    redactedFr: "Générateur d'histoires sans pitié : un colon s'énerve parce qu'il a mangé sans table, déclenche un incendie et tue nos lamas de bât.",
    redactedEn: "Brutal story generator: a colonist snaps because they ate without a table, sets fire to the storage room, and dooms the whole colony.",
    fullText: {
      fr: "Générateur d'histoires tragiques : fabriquer des chapeaux en cuir humain et subir une crise de démence parce que quelqu'un a mangé sans table.",
      en: "Tragic story generator: crafted human-leather dusters, only to have a colonist burn the base down because they ate without a table.",
      es: "Tragic story generator: crafted human-leather dusters, only to have a colonist burn the base down because they ate without a table.",
      de: "Tragic story generator: crafted human-leather dusters, only to have a colonist burn the base down because they ate without a table.",
      ja: "Tragic story generator: crafted human-leather dusters, only to have a colonist burn the base down because they ate without a table.",
      'pt-BR': "Tragic story generator: crafted human-leather dusters, only to have a colonist burn the base down because they ate without a table."
    },
    redactedText: {
      fr: "Générateur d'histoires sans pitié : un colon s'énerve parce qu'il a mangé sans table, déclenche un incendie et tue nos lamas de bât.",
      en: "Brutal story generator: a colonist snaps because they ate without a table, sets fire to the storage room, and dooms the whole colony.",
      es: "Brutal story generator: a colonist snaps because they ate without a table, sets fire to the storage room, and dooms the whole colony.",
      de: "Brutal story generator: a colonist snaps because they ate without a table, sets fire to the storage room, and dooms the whole colony.",
      ja: "Brutal story generator: a colonist snaps because they ate without a table, sets fire to the storage room, and dooms the whole colony.",
      'pt-BR': "Brutal story generator: a colonist snaps because they ate without a table, sets fire to the storage room, and dooms the whole colony."
    }
  },
  {
    gameId: 'deep-rock-galactic',
    author: 'KarlsDisciple',
    hoursPlayed: 320,
    reviewDate: '14 mai 2020',
    fullFr: "Rock and Stone ! Minez de l'or, descendez des bières spatiales, tirez sur des nuées d'insectes aliens géants et ne laissez aucun nain derrière.",
    fullEn: "Rock and Stone! Mine minerals, slam space beers, shoot swarms of giant bugs, and leave no dwarf behind.",
    redactedFr: "Pour Karl ! Minez la morkite dans les grottes d'Hoxxes IV, tirez sur des arachnides géants et levez vos pioches en l'air.",
    redactedEn: "For Karl! Mining morkite in the dark caves of Hoxxes IV, blasting giant glyphids, and raising pickaxes together.",
    fullText: {
      fr: "Rock and Stone ! Minez de l'or, descendez des bières spatiales, tirez sur des nuées d'insectes aliens géants et ne laissez aucun nain derrière.",
      en: "Rock and Stone! Mine minerals, slam space beers, shoot swarms of giant bugs, and leave no dwarf behind.",
      es: "Rock and Stone! Mine minerals, slam space beers, shoot swarms of giant bugs, and leave no dwarf behind.",
      de: "Rock and Stone! Mine minerals, slam space beers, shoot swarms of giant bugs, and leave no dwarf behind.",
      ja: "Rock and Stone! Mine minerals, slam space beers, shoot swarms of giant bugs, and leave no dwarf behind.",
      'pt-BR': "Rock and Stone! Mine minerals, slam space beers, shoot swarms of giant bugs, and leave no dwarf behind."
    },
    redactedText: {
      fr: "Pour Karl ! Minez la morkite dans les grottes d'Hoxxes IV, tirez sur des arachnides géants et levez vos pioches en l'air.",
      en: "For Karl! Mining morkite in the dark caves of Hoxxes IV, blasting giant glyphids, and raising pickaxes together.",
      es: "For Karl! Mining morkite in the dark caves of Hoxxes IV, blasting giant glyphids, and raising pickaxes together.",
      de: "For Karl! Mining morkite in the dark caves of Hoxxes IV, blasting giant glyphids, and raising pickaxes together.",
      ja: "For Karl! Mining morkite in the dark caves of Hoxxes IV, blasting giant glyphids, and raising pickaxes together.",
      'pt-BR': "For Karl! Mining morkite in the dark caves of Hoxxes IV, blasting giant glyphids, and raising pickaxes together."
    }
  },
  {
    gameId: 'valheim',
    author: 'OdinChosenOne',
    hoursPlayed: 215.8,
    reviewDate: '28 février 2021',
    fullFr: "J'ai coupé un arbre pour me construire une cabane viking. L'arbre a roulé sur une pente et m'a écrasé. 10/10 meilleur simulateur de bûcheron nordique.",
    fullEn: "Chopped down a tree to build a Viking hut. The log rolled downhill and crushed me. 10/10 best Norse survival simulator.",
    redactedFr: "J'ai coupé un hêtre pour ma première cabane viking. Le tronc a dévalé la colline et m'a écrabouillé sur le coup. 10/10.",
    redactedEn: "Chopped down a beech tree for my first Viking shelter. The log rolled down the hill and flattened me instantly. 10/10.",
    fullText: {
      fr: "J'ai coupé un arbre pour me construire une cabane viking. L'arbre a roulé sur une pente et m'a écrasé. 10/10 meilleur simulateur de bûcheron nordique.",
      en: "Chopped down a tree to build a Viking hut. The log rolled downhill and crushed me. 10/10 best Norse survival simulator.",
      es: "Chopped down a tree to build a Viking hut. The log rolled downhill and crushed me. 10/10 best Norse survival simulator.",
      de: "Chopped down a tree to build a Viking hut. The log rolled downhill and crushed me. 10/10 best Norse survival simulator.",
      ja: "Chopped down a tree to build a Viking hut. The log rolled downhill and crushed me. 10/10 best Norse survival simulator.",
      'pt-BR': "Chopped down a tree to build a Viking hut. The log rolled downhill and crushed me. 10/10 best Norse survival simulator."
    },
    redactedText: {
      fr: "J'ai coupé un hêtre pour ma première cabane viking. Le tronc a dévalé la colline et m'a écrabouillé sur le coup. 10/10.",
      en: "Chopped down a beech tree for my first Viking shelter. The log rolled down the hill and flattened me instantly. 10/10.",
      es: "Chopped down a beech tree for my first Viking shelter. The log rolled down the hill and flattened me instantly. 10/10.",
      de: "Chopped down a beech tree for my first Viking shelter. The log rolled down the hill and flattened me instantly. 10/10.",
      ja: "Chopped down a beech tree for my first Viking shelter. The log rolled down the hill and flattened me instantly. 10/10.",
      'pt-BR': "Chopped down a beech tree for my first Viking shelter. The log rolled down the hill and flattened me instantly. 10/10."
    }
  },
  {
    gameId: 'doki-doki-literature-club',
    author: 'PoetryClubPresident',
    hoursPlayed: 22,
    reviewDate: '10 octobre 2017',
    fullFr: "Je pensais rejoindre un club de poésie avec de jolies camarades de classe. Deux heures plus tard, j'étais en train de supprimer des fichiers dans le dossier du jeu.",
    fullEn: "Thought I was joining an innocent poetry club with cute girls. Two hours later, I was manually deleting files in the game directory.",
    redactedFr: "Je pensais rejoindre un innocent club de littérature scolaire. Quelques poèmes plus tard, l'écran glitchait et la présidente me fixait. Juste ██████.",
    redactedEn: "Thought I was joining an innocent literature club. A few poems later, the screen began glitching and the club president was staring. Just ██████.",
    fullText: {
      fr: "Je pensais rejoindre un club de poésie avec de jolies camarades de classe. Deux heures plus tard, j'étais en train de supprimer des fichiers dans le dossier du jeu.",
      en: "Thought I was joining an innocent poetry club with cute girls. Two hours later, I was manually deleting files in the game directory.",
      es: "Thought I was joining an innocent poetry club with cute girls. Two hours later, I was manually deleting files in the game directory.",
      de: "Thought I was joining an innocent poetry club with cute girls. Two hours later, I was manually deleting files in the game directory.",
      ja: "Thought I was joining an innocent poetry club with cute girls. Two hours later, I was manually deleting files in the game directory.",
      'pt-BR': "Thought I was joining an innocent poetry club with cute girls. Two hours later, I was manually deleting files in the game directory."
    },
    redactedText: {
      fr: "Je pensais rejoindre un innocent club de littérature scolaire. Quelques poèmes plus tard, l'écran glitchait et la présidente me fixait. Juste ██████.",
      en: "Thought I was joining an innocent literature club. A few poems later, the screen began glitching and the club president was staring. Just ██████.",
      es: "Thought I was joining an innocent literature club. A few poems later, the screen began glitching and the club president was staring. Just ██████.",
      de: "Thought I was joining an innocent literature club. A few poems later, the screen began glitching and the club president was staring. Just ██████.",
      ja: "Thought I was joining an innocent literature club. A few poems later, the screen began glitching and the club president was staring. Just ██████.",
      'pt-BR': "Thought I was joining an innocent literature club. A few poems later, the screen began glitching and the club president was staring. Just ██████."
    }
  },
  {
    gameId: 'superliminal',
    author: 'DreamTherapist',
    hoursPlayed: 12.4,
    reviewDate: '14 novembre 2020',
    fullFr: "La perspective est réalité. J'ai pris une petite pomme, je l'ai levée vers le plafond, elle est devenue géante et m'a servi d'escalier vers la sortie.",
    fullEn: "Perspective is reality. Picked up a small apple, looked up, it became the size of a building and served as a staircase to the exit.",
    redactedFr: "La perspective est réalité. Prenez une pièce d'échecs minuscule, reculez dans le couloir de l'institut du sommeil pour qu'elle devienne un pont géant.",
    redactedEn: "Perspective is reality. Pick up a tiny chess piece, walk backwards in the sleep institute corridor so it grows into a colossal bridge.",
    fullText: {
      fr: "La perspective est réalité. J'ai pris une petite pomme, je l'ai levée vers le plafond, elle est devenue géante et m'a servi d'escalier vers la sortie.",
      en: "Perspective is reality. Picked up a small apple, looked up, it became the size of a building and served as a staircase to the exit.",
      es: "Perspective is reality. Picked up a small apple, looked up, it became the size of a building and served as a staircase to the exit.",
      de: "Perspective is reality. Picked up a small apple, looked up, it became the size of a building and served as a staircase to the exit.",
      ja: "Perspective is reality. Picked up a small apple, looked up, it became the size of a building and served as a staircase to the exit.",
      'pt-BR': "Perspective is reality. Picked up a small apple, looked up, it became the size of a building and served as a staircase to the exit."
    },
    redactedText: {
      fr: "La perspective est réalité. Prenez une pièce d'échecs minuscule, reculez dans le couloir de l'institut du sommeil pour qu'elle devienne un pont géant.",
      en: "Perspective is reality. Pick up a tiny chess piece, walk backwards in the sleep institute corridor so it grows into a colossal bridge.",
      es: "Perspective is reality. Pick up a tiny chess piece, walk backwards in the sleep institute corridor so it grows into a colossal bridge.",
      de: "Perspective is reality. Pick up a tiny chess piece, walk backwards in the sleep institute corridor so it grows into a colossal bridge.",
      ja: "Perspective is reality. Pick up a tiny chess piece, walk backwards in the sleep institute corridor so it grows into a colossal bridge.",
      'pt-BR': "Perspective is reality. Pick up a tiny chess piece, walk backwards in the sleep institute corridor so it grows into a colossal bridge."
    }
  },
  {
    gameId: 'superhot',
    author: 'TimeStopper_77',
    hoursPlayed: 26.2,
    reviewDate: '26 février 2016',
    fullFr: "Le temps n'avance que lorsque vous bougez. Esquiver une volée de balles au millimètre, lancer une tasse de café sur un ennemi rouge et ramasser son pistolet.",
    fullEn: "Time moves only when you move. Dodging bullets in slow motion, throwing a coffee mug at a red enemy, and catching their gun mid-air.",
    redactedFr: "Le temps n'avance que lorsque vous bougez. Éviter les tirs au ralenti, briser des corps polygonaux rouges et répéter le titre du jeu en boucle.",
    redactedEn: "Time moves only when you move. Weaving through bullets in slow-mo, shattering red polygonal foes, and hearing the chant resonate.",
    fullText: {
      fr: "Le temps n'avance que lorsque vous bougez. Esquiver une volée de balles au millimètre, lancer une tasse de café sur un ennemi rouge et ramasser son pistolet.",
      en: "Time moves only when you move. Dodging bullets in slow motion, throwing a coffee mug at a red enemy, and catching their gun mid-air.",
      es: "Time moves only when you move. Dodging bullets in slow motion, throwing a coffee mug at a red enemy, and catching their gun mid-air.",
      de: "Time moves only when you move. Dodging bullets in slow motion, throwing a coffee mug at a red enemy, and catching their gun mid-air.",
      ja: "Time moves only when you move. Dodging bullets in slow motion, throwing a coffee mug at a red enemy, and catching their gun mid-air.",
      'pt-BR': "Time moves only when you move. Dodging bullets in slow motion, throwing a coffee mug at a red enemy, and catching their gun mid-air."
    },
    redactedText: {
      fr: "Le temps n'avance que lorsque vous bougez. Éviter les tirs au ralenti, briser des corps polygonaux rouges et répéter le titre du jeu en boucle.",
      en: "Time moves only when you move. Weaving through bullets in slow-mo, shattering red polygonal foes, and hearing the chant resonate.",
      es: "Time moves only when you move. Weaving through bullets in slow-mo, shattering red polygonal foes, and hearing the chant resonate.",
      de: "Time moves only when you move. Weaving through bullets in slow-mo, shattering red polygonal foes, and hearing the chant resonate.",
      ja: "Time moves only when you move. Weaving through bullets in slow-mo, shattering red polygonal foes, and hearing the chant resonate.",
      'pt-BR': "Time moves only when you move. Weaving through bullets in slow-mo, shattering red polygonal foes, and hearing the chant resonate."
    }
  },
  {
    gameId: 'slay-the-princess',
    author: 'HeroicVoice',
    hoursPlayed: 19.3,
    reviewDate: '30 octobre 2023',
    fullFr: "Le Narrateur vous ordonne de l'éliminer pour sauver le monde. Elle a un couteau, vous avez une voix dans la tête qui trouve qu'elle a l'air sympa.",
    fullEn: "The Narrator tells you she will end the world. You have a pristine blade, and a voice in your head saying she looks kinda cute.",
    redactedFr: "Le Narrateur vous ordonne d'éliminer la captive dans la cabane. Vous avez une lame immaculée et des voix qui se disputent vos choix.",
    redactedEn: "The Narrator orders you to end the captive in the basement. You carry a pristine blade and arguing voices inside your mind.",
    fullText: {
      fr: "Le Narrateur vous ordonne de l'éliminer pour sauver le monde. Elle a un couteau, vous avez une voix dans la tête qui trouve qu'elle a l'air sympa.",
      en: "The Narrator tells you she will end the world. You have a pristine blade, and a voice in your head saying she looks kinda cute.",
      es: "The Narrator tells you she will end the world. You have a pristine blade, and a voice in your head saying she looks kinda cute.",
      de: "The Narrator tells you she will end the world. You have a pristine blade, and a voice in your head saying she looks kinda cute.",
      ja: "The Narrator tells you she will end the world. You have a pristine blade, and a voice in your head saying she looks kinda cute.",
      'pt-BR': "The Narrator tells you she will end the world. You have a pristine blade, and a voice in your head saying she looks kinda cute."
    },
    redactedText: {
      fr: "Le Narrateur vous ordonne d'éliminer la captive dans la cabane. Vous avez une lame immaculée et des voix qui se disputent vos choix.",
      en: "The Narrator orders you to end the captive in the basement. You carry a pristine blade and arguing voices inside your mind.",
      es: "The Narrator orders you to end the captive in the basement. You carry a pristine blade and arguing voices inside your mind.",
      de: "The Narrator orders you to end the captive in the basement. You carry a pristine blade and arguing voices inside your mind.",
      ja: "The Narrator orders you to end the captive in the basement. You carry a pristine blade and arguing voices inside your mind.",
      'pt-BR': "The Narrator orders you to end the captive in the basement. You carry a pristine blade and arguing voices inside your mind."
    }
  },
  {
    gameId: 'enter-the-gungeon',
    author: 'HighDragunSlayer',
    hoursPlayed: 220.1,
    reviewDate: '15 avril 2016',
    fullFr: "Un pistolet qui tire des balles qui tirent elles-mêmes des flingues qui tirent des projectiles. Esquiver en roulade sur des tables renversées.",
    fullEn: "A gun that shoots bullets that shoot smaller guns that shoot bullets. Dodge-rolling through flying lead while flipping tables.",
    redactedFr: "Une arme qui tire des balles qui tirent d'autres armes. Enchaîner les roulades d'invincibilité à travers des rideaux de plombs colorés.",
    redactedEn: "A firearm shooting projectiles that fire smaller weapons. Chaining invulnerability dodge-rolls across intricate bullet hell patterns.",
    fullText: {
      fr: "Un pistolet qui tire des balles qui tirent elles-mêmes des flingues qui tirent des projectiles. Esquiver en roulade sur des tables renversées.",
      en: "A gun that shoots bullets that shoot smaller guns that shoot bullets. Dodge-rolling through flying lead while flipping tables.",
      es: "A gun that shoots bullets that shoot smaller guns that shoot bullets. Dodge-rolling through flying lead while flipping tables.",
      de: "A gun that shoots bullets that shoot smaller guns that shoot bullets. Dodge-rolling through flying lead while flipping tables.",
      ja: "A gun that shoots bullets that shoot smaller guns that shoot bullets. Dodge-rolling through flying lead while flipping tables.",
      'pt-BR': "A gun that shoots bullets that shoot smaller guns that shoot bullets. Dodge-rolling through flying lead while flipping tables."
    },
    redactedText: {
      fr: "Une arme qui tire des balles qui tirent d'autres armes. Enchaîner les roulades d'invincibilité à travers des rideaux de plombs colorés.",
      en: "A firearm shooting projectiles that fire smaller weapons. Chaining invulnerability dodge-rolls across intricate bullet hell patterns.",
      es: "A firearm shooting projectiles that fire smaller weapons. Chaining invulnerability dodge-rolls across intricate bullet hell patterns.",
      de: "A firearm shooting projectiles that fire smaller weapons. Chaining invulnerability dodge-rolls across intricate bullet hell patterns.",
      ja: "A firearm shooting projectiles that fire smaller weapons. Chaining invulnerability dodge-rolls across intricate bullet hell patterns.",
      'pt-BR': "A firearm shooting projectiles that fire smaller weapons. Chaining invulnerability dodge-rolls across intricate bullet hell patterns."
    }
  },
  {
    gameId: 'ultrakill',
    author: 'JudgementDayV1',
    hoursPlayed: 185,
    reviewDate: '12 septembre 2020',
    fullFr: "L'humanité est morte. Le sang est du carburant. Les Enfers sont pleins. Jeter une pièce de monnaie en l'air et lui tirer dessus au revolver.",
    fullEn: "Mankind is dead. Blood is fuel. Hell is full. Tossing a coin in mid-air and ricocheting a revolver bullet into five demons.",
    redactedFr: "L'humanité est morte. Le sang est du carburant. Les Enfers sont pleins. Lancer une pièce en l'air et faire ricocher un tir de revolver.",
    redactedEn: "Mankind is dead. Blood is fuel. Hell is full. Flipping a coin into the air and bouncing a revolver shot off it.",
    fullText: {
      fr: "L'humanité est morte. Le sang est du carburant. Les Enfers sont pleins. Jeter une pièce de monnaie en l'air et lui tirer dessus au revolver.",
      en: "Mankind is dead. Blood is fuel. Hell is full. Tossing a coin in mid-air and ricocheting a revolver bullet into five demons.",
      es: "Mankind is dead. Blood is fuel. Hell is full. Tossing a coin in mid-air and ricocheting a revolver bullet into five demons.",
      de: "Mankind is dead. Blood is fuel. Hell is full. Tossing a coin in mid-air and ricocheting a revolver bullet into five demons.",
      ja: "Mankind is dead. Blood is fuel. Hell is full. Tossing a coin in mid-air and ricocheting a revolver bullet into five demons.",
      'pt-BR': "Mankind is dead. Blood is fuel. Hell is full. Tossing a coin in mid-air and ricocheting a revolver bullet into five demons."
    },
    redactedText: {
      fr: "L'humanité est morte. Le sang est du carburant. Les Enfers sont pleins. Lancer une pièce en l'air et faire ricocher un tir de revolver.",
      en: "Mankind is dead. Blood is fuel. Hell is full. Flipping a coin into the air and bouncing a revolver shot off it.",
      es: "Mankind is dead. Blood is fuel. Hell is full. Flipping a coin into the air and bouncing a revolver shot off it.",
      de: "Mankind is dead. Blood is fuel. Hell is full. Flipping a coin into the air and bouncing a revolver shot off it.",
      ja: "Mankind is dead. Blood is fuel. Hell is full. Flipping a coin into the air and bouncing a revolver shot off it.",
      'pt-BR': "Mankind is dead. Blood is fuel. Hell is full. Flipping a coin into the air and bouncing a revolver shot off it."
    }
  },
  {
    gameId: 'blasphemous',
    author: 'CustodiaPenitent',
    hoursPlayed: 64.7,
    reviewDate: '18 septembre 2019',
    fullFr: "Que ton cœur soit lourd, Pénitent. Une Espagne médiévale torturée, des coups de parade sanglants et un casque en pointe conique.",
    fullEn: "Sorrowful be the heart, Penitent One. A twisted dark fantasy nightmare, visceral sword parries, and a thorned cone helmet.",
    redactedFr: "Que ton cœur soit lourd, Pénitent. Une contrée médiévale sous le joug du Miracle, des exécutions sanglantes et l'épée Mea Culpa.",
    redactedEn: "Sorrowful be the heart, Penitent One. A land cursed by the Miracle, visceral executions, and the Mea Culpa blade.",
    fullText: {
      fr: "Que ton cœur soit lourd, Pénitent. Une Espagne médiévale torturée, des coups de parade sanglants et un casque en pointe conique.",
      en: "Sorrowful be the heart, Penitent One. A twisted dark fantasy nightmare, visceral sword parries, and a thorned cone helmet.",
      es: "Sorrowful be the heart, Penitent One. A twisted dark fantasy nightmare, visceral sword parries, and a thorned cone helmet.",
      de: "Sorrowful be the heart, Penitent One. A twisted dark fantasy nightmare, visceral sword parries, and a thorned cone helmet.",
      ja: "Sorrowful be the heart, Penitent One. A twisted dark fantasy nightmare, visceral sword parries, and a thorned cone helmet.",
      'pt-BR': "Sorrowful be the heart, Penitent One. A twisted dark fantasy nightmare, visceral sword parries, and a thorned cone helmet."
    },
    redactedText: {
      fr: "Que ton cœur soit lourd, Pénitent. Une contrée médiévale sous le joug du Miracle, des exécutions sanglantes et l'épée Mea Culpa.",
      en: "Sorrowful be the heart, Penitent One. A land cursed by the Miracle, visceral executions, and the Mea Culpa blade.",
      es: "Sorrowful be the heart, Penitent One. A land cursed by the Miracle, visceral executions, and the Mea Culpa blade.",
      de: "Sorrowful be the heart, Penitent One. A land cursed by the Miracle, visceral executions, and the Mea Culpa blade.",
      ja: "Sorrowful be the heart, Penitent One. A land cursed by the Miracle, visceral executions, and the Mea Culpa blade.",
      'pt-BR': "Sorrowful be the heart, Penitent One. A land cursed by the Miracle, visceral executions, and the Mea Culpa blade."
    }
  },
  {
    gameId: 'ori-and-the-blind-forest',
    author: 'SpiritTreeGuardian',
    hoursPlayed: 28.4,
    reviewDate: '18 mars 2015',
    fullFr: "J'ai pleuré pendant le prologue de dix minutes. La fluidité des déplacements dans la forêt de Nibel et la bande-son symphonique sont inoubliables.",
    fullEn: "Cried during the first ten minutes. Fluid acrobatic platforming across the forest of Nibel paired with a majestic orchestral soundtrack.",
    redactedFr: "J'ai pleuré pendant le prologue de dix minutes. La grâce acrobatique du petit esprit lumineux dans la forêt de Nibel est bouleversante.",
    redactedEn: "Cried during the first ten minutes. The acrobatic grace of the glowing white guardian through Nibel is breathtaking.",
    fullText: {
      fr: "J'ai pleuré pendant le prologue de dix minutes. La fluidité des déplacements dans la forêt de Nibel et la bande-son symphonique sont inoubliables.",
      en: "Cried during the first ten minutes. Fluid acrobatic platforming across the forest of Nibel paired with a majestic orchestral soundtrack.",
      es: "Cried during the first ten minutes. Fluid acrobatic platforming across the forest of Nibel paired with a majestic orchestral soundtrack.",
      de: "Cried during the first ten minutes. Fluid acrobatic platforming across the forest of Nibel paired with a majestic orchestral soundtrack.",
      ja: "Cried during the first ten minutes. Fluid acrobatic platforming across the forest of Nibel paired with a majestic orchestral soundtrack.",
      'pt-BR': "Cried during the first ten minutes. Fluid acrobatic platforming across the forest of Nibel paired with a majestic orchestral soundtrack."
    },
    redactedText: {
      fr: "J'ai pleuré pendant le prologue de dix minutes. La grâce acrobatique du petit esprit lumineux dans la forêt de Nibel est bouleversante.",
      en: "Cried during the first ten minutes. The acrobatic grace of the glowing white guardian through Nibel is breathtaking.",
      es: "Cried during the first ten minutes. The acrobatic grace of the glowing white guardian through Nibel is breathtaking.",
      de: "Cried during the first ten minutes. The acrobatic grace of the glowing white guardian through Nibel is breathtaking.",
      ja: "Cried during the first ten minutes. The acrobatic grace of the glowing white guardian through Nibel is breathtaking.",
      'pt-BR': "Cried during the first ten minutes. The acrobatic grace of the glowing white guardian through Nibel is breathtaking."
    }
  },
  {
    gameId: 'frostpunk',
    author: 'CoalGeneratorStoker',
    hoursPlayed: 88,
    reviewDate: '29 avril 2018',
    fullFr: "La ville doit survivre. Il fait -80°C. J'ai envoyé les enfants travailler dans les mines de charbon et servi de la soupe à la sciure de bois.",
    fullEn: "The city must survive. It's -80°C outside. Put children to work in the coal mines and fed everyone sawdust soup around the Generator.",
    redactedFr: "La dernière ville sur Terre doit survivre. Le thermomètre affiche -80°C. Faire fonctionner le grand générateur de chaleur à tout prix.",
    redactedEn: "The last city on Earth must survive. The temperature drops to -80°C. Keeping the central coal generator roaring at any moral cost.",
    fullText: {
      fr: "La ville doit survivre. Il fait -80°C. J'ai envoyé les enfants travailler dans les mines de charbon et servi de la soupe à la sciure de bois.",
      en: "The city must survive. It's -80°C outside. Put children to work in the coal mines and fed everyone sawdust soup around the Generator.",
      es: "The city must survive. It's -80°C outside. Put children to work in the coal mines and fed everyone sawdust soup around the Generator.",
      de: "The city must survive. It's -80°C outside. Put children to work in the coal mines and fed everyone sawdust soup around the Generator.",
      ja: "The city must survive. It's -80°C outside. Put children to work in the coal mines and fed everyone sawdust soup around the Generator.",
      'pt-BR': "The city must survive. It's -80°C outside. Put children to work in the coal mines and fed everyone sawdust soup around the Generator."
    },
    redactedText: {
      fr: "La dernière ville sur Terre doit survivre. Le thermomètre affiche -80°C. Faire fonctionner le grand générateur de chaleur à tout prix.",
      en: "The last city on Earth must survive. The temperature drops to -80°C. Keeping the central coal generator roaring at any moral cost.",
      es: "The last city on Earth must survive. The temperature drops to -80°C. Keeping the central coal generator roaring at any moral cost.",
      de: "The last city on Earth must survive. The temperature drops to -80°C. Keeping the central coal generator roaring at any moral cost.",
      ja: "The last city on Earth must survive. The temperature drops to -80°C. Keeping the central coal generator roaring at any moral cost.",
      'pt-BR': "The last city on Earth must survive. The temperature drops to -80°C. Keeping the central coal generator roaring at any moral cost."
    }
  },
  {
    gameId: 'signalis',
    author: 'ElsterReplika',
    hoursPlayed: 32.1,
    reviewDate: '1er novembre 2022',
    fullFr: "N'oublie pas notre promesse. Survival horror rétro avec des androïdes, des énigmes d'inventaire à 6 cases et une terreur cosmique glaciale.",
    fullEn: "Remember our promise. Retro survival horror with replikas, 6-slot inventory puzzles, and haunting cosmic dread.",
    redactedFr: "N'oublie pas notre promesse. Un chef-d'œuvre de survival horror avec des replikas amnésiques et la fréquence radio 512.",
    redactedEn: "Remember our promise. A retro survival horror masterpiece featuring replika androids and radio frequency 512.",
    fullText: {
      fr: "N'oublie pas notre promesse. Survival horror rétro avec des androïdes, des énigmes d'inventaire à 6 cases et une terreur cosmique glaciale.",
      en: "Remember our promise. Retro survival horror with replikas, 6-slot inventory puzzles, and haunting cosmic dread.",
      es: "Remember our promise. Retro survival horror with replikas, 6-slot inventory puzzles, and haunting cosmic dread.",
      de: "Remember our promise. Retro survival horror with replikas, 6-slot inventory puzzles, and haunting cosmic dread.",
      ja: "Remember our promise. Retro survival horror with replikas, 6-slot inventory puzzles, and haunting cosmic dread.",
      'pt-BR': "Remember our promise. Retro survival horror with replikas, 6-slot inventory puzzles, and haunting cosmic dread."
    },
    redactedText: {
      fr: "N'oublie pas notre promesse. Un chef-d'œuvre de survival horror avec des replikas amnésiques et la fréquence radio 512.",
      en: "Remember our promise. A retro survival horror masterpiece featuring replika androids and radio frequency 512.",
      es: "Remember our promise. A retro survival horror masterpiece featuring replika androids and radio frequency 512.",
      de: "Remember our promise. A retro survival horror masterpiece featuring replika androids and radio frequency 512.",
      ja: "Remember our promise. A retro survival horror masterpiece featuring replika androids and radio frequency 512.",
      'pt-BR': "Remember our promise. A retro survival horror masterpiece featuring replika androids and radio frequency 512."
    }
  },
  {
    gameId: 'omori',
    author: 'WhiteSpaceDreamer',
    hoursPlayed: 68.2,
    reviewDate: '30 décembre 2020',
    fullFr: "Vous attendez que quelque chose se produise ? Un monde onirique pastel avec vos meilleurs amis qui cache une vérité profondément bouleversante.",
    fullEn: "Waiting for something to happen? A surreal pastel dreamscape with childhood friends hiding an emotionally devastating truth.",
    redactedFr: "Vous attendez que quelque chose se produise ? Une virée poétique avec Aubrey, Kel et Hero qui cache une tragédie déchirante.",
    redactedEn: "Waiting for something to happen? A pastel adventure with Aubrey, Kel, and Hero hiding a heartbreaking truth.",
    fullText: {
      fr: "Vous attendez que quelque chose se produise ? Un monde onirique pastel avec vos meilleurs amis qui cache une vérité profondément bouleversante.",
      en: "Waiting for something to happen? A surreal pastel dreamscape with childhood friends hiding an emotionally devastating truth.",
      es: "Waiting for something to happen? A surreal pastel dreamscape with childhood friends hiding an emotionally devastating truth.",
      de: "Waiting for something to happen? A surreal pastel dreamscape with childhood friends hiding an emotionally devastating truth.",
      ja: "Waiting for something to happen? A surreal pastel dreamscape with childhood friends hiding an emotionally devastating truth.",
      'pt-BR': "Waiting for something to happen? A surreal pastel dreamscape with childhood friends hiding an emotionally devastating truth."
    },
    redactedText: {
      fr: "Vous attendez que quelque chose se produise ? Une virée poétique avec Aubrey, Kel et Hero qui cache une tragédie déchirante.",
      en: "Waiting for something to happen? A pastel adventure with Aubrey, Kel, and Hero hiding a heartbreaking truth.",
      es: "Waiting for something to happen? A pastel adventure with Aubrey, Kel, and Hero hiding a heartbreaking truth.",
      de: "Waiting for something to happen? A pastel adventure with Aubrey, Kel, and Hero hiding a heartbreaking truth.",
      ja: "Waiting for something to happen? A pastel adventure with Aubrey, Kel, and Hero hiding a heartbreaking truth.",
      'pt-BR': "Waiting for something to happen? A pastel adventure with Aubrey, Kel, and Hero hiding a heartbreaking truth."
    }
  },
  {
    gameId: 'overcooked-2',
    author: 'OnionKingdomChef',
    hoursPlayed: 75.3,
    reviewDate: '12 août 2018',
    fullFr: "La cuisine est en feu, les assiettes s'empilent, quelqu'un a jeté un steak cru dans l'eau et notre amitié de dix ans vient de prendre fin.",
    fullEn: "The kitchen is ablaze, dirty dishes are piling up, someone threw raw meat into the river, and our ten-year friendship is officially over.",
    redactedFr: "La cuisine est en feu, les assiettes sales s'empilent, quelqu'un a envoyé le plat par-dessus bord et notre équipe de cuistots s'entre-déchire.",
    redactedEn: "The kitchen is ablaze, dirty dishes are piling up, someone tossed the order off the hot air balloon, and the kitchen erupted into chaos.",
    fullText: {
      fr: "La cuisine est en feu, les assiettes s'empilent, quelqu'un a jeté un steak cru dans l'eau et notre amitié de dix ans vient de prendre fin.",
      en: "The kitchen is ablaze, dirty dishes are piling up, someone threw raw meat into the river, and our ten-year friendship is officially over.",
      es: "The kitchen is ablaze, dirty dishes are piling up, someone threw raw meat into the river, and our ten-year friendship is officially over.",
      de: "The kitchen is ablaze, dirty dishes are piling up, someone threw raw meat into the river, and our ten-year friendship is officially over.",
      ja: "The kitchen is ablaze, dirty dishes are piling up, someone threw raw meat into the river, and our ten-year friendship is officially over.",
      'pt-BR': "The kitchen is ablaze, dirty dishes are piling up, someone threw raw meat into the river, and our ten-year friendship is officially over."
    },
    redactedText: {
      fr: "La cuisine est en feu, les assiettes sales s'empilent, quelqu'un a envoyé le plat par-dessus bord et notre équipe de cuistots s'entre-déchire.",
      en: "The kitchen is ablaze, dirty dishes are piling up, someone tossed the order off the hot air balloon, and the kitchen erupted into chaos.",
      es: "The kitchen is ablaze, dirty dishes are piling up, someone tossed the order off the hot air balloon, and the kitchen erupted into chaos.",
      de: "The kitchen is ablaze, dirty dishes are piling up, someone tossed the order off the hot air balloon, and the kitchen erupted into chaos.",
      ja: "The kitchen is ablaze, dirty dishes are piling up, someone tossed the order off the hot air balloon, and the kitchen erupted into chaos.",
      'pt-BR': "The kitchen is ablaze, dirty dishes are piling up, someone tossed the order off the hot air balloon, and the kitchen erupted into chaos."
    }
  },
  {
    gameId: 'chained-together',
    author: 'HellEscaper_01',
    hoursPlayed: 24.5,
    reviewDate: '28 juin 2024',
    fullFr: "Enchaînés par les bras en enfer. Mon pote a sauté une demi-seconde trop tôt, nous a tous entraînés dans la lave et on a crié pendant 3 heures.",
    fullEn: "Chained together climbing out of hell. My teammate jumped a fraction of a second too early, dragged us all into lava, and we screamed.",
    redactedFr: "Liés les uns aux autres par une chaîne incassable pour remonter des Enfers. Un saut raté et tout le groupe est entraîné dans le vide.",
    redactedEn: "Bound together by an unbreakable chain to climb out of the underworld. One mistimed leap drags the entire squad into the abyss.",
    fullText: {
      fr: "Enchaînés par les bras en enfer. Mon pote a sauté une demi-seconde trop tôt, nous a tous entraînés dans la lave et on a crié pendant 3 heures.",
      en: "Chained together climbing out of hell. My teammate jumped a fraction of a second too early, dragged us all into lava, and we screamed.",
      es: "Chained together climbing out of hell. My teammate jumped a fraction of a second too early, dragged us all into lava, and we screamed.",
      de: "Chained together climbing out of hell. My teammate jumped a fraction of a second too early, dragged us all into lava, and we screamed.",
      ja: "Chained together climbing out of hell. My teammate jumped a fraction of a second too early, dragged us all into lava, and we screamed.",
      'pt-BR': "Chained together climbing out of hell. My teammate jumped a fraction of a second too early, dragged us all into lava, and we screamed."
    },
    redactedText: {
      fr: "Liés les uns aux autres par une chaîne incassable pour remonter des Enfers. Un saut raté et tout le groupe est entraîné dans le vide.",
      en: "Bound together by an unbreakable chain to climb out of the underworld. One mistimed leap drags the entire squad into the abyss.",
      es: "Bound together by an unbreakable chain to climb out of the underworld. One mistimed leap drags the entire squad into the abyss.",
      de: "Bound together by an unbreakable chain to climb out of the underworld. One mistimed leap drags the entire squad into the abyss.",
      ja: "Bound together by an unbreakable chain to climb out of the underworld. One mistimed leap drags the entire squad into the abyss.",
      'pt-BR': "Bound together by an unbreakable chain to climb out of the underworld. One mistimed leap drags the entire squad into the abyss."
    }
  },
];

// Simple deterministic hash
function stringToHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Mulberry32 PRNG
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildClues(game: Game): ReviewClue[] {
  // Clue 1: Genre & perspective
  const clue1: ReviewClue = {
    labelFr: 'Genres & Caméra',
    labelEn: 'Genres & Camera',
    valueFr: `${game.genre.slice(0, 3).join(', ')} • ${game.camera.fr}`,
    valueEn: `${game.genre.slice(0, 3).join(', ')} • ${game.camera.en}`,
  };

  // Clue 2: Release period window
  const minYear = Math.max(2005, game.releaseYear - 2);
  const maxYear = Math.min(new Date().getFullYear(), game.releaseYear + 2);
  const clue2: ReviewClue = {
    labelFr: 'Période de Sortie',
    labelEn: 'Release Window',
    valueFr: `Entre ${minYear} et ${maxYear}`,
    valueEn: `Between ${minYear} and ${maxYear}`,
  };

  // Clue 3: Art style & exact year
  const clue3: ReviewClue = {
    labelFr: 'Année & Style Artistique',
    labelEn: 'Year & Art Style',
    valueFr: `${game.releaseYear} • ${game.artStyle.fr}`,
    valueEn: `${game.releaseYear} • ${game.artStyle.en}`,
  };

  // Clue 4: Developer Studio
  const clue4: ReviewClue = {
    labelFr: 'Studio Développeur',
    labelEn: 'Developer Studio',
    valueFr: game.developer,
    valueEn: game.developer,
  };

  // Clue 5: Tagline
  const clue5: ReviewClue = {
    labelFr: "Phrase d'accroche",
    labelEn: 'Tagline',
    valueFr: `« ${game.hints.tagline.fr} »`,
    valueEn: `"${game.hints.tagline.en}"`,
  };

  return [clue1, clue2, clue3, clue4, clue5];
}

/**
 * Génère ou récupère une critique pour un jeu cible
 */
function createReviewForGame(game: Game, rand: () => number): {
  author: string;
  hoursPlayed: number;
  reviewDate: string;
  fullFr: string;
  fullEn: string;
  redactedFr: string;
  redactedEn: string;
  fullText?: LocalizedText;
  redactedText?: LocalizedText;
} {
  const curated = CURATED_REVIEWS.find((r) => r.gameId === game.id);
  if (curated) {
    return curated;
  }

  // Fallback haute qualité dérivé des vraies métadonnées officielles Steam du jeu
  const authors = ['SteamGamer_FR', 'IndieOwl_99', 'PixelKnight', 'RetroExplorer', 'MidnightPlayer'];
  const author = authors[Math.floor(rand() * authors.length)];
  const hoursPlayed = Number((15 + rand() * 120).toFixed(1));
  const reviewYear = Math.min(new Date().getFullYear(), game.releaseYear + Math.floor(rand() * 2));
  const reviewDate = `14 octobre ${reviewYear}`;

  const genres = game.genre.slice(0, 2).join(' et ');
  const fullFr = `Un jeu indé remarquable alliant ${genres} avec une patte ${game.artStyle.fr}. La direction artistique et le gameplay développé par ${game.developer} sont d'une finesse exemplaire.`;
  const fullEn = `A remarkable indie title combining ${genres} with a ${game.artStyle.en} visual style. The art direction and gameplay crafted by ${game.developer} are pure gold.`;

  const redactedFr = `Un jeu indé remarquable alliant ${genres} avec une patte ${game.artStyle.fr}. La direction artistique et le gameplay développé par ████████ sont d'une finesse exemplaire.`;
  const redactedEn = `A remarkable indie title combining ${genres} with a ${game.artStyle.en} visual style. The art direction and gameplay crafted by ████████ are pure gold.`;

  const fullText: LocalizedText = {
    fr: fullFr,
    en: fullEn,
    es: `Un juego indie extraordinario que combina ${genres} con un estilo visual ${game.artStyle.es || game.artStyle.en}. La dirección artística y la jugabilidad creadas por ${game.developer} son de primera calidad.`,
    de: `Ein bemerkenswerter Indie-Titel, der ${genres} mit einem Grafikstil in ${game.artStyle.de || game.artStyle.en} vereint. Art-Design und Gameplay von ${game.developer} sind meisterhaft.`,
    ja: `${genres}と${game.artStyle.ja || game.artStyle.en}の視覚表現が見事に融合した傑作インディー。${game.developer}が紡ぎ出すアートとゲーム性はまさに至高の域。`,
    'pt-BR': `Um jogo indie notável combinando ${genres} com estilo visual ${game.artStyle['pt-BR'] || game.artStyle.en}. A direção de arte e a jogabilidade de ${game.developer} são puro ouro.`
  };

  const redactedText: LocalizedText = {
    fr: redactedFr,
    en: redactedEn,
    es: `Un juego indie extraordinario que combina ${genres} con un estilo visual ${game.artStyle.es || game.artStyle.en}. La dirección artística y la jugabilidad creadas por ████████ son de primera calidad.`,
    de: `Ein bemerkenswerter Indie-Titel, der ${genres} mit einem Grafikstil in ${game.artStyle.de || game.artStyle.en} vereint. Art-Design und Gameplay von ████████ sind meisterhaft.`,
    ja: `${genres}と${game.artStyle.ja || game.artStyle.en}の美学が融合した傑作インディー。████████が手掛けるアートとゲーム性は至高の域。`,
    'pt-BR': `Um jogo indie notável combinando ${genres} com estilo visual ${game.artStyle['pt-BR'] || game.artStyle.en}. A direção de arte e a jogabilidade de ████████ são puro ouro.`
  };

  return {
    author,
    hoursPlayed,
    reviewDate,
    fullFr,
    fullEn,
    redactedFr,
    redactedEn,
    fullText,
    redactedText,
  };
}

/**
 * Génère le puzzle Review quotidien pour une date donnée (YYYY-MM-DD)
 */
export function getDailyReviewPuzzle(dateString: string): ReviewPuzzle {
  const seed = stringToHash(`review_puzzle_${dateString}`);
  const rand = mulberry32(seed);

  // 95% du temps, privilégier un jeu qui dispose d'une critique rédigée aux petits oignons
  const curatedIds = CURATED_REVIEWS.map((r) => r.gameId);
  const eligibleGames = INDIE_GAMES.filter((g) => curatedIds.includes(g.id));

  let targetGame: Game;
  if (eligibleGames.length > 0 && rand() < 0.95) {
    const idx = Math.floor(rand() * eligibleGames.length);
    targetGame = eligibleGames[idx];
  } else {
    const pool = getActiveDailyPool();
    const idx = Math.floor(rand() * pool.length);
    targetGame = pool[idx];
  }

  const revData = createReviewForGame(targetGame, rand);
  const clues = buildClues(targetGame);

  return {
    id: `review_${dateString}`,
    date: dateString,
    targetGame,
    author: revData.author,
    hoursPlayed: revData.hoursPlayed,
    isRecommended: true,
    reviewDate: revData.reviewDate,
    redactedReviewFr: revData.redactedFr,
    redactedReviewEn: revData.redactedEn,
    fullReviewFr: revData.fullFr,
    fullReviewEn: revData.fullEn,
    fullText: revData.fullText || { fr: revData.fullFr, en: revData.fullEn },
    redactedText: revData.redactedText || { fr: revData.redactedFr, en: revData.redactedEn },
    clues,
  };
}

/**
 * Génère un puzzle Review aléatoire pour le mode entraînement illimité
 */
export function getRandomReviewPuzzle(seedSuffix = Date.now().toString()): ReviewPuzzle {
  const seed = stringToHash(`review_rand_${seedSuffix}`);
  const rand = mulberry32(seed);

  const curatedIds = CURATED_REVIEWS.map((r) => r.gameId);
  const eligibleGames = INDIE_GAMES.filter((g) => curatedIds.includes(g.id));

  let targetGame: Game;
  if (eligibleGames.length > 0 && rand() < 0.95) {
    const idx = Math.floor(rand() * eligibleGames.length);
    targetGame = eligibleGames[idx];
  } else {
    const pool = getActiveDailyPool();
    const idx = Math.floor(rand() * pool.length);
    targetGame = pool[idx];
  }

  const revData = createReviewForGame(targetGame, rand);
  const clues = buildClues(targetGame);

  return {
    id: `review_random_${seedSuffix}`,
    targetGame,
    author: revData.author,
    hoursPlayed: revData.hoursPlayed,
    isRecommended: true,
    reviewDate: revData.reviewDate,
    redactedReviewFr: revData.redactedFr,
    redactedReviewEn: revData.redactedEn,
    fullReviewFr: revData.fullFr,
    fullReviewEn: revData.fullEn,
    clues,
  };
}
