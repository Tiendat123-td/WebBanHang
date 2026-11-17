<?php
require_once __DIR__ . '/auth/common.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/coupon_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(['success' => false, 'message' => 'Chỉ chấp nhận POST.'], 405);
}
$data = jsonInput();
$rawCode = $data['code'] ?? '';
$rawSubtotal = $data['subtotal'] ?? null;
if (!is_string($rawCode) || !is_scalar($rawSubtotal) || !is_numeric($rawSubtotal)) {
    respond(['success' => false, 'message' => 'Mã khuyến mãi hoặc giá trị đơn hàng không hợp lệ.'], 422);
}
$code = strtoupper(trim($rawCode));
$subtotal = (float) $rawSubtotal;
if (!preg_match('/^[A-Z0-9_-]{3,40}$/', $code) || $subtotal < 0 || $subtotal > 100000000000) {
    respond(['success' => false, 'message' => 'Mã khuyến mãi hoặc giá trị đơn hàng không hợp lệ.'], 422);
}
try {
    $coupon = loadCouponForCheckout($conn, $code);
    respond(['success' => true] + calculateCouponOrder($coupon, $subtotal));
} catch (DomainException $error) {
    respond(['success' => false, 'message' => $error->getMessage()], 422);
} catch (Throwable $error) {
    respond(['success' => false, 'message' => 'Không thể kiểm tra mã khuyến mãi.'], 500);
}
