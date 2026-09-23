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
$savesDir = __DIR__ . '/user_saves';

if (!is_dir($savesDir)) {
    @mkdir($savesDir, 0755, true);
}

// Nettoyage et détermination de la clé utilisateur sécurisée
function getUserStorageKey() {
    $steamId = isset($_REQUEST['steamId']) ? trim($_REQUEST['steamId']) : '';
    $userId = isset($_REQUEST['userId']) ? trim($_REQUEST['userId']) : '';
    $username = isset($_REQUEST['username']) ? trim($_REQUEST['username']) : '';

    if (!empty($steamId)) {
        $clean = preg_replace('/[^a-zA-Z0-9_\-]/', '', $steamId);
        if (!empty($clean)) return 'steam_' . $clean;
    }

    if (!empty($userId)) {
        $clean = preg_replace('/[^a-zA-Z0-9_\-]/', '', $userId);
        if (!empty($clean)) return 'user_' . $clean;
    }

    if (!empty($username)) {
        $clean = mb_strtolower(trim($username), 'UTF-8');
        $clean = preg_replace('/[^a-z0-9]/', '', $clean);
        if (!empty($clean)) return 'name_' . $clean;
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
        $merged['username'] = $incoming['username'];
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

    // 5. Statistiques de Jeu & Streaks (Conserver les scores maximaux)
    $exStats = $existing['stats'] ?? [];
    $inStats = $incoming['stats'] ?? [];
    $merged['stats'] = [
        'gamesPlayed' => max(intval($exStats['gamesPlayed'] ?? 0), intval($inStats['gamesPlayed'] ?? 0)),
        'gamesWon' => max(intval($exStats['gamesWon'] ?? 0), intval($inStats['gamesWon'] ?? 0)),
        'currentStreak' => max(intval($exStats['currentStreak'] ?? 0), intval($inStats['currentStreak'] ?? 0)),
        'maxStreak' => max(intval($exStats['maxStreak'] ?? 0), intval($inStats['maxStreak'] ?? 0)),
        'guessDistribution' => !empty($inStats['guessDistribution']) ? $inStats['guessDistribution'] : ($exStats['guessDistribution'] ?? []),
        'gameHistory' => array_merge($exStats['gameHistory'] ?? [], $inStats['gameHistory'] ?? []),
    ];

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

    $merged['syncedAt'] = date('c');
    return $merged;
}

$userKey = getUserStorageKey();
if (!$userKey) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Identifiant utilisateur manquant (steamId, userId ou username requis).']);
    exit;
}

$saveFile = $savesDir . '/' . $userKey . '.json';
$action = isset($_REQUEST['action']) ? trim($_REQUEST['action']) : 'load';

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
                @file_put_contents($saveFile, json_encode($creatorInitial, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
                echo json_encode([
                    'success' => true,
                    'exists' => true,
                    'data' => $creatorInitial,
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

        echo json_encode([
            'success' => true,
            'exists' => true,
            'data' => $data,
            'lastSyncedAt' => $data['syncedAt'] ?? date('c', filemtime($saveFile)),
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

        // Fusion intelligente
        $merged = mergeSaveData($existing, $incoming);

        // Garantie de privilèges pour le créateur
        if ((isset($_REQUEST['steamId']) && trim($_REQUEST['steamId']) === ADMIN_STEAM_ID) || ($merged['steamId'] ?? '') === ADMIN_STEAM_ID) {
            $merged['steamId'] = ADMIN_STEAM_ID;
            $merged['isCreator'] = true;
            if (!in_array('hibouxe_creator', $merged['unlockedAvatars'] ?? [], true)) {
                $merged['unlockedAvatars'][] = 'hibouxe_creator';
            }
        }

        $json = json_encode($merged, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $saved = @file_put_contents($saveFile, $json, LOCK_EX);

        if ($saved === false) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Échec de l\'écriture de la sauvegarde sur le serveur OVH.']);
            exit;
        }

        echo json_encode([
            'success' => true,
            'message' => 'Sauvegarde synchronisée avec succès dans le Cloud Souverain !',
            'data' => $merged,
            'lastSyncedAt' => $merged['syncedAt'],
        ]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Action inconnue '$action'."]);
        break;
}
