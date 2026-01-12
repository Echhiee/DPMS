<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$u = require_role('patient');
$patient_id = $u['id'];

$pdo = db();

// Get all messages from doctors to this patient, ordered by newest first
$stmt = $pdo->prepare("SELECT m.id, m.message_text messageText, m.is_read isRead, m.created_at createdAt,
                              u.full_name doctorName, d.speciality speciality
                       FROM messages m
                       JOIN users u ON u.id = m.doctor_id
                       LEFT JOIN doctor_profiles d ON d.user_id = m.doctor_id
                       WHERE m.patient_id = ?
                       ORDER BY m.created_at DESC");
$stmt->execute([$patient_id]);
json_ok($stmt->fetchAll());
?>
