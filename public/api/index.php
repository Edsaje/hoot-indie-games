<?php
http_response_code(403);
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['error' => 'forbidden', 'message' => 'Accès direct interdit.']);
exit;
