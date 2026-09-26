<?php
/**
 * 🦉 Hoot Indie Games — Backend de Synchronisation Cloud Souverain (Multi-Appareils)
 * 
 * Rôle :
 * 1. Permet aux joueurs (notamment connectés via Steam OpenID ou compte enregistré)
 *    de conserver leur état complet de jeu entre différents ordinateurs, navigateurs et mobiles.
 * 2. Synchronise :
 *    - Le solde des Plumes d'Or (farm quotidien + primes - achats)
 *    - Les achats de la Boutique (Avatars, Titres prestigieux, Cadres)
 *    - Les succès débloqués (Achievements)
 *    - Les statistiques des jeux quotidiens et streaks
 *    - Les records Time Attack et Salle d'Arcade
 *    - Le profil (avatar, pseudo, titre actif, stats Versus)
 * 3. Fusion intelligente (Merge) : prend le meilleur score, l'union des cosmétiques
 *    et des succès pour éviter tout écrasement ou perte de données entre deux sessions.
 * 4. Persistance atomique sécurisée dans public/api/user_saves/ avec verrouillage LOCK_EX.
 */

ini_set('display_errors', 0);
error_reporting(0);

// Headers HTTP de sécurité & CORS
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
require_once __DIR__ . '/admin_auth.php';
sendCorsHeaders();
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$savesDir = __DIR__ . '/user_saves';

if (!is_dir($savesDir)) {
    @mkdir($savesDir, 0755, true);
}

// Nettoyage et détermination de la clé utilisateur sécurisée
function getUserStorageKey() {
    $sessionUserId = $_SESSION['hoot_user_id'] ?? '';
    $sessionSteamId = $_SESSION['steam_id'] ?? '';

    $steamId = isset($_REQUEST['steamId']) ? trim($_REQUEST['steamId']) : $sessionSteamId;
    $userId = isset($_REQUEST['userId']) ? trim($_REQUEST['userId']) : $sessionUserId;
    $username = isset($_REQUEST['username']) ? trim($_REQUEST['username']) : '';

    if (!empty($sessionUserId)) {
        return 'user_' . preg_replace('/[^a-zA-Z0-9_\-]/', '', $sessionUserId);
    }

    if (!empty($steamId)) {
        $clean = preg_replace('/[^a-zA-Z0-9_\-]/', '', $steamId);
        if (!empty($clean)) {
            return 'steam_' . $clean;
        }
    }

    // Si userId est un vrai compte authentifié (ex: user_xxx) et pas un identifiant local temporaire
    if (!empty($userId) && strpos($userId, 'local_') !== 0) {
        $clean = preg_replace('/[^a-zA-Z0-9_\-]/', '', $userId);
        if (!empty($clean)) return 'user_' . $clean;
    }

    // Pseudonyme revendiqué du joueur
    if (!empty($username)) {
        $clean = mb_strtolower(trim($username), 'UTF-8');
        $clean = preg_replace('/[^a-z0-9]/', '', $clean);
        if (!empty($clean) && $clean !== 'hiboumystere') {
            return 'name_' . $clean;
        }
    }

    // Fallback sur userId local si aucune autre identité n'est disponible
    if (!empty($userId)) {
        $clean = preg_replace('/[^a-zA-Z0-9_\-]/', '', $userId);
        if (!empty($clean)) return 'user_' . $clean;
    }

    return null;
}

