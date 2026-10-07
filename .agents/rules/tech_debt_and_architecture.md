# Règles Architecturales et Dette Technique

Ce fichier recense les règles absolues pour éviter la création de dette technique, issues des résolutions d'audits passés.

## 1. TypeScript : Gestion Sécurisée des Exceptions (No `any` in catch)
Il est strictement interdit d'utiliser `catch (err: any)`.
- **Règle** : Les blocs de capture d'erreur doivent utiliser `catch (err: unknown)`.
- **Extraction** : Pour récupérer le message d'erreur, utiliser impérativement un cast sécurisé :
  ```typescript
  catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    // Utiliser le message
  }
  ```

## 2. React : Refus des Monolithes et "Rules of Hooks"
Les composants React géants (plus de 500-1000 lignes) sont proscrits s'ils tentent d'embarquer des logiques distinctes (ex: tous les mini-jeux d'arcade dans un seul fichier, ou tous les onglets d'un dashboard).
- **Règle de Découpage** : Toute modale ou vue gérant plusieurs écrans/onglets/jeux doit déléguer le rendu et la logique à des sous-composants extraits dans un dossier dédié (ex: `src/components/arcade/games/`, `src/components/admin/tabs/`).
- **Rules of Hooks** : Aucun `if (!isOpen) return null;` ou autre *early return* ne doit précéder la définition des Hooks (`useState`, `useEffect`, `useRef`, etc.). Les conditions de retour de rendu doivent se trouver juste avant le `return (<JSX>);` principal du composant.

## 3. Backend PHP : Contraintes de Test Local et Scalabilité SQLite
Le backend de production tourne sur un hébergement mutualisé (OVH).
- **Absence de PHP Local** : Les agents IA n'ont pas accès à un environnement PHP local (`php -m` échouera). Par conséquent, les réécritures de fichiers critiques (comme `user_auth.php` ou `track.php`) sans possibilité de les tester sont considérées comme extrêmement risquées et doivent être fournies via des scripts séparés ou testées par l'utilisateur.
- **Scalabilité Base de données** : Le stockage de données haut volume (10 000+ utilisateurs) ne doit plus utiliser de fichiers plats JSON avec `flock($fp, LOCK_EX)` pour éviter les goulets d'étranglement de concurrence en lecture/écriture. La norme d'architecture cible pour la scalabilité backend est **SQLite** via PDO avec le mode `PRAGMA journal_mode = WAL;`.
