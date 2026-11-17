<?php
require_once __DIR__ . '/../auth/common.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../coupon_helpers.php';
require_once __DIR__ . '/../auth/active_user.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(['success' => false, 'message' => 'Chỉ chấp nhận POST.'], 405);
}
requireActiveUser($conn, 'Vui lòng đăng nhập trước khi đặt hàng.');

$data = jsonInput();
$name = $data['recipient_name'] ?? '';
$phone = $data['recipient_phone'] ?? '';
$address = $data['shipping_address'] ?? '';
$note = $data['note'] ?? '';
$paymentMethod = $data['payment_method'] ?? 'cod';
$items = $data['items'] ?? [];
$couponInput = $data['coupon_code'] ?? '';
if (!is_string($name) || !is_string($phone) || !is_string($address) || !is_string($note) || !is_string($paymentMethod) || !is_string($couponInput) || !is_array($items)) {
    respond(['success' => false, 'message' => 'Dữ liệu đặt hàng không hợp lệ.'], 422);
}
$name = trim($name);
$phone = trim($phone);
$address = trim($address);
$note = trim($note);
$couponCode = strtoupper(trim($couponInput));
$nameLength = function_exists('mb_strlen') ? mb_strlen($name, 'UTF-8') : strlen($name);
if ($nameLength < 2 || $nameLength > 120 || !preg_match('/^0[35789][0-9]{8}$/', $phone) || $address === '' || strlen($address) > 500) {
    respond(['success' => false, 'message' => 'Vui lòng kiểm tra họ tên, số điện thoại và địa chỉ nhận hàng.'], 422);
}
if (!in_array($paymentMethod, ['cod', 'bank_transfer', 'online'], true)) {
    respond(['success' => false, 'message' => 'Phương thức thanh toán không hợp lệ.'], 422);
}
if ($couponCode !== '' && !preg_match('/^[A-Z0-9_-]{3,40}$/', $couponCode)) {
    respond(['success' => false, 'message' => 'Mã khuyến mãi không hợp lệ.'], 422);
}
if (!$items) {
    respond(['success' => false, 'message' => 'Giỏ hàng đang trống.'], 422);
}

$quantities = [];
foreach ($items as $item) {
    if (!is_array($item)) respond(['success' => false, 'message' => 'Sản phẩm trong giỏ không hợp lệ.'], 422);
    $rawId = $item['id'] ?? $item['product_id'] ?? 0;
    $rawQuantity = $item['quantity'] ?? 0;
    $size = strtoupper(trim((string) ($item['size'] ?? 'M')));
    if (!is_scalar($rawId) || !is_scalar($rawQuantity) || !in_array($size, ['S', 'M', 'XL'], true)) respond(['success' => false, 'message' => 'Sản phẩm, size hoặc số lượng không hợp lệ.'], 422);
    $productId = (int) $rawId;
    $quantity = (int) $rawQuantity;
    if ($productId < 1 || $quantity < 1 || $quantity > 99) respond(['success' => false, 'message' => 'Sản phẩm hoặc số lượng không hợp lệ.'], 422);
    $quantities[$productId] = $quantities[$productId] ?? [];
    $quantities[$productId][$size] = ($quantities[$productId][$size] ?? 0) + $quantity;
    if (array_sum($quantities[$productId]) > 99) respond(['success' => false, 'message' => 'Số lượng sản phẩm vượt giới hạn cho phép.'], 422);
}

