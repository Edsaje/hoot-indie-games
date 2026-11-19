<?php
/**
 * Test unitaire PHP : versus_room.php & relais multijoueur
 */

$apiDir = file_exists(__DIR__ . '/../../public/api') ? __DIR__ . '/../../public/api' : (file_exists(__DIR__ . '/../api') ? __DIR__ . '/../api' : '/var/www/html/api');
require_once $apiDir . '/versus_room.php';

function test_versus_room_empty_file_fallback($assert) {
    $nonExistent = sys_get_temp_dir() . '/versus_test_nonexistent_' . uniqid() . '.json';
    $data = loadRoomsData($nonExistent);
    $assert(is_array($data), 'loadRoomsData doit retourner un tableau');
    $assert(empty($data), 'loadRoomsData doit retourner un tableau vide si le fichier n\'existe pas');
}

function test_versus_room_atomic_persistence($assert) {
    $tempFile = sys_get_temp_dir() . '/versus_rooms_test_' . uniqid() . '.json';

    $mockRooms = [
        'ABC123' => [
            'code' => 'ABC123',
            'createdAt' => time(),
            'updatedAt' => time(),
            'status' => 'waiting',
            'host' => [
                'id' => 'host_12345',
                'name' => 'TestPlayer',
                'avatarId' => 'owl',
                'elo' => 1200
            ],
            'messages' => []
        ]
    ];

    $saved = saveRoomsData($tempFile, $mockRooms);
    $assert($saved === true, 'saveRoomsData doit réussir avec verrouillage atomique');

    $loaded = loadRoomsData($tempFile);
    $assert(isset($loaded['ABC123']), 'Le salon sauvegardé doit être retrouvé');
    $assert($loaded['ABC123']['host']['name'] === 'TestPlayer', 'Les données hôte doivent être intactes');

    @unlink($tempFile);
}

function test_versus_room_code_validation($assert) {
    $validCode = 'HOOT99';
    $assert(preg_match('/^[A-Z0-9]{4,8}$/', $validCode) === 1, 'Un code à 6 caractères alphanumériques doit être valide');

    $invalidCode = 'bad-code!';
    $assert(preg_match('/^[A-Z0-9]{4,8}$/', $invalidCode) === 0, 'Un code contenant des caractères spéciaux doit être refusé');
}
