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
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

const ADMIN_STEAM_ID = '76561198035270542';
$overrideFile = __DIR__ . '/games_override.json';

// Helper : Lecture sécurisée des données de surcharge
function loadGameOverrides($filePath) {
    $default = [
        'hiddenGameIds' => [],
        'modifiedGames' => (object)[],
        'customAdminGames' => [],
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
    if (!isset($decoded['lastUpdated'])) {
        $decoded['lastUpdated'] = date('c');
    }

    return $decoded;
}

// Helper : Écriture atomique sécurisée
function saveGameOverrides($filePath, $data) {
    $data['lastUpdated'] = date('c');
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    return @file_put_contents($filePath, $json, LOCK_EX) !== false;
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
        'lastUpdated' => $overrides['lastUpdated'],
    ]);
    exit;
}

// 2. Vérification stricte des permissions administrateur pour toutes les autres opérations
if ($steamId !== ADMIN_STEAM_ID) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Accès refusé : Seul le compte créateur souverain (Steam ID ' . ADMIN_STEAM_ID . ') peut administrer le catalogue.',
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
                'fr' => isset($payload['artStyle']['fr']) ? sanitizeStr($payload['artStyle']['fr']) : (isset($payload['artStyleFr']) ? sanitizeStr($payload['artStyleFr']) : '2D Pixel Art'),
                'en' => isset($payload['artStyle']['en']) ? sanitizeStr($payload['artStyle']['en']) : (isset($payload['artStyleEn']) ? sanitizeStr($payload['artStyleEn']) : '2D Pixel Art'),
            ],
            'camera' => [
                'fr' => isset($payload['camera']['fr']) ? sanitizeStr($payload['camera']['fr']) : (isset($payload['cameraFr']) ? sanitizeStr($payload['cameraFr']) : 'Vue de côté 2D'),
                'en' => isset($payload['camera']['en']) ? sanitizeStr($payload['camera']['en']) : (isset($payload['cameraEn']) ? sanitizeStr($payload['cameraEn']) : '2D Side View'),
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
