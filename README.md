# 🦉 Hoot Indie Games

> **Le sanctuaire quotidien officiel dédié aux jeux vidéo indépendants**
> Développé avec **React 18+**, **TypeScript (Strict)**, **Tailwind CSS v4**, **i18next**, **Framer Motion** et **Lucide Icons**.

---

## 🌟 Présentation de la Plateforme

**Hoot Indie Games** est une plateforme web bilingue (**Français / Anglais**) conçue pour célébrer la culture, l'art et les mécaniques des pépites du jeu vidéo indépendant.

Elle combine en une interface unifiée :
1. **Trois mini-jeux quotidiens de déduction :**
   - 🔍 **Mode 1 : "Screenle"** — Déduction progressive par capture d'écran sur 6 niveaux de zoom / plans, avec indices de lore (accroche) et de musique (compositeur).
   - 📊 **Mode 2 : "Indledle"** — Comparaison d'attributs façon Wordle / Loldle : Année de sortie (indicateur `▲` / `▼`), superposition des genres (vert = exact, jaune = partiel, rouge = aucun), direction artistique, perspective caméra et studio de développement.
   - 🧩 **Mode 3 : "Linkle / Connections"** — Regroupement interactif de 16 jeux sous forme de jaquettes/captures en 4 catégories secrètes de 4 jeux, réparties en 4 niveaux de difficulté avec identité chromatique (Facile : Jaune moutarde `#eab308`, Moyen : Vert émeraude `#10b981`, Difficile : Bleu `#3b82f6`, Mystique : Violet `#8b5cf6`), compteur de plumes/erreurs et détection du "One away" (3 sur 4).
2. 🧰 **Une boîte à outils / utilitaires pour joueurs :**
   - 🎲 **Roulette Indé du Soir** : Générateur aléatoire animé selon l'ambiance désirée (Détente, Action, Cérébral, Sombre).
   - ⏳ **Calculateur de Backlog & Temps de Jeu** : Estimation précise du temps d'aventure total et projection calendaire de fin selon le rythme quotidien.
   - 💰 **Optimiseur de Soldes Steam** : Algorithme glouton maximisant le ratio note / heures de jeu pour un budget donné en euros.
   - 🧭 **Explorateur de Pépites** : Filtre multicritères par genre, année et studio avec liens Steam directs.
   - ❓ **Mini-Quiz Lore & Trivia** : 5 questions interactives avec anecdotes de développement.
3. 🪶 **L'espace vitrine "The Roost / Le Perchoir" :**
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
  - Fond d'écran principal : `#0b0f19` avec micro-poussières d'étoiles / lucioles ambiantes
  - Cartes et conteneurs : `#131a29`
  - Bordures de structure : `#1e293b`
  - Accentuation or / ambre : `#f59e0b`
- **Codes Couleurs de Jeu & Feedback** :
  - Vert émeraude : `#10b981` (Exactitude / Victoire)
  - Jaune moutarde : `#eab308` (Partiel / Catégorie Facile)
  - Rouge brique : `#ef4444` (Erreur / Incohérence)
  - Bleu saphir : `#3b82f6` (Catégorie Difficile)
  - Violet mystique : `#8b5cf6` (Catégorie Expert / Compositeur)
- **Easter Egg du Hibou** :
  - Survol prolongé (>750ms) ou double-clic sur l'icône de hibou dans la barre de navigation : les yeux s'allument en ambre vibrant avec pulsation continue (`owl-eye-pulsing`), un hululement Web Audio retentit et le modal secret s'ouvre !

---

## 🏗️ Architecture Technique

```
src/
├── types/
│   └── game.ts                # Types stricts (Game, ConnectionCategory, DailyConnectionsPuzzle, etc.)
├── data/
│   ├── games.ts               # Base de données de 20+ jeux cultes avec 6 captures & indices
│   ├── connectionsPuzzles.ts  # Énigmes quotidiennes de Connections (4 catégories x 4 items)
│   └── roostProjects.ts       # Créations, prototypes et liens d'Hibouxe
├── i18n/
│   ├── index.ts               # Configuration i18next & persistance LocalStorage
│   └── locales/
│       ├── fr.json            # Traductions françaises complètes
│       └── en.json            # Traductions anglaises complètes
├── context/
│   ├── GameStatsContext.ts    # Définition du contexte et valeurs par défaut
│   ├── GameStatsProvider.tsx  # Provider gérant la persistance des streaks & scores
│   └── useGameStats.ts        # Hook personnalisé pour les statistiques
├── utils/
│   └── audio.ts               # Synthétiseur Web Audio API (zéro fichier audio externe requis)
├── components/
│   ├── common/
│   │   ├── Navbar.tsx         # Navigation, date du jour, bascule de langue, son & stats
│   │   ├── Footer.tsx         # Pied de page avec liens communautaires & mini easter egg
│   │   ├── OwlLogo.tsx        # Logo SVG interactif avec yeux ambrés animés
│   │   ├── StatsModal.tsx     # Graphique de répartition des essais & streaks
│   │   ├── OwlEasterEggModal.tsx # Fenêtre secrète du hibou
│   │   ├── SocialIcons.tsx    # Icônes SVG optimisées (GitHub, YouTube)
│   │   └── GameSearchBar.tsx  # Barre de recherche avec autocomplétion & vignettes
│   ├── screenle/
│   │   └── ScreenleGame.tsx   # Mode 1 : Zoom 6 étapes, navigation & indices progressifs
│   ├── indledle/
│   │   └── IndledleGame.tsx   # Mode 2 : Comparaison de caractéristiques & animations 3D
│   ├── linkle/
│   │   └── LinkleGame.tsx     # Mode 3 : Grille 4x4, mélange déterministe & feedback couleur
│   ├── toolbox/
│   │   └── ToolboxHub.tsx     # Hub avec Roulette, Backlog, Soldes Steam, Pépites & Quiz
│   └── roost/
│       └── TheRoostHub.tsx    # Vitrine des créations, prototypes & lore par Hibouxe
├── App.tsx                    # Sélecteur de modes, gestion des défis du jour & clés de rendu
├── main.tsx                   # Point d'entrée React
└── index.css                  # Thème Tailwind v4, animations de lueur & scrollbars sombres
```

---

## ⚡ Commandes de Développement

```bash
# Installation des dépendances
npm install

# Lancement en développement (Vite HMR)
npm run dev

# Vérification du typage et build de production
npm run build

# Analyse de qualité de code (Oxlint)
npm run lint

# Prévisualisation du bundle de production
npm run preview
```

---

> © 2026 Hoot Indie Games — Développé pour Quentin Beaud (Hibouxe / Edsaje).
