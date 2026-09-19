<?php
/**
 * API Relais Multijoueur Souverain (Versus 1v1) — Hoot Indie Games
 * Remplace WebRTC P2P par un relais serveur sécurisé sur OVHcloud :
 * - Zéro popup de permission réseau local dans les navigateurs (Chrome / Edge / Safari / Firefox)
 * - 100% compatible VPN, proxys, mobiles 4G/5G et réseaux d'entreprise
 * - Synchronisation en temps réel (< 50ms) pour les duels 1v1
 * - Nettoyage automatique des salons inactifs (Garbage Collection)
 */

ini_set('display_errors', 0);
error_reporting(0);

// Headers de sécurité et CORS
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

$roomsFile = __DIR__ . '/versus_rooms.json';

// Verrouillage et lecture de la base des salons
function loadRoomsData($file) {
    if (!file_exists($file)) {
        return [];
    }
    $fp = @fopen($file, 'r');
    if (!$fp) return [];
    if (@flock($fp, LOCK_SH)) {
        $content = @stream_get_contents($fp);
        @flock($fp, LOCK_UN);
        @fclose($fp);
        return json_decode($content, true) ?: [];
    }
    @fclose($fp);
    return [];
}

// Verrouillage et écriture atomique de la base des salons
function saveRoomsData($file, array $data) {
    // Nettoyage automatique des salons inactifs (> 1 heure ou sans activité depuis 15 minutes)
    $now = time();
    foreach ($data as $code => $room) {
        $lastActivity = $room['updatedAt'] ?? ($room['createdAt'] ?? 0);
        if ($now - $lastActivity > 900 || $now - ($room['createdAt'] ?? 0) > 3600) {
            unset($data[$code]);
        }
    }

    $fp = @fopen($file, 'c+');
    if (!$fp) return false;
    if (@flock($fp, LOCK_EX)) {
        @ftruncate($fp, 0);
        @rewind($fp);
        @fwrite($fp, json_encode($data, JSON_UNESCAPED_UNICODE));
        @fflush($fp);
        @flock($fp, LOCK_UN);
        @fclose($fp);
        return true;
    }
    @fclose($fp);
    return false;
}

// Récupération des données POST/GET
$rawInput = @file_get_contents('php://input');
$jsonData = json_decode($rawInput, true) ?: [];

$action = trim($_POST['action'] ?? $jsonData['action'] ?? $_GET['action'] ?? '');
$roomCode = strtoupper(trim($_POST['roomCode'] ?? $jsonData['roomCode'] ?? $_GET['roomCode'] ?? ''));
$playerId = trim($_POST['playerId'] ?? $jsonData['playerId'] ?? $_GET['playerId'] ?? '');

if (empty($action)) {
    echo json_encode(['success' => false, 'message' => 'Action requise.']);
    exit;
}

$rooms = loadRoomsData($roomsFile);

// -------------------------------------------------------------
// 1. ACTION : CRÉER UN SALON DE DUEL (HÔTE)
// -------------------------------------------------------------
if ($action === 'create_room') {
    if (empty($roomCode)) {
        echo json_encode(['success' => false, 'message' => 'Code de salon manquant.']);
        exit;
    }

    $rawProfile = $_POST['playerProfile'] ?? $jsonData['playerProfile'] ?? [];
    if (is_string($rawProfile)) {
        $rawProfile = json_decode($rawProfile, true) ?: [];
    }

    $hostName = htmlspecialchars(trim($rawProfile['name'] ?? 'Hôte'), ENT_QUOTES, 'UTF-8');
    $hostAvatar = trim($rawProfile['avatarId'] ?? 'owl');
    $hostElo = intval($rawProfile['elo'] ?? 1000);

    $hostId = 'host_' . substr(md5(uniqid(mt_rand(), true)), 0, 10);
    $now = time();

    $rooms[$roomCode] = [
        'code' => $roomCode,
        'createdAt' => $now,
        'updatedAt' => $now,
        'status' => 'waiting',
        'host' => [
            'id' => $hostId,
            'name' => $hostName,
            'avatarId' => $hostAvatar,
            'elo' => $hostElo,
            'lastSeen' => $now,
        ],
        'guest' => null,
        'messages' => [],
    ];

    saveRoomsData($roomsFile, $rooms);

    echo json_encode([
        'success' => true,
        'roomCode' => $roomCode,
        'playerId' => $hostId,
        'message' => 'Salon créé avec succès sur le relais souverain.',
    ]);
    exit;
}

