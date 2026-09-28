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

### 10. 🎴 Synchronisation Pépites & Cartes : Création / Suppression automatique `[⏳ À faire]`
- **Constat :** Chaque pépite du catalogue doit posséder sa carte à collectionner correspondante dans le système de cartes.
- **Actions à réaliser :**
  - [ ] Écrire un test / script d'audit vérifiant la parité 1:1 entre la base des pépites (`src/data/steamGems.ts` / catalogue) et les cartes définies (`src/data/cardsData.ts`).
  - [ ] Automatiser ou sécuriser l'ajout d'une nouvelle carte dès qu'un jeu est ajouté en pépite certifiée via l'admin.
  - [ ] S'assurer de la gestion propre lors de la suppression d'une pépite (gestion des cartes déjà possédées par les joueurs pour éviter les références orphelines).

---

## 🟡 Phase 3 : Outils de Super-Admin & Internationalisation (Priorité P2)

### 9. 👑 Privilèges & Commandes Super-Admin pour Hibouxe (Distribution de récompenses) `[⏳ À faire]`
- **Constat :** Le super-administrateur Hibouxe a besoin d'outils d'animation communautaire et de support pour récompenser directement des joueurs (concours, dédommagements, fidélité).
- **Actions à réaliser :**
  - [ ] Créer une action backend sécurisée (sous vérification `ADMIN_STEAM_ID`) permettant de créditer des plumes (`giveFeathers`) ou d'ajouter une carte spécifique de la collection (`giveCard`) sur la sauvegarde d'un joueur ciblé par son pseudo / steamId.
  - [ ] Intégrer l'interface de distribution dans l'onglet modération des utilisateurs (`UsernamesTab.tsx`) du panneau d'administration avec saisie du montant de plumes, sélection de carte et confirmation.

### 10. 🌐 Affichage des prix Steam & Itch.io selon la localisation ou la langue choisie (ex: Yen au Japon) `[⏳ À faire]`
- **Objectif :** Afficher et convertir automatiquement les prix des jeux Steam et Itch.io dans la devise et le format correspondant à la langue ou au pays sélectionné par le visiteur sur le site (exemple : prix en Yen `¥` pour le Japon / langue `ja`, Dollar `$` pour `en`, Real `R$` pour `pt-BR`, Euro `€` pour `fr`, `de`, `es`).
- **Actions à réaliser :**
  - [ ] **Backend Steam API (`get_steam_info`)** : Passer le code pays Steam `cc` (`cc=jp`, `cc=us`, `cc=br`, `cc=fr`, etc.) et la langue `l` (`japanese`, `english`, `brazilian`, `french`, etc.) lors des requêtes à l'API Steam Store `store.steampowered.com/api/appdetails` et sauvegarder les prix dans `pricingText`.
  - [ ] **Itch.io & conversions de devises** : Définir les règles de conversion ou de formatage selon la monnaie locale (USD / EUR / JPY / BRL).
  - [ ] **Frontend (`MicroIndieHub.tsx`, cartes de jeux, catalogue)** : Sélectionner dynamiquement le texte de prix selon la locale active issue de `i18n.language` avec repli élégant.

---

## 🔵 Phase 4 : Systèmes Avancés & Refactorisation Lourde (Priorité P3)

### 11. 💬 Système de Tchat Privé (Messagerie Directe entre Joueurs) `[⏳ À faire]`
- **Constat :** Le tchat actuel est exclusivement un salon public global. Les joueurs ne peuvent pas s'envoyer de messages directs privés.
- **Actions à réaliser :**
  - [ ] **Backend PHP (`chat.php` / nouveau point d'entrée)** : Créer les endpoints d'envoi et de réception de messages privés sécurisés avec isolation stricte par identifiant d'expéditeur et de destinataire (`private_conversations`).
  - [ ] **Frontend & UI** : Intégrer un onglet ou volet « Messages Privés » dans `ChatDrawer.tsx` ou depuis la liste d'amis (`FriendsModal.tsx`), avec notifications de nouveau message non lu et son discret.

### 12. 🔄 Véritable Système & Menu d'Échange de Cartes (Trade Bilatéral) `[⏳ À faire]`
- **Constat :** Le bouton d'échange actuel dans `CardDetailModal.tsx` se limite à copier un lien dans le presse-papier ou poster un message texte dans le tchat. Il n'existe aucun système d'échange transactionnel ni d'interface interactive permettant d'échanger réellement une carte contre une autre.
- **Actions à réaliser :**
  - [ ] **Menu d'Échange dédié (`TradeModal.tsx`)** :
    - Concevoir une interface d'échange claire (choix du destinataire ami, sélection visuelle de la carte à offrir et de la carte souhaitée).
    - Système d'invitation d'échange depuis la liste d'amis (`FriendsModal.tsx`) ou le tchat avec notification visuelle et sonore.
  - [ ] **Sécurisation des Inventaires & Transaction Atomique** :
    - Vérification stricte : s'assurer que le joueur possède au moins un exemplaire (standard ou holo) de la carte qu'il s'apprête à céder.
    - Exécution bilatérale atomique : à la confirmation mutuelle des deux joueurs, retirer la carte envoyée de l'inventaire du joueur A pour l'ajouter chez le joueur B, et inversement pour la carte reçue.
    - Historique et gestion des propositions (`en attente`, `acceptée`, `refusée`, `expirée`).

### 13. 🧹 Élimination Finale de la Dette Technique (Refactorisation des Monolithes restants) `[⏳ À faire]`
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

