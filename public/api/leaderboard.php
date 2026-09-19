<?php
/**
 * Backend API de Leaderboard / Classement en Ligne Souverain — Hoot Indie Games
 * - Gère les classements mondiaux de la Salle d'Arcade (8 bornes) et du Time Attack (4 sprints).
 * - Stockage JSON sécurisé (.htaccess interdit tout accès web direct).
 * - Protection anti-spam par limitation de débit IP (rate-limiting).
 * - Validation stricte des catégories, jeux, scores et pseudonymes (anti-XSS / injection).
 */

ini_set('display_errors', 0);
error_reporting(0);

// Headers de sécurité HTTP stricts
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

$dataFile = __DIR__ . '/leaderboard_data.json';
$rateLimitFile = __DIR__ . '/leaderboard_ratelimit.json';

// Whitelist des catégories et jeux autorisés
$validCategories = [
    'arcade' => ['snake', 'pong', 'breakout', 'flappy', 'invaders', 'run', 'tetris', 'vectrex'],
    'timeattack' => ['screenle', 'indledle', 'linkle', 'profille', 'chrono', 'pixel', 'review', 'blindtest']
];

// Whitelist des avatars
$validAvatars = ['owl_wood', 'owl_golden', 'owl_emerald', 'owl_neon', 'owl_shadow', 'owl_cyber', 'owl_cosmic', 'owl_snow'];

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

// Rate limiting (max 30 requêtes d'écriture par minute par IP)
function checkRateLimit($rateLimitFile, $ip) {
    $now = time();
    $limits = [];
    if (file_exists($rateLimitFile)) {
        $raw = @file_get_contents($rateLimitFile);
        if ($raw) {
            $limits = json_decode($raw, true) ?: [];
        }
    }

    // Nettoyer les entrées de plus de 10 minutes
    foreach ($limits as $k => $data) {
        if ($now - $data['reset'] > 600) {
            unset($limits[$k]);
        }
    }

    $ipKey = md5($ip . 'hoot_lb_salt');
    if (!isset($limits[$ipKey]) || $now > $limits[$ipKey]['reset']) {
        $limits[$ipKey] = ['count' => 1, 'reset' => $now + 60];
    } else {
        $limits[$ipKey]['count']++;
        if ($limits[$ipKey]['count'] > 30) {
            @file_put_contents($rateLimitFile, json_encode($limits), LOCK_EX);
            return false;
        }
    }

    @file_put_contents($rateLimitFile, json_encode($limits), LOCK_EX);
    return true;
}

// Chargement sécurisé de la base
function loadLeaderboardData($dataFile) {
    if (!file_exists($dataFile)) {
        return ['arcade' => [], 'timeattack' => []];
    }
    $content = @file_get_contents($dataFile);
    if (!$content) {
        return ['arcade' => [], 'timeattack' => []];
    }
    $data = json_decode($content, true);
    if (!is_array($data)) {
        return ['arcade' => [], 'timeattack' => []];
    }
    if (!isset($data['arcade'])) $data['arcade'] = [];
    if (!isset($data['timeattack'])) $data['timeattack'] = [];
    return $data;
}

// -------------------------------------------------------------
// TRAITEMENT DES REQUÊTES
// -------------------------------------------------------------

$method = $_SERVER['REQUEST_METHOD'];

// 1. GET : Récupérer le classement d'un jeu
if ($method === 'GET') {
    $category = trim($_GET['category'] ?? 'arcade');
    $game = trim($_GET['game'] ?? 'snake');
    $limit = isset($_GET['limit']) ? min(max(1, (int)$_GET['limit']), 50) : 10;

    if (!isset($validCategories[$category]) || !in_array($game, $validCategories[$category], true)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Catégorie ou jeu invalide.']);
        exit;
    }

    $data = loadLeaderboardData($dataFile);
    $scores = $data[$category][$game] ?? [];

    // Formatage avec rangs calculés
    $leaderboard = [];
    $rank = 1;
    foreach ($scores as $s) {
        $leaderboard[] = [
            'rank' => $rank++,
            'id' => $s['id'] ?? ('entry_' . $rank),
            'nickname' => $s['nickname'] ?? 'Hibou Anonyme',
            'score' => (int)($s['score'] ?? 0),
            'avatar' => $s['avatar'] ?? 'owl_wood',
            'date' => $s['date'] ?? date('Y-m-d'),
        ];
        if (count($leaderboard) >= $limit) break;
    }

    echo json_encode([
        'status' => 'success',
        'category' => $category,
        'game' => $game,
        'totalEntries' => count($scores),
        'leaderboard' => $leaderboard,
    ]);
    exit;
}