// -------------------------------------------------------------
// 2. ACTION : REJOINDRE UN SALON (INVITÉ)
// -------------------------------------------------------------
if ($action === 'join_room') {
    if (empty($roomCode) || !isset($rooms[$roomCode])) {
        echo json_encode(['success' => false, 'message' => 'Salon introuvable. Vérifiez que votre ami a bien créé la partie et que le code est exact.']);
        exit;
    }

    $room = &$rooms[$roomCode];
    $now = time();

    // Vérifier si le salon n'est pas déjà plein avec un autre invité actif
    if (!empty($room['guest']) && !empty($room['guest']['id'])) {
        $guestLastSeen = $room['guest']['lastSeen'] ?? 0;
        if (($now - $guestLastSeen) < 15 && $room['guest']['id'] !== $playerId) {
            echo json_encode(['success' => false, 'message' => 'Ce salon est déjà complet (2/2 joueurs).']);
            exit;
        }
    }

    $rawProfile = $_POST['playerProfile'] ?? $jsonData['playerProfile'] ?? [];
    if (is_string($rawProfile)) {
        $rawProfile = json_decode($rawProfile, true) ?: [];
    }

    $guestName = htmlspecialchars(trim($rawProfile['name'] ?? 'Adversaire'), ENT_QUOTES, 'UTF-8');
    $guestAvatar = trim($rawProfile['avatarId'] ?? 'owl');
    $guestElo = intval($rawProfile['elo'] ?? 1000);

    $guestId = !empty($playerId) ? $playerId : ('guest_' . substr(md5(uniqid(mt_rand(), true)), 0, 10));

    $room['guest'] = [
        'id' => $guestId,
        'name' => $guestName,
        'avatarId' => $guestAvatar,
        'elo' => $guestElo,
        'lastSeen' => $now,
    ];
    $room['status'] = 'ready';
    $room['updatedAt'] = $now;

    // Ajouter le message de poignée de main initiale (handshake)
    $msgId = count($room['messages']) + 1;
    $room['messages'][] = [
        'id' => $msgId,
        'senderId' => $guestId,
        'payload' => [
            'type' => 'handshake',
            'profile' => [
                'name' => $guestName,
                'avatarId' => $guestAvatar,
                'elo' => $guestElo,
            ],
        ],
        'time' => microtime(true),
    ];

    saveRoomsData($roomsFile, $rooms);

    echo json_encode([
        'success' => true,
        'roomCode' => $roomCode,
        'playerId' => $guestId,
        'opponent' => $room['host'],
        'message' => 'Connexion au salon établie avec succès !',
    ]);
    exit;
}

