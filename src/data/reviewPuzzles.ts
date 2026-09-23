import { INDIE_GAMES } from './games';
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

  // 80% du temps, privilégier un jeu qui dispose d'une critique rédigée aux petits oignons
  const curatedIds = CURATED_REVIEWS.map((r) => r.gameId);
  const eligibleGames = INDIE_GAMES.filter((g) => curatedIds.includes(g.id));

  let targetGame: Game;
  if (eligibleGames.length > 0 && rand() < 0.85) {
    const idx = Math.floor(rand() * eligibleGames.length);
    targetGame = eligibleGames[idx];
  } else {
    const idx = Math.floor(rand() * INDIE_GAMES.length);
    targetGame = INDIE_GAMES[idx];
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
  if (eligibleGames.length > 0 && rand() < 0.85) {
    const idx = Math.floor(rand() * eligibleGames.length);
    targetGame = eligibleGames[idx];
  } else {
    const idx = Math.floor(rand() * INDIE_GAMES.length);
    targetGame = INDIE_GAMES[idx];
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
