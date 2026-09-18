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
- **Conception Mobile-First Obligatoire** : L'ensemble du site doit impérativement être pensé et conçu pour smartphone d'abord (viewport 360px - 430px). Zéro débordement horizontal, cibles tactiles confortables au pouce (min 44x44px), modales plafonnées (`max-h-[92vh] overflow-y-auto`) et suppression des gestes parasites (`touch-none`, `select-none`).
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

La base de données officielle de **Hoot Indie Games** compte **83 chefs-d'œuvre et pépites indés certifiés** (allant des pionniers 2010 aux sorties marquantes 2024 comme *Hades II*, *Neva*, *UFO 50*, *Mouthwashing*, *Nine Sols*, *Animal Well*, *Balatro*, *Crow Country*).

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

---

## 8. Règle Fondamentale : ZÉRO Hallucination & Rigueur Factuelle

Cette règle est absolue et prévaut sur toute autre considération :

1. **Aucune invention de données ni de dates** :
   - Interdiction formelle d'inventer des dates de sortie, des noms de studios, des compositeurs, des captures d'écran, des prix ou des tags.
   - Toute métadonnée de jeu doit être extraite et vérifiée auprès d'une source officielle (API Steam Store officielle, annonce officielle du studio, ou base IGDB).

2. **Séparation étanche entre Jeux Jouables et Jeux à Venir** :
   - `src/data/games.ts` ne contient **QUE** des jeux effectivement commercialisés, vérifiables et jouables.
   - Les jeux non encore parus doivent obligatoirement résider dans `src/data/upcomingGames.ts` avec la mention officielle communiquée par les développeurs (ex : *"TBA / En développement"* ou fenêtre officielle), sans jamais extrapoler une année fictive.

3. **Aucune extrapolation temporelle ou spéculative** :
   - Ne jamais présumer ou affirmer comme fait acquis ce qui n'est pas vérifié dans la réalité documentaire. Si une date n'est pas officiellement fixée, l'indiquer explicitement comme *"À confirmer / TBA"*.

4. **Code, Dépendances et APIs Réels** :
   - Aucun import fantôme, aucune fonction fictive, aucun mock se faisant passer pour une API externe sans étiquetage explicite.
   - Le code doit passer `tsc -b` sans aucune erreur de typage et `npm run lint` avec 0 warning.

---

## 9. Standardisation Canonique & Audit de Données (`npm run audit-db`)

Pour prévenir toute fausse déduction ou frustration dans Indledle :
1. **ArtStyle canonique** (exactement 6 valeurs normalisées) :
   - `Pixel Art`
   - `2D Dessiné à la main` / `2D Hand-drawn`
   - `3D Stylisée` / `Stylized 3D`
   - `3D Low-Poly / Rétro` / `Retro Low-poly 3D`
   - `3D Réaliste` / `Realistic 3D`
   - `Monochrome / Minimaliste` / `Monochrome`
2. **Caméra canonique** (exactement 5 perspectives normalisées) :
   - `Vue de côté 2D` / `2D Side-scroller`
   - `Vue du dessus 2D` / `2D Top-down`
   - `Isométrique / 2.5D` / `Isometric / 2.5D`
   - `Première personne` / `First-Person`
   - `Troisième personne` / `Third-Person`
3. **Nettoyage des Genres** :
   - Les tags méta comme `"Indépendant"`, `"Accès anticipé"` et `"Occasionnel"` sont strictement proscrits dans le champ `genre` pour ne pas fausser les correspondances Wordle/Indledle.
4. **Commande d'Audit Automatisé** :
   ```bash
   npm run audit-db
   ```
   Valide instantanément la totalité des 83 jeux sur tous les critères d'intégrité et de conformité Steam.

---

## 10. Système de Compte & Sauvegarde Hybride (Local-First + Supabase)

1. **Local-First par défaut** :
   - Chaque joueur dispose d'un profil opérationnel immédiat en local sans obligation d'inscription.
   - 8 Avatars Indés emblématiques (*The Knight*, *Madeline*, *Zagreus*, *The Lamb*, *Jimbo*, *Stray Cat*, *Untitled Goose*, *Hootie*).
   - Suivi du rang ELO (départ 1000 ELO), des séries de victoires et des Plumes Dorées.
