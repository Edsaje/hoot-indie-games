<?php
/**
 * Test unitaire PHP : user_save_store.php
 */

$apiDir = file_exists(__DIR__ . '/../../public/api') ? __DIR__ . '/../../public/api' : (file_exists(__DIR__ . '/../api') ? __DIR__ . '/../api' : '/var/www/html/api');
require_once $apiDir . '/user_save_store.php';

function test_save_store_sanitize_identifier($assert) {
    // Tentative de Path Traversal
    $malicious1 = '../../etc/passwd';
    $clean1 = sanitizeIdentifier($malicious1);
    $assert($clean1 === 'etcpasswd', 'Path traversal "../../etc/passwd" doit être assaini');

    // Caractères spéciaux et null bytes
    $malicious2 = "admin\0_user!@#$";
    $clean2 = sanitizeIdentifier($malicious2);
    $assert($clean2 === 'admin_user', 'Null bytes et caractères spéciaux doivent être filtrés');

    // SteamID normal
    $cleanSteam = sanitizeIdentifier('76561198035270542');
    $assert($cleanSteam === '76561198035270542', 'SteamID numérique valide doit être préservé');
}

function test_save_store_candidate_resolution($assert) {
    // Simulation d'une session vérifiée
    $_SESSION['verified_steam_id'] = '76561198035270542';

    $identifiers = [
        'steamId' => '76561198035270542',
        'username' => 'Hibouxe',
        'syncKey' => 'sync_abcdef1234567890'
    ];

    $resolved = resolveUserSaveCandidates($identifiers);

    $assert(!empty($resolved['candidateFiles']), 'Des fichiers candidats doivent être générés');
    $firstCandidate = basename($resolved['candidateFiles'][0]);
    $assert($firstCandidate === 'steam_76561198035270542.json', 'Le premier candidat doit être le fichier Steam vérifié');

    // Nettoyage session
    unset($_SESSION['verified_steam_id']);
}

function test_save_store_merge_comprehensive($assert) {
    $existing = [
        'username' => 'Hibouxe',
        'feathers' => ['bonus' => 100, 'spent' => 20],
        'achievements' => ['first_flight'],
        'ownedAppIds' => [105600],
        'syncKeyHash' => hash('sha256', 'super_secret_key')
    ];

    $incoming = [
        'username' => 'Hibouxe',
        'feathers' => ['bonus' => 150, 'spent' => 50],
        'achievements' => ['first_flight', 'collector'],
        'ownedAppIds' => [264710],
    ];

    $merged = mergeComprehensiveSaveData($existing, $incoming, ['strategy' => 'merge']);

    $assert(in_array(105600, $merged['ownedAppIds']) && in_array(264710, $merged['ownedAppIds']), 'Les jeux possédés doivent être fusionnés (union)');
    $assert(in_array('collector', $merged['achievements']), 'Les succès doivent être fusionnés');
    $assert($merged['feathers']['bonus'] === 150, 'Le bonus de plumes le plus élevé doit être conservé');
    $assert($merged['syncKeyHash'] === hash('sha256', 'super_secret_key'), 'Le hash de sécurité doit être conservé');
}
