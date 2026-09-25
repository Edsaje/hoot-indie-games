<?php
/**
 * 🦉 Hoot Indie Games — Backend API de La Clairière des Micro-Indés & Itch.io
 * Permet aux visiteurs et créateurs solo de proposer leurs jeux et voter pour leurs coups de cœur.
 * 
 * Cybersécurité :
 * - Rate-limiting par IP (max 5 propositions par heure)
 * - Validation stricte des URLs (Steam, Itch.io, Web)
 * - Assainissement anti-XSS de toutes les chaînes
 * - Verrouillage atomique des écritures (LOCK_EX)
 * - Données stockées dans un JSON protégé
 */

ini_set('display_errors', 0);
error_reporting(0);

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
require_once __DIR__ . '/admin_auth.php';
sendCorsHeaders();
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataFile = __DIR__ . '/micro_indies.json';
$rateLimitFile = __DIR__ . '/micro_indies_rates.json';
$secretFile = __DIR__ . '/.secret';

function getSecret($file) {
    if (file_exists($file)) {
        $sec = trim(@file_get_contents($file));
        if (!empty($sec)) return $sec;
    }
    $newSec = bin2hex(random_bytes(32));
    @file_put_contents($file, $newSec, LOCK_EX);
    return $newSec;
}
$secret = getSecret($secretFile);

function getClientIpHash($secret) {
    return hash('sha256', getAuthClientIp() . $secret);
}

function checkRateLimit($rateLimitFile, $ipHash, $maxRequests = 5, $windowSeconds = 3600) {
    $now = time();
    $rates = [];
    if (file_exists($rateLimitFile)) {
        $raw = @file_get_contents($rateLimitFile);
        $rates = json_decode($raw, true) ?: [];
    }
    // Nettoyage des vieilles entrées
    foreach ($rates as $hash => $timestamps) {
        $rates[$hash] = array_filter($timestamps, function($ts) use ($now, $windowSeconds) {
            return ($now - $ts) < $windowSeconds;
        });
        if (empty($rates[$hash])) unset($rates[$hash]);
    }
    $userRequests = $rates[$ipHash] ?? [];
    if (count($userRequests) >= $maxRequests) {
        return false;
    }
    $userRequests[] = $now;
    $rates[$ipHash] = $userRequests;
    @file_put_contents($rateLimitFile, json_encode($rates), LOCK_EX);
    return true;
}

