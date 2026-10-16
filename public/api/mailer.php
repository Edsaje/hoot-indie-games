<?php
/**
 * 🦉 Hoot Indie Games — Module Transactionnel d'Envoi d'Emails
 * 
 * Assure la distribution fiable des e-mails de vérification et de sécurité :
 * 1. Support de l'API Resend (https://resend.com)
 * 2. Support de l'API Brevo / Sendinblue (https://brevo.com)
 * 3. Mode Fallback & simulateur de développement local (.mail_dev.log)
 */

if (basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'] ?? '')) {
    http_response_code(403);
    exit(json_encode(['error' => 'forbidden', 'message' => 'Accès direct strictement interdit.']));
}

/**
 * Charge la configuration de messagerie
 */
function getMailConfig() {
    $configFile = __DIR__ . '/.mail_config.php';
    $cfg = [];
    if (file_exists($configFile)) {
        $loaded = require_once $configFile;
        if (is_array($loaded)) {
            $cfg = $loaded;
        }
    }

    $resendKey = $cfg['resend_api_key'] ?? (defined('RESEND_API_KEY') ? constant('RESEND_API_KEY') : (getenv('RESEND_API_KEY') ?: ''));
    $brevoKey = $cfg['brevo_api_key'] ?? (defined('BREVO_API_KEY') ? constant('BREVO_API_KEY') : (getenv('BREVO_API_KEY') ?: ''));

    $provider = $cfg['provider'] ?? (!empty($resendKey) ? 'resend' : (!empty($brevoKey) ? 'brevo' : 'dev'));

    return [
        'provider' => $provider,
        'resend_api_key' => $resendKey,
        'brevo_api_key' => $brevoKey,
        'from_email' => $cfg['from_email'] ?? (getenv('MAIL_FROM_EMAIL') ?: 'contact@hootindiegames.com'),
        'from_name' => $cfg['from_name'] ?? (getenv('MAIL_FROM_NAME') ?: 'Hoot Indie Games 🦉'),
        'app_url' => $cfg['app_url'] ?? (getenv('APP_URL') ?: 'https://hootindiegames.com'),
        'dev_log_file' => $cfg['dev_log_file'] ?? (__DIR__ . '/user_saves/.mail_dev.log'),
    ];
}

/**
 * Génère le template HTML responsive et sécurisé aux couleurs de Hoot Indie Games
 */
