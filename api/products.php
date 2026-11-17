<?php
require_once __DIR__ . '/../config/db.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET');
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Chỉ chấp nhận phương thức GET.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$categoryValue = $_GET['category_id'] ?? '0';
$queryValue = $_GET['q'] ?? '';
if (!is_scalar($categoryValue) || !is_string($queryValue) || ($categoryValue !== '' && !preg_match('/^[0-9]+$/', (string) $categoryValue))) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Bộ lọc sản phẩm không hợp lệ.'], JSON_UNESCAPED_UNICODE);
    exit;
}
$categoryId = (int) $categoryValue;
$query = trim($queryValue);
if (function_exists('mb_substr')) $query = mb_substr($query, 0, 120, 'UTF-8');
else $query = substr($query, 0, 120);

$sql = "SELECT p.id,p.name,p.slug,p.description,p.price,p.sale_price,p.stock,p.image,p.status,p.category_id,
               c.name AS category_name,c.slug AS category_slug,p.created_at
        FROM products p
        LEFT JOIN categories c ON c.id=p.category_id
        WHERE p.status IN ('active','out_of_stock') AND (p.category_id IS NULL OR c.status='active')";
$types = '';
$params = [];

if ($categoryId > 0) {
    $sql .= ' AND p.category_id=?';
    $types .= 'i';
    $params[] = $categoryId;
}
if ($query !== '') {
    $sql .= ' AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)';
    $types .= 'sss';
    $like = '%' . $query . '%';
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
}
$sql .= ' ORDER BY p.created_at DESC, p.id DESC';

$stmt = mysqli_prepare($conn, $sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Không thể tải danh sách sản phẩm.'], JSON_UNESCAPED_UNICODE);
    exit;
}
if ($types !== '') {
    mysqli_stmt_bind_param($stmt, $types, ...$params);
}
if (!mysqli_stmt_execute($stmt)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Không thể tải danh sách sản phẩm.'], JSON_UNESCAPED_UNICODE);
    exit;
}
$result = mysqli_stmt_get_result($stmt);
$products = [];
while ($product = mysqli_fetch_assoc($result)) {
    $product['id'] = (int) $product['id'];
    $product['category_id'] = $product['category_id'] === null ? null : (int) $product['category_id'];
    $product['price'] = (float) $product['price'];
    $product['sale_price'] = $product['sale_price'] === null ? null : (float) $product['sale_price'];
    $product['stock'] = (int) $product['stock'];
    $products[] = $product;
}
echo json_encode(['success' => true, 'products' => $products], JSON_UNESCAPED_UNICODE);