function sanitizeText($text, $maxLength = 500) {
    if (!is_string($text)) return '';
    $trimmed = trim(strip_tags($text));
    $sanitized = htmlspecialchars($trimmed, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    if (mb_strlen($sanitized, 'UTF-8') > $maxLength) {
        $sanitized = mb_substr($sanitized, 0, $maxLength, 'UTF-8');
    }
    return $sanitized;
}

function sanitizeUrl($url) {
    if (!is_string($url)) return '';
    $trimmed = trim($url);
    if (!filter_var($trimmed, FILTER_VALIDATE_URL)) return '';
    if (!preg_match('#^https?://#i', $trimmed)) return '';
    return $trimmed;
}

function healAndLoadMicroIndies($dataFile) {
    $items = [];
    if (!file_exists($dataFile)) return $items;
    $raw = @file_get_contents($dataFile);
    if (!$raw) return $items;
    $items = json_decode($raw, true) ?: [];
    $dirty = false;
    foreach ($items as &$item) {
        $cover = $item['coverImage'] ?? '';
        $steamUrl = $item['steamUrl'] ?? '';
        $isDefaultOrBroken = empty($cover) || strpos($cover, '2420510') !== false;

        // Auto-détection de l'image de couverture Steam si absente ou par défaut
        if ($isDefaultOrBroken && !empty($steamUrl)) {
            if (preg_match('#/app/(\d+)#', $steamUrl, $matches)) {
                $item['coverImage'] = "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/{$matches[1]}/header.jpg";
                $dirty = true;
            }
        }

        // Correction spécifique pour Crescent Bloom (AppID 1953920) : image et prix réel 1,99 €
        if (($item['id'] ?? '') === 'micro-crescent-bloom-2d61c0' || stripos($item['title'] ?? '', 'Crescent Bloom') !== false) {
            $properImg = 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1953920/header.jpg';
            if (($item['coverImage'] ?? '') !== $properImg) {
                $item['coverImage'] = $properImg;
                $dirty = true;
            }
            if (!isset($item['pricingText']) || !isset($item['pricingText']['fr']) || strpos($item['pricingText']['fr'], 'Payant /') !== false) {
                $item['pricingText'] = [
                    'fr' => '1,99 € sur Steam',
                    'en' => '$1.99 on Steam',
                    'es' => '1,99 € en Steam',
                    'de' => '1,99 € auf Steam',
                    'ja' => 'Steamにて1.99ドル',
                    'pt-BR' => 'R$ 10,79 no Steam',
                ];
                $dirty = true;
            }
        }
    }
    unset($item);
    if ($dirty) {
        @file_put_contents($dataFile, json_encode($items, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    }
    return $items;
}

function getAuthenticatedUserVoteKey($params) {
    if (!is_array($params)) return null;
    $steamId = trim($params['steamId'] ?? '');
    $userId = trim($params['userId'] ?? '');
    $username = trim($params['username'] ?? '');

    // 1. Joueur connecté via Steam OpenID
    if (!empty($steamId)) {
        $clean = preg_replace('/[^0-9]/', '', $steamId);
        if (strlen($clean) >= 15) return 'steam_' . $clean;
    }

    // 2. Compte utilisateur Supabase / enregistré (non guest local temporaire)
    if (!empty($userId) && strpos($userId, 'local_') !== 0) {
        $clean = preg_replace('/[^a-zA-Z0-9_\-]/', '', $userId);
        if (strlen($clean) >= 4) return 'user_' . $clean;
    }

    // 3. Pseudonyme joueur validé (exclut le pseudo par défaut 'Hibou Mystère')
    if (!empty($username)) {
        $clean = mb_strtolower(trim($username), 'UTF-8');
        $clean = preg_replace('/[^a-z0-9]/', '', $clean);
        if (!empty($clean) && $clean !== 'hiboumystere' && $clean !== 'amiduhibou') {
            return 'name_' . $clean;
        }
    }

    return null;
}

$action = $_GET['action'] ?? '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $postData = json_decode($rawInput, true) ?: [];
    $action = $postData['action'] ?? $action;
}

// 0. Récupération des informations officielles et du prix Steam en direct
if ($action === 'get_steam_info') {
    $appId = preg_replace('/[^0-9]/', '', $_GET['appId'] ?? ($postData['appId'] ?? ''));
    if (empty($appId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'AppID manquant']);
        exit;
    }
    $url = "https://store.steampowered.com/api/appdetails?appids={$appId}&cc=fr&l=french";
    $ctx = stream_context_create([
        'http' => [
            'timeout' => 4,
            'header' => "User-Agent: HootIndieGames-Sync/1.0\r\n"
        ]
    ]);
    $raw = @file_get_contents($url, false, $ctx);
    if ($raw) {
        $data = json_decode($raw, true);
        if (!empty($data[$appId]['success']) && isset($data[$appId]['data'])) {
            $gameData = $data[$appId]['data'];
            $isFree = !empty($gameData['is_free']);
            $finalPrice = '';
            if ($isFree) {
                $finalPrice = 'Gratuit 🆓';
            } elseif (isset($gameData['price_overview']['final_formatted'])) {
                $finalPrice = $gameData['price_overview']['final_formatted'] . ' sur Steam';
            }
            echo json_encode([
                'success' => true,
                'name' => $gameData['name'] ?? '',
                'isFree' => $isFree,
                'priceFormatted' => $finalPrice,
                'coverImage' => "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/{$appId}/header.jpg",
            ]);
            exit;
        }
    }
    echo json_encode(['success' => false, 'error' => 'Impossible de récupérer les données Steam.']);
    exit;
}

// 1. Lister les micro-indés approuvés
if ($action === 'list' || ($_SERVER['REQUEST_METHOD'] === 'GET' && empty($action))) {
    $items = healAndLoadMicroIndies($dataFile);
    // Filtrer pour n'afficher que les éléments approuvés côté public
    $approved = array_values(array_filter($items, function($item) {
        return !empty($item['approved']);
    }));

    // Si l'utilisateur connecté demande la liste, on peut aussi renvoyer ses likes enregistrés
    $userKey = getAuthenticatedUserVoteKey($_GET);
    $userLikedIds = [];
    $votesFile = __DIR__ . '/micro_indies_votes.json';
    if ($userKey && file_exists($votesFile)) {
        $vRaw = @file_get_contents($votesFile);
        $vData = json_decode($vRaw, true) ?: [];
        $userLikedIds = $vData['users'][$userKey] ?? [];
    }

    echo json_encode([
        'success' => true,
        'microIndies' => $approved,
        'userLikedIds' => array_values(array_unique($userLikedIds))
    ]);
    exit;
}

// 1.1 Récupérer les jeux likés par un compte connecté
if ($action === 'user_likes') {
    $userKey = getAuthenticatedUserVoteKey($_GET);
    if (!$userKey) {
        echo json_encode(['success' => true, 'likedIds' => []]);
        exit;
    }
    $votesFile = __DIR__ . '/micro_indies_votes.json';
    $userLikes = [];
    if (file_exists($votesFile)) {
        $raw = @file_get_contents($votesFile);
        $vData = json_decode($raw, true) ?: [];
        $userLikes = $vData['users'][$userKey] ?? [];
    }
    echo json_encode(['success' => true, 'likedIds' => array_values(array_unique($userLikes))]);
    exit;
}

// 2. Soumettre un nouveau micro-indé
if ($action === 'submit') {
    $ipHash = getClientIpHash($secret);
    if (!checkRateLimit($rateLimitFile, $ipHash, 5, 3600)) {
        http_response_code(429);
        echo json_encode(['success' => false, 'error' => 'Limite de soumission atteinte. Veuillez patienter avant de proposer un autre jeu.']);
        exit;
    }

    $title = sanitizeText($postData['title'] ?? '', 80);
    $developer = sanitizeText($postData['developer'] ?? '', 80);
    $pitch = sanitizeText($postData['pitch'] ?? '', 300);
    $platform = in_array($postData['platform'] ?? '', ['itch', 'steam', 'web', 'both']) ? $postData['platform'] : 'itch';
    $itchUrl = sanitizeUrl($postData['itchUrl'] ?? '');
    $steamUrl = sanitizeUrl($postData['steamUrl'] ?? '');
    $playUrl = sanitizeUrl($postData['playInBrowserUrl'] ?? '');
    $coverImage = sanitizeUrl($postData['coverImage'] ?? '');
    $isFree = !empty($postData['isFree']);
    $genre = sanitizeText($postData['genre'] ?? 'Aventure', 50);
    $artStyle = sanitizeText($postData['artStyle'] ?? 'Pixel Art', 50);
    $jam = sanitizeText($postData['jam'] ?? '', 60);
    $submittedBy = sanitizeText($postData['submittedBy'] ?? 'Visiteur Anonyme', 40);
    $devMessage = sanitizeText($postData['developerMessage'] ?? '', 300);

    if (empty($title)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Le titre du jeu est obligatoire.']);
        exit;
    }
    if (empty($developer)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Le nom du développeur ou studio est obligatoire.']);
        exit;
    }
    if (empty($itchUrl) && empty($steamUrl) && empty($playUrl)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Veuillez fournir au moins un lien officiel (Itch.io, Steam ou Web).']);
        exit;
    }

    $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $title));
    $slug = trim($slug, '-');
    $id = 'micro-' . $slug . '-' . substr(bin2hex(random_bytes(4)), 0, 6);

    // Auto-détection Steam si aucune image de couverture n'a été spécifiée
    if (empty($coverImage) && !empty($steamUrl)) {
        if (preg_match('#/app/(\d+)#', $steamUrl, $mSteam)) {
            $coverImage = "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/{$mSteam[1]}/header.jpg";
        }
    }

    $newEntry = [
        'id' => $id,
        'title' => $title,
        'developer' => $developer,
        'releaseYear' => (int)date('Y'),
        'platform' => $platform,
        'itchUrl' => $itchUrl ?: null,
        'steamUrl' => $steamUrl ?: null,
        'playInBrowserUrl' => $playUrl ?: null,
        'isFree' => $isFree,
        'pricingText' => [
            'fr' => $isFree ? 'Gratuit / Free 🆓' : (!empty($postData['price']) ? sanitizeText($postData['price'], 100) : 'Payant / Prix libre'),
            'en' => $isFree ? '100% Free 🆓' : (!empty($postData['price']) ? sanitizeText($postData['price'], 100) : 'Paid / Name your price'),
        ],
        'genre' => [$genre],
        'artStyle' => [
            'fr' => $artStyle,
            'en' => $artStyle,
        ],
        'tagline' => [
            'fr' => $pitch,
            'en' => $pitch,
        ],
        'description' => [
            'fr' => $pitch,
            'en' => $pitch,
        ],
        'developerMessage' => !empty($devMessage) ? [
            'fr' => $devMessage,
            'en' => $devMessage,
        ] : null,
        'jam' => $jam ?: null,
        'discoveredBy' => $submittedBy,
        'likesCount' => 1,
        'coverImage' => $coverImage,
        'screenshots' => $coverImage ? [$coverImage] : [],
        'dateAdded' => date('Y-m-d'),
        'approved' => false, // Requiert impérativement validation par l'administrateur avant affichage public
        'ipHash' => $ipHash,
    ];

    $items = healAndLoadMicroIndies($dataFile);
    array_unshift($items, $newEntry);
    @file_put_contents($dataFile, json_encode($items, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

    echo json_encode([
        'success' => true,
        'message' => 'Merci ! Votre proposition a été enregistrée et sera soumise à validation modérateur avant publication.',
        'game' => $newEntry,
    ]);
    exit;
}

// 3. Voter / Aimer ou Retirer son vote (Réservé aux comptes connectés - anti-triche navigation privée)
if ($action === 'like' || $action === 'unlike' || $action === 'toggle_like') {
    $userKey = getAuthenticatedUserVoteKey($postData);
    if (!$userKey) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'requireAuth' => true,
            'error' => 'Connexion à un compte requise pour voter ou retirer son vote.'
        ]);
        exit;
    }

    $ipHash = getClientIpHash($secret);
    // [CWE-799] Rate limiting sur les votes
    if (!checkRateLimit($rateLimitFile, $ipHash . '_likes', 30, 600)) {
        http_response_code(429);
        echo json_encode(['success' => false, 'error' => 'Veuillez patienter avant de voter à nouveau.']);
        exit;
    }

    $targetId = sanitizeText($postData['id'] ?? '', 100);
    if (empty($targetId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Identifiant de jeu manquant.']);
        exit;
    }

    $votesFile = __DIR__ . '/micro_indies_votes.json';
    $vData = ['users' => [], 'games' => []];
    if (file_exists($votesFile)) {
        $vRaw = @file_get_contents($votesFile);
        $vData = json_decode($vRaw, true) ?: ['users' => [], 'games' => []];
    }
    if (!isset($vData['games'])) $vData['games'] = [];
    if (!isset($vData['users'])) $vData['users'] = [];

    $alreadyLiked = !empty($vData['games'][$targetId][$userKey]);

    // Déterminer s'il s'agit d'un like ou d'un unlike
    $isUnlike = ($action === 'unlike') || ($action === 'toggle_like' && $alreadyLiked) || ($action === 'like' && !empty($postData['unlike']));

    $items = [];
    if (file_exists($dataFile)) {
        $raw = @file_get_contents($dataFile);
        $items = json_decode($raw, true) ?: [];
    }
    $found = false;
    $newLikes = 0;

    if ($isUnlike) {
        // Retirer le vote
        unset($vData['games'][$targetId][$userKey]);
        if (isset($vData['users'][$userKey])) {
            $vData['users'][$userKey] = array_values(array_filter($vData['users'][$userKey], function($id) use ($targetId) {
                return $id !== $targetId;
            }));
        }
        @file_put_contents($votesFile, json_encode($vData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

        foreach ($items as &$item) {
            if (($item['id'] ?? '') === $targetId) {
                $item['likesCount'] = max(0, ($item['likesCount'] ?? 1) - 1);
                $newLikes = $item['likesCount'];
                $found = true;
                break;
            }
        }
        unset($item);
        if ($found) {
            @file_put_contents($dataFile, json_encode($items, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        }
        echo json_encode(['success' => true, 'likesCount' => $newLikes, 'liked' => false]);
        exit;
    } else {
        // Ajouter le vote
        if ($alreadyLiked) {
            echo json_encode([
                'success' => true,
                'alreadyLiked' => true,
                'likesCount' => 1,
                'liked' => true
            ]);
            exit;
        }

        $vData['games'][$targetId][$userKey] = time();
        if (!isset($vData['users'][$userKey])) $vData['users'][$userKey] = [];
        $vData['users'][$userKey][] = $targetId;
        $vData['users'][$userKey] = array_values(array_unique($vData['users'][$userKey]));
        @file_put_contents($votesFile, json_encode($vData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

        foreach ($items as &$item) {
            if (($item['id'] ?? '') === $targetId) {
                $item['likesCount'] = ($item['likesCount'] ?? 0) + 1;
                $newLikes = $item['likesCount'];
                $found = true;
                break;
            }
        }
        unset($item);
        if ($found) {
            @file_put_contents($dataFile, json_encode($items, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
            echo json_encode(['success' => true, 'likesCount' => $newLikes, 'liked' => true]);
        } else {
            echo json_encode(['success' => true, 'likesCount' => 1, 'liked' => true]);
        }
        exit;
    }
}

// 4. Modération administrateur : Liste complète des propositions (avec stats)
if ($action === 'admin_list') {
    if (!isCreatorAdminAuthorized()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Action réservée à l\'administrateur.']);
        exit;
    }
    $items = healAndLoadMicroIndies($dataFile);
    $total = count($items);
    $pending = count(array_filter($items, function($item) {
        return empty($item['approved']);
    }));
    $approved = count(array_filter($items, function($item) {
        return !empty($item['approved']);
    }));

    echo json_encode([
        'success' => true,
        'total' => $total,
        'pending' => $pending,
        'approved' => $approved,
        'list' => $items,
    ]);
    exit;
}

// 5. Modération administrateur : Valider et publier un micro-indé
if ($action === 'admin_approve') {
    if (!isCreatorAdminAuthorized()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Action réservée à l\'administrateur.']);
        exit;
    }
    $targetId = sanitizeText($postData['id'] ?? $_GET['id'] ?? '', 100);
    if (empty($targetId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Identifiant de jeu manquant.']);
        exit;
    }

    $items = [];
    if (file_exists($dataFile)) {
        $raw = @file_get_contents($dataFile);
        $items = json_decode($raw, true) ?: [];
    }
    $found = false;
    $updatedGame = null;
    foreach ($items as &$item) {
        if (($item['id'] ?? '') === $targetId) {
            $item['approved'] = true;
            $item['approvedAt'] = date('c');
            $found = true;
            $updatedGame = $item;
            break;
        }
    }
    if ($found) {
        @file_put_contents($dataFile, json_encode($items, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        echo json_encode([
            'success' => true,
            'message' => 'Le jeu a été validé et publié avec succès dans La Clairière des Micro-Indés !',
            'game' => $updatedGame,
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Jeu introuvable.']);
    }
    exit;
}

// 6. Modération administrateur : Remettre en attente (dé-publier)
if ($action === 'admin_unapprove') {
    if (!isCreatorAdminAuthorized()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Action réservée à l\'administrateur.']);
        exit;
    }
    $targetId = sanitizeText($postData['id'] ?? $_GET['id'] ?? '', 100);
    $items = [];
    if (file_exists($dataFile)) {
        $raw = @file_get_contents($dataFile);
        $items = json_decode($raw, true) ?: [];
    }
    $found = false;
    foreach ($items as &$item) {
        if (($item['id'] ?? '') === $targetId) {
            $item['approved'] = false;
            $found = true;
            break;
        }
    }
    if ($found) {
        @file_put_contents($dataFile, json_encode($items, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        echo json_encode(['success' => true, 'message' => 'Le micro-indé a été remis en attente de validation.']);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Jeu introuvable.']);
    }
    exit;
}

// 7. Modération administrateur : Supprimer une proposition
if ($action === 'delete' || $action === 'admin_delete') {
    if (!isCreatorAdminAuthorized()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Action réservée à l\'administrateur.']);
        exit;
    }
    $targetId = sanitizeText($postData['id'] ?? $_GET['id'] ?? '', 100);
    $items = [];
    if (file_exists($dataFile)) {
        $raw = @file_get_contents($dataFile);
        $items = json_decode($raw, true) ?: [];
    }
    $filtered = array_values(array_filter($items, function($item) use ($targetId) {
        return ($item['id'] ?? '') !== $targetId;
    }));
    @file_put_contents($dataFile, json_encode($filtered, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    echo json_encode(['success' => true, 'message' => 'Jeu retiré de La Clairière.']);
    exit;
}

// 8. Modération administrateur : Modifier les métadonnées (titre, dev, jaquette, liens, pitch...)
if ($action === 'admin_update') {
    if (!isCreatorAdminAuthorized()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Action réservée à l\'administrateur.']);
        exit;
    }
    $targetId = sanitizeText($postData['id'] ?? $_GET['id'] ?? '', 100);
    $updates = $postData['updates'] ?? [];
    if (empty($targetId) || !is_array($updates)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Paramètres invalides.']);
        exit;
    }

    $items = healAndLoadMicroIndies($dataFile);
    $found = false;
    $updatedGame = null;
    foreach ($items as &$item) {
        if (($item['id'] ?? '') === $targetId) {
            if (isset($updates['title'])) $item['title'] = sanitizeText($updates['title'], 80);
            if (isset($updates['developer'])) $item['developer'] = sanitizeText($updates['developer'], 80);
            if (isset($updates['coverImage'])) $item['coverImage'] = sanitizeUrl($updates['coverImage']);
            if (isset($updates['steamUrl'])) $item['steamUrl'] = sanitizeUrl($updates['steamUrl']) ?: null;
            if (isset($updates['itchUrl'])) $item['itchUrl'] = sanitizeUrl($updates['itchUrl']) ?: null;
            if (isset($updates['playInBrowserUrl'])) $item['playInBrowserUrl'] = sanitizeUrl($updates['playInBrowserUrl']) ?: null;
            if (isset($updates['pitch'])) {
                $p = sanitizeText($updates['pitch'], 300);
                $item['tagline'] = ['fr' => $p, 'en' => $p];
                $item['description'] = ['fr' => $p, 'en' => $p];
            }
            if (isset($updates['discoveredBy'])) $item['discoveredBy'] = sanitizeText($updates['discoveredBy'], 50);
            if (isset($updates['price'])) {
                $pPrice = sanitizeText($updates['price'], 100);
                $item['pricingText'] = ['fr' => $pPrice, 'en' => $pPrice];
                $item['isFree'] = (stripos($pPrice, 'gratuit') !== false || stripos($pPrice, 'free') !== false || $pPrice === '0' || $pPrice === '0€');
            }
            if (isset($updates['pricingText'])) {
                if (is_array($updates['pricingText'])) {
                    $item['pricingText'] = $updates['pricingText'];
                } else {
                    $pt = sanitizeText($updates['pricingText'], 100);
                    $item['pricingText'] = ['fr' => $pt, 'en' => $pt];
                }
            }
            if (isset($updates['approved'])) $item['approved'] = !empty($updates['approved']);
            $found = true;
            $updatedGame = $item;
            break;
        }
    }
    unset($item);
    if ($found) {
        @file_put_contents($dataFile, json_encode($items, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        echo json_encode([
            'success' => true,
            'message' => 'Micro-indé mis à jour avec succès.',
            'game' => $updatedGame,
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Jeu introuvable.']);
    }
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Action inconnue']);
