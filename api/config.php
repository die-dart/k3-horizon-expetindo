<?php
/**
 * Database & Application Configuration
 * 
 * Environment variables should be set in your hosting environment or .env file
 * For local development, you can use getenv() with defaults
 */

// Load environment variables from .env file
require_once __DIR__ . '/load_env.php';

// Database Configuration (loaded from .env file)
define('DB_HOST', $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?: 'localhost');
define('DB_PORT', $_ENV['DB_PORT'] ?? getenv('DB_PORT') ?: '3306');
define('DB_NAME', $_ENV['DB_NAME'] ?? getenv('DB_NAME') ?: 'your_database');
define('DB_USER', $_ENV['DB_USER'] ?? getenv('DB_USER') ?: 'your_username');
define('DB_PASS', $_ENV['DB_PASS'] ?? getenv('DB_PASS') ?: 'your_password');
define('DB_CHARSET', 'utf8mb4');

// JWT Configuration (loaded from .env file)
define('JWT_SECRET', $_ENV['ACCESS_SECRET'] ?? getenv('ACCESS_SECRET') ?: 'your-secret-key-here');
define('JWT_ALGORITHM', 'HS256');
define('JWT_EXPIRATION', 3600); // 1 hour in seconds

// Application Configuration
define('APP_ENV', $_ENV['APP_ENV'] ?? getenv('APP_ENV') ?: 'development');
define('APP_DEBUG', APP_ENV === 'development');

// CORS Configuration
define('CORS_ALLOWED_ORIGINS', $_ENV['CORS_ALLOWED_ORIGINS'] ?? getenv('CORS_ALLOWED_ORIGINS') ?: '*');

// Whitelisted IPs (same as Golang implementation)
define('WHITELIST_IPS', ['103.103.192.24', 'localhost', '127.0.0.1', '::1']);

/**
 * Get PDO Database Connection
 * 
 * @return PDO
 * @throws PDOException
 */
function getDB(): PDO {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=%s',
                DB_HOST,
                DB_PORT,
                DB_NAME,
                DB_CHARSET
            );
            
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            throw $e;
        }
    }
    
    return $pdo;
}

/**
 * Get Client IP Address
 * 
 * @return string
 */
function getClientIP(): string {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    
    // Check for proxy headers
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
    } elseif (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    }
    
    return trim($ip);
}
