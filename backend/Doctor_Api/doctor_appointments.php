<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$u = require_role('doctor');
$doctorId = $u['id'];

$status = trim((string)($_GET['status'] ?? 'all'));

$sql = "SELECT a.id, a.appt_date apptDate, a.appt_time apptTime, a.appt_type apptType,
               a.reason, a.notes, a.status,
               p.id patientId, p.full_name patientName
        FROM appointments a
        JOIN users p ON p.id=a.patient_id
        WHERE a.doctor_id=?";
$params = [$doctorId];

if ($status !== '' && $status !== 'all') { $sql .= " AND a.status=?"; $params[] = $status; }

$sql .= " ORDER BY a.appt_date DESC, a.appt_time DESC LIMIT 200";

$stmt = db()->prepare($sql);
$stmt->execute($params);
json_ok($stmt->fetchAll());
