<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

require_role('admin');
require_method('GET');

try {
  $pdo = db();

  $stmt = $pdo->prepare("
    SELECT 
      rr.id,
      rr.user_id userId,
      rr.request_type requestType,
      rr.status,
      rr.requested_at requestedAt,
      u.full_name name,
      u.email,
      CASE 
        WHEN rr.request_type = 'doctor' THEN dp.speciality
        WHEN rr.request_type = 'patient' THEN pp.blood_type
        ELSE NULL
      END AS detail
    FROM registration_requests rr
    JOIN users u ON u.id = rr.user_id
    LEFT JOIN doctor_profiles dp ON dp.user_id = u.id
    LEFT JOIN patient_profiles pp ON pp.user_id = u.id
    WHERE rr.status = 'pending'
    ORDER BY rr.requested_at DESC
  ");

  $stmt->execute();
  json_ok($stmt->fetchAll());
} catch (Throwable $e) {
  json_fail("admin_registration_requests.php error: " . $e->getMessage(), 500);
}
