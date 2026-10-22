// PHIEN BAN DE HOC: Ten ham chinh duoc viet bang tieng Viet khong dau de de nho.
// Cach doc: doc tu tren xuong; moi ham xu ly mot cong viec.
/**
 * DatNguyenThucShop - CHECKOUT LOGIC
 * Xử lý biểu mẫu đặt hàng, tính toán đơn giá, xác thực thông tin và tạo đơn hàng
 */

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("checkoutForm")) {
    khoiTaoTrangThanhToan();
  }
});

function khoiTaoTrangThanhToan() {
  const cart = layGioHang();

  // Nếu giỏ hàng trống, báo lỗi và chuyển hướng
  if (cart.length === 0) {
    hienThiThongBaoNho(
      "Giỏ hàng của bạn đang trống. Vui lòng chọn sản phẩm trước khi thanh toán.",
      "warning",
    );
    setTimeout(() => {
      window.location.href = "products.html";
    }, 1200);
    return;
  }

  hienThiTomTatThanhToan();
  dienThongTinNguoiDung();
  caiDatPhuongThucThanhToan();
  kiemTraFormThanhToan();
}

// ==========================================================================
// Prefill user data if logged in
// ==========================================================================
function dienThongTinNguoiDung() {
  const currentUser = JSON.parse(
    localStorage.getItem("fashion_current_user") || "null",
  );
  if (!currentUser) return;

  const form = document.getElementById("checkoutForm");
  if (!form) return;

  if (currentUser.name && form.fullName) form.fullName.value = currentUser.name;
  if (currentUser.email && form.email) form.email.value = currentUser.email;
  if (currentUser.phone && form.phone) form.phone.value = currentUser.phone;
  if (currentUser.address && form.address)
    form.address.value = currentUser.address;
}

