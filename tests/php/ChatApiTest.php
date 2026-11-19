<?php
/**
 * Test unitaire PHP : chat.php & sécurité du tchat en direct
 */

$apiDir = file_exists(__DIR__ . '/../../public/api') ? __DIR__ . '/../../public/api' : (file_exists(__DIR__ . '/../api') ? __DIR__ . '/../api' : '/var/www/html/api');
require_once $apiDir . '/chat.php';

function test_chat_detect_profanities($assert) {
    // 1. Propos sains autorisés
    $cleanText = "Bonjour tout le monde ! Quel super jeu indé aujourd'hui !";
    $flaggedClean = detectProfanities($cleanText);
    $assert(empty($flaggedClean), 'Un message bienveillant ne doit pas être signalé');

    // 2. Insulte explicite détectée
    $toxicText = "Va te faire foutre sale connard";
    $flaggedToxic = detectProfanities($toxicText);
    $assert(!empty($flaggedToxic), 'Une insulte directe doit être signalée');
    $assert(in_array('connard', $flaggedToxic), 'Le mot clé connard doit être présent dans les alertes');
}

function test_chat_detect_phishing_and_scams($assert) {
    // 1. Détection de faux domaine Steam (phishing)
    $phishingSteam = "Reçois 50€ gratuits sur https://steamcommunity-gift.com/claim";
    $flagsSteam = detectPhishingAndSuspiciousLinks($phishingSteam, false);
    $assert(!empty($flagsSteam), 'Un faux domaine Steam doit être détecté comme phishing');

    // 2. Détection d'arnaque carte cadeau
    $scamGift = "Free steam gift card click here to claim your reward now!";
    $flagsGift = detectPhishingAndSuspiciousLinks($scamGift, false);
    $assert(!empty($flagsGift), 'Les arnaques de cartes cadeaux gratuites doivent être bloquées');

    // 3. Détection de raccourcisseurs d'IP et IP loggers
    $loggerUrl = "Regarde mes stats sur https://grabify.link/abc123";
    $flagsLogger = detectPhishingAndSuspiciousLinks($loggerUrl, false);
    $assert(!empty($flagsLogger), 'Les liens Grabify / IP loggers doivent être interdits');

    // 4. Lien officiel Steam Store autorisé pour utilisateur régulier
    $legitUrl = "J'adore ce jeu : https://store.steampowered.com/app/105600/Terraria/";
    $flagsLegit = detectPhishingAndSuspiciousLinks($legitUrl, false);
    $assert(empty($flagsLegit), 'Les liens officiels du Steam Store doivent être autorisés');

    // 5. Lien Itch.io officiel autorisé
    $legitItch = "Découvrez ce prototype : https://itch.io/games/top-free";
    $flagsItch = detectPhishingAndSuspiciousLinks($legitItch, false);
    $assert(empty($flagsItch), 'Les liens officiels Itch.io doivent être autorisés');
}

function test_chat_username_normalization($assert) {
    $raw = "  Éléphant_Bleu-99  ";
    $normalized = normalizeChatUsername($raw);
    $assert($normalized === 'elephantbleu99', 'Le pseudo de chat doit être débarrassé des accents, tirets et espaces');
}
