<?php
/**
 * 🦉 Hoot Indie Games — Backend API Souverain de Tchat & Messagerie Communautaire
 * 
 * Routeur principal modulaire :
 * - Salons publics ('get_messages', 'send_message') -> chat_public.php
 * - Modération & sanctions ('delete_message', 'execute_user_moderation', etc.) -> chat_moderation.php
 * - Messagerie privée souveraine ('send_private_message', 'fetch_private_messages', etc.) -> chat_private.php
 */

ini_set('display_errors', 0);
error_reporting(0);

// Headers de sécurité HTTP stricts
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Referrer-Policy: strict-origin-when-cross-origin');
require_once __DIR__ . '/admin_auth.php';
sendCorsHeaders();
if (session_status() === PHP_SESSION_NONE) {
    @ini_set('session.cookie_httponly', 1);
    @ini_set('session.cookie_samesite', 'Lax');
    @session_start();
}
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Chargement des helpers et variables d'environnement du tchat
require_once __DIR__ . '/chat/chat_helpers.php';

// Si exécuté en ligne de commande (tests unitaires PHP) sans requête HTTP active, ne pas exécuter le routeur
if (php_sapi_name() === 'cli' && (!isset($_SERVER['REQUEST_METHOD']) || empty($_SERVER['REQUEST_METHOD']))) {
    return;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$inputJson = file_get_contents('php://input');
$jsonBody = !empty($inputJson) ? (json_decode($inputJson, true) ?: []) : [];
$body = !empty($jsonBody) ? array_merge($_POST, $jsonBody) : $_POST;
$GLOBALS['parsedJsonBody'] = $jsonBody;
$GLOBALS['body'] = $body;

$action = $_GET['action'] ?? $_POST['action'] ?? $jsonBody['action'] ?? $_REQUEST['action'] ?? ($method === 'POST' ? 'send_message' : 'get_messages');

switch ($action) {
    // 1. Salons Publics
    case 'get_messages':
    case 'send_message':
        require __DIR__ . '/chat/chat_public.php';
        break;

    // 2. Modération & Sécurité
    case 'delete_message':
    case 'get_moderation_logs':
    case 'dismiss_moderation_log':
    case 'purge_user_messages':
    case 'get_user_moderation_info':
    case 'execute_user_moderation':
        require __DIR__ . '/chat/chat_moderation.php';
        break;

    // 3. Messagerie Privée (DM)
    case 'fetch_private_conversations':
    case 'fetch_private_messages':
    case 'send_private_message':
    case 'mark_private_read':
    case 'delete_private_message':
        require __DIR__ . '/chat/chat_private.php';
        break;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Action inconnue'], JSON_UNESCAPED_UNICODE);
        exit;
}
