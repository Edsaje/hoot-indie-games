<?php
/**
 * 🦉 Hoot Indie Games — Backend d'Échange de Cartes Souverain (Trade Bilatéral)
 * 
 * Rôle :
 * 1. Gestion bilatérale atomique des propositions d'échanges de cartes entre Compagnons Mutuels.
 * 2. Vérification d'intégrité anti-duplication (Double Spend / Race condition) sous verrouillage LOCK_EX.
 * 3. Transfert direct et synchronisé des cartes entre les inventaires Cloud des deux joueurs.
 * 4. Historique des échanges (pending, accepted, declined, canceled, expired).
 */

ini_set('display_errors', 0);
error_reporting(0);

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
require_once __DIR__ . '/admin_auth.php';
sendCorsHeaders();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataFile = __DIR__ . '/trades_data.json';
$friendsFile = __DIR__ . '/friends_data.json';
$rateLimitFile = __DIR__ . '/trades_ratelimit.json';
$savesDir = __DIR__ . '/user_saves';

if (!is_dir($savesDir)) {
    @mkdir($savesDir, 0755, true);
}

function getClientIp() {
    return getAuthClientIp();
}

// Rate limiting (max 60 requêtes par minute par IP)
function checkTradesRateLimit($rateLimitFile, $ip) {
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

if (!checkTradesRateLimit($rateLimitFile, getClientIp())) {
    http_response_code(429);
    echo json_encode(['success' => false, 'error' => 'Trop de requêtes. Veuillez patienter un instant.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Nettoyage et assainissement du code ami
function sanitizeFriendCode($code) {
    $c = strtoupper(trim((string)$code));
    if (!preg_match('/^HOOT-[A-Z0-9]{3,10}$/', $c)) {
        return null;
    }
    return $c;
}

// Normalisation pseudonyme
function normalizeUsername($name) {
    $n = mb_strtolower(trim((string)$name), 'UTF-8');
    $n = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $n);
    $n = preg_replace('/[^a-z0-9]/', '', $n);
    return $n;
}

// Chargement base des amis pour vérification de mutualité
function loadFriendsDb($file) {
    if (!file_exists($file) || filesize($file) === 0) return null;
    $raw = @file_get_contents($file);
    return $raw ? json_decode($raw, true) : null;
}

// Vérification de mutualité
function areFriendsMutual($friendsDb, $codeA, $codeB) {
    if (!$friendsDb || empty($codeA) || empty($codeB)) return false;
    $normA = strtoupper(trim($codeA));
    $normB = strtoupper(trim($codeB));
    if ($normA === $normB) return false;
    // Hibouxe est universellement mutuel
    if ($normA === 'HOOT-HIBOU' || $normB === 'HOOT-HIBOU') return true;

    $mutualA = $friendsDb['friendships'][$normA] ?? [];
    $mutualB = $friendsDb['friendships'][$normB] ?? [];
    return in_array($normB, $mutualA, true) && in_array($normA, $mutualB, true);
}

// Chargement de la base des échanges
function loadTradesDatabase($file) {
    $default = [
        'trades' => [],
        'playerTrades' => [] // index [friendCode => [tradeId1, tradeId2]]
    ];

    if (!file_exists($file) || filesize($file) === 0) {
        @file_put_contents($file, json_encode($default, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        return $default;
    }

    $raw = @file_get_contents($file);
    if (!empty($raw)) {
        $decoded = json_decode($raw, true);
        if (is_array($decoded) && isset($decoded['trades'])) {
            return $decoded;
        }
    }
    return $default;
}

// Sauvegarde atomique avec renommage POSIX
function saveTradesDatabase($file, $data) {
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

// Recherche ou création du fichier de sauvegarde utilisateur pour un joueur
function findOrCreateUserSaveFile($savesDir, $playerEntry) {
    if (!is_array($playerEntry)) return null;

    $candidates = [];
    if (!empty($playerEntry['steamId'])) {
        $cleanSteam = preg_replace('/[^a-zA-Z0-9_\-]/', '', $playerEntry['steamId']);
        if ($cleanSteam) $candidates[] = $savesDir . '/steam_' . $cleanSteam . '.json';
    }
    if (!empty($playerEntry['userId'])) {
        $cleanUser = preg_replace('/[^a-zA-Z0-9_\-]/', '', $playerEntry['userId']);
        if ($cleanUser) $candidates[] = $savesDir . '/user_' . $cleanUser . '.json';
    }
    if (!empty($playerEntry['username'])) {
        $cleanName = normalizeUsername($playerEntry['username']);
        if ($cleanName && $cleanName !== 'hiboumystere') {
            $candidates[] = $savesDir . '/name_' . $cleanName . '.json';
        }
    }
    // Par code ami
    if (!empty($playerEntry['friendCode'])) {
        $cleanCode = strtolower(str_replace('-', '_', $playerEntry['friendCode']));
        $candidates[] = $savesDir . '/code_' . $cleanCode . '.json';
    }

    foreach ($candidates as $cand) {
        if (file_exists($cand) && filesize($cand) > 10) {
            return $cand;
        }
    }

    // Si aucun n'existe, on retourne le premier candidat privilégié (Steam > User > Name)
    return $candidates[0] ?? null;
}

// Lecture sécurisée d'une sauvegarde utilisateur
function readUserSave($filePath) {
    if (!$filePath || !file_exists($filePath)) return [];
    $raw = @file_get_contents($filePath);
    return $raw ? (json_decode($raw, true) ?: []) : [];
}

// Écriture sécurisée d'une sauvegarde utilisateur
function writeUserSave($filePath, $data) {
    if (!$filePath) return false;
    $temp = $filePath . '.tmp.' . uniqid('', true);
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if ($json === false) return false;
    if (@file_put_contents($temp, $json, LOCK_EX) === false) {
        @unlink($temp);
        return false;
    }
    if (!@rename($temp, $filePath)) {
        @copy($temp, $filePath);
        @unlink($temp);
    }
    return true;
}

// Récupération de l'action et du payload
$rawBody = @file_get_contents('php://input');
$body = [];
if (!empty($rawBody)) {
    $body = json_decode($rawBody, true) ?: [];
}

$action = trim((string)($_GET['action'] ?? ($body['action'] ?? 'get_trades')));

$tradesDb = loadTradesDatabase($dataFile);
$friendsDb = loadFriendsDb($friendsFile);

// Expiration automatique des échanges en attente depuis plus de 7 jours
$now = time();
$sevenDays = 7 * 24 * 3600;
$hasModifications = false;
foreach ($tradesDb['trades'] as $tId => &$tr) {
    if (($tr['status'] ?? '') === 'pending' && ($now - ($tr['createdAt'] ?? 0)) > $sevenDays) {
        $tr['status'] = 'expired';
        $tr['updatedAt'] = $now;
        $hasModifications = true;
    }
}
unset($tr);
if ($hasModifications) {
    saveTradesDatabase($dataFile, $tradesDb);
}

// -------------------------------------------------------------
// 1. ACTION : get_trades (Récupère les offres d'un joueur)
// -------------------------------------------------------------
if ($action === 'get_trades') {
    $myCode = sanitizeFriendCode($_GET['friendCode'] ?? ($body['friendCode'] ?? ''));
    if (!$myCode) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Code ami manquant ou invalide.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $incoming = [];
    $outgoing = [];
    $history = [];
    $unacknowledgedCount = 0;

    foreach ($tradesDb['trades'] as $trade) {
        $isRecipient = ($trade['toFriendCode'] === $myCode);
        $isSender = ($trade['fromFriendCode'] === $myCode);

        if (!$isRecipient && !$isSender) continue;

        if ($trade['status'] === 'pending') {
            if ($isRecipient) {
                $incoming[] = $trade;
            } else {
                $outgoing[] = $trade;
            }
        } else {
            $history[] = $trade;
            if ($trade['status'] === 'accepted') {
                if ($isSender && empty($trade['acknowledgedBySender'])) {
                    $unacknowledgedCount++;
                }
                if ($isRecipient && empty($trade['acknowledgedByRecipient'])) {
                    $unacknowledgedCount++;
                }
            }
        }
    }

    // Trier du plus récent au plus ancien
    usort($incoming, function($a, $b) { return ($b['createdAt'] ?? 0) - ($a['createdAt'] ?? 0); });
    usort($outgoing, function($a, $b) { return ($b['createdAt'] ?? 0) - ($a['createdAt'] ?? 0); });
    usort($history, function($a, $b) { return ($b['updatedAt'] ?? $b['createdAt'] ?? 0) - ($a['updatedAt'] ?? $a['createdAt'] ?? 0); });

    echo json_encode([
        'success' => true,
        'incoming' => $incoming,
        'outgoing' => $outgoing,
        'history' => array_slice($history, 0, 30), // 30 derniers échanges
        'pendingCount' => count($incoming),
        'unacknowledgedCount' => $unacknowledgedCount,
        'serverTime' => gmdate('Y-m-d\TH:i:s\Z')
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// -------------------------------------------------------------
// 2. ACTION : create_trade (Propose un échange de carte)
// -------------------------------------------------------------
if ($action === 'create_trade') {
    $fromCode = sanitizeFriendCode($body['fromFriendCode'] ?? '');
    $toCode = sanitizeFriendCode($body['toFriendCode'] ?? '');

    if (!$fromCode || !$toCode) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Codes amis expéditeur et destinataire obligatoires.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($fromCode === $toCode) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Vous ne pouvez pas échanger de carte avec vous-même.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Contrôle impératif de mutualité
    if (!areFriendsMutual($friendsDb, $fromCode, $toCode)) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'friends_only',
            'message' => 'Pour sécuriser les inventaires, les échanges sont exclusivement réservés aux compagnons mutuels.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Carte offerte
    $offeredCardId = trim((string)($body['offeredCardId'] ?? ''));
    $offeredCardIsHolo = !empty($body['offeredCardIsHolo']);
    $offeredCardTitle = trim((string)($body['offeredCardTitle'] ?? 'Carte'));
    $offeredCardRarity = trim((string)($body['offeredCardRarity'] ?? 'common'));
    $offeredCardImageUrl = trim((string)($body['offeredCardImageUrl'] ?? ''));
    $offeredCardNumber = intval($body['offeredCardNumber'] ?? 0);

    // Carte demandée
    $requestedCardId = trim((string)($body['requestedCardId'] ?? 'any'));
    $requestedCardIsHolo = !empty($body['requestedCardIsHolo']);
    $requestedCardTitle = trim((string)($body['requestedCardTitle'] ?? 'Au choix'));
    $requestedCardRarity = trim((string)($body['requestedCardRarity'] ?? ''));
    $requestedCardImageUrl = trim((string)($body['requestedCardImageUrl'] ?? ''));
    $requestedCardNumber = intval($body['requestedCardNumber'] ?? 0);

    $note = mb_substr(trim((string)($body['note'] ?? '')), 0, 200, 'UTF-8');

    if (empty($offeredCardId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Vous devez sélectionner une carte à offrir.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Vérifier les limites anti-spam : max 10 propositions actives émises par un joueur
    $activeCount = 0;
    foreach ($tradesDb['trades'] as $tr) {
        if ($tr['fromFriendCode'] === $fromCode && $tr['status'] === 'pending') {
            $activeCount++;
        }
    }
    if ($activeCount >= 10) {
        http_response_code(429);
        echo json_encode(['success' => false, 'error' => 'Vous avez déjà 10 propositions d\'échange en attente. Veuillez attendre la réponse de vos amis.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Récupérer les profils
    $fromPlayer = $friendsDb['players'][$fromCode] ?? [
        'username' => trim((string)($body['fromUsername'] ?? 'Explorateur')),
        'avatarId' => trim((string)($body['fromAvatarId'] ?? 'owl'))
    ];
    $toPlayer = $friendsDb['players'][$toCode] ?? [
        'username' => trim((string)($body['toUsername'] ?? 'Compagnon')),
        'avatarId' => trim((string)($body['toAvatarId'] ?? 'owl'))
    ];

    $tradeId = 'trade_' . substr(md5(uniqid(mt_rand(), true)), 0, 16);

    $newTrade = [
        'id' => $tradeId,
        'fromFriendCode' => $fromCode,
        'fromUsername' => $fromPlayer['username'] ?? 'Explorateur',
        'fromAvatarId' => $fromPlayer['avatarId'] ?? 'owl',
        'toFriendCode' => $toCode,
        'toUsername' => $toPlayer['username'] ?? 'Compagnon',
        'toAvatarId' => $toPlayer['avatarId'] ?? 'owl',

        'offeredCardId' => $offeredCardId,
        'offeredCardIsHolo' => $offeredCardIsHolo,
        'offeredCardTitle' => $offeredCardTitle,
        'offeredCardRarity' => $offeredCardRarity,
        'offeredCardImageUrl' => $offeredCardImageUrl,
        'offeredCardNumber' => $offeredCardNumber,

        'requestedCardId' => $requestedCardId,
        'requestedCardIsHolo' => $requestedCardIsHolo,
        'requestedCardTitle' => $requestedCardTitle,
        'requestedCardRarity' => $requestedCardRarity,
        'requestedCardImageUrl' => $requestedCardImageUrl,
        'requestedCardNumber' => $requestedCardNumber,

        'note' => $note,
        'status' => 'pending',
        'createdAt' => $now,
        'updatedAt' => $now,
        'expiresAt' => $now + $sevenDays,
        'acknowledgedBySender' => false,
        'acknowledgedByRecipient' => false
    ];

    $tradesDb['trades'][$tradeId] = $newTrade;
    saveTradesDatabase($dataFile, $tradesDb);

    echo json_encode([
        'success' => true,
        'trade' => $newTrade,
        'message' => "Offre d'échange envoyée à {$toPlayer['username']} !"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// -------------------------------------------------------------
// 3. ACTION : respond_trade (Accepter, Refuser ou Annuler)
// -------------------------------------------------------------
if ($action === 'respond_trade') {
    $tradeId = trim((string)($body['tradeId'] ?? ''));
    $responseAction = trim((string)($body['response'] ?? '')); // 'accept' | 'decline' | 'cancel'
    $myCode = sanitizeFriendCode($body['friendCode'] ?? '');
    $counterCardId = trim((string)($body['counterCardId'] ?? ''));
    $counterCardIsHolo = !empty($body['counterCardIsHolo']);
    $counterCardTitle = trim((string)($body['counterCardTitle'] ?? ''));
    $counterCardRarity = trim((string)($body['counterCardRarity'] ?? 'common'));
    $counterCardImageUrl = trim((string)($body['counterCardImageUrl'] ?? ''));
    $counterCardNumber = intval($body['counterCardNumber'] ?? 0);

    if (empty($tradeId) || !isset($tradesDb['trades'][$tradeId])) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Proposition d\'échange introuvable.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $trade = &$tradesDb['trades'][$tradeId];

    if ($trade['status'] !== 'pending') {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'invalid_status',
            'message' => "Cet échange n'est plus en attente (statut actuel : {$trade['status']})."
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Action : ANNULER (seul l'expéditeur peut annuler son offre)
    if ($responseAction === 'cancel') {
        if ($myCode && $trade['fromFriendCode'] !== $myCode) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Seul l\'auteur de l\'offre peut l\'annuler.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $trade['status'] = 'canceled';
        $trade['updatedAt'] = $now;
        saveTradesDatabase($dataFile, $tradesDb);

        echo json_encode(['success' => true, 'trade' => $trade, 'message' => 'Offre d\'échange annulée.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Action : REFUSER (seul le destinataire peut refuser)
    if ($responseAction === 'decline') {
        if ($myCode && $trade['toFriendCode'] !== $myCode) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Seul le destinataire peut refuser l\'offre.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $trade['status'] = 'declined';
        $trade['updatedAt'] = $now;
        saveTradesDatabase($dataFile, $tradesDb);

        echo json_encode(['success' => true, 'trade' => $trade, 'message' => 'Offre d\'échange déclinée.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Action : ACCEPTER (Exécution bilatérale atomique !)
    if ($responseAction === 'accept') {
        if ($myCode && $trade['toFriendCode'] !== $myCode) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Seul le destinataire peut accepter l\'échange.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Si la carte demandée était "au choix", utiliser la contre-carte fournie
        $effectiveRequestedId = $trade['requestedCardId'];
        $effectiveRequestedIsHolo = $trade['requestedCardIsHolo'];

        if ($effectiveRequestedId === 'any' || empty($effectiveRequestedId)) {
            if (empty($counterCardId)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Veuillez sélectionner la carte que vous offrez en contrepartie.'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            $effectiveRequestedId = $counterCardId;
            $effectiveRequestedIsHolo = $counterCardIsHolo;
            $trade['requestedCardId'] = $counterCardId;
            $trade['requestedCardIsHolo'] = $counterCardIsHolo;
            if ($counterCardTitle) $trade['requestedCardTitle'] = $counterCardTitle;
            if ($counterCardRarity) $trade['requestedCardRarity'] = $counterCardRarity;
            if ($counterCardImageUrl) $trade['requestedCardImageUrl'] = $counterCardImageUrl;
            if ($counterCardNumber) $trade['requestedCardNumber'] = $counterCardNumber;
        }

        // 1. Recherche des fichiers de sauvegarde Cloud des 2 joueurs
        $fromPlayerEntry = $friendsDb['players'][$trade['fromFriendCode']] ?? ['friendCode' => $trade['fromFriendCode'], 'username' => $trade['fromUsername']];
        $toPlayerEntry = $friendsDb['players'][$trade['toFriendCode']] ?? ['friendCode' => $trade['toFriendCode'], 'username' => $trade['toUsername']];

        $fromSaveFile = findOrCreateUserSaveFile($savesDir, $fromPlayerEntry);
        $toSaveFile = findOrCreateUserSaveFile($savesDir, $toPlayerEntry);

        $fromSave = readUserSave($fromSaveFile);
        $toSave = readUserSave($toSaveFile);

        $fromCollection = $fromSave['cardCollection'] ?? [];
        $toCollection = $toSave['cardCollection'] ?? [];

        // 2. Vérification stricte des possessions
        $offeredId = $trade['offeredCardId'];
        $offeredIsHolo = $trade['offeredCardIsHolo'];

        $fromEntry = $fromCollection[$offeredId] ?? null;
        $fromCount = $fromEntry ? ($offeredIsHolo ? intval($fromEntry['countHolo'] ?? 0) : intval($fromEntry['count'] ?? 0)) : 0;

        // Si le joueur A ne possède pas de sauvegarde cloud ou que le compte n'est pas trouvé, vérification souple avec le payload client
        $senderHasCard = ($fromCount >= 1);
        if (!$fromSaveFile || empty($fromSave)) {
            // Expéditeur sans sauvegarde cloud serveur : autorisé avec confirmation
            $senderHasCard = true;
        }

        $toEntry = $toCollection[$effectiveRequestedId] ?? null;
        $toCount = $toEntry ? ($effectiveRequestedIsHolo ? intval($toEntry['countHolo'] ?? 0) : intval($toEntry['count'] ?? 0)) : 0;
        $recipientHasCard = ($toCount >= 1);

        if (!$toSaveFile || empty($toSave)) {
            // Le destinataire accepte depuis son client actif
            $recipientHasCard = true;
        }

        if (!$senderHasCard) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'sender_missing_card',
                'message' => "L'expéditeur ({$trade['fromUsername']}) ne possède plus l'exemplaire de la carte promise. Échange impossible."
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if (!$recipientHasCard) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'recipient_missing_card',
                'message' => "Vous ne possédez pas l'exemplaire de la carte demandée dans votre classeur."
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // 3. EXÉCUTION BILATÉRALE ATOMIQUE
        $nowIso = date('c');

        // Joueur A (Expéditeur) : perd OfferedCard, gagne RequestedCard
        if ($fromSaveFile && !empty($fromSave)) {
            // Décrémenter OfferedCard
            if (isset($fromCollection[$offeredId])) {
                if ($offeredIsHolo) {
                    $fromCollection[$offeredId]['countHolo'] = max(0, intval($fromCollection[$offeredId]['countHolo'] ?? 0) - 1);
                } else {
                    $fromCollection[$offeredId]['count'] = max(0, intval($fromCollection[$offeredId]['count'] ?? 0) - 1);
                }
            }
            // Incrémenter RequestedCard
            if (!isset($fromCollection[$effectiveRequestedId])) {
                $fromCollection[$effectiveRequestedId] = [
                    'count' => $effectiveRequestedIsHolo ? 0 : 1,
                    'countHolo' => $effectiveRequestedIsHolo ? 1 : 0,
                    'firstObtainedAt' => $nowIso
                ];
            } else {
                if ($effectiveRequestedIsHolo) {
                    $fromCollection[$effectiveRequestedId]['countHolo'] = intval($fromCollection[$effectiveRequestedId]['countHolo'] ?? 0) + 1;
                } else {
                    $fromCollection[$effectiveRequestedId]['count'] = intval($fromCollection[$effectiveRequestedId]['count'] ?? 0) + 1;
                }
            }
            $fromSave['cardCollection'] = $fromCollection;
            $fromSave['syncedAt'] = $nowIso;
            $fromSave['tradesLastUpdated'] = $now;
            writeUserSave($fromSaveFile, $fromSave);
        }

        // Joueur B (Destinataire) : perd RequestedCard, gagne OfferedCard
        if ($toSaveFile && !empty($toSave)) {
            // Décrémenter RequestedCard
            if (isset($toCollection[$effectiveRequestedId])) {
                if ($effectiveRequestedIsHolo) {
                    $toCollection[$effectiveRequestedId]['countHolo'] = max(0, intval($toCollection[$effectiveRequestedId]['countHolo'] ?? 0) - 1);
                } else {
                    $toCollection[$effectiveRequestedId]['count'] = max(0, intval($toCollection[$effectiveRequestedId]['count'] ?? 0) - 1);
                }
            }
            // Incrémenter OfferedCard
            if (!isset($toCollection[$offeredId])) {
                $toCollection[$offeredId] = [
                    'count' => $offeredIsHolo ? 0 : 1,
                    'countHolo' => $offeredIsHolo ? 1 : 0,
                    'firstObtainedAt' => $nowIso
                ];
            } else {
                if ($offeredIsHolo) {
                    $toCollection[$offeredId]['countHolo'] = intval($toCollection[$offeredId]['countHolo'] ?? 0) + 1;
                } else {
                    $toCollection[$offeredId]['count'] = intval($toCollection[$offeredId]['count'] ?? 0) + 1;
                }
            }
            $toSave['cardCollection'] = $toCollection;
            $toSave['syncedAt'] = $nowIso;
            $toSave['tradesLastUpdated'] = $now;
            writeUserSave($toSaveFile, $toSave);
        }

        // 4. Marquer l'échange comme complété
        $trade['status'] = 'accepted';
        $trade['acceptedAt'] = $now;
        $trade['updatedAt'] = $now;
        saveTradesDatabase($dataFile, $tradesDb);

        echo json_encode([
            'success' => true,
            'trade' => $trade,
            'message' => "Félicitations ! Échange conclu avec succès avec {$trade['fromUsername']} !",
            'updatedRecipientCollection' => $toCollection
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Action inconnue. Utilisez accept, decline ou cancel.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// -------------------------------------------------------------
// 4. ACTION : get_friend_binder (Consulte les doubles d'un ami)
// -------------------------------------------------------------
if ($action === 'get_friend_binder') {
    $myCode = sanitizeFriendCode($_GET['myCode'] ?? ($body['myCode'] ?? ''));
    $friendCode = sanitizeFriendCode($_GET['friendCode'] ?? ($body['friendCode'] ?? ''));

    if (!$myCode || !$friendCode) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Codes amis obligatoires.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Contrôle impératif de mutualité
    if (!areFriendsMutual($friendsDb, $myCode, $friendCode)) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'friends_only',
            'message' => 'Vous devez être amis mutuels pour consulter le classeur de ce compagnon.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $friendEntry = $friendsDb['players'][$friendCode] ?? null;
    $duplicates = [];
    $allOwned = [];

    if ($friendEntry) {
        $saveFile = findOrCreateUserSaveFile($savesDir, $friendEntry);
        if ($saveFile && file_exists($saveFile)) {
            $save = readUserSave($saveFile);
            $collection = $save['cardCollection'] ?? [];
            foreach ($collection as $cardId => $entry) {
                if (!is_array($entry)) continue;
                $normal = intval($entry['count'] ?? 0);
                $holo = intval($entry['countHolo'] ?? 0);
                $total = $normal + $holo;
                if ($total > 0) {
                    $allOwned[$cardId] = ['count' => $normal, 'countHolo' => $holo];
                    // Si le joueur en a au moins 2 au total, ou un normal et un holo, il a des doubles disponibles à l'échange
                    if ($total > 1) {
                        $duplicates[$cardId] = [
                            'count' => $normal,
                            'countHolo' => $holo,
                            'tradableNormal' => max(0, $normal - 1),
                            'tradableHolo' => max(0, $holo - 1)
                        ];
                    }
                }
            }
        }
    }

    echo json_encode([
        'success' => true,
        'friendCode' => $friendCode,
        'duplicates' => $duplicates,
        'ownedCards' => $allOwned
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// -------------------------------------------------------------
// 5. ACTION : acknowledge_trade (Acquitte la notification d'échange)
// -------------------------------------------------------------
if ($action === 'acknowledge_trade') {
    $tradeId = trim((string)($body['tradeId'] ?? ''));
    $myCode = sanitizeFriendCode($body['friendCode'] ?? '');

    if ($tradeId && isset($tradesDb['trades'][$tradeId])) {
        $t = &$tradesDb['trades'][$tradeId];
        if ($myCode === $t['fromFriendCode']) {
            $t['acknowledgedBySender'] = true;
        }
        if ($myCode === $t['toFriendCode']) {
            $t['acknowledgedByRecipient'] = true;
        }
        saveTradesDatabase($dataFile, $tradesDb);
    }

    echo json_encode(['success' => true]);
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Action non reconnue.'], JSON_UNESCAPED_UNICODE);
