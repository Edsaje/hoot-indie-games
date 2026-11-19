<?php
/**
 * 🦉 Hoot Indie Games — Chat Helpers & Utilities
 */

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
if (!function_exists('getClientIp')) {
    function getClientIp() {
        return getAuthClientIp();
    }
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

// Vérifie si la session actuelle est légitime et autorisée pour un pseudonyme donné (Protection Anti-Usurpation MP)
function isCallerAuthorizedForUsername($username) {
    if (isCreatorAdminAuthorized()) return true;
    $norm = normalizeChatUsername($username);
    if (empty($norm) || $norm === 'hiboumystere') return false;
    if (in_array($norm, ['hibouxe', 'edsaje'], true)) {
        return isCreatorAdminAuthorized();
    }

    $sessionUserId = $_SESSION['hoot_user_id'] ?? null;
    $sessionSteam = strval($_SESSION['verified_steam_id'] ?? $_SESSION['steam_id'] ?? $_SESSION['admin_steam_id'] ?? '');

    // Si aucune session active
    if (empty($sessionUserId) && empty($sessionSteam)) {
        return false;
    }

    // 1. Vérification dans .accounts.json pour la session courante
    $accountsFile = getUserSavesDir() . '/.accounts.json';
    if (file_exists($accountsFile) && !empty($sessionUserId)) {
        $rawA = @file_get_contents($accountsFile);
        if ($rawA) {
            $accData = json_decode($rawA, true);
            if (isset($accData['users'][$sessionUserId])) {
                $uName = normalizeChatUsername($accData['users'][$sessionUserId]['username'] ?? '');
                if ($uName === $norm) {
                    return true;
                }
            }
        }
    }

    // 2. Vérification dans registered_usernames.json
    $uFile = getUsernamesStoragePath();
    if (file_exists($uFile)) {
        $raw = @file_get_contents($uFile);
        if ($raw) {
            $data = json_decode($raw, true);
            if (is_array($data) && isset($data['usernames'][$norm])) {
                $entry = $data['usernames'][$norm];
                $regSteam = strval($entry['steamId'] ?? '');
                $regUser = strval($entry['userId'] ?? '');
                if (!empty($regSteam) && $sessionSteam === $regSteam) {
                    return true;
                }
                if (!empty($regUser) && $sessionUserId === $regUser) {
                    return true;
                }
                // Si l'entrée existe pour ce pseudo mais ne correspond pas à la session : Refus catégorique
                return false;
            }
        }
    }

    // 3. Cas des joueurs Steam par défaut (sans compte email ni pseudo personnalisé)
    if (!empty($sessionSteam)) {
        $expectedSteamNick = normalizeChatUsername('Explorateur_' . substr($sessionSteam, -4));
        if ($norm === $expectedSteamNick) {
            return true;
        }
    }

    // [DÉFENSE PAR DÉFAUT CWE-285] Refus systématique si aucune correspondance positive certifiée
    return false;
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

