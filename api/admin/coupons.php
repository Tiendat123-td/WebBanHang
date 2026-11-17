<?php
require_once __DIR__ . '/guard.php';
require_once __DIR__ . '/../../config/db.php';
requireAdmin($conn);

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') {
    $result = mysqli_query($conn, 'SELECT id,code,description,discount_type,discount_value,min_order,max_discount,usage_limit,usage_count,starts_at,expires_at,status,created_at FROM coupons ORDER BY id DESC');
    if (!$result) respond(['success' => false, 'message' => 'Không tải được mã khuyến mãi.'], 500);
    $coupons = [];
    while ($coupon = mysqli_fetch_assoc($result)) {
        foreach (['id', 'usage_count'] as $key) $coupon[$key] = (int) $coupon[$key];
        foreach (['discount_value', 'min_order'] as $key) $coupon[$key] = (float) $coupon[$key];
        $coupon['max_discount'] = $coupon['max_discount'] === null ? null : (float) $coupon['max_discount'];
        $coupon['usage_limit'] = $coupon['usage_limit'] === null ? null : (int) $coupon['usage_limit'];
        $coupons[] = $coupon;
    }
    respond(['success' => true, 'coupons' => $coupons]);
}
if (!in_array($method, ['POST', 'PUT'], true)) {
    header('Allow: GET, POST, PUT');
    respond(['success' => false, 'message' => 'Phương thức không được hỗ trợ.'], 405);
}
$data = jsonInput();
$idValue = $data['id'] ?? 0;
$codeValue = $data['code'] ?? '';
$descriptionValue = $data['description'] ?? '';
$type = $data['discount_type'] ?? '';
$status = $data['status'] ?? 'active';
if (!is_scalar($idValue) || !is_string($codeValue) || !is_string($descriptionValue) || !is_string($type) || !is_string($status)) {
    respond(['success' => false, 'message' => 'Dữ liệu mã khuyến mãi không hợp lệ.'], 422);
}
$id = (int) $idValue;
$code = strtoupper(trim($codeValue));
$description = trim($descriptionValue);
$allowedTypes = ['percent', 'fixed', 'shipping'];
if (!preg_match('/^[A-Z0-9_-]{3,40}$/', $code)) respond(['success' => false, 'message' => 'Mã gồm 3–40 ký tự chữ, số, gạch ngang hoặc gạch dưới.'], 422);
$descriptionLength = function_exists('mb_strlen') ? mb_strlen($description, 'UTF-8') : strlen($description);
if ($descriptionLength > 200) respond(['success' => false, 'message' => 'Mô tả tối đa 200 ký tự.'], 422);
if (!in_array($type, $allowedTypes, true) || !in_array($status, ['active', 'inactive'], true)) respond(['success' => false, 'message' => 'Loại giảm giá hoặc trạng thái không hợp lệ.'], 422);

$value = $data['discount_value'] ?? 0;
$minimum = $data['min_order'] ?? 0;
$maximum = $data['max_discount'] ?? null;
$limit = $data['usage_limit'] ?? null;
foreach (['discount_value' => $value, 'min_order' => $minimum] as $field => $number) {
    if (!is_scalar($number) || !is_numeric($number) || (float) $number < 0 || (float) $number > 9999999999.99) {
        respond(['success' => false, 'message' => 'Giá trị giảm hoặc đơn tối thiểu không hợp lệ.'], 422);
    }
}
$value = (float) $value;
$minimum = (float) $minimum;
if ($type === 'percent' && ($value <= 0 || $value > 100)) respond(['success' => false, 'message' => 'Phần trăm giảm phải lớn hơn 0 và không quá 100%.'], 422);
if ($type === 'fixed' && $value <= 0) respond(['success' => false, 'message' => 'Số tiền giảm phải lớn hơn 0.'], 422);
if ($type === 'shipping') $value = 0;
if ($maximum === '' || $maximum === null) $maximum = null;
elseif (!is_scalar($maximum) || !is_numeric($maximum) || (float) $maximum <= 0 || (float) $maximum > 9999999999.99) respond(['success' => false, 'message' => 'Mức giảm tối đa không hợp lệ.'], 422);
else $maximum = (float) $maximum;
if ($type !== 'percent') $maximum = null;
if ($limit === '' || $limit === null || (is_scalar($limit) && (string) $limit === '0')) $limit = null;
elseif (!is_scalar($limit) || !preg_match('/^[1-9][0-9]*$/', (string) $limit) || (int) $limit > 2147483647) respond(['success' => false, 'message' => 'Giới hạn lượt dùng phải là số nguyên dương.'], 422);
else $limit = (int) $limit;

