<?php
require_once __DIR__ . '/api/config.php';

try {
    echo "Connecting to DB...\n";
    $db = getDB();
    echo "Connected.\n";
    
    echo "Querying bnsp_proposals...\n";
    try {
        $stmt = $db->query("SELECT * FROM bnsp_proposals LIMIT 1");
        $result = $stmt->fetchAll();
        echo "BNSP Query successful. Rows: " . count($result) . "\n";
    } catch (PDOException $e) {
        echo "BNSP Query FAILED: " . $e->getMessage() . "\n";
    }

    echo "Querying kemnaker_proposals...\n";
    try {
        $stmt = $db->query("SELECT * FROM kemnaker_proposals LIMIT 1");
        $result = $stmt->fetchAll();
        echo "Kemnaker Query successful. Rows: " . count($result) . "\n";
    } catch (PDOException $e) {
        echo "Kemnaker Query FAILED: " . $e->getMessage() . "\n";
    }
    
} catch (Exception $e) {
    echo "General Error: " . $e->getMessage() . "\n";
}
