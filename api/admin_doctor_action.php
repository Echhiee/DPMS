<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

require_role('admin');
require_method('POST');

$in = read_json();
$doctor_id = (int)($in['doctor_id'] ?? 0);
$action = trim((string)($in['action'] ?? ''));

if ($doctor_id <= 0) json_fail('doctor_id required', 400);
if (!in_array($action, ['approve', 'reject', 'delete'], true)) json_fail('Invalid action', 400);

$pdo = db();

// Verify doctor exists
$stmt = $pdo->prepare("SELECT id FROM users WHERE id = ? AND role = 'doctor'");
$stmt->execute([$doctor_id]);
if (!$stmt->fetch()) json_fail('Doctor not found', 404);

if ($action === 'delete') {
  $pdo->prepare("DELETE FROM doctor_profiles WHERE user_id = ?")->execute([$doctor_id]);
  $pdo->prepare("DELETE FROM users WHERE id = ?")->execute([$doctor_id]);
  json_ok(['message' => 'Doctor deleted']);
  exit;
}

$status = ($action === 'approve') ? 'approved' : 'rejected';
$pdo->prepare("UPDATE users SET status = ? WHERE id = ?")->execute([$status, $doctor_id]);
json_ok(['message' => "Doctor {$status}"]);
