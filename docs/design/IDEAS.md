# 💡 Boîte à Idées — Hoot Indie Games

> Document de centralisation, de réflexion et de feuille de route créative pour les futures évolutions et fonctionnalités de **Hoot Indie Games**.

---

## 👤 1. Page de Profil Dédiée & Personnalisation Avancée (Priorité)

### 🎯 Constat actuel
Aujourd'hui, le profil joueur réside entièrement dans une modale (`ProfileModal.tsx`). Même si elle est très complète (stats, audio, inventaire, Steam), l'expérience gagnerait énormément à proposer une véritable **page dédiée** (pleine page) et un **profil public visitable**.

### 🌟 Fonctionnalités Clés

#### A. Vue Pleine Page & Profils Publics
- **URL dédiée / Partageable** : Accès direct via `/profile` (son propre profil) ou `/u/[pseudo]` (profil public d'un autre joueur ou de soi-même).
- **Consultation depuis le Tchat & les Classements** : Pouvoir cliquer sur un joueur dans le Perchoir, les classements ou la liste d'amis pour visiter sa page de profil complète.
- **Mode Privé / Public** : Option permettant au joueur de choisir les éléments visibles (collection masquée, stats privées, etc.).

#### B. Personnalisation Visuelle & Cosmétiques
- **Bannières de Profil Personnalisées** :
  - Fonds d'en-tête artistiques à débloquer (illustrations thématiques de pépites indé, fonds animés CSS/canvas, ambiance Sylvestre, Sanctuaire nocturne, néon rétro).
  - Achat de bannières exclusives dans la boutique de plumes d'or.
- **Cadres d'Avatar & Effets d'Aura** :
  - Poursuivre et enrichir les cadres (actuels cadres en bois, or céleste...) avec des auras animées (particules lumineuses, flammes pixel-art, brume mystique).
- **Vitrine de Cartes ("Showcase")** :
  - Emplacement pour épingler ses **3 à 5 cartes préférées** (notamment les cartes Holo rares du Sanctuaire).
  - Présentation façon présentoir de musée ou classeur ouvert.
- **Pépites Indé Favorites ("Top 4")** :
  - Sélectionner ses 4 jeux indépendants coups de cœur du Panthéon ou du catalogue Steam.
  - Affiche les jaquettes avec le temps de jeu Steam ou les avis du joueur.
- **Biographie & Badge Personnalisé** :
  - Champ de statut / bio (avec filtre anti-spam/modération).
  - Titres honorifiques équipables avec typographie spéciale.
- **Thème Visuel & Ambiance Sonore du Profil** :
  - Possibilité de définir un thème d'accent (Couleur dominante du profil).
  - Musique d'ambiance de profil (choix parmi les thèmes OST du sanctuaire débloqués).

#### C. Statistiques & Progression Détaillée
- **Radar de compétences & Genres favoris** (Rogue-like, Metroidvania, Puzzle, Rétro...).
- **Historique de duels Versus 1v1** : Ratio victoires/défaites, série maximale, adversaires fréquents.
- **Progression de l'Odyssée** : Biome le plus profond exploré, reliques trouvées.
- **Trophées & Jalons visuels** : Affichage sous forme de médailles en vitrine.

---

## 🃏 2. Cartes & Économie du Sanctuaire

- **Système de fabrication / Recyclage (Crafting)** :
  - Pouvoir recycler ses doublons de cartes communes contre de la "Poussière d'étoile" ou des plumes d'or pour forger une carte manquante ciblée.
- **Marché aux Cartes / Enchères douces** :
  - Déposer des offres d'échange asynchrones visibles par toute la communauté ("Je cherche Celeste Holo contre Hollow Knight Holo").
- **Cartes Événementielles / Saisonières** :
  - Cartes éphémères lors d'événements spéciaux (Halloween, Noël, Fête des Indés, Steam Sales).

---

- **Mini-Jeu de Bataille de Cartes (Inspiré de "Triple Triad" ou Duel d'Attributs)** :
  - Donner une utilité ludique aux cartes de collection ! 
  - Chaque carte possède des caractéristiques (Année de sortie, Rareté, Nombre d'avis Steam, Score Metacritic, Complexité).
  - Duel rapide 1v1 ou contre une IA Hibou avec 5 cartes par manche.
- **Fusion & Alchimie Sylvestre** :
  - Fusionner 3 doublons d'un même univers ou studio pour tenter de débloquer une variante Holo ou une carte dorée d'archive.
- **Sets & Albums Thématiques à Compléter** :
  - Exemples : *"L'Âge d'Or du Pixel"*, *"Les Légendes du Rogue-lite"*, *"Pépites Métroidvania"*.
  - Compléter une page d'album débloque un cosmétique exclusif (cadre d'avatar, titre unique, bannière de profil).

---

## 💬 3. Communauté & Multijoueur

- **Salons Multijoueurs à Plusieurs (Perchoir Party / Battle Royale 4 à 8 joueurs)** :
  - Étendre le 1v1 actuel à des salons de mini-jeux en temps réel (BlindTest collectif, Pixel Battle en direct où le premier qui buzz gagne).
- **Système de "Volées" (Guildes / Clubs de joueurs)** :
  - Créer ou rejoindre une Volée (ex: *L'Ordre des Roguelikes*, *Les Archéologues du Rétro*).
  - Cagnotte de plumes collective et défi hebdomadaire de guilde.
- **Livre d'or & "Perchoir des Visiteurs" sur les Profils** :
  - Pouvoir visiter le profil d'un ami et lui laisser une plume dorée d'encouragement ou un petit mot prédéfini.
- **Défis Amis Asynchrones** :
  - Défier un ami sur le mini-jeu du jour (ex: battre son score au Pixel Sprint ou BlindTest).
- **Salons personnalisés Versus** :
  - Choix des règles dans l'Arène 1v1 (sélection des modes joués, nombre de manches, timer ajustable).
- **Mentions & Notifications dans le Tchat** :
  - Pouvoir taguer `@joueur` dans le Perchoir et recevoir un son/indicateur discret.

---

## 🎮 4. Mini-Jeux, Odyssée & Découverte Indé

- **Boss Mondial Coopératif de l'Odyssée (World Boss Hebdomadaire)** :
  - Un titan corrompu apparaît chaque dimanche dans le Sanctuaire.
  - Chaque session d'Odyssée jouée par n'importe quel joueur inflige des dégâts au boss commun. Si la communauté le terrasse avant minuit, tout le monde reçoit un booster rare !
- **BlindTest / Audio Rush en Direct** :
  - Version ultra-rapide façon Heardle : 1 seconde d'extrait pour deviner, puis 2 secondes, etc.
- **Compteur Communautaire "Wishlists Développeurs"** :
  - Mettre en valeur l'impact du site : afficher un compteur *"1 450 jeux indés ajoutés à la Wishlist Steam grâce aux Hiboux"*.
  - Mini-bouton en 1 clic pour ouvrir la fiche Steam directement.
- **Micro-Critiques du Perchoir** :
  - Permettre aux joueurs de poster une phrase de recommandation sincère ("La raison pour laquelle vous devez y jouer") sous chaque fiche de jeu.
- **Mode Quotidien "Grand Chelem" (All-in-One)** :
  - Enchaîner tous les jeux quotidiens d'une traite avec un récapitulatif graphique partageable (style grille Wordle).

---

## 🎧 5. Ambiance, Immersion & Confort (UX)

- **Lecteur Radio Lofi / Chiptune Flottant ("La Fréquence du Sanctuaire")** :
  - Un mini-lecteur discret en bas de page diffusant des musiques relaxantes indé / chiptune libres de droits pendant qu'on explore ou qu'on joue.
- **Mascotte Interactive du Perchoir (Mini-Tamagotchi)** :
  - Un petit hibou animé sur le perchoir ou le profil qu'on peut caresser, nourrir avec quelques plumes, et qui réagit aux séries de victoires.
- **Mode PWA / Installation Bureau & Mobile** :
  - Possibilité d'installer le site comme une application native avec icône personnalisée et notifications de renouvellement des jeux du jour.

---

## 📝 6. Notes & Suggestions en Vrac
*(À compléter au fil des idées de l'équipe et des retours de la communauté)*

- [ ] Créer la route `/profile` et découper `ProfileModal` en composants réutilisables.
- [ ] Préparer la table Supabase `user_profile_customization` ou étendre `user_profiles.save_data` pour stocker bannières, bio et cartes en vitrine.
- [ ] Proposer des bannières débloquées par des succès (ex: "Avoir fini 10 Odyssées", "Posséder 50 cartes uniques").
- [ ] Maquetter le duel de cartes rapide avec les cartes du Sanctuaire.

