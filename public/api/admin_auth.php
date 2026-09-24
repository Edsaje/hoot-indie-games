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
 * Récupère l'IP réelle du client
 */
if (!function_exists('getAuthClientIp')) {
    function getAuthClientIp() {
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
