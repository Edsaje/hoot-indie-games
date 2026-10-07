<?php
\ = 'public/api/chat.php';
\ = file_get_contents(\);

\ = preg_replace(
    '/\\\\s*=\s*trim\([^;]+\[' . "'userId'" . '\][^;]+\);/i',
    '\ = \[' . "'hoot_user_id'" . '] ?? \'\';',
    \
);
\ = preg_replace(
    '/\\\\s*=\s*trim\([^;]+\[' . "'steamId'" . '\][^;]+\);/i',
    '\ = \[' . "'steam_id'" . '] ?? \'\';',
    \
);
\ = preg_replace(
    '/\\\\s*=\s*trim\([^;]+\[' . "'email'" . '\][^;]+\);/i',
    '\ = \[' . "'user_email'" . '] ?? \'\';',
    \
);

file_put_contents(\, \);
