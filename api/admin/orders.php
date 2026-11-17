<?php
require_once __DIR__ . '/guard.php';
require_once __DIR__ . '/../../config/db.php';
requireAdmin($conn);

$method = $_SERVER['REQUEST_METHOD'];
$allowedStatuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
$allowedPayments = ['unpaid', 'paid', 'refunded'];

if ($method === 'GET') {
    $result = mysqli_query($conn, 'SELECT o.id,o.order_code,o.recipient_name,o.recipient_phone,o.shipping_address,o.discount,o.coupon_code,o.total,o.payment_method,o.payment_status,o.order_status,o.created_at,u.email FROM orders o JOIN users u ON u.id=o.user_id ORDER BY o.created_at DESC,o.id DESC LIMIT 500');
    if (!$result) respond(['success' => false, 'message' => 'Không tải được đơn hàng.'], 500);
    $orders = [];
    $orderIndex = [];
    while ($order = mysqli_fetch_assoc($result)) {
        $order['id'] = (int) $order['id'];
        $order['discount'] = (float) $order['discount'];
        $order['total'] = (float) $order['total'];
        $order['items'] = [];
        $orderIndex[$order['id']] = count($orders);
        $orders[] = $order;
    }
    if ($orders) {
        $orderIds = implode(',', array_map('intval', array_keys($orderIndex)));
        $itemsResult = mysqli_query($conn, 'SELECT order_id,product_name,size,quantity FROM order_items WHERE order_id IN (' . $orderIds . ') ORDER BY order_id,id');
        if (!$itemsResult) respond(['success' => false, 'message' => 'Không tải được chi tiết đơn hàng.'], 500);
        while ($item = mysqli_fetch_assoc($itemsResult)) {
            $orderId = (int) $item['order_id'];
            if (!isset($orderIndex[$orderId])) continue;
            $orders[$orderIndex[$orderId]]['items'][] = [
                'product_name' => $item['product_name'],
                'size' => $item['size'],
                'quantity' => (int) $item['quantity']
            ];
        }
    }
    respond(['success' => true, 'orders' => $orders]);
}

if ($method !== 'PUT') {
    header('Allow: GET, PUT');
    respond(['success' => false, 'message' => 'Phương thức không được hỗ trợ.'], 405);
}
$data = jsonInput();
$idValue = $data['id'] ?? 0;
$status = $data['order_status'] ?? null;
$payment = $data['payment_status'] ?? null;
if (!is_scalar($idValue) || ($status !== null && !is_string($status)) || ($payment !== null && !is_string($payment))) {
    respond(['success' => false, 'message' => 'Dữ liệu cập nhật đơn hàng không hợp lệ.'], 422);
}
$id = (int) $idValue;
if ($id < 1) respond(['success' => false, 'message' => 'ID đơn hàng không hợp lệ.'], 422);
if ($status !== null && !in_array($status, $allowedStatuses, true)) respond(['success' => false, 'message' => 'Trạng thái đơn hàng không hợp lệ.'], 422);
if ($payment !== null && !in_array($payment, $allowedPayments, true)) respond(['success' => false, 'message' => 'Trạng thái thanh toán không hợp lệ.'], 422);
if ($status === null && $payment === null) respond(['success' => false, 'message' => 'Không có dữ liệu cần cập nhật.'], 422);
if (!mysqli_begin_transaction($conn)) respond(['success' => false, 'message' => 'Không thể bắt đầu cập nhật đơn hàng.'], 500);

