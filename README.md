# 🦉 Hoot Indie Games

> **Le sanctuaire quotidien officiel dédié aux jeux vidéo indépendants**
> Développé avec **React 18+**, **TypeScript (Strict, 0 `any`)**, **Tailwind CSS v4**, **i18next**, **Framer Motion**, **Web Audio API** et **Lucide Icons**.

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict_0_any-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb?logo=react)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Oxlint](https://img.shields.io/badge/Oxlint-0_warnings-emerald)](https://oxc.rs/)
[![Sécurité](https://img.shields.io/badge/Sécurité-Priorité_Absolue-red)](./GEMINI.md)
[![Licence](https://img.shields.io/badge/Auteur-Quentin_Beaud_(Hibouxe)-amber)](https://quentinbeaud.com/)

> 🛡️ **Règle Primordiale : La sécurité est notre priorité sur ce site.** Intégrité anti-triche, zéro fuite de données, protection contre les injections et respect absolu de la vie privée.

---

## 🌟 Présentation de la Plateforme

**Hoot Indie Games** est une plateforme web bilingue (**Français / Anglais**) conçue pour célébrer la culture, l'art et les mécaniques des pépites du jeu vidéo indépendant.

Elle combine en une interface unifiée :

1. **Trois mini-jeux quotidiens de déduction :**
   - 🔍 **Mode 1 : "Screenle"** — Déduction progressive par capture d'écran sur 6 niveaux de zoom / plans, avec indices de lore (accroche) et de musique (compositeur).
   - 📊 **Mode 2 : "Indledle"** — Comparaison d'attributs façon Wordle / Loldle : Année de sortie (`▲` / `▼`), superposition des genres (vert = exact, jaune = partiel, rouge = aucun), direction artistique, perspective caméra et studio de développement.
   - 🧩 **Mode 3 : "Linkle / Connections"** — Regroupement interactif de 16 jeux sous forme de jaquettes/captures en 4 catégories secrètes de 4 jeux, réparties en 4 niveaux de difficulté avec identité chromatique (Facile : Jaune moutarde `#eab308`, Moyen : Vert émeraude `#10b981`, Difficile : Bleu `#3b82f6`, Mystique : Violet `#8b5cf6`), compteur de plumes/erreurs et détection du "One away" (3 sur 4).
   - 🛠️ **Créateur de Linkle Communautaire** — Outil intégré permettant de composer ses propres grilles 4x4 et de les partager instantanément via un lien encodé dans l'URL hash (`#linkle=...`).

2. **Système de Succès & Plumes d'Or (11 Hauts Faits) :**
   - 🪶 Système d'achievements (*Premier Envol*, *Œil de Hibou*, *Harmonie Parfaite*, *Vigie Nocturne*, *Murmure des Bois*, *Tiercé Nocturne*...).
   - Fanfare audio polyphonique synthétisée par Web Audio API, toasts animés et compteur de plumes d'or dans la barre de navigation.

3. **Archives Quotidiennes & Calendrier Rétroactif :**
   - Calendrier interactif permettant de rejouer les défis de n'importe quelle date passée, avec indicateurs visuels des résultats (vert = gagné, rouge = échoué, gris = non joué).

4. **Cartes de Partage Réseaux Sociaux HD 1200x630 :**
   - Générateur Canvas 2D intégré créant une image de score haute résolution aux ratios officiels Twitter / Discord / OpenGraph en un clic.

5. 🧰 **Une boîte à outils / utilitaires pour joueurs :**
   - 🎲 **Roulette Indé du Soir** : Générateur aléatoire animé selon l'ambiance désirée (*Cozy*, *Action*, *Cérébral*, *Sombre*).
   - ⏳ **Calculateur de Backlog & Temps de Jeu** : Estimation précise du temps d'aventure total et projection calendaire de fin selon le rythme quotidien.
   - 💰 **Optimiseur de Soldes Steam** : Algorithme glouton maximisant le ratio note / heures de jeu pour un budget donné en euros.
   - 🧭 **Explorateur de Pépites** : Filtre multicritères par genre, année et studio avec liens Steam directs.
   - ❓ **Mini-Quiz Lore & Trivia** : Questions interactives avec anecdotes de game design.
   - 🔥 **Radar des Sorties Indés** : Suivi des jeux indés attendus avec jauge de hype et wishlists Steam (*Silksong*, *Mewgenics*, *Earthblade*, *Possessor(s)*, *Wanderstop*, *Citizen Sleeper 2*, etc.).

6. 🪶 **L'espace vitrine "The Roost / Le Perchoir" :**
   - Mise en valeur des projets, prototypes et vidéos signés par **Quentin Beaud (Hibouxe / Edsaje)** :
     - *La Forêt du Hibou* (Canvas 2D & particules)
     - *Mine Storm Vectrex Revival* (Arcade vectorielle cathodique 1982)
     - *Hibou Clicker : Plumes Célestes* (Incrémental & prestige céleste)
     - *Hibouxe Lore Analyst* (Essais vidéo & analyses narratives YouTube @Hibouxe)
     - *La Salle d'Arcade Secrète* (7 mini-jeux rétro)
     - *Donjon de Naheulbeuk 2.0* (Moteur tactique au tour par tour)

---

## 🎨 Identité Visuelle & Thème

- **Palette Nocturne Ardoise** :
  - Fond d'écran principal : `#0b0f19` avec micro-poussières d'étoiles et **moteur de lucioles interactives** (`FirefliesBackground.tsx`)
  - Cartes et conteneurs : `#131a29`
  - Bordures structurales nettes : `#1e293b`
  - Accentuation or / ambre : `#f59e0b`
- **Codes Couleurs de Jeu & Feedback** :
  - Vert émeraude : `#10b981` (Exactitude / Victoire)
  - Jaune moutarde : `#eab308` (Partiel / Catégorie Facile)
  - Rouge brique : `#ef4444` (Erreur / Incohérence)
  - Bleu saphir : `#3b82f6` (Catégorie Difficile)
  - Violet mystique : `#8b5cf6` (Catégorie Expert / Compositeur)
- **Easter Egg du Hibou** :
  - Survol prolongé (>750ms) ou double-clic sur l'icône de hibou dans la barre de navigation : les yeux s'allument en ambre vibrant avec pulsation continue (`owl-eye-pulsing`), un hululement Web Audio retentit et ouvre le modal secret du hibou.

---

## 🏗️ Arborescence Technique du Projet

```
src/
├── types/
│   ├── game.ts                    # Types stricts (Game, ConnectionCategory, DailyConnectionsPuzzle)
│   └── achievements.ts            # Schéma des 11 succès & plumes d'or
├── data/
│   ├── games.ts                   # Base de 83 jeux certifiés (1080p screenshots & métadonnées)
│   ├── upcomingGames.ts           # Radar des sorties indés attendues
│   ├── achievements.ts            # Définitions des 11 succès
│   ├── connectionsPuzzles.ts      # Énigmes quotidiennes de Connections
│   └── roostProjects.ts           # Créations, prototypes et liens d'Hibouxe
├── i18n/
│   ├── index.ts                   # Configuration i18next & persistance LocalStorage
│   └── locales/
│       ├── fr.json                # Traductions françaises complètes
│       └── en.json                # Traductions anglaises complètes
├── context/
│   ├── GameStatsContext.ts        # Contexte des stats & streaks
│   ├── GameStatsProvider.tsx      # Provider stats & persistance
│   ├── useGameStats.ts            # Hook useGameStats
│   ├── AchievementsContext.ts     # Contexte des succès
│   ├── AchievementsProvider.tsx   # Provider succès, toasts & sons
│   └── useAchievements.ts         # Hook useAchievements
├── utils/
│   ├── audio.ts                   # Synthétiseur Web Audio API (zéro dépendance externe)
│   └── generateShareCard.ts       # Générateur de carte de partage Canvas 1200x630
├── components/
│   ├── common/
│   │   ├── Navbar.tsx             # Barre de navigation, date, langue, son, stats & plumes
│   │   ├── Footer.tsx             # Pied de page & signatures
│   │   ├── OwlLogo.tsx            # Logo SVG interactif avec yeux ambrés animés
│   │   ├── StatsModal.tsx         # Graphique de répartition des essais & streaks
│   │   ├── AchievementsModal.tsx  # Galerie des succès & compteur de plumes
│   │   ├── CalendarArchiveModal.tsx # Calendrier de rétro-jeu
│   │   ├── FirefliesBackground.tsx# Toile Canvas 2D ambiante
│   │   ├── OwlEasterEggModal.tsx  # Fenêtre secrète du hibou
│   │   ├── SocialIcons.tsx        # Icônes SVG optimisées (GitHub, YouTube)
│   │   └── GameSearchBar.tsx      # Recherche prédictive avec vignettes
│   ├── screenle/
│   │   └── ScreenleGame.tsx       # Mode 1 : Zoom 6 étapes, indices & share card
│   ├── indledle/
│   │   └── IndledleGame.tsx       # Mode 2 : Comparaison de caractéristiques & share card
│   ├── linkle/
│   │   ├── LinkleGame.tsx         # Mode 3 : Grille 4x4 & share card
│   │   └── CustomLinkleBuilder.tsx# Constructeur de puzzle personnalisé avec URL hash
│   ├── toolbox/
│   │   └── ToolboxHub.tsx         # Hub avec Roulette, Backlog, Soldes, Radar & Quiz
│   └── roost/
│       └── TheRoostHub.tsx        # Vitrine créative d'Hibouxe
├── App.tsx                        # Routage des onglets, clés temporelles & modaux
├── main.tsx                       # Point d'entrée React 18
└── index.css                      # Thème Tailwind v4 & animations
```

---

## ⚡ Commandes Disponibles

```bash
# Lancement en développement (Vite HMR)
npm run dev

# Vérification du typage et build de production (Strict)
npm run build

# Analyse de qualité de code (Oxlint, 0 warning garanti)
npm run lint

# Prévisualisation locale du bundle de production
npm run preview

# Moissonner un jeu depuis Steam et obtenir son objet TypeScript
npm run add-game <STEAM_APP_ID>

# Exécuter le moissonnage et la fusion par lot de la base
npm run update-db
```

---

## 📜 Règles pour Agents & Contributeurs

Tout agent AI (Gemini, Claude, GPT, etc.) ou développeur reprenant ce projet **DOIT respecter rigoureusement les règles consignées dans [`GEMINI.md`](./GEMINI.md)** :

1. **Règle Primordiale : La sécurité est notre priorité sur ce site** :
   - Subordonner la commodité et les fonctionnalités à la sécurité absolue.
   - Protection anti-triche et zéro fuite (anti-F12, anti-spoiler, données secrètes protégées).
   - Sanitisation systématique contre les injections (XSS, SQL, code dynamique banni).
   - Verrouillage des endpoints, rate-limiting, isolation `.htaccess` et respect de la vie privée (RGPD).
2. **Règle 0 Hallucination** :
   - Ne jamais inventer de dates, de jeux, de studios ou de métadonnées.
   - `src/data/games.ts` ne contient **QUE** des jeux réellement sortis et vérifiables.
   - Les jeux non parus résident exclusivement dans `src/data/upcomingGames.ts` avec la mention officielle (*TBA*).
3. **Typage Strict 0 `any`** :
   - `tsc -b` doit compiler sans la moindre erreur.
4. **Qualité de code** :
   - `npm run lint` (Oxlint) doit retourner 0 warning et 0 erreur.
5. **Anti "IA Slop"** :
   - Pas de pilules génériques géantes `rounded-full` sur les cartes de contenu.
   - Pas de faux glassmorphism laiteux illisible : surfaces sombres ciselées (`#0b0f19`, `#131a29`, `#1e293b`).

---

> © 2026 Hoot Indie Games — Développé pour Quentin Beaud (Hibouxe / Edsaje).
