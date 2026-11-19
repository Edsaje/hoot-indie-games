<?php
/**
 * 🦉 Hoot Indie Games — Service de Synchronisation Cloud Souverain (Multi-Appareils)
 * Contrôleur REST épuré et modulaire
 */

ini_set('display_errors', 0);
error_reporting(0);

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
require_once __DIR__ . '/admin_auth.php';
require_once __DIR__ . '/steam_verifier.php';
require_once __DIR__ . '/odyssey_merger.php';
require_once __DIR__ . '/user_save_store.php';

sendCorsHeaders();
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

startSecureHootSession();

$action = $_REQUEST['action'] ?? 'load';

// =============================================================
// ACTION 1 : VÉRIFICATION STEAM OPENID 2.0 (AVEC VALVE)
// =============================================================
if ($action === 'verify_steam') {
    $verificationResult = verifySteamOpenIdAssertion($_REQUEST);
    if (empty($verificationResult['success'])) {
        http_response_code(400);
    }
    echo json_encode($verificationResult, JSON_UNESCAPED_UNICODE);
    exit;
}

// =============================================================
// EXTRACTION DES IDENTIFIANTS & DONNÉES ENTRANTES
// =============================================================
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
    if (empty($parsedBody) && !empty($_POST)) {
        $parsedBody = $_POST;
    }
}

$inputSyncKey = extractSyncKeyFromRequest();
if (empty($inputSyncKey) && !empty($parsedBody['syncKey'])) {
    $inputSyncKey = trim(strval($parsedBody['syncKey']));
}

$identifiers = [
    'steamId' => trim(strval($parsedBody['steamId'] ?? ($_REQUEST['steamId'] ?? ''))),
    'userId' => trim(strval($parsedBody['userId'] ?? ($_REQUEST['userId'] ?? ''))),
    'username' => trim(strval($parsedBody['username'] ?? ($_REQUEST['username'] ?? ''))),
    'syncKey' => $inputSyncKey,
];

$sessionUserId = $_SESSION['hoot_user_id'] ?? null;
$sessionSteamId = $_SESSION['verified_steam_id'] ?? ($_SESSION['steam_id'] ?? null);
$explicitAdminKey = $_SERVER['HTTP_X_ADMIN_KEY'] ?? ($_REQUEST['adminKey'] ?? null);
$isAdminSession = isCreatorAdminAuthorized($explicitAdminKey);

$resolved = resolveUserSaveCandidates($identifiers);
$candidateFiles = $resolved['candidateFiles'];
$existingSaveFile = $resolved['existingFile'];
$existingData = $resolved['existingData'];
$primarySaveFile = $resolved['primaryFile'];

