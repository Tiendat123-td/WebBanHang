<?php
require_once __DIR__ . '/../auth/common.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../auth/active_user.php';

requireActiveUser($conn, 'Vui lòng đăng nhập để đồng bộ giỏ hàng.');
$userId = (int) $_SESSION['user']['id'];
$method = $_SERVER['REQUEST_METHOD'];
$allowedSizes = ['S', 'M', 'XL'];

if (!in_array($method, ['GET', 'POST', 'PUT', 'DELETE'], true)) {
    header('Allow: GET, POST, PUT, DELETE');
    respond(['success' => false, 'message' => 'Phương thức không được hỗ trợ.'], 405);
}

if ($method === 'GET') {
    $stmt = mysqli_prepare($conn, "SELECT p.id,p.name,p.slug,p.price,p.sale_price,p.image,p.stock,p.status,c.status AS category_status,ci.quantity,ci.size FROM cart_items ci JOIN products p ON p.id=ci.product_id LEFT JOIN categories c ON c.id=p.category_id WHERE ci.user_id=? ORDER BY ci.updated_at DESC");
    if (!$stmt) respond(['success' => false, 'message' => 'Không thể tải giỏ hàng.'], 500);
    mysqli_stmt_bind_param($stmt, 'i', $userId);
    if (!mysqli_stmt_execute($stmt)) {
        mysqli_stmt_close($stmt);
        respond(['success' => false, 'message' => 'Không thể tải giỏ hàng.'], 500);
    }
    $result = mysqli_stmt_get_result($stmt);
    $items = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $basePrice = (float) $row['price'];
        $salePrice = $row['sale_price'] === null ? null : (float) $row['sale_price'];
        $row['id'] = (int) $row['id'];
        $row['stock'] = (int) $row['stock'];
        $row['quantity'] = (int) $row['quantity'];
        $row['price'] = $salePrice !== null && $salePrice >= 0 && $salePrice < $basePrice ? $salePrice : $basePrice;
        $row['oldPrice'] = $row['price'] < $basePrice ? $basePrice : null;
        $row['productUnavailable'] = $row['status'] !== 'active' || $row['stock'] < 1 || ($row['category_status'] !== null && $row['category_status'] !== 'active');
        unset($row['sale_price'], $row['status'], $row['category_status']);
        $items[] = $row;
    }
    mysqli_stmt_close($stmt);
    respond(['success' => true, 'items' => $items]);
}

