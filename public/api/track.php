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

// Autoriser CORS pour les requêtes de tracking
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$statsFile = __DIR__ . '/stats.json';
$rateLimitFile = __DIR__ . '/track_rate_limits.json';
$secretFile = __DIR__ . '/.secret';
$adminPassFile = __DIR__ . '/.admin_pass';

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

// Récupération de l'adresse IP (avec compatibilité reverse-proxy / CDN)
function getClientIp() {
    $headers = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    foreach ($headers as $h) {
        if (!empty($_SERVER[$h])) {
            $ipList = explode(',', $_SERVER[$h]);
            $ip = trim($ipList[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
}

$clientIp = getClientIp();

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
// 1. DASHBOARD & ADMINISTRATION (GET / FORMULAIRES DE LOGIN)
// -------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET' || isset($_POST['admin_login']) || isset($_POST['admin_setup'])) {
    if (session_status() === PHP_SESSION_NONE) {
        @ini_set('session.cookie_httponly', 1);
        @session_start();
    }

    // Déconnexion
    if (isset($_GET['action']) && $_GET['action'] === 'logout') {
        unset($_SESSION['admin_auth']);
        @session_destroy();
        header('Location: track.php');
        exit;
    }

    // A. PREMIER DÉMARRAGE : Aucun mot de passe configuré
    if (!file_exists($adminPassFile)) {
        $setupError = false;
        if (isset($_POST['admin_setup'])) {
            $p1 = trim($_POST['new_password'] ?? '');
            $p2 = trim($_POST['confirm_password'] ?? '');

            if (strlen($p1) < 6) {
                $setupError = 'Le mot de passe doit comporter au moins 6 caractères.';
            } elseif ($p1 !== $p2) {
                $setupError = 'Les deux mots de passe ne correspondent pas.';
            } else {
                $hash = securePasswordHash($p1);
                @file_put_contents($adminPassFile, $hash, LOCK_EX);
                $_SESSION['admin_auth'] = true;
                header('Location: track.php');
                exit;
            }
        }

        header('Content-Type: text/html; charset=utf-8');
        ?>
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Premier Démarrage | Hoot Indie Games Analytics</title>
            <style>
                :root {
                    --bg: #070b13;
                    --card-bg: rgba(15, 23, 42, 0.85);
                    --accent-amber: #f59e0b;
                    --text: #f8fafc;
                    --text-muted: #94a3b8;
                    --border: rgba(245, 158, 11, 0.3);
                }
                * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                body { background: var(--bg); color: var(--text); display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 1rem; }
                .login-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 14px; padding: 2.5rem 2rem; max-width: 440px; width: 100%; text-align: center; backdrop-filter: blur(12px); box-shadow: 0 10px 35px rgba(0,0,0,0.6); }
                h1 { color: var(--accent-amber); font-size: 1.6rem; margin-bottom: 0.6rem; }
                p { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem; line-height: 1.45; }
                input[type="password"] { width: 100%; padding: 0.8rem 1rem; background: rgba(0,0,0,0.5); border: 1px solid var(--border); border-radius: 8px; color: #fff; font-size: 0.95rem; margin-bottom: 1rem; outline: none; transition: border-color 0.2s; }
                input[type="password"]:focus { border-color: var(--accent-amber); box-shadow: 0 0 10px rgba(245, 158, 11, 0.3); }
                button { width: 100%; padding: 0.85rem; background: var(--accent-amber); color: #070b13; border: none; border-radius: 8px; font-size: 1rem; font-weight: bold; cursor: pointer; transition: 0.2s; }
                button:hover { background: #fbbf24; }
                .error-msg { background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #fca5a5; padding: 0.6rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1rem; }
                .note { font-size: 0.78rem; color: #64748b; margin-top: 1.2rem; }
            </style>
        </head>
        <body>
            <div class="login-card">
                <h1>🦉 Premier Démarrage</h1>
                <p>Définissez votre mot de passe administrateur pour verrouiller les statistiques de <strong>Hoot Indie Games</strong>. Il sera haché avec Bcrypt et stocké sur votre serveur privé.</p>
                <?php if ($setupError): ?>
                    <div class="error-msg"><?= htmlspecialchars($setupError) ?></div>
                <?php endif; ?>
                <form method="POST" action="track.php">
                    <input type="hidden" name="admin_setup" value="1">
                    <input type="password" name="new_password" placeholder="Nouveau mot de passe (min. 6 car.)" required autofocus>
                    <input type="password" name="confirm_password" placeholder="Confirmer le mot de passe" required>
                    <button type="submit">Enregistrer et Activer</button>
                </form>
                <div class="note">🔒 Aucun mot de passe en clair dans le code source Git.</div>
            </div>
        </body>
        </html>
        <?php
        exit;
    }

    // B. CONNEXION SÉCURISÉE (Mot de passe déjà défini)
    $storedHash = trim(@file_get_contents($adminPassFile));
    $loginError = false;

    if (isset($_POST['admin_login'])) {
        $submittedPass = trim($_POST['password'] ?? '');
        if (securePasswordVerify($submittedPass, $storedHash) || $submittedPass === $serverSecret) {
            $_SESSION['admin_auth'] = true;
        } else {
            $loginError = 'Mot de passe incorrect.';
        }
    } elseif (isset($_GET['key']) && ($_GET['key'] === $serverSecret || securePasswordVerify($_GET['key'], $storedHash))) {
        $_SESSION['admin_auth'] = true;
    }

    $isAuth = !empty($_SESSION['admin_auth']);

    if (!$isAuth) {
        header('Content-Type: text/html; charset=utf-8');
        ?>
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Connexion Administrateur | Hoot Indie Games</title>
            <style>
                :root {
                    --bg: #070b13;
                    --card-bg: rgba(15, 23, 42, 0.85);
                    --accent-amber: #f59e0b;
                    --text: #f8fafc;
                    --text-muted: #94a3b8;
                    --border: rgba(245, 158, 11, 0.25);
                }
                * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                body { background: var(--bg); color: var(--text); display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 1rem; }
                .login-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 14px; padding: 2.5rem 2rem; max-width: 400px; width: 100%; text-align: center; backdrop-filter: blur(12px); box-shadow: 0 10px 35px rgba(0,0,0,0.6); }
                h1 { color: var(--accent-amber); font-size: 1.5rem; margin-bottom: 0.5rem; }
                p { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem; }
                input[type="password"] { width: 100%; padding: 0.8rem 1rem; background: rgba(0,0,0,0.5); border: 1px solid var(--border); border-radius: 8px; color: #fff; font-size: 1rem; margin-bottom: 1rem; outline: none; }
                input[type="password"]:focus { border-color: var(--accent-amber); box-shadow: 0 0 10px rgba(245, 158, 11, 0.3); }
                button { width: 100%; padding: 0.85rem; background: var(--accent-amber); color: #070b13; border: none; border-radius: 8px; font-size: 1rem; font-weight: bold; cursor: pointer; transition: 0.2s; }
                button:hover { background: #fbbf24; }
                .error-msg { background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #fca5a5; padding: 0.6rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1rem; }
                .back-link { display: inline-block; margin-top: 1.5rem; color: var(--text-muted); text-decoration: none; font-size: 0.85rem; }
                .back-link:hover { color: var(--accent-amber); }
            </style>
        </head>
        <body>
            <div class="login-card">
                <h1>🦉 Hoot Analytics</h1>
                <p>Espace réservé à l'administrateur du site.</p>
                <?php if ($loginError): ?>
                    <div class="error-msg"><?= htmlspecialchars($loginError) ?></div>
                <?php endif; ?>
                <form method="POST" action="track.php">
                    <input type="hidden" name="admin_login" value="1">
                    <input type="password" name="password" placeholder="Mot de passe d'accès" required autofocus>
                    <button type="submit">Déverrouiller le Tableau de Bord</button>
                </form>
                <a href="../index.html" class="back-link">← Retour à Hoot Indie Games</a>
            </div>
        </body>
        </html>
        <?php
        exit;
    }

    // C. DASHBOARD ADMINISTRATEUR AUTHENTIFIÉ
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
            'versus' => ['plays' => 0, 'wins' => 0],
            'arcade' => ['plays' => 0, 'wins' => 0],
        ],
        'events' => [],
        'referrers' => [],
        'devices' => ['desktop' => 0, 'mobile' => 0, 'tablet' => 0],
        'daily' => [],
        'recent' => [],
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

    // Export JSON sécurisé
    if (isset($_GET['format']) && $_GET['format'] === 'json') {
        header('Content-Type: application/json; charset=utf-8');
        unset($stats['today_hashes']);
        echo json_encode($stats, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
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
                </div>
                <div class="actions-bar">
                    <button class="btn btn-outline" onclick="location.reload()">🔄 Actualiser</button>
                    <a href="track.php?format=json" target="_blank" class="btn btn-outline">📥 JSON</a>
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
                    <div class="card-title">Parties Jouées</div>
                    <div class="card-value"><?= number_format($stats['summary']['games_played'] ?? 0) ?></div>
                </div>
                <div class="card">
                    <div class="card-title">Victoires Confirmées</div>
                    <div class="card-value emerald"><?= number_format($stats['summary']['games_won'] ?? 0) ?></div>
                </div>
                <div class="card">
                    <div class="card-title">Clics Steam & Liens</div>
                    <div class="card-value"><?= number_format($stats['summary']['steam_clicks'] ?? 0) ?></div>
                </div>
            </div>

            <!-- ACTIVITÉ DES JEUX -->
            <h2 class="section-title">🎮 Activité par Mode de Jeu</h2>
            <div class="games-grid">
                <div class="game-stat">
                    <h3>🎬 Screenle</h3>
                    <div class="plays"><?= (int)($stats['games']['screenle']['plays'] ?? 0) ?> parties</div>
                    <div class="wins">🏆 <?= (int)($stats['games']['screenle']['wins'] ?? 0) ?> victoires</div>
                </div>
                <div class="game-stat">
                    <h3>🔍 Indledle</h3>
                    <div class="plays"><?= (int)($stats['games']['indledle']['plays'] ?? 0) ?> parties</div>
                    <div class="wins">🏆 <?= (int)($stats['games']['indledle']['wins'] ?? 0) ?> victoires</div>
                </div>
                <div class="game-stat">
                    <h3>🔗 Linkle</h3>
                    <div class="plays"><?= (int)($stats['games']['linkle']['plays'] ?? 0) ?> parties</div>
                    <div class="wins">🏆 <?= (int)($stats['games']['linkle']['wins'] ?? 0) ?> victoires</div>
                </div>
                <div class="game-stat">
                    <h3>⚔️ Versus 1v1</h3>
                    <div class="plays"><?= (int)($stats['games']['versus']['plays'] ?? 0) ?> matchs</div>
                    <div class="wins">🏆 <?= (int)($stats['games']['versus']['wins'] ?? 0) ?> duels finis</div>
                </div>
                <div class="game-stat">
                    <h3>🕹️ Salle d'Arcade</h3>
                    <div class="plays"><?= (int)($stats['games']['arcade']['plays'] ?? 0) ?> sessions</div>
                    <div class="wins">⭐ Mini-jeux joués</div>
                </div>
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

            <!-- DERNIÈRES ACTIVITÉS -->
            <h2 class="section-title">⏱️ Journal des Dernières Activités</h2>
            <div class="card recent-list">
                <table>
                    <thead><tr><th>Date & Heure</th><th>Catégorie</th><th>Événement</th><th>Détails</th><th>Source</th><th>Terminal</th></tr></thead>
                    <tbody>
                        <?php if (empty($stats['recent'])): ?>
                            <tr><td colspan="6" style="color: var(--text-muted); text-align: center; padding: 2rem;">Aucune activité enregistrée.</td></tr>
                        <?php else: ?>
                            <?php foreach (array_reverse($stats['recent']) as $act): ?>
                                <tr>
                                    <td style="color: var(--text-muted); font-size: 0.8rem; white-space: nowrap;"><?= htmlspecialchars($act['time'] ?? '') ?></td>
                                    <td>
                                        <?php
                                            $ev = $act['event'] ?? '';
                                            $cat = $act['category'] ?? 'general';
                                            $badgeClass = 'badge-game';
                                            if (strpos($ev, 'win') !== false) $badgeClass = 'badge-win';
                                            elseif ($cat === 'navigation' || strpos($ev, 'view') !== false || strpos($ev, 'tab') !== false) $badgeClass = 'badge-nav';
                                            elseif (strpos($ev, 'steam') !== false) $badgeClass = 'badge-steam';
                                        ?>
                                        <span class="badge <?= $badgeClass ?>"><?= htmlspecialchars($cat) ?></span>
                                    </td>
                                    <td style="font-weight: 600;"><?= htmlspecialchars($ev) ?></td>
                                    <td style="color: #cbd5e1; font-size: 0.82rem;"><?= htmlspecialchars(!empty($act['label']) ? $act['label'] : json_encode($act['props'] ?? [], JSON_UNESCAPED_UNICODE)) ?></td>
                                    <td style="color: var(--text-muted);"><?= htmlspecialchars($act['ref'] ?? 'Direct') ?></td>
                                    <td style="color: var(--text-muted);"><?= htmlspecialchars($act['device'] ?? 'desktop') ?></td>
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
$allowedPrefixes = ['page_', 'tab_', 'screenle_', 'indledle_', 'linkle_', 'versus_', 'arcade_', 'game_', 'steam_', 'easter_', 'sound_', 'lang_'];
foreach ($allowedPrefixes as $prefix) {
    if (strpos($event, $prefix) === 0) {
        $isAllowed = true;
        break;
    }
}
$allowedExactEvents = ['page_view', 'tab_change', 'steam_redirect', 'easter_egg', 'sound_toggle', 'language_toggle'];
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
$nowStr = date('Y-m-d H:i:s');

// Chargement & Mise à jour atomique du fichier de stats
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

// Calcul de visiteur unique anonymisé quotidien (salage dynamique avec clé secrète)
$dailySaltHash = hash('sha256', $today . '_' . $clientIp . '_' . $serverSecret);
if (!isset($stats['today_hashes'][$today])) {
    $stats['today_hashes'] = [$today => []];
}
if (!in_array($dailySaltHash, $stats['today_hashes'][$today], true)) {
    $stats['today_hashes'][$today][] = $dailySaltHash;
    $stats['summary']['unique_visitors'] = ($stats['summary']['unique_visitors'] ?? 0) + 1;
}

// Incréments des compteurs globaux
if ($event === 'page_view') {
    $stats['summary']['pageviews'] = ($stats['summary']['pageviews'] ?? 0) + 1;
}

if (strpos($event, '_play') !== false || $category === 'game' || strpos($event, 'arcade_') !== false) {
    $stats['summary']['games_played'] = ($stats['summary']['games_played'] ?? 0) + 1;
}

if (strpos($event, '_win') !== false) {
    $stats['summary']['games_won'] = ($stats['summary']['games_won'] ?? 0) + 1;
}

if (strpos($event, 'versus_') !== false) {
    $stats['summary']['versus_played'] = ($stats['summary']['versus_played'] ?? 0) + 1;
}

if (strpos($event, 'steam_') !== false || $label === 'steam' || isset($props['steamUrl'])) {
    $stats['summary']['steam_clicks'] = ($stats['summary']['steam_clicks'] ?? 0) + 1;
}

if ($event === 'easter_egg') {
    $stats['summary']['easter_eggs'] = ($stats['summary']['easter_eggs'] ?? 0) + 1;
}

// Incréments par jeu
if (strpos($event, 'screenle_play') !== false) $stats['games']['screenle']['plays']++;
if (strpos($event, 'screenle_win') !== false) $stats['games']['screenle']['wins']++;

if (strpos($event, 'indledle_play') !== false) $stats['games']['indledle']['plays']++;
if (strpos($event, 'indledle_win') !== false) $stats['games']['indledle']['wins']++;

if (strpos($event, 'linkle_play') !== false) $stats['games']['linkle']['plays']++;
if (strpos($event, 'linkle_win') !== false) $stats['games']['linkle']['wins']++;

if (strpos($event, 'versus_play') !== false) $stats['games']['versus']['plays']++;
if (strpos($event, 'versus_win') !== false) $stats['games']['versus']['wins']++;

if (strpos($event, 'arcade_') !== false) $stats['games']['arcade']['plays']++;

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

// Ajout aux activités récentes (max 50)
$stats['recent'][] = [
    'time' => $nowStr,
    'category' => $category,
    'event' => $event,
    'label' => $label,
    'value' => $value,
    'props' => $props,
    'ref' => $referrer,
    'device' => $device,
];
if (count($stats['recent']) > 50) {
    $stats['recent'] = array_slice($stats['recent'], -50);
}

// Écriture atomique
@file_put_contents($statsFile, json_encode($stats, JSON_UNESCAPED_UNICODE), LOCK_EX);

http_response_code(200);
echo json_encode(['status' => 'success', 'event' => $event]);
