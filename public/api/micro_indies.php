<?php
/**
 * 🦉 Hoot Indie Games — Backend API de La Clairière des Micro-Indés & Itch.io
 * Permet aux visiteurs et créateurs solo de proposer leurs jeux et voter pour leurs coups de cœur.
 * 
 * Cybersécurité :
 * - Rate-limiting par IP (max 5 propositions par heure)
 * - Validation stricte des URLs (Steam, Itch.io, Web)
 * - Assainissement anti-XSS de toutes les chaînes
 * - Verrouillage atomique des écritures (LOCK_EX)
 * - Données stockées dans un JSON protégé
 */

ini_set('display_errors', 0);
error_reporting(0);

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
require_once __DIR__ . '/admin_auth.php';
sendCorsHeaders();
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataFile = __DIR__ . '/micro_indies.json';
$rateLimitFile = __DIR__ . '/micro_indies_rates.json';
$secretFile = __DIR__ . '/.secret';

function getSecret($file) {
    if (file_exists($file)) {
        $sec = trim(@file_get_contents($file));
        if (!empty($sec)) return $sec;
    }
    $newSec = bin2hex(random_bytes(32));
    @file_put_contents($file, $newSec, LOCK_EX);
    return $newSec;
}
$secret = getSecret($secretFile);

function getClientIpHash($secret) {
    return hash('sha256', getAuthClientIp() . $secret);
}

function checkRateLimit($rateLimitFile, $ipHash, $maxRequests = 5, $windowSeconds = 3600) {
    $now = time();
    $rates = [];
    if (file_exists($rateLimitFile)) {
        $raw = @file_get_contents($rateLimitFile);
        $rates = json_decode($raw, true) ?: [];
    }
    // Nettoyage des vieilles entrées
    foreach ($rates as $hash => $timestamps) {
        $rates[$hash] = array_filter($timestamps, function($ts) use ($now, $windowSeconds) {
            return ($now - $ts) < $windowSeconds;
        });
        if (empty($rates[$hash])) unset($rates[$hash]);
    }
    $userRequests = $rates[$ipHash] ?? [];
    if (count($userRequests) >= $maxRequests) {
        return false;
    }
    $userRequests[] = $now;
    $rates[$ipHash] = $userRequests;
    @file_put_contents($rateLimitFile, json_encode($rates), LOCK_EX);
    return true;
}

function sanitizeText($text, $maxLength = 500) {
    if (!is_string($text)) return '';
    $trimmed = trim(strip_tags($text));
    $sanitized = htmlspecialchars($trimmed, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    if (mb_strlen($sanitized, 'UTF-8') > $maxLength) {
        $sanitized = mb_substr($sanitized, 0, $maxLength, 'UTF-8');
    }
    return $sanitized;
}

function sanitizeUrl($url) {
    if (!is_string($url)) return '';
    $trimmed = trim($url);
    if (!filter_var($trimmed, FILTER_VALIDATE_URL)) return '';
    if (!preg_match('#^https?://#i', $trimmed)) return '';
    return $trimmed;
}

$action = $_GET['action'] ?? '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $postData = json_decode($rawInput, true) ?: [];
    $action = $postData['action'] ?? $action;
}

// 1. Lister les micro-indés approuvés
if ($action === 'list' || ($_SERVER['REQUEST_METHOD'] === 'GET' && empty($action))) {
    $items = [];
    if (file_exists($dataFile)) {
        $raw = @file_get_contents($dataFile);
        $items = json_decode($raw, true) ?: [];
    }
    // Filtrer pour n'afficher que les éléments approuvés côté public
    $approved = array_values(array_filter($items, function($item) {
        return !empty($item['approved']);
    }));
    echo json_encode(['success' => true, 'microIndies' => $approved]);
    exit;
}