if (empty($candidateFiles)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Aucun identifiant utilisateur disponible pour la sauvegarde (compte, Steam ID, pseudo ou clé).'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Protection du compte officiel du créateur (ADMIN_STEAM_ID / Hibouxe)
$isTargetingCreator = (
    (!empty($identifiers['steamId']) && $identifiers['steamId'] === ADMIN_STEAM_ID) ||
    (!empty($identifiers['username']) && strtolower(trim($identifiers['username'])) === 'hibouxe') ||
    (!empty($existingData['steamId']) && $existingData['steamId'] === ADMIN_STEAM_ID) ||
    (!empty($existingData['username']) && strtolower(trim($existingData['username'])) === 'hibouxe')
);

$isCreatorAuthorized = (
    $isAdminSession ||
    (!empty($sessionSteamId) && strval($sessionSteamId) === ADMIN_STEAM_ID) ||
    (!empty($sessionUserId) && strval($sessionUserId) === 'admin_hibouxe') ||
    (!empty($existingData['syncKeyHash']) && !empty($inputSyncKey) && hash_equals($existingData['syncKeyHash'], hash('sha256', $inputSyncKey)))
);

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

        // Protection créateur
        if ($isTargetingCreator && !$isCreatorAuthorized) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'error' => 'forbidden_creator_access',
                'message' => 'Accès refusé : Le compte officiel du créateur nécessite une session authentifiée.'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Sécurité Anti-IDOR pour tous les joueurs
        if (!isAuthorizedForUserSave($existingData, $inputSyncKey, $sessionUserId, $sessionSteamId, $isAdminSession)) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'error' => 'unauthorized_save_access',
                'message' => 'Autorisation refusée pour la lecture de cette sauvegarde cloud.'
            ], JSON_UNESCAPED_UNICODE);
            exit;
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
        if (!is_array($incoming) || empty($incoming)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Données de sauvegarde invalides ou vides.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if (isset($incoming['payload']) && is_array($incoming['payload'])) {
            $sub = $incoming['payload'];
            unset($incoming['payload']);
            $incoming = array_merge($incoming, $sub);
        }

        // Protection créateur
        if ($isTargetingCreator && !$isCreatorAuthorized) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'error' => 'forbidden_creator_access',
                'message' => 'Accès refusé : Le compte officiel du créateur nécessite une session authentifiée.'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Sécurité Anti-IDOR mise à jour
        if ($existingData) {
            if (!isAuthorizedForUserSave($existingData, $inputSyncKey, $sessionUserId, $sessionSteamId, $isAdminSession)) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'error' => 'unauthorized_save_overwrite',
                    'message' => 'Autorisation refusée pour la mise à jour de cette sauvegarde cloud.'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
        } else {
            // Création initiale d'une sauvegarde
            if (!empty($identifiers['userId']) && strpos($identifiers['userId'], 'local_') !== 0 && !$isAdminSession && $sessionUserId !== $identifiers['userId']) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'error' => 'unauthorized_user_registration',
                    'message' => 'Création refusée : session non concordante avec l\'identifiant utilisateur.'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
            if (!empty($identifiers['steamId']) && !$isAdminSession && $sessionSteamId !== $identifiers['steamId']) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'error' => 'unauthorized_steam_registration',
                    'message' => 'Création refusée : session Steam non concordante.'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
        }

        $mergeOptions = [
            'strategy' => $_REQUEST['strategy'] ?? ($incoming['syncStrategy'] ?? 'merge'),
            'odysseyStrategy' => $_REQUEST['odysseyStrategy'] ?? ($incoming['odysseyStrategy'] ?? 'merge'),
        ];

        $merged = mergeComprehensiveSaveData($existingData ?: [], $incoming, $mergeOptions);

        // Clé de synchronisation anti-IDOR
        if (!empty($inputSyncKey) && strlen($inputSyncKey) >= 16) {
            $merged['syncKeyHash'] = hash('sha256', $inputSyncKey);
        } elseif ($existingData && !empty($existingData['syncKeyHash'])) {
            $merged['syncKeyHash'] = $existingData['syncKeyHash'];
        }

        // Statut Créateur certifié
        if ($isAdminSession || (isCreatorAdminAuthorized() && (($merged['steamId'] ?? '') === ADMIN_STEAM_ID))) {
            $merged['steamId'] = ADMIN_STEAM_ID;
            $merged['isCreator'] = true;
            if (!in_array('hibouxe_creator', $merged['unlockedAvatars'] ?? [], true)) {
                $merged['unlockedAvatars'][] = 'hibouxe_creator';
            }
        }

        $persisted = persistUserSaveFile($primarySaveFile, $merged, $sessionUserId);
        if (!$persisted) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => "Échec de l'écriture atomique sur le serveur OVH."], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Synchroniser avec l'annuaire d'amis
        if (function_exists('ensureUserInFriendsDatabase') && !empty($merged['username']) && $merged['username'] !== 'Hibou Mystère') {
            ensureUserInFriendsDatabase([
                'id' => $merged['userId'] ?? $sessionUserId,
                'steamId' => $merged['steamId'] ?? $sessionSteamId,
                'username' => $merged['username'],
                'avatarId' => $merged['avatarId'] ?? 'owl',
                'title' => $merged['title'] ?? 'Oisillon du Perchoir',
            ]);
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
