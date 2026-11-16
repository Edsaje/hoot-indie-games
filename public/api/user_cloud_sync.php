<?php
/**
 * 🦉 Hoot Indie Games — Service de Synchronisation Cloud Souverain (Multi-Appareils)
 * 
 * Permet aux joueurs de conserver et synchroniser leur état complet de jeu
 * entre différents ordinateurs, navigateurs et mobiles :
 * - Progression Idle Game "Odyssée Sylvestre" (Sève Céleste, biomes, améliorations, Indiedex)
 * - Solde des Plumes d'Or (farm quotidien + primes - achats boutique)
 * - Succès débloqués (Achievements)
 * - Cartes à collectionner & stock de boosters
 * - Calendrier des 8 mini-jeux quotidiens
 * - Profil (Avatar, Titre, Cadre, Pseudos)
 * - Records Time Attack & séries de victoires
 * 
 * Stockage atomique souverain sous LOCK_EX dans public/api/user_saves/
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

if (session_status() === PHP_SESSION_NONE) {
    @ini_set('session.cookie_httponly', 1);
    @ini_set('session.cookie_samesite', 'Lax');
    @session_start();
}

$savesDir = __DIR__ . '/user_saves';
if (!is_dir($savesDir)) {
    @mkdir($savesDir, 0755, true);
}

$action = $_REQUEST['action'] ?? 'load';

// =============================================================
// ACTION 1 : VALIDATION DU RETOUR STEAM OPENID 2.0 (AVEC VALVE)
// =============================================================
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

    $isValidAssertion = false;
    $postData = http_build_query($validationParams);
    $ch = @curl_init('https://steamcommunity.com/openid/login');
    if ($ch) {
        @curl_setopt($ch, CURLOPT_POST, 1);
        @curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        @curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        @curl_setopt($ch, CURLOPT_TIMEOUT, 8);
        @curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        $res = @curl_exec($ch);
        @curl_close($ch);
        if ($res && preg_match('/is_valid\s*:\s*true/i', $res)) {
            $isValidAssertion = true;
        }
    } else {
        $opts = ['http' => ['method' => 'POST', 'header' => 'Content-type: application/x-www-form-urlencoded', 'content' => $postData, 'timeout' => 8]];
        $ctx = @stream_context_create($opts);
        $res = @file_get_contents('https://steamcommunity.com/openid/login', false, $ctx);
        if ($res && preg_match('/is_valid\s*:\s*true/i', $res)) {
            $isValidAssertion = true;
        }
    }

    if (!$isValidAssertion) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'invalid_assertion', 'message' => 'Validation Steam OpenID rejetée.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $claimedId = $_REQUEST['openid_claimed_id'] ?? $_REQUEST['openid.claimed_id'] ?? '';
    if (preg_match('/^https?:\/\/steamcommunity\.com\/openid\/id\/(7[0-9]{15,25})$/', $claimedId, $m)) {
        session_regenerate_id(true);
        $verifiedSteamId = $m[1];
        $_SESSION['steam_id'] = $verifiedSteamId;
        $_SESSION['verified_steam_id'] = $verifiedSteamId;
        $isCreator = ($verifiedSteamId === ADMIN_STEAM_ID);
        
        $resData = [
            'success' => true,
            'verified' => true,
            'steamId' => $verifiedSteamId,
            'isCreator' => $isCreator,
            'csrfToken' => $isCreator ? getAdminCsrfToken() : null,
            'message' => 'Authentification Steam validée.'
        ];

        if ($isCreator) {
            $_SESSION['admin_auth'] = true;
            $_SESSION['admin_steam_id'] = $verifiedSteamId;
            $_SESSION['admin_login_at'] = date('c');
        }
        echo json_encode($resData, JSON_UNESCAPED_UNICODE);
        exit;
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'missing_steam_id', 'message' => 'SteamID non trouvé.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// =============================================================
// GESTION DES IDENTIFIANTS & RECHERCHE DES FICHIERS DE SAUVEGARDE
// =============================================================

function cleanIdent($str) {
    return preg_replace('/[^a-zA-Z0-9_\-]/', '', strval($str));
}

function getSyncKeyFromRequest() {
    $key = $_SERVER['HTTP_X_SYNC_KEY'] ?? $_REQUEST['syncKey'] ?? '';
    if (empty($key) && function_exists('getallheaders')) {
        $headers = getallheaders();
        foreach ($headers as $k => $v) {
            if (strcasecmp($k, 'X-Sync-Key') === 0) {
                $key = $v;
                break;
            }
        }
    }
    return trim(strval($key));
}

// Extraction du corps JSON pour requêtes POST
$rawJsonInput = null;
$parsedBody = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = @file_get_contents('php://input');
    if (!empty($raw)) {
        $rawJsonInput = $raw;
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            $parsedBody = $decoded;
        }
    }
}

$reqSteamId = trim(strval($parsedBody['steamId'] ?? $_REQUEST['steamId'] ?? ''));
$reqUserId = trim(strval($parsedBody['userId'] ?? $_REQUEST['userId'] ?? ''));
$reqUsername = trim(strval($parsedBody['username'] ?? $_REQUEST['username'] ?? ''));
$inputSyncKey = getSyncKeyFromRequest();
if (empty($inputSyncKey) && !empty($parsedBody['syncKey'])) {
    $inputSyncKey = trim(strval($parsedBody['syncKey']));
}

$sessionUserId = $_SESSION['hoot_user_id'] ?? null;
$sessionSteamId = $_SESSION['steam_id'] ?? ($_SESSION['verified_steam_id'] ?? null);
$isAdminSession = !empty($_SESSION['admin_auth']) && strval($_SESSION['admin_steam_id'] ?? '') === ADMIN_STEAM_ID;

// Détermination des chemins candidats
$candidateFiles = [];
$primarySaveFile = null;

if (!empty($sessionUserId)) {
    $candidateFiles[] = $savesDir . '/user_' . cleanIdent($sessionUserId) . '.json';
}
if (!empty($reqUserId) && strpos($reqUserId, 'local_') !== 0) {
    $candidateFiles[] = $savesDir . '/user_' . cleanIdent($reqUserId) . '.json';
}
if (!empty($sessionSteamId)) {
    $candidateFiles[] = $savesDir . '/steam_' . cleanIdent($sessionSteamId) . '.json';
}
if (!empty($reqSteamId)) {
    $candidateFiles[] = $savesDir . '/steam_' . cleanIdent($reqSteamId) . '.json';
}
if (!empty($reqUsername) && $reqUsername !== 'Hibou Mystère') {
    $cleanName = mb_strtolower(trim($reqUsername), 'UTF-8');
    $cleanName = preg_replace('/[^a-z0-9]/', '', $cleanName);
    if (!empty($cleanName)) {
        $candidateFiles[] = $savesDir . '/name_' . $cleanName . '.json';
    }
}
if (!empty($inputSyncKey) && strpos($inputSyncKey, 'sync_') === 0) {
    $candidateFiles[] = $savesDir . '/key_' . cleanIdent(substr($inputSyncKey, 5)) . '.json';
}

$candidateFiles = array_values(array_unique(array_filter($candidateFiles)));

if (empty($candidateFiles)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Aucun identifiant utilisateur disponible pour la sauvegarde (compte, Steam ID, pseudo ou clé).'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Recherche du premier fichier existant
$existingSaveFile = null;
$existingData = null;
foreach ($candidateFiles as $file) {
    if (file_exists($file)) {
        $raw = @file_get_contents($file);
        if ($raw) {
            $dec = json_decode($raw, true);
            if (is_array($dec)) {
                $existingSaveFile = $file;
                $existingData = $dec;
                // Si les données sont encapsulées sous une clé 'payload', les dérouler à la racine
                if (isset($existingData['payload']) && is_array($existingData['payload'])) {
                    $sub = $existingData['payload'];
                    unset($existingData['payload']);
                    $existingData = array_merge($existingData, $sub);
                }
                break;
            }
        }
    }
}

// Le fichier cible pour l'écriture est le fichier existant trouvé ou le premier candidat
$primarySaveFile = $existingSaveFile ?: $candidateFiles[0];

// =============================================================
// FONCTIONS DE FUSION INTELLIGENTE (SMART MERGE)
// =============================================================

function mergeOdysseyState($ex, $in, $forceReplace = false) {
    if ($forceReplace && is_array($in)) {
        $in['version'] = 1;
        $in['lastSavedAt'] = time() * 1000;
        return $in;
    }
    if (!is_array($ex) || empty($ex)) {
        if (is_array($in)) {
            $in['version'] = 1;
            return $in;
        }
        return null;
    }
    if (!is_array($in) || empty($in)) {
        $ex['version'] = 1;
        return $ex;
    }

    $exSavedAt = floatval($ex['lastSavedAt'] ?? 0);
    $inSavedAt = floatval($in['lastSavedAt'] ?? 0);
    $isInNewer = ($inSavedAt >= $exSavedAt);

    $primary = $isInNewer ? $in : $ex;
    $secondary = $isInNewer ? $ex : $in;

    // Biomes & Routes
    $mergedBiome = max(intval($ex['highestBiomeUnlocked'] ?? 1), intval($in['highestBiomeUnlocked'] ?? 1));
    $mergedRoutes = is_array($ex['highestRouteUnlocked'] ?? null) ? $ex['highestRouteUnlocked'] : [];
    if (is_array($in['highestRouteUnlocked'] ?? null)) {
        foreach ($in['highestRouteUnlocked'] as $bId => $rNum) {
            $mergedRoutes[$bId] = max(intval($mergedRoutes[$bId] ?? 1), intval($rNum ?? 1));
        }
    }

    // Kills de monstres
    $mergedKills = is_array($ex['routeKills'] ?? null) ? $ex['routeKills'] : [];
    if (is_array($in['routeKills'] ?? null)) {
        foreach ($in['routeKills'] as $rId => $kNum) {
            $mergedKills[$rId] = max(intval($mergedKills[$rId] ?? 0), intval($kNum ?? 0));
        }
    }

    // Améliorations de l'Arbre Céleste
    $mergedUpgrades = is_array($ex['treeUpgrades'] ?? null) ? $ex['treeUpgrades'] : [];
    if (is_array($in['treeUpgrades'] ?? null)) {
        foreach ($in['treeUpgrades'] as $uId => $uLvl) {
            $mergedUpgrades[$uId] = max(intval($mergedUpgrades[$uId] ?? 0), intval($uLvl ?? 0));
        }
    }

    // Compagnons capturés (Indiedex)
    $mergedCaptured = is_array($ex['capturedGames'] ?? null) ? $ex['capturedGames'] : [];
    if (is_array($in['capturedGames'] ?? null)) {
        foreach ($in['capturedGames'] as $gId => $cData) {
            if (!is_array($cData)) continue;
            $lData = is_array($mergedCaptured[$gId] ?? null) ? $mergedCaptured[$gId] : ['count' => 0, 'isHolo' => false, 'level' => 1];
            $mergedCaptured[$gId] = [
                'count' => max(intval($lData['count'] ?? 0), intval($cData['count'] ?? 0)),
                'isHolo' => !empty($lData['isHolo']) || !empty($cData['isHolo']),
                'level' => max(intval($lData['level'] ?? 1), intval($cData['level'] ?? 1)),
                'firstCapturedAt' => $lData['firstCapturedAt'] ?? ($cData['firstCapturedAt'] ?? date('c')),
            ];
        }
    }

    // Réconciliation de la Sève Céleste (monnaie consommable)
    $primarySap = max(0, floatval($primary['starSap'] ?? 0));
    $primaryTotal = max(0, floatval($primary['totalStarSapEarned'] ?? 0));
    $secondaryTotal = max(0, floatval($secondary['totalStarSapEarned'] ?? 0));
    $extraEarned = max(0, $secondaryTotal - $primaryTotal);
    $mergedTotalSap = max($primaryTotal, $secondaryTotal);
    $mergedStarSap = max(0, min($primarySap + $extraEarned, $mergedTotalSap));

    // Stats de combat globales
    $exStats = is_array($ex['stats'] ?? null) ? $ex['stats'] : [];
    $inStats = is_array($in['stats'] ?? null) ? $in['stats'] : [];
    $mergedStats = [
        'totalClicks' => max(intval($exStats['totalClicks'] ?? 0), intval($inStats['totalClicks'] ?? 0)),
        'totalDamageDealt' => max(floatval($exStats['totalDamageDealt'] ?? 0), floatval($inStats['totalDamageDealt'] ?? 0)),
        'monstersDefeated' => max(intval($exStats['monstersDefeated'] ?? 0), intval($inStats['monstersDefeated'] ?? 0)),
        'bossesDefeated' => max(intval($exStats['bossesDefeated'] ?? 0), intval($inStats['bossesDefeated'] ?? 0)),
        'holosFound' => max(intval($exStats['holosFound'] ?? 0), intval($inStats['holosFound'] ?? 0)),
        'firefliesCaught' => max(intval($exStats['firefliesCaught'] ?? 0), intval($inStats['firefliesCaught'] ?? 0)),
        'rebirthsCount' => max(intval($exStats['rebirthsCount'] ?? 0), intval($inStats['rebirthsCount'] ?? 0)),
    ];

    $activeCompanions = is_array($primary['activeCompanions'] ?? null) && count($primary['activeCompanions']) > 0
        ? $primary['activeCompanions']
        : (is_array($secondary['activeCompanions'] ?? null) ? $secondary['activeCompanions'] : []);

    return [
        'version' => 1,
        'currentBiomeId' => $primary['currentBiomeId'] ?? ($secondary['currentBiomeId'] ?? 'biome_1_clearing'),
        'currentRouteNumber' => max(1, min(5, intval($primary['currentRouteNumber'] ?? ($secondary['currentRouteNumber'] ?? 1)))),
        'autoAdvance' => isset($primary['autoAdvance']) ? (bool)$primary['autoAdvance'] : (bool)($secondary['autoAdvance'] ?? false),
        'miniHudEnabled' => isset($primary['miniHudEnabled']) ? (bool)$primary['miniHudEnabled'] : (bool)($secondary['miniHudEnabled'] ?? false),
        'miniHudMobileEnabled' => isset($primary['miniHudMobileEnabled']) ? (bool)$primary['miniHudMobileEnabled'] : (bool)($secondary['miniHudMobileEnabled'] ?? false),
        'highestBiomeUnlocked' => $mergedBiome,
        'highestRouteUnlocked' => $mergedRoutes,
        'routeKills' => $mergedKills,
        'treeUpgrades' => $mergedUpgrades,
        'capturedGames' => $mergedCaptured,
        'activeCompanions' => $activeCompanions,
        'starSap' => $mergedStarSap,
        'totalStarSapEarned' => $mergedTotalSap,
        'celestialShards' => max(intval($ex['celestialShards'] ?? 0), intval($in['celestialShards'] ?? 0)),
        'stats' => $mergedStats,
        'lastSavedAt' => max($exSavedAt, $inSavedAt, time() * 1000),
    ];
}

function mergeSaveData($existing, $incoming, $options = []) {
    if (!is_array($existing) || empty($existing)) {
        if (is_array($incoming)) {
            $incoming['syncedAt'] = date('c');
            if (isset($incoming['odysseyState']) && is_array($incoming['odysseyState'])) {
                $incoming['odysseyState']['version'] = 1;
            }
            return $incoming;
        }
        return [];
    }
    if (!is_array($incoming) || empty($incoming)) {
        return $existing;
    }

    $isReplace = ($options['strategy'] ?? '') === 'replace';
    $isOdysseyReplace = ($options['odysseyStrategy'] ?? '') === 'replace' || ($incoming['odysseyStrategy'] ?? '') === 'replace';

    if ($isReplace) {
        $incoming['syncedAt'] = date('c');
        if (isset($incoming['odysseyState']) && is_array($incoming['odysseyState'])) {
            $incoming['odysseyState']['version'] = 1;
        }
        return $incoming;
    }

    $merged = $existing;

    // 1. Identifiants & Profil
    if (!empty($incoming['steamId'])) $merged['steamId'] = $incoming['steamId'];
    if (!empty($incoming['userId'])) $merged['userId'] = $incoming['userId'];
    if (!empty($incoming['username']) && $incoming['username'] !== 'Hibou Mystère') {
        $merged['username'] = $incoming['username'];
    }
    if (!empty($incoming['avatarId'])) $merged['avatarId'] = $incoming['avatarId'];
    if (!empty($incoming['title'])) $merged['title'] = $incoming['title'];
    if (!empty($incoming['activeFrame'])) $merged['activeFrame'] = $incoming['activeFrame'];

    // 2. Déblocages Boutique
    $allAvatars = array_unique(array_merge($existing['unlockedAvatars'] ?? [], $incoming['unlockedAvatars'] ?? []));
    $allTitles = array_unique(array_merge($existing['unlockedTitles'] ?? [], $incoming['unlockedTitles'] ?? []));
    $allFrames = array_unique(array_merge($existing['unlockedFrames'] ?? [], $incoming['unlockedFrames'] ?? []));
    $merged['unlockedAvatars'] = array_values($allAvatars);
    $merged['unlockedTitles'] = array_values($allTitles);
    $merged['unlockedFrames'] = array_values($allFrames);

    // 3. Plumes d'Or
    $exFeathers = is_array($existing['feathers'] ?? null) ? $existing['feathers'] : [];
    $inFeathers = is_array($incoming['feathers'] ?? null) ? $incoming['feathers'] : [];
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

    // 4. Succès
    $exAch = is_array($existing['achievements'] ?? null) ? $existing['achievements'] : [];
    $inAch = is_array($incoming['achievements'] ?? null) ? $incoming['achievements'] : [];
    $merged['achievements'] = array_values(array_unique(array_merge($exAch, $inAch)));

    // 5. Statistiques mini-jeux
    $exStats = is_array($existing['stats'] ?? null) ? $existing['stats'] : [];
    $inStats = is_array($incoming['stats'] ?? null) ? $incoming['stats'] : [];
    $mergedStats = $exStats;
    $modes = ['screenle', 'indledle', 'linkle', 'profille', 'chrono', 'pixel', 'review', 'blindtest'];
    foreach ($modes as $m) {
        if (isset($inStats[$m]) && is_array($inStats[$m])) {
            $eM = is_array($mergedStats[$m] ?? null) ? $mergedStats[$m] : [];
            $iM = $inStats[$m];
            $mergedStats[$m] = array_merge($eM, $iM, [
                'played' => max(intval($eM['played'] ?? 0), intval($iM['played'] ?? 0)),
                'won' => max(intval($eM['won'] ?? 0), intval($iM['won'] ?? 0)),
                'currentStreak' => max(intval($eM['currentStreak'] ?? 0), intval($iM['currentStreak'] ?? 0)),
                'maxStreak' => max(intval($eM['maxStreak'] ?? 0), intval($iM['maxStreak'] ?? 0)),
            ]);
        }
    }
    if (isset($inStats['gamesPlayed']) || isset($exStats['gamesPlayed'])) {
        $mergedStats['gamesPlayed'] = max(intval($exStats['gamesPlayed'] ?? 0), intval($inStats['gamesPlayed'] ?? 0));
        $mergedStats['gamesWon'] = max(intval($exStats['gamesWon'] ?? 0), intval($inStats['gamesWon'] ?? 0));
        $mergedStats['currentStreak'] = max(intval($exStats['currentStreak'] ?? 0), intval($inStats['currentStreak'] ?? 0));
        $mergedStats['maxStreak'] = max(intval($exStats['maxStreak'] ?? 0), intval($inStats['maxStreak'] ?? 0));
    }
    $merged['stats'] = $mergedStats;

    // 5b. Historique quotidien des puzzles (dailyGameStates)
    $exDaily = is_array($existing['dailyGameStates'] ?? null) ? $existing['dailyGameStates'] : [];
    $inDaily = is_array($incoming['dailyGameStates'] ?? null) ? $incoming['dailyGameStates'] : [];
    $mergedDaily = $exDaily;
    foreach ($inDaily as $stateKey => $inState) {
        if (!is_array($inState)) continue;
        if (!isset($mergedDaily[$stateKey])) {
            $mergedDaily[$stateKey] = $inState;
        } else {
            $lState = $mergedDaily[$stateKey];
            $isWon = !empty($lState['isWon']) || !empty($inState['isWon']);
            $isCompleted = !empty($lState['isCompleted']) || !empty($inState['isCompleted']);
            $lGuesses = is_array($lState['guesses'] ?? null) ? $lState['guesses'] : [];
            $iGuesses = is_array($inState['guesses'] ?? null) ? $inState['guesses'] : [];
            $guesses = count($iGuesses) >= count($lGuesses) ? $iGuesses : $lGuesses;
            $mergedDaily[$stateKey] = array_merge($lState, $inState, [
                'isWon' => $isWon,
                'isCompleted' => $isCompleted,
                'guesses' => $guesses,
            ]);
        }
    }
    $merged['dailyGameStates'] = $mergedDaily;

    // 6. Time Attack
    $exTa = is_array($existing['timeAttackStats'] ?? null) ? $existing['timeAttackStats'] : [];
    $inTa = is_array($incoming['timeAttackStats'] ?? null) ? $incoming['timeAttackStats'] : [];
    $mergedTa = $exTa;
    foreach ($inTa as $mode => $s) {
        if (!is_array($s)) continue;
        $cur = $mergedTa[$mode] ?? [];
        $mergedTa[$mode] = [
            'highScore' => max(intval($cur['highScore'] ?? 0), intval($s['highScore'] ?? 0)),
            'bestCombo' => max(intval($cur['bestCombo'] ?? 0), intval($s['bestCombo'] ?? 0)),
            'gamesPlayed' => max(intval($cur['gamesPlayed'] ?? 0), intval($s['gamesPlayed'] ?? 0)),
            'totalAnswered' => max(intval($cur['totalAnswered'] ?? 0), intval($s['totalAnswered'] ?? 0)),
            'lastPlayed' => $s['lastPlayed'] ?? ($cur['lastPlayed'] ?? date('c')),
        ];
    }
    $merged['timeAttackStats'] = $mergedTa;

    // 7. Versus
    $exVersus = is_array($existing['versusStats'] ?? null) ? $existing['versusStats'] : [];
    $inVersus = is_array($incoming['versusStats'] ?? null) ? $incoming['versusStats'] : [];
    $merged['versusStats'] = [
        'matchesPlayed' => max(intval($exVersus['matchesPlayed'] ?? 0), intval($inVersus['matchesPlayed'] ?? 0)),
        'matchesWon' => max(intval($exVersus['matchesWon'] ?? 0), intval($inVersus['matchesWon'] ?? 0)),
        'currentStreak' => max(intval($exVersus['currentStreak'] ?? 0), intval($inVersus['currentStreak'] ?? 0)),
        'bestStreak' => max(intval($exVersus['bestStreak'] ?? 0), intval($inVersus['bestStreak'] ?? 0)),
        'eloRating' => max(intval($exVersus['eloRating'] ?? 1000), intval($inVersus['eloRating'] ?? 1000)),
    ];

    // 8. Collection de Cartes
    $exCards = is_array($existing['cardCollection'] ?? null) ? $existing['cardCollection'] : [];
    $inCards = is_array($incoming['cardCollection'] ?? null) ? $incoming['cardCollection'] : [];
    $mergedCards = $exCards;
    foreach ($inCards as $cId => $cEntry) {
        if (!is_array($cEntry)) continue;
        $lEntry = $mergedCards[$cId] ?? ['count' => 0, 'countHolo' => 0];
        $mergedCards[$cId] = [
            'count' => max(intval($lEntry['count'] ?? 0), intval($cEntry['count'] ?? 0)),
            'countHolo' => max(intval($lEntry['countHolo'] ?? 0), intval($cEntry['countHolo'] ?? 0)),
            'firstObtainedAt' => $lEntry['firstObtainedAt'] ?? ($cEntry['firstObtainedAt'] ?? date('c')),
        ];
    }
    $merged['cardCollection'] = $mergedCards;

    // 9. Boosters
    if (!empty($incoming['lastDailyBoosterClaim'])) {
        $exClaim = $existing['lastDailyBoosterClaim'] ?? '';
        $merged['lastDailyBoosterClaim'] = ($incoming['lastDailyBoosterClaim'] > $exClaim)
            ? $incoming['lastDailyBoosterClaim']
            : $exClaim;
    }
    if (is_array($incoming['freeBoostersStock'] ?? null)) {
        $exStock = is_array($existing['freeBoostersStock'] ?? null) ? $existing['freeBoostersStock'] : [];
        $merged['freeBoostersStock'] = [
            'count' => min(2, max(intval($exStock['count'] ?? 0), intval($incoming['freeBoostersStock']['count'] ?? 0))),
            'lastRechargeTimestamp' => min(
                intval($exStock['lastRechargeTimestamp'] ?? (time() * 1000)),
                intval($incoming['freeBoostersStock']['lastRechargeTimestamp'] ?? (time() * 1000))
            ),
        ];
    }

    // 10. Odyssée Sylvestre (Idle Game)
    $merged['odysseyState'] = mergeOdysseyState(
        $existing['odysseyState'] ?? null,
        $incoming['odysseyState'] ?? null,
        $isOdysseyReplace
    );

    // 11. Récompenses administrateur en attente
    if (isset($existing['pendingAdminRewards'])) {
        $merged['pendingAdminRewards'] = $existing['pendingAdminRewards'];
    }

    $merged['syncedAt'] = date('c');
    return $merged;
}

// =============================================================
// ACTIONS REST : LOAD & SAVE
// =============================================================

switch ($action) {
    case 'load':
        if (!$existingData) {
            echo json_encode([
                'success' => true,
                'exists' => false,
                'message' => 'Aucune sauvegarde distante trouvée pour ce compte.'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Sécurité Anti-IDOR : Protection en lecture si une clé de synchronisation est définie
        if (!empty($existingData['syncKeyHash'])) {
            $inputHash = !empty($inputSyncKey) ? hash('sha256', $inputSyncKey) : '';
            $isAuthorized = false;

            if (!empty($inputHash) && hash_equals($existingData['syncKeyHash'], $inputHash)) {
                $isAuthorized = true;
            }
            if (!$isAuthorized && $isAdminSession) {
                $isAuthorized = true;
            }
            if (!$isAuthorized && !empty($sessionSteamId) && !empty($existingData['steamId']) && strval($existingData['steamId']) === strval($sessionSteamId)) {
                $isAuthorized = true;
            }
            if (!$isAuthorized && !empty($sessionUserId) && !empty($existingData['userId']) && strval($existingData['userId']) === strval($sessionUserId)) {
                $isAuthorized = true;
            }

            if (!$isAuthorized) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'error' => 'invalid_sync_key',
                    'message' => 'Clé de synchronisation cloud non concordante. Lecture refusée.'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
        }

        $clientData = $existingData;
        unset($clientData['syncKeyHash']);

        echo json_encode([
            'success' => true,
            'exists' => true,
            'data' => $clientData,
            'lastSyncedAt' => $clientData['syncedAt'] ?? date('c', filemtime($existingSaveFile)),
        ], JSON_UNESCAPED_UNICODE);
        exit;

    case 'save':
        $incoming = $parsedBody;
        if (empty($incoming) && !empty($_POST)) {
            $incoming = $_POST;
        }

        if (!is_array($incoming) || empty($incoming)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Données de sauvegarde invalides ou vides.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Support transparent si le payload est imbriqué sous une clé 'payload'
        if (isset($incoming['payload']) && is_array($incoming['payload'])) {
            $subPayload = $incoming['payload'];
            unset($incoming['payload']);
            $incoming = array_merge($incoming, $subPayload);
        }

        // Sécurité Anti-IDOR : Vérification stricte anti-écrasement
        if ($existingData && !empty($existingData['syncKeyHash'])) {
            $inputHash = !empty($inputSyncKey) ? hash('sha256', $inputSyncKey) : '';
            $isAuthorized = false;

            if (!empty($inputHash) && hash_equals($existingData['syncKeyHash'], $inputHash)) {
                $isAuthorized = true;
            }
            if (!$isAuthorized && $isAdminSession) {
                $isAuthorized = true;
            }
            if (!$isAuthorized && !empty($sessionSteamId) && !empty($existingData['steamId']) && strval($existingData['steamId']) === strval($sessionSteamId)) {
                $isAuthorized = true;
            }
            if (!$isAuthorized && !empty($sessionUserId) && !empty($existingData['userId']) && strval($existingData['userId']) === strval($sessionUserId)) {
                $isAuthorized = true;
            }

            if (!$isAuthorized) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'error' => 'invalid_sync_key',
                    'message' => 'Clé de synchronisation cloud non concordante. Écriture refusée.'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
        }

        // Protection du compte officiel du créateur
        $isTargetingCreator = (
            (!empty($reqSteamId) && $reqSteamId === ADMIN_STEAM_ID) ||
            (!empty($reqUsername) && strtolower(trim($reqUsername)) === 'hibouxe') ||
            (($existingData['steamId'] ?? '') === ADMIN_STEAM_ID)
        );
        if ($isTargetingCreator && !$isAdminSession && $sessionSteamId !== ADMIN_STEAM_ID) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Accès refusé : Le compte officiel du créateur nécessite impérativement une session authentifiée.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $mergeOptions = [
            'strategy' => $_REQUEST['strategy'] ?? ($incoming['syncStrategy'] ?? 'merge'),
            'odysseyStrategy' => $_REQUEST['odysseyStrategy'] ?? ($incoming['odysseyStrategy'] ?? 'merge'),
        ];

        $merged = mergeSaveData($existingData, $incoming, $mergeOptions);

        // Clé de synchronisation anti-IDOR
        if (!empty($inputSyncKey) && strlen($inputSyncKey) >= 16) {
            $merged['syncKeyHash'] = hash('sha256', $inputSyncKey);
        } elseif ($existingData && !empty($existingData['syncKeyHash'])) {
            $merged['syncKeyHash'] = $existingData['syncKeyHash'];
        }

        // Privilège Créateur vérifié
        if ($isAdminSession || (isCreatorAdminAuthorized() && (($merged['steamId'] ?? '') === ADMIN_STEAM_ID))) {
            $merged['steamId'] = ADMIN_STEAM_ID;
            $merged['isCreator'] = true;
            if (!in_array('hibouxe_creator', $merged['unlockedAvatars'] ?? [], true)) {
                $merged['unlockedAvatars'][] = 'hibouxe_creator';
            }
        }

        $encodedJson = json_encode($merged, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $saved = @file_put_contents($primarySaveFile, $encodedJson, LOCK_EX);

        if ($saved === false) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => "Échec de l'écriture de la sauvegarde sur le serveur OVH."], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Si le profil a à la fois un userId et un steamId, mettre à jour le fichier miroir pour cohérence
        if (!empty($merged['userId']) && !empty($merged['steamId'])) {
            $userFile = $savesDir . '/user_' . cleanIdent($merged['userId']) . '.json';
            $steamFile = $savesDir . '/steam_' . cleanIdent($merged['steamId']) . '.json';
            if ($primarySaveFile === $userFile) {
                @file_put_contents($steamFile, $encodedJson, LOCK_EX);
            } elseif ($primarySaveFile === $steamFile) {
                @file_put_contents($userFile, $encodedJson, LOCK_EX);
            }
        }

        $clientData = $merged;
        unset($clientData['syncKeyHash']);

        echo json_encode([
            'success' => true,
            'message' => 'Sauvegarde synchronisée avec succès dans le Cloud Souverain (OVH) !',
            'data' => $clientData,
            'lastSyncedAt' => $merged['syncedAt'],
        ], JSON_UNESCAPED_UNICODE);
        exit;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'invalid_action', 'message' => 'Action inconnue.'], JSON_UNESCAPED_UNICODE);
        exit;
}
