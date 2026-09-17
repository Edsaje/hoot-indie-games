# 🚀 Guide de Déploiement Gratuit — Hoot Indie Games

Ce guide vous explique comment héberger votre site **100% gratuitement**, avec HTTPS automatique, CDN mondial ultra-rapide et déploiement continu à chaque `git push`.

---

## ⚡ Option 1 : Vercel (Recommandée — 2 minutes chrono)

Vercel est la plateforme idéale pour les applications Vite / React :

1. Rendez-vous sur **[vercel.com](https://vercel.com)** et connectez-vous avec votre compte **GitHub**.
2. Cliquez sur **"Add New..."** ➔ **"Project"**.
3. Sélectionnez votre dépôt : `Edsaje/hoot-indie-games`.
4. Vercel détecte automatiquement la configuration Vite :
   - **Framework Preset** : `Vite`
   - **Root Directory** : `./`
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
5. *(Optionnel)* Dans **Environment Variables**, ajoutez les clés Supabase si vous activez le backend en ligne :
   - `VITE_SUPABASE_URL` = `https://votre-projet.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `votre-cle-anon-publique`
6. Cliquez sur **"Deploy"**.
7. En moins de 45 secondes, votre site est en ligne avec un lien `https://hoot-indie-games.vercel.app` !

> [!NOTE]
> Le fichier [`vercel.json`](file:///home/user/hoot-indie-games/vercel.json) est déjà préconfiguré dans le dépôt pour gérer le routage SPA et les deep-links (`#linkle=...`, `#room=...`).

---

## 🌐 Option 2 : Cloudflare Pages

Cloudflare Pages offre une bande passante illimitée et une latence minimale au niveau mondial :

1. Connectez-vous sur **[Cloudflare Dashboard](https://dash.cloudflare.com/)** ➔ **Workers & Pages**.
2. Cliquez sur **Create application** ➔ **Pages** ➔ **Connect to Git**.
3. Choisissez le repo `Edsaje/hoot-indie-games`.
4. Paramètres de compilation :
   - **Framework preset** : `Vite`
   - **Build command** : `npm run build`
   - **Build output directory** : `dist`
5. Cliquez sur **Save and Deploy**.
6. Le fichier [`public/_redirects`](file:///home/user/hoot-indie-games/public/_redirects) inclus redirige automatiquement toutes les requêtes vers `index.html`.

---

## 🏰 Option 3 : Hébergement OVHcloud (Déploiement Continu Automatique)

Votre hébergement web statique OVH est synchronisé automatiquement à chaque mise à jour :

1. Rendez-vous sur votre dépôt GitHub : **Settings** ➔ **Secrets and variables** ➔ **Actions**.
2. Cliquez sur **New repository secret** et ajoutez :
   - Nom du secret : `OVH_FTP_PASSWORD`
   - Valeur : votre mot de passe FTP associé à l'identifiant `hootinu`.
3. C'est tout ! Dès que vous poussez du code ou que le robot de moissonnage nocturne découvre de nouvelles pépites indés, GitHub compile le site et l'envoie directement sur `ftp.cluster129.hosting.ovh.net` dans `/www`.

---

## 🔒 Comment garantir que 100% des données restent vraies ?

Pour maintenir la règle **0 Hallucination** et garantir l'authenticité absolue des données :

1. **Audit automatisé** :
   Lancez la commande suivante à tout moment :
   ```bash
   npm run audit-db
   ```
   Ce script vérifie la conformité de l'ensemble des 83 jeux certifiés :
   - Présence d'un titre officiel et d'une URL Steam valide
   - Date de sortie réelle vérifiée
   - Développeurs et compositeurs officiels
   - Normalisation stricte de la vue caméra et de la direction artistique
   - Taglines bilingues authentiques en français et en anglais

2. **Ajout de nouveaux jeux via l'API Steam** :
   Ne saisissez jamais d'informations au hasard ! Utilisez notre script officiel :
   ```bash
   npm run add-game <steam_app_id>
   ```
   Les métadonnées (titre, dates de sortie, captures officielles en haute résolution, développeurs) sont directement extraites des serveurs de Valve.
