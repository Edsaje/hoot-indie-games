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

## 🎯 Todolist Active Prioritaire (Demandes Récentes Utilisateur)

### 1. 🖼️ Correction des images de jeux Itch.io non chargées (Images noires) `[✅ 100% Terminé]`
- **Constat :** Dans la Clairière des Micro-Indés (`MicroIndieHub.tsx`), certaines fiches affichaient un carré noir vide au lieu de l'image de couverture du jeu.
- **Causes identifiées :**
  1. URLs CDN `img.itch.zone` expirées ou 404 sur 15 jeux de la sélection.
  2. Absence de `referrerPolicy="no-referrer"` sur les balises `<img>`, provoquant des blocages 403 Forbidden sur le CDN Itch.io.
  3. Absence de gestion d'erreur `onError` et de repli visuel élégant.
- **Actions réalisées :**
  - [x] Mettre à jour `src/data/microIndies.ts` avec des URLs d'images officielles certifiées 200 OK (Akamai CDN Steam pour les titres multiplateformes et URLs itch officielles actualisées).
  - [x] Ajouter `referrerPolicy="no-referrer"` sur les images dans `MicroIndieHub.tsx`.
  - [x] Implémenter un gestionnaire `onError` avec état `failedImageIds` affichant une bannière sylvestre de secours avec icône, titre et genre au lieu d'un cadre noir.

---

### 2. 🎴 Désactivation de l'ouverture automatique des boosters de cartes `[✅ 100% Terminé]`
- **Constat :** À l'ouverture de la modale de booster (`BoosterOpeningModal.tsx`), le booster se déchirait automatiquement après un court délai (550 ms), empêchant le joueur de contempler le sachet scellé et de cliquer pour le déchirer manuellement.
- **Actions réalisées :**
  - [x] Supprimer le déclenchement automatique `autoTearTimer` dans `BoosterOpeningModal.tsx`.
  - [x] Maintenir le booster scellé à l'état `'sealed'` avec le bouton interactif « Déchirer le Booster » et le clic sur le paquet.

---

### 3. 🔍 Ajustement du zoom des cartes (Empêcher d'être caché par le bord de la fenêtre) `[✅ 100% Terminé]`
- **Constat :** Lors du zoom sur une carte dans la modale d'inspection (`CardDetailModal.tsx`), l'agrandissement par CSS `transform: scale()` débordait vers le haut (coordonnées négatives) et était caché par le bord supérieur de la fenêtre.
- **Actions réalisées :**
  - [x] Système de déplacement / panoramique interactif (`pan: { x, y }`) par glisser-déposer (souris et tactile) lorsque la carte est zoomée (`scale > 1.05`) avec clamping de sécurité.
  - [x] Ancrage `transformOrigin: 'top center'` et adaptation dynamique de la hauteur du conteneur pour que le haut de la carte ne dépasse jamais vers le haut de l'écran et ne recouvre pas les contrôles.
  - [x] Ajout du mode « Plein écran / Loupe centrée » (`Maximize2`) centré dans le viewport (`max-h-[72dvh] max-w-[85vw]`) avec contrôles flottants et support touche Échap, 100% garanti sans coupure.

---

### 4. 🦉 Harmonisation du « Déniché par » des Micro-Indés pour ne mettre que Hibouxe `[✅ 100% Terminé]`
- **Constat :** Plusieurs micro-indés de la sélection officielle affichaient "Quentin Beaud", "Communauté Hoot" ou "Hoot Bot" dans le champ `discoveredBy`.
- **Actions réalisées :**
  - [x] Remplacement de toutes les occurrences dans `src/data/microIndies.ts` pour que les 35 pépites portent uniformément la mention `discoveredBy: "Hibouxe"`.

---

### 5. 🛡️ Accès d'administration & validation des jeux Micro-Indés proposés `[✅ 100% Terminé]`
- **Constat :** Lorsqu'un visiteur propose un micro-indé via le formulaire, le jeu est enregistré avec `approved: false` dans `micro_indies.json`, mais l'administrateur n'avait pas d'accès direct pour consulter la file d'attente, valider ou refuser les jeux soumis.
- **Actions réalisées :**
  - [x] Ajout des actions d'administration sécurisées dans `public/api/micro_indies.php` (`admin_list`, `admin_approve`, `admin_unapprove`, `delete`) sous contrôle strict `isCreatorAdminAuthorized()`.
  - [x] Intégration des données de `micro_indies.json` dans l'endpoint `admin_overview` de `public/api/track.php` avec métriques des fichiers JSON.
  - [x] Ajout des fonctions et interfaces clientes dans `src/services/adminService.ts` (`approveAdminMicroIndie`, `deleteAdminMicroIndie`).
  - [x] Création de l'onglet dédié « Micro-Indés » (`microIndies`) dans `AdminDashboardModal.tsx` avec compteurs de badges en attente, prévisualisation complète de chaque proposition, bouton de validation en 1 clic (`Valider & Publier`) et suppression/rejet.
  - [x] Ajout d'un bouton d'accès rapide modération avec icône de bouclier dans `MicroIndieHub.tsx` pour l'administrateur Hibouxe connecté.

