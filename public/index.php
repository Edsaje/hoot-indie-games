<?php
// ==============================================================================
// Hoot Indie Games — Injecteur SEO & Routeur Canonique Dynamique
// Permet à Googlebot de recevoir immédiatement la balise canonique exacte
// correspondant à la route demandée avant même l'exécution du JavaScript client.
// ==============================================================================

$requestUri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$cleanPath = strtolower(trim($requestUri, '/'));

// Liste des routes officielles déclarées dans le sitemap.xml
$validRoutes = [
    'gems', 'catalog', 'cards', 'minigames', 'screenle', 'indledle',
    'linkle', 'profille', 'chrono', 'pixel', 'review', 'blindtest',
    'quiz', 'timeattack', 'versus', 'arcade', 'micro', 'toolbox', 'roost'
];

$canonicalUrl = 'https://hootindiegames.com/';
if ($cleanPath && in_array($cleanPath, $validRoutes, true)) {
    $canonicalUrl = 'https://hootindiegames.com/' . $cleanPath;
}

$htmlFile = __DIR__ . '/index.html';
if (file_exists($htmlFile)) {
    $html = file_get_contents($htmlFile);

    // Remplacement de la balise canonique par l'URL exacte de la route
    $html = str_replace(
        '<link rel="canonical" href="https://hootindiegames.com/">',
        '<link rel="canonical" href="' . htmlspecialchars($canonicalUrl, ENT_QUOTES, 'UTF-8') . '">',
        $html
    );

    // Remplacement de l'URL OpenGraph pour partager la page exacte
    $html = str_replace(
        '<meta property="og:url" content="https://hootindiegames.com/">',
        '<meta property="og:url" content="' . htmlspecialchars($canonicalUrl, ENT_QUOTES, 'UTF-8') . '">',
        $html
    );

    header('Content-Type: text/html; charset=UTF-8');
    echo $html;
    exit;
}

// Fallback direct
header('HTTP/1.1 500 Internal Server Error');
echo 'Application build missing.';