// Helper pour fusionner intelligemment deux sauvegardes
function mergeSaveData($existing, $incoming) {
    if (!is_array($existing) || empty($existing)) {
        $incoming['syncedAt'] = date('c');
        return $incoming;
    }
    if (!is_array($incoming) || empty($incoming)) {
        return $existing;
    }

    $merged = $existing;

    // 1. Identifiants & Profil
    if (!empty($incoming['steamId'])) $merged['steamId'] = $incoming['steamId'];
    if (!empty($incoming['userId'])) $merged['userId'] = $incoming['userId'];
    if (!empty($incoming['username']) && $incoming['username'] !== 'Hibou Mystère') {
        $cleanUName = preg_replace('/[^a-zA-Z0-9_\-]/', '', trim($incoming['username']));
        if (!empty($cleanUName) && strlen($cleanUName) <= 24) {
            $merged['username'] = $cleanUName;
        }
    }
    if (!empty($incoming['avatarId'])) $merged['avatarId'] = $incoming['avatarId'];
    if (!empty($incoming['title'])) $merged['title'] = $incoming['title'];
    if (!empty($incoming['activeFrame'])) $merged['activeFrame'] = $incoming['activeFrame'];

    // 2. Déblocages Boutique (Union stricte sans doublon)
    $allAvatars = array_unique(array_merge($existing['unlockedAvatars'] ?? [], $incoming['unlockedAvatars'] ?? []));
    $allTitles = array_unique(array_merge($existing['unlockedTitles'] ?? [], $incoming['unlockedTitles'] ?? []));
    $allFrames = array_unique(array_merge($existing['unlockedFrames'] ?? [], $incoming['unlockedFrames'] ?? []));
    $merged['unlockedAvatars'] = array_values($allAvatars);
    $merged['unlockedTitles'] = array_values($allTitles);
    $merged['unlockedFrames'] = array_values($allFrames);

    // 3. Économie des Plumes d'Or
    $exFeathers = $existing['feathers'] ?? [];
    $inFeathers = $incoming['feathers'] ?? [];
    $exClaimed = is_array($exFeathers['claimedDaily'] ?? null) ? $exFeathers['claimedDaily'] : [];
    $inClaimed = is_array($inFeathers['claimedDaily'] ?? null) ? $inFeathers['claimedDaily'] : [];
    $allClaimed = $exClaimed;
    foreach ($inClaimed as $dateKey => $record) {
        if (!is_array($record)) continue;
        if (!isset($allClaimed[$dateKey])) {
            $allClaimed[$dateKey] = $record;
        } else {
            $exGames = is_array($allClaimed[$dateKey]['claimedGames'] ?? null) ? $allClaimed[$dateKey]['claimedGames'] : [];
            $inGames = is_array($record['claimedGames'] ?? null) ? $record['claimedGames'] : [];
            $allClaimed[$dateKey]['claimedGames'] = array_values(array_unique(array_merge($exGames, $inGames)));
            $allClaimed[$dateKey]['grandSlamClaimed'] = !empty($allClaimed[$dateKey]['grandSlamClaimed']) || !empty($record['grandSlamClaimed']);
        }
    }
    $merged['feathers'] = [
        'bonus' => max(intval($exFeathers['bonus'] ?? 0), intval($inFeathers['bonus'] ?? 0)),
        'spent' => max(intval($exFeathers['spent'] ?? 0), intval($inFeathers['spent'] ?? 0)),
        'claimedDaily' => empty($allClaimed) ? new stdClass() : $allClaimed,
    ];

    // 4. Succès (Union stricte des identifiants débloqués)
    $exAch = is_array($existing['achievements'] ?? null) ? $existing['achievements'] : [];
    $inAch = is_array($incoming['achievements'] ?? null) ? $incoming['achievements'] : [];
    $allAch = array_unique(array_merge($exAch, $inAch));
    $merged['achievements'] = array_values($allAch);

    // 5. Statistiques de Jeu & Streaks (Conserver les scores maximaux pour chaque mode)
    $exStats = $existing['stats'] ?? [];
    $inStats = $incoming['stats'] ?? [];
    $modes = ['screenle', 'indledle', 'linkle', 'profille', 'chrono', 'pixel', 'review', 'blindtest'];
    $mergedStats = [];

    $isModeBased = false;
    foreach ($modes as $m) {
        if (isset($inStats[$m]) || isset($exStats[$m])) {
            $isModeBased = true;
            break;
        }
    }

    if ($isModeBased) {
        foreach ($modes as $m) {
            $exM = $exStats[$m] ?? [];
            $inM = $inStats[$m] ?? [];
            $dist = $exM['guessDistribution'] ?? [];
            if (!empty($inM['guessDistribution']) && is_array($inM['guessDistribution'])) {
                foreach ($inM['guessDistribution'] as $guesses => $count) {
                    $dist[$guesses] = max(intval($dist[$guesses] ?? 0), intval($count));
                }
            }
            $mergedStats[$m] = [
                'played' => max(intval($exM['played'] ?? 0), intval($inM['played'] ?? 0)),
                'won' => max(intval($exM['won'] ?? 0), intval($inM['won'] ?? 0)),
                'currentStreak' => max(intval($exM['currentStreak'] ?? 0), intval($inM['currentStreak'] ?? 0)),
                'maxStreak' => max(intval($exM['maxStreak'] ?? 0), intval($inM['maxStreak'] ?? 0)),
                'guessDistribution' => $dist,
                'lastPlayedDate' => max((string)($exM['lastPlayedDate'] ?? ''), (string)($inM['lastPlayedDate'] ?? '')),
                'lastWonDate' => max((string)($exM['lastWonDate'] ?? ''), (string)($inM['lastWonDate'] ?? '')),
                'streakRescued' => !empty($inM['streakRescued']) || !empty($exM['streakRescued']),
            ];
        }
        $merged['stats'] = $mergedStats;
    } else {
        $merged['stats'] = [
            'gamesPlayed' => max(intval($exStats['gamesPlayed'] ?? 0), intval($inStats['gamesPlayed'] ?? 0)),
            'gamesWon' => max(intval($exStats['gamesWon'] ?? 0), intval($inStats['gamesWon'] ?? 0)),
            'currentStreak' => max(intval($exStats['currentStreak'] ?? 0), intval($inStats['currentStreak'] ?? 0)),
            'maxStreak' => max(intval($exStats['maxStreak'] ?? 0), intval($inStats['maxStreak'] ?? 0)),
            'guessDistribution' => !empty($inStats['guessDistribution']) ? $inStats['guessDistribution'] : ($exStats['guessDistribution'] ?? []),
            'gameHistory' => array_merge($exStats['gameHistory'] ?? [], $inStats['gameHistory'] ?? []),
        ];
    }

    // 6. Time Attack Records (Prendre le high score maximal pour chaque discipline)
    $exTa = $existing['timeAttackStats'] ?? [];
    $inTa = $incoming['timeAttackStats'] ?? [];
    $allModes = array_unique(array_merge(array_keys($exTa), array_keys($inTa)));
    $mergedTa = [];
    foreach ($allModes as $m) {
        $mEx = $exTa[$m] ?? [];
        $mIn = $inTa[$m] ?? [];
        $mergedTa[$m] = [
            'highScore' => max(intval($mEx['highScore'] ?? 0), intval($mIn['highScore'] ?? 0)),
            'bestCombo' => max(intval($mEx['bestCombo'] ?? 0), intval($mIn['bestCombo'] ?? 0)),
            'gamesPlayed' => max(intval($mEx['gamesPlayed'] ?? 0), intval($mIn['gamesPlayed'] ?? 0)),
            'totalAnswered' => max(intval($mEx['totalAnswered'] ?? 0), intval($mIn['totalAnswered'] ?? 0)),
            'lastPlayed' => !empty($mIn['lastPlayed']) ? $mIn['lastPlayed'] : ($mEx['lastPlayed'] ?? date('c')),
        ];
    }
    $merged['timeAttackStats'] = $mergedTa;

    // 7. Versus Stats
    $exVersus = $existing['versusStats'] ?? [];
    $inVersus = $incoming['versusStats'] ?? [];
    $merged['versusStats'] = [
        'matchesPlayed' => max(intval($exVersus['matchesPlayed'] ?? 0), intval($inVersus['matchesPlayed'] ?? 0)),
        'matchesWon' => max(intval($exVersus['matchesWon'] ?? 0), intval($inVersus['matchesWon'] ?? 0)),
        'currentStreak' => max(intval($exVersus['currentStreak'] ?? 0), intval($inVersus['currentStreak'] ?? 0)),
        'bestStreak' => max(intval($exVersus['bestStreak'] ?? 0), intval($inVersus['bestStreak'] ?? 0)),
        'eloRating' => max(intval($exVersus['eloRating'] ?? 1000), intval($inVersus['eloRating'] ?? 1000)),
    ];

    // 8. Collection de Cartes (Fusion des cartes normales et holographiques)
    $exCards = is_array($existing['cardCollection'] ?? null) ? $existing['cardCollection'] : [];
    $inCards = is_array($incoming['cardCollection'] ?? null) ? $incoming['cardCollection'] : [];
    $mergedCards = $exCards;
    foreach ($inCards as $cardId => $cardData) {
        if (!is_array($cardData)) continue;
        if (!isset($mergedCards[$cardId])) {
            $mergedCards[$cardId] = $cardData;
        } else {
            $exCard = $mergedCards[$cardId];
            $mergedCards[$cardId] = [
                'count' => max(intval($exCard['count'] ?? 0), intval($cardData['count'] ?? 0)),
                'countHolo' => max(intval($exCard['countHolo'] ?? 0), intval($cardData['countHolo'] ?? 0)),
                'firstObtainedAt' => !empty($exCard['firstObtainedAt']) ? $exCard['firstObtainedAt'] : ($cardData['firstObtainedAt'] ?? date('c')),
            ];
        }
    }
    $merged['cardCollection'] = $mergedCards;

    // Dernier booster quotidien réclamé (date la plus récente)
    $exBooster = (string)($existing['lastDailyBoosterClaim'] ?? '');
    $inBooster = (string)($incoming['lastDailyBoosterClaim'] ?? '');
    $merged['lastDailyBoosterClaim'] = max($exBooster, $inBooster);

    // 9. Historique Quotidien du Calendrier (Daily Game States)
    $exDaily = is_array($existing['dailyGameStates'] ?? null) ? $existing['dailyGameStates'] : [];
    $inDaily = is_array($incoming['dailyGameStates'] ?? null) ? $incoming['dailyGameStates'] : [];
    $mergedDaily = $exDaily;
    foreach ($inDaily as $stateKey => $inState) {
        if (!is_array($inState)) continue;
        if (!isset($mergedDaily[$stateKey])) {
            $mergedDaily[$stateKey] = $inState;
        } else {
            $exState = $mergedDaily[$stateKey];
            $isWon = !empty($exState['isWon']) || !empty($inState['isWon']);
            $isCompleted = !empty($exState['isCompleted']) || !empty($inState['isCompleted']);
            $guesses = !empty($inState['guesses']) && count($inState['guesses']) >= count($exState['guesses'] ?? [])
                ? $inState['guesses']
                : ($exState['guesses'] ?? []);
            $mergedDaily[$stateKey] = array_merge($exState, $inState, [
                'isWon' => $isWon,
                'isCompleted' => $isCompleted,
                'guesses' => $guesses,
            ]);
        }
    }
    $merged['dailyGameStates'] = $mergedDaily;

    $merged['syncedAt'] = date('c');
    return $merged;
}

