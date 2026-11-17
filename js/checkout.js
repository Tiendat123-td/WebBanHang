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

async function khoiTaoTrangThanhToan() {
  // Bind the province picker before any network-dependent checkout work.
  caiDatTimTinhThanh();
  const cart = await capNhatSanPhamGioHang();

  // Nếu giỏ hàng trống, báo lỗi và chuyển hướng
  if (cart.some((item) => item.productUnavailable)) {
    hienThiThongBaoNho("Có sản phẩm không còn đủ tồn kho hoặc đã ngừng kinh doanh. Vui lòng kiểm tra lại giỏ hàng.", "error");
    setTimeout(() => { window.location.href = "cart.html"; }, 1000);
    return;
  }

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

  await hienThiTomTatThanhToan();
  dienThongTinNguoiDung();
  caiDatPhuongThucThanhToan();
  kiemTraFormThanhToan();
}

// ==========================================================================
function caiDatTimTinhThanh() {
  const citySelect = document.getElementById("citySelect");
  const citySearch = document.getElementById("citySearch");
  const cityOptions = document.getElementById("cityOptions");
  if (!citySelect || !citySearch || !cityOptions) return;

  const provinces = Array.from(citySelect.options).filter((option) => option.value);
  let filteredProvinces = [];
  let activeIndex = -1;

  const normalize = (value) =>
    value
      .toLocaleLowerCase("vi")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");

  const closeList = () => {
    cityOptions.hidden = true;
    citySearch.setAttribute("aria-expanded", "false");
    citySearch.removeAttribute("aria-activedescendant");
    activeIndex = -1;
  };

  const updateActiveOption = () => {
    const items = cityOptions.querySelectorAll('[role="option"]');
    items.forEach((item, index) => {
      item.classList.toggle("is-active", index === activeIndex);
    });
    if (activeIndex >= 0 && filteredProvinces[activeIndex]) {
      citySearch.setAttribute("aria-activedescendant", `city-option-${activeIndex}`);
    } else {
      citySearch.removeAttribute("aria-activedescendant");
    }
  };

  const renderOptions = (query = "") => {
    const normalizedQuery = normalize(query.trim());
    filteredProvinces = provinces.filter((option) =>
      normalize(option.textContent).includes(normalizedQuery),
    );
    cityOptions.replaceChildren();

    filteredProvinces.forEach((option, index) => {
      const item = document.createElement("div");
      item.className = "tuy-chon-tinh-thanh";
      item.id = `city-option-${index}`;
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", String(option.value === citySelect.value));
      item.textContent = option.textContent;
      cityOptions.appendChild(item);
    });

    if (!filteredProvinces.length) {
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "khong-co-tinh-thanh";
      emptyMessage.textContent = "Không tìm thấy tỉnh/thành phố phù hợp.";
      cityOptions.appendChild(emptyMessage);
    }

    activeIndex = query.trim() && filteredProvinces.length ? 0 : -1;
    updateActiveOption();
  };

  const openList = (query = "") => {
    cityOptions.hidden = false;
    citySearch.setAttribute("aria-expanded", "true");
    renderOptions(query);
  };

  const selectProvince = (option) => {
    if (!option) return;
    citySelect.value = option.value;
    citySearch.value = option.textContent;
    citySelect.dispatchEvent(new Event("change", { bubbles: true }));
    citySearch.classList.remove("is-invalid");
    const error = citySearch.parentElement.parentElement.querySelector(".loi-nhap-lieu");
    if (error) error.textContent = "";
    closeList();
  };

  citySearch.addEventListener("focus", () => openList());
  citySearch.addEventListener("click", () => {
    if (cityOptions.hidden) openList();
  });
  citySearch.addEventListener("blur", () => {
    setTimeout(() => {
      if (!citySearch.parentElement.contains(document.activeElement)) closeList();
    }, 0);
  });
  citySearch.addEventListener("input", () => {
    citySelect.value = "";
    openList(citySearch.value);
  });
  citySearch.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (cityOptions.hidden) openList();
      if (!filteredProvinces.length) return;
      const direction = event.key === "ArrowDown" ? 1 : -1;
      activeIndex = activeIndex === -1
        ? (direction === 1 ? 0 : filteredProvinces.length - 1)
        : (activeIndex + direction + filteredProvinces.length) % filteredProvinces.length;
      updateActiveOption();
    } else if (event.key === "Enter" && !cityOptions.hidden && activeIndex >= 0) {
      event.preventDefault();
      selectProvince(filteredProvinces[activeIndex]);
    } else if (event.key === "Escape") {
      closeList();
    }
  });
  cityOptions.addEventListener("mousedown", (event) => {
    const item = event.target.closest('[role="option"]');
    if (item && cityOptions.contains(item)) {
      // Keep the search input focused until the option click is handled.
      event.preventDefault();
    }
  });
  cityOptions.addEventListener("click", (event) => {
    const item = event.target.closest('[role="option"]');
    if (item && cityOptions.contains(item)) {
      selectProvince(filteredProvinces[Number(item.id.replace("city-option-", ""))]);
    }
  });
  document.addEventListener("click", (event) => {
    if (!citySearch.parentElement.contains(event.target)) closeList();
  });
}

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
async function hienThiTomTatThanhToan() {
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
  const savedCoupon = layMaGiamGia();
  const couponState = savedCoupon ? await kiemTraMaGiamGia(subtotal) : null;
  const coupon = couponState?.valid ? couponState.coupon : null;
  const shippingFee = coupon ? coupon.shipping_fee : (isFreeShipping ? 0 : standardShippingFee);
  const discountAmount = coupon ? coupon.discount_amount : 0;
  const grandTotal = coupon ? coupon.total : subtotal + shippingFee;

  container.innerHTML = `
        <div class="checkout-items-list">
            ${cart
              .map(
                (item) => `
                <div class="checkout-item">
                    <img src="${escHtmlSanPham(item.image)}" alt="${escHtmlSanPham(item.name)}" class="checkout-item-thumb">
                    <span class="checkout-item-qty">${item.quantity}</span>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 0.875rem; font-weight: 600; color: var(--color-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${escHtmlSanPham(item.name)}
                        </div>
                        <small class="checkout-item-size">Size: ${escHtmlSanPham(item.size || "M")}</small>
                        
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
                    <span>Ưu đãi (${escHtmlSanPham(coupon.code)}):</span>
                    <span>${coupon.discount_type === 'shipping' ? 'Miễn phí vận chuyển' : '-' + dinhDangTien(discountAmount)}</span>
                </div>
            `
                : ""
            }

            ${savedCoupon && !coupon ? `<div class="cart-summary-row" style="color:var(--color-danger);">${escHtmlSanPham(savedCoupon.code)}: ${escHtmlSanPham(couponState?.message || 'Mã chưa đủ điều kiện.')}</div>` : ""}

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
    if (form.dataset.submitting === "true") return;

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
    const phoneRegex = /^0[35789][0-9]{8}$/;
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
    const citySearch = form.citySearch;
    if (!citySelect.value) {
      setError(citySearch, "Vui lòng chọn Tỉnh/Thành phố trong danh sách.");
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

    // Khóa nút gửi trong lúc API tạo đơn để tránh tạo trùng đơn khi bấm nhiều lần.
    form.dataset.submitting = "true";
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    xuLyDatHang(form).finally(() => {
      form.dataset.submitting = "false";
      if (submitButton) submitButton.disabled = false;
    });
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
async function xuLyDatHang(form) {
  const cart = await capNhatSanPhamGioHang();
  if (cart.some((item) => item.productUnavailable)) {
    hienThiThongBaoNho("Có sản phẩm không còn đủ tồn kho hoặc đã ngừng kinh doanh. Vui lòng quay lại giỏ hàng để kiểm tra.", "error");
    return;
  }
  const savedCoupon = layMaGiamGia();
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const isFreeShipping = subtotal >= 500000;
  const couponState = savedCoupon ? await kiemTraMaGiamGia(subtotal) : null;
  if (savedCoupon && !couponState?.valid) {
    hienThiThongBaoNho(couponState?.message || 'Mã khuyến mãi không còn áp dụng được.', 'error');
    return;
  }
  const coupon = couponState?.valid ? couponState.coupon : null;
  const shippingFee = coupon ? coupon.shipping_fee : (isFreeShipping ? 0 : 30000);
  const discountAmount = coupon ? coupon.discount_amount : 0;
  const grandTotal = coupon ? coupon.total : subtotal + shippingFee;

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

  // Đơn hàng chính thức phải được lưu tại MySQL, không chỉ nằm trong trình duyệt.
  try {
    const authResponse = await fetch("api/auth/me.php", { credentials: "same-origin" });
    const authState = await authResponse.json();
    if (!authState.authenticated || authState.user?.role !== "user") {
      hienThiThongBaoNho("Hãy đăng nhập bằng tài khoản khách hàng để đặt hàng.", "warning");
      if (!authState.authenticated) window.location.href = "login.html?redirect=checkout.html";
      else window.location.href = "products.html";
      return;
    }
    const apiItems = cart.map((item) => ({ id: Number(item.id), quantity: Number(item.quantity), size: item.size || "M" }));
    const orderResponse = await fetch("api/customer/checkout.php", {
      method: "POST", credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient_name: orderData.customer.fullName,
        recipient_phone: orderData.customer.phone,
        shipping_address: [orderData.customer.address, orderData.customer.district, orderData.customer.city].filter(Boolean).join(", "),
        note: orderData.customer.note,
        payment_method: ({ COD: "cod", BANK: "bank_transfer", MOMO: "online" })[paymentMethod] || "cod",
        coupon_code: coupon ? coupon.code : "",
        items: apiItems
      })
    });
    const saved = await orderResponse.json();
    if (!orderResponse.ok || !saved.success) throw new Error(saved.message || "Không thể tạo đơn hàng.");
    orderData.id = saved.order.order_code;
    orderData.status = "Chờ xác nhận";
    orderData.total = Number(saved.order.total);
    orderData.shippingFee = Number(saved.order.shipping_fee);
    orderData.discount = Number(saved.order.discount);
    orderData.couponCode = saved.order.coupon_code || '';
    localStorage.removeItem("fashion_cart");
    localStorage.removeItem("fashion_coupon");
    localStorage.removeItem("fashion_cart_api_dirty");
    localStorage.removeItem("fashion_cart_guest_dirty");
    capNhatSoLuongHuyHieu();
    hienThiThongBaoDatHangThanhCong(orderData);
  } catch (error) {
    hienThiThongBaoNho(error.message || "Không thể kết nối máy chủ để đặt hàng.", "error");
  }
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
                    Cảm ơn quý khách <strong>${escHtmlSanPham(order.customer.fullName)}</strong> đã tin tưởng mua sắm tại <strong>DatNguyenThucShop</strong>.
                </p>

                <div style="background: var(--color-bg-alt); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 18px; text-align: left; margin-bottom: 24px; font-size: 0.875rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: var(--color-text-muted);">Mã đơn hàng:</span>
                        <strong style="color: var(--color-danger); font-size: 1rem;">#${escHtmlSanPham(order.id)}</strong>
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
                        <span style="text-align: right; max-width: 60%;">${escHtmlSanPham([order.customer.address, order.customer.district, order.customer.city].filter(Boolean).join(", "))}</span>
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
