<?php
require_once __DIR__ . '/auth/common.php';

function loadCouponForCheckout($conn, $code, $forUpdate = false) {
    $sql = "SELECT id,code,description,discount_type,discount_value,min_order,max_discount,usage_limit,usage_count,status,(starts_at IS NULL OR starts_at<=NOW()) AS started,(expires_at IS NULL OR expires_at>=NOW()) AS not_expired FROM coupons WHERE code=? LIMIT 1";
    if ($forUpdate) $sql .= ' FOR UPDATE';
    $stmt = mysqli_prepare($conn, $sql);
    if (!$stmt) throw new RuntimeException('Không thể kiểm tra mã khuyến mãi.');
    mysqli_stmt_bind_param($stmt, 's', $code);
    if (!mysqli_stmt_execute($stmt)) {
        mysqli_stmt_close($stmt);
        throw new RuntimeException('Không thể kiểm tra mã khuyến mãi.');
    }
    $coupon = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));
    mysqli_stmt_close($stmt);
    if (!$coupon || $coupon['status'] === 'inactive') throw new DomainException('Mã khuyến mãi không tồn tại hoặc đã tạm ngưng.');
    if (!(int) $coupon['started']) throw new DomainException('Mã khuyến mãi chưa đến thời gian sử dụng.');
    if (!(int) $coupon['not_expired']) throw new DomainException('Mã khuyến mãi đã hết hạn.');
    if ($coupon['usage_limit'] !== null && (int) $coupon['usage_count'] >= (int) $coupon['usage_limit']) {
        throw new DomainException('Mã khuyến mãi đã hết lượt sử dụng.');
    }
    return $coupon;
}

function calculateCouponOrder($coupon, $subtotal) {
    $subtotal = max(0, (float) $subtotal);
    if ($subtotal < (float) $coupon['min_order']) throw new DomainException('Đơn hàng chưa đạt giá trị tối thiểu để dùng mã này.');
    $standardShipping = 30000.0;
    $shippingFee = $subtotal >= 500000 ? 0.0 : $standardShipping;
    $discount = 0.0;
    $shippingDiscount = 0.0;
    $type = $coupon['discount_type'];
    $value = (float) $coupon['discount_value'];
    if ($type === 'percent') {
        $discount = round($subtotal * $value / 100);
        if ($coupon['max_discount'] !== null) $discount = min($discount, (float) $coupon['max_discount']);
    } elseif ($type === 'fixed') {
        $discount = min($subtotal, $value);
    } elseif ($type === 'shipping') {
        if ($shippingFee <= 0) throw new DomainException('Đơn hàng đã được miễn phí vận chuyển.');
        $shippingDiscount = $shippingFee;
        $shippingFee = 0.0;
    }
    $discount = min($subtotal, max(0, $discount));
    return [
        'coupon' => [
            'id' => (int) $coupon['id'],
            'code' => $coupon['code'],
            'description' => $coupon['description'],
            'discount_type' => $type,
            'discount_value' => $value,
            'min_order' => (float) $coupon['min_order'],
            'max_discount' => $coupon['max_discount'] === null ? null : (float) $coupon['max_discount'],
            'discount_amount' => $discount,
            'shipping_discount' => $shippingDiscount,
            'shipping_fee' => $shippingFee,
            'subtotal' => $subtotal,
            'total' => max(0, $subtotal + $shippingFee - $discount)
        ]
    ];
}
