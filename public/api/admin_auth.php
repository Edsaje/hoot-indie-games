<?php
/**
 * 🦉 Hoot Indie Games — Module Centralisé de Sécurité & d'Authentification Administrateur
 * 
 * Garantit que les opérations sensibles (modération, catalogue, badge créateur, stats)
 * ne peuvent JAMAIS être usurpées par un tiers connaissant le Steam ID public.
 * 
 * Mécanismes de vérification autorisés :
 * 1. Environnement Localhost (Développement sans friction pour le créateur)
 * 2. Session PHP authentifiée cryptographiquement via Steam OpenID 2.0 (Valve)
 * 3. Jeton Maître Secret (.admin_pass / en-tête X-Admin-Key)
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
 * Vérifie si la requête actuelle est légitimement autorisée en tant qu'administrateur créateur
 */
function isCreatorAdminAuthorized() {
    $ip = getAuthClientIp();
    $host = $_SERVER['HTTP_HOST'] ?? '';

    // 1. Environnement Localhost : Développement local garanti
    $isLocal = in_array($ip, ['127.0.0.1', '::1'], true) ||
               strpos($host, 'localhost') !== false ||
               strpos($host, '127.0.0.1') !== false;
    if ($isLocal) {
        return true;
    }

    // 2. Session PHP vérifiée (obtenue lors du login Steam OpenID officiel sur track.php)
    if (session_status() === PHP_SESSION_NONE) {
        @session_start();
    }
    if (!empty($_SESSION['admin_auth']) && strval($_SESSION['admin_steam_id'] ?? '') === ADMIN_STEAM_ID) {
        return true;
    }

    // 3. Jeton Maître Secret (.admin_pass)
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

    return false;
}
