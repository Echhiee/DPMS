<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$u = require_role('doctor');
$doctorId = $u['id'];

$q = trim((string)($_GET['q'] ?? ''));
$status = trim((string)($_GET['status'] ?? 'all'));

$sql = "SELECT pr.id, pr.medication_name medication, pr.dosage, pr.frequency, pr.start_date startDate, pr.end_date endDate,
               pr.notes instructions, 'active' status,
               p.id patientId, p.full_name patientName
        FROM prescriptions pr
        JOIN users p ON p.id=pr.patient_id
        WHERE pr.doctor_id=?";
$params = [$doctorId];

if ($q !== '') { $sql .= " AND (pr.medication_name LIKE ? OR p.full_name LIKE ?)"; $params[]="%$q%"; $params[]="%$q%"; }

$sql .= " ORDER BY pr.created_at DESC LIMIT 200";

$stmt = db()->prepare($sql);
$stmt->execute($params);
json_ok($stmt->fetchAll());
