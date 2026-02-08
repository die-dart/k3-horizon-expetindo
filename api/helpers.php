<?php
/**
 * Helper Functions for JSON Responses and Utilities
 */

/**
 * Send JSON Response
 * 
 * @param mixed $data Response data
 * @param int $statusCode HTTP status code
 * @return void
 */
function jsonResponse($data, int $statusCode = 200): void {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Send Success Response
 * 
 * @param mixed $data Response data
 * @param string $message Success message
 * @param int $statusCode HTTP status code
 * @return void
 */
function successResponse($data = null, string $message = 'Success', int $statusCode = 200): void {
    $response = [
        'success' => true,
        'message' => $message
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    jsonResponse($response, $statusCode);
}

/**
 * Send Error Response
 * 
 * @param string $message Error message
 * @param int $statusCode HTTP status code
 * @param mixed $errors Additional error details
 * @return void
 */
function errorResponse(string $message, int $statusCode = 400, $errors = null): void {
    $response = [
        'success' => false,
        'error' => $message
    ];
    
    if ($errors !== null) {
        $response['errors'] = $errors;
    }
    
    jsonResponse($response, $statusCode);
}

/**
 * Get JSON Request Body
 * 
 * @return array|null
 */
function getJsonBody(): ?array {
    $body = file_get_contents('php://input');
    if (empty($body)) {
        return null;
    }
    
    $data = json_decode($body, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        return null;
    }
    
    return $data;
}

/**
 * Validate Required Fields
 * 
 * @param array $data Input data
 * @param array $required Required field names
 * @return array|null Array of missing fields or null if all present
 */
function validateRequired(array $data, array $required): ?array {
    $missing = [];
    
    foreach ($required as $field) {
        if (!isset($data[$field]) || $data[$field] === '') {
            $missing[] = $field;
        }
    }
    
    return empty($missing) ? null : $missing;
}

/**
 * Sanitize String Input
 * 
 * @param string $input
 * @return string
 */
function sanitizeString(string $input): string {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

/**
 * Parse Route Path and Extract ID
 * 
 * @param string $path Request path (e.g., "/articles/5")
 * @param string $resource Resource name (e.g., "articles")
 * @return array ['resource' => string, 'id' => string|null]
 */
function parseRoutePath(string $path, string $resource): array {
    // Remove leading/trailing slashes
    $path = trim($path, '/');
    
    // Split path
    $parts = explode('/', $path);
    
    // Extract ID if present
    $id = null;
    if (count($parts) >= 2 && $parts[0] === $resource) {
        $id = $parts[1] ?? null;
    }
    
    return [
        'resource' => $parts[0] ?? null,
        'id' => $id
    ];
}

/**
 * Enable CORS Headers
 * 
 * @return void
 */
function enableCORS(): void {
    $origin = CORS_ALLOWED_ORIGINS;
    $requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    // For development, always allow the requesting origin
    if ($origin === '*') {
        // If it's a wildcard, echo back the requesting origin for credentialed requests
        // or just use * for simple requests
        if (!empty($requestOrigin)) {
            header("Access-Control-Allow-Origin: $requestOrigin");
        } else {
            header('Access-Control-Allow-Origin: *');
        }
    } else {
        $allowedOrigins = array_map('trim', explode(',', $origin));
        
        if (in_array($requestOrigin, $allowedOrigins)) {
            header("Access-Control-Allow-Origin: $requestOrigin");
        } elseif (!empty($requestOrigin)) {
            // For local development, also allow common dev origins
            $devOrigins = ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://localhost:3000'];
            if (in_array($requestOrigin, $devOrigins)) {
                header("Access-Control-Allow-Origin: $requestOrigin");
            }
        }
    }
    
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

/**
 * Log Error (for debugging)
 * 
 * @param string $message
 * @return void
 */
function logError(string $message): void {
    if (APP_DEBUG) {
        error_log("[PHP API Error] " . $message);
    }
}
