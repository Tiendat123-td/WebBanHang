// PHIEN BAN DE HOC: Ten ham chinh duoc viet bang tieng Viet khong dau de de nho.
// Cach doc: doc tu tren xuong; moi ham xu ly mot cong viec.
/**
 * DatNguyenThucShop - SHOPPING CART LOGIC (localStorage)
 * Quản lý giỏ hàng, cập nhật số lượng, xóa sản phẩm, mã giảm giá và render
 */

// ==========================================================================
// Cart Data Accessors
// ==========================================================================
function layGioHang() {
  return JSON.parse(localStorage.getItem("fashion_cart") || "[]");
}

function luuGioHang(cart) {
  localStorage.setItem("fashion_cart", JSON.stringify(cart));
  capNhatSoLuongHuyHieu();
}

// ==========================================================================
// Add to Cart
// ==========================================================================
function themVaoGioHang(productId, quantity = 1, color = null, size = null) {
  const product = laySanPhamTheoMa(productId);
  if (!product) {
    hienThiThongBaoNho("Không tìm thấy thông tin sản phẩm.", "error");
    return;
  }

  const selectedColor = color || product.colors[0]?.name || "Tiêu chuẩn";
  const selectedSize = size || product.sizes[0] || "Freesize";
  const qty = parseInt(quantity, 10) || 1;

  let cart = layGioHang();

  // Tìm xem đã có sản phẩm này cùng màu và size trong giỏ chưa
  const existingIndex = cart.findIndex(
    (item) =>
      item.id === product.id &&
      item.color === selectedColor &&
      item.size === selectedSize,
  );

  if (existingIndex > -1) {
    cart[existingIndex].quantity += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice || null,
      image: product.image,
      color: selectedColor,
      size: selectedSize,
      quantity: qty,
    });
  }

  luuGioHang(cart);
  hienThiThongBaoNho("Đã thêm sản phẩm vào giỏ hàng.", "success");

  // Nếu đang ở trang giỏ hàng, cập nhật lại view
  if (document.getElementById("cartPageContainer")) {
    hienThiTrangGioHang();
  }
}

// ==========================================================================
// Update Quantity
// ==========================================================================
function capNhatSoLuongSanPham(index, newQty) {
  let cart = layGioHang();
  if (!cart[index]) return;

  const qty = parseInt(newQty, 10);
  if (qty <= 0) {
    xacNhanXoaSanPham(index);
    return;
  }

  cart[index].quantity = Math.min(99, qty);
  luuGioHang(cart);
  hienThiTrangGioHang();
}

function tangGiamSoLuong(index, delta) {
  let cart = layGioHang();
  if (!cart[index]) return;

  const currentQty = cart[index].quantity;
  const nextQty = currentQty + delta;
  capNhatSoLuongSanPham(index, nextQty);
}

// ==========================================================================
// Remove Item from Cart with Confirmation Modal
// ==========================================================================
function xacNhanXoaSanPham(index) {
  let cart = layGioHang();
  const item = cart[index];
  if (!item) return;

  hienThiHopThoaiXacNhan({
    title: "Xóa sản phẩm",
    message: `Bạn có chắc chắn muốn xóa "<strong>${item.name}</strong>" (${item.color}, Size ${item.size}) khỏi giỏ hàng?`,
    confirmText: "Xóa",
    cancelText: "Giữ lại",
    onConfirm: () => {
      cart.splice(index, 1);
      luuGioHang(cart);
      hienThiThongBaoNho("Đã xóa sản phẩm.", "info");
      hienThiTrangGioHang();
    },
  });
}

function xoaToanBoGioHang() {
  localStorage.removeItem("fashion_cart");
  localStorage.removeItem("fashion_coupon");
  capNhatSoLuongHuyHieu();
  hienThiTrangGioHang();
}

// ==========================================================================
// Coupon System (SALE10, VIP20, FREESHIP)
// ==========================================================================
function layMaGiamGia() {
  return JSON.parse(localStorage.getItem("fashion_coupon") || "null");
}

