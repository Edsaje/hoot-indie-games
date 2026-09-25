<?php
/**
 * 🦉 Hoot Indie Games — Backend d'Administration des Jeux Souverain (CRUD Temps Réel)
 * 
 * Rôle :
 * 1. Permet au compte administrateur (ADMIN_STEAM_ID = '76561198035270542') de gérer en direct
 *    la ludothèque : ajouter des jeux, modifier des métadonnées, masquer/afficher ou supprimer.
 * 2. Persistance atomique dans games_override.json avec verrouillage exclusif LOCK_EX.
 * 3. Fournit une route publique sécurisée (action=public_overrides) pour que le frontend
 *    synchronise les modifications en temps réel sans recompiler l'application.
 */

ini_set('display_errors', 0);
error_reporting(0);

// Headers HTTP de sécurité & CORS
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
require_once __DIR__ . '/admin_auth.php';
sendCorsHeaders();
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$overrideFile = __DIR__ . '/games_override.json';

// Helper : Lecture sécurisée des données de surcharge
function loadGameOverrides($filePath) {
    $default = [
        'hiddenGameIds' => [],
        'modifiedGames' => (object)[],
        'customAdminGames' => [],
        'excludedFromGems' => ['kernel-hearts'],
        'promotedToGems' => [],
        'lastUpdated' => date('c'),
    ];

    if (!file_exists($filePath)) {
        return $default;
    }

    $raw = @file_get_contents($filePath);
    if (!$raw) {
        return $default;
    }

    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        return $default;
    }

    if (!isset($decoded['hiddenGameIds']) || !is_array($decoded['hiddenGameIds'])) {
        $decoded['hiddenGameIds'] = [];
    }
    if (!isset($decoded['modifiedGames']) || !is_array($decoded['modifiedGames'])) {
        $decoded['modifiedGames'] = (object)[];
    }
    if (!isset($decoded['customAdminGames']) || !is_array($decoded['customAdminGames'])) {
        $decoded['customAdminGames'] = [];
    }
    if (!isset($decoded['excludedFromGems']) || !is_array($decoded['excludedFromGems'])) {
        $decoded['excludedFromGems'] = ['kernel-hearts'];
    }
    if (!isset($decoded['promotedToGems']) || !is_array($decoded['promotedToGems'])) {
        $decoded['promotedToGems'] = [];
    }
    if (!isset($decoded['lastUpdated'])) {
        $decoded['lastUpdated'] = date('c');
    }

    return $decoded;
}

