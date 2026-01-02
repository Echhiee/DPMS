<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$u = require_role('patient');
$pid = $u['id'];

require_method('POST');
$in = read_json();

$symptom = trim((string)($in['symptom'] ?? ''));
$severity = (int)($in['severity'] ?? 0);
$occurredAt = (string)($in['occurred_at'] ?? '');
$notes = (string)($in['notes'] ?? null);

if ($symptom==='' || $severity<1 || $severity>10 || $occurredAt==='') {
  json_fail('symptom, severity(1-10), occurred_at required');
}

$stmt = db()->prepare("INSERT INTO symptom_logs (patient_id, symptom_name, severity, occurred_at, notes)
                       VALUES (?,?,?,?,?)");
$stmt->execute([$pid, $symptom, $severity, $occurredAt, $notes]);

json_ok(['id' => (int)db()->lastInsertId()]);