try {
    $find = mysqli_prepare($conn, 'SELECT order_status FROM orders WHERE id=? FOR UPDATE');
    if (!$find) throw new RuntimeException('Không thể kiểm tra đơn hàng.');
    mysqli_stmt_bind_param($find, 'i', $id);
    if (!mysqli_stmt_execute($find)) throw new RuntimeException('Không thể kiểm tra đơn hàng.');
    $order = mysqli_fetch_assoc(mysqli_stmt_get_result($find));
    mysqli_stmt_close($find);
    if (!$order) throw new OutOfBoundsException('Không tìm thấy đơn hàng.');

    $oldStatus = $order['order_status'];
    if ($status !== null && $status !== $oldStatus) {
        if ($status === 'cancelled') {
            if ($oldStatus === 'completed') throw new DomainException('Không thể hủy đơn hàng đã hoàn tất.');
            $items = mysqli_prepare($conn, 'SELECT product_id,quantity FROM order_items WHERE order_id=?');
            if (!$items) throw new RuntimeException('Không thể lấy sản phẩm trong đơn hàng.');
            mysqli_stmt_bind_param($items, 'i', $id);
            if (!mysqli_stmt_execute($items)) throw new RuntimeException('Không thể lấy sản phẩm trong đơn hàng.');
            $itemResult = mysqli_stmt_get_result($items);
            while ($item = mysqli_fetch_assoc($itemResult)) {
                if ($item['product_id'] === null) continue;
                $restore = mysqli_prepare($conn, 'UPDATE products SET stock=stock+? WHERE id=?');
                if (!$restore) throw new RuntimeException('Không thể hoàn tồn kho.');
                $productId = (int) $item['product_id'];
                $quantity = (int) $item['quantity'];
                mysqli_stmt_bind_param($restore, 'ii', $quantity, $productId);
                if (!mysqli_stmt_execute($restore)) throw new RuntimeException('Không thể hoàn tồn kho.');
                mysqli_stmt_close($restore);
            }
            mysqli_stmt_close($items);
        } elseif ($oldStatus === 'cancelled') {
            $items = mysqli_prepare($conn, "SELECT oi.product_id,oi.product_name,oi.quantity,p.stock,p.status,c.status AS category_status FROM order_items oi LEFT JOIN products p ON p.id=oi.product_id LEFT JOIN categories c ON c.id=p.category_id WHERE oi.order_id=? ORDER BY oi.product_id FOR UPDATE");
            if (!$items) throw new RuntimeException('Không thể kiểm tra tồn kho để mở lại đơn hàng.');
            mysqli_stmt_bind_param($items, 'i', $id);
            if (!mysqli_stmt_execute($items)) throw new RuntimeException('Không thể kiểm tra tồn kho để mở lại đơn hàng.');
            $itemResult = mysqli_stmt_get_result($items);
            $reserveItems = [];
            while ($item = mysqli_fetch_assoc($itemResult)) {
                if ($item['product_id'] === null || $item['status'] !== 'active' || ($item['category_status'] !== null && $item['category_status'] !== 'active')) {
                    throw new DomainException('Không thể mở lại đơn hàng vì có sản phẩm không còn kinh doanh.');
                }
                if ((int) $item['quantity'] > (int) $item['stock']) {
                    throw new DomainException('Không đủ tồn kho để mở lại đơn hàng cho sản phẩm ' . $item['product_name'] . '.');
                }
                $reserveItems[] = ['id' => (int) $item['product_id'], 'quantity' => (int) $item['quantity']];
            }
            mysqli_stmt_close($items);
            foreach ($reserveItems as $item) {
                $reserve = mysqli_prepare($conn, 'UPDATE products SET stock=stock-? WHERE id=? AND stock>=?');
                if (!$reserve) throw new RuntimeException('Không thể giữ lại tồn kho.');
                mysqli_stmt_bind_param($reserve, 'iii', $item['quantity'], $item['id'], $item['quantity']);
                if (!mysqli_stmt_execute($reserve) || mysqli_stmt_affected_rows($reserve) !== 1) throw new RuntimeException('Không thể giữ lại tồn kho.');
                mysqli_stmt_close($reserve);
            }
        }
    }

    if ($status !== null && $payment !== null) {
        $update = mysqli_prepare($conn, 'UPDATE orders SET order_status=?,payment_status=? WHERE id=?');
        if (!$update) throw new RuntimeException('Không thể cập nhật đơn hàng.');
        mysqli_stmt_bind_param($update, 'ssi', $status, $payment, $id);
    } elseif ($status !== null) {
        $update = mysqli_prepare($conn, 'UPDATE orders SET order_status=? WHERE id=?');
        if (!$update) throw new RuntimeException('Không thể cập nhật đơn hàng.');
        mysqli_stmt_bind_param($update, 'si', $status, $id);
    } else {
        $update = mysqli_prepare($conn, 'UPDATE orders SET payment_status=? WHERE id=?');
        if (!$update) throw new RuntimeException('Không thể cập nhật đơn hàng.');
        mysqli_stmt_bind_param($update, 'si', $payment, $id);
    }
    if (!mysqli_stmt_execute($update)) throw new RuntimeException('Không thể cập nhật đơn hàng.');
    mysqli_stmt_close($update);
    if (!mysqli_commit($conn)) throw new RuntimeException('Không thể hoàn tất cập nhật đơn hàng.');
    respond(['success' => true, 'message' => 'Đã cập nhật đơn hàng.']);
} catch (OutOfBoundsException $error) {
    mysqli_rollback($conn);
    respond(['success' => false, 'message' => $error->getMessage()], 404);
} catch (DomainException $error) {
    mysqli_rollback($conn);
    respond(['success' => false, 'message' => $error->getMessage()], 422);
} catch (Throwable $error) {
    mysqli_rollback($conn);
    respond(['success' => false, 'message' => $error->getMessage() ?: 'Không thể cập nhật đơn hàng.'], 500);
}
