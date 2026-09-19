<?php
/**
 * Backend API de Gestion & Unicité des Pseudonymes Souveraine — Hoot Indie Games
 * Fonctionnalités :
 * 1. Vérification d'unicité en temps réel (O(1))
 * 2. Réservation atomique (LOCK_EX) de pseudonymes par joueur (userId / steamId)
 * 3. Protection stricte des pseudonymes réservés au créateur : "Hibouxe" et "Edsaje"
 *    (autorisés UNIQUEMENT pour le Steam ID officiel 76561198035270542)
 * 4. Normalisation intelligente (insensible à la casse, aux accents et aux espacements trompeurs)
 * 5. Protection contre les attaques par force brute (Rate-Limiting IP)
 */

ini_set('display_errors', 0);
error_reporting(0);

// Headers de sécurité
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
const FORBIDDEN_NORMALIZED_NAMES = ['hibouxe', 'edsaje'];

$storageFile = __DIR__ . '/registered_usernames.json';
$rateLimitFile = __DIR__ . '/usernames_ratelimit.json';

// Récupération IP client
function getClientIp() {
    $headers = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    foreach ($headers as $h) {
        if (!empty($_SERVER[$h])) {
            $parts = explode(',', $_SERVER[$h]);
            $ip = trim($parts[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
}

// Rate Limiting (max 60 requêtes / minute)
function checkUsernamesRateLimit($file, $ip) {
    $now = time();
    $limits = [];
    if (file_exists($file)) {
        $raw = @file_get_contents($file);
        if ($raw) $limits = json_decode($raw, true) ?: [];
    }
    foreach ($limits as $k => $d) {
        if ($now - ($d['reset'] ?? 0) > 300) unset($limits[$k]);
    }
    $key = md5($ip . '_hoot_usernames');
    if (!isset($limits[$key]) || $now > $limits[$key]['reset']) {
        $limits[$key] = ['count' => 1, 'reset' => $now + 60];
    } else {
        $limits[$key]['count']++;
        if ($limits[$key]['count'] > 60) {
            @file_put_contents($file, json_encode($limits), LOCK_EX);
            return false;
        }
    }
    @file_put_contents($file, json_encode($limits), LOCK_EX);
    return true;
}

// Normalisation du pseudo pour comparaison d'unicité (retire accents, séparateurs, casse)
function normalizeUsername($name) {
    $clean = mb_strtolower(trim($name), 'UTF-8');
    // Remplacement des caractères accentués courants
    $transliterator = [
        'à'=>'a', 'á'=>'a', 'â'=>'a', 'ã'=>'a', 'ä'=>'a', 'å'=>'a',
        'è'=>'e', 'é'=>'e', 'ê'=>'e', 'ë'=>'e',
        'ì'=>'i', 'í'=>'i', 'î'=>'i', 'ï'=>'i',
        'ò'=>'o', 'ó'=>'o', 'ô'=>'o', 'õ'=>'o', 'ö'=>'o',
        'ù'=>'u', 'ú'=>'u', 'û'=>'u', 'ü'=>'u',
        'ý'=>'y', 'ÿ'=>'y', 'ç'=>'c', 'ñ'=>'n'
    ];
    $clean = strtr($clean, $transliterator);
    // Supprimer les espaces, tirets, underscores et points pour détecter le squatting rusé
    $norm = preg_replace('/[^a-z0-9]/', '', $clean);
    return $norm;
}

// Vérifie si un pseudo est interdit (sauf pour l'administrateur Steam officiel)
function isNameForbidden($normalized, $steamId, $customForbidden = []) {
    if (strval($steamId) === ADMIN_STEAM_ID) {
        return false;
    }
    $allForbidden = array_unique(array_merge(FORBIDDEN_NORMALIZED_NAMES, $customForbidden));
    foreach ($allForbidden as $forbidden) {
        if (!empty($forbidden) && ($normalized === $forbidden || strpos($normalized, $forbidden) !== false)) {
            return true;
        }
    }
    return false;
}

// Chargement de la base des pseudos enregistrés
function loadUsernamesData($file) {
    $default = [
        'usernames' => [
            'hibouxe' => [
                'displayName' => 'Hibouxe',
                'steamId' => ADMIN_STEAM_ID,
                'userId' => 'admin_hibouxe',
                'claimedAt' => '2026-01-01T00:00:00Z',
                'role' => 'admin',
                'status' => 'active',
                'customTitle' => '👑 Créateur du Site',
                'isAdminReserved' => true,
                'isAdmin' => true
            ],
            'edsaje' => [
                'displayName' => 'Edsaje',
                'steamId' => ADMIN_STEAM_ID,
                'userId' => 'admin_edsaje',
                'claimedAt' => '2026-01-01T00:00:00Z',
                'role' => 'admin',
                'status' => 'active',
                'customTitle' => '👑 Créateur du Site',
                'isAdminReserved' => true,
                'isAdmin' => true
            ]
        ],
        'userToName' => [
            ADMIN_STEAM_ID => 'hibouxe',
            'steam_' . ADMIN_STEAM_ID => 'hibouxe'
        ],
        'forbiddenNames' => ['hibouxe', 'edsaje'],
        'bannedUsers' => []
    ];

    if (empty($file)) {
        return $default;
    }

    if (!file_exists($file) || filesize($file) === 0) {
        @file_put_contents($file, json_encode($default, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        return $default;
    }

    $raw = @file_get_contents($file);
    if (!$raw) {
        @file_put_contents($file, json_encode($default, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        return $default;
    }

    $data = json_decode($raw, true);
    if (!is_array($data) || !isset($data['usernames']) || !is_array($data['usernames'])) {
        @file_put_contents($file, json_encode($default, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        return $default;
    }

    $dirty = false;
    // Assurer la présence des réservations créateur
    if (!isset($data['usernames']['hibouxe'])) {
        $data['usernames']['hibouxe'] = $default['usernames']['hibouxe'];
        $dirty = true;
    }
    if (!isset($data['usernames']['edsaje'])) {
        $data['usernames']['edsaje'] = $default['usernames']['edsaje'];
        $dirty = true;
    }
    if (!isset($data['forbiddenNames']) || !is_array($data['forbiddenNames'])) {
        $data['forbiddenNames'] = ['hibouxe', 'edsaje'];
        $dirty = true;
    }
    if (!isset($data['bannedUsers']) || !is_array($data['bannedUsers'])) {
        $data['bannedUsers'] = [];
        $dirty = true;
    }

    if ($dirty) {
        @file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    }

    return $data;
}

$clientIp = getClientIp();
if (!checkUsernamesRateLimit($rateLimitFile, $clientIp)) {
    http_response_code(429);
    echo json_encode(['success' => false, 'error' => 'rate_limit', 'message' => 'Trop de requêtes. Veuillez patienter un instant.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// -------------------------------------------------------------
// 1. GET : VÉRIFIER LA DISPONIBILITÉ OU LISTER LES PSEUDOS
// -------------------------------------------------------------
if ($method === 'GET') {
    $action = trim($_GET['action'] ?? 'check');
    $rawName = trim($_GET['username'] ?? '');
    $userId = trim($_GET['userId'] ?? '');
    $steamId = trim($_GET['steamId'] ?? '');

    // Action d'administration : lister l'ensemble des comptes enregistrés
    if ($action === 'list' && strval($steamId) === ADMIN_STEAM_ID) {
        $db = loadUsernamesData($storageFile);
        echo json_encode([
            'success' => true,
            'usernames' => $db['usernames'] ?? [],
            'forbiddenNames' => $db['forbiddenNames'] ?? [],
            'bannedUsers' => $db['bannedUsers'] ?? []
        ]);
        exit;
    }

    if (empty($rawName)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'available' => false, 'error' => 'missing_username', 'message' => 'Veuillez fournir un pseudonyme.']);
        exit;
    }

    $cleanDisplay = htmlspecialchars(strip_tags($rawName), ENT_QUOTES, 'UTF-8');
    $cleanDisplay = preg_replace('/[\x00-\x1F\x7F]/u', '', $cleanDisplay);
    $len = mb_strlen($cleanDisplay, 'UTF-8');

    if ($len < 2 || $len > 24) {
        echo json_encode([
            'success' => true,
            'available' => false,
            'reason' => 'invalid_length',
            'message' => 'Le pseudonyme doit comporter entre 2 et 24 caractères.'
        ]);
        exit;
    }

    $normalized = normalizeUsername($cleanDisplay);

    $db = loadUsernamesData($storageFile);

    // Vérification compte banni
    if (!empty($db['bannedUsers'])) {
        if ((!empty($steamId) && in_array($steamId, $db['bannedUsers'])) ||
            (!empty($userId) && in_array($userId, $db['bannedUsers']))) {
            echo json_encode([
                'success' => true,
                'available' => false,
                'reason' => 'banned',
                'message' => 'Ce compte est suspendu par la modération.'
            ]);
            exit;
        }
    }

    $customForbidden = $db['forbiddenNames'] ?? [];
    if (isNameForbidden($normalized, $steamId, $customForbidden)) {
        echo json_encode([
            'success' => true,
            'available' => false,
            'reason' => 'forbidden',
            'message' => 'Ce pseudonyme fait partie des termes protégés ou réservés.'
        ]);
        exit;
    }

    $claimed = $db['usernames'][$normalized] ?? null;

    if ($claimed) {
        // Est-ce le même utilisateur ?
        $isSameUser = (!empty($userId) && ($claimed['userId'] ?? '') === $userId)
                   || (!empty($steamId) && ($claimed['steamId'] ?? '') === $steamId);

        if ($isSameUser) {
            echo json_encode([
                'success' => true,
                'available' => true,
                'isOwn' => true,
                'message' => 'Ce pseudonyme vous appartient déjà.'
            ]);
            exit;
        }

        echo json_encode([
            'success' => true,
            'available' => false,
            'reason' => 'taken',
            'message' => 'Ce pseudonyme est déjà pris par un autre joueur.'
        ]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'available' => true,
        'message' => 'Ce pseudonyme est libre !'
    ]);
    exit;
}

// -------------------------------------------------------------
// 2. POST : ENREGISTRER / REVENDIQUER UN PSEUDO
// -------------------------------------------------------------
if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $payload = json_decode($rawInput, true);

    if (!is_array($payload)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'invalid_json', 'message' => 'Corps JSON invalide.']);
        exit;
    }

    $rawName = trim($payload['username'] ?? '');
    $userId = trim($payload['userId'] ?? '');
    $steamId = trim($payload['steamId'] ?? '');

    if (empty($rawName)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'missing_username', 'message' => 'Pseudonyme requis.']);
        exit;
    }

    if (empty($userId) && empty($steamId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'missing_identity', 'message' => 'Identifiant utilisateur ou Steam requis.']);
        exit;
    }

    $cleanDisplay = htmlspecialchars(strip_tags($rawName), ENT_QUOTES, 'UTF-8');
    $cleanDisplay = preg_replace('/[\x00-\x1F\x7F]/u', '', $cleanDisplay);
    $len = mb_strlen($cleanDisplay, 'UTF-8');

    if ($len < 2 || $len > 24) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'invalid_length', 'message' => 'Le pseudonyme doit comporter entre 2 et 24 caractères.']);
        exit;
    }

    // Caractères autorisés : lettres, chiffres, espaces, tirets, underscores, apostrophes et ponctuation gamer
    if (!preg_match('/^[\p{L}\p{N}\s_\'#.\-\[\]\(\)\|\!\?\*\~\^\:\@]+$/u', $cleanDisplay)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'invalid_characters', 'message' => 'Caractères spéciaux non autorisés dans le pseudonyme.']);
        exit;
    }

    $normalized = normalizeUsername($cleanDisplay);
    if (empty($normalized)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'invalid_normalized', 'message' => 'Pseudonyme invalide après normalisation.']);
        exit;
    }

    $preDb = loadUsernamesData($storageFile);

    // Vérification compte banni
    if (!empty($preDb['bannedUsers'])) {
        if ((!empty($steamId) && in_array($steamId, $preDb['bannedUsers'])) ||
            (!empty($userId) && in_array($userId, $preDb['bannedUsers']))) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'banned', 'message' => 'Ce compte est suspendu par la modération.']);
            exit;
        }
    }

    // Vérification des noms interdits et protégés
    $customForbidden = $preDb['forbiddenNames'] ?? [];
    if (isNameForbidden($normalized, $steamId, $customForbidden)) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'forbidden',
            'message' => 'Ce pseudonyme fait partie des termes protégés ou réservés.'
        ]);
        exit;
    }

    // Ouverture et verrouillage atomique du fichier
    $fp = fopen($storageFile, 'c+');
    if (!$fp || !flock($fp, LOCK_EX)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'lock_failed', 'message' => 'Serveur occupé. Veuillez réessayer.']);
        exit;
    }

    $size = filesize($storageFile);
    $content = $size > 0 ? fread($fp, $size) : '';
    $db = json_decode($content, true);

    if (!is_array($db) || !isset($db['usernames']) || empty($db['usernames'])) {
        $db = loadUsernamesData('');
    }

    $claimed = $db['usernames'][$normalized] ?? null;

    if ($claimed) {
        $isSameUser = (!empty($userId) && ($claimed['userId'] ?? '') === $userId)
                   || (!empty($steamId) && ($claimed['steamId'] ?? '') === $steamId);

        // Si c'est l'admin officiel
        if (strval($steamId) === ADMIN_STEAM_ID && !empty($claimed['isAdminReserved'])) {
            $isSameUser = true;
        }

        if (!$isSameUser) {
            flock($fp, LOCK_UN);
            fclose($fp);
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'error' => 'already_taken',
                'message' => 'Ce pseudonyme est déjà utilisé par un autre joueur.'
            ]);
            exit;
        }
    }

    // Libérer l'ancien pseudo lié à cet utilisateur s'il existait
    $identKey = !empty($steamId) ? "steam_{$steamId}" : "user_{$userId}";
    $oldNorm = $db['userToName'][$identKey] ?? null;
    if ($oldNorm && $oldNorm !== $normalized && isset($db['usernames'][$oldNorm])) {
        // Ne pas supprimer les réservations admin préconfigurées
        if (empty($db['usernames'][$oldNorm]['isAdminReserved'])) {
            unset($db['usernames'][$oldNorm]);
        }
    }

    // Enregistrer le nouveau pseudo avec l'ensemble des métadonnées requises
    $nowIso = date('c');
    $isAdmin = (strval($steamId) === ADMIN_STEAM_ID);
    $db['usernames'][$normalized] = [
        'displayName' => $cleanDisplay,
        'userId' => $userId,
        'steamId' => !empty($steamId) ? strval($steamId) : null,
        'claimedAt' => $claimed['claimedAt'] ?? $nowIso,
        'updatedAt' => $nowIso,
        'lastSeenAt' => $nowIso,
        'role' => $isAdmin ? 'admin' : ($claimed['role'] ?? 'user'),
        'status' => $claimed['status'] ?? 'active',
        'customTitle' => $isAdmin ? '👑 Créateur du Site' : ($claimed['customTitle'] ?? ''),
        'note' => $claimed['note'] ?? '',
        'isAdminReserved' => $isAdmin || !empty($claimed['isAdminReserved']),
        'isAdmin' => $isAdmin
    ];
    $db['userToName'][$identKey] = $normalized;
    if (!empty($steamId)) {
        $db['userToName'][strval($steamId)] = $normalized;
        $db['userToName']['steam_' . strval($steamId)] = $normalized;
    }

    // Réécriture atomique
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);

    echo json_encode([
        'success' => true,
        'username' => $cleanDisplay,
        'normalized' => $normalized,
        'message' => 'Pseudonyme validé et enregistré avec succès !',
        'isAdmin' => $isAdmin
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'method_not_allowed', 'message' => 'Méthode non autorisée.']);
