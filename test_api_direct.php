<?php
session_start();

// Simulate login attempt
$_POST['email'] = 'admin@care.com';
$_POST['password'] = '123456';

// Manual request to auth_login.php
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => 'http://localhost/project-I/api/auth_login.php',
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Cookie: PHPSESSID=' . session_id()
    ],
    CURLOPT_POSTFIELDS => json_encode(['email' => 'admin@care.com', 'password' => '123456']),
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo '<html><head><title>API Test</title><style>
body { font-family: monospace; padding: 20px; background: #f5f5f5; }
.container { background: white; padding: 20px; border-radius: 8px; max-width: 1000px; margin: 0 auto; }
pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; border: 1px solid #ddd; }
.pass { color: #2e7d32; font-weight: bold; }
.fail { color: #c62828; font-weight: bold; }
</style></head><body>';

echo '<div class="container">';
echo '<h1>🔍 API Response Test</h1>';
echo '<p><strong>HTTP Status Code:</strong> ' . $httpCode . '</p>';
echo '<p><strong>Response:</strong></p>';
echo '<pre>' . htmlspecialchars($response) . '</pre>';

$data = json_decode($response, true);
if (json_last_error() === JSON_ERROR_NONE) {
    if ($data['ok']) {
        echo '<p class="pass">✅ Login would succeed!</p>';
    } else {
        echo '<p class="fail">❌ Login would fail: ' . htmlspecialchars($data['error'] ?? 'Unknown') . '</p>';
    }
} else {
    echo '<p class="fail">❌ Not valid JSON: ' . json_last_error_msg() . '</p>';
}

echo '</div></body></html>';
?>
