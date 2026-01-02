<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

require_role('doctor');

$q = trim((string)($_GET['q'] ?? ''));
$risk = trim((string)($_GET['risk'] ?? 'all'));

$sql = "SELECT u.id, u.full_name name, p.age, p.gender, p.condition_name conditionName,
               p.risk, p.last_visit lastVisit, p.last_labs lastLabs
        FROM users u
        JOIN patient_profiles p ON p.user_id=u.id
        WHERE u.role='patient'";

$params = [];
if ($risk !== '' && $risk !== 'all') { $sql .= " AND p.risk=?"; $params[] = $risk; }
if ($q !== '') { $sql .= " AND (u.full_name LIKE ? OR p.condition_name LIKE ?)"; $params[]="%$q%"; $params[]="%$q%"; }

$sql .= " ORDER BY u.full_name ASC LIMIT 200";

$stmt = db()->prepare($sql);
$stmt->execute($params);
json_ok($stmt->fetchAll());
