// PHIEN BAN DE HOC: Ten ham chinh duoc viet bang tieng Viet khong dau de de nho.
// Cach doc: doc tu tren xuong; moi ham xu ly mot cong viec.
/**
 * DatNguyenThucShop - AUTHENTICATION & USER PROFILE
 * Đăng nhập, đăng ký, xác thực form, quản lý tài khoản, đơn hàng, wishlist & sổ địa chỉ
 */

// Tai khoan duoc quan ly trong co so du lieu MySQL.

document.addEventListener("DOMContentLoaded", () => {
  khoiTaoFormDangNhap();
  khoiTaoFormDangKy();
  caiDatHienAnMatKhau();
  khoiTaoTrangCaNhan();
});

// ==========================================================================
// Password Visibility Toggle
// ==========================================================================
function caiDatHienAnMatKhau() {
  document.querySelectorAll(".nut-hien-mat-khau").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn
        .closest(".khung-mat-khau")
        ?.querySelector("input");
      if (!input) return;

      if (input.type === "password") {
        input.type = "text";
        btn.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
      } else {
        input.type = "password";
        btn.innerHTML = '<i class="fa-regular fa-eye"></i>';
      }
    });
  });
}

// ==========================================================================
// Login Handler (login.html)
// ==========================================================================
function khoiTaoFormDangNhap() {
  var form = document.getElementById("loginForm");
  if (!form) return;
  var submitButton = form.querySelector('button[type="submit"]');
  var originalButtonContent = submitButton ? submitButton.innerHTML : "";
  var isSubmitting = false;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (isSubmitting) return;
    form.querySelectorAll(".loi-nhap-lieu").forEach(function (el) { el.textContent = ""; });
    form.querySelectorAll(".o-nhap").forEach(function (el) { el.classList.remove("is-invalid"); });
    var email = form.email.value.trim();
    var password = form.password.value;
    if (!email) { hienThiLoiTaiKhoan(form.email, "Vui lòng nhập địa chỉ email."); return; }
    if (!password) { hienThiLoiTaiKhoan(form.password, "Vui lòng nhập mật khẩu."); return; }

    isSubmitting = true;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.classList.add("is-loading");
      submitButton.setAttribute("aria-busy", "true");
      submitButton.innerHTML = '<span class="vong-tai-nut" aria-hidden="true"></span><span>Đang đăng nhập...</span>';
    }

    var loginSucceeded = false;
    try {
      var response = await fetch("api/auth/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email: email, password: password, role: form.dataset.loginRole === 'admin' ? 'admin' : 'user' })
      });
      var data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error("Máy chủ trả về dữ liệu không hợp lệ. Hãy kiểm tra PHP/MySQL.");
      }

      if (!data || typeof data !== "object") {
        throw new Error("Máy chủ trả về dữ liệu không hợp lệ. Hãy kiểm tra PHP/MySQL.");
      }
      if (!response.ok || !data.success) {
        var message = data.message || "Đăng nhập không thành công.";
        hienThiLoiTaiKhoan(form.password, message);
        hienThiThongBaoNho(message, "error");
        return;
      }

      var user = data.user || {};
      localStorage.setItem("fashion_current_user", JSON.stringify({
        id: user.id,
        name: user.full_name,
        email: user.email,
        phone: user.phone || "",
        role: user.role
      }));
      hienThiThongBaoNho(data.message || "Đăng nhập thành công.", "success");
      if (user.role === "user" && typeof dongBoGioHangSauDangNhap === "function") {
        await dongBoGioHangSauDangNhap(user.id);
      }

      loginSucceeded = true;
      var redirect = user.role === "admin" ? (data.redirect || "admin/index.php") : "profile.html?tab=info";
      var requestedRedirect = new URLSearchParams(window.location.search).get("redirect");
      if (user.role === "user" && requestedRedirect) {
        try {
          var target = new URL(requestedRedirect, window.location.href);
          if (target.origin === window.location.origin && !/\/admin(?:\/|$)/i.test(target.pathname)) {
            redirect = target.href;
          }
        } catch (redirectError) {
          // Bỏ qua redirect sai định dạng và dùng trang hồ sơ mặc định.
        }
      }
      window.location.href = redirect;
    } catch (error) {
      var message = error instanceof TypeError
        ? "Không kết nối được PHP/MySQL. Hãy chạy website bằng XAMPP."
        : (error.message || "Đăng nhập không thành công.");
      hienThiThongBaoNho(message, "error");
    } finally {
      if (!loginSucceeded) {
        isSubmitting = false;
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.classList.remove("is-loading");
          submitButton.removeAttribute("aria-busy");
          submitButton.innerHTML = originalButtonContent;
        }
      }
    }
  });
}// ==========================================================================
// Register Handler (register.html)
// ==========================================================================
function khoiTaoFormDangKy() {
  var form = document.getElementById("registerForm");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    form.querySelectorAll(".loi-nhap-lieu").forEach(function (el) { el.textContent = ""; });
    form.querySelectorAll(".o-nhap").forEach(function (el) { el.classList.remove("is-invalid"); });
    var fullName = form.fullName.value.trim();
    var email = form.email.value.trim();
    var phone = form.phone.value.trim();
    var password = form.password.value;
    var confirmPassword = form.confirmPassword.value;
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var phoneRegex = /^0[0-9]{9}$/;
    if (fullName.length < 2) { hienThiLoiTaiKhoan(form.fullName, "Họ tên phải có ít nhất 2 ký tự."); return; }
    if (!emailRegex.test(email)) { hienThiLoiTaiKhoan(form.email, "Email không đúng định dạng."); return; }
    if (!phoneRegex.test(phone)) { hienThiLoiTaiKhoan(form.phone, "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0."); return; }
    if (password.length < 8) { hienThiLoiTaiKhoan(form.password, "Mật khẩu phải có ít nhất 8 ký tự."); return; }
    if (confirmPassword !== password) { hienThiLoiTaiKhoan(form.confirmPassword, "Mật khẩu nhập lại không khớp."); return; }
    fetch("api/auth/register.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName, email: email, phone: phone, password: password })
    })
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (data.success) {
          hienThiThongBaoNho(data.message, "success");
          window.location.href = "login.html";
        } else {
          hienThiLoiTaiKhoan(form.email, data.message || "Đăng ký không thành công.");
          hienThiThongBaoNho(data.message || "Đăng ký không thành công.", "error");
        }
      })
      .catch(function () { hienThiThongBaoNho("Không kết nối được PHP/MySQL. Hãy chạy website bằng XAMPP.", "error"); });
  });
}

