<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$u = require_role('doctor');
$doctorId = $u['id'];

require_method('POST');
$in = read_json();

$id = (int)($in['id'] ?? 0);
if ($id <= 0) json_fail('Invalid prescription id');

$stmt = db()->prepare("DELETE FROM prescriptions WHERE id=? AND doctor_id=?");
$stmt->execute([$id, $doctorId]);

json_ok(true);
