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
require_once __DIR__ . '/admin_auth.php';
sendCorsHeaders();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataFile = __DIR__ . '/friends_data.json';
$rateLimitFile = __DIR__ . '/friends_ratelimit.json';
$steamKeyFile = __DIR__ . '/.steam_key';

// Helper: Récupération IP client fiable (sans spoofing X-Forwarded-For)
function getClientIp() {
    return getAuthClientIp();
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
        ],
        'friendships' => [
            'HOOT-HIBOU' => []
        ],
        'requests' => []
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
                        if (!isset($decoded['friendships']) || !is_array($decoded['friendships'])) {
                            $decoded['friendships'] = [];
                        }
                        if (!isset($decoded['requests']) || !is_array($decoded['requests'])) {
                            $decoded['requests'] = [];
                        }
                        if (!isset($decoded['friendships']['HOOT-HIBOU']) || !is_array($decoded['friendships']['HOOT-HIBOU'])) {
                            $decoded['friendships']['HOOT-HIBOU'] = [];
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

// Résolution d'un code ami à partir d'un code brut ou d'un pseudonyme
function resolveUserFriendCode($db, $query) {
    $q = trim((string)$query);
    if (empty($q)) return null;

    $cand = sanitizeFriendCode($q);
    if ($cand && isset($db['players'][$cand])) {
        return $cand;
    }

    $norm = normalizeUsername($q);
    if (isset($db['usernameToCode'][$norm])) {
        return $db['usernameToCode'][$norm];
    }

    foreach (($db['players'] ?? []) as $code => $p) {
        if (strcasecmp($p['username'] ?? '', $q) === 0) {
            return $code;
        }
    }
    return null;
}

// Vérifie si deux joueurs sont compagnons mutuels (consentement bilatéral)
function areFriendsMutual($db, $codeA, $codeB) {
    if (empty($codeA) || empty($codeB)) return false;
    $cA = strtoupper(trim((string)$codeA));
    $cB = strtoupper(trim((string)$codeB));
    if ($cA === $cB) return true;

    // Règle d'or souveraine : Le Fondateur Hibouxe est l'hôte d'accueil universel du Sanctuaire
    if ($cA === 'HOOT-HIBOU' || $cB === 'HOOT-HIBOU') {
        return true;
    }

    $f = $db['friendships'] ?? [];
    $inA = in_array($cB, $f[$cA] ?? [], true);
    $inB = in_array($cA, $f[$cB] ?? [], true);
    return ($inA && $inB);
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

    // [SÉCURITÉ CWE-639] Protection contre l'écrasement ou l'usurpation d'un code ami existant
    if (isset($db['players'][$friendCode])) {
        $existing = $db['players'][$friendCode];
        $isOwner = false;

        if (isCreatorAdminAuthorized()) {
            $isOwner = true;
        } elseif (!empty($existing['steamId']) && !empty($steamId) && $existing['steamId'] === $steamId) {
            $isOwner = true;
        } elseif (empty($existing['steamId']) && empty($steamId)) {
            // Pour les profils sans Steam, autoriser la mise à jour si le nom correspond
            $normExisting = normalizeUsername($existing['username'] ?? '');
            if (empty($normExisting) || $normExisting === normalizeUsername($cleanUsername)) {
                $isOwner = true;
            }
        }

        if (!$isOwner) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'error' => 'code_already_claimed',
                'message' => 'Ce code ami est déjà associé à un autre compte de joueur.'
            ]);
            exit;
        }
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

    // Règle d'or : Hibouxe (HOOT-HIBOU) est mutuellement ami par défaut avec tout joueur inscrit
    if (!isset($db['friendships'][$friendCode])) {
        $db['friendships'][$friendCode] = [];
    }
    if ($friendCode !== 'HOOT-HIBOU') {
        if (!in_array('HOOT-HIBOU', $db['friendships'][$friendCode], true)) {
            $db['friendships'][$friendCode][] = 'HOOT-HIBOU';
        }
        if (!isset($db['friendships']['HOOT-HIBOU'])) {
            $db['friendships']['HOOT-HIBOU'] = [];
        }
        if (!in_array($friendCode, $db['friendships']['HOOT-HIBOU'], true)) {
            $db['friendships']['HOOT-HIBOU'][] = $friendCode;
        }
    }

    saveFriendsDatabase($dataFile, $db);

    echo json_encode([
        'success' => true,
        'player' => $playerEntry
    ]);
    exit;
}

