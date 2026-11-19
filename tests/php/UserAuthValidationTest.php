<?php
/**
 * Test unitaire PHP : user_auth.php & sécurité des comptes et mots de passe
 */

$apiDir = file_exists(__DIR__ . '/../../public/api') ? __DIR__ . '/../../public/api' : (file_exists(__DIR__ . '/../api') ? __DIR__ . '/../api' : '/var/www/html/api');
require_once $apiDir . '/user_auth.php';

function test_user_auth_account_sanitization($assert) {
    $rawAccount = [
        'id' => 'user_abc123',
        'username' => 'OwlGamer',
        'email' => 'gamer@hootindiegames.com',
        'passwordHash' => password_hash('SecretPassword123!', PASSWORD_BCRYPT),
        'verificationTokenHash' => hash('sha256', 'token-link-xyz'),
        'verificationOtpHash' => hash('sha256', '123456'),
        'role' => 'user',
        'emailVerified' => true,
        'createdAt' => '2026-11-19T10:00:00Z',
    ];

    $sanitized = sanitizeAccountForClient($rawAccount);

    $assert(!isset($sanitized['passwordHash']), 'Le hash du mot de passe doit être supprimé pour le client');
    $assert(!isset($sanitized['verificationTokenHash']), 'Le hash du token de lien doit être supprimé');
    $assert(!isset($sanitized['verificationOtpHash']), 'Le hash de l’OTP doit être supprimé');
    $assert($sanitized['id'] === 'user_abc123', 'L’identifiant public doit être préservé');
    $assert($sanitized['username'] === 'OwlGamer', 'Le nom d’utilisateur doit être préservé');
    $assert($sanitized['email'] === 'gamer@hootindiegames.com', 'L’email doit être préservé');
    $assert($sanitized['emailVerified'] === true, 'Le statut de vérification doit être préservé');
}

function test_user_auth_normalize_account($assert) {
    // 1. Compte sans emailVerified explicite -> rétrocompatibilité emailVerified = true
    $legacyAccount = [
        'id' => 'user_legacy',
        'username' => 'OldOwl',
    ];

    normalizeAccount($legacyAccount);
    $assert($legacyAccount['emailVerified'] === true, 'Un compte legacy doit être normalisé avec emailVerified = true');

    // 2. Compte avec emailVerified = 0 (ou false)
    $unverifiedAccount = [
        'id' => 'user_new',
        'username' => 'YoungOwl',
        'emailVerified' => 0,
    ];

    normalizeAccount($unverifiedAccount);
    $assert($unverifiedAccount['emailVerified'] === false, 'Un compte non vérifié doit avoir emailVerified = false');
}

function test_user_auth_password_hashing($assert) {
    $plainPassword = 'MySecureMasterPassword@2026';
    $hash = password_hash($plainPassword, PASSWORD_BCRYPT);

    $assert(password_verify($plainPassword, $hash), 'Le bon mot de passe doit être validé par Bcrypt');
    $assert(!password_verify('WrongPassword', $hash), 'Un mauvais mot de passe doit être rejeté');
    $assert(!password_verify(substr($plainPassword, 0, -1), $hash), 'Un mot de passe incomplet doit être rejeté');
}

function test_user_auth_rate_limiting($assert) {
    $tempRateLimitFile = sys_get_temp_dir() . '/test_rate_limits_' . uniqid() . '.json';
    $testIpHash = 'test_ip_hash_' . uniqid();

    // 15 premières tentatives autorisées
    for ($i = 1; $i <= 15; $i++) {
        $allowed = checkAuthRateLimit($testIpHash, $tempRateLimitFile);
        $assert($allowed === true, "La tentative {$i} doit être autorisée");
    }

    // 16ème tentative bloquée
    $blocked = checkAuthRateLimit($testIpHash, $tempRateLimitFile);
    $assert($blocked === false, 'La 16ème tentative doit être bloquée par le rate limiter anti-bruteforce');

    @unlink($tempRateLimitFile);
}
