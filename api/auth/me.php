<?php
require_once __DIR__ . '/common.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET');
    respond(array('success' => false, 'message' => 'Chỉ chấp nhận phương thức GET.'), 405);
}
if (empty($_SESSION['user']['id'])) {
    respond(array('success' => true, 'authenticated' => false, 'user' => null));
}

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/active_user.php';
if (!currentUserIsActive($conn)) {
    clearCurrentUserSession();
    respond(array('success' => true, 'authenticated' => false, 'user' => null));
}
respond(array('success' => true, 'authenticated' => true, 'user' => $_SESSION['user']));
