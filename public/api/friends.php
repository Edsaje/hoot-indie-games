<?php
/**
 * 🦉 Hoot Indie Games — Backend API Souverain du Système d'Amis & Fonctionnalités Sociales
 * 
 * Fonctionnalités :
 * 1. Enregistrement et mise à jour de la présence des joueurs (Code ami unique HOOT-XXXX).
 * 2. Récupération temps réel des compagnons (statut en ligne, flamme de série, progression du jour).
 * 3. Recherche instantanée par code ami ou par pseudonyme.
 * 4. Détection et synchronisation automatique des amis Steam jouant à Hoot Indie Games.
 * 5. Stockage JSON sécurisé, résilient avec verrouillage atomique (LOCK_EX) et rate-limiting IP.
 */

ini_set('display_errors', 0);
error_reporting(0);

// Headers de sécurité HTTP stricts & CORS
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Cache-Control: no-store, no-cache, must-revalidate');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/admin_auth.php';
$dataFile = __DIR__ . '/friends_data.json';
$rateLimitFile = __DIR__ . '/friends_ratelimit.json';
$steamKeyFile = __DIR__ . '/.steam_key';

// Helper: Récupération IP client
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

// Rate limiting (max 60 requêtes par minute par IP)
function checkFriendsRateLimit($rateLimitFile, $ip) {
    $now = time();
    $limits = [];
    if (file_exists($rateLimitFile)) {
        $raw = @file_get_contents($rateLimitFile);
        if ($raw) $limits = json_decode($raw, true) ?: [];
    }
    foreach ($limits as $k => $d) {
        if ($now - ($d['reset'] ?? 0) > 300) unset($limits[$k]);
    }
    $ipKey = md5($ip);
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

if (!checkFriendsRateLimit($rateLimitFile, getClientIp())) {
    http_response_code(429);
    echo json_encode(['success' => false, 'error' => 'Trop de requêtes. Veuillez patienter un instant.']);
    exit;
}

// Helper: Lecture de la clé API Steam Maîtresse
function getMasterSteamKey($filePath) {
    if (file_exists($filePath)) {
        $c = @file_get_contents($filePath);
        if ($c && trim($c) !== '') return trim($c);
    }
    $envKey = getenv('STEAM_API_KEY') ?: ($_ENV['STEAM_API_KEY'] ?? '');
    return trim($envKey);
}

// Chargement sécurisé de la base des amis
function loadFriendsDatabase($file) {
    $default = [
        'players' => [
            'HOOT-HIBOU' => [
                'friendCode' => 'HOOT-HIBOU',
                'username' => 'Hibouxe',
                'avatarId' => 'hibouxe_creator',
                'title' => '👑 Fondateur du Perchoir',
                'steamId' => '76561198035270542',
                'elo' => 1500,
                'streak' => 120,
                'lastActive' => gmdate('Y-m-d\TH:i:s\Z'),
                'isCreator' => true,
                'dailyScores' => [
                    'date' => gmdate('Y-m-d'),
                    'screenle' => ['status' => 'won', 'guessCount' => 2],
                    'indledle' => ['status' => 'won', 'guessCount' => 3],
                    'linkle' => ['status' => 'won', 'guessCount' => 4],
                    'profille' => ['status' => 'won', 'guessCount' => 1],
                    'chrono' => ['status' => 'won', 'guessCount' => 1],
                    'pixel' => ['status' => 'won', 'guessCount' => 2],
                    'review' => ['status' => 'won', 'guessCount' => 2],
                    'blindtest' => ['status' => 'won', 'guessCount' => 1],
                    'totalWonToday' => 8
                ]
            ]
        ],
        'usernameToCode' => [
            'hibouxe' => 'HOOT-HIBOU',
            'edsaje' => 'HOOT-HIBOU'
        ],
        'steamToCode' => [
            '76561198035270542' => 'HOOT-HIBOU'
        ]
    ];

    if (!file_exists($file) || filesize($file) === 0) {
        @file_put_contents($file, json_encode($default, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        return $default;
    }

    for ($i = 0; $i < 3; $i++) {
        $fp = @fopen($file, 'r');
        if ($fp) {
            if (@flock($fp, LOCK_SH)) {
                $raw = @stream_get_contents($fp);
                @flock($fp, LOCK_UN);
                @fclose($fp);
                if (!empty($raw)) {
                    $decoded = json_decode($raw, true);
                    if (is_array($decoded) && isset($decoded['players'])) {
                        if (!isset($decoded['players']['HOOT-HIBOU'])) {
                            $decoded['players']['HOOT-HIBOU'] = $default['players']['HOOT-HIBOU'];
                            $decoded['usernameToCode']['hibouxe'] = 'HOOT-HIBOU';
                            $decoded['steamToCode']['76561198035270542'] = 'HOOT-HIBOU';
                        }
                        return $decoded;
                    }
                }
            } else {
                @fclose($fp);
            }
        }
        usleep(15000);
    }

    return $default;
}

// Sauvegarde atomique avec renommage POSIX
function saveFriendsDatabase($file, $data) {
    $tempFile = $file . '.tmp.' . uniqid('', true);
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($json === false) return false;

    if (@file_put_contents($tempFile, $json, LOCK_EX) === false) {
        @unlink($tempFile);
        return false;
    }

    if (!@rename($tempFile, $file)) {
        @copy($tempFile, $file);
        @unlink($tempFile);
    }
    return true;
}

// Normalisation des pseudonymes pour recherche
function normalizeUsername($name) {
    $n = mb_strtolower(trim($name), 'UTF-8');
    $n = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $n);
    $n = preg_replace('/[^a-z0-9]/', '', $n);
    return $n;
}

// Nettoyage et assainissement du code ami
function sanitizeFriendCode($code) {
    $c = strtoupper(trim((string)$code));
    if (!preg_match('/^HOOT-[A-Z0-9]{3,10}$/', $c)) {
        return null;
    }
    return $c;
}

// Traitement de l'action
$action = $_GET['action'] ?? '';
$inputRaw = file_get_contents('php://input');
$body = json_decode($inputRaw, true) ?: [];
if (empty($action) && isset($body['action'])) {
    $action = $body['action'];
}

$db = loadFriendsDatabase($dataFile);

// -------------------------------------------------------------
// 1. ACTION: register (Enregistre ou met à jour le profil public)
// -------------------------------------------------------------
if ($action === 'register') {
    $friendCode = sanitizeFriendCode($body['friendCode'] ?? '');
    if (!$friendCode) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Format de code ami invalide (ex: HOOT-XXXX).']);
        exit;
    }

    $rawUsername = trim((string)($body['username'] ?? ''));
    if (empty($rawUsername)) {
        $rawUsername = 'Compagnon Indé';
    }
    $cleanUsername = mb_substr(htmlspecialchars($rawUsername, ENT_QUOTES, 'UTF-8'), 0, 24);
    $avatarId = preg_replace('/[^a-z0-9_]/', '', (string)($body['avatarId'] ?? 'owl'));
    $title = mb_substr(htmlspecialchars((string)($body['title'] ?? 'Oisillon du Perchoir'), ENT_QUOTES, 'UTF-8'), 0, 40);
    $steamId = preg_match('/^\d{17}$/', (string)($body['steamId'] ?? '')) ? (string)$body['steamId'] : null;
    $elo = max(500, min(3000, (int)($body['elo'] ?? 1000)));
    $streak = max(0, min(9999, (int)($body['streak'] ?? 0)));

    // Assainissement des scores quotidiens
    $cleanDailyScores = null;
    if (isset($body['dailyScores']) && is_array($body['dailyScores'])) {
        $ds = $body['dailyScores'];
        $dateStr = preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)($ds['date'] ?? '')) ? $ds['date'] : gmdate('Y-m-d');
        $validDisciplines = ['screenle', 'indledle', 'linkle', 'profille', 'chrono', 'pixel', 'review', 'blindtest'];
        $cleanDailyScores = [
            'date' => $dateStr,
            'totalWonToday' => 0
        ];

        $totalWon = 0;
        foreach ($validDisciplines as $disc) {
            $status = 'unplayed';
            $guessCount = null;
            if (isset($ds[$disc]) && is_array($ds[$disc])) {
                $st = (string)($ds[$disc]['status'] ?? 'unplayed');
                if (in_array($st, ['won', 'lost', 'unplayed'], true)) {
                    $status = $st;
                }
                if ($status === 'won') $totalWon++;
                if (isset($ds[$disc]['guessCount'])) {
                    $guessCount = max(1, min(20, (int)$ds[$disc]['guessCount']));
                }
            }
            $cleanDailyScores[$disc] = [
                'status' => $status,
                'guessCount' => $guessCount
            ];
        }
        $cleanDailyScores['totalWonToday'] = $totalWon;
    }

    $nowIso = gmdate('Y-m-d\TH:i:s\Z');
    $playerEntry = [
        'friendCode' => $friendCode,
        'username' => $cleanUsername,
        'avatarId' => $avatarId,
        'title' => $title,
        'steamId' => $steamId,
        'elo' => $elo,
        'streak' => $streak,
        'lastActive' => $nowIso,
        'dailyScores' => $cleanDailyScores
    ];

    if ($friendCode === 'HOOT-HIBOU') {
        if (!isCreatorAdminAuthorized()) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Le profil souverain HOOT-HIBOU est réservé au créateur du site.'
            ]);
            exit;
        }
        $playerEntry['isCreator'] = true;
    }

    $db['players'][$friendCode] = $playerEntry;

    // Indexation inversée
    $normName = normalizeUsername($cleanUsername);
    if (!empty($normName) && $friendCode !== 'HOOT-HIBOU') {
        $db['usernameToCode'][$normName] = $friendCode;
    }
    if ($steamId) {
        $db['steamToCode'][$steamId] = $friendCode;
    }

    saveFriendsDatabase($dataFile, $db);

    echo json_encode([
        'success' => true,
        'player' => $playerEntry
    ]);
    exit;
}

