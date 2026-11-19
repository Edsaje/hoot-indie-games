<?php
/**
 * 🦉 Hoot Indie Games — Gestionnaire de Stockage et Sécurité des Sauvegardes Souveraines
 * Centralise la résolution des fichiers, les contrôles anti-IDOR et la fusion de toutes les données du site.
 */

require_once __DIR__ . '/admin_auth.php';
require_once __DIR__ . '/odyssey_merger.php';

/**
 * Retourne le chemin absolu du dossier des sauvegardes utilisateurs
 */
function getHootSavesDirectory(): string {
    $dir = __DIR__ . '/user_saves';
    if (!is_dir($dir)) {
        @mkdir($dir, 0775, true);
    }
    return $dir;
}

/**
 * Nettoie un identifiant pour éviter toute traversée de dossier (Path Traversal)
 */
function sanitizeIdentifier($str): string {
    return preg_replace('/[^a-zA-Z0-9_\-]/', '', strval($str));
}

/**
 * Récupère la clé de synchronisation envoyée dans la requête (en-tête ou query)
 */
function extractSyncKeyFromRequest(): string {
    $key = $_SERVER['HTTP_X_SYNC_KEY'] ?? ($_REQUEST['syncKey'] ?? '');
    if (empty($key) && function_exists('getallheaders')) {
        $headers = getallheaders();
        foreach ($headers as $k => $v) {
            if (strcasecmp($k, 'X-Sync-Key') === 0) {
                $key = $v;
                break;
            }
        }
    }
    return trim(strval($key));
}

/**
 * Résout les fichiers candidats et charge la première sauvegarde existante
 */
function resolveUserSaveCandidates(array $identifiers): array {
    $savesDir = getHootSavesDirectory();
    $candidateFiles = [];

    $sessionUserId = $_SESSION['hoot_user_id'] ?? null;
    $sessionSteamId = $_SESSION['verified_steam_id'] ?? ($_SESSION['steam_id'] ?? null);

    $reqUserId = trim(strval($identifiers['userId'] ?? ''));
    $reqSteamId = trim(strval($identifiers['steamId'] ?? ''));
    $reqUsername = trim(strval($identifiers['username'] ?? ''));
    $syncKey = trim(strval($identifiers['syncKey'] ?? ''));

    // 1. Session compte Hoot vérifiée
    if (!empty($sessionUserId)) {
        $candidateFiles[] = $savesDir . '/user_' . sanitizeIdentifier($sessionUserId) . '.json';
    }
    // 2. ID utilisateur réclamé (non invité)
    if (!empty($reqUserId) && strpos($reqUserId, 'local_') !== 0) {
        $candidateFiles[] = $savesDir . '/user_' . sanitizeIdentifier($reqUserId) . '.json';
    }
    // 3. Session Steam vérifiée
    if (!empty($sessionSteamId)) {
        $candidateFiles[] = $savesDir . '/steam_' . sanitizeIdentifier($sessionSteamId) . '.json';
    }
    // 4. SteamID réclamé
    if (!empty($reqSteamId)) {
        $candidateFiles[] = $savesDir . '/steam_' . sanitizeIdentifier($reqSteamId) . '.json';
    }
    // 5. Pseudonyme personnalisé
    if (!empty($reqUsername) && $reqUsername !== 'Hibou Mystère') {
        $cleanName = mb_strtolower(trim($reqUsername), 'UTF-8');
        $cleanName = preg_replace('/[^a-z0-9]/', '', $cleanName);
        if (!empty($cleanName)) {
            $candidateFiles[] = $savesDir . '/name_' . $cleanName . '.json';
        }
    }
    // 6. Clé de synchronisation directe
    if (!empty($syncKey) && strpos($syncKey, 'sync_') === 0) {
        $candidateFiles[] = $savesDir . '/key_' . sanitizeIdentifier(substr($syncKey, 5)) . '.json';
    }

    $candidateFiles = array_values(array_unique(array_filter($candidateFiles)));

    $existingSaveFile = null;
    $existingData = null;

    foreach ($candidateFiles as $file) {
        if (file_exists($file)) {
            $raw = @file_get_contents($file);
            if ($raw) {
                $dec = json_decode($raw, true);
                if (is_array($dec)) {
                    $existingSaveFile = $file;
                    $existingData = $dec;
                    if (isset($existingData['payload']) && is_array($existingData['payload'])) {
                        $sub = $existingData['payload'];
                        unset($existingData['payload']);
                        $existingData = array_merge($existingData, $sub);
                    }
                    break;
                }
            }
        }
    }

    $primarySaveFile = $existingSaveFile ?: (!empty($candidateFiles) ? $candidateFiles[0] : null);

    return [
        'candidateFiles' => $candidateFiles,
        'existingFile' => $existingSaveFile,
        'existingData' => $existingData,
        'primaryFile' => $primarySaveFile,
    ];
}