$normalizeDate = function ($value) {
    if ($value === '' || $value === null) return null;
    if (!is_string($value) || !preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/', $value)) return false;
    $date = DateTime::createFromFormat('!Y-m-d\TH:i', $value);
    return $date && $date->format('Y-m-d\TH:i') === $value ? $date->format('Y-m-d H:i:s') : false;
};
$startsAt = $normalizeDate($data['starts_at'] ?? null);
$expiresAt = $normalizeDate($data['expires_at'] ?? null);
if ($startsAt === false || $expiresAt === false) respond(['success' => false, 'message' => 'Thời gian hiệu lực không hợp lệ.'], 422);
if ($startsAt !== null && $expiresAt !== null && $expiresAt < $startsAt) respond(['success' => false, 'message' => 'Thời điểm hết hạn phải sau thời điểm bắt đầu.'], 422);

if ($method === 'PUT' && $id < 1) respond(['success' => false, 'message' => 'ID mã khuyến mãi không hợp lệ.'], 422);
if ($method === 'POST') {
    $stmt = mysqli_prepare($conn, 'INSERT INTO coupons(code,description,discount_type,discount_value,min_order,max_discount,usage_limit,starts_at,expires_at,status) VALUES(?,?,?,?,?,?,?,?,?,?)');
    if (!$stmt) respond(['success' => false, 'message' => 'Không thể chuẩn bị lưu mã khuyến mãi.'], 500);
    mysqli_stmt_bind_param($stmt, 'sssdddisss', $code, $description, $type, $value, $minimum, $maximum, $limit, $startsAt, $expiresAt, $status);
} else {
    $stmt = mysqli_prepare($conn, 'UPDATE coupons SET code=?,description=?,discount_type=?,discount_value=?,min_order=?,max_discount=?,usage_limit=?,starts_at=?,expires_at=?,status=? WHERE id=?');
    if (!$stmt) respond(['success' => false, 'message' => 'Không thể chuẩn bị cập nhật mã khuyến mãi.'], 500);
    mysqli_stmt_bind_param($stmt, 'sssdddisssi', $code, $description, $type, $value, $minimum, $maximum, $limit, $startsAt, $expiresAt, $status, $id);
}
if (!mysqli_stmt_execute($stmt)) {
    $errno = mysqli_stmt_errno($stmt);
    mysqli_stmt_close($stmt);
    if ($errno === 1062) respond(['success' => false, 'message' => 'Mã khuyến mãi này đã tồn tại.'], 409);
    respond(['success' => false, 'message' => 'Không thể lưu mã khuyến mãi.'], 500);
}
$affected = mysqli_stmt_affected_rows($stmt);
mysqli_stmt_close($stmt);
if ($method === 'PUT' && $affected < 0) respond(['success' => false, 'message' => 'Không thể cập nhật mã khuyến mãi.'], 500);
if ($method === 'PUT' && $affected === 0) {
    $check = mysqli_prepare($conn, 'SELECT id FROM coupons WHERE id=? LIMIT 1');
    if (!$check) respond(['success' => false, 'message' => 'Không thể kiểm tra mã khuyến mãi.'], 500);
    mysqli_stmt_bind_param($check, 'i', $id);
    if (!mysqli_stmt_execute($check)) respond(['success' => false, 'message' => 'Không thể kiểm tra mã khuyến mãi.'], 500);
    $exists = mysqli_fetch_assoc(mysqli_stmt_get_result($check));
    mysqli_stmt_close($check);
    if (!$exists) respond(['success' => false, 'message' => 'Không tìm thấy mã khuyến mãi.'], 404);
}
respond(['success' => true, 'message' => 'Đã lưu mã khuyến mãi.']);
