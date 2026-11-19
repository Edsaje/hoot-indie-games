<?php
/**
 * 🦉 Hoot Indie Games — Vérificateur d'assertions Steam OpenID 2.0 & Session
 * Module modulaire et sécurisé partagé entre user_auth.php et user_cloud_sync.php
 */

require_once __DIR__ . '/admin_auth.php';

/**
 * Valide cryptographiquement le ticket d'assertion auprès des serveurs Valve
 * et initialise la session PHP correspondante.
 * 
 * @param array $params Paramètres de la requête (GET/POST avec openid_*)
 * @return array Résultat de la validation
 */
function verifySteamOpenIdAssertion(array $params = []): array {
    startSecureHootSession();

    if (empty($params)) {
        $params = array_merge($_GET, $_POST);
    }

    $validationParams = [
        'openid.ns' => 'http://specs.openid.net/auth/2.0',
        'openid.mode' => 'check_authentication',
    ];

    foreach ($params as $k => $v) {
        if (strpos($k, 'openid_') === 0) {
            $validationParams['openid.' . substr($k, 7)] = $v;
        } elseif (strpos($k, 'openid.') === 0) {
            $validationParams[$k] = $v;
        }
    }

    $isValidAssertion = false;
    $postData = http_build_query($validationParams);

    // Requête HTTP sortante vers Valve
    $ch = @curl_init('https://steamcommunity.com/openid/login');
    if ($ch) {
        @curl_setopt($ch, CURLOPT_POST, 1);
        @curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        @curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        @curl_setopt($ch, CURLOPT_TIMEOUT, 8);
        @curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        $res = @curl_exec($ch);
        @curl_close($ch);
        if ($res && preg_match('/is_valid\s*:\s*true/i', $res)) {
            $isValidAssertion = true;
        }
    } else {
        $opts = [
            'http' => [
                'method' => 'POST',
                'header' => "Content-type: application/x-www-form-urlencoded\r\nConnection: close\r\n",
                'content' => $postData,
                'timeout' => 8,
            ],
        ];
        $ctx = @stream_context_create($opts);
        $res = @file_get_contents('https://steamcommunity.com/openid/login', false, $ctx);
        if ($res && preg_match('/is_valid\s*:\s*true/i', $res)) {
            $isValidAssertion = true;
        }
    }

    if (!$isValidAssertion) {
        return [
            'success' => false,
            'error' => 'invalid_assertion',
            'message' => 'Validation Steam OpenID rejetée par Valve.',
        ];
    }

    $claimedId = $params['openid_claimed_id'] ?? ($params['openid.claimed_id'] ?? '');
    if (!preg_match('/^https?:\/\/steamcommunity\.com\/openid\/id\/(7[0-9]{15,25})$/', $claimedId, $m)) {
        return [
            'success' => false,
            'error' => 'missing_steam_id',
            'message' => 'Identifiant SteamID introuvable dans la réponse OpenID.',
        ];
    }

    $verifiedSteamId = $m[1];
    session_regenerate_id(true);

    $_SESSION['steam_id'] = $verifiedSteamId;
    $_SESSION['verified_steam_id'] = $verifiedSteamId;

    $isCreator = defined('ADMIN_STEAM_ID') && ($verifiedSteamId === ADMIN_STEAM_ID);

    if ($isCreator) {
        $_SESSION['admin_auth'] = true;
        $_SESSION['admin_steam_id'] = $verifiedSteamId;
        $_SESSION['admin_login_at'] = date('c');
        $_SESSION['hoot_user_id'] = 'admin_hibouxe';
    }

    $resData = [
        'success' => true,
        'verified' => true,
        'steamId' => $verifiedSteamId,
        'isCreator' => $isCreator,
        'csrfToken' => $isCreator && function_exists('getAdminCsrfToken') ? getAdminCsrfToken() : null,
        'message' => 'Authentification Steam validée avec succès.',
    ];

    if ($isCreator && function_exists('getAdminMasterKey')) {
        $mk = getAdminMasterKey();
        if (!empty($mk)) {
            $resData['adminKey'] = $mk;
        }
    }

    // Inscription / mise à jour automatique dans l'annuaire souverain des compagnons
    if (function_exists('ensureUserInFriendsDatabase')) {
        $fc = ensureUserInFriendsDatabase([
            'steamId' => $verifiedSteamId,
            'username' => $isCreator ? 'Hibouxe' : ('Explorateur_' . substr($verifiedSteamId, -4)),
            'avatarId' => $isCreator ? 'hibouxe_creator' : 'owl',
            'title' => $isCreator ? '👑 Fondateur du Perchoir' : 'Explorateur',
        ]);
        if (!empty($fc)) {
            $resData['friendCode'] = $fc;
        }
    }

    return $resData;
}
