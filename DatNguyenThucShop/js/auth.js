// PHIEN BAN DE HOC: Ten ham chinh duoc viet bang tieng Viet khong dau de de nho.
// Cach doc: doc tu tren xuong; moi ham xu ly mot cong viec.
/**
 * DatNguyenThucShop - AUTHENTICATION & USER PROFILE
 * Đăng nhập, đăng ký, xác thực form, quản lý tài khoản, đơn hàng, wishlist & sổ địa chỉ
 */

// ==========================================================================
// Initialization & Pre-seeded User Account
// ==========================================================================
(function taoTaiKhoanMau() {
  let users = JSON.parse(localStorage.getItem("fashion_users") || "[]");
  if (users.length === 0) {
    users = [
      {
        id: "usr_001",
        name: "Phùng Tiến Đạt",
        email: "24004279@gmail.com",
        phone: "0939957116",
        password: "Tiendat@123",
        address: "Phường Long Châu, Thành phố Vĩnh Long",
        createdAt: "2026-01-10T08:00:00.000Z",
      },
    ];
    localStorage.setItem("fashion_users", JSON.stringify(users));
  }
})();

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
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Clear previous errors
    form.querySelectorAll(".loi-nhap-lieu").forEach((el) => (el.textContent = ""));
    form
      .querySelectorAll(".o-nhap")
      .forEach((el) => el.classList.remove("is-invalid"));

    const email = form.email.value.trim();
    const password = form.password.value;
    let isValid = true;

    if (!email) {
      hienThiLoiTaiKhoan(form.email, "Vui lòng nhập địa chỉ email.");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      hienThiLoiTaiKhoan(form.email, "Email không đúng định dạng.");
      isValid = false;
    }

    if (!password) {
      hienThiLoiTaiKhoan(form.password, "Vui lòng nhập mật khẩu.");
      isValid = false;
    } else if (password.length < 6) {
      hienThiLoiTaiKhoan(form.password, "Mật khẩu phải có tối thiểu 6 ký tự.");
      isValid = false;
    }

    if (!isValid) return;

    // Check credentials
    const users = JSON.parse(localStorage.getItem("fashion_users") || "[]");
    const foundUser = users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password,
    );

    if (foundUser) {
      // Lưu session user (không lưu password vào session)
      const sessionUser = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        phone: foundUser.phone,
        address: foundUser.address,
      };
      localStorage.setItem("fashion_current_user", JSON.stringify(sessionUser));

      hienThiThongBaoNho(`Chào mừng bạn quay trở lại, ${foundUser.name}!`, "success");

      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get("redirect") || "profile.html";

      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 800);
    } else {
      hienThiLoiTaiKhoan(form.password, "Email hoặc mật khẩu không chính xác.");
      hienThiThongBaoNho("Email hoặc mật khẩu không chính xác.", "error");
    }
  });
}

