<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$u = require_role('patient');
$pid = $u['id'];

$stmt = db()->prepare("SELECT id, symptom_name symptom, severity, occurred_at occurredAt, notes
                       FROM symptom_logs WHERE patient_id=?
                       ORDER BY occurred_at DESC LIMIT 50");
$stmt->execute([$pid]);
json_ok($stmt->fetchAll());
