<?php
require_once __DIR__ . "/db.php";

header("Content-Type: text/plain; charset=utf-8");

$pdo = db();

$name = "Dr. Demo Doctor";
$email = "doctor@care.com";
$password = "123456"; // login password

$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("SELECT id FROM users WHERE email=? LIMIT 1");
$stmt->execute([$email]);
if ($stmt->fetch()) {
  echo "Doctor already exists.\nEmail: $email\nPassword: $password\n";
  exit;
}

$pdo->prepare("INSERT INTO users(role, full_name, email, password_hash) VALUES('doctor',?,?,?)")
    ->execute([$name, $email, $hash]);
$uid = (int)$pdo->lastInsertId();

$pdo->prepare("INSERT INTO doctor_profiles(user_id, speciality, clinic, experience_years, languages)
               VALUES(?,?,?,?,?)")
    ->execute([$uid, "General Practice", "Pokhara Clinic", 5, "Nepali, English"]);

echo "Doctor created ✅\nEmail: $email\nPassword: $password\n";
