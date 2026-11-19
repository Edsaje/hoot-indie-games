<?php
/**
 * 🦉 Hoot Indie Games — Private Messaging Controller
 */

if ($action === 'fetch_private_conversations') {
    $cleanUsername = trim($_REQUEST['username'] ?? $jsonBody['username'] ?? '');
    if (empty($cleanUsername) || $cleanUsername === 'Hibou Mystère') {
        echo json_encode(['success' => true, 'conversations' => [], 'totalUnread' => 0, 'serverTime' => time()]);
        exit;
    }

    // [SÉCURITÉ CWE-285] Vérification stricte d'autorisation d'accès aux conversations privées
    if (!isCallerAuthorizedForUsername($cleanUsername)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'forbidden', 'message' => 'Accès refusé. Vous devez être connecté à ce compte pour consulter ces conversations.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $allMsgs = loadPrivateMessages($privateDataFile);
    $cleanNorm = strtolower($cleanUsername);
    $convMap = [];
    $totalUnread = 0;

    foreach (array_reverse($allMsgs) as $msg) {
        $senderNorm = strtolower($msg['senderUsername'] ?? '');
        $recipientNorm = strtolower($msg['recipientUsername'] ?? '');

        if ($senderNorm !== $cleanNorm && $recipientNorm !== $cleanNorm) {
            continue;
        }

        $convId = $msg['conversationId'] ?? '';
        if (empty($convId)) {
            $p1 = $senderNorm <= $recipientNorm ? $senderNorm : $recipientNorm;
            $p2 = $senderNorm <= $recipientNorm ? $recipientNorm : $senderNorm;
            $convId = "{$p1}__{$p2}";
        }

        $isSender = ($senderNorm === $cleanNorm);
        $otherUsername = $isSender ? ($msg['recipientUsername'] ?? 'Compagnon') : ($msg['senderUsername'] ?? 'Compagnon');
        $isUnread = (!$isSender && empty($msg['read']));

        if (!isset($convMap[$convId])) {
            $convMap[$convId] = [
                'conversationId' => $convId,
                'participantUsernames' => [$cleanUsername, $otherUsername],
                'otherParticipant' => [
                    'username' => $otherUsername,
                    'avatarId' => $isSender ? 'owl' : ($msg['senderAvatarId'] ?? 'owl'),
                    'title' => $isSender ? null : ($msg['senderTitle'] ?? null),
                    'activeFrame' => $isSender ? null : ($msg['senderActiveFrame'] ?? null),
                ],
                'unreadCount' => $isUnread ? 1 : 0,
                'updatedAt' => intval($msg['timestamp'] ?? time()),
                'lastMessage' => [
                    'id' => $msg['id'] ?? '',
                    'senderUsername' => $msg['senderUsername'] ?? '',
                    'recipientUsername' => $msg['recipientUsername'] ?? '',
                    'text' => $msg['text'] ?? '',
                    'timestamp' => intval($msg['timestamp'] ?? time()),
                    'read' => !empty($msg['read']),
                ],
            ];
        } else {
            if ($isUnread) {
                $convMap[$convId]['unreadCount']++;
            }
        }
    }

    foreach ($convMap as $c) {
        $totalUnread += $c['unreadCount'];
    }

    echo json_encode([
        'success' => true,
        'conversations' => array_values($convMap),
        'totalUnread' => $totalUnread,
        'serverTime' => time(),
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// -------------------------------------------------------------
// RÉCUPÉRER LES MESSAGES D'UNE CONVERSATION PRIVÉE
// -------------------------------------------------------------
if ($action === 'fetch_private_messages') {
    $convId = trim($_REQUEST['conversationId'] ?? $jsonBody['conversationId'] ?? '');
    $cleanUsername = trim($_REQUEST['username'] ?? $jsonBody['username'] ?? '');
    $markRead = !empty($_REQUEST['markRead'] ?? $jsonBody['markRead'] ?? false);

    if (empty($convId) || empty($cleanUsername) || $cleanUsername === 'Hibou Mystère') {
        echo json_encode(['success' => true, 'messages' => [], 'conversationId' => $convId, 'serverTime' => time()]);
        exit;
    }

    // [SÉCURITÉ CWE-285] Vérification stricte d'autorisation d'accès aux messages privés
    if (!isCallerAuthorizedForUsername($cleanUsername)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'forbidden', 'message' => 'Accès refusé. Vous devez être connecté à ce compte pour consulter ces messages.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $allMsgs = loadPrivateMessages($privateDataFile);
    $cleanNorm = strtolower($cleanUsername);
    $messages = [];
    $hasUnreadModified = false;

    foreach ($allMsgs as &$msg) {
        if (($msg['conversationId'] ?? '') === $convId) {
            $senderNorm = strtolower($msg['senderUsername'] ?? '');
            $recipientNorm = strtolower($msg['recipientUsername'] ?? '');

            // Vérifier que l'utilisateur est bien participant
            if ($senderNorm !== $cleanNorm && $recipientNorm !== $cleanNorm) {
                continue;
            }

            if ($markRead && $recipientNorm === $cleanNorm && empty($msg['read'])) {
                $msg['read'] = true;
                $hasUnreadModified = true;
            }

            $messages[] = [
                'id' => $msg['id'] ?? '',
                'conversationId' => $convId,
                'senderUsername' => $msg['senderUsername'] ?? '',
                'senderAvatarId' => $msg['senderAvatarId'] ?? 'owl',
                'senderTitle' => $msg['senderTitle'] ?? null,
                'senderActiveFrame' => $msg['senderActiveFrame'] ?? null,
                'senderSteamId' => $msg['senderSteamId'] ?? null,
                'senderUserId' => $msg['senderUserId'] ?? null,
                'recipientUsername' => $msg['recipientUsername'] ?? '',
                'text' => $msg['text'] ?? '',
                'timestamp' => intval($msg['timestamp'] ?? time()),
                'read' => !empty($msg['read']),
                'isDeleted' => !empty($msg['isDeleted']),
            ];
        }
    }

    if ($hasUnreadModified) {
        savePrivateMessages($privateDataFile, $allMsgs);
    }

    // Récupérer les 60 derniers messages
    if (count($messages) > 60) {
        $messages = array_slice($messages, -60);
    }

    echo json_encode([
        'success' => true,
        'messages' => $messages,
        'conversationId' => $convId,
        'serverTime' => time(),
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// -------------------------------------------------------------
// ENVOYER UN MESSAGE PRIVÉ
// -------------------------------------------------------------
if ($action === 'send_private_message') {
    $senderUsername = trim($jsonBody['senderUsername'] ?? $_POST['senderUsername'] ?? '');
    $recipientUsername = trim($jsonBody['recipientUsername'] ?? $_POST['recipientUsername'] ?? '');
    $rawText = trim($jsonBody['text'] ?? $_POST['text'] ?? '');
    $conversationId = trim($jsonBody['conversationId'] ?? $_POST['conversationId'] ?? '');
    $senderUserId = trim($jsonBody['senderUserId'] ?? $_POST['senderUserId'] ?? '');
    $senderSteamId = trim($jsonBody['senderSteamId'] ?? $_POST['senderSteamId'] ?? '');

    // [SÉCURITÉ CWE-285] Vérification stricte d'anti-usurpation d'identité en messagerie privée
    if (!isCallerAuthorizedForUsername($senderUsername)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'forbidden', 'message' => 'Accès refusé. Vous ne pouvez pas envoyer de message sous cette identité sans être authentifié.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 0. Bouclier de suspension / ban souverain : les joueurs suspendus ne peuvent pas envoyer de MP
    $banCheck = checkIsUserBanned($senderUsername, $senderUserId, $senderSteamId, getClientIp());
    if ($banCheck['banned']) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'account_banned',
            'message' => 'Votre compte est suspendu par la modération.',
            'warning' => '🚫 Votre compte est suspendu : ' . ($banCheck['reason'] ?: 'Non-respect des règles.')
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (empty($senderUsername) || empty($recipientUsername) || empty($rawText)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Expéditeur, destinataire et contenu requis.']);
        exit;
    }

    if (empty($conversationId)) {
        $sNorm = strtolower($senderUsername);
        $rNorm = strtolower($recipientUsername);
        $p1 = $sNorm <= $rNorm ? $sNorm : $rNorm;
        $p2 = $sNorm <= $rNorm ? $rNorm : $sNorm;
        $conversationId = "{$p1}__{$p2}";
    }

    $cleanText = htmlspecialchars($rawText, ENT_QUOTES, 'UTF-8');
    $now = time();
    $newMsg = [
        'id' => 'pmsg_' . $now . '_' . bin2hex(random_bytes(4)),
        'conversationId' => $conversationId,
        'senderUsername' => htmlspecialchars($senderUsername, ENT_QUOTES, 'UTF-8'),
        'senderAvatarId' => trim($jsonBody['senderAvatarId'] ?? $_POST['senderAvatarId'] ?? 'owl'),
        'senderTitle' => trim($jsonBody['senderTitle'] ?? $_POST['senderTitle'] ?? ''),
        'senderActiveFrame' => trim($jsonBody['senderActiveFrame'] ?? $_POST['senderActiveFrame'] ?? ''),
        'senderSteamId' => trim($jsonBody['senderSteamId'] ?? $_POST['senderSteamId'] ?? ''),
        'senderUserId' => trim($jsonBody['senderUserId'] ?? $_POST['senderUserId'] ?? ''),
        'recipientUsername' => htmlspecialchars($recipientUsername, ENT_QUOTES, 'UTF-8'),
        'text' => $cleanText,
        'timestamp' => $now,
        'read' => false,
        'isDeleted' => false,
    ];

    $allMsgs = loadPrivateMessages($privateDataFile);
    $allMsgs[] = $newMsg;
    savePrivateMessages($privateDataFile, $allMsgs);

    echo json_encode([
        'success' => true,
        'message' => $newMsg,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// -------------------------------------------------------------
// MARQUER UNE CONVERSATION PRIVÉE COMME LUE
// -------------------------------------------------------------
if ($action === 'mark_private_read') {
    $convId = trim($_REQUEST['conversationId'] ?? $jsonBody['conversationId'] ?? '');
    $cleanUsername = trim($_REQUEST['username'] ?? $jsonBody['username'] ?? '');

    if (!isCallerAuthorizedForUsername($cleanUsername)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'forbidden']);
        exit;
    }

    if (!empty($convId) && !empty($cleanUsername)) {
        $allMsgs = loadPrivateMessages($privateDataFile);
        $cleanNorm = strtolower($cleanUsername);
        $modified = false;
        foreach ($allMsgs as &$msg) {
            if (($msg['conversationId'] ?? '') === $convId && strtolower($msg['recipientUsername'] ?? '') === $cleanNorm && empty($msg['read'])) {
                $msg['read'] = true;
                $modified = true;
            }
        }
        if ($modified) {
            savePrivateMessages($privateDataFile, $allMsgs);
        }
    }

    echo json_encode(['success' => true]);
    exit;
}

// -------------------------------------------------------------
// SUPPRIMER UN MESSAGE PRIVÉ
// -------------------------------------------------------------
if ($action === 'delete_private_message') {
    $msgId = trim($_REQUEST['messageId'] ?? $jsonBody['messageId'] ?? '');
    $cleanUsername = trim($_REQUEST['username'] ?? $jsonBody['username'] ?? '');
    $rawHard = $jsonBody['hardDelete'] ?? $_REQUEST['hardDelete'] ?? false;
    $hardDelete = ($rawHard === true || $rawHard === 1 || $rawHard === 'true' || $rawHard === '1');

    if (!isCallerAuthorizedForUsername($cleanUsername)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'forbidden']);
        exit;
    }

    if (!empty($msgId) && !empty($cleanUsername)) {
        $allMsgs = loadPrivateMessages($privateDataFile);
        $cleanNorm = strtolower($cleanUsername);
        $modified = false;
        foreach ($allMsgs as $idx => &$msg) {
            if (($msg['id'] ?? '') === $msgId) {
                if (strtolower($msg['senderUsername'] ?? '') === $cleanNorm || strtolower($msg['recipientUsername'] ?? '') === $cleanNorm) {
                    if ($hardDelete) {
                        array_splice($allMsgs, $idx, 1);
                    } else {
                        $msg['isDeleted'] = true;
                        $msg['text'] = '[Message privé retiré]';
                    }
                    $modified = true;
                    break;
                }
            }
        }
        if ($modified) {
            savePrivateMessages($privateDataFile, $allMsgs);
        }
    }

    echo json_encode(['success' => true, 'hardDeleted' => $hardDelete]);
    exit;
}
