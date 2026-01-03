<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$u = require_role('patient');
$pid = $u['id'];

require_method('POST');
$in = read_json();

$medId = (int)($in['medication_id'] ?? 0);
$doseDate = trim((string)($in['dose_date'] ?? ''));
$doseStatus = trim((string)($in['dose_status'] ?? 'pending'));

if ($medId <= 0 || !$doseDate) json_fail('Invalid input');
if (!in_array($doseStatus, ['taken','missed','pending'], true)) json_fail('Invalid status');

// Verify the medication belongs to this patient
$stmt = db()->prepare("SELECT id FROM medications WHERE id=? AND patient_id=?");
$stmt->execute([$medId, $pid]);
if (!$stmt->fetch()) json_fail('Medication not found or access denied');

// Check if a dose already exists for this date
$stmt = db()->prepare("SELECT id FROM medication_doses WHERE medication_id=? AND dose_date=?");
$stmt->execute([$medId, $doseDate]);
$existing = $stmt->fetch();

if ($existing) {
    // Update existing dose
    db()->prepare("UPDATE medication_doses SET dose_status=? WHERE id=?")->execute([$doseStatus, $existing['id']]);
} else {
    // Create new dose
    db()->prepare("INSERT INTO medication_doses(medication_id, dose_date, dose_status, dose_time) VALUES(?,?,?,?)")
      ->execute([$medId, $doseDate, $doseStatus, '00:00:00']);
}

json_ok(['message' => 'Dose status updated']);
