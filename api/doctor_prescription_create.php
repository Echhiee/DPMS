<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$u = require_role('doctor');
$doctorId = $u['id'];

require_method('POST');
$in = read_json();

$patientId = (int)($in['patient_id'] ?? 0);
$name = trim((string)($in['name'] ?? ''));
$dosage = trim((string)($in['dosage'] ?? ''));
$frequency = trim((string)($in['frequency'] ?? ''));
$startDate = (string)($in['start_date'] ?? null);
$endDate = (string)($in['end_date'] ?? null);
$instructions = (string)($in['instructions'] ?? null);

if ($patientId<=0 || $name==='') json_fail('patient_id and name required');

$stmt = db()->prepare("INSERT INTO prescriptions (patient_id, doctor_id, medication_name, dosage, frequency, start_date, end_date, notes)
                       VALUES (?,?,?,?,?,?,?,?)");
$stmt->execute([$patientId, $doctorId, $name, $dosage, $frequency, $startDate, $endDate, $instructions]);

json_ok(['id' => (int)db()->lastInsertId()]);