// -------------------------------------------------------------
// 2. ACTION: get_friends (Récupère la liste des profils d'amis et mutualités)
// -------------------------------------------------------------
if ($action === 'get_friends') {
    $myCode = sanitizeFriendCode($body['myCode'] ?? ($_GET['myCode'] ?? ''));
    $codes = $body['codes'] ?? ($_GET['codes'] ?? []);
    if (is_string($codes)) {
        $codes = array_filter(array_map('trim', explode(',', $codes)));
    }
    if (!is_array($codes)) {
        $codes = [];
    }

    // Si myCode est fourni, fusionner avec sa liste d'amis mutuels sur le serveur
    $mutualCodes = [];
    if ($myCode) {
        $mutualList = $db['friendships'][$myCode] ?? [];
        if ($myCode !== 'HOOT-HIBOU' && !in_array('HOOT-HIBOU', $mutualList, true)) {
            $mutualList[] = 'HOOT-HIBOU';
        }
        foreach ($mutualList as $mc) {
            if ($mc && !in_array($mc, $codes, true)) {
                $codes[] = $mc;
            }
        }
        $mutualCodes = array_values(array_unique(array_filter($mutualList, function($c) use ($myCode) {
            return $c !== $myCode;
        })));
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
        'mutualCodes' => $mutualCodes,
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
    // [CWE-352] Imposer une requête POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Requête POST obligatoire pour la synchronisation Steam.']);
        exit;
    }

    // [CWE-799] Rate-limiting strict pour éviter l'abus comme proxy d'énumération Steam
    $clientIp = getClientIp();
    if (!checkFriendsRateLimit($rateLimitFile, $clientIp)) {
        http_response_code(429);
        echo json_encode(['success' => false, 'error' => 'Trop de requêtes de synchronisation. Veuillez patienter.']);
        exit;
    }

    $steamId = preg_match('/^\d{17}$/', (string)($body['steamId'] ?? '')) ? (string)$body['steamId'] : null;
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

// -------------------------------------------------------------
// 5. ACTION: send_request (Envoyer une demande d'amitié bilatérale)
// -------------------------------------------------------------
if ($action === 'send_request' || $action === 'send_friend_request') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Méthode POST requise.']);
        exit;
    }

    $fromCode = sanitizeFriendCode($body['fromCode'] ?? '');
    if (!$fromCode || !isset($db['players'][$fromCode])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Code joueur expéditeur invalide ou inconnu.']);
        exit;
    }

    $rawTarget = trim((string)($body['toCode'] ?? ($body['targetQuery'] ?? '')));
    if (empty($rawTarget)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Veuillez préciser un code joueur ou un pseudonyme cible.']);
        exit;
    }

    $toCode = resolveUserFriendCode($db, $rawTarget);
    if (!$toCode || !isset($db['players'][$toCode])) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'not_found', 'message' => 'Aucun compagnon trouvé avec cet identifiant ou ce pseudo.']);
        exit;
    }

    if ($fromCode === $toCode) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'self_request', 'message' => 'Vous ne pouvez pas vous envoyer une invitation d’amitié à vous-même.']);
        exit;
    }

    $targetPlayer = $db['players'][$toCode];

    // Règle d'or : Hibouxe est le compagnon d'accueil officiel universel
    if ($toCode === 'HOOT-HIBOU') {
        if (!isset($db['friendships'][$fromCode])) $db['friendships'][$fromCode] = [];
        if (!in_array('HOOT-HIBOU', $db['friendships'][$fromCode], true)) {
            $db['friendships'][$fromCode][] = 'HOOT-HIBOU';
        }
        if (!isset($db['friendships']['HOOT-HIBOU'])) $db['friendships']['HOOT-HIBOU'] = [];
        if (!in_array($fromCode, $db['friendships']['HOOT-HIBOU'], true)) {
            $db['friendships']['HOOT-HIBOU'][] = $fromCode;
        }
        saveFriendsDatabase($dataFile, $db);
        echo json_encode([
            'success' => true,
            'isImmediate' => true,
            'message' => 'Hibouxe est votre compagnon d’accueil officiel au Perchoir !',
            'player' => $targetPlayer
        ]);
        exit;
    }

    // Déjà compagnons mutuels ?
    if (areFriendsMutual($db, $fromCode, $toCode)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'already_friends',
            'message' => 'Vous faites déjà mutuellement partie de vos cercles de compagnons !',
            'player' => $targetPlayer
        ]);
        exit;
    }

    // Vérifier les demandes existantes
    $requests = &$db['requests'];
    foreach ($requests as &$req) {
        // Demande identique déjà en attente
        if ($req['status'] === 'pending' && $req['fromCode'] === $fromCode && $req['toCode'] === $toCode) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'request_pending',
                'message' => 'Une invitation d’amitié est déjà en cours d’attente auprès de ' . $targetPlayer['username'] . '.'
            ]);
            exit;
        }

        // Si le destinataire nous avait DÉJÀ envoyé une demande en attente, acceptation automatique immédiate !
        if ($req['status'] === 'pending' && $req['fromCode'] === $toCode && $req['toCode'] === $fromCode) {
            $req['status'] = 'accepted';
            $req['updatedAt'] = gmdate('Y-m-d\TH:i:s\Z');

            if (!isset($db['friendships'][$fromCode])) $db['friendships'][$fromCode] = [];
            if (!in_array($toCode, $db['friendships'][$fromCode], true)) $db['friendships'][$fromCode][] = $toCode;

            if (!isset($db['friendships'][$toCode])) $db['friendships'][$toCode] = [];
            if (!in_array($fromCode, $db['friendships'][$toCode], true)) $db['friendships'][$toCode][] = $fromCode;

            saveFriendsDatabase($dataFile, $db);
            echo json_encode([
                'success' => true,
                'isImmediate' => true,
                'message' => $targetPlayer['username'] . ' vous avait déjà invité ! Vous êtes désormais compagnons mutuels.',
                'player' => $targetPlayer
            ]);
            exit;
        }
    }
    unset($req);

    // Créer la nouvelle requête d'amitié
    $reqId = 'freq_' . time() . '_' . substr(md5(uniqid(getClientIp(), true)), 0, 8);
    $fromPlayer = $db['players'][$fromCode];
    $newRequest = [
        'id' => $reqId,
        'fromCode' => $fromCode,
        'fromUsername' => $fromPlayer['username'] ?? 'Explorateur',
        'fromAvatarId' => $fromPlayer['avatarId'] ?? 'owl',
        'fromTitle' => $fromPlayer['title'] ?? 'Explorateur',
        'toCode' => $toCode,
        'toUsername' => $targetPlayer['username'] ?? 'Explorateur',
        'status' => 'pending',
        'createdAt' => gmdate('Y-m-d\TH:i:s\Z'),
        'updatedAt' => gmdate('Y-m-d\TH:i:s\Z')
    ];

    $db['requests'][] = $newRequest;
    saveFriendsDatabase($dataFile, $db);

    echo json_encode([
        'success' => true,
        'isImmediate' => false,
        'message' => 'Demande d’amitié envoyée à ' . $targetPlayer['username'] . ' ! En attente de son acceptation.',
        'request' => $newRequest,
        'player' => $targetPlayer
    ]);
    exit;
}