$data = jsonInput();
if ($method === 'PUT' && array_key_exists('items', $data)) {
    if (!is_array($data['items'])) respond(['success' => false, 'message' => 'Danh sách sản phẩm không hợp lệ.'], 422);
    $variants = [];
    $productTotals = [];
    foreach ($data['items'] as $item) {
        if (!is_array($item)) respond(['success' => false, 'message' => 'Một sản phẩm trong giỏ không hợp lệ.'], 422);
        $rawId = $item['product_id'] ?? $item['id'] ?? 0;
        $rawQuantity = $item['quantity'] ?? 0;
        $size = strtoupper(trim((string) ($item['size'] ?? 'M')));
        if (!is_scalar($rawId) || !is_scalar($rawQuantity) || !in_array($size, $allowedSizes, true)) respond(['success' => false, 'message' => 'Sản phẩm, size hoặc số lượng không hợp lệ.'], 422);
        $itemId = (int) $rawId;
        $itemQuantity = (int) $rawQuantity;
        if ($itemId < 1 || $itemQuantity < 1 || $itemQuantity > 99) respond(['success' => false, 'message' => 'Sản phẩm hoặc số lượng không hợp lệ.'], 422);
        $key = $itemId . ':' . $size;
        $variants[$key] = ($variants[$key] ?? ['id' => $itemId, 'size' => $size, 'quantity' => 0]);
        $variants[$key]['quantity'] += $itemQuantity;
        $productTotals[$itemId] = ($productTotals[$itemId] ?? 0) + $itemQuantity;
        if ($variants[$key]['quantity'] > 99 || $productTotals[$itemId] > 99) respond(['success' => false, 'message' => 'Số lượng sản phẩm vượt giới hạn cho phép.'], 422);
    }

    if (!mysqli_begin_transaction($conn)) respond(['success' => false, 'message' => 'Không thể bắt đầu đồng bộ giỏ hàng.'], 500);
    try {
        foreach ($productTotals as $itemId => $totalQuantity) {
            $productStmt = mysqli_prepare($conn, "SELECT p.stock,p.status,c.status AS category_status FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE p.id=? FOR UPDATE");
            if (!$productStmt) throw new RuntimeException('Không thể kiểm tra sản phẩm.');
            mysqli_stmt_bind_param($productStmt, 'i', $itemId);
            if (!mysqli_stmt_execute($productStmt)) throw new RuntimeException('Không thể kiểm tra sản phẩm.');
            $product = mysqli_fetch_assoc(mysqli_stmt_get_result($productStmt));
            mysqli_stmt_close($productStmt);
            if (!$product || $product['status'] !== 'active' || ($product['category_status'] !== null && $product['category_status'] !== 'active')) throw new DomainException('Có sản phẩm không còn kinh doanh.');
            if ($totalQuantity > (int) $product['stock']) throw new DomainException('Tổng số lượng các size vượt tồn kho hiện tại.');
        }

        $delete = mysqli_prepare($conn, 'DELETE FROM cart_items WHERE user_id=?');
        if (!$delete) throw new RuntimeException('Không thể đồng bộ giỏ hàng.');
        mysqli_stmt_bind_param($delete, 'i', $userId);
        if (!mysqli_stmt_execute($delete)) throw new RuntimeException('Không thể đồng bộ giỏ hàng.');
        mysqli_stmt_close($delete);

        $insert = mysqli_prepare($conn, 'INSERT INTO cart_items(user_id,product_id,quantity,size) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE quantity=VALUES(quantity)');
        if (!$insert) throw new RuntimeException('Không thể đồng bộ giỏ hàng.');
        foreach ($variants as $variant) {
            mysqli_stmt_bind_param($insert, 'iiis', $userId, $variant['id'], $variant['quantity'], $variant['size']);
            if (!mysqli_stmt_execute($insert)) throw new RuntimeException('Không thể đồng bộ giỏ hàng.');
        }
        mysqli_stmt_close($insert);
        if (!mysqli_commit($conn)) throw new RuntimeException('Không thể hoàn tất đồng bộ giỏ hàng.');
        respond(['success' => true, 'message' => 'Đã đồng bộ giỏ hàng.']);
    } catch (DomainException $error) {
        mysqli_rollback($conn);
        respond(['success' => false, 'message' => $error->getMessage()], 422);
    } catch (Throwable $error) {
        mysqli_rollback($conn);
        respond(['success' => false, 'message' => $error->getMessage() ?: 'Không thể đồng bộ giỏ hàng.'], 500);
    }
}

$productIdValue = $data['product_id'] ?? $data['id'] ?? null;
if ($productIdValue !== null && !is_scalar($productIdValue)) respond(['success' => false, 'message' => 'ID sản phẩm không hợp lệ.'], 422);
$productId = (int) ($productIdValue ?? 0);
$size = strtoupper(trim((string) ($data['size'] ?? 'M')));
if ($method === 'DELETE') {
    if ($productId > 0) {
        $hasSize = array_key_exists('size', $data);
        if ($hasSize && !in_array($size, $allowedSizes, true)) respond(['success' => false, 'message' => 'Size không hợp lệ.'], 422);
        $sql = $hasSize ? 'DELETE FROM cart_items WHERE user_id=? AND product_id=? AND size=?' : 'DELETE FROM cart_items WHERE user_id=? AND product_id=?';
        $stmt = mysqli_prepare($conn, $sql);
        if (!$stmt) respond(['success' => false, 'message' => 'Không thể xóa sản phẩm khỏi giỏ hàng.'], 500);
        if ($hasSize) mysqli_stmt_bind_param($stmt, 'iis', $userId, $productId, $size);
        else mysqli_stmt_bind_param($stmt, 'ii', $userId, $productId);
        if (!mysqli_stmt_execute($stmt)) {
            mysqli_stmt_close($stmt);
            respond(['success' => false, 'message' => 'Không thể xóa sản phẩm khỏi giỏ hàng.'], 500);
        }
        $deleted = mysqli_stmt_affected_rows($stmt);
        mysqli_stmt_close($stmt);
        if ($deleted < 1) respond(['success' => false, 'message' => 'Sản phẩm không có trong giỏ hàng.'], 404);
        respond(['success' => true, 'message' => 'Đã xóa sản phẩm khỏi giỏ hàng.']);
    }
    $stmt = mysqli_prepare($conn, 'DELETE FROM cart_items WHERE user_id=?');
    if (!$stmt) respond(['success' => false, 'message' => 'Không thể xóa giỏ hàng.'], 500);
    mysqli_stmt_bind_param($stmt, 'i', $userId);
    if (!mysqli_stmt_execute($stmt)) respond(['success' => false, 'message' => 'Không thể xóa giỏ hàng.'], 500);
    mysqli_stmt_close($stmt);
    respond(['success' => true, 'message' => 'Đã xóa toàn bộ giỏ hàng.']);
}

