<?php
require_once __DIR__ . "/helpers.php";
require_once __DIR__ . "/db.php";

require_login();              // must be logged in
require_role("doctor");       // must be doctor

$user_id = $_SESSION["user"]["id"];

$sql = "
SELECT 
  u.id,
  u.full_name AS name,
  u.email,
  d.speciality,
  d.clinic,
  d.experience_years AS experienceYears,
  d.phone,
  d.languages,
  d.visiting_hours AS visitingHours,
  d.about
FROM users u
LEFT JOIN doctor_profiles d ON d.user_id = u.id
WHERE u.id = ?
LIMIT 1
";
$stmt = $pdo->prepare($sql);
$stmt->execute([$user_id]);
$row = $stmt->fetch();

json_ok($row ?: null);
