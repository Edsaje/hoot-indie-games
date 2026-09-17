# 🦉 Directives & Charte de Conception — Hoot Indie Games

Ce document consigne l'ensemble des règles invariantes, directives de design, contraintes techniques et structures de données régissant le développement de la plateforme **Hoot Indie Games**.

---

## 1. Vision & Identité Visuelle

Hoot Indie Games est le sanctuaire web bilingue officiel dédié aux jeux vidéo indépendants. Il réunit trois mini-jeux quotidiens de déduction, une boîte à outils pratique pour joueurs, et un espace vitrine ("The Roost / Le Perchoir") pour les créations et analyses de Quentin Beaud (Hibouxe / Edsaje).

### Palette & Couleurs de Référence
- **Fond nocturne abyssal** : `#0b0f19` (ardoise ultra-sombre, micro-particules d'étoiles / lucioles)
- **Conteneurs & cartes** : `#131a29` (ardoise nocturne dense)
- **Surfaces d'interaction** : `#1a2234`
- **Bordures structurales fines** : `#1e293b`
- **Accent principal (Yeux du Hibou)** : Or / Ambre ardent `#f59e0b`

### Couleurs Fonctionnelles de Feedback Ludique
- **Vert émeraude** (`#10b981`) : Correspondance exacte / Victoire / Catégorie Moyenne
- **Jaune moutarde** (`#eab308`) : Correspondance partielle / Année proche / Catégorie Facile
- **Rouge brique** (`#ef4444`) : Erreur / Incohérence / Échec
- **Bleu saphir** (`#3b82f6`) : Catégorie Difficile
- **Violet mystique** (`#8b5cf6`) : Catégorie Expert / Indices musicaux (Compositeur)

### Anti-"IA Slop" & Rigueur UX
- **Pas d'arrondis mous génériques** : Éviter les pilules géantes `rounded-full` sur les cartes de contenu. Privilégier des angles géométriques nets, précis et travaillés (`rounded-xl` à `rounded-2xl` max).
- **Surfaces denses et lisibles** : Proscrire le faux glassmorphism laiteux ou illisible. Les contrastes doivent être élevés, les typographies nettes et les bordures ciselées au pixel près.
- **Pas de surcharge d'emojis automatiques** : Laisser respirer l'interface, les icônes vectorielles SVG (Lucide) et les jaquettes authentiques.
- **Easter Egg interactif** : L'icône de hibou dans la barre de navigation réagit au survol prolongé (>750ms) ou au double-clic : ses yeux s'allument en ambre vibrant avec pulsation continue (`owl-eye-pulsing`), un hululement Web Audio retentit et ouvre le modal secret du hibou.

---

## 2. Stack Technique & Exigences d'Architecture

- **Framework** : React 18+ avec Vite
- **Langage** : TypeScript en mode **strict obligatoire**. **Interdiction formelle d'utiliser le type `any`**.
- **Styles** : Tailwind CSS v4 avec import natif `@tailwindcss/vite` et variables de thème `@theme`.
- **Internationalisation** : `i18next` et `react-i18next` (support intégral FR/EN, détection automatique de la langue du navigateur et persistance continue en `localStorage` sous la clé `hoot_lang`).
- **Animations & Icônes** : `framer-motion` (animations de flip 3D, secousses d'erreur, regroupement de tuiles) et `lucide-react`.
- **Audio Web** : Moteur audio natif basé sur l'**API Web Audio** (`src/utils/audio.ts`) sans dépendance à des fichiers audio externes mp3/wav pouvant échouer au chargement. Bouton de désactivation globale du son accessible dans la navbar.
- **Persistance locale** : `localStorage` pour les parties en cours du jour, l'historique des propositions, les streaks et la distribution des victoires.

---

## 3. Structures de Données Typées (`src/types/game.ts`)

Les structures suivantes constituent le contrat de données fondamental et ne doivent pas être altérées :

```typescript
export interface LocalizedText {
  fr: string;
  en: string;
}

// Pour les modes Screenle et Indledle
export interface Game {
  id: string;
  title: string;
  releaseYear: number;
  genre: string[];
  artStyle: LocalizedText;
  camera: LocalizedText;
  developer: string;
  steamUrl?: string;
  screenshots: string[]; // 6 zooms/niveaux pour Screenle
  hints: {
    tagline: LocalizedText;
    composer?: string;
  };
}

// Pour le Mode 3 : Connections / Linkle
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export interface ConnectionCategory {
  id: string;
  label: LocalizedText; // ex: { fr: "Sortis en 2018", en: "Released in 2018" }
  difficulty: DifficultyLevel; // Associe une couleur : Jaune, Vert, Bleu, Violet
  items: {
    gameId: string;
    gameTitle: string;
    imageUrl: string; // Screenshot ou jaquette
  }[]; // Doit contenir exactement 4 items
}

export interface DailyConnectionsPuzzle {
  id: string;
  date: string; // "YYYY-MM-DD"
  categories: ConnectionCategory[]; // Exactement 4 catégories (soit 16 items au total)
}
```

---

## 4. Spécifications des Mini-Jeux Quotidiens

### Mode 1 : "Screenle" (`ScreenleGame.tsx`)
1. **6 Étapes visuelles progressives** : L'image de départ est fortement zoomée / cadrée sur un détail. Chaque erreur ou saut d'étape dévoile un cadrage plus large jusqu'au plan complet.
2. **Navigation d'indices** : Le joueur peut revoir à tout moment les étapes visuelles déjà débloquées grâce aux pilules numérotées 1 à 6.
3. **Indices bonus** :
   - Accroche narrative / Lore (`hints.tagline`) : débloquée à partir de 2 erreurs / étape 3.
   - Compositeur de l'OST (`hints.composer`) : débloqué à partir de 3 erreurs / étape 4.
4. **Validation & Fin de partie** : Autocomplétion avec vignettes. Victoire déclenchant confettis, jingle Web Audio, affichage de la fiche du jeu et lien vers Steam.

### Mode 2 : "Indledle" (`IndledleGame.tsx`)
1. **Comparaison d'attributs** :
   - **Année** : Vert si égale, jaune avec indicateur `▲` (si le jeu secret est plus récent) ou `▼` (si le jeu secret est plus ancien).
   - **Genres** : Vert si liste exacte, jaune si recoupement partiel (affiche les tags communs), rouge si aucun genre en commun.
   - **Direction Artistique** : Vert si identique, rouge sinon.
   - **Perspective Caméra** : Vert si identique, rouge sinon.
   - **Développeur** : Vert si identique, rouge sinon.
2. **Animation** : Rotation 3D (*Card Flip*) sur la nouvelle ligne de tentative.
3. **Tentatives** : 8 essais maximum avant révélation de la solution.

### Mode 3 : "Linkle / Connections" (`LinkleGame.tsx`)
1. **16 Tuiles de jeux** : Présentation sous forme de grille 4x4 avec jaquettes et titres.
2. **Sélection & Validation** : Sélection de 4 jeux simultanés. Boutons *Valider*, *Mélanger* (mélange déterministe par date) et *Désélectionner tout*.
3. **Mécanique "One Away"** : Si 3 jeux sur 4 appartiennent à la même catégorie, déclenche un avertissement visuel *"Tout près ! 3 jeux sur 4 partagent une catégorie secrète !"* et une vibration (*shake*).
4. **Vies / Erreurs** : 4 erreurs autorisées représentées par des plumes d'or.
5. **Résolution** : Regroupement animé en bannières de catégorie colorées aux teintes officielles (Jaune, Vert, Bleu, Violet).

---

## 5. Boîte à Outils & Vitrine "The Roost"

### Boîte à Outils (`ToolboxHub.tsx`)
- **Roulette du Soir** : Tirage de jeu avec filtre d'ambiance (*Cozy*, *Action*, *Cérébral*, *Sombre*).
- **Calculateur de Backlog** : Sélection multi-jeux, curseur de temps disponible par jour, calcul des heures cumulées et date projetée d'achèvement.
- **Optimiseur Soldes Steam** : Algorithme glouton sélectionnant le panier idéal maximisant le ratio note/temps de jeu pour un budget en euros défini.
- **Explorateur de Pépites** : Filtre multicritères dans la bibliothèque de jeux avec liens Steam.
- **Quiz Lore & Trivia** : 5 questions interactives avec scoring et anecdotes de game design.

### The Roost / Le Perchoir (`TheRoostHub.tsx`)
- Présentation soignée des projets de Quentin Beaud (Hibouxe / Edsaje) :
  - *La Forêt du Hibou* (Canvas 2D, moteur de lucioles)
  - *Mine Storm Vectrex Revival* (Arcade vectorielle cathodique 1982)
  - *Hibou Clicker : Plumes Célestes* (Incrémental & prestige céleste)
  - *Hibouxe Lore Analyst* (Vidéos YouTube, analyses de Hollow Knight, Outer Wilds, Rain World)
  - *La Salle d'Arcade Secrète* (7 mini-jeux rétro)
  - *Donjon de Naheulbeuk 2.0* (Moteur de tactique RPG)
- Liens officiels :
  - Portfolio : [quentinbeaud.com](https://quentinbeaud.com/)
  - GitHub : [github.com/Edsaje](https://github.com/Edsaje)
  - YouTube : [youtube.com/@Hibouxe](https://www.youtube.com/@Hibouxe)

---

## 6. Règles de Contribution & Code Standards

1. **Pureté du typage** : Tous les fichiers doivent passer `tsc -b` sans aucune erreur de type.
2. **Zéro warning de linter** : L'exécution de `npm run lint` (Oxlint) doit retourner 0 warning et 0 erreur.
3. **Séparation Context / Hook** :
   - Le contexte React réside dans `src/context/GameStatsContext.ts`.
   - Le Provider réside dans `src/context/GameStatsProvider.tsx`.
   - Le hook réside dans `src/context/useGameStats.ts` (conformité React Fast Refresh).
4. **Composants avec clé de date** : Dans `App.tsx`, les jeux quotidiens doivent obligatoirement recevoir `key={currentDate}` pour garantir une réinitialisation d'état synchrone et sans effet de bord lors du changement de date.

---

## 7. Gestion & Moissonnage de la Base de Données de Jeux Indés

La base de données officielle de **Hoot Indie Games** compte **84 chefs-d'œuvre et pépites indés certifiés** (allant des pionniers 2010 aux sorties marquantes 2024–2026 comme *Hades II*, *Slay the Spire 2*, *Neva*, *UFO 50*, *Mouthwashing*, *Nine Sols*, *Animal Well*, *Balatro*, *Crow Country*).

### Commandes CLI de Maintenance

1. **Ajouter un jeu spécifique via son AppId Steam :**
   ```bash
   npm run add-game <STEAM_APP_ID>
   ```
   *Exemple :* `npm run add-game 1809540` interroge l'API Steam Store en français, extrait automatiquement le nom, les développeurs, l'année, les captures HD 1080p, et génère l'objet TypeScript prêt pour `src/data/games.ts`.

2. **Mettre à jour et moissonner en lot :**
   ```bash
   npm run update-db
   ```
   Exécute la suite de moissonnage `scripts/addBatchGames.ts` et fusionne les nouvelles fiches dans `src/data/games.ts` sans doublons ni régressions.