// -------------------------------------------------------------
// 6. ACTION: get_requests (Récupère les demandes reçues et envoyées)
// -------------------------------------------------------------
if ($action === 'get_requests' || $action === 'get_friend_requests') {
    $myCode = sanitizeFriendCode($body['myCode'] ?? ($_GET['myCode'] ?? ''));
    if (!$myCode) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Code joueur manquant ou invalide.']);
        exit;
    }

    $now = time();
    $incoming = [];
    $outgoing = [];

    foreach (($db['requests'] ?? []) as $r) {
        if (($r['status'] ?? '') !== 'pending') continue;

        // Reçue
        if ($r['toCode'] === $myCode) {
            $fromP = $db['players'][$r['fromCode']] ?? null;
            if ($fromP) {
                $lastActiveTs = strtotime($fromP['lastActive'] ?? '');
                $fromP['isOnline'] = ($lastActiveTs && ($now - $lastActiveTs) < 600);
            }
            $r['fromPlayer'] = $fromP;
            $incoming[] = $r;
        }

        // Envoyée
        if ($r['fromCode'] === $myCode) {
            $toP = $db['players'][$r['toCode']] ?? null;
            if ($toP) {
                $lastActiveTs = strtotime($toP['lastActive'] ?? '');
                $toP['isOnline'] = ($lastActiveTs && ($now - $lastActiveTs) < 600);
            }
            $r['toPlayer'] = $toP;
            $outgoing[] = $r;
        }
    }

    echo json_encode([
        'success' => true,
        'incoming' => $incoming,
        'outgoing' => $outgoing,
        'serverTime' => gmdate('Y-m-d\TH:i:s\Z')
    ]);
    exit;
}