/**
 * Contrôle de sécurité Anti-IDOR : Vérifie que le demandeur est légitime
 * 
 * CORRECTION CLÉ MULTI-APPAREILS :
 * Si le joueur est authentifié par sa session (Steam ou Compte Hoot), il a TOUJOURS le droit
 * de lire et synchroniser son propre compte, même si un nouvel appareil (mobile/PC travail)
 * a généré une nouvelle clé de synchronisation locale vierge.
 */
function isAuthorizedForUserSave($existingData, string $inputSyncKey, ?string $sessionUserId, ?string $sessionSteamId, bool $isAdminSession): bool {
    if (!$existingData || !is_array($existingData)) {
        return true;
    }
    if ($isAdminSession) {
        return true;
    }

    // 1. Session Steam concordante (garantie multi-navigateurs / multi-PC)
    if (!empty($sessionSteamId) && !empty($existingData['steamId']) && strval($existingData['steamId']) === strval($sessionSteamId)) {
        return true;
    }

    // 2. Session Compte Hoot concordante (garantie multi-navigateurs / multi-PC)
    if (!empty($sessionUserId) && !empty($existingData['userId']) && strval($existingData['userId']) === strval($sessionUserId)) {
        return true;
    }

    // 3. Clé de synchronisation partagée (pour mode invité ou import manuel)
    if (!empty($existingData['syncKeyHash']) && !empty($inputSyncKey)) {
        if (hash_equals($existingData['syncKeyHash'], hash('sha256', $inputSyncKey))) {
            return true;
        }
    }

    // Si la sauvegarde contient des identifiants stricts et qu'aucune condition n'est remplie : rejet
    $isProtected = !empty($existingData['syncKeyHash']) || !empty($existingData['userId']) || !empty($existingData['steamId']);
    if ($isProtected) {
        return false;
    }

    return true;
}

/**
 * Fusionne intégralement toutes les composantes de jeu du site ("TOUTES les saves")
 */