// -------------------------------------------------------------
// 2. ACTION: get_friends (Récupère la liste des profils d'amis)
// -------------------------------------------------------------
if ($action === 'get_friends') {
    $codes = $body['codes'] ?? ($_GET['codes'] ?? []);
    if (is_string($codes)) {
        $codes = array_filter(array_map('trim', explode(',', $codes)));
    }
    if (!is_array($codes)) {
        $codes = [];
    }

    $now = time();
    $foundFriends = [];

    foreach ($codes as $rawCode) {
        $clean = sanitizeFriendCode($rawCode);
        if (!$clean || !isset($db['players'][$clean])) continue;

        $p = $db['players'][$clean];
        // Calcul statut en ligne (actif dans les 10 dernières minutes)
        $lastActiveTs = strtotime($p['lastActive'] ?? '');
        $p['isOnline'] = ($lastActiveTs && ($now - $lastActiveTs) < 600);

        $foundFriends[] = $p;
    }

    echo json_encode([
        'success' => true,
        'friends' => $foundFriends,
        'serverTime' => gmdate('Y-m-d\TH:i:s\Z')
    ]);
    exit;
}

// -------------------------------------------------------------
// 3. ACTION: lookup (Recherche un joueur par code ou pseudo)
// -------------------------------------------------------------
if ($action === 'lookup') {
    $query = trim((string)($_GET['query'] ?? ($body['query'] ?? '')));
    if (empty($query)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Veuillez saisir un code ami ou un pseudonyme.']);
        exit;
    }

    // Tentative 1 : Par code ami direct
    $codeCandidate = sanitizeFriendCode($query);
    if ($codeCandidate && isset($db['players'][$codeCandidate])) {
        $player = $db['players'][$codeCandidate];
        $player['isOnline'] = (time() - strtotime($player['lastActive'] ?? '')) < 600;
        echo json_encode(['success' => true, 'player' => $player]);
        exit;
    }

    // Tentative 2 : Par pseudo exact normalisé
    $norm = normalizeUsername($query);
    if (isset($db['usernameToCode'][$norm])) {
        $targetCode = $db['usernameToCode'][$norm];
        if (isset($db['players'][$targetCode])) {
            $player = $db['players'][$targetCode];
            $player['isOnline'] = (time() - strtotime($player['lastActive'] ?? '')) < 600;
            echo json_encode(['success' => true, 'player' => $player]);
            exit;
        }
    }

    // Tentative 3 : Recherche floue parmi les pseudos des joueurs
    foreach ($db['players'] as $p) {
        if (strcasecmp($p['username'], $query) === 0) {
            $p['isOnline'] = (time() - strtotime($p['lastActive'] ?? '')) < 600;
            echo json_encode(['success' => true, 'player' => $p]);
            exit;
        }
    }

    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Aucun compagnon trouvé avec cet identifiant ou ce pseudo.']);
    exit;
}