// ==========================================================================
// Render Order Summary Sidebar on Checkout
// ==========================================================================
function hienThiTomTatThanhToan() {
  const container = document.getElementById("checkoutSummaryContent");
  if (!container) return;

  const cart = layGioHang();
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const freeshipThreshold = 500000;
  const isFreeShipping = subtotal >= freeshipThreshold;
  const standardShippingFee = 30000;

  const coupon = layMaGiamGia();
  let shippingFee = isFreeShipping ? 0 : standardShippingFee;
  let discountAmount = 0;

  if (coupon) {
    if (coupon.type === "percent") {
      discountAmount = Math.round(subtotal * (coupon.value / 100));
    } else if (coupon.type === "shipping") {
      shippingFee = 0;
      discountAmount = standardShippingFee;
    }
  }

  const grandTotal = Math.max(
    0,
    subtotal + shippingFee - (coupon?.type === "shipping" ? 0 : discountAmount),
  );

  container.innerHTML = `
        <div class="checkout-items-list">
            ${cart
              .map(
                (item) => `
                <div class="checkout-item">
                    <img src="${item.image}" alt="${item.name}" class="checkout-item-thumb">
                    <span class="checkout-item-qty">${item.quantity}</span>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 0.875rem; font-weight: 600; color: var(--color-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${item.name}
                        </div>
                        <div style="font-size: 0.775rem; color: var(--color-text-muted);">
                            ${item.color} / Size ${item.size}
                        </div>
                    </div>
                    <div style="font-size: 0.875rem; font-weight: 700; color: var(--color-primary);">
                        ${dinhDangTien(item.price * item.quantity)}
                    </div>
                </div>
            `,
              )
              .join("")}
        </div>

        <div style="border-top: 1px solid var(--color-border); padding-top: 16px; margin-top: 16px;">
            <div class="cart-summary-row">
                <span style="color: var(--color-text-muted);">Tạm tính:</span>
                <span style="font-weight: 600;">${dinhDangTien(subtotal)}</span>
            </div>

            <div class="cart-summary-row">
                <span style="color: var(--color-text-muted);">Phí vận chuyển:</span>
                <span>${shippingFee === 0 ? '<strong style="color: var(--color-success);">Miễn phí</strong>' : dinhDangTien(shippingFee)}</span>
            </div>

            ${
              coupon
                ? `
                <div class="cart-summary-row" style="color: var(--color-danger);">
                    <span>Khuyến mãi (${coupon.code}):</span>
                    <span>-${dinhDangTien(discountAmount)}</span>
                </div>
            `
                : ""
            }

            <div class="cart-summary-row total-row">
                <span>Tổng thanh toán:</span>
                <span style="color: var(--color-danger); font-size: 1.3rem;">${dinhDangTien(grandTotal)}</span>
            </div>
        </div>
    `;
}

// ==========================================================================
// Payment Method Toggle Details
// ==========================================================================
function caiDatPhuongThucThanhToan() {
  const radioInputs = document.querySelectorAll('input[name="paymentMethod"]');
  radioInputs.forEach((radio) => {
    radio.addEventListener("change", () => {
      // Cập nhật class active cho wrapper
      document
        .querySelectorAll(".the-phuong-thuc-thanh-toan")
        .forEach((card) => card.classList.remove("dang-chon"));
      radio.closest(".the-phuong-thuc-thanh-toan")?.classList.add("dang-chon");

      // Ẩn tất cả box chi tiết
      document
        .querySelectorAll(".khung-thong-tin-thanh-toan")
        .forEach((box) => box.classList.remove("dang-mo"));

      // Hiện box tương ứng
      const targetBoxId = radio.getAttribute("data-target");
      if (targetBoxId) {
        const targetBox = document.getElementById(targetBoxId);
        if (targetBox) targetBox.classList.add("dang-mo");
      }
    });
  });
}

// ==========================================================================
// Checkout Form Validation & Submission
// ==========================================================================
function kiemTraFormThanhToan() {
  const form = document.getElementById("checkoutForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let isValid = true;

    // Reset errors
    form.querySelectorAll(".loi-nhap-lieu").forEach((el) => (el.textContent = ""));
    form
      .querySelectorAll(".o-nhap, .chon-thong-tin")
      .forEach((el) => el.classList.remove("is-invalid"));

    // 1. Họ và tên
    const fullNameInput = form.fullName;
    if (!fullNameInput.value.trim() || fullNameInput.value.trim().length < 2) {
      setError(fullNameInput, "Vui lòng nhập họ và tên đầy đủ của bạn.");
      isValid = false;
    }

    // 2. Số điện thoại (Việt Nam)
    const phoneInput = form.phone;
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(phoneInput.value.trim())) {
      setError(
        phoneInput,
        "Vui lòng nhập số điện thoại hợp lệ (10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09).",
      );
      isValid = false;
    }

    // 3. Email
    const emailInput = form.email;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
      setError(
        emailInput,
        "Vui lòng nhập email hợp lệ để nhận thông tin đơn hàng.",
      );
      isValid = false;
    }

    // 4. Tỉnh / Thành phố
    const citySelect = form.city;
    if (!citySelect.value) {
      setError(citySelect, "Vui lòng chọn Tỉnh/Thành phố nhận hàng.");
      isValid = false;
    }

    // 5. Quận / Huyện
    const districtInput = form.district;
    if (!districtInput.value.trim()) {
      setError(districtInput, "Vui lòng nhập Quận/Huyện.");
      isValid = false;
    }

    // 6. Địa chỉ cụ thể
    const addressInput = form.address;
    if (!addressInput.value.trim() || addressInput.value.trim().length < 5) {
      setError(
        addressInput,
        "Vui lòng nhập địa chỉ nhận hàng chi tiết (số nhà, tên đường).",
      );
      isValid = false;
    }

    if (!isValid) {
      hienThiThongBaoNho(
        "Vui lòng kiểm tra và hoàn thành các thông tin còn thiếu.",
        "error",
      );
      return;
    }

    // Tiến hành tạo đơn hàng
    xuLyDatHang(form);
  });
}

function setError(inputElement, message) {
  inputElement.classList.add("is-invalid");
  const errorEl = inputElement
    .closest(".nhom-truong-nhap")
    ?.querySelector(".loi-nhap-lieu");
  if (errorEl) {
    errorEl.textContent = message;
  }
}