function mergeComprehensiveSaveData(array $existing, array $incoming, array $options = []): array {
    $isReplace = ($options['strategy'] ?? '') === 'replace';
    $isOdysseyReplace = ($options['odysseyStrategy'] ?? '') === 'replace' || ($incoming['odysseyStrategy'] ?? '') === 'replace';

    if ($isReplace && !empty($incoming)) {
        $incoming['syncedAt'] = date('c');
        if (isset($incoming['odysseyState']) && is_array($incoming['odysseyState'])) {
            $incoming['odysseyState']['version'] = 1;
        }
        return $incoming;
    }

    if (empty($existing)) {
        $incoming['syncedAt'] = date('c');
        return $incoming;
    }

    $merged = $existing;

    // 1. Profil & Identité
    if (!empty($incoming['steamId'])) $merged['steamId'] = $incoming['steamId'];
    if (!empty($incoming['userId'])) $merged['userId'] = $incoming['userId'];
    if (!empty($incoming['username']) && $incoming['username'] !== 'Hibou Mystère') {
        $merged['username'] = $incoming['username'];
    }
    if (!empty($incoming['avatarId'])) $merged['avatarId'] = $incoming['avatarId'];
    if (!empty($incoming['title'])) $merged['title'] = $incoming['title'];
    if (!empty($incoming['activeFrame'])) $merged['activeFrame'] = $incoming['activeFrame'];

    // 2. Déblocages Boutique
    $merged['unlockedAvatars'] = array_values(array_unique(array_merge($existing['unlockedAvatars'] ?? [], $incoming['unlockedAvatars'] ?? [])));
    $merged['unlockedTitles'] = array_values(array_unique(array_merge($existing['unlockedTitles'] ?? [], $incoming['unlockedTitles'] ?? [])));
    $merged['unlockedFrames'] = array_values(array_unique(array_merge($existing['unlockedFrames'] ?? [], $incoming['unlockedFrames'] ?? [])));

    // 3. JEUX POSSÉDÉS (Steam + Ajouts manuels "J'ai ce jeu")
    $exOwned = is_array($existing['ownedAppIds'] ?? null) ? $existing['ownedAppIds'] : [];
    $inOwned = is_array($incoming['ownedAppIds'] ?? null) ? $incoming['ownedAppIds'] : [];
    $allOwned = array_values(array_unique(array_filter(array_map('intval', array_merge($exOwned, $inOwned)))));
    $merged['ownedAppIds'] = $allOwned;

    // 4. Plumes d'Or & Réclamations Journalières
    $exFeathers = is_array($existing['feathers'] ?? null) ? $existing['feathers'] : [];
    $inFeathers = is_array($incoming['feathers'] ?? null) ? $incoming['feathers'] : [];
    $exClaimed = is_array($exFeathers['claimedDaily'] ?? null) ? $exFeathers['claimedDaily'] : [];
    $inClaimed = is_array($inFeathers['claimedDaily'] ?? null) ? $inFeathers['claimedDaily'] : [];
    $allClaimed = $exClaimed;
    foreach ($inClaimed as $dKey => $rec) {
        if (!is_array($rec)) continue;
        if (!isset($allClaimed[$dKey])) {
            $allClaimed[$dKey] = $rec;
        } else {
            $exG = is_array($allClaimed[$dKey]['claimedGames'] ?? null) ? $allClaimed[$dKey]['claimedGames'] : [];
            $inG = is_array($rec['claimedGames'] ?? null) ? $rec['claimedGames'] : [];
            $allClaimed[$dKey]['claimedGames'] = array_values(array_unique(array_merge($exG, $inG)));
            $allClaimed[$dKey]['grandSlamClaimed'] = !empty($allClaimed[$dKey]['grandSlamClaimed']) || !empty($rec['grandSlamClaimed']);
        }
    }
    $merged['feathers'] = [
        'bonus' => max(intval($exFeathers['bonus'] ?? 0), intval($inFeathers['bonus'] ?? 0)),
        'spent' => max(intval($exFeathers['spent'] ?? 0), intval($inFeathers['spent'] ?? 0)),
        'claimedDaily' => empty($allClaimed) ? new stdClass() : $allClaimed,
    ];

    // 5. Succès & Trophées
    $exAch = is_array($existing['achievements'] ?? null) ? $existing['achievements'] : [];
    $inAch = is_array($incoming['achievements'] ?? null) ? $incoming['achievements'] : [];
    $merged['achievements'] = array_values(array_unique(array_merge($exAch, $inAch)));

    // 6. Statistiques des 8 Mini-Jeux Quotidiens
    $exStats = is_array($existing['stats'] ?? null) ? $existing['stats'] : [];
    $inStats = is_array($incoming['stats'] ?? null) ? $incoming['stats'] : [];
    $mergedStats = $exStats;
    $modes = ['screenle', 'indledle', 'linkle', 'profille', 'chrono', 'pixel', 'review', 'blindtest'];
    foreach ($modes as $m) {
        if (isset($inStats[$m]) && is_array($inStats[$m])) {
            $eM = is_array($mergedStats[$m] ?? null) ? $mergedStats[$m] : [];
            $iM = $inStats[$m];
            $mergedStats[$m] = array_merge($eM, $iM, [
                'played' => max(intval($eM['played'] ?? 0), intval($iM['played'] ?? 0)),
                'won' => max(intval($eM['won'] ?? 0), intval($iM['won'] ?? 0)),
                'currentStreak' => max(intval($eM['currentStreak'] ?? 0), intval($iM['currentStreak'] ?? 0)),
                'maxStreak' => max(intval($eM['maxStreak'] ?? 0), intval($iM['maxStreak'] ?? 0)),
            ]);
        }
    }
    $merged['stats'] = $mergedStats;

    // 7. Grilles Quotidiennes du Calendrier (dailyGameStates)
    $exDaily = is_array($existing['dailyGameStates'] ?? null) ? $existing['dailyGameStates'] : [];
    $inDaily = is_array($incoming['dailyGameStates'] ?? null) ? $incoming['dailyGameStates'] : [];
    $mergedDaily = $exDaily;
    foreach ($inDaily as $sKey => $inState) {
        if (!is_array($inState)) continue;
        if (!isset($mergedDaily[$sKey])) {
            $mergedDaily[$sKey] = $inState;
        } else {
            $lState = $mergedDaily[$sKey];
            $mergedDaily[$sKey] = array_merge($lState, $inState, [
                'isWon' => !empty($lState['isWon']) || !empty($inState['isWon']),
                'isCompleted' => !empty($lState['isCompleted']) || !empty($inState['isCompleted']),
            ]);
        }
    }
    $merged['dailyGameStates'] = $mergedDaily;

    // 8. Time Attack & Versus
    $exTa = is_array($existing['timeAttackStats'] ?? null) ? $existing['timeAttackStats'] : [];
    $inTa = is_array($incoming['timeAttackStats'] ?? null) ? $incoming['timeAttackStats'] : [];
    $mergedTa = $exTa;
    foreach ($inTa as $mMode => $mStat) {
        if (!is_array($mStat)) continue;
        $cM = $mergedTa[$mMode] ?? [];
        $mergedTa[$mMode] = [
            'highScore' => max(intval($cM['highScore'] ?? 0), intval($mStat['highScore'] ?? 0)),
            'bestCombo' => max(intval($cM['bestCombo'] ?? 0), intval($mStat['bestCombo'] ?? 0)),
            'gamesPlayed' => max(intval($cM['gamesPlayed'] ?? 0), intval($mStat['gamesPlayed'] ?? 0)),
            'totalAnswered' => max(intval($cM['totalAnswered'] ?? 0), intval($mStat['totalAnswered'] ?? 0)),
            'lastPlayed' => $mStat['lastPlayed'] ?? ($cM['lastPlayed'] ?? date('c')),
        ];
    }
    $merged['timeAttackStats'] = $mergedTa;

    // 9. Sanctuaire des Cartes & Boosters
    $exCards = is_array($existing['cardCollection'] ?? null) ? $existing['cardCollection'] : [];
    $inCards = is_array($incoming['cardCollection'] ?? null) ? $incoming['cardCollection'] : [];
    $mergedCards = $exCards;
    foreach ($inCards as $cardId => $cEntry) {
        if (!is_array($cEntry)) continue;
        $lEntry = $mergedCards[$cardId] ?? ['count' => 0, 'countHolo' => 0];
        $mergedCards[$cardId] = [
            'count' => max(intval($lEntry['count'] ?? 0), intval($cEntry['count'] ?? 0)),
            'countHolo' => max(intval($lEntry['countHolo'] ?? 0), intval($cEntry['countHolo'] ?? 0)),
            'firstObtainedAt' => $lEntry['firstObtainedAt'] ?? ($cEntry['firstObtainedAt'] ?? date('c')),
        ];
    }
    $merged['cardCollection'] = $mergedCards;

    if (!empty($incoming['lastDailyBoosterClaim'])) {
        $exClaim = $existing['lastDailyBoosterClaim'] ?? '';
        $merged['lastDailyBoosterClaim'] = ($incoming['lastDailyBoosterClaim'] > $exClaim) ? $incoming['lastDailyBoosterClaim'] : $exClaim;
    }
    if (is_array($incoming['freeBoostersStock'] ?? null)) {
        $exStock = is_array($existing['freeBoostersStock'] ?? null) ? $existing['freeBoostersStock'] : [];
        $merged['freeBoostersStock'] = [
            'count' => min(2, max(intval($exStock['count'] ?? 0), intval($incoming['freeBoostersStock']['count'] ?? 0))),
            'lastRechargeTimestamp' => min(
                intval($exStock['lastRechargeTimestamp'] ?? (time() * 1000)),
                intval($incoming['freeBoostersStock']['lastRechargeTimestamp'] ?? (time() * 1000))
            ),
        ];
    }

    // 10. MODULES ADDITIONNELS : Backlog, Micro-Indies, Arcade, Quiz, Préférences
    if (isset($incoming['backlog']) && is_array($incoming['backlog'])) {
        $merged['backlog'] = $incoming['backlog'];
    }
    if (isset($incoming['likedMicroIndies']) && is_array($incoming['likedMicroIndies'])) {
        $exLiked = is_array($existing['likedMicroIndies'] ?? null) ? $existing['likedMicroIndies'] : [];
        $merged['likedMicroIndies'] = array_values(array_unique(array_merge($exLiked, $incoming['likedMicroIndies'])));
    }
    if (isset($incoming['arcadeStats']) && is_array($incoming['arcadeStats'])) {
        $exArcade = is_array($existing['arcadeStats'] ?? null) ? $existing['arcadeStats'] : [];
        $mergedArcadeHs = is_array($exArcade['highScores'] ?? null) ? $exArcade['highScores'] : [];
        if (isset($incoming['arcadeStats']['highScores']) && is_array($incoming['arcadeStats']['highScores'])) {
            foreach ($incoming['arcadeStats']['highScores'] as $gId => $score) {
                $mergedArcadeHs[$gId] = max(intval($mergedArcadeHs[$gId] ?? 0), intval($score ?? 0));
            }
        }
        $merged['arcadeStats'] = [
            'highScores' => $mergedArcadeHs,
            'difficulty' => $incoming['arcadeStats']['difficulty'] ?? ($exArcade['difficulty'] ?? 'normal'),
            'vectrexUnlocked' => !empty($exArcade['vectrexUnlocked']) || !empty($incoming['arcadeStats']['vectrexUnlocked']),
        ];
    }
    if (isset($incoming['quizHighScore'])) {
        $merged['quizHighScore'] = max(intval($existing['quizHighScore'] ?? 0), intval($incoming['quizHighScore']));
    }
    if (isset($incoming['userPreferences']) && is_array($incoming['userPreferences'])) {
        $merged['userPreferences'] = array_merge(
            is_array($existing['userPreferences'] ?? null) ? $existing['userPreferences'] : [],
            $incoming['userPreferences']
        );
    }

    // 11. ODYSSÉE SYLVESTRE (Moteur Monotonique)
    $merged['odysseyState'] = mergeOdysseyState(
        $existing['odysseyState'] ?? null,
        $incoming['odysseyState'] ?? null,
        $isOdysseyReplace
    );

    $merged['syncedAt'] = date('c');
    return $merged;
}

