# 🦉 Feuille de Route & Todolist Active — Hoot Indie Games

> **Lien Répertoire & Production :**
> - **Dépôt GitHub officiel :** [`https://github.com/Edsaje/hoot-indie-games`](https://github.com/Edsaje/hoot-indie-games)
> - **Site en production :** [`http://www.hootindiegames.com/`](http://www.hootindiegames.com/)
> - **Déploiement Continu (CI/CD) :** Chaque `git push` sur la branche `main` déclenche le workflow GitHub Actions [`.github/workflows/deploy-ovh.yml`](file:///.github/workflows/deploy-ovh.yml) qui exécute l'audit `npm run audit-db`, compile le projet `npm run build` et déploie automatiquement sur le cluster OVH via FTP.

> [!IMPORTANT]
> ### 🛡️ RÈGLE PRIMORDIALE : La sécurité est notre priorité sur ce site.
> **La sécurité, l'intégrité anti-triche, la protection contre les injections, l'isolation des secrets et le blindage de tous les accès constituent la priorité numéro 1 absolue du sanctuaire Hoot Indie Games.**
> Aucun compromis ne doit être fait sur la sécurité lors de l'ajout ou de la refonte de fonctionnalités (jeux, tchat, profil, monétisation, administration, cartes).

---

## 🎯 Todolist Active Prioritaire (Demandes Récentes Utilisateur)

### 1. 🖼️ Correction des images de jeux Itch.io non chargées (Images noires) `[✅ 100% Terminé]`
- **Constat :** Dans la Clairière des Micro-Indés (`MicroIndieHub.tsx`), certaines fiches affichaient un carré noir vide au lieu de l'image de couverture du jeu.
- **Causes identifiées :**
  1. URLs CDN `img.itch.zone` expirées ou 404 sur 15 jeux de la sélection.
  2. Absence de `referrerPolicy="no-referrer"` sur les balises `<img>`, provoquant des blocages 403 Forbidden sur le CDN Itch.io.
  3. Absence de gestion d'erreur `onError` et de repli visuel élégant.
- **Actions réalisées :**
  - [x] Mettre à jour `src/data/microIndies.ts` avec des URLs d'images officielles certifiées 200 OK (Akamai CDN Steam pour les titres multiplateformes et URLs itch officielles actualisées).
  - [x] Ajouter `referrerPolicy="no-referrer"` sur les images dans `MicroIndieHub.tsx`.
  - [x] Implémenter un gestionnaire `onError` avec état `failedImageIds` affichant une bannière sylvestre de secours avec icône, titre et genre au lieu d'un cadre noir.

---

### 2. 🎴 Désactivation de l'ouverture automatique des boosters de cartes `[✅ 100% Terminé]`
- **Constat :** À l'ouverture de la modale de booster (`BoosterOpeningModal.tsx`), le booster se déchirait automatiquement après un court délai (550 ms), empêchant le joueur de contempler le sachet scellé et de cliquer pour le déchirer manuellement.
- **Actions réalisées :**
  - [x] Supprimer le déclenchement automatique `autoTearTimer` dans `BoosterOpeningModal.tsx`.
  - [x] Maintenir le booster scellé à l'état `'sealed'` avec le bouton interactif « Déchirer le Booster » et le clic sur le paquet.

---

### 3. 🔍 Ajustement du zoom des cartes (Empêcher d'être caché par le bord de la fenêtre) `[✅ 100% Terminé]`
- **Constat :** Lors du zoom sur une carte dans la modale d'inspection (`CardDetailModal.tsx`), l'agrandissement par CSS `transform: scale()` débordait vers le haut (coordonnées négatives) et était caché par le bord supérieur de la fenêtre.
- **Actions réalisées :**
  - [x] Système de déplacement / panoramique interactif (`pan: { x, y }`) par glisser-déposer (souris et tactile) lorsque la carte est zoomée (`scale > 1.05`) avec clamping de sécurité.
  - [x] Ancrage `transformOrigin: 'top center'` et adaptation dynamique de la hauteur du conteneur pour que le haut de la carte ne dépasse jamais vers le haut de l'écran et ne recouvre pas les contrôles.
  - [x] Ajout du mode « Plein écran / Loupe centrée » (`Maximize2`) centré dans le viewport (`max-h-[72dvh] max-w-[85vw]`) avec contrôles flottants et support touche Échap, 100% garanti sans coupure.

---

### 4. 🦉 Harmonisation du « Déniché par » des Micro-Indés pour ne mettre que Hibouxe `[✅ 100% Terminé]`
- **Constat :** Plusieurs micro-indés de la sélection officielle affichaient "Quentin Beaud", "Communauté Hoot" ou "Hoot Bot" dans le champ `discoveredBy`.
- **Actions réalisées :**
  - [x] Remplacement de toutes les occurrences dans `src/data/microIndies.ts` pour que les 35 pépites portent uniformément la mention `discoveredBy: "Hibouxe"`.

---

### 5. 🛡️ Accès d'administration & validation des jeux Micro-Indés proposés `[✅ 100% Terminé]`
- **Constat :** Lorsqu'un visiteur propose un micro-indé via le formulaire, le jeu est enregistré avec `approved: false` dans `micro_indies.json`, mais l'administrateur n'avait pas d'accès direct pour consulter la file d'attente, valider ou refuser les jeux soumis.
- **Actions réalisées :**
  - [x] Ajout des actions d'administration sécurisées dans `public/api/micro_indies.php` (`admin_list`, `admin_approve`, `admin_unapprove`, `delete`) sous contrôle strict `isCreatorAdminAuthorized()`.
  - [x] Intégration des données de `micro_indies.json` dans l'endpoint `admin_overview` de `public/api/track.php` avec métriques des fichiers JSON.
  - [x] Ajout des fonctions et interfaces clientes dans `src/services/adminService.ts` (`approveAdminMicroIndie`, `deleteAdminMicroIndie`).
  - [x] Création de l'onglet dédié « Micro-Indés » (`microIndies`) dans `AdminDashboardModal.tsx` avec compteurs de badges en attente, prévisualisation complète de chaque proposition, bouton de validation en 1 clic (`Valider & Publier`) et suppression/rejet.
  - [x] Ajout d'un bouton d'accès rapide modération avec icône de bouclier dans `MicroIndieHub.tsx` pour l'administrateur Hibouxe connecté.

### 6. 💖 Toggle Like / Unlike et persistance des compteurs Micro-Indés `[✅ 100% Terminé]`
- **Constat :** Les votes sur les micro-indés ne permettaient pas de retirer son vote (contrairement aux pépites Steam). De plus, les compteurs de likes des 35 pépites initiales n'étaient pas persistés sur le serveur : au rechargement (Ctrl+F5), le cœur restait rouge mais le compteur retombait à sa valeur initiale et ne bougeait plus au clic.
- **Actions réalisées :**
  - [x] Implémenter le toggle Like / Unlike dans `MicroIndieHub.tsx` avec `isCurrentlyLiked ? 'unlike' : 'like'`.
  - [x] Sauvegarder de façon centralisée et atomique (`LOCK_EX`) les compteurs de likes de **tous les jeux** dans `micro_indies_votes.json` via `$vData['counts']`.
  - [x] Renvoyer `likesMap` dans les endpoints `action=list` et `action=user_likes` et l'appliquer au chargement initial du frontend pour écraser les compteurs par défaut.
  - [x] Retirer l'émoji diamant `💎` après les prix Steam.

---

### 7. 🎨 Audit Global UI/UX & Perfectionnement Ergonomique `[✅ 100% Terminé]`
- **Priorité :** P2 (Expérience utilisateur, design system & confort visuel)
- **Constat :** Suite aux nombreux ajouts de fonctionnalités (tchat privé, amis mutuels, boutique, cartes, micro-indés, mini-jeux), un audit complet de cohérence UI/UX s'impose pour uniformiser l'ergonomie, la hiérarchie visuelle, les contrastes, l'accessibilité et la fluidité mobile.
- **Actions prévues :**
  - [x] Revue globale de la cohérence visuelle et typographique (thème sylvestre, polices, tailles, arrondis, ombres).
  - [x] Audit responsive mobile & tablette (padding, overflow, zones de touch 48x48px, modales plein écran sur smartphone).
  - [x] Audit des contrastes et lisibilité des textes (respect des normes WCAG AA sur fonds sombres/verts).
  - [x] Feedback utilisateur & micro-interactions (états de survol, focus clavier, animations subtiles, sons et retours haptiques).
  - [x] Clarté de la navigation et réduction de la charge cognitive (simplification des menus, clarté des statuts et notifications).

---

### 8. 🌾 Réparation de l'action GitHub « Daily Indie Games Harvest » (Élimination des faux positifs) `[✅ 100% Terminé]`
- **Constat :** Le workflow automatique de moissonnage rejetait agressivement d'authentiques chefs-d'œuvre indépendants (*Mark of the Ninja*, *Dust: An Elysian Tail*, *Risk of Rain*, *TowerFall Ascension*, *Rust*, *SUNLESS SEA*, *The Ascent*, *SpyCat: Codename Wu*, *Bodycam*) sous de faux labels d'interdiction (`[Filtré Adulte FR]`, `[Filtré Content Descriptor]`, `[Filtré Âge 18+]`).
- **Causes identifiées :**
  1. `ADULT_CONTENT_DESCRIPTOR_IDS` contenait à tort les descripteurs Valve `1` (*Some Nudity / Mild sexual references*) et `5` (*General Mature Content / Violence*), bloquant des jeux comme *TowerFall Ascension* ou *Rust*. Seuls les descripteurs `3` (*Adult Only Sexual Content*) et `4` (*Frequent Sexual Content*) correspondent aux contenus NSFW/porno stricts.
  2. Le test d'éditeur AAA (`isNonIndieOrAAA`) était appelé à l'intérieur du filtre adulte `isAdultOrInappropriate`. Lorsqu'un jeu indé disposait d'un accord d'édition console tiers (ex: Klei avec Microsoft Studios pour *Mark of the Ninja*, Dean Dodrill avec Xbox Game Studios pour *Dust*, Hopoo Games avec 2K pour *Risk of Rain*), il était faussement bloqué sous le libellé « Filtré Adulte ».
  3. Rejet automatique sans discernement de tout jeu avec `required_age >= 18`, pénalisant les créations indés d'horreur ou d'action classées M / PEGI 18 (*The Ascent*, *Hotline Miami*, *CARRION*, *Darkwood*).
  4. Mots-clés trop génériques dans `ADULT_BANNED_KEYWORDS` : `drug`/`drugs` (bloquait *SpyCat: Codename Wu* pour une enquête sur un trafic pharmaceutique), `sexual` (bloquait *Sunless Sea* sur ses notes PEGI/ESRB), `nudity` (bloquait l'option de censure de *Rust*).
- **Actions réalisées :**
  - [x] Restreindre strictement `ADULT_CONTENT_DESCRIPTOR_IDS` à `new Set<number>([3, 4])`.
  - [x] Créer les listes de protection absolue `KNOWN_INDIE_APP_IDS` et `KNOWN_INDIE_STUDIOS` (Klei, Hopoo, Facepunch, Failbetter, Neon Giant, Extremely OK Games, etc.).
  - [x] Dissocier le filtre AAA du filtre Adulte dans `dailyIndieHarvest.ts` pour des alertes séparées et explicites (`⛔ [Filtré Studio AAA]` vs `⛔ [Filtré Adulte FR]`).
  - [x] Supprimer le blocage systématique `required_age >= 18` pour préserver les jeux d'action/horreur indés légitimes.
  - [x] Nettoyer `ADULT_BANNED_KEYWORDS` en supprimant `drug`/`drugs`/`mature content` et en ciblant précisément les actes explicites composés (`sexual acts`, `explicit sexual`, `sexual violence`, `explicit sex`, etc.).
  - [x] Validation par banc de test automatisé : 100% de succès (jeux indés admis, jeux NSFW réels type *Femboy Ghost* et *Drag'n Wash* strictement bloqués).

---

### 9. 🦉 Hoot Odyssey (Jeu Idle Bêta) — Feuille de Route d'Amélioration Globale `[En cours / Planifié]`
- **Constat :** La première version fonctionnelle de l'Odyssée Céleste est en place, mais nécessite un saut qualitatif majeur pour s'éloigner d'un aspect austère et offrir un véritable « game feel » captivant, gratifiant et visuel.
- **Axes prioritaires détaillés dans `IDLE_GAME_DESIGN.md` (Section 12) :**
  - [ ] **Carte Interactive du Monde (World Map / Route Map)** : Visualisation cartographique stylisée des biomes (Clairière, Canopée, Grottes, Cimes, Enfers, Néant) avec embranchements, routes 1 à 5, indicateurs de complétion et boss de zone.
  - [x] **Pokédex de Route & Radar de Butin (Route Loot Dex)** `[✅ 100% Terminé]` : Réglette visuelle sous chaque route affichant les pépites capturables (silhouettes sombres non découvertes avec taux de drop naturels, capsules officielles Steam débloquées avec niveau de capture, cadres holographiques prismatiques), jauge de complétion et de maîtrise de route (+15% Sève), case à cocher d'auto-progression manuelle (désactivée par défaut pour un farming libre à la Pokéclicker), et suppression du système de vagues (remplacé par quota d'accès requis puis compteur total de vaincus).
  - [ ] **Révolution Graphique & "Juiciness" de Combat** : Décors peints multi-couches en parallaxe, tracé de taillade SVG réactif au clic/touch, micro screen-shake sur coups critiques, flinch et flash blanc sur les monstres, drain dynamique de PV et éclats de sève 60 FPS.
  - [ ] **Compagnon Protecteur Actif** : Possibilité d'assigner l'un de ses 256 jeux capturés au bord de l'arène avec une jauge d'énergie déclenchant un pouvoir ultime thématique.
  - [ ] **Coffres de Premier Passage (First-Clear Chests)** : Coffres animés à l'ouverture lors de la première victoire sur une route offrant de gros butins et des boosters de cartes.

---

## 🔴 Phase 1 : Urgences Critiques, Intégrité du Jeu & Image (Priorité P0)

### 1. 🛡️ Résolution de l'erreur « Jeton CSRF invalide ou expiré » sur les suggestions de jeux `[✅ 100% Terminé]`
- **Constat :** Lorsque l'administrateur validait ou gérait une proposition de jeu dans le tableau de bord, une erreur apparaissait : *« Jeton de protection CSRF invalide ou expiré, Veuillez recharger la page »*, bloquant la modération.
- **Actions réalisées :**
  - [x] Correction dans `public/api/admin_auth.php`, `public/api/track.php` et `public/api/admin_games.php` pour fournir `getAdminCsrfToken()` dans toutes les réponses JSON administratives.
  - [x] Ajout de l'extraction multi-formats (en-tête `X-CSRF-Token`, formulaires POST et corps JSON brut `php://input`).
  - [x] Refonte de `src/services/adminService.ts` avec routage centralisé `postAdminTrack` et `postAdminGames`, injection systématique du jeton CSRF et mécanisme de rafraîchissement transparent auto-retry sur code 403.

### 2. 🔗 Mini-jeu « Connections » (Linkle) : Uniformisation des jeux entre utilisateurs `[✅ 100% Terminé]`
- **Constat :** Les joueurs ne rencontraient pas toujours la même grille de 16 jeux ou les mêmes catégories le même jour dans Linkle, rompant l'expérience du jeu quotidien partagé.
- **Actions réalisées :**
  - [x] Remplacement du tri non standard `.sort(() => rand() - 0.5)` par un algorithme de mélange de Fisher-Yates déterministe `shuffleWithRand` dans `src/data/connectionsPuzzles.ts`.
  - [x] Pré-tri canonique stable des règles et de la bibliothèque de jeux par identifiant (`id.localeCompare`) avant filtrage pour garantir une parité 100% absolue et déterministe entre tous les navigateurs (Chrome, Safari iOS, Firefox).

### 3. 🖼️ Remplacement du logo Google Search & SEO par le logo actuel `[✅ 100% Terminé]`
- **Constat :** Lors d'une recherche sur Google, le snippet de résultat affichait encore l'ancien logo ou favicon du site au lieu du logo officiel actuel de Hoot Indie Games.
- **Actions réalisées :**
  - [x] Régénération complète de toutes les résolutions d'icônes à partir du master `public/logo.png` haute définition (4000x4000) : `logo-512.png`, `apple-touch-icon.png` (180x180), `favicon-192x192.png`, `favicon-96x96.png`, `favicon-48x48.png` (cible Google Search), `favicon-32x32.png`, `favicon-16x16.png`, et `favicon.svg`.
  - [x] Génération d'un véritable conteneur ICO multi-résolutions (`favicon.ico` 256x256 multi-calques).
  - [x] Synchronisation des métadonnées du pré-rendu SEO (`scripts/generateSeoIndex.ts`) et régénération automatique de `index.html`.

### 4. 🎵 Mini-jeu Blind-Test : Correction des musiques & de la piste sonore `[✅ 100% Terminé]`
- **Constat :** Des incohérences ont été constatées dans le Blind-Test : des morceaux associés étaient erronés (la piste audio de *Cult of the Lamb* ne correspondait pas au vrai morceau du jeu en fallback synthé et le fichier MP3 manquait), et la barre temporelle présentait un décalage visuel majeur entre les repères d'écoute et les libellés de secondes.
- **Actions réalisées :**
  - [x] **Intégration de la piste officielle (`cult-of-the-lamb.mp3`)** : Encodage de l'extrait officiel de *Cult of the Lamb* ("Praise the Lamb" par River Boy) au format MP3 standard 128 kbps avec tags ID3v2 dans `public/audio/blindtest/cult-of-the-lamb.mp3`.
  - [x] **Harmonisation de la mélodie de secours (`blindtestPuzzles.ts`)** : Remplacement de l'instrument (`synth`), du tempo (112 BPM) et de la tablature harmonique de repli en Ré mineur pour correspondre fidèlement au thème de River Boy.
  - [x] **Synchronisation absolue de l'horloge audio (`BlindTestGame.tsx`)** : Remplacement du calcul approximatif basé sur `performance.now()` par l'horloge matérielle Web Audio `ctx.currentTime - handle.startTime`, éliminant tout décalage d'affichage ou latence de lecture.
  - [x] **Alignement exact de la barre Heardle & des graduations** : Positionnement en pourcentages stricts (`leftPct`) de chaque marqueur et libellé temporel (0s, 1.5s, 3s, 6s, 11s, 18s) et normalisation de la durée maximale à `TOTAL_MAX_DURATION = 18.0s`.

---

## 🟠 Phase 2 : Rétention Quotidienne, Social & Jeu de Cartes (Priorité P1)

### 5. 🌾 Adaptation & Automatisation du workflow « Daily Harvest » (Nouveaux jeux & Pépites) `[✅ 100% Terminé]`
- **Constat :** L'action automatisée « Daily Harvest » devait être adaptée pour être 100% compatible avec la nouvelle architecture refactorisée du site, injecter continuellement de nouveaux jeux chaque jour (y compris des créations émergentes ou moins bien notées) et enrichir la sélection de pépites certifiées.
- **Actions réalisées :**
  - [x] Révision des seuils dans `scripts/dailyIndieHarvest.ts` : assouplissement de `MIN_CATALOG_REVIEWS` à 5 et `MIN_CATALOG_POSITIVE` à 0.50 pour capturer les jeux émergents et confidentiels ; seuil pépites certifiées ajusté à 350 reviews (82%+ positif).
  - [x] Décuplement du sourcing : intégration de 403 pépites curatées (`target_appids.json`), requêtes multi-genres Steam (Roguelike, Metroidvania, Deckbuilder, Pixel Art, Platformer, etc.) et pagination étendue.
  - [x] Préservation automatique de `EXCLUDED_FROM_MINI_GAMES` et des règles d'audit anti-hallucination (`npm run audit-db` à 100%).
  - [x] Mise à jour du workflow GitHub Actions `.github/workflows/daily-indie-harvest.yml` avec conservation du cache des métadonnées Steam (`steam_cache.json`, `steam_store_cache.json`).

### 6. ☁️ Synchronisation Cloud Multi-Appareils au chargement du site `[✅ 100% Terminé]`
- **Constat :** Lorsqu'un joueur connecté arrivait sur le site depuis un autre appareil (ex: second PC, smartphone), sa progression locale antérieure pouvait écraser ou ne pas refléter sa dernière sauvegarde Cloud synchronisée.
- **Actions réalisées :**
  - [x] Détection et réconciliation intelligente dans `public/api/user_cloud_sync.php` avec recherche multi-clés candidates (`steam_xxx.json`, `user_xxx.json`, `name_xxx.json`) et miroir automatique entre identifiants liés.
  - [x] Résolution de la concurrence asynchrone (`inFlightSyncPromise`) dans `src/services/userCloudSyncService.ts` : les synchronisations forcées avec stratégie `replace` ou `merge` attendent la fin des requêtes en cours pour charger les données distantes fraîches.
  - [x] Application réactive immédiate de l'état distant dans `UserAccountProvider.tsx` (`apiGetSession()`, `login()`, `connectSteamByIdentifier()` et `handleCloudRestored`) sans closure périmée sur les rôles admin.
  - [x] Algorithme de fusion non-destructif : `Math.max` pour les plumes, séries de victoires et distributions, union dédupliquée pour les succès, puzzles du calendrier, cosmétiques et collection de cartes.

### 7. 📅 Vérification du système de « Série de jeu » (Streaks) & synchronisation Calendrier `[✅ 100% Terminé]`
- **Constat :** Le système de décompte des séries consécutives (streaks) et son reflet dans l'archive/calendrier des jours joués nécessitait un audit de fiabilité mathématique et d'affichage.
- **Actions réalisées :**
  - [x] Réécriture de `getYesterdayDateString` avec arithmétique UTC absolue dans `src/utils/streakManager.ts`, immunisée contre les décalages de fuseau horaire et de changements d'heure (DST).
  - [x] Création de la fonction canonique `getEffectiveCurrentStreak` pour purger les « séries fantômes » lorsque plus de 2 jours s'écoulent sans victoire.
  - [x] Sécurisation stricte de `canRescueYesterday` dans `src/context/GameStatsProvider.tsx` : la fenêtre de rattrapage de la veille n'est autorisée que si la série était active avant-hier (`lastWon === dayBeforeYesterdayStr`), interdisant tout saut temporel illégitime.
  - [x] Assainissement automatique des séries expirées dès l'initialisation de `GameStatsProvider.tsx`.
  - [x] Actualisation réactive de `CalendarArchiveModal.tsx` lors de `hoot_daily_game_completed` et mise en valeur par flamme dorée des journées passées entièrement remportées (8/8 mini-jeux gagnés).
  - [x] Affichage unifié de la série effective dans `MiniGamesHub.tsx` et `StatsModal.tsx`.

### 8. 🃏 Jeu de Cartes : Cumul de 2 boosters gratuits & recharge toutes les 12h `[✅ 100% Terminé]`
- **Constat :** Les boosters gratuits doivent récompenser la régularité sans pénaliser les joueurs qui ne peuvent pas se connecter toutes les 12 heures exactes.
- **Actions réalisées :**
  - [x] Implémentation du stockage dynamique `FreeBoostersStock` dans `src/services/cardCollectionService.ts` plafonné à **2 boosters gratuits maximum**.
  - [x] Algorithme de recharge automatique de 12 heures (`BOOSTER_RECHARGE_MS = 43 200 000 ms`), préservant la continuité temporelle entre ouvertures successives.
  - [x] Le décompte de 12h ne démarre ou ne continue que lorsque la réserve est inférieure à 2 (`count < 2`).
  - [x] Hook React temps-réel `useFreeBoostersStock` avec réactivité à la seconde et rafraîchissement au focus (`visibilitychange`).
  - [x] Synchronisation et réconciliation Cloud souveraine (`UserCloudSavePayload.freeBoostersStock`) dans `userCloudSyncService.ts`.
  - [x] Refonte de l'interface de l'Album des Cartes (`CardsBinderView.tsx`) avec badges de stock (`1/2` ou `2/2`), barre de progression de la recharge 12h, minuteur interactif et boutons réactifs.
  - [x] Bouton d'enchaînement direct dans la modale d'ouverture (`BoosterOpeningModal.tsx`) indiquant clairement le nombre de boosters gratuits restants en réserve.

### 9. 👥 Correction de l'affichage « Progression du jour de mes amis » `[✅ 100% Terminé]`
- **Constat :** L'encart de suivi de la progression quotidienne des amis (qui a réussi l'Indledle, le Pixel, le Screenle, le Linkle, etc. aujourd'hui) ne s'affichait pas correctement ou n'actualisait pas les scores en temps réel.
- **Actions réalisées :**
  - [x] Correction de l'extraction multi-formats dans `extractCurrentDailyScores` (`friendsService.ts`) pour capturer correctement `guessIds` (Screenle, Indledle), `previousGuesses` (Linkle), `attemptsCount` (Pixel, Review, BlindTest), `correctPlacements` (Chrono) et `score` (Profille).
  - [x] Ajout de l'écoute réactive dans `FriendsProvider.tsx` (`hoot_daily_game_completed`, `hoot_daily_states_updated`, `hoot_stats_updated`) pour propager immédiatement la complétion de jeu sur le serveur souverain.
  - [x] Rafraîchissement automatique de la liste des compagnons (`refreshFriends`) dès l'ouverture de `FriendsModal.tsx`.
  - [x] Filtrage temporel strict dans `FriendsModal.tsx` comparant `daily.date === todayStr` pour afficher « Non débuté aujourd’hui » avec les tirets neutres si l'ami n'a pas encore joué aujourd'hui, empêchant l'affichage erroné des scores de la veille.

### 10. 🎴 Synchronisation Pépites & Cartes : Création / Suppression automatique `[✅ 100% Terminé]`
- **Constat :** Chaque pépite du catalogue doit posséder sa carte à collectionner correspondante dans le système de cartes.
- **Actions réalisées :**
  - [x] Script d'audit automatisé `scripts/auditGemsCardsSync.ts` et commande dédiée `npm run audit-cards` validant la parité 1:1 exacte entre les pépites certifiées et les cartes du Sanctuaire (250/250).
  - [x] Intégration du contrôle de parité 1:1 directement dans `scripts/verifySteamDatabase.ts` (`npm run audit-db`).
  - [x] Synchronisation réactive globale du pool dynamique de cartes dans `SteamCatalogProvider.tsx` (`setDynamicCardsPool(buildCardsFromGames(gems))`) dès le chargement initial et à chaque événement `hoot_steam_catalog_updated`.
  - [x] Ajout des fonctions de résolution et repli sûres `getCardById(cardId)` et `createFallbackCard(cardId)` dans `cardsData.ts` pour garantir la rétrocompatibilité des inventaires de joueurs même si une pépite est exclue ou masquée par l'administrateur.
  - [x] Gestion gracieuse des cartes orphelines dans `CardsBinderView.tsx` (conservées et affichées dans l'album si possédées), `CardView.tsx` (badge `ARCHIVE`), `CardDetailModal.tsx` et `disenchantCard` (recyclage sécurisé de doublons sans erreur).
  - [x] Remplacement du total de cartes en dur (« sur 185 ») par le décompte dynamique en temps réel (`getDynamicCardsPool().length`).

---

## 🟡 Phase 3 : Outils de Super-Admin & Internationalisation (Priorité P2)

### 11. 👑 Privilèges & Commandes Super-Admin pour Hibouxe (Distribution de récompenses) `[✅ 100% Terminé]`
- **Constat :** Le super-administrateur Hibouxe a besoin d'outils d'animation communautaire et de support pour récompenser directement des joueurs (concours, dédommagements, fidélité).
- **Actions réalisées :**
  - [x] Action backend sécurisée `give_reward` dans `public/api/track.php` sous vérification stricte `ADMIN_STEAM_ID` permettant d'attribuer des plumes d'or, une carte de collection avec option de variante holographique, un motif personnalisé et mise à jour atomique de `cardCollection`, `feathers.bonus` et `pendingAdminRewards`.
  - [x] Service API `giveAdminReward` dans `src/services/adminService.ts` et acquittement `ack_reward` avec `acknowledgeAdminReward` dans `userCloudSyncService.ts`.
  - [x] Interface de distribution royale intégrée dans `AdminDashboardModal.tsx` avec bouton d'action `Gift` par joueur, presets de plumes (+50, +100, +250, +500, +1000, +2500, +5000), sélecteur de cartes dynamique filtrable par titre/rareté/développeur, toggle holographique et motifs pré-remplis.
  - [x] Modale de célébration côté joueur `AdminRewardCelebrationModal.tsx` montée dans `App.tsx` affichant le décret royal, les plumes gagnées, la carte reçue (avec animation holographique si applicable) et bouton d'acquittement automatique.

### 12. 🌐 Affichage des prix Steam & Itch.io selon la localisation ou la langue choisie (ex: Yen au Japon) `[✅ 100% Terminé]`
- **Objectif :** Afficher et convertir automatiquement les prix des jeux Steam et Itch.io dans la devise et le format correspondant à la langue ou au pays sélectionné par le visiteur sur le site (exemple : prix en Yen `¥` pour le Japon / langue `ja`, Dollar `$` pour `en`, Real `R$` pour `pt-BR`, Euro `€` pour `fr`, `de`, `es`).
- **Actions réalisées :**
  - [x] **Backend Steam API (`public/api/micro_indies.php` & `public/api/track.php`)** : Prise en charge des paramètres `cc` (`cc=jp`, `cc=us`, `cc=br`, `cc=fr`, etc.) et `l` (`japanese`, `english`, `brazilian`, `french`, etc.) lors des requêtes à l'API Steam Store `store.steampowered.com/api/appdetails`, avec calcul et génération automatique de la grille tarifaire complète multilingue (`pricingText` pour `fr`, `en`, `es`, `de`, `ja`, `pt-BR`).
  - [x] **Itch.io & conversions de devises (`src/utils/currencyFormatter.ts`)** : Module utilitaire dédié avec configuration des devises (EUR, USD, JPY, BRL), taux de conversion Steam régionaux, règles d'arrondi (Yen sans décimales avec séparateur de milliers), libellé "Gratuit / Free / 無料" adapté, et extraction de prix depuis les chaînes arbitraires.
  - [x] **Frontend réactif (`MicroIndieHub.tsx`, `GemExplorerHome.tsx`, `SteamCatalogExplorer.tsx`, `ToolboxHub.tsx`)** : Sélection dynamique des devises selon `i18n.language` avec repli élégant, badges de soldes et prix barrés convertis.
  - [x] **Suite de tests unitaires validée (`scripts/testCurrencyFormatting.ts`)** : 6/6 tests réussis (devises, centimes, réductions, jeux gratuits, extraction regex, dictionnaire bilingue).

### 13. 👑 Redirection & Retour Automatique vers le Panneau Admin lors de l'activation de Session Steam `[✅ 100% Terminé]`
- **Priorité :** P1 (Haute priorité — Fluidité d'administration & expérience utilisateur)
- **Difficulté :** Faible-Moyenne (Gestion du paramètre `redirect=admin` dans le flux OpenID 2.0 Valve + routage `#admin`)
- **Constat :** Lorsqu'une session administrative expire ou doit être activée et que l'administrateur clique sur « Activer ma Session Steam » dans `AdminDashboardModal.tsx`, la validation OpenID le redirigeait brutalement sur la console PHP brute `/api/track.php` au lieu de le renvoyer automatiquement sur le site avec le panneau d'administration rouvert.
- **Actions réalisées :**
  - [x] **Préservation de la cible dans le flux OpenID (`public/api/track.php`) :** Conserver et transmettre le paramètre `redirect=admin` dans `openid.return_to` lors de la redirection vers les serveurs de Valve, et redirection immédiate vers Steam sans afficher de page HTML intermédiaire inutile.
  - [x] **Redirection automatique vers l'application (`public/api/track.php`) :** Dès que l'assertion Steam de l'administrateur officiel (`$steamId === ADMIN_STEAM_ID`) est validée avec succès, vérifier si `$_GET['redirect'] === 'admin'` et rediriger automatiquement vers `/#admin` (avec session PHP active) au lieu de rediriger vers `track.php`.
  - [x] **Lien d'activation typé (`src/components/admin/AdminDashboardModal.tsx`) :** Mettre à jour le bouton « Activer ma Session Steam » pour pointer vers `/api/track.php?redirect=admin`.
  - [x] **Prise en charge du Hash `#admin` (`src/App.tsx`) :** Initialiser `isAdminDashboardOpen` à `true` si le hash au chargement est `#admin` et écouter l'événement `hashchange` pour ouvrir immédiatement le panneau d'administration lors d'une navigation vers `#admin`, avec nettoyage propre de l'URL à la fermeture.

### 14. 💡 Boîte à Pépites : Purge & Retrait automatique des suggestions validées ou supprimées `[✅ 100% Terminé]`
- **Priorité :** P1 (Haute priorité — Modération & cohérence du panneau administrateur)
- **Difficulté :** Faible-Moyenne (Extraction robuste de l'ID en POST/GET/JSON dans `track.php` + mise à jour optimiste réactive)
- **Constat :** Les jeux proposés dans la boîte à pépites restaient affichés dans le panneau d'administration même après avoir été validés (en 1-clic ou après édition de fiche) ou supprimés (icône corbeille). La cause venait de `public/api/track.php` dans l'action `delete_suggestion` qui ne lisait que `$_GET['id']` alors que la requête administrative sécurisée POST envoyait l'identifiant dans le corps `$_POST['id']`, empêchant ainsi toute suppression réelle dans `suggestions.json`.
- **Actions réalisées :**
  - [x] **Correction Backend (`public/api/track.php`) :** Extraction universelle et sécurisée de l'identifiant (`$_POST['id']`, `$_GET['id']`, payload JSON brut `php://input` et `appId`), avec filtrage atomique sous verrouillage `LOCK_EX` garantissant la suppression effective dans `suggestions.json`.
  - [x] **Mise à jour Optimiste Frontend (`src/components/admin/AdminDashboardModal.tsx`) :** Retrait immédiat de l'élément dans `data.suggestions.list` et décrémentation du compteur `data.suggestions.total` lors de `handleDeleteSuggestion`, `handleQuickApproveSuggestion` et `onGameSaved`, offrant un retour visuel instantané sans latence réseau.

### 15. 🎴 Algorithme & Attribution Fiable de Rareté des Cartes pour les Nouvelles Pépites (Spelunky & Masterpieces) `[✅ 100% Terminé]`
- **Priorité :** P1 (Haute priorité — Économie de cartes, fidélité & équité du jeu)
- **Difficulté :** Moyenne (Calibration multi-critères, passage de métadonnées Steam en temps réel et auto-réparation)
- **Constat :** Lors de l'ajout d'une nouvelle pépite au catalogue depuis le panneau d'administration ou la validation en 1-clic des suggestions communautaires (exemple : *Spelunky*), la carte créée était arbitrairement reléguée au rang « Commune ». Trois causes majeures ont été identifiées :
  1. `handleQuickApproveSuggestion` n'extrayait pas les données d'avis Steam et ne définissait aucun `cardRarity` dans l'objet de jeu sauvegardé, entraînant une valeur `null` persistée sur le serveur.
  2. `computeGameRarity` s'appuyait uniquement sur le dictionnaire statique `steamStoreData.ts`, qui ne contenait pas les nouvelles pépites récemment ajoutées, et ignorait les avis Steam dynamiques récupérés en direct.
  3. Les seuils de rareté étaient décalés de la réalité du jeu vidéo indépendant (100 000 avis exigés pour Légendaire, inaccessible pour des chefs-d'œuvre cultes comme *Spelunky* avec ~17k avis à 92% positifs). De plus, *Spelunky* (1 & 2) n'était pas inclus dans le Panthéon sacré intemporel `LEGENDARY_GAME_IDS`.
- **Actions réalisées :**
  - [x] **Panthéon Sacré & Masterpieces (`src/data/cardsData.ts`) :** Ajout des identifiants et variantes phonétiques (`'spelunky'`, `'speluncky'`, `'spelunky-2'`) directement dans `LEGENDARY_GAME_IDS`, avec normalisation insensible à la casse et vérification croisée du titre (`normTitle`).
  - [x] **Étalonnage Équilibré des Seuils Indés (`STEAM_RARITY_THRESHOLDS`) :** Réajustement rigoureux des seuils Steam Store pour préserver une économie de boosters équilibrée (Légendaire : ≥ 90 000 avis ou ≥ 60 000 avec 95%+ ; Épique : ≥ 25 000 avis ou ≥ 15 000 avec 92%+ ; Rare : ≥ 4 000 avis ou ≥ 2 000 avec 88%+ ; Commune : < 4 000 avis).
  - [x] **Support d'Avis Dynamiques en Direct (`computeGameRarity`) :** Prise en charge du paramètre direct `reviewsData?: SteamReviewMetrics` et de `game.steamReviews`, permettant le calcul immédiat de la rareté exacte dès l'interrogation de l'API Steam sans attendre une recompilation du bundle statique.
  - [x] **Enregistrement Immédiat Store Data (`src/data/steamStoreData.ts`) :** Intégration officielle des métadonnées certifiées de *Spelunky* (AppID 239350 : 16 679 avis, 92% positifs, 14,99 €) et appel systématique à `registerSteamStoreData()` lors de la validation.
  - [x] **Validation 1-Clic Sécurisée (`src/components/admin/AdminDashboardModal.tsx`) :** Extraction automatique de `lookupJson.reviews`, calcul réactif de `computedCardRarity` et injection impérative de `cardRarity: computedCardRarity` dans `gameToSave` et `gameToPrefill`.
  - [x] **Interface Administrateur Enrichie (`src/components/admin/AdminGamesManager.tsx`) :** Remplissage automatique de la rareté suggérée dès le clic sur « Auto-remplir depuis Steam », affichage dynamique de la rareté déduite en temps réel dans les boutons de sélection et transmission des avis Steam lors de la sauvegarde.
  - [x] **Résilience & Auto-Réparation Backend (`public/api/admin_games.php` & `src/services/steamCatalog.ts`) :** Auto-guérison instantanée au chargement pour toute pépite existante présentant `cardRarity === null` (réparation automatique de Spelunky en Légendaire), et interdiction serveur de persister une rareté `null`.
  - [x] **Audit & Tests Validés :** 8/8 tests unitaires de rareté réussis, parité 1:1 certifiée à 250/250 cartes (`npm run audit-cards`), 250/250 jeux validés (`npm run audit-db`) et build réussi à 100%.

---

### 16. 🏷️ Affichage Fiable des Prix & Avis Steam pour les Jeux Issus de Suggestions Communautaires `[✅ 100% Terminé]`
- **Priorité :** P1 (Haute priorité — Clarté du catalogue, exactitude des prix & avis communautaires)
- **Difficulté :** Moyenne (Passage de bout en bout des métadonnées Steam Store, cache persistant et auto-réparation)
- **Constat :** Les jeux ajoutés depuis la « Boîte à pépites » (suggestions communautaires) ou créés manuellement par l'administrateur n'avaient pas leur prix Steam (et éventuelle promotion), ni leur pourcentage et appréciation d'avis affichés sur leurs cartes de catalogue. Les causes identifiées :
  1. Le dictionnaire statique `steamStoreData.ts` est figé à la compilation et ne contenait que les 494 jeux initiaux. Le cache dynamique en mémoire `DYNAMIC_STORE_CACHE` n'était pas persisté dans le LocalStorage et n'était jamais rechargé au démarrage.
  2. Lors de la validation d'une suggestion (`handleQuickApproveSuggestion` et `handleEditAndApproveSuggestion`), les champs de prix (`initialPriceCents`, `finalPriceCents`, `formattedFinalPrice`) étaient initialisés à zéro/vide au lieu d'extraire les données réelles de `lookupJson.dataFR.price_overview`.
  3. L'objet `gameToSave` et le formulaire `AdminGamesManager` n'incluaient pas `steamStoreData`, empêchant le backend d'enregistrer ces métadonnées dans `games_override.json`.
  4. Les composants `SteamCatalogExplorer.tsx` et `GemExplorerHome.tsx` ne cherchaient les métadonnées que dans `getSteamStoreData(appId)` sans repli sur `game.steamStoreData`, et `GemExplorerHome` n'utilisait pas `game.steamAppId` comme repli si `steamUrl` était absent.
- **Actions réalisées :**
  - [x] **Typage Global (`src/types/game.ts`) :** Ajout de la propriété optionnelle `steamStoreData?: SteamStoreGameData` sur l'interface canonique `Game`.
  - [x] **Cache Dynamique Persistant & Événements (`src/data/steamStoreData.ts`) :** Persistance automatique de `DYNAMIC_STORE_CACHE` dans `localStorage` sous la clé `'hoot_dynamic_steam_store_cache_v1'`, et diffusion de l'événement `'hoot_steam_store_data_updated'` lors de chaque enregistrement.
  - [x] **Extraction Complète des Prix & Avis (`src/components/admin/AdminDashboardModal.tsx`) :** Parsing complet de `price_overview`, gestion des jeux gratuits (`isFree`), formatage des remises et calcul des avis bilingues dans `handleQuickApproveSuggestion` et `handleEditAndApproveSuggestion`, avec enregistrement immédiat et attachement à `gameToSave` / `gameToPrefill`.
  - [x] **Intégration au Formulaire Admin (`src/components/admin/AdminGamesManager.tsx`) :** Ajout de l'état `formSteamStoreData`, extraction automatique des données de prix/avis lors du clic sur « Auto-remplir depuis Steam » et inclusion systématique de `steamStoreData` dans le payload de sauvegarde `gamePayload`.
  - [x] **Persistance & Auto-Guérison Serveur (`public/api/admin_games.php`) :** Assainissement et sauvegarde de `steamStoreData` dans `games_override.json` lors de `save_game`, et auto-guérison rétroactive des métadonnées de *Spelunky* (AppID 239350) dans `loadGameOverrides`.
  - [x] **Rapatriement en Tâche de Fond (`src/services/steamCatalog.ts`) :** Enregistrement au runtime de tous les `steamStoreData` présents dans les surcharges et méthode de rapatriement automatique `ensureStoreDataForCustomGames()` interrogeant `/api/suggest_game.php?action=lookup` en arrière-plan pour tout jeu personnalisé sans métadonnées.
  - [x] **Composants d'Exploration & Réactivité UI (`SteamCatalogExplorer.tsx`, `GemExplorerHome.tsx`, `SteamCatalogProvider.tsx`) :** Utilisation systématique de `getSteamStoreData(appId) || game.steamStoreData` avec repli `game.steamAppId`, écoute de l'événement `'hoot_steam_store_data_updated'` pour un rafraîchissement réactif instantané sans rechargement de page.
  - [x] **Audit & Build :** 250/250 cartes conformes (`npm run audit-cards`), 250/250 jeux validés (`npm run audit-db`) et compilation réussie (`npm run build`).

---

## 🔵 Phase 4 : Systèmes Avancés & Refactorisation Lourde (Priorité P3)

### 17. 💬 Système de Tchat Privé (Messagerie Directe entre Joueurs) `[✅ 100% Terminé]`
- **Constat :** Le tchat était jusqu'alors exclusivement un salon public global. Les joueurs ne pouvaient pas correspondre en privé.
- **Actions réalisées :**
  - [x] **Backend PHP Souverain (`public/api/chat.php`)** : Endpoints de messagerie directe `get_private_conversations`, `get_private_messages`, `send_private_message`, `mark_private_read`, `delete_private_message` avec génération de clés canoniques déterministes symétriques (`getCanonicalConversationKey`), stockage atomique sous verrouillage `LOCK_EX` dans `private_conversations.json`, bouclier anti-hameçonnage et modération anti-injures intégrés.
  - [x] **Service Frontend & Résilience Hors-ligne (`src/services/chatService.ts`)** : Typages stricts TypeScript sans aucun `any` (`PrivateMessage`, `PrivateConversation`, `PrivateParticipant`), résilience complète avec fallback LocalStorage automatique en environnement de développement ou déconnecté.
  - [x] **Gestion d'État & Compteurs Réactifs (`src/context/ChatContext.tsx` & `src/context/ChatProvider.tsx`)** : Synchronisation des onglets, gestion de l'interlocuteur actif, calcul du total des notifications non-lues (`unreadCount = publicUnreadCount + privateUnreadCount`), polling intelligent en arrière-plan et carillon audio discret (`soundFx.playChime()`) lors de l'arrivée d'un message direct.
  - [x] **Interface Graphique Moderne & Onglets Dédiés (`src/components/chat/ChatDrawer.tsx` & `src/components/chat/ChatPrivateView.tsx`)** : Barre d'onglets ergonomique (« Salons Publics » / « Messages Privés »), vue liste des correspondances avec indicateur en ligne, cadres de boutique et aperçu du dernier message, fil de discussion direct avec bulles sylvestres distinctives, accusés de lecture (« ✓ » / « ✓✓ ») et modale de suppression.
  - [x] **Interconnexion Sociale (`FriendsModal.tsx` & `ChatUserModerationModal.tsx`)** : Bouton « Message » sur chaque carte de compagnon ouvrant instantanément le tchat privé avec celui-ci, et bouton d'envoi de message privé depuis le profil ou au clic sur le pseudonyme/avatar d'un joueur dans le salon public.
  - [x] **Suite de Tests Validée (`scripts/testPrivateMessaging.ts`)** : 6/6 tests réussis (clé canonique symétrique, insensibilité casse/accents, arithmétique des badges de notifications).

### 18. 🤝 Système d'Amis avec Requête / Acceptation (Ajout Mutuel Bilatéral Sécurisé) `[✅ 100% Terminé]`
- **Priorité :** P1 (Haute priorité — Confiance, social & socle anti-spam)
- **Difficulté :** Moyenne-Élevée (Gestion atomique des demandes côté serveur PHP et réactivité UI)
- **Constat :** Auparavant, lorsqu'un joueur saisissait le code ami d'un autre utilisateur, l'ajout était unilatéral et immédiat sur son client local sans consentement ni notification pour le joueur ciblé. Pour instaurer un véritable réseau social de confiance et bloquer les messages non sollicités, l'amitié est désormais bilatérale et mutuellement consentie.
- **Actions réalisées :**
  - [x] **Protocole Backend Souverain (`public/api/friends.php`) :**
    - Stockage atomique sous verrouillage `LOCK_EX` et renommage POSIX des requêtes d'amitié avec statut (`pending`, `accepted`, `declined`, `canceled`) et table de réciprocité `'friendships'`.
    - Endpoint `send_friend_request` / `send_request` : Vérification du destinataire par code ou pseudonyme canonique, interdiction d'auto-invitation, acceptation réciproque automatique si requête croisée préexistante ou vers `HOOT-HIBOU`.
    - Endpoint `get_friend_requests` / `get_requests` : Récupération des demandes reçues (`incoming`) et envoyées (`outgoing`) enrichies des métadonnées joueur et présence en ligne.
    - Endpoint `respond_friend_request` / `respond_request` : Actions `accept` (liaison bilatérale mutuelle), `decline` et `cancel` avec nettoyage propre.
    - Endpoint `remove_friend` : Retrait bilatéral synchronisé de la relation d'amitié mutuelle.
    - Endpoint `are_friends` : Vérification booléenne externe de l'amitié mutuelle.
    - Préservation du statut du Fondateur Hibouxe (`HOOT-HIBOU`) comme guide d'accueil universel du Sanctuaire (auto-acceptation et liaison automatique).
  - [x] **Types & Services Frontend (`src/types/friends.ts`, `src/services/friendsService.ts`) :**
    - Définition des structures TypeScript strictes : `FriendRequest`, `FriendRequestStatus` (`pending` | `accepted` | `declined` | `canceled`), `isMutual?: boolean` sur `FriendPlayer`.
    - Fonctions clientes typées : `sendFriendRequestApi`, `fetchFriendRequestsApi`, `respondFriendRequestApi`, `removeFriendApi`, `checkAreFriendsApi`.
  - [x] **Gestion d'État Réactive (`src/context/FriendsContext.ts`, `src/context/FriendsProvider.tsx`) :**
    - Stockage réactif des requêtes en attente reçues (`pendingRequests`), envoyées (`sentRequests`) et compteur badge (`pendingRequestsCount`).
    - Méthodes `sendFriendRequest`, `respondFriendRequest`, `refreshRequests`.
    - Rafraîchissement automatique périodique (toutes les 2 min) et écoute d'événements (`visibilitychange`, `focus`).
  - [x] **Interface Graphique Ergonomique (`src/components/friends/FriendsModal.tsx`, `Navbar.tsx`) :**
    - Système d'onglets : « Mes Compagnons (N) » et « Demandes reçues (N) » avec pastille visuelle animée alertant des nouvelles invitations.
    - Cartes d'invitation avec avatar, pseudo, titre, date d'envoi et boutons 1-clic : « Accepter » (vert) et « Refuser » (rose).
    - Section rétractable des « Invitations envoyées (en attente) » avec possibilité d'annuler une demande.
    - Badges de notification `pendingRequestsCount` réactifs dans la Navbar (icône Compagnons et menu déroulant joueur).

---

### 19. 🛡️ Verrouillage Anti-Bot & Anti-Arnaque du Tchat Privé (Exclusivement entre Amis Mutuels) `[✅ 100% Terminé]`
- **Priorité :** P1 (Haute priorité — Sécurité primordiale & protection des utilisateurs)
- **Difficulté :** Moyenne (Vérification croisée backend + guidage ergonomique frontend)
- **Constat :** Pour éviter tout risque de spam automatisé, de faux messages de phishing (faux comptes se faisant passer pour des tiers ou envoyant des arnaques en message direct), la messagerie directe doit être strictement réservée aux compagnons mutuellement confirmés, à l'exception du Super-Admin / Fondateur Hibouxe pour le support officiel.
- **Actions réalisées :**
  - [x] **Contrôle d'Accès Backend Infranchissable (`public/api/chat.php`) :**
    - Dans l'action `send_private_message` : Vérification serveur impérative de la relation d'amitié mutuelle dans `friends_data.json` (`areFriendsMutual`) avant tout enregistrement de message.
    - Exception de sécurité : Communication directe toujours autorisée si l'un des participants est le Fondateur Hibouxe (`ADMIN_STEAM_ID` / `hibouxe_creator` / session admin authentifiée).
    - En cas de tentative d'envoi hors amitié mutuelle : Rejet HTTP 403 avec code `friends_only` et message clair : *« Pour lutter contre le spam et les arnaques, vous devez être amis mutuels pour échanger en privé. Envoyez-lui une demande d'ami ! »*.
  - [x] **Interface & Expérience Utilisateur (`src/components/chat/ChatPrivateView.tsx`, `chatService.ts`) :**
    - Dans la modale « Nouvelle Correspondance » : liste 1-clic des compagnons mutuels certifiés et d'Hibouxe, sans avoir besoin de taper de pseudo.
    - Si un pseudonyme ou code non-ami est cherché : affichage du panneau bienveillant Bouclier Anti-Bot & Anti-Arnaque avec bouton direct « Envoyer une demande d'amitié ».
    - En-tête du fil de discussion actif avec badges explicites : « 🤝 Compagnon Mutuel », « 👑 Fondateur » ou « ⚠️ Non-ami (Verrouillé) ».
    - Dans le fil de discussion non-ami : remplacement de la zone de saisie par le Bouclier Anti-Arnaque offrant en 1 clic l'envoi de la demande d'amitié (ou statut en attente / reçu).
    - Propagation transparente des messages d'erreur serveur dans le service de tchat.

---

### 20. 🔄 Véritable Système & Menu d'Échange de Cartes (Trade Bilatéral) `[✅ 100% Terminé]`
- **Priorité :** P2 (Priorité moyenne — Économie du jeu de cartes & collection)
- **Difficulté :** Élevée (Transactions atomiques sécurisées, double validation, cohérence des inventaires)
- **Constat :** Le bouton d'échange initial dans `CardDetailModal.tsx` se limitait à copier un lien dans le presse-papier ou poster un message texte dans le tchat public. Les joueurs ne pouvaient pas réaliser d'échanges réels et sécurisés de cartes avec leurs compagnons.
- **Actions réalisées :**
  - [x] **Backend PHP Souverain (`public/api/trades.php`) :**
    - Endpoints complets d'échange : `get_trades`, `create_trade`, `respond_trade`, `get_friend_binder`, `acknowledge_trade`.
    - Transactions atomiques sous verrouillage exclusif `LOCK_EX` et renommage POSIX dans `card_trades.json`.
    - Contrôle d'accès strict : échange restreint aux compagnons mutuellement confirmés (`areFriendsMutual`).
    - Validation stricte des inventaires : vérification de possession de la carte offerte (et de la carte demandée à l'acceptation).
    - Transfert bilatéral instantané : débit et crédit synchronisés dans les sauvegardes Cloud des deux utilisateurs (`public/api/user_saves/`) avec horodatage `tradesLastUpdated`.
    - Cycle de vie complet : `pending`, `accepted`, `declined`, `canceled`, `expired` (7 jours).
  - [x] **Préservation & Réconciliation Cloud (`public/api/user_cloud_sync.php`) :**
    - Ajustement de l'algorithme de fusion `mergeSaveData` : prise en compte de `tradesLastUpdated` pour empêcher l'arithmétique `max()` de ressusciter les cartes échangées ou recyclées.
  - [x] **Services & Idempotence Frontend (`src/types/trades.ts`, `src/services/tradesService.ts`) :**
    - Typages TypeScript stricts `CardTradeOffer`, `CreateTradePayload`, `FriendBinderData`.
    - Fonction `applyTradeToLocalCollection` idempotente : registre local `hoot_applied_trades_v1` empêchant tout double retrait de carte, et mise à jour de l'horodatage `tradesLastUpdated`.
  - [x] **Gestion d'État & Notifications (`src/context/TradesProvider.tsx`, `src/context/useTrades.ts`) :**
    - Polling intelligent (90s) & réveil au focus, carillon audio discret (`soundFx.playChime()`) lors de l'arrivée d'une offre entrante.
    - Compteur réactif d'offres en attente `pendingIncomingCount`.
  - [x] **Interface Graphique Moderne (`src/components/cards/TradeModal.tsx`) :**
    - 4 onglets : « Proposer un échange », « Offres reçues », « Offres envoyées », « Historique ».
    - Sélection visuelle des cartes avec filtres rareté, recherche, version normale/holographique, et affichage des doubles du compagnon ciblé.
    - Échanges précis (Carte X contre Carte Y) ou ouverts (Carte X contre « Au choix du compagnon » avec sous-modale de sélection de la contre-carte).
  - [x] **Interconnexions Globales :**
    - `CardDetailModal.tsx` : Bouton « Lancer un échange bilatéral sécurisé » et bouton « Échanger » sur chaque compagnon de la liste.
    - `FriendsModal.tsx` : Bouton direct « Échanger » avec icône `ArrowLeftRight` sur chaque fiche compagnon.
    - `CardsBinderView.tsx` : Bouton « Centre d'Échanges » avec badge de notifications dans l'en-tête du classeur.
    - `Navbar.tsx` : Badge de notifications animé sur l'onglet « Cartes » (barre desktop et menu mobile).
    - `App.tsx` : Intégration de `TradesProvider`, injection de `<TradeModal />` et écoute du hash `#trade` / `#trades`.
  - [x] **Suite de Tests Unitaires Validée (`scripts/testCardTrading.ts`) :**
    - 5/5 tests réussis (statuts du cycle de vie, débit/crédit initiateur, débit/crédit destinataire, idempotence anti-doublon, résolution « Au choix du compagnon »).

---

### 21. 🧹 Élimination Finale de la Dette Technique (Refactorisation des Monolithes restants) `[⏳ À faire]`
- **Priorité :** P3 (Maintenance & propreté architecturale — 0 dette technique)
- **Difficulté :** Élevée (Composants de grande taille avec logique d'état complexe)
- **Constat :** Bien que les règles de hooks et les types `any` aient été corrigés, et que l'immense `ArcadeModal.tsx` ait été découpé avec succès, il reste plusieurs composants React de plus de 1500 lignes qui violent le principe de Responsabilité Unique (Single Responsibility).
- **Actions à réaliser :**
  - [ ] **Nettoyage de `AdminDashboardModal.tsx` (3200+ lignes) :** Vérifier l'intégration finale des sous-onglets générés (`src/components/admin/tabs/`) et supprimer tout le code mort ou redondant qui n'aurait pas été retiré de la modale principale lors de l'extraction.
  - [ ] **Refactorisation de `VersusArena.tsx` (2470 lignes) :** Séparer la logique de matchmaking (WebSockets / Polling), de la gestion du duel, et du rendu du tchat de l'arène.
  - [ ] **Découpage de `GemExplorerHome.tsx` (1824 lignes) et `ProfilleGame.tsx` (1815 lignes) :** Extraire les composants d'interface de la logique des jeux de recherche et de devinette.
  - [ ] **Refactorisation de `ProfileModal.tsx` (1665 lignes) :** Séparer l'affichage des statistiques (onglets Profil), l'inventaire des items (Feathers, cosmétiques) et les paramètres de compte (Settings).

---

## 📦 Historique des Fonctionnalités Déployées & Validées (Archive)

<details>
<summary><strong>Consulter les jalons précédents livrés avec succès (Cliquez pour dérouler)</strong></summary>

- **Gestion & Modération du Tchat Communautaire :**
  - Correction de la suppression des messages pour l'administrateur Hibouxe.
  - Option de purge complète (disparition totale) du message.
  - Accès direct en 1 clic à la modération du profil utilisateur depuis son pseudonyme dans le tchat.
  - Sécurisation stricte des pseudonymes avec regex alphanumérique (`[a-zA-Z0-9_-]`).
  - Adaptation dynamique du bouton de traduction automatique selon la langue active du site avec badge en direct.
- **Jeux d'Arcade & Ergonomie Mobile :**
  - Remplacement du menu vertical encombrant par un menu burger épuré en cours de jeu.
  - Correction des contrôles tactiles de Casse-Brique (maintien de touche sans perte de focus).
  - Correction du mode Contre IA dans la salle d'arcade.
  - Optimisation des performances des canvas de jeux.
- **Catalogue & Pépites Steam :**
  - 147 pépites certifiées avec 100% de conformité aux 9 règles d'audit (`npm run audit-db`).
  - Filtres multi-critères réactifs : prix, soldes, gratuité, genres.
  - Boîte à pépites (« Suggérer un jeu ») avec validation souveraine dans le tableau de bord admin.
- **Ambiance Sylvestre & Perchoir :**
  - Réhabilitation du Perchoir avec vraies vidéos, liens et dépôts d'Hibouxe / Edsaje.
  - Direction artistique sylvestre unifiée avec cadres de lierre et palette végétale.
  - Système de sauvegarde Cloud chiffré et authentification Steam OpenID / Invité.

</details>

