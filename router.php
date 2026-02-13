<?php
/**
 * Router for PHP Built-in Development Server
 * This file routes API requests to the api/index.php handler
 */

$uri = $_SERVER['REQUEST_URI'];
$path = parse_url($uri, PHP_URL_PATH);

// Handle API requests
if (preg_match('#^/api(/.*)?$#', $path)) {
    // Set the REQUEST_URI for the API router
    $_SERVER['REQUEST_URI'] = $uri;
    require __DIR__ . '/api/index.php';
    return;
}

// Check if file exists and serve it
$filePath = __DIR__ . $path;
if (is_file($filePath)) {
    return false; // Let PHP built-in server handle static files
}

// Check for index.html in directories
if (is_dir($filePath)) {
    $indexFile = rtrim($filePath, '/') . '/index.html';
    if (is_file($indexFile)) {
        return false;
    }
}

// Default: serve the request as-is
return false;
