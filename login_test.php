<?php
// Test login endpoint directly
session_start();
header('Content-Type: text/html; charset=utf-8');

echo '<html><head><title>Login Test</title><style>
body { font-family: Arial; padding: 20px; background: #f5f5f5; }
.container { background: white; padding: 20px; border-radius: 8px; max-width: 800px; margin: 0 auto; }
.test { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
.pass { background: #e8f5e9; color: #2e7d32; border-left: 4px solid #4CAF50; }
.fail { background: #ffebee; color: #c62828; border-left: 4px solid #f44336; }
pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
</style></head><body><div class="container">';

echo '<h1>Login Endpoint Test</h1>';

// Test 1: Test with admin credentials
echo '<div class="test">';
echo '<h3>Test 1: Admin Login (admin@care.com / 123456)</h3>';

$ch = curl_init('http://localhost/project-I/api/auth_login.php');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode(['email' => 'admin@care.com', 'password' => '123456']),
    CURLOPT_COOKIE => 'PHPSESSID=' . session_id(),
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo '<p><strong>HTTP Code:</strong> ' . $httpCode . '</p>';
echo '<p><strong>Response:</strong></p>';
echo '<pre>' . htmlspecialchars($response) . '</pre>';

$data = json_decode($response, true);
if (json_last_error() === JSON_ERROR_NONE) {
    if ($data['ok']) {
        echo '<p class="pass">✅ Login successful!</p>';
        echo '<p>User: ' . htmlspecialchars(json_encode($data['data'], JSON_PRETTY_PRINT)) . '</p>';
    } else {
        echo '<p class="fail">❌ Login failed: ' . htmlspecialchars($data['error'] ?? 'Unknown error') . '</p>';
    }
} else {
    echo '<p class="fail">❌ Invalid JSON response</p>';
}

echo '</div>';

// Test 2: Test with doctor credentials
echo '<div class="test">';
echo '<h3>Test 2: Doctor Login (doctor@care.com / 123456)</h3>';

$ch = curl_init('http://localhost/project-I/api/auth_login.php');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode(['email' => 'doctor@care.com', 'password' => '123456']),
    CURLOPT_COOKIE => 'PHPSESSID=' . session_id(),
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo '<p><strong>HTTP Code:</strong> ' . $httpCode . '</p>';
echo '<p><strong>Response:</strong></p>';
echo '<pre>' . htmlspecialchars($response) . '</pre>';

$data = json_decode($response, true);
if (json_last_error() === JSON_ERROR_NONE) {
    if ($data['ok']) {
        echo '<p class="pass">✅ Login successful!</p>';
    } else {
        echo '<p class="fail">❌ Login failed: ' . htmlspecialchars($data['error'] ?? 'Unknown error') . '</p>';
    }
} else {
    echo '<p class="fail">❌ Invalid JSON response</p>';
}

echo '</div>';

// Test 3: Check database connection
echo '<div class="test">';
echo '<h3>Test 3: Database Connection</h3>';

try {
    require_once __DIR__ . '/api/config.php';
    $pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo '<p class="pass">✅ Database connection successful</p>';
    
    // Check if admin user exists
    $stmt = $pdo->prepare("SELECT id, email, status FROM users WHERE email = ?");
    $stmt->execute(['admin@care.com']);
    $user = $stmt->fetch();
    
    if ($user) {
        echo '<p>Admin user found:</p>';
        echo '<pre>' . json_encode($user, JSON_PRETTY_PRINT) . '</pre>';
    } else {
        echo '<p class="fail">Admin user NOT found in database</p>';
    }
} catch (Exception $e) {
    echo '<p class="fail">❌ Database error: ' . htmlspecialchars($e->getMessage()) . '</p>';
}

echo '</div>';

echo '</div></body></html>';
?>
