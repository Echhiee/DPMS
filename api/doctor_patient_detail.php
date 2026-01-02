<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

require_role('doctor');

$patientId = (int)($_GET['patient_id'] ?? 0);
if ($patientId <= 0) json_fail('patient_id required');

$pdo = db();

$stmt = $pdo->prepare("SELECT u.id, u.full_name name, u.email, u.phone,
                              p.age, p.gender, p.condition_name conditionName, p.risk,
                              p.last_visit lastVisit, p.last_labs lastLabs, p.allergies
                       FROM users u
                       JOIN patient_profiles p ON p.user_id=u.id
                       WHERE u.id=? AND u.role='patient'");
$stmt->execute([$patientId]);
$patient = $stmt->fetch();
if (!$patient) json_fail('Patient not found', 404);

$stmt = $pdo->prepare("SELECT id, name, dosage, frequency, status, start_date startDate, end_date endDate, instructions
                       FROM medications WHERE patient_id=? ORDER BY created_at DESC LIMIT 50");
$stmt->execute([$patientId]);
$meds = $stmt->fetchAll();

$stmt = $pdo->prepare("SELECT symptom_name symptom, severity, occurred_at occurredAt, notes
                       FROM symptom_logs WHERE patient_id=? ORDER BY occurred_at DESC LIMIT 20");
$stmt->execute([$patientId]);
$symptoms = $stmt->fetchAll();

json_ok(['patient'=>$patient,'medications'=>$meds,'recentSymptoms'=>$symptoms]);
