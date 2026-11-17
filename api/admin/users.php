<?php
require_once __DIR__ . '/guard.php';
require_once __DIR__ . '/../../config/db.php';
requireAdmin($conn);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $queryValue = $_GET['q'] ?? '';
    $statusValue = $_GET['status'] ?? 'all';
    $pageValue = $_GET['page'] ?? 1;
    $perPageValue = $_GET['per_page'] ?? 20;
    if (!is_string($queryValue) || !is_string($statusValue) || !is_scalar($pageValue) || !is_scalar($perPageValue)) {
        respond(['success' => false, 'message' => 'Bộ lọc người dùng không hợp lệ.'], 422);
    }
    $query = trim($queryValue);
    if (function_exists('mb_substr')) {
        $query = mb_substr($query, 0, 120, 'UTF-8');
    } else {
        $query = substr($query, 0, 120);
    }
    $status = $statusValue;
    if (!in_array($status, ['all', 'active', 'locked', 'pending'], true)) {
        respond(['success' => false, 'message' => 'Bộ lọc trạng thái không hợp lệ.'], 422);
    }

    $page = max(1, (int) $pageValue);
    $perPage = min(100, max(1, (int) $perPageValue));
    $search = '%' . $query . '%';

    $count = mysqli_prepare($conn, "SELECT COUNT(*) AS total FROM users WHERE role='user' AND (?='' OR full_name LIKE ? OR email LIKE ? OR COALESCE(phone,'') LIKE ?) AND (?='all' OR status=?)");
    if (!$count) {
        respond(['success' => false, 'message' => 'Không thể chuẩn bị truy vấn người dùng.'], 500);
    }
    mysqli_stmt_bind_param($count, 'ssssss', $query, $search, $search, $search, $status, $status);
    if (!mysqli_stmt_execute($count)) {
        respond(['success' => false, 'message' => 'Không thể tải danh sách người dùng.'], 500);
    }
    $totalRow = mysqli_fetch_assoc(mysqli_stmt_get_result($count));
    $total = (int) ($totalRow['total'] ?? 0);
    mysqli_stmt_close($count);

    $totalPages = max(1, (int) ceil($total / $perPage));
    $page = min($page, $totalPages);
    $offset = ($page - 1) * $perPage;
    $stmt = mysqli_prepare($conn, "SELECT u.id,u.full_name,u.email,u.phone,u.status,u.created_at,COUNT(DISTINCT o.id) AS order_count FROM users u LEFT JOIN orders o ON o.user_id=u.id WHERE u.role='user' AND (?='' OR u.full_name LIKE ? OR u.email LIKE ? OR COALESCE(u.phone,'') LIKE ?) AND (?='all' OR u.status=?) GROUP BY u.id,u.full_name,u.email,u.phone,u.status,u.created_at ORDER BY u.created_at DESC,u.id DESC LIMIT ? OFFSET ?");
    if (!$stmt) {
        respond(['success' => false, 'message' => 'Không thể chuẩn bị danh sách người dùng.'], 500);
    }
    mysqli_stmt_bind_param($stmt, 'ssssssii', $query, $search, $search, $search, $status, $status, $perPage, $offset);
    if (!mysqli_stmt_execute($stmt)) {
        respond(['success' => false, 'message' => 'Không thể tải danh sách người dùng.'], 500);
    }
    $result = mysqli_stmt_get_result($stmt);
    $users = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $row['id'] = (int) $row['id'];
        $row['order_count'] = (int) $row['order_count'];
        $users[] = $row;
    }
    mysqli_stmt_close($stmt);

    respond([
        'success' => true,
        'users' => $users,
        'pagination' => [
            'page' => $page,
            'per_page' => $perPage,
            'total' => $total,
            'total_pages' => $totalPages
        ]
    ]);
}

if ($method === 'PUT') {
    $data = jsonInput();
    $idValue = $data['id'] ?? 0;
    $status = $data['status'] ?? '';
    if (!is_scalar($idValue) || !is_string($status)) {
        respond(['success' => false, 'message' => 'Dữ liệu cập nhật tài khoản không hợp lệ.'], 422);
    }
    $id = (int) $idValue;
    if ($id < 1) {
        respond(['success' => false, 'message' => 'ID người dùng không hợp lệ.'], 422);
    }
    if (!in_array($status, ['active', 'locked'], true)) {
        respond(['success' => false, 'message' => 'Trạng thái tài khoản không hợp lệ.'], 422);
    }

    $find = mysqli_prepare($conn, "SELECT status FROM users WHERE id=? AND role='user' LIMIT 1");
    if (!$find) {
        respond(['success' => false, 'message' => 'Không thể kiểm tra tài khoản.'], 500);
    }
    mysqli_stmt_bind_param($find, 'i', $id);
    if (!mysqli_stmt_execute($find)) {
        respond(['success' => false, 'message' => 'Không thể kiểm tra tài khoản.'], 500);
    }
    $user = mysqli_fetch_assoc(mysqli_stmt_get_result($find));
    mysqli_stmt_close($find);
    if (!$user) {
        respond(['success' => false, 'message' => 'Không tìm thấy tài khoản khách hàng.'], 404);
    }
    if ($user['status'] === $status) {
        respond(['success' => true, 'message' => $status === 'locked' ? 'Tài khoản đã được khóa.' : 'Tài khoản đang hoạt động.']);
    }

    $update = mysqli_prepare($conn, "UPDATE users SET status=? WHERE id=? AND role='user'");
    if (!$update) {
        respond(['success' => false, 'message' => 'Không thể chuẩn bị cập nhật tài khoản.'], 500);
    }
    mysqli_stmt_bind_param($update, 'si', $status, $id);
    if (!mysqli_stmt_execute($update)) {
        respond(['success' => false, 'message' => 'Không thể cập nhật trạng thái tài khoản.'], 500);
    }
    mysqli_stmt_close($update);
    $message = $status === 'locked' ? 'Đã khóa tài khoản khách hàng.' : ($user['status'] === 'pending' ? 'Đã duyệt tài khoản khách hàng.' : 'Đã mở khóa tài khoản khách hàng.');
    respond(['success' => true, 'message' => $message]);
}

