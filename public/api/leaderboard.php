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
    'timeattack' => ['screenle', 'indledle', 'linkle', 'profille', 'chrono', 'pixel', 'review', 'blindtest'],
    'quiz' => ['standard', 'survival', 'infinite']
];

// Whitelist des avatars
$validAvatars = [
    'owl_wood', 'owl_golden', 'owl_emerald', 'owl_neon', 'owl_shadow', 'owl_cyber', 'owl_cosmic', 'owl_snow',
    'owl', 'knight', 'madeline', 'zagreus', 'lamb', 'joker', 'cat', 'goose',
    'shovel_knight', 'sans', 'cuphead', 'isaac', 'penitent', 'beheaded', 'niko',
    'meat_boy', 'baba', 'hornet', 'omori', 'claire', 'drifter', 'slugcat',
    'golden_sylvestre', 'celestial_knight', 'golden_hornet', 'retro_ghost'
];

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

// Nettoyer et dédupliquer les entrées pour ne conserver que le MEILLEUR score par compte/pseudo
function deduplicateLeaderboardEntries(array $entries): array {
    usort($entries, function($a, $b) {
        $scoreA = (int)($a['score'] ?? 0);
        $scoreB = (int)($b['score'] ?? 0);
        if ($scoreB !== $scoreA) {
            return $scoreB - $scoreA;
        }
        return (int)($a['timestamp'] ?? 0) - (int)($b['timestamp'] ?? 0);
    });

    $seenAcc = [];
    $seenNick = [];
    $deduped = [];

    foreach ($entries as $entry) {
        $acc = trim($entry['accountId'] ?? '');
        $nick = strtolower(trim($entry['nickname'] ?? ''));

        if (!empty($acc) && isset($seenAcc[$acc])) {
            continue;
        }
        if (!empty($nick) && isset($seenNick[$nick])) {
            continue;
        }

        if (!empty($acc)) {
            $seenAcc[$acc] = true;
        }
        if (!empty($nick)) {
            $seenNick[$nick] = true;
        }

        $deduped[] = $entry;
    }

    return $deduped;
}

