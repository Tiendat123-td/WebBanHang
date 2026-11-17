<?php
// Xác thực tài khoản và vai trò trên các API cần đăng nhập.
function currentUserRecord($conn) {
    $userId = (int) ($_SESSION['user']['id'] ?? 0);
    if ($userId < 1) {
        return null;
    }

    $stmt = mysqli_prepare($conn, 'SELECT id, full_name, email, phone, role, status FROM users WHERE id=? LIMIT 1');
    if (!$stmt) {
        respond(['success' => false, 'message' => 'Không thể xác thực tài khoản.'], 500);
    }
    mysqli_stmt_bind_param($stmt, 'i', $userId);
    if (!mysqli_stmt_execute($stmt)) {
        mysqli_stmt_close($stmt);
        respond(['success' => false, 'message' => 'Không thể xác thực tài khoản.'], 500);
    }
    $user = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));
    mysqli_stmt_close($stmt);
    return $user ?: null;
}

function currentUserIsActive($conn) {
    $user = currentUserRecord($conn);
    if (!$user || $user['status'] !== 'active') {
        return false;
    }
    $_SESSION['user'] = [
        'id' => (int) $user['id'],
        'full_name' => $user['full_name'],
        'email' => $user['email'],
        'phone' => $user['phone'],
        'role' => $user['role']
    ];
    return true;
}

function clearCurrentUserSession() {
    $_SESSION = [];
    if (session_status() === PHP_SESSION_ACTIVE) {
        $params = session_get_cookie_params();
        if (ini_get('session.use_cookies')) {
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
        }
        session_destroy();
    }
}

function requireActiveUser($conn, $message = 'Vui lòng đăng nhập.') {
    if (empty($_SESSION['user']['id'])) {
        respond(['success' => false, 'message' => $message], 401);
    }
    if (!currentUserIsActive($conn)) {
        clearCurrentUserSession();
        respond(['success' => false, 'message' => 'Tài khoản đã bị khóa hoặc không còn tồn tại.'], 401);
    }
    if (($_SESSION['user']['role'] ?? '') !== 'user') {
        respond(['success' => false, 'message' => 'API này chỉ dành cho tài khoản khách hàng.'], 403);
    }
}
