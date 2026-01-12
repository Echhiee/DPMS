<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

require_role('admin');

$pdo = db();

// Get filter parameters
$email_filter = trim((string)($_GET['email'] ?? ''));
$role_filter = trim((string)($_GET['role'] ?? ''));
$status_filter = trim((string)($_GET['status'] ?? ''));
$limit = (int)($_GET['limit'] ?? 100);
$offset = (int)($_GET['offset'] ?? 0);

// Build query
$sql = "SELECT 
  lh.id,
  lh.user_id userId,
  lh.email,
  lh.role,
  lh.login_time loginTime,
  lh.ip_address ipAddress,
  lh.user_agent userAgent,
  lh.login_status loginStatus,
  lh.failure_reason failureReason,
  u.full_name userName
FROM login_history lh
LEFT JOIN users u ON u.id = lh.user_id AND lh.user_id > 0
WHERE 1=1";

$params = [];

if ($email_filter !== '') {
  $sql .= " AND lh.email LIKE ?";
  $params[] = "%$email_filter%";
}

if ($role_filter !== '' && $role_filter !== 'all') {
  $sql .= " AND lh.role = ?";
  $params[] = $role_filter;
}

if ($status_filter !== '' && $status_filter !== 'all') {
  $sql .= " AND lh.login_status = ?";
  $params[] = $status_filter;
}

$sql .= " ORDER BY lh.login_time DESC LIMIT ? OFFSET ?";
$params[] = $limit;
$params[] = $offset;

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$records = $stmt->fetchAll();

// Get total count
$count_sql = "SELECT COUNT(*) as total FROM login_history lh WHERE 1=1";
$count_params = [];

if ($email_filter !== '') {
  $count_sql .= " AND lh.email LIKE ?";
  $count_params[] = "%$email_filter%";
}

if ($role_filter !== '' && $role_filter !== 'all') {
  $count_sql .= " AND lh.role = ?";
  $count_params[] = $role_filter;
}

if ($status_filter !== '' && $status_filter !== 'all') {
  $count_sql .= " AND lh.login_status = ?";
  $count_params[] = $status_filter;
}

$stmt = $pdo->prepare($count_sql);
$stmt->execute($count_params);
$count = $stmt->fetch()['total'] ?? 0;

json_ok([
  'records' => $records,
  'total' => $count,
  'limit' => $limit,
  'offset' => $offset
]);
?>
