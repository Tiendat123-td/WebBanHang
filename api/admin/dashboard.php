<?php
require_once __DIR__ . '/guard.php';
require_once __DIR__ . '/../../config/db.php';
requireAdmin($conn);
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET');
    respond(['success' => false, 'message' => 'Phương thức không được hỗ trợ.'], 405);
}

$resultUsers = mysqli_query($conn, "SELECT COUNT(*) AS total FROM users WHERE role = 'user'");
$resultProducts = mysqli_query($conn, 'SELECT COUNT(*) AS total FROM products');
$resultOrders = mysqli_query($conn, 'SELECT COUNT(*) AS total FROM orders');
$resultRevenue = mysqli_query($conn, "SELECT COALESCE(SUM(total),0) AS total FROM orders WHERE order_status = 'completed' AND payment_status = 'paid'");

if (!$resultUsers || !$resultProducts || !$resultOrders || !$resultRevenue) {
    respond(array('success' => false, 'message' => 'Không thể lấy số liệu quản trị.'), 500);
}

$users = mysqli_fetch_assoc($resultUsers);
$products = mysqli_fetch_assoc($resultProducts);
$orders = mysqli_fetch_assoc($resultOrders);
$revenue = mysqli_fetch_assoc($resultRevenue);
respond(array(
    'success' => true,
    'statistics' => array(
        'users' => (int) $users['total'],
        'products' => (int) $products['total'],
        'orders' => (int) $orders['total'],
        'revenue' => (float) $revenue['total']
    )
));