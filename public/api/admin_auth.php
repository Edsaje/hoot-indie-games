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
        $_SESSION['hoot_user_id'] = 'admin_hibouxe';
        return true;
    }
    if (strval($_SESSION['hoot_user_id'] ?? '') === 'admin_hibouxe') {
        $_SESSION['admin_auth'] = true;
        $_SESSION['admin_steam_id'] = ADMIN_STEAM_ID;
        return true;
    }
    if (strtolower(strval($_SESSION['hoot_user_email'] ?? '')) === 'quentin.beaud@hotmail.fr') {
        $_SESSION['admin_auth'] = true;
        $_SESSION['admin_steam_id'] = ADMIN_STEAM_ID;
        $_SESSION['hoot_user_id'] = 'admin_hibouxe';
        return true;
    }

    // Vérification via .accounts.json pour l'utilisateur en session
    $sessionUserId = strval($_SESSION['hoot_user_id'] ?? '');
    $savesDir = getUserSavesDir();
    $accountsFile = $savesDir . '/.accounts.json';
    if (!empty($sessionUserId) && file_exists($accountsFile)) {
        $accRaw = @file_get_contents($accountsFile);
        if ($accRaw) {
            $accData = json_decode($accRaw, true);
            if (is_array($accData) && isset($accData['users'][$sessionUserId])) {
                $accUser = $accData['users'][$sessionUserId];
                $accEmail = strtolower(strval($accUser['email'] ?? ''));
                $accSteam = strval($accUser['steamId'] ?? '');
                $accName  = strtolower(strval($accUser['username'] ?? ''));
                $accRole  = strval($accUser['role'] ?? '');
                if ($accEmail === 'quentin.beaud@hotmail.fr' || $accSteam === ADMIN_STEAM_ID || $accName === 'hibouxe' || $accRole === 'admin') {
                    $_SESSION['admin_auth'] = true;
                    $_SESSION['admin_steam_id'] = ADMIN_STEAM_ID;
                    $_SESSION['hoot_user_id'] = 'admin_hibouxe';
                    return true;
                }
            }
        }
    }

    // 2. Jeton Maître Secret (.admin_pass) passé via header X-Admin-Key ou paramètre adminKey
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

        // Si non trouvé dans les en-têtes HTTP, vérifier dans le corps de requête POST ou variables globales
        if (empty($inputKey)) {
            if (!empty($GLOBALS['parsedJsonBody']['adminKey']) && is_string($GLOBALS['parsedJsonBody']['adminKey'])) {
                $inputKey = trim($GLOBALS['parsedJsonBody']['adminKey']);
            } elseif (!empty($_POST['adminKey']) && is_string($_POST['adminKey'])) {
                $inputKey = trim($_POST['adminKey']);
            } elseif (!empty($_REQUEST['adminKey']) && is_string($_REQUEST['adminKey'])) {
                $inputKey = trim($_REQUEST['adminKey']);
            } else {
                $rawIn = @file_get_contents('php://input');
                if (!empty($rawIn)) {
                    $dec = @json_decode($rawIn, true);
                    if (is_array($dec) && !empty($dec['adminKey']) && is_string($dec['adminKey'])) {
                        $inputKey = trim($dec['adminKey']);
                    }
                }
            }
        }

        if (!empty($inputKey) && hash_equals($secret, $inputKey)) {
            $_SESSION['admin_auth'] = true;
            $_SESSION['admin_steam_id'] = ADMIN_STEAM_ID;
            $_SESSION['hoot_user_id'] = 'admin_hibouxe';
            return true;
        }
    }

    // 3. Jeton de Synchronisation Cloud Souverain du Créateur (user_admin_hibouxe.json)
    $hibouxeSaveFile = $savesDir . '/user_admin_hibouxe.json';
    if (file_exists($hibouxeSaveFile)) {
        $rawSave = @file_get_contents($hibouxeSaveFile);
        if ($rawSave) {
            $saveData = @json_decode($rawSave, true);
            if (is_array($saveData)) {
                $masterSyncKey = trim(strval($saveData['syncKey'] ?? ''));
                $masterSyncHash = trim(strval($saveData['syncKeyHash'] ?? ''));

                $inputSyncKey = '';
                if (!empty($_SERVER['HTTP_X_SYNC_KEY'])) {
                    $inputSyncKey = trim($_SERVER['HTTP_X_SYNC_KEY']);
                } elseif (!empty($_SERVER['REDIRECT_HTTP_X_SYNC_KEY'])) {
                    $inputSyncKey = trim($_SERVER['REDIRECT_HTTP_X_SYNC_KEY']);
                } elseif (function_exists('getallheaders')) {
                    $headers = getallheaders();
                    foreach ($headers as $k => $v) {
                        if (strcasecmp($k, 'X-Sync-Key') === 0) {
                            $inputSyncKey = trim($v);
                            break;
                        }
                    }
                }

                if (empty($inputSyncKey)) {
                    if (!empty($GLOBALS['parsedJsonBody']['syncKey']) && is_string($GLOBALS['parsedJsonBody']['syncKey'])) {
                        $inputSyncKey = trim($GLOBALS['parsedJsonBody']['syncKey']);
                    } elseif (!empty($_POST['syncKey']) && is_string($_POST['syncKey'])) {
                        $inputSyncKey = trim($_POST['syncKey']);
                    } elseif (!empty($_REQUEST['syncKey']) && is_string($_REQUEST['syncKey'])) {
                        $inputSyncKey = trim($_REQUEST['syncKey']);
                    } else {
                        $rawIn = @file_get_contents('php://input');
                        if (!empty($rawIn)) {
                            $dec = @json_decode($rawIn, true);
                            if (is_array($dec) && !empty($dec['syncKey']) && is_string($dec['syncKey'])) {
                                $inputSyncKey = trim($dec['syncKey']);
                            }
                        }
                    }
                }

                if (!empty($inputSyncKey)) {
                    $isSyncKeyValid = (!empty($masterSyncKey) && hash_equals($masterSyncKey, $inputSyncKey)) ||
                                      (!empty($masterSyncHash) && hash_equals($masterSyncHash, hash('sha256', $inputSyncKey)));
                    if ($isSyncKeyValid) {
                        $_SESSION['admin_auth'] = true;
                        $_SESSION['admin_steam_id'] = ADMIN_STEAM_ID;
                        $_SESSION['hoot_user_id'] = 'admin_hibouxe';
                        return true;
                    }
                }
            }
        }
    }

    return false;
}

