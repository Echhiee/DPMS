<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

require_role('admin');

$pdo = db();

// Get all patients
$stmt = $pdo->prepare("
  SELECT 
    u.id,
    u.full_name name,
    u.email,
    u.status,
    u.created_at createdAt,
    pp.blood_type bloodType,
    pp.gender,
    pp.allergies
  FROM users u
  LEFT JOIN patient_profiles pp ON pp.user_id = u.id
  WHERE u.role = 'patient'
  ORDER BY u.created_at DESC
");
$stmt->execute();
json_ok($stmt->fetchAll());
?>
