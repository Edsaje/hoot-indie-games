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
    $steamId = isset($_REQUEST['steamId']) ? trim($_REQUEST['steamId']) : '';
    $userId = isset($_REQUEST['userId']) ? trim($_REQUEST['userId']) : '';
    $username = isset($_REQUEST['username']) ? trim($_REQUEST['username']) : '';

    if (!empty($steamId)) {
        $clean = preg_replace('/[^a-zA-Z0-9_\-]/', '', $steamId);
        if (!empty($clean)) {
            return 'steam_' . $clean;
        }
    }

    // Si userId est un vrai compte authentifié (ex: UUID Supabase) et pas un identifiant local temporaire
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

// Protection absolue du compte créateur souverain (interdiction totale d'accès aux non-administrateurs)
if ($userKey === 'steam_' . ADMIN_STEAM_ID || $userKey === 'name_hibouxe' || $userKey === 'name_edsaje') {
    if (!isCreatorAdminAuthorized()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'forbidden', 'message' => 'Accès refusé : Le compte officiel du créateur nécessite une authentification stricte.']);
        exit;
    }
}

$saveFile = $savesDir . '/' . $userKey . '.json';
$action = isset($_REQUEST['action']) ? trim($_REQUEST['action']) : 'load';
$inputSyncKey = trim($_SERVER['HTTP_X_SYNC_KEY'] ?? $_REQUEST['syncKey'] ?? '');

// [SÉCURITÉ CWE-639 IDOR] Authentification obligatoire via clé secrète de synchronisation
if (!isCreatorAdminAuthorized()) {
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
            if (!$isAuthorized && isCreatorAdminAuthorized()) {
                $isAuthorized = true;
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
            if (!$isAuthorized && isCreatorAdminAuthorized()) {
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
            if (!isCreatorAdminAuthorized()) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Accès refusé : Le compte officiel du créateur nécessite impérativement une session authentifiée.']);
                exit;
            }
        }

        // Fusion intelligente
        $merged = mergeSaveData($existing, $incoming);

        // Conservation ou attribution de l'empreinte de la clé de synchronisation
        if ($existing && !empty($existing['syncKeyHash'])) {
            $merged['syncKeyHash'] = $existing['syncKeyHash'];
        } elseif (!empty($inputSyncKey)) {
            $merged['syncKeyHash'] = hash('sha256', $inputSyncKey);
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
