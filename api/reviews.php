<?php
require_once __DIR__ . '/auth/common.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET');
    respond(['success' => false, 'message' => 'Chỉ chấp nhận phương thức GET.'], 405);
}
$productId = filter_var($_GET['product_id'] ?? null, FILTER_VALIDATE_INT);
if (!$productId || $productId < 1) {
    respond(['success' => false, 'message' => 'Sản phẩm không hợp lệ.'], 422);
}

$summaryStmt = mysqli_prepare($conn, 'SELECT COUNT(*) AS review_count,COALESCE(AVG(r.rating),0) AS average_rating FROM product_reviews r JOIN orders o ON o.id=r.order_id WHERE r.product_id=? AND o.received_at IS NOT NULL');
if (!$summaryStmt) respond(['success' => false, 'message' => 'Không thể tải đánh giá sản phẩm.'], 500);
mysqli_stmt_bind_param($summaryStmt, 'i', $productId);
if (!mysqli_stmt_execute($summaryStmt)) {
    mysqli_stmt_close($summaryStmt);
    respond(['success' => false, 'message' => 'Không thể tải đánh giá sản phẩm.'], 500);
}
$summary = mysqli_fetch_assoc(mysqli_stmt_get_result($summaryStmt));
mysqli_stmt_close($summaryStmt);

$reviewsStmt = mysqli_prepare($conn, 'SELECT r.rating,r.comment,r.created_at FROM product_reviews r JOIN orders o ON o.id=r.order_id WHERE r.product_id=? AND o.received_at IS NOT NULL ORDER BY r.created_at DESC,r.id DESC LIMIT 50');
if (!$reviewsStmt) respond(['success' => false, 'message' => 'Không thể tải đánh giá sản phẩm.'], 500);
mysqli_stmt_bind_param($reviewsStmt, 'i', $productId);
if (!mysqli_stmt_execute($reviewsStmt)) {
    mysqli_stmt_close($reviewsStmt);
    respond(['success' => false, 'message' => 'Không thể tải đánh giá sản phẩm.'], 500);
}

$reviews = [];
$result = mysqli_stmt_get_result($reviewsStmt);
while ($review = mysqli_fetch_assoc($result)) {
    $review['rating'] = (int) $review['rating'];
    $reviews[] = $review;
}
mysqli_stmt_close($reviewsStmt);
respond([
    'success' => true,
    'review_count' => (int) $summary['review_count'],
    'average_rating' => (float) $summary['average_rating'],
    'reviews' => $reviews
]);
