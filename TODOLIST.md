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
- [ ] **Ambiance forêt nocturne globale** :
  - Enrichir le fond d'ambiance ([`src/components/common/FirefliesBackground.tsx`](file:///src/components/common/FirefliesBackground.tsx)) avec des silhouettes discrètes de canopée, branches d'arbres et brume forestière.
  - Ajouter des accents naturels dans la palette Tailwind : vert mousse/émeraude (`#064e3b`, `#047857`), nuances bois/écorce feutré.
- [ ] **Végétalisation & Identité du Perchoir (Portfolio)** :
  - Donner au Perchoir l'aspect d'une cabane d'observation sylvestre authentique (cadres d'écorce discrète, feuilles, lianes et lanternes de lucioles).

---

### 🌟 4. Accueil par Défaut : L'Explorateur de Pépites Indés
- [ ] **Définir l'Explorateur de Pépites comme route par défaut** :
  - Dans [`src/App.tsx`](file:///src/App.tsx), initialiser `currentTab` sur `'gems'` ou `'explore'` plutôt que `'screenle'`.
- [ ] **Interface d'accueil immersive** :
  - Section héro sylvestre avec la "Pépite du Jour" mise en vedette.
  - Grille de découverte filtrable par ambiance, genre et temps de complétion.
  - Raccourcis instantanés vers les 3 défis quotidiens et la salle d'arcade.

---

### 🕹️ 5. Nouvel Onglet Dédié "Arcade" & Réparation Mobile
- [ ] **Création de la vue Arcade dédiée** :
  - Ajouter la route/onglet `arcade` dans [`src/components/common/Navbar.tsx`](file:///src/components/common/Navbar.tsx) et [`src/App.tsx`](file:///src/App.tsx).
  - Retirer l'encart d'arcade du Perchoir.
- [ ] **Réparation mobile prioritaire des 8 jeux d'arcade** :
  - Résoudre les problèmes d'affichage et de réactivité sur smartphones.
  - Empêcher le défilement de page pendant le jeu (`touch-action: none`, `preventDefault` sur les touch events).
  - Intégrer un D-pad virtuel ergonomique et des boutons A/B confortables sur écran tactile.
  - Adapter le scaling du canvas pour tous les ratios d'écran et pixel ratios (Retina / OLED).
- [ ] **Équilibrage et vitesse des mini-jeux** :
  - Valider que la boucle 60 FPS reste stable et calibrée sur tous les taux de rafraîchissement (60Hz, 120Hz, 144Hz).
  - Gestion des high scores persistants par jeu.

---

### 🎯 6. Choix de Difficulté sur les Jeux Principaux
- [ ] **Sélecteur de difficulté pour chaque jeu** :
  - **Screenle** :
    - *Chouetteau (Facile)* : Zoom initial moins agressif, 6 essais + indice textuel dès la 2e erreur.
    - *Hibou (Standard)* : 6 étapes de zoom progressif classiques.
    - *Grand-Duc (Expert)* : Zooms ultra-serrés, flou accru, aucun indice bonus.
  - **Indledle** :
    - *Facile* : 8 essais, marges d'années colorées (±3 ans), genres partiels indiqués.
    - *Standard* : 6 essais classiques.
    - *Expert* : 4 essais seulement, indications strictes.
  - **Linkle** :
    - *Détente* : 6 erreurs tolérées, possibilité d'obtenir un indice de groupe.
    - *Standard* : 4 erreurs autorisées.
    - *Hardcore* : 1 seule erreur tolérée (mort subite).

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
