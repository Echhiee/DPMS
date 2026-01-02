<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

require_role('patient');

$q = trim((string)($_GET['q'] ?? ''));
$spec = trim((string)($_GET['speciality'] ?? 'all'));

$sql = "SELECT u.id, u.full_name name, d.speciality, d.clinic, d.experience_years experienceYears
        FROM users u
        JOIN doctor_profiles d ON d.user_id=u.id
        WHERE u.role='doctor'";
$params = [];

if ($spec !== '' && $spec !== 'all') { $sql .= " AND d.speciality=?"; $params[] = $spec; }
if ($q !== '') { $sql .= " AND (u.full_name LIKE ? OR d.speciality LIKE ?)"; $params[]="%$q%"; $params[]="%$q%"; }

$sql .= " ORDER BY u.full_name ASC LIMIT 100";

$stmt = db()->prepare($sql);
$stmt->execute($params);
json_ok($stmt->fetchAll());
