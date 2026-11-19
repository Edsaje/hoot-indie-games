<?php
/**
 * Test unitaire PHP : Réconciliation bidirectionnelle des comptes, amis & dashboard admin
 */

$apiDir = file_exists(__DIR__ . '/../../public/api') ? __DIR__ . '/../../public/api' : (file_exists(__DIR__ . '/../api') ? __DIR__ . '/../api' : '/var/www/html/api');
require_once $apiDir . '/admin_auth.php';

function test_reconciliation_seeds_moineau($assert) {
    $tempDir = sys_get_temp_dir() . '/hoot_test_recon_' . uniqid();
    @mkdir($tempDir, 0755, true);

    $origSaves = $GLOBALS['test_override_user_saves_dir'] ?? null;
    $GLOBALS['test_override_user_saves_dir'] = $tempDir;

    $friendsFile = $tempDir . '/friends_data.json';
    $accountsFile = $tempDir . '/.accounts.json';
    $usernamesFile = $tempDir . '/registered_usernames.json';

    $db = [];
    $res = reconcileAllAccountsWithCreatorFriends($db, $friendsFile, true);

    $assert(isset($db['players']['HOOT-MOIN']), 'Moineau doit être présente dans les joueurs');
    $assert($db['players']['HOOT-MOIN']['username'] === 'Moineau', 'Le pseudo de Moineau doit être Moineau');
    $assert(in_array('HOOT-MOIN', $db['friendships']['HOOT-HIBOU'], true), 'Hibouxe doit avoir Moineau en ami');
    $assert(in_array('HOOT-HIBOU', $db['friendships']['HOOT-MOIN'], true), 'Moineau doit avoir Hibouxe en ami');

    // Vérification .accounts.json
    $accRaw = @file_get_contents($accountsFile);
    $acc = json_decode($accRaw, true);
    $assert(isset($acc['users']['user_moineau_official']), 'Le compte Moineau officiel doit exister dans .accounts.json');
    $assert($acc['users']['user_moineau_official']['friendCode'] === 'HOOT-MOIN', 'Le code ami de Moineau dans .accounts doit être HOOT-MOIN');

    // Vérification registered_usernames.json
    $uRaw = @file_get_contents($usernamesFile);
    $uData = json_decode($uRaw, true);
    $assert(isset($uData['usernames']['moineau']), 'Moineau doit être enregistrée dans registered_usernames.json pour le Dashboard Admin');
    $assert($uData['usernames']['moineau']['friendCode'] === 'HOOT-MOIN', 'Le code ami doit être synchronisé');

    // Nettoyage
    $GLOBALS['test_override_user_saves_dir'] = $origSaves;
    @unlink($friendsFile);
    @unlink($accountsFile);
    @unlink($usernamesFile);
    @rmdir($tempDir);
}

function test_reconciliation_indexes_sovereign_accounts($assert) {
    $tempDir = sys_get_temp_dir() . '/hoot_test_recon2_' . uniqid();
    @mkdir($tempDir, 0755, true);

    $origSaves = $GLOBALS['test_override_user_saves_dir'] ?? null;
    $GLOBALS['test_override_user_saves_dir'] = $tempDir;

    $friendsFile = $tempDir . '/friends_data.json';
    $accountsFile = $tempDir . '/.accounts.json';
    $usernamesFile = $tempDir . '/registered_usernames.json';

    // Créer un utilisateur dans .accounts.json (comme si inscrit via user_auth.php)
    $initialAccounts = [
        'users' => [
            'user_test_xyz' => [
                'id' => 'user_test_xyz',
                'username' => 'ChouettePleinVol',
                'email' => 'chouette@hoot.local',
                'passwordHash' => password_hash('Pass1234', PASSWORD_BCRYPT),
                'emailVerified' => true,
                'createdAt' => '2026-11-19T10:00:00Z',
                'friendCode' => 'HOOT-CHOU'
            ]
        ],
        'emailIndex' => ['chouette@hoot.local' => 'user_test_xyz'],
        'steamIndex' => []
    ];
    file_put_contents($accountsFile, json_encode($initialAccounts));

    $db = [];
    reconcileAllAccountsWithCreatorFriends($db, $friendsFile, true);

    // Vérifier registered_usernames.json
    $uRaw = file_get_contents($usernamesFile);
    $uData = json_decode($uRaw, true);

    $assert(isset($uData['usernames']['chouettepleinvol']), 'ChouettePleinVol doit être réconciliée dans registered_usernames');
    $assert($uData['usernames']['chouettepleinvol']['displayName'] === 'ChouettePleinVol', 'Le nom affiché doit être conservé');
    $assert($uData['usernames']['chouettepleinvol']['friendCode'] === 'HOOT-CHOU', 'Le friendCode doit être indexé');
    $assert($uData['usernames']['chouettepleinvol']['email'] === 'chouette@hoot.local', 'L’email doit être indexé pour l’admin');

    // Vérifier amitié réciproque
    $assert(in_array('HOOT-CHOU', $db['friendships']['HOOT-HIBOU'], true), 'Hibouxe doit être ami avec ChouettePleinVol');
    $assert(in_array('HOOT-HIBOU', $db['friendships']['HOOT-CHOU'], true), 'ChouettePleinVol doit être amie avec Hibouxe');

    // Nettoyage
    $GLOBALS['test_override_user_saves_dir'] = $origSaves;
    @unlink($friendsFile);
    @unlink($accountsFile);
    @unlink($usernamesFile);
    @rmdir($tempDir);
}
