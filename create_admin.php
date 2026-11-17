<?php
// Chạy file này một lần để tạo tài khoản quản trị, sau đó XÓA file này.
require_once __DIR__ . '/config/db.php';

$email = '24004279@st.vlute.edu.vn';
$password = 'Tiendat@123';
$name = 'Quản trị viên';

$sql = 'SELECT id FROM users WHERE email = ? LIMIT 1';
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, 's', $email);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$existingUser = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

if ($existingUser) {
    $sql = "UPDATE users SET role = 'admin', status = 'active' WHERE email = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 's', $email);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);
    echo 'Tài khoản đã tồn tại và được cấp quyền admin. Hãy kiểm tra mật khẩu hiện tại.';
} else {
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $sql = "INSERT INTO users (full_name, email, password_hash, role, status) VALUES (?, ?, ?, 'admin', 'active')";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'sss', $name, $email, $passwordHash);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);
    echo 'Đã tạo tài khoản admin: ' . htmlspecialchars($email) . ' / mật khẩu hiện tại: ' . htmlspecialchars($password) . '. Hãy xóa file create_admin.php sau khi hoàn tất.';
}
