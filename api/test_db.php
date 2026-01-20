<?php
/**
 * Database Connection Test
 * Run this file to verify database credentials are correct
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/config.php';

echo "=== Database Connection Test ===\n\n";

echo "DB_HOST: " . DB_HOST . "\n";
echo "DB_PORT: " . DB_PORT . "\n";
echo "DB_NAME: " . DB_NAME . "\n";
echo "DB_USER: " . DB_USER . "\n";
echo "DB_PASS: " . (DB_PASS ? '***hidden***' : 'NOT SET') . "\n";
echo "ACCESS_SECRET: " . (JWT_SECRET ? '***hidden***' : 'NOT SET') . "\n\n";

try {
    echo "Attempting to connect to database...\n";
    $pdo = getDB();
    echo "✓ Database connection successful!\n\n";
    
    // Test query
    echo "Testing query...\n";
    $stmt = $pdo->query("SELECT DATABASE() as db_name, VERSION() as version");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "✓ Connected to database: " . $result['db_name'] . "\n";
    echo "✓ MySQL version: " . $result['version'] . "\n\n";
    
    // Check tables
    echo "Checking for tables...\n";
    $tables = ['article_categories', 'articles', 'form_registers', 'galleries', 'image_categories'];
    
    foreach ($tables as $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() > 0) {
            echo "  ✓ Table '$table' exists\n";
        } else {
            echo "  ✗ Table '$table' NOT FOUND\n";
        }
    }
    
    echo "\n=== Test Complete ===\n";
    echo "Database connection is working properly!\n";
    
} catch (PDOException $e) {
    echo "\n✗ DATABASE CONNECTION FAILED!\n";
    echo "Error: " . $e->getMessage() . "\n\n";
    echo "Please check:\n";
    echo "1. Database credentials in .env file\n";
    echo "2. Database server is accessible\n";
    echo "3. Database name exists\n";
    echo "4. User has proper permissions\n";
    exit(1);
}
