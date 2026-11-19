<?php
/**
 * Test unitaire PHP : odyssey_merger.php
 */

$apiDir = file_exists(__DIR__ . '/../../public/api') ? __DIR__ . '/../../public/api' : (file_exists(__DIR__ . '/../api') ? __DIR__ . '/../api' : '/var/www/html/api');
require_once $apiDir . '/odyssey_merger.php';

function test_odyssey_merger_monotonicity($assert) {
    $existing = [
        'highestBiomeUnlocked' => 6,
        'currentBiomeId' => 'biome_6',
        'currentRouteNumber' => 4,
        'starSap' => 50000000,
        'totalStarSapEarned' => 100917767263699,
        'highestRouteUnlocked' => ['6' => 4],
        'treeUpgrades' => ['sap_boost' => 10, 'crit' => 3],
        'capturedGames' => ['hollow-knight' => ['id' => 'hollow-knight', 'level' => 5]],
        'lastSavedAt' => 1000
    ];

    $incomingEmptyNewer = [
        'highestBiomeUnlocked' => 1,
        'currentBiomeId' => 'biome_1',
        'currentRouteNumber' => 1,
        'starSap' => 10,
        'totalStarSapEarned' => 10,
        'highestRouteUnlocked' => ['1' => 1],
        'treeUpgrades' => [],
        'capturedGames' => [],
        'lastSavedAt' => 999999
    ];

    // Fusion normale sans forceReplace
    $merged = mergeOdysseyState($existing, $incomingEmptyNewer, false);

    $assert($merged['highestBiomeUnlocked'] === 6, 'Le Biome 6 doit être préservé face à un Biome 1 plus récent');
    $assert($merged['totalStarSapEarned'] == 100917767263699, 'La sève totale de 100T doit être conservée');
    $assert($merged['treeUpgrades']['sap_boost'] === 10, 'Les améliorations d\'arbre doivent être conservées');
    $assert(isset($merged['capturedGames']['hollow-knight']), 'Le compagnon Hollow Knight doit être conservé');
}

function test_odyssey_merger_advancement($assert) {
    $existing = [
        'highestBiomeUnlocked' => 2,
        'totalStarSapEarned' => 5000,
        'treeUpgrades' => ['sap_boost' => 2, 'offline' => 1],
        'lastSavedAt' => 1000
    ];

    $incomingAdvanced = [
        'highestBiomeUnlocked' => 4,
        'totalStarSapEarned' => 25000,
        'treeUpgrades' => ['sap_boost' => 1, 'offline' => 3, 'slots' => 1],
        'lastSavedAt' => 2000
    ];

    $merged = mergeOdysseyState($existing, $incomingAdvanced, false);

    $assert($merged['highestBiomeUnlocked'] === 4, 'Le biome supérieur entrant doit être appliqué');
    $assert($merged['totalStarSapEarned'] == 25000, 'La sève supérieure doit être appliquée');
    $assert($merged['treeUpgrades']['sap_boost'] === 2, 'Doit conserver le niveau max sap_boost (2)');
    $assert($merged['treeUpgrades']['offline'] === 3, 'Doit conserver le niveau max offline (3)');
    $assert($merged['treeUpgrades']['slots'] === 1, 'Doit ajouter l\'amélioration slots');
}

function test_odyssey_merger_hard_reset($assert) {
    $existing = [
        'highestBiomeUnlocked' => 6,
        'totalStarSapEarned' => 100917767263699,
        'lastSavedAt' => 1000
    ];

    $resetState = [
        'highestBiomeUnlocked' => 1,
        'totalStarSapEarned' => 0,
        'lastSavedAt' => 2000
    ];

    // Reset autorisé avec forceReplace = true
    $reset = mergeOdysseyState($existing, $resetState, true);

    $assert($reset['highestBiomeUnlocked'] === 1, 'Le hard reset doit forcer le Biome 1');
    $assert($reset['totalStarSapEarned'] === 0, 'Le hard reset doit forcer 0 sève');
}