if ($method === 'DELETE') {
    $data = jsonInput();
    $idValue = $data['id'] ?? 0;
    if (!is_scalar($idValue)) {
        respond(['success' => false, 'message' => 'ID người dùng không hợp lệ.'], 422);
    }
    $id = (int) $idValue;
    if ($id < 1) {
        respond(['success' => false, 'message' => 'ID người dùng không hợp lệ.'], 422);
    }
    $orderUserColumn = mysqli_query($conn, "SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='user_id' LIMIT 1");
    if (!$orderUserColumn) {
        respond(['success' => false, 'message' => 'Không thể kiểm tra cấu hình cơ sở dữ liệu.'], 500);
    }
    $orderUserColumnInfo = mysqli_fetch_assoc($orderUserColumn);
    if (!$orderUserColumnInfo || $orderUserColumnInfo['IS_NULLABLE'] !== 'YES') {
        respond(['success' => false, 'message' => 'Hãy chạy database/admin_account_delete_migration.sql trước khi xóa tài khoản.'], 409);
    }
    if (!mysqli_begin_transaction($conn)) {
        respond(['success' => false, 'message' => 'Không thể bắt đầu xóa tài khoản.'], 500);
    }

    try {
        $find = mysqli_prepare($conn, "SELECT id FROM users WHERE id=? AND role='user' LIMIT 1 FOR UPDATE");
        if (!$find) throw new RuntimeException('Không thể kiểm tra tài khoản.');
        mysqli_stmt_bind_param($find, 'i', $id);
        if (!mysqli_stmt_execute($find)) throw new RuntimeException('Không thể kiểm tra tài khoản.');
        $user = mysqli_fetch_assoc(mysqli_stmt_get_result($find));
        mysqli_stmt_close($find);
        if (!$user) throw new OutOfBoundsException('Không tìm thấy tài khoản khách hàng.');

        // Giữ lịch sử đơn hàng nhưng xóa liên kết và thông tin nhận diện khách hàng.
        $redactOrders = mysqli_prepare($conn, "UPDATE orders SET user_id=NULL,recipient_name='Khách hàng đã xóa',recipient_phone='',shipping_address='Thông tin giao hàng đã xóa',note=NULL WHERE user_id=?");
        if (!$redactOrders) throw new RuntimeException('Không thể chuẩn bị xóa thông tin đơn hàng.');
        mysqli_stmt_bind_param($redactOrders, 'i', $id);
        if (!mysqli_stmt_execute($redactOrders)) throw new RuntimeException('Không thể xóa thông tin cá nhân trong đơn hàng.');
        mysqli_stmt_close($redactOrders);

        $delete = mysqli_prepare($conn, "DELETE FROM users WHERE id=? AND role='user'");
        if (!$delete) throw new RuntimeException('Không thể chuẩn bị xóa tài khoản.');
        mysqli_stmt_bind_param($delete, 'i', $id);
        if (!mysqli_stmt_execute($delete) || mysqli_stmt_affected_rows($delete) !== 1) {
            mysqli_stmt_close($delete);
            throw new RuntimeException('Không thể xóa tài khoản khách hàng.');
        }
        mysqli_stmt_close($delete);
        if (!mysqli_commit($conn)) throw new RuntimeException('Không thể hoàn tất xóa tài khoản.');
        respond(['success' => true, 'message' => 'Đã xóa tài khoản và thông tin cá nhân liên quan. Lịch sử đơn hàng vẫn được giữ lại.']);
    } catch (OutOfBoundsException $error) {
        mysqli_rollback($conn);
        respond(['success' => false, 'message' => $error->getMessage()], 404);
    } catch (Throwable $error) {
        mysqli_rollback($conn);
        respond(['success' => false, 'message' => $error->getMessage() ?: 'Không thể xóa tài khoản khách hàng.'], 500);
    }
}

header('Allow: GET, PUT, DELETE');
respond(['success' => false, 'message' => 'Phương thức không được hỗ trợ.'], 405);
