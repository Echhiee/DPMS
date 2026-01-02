<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$u = require_role('patient');
$pid = $u['id'];

require_method('POST');
$in = read_json();

$doctorId = (int)($in['doctor_id'] ?? 0);
$date = (string)($in['date'] ?? '');
$time = (string)($in['time'] ?? '');
$type = trim((string)($in['type'] ?? 'Consultation'));
$reason = trim((string)($in['reason'] ?? ''));

if ($doctorId<=0 || $date==='' || $time==='') json_fail('doctor_id, date, time required');

$stmt = db()->prepare("INSERT INTO appointments (patient_id, doctor_id, appt_date, appt_time, appt_type, reason, status)
                       VALUES (?,?,?,?,?,?, 'scheduled')");
$stmt->execute([$pid, $doctorId, $date, $time, $type, $reason]);

json_ok(['id' => (int)db()->lastInsertId()]);
