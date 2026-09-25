<?php
/**
 * Backend API de Tracking & Analytics Souverain — Hoot Indie Games
 * Développé selon les exigences de cybersécurité et de respect de la vie privée (RGPD / CNIL) :
 * - 100% Cookieless (aucune écriture de cookie traceur chez les utilisateurs)
 * - Aucune donnée personnelle stockée (IP hachée avec sel quotidien SHA-256)
 * - Whitelist stricte et assainissement des événements
 * - Protection anti-bruteforce et rate-limiting par IP (max 120 requêtes / min)
 * - Verrouillage atomique des écritures (LOCK_EX)
 * - Dashboard administrateur sécurisé par mot de passe chiffré Bcrypt
 */

ini_set('display_errors', 0);
error_reporting(0);

// Headers de sécurité HTTP
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Referrer-Policy: strict-origin-when-cross-origin');

require_once __DIR__ . '/admin_auth.php';
sendCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$statsFile = __DIR__ . '/stats.json';
$rateLimitFile = __DIR__ . '/track_rate_limits.json';
$secretFile = __DIR__ . '/.secret';

// Génération d'octets aléatoires sécurisés
function getSecureRandomBytes($length = 32) {
    if (function_exists('random_bytes')) {
        try { return random_bytes($length); } catch (Exception $e) {}
    }
    if (function_exists('openssl_random_pseudo_bytes')) {
        $bytes = openssl_random_pseudo_bytes($length, $strong);
        if ($bytes !== false) return $bytes;
    }
    return md5(uniqid(mt_rand(), true) . microtime(true));
}

// Hachage sécurisé de mot de passe (Bcrypt standard)
function securePasswordHash($password) {
    if (function_exists('password_hash')) {
        return password_hash($password, PASSWORD_BCRYPT);
    }
    $salt = bin2hex(getSecureRandomBytes(16));
    return 'sha512$' . $salt . '$' . hash('sha512', $salt . $password);
}

// Vérification de mot de passe sécurisé
function securePasswordVerify($password, $storedHash) {
    if (function_exists('password_verify')) {
        if (strpos($storedHash, '$2y$') === 0 || strpos($storedHash, '$2a$') === 0) {
            return password_verify($password, $storedHash);
        }
    }
    if (strpos($storedHash, 'sha512$') === 0) {
        $parts = explode('$', $storedHash);
        if (count($parts) === 3) {
            return hash('sha512', $parts[1] . $password) === $parts[2];
        }
    }
    return false;
}

// Clé secrète serveur pour le salage interne
function getOrCreateSecret($file) {
    if (!empty($file) && file_exists($file)) {
        $secret = trim(@file_get_contents($file));
        if (!empty($secret)) return $secret;
    }
    $newSecret = bin2hex(getSecureRandomBytes(32));
    if (!empty($file)) {
        @file_put_contents($file, $newSecret, LOCK_EX);
    }
    return $newSecret;
}
$serverSecret = getOrCreateSecret($secretFile);

// Récupération de l'adresse IP fiable (sans spoofing X-Forwarded-For)
function getClientIp() {
    return getAuthClientIp();
}

$clientIp = getClientIp();

// Normalisation des pseudonymes pour l'administration et l'unicité
function normalizeUsernameAdmin($name) {
    $clean = mb_strtolower(trim($name), 'UTF-8');
    $transliterator = [
        'à'=>'a', 'á'=>'a', 'â'=>'a', 'ã'=>'a', 'ä'=>'a', 'å'=>'a',
        'è'=>'e', 'é'=>'e', 'ê'=>'e', 'ë'=>'e',
        'ì'=>'i', 'í'=>'i', 'î'=>'i', 'ï'=>'i',
        'ò'=>'o', 'ó'=>'o', 'ô'=>'o', 'õ'=>'o', 'ö'=>'o',
        'ù'=>'u', 'ú'=>'u', 'û'=>'u', 'ü'=>'u',
        'ý'=>'y', 'ÿ'=>'y', 'ç'=>'c', 'ñ'=>'n'
    ];
    $clean = strtr($clean, $transliterator);
    return preg_replace('/[^a-z0-9]/', '', $clean);
}