/**
 * Enregistre atomiquement les données de sauvegarde sur le disque avec LOCK_EX
 */
function persistUserSaveFile(string $targetFile, array $saveData, ?string $sessionUserId = null): bool {
    $savesDir = getHootSavesDirectory();
    $encoded = json_encode($saveData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    
    $res = @file_put_contents($targetFile, $encoded, LOCK_EX);
    if ($res === false) {
        return false;
    }

    // Miroir pour cohérence entre compte Hoot et SteamID
    if (!empty($saveData['userId']) && !empty($saveData['steamId'])) {
        $userFile = $savesDir . '/user_' . sanitizeIdentifier($saveData['userId']) . '.json';
        $steamFile = $savesDir . '/steam_' . sanitizeIdentifier($saveData['steamId']) . '.json';
        if ($targetFile === $userFile) {
            @file_put_contents($steamFile, $encoded, LOCK_EX);
        } elseif ($targetFile === $steamFile) {
            @file_put_contents($userFile, $encoded, LOCK_EX);
        }
    }

    if (!empty($sessionUserId)) {
        $accountFile = $savesDir . '/user_' . sanitizeIdentifier($sessionUserId) . '.json';
        if ($targetFile !== $accountFile) {
            @file_put_contents($accountFile, $encoded, LOCK_EX);
        }
    }

    return true;
}