// ==========================================================================
// Order Creation & Success Modal
// ==========================================================================
function xuLyDatHang(form) {
  const cart = layGioHang();
  const coupon = layMaGiamGia();
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const freeshipThreshold = 500000;
  const isFreeShipping = subtotal >= freeshipThreshold;
  const standardShippingFee = 30000;

  let shippingFee = isFreeShipping ? 0 : standardShippingFee;
  let discountAmount = 0;

  if (coupon) {
    if (coupon.type === "percent") {
      discountAmount = Math.round(subtotal * (coupon.value / 100));
    } else if (coupon.type === "shipping") {
      shippingFee = 0;
      discountAmount = standardShippingFee;
    }
  }

  const grandTotal = Math.max(
    0,
    subtotal + shippingFee - (coupon?.type === "shipping" ? 0 : discountAmount),
  );
  const paymentMethodInput = form.querySelector(
    'input[name="paymentMethod"]:checked',
  );
  const paymentMethod = paymentMethodInput ? paymentMethodInput.value : "COD";

  // Tạo mã đơn hàng duy nhất
  const orderId = `AUR-${Math.floor(100000 + Math.random() * 900000)}`;

  const orderData = {
    id: orderId,
    date: new Date().toISOString(),
    items: cart,
    subtotal: subtotal,
    shippingFee: shippingFee,
    discount: discountAmount,
    total: grandTotal,
    paymentMethod: paymentMethod,
    status: "Chờ xác nhận",
    customer: {
      fullName: form.fullName.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      city: form.city.value,
      district: form.district.value.trim(),
      address: form.address.value.trim(),
      note: form.note ? form.note.value.trim() : "",
    },
  };

  // Lưu vào lịch sử đơn hàng trong localStorage
  const orders = JSON.parse(localStorage.getItem("fashion_orders") || "[]");
  orders.unshift(orderData);
  localStorage.setItem("fashion_orders", JSON.stringify(orders));

  // Dọn sạch giỏ hàng & coupon
  localStorage.removeItem("fashion_cart");
  localStorage.removeItem("fashion_coupon");
  capNhatSoLuongHuyHieu();

  // Hiển thị modal đặt hàng thành công
  hienThiThongBaoDatHangThanhCong(orderData);
}

function hienThiThongBaoDatHangThanhCong(order) {
  let backdrop = document.querySelector("#orderSuccessModal");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "orderSuccessModal";
    backdrop.className = "modal-backdrop";
    document.body.appendChild(backdrop);
  }

  let paymentMethodName = "Thanh toán khi nhận hàng (COD)";
  if (order.paymentMethod === "BANK")
    paymentMethodName = "Chuyển khoản ngân hàng";
  if (order.paymentMethod === "MOMO")
    paymentMethodName = "Ví điện tử MoMo / VNPay";

  backdrop.innerHTML = `
        <div class="modal" style="max-width: 520px; text-align: center;">
            <div class="modal-body" style="padding: 36px 28px;">
                <div style="width: 72px; height: 72px; background: var(--color-success-light); color: var(--color-success); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; margin: 0 auto 20px auto;">
                    <i class="fa-solid fa-check"></i>
                </div>

                <h2 style="font-family: var(--font-heading); font-size: 1.85rem; color: var(--color-primary); margin-bottom: 8px;">
                    Đặt hàng thành công!
                </h2>

                <p style="color: var(--color-text-muted); font-size: 0.95rem; margin-bottom: 20px;">
                    Cảm ơn quý khách <strong>${order.customer.fullName}</strong> đã tin tưởng mua sắm tại <strong>DatNguyenThucShop</strong>.
                </p>

                <div style="background: var(--color-bg-alt); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 18px; text-align: left; margin-bottom: 24px; font-size: 0.875rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: var(--color-text-muted);">Mã đơn hàng:</span>
                        <strong style="color: var(--color-danger); font-size: 1rem;">#${order.id}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: var(--color-text-muted);">Tổng thanh toán:</span>
                        <strong style="color: var(--color-primary);">${dinhDangTien(order.total)}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: var(--color-text-muted);">Phương thức:</span>
                        <span>${paymentMethodName}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--color-text-muted);">Địa chỉ nhận:</span>
                        <span style="text-align: right; max-width: 60%;">${order.customer.address}, ${order.customer.district}, ${order.customer.city}</span>
                    </div>
                </div>

                <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                    <a href="profile.html?tab=orders" class="nut nut-chinh" style="flex: 1;">
                        <i class="fa-solid fa-box"></i> Xem đơn hàng
                    </a>
                    <a href="index.html" class="nut nut-phu" style="flex: 1;">
                        <i class="fa-solid fa-house"></i> Về trang chủ
                    </a>
                </div>
            </div>
        </div>
    `;

  backdrop.classList.add("dang-mo");
  document.body.style.overflow = "hidden";
}
