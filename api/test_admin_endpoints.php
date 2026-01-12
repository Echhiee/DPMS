<?php
declare(strict_types=1);
session_start();

// Mock authentication for testing
$_SESSION['user'] = [
    'id' => 1,
    'role' => 'admin',
    'name' => 'Test Admin',
    'email' => 'admin@care.com'
];

require_once __DIR__ . '/config.php';

header('Content-Type: text/html; charset=utf-8');

echo '<html><head><title>Admin API Test</title><style>
body { font-family: monospace; background: #f5f5f5; padding: 20px; }
.container { background: white; padding: 20px; border-radius: 8px; max-width: 1200px; margin: 0 auto; }
.test { margin: 15px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
.pass { background: #e8f5e9; color: #2e7d32; border-left: 4px solid #4CAF50; }
.fail { background: #ffebee; color: #c62828; border-left: 4px solid #f44336; }
.section { margin: 20px 0; padding: 15px; background: #f9f9f9; border-left: 4px solid #2196F3; }
pre { background: #f5f5f5; padding: 10px; overflow-x: auto; border-radius: 3px; }
</style></head><body><div class="container">';

echo '<h1>🧪 Admin API Endpoints Test</h1>';

function testEndpoint($name, $file, $method = 'GET', $payload = null) {
    global $pdo;
    
    echo "<div class='test'>";
    echo "<h3>Testing: $name</h3>";
    echo "<p><strong>Endpoint:</strong> api/$file</p>";
    
    try {
        // Test if file exists
        $filepath = __DIR__ . '/' . $file;
        if (!file_exists($filepath)) {
            echo "<div class='fail'><strong>❌ FILE NOT FOUND:</strong> $filepath</div>";
            echo "</div>";
            return false;
        }
        
        // Try to include and execute
        ob_start();
        include $filepath;
        $output = ob_get_clean();
        
        // Try to parse as JSON
        if ($output) {
            $data = json_decode($output, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                if (isset($data['ok']) && $data['ok']) {
                    echo "<div class='pass'><strong>✅ SUCCESS</strong></div>";
                    echo "<pre>" . json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "</pre>";
                    return true;
                } else {
                    echo "<div class='fail'><strong>❌ API ERROR:</strong> " . ($data['error'] ?? 'Unknown error') . "</div>";
                    echo "<pre>" . json_encode($data, JSON_PRETTY_PRINT) . "</pre>";
                    return false;
                }
            } else {
                echo "<div class='fail'><strong>❌ INVALID JSON:</strong> " . json_last_error_msg() . "</div>";
                echo "<pre>" . htmlspecialchars(substr($output, 0, 500)) . "</pre>";
                return false;
            }
        } else {
            echo "<div class='fail'><strong>❌ NO OUTPUT</strong></div>";
            return false;
        }
    } catch (Exception $e) {
        echo "<div class='fail'><strong>❌ EXCEPTION:</strong> " . htmlspecialchars($e->getMessage()) . "</div>";
        return false;
    }
    
    echo "</div>";
    return false;
}

echo '<div class="section"><h2>Admin Dashboard Endpoints</h2>';
testEndpoint('Admin Dashboard Stats', 'admin_dashboard.php');
testEndpoint('Registration Requests', 'admin_registration_requests.php');
testEndpoint('Admin Patients List', 'admin_patients.php');
testEndpoint('Admin Doctors List', 'admin_doctors.php');
testEndpoint('Admin Login History', 'admin_login_history.php');
echo '</div>';

echo '<div class="section"><h2>Other Critical Endpoints</h2>';
testEndpoint('Me (Auth Check)', 'me.php');
testEndpoint('Helpers Test', 'helpers.php');
echo '</div>';

echo '</div></body></html>';
?>
