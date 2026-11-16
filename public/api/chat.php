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
require_once __DIR__ . '/admin_auth.php';
sendCorsHeaders();
if (session_status() === PHP_SESSION_NONE) {
    @ini_set('session.cookie_httponly', 1);
    @ini_set('session.cookie_samesite', 'Lax');
    @session_start();
}
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$savesDir = getUserSavesDir();
$dataFile = $savesDir . '/chat_messages.json';
$rateLimitFile = $savesDir . '/chat_ratelimit.json';
$logsFile = $savesDir . '/chat_moderation_logs.json';
$privateDataFile = $savesDir . '/chat_private_messages.json';
$moderationFile = getModerationBansPath();
$usernamesFile = getUsernamesStoragePath();

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

// Récupération IP client fiable (sans spoofing X-Forwarded-For)
function getClientIp() {
    return getAuthClientIp();
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

// Normalisation robuste du pseudonyme (insensible à la casse, accents et séparateurs)
function normalizeChatUsername($name) {
    if (empty($name)) return '';
    $clean = mb_strtolower(trim($name), 'UTF-8');
    $transliterator = [
        'à'=>'a', 'á'=>'a', 'â'=>'a', 'ã'=>'a', 'ä'=>'a', 'å'=>'a',
        'è'=>'e', 'é'=>'e', 'ê'=>'e', 'ë'=>'e',
        'ì'=>'i', 'í'=>'i', 'î'=>'i', 'ï'=>'i',
        'ò'=>'o', 'ó'=>'o', 'ô'=>'o', 'õ'=>'o', 'ö'=>'o',
        'ù'=>'u', 'ú'=>'u', 'û'=>'u', 'ü'=>'u',
        'ý'=>'y', 'ÿ'=>'y', 'ç'=>'c', 'ñ'=>'n'
    ];
    $clean = strtr($clean, $transliterator);
    return preg_replace('/[^a-z0-9]/', '', $clean);
}

// Vérifie si un utilisateur est Administrateur ou Modérateur de manière stricte et certifiée
function checkIsUserAdminOrModerator($steamId, $userId, $username = '', $email = '') {
    // 1. Administrateur Créateur officiel : UNIQUEMENT via session OpenID Valve ou X-Admin-Key maître
    if (isCreatorAdminAuthorized()) {
        return ['authorized' => true, 'role' => 'admin'];
    }

    $normUser = normalizeChatUsername($username);

    // Sécurité stricte : Les pseudonymes protégés ne peuvent JAMAIS obtenir de droits via le client
    if (in_array($normUser, ['edsaje', 'hibouxe'], true)) {
        return ['authorized' => false, 'role' => 'user'];
    }

    // 2. Modérateurs enregistrés : vérification obligatoire contre la session serveur ou identifiant certifié
    if (session_status() === PHP_SESSION_NONE) {
        @session_start();
    }
    $sessionSteam = strval($_SESSION['admin_steam_id'] ?? $_SESSION['verified_steam_id'] ?? $_SESSION['steam_id'] ?? '');

    $targetRole = getUserSovereignRole($normUser, $steamId, $userId);
    if ($targetRole === 'moderator') {
        $uFile = getUsernamesStoragePath();
        if (file_exists($uFile)) {
            $raw = @file_get_contents($uFile);
            if ($raw) {
                $uData = json_decode($raw, true);
                if (is_array($uData) && isset($uData['usernames'][$normUser])) {
                    $entry = $uData['usernames'][$normUser];
                    $regSteam = strval($entry['steamId'] ?? '');
                    $regUser = strval($entry['userId'] ?? '');
                    if ((!empty($sessionSteam) && $sessionSteam === $regSteam) ||
                        (!empty($regSteam) && strval($steamId) === $regSteam) ||
                        (!empty($regUser) && $regUser === $userId)) {
                        return ['authorized' => true, 'role' => 'moderator'];
                    }
                }
            }
        }

        $modDb = loadModerationDb();
        if (($modDb['roles'][$normUser] ?? '') === 'moderator') {
            return ['authorized' => true, 'role' => 'moderator'];
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

    // Rétablissement automatique du pseudo officiel Hibouxe pour les messages du créateur
    $needsSave = false;
    foreach ($decoded['messages'] as &$m) {
        $msgSteam = $m['steamId'] ?? '';
        $msgTitle = $m['title'] ?? '';
        $msgAvatar = $m['avatarId'] ?? '';
        $isMsgCreator = !empty($m['isCreator']) || $msgSteam === ADMIN_STEAM_ID || $msgAvatar === 'hibouxe_creator' || stripos($msgTitle, 'Créateur') !== false;

        if ($isMsgCreator && strpos($m['username'] ?? '', 'Explorateur_') === 0) {
            $m['username'] = 'Hibouxe';
            $m['avatarId'] = 'hibouxe_creator';
            $m['isCreator'] = true;
            $needsSave = true;
        }
    }
    unset($m);

    if ($needsSave) {
        @file_put_contents($dataFile, json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    }

    return $decoded;
}

// Traitement des requêtes
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$inputJson = file_get_contents('php://input');
$jsonBody = !empty($inputJson) ? (json_decode($inputJson, true) ?: []) : [];
$body = !empty($jsonBody) ? array_merge($_POST, $jsonBody) : $_POST;

$action = $_GET['action'] ?? $_POST['action'] ?? $jsonBody['action'] ?? $_REQUEST['action'] ?? ($method === 'POST' ? 'send_message' : 'get_messages');

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
// ACTIONS DE MESSAGERIE PRIVÉE (DM SOUVERAIN)
// =============================================================

function loadPrivateMessages($file) {
    if (!file_exists($file)) return [];
    $raw = @file_get_contents($file);
    if (!$raw) return [];
    $dec = json_decode($raw, true);
    return is_array($dec) ? $dec : [];
}

function savePrivateMessages($file, array $msgs) {
    // Garder les 3000 derniers messages privés
    if (count($msgs) > 3000) {
        $msgs = array_slice($msgs, -3000);
    }
    return @file_put_contents($file, json_encode($msgs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX) !== false;
}

// -------------------------------------------------------------
// LISTER LES CONVERSATIONS PRIVÉES D'UN UTILISATEUR
// -------------------------------------------------------------
if ($action === 'fetch_private_conversations') {
    $cleanUsername = trim($_REQUEST['username'] ?? $jsonBody['username'] ?? '');
    if (empty($cleanUsername) || $cleanUsername === 'Hibou Mystère') {
        echo json_encode(['success' => true, 'conversations' => [], 'totalUnread' => 0, 'serverTime' => time()]);
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

echo json_encode(['error' => 'Action inconnue'], JSON_UNESCAPED_UNICODE);