// -------------------------------------------------------------
// 3. ACTION : ENVOYER UN MESSAGE DE JEU (HOST OU GUEST)
// -------------------------------------------------------------
if ($action === 'send_message') {
    if (empty($roomCode) || !isset($rooms[$roomCode])) {
        echo json_encode(['success' => false, 'message' => 'Salon introuvable.']);
        exit;
    }

    $room = &$rooms[$roomCode];
    $isHost = (!empty($room['host']) && $room['host']['id'] === $playerId);
    $isGuest = (!empty($room['guest']) && $room['guest']['id'] === $playerId);

    if (!$isHost && !$isGuest) {
        echo json_encode(['success' => false, 'message' => 'Joueur non autorisé dans ce salon.']);
        exit;
    }

    $rawMsg = $_POST['message'] ?? $jsonData['message'] ?? [];
    if (is_string($rawMsg)) {
        $rawMsg = json_decode($rawMsg, true) ?: [];
    }

    if (empty($rawMsg) || !is_array($rawMsg)) {
        echo json_encode(['success' => false, 'message' => 'Message vide ou invalide.']);
        exit;
    }

    $now = time();
    $room['updatedAt'] = $now;
    if ($isHost) {
        $room['host']['lastSeen'] = $now;
    } else {
        $room['guest']['lastSeen'] = $now;
    }

    $msgId = count($room['messages']) + 1;
    $room['messages'][] = [
        'id' => $msgId,
        'senderId' => $playerId,
        'payload' => $rawMsg,
        'time' => microtime(true),
    ];

    // Limiter la taille du journal de messages par salon à 120 messages
    if (count($room['messages']) > 120) {
        $room['messages'] = array_slice($room['messages'], -80);
    }

    saveRoomsData($roomsFile, $rooms);

    echo json_encode([
        'success' => true,
        'messageId' => $msgId,
    ]);
    exit;
}

// -------------------------------------------------------------
// 4. ACTION : POLLING RÉACTIF DES ÉVÉNEMENTS DU DUEL
// -------------------------------------------------------------
if ($action === 'poll_events') {
    if (empty($roomCode) || !isset($rooms[$roomCode])) {
        echo json_encode([
            'success' => false,
            'message' => 'Salon fermé ou introuvable.',
            'roomClosed' => true,
        ]);
        exit;
    }

    $room = &$rooms[$roomCode];
    $now = time();
    $isHost = (!empty($room['host']) && $room['host']['id'] === $playerId);
    $isGuest = (!empty($room['guest']) && $room['guest']['id'] === $playerId);

    if ($isHost) {
        $room['host']['lastSeen'] = $now;
    } elseif ($isGuest) {
        $room['guest']['lastSeen'] = $now;
    }
    $room['updatedAt'] = $now;

    $lastId = intval($_POST['lastMessageId'] ?? $jsonData['lastMessageId'] ?? $_GET['lastMessageId'] ?? 0);

    // Récupérer tous les messages envoyés par l'adversaire depuis lastId
    $newEvents = [];
    $maxId = $lastId;

    foreach ($room['messages'] as $m) {
        if ($m['id'] > $lastId) {
            if ($m['id'] > $maxId) {
                $maxId = $m['id'];
            }
            // Transmettre uniquement les messages de l'adversaire
            if ($m['senderId'] !== $playerId) {
                $newEvents[] = $m['payload'];
            }
        }
    }

    // Sauvegarder la présence
    saveRoomsData($roomsFile, $rooms);

    $opponent = $isHost ? ($room['guest'] ?? null) : ($room['host'] ?? null);
    $isOpponentActive = false;
    if ($opponent && !empty($opponent['lastSeen'])) {
        $isOpponentActive = ($now - $opponent['lastSeen']) < 12;
    }

    echo json_encode([
        'success' => true,
        'events' => $newEvents,
        'lastMessageId' => $maxId,
        'opponent' => $opponent,
        'opponentConnected' => $isOpponentActive,
    ]);
    exit;
}

// -------------------------------------------------------------
// 5. ACTION : QUITTER LE SALON
// -------------------------------------------------------------
if ($action === 'leave_room') {
    if (isset($rooms[$roomCode])) {
        $room = &$rooms[$roomCode];
        $msgId = count($room['messages']) + 1;
        $room['messages'][] = [
            'id' => $msgId,
            'senderId' => $playerId,
            'payload' => ['type' => 'player_left'],
            'time' => microtime(true),
        ];
        $room['updatedAt'] = time();
        if ($room['host']['id'] === $playerId) {
            $room['status'] = 'finished';
        }
        saveRoomsData($roomsFile, $rooms);
    }

    echo json_encode(['success' => true]);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Action non reconnue.']);
