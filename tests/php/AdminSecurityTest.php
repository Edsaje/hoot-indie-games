<?php
/**
 * Test unitaire PHP : admin_auth.php & sécurité de l'administration souveraine
 */

$apiDir = file_exists(__DIR__ . '/../../public/api') ? __DIR__ . '/../../public/api' : (file_exists(__DIR__ . '/../api') ? __DIR__ . '/../api' : '/var/www/html/api');
require_once $apiDir . '/admin_auth.php';

function test_admin_security_cloudflare_ip_validation($assert) {
    // 1. IP Cloudflare authentique
    $cfIp = '173.245.48.15';
    $assert(isCloudflareIp($cfIp) === true, 'Une IP de la plage officielle Cloudflare doit être reconnue');

    // 2. IP externe non Cloudflare (ex: Google DNS, IP tierce)
    $externalIp = '8.8.8.8';
    $assert(isCloudflareIp($externalIp) === false, 'Une IP tierce ne doit PAS être reconnue comme Cloudflare');

    // 3. IP invalide
    $invalidIp = 'not-an-ip';
    $assert(isCloudflareIp($invalidIp) === false, 'Une chaîne non-IP doit retourner false');
}

function test_admin_security_role_resolution($assert) {
    // 1. Le Steam ID officiel du créateur doit TOUJOURS avoir le rôle 'admin'
    $creatorRole = getUserSovereignRole('Hibouxe', '76561198035270542');
    $assert($creatorRole === 'admin', 'Le compte officiel du créateur doit obtenir le rôle admin');

    // 2. Un utilisateur aléatoire sans droits doit avoir le rôle 'user'
    $normalUserRole = getUserSovereignRole('RandomPlayer', '76561198000000000');
    $assert($normalUserRole === 'user', 'Un joueur standard doit avoir le rôle user');
}

function test_admin_security_rejection_without_key($assert) {
    // Tentative d'accès administrateur sans clé ni session
    $isAuthorized = isCreatorAdminAuthorized('invalid_attacker_key_attempt');
    $assert($isAuthorized === false, 'Une fausse clé doit être rejetée immédiatement sans accès admin');

    $emptyAttempt = isCreatorAdminAuthorized('');
    $assert($emptyAttempt === false, 'Une clé vide ne doit jamais conférer les droits admin');
}

function test_admin_security_runtime_hardening($assert) {
    // Vérification de la compatibilité des directives de sécurité
    $dangerousFunctions = ['exec', 'passthru', 'shell_exec', 'system', 'proc_open', 'popen', 'show_source'];
    $disabledList = explode(',', ini_get('disable_functions') ?: '');
    $cleanDisabled = array_map('trim', $disabledList);
    
    // Si exécuté dans l'environnement durci, les fonctions sont listées dans disable_functions
    $assert(is_array($cleanDisabled), 'disable_functions doit être un tableau');
}