if (!function_exists('getAdminMasterKey')) {
    function getAdminMasterKey() {
        $savesDir = getUserSavesDir();
        $adminPassFile = $savesDir . '/.admin_pass';
        if (file_exists($adminPassFile)) {
            return trim(@file_get_contents($adminPassFile) ?: '');
        }
        return '';
    }
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

/**
 * -------------------------------------------------------------
 * 🦉 SYNCHRONISATION UNIVERSELLE DU CERCLE D'AMIS DU CRÉATEUR
 * -------------------------------------------------------------
 */

if (!function_exists('getFriendsDatabasePath')) {
    function getFriendsDatabasePath() {
        $savesDir = getUserSavesDir();
        $primary = $savesDir . '/friends_data.json';
        if (!file_exists($primary) && file_exists(__DIR__ . '/friends_data.json')) {
            @copy(__DIR__ . '/friends_data.json', $primary);
        }
        return $primary;
    }
}

if (!function_exists('ensureUserInFriendsDatabase')) {
    function ensureUserInFriendsDatabase($user) {
        if (!is_array($user)) return null;

        $userId = strval($user['id'] ?? ($user['userId'] ?? ''));
        $steamId = !empty($user['steamId']) ? strval($user['steamId']) : null;
        $username = trim(strval($user['username'] ?? ''));
        $email = strtolower(trim(strval($user['email'] ?? '')));
        $avatarId = preg_replace('/[^a-z0-9_]/', '', strval($user['avatarId'] ?? 'owl')) ?: 'owl';
        $title = mb_substr(htmlspecialchars(strval($user['title'] ?? 'Oisillon du Perchoir'), ENT_QUOTES, 'UTF-8'), 0, 40) ?: 'Oisillon du Perchoir';

        $cleanNorm = normalizeUsernameKey($username);

        // Le créateur officiel utilise toujours HOOT-HIBOU
        if ($cleanNorm === 'hibouxe' || $cleanNorm === 'edsaje' || $steamId === ADMIN_STEAM_ID || $userId === 'admin_hibouxe' || $email === 'quentin.beaud@hotmail.fr') {
            return 'HOOT-HIBOU';
        }

        $dataFile = getFriendsDatabasePath();
        $db = null;
        if (file_exists($dataFile)) {
            $raw = @file_get_contents($dataFile);
            if ($raw) $db = json_decode($raw, true);
        }
        if (!is_array($db) || !isset($db['players'])) {
            $db = [
                'players' => [
                    'HOOT-HIBOU' => [
                        'friendCode' => 'HOOT-HIBOU',
                        'username' => 'Hibouxe',
                        'avatarId' => 'hibouxe_creator',
                        'title' => '👑 Fondateur du Perchoir',
                        'steamId' => ADMIN_STEAM_ID,
                        'elo' => 1500,
                        'streak' => 120,
                        'lastActive' => gmdate('Y-m-d\TH:i:s\Z'),
                        'isCreator' => true,
                    ]
                ],
                'usernameToCode' => ['hibouxe' => 'HOOT-HIBOU', 'edsaje' => 'HOOT-HIBOU'],
                'steamToCode' => [ADMIN_STEAM_ID => 'HOOT-HIBOU'],
                'friendships' => ['HOOT-HIBOU' => []],
                'requests' => []
            ];
        }

        $matchedCode = null;
        if (!empty($cleanNorm) && isset($db['usernameToCode'][$cleanNorm])) {
            $matchedCode = $db['usernameToCode'][$cleanNorm];
        } elseif (!empty($steamId) && isset($db['steamToCode'][$steamId])) {
            $matchedCode = $db['steamToCode'][$steamId];
        } else {
            foreach ($db['players'] as $c => $p) {
                if (!empty($userId) && !empty($p['userId']) && $p['userId'] === $userId) {
                    $matchedCode = $c;
                    break;
                }
                if (!empty($steamId) && !empty($p['steamId']) && strval($p['steamId']) === $steamId) {
                    $matchedCode = $c;
                    break;
                }
                if (!empty($cleanNorm) && normalizeUsernameKey($p['username'] ?? '') === $cleanNorm) {
                    $matchedCode = $c;
                    break;
                }
            }
        }

        $chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
        if (!$matchedCode) {
            for ($attempts = 0; $attempts < 100; $attempts++) {
                $cand = 'HOOT-';
                for ($j = 0; $j < 4; $j++) {
                    $cand .= $chars[random_int(0, strlen($chars) - 1)];
                }
                if ($cand !== 'HOOT-HIBOU' && !isset($db['players'][$cand])) {
                    $matchedCode = $cand;
                    break;
                }
            }
            if (!$matchedCode) {
                $matchedCode = 'HOOT-' . strtoupper(substr(md5(uniqid('', true)), 0, 4));
            }

            $cleanUsername = !empty($username) ? mb_substr(htmlspecialchars($username, ENT_QUOTES, 'UTF-8'), 0, 24) : 'Explorateur';
            $db['players'][$matchedCode] = [
                'friendCode' => $matchedCode,
                'username' => $cleanUsername,
                'avatarId' => $avatarId,
                'title' => $title,
                'steamId' => $steamId,
                'userId' => $userId ?: null,
                'elo' => 1000,
                'streak' => 0,
                'lastActive' => gmdate('Y-m-d\TH:i:s\Z'),
                'isOnline' => false,
                'dailyScores' => [
                    'date' => gmdate('Y-m-d'),
                    'totalWonToday' => 0,
                    'screenle' => ['status' => 'unplayed'],
                    'indledle' => ['status' => 'unplayed'],
                    'linkle' => ['status' => 'unplayed'],
                    'profille' => ['status' => 'unplayed'],
                    'chrono' => ['status' => 'unplayed'],
                    'pixel' => ['status' => 'unplayed'],
                    'review' => ['status' => 'unplayed'],
                    'blindtest' => ['status' => 'unplayed'],
                ]
            ];
        } else {
            if (!empty($userId) && empty($db['players'][$matchedCode]['userId'])) {
                $db['players'][$matchedCode]['userId'] = $userId;
            }
            if (!empty($steamId) && empty($db['players'][$matchedCode]['steamId'])) {
                $db['players'][$matchedCode]['steamId'] = $steamId;
            }
            if (!empty($avatarId) && ($db['players'][$matchedCode]['avatarId'] ?? 'owl') === 'owl' && $avatarId !== 'owl') {
                $db['players'][$matchedCode]['avatarId'] = $avatarId;
            }
        }

        if (!empty($cleanNorm)) {
            $db['usernameToCode'][$cleanNorm] = $matchedCode;
        }
        if (!empty($steamId)) {
            $db['steamToCode'][$steamId] = $matchedCode;
        }

        // Amitié réciproque automatique avec HOOT-HIBOU
        if (!isset($db['friendships'][$matchedCode])) {
            $db['friendships'][$matchedCode] = [];
        }
        if (!in_array('HOOT-HIBOU', $db['friendships'][$matchedCode], true)) {
            $db['friendships'][$matchedCode][] = 'HOOT-HIBOU';
        }
        if (!isset($db['friendships']['HOOT-HIBOU'])) {
            $db['friendships']['HOOT-HIBOU'] = [];
        }
        if (!in_array($matchedCode, $db['friendships']['HOOT-HIBOU'], true)) {
            $db['friendships']['HOOT-HIBOU'][] = $matchedCode;
        }

        @file_put_contents($dataFile, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        return $matchedCode;
    }
}

if (!function_exists('reconcileAllAccountsWithCreatorFriends')) {
    function reconcileAllAccountsWithCreatorFriends(&$db, $dataFile = null, $force = false) {
        if (!is_array($db)) return false;
        if ($dataFile === null) {
            $dataFile = getFriendsDatabasePath();
        }

        if (!isset($db['players']) || !is_array($db['players'])) $db['players'] = [];
        if (!isset($db['friendships']) || !is_array($db['friendships'])) $db['friendships'] = [];
        if (!isset($db['friendships']['HOOT-HIBOU']) || !is_array($db['friendships']['HOOT-HIBOU'])) $db['friendships']['HOOT-HIBOU'] = [];
        if (!isset($db['usernameToCode']) || !is_array($db['usernameToCode'])) $db['usernameToCode'] = [];
        if (!isset($db['steamToCode']) || !is_array($db['steamToCode'])) $db['steamToCode'] = [];

        $dirty = false;
        $now = time();
        $lastReconciled = intval($db['lastReconciledAt'] ?? 0);
        $shouldScanFiles = $force || ($now - $lastReconciled > 30);

        if ($shouldScanFiles) {
            $db['lastReconciledAt'] = $now;
            $chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

            $generateCode = function() use (&$db, $chars) {
                for ($attempts = 0; $attempts < 100; $attempts++) {
                    $code = 'HOOT-';
                    for ($j = 0; $j < 4; $j++) {
                        $code .= $chars[random_int(0, strlen($chars) - 1)];
                    }
                    if ($code !== 'HOOT-HIBOU' && !isset($db['players'][$code])) {
                        return $code;
                    }
                }
                return 'HOOT-' . strtoupper(substr(md5(uniqid('', true)), 0, 4));
            };

            $findCode = function($userId, $steamId, $username) use (&$db) {
                $norm = normalizeUsernameKey($username);
                if (!empty($norm) && isset($db['usernameToCode'][$norm])) {
                    return $db['usernameToCode'][$norm];
                }
                if (!empty($steamId) && isset($db['steamToCode'][$steamId])) {
                    return $db['steamToCode'][$steamId];
                }
                foreach ($db['players'] as $c => $p) {
                    if (!empty($userId) && !empty($p['userId']) && $p['userId'] === $userId) return $c;
                    if (!empty($steamId) && !empty($p['steamId']) && strval($p['steamId']) === strval($steamId)) return $c;
                    if (!empty($norm) && normalizeUsernameKey($p['username'] ?? '') === $norm) return $c;
                }
                return null;
            };

            $addOrUpdate = function($userId, $steamId, $username, $avatarId = null, $title = null) use (&$db, &$dirty, $generateCode, $findCode) {
                $norm = normalizeUsernameKey($username);
                if ($norm === 'hibouxe' || $norm === 'edsaje' || strval($steamId) === ADMIN_STEAM_ID || $userId === 'admin_hibouxe') {
                    return 'HOOT-HIBOU';
                }
                if (empty($username) && empty($userId) && empty($steamId)) {
                    return null;
                }

                $code = $findCode($userId, $steamId, $username);
                if (!$code) {
                    $code = $generateCode();
                    $cleanUsername = !empty($username) ? mb_substr(htmlspecialchars($username, ENT_QUOTES, 'UTF-8'), 0, 24) : 'Explorateur';
                    $db['players'][$code] = [
                        'friendCode' => $code,
                        'username' => $cleanUsername,
                        'avatarId' => !empty($avatarId) ? preg_replace('/[^a-z0-9_]/', '', $avatarId) : 'owl',
                        'title' => !empty($title) ? mb_substr(htmlspecialchars($title, ENT_QUOTES, 'UTF-8'), 0, 40) : 'Oisillon du Perchoir',
                        'steamId' => !empty($steamId) ? strval($steamId) : null,
                        'userId' => !empty($userId) ? strval($userId) : null,
                        'elo' => 1000,
                        'streak' => 0,
                        'lastActive' => gmdate('Y-m-d\TH:i:s\Z'),
                        'isOnline' => false,
                        'dailyScores' => [
                            'date' => gmdate('Y-m-d'),
                            'totalWonToday' => 0,
                            'screenle' => ['status' => 'unplayed'],
                            'indledle' => ['status' => 'unplayed'],
                            'linkle' => ['status' => 'unplayed'],
                            'profille' => ['status' => 'unplayed'],
                            'chrono' => ['status' => 'unplayed'],
                            'pixel' => ['status' => 'unplayed'],
                            'review' => ['status' => 'unplayed'],
                            'blindtest' => ['status' => 'unplayed'],
                        ]
                    ];
                    $dirty = true;
                } else {
                    if (!empty($userId) && empty($db['players'][$code]['userId'])) {
                        $db['players'][$code]['userId'] = $userId;
                        $dirty = true;
                    }
                    if (!empty($steamId) && empty($db['players'][$code]['steamId'])) {
                        $db['players'][$code]['steamId'] = strval($steamId);
                        $dirty = true;
                    }
                    if (!empty($avatarId) && ($db['players'][$code]['avatarId'] ?? 'owl') === 'owl' && $avatarId !== 'owl') {
                        $db['players'][$code]['avatarId'] = $avatarId;
                        $dirty = true;
                    }
                }

                if (!empty($norm) && (!isset($db['usernameToCode'][$norm]) || $db['usernameToCode'][$norm] !== $code)) {
                    $db['usernameToCode'][$norm] = $code;
                    $dirty = true;
                }
                if (!empty($steamId) && (!isset($db['steamToCode'][$steamId]) || $db['steamToCode'][$steamId] !== $code)) {
                    $db['steamToCode'][$steamId] = $code;
                    $dirty = true;
                }

                return $code;
            };

            $savesDir = getUserSavesDir();

            // 1. Réconciliation .accounts.json
            $accountsFile = $savesDir . '/.accounts.json';
            if (file_exists($accountsFile)) {
                $raw = @file_get_contents($accountsFile);
                if ($raw) {
                    $acc = @json_decode($raw, true);
                    if (is_array($acc) && !empty($acc['users']) && is_array($acc['users'])) {
                        foreach ($acc['users'] as $uId => $u) {
                            $uEmail = strtolower(strval($u['email'] ?? ''));
                            $uSteam = strval($u['steamId'] ?? '');
                            $uName = strval($u['username'] ?? '');
                            if ($uEmail === 'quentin.beaud@hotmail.fr' || $uSteam === ADMIN_STEAM_ID || $uId === 'admin_hibouxe') {
                                continue;
                            }
                            $addOrUpdate($uId, $uSteam, $uName, $u['avatarId'] ?? null, $u['title'] ?? null);
                        }
                    }
                }
            }

            // 2. Réconciliation registered_usernames.json
            $uFile = getUsernamesStoragePath();
            if (file_exists($uFile)) {
                $raw = @file_get_contents($uFile);
                if ($raw) {
                    $uData = @json_decode($raw, true);
                    if (is_array($uData) && !empty($uData['usernames']) && is_array($uData['usernames'])) {
                        foreach ($uData['usernames'] as $uname => $info) {
                            $normName = normalizeUsernameKey($uname);
                            if ($normName === 'hibouxe' || $normName === 'edsaje') continue;
                            $st = !empty($info['steamId']) ? strval($info['steamId']) : null;
                            if ($st === ADMIN_STEAM_ID) continue;
                            $uid = !empty($info['userId']) ? strval($info['userId']) : null;
                            if ($uid === 'admin_hibouxe') continue;
                            $dName = $info['displayName'] ?? $uname;
                            $addOrUpdate($uid, $st, $dName);
                        }
                    }
                }
            }

            // 3. Réconciliation user_saves/*.json
            if (is_dir($savesDir)) {
                $files = @scandir($savesDir);
                if (is_array($files)) {
                    foreach ($files as $f) {
                        if ($f === '.' || $f === '..' || substr($f, -5) !== '.json') continue;
                        if ($f === 'user_admin_hibouxe.json' || $f === 'steam_' . ADMIN_STEAM_ID . '.json') continue;
                        if (strpos($f, 'user_') === 0 || strpos($f, 'steam_') === 0) {
                            $saveRaw = @file_get_contents($savesDir . '/' . $f);
                            if ($saveRaw) {
                                $sData = @json_decode($saveRaw, true);
                                if (is_array($sData) && !empty($sData['username']) && $sData['username'] !== 'Hibou Mystère') {
                                    $uid = !empty($sData['userId']) ? strval($sData['userId']) : (strpos($f, 'user_') === 0 ? substr($f, 5, -5) : null);
                                    $st = !empty($sData['steamId']) ? strval($sData['steamId']) : (strpos($f, 'steam_') === 0 ? substr($f, 6, -5) : null);
                                    if ($st === ADMIN_STEAM_ID || $uid === 'admin_hibouxe' || normalizeUsernameKey($sData['username']) === 'hibouxe') continue;
                                    $addOrUpdate($uid, $st, $sData['username'], $sData['avatarId'] ?? null, $sData['title'] ?? null);
                                }
                            }
                        }
                    }
                }
            }
        }

        // 4. GARANTIE D'AMITIÉ MUTUELLE AVEC HOOT-HIBOU POUR TOUS LES COMPTES
        foreach ($db['players'] as $code => $p) {
            if ($code === 'HOOT-HIBOU') continue;

            // Ajouter le joueur dans la liste d'amis de Hibouxe
            if (!in_array($code, $db['friendships']['HOOT-HIBOU'], true)) {
                $db['friendships']['HOOT-HIBOU'][] = $code;
                $dirty = true;
            }

            // Ajouter Hibouxe dans la liste d'amis du joueur
            if (!isset($db['friendships'][$code])) {
                $db['friendships'][$code] = [];
            }
            if (!in_array('HOOT-HIBOU', $db['friendships'][$code], true)) {
                $db['friendships'][$code][] = 'HOOT-HIBOU';
                $dirty = true;
            }
        }

        if ($dirty && !empty($dataFile)) {
            @file_put_contents($dataFile, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        }
        return $dirty;
    }
}

