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

### 📌 Les 13 Chantiers Prioritaires (Classés par Ordre de Priorité)

---

### 🔴 Palier 1 : Urgences Critiques, Sécurité & Intégrité des Données (Priorité P0)

#### 1. 🛡️ Faille Critique de Confidentialité : Fuite des Messages Privés Hors Ligne & en Navigation Privée `[✅ Fait]`
- **Impact & Urgence :** URGENCE P0 ABSOLUE (Protection de la vie privée, sécurité primordiale du Sanctuaire & RGPD). Les messages privés d'un compte (notamment le compte créateur Hibouxe ou n'importe quel joueur) ne doivent sous AUCUN prétexte être lisibles par un visiteur déconnecté, en navigation privée ou par un tiers sur la même machine.
- **Constats & Failles identifiées :**
  1. **Absence de contrôle de session serveur stricte dans `public/api/chat.php` (CWE-284 / IDOR) :**
     Les actions `get_private_conversations` et `get_private_messages` se fiaient naïvement au paramètre `$_REQUEST['username']` envoyé par le client, sans vérifier si la session PHP active (`$_SESSION['hoot_user_id']` ou `$_SESSION['steam_id']`) correspondait bien à ce pseudonyme.
  2. **Backdoor cli-server dans `public/api/admin_auth.php` :**
     Une clause octroyait automatiquement les privilèges créateur Hibouxe à toute requête localhost (`php_sapi_name() === 'cli-server'`), faisant considérer tout onglet incognito sur localhost comme le créateur officiel Hibouxe !
  3. **Absence de Barrière d'Authentification (Auth Guard) sur l'onglet Messages Privés :**
     Dans `ChatPrivateView.tsx`, un visiteur non authentifié (`!isAuthenticated`) accédait directement aux vues privées.
  4. **Persistance / Fuite inter-sessions :**
     Dans `chatService.ts`, un fallback LocalStorage non scopé (`hoot_local_private_chat_v1`) conservait en clair les messages privés sur la machine même après déconnexion.
- **Résolution effectuée (Blindage à 100%) :**
  - **Serveur (`public/api/chat.php`) :**
    - Fonction `getAuthenticatedChatUser()` ajoutée : vérification obligatoire de la session PHP HttpOnly (`$_SESSION['hoot_user_id']` ou `$_SESSION['steam_id']`) ou du jeton maître admin officiel.
    - Toutes les actions privées (`get_private_conversations`, `get_private_messages`, `send_private_message`, `mark_private_read`, `delete_private_message`) exigent une session authentifiée. Rejet immédiat avec `HTTP 401 Unauthorized` pour les visiteurs non connectés.
    - Protection IDOR stricte : un utilisateur ne peut consulter, envoyer ou marquer comme lues QUE les conversations auxquelles il participe légitimement.
  - **Serveur (`public/api/admin_auth.php`) :**
    - Suppression immédiate du contournement non authentifié sur `cli-server` qui auto-proclamait admin les sessions locales/incognito.
  - **Frontend (`ChatPrivateView.tsx`, `ChatProvider.tsx`, `chatService.ts`, `UserAccountProvider.tsx`) :**
    - Auth Guard avec écran de verrouillage haute sécurité dans `ChatPrivateView.tsx` : bouclier protecteur, explication claire de la confidentialité absolue, et bouton de connexion instantané.
    - `ChatProvider.tsx` bloque les requêtes privées si `!isAuthenticated` ou si `username === 'Hibou Mystère'`, et purge instantanément l'état mémoire à la déconnexion.
    - `chatService.ts` : suppression totale du stockage non chiffré des messages privés dans `localStorage`.
    - `clearAllUserConnectedData()` dans `UserAccountProvider.tsx` purge désormais intégralement toutes les traces de tchat local (`hoot_local_private_chat_v1`, `hoot_local_chat_messages_v1`, `hoot_private_chat_store`) et détruit la session serveur.
- **Actions réalisées :**
  - [x] Supprimer la clause vulnérable `cli-server` dans `admin_auth.php`.
  - [x] Sécuriser `chat.php` avec vérification impérative de la session serveur pour chaque requête de message privé.
  - [x] Intégrer l'Auth Guard dans `ChatPrivateView.tsx` pour bloquer les visiteurs non connectés.
  - [x] Désactiver le chargement et purger le cache des messages privés dans `ChatProvider.tsx` pour les invités.
  - [x] Purger les clés de messagerie privée dans `clearAllUserConnectedData()`.

---

