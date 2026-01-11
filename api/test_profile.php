<?php
// Simple test script for doctor profile API
session_start([
    'cookie_httponly' => true,
    'cookie_samesite' => 'Lax',
]);

// For testing, manually set the session
$_SESSION['user'] = [
    'id' => 1,
    'role' => 'doctor',
    'name' => 'Dr. Demo Doctor',
    'email' => 'doctor@care.com',
];

require_once __DIR__ . "/helpers.php";
require_once __DIR__ . "/db.php";

// Test 1: Get profile
echo "=== TEST 1: Get Profile ===\n";
$pdo = db();
$sql = "
SELECT 
  u.id,
  u.full_name AS name,
  u.email,
  d.speciality,
  d.reg_no AS regNo,
  d.clinic,
  d.experience_years AS experienceYears,
  d.languages,
  d.visiting_hours AS visitingHours,
  d.about
FROM users u
LEFT JOIN doctor_profiles d ON d.user_id = u.id
WHERE u.id = ?
LIMIT 1
";
$stmt = $pdo->prepare($sql);
$stmt->execute([1]);
$row = $stmt->fetch();
echo json_encode($row, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n\n";

// Test 2: Update profile
echo "=== TEST 2: Update Profile ===\n";
$data = [
    'speciality' => 'Cardiology',
    'reg_no' => 'REG-2024-001',
    'clinic' => 'Heart Care Center',
    'experience_years' => 10,
    'languages' => 'Nepali, English, Hindi',
    'visiting_hours' => '9 AM - 5 PM',
    'about' => 'Experienced cardiologist with 10 years of practice',
];

$pdo->beginTransaction();
$pdo->prepare("
INSERT INTO doctor_profiles
(user_id, speciality, reg_no, clinic, experience_years, languages, visiting_hours, about)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
ON DUPLICATE KEY UPDATE
speciality=VALUES(speciality),
reg_no=VALUES(reg_no),
clinic=VALUES(clinic),
experience_years=VALUES(experience_years),
languages=VALUES(languages),
visiting_hours=VALUES(visiting_hours),
about=VALUES(about)
")->execute([1, $data['speciality'], $data['reg_no'], $data['clinic'], $data['experience_years'], $data['languages'], $data['visiting_hours'], $data['about']]);
$pdo->commit();
echo "Profile updated successfully!\n\n";

// Test 3: Get updated profile
echo "=== TEST 3: Get Updated Profile ===\n";
$stmt = $pdo->prepare($sql);
$stmt->execute([1]);
$row = $stmt->fetch();
echo json_encode($row, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n";
?>
