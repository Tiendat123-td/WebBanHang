<?php
require_once __DIR__ . '/guard.php';
require_once __DIR__ . '/../../config/db.php';
requireAdmin($conn);

$method = $_SERVER['REQUEST_METHOD'];

function productSlug($value)
{
    $value = function_exists('mb_strtolower') ? mb_strtolower(trim($value), 'UTF-8') : strtolower(trim($value));
    $ascii = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value);
    if ($ascii !== false) $value = $ascii;
    $slug = trim(preg_replace('/[^a-z0-9]+/', '-', strtolower($value)), '-');
    return ($slug !== '' ? $slug : 'product') . '-' . substr(uniqid(), -5);
}

function receiveProductImage()
{
    if (!isset($_FILES['image']) || $_FILES['image']['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    $file = $_FILES['image'];
    if ($file['error'] !== UPLOAD_ERR_OK) {
        respond(['success' => false, 'message' => 'Không thể tải ảnh sản phẩm lên.'], 422);
    }
    if ((int) $file['size'] < 1 || (int) $file['size'] > 5 * 1024 * 1024) {
        respond(['success' => false, 'message' => 'Ảnh phải có dung lượng nhỏ hơn 5 MB.'], 422);
    }

    $imageInfo = @getimagesize($file['tmp_name']);
    $extensions = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp'
    ];
    $mime = $imageInfo['mime'] ?? '';
    if (!$imageInfo || !isset($extensions[$mime])) {
        respond(['success' => false, 'message' => 'Định dạng ảnh không được hỗ trợ. Hãy dùng JPG, PNG, GIF hoặc WebP.'], 422);
    }

    $uploadDirectory = dirname(__DIR__, 2) . '/uploads/products';
    if (!is_dir($uploadDirectory) && !mkdir($uploadDirectory, 0755, true) && !is_dir($uploadDirectory)) {
        respond(['success' => false, 'message' => 'Không thể tạo thư mục lưu ảnh sản phẩm.'], 500);
    }

    $filename = bin2hex(random_bytes(16)) . '.' . $extensions[$mime];
    $destination = $uploadDirectory . '/' . $filename;
    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        respond(['success' => false, 'message' => 'Không thể lưu ảnh sản phẩm.'], 500);
    }

    return 'uploads/products/' . $filename;
}

if ($method === 'GET') {
    $sql = "SELECT p.id,p.name,p.category_id,c.name AS category_name,p.slug,p.description,p.price,p.sale_price,p.stock,p.image,p.status,p.created_at FROM products p LEFT JOIN categories c ON c.id=p.category_id ORDER BY p.id DESC";
    $result = mysqli_query($conn, $sql);
    if (!$result) {
        respond(['success' => false, 'message' => 'Không thể tải sản phẩm.'], 500);
    }
    $products = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $products[] = $row;
    }
    respond(['success' => true, 'products' => $products]);
}

if ($method === 'DELETE') {
    $data = jsonInput();
    $idValue = $data['id'] ?? 0;
    if (!is_scalar($idValue)) respond(['success' => false, 'message' => 'ID không hợp lệ.'], 422);
    $id = (int) $idValue;
    if ($id < 1) {
        respond(['success' => false, 'message' => 'ID không hợp lệ.'], 422);
    }

    $statement = mysqli_prepare($conn, 'DELETE FROM products WHERE id=?');
    if (!$statement) respond(['success' => false, 'message' => 'Không thể chuẩn bị xóa sản phẩm.'], 500);
    mysqli_stmt_bind_param($statement, 'i', $id);
    if (!mysqli_stmt_execute($statement)) {
        respond(['success' => false, 'message' => 'Không thể xóa sản phẩm. Sản phẩm có thể đã nằm trong đơn hàng.'], 409);
    }
    if (mysqli_stmt_affected_rows($statement) < 1) {
        respond(['success' => false, 'message' => 'Không tìm thấy sản phẩm.'], 404);
    }
    respond(['success' => true, 'message' => 'Đã xóa sản phẩm.']);
}

if (!in_array($method, ['POST', 'PUT'], true)) {
    header('Allow: GET, POST, PUT, DELETE');
    respond(['success' => false, 'message' => 'Phương thức không được hỗ trợ.'], 405);
}

