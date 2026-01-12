<?php
declare(strict_types=1);

// Add error handling for debugging
set_error_handler(function($errno, $errstr, $errfile, $errline) {
  http_response_code(500);
  echo json_encode([
    'ok' => false,
    'error' => "PHP Error: $errstr (in $errfile:$errline)"
  ]);
  exit;
});

try {
  require_once __DIR__ . '/db.php';
  require_once __DIR__ . '/helpers.php';
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    'ok' => false,
    'error' => 'Failed to load dependencies: ' . $e->getMessage()
  ]);
  exit;
}

require_method('POST');
start_session();

$in = read_json();
$email = strtolower(trim((string)($in['email'] ?? '')));
$password = (string)($in['password'] ?? '');

if ($email === '' || $password === '') json_fail('Email and password required');

$pdo = db();
$stmt = $pdo->prepare("SELECT id, role, full_name, email, password_hash, status FROM users WHERE email=?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
  // Log failed login attempt (if table exists)
  try {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    $pdo->prepare("INSERT INTO login_history(user_id, email, role, ip_address, user_agent, login_status, failure_reason) VALUES(?,?,?,?,?,?,?)")
      ->execute([0, $email, 'unknown', $ip, $ua, 'failed', 'Invalid credentials']);
  } catch (Exception $e) {
    // Login history table might not exist yet, continue anyway
  }
  
  json_fail('Invalid credentials', 401);
}

// Check if user is approved (except for admins)
if ($user['role'] !== 'admin' && $user['status'] !== 'approved') {
  // Log rejection attempt (if table exists)
  try {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    $pdo->prepare("INSERT INTO login_history(user_id, email, role, ip_address, user_agent, login_status, failure_reason) VALUES(?,?,?,?,?,?,?)")
      ->execute([(int)$user['id'], $email, $user['role'], $ip, $ua, 'failed', 'Account pending approval']);
  } catch (Exception $e) {
    // Login history table might not exist yet, continue anyway
  }
  
  json_fail('Your account is pending admin approval. Please wait.', 403);
}

// Log successful login (if table exists)
try {
  $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
  $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
  $pdo->prepare("INSERT INTO login_history(user_id, email, role, ip_address, user_agent, login_status) VALUES(?,?,?,?,?,?)")
    ->execute([(int)$user['id'], $email, $user['role'], $ip, $ua, 'success']);
} catch (Exception $e) {
  // Login history table might not exist yet, continue anyway
}

$_SESSION['user'] = [
  'id' => (int)$user['id'],
  'role' => $user['role'],
  'name' => $user['full_name'],
  'email' => $user['email'],
  'status' => $user['status'],
];

json_ok($_SESSION['user']);