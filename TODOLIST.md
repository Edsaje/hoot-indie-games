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

### 🕹️ 3. Nouvel Onglet Dédié "Arcade" & Finitions
- [ ] **Création de la vue Arcade dédiée** :
  - Ajouter la route/onglet `arcade` dans [`src/components/common/Navbar.tsx`](file:///src/components/common/Navbar.tsx) et [`src/App.tsx`](file:///src/App.tsx).
  - Retirer l'encart d'arcade du Perchoir.
- [ ] **Expérience plein écran & bornes d'arcade** :
  - Page immersive avec sélecteur visuel des 8 jeux (Snake, Pong, Casse-Briques, Flappy Hibou, Invaders, Forest Run, Tetris, Mine Storm Vectrex).
  - Gestion des high scores persistants par jeu.
- [ ] **Équilibrage et vitesse des mini-jeux** :
  - Valider que la boucle 60 FPS reste stable et calibrée à vitesse humaine sur tous les écrans (60Hz, 120Hz, 144Hz, mobile).
  - Améliorer les contrôles tactiles sur smartphone.

---

### 🦉 4. Réhabilitation de l'Onglet "Le Perchoir"
- [ ] **Remplacement des textes génériques** :
  - Mettre à jour [`src/data/roostProjects.ts`](file:///src/data/roostProjects.ts) avec les vrais projets de Quentin Beaud.
  - Ajouter les véritables vidéos/essais de la chaîne YouTube **@Hibouxe**.
  - Intégrer les vrais liens de dépôts GitHub (@Edsaje).
  - Rédiger une biographie d'auteur sincère et professionnelle.

---

### 🎮 5. Renommage des Modes Principaux & Suggestions Steam
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