2. **Synchronisation Cloud Supabase** :
   - Activée si `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont renseignées.
   - Authentification email/mot de passe sécurisée.
   - Sauvegarde et synchronisation multi-écrans des succès et statistiques.
3. **Souveraineté des Données** :
   - Bouton d'exportation d'une sauvegarde complète en fichier JSON (`hoot-save-*.json`).
   - Bouton d'importation pour restaurer sa progression sur n'importe quel navigateur, même en navigation privée.

---

## 11. Mode Versus 1v1 Multijoueur ("Screenle Sprint")

1. **Arène Face-à-Face en direct** :
   - Format Best of 3 (premier à 2 manches gagnantes).
   - Capture mystère avec flou et zoom dégressifs au fil des 20 secondes.
   - Pénalité de blocage de 3 secondes en cas de mauvaise proposition.
2. **Deux modes de mise en relation** :
   - **Duel entre Amis** : Génération d'un code de salon (ex: `HOOT-42`) avec lien d'invitation partageable (`#versus=HOOT-42`).
   - **Matchmaking Rapide** : Appariement automatique avec un joueur en ligne ou un rival simulé intelligent de niveau équivalent pour zéro temps d'attente.
3. **Récompenses & ELO** :
   - +35 Plumes Dorées et déblocage du succès *Gladiateur du Perchoir*.
   - Calcul de gain/perte ELO selon la formule officielle d'Arpad Elo.

---

## 12. Hébergement, Dépôt GitHub & Déploiement Continu

- **Dépôt GitHub officiel** : [`https://github.com/Edsaje/hoot-indie-games`](https://github.com/Edsaje/hoot-indie-games)
- **Site en production** : [`http://www.hootindiegames.com/`](http://www.hootindiegames.com/)
- **Pipeline CI/CD OVH automatique** : Tout `git push` sur la branche `main` déclenche le workflow GitHub Actions [`.github/workflows/deploy-ovh.yml`](file:///.github/workflows/deploy-ovh.yml). Le runner GitHub exécute `npm run audit-db`, `npm run build`, puis transfère via FTP vers le cluster OVH (`ftp.cluster129.hosting.ovh.net` -> `./www/`).
- **Télémétrie Privée** : Endpoint souverain [`public/api/track.php`](file:///public/api/track.php) avec mot de passe Bcrypt et blocage `.htaccess`.
- **Guide de secours & déploiement alternatif** : [`DEPLOY.md`](file:///DEPLOY.md).

---

## 13. Feuille de Route & Todolist Active

Consulter impérativement le fichier [`TODOLIST.md`](file:///TODOLIST.md) à la racine du projet pour prendre connaissance des tâches en cours, décisions de l'utilisateur (renommage des modes, suggestion Steam, véritable multijoueur 1v1, onglet Arcade dédié, réhabilitation du Perchoir) et priorités de développement.

---

## 14. Règle Invariable : Conception Mobile-First & Ergonomie Smartphone

1. **Priorité Smartphone Inconditionnelle** :
   - Chaque nouvel écran, fonctionnalité, modale ou jeu doit être prototypé, implémenté et testé **d'abord sur smartphone (360px - 430px)** avant toute adaptation pour grands écrans.
2. **Zéro Débordement Horizontal (No Horizontal Overflow)** :
   - Interdiction de tout élément débordant (`max-w-full`, contrôle rigoureux des flexbox, des textes longs et des grilles).
   - Les en-têtes et barres de navigation doivent rester compacts sans masquer l'accès à la connexion ni au profil.
3. **Ergonomie Tactile & Cibles Confortables** :
   - Cibles de clic/tap d'au moins 44x44px pour une manipulation aisée au pouce.
   - Espacements adaptés pour éliminer les taps accidentels.
4. **Contrôle Tactile des Jeux & Élimination de la Latence** :
   - Règle `touch-none` et `select-none` sur les canvas de jeux et les manettes virtuelles.
   - Prise en charge native du swipe, du glissement 1:1 et des touches virtuelles sans délai de 300ms.
5. **Modales Plein-Écran & Défilement Interne** :
   - Plafond `max-h-[92vh] overflow-y-auto` avec bouton de fermeture accessible immédiatement pour les pouces.


