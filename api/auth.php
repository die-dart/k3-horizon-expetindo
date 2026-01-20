<?php
/**
 * Authentication Middleware
 * Supports JWT Bearer Token and IP Whitelist
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

/**
 * JWT Authentication Middleware
 * Checks IP whitelist first, then validates JWT token
 * 
 * @return array|null Returns ['user_id' => string, 'role' => string] or null
 */
function authenticate(): ?array {
    // Check if client IP is whitelisted
    $clientIP = getClientIP();
    
    if (in_array($clientIP, WHITELIST_IPS)) {
        // IP is whitelisted, allow access without token
        return [
            'user_id' => 'whitelisted',
            'role' => 'admin'
        ];
    }
    
    // Extract JWT token from Authorization header
    $token = extractBearerToken();
    
    if (!$token) {
        errorResponse('Unauthorized: No token provided', 401);
        return null; // Never reached due to exit in errorResponse
    }
    
    // Verify and decode JWT token
    $payload = verifyJWT($token);
    
    if (!$payload) {
        errorResponse('Unauthorized: Invalid token', 401);
        return null; // Never reached due to exit in errorResponse
    }
    
    return $payload;
}

/**
 * Extract Bearer Token from Authorization Header
 * 
 * @return string|null
 */
function extractBearerToken(): ?string {
    $headers = getAuthorizationHeader();
    
    if (!$headers) {
        return null;
    }
    
    // Extract token from "Bearer <token>" format
    if (preg_match('/Bearer\s+(.+)/i', $headers, $matches)) {
        return $matches[1];
    }
    
    return null;
}

/**
 * Get Authorization Header
 * 
 * @return string|null
 */
function getAuthorizationHeader(): ?string {
    $headers = null;
    
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER['Authorization']);
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        $requestHeaders = array_combine(
            array_map('ucwords', array_keys($requestHeaders)),
            array_values($requestHeaders)
        );
        
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }
    
    return $headers;
}

/**
 * Verify JWT Token
 * 
 * @param string $token JWT token
 * @return array|null Returns decoded payload or null if invalid
 */
function verifyJWT(string $token): ?array {
    try {
        // Split JWT into parts
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            logError("Invalid JWT format");
            return null;
        }
        
        [$headerB64, $payloadB64, $signatureB64] = $parts;
        
        // Decode header and payload
        $header = json_decode(base64UrlDecode($headerB64), true);
        $payload = json_decode(base64UrlDecode($payloadB64), true);
        
        if (!$header || !$payload) {
            logError("Failed to decode JWT header or payload");
            return null;
        }
        
        // Verify signature
        $signature = base64UrlDecode($signatureB64);
        $expectedSignature = hash_hmac(
            'sha256',
            "$headerB64.$payloadB64",
            JWT_SECRET,
            true
        );
        
        if (!hash_equals($signature, $expectedSignature)) {
            logError("JWT signature verification failed");
            return null;
        }
        
        // Check expiration
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            logError("JWT token expired");
            return null;
        }
        
        // Extract user information (matching Golang structure)
        return [
            'user_id' => $payload['id'] ?? null,
            'role' => $payload['role'] ?? 'user'
        ];
        
    } catch (Exception $e) {
        logError("JWT verification error: " . $e->getMessage());
        return null;
    }
}

/**
 * Base64 URL Decode
 * 
 * @param string $input
 * @return string
 */
function base64UrlDecode(string $input): string {
    $remainder = strlen($input) % 4;
    
    if ($remainder) {
        $padlen = 4 - $remainder;
        $input .= str_repeat('=', $padlen);
    }
    
    return base64_decode(strtr($input, '-_', '+/'));
}

/**
 * Base64 URL Encode
 * 
 * @param string $input
 * @return string
 */
function base64UrlEncode(string $input): string {
    return str_replace('=', '', strtr(base64_encode($input), '+/', '-_'));
}

/**
 * Create JWT Token (for reference/testing)
 * 
 * @param string $userId
 * @param string $role
 * @return string
 */
function createJWT(string $userId, string $role = 'user'): string {
    $header = [
        'alg' => JWT_ALGORITHM,
        'typ' => 'JWT'
    ];
    
    $payload = [
        'id' => $userId,
        'role' => $role,
        'exp' => time() + JWT_EXPIRATION,
        'iat' => time()
    ];
    
    $headerB64 = base64UrlEncode(json_encode($header));
    $payloadB64 = base64UrlEncode(json_encode($payload));
    
    $signature = hash_hmac(
        'sha256',
        "$headerB64.$payloadB64",
        JWT_SECRET,
        true
    );
    $signatureB64 = base64UrlEncode($signature);
    
    return "$headerB64.$payloadB64.$signatureB64";
}