// Helper : Synchronisation automatique du nombre de jeux dans index.html (SEO & Réseaux Sociaux)
function syncIndexHtmlGameCount($overrides) {
    $candidates = [
        dirname(__DIR__) . '/index.html',
        dirname(dirname(__DIR__)) . '/index.html',
    ];
    $indexPath = null;
    foreach ($candidates as $cand) {
        if (file_exists($cand) && is_writable($cand)) {
            $indexPath = $cand;
            break;
        }
    }
    if (!$indexPath) return false;

    $html = @file_get_contents($indexPath);
    if (!$html) return false;

    // Déterminer le total exact des pépites uniques
    $baseCount = 185;
    $gamesTsPath = dirname(dirname(__DIR__)) . '/src/data/games.ts';
    if (file_exists($gamesTsPath)) {
        $tsContent = @file_get_contents($gamesTsPath);
        if ($tsContent && preg_match('/Total de jeux\s*:\s*(\d+)/i', $tsContent, $m)) {
            $baseCount = intval($m[1]);
        }
    }

    $excludedIds = array_flip($overrides['excludedFromGems'] ?? []);
    $hiddenIds = array_flip($overrides['hiddenGameIds'] ?? []);
    $promotedIds = $overrides['promotedToGems'] ?? [];

    $netBaseCount = $baseCount;
    foreach (array_keys($excludedIds) as $exId) {
        $netBaseCount--;
    }
    foreach (array_keys($hiddenIds) as $hidId) {
        if (!isset($excludedIds[$hidId])) {
            $netBaseCount--;
        }
    }

    $uniqueGemsAdded = [];
    foreach ($promotedIds as $pId) {
        if (!isset($excludedIds[$pId]) && !isset($hiddenIds[$pId])) {
            $uniqueGemsAdded[$pId] = true;
        }
    }
    $totalCount = max(1, $netBaseCount + count($uniqueGemsAdded));

    $patterns = [
        '/(<meta\s+name=["\']description["\']\s+content=["\']Le sanctuaire du jeu(?:\s+vidéo)?\s+indé\s*:\s*)\d+(\s*pépites certifiées)/i' => '${1}' . $totalCount . '${2}',
        '/(<meta\s+property=["\']og:description["\']\s+content=["\']Explorez\s*)\d+(\s*(?:chefs-d\'œuvre|pépites indés))/i' => '${1}' . $totalCount . '${2}',
        '/(<meta\s+name=["\']twitter:description["\']\s+content=["\'])\d+(\s*pépites indés)/i' => '${1}' . $totalCount . '${2}',
        '/(catalogue certifié de\s*)\d+(\s*pépites Steam)/i' => '${1}' . $totalCount . '${2}',
        '/(Catalogue Certifié de\s*)\d+(\s*Pépites)/i' => '${1}' . $totalCount . '${2}',
        '/(Catalogue Officiel des\s*)\d+(\s*Pépites)/i' => '${1}' . $totalCount . '${2}',
        '/(Catalogue officiel des\s*)\d+(\s*meilleures pépites)/i' => '${1}' . $totalCount . '${2}',
        '/(Collection Sylvestre de\s*)\d+(\s*Cartes à Collectionner)/i' => '${1}' . $totalCount . '${2}',
        '/(Collectionnez les\s*)\d+(\s*cartes de pépites indés)/i' => '${1}' . $totalCount . '${2}',
        '/(collection sylvestre de\s*)\d+(\s*cartes à collectionner)/i' => '${1}' . $totalCount . '${2}',
        '/(collection de\s*)\d+(\s*cartes à collectionner)/i' => '${1}' . $totalCount . '${2}',
        '/(de\s*)\d+(\s*cartes uniques réparties en 4 niveaux)/i' => '${1}' . $totalCount . '${2}',
        '/("numberOfItems":\s*)\d+/i' => '"numberOfItems": ' . $totalCount,
        '/(Le grand catalogue de référence des\s*)\d+/i' => 'Le grand catalogue de référence des ' . $totalCount,
        '/(catalogue certifié de\s*)\d+(\s*jeux indépendants)/i' => '${1}' . $totalCount . '${2}',
        '/(regroupant\s*)\d+(\s*pépites rigoureusement auditées)/i' => '${1}' . $totalCount . '${2}',
    ];

    $newHtml = preg_replace(array_keys($patterns), array_values($patterns), $html);
    if ($newHtml && $newHtml !== $html) {
        @file_put_contents($indexPath, $newHtml, LOCK_EX);
    }
    return true;
}

// Helper : Écriture atomique sécurisée
function saveGameOverrides($filePath, $data) {
    $data['lastUpdated'] = date('c');
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    $res = @file_put_contents($filePath, $json, LOCK_EX) !== false;
    if ($res) {
        syncIndexHtmlGameCount($data);
    }
    return $res;
}

// Récupération de l'action et des paramètres
$action = isset($_REQUEST['action']) ? trim($_REQUEST['action']) : 'get_all';
$steamId = isset($_REQUEST['steamId']) ? trim($_REQUEST['steamId']) : '';

