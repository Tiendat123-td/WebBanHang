<?php
require_once __DIR__ . '/auth/common.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET');
    respond(['success' => false, 'message' => 'Chỉ chấp nhận phương thức GET.'], 405);
}

$sql = "SELECT r.rating,r.comment,r.created_at,p.id AS product_id,p.name AS product_name
    FROM product_reviews r
    JOIN orders o ON o.id=r.order_id AND o.user_id=r.user_id AND o.received_at IS NOT NULL
    JOIN products p ON p.id=r.product_id
    WHERE EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id=r.order_id AND oi.product_id=r.product_id)
    ORDER BY r.created_at DESC,r.id DESC
    LIMIT 6";
$result = mysqli_query($conn, $sql);
if (!$result) respond(['success' => false, 'message' => 'Không thể tải đánh giá mới nhất.'], 500);

$reviews = [];
while ($review = mysqli_fetch_assoc($result)) {
    $review['rating'] = (int) $review['rating'];
    $review['product_id'] = (int) $review['product_id'];
    $reviews[] = $review;
}
respond(['success' => true, 'reviews' => $reviews]);
