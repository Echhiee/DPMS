<?php
// Quick test of prescription creation API
session_start();
$_SESSION['user'] = [
    'id' => 1,
    'role' => 'doctor',
    'name' => 'Test Doctor',
    'email' => 'doctor@test.com'
];

echo '<h2>Testing Prescription Creation API</h2>';

// Test 1: Direct POST call
echo '<h3>Test: Create prescription (doctor_prescription_create.php)</h3>';

$url = 'http://localhost/project-I/api/doctor_prescription_create.php';
$data = [
    'patient_id' => 1,
    'name' => 'Amoxicillin 500mg',
    'dosage' => '500mg',
    'frequency' => 'Twice daily',
    'start_date' => date('Y-m-d'),
    'end_date' => date('Y-m-d', strtotime('+7 days')),
    'instructions' => 'Take with food, complete the course'
];

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_POST => 1,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode($data),
    CURLOPT_RETURNTRANSFER => 1,
    CURLOPT_COOKIE => 'PHPSESSID=' . session_id(),
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo '<p><strong>Status:</strong> ' . $http_code . '</p>';
echo '<p><strong>Response:</strong></p>';
echo '<pre>' . htmlspecialchars($response) . '</pre>';

// Check if database tables exist
echo '<h3>Database Check</h3>';
try {
    require_once __DIR__ . '/api/db.php';
    $pdo = db();
    
    // Check if medications table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'medications'");
    if ($stmt->fetch()) {
        echo '<p style="color:green">✓ medications table exists</p>';
        
        // Count records
        $count = $pdo->query("SELECT COUNT(*) c FROM medications")->fetch()['c'];
        echo '<p>Total prescriptions: ' . $count . '</p>';
    } else {
        echo '<p style="color:red">✗ medications table NOT FOUND</p>';
    }
} catch (Exception $e) {
    echo '<p style="color:red">Error: ' . htmlspecialchars($e->getMessage()) . '</p>';
}
?>