### 6. 💖 Toggle Like / Unlike et persistance des compteurs Micro-Indés `[✅ 100% Terminé]`
- **Constat :** Les votes sur les micro-indés ne permettaient pas de retirer son vote (contrairement aux pépites Steam). De plus, les compteurs de likes des 35 pépites initiales n'étaient pas persistés sur le serveur : au rechargement (Ctrl+F5), le cœur restait rouge mais le compteur retombait à sa valeur initiale et ne bougeait plus au clic.
- **Actions réalisées :**
  - [x] Implémenter le toggle Like / Unlike dans `MicroIndieHub.tsx` avec `isCurrentlyLiked ? 'unlike' : 'like'`.
  - [x] Sauvegarder de façon centralisée et atomique (`LOCK_EX`) les compteurs de likes de **tous les jeux** dans `micro_indies_votes.json` via `$vData['counts']`.
  - [x] Renvoyer `likesMap` dans les endpoints `action=list` et `action=user_likes` et l'appliquer au chargement initial du frontend pour écraser les compteurs par défaut.
  - [x] Retirer l'émoji diamant `💎` après les prix Steam.

---

### 7. 🌐 Affichage des prix Steam & Itch.io selon la localisation ou la langue choisie (ex: Yen au Japon) `[⏳ À faire]`
- **Objectif :** Afficher et convertir automatiquement les prix des jeux Steam et Itch.io dans la devise et le format correspondant à la langue ou au pays sélectionné par le visiteur sur le site (exemple : prix en Yen `¥` pour le Japon / langue `ja`, Dollar `$` pour `en`, Real `R$` pour `pt-BR`, Euro `€` pour `fr`, `de`, `es`).
- **Pistes d'implémentation :**
  - [ ] **Backend Steam API (`get_steam_info`)** :
    - Passer le code pays Steam `cc` (`cc=jp`, `cc=us`, `cc=br`, `cc=fr`, etc.) et la langue `l` (`japanese`, `english`, `brazilian`, `french`, etc.) lors des requêtes à l'API Steam Store `store.steampowered.com/api/appdetails`.
    - Sauvegarder les prix dans les différentes locales du dictionnaire `pricingText: { fr, en, es, de, ja, pt-BR }`.
  - [ ] **Itch.io & conversions de devises** :
    - Définir les règles de conversion ou de formatage selon la monnaie locale (USD / EUR / JPY / BRL).
  - [ ] **Frontend (`MicroIndieHub.tsx`, cartes de jeux, catalogue)** :
    - Sélectionner dynamiquement le texte de prix selon la locale active issue de `i18n.language` (`game.pricingText?.[activeLocale] || game.pricingText?.['en']`).
    - Gérer un repli élégant si une devise spécifique n'est pas encore renseignée.

---

## 📦 Historique des Fonctionnalités Déployées & Validées (Archive)

<details>
<summary><strong>Consulter les jalons précédents livrés avec succès (Cliquez pour dérouler)</strong></summary>

- **Gestion & Modération du Tchat Communautaire :**
  - Correction de la suppression des messages pour l'administrateur Hibouxe.
  - Option de purge complète (disparition totale) du message.
  - Accès direct en 1 clic à la modération du profil utilisateur depuis son pseudonyme dans le tchat.
  - Sécurisation stricte des pseudonymes avec regex alphanumérique (`[a-zA-Z0-9_-]`).
  - Adaptation dynamique du bouton de traduction automatique selon la langue active du site avec badge en direct.
- **Jeux d'Arcade & Ergonomie Mobile :**
  - Remplacement du menu vertical encombrant par un menu burger épuré en cours de jeu.
  - Correction des contrôles tactiles de Casse-Brique (maintien de touche sans perte de focus).
  - Correction du mode Contre IA dans la salle d'arcade.
  - Optimisation des performances des canvas de jeux.
- **Catalogue & Pépites Steam :**
  - 147 pépites certifiées avec 100% de conformité aux 9 règles d'audit (`npm run audit-db`).
  - Filtres multi-critères réactifs : prix, soldes, gratuité, genres.
  - Boîte à pépites (« Suggérer un jeu ») avec validation souveraine dans le tableau de bord admin.
- **Ambiance Sylvestre & Perchoir :**
  - Réhabilitation du Perchoir avec vraies vidéos, liens et dépôts d'Hibouxe / Edsaje.
  - Direction artistique sylvestre unifiée avec cadres de lierre et palette végétale.
  - Système de sauvegarde Cloud chiffré et authentification Steam OpenID / Invité.

</details>
