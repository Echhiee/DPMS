<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

require_method('POST');
start_session();

$in = read_json();
$email = strtolower(trim((string)($in['email'] ?? '')));
$password = (string)($in['password'] ?? '');

if ($email === '' || $password === '') json_fail('Email and password required');

$stmt = db()->prepare("SELECT id, role, full_name, email, password_hash FROM users WHERE email=?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
  json_fail('Invalid credentials', 401);
}

$_SESSION['user'] = [
  'id' => (int)$user['id'],
  'role' => $user['role'],
  'name' => $user['full_name'],
  'email' => $user['email'],
];

json_ok($_SESSION['user']);
