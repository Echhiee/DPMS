<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

require_role('admin');
require_method('POST');

$in = read_json();
$patient_id = (int)($in['patient_id'] ?? 0);
$action = trim((string)($in['action'] ?? '')); // delete or approve/reject

if ($patient_id <= 0) json_fail('patient_id required');
if (!in_array($action, ['delete', 'approve', 'reject'])) json_fail('Invalid action');

$pdo = db();

// Verify patient exists
$stmt = $pdo->prepare("SELECT id, role FROM users WHERE id = ? AND role = 'patient'");
$stmt->execute([$patient_id]);
if (!$stmt->fetch()) json_fail('Patient not found', 404);

if ($action === 'delete') {
  // Delete patient profile
  $pdo->prepare("DELETE FROM patient_profiles WHERE user_id = ?")->execute([$patient_id]);
  
  // Delete user
  $pdo->prepare("DELETE FROM users WHERE id = ?")->execute([$patient_id]);
  
  json_ok(['message' => 'Patient deleted successfully']);
} else {
  // Update user status
  $status = $action === 'approve' ? 'approved' : 'rejected';
  $pdo->prepare("UPDATE users SET status = ? WHERE id = ?")
    ->execute([$status, $patient_id]);
  
  json_ok(['message' => "Patient {$status} successfully"]);
}
?>
