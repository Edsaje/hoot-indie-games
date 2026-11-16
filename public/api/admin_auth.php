<?php
/**
 * 🦉 Hoot Indie Games — Module Centralisé de Sécurité & d'Authentification Administrateur
 * 
 * Garantit que les opérations sensibles (modération, catalogue, badge créateur, stats)
 * ne peuvent JAMAIS être usurpées par un tiers connaissant le Steam ID public.
 * 
 * Mécanismes de vérification stricts et inviolables :
 * 1. Session PHP authentifiée cryptographiquement via Steam OpenID 2.0 (Valve)
 * 2. Jeton Maître Secret (.admin_pass / en-tête X-Admin-Key)
 */

if (!defined('ADMIN_STEAM_ID')) {
    define('ADMIN_STEAM_ID', '76561198035270542');
}

/**
 * Vérifie si une adresse IP distante provient du réseau certifié de Cloudflare (IPv4)
 */
if (!function_exists('isCloudflareIp')) {
    function isCloudflareIp($ip) {
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            $cfRanges = [
                '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22',
                '141.101.64.0/18', '108.162.192.0/18', '190.93.240.0/20', '188.114.96.0/20',
                '197.234.240.0/22', '198.41.128.0/17', '162.158.0.0/15', '104.16.0.0/13',
                '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22'
            ];
            $longIp = ip2long($ip);
            if ($longIp === false) return false;

            foreach ($cfRanges as $range) {
                list($subnet, $bits) = explode('/', $range);
                $subnetLong = ip2long($subnet);
                $mask = -1 << (32 - (int)$bits);
                if (($longIp & $mask) === ($subnetLong & $mask)) {
                    return true;
                }
            }
            return false;
        } elseif (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
            $cfIpv6 = [
                '2400:cb00::/32', '2606:4700::/32', '2803:f800::/32', '2405:b500::/32',
                '2405:8100::/32', '2a06:98c0::/29', '2c0f:f248::/32'
            ];
            $ipBinary = inet_pton($ip);
            if ($ipBinary === false) return false;
            foreach ($cfIpv6 as $range) {
                list($subnet, $bits) = explode('/', $range);
                $subnetBinary = inet_pton($subnet);
                if ($subnetBinary === false) continue;
                $bits = (int)$bits;
                $bytes = intdiv($bits, 8);
                $remainder = $bits % 8;
                if (substr($ipBinary, 0, $bytes) !== substr($subnetBinary, 0, $bytes)) continue;
                if ($remainder > 0) {
                    $mask = 0xFF << (8 - $remainder);
                    if ((ord($ipBinary[$bytes]) & $mask) !== (ord($subnetBinary[$bytes]) & $mask)) continue;
                }
                return true;
            }
            return false;
        }
        return false;
    }
}

/**
 * Récupère l'IP réelle et fiable du client (Protection anti-usurpation IP CWE-290)
 * On ne fait confiance à CF-Connecting-IP QUE si la requête émane directement de Cloudflare.
 */
