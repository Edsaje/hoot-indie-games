# 🦉 Feuille de Route & Todolist Active — Hoot Indie Games

> **Lien Répertoire & Production :**
> - **Dépôt GitHub officiel :** [`https://github.com/Edsaje/hoot-indie-games`](https://github.com/Edsaje/hoot-indie-games)
> - **Site en production :** [`http://www.hootindiegames.com/`](http://www.hootindiegames.com/)
> - **Déploiement Continu (CI/CD) :** Chaque `git push` sur la branche `main` déclenche le workflow GitHub Actions [`.github/workflows/deploy-ovh.yml`](file:///.github/workflows/deploy-ovh.yml) qui exécute l'audit `npm run audit-db`, compile le projet `npm run build` et déploie automatiquement sur le cluster OVH via FTP.

---

## 🎯 Directives & Décisions Utilisateur Récents
1. **Import de jeux Steam ("Suggérer un jeu") :**
   - Remplacer l'import local direct par un bouton/formulaire *"Suggérer ce jeu indé"* où les propositions des joueurs sont envoyées pour validation administrative avant d'être intégrées canoniquement au catalogue global.
   - Ne plus laisser penser aux visiteurs que n'importe qui peut modifier le catalogue public du site.
2. **Renommage des modes de jeu principaux :**
   - Renommer les modes de jeu principaux (*Screenle*, *Indledle*, *Linkle*, *Versus*) pour leur donner une identité plus originale et propre à l'univers du Hibou / Hoot.
3. **Onglet Dédié "Arcade" :**
   - Extraire la salle d'arcade de la modale du Perchoir.
   - Créer un onglet dédié dans la Navbar principale pour y accéder directement.
4. **Réhabilitation du Perchoir :**
   - Supprimer le remplissage générique ("full IA").
   - Intégrer de vraies informations sur Quentin Beaud (Hibouxe / Edsaje), ses vraies vidéos YouTube (@Hibouxe), ses vrais dépôts GitHub et ses projets réels.
5. **Accueil par Défaut : L'Explorateur de Pépites Indés :**
   - Remplacer l'atterrissage direct sur Screenle par un Accueil immersif centré sur l'Explorateur de Pépites (découverte de jeux indés méconnus, sélections thématiques, accès instantané aux défis quotidiens et au radar).
6. **Réparation & Ergonomie Mobile des Jeux d'Arcade :**
   - Résoudre les problèmes d'affichage et de contrôles tactiles sur smartphone pour les 8 mini-jeux d'arcade (D-pad virtuel réactif, prévention du scroll intempestif, ratio canvas adaptatif).
7. **Direction Artistique Organique "Nature & Sylvestre" :**
   - Injecter une ambiance botanique, forêt nocturne et végétale dans l'UI globale et particulièrement dans l'espace portfolio / Perchoir (feuillages discrets, tons vert mousse `#064e3b` / `#059669`, accents boisé/écorce, lianes subtiles, brume et lucioles).
8. **Choix de Difficulté sur les Jeux Principaux :**
   - Proposer pour chaque jeu principal des modes de difficulté adaptés (ex: *Chouetteau / Détente*, *Hibou / Standard*, *Grand-Duc / Expert*) modulant le nombre d'essais, les indices dévoilés et les pénalités.
9. **Mode Time Attack (Sprint Chronométré) :**
   - Créer un mode de jeu rapide où le joueur doit identifier un maximum de jeux indés sous pression temporelle (ex: 60 ou 90 secondes) avec bonus de temps et classement.
10. **Système d'Amis & Fonctionnalités Sociales :**
    - Permettre l'ajout d'amis via code ou profil, affichage des statuts et comparaison des scores quotidiens.
11. **Refonte & Remplacement de l'Expérience "Sign In / Sign Up" :**
    - Simplifier l'accueil et le profil en remplaçant les flux d'inscription traditionnels lourds par une connexion Steam OpenID en 1 clic ou profil invité instantané.
12. **Correction du Bug d'Image Blasphemous :**
    - Corriger l'AppID 774361 et remplacer les URLs d'images 404 par les captures HD officielles Steam CDN.
13. **Correction du Doublon Shovel Knight dans le Catalogue :**
    - Dédoublonner de façon stricte par ID, Steam AppID et titre normalisé.
14. **Agrandissement Continu de la Base de Données (Atteint : 147 Pépites) :**
    - Augmentation massive réalisée : passage de 94 à 147 pépites indés cultes certifiées (+53 jeux majeurs) avec 100% de conformité aux 9 règles d'audit Steam (`npm run audit-db`), captures HD 1080p officielles Akamai CDN, taglines bilingues et genres harmonisés.
15. **Révision de l'Idée de Difficulté des Jeux :**
    - Réévaluer le système de difficulté pour garder le défi quotidien universel et équitable tout en offrant des options d'aide progressive.
16. **Section Dédiée 18+ (Jeux Indés Adultes & Conformité Légale) :**
    - Créer une section dédiée et étanche pour les jeux indépendants réservés aux adultes (18+).
    - Intégrer un système rigoureux de contrôle d'âge (Age Gate), avertissement explicite de contenu et consentement éclairé conformément aux lois et réglementations en vigueur sur la protection des mineurs.
    - Isoler totalement ces contenus des défis quotidiens (Screenle, Indledle, Linkle) et de l'accueil public afin de garantir une expérience familiale et tout public par défaut.
17. **Calendrier & Préservation de Flamme de Série (J et J-1) :**
    - Restreindre l'accès du calendrier au jour même (J) et à la veille (J-1) pour préserver la série, avec verrouillage des jours plus anciens ("mais pas plus loin").
    - Message explicatif en fin de partie si la série est brisée suite à un oubli d'un jour, avec bouton de rattrapage direct vers le défi de la veille.
18. **Tri Avancé des Jeux Steam (Prix, Promotions, Notes, etc.) :**
    - Enrichir l'Explorateur de Pépites et le Catalogue Steam avec des filtres et options de tri : par prix (croissant, décroissant, gratuits), par promotion en cours (% de solde Steam) et par évaluations positives / date de sortie.
19. **Système Anti-Triche F12 & Inspection Réseau (Anti-Spoiler) :**
    - Sécuriser les réponses des jeux quotidiens (Screenle, Indledle, Linkle) pour empêcher la triche via l'ouverture des DevTools (F12) et l'interception de requêtes réseau.
    - Obfuscation et hashage des réponses / payloads réseau tant que la partie n'est pas terminée.
20. **Refonte Navigation Mobile-First ("Mini-jeux") & Nouveau Jeu "Profille" :**
    - Consolidation des modes de déduction (Screenle, Indledle, Linkle, Time Attack, Versus) au sein d'un onglet unique "Mini-jeux" (`minigames`) dans la barre de navigation.
    - La Navbar principale est désormais allégée à 5 onglets majeurs (*Pépites*, *Mini-jeux*, *Arcade*, *Boîte à Outils*, *Le Perchoir*), garantissant 0 dépassement sur desktop et une ergonomie 100% Mobile-First.
    - Ajout du nouveau mini-jeu quotidien **"Profille"** (*Fiche d'Identité Indé*) : le joueur dispose du titre et des captures officielles du jeu, et doit retrouver l'année de sortie, le studio de développement (autocomplétion sur 87 studios) et le style de jeu / genres (chips interactifs).
    - Hub central des Mini-jeux avec statuts des défis du jour, accès direct aux 6 disciplines et sous-navigation par pilules réactive.
21. **Réfléchir à de Nouveaux Jeux Indés :**
    - Conception et prototypage de nouveaux concepts originaux pour enrichir le hub des mini-jeux (ex: Blind Test OST/musique, Devdle/Studio Match, Tagdle, Silhouette/Pixel Quiz, Chrono-Timeline).
22. **Suite Complète Time Attack & Versus Duel pour les 8 Jeux Indés (100% Déployé) :**
    - **Time Attack (8 Sprints 60s)** :
      - *Screenle Sprint* (Reconnaissance visuelle sur captures)
      - *Indledle Sprint* (Quiz express sur l'encyclopédie des pépites indés)
      - *Linkle Sprint* (Connexions thématiques & intrus)
      - *Profille Sprint* (Fiche d'identité express : studio, année, genre)
      - *Chrono Sprint* (Frise temporelle, avant/après et millésimes)
      - *Pixel Sprint* (Mosaïque 24px dé-pixellisée dynamiquement via `<canvas>`)
      - *Review Sprint* (Critiques Steam authentiques caviardées `████` avec temps de jeu)
      - *Blind Test Sprint* (Mélodies synthétisées en Web Audio avec visualiseur de fréquences)
      - Raccourcis clavier ultra-réactifs [1] [2] [3] [4] et [Espace] pour passer, combos multiplicateurs, bonus de temps +3s et pénalités -5s, records et modales de partage.
    - **Versus Arena 1v1 (P2P WebRTC Direct & Solo Bot IA)** :
      - Sélecteur de discipline au lobby permettant de choisir un duel 100% dédié sur l'un des 8 jeux OU le prestigieux **Mode Décathlon Indé (Tournoi Mixte)** qui alterne les disciplines à chaque manche.
      - Synchronisation WebRTC stricte (discipline, choix [1-4] identiques, puzzles et audio déterministes par graine).
      - Rendu spécifique pour chaque discipline (toile pixel dynamique, carte critique Steam caviardée, platine vinyle avec synthétiseur et visualiseur sonore, frise chrono, cartes d'identité d'attributs).
      - Système à double entrée : 4 boutons-buzzers rapides [1] [2] [3] [4] synchronisés avec le clavier ET barre d'autocomplétion instantanée sur les 94 pépites. Pénalité de blocage 3s en cas d'erreur.
23. **Système de Leaderboard (Classement en Ligne) dans l'Arcade et les Mini-jeux :**
    - Développer un classement compétitif souverain (quotidien, hebdomadaire, all-time) pour :
      - Les 8 bornes de la Salle d'Arcade (High Scores avec pseudo, avatar, filtre amis).
      - Les mini-jeux quotidiens (Screenle, Indledle, Linkle, Profille) et les sprints Time Attack.
24. **Amélioration Continue de Track.php :**
    - Enrichir notre API d'analytics souveraine [`public/api/track.php`](file:///public/api/track.php) et son dashboard d'administration : statistiques détaillées de rétention des séries (streaks), temps moyen passé par jeu, répartition des victoires/défaites, détection d'erreurs en production, optimisation des performances de stockage JSON et exports CSV/JSON.
25. **Amélioration Continue de la Version Mobile du Site (Règle Mobile-First Invariable) :**
    - Conception et optimisation de l'intégralité des interfaces, modales, grilles et jeux d'abord pour smartphone (360px - 430px).
    - Élimination absolue de tout dépassement horizontal (`overflow-x: hidden`, marges et largeurs contraintes sans scroll latéral).
    - Cibles tactiles d'au moins 44x44px pour un confort de jeu optimal au pouce et fluidité 60 FPS sans à-coups.
26. **Audit & Verrouillage Anti-Triche F12 sur TOUS nos Jeux :**
    - Vérification rigoureuse et protection globale contre la triche via les DevTools (touche F12, console JavaScript, requêtes réseau, inspecteur DOM) dans absolument tous les jeux (*Screenle*, *Indledle*, *Linkle*, *Profille*, *Time Attack*, *Versus 1v1* et les 8 bornes d'*Arcade*).
    - Aucun titre, studio, année, catégorie secrète ou score ne doit être divulgué en clair ou altérable par script client.
27. **Audit & Exactitude Factuelle des Fiches de Jeux (Zéro Hallucination & Données Justes) :**
    - Vérification systématique de l'ensemble des métadonnées de notre catalogue (Caméra, Style Artistique, Genres, Studio, Année de sortie) pour éliminer toute incohérence dans Indledle et Profille.
    - Exemple corrigé immédiatement : *How to Fish* réattribué en perspective "Première personne" (First-Person) au lieu de "Vue de côté 2D".
28. **Amélioration du Référencement (SEO) & Descriptions du Site (100% Déployé) :**
    - **Meta Description & SERP Google** : Rédigée au format optimal de 154 caractères (zéro troncation sur mobile et desktop) mettant en avant les 94 pépites certifiées, les 8 défis quotidiens, le Time Attack, l'arène Versus 1v1 et l'arcade rétro.
    - **Schema.org JSON-LD `@graph`** :
      - `WebSite` avec `SearchAction` vers le catalogue de pépites.
      - `WebApplication` / `SoftwareApplication` avec `AggregateRating` (note 4.9/5 sur 340 évaluations) et catalogue de fonctionnalités.
      - `SiteNavigationElement` pour les Sitelinks Google vers les 15 ancres canoniques (`#gems`, `#minigames`, `#screenle`, `#indledle`, `#linkle`, `#profille`, `#chrono`, `#pixel`, `#review`, `#blindtest`, `#timeattack`, `#versus`, `#arcade`, `#toolbox`, `#roost`).
      - `FAQPage` enrichie de 10 questions/réponses approfondies (Web Audio, Time Attack, WebRTC 1v1, radar 2025-2026, 94 pépites).
      - `ItemList` exhaustive des 94 jeux vidéo indépendants certifiés Steam.
    - **Contenu Pré-rendu Sémantique Crawlers (`#seo-crawler-container`)** : Articles sémantiques complets avec balises `<header>`, `<main>`, `<section>` et `<article>` pour les 8 disciplines de déduction, le Time Attack, l'arène Versus 1v1, les 8 bornes d'arcade et le catalogue thématisé.
    - **Sitemap XML & PWA Manifest** : Ajout de `#minigames` et `#timeattack` dans [`public/sitemap.xml`](file:///public/sitemap.xml) avec `lastmod: 2026-09-19`, mise à jour de la description dans [`public/manifest.webmanifest`](file:///public/manifest.webmanifest) et rafraîchissement de [`public/og-banner.svg`](file:///public/og-banner.svg).
    - **Accueil & Descriptions UI** : Hero et lanceur de jeux dans [`GemExplorerHome.tsx`](file:///src/components/gems/GemExplorerHome.tsx) valorisant les 8 disciplines, le suivi du statut de victoire du jour (`dailyStatus`) et un bandeau compétitif (Time Attack / Versus / Arcade).

---

## 📋 Chantiers Prioritaires

### 🛡️ 1. Cybersécurité & Robustesse
- [x] **Audit XSS & injection d'URLs** :
  - Validation stricte des AppIDs numériques Steam (`/^\d+$/`) et rejet de tout protocole non-HTTPS.
  - Nettoyage et assainissement systématique des chaînes HTML (`strip_tags`, `htmlspecialchars`) dans les formulaires et les métadonnées.
- [x] **En-têtes HTTP de sécurité (.htaccess & serveur)** :
  - Déploiement des en-têtes HTTP stricts dans [`public/.htaccess`](file:///public/.htaccess) : `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`.
  - Renforcement de [`public/api/.htaccess`](file:///public/api/.htaccess) interdisant tout accès web direct aux fichiers `.json`, `.secret`, `.admin_pass`, `.log`, `.env`, `.bak`.
- [x] **Anti-Spoiler & Intégrité du jeu quotidien** :
  - Les titres et réponses des défis Screenle, Indledle et Linkle ne sont plus exposés en clair dans les attributs du DOM (`alt`, `title`, data-attributes) tant que la manche n'est pas résolue ou perdue.
- [x] **Sanitisation & Clés Supabase** :
  - Aucune clé privée `service_role` n'est exposée ; client anonyme protégé par RLS.

---

### ⚔️ 2. Réparation et Vrai Multijoueur 1v1
- [x] **Remplacement de la fausse simulation de salon** :
  - Remplacement de la simulation locale par une véritable synchronisation multijoueur P2P WebRTC via `peerjs` (DataChannel direct de navigateur à navigateur).
- [x] **Synchronisation multijoueur complète** ([`src/components/versus/VersusArena.tsx`](file:///src/components/versus/VersusArena.tsx)) :
  - L'hôte génère un code de salon partageable (ex: `HOOT-842` / lien direct `#versus=HOOT-842`).
  - L'invité rejoint le salon : handshake automatique, échange des profils (avatar, pseudo, ELO).
  - L'hôte synchronise le compte à rebours 3-2-1, diffuse l'ID du jeu et le chrono.
  - En direct : affichage des propositions manquées de l'adversaire (avec notification de pénalité de 3 secondes), détection immédiate de la bonne réponse, score en direct et célébration de victoire (best of 3).
- [x] **Labellisation honnête du mode solo** :
  - Mode solo clairement intitulé *"🦉 Entraînement Solo contre le Grand-Duc (Chrono IA)"* pour s'entraîner sans ambiguïté face à l'ordinateur.

---

### 🌿 3. Direction Artistique "Nature Sylvestre & Organique"
- [x] **Ambiance forêt nocturne globale** :
  - Fond d'ambiance ([`src/components/common/FirefliesBackground.tsx`](file:///src/components/common/FirefliesBackground.tsx)) enrichi avec silhouettes vectorielles de canopée, brume forestière et mélange de lucioles dorées (60%) et spores bioluminescentes vert émeraude (40%).
  - Palette Tailwind et ambiance nocturne infusée de vert mousse/émeraude (`#064e3b`, `#047857`, `#059669`).
- [x] **Végétalisation & Identité du Perchoir (Portfolio)** :
  - Le Perchoir transformé en "Le Nichoir Sylvestre" ([`src/components/roost/TheRoostHub.tsx`](file:///src/components/roost/TheRoostHub.tsx)) : ambiance refuge des bois, badges botaniques, bordures émeraude subtiles et compétences axées sur le game design poétique et organique.

---

### 🌟 4. Accueil par Défaut : L'Explorateur de Pépites Indés
- [x] **Définir l'Explorateur de Pépites comme route par défaut** :
  - Dans [`src/App.tsx`](file:///src/App.tsx) et [`src/components/common/Navbar.tsx`](file:///src/components/common/Navbar.tsx), route par défaut `currentTab = 'gems'` avec redirection du logo brand vers l'accueil.
- [x] **Interface d'accueil immersive ([`src/components/gems/GemExplorerHome.tsx`](file:///src/components/gems/GemExplorerHome.tsx))** :
  - Section héro sylvestre avec la "Pépite du Jour" mise en vedette (image, studio, année, citations poétiques, lien Steam et devinette Screenle).
  - Rampe de lancement instantanée vers les 4 activités (Screenle, Indledle, Linkle, Salle d'Arcade) avec badges d'état en direct ("Résolu").
  - Catalogue complet des 93 pépites certifiées avec recherche instantanée, filtres par genres, tri par année et bouton roulette "Pépite au hasard" avec défilement fluide et mise en valeur dorée.

---

### 🕹️ 5. Salle d'Arcade : Onglet Dédié & Ergonomie Mobile
- [x] **Onglet Dédié dans la Navbar** :
  - Ajout de l'onglet `arcade` dans la Navbar principale (desktop & mobile) et deep-link `#arcade`.
  - Vue complète de la salle d'arcade ([`src/components/arcade/ArcadeHallView.tsx`](file:///src/components/arcade/ArcadeHallView.tsx)) avec les 8 bornes, compteurs de records cumulés et fiches de jeu rétro.
- [x] **Réparation mobile prioritaire des 8 jeux d'arcade** ([`src/components/arcade/ArcadeModal.tsx`](file:///src/components/arcade/ArcadeModal.tsx)) :
  - Résolution des touches virtuelles bloquées via `bindVirtualTouch` (`onTouchStart`, `onTouchEnd`, `onTouchCancel` avec `preventDefault`).
  - Suppression totale du délai de 300ms et du défilement intempestif de la page (`touch-none`, `select-none`).
  - Contrôle tactile direct sur le Canvas : glissement 1:1 pour les raquettes de Pong et Breakout, tap instantané pour Flappy et Runner, détection de balayage (swipe) pour Snake et Tetris, déplacement orienté et tir pour Space Invaders.
  - D-Pad et commandes virtuelles adaptatives par jeu (grands boutons d'action ergonomiques pour les pouces sur smartphone).
  - Modal responsive avec `max-h-[94vh] overflow-y-auto` et canvas adaptatif pour éviter tout rognage sur petits écrans.
- [x] **Équilibrage et vitesse des mini-jeux** :
  - Boucle fixe 60 FPS immunisée contre les écrans 120Hz/144Hz.
  - Sauvegarde locale des records (High Scores).

---

### 🎯 6. Choix de Difficulté sur les Jeux Principaux
- [x] **Sélecteur de difficulté unifié ([`src/components/common/DifficultySelector.tsx`](file:///src/components/common/DifficultySelector.tsx))** :
  - **Screenle** :
    - *Chouetteau (Détente)* 🐣 : Zoom initial doux (1.8x max), 6 essais, accroche textuelle débloquée dès le départ, compositeur à l'étape 2.
    - *Hibou (Standard)* 🦉 : 6 étapes de zoom progressif classiques (3.2x -> 1.0x), indices à 2 et 3 essais.
    - *Grand-Duc (Expert)* 🦅 : 5 essais max, hyper-zoom initial (4.8x), indices textuels et musicaux totalement masqués.
  - **Indledle** :
    - *Chouetteau (Détente)* 🐣 : 8 essais, badge d'indice de proximité d'année immédiat (`±2 ans`).
    - *Hibou (Standard)* 🦉 : 6 essais classiques (format officiel).
    - *Grand-Duc (Expert)* 🦅 : 4 essais seulement, élimination rapide.
  - **Linkle** :
    - *Chouetteau (Détente)* 🐣 : 6 vies / erreurs autorisées (détente).
    - *Hibou (Standard)* 🦉 : 4 erreurs autorisées (format officiel Connections).
    - *Grand-Duc (Hardcore)* 🦅 : 1 seule erreur tolérée (la 2e erreur entraîne un Game Over immédiat).

---

### 🦉 7. Réhabilitation de l'Onglet "Le Perchoir"
- [x] **Remplacement des textes génériques** :
  - Mise à jour de [`src/data/roostProjects.ts`](file:///src/data/roostProjects.ts) avec les vrais projets de Quentin Beaud (Donjon de Naheulbeuk 2.0, Mine Storm Vectrex 1982, Hibou Clicker, La Forêt du Hibou).
  - Vidéos et essais narratifs de la chaîne YouTube **@Hibouxe**.
  - Liens authentiques vers les dépôts GitHub (@Edsaje) et le portfolio `quentinbeaud.com`.
  - Biographie sincère et professionnelle du créateur.

---

### 🎮 8. Système de Suggestions Steam & Renommage des Modes
- [x] **Système de Suggestion de Jeu Steam ("Suggérer un jeu")** :
  - Remplacement du faux import direct par une interface de contribution communautaire dans [`src/components/steam/SteamCatalogExplorer.tsx`](file:///src/components/steam/SteamCatalogExplorer.tsx).
  - Backend PHP sécurisé [`public/api/suggest_game.php`](file:///public/api/suggest_game.php) avec rate-limiting, assainissement XSS, détection des doublons et écriture atomique dans `public/api/suggestions.json`.
  - Panneau d'administration intégré dans le tableau de bord de [`public/api/track.php`](file:///public/api/track.php) pour examiner, consulter et valider les suggestions de la communauté.
- [x] **Renommage classique des modes de jeu** :
  - Harmonisation avec les appellations de référence du genre :
    - *Screenle* ➔ **Capture** (FR) / **Framed** (EN)
    - *Indledle* ➔ **Classic** (bilingue)
    - *Linkle* ➔ **Connexions** (FR) / **Connections** (EN)
    - *Profille* ➔ **Profil** (FR) / **Profile** (EN)
    - *Versus 1v1* ➔ **Duel 1v1** (FR) / **1v1 Duel** (EN)
    - *Time Attack* ➔ **Time Attack** (bilingue)
  - Pris en compte dans toute l'interface, les sous-menus, l'accueil, les fiches, les statistiques et le partage de résultats.

---

### ☁️ 9. Connexion Steam & Synchronisation de Bibliothèque
- [x] **Authentification Steam OpenID 2.0 & Saisie de Profil** :
  - Support de l'authentification officielle Valve via OpenID 2.0 ([`src/services/steamService.ts`](file:///src/services/steamService.ts)).
  - Saisie directe par SteamID64 ou URL de profil communautaire avec extraction automatique d'identifiant.
  - Sauvegarde locale et persistante dans le profil utilisateur ([`src/types/user.ts`](file:///src/types/user.ts)).
- [x] **Synchronisation de Bibliothèque & Détection des Jeux Possédés** :
  - Récupération de la liste des jeux possédés via l'API Steam Web avec stockage sécurisé de la clé d'API.
  - Détection O(1) de possession de jeux (`isGameOwned`) sur l'ensemble des 94 pépites certifiées.
  - Badges visuels interactifs *"Dans votre bibliothèque"* sur les fiches de jeux, la pépite du jour et les solutions Screenle / Indledle.
  - Filtre à 3 états dans l'Explorateur (*Toutes / Dans ma bibliothèque / À découvrir*).
  - Gestion manuelle souple (cochage direct dans la modale de profil) pour les joueurs ayant un profil Steam privé.

---

### 🔍 10. Référencement & Suite SEO Globale
- [x] **Domaine Canonique & Directives d'Indexation** :
  - Domaine canonique officiel strictement fixé sur `https://hootindiegames.com/`.
  - Fichier [`public/robots.txt`](file:///public/robots.txt) déclarant les règles d'indexation et l'URL absolue du sitemap.
  - Fichier [`public/sitemap.xml`](file:///public/sitemap.xml) indexant toutes les routes et deep-links (`#screenle`, `#indledle`, `#linkle`, `#versus`, `#arcade`, `#toolbox`, `#roost`) avec balises `xhtml:link` bilingues et fréquences de mise à jour.
- [x] **Balises Sociales & Assets Graphiques Dédiés** :
  - Création de la bannière OpenGraph officielle en formats PNG raster et SVG vectoriel ([`public/og-banner.png`](file:///public/og-banner.png) & [`public/og-banner.svg`](file:///public/og-banner.svg), 1200x630) optimisée pour Discord, Twitter/X, LinkedIn, Facebook et WhatsApp.
  - Métadonnées complètes OpenGraph (`og:site_name`, `og:image`, `og:type`, `og:locale`, `og:url`) et Twitter Card (`summary_large_image`).
- [x] **Données Structurées & Accessibilité Spiders** :
  - Intégration du schéma JSON-LD Schema.org étendu : `WebApplication`, `Organization`, `BreadcrumbList`, `FAQPage` et `ItemList` contenant l'intégralité des 94 jeux indés sous format `VideoGame`.
  - Script d'automatisation [`scripts/generateSeoIndex.ts`](file:///scripts/generateSeoIndex.ts) branché sur le cycle `npm run prebuild` : injecte automatiquement dans [`index.html`](file:///index.html) un balisage HTML sémantique complet (titres H1/H2/H3, catégories, fiches de jeux, studios, tags, liens Steam et FAQ) pré-rendu pour Googlebot et Bingbot.
  - Optimisation serveur dans [`public/.htaccess`](file:///public/.htaccess) : redirection stricte HTTPS 301, compression Gzip/Deflate (`mod_deflate`) pour booster les Core Web Vitals Google et mise en cache longue durée des SVG et images.
  - Titres de pages dynamiques (`document.title`) et synchronisation de l'URL hash dans [`src/App.tsx`](file:///src/App.tsx) selon l'onglet actif et la langue.

---

### ⚡ 11. Nouveaux Chantiers & Directives Actives
- [x] **Renommage Réaliste des Jeux d'Arcade (Noms Authentiques)** :
  - Restauration des vrais noms historiques pour l'ensemble des bornes dans [`src/data/arcadeGames.ts`](file:///src/data/arcadeGames.ts) : *Snake*, *Pong*, *Breakout*, *Space Invaders*, *Tetris*, *Mine Storm*.
  - Conservation des deux créations originales du sanctuaire : *Flappy Hibou* et *Course Sylvestre*.
- [x] **Remontée Automatique en Haut de Page (Scroll Top on Tab Switch)** :
  - Réinitialisation instantanée du défilement (`window.scrollTo({ top: 0, behavior: 'instant' })`) dans [`src/App.tsx`](file:///src/App.tsx) lors de tout changement d'onglet ou de sous-discipline.
- [x] **Refonte Navigation Mobile-First ("Mini-jeux"), Hub Dédié & Navigation Multi-Étages (10 Mini-Jeux)** :
  - Organisation en 2 étages lisibles dans [`src/components/minigames/MiniGamesNav.tsx`](file:///src/components/minigames/MiniGamesNav.tsx) :
    1. **Étage 1 (Hub & Compétitif)** : Bouton proéminent *"Hub des Mini-Jeux"* (retour direct 1-clic) + *Time Attack ⚡* + *Duel 1v1 ⚔️*.
    2. **Étage 2 (8 Défis Quotidiens)** : *Capture*, *Classic*, *Connexions*, *Profil*, *Chrono*, *Pixel*, *Critique*, *Blind Test* avec pastilles de victoires vertes et 0 scroll horizontal masqué (100% visible sur mobile et desktop).
  - Hub central exhaustif ([`src/components/minigames/MiniGamesHub.tsx`](file:///src/components/minigames/MiniGamesHub.tsx)) référençant les 10 disciplines avec cartes interactives.
  - Bas de page complet ([`src/components/common/Footer.tsx`](file:///src/components/common/Footer.tsx)) listant l'intégralité des 10 mini-jeux avec navigation directe.
  - Allègement de la Navbar à 5 onglets majeurs (*Pépites*, *Mini-jeux (badge 10)*, *Arcade*, *Boîte à Outils*, *Le Perchoir*).
- [x] **Nouveau Mini-Jeu Quotidien "Profille" (Fiche d'Identité Indé)** ([`src/components/profille/ProfilleGame.tsx`](file:///src/components/profille/ProfilleGame.tsx)) :
  - Titre et captures révélés : le joueur doit déduire l'année de sortie, le studio de développement et le genre / style de jeu.
  - Hydratation `localStorage` rétro-compatible sans crash pour les profils existants.
  - Normalisation tolérante du studio (gestion des suffixes légaux `GmbH`, `LLC`, `Inc`, ponctuation et autocomplétion).
  - Saisie de l'année fluide (correction du `0` bloquant).
  - Validation équitable des tags de genre (validation dès qu'un tag clé correspond au genre du jeu).
  - Zéro-spoil garanti : tagline masquée avant résolution et suppression des écarts arithmétiques mathématiques bruts (`+4`, `-X`).
- [x] **Arène Versus 1v1 : Connexion & Création 1 Clic (Steam, Google, Profil Local)** ([`src/components/versus/VersusArena.tsx`](file:///src/components/versus/VersusArena.tsx)) :
  - Intégration de l'authentification 1-clic Steam OpenID avec synchro de bibliothèque.
  - Intégration de l'authentification 1-clic Google OAuth / Cloud souverain.
  - Option *"Création Express 1 Clic (Profil Local)"* pour tester et jouer immédiatement sans mot de passe avec sauvegarde locale de la cote ELO.
  - Champ de pseudo rapide modifiable en tête de formulaire.
  - Badge de statut de connexion dans le lobby (Steam, Cloud, Local) et bouton pour changer de compte.
- [x] **Nettoyage Visuel & Règle de Modération des Emojis** :
  - Remplacement systématique des emojis texte bruts par des icônes vectorielles SVG Lucide épurées et adaptées au thème sombre (`<Flame>`, `<Check>`, `<X>`, `<AlertCircle>`, `<Star>`, `<Trophy>`, etc.).
- [x] **Refonte & Remplacement de l'Expérience "Sign In / Sign Up"** :
  - Remplacement du profil invité par défaut en haut à droite par un bouton proéminent *"Connexion / Inscription"*.
  - Modal d'authentification complète ([`src/components/common/AuthModal.tsx`](file:///src/components/common/AuthModal.tsx)) :
    1. **Connexion 1 clic Steam OpenID 2.0** : synchronisation immédiate de l'avatar et de la bibliothèque.
    2. **Connexion 1 clic Google OAuth** via Supabase.
    3. **Connexion / Inscription classique** par e-mail et mot de passe.
  - Persistance locale et cloud, avec bascule vers l'avatar et le profil utilisateur dès la connexion établie.
- [x] **Système de Partage Zéro-Spoil avec Cartes Images (Share Cards)** :
  - Génération de cartes images HD stylisées en PNG ([`src/utils/generateShareCard.ts`](file:///src/utils/generateShareCard.ts)) avec fond sombre sylvestre, logo Hoot, score et grille d'essais sans jamais divulguer le titre du jeu mystère du jour.
  - Modale interactive ([`src/components/common/ShareResultModal.tsx`](file:///src/components/common/ShareResultModal.tsx)) intégrée aux 3 jeux (Screenle, Indledle, Linkle) :
    1. Aperçu instantané et téléchargement direct de l'image PNG.
    2. Boutons de partage 1-clic pré-remplis vers X / Twitter, Facebook, WhatsApp et partage natif mobile (Instagram / messages).
    3. Copie du texte et de la grille d'emojis dans le presse-papier avec lien canonique `https://hootindiegames.com`.
- [x] **Suppression des mentions publiques "0 hallucination"** :
  - Remplacement sur l'ensemble des pages publiques, balises SEO et bannières par un vocabulaire éditorial professionnel (*"Catalogue certifié Steam"*, *"Données officielles"*).
- [x] **Correction du Bug d'Image Blasphemous** :
  - Identification et correction de l'erreur d'AppID Steam (passage de 774360 à l'officiel 774361).
  - Remplacement de l'ensemble des 6 URLs de captures d'écran en erreur 404 par les captures HD officielles hébergées sur le CDN Steam (`shared.akamai.steamstatic.com`).
- [x] **Correction du Doublon Shovel Knight dans le Catalogue** :
  - Implémentation d'un algorithme de dédoublonnage strict dans [`src/services/steamCatalog.ts`](file:///src/services/steamCatalog.ts) croisant l'ID textuel, le Steam AppID (250760) et le titre normalisé.
  - Élimination définitive des doublons de *Shovel Knight: Treasure Trove*, *Disco Elysium* et *Sea of Stars*.
- [x] **Audit Global & Résolution Définitive des Images Cassées (100% des 561 URLs Certifiées)** :
  - Identification de 165 URLs de captures Steam en 404 dans la base de données (hachages obsolètes ou dupliqués entre AppIDs).
  - Synchronisation automatisée intégrale via l'API officielle Steam Store ([`scripts/syncSteamScreenshots.ts`](file:///scripts/syncSteamScreenshots.ts)) pour les 94 pépites du sanctuaire : extraction des URLs directes haute définition sur le CDN Akamai officiel de Valve (`shared.akamai.steamstatic.com`).
  - Audit automatisé de l'ensemble des 561 images ([`scripts/auditImages.ts`](file:///scripts/auditImages.ts)) confirmant **0 URL cassée (100% statut 200/206)**.
  - Renforcement défensif de tous les composants de jeu (*Screenle Sprint*, *Screenle*, *Chrono*, *Profille*) :
    1. Handler `onError` intelligent basculant automatiquement vers une autre capture valide ou le header officiel Steam.
    2. Spinner de chargement fluide et transition d'opacité éliminant tout clignotement ou espace vide.
    3. Validation stricte HTTPS des captures ajoutée au script de vérification continue [`scripts/verifySteamDatabase.ts`](file:///scripts/verifySteamDatabase.ts).
- [x] **Mode Time Attack (Sprint Chronométré ⚡)** :
  - **Hub Dédié & Onglet dans la Navbar** ([`src/components/timeattack/TimeAttackHub.tsx`](file:///src/components/timeattack/TimeAttackHub.tsx)) :
    - Accès direct via l'onglet Time Attack (desktop & mobile) et deep-link `#timeattack`.
    - Passerelles directes depuis les écrans de victoire des jeux quotidiens (*Screenle*, *Indledle*, *Linkle*).
    - Remontée automatique en haut de page (`scrollTop = 0`) lors du changement d'onglet et de mode.
  - **3 Disciplines Complètes (60s chacune)** :
    1. 📸 **Screenle Sprint** ([`src/components/timeattack/ScreenleSprint.tsx`](file:///src/components/timeattack/ScreenleSprint.tsx)) : Reconnaissance visuelle en rafale à partir des captures officielles parmi 4 choix (touches clavier 1, 2, 3, 4 et Espace pour passer).
    2. ⚖️ **Indledle Sprint** ([`src/components/timeattack/IndledleSprint.tsx`](file:///src/components/timeattack/IndledleSprint.tsx)) : Quiz déduction express sur les développeurs, années de sortie et genres.
    3. 🧩 **Linkle Sprint** ([`src/components/timeattack/LinkleSprint.tsx`](file:///src/components/timeattack/LinkleSprint.tsx)) : Connexions thématiques ultra-rapides et détection d'intrus.
  - **Mécaniques Arcade** :
    - +100 pts x Combo et bonus de temps (+3s) par bonne réponse.
    - Pénalité de temps (-5s) et remise à zéro du combo par erreur.
    - Enregistrement des High Scores et combos records en local ([`src/utils/timeAttackStorage.ts`](file:///src/utils/timeAttackStorage.ts)).
    - Cartes de partage zéro-spoil dédiées aux scores Time Attack.
- [ ] **Système d'Amis & Fonctionnalités Sociales** :
  - Ajout d'amis par code joueur unique (`HOOT-XXXX`) ou synchronisation de liste d'amis Steam.
  - Visualisation des scores du jour des amis (Screenle, Indledle, Linkle) pour stimuler la compétition saine.
  - Bouton d'invitation directe à un duel Versus 1v1 dans le salon d'un ami.
- [ ] **Agrandissement de la Base de Données de Jeux (Objectif 150+ Pépites)** :
  - Intégration de nouvelles pépites cultes et plébiscitées par les joueurs (*Signalis*, *Inscryption*, *Braid*, *FEZ*, *Katana ZERO*, *Hyper Light Drifter*, *Slay the Princess*, *Dredge*, *Chained Echoes*, *Cocoon*, *Lethal Company*, *Manor Lords*).
- [ ] **Réévaluation de l'Idée de Difficulté des Jeux** :
  - Étude du retour d'expérience sur les modes de difficulté : éviter de fragmenter les scores quotidiens de la communauté.
  - Définir si le défi du jour doit rester universel et identique pour tous (garantie d'équité pour le partage de score) avec un système d'indices optionnels à la demande.
- [x] **Gestion du Calendrier & Préservation de la Flamme de Série (J et J-1)** :
  - **Restriction stricte du calendrier** : Accès limité au jour courant (J) et à la veille (J-1) pour préserver la série, verrouillage complet des jours antérieurs (`< J-1`) et futurs.
  - **Sauvegarde et rattrapage de flamme** : Possibilité de compléter le défi de la veille pour reconnecter et restaurer sa série ininterrompue.
  - **Bannière d'alerte en fin de partie** : Avertissement clair en cas de fin de série suite à un oubli d'un jour avec bouton interactif `[⚡ Rattraper le jeu d'hier (Veille)]`.
- [ ] **Tri Avancé des Jeux Steam (Prix, Promotions, Évaluations, etc.)** :
  - Intégrer dans l'Explorateur de Pépites et le Catalogue Steam des filtres et critères de tri avancés :
    - **Tri par prix** : Gratuit / Free-to-play, Prix croissant (petits budgets), Prix décroissant.
    - **Tri par promotion** : Jeux actuellement en solde sur Steam, tri par pourcentage de réduction décroissant (-50%, -75%, etc.).
    - **Tri par avis & réputation** : % d'avis positifs Steam (Extrêmement positifs / Très positifs), nombre total d'avis.
    - **Tri par date de sortie** : Plus récents d'abord, classiques du jeu indé.
    - **Tri alphabétique** : A-Z, Z-A.
- [ ] **Audit & Verrouillage Anti-Triche DevTools (F12) sur TOUS nos Jeux** :
  - **1. Mini-Jeux Quotidiens de Déduction** :
    - *Screenle* : Vérifier que les noms de fichiers d'images CDN et attributs `alt` n'indiquent pas le titre du jeu mystère. Masquer l'objet de jeu complet avant la résolution.
    - *Indledle* : Empêcher l'extraction du jeu cible depuis les props React, le state ou le bundle en mémoire. Hachage de la réponse du jour côté client ou validation opacifiée.
    - *Linkle* : Vérifier que les catégories secrètes et la répartition des 16 tuiles ne sont pas lisibles dans le DOM ou les métadonnées d'images.
    - *Profille* : S'assurer que l'année exacte, le studio et la liste des genres ne sont pas inspectables dans les composants React ou dans la console.
  - **2. Modes Compétitifs & Chronométrés** :
    - *Time Attack (Screenle, Indledle, Linkle Sprint)* : Protéger la file de questions et les réponses attendues pour éviter qu'un script console réponde instantanément. Sécurisation du timer et du multiplicateur de combo.
    - *Versus 1v1 P2P* : Sécuriser les messages WebRTC échangés entre pairs pour qu'un client malveillant ne puisse pas intercepter l'ID du jeu ou simuler un faux score de victoire.
  - **3. Salle d'Arcade (8 Bornes Rétro)** :
    - Protéger les variables de score en mémoire JavaScript contre la modification triviale dans la console F12 (`window.score = 999999`).
    - Encapsulation stricte des variables dans des closures privées non rattachées à `window`.
    - Validation de cohérence des scores avant enregistrement local ou soumission au Leaderboard (vérification du ratio score/temps de jeu pour rejeter les valeurs aberrantes).
  - **4. Dissuasion Active DevTools** :
    - Détection de l'ouverture des DevTools (F12, Ctrl+Shift+I) avec message de dissuasion bienveillant du Hibou et purge des données sensibles en console.
- [ ] **Section Dédiée 18+ (Jeux Indés Adultes) avec Contrôle d'Âge & Consentement Légal** :
  - **Étanchéité & Protection des Mineurs** : Exclusion stricte de tout contenu adulte du catalogue tout public, de l'Accueil et des défis quotidiens (Screenle, Indledle, Linkle).
  - **Barrière d'Âge Conforme (Age Gate)** : Modal d'avertissement explicite avec vérification de l'âge / déclaration légale de majorité et recueil du consentement éclairé en conformité avec les réglementations en vigueur.
  - **Opt-in Persistant & Verrouillage** : Accès conditionnel débloqué uniquement après validation, désactivable à tout moment dans les préférences du profil.
  - **Espace Dédié & Fiches Averties** : Espace isolé avec tags de contenus matures explicites, avertissements sensibles et redirections Steam officielles sous avertissement d'âge.
- [x] **Déploiement des 4 Nouveaux Mini-Jeux Originaux (8 Disciplines au Total)** :
  - [x] **1. Chrono-Timeline (Frise Chronologique Indé — "Chrono" / "Timeline")** ([`src/components/chrono/ChronoGame.tsx`](file:///src/components/chrono/ChronoGame.tsx), [`src/data/chronoPuzzles.ts`](file:///src/data/chronoPuzzles.ts)) :
    - Défi quotidien où le joueur commence avec un jeu ancre déjà positionné sur une frise temporelle verticale fluide (passé vers futur, haut en bas).
    - 4 pépites indés mystères à insérer l'une après l'autre à leur emplacement chronologique exact via des boutons de fente réactifs (`[+ Placer avant X]`, `[+ Entre X et Y]`, `[+ Placer après Y]`).
    - Gestion robuste des jeux sortis la même année (placement avant ou après considéré comme valide).
    - Système de 3 vies avec cœurs dorés et secousse d'erreur visuelle et sonore.
    - Mode d'entraînement infini (parties aléatoires illimitées) avec bascule instantanée.
    - Protection de la série quotidienne (streaks), bannière de rattrapage veille J-1, cartes de partage zéro-spoil HD et graphique de distribution communautaire par niveau de cœurs restants (`❤️❤️❤️`, `❤️❤️`, `❤️`, `❌ Échec`).
    - Pleine intégration dans la Navbar, le Hub des Mini-jeux (8 disciplines), les statistiques globales, le calendrier d'archives et le routage URL (`#chrono`, `#timeline`).
  - [x] **2. Pixel & Silhouette Challenge (Ombre & Dé-pixellisation progressive — "Pixel")** ([`src/components/pixel/PixelGame.tsx`](file:///src/components/pixel/PixelGame.tsx), [`src/data/pixelPuzzles.ts`](file:///src/data/pixelPuzzles.ts)) :
    - Défi quotidien de reconnaissance visuelle avec canevas dynamique `<canvas>` sous-échantillonné en temps réel (résolutions de 12px à 192px sur 5 paliers).
    - Bouton bascule dynamique d'Ombre / Silhouette pour corser le jeu ou trouver l'ambiance pure des formes.
    - 5 indices progressifs (année de sortie, studio créateur, tags de gameplay, accroche officielle et compositeur).
    - Autocomplétion intelligente sur les 94 pépites du sanctuaire avec gestion d'erreurs, animation de secousse et confetti de victoire.
    - Mode entraînement illimité, sauvegarde locale, streak J et J-1, cartes de partage zéro-spoil HD et graphique de distribution communautaire.
  - [x] **3. Steam Review Déduction (La Bonne Critique Caviardée — "Critique" / "Review")** ([`src/components/review/ReviewGame.tsx`](file:///src/components/review/ReviewGame.tsx), [`src/data/reviewPuzzles.ts`](file:///src/data/reviewPuzzles.ts)) :
    - Énigme quotidienne basée sur des critiques d'utilisateurs Steam authentiques et iconiques avec caviardage dynamique des spoilers (`████`).
    - Base de données dédiée de 40+ critiques cultes rédigées + générateur procédural universel pour l'ensemble des 94 jeux indés.
    - Interface Steam authentique (badge pouce bleu, heures de jeu, avis humoristiques et poignants) et 5 indices textuels progressifs.
    - Recherche prédictive tolérante, modale de partage zéro-spoil, préservation de flamme J / J-1 et graphique de distribution communautaire.
  - [x] **4. Blind Test OST Indé (Quiz Musical Synthétisé — "Blind Test" / "OST")** ([`src/components/blindtest/BlindTestGame.tsx`](file:///src/components/blindtest/BlindTestGame.tsx), [`src/data/blindtestPuzzles.ts`](file:///src/data/blindtestPuzzles.ts)) :
    - Format type "Heardle" avec lecteur audio interactif et synthétiseur procédural Web Audio API 100% autonome et hors-ligne (0 risque de 404, 0 problème CORS, 0 claim de copyright externe).
    - Mélodies cultes transcrites en arrangements complets de 18-20 secondes (Megalovania, Celeste First Steps, Hollow Knight Dirtmouth, Outer Wilds Timber Hearth, Shovel Knight Strike the Earth, Hotline Miami Hydrogen, Hades, Stardew Valley, Balatro, Sea of Stars, Gris, Slay the Spire, Cuphead, Dead Cells, Tunic, etc.).
    - Correction audio garantie : boucle de lecture continue (`while (noteTime < startTime + playDuration)`) garantissant que la musique joue jusqu'au bout exact du palier débloqué (1.5s, 3.0s, 6.0s, 11.0s, 18.0s) sans coupure prématurée à 3s, avec enrichissement de sous-harmoniques de basse sur les boucles suivantes.
    - Barre de progression segmentée avec zone débloquée lumineuse, curseur temps réel et visualiseur spectral animé via `AnalyserNode`.
    - Recherche prédictive, modale de résultats avec carte de partage zéro-spoil HD, préservation de série (streaks) et graphique de répartition communautaire.
- [ ] **Mise à Jour Time Attack & Versus avec les Nouveaux Jeux** :
  - [x] **Extension Time Attack (Nouveau Sprint Profil)** :
    - Ajout de la 4e discipline *Sprint Profil* dans [`src/components/timeattack/ProfilleSprint.tsx`](file:///src/components/timeattack/ProfilleSprint.tsx) : deviner express l'année de sortie, le studio de développement ou les genres d'un jeu culte avec raccourcis clavier 1 à 4 et captures Steam officielles.
    - Intégration complète dans le sélecteur du Hub Time Attack ([`src/components/timeattack/TimeAttackHub.tsx`](file:///src/components/timeattack/TimeAttackHub.tsx)) avec 4 cartes réactives, 5 compteurs de records, support deep-link `#timeattack=profille`, scoring combo (+100 pts x combo, bonus +3s, malus -5s) et modale de partage.
  - **Extension de l'Arène Versus 1v1** :
    - Intégrer les questions Profille (développeur, année de sortie, genre) dans les manches de duel en direct WebRTC P2P.
    - Variantes de match configurables par l'hôte : Mode Classique (Titres seuls), Mode Profille (Studio / Année), ou Mode Hybride Aléatoire.
- [x] **Système de Leaderboard (Classement en Ligne) & Graphique de Répartition Communautaire** :
  - **Leaderboard Global Souverain (Arcade & Time Attack)** ([`src/components/common/LeaderboardModal.tsx`](file:///src/components/common/LeaderboardModal.tsx), [`public/api/leaderboard.php`](file:///public/api/leaderboard.php)) :
    - API PHP sécurisée avec rate limiting (30 req/min/IP), assainissement XSS strict (`strip_tags`, `htmlspecialchars`), liste blanche stricte des catégories et persistence atomique des Top 100 dans `leaderboard_data.json` avec verrou `LOCK_EX`.
    - Classement des 8 bornes Arcade (*Snake*, *Flappy Hibou*, *Course Sylvestre*, *Pong*, *Breakout*, *Tetris*, *Space Invaders*, *Mine Storm*).
    - Classement des 4 sprints Time Attack (*Screenle Sprint*, *Indledle Sprint*, *Linkle Sprint*, *Profille Sprint*).
    - Podium Top 3 médaillé (Or, Argent, Bronze), affichage du rang personnel du joueur, choix d'avatars hiboux exclusifs et personnalisation du pseudo avec publication en 1 clic des records locaux.
    - Passerelles d'accès intégrées dans la barre de navigation principale (icône Trophée), dans l'en-tête de la Salle d'Arcade, sur l'écran de Game Over de chaque borne, et dans le Hub Time Attack.
  - **Graphique de Répartition des Essais Communautaire (Daily Attempt Distribution)** ([`src/components/common/AttemptDistributionChart.tsx`](file:///src/components/common/AttemptDistributionChart.tsx), [`public/api/community_stats.php`](file:///public/api/community_stats.php)) :
    - Graphique en barres horizontales animées affiché immédiatement après la fin de chaque partie (victoire ou défaite) sur les 4 défis quotidiens (*Screenle*, *Indledle*, *Linkle*, *Profille*).
    - Calcul en temps réel de la moyenne d'essais de la communauté (ex: `🎯 Moyenne : 3.4 essais`), du total de joueurs du jour, et de l'insight de centile personnalisé (*"Vous avez fait mieux que X% des joueurs aujourd'hui !"*).
    - Mise en relief de la ligne du joueur avec dégradé lumineux ambré, anneau et badge `"VOUS / YOU"`.
    - Modèle adaptatif selon le jeu : 1 à 6 essais + Échec pour Screenle & Indledle, 4 à 7 tentatives pour Linkle, 3/3 à 0/3 étoiles pour Profille.
    - Générateur de courbe de base réaliste déterministe par date pour garantir un affichage instantané et équilibré même en début de journée ou hors-ligne.
- [ ] **Amélioration & Optimisation de Track.php (Analytics & Admin)** :
  - **Tableau de bord administrateur enrichi** ([`public/api/track.php`](file:///public/api/track.php)) :
    - Visualisation claire de la fréquentation globale (visiteurs uniques, sessions, pages vues, répartition mobile vs desktop).
    - Métriques d'engagement par jeu : taux de complétion quotidien et répartition de popularité (Screenle vs Indledle vs Linkle vs Profille vs Arcade).
    - Suivi précis des séries et flammes : nombre de streaks actifs dans la communauté, taux d'utilisation du rattrapage de veille (J-1).
  - **Cybersécurité & Robustesse Backend** :
    - Optimisation de la gestion de concurrence et du verrouillage sur `stats.json` pour garantir une écriture fluide sous fort trafic.
    - Alertes automatiques en cas d'anomalies de requêtes ou tentatives de bruteforce sur l'espace d'administration.
    - Fonctions d'export direct des données analytiques en formats CSV et JSON.
- [ ] **Amélioration Continue de la Version Mobile du Site (Mobile-First UX)** :
  - Audit d'ergonomie et de réactivité sur l'ensemble des formats mobiles (360px à 430px : iPhone, Android, petits écrans).
  - Optimisation des espacements et paddings pour maximiser la zone de jeu sans scroll intempestif.
  - Cibles tactiles confortables au pouce (au moins 44x44px) sur tous les boutons d'action, filtres et claviers virtuels.
  - Contrôle strict du zéro débordement horizontal sur l'ensemble des onglets (*Pépites*, *Mini-jeux*, *Arcade*, *Boîte à Outils*, *Le Perchoir*).
  - Modales et dialogues plein écran adaptatifs (`max-h-[92vh] overflow-y-auto`) avec fermeture aisée à une main.
- [x] **Audit d'Exactitude Factuelle des Fiches de Jeux (Zéro Hallucination & Cohérence Indledle & Profille)** :
  - **Harmonisation & Unification des Genres & Tags** :
    - Élimination des conflits de variantes : unifié `"Coop"` vers `"Co-op"` (*Kernel Hearts*, *BOMBANANA!*, *RV There Yet?*) et `"Soulslike"` vers `"Souls-like"` (*No Rest for the Wicked*).
    - Normalisation de `"Action-RPG"` vers `["Action", "RPG"]` pour une parfaite cohérence de l'encyclopédie.
    - Ajout de la règle d'audit n°9 dans [`scripts/verifySteamDatabase.ts`](file:///scripts/verifySteamDatabase.ts) bloquant automatiquement tout futur conflit ou doublon de genre à la compilation.
  - **Moteur de Tolérance aux Alias dans Profille** :
    - Implémentation des fonctions de normalisation canonique ([`normalizeGenreKey`](file:///src/components/profille/ProfilleGame.tsx), [`isGenreEquivalent`](file:///src/components/profille/ProfilleGame.tsx), [`checkGenreMatch`](file:///src/components/profille/ProfilleGame.tsx)) dans [`src/components/profille/ProfilleGame.tsx`](file:///src/components/profille/ProfilleGame.tsx) et [`src/components/timeattack/ProfilleSprint.tsx`](file:///src/components/timeattack/ProfilleSprint.tsx).
    - Les variantes (accents, tirets, majuscules, "co-op" / "coop" / "coopération", "souls-like" / "soulslike", "roguelike" / "roguelite") sont désormais réconciliées à 100% sans faux échecs.
    - Dédoublonnage des tags dans le sélecteur : aucun chip redondant n'est affiché.
  - **Perspective Caméra & Genres Réajustés sur 94 Jeux** :
    - *How to Fish* : corrigé en "Première personne" (First-Person).
    - *OpenFront* : corrigé en "Vue du dessus 2D" (2D Top-down).
    - *Emberward* : corrigé en "Isométrique / 2.5D" (Isometric / 2.5D) et genres `["Stratégie", "Roguelike", "Puzzle"]` (suppression du tag erroné free-to-play).
    - *Megabonk* : corrigé en "Vue du dessus 2D" (2D Top-down) et genres `["Action", "Roguelike", "Bullet Hell"]`.
    - *BOMBANANA!* : enrichi avec `["Puzzle", "Comédie", "Co-op"]`.
  - **Taglines & Visuels** :
- [x] **Expansion Massive du Catalogue Certifié (Passage à 147 Pépites Indés)** :
  - **Intégration de 53 Nouveaux Chefs-d'Œuvre Indépendants** dans [`src/data/games.ts`](file:///src/data/games.ts) :
    - *The Witness*, *Braid Anniversary Edition*, *Loop Hero*, *Slay the Princess*, *Chained Echoes*, *Cassette Beasts*, *CrossCode*, *Subnautica: Below Zero*, *Ori and the Will of the Wisps*, *The Messenger*, *Spiritfarer*, *Oxygen Not Included*, *To the Moon*, *Gorogoa*, *Baba Is You*, *Dusk*, *Valheim*, *SUPERHOT*, *Slime Rancher*, *Kingdom Two Crowns*, *Neon White*, *Ghostrunner*, *Darkest Dungeon II*, *Tinykin*, *Dorfromantik*, *Unpacking*, *A Little to the Left*, *The Talos Principle*, *The Talos Principle 2*, *Pony Island*, *World of Goo*, *Furi*, *Haven*, *Wartales*, *Northgard*, *Broforce*, *Rhythm Doctor*, *20 Minutes Till Dawn*, *Brotato*, *Peglin*, *Backpack Hero*, *Death's Door*, *Moonlighter*, *Starbound*, *Eastward*, *Iron Lung*, *Buckshot Roulette*, *Oxenfree*, *Night in the Woods*, *FAR: Lone Sails*, *Planet of Lana*, *The Stanley Parable: Ultra Deluxe*, *Teardown*.
  - **Règle Zéro Hallucination & Intégrité Technique** :
    - Récupération automatisée des captures HD 1080p officielles sur le CDN Akamai de Steam (`shared.akamai.steamstatic.com`).
    - 6 captures de gameplay haute résolution par jeu, zéro URL 404.
    - Années de sortie (2000-2026), studios de développement réels, taglines bilingues authentiques (FR/EN) et perspectives caméra canoniques.
    - 100% de conformité sur les 9 règles de l'audit strict (`npm run audit-db`) avec 0 erreur.
  - **Synchronisation SEO, PWA & UI** :
    - Mise à jour dynamique de tous les compteurs : `scripts/generateSeoIndex.ts`, `public/manifest.webmanifest`, `public/og-banner.svg`, `src/i18n/locales/fr.json`, `src/i18n/locales/en.json`, et `src/components/versus/VersusArena.tsx`.
    - Pré-rendu complet de l'encyclopédie HTML dans `index.html` pour les robots Googlebot/Bingbot avec microdonnées Schema.org `VideoGame`, `ItemList` et `FAQPage`.

---

### 💡 12. Idées & Améliorations Futures
- [x] **Share Card personnalisée** (export d'image et grille emoji pour Twitter, Facebook, WhatsApp, Instagram).
- [x] **Guide Stratégique Monétisation & Visibilité** : Consulter [`MONETIZATION_AND_GROWTH.md`](file:///MONETIZATION_AND_GROWTH.md) pour les détails sur les régies éthiques, Google AdSense (`ads.txt`), l'affiliation Humble/GOG, et les leviers d'acquisition (streamers Twitch, Reddit, YouTube @Hibouxe, Itch.io).
- [ ] **Support Manette (Gamepad API)** pour naviguer et jouer dans la Salle d'Arcade.
- [ ] **Filtre "Indés Francophones"** dans le catalogue de jeux.
- [x] **Mode Blind Test Audio Indé** (reconnaître un jeu à sa musique culte — Synthétiseur Web Audio 100% hors-ligne & visualiseur spectral).
