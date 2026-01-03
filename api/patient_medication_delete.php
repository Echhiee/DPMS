<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$u = require_role('patient');
$pid = $u['id'];

require_method('POST');
$in = read_json();

$medId = (int)($in['medication_id'] ?? 0);

if ($medId <= 0) json_fail('Invalid medication ID');

// Verify the medication belongs to this patient
$stmt = db()->prepare("SELECT id FROM medications WHERE id=? AND patient_id=?");
$stmt->execute([$medId, $pid]);
if (!$stmt->fetch()) json_fail('Medication not found or access denied');

// Delete associated doses first
db()->prepare("DELETE FROM medication_doses WHERE medication_id=?")->execute([$medId]);

// Delete the medication
db()->prepare("DELETE FROM medications WHERE id=?")->execute([$medId]);

json_ok(['message' => 'Medication deleted successfully']);
