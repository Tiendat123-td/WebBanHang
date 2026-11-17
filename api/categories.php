<?php
require_once __DIR__ . '/../config/db.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET');
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Chỉ chấp nhận phương thức GET.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$result = mysqli_query(
    $conn,
    "SELECT id,name,slug FROM categories WHERE status='active' ORDER BY name ASC"
);
if (!$result) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Không thể tải danh mục.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$categories = [];
while ($category = mysqli_fetch_assoc($result)) {
    $category['id'] = (int) $category['id'];
    $categories[] = $category;
}

echo json_encode(['success' => true, 'categories' => $categories], JSON_UNESCAPED_UNICODE);