$quantityValue = $data['quantity'] ?? 0;
if (!is_scalar($quantityValue) || !in_array($size, $allowedSizes, true)) respond(['success' => false, 'message' => 'Size hoặc số lượng không hợp lệ.'], 422);
$quantity = (int) $quantityValue;
if ($productId < 1 || $quantity < 1 || $quantity > 99) respond(['success' => false, 'message' => 'Sản phẩm hoặc số lượng không hợp lệ.'], 422);

if (!mysqli_begin_transaction($conn)) respond(['success' => false, 'message' => 'Không thể bắt đầu cập nhật giỏ hàng.'], 500);
try {
    $productStmt = mysqli_prepare($conn, "SELECT p.id,p.stock,p.status,c.status AS category_status FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE p.id=? FOR UPDATE");
    if (!$productStmt) throw new RuntimeException('Không thể kiểm tra sản phẩm.');
    mysqli_stmt_bind_param($productStmt, 'i', $productId);
    if (!mysqli_stmt_execute($productStmt)) throw new RuntimeException('Không thể kiểm tra sản phẩm.');
    $product = mysqli_fetch_assoc(mysqli_stmt_get_result($productStmt));
    mysqli_stmt_close($productStmt);
    if (!$product) throw new DomainException('Sản phẩm không tồn tại.');
    if ($product['status'] !== 'active' || ($product['category_status'] !== null && $product['category_status'] !== 'active')) throw new DomainException('Sản phẩm hiện không kinh doanh.');

    $currentStmt = mysqli_prepare($conn, 'SELECT size,quantity FROM cart_items WHERE user_id=? AND product_id=? FOR UPDATE');
    if (!$currentStmt) throw new RuntimeException('Không thể kiểm tra giỏ hàng.');
    mysqli_stmt_bind_param($currentStmt, 'ii', $userId, $productId);
    if (!mysqli_stmt_execute($currentStmt)) throw new RuntimeException('Không thể kiểm tra giỏ hàng.');
    $currentResult = mysqli_stmt_get_result($currentStmt);
    $currentTotal = 0;
    $variantQuantity = 0;
    $variantExists = false;
    while ($row = mysqli_fetch_assoc($currentResult)) {
        $currentTotal += (int) $row['quantity'];
        if ($row['size'] === $size) {
            $variantQuantity = (int) $row['quantity'];
            $variantExists = true;
        }
    }
    mysqli_stmt_close($currentStmt);

    if ($method === 'POST') {
        $newVariantQuantity = $variantQuantity + $quantity;
        $newTotal = $currentTotal + $quantity;
    } else {
        if (!$variantExists) throw new DomainException('Sản phẩm không có trong giỏ hàng.');
        $newVariantQuantity = $quantity;
        $newTotal = $currentTotal - $variantQuantity + $quantity;
    }
    if ($newVariantQuantity > 99 || $newTotal > (int) $product['stock']) throw new DomainException('Tổng số lượng các size vượt tồn kho hiện tại.');

    $stmt = mysqli_prepare($conn, 'INSERT INTO cart_items(user_id,product_id,quantity,size) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE quantity=VALUES(quantity)');
    if (!$stmt) throw new RuntimeException('Không thể cập nhật giỏ hàng.');
    mysqli_stmt_bind_param($stmt, 'iiis', $userId, $productId, $newVariantQuantity, $size);
    if (!mysqli_stmt_execute($stmt)) {
        mysqli_stmt_close($stmt);
        throw new RuntimeException('Không thể cập nhật giỏ hàng.');
    }
    mysqli_stmt_close($stmt);
    if (!mysqli_commit($conn)) throw new RuntimeException('Không thể hoàn tất cập nhật giỏ hàng.');
    respond(['success' => true, 'message' => 'Đã cập nhật giỏ hàng.']);
} catch (DomainException $error) {
    mysqli_rollback($conn);
    $status = $error->getMessage() === 'Sản phẩm không tồn tại.' ? 404 : 422;
    respond(['success' => false, 'message' => $error->getMessage()], $status);
} catch (Throwable $error) {
    mysqli_rollback($conn);
    respond(['success' => false, 'message' => $error->getMessage() ?: 'Không thể cập nhật giỏ hàng.'], 500);
}