#### 2. ☁️ Résolution de la Désynchronisation du Compteur de Sève Céleste entre différents PC `[✅ Fait]`
- **Impact & Urgence :** Intégrité de sauvegarde et expérience multi-appareils. Un joueur qui farm sur PC A et bascule sur PC B perd sa cohérence de Sève ou voit ses achats d'Arbre Céleste corrompus par la fusion `max()`.
- **Constats & Causes identifiées :**
  1. **Absence de déclenchement Cloud régulier en cours de jeu :** `syncUserCloudSave` n'était déclenché qu'au login ou à la modification de profil. Pendant une session de jeu active dans l'Idle, aucune synchronisation périodique n'était envoyée au serveur.
  2. **Algorithme de fusion naïf dans `public/api/user_cloud_sync.php` et `userCloudSyncService.ts` :**
     `'starSap' => max(ex.starSap, in.starSap)` : La Sève étant une monnaie consommable (dépenses dans l'Arbre Céleste et déblocage de biomes), `max()` ressuscitait la sève dépensée ou écrasait l'historique lors d'une session sur un autre PC !
  3. **Perte de `routeKills` et `miniHudMobileEnabled` :** Le script PHP omettait ces champs dans la sauvegarde fusionnée.
  4. **Empreinte de données (`computeSaveFingerprint`) imprécise :** La sève était divisée par 100 et le solde `starSap` n'était pas vérifié, masquant les petits gains et dépenses.
- **Résolution effectuée :**
  - **Réconciliation horodatée symétrique (PHP & TS) :**
    - Arbitrage temporel basé sur `lastSavedAt` pour distinguer la sauvegarde `primary` (plus récente) de la sauvegarde `secondary` (plus ancienne).
    - Maintien du solde `primary.starSap` (qui reflète les achats récents) augmenté des gains accumulés par l'autre appareil : `extraEarned = max(0, secondary.totalStarSapEarned - primary.totalStarSapEarned)`.
    - `mergedTotalSap = max(primary.totalStarSapEarned, secondary.totalStarSapEarned)`.
    - `mergedStarSap = max(0, min(primary.starSap + extraEarned, mergedTotalSap))`.
    - Préservation des paramètres actifs (`activeBiome`, `activeRoute`, `autoAdvance`, `miniHudMobileEnabled`, `activeCompanions`) et union complète des `routeKills` et améliorations de l'Arbre Céleste.
  - **Synchronisation Cloud automatique en arrière-plan :**
    - `UserAccountProvider.tsx` écoute `'hoot_odyssey_updated'` et cadence la synchronisation cloud (toutes les 25s de jeu actif au maximum, avec `fromCloud: true` anti-boucle).
    - Déclenchement automatique et instantané lors du départ de la page (`beforeunload`) et du changement d'onglet (`visibilitychange`), sécurisé par `keepalive: true` dans la requête `fetch`.
    - Synchronisation Cloud immédiate dans `OdysseyHub.tsx` lors de la réclamation des gains hors-ligne (`handleClaimOfflineGains`).
    - Réactivité instantanée de l'UI à la réception d'une sauvegarde cloud sans rechargement de page.
- **Fichiers modifiés :** `public/api/user_cloud_sync.php`, `src/services/userCloudSyncService.ts`, `src/context/UserAccountProvider.tsx`, `src/components/odyssey/OdysseyHub.tsx`.
- **Actions réalisées :**
  - [x] Corriger la fusion PHP de `odysseyState` dans `user_cloud_sync.php` avec réconciliation horodatée de la sève et préservation de `routeKills`.
  - [x] Aligner `applyCloudSaveToLocalStorage` dans `userCloudSyncService.ts` avec la même logique symétrique.
  - [x] Intégrer un auto-sync périodique, sur récolte hors-ligne, et à la fermeture de page (`beforeunload` + `visibilitychange` + `keepalive`) dans `UserAccountProvider.tsx` et `OdysseyHub.tsx`.
  - [x] Synchroniser réactivement le compteur de Sève sur l'événement `'hoot_odyssey_updated'`.

---

#### 3. 🗺️ Audit & Blindage du Système de Progression de l'Idle (Mondes & Routes Séquentiels) `[✅ Fait]`
- **Impact & Urgence :** Cœur de la boucle de jeu (Gameplay Loop). Si une route ne se débloque pas ou si l'échec de Boss ne réinitialise pas correctement le flux, le jeu est totalement bloqué pour le joueur.
- **Constats & Failles corrigées :**
  1. **Déblocage prématuré des routes :** `defeatMonster` débloquait immédiatement la route suivante dès la première élimination, ignorant le quota de 10 éliminations (`requiredKillsToAdvance = 10`).
  2. **Contournement des Boss de mondes :** Dans `unlockBiome` et l'Atlas, un joueur pouvait débloquer un monde supérieur sans avoir terrassé le Boss du monde précédent s'il accumulait assez de Sève.
  3. **Absence de protection de saut de monde :** Aucune vérification n'empêchait de sauter directement du Monde 1 au Monde 4 ou 5.
  4. **Repli du Boss :** Amélioration du mécanisme de défaite face au Boss (temps de 30s écoulé) avec repli vers la Route 4, désactivation de l'auto-progression (`autoAdvance = false`), bannière d'alerte claire pour le joueur, et implémentation équivalente dans le Mini-HUD.
- **Résolution effectuée :**
  - **Moteur (`src/services/odysseyEngineService.ts`) :**
    - `defeatMonster` : la route suivante ne se débloque dans `highestRouteUnlocked` QUE si `nextRouteKills >= currentRouteObj.requiredKillsToAdvance`.
    - `unlockBiome` : validation stricte de la progression séquentielle (`targetBiome.index === state.highestBiomeUnlocked + 1`) ET vérification impérative que le Boss du biome précédent a été terrassé (`routeKills[prevBossRoute.id] >= 1`).
  - **Arène & Mini-HUD (`OdysseyArena.tsx`, `OdysseyMiniHud.tsx`) :**
    - En cas de temps de Boss écoulé (30s), repli automatique et immédiat vers la Route 4 précédente et désactivation de `autoAdvance`.
    - Ajout d'une notification visuelle dynamique lors du repli de boss.
    - Ajout du timer de boss et de l'auto-progression en tâche de fond dans `OdysseyMiniHud.tsx`.
  - **Atlas (`OdysseyWorldMap.tsx`) :**
    - Les cartes de biomes affichent l'état exact : `Boss requis` (avec infobulle) si le Boss précédent n'est pas vaincu, coût en Sève restant si la sève est insuffisante, et bouton `Débloquer` lumineux dès que les deux conditions sont réunies.
    - Gestionnaire d'erreurs avec alertes visuelles claires.
  - **Banc de tests automatisé (`scripts/testOdysseyProgression.ts`) :**
    - 8 scénarios complets testés et validés à 100% (quota de 10 kills, victoire/défaite de boss, repli route 4, déblocage biomes séquentiels).
- **Fichiers modifiés :** `src/services/odysseyEngineService.ts`, `src/components/odyssey/OdysseyArena.tsx`, `src/components/odyssey/OdysseyMiniHud.tsx`, `src/components/odyssey/OdysseyWorldMap.tsx`, `scripts/testOdysseyProgression.ts`.
- **Actions réalisées :**
  - [x] Rédiger un banc de tests automatisé (`scripts/testOdysseyProgression.ts`) validant la transition R1 -> R5, la victoire/défaite de Boss et l'ouverture du Biome 2 à 6.
  - [x] Vérifier la cohérence de `highestRouteUnlocked` et du bouton « Débloquer » dans `OdysseyWorldMap.tsx`.
  - [x] Valider le fallback automatique sur la route précédente en cas de temps de Boss écoulé.

---

#### 4. 🖼️ Correction du Bug des Images de Jeux Cassées ou Noires dans l'Idle Game `[✅ Fait]`
- **Impact & Urgence :** Immersion et finition visuelle. Les carrés noirs ou icônes brisées dans l'arène ou le radar de butin dégradaient la qualité perçue du jeu.
- **Constats & Résolution :**
  - **Audit automatisé complet (268 jeux) :** Les 268 pépites certifiées ont été auditées par requêtes HEAD réelles. 11 jeux échouaient auparavant en 404 avec l'ancienne résolution (`apps/${appId}/header.jpg`), notamment les jeux Steam modernes utilisant des sous-répertoires hashés (*How to Fish*, *OpenFront*, *BOMBANANA!*, *RV There Yet?*, *IRON NEST*, *IGTAP*, *BuGarden*) et les nouveaux jeux sans header non hashé (*Happy Wheels*, *ReStory*, *Dungeon Bodega Simulator*, *Don't Sleep With The Fishes*).
  - **Chaîne de résolution multi-paliers (`getGameArtworkCandidates`, `src/data/odysseyRouteDex.ts`) :**
    1. `game.headerImage` explicite (conserve les chemins avec hash SHA d'assets récents).
    2. Premier screenshot haute résolution (`game.screenshots[0]`).
    3. URLs directes CDN Steam multi-miroirs Cloudflare (`shared.cloudflare.steamstatic.com`) puis Akamai.
    4. Capsule de secours officielle Hollow Knight (AppID 367520).
    5. Illustration vectorielle de secours intégrée en SVG Data URI (`ODYSSEY_STANDALONE_FALLBACK_SVG`) fonctionnant hors-ligne sans aucune requête réseau.
  - **Gestionnaire d'erreurs en cascade (`handleOdysseyImageError`) :** En cas d'erreur réseau ou de timeout sur un `<img>`, l'événement tente les URLs candidates suivantes successivement avant de basculer sur le placeholder sylvestre, sans risque de boucle infinie (`dataset.odysseyFallbackStep`).
  - **Blindage anti-403 Hotlink (`referrerPolicy="no-referrer"`) :** Ajouté sur les conteneurs d'images de l'arène (`OdysseyArena.tsx`), des capsules de route (`RouteLootDex.tsx`) et de l'Indiedex (`CompanionsDexView.tsx`). Résout les rejets CORS/hotlink sur les jeux hébergés sur `img.itch.zone` (*Celeste Classic PICO-8*, *Adventures With Anxiety!*, *Blooming Panic*).
  - **Unification Indiedex :** `CompanionsDexView.tsx` utilise désormais directement `getGameArtwork(game)` avec le gestionnaire d'erreur unifié.
  - **Résultat de l'audit final :** **268 / 268 pépites valides (0 erreur, 100% HTTP 200 OK)**.
- **Fichiers modifiés :** `src/data/odysseyRouteDex.ts`, `src/components/odyssey/OdysseyArena.tsx`, `src/components/odyssey/RouteLootDex.tsx`, `src/components/odyssey/CompanionsDexView.tsx`.
- **Actions réalisées :**
  - [x] Refactoriser `getGameArtwork(game)` pour tester `game.steamAppId`, `game.steamUrl`, `game.headerImage`, `game.imageUrl` et les screenshots avec URLs CDN résilientes.
  - [x] Ajouter `onError` avec repli SVG élégant sur chaque conteneur d'image de l'arène et des cartes d'Indiedex.
  - [x] Valider l'affichage de l'ensemble des 268 jeux de l'Odyssée via un script d'audit des images.

---

### 🟠 Palier 2 : Confort de Jeu, Ergonomie Immédiate & Identité (Priorité P1)

#### 5. 🏷️ Harmonisation Terminologique : Remplacement Universel de « Pokédex » par « Indiedex » `[✅ Fait]`
- **Impact & Urgence :** Respect de la propriété intellectuelle (franchise Pokémon / Nintendo) et affirmation de l'identité de marque propre du site. Quick-win essentiel avant l'ajout d'autres fonctionnalités.
- **Réalisations effectuées :**
  - Harmonisation complète du terme officiel **« Indiedex »** dans l'ensemble de l'interface et du code :
    - `CompanionsDexView.tsx` : titre « L'Indiedex des Pépites Sylvestres ».
    - `RouteLootDex.tsx` : en-tête « Indiedex de Route », infobulles (« Consulter dans l'Indiedex »).
    - `OdysseyArena.tsx` : bouton de statut « Indiedex (X/256) » et nettoyage des commentaires de code.
    - `OdysseyHub.tsx` : onglet de navigation principale renommé « Indiedex ».
    - `OdysseyStatsView.tsx` : calcul et affichage `{indiedexPercent}% de l'Indiedex`.
    - `OdysseyOfflineModal.tsx` : mention explicite des synergies de l'Indiedex.
    - Documentation : `TODOLIST.md` et `IDLE_GAME_DESIGN.md`.
- **Fichiers modifiés :** `src/components/odyssey/RouteLootDex.tsx`, `src/components/odyssey/CompanionsDexView.tsx`, `src/components/odyssey/OdysseyArena.tsx`, `src/components/odyssey/OdysseyHub.tsx`, `src/components/odyssey/OdysseyStatsView.tsx`, `src/components/odyssey/OdysseyOfflineModal.tsx`, `IDLE_GAME_DESIGN.md`.
- **Actions réalisées :**
  - [x] Remplacer les chaînes utilisateur et libellés d'interface « Pokédex » par « Indiedex ».
  - [x] Uniformiser les infobulles, aides contextuelles et logs de combat.
  - [x] Nettoyer la documentation interne.

---

#### 6. 🎯 Navigation & Clic Direct d'une Pépite de Route vers son Entrée dans l'Indiedex `[✅ Fait]`
- **Impact & Urgence :** Fluidité et satisfaction utilisateur. Le joueur peut inspecter instantanément n'importe quel monstre ou jeu aperçu sur la route.
- **Réalisations effectuées :**
  - Dans la réglette `RouteLootDex.tsx` sous l'arène, chaque vignette (capturée ou silhouette inconnue) dispose d'un title explicite et d'un événement `onClick` transmettant son identifiant `game.id`.
  - Propagation fluide du `gameId` depuis `RouteLootDex` $\rightarrow$ `OdysseyArena` $\rightarrow$ `OdysseyHub` (`handleOpenCompanions(gameId)`).
  - Dans `CompanionsDexView.tsx` :
    - Prise en compte de `initialSelectedGameId`.
    - Réinitialisation automatique du filtre de recherche si le jeu ciblé était exclu.
    - Défilement fluide automatique (`scrollIntoView({ behavior: 'smooth', block: 'center' })`).
    - Effet de surbrillance visuelle temporaire avec halo doré (`ring-4 ring-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.95)] scale-105 z-30`) et badge « Inspecté ↗ » pendant 3.8 secondes.
- **Fichiers modifiés :** `src/components/odyssey/RouteLootDex.tsx`, `src/components/odyssey/OdysseyArena.tsx`, `src/components/odyssey/OdysseyHub.tsx`, `src/components/odyssey/CompanionsDexView.tsx`.
- **Actions réalisées :**
  - [x] Ajouter la prop `onInspectGame?: (gameId: string) => void` dans `OdysseyArena.tsx` et la brancher sur `OdysseyHub.tsx`.
  - [x] Gérer l'état de ciblage `selectedGameId` dans `CompanionsDexView.tsx` avec auto-scroll et surbrillance.

---

#### 7. 🔄 Option de Réinitialisation Complète de l'Idle (« Reprendre à Zéro » / Hard Reset) `[✅ Fait]`
- **Impact & Urgence :** Autonomie du joueur et banc d'essai de progression. Permet de repartir de zéro sans avoir à manipuler manuellement la console ou le stockage local.
- **Réalisations effectuées :**
  - **Moteur (`odysseyEngineService.ts`) :** Ajout de la fonction `resetOdysseySaveState()` remettant à zéro l'état (`getDefaultOdysseyState()`) avec notification d'événement `hoot_odyssey_updated` (`reset: true`).
  - **Zone de Danger & Modale Sécurisée (`OdysseyStatsView.tsx`) :**
    - Section dédiée « Zone de Danger — Nouveau Départ » avec bouton rouge « Reprendre à Zéro ».
    - Boîte de dialogue accessible (`role="dialog"`) avec double confirmation stricte.
    - Saisie obligatoire du mot clé `"RESET"` pour déverrouiller le bouton de confirmation.
  - **Synchronisation Cloud Souverain (`userCloudSyncService.ts`, `UserAccountProvider.tsx`, `public/api/user_cloud_sync.php`) :**
    - `public/api/user_cloud_sync.php` supporte l'option `odysseyStrategy: 'replace'` pour écraser définitivement la sauvegarde distante sans fusionner avec l'ancienne progression.
    - `forcePushOdysseyReset` déclenche immédiatement la propagation sur le serveur OVH.
    - `UserAccountProvider.tsx` intercepte `e.detail?.reset` pour forcer la synchronisation immédiate sans attendre l'intervalle périodique.
- **Fichiers modifiés :** `src/components/odyssey/OdysseyStatsView.tsx`, `src/components/odyssey/OdysseyHub.tsx`, `src/services/odysseyEngineService.ts`, `src/services/userCloudSyncService.ts`, `src/context/UserAccountProvider.tsx`, `public/api/user_cloud_sync.php`.
- **Actions réalisées :**
  - [x] Créer la fonction `resetOdysseySaveState()` dans `odysseyEngineService.ts`.
  - [x] Ajouter le bouton de réinitialisation avec modale de confirmation sécurisée dans `OdysseyStatsView.tsx`.
  - [x] Forcer la propagation Cloud immédiate via `pushUserCloudSave` avec écrasement sans fusion (`replace`).

---

#### 8. 📱 Visibilité & Accessibilité du Bouton Connexion sur Mobile (Google Pixel & écrans < 420px) `[✅ Fait]`
- **Impact & Urgence :** Priorité P1 (Mobile First, Ergonomie, Inscription & Rétention des Joueurs). Un joueur découvrant le site sur smartphone ne doit jamais chercher ou rater le bouton de connexion.
- **Constats & Causes identifiées :**
  1. **Débordement de la barre de navigation supérieure (`Navbar.tsx`) :**
     Sur les écrans mobiles d'une largeur de 360px à 412px (comme le Google Pixel), la rangée d'icônes droite de la Navbar accumulait le Trophée Plumes, le sélecteur de langue, les Compagnons, le Tchat et le bouton Connexion.
  2. **Intitulé textuel masqué :**
     Le label texte `Connexion` était masqué avec `hidden sm:inline`.
  3. **Absence d'accès Connexion dans le menu burger mobile :**
     Le tiroir mobile (`isMobileMenuOpen`) ne proposait aucun accès direct pour se connecter ou s'inscrire.
- **Fichiers cibles :** `src/components/common/Navbar.tsx`.
- **Réalisations effectuées :**
  - [x] **Accès Connexion dans le Menu Burger :** Bandeau doré haute visibilité « Se connecter / Créer un compte » placé en tête du tiroir mobile (`isMobileMenuOpen`) avec détails et badge gratuit (et carte profil complète si connecté).
  - [x] **Optimisation de la barre mobile supérieure :** Déplacement des contrôles secondaires (sélecteur de langue, amis) vers le tiroir mobile sur `< sm`, permettant d'afficher le bouton Connexion avec son icône ET son intitulé textuel visible et aéré.
  - [x] **Bandeau de langue mobile :** Barre tactile horizontale de 6 langues directement intégrée dans le menu burger.
  - [x] **Validation responsive :** Scores Lighthouse intacts (Accessibilité 100%, Best Practices 100%, SEO 100%).

---

#### 9. 👥 Affichage & Statuts des Compagnons En Ligne & Hors Ligne `[✅ Fait]`
- **Impact & Urgence :** Dynamisme social et rétention communautaire. Facilite l'interaction en direct, les parties communes et les échanges de cartes.
- **Réalisations effectuées :**
  - **Module Amis / Compagnons (`FriendsModal.tsx`) :**
    - En-tête enrichi affichant le total et le nombre de compagnons connectés en temps réel : `Vos Compagnons (N) • X en ligne` avec pastille verte pulsante.
    - Réglette de filtrage instantané : **« Tous (N) »**, **« En ligne (X) »** et **« Hors ligne (Y) »**.
    - Tri intelligent : favoris épinglés en tête, puis joueurs connectés en ligne, puis ordre alphabétique.
    - Badges textuels de présence explicites sur chaque carte d'ami : badge émeraude « En ligne » (pulsation) vs badge discret « Hors ligne ».
    - État vide contextuel adapté au filtre actif.
  - **Module Idle Game (`OdysseyOfflineModal.tsx`) :**
    - Mention claire de la contribution passive des chouettes éclaireuses et des synergies de l'Indiedex lors du rapport des gains hors-ligne.
- **Fichiers modifiés :** `src/components/friends/FriendsModal.tsx`, `src/components/odyssey/OdysseyOfflineModal.tsx`.
- **Actions réalisées :**
  - [x] Structurer la liste des amis dans `FriendsModal.tsx` avec tri et sections séparées : « En ligne » et « Hors ligne ».
  - [x] Ajouter l'étiquette / badge visuel de présence explicite pour chaque compagnon.
  - [x] Clarifier le rapport de rendement des compagnons dans `OdysseyOfflineModal.tsx`.

---

#### 9. ♿ Chantier d'Accessibilité Universelle (WCAG 2.1 AA) & Performance Mobile (Anti-Zigzag) `[✅ Fait / En cours d'expansion]`
- **Impact & Urgence :** Inclusion universelle, conformité aux normes internationales (WCAG 2.1 AA), 100% Accessibilité Lighthouse Mobile et confort tactile mobile optimal (Loi de Fitts).
- **Constats & Objectifs :**
  - **1. Accessibilité Lighthouse Mobile : 100 / 100 ATTEINT ! [✅ Fait]**
    - Résolution de l'audit `target-size` sur les cibles tactiles des feuilles sonores de Sylvestre (`SylvestreBranchDivider.tsx`, `SylvestreLeaf.tsx`) : agrandies à $\ge 28\times 28\text{px}$ (`min-w-7 min-h-7`) et espacement élargi à 11% (> 35px sur mobile).
    - Score Accessibilité grimpé de 96 à 100 / 100 sans aucune régression.
  - **2. Performance Lighthouse Mobile : Passée de 85 à 93 / 100 ! [✅ Fait]**
    - Deferral du catalogue lourd `GemCatalogSection` via `IntersectionObserver` : les 8 images Steam (419 KiB) et les chunks `data-games` (156 KiB gzip) ne bloquent plus le rendu critique.
    - Code-splitting du `Footer` (18 KiB) et regroupement du français dans `i18n-core` sans précharger les 5 autres langues. `index.js` allégé de 309 KiB à 250 KiB (66.7 KiB gzip).
    - Alignement de la coquille pré-rendue `index.html` sur la disposition exacte React (DiscoverySubNav + Hero card) pour éliminer les reflows et sauts de mise en page.
    - Suppression des sauts de hiérarchie de titres (`<h1>` -> `<h2>`) éliminant les alertes WAVE WebAIM.
- **Fichiers cibles :** `src/index.css`, `src/App.tsx`, `src/components/sylvestre/SylvestreBranchDivider.tsx`, `src/components/sylvestre/SylvestreLeaf.tsx`, `scripts/generateSeoIndex.ts`, `vite.config.ts`.
- **Actions réalisées :**
  - [x] Corriger les hitboxes tactiles minimales et espacements sur les feuilles de Sylvestre (Accessibilité 100/100).
  - [x] Alléger le bundle critique et différer les composants hors-écran (Footer, GemCatalogSection).
  - [x] Aligner la structure pré-rendue sur le rendu React (FCP 2.4s, LCP 2.8s, TBT 40ms, CLS 0.003).
  - [x] Valider la conformité WAVE WebAIM sans sauts de niveau de titre.

---

### 🟡 Palier 3 : Confort Audio & Expérience Globale (Priorité P2)

#### 10. 🔊 Panneau & Options Globales de Gestion du Son du Site `[✅ Fait]`
- **Impact & Urgence :** Confort de navigation et inclusion pour tous les visiteurs du site (mini-jeux, blind-test, idle, navigation).
- **Constats & Résolution :**
  - **Moteur Audio Hiérarchique Web Audio API (`src/utils/audio.ts`) :**
    - Architecture Web Audio Node Graph à 3 étages : `Oscillateurs/Buffers` $\rightarrow$ `Item Gain` $\rightarrow$ `SFX Gain / Music Gain` $\rightarrow$ `Master Gain` $\rightarrow$ `AudioContext.destination`.
    - 3 canaux de mixage indépendants :
      1. **Master Volume (0% à 100%)** : contrôle le gain global et la mise en sourdine générale.
      2. **SFX Volume (0% à 100%)** : contrôle tous les bruitages physiques et mélodies de feedback (15 synthétiseurs : clics, victoires, sève, déchirure de booster, coups tranchants, hoot du hibou, chime, pop, fanfare Konami, etc.).
      3. **Music Volume (0% à 100%)** : contrôle les pistes musicales officielles MP3 et le synthétiseur de secours du Blind-Test (`BlindTestGame.tsx`).
    - Événement global réactif `hoot_audio_settings_changed` diffusé en temps réel à tous les écouteurs.
    - Hook React `useAudioSettings()` permettant une synchronisation instantanée et réactive entre tous les composants.
    - Persistance immédiate dans le `localStorage` : `'hoot_sound_enabled'`, `'hoot_master_volume'`, `'hoot_sfx_volume'`, `'hoot_music_volume'` (avec repli robuste en navigation privée stricte).
  - **Contrôles Audio dans la Navbar Supérieure (`Navbar.tsx`) :**
    - **Desktop :** Bouton haut-parleur compact combinant un toggle sourdine instantané en 1 clic (icônes dynamiques `Volume2`, `Volume1`, `VolumeX`) et un bouton réglages (`Sliders`) ouvrant un popover de mixage rapide (Master, SFX, Musique) avec lien direct vers les paramètres avancés.
    - **Menu Joueur (Hub Trophées & Plumes) :** Section audio dédiée avec jauge Master Volume et raccourci d'accès aux paramètres sonores.
    - **Menu Burger Mobile :** Carte tactile avec slider de volume maître direct et bouton d'ouverture des réglages complets.
  - **Onglet Dédié dans la Modale Profil / Paramètres (`ProfileModal.tsx`) :**
    - Ajout du 4e onglet de navigation : **« Audio & Sons »** (`activeTab === 'settings'`) avec indicateur pastille rouge en cas de sourdine.
    - Carte principale avec grande icône réactive, statut textuel lumineux (Actif / Sourdine), bouton bascule et slider Master Volume.
    - Grille responsive à 2 colonnes avec curseurs SFX et Musique indépendants, intégrant 5 boutons d'échantillons sonores interactifs (🔔 Ding, ⚔️ Slash, 🦉 Hoot, 🎵 Chime, 🕹️ 8-bit).
    - Bouton « Réinitialiser par défaut » (Master 80%, SFX 80%, Musique 70%) avec feedback immédiat.
    - Cibles tactiles $\ge 44\times 44\text{px}$, labels accessibles WCAG 2.1 AA (`htmlFor`, `id`, `aria-label`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext`).
  - **Intégration Blind-Test (`BlindTestGame.tsx`) :**
    - Ajustement dynamique et continu du gain de lecture de la piste MP3 ou synthétiseur sur `0.75 * masterVolume * musicVolume` en temps réel sans interruption du morceau.
- **Fichiers modifiés :** `src/utils/audio.ts`, `src/components/blindtest/BlindTestGame.tsx`, `src/components/common/Navbar.tsx`, `src/components/common/ProfileModal.tsx`, `src/App.tsx`, `TODOLIST.md`.
- **Actions réalisées :**
  - [x] Refactoriser `AudioManager` avec graphe hiérarchique `sfxGainNode` / `musicGainNode` / `masterGainNode` et hook `useAudioSettings`.
  - [x] Connecter `BlindTestGame.tsx` pour réagir instantanément aux modifications de volume musical et global.
  - [x] Intégrer les curseurs et popovers de contrôle dans `Navbar.tsx` (desktop, menu joueur et tiroir mobile).
  - [x] Créer l'onglet « Audio & Sons » dans `ProfileModal.tsx` avec sliders précis et boutons de test interactifs.
  - [x] Valider l'absence de régression avec `npm run lint`, `npm run build` et audit Lighthouse local (100 a11y, 100 best-practices, 100 seo, 92 mobile perf).

---

### 🔵 Palier 4 : Équilibrage & Évolutivité Long Terme (Priorité P3)

#### 11. ⚖️ Équilibrage Mathématique, Courbe de Difficulté & Ergonomie de l'Idle `[✅ Fait]`
- **Impact & Urgence :** Rétention et engagement à long terme. Élimine le mur infranchissable du Biome 4, dynamise le clic manuel à haut niveau et enrichit l'ergonomie générale du jeu sans régression.
- **Réalisations effectuées :**
  - **1. Résolution Mathématique du Mur de Progression (`odysseyData.ts`, `odysseyRouteDex.ts`) :**
    - **Indexation rapide des Pépites :** Table de correspondance O(1) `GAME_BIOME_INDEX_MAP` et fonction `getGameBiomeIndex(gameId)` assignant chaque jeu à son biome d'origine.
    - **DPS Intrinsèque des Pépites (`BIOME_DPS_TIERS`) :** Chaque pépite capturée contribue directement au DPS passif du joueur selon son biome :
      - Biome 1 : 15 DPS | Biome 2 : 120 DPS | Biome 3 : 950 DPS | Biome 4 : 8 500 DPS | Biome 5 : 95 000 DPS | Biome 6 : 1 200 000 DPS.
      - Bonus de doublons progressif : $+15\%$ de DPS par exemplaire supplémentaire (`1 + (count - 1) * 0.15`).
      - Bonus Holographique (Shiny) : multiplicateur $\times (2 + \text{holoRadianceBonus})$.
    - **Recalibrage des 30 Routes (PV & Sève Stellaire) :** Courbe exponentielle lissée pour éliminer le goulot d'étranglement du Biome 4 (Boss B4 recalibré à 22M PV en 30s, accessible avec l'équipe de pépites et le clic actif).
  - **2. Transmission DPS $\rightarrow$ Clic Manuel & Éclats Célestes (`odysseyEngineService.ts`) :**
    - **Synergie Serres d'Acier :** Chaque niveau de *Serres d'Acier* transfère $+0.2\%$ du DPS passif global directement dans le clic manuel (`clickDamage = (10 + level * 5 + floor(passiveDps * level * 0.002)) * shardsMult`). Le joueur actif reste redoutable et décisif face aux Boss à tous les stades du jeu.
    - **Prestige Éclats Célestes (`celestialShards`) :** Application du multiplicateur $+10\%$ par éclat (`1 + shards * 0.10`) à la fois sur le clic et sur le DPS passif.
  - **3. Achat Multiple dans l'Arbre Céleste (`CelestialTreeView.tsx`, `odysseyEngineService.ts`) :**
    - Ajout du sélecteur sobre : `[ 1x ] [ 10x ] [ 25x ] [ MAX ]`.
    - Calcul en temps réel du coût cumulé exact via `calculateCumulativeUpgradeCost` et du nombre de niveaux abordables via `calculateMaxAffordableLevels`.
    - Bouton d'achat dynamique affichant le nombre de niveaux acquis (ex: `+10 Niveaux`, `+3 Niveaux` ou `Maîtrisé`).
  - **4. Améliorations Ergonomie & UI/UX (Sans excès d'emojis) (`OdysseyArena.tsx`, `CompanionsDexView.tsx`) :**
    - **Jauge d'objectif de route épurée :** Affichage de la progression avec jauge fine et indicateur clair (`Route validée` dès 10 éliminations).
    - **Bouton Bascule Ergonomique :** Remplacement de la case à cocher par un sélecteur moderne `Auto-progression` (FastForward) vs `Farm sécurisé` (Shield).
    - **Chevrons de navigation de biomes :** Boutons discrets `<` et `>` permettant de voyager rapidement entre les mondes débloqués sans quitter l'arène.
    - **Badge discret de capture sur les monstres :** Badge ambre subtil `Nouvelle pépite` pour les jeux non possédés vs badge émeraude discret `Capturé (xN)` pour les doublons.
    - **Indiedex des Compagnons :** Affichage de l'apport en DPS (`+X DPS/s`) sous chaque carte de pépite capturée.
  - **5. Recalibrage de la Difficulté PokéClicker & Éradication de la Divergence (17 T/s) :**
    - **Identification & Élimination de la Divergence Exponentielle :**
      - Le nœud *Trophées des Gardiens* (`comp_boss_trophies`) utilisait `state.stats.bossesDefeated` (le nombre total cumulé de tous les combats de boss farmés, pouvant atteindre 100 à 500) combiné à un palier $\times 1.5$ par niveau $\Rightarrow$ multiplicateur parasite de $\times 136$ à $\times 450$. Remplacé par le nombre de biomes uniques conquis (`uniqueBosses` entre 0 et 5 max, bonus sain de $\times 2.5$ max au niveau 15).
      - Le calcul de `clickDamage` appliquait une seconde fois `bossTrophyMultiplier`, `collectionBonus` et `shardsMultiplier` sur `passiveTransferredToClick` (qui les intégrait déjà via `passiveDps`), créant un produit au carré propulsant les clics à plusieurs Quadrillions. Corrigé en sommant le ratio de transfert sans re-multiplication.
      - Tiers de DPS intrinsèque des pépites recalibrés à des échelles saines : Biome 1: 2 DPS | Biome 2: 10 DPS | Biome 3: 50 DPS | Biome 4: 300 DPS | Biome 5: 2 000 DPS | Biome 6: 15 000 DPS.
      - Paliers de nœuds universels ramenés à $+20\%$ par jalon ($\times 1.2$, $\times 1.4$, $\times 1.6$, $\times 1.8$, $\times 2.0$) et jalons de collection de $+10\%$ à $+250\%$ max (au lieu de $+700\%$).
    - **Grille de PV & Sève des 30 Routes Recalibrée :**
      - Biome 1 : R1 40 PV $\rightarrow$ Boss 2 800 PV (Timer 30s $\Rightarrow$ ~95 DPS requis).
      - Biome 2 : R1 1 400 PV $\rightarrow$ Boss 75 000 PV (requiert ~2 500 DPS).
      - Biome 3 : R1 35 000 PV $\rightarrow$ Boss 1 800 000 PV (requiert ~60k DPS).
      - Biome 4 : R1 800 000 PV $\rightarrow$ Boss 45 000 000 PV (requiert ~1.5M DPS).
      - Biome 5 : R1 18M PV $\rightarrow$ Boss 1 200 000 000 PV (1.2 Mrd, requiert ~40M DPS).
      - Biome 6 : R1 500M PV $\rightarrow$ Boss Cosmique Ultime 45 000 000 000 PV (45 Mrd, timer 30s, requiert clics critiques et Chouette Frenzy x7).
    - **Déblocage Gratuit des Biomes par Victoire de Boss :** Suppression complète du coût en Sève Stellaire pour déverrouiller un monde. Terrasser le Boss de la Route 5 débloque immédiatement et gratuitement le biome suivant (et bascule propre dans l'Atlas).
  - **6. Paliers d'Amélioration & Milestones Multiples :**
    - **5 Nouveaux Nœuds Spécialisés dans l'Arbre Céleste :** *Pourfendeur de Boss* (+10% dégâts boss/lvl), *Résonance des Doublons* (+0.2% DPS/doublon/lvl), *Trophées des Gardiens* (+3% DPS passif par biome unique conquis/lvl), *Primes de Gardien* (+20% sève boss/lvl), *Balise des Échos* (+3% taux d'apparition échos/lvl).
    - **Paliers Universels par Compétence :** Jalons aux niveaux 10, 25, 50, 75, 100 avec multiplicateur cumulatif de $+20\%$ par jalon, jauge fine de progression et badge sobre `Boost xN.0`.
    - **Paliers de Collection Globale Indiedex :** Jalons aux seuils 10, 25, 50, 100, 150, 200 et 256 pépites capturées (*Novice*, *Amateur Curieux*, *Explorateur Sylvestre*, *Chasseur de Pépites*, *Mécène Indépendant*, *Conservateur Stellaire*, *Archiviste Suprême*, *Maître Absolu du Sanctuaire*) accordant des bonus permanents de DPS (+10% à +250%) et de Sève (+10% à +180%).
  - **7. Option « Gadget » Non-Intrusive & Unifiée :**
    - Renommage de l'option « Gadget mobile » en « Gadget » (valable pour desktop et mobile).
    - **Désactivé de base** (`false` par défaut) pour garantir zéro intrusion au premier lancement du site pour les nouveaux visiteurs.
    - Contrôle simple via la case « Gadget » dans l'arène ou fermeture universelle via le bouton croix `X` sur le widget.
  - **8. Bancs de Tests & Validation Anti-Zigzag Zéro Régression :**
    - Bancs de tests automatisés validés à 100% : `testOdysseyProgression.ts`, `testOdysseyMathBalancing.ts` et banc de simulation de courbe `testOdysseyCurveSimulation.ts` (débutant 5 DPS $\rightarrow$ endgame 263M DPS max, 0 divergence).
    - 0 erreur TypeScript (`tsc -b`), 0 erreur linter (`oxlint`).
    - Audit Lighthouse certifié : **Accessibilité 100 / 100**, **Bonnes Pratiques 100 / 100**, **SEO 100 / 100**, **Performance Mobile 92 / 100**.
- **Fichiers modifiés :** `src/types/odyssey.ts`, `src/data/odysseyData.ts`, `src/data/odysseyRouteDex.ts`, `src/services/odysseyEngineService.ts`, `src/services/userCloudSyncService.ts`, `src/components/odyssey/CelestialTreeView.tsx`, `src/components/odyssey/CompanionsDexView.tsx`, `src/components/odyssey/OdysseyArena.tsx`, `src/components/odyssey/OdysseyMiniHud.tsx`, `src/components/odyssey/OdysseyWorldMap.tsx`, `scripts/testOdysseyMathBalancing.ts`, `scripts/testOdysseyProgression.ts`, `scripts/testOdysseyCurveSimulation.ts`, `TODOLIST.md`.
- **Actions réalisées :**
  - [x] Éradiquer la divergence exponentielle incontrôlée (suppression du cumul parasite des boss vaincus et du double compte de clic).
  - [x] Harmoniser les tiers de pépites de 2 à 15 000 DPS et les multiplicateurs de paliers à +20%.
  - [x] Lisser la courbe des 30 routes (Biomes 1 à 6) sans mur infranchissable, avec boss exigeants style PokéClicker.
  - [x] Implémenter la transmission saine de DPS passif vers le clic manuel et le boost multiplicateur des Éclats Célestes.
  - [x] Intégrer l'achat multiple 1x, 10x, 25x, MAX dans l'Arbre Céleste.
  - [x] Moderniser l'ergonomie de l'arène (jauge fine, bouton Farm sécurisé, chevrons de biomes, badges de capture discrets, sans excès d'emojis).
  - [x] Rendre le déblocage des biomes gratuit dès la victoire contre le boss de la Route 5 (suppression du coût en sève).
  - [x] Implémenter les 5 nouveaux nœuds et les multiplicateurs de paliers (nœuds et collection Indiedex).
  - [x] Transformer l'option en « Gadget » désactivé de base (non-intrusif) avec fermeture universelle.
  - [x] Certifier le protocole Anti-Zigzag avec tests automatisés et audit Lighthouse (100/100/100/92).

---

#### 12. 🤖 Système de Mise à Jour Automatique de l'Idle (Nouveaux Biomes & Routes basés sur les Pépites) `[✅ Fait]`
- **Impact & Urgence :** Architecture évolutive et maintenance zéro-effort. Permet à l'Odyssée de s'étendre organiquement à chaque moissonnage de nouveaux jeux sans aucune intervention manuelle.
- **Règle stricte de Déblocage & Ergonomie :**
  - **Seuil d'Ouverture d'un Monde :** Un nouveau biome est débloqué **uniquement** lorsqu'un quota complet de **45 pépites orphelines** est atteint sur le site, afin de garantir systématiquement et strictement **9 pépites par route** (5 routes × 9 pépites = 45 pépites).
  - **Isolation de l'Indiedex :** Les pépites orphelines en attente de compléter le palier de 45 **ne sont jamais affichées** dans l'Indiedex des Compagnons tant qu'elles ne sont pas effectivement implémentées sur une route de l'Odyssée (`IMPLEMENTED_ODYSSEY_GAMES`).
- **Réalisations effectuées :**
  - **1. Service Générateur Procédural & Équilibrage Mathématique (`odysseyBiomeGenerator.ts`) :**
    - Création du moteur d'extension procédurale capable de générer des biomes et des routes équilibrés pour tout monde $N \ge 7$ dès qu'un lot de 45 pépites orphelines est réuni.
    - Constantes explicites `MIN_ORPHAN_GAMES_FOR_NEW_WORLD = 45`, `GAMES_PER_ROUTE = 9`, `ROUTES_PER_WORLD = 5`.
    - Aucune pépite orpheline n'est injectée dans les routes existantes si le quota de 45 n'est pas atteint : elles restent en réserve dans le sanctuaire.
    - Templates artisanaux enrichis pour les Mondes 7 à 10 :
      - **Monde 7 :** *La Faille Chronologique* (⏳, particules glitch, thème ambre/doré, boss Chronovore).
      - **Monde 8 :** *Les Abysses Océaniques* (🌊, particules bulles, thème cyan/abyssal, boss Kraken Primordial).
      - **Monde 9 :** *La Nébuleuse des Songes* (🌙, particules étoiles, thème violet nébuleux, boss Tisseur Astral).
      - **Monde 10 :** *La Cité Mécanique* (⚙️, particules braises, thème cuivre steampunk, boss Grand Horloger).
      - Générateur procédural algorithmique de secours avec déclinaisons thématiques pour $N \ge 11$.
    - Formules de progression mathématique calibrées :
      - Multiplicateur de PV par biome $24^{B - 6}$ garantissant que la Route 1 d'un nouveau biome est plus accessible que le boss sous chrono du biome précédent.
      - Sève Stellaire proportionnelle aux PV avec récompenses saines.
      - Niveaux de monstres progressifs (+5 niveaux par biome).
      - Tiers de DPS passif des pépites auto-scalés (`15 000 * 8^(B - 6)`).
  - **2. État Actuel Sain & Blindage de l'Indiedex (`odysseyRouteMapping.json`, `odysseyRouteDex.ts`, `CompanionsDexView.tsx`) :**
    - 270 pépites certifiées actuellement implémentées sur les 30 routes des Biomes 1 à 6 (exactement 9 pépites par route sur 100% des 30 routes).
    - 7 pépites orphelines actuellement en réserve (progression : 7 / 45 nécessaires pour l'apparition du Monde 7).
    - `IMPLEMENTED_ODYSSEY_GAMES` et `isGameImplementedInOdyssey(gameId)` isolent les pépites en jeu :
      - L'Indiedex (`CompanionsDexView.tsx`) n'affiche que les 270 pépites effectivement jouables.
      - Le compteur indique `totalCaptured / 270`, le filtre `Tous` indique `270`, et les 7 pépites orphelines sont totalement invisibles dans l'arborescence tant que le Monde 7 n'est pas débloqué.
  - **3. Moteur Découplé & Dynamique (`odysseyData.ts`, `odyssey.ts`) :**
    - Détection automatique à chaud de tous les biomes étendus présents dans `odysseyRouteMapping.json` via les identifiants de routes `b(\d+)_`.
    - Instanciation sans redéploiement de code de `EXTENDED_BIOMES` et `EXTENDED_ROUTES`.
    - `calculateCompanionDps` utilise dynamiquement `getBiomeDpsTier(biomeIndex)` pour calculer le DPS des pépites de n'importe quel monde étendu.
    - Types TypeScript assouplis avec préservation de l'autocomplétion (`OdysseyBiomeId = 'biome_1_verdurant' | ... | (string & {})`).
  - **4. Automatisation dans le Pipeline de Moissonnage Quotidien (`dailyIndieHarvest.ts`) :**
    - Script autonome `scripts/syncOdysseyRoutes.ts` avec commande `npm run sync-odyssey`.
    - Intégration native dans `dailyIndieHarvest.ts` : à chaque moisson de nouvelles pépites certifiées, `runSyncOdysseyRoutes(false)` s'exécute automatiquement. Dès que le cumul des orphelines atteint 45, le Monde 7 est automatiquement ouvert avec 9 pépites par route !
  - **5. Interface Graphique Réactive & Cartographie Adaptative (`OdysseyWorldMap.tsx`, `OdysseyArena.tsx`) :**
    - **Atlas & Carte du Monde :** Compteur dynamique `Monde X / N` basé sur `ODYSSEY_BIOMES.length` (actuellement 6 mondes actifs). Décors SVG procéduraux dédiés prêts pour accueillir les mondes 7, 8 et suivants.
    - **Arène de Combat :** Intégration des icônes Lucide appropriées (`Clock`, `Waves`, fallback `Compass`) pour les bannières de mondes.
  - **6. Bancs de Tests & Certification Anti-Zigzag Zéro Régression :**
    - Script de test dédié `scripts/testOdysseyBiomeExpansion.ts` validant le seuil de 45 pépites, l'absence des orphelines dans l'Indiedex, et la génération de 5 routes à 9 pépites (100% succès).
    - `testOdysseyProgression.ts`, `testOdysseyMathBalancing.ts`, `testOdysseyCurveSimulation.ts` validés à 100%.
    - `tsc -b` : 0 erreur, `npm run lint` : 0 erreur.
    - Audit Lighthouse certifié : **Accessibilité 100 / 100**, **Bonnes Pratiques 100 / 100**, **SEO 100 / 100**, **Performance Mobile 92 / 100**.
- **Fichiers modifiés & créés :** `src/services/odysseyBiomeGenerator.ts`, `scripts/syncOdysseyRoutes.ts`, `scripts/testOdysseyBiomeExpansion.ts`, `src/data/odysseyRouteDex.ts`, `src/components/odyssey/CompanionsDexView.tsx`, `src/data/odysseyData.ts`, `src/data/odysseyRouteMapping.json`, `src/types/odyssey.ts`, `src/components/odyssey/OdysseyWorldMap.tsx`, `src/components/odyssey/OdysseyArena.tsx`, `scripts/dailyIndieHarvest.ts`, `package.json`, `vite.config.ts`, `TODOLIST.md`.
- **Actions réalisées :**
  - [x] Imposer le seuil strict de 45 pépites orphelines pour l'ouverture d'un nouveau monde (5 routes × 9 pépites).
  - [x] Masquer totalement les pépites orphelines dans l'Indiedex tant qu'elles ne sont pas implémentées (`IMPLEMENTED_ODYSSEY_GAMES`).
  - [x] Rétablir les 30 routes initiales (262 pépites) en attendant le palier de 45 orphelines pour le Monde 7.
  - [x] Mettre à jour le générateur procédural, le script de synchronisation et les bancs de tests.
  - [x] Valider l'ensemble des tests et certifier le protocole Anti-Zigzag Lighthouse (100/100/100/92).

#### 13. 🎮 Unification des 8 Mini-Jeux Quotidiens : Enchaînement « Défi Suivant », Grand Chelem & Sélecteur de Date Universel `[✅ Fait]`
- **Impact & Urgence :** Confort de jeu, rétention quotidienne et fluidité post-partie (P1).
- **Constats :**
  1. À la fin d'une partie (victoire ou défaite), le joueur se retrouvait face à un écran statique et devait manuellement revenir au Hub pour chercher quel jeu quotidien il n'avait pas encore joué.
  2. Le sélecteur de date (calendrier d'archives, bouton de rattrapage de la veille, bascule de date) dans `App.tsx` n'était actif que pour 4 jeux (*Screenle*, *Indledle*, *Linkle*, *Profille*), privant *Chrono*, *Pixel*, *Review* et *Blind-Test* du voyage temporel et de la protection de streak.
- **Réalisations effectuées :**
  - **Composant Réutilisable `DailyGameNextBanner.tsx` :**
    - Barre des 8 pastilles interactives avec état en temps réel (vert = résolu, rose = échoué, neutre = à jouer, contour doré = jeu actif).
    - Calcul dynamique cyclique du prochain jeu non joué de la date active.
    - Bannière dynamique « Défi Suivant Recommandé » avec icône thématique, titre, sous-titre et bouton d'action direct « Jouer au Défi Suivant » (scroll haut fluide + transition propre).
    - En cas de complétion des 8 jeux : Célébration du « Grand Chelem du Jour Accompli ! (8/8) » avec score parfait ou mention de félicitations et bouton vers le Hub.
  - **Intégration Harmonisée sur les 8 Mini-Jeux Quotidiens :**
    - `ScreenleGame.tsx`, `IndledleGame.tsx`, `LinkleGame.tsx`, `ProfilleGame.tsx`, `ChronoGame.tsx`, `PixelGame.tsx`, `ReviewGame.tsx`, `BlindTestGame.tsx`.
  - **Sélecteur de Date Universel dans `App.tsx` :**
    - Extension de `isDailyPuzzleActive` pour inclure l'ensemble des 8 mini-jeux.
  - **Internationalisation & Zéro Emoji Criard :**
    - Clés i18n ajoutées dans `fr.json` et `en.json` avec replis robustes.
    - Typographie sobre, icônes Lucide épurées et palette sombre sylvestre.
  - **Certification Anti-Zigzag Zéro Régression :**
    - Scores Lighthouse Mobile : **Accessibilité 100 / 100**, **Bonnes Pratiques 100 / 100**, **SEO 100 / 100**, **Performance 92 / 100**.
    - `npm run build` : 0 erreur, `npm run lint` : 0 erreur.
- **Fichiers modifiés :** `src/App.tsx`, `src/components/minigames/DailyGameNextBanner.tsx`, `src/components/screenle/ScreenleGame.tsx`, `src/components/indledle/IndledleGame.tsx`, `src/components/linkle/LinkleGame.tsx`, `src/components/profille/ProfilleGame.tsx`, `src/components/chrono/ChronoGame.tsx`, `src/components/pixel/PixelGame.tsx`, `src/components/review/ReviewGame.tsx`, `src/components/blindtest/BlindTestGame.tsx`, `src/i18n/locales/fr.json`, `src/i18n/locales/en.json`, `TODOLIST.md`.
- **Actions réalisées :**
  - [x] Créer le composant `DailyGameNextBanner.tsx` avec statut des 8 jeux et bouton « Défi Suivant ».
  - [x] Intégrer la bannière dans les écrans de fin des 8 mini-jeux quotidiens.
  - [x] Étendre `isDailyPuzzleActive` dans `App.tsx` aux 8 jeux.
  - [x] Ajouter les traductions fr/en et vérifier le style sobre.
  - [x] Valider avec audit Lighthouse Mobile (100/100/100/92).

---

### 📦 Historique des Chantiers Récents Livrés avec Succès

#### 1. 🖼️ Correction des images de jeux Itch.io non chargées (Images noires) `[✅ 100% Terminé]`
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
  - [x] **Carte Interactive du Monde & Sentier des Routes (World Map à la Pokéclicker)** `[✅ 100% Terminé]` :
    - **Une vraie carte visuelle** : Canevas cartographique SVG immersif avec décors géographiques procéduraux par biome (collines et rayons de clairière, grille cyber-canopée, géodes et stalactites de silice, cimes enneigées et aurores, crêtes magmatiques des enfers, nébuleuse et anneaux du néant), Rose des Vents 🧭, sentier de terre sinueux animé (`<path>` avec gradient lumineux), 5 jalons interactifs, balise animée « VOUS ÊTES ICI » avec la mascotte Hoot 🦉 et aperçu des monstres au survol.
    - **Ergonomie unifiée sur la même page (Style Pokéclicker)** : Arène de combat à gauche et Carte interactive à droite en 2 colonnes simultanées sur grand écran, avec sélecteur d'onglets mobiles 1-clic fluide sans rechargement. Tout clic sur un jalon de la carte téléporte instantanément le combat sans quitter la vue.
    - **Persistance totale & Règle Hors-Ligne** : Sauvegarde fiable de l'état coché/décoché d'`autoAdvance` et de la route exacte où le joueur quitte la partie (résolution du conflit de mise à jour d'arrière-plan `OdysseyMiniHud`). L'auto-progression est strictement confinée au jeu en ligne : en mode hors-ligne, le farm reste verrouillé sur la zone quittée sans jamais changer de biome ou de route.
  - [x] **Indiedex de Route & Radar de Butin (Route Loot Dex)** `[✅ 100% Terminé]` : Réglette visuelle sous chaque route affichant les pépites capturables (silhouettes sombres non découvertes avec taux de drop naturels, capsules officielles Steam débloquées avec niveau de capture, cadres holographiques prismatiques), jauge de complétion et de maîtrise de route (+15% Sève), case à cocher d'auto-progression manuelle (désactivée par défaut pour un farming libre à la Pokéclicker), et suppression du système de vagues (remplacé par quota d'accès requis puis compteur total de vaincus).
  - [x] **Révolution Graphique & "Juiciness" de Combat (Game Feel)** `[✅ 100% Terminé]` : Décors vivants multi-couches procéduraux en CSS/SVG par biome (god rays solaires de clairière, grille 3D et pluie de pixels, cristaux bioluminescents, aurores boréales et cimes enneigées, magma et braises montantes, anneaux et nébuleuse cosmique), tranchants de lame SVG néon réactifs au clic/touch, micro-secousses d'écran (screen shake) sur coups critiques et boss avec toggle d'accessibilité, double barre de vie RPG (jauge instantanée + jauge résiduelle de blessure et flash d'impact blanc), respiration idle vivante du monstre, éclats d'orbes de Sève jaillissants lors des victoires et bruitages procéduraux Web Audio synthétisés.
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

### 21. 🧹 Élimination Finale de la Dette Technique & Passage en v2.0.0 `[✅ Fait]`
- **Priorité :** P3 (Maintenance & propreté architecturale — 0 dette technique)
- **Difficulté :** Élevée (Composants de grande taille avec logique d'état complexe)
- **Constat & Réalisations :**
  - **Modularisation de `ProfileModal.tsx` :** Extraction de l'onglet audio autonome `ProfileAudioTab.tsx` avec le hook réutilisable `useAudioSettings()`, allègement de 270+ lignes et élimination des avertissements React de mise à jour d'état intempestive.
  - **Assainissement de `AdminDashboardModal.tsx` & `AdminGamesManager.tsx` :** 0 warning oxlint, synchronisation sécurisée des changements d'état sans cascades de rendus, stabilisation des dépendances de mémoïsation.
  - **Stabilisation des raccourcis clavier de `VersusArena.tsx` :** Encapsulation de `handlePlayerGuess` dans une référence mutable pour éviter les re-subscriptions répétitives des écouteurs globaux.
  - **Nettoyage du code mort dans les Canvas Arcade :** Suppression des variables résiduelles `currentScore` dans `ArcadeVectrex.tsx` et `ArcadeBreakout.tsx`.
  - **Validation & Build v2.0.0 :** `tsc -b` 0 erreur, bundle Vite optimisé et généré en moins de 700ms, passage officiel du projet en version 2.0.0 dans `package.json`.

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