function apDungMaGiamGia(inputCode) {
  const code = (inputCode || "").trim().toUpperCase();

  if (!code) {
    hienThiThongBaoNho("Vui lòng nhập mã giảm giá.", "warning");
    return;
  }

  if (code === "SALE10") {
    const couponData = {
      code: "SALE10",
      type: "percent",
      value: 10,
      label: "Giảm 10% tổng đơn",
    };
    localStorage.setItem("fashion_coupon", JSON.stringify(couponData));
    hienThiThongBaoNho("Áp dụng mã giảm giá thành công.", "success");
    hienThiTrangGioHang();
  } else if (code === "VIP20") {
    const couponData = {
      code: "VIP20",
      type: "percent",
      value: 20,
      label: "Giảm 20% VIP",
    };
    localStorage.setItem("fashion_coupon", JSON.stringify(couponData));
    hienThiThongBaoNho("Áp dụng mã giảm giá thành công.", "success");
    hienThiTrangGioHang();
  } else if (code === "FREESHIP") {
    const couponData = {
      code: "FREESHIP",
      type: "shipping",
      value: 30000,
      label: "Miễn phí vận chuyển",
    };
    localStorage.setItem("fashion_coupon", JSON.stringify(couponData));
    hienThiThongBaoNho("Áp dụng mã giảm giá thành công.", "success");
    hienThiTrangGioHang();
  } else {
    hienThiThongBaoNho("Mã giảm giá không hợp lệ.", "error");
  }
}

function xoaMaGiamGia() {
  localStorage.removeItem("fashion_coupon");
  hienThiThongBaoNho("Đã hủy áp dụng mã giảm giá.", "info");
  hienThiTrangGioHang();
}

