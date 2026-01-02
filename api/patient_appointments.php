<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$u = require_role('patient');
$pid = $u['id'];

$stmt = db()->prepare("SELECT a.id, a.appt_date apptDate, a.appt_time apptTime, a.appt_type apptType,
                              a.reason, a.status,
                              d.full_name doctorName, dp.speciality
                       FROM appointments a
                       JOIN users d ON d.id=a.doctor_id
                       JOIN doctor_profiles dp ON dp.user_id=d.id
                       WHERE a.patient_id=?
                       ORDER BY a.appt_date DESC, a.appt_time DESC LIMIT 200");
$stmt->execute([$pid]);
json_ok($stmt->fetchAll());
