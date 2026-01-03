<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

require_method('POST');
$in = read_json();

$name = trim((string)($in['name'] ?? ''));
$email = strtolower(trim((string)($in['email'] ?? '')));
$password = (string)($in['password'] ?? '');
$role = trim((string)($in['role'] ?? 'patient')); // patient | doctor

if ($name === '' || $email === '' || $password === '') json_fail('Name, email, password required');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_fail('Invalid email');
if (strlen($password) < 6) json_fail('Password must be at least 6 characters');
if (!in_array($role, ['patient', 'doctor'])) json_fail('Invalid role');

$pdo = db();

$check = $pdo->prepare("SELECT id FROM users WHERE email=? LIMIT 1");
$check->execute([$email]);
if ($check->fetch()) json_fail('Email already registered', 409);

$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("INSERT INTO users(role, full_name, email, password_hash) VALUES(?,?,?,?)");
$stmt->execute([$role, $name, $email, $hash]);
$uid = (int)$pdo->lastInsertId();

// Create role-specific profile
if ($role === 'patient') {
  $pdo->prepare("INSERT INTO patient_profiles(user_id) VALUES(?)")->execute([$uid]);
} else {
  $pdo->prepare("INSERT INTO doctor_profiles(user_id) VALUES(?)")->execute([$uid]);
}

start_session();
$_SESSION['user'] = [
  'id' => $uid,
  'role' => $role,
  'name' => $name,
  'email' => $email
];

json_ok($_SESSION['user']);
