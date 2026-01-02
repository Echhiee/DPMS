<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$u = require_role('patient');
$pid = $u['id'];
$pdo = db();

$stmt = $pdo->prepare("SELECT a.appt_date apptDate, a.appt_time apptTime, a.appt_type apptType,
                              d.full_name doctorName
                       FROM appointments a
                       JOIN users d ON d.id=a.doctor_id
                       WHERE a.patient_id=? AND a.status='scheduled'
                       ORDER BY a.appt_date ASC, a.appt_time ASC LIMIT 1");
$stmt->execute([$pid]);
$nextAppt = $stmt->fetch();

$stmt = $pdo->prepare("SELECT COUNT(*) c FROM symptom_logs WHERE patient_id=? AND occurred_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
$stmt->execute([$pid]);
$symptomsWeek = (int)$stmt->fetch()['c'];

$today = date('Y-m-d');
$stmt = $pdo->prepare("SELECT COUNT(*) c
                       FROM medication_doses md
                       JOIN medications m ON m.id=md.medication_id
                       WHERE m.patient_id=? AND md.dose_date=? AND md.dose_status='pending'");
$stmt->execute([$pid, $today]);
$dueToday = (int)$stmt->fetch()['c'];

json_ok([
  'welcomeName' => $u['name'],
  'nextAppointment' => $nextAppt,
  'symptomsThisWeek' => $symptomsWeek,
  'medicationsDueToday' => $dueToday
]);
