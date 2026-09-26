<?php
/**
 * 🦉 Hoot Indie Games — Service d'Authentification Utilisateur Souverain
 * 
 * Permet aux joueurs de :
 * 1. Créer un compte souverain Hoot (Email + Mot de passe chiffré bcrypt)
 * 2. Se connecter pour synchroniser automatiquement leur profil, plumes, cartes et séries de victoires multi-PC
 * 3. Associer leur compte Steam en 1 clic pour unifier leur compte
 * 
 * Sécurité :
 * - Mots de passe chiffrés avec password_hash() (Bcrypt)
 * - Rate limiting par empreinte IP (anti-bruteforce)
 * - Sessions PHP sécurisées HttpOnly / SameSite=Lax
 * - Stockage atomique sous LOCK_EX dans public/api/user_saves/.accounts.json
 */

ini_set('display_errors', 0);
error_reporting(0);

// Headers HTTP de sécurité & CORS
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
require_once __DIR__ . '/admin_auth.php';
sendCorsHeaders();
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$savesDir = __DIR__ . '/user_saves';
if (!is_dir($savesDir)) {
    @mkdir($savesDir, 0755, true);
}

$accountsFile = $savesDir . '/.accounts.json';
$rateLimitFile = $savesDir . '/.auth_rate_limits.json';

// Helper : Lecture sécurisée des comptes
function loadAccountsData($file) {
    if (!file_exists($file)) {
        return ['users' => [], 'emailIndex' => [], 'steamIndex' => []];
    }
    $raw = @file_get_contents($file);
    if (!$raw) {
        return ['users' => [], 'emailIndex' => [], 'steamIndex' => []];
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        return ['users' => [], 'emailIndex' => [], 'steamIndex' => []];
    }
    if (!isset($data['users']) || !is_array($data['users'])) $data['users'] = [];
    if (!isset($data['emailIndex']) || !is_array($data['emailIndex'])) $data['emailIndex'] = [];
    if (!isset($data['steamIndex']) || !is_array($data['steamIndex'])) $data['steamIndex'] = [];
    return $data;
}

// Helper : Écriture atomique
function saveAccountsData($file, $data) {
    $encoded = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    return @file_put_contents($file, $encoded, LOCK_EX) !== false;
}

// Démarrer la session PHP de manière sécurisée
if (session_status() === PHP_SESSION_NONE) {
    @ini_set('session.cookie_httponly', 1);
    @ini_set('session.cookie_samesite', 'Lax');
    @session_start();
}

$action = isset($_REQUEST['action']) ? trim($_REQUEST['action']) : '';

// Lecture du payload JSON POST
$rawInput = @file_get_contents('php://input');
$payload = [];
if (!empty($rawInput)) {
    $json = json_decode($rawInput, true);
    if (is_array($json)) {
        $payload = $json;
    }
}
if (empty($payload) && !empty($_POST)) {
    $payload = $_POST;
}

$clientIp = getAuthClientIp();
$ipHash = hash('sha256', $clientIp . '_hoot_auth');

// Rate limiting anti-bruteforce (max 15 tentatives par 10 minutes)
function checkRateLimit($ipHash, $rateLimitFile) {
    $limits = [];
    if (file_exists($rateLimitFile)) {
        $limits = json_decode(@file_get_contents($rateLimitFile), true) ?: [];
    }
    $now = time();
    if (!isset($limits[$ipHash]) || ($now - $limits[$ipHash]['resetAt']) > 600) {
        $limits[$ipHash] = ['count' => 1, 'resetAt' => $now + 600];
    } else {
        $limits[$ipHash]['count']++;
    }
    @file_put_contents($rateLimitFile, json_encode($limits), LOCK_EX);
    return ($limits[$ipHash]['count'] <= 15);
}

