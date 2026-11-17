<?php
session_start();
if (!empty($_SESSION['user']) && (($_SESSION['user']['role'] ?? '') === 'admin')) {
    header('Location: index.php');
    exit;
}
?>
<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Đăng nhập quản trị | DatNguyenThucShop</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css">
  <link rel="stylesheet" href="../css/components.css">
  <link rel="stylesheet" href="../css/bo-cuc.css?v=20261028-size-hover">
    <link rel="stylesheet" href="../css/size-buttons.css?v=20261028-size-fix" />
  <style>
    body { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: #f6f4f0; font-family: 'Plus Jakarta Sans', sans-serif; }
    .admin-login-wrap { width: min(100%, 460px); }
    .admin-login-card { background: #fff; border: 1px solid #e8e3dc; border-radius: 16px; padding: 36px; box-shadow: 0 18px 55px rgba(28, 27, 25, .08); }
    .admin-login-card h1 { margin: 0 0 8px; font-family: 'Playfair Display', serif; }
    .admin-login-card p { color: #6d6a65; line-height: 1.6; }
    .admin-login-card .nhom-truong-nhap { margin: 20px 0; }
    .admin-login-card .o-nhap { width: 100%; }
    #adminLoginMessage { min-height: 22px; margin: 0 0 14px; color: #b42318; font-size: .9rem; }
    .admin-login-back { display: block; margin-top: 18px; text-align: center; color: #6d6a65; font-size: .88rem; }
  </style>
</head>
<body>
  <main class="admin-login-wrap">
    <section class="admin-login-card">
      <p style="margin:0 0 6px;font-size:.8rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#9a7446">DatNguyenThucShop</p>
      <h1>Đăng nhập quản trị</h1>
      <p>Dùng tài khoản quản trị để mở bảng điều khiển.</p>
      <form id="adminLoginForm" novalidate>
        <div class="nhom-truong-nhap">
          <label class="nhan-truong-nhap" for="adminEmail">Địa chỉ email</label>
          <input class="o-nhap" id="adminEmail" name="email" type="email" autocomplete="username" required>
        </div>
        <div class="nhom-truong-nhap">
          <label class="nhan-truong-nhap" for="adminPassword">Mật khẩu</label>
          <input class="o-nhap" id="adminPassword" name="password" type="password" autocomplete="current-password" required>
        </div>
        <div id="adminLoginMessage" role="status" aria-live="polite"></div>
        <button class="nut nut-chinh nut-rong nut-lon" type="submit">Đăng nhập quản trị</button>
      </form>
      <a class="admin-login-back" href="../index.html">← Quay lại cửa hàng</a>
    </section>
  </main>
  <script>
    var adminForm = document.getElementById('adminLoginForm');
    var adminMessage = document.getElementById('adminLoginMessage');
    var adminSubmitButton = adminForm.querySelector('button[type="submit"]');
    var adminButtonContent = adminSubmitButton.innerHTML;
    var adminIsSubmitting = false;

    adminForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (adminIsSubmitting) return;
      adminMessage.textContent = '';
      var email = adminForm.email.value.trim();
      var password = adminForm.password.value;
      if (!email || !password) {
        adminMessage.textContent = 'Vui lòng nhập email và mật khẩu.';
        return;
      }

      adminIsSubmitting = true;
      adminSubmitButton.disabled = true;
      adminSubmitButton.classList.add('is-loading');
      adminSubmitButton.setAttribute('aria-busy', 'true');
      adminSubmitButton.innerHTML = '<span class="vong-tai-nut" aria-hidden="true"></span><span>Đang đăng nhập...</span>';
      var adminLoginSucceeded = false;

      try {
        var response = await fetch('../api/auth/login.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ email: email, password: password, role: 'admin' })
        });
        var data;
        try {
          data = await response.json();
        } catch (parseError) {
          throw new Error('Máy chủ trả về dữ liệu không hợp lệ. Hãy kiểm tra PHP/MySQL.');
        }
        if (!data || typeof data !== 'object') throw new Error('Máy chủ trả về dữ liệu không hợp lệ. Hãy kiểm tra PHP/MySQL.');
        if (!response.ok || !data.success) throw new Error(data.message || 'Đăng nhập quản trị không thành công.');

        var user = data.user || {};
        localStorage.setItem('fashion_current_user', JSON.stringify({
          id: user.id,
          name: user.full_name,
          email: user.email,
          phone: user.phone || '',
          role: user.role
        }));
        adminLoginSucceeded = true;
        window.location.href = data.redirect || 'index.php';
      } catch (error) {
        adminMessage.textContent = error instanceof TypeError
          ? 'Không kết nối được PHP/MySQL. Hãy chạy website bằng XAMPP.'
          : (error.message || 'Đăng nhập quản trị không thành công.');
      } finally {
        if (!adminLoginSucceeded) {
          adminIsSubmitting = false;
          adminSubmitButton.disabled = false;
          adminSubmitButton.classList.remove('is-loading');
          adminSubmitButton.removeAttribute('aria-busy');
          adminSubmitButton.innerHTML = adminButtonContent;
        }
      }
    });
  </script>
</body>
</html>
