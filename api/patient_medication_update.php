<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$u = require_role('patient');
$pid = $u['id'];

require_method('POST');
$in = read_json();

$doseId = (int)($in['dose_id'] ?? 0);
$status = (string)($in['status'] ?? '');

if ($doseId<=0 || !in_array($status, ['taken','missed','pending'], true)) json_fail('Invalid input');

$stmt = db()->prepare("UPDATE medication_doses md
                       JOIN medications m ON m.id=md.medication_id
                       SET md.dose_status=?
                       WHERE md.id=? AND m.patient_id=?");
$stmt->execute([$status, $doseId, $pid]);

json_ok(true);
