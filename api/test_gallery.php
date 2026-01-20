<?php
/**
 * Test Gallery Table Structure
 * This file helps diagnose the gallery query issue
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

header('Content-Type: text/plain; charset=utf-8');

echo "=== Gallery Table Structure Test ===\n\n";

try {
    $db = getDB();
    
    // Get table structure
    echo "1. Checking table structure...\n";
    $stmt = $db->query("DESCRIBE galleries");
    $columns = $stmt->fetchAll();
    
    echo "   Columns in 'galleries' table:\n";
    foreach ($columns as $col) {
        echo "   - {$col['Field']} ({$col['Type']})\n";
    }
    
    // Try simple query
    echo "\n2. Testing simple query...\n";
    $stmt = $db->query("SELECT * FROM galleries LIMIT 1");
    $result = $stmt->fetch();
    
    if ($result) {
        echo "   ✓ Found data!\n";
        echo "   Sample row keys: " . implode(', ', array_keys($result)) . "\n";
    } else {
        echo "   ⚠ Table is empty\n";
    }
    
    // Try the actual query from Gallery.php
    echo "\n3. Testing actual Gallery.php query...\n";
    try {
        $stmt = $db->prepare("
            SELECT id, title, description, image_url, thumbnail, 
                   category_id, created_at, updated_at 
            FROM galleries 
            ORDER BY created_at DESC
        ");
        $stmt->execute();
        $galleries = $stmt->fetchAll();
        
        echo "   ✓ Query executed successfully!\n";
        echo "   Found " . count($galleries) . " galleries\n";
        
    } catch (PDOException $e) {
        echo "   ✗ Query failed: " . $e->getMessage() . "\n";
    }
    
    echo "\n=== Test Complete ===\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
