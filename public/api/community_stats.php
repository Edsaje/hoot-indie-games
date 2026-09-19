<?php
/**
 * Backend API de Statistiques Communautaires — Hoot Indie Games
 * - Collecte et sert les distributions d'essais pour les jeux quotidiens (Screenle, Indledle, Linkle, Profille).
 * - Calcule la moyenne des essais de la communauté par date.
 * - Stockage sécurisé dans community_stats.json avec verrouillage atomique (LOCK_EX).
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

$statsFile = __DIR__ . '/community_stats.json';
$rateLimitFile = __DIR__ . '/community_stats_ratelimit.json';
$validGames = ['screenle', 'indledle', 'linkle', 'profille', 'chrono', 'pixel'];

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

function checkRateLimit($rateLimitFile, $ip) {
    $now = time();
    $limits = [];
    if (file_exists($rateLimitFile)) {
        $raw = @file_get_contents($rateLimitFile);
        if ($raw) {
            $limits = json_decode($raw, true) ?: [];
        }
    }

    foreach ($limits as $k => $data) {
        if ($now - $data['reset'] > 600) {
            unset($limits[$k]);
        }
    }

    $ipKey = md5($ip . 'hoot_cs_salt');
    if (!isset($limits[$ipKey]) || $now > $limits[$ipKey]['reset']) {
        $limits[$ipKey] = ['count' => 1, 'reset' => $now + 60];
    } else {
        $limits[$ipKey]['count']++;
        if ($limits[$ipKey]['count'] > 60) {
            @file_put_contents($rateLimitFile, json_encode($limits), LOCK_EX);
            return false;
        }
    }

    @file_put_contents($rateLimitFile, json_encode($limits), LOCK_EX);
    return true;
}

function loadCommunityStats($statsFile) {
    if (!file_exists($statsFile)) {
        return [];
    }
    $raw = @file_get_contents($statsFile);
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

// Calcul de la moyenne des essais
function calculateAverage($distribution, $game) {
    $totalWins = 0;
    $sumWeighted = 0;

    foreach ($distribution as $key => $count) {
        if ($key !== 'fail' && is_numeric($key)) {
            $attempts = (int)$key;
            $count = (int)$count;
            $sumWeighted += $attempts * $count;
            $totalWins += $count;
        }
    }

    if ($totalWins === 0) return 0;
    return round($sumWeighted / $totalWins, 2);
}

// Générateur de courbe de base réaliste déterministe (fallback si début de journée ou peu de parties)
function getBaselineDistribution($game, $dateStr) {
    $hash = 0;
    for ($i = 0; $i < strlen($dateStr); $i++) {
        $hash = ($hash * 31 + ord($dateStr[$i])) % 10000;
    }

    if ($game === 'linkle') {
        // Linkle : 4 (perfect), 5 (1 mistake), 6 (2 mistakes), 7 (3 mistakes), fail
        return [
            '4' => 38 + ($hash % 8),
            '5' => 45 + (($hash * 3) % 10),
            '6' => 28 + (($hash * 7) % 7),
            '7' => 14 + (($hash * 5) % 5),
            'fail' => 9 + (($hash * 2) % 4),
        ];
    }

    if ($game === 'profille') {
        // Profille : score de 3/3, 2/3, 1/3, fail (0/3)
        return [
            '3' => 52 + ($hash % 10),
            '2' => 48 + (($hash * 3) % 8),
            '1' => 22 + (($hash * 5) % 6),
            'fail' => 7 + (($hash * 2) % 3),
        ];
    }

    if ($game === 'chrono') {
        // Chrono : Vies restantes (3, 2, 1) ou fail
        return [
            '3' => 46 + ($hash % 9),
            '2' => 52 + (($hash * 3) % 11),
            '1' => 24 + (($hash * 5) % 6),
            'fail' => 12 + (($hash * 2) % 4),
        ];
    }

    if ($game === 'pixel') {
        // Pixel : 1 à 5 essais + fail
        return [
            '1' => 10 + ($hash % 6),
            '2' => 32 + (($hash * 2) % 9),
            '3' => 58 + (($hash * 3) % 12),
            '4' => 36 + (($hash * 5) % 8),
            '5' => 18 + (($hash * 7) % 6),
            'fail' => 8 + (($hash * 11) % 4),
        ];
    }

    // Screenle & Indledle : 1 à 6 essais + fail
    return [
        '1' => 8 + ($hash % 5),
        '2' => 26 + (($hash * 2) % 8),
        '3' => 54 + (($hash * 3) % 12),
        '4' => 42 + (($hash * 5) % 10),
        '5' => 19 + (($hash * 7) % 6),
        '6' => 10 + (($hash * 11) % 5),
        'fail' => 6 + (($hash * 13) % 4),
    ];
}

$method = $_SERVER['REQUEST_METHOD'];

// 1. GET : Récupération de la distribution d'une date
if ($method === 'GET') {
    $game = trim($_GET['game'] ?? 'screenle');
    $date = trim($_GET['date'] ?? date('Y-m-d'));

    if (!in_array($game, $validGames, true)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Jeu invalide.']);
        exit;
    }

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        $date = date('Y-m-d');
    }

    $allStats = loadCommunityStats($statsFile);
    $dayStats = $allStats[$game][$date] ?? null;

    $baseline = getBaselineDistribution($game, $date);

    if (!$dayStats || ($dayStats['total'] ?? 0) < 5) {
        // Blending avec la distribution de référence réaliste
        $realDist = $dayStats['distribution'] ?? [];
        $mergedDist = [];
        $total = 0;

        foreach ($baseline as $k => $baseVal) {
            $realVal = isset($realDist[$k]) ? (int)$realDist[$k] : 0;
            $mergedDist[$k] = $baseVal + $realVal;
            $total += $mergedDist[$k];
        }

        $avg = calculateAverage($mergedDist, $game);

        echo json_encode([
            'status' => 'success',
            'game' => $game,
            'date' => $date,
            'total' => $total,
            'distribution' => $mergedDist,
            'averageAttempts' => $avg,
            'isBaseline' => true
        ]);
        exit;
    }

    $dist = $dayStats['distribution'];
    $total = (int)($dayStats['total'] ?? array_sum($dist));
    $avg = calculateAverage($dist, $game);

    echo json_encode([
        'status' => 'success',
        'game' => $game,
        'date' => $date,
        'total' => $total,
        'distribution' => $dist,
        'averageAttempts' => $avg,
        'isBaseline' => false
    ]);
    exit;
}

// 2. POST : Enregistrer la résolution d'un joueur
if ($method === 'POST') {
    $ip = getClientIp();
    if (!checkRateLimit($rateLimitFile, $ip)) {
        http_response_code(429);
        echo json_encode(['status' => 'error', 'message' => 'Trop de requêtes.']);
        exit;
    }

    $rawInput = file_get_contents('php://input');
    $payload = json_decode($rawInput, true);

    if (!$payload || !is_array($payload)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'JSON invalide.']);
        exit;
    }

    $game = trim($payload['game'] ?? '');
    $date = trim($payload['date'] ?? date('Y-m-d'));
    $won = !empty($payload['won']);
    $attempts = isset($payload['attempts']) ? (int)$payload['attempts'] : 0;

    if (!in_array($game, $validGames, true)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Jeu invalide.']);
        exit;
    }

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        $date = date('Y-m-d');
    }

    $bucketKey = $won ? (string)$attempts : 'fail';

    $allStats = loadCommunityStats($statsFile);
    if (!isset($allStats[$game])) $allStats[$game] = [];
    if (!isset($allStats[$game][$date])) {
        // Initialiser la journée
        $base = getBaselineDistribution($game, $date);
        $allStats[$game][$date] = [
            'total' => 0,
            'distribution' => array_fill_keys(array_keys($base), 0)
        ];
    }

    if (!isset($allStats[$game][$date]['distribution'][$bucketKey])) {
        $allStats[$game][$date]['distribution'][$bucketKey] = 0;
    }

    $allStats[$game][$date]['distribution'][$bucketKey]++;
    $allStats[$game][$date]['total'] = ($allStats[$game][$date]['total'] ?? 0) + 1;

    // Écriture atomique
    @file_put_contents($statsFile, json_encode($allStats, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);

    $dist = $allStats[$game][$date]['distribution'];
    $avg = calculateAverage($dist, $game);

    echo json_encode([
        'status' => 'success',
        'game' => $game,
        'date' => $date,
        'total' => $allStats[$game][$date]['total'],
        'distribution' => $dist,
        'averageAttempts' => $avg
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Méthode HTTP non autorisée.']);
