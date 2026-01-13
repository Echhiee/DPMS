<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';


$u = require_role('doctor');
$doctor_id = $u['id'];

require_method('POST');
$in = read_json();

$patient_id = (int)($in['patient_id'] ?? 0);
$message_text = trim((string)($in['message_text'] ?? ''));

if ($patient_id <= 0) json_fail('patient_id required');
if (empty($message_text)) json_fail('message_text required');

$pdo = db();

// Verify that the patient exists
$stmt = $pdo->prepare("SELECT id FROM users WHERE id = ? AND role = 'patient'");
$stmt->execute([$patient_id]);
if (!$stmt->fetch()) json_fail('Patient not found', 404);

// Insert message
$stmt = $pdo->prepare("INSERT INTO messages (doctor_id, patient_id, message_text, is_read, created_at)
                       VALUES (?, ?, ?, FALSE, NOW())");
$stmt->execute([$doctor_id, $patient_id, $message_text]);

json_ok(['id' => $pdo->lastInsertId(), 'message' => 'Message sent successfully']);
?>
