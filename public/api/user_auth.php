<?php
/**
 * 🦉 Hoot Indie Games — Service d'Authentification Utilisateur Souverain
 * 
 * Permet aux joueurs de :
 * 1. Créer un compte souverain Hoot (Email + Mot de passe chiffré bcrypt)
 * 2. Valider leur adresse e-mail (Lien de confirmation sécurisé ou Code OTP 6 chiffres)
 * 3. Se connecter pour synchroniser automatiquement leur profil, plumes, cartes et séries de victoires multi-PC
 * 4. Associer leur compte Steam en 1 clic pour unifier leur compte
 * 
 * Sécurité :
 * - Mots de passe chiffrés avec password_hash() (Bcrypt)
 * - Tokens de confirmation cryptographiques aléatoires (CSPRNG random_bytes), hachés en SHA-256 en base
 * - Durée de validité des tokens courte (30 minutes) et invalidation immédiate après première utilisation
 * - Rate limiting anti-bruteforce d'authentification (max 15 tentatives par 10 minutes)
 * - Rate limiting strict sur le renvoi d'emails (cooldown 60s par IP et par compte)
 * - Sessions PHP sécurisées HttpOnly / SameSite=Lax
 * - Stockage atomique sous LOCK_EX dans public/api/user_saves/.accounts.json
 */

ini_set('display_errors', 0);
error_reporting(0);

// Headers HTTP de sécurité & CORS
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
require_once __DIR__ . '/admin_auth.php';
require_once __DIR__ . '/mailer.php';
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
$mailRateLimitFile = $savesDir . '/.mail_rate_limits.json';

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

// Helper : Rétrocompatibilité et normalisation du profil
function normalizeAccount(&$user) {
    if (!is_array($user)) return;
    // Rétrocompatibilité : les comptes existants créés avant la mise en place de la vérification
    // ou les comptes Steam certifiés sont considérés comme vérifiés par défaut.
    if (!isset($user['emailVerified'])) {
        $user['emailVerified'] = true;
    } else {
        $user['emailVerified'] = (bool)$user['emailVerified'];
    }
}

