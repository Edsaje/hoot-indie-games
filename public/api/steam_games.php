<?php
/**
 * 🦉 Hoot Indie Games — Proxy API Steam Souverain & Synchronisation
 * 
 * Rôle :
 * 1. Exécute les requêtes vers l'API Web Steam côté serveur (cURL) afin de contourner
 *    les restrictions CORS strictes des navigateurs (évite le "NetworkError").
 * 2. Utilise la Clé Maîtresse Steam du site (Méthode 1) stockée de manière sécurisée
 *    dans public/api/.steam_key, évitant à chaque visiteur d'avoir à créer une clé API.
 * 3. Permet également aux utilisateurs avancés d'utiliser leur propre clé API en surcharge.
 * 4. Récupère la ludothèque complète (GetOwnedGames) et les données du joueur (GetPlayerSummaries).
 * 5. Respecte la confidentialité et les standards RGPD (aucun cookie traceur, mise en cache éphémère).
 */

ini_set('display_errors', 0);
error_reporting(0);

// Headers HTTP de sécurité et CORS
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/admin_auth.php';
$steamKeyFile = __DIR__ . '/.steam_key';
$cacheDir = __DIR__;

// Helper: Récupération de la clé API Maîtresse
function getMasterSteamApiKey($filePath) {
    if (file_exists($filePath)) {
        $content = @file_get_contents($filePath);
        if ($content) {
            $key = trim($content);
            if (!empty($key)) return $key;
        }
    }
    // Fallback variable d'environnement si disponible
    $envKey = getenv('STEAM_API_KEY') ?: ($_ENV['STEAM_API_KEY'] ?? '');
    if (!empty($envKey)) return trim($envKey);

    return '';
}

// Helper: Appel cURL HTTP sécurisé
function fetchSteamApiUrl($url, $timeout = 8) {
    if (function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 4);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_USERAGENT, 'HootIndieGames-Sync/1.0 (+https://hootindiegames.com)');
        $body = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr = curl_error($ch);
        curl_close($ch);

        return [
            'ok' => ($httpCode >= 200 && $httpCode < 300),
            'status' => $httpCode,
            'body' => $body,
            'error' => $curlErr
        ];
    }

    // Fallback file_get_contents si cURL non actif
    $opts = [
        'http' => [
            'method' => 'GET',
            'timeout' => $timeout,
            'header' => "User-Agent: HootIndieGames-Sync/1.0\r\nAccept: application/json\r\n"
        ],
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true
        ]
    ];
    $ctx = @stream_context_create($opts);
    $body = @file_get_contents($url, false, $ctx);
    return [
        'ok' => ($body !== false),
        'status' => ($body !== false ? 200 : 500),
        'body' => $body,
        'error' => ''
    ];
}

$action = $_GET['action'] ?? $_POST['action'] ?? 'get_games';
$masterKey = getMasterSteamApiKey($steamKeyFile);