// 2. Soumettre un nouveau micro-indé
if ($action === 'submit') {
    $ipHash = getClientIpHash($secret);
    if (!checkRateLimit($rateLimitFile, $ipHash, 5, 3600)) {
        http_response_code(429);
        echo json_encode(['success' => false, 'error' => 'Limite de soumission atteinte. Veuillez patienter avant de proposer un autre jeu.']);
        exit;
    }

    $title = sanitizeText($postData['title'] ?? '', 80);
    $developer = sanitizeText($postData['developer'] ?? '', 80);
    $pitch = sanitizeText($postData['pitch'] ?? '', 300);
    $platform = in_array($postData['platform'] ?? '', ['itch', 'steam', 'web', 'both']) ? $postData['platform'] : 'itch';
    $itchUrl = sanitizeUrl($postData['itchUrl'] ?? '');
    $steamUrl = sanitizeUrl($postData['steamUrl'] ?? '');
    $playUrl = sanitizeUrl($postData['playInBrowserUrl'] ?? '');
    $coverImage = sanitizeUrl($postData['coverImage'] ?? '');
    $isFree = !empty($postData['isFree']);
    $genre = sanitizeText($postData['genre'] ?? 'Aventure', 50);
    $artStyle = sanitizeText($postData['artStyle'] ?? 'Pixel Art', 50);
    $jam = sanitizeText($postData['jam'] ?? '', 60);
    $submittedBy = sanitizeText($postData['submittedBy'] ?? 'Visiteur Anonyme', 40);
    $devMessage = sanitizeText($postData['developerMessage'] ?? '', 300);

    if (empty($title)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Le titre du jeu est obligatoire.']);
        exit;
    }
    if (empty($developer)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Le nom du développeur ou studio est obligatoire.']);
        exit;
    }
    if (empty($itchUrl) && empty($steamUrl) && empty($playUrl)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Veuillez fournir au moins un lien officiel (Itch.io, Steam ou Web).']);
        exit;
    }

    $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $title));
    $slug = trim($slug, '-');
    $id = 'micro-' . $slug . '-' . substr(bin2hex(random_bytes(4)), 0, 6);

    $newEntry = [
        'id' => $id,
        'title' => $title,
        'developer' => $developer,
        'releaseYear' => (int)date('Y'),
        'platform' => $platform,
        'itchUrl' => $itchUrl ?: null,
        'steamUrl' => $steamUrl ?: null,
        'playInBrowserUrl' => $playUrl ?: null,
        'isFree' => $isFree,
        'pricingText' => [
            'fr' => $isFree ? 'Gratuit / Free 🆓' : 'Payant / Prix libre',
            'en' => $isFree ? '100% Free 🆓' : 'Paid / Name your price',
        ],
        'genre' => [$genre],
        'artStyle' => [
            'fr' => $artStyle,
            'en' => $artStyle,
        ],
        'tagline' => [
            'fr' => $pitch,
            'en' => $pitch,
        ],
        'description' => [
            'fr' => $pitch,
            'en' => $pitch,
        ],
        'developerMessage' => !empty($devMessage) ? [
            'fr' => $devMessage,
            'en' => $devMessage,
        ] : null,
        'jam' => $jam ?: null,
        'discoveredBy' => $submittedBy,
        'likesCount' => 1,
        'coverImage' => $coverImage ?: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2420510/header.jpg',
        'screenshots' => $coverImage ? [$coverImage] : [],
        'dateAdded' => date('Y-m-d'),
        'approved' => false, // Requiert impérativement validation par l'administrateur avant affichage public
        'ipHash' => $ipHash,
    ];

    $items = [];
    if (file_exists($dataFile)) {
        $raw = @file_get_contents($dataFile);
        $items = json_decode($raw, true) ?: [];
    }
    array_unshift($items, $newEntry);
    @file_put_contents($dataFile, json_encode($items, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

    echo json_encode([
        'success' => true,
        'message' => 'Merci ! Votre proposition a été enregistrée et sera soumise à validation modérateur avant publication.',
        'game' => $newEntry,
    ]);
    exit;
}

// 3. Voter / Aimer un micro-indé
if ($action === 'like') {
    $ipHash = getClientIpHash($secret);
    // [CWE-799] Rate limiting strict sur les votes
    if (!checkRateLimit($rateLimitFile, $ipHash . '_likes', 25, 600)) {
        http_response_code(429);
        echo json_encode(['success' => false, 'error' => 'Veuillez patienter avant de voter à nouveau.']);
        exit;
    }

    $targetId = sanitizeText($postData['id'] ?? '', 100);
    if (empty($targetId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Identifiant de jeu manquant.']);
        exit;
    }
    $items = [];
    if (file_exists($dataFile)) {
        $raw = @file_get_contents($dataFile);
        $items = json_decode($raw, true) ?: [];
    }
    $found = false;
    $newLikes = 0;
    foreach ($items as &$item) {
        if (($item['id'] ?? '') === $targetId) {
            $item['likesCount'] = ($item['likesCount'] ?? 0) + 1;
            $newLikes = $item['likesCount'];
            $found = true;
            break;
        }
    }
    if ($found) {
        @file_put_contents($dataFile, json_encode($items, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        echo json_encode(['success' => true, 'likesCount' => $newLikes]);
    } else {
        echo json_encode(['success' => true, 'likesCount' => 1]);
    }
    exit;
}

// 4. Modération administrateur : Liste complète des propositions (avec stats)
if ($action === 'admin_list') {
    if (!isCreatorAdminAuthorized()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Action réservée à l\'administrateur.']);
        exit;
    }
    $items = [];
    if (file_exists($dataFile)) {
        $raw = @file_get_contents($dataFile);
        $items = json_decode($raw, true) ?: [];
    }
    $total = count($items);
    $pending = count(array_filter($items, function($item) {
        return empty($item['approved']);
    }));
    $approved = count(array_filter($items, function($item) {
        return !empty($item['approved']);
    }));

    echo json_encode([
        'success' => true,
        'total' => $total,
        'pending' => $pending,
        'approved' => $approved,
        'list' => $items,
    ]);
    exit;
}

// 5. Modération administrateur : Valider et publier un micro-indé
if ($action === 'admin_approve') {
    if (!isCreatorAdminAuthorized()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Action réservée à l\'administrateur.']);
        exit;
    }
    $targetId = sanitizeText($postData['id'] ?? $_GET['id'] ?? '', 100);
    if (empty($targetId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Identifiant de jeu manquant.']);
        exit;
    }

    $items = [];
    if (file_exists($dataFile)) {
        $raw = @file_get_contents($dataFile);
        $items = json_decode($raw, true) ?: [];
    }
    $found = false;
    $updatedGame = null;
    foreach ($items as &$item) {
        if (($item['id'] ?? '') === $targetId) {
            $item['approved'] = true;
            $item['approvedAt'] = date('c');
            $found = true;
            $updatedGame = $item;
            break;
        }
    }
    if ($found) {
        @file_put_contents($dataFile, json_encode($items, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        echo json_encode([
            'success' => true,
            'message' => 'Le jeu a été validé et publié avec succès dans La Clairière des Micro-Indés !',
            'game' => $updatedGame,
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Jeu introuvable.']);
    }
    exit;
}

// 6. Modération administrateur : Remettre en attente (dé-publier)
if ($action === 'admin_unapprove') {
    if (!isCreatorAdminAuthorized()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Action réservée à l\'administrateur.']);
        exit;
    }
    $targetId = sanitizeText($postData['id'] ?? $_GET['id'] ?? '', 100);
    $items = [];
    if (file_exists($dataFile)) {
        $raw = @file_get_contents($dataFile);
        $items = json_decode($raw, true) ?: [];
    }
    $found = false;
    foreach ($items as &$item) {
        if (($item['id'] ?? '') === $targetId) {
            $item['approved'] = false;
            $found = true;
            break;
        }
    }
    if ($found) {
        @file_put_contents($dataFile, json_encode($items, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        echo json_encode(['success' => true, 'message' => 'Le micro-indé a été remis en attente de validation.']);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Jeu introuvable.']);
    }
    exit;
}

// 7. Modération administrateur : Supprimer une proposition
if ($action === 'delete' || $action === 'admin_delete') {
    if (!isCreatorAdminAuthorized()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Action réservée à l\'administrateur.']);
        exit;
    }
    $targetId = sanitizeText($postData['id'] ?? $_GET['id'] ?? '', 100);
    $items = [];
    if (file_exists($dataFile)) {
        $raw = @file_get_contents($dataFile);
        $items = json_decode($raw, true) ?: [];
    }
    $filtered = array_values(array_filter($items, function($item) use ($targetId) {
        return ($item['id'] ?? '') !== $targetId;
    }));
    @file_put_contents($dataFile, json_encode($filtered, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    echo json_encode(['success' => true, 'message' => 'Jeu retiré de La Clairière.']);
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Action inconnue']);
