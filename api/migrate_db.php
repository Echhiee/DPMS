<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';

try {
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    // Update all existing users without a status to 'approved'
    $pdo->exec("UPDATE users SET status = 'approved' WHERE status = 'pending' OR status IS NULL");

    echo json_encode([
        'ok' => true,
        'message' => 'Database migration completed successfully. All existing users set to approved status.'
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
