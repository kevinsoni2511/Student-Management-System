<?php
// database/setup.php
// Script to initialize student_management database and tables

header("Content-Type: application/json; charset=UTF-8");

$host = 'localhost';
$user = 'root';
$pass = '';

try {
    $mysqli = new mysqli($host, $user, $pass);

    if ($mysqli->connect_error) {
        throw new Exception("Connection failed: " . $mysqli->connect_error);
    }

    $sql = file_get_contents(__DIR__ . '/schema.sql');

    // Execute multi query for multiple SQL statements
    if ($mysqli->multi_query($sql)) {
        do {
            // Store and free any result sets
            if ($result = $mysqli->store_result()) {
                $result->free();
            }
        } while ($mysqli->more_results() && $mysqli->next_result());
    }

    if ($mysqli->error) {
        throw new Exception("SQL execution error: " . $mysqli->error);
    }

    echo json_encode([
        "success" => true,
        "message" => "Database 'student_management' and tables (users, courses, students) created successfully!"
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
