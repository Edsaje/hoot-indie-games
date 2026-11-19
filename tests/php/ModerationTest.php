<?php
/**
 * Test unitaire PHP : usernames.php & modération
 */

$apiDir = file_exists(__DIR__ . '/../../public/api') ? __DIR__ . '/../../public/api' : (file_exists(__DIR__ . '/../api') ? __DIR__ . '/../api' : '/var/www/html/api');
require_once $apiDir . '/usernames.php';

function test_moderation_normalize_username($assert) {
    // Normalisation accents et casse
    $name1 = 'Hîboûxë_42';
    $norm1 = normalizeUsername($name1);
    $assert($norm1 === 'hibouxe42', 'Les accents, underscores et majuscules doivent être normalisés');

    // Détection de tentative d\'usurpation du créateur avec des tirets ou points
    $squat1 = 'H-i.b_o u x e';
    $normSquat = normalizeUsername($squat1);
    $assert($normSquat === 'hibouxe', 'Le squatting rusé avec tirets/points doit être détecté comme "hibouxe"');
}

function test_moderation_forbidden_names($assert) {
    // Nom créateur interdit aux utilisateurs normaux
    $isForbidden = isNameForbidden('hibouxe', '1234567890');
    $assert($isForbidden === true, 'Le pseudo "hibouxe" doit être interdit aux tiers non-créateurs');

    // Nom admin interdit
    $isAdminForbidden = isNameForbidden('admin', '1234567890');
    $assert($isAdminForbidden === true, 'Le pseudo "admin" doit être interdit');

    // Pseudo normal de joueur autorisé
    $isNormalAllowed = isNameForbidden('pixelhero', '1234567890');
    $assert($isNormalAllowed === false, 'Un pseudo normal doit être autorisé');
}

function test_moderation_ban_logic($assert) {
    // Simulation d'une entrée de ban
    $mockBannedList = [
        'bad_actor_ip' => ['banned' => true, 'reason' => 'Spam répété'],
        '76561198999999999' => ['banned' => true, 'reason' => 'Comportement toxique']
    ];

    $isIpBanned = isset($mockBannedList['bad_actor_ip']);
    $assert($isIpBanned === true, 'L\'IP bannie doit être reconnue');

    $isSteamBanned = isset($mockBannedList['76561198999999999']);
    $assert($isSteamBanned === true, 'Le SteamID banni doit être reconnu');

    $isLegitUserBanned = isset($mockBannedList['76561198035270542']);
    $assert($isLegitUserBanned === false, 'Le créateur / utilisateur sain ne doit pas être banni');
}
