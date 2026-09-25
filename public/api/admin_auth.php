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
 * Gestion des jetons CSRF pour les formulaires d'administration
 */
if (!function_exists('getAdminCsrfToken')) {
    function getAdminCsrfToken() {
        if (session_status() === PHP_SESSION_NONE) {
            @session_start();
        }
        if (empty($_SESSION['admin_csrf_token'])) {
            $_SESSION['admin_csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['admin_csrf_token'];
    }
}

if (!function_exists('validateAdminCsrfToken')) {
    function validateAdminCsrfToken($token) {
        if (session_status() === PHP_SESSION_NONE) {
            @session_start();
        }
        $expected = $_SESSION['admin_csrf_token'] ?? '';
        return !empty($expected) && !empty($token) && hash_equals($expected, $token);
    }
}

/**
 * Vérifie si la requête actuelle est légitimement autorisée en tant qu'administrateur créateur.
 * Sécurité absolue : Aucun en-tête client (Host, User-Agent, Referer, etc.) ne peut contourner cette vérification.
 */
function isCreatorAdminAuthorized() {
    // 1. Session PHP vérifiée (obtenue lors du login Steam OpenID officiel sur track.php validé par Valve)
    if (session_status() === PHP_SESSION_NONE) {
        @session_start();
    }
    if (!empty($_SESSION['admin_auth']) && strval($_SESSION['admin_steam_id'] ?? '') === ADMIN_STEAM_ID) {
        return true;
    }

    // 2. Jeton Maître Secret (.admin_pass) passé via header X-Admin-Key ou paramètre adminKey
    $adminPassFile = __DIR__ . '/.admin_pass';
    if (!file_exists($adminPassFile)) {
        // Génération automatique d'un secret cryptographique fort s'il n'existe pas
        $newPass = bin2hex(random_bytes(32));
        @file_put_contents($adminPassFile, $newPass, LOCK_EX);
        @chmod($adminPassFile, 0600);
    }

    $secret = trim(@file_get_contents($adminPassFile) ?: '');
    if (!empty($secret)) {
        // [CWE-598] Seul l'en-tête HTTP X-Admin-Key est autorisé (interdiction stricte des paramètres d'URL GET/POST)
        $inputKey = trim($_SERVER['HTTP_X_ADMIN_KEY'] ?? '');
        if (!empty($inputKey) && hash_equals($secret, $inputKey)) {
            return true;
        }
    }

    // 3. Uniquement si strictement en CLI server local de dev (sans proxy externe)
    $remoteIp = $_SERVER['REMOTE_ADDR'] ?? '';
    $hasForwardedIp = !empty($_SERVER['HTTP_CF_CONNECTING_IP']) || !empty($_SERVER['HTTP_X_FORWARDED_FOR']);
    if (!$hasForwardedIp && in_array($remoteIp, ['127.0.0.1', '::1'], true) && php_sapi_name() === 'cli-server') {
        return true;
    }

    return false;
}
