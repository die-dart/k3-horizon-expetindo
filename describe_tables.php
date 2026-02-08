<?php
require_once __DIR__ . '/api/config.php';

try {
    $db = getDB();
    echo "Connected.\n";
    
    echo "DESCRIBE bnsp_proposals:\n";
    $stmt = $db->query("DESCRIBE bnsp_proposals");
    $result = $stmt->fetchAll();
    foreach ($result as $row) {
        echo $row['Field'] . "\n";
    }

    echo "\nDESCRIBE kemnaker_proposals:\n";
    $stmt = $db->query("DESCRIBE kemnaker_proposals");
    $result = $stmt->fetchAll();
    foreach ($result as $row) {
        echo $row['Field'] . "\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
