<?php
require_once __DIR__ . '/common.php';
require_once __DIR__ . '/../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(array('success' => false, 'message' => 'Chỉ chấp nhận phương thức POST.'), 405);
}

$data = jsonInput();
$requestedRole = !isset($data['role']) ? 'user' : (is_string($data['role']) ? trim($data['role']) : '');
if (!in_array($requestedRole, array('user', 'admin'), true)) {
    respond(array('success' => false, 'message' => 'Loại tài khoản không hợp lệ.'), 422);
}
$emailInput = $data['email'] ?? '';
$password = $data['password'] ?? '';
if (!is_string($emailInput) || !is_string($password)) {
    respond(array('success' => false, 'message' => 'Email hoặc mật khẩu không hợp lệ.'), 422);
}
$email = strtolower(trim($emailInput));

$sql = 'SELECT id, full_name, email, phone, password_hash, role, status FROM users WHERE email = ? LIMIT 1';
$stmt = mysqli_prepare($conn, $sql);
if (!$stmt) {
    respond(array('success' => false, 'message' => 'Không thể chuẩn bị truy vấn.'), 500);
}
mysqli_stmt_bind_param($stmt, 's', $email);
if (!mysqli_stmt_execute($stmt)) {
    mysqli_stmt_close($stmt);
    respond(array('success' => false, 'message' => 'Không thể kiểm tra thông tin đăng nhập.'), 500);
}
$result = mysqli_stmt_get_result($stmt);
$user = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

if (!$user || !password_verify($password, $user['password_hash']) || $user['status'] !== 'active' || $user['role'] !== $requestedRole) {
    respond(array('success' => false, 'message' => 'Email hoặc mật khẩu không đúng, hoặc tài khoản đã bị khóa.'), 401);
}

session_regenerate_id(true);
$_SESSION['user'] = array(
    'id' => (int)$user['id'],
    'full_name' => $user['full_name'],
    'email' => $user['email'],
    'phone' => $user['phone'],
    'role' => $user['role']
);

$redirect = ($requestedRole === 'admin') ? 'index.php' : 'profile.html?tab=info';
respond(array('success' => true, 'message' => 'Đăng nhập thành công.', 'user' => $_SESSION['user'], 'redirect' => $redirect));
