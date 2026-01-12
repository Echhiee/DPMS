<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

require_role('admin');

$pdo = db();

// Get dashboard statistics
$stats = [];

// Total users
$stmt = $pdo->prepare("SELECT 
  (SELECT COUNT(*) FROM users WHERE role = 'patient') as patients,
  (SELECT COUNT(*) FROM users WHERE role = 'doctor') as doctors,
  (SELECT COUNT(*) FROM users WHERE role = 'admin') as admins,
  (SELECT COUNT(*) FROM registration_requests WHERE status = 'pending') as pendingRequests,
  (SELECT COUNT(*) FROM registration_requests WHERE status = 'approved') as approvedRequests,
  (SELECT COUNT(*) FROM users WHERE status = 'pending') as pendingUsers
");
$stmt->execute();
$stats = $stmt->fetch();

json_ok($stats);
?>
