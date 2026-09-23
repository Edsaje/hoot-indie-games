<?php
/**
 * 🦉 Hoot Indie Games — Backend API Souverain de Tchat & Messagerie Communautaire
 * 
 * Rôles :
 * 1. Salons publics communautaires en direct ("Le Perchoir") :
 *    - Salon Global international
 *    - Salons dédiés par langue (FR, EN, ES, DE, JA, PT-BR)
 * 2. Espace dédié "Retours & Feedback" (Suggestions, Bugs, Idées, Coups de cœur)
 * 3. Partage de victoires / scores certifiés
 * 4. Protection anti-XSS stricte, rate-limiting IP, modération et verrouillage atomique LOCK_EX
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

const ADMIN_STEAM_ID = '76561198035270542';
$dataFile = __DIR__ . '/chat_messages.json';
$rateLimitFile = __DIR__ . '/chat_ratelimit.json';

// Whitelist des salons autorisés
$validChannels = ['global', 'fr', 'en', 'es', 'de', 'ja', 'pt-BR', 'feedback'];

// Whitelist des catégories de feedback
$validFeedbackCategories = ['suggestion', 'bug', 'idea', 'love', 'general'];

// Whitelist des avatars reconnus
$validAvatars = [
    'hibouxe_creator', 'owl_wood', 'owl_golden', 'owl_emerald', 'owl_neon', 'owl_shadow', 'owl_cyber', 'owl_cosmic', 'owl_snow',
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

// Vérification du rate-limit (max 1 message toutes les 2.5 secondes, max 25 messages par 5 min)
function checkRateLimit($rateLimitFile, $ip) {
    $now = microtime(true);
    $limits = [];
    if (file_exists($rateLimitFile)) {
        $raw = @file_get_contents($rateLimitFile);
        if ($raw) {
            $limits = json_decode($raw, true) ?: [];
        }
    }

    $ipKey = md5($ip . '_hoot_chat_salt');
    // Nettoyer les entrées de plus de 10 minutes
    foreach ($limits as $k => $data) {
        if ($now - ($data['lastTime'] ?? 0) > 600) {
            unset($limits[$k]);
        }
    }

    if (!isset($limits[$ipKey])) {
        $limits[$ipKey] = [
            'count' => 1,
            'lastTime' => $now,
            'windowStart' => $now
        ];
    } else {
        $last = $limits[$ipKey]['lastTime'] ?? 0;
        // Délais minimum entre 2 messages (2.5s)
        if (($now - $last) < 2.5) {
            return false;
        }

        // Fenêtre de 5 minutes
        if ($now - ($limits[$ipKey]['windowStart'] ?? 0) > 300) {
            $limits[$ipKey]['count'] = 1;
            $limits[$ipKey]['windowStart'] = $now;
        } else {
            $limits[$ipKey]['count']++;
            if ($limits[$ipKey]['count'] > 25) {
                @file_put_contents($rateLimitFile, json_encode($limits), LOCK_EX);
                return false;
            }
        }
        $limits[$ipKey]['lastTime'] = $now;
    }

    @file_put_contents($rateLimitFile, json_encode($limits), LOCK_EX);
    return true;
}

// Filtre simple de modération de mots injurieux
function filterProfanities($text) {
    $badWords = [
        'connard', 'salope', 'pute', 'fdp', 'nique', 'enculé', 'bâtard',
        'nigger', 'faggot', 'retard', 'hitler', 'nazi', 'chink'
    ];
    $clean = $text;
    foreach ($badWords as $w) {
        $pattern = '/' . preg_quote($w, '/') . '/i';
        $clean = preg_replace($pattern, '***', $clean);
    }
    return $clean;
}

// Initialisation du fichier de données s'il n'existe pas
function getChatData($dataFile) {
    if (!file_exists($dataFile)) {
        $initial = [
            'messages' => [
                [
                    'id' => 'msg_welcome_perchoir',
                    'channel' => 'global',
                    'username' => 'Hibouxe',
                    'avatarId' => 'hibouxe_creator',
                    'title' => 'Fondateur du Perchoir',
                    'activeFrame' => 'golden_border',
                    'text' => 'Bienvenue sur Le Perchoir ! Échangez sur vos pépites préférées et partagez vos records. 🦉✨',
                    'timestamp' => time() - 3600,
                    'isCreator' => true,
                    'category' => 'general'
                ],
                [
                    'id' => 'msg_welcome_feedback',
                    'channel' => 'feedback',
                    'username' => 'Hibouxe',
                    'avatarId' => 'hibouxe_creator',
                    'title' => 'Fondateur du Perchoir',
                    'activeFrame' => 'golden_border',
                    'text' => 'Partagez ici vos idées, retours et suggestions pour faire grandir le sanctuaire Hoot Indie Games !',
                    'timestamp' => time() - 3500,
                    'isCreator' => true,
                    'category' => 'suggestion'
                ]
            ]
        ];
        @file_put_contents($dataFile, json_encode($initial, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        return $initial;
    }

    $raw = @file_get_contents($dataFile);
    if (!$raw) {
        return ['messages' => []];
    }
    $decoded = json_decode($raw, true);
    if (!is_array($decoded) || !isset($decoded['messages'])) {
        return ['messages' => []];
    }
    return $decoded;
}

// Traitement des requêtes
$method = $_SERVER['REQUEST_METHOD'];
$action = $_REQUEST['action'] ?? ($method === 'POST' ? 'send_message' : 'get_messages');

if ($action === 'get_messages') {
    $channel = trim($_REQUEST['channel'] ?? 'all');
    $since = (int)($_REQUEST['since'] ?? 0);
    $limit = min(100, max(1, (int)($_REQUEST['limit'] ?? 50)));

    $data = getChatData($dataFile);
    $all = $data['messages'];

    // Filtrer par canal si spécifié
    if ($channel !== 'all' && in_array($channel, $validChannels, true)) {
        $filtered = array_filter($all, function($m) use ($channel) {
            return ($m['channel'] ?? '') === $channel;
        });
    } else {
        $filtered = $all;
    }

    // Filtrer par timestamp 'since' si présent
    if ($since > 0) {
        $filtered = array_filter($filtered, function($m) use ($since) {
            return ($m['timestamp'] ?? 0) > $since;
        });
    }

    // Ne renvoyer que les $limit plus récents
    $filtered = array_values($filtered);
    if (count($filtered) > $limit) {
        $filtered = array_slice($filtered, -$limit);
    }

    echo json_encode([
        'success' => true,
        'channel' => $channel,
        'messages' => $filtered,
        'serverTime' => time()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'send_message') {
    $ip = getClientIp();

    // Vérifier le rate limiting
    if (!checkRateLimit($rateLimitFile, $ip)) {
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'error' => 'Veuillez patienter quelques secondes avant d\'envoyer un nouveau message.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Récupérer les données POST (JSON ou form-data)
    $inputJson = file_get_contents('php://input');
    $body = json_decode($inputJson, true) ?: $_POST;

    $channel = trim($body['channel'] ?? 'global');
    if (!in_array($channel, $validChannels, true)) {
        $channel = 'global';
    }

    $rawText = trim($body['text'] ?? '');
    if (empty($rawText) || mb_strlen($rawText, 'UTF-8') < 1) {
        echo json_encode([
            'success' => false,
            'error' => 'Le message ne peut pas être vide.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Limiter la taille à 350 caractères
    if (mb_strlen($rawText, 'UTF-8') > 350) {
        $rawText = mb_substr($rawText, 0, 350, 'UTF-8');
    }

    // Sanitisation stricte anti-XSS et filtrage
    $cleanText = htmlspecialchars(strip_tags($rawText), ENT_QUOTES, 'UTF-8');
    $cleanText = filterProfanities($cleanText);

    // Identité utilisateur
    $rawUsername = trim($body['username'] ?? 'Explorateur');
    $cleanUsername = htmlspecialchars(strip_tags($rawUsername), ENT_QUOTES, 'UTF-8');
    if (empty($cleanUsername)) {
        $cleanUsername = 'Explorateur';
    }

    $steamId = trim($body['steamId'] ?? '');
    $isCreator = false;
    $normUser = mb_strtolower($cleanUsername, 'UTF-8');

    // Vérification du statut Créateur
    $isLocal = in_array($ip, ['127.0.0.1', '::1']) || strpos($_SERVER['HTTP_HOST'] ?? '', 'localhost') !== false;
    if ($steamId === ADMIN_STEAM_ID || ($isLocal && in_array($normUser, ['hibouxe', 'edsaje'], true))) {
        $isCreator = true;
        $cleanUsername = 'Hibouxe';
    } else if (in_array($normUser, ['hibouxe', 'edsaje'], true)) {
        // Interdiction d'usurpation de l'identité du fondateur
        $cleanUsername = 'Explorateur_' . substr(md5($ip), 0, 4);
    }

    // Avatar
    $avatarId = trim($body['avatarId'] ?? 'owl');
    if ($avatarId === 'hibouxe_creator' && !$isCreator) {
        $avatarId = 'owl';
    } elseif (!in_array($avatarId, $validAvatars, true) && $avatarId !== 'hibouxe_creator') {
        $avatarId = 'owl';
    }

    // Titre et cadre
    $title = trim($body['title'] ?? ($isCreator ? 'Fondateur du Perchoir' : 'Oisillon du Perchoir'));
    $title = htmlspecialchars(strip_tags($title), ENT_QUOTES, 'UTF-8');
    if (mb_strlen($title, 'UTF-8') > 50) {
        $title = mb_substr($title, 0, 50, 'UTF-8');
    }

    $activeFrame = trim($body['activeFrame'] ?? '');
    $activeFrame = preg_replace('/[^a-zA-Z0-9_\-]/', '', $activeFrame);

    // Catégorie de feedback
    $category = trim($body['category'] ?? 'general');
    if (!in_array($category, $validFeedbackCategories, true)) {
        $category = 'general';
    }

    // Données de score éventuelles (ex: partage de victoire)
    $scoreData = null;
    if (isset($body['scoreData']) && is_array($body['scoreData'])) {
        $scoreData = [
            'game' => htmlspecialchars(strip_tags(substr($body['scoreData']['game'] ?? '', 0, 40)), ENT_QUOTES, 'UTF-8'),
            'score' => (int)($body['scoreData']['score'] ?? 0),
            'mode' => htmlspecialchars(strip_tags(substr($body['scoreData']['mode'] ?? '', 0, 30)), ENT_QUOTES, 'UTF-8')
        ];
    }

    $newMessage = [
        'id' => 'msg_' . time() . '_' . substr(md5(uniqid($ip, true)), 0, 8),
        'channel' => $channel,
        'username' => $cleanUsername,
        'avatarId' => $avatarId,
        'title' => $title,
        'activeFrame' => $activeFrame,
        'text' => $cleanText,
        'timestamp' => time(),
        'isCreator' => $isCreator,
        'category' => $category,
        'scoreData' => $scoreData
    ];

    $data = getChatData($dataFile);
    $data['messages'][] = $newMessage;

    // Pruning : conserver un maximum de 100 messages par canal pour garder le JSON ultra-léger (< 50KB)
    $messagesByChannel = [];
    foreach ($data['messages'] as $m) {
        $c = $m['channel'] ?? 'global';
        if (!isset($messagesByChannel[$c])) {
            $messagesByChannel[$c] = [];
        }
        $messagesByChannel[$c][] = $m;
    }

    $prunedMessages = [];
    foreach ($messagesByChannel as $c => $msgs) {
        if (count($msgs) > 100) {
            $msgs = array_slice($msgs, -100);
        }
        foreach ($msgs as $m) {
            $prunedMessages[] = $m;
        }
    }

    // Trier chronologiquement
    usort($prunedMessages, function($a, $b) {
        return ($a['timestamp'] ?? 0) - ($b['timestamp'] ?? 0);
    });

    $data['messages'] = $prunedMessages;

    @file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

    echo json_encode([
        'success' => true,
        'message' => $newMessage
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['error' => 'Action inconnue'], JSON_UNESCAPED_UNICODE);