$action = isset($_REQUEST['action']) ? trim($_REQUEST['action']) : 'load';

// -------------------------------------------------------------
// ACTION : VALIDATION DU RETOUR STEAM OPENID 2.0 (AVEC VALVE)
// -------------------------------------------------------------
if ($action === 'verify_steam') {
    $validationParams = [
        'openid.ns' => 'http://specs.openid.net/auth/2.0',
        'openid.mode' => 'check_authentication',
    ];

    foreach ($_REQUEST as $k => $v) {
        if (strpos($k, 'openid_') === 0) {
            $validationParams['openid.' . substr($k, 7)] = $v;
        } elseif (strpos($k, 'openid.') === 0) {
            $validationParams[$k] = $v;
        }
    }
    $validationParams['openid.mode'] = 'check_authentication';

    $isValidAssertion = false;
    $postData = http_build_query($validationParams);
    $ch = @curl_init('https://steamcommunity.com/openid/login');
    if ($ch) {
        @curl_setopt($ch, CURLOPT_POST, 1);
        @curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        @curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        @curl_setopt($ch, CURLOPT_TIMEOUT, 8);
        @curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        $resp = @curl_exec($ch);
        @curl_close($ch);
        if ($resp && strpos($resp, 'is_valid:true') !== false) {
            $isValidAssertion = true;
        }
    }

    if (!$isValidAssertion) {
        $opts = [
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/x-www-form-urlencoded\r\nContent-Length: " . strlen($postData) . "\r\n",
                'content' => $postData,
                'timeout' => 8,
            ],
            'ssl' => [
                'verify_peer' => true,
                'verify_peer_name' => true,
            ]
        ];
        $ctx = @stream_context_create($opts);
        $res = @file_get_contents('https://steamcommunity.com/openid/login', false, $ctx);
        if ($res && strpos($res, 'is_valid:true') !== false) {
            $isValidAssertion = true;
        }
    }

    if (!$isValidAssertion) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'invalid_assertion',
            'message' => 'Validation Steam OpenID 2.0 rejetée par les serveurs Valve.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $claimedId = $_REQUEST['openid_claimed_id'] ?? $_REQUEST['openid.claimed_id'] ?? $_REQUEST['openid_identity'] ?? $_REQUEST['openid.identity'] ?? '';
    if (!preg_match('/\/id\/(\d{17})/', $claimedId, $m)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'missing_steam_id',
            'message' => 'SteamID non trouvé dans la réponse Valve.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $verifiedSteamId = $m[1];
    if (session_status() === PHP_SESSION_NONE) {
        @ini_set('session.cookie_httponly', 1);
        @session_start();
    }
    session_regenerate_id(true);
    $_SESSION['steam_id'] = $verifiedSteamId;

    $isCreator = ($verifiedSteamId === ADMIN_STEAM_ID);
    $resData = [
        'success' => true,
        'verified' => true,
        'steamId' => $verifiedSteamId,
        'isCreator' => $isCreator,
        'message' => 'Authentification Steam OpenID validée avec succès.',
    ];

    if ($isCreator) {
        $_SESSION['admin_auth'] = true;
        $_SESSION['admin_steam_id'] = $verifiedSteamId;
        $_SESSION['admin_login_at'] = date('c');

        $adminPassFile = __DIR__ . '/.admin_pass';
        if (file_exists($adminPassFile)) {
            $secret = trim(@file_get_contents($adminPassFile) ?: '');
            if (!empty($secret)) {
                $resData['adminKey'] = $secret;
            }
        }
    }

    echo json_encode($resData, JSON_UNESCAPED_UNICODE);
    exit;
}

