<?php
<?php
// Enable full error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', 'paystack_error.log'); // Error log file in current directory
?>

// paystack-verify.php

if (!isset($_POST['reference'])) {
    echo json_encode(['success' => false, 'message' => 'No payment reference provided.']);
    exit;
}

$reference = $_POST['reference'];
$secret_key = getenv('PAYSTACK_SECRET_KEY'); // Your Paystack Test Secret Key

$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => "https://api.paystack.co/transaction/verify/" . rawurlencode($reference),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Authorization: Bearer $secret_key",
        "Cache-Control: no-cache"
    ],
]);

$response = curl_exec($curl);
$err = curl_error($curl);
curl_close($curl);

if ($err) {
    echo json_encode(['success' => false, 'message' => 'Curl error: ' . $err]);
    exit;
}

$result = json_decode($response, true);

if ($result['status'] && $result['data']['status'] === 'success') {
    // Payment was successful
    // You can record the transaction or update your database here

    echo json_encode(['success' => true, 'message' => 'Payment verified successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Payment verification failed or payment not successful.']);
}
?>
