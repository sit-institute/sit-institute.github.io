<?php

function validateRecaptcha($token) {
  $secret = '6LcFSLgUAAAAAIH-JdkubUfBHw5g6tswFP9nLrkg';

  if (isset($token) && !empty($token)) {
    $verifyURL = 'https://www.google.com/recaptcha/api/siteverify?secret=' . urlencode($secret) .  '&response=' . urlencode($token);
    $verifyResponse = file_get_contents($verifyURL);
    $responseData = json_decode($verifyResponse);

    if ($responseData) {
      return $responseData->success;
    } else {
      error_log("Invalid response data: " . $responseData);
      return false;
    }

  } else {
    error_log("No token given");
    return false;
  }
}

if ($_POST) {
  $to_email = "info@sit.institute";
  $from_email = 'kontaktformular@sit.institute';

  if (!isset($_SERVER['HTTP_X_REQUESTED_WITH']) || strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) != 'xmlhttprequest') {
    http_response_code(400);
    die();
  } 

  $token      = $_POST["token"];
  $user_name  = filter_var($_POST["name"], FILTER_SANITIZE_STRING);
  $user_email = filter_var($_POST["email"], FILTER_SANITIZE_EMAIL);
  $subject    = filter_var($_POST["subject"], FILTER_SANITIZE_STRING);
  $message    = filter_var($_POST["message"], FILTER_SANITIZE_STRING);

  $message_body = $message;
  
  $headers = 
    'From: ' . $user_name . ' <' . $from_email . ">\r\n" .
    'Reply-To: ' . $user_email . "\r\n" .
    'X-Mailer: PHP/' . phpversion();
  
  if (validateRecaptcha($token) && mail($to_email, $subject, $message_body, $headers)) {
    header(trim("HTTP/1.0 204 No Content"));
  } else {
    header(trim("HTTP/1.0 500 Internal Server Error"));
  }

  exit();
}

?>