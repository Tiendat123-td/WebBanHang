<?php
require_once __DIR__ . '/../auth/common.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../auth/active_user.php';
requireActiveUser($conn, 'Vui lòng đăng nhập.');
$userId = (int) $_SESSION['user']['id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = mysqli_prepare($conn, 'SELECT id,full_name,email,phone,role,created_at FROM users WHERE id=? LIMIT 1');
    if (!$stmt) respond(['success' => false, 'message' => 'Không thể tải hồ sơ.'], 500);
    mysqli_stmt_bind_param($stmt, 'i', $userId);
    if (!mysqli_stmt_execute($stmt)) {
        mysqli_stmt_close($stmt);
        respond(['success' => false, 'message' => 'Không thể tải hồ sơ.'], 500);
    }
    $user = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));
    mysqli_stmt_close($stmt);
    if (!$user) respond(['success' => false, 'message' => 'Không tìm thấy tài khoản.'], 404);
    respond(['success' => true, 'user' => $user]);
}

if (!in_array($method, ['PUT', 'POST'], true)) {
    header('Allow: GET, PUT, POST');
    respond(['success' => false, 'message' => 'Phương thức không được hỗ trợ.'], 405);
}
$data = jsonInput();
$nameValue = $data['full_name'] ?? $data['name'] ?? '';
$phoneValue = $data['phone'] ?? '';
if (!is_string($nameValue) || !is_string($phoneValue)) {
    respond(['success' => false, 'message' => 'Thông tin hồ sơ không hợp lệ.'], 422);
}
$name = trim($nameValue);
$phone = trim($phoneValue);
$nameLength = function_exists('mb_strlen') ? mb_strlen($name, 'UTF-8') : strlen($name);
if ($nameLength < 2 || $nameLength > 120) respond(['success' => false, 'message' => 'Họ tên phải từ 2 đến 120 ký tự.'], 422);
if ($phone !== '' && !preg_match('/^[0-9+() .-]{8,20}$/', $phone)) respond(['success' => false, 'message' => 'Số điện thoại không hợp lệ.'], 422);

$stmt = mysqli_prepare($conn, 'UPDATE users SET full_name=?,phone=? WHERE id=? AND role=\'user\'');
if (!$stmt) respond(['success' => false, 'message' => 'Không thể chuẩn bị cập nhật hồ sơ.'], 500);
mysqli_stmt_bind_param($stmt, 'ssi', $name, $phone, $userId);
if (!mysqli_stmt_execute($stmt)) {
    mysqli_stmt_close($stmt);
    respond(['success' => false, 'message' => 'Không thể cập nhật hồ sơ.'], 500);
}
mysqli_stmt_close($stmt);
$_SESSION['user']['full_name'] = $name;
$_SESSION['user']['phone'] = $phone;
respond(['success' => true, 'message' => 'Đã cập nhật thông tin.', 'user' => $_SESSION['user']]);
