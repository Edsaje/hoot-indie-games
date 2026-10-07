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

## 💬 3. Communauté & Multijoueur

- **Défis Amis Asynchrones** :
  - Défier un ami sur le mini-jeu du jour (ex: battre son score au Pixel Sprint ou BlindTest).
- **Salons personnalisés Versus** :
  - Choix des règles dans l'Arène 1v1 (sélection des modes joués, nombre de manches, timer ajustable).
- **Mentions & Notifications dans le Tchat** :
  - Pouvoir taguer `@joueur` dans le Perchoir et recevoir un son/indicateur discret.

---

## 🎮 4. Mini-Jeux & Découverte Indé

- **Mode Quotidien "Tout-en-un" (Grand Chelem)** :
  - Une suite enchaînée des jeux du jour (Screenle -> Pixel -> Chrono -> Indledle...) avec un score global quotidien.
- **Intégration Itch.io / GameJams** :
  - Section mettant en avant des prototypes et projets gratuits de créateurs francophones et indépendants.

---

## 📝 5. Notes & Suggestions en Vrac
*(À compléter au fil des idées de l'équipe et des retours de la communauté)*

- [ ] Créer la route `/profile` et découper `ProfileModal` en composants réutilisables.
- [ ] Préparer la table Supabase `user_profile_customization` ou étendre `user_profiles.save_data` pour stocker bannières, bio et cartes en vitrine.
- [ ] Proposer des bannières débloquées par des succès (ex: "Avoir fini 10 Odyssées", "Posséder 50 cartes uniques").
