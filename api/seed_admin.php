<?php
declare(strict_types=1);
require_once __DIR__ . "/config.php";

try {
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    // Check if admin already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND role = 'admin'");
    $stmt->execute(['admin@care.com']);
    
    if ($stmt->fetch()) {
        echo json_encode([
            'ok' => true,
            'message' => 'Admin user already exists',
            'email' => 'admin@care.com',
            'password' => '123456'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Create admin user
    $hash = password_hash('123456', PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (role, full_name, email, password_hash, status) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute(['admin', 'System Admin', 'admin@care.com', $hash, 'approved']);
    $admin_id = (int)$pdo->lastInsertId();

    // Create admin profile
    $pdo->prepare("INSERT INTO admin_profiles (user_id, phone, department) VALUES (?, ?, ?)")
        ->execute([$admin_id, '+1234567890', 'Administration']);

    echo json_encode([
        'ok' => true,
        'message' => 'Admin user created successfully',
        'email' => 'admin@care.com',
        'password' => '123456',
        'note' => 'Please change this password after first login'
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
