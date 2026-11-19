<?php
/**
 * 🦉 Hoot Indie Games — Public Chat Controller
 */

if ($action === 'get_messages') {
    $channel = trim($_REQUEST['channel'] ?? 'all');
    $since = (int)($_REQUEST['since'] ?? 0);
    $limit = min(100, max(1, (int)($_REQUEST['limit'] ?? 50)));

    header('Cache-Control: private, no-cache, no-transform');

    $fileMtime = file_exists($dataFile) ? @filemtime($dataFile) : 0;

    // Performance & Sécurité : Si le client fournit un timestamp 'since'
    // et que le fichier chat_messages.json n'a pas été modifié depuis,
    // aucun nouveau message n'existe : on renvoie directement [] sans lecture disque ni parsing JSON !
    if ($since > 0 && $fileMtime > 0 && $fileMtime <= $since) {
        echo json_encode([
            'success' => true,
            'channel' => $channel,
            'messages' => [],
            'serverTime' => time()
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $data = getChatData($dataFile);
    $all = $data['messages'];

    // Filtrer par canal si spécifié
    if ($channel !== 'all' && in_array($channel, $validChannels, true)) {
        $filtered = array_filter($all, function($m) use ($channel) {
            return ($m['channel'] ?? '') === $channel;
        });
    } else {
        $filtered = $all;
    }

    // Filtrer par timestamp 'since' si présent
    if ($since > 0) {
        $filtered = array_filter($filtered, function($m) use ($since) {
            return ($m['timestamp'] ?? 0) > $since;
        });
    }

    // Ne renvoyer que les $limit plus récents
    $filtered = array_values($filtered);
    if (count($filtered) > $limit) {
        $filtered = array_slice($filtered, -$limit);
    }

    echo json_encode([
        'success' => true,
        'channel' => $channel,
        'messages' => $filtered,
        'serverTime' => time()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'send_message') {
    $ip = getClientIp();

    $rawUsername = trim($body['username'] ?? 'Explorateur');
    $userId = trim($body['userId'] ?? '');
    $email = trim($body['email'] ?? '');
    $steamId = trim($body['steamId'] ?? '');

    // 0. Bouclier de modération souverain : suspension et bans persistants
    $banCheck = checkIsUserBanned($rawUsername, $userId, $steamId, $ip);
    if ($banCheck['banned']) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'account_banned',
            'message' => 'Votre compte est suspendu par la modération.',
            'warning' => '🚫 Votre compte est suspendu par la modération : ' . ($banCheck['reason'] ?: 'Non-respect des règles de la communauté.')
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Vérifier le rate limiting
    if (!checkRateLimit($rateLimitFile, $ip)) {
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'error' => 'Veuillez patienter quelques secondes avant d\'envoyer un nouveau message.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Les données $body sont déjà extraites et fusionnées (JSON / POST)

    $channel = trim($body['channel'] ?? 'global');
    if (!in_array($channel, $validChannels, true)) {
        $channel = 'global';
    }

    $rawText = trim($body['text'] ?? '');
    if (empty($rawText) || mb_strlen($rawText, 'UTF-8') < 1) {
        echo json_encode([
            'success' => false,
            'error' => 'Le message ne peut pas être vide.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Limiter la taille à 350 caractères
    if (mb_strlen($rawText, 'UTF-8') > 350) {
        $rawText = mb_substr($rawText, 0, 350, 'UTF-8');
    }

    // Identité utilisateur
    $rawUsername = trim($body['username'] ?? 'Explorateur');
    $cleanUsername = htmlspecialchars(strip_tags($rawUsername), ENT_QUOTES, 'UTF-8');
    if (empty($cleanUsername)) {
        $cleanUsername = 'Explorateur';
    }

    // Vérification d'authentification obligatoire : interdiction de poster sans être connecté
    $userId = trim($body['userId'] ?? '');
    $email = trim($body['email'] ?? '');
    $steamId = trim($body['steamId'] ?? '');

    if (empty($steamId) && empty($email) && (empty($userId) || strpos($userId, 'local_') === 0)) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Vous devez être connecté à un compte pour participer au tchat.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Vérification stricte de l'e-mail pour les comptes locaux / email (protection anti-spam & anti-bots)
    if (empty($steamId) && !isCreatorAdminAuthorized()) {
        $isVerified = !empty($_SESSION['hoot_email_verified']);
        if (!$isVerified && !empty($userId)) {
            $accFile = getUserSavesDir() . '/.accounts.json';
            if (file_exists($accFile)) {
                $accData = @json_decode(@file_get_contents($accFile), true);
                if (isset($accData['users'][$userId]['emailVerified'])) {
                    $isVerified = (bool)$accData['users'][$userId]['emailVerified'];
                }
            }
        }
        if (!$isVerified) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'error' => 'email_unverified',
                'message' => 'Veuillez confirmer votre adresse e-mail pour participer au tchat communautaire.'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    $isCreator = false;
    $isModerator = false;
    $normUser = normalizeChatUsername($cleanUsername);
    $cleanSteam = trim(strval($steamId));
    $cleanEmail = mb_strtolower(trim($email), 'UTF-8');

    // Vérification des privilèges admin & modérateur
    $authInfo = checkIsUserAdminOrModerator($steamId, $userId, $cleanUsername, $email);
    if ($authInfo['role'] === 'moderator') {
        $isModerator = true;
    }

    // Vérification stricte et souveraine du statut Créateur officiel (aucun champ client ne peut l'usurper)
    $isOfficialCreator = isCreatorAdminAuthorized();

    // Sécurité stricte : Edsaje ne peut jamais être créateur ni admin
    if ($normUser === 'edsaje') {
        $isOfficialCreator = false;
    }

    if ($isOfficialCreator) {
        $isCreator = true;
        $cleanUsername = 'Hibouxe';
    } else if (in_array($normUser, ['hibouxe', 'edsaje'], true)) {
        // Interdiction absolue d'usurpation de l'identité du fondateur pour les comptes non autorisés
        $cleanUsername = 'Explorateur_' . substr(md5($ip), 0, 4);
    }

    // Anti-usurpation d'identité : protéger les membres contre les faux comptes Staff / Support / Modérateur
    $isStaffUser = ($isCreator || $isModerator || $authInfo['role'] === 'admin');
    if (!$isStaffUser) {
        $reservedKeywords = ['admin', 'moderator', 'modérateur', 'support', 'staff', 'security', 'sécurité', 'hibouxe', 'edsaje', 'system', 'système', 'steam_support', 'officiel', 'official'];
        foreach ($reservedKeywords as $kw) {
            if (stripos($cleanUsername, $kw) !== false) {
                $cleanUsername = 'Explorateur_' . substr(md5($ip . $userId), 0, 4);
                break;
            }
        }
    }

    // 1. Détection stricte anti-hameçonnage (protection absolue contre les arnaques et liens malveillants)
    $flaggedPhishing = detectPhishingAndSuspiciousLinks($rawText, $isStaffUser);
    if (!empty($flaggedPhishing)) {
        // Enregistrement de l'incident de sécurité pour les administrateurs et modérateurs
        $logs = [];
        if (file_exists($logsFile)) {
            $rawLogs = @file_get_contents($logsFile);
            if ($rawLogs) {
                $logs = json_decode($rawLogs, true) ?: [];
            }
        }
        $incident = [
            'id' => 'mod_phish_' . time() . '_' . substr(md5(uniqid($ip, true)), 0, 6),
            'type' => 'phishing_blocked',
            'timestamp' => time(),
            'date' => date('c'),
            'username' => $cleanUsername,
            'userId' => $userId,
            'steamId' => $steamId,
            'ipHash' => hash('sha256', $ip . '_hoot_mod_salt'),
            'channel' => $channel,
            'flaggedWords' => $flaggedPhishing,
            'originalText' => htmlspecialchars(strip_tags($rawText), ENT_QUOTES, 'UTF-8'),
            'status' => 'blocked'
        ];
        $logs[] = $incident;
        if (count($logs) > 200) {
            $logs = array_slice($logs, -200);
        }
        @file_put_contents($logsFile, json_encode($logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'phishing_detected',
            'warning' => '🛡️ Bouclier Sécurité & Anti-Hameçonnage : Votre message a été bloqué pour protéger la communauté. Les liens externes non certifiés, raccourcisseurs d\'URL, promesses de cadeaux ou demandes de données sensibles sont strictement interdits.',
            'flaggedWords' => $flaggedPhishing
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 2. Détection stricte anti-injures ciblées (sans faux positifs)
    $flaggedProfanities = detectProfanities($rawText);
    if (!empty($flaggedProfanities)) {
        // Enregistrement de l'incident pour les administrateurs et modérateurs
        $logs = [];
        if (file_exists($logsFile)) {
            $rawLogs = @file_get_contents($logsFile);
            if ($rawLogs) {
                $logs = json_decode($rawLogs, true) ?: [];
            }
        }
        $incident = [
            'id' => 'mod_inc_' . time() . '_' . substr(md5(uniqid($ip, true)), 0, 6),
            'type' => 'profanity_detected',
            'timestamp' => time(),
            'date' => date('c'),
            'username' => $cleanUsername,
            'userId' => $userId,
            'steamId' => $steamId,
            'ipHash' => hash('sha256', $ip . '_hoot_mod_salt'),
            'channel' => $channel,
            'flaggedWords' => $flaggedProfanities,
            'originalText' => htmlspecialchars(strip_tags($rawText), ENT_QUOTES, 'UTF-8'),
            'status' => 'warning_issued'
        ];
        $logs[] = $incident;
        if (count($logs) > 200) {
            $logs = array_slice($logs, -200);
        }
        @file_put_contents($logsFile, json_encode($logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'profanity_detected',
            'warning' => '⚠️ Avertissement de modération : Des propos inappropriés ont été détectés dans votre message. Merci de rester courtois et bienveillant dans le sanctuaire Hoot Indie Games.',
            'flaggedWords' => $flaggedProfanities
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Sanitisation stricte anti-XSS
    $cleanText = htmlspecialchars(strip_tags($rawText), ENT_QUOTES, 'UTF-8');

    // Avatar
    $avatarId = trim($body['avatarId'] ?? 'owl');
    if ($isCreator) {
        $avatarId = 'hibouxe_creator';
    } elseif ($avatarId === 'hibouxe_creator' && !$isCreator) {
        $avatarId = 'owl';
    } elseif (!in_array($avatarId, $validAvatars, true) && $avatarId !== 'hibouxe_creator') {
        $avatarId = 'owl';
    }

    // Titre et cadre
    $title = trim($body['title'] ?? ($isCreator ? 'Fondateur du Perchoir' : 'Oisillon du Perchoir'));
    $title = htmlspecialchars(strip_tags($title), ENT_QUOTES, 'UTF-8');
    if (mb_strlen($title, 'UTF-8') > 50) {
        $title = mb_substr($title, 0, 50, 'UTF-8');
    }

    $activeFrame = trim($body['activeFrame'] ?? '');
    $activeFrame = preg_replace('/[^a-zA-Z0-9_\-]/', '', $activeFrame);

    // Catégorie de feedback
    $category = trim($body['category'] ?? 'general');
    if (!in_array($category, $validFeedbackCategories, true)) {
        $category = 'general';
    }

    // Données de score éventuelles (ex: partage de victoire)
    $scoreData = null;
    if (isset($body['scoreData']) && is_array($body['scoreData'])) {
        $scoreData = [
            'game' => htmlspecialchars(strip_tags(substr($body['scoreData']['game'] ?? '', 0, 40)), ENT_QUOTES, 'UTF-8'),
            'score' => (int)($body['scoreData']['score'] ?? 0),
            'mode' => htmlspecialchars(strip_tags(substr($body['scoreData']['mode'] ?? '', 0, 30)), ENT_QUOTES, 'UTF-8')
        ];
    }

    $newMessage = [
        'id' => 'msg_' . time() . '_' . substr(md5(uniqid($ip, true)), 0, 8),
        'channel' => $channel,
        'username' => $cleanUsername,
        'userId' => $userId,
        'steamId' => !empty($steamId) ? $steamId : null,
        'avatarId' => $avatarId,
        'title' => $title,
        'activeFrame' => $activeFrame,
        'text' => $cleanText,
        'timestamp' => time(),
        'isCreator' => $isCreator,
        'isModerator' => $isModerator,
        'category' => $category,
        'scoreData' => $scoreData
    ];

    $data = getChatData($dataFile);
    $data['messages'][] = $newMessage;

    // Pruning : conserver un maximum de 100 messages par canal pour garder le JSON ultra-léger (< 50KB)
    $messagesByChannel = [];
    foreach ($data['messages'] as $m) {
        $c = $m['channel'] ?? 'global';
        if (!isset($messagesByChannel[$c])) {
            $messagesByChannel[$c] = [];
        }
        $messagesByChannel[$c][] = $m;
    }

    $prunedMessages = [];
    foreach ($messagesByChannel as $c => $msgs) {
        if (count($msgs) > 100) {
            $msgs = array_slice($msgs, -100);
        }
        foreach ($msgs as $m) {
            $prunedMessages[] = $m;
        }
    }

    // Trier chronologiquement
    usort($prunedMessages, function($a, $b) {
        return ($a['timestamp'] ?? 0) - ($b['timestamp'] ?? 0);
    });

    $data['messages'] = $prunedMessages;

    @file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

    echo json_encode([
        'success' => true,
        'message' => $newMessage
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// -------------------------------------------------------------
// SUPPRESSION / MODÉRATION D'UN MESSAGE (ADMIN, MODÉRATEUR OU AUTEUR)
// -------------------------------------------------------------
