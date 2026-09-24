<?php
/**
 * 🦉 Hoot Indie Games — Backend API Souverain de Tchat & Messagerie Communautaire
 * 
 * Rôles :
 * 1. Salons publics communautaires en direct ("Le Perchoir") :
 *    - Salon Global international
 *    - Salons dédiés par langue (FR, EN, ES, DE, JA, PT-BR)
 * 2. Espace dédié "Retours & Feedback" (Suggestions, Bugs, Idées, Coups de cœur)
 * 3. Partage de victoires / scores certifiés
 * 4. Protection anti-XSS stricte, rate-limiting IP, modération et verrouillage atomique LOCK_EX
 */

ini_set('display_errors', 0);
error_reporting(0);

// Headers de sécurité HTTP stricts
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

require_once __DIR__ . '/admin_auth.php';
$dataFile = __DIR__ . '/chat_messages.json';
$rateLimitFile = __DIR__ . '/chat_ratelimit.json';

// Whitelist des salons autorisés
$validChannels = ['global', 'fr', 'en', 'es', 'de', 'ja', 'pt-BR', 'feedback'];

// Whitelist des catégories de feedback
$validFeedbackCategories = ['suggestion', 'bug', 'idea', 'love', 'general'];

// Whitelist des avatars reconnus
$validAvatars = [
    'hibouxe_creator', 'owl_wood', 'owl_golden', 'owl_emerald', 'owl_neon', 'owl_shadow', 'owl_cyber', 'owl_cosmic', 'owl_snow',
    'owl', 'knight', 'madeline', 'zagreus', 'lamb', 'joker', 'cat', 'goose',
    'shovel_knight', 'sans', 'cuphead', 'isaac', 'penitent', 'beheaded', 'niko',
    'meat_boy', 'baba', 'hornet', 'omori', 'claire', 'drifter', 'slugcat',
    'golden_sylvestre', 'celestial_knight', 'golden_hornet', 'retro_ghost'
];

