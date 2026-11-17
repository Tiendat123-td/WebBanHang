<?php
require_once __DIR__ . '/guard.php';
require_once __DIR__ . '/../../config/db.php';
requireAdmin($conn);

function categorySlug($value) {
    $value = function_exists('mb_strtolower') ? mb_strtolower(trim($value), 'UTF-8') : strtolower(trim($value));
    $ascii = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value);
    if ($ascii !== false) $value = $ascii;
    $slug = trim(preg_replace('/[^a-z0-9]+/', '-', strtolower($value)), '-');
    return ($slug !== '' ? $slug : 'category') . '-' . substr(uniqid(), -5);
}

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') {
    $result = mysqli_query($conn, 'SELECT c.id,c.name,c.slug,c.description,c.status,COUNT(p.id) AS product_count FROM categories c LEFT JOIN products p ON p.category_id=c.id GROUP BY c.id ORDER BY c.id DESC');
    if (!$result) respond(['success' => false, 'message' => 'Không tải được danh mục.'], 500);
    $categories = [];
    while ($category = mysqli_fetch_assoc($result)) {
        $category['id'] = (int) $category['id'];
        $category['product_count'] = (int) $category['product_count'];
        $categories[] = $category;
    }
    respond(['success' => true, 'categories' => $categories]);
}
if (!in_array($method, ['POST', 'PUT', 'DELETE'], true)) {
    header('Allow: GET, POST, PUT, DELETE');
    respond(['success' => false, 'message' => 'Phương thức không được hỗ trợ.'], 405);
}

$data = jsonInput();
$idValue = $data['id'] ?? 0;
if (!is_scalar($idValue)) respond(['success' => false, 'message' => 'ID danh mục không hợp lệ.'], 422);
$id = (int) $idValue;
if ($method === 'DELETE') {
    if ($id < 1) respond(['success' => false, 'message' => 'ID không hợp lệ.'], 422);
    $stmt = mysqli_prepare($conn, 'DELETE FROM categories WHERE id=?');
    if (!$stmt) respond(['success' => false, 'message' => 'Không thể chuẩn bị xóa danh mục.'], 500);
    mysqli_stmt_bind_param($stmt, 'i', $id);
    if (!mysqli_stmt_execute($stmt)) {
        mysqli_stmt_close($stmt);
        respond(['success' => false, 'message' => 'Không thể xóa danh mục.'], 409);
    }
    $deleted = mysqli_stmt_affected_rows($stmt);
    mysqli_stmt_close($stmt);
    if ($deleted < 1) respond(['success' => false, 'message' => 'Không tìm thấy danh mục.'], 404);
    respond(['success' => true, 'message' => 'Đã xóa danh mục.']);
}

$nameValue = $data['name'] ?? '';
if (!is_string($nameValue)) {
    respond(['success' => false, 'message' => 'Tên danh mục không hợp lệ.'], 422);
}
$name = trim($nameValue);
$nameLength = function_exists('mb_strlen') ? mb_strlen($name, 'UTF-8') : strlen($name);
if ($nameLength < 1 || $nameLength > 120) respond(['success' => false, 'message' => 'Tên danh mục phải từ 1 đến 120 ký tự.'], 422);

if ($method === 'POST') {
    $slug = categorySlug($name);
    $description = '';
    $status = 'active';
    $stmt = mysqli_prepare($conn, 'INSERT INTO categories(name,slug,description,status) VALUES(?,?,?,?)');
    if (!$stmt) respond(['success' => false, 'message' => 'Không thể chuẩn bị lưu danh mục.'], 500);
    mysqli_stmt_bind_param($stmt, 'ssss', $name, $slug, $description, $status);
} else {
    if ($id < 1) respond(['success' => false, 'message' => 'ID không hợp lệ.'], 422);
    $slug = categorySlug($name);
    $stmt = mysqli_prepare($conn, 'UPDATE categories SET name=?,slug=? WHERE id=?');
    if (!$stmt) respond(['success' => false, 'message' => 'Không thể chuẩn bị cập nhật danh mục.'], 500);
    mysqli_stmt_bind_param($stmt, 'ssi', $name, $slug, $id);
}
if (!mysqli_stmt_execute($stmt)) {
    mysqli_stmt_close($stmt);
    respond(['success' => false, 'message' => 'Không thể lưu danh mục.'], 409);
}
if ($method === 'PUT' && mysqli_stmt_affected_rows($stmt) < 0) {
    mysqli_stmt_close($stmt);
    respond(['success' => false, 'message' => 'Không thể cập nhật danh mục.'], 500);
}
mysqli_stmt_close($stmt);
if ($method === 'PUT') {
    $find = mysqli_prepare($conn, 'SELECT id FROM categories WHERE id=? LIMIT 1');
    if (!$find) respond(['success' => false, 'message' => 'Không thể xác minh danh mục.'], 500);
    mysqli_stmt_bind_param($find, 'i', $id);
    if (!mysqli_stmt_execute($find)) respond(['success' => false, 'message' => 'Không thể xác minh danh mục.'], 500);
    $exists = mysqli_fetch_assoc(mysqli_stmt_get_result($find));
    mysqli_stmt_close($find);
    if (!$exists) respond(['success' => false, 'message' => 'Không tìm thấy danh mục.'], 404);
}
respond(['success' => true, 'message' => 'Đã lưu danh mục.']);