// Chargement et réparation / initialisation robuste de la base des utilisateurs
function loadAndEnsureUsernamesDb($uFile) {
    $default = [
        'usernames' => [
            'hibouxe' => [
                'displayName' => 'Hibouxe',
                'steamId' => ADMIN_STEAM_ID,
                'userId' => 'admin_hibouxe',
                'claimedAt' => '2026-01-01T00:00:00Z',
                'role' => 'admin',
                'status' => 'active',
                'customTitle' => '👑 Créateur du Site',
                'isAdminReserved' => true,
                'isAdmin' => true
            ]
        ],
        'userToName' => [
            ADMIN_STEAM_ID => 'hibouxe',
            'steam_' . ADMIN_STEAM_ID => 'hibouxe'
        ],
        'forbiddenNames' => ['hibouxe', 'edsaje', 'admin'],
        'bannedUsers' => []
    ];

    if (!file_exists($uFile) || filesize($uFile) === 0) {
        @file_put_contents($uFile, json_encode($default, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        return $default;
    }

    $raw = @file_get_contents($uFile);
    if (!$raw) {
        @file_put_contents($uFile, json_encode($default, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        return $default;
    }

    $data = json_decode($raw, true);
    if (!is_array($data) || !isset($data['usernames']) || !is_array($data['usernames'])) {
        @file_put_contents($uFile, json_encode($default, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        return $default;
    }

    $dirty = false;

    // 1. Purge définitive des anciens comptes : Edsaje et sqdsqd
    if (isset($data['usernames']['edsaje'])) {
        unset($data['usernames']['edsaje']);
        $dirty = true;
    }
    if (isset($data['usernames']['sqdsqd'])) {
        unset($data['usernames']['sqdsqd']);
        $dirty = true;
    }

    // 2. Nettoyage de la correspondance userToName
    if (isset($data['userToName']) && is_array($data['userToName'])) {
        foreach ($data['userToName'] as $k => $v) {
            if ($v === 'edsaje' || $v === 'sqdsqd') {
                unset($data['userToName'][$k]);
                $dirty = true;
            }
        }
        $data['userToName'][ADMIN_STEAM_ID] = 'hibouxe';
        $data['userToName']['steam_' . ADMIN_STEAM_ID] = 'hibouxe';
    }

    // 3. Garantir que Hibouxe est le seul compte administrateur officiel
    if (!isset($data['usernames']['hibouxe'])) {
        $data['usernames']['hibouxe'] = $default['usernames']['hibouxe'];
        $dirty = true;
    } else {
        $data['usernames']['hibouxe']['role'] = 'admin';
        $data['usernames']['hibouxe']['isAdmin'] = true;
        $data['usernames']['hibouxe']['isAdminReserved'] = true;
        $data['usernames']['hibouxe']['steamId'] = ADMIN_STEAM_ID;
    }

    // 4. Rétrogradation systématique de tout autre compte qui aurait un rôle admin
    foreach ($data['usernames'] as $uKey => &$uEntry) {
        if ($uKey !== 'hibouxe') {
            if (($uEntry['role'] ?? '') === 'admin') {
                $uEntry['role'] = 'user';
                $dirty = true;
            }
            if (!empty($uEntry['isAdmin'])) {
                $uEntry['isAdmin'] = false;
                $dirty = true;
            }
            if (!empty($uEntry['isAdminReserved'])) {
                $uEntry['isAdminReserved'] = false;
                $dirty = true;
            }
            if (($uEntry['steamId'] ?? '') === ADMIN_STEAM_ID) {
                $uEntry['steamId'] = null;
                $dirty = true;
            }
        }
    }

    // 5. Maintien strict de la liste des pseudonymes interdits (Edsaje reste interdit)
    if (!isset($data['forbiddenNames']) || !is_array($data['forbiddenNames'])) {
        $data['forbiddenNames'] = ['hibouxe', 'edsaje', 'admin'];
        $dirty = true;
    } else {
        foreach (['hibouxe', 'edsaje', 'admin'] as $fb) {
            if (!in_array($fb, $data['forbiddenNames'], true)) {
                $data['forbiddenNames'][] = $fb;
                $dirty = true;
            }
        }
    }

    if (!isset($data['bannedUsers']) || !is_array($data['bannedUsers'])) {
        $data['bannedUsers'] = [];
        $dirty = true;
    }

    if ($dirty) {
        @file_put_contents($uFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    }

    return $data;
}

// Rate-limiting par IP : max 120 requêtes / min
function checkTrackRateLimit($ip, $file) {
    $now = time();
    $limits = [];
    if (file_exists($file)) {
        $content = @file_get_contents($file);
        if ($content) $limits = json_decode($content, true) ?: [];
    }

    foreach ($limits as $k => $data) {
        if (!isset($data['reset']) || $data['reset'] < $now - 300) {
            unset($limits[$k]);
        }
    }

    $ipHash = hash('sha256', $ip . '_limit');
    if (!isset($limits[$ipHash]) || $limits[$ipHash]['reset'] <= $now) {
        $limits[$ipHash] = ['count' => 1, 'reset' => $now + 60];
    } else {
        $limits[$ipHash]['count']++;
        if ($limits[$ipHash]['count'] > 120) {
            @file_put_contents($file, json_encode($limits), LOCK_EX);
            return false;
        }
    }

    @file_put_contents($file, json_encode($limits), LOCK_EX);
    return true;
}

// Analyse intelligente des sources de trafic (Referrers)
function parseReferrer($refUrl) {
    if (empty($refUrl)) return 'Direct';
    $refLower = strtolower(trim($refUrl));
    if ($refLower === 'direct') return 'Direct';

    if (strpos($refLower, 'lien_') === 0) {
        return 'Campagne : ' . ucfirst(substr($refLower, 5));
    }

    if (strpos($refLower, 'from=') !== false || strpos($refLower, 'ref=') !== false || strpos($refLower, 'source=') !== false || strpos($refLower, 'utm_source=') !== false) {
        $queryStr = parse_url($refUrl, PHP_URL_QUERY) ?? $refUrl;
        parse_str($queryStr, $params);
        $val = $params['from'] ?? $params['ref'] ?? $params['source'] ?? $params['utm_source'] ?? '';
        if (!empty($val)) {
            return 'Lien : ' . ucfirst(preg_replace('/[^a-zA-Z0-9_-]/', '', substr($val, 0, 30)));
        }
    }

    $host = strtolower(parse_url($refUrl, PHP_URL_HOST) ?? '');
    if (strpos($host, 'steampowered') !== false || strpos($host, 'steamcommunity') !== false) return 'Steam';
    if (strpos($host, 'quentinbeaud') !== false || strpos($host, 'portfolio') !== false) return 'Portfolio Quentin';
    if (strpos($host, 'twitter') !== false || strpos($host, 't.co') !== false || strpos($host, 'x.com') !== false) return 'Twitter / X';
    if (strpos($host, 'reddit') !== false) return 'Reddit';
    if (strpos($host, 'discord') !== false) return 'Discord';
    if (strpos($host, 'youtube') !== false) return 'YouTube';
    if (strpos($host, 'google') !== false) return 'Google';
    if (strpos($host, 'bing') !== false || strpos($host, 'duckduckgo') !== false) return 'Moteurs de recherche';
    if (strpos($host, 'github') !== false) return 'GitHub';
    if (strpos($host, 'itch.io') !== false) return 'Itch.io';
    if (!empty($host)) return ucfirst(substr($host, 0, 30));

    return ucfirst(substr($refLower, 0, 30));
}

// Détection basique du type de terminal
function detectDevice() {
    $ua = strtolower($_SERVER['HTTP_USER_AGENT'] ?? '');
    if (strpos($ua, 'mobile') !== false || strpos($ua, 'android') !== false || strpos($ua, 'iphone') !== false) {
        return 'mobile';
    }
    if (strpos($ua, 'tablet') !== false || strpos($ua, 'ipad') !== false) {
        return 'tablet';
    }
    return 'desktop';
}

// -------------------------------------------------------------
// 1. DASHBOARD & ADMINISTRATION (GET / FORMULAIRES / ACTIONS API)
// -------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET' || !empty($_POST['action'])) {
    if (session_status() === PHP_SESSION_NONE) {
        @ini_set('session.cookie_httponly', 1);
        @session_start();
    }

    // Déconnexion
    if (isset($_GET['action']) && $_GET['action'] === 'logout') {
        unset($_SESSION['admin_auth'], $_SESSION['admin_steam_id']);
        @session_destroy();
        header('Location: track.php');
        exit;
    }

    // A. RETOUR DU FLUX STEAM OPENID 2.0
    $openidMode = $_GET['openid_mode'] ?? $_GET['openid.mode'] ?? '';
    $claimedId = $_GET['openid_claimed_id'] ?? $_GET['openid.claimed_id'] ?? $_GET['openid_identity'] ?? $_GET['openid.identity'] ?? '';

    if (!empty($openidMode) || !empty($claimedId)) {
        $steamId = '';
        if (preg_match('/^https?:\/\/steamcommunity\.com\/openid\/id\/(\d{17,25})$/', $claimedId, $matches)) {
            $steamId = $matches[1];
        }

        // Validation OpenID 2.0 avec Valve
        $isValidAssertion = false;
        $validationParams = [
            'openid.ns' => 'http://specs.openid.net/auth/2.0',
            'openid.mode' => 'check_authentication',
        ];

        foreach ($_GET as $k => $v) {
            if (strpos($k, 'openid_') === 0) {
                $validationParams['openid.' . substr($k, 7)] = $v;
            } elseif (strpos($k, 'openid.') === 0) {
                $validationParams[$k] = $v;
            }
        }
        $validationParams['openid.mode'] = 'check_authentication';

        $postData = http_build_query($validationParams);
        $ch = @curl_init('https://steamcommunity.com/openid/login');
        if ($ch) {
            @curl_setopt($ch, CURLOPT_POST, 1);
            @curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
            @curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            @curl_setopt($ch, CURLOPT_TIMEOUT, 6);
            @curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
            $resp = @curl_exec($ch);
            @curl_close($ch);
            if ($resp && strpos($resp, 'is_valid:true') !== false) {
                $isValidAssertion = true;
            }
        }

        if (!$isValidAssertion) {
            $opts = [
                'http' => [
                    'method' => 'POST',
                    'header' => "Content-Type: application/x-www-form-urlencoded\r\nContent-Length: " . strlen($postData) . "\r\n",
                    'content' => $postData,
                    'timeout' => 6,
                ],
                'ssl' => [
                    'verify_peer' => true,
                    'verify_peer_name' => true,
                ]
            ];
            $ctx = @stream_context_create($opts);
            $res = @file_get_contents('https://steamcommunity.com/openid/login', false, $ctx);
            if ($res && strpos($res, 'is_valid:true') !== false) {
                $isValidAssertion = true;
            }
        }

        // [SÉCURITÉ] Vérification stricte : l'assertion OpenID DOIT avoir été validée par Valve
        // avant d'accorder une session administrateur. Sans cette condition, un attaquant pourrait
        // forger une URL avec le Steam ID admin sans passer par l'authentification Valve.
        if (!$isValidAssertion) {
            error_log("[SECURITY] Tentative d'authentification OpenID rejetée — assertion Valve non validée. Steam ID: " . ($steamId ?: 'inconnu') . " IP: " . getClientIp());
            http_response_code(403);
            header('Content-Type: text/html; charset=utf-8');
            echo '<h1>Erreur d\'authentification</h1><p>La validation Steam OpenID a échoué. Veuillez réessayer via le bouton officiel.</p>';
            echo '<a href="track.php">Retour</a>';
            exit;
        }

        // Vérification stricte du compte Administrateur (assertion Valve certifiée ✅)
        if ($steamId === ADMIN_STEAM_ID) {
            session_regenerate_id(true); // Protection contre le Session Fixation (CWE-384)
            $_SESSION['admin_auth'] = true;
            $_SESSION['admin_steam_id'] = $steamId;
            $_SESSION['admin_login_at'] = date('c');
            header('Location: track.php');
            exit;
        } else {
            // Refus strict pour tout autre compte Steam
            http_response_code(403);
            header('Content-Type: text/html; charset=utf-8');
            ?>
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Accès Refusé | Hoot Indie Games Analytics</title>
                <style>
                    :root {
                        --bg: #070b13;
                        --card-bg: rgba(15, 23, 42, 0.9);
                        --accent-red: #ef4444;
                        --accent-amber: #f59e0b;
                        --text: #f8fafc;
                        --text-muted: #94a3b8;
                        --border: rgba(239, 68, 68, 0.3);
                    }
                    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                    body { background: var(--bg); color: var(--text); display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 1rem; }
                    .card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px; padding: 2.5rem 2rem; max-width: 480px; width: 100%; text-align: center; backdrop-filter: blur(14px); box-shadow: 0 10px 40px rgba(0,0,0,0.7); }
                    .icon { font-size: 3rem; margin-bottom: 1rem; }
                    h1 { color: var(--accent-red); font-size: 1.6rem; margin-bottom: 0.6rem; }
                    p { color: var(--text-muted); font-size: 0.92rem; margin-bottom: 1.2rem; line-height: 1.5; }
                    .steam-box { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 0.8rem; font-family: monospace; font-size: 0.85rem; color: #fca5a5; margin-bottom: 1.5rem; word-break: break-all; }
                    .btn { display: inline-block; width: 100%; padding: 0.85rem; background: var(--accent-amber); color: #070b13; text-decoration: none; border-radius: 8px; font-weight: bold; margin-bottom: 0.75rem; transition: 0.2s; }
                    .btn:hover { background: #fbbf24; }
                    .btn-outline { background: rgba(255,255,255,0.06); color: var(--text-muted); border: 1px solid rgba(255,255,255,0.1); }
                    .btn-outline:hover { color: #fff; background: rgba(255,255,255,0.12); }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="icon">🛡️</div>
                    <h1>Accès Non Autorisé</h1>
                    <p>Ce compte Steam n'a pas les droits d'administration pour consulter les métriques de <strong>Hoot Indie Games</strong>.</p>
                    <div class="steam-box">
                        Votre Steam ID : <?= htmlspecialchars($steamId ?: 'Indéterminé') ?><br>
                        Compte administrateur officiel requis
                    </div>
                    <p style="font-size: 0.8rem; color: #64748b;">Seul le compte administrateur officiel du créateur est habilité à consulter ce tableau de bord.</p>
                    <a href="track.php?action=logout" class="btn">Réessayer avec le compte officiel</a>
                    <a href="../index.html" class="btn btn-outline">← Retour à Hoot Indie Games</a>
                </div>
            </body>
            </html>
            <?php
            exit;
        }
    }

    // B. VÉRIFICATION STRICTE DE SESSION ADMIN (STEAM OPENID SOUVERAIN)
    $action = trim($_POST['action'] ?? $_GET['action'] ?? '');
    $isJsonReq = (isset($_GET['format']) && $_GET['format'] === 'json') ||
                 (isset($_POST['format']) && $_POST['format'] === 'json') ||
                 (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) ||
                 !empty($action);

    $isAuth = isCreatorAdminAuthorized();

    if (!$isAuth) {
        if ($isJsonReq) {
            http_response_code(401);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'success' => false,
                'error' => 'unauthorized',
                'message' => 'Accès administrateur exclusif réservé au créateur du site (Steam ID ' . ADMIN_STEAM_ID . ').'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
        $protocol = $isHttps ? 'https://' : 'http://';
        $host = $_SERVER['HTTP_HOST'];
        $path = strtok($_SERVER['REQUEST_URI'], '?');
        $returnTo = $protocol . $host . $path;
        $realm = $protocol . $host;

        $steamLoginUrl = 'https://steamcommunity.com/openid/login?' . http_build_query([
            'openid.ns' => 'http://specs.openid.net/auth/2.0',
            'openid.mode' => 'checkid_setup',
            'openid.return_to' => $returnTo,
            'openid.realm' => $realm,
            'openid.identity' => 'http://specs.openid.net/auth/2.0/identifier_select',
            'openid.claimed_id' => 'http://specs.openid.net/auth/2.0/identifier_select',
        ]);

        header('Content-Type: text/html; charset=utf-8');
        ?>
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Connexion Administrateur Steam | Hoot Indie Games</title>
            <style>
                :root {
                    --bg: #070b13;
                    --card-bg: rgba(15, 23, 42, 0.85);
                    --accent-amber: #f59e0b;
                    --accent-cyan: #06b6d4;
                    --text: #f8fafc;
                    --text-muted: #94a3b8;
                    --border: rgba(245, 158, 11, 0.25);
                }
                * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                body { background: var(--bg); color: var(--text); display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 1.25rem; }
                .login-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 18px; padding: 2.5rem 2rem; max-width: 440px; width: 100%; text-align: center; backdrop-filter: blur(14px); box-shadow: 0 12px 45px rgba(0,0,0,0.65); position: relative; overflow: hidden; }
                .login-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #f59e0b, #06b6d4); }
                .logo-icon { font-size: 2.8rem; margin-bottom: 0.8rem; }
                h1 { color: var(--accent-amber); font-size: 1.6rem; margin-bottom: 0.4rem; letter-spacing: -0.5px; }
                .subtitle { color: var(--text-muted); font-size: 0.92rem; margin-bottom: 1.5rem; line-height: 1.45; }
                .badge-info { display: inline-flex; align-items: center; gap: 6px; background: rgba(6, 182, 212, 0.12); color: var(--accent-cyan); border: 1px solid rgba(6, 182, 212, 0.3); padding: 5px 12px; border-radius: 9999px; font-size: 0.78rem; font-weight: 600; margin-bottom: 1.75rem; }
                .btn-steam { display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; padding: 0.95rem 1.25rem; background: linear-gradient(135deg, #171a21 0%, #1b2838 50%, #2a475e 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 1rem; font-weight: 800; border: 1px solid rgba(102, 192, 244, 0.35); box-shadow: 0 4px 18px rgba(0,0,0,0.4); transition: all 0.25s ease; cursor: pointer; }
                .btn-steam:hover { border-color: rgba(102, 192, 244, 0.8); box-shadow: 0 6px 24px rgba(27, 40, 56, 0.8), 0 0 15px rgba(102, 192, 244, 0.3); transform: translateY(-1px); color: #fff; }
                .btn-steam svg { width: 22px; height: 22px; fill: currentColor; }
                .note { font-size: 0.8rem; color: #64748b; margin-top: 1.5rem; line-height: 1.4; }
                .back-link { display: inline-block; margin-top: 1.5rem; color: var(--text-muted); text-decoration: none; font-size: 0.85rem; transition: color 0.2s; }
                .back-link:hover { color: var(--accent-amber); }
            </style>
        </head>
        <body>
            <div class="login-card">
                <div class="logo-icon">🦉</div>
                <h1>Hoot Analytics</h1>
                <p class="subtitle">Espace d'administration et de métriques souveraines réservé au créateur du site.</p>
                <div class="badge-info">
                    👑 Accès exclusif Steam ID : <?= ADMIN_STEAM_ID ?>
                </div>
                <a href="<?= htmlspecialchars($steamLoginUrl) ?>" class="btn-steam">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a10 10 0 0 0-10 9.87c0 4.97 3.65 9.09 8.44 9.87l1.7-2.48a4.48 4.48 0 0 1-.68-.82l-2.9 1.18a3.02 3.02 0 0 1-3.66-2.14 3.02 3.02 0 0 1 2.14-3.66c1.37-.36 2.76.32 3.37 1.56l3.14-1.28a4.5 4.5 0 1 1 5.92 5.92l-2.48 1.7A10 10 0 0 0 22 12a10 10 0 0 0-10-10zm0 4.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm-4.7 9.85a1.52 1.52 0 0 0 1.93-1.07 1.52 1.52 0 0 0-1.07-1.93 1.52 1.52 0 0 0-1.93 1.07 1.52 1.52 0 0 0 1.07 1.93z"/></svg>
                    <span>Se connecter avec Steam</span>
                </a>
                <p class="note">🔒 Authentification sécurisée Valve OpenID 2.0.<br>Aucun mot de passe requis.</p>
                <a href="../index.html" class="back-link">← Retour à Hoot Indie Games</a>
            </div>
        </body>
        </html>
        <?php
        exit;
    }

    // C. ACTIONS D'ADMINISTRATION
    $action = trim($_POST['action'] ?? $_GET['action'] ?? '');

    // [SÉCURITÉ CWE-352] Les actions administratives de modification requièrent impérativement POST
    $mutatingActions = [
        'delete_username', 'edit_user', 'toggle_ban_user', 'purge_user_scores',
        'manage_forbidden_names', 'create_user', 'delete_suggestion', 'reset_stats'
    ];
    if (in_array($action, $mutatingActions, true)) {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'error' => 'method_not_allowed',
                'message' => 'Cette action administrative de modification requiert impérativement une requête POST (Protection anti-CSRF CWE-352).'
            ]);
            exit;
        }

        // [SÉCURITÉ CWE-352] Validation du jeton CSRF pour les sessions web d'administration
        if (!empty($_SESSION['admin_auth'])) {
            $csrfToken = trim($_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
            if (!validateAdminCsrfToken($csrfToken)) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'error' => 'csrf_invalid',
                    'message' => 'Jeton de protection CSRF invalide ou expiré. Veuillez recharger la page.'
                ]);
                exit;
            }
        }
    }

    // Modération : Libérer / Supprimer un pseudonyme
    if ($action === 'delete_username') {
        $target = strtolower(trim($_POST['target'] ?? $_GET['target'] ?? ''));
        if (empty($target)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Pseudonyme manquant.']);
            exit;
        }
        if ($target === 'hibouxe') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Le pseudonyme créateur officiel Hibouxe ne peut pas être supprimé.']);
            exit;
        }

        $uFile = __DIR__ . '/registered_usernames.json';
        $uData = loadAndEnsureUsernamesDb($uFile);
        if (isset($uData['usernames'][$target])) {
            $steamIdAssociated = $uData['usernames'][$target]['steamId'] ?? null;
            unset($uData['usernames'][$target]);
            if ($steamIdAssociated && isset($uData['userToName'][$steamIdAssociated])) {
                unset($uData['userToName'][$steamIdAssociated]);
            }
            if ($steamIdAssociated && isset($uData['userToName']['steam_' . $steamIdAssociated])) {
                unset($uData['userToName']['steam_' . $steamIdAssociated]);
            }
            @file_put_contents($uFile, json_encode($uData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
            echo json_encode(['success' => true, 'message' => "Le pseudonyme « {$target} » a été libéré avec succès."]);
            exit;
        }
        echo json_encode(['success' => false, 'message' => 'Pseudonyme non trouvé.']);
        exit;
    }

    // Modération : Modifier un utilisateur (Pseudo, rôle, statut, titre, note)
    if ($action === 'edit_user') {
        $target = strtolower(trim($_POST['target'] ?? $_GET['target'] ?? ''));
        $newDisplayName = trim($_POST['displayName'] ?? $_GET['displayName'] ?? '');
        $newRole = trim($_POST['role'] ?? $_GET['role'] ?? '');
        $newStatus = trim($_POST['status'] ?? $_GET['status'] ?? '');
        $newCustomTitle = trim($_POST['customTitle'] ?? $_GET['customTitle'] ?? '');
        $newNote = trim($_POST['note'] ?? $_GET['note'] ?? '');

        if (empty($target)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Cible utilisateur manquante.']);
            exit;
        }

        $uFile = __DIR__ . '/registered_usernames.json';
        $uData = loadAndEnsureUsernamesDb($uFile);

        if (!isset($uData['usernames'][$target])) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => "L'utilisateur « {$target} » n'existe pas."]);
            exit;
        }

        // Protection inaliénable du compte créateur officiel
        $isCreator = ($target === 'hibouxe');
        if ($isCreator && $newStatus === 'banned') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Le compte créateur ne peut pas être suspendu ou banni.']);
            exit;
        }

        // Renommage éventuel
        if (!empty($newDisplayName) && $newDisplayName !== ($uData['usernames'][$target]['displayName'] ?? '')) {
            $cleanDisplay = htmlspecialchars(strip_tags($newDisplayName), ENT_QUOTES, 'UTF-8');
            $cleanDisplay = preg_replace('/[\x00-\x1F\x7F]/u', '', $cleanDisplay);
            $newNorm = normalizeUsernameAdmin($cleanDisplay);

            if (strlen($cleanDisplay) < 2 || strlen($cleanDisplay) > 24) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Le pseudonyme doit comporter entre 2 et 24 caractères.']);
                exit;
            }

            if ($newNorm !== $target) {
                if (isset($uData['usernames'][$newNorm])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => "Le pseudonyme « {$cleanDisplay} » est déjà réservé par un autre joueur."]);
                    exit;
                }
                // Migration vers la nouvelle clé normalisée
                $uData['usernames'][$newNorm] = $uData['usernames'][$target];
                unset($uData['usernames'][$target]);

                // Mise à jour de la table de correspondance Steam
                $stId = $uData['usernames'][$newNorm]['steamId'] ?? null;
                if ($stId && isset($uData['userToName'][$stId])) {
                    $uData['userToName'][$stId] = $newNorm;
                }
                $target = $newNorm;
            }
            $uData['usernames'][$target]['displayName'] = $cleanDisplay;
        }

        if (!empty($newRole) && in_array($newRole, ['admin', 'moderator', 'vip', 'user'], true)) {
            // Seul Hibouxe peut être administrateur
            $uData['usernames'][$target]['role'] = ($target === 'hibouxe') ? 'admin' : ($newRole === 'admin' ? 'moderator' : $newRole);
        }
        if (!empty($newStatus) && in_array($newStatus, ['active', 'banned'], true)) {
            $uData['usernames'][$target]['status'] = $newStatus;
            $stId = $uData['usernames'][$target]['steamId'] ?? null;
            if ($stId) {
                if (!isset($uData['bannedUsers']) || !is_array($uData['bannedUsers'])) {
                    $uData['bannedUsers'] = [];
                }
                if ($newStatus === 'banned') {
                    if (!in_array($stId, $uData['bannedUsers'])) $uData['bannedUsers'][] = $stId;
                } else {
                    $uData['bannedUsers'] = array_values(array_diff($uData['bannedUsers'], [$stId]));
                }
            }
        }
        if ($newCustomTitle !== '') {
            $uData['usernames'][$target]['customTitle'] = $newCustomTitle;
        }
        if ($newNote !== '') {
            $uData['usernames'][$target]['note'] = $newNote;
        }
        $uData['usernames'][$target]['updatedAt'] = date('c');

        @file_put_contents($uFile, json_encode($uData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        echo json_encode([
            'success' => true,
            'message' => "Utilisateur « {$uData['usernames'][$target]['displayName']} » mis à jour avec succès !",
            'user' => $uData['usernames'][$target]
        ]);
        exit;
    }

    // Modération : Bannir / Débannir un utilisateur
    if ($action === 'toggle_ban_user') {
        $target = strtolower(trim($_POST['target'] ?? $_GET['target'] ?? ''));
        $bannedParam = $_POST['banned'] ?? $_GET['banned'] ?? '1';
        $isBanned = ($bannedParam === '1' || $bannedParam === 'true' || $bannedParam === true);

        if (empty($target)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Cible manquante.']);
            exit;
        }

        if ($target === 'hibouxe') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Le compte créateur ne peut pas être suspendu ou banni.']);
            exit;
        }

        $uFile = __DIR__ . '/registered_usernames.json';
        $uData = loadAndEnsureUsernamesDb($uFile);

        if (!isset($uData['usernames'][$target])) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Utilisateur introuvable.']);
            exit;
        }

        $uData['usernames'][$target]['status'] = $isBanned ? 'banned' : 'active';
        $uData['usernames'][$target]['updatedAt'] = date('c');

        if (!isset($uData['bannedUsers']) || !is_array($uData['bannedUsers'])) {
            $uData['bannedUsers'] = [];
        }
        $stId = $uData['usernames'][$target]['steamId'] ?? null;
        if ($stId) {
            if ($isBanned) {
                if (!in_array($stId, $uData['bannedUsers'])) $uData['bannedUsers'][] = $stId;
            } else {
                $uData['bannedUsers'] = array_values(array_diff($uData['bannedUsers'], [$stId]));
            }
        }

        @file_put_contents($uFile, json_encode($uData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        echo json_encode([
            'success' => true,
            'message' => $isBanned
                ? "L'utilisateur « {$uData['usernames'][$target]['displayName']} » a été banni."
                : "L'utilisateur « {$uData['usernames'][$target]['displayName']} » a été réactivé."
        ]);
        exit;
    }

    // Modération : Purger les scores Leaderboard d'un joueur
    if ($action === 'purge_user_scores') {
        $username = trim($_POST['username'] ?? $_GET['username'] ?? '');
        if (empty($username)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Pseudonyme manquant pour la purge.']);
            exit;
        }

        $lbFile = __DIR__ . '/leaderboard_data.json';
        $deletedCount = 0;
        if (file_exists($lbFile)) {
            $lbData = json_decode(@file_get_contents($lbFile), true) ?: [];
            foreach ($lbData as $catKey => $games) {
                if (is_array($games)) {
                    foreach ($games as $gameKey => $entries) {
                        if (is_array($entries)) {
                            $before = count($entries);
                            $filtered = array_values(array_filter($entries, function($e) use ($username) {
                                return strcasecmp($e['nickname'] ?? '', $username) !== 0;
                            }));
                            $deletedCount += ($before - count($filtered));
                            $lbData[$catKey][$gameKey] = $filtered;
                        }
                    }
                }
            }
            @file_put_contents($lbFile, json_encode($lbData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        }

        echo json_encode([
            'success' => true,
            'message' => "Scores de « {$username} » purgés avec succès ({$deletedCount} entrée(s) supprimée(s))."
        ]);
        exit;
    }

    // Modération : Gestion de la Blacklist des Pseudos Interdits
    if ($action === 'manage_forbidden_names') {
        $subaction = trim($_POST['subaction'] ?? $_GET['subaction'] ?? 'list');
        $rawWord = trim($_POST['word'] ?? $_GET['word'] ?? '');
        $uFile = __DIR__ . '/registered_usernames.json';
        $uData = loadAndEnsureUsernamesDb($uFile);

        if (!isset($uData['forbiddenNames']) || !is_array($uData['forbiddenNames'])) {
            $uData['forbiddenNames'] = ['hibouxe', 'edsaje'];
        }

        if ($subaction === 'add' && !empty($rawWord)) {
            $cleanWord = normalizeUsernameAdmin($rawWord);
            if (!empty($cleanWord) && !in_array($cleanWord, $uData['forbiddenNames'])) {
                $uData['forbiddenNames'][] = $cleanWord;
                @file_put_contents($uFile, json_encode($uData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
            }
            echo json_encode([
                'success' => true,
                'message' => "Le terme « {$cleanWord} » a été ajouté à la blacklist.",
                'forbiddenNames' => $uData['forbiddenNames']
            ]);
            exit;
        }

        if ($subaction === 'remove' && !empty($rawWord)) {
            $cleanWord = normalizeUsernameAdmin($rawWord);
            if ($cleanWord === 'hibouxe' || $cleanWord === 'edsaje') {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Les pseudonymes créateurs sont protégés de façon permanente.']);
                exit;
            }
            $uData['forbiddenNames'] = array_values(array_diff($uData['forbiddenNames'], [$cleanWord]));
            @file_put_contents($uFile, json_encode($uData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
            echo json_encode([
                'success' => true,
                'message' => "Le terme « {$cleanWord} » a été retiré de la blacklist.",
                'forbiddenNames' => $uData['forbiddenNames']
            ]);
            exit;
        }

        echo json_encode(['success' => true, 'forbiddenNames' => $uData['forbiddenNames']]);
        exit;
    }

    // Modération : Créer / Réserver un utilisateur manuellement (Admin)
    if ($action === 'create_user') {
        $rawUsername = trim($_POST['username'] ?? $_GET['username'] ?? '');
        $targetSteamId = trim($_POST['targetSteamId'] ?? $_GET['targetSteamId'] ?? '');
        $role = trim($_POST['role'] ?? $_GET['role'] ?? 'user');
        if (!in_array($role, ['admin', 'moderator', 'vip', 'user'], true)) $role = 'user';
        $customTitle = trim($_POST['customTitle'] ?? $_GET['customTitle'] ?? '');
        $note = trim($_POST['note'] ?? $_GET['note'] ?? '');

        if (empty($rawUsername)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Pseudonyme requis.']);
            exit;
        }

        $cleanDisplay = htmlspecialchars(strip_tags($rawUsername), ENT_QUOTES, 'UTF-8');
        $cleanDisplay = preg_replace('/[\x00-\x1F\x7F]/u', '', $cleanDisplay);
        $norm = normalizeUsernameAdmin($cleanDisplay);

        if (strlen($cleanDisplay) < 2 || strlen($cleanDisplay) > 24) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Le pseudonyme doit comporter entre 2 et 24 caractères.']);
            exit;
        }

        $uFile = __DIR__ . '/registered_usernames.json';
        $uData = loadAndEnsureUsernamesDb($uFile);

        if (isset($uData['usernames'][$norm])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Le pseudonyme « {$cleanDisplay} » est déjà pris."]);
            exit;
        }

        $uData['usernames'][$norm] = [
            'displayName' => $cleanDisplay,
            'steamId' => !empty($targetSteamId) ? $targetSteamId : null,
            'userId' => 'admin_created_' . substr(md5($norm . time()), 0, 8),
            'claimedAt' => date('c'),
            'role' => in_array($role, ['admin', 'vip', 'user'], true) ? $role : 'user',
            'status' => 'active',
            'customTitle' => $customTitle,
            'note' => $note,
            'isAdminReserved' => true
        ];

        if (!empty($targetSteamId)) {
            $uData['userToName'][$targetSteamId] = $norm;
        }

        @file_put_contents($uFile, json_encode($uData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        echo json_encode([
            'success' => true,
            'message' => "L'utilisateur « {$cleanDisplay} » a été créé et réservé avec succès !",
            'user' => $uData['usernames'][$norm]
        ]);
        exit;
    }

    // Modération : Supprimer une suggestion communautaire
    if ($action === 'delete_suggestion') {
        $sugId = trim($_GET['id'] ?? '');
        $sugFile = __DIR__ . '/suggestions.json';
        if (file_exists($sugFile)) {
            $suggestions = json_decode(@file_get_contents($sugFile), true) ?: [];
            $filtered = array_values(array_filter($suggestions, function($s) use ($sugId) {
                return ($s['id'] ?? '') !== $sugId;
            }));
            @file_put_contents($sugFile, json_encode($filtered, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
            echo json_encode(['success' => true, 'message' => 'Suggestion supprimée avec succès.']);
            exit;
        }
        echo json_encode(['success' => false, 'message' => 'Fichier de suggestions introuvable.']);
        exit;
    }

    // Modération : Valider / Approuver un micro-indé
    if ($action === 'approve_micro_indie') {
        $mId = trim($_GET['id'] ?? $_POST['id'] ?? '');
        $mFile = __DIR__ . '/micro_indies.json';
        if (file_exists($mFile)) {
            $items = json_decode(@file_get_contents($mFile), true) ?: [];
            $found = false;
            foreach ($items as &$item) {
                if (($item['id'] ?? '') === $mId) {
                    $item['approved'] = true;
                    $item['approvedAt'] = date('c');
                    $found = true;
                    break;
                }
            }
            if ($found) {
                @file_put_contents($mFile, json_encode($items, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
                echo json_encode(['success' => true, 'message' => 'Micro-indé validé et publié !']);
                exit;
            }
        }
        echo json_encode(['success' => false, 'message' => 'Jeu introuvable dans les micro-indés.']);
        exit;
    }

    // Modération : Supprimer / Rejeter un micro-indé
    if ($action === 'delete_micro_indie') {
        $mId = trim($_GET['id'] ?? $_POST['id'] ?? '');
        $mFile = __DIR__ . '/micro_indies.json';
        if (file_exists($mFile)) {
            $items = json_decode(@file_get_contents($mFile), true) ?: [];
            $filtered = array_values(array_filter($items, function($m) use ($mId) {
                return ($m['id'] ?? '') !== $mId;
            }));
            @file_put_contents($mFile, json_encode($filtered, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
            echo json_encode(['success' => true, 'message' => 'Micro-indé retiré avec succès.']);
            exit;
        }
        echo json_encode(['success' => false, 'message' => 'Fichier des micro-indés introuvable.']);
        exit;
    }

    // Modération : Mettre à jour les métadonnées d'un micro-indé (jaquette, titre, dev...)
    if ($action === 'update_micro_indie') {
        $mId = trim($_POST['id'] ?? $_GET['id'] ?? '');
        $mCover = trim($_POST['coverImage'] ?? $_GET['coverImage'] ?? '');
        $mTitle = trim($_POST['title'] ?? $_GET['title'] ?? '');
        $mDev = trim($_POST['developer'] ?? $_GET['developer'] ?? '');
        $mSteamUrl = trim($_POST['steamUrl'] ?? $_GET['steamUrl'] ?? '');
        $mItchUrl = trim($_POST['itchUrl'] ?? $_GET['itchUrl'] ?? '');
        $mPlayUrl = trim($_POST['playInBrowserUrl'] ?? $_GET['playInBrowserUrl'] ?? '');
        $mPitch = trim($_POST['pitch'] ?? $_GET['pitch'] ?? '');
        $mDiscoveredBy = trim($_POST['discoveredBy'] ?? $_GET['discoveredBy'] ?? '');
        $mPrice = trim($_POST['price'] ?? $_GET['price'] ?? '');
        $mPricingTextRaw = trim($_POST['pricingText'] ?? $_GET['pricingText'] ?? '');

        $mFile = __DIR__ . '/micro_indies.json';
        if (file_exists($mFile)) {
            $items = json_decode(@file_get_contents($mFile), true) ?: [];
            $found = false;
            foreach ($items as &$item) {
                if (($item['id'] ?? '') === $mId) {
                    if (!empty($mCover)) $item['coverImage'] = $mCover;
                    if (!empty($mTitle)) $item['title'] = $mTitle;
                    if (!empty($mDev)) $item['developer'] = $mDev;
                    if (!empty($mSteamUrl)) $item['steamUrl'] = $mSteamUrl;
                    if (!empty($mItchUrl)) $item['itchUrl'] = $mItchUrl;
                    if (!empty($mPlayUrl)) $item['playInBrowserUrl'] = $mPlayUrl;
                    if (!empty($mPitch)) {
                        $item['tagline'] = ['fr' => $mPitch, 'en' => $mPitch];
                        $item['description'] = ['fr' => $mPitch, 'en' => $mPitch];
                    }
                    if (!empty($mDiscoveredBy)) $item['discoveredBy'] = $mDiscoveredBy;
                    if (!empty($mPrice)) {
                        $item['pricingText'] = ['fr' => $mPrice, 'en' => $mPrice];
                        $item['isFree'] = (stripos($mPrice, 'gratuit') !== false || stripos($mPrice, 'free') !== false || $mPrice === '0' || $mPrice === '0€');
                    } elseif (!empty($mPricingTextRaw)) {
                        $pt = json_decode($mPricingTextRaw, true);
                        if (is_array($pt)) {
                            $item['pricingText'] = $pt;
                        } else {
                            $item['pricingText'] = ['fr' => $mPricingTextRaw, 'en' => $mPricingTextRaw];
                        }
                    }
                    $found = true;
                    break;
                }
            }
            unset($item);
            if ($found) {
                @file_put_contents($mFile, json_encode($items, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
                echo json_encode(['success' => true, 'message' => 'Micro-indé mis à jour avec succès.']);
                exit;
            }
        }
        echo json_encode(['success' => false, 'message' => 'Jeu introuvable dans les micro-indés.']);
        exit;
    }

    // Réinitialisation des statistiques
    if ($action === 'reset_stats') {
        $blankStats = [
            'summary' => [
                'pageviews' => 0,
                'unique_visitors' => 0,
                'games_played' => 0,
                'games_won' => 0,
                'versus_played' => 0,
                'steam_clicks' => 0,
                'easter_eggs' => 0,
            ],
            'games' => [
                'screenle' => ['plays' => 0, 'wins' => 0],
                'indledle' => ['plays' => 0, 'wins' => 0],
                'linkle' => ['plays' => 0, 'wins' => 0],
                'versus' => ['plays' => 0, 'wins' => 0],
                'arcade' => ['plays' => 0, 'wins' => 0],
            ],
            'events' => [],
            'referrers' => [],
            'devices' => ['desktop' => 0, 'mobile' => 0, 'tablet' => 0],
            'daily' => [],
            'recent' => [],
            'today_hashes' => [],
        ];
        @file_put_contents($statsFile, json_encode($blankStats, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        echo json_encode(['success' => true, 'message' => 'Métriques réinitialisées avec succès.']);
        exit;
    }

    // D. DASHBOARD ADMINISTRATEUR AUTHENTIFIÉ
    $defaultStats = [
        'summary' => [
            'pageviews' => 0,
            'unique_visitors' => 0,
            'games_played' => 0,
            'games_won' => 0,
            'versus_played' => 0,
            'steam_clicks' => 0,
            'easter_eggs' => 0,
        ],
        'games' => [
            'screenle' => ['plays' => 0, 'wins' => 0],
            'indledle' => ['plays' => 0, 'wins' => 0],
            'linkle' => ['plays' => 0, 'wins' => 0],
            'profille' => ['plays' => 0, 'wins' => 0],
            'chrono' => ['plays' => 0, 'wins' => 0],
            'pixel' => ['plays' => 0, 'wins' => 0],
            'review' => ['plays' => 0, 'wins' => 0],
            'blindtest' => ['plays' => 0, 'wins' => 0],
            'timeattack' => ['plays' => 0, 'wins' => 0],
            'quiz' => ['plays' => 0, 'wins' => 0],
            'versus' => ['plays' => 0, 'wins' => 0],
            'arcade' => ['plays' => 0, 'wins' => 0],
        ],
        'retention' => [
            'returning_visitors' => 0,
            'returning_rate' => 0,
            'streak_rescues' => 0,
            'avg_games_per_visitor' => 0,
            'global_win_rate' => 0,
        ],
        'events' => [],
        'referrers' => [],
        'devices' => ['desktop' => 0, 'mobile' => 0, 'tablet' => 0],
        'daily' => [],
        'recent' => [],
        'today_hashes' => [],
    ];

    $stats = $defaultStats;
    if (file_exists($statsFile)) {
        $content = @file_get_contents($statsFile);
        if ($content) {
            $decoded = json_decode($content, true);
            if (is_array($decoded)) {
                $stats = array_replace_recursive($defaultStats, $decoded);
            }
        }
    }

    // Calcul dynamique des indicateurs de rétention
    $totUniq = max(1, intval($stats['summary']['unique_visitors'] ?? 1));
    $totGames = intval($stats['summary']['games_played'] ?? 0);
    $totWins = intval($stats['summary']['games_won'] ?? 0);
    $retCount = intval($stats['retention']['returning_visitors'] ?? 0);
    $stats['retention']['returning_rate'] = round(($retCount / $totUniq) * 100, 1);
    $stats['retention']['avg_games_per_visitor'] = round($totGames / $totUniq, 2);
    $stats['retention']['global_win_rate'] = $totGames > 0 ? round(($totWins / $totGames) * 100, 1) : 0;

    // Export CSV sécurisé
    if ($action === 'export_csv') {
        $type = $_GET['type'] ?? 'daily';
        $todayStr = date('Y-m-d');
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="hoot_analytics_' . $type . '_' . $todayStr . '.csv"');
        
        $output = fopen('php://output', 'w');
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF)); // BOM UTF-8

        if ($type === 'daily') {
            fputcsv($output, ['Date', 'Pages Vues', 'Parties Jouées', 'Taux de Complétion (%)'], ';');
            if (!empty($stats['daily'])) {
                $sortedDaily = $stats['daily'];
                krsort($sortedDaily);
                foreach ($sortedDaily as $d => $row) {
                    $pv = is_array($row) ? ($row['pageviews'] ?? $row['views'] ?? 0) : intval($row);
                    $gm = is_array($row) ? ($row['games'] ?? 0) : 0;
                    $cr = $pv > 0 ? round(($gm / $pv) * 100, 1) : 0;
                    fputcsv($output, [$d, $pv, $gm, $cr . '%'], ';');
                }
            }
        } elseif ($type === 'games') {
            fputcsv($output, ['Mode de Jeu', 'Parties Lancées', 'Victoires', 'Taux de Réussite (%)'], ';');
            if (!empty($stats['games'])) {
                foreach ($stats['games'] as $gName => $gRow) {
                    $p = intval($gRow['plays'] ?? 0);
                    $w = intval($gRow['wins'] ?? 0);
                    $rate = $p > 0 ? round(($w / $p) * 100, 1) : 0;
                    fputcsv($output, [ucfirst($gName), $p, $w, $rate . '%'], ';');
                }
            }
        } else { // recent events
            fputcsv($output, ['Horodatage', 'Catégorie', 'Événement', 'Détails / Cible', 'Source / Référent', 'Appareil'], ';');
            if (!empty($stats['recent'])) {
                foreach (array_reverse($stats['recent']) as $evt) {
                    $time = $evt['time'] ?? $evt['timestamp'] ?? '';
                    $cat = $evt['category'] ?? '';
                    $ev = $evt['event'] ?? $evt['action'] ?? '';
                    $lbl = !empty($evt['label']) ? $evt['label'] : (!empty($evt['props']) ? json_encode($evt['props'], JSON_UNESCAPED_UNICODE) : '');
                    $ref = $evt['ref'] ?? 'Direct';
                    $dev = $evt['device'] ?? 'desktop';
                    fputcsv($output, [$time, $cat, $ev, $lbl, $ref, $dev], ';');
                }
            }
        }

        fclose($output);
        exit;
    }

    // Export JSON de sauvegarde
    if ($action === 'export_json') {
        $todayStr = date('Y-m-d');
        header('Content-Type: application/json; charset=utf-8');
        header('Content-Disposition: attachment; filename="hoot_analytics_backup_' . $todayStr . '.json"');
        unset($stats['today_hashes']);
        echo json_encode($stats, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Export JSON sécurisé & API React Admin Overview
    if ($isJsonReq || (isset($_GET['format']) && $_GET['format'] === 'json')) {
        header('Content-Type: application/json; charset=utf-8');
        unset($stats['today_hashes']);

        // Chargement des pseudonymes enregistrés
        $uFile = __DIR__ . '/registered_usernames.json';
        $uDec = loadAndEnsureUsernamesDb($uFile);
        $uList = [];
        $bannedCount = 0;
        foreach ($uDec['usernames'] as $k => $u) {
            $isBanned = ($u['status'] ?? '') === 'banned';
            if ($isBanned) $bannedCount++;
            $isCreator = ($k === 'hibouxe' && ($u['steamId'] ?? '') === ADMIN_STEAM_ID);
            $uList[] = [
                'normalized' => $k,
                'displayName' => $u['displayName'] ?? $k,
                'steamId' => $u['steamId'] ?? null,
                'userId' => $u['userId'] ?? null,
                'claimedAt' => $u['claimedAt'] ?? '',
                'lastSeenAt' => $u['lastSeenAt'] ?? '',
                'role' => $isCreator ? 'admin' : (($u['role'] ?? '') === 'admin' ? 'user' : ($u['role'] ?? 'user')),
                'status' => $u['status'] ?? 'active',
                'customTitle' => $u['customTitle'] ?? '',
                'note' => $u['note'] ?? '',
                'isAdminReserved' => $isCreator,
            ];
        }
        $customForbidden = isset($uDec['forbiddenNames']) && is_array($uDec['forbiddenNames']) ? $uDec['forbiddenNames'] : [];
        $allForbidden = array_values(array_unique(array_merge(['hibouxe', 'edsaje', 'admin'], $customForbidden)));
        $usernamesData = [
            'total' => count($uList),
            'list' => $uList,
            'forbiddenNames' => $allForbidden,
            'bannedCount' => $bannedCount
        ];

        // Chargement des suggestions de jeux
        $sFile = __DIR__ . '/suggestions.json';
        $suggestionsData = ['total' => 0, 'list' => []];
        if (file_exists($sFile)) {
            $sRaw = @file_get_contents($sFile);
            if ($sRaw) {
                $sDec = json_decode($sRaw, true);
                if (is_array($sDec)) {
                    $suggestionsData = ['total' => count($sDec), 'list' => array_reverse($sDec)];
                }
            }
        }

        // Chargement du statut du leaderboard
        $lbFile = __DIR__ . '/leaderboard_data.json';
        $leaderboardData = ['totalEntries' => 0, 'categories' => []];
        if (file_exists($lbFile)) {
            $lbRaw = @file_get_contents($lbFile);
            if ($lbRaw) {
                $lbDec = json_decode($lbRaw, true);
                if (is_array($lbDec)) {
                    $tot = 0;
                    $cats = [];
                    foreach ($lbDec as $cat => $games) {
                        if (is_array($games)) {
                            $cats[$cat] = [];
                            foreach ($games as $g => $entries) {
                                $c = is_array($entries) ? count($entries) : 0;
                                $tot += $c;
                                $cats[$cat][$g] = $c;
                            }
                        }
                    }
                    $leaderboardData = ['totalEntries' => $tot, 'categories' => $cats];
                }
            }
        }

        // Chargement des micro-indés soumis
        $mFile = __DIR__ . '/micro_indies.json';
        $microIndiesData = ['total' => 0, 'pending' => 0, 'approved' => 0, 'list' => []];
        if (file_exists($mFile)) {
            $mRaw = @file_get_contents($mFile);
            if ($mRaw) {
                $mDec = json_decode($mRaw, true);
                if (is_array($mDec)) {
                    $mModified = false;
                    foreach ($mDec as &$mItem) {
                        $cover = $mItem['coverImage'] ?? '';
                        $steamUrl = $mItem['steamUrl'] ?? '';
                        $isDefaultCover = empty($cover) || strpos($cover, '2420510') !== false;
                        if ($isDefaultCover && !empty($steamUrl)) {
                            if (preg_match('#/app/(\d+)#', $steamUrl, $matches)) {
                                $mItem['coverImage'] = "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/{$matches[1]}/header.jpg";
                                $mModified = true;
                            }
                        }
                        if (($mItem['id'] ?? '') === 'micro-crescent-bloom-2d61c0' || stripos($mItem['title'] ?? '', 'Crescent Bloom') !== false) {
                            $proper = 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1953920/header.jpg';
                            if (($mItem['coverImage'] ?? '') !== $proper) {
                                $mItem['coverImage'] = $proper;
                                $mModified = true;
                            }
                        }
                    }
                    unset($mItem);
                    if ($mModified) {
                        @file_put_contents($mFile, json_encode($mDec, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
                    }

                    $mPending = count(array_filter($mDec, function($item) { return empty($item['approved']); }));
                    $mApproved = count(array_filter($mDec, function($item) { return !empty($item['approved']); }));
                    $microIndiesData = [
                        'total' => count($mDec),
                        'pending' => $mPending,
                        'approved' => $mApproved,
                        'list' => array_reverse($mDec)
                    ];
                }
            }
        }

        $system = [
            'serverTime' => date('c'),
            'statsFileSize' => file_exists($statsFile) ? filesize($statsFile) : 0,
            'usernamesFileSize' => file_exists($uFile) ? filesize($uFile) : 0,
            'suggestionsFileSize' => file_exists($sFile) ? filesize($sFile) : 0,
            'microIndiesFileSize' => file_exists($mFile) ? filesize($mFile) : 0,
            'leaderboardFileSize' => file_exists($lbFile) ? filesize($lbFile) : 0,
            'adminSteamId' => ADMIN_STEAM_ID,
        ];

        echo json_encode([
            'success' => true,
            'admin' => true,
            'analytics' => $stats,
            'usernames' => $usernamesData,
            'suggestions' => $suggestionsData,
            'microIndies' => $microIndiesData,
            'leaderboard' => $leaderboardData,
            'system' => $system,
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }

    header('Content-Type: text/html; charset=utf-8');
    ?>
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tableau de Bord Analytics | Hoot Indie Games</title>
        <style>
            :root {
                --bg: #070b13;
                --card-bg: rgba(15, 23, 42, 0.75);
                --accent-amber: #f59e0b;
                --accent-emerald: #10b981;
                --accent-cyan: #06b6d4;
                --text: #f8fafc;
                --text-muted: #94a3b8;
                --border: rgba(245, 158, 11, 0.2);
            }
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            body { background: var(--bg); color: var(--text); padding: 2rem 1.25rem; min-height: 100vh; }
            .container { max-width: 1080px; margin: 0 auto; }
            
            .header-bar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1.25rem; }
            .header-bar h1 { color: var(--accent-amber); font-size: 1.75rem; display: flex; align-items: center; gap: 10px; }
            .badge-sovereign { display: inline-flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.12); color: var(--accent-emerald); border: 1px solid rgba(16, 185, 129, 0.3); padding: 4px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
            
            .actions-bar { display: flex; gap: 0.6rem; align-items: center; }
            .btn { background: var(--accent-amber); color: #070b13; border: none; padding: 0.55rem 1rem; border-radius: 8px; font-weight: 700; cursor: pointer; text-decoration: none; font-size: 0.85rem; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px; }
            .btn:hover { background: #fbbf24; }
            .btn-outline { background: rgba(255,255,255,0.06); color: var(--text); border: 1px solid rgba(255,255,255,0.12); }
            .btn-outline:hover { background: rgba(255,255,255,0.12); }
            .btn-danger { background: rgba(239, 68, 68, 0.15); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); }
            .btn-danger:hover { background: rgba(239, 68, 68, 0.3); }

            .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
            .card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem; backdrop-filter: blur(10px); box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
            .card-title { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 0.5rem; }
            .card-value { font-size: 2rem; font-weight: 800; color: var(--accent-amber); }
            .card-value.emerald { color: var(--accent-emerald); }
            .card-value.cyan { color: var(--accent-cyan); }
            
            .section-title { color: var(--accent-amber); margin: 2.2rem 0 1rem; font-size: 1.2rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; display: flex; align-items: center; gap: 8px; }

            .games-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
            .game-stat { background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 1rem; }
            .game-stat h3 { font-size: 0.95rem; color: var(--text); margin-bottom: 0.4rem; }
            .game-stat .plays { font-size: 1.3rem; font-weight: bold; color: var(--accent-amber); }
            .game-stat .wins { font-size: 0.82rem; color: var(--accent-emerald); margin-top: 2px; }

            .two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
            @media (max-width: 768px) { .two-cols { grid-template-columns: 1fr; } }

            table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; font-size: 0.88rem; }
            th, td { padding: 0.7rem 0.6rem; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.06); }
            th { color: var(--text-muted); font-weight: 600; font-size: 0.78rem; text-transform: uppercase; }
            
            .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; }
            .badge-game { background: rgba(245, 158, 11, 0.15); color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.3); }
            .badge-win { background: rgba(16, 185, 129, 0.15); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.3); }
            .badge-nav { background: rgba(6, 182, 212, 0.15); color: #67e8f9; border: 1px solid rgba(6, 182, 212, 0.3); }
            .badge-steam { background: rgba(99, 102, 241, 0.15); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.3); }

            .recent-list { max-height: 440px; overflow-y: auto; }
            .footer-note { text-align: center; margin-top: 3rem; font-size: 0.8rem; color: #64748b; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header-bar">
                <div>
                    <h1>🦉 Hoot Indie Games <span class="badge-sovereign">Télémétrie Souveraine</span></h1>
                    <p style="color: var(--text-muted); font-size: 0.88rem; margin-top: 4px;">Analytics serveur 100% anonymisées, cookieless et conformes RGPD hébergées sur OVHcloud.</p>
                    <div style="display: inline-flex; align-items: center; gap: 8px; margin-top: 8px; font-size: 0.8rem; background: rgba(245, 158, 11, 0.12); color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.3); padding: 4px 12px; border-radius: 9999px;">
                        👑 Administrateur Authentifié Steam : <strong><?= htmlspecialchars($_SESSION['admin_steam_id'] ?? ADMIN_STEAM_ID) ?></strong>
                    </div>
                </div>
                <div class="actions-bar">
                    <button class="btn btn-outline" onclick="location.reload()">🔄 Actualiser</button>
                    <a href="track.php?action=export_csv&type=daily" class="btn btn-outline" title="Exporter les jours en CSV">📊 CSV Jours</a>
                    <a href="track.php?action=export_csv&type=games" class="btn btn-outline" title="Exporter les jeux en CSV">🎮 CSV Jeux</a>
                    <a href="track.php?action=export_csv&type=recent" class="btn btn-outline" title="Exporter les logs en CSV">📝 CSV Logs</a>
                    <a href="track.php?action=export_json" class="btn btn-outline" title="Sauvegarde JSON">💾 JSON</a>
                    <a href="../index.html" class="btn">← Site</a>
                    <a href="track.php?action=logout" class="btn btn-danger">🚪 Quitter</a>
                </div>
            </div>

            <!-- KPIs -->
            <div class="kpi-grid">
                <div class="card">
                    <div class="card-title">Pages Vues</div>
                    <div class="card-value"><?= number_format($stats['summary']['pageviews'] ?? 0) ?></div>
                </div>
                <div class="card">
                    <div class="card-title">Visiteurs Uniques Estimés</div>
                    <div class="card-value cyan"><?= number_format($stats['summary']['unique_visitors'] ?? 0) ?></div>
                </div>
                <div class="card">
                    <div class="card-title">Parties Jouées (Total)</div>
                    <div class="card-value"><?= number_format($stats['summary']['games_played'] ?? 0) ?></div>
                </div>
                <div class="card">
                    <div class="card-title">Victoires Confirmées</div>
                    <div class="card-value emerald"><?= number_format($stats['summary']['games_won'] ?? 0) ?></div>
                </div>
                <div class="card">
                    <div class="card-title">Fidélité / Récurrents</div>
                    <div class="card-value cyan" style="font-size: 1.55rem;">
                        <?= (int)($stats['retention']['returning_visitors'] ?? 0) ?>
                        <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: normal;">(<?= ($stats['retention']['returning_rate'] ?? 0) ?>%)</span>
                    </div>
                </div>
                <div class="card">
                    <div class="card-title">Moyenne Jeux / Visiteur</div>
                    <div class="card-value emerald" style="font-size: 1.55rem;"><?= ($stats['retention']['avg_games_per_visitor'] ?? 0) ?></div>
                </div>
                <div class="card">
                    <div class="card-title">Rattrapages Flamme J-1</div>
                    <div class="card-value" style="font-size: 1.55rem; color: #f59e0b;"><?= (int)($stats['retention']['streak_rescues'] ?? 0) ?></div>
                </div>
                <div class="card">
                    <div class="card-title">Clics Steam & Pépites</div>
                    <div class="card-value" style="font-size: 1.55rem; color: #818cf8;"><?= number_format($stats['summary']['steam_clicks'] ?? 0) ?></div>
                </div>
            </div>

            <!-- ACTIVITÉ DES JEUX (12 MODES) -->
            <h2 class="section-title">🎮 Activité par Mode de Jeu (12 Disciplines & Modes)</h2>
            <div class="games-grid">
                <?php
                $fullGamesList = [
                    'screenle' => ['label' => 'Screenle (Capture)', 'icon' => '🖼️'],
                    'indledle' => ['label' => 'Indledle (Classic)', 'icon' => '💡'],
                    'linkle' => ['label' => 'Linkle (Connexions)', 'icon' => '🧩'],
                    'profille' => ['label' => 'Profille (Studio)', 'icon' => '👤'],
                    'chrono' => ['label' => 'Chrono (Timeline)', 'icon' => '⏳'],
                    'pixel' => ['label' => 'Pixel (Silhouette)', 'icon' => '👾'],
                    'review' => ['label' => 'Review (Critique)', 'icon' => '⭐'],
                    'blindtest' => ['label' => 'Blind Test (OST)', 'icon' => '🎵'],
                    'timeattack' => ['label' => 'Time Attack (Sprint)', 'icon' => '⚡'],
                    'quiz' => ['label' => 'Quiz Indé', 'icon' => '❓'],
                    'versus' => ['label' => 'Versus Arena 1v1', 'icon' => '⚔️'],
                    'arcade' => ['label' => 'Salle d\'Arcade', 'icon' => '🕹️'],
                ];
                foreach ($fullGamesList as $gKey => $gMeta):
                    $p = intval($stats['games'][$gKey]['plays'] ?? 0);
                    $w = intval($stats['games'][$gKey]['wins'] ?? 0);
                    $rate = $p > 0 ? round(($w / $p) * 100, 1) : 0;
                ?>
                    <div class="game-stat">
                        <h3><?= $gMeta['icon'] ?> <?= htmlspecialchars($gMeta['label']) ?></h3>
                        <div class="plays"><?= $p ?> parties</div>
                        <div class="wins">🏆 <?= $w ?> victoires (<?= $rate ?>%)</div>
                    </div>
                <?php endforeach; ?>
            </div>

            <!-- SOURCES & APPAREILS -->
            <div class="two-cols">
                <div class="card">
                    <div class="card-title">Sources de Trafic (Referrers)</div>
                    <table>
                        <thead><tr><th>Origine</th><th style="text-align: right;">Visites</th></tr></thead>
                        <tbody>
                            <?php if (empty($stats['referrers'])): ?>
                                <tr><td colspan="2" style="color: var(--text-muted);">Aucune donnée pour l'instant.</td></tr>
                            <?php else: ?>
                                <?php arsort($stats['referrers']); foreach ($stats['referrers'] as $ref => $count): ?>
                                    <tr>
                                        <td><strong><?= htmlspecialchars(ucfirst($ref)) ?></strong></td>
                                        <td style="text-align: right; font-weight: bold;"><?= (int)$count ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>

                <div class="card">
                    <div class="card-title">Appareils Utilisés</div>
                    <table>
                        <thead><tr><th>Terminal</th><th style="text-align: right;">Part</th></tr></thead>
                        <tbody>
                            <tr><td>🖥️ Ordinateur (Desktop)</td><td style="text-align: right; font-weight: bold;"><?= (int)($stats['devices']['desktop'] ?? 0) ?></td></tr>
                            <tr><td>📱 Smartphone (Mobile)</td><td style="text-align: right; font-weight: bold;"><?= (int)($stats['devices']['mobile'] ?? 0) ?></td></tr>
                            <tr><td>📟 Tablette</td><td style="text-align: right; font-weight: bold;"><?= (int)($stats['devices']['tablet'] ?? 0) ?></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- DERNIÈRES ACTIVITÉS & RECHERCHE INSTANTANÉE -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin: 2.2rem 0 1rem;">
                <h2 class="section-title" style="margin: 0; border: none; padding: 0;">⏱️ Journal des Dernières Activités</h2>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="text" id="liveSearchInput" onkeyup="filterLiveFeed()" placeholder="Filtrer en direct (ex: screenle, mobile, steam...)" style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); color: #fff; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; min-width: 260px;">
                    <button class="btn btn-outline" style="padding: 5px 10px; font-size: 0.75rem;" onclick="filterCategory('all')">Tous</button>
                    <button class="btn btn-outline" style="padding: 5px 10px; font-size: 0.75rem;" onclick="filterCategory('game')">Jeux</button>
                    <button class="btn btn-outline" style="padding: 5px 10px; font-size: 0.75rem;" onclick="filterCategory('navigation')">Pages</button>
                    <button class="btn btn-outline" style="padding: 5px 10px; font-size: 0.75rem;" onclick="filterCategory('steam')">Steam</button>
                </div>
            </div>

            <div class="card recent-list">
                <table id="liveFeedTable">
                    <thead><tr><th>Date & Heure</th><th>Catégorie</th><th>Événement</th><th>Détails</th><th>Source</th><th>Terminal</th></tr></thead>
                    <tbody>
                        <?php if (empty($stats['recent'])): ?>
                            <tr><td colspan="6" style="color: var(--text-muted); text-align: center; padding: 2rem;">Aucune activité enregistrée.</td></tr>
                        <?php else: ?>
                            <?php foreach (array_reverse($stats['recent']) as $act): ?>
                                <?php
                                    $ev = $act['event'] ?? '';
                                    $cat = $act['category'] ?? 'general';
                                    $badgeClass = 'badge-game';
                                    if (strpos($ev, 'win') !== false || strpos($ev, 'complete') !== false) $badgeClass = 'badge-win';
                                    elseif ($cat === 'navigation' || strpos($ev, 'view') !== false || strpos($ev, 'tab') !== false) $badgeClass = 'badge-nav';
                                    elseif (strpos($ev, 'steam') !== false) $badgeClass = 'badge-steam';
                                    $details = !empty($act['label']) ? $act['label'] : (!empty($act['props']) ? json_encode($act['props'], JSON_UNESCAPED_UNICODE) : '');
                                ?>
                                <tr class="feed-row" data-category="<?= htmlspecialchars($cat) ?>">
                                    <td style="color: var(--text-muted); font-size: 0.8rem; white-space: nowrap;"><?= htmlspecialchars($act['time'] ?? '') ?></td>
                                    <td>
                                        <span class="badge <?= $badgeClass ?>"><?= htmlspecialchars($cat) ?></span>
                                    </td>
                                    <td style="font-weight: 600;"><?= htmlspecialchars($ev) ?></td>
                                    <td style="color: #cbd5e1; font-size: 0.82rem; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><?= htmlspecialchars($details) ?></td>
                                    <td style="color: var(--text-muted);"><?= htmlspecialchars($act['ref'] ?? 'Direct') ?></td>
                                    <td style="color: var(--text-muted); text-transform: uppercase; font-size: 0.75rem;"><?= htmlspecialchars($act['device'] ?? 'desktop') ?></td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>

            <script>
                function filterLiveFeed() {
                    var query = (document.getElementById('liveSearchInput').value || '').toLowerCase().trim();
                    var rows = document.querySelectorAll('#liveFeedTable tbody tr.feed-row');
                    rows.forEach(function(row) {
                        var text = row.innerText.toLowerCase();
                        row.style.display = (query === '' || text.indexOf(query) !== -1) ? '' : 'none';
                    });
                }
                function filterCategory(cat) {
                    var rows = document.querySelectorAll('#liveFeedTable tbody tr.feed-row');
                    rows.forEach(function(row) {
                        if (cat === 'all') {
                            row.style.display = '';
                        } else {
                            var rowCat = row.getAttribute('data-category') || '';
                            row.style.display = (rowCat.indexOf(cat) !== -1) ? '' : 'none';
                        }
                    });
                }
            </script>

            <!-- GESTION DES UTILISATEURS & PSEUDONYMES -->
            <?php
            $uDbFile = __DIR__ . '/registered_usernames.json';
            $uDbData = loadAndEnsureUsernamesDb($uDbFile);
            $registeredUsersList = $uDbData['usernames'] ?? [];
            ?>
            <h2 class="section-title">👥 Gestion des Utilisateurs & Pseudos (<?= count($registeredUsersList) ?>)</h2>
            <div class="card" style="margin-bottom: 2rem;">
                <table>
                    <thead>
                        <tr>
                            <th>Pseudonyme</th>
                            <th>Steam ID / Compte</th>
                            <th>Rôle</th>
                            <th>Statut</th>
                            <th>Titre / Note</th>
                            <th>Inscrit le</th>
                            <th style="text-align: right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($registeredUsersList)): ?>
                            <tr><td colspan="7" style="color: var(--text-muted); padding: 1.2rem; text-align: center;">Aucun utilisateur enregistré pour le moment.</td></tr>
                        <?php else: ?>
                            <?php foreach ($registeredUsersList as $normKey => $u):
                                $isCreator = ($normKey === 'hibouxe' && ($u['steamId'] ?? '') === ADMIN_STEAM_ID);
                                $isBanned = ($u['status'] ?? '') === 'banned';
                                $role = $isCreator ? 'admin' : (($u['role'] ?? '') === 'admin' ? 'user' : ($u['role'] ?? 'user'));
                            ?>
                                <tr>
                                    <td>
                                        <strong style="color: #fff; font-size: 0.95rem;"><?= htmlspecialchars($u['displayName'] ?? $normKey) ?></strong>
                                        <div style="color: var(--text-muted); font-size: 0.75rem; font-family: monospace;"><?= htmlspecialchars($normKey) ?></div>
                                    </td>
                                    <td>
                                        <?php if (!empty($u['steamId'])): ?>
                                            <a href="https://steamcommunity.com/profiles/<?= htmlspecialchars($u['steamId']) ?>" target="_blank" style="color: #06b6d4; text-decoration: none; font-family: monospace; font-size: 0.82rem;">
                                                🎮 <?= htmlspecialchars($u['steamId']) ?> ↗
                                            </a>
                                        <?php else: ?>
                                            <span style="color: var(--text-muted); font-size: 0.8rem;"><?= htmlspecialchars($u['userId'] ?? 'Local') ?></span>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <?php if ($isCreator): ?>
                                            <span class="badge" style="background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.4);">👑 Créateur</span>
                                        <?php elseif ($role === 'vip'): ?>
                                            <span class="badge" style="background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4);">⭐ VIP</span>
                                        <?php else: ?>
                                            <span class="badge" style="background: rgba(148, 163, 184, 0.15); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.25);">Joueur</span>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <?php if ($isBanned): ?>
                                            <span class="badge" style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4);">🚫 Banni</span>
                                        <?php else: ?>
                                            <span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4);">✓ Actif</span>
                                        <?php endif; ?>
                                    </td>
                                    <td style="font-size: 0.8rem; color: #cbd5e1;">
                                        <?php if (!empty($u['customTitle'])): ?>
                                            <div style="font-weight: 600; color: #f59e0b;"><?= htmlspecialchars($u['customTitle']) ?></div>
                                        <?php endif; ?>
                                        <?php if (!empty($u['note'])): ?>
                                            <div style="color: var(--text-muted); font-style: italic;"><?= htmlspecialchars($u['note']) ?></div>
                                        <?php endif; ?>
                                        <?php if (empty($u['customTitle']) && empty($u['note'])): ?>
                                            <span style="color: var(--text-muted);">—</span>
                                        <?php endif; ?>
                                    </td>
                                    <td style="color: var(--text-muted); font-size: 0.8rem; white-space: nowrap;">
                                        <?= !empty($u['claimedAt']) ? htmlspecialchars(date('d/m/Y', strtotime($u['claimedAt']))) : '—' ?>
                                    </td>
                                    <td style="text-align: right; white-space: nowrap;">
                                        <?php if (!$isCreator): ?>
                                            <?php $adminCsrf = getAdminCsrfToken(); ?>
                                            <form method="POST" action="track.php" style="display:inline;">
                                                <input type="hidden" name="action" value="toggle_ban_user">
                                                <input type="hidden" name="target" value="<?= htmlspecialchars($normKey) ?>">
                                                <input type="hidden" name="banned" value="<?= $isBanned ? '0' : '1' ?>">
                                                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($adminCsrf) ?>">
                                                <button type="submit" class="btn" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; <?= $isBanned ? 'background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4);' : 'background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3);' ?> border-radius: 6px; margin-right: 4px; cursor: pointer;">
                                                    <?= $isBanned ? 'Débannir' : 'Bannir' ?>
                                                </button>
                                            </form>
                                            <form method="POST" action="track.php" style="display:inline;" onsubmit="return confirm('Voulez-vous vraiment libérer ce pseudo ?');">
                                                <input type="hidden" name="action" value="delete_username">
                                                <input type="hidden" name="target" value="<?= htmlspecialchars($normKey) ?>">
                                                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($adminCsrf) ?>">
                                                <button type="submit" class="btn" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; background: rgba(255,255,255,0.06); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; cursor: pointer;">
                                                    Libérer
                                                </button>
                                            </form>
                                        <?php else: ?>
                                            <span style="font-size: 0.75rem; color: #f59e0b; font-weight: bold;">Inaliénable 🔒</span>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>

            <!-- SUGGESTIONS DE JEUX DE LA COMMUNAUTÉ -->
            <?php
            $communitySuggestions = [];
            $sugFile = __DIR__ . '/suggestions.json';
            if (file_exists($sugFile)) {
                $communitySuggestions = json_decode(@file_get_contents($sugFile), true) ?: [];
            }
            ?>
            <h2 class="section-title">💡 Suggestions de Jeux de la Communauté (<?= count($communitySuggestions) ?>)</h2>
            <div class="card" style="margin-bottom: 2rem;">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>AppID</th>
                            <th>Titre du Jeu</th>
                            <th>Studio</th>
                            <th>Année</th>
                            <th>Genres</th>
                            <th>Commentaire joueur</th>
                            <th>Lien Steam</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($communitySuggestions)): ?>
                            <tr><td colspan="8" style="color: var(--text-muted); padding: 1.2rem;">Aucune suggestion soumise pour le moment. Les suggestions envoyées depuis le site apparaîtront ici.</td></tr>
                        <?php else: ?>
                            <?php foreach (array_reverse($communitySuggestions) as $sug): ?>
                                <tr>
                                    <td style="color: var(--text-muted); font-size: 0.8rem; white-space: nowrap;"><?= htmlspecialchars($sug['submittedAt'] ?? '') ?></td>
                                    <td><code style="color: #f59e0b; font-weight: bold;"><?= htmlspecialchars((string)($sug['appId'] ?? '')) ?></code></td>
                                    <td style="font-weight: 700; color: #fff;"><?= htmlspecialchars($sug['title'] ?? '') ?></td>
                                    <td style="color: #94a3b8;"><?= htmlspecialchars($sug['developer'] ?? '') ?></td>
                                    <td><?= htmlspecialchars((string)($sug['releaseYear'] ?? '')) ?></td>
                                    <td style="font-size: 0.82rem; color: #34d399;"><?= htmlspecialchars(implode(', ', $sug['genres'] ?? [])) ?></td>
                                    <td style="font-size: 0.82rem; color: #cbd5e1; max-width: 280px; word-break: break-word;"><?= htmlspecialchars($sug['comment'] ?? '—') ?></td>
                                    <td>
                                        <?php if (!empty($sug['appId'])): ?>
                                            <a href="https://store.steampowered.com/app/<?= (int)$sug['appId'] ?>/" target="_blank" rel="noopener noreferrer" style="color: #60a5fa; text-decoration: underline; font-weight: 600;">Steam ↗</a>
                                        <?php else: ?>—<?php endif; ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>

            <p class="footer-note">Hoot Indie Games Tracker • Confidentialité préservée (aucune IP brute, aucun cookie persistant) • Développé par Quentin Beaud</p>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// -------------------------------------------------------------
// 2. ENREGISTREMENT D'UN ÉVÉNEMENT TÉLÉMÉTRIE (POST)
// -------------------------------------------------------------
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée. Utilisez POST.']);
    exit;
}

if (!checkTrackRateLimit($clientIp, $rateLimitFile)) {
    http_response_code(429);
    echo json_encode(['error' => 'Trop de requêtes. Veuillez patienter.']);
    exit;
}

$rawInput = file_get_contents('php://input');
$payload = json_decode($rawInput, true);

if (!is_array($payload) || empty($payload['event'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Payload JSON invalide.']);
    exit;
}

$event = trim(strval($payload['event']));
$category = trim(strval($payload['category'] ?? 'general'));
$label = trim(strval($payload['label'] ?? ''));
$value = isset($payload['value']) ? intval($payload['value']) : null;

// Validation d'événement
$isAllowed = false;
$allowedPrefixes = [
    'page_', 'tab_', 'screenle_', 'indledle_', 'linkle_', 'profille_',
    'chrono_', 'pixel_', 'review_', 'blindtest_', 'timeattack_', 'quiz_',
    'versus_', 'arcade_', 'game_', 'steam_', 'easter_', 'sound_', 'lang_',
    'streak_', 'friend_'
];
foreach ($allowedPrefixes as $prefix) {
    if (strpos($event, $prefix) === 0) {
        $isAllowed = true;
        break;
    }
}
$allowedExactEvents = [
    'page_view', 'tab_change', 'steam_redirect', 'easter_egg',
    'sound_toggle', 'language_toggle', 'streak_rescue_yesterday', 'versus_challenge'
];
if (in_array($event, $allowedExactEvents, true)) {
    $isAllowed = true;
}

if (!$isAllowed) {
    http_response_code(400);
    echo json_encode(['error' => 'Événement non autorisé.']);
    exit;
}

// Nettoyage et assainissement des propriétés
$props = [];
if (!empty($payload['props']) && is_array($payload['props'])) {
    foreach ($payload['props'] as $k => $v) {
        $cleanKey = preg_replace('/[^a-zA-Z0-9_-]/', '', substr(strval($k), 0, 32));
        $cleanVal = preg_replace('/[^\p{L}\p{N}\s_\-.:\/]/u', '', substr(strval($v), 0, 64));
        if (!empty($cleanKey)) {
            $props[$cleanKey] = $cleanVal;
        }
    }
}

// Referrer et Appareil
$rawRef = $payload['referrer'] ?? $payload['props']['source'] ?? $_SERVER['HTTP_REFERER'] ?? '';
$referrer = parseReferrer($rawRef);
$device = detectDevice();
$today = date('Y-m-d');
$yesterday = date('Y-m-d', strtotime('-1 day'));
$nowStr = date('Y-m-d H:i:s');

// Structure par défaut complète
$defaultStats = [
    'summary' => [
        'pageviews' => 0,
        'unique_visitors' => 0,
        'games_played' => 0,
        'games_won' => 0,
        'versus_played' => 0,
        'steam_clicks' => 0,
        'easter_eggs' => 0,
    ],
    'games' => [
        'screenle' => ['plays' => 0, 'wins' => 0],
        'indledle' => ['plays' => 0, 'wins' => 0],
        'linkle' => ['plays' => 0, 'wins' => 0],
        'profille' => ['plays' => 0, 'wins' => 0],
        'chrono' => ['plays' => 0, 'wins' => 0],
        'pixel' => ['plays' => 0, 'wins' => 0],
        'review' => ['plays' => 0, 'wins' => 0],
        'blindtest' => ['plays' => 0, 'wins' => 0],
        'timeattack' => ['plays' => 0, 'wins' => 0],
        'quiz' => ['plays' => 0, 'wins' => 0],
        'versus' => ['plays' => 0, 'wins' => 0],
        'arcade' => ['plays' => 0, 'wins' => 0],
    ],
    'retention' => [
        'returning_visitors' => 0,
        'returning_rate' => 0,
        'streak_rescues' => 0,
        'avg_games_per_visitor' => 0,
        'global_win_rate' => 0,
    ],
    'events' => [],
    'referrers' => [],
    'devices' => ['desktop' => 0, 'mobile' => 0, 'tablet' => 0],
    'daily' => [],
    'recent' => [],
    'today_hashes' => [],
];

// Ouverture transactionnelle et verrouillage exclusif
$fp = @fopen($statsFile, 'c+');
if (!$fp) {
    // Échec gracieux : ne pas exposer d'erreur HTTP 500 sur le tracking analytics non critique
    echo json_encode(['success' => true, 'tracked' => false, 'notice' => 'storage_temporarily_unavailable']);
    exit;
}
flock($fp, LOCK_EX);

$fsize = filesize($statsFile);
$rawStats = $fsize > 0 ? fread($fp, $fsize) : '';
$stats = $defaultStats;
if (!empty($rawStats)) {
    $decoded = json_decode($rawStats, true);
    if (is_array($decoded)) {
        $stats = array_replace_recursive($defaultStats, $decoded);
    }
}

// Calcul de visiteur unique anonymisé quotidien & détection de rétention
$dailySaltHash = hash('sha256', $today . '_' . $clientIp . '_' . $serverSecret);
$hashKey = substr($dailySaltHash, 0, 16);

if (isset($stats['today_hashes']) && is_array($stats['today_hashes'])) {
    foreach (array_keys($stats['today_hashes']) as $dKey) {
        if ($dKey !== $today && $dKey !== $yesterday) {
            unset($stats['today_hashes'][$dKey]);
        }
    }
} else {
    $stats['today_hashes'] = [];
}

if (!isset($stats['today_hashes'][$today]) || !is_array($stats['today_hashes'][$today])) {
    $stats['today_hashes'][$today] = [];
}

if (!isset($stats['today_hashes'][$today][$hashKey])) {
    $stats['today_hashes'][$today][$hashKey] = 1;
    $stats['summary']['unique_visitors'] = ($stats['summary']['unique_visitors'] ?? 0) + 1;

    // Détection visiteur récurrent (déjà présent hier)
    if (isset($stats['today_hashes'][$yesterday][$hashKey])) {
        $stats['retention']['returning_visitors'] = ($stats['retention']['returning_visitors'] ?? 0) + 1;
    }
}

// Incréments des compteurs globaux
if ($event === 'page_view') {
    $stats['summary']['pageviews'] = ($stats['summary']['pageviews'] ?? 0) + 1;
}

if (strpos($event, 'steam_') !== false || $label === 'steam' || isset($props['steamUrl'])) {
    $stats['summary']['steam_clicks'] = ($stats['summary']['steam_clicks'] ?? 0) + 1;
}

if ($event === 'easter_egg') {
    $stats['summary']['easter_eggs'] = ($stats['summary']['easter_eggs'] ?? 0) + 1;
}

if (strpos($event, 'streak_rescue') !== false) {
    $stats['retention']['streak_rescues'] = ($stats['retention']['streak_rescues'] ?? 0) + 1;
}

// Incréments par jeu pour l'ensemble des 12 disciplines & modes
$gameDisciplines = [
    'screenle', 'indledle', 'linkle', 'profille', 'chrono', 'pixel',
    'review', 'blindtest', 'timeattack', 'quiz', 'versus', 'arcade'
];

foreach ($gameDisciplines as $gKey) {
    if (!isset($stats['games'][$gKey])) {
        $stats['games'][$gKey] = ['plays' => 0, 'wins' => 0];
    }
    if (strpos($event, $gKey . '_play') !== false || ($gKey === 'arcade' && strpos($event, 'arcade_') !== false)) {
        $stats['games'][$gKey]['plays']++;
        $stats['summary']['games_played'] = ($stats['summary']['games_played'] ?? 0) + 1;
    }
    if (strpos($event, $gKey . '_win') !== false || strpos($event, $gKey . '_complete') !== false) {
        $stats['games'][$gKey]['wins']++;
        $stats['summary']['games_won'] = ($stats['summary']['games_won'] ?? 0) + 1;
    }
}

if (strpos($event, 'versus_') !== false) {
    $stats['summary']['versus_played'] = ($stats['summary']['versus_played'] ?? 0) + 1;
}

// Calcul dynamique des ratios de rétention
$totUniq = max(1, intval($stats['summary']['unique_visitors'] ?? 1));
$totGames = intval($stats['summary']['games_played'] ?? 0);
$totWins = intval($stats['summary']['games_won'] ?? 0);
$retCount = intval($stats['retention']['returning_visitors'] ?? 0);
$stats['retention']['returning_rate'] = round(($retCount / $totUniq) * 100, 1);
$stats['retention']['avg_games_per_visitor'] = round($totGames / $totUniq, 2);
$stats['retention']['global_win_rate'] = $totGames > 0 ? round(($totWins / $totGames) * 100, 1) : 0;

// Événement agrégé
if (!isset($stats['events'][$event])) $stats['events'][$event] = 0;
$stats['events'][$event]++;

// Referrers et Terminaux
if (!isset($stats['referrers'][$referrer])) $stats['referrers'][$referrer] = 0;
$stats['referrers'][$referrer]++;

if (!isset($stats['devices'][$device])) $stats['devices'][$device] = 0;
$stats['devices'][$device]++;

// Journal quotidien
if (!isset($stats['daily'][$today])) {
    $stats['daily'][$today] = ['pageviews' => 0, 'games' => 0];
}
if ($event === 'page_view') $stats['daily'][$today]['pageviews']++;
if (strpos($event, '_play') !== false || $category === 'game') $stats['daily'][$today]['games']++;

// Nettoyage de l'historique journalier (> 60 jours)
if (count($stats['daily']) > 60) {
    $stats['daily'] = array_slice($stats['daily'], -60, 60, true);
}

// Ajout aux activités récentes allégées (max 40)
$stats['recent'][] = [
    'time' => $nowStr,
    'category' => $category,
    'event' => $event,
    'label' => $label,
    'value' => $value,
    'props' => !empty($props) ? $props : null,
    'ref' => $referrer,
    'device' => $device,
];
if (count($stats['recent']) > 40) {
    $stats['recent'] = array_slice($stats['recent'], -40);
}

// Écriture atomique et déverrouillage
ftruncate($fp, 0);
rewind($fp);
fwrite($fp, json_encode($stats, JSON_UNESCAPED_UNICODE));
fflush($fp);
flock($fp, LOCK_UN);
fclose($fp);

http_response_code(200);
echo json_encode(['status' => 'success', 'event' => $event]);