function hienThiLoiTaiKhoan(inputElement, message) {
  inputElement.classList.add("is-invalid");
  const group = inputElement.closest(".nhom-truong-nhap");
  const errorEl = group ? group.querySelector(".loi-nhap-lieu") : null;
  if (errorEl) {
    errorEl.textContent = message;
  }
}

// ==========================================================================
// Profile Page System (profile.html)
// ==========================================================================
async function khoiTaoTrangCaNhan() {
  const profileContainer = document.getElementById('profilePageContainer');
  if (!profileContainer) return;

  const allowedTabs = ['info', 'orders', 'wishlist', 'address', 'password'];
  const requestedTab = new URLSearchParams(window.location.search).get('tab') || 'info';
  const activeTab = allowedTabs.includes(requestedTab) ? requestedTab : 'info';
  const loginUrl = 'login.html?redirect=' + encodeURIComponent('profile.html?tab=' + activeTab);

  try {
    const response = await fetch('api/customer/profile.php', { credentials: 'same-origin' });
    let result;
    try {
      result = await response.json();
    } catch (parseError) {
      throw new Error('Máy chủ trả về dữ liệu không hợp lệ.');
    }

    if (response.status === 401) {
      const authError = new Error(result.message || 'Vui lòng đăng nhập để xem hồ sơ.');
      authError.status = 401;
      throw authError;
    }
    if (!response.ok || !result.success) {
      const loadError = new Error(result.message || 'Không thể tải thông tin tài khoản.');
      loadError.status = response.status;
      throw loadError;
    }
    if (!result.user || !result.user.id) {
      throw new Error('Máy chủ chưa trả về thông tin tài khoản.');
    }

    let cachedUser = {};
    try {
      cachedUser = JSON.parse(localStorage.getItem('fashion_current_user') || '{}') || {};
    } catch (error) {
      cachedUser = {};
    }
    const currentUser = {
      id: Number(result.user.id),
      name: result.user.full_name,
      email: result.user.email,
      phone: result.user.phone || '',
      role: result.user.role,
      address: cachedUser.address || '',
    };
    localStorage.setItem('fashion_current_user', JSON.stringify(currentUser));
    hienThiBoCucTrangCaNhan(currentUser, activeTab);
  } catch (error) {
    const message = error instanceof TypeError
      ? 'Không kết nối được máy chủ. Hãy kiểm tra Apache, MySQL và thử lại.'
      : (error.message || 'Không thể tải thông tin tài khoản.');

    if (error.status === 401) {
      localStorage.removeItem('fashion_current_user');
      profileContainer.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fa-regular fa-user"></i></div><h2 class="empty-state-title">Yêu cầu đăng nhập</h2><p class="empty-state-desc">Phiên đăng nhập đã hết hạn hoặc chưa được tạo. Vui lòng đăng nhập để xem thông tin tài khoản và lịch sử đơn hàng.</p><div style="display:flex;gap:12px;justify-content:center"><a href="' + loginUrl + '" class="nut nut-chinh nut-lon">Đăng nhập ngay</a><a href="register.html" class="nut nut-vien nut-lon">Đăng ký mới</a></div></div>';
      return;
    }

    profileContainer.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fa-solid fa-triangle-exclamation"></i></div><h2 class="empty-state-title">Chưa tải được thông tin</h2><p class="empty-state-desc">' + escTaiKhoan(message) + '</p><div style="display:flex;gap:12px;justify-content:center"><a href="profile.html?tab=' + encodeURIComponent(activeTab) + '" class="nut nut-chinh nut-lon">Thử tải lại</a><a href="index.html" class="nut nut-vien nut-lon">Về trang chủ</a></div></div>';
  }
}
function hienThiBoCucTrangCaNhan(user, activeTab) {
  const container = document.getElementById("profilePageContainer");
  if (!container) return;

  const safeName = escTaiKhoan(user.name || "Khách hàng");
  const safeEmail = escTaiKhoan(user.email || "");
  const safePhone = escTaiKhoan(user.phone || "");
  const safeAddress = escTaiKhoan(user.address || "");
  const avatarInitial = escTaiKhoan((user.name || "U").charAt(0).toUpperCase());

  container.innerHTML = `
        <div class="profile-layout">
            <!-- Sidebar -->
            <div class="profile-sidebar">
                <div class="profile-user-card">
                    <div class="profile-avatar">${avatarInitial}</div>
                    <h3 class="profile-name" id="sidebarProfileName">${safeName}</h3>
                    <p class="profile-email">${safeEmail}</p>
                </div>

                <nav class="profile-menu">
                    <div class="profile-menu-item ${activeTab === "info" ? "dang-chon" : ""}" onclick="chuyenTabCaNhan(event, 'info')">
                        <i class="fa-regular fa-user"></i> Thông tin cá nhân
                    </div>
                    <div class="profile-menu-item ${activeTab === "orders" ? "dang-chon" : ""}" onclick="chuyenTabCaNhan(event, 'orders')">
                        <i class="fa-solid fa-box"></i> Đơn hàng của tôi
                    </div>
                    <div class="profile-menu-item ${activeTab === "wishlist" ? "dang-chon" : ""}" onclick="chuyenTabCaNhan(event, 'wishlist')">
                        <i class="fa-regular fa-heart"></i> Sản phẩm yêu thích
                    </div>
                    <div class="profile-menu-item ${activeTab === "address" ? "dang-chon" : ""}" onclick="chuyenTabCaNhan(event, 'address')">
                        <i class="fa-regular fa-address-book"></i> Sổ địa chỉ
                    </div>
                    <div class="profile-menu-item ${activeTab === "password" ? "dang-chon" : ""}" onclick="chuyenTabCaNhan(event, 'password')">
                        <i class="fa-solid fa-key"></i> Đổi mật khẩu
                    </div>
                    <div class="profile-menu-item" style="color: var(--color-danger); margin-top: 10px;" onclick="xacNhanDangXuat()">
                        <i class="fa-solid fa-arrow-right-from-bracket" style="color: var(--color-danger);"></i> Đăng xuất
                    </div>
                </nav>
            </div>

            <!-- Main Content Card -->
            <div class="profile-content-card" id="profileContentCard">
                <!-- Nội dung các tab được render động -->
            </div>
        </div>
    `;

  hienThiNoiDungTabCaNhan(activeTab, user);
}

