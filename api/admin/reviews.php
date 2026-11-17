<?php
require_once __DIR__ . '/guard.php';
require_once __DIR__ . '/../../config/db.php';
requireAdmin($conn);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET');
    respond(['success' => false, 'message' => 'Chỉ chấp nhận phương thức GET.'], 405);
}

$sql = "SELECT r.id,r.rating,r.comment,r.created_at,p.name AS product_name,u.full_name AS customer_name,u.email AS customer_email,o.order_code
    FROM product_reviews r
    JOIN orders o ON o.id=r.order_id AND o.user_id=r.user_id AND o.received_at IS NOT NULL
    JOIN products p ON p.id=r.product_id
    JOIN users u ON u.id=r.user_id
    WHERE EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id=r.order_id AND oi.product_id=r.product_id)
    ORDER BY r.created_at DESC,r.id DESC";
$result = mysqli_query($conn, $sql);
if (!$result) respond(['success' => false, 'message' => 'Không thể tải đánh giá khách hàng.'], 500);

$reviews = [];
while ($review = mysqli_fetch_assoc($result)) {
    $review['id'] = (int) $review['id'];
    $review['rating'] = (int) $review['rating'];
    $reviews[] = $review;
}
respond(['success' => true, 'reviews' => $reviews]);
