<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$u = require_role('doctor');
$doctorId = $u['id'];

require_method('POST');
$in = read_json();

$id = (int)($in['id'] ?? 0);
$status = (string)($in['status'] ?? '');

if ($id<=0 || !in_array($status, ['scheduled','completed','cancelled'], true)) json_fail('Invalid input');

$stmt = db()->prepare("UPDATE appointments SET status=? WHERE id=? AND doctor_id=?");
$stmt->execute([$status, $id, $doctorId]);

json_ok(true);
