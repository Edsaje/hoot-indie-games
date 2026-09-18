<?php
/**
 * Backend API de Suggestion de Jeux Indés — Hoot Indie Games
 * Permet aux visiteurs de soumettre des pépites indés Steam pour revue administrative.
 * Cybersécurité :
 * - Rate-limiting par IP (max 5 suggestions par 10 minutes)
 * - Validation stricte des AppIDs numériques Steam
 * - Assainissement strict contre les injections XSS / HTML
 * - Verrouillage atomique des écritures (LOCK_EX)
 * - Stockage dans un fichier .json protégé par .htaccess
 */

ini_set('display_errors', 0);
error_reporting(0);

// Headers de sécurité HTTP
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Content-Type: application/json; charset=utf-8');

// Autoriser CORS pour les requêtes de suggestion
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$suggestionsFile = __DIR__ . '/suggestions.json';
$rateLimitFile = __DIR__ . '/suggestions_rate_limits.json';
$secretFile = __DIR__ . '/.secret';

// Clé secrète serveur pour hachage d'IP
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

// Récupération de l'IP
function getIp() {
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

$clientIp = getIp();
$ipHash = hash('sha256', $clientIp . '_' . $secret);

// Traitement POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 1. Rate Limiting (max 5 par 10 minutes)
    $now = time();
    $rateLimits = [];
    if (file_exists($rateLimitFile)) {
        $rateLimits = json_decode(@file_get_contents($rateLimitFile), true) ?: [];
    }
    // Nettoyer les fenêtres expirées (> 600s)
    foreach ($rateLimits as $ip => $data) {
        if (!isset($data['reset']) || $data['reset'] < $now) {
            unset($rateLimits[$ip]);
        }
    }
    if (!isset($rateLimits[$ipHash])) {
        $rateLimits[$ipHash] = ['count' => 0, 'reset' => $now + 600];
    }
    if ($rateLimits[$ipHash]['count'] >= 5) {
        http_response_code(429);
        echo json_encode([
            'status' => 'error',
            'message' => 'Limite de suggestions atteinte pour le moment. Veuillez patienter quelques minutes.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 2. Décoder le JSON
    $rawInput = file_get_contents('php://input');
    $payload = json_decode($rawInput, true);
    if (!$payload || !is_array($payload)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Données de requête invalides.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 3. Valider AppID
    $appId = isset($payload['appId']) ? (int)$payload['appId'] : 0;
    if ($appId <= 0 || $appId > 50000000) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'AppID Steam invalide.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 4. Assainir les champs textuels
    $title = trim(strip_tags($payload['title'] ?? ''));
    if (empty($title)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Le titre du jeu est obligatoire.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    if (mb_strlen($title) > 120) {
        $title = mb_substr($title, 0, 120);
    }

    $developer = trim(strip_tags($payload['developer'] ?? ''));
    if (mb_strlen($developer) > 100) {
        $developer = mb_substr($developer, 0, 100);
    }

    $comment = trim(strip_tags($payload['comment'] ?? ''));
    if (mb_strlen($comment) > 600) {
        $comment = mb_substr($comment, 0, 600);
    }

    $releaseYear = isset($payload['releaseYear']) ? (int)$payload['releaseYear'] : date('Y');
    if ($releaseYear < 1980 || $releaseYear > 2035) {
        $releaseYear = (int)date('Y');
    }

    $genres = [];
    if (isset($payload['genres']) && is_array($payload['genres'])) {
        foreach (array_slice($payload['genres'], 0, 6) as $g) {
            $sanitizedG = trim(strip_tags((string)$g));
            if (!empty($sanitizedG)) {
                $genres[] = mb_substr($sanitizedG, 0, 40);
            }
        }
    }

    // 5. Charger les suggestions existantes et vérifier les doublons
    $suggestions = [];
    if (file_exists($suggestionsFile)) {
        $suggestions = json_decode(@file_get_contents($suggestionsFile), true) ?: [];
    }

    foreach ($suggestions as $existing) {
        if (isset($existing['appId']) && (int)$existing['appId'] === $appId) {
            http_response_code(409);
            echo json_encode([
                'status' => 'already_suggested',
                'message' => "Ce jeu (« {$title} », AppID {$appId}) a déjà été suggéré et figure dans la file d'examen des veilleurs !"
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    // 6. Ajouter la nouvelle suggestion
    $newEntry = [
        'id' => 'sug_' . bin2hex(random_bytes(6)),
        'appId' => $appId,
        'title' => $title,
        'developer' => $developer ?: 'Inconnu',
        'releaseYear' => $releaseYear,
        'genres' => $genres,
        'comment' => $comment,
        'steamUrl' => "https://store.steampowered.com/app/{$appId}/",
        'submittedAt' => date('Y-m-d H:i:s'),
        'ipHash' => mb_substr($ipHash, 0, 12),
        'status' => 'pending'
    ];

    $suggestions[] = $newEntry;

    // Écriture atomique
    @file_put_contents($suggestionsFile, json_encode($suggestions, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);

    // Incrémenter le rate limit
    $rateLimits[$ipHash]['count']++;
    @file_put_contents($rateLimitFile, json_encode($rateLimits), LOCK_EX);

    echo json_encode([
        'status' => 'success',
        'message' => "Merci ! Votre suggestion pour « {$title} » a été transmise aux veilleurs du Nichoir.",
        'entry' => $newEntry
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Requête non autorisée par défaut
http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Méthode non autorisée.'], JSON_UNESCAPED_UNICODE);
