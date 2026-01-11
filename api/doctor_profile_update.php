<?php
require_once __DIR__ . "/helpers.php";
require_once __DIR__ . "/db.php";

require_login();
require_role("doctor");

$pdo = db();
$user_id = $_SESSION["user"]["id"];
$body = json_body();

$speciality = trim($body["speciality"] ?? "");
$reg_no = trim($body["reg_no"] ?? "");
$clinic = trim($body["clinic"] ?? "");
$experience_years = (int)($body["experience_years"] ?? 0);
$languages = trim($body["languages"] ?? "");
$visiting_hours = trim($body["visiting_hours"] ?? "");
$about = trim($body["about"] ?? "");

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
")->execute([$user_id, $speciality, $reg_no, $clinic, $experience_years, $languages, $visiting_hours, $about]);

$pdo->commit();

json_ok(["updated" => true]);
