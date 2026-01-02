<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$u = require_role('doctor');
$doctorId = $u['id'];

$q = trim((string)($_GET['q'] ?? ''));
$status = trim((string)($_GET['status'] ?? 'all'));

$sql = "SELECT m.id, m.name medication, m.dosage, m.frequency, m.start_date startDate, m.end_date endDate,
               m.instructions, m.status,
               p.id patientId, p.full_name patientName
        FROM medications m
        JOIN users p ON p.id=m.patient_id
        WHERE m.doctor_id=?";
$params = [$doctorId];

if ($status !== '' && $status !== 'all') { $sql .= " AND m.status=?"; $params[] = $status; }
if ($q !== '') { $sql .= " AND (m.name LIKE ? OR p.full_name LIKE ?)"; $params[]="%$q%"; $params[]="%$q%"; }

$sql .= " ORDER BY m.created_at DESC LIMIT 200";

$stmt = db()->prepare($sql);
$stmt->execute($params);
json_ok($stmt->fetchAll());
