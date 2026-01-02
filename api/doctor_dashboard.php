<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$u = require_role('doctor');
$doctorId = $u['id'];
$pdo = db();

$totalPatients = (int)$pdo->query("SELECT COUNT(*) c FROM users WHERE role='patient'")->fetch()['c'];

$today = date('Y-m-d');
$stmt = $pdo->prepare("SELECT COUNT(*) c FROM appointments WHERE doctor_id=? AND appt_date=?");
$stmt->execute([$doctorId, $today]);
$todayAppts = (int)$stmt->fetch()['c'];

$critical = (int)$pdo->query("SELECT COUNT(*) c FROM patient_profiles WHERE risk='high'")->fetch()['c'];

$stmt = $pdo->prepare("SELECT COUNT(*) c FROM medications WHERE doctor_id=?");
$stmt->execute([$doctorId]);
$prescriptions = (int)$stmt->fetch()['c'];

json_ok([
  'stats' => [
    'totalPatients' => $totalPatients,
    'todayAppointments' => $todayAppts,
    'criticalPatients' => $critical,
    'prescriptions' => $prescriptions
  ]
]);
