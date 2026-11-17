<?php
require_once __DIR__ . '/../auth/common.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../auth/active_user.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(['success' => false, 'message' => 'Chỉ chấp nhận phương thức POST.'], 405);
}
requireActiveUser($conn, 'Vui lòng đăng nhập.');
$userId = (int) $_SESSION['user']['id'];
$data = jsonInput();

$orderId = filter_var($data['order_id'] ?? null, FILTER_VALIDATE_INT);
$productId = filter_var($data['product_id'] ?? null, FILTER_VALIDATE_INT);
$ratingValue = $data['rating'] ?? null;
$commentValue = $data['comment'] ?? '';
if (!$orderId || $orderId < 1 || !$productId || $productId < 1) {
    respond(['success' => false, 'message' => 'Đơn hàng hoặc sản phẩm không hợp lệ.'], 422);
}
if (!is_scalar($ratingValue) || !preg_match('/^[1-5]$/', (string) $ratingValue)) {
    respond(['success' => false, 'message' => 'Vui lòng chọn mức đánh giá từ 1 đến 5 sao.'], 422);
}
if (!is_string($commentValue)) {
    respond(['success' => false, 'message' => 'Nội dung đánh giá không hợp lệ.'], 422);
}
$comment = trim($commentValue);
$commentLength = preg_match_all('/./us', $comment, $commentCharacters);
if ($commentLength === false || $commentLength > 1000) {
    respond(['success' => false, 'message' => 'Đánh giá không được dài quá 1.000 ký tự.'], 422);
}
$commentToSave = $comment === '' ? null : $comment;
$rating = (int) $ratingValue;

if (!mysqli_begin_transaction($conn)) {
    respond(['success' => false, 'message' => 'Không thể gửi đánh giá lúc này.'], 500);
}
try {
    $orderStmt = mysqli_prepare($conn, 'SELECT received_at FROM orders WHERE id=? AND user_id=? FOR UPDATE');
    if (!$orderStmt) throw new RuntimeException('Không thể kiểm tra đơn hàng.');
    mysqli_stmt_bind_param($orderStmt, 'ii', $orderId, $userId);
    if (!mysqli_stmt_execute($orderStmt)) throw new RuntimeException('Không thể kiểm tra đơn hàng.');
    $order = mysqli_fetch_assoc(mysqli_stmt_get_result($orderStmt));
    mysqli_stmt_close($orderStmt);
    if (!$order) throw new OutOfBoundsException('Không tìm thấy đơn hàng.');
    if ($order['received_at'] === null) {
        throw new DomainException('Hãy xác nhận đã nhận đơn hàng trước khi gửi đánh giá.');
    }

    $itemStmt = mysqli_prepare($conn, 'SELECT id FROM order_items WHERE order_id=? AND product_id=? LIMIT 1 FOR UPDATE');
    if (!$itemStmt) throw new RuntimeException('Không thể kiểm tra sản phẩm trong đơn hàng.');
    mysqli_stmt_bind_param($itemStmt, 'ii', $orderId, $productId);
    if (!mysqli_stmt_execute($itemStmt)) throw new RuntimeException('Không thể kiểm tra sản phẩm trong đơn hàng.');
    $orderItem = mysqli_fetch_assoc(mysqli_stmt_get_result($itemStmt));
    mysqli_stmt_close($itemStmt);
    if (!$orderItem) throw new OutOfBoundsException('Sản phẩm này không thuộc đơn hàng.');

    $existingStmt = mysqli_prepare($conn, 'SELECT id FROM product_reviews WHERE user_id=? AND product_id=? AND order_id=? LIMIT 1 FOR UPDATE');
    if (!$existingStmt) throw new RuntimeException('Không thể kiểm tra đánh giá hiện có.');
    mysqli_stmt_bind_param($existingStmt, 'iii', $userId, $productId, $orderId);
    if (!mysqli_stmt_execute($existingStmt)) throw new RuntimeException('Không thể kiểm tra đánh giá hiện có.');
    $existing = mysqli_fetch_assoc(mysqli_stmt_get_result($existingStmt));
    mysqli_stmt_close($existingStmt);

    if ($existing) {
        $reviewId = (int) $existing['id'];
        $saveStmt = mysqli_prepare($conn, 'UPDATE product_reviews SET rating=?,comment=? WHERE id=? AND user_id=?');
        if (!$saveStmt) throw new RuntimeException('Không thể lưu đánh giá.');
        mysqli_stmt_bind_param($saveStmt, 'isii', $rating, $commentToSave, $reviewId, $userId);
    } else {
        $saveStmt = mysqli_prepare($conn, 'INSERT INTO product_reviews(user_id,product_id,order_id,rating,comment) VALUES(?,?,?,?,?)');
        if (!$saveStmt) throw new RuntimeException('Không thể lưu đánh giá.');
        mysqli_stmt_bind_param($saveStmt, 'iiiis', $userId, $productId, $orderId, $rating, $commentToSave);
    }
    if (!mysqli_stmt_execute($saveStmt)) {
        mysqli_stmt_close($saveStmt);
        throw new RuntimeException('Không thể lưu đánh giá.');
    }
    mysqli_stmt_close($saveStmt);
    if (!mysqli_commit($conn)) throw new RuntimeException('Không thể hoàn tất gửi đánh giá.');
    respond(['success' => true, 'message' => $existing ? 'Đã cập nhật đánh giá của bạn.' : 'Cảm ơn bạn đã đánh giá sản phẩm.']);
} catch (OutOfBoundsException $error) {
    mysqli_rollback($conn);
    respond(['success' => false, 'message' => $error->getMessage()], 404);
} catch (DomainException $error) {
    mysqli_rollback($conn);
    respond(['success' => false, 'message' => $error->getMessage()], 422);
} catch (Throwable $error) {
    mysqli_rollback($conn);
    respond(['success' => false, 'message' => $error->getMessage() ?: 'Không thể lưu đánh giá.'], 500);
}
