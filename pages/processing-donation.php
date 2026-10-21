<?php
// Database config
$db_host = "localhost";
$db_name = "donors";
$db_user = "YOUR_DB_USERNAME";
$db_pass = "YOUR_DB_PASSWORD";

// Connect to database
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Database connection failed"]);
    exit();
}

// Sanitize input
$full_name = $conn->real_escape_string($_POST['full_name']);
$email = $conn->real_escape_string($_POST['email']);
$amount = (float) $_POST['amount'];
$recurring_type = $conn->real_escape_string($_POST['recurring_type']);

// Insert into database
$sql = "INSERT INTO donors (full_name, email, amount, recurring_type) VALUES ('$full_name', '$email', $amount, '$recurring_type')";

if ($conn->query($sql)) {
    // Send email notification
    $to = "Community@spursbasefoundation.org";
    $subject = "New Donation Received";
    $message = "
    A new donation has been received:\n
    Name: $full_name
    Email: $email
    Amount: GHS $amount
    Recurring: $recurring_type
    ";
    $headers = "From: no-reply@spursbasefoundation.org";

    mail($to, $subject, $message, $headers);

    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $conn->error]);
}

$conn->close();
?>