switch ($action) {
    // -------------------------------------------------------------
    // ACTION : ÉTAT DE LA SESSION ACTUELLE (GET /me)
    // -------------------------------------------------------------
    case 'me':
    case 'status':
        $userId = $_SESSION['hoot_user_id'] ?? null;
        $steamId = $_SESSION['steam_id'] ?? null;

        if (!$userId && !$steamId) {
            echo json_encode([
                'success' => true,
                'authenticated' => false,
                'user' => null,
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $accounts = loadAccountsData($accountsFile);
        $user = null;

        if ($userId && isset($accounts['users'][$userId])) {
            $user = $accounts['users'][$userId];
        } elseif ($steamId && isset($accounts['steamIndex'][$steamId])) {
            $matchedId = $accounts['steamIndex'][$steamId];
            if (isset($accounts['users'][$matchedId])) {
                $user = $accounts['users'][$matchedId];
            }
        }

        if ($user) {
            unset($user['passwordHash']);
            echo json_encode([
                'success' => true,
                'authenticated' => true,
                'user' => $user,
            ], JSON_UNESCAPED_UNICODE);
        } else {
            // Utilisateur connecté uniquement avec Steam sans compte email
            echo json_encode([
                'success' => true,
                'authenticated' => true,
                'user' => [
                    'id' => 'steam_' . $steamId,
                    'steamId' => $steamId,
                    'username' => ($steamId === ADMIN_STEAM_ID) ? 'Hibouxe' : 'Joueur Steam',
                    'isSteamOnly' => true,
                ],
            ], JSON_UNESCAPED_UNICODE);
        }
        exit;

    // -------------------------------------------------------------
    // ACTION : INSCRIPTION EMAIL + MOT DE PASSE (POST)
    // -------------------------------------------------------------
    case 'register':
    case 'signup':
        if (!checkRateLimit($ipHash, $rateLimitFile)) {
            http_response_code(429);
            echo json_encode([
                'success' => false,
                'error' => 'rate_limited',
                'message' => 'Trop de requêtes d\'authentification. Veuillez patienter quelques minutes.'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $email = mb_strtolower(trim($payload['email'] ?? ''), 'UTF-8');
        $password = (string)($payload['password'] ?? '');
        $username = trim($payload['username'] ?? '');
        $incomingSteamId = trim($payload['steamId'] ?? ($_SESSION['steam_id'] ?? ''));

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'invalid_email', 'message' => 'Adresse e-mail invalide.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if (strlen($password) < 6) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'password_too_short', 'message' => 'Le mot de passe doit comporter au moins 6 caractères.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $accounts = loadAccountsData($accountsFile);

        if (isset($accounts['emailIndex'][$email])) {
            http_response_code(409);
            echo json_encode(['success' => false, 'error' => 'email_exists', 'message' => 'Un compte existe déjà avec cette adresse e-mail. Veuillez vous connecter.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Création de l'ID utilisateur unique souverain
        $userId = 'user_' . bin2hex(random_bytes(8));
        $cleanUsername = preg_replace('/[^a-zA-Z0-9_\-]/', '', $username);
        if (empty($cleanUsername)) {
            $defaultName = explode('@', $email)[0];
            $cleanUsername = preg_replace('/[^a-zA-Z0-9_\-]/', '', $defaultName) ?: 'Explorateur';
        }

        $now = date('c');
        $newUser = [
            'id' => $userId,
            'email' => $email,
            'username' => $cleanUsername,
            'passwordHash' => password_hash($password, PASSWORD_BCRYPT),
            'steamId' => !empty($incomingSteamId) ? $incomingSteamId : null,
            'createdAt' => $now,
            'lastLoginAt' => $now,
        ];

        $accounts['users'][$userId] = $newUser;
        $accounts['emailIndex'][$email] = $userId;
        if (!empty($incomingSteamId)) {
            $accounts['steamIndex'][$incomingSteamId] = $userId;
        }

        saveAccountsData($accountsFile, $accounts);

        // Initialisation de la session
        session_regenerate_id(true);
        $_SESSION['hoot_user_id'] = $userId;
        $_SESSION['hoot_user_email'] = $email;
        if (!empty($incomingSteamId)) {
            $_SESSION['steam_id'] = $incomingSteamId;
        }

        unset($newUser['passwordHash']);
        echo json_encode([
            'success' => true,
            'message' => 'Compte Hoot créé avec succès ! Vos données sont désormais sauvegardées en ligne.',
            'user' => $newUser,
        ], JSON_UNESCAPED_UNICODE);
        exit;

    // -------------------------------------------------------------
    // ACTION : CONNEXION EMAIL + MOT DE PASSE (POST)
    // -------------------------------------------------------------
    case 'login':
    case 'signin':
        if (!checkRateLimit($ipHash, $rateLimitFile)) {
            http_response_code(429);
            echo json_encode([
                'success' => false,
                'error' => 'rate_limited',
                'message' => 'Trop de tentatives de connexion. Veuillez patienter quelques minutes.'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $email = mb_strtolower(trim($payload['email'] ?? ''), 'UTF-8');
        $password = (string)($payload['password'] ?? '');

        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'missing_fields', 'message' => 'E-mail et mot de passe requis.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $accounts = loadAccountsData($accountsFile);

        if (!isset($accounts['emailIndex'][$email])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'invalid_credentials', 'message' => 'Adresse e-mail ou mot de passe incorrect.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $userId = $accounts['emailIndex'][$email];
        $user = $accounts['users'][$userId] ?? null;

        if (!$user || !password_verify($password, $user['passwordHash'] ?? '')) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'invalid_credentials', 'message' => 'Adresse e-mail ou mot de passe incorrect.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Mettre à jour lastLoginAt
        $accounts['users'][$userId]['lastLoginAt'] = date('c');
        saveAccountsData($accountsFile, $accounts);

        // Initialisation de la session
        session_regenerate_id(true);
        $_SESSION['hoot_user_id'] = $userId;
        $_SESSION['hoot_user_email'] = $email;
        if (!empty($user['steamId'])) {
            $_SESSION['steam_id'] = $user['steamId'];
        }

        unset($user['passwordHash']);
        echo json_encode([
            'success' => true,
            'message' => 'Connexion réussie ! Vos données ont été chargées.',
            'user' => $user,
        ], JSON_UNESCAPED_UNICODE);
        exit;

    // -------------------------------------------------------------
    // ACTION : ASSOCIER UN COMPTE STEAM À UN COMPTE EXISTANT (POST)
    // -------------------------------------------------------------
    case 'link_steam':
        $userId = $_SESSION['hoot_user_id'] ?? null;
        $steamId = trim($payload['steamId'] ?? ($_SESSION['steam_id'] ?? ''));

        if (!$userId) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'unauthenticated', 'message' => 'Vous devez être connecté avec votre compte Hoot pour associer Steam.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if (empty($steamId) || !preg_match('/^\d{17}$/', $steamId)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'invalid_steam_id', 'message' => 'SteamID64 invalide.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $accounts = loadAccountsData($accountsFile);
        if (!isset($accounts['users'][$userId])) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'user_not_found', 'message' => 'Compte introuvable.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $accounts['users'][$userId]['steamId'] = $steamId;
        $accounts['steamIndex'][$steamId] = $userId;
        saveAccountsData($accountsFile, $accounts);

        $_SESSION['steam_id'] = $steamId;

        // Migrer ou fusionner les sauvegardes si besoin
        $steamSaveFile = $savesDir . '/steam_' . $steamId . '.json';
        $userSaveFile = $savesDir . '/user_' . $userId . '.json';
        if (file_exists($steamSaveFile) && !file_exists($userSaveFile)) {
            @copy($steamSaveFile, $userSaveFile);
        }

        echo json_encode([
            'success' => true,
            'message' => 'Compte Steam associé avec succès à votre compte Hoot !',
            'steamId' => $steamId,
        ], JSON_UNESCAPED_UNICODE);
        exit;

    // -------------------------------------------------------------
    // ACTION : DÉCONNEXION (POST / GET)
    // -------------------------------------------------------------
    case 'logout':
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        @session_destroy();
        echo json_encode(['success' => true, 'message' => 'Déconnexion effectuée avec succès.'], JSON_UNESCAPED_UNICODE);
        exit;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'unknown_action', 'message' => 'Action d\'authentification inconnue.'], JSON_UNESCAPED_UNICODE);
        exit;
}
