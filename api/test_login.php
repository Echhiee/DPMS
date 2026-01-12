<?php
// Quick test endpoint to verify login works
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

// Set response headers
header('Content-Type: application/json');

// Test with demo credentials
$test_cases = [
    ['email' => 'admin@care.com', 'password' => '123456', 'expected' => 'admin'],
    ['email' => 'doctor@care.com', 'password' => '123456', 'expected' => 'doctor'],
];

$results = [];

foreach ($test_cases as $test) {
    $pdo = db();
    
    $email = strtolower(trim($test['email']));
    $password = $test['password'];
    
    $stmt = $pdo->prepare("SELECT id, role, full_name, email, password_hash, status FROM users WHERE email=?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    $result = [
        'email' => $test['email'],
        'expected_role' => $test['expected'],
        'user_found' => $user ? true : false,
    ];
    
    if ($user) {
        $result['actual_role'] = $user['role'];
        $result['status'] = $user['status'];
        $result['password_valid'] = password_verify($password, $user['password_hash']) ? true : false;
        
        if ($user['role'] !== 'admin' && $user['status'] !== 'approved') {
            $result['login_allowed'] = false;
            $result['reason'] = 'Account pending approval';
        } else {
            $result['login_allowed'] = true;
        }
    }
    
    $results[] = $result;
}

echo json_encode([
    'ok' => true,
    'data' => $results
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>