// -------------------------------------------------------------
// 7. ACTION: respond_request (Accepter, Refuser ou Annuler une demande)
// -------------------------------------------------------------
if ($action === 'respond_request' || $action === 'respond_friend_request') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Méthode POST requise.']);
        exit;
    }

    $requestId = trim((string)($body['requestId'] ?? ''));
    $subAction = strtolower(trim((string)($body['action'] ?? ($body['response'] ?? ''))));
    $myCode = sanitizeFriendCode($body['myCode'] ?? '');

    if (empty($requestId) || !in_array($subAction, ['accept', 'decline', 'cancel'], true) || !$myCode) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Paramètres invalides (requestId, action, myCode requis).']);
        exit;
    }

    $foundIndex = -1;
    foreach ($db['requests'] as $idx => $req) {
        if ($req['id'] === $requestId) {
            $foundIndex = $idx;
            break;
        }
    }

    if ($foundIndex === -1) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Demande d’amitié introuvable.']);
        exit;
    }

    $targetReq = &$db['requests'][$foundIndex];

    if ($targetReq['status'] !== 'pending') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Cette demande a déjà été traitée (' . $targetReq['status'] . ').']);
        exit;
    }

    if (in_array($subAction, ['accept', 'decline'], true)) {
        if ($targetReq['toCode'] !== $myCode) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Vous n’êtes pas le destinataire de cette demande.']);
            exit;
        }
    } else if ($subAction === 'cancel') {
        if ($targetReq['fromCode'] !== $myCode) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Vous n’êtes pas l’expéditeur de cette demande.']);
            exit;
        }
    }

    $targetReq['updatedAt'] = gmdate('Y-m-d\TH:i:s\Z');

    if ($subAction === 'accept') {
        $targetReq['status'] = 'accepted';
        $c1 = $targetReq['fromCode'];
        $c2 = $targetReq['toCode'];

        if (!isset($db['friendships'][$c1])) $db['friendships'][$c1] = [];
        if (!in_array($c2, $db['friendships'][$c1], true)) $db['friendships'][$c1][] = $c2;

        if (!isset($db['friendships'][$c2])) $db['friendships'][$c2] = [];
        if (!in_array($c1, $db['friendships'][$c2], true)) $db['friendships'][$c2][] = $c1;

        saveFriendsDatabase($dataFile, $db);

        $newFriendPlayer = $db['players'][$c1] ?? null;
        if ($newFriendPlayer) {
            $lastActiveTs = strtotime($newFriendPlayer['lastActive'] ?? '');
            $newFriendPlayer['isOnline'] = ($lastActiveTs && (time() - $lastActiveTs) < 600);
        }

        echo json_encode([
            'success' => true,
            'message' => 'Demande acceptée ! Vous êtes désormais compagnons mutuels.',
            'request' => $targetReq,
            'newFriend' => $newFriendPlayer
        ]);
        exit;
    } elseif ($subAction === 'decline') {
        $targetReq['status'] = 'declined';
        saveFriendsDatabase($dataFile, $db);
        echo json_encode([
            'success' => true,
            'message' => 'Demande d’amitié refusée.',
            'request' => $targetReq
        ]);
        exit;
    } elseif ($subAction === 'cancel') {
        $targetReq['status'] = 'canceled';
        saveFriendsDatabase($dataFile, $db);
        echo json_encode([
            'success' => true,
            'message' => 'Demande d’amitié annulée.',
            'request' => $targetReq
        ]);
        exit;
    }
}

// -------------------------------------------------------------
// 8. ACTION: remove_friend (Retirer un ami de son cercle de façon synchronisée)
// -------------------------------------------------------------
if ($action === 'remove_friend') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Méthode POST requise.']);
        exit;
    }

    $myCode = sanitizeFriendCode($body['myCode'] ?? '');
    $targetCode = sanitizeFriendCode($body['targetCode'] ?? '');

    if (!$myCode || !$targetCode) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Codes joueurs invalides ou manquants.']);
        exit;
    }

    if (isset($db['friendships'][$myCode])) {
        $db['friendships'][$myCode] = array_values(array_filter($db['friendships'][$myCode], function($c) use ($targetCode) {
            return $c !== $targetCode;
        }));
    }

    if (isset($db['friendships'][$targetCode])) {
        $db['friendships'][$targetCode] = array_values(array_filter($db['friendships'][$targetCode], function($c) use ($myCode) {
            return $c !== $myCode;
        }));
    }

    saveFriendsDatabase($dataFile, $db);

    echo json_encode([
        'success' => true,
        'message' => 'Compagnon retiré de votre cercle.'
    ]);
    exit;
}

// -------------------------------------------------------------
// 9. ACTION: are_friends (Vérifie si deux utilisateurs sont amis mutuels)
// -------------------------------------------------------------
if ($action === 'are_friends') {
    $userA = trim((string)($body['userA'] ?? ($_GET['userA'] ?? '')));
    $userB = trim((string)($body['userB'] ?? ($_GET['userB'] ?? '')));

    if (empty($userA) || empty($userB)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'userA et userB requis.']);
        exit;
    }

    $codeA = resolveUserFriendCode($db, $userA);
    $codeB = resolveUserFriendCode($db, $userB);

    $areFriends = ($codeA && $codeB) ? areFriendsMutual($db, $codeA, $codeB) : false;

    echo json_encode([
        'success' => true,
        'areFriends' => $areFriends,
        'codeA' => $codeA,
        'codeB' => $codeB
    ]);
    exit;
}

// Action non reconnue
http_response_code(400);
echo json_encode([
    'success' => false,
    'error' => 'Action non supportée. Actions valides: register, get_friends, lookup, sync_steam_friends, send_request, get_requests, respond_request, remove_friend, are_friends'
]);