// 1. Route publique de synchronisation (accessible sans être authentifié en admin)
if ($action === 'public_overrides') {
    $overrides = loadGameOverrides($overrideFile);
    echo json_encode([
        'success' => true,
        'hiddenGameIds' => $overrides['hiddenGameIds'],
        'modifiedGames' => $overrides['modifiedGames'],
        'customAdminGames' => $overrides['customAdminGames'],
        'excludedFromGems' => $overrides['excludedFromGems'],
        'promotedToGems' => $overrides['promotedToGems'],
        'lastUpdated' => $overrides['lastUpdated'],
    ]);
    exit;
}

// 2. Vérification stricte des permissions administrateur pour toutes les autres opérations
if (!isCreatorAdminAuthorized()) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Accès refusé : Session administrateur non authentifiée ou clé secrète manquante.',
    ]);
    exit;
}

$overrides = loadGameOverrides($overrideFile);

// Helper : Nettoyage d'une chaîne
function sanitizeStr($val) {
    return is_string($val) ? trim(strip_tags($val)) : '';
}

switch ($action) {
    // Liste complète pour le dashboard d'administration
    case 'get_all':
    case 'list':
        echo json_encode([
            'success' => true,
            'admin' => true,
            'hiddenGameIds' => $overrides['hiddenGameIds'],
            'modifiedGames' => $overrides['modifiedGames'],
            'customAdminGames' => $overrides['customAdminGames'],
            'excludedFromGems' => $overrides['excludedFromGems'],
            'promotedToGems' => $overrides['promotedToGems'],
            'lastUpdated' => $overrides['lastUpdated'],
        ]);
        break;

    // Basculer la visibilité d'un jeu (Masqué / Visible)
    case 'toggle_visibility':
        $gameId = isset($_POST['id']) ? sanitizeStr($_POST['id']) : (isset($_GET['id']) ? sanitizeStr($_GET['id']) : '');
        $hidden = isset($_POST['hidden']) ? (bool)$_POST['hidden'] : (isset($_GET['hidden']) ? (bool)$_GET['hidden'] : false);

        if (empty($gameId)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Identifiant de jeu requis.']);
            exit;
        }

        $hiddenIds = array_values(array_unique($overrides['hiddenGameIds']));
        if ($hidden) {
            if (!in_array($gameId, $hiddenIds, true)) {
                $hiddenIds[] = $gameId;
            }
        } else {
            $hiddenIds = array_values(array_filter($hiddenIds, function($id) use ($gameId) {
                return $id !== $gameId;
            }));
        }

        $overrides['hiddenGameIds'] = $hiddenIds;
        if (saveGameOverrides($overrideFile, $overrides)) {
            echo json_encode([
                'success' => true,
                'message' => $hidden ? "Le jeu '$gameId' a été masqué du catalogue public." : "Le jeu '$gameId' est de nouveau visible.",
                'gameId' => $gameId,
                'hidden' => $hidden,
                'hiddenGameIds' => $overrides['hiddenGameIds'],
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Échec de l\'écriture du fichier de persistance.']);
        }
        break;

    // Basculer le statut Pépite d'un jeu (affiché dans les Pépites ou Catalogue uniquement)
    case 'toggle_gem':
        $gameId = isset($_POST['id']) ? sanitizeStr($_POST['id']) : (isset($_GET['id']) ? sanitizeStr($_GET['id']) : '');
        $isGem = isset($_POST['isGem']) ? (bool)$_POST['isGem'] : (isset($_GET['isGem']) ? (bool)$_GET['isGem'] : false);

        if (empty($gameId)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Identifiant de jeu requis.']);
            exit;
        }

        $excluded = is_array($overrides['excludedFromGems']) ? $overrides['excludedFromGems'] : [];
        $promoted = is_array($overrides['promotedToGems']) ? $overrides['promotedToGems'] : [];

        if ($isGem) {
            // Retirer de la liste d'exclusion des pépites
            $excluded = array_values(array_filter($excluded, function($id) use ($gameId) {
                return $id !== $gameId;
            }));
            if (!in_array($gameId, $promoted, true)) {
                $promoted[] = $gameId;
            }
        } else {
            // Ajouter à la liste d'exclusion des pépites
            if (!in_array($gameId, $excluded, true)) {
                $excluded[] = $gameId;
            }
            $promoted = array_values(array_filter($promoted, function($id) use ($gameId) {
                return $id !== $gameId;
            }));
        }

        $overrides['excludedFromGems'] = $excluded;
        $overrides['promotedToGems'] = $promoted;

        if (saveGameOverrides($overrideFile, $overrides)) {
            echo json_encode([
                'success' => true,
                'message' => $isGem
                    ? "Le jeu '$gameId' apparaît désormais dans les Pépites."
                    : "Le jeu '$gameId' a été retiré des Pépites (il reste disponible dans le catalogue).",
                'gameId' => $gameId,
                'isGem' => $isGem,
                'excludedFromGems' => $overrides['excludedFromGems'],
                'promotedToGems' => $overrides['promotedToGems'],
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Échec de l\'écriture du fichier de persistance.']);
        }
        break;

    // Créer ou modifier un jeu
    case 'save_game':
        // Lecture du payload JSON s'il est envoyé dans php://input
        $rawInput = @file_get_contents('php://input');
        $payload = null;
        if (!empty($rawInput)) {
            $payload = json_decode($rawInput, true);
        }
        if (!$payload && !empty($_POST)) {
            $payload = $_POST;
        }

        if (!is_array($payload)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Payload de jeu invalide ou vide.']);
            exit;
        }

        $gameId = isset($payload['id']) ? sanitizeStr($payload['id']) : '';
        $title = isset($payload['title']) ? sanitizeStr($payload['title']) : '';
        $developer = isset($payload['developer']) ? sanitizeStr($payload['developer']) : '';
        $releaseYear = isset($payload['releaseYear']) ? intval($payload['releaseYear']) : 0;

        if (empty($title)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Le titre du jeu est obligatoire.']);
            exit;
        }

        if (empty($gameId)) {
            // Génération de slug automatique depuis le titre
            $slug = strtolower($title);
            $slug = preg_replace('/[^a-z0-9]+/i', '-', $slug);
            $slug = trim($slug, '-');
            $gameId = $slug ?: 'custom-game-' . time();
        }

        // Construction du jeu normalisé
        $isCustom = isset($payload['isCustomAdmin']) ? (bool)$payload['isCustomAdmin'] : false;
        
        $gameData = [
            'id' => $gameId,
            'title' => $title,
            'developer' => $developer ?: 'Studio Indé',
            'releaseYear' => $releaseYear > 1970 && $releaseYear < 2050 ? $releaseYear : intval(date('Y')),
            'genre' => isset($payload['genre']) && is_array($payload['genre']) ? array_values(array_filter(array_map('sanitizeStr', $payload['genre']))) : ['Indépendant'],
            'artStyle' => [
                'fr' => isset($payload['artStyle']['fr']) ? sanitizeStr($payload['artStyle']['fr']) : (isset($payload['artStyleFr']) ? sanitizeStr($payload['artStyleFr']) : 'Pixel Art'),
                'en' => isset($payload['artStyle']['en']) ? sanitizeStr($payload['artStyle']['en']) : (isset($payload['artStyleEn']) ? sanitizeStr($payload['artStyleEn']) : 'Pixel Art'),
            ],
            'camera' => [
                'fr' => isset($payload['camera']['fr']) ? sanitizeStr($payload['camera']['fr']) : (isset($payload['cameraFr']) ? sanitizeStr($payload['cameraFr']) : 'Vue de côté 2D'),
                'en' => isset($payload['camera']['en']) ? sanitizeStr($payload['camera']['en']) : (isset($payload['cameraEn']) ? sanitizeStr($payload['cameraEn']) : '2D Side-scroller'),
            ],
            'steamUrl' => isset($payload['steamUrl']) ? sanitizeStr($payload['steamUrl']) : '',
            'itchUrl' => isset($payload['itchUrl']) ? sanitizeStr($payload['itchUrl']) : '',
            'isFree' => isset($payload['isFree']) ? (bool)$payload['isFree'] : false,
            'playInBrowserUrl' => isset($payload['playInBrowserUrl']) ? sanitizeStr($payload['playInBrowserUrl']) : '',
            'headerImage' => isset($payload['headerImage']) ? sanitizeStr($payload['headerImage']) : '',
            'screenshots' => isset($payload['screenshots']) && is_array($payload['screenshots']) ? array_values(array_filter(array_map('sanitizeStr', $payload['screenshots']))) : [],
            'hints' => [
                'tagline' => [
                    'fr' => isset($payload['hints']['tagline']['fr']) ? sanitizeStr($payload['hints']['tagline']['fr']) : (isset($payload['taglineFr']) ? sanitizeStr($payload['taglineFr']) : "Une pépite indépendante inoubliable."),
                    'en' => isset($payload['hints']['tagline']['en']) ? sanitizeStr($payload['hints']['tagline']['en']) : (isset($payload['taglineEn']) ? sanitizeStr($payload['taglineEn']) : "An unforgettable indie masterpiece."),
                ],
                'composer' => isset($payload['hints']['composer']) ? sanitizeStr($payload['hints']['composer']) : (isset($payload['composer']) ? sanitizeStr($payload['composer']) : ''),
            ],
            'addedAt' => isset($payload['addedAt']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $payload['addedAt']) ? $payload['addedAt'] : date('Y-m-d'),
            'steamAppId' => isset($payload['steamAppId']) && is_numeric($payload['steamAppId']) ? intval($payload['steamAppId']) : null,
            'cardRarity' => isset($payload['cardRarity']) && in_array($payload['cardRarity'], ['common', 'rare', 'epic', 'legendary'], true) ? $payload['cardRarity'] : null,
        ];

        // Vérifier si le jeu existe déjà dans customAdminGames
        $customList = $overrides['customAdminGames'];
        $foundIndex = -1;
        for ($i = 0; $i < count($customList); $i++) {
            if ($customList[$i]['id'] === $gameId) {
                $foundIndex = $i;
                break;
            }
        }

        if ($foundIndex >= 0) {
            // Mise à jour du jeu personnalisé existant
            $customList[$foundIndex] = array_merge($customList[$foundIndex], $gameData);
            $overrides['customAdminGames'] = $customList;
        } else if ($isCustom) {
            // Nouveau jeu personnalisé créé par l'admin
            $customList[] = $gameData;
            $overrides['customAdminGames'] = $customList;
        } else {
            // Surcharge d'un jeu de base du catalogue
            $modified = is_array($overrides['modifiedGames']) ? $overrides['modifiedGames'] : (array)$overrides['modifiedGames'];
            $modified[$gameId] = $gameData;
            $overrides['modifiedGames'] = $modified;
        }

        // Gestion du statut Pépite (si spécifié dans le payload)
        if (isset($payload['isGem'])) {
            $isGem = (bool)$payload['isGem'];
            $excluded = is_array($overrides['excludedFromGems']) ? $overrides['excludedFromGems'] : [];
            $promoted = is_array($overrides['promotedToGems']) ? $overrides['promotedToGems'] : [];

            if ($isGem) {
                $excluded = array_values(array_filter($excluded, function($id) use ($gameId) {
                    return $id !== $gameId;
                }));
                if (!in_array($gameId, $promoted, true)) {
                    $promoted[] = $gameId;
                }
            } else {
                if (!in_array($gameId, $excluded, true)) {
                    $excluded[] = $gameId;
                }
                $promoted = array_values(array_filter($promoted, function($id) use ($gameId) {
                    return $id !== $gameId;
                }));
            }

            $overrides['excludedFromGems'] = $excluded;
            $overrides['promotedToGems'] = $promoted;
        }

        // Si le jeu était masqué et qu'on le sauvegarde, s'assurer qu'il n'est plus masqué sauf si explicite
        if (isset($payload['hidden']) && !$payload['hidden']) {
            $overrides['hiddenGameIds'] = array_values(array_filter($overrides['hiddenGameIds'], function($id) use ($gameId) {
                return $id !== $gameId;
            }));
        }

        if (saveGameOverrides($overrideFile, $overrides)) {
            echo json_encode([
                'success' => true,
                'message' => "Le jeu '$title' a été enregistré avec succès.",
                'game' => $gameData,
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Échec de l\'écriture du fichier de persistance.']);
        }
        break;

    // Supprimer un jeu (retire des customAdminGames ou marque comme masqué)
    case 'delete_game':
        $gameId = isset($_POST['id']) ? sanitizeStr($_POST['id']) : (isset($_GET['id']) ? sanitizeStr($_GET['id']) : '');
        if (empty($gameId)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Identifiant de jeu requis.']);
            exit;
        }

        // Retirer des jeux personnalisés
        $overrides['customAdminGames'] = array_values(array_filter($overrides['customAdminGames'], function($g) use ($gameId) {
            return $g['id'] !== $gameId;
        }));

        // Retirer des surcharges modifiées
        $modified = is_array($overrides['modifiedGames']) ? $overrides['modifiedGames'] : (array)$overrides['modifiedGames'];
        if (isset($modified[$gameId])) {
            unset($modified[$gameId]);
            $overrides['modifiedGames'] = $modified;
        }

        // Ajouter aux jeux masqués pour qu'il n'apparaisse plus sur le site
        if (!in_array($gameId, $overrides['hiddenGameIds'], true)) {
            $overrides['hiddenGameIds'][] = $gameId;
        }

        if (saveGameOverrides($overrideFile, $overrides)) {
            echo json_encode([
                'success' => true,
                'message' => "Le jeu '$gameId' a été supprimé et retiré du site.",
                'gameId' => $gameId,
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Échec de l\'écriture du fichier de persistance.']);
        }
        break;

    // Restaurer les valeurs canoniques d'origine d'un jeu
    case 'restore_game':
        $gameId = isset($_POST['id']) ? sanitizeStr($_POST['id']) : (isset($_GET['id']) ? sanitizeStr($_GET['id']) : '');
        if (empty($gameId)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Identifiant de jeu requis.']);
            exit;
        }

        // Retirer des jeux masqués
        $overrides['hiddenGameIds'] = array_values(array_filter($overrides['hiddenGameIds'], function($id) use ($gameId) {
            return $id !== $gameId;
        }));

        // Retirer des surcharges modifiées
        $modified = is_array($overrides['modifiedGames']) ? $overrides['modifiedGames'] : (array)$overrides['modifiedGames'];
        if (isset($modified[$gameId])) {
            unset($modified[$gameId]);
            $overrides['modifiedGames'] = $modified;
        }

        // Retirer des exclusions ou promotions de pépites
        if (isset($overrides['excludedFromGems']) && is_array($overrides['excludedFromGems'])) {
            $overrides['excludedFromGems'] = array_values(array_filter($overrides['excludedFromGems'], function($id) use ($gameId) {
                return $id !== $gameId;
            }));
        }
        if (isset($overrides['promotedToGems']) && is_array($overrides['promotedToGems'])) {
            $overrides['promotedToGems'] = array_values(array_filter($overrides['promotedToGems'], function($id) use ($gameId) {
                return $id !== $gameId;
            }));
        }

        if (saveGameOverrides($overrideFile, $overrides)) {
            echo json_encode([
                'success' => true,
                'message' => "Le jeu '$gameId' a été restauré dans sa configuration d'origine.",
                'gameId' => $gameId,
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Échec de l\'écriture du fichier de persistance.']);
        }
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Action inconnue '$action'."]);
        break;
}
