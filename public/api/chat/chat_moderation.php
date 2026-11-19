<?php
/**
 * 🦉 Hoot Indie Games — Chat Moderation Controller
 */

if ($action === 'delete_message') {
    $messageId = trim($body['messageId'] ?? $_REQUEST['messageId'] ?? '');
    $steamId = trim($body['steamId'] ?? $_REQUEST['steamId'] ?? '');
    $userId = trim($body['userId'] ?? $_REQUEST['userId'] ?? '');
    $email = trim($body['email'] ?? $_REQUEST['email'] ?? '');
    $username = trim($body['username'] ?? $_REQUEST['username'] ?? '');
    $rawHard = $body['hardDelete'] ?? $_REQUEST['hardDelete'] ?? false;
    $hardDelete = ($rawHard === true || $rawHard === 1 || $rawHard === 'true' || $rawHard === '1');

    if (empty($messageId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'missing_id', 'message' => 'Identifiant du message requis.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $data = getChatData($dataFile);
    $targetIndex = -1;
    $targetMsg = null;

    foreach ($data['messages'] as $idx => $m) {
        if (($m['id'] ?? '') === $messageId) {
            $targetIndex = $idx;
            $targetMsg = $m;
            break;
        }
    }

    if ($targetIndex === -1 || !$targetMsg) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'not_found', 'message' => 'Message introuvable ou déjà supprimé.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (!empty($targetMsg['isDeleted']) && !$hardDelete) {
        echo json_encode(['success' => true, 'messageId' => $messageId, 'message' => 'Ce message a déjà été supprimé.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $auth = checkIsUserAdminOrModerator($steamId, $userId, $username, $email);
    $isCallerAdmin = ($auth['role'] === 'admin');
    $isCallerModerator = ($auth['role'] === 'moderator');

    $targetNorm = normalizeChatUsername($targetMsg['username'] ?? '');
    $callerNorm = normalizeChatUsername($username);
    $cleanSteam = trim(strval($steamId));

    $targetIsCreator = !empty($targetMsg['isCreator'])
                    || $targetNorm === 'hibouxe'
                    || (!empty($targetMsg['userId']) && $targetMsg['userId'] === 'admin_hibouxe')
                    || (!empty($targetMsg['steamId']) && $targetMsg['steamId'] === ADMIN_STEAM_ID);
    $targetIsModerator = !empty($targetMsg['isModerator']);

    // Détermination si c'est son propre message
    $isOwnMessage = false;
    if ($targetIsCreator) {
        if ($isCallerAdmin || $cleanSteam === ADMIN_STEAM_ID || $userId === 'admin_hibouxe' || (isCreatorAdminAuthorized() && $callerNorm === 'hibouxe')) {
            $isOwnMessage = true;
        }
    } elseif ($targetIsModerator) {
        if ($isCallerAdmin || ($isCallerModerator && !empty($cleanSteam) && !empty($targetMsg['steamId']) && $targetMsg['steamId'] === $cleanSteam)) {
            $isOwnMessage = true;
        }
    } else {
        $isOwnMessage = (!empty($userId) && !empty($targetMsg['userId']) && $targetMsg['userId'] === $userId)
                     || (!empty($cleanSteam) && !empty($targetMsg['steamId']) && $targetMsg['steamId'] === $cleanSteam)
                     || (!empty($callerNorm) && $targetNorm === $callerNorm);
    }

    // RÈGLES DE PERMISSIONS :
    // 1. L'Admin / Créateur (Hibouxe) peut supprimer ou faire disparaître TOUS les messages
    if ($isCallerAdmin) {
        // Autorisé pour tous les messages
    }
    // 2. Les modérateurs peuvent supprimer ou faire disparaître les messages des utilisateurs et leur propre message
    else if ($isCallerModerator) {
        // Interdiction absolue de toucher aux messages de l'admin / créateur
        if ($targetIsCreator) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'forbidden_target', 'message' => 'Les modérateurs ne peuvent pas supprimer les messages de l\'administrateur créateur.'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        // Interdiction de toucher aux messages d'un autre modérateur
        if ($targetIsModerator && !$isOwnMessage) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'forbidden_target', 'message' => 'Les modérateurs ne peuvent pas supprimer les messages d\'autres modérateurs.'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        // Messages des utilisateurs et son propre message autorisés
    }
    // 3. Les utilisateurs peuvent supprimer ou faire disparaître leur propre message
    else if ($isOwnMessage) {
        // Autorisé pour son propre message
    } else {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'forbidden', 'message' => 'Vous ne pouvez supprimer que vos propres messages.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Journal de modération si supprimé par le staff sur le message de quelqu'un d'autre
    if (!$isOwnMessage && ($isCallerAdmin || $isCallerModerator)) {
        $logs = [];
        if (file_exists($logsFile)) {
            $rawL = @file_get_contents($logsFile);
            if ($rawL) $logs = json_decode($rawL, true) ?: [];
        }
        $logs[] = [
            'id' => 'mod_del_' . time() . '_' . substr(md5(uniqid($messageId, true)), 0, 6),
            'type' => $hardDelete ? 'message_hard_deleted' : 'message_deleted',
            'timestamp' => time(),
            'date' => date('c'),
            'username' => $targetMsg['username'] ?? 'Inconnu',
            'userId' => $targetMsg['userId'] ?? '',
            'channel' => $targetMsg['channel'] ?? 'global',
            'flaggedWords' => ['delete_message'],
            'originalText' => ($hardDelete ? "Message effacé définitivement" : "Message masqué") . " par " . ($isCallerAdmin ? 'Hibouxe' : ($username ?: 'Modérateur')) . " : " . ($targetMsg['text'] ?? ''),
            'status' => $hardDelete ? 'hard_deleted' : 'deleted'
        ];
        if (count($logs) > 200) $logs = array_slice($logs, -200);
        @file_put_contents($logsFile, json_encode($logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    }

    // Application de la suppression
    if ($hardDelete) {
        array_splice($data['messages'], $targetIndex, 1);
        @file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

        echo json_encode([
            'success' => true,
            'messageId' => $messageId,
            'hardDeleted' => true,
            'message' => 'Message retiré définitivement de la discussion.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Masquage normal (soft delete)
    $data['messages'][$targetIndex]['isDeleted'] = true;
    $data['messages'][$targetIndex]['text'] = $isOwnMessage
        ? '[Message retiré par l\'auteur]'
        : ($isCallerAdmin ? '[Message retiré par l\'administrateur]' : '[Message retiré par la modération]');
    $data['messages'][$targetIndex]['scoreData'] = null;

    @file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

    echo json_encode([
        'success' => true,
        'messageId' => $messageId,
        'hardDeleted' => false,
        'message' => 'Message masqué avec succès.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// -------------------------------------------------------------
// JOURNAL DES INCIDENTS ANTI-INJURES (ADMIN OU MODÉRATEUR)
// -------------------------------------------------------------
if ($action === 'get_moderation_logs') {
    $steamId = trim($_REQUEST['steamId'] ?? $jsonBody['steamId'] ?? '');
    $userId = trim($_REQUEST['userId'] ?? $jsonBody['userId'] ?? '');
    $username = trim($_REQUEST['username'] ?? $jsonBody['username'] ?? '');

    $auth = checkIsUserAdminOrModerator($steamId, $userId, $username);
    if (!$auth['authorized']) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'forbidden', 'message' => 'Accès refusé. Réservé à l\'équipe de modération.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $logs = [];
    if (file_exists($logsFile)) {
        $raw = @file_get_contents($logsFile);
        if ($raw) {
            $logs = json_decode($raw, true) ?: [];
        }
    }

    echo json_encode(['success' => true, 'logs' => array_reverse($logs)], JSON_UNESCAPED_UNICODE);
    exit;
}

// -------------------------------------------------------------
// ARCHIVER / CLORE UN SIGNALEMENT D'INCIDENT (ADMIN OU MODÉRATEUR)
// -------------------------------------------------------------
if ($action === 'dismiss_moderation_log') {
    $steamId = trim($_REQUEST['steamId'] ?? $jsonBody['steamId'] ?? '');
    $userId = trim($_REQUEST['userId'] ?? $jsonBody['userId'] ?? '');
    $username = trim($_REQUEST['username'] ?? $jsonBody['username'] ?? '');
    $logId = trim($_REQUEST['logId'] ?? $jsonBody['logId'] ?? '');

    $auth = checkIsUserAdminOrModerator($steamId, $userId, $username);
    if (!$auth['authorized']) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'forbidden', 'message' => 'Accès refusé.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (file_exists($logsFile)) {
        $raw = @file_get_contents($logsFile);
        if ($raw) {
            $logs = json_decode($raw, true) ?: [];
            $logs = array_filter($logs, function($l) use ($logId) {
                return ($l['id'] ?? '') !== $logId;
            });
            @file_put_contents($logsFile, json_encode(array_values($logs), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        }
    }

    echo json_encode(['success' => true, 'logId' => $logId], JSON_UNESCAPED_UNICODE);
    exit;
}

// -------------------------------------------------------------
// PURGE DES MESSAGES D'UN UTILISATEUR (ADMIN OU MODÉRATEUR)
// -------------------------------------------------------------
if ($action === 'purge_user_messages') {
    $steamId = trim($_REQUEST['steamId'] ?? $jsonBody['steamId'] ?? '');
    $userId = trim($_REQUEST['userId'] ?? $jsonBody['userId'] ?? '');
    $callerUsername = trim($_REQUEST['username'] ?? $jsonBody['username'] ?? '');
    $targetUsername = trim($_REQUEST['targetUsername'] ?? $jsonBody['targetUsername'] ?? '');
    $targetUserId = trim($_REQUEST['targetUserId'] ?? $jsonBody['targetUserId'] ?? '');
    $targetNorm = normalizeChatUsername($targetUsername);

    $auth = checkIsUserAdminOrModerator($steamId, $userId, $callerUsername);
    if (!$auth['authorized']) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'forbidden', 'message' => 'Action non autorisée.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $isCallerAdmin = ($auth['role'] === 'admin');
    $isCallerModerator = ($auth['role'] === 'moderator');

    // Protection absolue du créateur
    if ($targetNorm === 'hibouxe') {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'forbidden_target', 'message' => 'Les messages du créateur ne peuvent pas être purgés.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Protection des modérateurs
    $targetRole = getUserSovereignRole($targetNorm, null, $targetUserId);
    if ($isCallerModerator && ($targetRole === 'admin' || $targetRole === 'moderator')) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'forbidden_target', 'message' => 'Les modérateurs ne peuvent pas purger les messages d\'autres membres du personnel.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $count = 0;
    if (file_exists($dataFile)) {
        $data = json_decode(@file_get_contents($dataFile), true) ?: ['messages' => []];
        $filtered = [];
        foreach ($data['messages'] as $m) {
            $mNorm = normalizeChatUsername($m['username'] ?? '');
            $mUid = $m['userId'] ?? '';
            $match = (!empty($targetNorm) && $mNorm === $targetNorm) || (!empty($targetUserId) && $mUid === $targetUserId);
            if ($match) {
                $count++;
            } else {
                $filtered[] = $m;
            }
        }
        $data['messages'] = $filtered;
        @file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    }

    // Journal de modération
    $logs = [];
    if (file_exists($logsFile)) {
        $rawL = @file_get_contents($logsFile);
        if ($rawL) $logs = json_decode($rawL, true) ?: [];
    }
    $logs[] = [
        'id' => 'mod_purge_' . time() . '_' . substr(md5(uniqid($targetNorm, true)), 0, 6),
        'type' => 'messages_purged',
        'timestamp' => time(),
        'date' => date('c'),
        'username' => $targetUsername,
        'userId' => $targetUserId,
        'flaggedWords' => ['purge'],
        'originalText' => "Purge de $count message(s) effectuée par " . ($callerUsername ?: ($isCallerAdmin ? 'Hibouxe' : 'Modérateur')),
        'status' => 'purged'
    ];
    if (count($logs) > 200) $logs = array_slice($logs, -200);
    @file_put_contents($logsFile, json_encode($logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

    echo json_encode(['success' => true, 'count' => $count, 'message' => "Messages purgés avec succès ($count messages supprimés)."], JSON_UNESCAPED_UNICODE);
    exit;
}

// -------------------------------------------------------------
// INFOS DE MODÉRATION D'UN UTILISATEUR
// -------------------------------------------------------------
if ($action === 'get_user_moderation_info') {
    $steamId = trim($_REQUEST['steamId'] ?? $jsonBody['steamId'] ?? '');
    $userId = trim($_REQUEST['userId'] ?? $jsonBody['userId'] ?? '');
    $callerUsername = trim($_REQUEST['username'] ?? $jsonBody['username'] ?? '');
    $targetUsername = trim($_REQUEST['targetUsername'] ?? $jsonBody['targetUsername'] ?? '');
    $targetUserId = trim($_REQUEST['targetUserId'] ?? $jsonBody['targetUserId'] ?? '');
    $targetNorm = normalizeChatUsername($targetUsername);

    $auth = checkIsUserAdminOrModerator($steamId, $userId, $callerUsername);
    if (!$auth['authorized']) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'forbidden', 'message' => 'Accès refusé. Réservé à l\'équipe de modération.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $uFile = getUsernamesStoragePath();
    $rawU = file_exists($uFile) ? @file_get_contents($uFile) : null;
    $uData = $rawU ? json_decode($rawU, true) : ['usernames' => []];
    $claimed = $uData['usernames'][$targetNorm] ?? null;

    $targetSteamId = $claimed['steamId'] ?? null;
    $banInfo = checkIsUserBanned($targetUsername, $targetUserId, $targetSteamId);

    $isTargetCreator = ($targetNorm === 'hibouxe' || strval($targetSteamId) === ADMIN_STEAM_ID);
    $targetRole = $isTargetCreator ? 'admin' : getUserSovereignRole($targetUsername, $targetSteamId, $targetUserId);

    $messages = [];
    $totalCount = 0;
    $foundAvatarId = $claimed['avatarId'] ?? '';
    $foundTitle = $claimed['customTitle'] ?? '';
    $foundFrame = $claimed['activeFrame'] ?? '';

    if (file_exists($dataFile)) {
        $chatData = json_decode(@file_get_contents($dataFile), true) ?: ['messages' => []];
        foreach (array_reverse($chatData['messages']) as $m) {
            $mNorm = normalizeChatUsername($m['username'] ?? '');
            $mUid = $m['userId'] ?? '';
            $match = (!empty($targetNorm) && $mNorm === $targetNorm) || (!empty($targetUserId) && $mUid === $targetUserId);
            if ($match) {
                $totalCount++;
                if (empty($foundAvatarId) && !empty($m['avatarId'])) $foundAvatarId = $m['avatarId'];
                if (empty($foundTitle) && !empty($m['title'])) $foundTitle = $m['title'];
                if (empty($foundFrame) && !empty($m['activeFrame'])) $foundFrame = $m['activeFrame'];

                if (count($messages) < 50) {
                    $messages[] = [
                        'id' => $m['id'] ?? '',
                        'channel' => $m['channel'] ?? 'global',
                        'text' => $m['text'] ?? '',
                        'timestamp' => $m['timestamp'] ?? 0,
                        'isDeleted' => !empty($m['isDeleted']),
                    ];
                }
            }
        }
    }

    $userProfile = [
        'username' => $claimed['displayName'] ?? ($targetUsername ?: 'Explorateur'),
        'role' => $targetRole,
        'isBanned' => $banInfo['banned'],
        'banReason' => $banInfo['reason'] ?? null,
        'bannedAt' => $banInfo['bannedAt'] ?? null,
        'steamId' => $targetSteamId,
        'avatarId' => $foundAvatarId ?: ($isTargetCreator ? 'hibouxe_creator' : 'owl'),
        'title' => $foundTitle ?: ($isTargetCreator ? 'Fondateur du Perchoir' : 'Oisillon du Perchoir'),
        'activeFrame' => $foundFrame,
        'registeredAt' => isset($claimed['claimedAt']) ? strtotime($claimed['claimedAt']) : null,
        'isCreator' => $isTargetCreator,
        'isModerator' => ($targetRole === 'moderator'),
    ];

    echo json_encode([
        'success' => true,
        'user' => $userProfile,
        'messageCount' => $totalCount,
        'recentMessages' => $messages,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// -------------------------------------------------------------
// EXÉCUTER UNE ACTION DE MODÉRATION (BAN, ROLE, RESET)
// -------------------------------------------------------------
if ($action === 'execute_user_moderation') {
    $steamId = trim($_REQUEST['steamId'] ?? $jsonBody['steamId'] ?? '');
    $userId = trim($_REQUEST['userId'] ?? $jsonBody['userId'] ?? '');
    $callerUsername = trim($_REQUEST['username'] ?? $jsonBody['username'] ?? '');
    $subAction = trim($_REQUEST['subAction'] ?? $jsonBody['subAction'] ?? '');
    $targetUsername = trim($_REQUEST['targetUsername'] ?? $jsonBody['targetUsername'] ?? '');
    $targetUserId = trim($_REQUEST['targetUserId'] ?? $jsonBody['targetUserId'] ?? '');
    $targetSteamId = trim($_REQUEST['targetSteamId'] ?? $jsonBody['targetSteamId'] ?? '');
    $reason = trim($_REQUEST['reason'] ?? $jsonBody['reason'] ?? '');
    $role = trim($_REQUEST['role'] ?? $jsonBody['role'] ?? '');

    $auth = checkIsUserAdminOrModerator($steamId, $userId, $callerUsername);
    if (!$auth['authorized']) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'forbidden', 'message' => 'Action non autorisée. Réservé à l\'administration et à la modération.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $isCallerAdmin = ($auth['role'] === 'admin');
    $isCallerModerator = ($auth['role'] === 'moderator');

    $targetNorm = normalizeChatUsername($targetUsername);
    if (empty($targetNorm)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'missing_target', 'message' => 'Utilisateur cible manquant.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Protection inaliénable du créateur
    if ($targetNorm === 'hibouxe' || $targetSteamId === ADMIN_STEAM_ID) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'forbidden_target', 'message' => 'Le profil du créateur ne peut faire l\'objet d\'aucune action de modération.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Protection des modérateurs : un modérateur ne peut modérer un autre modérateur
    $targetRole = getUserSovereignRole($targetNorm, $targetSteamId, $targetUserId);
    if ($isCallerModerator && ($targetRole === 'admin' || $targetRole === 'moderator')) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'forbidden_target', 'message' => 'Les modérateurs ne peuvent pas modérer d\'autres membres du personnel.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $modDb = loadModerationDb();
    $uFile = getUsernamesStoragePath();
    $rawU = file_exists($uFile) ? @file_get_contents($uFile) : null;
    $uData = $rawU ? json_decode($rawU, true) : ['usernames' => [], 'userToName' => [], 'bannedUsers' => []];
    if (!isset($uData['usernames'])) $uData['usernames'] = [];
    if (!isset($uData['bannedUsers'])) $uData['bannedUsers'] = [];

    // Tenter de récupérer steamId et userId de la cible si non passés
    if (empty($targetSteamId) && isset($uData['usernames'][$targetNorm]['steamId'])) {
        $targetSteamId = strval($uData['usernames'][$targetNorm]['steamId']);
    }
    if (empty($targetUserId) && isset($uData['usernames'][$targetNorm]['userId'])) {
        $targetUserId = strval($uData['usernames'][$targetNorm]['userId']);
    }

    $logs = [];
    if (file_exists($logsFile)) {
        $rawL = @file_get_contents($logsFile);
        if ($rawL) $logs = json_decode($rawL, true) ?: [];
    }

    // 1. BANNIR OU DÉBANNIR
    if ($subAction === 'toggle_ban') {
        $ban = !empty($_REQUEST['ban'] ?? $jsonBody['ban'] ?? false);
        $cleanReason = htmlspecialchars(strip_tags($reason), ENT_QUOTES, 'UTF-8');
        if (empty($cleanReason)) {
            $cleanReason = $ban ? 'Non-respect des règles de la communauté' : 'Suspension levée';
        }

        if ($ban) {
            $modDb['bannedUsers'][$targetNorm] = [
                'username' => $targetUsername,
                'userId' => $targetUserId,
                'steamId' => $targetSteamId,
                'bannedAt' => time(),
                'reason' => $cleanReason,
                'bannedBy' => $callerUsername ?: ($isCallerAdmin ? 'Hibouxe' : 'Modérateur')
            ];

            if (isset($uData['usernames'][$targetNorm])) {
                $uData['usernames'][$targetNorm]['status'] = 'banned';
                $uData['usernames'][$targetNorm]['isBanned'] = true;
                $uData['usernames'][$targetNorm]['banReason'] = $cleanReason;
                $uData['usernames'][$targetNorm]['bannedAt'] = time();
            }
            if (!empty($targetSteamId) && !in_array($targetSteamId, $uData['bannedUsers'], true)) {
                $uData['bannedUsers'][] = $targetSteamId;
            }
            if (!empty($targetUserId) && !in_array($targetUserId, $uData['bannedUsers'], true)) {
                $uData['bannedUsers'][] = $targetUserId;
            }

            $incident = [
                'id' => 'mod_ban_' . time() . '_' . substr(md5(uniqid($targetNorm, true)), 0, 6),
                'type' => 'user_banned',
                'timestamp' => time(),
                'date' => date('c'),
                'username' => $targetUsername,
                'userId' => $targetUserId,
                'steamId' => $targetSteamId,
                'flaggedWords' => ['ban'],
                'originalText' => "Joueur banni par " . ($callerUsername ?: ($isCallerAdmin ? 'Hibouxe' : 'Modérateur')) . " : " . $cleanReason,
                'status' => 'banned'
            ];
            $logs[] = $incident;
        } else {
            // Débannir
            unset($modDb['bannedUsers'][$targetNorm]);
            foreach ($modDb['bannedUsers'] as $k => $bEntry) {
                if ((!empty($targetUserId) && ($bEntry['userId'] ?? '') === $targetUserId) ||
                    (!empty($targetSteamId) && ($bEntry['steamId'] ?? '') === $targetSteamId)) {
                    unset($modDb['bannedUsers'][$k]);
                }
            }

            if (isset($uData['usernames'][$targetNorm])) {
                $uData['usernames'][$targetNorm]['status'] = 'active';
                $uData['usernames'][$targetNorm]['isBanned'] = false;
                unset($uData['usernames'][$targetNorm]['banReason']);
            }
            if (!empty($targetSteamId)) {
                $uData['bannedUsers'] = array_values(array_diff($uData['bannedUsers'], [$targetSteamId]));
            }
            if (!empty($targetUserId)) {
                $uData['bannedUsers'] = array_values(array_diff($uData['bannedUsers'], [$targetUserId]));
            }

            $incident = [
                'id' => 'mod_unban_' . time() . '_' . substr(md5(uniqid($targetNorm, true)), 0, 6),
                'type' => 'user_unbanned',
                'timestamp' => time(),
                'date' => date('c'),
                'username' => $targetUsername,
                'userId' => $targetUserId,
                'steamId' => $targetSteamId,
                'flaggedWords' => ['unban'],
                'originalText' => "Suspension levée par " . ($callerUsername ?: ($isCallerAdmin ? 'Hibouxe' : 'Modérateur')),
                'status' => 'active'
            ];
            $logs[] = $incident;
        }

        saveModerationDb($modDb);
        @file_put_contents($uFile, json_encode($uData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        if (count($logs) > 200) $logs = array_slice($logs, -200);
        @file_put_contents($logsFile, json_encode($logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

        echo json_encode([
            'success' => true,
            'message' => $ban ? "Utilisateur « {$targetUsername} » suspendu avec succès." : "Suspension levée pour « {$targetUsername} »."
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 2. CHANGER LE RÔLE D'UN JOUEUR (ADMIN UNIQUEMENT)
    if ($subAction === 'set_role') {
        if (!$isCallerAdmin) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'forbidden', 'message' => 'Seul l\'administrateur créateur peut attribuer ou modifier des rôles.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if (!in_array($role, ['user', 'vip', 'moderator'], true)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'invalid_role', 'message' => 'Rôle invalide. Rôles autorisés : user, vip, moderator.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if ($role === 'user') {
            unset($modDb['roles'][$targetNorm]);
        } else {
            $modDb['roles'][$targetNorm] = $role;
        }

        if (isset($uData['usernames'][$targetNorm])) {
            $uData['usernames'][$targetNorm]['role'] = $role;
            $uData['usernames'][$targetNorm]['isModerator'] = ($role === 'moderator');
        }

        $incident = [
            'id' => 'mod_role_' . time() . '_' . substr(md5(uniqid($targetNorm, true)), 0, 6),
            'type' => 'role_changed',
            'timestamp' => time(),
            'date' => date('c'),
            'username' => $targetUsername,
            'userId' => $targetUserId,
            'steamId' => $targetSteamId,
            'flaggedWords' => [$role],
            'originalText' => "Rôle modifié par Hibouxe : $role",
            'status' => 'role_updated'
        ];
        $logs[] = $incident;

        saveModerationDb($modDb);
        @file_put_contents($uFile, json_encode($uData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        if (count($logs) > 200) $logs = array_slice($logs, -200);
        @file_put_contents($logsFile, json_encode($logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

        echo json_encode([
            'success' => true,
            'message' => "Rôle de « {$targetUsername} » mis à jour en : {$role}."
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 3. RÉINITIALISER LE PSEUDONYME ABUSIF
    if ($subAction === 'reset_username') {
        if (file_exists($dataFile)) {
            $chatData = json_decode(@file_get_contents($dataFile), true) ?: ['messages' => []];
            foreach ($chatData['messages'] as &$m) {
                if (normalizeChatUsername($m['username'] ?? '') === $targetNorm) {
                    $m['username'] = 'Explorateur_Anonyme';
                }
            }
            unset($m);
            @file_put_contents($dataFile, json_encode($chatData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        }

        if (isset($uData['usernames'][$targetNorm])) {
            $uData['usernames'][$targetNorm]['displayName'] = 'Explorateur_Anonyme';
        }

        $incident = [
            'id' => 'mod_reset_' . time() . '_' . substr(md5(uniqid($targetNorm, true)), 0, 6),
            'type' => 'username_reset',
            'timestamp' => time(),
            'date' => date('c'),
            'username' => $targetUsername,
            'userId' => $targetUserId,
            'steamId' => $targetSteamId,
            'flaggedWords' => ['reset_username'],
            'originalText' => "Pseudonyme abusif réinitialisé par " . ($callerUsername ?: ($isCallerAdmin ? 'Hibouxe' : 'Modérateur')),
            'status' => 'reset'
        ];
        $logs[] = $incident;

        @file_put_contents($uFile, json_encode($uData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        if (count($logs) > 200) $logs = array_slice($logs, -200);
        @file_put_contents($logsFile, json_encode($logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

        echo json_encode([
            'success' => true,
            'message' => "Le pseudonyme de « {$targetUsername} » a été réinitialisé avec succès."
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    echo json_encode(['success' => true, 'message' => 'Action de modération appliquée.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// =============================================================
