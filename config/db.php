<?php
// Kết nối PHP với MySQL bằng MySQLi kiểu thủ tục.
$dbHost = 'sql310.infinityfree.com';
$dbName = 'if0_43243334_datnguyenthucshop';
$dbUser = 'if0_43243334';
$dbPass = '24062004dat'; // XAMPP mặc định thường để trống mật khẩu root.

$conn = mysqli_connect($dbHost, $dbUser, $dbPass, $dbName);

if (!$conn) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(
        array('success' => false, 'message' => 'Không kết nối được PHP/MySQL. Hãy kiểm tra XAMPP và tên cơ sở dữ liệu.'),
        JSON_UNESCAPED_UNICODE
    );
    exit;
}

mysqli_set_charset($conn, 'utf8mb4');
