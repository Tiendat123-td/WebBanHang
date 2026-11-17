<?php
require_once __DIR__ . '/common.php';
require_once __DIR__ . '/../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(array('success' => false, 'message' => 'Chỉ chấp nhận phương thức POST.'), 405);
}

$data = jsonInput();
$nameInput = $data['full_name'] ?? $data['name'] ?? '';
$emailInput = $data['email'] ?? '';
$password = $data['password'] ?? '';
$phoneInput = $data['phone'] ?? '';
if (!is_string($nameInput) || !is_string($emailInput) || !is_string($password) || !is_string($phoneInput)) {
    respond(array('success' => false, 'message' => 'Thông tin đăng ký không hợp lệ.'), 422);
}
$name = trim($nameInput);
$email = strtolower(trim($emailInput));
$phone = trim($phoneInput);
$nameLength = function_exists('mb_strlen') ? mb_strlen($name, 'UTF-8') : strlen($name);
if ($nameLength < 2 || $nameLength > 120 || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8 || !preg_match('/^0[0-9]{9}$/', $phone)) {
    respond(array('success' => false, 'message' => 'Vui lòng nhập họ tên (2–120 ký tự), email hợp lệ, số điện thoại 10 số và mật khẩu tối thiểu 8 ký tự.'), 422);
}

$passwordHash = password_hash($password, PASSWORD_DEFAULT);
$sql = "INSERT INTO users (full_name, email, phone, password_hash, role, status) VALUES (?, ?, ?, ?, 'user', 'active')";
$stmt = mysqli_prepare($conn, $sql);
if (!$stmt) {
    respond(array('success' => false, 'message' => 'Không thể chuẩn bị truy vấn đăng ký.'), 500);
}
mysqli_stmt_bind_param($stmt, 'ssss', $name, $email, $phone, $passwordHash);
$ok = mysqli_stmt_execute($stmt);
$error = mysqli_stmt_errno($stmt);
mysqli_stmt_close($stmt);

if (!$ok) {
    if ($error === 1062) {
        respond(array('success' => false, 'message' => 'Email này đã được sử dụng.'), 409);
    }
    respond(array('success' => false, 'message' => 'Không thể tạo tài khoản.'), 500);
}

respond(array('success' => true, 'message' => 'Đăng ký thành công. Bạn có thể đăng nhập.'), 201);