function chuyenTabCaNhan(e, tabName) {
  document
    .querySelectorAll(".profile-menu-item")
    .forEach((item) => item.classList.remove("dang-chon"));
  e.currentTarget.classList.add("dang-chon");

  // Cập nhật URL không reload
  const url = new URL(window.location);
  url.searchParams.set("tab", tabName);
  window.history.pushState({}, "", url);

  const currentUser = JSON.parse(
    localStorage.getItem("fashion_current_user") || "null",
  );
  hienThiNoiDungTabCaNhan(tabName, currentUser);
}

function escTaiKhoan(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
}

async function taiDonHangNguoiDung(card) {
  card.innerHTML = '<h2 class="profile-tab-title">Đơn hàng của tôi</h2><p>Đang tải đơn hàng...</p>';
  try {
    const response = await fetch('api/customer/orders.php', { credentials: 'same-origin' });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || 'Không tải được lịch sử đơn hàng.');
    const orders = Array.isArray(data.orders) ? data.orders : [];
    if (!orders.length) {
      card.innerHTML = '<h2 class="profile-tab-title">Đơn hàng của tôi</h2><div class="empty-state" style="padding:40px 0"><div class="empty-state-icon"><i class="fa-solid fa-box-open"></i></div><h3 class="empty-state-title">Chưa có đơn hàng nào</h3><p class="empty-state-desc">Hãy khám phá sản phẩm và đặt đơn đầu tiên của bạn.</p><a href="products.html" class="nut nut-chinh">Mua sắm ngay</a></div>';
      return;
    }
    const statuses = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', shipping: 'Đang giao', completed: 'Hoàn tất', cancelled: 'Đã hủy' };
    const paymentMethods = { cod: 'Thanh toán khi nhận hàng', bank_transfer: 'Chuyển khoản ngân hàng', online: 'Thanh toán trực tuyến' };
    const ratingLabels = ['', '1 sao — Chưa hài lòng', '2 sao — Chưa tốt', '3 sao — Bình thường', '4 sao — Hài lòng', '5 sao — Rất hài lòng'];
    card.innerHTML = '<h2 class="profile-tab-title">Đơn hàng của tôi (' + orders.length + ')</h2><div class="orders-list">' + orders.map((order) => {
      const orderId = Number(order.id) || 0;
      const items = Array.isArray(order.items) ? order.items : [];
      const canConfirmReceived = !order.received_at && ['shipping', 'completed'].includes(order.order_status);
      const shownReviewProductIds = new Set();
      const orderItems = items.map((item) => {
        const productId = Number(item.product_id) || 0;
        let reviewPanel = '';
        if (productId && !shownReviewProductIds.has(productId) && (order.received_at || canConfirmReceived)) {
          shownReviewProductIds.add(productId);
          if (!order.received_at) {
            reviewPanel = '<div class="order-review-pending"><strong>Đánh giá sản phẩm</strong><p>Xác nhận đã nhận hàng để mở biểu mẫu đánh giá sản phẩm này.</p></div>';
          } else {
            const review = item.review && typeof item.review === 'object' ? item.review : null;
            const currentRating = review ? Number(review.rating) : 0;
            const reviewComment = review ? escTaiKhoan(String(review.comment || '')) : '';
            const ratingOptions = [1, 2, 3, 4, 5].map((rating) =>
              '<option value="' + rating + '"' + (currentRating === rating ? ' selected' : '') + '>' + ratingLabels[rating] + '</option>'
            ).join('');
            reviewPanel = '<form class="order-review-form" data-review-form data-review-order="' + orderId + '" data-review-product="' + productId + '">' +
              '<strong>' + (review ? 'Đánh giá của bạn' : 'Đánh giá sản phẩm') + '</strong>' +
              '<label>Mức độ hài lòng<select class="chon-thong-tin" name="rating" required><option value=""' + (currentRating ? '' : ' selected') + ' disabled>Chọn số sao</option>' + ratingOptions + '</select></label>' +
              '<label>Nhận xét<textarea class="o-noi-dung" name="comment" rows="3" maxlength="1000" placeholder="Chia sẻ cảm nhận của bạn về sản phẩm...">' + reviewComment + '</textarea></label>' +
              '<button type="submit" class="nut nut-chinh nut-luu-danh-gia">' + (review ? 'Cập nhật đánh giá' : 'Gửi đánh giá') + '</button>' +
              '</form>';
          }
        }
        return '<div class="order-product-entry"><div class="order-product-row"><div style="flex:1"><div style="font-weight:600;color:var(--color-primary)">' + escTaiKhoan(item.product_name) + '</div><div style="font-size:.8rem;color:var(--color-text-muted)">Size: ' + escTaiKhoan(item.size || 'M') + ' · Số lượng: ' + Number(item.quantity || 0) + ' × ' + dinhDangTien(Number(item.unit_price) || 0) + '</div></div><strong>' + dinhDangTien(Number(item.line_total) || 0) + '</strong></div>' + reviewPanel + '</div>';
      }).join('');
      const status = statuses[order.order_status] || order.order_status || 'Đang xử lý';
      const date = escTaiKhoan(String(order.created_at || '').replace('T', ' ').slice(0, 16));
      const receiptDate = escTaiKhoan(String(order.received_at || '').replace('T', ' ').slice(0, 16));
      const receiptAction = order.received_at
        ? '<div class="order-actions"><span class="order-received-state"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Đã xác nhận nhận hàng' + (receiptDate ? ' · ' + receiptDate : '') + '</span></div>'
        : canConfirmReceived
          ? '<div class="order-actions"><button type="button" class="nut nut-chinh nut-xac-nhan-nhan-hang" data-confirm-received="' + orderId + '">Xác nhận đã nhận hàng</button></div>'
          : '';
      return '<div class="order-card"><div class="order-header"><div><span style="font-weight:700;color:var(--color-primary)">Đơn hàng: #' + escTaiKhoan(order.order_code) + '</span><span style="color:var(--color-text-muted);margin-left:12px;font-size:.8rem">' + date + '</span></div><span class="nhan badge-new">' + escTaiKhoan(status) + '</span></div><div class="order-body">' + orderItems + '</div>' + receiptAction + '<div class="order-footer"><span style="font-size:.85rem;color:var(--color-text-muted)">Phương thức: <strong>' + escTaiKhoan(paymentMethods[order.payment_method] || order.payment_method) + '</strong></span><div>' + (order.coupon_code ? '<div style="font-size:.8rem;color:var(--color-success);text-align:right">Mã ' + escTaiKhoan(order.coupon_code) + (Number(order.discount) > 0 ? ' · giảm ' + dinhDangTien(Number(order.discount)) : '') + '</div>' : '') + '<span style="font-size:.875rem;color:var(--color-text-muted)">Tổng thanh toán: </span><strong style="font-size:1.15rem;color:var(--color-danger)">' + dinhDangTien(Number(order.total) || 0) + '</strong></div></div></div>';
    }).join('') + '</div>';

    card.querySelectorAll('[data-confirm-received]').forEach((button) => {
      button.addEventListener('click', async () => {
        button.disabled = true;
        try {
          const confirmResponse = await fetch('api/customer/orders.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'confirm_received', order_id: Number(button.dataset.confirmReceived) }),
          });
          const confirmData = await confirmResponse.json();
          if (!confirmResponse.ok || !confirmData.success) throw new Error(confirmData.message || 'Không thể xác nhận đã nhận hàng.');
          hienThiThongBaoNho(confirmData.message || 'Đã xác nhận nhận hàng.', 'success');
          await taiDonHangNguoiDung(card);
        } catch (error) {
          button.disabled = false;
          hienThiThongBaoNho(error.message || 'Không thể xác nhận đã nhận hàng.', 'error');
        }
      });
    });

    card.querySelectorAll('[data-review-form]').forEach((form) => {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const button = form.querySelector('button[type="submit"]');
        const originalButtonText = button ? button.textContent : 'Gửi đánh giá';
        if (button) {
          button.disabled = true;
          button.textContent = 'Đang lưu...';
        }
        try {
          const reviewResponse = await fetch('api/customer/reviews.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_id: Number(form.dataset.reviewOrder),
              product_id: Number(form.dataset.reviewProduct),
              rating: Number(form.elements.rating.value),
              comment: form.elements.comment.value.trim(),
            }),
          });
          const reviewData = await reviewResponse.json();
          if (!reviewResponse.ok || !reviewData.success) throw new Error(reviewData.message || 'Không thể lưu đánh giá.');
          hienThiThongBaoNho(reviewData.message || 'Cảm ơn bạn đã đánh giá sản phẩm.', 'success');
          await taiDonHangNguoiDung(card);
        } catch (error) {
          if (button && button.isConnected) {
            button.disabled = false;
            button.textContent = originalButtonText;
          }
          hienThiThongBaoNho(error.message || 'Không thể lưu đánh giá.', 'error');
        }
      });
    });
  } catch (error) {
    card.innerHTML = '<h2 class="profile-tab-title">Đơn hàng của tôi</h2><p class="empty-state-desc">' + escTaiKhoan(error.message || 'Không tải được lịch sử đơn hàng.') + '</p><a href="login.html" class="nut nut-chinh">Đăng nhập lại</a>';
  }
}
function hienThiNoiDungTabCaNhan(tabName, user) {
  const card = document.getElementById("profileContentCard");
  if (!card) return;

  user = user || {};
  const safeName = escTaiKhoan(user.name || "");
  const safeEmail = escTaiKhoan(user.email || "");
  const safePhone = escTaiKhoan(user.phone || "");
  const safeAddress = escTaiKhoan(user.address || "");

  if (tabName === "info") {
    card.innerHTML = `
            <h2 class="profile-tab-title">Thông tin cá nhân</h2>
            <form id="profileInfoForm" onsubmit="capNhatThongTinCaNhan(event)">
                <div class="luoi-bieu-mau-2-cot">
                    <div class="nhom-truong-nhap">
                        <label class="nhan-truong-nhap">Họ và tên</label>
                        <input type="text" name="name" class="o-nhap" value="${safeName}" required>
                    </div>
                    <div class="nhom-truong-nhap">
                        <label class="nhan-truong-nhap">Số điện thoại</label>
                        <input type="tel" name="phone" class="o-nhap" value="${safePhone}" required>
                    </div>
                </div>

                <div class="nhom-truong-nhap">
                    <label class="nhan-truong-nhap">Email</label>
                    <input type="email" name="email" class="o-nhap" value="${safeEmail}" disabled style="background-color: var(--color-bg-subtle);">
                    <small class="form-help">Địa chỉ email liên kết với tài khoản không thể sửa đổi.</small>
                </div>

                <div class="nhom-truong-nhap">
                    <label class="nhan-truong-nhap">Địa chỉ mặc định</label>
                    <input type="text" name="address" class="o-nhap" value="${safeAddress}" placeholder="Số nhà, đường, phường, quận...">
                </div>

                <div style="margin-top: 24px;">
                    <button type="submit" class="nut nut-chinh">Lưu thay đổi</button>
                </div>
            </form>
        `;
  } else if (tabName === "orders") {
    taiDonHangNguoiDung(card);
  } else if (tabName === "wishlist") {
    hienThiSanPhamYeuThich();
  } else if (tabName === "address") {
    card.innerHTML = `
            <h2 class="profile-tab-title">Sổ địa chỉ nhận hàng</h2>
            <div style="border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 20px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <strong style="font-size: 1rem; color: var(--color-primary);">${escTaiKhoan(user.name)}</strong>
                    <span class="nhan nhan-con-hang">Mặc định</span>
                </div>
                <div style="color: var(--color-text-muted); font-size: 0.875rem; line-height: 1.6;">
                    <div>Điện thoại: ${escTaiKhoan(user.phone || "Chưa cập nhật")}</div>
                    <div>Địa chỉ: ${escTaiKhoan(user.address || "Chưa cập nhật địa chỉ")}</div>
                </div>
            </div>
            <p style="font-size: 0.85rem; color: var(--color-text-muted);">
                Bạn có thể cập nhật địa chỉ giao hàng mặc định ở tab <strong>Thông tin cá nhân</strong>.
            </p>
        `;
  } else if (tabName === "password") {
    card.innerHTML = `
            <h2 class="profile-tab-title">Đổi mật khẩu</h2>
            <form id="changePasswordForm" onsubmit="doiMatKhau(event)" style="max-width: 440px;">
                <div class="nhom-truong-nhap">
                    <label class="nhan-truong-nhap">Mật khẩu hiện tại</label>
                    <input type="password" name="currentPassword" class="o-nhap" required>
                    <div class="loi-nhap-lieu"></div>
                </div>

                <div class="nhom-truong-nhap">
                    <label class="nhan-truong-nhap">Mật khẩu mới</label>
                    <input type="password" name="newPassword" class="o-nhap" required minlength="8">
                    <div class="loi-nhap-lieu"></div>
                </div>

                <div class="nhom-truong-nhap">
                    <label class="nhan-truong-nhap">Xác nhận mật khẩu mới</label>
                    <input type="password" name="confirmNewPassword" class="o-nhap" required minlength="8">
                    <div class="loi-nhap-lieu"></div>
                </div>

                <div style="margin-top: 24px;">
                    <button type="submit" class="nut nut-chinh">Cập nhật mật khẩu</button>
                </div>
            </form>
        `;
  }
}