// 2. POST : Enregistrer un nouveau score
if ($method === 'POST') {
    $ip = getClientIp();
    if (!checkRateLimit($rateLimitFile, $ip)) {
        http_response_code(429);
        echo json_encode(['status' => 'error', 'message' => 'Trop de requêtes. Veuillez patienter.']);
        exit;
    }

    $rawInput = file_get_contents('php://input');
    $payload = json_decode($rawInput, true);

    if (!$payload || !is_array($payload)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Corps JSON invalide.']);
        exit;
    }

    $category = trim($payload['category'] ?? '');
    $game = trim($payload['game'] ?? '');
    $score = isset($payload['score']) ? (int)$payload['score'] : 0;
    $rawNickname = trim($payload['nickname'] ?? '');
    $avatar = trim($payload['avatar'] ?? 'owl_wood');

    // Vérification de catégorie et jeu
    if (!isset($validCategories[$category]) || !in_array($game, $validCategories[$category], true)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Catégorie ou jeu invalide.']);
        exit;
    }

    // Validation du score
    if ($score <= 0 || $score > 10000000) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Score aberrant ou invalide.']);
        exit;
    }

    // Assainissement du pseudonyme
    $cleanNick = htmlspecialchars(strip_tags($rawNickname), ENT_QUOTES, 'UTF-8');
    // Supprimer les caractères de contrôle
    $cleanNick = preg_replace('/[\x00-\x1F\x7F]/u', '', $cleanNick);
    if (mb_strlen($cleanNick, 'UTF-8') < 2) {
        $cleanNick = 'Hibou Anonyme';
    } elseif (mb_strlen($cleanNick, 'UTF-8') > 16) {
        $cleanNick = mb_substr($cleanNick, 0, 16, 'UTF-8');
    }

    if (!in_array($avatar, $validAvatars, true)) {
        $avatar = 'owl_wood';
    }

    $entryId = 'score_' . bin2hex(random_bytes(8));
    $entryDate = date('Y-m-d');

    $data = loadLeaderboardData($dataFile);
    if (!isset($data[$category][$game])) {
        $data[$category][$game] = [];
    }

    $newEntry = [
        'id' => $entryId,
        'nickname' => $cleanNick,
        'score' => $score,
        'avatar' => $avatar,
        'date' => $entryDate,
        'timestamp' => time()
    ];

    $data[$category][$game][] = $newEntry;

    // Trier par score décroissant (puis date la plus ancienne en cas d'égalité)
    usort($data[$category][$game], function($a, $b) {
        if ($b['score'] !== $a['score']) {
            return $b['score'] - $a['score'];
        }
        return ($a['timestamp'] ?? 0) - ($b['timestamp'] ?? 0);
    });

    // Conserver les 100 meilleurs scores uniquement
    if (count($data[$category][$game]) > 100) {
        $data[$category][$game] = array_slice($data[$category][$game], 0, 100);
    }

    // Trouver le rang obtenu
    $playerRank = 0;
    foreach ($data[$category][$game] as $idx => $s) {
        if (($s['id'] ?? '') === $entryId) {
            $playerRank = $idx + 1;
            break;
        }
    }

    // Écriture atomique
    @file_put_contents($dataFile, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);

    // Retourner le top 10 formaté
    $top10 = [];
    foreach (array_slice($data[$category][$game], 0, 10) as $i => $item) {
        $top10[] = [
            'rank' => $i + 1,
            'id' => $item['id'] ?? ('e_' . ($i + 1)),
            'nickname' => $item['nickname'],
            'score' => (int)$item['score'],
            'avatar' => $item['avatar'] ?? 'owl_wood',
            'date' => $item['date'] ?? $entryDate
        ];
    }

    echo json_encode([
        'status' => 'success',
        'rank' => $playerRank,
        'totalEntries' => count($data[$category][$game]),
        'leaderboard' => $top10
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Méthode HTTP non autorisée.']);
