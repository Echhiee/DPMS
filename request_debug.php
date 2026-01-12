<?php
// Simple diagnostic to check what's happening with requests
session_start();
header('Content-Type: text/html; charset=utf-8');

echo '<html><head><title>Request Debug</title><style>
body { font-family: Arial; padding: 20px; }
.debug { background: #f0f0f0; padding: 15px; margin: 10px 0; border-radius: 5px; }
.pass { background: #e8f5e9; color: #2e7d32; }
.fail { background: #ffebee; color: #c62828; }
code { background: #fff; padding: 2px 6px; border-radius: 3px; }
</style></head><body>';

echo '<h1>Request Debug Info</h1>';

echo '<div class="debug">';
echo '<h3>Current Session:</h3>';
echo '<p>Session ID: <code>' . session_id() . '</code></p>';
echo '<p>Session Status: ' . (session_status() === PHP_SESSION_ACTIVE ? 'ACTIVE' : 'NOT ACTIVE') . '</p>';
echo '<p>SESSION user: ';
if (isset($_SESSION['user'])) {
    echo '<pre>' . json_encode($_SESSION['user'], JSON_PRETTY_PRINT) . '</pre>';
} else {
    echo '<span class="fail">NOT SET - User is NOT authenticated</span>';
}
echo '</p>';
echo '</div>';

echo '<div class="debug">';
echo '<h3>Request Method:</h3>';
echo '<p><code>' . $_SERVER['REQUEST_METHOD'] . '</code></p>';
echo '</div>';

echo '<div class="debug">';
echo '<h3>To Test Admin API:</h3>';
echo '<ol>';
echo '<li>First, <strong>login</strong> through the normal flow at <a href="/">http://localhost/project-I/</a></li>';
echo '<li>Open browser DevTools (F12) → Network tab</li>';
echo '<li>Look for failed requests and note the error message</li>';
echo '<li>Check the Response to see what error the API is returning</li>';
echo '<li>Common issues:';
echo '<ul>';
echo '<li><code>401 Not authenticated</code> - User session not set</li>';
echo '<li><code>403 Forbidden</code> - User role is not admin</li>';
echo '<li><code>500 Server error</code> - Check PHP error logs</li>';
echo '</ul>';
echo '</li>';
echo '</ol>';
echo '</div>';

echo '<div class="debug">';
echo '<h3>If you\'re logged in as admin:</h3>';
echo '<p>Try accessing this endpoint directly: <a href="api/admin_dashboard.php" target="_blank">api/admin_dashboard.php</a></p>';
echo '<p>It should return JSON like: <code>{"ok":true,"data":{...}}</code></p>';
echo '</div>';

echo '</body></html>';
?>
