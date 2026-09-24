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

## 🎯 Directives & Décisions Utilisateur Récents
1. **Import de jeux Steam & Boîte à Pépites (« Suggérer un jeu ») `[✅ 100% Déployé]` :**
   - Le formulaire public dans le catalogue Steam permet de soumettre des jeux indés par AppID ou lien Steam avec commentaire et examen des données officielles.
   - Les suggestions sont stockées dans `suggestions.json` sous protection API rate-limitée (`public/api/suggest_game.php`).
   - Validation administrative complète opérationnelle dans le tableau de bord admin (`AdminDashboardModal.tsx` & `AdminGamesManager.tsx`) : bouton de validation en 1 clic (lookup automatique Steam, inférence du style/caméra, publication souveraine dans `games_override.json` et archivage de la file) + bouton d'édition manuelle avant intégration.
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
18. **Tri Avancé des Jeux Steam (Prix, Promotions, Notes, etc.) (100% Déployé) :**
    - Données officielles certifiées moissonnées pour les 147 pépites via l'API Steam Store (`src/data/steamStoreData.ts` & `scripts/syncSteamStoreData.ts`) : prix exacts en euros, statut gratuit, réductions en cours (-X%), volume total d'avis et taux de critiques positives.
    - Filtres multi-critères réactifs dans l'Explorateur de Pépites (`GemExplorerHome.tsx`) et le Catalogue Steam (`SteamCatalogExplorer.tsx`) :
      - **Filtre Prix & Soldes** : Tous les prix, En promotion / En solde 🏷️, Gratuits 🆓, Moins de 10 € 💸, Moins de 20 € 💳, 20 € et plus 💎.
      - **Filtre Évaluations Steam** : Toutes les notes, Extrêmement positifs (≥ 95%) 🌟, Très positifs et + (≥ 85%) ⭐, Positifs (≥ 80%) 👍.
      - **Tri Avancé** : Plus récents 📅, Classiques anciens ⏳, Meilleures réductions 🔥, Prix croissant 💸, Prix décroissant 💎, Meilleures évaluations ⭐, Nombre d'avis / Popularité 👥, Titre (A → Z), Titre (Z → A).
      - **Pilules de filtrage rapide en 1 clic** (En solde, < 10 €, Gratuits, Top Avis, Populaires) avec compteur dynamique et bouton de réinitialisation instantané.
      - **Affichage enrichi sur chaque carte de pépite** : pastille de solde `-XX%` animée, prix barré / prix final, badge d'évaluations Steam avec taux de recommandation et volume total d'avis.
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
23. **Système de Leaderboard (Classement en Ligne) dans l'Arcade, Time Attack et Quiz (100% Déployé) :**
    - Classement compétitif souverain ultra-sécurisé avec API backend PHP (`public/api/leaderboard.php`) et persistance atomique `LOCK_EX` des Top 100 :
      - **8 Bornes d'Arcade** : *Snake*, *Flappy Hibou*, *Course Sylvestre*, *Pong*, *Breakout*, *Tetris*, *Space Invaders*, *Mine Storm*.
      - **8 Sprints Time Attack** : *Screenle*, *Indledle*, *Linkle*, *Profille*, *Chrono*, *Pixel*, *Review*, *Blind Test*.
      - **3 Modes Quiz Indé** : *Standard (10 Questions)*, *Survie (3 Vies)*, *Entraînement Infini*.
    - Double filtre temporel : 🌍 **Tous les temps (Global)** vs 📅 **Aujourd'hui (Quotidien)** pour un renouvellement permanent de la compétition.
    - Publication directe en 1-clic du record personnel avec retour visuel animé (bannière de rang célébré, son de victoire, avatar personnalisé parmi 8 hiboux).
    - Bouton direct "🏆 Classement" intégré sur tous les écrans de Game Over de chaque borne d'arcade, des 8 sprints Time Attack et du Quiz Indé.
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
29. **Extraction du Quiz Indé vers les Mini-Jeux & Expansion Massive (180 Questions Aléatoires) :**
    - Suppression du Quiz de la Boîte à Outils (`ToolboxHub.tsx`) pour lui redonner son statut à part entière de jeu culturel.
    - Création du composant dédié [`IndieQuizGame.tsx`](file:///src/components/quiz/IndieQuizGame.tsx) intégré au Hub des Mini-Jeux et à la sous-navigation avec lien profond `#quiz`.
    - 3 modes de jeu complets : 10 Questions (Standard), Survie (3 Vies), et Entraînement Infini sans fin.
    - Filtre par catégorie : Histoire & Lore, Bandes-son (OST), Gameplay, Créateurs & Studios, Trivia & Records.
    - Base de données bilingue (FR/EN) massivement enrichie à **180 questions vérifiées** (0 hallucination) tirées au sort avec mélange dynamique des 4 propositions (Fisher-Yates).
    - Raccourcis clavier [1] [2] [3] [4] et [Espace], explications détaillées "Le Saviez-vous ?" et cartes interactives vers la fiche Steam officielle pour les 169 pépites associées.
    - Badges dynamiques synchronisés dans le Hub et la barre d'onglets (`180 Questions` / `180 Q.`).
30. **Onglet Dédié "Catalogue" & Distanciation "Pépites" vs "Catalogue Étendu" (100% Déployé) :**
    - Extraction du Catalogue Steam hors de la Boîte à Outils pour en faire un onglet principal de premier niveau dans la Navbar desktop et mobile (`#catalog`).
    - Préservation stricte de l'onglet *"Pépites"* comme sanctuaire des 147 chefs-d'œuvre certifiés d'élite (>80% d'avis, OST, indices complets).
    - L'onglet *"Catalogue"* accueille désormais l'ensemble des jeux indépendants (y compris émergents, expérimentaux ou avec des avis plus partagés), permettant aux joueurs d'explorer et de se forger leur propre avis.
    - Base de données étendue portée à 192 jeux Steam authentiques (plus de 260 jeux indés jouables uniques au total).
31. **Option pour Masquer les Jeux Steam Déjà Possédés (100% Déployé) :**
    - Bouton bascule 1-clic intuitif `[👁️ Masquer possédés (X)]` déployé dans la barre de filtres rapides des Pépites (`GemExplorerHome.tsx`) et du Catalogue Étendu (`SteamCatalogExplorer.tsx`).
    - Synchronisation dynamique et persistance atomique `localStorage` (`hoot_hide_owned_games`) conservant le choix du joueur entre les onglets et les sessions.
    - Passerelle d'invitation avec badge Steam invitant à connecter son compte en 1 clic via OpenID officiel Valve si la bibliothèque n'est pas encore synchronisée.
    - Support multilingue complet (FR, EN, ES, DE, JA, PT-BR) et mise à jour en direct des compteurs de pépites à découvrir.
32. **Dynamisation Automatique de la Bannière "Catalogue Étendu de Jeux Indépendants" :**
    - Remplacer toute valeur statique ou référence chiffrée en dur dans les bannières par des variables dynamiques réactives (`stats.totalGames`, `stats.steamCatalogCount`, `allPlayableGames.length`).
    - Assurer que les compteurs reflètent toujours en temps réel le nombre exact de jeux moissonnés, sans besoin de mise à jour manuelle du code.
33. **Amélioration Poussée de la Version Mobile du Site (100% Déployé) :**
    - **Performance & Rendu Mobile-First (`modern-web-guidance`)** :
      - Intégration de `content-visibility: auto` avec `contain-intrinsic-size: auto none auto 280px` (`.deferred-card`) sur l'ensemble des grilles lourdes (Pépites, Catalogue Étendu 200+ jeux, Micro-Indés), différant le rendu des cartes hors-champ pour garantir un défilement 60 FPS fluide et réduire l'empreinte mémoire/GPU sur smartphone.
      - Optimisation LCP : priorité de chargement `fetchPriority="high"` et décodage asynchrone `decoding="async"` sur le hero du Daily Gem sans `loading="lazy"`.
    - **Ergonomie Tactile & Cibles Confortables** :
      - Élimination de la latence de tap (300ms) et du flash gris iOS via `touch-action: manipulation` et `-webkit-tap-highlight-color: transparent` sur tous les boutons, liens et tuiles.
      - Cibles tactiles confortables ($\ge 40\text{px} - 44\text{px}$) avec feedback d'enfoncement (`active:scale-95`).
      - Résolution du zoom intempestif d'iOS Safari sur le focus des formulaires (`input`, `select`, `textarea`) via une taille minimale de 16px sur mobile (`max-width: 640px`).
    - **Support des Safe Areas & Viewport Dynamique** :
      - Gestion des encoches et barres d'accueil iPhone via `env(safe-area-inset-bottom)` sur le tiroir de messagerie flottant (`ChatDrawer.tsx`) et les éléments ancrés.
      - Hauteurs adaptatives basées sur `100dvh` (`max-h-[calc(100dvh-4.5rem-env(safe-area-inset-bottom,0px))]`) pour éviter que le chat ne soit tronqué par la barre d'adresse mobile.
    - **Adaptation Spécifique des Mini-Jeux** :
      - **Linkle (Connections)** : Passage d'une grille 2 colonnes (8 rangées verticales avec scroll forcé) à une grille responsive 4 colonnes (`h-24 sm:h-32`), permettant aux 16 tuiles de tenir simultanément sur un seul écran sans aucun défilement.
      - **Screenle** : Agrandissement des sélecteurs d'étapes (`w-9 h-9 sm:w-10 sm:h-10`) et espacements resserrés pour un confort optimal au pouce.
      - **Barres de recherche & Modales** : Harmonisation avec `text-base sm:text-sm` et `max-h-[90dvh] overflow-y-auto` sur toutes les modales (Stats, Succès, Profil, Calendrier, Auth).
34. **Stratégie & Kit Marketing de Lancement (Streamers, LinkedIn, Réseaux Sociaux) :**
    - Préparation des supports de communication pour faire connaître le sanctuaire :
      - Messages d'approche types pour streamers Twitch et vidéastes YouTube gaming (format concis, angle divertissement "routine matinale / fin de live", duels 1v1 avec leur chat).
      - Posts d'annonce professionnels pour LinkedIn (focus sur le défi technique, l'architecture souveraine WebRTC P2P sans serveur intermédiaire, portfolio créateur de Quentin Beaud / Hibouxe).
      - Posts et visuels pour X / Twitter, Reddit (r/indiegames, r/webgames), TikTok / Shorts et serveurs Discord indés.
35. **Refonte Finale de la Direction Artistique (DA) — Préalable Impératif avant Partage :**
    - Finaliser la refonte visuelle globale (ambiance sylvestre et forêt nocturne poétique, finitions UI premium, harmonie des teintes émeraude/or, animations douces et identité forte du Hibou) **impérativement avant toute diffusion publique ou démarchage marketing**.
36. **Audit de la Gestion des Utilisateurs & Synchronisation Administrative (100% Déployé) :**
    - Diagnostiquer et corriger le flux de création de compte : lorsqu'un utilisateur ou un ami crée un compte (email / mot de passe via Supabase ou profil local/Steam), s'assurer qu'il est correctement répertorié et immédiatement visible dans le tableau de bord d'administration (`public/api/track.php` et `registered_usernames.json`).
    - Traiter les cas de confirmation d'email Supabase en attente, la synchronisation du pseudo souverain sur `public/api/usernames.php`, et les fallbacks en mode hors-ligne ou profils anonymes.
37. **Refonte DA "Nuit & Sylvestre", Bordures Bois & Harmonisation des Banderoles (100% Déployé) :**
    - Fond global assombri en sanctuaire de nuit forestière profonde (`#03150f` / `#06241b`), suppression des reliquats gris/bleus génériques.
    - Uniformisation complète des bordures de cadres en bois noble (`border-2 border-[#78350f]`) et ornements de lianes botaniques (`SylvestreIvyFrame`).
    - Harmonisation générale des banderoles d'en-tête (Hub mini-jeux, Arcade, Perchoir, Pépites) respectant strictement la charte graphique.
38. **Logo Officiel Hibouxe & Avatar Exclusif Créateur (100% Déployé) :**
    - Intégration du logo officiel officiel sans texte (`/logo.png`) en haute définition pour la Navbar, le footer et le favicon.
    - Création de l'avatar exclusif `hibouxe_creator` strictement réservé au créateur Quentin Beaud (SteamID 76561198035270542), avec cadenas visuel et sécurité backend interdisant la sélection par tout autre utilisateur.
39. **Réparation du Header & Responsiveness Mobile-First (100% Déployé) :**
    - Élimination des débordements sur smartphone (langue, bouton connexion, avatar restent parfaitement calés sans scroll horizontal).
    - Élimination du débordement desktop sur la droite (`100%` au lieu de `100vw`, contrainte `max-w-[1700px]`, breakpoint `xl` pour les onglets centraux).
40. **Positionnement Bidirectionnel Smart Dropdown & Padding de Confort (100% Déployé) :**
    - Détection dynamique du viewport dans `GameSearchBar.tsx` : le menu s'ouvre automatiquement vers le haut (`dropup`) si l'espace inférieur est restreint (< 260px) et clampe sa hauteur maximale en direct.
    - Résolution de la liste passant sous le bas de page ou sous le footer, avec marges protectrices `pb-36 sm:pb-48` et `min-h-[calc(100vh-140px)]` sur tous les mini-jeux.
41. **Adaptation Dynamique de l'Autocomplétion aux Indices Déduits dans Classic / Indledle (100% Déployé) :**
    - Moteur de déduction en direct dans `IndledleGame.tsx` (année exacte ou bornes fléchées, style graphique exact/éliminé, caméra, studio, genres).
    - Bandeau d'indices confirmés au-dessus de la saisie (`[📅 2018]`, `[🎨 2D Pixel Art]`, etc.).
    - Filtrage automatique des suggestions de jeu sur les seuls candidats possibles (`🎯 X jeux possibles`), avec bascule 1-clic pour voir tout le catalogue si désiré.
42. **Audit Critique de la Direction Artistique (DA) : Analyse des Plus et des Moins (Terminé) :**
    - Réaliser un audit approfondi et honnête de notre DA (esthétique, ergonomie, praticité, lisibilité, impact mobile, cohérence globale). Synthèse complète et plan d'action intégrés dans la feuille de route.
43. **Ancrage Réel du Perchoir (Portfolio Créateur Quentin Beaud) & Vraies Images (100% Déployé) :**
    - Suppression complète des illustrations de stock génériques au profit des projets et créations authentiques de Quentin Beaud.
    - Organisation en 2 rangées de 3 cartes prestigieuses :
      1. **Chaîne YouTube @Hibouxe** : Vidéos immersives racontant l'histoire et le lore des jeux vidéo, bannière officielle HD avec badge certifié.
      2. **Donjon de Naheulbeuk 2.0** : Prototype RPG tactique avec extraction des vrais sprites pixel-art du Barbare et de l'Elfe depuis le projet Godot local (`old_sprites`), lien vers le repo GitHub.
      3. **Portfolio Quentin Beaud** : Lien direct vers quentinbeaud.com avec capture d'écran authentique de la page d'accueil.
      4. **Fan-Traduction FR Dragon Quest Torneko** : Guide Steam communautaire officiel (AppID 3798729607) et dépôt GitHub avec bannière de guide.
      5. **La Salle d'Arcade** : Action "Jouer direct" ouvrant instantanément la borne ou le hub d'arcade, capture in-game.
      6. **Les 8 Défis Quotidiens** : Action "Jouer direct" naviguant instantanément vers les mini-jeux du site.
44. **Correction Critique de Bug Versus (Reset Inopiné lors de Clics Simultanés) (100% Déployé) :**
    - Résoudre le bug où, si les 2 joueurs cliquent en même temps ou presque, la partie en cours se réinitialise sans raison apparente.
    - Diagnostic : double déclenchement concurrent de `advanceRoundP2P` sans annulation des timers de transition, désynchronisation des états de manche et risque de fausse fermeture de salon (`roomClosed: true`) lors d'écritures simultanées sur l'API de relais `versus_room.php`.
    - Implémenter un verrou d'arbitrage de manche (`roundResolvedRef`), une annulation systématique des timers de transition concurrents et un verrouillage atomique tolérant sur le backend.
45. **Ajout de Nouvelles Langues pour le Sanctuaire (Internationalisation Étendue) (100% Déployé) :**
    - Support multilingue étendu avec 6 langues opérationnelles : 🇫🇷 Français (`fr`), 🇬🇧 Anglais (`en`), 🇪🇸 Espagnol (`es`), 🇩🇪 Allemand (`de`), 🇯🇵 Japonais (`ja`) et 🇧🇷 Portugais brésilien (`pt-BR`).
    - Dictionnaires exhaustifs créés dans `src/i18n/locales/`, sélecteur élégant et compact dans la Navbar avec drapeaux et raccourcis, détection automatique du navigateur, persistance `localStorage` et utilitaire universel `src/utils/localization.ts` traduisant automatiquement l'ensemble des 53 genres indés, des caméras et styles visuels.
46. **Mise à Jour Complète des Outils de la "Boîte à Outils" (`ToolboxHub.tsx`) (100% Déployé) :**
    - **Roulette à Pépites Dynamique** : Connectée à l'intégralité des **161 pépites certifiées** avec 7 ambiances distinctes (*Toutes les Pépites*, *Détente & Douceur*, *Action & Frénésie*, *Cérébral & Énigmes*, *Sombre & Frisson*, *Récit & Émotion*, *Défi & Dépassement*), compteurs de candidats en direct, animation de tirage avec sons, carte résultat détaillée (durée estimée HowLongToBeat, avis Steam, prix, genres traduits, lien direct).
    - **Estimateur de Backlog Intégral** : Couvre les 161 jeux avec recherche instantanée, filtres par durée (*< 10h*, *10-25h*, *25-50h*, *50h+*), 4 presets rapides (*Express*, *Incontournables*, *Cozy*, *Effacer*), persistance atomique `localStorage`, curseur d'heures quotidiennes (0.5h à 8h/j) et calcul précis de la date d'achèvement calendaire.
    - **Optimiseur de Budget Soldes Steam en Direct** : Connecté aux données officielles certifiées `STEAM_STORE_DATA` (prix en euros, promotions réelles -X%, avis positifs), 4 stratégies gloutonnes intelligentes (*Meilleur Ratio Heures/Prix*, *Top Évaluations Steam*, *Grosses Soldes*, *Pépites Variées*), métriques de dépenses, reliquat et heures cumulées.
    - **Compendium & Explorateur Multicritères** : Recherche plein texte, filtres simultanés par genre, prix (Gratuits, < 10 €, < 20 €, En solde), caméra (2D côté, 2D dessus, 3D...), style visuel (Pixel Art, Dessiné main, Low-poly...), et 7 options de tri avancées.
    - **Radar des Sorties Indés (2025-2026)** : Fiches immersives des jeux à venir avec jauges de hype, fenêtres prévisionnelles (2026, 2027+, TBA), citations de gameplay et boutons de liste de souhaits Steam.
    - **Harmonisation DA Sylvestre** : Palette nuit forestière (`#04120e` / `#061813`), bordures bois noble (`#78350f`), accents dorés et émeraude, ergonomie 100% mobile-first sans débordement.
47. **Traduction Intégrale du Site dans Toutes les Langues Disponibles (100% Déployé) :**
    - **Parité Totale des Dictionnaires UI (891 clés / 891 clés)** : Synchronisation à 100% dans l'ensemble des 6 dictionnaires (`fr.json`, `en.json`, `es.json`, `de.json`, `ja.json`, `pt-BR.json`).
    - **Questions du Quiz Indé (`quizQuestions.ts`)** : Traduction intégrale des 76 questions de la banque de base, des 4 choix et des explications historiques dans les 6 langues (FR, EN, ES, DE, JA, PT-BR) avec fallback automatique.
    - **Radar des Sorties Indés (`upcomingGames.ts`)** : 100% des 9 jeux très attendus traduits en ES, DE, JA, PT-BR.
    - **Projets du Perchoir (`roostProjects.ts`)** : 100% des 6 créations et projets de Quentin Beaud traduits en ES, DE, JA, PT-BR.
    - **Règles & Catégories Linkle (`connectionsPuzzles.ts`)** : 100% des 46 règles procédurales et thématiques dotées de titres natifs dans les 6 langues.
    - **Critiques Steam Caviardées (`reviewPuzzles.ts`)** : 100% des 20 critiques cultes et du générateur de repli traduits avec caviardage authentique dans les 6 langues.
    - **Succès & Plumes d'Or (`achievements.ts`)** : 100% des succès traduits dans les 6 langues officielles.
    - **Éradication des Contrôles Binaires** : Disparition totale des ternaires `isFr` et `startsWith('fr')`, généralisation de `getLocalizedText()` et `getDurationCategoryLabel()`.
48. **Responsiveness du Header & Prévention des Dépassements selon la Langue (Surveillance Continue & Optimisations Déployées) :**
    - Faire attention au header (`Navbar.tsx`) qui dépasse de l'écran selon la langue choisie (notamment avec les traductions allemandes `de` ou brésiliennes `pt-BR` plus longues, ex: 'Connexion' / 'Anmelden' / 'Conectarse', les 6 onglets centraux, et les utilitaires calendrier / audio).
    - Maintenir une navigation centrale flexible et compressible (`shrink min-w-0`, `gap-0.5 2xl:gap-1`, polices adaptatives), passage en icône seule pour l'authentification sur mobile (`hidden sm:inline`), bascule adaptative des boutons secondaires au breakpoint `2xl`, et garantie d'absence totale de défilement horizontal (0px de scroll horizontal sur mobile ≤ 400px, tablettes et laptops 1280px) dans toutes les 6 langues.
