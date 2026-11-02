<?php
/**
 * translate.php — Passerelle de traduction haute disponibilité pour Hoot Indie Games
 * Fournit un endpoint même-origine ('self') pour la traduction du chat,
 * 100% immunisé contre les restrictions CSP et les bloqueurs de publicité.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: public, max-age=86400'); // Cache 24h pour les phrases identiques

$text = trim((string)($_GET['q'] ?? ''));
$targetLang = trim((string)($_GET['tl'] ?? 'en'));
$sourceLang = trim((string)($_GET['sl'] ?? 'autodetect'));

if ($text === '') {
    echo json_encode(['success' => true, 'translatedText' => '', 'isSameLanguage' => true], JSON_UNESCAPED_UNICODE);
    exit;
}

// Nettoyage et normalisation des langues
function normLang(string $lang): string {
    $l = strtolower($lang);
    if (str_starts_with($l, 'fr')) return 'fr';
    if (str_starts_with($l, 'en')) return 'en';
    if (str_starts_with($l, 'de')) return 'de';
    if (str_starts_with($l, 'es')) return 'es';
    if (str_starts_with($l, 'ja')) return 'ja';
    if (str_starts_with($l, 'pt')) return 'pt';
    return substr($l, 0, 2);
}

$normTarget = normLang($targetLang);
$normSource = ($sourceLang === 'autodetect' || $sourceLang === '' || $sourceLang === 'global' || $sourceLang === 'feedback')
    ? 'autodetect'
    : normLang($sourceLang);

if ($normSource !== 'autodetect' && $normSource === $normTarget) {
    echo json_encode(['success' => true, 'translatedText' => $text, 'isSameLanguage' => true], JSON_UNESCAPED_UNICODE);
    exit;
}

// 1. Appel MyMemory avec email officiel pour quota 10 000 mots/jour
$langpair = urlencode("{$normSource}|{$normTarget}");
$url = "https://api.mymemory.translated.net/get?q=" . urlencode($text) . "&langpair={$langpair}&de=contact@hootindiegames.com";

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 6,
    CURLOPT_CONNECTTIMEOUT => 3,
    CURLOPT_USERAGENT => 'HootIndieGames-TranslationGateway/2.0',
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response !== false && $httpCode >= 200 && $httpCode < 500) {
    $data = json_decode($response, true);
    $status = (int)($data['responseStatus'] ?? 0);
    $details = strtoupper((string)($data['responseDetails'] ?? ''));

    // Même langue détectée
    if ($status === 403 && str_contains($details, 'PLEASE SELECT TWO DISTINCT LANGUAGES')) {
        echo json_encode([
            'success' => true,
            'translatedText' => $text,
            'isSameLanguage' => true,
            'detectedLang' => $normTarget
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($status === 200 && isset($data['responseData']['translatedText'])) {
        $translated = html_entity_decode((string)$data['responseData']['translatedText'], ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $detected = isset($data['responseData']['detectedLanguage']) ? normLang((string)$data['responseData']['detectedLanguage']) : null;

        if (!str_starts_with(strtoupper($translated), 'MYMEMORY WARNING:') && !str_contains(strtoupper($translated), 'PLEASE SELECT TWO DISTINCT LANGUAGES')) {
            $isSame = ($detected === $normTarget) || (trim($translated) === $text);
            echo json_encode([
                'success' => true,
                'translatedText' => $isSame ? $text : $translated,
                'detectedLang' => $detected,
                'isSameLanguage' => $isSame
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
}

// 2. Moteur de secours Google Translate si MyMemory est indisponible, limité ou renvoie un warning
$gtxSource = ($normSource === 'autodetect') ? 'auto' : $normSource;
$gtxUrl = "https://translate.googleapis.com/translate_a/single?client=gtx&sl={$gtxSource}&tl={$normTarget}&dt=t&q=" . urlencode($text);

$ch2 = curl_init($gtxUrl);
curl_setopt_array($ch2, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 5,
    CURLOPT_CONNECTTIMEOUT => 2,
    CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
]);

$gtxRes = curl_exec($ch2);
$gtxCode = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
curl_close($ch2);

if ($gtxRes !== false && $gtxCode === 200) {
    $gtxData = json_decode($gtxRes, true);
    if (is_array($gtxData) && isset($gtxData[0]) && is_array($gtxData[0])) {
        $translatedParts = '';
        foreach ($gtxData[0] as $part) {
            if (isset($part[0]) && is_string($part[0])) {
                $translatedParts .= $part[0];
            }
        }
        if ($translatedParts !== '') {
            $detected = isset($gtxData[2]) && is_string($gtxData[2]) ? normLang($gtxData[2]) : null;
            $isSame = ($detected === $normTarget) || (trim($translatedParts) === $text);
            echo json_encode([
                'success' => true,
                'translatedText' => $isSame ? $text : $translatedParts,
                'isSameLanguage' => $isSame,
                'detectedLang' => $detected
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
}

// 3. Si échec de tous les moteurs, renvoie le texte d'origine
echo json_encode([
    'success' => false,
    'translatedText' => $text
], JSON_UNESCAPED_UNICODE);
