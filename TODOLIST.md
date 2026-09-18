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
14. **Agrandissement Continu de la Base de Données :**
    - Augmenter le catalogue certifié vers plus de 150 pépites indés rigoureusement vérifiées (Règle Zéro Hallucination).
15. **Révision de l'Idée de Difficulté des Jeux :**
    - Réévaluer le système de difficulté pour garder le défi quotidien universel et équitable tout en offrant des options d'aide progressive.

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
  - Contrôle tactile direct sur le Canvas : glissement 1:1 pour les raquettes de Pong et Casse-Briques, tap instantané pour Flappy et Runner, détection de balayage (swipe) pour Snake et Tetris, déplacement orienté et tir pour Space Invaders.
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
- [ ] **Renommage thématique des modes de jeu** :
  - Proposition de nouveaux noms évocateurs pour *Screenle*, *Indledle*, *Linkle*, *Versus* (ex: *L'Œil du Hibou*, *L'Écho des Pépites*, *Les Liens Sylvestres*, *Le Duel de la Canopée*), en attente de la validation finale du joueur.

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
- [ ] **Mode Time Attack (Sprint Chronométré)** :
  - Conception d'un mode de jeu arcade ultra-dynamique : reconnaître un maximum de jeux indés à la suite dans un compte à rebours (ex: 60s ou 90s).
  - Multiplicateurs de score (combos de bonnes réponses consécutives) et pénalités de temps en cas d'erreur.
  - Affichage et sauvegarde locale/cloud des records personnels.
- [ ] **Système d'Amis & Fonctionnalités Sociales** :
  - Ajout d'amis par code joueur unique (`HOOT-XXXX`) ou synchronisation de liste d'amis Steam.
  - Visualisation des scores du jour des amis (Screenle, Indledle, Linkle) pour stimuler la compétition saine.
  - Bouton d'invitation directe à un duel Versus 1v1 dans le salon d'un ami.
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
- [ ] **Mode Time Attack (Sprint Chronométré)** :
  - Conception d'un mode de jeu arcade ultra-dynamique : reconnaître un maximum de jeux indés à la suite dans un compte à rebours (ex: 60s ou 90s).
  - Multiplicateurs de score (combos de bonnes réponses consécutives) et pénalités de temps en cas d'erreur.
  - Affichage et sauvegarde locale/cloud des records personnels.
- [ ] **Système d'Amis & Fonctionnalités Sociales** :
  - Ajout d'amis par code joueur unique (`HOOT-XXXX`) ou synchronisation de liste d'amis Steam.
  - Visualisation des scores du jour des amis (Screenle, Indledle, Linkle) pour stimuler la compétition saine.
  - Bouton d'invitation directe à un duel Versus 1v1 dans le salon d'un ami.
- [ ] **Agrandissement de la Base de Données de Jeux (Objectif 150+ Pépites)** :
  - Intégration de nouvelles pépites cultes et plébiscitées par les joueurs (*Signalis*, *Inscryption*, *Braid*, *FEZ*, *Katana ZERO*, *Hyper Light Drifter*, *Slay the Princess*, *Dredge*, *Chained Echoes*, *Cocoon*, *Lethal Company*, *Manor Lords*).
- [ ] **Réévaluation de l'Idée de Difficulté des Jeux** :
  - Étude du retour d'expérience sur les modes de difficulté : éviter de fragmenter les scores quotidiens de la communauté.
  - Définir si le défi du jour doit rester universel et identique pour tous (garantie d'équité pour le partage de score) avec un système d'indices optionnels à la demande.

---

### 💡 12. Idées & Améliorations Futures
- [x] **Share Card personnalisée** (export d'image et grille emoji pour Twitter, Facebook, WhatsApp, Instagram).
- [ ] **Support Manette (Gamepad API)** pour naviguer et jouer dans la Salle d'Arcade.
- [ ] **Filtre "Indés Francophones"** dans le catalogue de jeux.
- [ ] **Mode Blind Test Audio Indé** (reconnaître un jeu à sa musique culte).


