<?php
require_once __DIR__ . '/../auth/common.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../auth/active_user.php';
requireActiveUser($conn, 'Vui lòng đăng nhập.');

if (!in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT'], true)) {
    header('Allow: POST, PUT');
    respond(['success' => false, 'message' => 'Phương thức không được hỗ trợ.'], 405);
}

$data = jsonInput();
$currentPassword = $data['current_password'] ?? '';
$newPassword = $data['new_password'] ?? '';
if (!is_string($currentPassword) || $currentPassword === '' || !is_string($newPassword) || strlen($newPassword) < 8) {
    respond(['success' => false, 'message' => 'Mật khẩu mới phải có ít nhất 8 ký tự.'], 422);
}

$userId = (int) $_SESSION['user']['id'];
$stmt = mysqli_prepare($conn, 'SELECT password_hash FROM users WHERE id=? LIMIT 1');
if (!$stmt) {
    respond(['success' => false, 'message' => 'Không thể kiểm tra mật khẩu.'], 500);
}
mysqli_stmt_bind_param($stmt, 'i', $userId);
if (!mysqli_stmt_execute($stmt)) {
    respond(['success' => false, 'message' => 'Không thể kiểm tra mật khẩu.'], 500);
}
$user = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));
mysqli_stmt_close($stmt);
if (!$user || !password_verify($currentPassword, $user['password_hash'])) {
    respond(['success' => false, 'message' => 'Mật khẩu hiện tại không đúng.'], 422);
}

$newHash = password_hash($newPassword, PASSWORD_DEFAULT);
$update = mysqli_prepare($conn, 'UPDATE users SET password_hash=? WHERE id=?');
if (!$update) {
    respond(['success' => false, 'message' => 'Không thể đổi mật khẩu.'], 500);
}
mysqli_stmt_bind_param($update, 'si', $newHash, $userId);
if (!mysqli_stmt_execute($update)) {
    respond(['success' => false, 'message' => 'Không thể đổi mật khẩu.'], 500);
}
mysqli_stmt_close($update);
session_regenerate_id(true);
respond(['success' => true, 'message' => 'Đã đổi mật khẩu.']);
