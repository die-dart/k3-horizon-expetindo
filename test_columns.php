<?php
require_once __DIR__ . '/api/config.php';

try {
    $db = getDB();
    echo "Connected.\n";
    
    $cols = "id, title, image_title, proposal_category, training_description, legal_basis,
             `condition`, facility, unit_code, unit_title, 
             timetable_1, timetable_2, location_1, location_2, image_online, image_offline,
             created_at, updated_at";
             
    echo "Querying bnsp_proposals with specific columns...\n";
    try {
        $stmt = $db->query("SELECT $cols FROM bnsp_proposals LIMIT 1");
        $result = $stmt->fetchAll();
        echo "BNSP Query successful. Rows: " . count($result) . "\n";
    } catch (PDOException $e) {
        echo "BNSP Query FAILED: " . $e->getMessage() . "\n";
    }

} catch (Exception $e) {
    echo "General Error: " . $e->getMessage() . "\n";
}