$userKey = getUserStorageKey();
if (!$userKey) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Identifiant utilisateur manquant (steamId, userId ou username requis).']);
    exit;
}

if (session_status() === PHP_SESSION_NONE) {
    @ini_set('session.cookie_httponly', 1);
    @session_start();
}

$reqSteamId = trim($_REQUEST['steamId'] ?? '');
$sessionSteamId = trim($_SESSION['steam_id'] ?? '');
$sessionHootUserId = trim($_SESSION['hoot_user_id'] ?? '');

$isHootSessionOwner = (!empty($sessionHootUserId) && ($userKey === 'user_' . preg_replace('/[^a-zA-Z0-9_\-]/', '', $sessionHootUserId)));
$isSteamSessionOwner = (!empty($sessionSteamId) && ($userKey === 'steam_' . preg_replace('/[^a-zA-Z0-9_\-]/', '', $sessionSteamId) || (!empty($reqSteamId) && hash_equals($sessionSteamId, $reqSteamId))));
$isCreatorAdmin = isCreatorAdminAuthorized();

// Protection absolue du compte créateur souverain (interdiction totale d'accès aux non-administrateurs)
if ($userKey === 'steam_' . ADMIN_STEAM_ID || $userKey === 'name_hibouxe' || $userKey === 'name_edsaje') {
    if (!$isCreatorAdmin && !$isSteamSessionOwner) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'forbidden',
            'message' => 'Accès refusé : Le compte officiel du créateur nécessite impérativement une authentification Steam certifiée ou la clé d\'administration.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

$saveFile = $savesDir . '/' . $userKey . '.json';
$inputSyncKey = trim($_SERVER['HTTP_X_SYNC_KEY'] ?? $_REQUEST['syncKey'] ?? '');

// [SÉCURITÉ CWE-639 IDOR] Authentification obligatoire via clé secrète de synchronisation
// Si l'utilisateur est authentifié via Steam session ou compte Hoot ou est créateur admin, la clé secrète n'est pas bloquante
if (!$isCreatorAdmin && !$isSteamSessionOwner && !$isHootSessionOwner) {
    if (empty($inputSyncKey) || strlen($inputSyncKey) < 16) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'auth_required',
            'message' => 'Une clé secrète de synchronisation valide (syncKey >= 16 caractères) est obligatoire pour charger ou sauvegarder ce profil.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

switch ($action) {
    // -------------------------------------------------------------
    // CHARGEMENT DE LA SAUVEGARDE CLOUD DISTANTE
    // -------------------------------------------------------------
    case 'load':
        if (!file_exists($saveFile)) {
            // Pour le compte officiel du créateur, initialiser avec ses privilèges
            if (isset($_REQUEST['steamId']) && trim($_REQUEST['steamId']) === ADMIN_STEAM_ID) {
                $creatorInitial = [
                    'steamId' => ADMIN_STEAM_ID,
                    'username' => 'Hibouxe',
                    'avatarId' => 'hibouxe_creator',
                    'title' => '👑 Créateur du Site',
                    'activeFrame' => 'frame_wood',
                    'unlockedAvatars' => ['hibouxe_creator', 'knight', 'madeline', 'shovel_knight', 'celestial_knight', 'golden_sylvestre'],
                    'unlockedTitles' => ['title_grand_duc', 'title_gem_hunter', 'title_pixel_master', 'title_melody_owl', 'title_summit_explorer'],
                    'unlockedFrames' => ['frame_wood', 'frame_celestial_gold', 'frame_emerald_ivy'],
                    'feathers' => ['bonus' => 500, 'spent' => 0, 'claimedDaily' => new stdClass()],
                    'achievements' => ['first_step', 'daily_player', 'arcade_fan', 'steam_sync', 'feather_collector', 'champion'],
                    'stats' => ['gamesPlayed' => 15, 'gamesWon' => 15, 'currentStreak' => 10, 'maxStreak' => 10, 'guessDistribution' => [], 'gameHistory' => []],
                    'timeAttackStats' => [],
                    'versusStats' => ['matchesPlayed' => 12, 'matchesWon' => 12, 'currentStreak' => 12, 'bestStreak' => 12, 'eloRating' => 1600],
                    'syncedAt' => date('c'),
                    'isCreator' => true,
                ];
                if (!empty($inputSyncKey)) {
                    $creatorInitial['syncKeyHash'] = hash('sha256', $inputSyncKey);
                }
                @file_put_contents($saveFile, json_encode($creatorInitial, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
                $clientInitial = $creatorInitial;
                unset($clientInitial['syncKeyHash']);
                echo json_encode([
                    'success' => true,
                    'exists' => true,
                    'data' => $clientInitial,
                    'message' => 'Sauvegarde créateur souverain initialisée.',
                ]);
                exit;
            }

            echo json_encode([
                'success' => true,
                'exists' => false,
                'data' => null,
                'message' => 'Aucune sauvegarde distante trouvée pour ce compte.',
            ]);
            exit;
        }

        $raw = @file_get_contents($saveFile);
        $data = json_decode($raw, true);

        if (!is_array($data)) {
            echo json_encode([
                'success' => true,
                'exists' => false,
                'data' => null,
                'message' => 'Fichier de sauvegarde vide ou corrompu.',
            ]);
            exit;
        }

        // [SÉCURITÉ CWE-639 IDOR] Vérification stricte de la clé de synchronisation
        if (!empty($data['syncKeyHash'])) {
            $inputHash = !empty($inputSyncKey) ? hash('sha256', $inputSyncKey) : '';
            $isAuthorized = false;

            if (!empty($inputHash) && hash_equals($data['syncKeyHash'], $inputHash)) {
                $isAuthorized = true;
            }
            if (!$isAuthorized && ($isCreatorAdmin || $isSteamSessionOwner || $isHootSessionOwner)) {
                $isAuthorized = true;
                // Si l'utilisateur vérifié (Steam ou Hoot) ou le créateur se connecte depuis un nouveau PC avec une nouvelle clé,
                // on met à jour l'empreinte pour que ses futures requêtes d'arrière-plan restent autorisées
                if (!empty($inputSyncKey) && strlen($inputSyncKey) >= 16) {
                    $data['syncKeyHash'] = hash('sha256', $inputSyncKey);
                    @file_put_contents($saveFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
                }
            }

            if (!$isAuthorized) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'error' => 'invalid_sync_key',
                    'message' => 'Clé de synchronisation cloud requise ou invalide pour accéder à ce profil.'
                ]);
                exit;
            }
        }

        // Auto-verrouillage immédiat des sauvegardes historiques sans clé
        if (empty($data['syncKeyHash']) && !empty($inputSyncKey)) {
            $data['syncKeyHash'] = hash('sha256', $inputSyncKey);
            @file_put_contents($saveFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        }

        $clientData = $data;
        unset($clientData['syncKeyHash']);

        echo json_encode([
            'success' => true,
            'exists' => true,
            'data' => $clientData,
            'lastSyncedAt' => $clientData['syncedAt'] ?? date('c', filemtime($saveFile)),
        ]);
        break;

    // -------------------------------------------------------------
    // ENREGISTREMENT & FUSION DANS LE CLOUD DISTANT
    // -------------------------------------------------------------
    case 'save':
        $rawInput = @file_get_contents('php://input');
        $incoming = null;
        if (!empty($rawInput)) {
            $incoming = json_decode($rawInput, true);
        }
        if (!$incoming && !empty($_POST)) {
            $incoming = $_POST;
        }

        if (!is_array($incoming) || empty($incoming)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Données de sauvegarde invalides ou vides.']);
            exit;
        }

        // Lecture de l'existant si présent
        $existing = null;
        if (file_exists($saveFile)) {
            $existingRaw = @file_get_contents($saveFile);
            if ($existingRaw) {
                $existing = json_decode($existingRaw, true);
            }
        }

        // [SÉCURITÉ CWE-639 IDOR] Vérification stricte anti-écrasement / anti-usurpation
        if ($existing && !empty($existing['syncKeyHash'])) {
            $inputHash = !empty($inputSyncKey) ? hash('sha256', $inputSyncKey) : '';
            $isAuthorized = false;

            if (!empty($inputHash) && hash_equals($existing['syncKeyHash'], $inputHash)) {
                $isAuthorized = true;
            }
            if (!$isAuthorized && ($isCreatorAdmin || $isSteamSessionOwner || $isHootSessionOwner)) {
                $isAuthorized = true;
            }

            if (!$isAuthorized) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'error' => 'invalid_sync_key',
                    'message' => 'Clé de synchronisation cloud non concordante. Écriture refusée.'
                ]);
                exit;
            }
        }

        // Protection du compte officiel du créateur lors de la sauvegarde
        if ($userKey === 'steam_' . ADMIN_STEAM_ID || $userKey === 'name_hibouxe' || $userKey === 'name_edsaje') {
            if (!$isCreatorAdmin && !$isSteamSessionOwner) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Accès refusé : Le compte officiel du créateur nécessite impérativement une session authentifiée.']);
                exit;
            }
        }

        // Fusion intelligente
        $merged = mergeSaveData($existing, $incoming);

        // Conservation ou attribution de l'empreinte de la clé de synchronisation
        if (!empty($inputSyncKey) && strlen($inputSyncKey) >= 16) {
            $merged['syncKeyHash'] = hash('sha256', $inputSyncKey);
        } elseif ($existing && !empty($existing['syncKeyHash'])) {
            $merged['syncKeyHash'] = $existing['syncKeyHash'];
        }

        // Garantie de privilèges pour le créateur : Exige impérativement isCreatorAdminAuthorized()
        if (isCreatorAdminAuthorized() && ((isset($_REQUEST['steamId']) && trim($_REQUEST['steamId']) === ADMIN_STEAM_ID) || ($merged['steamId'] ?? '') === ADMIN_STEAM_ID)) {
            $merged['steamId'] = ADMIN_STEAM_ID;
            $merged['isCreator'] = true;
            if (!in_array('hibouxe_creator', $merged['unlockedAvatars'] ?? [], true)) {
                $merged['unlockedAvatars'][] = 'hibouxe_creator';
            }
        } else {
            $merged['isCreator'] = false;
        }

        $json = json_encode($merged, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $saved = @file_put_contents($saveFile, $json, LOCK_EX);

        if ($saved === false) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Échec de l\'écriture de la sauvegarde sur le serveur OVH.']);
            exit;
        }

        $clientMerged = $merged;
        unset($clientMerged['syncKeyHash']);

        echo json_encode([
            'success' => true,
            'message' => 'Sauvegarde synchronisée avec succès dans le Cloud Souverain !',
            'data' => $clientMerged,
            'lastSyncedAt' => $merged['syncedAt'],
        ]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Action inconnue ou non prise en charge.']);
        break;
}