// ==========================================================================
// Register Handler (register.html)
// ==========================================================================
function khoiTaoFormDangKy() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    form.querySelectorAll(".loi-nhap-lieu").forEach((el) => (el.textContent = ""));
    form
      .querySelectorAll(".o-nhap")
      .forEach((el) => el.classList.remove("is-invalid"));

    const fullName = form.fullName.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    let isValid = true;

    if (!fullName || fullName.length < 2) {
      hienThiLoiTaiKhoan(form.fullName, "Họ tên phải có ít nhất 2 ký tự.");
      isValid = false;
    }

    if (!email) {
      hienThiLoiTaiKhoan(form.email, "Vui lòng nhập địa chỉ email.");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      hienThiLoiTaiKhoan(form.email, "Email không đúng định dạng.");
      isValid = false;
    }

    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phone) {
      hienThiLoiTaiKhoan(form.phone, "Vui lòng nhập số điện thoại.");
      isValid = false;
    } else if (!phoneRegex.test(phone)) {
      hienThiLoiTaiKhoan(form.phone, "Số điện thoại không hợp lệ (10 chữ số).");
      isValid = false;
    }

    if (!password) {
      hienThiLoiTaiKhoan(form.password, "Vui lòng tạo mật khẩu.");
      isValid = false;
    } else if (password.length < 6) {
      hienThiLoiTaiKhoan(form.password, "Mật khẩu phải có ít nhất 6 ký tự.");
      isValid = false;
    }

    if (!confirmPassword) {
      hienThiLoiTaiKhoan(form.confirmPassword, "Vui lòng nhập lại mật khẩu.");
      isValid = false;
    } else if (confirmPassword !== password) {
      hienThiLoiTaiKhoan(form.confirmPassword, "Mật khẩu nhập lại không khớp.");
      isValid = false;
    }

    if (!isValid) return;

    // Check duplicate email
    let users = JSON.parse(localStorage.getItem("fashion_users") || "[]");
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      hienThiLoiTaiKhoan(
        form.email,
        "Email này đã được đăng ký tài khoản. Vui lòng đăng nhập.",
      );
      hienThiThongBaoNho("Email này đã được đăng ký tài khoản.", "error");
      return;
    }

    // Tạo tài khoản mới
    const newUser = {
      id: "usr_" + Date.now(),
      name: fullName,
      email: email,
      phone: phone,
      password: password,
      address: "",
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem("fashion_users", JSON.stringify(users));

    // Tự động đăng nhập
    const sessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      address: "",
    };
    localStorage.setItem("fashion_current_user", JSON.stringify(sessionUser));

    hienThiThongBaoNho("Đăng ký tài khoản thành công! Đang chuyển hướng...", "success");
    setTimeout(() => {
      window.location.href = "profile.html";
    }, 1000);
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
function khoiTaoTrangCaNhan() {
  const profileContainer = document.getElementById("profilePageContainer");
  if (!profileContainer) return;

  const currentUser = JSON.parse(
    localStorage.getItem("fashion_current_user") || "null",
  );
  if (!currentUser) {
    // Chưa đăng nhập -> nhắc nhở đăng nhập
    profileContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fa-regular fa-user"></i>
                </div>
                <h2 class="empty-state-title">Yêu cầu đăng nhập</h2>
                <p class="empty-state-desc">
                    Vui lòng đăng nhập để xem thông tin tài khoản, lịch sử đơn mua và danh sách sản phẩm yêu thích của bạn.
                </p>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <a href="login.html?redirect=profile.html" class="nut nut-chinh nut-lon">Đăng nhập ngay</a>
                    <a href="register.html" class="nut nut-vien nut-lon">Đăng ký mới</a>
                </div>
            </div>
        `;
    return;
  }

  // Đọc URL param tab (e.g. ?tab=orders hoặc ?tab=wishlist)
  const urlParams = new URLSearchParams(window.location.search);
  const activeTab = urlParams.get("tab") || "info";

  hienThiBoCucTrangCaNhan(currentUser, activeTab);
}

function hienThiBoCucTrangCaNhan(user, activeTab) {
  const container = document.getElementById("profilePageContainer");
  if (!container) return;

  const avatarInitial = (user.name || "U").charAt(0).toUpperCase();

  container.innerHTML = `
        <div class="profile-layout">
            <!-- Sidebar -->
            <div class="profile-sidebar">
                <div class="profile-user-card">
                    <div class="profile-avatar">${avatarInitial}</div>
                    <h3 class="profile-name" id="sidebarProfileName">${user.name}</h3>
                    <p class="profile-email">${user.email}</p>
                </div>

                <nav class="profile-menu">
                    <div class="profile-menu-item ${activeTab === "info" ? "dang-chon" : ""}" onclick="chuyenTabCaNhan('info')">
                        <i class="fa-regular fa-user"></i> Thông tin cá nhân
                    </div>
                    <div class="profile-menu-item ${activeTab === "orders" ? "dang-chon" : ""}" onclick="chuyenTabCaNhan('orders')">
                        <i class="fa-solid fa-box"></i> Đơn hàng của tôi
                    </div>
                    <div class="profile-menu-item ${activeTab === "wishlist" ? "dang-chon" : ""}" onclick="chuyenTabCaNhan('wishlist')">
                        <i class="fa-regular fa-heart"></i> Sản phẩm yêu thích
                    </div>
                    <div class="profile-menu-item ${activeTab === "address" ? "dang-chon" : ""}" onclick="chuyenTabCaNhan('address')">
                        <i class="fa-regular fa-address-book"></i> Sổ địa chỉ
                    </div>
                    <div class="profile-menu-item ${activeTab === "password" ? "dang-chon" : ""}" onclick="chuyenTabCaNhan('password')">
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

function chuyenTabCaNhan(tabName) {
  document
    .querySelectorAll(".profile-menu-item")
    .forEach((item) => item.classList.remove("dang-chon"));
  event.currentTarget.classList.add("dang-chon");

  // Cập nhật URL không reload
  const url = new URL(window.location);
  url.searchParams.set("tab", tabName);
  window.history.pushState({}, "", url);

  const currentUser = JSON.parse(
    localStorage.getItem("fashion_current_user") || "null",
  );
  hienThiNoiDungTabCaNhan(tabName, currentUser);
}

function hienThiNoiDungTabCaNhan(tabName, user) {
  const card = document.getElementById("profileContentCard");
  if (!card) return;

  if (tabName === "info") {
    card.innerHTML = `
            <h2 class="profile-tab-title">Thông tin cá nhân</h2>
            <form id="profileInfoForm" onsubmit="capNhatThongTinCaNhan(event)">
                <div class="luoi-bieu-mau-2-cot">
                    <div class="nhom-truong-nhap">
                        <label class="nhan-truong-nhap">Họ và tên</label>
                        <input type="text" name="name" class="o-nhap" value="${user.name || ""}" bat-buoc>
                    </div>
                    <div class="nhom-truong-nhap">
                        <label class="nhan-truong-nhap">Số điện thoại</label>
                        <input type="tel" name="phone" class="o-nhap" value="${user.phone || ""}" bat-buoc>
                    </div>
                </div>

                <div class="nhom-truong-nhap">
                    <label class="nhan-truong-nhap">Email</label>
                    <input type="email" name="email" class="o-nhap" value="${user.email}" disabled style="background-color: var(--color-bg-subtle);">
                    <small class="form-help">Địa chỉ email liên kết với tài khoản không thể sửa đổi.</small>
                </div>

                <div class="nhom-truong-nhap">
                    <label class="nhan-truong-nhap">Địa chỉ mặc định</label>
                    <input type="text" name="address" class="o-nhap" value="${user.address || ""}" placeholder="Số nhà, đường, phường, quận...">
                </div>

                <div style="margin-top: 24px;">
                    <button type="submit" class="nut nut-chinh">Lưu thay đổi</button>
                </div>
            </form>
        `;
  } else if (tabName === "orders") {
    const orders = JSON.parse(localStorage.getItem("fashion_orders") || "[]");

    if (orders.length === 0) {
      card.innerHTML = `
                <h2 class="profile-tab-title">Đơn hàng của tôi</h2>
                <div class="empty-state" style="padding: 40px 0;">
                    <div class="empty-state-icon"><i class="fa-solid fa-box-open"></i></div>
                    <h3 class="empty-state-title">Chưa có đơn hàng nào</h3>
                    <p class="empty-state-desc">Bạn chưa đặt mua đơn hàng nào tại DatNguyenThucShop. Hãy khám phá và mua sắm ngay!</p>
                    <a href="products.html" class="nut nut-chinh">Mua sắm ngay</a>
                </div>
            `;
      return;
    }

    card.innerHTML = `
            <h2 class="profile-tab-title">Đơn hàng của tôi (${orders.length})</h2>
            <div class="orders-list">
                ${orders
                  .map(
                    (order) => `
                    <div class="order-card">
                        <div class="order-header">
                            <div>
                                <span style="font-weight: 700; color: var(--color-primary);">Đơn hàng: #${order.id}</span>
                                <span style="color: var(--color-text-muted); margin-left: 12px; font-size: 0.8rem;">
                                    ${new Date(order.date).toLocaleDateString("vi-VN")}
                                </span>
                            </div>
                            <span class="nhan ${order.status === "Đã hoàn thành" ? "badge-stock" : "badge-new"}">
                                ${order.status}
                            </span>
                        </div>
                        <div class="order-body">
                            ${order.items
                              .map(
                                (item) => `
                                <div class="order-product-row">
                                    <img src="${item.image}" alt="${item.name}" class="order-thumb">
                                    <div style="flex: 1;">
                                        <div style="font-weight: 600; font-size: 0.9rem; color: var(--color-primary);">${item.name}</div>
                                        <div style="font-size: 0.8rem; color: var(--color-text-muted);">
                                            Phân loại: ${item.color} | Size: ${item.size} | SL: x${item.quantity}
                                        </div>
                                    </div>
                                    <div style="font-weight: 700; font-size: 0.9rem;">
                                        ${dinhDangTien(item.price * item.quantity)}
                                    </div>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                        <div class="order-footer">
                            <span style="font-size: 0.85rem; color: var(--color-text-muted);">
                                Phương thức: <strong>${order.paymentMethod}</strong>
                            </span>
                            <div>
                                <span style="font-size: 0.875rem; color: var(--color-text-muted);">Tổng thanh toán: </span>
                                <span style="font-size: 1.15rem; font-weight: 800; color: var(--color-danger);">${dinhDangTien(order.total)}</span>
                            </div>
                        </div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        `;
  } else if (tabName === "wishlist") {
    hienThiSanPhamYeuThich();
  } else if (tabName === "address") {
    card.innerHTML = `
            <h2 class="profile-tab-title">Sổ địa chỉ nhận hàng</h2>
            <div style="border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 20px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <strong style="font-size: 1rem; color: var(--color-primary);">${user.name}</strong>
                    <span class="nhan nhan-con-hang">Mặc định</span>
                </div>
                <div style="color: var(--color-text-muted); font-size: 0.875rem; line-height: 1.6;">
                    <div>Điện thoại: ${user.phone || "Chưa cập nhật"}</div>
                    <div>Địa chỉ: ${user.address || "Chưa cập nhật địa chỉ"}</div>
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
                    <input type="password" name="currentPassword" class="o-nhap" bat-buoc>
                    <div class="loi-nhap-lieu"></div>
                </div>

                <div class="nhom-truong-nhap">
                    <label class="nhan-truong-nhap">Mật khẩu mới</label>
                    <input type="password" name="newPassword" class="o-nhap" bat-buoc minlength="6">
                    <div class="loi-nhap-lieu"></div>
                </div>

                <div class="nhom-truong-nhap">
                    <label class="nhan-truong-nhap">Xác nhận mật khẩu mới</label>
                    <input type="password" name="confirmNewPassword" class="o-nhap" bat-buoc minlength="6">
                    <div class="loi-nhap-lieu"></div>
                </div>

                <div style="margin-top: 24px;">
                    <button type="submit" class="nut nut-chinh">Cập nhật mật khẩu</button>
                </div>
            </form>
        `;
  }
}

function hienThiSanPhamYeuThich() {
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

function capNhatThongTinCaNhan(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value.trim();
  const phone = form.phone.value.trim();
  const address = form.address.value.trim();

  let currentUser = JSON.parse(
    localStorage.getItem("fashion_current_user") || "{}",
  );
  currentUser.name = name;
  currentUser.phone = phone;
  currentUser.address = address;
  localStorage.setItem("fashion_current_user", JSON.stringify(currentUser));

  // Cập nhật trong mảng users
  let users = JSON.parse(localStorage.getItem("fashion_users") || "[]");
  const userIndex = users.findIndex((u) => u.email === currentUser.email);
  if (userIndex > -1) {
    users[userIndex].name = name;
    users[userIndex].phone = phone;
    users[userIndex].address = address;
    localStorage.setItem("fashion_users", JSON.stringify(users));
  }

  const sidebarName = document.getElementById("sidebarProfileName");
  if (sidebarName) sidebarName.textContent = name;

  hienThiTrangThaiNguoiDung();
  hienThiThongBaoNho("Cập nhật thông tin thành công!", "success");
}

function doiMatKhau(e) {
  e.preventDefault();
  const form = e.target;
  const currentPass = form.currentPassword.value;
  const newPass = form.newPassword.value;
  const confirmNewPass = form.confirmNewPassword.value;

  const currentUser = JSON.parse(
    localStorage.getItem("fashion_current_user") || "{}",
  );
  let users = JSON.parse(localStorage.getItem("fashion_users") || "[]");
  const user = users.find((u) => u.email === currentUser.email);

  if (!user || user.password !== currentPass) {
    hienThiThongBaoNho("Mật khẩu hiện tại không đúng.", "error");
    return;
  }

  if (newPass.length < 6) {
    hienThiThongBaoNho("Mật khẩu mới phải có tối thiểu 6 ký tự.", "error");
    return;
  }

  if (newPass !== confirmNewPass) {
    hienThiThongBaoNho("Mật khẩu xác nhận không khớp.", "error");
    return;
  }

  user.password = newPass;
  localStorage.setItem("fashion_users", JSON.stringify(users));
  form.reset();
  hienThiThongBaoNho("Đổi mật khẩu thành công!", "success");
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
