<?php
declare(strict_types=1);
require_once __DIR__ . '/helpers.php';

require_method('POST');
start_session();
session_destroy();
json_ok(true);
