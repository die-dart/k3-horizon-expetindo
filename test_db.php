<?php
require_once __DIR__ . '/api/config.php';

try {
    echo "Connecting to DB...\n";
    $db = getDB();
    echo "Connected.\n";
    
    echo "Querying proposal_categories...\n";
    $stmt = $db->query("SELECT * FROM proposal_categories LIMIT 1");
    $result = $stmt->fetchAll();
    echo "Query successful. Rows: " . count($result) . "\n";
    print_r($result);
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
