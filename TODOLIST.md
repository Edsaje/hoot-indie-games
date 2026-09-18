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

---

## 📋 Chantiers Prioritaires

### 🛡️ 1. Cybersécurité & Robustesse
- [ ] **Audit XSS & injection d'URLs** :
  - Sécuriser l'input d'import Steam (rejeter les protocoles `javascript:`, validation stricte des domaines autorisés et des AppIDs numériques).
  - Nettoyer tout rendu HTML potentiel dans les champs dynamiques (taglines, descriptions).
- [ ] **En-têtes HTTP de sécurité (.htaccess & serveur)** :
  - Déployer les en-têtes recommandés : `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, CSP.
  - Vérifier l'étanchéité de [`public/api/.htaccess`](file:///public/api/.htaccess) pour bloquer tout accès web direct aux fichiers `.json`, `.secret`, `.admin_pass`.
- [ ] **Anti-Spoiler & Intégrité du jeu quotidien** :
  - S'assurer que les solutions des défis quotidiens ne sont pas exposées en clair dans le DOM ou dans les balises d'attributs avant la fin de partie.
- [ ] **Sanitisation & Clés Supabase** :
  - S'assurer qu'aucune clé privée secrète (service role) n'est jamais exposée côté client Vite.

---

### ⚔️ 2. Réparation et Vrai Multijoueur 1v1
- [ ] **Remplacer la fausse simulation de salon** :
  - Actuellement, le duel d'amis génère un code mais fait jouer contre un bot local (`Rival #CODE`).
- [ ] **Implémenter une vraie synchronisation multijoueur** :
  - Option WebRTC P2P (PeerJS) ou Supabase Realtime Channels (Broadcast + Presence).
  - Les deux joueurs partagent le même salon, reçoivent la même image de jeu au même instant, et voient les propositions et pénalités de l'autre en direct.
- [ ] **Labellisation honnête du mode solo** :
  - Distinguer clairement le *"Duel 1v1 en direct"* (2 joueurs réels) du mode *"Entraînement contre le Grand-Duc (Chrono IA)"*.

---

### 🌿 3. Direction Artistique "Nature Sylvestre & Organique"
- [x] **Ambiance forêt nocturne globale** :
  - Fond d'ambiance ([`src/components/common/FirefliesBackground.tsx`](file:///src/components/common/FirefliesBackground.tsx)) enrichi avec des silhouettes vectorielles de canopée, branches d'arbres, brume forestière et mélange de lucioles dorées (60%) et de spores végétales bioluminescentes vert émeraude (40%).
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

### 🕹️ 5. Salle d'Arcade : Réparation & Ergonomie Mobile
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
- [ ] **Remplacement des textes génériques** :
  - Mettre à jour [`src/data/roostProjects.ts`](file:///src/data/roostProjects.ts) avec les vrais projets de Quentin Beaud.
  - Ajouter les véritables vidéos/essais de la chaîne YouTube **@Hibouxe**.
  - Intégrer les vrais liens de dépôts GitHub (@Edsaje).
  - Rédiger une biographie d'auteur sincère et professionnelle.

---

### 🎮 8. Renommage des Modes Principaux & Suggestions Steam
- [ ] **Nouveaux noms des modes de jeu** :
  - Remplacer *Screenle*, *Indledle*, *Linkle*, *Versus* par les nouveaux intitulés choisis par l'utilisateur.
- [ ] **Système de Suggestion de Jeu** :
  - Transformer le panneau d'import de [`src/components/steam/SteamCatalogExplorer.tsx`](file:///src/components/steam/SteamCatalogExplorer.tsx) en formulaire de proposition.
  - Stocker la suggestion pour modération administrative (via webhook, API ou Supabase).

---

### 💡 6. Idées & Améliorations Futures
- [ ] **Share Card personnalisée** (export d'image ou grille emoji pour Discord / Twitter / Bluesky).
- [ ] **Support Manette (Gamepad API)** pour naviguer et jouer dans la Salle d'Arcade.
- [ ] **Filtre "Indés Francophones"** dans le catalogue de jeux.
- [ ] **Mode Blind Test Audio Indé** (reconnaître un jeu à sa musique culte).
