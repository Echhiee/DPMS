<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$u = require_role('patient');
$pid = $u['id'];

$stmt = db()->prepare("
  SELECT m.id, m.name, m.dosage, m.frequency, m.start_date startDate, m.end_date endDate, m.status,
         d.full_name doctorName
  FROM medications m
  LEFT JOIN users d ON d.id = m.doctor_id
  WHERE m.patient_id=?
  ORDER BY m.created_at DESC
");
$stmt->execute([$pid]);

json_ok($stmt->fetchAll());
