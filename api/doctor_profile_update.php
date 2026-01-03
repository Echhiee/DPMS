<?php
require_once __DIR__ . "/helpers.php";
require_once __DIR__ . "/db.php";

require_login();
require_role("doctor");

$user_id = $_SESSION["user"]["id"];
$body = json_body();

$speciality = trim($body["speciality"] ?? "");
$clinic = trim($body["clinic"] ?? "");
$experience_years = (int)($body["experience_years"] ?? 0);
$phone = trim($body["phone"] ?? "");
$languages = trim($body["languages"] ?? "");
$visiting_hours = trim($body["visiting_hours"] ?? "");
$about = trim($body["about"] ?? "");

$pdo->beginTransaction();

$pdo->prepare("
INSERT INTO doctor_profiles
(user_id, speciality, clinic, experience_years, phone, languages, visiting_hours, about)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
ON DUPLICATE KEY UPDATE
speciality=VALUES(speciality),
clinic=VALUES(clinic),
experience_years=VALUES(experience_years),
phone=VALUES(phone),
languages=VALUES(languages),
visiting_hours=VALUES(visiting_hours),
about=VALUES(about)
")->execute([$user_id, $speciality, $clinic, $experience_years, $phone, $languages, $visiting_hours, $about]);

$pdo->commit();

json_ok(["updated" => true]);