function buildVerificationEmailHtml($username, $verifyUrl, $otpCode) {
    $safeUsername = htmlspecialchars($username, ENT_QUOTES, 'UTF-8');
    $safeUrl = htmlspecialchars($verifyUrl, ENT_QUOTES, 'UTF-8');
    $safeOtp = htmlspecialchars($otpCode, ENT_QUOTES, 'UTF-8');

    return <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Activez votre compte Hoot Indie Games</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030d0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #030d0a; padding: 32px 16px;">
        <tr>
            <td align="center">
                <!-- Conteneur principal -->
                <table role="presentation" width="100%" style="max-width: 580px; background-color: #061e16; border: 1px solid #10b98133; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
                    <!-- En-tête / Logo -->
                    <tr>
                        <td align="center" style="padding: 36px 24px 20px 24px; background: linear-gradient(180deg, rgba(16,185,129,0.15) 0%, rgba(6,30,22,0) 100%);">
                            <div style="font-size: 42px; line-height: 1; margin-bottom: 12px;">🦉</div>
                            <div style="font-size: 20px; font-weight: 900; letter-spacing: 2px; color: #f59e0b; text-transform: uppercase;">
                                Hoot Indie Games
                            </div>
                            <div style="font-size: 11px; letter-spacing: 1px; color: #10b981; text-transform: uppercase; margin-top: 4px; font-weight: 700;">
                                Le Perchoir des Explorateurs Indés
                            </div>
                        </td>
                    </tr>

                    <!-- Corps de l'e-mail -->
                    <tr>
                        <td style="padding: 24px 32px 32px 32px;">
                            <h1 style="font-size: 20px; font-weight: 800; color: #ffffff; margin: 0 0 16px 0; line-height: 1.3;">
                                Bienvenue, {$safeUsername} ! 🎮
                            </h1>

                            <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin: 0 0 24px 0;">
                                Merci d'avoir rejoint <strong>Hoot Indie Games</strong>. Afin de protéger la communauté contre les robots, sécuriser vos statistiques et <strong>activer immédiatement l'accès au tchat en direct et aux salons privés</strong>, veuillez confirmer votre adresse email.
                            </p>

                            <!-- Bouton principal d'activation -->
                            <div style="text-align: center; margin: 32px 0;">
                                <a href="{$safeUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #020d0a; font-size: 14px; font-weight: 900; text-decoration: none; text-transform: uppercase; letter-spacing: 0.5px; padding: 14px 32px; border-radius: 12px; box-shadow: 0 8px 20px rgba(245,158,11,0.35);">
                                    Confirmer mon adresse email →
                                </a>
                            </div>

                            <!-- Bloc code OTP alternatif -->
                            <div style="background-color: #020d0a; border: 1px solid #78350f66; border-radius: 14px; padding: 20px; text-align: center; margin: 28px 0;">
                                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 8px;">
                                    Ou saisissez ce code de validation à 6 chiffres
                                </div>
                                <div style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #f59e0b; font-family: 'Courier New', Courier, monospace; margin: 4px 0;">
                                    {$safeOtp}
                                </div>
                                <div style="font-size: 11px; color: #64748b; margin-top: 6px;">
                                    (À renseigner directement sur le site dans la fenêtre de confirmation)
                                </div>
                            </div>

                            <!-- Mention d'expiration & Sécurité -->
                            <div style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin-top: 24px; border-top: 1px solid #1e293b; padding-top: 20px;">
                                <p style="margin: 0 0 8px 0;">
                                    ⏳ <strong>Durée de validité :</strong> Ce lien et ce code sont valables pendant <strong>30 minutes</strong>. Passé ce délai, ils seront invalidés.
                                </p>
                                <p style="margin: 0; color: #64748b;">
                                    🔒 Si vous n'êtes pas à l'origine de cette inscription, ignorez simplement ce message. Aucun compte ne sera activé.
                                </p>
                            </div>

                            <!-- Lien brut de secours -->
                            <div style="margin-top: 20px; padding: 12px; background-color: #04120e; border-radius: 8px; font-size: 10px; color: #64748b; word-break: break-all;">
                                Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br>
                                <a href="{$safeUrl}" style="color: #10b981; text-decoration: underline;">{$safeUrl}</a>
                            </div>
                        </td>
                    </tr>

                    <!-- Pied de page -->
                    <tr>
                        <td align="center" style="padding: 20px 24px; background-color: #020d0a; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b; line-height: 1.4;">
                            🦉 <strong>Hoot Indie Games</strong> — Vitrine souveraine et communautaire du jeu vidéo indépendant.<br>
                            <a href="https://hootindiegames.com" style="color: #94a3b8; text-decoration: none;">hootindiegames.com</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
HTML;
}

/**
 * Envoie un email de vérification à l'utilisateur
 * 
 * @param string $recipientEmail Adresse email du destinataire
 * @param string $username Nom d'utilisateur
 * @param string $token Jeton cryptographique d'URL
 * @param string|null $otp Code OTP à 6 chiffres
 * @return array Résultat de l'envoi ['success' => bool, 'provider' => string, 'message' => string]
 */
