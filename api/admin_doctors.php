<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

require_role('admin');

$pdo = db();

// Get all doctors
$stmt = $pdo->prepare("
  SELECT 
    u.id,
    u.full_name name,
    u.email,
    u.status,
    u.created_at createdAt,
    dp.speciality,
    dp.clinic,
    dp.experience_years experienceYears
  FROM users u
  LEFT JOIN doctor_profiles dp ON dp.user_id = u.id
  WHERE u.role = 'doctor'
  ORDER BY u.created_at DESC
");
$stmt->execute();
json_ok($stmt->fetchAll());
?>
