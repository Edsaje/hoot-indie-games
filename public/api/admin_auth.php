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
 * Récupère l'IP réelle et fiable du client (Protection anti-usurpation IP CWE-290)
 * On ne fait confiance à CF-Connecting-IP que si présent. Sinon, seule REMOTE_ADDR est fiable.
 */
if (!function_exists('getAuthClientIp')) {
    function getAuthClientIp() {
        if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
            $parts = explode(',', $_SERVER['HTTP_CF_CONNECTING_IP']);
            $ip = trim($parts[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
        return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    }
}

/**
 * Envoie des en-têtes CORS stricts limités aux domaines autorisés (CWE-942)
 */
if (!function_exists('sendCorsHeaders')) {
    function sendCorsHeaders() {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $isAllowed = false;

        if (!empty($origin)) {
            $parsed = parse_url($origin);
            $host = $parsed['host'] ?? '';
            if (
                $host === 'hootindiegames.com' ||
                $host === 'www.hootindiegames.com' ||
                (is_string($host) && substr($host, -18) === '.hootindiegames.com') ||
                $host === 'localhost' ||
                $host === '127.0.0.1'
            ) {
                $isAllowed = true;
            }
        }

        if ($isAllowed && !empty($origin)) {
            header("Access-Control-Allow-Origin: $origin");
            header('Vary: Origin');
            header('Access-Control-Allow-Credentials: true');
        } else {
            header('Access-Control-Allow-Origin: https://hootindiegames.com');
            header('Access-Control-Allow-Credentials: true');
        }
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Key, X-Sync-Key');
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
        $inputKey = trim($_SERVER['HTTP_X_ADMIN_KEY'] ?? $_REQUEST['adminKey'] ?? '');
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
