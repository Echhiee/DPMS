<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

require_role('admin');
require_method('POST');

$in = read_json();
$request_id = (int)($in['request_id'] ?? 0);
$action = trim((string)($in['action'] ?? '')); // approve or reject
$reason = trim((string)($in['reason'] ?? ''));

if ($request_id <= 0) json_fail('request_id required');
if (!in_array($action, ['approve', 'reject'])) json_fail('action must be approve or reject');
if ($action === 'reject' && empty($reason)) json_fail('reason required for rejection');

$pdo = db();

// Get the registration request
$stmt = $pdo->prepare("SELECT id, user_id, status FROM registration_requests WHERE id = ?");
$stmt->execute([$request_id]);
$req = $stmt->fetch();

if (!$req) json_fail('Registration request not found', 404);
if ($req['status'] !== 'pending') json_fail('Request already processed');

$admin_id = $_SESSION['user']['id'];

if ($action === 'approve') {
  // Update user status
  $pdo->prepare("UPDATE users SET status = 'approved' WHERE id = ?")
    ->execute([$req['user_id']]);
  
  // Update registration request
  $pdo->prepare("UPDATE registration_requests SET status = 'approved', reviewed_at = NOW(), reviewed_by = ? WHERE id = ?")
    ->execute([$admin_id, $request_id]);
  
  json_ok(['message' => 'Registration approved successfully']);
} else {
  // Update user status
  $pdo->prepare("UPDATE users SET status = 'rejected' WHERE id = ?")
    ->execute([$req['user_id']]);
  
  // Update registration request
  $pdo->prepare("UPDATE registration_requests SET status = 'rejected', rejection_reason = ?, reviewed_at = NOW(), reviewed_by = ? WHERE id = ?")
    ->execute([$reason, $admin_id, $request_id]);
  
  json_ok(['message' => 'Registration rejected']);
}
?>
