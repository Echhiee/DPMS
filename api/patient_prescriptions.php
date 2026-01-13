<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$u = require_role('patient');
$pid = $u['id'];

$stmt = db()->prepare("
  SELECT pr.id, pr.medication_name name, pr.dosage, pr.frequency, pr.start_date startDate, pr.end_date endDate, 'active' status,
         d.full_name doctorName
  FROM prescriptions pr
  LEFT JOIN users d ON d.id = pr.doctor_id
  WHERE pr.patient_id=?
  ORDER BY pr.created_at DESC
");
$stmt->execute([$pid]);

json_ok($stmt->fetchAll());