// Helper : Assainissement du compte avant transmission au client (suppression stricte des secrets)
function sanitizeAccountForClient($user) {
    if (!is_array($user)) return null;
    $copy = $user;
    normalizeAccount($copy);
    unset($copy['passwordHash']);
    unset($copy['verificationTokenHash']);
    unset($copy['verificationOtpHash']);
    return $copy;
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

// Rate limiting anti-bruteforce général (max 15 tentatives par 10 minutes)
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

// Rate limiting strict pour l'envoi d'e-mails (minimum 60 secondes entre deux envois par IP et par compte)
function checkMailRateLimit($ipHash, $accountLastSentAt, $mailRateLimitFile) {
    $now = time();

    // 1. Contrôle compte (60s)
    if (!empty($accountLastSentAt) && ($now - (int)$accountLastSentAt) < 60) {
        $remaining = 60 - ($now - (int)$accountLastSentAt);
        return [
            'allowed' => false,
            'cooldown' => $remaining,
            'reason' => 'account',
            'message' => "Un e-mail de confirmation a déjà été envoyé récemment. Veuillez patienter {$remaining}s.",
        ];
    }

    // 2. Contrôle IP (60s)
    $limits = [];
    if (file_exists($mailRateLimitFile)) {
        $limits = json_decode(@file_get_contents($mailRateLimitFile), true) ?: [];
    }
    if (isset($limits[$ipHash]) && ($now - (int)$limits[$ipHash]) < 60) {
        $remaining = 60 - ($now - (int)$limits[$ipHash]);
        return [
            'allowed' => false,
            'cooldown' => $remaining,
            'reason' => 'ip',
            'message' => "Trop de requêtes d'envoi d'emails depuis cette adresse IP. Veuillez patienter {$remaining}s.",
        ];
    }

    return ['allowed' => true, 'cooldown' => 0];
}

// Enregistrement du timestamp d'envoi d'email par IP
function recordMailSent($ipHash, $mailRateLimitFile) {
    $limits = [];
    if (file_exists($mailRateLimitFile)) {
        $limits = json_decode(@file_get_contents($mailRateLimitFile), true) ?: [];
    }
    $limits[$ipHash] = time();
    // Nettoyage périodique des anciennes entrées (> 2 heures)
    $cutoff = time() - 7200;
    foreach ($limits as $k => $ts) {
        if ($ts < $cutoff) unset($limits[$k]);
    }
    @file_put_contents($mailRateLimitFile, json_encode($limits), LOCK_EX);
}

switch ($action) {
    // -------------------------------------------------------------
    // ACTION : ÉTAT DE LA SESSION ACTUELLE (GET /me ou /status)
    // -------------------------------------------------------------
    case 'me':
    case 'status':
        $userId = $_SESSION['hoot_user_id'] ?? null;
        $steamId = $_SESSION['steam_id'] ?? ($_SESSION['admin_steam_id'] ?? null);
        $isAdminSession = !empty($_SESSION['admin_auth']) && strval($_SESSION['admin_steam_id'] ?? '') === ADMIN_STEAM_ID;

        if ($isAdminSession && !$steamId) {
            $steamId = ADMIN_STEAM_ID;
        }

        if (!$userId && !$steamId) {
            echo json_encode([
                'success' => true,
                'authenticated' => false,
                'emailVerified' => false,
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
            $clientUser = sanitizeAccountForClient($user);
            $_SESSION['hoot_email_verified'] = (bool)($clientUser['emailVerified'] ?? true);
            echo json_encode([
                'success' => true,
                'authenticated' => true,
                'emailVerified' => (bool)($clientUser['emailVerified'] ?? true),
                'user' => $clientUser,
            ], JSON_UNESCAPED_UNICODE);
        } else {
            // Utilisateur connecté uniquement avec Steam sans compte email (vérifié par défaut)
            $isHibouxe = ($steamId === ADMIN_STEAM_ID || $isAdminSession);
            $_SESSION['hoot_email_verified'] = true;
            echo json_encode([
                'success' => true,
                'authenticated' => true,
                'emailVerified' => true,
                'user' => [
                    'id' => $isHibouxe ? 'admin_hibouxe' : 'steam_' . $steamId,
                    'steamId' => $steamId,
                    'username' => $isHibouxe ? 'Hibouxe' : 'Explorateur_' . substr($steamId, -4),
                    'role' => $isHibouxe ? 'admin' : 'user',
                    'isAdmin' => $isHibouxe,
                    'emailVerified' => true,
                    'avatarId' => $isHibouxe ? 'hibouxe_creator' : 'owl',
                    'title' => $isHibouxe ? '👑 Créateur du Site' : 'Explorateur',
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
        $isSteam = !empty($incomingSteamId);
        $emailVerified = $isSteam ? true : false;

        // Génération du token cryptographique et du code OTP (expiration 30 min)
        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);
        $otp = sprintf('%06d', random_int(100000, 999999));
        $otpHash = hash('sha256', $otp);
        $tokenExpiresAt = time() + (30 * 60);

        $newUser = [
            'id' => $userId,
            'email' => $email,
            'username' => $cleanUsername,
            'passwordHash' => password_hash($password, PASSWORD_BCRYPT),
            'steamId' => !empty($incomingSteamId) ? $incomingSteamId : null,
            'emailVerified' => $emailVerified,
            'verificationTokenHash' => $emailVerified ? null : $tokenHash,
            'verificationOtpHash' => $emailVerified ? null : $otpHash,
            'verificationTokenExpiresAt' => $emailVerified ? null : $tokenExpiresAt,
            'lastVerificationEmailSentAt' => $emailVerified ? null : time(),
            'createdAt' => $now,
            'lastLoginAt' => $now,
        ];

        $accounts['users'][$userId] = $newUser;
        $accounts['emailIndex'][$email] = $userId;
        if (!empty($incomingSteamId)) {
            $accounts['steamIndex'][$incomingSteamId] = $userId;
        }

        saveAccountsData($accountsFile, $accounts);

        // Envoi de l'email de confirmation pour les inscriptions directes
        $mailResult = null;
        if (!$emailVerified) {
            recordMailSent($ipHash, $mailRateLimitFile);
            $mailResult = sendVerificationEmail($email, $cleanUsername, $token, $otp);
        }

        // Initialisation de la session
        session_regenerate_id(true);
        $_SESSION['hoot_user_id'] = $userId;
        $_SESSION['hoot_user_email'] = $email;
        $_SESSION['hoot_email_verified'] = $emailVerified;
        if (!empty($incomingSteamId)) {
            $_SESSION['steam_id'] = $incomingSteamId;
        }

        $clientUser = sanitizeAccountForClient($newUser);
        echo json_encode([
            'success' => true,
            'message' => $emailVerified
                ? 'Compte Hoot créé avec succès ! Vos données sont désormais sauvegardées en ligne.'
                : 'Compte Hoot créé avec succès ! Veuillez vérifier votre adresse e-mail pour activer le tchat.',
            'emailVerified' => $emailVerified,
            'user' => $clientUser,
            'mailDev' => (($mailResult['provider'] ?? '') === 'dev') ? [
                'devLogged' => true,
                'otp' => $otp,
                'token' => $token,
                'verifyUrl' => $mailResult['verifyUrl'] ?? null,
            ] : null,
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

        normalizeAccount($accounts['users'][$userId]);
        $emailVerified = (bool)$accounts['users'][$userId]['emailVerified'];

        // Mettre à jour lastLoginAt
        $accounts['users'][$userId]['lastLoginAt'] = date('c');
        saveAccountsData($accountsFile, $accounts);

        // Initialisation de la session
        session_regenerate_id(true);
        $_SESSION['hoot_user_id'] = $userId;
        $_SESSION['hoot_user_email'] = $email;
        $_SESSION['hoot_email_verified'] = $emailVerified;
        if (!empty($accounts['users'][$userId]['steamId'])) {
            $_SESSION['steam_id'] = $accounts['users'][$userId]['steamId'];
        }

        $clientUser = sanitizeAccountForClient($accounts['users'][$userId]);
        echo json_encode([
            'success' => true,
            'message' => 'Connexion réussie ! Vos données ont été chargées.',
            'emailVerified' => $emailVerified,
            'user' => $clientUser,
        ], JSON_UNESCAPED_UNICODE);
        exit;

    // -------------------------------------------------------------
    // ACTION : VÉRIFICATION D'EMAIL (LIEN OU CODE OTP) (POST / GET)
    // -------------------------------------------------------------
    case 'verify_email':
        $token = trim($payload['token'] ?? ($_REQUEST['token'] ?? ''));
        $code  = trim($payload['code']  ?? ($_REQUEST['code']  ?? ''));
        $input = !empty($token) ? $token : $code;

        if (empty($input)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'missing_token',
                'message' => 'Lien ou code de confirmation manquant.',
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $inputHash = hash('sha256', $input);
        $accounts = loadAccountsData($accountsFile);
        $matchedUserId = null;

        // 1. Chercher d'abord dans la session active si l'utilisateur est connecté
        $currentUserId = $_SESSION['hoot_user_id'] ?? null;
        if ($currentUserId && isset($accounts['users'][$currentUserId])) {
            $curUser = $accounts['users'][$currentUserId];
            $tHash = $curUser['verificationTokenHash'] ?? '';
            $oHash = $curUser['verificationOtpHash'] ?? '';
            if (($tHash && hash_equals($tHash, $inputHash)) || ($oHash && hash_equals($oHash, $inputHash))) {
                $matchedUserId = $currentUserId;
            }
        }

        // 2. Si non trouvé ou non connecté, chercher parmi l'ensemble des comptes
        if (!$matchedUserId) {
            foreach ($accounts['users'] as $uid => $u) {
                $tHash = $u['verificationTokenHash'] ?? '';
                $oHash = $u['verificationOtpHash'] ?? '';
                if (($tHash && hash_equals($tHash, $inputHash)) || ($oHash && hash_equals($oHash, $inputHash))) {
                    $matchedUserId = $uid;
                    break;
                }
            }
        }

        if (!$matchedUserId) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'invalid_token',
                'message' => 'Lien ou code de vérification invalide ou déjà utilisé.',
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $user = $accounts['users'][$matchedUserId];
        $expiresAt = (int)($user['verificationTokenExpiresAt'] ?? 0);
        if ($expiresAt > 0 && time() > $expiresAt) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'token_expired',
                'message' => 'Ce lien ou code de vérification a expiré (validité de 30 minutes). Veuillez demander un nouvel envoi.',
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Succès : Passage à vérifié et invalidation immédiate (usage unique strict)
        $accounts['users'][$matchedUserId]['emailVerified'] = true;
        $accounts['users'][$matchedUserId]['verificationTokenHash'] = null;
        $accounts['users'][$matchedUserId]['verificationOtpHash'] = null;
        $accounts['users'][$matchedUserId]['verificationTokenExpiresAt'] = null;
        saveAccountsData($accountsFile, $accounts);

        // Mettre à jour la session
        if (empty($_SESSION['hoot_user_id'])) {
            session_regenerate_id(true);
            $_SESSION['hoot_user_id'] = $matchedUserId;
            $_SESSION['hoot_user_email'] = $accounts['users'][$matchedUserId]['email'] ?? '';
        }
        $_SESSION['hoot_email_verified'] = true;

        $clientUser = sanitizeAccountForClient($accounts['users'][$matchedUserId]);
        echo json_encode([
            'success' => true,
            'message' => 'Adresse e-mail vérifiée avec succès ! Le tchat et l\'ensemble des fonctionnalités sont débloqués.',
            'emailVerified' => true,
            'user' => $clientUser,
        ], JSON_UNESCAPED_UNICODE);
        exit;

    // -------------------------------------------------------------
    // ACTION : RENVOYER L'EMAIL DE CONFIRMATION (POST)
    // -------------------------------------------------------------
    case 'resend_verification':
        $accounts = loadAccountsData($accountsFile);
        $targetUserId = $_SESSION['hoot_user_id'] ?? null;
        $targetEmail = mb_strtolower(trim($payload['email'] ?? ($_REQUEST['email'] ?? '')), 'UTF-8');

        if (!$targetUserId && !empty($targetEmail)) {
            $targetUserId = $accounts['emailIndex'][$targetEmail] ?? null;
        }

        if (!$targetUserId || !isset($accounts['users'][$targetUserId])) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'user_not_found',
                'message' => 'Compte introuvable.',
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $user = $accounts['users'][$targetUserId];
        normalizeAccount($user);

        // Si l'e-mail est déjà vérifié
        if (!empty($user['emailVerified'])) {
            echo json_encode([
                'success' => true,
                'alreadyVerified' => true,
                'emailVerified' => true,
                'message' => 'Votre adresse e-mail est déjà confirmée.',
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Rate limiting strict de 60s par IP et par compte
        $rateCheck = checkMailRateLimit($ipHash, $user['lastVerificationEmailSentAt'] ?? 0, $mailRateLimitFile);
        if (!$rateCheck['allowed']) {
            http_response_code(429);
            echo json_encode([
                'success' => false,
                'error' => 'rate_limited',
                'message' => $rateCheck['message'],
                'cooldown' => $rateCheck['cooldown'],
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Génération d'un nouveau token et d'un nouveau code OTP
        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);
        $otp = sprintf('%06d', random_int(100000, 999999));
        $otpHash = hash('sha256', $otp);
        $tokenExpiresAt = time() + (30 * 60);

        $accounts['users'][$targetUserId]['verificationTokenHash'] = $tokenHash;
        $accounts['users'][$targetUserId]['verificationOtpHash'] = $otpHash;
        $accounts['users'][$targetUserId]['verificationTokenExpiresAt'] = $tokenExpiresAt;
        $accounts['users'][$targetUserId]['lastVerificationEmailSentAt'] = time();
        saveAccountsData($accountsFile, $accounts);

        // Enregistrement de l'empreinte IP
        recordMailSent($ipHash, $mailRateLimitFile);

        // Envoi de l'email
        $mailResult = sendVerificationEmail(
            $user['email'],
            $user['username'],
            $token,
            $otp
        );

        echo json_encode([
            'success' => true,
            'message' => 'Un nouvel e-mail de confirmation a été envoyé avec succès !',
            'cooldown' => 60,
            'mailDev' => (($mailResult['provider'] ?? '') === 'dev') ? [
                'devLogged' => true,
                'otp' => $otp,
                'token' => $token,
                'verifyUrl' => $mailResult['verifyUrl'] ?? null,
            ] : null,
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
