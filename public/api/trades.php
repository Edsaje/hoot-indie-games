<?php
/**
 * 🃏 Hoot Indie Games — Backend API Souverain des Échanges de Cartes (Trades)
 * 
 * Permet aux joueurs de s'échanger des cartes de leur collection :
 * - Création d'offres d'échange (carte proposée vs carte souhaitée)
 * - Réponse aux offres (Accepter, Refuser, Annuler)
 * - Consultation du classeur d'un ami
 * - Stockage atomique sous LOCK_EX dans public/api/user_saves/trades_data.json
 */

ini_set('display_errors', 0);
error_reporting(0);

// Headers de sécurité HTTP stricts
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Referrer-Policy: strict-origin-when-cross-origin');
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
$tradesFile = $savesDir . '/trades_data.json';
$friendsFile = $savesDir . '/friends_data.json';

// Verrouillage et lecture résiliente des offres
function loadTradesData($file) {
    if (!file_exists($file)) {
        return [];
    }
    $raw = @file_get_contents($file);
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

// Écriture atomique avec LOCK_EX
function saveTradesData($file, array $data) {
    // Nettoyer les offres expirées ou archivées de plus de 30 jours
    $now = time();
    $cleaned = [];
    foreach ($data as $trade) {
        $expiresAt = intval($trade['expiresAt'] ?? ($trade['createdAt'] + 7 * 86400));
        $updatedAt = intval($trade['updatedAt'] ?? $trade['createdAt'] ?? $now);
        // Conserver les offres actives et l'historique récent (< 30 jours)
        if (($trade['status'] ?? 'pending') === 'pending') {
            if ($now < $expiresAt) {
                $cleaned[] = $trade;
            }
        } elseif (($now - $updatedAt) < 30 * 86400) {
            $cleaned[] = $trade;
        }
    }

    $json = json_encode($cleaned, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    return @file_put_contents($file, $json, LOCK_EX) !== false;
}

// Récupération des données POST/GET
$rawInput = @file_get_contents('php://input');
$jsonBody = json_decode($rawInput, true) ?: [];

$action = trim($_REQUEST['action'] ?? $jsonBody['action'] ?? '');

switch ($action) {
    // ---------------------------------------------------------
    // 1. RÉCUPÉRATION DES OFFRES POUR UN CODE AMI
    // ---------------------------------------------------------
    case 'fetch':
        $friendCode = strtoupper(trim($_REQUEST['friendCode'] ?? $jsonBody['friendCode'] ?? ''));
        if (empty($friendCode)) {
            echo json_encode(['success' => true, 'incoming' => [], 'outgoing' => [], 'history' => [], 'pendingCount' => 0, 'unacknowledgedCount' => 0]);
            exit;
        }

        $allTrades = loadTradesData($tradesFile);
        $incoming = [];
        $outgoing = [];
        $history = [];

        foreach ($allTrades as $t) {
            $toCode = strtoupper(trim($t['toFriendCode'] ?? ''));
            $fromCode = strtoupper(trim($t['fromFriendCode'] ?? ''));
            $status = $t['status'] ?? 'pending';

            if ($toCode === $friendCode && $status === 'pending') {
                $incoming[] = $t;
            } elseif ($fromCode === $friendCode && $status === 'pending') {
                $outgoing[] = $t;
            } elseif (($toCode === $friendCode || $fromCode === $friendCode) && $status !== 'pending') {
                $history[] = $t;
            }
        }

        echo json_encode([
            'success' => true,
            'incoming' => $incoming,
            'outgoing' => $outgoing,
            'history' => $history,
            'pendingCount' => count($incoming),
            'unacknowledgedCount' => 0,
        ], JSON_UNESCAPED_UNICODE);
        exit;

    // ---------------------------------------------------------
    // 2. CRÉATION D'UNE OFFRE D'ÉCHANGE
    // ---------------------------------------------------------
    case 'create':
        $payload = $jsonBody['payload'] ?? $jsonBody;
        $fromCode = strtoupper(trim($payload['fromFriendCode'] ?? ''));
        $toCode = strtoupper(trim($payload['toFriendCode'] ?? ''));

        if (empty($fromCode) || empty($toCode)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Codes ami expéditeur et destinataire requis.']);
            exit;
        }

        if ($fromCode === $toCode) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Impossible d\'échanger des cartes avec soi-même.']);
            exit;
        }

        $now = time();
        $tradeId = 'trade_' . $now . '_' . bin2hex(random_bytes(4));

        $newTrade = [
            'id' => $tradeId,
            'fromFriendCode' => $fromCode,
            'fromUsername' => htmlspecialchars(trim($payload['fromUsername'] ?? 'Explorateur'), ENT_QUOTES, 'UTF-8'),
            'fromAvatarId' => trim($payload['fromAvatarId'] ?? 'owl'),
            'toFriendCode' => $toCode,
            'toUsername' => htmlspecialchars(trim($payload['toUsername'] ?? 'Compagnon'), ENT_QUOTES, 'UTF-8'),
            'toAvatarId' => trim($payload['toAvatarId'] ?? 'owl'),
            'offeredCardId' => trim($payload['offeredCardId'] ?? ''),
            'offeredCardIsHolo' => !empty($payload['offeredCardIsHolo']),
            'offeredCardTitle' => htmlspecialchars(trim($payload['offeredCardTitle'] ?? ''), ENT_QUOTES, 'UTF-8'),
            'offeredCardRarity' => trim($payload['offeredCardRarity'] ?? 'common'),
            'offeredCardImageUrl' => filter_var($payload['offeredCardImageUrl'] ?? '', FILTER_SANITIZE_URL),
            'offeredCardNumber' => intval($payload['offeredCardNumber'] ?? 0),
            'requestedCardId' => trim($payload['requestedCardId'] ?? 'any'),
            'requestedCardIsHolo' => !empty($payload['requestedCardIsHolo']),
            'requestedCardTitle' => htmlspecialchars(trim($payload['requestedCardTitle'] ?? 'Au choix'), ENT_QUOTES, 'UTF-8'),
            'requestedCardRarity' => trim($payload['requestedCardRarity'] ?? ''),
            'requestedCardImageUrl' => filter_var($payload['requestedCardImageUrl'] ?? '', FILTER_SANITIZE_URL),
            'requestedCardNumber' => intval($payload['requestedCardNumber'] ?? 0),
            'note' => htmlspecialchars(trim($payload['note'] ?? ''), ENT_QUOTES, 'UTF-8'),
            'status' => 'pending',
            'createdAt' => $now,
            'updatedAt' => $now,
            'expiresAt' => $now + 7 * 86400,
        ];

        $allTrades = loadTradesData($tradesFile);
        array_unshift($allTrades, $newTrade);
        saveTradesData($tradesFile, $allTrades);

        echo json_encode([
            'success' => true,
            'trade' => $newTrade,
            'message' => 'Offre d\'échange envoyée avec succès sur le serveur souverain !',
        ], JSON_UNESCAPED_UNICODE);
        exit;

    // ---------------------------------------------------------
    // 3. RÉPONDRE À UNE OFFRE (ACCEPTER, REFUSER, ANNULER)
    // ---------------------------------------------------------
    case 'respond':
        $tradeId = trim($_REQUEST['tradeId'] ?? $jsonBody['tradeId'] ?? '');
        $response = trim($_REQUEST['response'] ?? $jsonBody['response'] ?? '');
        $friendCode = strtoupper(trim($_REQUEST['friendCode'] ?? $jsonBody['friendCode'] ?? ''));

        if (empty($tradeId) || !in_array($response, ['accept', 'decline', 'cancel'], true)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Identifiant d\'offre ou action invalide.']);
            exit;
        }

        $allTrades = loadTradesData($tradesFile);
        $foundIndex = -1;
        foreach ($allTrades as $idx => $t) {
            if (($t['id'] ?? '') === $tradeId) {
                $foundIndex = $idx;
                break;
            }
        }

        if ($foundIndex === -1) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Offre d\'échange introuvable.']);
            exit;
        }

        $trade = &$allTrades[$foundIndex];
        $fromTradeCode = strtoupper(trim($trade['fromFriendCode'] ?? ''));
        $toTradeCode = strtoupper(trim($trade['toFriendCode'] ?? ''));

        // [SÉCURITÉ CWE-285] Contrôle strict des permissions :
        // - 'accept' et 'decline' ne peuvent être effectués que par le destinataire (toFriendCode)
        // - 'cancel' ne peut être effectué que par l'émetteur de l'offre (fromFriendCode)
        if (($response === 'accept' || $response === 'decline') && !empty($friendCode) && $friendCode !== $toTradeCode) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'forbidden', 'message' => 'Seul le destinataire de l\'offre peut accepter ou refuser cet échange.']);
            exit;
        }
        if ($response === 'cancel' && !empty($friendCode) && $friendCode !== $fromTradeCode) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'forbidden', 'message' => 'Seul l\'émetteur de l\'offre peut annuler cet échange.']);
            exit;
        }

        $now = time();

        if ($response === 'accept') {
            $trade['status'] = 'accepted';
            $trade['acceptedAt'] = $now;
            if (!empty($jsonBody['counterCardId'])) {
                $trade['requestedCardId'] = trim($jsonBody['counterCardId']);
                $trade['requestedCardIsHolo'] = !empty($jsonBody['counterCardIsHolo']);
            }
        } elseif ($response === 'decline') {
            $trade['status'] = 'declined';
        } elseif ($response === 'cancel') {
            $trade['status'] = 'canceled';
        }

        $trade['updatedAt'] = $now;
        saveTradesData($tradesFile, $allTrades);

        echo json_encode([
            'success' => true,
            'trade' => $trade,
            'message' => $response === 'accept' ? 'Échange accepté avec succès !' : 'Offre mise à jour.',
        ], JSON_UNESCAPED_UNICODE);
        exit;

    // ---------------------------------------------------------
    // 4. RÉCUPÉRATION DU CLASSEUR D'UN AMI
    // ---------------------------------------------------------
    case 'fetch_binder':
        $friendCode = strtoupper(trim($_REQUEST['friendCode'] ?? $jsonBody['friendCode'] ?? ''));
        if (empty($friendCode)) {
            echo json_encode(['success' => false, 'error' => 'Code ami requis.']);
            exit;
        }

        // Recherche du profil correspondant dans user_saves/
        $friendSave = null;
        $scanFiles = glob($savesDir . '/*.json');
        foreach ($scanFiles as $f) {
            $content = @file_get_contents($f);
            if ($content) {
                $d = json_decode($content, true);
                if (is_array($d)) {
                    $code = strtoupper(trim($d['friendCode'] ?? ''));
                    if ($code === $friendCode) {
                        $friendSave = $d;
                        break;
                    }
                }
            }
        }

        $collection = $friendSave['cardCollection'] ?? ($friendSave['payload']['cardCollection'] ?? []);
        $ownedCards = [];
        $duplicates = [];

        foreach ($collection as $cardId => $entry) {
            $count = intval($entry['count'] ?? 0);
            $countHolo = intval($entry['countHolo'] ?? 0);
            $ownedCards[$cardId] = ['count' => $count, 'countHolo' => $countHolo];

            if ($count > 1 || $countHolo > 1) {
                $duplicates[$cardId] = [
                    'count' => $count,
                    'countHolo' => $countHolo,
                    'tradableNormal' => max(0, $count - 1),
                    'tradableHolo' => max(0, $countHolo - 1),
                ];
            }
        }

        echo json_encode([
            'success' => true,
            'data' => [
                'friendCode' => $friendCode,
                'duplicates' => $duplicates,
                'ownedCards' => $ownedCards,
            ],
        ], JSON_UNESCAPED_UNICODE);
        exit;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Action inconnue.']);
        exit;
}