// -------------------------------------------------------------
// 4. ACTION: sync_steam_friends (Détecte les amis Steam inscrits)
// -------------------------------------------------------------
if ($action === 'sync_steam_friends') {
    $steamId = preg_match('/^\d{17}$/', (string)($body['steamId'] ?? ($_GET['steamId'] ?? ''))) ? (string)($body['steamId'] ?? $_GET['steamId']) : null;
    if (!$steamId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'SteamID64 manquant ou invalide.']);
        exit;
    }

    $apiKey = getMasterSteamKey($steamKeyFile);
    if (empty($apiKey)) {
        echo json_encode([
            'success' => false,
            'error' => 'Clé API Steam non configurée sur le serveur.',
            'matchedFriends' => []
        ]);
        exit;
    }

    // Appel cURL sécurisé vers GetFriendList de Steam
    $url = "https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key={$apiKey}&steamid={$steamId}&relationship=friend";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 6);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'HootIndieGames-FriendsSync/1.0');
    $resp = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200 || empty($resp)) {
        echo json_encode([
            'success' => false,
            'error' => 'Impossible de récupérer votre liste d’amis Steam (profil privé ou indisponible).',
            'matchedFriends' => []
        ]);
        exit;
    }

    $steamData = json_decode($resp, true);
    $friendList = $steamData['friendslist']['friends'] ?? [];
    $matched = [];

    foreach ($friendList as $f) {
        $fid = (string)($f['steamid'] ?? '');
        if (!empty($fid) && isset($db['steamToCode'][$fid])) {
            $fCode = $db['steamToCode'][$fid];
            if (isset($db['players'][$fCode]) && $fCode !== ($db['steamToCode'][$steamId] ?? '')) {
                $matched[] = $db['players'][$fCode];
            }
        }
    }

    echo json_encode([
        'success' => true,
        'matchedFriends' => $matched,
        'totalSteamFriends' => count($friendList)
    ]);
    exit;
}

// Action non reconnue
http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Action non supportée. Actions valides: register, get_friends, lookup, sync_steam_friends']);
