<?php
require_once __DIR__ . '/../auth/common.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../auth/active_user.php';

requireActiveUser($conn, 'Vui lòng đăng nhập.');
$userId = (int) $_SESSION['user']['id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = mysqli_prepare($conn, 'SELECT id,order_code,recipient_name,recipient_phone,shipping_address,note,subtotal,shipping_fee,discount,coupon_code,total,payment_method,payment_status,order_status,received_at,created_at FROM orders WHERE user_id=? ORDER BY created_at DESC,id DESC');
    if (!$stmt) respond(['success' => false, 'message' => 'Không thể tải lịch sử đơn hàng.'], 500);
    mysqli_stmt_bind_param($stmt, 'i', $userId);
    if (!mysqli_stmt_execute($stmt)) {
        mysqli_stmt_close($stmt);
        respond(['success' => false, 'message' => 'Không thể tải lịch sử đơn hàng.'], 500);
    }

    $result = mysqli_stmt_get_result($stmt);
    $orders = [];
    while ($order = mysqli_fetch_assoc($result)) {
        $orderId = (int) $order['id'];
        $itemsStmt = mysqli_prepare($conn, 'SELECT oi.product_id,oi.product_name,oi.size,oi.unit_price,oi.quantity,oi.line_total,r.id AS review_id,r.rating AS review_rating,r.comment AS review_comment FROM order_items oi LEFT JOIN product_reviews r ON r.order_id=oi.order_id AND r.product_id=oi.product_id AND r.user_id=? WHERE oi.order_id=? ORDER BY oi.id ASC');
        if (!$itemsStmt) {
            mysqli_stmt_close($stmt);
            respond(['success' => false, 'message' => 'Không thể tải chi tiết đơn hàng.'], 500);
        }
        mysqli_stmt_bind_param($itemsStmt, 'ii', $userId, $orderId);
        if (!mysqli_stmt_execute($itemsStmt)) {
            mysqli_stmt_close($itemsStmt);
            mysqli_stmt_close($stmt);
            respond(['success' => false, 'message' => 'Không thể tải chi tiết đơn hàng.'], 500);
        }

        $itemResult = mysqli_stmt_get_result($itemsStmt);
        $order['items'] = [];
        while ($item = mysqli_fetch_assoc($itemResult)) {
            $item['product_id'] = $item['product_id'] === null ? null : (int) $item['product_id'];
            $item['quantity'] = (int) $item['quantity'];
            $item['unit_price'] = (float) $item['unit_price'];
            $item['line_total'] = (float) $item['line_total'];
            $item['review'] = $item['review_id'] === null ? null : [
                'rating' => (int) $item['review_rating'],
                'comment' => $item['review_comment']
            ];
            unset($item['review_id'], $item['review_rating'], $item['review_comment']);
            $order['items'][] = $item;
        }
        mysqli_stmt_close($itemsStmt);
        $orders[] = $order;
    }
    mysqli_stmt_close($stmt);
    respond(['success' => true, 'orders' => $orders]);
}

if ($method !== 'POST') {
    header('Allow: GET, POST');
    respond(['success' => false, 'message' => 'Phương thức không được hỗ trợ.'], 405);
}

$data = jsonInput();
$action = $data['action'] ?? '';
$orderId = filter_var($data['order_id'] ?? null, FILTER_VALIDATE_INT);
if ($action !== 'confirm_received' || !$orderId || $orderId < 1) {
    respond(['success' => false, 'message' => 'Thông tin xác nhận nhận hàng không hợp lệ.'], 422);
}
if (!mysqli_begin_transaction($conn)) {
    respond(['success' => false, 'message' => 'Không thể xác nhận đơn hàng lúc này.'], 500);
}

try {
    $find = mysqli_prepare($conn, 'SELECT order_status,received_at FROM orders WHERE id=? AND user_id=? FOR UPDATE');
    if (!$find) throw new RuntimeException('Không thể kiểm tra đơn hàng.');
    mysqli_stmt_bind_param($find, 'ii', $orderId, $userId);
    if (!mysqli_stmt_execute($find)) throw new RuntimeException('Không thể kiểm tra đơn hàng.');
    $order = mysqli_fetch_assoc(mysqli_stmt_get_result($find));
    mysqli_stmt_close($find);
    if (!$order) throw new OutOfBoundsException('Không tìm thấy đơn hàng.');

    if ($order['received_at'] !== null) {
        if (!mysqli_commit($conn)) throw new RuntimeException('Không thể hoàn tất xác nhận đơn hàng.');
        respond(['success' => true, 'message' => 'Đơn hàng đã được xác nhận nhận hàng.']);
    }
    if (!in_array($order['order_status'], ['shipping', 'completed'], true)) {
        throw new DomainException('Bạn chỉ có thể xác nhận đã nhận đơn khi đơn hàng đang giao hoặc đã hoàn tất.');
    }

    $update = mysqli_prepare($conn, "UPDATE orders SET received_at=NOW(),order_status='completed' WHERE id=? AND user_id=? AND received_at IS NULL");
    if (!$update) throw new RuntimeException('Không thể lưu xác nhận nhận hàng.');
    mysqli_stmt_bind_param($update, 'ii', $orderId, $userId);
    if (!mysqli_stmt_execute($update) || mysqli_stmt_affected_rows($update) !== 1) {
        mysqli_stmt_close($update);
        throw new RuntimeException('Không thể lưu xác nhận nhận hàng.');
    }
    mysqli_stmt_close($update);
    if (!mysqli_commit($conn)) throw new RuntimeException('Không thể hoàn tất xác nhận đơn hàng.');
    respond(['success' => true, 'message' => 'Cảm ơn bạn đã xác nhận nhận hàng. Bạn có thể đánh giá sản phẩm trong đơn.']);
} catch (OutOfBoundsException $error) {
    mysqli_rollback($conn);
    respond(['success' => false, 'message' => $error->getMessage()], 404);
} catch (DomainException $error) {
    mysqli_rollback($conn);
    respond(['success' => false, 'message' => $error->getMessage()], 422);
} catch (Throwable $error) {
    mysqli_rollback($conn);
    respond(['success' => false, 'message' => $error->getMessage() ?: 'Không thể xác nhận đơn hàng.'], 500);
}
