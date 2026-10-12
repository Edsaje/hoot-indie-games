<?php
ini_set("display_errors", 0);
error_reporting(0);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Sync-Key");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$action = $_REQUEST["action"] ?? "";
define("ADMIN_STEAM_ID", "76561198035270542");

if ($action === "verify_steam") {
    $validationParams = [
        "openid.ns" => "http://specs.openid.net/auth/2.0",
        "openid.mode" => "check_authentication",
    ];

    foreach ($_REQUEST as $k => $v) {
        if (strpos($k, "openid_") === 0) {
            $validationParams["openid." . substr($k, 7)] = $v;
        } elseif (strpos($k, "openid.") === 0) {
            $validationParams[$k] = $v;
        }
    }

    $isValidAssertion = false;
    $postData = http_build_query($validationParams);
    $ch = @curl_init("https://steamcommunity.com/openid/login");
    if ($ch) {
        @curl_setopt($ch, CURLOPT_POST, 1);
        @curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        @curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        @curl_setopt($ch, CURLOPT_TIMEOUT, 8);
        @curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        $res = @curl_exec($ch);
        @curl_close($ch);
        if ($res && preg_match("/is_valid\s*:\s*true/i", $res)) {
            $isValidAssertion = true;
        }
    } else {
        $opts = ["http" => ["method" => "POST", "header" => "Content-type: application/x-www-form-urlencoded", "content" => $postData, "timeout" => 8]];
        $ctx = @stream_context_create($opts);
        $res = @file_get_contents("https://steamcommunity.com/openid/login", false, $ctx);
        if ($res && preg_match("/is_valid\s*:\s*true/i", $res)) {
            $isValidAssertion = true;
        }
    }

    if (!$isValidAssertion) {
        echo json_encode(["success" => false, "error" => "invalid_assertion", "message" => "Validation Steam OpenID rejetée."]);
        exit;
    }

    $claimedId = $_REQUEST["openid_claimed_id"] ?? $_REQUEST["openid.claimed_id"] ?? "";
    if (preg_match("/^https?:\/\/steamcommunity\.com\/openid\/id\/(7[0-9]{15,25})$/", $claimedId, $m)) {
        $verifiedSteamId = $m[1];
        $_SESSION["steam_id"] = $verifiedSteamId;
        $isCreator = ($verifiedSteamId === ADMIN_STEAM_ID);
        
        $resData = [
            "success" => true,
            "verified" => true,
            "steamId" => $verifiedSteamId,
            "isCreator" => $isCreator,
            "message" => "Authentification Steam validée."
        ];

        if ($isCreator) {
            $_SESSION["admin_auth"] = true;
            $_SESSION["admin_steam_id"] = $verifiedSteamId;
            $_SESSION["admin_login_at"] = date("c");
            $adminPassFile = __DIR__ . "/.admin_pass";
            if (file_exists($adminPassFile)) {
                $resData["adminKey"] = trim(@file_get_contents($adminPassFile) ?: "");
            }
        }
        echo json_encode($resData);
        exit;
    } else {
        echo json_encode(["success" => false, "error" => "missing_steam_id", "message" => "SteamID non trouvé."]);
        exit;
    }
}