// Chargement sécurisé de la base
function loadLeaderboardData($dataFile) {
    if (!file_exists($dataFile)) {
        return ['arcade' => [], 'timeattack' => [], 'quiz' => []];
    }
    $content = @file_get_contents($dataFile);
    if (!$content) {
        return ['arcade' => [], 'timeattack' => [], 'quiz' => []];
    }
    $data = json_decode($content, true);
    if (!is_array($data)) {
        return ['arcade' => [], 'timeattack' => [], 'quiz' => []];
    }
    if (!isset($data['arcade'])) $data['arcade'] = [];
    if (!isset($data['timeattack'])) $data['timeattack'] = [];
    if (!isset($data['quiz'])) $data['quiz'] = [];
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
    $period = trim($_GET['period'] ?? 'all'); // 'all' | 'daily'
    $limit = isset($_GET['limit']) ? min(max(1, (int)$_GET['limit']), 50) : 10;

    if (!isset($validCategories[$category]) || !in_array($game, $validCategories[$category], true)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Catégorie ou jeu invalide.']);
        exit;
    }

    $data = loadLeaderboardData($dataFile);
    $scores = $data[$category][$game] ?? [];
    $scores = deduplicateLeaderboardEntries($scores);

    // Filtre période (Quotidien vs Tous les temps)
    $today = date('Y-m-d');
    if ($period === 'daily') {
        $scores = array_values(array_filter($scores, function($s) use ($today) {
            return ($s['date'] ?? '') === $today;
        }));
    }

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
            'date' => $s['date'] ?? $today,
        ];
        if (count($leaderboard) >= $limit) break;
    }

    echo json_encode([
        'status' => 'success',
        'category' => $category,
        'game' => $game,
        'period' => $period,
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

    $action = trim($payload['action'] ?? '');

    // Action A : Mise à jour globale du pseudonyme et avatar pour un joueur sur TOUS ses scores
    if ($action === 'update_player_profile') {
        $accountId = trim($payload['accountId'] ?? '');
        $accountId = preg_replace('/[^a-zA-Z0-9_\-]/', '', $accountId);
        $newNickname = trim($payload['newNickname'] ?? '');
        $oldNickname = trim($payload['oldNickname'] ?? '');
        $newAvatar = trim($payload['newAvatar'] ?? 'owl_wood');

        $cleanNick = htmlspecialchars(strip_tags($newNickname), ENT_QUOTES, 'UTF-8');
        $cleanNick = preg_replace('/[\x00-\x1F\x7F]/u', '', $cleanNick);
        if (mb_strlen($cleanNick, 'UTF-8') < 2) {
            $cleanNick = 'Hibou Anonyme';
        } elseif (mb_strlen($cleanNick, 'UTF-8') > 16) {
            $cleanNick = mb_substr($cleanNick, 0, 16, 'UTF-8');
        }

        $lowerNorm = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $cleanNick));
        $isAdmin = ($accountId === 'admin_hibouxe' || $accountId === 'steam_76561198035270542' || strpos($accountId, '76561198035270542') !== false);
        if (!$isAdmin && in_array($lowerNorm, ['hibouxe', 'edsaje'], true)) {
            $cleanNick = 'Hibou Anonyme';
        }

        if ($newAvatar === 'hibouxe_creator' && !$isAdmin) {
            $newAvatar = 'owl_wood';
        } elseif (!in_array($newAvatar, $validAvatars, true) && $newAvatar !== 'hibouxe_creator') {
            $newAvatar = 'owl_wood';
        }

        $data = loadLeaderboardData($dataFile);
        $updatedCount = 0;
        $normOldNick = mb_strtolower(trim($oldNickname), 'UTF-8');

        foreach ($data as $catKey => &$catGames) {
            if (!is_array($catGames)) continue;
            foreach ($catGames as $gameKey => &$entries) {
                if (!is_array($entries)) continue;
                foreach ($entries as &$entry) {
                    $eAcc = trim($entry['accountId'] ?? '');
                    $eNick = mb_strtolower(trim($entry['nickname'] ?? ''), 'UTF-8');

                    $matchAcc = !empty($accountId) && !empty($eAcc) && ($eAcc === $accountId);
                    $matchOldNick = !empty($normOldNick) && ($eNick === $normOldNick);

                    if ($matchAcc || $matchOldNick) {
                        $entry['nickname'] = $cleanNick;
                        $entry['avatar'] = $newAvatar;
                        if (!empty($accountId)) {
                            $entry['accountId'] = $accountId;
                        }
                        $updatedCount++;
                    }
                }
            }
        }

        @file_put_contents($dataFile, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);

        echo json_encode([
            'status' => 'success',
            'updatedScores' => $updatedCount,
            'nickname' => $cleanNick,
            'avatar' => $newAvatar,
        ]);
        exit;
    }

    $category = trim($payload['category'] ?? '');
    $game = trim($payload['game'] ?? '');
    $score = isset($payload['score']) ? (int)$payload['score'] : 0;
    $rawNickname = trim($payload['nickname'] ?? '');
    $avatar = trim($payload['avatar'] ?? 'owl_wood');
    $token = trim($payload['token'] ?? '');
    $timestamp = isset($payload['timestamp']) ? (int)$payload['timestamp'] : 0;
    $accountId = trim($payload['accountId'] ?? '');
    $accountId = preg_replace('/[^a-zA-Z0-9_\-]/', '', $accountId);
    if (strlen($accountId) > 64) {
        $accountId = substr($accountId, 0, 64);
    }

    // Vérification de catégorie et jeu
    if (!isset($validCategories[$category]) || !in_array($game, $validCategories[$category], true)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Catégorie ou jeu invalide.']);
        exit;
    }

    // 1. Validation du plafond physique réaliste par jeu (Anti-Cheat)
    $maxScoreBounds = [
        'arcade' => [
            'snake' => 5000,
            'pong' => 50,
            'breakout' => 15000,
            'flappy' => 500,
            'invaders' => 35000,
            'run' => 15000,
            'tetris' => 300000,
            'vectrex' => 50000,
        ],
        'timeattack' => [
            'screenle' => 35000,
            'indledle' => 35000,
            'linkle' => 35000,
            'profille' => 35000,
            'chrono' => 35000,
            'pixel' => 35000,
            'review' => 35000,
            'blindtest' => 35000,
        ],
        'quiz' => [
            'standard' => 10,
            'survival' => 150,
            'infinite' => 500,
        ],
    ];

    $maxAllowed = $maxScoreBounds[$category][$game] ?? 10000;
    if ($score <= 0 || $score > $maxAllowed) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => "Score non plausible ou dépassant la limite maximale autorisée pour ce jeu ($maxAllowed pts)."]);
        exit;
    }

    // 2. Vérification cryptographique anti-falsification (HMAC/SHA-256)
    $salt = 'hoot_sovereign_leaderboard_salt_2026';
    $now = time();
    if ($timestamp <= 0 || abs($now - $timestamp) > 300) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Session de score expirée ou horodatage invalide.']);
        exit;
    }

    $expectedToken = hash('sha256', "{$category}:{$game}:{$score}:{$timestamp}:{$salt}");
    if (!hash_equals($expectedToken, $token)) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Intégrité du score non certifiée (signature de sécurité invalide).']);
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

    // Protection des pseudonymes réservés au créateur (Hibouxe & Edsaje)
    $lowerNorm = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $cleanNick));
    $isAdmin = ($accountId === 'admin_hibouxe' || $accountId === 'steam_76561198035270542' || strpos($accountId, '76561198035270542') !== false);
    if (!$isAdmin && in_array($lowerNorm, ['hibouxe', 'edsaje'], true)) {
        $cleanNick = 'Hibou Anonyme';
    }

    if ($avatar === 'hibouxe_creator' && !$isAdmin) {
        $avatar = 'owl_wood';
    } elseif (!in_array($avatar, $validAvatars, true) && $avatar !== 'hibouxe_creator') {
        $avatar = 'owl_wood';
    }

    $entryId = 'score_' . bin2hex(random_bytes(8));
    $entryDate = date('Y-m-d');

    $data = loadLeaderboardData($dataFile);
    if (!isset($data[$category][$game])) {
        $data[$category][$game] = [];
    }

    // Si l'accountId est connu, synchroniser son pseudo & avatar sur l'ensemble de ses scores dans TOUS les jeux
    if (!empty($accountId)) {
        foreach ($data as $catKey => &$catGames) {
            if (!is_array($catGames)) continue;
            foreach ($catGames as $gameKey => &$entries) {
                if (!is_array($entries)) continue;
                foreach ($entries as &$entry) {
                    if (trim($entry['accountId'] ?? '') === $accountId) {
                        $entry['nickname'] = $cleanNick;
                        $entry['avatar'] = $avatar;
                    }
                }
            }
        }
    }

    // Dédupliquer les entrées existantes au préalable
    $data[$category][$game] = deduplicateLeaderboardEntries($data[$category][$game]);

    // Rechercher si le joueur/compte a déjà un score enregistré
    $existingIndex = -1;
    $normCleanNick = mb_strtolower(trim($cleanNick), 'UTF-8');

    foreach ($data[$category][$game] as $idx => $entry) {
        $entryAcc = trim($entry['accountId'] ?? '');
        $entryNick = mb_strtolower(trim($entry['nickname'] ?? ''), 'UTF-8');

        $matchAccount = !empty($accountId) && !empty($entryAcc) && ($entryAcc === $accountId);
        $matchNickname = !empty($entryNick) && ($entryNick === $normCleanNick);

        if ($matchAccount || $matchNickname) {
            $existingIndex = $idx;
            break;
        }
    }

    $isNewRecord = false;
    $targetId = '';

    if ($existingIndex !== -1) {
        $existing = $data[$category][$game][$existingIndex];
        $targetId = $existing['id'] ?? $entryId;
        $existingScore = (int)($existing['score'] ?? 0);

        if ($score > $existingScore) {
            // Nouveau record personnel !
            $data[$category][$game][$existingIndex]['score'] = $score;
            $data[$category][$game][$existingIndex]['nickname'] = $cleanNick;
            $data[$category][$game][$existingIndex]['avatar'] = $avatar;
            $data[$category][$game][$existingIndex]['date'] = $entryDate;
            $data[$category][$game][$existingIndex]['timestamp'] = time();
            if (!empty($accountId)) {
                $data[$category][$game][$existingIndex]['accountId'] = $accountId;
            }
            $isNewRecord = true;
        } else {
            // Le score soumis est inférieur ou égal au record existant : on conserve le meilleur score !
            $data[$category][$game][$existingIndex]['avatar'] = $avatar;
            if (!empty($accountId)) {
                $data[$category][$game][$existingIndex]['accountId'] = $accountId;
            }
            $isNewRecord = false;
        }
    } else {
        // Nouveau joueur
        $targetId = $entryId;
        $newEntry = [
            'id' => $entryId,
            'accountId' => $accountId,
            'nickname' => $cleanNick,
            'score' => $score,
            'avatar' => $avatar,
            'date' => $entryDate,
            'timestamp' => time()
        ];
        $data[$category][$game][] = $newEntry;
        $isNewRecord = true;
    }

    // Ré-application stricte de la déduplication et du tri décroissant
    $data[$category][$game] = deduplicateLeaderboardEntries($data[$category][$game]);

    // Conserver les 100 meilleurs scores uniquement
    if (count($data[$category][$game]) > 100) {
        $data[$category][$game] = array_slice($data[$category][$game], 0, 100);
    }

    // Trouver le rang final obtenu par le joueur
    $playerRank = 0;
    foreach ($data[$category][$game] as $idx => $s) {
        $matchId = ($s['id'] ?? '') === $targetId;
        $matchAcc = !empty($accountId) && !empty($s['accountId']) && ($s['accountId'] === $accountId);
        $matchNick = mb_strtolower(trim($s['nickname'] ?? ''), 'UTF-8') === $normCleanNick;
        if ($matchId || $matchAcc || $matchNick) {
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
        'isNewRecord' => $isNewRecord,
        'totalEntries' => count($data[$category][$game]),
        'leaderboard' => $top10
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Méthode HTTP non autorisée.']);