// ==========================================================================
// Render Cart Page (cart.html)
// ==========================================================================
function hienThiTrangGioHang() {
  const container = document.getElementById("cartPageContainer");
  if (!container) return;

  const cart = layGioHang();

  if (cart.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fa-solid fa-cart-shopping"></i>
                </div>
                <h2 class="empty-state-title">Giỏ hàng của bạn đang trống</h2>
                <p class="empty-state-desc">
                    Có vẻ như bạn chưa chọn được sản phẩm thời trang ưng ý nào. Hãy dạo quanh bộ sưu tập mới của chúng tôi nhé!
                </p>
                <a href="products.html" class="nut nut-chinh nut-lon">
                    <i class="fa-solid fa-arrow-left"></i> Khám phá sản phẩm ngay
                </a>
            </div>
        `;
    return;
  }

  // Tính toán tài chính
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

  // Tính progress bar freeship
  const progressPercent = Math.min(
    100,
    Math.round((subtotal / freeshipThreshold) * 100),
  );
  const missingForFreeship = freeshipThreshold - subtotal;

  container.innerHTML = `
        <div class="cart-page-layout">
            <!-- Cột danh sách sản phẩm -->
            <div class="cart-items-wrapper">
                <!-- Freeship Progress Meter -->
                <div class="shipping-progress-box">
                    <div class="shipping-progress-text">
                        <i class="fa-solid fa-truck-fast" style="color: var(--color-accent-hover);"></i>
                        ${
                          isFreeShipping
                            ? "<span>Chúc mừng! Đơn hàng của bạn được <strong>MIỄN PHÍ VẬN CHUYỂN</strong> toàn quốc!</span>"
                            : `<span>Mua thêm <strong>${dinhDangTien(missingForFreeship)}</strong> để nhận <strong>Freeship</strong>!</span>`
                        }
                    </div>
                    <div class="shipping-progress-bar">
                        <div class="shipping-progress-fill" style="width: ${progressPercent}%;"></div>
                    </div>
                </div>

                <div style="background: #FFFFFF; border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden;">
                    <table class="cart-table">
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>Đơn giá</th>
                                <th style="text-align: center;">Số lượng</th>
                                <th>Thành tiền</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${cart
                              .map((item, index) => {
                                const itemTotal = item.price * item.quantity;
                                return `
                                    <tr>
                                        <td>
                                            <div class="cart-product-cell">
                                                <a href="product-detail.html?id=${item.id}">
                                                    <img src="${item.image}" alt="${item.name}" class="cart-thumb">
                                                </a>
                                                <div>
                                                    <a href="product-detail.html?id=${item.id}" class="cart-item-title">${item.name}</a>
                                                    <div class="cart-item-variant">
                                                        Phân loại: <strong>${item.color}</strong> / Size: <strong>${item.size}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="cart-item-price">${dinhDangTien(item.price)}</div>
                                        </td>
                                        <td style="text-align: center;">
                                            <div class="qty-control">
                                                <button type="button" class="qty-btn" onclick="tangGiamSoLuong(${index}, -1)">-</button>
                                                <input type="number" class="qty-input" value="${item.quantity}" min="1" max="99" onchange="capNhatSoLuongSanPham(${index}, this.value)">
                                                <button type="button" class="qty-btn" onclick="tangGiamSoLuong(${index}, 1)">+</button>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="cart-item-total">${dinhDangTien(itemTotal)}</div>
                                        </td>
                                        <td style="text-align: center;">
                                            <button type="button" class="cart-remove-btn" title="Xóa sản phẩm" onclick="xacNhanXoaSanPham(${index})">
                                                <i class="fa-regular fa-trash-can"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `;
                              })
                              .join("")}
                        </tbody>
                    </table>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; flex-wrap: wrap; gap: 12px;">
                    <a href="products.html" class="nut nut-phu">
                        <i class="fa-solid fa-arrow-left"></i> Tiếp tục mua hàng
                    </a>
                    <button type="button" class="nut nut-vien" style="color: var(--color-danger); border-color: var(--color-danger);" onclick="hienThiHopThoaiXacNhan({ title: 'Xóa toàn bộ giỏ hàng', message: 'Bạn có chắc chắn muốn dọn sạch tất cả sản phẩm trong giỏ hàng?', confirmText: 'Xóa hết', onConfirm: xoaToanBoGioHang })">
                        <i class="fa-solid fa-trash"></i> Xóa tất cả
                    </button>
                </div>
            </div>

            <!-- Cột tóm tắt đơn hàng -->
            <div class="khung-tong-gio-hang">
                <h3 class="tieu-de-tong-gio-hang">Tóm tắt đơn hàng</h3>

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
                        <span>Mã giảm giá (${coupon.code}):</span>
                        <span>-${dinhDangTien(discountAmount)}</span>
                    </div>
                `
                    : ""
                }

                <!-- Nhập mã khuyến mãi -->
                <div style="margin: 20px 0; padding-top: 16px; border-top: 1px dashed var(--color-border);">
                    <label class="nhan-truong-nhap" style="font-size: 0.85rem; margin-bottom: 6px;">
                        Mã khuyến mãi <span style="font-size: 0.75rem; color: var(--color-accent-hover); font-weight: 500;">(Thử: SALE10, VIP20, FREESHIP)</span>
                    </label>
                    ${
                      coupon
                        ? `
                        <div style="display: flex; align-items: center; justify-content: space-between; background: var(--color-accent-light); padding: 10px 14px; border-radius: var(--radius-md); border: 1px solid rgba(197, 168, 128, 0.4);">
                            <div>
                                <strong style="color: var(--color-primary); font-size: 0.9rem;">${coupon.code}</strong>
                                <div style="font-size: 0.75rem; color: var(--color-text-muted);">${coupon.label}</div>
                            </div>
                            <button type="button" class="nut nut-nho" style="color: var(--color-danger); padding: 4px 8px;" onclick="xoaMaGiamGia()">
                                <i class="fa-solid fa-xmark"></i> Hủy
                            </button>
                        </div>
                    `
                        : `
                        <form class="coupon-form-group" onsubmit="event.preventDefault(); apDungMaGiamGia(this.couponInput.value);">
                            <input type="text" name="couponInput" class="o-nhap" placeholder="Nhập mã (VD: SALE10)" style="text-transform: uppercase;">
                            <button type="submit" class="nut nut-chinh" style="padding: 0 18px;">Áp dụng</button>
                        </form>
                    `
                    }
                </div>

                <div class="cart-summary-row total-row">
                    <span>Tổng tiền:</span>
                    <span style="color: var(--color-danger);">${dinhDangTien(grandTotal)}</span>
                </div>

                <p style="font-size: 0.75rem; color: var(--color-text-light); margin-bottom: 20px;">
                    (Đã bao gồm thuế GTGT nếu có)
                </p>

                <a href="checkout.html" class="nut nut-chinh nut-rong nut-lon" style="letter-spacing: 0.5px;">
                    <i class="fa-solid fa-credit-card"></i> Tiến hành thanh toán
                </a>

                <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 8px; font-size: 0.8rem; color: var(--color-text-muted);">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-shield-halved" style="color: var(--color-success);"></i> Bảo mật thông tin thanh toán tuyệt đối
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-rotate-left" style="color: var(--color-accent-hover);"></i> Đổi trả hàng miễn phí trong vòng 30 ngày
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Khởi chạy khi tải trang giỏ hàng
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("cartPageContainer")) {
    hienThiTrangGioHang();
  }
});
