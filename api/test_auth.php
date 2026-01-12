<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';

try {
    $pdo = db();
    
    // Test 1: Check if users table has status column
    $stmt = $pdo->query("DESCRIBE users");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);
    
    $tests = [
        'status' => in_array('status', $columns) ? '✓ PASS' : '✗ FAIL',
    ];
    
    // Test 2: Check for existing users
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    $tests['Users exist'] = $result['count'] > 0 ? "✓ PASS ({$result['count']} users)" : '✗ FAIL (0 users)';
    
    // Test 3: Check user status values
    $stmt = $pdo->query("SELECT role, status, COUNT(*) as count FROM users GROUP BY role, status");
    $results = $stmt->fetchAll();
    
    $status_info = [];
    foreach ($results as $row) {
        $status_info[] = "{$row['role']}: {$row['status']} ({$row['count']})";
    }
    $tests['User status breakdown'] = implode(', ', $status_info);
    
    // Test 4: Check login_history table
    $stmt = $pdo->query("SHOW TABLES LIKE 'login_history'");
    $exists = $stmt->fetch() ? true : false;
    $tests['login_history table'] = $exists ? '✓ EXISTS' : '✗ MISSING';
    
    if ($exists) {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM login_history");
        $result = $stmt->fetch();
        $tests['login_history records'] = $result['count'] . ' records';
    }
    
    echo '<pre style="background: #f5f5f5; padding: 20px; border-radius: 5px; font-family: monospace;">';
    echo "DATABASE DIAGNOSTIC TEST\n";
    echo "========================\n\n";
    
    foreach ($tests as $key => $value) {
        echo str_pad($key, 30) . ": " . $value . "\n";
    }
    
    echo "\n\nCOLUMN LIST (users table):\n";
    echo "----------------------------\n";
    foreach ($columns as $col) {
        echo "- $col\n";
    }
    
    echo '</pre>';
    
} catch (Exception $e) {
    echo '<pre style="color: red; background: #ffe0e0; padding: 20px; border-radius: 5px;">';
    echo "ERROR: " . $e->getMessage();
    echo '</pre>';
}
?>