if (!mysqli_begin_transaction($conn)) {
    respond(['success' => false, 'message' => 'Không thể bắt đầu xử lý đơn hàng.'], 500);
}
try {
    $subtotal = 0.0;
    $validatedItems = [];
    foreach ($quantities as $productId => $variants) {
        $quantity = array_sum($variants);
        $productStmt = mysqli_prepare($conn, "SELECT p.id,p.name,p.price,p.sale_price,p.stock FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE p.id=? AND p.status='active' AND (p.category_id IS NULL OR c.status='active') FOR UPDATE");
        if (!$productStmt) throw new RuntimeException('Không thể kiểm tra sản phẩm.');
        mysqli_stmt_bind_param($productStmt, 'i', $productId);
        if (!mysqli_stmt_execute($productStmt)) throw new RuntimeException('Không thể kiểm tra sản phẩm.');
        $product = mysqli_fetch_assoc(mysqli_stmt_get_result($productStmt));
        mysqli_stmt_close($productStmt);
        if (!$product) throw new DomainException('Có sản phẩm không còn kinh doanh.');
        if ($quantity > (int) $product['stock']) throw new DomainException('Sản phẩm ' . $product['name'] . ' không đủ tồn kho.');

        $basePrice = (float) $product['price'];
        $salePrice = $product['sale_price'] === null ? null : (float) $product['sale_price'];
        $price = $salePrice !== null && $salePrice >= 0 && $salePrice < $basePrice ? $salePrice : $basePrice;
        $subtotal += $price * $quantity;
        foreach ($variants as $size => $variantQuantity) {
            $validatedItems[] = ['id' => (int) $product['id'], 'name' => $product['name'], 'size' => $size, 'price' => $price, 'quantity' => $variantQuantity];
        }
    }

    $coupon = null;
    $couponId = null;
    $couponCodeToSave = null;
    $discount = 0.0;
    $shippingFee = $subtotal >= 500000 ? 0.0 : 30000.0;
    if ($couponCode !== '') {
        $coupon = loadCouponForCheckout($conn, $couponCode, true);
        $couponCalculation = calculateCouponOrder($coupon, $subtotal)['coupon'];
        $couponId = $couponCalculation['id'];
        $couponCodeToSave = $couponCalculation['code'];
        $shippingFee = $couponCalculation['shipping_fee'];
        $discount = $couponCalculation['discount_amount'];
    }
    $total = max(0, $subtotal + $shippingFee - $discount);
    $orderCode = 'DTS' . date('ymd') . strtoupper(bin2hex(random_bytes(3)));
    $userId = (int) $_SESSION['user']['id'];

    $orderStmt = mysqli_prepare($conn, 'INSERT INTO orders(order_code,user_id,recipient_name,recipient_phone,shipping_address,note,subtotal,shipping_fee,discount,total,coupon_id,coupon_code,payment_method) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)');
    if (!$orderStmt) throw new RuntimeException('Không thể chuẩn bị đơn hàng.');
    mysqli_stmt_bind_param($orderStmt, 'sissssddddiss', $orderCode, $userId, $name, $phone, $address, $note, $subtotal, $shippingFee, $discount, $total, $couponId, $couponCodeToSave, $paymentMethod);
    if (!mysqli_stmt_execute($orderStmt)) throw new RuntimeException('Không thể tạo đơn hàng.');
    $orderId = (int) mysqli_insert_id($conn);
    mysqli_stmt_close($orderStmt);

    if ($couponId !== null) {
        $usageStmt = mysqli_prepare($conn, 'UPDATE coupons SET usage_count=usage_count+1 WHERE id=? AND (usage_limit IS NULL OR usage_count<usage_limit)');
        if (!$usageStmt) throw new RuntimeException('Không thể cập nhật lượt dùng mã khuyến mãi.');
        mysqli_stmt_bind_param($usageStmt, 'i', $couponId);
        if (!mysqli_stmt_execute($usageStmt) || mysqli_stmt_affected_rows($usageStmt) !== 1) throw new DomainException('Mã khuyến mãi vừa hết lượt sử dụng.');
        mysqli_stmt_close($usageStmt);
    }

    foreach ($validatedItems as $item) {
        $lineTotal = $item['price'] * $item['quantity'];
        $itemStmt = mysqli_prepare($conn, 'INSERT INTO order_items(order_id,product_id,product_name,size,unit_price,quantity,line_total) VALUES(?,?,?,?,?,?,?)');
        if (!$itemStmt) throw new RuntimeException('Không thể chuẩn bị chi tiết đơn hàng.');
        mysqli_stmt_bind_param($itemStmt, 'iissdid', $orderId, $item['id'], $item['name'], $item['size'], $item['price'], $item['quantity'], $lineTotal);
        if (!mysqli_stmt_execute($itemStmt)) throw new RuntimeException('Không thể lưu chi tiết đơn hàng.');
        mysqli_stmt_close($itemStmt);

        $stockStmt = mysqli_prepare($conn, 'UPDATE products SET stock=stock-? WHERE id=? AND stock>=?');
        if (!$stockStmt) throw new RuntimeException('Không thể chuẩn bị cập nhật tồn kho.');
        mysqli_stmt_bind_param($stockStmt, 'iii', $item['quantity'], $item['id'], $item['quantity']);
        if (!mysqli_stmt_execute($stockStmt) || mysqli_stmt_affected_rows($stockStmt) !== 1) throw new RuntimeException('Không thể cập nhật tồn kho.');
        mysqli_stmt_close($stockStmt);
    }

    $cartStmt = mysqli_prepare($conn, 'DELETE FROM cart_items WHERE user_id=?');
    if (!$cartStmt) throw new RuntimeException('Không thể xóa giỏ hàng sau khi đặt.');
    mysqli_stmt_bind_param($cartStmt, 'i', $userId);
    if (!mysqli_stmt_execute($cartStmt)) throw new RuntimeException('Không thể xóa giỏ hàng sau khi đặt.');
    mysqli_stmt_close($cartStmt);
    if (!mysqli_commit($conn)) throw new RuntimeException('Không thể hoàn tất đơn hàng.');

    respond(['success' => true, 'message' => 'Đặt hàng thành công.', 'order' => [
        'id' => $orderId,
        'order_code' => $orderCode,
        'subtotal' => $subtotal,
        'shipping_fee' => $shippingFee,
        'discount' => $discount,
        'coupon_code' => $couponCodeToSave,
        'total' => $total,
        'order_status' => 'pending'
    ]]);
} catch (DomainException $error) {
    mysqli_rollback($conn);
    respond(['success' => false, 'message' => $error->getMessage()], 422);
} catch (Throwable $error) {
    mysqli_rollback($conn);
    respond(['success' => false, 'message' => $error->getMessage() ?: 'Không thể tạo đơn hàng.'], 500);
}
