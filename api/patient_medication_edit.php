<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$u = require_role('patient');
$pid = $u['id'];

require_method('POST');
$in = read_json();

$medId = (int)($in['medication_id'] ?? 0);
$name = trim((string)($in['name'] ?? ''));
$dosage = trim((string)($in['dosage'] ?? ''));
$frequency = trim((string)($in['frequency'] ?? ''));
$startDate = trim((string)($in['start_date'] ?? ''));
$endDate = trim((string)($in['end_date'] ?? ''));
$instructions = trim((string)($in['instructions'] ?? ''));

if ($medId <= 0 || !$name || !$dosage || !$frequency) {
    json_fail('Missing required fields');
}

// Verify the medication belongs to this patient
$stmt = db()->prepare("SELECT id FROM medications WHERE id=? AND patient_id=?");
$stmt->execute([$medId, $pid]);
if (!$stmt->fetch()) json_fail('Medication not found or access denied');

// Update the medication
$stmt = db()->prepare("UPDATE medications 
                       SET name=?, dosage=?, frequency=?, start_date=?, end_date=?, instructions=?
                       WHERE id=? AND patient_id=?");
$stmt->execute([$name, $dosage, $frequency, $startDate ?: null, $endDate ?: null, $instructions, $medId, $pid]);

json_ok(['message' => 'Medication updated successfully']);
