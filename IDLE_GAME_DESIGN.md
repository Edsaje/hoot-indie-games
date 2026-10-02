# 🦉 Game Design Document — L'Odyssée Sylvestre : Le Sanctuaire des Pépites (Idle / Clicker)

> **Document de Référence & Cahier des Charges de Conception**
> Projet : **Hoot Indie Games**
> Genre : **Idle Game / Incrémental Long-Terme / RPG de Découverte**
> Inspirations Majeures : **Pokéclicker** (routes, combats, capture de pépites, boss à chrono, shinies holographiques, donjons) & **Melvor Idle / Candy Box** (Sanctuaire sylvestre, arbre céleste passif, fouilles souterraines, forge de reliques, multi-métiers).

---

## 🌟 1. Vision & Piliers Fondamentaux

### Le Pitch
Dans la clairière nocturne du sanctuaire Hoot, **Sylvestre le Grand Hibou** veille sur l'**Arbre Céleste**, dont les racines s'étendent à travers tous les royaumes et dimensions du jeu vidéo indépendant. 
Le joueur est chargé d'éveiller l'Arbre et d'explorer les mondes indés pour rallier les **256 pépites certifiées**, terrasser les boss mythiques, déterrer de vieilles cartouches légendaires et forger des reliques sacrées.

### Les 4 Piliers de Design
1. **Longévité Extrême (Mois de jeu)** : Une progression pensée sur le très long terme avec paliers exponentiels, prestige (*L'Envol Céleste*) et constellations de talents.
2. **Double Vitesse (Actif & Passif)** :
   - *Joueur Actif* : Clics manuels dévastateurs, coups critiques, mini-jeu de fouille de disquettes, capture active des pépites, traque des Lucioles Dorées.
   - *Joueur Passif (Idle & Hors-ligne)* : DPS d'équipe automatique, production de sève par l'Arbre Céleste, chouettes éclaireuses en mission, récolte de butin nocturne à la reconnexion.
3. **Synergie Organique avec Hoot Indie Games** :
   - Les **cartes possédées** dans le classeur ([`cardsData.ts`](./src/data/cardsData.ts)) boostent directement la puissance des pépites du même genre.
   - Les **8 défis quotidiens** (Screenle, Indledle...) octroient un *Coffre de l'Aube* (+2h de sève instantanée, clés de donjon).
   - Les **plumes d'or** du joueur permettent d'acquérir des reliques et des accélérateurs dans la boutique.
4. **Sécurité Souveraine & Anti-Triche ([`GEMINI.md`](./GEMINI.md))** :
   - Horodatages vérifiés, calcul de progression hors-ligne hermétique et borné (max 12h à 24h).
   - Variables de combat scellées dans des fermetures privées (zéro exploit direct dans la console `window`).
   - Synchronisation Cloud silencieuse et sécurisée avec le profil joueur ([`user_cloud_sync.php`](./public/api/user_cloud_sync.php)).

---

## 🎮 2. Les Deux Espaces Fusionnés (Interface & Boucle de Jeu)

L'écran de l'Odyssée se compose de deux volets interactifs parfaitement imbriqués :

```
┌───────────────────────────────────────────────┬───────────────────────────────────────────────┐
│     ⚔️ VOLET 1 : L'EXPÉDITION (Pokéclicker)    │     🌿 VOLET 2 : LE SANCTUAIRE (Melvor Idle)   │
├───────────────────────────────────────────────┼───────────────────────────────────────────────┤
│ Biome : Les Cavernes Profondes (Route 1-2)    │ Arbre Céleste — Niveau 38                     │
│ [Progression : 8/10 Monstres Vaincus]         │ Sève : 4 850 200 💧 (+18 500 /s)              │
│                                               │                                               │
│             👾 Carcasse Oubliée               │ ── Ateliers du Sanctuaire ──────────────────  │
│        PV : [████████████░░░░] 68%            │ ⛏️ Fouilles Souterraines (Pépites Itch.io)   │
│                                               │ 🔨 Forge de Reliques & Cartes                │
│ Dégâts Clic : 1 250 | DPS Équipe : 8 400 /s   │ 🦉 Nichée des Chouettes Éclaireuses           │
│                                               │ 🌌 Constellation Céleste (Prestige)           │
│ [ Compagnons : The Knight, Slugcat, Niko... ] │ 🎒 Reliques Actives (4/4 emplacements)        │
├───────────────────────────────────────────────┴───────────────────────────────────────────────┤
│ ✨ Événement : Une Luciole Dorée traverse la clairière ! (Cliquez pour x7 Clics pendant 30s)  │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚔️ 3. Pilier 1 : L'Expédition Active (L'ADN Pokéclicker)

### A. Les 6 Grands Royaumes du Multivers Indé
La progression se fait par **Mondes**, chacun divisé en **3 Routes Sauvages** et **1 Donjon de Boss** :

| Monde | Univers & Thématique | Pépites Capturables Émblématiques | Boss Final du Monde |
| :--- | :--- | :--- | :--- |
| **Monde 1 : Les Profondeurs Végétales** | *Metroidvania, Grottes & Survie* | *Hollow Knight*, *Animal Well*, *Rain World*, *Ori*, *Tunic* | **La Radiance Absolue** (Chrono 30s) |
| **Monde 2 : Les Cimes du Silence** | *Plateforme de Précision, Montagnes & Désert* | *Celeste*, *Journey*, *The Witness*, *Jusant*, *Gris* | **Le Cœur de la Montagne** |
| **Monde 3 : Les Enfers Éternels** | *Roguelite, Action & Pénitence* | *Hades*, *Dead Cells*, *Binding of Isaac*, *Blasphemous*, *Skul* | **Le Seigneur des Enfers** |
| **Monde 4 : L'Œil de l'Infini** | *Cosmos, Boucles Temporelles & Sci-Fi* | *Outer Wilds*, *FTL*, *Signalis*, *Citizen Sleeper*, *Risk of Rain 2* | **L'Horloge de la Fin du Monde** |
| **Monde 5 : Le Manoir Clandestin** | *Deckbuilders, Mystères & Jeux de Cartes* | *Balatro*, *Inscryption*, *Slay the Spire*, *Buckshot Roulette* | **L'Aveugle Ultime de Balatro** |
| **Monde 6 : Le Panthéon des Pionniers** | *Légendes Fondatrices & Pépites 2010* | *Braid*, *Limbo*, *Super Meat Boy*, *Fez*, *Spelunky*, *Bastion* | **Le Maître du Temps** |

### B. Mécanique de Clic & Dégâts d'Équipe
* **Clic Manuel** : Chaque frappe inflige `ClickDamage = BaseClick * Multiplicateurs`.
* **Coup Critique** : Chance de base de 5% d'infliger un coup critique x3 (extensible via reliques et arbre de talents).
* **Attaque Passive (DPS)** :
  - Chaque pépite débloquée attaque automatiquement 1 fois par seconde.
  - La puissance d'une pépite dépend de son niveau (améliorable avec de la Sève) et de sa rareté de base (Commune, Rare, Épique, Légendaire).

### C. La Chasse aux Pépites Holographiques (« Shinies »)
* Exactement comme dans Pokéclicker : chaque monstre ou boss a **1 chance sur 1024** d'apparaître sous forme **Holographique Scintillante**.
* La capturer :
  1. Octroie un badge holographique doré permanent dans votre Codex.
  2. Multiplie la puissance de cette pépite par **x3 permanent**.
  3. Déclenche une fanfare sonore polyphonique Web Audio et une gerbe de confettis dorés.

### D. Donjons & Boss Chronométrés
* Un donjon comprend 5 salles de monstres d'élite menant au Boss.
* Le combat de boss est soumis à un **compte à rebours strict de 30 secondes**.
* Si le timer expire : l'expédition bat en retraite automatiquement sur la dernière route pour farmer de la sève sans frustration, jusqu'à ce que le joueur se sente prêt à retenter le donjon.

---

## 🌿 4. Pilier 2 : Le Sanctuaire & Les Métiers (L'ADN Melvor Idle)

### 1. L'Arbre Céleste & La Sève d'Étoile
L'Arbre est le cœur économique passif. Il accumule de la sève continue en ligne et hors-ligne :
* **Niveau de l'Arbre (1 à 100+)** : Augmente le multiplicateur global de production.
* **Branches à débloquer** :
  - *Racines Profondes* : Augmente la capacité de stockage hors-ligne (de 6h à 24h).
  - *Sève Boréale* : Augmente le DPS passif de toutes les pépites de +10% par niveau.
  - *Aiguillon Sylvestre* : Augmente les dégâts de clic manuel de +15% par niveau.
  - *Canopée des Étoiles* : Réduit l'intervalle d'apparition de la Luciole Dorée de 10%.

### 2. La Clairière aux Fouilles (Le Mini-Jeu Souterrain)
* Une grille souterraine couverte de terre et de roches (style Pokéclicker Underground) :
  - Le joueur utilise de l'endurance de pioche pour creuser.
  - Il déterre des **Disquettes 3.5"**, des **Cartouches Nes/Vectrex**, des **Fragments de Silicium** et des **Pierres de Lune**.
  - Ces artefacts alimentent la Forge de Reliques.

### 3. La Forge des Reliques Légendaires
Permet de crafter et d'équiper jusqu'à 4 reliques simultanées :
* 🗡️ **L'Aiguillon Pur** (*Hollow Knight*) : +30% DPS sur toutes les pépites Metroidvania.
* 🍓 **Fraise Céleste** (*Celeste*) : Réduit de 25% la santé maximale des Boss de Donjon.
* 🪐 **Capsule Nomai** (*Outer Wilds*) : Double les gains de sève hors-ligne.
* 🃏 **Joker Feuille d'Or** (*Balatro*) : +10% de chances de coup critique et dégâts critiques x5.
* 💀 **Pacte des Châtiments** (*Hades*) : Les monstres ont +50% de PV mais rapportent x3 Sève.

### 4. La Nichée des Chouettes Éclaireuses
* Le joueur élève des chouettes qui partent en mission en arrière-plan :
  - *Patrouille Rapide (30 min)* : Rapporte de la sève et des fragments de cartes.
  - *Expédition Sylvestre (2h)* : Rapporte des ingrédients de forge rares.
  - *Vol Céleste Nocturne (8h)* : Peut repérer une pépite Holographique garantie dans le prochain donjon.

---

## 🌟 5. La Luciole Dorée (L'Événement « Golden Cookie »)

Toutes les 3 à 8 minutes, une **luciole dorée scintillante** traverse doucement l'écran en ondulant avec des particules féeriques et un tintement cristallin :
* Cliquer dessus active un effet spectaculaire aléatoire pendant 30 secondes :
  - ⚡ **Frénésie de Clic** : Dégâts de clic multipliés par x7 !
  - 💧 **Pluie de Sève** : Gain instantané de 15 minutes de production passive !
  - ⏳ **Faille Temporelle** : Les boss de donjons n'ont aucun compte à rebours !
  - 🪶 **Faveur d'Hibouxe** : +15 Plumes Dorées créditées directement sur votre compte Hoot !

---

## 🌌 6. L'Ascension : « L'Envol Céleste » (Prestige & Longévité)

Lorsque le joueur atteint le Monde 5 ou 6 et que les coûts deviennent colossaux :
1. **L'Envol Céleste** : Le joueur s'adresse à Sylvestre pour déployer ses ailes célestes.
2. Vos niveaux de routes et de pépites reviennent à zéro, mais vous convertissez votre sève totale en **Plumes Célestes**.
3. **L'Arbre des Constellations (Skill Tree permanent)** :
   - ⭐ *Ailes Dorées* : +50% de DPS global permanent par rang.
   - ⭐ *Œil du Hibou* : Double le taux de rencontre des pépites Holographiques (1/512).
   - ⭐ *Héritage des Légendes* : Vos pépites conservent 15% de leur niveau après l'ascension.
   - ⭐ *Automatisation Sylvestre* : Déclenche 5 clics automatiques par seconde même en fond.
   - ⭐ *Raccourci Stellaire* : Démarre chaque nouveau run avec les 2 premiers mondes déjà conquis.

---

## 📐 7. Intégration Visuelle & Ergonomie UX (Pour un Site Déjà Très Riche)

## 📐 7. Intégration Visuelle & Combinaison des Approches (Navigation & Mini-HUD)

Pour préserver la pureté, la lisibilité et l'ergonomie Mobile-First du site sans surcharger la Navbar (qui comptait 8 onglets), nous combinons les deux meilleures approches :

### A. Rationalisation de la Navigation (7 Onglets Aérés)
1. **Unification sous « 🌟 Découverte »** :
   - Regroupe **Pépites du Jour**, **Catalogue Steam** (256 jeux certifiés) et **Micro-Indés Itch.io** sous un onglet unique et épuré.
   - À l'intérieur, un sélecteur fluide (pills en tête de page) permet de basculer instantanément sans recharger.
   - Rétro-compatibilité 100% préservée : les URLs et ancres `#gems`, `#catalog`, `#microindies` restent fonctionnelles.
2. **Arrivée de « 🌲 Odyssée »** :
   - L'espace libéré accueille l'onglet royal **« Odyssée »** avec icône lumineuse et badge dynamique (ex: `Niv. 4`, `✨` si Luciole active).
   - Les 7 onglets desktop :
     1. 🌟 **Découverte** *(Pépites / Catalogue / Micro-Indés)*
     2. 🧩 **Mini-Jeux** *(11 puzzles quotidiens, Duels & Time Attack)*
     3. 🌲 **Odyssée** *(L'aventure idle/clicker)*
     4. 🕹️ **Arcade** *(Classiques rétro)*
     5. 🃏 **Cartes** *(Album & Échanges bilatéraux)*
     6. 🧰 **Outils** *(Calculateur Steam, Guess Price)*
     7. 🪶 **Le Perchoir** *(Sanctuaire & profil)*

### B. Le Mini-HUD Flottant Sylvestre (Compagnon Persistant)
- Un widget discret en bas à droite (`bottom-20 right-4 sm:right-6`, au-dessus du bouton de tchat).
- Visible depuis n'importe quelle page du site (résolution de Screenle, album de cartes, catalogue).
- Affiche en direct :
  - `[ 🌲 Biome 1 • Route 3 ]`
  - Jauge de vie du monstre courant qui diminue grâce aux DPS passifs.
  - Taux horaire de Sève Stellaire (`💧 18.4k (+340/s)`).
  - Alerte visuelle & sonore si une **Luciole Dorée** survole l'écran (cliquable directement depuis le HUD).
  - Boutons d'action rapide : `[ ⚔️ Coup ]` et `[ ↗ Ouvrir ]` pour sauter directement dans l'Odyssée.
  - Repliable d'un clic en une micro-pastille lumineuse `[🌲 18.4k]`.

---

### 🎨 8. Direction Artistique (DA) & Game Feel

- **Ambiance Visuelle** : « Dark Cozy Sylvestre & Cristaux Stellaires ».
  - Verts sombres de pin résineux (`#04120e`, `#06241b`), bois ambré poli (`#78350f`), or chaleureux (`#f59e0b`), sève stellaire bioluminescente (`#06b6d4`).
- **Bestiaire & Monstres** :
  - Les 256 jeux indés apparaissent comme des « Échos Sauvages » avec leurs capsules officielles Steam.
  - Animation de respiration *idle* (flottement doux).
  - Variantes **Holographiques / Shinies (1/1024)** : reflets prismatiques arc-en-ciel animés et particules étoilées dorées.
- **Game Feel au Clic** :
  - Flash blanc au coup (`brightness(1.3)`) et secousse directionnelle.
  - Dégâts flottants bondissants (Damage Popups en cloche avec `CRIT!` en or massif).
  - Sons boisés/cristallins discrets et désactivables.
- **Les 6 Biomes Parallaxes** :
  1. *La Clairière des Premiers Pas* (Fougères, spores luminescents)
  2. *La Canopée des Pixels* (Pixels flottants, feuillage géométrique)
  3. *Les Grottes de Silice* (Cristaux bioluminescents, poussière minérale)
  4. *Le Sommet Céleste* (Poudreuse tourbillonnante, aurore boréale)
  5. *Le Gouffre des Enfers* (Braises incandescentes, magma pourpre)
  6. *Le Sanctuaire du Néant* (Nébuleuse cosmique, anneaux stellaires)

---

### 💾 9. Système de Sauvegarde Universel (Avec & Sans Compte)

#### Mode Sans Compte (Invité / Local-First)
- **Persistance locale** : Clé `'hoot_odyssey_save_v1'` dans `localStorage`, mise à jour toutes les 10s et aux moments clés (achat, boss, déconnexion).
- **Export / Import JSON Total (1 clic)** : Outil unifié exportant l'intégralité du profil (profil, succès, cartes, statistiques, calendriers quotidiens ET Odyssée complète).
- **Clé de secours souveraine (`syncKey`)** : Clé unique générée automatiquement (`hoot_cloud_sync_key_v1`) permettant de synchroniser un compte invité entre plusieurs appareils sans inscription.

#### Mode Avec Compte (Steam OpenID & Compte Hoot)
- **Champ `odysseyState`** intégré dans `UserCloudSavePayload` ([`userCloudSyncService.ts`](./src/services/userCloudSyncService.ts)) et dans le backend PHP ([`user_cloud_sync.php`](./public/api/user_cloud_sync.php)).
- **Règles de fusion intelligente (Merge non-destructif)** :
  - Vagues max et biomes débloqués : `max(cloud, local)`.
  - Niveaux des compétences de l'Arbre Céleste : `max(levelCloud, levelLocal)`.
  - Pépites capturées et reliques déterrées : union stricte sans doublons (`array_unique`).
  - Sève Stellaire et Éclats : préservation de la valeur la plus avancée.
- **Onboarding Invité ➔ Compte** : Si un joueur commence sans compte et s'inscrit plus tard, sa sauvegarde locale est automatiquement transférée vers son nouveau compte sans aucune perte.

#### Anti-Triche & Calcul Hors-Ligne
- Calcul basé sur $\Delta t = \text{Date.now()} - \text{lastSavedAt}$.
- Plafond maximal de gain hors-ligne : **8 heures** par défaut (extensible jusqu'à **24 heures** via l'Arbre Céleste).
- Protection contre le recul d'horloge système (si $\Delta t < 0$, $\Delta t = 0$).
- Mode basse consommation : coupe l'animation 60 FPS quand l'onglet est masqué (`document.hidden`), 0% de batterie gaspillée.

---

### 📦 10. Empreinte de Stockage & Hébergement OVH (100 Mo)

- **Stockage actuel du site** : **~19 Mo** sur les 100 Mo alloués par l'hébergement gratuit OVH (plus de 80 Mo disponibles).
- **Impact de l'Odyssée** : **~100 à 150 Ko seulement (< 0,15 Mo)**.
  - Les 256 artworks de jeux proviennent du CDN Steam Akamai (0 Ko sur le serveur OVH).
  - Graphismes en SVG/CSS3 compilés dans le bundle Vite existant.
  - Sauvegardes JSON individuelles très légères (~3 Ko par joueur).
- **Verdict** : Parfaitement compatible avec une marge de sécurité colossale.

---

### 🚀 11. Feuille de Route d'Implémentation

* **Jalon 1 : Types, Moteur de Calcul & Persistance Locale**
  - `src/types/odyssey.ts` (modèles de données complets).
  - `src/services/odysseyEngineService.ts` (boucle de combat, clics, DPS passifs, gains de sève, calcul hors-ligne).
  - Intégration dans `UserCloudSavePayload` et `user_cloud_sync.php`.
* **Jalon 2 : Arène de Combat & Biome 1**
  - Composant d'arène de combat avec monstres, boss chronométré et popups de dégâts.
  - Système de capture des Échos Sauvages et variantes Holographiques.
* **Jalon 3 : L'Arbre Céleste & La Luciole Dorée**
  - Arbre de constellations avec les 4 branches de compétences.
  - Événement animé de la Luciole Dorée flottante avec Frénésie.
* **Jalon 4 : Navigation Découverte & Mini-HUD Flottant**
  - Unification de l'onglet Découverte (`gems`, `catalog`, `microindies`).
  - Ajout de l'onglet Odyssée dans `Navbar.tsx` et `App.tsx`.
  - Mini-HUD persistant en bas à droite au-dessus du tchat.
* **Jalon 5 : Les Fouilles du Sous-Sol & Forge de Reliques**
  - Grille rétro destructible pour déterrer des reliques et disquettes.
  - Synergies avec les 256 cartes du Sanctuaire.

---

## 🎨 12. Programme d'Améliorations Majeures (Next-Gen : Expérience "Vrai Jeu" & Fin de l'Austérité)

> [!IMPORTANT]
> **Constat & Direction Artistique** : La première mouture fonctionnelle est robuste sous le capot (sauvegardes, calculs, cloud sync), mais l'aspect visuel souffre d'une présentation trop austère, statique et abstraite ("look IA / tableaux administratifs").  
> Pour susciter un véritable plaisir de jeu et une boucle addictive à la Pokéclicker, l'Odyssée doit se métamorphoser en un **vrai jeu vidéo incarné, vivant, vibrant d'animations, d'artworks et de feedback tactile gratifiant**.

### 🗺️ A. La Carte du Monde Interactive (World Map & Progression Spatiale) `[✅ Implémenté]`
Remplacer la grille de cartes statiques par une véritable **carte d'aventure illustrée et interactive** (style *Slay the Spire*, *Super Mario World*, *Pokéclicker*) :
1. **Sentiers & Chemins Sinueux** : Les 6 biomes et leurs 30 routes reliés par un tracé cartographique organique avec embranchements et étapes clés.
2. **Jalons Visuels Typés** :
   - *Bornes de Route* (R1 à R4) avec indicateur de complétion.
   - *Sanctuaires de Sève / Fontaines d'Étoiles* (points d'intérêt bonus).
   - *Portes Monumentales de Boss* (icône imposante aux lueurs écarlates pour R5).
   - *Coffres au Trésor Scellés* le long du parcours.
3. **Brouillard de Guerre Organique (Fog of War)** : Les biomes non débloqués apparaissent sous une brume nébuleuse mystérieuse avec silhouettes d'ombres géantes, attisant la curiosité.
4. **Pion Voyageur Animé (Le Hibou Explorateur)** : La mascotte Hoot se déplace physiquement le long de la ligne de route lorsqu'on change de zone ou voyage d'un biome à l'autre.
5. **Zoom & Pan Panoramique** : Navigation fluide au glisser/toucher sur mobile et à la souris sur grand écran.

---

### 📖 B. Le "Pokédex de Route" (Route Loot Dex & Radar des Pépites)
Reprendre le mécanisme le plus addictif de Pokéclicker : **savoir exactement ce que l'on peut chasser sur chaque route** pour motiver la complétion à 100% :
1. **Réglette Horizontale de Butin sous chaque Route** :
   - Présentation des **6 à 8 pépites indés spécifiques** assignées à la route actuelle.
   - **3 États Visuels Clairs & Stimulants** :
     - ❓ *Silhouette Noire & ?* : Pépite jamais rencontrée / non capturée, avec affichage du taux de probabilité de rencontre.
     - 🎮 *Miniature Découverte & Capturée* : Vraie capsule Steam en couleur, badge de quantité (*x3*), bonus actif débloqué.
     - ✨ *Variante Holographique Possédée* : Cadre doré étincelant avec reflets prismatiques arc-en-ciel animés.
2. **Jauge de Maîtrise de Route (Route Mastery)** :
   - Exemple : `Route 1-2 : 5/7 Capturés (71%)`.
   - À 100% de complétion de la route : la route s'illumine d'une **Étoile d'Or de Maîtrise**, octroyant un bonus permanent passif (+15% de Sève sur cette route ou +5% de vitesse de spawn).
3. **Farming Libre & Auto-Progression Maîtrisée** :
   - Case à cocher dédiée **Auto-progression** (désactivée par défaut) : permet au joueur de choisir librement de rester indéfiniment sur une route pour farmer ses pépites favorites ou collecter de la Sève sans être propulsé automatiquement sur la suivante.
   - Les taux d'apparition restent 100% naturels et organiques (Commune, Peu Commune, Rare) pour préserver le plaisir authentique de la collection rare, sans distorsion artificielle.
   - Le système de « Vagues » a été supprimé au profit d'un objectif clair : le nombre requis de monstres pour débloquer la route suivante (`X / Y pour débloquer la suite`), laissant ensuite place au compteur cumulé de monstres vaincus (`X vaincus`).

---

### 🎬 C. Révolution Graphique, Décors & "Game Feel" (VFX & Animations Réactives)
Transformer l'arène de combat en une véritable scène de jeu animée :
1. **Décors Illustrés & Parallaxe Multi-Couches** :
   - Chaque biome dispose d'une scénographie picturale :
     - *Clairière* : Arbres anciens peints, rayons de soleil volumétriques, tapis de mousse et fleurs phosphorescentes.
     - *Canopée Pixel* : Arbres géométriques d'inspiration Fez/Hyper Light Drifter avec pluie de pixels dorés.
     - *Grottes de Silice* : Géodes géantes luminescentes avec reflets sur parois humides.
     - *Sommet Céleste* : Cimes enneigées sous aurore boréale mouvante et vent de particules.
     - *Gouffre des Enfers* : Lacs de lave rougeoyants et chutes de cendres incandescentes.
     - *Sanctuaire du Néant* : Spirale de galaxies et débris orbitaux flottants.
2. **Animations d'Impact & "Juiciness" de Combat** :
   - *Slash / Taillade Visuelle au Clic* : Tracé lumineux de lame ou coup de griffe SVG généré à l'endroit exact du curseur/doigt.
   - *Screen Shake / Secousse Réactive* : Micro-secousse de la caméra lors d'un coup critique ou de la mort d'un monstre (désactivable dans les options pour l'accessibilité).
   - *Flinch & Flash Blanc d'Impact* : L'ennemi recule légèrement sous le choc et clignote en surbrillance blanche lors d'une frappe.
   - *Drain de Barre de Vie Dynamique* : La jauge de PV ne baisse pas sèchement mais affiche une barre résiduelle rouge/orange qui fond en fondu (style jeux de combat / RPG arcade).
   - *Explosion de Particules de Sève* : Jaillissement de gouttelettes cyan ou d'étincelles dorées vers le compteur de ressources lors d'une victoire.
3. **Météo & Particules d'Ambiance Dynamiques (Canvas 60 FPS ultra-léger)** :
   - Feuilles qui tombent délicatement dans la Clairière, lucioles dérivantes dans les Grottes, étincelles de forge dans les Enfers.

---

### 🦉 D. Compagnon de Tête Actif (Le Protecteur du Sanctuaire)
1. **Attribution d'un Compagnon Favori** :
   - Le joueur peut choisir l'un de ses 256 jeux capturés pour l'accompagner visuellement au bord de l'arène (ex: The Knight de *Hollow Knight*, Madeline de *Celeste*, Zagreus de *Hades*, le Slugcat de *Rain World*).
2. **Capacité Ultime Active (Barre d'Énergie)** :
   - Chaque compagnon dispose d'un pouvoir thématique déclenchable après un certain nombre de clics ou de temps :
     - *Dash Éthéré* : Inflige instantanément 30 coups rapides en 1 seconde.
     - *Pluie d'Ambre* : Triple la production de sève pendant 15 secondes.
     - *Révélation Stellaire* : Force la prochaine pépite à être un Écho Sauvage rare.

---

### 🎁 E. Coffres de Victoire & Butins de Premier Passage (First-Clear Rewards)
1. **Coffres de Route Déverrouillés** :
   - Compléter pour la première fois les 10 monstres d'une route fait apparaître un **Coffre en Bois Doré** animé qui s'ouvre avec explosion de lumière.
   - Récompenses : Sève massive, Plumes d'or pour la boutique, et 1 Booster de cartes du Sanctuaire.
2. **Trophée de Boss de Biome** :
   - Vaincre le Boss R5 pour la première fois débloque une **Relique d'Artefact** pérenne visible dans le Sanctuaire.

---

### 🕹️ F. Mini-Jeu de Fouille Géologique (Les Trésors du Sous-Sol)
- Une grille rétro destructible 8x8 blocs façon *Pokémon Souterrains* / *Dome Keeper*.
- Utilisation de pioches et de charges de sève pour creuser la roche et déterrer des disquettes Itch.io oubliées, des micro-pépites et des fossiles indés.

---
> *© 2026 Hoot Indie Games — Feuille de route d'améliorations continues conçue pour Quentin Beaud (Hibouxe / Edsaje).*


