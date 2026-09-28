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

### 1. 🛡️ Résolution de l'erreur « Jeton CSRF invalide ou expiré » sur les suggestions de jeux `[⏳ À faire]`
- **Constat :** Lorsque l'administrateur valide ou gère une proposition de jeu dans le tableau de bord, une erreur apparaît : *« Jeton de protection CSRF invalide ou expiré, Veuillez recharger la page »*, bloquant la modération.
- **Actions à réaliser :**
  - [ ] Identifier l'endpoint incriminé (`suggest_game.php`, `micro_indies.php` ou `track.php`).
  - [ ] Vérifier la génération, le stockage en session/header et l'envoi du jeton CSRF côté client dans `adminService.ts`.
  - [ ] Assurer le renouvellement automatique ou la persistance cohérente du jeton de session lors des actions administratives sans obliger à recharger la page.

### 2. 🔗 Mini-jeu « Connections » (Linkle) : Uniformisation des jeux entre utilisateurs `[⏳ À faire]`
- **Constat :** Les joueurs ne rencontrent pas toujours la même grille de 16 jeux ou les mêmes catégories le même jour dans Linkle, rompant l'expérience du jeu quotidien partagé.
- **Actions à réaliser :**
  - [ ] Auditer la sélection du puzzle du jour dans `src/components/linkle/LinkleGame.tsx` et `src/data/linklePuzzles.ts`.
  - [ ] Garantir que le choix du puzzle quotidien s'appuie sur une graine temporelle déterministe universelle (ex: date YYYY-MM-DD UTC) identique pour tous les visiteurs, indépendamment du statut de connexion ou de l'historique local.

### 3. 🖼️ Remplacement du logo Google Search & SEO par le logo actuel `[⏳ À faire]`
- **Constat :** Lors d'une recherche sur Google, le snippet de résultat affiche encore l'ancien logo ou favicon du site au lieu du logo officiel actuel de Hoot Indie Games.
- **Actions à réaliser :**
  - [ ] Mettre à jour l'ensemble des balises méta d'images dans `index.html` (`og:image`, `twitter:image`, `favicon.svg`, `favicon.ico`, `apple-touch-icon`).
  - [ ] Vérifier et mettre à jour le script de pré-rendu SEO (`scripts/generateSeoIndex.ts`) et les schémas JSON-LD (`Organization.logo`, `WebSite.image`) avec l'URL canonique absolue du logo actuel.
  - [ ] Vérifier le fichier `public/manifest.json` pour s'assurer que les icônes PWA pointent vers la version actuelle.

### 4. 🎵 Mini-jeu Blind-Test : Correction des musiques & de la piste sonore `[⏳ À faire]`
- **Constat :** Des incohérences ont été constatées dans le Blind-Test : des morceaux associés sont erronés (ex: la piste audio de *Cult of the Lamb* ne correspondait pas au vrai morceau du jeu), et la piste sonore présente un affichage erroné de la durée / progression temporelle.
- **Actions à réaliser :**
  - [ ] **Vérification des morceaux (`blindtestPuzzles.ts`)** : Vérifier la bibliothèque audio de puzzles, écouter et remplacer la piste sonore de *Cult of the Lamb* ainsi que toute autre piste défectueuse par des extraits officiels certifiés.
  - [ ] **Réparation de la piste sonore & du chrono (`BlindTestGame.tsx`)** : Corriger le calcul du temps écoulé / durée totale (`currentTime` vs `duration`), l'affichage du format mm:ss et la barre de progression pour refléter la lecture réelle sans glitch.

---

## 🟠 Phase 2 : Rétention Quotidienne, Social & Jeu de Cartes (Priorité P1)

### 5. 📅 Vérification du système de « Série de jeu » (Streaks) & synchronisation Calendrier `[⏳ À faire]`
- **Constat :** Le système de décompte des séries consécutives (streaks) et son reflet dans l'archive/calendrier des jours joués nécessite un audit de fiabilité.
- **Actions à réaliser :**
  - [ ] Auditer le gestionnaire `src/utils/streakManager.ts` et le stockage local / cloud sync.
  - [ ] Contrôler la cohérence entre les dates locales (fuseau horaire du navigateur) et la date de réinitialisation quotidienne du serveur (minuit UTC ou heure de Paris).
  - [ ] Vérifier la modale du calendrier (`CalendarArchiveModal.tsx`) pour garantir que chaque jour complété est correctement coché/coloré sans décalage de date.

### 6. 🃏 Jeu de Cartes : Cumul de 2 boosters gratuits & recharge toutes les 12h `[⏳ À faire]`
- **Constat :** Les boosters gratuits doivent récompenser la régularité sans pénaliser les joueurs qui ne peuvent pas se connecter toutes les 12 heures exactes.
- **Actions à réaliser :**
  - [ ] Mettre en place un plafond de stockage à **2 boosters gratuits maximum**.
  - [ ] Instaurer une recharge automatique d'un booster toutes les 12 heures.
  - [ ] Le compte à rebours de 12h ne démarre ou ne continue que lorsque la réserve de boosters gratuits est inférieure à 2.
  - [ ] Mettre à jour l'interface de la boutique de plumes / boosters (`FeatherShopModal.tsx`, `BoosterOpeningModal.tsx`) avec l'affichage clair du stock (ex: `1/2` ou `2/2`) et du minuteur jusqu'au prochain booster.

### 7. 👥 Correction de l'affichage « Progression du jour de mes amis » `[⏳ À faire]`
- **Constat :** L'encart de suivi de la progression quotidienne des amis (qui a réussi l'Indledle, le Pixel, le Screenle, le Linkle, etc. aujourd'hui) ne s'affiche pas correctement ou n'actualise pas les scores en temps réel.
- **Actions à réaliser :**
  - [ ] Auditer le composant et la récupération des statuts dans `FriendsModal.tsx` et `friendsService.ts`.
  - [ ] Vérifier la structure des payloads envoyés et reçus pour la progression quotidienne des amis (`dailySummary` / `friendDailyStatus`).
  - [ ] Corriger le mapping des icônes de jeux et l'état de complétion du jour pour chaque ami.

### 8. 🎴 Synchronisation Pépites & Cartes : Création / Suppression automatique `[⏳ À faire]`
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

