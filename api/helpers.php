<?php
declare(strict_types=1);

function json_ok($data): void {
  echo json_encode(['ok' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
  exit;
}
function json_fail(string $message, int $code = 400): void {
  http_response_code($code);
  echo json_encode(['ok' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
  exit;
}
function require_method(string $m): void {
  if (($_SERVER['REQUEST_METHOD'] ?? '') !== $m) json_fail('Method not allowed', 405);
}
function read_json(): array {
  $raw = file_get_contents('php://input');
  if (!$raw) return [];
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}
function start_session(): void {
  if (session_status() === PHP_SESSION_NONE) {
    session_start([
      'cookie_httponly' => true,
      'cookie_samesite' => 'Lax',
    ]);
  }
}
function require_login(): array {
  start_session();
  if (empty($_SESSION['user'])) json_fail('Not authenticated', 401);
  return $_SESSION['user'];
}
function require_role(string $role): array {
  $u = require_login();
  if (($u['role'] ?? '') !== $role) json_fail('Forbidden', 403);
  return $u;
}
function json_body(): array {
  return read_json();
}