if (!function_exists('getAuthClientIp')) {
    function getAuthClientIp() {
        $remoteAddr = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        if (!empty($_SERVER['HTTP_CF_CONNECTING_IP']) && isCloudflareIp($remoteAddr)) {
            $parts = explode(',', $_SERVER['HTTP_CF_CONNECTING_IP']);
            $ip = trim($parts[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
        return $remoteAddr;
    }
}

/**
 * Envoie des en-têtes CORS stricts limités aux domaines explicitement autorisés (CWE-942)
 * Pas de wildcard sur les sous-domaines (protection contre Subdomain Takeover).
 */
if (!function_exists('sendCorsHeaders')) {
    function sendCorsHeaders() {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $allowedOrigins = [
            'https://hootindiegames.com',
            'https://www.hootindiegames.com',
        ];

        // Environnement de développement local sécurisé
        $remoteIp = $_SERVER['REMOTE_ADDR'] ?? '';
        $isLocalDev = in_array($remoteIp, ['127.0.0.1', '::1'], true) || php_sapi_name() === 'cli-server';
        if ($isLocalDev) {
            $allowedOrigins[] = 'http://localhost:5173';
            $allowedOrigins[] = 'http://localhost:3000';
            $allowedOrigins[] = 'http://127.0.0.1:5173';
            $allowedOrigins[] = 'http://127.0.0.1:3000';
        }

        if (in_array($origin, $allowedOrigins, true)) {
            header("Access-Control-Allow-Origin: $origin");
            header('Vary: Origin');
            header('Access-Control-Allow-Credentials: true');
        } else {
            header('Access-Control-Allow-Origin: https://hootindiegames.com');
        }
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Key, X-Sync-Key, X-CSRF-Token');
    }
}

/**
 * Démarre une session PHP sécurisée avec attributs stricts (HttpOnly, SameSite, Secure)
 */
if (!function_exists('startSecureHootSession')) {
    function startSecureHootSession() {
        if (session_status() === PHP_SESSION_NONE) {
            @ini_set('session.cookie_httponly', '1');
            @ini_set('session.cookie_samesite', 'Lax');
            $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
                       (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https') ||
                       (isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443);
            if ($isHttps) {
                @ini_set('session.cookie_secure', '1');
            }
            @session_start();
        }
    }
}

/**
 * Gestion des jetons CSRF pour les formulaires d'administration
 */
if (!function_exists('getAdminCsrfToken')) {
    function getAdminCsrfToken() {
        startSecureHootSession();
        if (empty($_SESSION['admin_csrf_token'])) {
            $_SESSION['admin_csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['admin_csrf_token'];
    }
}

if (!function_exists('extractCsrfTokenFromRequest')) {
    function extractCsrfTokenFromRequest() {
        $token = trim($_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
        if (!empty($token)) {
            return $token;
        }
        // Tentative de lecture depuis le flux JSON brut pour les requêtes POST application/json
        $raw = @file_get_contents('php://input');
        if (!empty($raw)) {
            $json = @json_decode($raw, true);
            if (is_array($json) && !empty($json['csrf_token'])) {
                return trim(strval($json['csrf_token']));
            }
        }
        return '';
    }
}

if (!function_exists('validateAdminCsrfToken')) {
    function validateAdminCsrfToken($token = null) {
        startSecureHootSession();
        if ($token === null || $token === '') {
            $token = extractCsrfTokenFromRequest();
        }
        $expected = $_SESSION['admin_csrf_token'] ?? '';
        return !empty($expected) && !empty($token) && hash_equals($expected, $token);
    }
}

/**
 * Vérifie si la requête actuelle est légitimement autorisée en tant qu'administrateur créateur.
 * Sécurité absolue : Aucun en-tête client (Host, User-Agent, Referer, etc.) ne peut contourner cette vérification.
 */
function isCreatorAdminAuthorized($explicitKey = null) {
    // 1. Session PHP vérifiée (Steam OpenID officiel, session admin ou compte créateur authentifié)
    startSecureHootSession();
    if (!empty($_SESSION['admin_auth']) && $_SESSION['admin_auth'] === true && strval($_SESSION['admin_steam_id'] ?? '') === ADMIN_STEAM_ID) {
        return true;
    }
    $sessionSteam = strval($_SESSION['admin_steam_id'] ?? $_SESSION['verified_steam_id'] ?? $_SESSION['steam_id'] ?? '');
    if ($sessionSteam === ADMIN_STEAM_ID) {
        $_SESSION['admin_auth'] = true;
        $_SESSION['admin_steam_id'] = ADMIN_STEAM_ID;
        return true;
    }
    if (strval($_SESSION['hoot_user_id'] ?? '') === 'admin_hibouxe') {
        $_SESSION['admin_auth'] = true;
        $_SESSION['admin_steam_id'] = ADMIN_STEAM_ID;
        return true;
    }

    // 2. Jeton Maître Secret (.admin_pass) passé via header X-Admin-Key ou paramètre adminKey
    $savesDir = getUserSavesDir();
    $adminPassFile = $savesDir . '/.admin_pass';
    if (!file_exists($adminPassFile) && file_exists(__DIR__ . '/.admin_pass')) {
        @copy(__DIR__ . '/.admin_pass', $adminPassFile);
    }
    if (!file_exists($adminPassFile)) {
        // Génération automatique d'un secret cryptographique fort s'il n'existe pas
        $newPass = bin2hex(random_bytes(32));
        @file_put_contents($adminPassFile, $newPass, LOCK_EX);
        @chmod($adminPassFile, 0600);
    }

    $secret = trim(@file_get_contents($adminPassFile) ?: '');
    if (!empty($secret)) {
        $inputKey = '';
        if (!empty($explicitKey) && is_string($explicitKey)) {
            $inputKey = trim($explicitKey);
        } elseif (!empty($_SERVER['HTTP_X_ADMIN_KEY'])) {
            $inputKey = trim($_SERVER['HTTP_X_ADMIN_KEY']);
        } elseif (!empty($_SERVER['REDIRECT_HTTP_X_ADMIN_KEY'])) {
            $inputKey = trim($_SERVER['REDIRECT_HTTP_X_ADMIN_KEY']);
        } elseif (function_exists('getallheaders')) {
            $headers = getallheaders();
            foreach ($headers as $k => $v) {
                if (strcasecmp($k, 'X-Admin-Key') === 0) {
                    $inputKey = trim($v);
                    break;
                }
            }
        }

        // Si non trouvé dans les en-têtes HTTP, vérifier dans le corps de requête JSON chiffré POST
        if (empty($inputKey) && (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST')) {
            if (!empty($GLOBALS['parsedJsonBody']['adminKey']) && is_string($GLOBALS['parsedJsonBody']['adminKey'])) {
                $inputKey = trim($GLOBALS['parsedJsonBody']['adminKey']);
            } elseif (!empty($_POST['adminKey']) && is_string($_POST['adminKey'])) {
                $inputKey = trim($_POST['adminKey']);
            }
        }

        if (!empty($inputKey) && hash_equals($secret, $inputKey)) {
            return true;
        }
    }

    return false;
}

/**
 * -------------------------------------------------------------
 * 🦉 GESTION PERSISTANTE DU STOCKAGE SOUVERAIN (DOCKER USER_SAVES)
 * -------------------------------------------------------------
 */

if (!function_exists('getUserSavesDir')) {
    function getUserSavesDir() {
        $dir = __DIR__ . '/user_saves';
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
        return $dir;
    }
}

if (!function_exists('getUsernamesStoragePath')) {
    function getUsernamesStoragePath() {
        $savesDir = getUserSavesDir();
        $primary = $savesDir . '/registered_usernames.json';
        if (!file_exists($primary) && file_exists(__DIR__ . '/registered_usernames.json')) {
            @copy(__DIR__ . '/registered_usernames.json', $primary);
        }
        return $primary;
    }
}

if (!function_exists('getModerationBansPath')) {
    function getModerationBansPath() {
        $savesDir = getUserSavesDir();
        $file = $savesDir . '/moderation_bans.json';
        if (!file_exists($file)) {
            $initial = [
                'bannedUsers' => [],
                'roles' => [
                    'hibouxe' => 'admin'
                ]
            ];
            @file_put_contents($file, json_encode($initial, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        }
        return $file;
    }
}

if (!function_exists('normalizeUsernameKey')) {
    function normalizeUsernameKey($name) {
        if (empty($name)) return '';
        $clean = mb_strtolower(trim((string)$name), 'UTF-8');
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
}

if (!function_exists('loadModerationDb')) {
    function loadModerationDb() {
        $file = getModerationBansPath();
        $raw = @file_get_contents($file);
        $data = $raw ? json_decode($raw, true) : null;
        if (!is_array($data)) {
            $data = ['bannedUsers' => [], 'roles' => ['hibouxe' => 'admin']];
        }
        if (!isset($data['bannedUsers']) || !is_array($data['bannedUsers'])) {
            $data['bannedUsers'] = [];
        }
        if (!isset($data['roles']) || !is_array($data['roles'])) {
            $data['roles'] = ['hibouxe' => 'admin'];
        }
        return $data;
    }
}

if (!function_exists('saveModerationDb')) {
    function saveModerationDb(array $data) {
        $file = getModerationBansPath();
        return @file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX) !== false;
    }
}

/**
 * Détermine le rôle d'un joueur dans le système souverain
 */
if (!function_exists('getUserSovereignRole')) {
    function getUserSovereignRole($username, $steamId = null, $userId = null) {
        $cleanUser = normalizeUsernameKey($username);
        $rawLower = strtolower(trim((string)$username));

        // 1. Créateur officiel : seul et unique Administrateur
        if (isCreatorAdminAuthorized() || ($cleanUser === 'hibouxe' && strval($steamId) === ADMIN_STEAM_ID)) {
            return 'admin';
        }

        // Les noms protégés ne peuvent jamais obtenir de rôle via requête client
        if (in_array($cleanUser, ['edsaje', 'hibouxe'], true)) {
            return 'user';
        }

        // 2. Base de modération dédiée (moderation_bans.json)
        $modDb = loadModerationDb();
        if (!empty($cleanUser) && isset($modDb['roles'][$cleanUser])) {
            $r = $modDb['roles'][$cleanUser];
            if (in_array($r, ['moderator', 'vip', 'user'], true)) {
                return $r;
            }
        }
        if (!empty($rawLower) && isset($modDb['roles'][$rawLower])) {
            $r = $modDb['roles'][$rawLower];
            if (in_array($r, ['moderator', 'vip', 'user'], true)) {
                return $r;
            }
        }

        // 3. Base des pseudonymes (registered_usernames.json)
        $uFile = getUsernamesStoragePath();
        if (file_exists($uFile)) {
            $raw = @file_get_contents($uFile);
            $uData = $raw ? json_decode($raw, true) : null;
            if (is_array($uData)) {
                $entry = $uData['usernames'][$cleanUser] ?? ($uData['usernames'][$rawLower] ?? null);
                if ($entry) {
                    $r = $entry['role'] ?? 'user';
                    if ($r === 'admin') $r = 'user'; // seul hibouxe officiel est admin
                    return $r;
                }
            }
        }

        return 'user';
    }
}

/**
 * Vérifie de manière robuste si un compte est suspendu ou banni
 */
if (!function_exists('checkIsUserBanned')) {
    function checkIsUserBanned($username, $userId = null, $steamId = null, $ip = null) {
        $cleanUser = normalizeUsernameKey($username);
        $rawLower = strtolower(trim((string)$username));

        // Le créateur officiel ne peut JAMAIS être banni
        if ($cleanUser === 'hibouxe' || strval($steamId) === ADMIN_STEAM_ID) {
            return ['banned' => false];
        }

        $modDb = loadModerationDb();

        // 1. Vérification dans moderation_bans.json par pseudo normalisé ou brut
        $b = null;
        if (!empty($cleanUser) && isset($modDb['bannedUsers'][$cleanUser])) {
            $b = $modDb['bannedUsers'][$cleanUser];
        } elseif (!empty($rawLower) && isset($modDb['bannedUsers'][$rawLower])) {
            $b = $modDb['bannedUsers'][$rawLower];
        }

        if ($b) {
            return [
                'banned' => true,
                'reason' => $b['reason'] ?? 'Compte suspendu par la modération.',
                'bannedAt' => $b['bannedAt'] ?? time(),
                'bannedBy' => $b['bannedBy'] ?? 'Staff'
            ];
        }

        // 2. Vérification par userId
        if (!empty($userId)) {
            foreach ($modDb['bannedUsers'] as $b) {
                if (!empty($b['userId']) && $b['userId'] === $userId) {
                    return [
                        'banned' => true,
                        'reason' => $b['reason'] ?? 'Compte suspendu par la modération.',
                        'bannedAt' => $b['bannedAt'] ?? time(),
                        'bannedBy' => $b['bannedBy'] ?? 'Staff'
                    ];
                }
            }
        }

        // 3. Vérification par steamId
        if (!empty($steamId)) {
            $st = strval($steamId);
            foreach ($modDb['bannedUsers'] as $b) {
                if (!empty($b['steamId']) && strval($b['steamId']) === $st) {
                    return [
                        'banned' => true,
                        'reason' => $b['reason'] ?? 'Compte suspendu par la modération.',
                        'bannedAt' => $b['bannedAt'] ?? time(),
                        'bannedBy' => $b['bannedBy'] ?? 'Staff'
                    ];
                }
            }
        }

        // 4. Vérification dans registered_usernames.json
        $uFile = getUsernamesStoragePath();
        if (file_exists($uFile)) {
            $raw = @file_get_contents($uFile);
            $uData = $raw ? json_decode($raw, true) : null;
            if (is_array($uData)) {
                // Dans la liste bannedUsers
                if (!empty($uData['bannedUsers']) && is_array($uData['bannedUsers'])) {
                    if ((!empty($steamId) && in_array(strval($steamId), $uData['bannedUsers'], true)) ||
                        (!empty($userId) && in_array($userId, $uData['bannedUsers'], true))) {
                        return [
                            'banned' => true,
                            'reason' => 'Compte suspendu par la modération.',
                            'bannedAt' => time(),
                            'bannedBy' => 'Admin'
                        ];
                    }
                }
                // Dans l'entrée du pseudo
                if (!empty($cleanUser) && isset($uData['usernames'][$cleanUser])) {
                    $entry = $uData['usernames'][$cleanUser];
                    if (($entry['status'] ?? '') === 'banned' || !empty($entry['isBanned'])) {
                        return [
                            'banned' => true,
                            'reason' => $entry['banReason'] ?? 'Compte suspendu par la modération.',
                            'bannedAt' => $entry['bannedAt'] ?? time(),
                            'bannedBy' => 'Admin'
                        ];
                    }
                }
            }
        }

        return ['banned' => false];
    }
}

