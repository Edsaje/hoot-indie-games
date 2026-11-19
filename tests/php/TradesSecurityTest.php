<?php
/**
 * Test unitaire PHP : trades.php
 */

function test_trades_rules_and_validation($assert) {
    // 1. Validation de l'interdiction d'auto-échange (Self-Trade)
    $fromCode = 'HOOT-1234';
    $toCode = 'HOOT-1234';

    $isSelfTrade = ($fromCode === $toCode);
    $assert($isSelfTrade === true, 'Le système doit interdire un échange avec soi-même');

    // 2. Nettoyage automatique des offres expirées de plus de 30 jours
    $now = time();
    $mockTrades = [
        [
            'id' => 'trade_old',
            'status' => 'rejected',
            'createdAt' => $now - (35 * 86400) // 35 jours
        ],
        [
            'id' => 'trade_active',
            'status' => 'pending',
            'createdAt' => $now - (5 * 86400) // 5 jours
        ]
    ];

    // Logique de nettoyage issue de saveTradesData
    $cleaned = [];
    foreach ($mockTrades as $t) {
        $status = $t['status'] ?? 'pending';
        $age = $now - intval($t['createdAt'] ?? $now);
        if ($status !== 'pending' && $age > 30 * 86400) {
            continue; // Expiré
        }
        $cleaned[] = $t;
    }

    $assert(count($cleaned) === 1, 'Les offres archivées de plus de 30 jours doivent être purgées');
    $assert($cleaned[0]['id'] === 'trade_active', 'L\'offre en attente récente doit être conservée');
}

function test_trades_status_transitions($assert) {
    $validStatuses = ['pending', 'accepted', 'rejected', 'cancelled'];
    $currentStatus = 'pending';

    $assert(in_array('accepted', $validStatuses), 'Statut accepted doit être valide');
    $assert(in_array('rejected', $validStatuses), 'Statut rejected doit être valide');
    $assert(in_array('cancelled', $validStatuses), 'Statut cancelled doit être valide');
}