49. **Correction du Bug "Échec de l'analyse : NetworkError when attempting to fetch resource." lors de la suggestion d'un jeu indé (100% Déployé) :**
    - **Diagnostic du bug** : Lors de la soumission d'une URL ou d'un AppID dans *"Suggérer un jeu indé"* (`SteamCatalogExplorer.tsx`), le client tentait un double `fetch()` direct vers `https://store.steampowered.com/api/appdetails?appids=${appId}&l=french/english`. L'API officielle de Valve n'autorisant pas le CORS depuis un domaine externe en environnement web classique, le navigateur bloquait la requête HTTP et renvoyait `TypeError: NetworkError when attempting to fetch resource.` (ou `Failed to fetch`).
    - **Architecture de contournement souveraine déployée** :
      - Création de l'action serveur `lookup` dans [`public/api/suggest_game.php`](file:///public/api/suggest_game.php) interrogeant l'API Valve via cURL côté serveur avec User-Agent authentique, timeout et gestion bilingue (FR/EN), éliminant 100% des erreurs CORS.
      - Intégration dans [`SteamCatalogExplorer.tsx`](file:///src/components/steam/SteamCatalogExplorer.tsx) d'une cascade résiliente : appel prioritaire au proxy PHP souverain, fallback sur proxy CORS public en environnement dev hors-ligne, et affichage de messages d'erreur clairs en cas de jeu introuvable ou restreint.
      - Gestion du code HTTP 429 (rate-limiting) avec notification utilisateur explicite.
50. **Section Dédiée aux Micro-Indés & Pépites Itch.io ("La Clairière des Micro-Indés") (100% Déployé) :**
    - **Vision & Soutien aux Créateurs de l'Ombre** : Sanctuaire d'exposition entièrement dédié aux créateurs indépendants solo, micro-studios, jeux de game jams (PICO-8, Ludum Dare, GMTK) et créations Itch.io souvent occultées par les blockbusters du milieu.
    - **Vitrine Complète & Propre Section sur le Site** : Composant dédié [`MicroIndieHub.tsx`](file:///src/components/microindies/MicroIndieHub.tsx) accessible via la Navbar (`#microindies` / `🌱 Micro-Indés`) et depuis le Hero de l'Explorateur de Pépites.
    - **Support Multi-Plateforme (Steam, Itch.io & Web)** :
      - Badges spécifiques : Itch.io 🔴, Steam ⚫, Jouable directement dans le navigateur 🌐 (HTML5 / WebAssembly / PICO-8).
      - Bouton de lancement instantané *"Jouer en direct 🌐"* permettant de tester les jeux sans téléchargement.
    - **Formulaire Participatif & Modération Souveraine** :
      - Modale interactive [`ProposeMicroIndieModal.tsx`](file:///src/components/microindies/ProposeMicroIndieModal.tsx) permettant à n'importe quel joueur ou studio de proposer une pépite en 30 secondes.
      - Backend sécurisé [`public/api/micro_indies.php`](file:///public/api/micro_indies.php) avec hachage d'IP, rate-limiting, assainissement XSS et système de votes/cœurs ❤️ communautaires.
    - **Alimentation Automatique Nocturne Itch.io** :
      - Extension de [`scripts/dailyIndieHarvest.ts`](file:///scripts/dailyIndieHarvest.ts) pour moissonner les flux RSS d'Itch.io (`/games/top-rated.xml`, `/games/new-and-popular.xml`) et enrichir automatiquement la Clairière chaque nuit.
51. **Réparation du Workflow GitHub Actions "Daily Indie Games Harvest" (`daily-indie-harvest.yml`) (100% Déployé) :**
    - **Diagnostic des causes racines** :
      - 1. *Erreur TypeScript initiale (Exit code 2)* : Le script d'alimentation [`scripts/dailyIndieHarvest.ts`](file:///scripts/dailyIndieHarvest.ts) régénérait `src/data/games.ts` sans inclure l'export `getDailyProfilleGame`. Lors du `npm run build`, TypeScript levait `TS2305` puis `TS7006` dans [`src/components/profille/ProfilleGame.tsx`](file:///src/components/profille/ProfilleGame.tsx).
      - 2. *Erreur Git working tree rebase (Exit code 128)* : Lors de l'étape de compilation `npm run build`, le script prebuild `generateSeoIndex.ts` mettait à jour le fichier racine `index.html`. L'étape de commit ne stagiait que `src/data/games.ts src/data/upcomingGames.ts`, laissant `index.html` modifié mais non indexé dans l'arbre de travail. La commande suivante `git pull --rebase origin main` échouait alors immédiatement avec `error: cannot pull with rebase: You have unstaged changes (code 128)`.
      - 3. *État détaché de HEAD* : Sans `ref: main` dans `actions/checkout@v4`, le push `origin main` pouvait échouer ou cibler une référence obsolète au lieu de `origin HEAD:main`.
    - **Correctifs déployés & validés** :
      - 1. **Pérénnisation de `getDailyProfilleGame`** : Ajouté au template `fileFooter` de `saveGamesDatabase` dans [`scripts/dailyIndieHarvest.ts`](file:///scripts/dailyIndieHarvest.ts).
      - 2. **Typage défensif strict** dans [`src/components/profille/ProfilleGame.tsx`](file:///src/components/profille/ProfilleGame.tsx) : paramètres `(src: string, idx: number)` et `(g: string)` typés explicitement.
      - 3. **Mise à niveau de l'environnement GitHub Actions** : passage de `node-version: 20` à `node-version: 22` LTS dans `.github/workflows/daily-indie-harvest.yml` et `.github/workflows/deploy-ovh.yml`.
      - 4. **Indexation complète & réconciliation Git propre** : Ajout de `ref: main` sur le checkout, staging systématique de `index.html` aux côtés des fichiers de données, nettoyage défensif `git checkout -- .` avant rebase, et push explicite `origin HEAD:main`.
      - 5. **Tests de validation** : `npm run build` et `npm run audit-db` validés à 100% sans aucune erreur.
52. **Intégration de Jeux Indés 100% Gratuits dans le Catalogue Certifié (100% Déployé) :**
    - Réparation du filtre *"Gratuits 🆓"* qui n'affichait aucun jeu car 100% des 147 pépites initiales étaient payantes.
    - Ajout de **6 chefs-d'œuvre indépendants cultes 100% gratuits** (0,00 €) vérifiés avec captures HD Akamai, fiches bilingues et 0 hallucination :
      - *HoloCure - Save the Fans!* (Steam 2420510 + Itch.io, 99% d'avis positifs sur plus de 40 000 avis, roguelike bullet-hell)
      - *Doki Doki Literature Club!* (Steam 698780 + Itch.io, 96% d'avis positifs sur plus de 228 000 avis, roman visuel psychologique culte)
      - *Grimm's Hollow* (Steam 1170880 + Itch.io, 99% d'avis positifs sur plus de 14 000 avis, RPG d'aventure poétique)
      - *The Looker* (Steam 1985690, 97% d'avis positifs sur plus de 16 000 avis, parodie de réflexion de The Witness)
      - *Cry of Fear* (Steam 223710, 89% d'avis positifs sur plus de 87 000 avis, survival-horror psychologique)
      - *Muck* (Steam 1625450, 93% d'avis positifs sur plus de 184 000 avis, roguelike de survie)
    - Catalogue des pépites certifiées porté à **153 jeux d'élite** (100% conformes aux 9 règles d'audit strictes).
53. **Correction de l'Inférence des Tags (3D vs 2D / Pixel Art), Bouton Son Direct et Réparation des Images Micro-Indés (100% Déployé) :**
    - **Résolution du faux positif "3D Stylisée"** : Analyse approfondie montrant que les hashes hexadécimaux de médias Steam CDN (ex: `...3de...`) dans les descriptions brutes activaient le drapeau 3D et écrasaient la détection de 2D et de Pixel Art.
    - **Moteur d'inférence dédié (`src/utils/gameInference.ts`)** : Nettoyage préalable des URLs et balises HTML, détection stricte par délimiteurs `\b3d\b`, priorité absolue aux styles 2D explicites, Pixel Art et dessinés main.
    - **Bouton Son Direct sur la Navbar** : Extraction de la bascule audio hors du menu déroulant et placement direct sur la barre de navigation principale pour couper ou réactiver le son en 1 clic.
    - **Images Micro-Indés Réparées** : Remplacement des liens d'images cassés pour *Celeste Classic* (GIF de couverture et capture cartouche officielle PICO-8) et *Buckshot Roulette* par des actifs vérifiés (HTTP 200).
    - **Écrin Quotidien Épuré** : Retrait de l'émoji plante 🌱 de l'intitulé "La Clairière des Micro-Indés" dans le bouton d'accueil et harmonisation des traductions en 6 langues.
    - **Fiches Mises à Jour** : Correction des métadonnées de *Darby Is Here Forever* (Pixel Art, Vue de côté 2D, Platformer) et *Quack my Duck* (Vue du dessus 2D).
54. **Intégration des Jeux Itch.io non (ou plus) Micro-Indés dans notre Catalogue & Pépites (100% Déployé) :**
    - Double indexation native (Steam + Itch.io) opérationnelle pour l'ensemble des chefs-d'œuvre indépendants nés ou hébergés sur Itch.io (*A Short Hike*, *Anodyne*, *Minit*, *Baba Is You*, *Frog Detective 1*, *Inscryption*, *Celeste*, *Vampire Survivors*, *Buckshot Roulette*, *Doki Doki Literature Club*, *HoloCure*, *Grimm's Hollow*, *Dorfromantik*, *Pony Island*, *Night in the Woods*, *10 Minutes Till Dawn*, *Canabalt Classic*, *A Monster's Expedition*, *Later Alligator*, *Our Life*, *A Date with Death*, *Blooming Panic*, *Celeste Classic*, *Adventures with Anxiety*).
    - Boutons d'accès direct bivalents "Voir sur Steam" et "Voir sur Itch.io" avec badge distinctif Itch.io corail (`#fa5c5c`) et affichage des modèles économiques (Gratuit, Prix Libre / Don, Payant).
    - Filtre rapide dédié `Itch.io` accessible en 1 clic dans les explorateurs de jeux (`GemExplorerHome.tsx` et `SteamCatalogExplorer.tsx`).
55. **Ajout de Nouveaux Styles de Jeu et Catégories Émergentes (Idle / Clicker, Incrémental, Automatisation...) (100% Déployé) :**
    - **12 Nouvelles Catégories Canoniques Déployées** : Intégration complète de 12 genres émergents et piliers du jeu indépendant (*Auto-Shooter*, *Automatisation*, *City Builder*, *Colony Sim*, *Déduction Sociale*, *Idle / Clicker*, *Immersive Sim*, *Incrémental*, *Party Game*, *Physique*, *Point & Click*, *Visual Novel*). Typologie canonique portée de 53 à 65 genres.
    - **Traduction Multilingue Intégrale (6 Langues)** : Ajout des équivalents stricts en français, anglais, espagnol, allemand, japonais et portugais (BR) dans [`src/utils/localization.ts`](file:///src/utils/localization.ts).
    - **Moteur d'Inférence Sémantique & Mappage Automatique** : Enrichissement d'`inferEnrichedGenres` dans [`src/utils/gameInference.ts`](file:///src/utils/gameInference.ts) pour classifier automatiquement les pitchs et tags Steam.
    - **Re-catégorisation des Jeux Existants** : Mise à jour des jeux phares de la base (*Vampire Survivors*, *Brotato*, *20 Minutes Till Dawn*, *HoloCure*, *Megabonk*, *Slay the Princess*, *Doki Doki Literature Club*, *Oxygen Not Included*, *Dorfromantik*, *Manor Lords*, *Chants of Sennaar*, *Teardown*, *World of Goo*, *IGTAP*).
    - **10 Nouveaux Chefs-d'Œuvre Canoniques Ajoutés (Règle 0 Hallucination)** :
      - *Factorio* (Wube Software, Daniel James Taylor, Automatisation / Gestion)
      - *RimWorld* (Ludeon Studios, Alistair Lindsay, Colony Sim / Survie)
      - *Cookie Clicker* (Orteil, C418, Idle / Clicker / Incrémental)
      - *Townscaper* (Oskar Stålberg, Martin Kvale, City Builder / Cozy)
      - *shapez* (Tobias Springer, Automatisation / Puzzle)
      - *Rusty's Retirement* (Mister Morris Games, Idle / Clicker / Farming)
      - *Frostpunk* (11 bit studios, Piotr Musiał, City Builder / Survie)
      - *Shadows of Doubt* (ColePowered Games, Nick Dymond, Immersive Sim / Enquête)
      - *Duck Game* (Landon Podbielski, Party Game / Action)
      - *Return to Monkey Island* (Terrible Toybox, Peter McConnell, Point & Click / Aventure)
    - **Synchronisation Steam Store & Métadonnées Directes** : 171 jeux officiellement indexés avec prix en temps réel, avis certifiés et captures haute définition Akamai CDN. Base validée à 100% par `npm run audit-db` et build validé sans erreur.
56. **Monétisation Éthique, Dons, Publicité Non-Intrusive & Partenariats Studios :**
    - **Dons & Soutien Communautaire (Ko-fi / GitHub Sponsors / Buy Me a Coffee)** :
      - Offrir aux visiteurs et passionnés la possibilité de soutenir les coûts d'hébergement et le travail bénévole de Quentin Beaud de façon libre et volontaire ("Offrir un café au Hibou" / "Soutenir le Sanctuaire").
      - Absence absolue de paywall : 100% des jeux quotidiens, bornes d'arcade, outils et catalogues restent totalement libres et gratuits d'accès.
      - Reconnaissance honorifique : attribution symbolique du rôle "VIP / Mécène" et badges de profil exclusifs pour les donateurs.
    - **Publicité Respectueuse & Non-Intrusive (Privacy-Friendly)** :
      - Explorer des formats publicitaires éthiques et discrets, sans pop-up, sans lecture automatique vidéo/son, sans pistage tiers invasif ni cookies de profilage (ex. EthicalAds ou bannières statiques auto-hébergées).
      - Emplacements stricts et non bloquants : footer discret ou écran de bilan de fin de partie, sans jamais interrompre une session de jeu active ni empiéter sur le canvas des bornes d'arcade.
      - Option de désactivation en un clic pour les utilisateurs connectés ou donateurs.
    - **Partenariats avec Créateurs & Studios Indépendants** :
      - Création d'un programme d'exposition "Studio Partenaire / Pépite Coup de Cœur" pour donner de la visibilité aux développeurs indépendants émergents (sorties majeures, campagnes de financement participatif).
      - Affiliation transparente et respectueuse (liens d'achat Steam / Itch.io / Humble Bundle avec mention explicite).
      - Concours communautaires et distribution de clés offertes par des studios partenaires lors d'événements spéciaux.
57. **Référencement Exhaustif (SEO) & Préparation Technique de Partage 1.0 (Phase Marketing) :**
    - **Mise à niveau du Sitemap XML (`public/sitemap.xml`)** :
      - Déclarer toutes les nouvelles routes et sections créées lors des derniers sprints (`#microindies`, `#catalog`, `#friends`), actualiser la date de dernière modification `lastmod` (2026-09-21) et configurer les balises d'alternance `xhtml:link` pour les 6 langues officielles du sanctuaire (FR, EN, ES, DE, JA, PT-BR).
    - **Enrichissement Sémantique & JSON-LD (`scripts/generateSeoIndex.ts` & `index.html`)** :
      - Synchroniser les compteurs officiels sur les 177 pépites certifiées et l'écosystème Itch.io.
      - Enrichir la foire aux questions (`FAQPage`) avec les nouvelles thématiques (Micro-Indés, Système d'Amis zéro-spoil, Arène Versus P2P, Pépites Itch.io).
      - Structurer les données enrichies `ItemList` pour un référencement optimal des 177 fiches de jeux sur Googlebot et Bingbot.
    - **Cartes de Partage Social Réseau & OpenGraph (`og:image`, Twitter Cards)** :
      - Optimiser l'affichage des aperçus lors des partages sur Discord, Twitter / X, LinkedIn, Reddit et Bluesky avec cache-buster `?v=3` pour forcer le rafraîchissement des miniatures.
      - Titres et descriptions percutants, sans superlatif creux, mettant en valeur l'indépendance du projet et le catalogue certifié.
    - **Audit Technique Core Web Vitals & Google Search Console** :
      - Vérification du temps de chargement (LCP, INP, CLS), validation des balises canoniques absolues, compression HTTP et conformité des règles d'indexation dans `robots.txt`.
58. **Ajout d'Easter Eggs & Secrets Interactifs sur le Site (100% Déployé) :**
    - Dissimuler des secrets ludiques et hommages rétro à travers le sanctuaire pour récompenser la curiosité des joueurs (ex: Konami Code au clavier et à la manette déclenchant un filtre CRT ou effet rétro, interactions cachées en cliquant sur la mascotte Sylvestre / logo, secrets audio ou visuels dans la Salle d'Arcade, et messages soignés dans la console de dev).
59. **Audit et Nettoyage des Liens Externes & Liens Itch.io (100% Déployé) :**
    - Vérifier et corriger l'ensemble des liens vers les boutiques et plateformes externes (Steam et Itch.io) afin d'éliminer les liens brisés, expirés ou délistés (notamment le lien Itch.io de *Mouthwashing* devenu obsolète, et auditer les autres jeux pour garantir 100% de liens valides).
60. **Intégration du Chef-d'Œuvre "Owlboy" au Catalogue (100% Déployé) :**
    - Ajout officiel d'*Owlboy* par D-Pad Studio (Steam 115800, bande-son de Jonathan Geer, 6 captures 1080p certifiées, taglines bilingues) avec 100% de conformité aux règles d'audit (`npm run audit-db`). Le sanctuaire compte désormais **187 pépites certifiées**.
61. **Éradication des Images de Remplacement Génériques dans Linkle (100% Déployé) :**
    - Résolution des erreurs 404 causées par le nouveau schéma de hachage des jaquettes Steam CDN (2024-2026) et par les timestamps de captures expirés (*Minit*, *Anodyne*, *Canabalt*, *Later Alligator*, *Frog Detective 1*, *A Monster's Expedition*, *Blasphemous*).
    - Remplacement de l'ensemble des fallbacks de stock photos Unsplash par des jaquettes Steam officielles et des fallbacks de captures in-game certifiées HTTP 200 sur 100% des 187 jeux.
62. **Option de Filtrage Adaptatif des Choix dans Classic (Indledle) (100% Déployé) :**
    - Ajouter une bascule de préférence intuitive permettant au joueur de choisir si la liste déroulante d'autocomplétion s'adapte ou non dynamiquement aux indices qu'il a déjà trouvés (année, style visuel, caméra, genres...).
    - Permettre aux joueurs puristes de désactiver l'assistance pour chercher librement parmi tout le catalogue, ou de l'activer pour restreindre automatiquement les propositions aux seuls candidats mathématiquement valides.
63. **Diversification des Catégories d'Attributs dans "Profil" (Profille) (À FAIRE) :**
    - Renouveler l'expérience quotidienne de Profille en variant dynamiquement les 3 catégories à déduire d'un jour à l'autre au lieu de toujours proposer le même trio immuable [Année, Studio, Genres].
    - Intégrer de nouvelles catégories thématiques (Compositeur / Bande originale, Direction Artistique / Style Visuel, Angle de caméra / Perspective, Modèle économique...) tirées au sort de façon déterministe chaque jour.
64. **Agrandissement de la Barre Supérieure (Navbar) pour le Slogan (100% Déployé) :**
    - Agrandir de quelques pixels la hauteur du header / barre du haut (actuellement `h-14 sm:h-16`, à porter vers `h-16 sm:h-[70px]`) et ajuster le conteneur textuel pour que la phrase *"Le sanctuaire quotidien des passionnés et explorateurs de jeux vidéo indépendants"* ne dépasse plus vers le bas et dispose d'une marge de respiration esthétique.
65. **Épuration des Notifications & Compteur d'Amis Connectés Non-Clignotant (100% Déployé) :**
    - Retirer la pastille de notification sur l'icône/onglet des amis lorsqu'il n'y a pas de véritable notification en attente (zéro demande d'ami non traitée ni invitation 1v1).
    - Afficher à la place un indicateur stable et discret du nombre d'amis actuellement connectés (en ligne), sans aucun clignotement intempestif (`animate-pulse` supprimé).
66. **Système de Pagination du Catalogue et des Pépites & Fermeture au Clic Extérieur (100% Déployé) :**
    - Déploiement d'un système de pagination fluide avec sélecteur de densité paramétrable par le joueur (`12`, `24`, `48`, `96` ou `Tous`) persistant dans `localStorage` (`hoot_items_per_page`) sur le Catalogue Étendu (`SteamCatalogExplorer.tsx`) et l'Explorateur de Pépites (`GemExplorerHome.tsx`).
    - Double commande ergonomique : pilules de sélection rapide en haut de la grille et directement dans la barre de pagination au bas de page.
    - Suppression intégrale de la phrase limitante *"Affichage des 48 premiers résultats sur 286. Affinez votre recherche pour cibler un jeu précis."*.
    - Composant réutilisable [`PaginationControls.tsx`](file:///src/components/common/PaginationControls.tsx) avec algorithme d'ellipse adaptative (`[1, 2, 3, 4, 5, '...', 12]`), commandes Début / Précédent / Suivant / Fin, retour haptique sonore Web Audio (`soundFx.playClick()`) et remontée fluide en haut de grille (`scrollToId`).
    - Réinitialisation automatique à la page 1 lors de la modification des filtres ou de la recherche, et recalcul intelligent de la page cible lors d'un changement de densité pour ne jamais perdre sa position de lecture.
    - Gestion intelligente du tirage aléatoire (*Roulette*) dans Pépites calculant et activant automatiquement la bonne page du jeu tiré au sort.
    - Fermeture ergonomique de la modale de prévisualisation de jeu au clic extérieur sur l'arrière-plan assombri (backdrop `onClick={handleCloseModal}` avec arrêt de propagation sur le corps de la fenêtre) et via la touche Échap (`Escape`).
67. **Affichage & Synchronisation des Prix Manquants, Calibrage Pépites vs Catalogue & Wartales (100% Déployé) :**
    - **Synchronisation Exhaustive Valve Steam Store** : Couverture portée à **288 jeux indépendants** (l'ensemble des Pépites + l'intégralité du Catalogue Étendu) via [`scripts/syncSteamStoreData.ts`](file:///scripts/syncSteamStoreData.ts) et la commande `npm run sync-store`.
    - **Happy Wheels & Nouveaux Jeux** : *Happy Wheels* affiche désormais ses 4,99 € et 95% d'avis positifs sur 2 058 avis, ainsi que *Beat Saber* (14,99 €), *Graveyard Keeper* (3,90 €), *The Piper of Dawn* (12,14 €), etc.
    - **Reclassement et Étanchéité du Sanctuaire des Pépites** : Reclassement de *Birthday* (7 avis) et des 7 jeux confidentiels (< 50 avis) vers le Catalogue Étendu (`steam_catalog.json`) pour préserver l'équité des 8 défis quotidiens.
    - **Critères d'Éligibilité Rehaussés** : Seuil strict de promotion automatique fixé à $\ge 500$ avis Steam et $\ge 85\%$ d'avis positifs dans [`scripts/dailyIndieHarvest.ts`](file:///scripts/dailyIndieHarvest.ts).
    - **Correction Critique Wartales** : Correction de l'AppID officiel Steam (`1527950`, 34,99 €, 35 963 avis, Très positifs) et captures HD certifiées.
    - **Automatisation CI/CD** : Intégration de l'étape de synchronisation des prix dans le workflow nocturne GitHub Actions [`.github/workflows/daily-indie-harvest.yml`](file:///.github/workflows/daily-indie-harvest.yml).
68. **Retrait de "Big Sister" (100% Déployé) & Gestion des Jeux en Temps Réel pour l'Admin (À FAIRE) :**
    - Retirer "Big Sister" ("Grande sœur") de la liste des pépites certifiées (`INDIE_GAMES` dans `src/data/games.ts`).
    - Développer dans l'espace Administrateur (`AdminDashboardModal.tsx`) un panneau de gestion CRUD en temps réel des jeux du sanctuaire : ajout direct, modification (titre, studio, année, genres, captures, liens boutiques, statut certifié/micro-indé), masquage temporaire et suppression immédiate avec persistance sécurisée côté serveur.
69. **Amélioration du Blind Test & Correction du Bug de Sélection (Balatro) (100% Déployé) :**
    - Enrichir la bibliothèque musicale du Blind Test avec de nouvelles pistes et thèmes légendaires de la scène indépendante.
    - Corriger le bug de la barre de sélection/recherche : s'assurer que tous les jeux cibles figurant dans les devinettes musicales (comme *Balatro*) apparaissent obligatoirement et sans anomalie dans la liste déroulante d'autocomplétion.
70. **Leaderboard : Unicité des Scores par Compte (Conservation du Meilleur Score Personnel) (100% Déployé) :**
    - Mettre à jour `public/api/leaderboard.php` pour n'autoriser qu'un seul enregistrement par compte utilisateur par borne d'arcade et par sprint Time Attack.
    - Lors de la soumission d'un score, ne remplacer l'entrée que si la nouvelle performance surpasse le record personnel existant (score plus élevé ou temps plus court), éliminant tout doublon d'un même joueur dans les classements.
71. **Arcade Tetris : Délimitation Visuelle Nette de la Matrice de Jeu (100% Déployé) :**
    - Ajouter des bordures contrastées, stylisées et immersives autour de la grille de jeu 10x20 dans la borne Tetris (`ArcadeModal.tsx`) pour délimiter précisément l'espace de chute des tétraminos par rapport aux panneaux d'informations périphériques.
72. **Sélecteur de Difficulté dans les Jeux d'Arcade (100% Déployé) :**
    - Ajouter une sélection de difficulté (ex: *Détente / Normal / Expert* ou réglage de la vitesse initiale) sur les 8 bornes d'arcade (*Snake*, *Tetris*, *Flappy Hibou*, *Breakout*, *Pong*, *Space Invaders*, *Course Sylvestre*, *Mine Storm*) avec coefficients de score proportionnels.
73. **Évolution de Course Sylvestre : Mécanique de Se Baisser & Parcours 100% Franchissable (100% Déployé) :**
    - Action d'esquive basse (glissade / se baisser avec Flèche Bas, S ou bouton tactile dédié `GLISSER`) pour franchir les obstacles aériens et branches basses.
    - Algorithme procédural de génération d'obstacles avec zone tampon calibrée et chute rapide en l'air, mathématiquement garanti 100% franchissable sans collision inévitable.
74. **Évolution du Casse-Briques (Breakout) : Niveaux Multiples & Système de Bonus (100% Déployé) :**
    - Structuration en 5 niveaux thématiques successifs (*Bosquet Sylvestre, Pyramides Jumelles, Vol du Grand-Duc, Remparts Antiques, Trône Astral*) avec briques renforcées (2 PV).
    - Système de capsules de bonus (power-ups) animées : multibille, raquette large, tir laser rafale, ralentisseur de balle et vie bonus (+1 PV).
75. **Optimisation Performance des Jeux d'Arcade (Zéro Lag / 60 FPS) (100% Déployé) :**
    - Boucle d'animation `startFixedLoop` calibrée à 60 FPS constants avec gestion `document.hidden`, élimination de l'accumulation de retard et limitation du delta temporel (max 120ms anti-lag).
    - Zéro allocation dans la boucle de frame : suppression des `.filter()` répétitifs, plafonnement des particules (max 35-50) et élimination du `shadowBlur` lourd.
76. **Optimisation Mobile Globale (Fluidité & Zéro Ralentissement) (100% Déployé) :**
    - Rendu ultra-rapide avec `content-visibility: auto` et `contain-intrinsic-size` (`.deferred-card`) sur les catalogues (Pépites, 200+ Catalogue Étendu, Micro-Indés).
    - Décodage asynchrone `decoding="async"`, `fetchPriority="high"` sur le hero du Daily Gem sans `loading="lazy"`.
    - Ergonomie tactile : `touch-action: manipulation`, cibles confortables $\ge 40\text{px}-44\text{px}$, grille 4 colonnes Linkle (16 tuiles en 1 écran), safe areas iOS (`env(safe-area-inset-bottom)`) et modales `90dvh`.
77. **Vérification Complète Finale du Site (Sécurité, Performance, Mises à Jour Automatiques) (À FAIRE) :**
    - Une fois l'ensemble des chantiers achevés, réaliser un audit de certification exhaustif : cybersécurité (en-têtes, XSS, CSRF, injections), scores Lighthouse / Web Vitals, workflows GitHub Actions de moissonnage nocturne (`daily-indie-harvest.yml`), zéro avertissement d'audit et intégrité totale du déploiement continu.
78. **Système de Tchat Communautaire, Canaux Multilingues, Espace Feedback & Messagerie de Duel (100% Déployé) :**
    - Messagerie instantanée en direct avec modération automatique, rate-limiting souverain OVH (`public/api/chat.php`), persistance atomique `LOCK_EX` et effets sonores Web Audio discrets.
    - Salons mondiaux et multilingues (Global, 🇫🇷 FR, 🇬🇧 EN, 🇪🇸 ES, 🇩🇪 DE, 🇯🇵 JA, 🇧🇷 PT-BR) avec bascule réactive.
    - Espace "Retours & Feedback" avec 5 catégories (Suggestion, Signalement, Idée de Pépite, Coup de Cœur, Avis Général).
    - Tchat de duel 1v1 Versus et barre d'émotes/réactions synchronisées. Tiroir rétractable `ChatDrawer.tsx` avec badge de non-lus.
79. **Connexion Directe du Leaderboard au Profil de Compte & Synchronisation Globale des Scores (100% Déployé) :**
    - Le profil de joueur affiché dans le leaderboard est désormais directement synchronisé avec le compte utilisateur (`profile.username` et `profile.avatarId`).
    - Pour le créateur Quentin Beaud, le pseudonyme officiel **Hibouxe** et l'avatar exclusif du fondateur sont fièrement préservés avec un badge d'honneur `👑 Créateur` sur toutes ses performances.
    - Lors de tout changement de pseudo ou d'avatar dans l'application, l'ensemble des scores enregistrés par le joueur dans tous les jeux (Arcade, Time Attack, Quiz) sont instantanément mis à jour en masse sur le serveur via l'action `update_player_profile` de `leaderboard.php` et en local.
    - Correction de la règle d'assainissement de `leaderboard.php` : seuls les tiers non autorisés usurpant "hibouxe" ou "edsaje" sont anonymisés, le vrai compte créateur est reconnu et valorisé.
80. **Restriction de Modification du Pseudonyme (Délai de Carence de 14 Jours) (À FAIRE) :**
    - Restreindre la possibilité pour un joueur de modifier son pseudonyme de compte à une seule fois tous les 14 jours (délai de carence / cooldown).
    - Objectifs : Stabiliser les pseudonymes sur les classements mondiaux (leaderboards), prévenir les usurpations d'identité intempestives et assainir la vie communautaire et le tchat.
    - Implémentation : Stockage du timestamp du dernier renommage (`lastUsernameChangeAt`), calcul des jours restants, décompte dynamique visible dans l'interface et verrouillage temporaire de la saisie tant que le délai n'est pas écoulé (avec exemption naturelle accordée au compte créateur / administrateur).
81. **Expansion du Roster des « Compagnons Indés » dans le Profil (23 Compagnons) (100% Déployé) :**
    - Enrichissement massif du catalogue des avatars et compagnons disponibles dans le profil joueur (`ProfileModal.tsx`, `avatars.ts`, `types/user.ts`, `leaderboard.php`, `leaderboardService.ts`).
    - Intégration de 14 nouvelles figures légendaires de la scène indépendante portant la galerie à **23 compagnons uniques** : *Shovel Knight*, *Sans* (Undertale), *Cuphead*, *Isaac* (The Binding of Isaac), *Le Pénitent* (Blasphemous), *Le Décapité* (Dead Cells), *Niko* (OneShot), *Super Meat Boy*, *Baba* (Baba Is You), *Hornet* (Silksong), *Omori*, *Claire* (A Short Hike), *Le Voyageur* (Hyper Light Drifter) et *Le Slugcat* (Rain World).
    - Chaque compagnon dispose de son icône signature, son jeu d'origine, son dégradé thématique et sa citation culte, avec synchronisation immédiate sur le Leaderboard, le système d'Amis et les Duels Versus.
82. **Utilité & Économie des Plumes d'Or (Boutique du Sanctuaire & Récolte Quotidienne) (À FAIRE) :**
    - Donner une véritable utilité ludique et gratifiante aux Plumes d'Or 🪶 gagnées par les joueurs :
      - *Récolte Quotidienne (Farm Journalier)* : Récompenser les victoires quotidiennes sur les 8 disciplines de déduction (+10 plumes par jeu complété le jour même), bonus de Grand Chelem (+25 plumes si les 8 défis sont réussis), bonus de séries consécutives (streaks) et primes de records sur l'Arcade et le Time Attack.
      - *Boutique du Sanctuaire (Dépense de Plumes)* :
        - Achat d'icônes, compagnons et avatars d'élite exclusifs (déblocables avec 50 ou 100 plumes).
        - Renommage express / Changement de pseudo anticipé : possibilité de contourner immédiatement le délai de 14 jours contre une somme de plumes d'or.
        - Titres honorifiques de profil personnalisés (*« Dénicheur de Pépites »*, *« Maître du Pixel »*, *« Mélomane du Perchoir »*...).
        - Cadres de profil cosmétiques prestigieux (Sylvestre, Doré Céleste, Néon Cyberpunk...).
        - Jokers / Indices bonus pour débloquer une situation difficile sur les mini-jeux quotidiens.
83. **Système de Boosters de Cartes à Échanger Indés (Trading Cards) (À FAIRE — Prochaine Version) :**
    - Concevoir et intégrer un système de cartes à collectionner et échanger célébrant l'ensemble des pépites indés du sanctuaire :
      - *Obtention de Boosters* : Paquets de cartes à ouvrir débloqués via les séries quotidiennes (streaks), les succès ou l'achat dans la Boutique du Sanctuaire avec les Plumes d'Or 🪶.
      - *Ouverture Interactive & Animation* : Animation immersive d'ouverture de booster avec déchirure du sachet, révélation carte par carte et effets de rareté (Commune, Rare, Épique, Légendaire / Holographique / Foil brillante).
      - *Classeur Virtuel & Collection* : Galerie et album de collectionneur dans le profil pour contempler ses cartes, le taux de complétion par jeu et le décompte des doublons.
      - *Système d'Échange (Trading Hub)* : Échange sécurisé de cartes en double avec ses compagnons (amis) ou via code d'échange bilatéral.
      - *Crafting & Badges Collector* : Forger des sets complets de cartes pour débloquer des badges de profil prestigieux, titres et cosmétiques exclusifs.
84. **Règle Primordiale : La sécurité est notre priorité sur ce site (Sanctification & Défense Active) `[🔒 INVARIANT]` :**
    - **Principe Directeur Absolu :** La sécurité est déclarée priorité numéro 1 du sanctuaire Hoot Indie Games. Toute nouvelle fonctionnalité (tchat, leaderboard, boutique, amis, mini-jeux, administration) doit être conçue et auditée avec une approche *Security by Design* et *Zero Trust*.
    - **Anti-Triche & Anti-Spoiler :** Protection réseau hermétique (zéro fuite dans le bundle, le state ou les requêtes XHR), scellement en closures privées des moteurs de jeu, intégrité cryptographique des scores soumis.
    - **Protection Serveur & Données :** Rate-limiting par IP, verrouillage atomique (`LOCK_EX`), isolation stricte `.htaccess`, hachage Bcrypt des mots de passe admin et conformité RGPD (hachage anonymisé SHA-256 des adresses IP, 0 cookie tiers).
    - **Validation & Sanitisation Continue :** Échappement systématique XSS de toutes les entrées utilisateur, validation par regex, interdiction formelle de l'injection dynamique de code.

---

## 🧭 Matrice des Chantiers Classés par Complexité (Plan d'Action Priorisé)

Pour faciliter le pilotage technique, l'ensemble des chantiers restants (**À FAIRE**) est hiérarchisé selon **4 paliers de complexité** (technique, volume de code, dépendances et tests) :

| Palier de Complexité | Type d'Intervention | Impact & Périmètre | Nb Tâches | Effort Moyen |
| :--- | :--- | :--- | :---: | :---: |
| 🟢 **Palier 1 : Faible** | Quick Wins & Ajustements Ciblés | Visuel local, CSS/Canvas, 1 fichier | 6 (100% ✅) | 15 à 30 min |
| 🟡 **Palier 2 : Moyenne** | Logique Métier & Calibrations | Backend PHP, filtres interactifs, audio Web API | 8 (100% ✅) | 45 min à 1h |
| 🟠 **Palier 3 : Élevée** | Gameplay Avancé, Tchat & Administration | Moteurs canvas, physique, messagerie, CRUD admin | 6 (100% ✅) | 1h30 à 2h30 |
| 🔴 **Palier 4 : Majeure** | Optimisation Globale & Homologation | Mémoire mobile, i18n massive, audit de certification | 4 (50% ✅) | 2h à 3h |

---

### 🟢 Palier 1 : Complexité Faible (Quick Wins & Ajustements Ciblés) — 100% DÉPLOYÉ ✅
> *Modifications rapides, circonscrites et validées avec 0 hallucination (`npm run audit-db`) et compilation réussie (`npm run build`).*

1. [x] **Retrait de « Big Sister » (« Grande sœur ») des Pépites Certifiées** `(100% Déployé)`
   - **Origine :** Directive 68.1 · Section 29.2
   - **Fichiers cibles :** [`src/data/games.ts`](file:///src/data/games.ts), [`src/data/connectionsPuzzles.ts`](file:///src/data/connectionsPuzzles.ts)
   - **Réalisé :** Fiche `grande-s-ur` retirée de `INDIE_GAMES`, fallback nettoyé, validation stricte `npm run audit-db` (186 jeux certifiés, 0 erreur).

2. [x] **Arcade Tetris : Bordures Visuelles Délimitant l'Écran de Jeu** `(100% Déployé)`
   - **Origine :** Directive 71 · Section 29.5
   - **Fichiers cibles :** [`src/components/arcade/ArcadeModal.tsx`](file:///src/components/arcade/ArcadeModal.tsx)
   - **Réalisé :** Tracé néon émeraude `#10b981` délimitant nettement la matrice de jeu 10x20 des panneaux latéraux, grille millimétrée subtile, blocs avec chanfrein/biseau rétro et HUD d'instructions sur les bordures.

3. [x] **Agrandissement de la Barre Supérieure (Navbar) pour le Slogan** `(100% Déployé)`
   - **Origine :** Directive 64 · Section 27.1
   - **Fichiers cibles :** [`src/components/common/Navbar.tsx`](file:///src/components/common/Navbar.tsx)
   - **Réalisé :** Hauteur de la barre portée à `h-16 sm:h-[72px] lg:h-[76px]`, conteneur de marque élargi (`max-w-[150px] sm:max-w-[240px] lg:max-w-[290px] 2xl:max-w-[340px]`) et interligne ajusté. Zéro débordement du slogan en français sur toutes les résolutions.

4. [x] **Correction du Bug de Sélection de Balatro dans le Blind Test** `(100% Déployé)`
   - **Origine :** Directive 69.2 · Section 29.3
   - **Fichiers cibles :** [`src/components/blindtest/BlindTestGame.tsx`](file:///src/components/blindtest/BlindTestGame.tsx), [`src/data/games.ts`](file:///src/data/games.ts)
   - **Réalisé :** Harmonisation du compositeur Louis F. et ajout du genre "Cartes". Algorithme de filtrage avec scoring préférentiel insensible aux accents, ponctuations et espaces (gérant "Louis F.", "louisf", "poker", "balatro"). Événement `onMouseDown` et sélection `Enter` renforcés pour garantir un clic sans conflit de blur.

5. [x] **Épuration des Notifications & Compteur Fixe des Amis Connectés** `(100% Déployé)`
   - **Origine :** Directive 65 · Section 27.2
   - **Fichiers cibles :** [`src/components/common/Navbar.tsx`](file:///src/components/common/Navbar.tsx), [`src/context/FriendsContext.ts`](file:///src/context/FriendsContext.ts), [`src/context/FriendsProvider.tsx`](file:///src/context/FriendsProvider.tsx)
   - **Réalisé :** Suppression définitive du clignotement `animate-pulse` intempestif. Remplacement par un compteur fixe discret `friendsOnlineCount` affiché uniquement lorsqu'au moins un ami est effectivement en ligne. Zéro fausse alerte.

6. [x] **Expansion du Roster des « Compagnons Indés » dans le Profil Joueur (23 Compagnons)** `(100% Déployé)`
   - **Origine :** Directive 81 · Section 31.3
   - **Fichiers traités :** [`src/data/avatars.ts`](file:///src/data/avatars.ts), [`src/types/user.ts`](file:///src/types/user.ts), [`src/components/common/ProfileModal.tsx`](file:///src/components/common/ProfileModal.tsx), [`public/api/leaderboard.php`](file:///public/api/leaderboard.php), [`src/services/leaderboardService.ts`](file:///src/services/leaderboardService.ts), [`src/components/common/LeaderboardModal.tsx`](file:///src/components/common/LeaderboardModal.tsx)
   - **Réalisation :**
     - Ajout de 14 nouveaux compagnons indés cultes portant la sélection à **23 compagnons certifiés** : *Shovel Knight*, *Sans* (Undertale), *Cuphead*, *Isaac* (The Binding of Isaac), *Le Pénitent* (Blasphemous), *Le Décapité* (Dead Cells), *Niko* (OneShot), *Super Meat Boy*, *Baba* (Baba Is You), *Hornet* (Silksong), *Omori*, *Claire* (A Short Hike), *Le Voyageur* (Hyper Light Drifter), *Le Slugcat* (Rain World).
     - Gradients colorés thématiques, icônes signatures et citations cultes.
     - Prise en charge intégrale dans le profil utilisateur, la grille scrollable de la modale de profil (`ProfileModal.tsx`), le tiroir du Leaderboard (`LeaderboardModal.tsx`), la whitelist de l'API (`leaderboard.php`) et la liste `AVATAR_OPTIONS`.
   - **Statut :** Déployé & Certifié ✅.

---

### 🟡 Palier 2 : Complexité Moyenne (Logique Ciblée, Algorithmes & Calibrations) — 100% DÉPLOYÉ ✅
> *Modifications nécessitant une logique métier claire, des règles d'état (React/PHP) ou des requêtes d'harmonisation.*

6. [x] **Leaderboard : Unicité des Scores par Compte (Meilleur Score Conservé)** `(100% Déployé)`
   - **Origine :** Directive 70 · Section 29.4
   - **Fichiers traités :** [`public/api/leaderboard.php`](file:///public/api/leaderboard.php), [`src/services/leaderboardService.ts`](file:///src/services/leaderboardService.ts)
   - **Réalisation :** 
     - Backend PHP : déduplication automatique des classements mondiaux, extraction sécurisée de l'`accountId` et du pseudo normalisé.
     - Règle d'or : conservation stricte du record personnel maximal (`score > existingScore`), sans rétrogradation ni doublon si une partie ultérieure produit un score inférieur.
     - Frontend TypeScript : transmission de l'identifiant de compte unique (SteamID / compte cloud / identifiant persistant local `hoot_device_account_id`) et déduplication équivalente dans le mode fallback hors-ligne.
   - **Statut :** Déployé & Certifié ✅.

7. [x] **Affichage & Synchronisation des Prix Manquants (Steam & Itch.io) et Gestion des Soldes** `(100% Déployé)`
   - **Origine :** Directive 67 · Section 29.1
   - **Fichiers traités :** [`src/data/steamStoreData.ts`](file:///src/data/steamStoreData.ts), [`src/components/gems/GemExplorerHome.tsx`](file:///src/components/gems/GemExplorerHome.tsx), [`src/components/steam/SteamCatalogExplorer.tsx`](file:///src/components/steam/SteamCatalogExplorer.tsx)
   - **Réalisation :**
     - Intégration des 6 pépites Steam manquantes avec données Valve certifiées réelles (prix en centimes, promotions actives, avis totaux et taux de positivité) : *BuGarden* (-20%), *Video Game Menu: The Game* (-10%), *Eagle Knight Paradox* (-10%), *Our Life: Beginnings & Always* (Gratuit), *A Date with Death* (Gratuit), *Owlboy* (19,50 €). Couverture Steam : 183/183 (100%).
     - Traitement explicite et élégant des pépites Itch.io / Web libres (*Celeste Classic PICO-8*, *Adventures With Anxiety!*, *Blooming Panic*) avec pilule émeraude `Gratuit / Prix libre`, prise en compte dans le filtre de prix `Gratuit` et intégration dans la modale d'aperçu.
     - Affichage complet des soldes : badge rouge/vert `-XX%` vibrant, prix initial barré et prix final remisé sur les cartes et dans les modales.
   - **Statut :** Déployé & Certifié ✅.

8. [x] **Mode Classic (Indledle) : Option de Recherche Adaptative aux Indices Déduits** `(100% Déployé)`
   - **Origine :** Directive 62 · Section 26.1
   - **Fichiers cibles :** [`src/components/indledle/IndledleGame.tsx`](file:///src/components/indledle/IndledleGame.tsx), [`src/components/common/GameSearchBar.tsx`](file:///src/components/common/GameSearchBar.tsx)
   - **Réalisation :**
     - Bascule intuitive `[Mode Adaptatif : Activé / Mode Puriste : Défi libre]` intégrée directement au-dessus de la saisie dès le premier essai.
     - Mode Adaptatif : autocomplétion restreinte dynamiquement aux jeux compatibles avec les indices confirmés (année, caméra, style graphique, genres exclus) avec affichage du compteur en direct `🎯 X jeux possibles`.
     - Mode Puriste : autocomplétion libre sur l'ensemble du catalogue des 187 jeux pour les puristes qui préfèrent déduire sans assistance algorithmique.
     - Persistance de la préférence dans `localStorage` (`indledle_adaptive_clues`).
   - **Statut :** Déployé & Certifié ✅.

9. [x] **Sélecteur de Difficulté dans les 8 Jeux d'Arcade** `(100% Déployé)`
   - **Origine :** Directive 72 · Section 29.6
   - **Fichiers cibles :** [`src/components/arcade/ArcadeModal.tsx`](file:///src/components/arcade/ArcadeModal.tsx)
   - **Réalisation :**
     - Sélecteur de difficulté 3 niveaux (🌿 **Détente**, ⚡ **Normal**, 💀 **Expert**) intégré sous la barre de score et dans l'écran de Game Over.
     - Calibration sur mesure des 8 bornes :
       - *Snake* : cadence 145ms (détente), 115ms (normal), 85ms (expert).
       - *Pong* : vélocité de balle (3.2 / 4.4 / 5.6), vitesse et réactivité de l'IA (zone morte 18px / 14px / 8px).
       - *Breakout* : raquette (95px / 80px / 65px) et vitesse de balle (-3.5 / -4.2 / -5.0).
       - *Flappy Hibou* : vitesse des tuyaux (1.5 / 1.85 / 2.3), ouverture (145px / 132px / 118px) et cadence d'apparition.
       - *Space Invaders* : vies de départ (5 / 3 / 2), fréquence des bombes et cadence de marche alien.
       - *Course Sylvestre* : vitesse initiale (2.8 / 3.5 / 4.3) et espacement des obstacles.
       - *Tetris* : vitesse de chute des tétraminos (850ms / 650ms / 450ms).
       - *Vectrex* : vies et hyperdrives (5 / 3 / 2) et vélocité des mines spatiales (x0.75 / x1.0 / x1.3).
     - Multiplicateurs de score transparents : x0.8 (Détente), x1.0 (Normal), x1.5 (Expert).
     - Persistance du réglage dans `localStorage` (`hoot_arcade_difficulty`).
   - **Statut :** Déployé & Certifié ✅.

10. [x] **Enrichissement de la Banque Musicale du Blind Test (20 OSTs Cultes Indés)** `(100% Déployé)`
    - **Origine :** Directive 69.1 · Section 29.3
    - **Fichiers cibles :** [`src/data/blindtestPuzzles.ts`](file:///src/data/blindtestPuzzles.ts)
    - **Réalisation :**
      - Ajout de 5 thèmes musicaux cultes indés entièrement réécrits pour la synthèse Web Audio (18-20 secondes chacun) :
        1. *Fez* — "Continuum" (Disasterpeace, synth, 90 BPM)
        2. *Katana Zero* — "Sneaky Driver" (LudoWic & Bill Kiley, synth, 126 BPM)
        3. *The Binding of Isaac: Rebirth* — "Sacrificial" (Ridiculon, piano, 94 BPM)
        4. *Hyper Light Drifter* — "Vignette: Panacea" (Disasterpeace, synth, 82 BPM)
        5. *Terraria* — "Overworld Day" (Scott Lloyd Shelly, chiptune, 128 BPM)
      - Bibliothèque portée à 20 OSTs d'élite certifiées.
    - **Statut :** Déployé & Certifié ✅.

10.bis. [x] **Leaderboard : Profil Joueur Directement Lié au Compte & Synchronisation Globale des Renommages** `(100% Déployé)`
    - **Origine :** Directive 79 · Section 31.1
    - **Fichiers traités :** [`public/api/leaderboard.php`](file:///public/api/leaderboard.php), [`src/services/leaderboardService.ts`](file:///src/services/leaderboardService.ts), [`src/context/UserAccountProvider.tsx`](file:///src/context/UserAccountProvider.tsx), [`src/components/common/LeaderboardModal.tsx`](file:///src/components/common/LeaderboardModal.tsx)
    - **Réalisation :**
      - Connexion directe de la modale de classement au profil du compte (`profile.username` et `profile.avatarId`).
      - Mise à jour en cascade côté serveur (`update_player_profile`) et local de l'ensemble des scores passés du joueur lors de tout changement de pseudo ou d'avatar.
      - Protection du pseudo officiel `Hibouxe` et attribution fière du badge `👑 Créateur` pour Quentin Beaud (admin/fondateur).
    - **Statut :** Déployé & Certifié ✅.

10.ter. [x] **Restriction de Modification du Pseudonyme (Délai de Carence de 14 Jours)** `(100% Déployé)`
    - **Origine :** Directive 80 · Section 31.2
    - **Fichiers cibles :** [`src/context/UserAccountProvider.tsx`](file:///src/context/UserAccountProvider.tsx), [`src/context/UserAccountContext.ts`](file:///src/context/UserAccountContext.ts), [`src/utils/featherEconomy.ts`](file:///src/utils/featherEconomy.ts), [`src/components/common/ProfileModal.tsx`](file:///src/components/common/ProfileModal.tsx)
    - **Réalisation :**
      - Mémorisation du timestamp exact du dernier renommage (`lastUsernameChangeAt`) dans le profil utilisateur et persistance atomique `localStorage`.
      - Délai de carence strict de 14 jours (14 x 86400s) avec calcul en temps réel du nombre de jours restants et de la date exacte autorisée (`JJ/MM/AAAA`).
      - Affichage d'un badge de verrouillage `🔒 Verrouillé (Xj)` dans la modale de profil et désactivation du bouton d'édition.
      - Passerelle d'exemption permanente et inconditionnelle pour Quentin Beaud / Hibouxe (`ADMIN_STEAM_ID`, rôle admin, pseudonymes officiels).
      - Intégration du bouton direct « Renommage Express (25 🪶) » pour contourner immédiatement le délai en dépensant des Plumes d'Or.
    - **Statut :** Déployé & Certifié ✅.

10.quater. [x] **Utilité & Économie des Plumes d'Or (Farm Journalier & Boutique du Sanctuaire)** `(100% Déployé)`
    - **Origine :** Directive 82 · Section 32
    - **Fichiers cibles :** [`src/utils/featherEconomy.ts`](file:///src/utils/featherEconomy.ts), [`src/context/AchievementsContext.ts`](file:///src/context/AchievementsContext.ts), [`src/context/AchievementsProvider.tsx`](file:///src/context/AchievementsProvider.tsx), [`src/context/UserAccountProvider.tsx`](file:///src/context/UserAccountProvider.tsx), [`src/components/shop/FeatherShopModal.tsx`](file:///src/components/shop/FeatherShopModal.tsx), [`src/components/common/Navbar.tsx`](file:///src/components/common/Navbar.tsx), [`src/components/common/ProfileModal.tsx`](file:///src/components/common/ProfileModal.tsx), [`src/App.tsx`](file:///src/App.tsx), [`public/api/leaderboard.php`](file:///public/api/leaderboard.php)
    - **Réalisation :**
      - **Moteur de Récolte Quotidienne (Daily Farm)** : +10 plumes d'or à la première victoire de la journée sur chacun des 8 mini-jeux quotidiens (*Screenle, Indledle, Linkle, Profille, Chrono, Pixel, Review, Blind Test*).
      - **Bonus Grand Chelem** : +25 plumes supplémentaires si l'intégralité des 8 défis du jour sont remportés. Notification festive animée toast (Web Audio) en haut d'écran.
      - **Solde Dynamique Spendable** : Agrégation en temps réel des récompenses de succès + bonus journaliers moissonnés - dépenses boutique (`getFeathersBalance`).
      - **Boutique du Sanctuaire (`FeatherShopModal.tsx`)** :
        - *Renommage Express (25 🪶)* : Annulation instantanée du cooldown de 14 jours.
        - *4 Avatars de Prestige (50-75 🪶)* : Sylvestre Doré, Chevalier Céleste, Hornet Tisserande d'Or, Spectre Rétro 8-Bit.
        - *5 Titres Honorifiques (15-50 🪶)* : Dénicheur de Pépites, Maître du Pixel, Mélomane du Perchoir, Explorateur des Cimes, Grand-Duc Sylvestre.
        - *4 Cadres Cosmétiques (0-50 🪶)* : Écorce Sylvestre, Liseré Doré Céleste, Néon Synthwave, Émeraude Profonde.
      - Navigation & Intégration : Entrée dédiée dans le Hub Joueur de la Navbar, bouton direct dans la modale de profil, support du lien profond `#shop` / `#boutique`.
    - **Statut :** Déployé & Certifié ✅.

---

### 🟠 Palier 3 : Complexité Élevée (Gameplay Avancé, Physique & Administration Temps Réel) — 100% DÉPLOYÉ ✅
> *Modifications structurelles touchant les moteurs de rendu canvas, la physique, la génération procédurale ou l'administration sécurisée.*

11. [x] **Mode Profille : Système de Rotation Dynamique des Catégories Quotidiennes** `(100% Déployé)`
    - **Origine :** Directive 63 · Section 26.2
    - **Fichiers cibles :** [`src/components/profille/ProfilleGame.tsx`](file:///src/components/profille/ProfilleGame.tsx), [`src/utils/profilleCategories.ts`](file:///src/utils/profilleCategories.ts), [`src/data/games.ts`](file:///src/data/games.ts)
    - **Réalisation :** Tirage aléatoire déterministe chaque jour de 3 catégories parmi 6 (Compositeur, Style Artistique, Caméra, Année, Studio, Genres) avec adaptation de l'interface, compatibilité 100% rétrocompatible et persistance locale.
    - **Statut :** Déployé & Certifié ✅.

12. [x] **Évolution de Course Sylvestre : Mécanique de Se Baisser & Parcours 100% Franchissable** `(100% Déployé)`
    - **Origine :** Directive 73 · Section 29.7
    - **Fichiers cibles :** [`src/components/arcade/ArcadeModal.tsx`](file:///src/components/arcade/ArcadeModal.tsx), [`src/utils/gamepad.ts`](file:///src/utils/gamepad.ts), [`src/data/arcadeGames.ts`](file:///src/data/arcadeGames.ts)
    - **Réalisation :** Implémentation complète de la glissade / se baisser (touche Bas, S, touches B/X manette ou bouton tactile dédié `GLISSER`), hitbox réduite dynamique, particules de dérapage de feuilles, chute rapide en l'air, nouveaux obstacles aériens (branches basses avec chauve-souris `🦇`) et algorithme procédural déterministe avec zone tampon garantissant un parcours 100% franchissable.
    - **Statut :** Déployé & Certifié ✅.

13. [x] **Évolution du Casse-Briques (Breakout) : Niveaux Multiples & Système de Bonus (Power-Ups)** `(100% Déployé)`
    - **Origine :** Directive 74 · Section 29.8
    - **Fichiers cibles :** [`src/components/arcade/ArcadeModal.tsx`](file:///src/components/arcade/ArcadeModal.tsx)
    - **Réalisation :** 5 niveaux d'architecture thématiques uniques (*Bosquet Sylvestre, Pyramides Jumelles, Vol du Grand-Duc, Remparts Antiques, Trône Astral*), briques renforcées (2 PV avec fissures dynamiques), capsules de power-ups animées (+1 Vie, Raquette Large, Multibille triple, Laser rafale, Ralentisseur de balle) avec barres de durée et son FX.
    - **Statut :** Déployé & Certifié ✅.

14. [x] **Gestion des Jeux en Temps Réel pour le Compte Admin (CRUD Souverain)** `(100% Déployé)`
    - **Origine :** Directive 68.2 · Section 29.2
    - **Fichiers cibles :** [`src/components/admin/AdminDashboardModal.tsx`](file:///src/components/admin/AdminDashboardModal.tsx), [`src/components/admin/AdminGamesManager.tsx`](file:///src/components/admin/AdminGamesManager.tsx), [`public/api/admin_games.php`](file:///public/api/admin_games.php)
    - **Réalisation :** Backend souverain avec persistance atomique `LOCK_EX` dans `public/api/games_override.json` et protection stricte par `ADMIN_STEAM_ID` (`76561198035270542`), interface complète d'ajout/modification/masquage/restauration de jeux dans le tableau de bord d'administration avec prévisualisation immédiate et fusion réactive dans le catalogue.
    - **Statut :** Déployé & Certifié ✅.

15. [x] **Optimisation Performance des Jeux d'Arcade (Zéro Lag / 60 FPS Constants)** `(100% Déployé)`
    - **Origine :** Directive 75 · Section 29.9
    - **Fichiers cibles :** [`src/components/arcade/ArcadeModal.tsx`](file:///src/components/arcade/ArcadeModal.tsx)
    - **Réalisation :** Boucle d'animation `startFixedLoop` calibrée à 60 FPS constants avec support de l'API Visibility (`document.hidden`), arrêt de l'accumulation de retard lors du changement d'onglet et limitation stricte du delta temporel (max 120ms anti-lag spike) ; élimination intégrale des allocations de tableaux (`isKeyDown` avec constantes statiques `KEY_CODES_UP`, `DOWN`, `LEFT`, `RIGHT`, `JUMP`, `START_ALL`) ; suppression des `.filter()` répétitifs par frame dans Breakout et Space Invaders (remplacés par des compteurs et boucles indexées) ; suppression des interpolations de chaînes et regex `.replace()` par tracé dans Course Sylvestre (remplacés par `ctx.globalAlpha`) ; suppression du `shadowBlur` lourd dans le rendu des débris vectoriels de Mine Storm Vectrex ; plafonnement du nombre de particules (max 35-50) évitant l'explosion mémoire et les micro-gels du Garbage Collector.
    - **Statut :** Déployé & Certifié ✅.

16. [x] **Système de Tchat Communautaire, Salons Multilingues, Espace Feedback & Messagerie de Duel (Le Perchoir & Versus)** `(100% Déployé)`
    - **Origine :** Directive 78 · Section 30
    - **Fichiers cibles :** [`src/components/chat/ChatDrawer.tsx`](file:///src/components/chat/ChatDrawer.tsx), [`src/context/ChatContext.tsx`](file:///src/context/ChatContext.tsx), [`src/context/ChatProvider.tsx`](file:///src/context/ChatProvider.tsx), [`src/services/chatService.ts`](file:///src/services/chatService.ts), [`public/api/chat.php`](file:///public/api/chat.php), [`src/components/versus/VersusArena.tsx`](file:///src/components/versus/VersusArena.tsx), [`src/components/common/Navbar.tsx`](file:///src/components/common/Navbar.tsx), [`src/components/friends/FriendsModal.tsx`](file:///src/components/friends/FriendsModal.tsx), [`src/components/roost/TheRoostHub.tsx`](file:///src/components/roost/TheRoostHub.tsx)
    - **Réalisation :** Backend souverain OVH (`public/api/chat.php`) avec rate-limiting IP, modération anti-spam/anti-XSS, protection stricte du badge créateur `👑 Créateur` pour Quentin Beaud (`76561198035270542`), et persistance atomique `chat_messages.json` sous `LOCK_EX`. Salons multilingues mondiaux (`global`, `fr`, `en`, `es`, `de`, `ja`, `pt-BR`) avec sélecteur réactif intégré. Espace dédié "Retours & Feedback" avec 5 catégories de retours (💡 Suggestion, 🐛 Signalement, ✨ Idée de Pépite, ❤️ Coup de Cœur, 💬 Avis Général) pour améliorer le sanctuaire avec l'aide des joueurs. Système de duel 1v1 avec bulles de tchat flottantes et barre d'émotes/réactions rapides synchronisées via WebRTC/relais souverain OVH. Tiroir rétractable `ChatDrawer.tsx` avec barre d'emojis, sons discrets Web Audio, raccourcis clavier, gestion intelligente du rafraîchissement d'onglet (`document.hidden`), et intégrations directes sur la Navbar (badge de messages non lus animé), le Hub Joueur, le menu Compagnons et Le Perchoir.
    - **Statut :** Déployé & Certifié ✅.

---

### 🔴 Palier 4 : Complexité Majeure (Optimisation Globale, Internationalisation Résiduelle & Homologation Finale)
> *Chantiers transversaux touchant l'ensemble de l'application, les performances mobiles, la sécurité et la certification finale.*

17. [x] **Optimisation Mobile Globale du Site (Fluidité, Mémoire & Zéro Ralentissement)** `(100% Déployé)`
    - **Origine :** Directive 76 · Section 29.10
    - **Fichiers traités :** [`src/index.css`](file:///src/index.css), [`src/components/gems/GemExplorerHome.tsx`](file:///src/components/gems/GemExplorerHome.tsx), [`src/components/steam/SteamCatalogExplorer.tsx`](file:///src/components/steam/SteamCatalogExplorer.tsx), [`src/components/microindies/MicroIndieHub.tsx`](file:///src/components/microindies/MicroIndieHub.tsx), [`src/components/chat/ChatDrawer.tsx`](file:///src/components/chat/ChatDrawer.tsx), [`src/components/linkle/LinkleGame.tsx`](file:///src/components/linkle/LinkleGame.tsx), [`src/components/screenle/ScreenleGame.tsx`](file:///src/components/screenle/ScreenleGame.tsx), [`src/components/common/GameSearchBar.tsx`](file:///src/components/common/GameSearchBar.tsx), modales du site
    - **Réalisation :** Déploiement de `content-visibility: auto` et `contain-intrinsic-size: auto none auto 280px` (`.deferred-card`) sur les catalogues lourds ; priorité LCP `fetchPriority="high"` et décodage asynchrone `decoding="async"` ; cibles tactiles confortables ($\ge 40\text{px}-44\text{px}$) et suppression de latence `touch-action: manipulation` ; blocage du zoom Safari iOS via `font-size: 16px !important` sur les inputs ; safe areas iOS `env(safe-area-inset-bottom)` sur le tchat et hauteurs `100dvh` ; refonte de la grille Linkle en 4 colonnes compactes permettant d'afficher l'intégralité des 16 tuiles en un seul écran sans défilement sur smartphone.
    - **Statut :** Déployé & Certifié ✅.

18. [x] **Traduction Intégrale Résiduelle (Quiz, Fiches de Jeux, Succès en ES, DE, JA, PT-BR)** `(100% Déployé)`
    - **Origine :** Section 13.2 à 13.6 · Directive 47
    - **Fichiers cibles :** [`src/data/quizQuestions.ts`](file:///src/data/quizQuestions.ts), [`src/data/achievements.ts`](file:///src/data/achievements.ts), [`src/data/upcomingGames.ts`](file:///src/data/upcomingGames.ts), [`src/data/roostProjects.ts`](file:///src/data/roostProjects.ts), [`src/data/connectionsPuzzles.ts`](file:///src/data/connectionsPuzzles.ts), [`src/data/reviewPuzzles.ts`](file:///src/data/reviewPuzzles.ts), dictionnaires i18n
    - **Réalisation :** Parité 100% des 891 clés UI sur les 6 langues ; traduction intégrale des 76 questions du quiz indé, des 20 critiques Steam caviardées, des 46 règles Linkle, des 9 fiches radar et des 6 projets du Perchoir ; succès déblocables 100% multilingues ; éradication absolue des contrôles binaires FR/EN résiduels.
    - **Statut :** Déployé & Certifié ✅.

19. **Modèle Économique Éthique (Dons / Partenariats) & SEO Final**
    - **Origine :** Section 18 · Section 19
    - **Fichiers cibles :** Footer, `RoostSection.tsx`, `public/sitemap.xml`, balises OpenGraph
    - **Contenu :** Module discret de dons éthiques sans paywall, mise à jour du sitemap et des cartes de partage social 1.0.
    - **Estimation :** 1h30 · **Risque :** Très faible.

20. **Grand Audit Final d'Homologation Globale (Cybersécurité, Performance, Mises à Jour Automatiques)**
    - **Origine :** Directive 77 · Section 29.11
    - **Fichiers cibles :** Ensemble du dépôt, CI/CD GitHub Actions (`deploy-ovh.yml`, `daily-indie-harvest.yml`)
    - **Contenu :** Audit exhaustif de cybersécurité (en-têtes HTTP, XSS, CSRF, sanitisation), score Lighthouse 100/100, tests complets des workflows automatiques nocturnes et validation zéro avertissement.
    - **Estimation :** 2h - 2h30 · **Risque :** Faible (audit de contrôle).

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
  - Synchronisation multijoueur temps réel via le relais serveur souverain OVHcloud (`public/api/versus_room.php`) garantissant zéro popup de permission réseau local dans les navigateurs, compatibilité totale VPN/mobile et allégement du bundle JS de 85 Ko.
- [x] **Synchronisation multijoueur complète** ([`src/components/versus/VersusArena.tsx`](file:///src/components/versus/VersusArena.tsx)) :
  - L'hôte génère un code de salon partageable (ex: `HOOT-842` / lien direct `#versus=HOOT-842`).
  - L'invité rejoint le salon : handshake automatique, échange des profils (avatar, pseudo, ELO).
  - L'hôte synchronise le compte à rebours 3-2-1, diffuse l'ID du jeu et le chrono.
  - En direct : affichage des propositions manquées de l'adversaire (avec notification de pénalité de 3 secondes), détection immédiate de la bonne réponse, score en direct et célébration de victoire (best of 3).
- [x] **Labellisation honnête du mode solo** :
  - Mode solo clairement intitulé *"🦉 Entraînement Solo contre le Grand-Duc (Chrono IA)"* pour s'entraîner sans ambiguïté face à l'ordinateur.

---

### 🌿 3. Direction Artistique "Nature Sylvestre & Organique"
- [x] **Ambiance forêt nocturne globale & fond obscurci** :
  - Fond d'ambiance ([`src/components/common/FirefliesBackground.tsx`](file:///src/components/common/FirefliesBackground.tsx)) enrichi avec silhouettes vectorielles de canopée, brume forestière et mélange de lucioles dorées (60%) et spores bioluminescentes vert émeraude (40%).
  - Palette nocturne et fond du site rendu plus "nuit" (`#03150f` / `#06241b`) en éliminant les teintes bleutées ou ardoise déconnectées de la DA.
- [x] **Harmonisation des cadres et bordures couleur bois noble** :
  - Standardisation de toutes les cartes, modales et sections avec des bordures bois (`border-2 border-[#78350f]`), cadres d'écorce et feuillages d'angle délicats ([`src/components/sylvestre/SylvestreIvyFrame.tsx`](file:///src/components/sylvestre/SylvestreIvyFrame.tsx)).
  - Harmonisation complète des banderoles d'en-tête (Mini-jeux, Arcade, Le Perchoir, Pépites) respectant rigoureusement la palette bois et émeraude.
- [x] **Logo officiel HD & Avatar créateur exclusif** :
  - Intégration du logo officiel officiel sans texte (`/logo.png`) en haute définition pour la Navbar, le footer et le favicon.
  - Avatar créateur `hibouxe_creator` verrouillé avec cadenas pour la communauté et strictement réservé au créateur (SteamID 76561198035270542).
- [x] **Végétalisation & Identité du Perchoir (Portfolio)** :
  - Le Perchoir transformé en "Le Nichoir Sylvestre" ([`src/components/roost/TheRoostHub.tsx`](file:///src/components/roost/TheRoostHub.tsx)) : ambiance refuge des bois, badges botaniques, bordures bois et émeraude, compétences axées sur le game design poétique et organique.

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
- [x] **Ancrage Réel du Perchoir & Remplacement des Photos de Stock par de Vraies Images (100% Déployé)** :
  - **Élimination totale des images de stock Unsplash** au profit de visuels et captures authentiques HD stockés localement dans [`public/roost/`](file:///public/roost/).
  - **Organisation en 2 rangées de 3 créations majeures de Quentin Beaud** :
    1. **Chaîne YouTube @Hibouxe** : analyses narratives, storytelling et philosophie du jeu indé avec redirection vers `https://www.youtube.com/hibouxe`.
    2. **Donjon de Naheulbeuk 2.0 (Fan Game)** : prototype RPG tactique au tour par tour (C# / Godot, pathfinding A*, FOV) et sprites pixel-art réels avec redirection vers `https://github.com/Edsaje/Donjon_de_Naheulbeuk_Fan_Game`.
    3. **Portfolio Quentin Beaud** : capture HD authentique de `https://quentinbeaud.com/` (CV interactif, compétences Fullstack et philosophie de dev).
    4. **Fan-Traduction FR : Dragon Quest Torneko** : capture in-game du patch FR v1.2.0 IoStore Unreal Engine avec liens directs vers le guide officiel Steam (`3798729607`) et le dépôt GitHub.
    5. **La Salle d'Arcade du Sanctuaire** : 8 jeux rétro cultes et émulateur Vectrex 1982 avec action **"Jouer direct"** instantanée.
    6. **Les 8 Défis Quotidiens (Mini-Jeux)** : Capture, Classic, Connexions, Profil, Chrono, Pixel, Critique, Blind Test avec action **"Jouer direct"** basculant sur le hub des mini-jeux.

---

### 🎮 8. Système de Suggestions Steam & Renommage des Modes
- [x] **Système de Suggestion de Jeu Steam ("Suggérer un jeu")** :
  - Remplacement du faux import direct par une interface de contribution communautaire dans [`src/components/steam/SteamCatalogExplorer.tsx`](file:///src/components/steam/SteamCatalogExplorer.tsx).
  - Backend PHP sécurisé [`public/api/suggest_game.php`](file:///public/api/suggest_game.php) avec rate-limiting, assainissement XSS, détection des doublons et écriture atomique dans `public/api/suggestions.json`.
  - Panneau d'administration intégré dans le tableau de bord de [`public/api/track.php`](file:///public/api/track.php) pour examiner, consulter et valider les suggestions de la communauté.
- [x] **Résolution du Bug d'Analyse Steam ("NetworkError when attempting to fetch resource") lors de la suggestion d'un jeu indé (100% Déployé)** :
  - **Origine** : Les requêtes directes côté client `fetch('https://store.steampowered.com/api/appdetails?appids=...&l=...')` dans [`SteamCatalogExplorer.tsx`](file:///src/components/steam/SteamCatalogExplorer.tsx) étaient rejetées par la politique de sécurité CORS des navigateurs modernes, produisant l'erreur visible *"Échec de l'analyse : NetworkError when attempting to fetch resource."*
  - **Action réalisée** : Implémentation de l'action `lookup` côté serveur dans [`public/api/suggest_game.php`](file:///public/api/suggest_game.php) relayant la requête cURL vers l'API Valve sans restriction de domaine, et adaptation de `handleImportGame` dans [`SteamCatalogExplorer.tsx`](file:///src/components/steam/SteamCatalogExplorer.tsx) avec cascade résiliente et gestion gracieuse des erreurs.
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
- [x] **Balises Sociales & Assets Graphiques Dédiés (Refonte Complète Prévisualisation Partage)** :
  - Bannière OpenGraph officielle ultra-HD ([`public/og-banner.png`](file:///public/og-banner.png) & [`public/og-banner.svg`](file:///public/og-banner.svg), 1200x630) modernisée aux standards du sanctuaire :
    - Intégration du logo officiel Hibouxe (emblème hibou turquoise/cyan à dégradé nocturne, 150x150) avec halo bioluminescent.
    - Mise à jour des 4 piliers majeurs : **147 Pépites** (Catalogue Steam), **8 Défis du Jour** (Screenle, Blind Test, Classic...), **Arène 1v1 P2P** (Duels WebRTC) et **Salle d'Arcade** (8 jeux cultes & Vectrex 1982).
    - Icônes vectorielles nettes SVG, typographie contrastée et cadre sanctuaire or/ambre.
    - Script dédié reproductible [`scripts/generateOgBanner.ts`](file:///scripts/generateOgBanner.ts) (`npm run generate-og`) utilisant Chromium headless pour un rendu 1200x630 parfait.
    - Versioning cache-buster `?v=2` dans [`index.html`](file:///index.html) et [`scripts/generateSeoIndex.ts`](file:///scripts/generateSeoIndex.ts) pour forcer le rafraîchissement immédiat du cache des CDN Discord, Twitter/X, WhatsApp et Facebook.
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
- [x] **Système d'Amis & Fonctionnalités Sociales (100% Déployé)** :
  - **Code Joueur Unique (`HOOT-XXXX`)** : Format souverain pérenne avec code fondateur réservé `HOOT-HIBOU` pour le créateur, copie en 1-clic et deep-linking direct `#friend=HOOT-XXXX`.
  - **API REST Souveraine (`public/api/friends.php`)** : Verrouillage atomique (`LOCK_EX`), rate-limiting, recherche par code ou pseudonyme, synchronisation sans spoiler et découverte automatique des amis Steam connectés.
  - **Cercle des Compagnons (`src/components/friends/FriendsModal.tsx`)** : Interface sylvestre soignée avec grille de progression des 8 disciplines quotidiennes (Screenle, Indledle, Linkle, Profille, Chrono, Pixel, Review, Blind Test), pastilles d'état anti-spoil (aucun titre secret divulgué) et série de flammes consécutives.
  - **Système de Favoris (Étoile dorée ⭐)** : Possibilité d'épingler ses compagnons favoris via un bouton étoile réactif avec persistance locale (`hoot_favorite_friends_v1`), mise en avant dorée sur la carte, badge de décompte dans l'en-tête et tri prioritaire automatique en tête de liste.
  - **Défis & Duels 1v1 Directs** : Bouton d'invitation instantané générant une salle Versus privée sur relais souverain avec lien d'invitation partageable.
  - **Intégration Globale** : Bouton d'accès rapide et badge dynamique dans la Navbar, carte Code Ami dans le profil joueur (`ProfileModal.tsx`), et prise en charge des URL hash.
- [x] **Agrandissement de la Base de Données de Jeux (Atteint : 147 Pépites d'Or Certifiées & 192 Jeux au Catalogue)** :
  - Intégration de nouvelles pépites cultes et plébiscitées par les joueurs (*Signalis*, *Inscryption*, *Braid*, *FEZ*, *Katana ZERO*, *Hyper Light Drifter*, *Slay the Princess*, *Dredge*, *Chained Echoes*, *Cocoon*, *Lethal Company*, *Manor Lords*, *The Witness*, *Loop Hero*, etc.).
- [x] **Réévaluation de l'Idée de Difficulté des Jeux (100% Déployé)** :
  - Étude du retour d'expérience sur les modes de difficulté : le défi quotidien reste universel et équitable pour tous (garantissant l'intégrité des streaks et des partages), avec déploiement d'une bascule d'indices adaptatifs optionnelle sur Classic (Directive 62) et d'un sélecteur de difficulté 3 niveaux sur l'Arcade (Directive 72).
- [x] **Gestion du Calendrier & Préservation de la Flamme de Série (J et J-1)** :
  - **Restriction stricte du calendrier** : Accès limité au jour courant (J) et à la veille (J-1) pour préserver la série, verrouillage complet des jours antérieurs (`< J-1`) et futurs.
  - **Sauvegarde et rattrapage de flamme** : Possibilité de compléter le défi de la veille pour reconnecter et restaurer sa série ininterrompue.
  - **Bannière d'alerte en fin de partie** : Avertissement clair en cas de fin de série suite à un oubli d'un jour avec bouton interactif `[⚡ Rattraper le jeu d'hier (Veille)]`.
- [x] **Tri Avancé des Jeux Steam (Prix, Promotions, Évaluations, etc.)** :
  - Intégration dans l'Explorateur de Pépites (`GemExplorerHome.tsx`) et le Catalogue Steam (`SteamCatalogExplorer.tsx`) :
    - **Tri multi-critères** : Plus récents 📅, Classiques du jeu indé ⏳, Meilleures réductions en solde 🔥, Prix croissant (Petits budgets) 💸, Prix décroissant 💎, Meilleures évaluations (% avis) ⭐, Nombre d'avis (Popularité) 👥, Tri alphabétique (A-Z, Z-A).
    - **Filtres de prix & soldes** : Gratuits / Free-to-play 🆓, En promotion / Soldes Steam 🏷️, Moins de 10 € 💸, Moins de 20 € 💳, 20 € et plus 💎.
    - **Filtres d'évaluations Steam** : Extrêmement positifs (≥ 95%) 🌟, Très positifs (≥ 85%) ⭐, Positifs (≥ 80%) 👍.
    - **Pilules de filtrage 1-clic & Réinitialisation** : 5 badges dynamiques + bouton de reset complet avec compteur de filtres actifs.
    - **Base de données certifiée Valve** : Moissonnage automatisé pour les 147 pépites (`src/data/steamStoreData.ts` & `scripts/syncSteamStoreData.ts`) avec affichage des prix réels, réductions `-XX%`, notes et volume d'avis sur chaque carte.
- [x] **Audit & Verrouillage Anti-Triche DevTools (F12) sur TOUS nos Jeux (100% Déployé)** :
  - **1. Mini-Jeux Quotidiens de Déduction** :
    - *Screenle* : Élimination absolue de la fuite de titre dans l'onglet Réseau (remplacement du titre en clair par un identifiant de session opaque `session_YYYY-MM-DD` dans [`ScreenleGame.tsx`](file:///src/components/screenle/ScreenleGame.tsx)). Attributs `alt` génériques (`Screenle Indice X`).
    - *Indledle* : Élimination de la fuite de titre au chargement du jeu dans la télémétrie Réseau (`session_YYYY-MM-DD` dans [`IndledleGame.tsx`](file:///src/components/indledle/IndledleGame.tsx)). Réponses et indices scellés dans des closures d'état React.
    - *Linkle* : Métadonnées des catégories secrètes et difficulté non divulguées dans le DOM ou les tuiles d'images avant résolution.
    - *Profille* : Année, studio et genres masqués du DOM tant que les tentatives ne sont pas épuisées ou le défi remporté.
  - **2. Modes Compétitifs & Chronométrés** :
    - *Leaderboard Backend & Plafonds Physiques* ([`public/api/leaderboard.php`](file:///public/api/leaderboard.php)) : Plafonds maximaux réalistes stricts par jeu (Snake: 5000, Flappy: 500, Tetris: 300000, Time Attack: 35000, Quiz: 10/150/500). Rejet HTTP 400 de tout score dépassant la limite autorisée.
    - *Signature Cryptographique HMAC/SHA-256* ([`src/utils/securityAntiCheat.ts`](file:///src/utils/securityAntiCheat.ts)) : Validation de signature horodatée (< 300s) avec sel serveur secret interdisant toute forge de score par script console ou cURL.
    - *Versus 1v1 Relais Souverain* : Neutralisation des collisions concurrentes et sécurisation de la validation.
  - **3. Salle d'Arcade (8 Bornes Rétro)** :
    - Encapsulation hermétique de toutes les boucles de jeu et variables de score dans des fermetures (closures) privées sans attachement à `window`.
    - Sanitisation des records locaux dans [`LeaderboardModal.tsx`](file:///src/components/common/LeaderboardModal.tsx) avec vérification de plausibilité (`isScorePlausible`).
  - **4. Dissuasion Active DevTools** :
    - Module centralisé [`src/utils/securityAntiCheat.ts`](file:///src/utils/securityAntiCheat.ts) initialisé au boot ([`src/main.tsx`](file:///src/main.tsx)).
    - Bannière d'accueil et d'avertissement bienveillant du Hibou Sylvestre affichée dès l'ouverture de la console.
    - Détecteur d'ouverture DevTools discret et neutralisation des propriétés sensibles globales.
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
- [x] **Mise à Jour Time Attack & Versus avec les Nouveaux Jeux (100% Déployé)** :
  - [x] **Extension Time Attack (Nouveau Sprint Profil)** :
    - Ajout de la 4e discipline *Sprint Profil* dans [`src/components/timeattack/ProfilleSprint.tsx`](file:///src/components/timeattack/ProfilleSprint.tsx) : deviner express l'année de sortie, le studio de développement ou les genres d'un jeu culte avec raccourcis clavier 1 à 4 et captures Steam officielles.
    - Intégration complète dans le sélecteur du Hub Time Attack ([`src/components/timeattack/TimeAttackHub.tsx`](file:///src/components/timeattack/TimeAttackHub.tsx)) avec 4 cartes réactives, 5 compteurs de records, support deep-link `#timeattack=profille`, scoring combo (+100 pts x combo, bonus +3s, malus -5s) et modale de partage.
  - [x] **Extension de l'Arène Versus 1v1 (Suite Complète des 8 Jeux & Mode Décathlon Indé)** :
    - Intégration des épreuves Profille (développeur, année de sortie, genre), Pixel Canvas dynamique, Blind Test Web Audio, Critique Steam caviardée, Chronologie et indices progressifs dans les manches de duel en direct WebRTC P2P.
    - Variantes de match configurables par l'hôte : Sélecteur de discipline dédiée pour chacun des 8 mini-jeux OU Mode Décathlon Indé (Tournoi Mixte alternant les épreuves à chaque manche).
- [x] **Correction Critique de Bug Versus (Reset Inopiné en Cours de Partie lors de Clics Simultanés) (100% Déployé)** :
  - **Symptôme résolu** : Fin des réinitialisations brutales au lobby ou des doubles sauts de manches lorsque 2 joueurs cliquaient sur la bonne réponse en même temps ou presque.
  - **Correctifs déployés** :
    - 1. **Annulation stricte des timers concurrents** : Stockage du timer de 2800ms dans `roundTransitionTimerRef` et annulation systématique dans `clearAllTimers()` avant tout nouveau round, empêchant le dédoublement d'exécution de `advanceRoundP2P`.
    - 2. **Verrou d'arbitrage de manche (`roundResolvedRef`)** : Dès qu'un joueur ou un timeout résout la manche, celle-ci est scellée. En cas de collision milliseconde, l'Hôte fait autorité souveraine et ignore tout `round_won` redondant adverse.
    - 3. **Écriture atomique POSIX & Retry serveur** ([`public/api/versus_room.php`](file:///public/api/versus_room.php)) : Remplacement de `ftruncate` par un fichier temporaire avec `rename()` atomique et retry en lecture (3 tentatives).
    - 4. **Tolérance aux micro-latences réseau** ([`src/components/versus/VersusArena.tsx`](file:///src/components/versus/VersusArena.tsx)) : Seuil de 3 confirmations consécutives requis avant de considérer un salon fermé (`roomClosed`), éliminant tout faux débranchement intempestif.
- [x] **Système de Leaderboard (Classement en Ligne) & Graphique de Répartition Communautaire** :
  - **Leaderboard Global Souverain (Arcade, Time Attack & Quiz)** ([`src/components/common/LeaderboardModal.tsx`](file:///src/components/common/LeaderboardModal.tsx), [`public/api/leaderboard.php`](file:///public/api/leaderboard.php)) :
    - API PHP sécurisée avec rate limiting (30 req/min/IP), assainissement XSS strict (`strip_tags`, `htmlspecialchars`), liste blanche stricte des catégories et persistence atomique des Top 100 dans `leaderboard_data.json` avec verrou `LOCK_EX`.
    - Double filtrage temporel par période : 🌍 **Global (Tous les temps)** et 📅 **Quotidien (Aujourd'hui)**.
    - Classement des 8 bornes Arcade (*Snake*, *Flappy Hibou*, *Course Sylvestre*, *Pong*, *Breakout*, *Tetris*, *Space Invaders*, *Mine Storm*).
    - Classement des 8 sprints Time Attack (*Screenle*, *Indledle*, *Linkle*, *Profille*, *Chrono*, *Pixel*, *Review*, *Blind Test*).
    - Classement des 3 modes Quiz Indé (*Standard 10 Q.*, *Survie 3 Vies*, *Entraînement Infini*).
    - Podium Top 3 médaillé (Or, Argent, Bronze), affichage du rang personnel du joueur avec bannière festive animée, choix d'avatars hiboux exclusifs et personnalisation du pseudo avec publication en 1 clic des records locaux.
    - Passerelles d'accès intégrées dans la barre de navigation principale (icône Trophée), dans l'en-tête de la Salle d'Arcade, sur l'écran de Game Over de chaque borne d'arcade, sur l'écran de Game Over des 8 sprints Time Attack, et sur l'écran de Game Over du Quiz Indé.
  - **Graphique de Répartition des Essais Communautaire (Daily Attempt Distribution)** ([`src/components/common/AttemptDistributionChart.tsx`](file:///src/components/common/AttemptDistributionChart.tsx), [`public/api/community_stats.php`](file:///public/api/community_stats.php)) :
    - Graphique en barres horizontales animées affiché immédiatement après la fin de chaque partie (victoire ou défaite) sur les 4 défis quotidiens (*Screenle*, *Indledle*, *Linkle*, *Profille*).
    - Calcul en temps réel de la moyenne d'essais de la communauté (ex: `🎯 Moyenne : 3.4 essais`), du total de joueurs du jour, et de l'insight de centile personnalisé (*"Vous avez fait mieux que X% des joueurs aujourd'hui !"*).
    - Mise en relief de la ligne du joueur avec dégradé lumineux ambré, anneau et badge `"VOUS / YOU"`.
    - Modèle adaptatif selon le jeu : 1 à 6 essais + Échec pour Screenle & Indledle, 4 à 7 tentatives pour Linkle, 3/3 à 0/3 étoiles pour Profille.
    - Générateur de courbe de base réaliste déterministe par date pour garantir un affichage instantané et équilibré même en début de journée ou hors-ligne.
- [x] **Amélioration & Optimisation de Track.php (Analytics & Admin) (100% Déployé)** :
  - **Cybersécurité & Verrouillage Transactionnel Exclusif** ([`public/api/track.php`](file:///public/api/track.php)) :
    - Élimination des race conditions sous trafic simultané grâce au verrouillage transactionnel exclusif `flock($fp, LOCK_EX)` sur [`public/api/stats.json`](file:///public/api/stats.json) dès l'ouverture du flux (`fopen('c+')`), empêchant toute perte de hit ou écrasement concurrent.
    - Hachage IP compacté à 16 caractères et rotation automatique avec purge glissante des hashs antérieurs à J-1, plafonnement des événements récents à 40 logs légers, garantissant un fichier `stats.json` stabilisé sous 50 Ko.
  - **Télémétrie Intégrale des 12 Modes & Disciplines** ([`public/api/track.php`](file:///public/api/track.php), [`src/components/admin/AdminDashboardModal.tsx`](file:///src/components/admin/AdminDashboardModal.tsx)) :
    - Prise en charge exhaustive des 8 défis quotidiens (*Screenle*, *Indledle*, *Linkle*, *Profille*, *Chrono*, *Pixel*, *Review*, *Blind Test*) + *Time Attack*, *Quiz Indé*, *Versus Arena 1v1* et *Salle d'Arcade* (8 bornes).
    - Suivi granulaire des parties lancées, victoires, taux de complétion et visualisations par jauges de progression colorées.
  - **Indicateurs de Rétention, Fidélité & Séries (Cookieless)** :
    - Mesure de rétention anonymisée (visiteurs récurrents J vs J-1, taux de fidélité en %, moyenne de jeux lancés par visiteur unique, taux de victoire global).
    - Suivi en temps réel des rattrapages de flamme de veille (`streak_rescue_yesterday`) pour évaluer l'attachement aux séries quotidiennes.
  - **Exports Souverains Autonomes Directs (CSV & JSON)** :
    - Endpoints d'exportation certifiés avec entête BOM UTF-8 pour Excel : Rapport Quotidien (`type=daily`), Statistiques des 12 Jeux (`type=games`) et Journal d'Événements (`type=recent`).
    - Sauvegarde intégrale du serveur téléchargeable en un clic au format JSON (`action=export_json`).
  - **Dashboard React & Console Dédiée Épurés (Zéro Émoji)** :
    - Menu déroulant "Exports Souverains" dans l'en-tête de la modale React et module d'export dans l'onglet Système.
    - Barre de recherche textuelle instantanée et 5 filtres par catégorie (*Tous*, *Parties*, *Victoires*, *Pages*, *Flammes*) sur le journal d'événements récents.
    - Refonte visuelle vectorielle intégrale avec composants Lucide dédiés (suppression complète des émojis du dashboard).
- [x] **Amélioration Continue de la Version Mobile du Site (Mobile-First UX) (100% Déployé)** :
  - Audit d'ergonomie et de réactivité sur l'ensemble des formats mobiles (360px à 430px : iPhone, Android, petits écrans).
  - Optimisation des espacements et paddings pour maximiser la zone de jeu sans scroll intempestif (`pb-36 sm:pb-48`).
  - Cibles tactiles confortables au pouce (au moins 44x44px) sur tous les boutons d'action, filtres et claviers virtuels.
  - Contrôle strict du zéro débordement horizontal sur l'ensemble des onglets (*Pépites*, *Mini-jeux*, *Arcade*, *Boîte à Outils*, *Le Perchoir*).
  - Menu déroulant intelligent bidirectionnel (`GameSearchBar.tsx`) s'ouvrant vers le haut (`dropup`) si l'espace inférieur est restreint.
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
  - **Perspective Caméra, ArtStyle & Métadonnées Certifiées** :
    - *Megabonk* : corrigé en "Troisième personne" (Third-Person), "3D Rétro Low-poly" (Retro Low-poly 3D), compositeur Miguelangell960, genres `["Action", "Roguelike", "Bullet Hell"]`.
    - *Emberward* : corrigé en "Isométrique / 2.5D", "3D Stylisée" (Stylized 3D), année 2024, compositeur Refic Games, genres `["Stratégie", "Roguelike", "Puzzle"]`.
    - *Kernel Hearts* : corrigé en "Troisième personne" (Third-Person), "3D Stylisée" (Stylized 3D), compositeur Patterns, genres `["Action", "RPG", "Roguelike", "Co-op"]`.
    - *BOMBANANA!* : corrigé en "Troisième personne" (Third-Person), "3D Stylisée" (Stylized 3D), compositeur Lefto Studio, genres `["Puzzle", "Comédie", "Co-op"]`.
    - *OpenFront* : corrigé en "Monochrome / Minimaliste" (Monochrome), compositeur Evan Pellegrini.
    - *How to Fish* : "Première personne" (First-Person), compositeur Dazed Games.
    - *Palworld* : année de sortie corrigée à 2024.
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
- [x] **Émancipation du Quiz Indé (Mini-Jeu Autonome & Banque Massive de 76 Questions Aléatoires)** :
  - **Retrait de la Boîte à Outils** : `ToolboxHub` recentré sur les utilitaires purs (Roulette, Backlog, Budget, Pépites, Radar 2025-2026, Sync Steam).
  - **Banque Massive de 76 Questions Aléatoires** dans [`src/data/quizQuestions.ts`](file:///src/data/quizQuestions.ts) bilingues (FR/EN) sur 6 catégories (Lore, OST, Gameplay, Créateurs, Trivia, Sorties), rigoureusement vérifiées et enrichies d'explications et d'anecdotes historiques.
  - **Composant Dédié [`src/components/quiz/IndieQuizGame.tsx`](file:///src/components/quiz/IndieQuizGame.tsx)** :
    - 3 modes de jeu : *Standard (10 Questions)*, *Survie (3 Vies - Mort Subite)*, *Infini (Entraînement)*.
    - Mélange aléatoire dynamique (Fisher-Yates) à chaque partie + permutation des 4 options pour une imprévisibilité totale.
    - Filtre thématique interactif (Mix aléatoire, Lore, Musiques, Gameplay, Créateurs, Trivia).
    - Ergonomie clavier (touches 1, 2, 3, 4 et Espace/Entrée).
    - Système de combo, streak, high score local, et carte de partage emoji HD.
  - **Navigation & Écosystème** :
    - Intégré dans [`MiniGamesNav.tsx`](file:///src/components/minigames/MiniGamesNav.tsx) (compteur mis à jour à 11 mini-jeux) et [`MiniGamesHub.tsx`](file:///src/components/minigames/MiniGamesHub.tsx).
    - Support deep-link direct `#quiz` dans [`src/App.tsx`](file:///src/App.tsx).
    - Normalisation des identifiants dans [`reviewPuzzles.ts`](file:///src/data/reviewPuzzles.ts) et [`blindtestPuzzles.ts`](file:///src/data/blindtestPuzzles.ts) pour un couplage 100% parfait avec le catalogue de 147 jeux.
- [x] **Privilèges Administrateur Steam (SteamID 76561198035270542), Verrouillage OpenID de Track.php & Unicité des Pseudos** :
  - **Élévation Administrateur Officielle** :
    - Détection automatique et permanente du Steam ID créateur `76561198035270542` dans [`UserAccountProvider.tsx`](file:///src/context/UserAccountProvider.tsx) et [`UserAccountContext.ts`](file:///src/context/UserAccountContext.ts).
    - Attribution des drapeaux `role = 'admin'` et `isAdmin = true` avec badge royal 👑 dans la Navbar et le profil joueur.
  - **Sécurisation Valve Steam OpenID de `/api/track.php` (Suppression Totale des Mots de Passe)** :
    - Éradication complète de l'ancien système de mot de passe (`.admin_pass`) et des formulaires d'accès.
    - Implémentation du protocole d'authentification Valve Steam OpenID 2.0 cryptographique.
    - Contrôle strict : seul le compte Steam vérifié avec le SteamID `76561198035270542` est autorisé à déverrouiller le tableau de bord (rejet 403 Forbidden immédiat pour tout autre compte).
    - Raccourci direct d'accès Analytics dans la [`Navbar.tsx`](file:///src/components/common/Navbar.tsx) et dans [`ProfileModal.tsx`](file:///src/components/common/ProfileModal.tsx).
  - **Interdiction Stricte des Pseudonymes "Hibouxe" et "Edsaje"** :
    - Normalisation anti-contournement (casse, accents, espaces, tirets) bloquant toute tentative d'usurpation des pseudos du créateur sur l'ensemble du site et des classements.
    - Réservation exclusive accordée au compte administrateur officiel.
  - **Système d'Unicité Globale des Pseudonymes Souverain** :
    - Création du backend souverain [`public/api/usernames.php`](file:///public/api/usernames.php) avec stockage atomique `LOCK_EX` dans `registered_usernames.json` (hermétiquement protégé par `.htaccess`).
    - Actions `check` (disponibilité temps réel) et `claim` (attribution unique par joueur).
    - Utilitaires frontend [`src/utils/usernameValidation.ts`](file:///src/utils/usernameValidation.ts) intégrés dans [`ProfileModal.tsx`](file:///src/components/common/ProfileModal.tsx) et [`LeaderboardModal.tsx`](file:///src/components/common/LeaderboardModal.tsx) avec retour utilisateur clair.


---

### 💡 12. Idées & Améliorations Futures
- [x] **Share Card personnalisée** (export d'image et grille emoji pour Twitter, Facebook, WhatsApp, Instagram).
- [x] **Support Manette (Gamepad API W3C)** pour naviguer et jouer dans la Salle d'Arcade (100% Déployé) :
  - **Détection & Identification Automatique** ([`src/utils/gamepad.ts`](file:///src/utils/gamepad.ts)) : Prise en charge native des manettes Xbox, PlayStation (DualSense / DualShock), Nintendo Switch (Pro Controller / Joy-Con), 8BitDo et sticks d'arcade rétro, avec filtrage de zone morte analogique (deadzone = 0.35) et identification conviviale du modèle.
  - **Navigation Fluide dans la Salle d'Arcade** ([`src/components/arcade/ArcadeHallView.tsx`](file:///src/components/arcade/ArcadeHallView.tsx)) : Déplacement au D-Pad / Stick analogique entre les 8 bornes d'arcade avec surbrillance dynamique ambrée, bouton A / Start pour lancer la borne sélectionnée, X / Y pour insérer une pièce au hasard, Select pour afficher les classements mondiaux, et badge visuel animé dans l'en-tête.
  - **Gameplay & Ergonomie Dédiée** ([`src/components/arcade/ArcadeModal.tsx`](file:///src/components/arcade/ArcadeModal.tsx)) : Jouabilité 60 FPS sur les 8 mini-jeux d'arcade (*Snake, Pong, Breakout, Flappy Hibou, Space Invaders, Course Sylvestre, Tetris, Mine Storm Vectrex*), auto-repeat DAS pour Tetris et les menus, gâchettes LB / RB pour zapper d'une borne à l'autre sans fermer la modale, bouton A / Start pour rejouer instantanément sur l'écran Game Over, et HUD manette contextuel temps réel adaptatif.
- [x] **Filtre par Nationalité / "Indés Francophones" (Écarté par Décision d'Architecture Globale)** :
  - Choix de conception validé : le site étant désormais une plateforme internationale souveraine disponible en 6 langues officielles (FR, EN, ES, DE, JA, PT-BR), un filtre par pays ou communauté linguistique spécifique créerait un biais restrictif et une complexité disproportionnée pour les équipes de développement indépendantes décentralisées à travers le monde. Le catalogue privilégie l'exploration universelle par genres, styles artistiques, ambiances, prix et plateformes (Steam & Itch.io).
- [x] **Mode Blind Test Audio Indé** (reconnaître un jeu à sa musique culte — Synthétiseur Web Audio 100% hors-ligne & visualiseur spectral).
- [x] **Équilibrage des Mini-Jeux Arcade & Niveaux de Difficulté (100% Déployé)** :
  - **Revue de la courbe de difficulté** : Déploiement du sélecteur 3 niveaux (Détente / Normal / Expert) sous la barre de score avec coefficients multiplicateurs proportionnels (x0.8 / x1.0 / x1.5).
  - **Calibrage de Pong Magique** : IA adverse rééquilibrée avec temps de réaction réaliste, zone morte adaptative (18px / 14px / 8px) et tolérance aux tirs brossés et trajectoires angulaires.

---

### 🚀 13. Prochaines Étapes Avant Lancement Public (DA, Mobile, Marketing & Expérience Steam)

- [x] **Refonte Finale de la Direction Artistique (DA) — Ambiance Nuit Sylvestre & Bordures Bois (100% Déployé)** :
  - **Identité Visuelle Sylvestre & Sanctuaire de Nuit** :
    - Fond assombri (`#03150f` / `#06241b`), suppression totale des fonds génériques bleus/gris.
    - Bordures bois noble standardisées (`border-2 border-[#78350f]`) avec cadres d'écorce et feuillages d'angle (`SylvestreIvyFrame`).
    - Harmonisation complète des banderoles d'en-tête (Hub mini-jeux, Arcade, Perchoir, Pépites).
    - Intégration du logo officiel HD et avatar exclusif créateur verrouillé pour les tiers.
    - Refonte de la barre de recherche (`GameSearchBar.tsx`) aux couleurs de la DA.
    - Détection intelligente de direction (`dropup` / `dropdown`) et padding de confort bas de page (`pb-36 sm:pb-48`).

- [x] **Audit Critique de la Direction Artistique (DA) : Les Plus & Les Moins (Visuel, Pratique, Ergonomie, Mobile) (Terminé)** :
  - **1. Analyse Visuelle & Ambiance** :
    - *Forces (+)* : Signature visuelle unique et mémorable (forêt nocturne, lucioles, bois et or) qui tranche avec les designs austères ou génériques. Forte incarnation thématique via Sylvestre le Hibou.
    - *Axes d'attention (-)* : Éviter l'effet de surcharge sur les composants riches ; s'assurer que les nuances de vert sombre restent subtiles et ne s'entrechoquent pas selon les écrans OLED vs LCD.
  - **2. Pratique & Ergonomie UI/UX** :
    - *Forces (+)* : Hiérarchie claire avec les boutons d'action ambrés dorés (`#f59e0b`) qui guident l'œil. Détection intelligente de direction (`dropup` / `dropdown`) pour l'autocomplétion.
    - *Axes d'attention (-)* : Contrôle des contrastes de petits textes gris/ardoise sur fond vert sombre (accessibilité WCAG AA). Vérifier que les boutons secondaires bois conservent une affordance évidente au clic.
  - **3. Expérience Mobile-First & Responsive** :
    - *Forces (+)* : Header calé sans débordement, cibles tactiles larges, padding de respiration bas de page pour le confort des pouces.
    - *Axes d'attention (-)* : Encombrement des bordures et ornements de lianes sur petits formats (écrans 360px) pour préserver un ratio de contenu utile maximal.
  - **4. Plan d'Ajustements & Recommandations** :
    - Synthétiser les points forts et prioriser les micro-ajustements sans dénaturer la poésie du sanctuaire.

- [x] **Ancrage Réel du Perchoir (Vraies Informations & Vraies Images de Quentin Beaud) (100% Déployé)** :
  - **Élimination du Stock Unsplash** : Remplacement de l'ensemble des photos d'illustration Unsplash dans `TheRoostHub.tsx` et `roostProjects.ts` par les visuels réels HD stockés dans `public/roost/`.
  - **6 Fiches de Créations Concrètes (2 rangées de 3)** :
    - 1. *Chaîne YouTube @Hibouxe* (`https://www.youtube.com/hibouxe`) : analyses de fond, secrets de lore et game design.
    - 2. *Donjon de Naheulbeuk 2.0 (Fan Game)* (`https://github.com/Edsaje/Donjon_de_Naheulbeuk_Fan_Game`) : RPG tactique tour par tour (C# / Godot) et sprites originaux.
    - 3. *Portfolio Quentin Beaud* (`https://quentinbeaud.com/`) : parcours ingénieur fullstack et réalisations.
    - 4. *Fan-Traduction Dragon Quest Torneko* : patch FR v1.2.0 IoStore avec guide officiel Steam et GitHub.
    - 5. *La Salle d'Arcade* : bouton "Jouer direct" pour lancer instantanément les 8 bornes d'arcade.
    - 6. *Les 8 Défis Quotidiens* : bouton "Jouer direct" pour basculer directement sur le hub des mini-jeux du site.

- [x] **Option pour Masquer les Jeux Steam Déjà Possédés (100% Déployé)** :
  - **Toggle / Filtre Dédié** :
    - Ajouter une case à cocher / interrupteur rapide *"Cacher mes jeux possédés"* dans la barre de filtres du Catalogue Steam (`SteamCatalogExplorer.tsx`) et de l'Explorateur de Pépites (`GemExplorerHome.tsx`).
    - Visible et activable dès que l'utilisateur est connecté à Steam (ou a synchronisé sa bibliothèque).
    - Persistance du choix dans les préférences locales (`localStorage`) pour une expérience fluide d'une visite à l'autre.
  - **Valorisation de la Découverte** :
    - Compteur dynamique affichant le nombre de pépites restant à découvrir (ex: *"185 pépites inconnues dans votre bibliothèque"*).
    - Raccourci direct vers les soldes Steam pour les jeux non possédés.

- [x] **Dynamisation Automatique des Chiffres de la Bannière Catalogue (100% Déployé)** :
  - **Bannière d'en-tête du Catalogue Étendu (`SteamCatalogExplorer.tsx`)** :
    - Lier les textes explicatifs et compteurs aux variables d'état réactives (`stats.steamCatalogCount`, `stats.totalGames`, `allPlayableGames.length`).
    - Remplacer toute mention textuelle figée par une interpolation dynamique (ex: `Explorez notre répertoire de {stats.totalGames} jeux indépendants...`).
  - **Bannière Découverte de l'onglet Pépites (`GemExplorerHome.tsx`)** :
    - Lier également la pastille et le texte de redirection vers le catalogue avec le nombre exact de jeux calculé en temps réel.

- [x] **Perfectionnement Ergonomique de la Version Mobile (Règle Mobile-First) (100% Déployé)** :
  - **Audit Format Smartphone (360px - 430px)** :
    - Vérification systématique sur écrans étroits : Navbar à 6 onglets (scroll fluide et pastilles compactes), Hub des mini-jeux, grilles du catalogue.
    - Cibles tactiles d'au moins 44x44px pour un confort de jeu au pouce sans fausse manipulation.
    - Raccourcissement des espacements verticaux pour rendre le contenu immédiatement accessible sans scroll excessif.
    - Adaptation des modales et fenêtres de jeu avec fermeture aisée à une main (`max-h-[92vh] overflow-y-auto`).
    - Zéro débordement horizontal (`overflow-x: hidden`) rigoureusement garanti sur tous les navigateurs mobiles (iOS Safari, Android Chrome).

- [x] **Kit Marketing & Outbound (Streamers, LinkedIn, Réseaux Sociaux) (100% Déployé)** :
  - **Messages d'Approche pour Streamers Twitch & Créateurs YouTube** :
    - Rédaction de templates de messages personnalisés, courts et percutants (pitch en 3 lignes, angle "défi du jour en début/fin de live", proposition de duel 1v1 avec leur chat).
    - Ciblage des créateurs friands de jeux indés et de devinettes quotidiennes (formats type Wordle/Framed/Gamedle).
  - **Publications d'Annonce LinkedIn** :
    - Post d'annonce orienté tech, craft et entrepreneuriat créatif : genèse du projet par Quentin Beaud (@Hibouxe), choix d'architecture souveraine (WebRTC P2P sans latence, Web Audio API procédural, PHP atomique, React 19).
    - Mise en avant des apprentissages et du portfolio.
  - **Posts Réseaux Sociaux (Twitter/X, Reddit, Discord, TikTok/Shorts)** :
    - R/indiegames et r/webgames : présentation sincère axée sur la communauté et la mise en lumière de pépites méconnues.
    - Formats courts vidéo (TikTok / YouTube Shorts / Reels) montrant un extrait de gameplay Screenle ou Blind Test en 15 secondes.
  - **Guide & Modèles Complets** : Consulter le kit complet prêt à l'emploi dans [`MARKETING_AND_OUTREACH.md`](file:///MARKETING_AND_OUTREACH.md).

- [x] **Audit de la Gestion des Utilisateurs & Visibilité dans l'Admin (100% Déployé)** :
  - **Diagnostic du Cas "Compte ami non visible" Résolu** :
    - Vérification et confirmation des flux d'enregistrement : toute inscription (qu'elle soit Email Supabase via `signUpWithEmail`, authentification Steam OpenID ou modification directe de pseudo via `setUsername`) déclenche immédiatement la réservation atomique souveraine via `public/api/usernames.php` (`claim`).
    - L'effet de synchronisation automatique dans [`src/context/UserAccountProvider.tsx`](file:///src/context/UserAccountProvider.tsx) garantit que toute identité locale personnalisée ou compte ami est immédiatement et durablement persisté dans [`public/api/registered_usernames.json`](file:///public/api/registered_usernames.json).
  - **Panneau Admin Consolidé & Gestion Complète** ([`src/components/admin/AdminDashboardModal.tsx`](file:///src/components/admin/AdminDashboardModal.tsx), [`public/api/track.php`](file:///public/api/track.php)) :
    - Liste complète consolidée : pseudos réservés, identifiants Steam liés, date d'inscription (`claimedAt`), dernière visite (`lastSeenAt`), rôle (`admin`, `vip`, `user`) et statut (`active`, `banned`).
    - Actions administratives souveraines : modification en direct des pseudonymes, rôles et notes privées, bannissement/réactivation en 1 clic, purge définitive des scores frauduleux sur le Leaderboard, réservation manuelle de pseudo et gestion dynamique de la blacklist des termes interdits.
    - Élimination intégrale des émojis du panneau de modération au profit d'icônes vectorielles Lucide précises.

- [x] **Internationalisation Étendue : Ajout de Nouvelles Langues pour le Sanctuaire (100% Déployé)** :
  - **1. Sélection des 6 langues officielles du Sanctuaire** :
    - 🇫🇷 **Français (`fr`)** : Langue historique du créateur et du sanctuaire.
    - 🇬🇧 **Anglais (`en`)** : Langue internationale par défaut.
    - 🇪🇸 **Espagnol (`es`)** : Immense communauté hispanophone amatrice de pépites indés.
    - 🇩🇪 **Allemand (`de`)** : Très forte part de marché PC & indépendants en Europe.
    - 🇯🇵 **Japonais (`ja`)** : Passionnés de rogue-lite, pixel art, deckbuilders et metroidvanias indés.
    - 🇧🇷 **Portugais brésilien (`pt-BR`)** : Communauté gaming et créative très engagée sur Steam.
  - **2. Architecture i18n & Dictionnaires Exhaustifs** :
    - Création des 6 dictionnaires de traduction synchronisés dans [`src/i18n/locales/`](file:///src/i18n/locales/) (`fr.json`, `en.json`, `es.json`, `de.json`, `ja.json`, `pt-BR.json`).
    - Enregistrement des 6 langues dans [`src/i18n/index.ts`](file:///src/i18n/index.ts) avec détection automatique de la langue du navigateur et persistance locale (`hoot_lang`).
    - Menu déroulant élégant, tactile et compact dans la barre de navigation ([`Navbar.tsx`](file:///src/components/common/Navbar.tsx)) affichant les drapeaux (🇫🇷, 🇬🇧, 🇪🇸, 🇩🇪, 🇯🇵, 🇧🇷), abréviations, labels natifs, avec fermeture automatique au clic extérieur et ergonomie Mobile-First.
  - **3. Localisation Universelle des Métadonnées & Jeux** :
    - Extension de [`LocalizedText`](file:///src/types/game.ts) avec support multilingue et création du module centralisé [`src/utils/localization.ts`](file:///src/utils/localization.ts).
    - Dictionnaires multilingues universels traduisant l'ensemble des 53 genres indés, des 5 perspectives de caméra et des 6 styles visuels avec chaînes de repli garanties sans erreur ni `undefined`.
    - Traduction dynamique des mini-jeux, du footer et des détails des fiches de jeux.

- [x] **Mise à Jour Complète des Outils de la Boîte à Outils (`ToolboxHub.tsx`) (100% Déployé)** :
  - **1. Roulette à Pépites (Indie Mood Picker)** :
    - Remplacer les listes de jeux codées en dur par un filtrage dynamique puisant dans l'ensemble des 147 pépites certifiées du sanctuaire.
    - Élargir les ambiances de jeu : *Cozy & Détente*, *Action Frénétique*, *Cérébral & Réflexion*, *Sombre & Angoissant*, *Aventure Narrative*, *Défi Hardcore*.
    - Affichage de la durée de vie estimée, tags traduits, capture d'écran nette et bouton direct vers Steam.
  - **2. Estimateur de Backlog & Calendrier d'Achèvement** :
    - Connecter l'outil à la base complète des 147 jeux avec recherche instantanée et filtres par durée (< 10h, 10-30h, 30h+).
    - Permettre la sélection multiple fluide avec calcul en temps réel du volume total d'heures (données moyennes vérifiées style HowLongToBeat).
    - Calcul du calendrier prévisionnel selon le temps de jeu quotidien (slider 0.5h à 8h/j) et mémorisation locale (`localStorage`).
  - **3. Optimiseur de Budget Soldes (Steam Sales Optimizer)** :
    - Réactualiser le panier de jeux avec des prix de référence et réductions représentatives des soldes Steam actuelles.
    - Optimiser l'algorithme du sac à dos (Knapsack) pour maximiser le ratio score d'évaluation / prix / heures de jeu pour un budget défini par le joueur (de 5€ à 150€).
    - Ventilation claire du montant dépensé, du reste et du total d'heures de gameplay obtenues.
  - **4. Radar des Sorties Indés (2025-2026) (`upcomingGames.ts`)** :
    - Actualiser les fiches des jeux indés très attendus (Hollow Knight: Silksong, Haunted Chocolatier, Crowsworn, Mina the Hollower, Judas, etc.).
    - Mettre à jour les statuts de développement, fenêtres de sortie révisées, démos Steam disponibles et plateformes cibles.
    - Localisation complète des descriptions et points forts dans les 6 langues officielles.
  - **5. Explorateur de Pépites Cachées & Respect Mobile-First** :
    - Harmoniser le filtrage par genre avec `getTranslatedGenre` et recherche multi-critères réactive.
    - Intégrer l'internationalisation totale des labels et boutons via les dictionnaires `t('toolbox.*')`.
    - Garantir une ergonomie mobile parfaite (cibles tactiles $\ge 44\times 44\text{ px}$, absence de débordement horizontal).

- [x] **Traduction Intégrale du Site dans Toutes les Langues Disponibles (100% Déployé)** :
  - [x] **1. Éradication des Contrôles Binaires (`isFr` / `startsWith('fr') ? 'fr' : 'en'`) (100% Déployé sur les 8 Jeux Quotidiens, le Time Attack, Versus, Arcade et la Navbar)** :
    - Remplacement de 100% des ternaires FR/EN résiduels par des appels `t()` ou par `getLocalizedText()` / `getBilingualText()` dans l'ensemble des 30+ composants de jeu, modales, bandeaux, hubs et les 8 épreuves du Time Attack (`TimeAttackHub`, `ScreenleSprint`, `IndledleSprint`, `LinkleSprint`, `ProfilleSprint`, `ChronoSprint`, `PixelSprint`, `ReviewSprint`, `BlindTestSprint`).
    - Audit ripgrep certifié : 0 occurrence de `isFr` dans les composants (uniquement présent sur les propriétés de données Steam `storeData.isFree`).
    - Uniformisation via `getAppLanguage(i18n.language)` et support dynamique sans faille des 6 langues officielles (FR, EN, ES, DE, JA, PT-BR).
  - [x] **2. Traduction des Questions du Quiz Indé (`quizQuestions.ts`) (100% Déployé)** :
    - Localisation intégrale des 76 questions culturelles indés, des options de réponses et des explications historiques dans les 6 langues officielles (🇫🇷 FR, 🇬🇧 EN, 🇪🇸 ES, 🇩🇪 DE, 🇯🇵 JA, 🇧🇷 PT-BR).
    - Rigueur zéro hallucination certifiée sur les anecdotes et crédits de développement.
  - [x] **3. Traduction des Métadonnées & Genres Universels (`localization.ts` & `games.ts`) (100% Déployé)** :
    - 65 genres indés canoniques, perspectives de caméra et styles artistiques traduits intégralement dans les 6 langues dans `localization.ts` avec chaîne de repli garantie (`target -> en -> fr -> ''`).
  - [x] **4. Succès, Plumes d'Or & Textes Narratifs (`achievements.ts`) (100% Déployé)** :
    - L'ensemble des succès déblocables (titres évocateurs, descriptions poétiques et objectifs) sont 100% traduits dans les 6 langues officielles.
  - [x] **5. Énigmes Thématiques Linkle & Critiques Caviardées (`connectionsPuzzles.ts` & `reviewPuzzles.ts`) (100% Déployé)** :
    - Typage `CategoryRule.label` en `LocalizedText` et traduction des 46 règles d'association et intitulés des énigmes Linkle en 6 langues.
    - Traduction intégrale des 20 critiques Steam authentiques et de leurs caviardages `████` dans les 6 langues pour une immersion native.
  - [x] **6. Fiches du Radar de Sorties & Projets du Perchoir (`upcomingGames.ts` & `roostProjects.ts`) (100% Déployé)** :
    - Traduction des synthèses, points forts et dates des 9 pépites à venir (`upcomingGames.ts`) ainsi que des présentations des 6 projets réels du Perchoir (`roostProjects.ts`) en 6 langues.
  - [x] **7. Parité Exhaustive des Dictionnaires UI (`src/i18n/locales/`) (100% Déployé)** :
    - 891 / 891 clés synchronisées sur les 6 fichiers de traduction (`fr.json`, `en.json`, `es.json`, `de.json`, `ja.json`, `pt-BR.json`).

---

### 🌱 14. Espace Dédié aux Micro-Indés ("Le Nid des Micro-Indés" / Tremplin Participatif)
- [x] **Création de la Section Propre aux Micro-Indés sur le Site (100% Déployé)** :
  - **Espace Dédié & Distinction Éditoriale** :
    - Section propre accessible depuis la navigation principale (`#microindies` / `#itch`) et l'accueil (*"La Clairière des Micro-Indés 🌱"*).
    - Dédiée spécifiquement aux créateurs indépendants solo, aux projets Itch.io, prototypes expérimentaux, jeux de game jam et pépites Steam méconnues.
    - Séparée clairement du catalogue principal des pépites d'or pour offrir une vitrine sans concurrence déloyale.
  - **Filtres de Découverte Dédiés** :
    - Filtrage par plateforme : 🎮 **Steam**, 👾 **Itch.io 🔴**, 🌐 **Web / Jouable par navigateur**.
    - Filtrage par statut : 🆓 **Gratuits**, 🏆 **Game Jams** (Ludum Dare, GMTK, PICO-8...).
  - **Formulaire de Proposition & Soumission Communautaire** :
    - Interface de soumission ouverte aux joueurs et développeurs via `ProposeMicroIndieModal.tsx`.
    - Endpoint souverain sécurisé `public/api/micro_indies.php` avec hachage IP anonymisé, limitation de débit et assainissement XSS.
  - **Moissonnage Automatisé Itch.io** :
    - Moissonnage nocturne régulier via les flux officiels Itch.io (`top-rated.xml` et `new-and-popular.xml`) avec filtrage strict anti-NSFW dans `scripts/dailyIndieHarvest.ts`.

---

### ⚙️ 15. Automatisation CI/CD & Pipeline de Moissonnage Nocturne ("Daily Harvest")
- [x] **Résolution du Bug de Compilation TypeScript dans l'Action GitHub "Daily Harvest" (100% Déployé)** :
  - **1. Cause Racine Résolue** :
    - Écrasement nocturne de `src/data/games.ts` par `saveGamesDatabase` dans [`scripts/dailyIndieHarvest.ts`](file:///scripts/dailyIndieHarvest.ts) qui omettait l'export `getDailyProfilleGame`.
    - Erreurs TypeScript consécutives neutralisées : `error TS2305: Module '"../../data/games"' has no exported member 'getDailyProfilleGame'` et `error TS7006: Parameter 'src' / 'idx' / 'g' implicitly has an 'any' type` dans [`src/components/profille/ProfilleGame.tsx`](file:///src/components/profille/ProfilleGame.tsx#L23, #L547, #L911, #L1092).
  - **2. Stabilisation du Générateur de Données (`dailyIndieHarvest.ts`)** :
    - Intégration permanente de `getDailyProfilleGame` dans le `fileFooter` de `saveGamesDatabase` garantissant que chaque moissonnage nocturne préserve fidèlement tous les helpers de sélection de jeux quotidiens.
  - **3. Typage Blindé dans `ProfilleGame.tsx`** :
    - Typage explicite des paramètres de mapping : `(src: string, idx: number)` et `(g: string)` dans les rendus JSX pour immuniser le composant contre toute inférence d'`any`.
  - **4. Modernisation des Workflows GitHub Actions** :
    - Mise à jour de la version de Node.js de 20 à 22 LTS dans [`.github/workflows/daily-indie-harvest.yml`](file:///.github/workflows/daily-indie-harvest.yml) et [`.github/workflows/deploy-ovh.yml`](file:///.github/workflows/deploy-ovh.yml) éliminant les alertes de dépréciation de GitHub Actions.
    - Test complet de bout en bout validé localement via `npm run audit-db` et `npm run build` (code retour 0).

---

### 🧭 16. Optimisation de la Bannière (Header) & Regroupement du Palmarès
- [x] **Refonte Ergonomique du Header & Suppression du Débordement (100% Déployé)** :
  - **1. Slogan Multiligne & Contraint** :
    - La tagline de marque (`t('app.tagline')`) était affichée sur une seule ligne sans largeur maximale sur les écrans larges, prenant plus de 450px et poussant les onglets de navigation (*Arcade*, *Boîte à Outils*, *Le Perchoir*) hors de l'écran.
    - Elle est désormais contrainte avec `max-w-[210px] 2xl:max-w-[250px]`, `leading-[1.25]`, `whitespace-normal break-words` et visible dès `lg:block`, libérant plus de 250px d'espace horizontal.
  - **2. Navigation Centrale Stable (`shrink-0`)** :
    - `<nav>` configuré avec `shrink-0` pour que les 7 onglets (*Pépites*, *Micro-Indés*, *Catalogue*, *Mini-Jeux*, *Arcade*, *Boîte à Outils*, *Le Perchoir*) conservent leur intégrité et ne soient jamais tronqués ni repoussés hors de la vue.
  - **3. Espace Joueur Dédié ("Palmarès & Trophées")** :
    - Remplacement des 3 boutons isolés et encombrants (Plumes/Succès, Trophée/Leaderboard, Stats) par un bouton déroulant élégant et unifié `[ 🏆 🪶 {feathersCount} ▾ ]` intégrant dans un menu stylisé :
      - 🪶 **Plumes & Succès** (`onOpenAchievements`)
      - 🏆 **Classements Mondiaux** (`onOpenLeaderboard`)
      - 📊 **Statistiques de Jeu** (`onOpenStats`)
      - 📅 **Calendrier Quotidien** (`onOpenCalendar`)
  - **4. Bouton Son Direct sur la Navbar** :
    - Déplacement de la commande de volume (`Volume2` / `VolumeX`) en dehors du menu déroulant et placement direct sur la barre de navigation pour couper ou réactiver le son en 1 clic sans manipulation superflue.
  - **5. Internationalisation Complète** :
    - Clés `playerHub`, `playerHubTip`, `achievementsDesc`, `leaderboardsDesc`, `statsDesc` traduites dans les 6 langues officielles (FR, EN, ES, DE, JA, PT-BR).

---

### 🕹️ 17. Expansion Itch.io Hors Micro-Indés & Nouveaux Styles de Jeu (Idle, Clicker, Incrémental, Factory)
- [x] **1. Intégration des Pépites Itch.io Reconnues dans le Grand Catalogue & Pépites Certifiées (100% Déployé)** :
  - Indexation et double-référencement de 21 pépites indépendantes emblématiques d'Itch.io :
    - 6 nouvelles pépites cultes ajoutées au catalogue certifié : *Minit*, *Anodyne*, *Frog Detective 1: The Haunted Island*, *Canabalt*, *A Monster's Expedition*, *Later Alligator*.
    - 15 pépites existantes enrichies avec leur URL officielle Itch.io : *Celeste*, *A Short Hike*, *Vampire Survivors*, *Baba Is You*, *Dusk*, *Dorfromantik*, *Pony Island*, *20 Minutes Till Dawn*, *Iron Lung*, *Buckshot Roulette*, *Night in the Woods*, *Mouthwashing*, *Cookie Clicker*, *Townscaper*, *shapez*.
  - Création du composant officiel [`src/components/common/ItchIcon.tsx`](file:///src/components/common/ItchIcon.tsx) respectant le tracé vectoriel officiel.
  - Double bouton d'action Steam + Itch.io sur chaque carte de pépite et sur la pépite quotidienne dans [`src/components/gems/GemExplorerHome.tsx`](file:///src/components/gems/GemExplorerHome.tsx) ainsi que dans la modale de détails de [`src/components/steam/SteamCatalogExplorer.tsx`](file:///src/components/steam/SteamCatalogExplorer.tsx).
  - Badge visuel Itch.io sur les miniatures et filtre rapide dédié en 1 clic (*Itch.io*) avec compteur dynamique.
  - Base de données portée à 177 pépites certifiées avec audit canonique `npm run audit-db` 100% validé (0 hallucination) et métadonnées de prix/avis synchronisées via `scripts/syncSteamStoreData.ts`.
- [x] **2. Nouveaux Styles et Sous-Genres de Jeu (Idle / Clicker, Incrémental, Automatisation / Factory) (100% Déployé)** :
  - Intégrer les catégories *Idle / Clicker*, *Incrémental*, *Automatisation / Factory*, *Cozy Micro-Gestion* dans la liste canonique des genres.
  - Mettre à jour l'utilitaire `inferEnrichedGenres` dans `src/utils/gameInference.ts`.
  - Mettre à jour le dictionnaire de traduction `localization.ts` et les 6 fichiers de locales (`fr.json`, `en.json`, `es.json`, `de.json`, `pt-BR.json`, `ja.json`).
  - Ajouter des filtres dédiés et des questions de quiz culturel associées.
- [x] **3. Retrait de l'Émoji Plante 🌱 dans l'Écrin Quotidien** :
  - Suppression de l'émoji dans le bouton *"La Clairière des Micro-Indés"* de l'accueil hero (`GemExplorerHome.tsx`) et dans les 6 fichiers de traduction pour une présentation plus sobre et soignée.

---

### 💰 18. Modèle Économique Éthique : Dons, Publicité Non-Intrusive & Partenariats Indés
- [x] **1. Système de Dons & Soutien Communautaire (Ko-fi / PayPal)** `[✅ 100% Déployé]` :
  - Intégration d'un encart Sylvestre chaleureux avec cadre de lianes vivantes dans le footer (`src/components/common/Footer.tsx`) avec redirection vers Le Perchoir.
  - Boutons de don directs et transparents : Ko-fi (`https://ko-fi.com/hibouxe`) et PayPal (`https://paypal.me/Hibouxe`).
  - Intégration des liens de soutien également dans la barre héroïque de l'espace créateur Le Perchoir (`src/components/roost/TheRoostHub.tsx`).
  - Traductions complètes dans les 6 langues (FR, EN, DE, ES, JA, PT-BR).
  - Philosophie immuable : 100% du contenu, des 12 modes de jeux, des outils et du catalogue reste 100% gratuit et ouvert (zéro paywall).
- [ ] **2. Publicité Respectueuse, Éthique & Non-Intrusive (Privacy-Friendly)** :
  - Sélectionner une régie publicitaire respectueuse de la vie privée, sans traçage invasif, sans cookies tiers et 100% conforme au RGPD (ex. *EthicalAds* ou bannières partenaires statiques auto-hébergées).
  - Règles d'affichage strictes :
    - Zéro pop-up, zéro interstitiel bloquant, zéro vidéo avec son automatique.
    - Emplacement réservé au bas de page (footer) ou au récapitulatif de fin de partie, sans jamais interrompre le gameplay ni empiéter sur les bornes d'arcade.
  - Possibilité de masquer / désactiver les encarts publicitaires en 1 clic pour les donateurs, mécènes et utilisateurs connectés.
- [ ] **3. Partenariats avec Studios Indés & Affiliation Éthique** :
  - Création d'une formule d'exposition "Pépite Partenaire / Studio Coup de Cœur" permettant à des créateurs indépendants ou micro-studios de mettre en valeur leur nouveau jeu ou campagne de financement participatif (Kickstarter, etc.).
  - Liens d'affiliation transparents vers les plateformes officielles (Steam, Itch.io, Humble Bundle, GOG) avec mention claire pour soutenir le projet.
  - Organisation de concours communautaires (tirages au sort de clés Steam/Itch.io offertes par les studios partenaires pour la communauté Hoot).

---

### 🔍 19. Référencement Exhaustif (SEO) & Préparation Technique de Partage 1.0 (Phase Marketing)
- [ ] **1. Sitemap XML Exhaustif & Déclarations Hreflang 6 Langues (`public/sitemap.xml`)** :
  - Ajouter toutes les nouvelles sections et routes créées : `#microindies` (La Clairière des Micro-Indés), `#catalog` (Le Catalogue Étendu Steam & Itch.io), `#friends` (Le Cercle des Compagnons).
  - Étendre les balises d'alternance linguistique `xhtml:link` aux 6 langues officielles du sanctuaire (FR, EN, ES, DE, JA, PT-BR) avec `hreflang="x-default"` pointant vers la racine.
  - Actualiser les balises de dernière modification `lastmod` à la date de release 1.0 pour forcer une réindexation prioritaire par Googlebot et Bingbot.
- [ ] **2. Générateur Sémantique & Données Structurées JSON-LD (`scripts/generateSeoIndex.ts` & `index.html`)** :
  - Mettre à jour l'ensemble des compteurs textuels et métadonnées pour refléter les 177 pépites certifiées et l'intégration d'Itch.io.
  - Enrichir le schéma `FAQPage` avec de nouvelles questions sémantiques ciblées : découverte des micro-indés et créations Itch.io, système d'amis sans spoiler, duels 1v1 en temps réel P2P, sauvegardes locales et classements.
  - Actualiser le conteneur sémantique pré-rendu pour les moteurs de recherche (`#seo-crawler-container`) avec les 177 fiches de jeux, studios, tags, liens Steam/Itch.io et descriptions narratives.
- [ ] **3. Cartes OpenGraph & Optimisation des Prévisualisations Réseaux Sociaux (Discord, X/Twitter, LinkedIn)** :
  - Vérifier la validité et le rendu des balises OpenGraph (`og:title`, `og:description`, `og:image`, `og:type`) et Twitter Cards (`summary_large_image`) sur les inspecteurs de métadonnées (Twitter Card Validator, Discord Embeds, LinkedIn Post Inspector).
  - Versionner l'URL de l'image de bannière avec un cache-buster (`og-banner.png?v=3`) pour écraser les miniatures en cache des plateformes de partage.
  - Assurer une description percutante, élégante et sans superlatif creux, invitant les passionnés de jeux vidéo indépendants à explorer le sanctuaire.
- [ ] **4. Audit Technique Core Web Vitals, Balises Canoniques & Google Search Console** :
  - Validation du score Core Web Vitals (LCP < 2.5s, CLS < 0.1, INP < 200ms) avec chargement différé optimisé.
  - Vérification de l'URL canonique absolue (`<link rel="canonical" href="https://hootindiegames.com/" />`) et de la conformité de `robots.txt`.
  - Préparation de la soumission du sitemap dans Google Search Console et Bing Webmaster Tools pour le lancement officiel.

---

### 🥚 20. Easter Eggs & Secrets Interactifs du Sanctuaire (100% Déployé)
- [x] **1. Code Konami (`↑ ↑ ↓ ↓ ← → ← → B A`) & Filtre Rétro CRT Cathodique (100% Déployé)** :
  - Détection universelle et instantanée au Clavier ([`src/utils/useKonamiCode.ts`](file:///src/utils/useKonamiCode.ts)) et aux Manettes (D-Pad + touches B et A unifiées).
  - Jingle chiptune 8-bit authentique Web Audio API (`soundFx.playKonamiJingle()`) en ondes carrées (square pulse wave) inspiré de la Famicom/NES.
  - Activation instantanée du mode Scanlines CRT vintage (`data-crt="true"`) dans [`src/index.css`](file:///src/index.css) avec balayage cathodique entrelacé, micro-scintillement d'écran et contraste amplifié.
  - Bandeau flottant ergonomique ([`src/components/common/CrtRetroControl.tsx`](file:///src/components/common/CrtRetroControl.tsx)) permettant d'activer/désactiver le filtre en 1 clic ou de masquer la notification.
  - Déblocage du succès secret *"L'Héritage des Anciens 🕹️"* (`konami_code`) récompensant le joueur de 25 Plumes d'Or.
  - Respect strict du souhait du joueur : zéro pluie de plumes automatique lors de la saisie du code.
- [x] **2. Secrets Tactiles de Sylvestre le Hibou (Logo Navbar)** ([`src/components/common/OwlLogo.tsx`](file:///src/components/common/OwlLogo.tsx)) :
  - Remplacement du déclenchement agressif au survol par un système de clics successifs avec réinitialisation temporisée (3,5s).
  - 5 clics rapides : hululement doux Web Audio (`soundFx.playOwlHoot()`) accompagné d'un clin d'œil malicieux et d'une oscillation de la tête du hibou (`isWinking`).
  - 10 clics consécutifs : réveil complet de Sylvestre (`isAwakened`), fanfare de victoire, ouverture de la modale secrète ([`src/components/common/OwlEasterEggModal.tsx`](file:///src/components/common/OwlEasterEggModal.tsx)) et déblocage du succès secret *"Murmure des Bois"* (`secret_owl`) avec 50 Plumes d'Or.
- [x] **3. Secret Mine Storm Vectrex 1982 (Mode Phosphore Vert & Plume d'Or)** ([`src/components/arcade/ArcadeModal.tsx`](file:///src/components/arcade/ArcadeModal.tsx)) :
  - Écran-titre d'attraction 1982 authentique avec tracé vectoriel, vaisseau de démonstration en rotation et record d'arcade.
  - Détection du maintien de la touche de tir (`Space` ou bouton A/X de la manette) pendant 5 secondes (300 frames) avec jauge circulaire de surcharge cathodique et pourcentage de calibration.
  - À 5 secondes : activation du mode "Phosphore Vert" (`isPhosphorMode`), balayage sonore rétro Web Audio (`soundFx.playVectrexUnlock()`), explosion vectorielle néon `#39ff14`, affichage du record légendaire `HIB - 999 990 PTS` et déblocage du succès secret *"Vectrex Phosphore ⚡"* (`vectrex_phosphor`) avec attribution d'une Plume d'Or (+25 plumes).
  - Tracé vectoriel de l'intégralité du jeu (vaisseau, mines flottantes, débris, tirs, HUD) illuminé en vert phosphore `#39ff14`.
- [x] **4. Console Développeur F12 (Art ASCII & Commandes Interactives)** ([`src/utils/securityAntiCheat.ts`](file:///src/utils/securityAntiCheat.ts)) :
  - Hibou en art ASCII soigné avec citation sur la création indépendante (*« La nuit appartient aux créateurs de mondes... 🦉 »*) et signature `@Hibouxe`.
  - Commandes console globales interactives :
    - `hoot()` : combine pluie magique de plumes d'or et hululement secret de Sylvestre.
    - `hootRain()` (ou `window.hootRain()`) : déclenche une pluie festive de plumes d'or et de feuilles de chêne via `canvas-confetti`.
    - `hootSecret()` (ou `window.hootSecret()`) : fait hululer Sylvestre et révèle une citation philosophique sur la création indépendante.

---

### 🔗 21. Audit et Correction des Liens Externes (Itch.io & Boutiques) (100% Déployé)
- [x] **1. Correction du Lien Itch.io de Mouthwashing** :
  - Retrait du lien Itch.io de *Mouthwashing* (`wrong-organ.itch.io/mouthwashing`), la page ayant été délistée d'Itch.io par Wrong Organ suite à la sortie commerciale sur Steam.
- [x] **2. Audit Exhaustif des Liens de Magasins & Script Automatisé (`scripts/auditExternalLinks.ts`)** :
  - Correction des URLs Itch.io des jeux du catalogue (*Frog Detective 1* pointé vers `fisho.itch.io/haunted-island`, *Pony Island* vers `dmullinsgames.itch.io/pony-island`, *Canabalt* vers `finji.itch.io/canabalt-classic`, *Grimm's Hollow* vers `ghosthum.itch.io/grimms-hollow`, *20 Minutes Till Dawn* vers `flanne.itch.io/10-minutes-till-dawn`).
  - Suppression des faux liens Itch.io pour les jeux distribués exclusivement sur Steam (*Dusk*, *Iron Lung*, *Cookie Clicker*, *Townscaper*, *shapez*).
  - Correction de l'image de capture de *A Short Hike* dans la Clairière des Micro-Indés.
  - Création du script d'audit automatisé reproductible `scripts/auditExternalLinks.ts` et de la commande `npm run audit-links`.
  - 100% des 47 URLs auditées (Itch.io et images) retournent un statut HTTP 200 OK (0 erreur).

---

### ⚡ 22. Éradication du Flash Sans Style (FOUC) & Écran de Chargement Immédiat (100% Déployé)
- [x] **1. Diagnostic & Résolution Racine du FOUC (Flash of Unstyled Content)** :
  - **Origine** : Le contenu sémantique pré-rendu pour le référencement (`#seo-crawler-container`, ~3 000 lignes de texte brut, articles, liens internes et 177 fiches de jeux) était injecté directement comme enfants de `<div id="root">`. Durant les quelques centaines de millisecondes de téléchargement du bundle JavaScript React, le navigateur peignait ce HTML brut sans la feuille de style Tailwind, provoquant l'affichage temporaire d'une page basique/déstructurée avant que React ne monte et ne remplace le DOM.
  - **Résolution** :
    - Déplacement du contenu sémantique SEO dans la balise `<noscript>`. Les robots d'indexation sans JS continuent d'indexer l'intégralité des 177 jeux, des catégories et de la FAQ, tandis que les navigateurs modernes avec JS actif ignorent totalement ce bloc et ne le peignent jamais.
    - Déclaration de styles critiques inline dans `<head>` (`color-scheme: dark`, fond forestier immédiat `#010604` et styles sur `html, body`) éliminant tout clignotement ou fond blanc.
    - Création d'un écran de chargement immersif dans `<div id="root">` avec le logo officiel du Hibou en pulsation bioluminescente, spinner émeraude/or et message *"Chargement du sanctuaire..."*, balayé instantanément par `createRoot` lors du montage de React.
    - Zéro flash, transition 100% imperceptible et préservation totale du score SEO.

---

### 🎯 23. Calibrations des Mini-Jeux, Connexions Dynamique & Pépites Itch.io (100% Déployé)
- [x] **1. Mini-Jeu "Connexions" (Linkle) : Affichage des Catégories & Indices Thématiques** ([`src/components/linkle/LinkleGame.tsx`](file:///src/components/linkle/LinkleGame.tsx)) :
  - **Bouton & Panneau d'Indices** : Ajout d'un bouton à bascule `💡 [Afficher les catégories]` dans le bandeau de jeu.
  - **Panneau Dépliable Élégant** : Révèle les intitulés des 4 thèmes secrets avec leurs pastilles de difficulté officielles (🟨 Facile, 🟩 Moyen, 🟦 Difficile, 🟪 Expert), sans dévoiler les jeux associés. Les catégories déjà résolues sont automatiquement barrées avec un badge vert `✓ Trouvé`.
- [x] **2. Moteur Procédural Dynamique de Connexions** ([`src/data/connectionsPuzzles.ts`](file:///src/data/connectionsPuzzles.ts)) :
  - **Grille Dynamique Évolutive** : Remplacement des 2 grilles statiques par un algorithme de génération procédurale déterministe (Lehmer LCG) fondé sur 38 règles thématiques réparties sur les 4 paliers de difficulté.
  - **Garantie Zéro Collision** : Sélectionne 4 catégories disjointes et 16 jeux mutuellement exclusifs chaque jour (zéro doublon de jeu dans une même grille, validé sur 365 jours consécutifs).
  - Évolue automatiquement à mesure que la bibliothèque de jeux s'enrichit !
- [x] **3. Intégration des Pépites Itch.io dans les Mini-Jeux** ([`src/data/games.ts`](file:///src/data/games.ts)) :
  - Intégration canonique dans `INDIE_GAMES` de 5 micro-indés cultes issus de la Clairière Itch.io (*Celeste Classic PICO-8*, *Adventures With Anxiety!*, *Our Life: Beginnings & Always*, *A Date with Death*, *Blooming Panic*).
  - Métadonnées complètes, captures certifiées 1080p et taglines bilingues respectant à 100% la règle 0 Hallucination (`npm run audit-db` et `npm run audit-links` avec 182 pépites).
  - Ces pépites participent désormais automatiquement à l'ensemble des mini-jeux (Screenle, Indledle, Profille, Chrono, Pixel, Review, Versus, Quiz et Connexions).
- [x] **4. Mini-Jeu "Capture" (Screenle) : Amplification du Zoom Initial (Étapes 1 et 2)** ([`src/components/screenle/ScreenleGame.tsx`](file:///src/components/screenle/ScreenleGame.tsx)) :
  - **Grossissement Renforcé** : Étape 1 portée à x2.6 (novice), x4.6 (standard) et x6.5 (expert) pour masquer la scène globale et corser l'enquête par micro-détail.
  - Points focaux et origines de zoom (`zoomOrigins`) recentrés sur des angles mystérieux et stimulants.

---

### 🎹 24. Easter Egg Musical : Piano Végétal de Sylvestre & Comptine "Coucou Hibou" (100% Déployé)
- [x] **1. Piano Végétal sur la Branche de Séparation** ([`src/components/sylvestre/SylvestreBranchDivider.tsx`](file:///src/components/sylvestre/SylvestreBranchDivider.tsx)) :
  - Situé entre l'écrin quotidien et les défis quotidiens sur la page d'accueil ([`src/components/gems/GemExplorerHome.tsx`](file:///src/components/gems/GemExplorerHome.tsx)).
  - 7 feuilles musicales interactives de Sylvestre réparties le long de la branche de bois et de mousse, accordées sur les notes de la gamme (Do 523Hz, Ré 587Hz, Mi 659Hz, Fa 698Hz, Sol 784Hz, La 880Hz, Si 988Hz).
  - Synthèse sonore organique Web Audio API ([`src/utils/audio.ts`](file:///src/utils/audio.ts)) avec double oscillateur triangle + harmonique haute simulant un kalimba ou xylophone féerique en bois.
  - Effet visuel au toucher : rebond tactile, surbrillance dorée et bulle de note flottante `♪ [Note]`.
- [x] **2. Détection de la Comptine "Coucou Hibou" & Récompense en Plumes Dorées** :
  - Analyse en temps réel des séquences de notes jouées. Reconnaissance des motifs de la célèbre comptine (*Do-Mi-Sol-Sol*, *Sol-Mi-Sol-Mi*, etc.).
  - À la détection :
    - Déclenchement du jingle triomphant de Coucou Hibou synthétisé en Web Audio (`soundFx.playCoucouHibouJingle()`).
    - Pluie festive de confettis aux couleurs de Sylvestre (or, émeraude, mousse).
    - Déblocage du succès secret *"Mélodie de Sylvestre 🍃"* (`sylvestre_foliage_piano`) récompensant le joueur de **+30 Plumes Dorées** 🪶.
    - Bannière flottante célébrant le réveil musical de Sylvestre.

---

### 🦉 25. Intégration d'Owlboy & Audit Zéro Image Générique (100% Déployé)
- [x] **1. Intégration Canonique du Chef-d'Œuvre "Owlboy"** ([`src/data/games.ts`](file:///src/data/games.ts)) :
  - Ajout officiel d'*Owlboy* par D-Pad Studio (Steam AppID 115800, bande originale de Jonathan Geer, 6 captures 1080p certifiées, taglines bilingues).
  - Validation stricte 0 Hallucination (`npm run audit-db`). Le catalogue atteint **187 pépites certifiées**.
- [x] **2. Éradication Totale des Images de Substitution Génériques dans Linkle** ([`src/data/connectionsPuzzles.ts`](file:///src/data/connectionsPuzzles.ts) & [`src/components/linkle/LinkleGame.tsx`](file:///src/components/linkle/LinkleGame.tsx)) :
  - Résolution des erreurs 404 du nouveau CDN Steam (sorties 2024-2026 avec jaquettes hashées) et des captures aux timestamps expirés (*Minit*, *Anodyne*, *Canabalt*, *Later Alligator*, *Frog Detective 1*, *A Monster's Expedition*, *Blasphemous*).
  - Remplacement de l'ensemble des fallbacks Unsplash par les jaquettes officielles et des fallbacks de captures in-game 1080p certifiées HTTP 200 sur 100% des 187 jeux.
  - En cas d'aléa réseau, bascule automatique sur un placeholder SVG élégant aux couleurs de Hoot Indie avec le titre exact du jeu au lieu de stock photos tierces.

---

### 🎯 26. Évolutions de Gameplay : Recherche Adaptative Classic & Rotation des Catégories Profille (EN COURS)
- [x] **1. Mode Classic (Indledle) : Option de Recherche Adaptative / Filtrage des Indices Déduits** `[🟡 Palier 2 - Moyenne]` :
  - Ajouter un bouton bascule explicite (ex : `💡 [Adapter les suggestions aux indices : Activé / Désactivé]`) directement au-dessus de la barre de recherche [`GameSearchBar.tsx`](file:///src/components/common/GameSearchBar.tsx) ou dans les réglages de difficulté.
  - **Mode Adaptatif (Activé)** : La liste déroulante d'autocomplétion filtre automatiquement les jeux incompatibles avec les indices confirmés (année exacte, bornes fléchées plus récent / plus ancien, style visuel éliminé, perspective de caméra, genres exclus) et affiche le compteur dynamique de candidats possibles (`🎯 X jeux possibles`).
  - **Mode Puriste / Défi Libre (Désactivé)** : La liste déroulante reste ouverte à l'intégralité du catalogue des 187 jeux sans aucun filtrage automatique, laissant le joueur déduire et chercher librement sans assistance algorithmique.
  - Mémorisation de la préférence dans `localStorage` (`indledle_adaptive_clues`) pour respecter le style de jeu choisi par l'utilisateur.
- [x] **2. Mode Profil (Profille) : Système de Rotation Dynamique des Catégories d'Enquête** `[🟠 Palier 3 - Élevée]` :
  - Casser la monotonie du trio fixe [Année de sortie, Studio de développement, Genres] en introduisant une rotation dynamique des attributs à trouver chaque jour.
  - **Éventail des Catégories Possibles** :
    1. *Année de sortie* (Molette ou saisie numérique avec flèches indicatrices avant/après)
    2. *Studio de développement* (Autocomplétion sur les 120+ studios indépendants)
    3. *Genres & Mécaniques clés* (Chips interactifs parmi 65 genres canoniques)
    4. *Compositeur & Bande-son (OST)* (Reconnaissance de l'artiste ou compositeur musical)
    5. *Style Visuel / Direction Artistique* (Pixel Art, 2D Dessiné main, 3D Stylisée, Low-poly, Monochrome...)
    6. *Perspective & Caméra* (Vue de côté 2D, Vue du dessus, Isométrique, Première personne...)
  - **Générateur Déterministe Quotidien** :
    - Sélection automatique de 3 catégories distinctes chaque jour en fonction de la graine calendaire (`currentDate`), en garantissant la pertinence des données pour le jeu mystère du jour (ex: inclusion du compositeur uniquement si documenté).
    - Mise à jour de l'interface [`ProfilleGame.tsx`](file:///src/components/profille/ProfilleGame.tsx) pour afficher dynamiquement les 3 panneaux correspondant aux catégories tirées au sort du jour.
    - Persistance locale rétrocompatible de l'état de jeu du jour (`profille_state_${currentDate}`).

---

### 🌿 27. Ergonomie Navbar & Compagnons : Hauteur Header et Statut Amis Connectés (100% Déployé)
- [x] **1. Agrandissement de la Barre Supérieure & Confort du Slogan** `[🟢 Palier 1 - Faible]` ([`src/components/common/Navbar.tsx`](file:///src/components/common/Navbar.tsx)) :
  - **Diagnostic résolu** : Hauteur de barre rehaussée (`h-16 sm:h-[72px] lg:h-[76px]`), conteneur élargi (`max-w-[150px] sm:max-w-[240px] lg:max-w-[290px] 2xl:max-w-[340px]`) et interligne ajusté. Le slogan s'intègre avec une marge aérée et confortable sans aucun débordement.
- [x] **2. Épuration des Notifications & Compteur Fixe des Amis Connectés** `[🟢 Palier 1 - Faible]` ([`src/components/common/Navbar.tsx`](file:///src/components/common/Navbar.tsx), [`src/context/FriendsContext.ts`](file:///src/context/FriendsContext.ts), [`src/context/FriendsProvider.tsx`](file:///src/context/FriendsProvider.tsx)) :
  - **Diagnostic résolu** : Suppression définitive du clignotement `animate-pulse` intempestif. Remplacement par un badge vert émeraude fixe affichant `friendsOnlineCount` uniquement lorsqu'au moins un ami est en ligne. Zéro fausse alerte.

---

### 📖 28. Système de Pagination Universel & Ergonomie de Prévisualisation (100% Déployé)
- [x] **1. Pagination du Catalogue Étendu & de l'Explorateur de Pépites** ([`src/components/common/PaginationControls.tsx`](file:///src/components/common/PaginationControls.tsx), [`src/components/steam/SteamCatalogExplorer.tsx`](file:///src/components/steam/SteamCatalogExplorer.tsx), [`src/components/gems/GemExplorerHome.tsx`](file:///src/components/gems/GemExplorerHome.tsx)) :
  - **Suppression du Plafond de 48 Jeux** : Retrait définitif du message *"Affichage des 48 premiers résultats sur 286. Affinez votre recherche pour cibler un jeu précis."*.
  - **Affichage Intégral & Découpage Paramétrable (12, 24, 48, 96, Tous)** : Grille paginée avec choix libre du nombre de résultats par page pour l'utilisateur, persistant dans `localStorage` (`hoot_items_per_page`), garantissant une charge DOM ultra-légère, zéro ralentissement et un défilement fluide sur tous les appareils.
  - **Double Commande Ergonomique** : Pilules de sélection directe [ 12 | 24 | 48 | 96 | Tous ] en haut de grille et dans la barre de pagination au bas de page.
  - **Composant Réutilisable `PaginationControls`** :
    - Algorithme d'ellipse dynamique (`[1, 2, 3, 4, 5, '...', totalPages]`).
    - Boutons Début, Précédent, Suivant, Fin et numéros de pages avec effets sonores Web Audio (`soundFx.playClick()`).
    - Remontée automatique et fluide au sommet de la grille (`scrollToId`).
    - Internationalisation complète (FR, EN, ES, DE, JA, PT-BR) avec traduction du compteur d'éléments et des libellés de densité.
  - **Réinitialisation Intelligente** : Tout changement de filtre, recherche texte ou tri réinitialise automatiquement la vue sur la page 1, et le changement de densité recalcule la page cible pour préserver la position de lecture.
  - **Support Roulette Aléatoire** : La pioche aléatoire de pépite dans l'accueil calcule l'indice du jeu choisi et bascule automatiquement sur la page correspondante avant de scroller.
- [x] **2. Fermeture Ergonomique de l'Aperçu de Jeu au Clic Extérieur & Raccourci Échap** ([`src/components/steam/SteamCatalogExplorer.tsx`](file:///src/components/steam/SteamCatalogExplorer.tsx)) :
  - Fermeture instantanée de la modale de prévisualisation au clic sur l'arrière-plan assombri (backdrop `onClick={handleCloseModal}` avec `onClick={(e) => e.stopPropagation()}` sur la boîte de dialogue).
  - Fermeture instantanée par la touche Échap (`Escape`) via écouteur clavier dédié avec nettoyage (`removeEventListener`).
  - Maintien du bouton de croix classique pour les utilisateurs préférant une cible explicite.

---

### 🕹️ 29. Chantiers de Gameplay, Arcade, Modération Admin, Optimisations & Audit Global (EN COURS)
- [x] **1. Affichage & Audit des Prix Manquants et Gestion des Soldes** `[🟡 Palier 2 - Moyenne]` :
  - Parcourir les jeux du catalogue et des pépites pour identifier les jeux sans prix ou avec prix masqué : 183/183 pépites Steam certifiées (100%), intégration des 6 jeux manquants (*BuGarden*, *Video Game Menu: The Game*, *Eagle Knight Paradox*, *Our Life*, *A Date with Death*, *Owlboy*).
  - Gestion élégante des jeux Itch.io / Web libres avec pilule `Gratuit / Prix libre`, prise en compte dans le filtre `Gratuit`, et rendu complet des soldes (pastille `-XX%`, prix barré, nouveau prix).
- [x] **2. Retrait de "Big Sister" & Gestion des Jeux en Temps Réel pour l'Admin (100% Déployé)** :
  - [x] *Retrait de "Big Sister"* `[🟢 Palier 1 - Faible]` : Retiré de `INDIE_GAMES` dans `src/data/games.ts` et `connectionsPuzzles.ts` (0 hallucination vérifié).
  - [x] *Module CRUD Admin en Direct* `[🟠 Palier 3 - Élevée]` `(100% Déployé)` :
    - Création du backend souverain [`public/api/admin_games.php`](file:///public/api/admin_games.php) avec authentification stricte contre `ADMIN_STEAM_ID` (`76561198035270542`) et persistance atomique `LOCK_EX` dans `public/api/games_override.json`.
    - Composant interactif complet [`src/components/admin/AdminGamesManager.tsx`](file:///src/components/admin/AdminGamesManager.tsx) intégré dans l'onglet dédié `Catalogue & CRUD Jeux` de [`src/components/admin/AdminDashboardModal.tsx`](file:///src/components/admin/AdminDashboardModal.tsx).
    - Fonctionnalités opérationnelles : ajout de nouvelles pépites (`+ Ajouter une Pépite`), modification de toutes les métadonnées (titre, studio, année, genres, style visuel, caméra, URLs Steam/Itch, captures, taglines, compositeur), masquage/affichage 1-clic (`toggle_visibility`), suppression et restauration aux valeurs canoniques d'origine.
    - Synchronisation en direct sans rechargement avec le catalogue global (`steamCatalogService.setServerOverrides`).
- [x] **3. Blind Test : Nouvelles Musiques & Correction du Bug de Sélection (Balatro)** :
  - [x] *Correction Sélection Balatro* `[🟢 Palier 1 - Faible]` : Compositeur Louis F. harmonisé, genre "Cartes" ajouté, recherche insensible aux accents et ponctuation ("louis f", "poker", "balatro"), correction du focus/blur pour garantir une sélection infaillible.
  - [x] *Nouvelles Musiques Web Audio* `[🟡 Palier 2 - Moyenne]` : 5 nouvelles pistes certifiées (*Fez*, *Katana Zero*, *The Binding of Isaac: Rebirth*, *Hyper Light Drifter*, *Terraria*), bibliothèque portée à 20 OSTs d'élite.
- [x] **4. Leaderboard : Règle du Score Unique par Compte (Meilleur Score Conservé)** `[🟡 Palier 2 - Moyenne]` :
  - Modification de `public/api/leaderboard.php` et `src/services/leaderboardService.ts` : déduplication automatique stricte par compte/pseudo, 1 seul score par joueur par jeu.
  - Conservation inconditionnelle du record personnel maximal : si un score inférieur est soumis, le record existant reste intact sans régression ni doublon.
- [x] **5. Arcade Tetris : Bordures Visuelles de l'Aire de Jeu** `[🟢 Palier 1 - Faible]` :
  - Aire 10x20 délimitée par une double bordure néon émeraude `#10b981`, grille de repère subtile, chanfrein sur les blocs et panneaux latéraux avec guides de contrôle.
- [x] **6. Sélecteur de Difficulté dans les Jeux d'Arcade** `[🟡 Palier 2 - Moyenne]` :
  - Choix de difficulté (🌿 **Détente**, ⚡ **Normal**, 💀 **Expert**) sur les 8 bornes d'arcade avec calibration de vitesse, vies et multiplicateurs de score (x0.8 / x1.0 / x1.5).
- [x] **7. Course Sylvestre : Mécanique de Se Baisser & Parcours 100% Franchissable** `[🟠 Palier 3 - Élevée]` :
  - Implémenter l'action de glisser / se baisser (touche Bas, S ou bouton tactile) pour esquiver les branches basses et obstacles hauts.
  - Réviser l'algorithme procédural de génération d'obstacles afin de garantir des fenêtres de réaction suffisantes et une faisabilité mathématique à 100%.
- [x] **8. Casse-Briques (Breakout) : Niveaux Multiples & Système de Bonus (100% Déployé)** `[🟠 Palier 3 - Élevée]` :
  - **5 Niveaux / Stages Architecturaux Uniques** dans [`src/components/arcade/ArcadeModal.tsx`](file:///src/components/arcade/ArcadeModal.tsx) : *Le Bosquet Sylvestre*, *Les Pyramides Jumelles*, *Le Vol du Grand Duc*, *Les Remparts Antiques*, *Le Trône Astral* avec palettes végétales, émeraude, cyan, pourpre et or.
  - **Briques Renforcées (2 PV)** : Aspect métallique riveté ou fissuré au premier impact (+25 pts).
  - **Système de 6 Capsules de Bonus Tombantes (Power-Ups)** : Multibille (🔵 M), Raquette élargie (🟢 W), Canons laser doubles (🔴 L - tir automatique / manuel barre espace et clic), Ralentisseur temporel (🟡 S), Vie supplémentaire (💖 ♥) et Bille de feu perforante (⚡ F).
  - **HUD de Bordure & Polish Visuel** : Affichage des cœurs de vie, timer visuel dynamique pour chaque bonus actif, bannières d'étape franchie, particules d'impact et physique précise de renvoi selon l'angle d'impact sur la raquette.
- [x] **9. Optimisation Performance des Jeux d'Arcade (Zéro Lag / 60 FPS Constants)** `[🟠 Palier 3 - Élevée]` `(100% Déployé)` :
  - Profiler et optimiser la boucle d'animation des 8 jeux pour un 60 FPS ininterrompu sans saccades ni fuites mémoire : fixed timestep avec support de l'API Visibility (`document.hidden`), suppression des allocations d'arrays dans `isKeyDown`, suppression des `.filter()` répétitifs par frame, suppression des interpolations de chaînes par particule (`ctx.globalAlpha`), allègement du `shadowBlur` et limitation des particules.
- [ ] **10. Optimisation Mobile Globale (Légèreté & Fluidité)** `[🔴 Palier 4 - Majeure]` :
  - Optimiser le rendu sur smartphone : `content-visibility: auto`, chargement différé des images lourdes, debouncing des filtres et allègement du DOM.
- [ ] **11. Audit Final d'Homologation Globale** `[🔴 Palier 4 - Majeure]` :
  - Une fois l'ensemble des tâches finalisé : audit de cybersécurité (en-têtes HTTP, XSS, CSRF, sanitisation), scores Lighthouse / Core Web Vitals, vérification des actions GitHub de moissonnage automatique (`daily-indie-harvest.yml`) et intégrité de la base de données.

---

### 💬 30. Système de Tchat Communautaire, Salons Multilingues, Espace Feedback & Messagerie de Duel (100% Déployé)
- [x] **1. Tchat Général "Le Perchoir", Salons Multilingues, Espace Feedback & Messagerie entre Compagnons** `[🟠 Palier 3 - Élevée]` `(100% Déployé)` ([`src/components/chat/ChatDrawer.tsx`](file:///src/components/chat/ChatDrawer.tsx), [`src/context/ChatContext.tsx`](file:///src/context/ChatContext.tsx), [`public/api/chat.php`](file:///public/api/chat.php)) :
  - **Interface Rétractable (Tchat Drawer / Volet Flottant)** : Tiroir coulissant sur le côté ou volet interactif accessible depuis la Navbar, l'onglet Compagnons et les modales.
  - **Architecture Multi-Salons avec Sélecteur Intuitif** :
    - *🌍 Salon Principal Mondial (Global)* : Salon international par défaut ouvert à tous les explorateurs indépendants.
    - *🗣️ Salons Dédiés par Langue* : Salons ciblés pour chaque langue supportée (🇫🇷 Français, 🇬🇧 English, 🇪🇸 Español, 🇩🇪 Deutsch, 🇯🇵 日本語, 🇧🇷 Português), avec un menu déroulant ou des onglets/pilules de sélection permettant à l'utilisateur de choisir et basculer instantanément sur le chat de son choix.
    - *💡 Espace "Retours & Feedback"* : Espace d'échange dédié où les joueurs et visiteurs peuvent soumettre leurs retours d'expérience, idées de fonctionnalités, signalements de bugs et suggestions pour faire évoluer le site en direct avec l'avis de la communauté.
  - **Salon Public "Le Perchoir"** : Fil de messages communautaires temps réel pour partager ses scores du jour, ses découvertes de pépites et discuter entre explorateurs indés.
  - **Messagerie Privée entre Compagnons** : Possibilité d'envoyer des messages directs ou invitations de jeu à ses amis enregistrés.
  - **Tchat de Duel 1v1 dans la Versus Arena** : Échange de messages instantanés ou d'émotes rapides pendant les confrontations WebRTC directes.
  - **Sécurité, Modération & Performance** :
    - Sanitisation stricte anti-XSS (`htmlspecialchars`, nettoyage de balises HTML).
    - Rate-limiting (limitation du débit de messages par minute et par IP/compte).
    - Filtre automatique de mots grossiers ou inappropriés.
    - Persistance JSON sécurisée avec verrouillage atomique (`LOCK_EX`).
    - Effets sonores Web Audio discrets à l'envoi et à la réception (`soundFx.playChime()`).

---

### 👤 31. Gestion du Profil Joueur, Compagnons & Stabilité des Pseudonymes
- [x] **1. Profil Leaderboard Directement Lié au Compte & Synchronisation Globale des Scores** `[🟡 Palier 2 - Moyenne]` ([`src/components/common/LeaderboardModal.tsx`](file:///src/components/common/LeaderboardModal.tsx), [`src/context/UserAccountProvider.tsx`](file:///src/context/UserAccountProvider.tsx), [`src/services/leaderboardService.ts`](file:///src/services/leaderboardService.ts), [`public/api/leaderboard.php`](file:///public/api/leaderboard.php)) :
  - Connexion native de la modale Leaderboard au compte utilisateur (`profile.username` et `profile.avatarId`).
  - Propagation en cascade de tout changement de pseudo/avatar sur l'intégralité des scores du joueur (`update_player_profile`).
  - Badge prestigieux `👑 Créateur` et protection de l'identité officielle `Hibouxe` pour Quentin Beaud.
- [x] **2. Modification Possible du Pseudonyme une Fois Tous les 14 Jours** `[🟡 Palier 2 - Moyenne]` `(100% Déployé)` ([`src/context/UserAccountProvider.tsx`](file:///src/context/UserAccountProvider.tsx), [`src/components/common/ProfileModal.tsx`](file:///src/components/common/ProfileModal.tsx), [`src/utils/featherEconomy.ts`](file:///src/utils/featherEconomy.ts)) :
  - Instaurer un délai de carence de 14 jours entre deux changements de pseudonyme.
  - Sauvegarde du timestamp `lastUsernameChangeAt` dans le profil utilisateur et `localStorage`.
  - Calcul du temps restant avec message informatif bienveillant (*« Prochain changement gratuit le JJ/MM/AAAA »*).
  - Champ de saisie désactivé avec badge de cadenas tant que la période de carence est active.
  - Exemption permanente pour le compte administrateur / créateur (`Hibouxe` / Quentin Beaud).
  - Option de contournement immédiat via le Renommage Express (25 🪶) dans la modale de profil et la Boutique.
- [x] **3. Expansion du Roster des « Compagnons Indés » dans le Profil Joueur (23 Compagnons)** `[🟢 Palier 1 - Faible]` ([`src/data/avatars.ts`](file:///src/data/avatars.ts), [`src/types/user.ts`](file:///src/types/user.ts), [`src/components/common/ProfileModal.tsx`](file:///src/components/common/ProfileModal.tsx), [`public/api/leaderboard.php`](file:///public/api/leaderboard.php), [`src/services/leaderboardService.ts`](file:///src/services/leaderboardService.ts)) :
  - Enrichissement de la galerie des compagnons indés sélectionnables portée à **23 compagnons d'élite**.
  - Intégration de 14 nouvelles figures emblématiques de la scène indépendante (*Shovel Knight, Sans, Cuphead, Isaac, Niko, Le Pénitent, Le Décapité, Super Meat Boy, Baba, Hornet, Omori, Claire, Le Voyageur, Le Slugcat*).
  - Palette de gradient thématique, icône/emoji dédié, jeu d'origine et citations cultes.
  - Prise en charge automatique dans le profil, le Leaderboard en ligne, le système d'Amis et les Duels Versus.

---

### 🪶 32. Économie des Plumes d'Or & Boutique du Sanctuaire (Farm Journalier, Avatars & Cosmétiques) (100% Déployé)
- [x] **1. Moteur de Récolte Quotidienne des Plumes d'Or (Farm Journalier & Streaks)** `[🟡 Palier 2 - Moyenne]` `(100% Déployé)` ([`src/context/AchievementsProvider.tsx`](file:///src/context/AchievementsProvider.tsx), [`src/context/UserAccountProvider.tsx`](file:///src/context/UserAccountProvider.tsx), [`src/utils/featherEconomy.ts`](file:///src/utils/featherEconomy.ts)) :
  - Attribution automatique de Plumes d'Or lors de chaque première victoire du jour sur les mini-jeux quotidiens (+10 plumes par discipline : Screenle, Indledle, Linkle, Profille, Chrono, Pixel, Review, Blind Test).
  - Bonus de Grand Chelem (+25 plumes si les 8 défis quotidiens sont remportés le même jour).
  - Toast de célébration animé Web Audio à l'attribution des plumes et gestion des récompenses en attente.
- [x] **2. Boutique du Sanctuaire & Dépense de Plumes (Avatars Exclusifs, Renommage Express, Titres & Cadres)** `[🟡 Palier 2 - Moyenne]` `(100% Déployé)` ([`src/components/common/ProfileModal.tsx`](file:///src/components/common/ProfileModal.tsx), [`src/components/shop/FeatherShopModal.tsx`](file:///src/components/shop/FeatherShopModal.tsx), [`src/components/common/Navbar.tsx`](file:///src/components/common/Navbar.tsx), [`src/App.tsx`](file:///src/App.tsx)) :
  - Catalogue d'avatars et compagnons exclusifs déblocables contre des plumes d'or (*Sylvestre Doré, Chevalier Céleste, Hornet Tisserande d'Or, Spectre Rétro 8-Bit*).
  - Option de renommage express payée en plumes (25 🪶) pour lever immédiatement le délai de carence des 14 jours.
  - Cadres de profil cosmétiques (*Écorce Sylvestre, Liseré Doré Céleste, Néon Synthwave, Émeraude Profonde*) et titres honorifiques (*Dénicheur de Pépites, Maître du Pixel, Mélomane du Perchoir, Explorateur des Cimes, Grand-Duc Sylvestre*) à arborer sur son profil et dans le Leaderboard.
  - Intégration Navbar (Hub Joueur), modale de profil (boutique et avatars verrouillés avec redirection), et support deep-link `#shop` / `#boutique`.

---

### ☁️ 33. Synchronisation Cloud Souveraine Multi-Appareils & Multi-PC (100% Déployé)
- [x] **1. Persistance & Fusion Non-Destructive sur Serveur Souverain OVH** `[🟠 Palier 3 - Élevée]` `(100% Déployé)` ([`public/api/user_cloud_sync.php`](file:///D:/Hibouxe/Site/public/api/user_cloud_sync.php), [`public/api/user_saves/.htaccess`](file:///D:/Hibouxe/Site/public/api/user_saves/.htaccess), [`src/services/userCloudSyncService.ts`](file:///D:/Hibouxe/Site/src/services/userCloudSyncService.ts)) :
  - **Diagnostic Résolu** : Auparavant, les Plumes d'Or 🪶, Succès 🏆, Achats Boutique, Séries et Records Time Attack étaient stockés exclusivement dans le `localStorage` isolé du navigateur de la machine locale. Changer de PC ou de navigateur réinitialisait la progression visuelle à zéro.
  - **Backend API Souverain PHP** : Endpoint dédié avec rate-limiting, en-têtes de sécurité, stockage JSON chiffré/sécurisé sous verrou atomique `LOCK_EX` dans `public/api/user_saves/{id}.json` protégé contre tout accès web direct par un `.htaccess` strict (`Require all denied`).
  - **Moteur de Fusion Multi-Appareils Intelligent** : Lors de la synchronisation entre deux PC, aucune donnée n'est perdue. L'algorithme opère l'union ensembliste des succès, avatars, titres et cadres débloqués, et retient le maximum absolu des plumes d'or, records de Time Attack, séries et parties jouées.
  - **Profil Officiel Administrateur / Créateur** : Initialisation prioritaire et automatique pour le Steam ID `76561198035270542` (Quentin Beaud) garantissant la protection de ses droits, de son avatar créateur exclusif et de ses cosmétiques.
- [x] **2. Synchronisation Automatique Réactive & Onglet Profil Modernisé** `[🟡 Palier 2 - Moyenne]` `(100% Déployé)` ([`src/context/UserAccountProvider.tsx`](file:///D:/Hibouxe/Site/src/context/UserAccountProvider.tsx), [`src/context/AchievementsProvider.tsx`](file:///D:/Hibouxe/Site/src/context/AchievementsProvider.tsx), [`src/utils/featherEconomy.ts`](file:///D:/Hibouxe/Site/src/utils/featherEconomy.ts), [`src/components/common/ProfileModal.tsx`](file:///D:/Hibouxe/Site/src/components/common/ProfileModal.tsx)) :
  - Déclenchement automatique au chargement du site ou dès la connexion du compte Steam.
  - Sauvegarde debouncée automatique (500ms) dès l'attribution ou la dépense de plumes (`hoot_feathers_updated`) et au déblocage de chaque succès.
  - Diffusion réactive via l'événement `hoot_cloud_save_restored` mettant à jour instantanément les états React des contextes sans rechargement de page.
  - Refonte complète de l'onglet Cloud dans la modale de profil : badge en direct (Cloud Synchronisé), carte d'identité de l'appareil/Steam lié, bouton d'action `🔄 Synchroniser & Fusionner Maintenant` avec retours sonores et visuels, et maintien de l'export/import JSON hors-ligne.

---

### 🍃 34. Polish Visuel & Végétal Sylvestre (Anatomie Botanique, Dé-surcharge UI & Clics Fantômes Éliminés) (100% Déployé)
- [x] **1. Élimination Intégrale des Clics Fantômes sur les Feuilles Décoratives** `[🟢 Palier 1 - Faible]` `(100% Déployé)` ([`src/components/sylvestre/SylvestreLeaf.tsx`](file:///D:/Hibouxe/Site/src/components/sylvestre/SylvestreLeaf.tsx), [`src/components/sylvestre/SylvestreIvyFrame.tsx`](file:///D:/Hibouxe/Site/src/components/sylvestre/SylvestreIvyFrame.tsx), [`src/components/sylvestre/SylvestreCornerIvy.tsx`](file:///D:/Hibouxe/Site/src/components/sylvestre/SylvestreCornerIvy.tsx)) :
  - **Diagnostic Résolu** : Auparavant, les feuilles décoratives portaient une classe hardcodée `pointer-events-auto cursor-pointer`, transformant le curseur de la souris en main cliquable 👆 au survol de chaque feuille passive et bloquant les clics vers les cartes sous-jacentes.
  - **Correction Conditionnelle** : `SylvestreLeaf` applique désormais `pointer-events-none cursor-default` de façon stricte lorsque aucun handler `onClick` n'est fourni, et `pointer-events-auto cursor-pointer` uniquement sur les feuilles interactives (ex: le piano végétal sonore de `SylvestreBranchDivider`).
  - Suppression de tous les conteneurs intermédiaires `pointer-events-auto` dans `SylvestreIvyFrame` et `SylvestreCornerIvy` pour que les clics traversent parfaitement vers les cartes et boutons.
- [x] **2. Raccordement Botanique des Tiges au Bois et aux Lianes** `[🟡 Palier 2 - Moyenne]` `(100% Déployé)` ([`src/components/sylvestre/SylvestreLeaf.tsx`](file:///D:/Hibouxe/Site/src/components/sylvestre/SylvestreLeaf.tsx), [`src/components/sylvestre/SylvestreIvyFrame.tsx`](file:///D:/Hibouxe/Site/src/components/sylvestre/SylvestreIvyFrame.tsx)) :
  - **Conception du Pétiole Organique** : Refonte de la géométrie SVG de la feuille (`viewBox="0 0 40 56"`). Ajout d'une véritable tige botanique à triple couche (ombre d'écorce sombre `#022c22` / `colors.stem`, cœur boisé `colors.shadow` et faisceau vasculaire `colors.main`) prolongeant la nervure centrale jusqu'au point d'ancrage.
  - **Point de Pivot Anatomique Réel** : Remplacement de l'ancien `transformOrigin: 'bottom left'` par un ancrage exact sur la base de la tige (`flip ? '58% 98%' : '42% 98%'`), garantissant que la tige reste fermement enracinée dans le bois lors de toute rotation ou animation de brise.
  - **Rameaux de Jonction Vectoriels** : Ajout de micro-chemins SVG de raccordement dans les coins de `SylvestreIvyFrame`, dessinant la ramification naturelle qui fait jaillir la tige directement hors de la liane.
- [x] **3. Dé-surcharge Visuelle & Épuration des Grilles du Catalogue** `[🟡 Palier 2 - Moyenne]` `(100% Déployé)` ([`src/components/gems/GemExplorerHome.tsx`](file:///D:/Hibouxe/Site/src/components/gems/GemExplorerHome.tsx), [`src/components/steam/SteamCatalogExplorer.tsx`](file:///D:/Hibouxe/Site/src/components/steam/SteamCatalogExplorer.tsx), [`src/components/sylvestre/SylvestreIvyFrame.tsx`](file:///D:/Hibouxe/Site/src/components/sylvestre/SylvestreIvyFrame.tsx)) :
  - **Allègement des Cartes de Jeux Répétées** : Suppression des cadres de lianes répétitifs (`<SylvestreIvyFrame density="delicate" />`) sur les 183 cartes du catalogue principal et sur les cartes du catalogue étendu. Chaque carte retrouve un pourtour émeraude et bois ciselé ultra-net (`overflow-hidden rounded-2xl`), éliminant plus de 700 éléments DOM superflus et dégageant totalement les captures et pastilles de prix.
  - **Désengorgement des 8 Défis Quotidiens & Cartes Trio** : Retrait des cadres surchargés sur les petites tuiles quotidiennes pour privilégier la lisibilité des icônes et des modes.
  - **Préservation Noble des Éléments Clés** : Les lianes et feuillages Sylvestre restent majestueusement réservés aux pièces maîtresses (Pépite du Jour / Hero Banner, Bandeau de Découverte, Barre de Filtrage principale et Modales d'exploration).
  - **Densité 'delicate' Re-calibrée** : Réduction du nombre de feuilles en mode délicat de 9 à 4 feuilles discrètes (2 en haut à gauche, 1 en haut à droite, 1 en bas à gauche), offrant une touche végétale subtile et aérée.
- [x] **4. Alignement Géométrique Strict de l'Arrondi des Tiges avec le Border-Radius des Cadres** `[🟡 Palier 2 - Moyenne]` `(100% Déployé)` ([`src/components/sylvestre/SylvestreIvyFrame.tsx`](file:///D:/Hibouxe/Site/src/components/sylvestre/SylvestreIvyFrame.tsx), [`src/components/sylvestre/SylvestreCornerIvy.tsx`](file:///D:/Hibouxe/Site/src/components/sylvestre/SylvestreCornerIvy.tsx), [`src/components/sylvestre/SylvestreHudFrame.tsx`](file:///D:/Hibouxe/Site/src/components/sylvestre/SylvestreHudFrame.tsx)) :
  - **Diagnostic Résolu** : Auparavant, les tiges/lianes dans les coins utilisaient une courbe de Bézier arbitraire et trop serrée (`Q 2 8 16 3`, rayon ~6px) avec un décalage CSS (`-top-1 -left-1`), tandis que les cadres portaient un `border-radius: 24px` (`rounded-3xl`) ou `16px` (`rounded-2xl`). Cela créait un décalage visible où la liane coupait le virage ou flottait en dehors de la bordure en bois. De plus, sur `SylvestreHudFrame`, des équerres métalliques à angle aigu (rayon 2px) se superposaient au cadre de liane.
  - **Tracé d'Arc Circulaire Conscient du Rayon (A R R 0 0 1)** : `SylvestreIvyFrame` intègre désormais le calcul direct du rayon (`rounded?: '2xl' | '3xl'`, R=24px par défaut, centre de filet R=23px) : le chemin vectoriel utilise `A 23 23 0 0 1 24 1` (ou `A 15 15 0 0 1 16 1`), assurant une concentricité mathématique parfaite au pixel près avec le biseau en bois du cadre.
  - **Ancrage Millimétrique des Feuilles** : Positionnement en coordonnées absolues exactes des feuilles (`style={{ left: 37, top: -16 }}` pour la feuille du haut, `style={{ left: -4, top: 27 }}` pour la feuille latérale), faisant coïncider la base de chaque tige avec la liane et la tranche du cadre sans aucun flottement.
  - **Résolution du Conflit de Superposition** : Dans `SylvestreHudFrame`, les équerres métalliques ne sont plus rendues lorsque `withIvy` est actif, évitant tout chevauchement de rayons hétérogènes. Harmonisation des modales restantes vers `rounded-3xl`.
- [x] **5. Ondulation Organique, Enroulement 3D & Confinement Strict aux 4 Coins** `[🟡 Palier 2 - Moyenne]` `(100% Déployé)` ([`src/components/sylvestre/SylvestreIvyFrame.tsx`](file:///D:/Hibouxe/Site/src/components/sylvestre/SylvestreIvyFrame.tsx)) :
  - **Confinement Strict aux Angles (Élimination des Tracés Bugués)** : Suppression intégrale des lianes de traverse étirées horizontalement et verticalement (`preserveAspectRatio="none"` ou lignes latérales) qui subissaient des déformations sur mobile, petites cartes et modales. Les lianes et feuillages sont désormais concentrés à 100% sur les 4 angles du cadre (`w-16 h-16`, 64px auto-contenus).
  - **Respect Géométrique Absolu des Arrondis** : La liane vertébrale épouse la courbure circulaire exacte (`rounded-3xl` / `rounded-2xl`) sans coupure d'angle ni débordement.
  - **Double Brin Tressé Organique** : Une seconde liane grimpante entrelacée (`windingRunnerPath`, `#047857` et liseré `#6ee7b7`) ondoie avec fluidité le long du contour.
  - **Boucles d'Enroulement 3D autour du Bois** : Micro-anneaux d'enroulement à l'entrée et à la sortie de chaque coin qui passent par-dessus et sous le montant en bois pour un effet de lierre qui agrippe la bordure.
  - **Vrilles Botaniques à Ressort & Nœuds Végétaux** : Vrille spiralée à l'apex et nœuds de sève renforçant l'anatomie végétale des départs de feuilles.
  - **Correction du Décalage vers le Haut des Vignes Inférieures** : Remplacement des classes CSS de retournement (`-scale-y-100`) sur les balises `<svg>` par des matrices de transformation vectorielles natives SVG (`<g transform="translate(...) scale(...)">`). Les classes CSS de scale sur `<svg>` souffraient d'un `transform-origin` à `0 0` dans certains navigateurs, projetant les angles inférieurs vers le haut. L'ancrage au biseau de bois est désormais rigoureusement symétrique et stable sur tous les coins.
- [x] **6. Élimination des Taches & Halos Diffus en Fond d'Écran** `[🟢 Palier 1 - Faible]` `(100% Déployé)` ([`src/components/common/FirefliesBackground.tsx`](file:///D:/Hibouxe/Site/src/components/common/FirefliesBackground.tsx), [`src/components/gems/GemExplorerHome.tsx`](file:///D:/Hibouxe/Site/src/components/gems/GemExplorerHome.tsx), [`src/index.css`](file:///D:/Hibouxe/Site/src/index.css)) :
  - **Suppression des Blocs Flous Diffus (`blur-3xl`, `blur-[100px]`)** : Retrait des conteneurs circulaires floutés qui généraient des taches jaunâtres et verdâtres étalées en arrière-plan (notamment au-dessus des titres et bannières).
  - **Homogénéisation du Fond Nocturne (`body`)** : Remplacement du `radial-gradient` elliptique par un dégradé linéaire uniforme et profond (`linear-gradient(180deg, #020f0a 0%, #010a07 35%, #010604 100%)`).
  - **Affinement des Lucioles & Particules** : Remplacement des gros halos radiaux étalés par de fines étincelles féeriques nettes et brillantes, évitant tout aspect de "tache grasse" sur écran sombre.
- [x] **7. Résolution Définitive du Décalage Vers le Haut des Vignes Inférieures (`aled.png`)** `[🔴 Palier 3 - Élevée]` `(100% Déployé)` ([`src/components/sylvestre/SylvestreIvyFrame.tsx`](file:///D:/Hibouxe/Site/src/components/sylvestre/SylvestreIvyFrame.tsx), [`src/index.css`](file:///D:/Hibouxe/Site/src/index.css)) :
  - **Diagnostic Chirurgical du Décalage de 16px** : Dans Tailwind CSS v4, les conteneurs avec espacement vertical (`space-y-3.5`, `space-y-4`...) appliquent la règle `:is(.space-y-* > :not(:last-child)) { margin-block-end: ... }`. `SylvestreIvyFrame` étant inséré en premier enfant du conteneur, il recevait un `margin-bottom: 14px` (ou 16px). En CSS pour un élément `position: absolute; inset: 0;`, cette marge réduit directement la hauteur calculée de l'élément (`height = container_height - margin_bottom`), ce qui rehaussait la ligne de base inférieure (`bottom: 0`) de 16px vers le haut.
  - **Alignement Exact au Biseau Extérieur (`border-2`)** : L'utilisation de `inset: 0` positionnait l'élément sur la boîte de padding (2px à l'intérieur du bois). En passant à des coordonnées outer-border (`top: -borderOffset, left: -borderOffset, right: -borderOffset, bottom: -borderOffset` avec `borderOffset = 2px` par défaut), la liane s'aligne mathématiquement à 0px de décalage avec le `border-radius: 24px` (`rounded-3xl`) du cadre.
  - **Immunité Totale contre les Marges Parentales** : Application de `margin: 0 !important; margin-block-start: 0 !important; margin-block-end: 0 !important;` via règle globale CSS dédiée `[data-sylvestre-ivy-frame="true"]` et styles inline directs. Le cadre de liane est désormais rigoureusement collé aux 4 coins sur n'importe quel conteneur (barre de recherche, modales, grilles).

---

### 🃏 35. Système de Boosters de Cartes à Échanger Indés (Trading Cards) (À FAIRE — Prochaine Version)
- [ ] **1. Spécification & Modèle de Données des Cartes Indés (`TradingCard`)** `[🟡 Palier 2 - Moyenne]` :
  - Définition du schéma de carte : ID unique, identifiant du jeu lié (parmi les 183 pépites certifiées), titre du jeu, studio créateur, illustration signature HD / pixel-art, citation / anecdote de développement, rareté (*Commune ⚪, Peu Commune 🟢, Rare 🔵, Épique 🟣, Légendaire 🟡*), finition (*Standard, Foil Brillante ✨, Holographique Mystique 🌌*) et numéro de série dans la collection.
  - Modèle de booster pack (`BoosterPack`) : Nom du paquet (ex: *Booster Sanctuaire Sylvestre*, *Booster Rétro Pixel*, *Booster Métroidvania & Action*, *Booster Roguelike & Cartes*), nombre de cartes par paquet (ex: 3 à 5 cartes), table de tirage pondérée (drop rates avec garantie d'au moins 1 carte Rare ou supérieure).
- [ ] **2. Économie & Mécanismes d'Obtention des Boosters** `[🟡 Palier 2 - Moyenne]` :
  - **Récompense de Série Quotidienne (Streaks)** : Attribution d'un booster bonus tous les 7 jours consécutifs de jeu ou lors de la réalisation du Grand Chelem quotidien (8/8 disciplines complétées).
  - **Boutique du Sanctuaire** : Achat de boosters avec les Plumes d'Or 🪶 gagnées en jouant (ex: 30 plumes pour un booster standard, 75 plumes pour un booster thématique premium).
  - **Trophées & Défis de l'Arcade / Time Attack** : Nouveaux succès débloquant des boosters exclusifs lors de l'atteinte de certains paliers de score.
- [ ] **3. Cérémonie d'Ouverture Interactive & Animation 3D (Booster Pack Opening)** `[🟠 Palier 3 - Élevée]` :
  - Modale dédiée d'ouverture avec rendu interactif du sachet scellé sous lueur dorée.
  - Geste tactile / clic de glissement pour déchirer le haut du paquet avec particules d'étincelles et bruitage Web Audio de papier d'aluminium froissé.
  - Découverte palpitante carte par carte (retournement 3D CSS `rotateY(180deg)`), halo lumineux coloré selon la rareté dévoilée et effet de brillance iridescente (shader CSS holographique) réagissant au mouvement du gyroscope/souris sur les cartes Foil.
- [ ] **4. Classeur Virtuel & Galerie de Collection (Binder View)** `[🟡 Palier 2 - Moyenne]` :
  - Vue album de collectionneur intégrée dans la modale de profil avec pochettes transparentes, classement par jeu et jauges de complétion par saga.
  - Détection automatique et empilement des doublons avec badge compteur (`x2`, `x3`...).
- [ ] **5. Système d'Échange Sécurisé entre Compagnons (Trading Hub)** `[🟠 Palier 3 - Élevée]` :
  - Salle de troc avec les amis du Cercle des Compagnons : sélection de cartes en double à proposer, sélection des cartes convoitées chez l'ami, et confirmation bilatérale asynchrone sécurisée par token via l'API souveraine.
  - Possibilité de générer un lien ou code d'échange public pour troquer sur le Perchoir / Tchat communautaire.
- [ ] **6. Crafting de Badges, Titres de Profil & Émotes** `[🟢 Palier 1 - Faible]` :
  - Mécanique de recyclage des sets complets : réunir toutes les cartes d'un jeu permet de forger le **Badge Collector** du jeu, un titre de profil honorifique et une émote exclusive utilisable dans le salon de tchat.