$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
$data = stripos($contentType, 'multipart/form-data') !== false ? $_POST : jsonInput();
$idValue = $data['id'] ?? 0;
$nameValue = $data['name'] ?? '';
$priceValue = $data['price'] ?? null;
$saleValue = $data['sale_price'] ?? '';
$categoryValue = $data['category_id'] ?? '';
$stockValue = $data['stock'] ?? null;
$descriptionValue = $data['description'] ?? '';
$status = $data['status'] ?? 'active';
if (!is_scalar($idValue) || ($idValue !== '' && !ctype_digit((string) $idValue)) || !is_string($nameValue) || !is_string($descriptionValue) || !is_string($status) || !is_numeric($priceValue) || !is_numeric($stockValue) || filter_var((string) $stockValue, FILTER_VALIDATE_INT) === false || ($saleValue !== '' && !is_numeric($saleValue)) || ($categoryValue !== '' && !ctype_digit((string) $categoryValue))) {
    respond(['success' => false, 'message' => 'Thông tin sản phẩm không hợp lệ.'], 422);
}
$id = (int) $idValue;
$name = trim($nameValue);
$price = (float) $priceValue;
$salePrice = $saleValue === '' ? null : (float) $saleValue;
$categoryId = $categoryValue === '' ? null : (int) $categoryValue;
$stock = (int) $stockValue;
$description = trim($descriptionValue);
$nameLength = function_exists('mb_strlen') ? mb_strlen($name, 'UTF-8') : strlen($name);
if ($nameLength < 1 || $nameLength > 200 || $price < 0 || $stock < 0 || ($salePrice !== null && ($salePrice < 0 || $salePrice > $price))) {
    respond(['success' => false, 'message' => 'Vui lòng nhập tên (tối đa 200 ký tự), giá và tồn kho hợp lệ; giá khuyến mãi không được lớn hơn giá gốc.'], 422);
}
if (!in_array($status, ['active', 'hidden', 'out_of_stock'], true)) {
    respond(['success' => false, 'message' => 'Trạng thái sản phẩm không hợp lệ.'], 422);
}
if ($categoryId !== null) {
    if ($categoryId < 1) respond(['success' => false, 'message' => 'Danh mục sản phẩm không hợp lệ.'], 422);
    $categoryStmt = mysqli_prepare($conn, 'SELECT id FROM categories WHERE id=? LIMIT 1');
    if (!$categoryStmt) respond(['success' => false, 'message' => 'Không thể kiểm tra danh mục.'], 500);
    mysqli_stmt_bind_param($categoryStmt, 'i', $categoryId);
    if (!mysqli_stmt_execute($categoryStmt)) respond(['success' => false, 'message' => 'Không thể kiểm tra danh mục.'], 500);
    $categoryExists = mysqli_fetch_assoc(mysqli_stmt_get_result($categoryStmt));
    mysqli_stmt_close($categoryStmt);
    if (!$categoryExists) respond(['success' => false, 'message' => 'Danh mục không tồn tại.'], 422);
}

$isUpdate = $method === 'PUT' || $id > 0;
$existingImage = null;
if ($isUpdate) {
    if ($id < 1) {
        respond(['success' => false, 'message' => 'ID sản phẩm không hợp lệ.'], 422);
    }
    $lookup = mysqli_prepare($conn, 'SELECT image FROM products WHERE id=?');
    if (!$lookup) respond(['success' => false, 'message' => 'Không thể kiểm tra sản phẩm.'], 500);
    mysqli_stmt_bind_param($lookup, 'i', $id);
    if (!mysqli_stmt_execute($lookup)) respond(['success' => false, 'message' => 'Không thể kiểm tra sản phẩm.'], 500);
    $existing = mysqli_fetch_assoc(mysqli_stmt_get_result($lookup));
    mysqli_stmt_close($lookup);
    if (!$existing) {
        respond(['success' => false, 'message' => 'Không tìm thấy sản phẩm.'], 404);
    }
    $existingImage = $existing['image'];
}

$uploadedImage = receiveProductImage();
$image = $uploadedImage ?? ($data['image'] ?? ($isUpdate ? $existingImage : null));
if ($image !== null) {
    $image = trim((string) $image);
    if ($image === '') {
        $image = null;
    }
}

if ($isUpdate) {
    $statement = mysqli_prepare($conn, 'UPDATE products SET category_id=?,name=?,description=?,price=?,sale_price=?,stock=?,image=?,status=? WHERE id=?');
    if (!$statement) respond(['success' => false, 'message' => 'Không thể chuẩn bị cập nhật sản phẩm.'], 500);
    mysqli_stmt_bind_param($statement, 'issddissi', $categoryId, $name, $description, $price, $salePrice, $stock, $image, $status, $id);
} else {
    $slug = productSlug($name);
    $statement = mysqli_prepare($conn, 'INSERT INTO products(category_id,name,slug,description,price,sale_price,stock,image,status) VALUES(?,?,?,?,?,?,?,?,?)');
    if (!$statement) respond(['success' => false, 'message' => 'Không thể chuẩn bị thêm sản phẩm.'], 500);
    mysqli_stmt_bind_param($statement, 'isssddiss', $categoryId, $name, $slug, $description, $price, $salePrice, $stock, $image, $status);
}

if (!mysqli_stmt_execute($statement)) {
    if ($uploadedImage !== null) {
        @unlink(dirname(__DIR__, 2) . '/' . $uploadedImage);
    }
    respond(['success' => false, 'message' => $isUpdate ? 'Không thể cập nhật sản phẩm.' : 'Không thể thêm sản phẩm: ' . mysqli_error($conn)], 500);
}

if ($isUpdate && $uploadedImage !== null && $existingImage && strpos($existingImage, 'uploads/products/') === 0) {
    $oldImagePath = dirname(__DIR__, 2) . '/' . $existingImage;
    if (is_file($oldImagePath)) {
        @unlink($oldImagePath);
    }
}

respond([
    'success' => true,
    'message' => $isUpdate ? 'Đã cập nhật sản phẩm.' : 'Đã thêm sản phẩm.',
    'id' => $isUpdate ? $id : mysqli_insert_id($conn)
]);
