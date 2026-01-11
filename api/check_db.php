<?php
require_once __DIR__ . "/config.php";

$pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
]);

// Check doctor_profiles table structure
echo "=== DOCTOR_PROFILES TABLE STRUCTURE ===\n";
$stmt = $pdo->query("DESCRIBE doctor_profiles");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($columns as $col) {
    echo $col['Field'] . " (" . $col['Type'] . ")\n";
}

echo "\n=== CURRENT DATA ===\n";
$stmt = $pdo->query("SELECT * FROM doctor_profiles LIMIT 1");
$data = $stmt->fetch(PDO::FETCH_ASSOC);
echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n";
?>
