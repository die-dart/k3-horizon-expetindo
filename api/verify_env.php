<?php
/**
 * Verify Environment Variables
 * Quick check to see if .env values are loaded correctly
 */

require_once __DIR__ . '/config.php';

echo "=== Environment Variables Check ===\n\n";

echo "Database Configuration:\n";
echo "  DB_HOST: " . DB_HOST . "\n";
echo "  DB_PORT: " . DB_PORT . "\n";
echo "  DB_NAME: " . DB_NAME . "\n";
echo "  DB_USER: " . DB_USER . "\n";
echo "  DB_PASS: " . str_repeat('*', strlen(DB_PASS)) . " (hidden)\n\n";

echo "JWT Configuration:\n";
echo "  JWT_SECRET: " . substr(JWT_SECRET, 0, 8) . "... (truncated)\n";
echo "  JWT_ALGORITHM: " . JWT_ALGORITHM . "\n";
echo "  JWT_EXPIRATION: " . JWT_EXPIRATION . " seconds\n\n";

echo "Application Configuration:\n";
echo "  APP_ENV: " . APP_ENV . "\n";
echo "  APP_DEBUG: " . (APP_DEBUG ? 'true' : 'false') . "\n";
echo "  CORS_ALLOWED_ORIGINS: " . CORS_ALLOWED_ORIGINS . "\n\n";

// Verification
$allGood = true;

if (DB_HOST === 'localhost') {
    echo "⚠️  WARNING: DB_HOST is still 'localhost' - .env may not be loaded!\n";
    $allGood = false;
}

if (DB_NAME === 'your_database') {
    echo "⚠️  WARNING: DB_NAME is still 'your_database' - .env may not be loaded!\n";
    $allGood = false;
}

if (DB_USER === 'your_username') {
    echo "⚠️  WARNING: DB_USER is still 'your_username' - .env may not be loaded!\n";
    $allGood = false;
}

if (JWT_SECRET === 'your-secret-key-here') {
    echo "⚠️  WARNING: JWT_SECRET is still default - .env may not be loaded!\n";
    $allGood = false;
}

if ($allGood) {
    echo "✓ All environment variables loaded correctly from .env!\n";
    echo "✓ Configuration looks good!\n";
} else {
    echo "\n❌ Some environment variables are using default values.\n";
    echo "Please check if .env file exists and is readable.\n";
}

echo "\n=== End of Check ===\n";