// =============================================================
// ACTION 1 : STATUT DU PROXY & DISPONIBILITÉ DE LA CLÉ MAÎTRESSE
// =============================================================
if ($action === 'status') {
    $hasKey = !empty($masterKey);
    $maskedKey = $hasKey ? substr($masterKey, 0, 4) . '••••••••' . substr($masterKey, -4) : '';
    echo json_encode([
        'success' => true,
        'hasMasterKey' => $hasKey,
        'maskedKey' => $maskedKey,
        'adminSteamId' => ADMIN_STEAM_ID,
        'serverTime' => date('c'),
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// =============================================================
// ACTION 2 : ENREGISTREMENT SÉCURISÉ DE LA CLÉ MAÎTRESSE (ADMIN)
// =============================================================
if ($action === 'set_master_key') {
    $inputKey = trim($_POST['apiKey'] ?? $_GET['apiKey'] ?? '');
    $adminId = trim($_POST['adminSteamId'] ?? $_GET['adminSteamId'] ?? '');

    // Sécurité : autoriser si .steam_key n'existe pas encore OU si authentifié en tant qu'administrateur
    $isAuthorized = empty($masterKey) || isCreatorAdminAuthorized();

    if (!$isAuthorized) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'UNAUTHORIZED',
            'message' => 'Action réservée au créateur du site (Steam ID ' . ADMIN_STEAM_ID . ').'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (empty($inputKey) || strlen($inputKey) < 20 || !preg_match('/^[a-fA-F0-9]{24,40}$/', $inputKey)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'INVALID_FORMAT',
            'message' => 'Format de clé API Steam Web invalide (doit contenir 32 caractères hexadécimaux).'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Sauvegarde atomique de la clé
    $saved = @file_put_contents($steamKeyFile, $inputKey, LOCK_EX);
    if ($saved !== false) {
        @chmod($steamKeyFile, 0600);
        echo json_encode([
            'success' => true,
            'message' => 'Clé Maîtresse Steam configurée avec succès ! Les utilisateurs peuvent désormais synchroniser leurs jeux en 1 clic sans clé API.',
            'hasMasterKey' => true,
            'maskedKey' => substr($inputKey, 0, 4) . '••••••••' . substr($inputKey, -4)
        ], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'WRITE_FAILED',
            'message' => 'Impossible d\'écrire le fichier .steam_key sur le serveur (vérifiez les permissions d\'écriture).'
        ], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// =============================================================
// ACTION 3 : SYNCHRONISATION DE LA BIBLIOTHÈQUE & PROFIL STEAM
// =============================================================
$steamId = trim($_GET['steamId'] ?? $_POST['steamId'] ?? '');
$userProvidedKey = trim($_GET['apiKey'] ?? $_POST['apiKey'] ?? '');
$activeKey = !empty($userProvidedKey) ? $userProvidedKey : $masterKey;

if (empty($steamId)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'MISSING_STEAM_ID',
        'message' => 'Paramètre steamId manquant.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (empty($activeKey)) {
    http_response_code(200);
    echo json_encode([
        'success' => false,
        'error' => 'NO_API_KEY',
        'hasMasterKey' => false,
        'message' => 'Aucune Clé API Steam Maîtresse configurée sur le serveur. Veuillez renseigner votre clé API ou demander à l\'administrateur de l\'activer dans le tableau de bord.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Si l'utilisateur fournit un pseudo ou vanity URL au lieu d'un SteamID64 (17 chiffres)
if (!preg_match('/^7656\d{13}$/', $steamId)) {
    // Tenter la résolution du Vanity URL via Steam
    $vanityUrl = 'https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=' . urlencode($activeKey) . '&vanityurl=' . urlencode($steamId);
    $vanityRes = fetchSteamApiUrl($vanityUrl);
    if ($vanityRes['ok']) {
        $vData = json_decode($vanityRes['body'], true);
        if (!empty($vData['response']['steamid'])) {
            $steamId = $vData['response']['steamid'];
        }
    }
}

// Cache éphémère (15 minutes) pour préserver le quota de requêtes Valve
$bypassCache = !empty($_GET['refresh']) || !empty($_POST['refresh']);
$cacheFile = $cacheDir . '/.steam_cache_' . md5($steamId) . '.json';

if (!$bypassCache && file_exists($cacheFile)) {
    $mtime = @filemtime($cacheFile);
    if ($mtime && (time() - $mtime) < 900) { // 15 min
        $cachedJson = @file_get_contents($cacheFile);
        if ($cachedJson) {
            $parsed = json_decode($cachedJson, true);
            if (!empty($parsed) && isset($parsed['success'])) {
                $parsed['cached'] = true;
                echo json_encode($parsed, JSON_UNESCAPED_UNICODE);
                exit;
            }
        }
    }
}

// 1. Appel GetOwnedGames
$gamesApiUrl = 'https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=' . urlencode($activeKey) .
    '&steamid=' . urlencode($steamId) .
    '&format=json&include_appinfo=1&include_played_free_games=1';

$gamesRes = fetchSteamApiUrl($gamesApiUrl, 10);

if (!$gamesRes['ok']) {
    if ($gamesRes['status'] === 403) {
        echo json_encode([
            'success' => false,
            'error' => 'VALVE_403',
            'message' => 'Clé API Steam non reconnue par Valve, ou accès interdit.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    echo json_encode([
        'success' => false,
        'error' => 'STEAM_TIMEOUT',
        'message' => 'Les serveurs de Valve Steam n\'ont pas répondu à temps. Veuillez réessayer dans quelques secondes.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$gamesData = json_decode($gamesRes['body'], true);
$games = $gamesData['response']['games'] ?? null;

// Vérification de profil privé
if (!is_array($games)) {
    echo json_encode([
        'success' => false,
        'error' => 'PRIVATE_LIBRARY',
        'steamId' => $steamId,
        'message' => 'Votre bibliothèque Steam est configurée en "Privé". Pour synchroniser vos jeux, rendez "Détails des jeux" en "Public" dans vos paramètres de confidentialité Steam (Profil > Modifier le profil > Paramètres de confidentialité).'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Extraction des AppIDs
$ownedAppIds = [];
foreach ($games as $g) {
    if (!empty($g['appid']) && is_numeric($g['appid'])) {
        $ownedAppIds[] = (int)$g['appid'];
    }
}

// 2. Appel GetPlayerSummaries pour récupérer le pseudo et l'avatar officiel
$playerInfo = [
    'steamId' => $steamId,
    'personaName' => 'Joueur Steam #' . substr($steamId, -4),
    'avatarUrl' => 'https://avatars.fastly.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
    'profileUrl' => 'https://steamcommunity.com/profiles/' . $steamId,
];

$playerApiUrl = 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' . urlencode($activeKey) .
    '&steamids=' . urlencode($steamId);

$playerRes = fetchSteamApiUrl($playerApiUrl, 6);
if ($playerRes['ok']) {
    $pData = json_decode($playerRes['body'], true);
    $players = $pData['response']['players'] ?? [];
    if (!empty($players[0])) {
        $p = $players[0];
        if (!empty($p['personaname'])) $playerInfo['personaName'] = $p['personaname'];
        if (!empty($p['avatarfull'])) $playerInfo['avatarUrl'] = $p['avatarfull'];
        elseif (!empty($p['avatarmedium'])) $playerInfo['avatarUrl'] = $p['avatarmedium'];
        if (!empty($p['profileurl'])) $playerInfo['profileUrl'] = $p['profileurl'];
    }
}

$responsePayload = [
    'success' => true,
    'steamId' => $steamId,
    'count' => count($ownedAppIds),
    'ownedAppIds' => $ownedAppIds,
    'player' => $playerInfo,
    'message' => count($ownedAppIds) . ' jeux trouvés dans votre bibliothèque Steam !'
];

// Sauvegarde dans le cache
@file_put_contents($cacheFile, json_encode($responsePayload), LOCK_EX);

echo json_encode($responsePayload, JSON_UNESCAPED_UNICODE);
