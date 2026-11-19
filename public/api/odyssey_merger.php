<?php
/**
 * 🌲 Hoot Indie Games — Moteur de Fusion de Sauvegarde de l'Odyssée Sylvestre (PHP)
 * Respecte une règle stricte de monotonicité : aucune progression convenue (biomes, améliorations, Indiedex)
 * ne peut être dégradée ou effacée par un état vierge ou obsolète issu d'un second terminal.
 */

/**
 * Fusionne l'état existant distant ($ex) et l'état entrant ($in)
 * 
 * @param array|null $ex État actuel stocké sur le serveur
 * @param array|null $in État entrant provenant du client
 * @param bool $forceReplace Si true (ex: hard reset intentionnel), remplace sans fusionner
 * @return array|null État fusionné
 */
function mergeOdysseyState($ex, $in, $forceReplace = false) {
    if ($forceReplace && is_array($in)) {
        $in['version'] = 1;
        $in['lastSavedAt'] = time() * 1000;
        return $in;
    }
    if (!is_array($ex) || empty($ex)) {
        if (is_array($in)) {
            $in['version'] = 1;
            return $in;
        }
        return null;
    }
    if (!is_array($in) || empty($in)) {
        $ex['version'] = 1;
        return $ex;
    }

    $isExEmpty = (
        intval($ex['totalStarSapEarned'] ?? 0) === 0 &&
        intval($ex['highestBiomeUnlocked'] ?? 1) === 1 &&
        empty($ex['treeUpgrades']) &&
        empty($ex['capturedGames'])
    );
    $isInEmpty = (
        intval($in['totalStarSapEarned'] ?? 0) === 0 &&
        intval($in['highestBiomeUnlocked'] ?? 1) === 1 &&
        empty($in['treeUpgrades']) &&
        empty($in['capturedGames'])
    );

    // 1. Détermination de la source maîtresse
    // Un état vierge ne peut JAMAIS écraser un état ayant déjà progressé, même si son horodatage est plus récent
    if ($isInEmpty && !$isExEmpty) {
        $isInNewer = false;
    } elseif (!$isInEmpty && $isExEmpty) {
        $isInNewer = true;
    } else {
        $exBiome = intval($ex['highestBiomeUnlocked'] ?? 1);
        $inBiome = intval($in['highestBiomeUnlocked'] ?? 1);
        $exSapTotal = floatval($ex['totalStarSapEarned'] ?? 0);
        $inSapTotal = floatval($in['totalStarSapEarned'] ?? 0);

        // Si l'un des deux a une avance massive (ex: Biome 6 vs Biome 1 ou 10x plus de sève), il est prioritaire
        if ($exBiome > $inBiome + 1 || ($exSapTotal > 10000 && $inSapTotal < $exSapTotal * 0.1)) {
            $isInNewer = false;
        } elseif ($inBiome > $exBiome + 1 || ($inSapTotal > 10000 && $exSapTotal < $inSapTotal * 0.1)) {
            $isInNewer = true;
        } else {
            $exSavedAt = floatval($ex['lastSavedAt'] ?? 0);
            $inSavedAt = floatval($in['lastSavedAt'] ?? 0);
            $isInNewer = ($inSavedAt >= $exSavedAt);
        }
    }

    $primary = $isInNewer ? $in : $ex;
    $secondary = $isInNewer ? $ex : $in;

    // 2. Biomes & Routes (Monotonicité stricte : max())
    $mergedBiome = max(
        intval($ex['highestBiomeUnlocked'] ?? 1),
        intval($in['highestBiomeUnlocked'] ?? 1)
    );

    $mergedRoutes = is_array($ex['highestRouteUnlocked'] ?? null) ? $ex['highestRouteUnlocked'] : [];
    if (is_array($in['highestRouteUnlocked'] ?? null)) {
        foreach ($in['highestRouteUnlocked'] as $bId => $rNum) {
            $mergedRoutes[$bId] = max(intval($mergedRoutes[$bId] ?? 1), intval($rNum ?? 1));
        }
    }

    // 3. Monstres vaincus par route (routeKills)
    $mergedKills = is_array($ex['routeKills'] ?? null) ? $ex['routeKills'] : [];
    if (is_array($in['routeKills'] ?? null)) {
        foreach ($in['routeKills'] as $rId => $kNum) {
            $mergedKills[$rId] = max(intval($mergedKills[$rId] ?? 0), intval($kNum ?? 0));
        }
    }

    // 4. Améliorations de l'Arbre Céleste (treeUpgrades)
    $mergedUpgrades = is_array($ex['treeUpgrades'] ?? null) ? $ex['treeUpgrades'] : [];
    if (is_array($in['treeUpgrades'] ?? null)) {
        foreach ($in['treeUpgrades'] as $uId => $uLvl) {
            $mergedUpgrades[$uId] = max(intval($mergedUpgrades[$uId] ?? 0), intval($uLvl ?? 0));
        }
    }

    // 5. Pépites capturées dans l'Indiedex (capturedGames)
    $mergedCaptured = is_array($ex['capturedGames'] ?? null) ? $ex['capturedGames'] : [];
    if (is_array($in['capturedGames'] ?? null)) {
        foreach ($in['capturedGames'] as $gId => $cData) {
            if (!is_array($cData)) continue;
            $lData = is_array($mergedCaptured[$gId] ?? null) ? $mergedCaptured[$gId] : ['count' => 0, 'isHolo' => false, 'level' => 1];
            $mergedCaptured[$gId] = [
                'count' => max(intval($lData['count'] ?? 0), intval($cData['count'] ?? 0)),
                'isHolo' => !empty($lData['isHolo']) || !empty($cData['isHolo']),
                'level' => max(intval($lData['level'] ?? 1), intval($cData['level'] ?? 1)),
                'firstCapturedAt' => $lData['firstCapturedAt'] ?? ($cData['firstCapturedAt'] ?? date('c')),
            ];
        }
    }

    // 6. Conciliation de la Sève Céleste
    $exTotalSap = floatval($ex['totalStarSapEarned'] ?? 0);
    $inTotalSap = floatval($in['totalStarSapEarned'] ?? 0);
    $mergedTotalSap = max($exTotalSap, $inTotalSap);

    $exSap = floatval($ex['starSap'] ?? 0);
    $inSap = floatval($in['starSap'] ?? 0);
    $mergedStarSap = max($exSap, $inSap);
    if ($mergedStarSap > $mergedTotalSap) {
        $mergedStarSap = $mergedTotalSap;
    }

    // 7. Statistiques globales de combat (max cumulatifs)
    $exStats = is_array($ex['stats'] ?? null) ? $ex['stats'] : [];
    $inStats = is_array($in['stats'] ?? null) ? $in['stats'] : [];
    $mergedStats = [
        'totalClicks' => max(intval($exStats['totalClicks'] ?? 0), intval($inStats['totalClicks'] ?? 0)),
        'totalDamageDealt' => max(floatval($exStats['totalDamageDealt'] ?? 0), floatval($inStats['totalDamageDealt'] ?? 0)),
        'monstersDefeated' => max(intval($exStats['monstersDefeated'] ?? 0), intval($inStats['monstersDefeated'] ?? 0)),
        'bossesDefeated' => max(intval($exStats['bossesDefeated'] ?? 0), intval($inStats['bossesDefeated'] ?? 0)),
        'holosFound' => max(intval($exStats['holosFound'] ?? 0), intval($inStats['holosFound'] ?? 0)),
        'firefliesCaught' => max(intval($exStats['firefliesCaught'] ?? 0), intval($inStats['firefliesCaught'] ?? 0)),
        'rebirthsCount' => max(intval($exStats['rebirthsCount'] ?? 0), intval($inStats['rebirthsCount'] ?? 0)),
    ];

    // 8. Compagnons actifs
    $activeCompanions = is_array($primary['activeCompanions'] ?? null) && count($primary['activeCompanions']) > 0
        ? $primary['activeCompanions']
        : (is_array($secondary['activeCompanions'] ?? null) ? $secondary['activeCompanions'] : []);

    // 9. Biome et route actifs (ne jamais rétrograder au Biome 1 si un Biome avancé est conquis)
    $primaryBiome = $primary['currentBiomeId'] ?? 'biome_1_clearing';
    $secondaryBiome = $secondary['currentBiomeId'] ?? 'biome_1_clearing';
    $activeBiome = ($primaryBiome === 'biome_1_clearing' && $secondaryBiome !== 'biome_1_clearing')
        ? $secondaryBiome
        : $primaryBiome;

    $primaryRoute = max(1, min(5, intval($primary['currentRouteNumber'] ?? 1)));
    $secondaryRoute = max(1, min(5, intval($secondary['currentRouteNumber'] ?? 1)));
    $activeRoute = ($primaryRoute === 1 && $secondaryRoute > 1 && $primaryBiome === 'biome_1_clearing')
        ? $secondaryRoute
        : $primaryRoute;

    $exSavedAt = floatval($ex['lastSavedAt'] ?? 0);
    $inSavedAt = floatval($in['lastSavedAt'] ?? 0);

    return [
        'version' => 1,
        'currentBiomeId' => $activeBiome,
        'currentRouteNumber' => $activeRoute,
        'autoAdvance' => isset($primary['autoAdvance']) ? (bool)$primary['autoAdvance'] : (bool)($secondary['autoAdvance'] ?? false),
        'miniHudEnabled' => isset($primary['miniHudEnabled']) ? (bool)$primary['miniHudEnabled'] : (bool)($secondary['miniHudEnabled'] ?? false),
        'miniHudMobileEnabled' => isset($primary['miniHudMobileEnabled']) ? (bool)$primary['miniHudMobileEnabled'] : (bool)($secondary['miniHudMobileEnabled'] ?? false),
        'highestBiomeUnlocked' => $mergedBiome,
        'highestRouteUnlocked' => $mergedRoutes,
        'routeKills' => $mergedKills,
        'treeUpgrades' => $mergedUpgrades,
        'capturedGames' => $mergedCaptured,
        'activeCompanions' => $activeCompanions,
        'starSap' => $mergedStarSap,
        'totalStarSapEarned' => $mergedTotalSap,
        'celestialShards' => max(intval($ex['celestialShards'] ?? 0), intval($in['celestialShards'] ?? 0)),
        'stats' => $mergedStats,
        'lastSavedAt' => max($exSavedAt, $inSavedAt, time() * 1000),
    ];
}
