<?php
require_once __DIR__ . '/../auth/common.php';
require_once __DIR__ . '/../auth/active_user.php';

function requireAdmin($conn) {
    if (empty($_SESSION['user']['id'])) {
        respond(['success' => false, 'message' => 'Vui lòng đăng nhập quản trị.'], 401);
    }
    if (!currentUserIsActive($conn)) {
        clearCurrentUserSession();
        respond(['success' => false, 'message' => 'Tài khoản quản trị đã bị khóa hoặc không còn tồn tại.'], 401);
    }
    if (($_SESSION['user']['role'] ?? '') !== 'admin') {
        respond(['success' => false, 'message' => 'Bạn không có quyền truy cập chức năng quản trị.'], 403);
    }
}