function sendVerificationEmail($recipientEmail, $username, $token, $otp = null) {
    $config = getMailConfig();
    $provider = $config['provider'] ?? 'dev';
    $appUrl = rtrim($config['app_url'] ?? 'https://hootindiegames.com', '/');

    // Code OTP à 6 chiffres si non fourni
    if (empty($otp)) {
        $otp = sprintf('%06d', random_int(100000, 999999));
    }

    $verifyUrl = $appUrl . '/#verify-email?token=' . urlencode($token);
    $htmlContent = buildVerificationEmailHtml($username, $verifyUrl, $otp);
    $textContent = "Bienvenue sur Hoot Indie Games, {$username} !\n\n"
        . "Confirmez votre adresse email en cliquant sur le lien suivant :\n"
        . "{$verifyUrl}\n\n"
        . "Ou en saisissant votre code de validation à 6 chiffres : {$otp}\n\n"
        . "Ce lien et ce code expirent dans 30 minutes.\n"
        . "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.\n";

    $subject = '🦉 Activez votre compte Hoot Indie Games';

    // -------------------------------------------------------------
    // OPTION 1 : API RESEND (https://resend.com)
    // -------------------------------------------------------------
    if ($provider === 'resend' && !empty($config['resend_api_key'])) {
        $payload = [
            'from' => $config['from_name'] . ' <' . $config['from_email'] . '>',
            'to' => [$recipientEmail],
            'subject' => $subject,
            'html' => $htmlContent,
            'text' => $textContent,
        ];

        $ch = curl_init('https://api.resend.com/emails');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . trim($config['resend_api_key']),
            'Content-Type: application/json',
            'User-Agent: HootIndieGames-Mailer/1.0',
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if (!$curlError && $httpCode >= 200 && $httpCode < 300) {
            return [
                'success' => true,
                'provider' => 'resend',
                'message' => 'Email de vérification envoyé avec succès via Resend.',
            ];
        }

        error_log("[Hoot Mailer Error] Échec de l'envoi Resend (HTTP $httpCode): " . ($response ?: $curlError));
    }

    // -------------------------------------------------------------
    // OPTION 2 : API BREVO / SENDINBLUE (https://brevo.com)
    // -------------------------------------------------------------
    if ($provider === 'brevo' && !empty($config['brevo_api_key'])) {
        $payload = [
            'sender' => [
                'name' => $config['from_name'],
                'email' => $config['from_email'],
            ],
            'to' => [
                [
                    'email' => $recipientEmail,
                    'name' => $username,
                ],
            ],
            'subject' => $subject,
            'htmlContent' => $htmlContent,
            'textContent' => $textContent,
        ];

        $ch = curl_init('https://api.brevo.com/v3/smtp/email');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'api-key: ' . trim($config['brevo_api_key']),
            'Content-Type: application/json',
            'User-Agent: HootIndieGames-Mailer/1.0',
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if (!$curlError && $httpCode >= 200 && $httpCode < 300) {
            return [
                'success' => true,
                'provider' => 'brevo',
                'message' => 'Email de vérification envoyé avec succès via Brevo.',
            ];
        }

        error_log("[Hoot Mailer Error] Échec de l'envoi Brevo (HTTP $httpCode): " . ($response ?: $curlError));
    }

    // -------------------------------------------------------------
    // FALLBACK / MODE DÉVELOPPEMENT LOCAL (Simulateur Sécurisé)
    // -------------------------------------------------------------
    // Si aucune clé API n'est configurée ou en cas de problème réseau en dev,
    // on consigne l'email dans un journal local sécurisé (.mail_dev.log).
    $devLogFile = $config['dev_log_file'] ?? (__DIR__ . '/user_saves/.mail_dev.log');
    $logDir = dirname($devLogFile);
    if (!is_dir($logDir)) {
        @mkdir($logDir, 0755, true);
    }

    $logEntry = [
        'timestamp' => time(),
        'date' => date('c'),
        'to' => $recipientEmail,
        'username' => $username,
        'token' => $token,
        'otp' => $otp,
        'verifyUrl' => $verifyUrl,
        'provider' => 'dev_fallback',
    ];

    $logString = json_encode($logEntry, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n---\n";
    @file_put_contents($devLogFile, $logString, FILE_APPEND | LOCK_EX);

    $isLocalEnv = (getenv('APP_ENV') === 'local') 
        || in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'], true)
        || (php_sapi_name() === 'cli-server')
        || in_array($_SERVER['HTTP_HOST'] ?? '', ['localhost', '127.0.0.1'], true);

    return [
        'success' => true,
        'provider' => 'dev',
        'message' => 'E-mail enregistré dans le journal de développement local (.mail_dev.log).',
        'devLogged' => true,
        'token' => $isLocalEnv ? $token : null,
        'otp' => $isLocalEnv ? $otp : null,
        'verifyUrl' => $isLocalEnv ? $verifyUrl : null,
    ];
}