async function hienThiSanPhamYeuThich() {
  await taiDanhSachSanPham();
  const card = document.getElementById("profileContentCard");
  if (!card) return;

  const wishlistIds = layDanhSachYeuThich();
  const wishlistedProducts = DANH_SACH_SAN_PHAM.filter((p) => wishlistIds.includes(p.id));

  if (wishlistedProducts.length === 0) {
    card.innerHTML = `
            <h2 class="profile-tab-title">Sản phẩm yêu thích</h2>
            <div class="empty-state" style="padding: 40px 0;">
                <div class="empty-state-icon"><i class="fa-regular fa-heart"></i></div>
                <h3 class="empty-state-title">Danh sách yêu thích trống</h3>
                <p class="empty-state-desc">Hãy lưu lại các món đồ thời trang bạn yêu thích để dễ dàng mua sắm khi có dịp nhé!</p>
                <a href="products.html" class="nut nut-chinh">Khám phá ngay</a>
            </div>
        `;
    return;
  }

  card.innerHTML = `
        <h2 class="profile-tab-title">Sản phẩm yêu thích (${wishlistedProducts.length})</h2>
        <div class="luoi-san-pham" style="grid-template-columns: repeat(3, 1fr);">
            ${wishlistedProducts.map((p) => hienThiTheSanPham(p)).join("")}
        </div>
    `;
}

