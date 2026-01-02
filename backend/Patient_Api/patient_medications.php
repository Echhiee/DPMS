<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$u = require_role('patient');
$pid = $u['id'];
$pdo = db();
$today = date('Y-m-d');

$stmt = $pdo->prepare("SELECT m.id, m.name, m.dosage, m.frequency, m.status,
                              m.start_date startDate, m.end_date endDate
                       FROM medications m
                       WHERE m.patient_id=?
                       ORDER BY m.created_at DESC LIMIT 200");
$stmt->execute([$pid]);
$all = $stmt->fetchAll();

$stmt = $pdo->prepare("SELECT md.id doseId, md.medication_id medicationId, md.dose_date doseDate, md.dose_time doseTime,
                              md.dose_status doseStatus,
                              m.name, m.dosage, m.frequency
                       FROM medication_doses md
                       JOIN medications m ON m.id=md.medication_id
                       WHERE m.patient_id=? AND md.dose_date=?
                       ORDER BY md.dose_time ASC");
$stmt->execute([$pid, $today]);
$todaySchedule = $stmt->fetchAll();

json_ok([
  'today' => $today,
  'todaySchedule' => $todaySchedule,
  'allMedications' => $all
]);
