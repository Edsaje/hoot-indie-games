# 🦉 Prompt Maître d'Audit Holistique pour Gemini Pro
> **Guide d'utilisation** : Copiez-collez l'intégralité du prompt ci-dessous dans Gemini Pro (ou dans votre session d'audit IA) pour lancer un audit exhaustif, rigoureux et sans complaisance de toutes les fonctionnalités de la plateforme **Hoot Indie Games**.

---

```markdown
# 🦉 MISSION D'AUDIT TECHNIQUE, FONCTIONNEL & UX — HOOT INDIE GAMES

## 1. CONTEXTE & RÔLE ATTENDU
Tu agis en tant que **Principal Software Architect, Lead QA Engineer & Expert Senior Fullstack (React 19 / TypeScript Strict / Tailwind CSS v4 / PHP Souverain / OWASP / Mobile-First UX)**.

Ta mission est de réaliser un **audit 360° exhaustif, méthodique et sans complaisance** de l'ensemble de la plateforme web **Hoot Indie Games** (sanctuaire bilingue dédié aux jeux vidéo indépendants).

Le projet est structuré selon les standards industriels les plus stricts :
- **Frontend** : React 19, TypeScript strict (zéro `any`), Vite, Tailwind CSS v4 (`@tailwindcss/vite`), Framer Motion, Web Audio API synthétique native (`src/utils/audio.ts`), i18next (FR/EN/ES/DE/JA/PT-BR).
- **Backend Souverain** : Scripts PHP légers dans `public/api/` manipulant des banques de données JSON sous verrouillage atomique concurrent `LOCK_EX`.
- **Règles Primordiales Inviolables** :
  1. **ZÉRO Scroll Horizontal** : Aucun défilement horizontal n'est toléré sur l'ensemble du site (privilégier les grilles réactives, flex-wrap et drawers mobiles).
  2. **Mobile-First Radical** : Cibles tactiles minimum 44x44px, modales adaptées aux écrans smartphones, navigation fluide.
  3. **Sécurité & Anti-Triche** : Zéro fuite des réponses du jour dans le DOM (`alt`, `title`, state global), sanitisation anti-XSS intégrale, rate-limiting, conformité RGPD cookieless.
  4. **Parité Parfaite Cartes & Pépites** : 262 pépites certifiées / 262 cartes TCG conformes / 405 jeux répertoriés au Catalogue.

---

## 2. PÉRIMÈTRE D'AUDIT : LES 12 PILIERS FONCTIONNELS

Examine scrupuleusement le code source, la logique métier, la gestion d'état, la réactivité et les flux de chacun des 12 piliers suivants :

### 🔍 PILIER 1 — DÉCOUVERTE & EXPLORATION DU CATALOGUE
- **Pépites Certifiées (256)** : Navigation, filtres (genres, prix, note Steam, support manette, dates), tri dynamique.
- **Catalogue Étendu (405 jeux)** : Moteur de recherche instantané, pagination fluide, filtres avancés.
- **Micro-Indés (itch.io)** : Vitrine des créations alternatives, tags, liens externes sécurisés (`noopener, noreferrer`).
- **Sous-navigation Découverte (`DiscoverySubNav.tsx`)** :
  - Badge **doré** à côté de « Pépites » affichant le compte exact certifié (256).
  - Badge **vert émeraude** à côté de « Catalogue » affichant le compte étendu (405).
  - Traduction réactive i18n sans clé brute non traduite.
- **Fiches Détaillées des Jeux** : Jaquettes optimisées, captures, trailers vidéo, tags, avis Steam certifiés, bouton d'ajout aux favoris.

### 🎮 PILIER 2 — LES 8 JEUX QUOTIDIENS DE CULTURE INDÉ
Vérifie pour chaque jeu le déterminisme quotidien (seed par date `YYYY-MM-DD`), l'anti-spoil DOM, la persistance `localStorage`, le système de streaks et la distribution des scores :
1. **Screenle** : Défloutage progressif d'une capture d'écran de jeu indé en 6 essais.
2. **Indledle** : Type "Wordle" avec indices de couleur sur l'année, le studio, les genres, le prix et la popularité.
3. **Linkle** : Grille 4x4 type "Connections", 4 groupes thématiques, gestion des 4 erreurs max et regroupement visuel animé.
4. **Profille** : Déduction progressive du jeu mystère via ses tags, sa description tronquée et ses indices audio.
5. **Chrono** : Replacement chronologique de dates de sortie de jeux indés sous pression temporelle.
6. **Pixel** : Reconstitution d'un visuel clé par dé-pixelisation progressive.
7. **Review** : Deviner le jeu à partir d'avis Steam authentiques (positifs, drôles ou insolites).
8. **Blind Test** : Reconnaissance musicale d'OST de jeux indés via synthétiseur Web Audio API / extraits.
- **Fonctions transverses** : Calendrier d'archives, bouton de partage format texte spoiler-free (carrés de couleur), modal de statistiques de réussite.

### 🌲 PILIER 3 — L'ODYSSÉE SYLVESTRE (IDLE GAME / RPG POKÉDEX)
- **Moteur Incrémental (`odysseyEngineService.ts`)** : Calcul des dégâts par clic, DPS passif, sève d'étoiles, bonus d'échos sauvages.
- **Progression Biomes & Routes** :
  - 6 biomes thématiques et 5 routes par biome.
  - **Échec du Boss (Route 5)** : Minuterie de 30 secondes. En cas d'échec (`timeLeft <= 0`), repli immédiat automatique vers la route précédente (Route 4) et désactivation immédiate de l'auto-progression avec sauvegarde.
  - Sauvegarde et restauration fidèle de la route exacte où se trouvait le joueur en quittant le jeu.
- **Capture des 256 Monstres Indés** : Taux d'apparition, captures garanties, variantes **Holo rares (1/100)** avec reflets holographiques CSS.
- **Arbre Céleste de Talents (`CelestialTreeView.tsx`)** : Arbre de compétences débloquable avec la sève d'étoiles, calcul des multiplicateurs.
- **Compagnons de Route (`CompanionsDexView.tsx`)** : Bonus passifs cumulatifs.
- **Statistiques Célestes (`OdysseyStatsView.tsx`)** : Suivi des monstres vaincus par route, kills totaux, taux de complétion.
- **Carte du Monde (`OdysseyWorldMap.tsx`) & Menu de Sélection (`OdysseyRouteBurgerMenu.tsx`)** :
  - **Zéro scroll horizontal** : Remplacement des rubans défilants par des grilles responsives 3x2 / 6 colonnes et sélecteur de routes 1-clic.
- **Mini-HUD Flottant Mobile (`OdysseyMiniHud.tsx`)** :
  - **Désactivé par défaut sur téléphone mobile (< 768px)** pour préserver l'espace d'écran.
  - **Case à cocher d'activation persistante** avec icône smartphone dans l'interface de combat.
  - Persistance dans `OdysseySaveState` et `localStorage` (`hoot_odyssey_hud_mobile_enabled`).
  - Bouton de fermeture directe `✕` sur mobile.
- **Gains Hors-Ligne (`OdysseyOfflineModal.tsx`)** : Calcul mathématique exact du DPS passif durant l'absence du joueur (plafonné à 8-24h) et modale de réclamation au retour.

### 🕹️ PILIER 4 — SALLE D'ARCADE (ACTION & HIGH-SCORES 60 FPS)
- **6 Jeux d'Arcade HTML5 Canvas** : Flappy Owl, Owl Jump, Retro Runner, Brick Breaker, Snake Owl, Space Owl.
- **Contrôles & Fluidité** : Boucle `requestAnimationFrame`, 60 fps constants, adaptation tactile mobile, zéro lag.
- **Validation des Scores** : Anti-cheat de base, enregistrement des meilleurs scores, attribution des plumes sylvestres.

### 🪶 PILIER 5 — ÉCONOMIE DE PLUMES & GARDE-ROBE SYLVESTRE
- **Système de Plumes (`featherEconomy.ts`)** : Obtention via victoires de mini-jeux, streaks, hauts faits et scores d'arcade.
- **Boutique du Perchoir (`FeatherShopModal.tsx`)** : Cadres de profil animés (Feu follet, Émeraude stellaire, etc.), titres honorifiques, déblocage d'avatars exclusifs.
- **Persistance & Équipement** : Répercussion immédiate du cadre et du titre équipés dans la Navbar, le profil et le tchat.

### 🎴 PILIER 6 — SYSTÈME DE CARTES & CLASSEUR (TCG BINDER)
- **262 Cartes Uniques** : Parité 1:1 stricte avec les pépites certifiées du sanctuaire.
- **Niveaux de Rareté** : Commune, Rare, Épique, Légendaire, Mythique.
- **Ouverture de Boosters (`BoosterOpeningModal.tsx`)** : Tirage de 3 cartes, animations de révélation avec sound design Web Audio, gestion des doublons.
- **Classeur Interactif (`CardsBinderView.tsx`)** : Affichage grille sans débordement horizontal, filtres par rareté, statistiques de possession.
- **Système d'Échanges P2P (`TradeModal.tsx`)** : Proposition d'échanges de cartes entre joueurs, acceptation, historique.

### 💬 PILIER 7 — COMMUNAUTÉ & MESSAGERIE PRIVÉE DIRECTE
- **Le Perchoir (Tchat Public)** : Salons linguistiques (Global, FR, EN, ES, DE, JA, PT-BR) et canal Feedback.
- **Messagerie Privée Directe (`ChatPrivateView.tsx`, `ChatProvider.tsx`, `chat.php`)** :
  - **Accusés de réception synchronisés en temps réel** :
    - 1 encoche verte (`Check`, `text-emerald-400`) = message envoyé / délivré.
    - 2 encoches cyan (`CheckCheck`, `text-cyan-300`) = message lu par le destinataire.
    - Mise à jour en direct dès que le destinataire ouvre le fil, sans devoir fermer ou recharger la page.
    - Détection de présence active (`activeViewers`) côté backend et frontend.
    - En-têtes anti-cache stricts (`Cache-Control: no-store, no-cache`) et paramètre `_t` timestamp pour interdire les réponses 304 périmées.
    - Synchronisation inter-onglets instantanée via écouteurs `storage` et `hoot_private_store_updated`.
  - **Bouclier Anti-Arnaque & Anti-Phishing** : Détection des liens malveillants et requêtes sensibles.
  - **Filtre Bienveillance & Modération** : Détection des propos injurieux.
  - **Règle Compagnons Mutuels Stricts** : Seuls les amis réciproques ou le Fondateur Hibouxe/staff peuvent échanger des messages privés.

### 🛡️ PILIER 8 — ADMINISTRATION & MODÉRATION SOUVERAINE
- **Panel Administrateur (`AdminDashboardModal.tsx`, `AdminGamesManager.tsx`)** :
  - Authentification inviolable par clé admin sécurisée ou Steam ID administrateur.
  - Gestion des 262 pépites (ajout, modification, audit, taglines bilingues FR/EN).
  - Gestion des utilisateurs (bannissements, avertissements, attribution de rôles VIP/Modérateur).
  - Modération des messages signalés dans le tchat public.

### ⚙️ PILIER 9 — BACKEND PHP SOUVERAIN (`public/api/*.php`)
- **Isolation & Atomicité** : Utilisation systématique de `LOCK_EX` lors de l'écriture dans `chat_messages.json`, `private_conversations.json`, `friends_data.json`.
- **Protection Anti-Injection & Sanitisation** : `htmlspecialchars`, `strip_tags`, `normalizeChatUsername`.
- **Rate-Limiting IP** : Protection anti-spam sans cookies intrusifs.

### 📱 PILIER 10 — RESPONSIVE DESIGN MOBILE-FIRST & ERGONOMIE
- **Tolérance Zéro pour l'Overflow Horizontal** : Aucune barre de défilement horizontal visible ou cachée causant des glissements latéraux involontaires.
- **Composants Tactiles** : Touch targets 44x44px minimum, feedback tactile `active:scale-95`, menus déroulants et burger drawer fluides.
- **Gestion des Modales** : Fermeture au clic extérieur, touche Escape, défilement interne propre.

### ⚡ PILIER 11 — PERFORMANCE, ROBUSTESSE & CODE QUALITY
- **Compilation TypeScript Strict** : `npm run build` (`tsc -b && vite build`) doit réussir sans la moindre erreur.
- **Règles Linter** : `npm run lint` sans erreurs bloquantes.
- **Audit Base de Données** : `npm run audit-db` (`scripts/verifySteamDatabase.ts`) doit valider 100% des 262 pépites sans incohérence.
- **Gestion de la Mémoire** : Nettoyage systématique des `setInterval`, `setTimeout`, et `requestAnimationFrame` dans les retours de `useEffect`.

### 🌍 PILIER 12 — INTERNATIONALISATION (i18n) & RÉFÉRENCEMENT (SEO)
- **i18n Intégral** : Absence de textes en dur non traduits dans les composants clés.
- **SEO & Métadonnées** : Balises OpenGraph, Twitter Cards, JSON-LD Schema.org (FAQPage, ItemList, SiteNavigationElement) générés dans `index.html`.

---

## 3. FORMAT DU RAPPORT D'AUDIT ATTENDU

Pour chaque pilier examiné, structure tes conclusions selon la grille suivante :

```markdown
### [Nom du Pilier / Composant]
- **Statut Global** : ✅ Conforme | ⚠️ Risque Identifié | ❌ Anomalie / Régression
- **Points Forts & Robustesse** : Ce qui est parfaitement implémenté et respecte les standards.
- **Anomalies / Vulnérabilités Détectées** : Description précise du bug, cas limite (edge case), fuite mémoire potentielle ou faille de sécurité.
- **Fichiers & Lignes concernés** : Liens précis vers les fichiers (`src/...`, `public/api/...`).
- **Correction Recommandée (Code Diff / Solution)** : Fournis le code exact ou la démarche technique pour résoudre le problème.
```

Termine ton rapport par :
1. **Un Tableau Récapitulatif des Anomalies par Sévérité** (Critique, Majeure, Mineure, Cosmétique/Confort).
2. **Une Checklist Immédiate des Correctifs Prioritaires** classés par ordre d'impact utilisateur.
3. **Le Score Global de Santé du Sanctuaire** (sur 100%).

---
*Fin du Prompt d'Audit. Tu peux maintenant lancer l'analyse approfondie du dépôt.*
```