// Récupération IP client
function getClientIp() {
    $headers = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    foreach ($headers as $h) {
        if (!empty($_SERVER[$h])) {
            $parts = explode(',', $_SERVER[$h]);
            $ip = trim($parts[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
}

// Vérification du rate-limit (max 1 message toutes les 2.5 secondes, max 25 messages par 5 min)
function checkRateLimit($rateLimitFile, $ip) {
    $now = microtime(true);
    $limits = [];
    if (file_exists($rateLimitFile)) {
        $raw = @file_get_contents($rateLimitFile);
        if ($raw) {
            $limits = json_decode($raw, true) ?: [];
        }
    }

    $ipKey = md5($ip . '_hoot_chat_salt');
    // Nettoyer les entrées de plus de 10 minutes
    foreach ($limits as $k => $data) {
        if ($now - ($data['lastTime'] ?? 0) > 600) {
            unset($limits[$k]);
        }
    }

    if (!isset($limits[$ipKey])) {
        $limits[$ipKey] = [
            'count' => 1,
            'lastTime' => $now,
            'windowStart' => $now
        ];
    } else {
        $last = $limits[$ipKey]['lastTime'] ?? 0;
        // Délais minimum entre 2 messages (2.5s)
        if (($now - $last) < 2.5) {
            return false;
        }

        // Fenêtre de 5 minutes
        if ($now - ($limits[$ipKey]['windowStart'] ?? 0) > 300) {
            $limits[$ipKey]['count'] = 1;
            $limits[$ipKey]['windowStart'] = $now;
        } else {
            $limits[$ipKey]['count']++;
            if ($limits[$ipKey]['count'] > 25) {
                @file_put_contents($rateLimitFile, json_encode($limits), LOCK_EX);
                return false;
            }
        }
        $limits[$ipKey]['lastTime'] = $now;
    }

    @file_put_contents($rateLimitFile, json_encode($limits), LOCK_EX);
    return true;
}

// Détection ciblée des insultes réelles (anti-faux positifs / pas de censure de mots légitimes)
function detectProfanities($text) {
    $patterns = [
        'connard' => '/\bconnard[se]?\b/iu',
        'connasse' => '/\bconnasse[s]?\b/iu',
        'salope' => '/\bsalope[s]?\b/iu',
        'pute' => '/\b(pute[s]?|fils de pute|fdp)\b/iu',
        'enculé' => '/\bencul[eé]e?s?\b/iu',
        'nique' => '/\bnique[rz]? (ta |vos |sa |leur )/iu',
        'bâtard' => '/\bb[aâ]tard[es]?\b/iu',
        'pouffiasse' => '/\bpouffiasse[s]?\b/iu',
        'tocard' => '/\btocard[se]?\b/iu',
        'grosse merde' => '/\bgrosse? merde\b/iu',
        'propos haineux' => '/\b(nigger[s]?|faggot[s]?|chink[s]?|sale nazi)\b/iu',
    ];

    $flagged = [];
    foreach ($patterns as $label => $pattern) {
        if (preg_match($pattern, $text)) {
            $flagged[] = $label;
        }
    }
    return $flagged;
}

// Helpers de compatibilité chaînes
function strEndsWithCompat($haystack, $needle) {
    $length = strlen($needle);
    return $length === 0 || (substr($haystack, -$length) === $needle);
}
function strContainsCompat($haystack, $needle) {
    return strpos($haystack, $needle) !== false;
}

// -------------------------------------------------------------
// DÉTECTION ROBUSTE ANTI-HAMEÇONNAGE & PROTECTION DU TCHAT
// -------------------------------------------------------------
function detectPhishingAndSuspiciousLinks($text, $isStaff = false) {
    $flagged = [];

    // 1. Détection de domaines de phishing et typosquatting (Faux Steam, Faux Discord, etc.)
    $phishingDomains = [
        'faux_domaine_steam' => '/\b(steamcommuni[tl]y|steamcomun[tl]y|steamcommnunity|steamcomunity|steam-community|steancommunity|steam-powered|steampowered-[a-z0-9]|steam-gift|steamgift|steam-wallet|steamwallet|steamtrade|steam-trade|steam-promo|steampromo|steamlevelu|steam-giveaway|steamcommunity-trade|steam-direct|steam-code|steamcard|steam-login|steam-bonus)\b/iu',
        'faux_domaine_discord' => '/\b(discorcl|dlscord|discrod|discord-nitro|discordnitro|discord-gift|discordgift|discord-free|discord-app\.net|discord-airdrop|free-nitro)\b/iu',
        'raccourcisseur_ou_ip_logger' => '/\b(grabify\.(link|icu)|iplogger\.(org|com|ru)|2no\.co|yip\.su|bit\.ly|tinyurl\.com|t\.co|cutt\.ly|is\.gd|ow\.ly|rebrand\.ly|shorturl\.at|adf\.ly|shorte\.st|shink\.me|v\.gd|bc\.vc|clck\.ru)\b/iu',
        'extension_tld_suspecte' => '/https?:\/\/[^\s\/$.?#].[^\s]*\.(xyz|top|click|buzz|zip|mov|fit|rest|tk|ml|ga|cf|gq|cc|su)\b/iu',
        'invitation_externe_inconnue' => '/\b(t\.me\/|telegram\.me\/|discord\.gg\/[a-z0-9]+|chat\.whatsapp\.com\/)/iu',
    ];

    foreach ($phishingDomains as $key => $pattern) {
        if (preg_match($pattern, $text)) {
            $flagged[] = $key;
        }
    }

    // 2. Mots-clés et scénarios typiques d'hameçonnage / ingénierie sociale
    $scamPatterns = [
        'arnaque_carte_steam_gratuite' => '/\b(free steam (gift|card|wallet|code|key|game)|carte steam gratuite|code steam gratuit|free nitro|nitro gratuit|giveaway 50\$|50€ steam|carte 100€|claim your (gift|reward|nitro|card)|r[eé]clame ton cadeau|gagne 50€|free v-bucks|robux gratuit|steam promo)\b/iu',
        'arnaque_vote_tournoi' => '/\b(vote for my (team|csgo|cs2|tournament|clan)|vote pour mon [eé]quipe|tournoi csgo|sign up for tournament|rejoins ma team tournoi)\b/iu',
        'lien_echange_steam_suspect' => '/\b(tradeoffer\/new\/\?partner=|steamcommunity\.com\/tradeoffer)\b/iu',
        'divulgation_donnees_sensibles' => '/\b(steam guard[:\s]+[a-z0-9]{4,6}|(mon )?mot de passe (est|:)|my password is|mdp\s*:\s*[^\s]{4,}|code steam guard)\b/iu',
    ];

    foreach ($scamPatterns as $key => $pattern) {
        if (preg_match($pattern, $text)) {
            $flagged[] = $key;
        }
    }

    if (!empty($flagged)) {
        return $flagged;
    }

    // 3. Contrôle des liens pour les utilisateurs réguliers (non-staff)
    if (!$isStaff) {
        $hasUrl = preg_match('/(https?:\/\/|www\.)[^\s]+/iu', $text) || preg_match('/\b[a-z0-9\-]+\.(com|org|net|fr|io|gg|ru|co|biz|info)\b/iu', $text);
        if ($hasUrl) {
            preg_match_all('/https?:\/\/[^\s]+/iu', $text, $matches);
            $urls = $matches[0] ?? [];

            if (empty($urls)) {
                $flagged[] = 'domaine_non_autorise';
                return $flagged;
            }

            $allowedDomains = [
                'store.steampowered.com',
                'steamcommunity.com',
                'itch.io',
                'youtube.com',
                'youtu.be',
            ];

            foreach ($urls as $url) {
                $parsed = parse_url($url);
                $host = strtolower($parsed['host'] ?? '');
                $path = strtolower($parsed['path'] ?? '');

                $isAllowed = false;
                foreach ($allowedDomains as $allowed) {
                    if ($host === $allowed || strEndsWithCompat($host, '.' . $allowed)) {
                        $isAllowed = true;
                        break;
                    }
                }

                // Pour steamcommunity.com, interdire les pages de trade offer / login
                if ($host === 'steamcommunity.com' || strEndsWithCompat($host, '.steamcommunity.com')) {
                    if (strContainsCompat($path, 'tradeoffer') || strContainsCompat($path, 'login')) {
                        $flagged[] = 'lien_trade_ou_login_steam';
                        return $flagged;
                    }
                }

                if (!$isAllowed) {
                    $flagged[] = 'lien_externe_non_autorise';
                    return $flagged;
                }
            }
        }
    }

    return $flagged;
}

// Vérifie si un utilisateur est Administrateur ou Modérateur
function checkIsUserAdminOrModerator($steamId, $userId, $username = '') {
    if (isCreatorAdminAuthorized()) {
        return ['authorized' => true, 'role' => 'admin'];
    }
    if (!empty($steamId) && strval($steamId) === ADMIN_STEAM_ID) {
        if (isCreatorAdminAuthorized()) return ['authorized' => true, 'role' => 'admin'];
    }
    $uFile = __DIR__ . '/registered_usernames.json';
    if (file_exists($uFile)) {
        $raw = @file_get_contents($uFile);
        if ($raw) {
            $db = json_decode($raw, true);
            if (isset($db['usernames']) && is_array($db['usernames'])) {
                foreach ($db['usernames'] as $u) {
                    $match = (!empty($steamId) && strval($u['steamId'] ?? '') === strval($steamId))
                          || (!empty($userId) && strval($u['userId'] ?? '') === strval($userId))
                          || (!empty($username) && strtolower($u['displayName'] ?? '') === strtolower($username));
                    if ($match) {
                        $role = $u['role'] ?? 'user';
                        if ($role === 'admin' || $role === 'moderator') {
                            return ['authorized' => true, 'role' => $role];
                        }
                    }
                }
            }
        }
    }
    return ['authorized' => false, 'role' => 'user'];
}

// Initialisation du fichier de données s'il n'existe pas
function getChatData($dataFile) {
    if (!file_exists($dataFile)) {
        $initial = [
            'messages' => [
                [
                    'id' => 'msg_welcome_perchoir',
                    'channel' => 'global',
                    'username' => 'Hibouxe',
                    'avatarId' => 'hibouxe_creator',
                    'title' => 'Fondateur du Perchoir',
                    'activeFrame' => 'golden_border',
                    'text' => 'Bienvenue sur Le Perchoir ! Échangez sur vos pépites préférées et partagez vos records. 🦉✨',
                    'timestamp' => time() - 3600,
                    'isCreator' => true,
                    'category' => 'general'
                ],
                [
                    'id' => 'msg_welcome_feedback',
                    'channel' => 'feedback',
                    'username' => 'Hibouxe',
                    'avatarId' => 'hibouxe_creator',
                    'title' => 'Fondateur du Perchoir',
                    'activeFrame' => 'golden_border',
                    'text' => 'Partagez ici vos idées, retours et suggestions pour faire grandir le sanctuaire Hoot Indie Games !',
                    'timestamp' => time() - 3500,
                    'isCreator' => true,
                    'category' => 'suggestion'
                ]
            ]
        ];
        @file_put_contents($dataFile, json_encode($initial, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        return $initial;
    }

    $raw = @file_get_contents($dataFile);
    if (!$raw) {
        return ['messages' => []];
    }
    $decoded = json_decode($raw, true);
    if (!is_array($decoded) || !isset($decoded['messages'])) {
        return ['messages' => []];
    }
    return $decoded;
}

// Traitement des requêtes
$method = $_SERVER['REQUEST_METHOD'];
$action = $_REQUEST['action'] ?? ($method === 'POST' ? 'send_message' : 'get_messages');

if ($action === 'get_messages') {
    $channel = trim($_REQUEST['channel'] ?? 'all');
    $since = (int)($_REQUEST['since'] ?? 0);
    $limit = min(100, max(1, (int)($_REQUEST['limit'] ?? 50)));

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

    // Vérifier le rate limiting
    if (!checkRateLimit($rateLimitFile, $ip)) {
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'error' => 'Veuillez patienter quelques secondes avant d\'envoyer un nouveau message.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Récupérer les données POST (JSON ou form-data)
    $inputJson = file_get_contents('php://input');
    $body = json_decode($inputJson, true) ?: $_POST;

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

    $isCreator = false;
    $isModerator = false;
    $normUser = mb_strtolower($cleanUsername, 'UTF-8');

    // Vérification des privilèges admin & modérateur
    $authInfo = checkIsUserAdminOrModerator($steamId, $userId, $cleanUsername);
    if ($authInfo['role'] === 'moderator') {
        $isModerator = true;
    }

    // Vérification stricte du statut Créateur souverain (anti-spoofing)
    $hasAuthorizedCreatorRights = isCreatorAdminAuthorized();
    if ($hasAuthorizedCreatorRights && ($steamId === ADMIN_STEAM_ID || in_array($normUser, ['hibouxe', 'edsaje'], true) || $authInfo['role'] === 'admin')) {
        $isCreator = true;
        $cleanUsername = 'Hibouxe';
    } else if (in_array($normUser, ['hibouxe', 'edsaje'], true)) {
        // Interdiction absolue d'usurpation de l'identité du fondateur
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
        $logsFile = __DIR__ . '/chat_moderation_logs.json';
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
        $logsFile = __DIR__ . '/chat_moderation_logs.json';
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
    if ($avatarId === 'hibouxe_creator' && !$isCreator) {
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
// SUPPRESSION / MODÉRATION D'UN MESSAGE (ADMIN OU MODÉRATEUR)
// -------------------------------------------------------------
if ($action === 'delete_message') {
    $inputJson = file_get_contents('php://input');
    $body = json_decode($inputJson, true) ?: $_POST;

    $messageId = trim($body['messageId'] ?? $_REQUEST['messageId'] ?? '');
    $steamId = trim($body['steamId'] ?? $_REQUEST['steamId'] ?? '');
    $userId = trim($body['userId'] ?? $_REQUEST['userId'] ?? '');

    $auth = checkIsUserAdminOrModerator($steamId, $userId);
    if (!$auth['authorized']) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'forbidden', 'message' => 'Accès modérateur ou administrateur requis.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (empty($messageId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'missing_id', 'message' => 'Identifiant du message requis.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $data = getChatData($dataFile);
    $found = false;
    foreach ($data['messages'] as &$m) {
        if (($m['id'] ?? '') === $messageId) {
            $m['isDeleted'] = true;
            $m['text'] = '[Message retiré par la modération]';
            $m['scoreData'] = null;
            $found = true;
            break;
        }
    }
    unset($m);

    if ($found) {
        @file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        echo json_encode(['success' => true, 'messageId' => $messageId, 'message' => 'Message modéré avec succès.'], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'not_found', 'message' => 'Message introuvable.'], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// -------------------------------------------------------------
// JOURNAL DES INCIDENTS ANTI-INJURES (ADMIN OU MODÉRATEUR)
// -------------------------------------------------------------
if ($action === 'get_moderation_logs') {
    $steamId = trim($_REQUEST['steamId'] ?? '');
    $userId = trim($_REQUEST['userId'] ?? '');

    $auth = checkIsUserAdminOrModerator($steamId, $userId);
    if (!$auth['authorized']) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'forbidden'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $logsFile = __DIR__ . '/chat_moderation_logs.json';
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
    $steamId = trim($_REQUEST['steamId'] ?? '');
    $userId = trim($_REQUEST['userId'] ?? '');
    $logId = trim($_REQUEST['logId'] ?? '');

    $auth = checkIsUserAdminOrModerator($steamId, $userId);
    if (!$auth['authorized']) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'forbidden'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $logsFile = __DIR__ . '/chat_moderation_logs.json';
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

echo json_encode(['error' => 'Action inconnue'], JSON_UNESCAPED_UNICODE);
