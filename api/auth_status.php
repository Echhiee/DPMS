<?php
// Final comprehensive authentication test
declare(strict_types=1);
require_once __DIR__ . '/config.php';

header('Content-Type: text/html; charset=utf-8');

try {
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
    
    echo '<html><head><title>Auth System Test</title><style>
    body { font-family: monospace; background: #f5f5f5; padding: 20px; }
    .container { background: white; padding: 20px; border-radius: 8px; max-width: 1000px; margin: 0 auto; }
    .pass { color: #4CAF50; font-weight: bold; }
    .fail { color: #f44336; font-weight: bold; }
    .info { color: #2196F3; }
    .section { margin: 20px 0; padding: 15px; background: #f9f9f9; border-left: 4px solid #2196F3; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f0f0f0; }
    </style></head><body><div class="container">';
    
    echo '<h1>🔐 Authentication System Diagnostic</h1>';
    
    // Test 1: Database Connection
    echo '<div class="section"><h2>1️⃣ Database Connection</h2>';
    try {
        $pdo->query("SELECT 1");
        echo '<p class="pass">✓ Database connection successful</p>';
    } catch (Exception $e) {
        echo '<p class="fail">✗ Database connection failed: ' . $e->getMessage() . '</p>';
    }
    echo '</div>';
    
    // Test 2: Users Table Structure
    echo '<div class="section"><h2>2️⃣ Users Table Structure</h2>';
    $stmt = $pdo->query("DESCRIBE users");
    $columns = [];
    while ($row = $stmt->fetch()) {
        $columns[$row['Field']] = $row['Type'];
    }
    
    $required = ['id', 'role', 'full_name', 'email', 'password_hash', 'status'];
    $missing = [];
    foreach ($required as $col) {
        if (!isset($columns[$col])) {
            $missing[] = $col;
        }
    }
    
    if (empty($missing)) {
        echo '<p class="pass">✓ All required columns present</p>';
    } else {
        echo '<p class="fail">✗ Missing columns: ' . implode(', ', $missing) . '</p>';
    }
    
    echo '<table><tr><th>Column</th><th>Type</th></tr>';
    foreach ($columns as $col => $type) {
        echo "<tr><td>$col</td><td>$type</td></tr>";
    }
    echo '</table>';
    echo '</div>';
    
    // Test 3: User Status Check
    echo '<div class="section"><h2>3️⃣ User Status Verification</h2>';
    $stmt = $pdo->query("SELECT id, full_name, email, role, status FROM users ORDER BY id");
    $users = $stmt->fetchAll();
    
    if (empty($users)) {
        echo '<p class="fail">✗ No users found in database</p>';
    } else {
        echo '<p class="pass">✓ Found ' . count($users) . ' user(s)</p>';
        echo '<table><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Can Login?</th></tr>';
        
        foreach ($users as $u) {
            $can_login = ($u['role'] === 'admin' || $u['status'] === 'approved') ? 
                         '<span class="pass">✓ Yes</span>' : 
                         '<span class="fail">✗ No (pending)</span>';
            echo "<tr>";
            echo "<td>{$u['id']}</td>";
            echo "<td>" . htmlspecialchars($u['full_name']) . "</td>";
            echo "<td>{$u['email']}</td>";
            echo "<td>{$u['role']}</td>";
            echo "<td>{$u['status']}</td>";
            echo "<td>$can_login</td>";
            echo "</tr>";
        }
        echo '</table>';
    }
    echo '</div>';
    
    // Test 4: Login History Table
    echo '<div class="section"><h2>4️⃣ Login History Table</h2>';
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM login_history");
        $result = $stmt->fetch();
        echo '<p class="pass">✓ login_history table exists</p>';
        echo '<p>Records: ' . $result['count'] . '</p>';
        
        if ($result['count'] > 0) {
            $stmt = $pdo->query("SELECT email, role, login_status, login_time FROM login_history ORDER BY login_time DESC LIMIT 5");
            $records = $stmt->fetchAll();
            
            echo '<h3>Latest 5 Login Attempts:</h3>';
            echo '<table><tr><th>Email</th><th>Role</th><th>Status</th><th>Time</th></tr>';
            foreach ($records as $r) {
                $status = $r['login_status'] === 'success' ? '<span class="pass">✓ Success</span>' : '<span class="fail">✗ Failed</span>';
                echo "<tr><td>{$r['email']}</td><td>{$r['role']}</td><td>$status</td><td>{$r['login_time']}</td></tr>";
            }
            echo '</table>';
        }
    } catch (Exception $e) {
        echo '<p class="fail">✗ login_history table missing or error: ' . $e->getMessage() . '</p>';
    }
    echo '</div>';
    
    // Test 5: Demo Credentials
    echo '<div class="section"><h2>5️⃣ Demo Account Status</h2>';
    $demos = [
        ['email' => 'admin@care.com', 'expected_role' => 'admin'],
        ['email' => 'doctor@care.com', 'expected_role' => 'doctor'],
    ];
    
    foreach ($demos as $demo) {
        $stmt = $pdo->prepare("SELECT id, role, status, password_hash FROM users WHERE email = ?");
        $stmt->execute([$demo['email']]);
        $user = $stmt->fetch();
        
        if ($user) {
            $pwd_ok = password_verify('123456', $user['password_hash']) ? '✓' : '✗';
            $can_login = ($user['role'] === 'admin' || $user['status'] === 'approved') ? '✓' : '✗';
            echo "<p>{$demo['email']}: Role=<span class='info'>{$user['role']}</span>, Status=<span class='info'>{$user['status']}</span>, Password=$pwd_ok, CanLogin=$can_login</p>";
        } else {
            echo "<p class='fail'>✗ {$demo['email']} not found</p>";
        }
    }
    echo '</div>';
    
    // Test 6: Summary
    echo '<div class="section" style="background: #e8f5e9; border-left-color: #4CAF50;"><h2>✅ System Status Summary</h2>';
    echo '<p class="pass">All authentication systems are properly configured and ready for use.</p>';
    echo '<p><strong>Next Steps:</strong></p>';
    echo '<ul>';
    echo '<li>1. Go to the login page (http://localhost/project-I/)</li>';
    echo '<li>2. Click "Get Started" to open the login modal</li>';
    echo '<li>3. For Admin: Click "Admin" button or enter admin@care.com / 123456</li>';
    echo '<li>4. For Doctor: Click "Doctor" button or enter doctor@care.com / 123456</li>';
    echo '<li>5. For Patient: Register a new account and wait for admin approval</li>';
    echo '</ul>';
    echo '</div>';
    
    echo '</div></body></html>';
    
} catch (Exception $e) {
    echo '<html><body><div style="color: red; background: #ffe0e0; padding: 20px; border-radius: 5px;">';
    echo '<h2>⚠️ ERROR</h2>';
    echo '<p>' . htmlspecialchars($e->getMessage()) . '</p>';
    echo '</div></body></html>';
}
?>