async function capNhatThongTinCaNhan(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value.trim();
  const phone = form.phone.value.trim();
  const address = form.address.value.trim();
  if (name.length < 2) {
    hienThiThongBaoNho('Họ tên phải có ít nhất 2 ký tự.', 'error');
    return;
  }

  try {
    const response = await fetch('api/customer/profile.php', {
      method: 'PUT',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: name, phone: phone }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || 'Không thể lưu hồ sơ.');

    const currentUser = JSON.parse(localStorage.getItem('fashion_current_user') || '{}');
    currentUser.name = result.user.full_name;
    currentUser.phone = result.user.phone || '';
    currentUser.address = address;
    localStorage.setItem('fashion_current_user', JSON.stringify(currentUser));
    const sidebarName = document.getElementById('sidebarProfileName');
    if (sidebarName) sidebarName.textContent = currentUser.name;
    hienThiTrangThaiNguoiDung();
    hienThiThongBaoNho('Đã cập nhật thông tin tài khoản.', 'success');
  } catch (error) {
    hienThiThongBaoNho(error.message || 'Không thể lưu hồ sơ.', 'error');
  }
}

async function doiMatKhau(e) {
  e.preventDefault();
  const form = e.target;
  const currentPassword = form.currentPassword.value;
  const newPassword = form.newPassword.value;
  const confirmPassword = form.confirmNewPassword.value;
  if (newPassword.length < 8) {
    hienThiThongBaoNho('Mật khẩu mới phải có ít nhất 8 ký tự.', 'error');
    return;
  }
  if (newPassword !== confirmPassword) {
    hienThiThongBaoNho('Mật khẩu xác nhận không khớp.', 'error');
    return;
  }
  try {
    const response = await fetch('api/customer/password.php', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || 'Không thể đổi mật khẩu.');
    form.reset();
    hienThiThongBaoNho(result.message, 'success');
  } catch (error) {
    hienThiThongBaoNho(error.message || 'Không thể đổi mật khẩu.', 'error');
  }
}

function xacNhanDangXuat() {
  hienThiHopThoaiXacNhan({
    title: "Đăng xuất",
    message: "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?",
    confirmText: "Đăng xuất",
    cancelText: "Ở lại",
    onConfirm: () => {
      dangXuatNguoiDung();
    },
  });
}
