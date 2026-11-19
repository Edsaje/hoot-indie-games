<?php
/**
 * 🦉 Hoot Indie Games — Runner de Tests Unitaires PHP Autonome
 * Exécute l'ensemble des suites de tests de tests/php/ et rapporte les résultats.
 */

$testDir = __DIR__ . '/php';
$testFiles = glob($testDir . '/*Test.php');

$totalTests = 0;
$passedTests = 0;
$failedTests = 0;
$errors = [];

echo "\n======================================================\n";
echo "🦉 Hoot Indie Games — Suite de Tests Backend PHP\n";
echo "======================================================\n\n";

$assert = function ($condition, $message = 'Assertion failed') use (&$currentTestName, &$currentTestFailed, &$errors) {
    if (!$condition) {
        $currentTestFailed = true;
        $errors[] = "[ÉCHEC] $currentTestName : $message";
    }
};

foreach ($testFiles as $file) {
    $baseName = basename($file);
    echo "▶ Exécution de $baseName...\n";

    $beforeFunctions = get_defined_functions()['user'];
    require_once $file;
    $afterFunctions = get_defined_functions()['user'];

    $newFunctions = array_diff($afterFunctions, $beforeFunctions);
    $testFunctions = array_filter($newFunctions, function ($fn) {
        return strpos($fn, 'test_') === 0;
    });

    foreach ($testFunctions as $testFn) {
        $totalTests++;
        $currentTestName = $testFn;
        $currentTestFailed = false;

        try {
            call_user_func($testFn, $assert);
        } catch (\Throwable $e) {
            $currentTestFailed = true;
            $errors[] = "[EXCEPTION] $testFn : " . $e->getMessage() . " à la ligne " . $e->getLine();
        }

        if ($currentTestFailed) {
            $failedTests++;
            echo "   ❌ $testFn\n";
        } else {
            $passedTests++;
            echo "   ✅ $testFn\n";
        }
    }
    echo "\n";
}

echo "------------------------------------------------------\n";
echo "Résultat : $passedTests/$totalTests tests passés avec succès.\n";

if (!empty($errors)) {
    echo "\nDétail des échecs :\n";
    foreach ($errors as $err) {
        echo "  - $err\n";
    }
    echo "\n❌ La suite de tests PHP a échoué.\n\n";
    exit(1);
} else {
    echo "✅ Tous les tests PHP sont validés !\n\n";
    exit(0);
}
