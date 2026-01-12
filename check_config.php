<?php
// Check for any output before our code
ob_start();
require_once __DIR__ . '/api/config.php';
$output = ob_get_clean();

echo '<html><head><title>Config Check</title><style>
body { font-family: monospace; padding: 20px; }
code { background: #f5f5f5; padding: 10px; display: block; }
</style></head><body>';

echo '<h1>Config File Output Check</h1>';
echo '<p>Output length from config.php: ' . strlen($output) . ' bytes</p>';

if (strlen($output) > 0) {
    echo '<p style="color: red;"><strong>⚠️ CONFIG IS OUTPUTTING DATA!</strong></p>';
    echo '<p>First 100 chars (hex):</p>';
    echo '<code>' . bin2hex(substr($output, 0, 100)) . '</code>';
} else {
    echo '<p style="color: green;"><strong>✅ Config is clean (no output)</strong></p>';
}

// Also check the raw file
echo '<h1>Config File Content Check</h1>';
$content = file_get_contents(__DIR__ . '/api/config.php');
echo '<p>File size: ' . strlen($content) . ' bytes</p>';
echo '<p>Starts with: ' . bin2hex(substr($content, 0, 10)) . '</p>';
echo '<p>Ends with: ' . bin2hex(substr($content, -10)) . '</p>';

echo '</body></html>';
?>
