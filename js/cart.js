// PHIEN BAN DE HOC: Ten ham chinh duoc viet bang tieng Viet khong dau de de nho.
// Cach doc: doc tu tren xuong; moi ham xu ly mot cong viec.
/**
 * DatNguyenThucShop - SHOPPING CART LOGIC (localStorage)
 * Quản lý giỏ hàng, cập nhật số lượng, xóa sản phẩm, mã giảm giá và render
 */

let cartApiUserId = null;
let cartApiSaveQueue = Promise.resolve(true);

async function dongBoGioHangSauDangNhap(userId) {
  if (!userId) return false;
  cartApiUserId = String(userId);
  return taiGioHangNguoiDungApi();
}

function danhDauDangXuatGioHang() {
  cartApiUserId = null;
  localStorage.setItem("fashion_cart", "[]");
  localStorage.removeItem("fashion_cart_user_id");
  localStorage.removeItem("fashion_cart_api_dirty");
  localStorage.removeItem("fashion_cart_guest_dirty");
  capNhatSoLuongHuyHieu();
}

async function taiGioHangNguoiDungApi() {
  try {
    const authResponse = await fetch('api/auth/me.php', { credentials: 'same-origin' });
    const auth = await authResponse.json();
    if (!authResponse.ok || !auth.success) throw new Error(auth.message || 'Không thể kiểm tra phiên đăng nhập.');
    if (!auth.authenticated || auth.user?.role !== 'user') {
      cartApiUserId = null;
      return false;
    }

    const userId = String(auth.user.id);
    cartApiUserId = userId;
    const cartResponse = await fetch('api/customer/cart.php', { credentials: 'same-origin' });
    const cartData = await cartResponse.json();
    if (!cartResponse.ok || !cartData.success) throw new Error(cartData.message || 'Không thể tải giỏ hàng tài khoản.');
    const remoteItems = Array.isArray(cartData.items) ? cartData.items : [];
    const ownerId = localStorage.getItem('fashion_cart_user_id');
    const guestCartDirty = localStorage.getItem('fashion_cart_guest_dirty') === '1';

    if (ownerId === userId && guestCartDirty) {
      localStorage.setItem('fashion_cart_api_dirty', '1');
      const saved = await dongBoGioHangMayChu();
      if (saved) localStorage.removeItem('fashion_cart_guest_dirty');
      return saved;
    }

    if (!ownerId) {
      const guestItems = layGioHang();
      const merged = new Map(remoteItems.map((item) => [Number(item.id) + ":" + (item.size || "M"), { ...item, id: Number(item.id), size: item.size || "M" }]));
      guestItems.forEach((item) => {
        const id = Number(item.id);
        if (!id) return;
        const size = ["S", "M", "XL"].includes(item.size) ? item.size : "M";
        const key = id + ":" + size;
        const existing = merged.get(key);
        merged.set(key, existing
          ? { ...existing, quantity: Math.min(99, Number(existing.quantity || 0) + Number(item.quantity || 1)) }
          : { ...item, id, size });
      });
      const combined = [...merged.values()];
      localStorage.setItem('fashion_cart', JSON.stringify(combined));
      localStorage.setItem('fashion_cart_user_id', userId);
      localStorage.removeItem('fashion_cart_guest_dirty');
      if (guestItems.length > 0 || combined.length !== remoteItems.length) {
        localStorage.setItem('fashion_cart_api_dirty', '1');
        return await dongBoGioHangMayChu();
      }
      localStorage.removeItem('fashion_cart_api_dirty');
      return true;
    }

    if (ownerId !== userId) {
      localStorage.setItem('fashion_cart', JSON.stringify(remoteItems));
      localStorage.setItem('fashion_cart_user_id', userId);
      localStorage.removeItem('fashion_cart_guest_dirty');
      localStorage.removeItem('fashion_cart_api_dirty');
      capNhatSoLuongHuyHieu();
      return true;
    }

    if (localStorage.getItem('fashion_cart_api_dirty') === '1') {
      return await dongBoGioHangMayChu();
    }
    localStorage.setItem('fashion_cart', JSON.stringify(remoteItems));
    capNhatSoLuongHuyHieu();
    return true;
  } catch (error) {
    cartApiUserId = null;
    return false;
  }
}

function dongBoGioHangMayChu() {
  if (!cartApiUserId) return Promise.resolve(true);
  cartApiSaveQueue = cartApiSaveQueue.catch(() => false).then(async () => {
    if (!cartApiUserId) return true;
    const items = layGioHang().map((item) => ({ id: Number(item.id), quantity: Number(item.quantity), size: item.size }));
    const response = await fetch('api/customer/cart.php', {
      method: 'PUT',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || 'Không thể đồng bộ giỏ hàng.');
    localStorage.removeItem('fashion_cart_api_dirty');
    localStorage.removeItem('fashion_cart_guest_dirty');
    localStorage.setItem('fashion_cart_user_id', cartApiUserId);
    return true;
  });
  return cartApiSaveQueue.catch(() => {
    localStorage.setItem('fashion_cart_api_dirty', '1');
    return false;
  });
}

// ==========================================================================
// Cart Data Accessors
// ==========================================================================
function layGioHang() {
  try {
    const stored = JSON.parse(localStorage.getItem("fashion_cart") || "[]");
    if (!Array.isArray(stored)) return [];
    return stored
      .filter((item) => item && Number.isFinite(Number(item.id)) && Number(item.id) > 0)
      .map((item) => ({
        ...item,
        id: Number(item.id),
        size: ["S", "M", "XL"].includes(item.size) ? item.size : "M",
        price: Math.max(0, Number(item.price) || 0),
        quantity: Math.max(1, Math.min(99, Number.parseInt(item.quantity, 10) || 1)),
      }));
  } catch (error) {
    localStorage.removeItem("fashion_cart");
    return [];
  }
}

function luuGioHang(cart) {
  localStorage.setItem("fashion_cart", JSON.stringify(cart));
  capNhatSoLuongHuyHieu();
  if (cartApiUserId) {
    localStorage.setItem('fashion_cart_api_dirty', '1');
    return dongBoGioHangMayChu();
  }
  localStorage.setItem('fashion_cart_guest_dirty', '1');
  return Promise.resolve(true);
}

// ==========================================================================
// Add to Cart
// ==========================================================================
async function themVaoGioHang(productId, quantity = 1, size = "M") {
  await taiDanhSachSanPham();
  await capNhatSanPhamGioHang();
  const product = laySanPhamTheoMa(productId);
  if (!product) {
    hienThiThongBaoNho("Không tìm thấy thông tin sản phẩm.", "error");
    return false;
  }

  if (product.status === 'out_of_stock' || Number(product.stock) < 1) {
    hienThiThongBaoNho("Sản phẩm hiện đã hết hàng.", "warning");
    return false;
  }

  const qty = parseInt(quantity, 10) || 1;
  if (!["S", "M", "XL"].includes(size)) {
    hienThiThongBaoNho("Vui lòng chọn size S, M hoặc XL.", "warning");
    return false;
  }
  if (qty < 1 || qty > 99) {
    hienThiThongBaoNho("Số lượng không hợp lệ.", "warning");
    return false;
  }

  let cart = layGioHang();
  const existingIndex = cart.findIndex((item) => item.id === product.id && item.size === size && !item.productUnavailable);
  const totalForProduct = cart.filter((item) => item.id === product.id).reduce((sum, item) => sum + item.quantity, 0);
  const maxAllowed = Math.min(99, Number(product.stock) || 0);
  if (maxAllowed < 1) {
    hienThiThongBaoNho("Sản phẩm hiện đã hết hàng.", "warning");
    return false;
  }
  if (totalForProduct + qty > maxAllowed) {
    hienThiThongBaoNho("Tổng số lượng các size vượt tồn kho hiện tại.", "warning");
    return false;
  }
  if (existingIndex > -1) {
    cart[existingIndex].quantity += qty;
  } else {
    cart.push({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice || null,
      image: product.image,
      size,
      quantity: qty,
    });
  }

  const cartSynced = await luuGioHang(cart);
  hienThiThongBaoNho(cartSynced ? "Đã thêm sản phẩm vào giỏ hàng." : "Đã cập nhật giỏ trên thiết bị; chưa đồng bộ được tài khoản.", cartSynced ? "success" : "warning");

  // Nếu đang ở trang giỏ hàng, cập nhật lại view
  if (document.getElementById("cartPageContainer")) {
    hienThiTrangGioHang();
  }
  return true;
}

// ==========================================================================
// Update Cart Size
// ==========================================================================
async function capNhatSizeSanPham(index, size) {
  if (!["S", "M", "XL"].includes(size)) return;
  const cart = layGioHang();
  const item = cart[index];
  if (!item || item.size === size) return;
  const duplicate = cart.find((candidate, candidateIndex) => candidateIndex !== index && candidate.id === item.id && candidate.size === size);
  if (duplicate) {
    const product = laySanPhamTheoMa(item.id);
    const combinedQuantity = duplicate.quantity + item.quantity;
    if (combinedQuantity > Math.min(99, Number(product?.stock) || 99)) {
      hienThiThongBaoNho("Tổng số lượng các size không được vượt tồn kho hiện tại.", "warning");
      hienThiTrangGioHang();
      return;
    }
    duplicate.quantity = combinedQuantity;
    cart.splice(index, 1);
  } else {
    item.size = size;
  }
  const cartSynced = await luuGioHang(cart);
  if (!cartSynced) hienThiThongBaoNho("Chưa đồng bộ được giỏ hàng tài khoản.", "warning");
  hienThiTrangGioHang();
}

// ==========================================================================
// Update Quantity
// ==========================================================================
async function capNhatSoLuongSanPham(index, newQty) {
  let cart = layGioHang();
  if (!cart[index]) return;

  const qty = parseInt(newQty, 10);
  if (!Number.isFinite(qty)) {
    hienThiTrangGioHang();
    return;
  }
  if (qty <= 0) {
    xacNhanXoaSanPham(index);
    return;
  }

  const otherSizesQuantity = cart.reduce((sum, item, itemIndex) => sum + (itemIndex !== index && item.id === cart[index].id ? item.quantity : 0), 0);
  const maxAllowed = Math.min(99, Math.max(0, Number(cart[index].stock) - otherSizesQuantity));
  if (qty > maxAllowed) {
    hienThiThongBaoNho("Tổng số lượng các size không được vượt tồn kho hiện tại.", "warning");
    hienThiTrangGioHang();
    return;
  }
  cart[index].quantity = qty;
  const cartSynced = await luuGioHang(cart);
  if (!cartSynced) hienThiThongBaoNho("Chưa đồng bộ được giỏ hàng tài khoản.", "warning");
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
    message: `Bạn có chắc chắn muốn xóa "<strong>${escHtmlSanPham(item.name)}</strong>" khỏi giỏ hàng?`,
    confirmText: "Xóa",
    cancelText: "Giữ lại",
    onConfirm: async () => {
      cart.splice(index, 1);
      const cartSynced = await luuGioHang(cart);
      hienThiThongBaoNho(cartSynced ? "Đã xóa sản phẩm." : "Đã xóa trên thiết bị; chưa đồng bộ được tài khoản.", cartSynced ? "info" : "warning");
      hienThiTrangGioHang();
    },
  });
}

async function xoaToanBoGioHang() {
  localStorage.setItem("fashion_cart", "[]");
  localStorage.removeItem("fashion_coupon");
  capNhatSoLuongHuyHieu();
  const cartSynced = await luuGioHang([]);
  if (!cartSynced) hienThiThongBaoNho("Giỏ trên thiết bị đã được xóa; chưa đồng bộ được tài khoản.", "warning");
  hienThiTrangGioHang();
}

// ==========================================================================
// Coupon System: mã và điều kiện được xác nhận bởi máy chủ.
function layMaGiamGia() {
  try {
    const stored = JSON.parse(localStorage.getItem('fashion_coupon') || 'null');
    const code = typeof stored === 'string' ? stored : stored?.code;
    return typeof code === 'string' && /^[A-Z0-9_-]{3,40}$/.test(code) ? { code } : null;
  } catch (error) {
    localStorage.removeItem('fashion_coupon');
    return null;
  }
}

async function kiemTraMaGiamGia(subtotal, inputCode = '') {
  const saved = layMaGiamGia();
  const code = (inputCode || saved?.code || '').trim().toUpperCase();
  if (!code) return null;
  try {
    const response = await fetch('api/coupons.php', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal })
    });
    const result = await response.json();
    if (!response.ok || !result.success) return { valid: false, code, message: result.message || 'Mã khuyến mãi chưa áp dụng được.' };
    return { valid: true, code: result.coupon.code, coupon: result.coupon };
  } catch (error) {
    return { valid: false, code, message: 'Không thể kiểm tra mã khuyến mãi lúc này.' };
  }
}

function moTaMaGiamGia(coupon) {
  if (coupon.description) return coupon.description;
  if (coupon.discount_type === 'percent') return 'Giảm ' + coupon.discount_value + '%';
  if (coupon.discount_type === 'fixed') return 'Giảm ' + dinhDangTien(coupon.discount_value);
  return 'Miễn phí vận chuyển';
}

async function apDungMaGiamGia(inputCode) {
  const code = (inputCode || '').trim().toUpperCase();
  if (!code) {
    hienThiThongBaoNho('Vui lòng nhập mã khuyến mãi.', 'warning');
    return;
  }
  const subtotal = layGioHang().reduce((sum, item) => sum + item.price * item.quantity, 0);
  const result = await kiemTraMaGiamGia(subtotal, code);
  if (!result?.valid) {
    hienThiThongBaoNho(result?.message || 'Mã khuyến mãi không hợp lệ.', 'error');
    return;
  }
  localStorage.setItem('fashion_coupon', JSON.stringify({ code: result.code }));
  hienThiThongBaoNho('Đã áp dụng mã khuyến mãi.', 'success');
  await hienThiTrangGioHang();
}

function xoaMaGiamGia() {
  localStorage.removeItem('fashion_coupon');
  hienThiThongBaoNho('Đã hủy áp dụng mã khuyến mãi.', 'info');
  hienThiTrangGioHang();
}

async function capNhatSanPhamGioHang() {
  await taiDanhSachSanPham(true);
  await taiGioHangNguoiDungApi();
  const items = layGioHang();
  const totals = new Map();
  items.forEach((item) => totals.set(item.id, (totals.get(item.id) || 0) + item.quantity));
  const cart = items.map((item) => {
    const product = DANH_SACH_SAN_PHAM.find((candidate) => candidate.id === Number(item.id));
    if (!product) return { ...item, stock: 0, productUnavailable: true, productUnavailableReason: "missing" };
    const exceedsStock = product.stock < (totals.get(item.id) || 0);
    return { ...item, id: product.id, size: item.size || "M", slug: product.slug, name: product.name, image: product.image, price: product.price, oldPrice: product.oldPrice, stock: product.stock, productUnavailable: exceedsStock, productUnavailableReason: exceedsStock ? "stock" : "" };
  });
  localStorage.setItem("fashion_cart", JSON.stringify(cart));
  capNhatSoLuongHuyHieu();
  return cart;
}

// ==========================================================================
// Render Cart Page (cart.html)
// ==========================================================================
async function hienThiTrangGioHang() {
  const container = document.getElementById("cartPageContainer");
  if (!container) return;

  const cart = await capNhatSanPhamGioHang();

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

  const savedCoupon = layMaGiamGia();
  const couponState = savedCoupon ? await kiemTraMaGiamGia(subtotal) : null;
  const coupon = couponState?.valid ? couponState.coupon : null;
  const shippingFee = coupon ? coupon.shipping_fee : (isFreeShipping ? 0 : standardShippingFee);
  const discountAmount = coupon ? coupon.discount_amount : 0;
  const grandTotal = coupon ? coupon.total : subtotal + shippingFee;

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
                                                    <img src="${escHtmlSanPham(item.image)}" alt="${escHtmlSanPham(item.name)}" class="cart-thumb">
                                                </a>
                                                <div>
                                                    <a href="product-detail.html?id=${item.id}" class="cart-item-title">${escHtmlSanPham(item.name)}</a>
                                                    <label class="cart-size-control">Size: <select aria-label="Chọn size cho ${escHtmlSanPham(item.name)}" onchange="capNhatSizeSanPham(${index}, this.value)">
                                                        <option value="S" ${item.size === "S" ? "selected" : ""}>S</option>
                                                        <option value="M" ${item.size === "M" ? "selected" : ""}>M</option>
                                                        <option value="XL" ${item.size === "XL" ? "selected" : ""}>XL</option>
                                                    </select></label>
                                                    
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
                        <span>Ưu đãi (${escHtmlSanPham(coupon.code)}):</span>
                        <span>${coupon.discount_type === 'shipping' ? 'Miễn phí vận chuyển' : '-' + dinhDangTien(discountAmount)}</span>
                    </div>
                `
                    : ""
                }

                <!-- Nhập mã khuyến mãi -->
                <div style="margin: 20px 0; padding-top: 16px; border-top: 1px dashed var(--color-border);">
                    <label class="nhan-truong-nhap" style="font-size: 0.85rem; margin-bottom: 6px;">
                        Mã khuyến mãi <span style="font-size: 0.75rem; color: var(--color-accent-hover); font-weight: 500;">(Nhập mã do cửa hàng cung cấp)</span>
                    </label>
                    ${
                      coupon
                        ? `
                        <div style="display: flex; align-items: center; justify-content: space-between; background: var(--color-accent-light); padding: 10px 14px; border-radius: var(--radius-md); border: 1px solid rgba(197, 168, 128, 0.4);">
                            <div>
                                <strong style="color: var(--color-primary); font-size: 0.9rem;">${escHtmlSanPham(coupon.code)}</strong>
                                <div style="font-size: 0.75rem; color: var(--color-text-muted);">${escHtmlSanPham(moTaMaGiamGia(coupon))}</div>
                            </div>
                            <button type="button" class="nut nut-nho" style="color: var(--color-danger); padding: 4px 8px;" onclick="xoaMaGiamGia()">
                                <i class="fa-solid fa-xmark"></i> Hủy
                            </button>
                        </div>
                    `
                        : `
                        ${savedCoupon ? `<div style="font-size:0.78rem;color:#9a3412;margin-bottom:8px;">${escHtmlSanPham(savedCoupon.code)}: ${escHtmlSanPham(couponState?.message || 'Mã chưa đủ điều kiện.')}</div>` : ""}
                        <form class="coupon-form-group" onsubmit="event.preventDefault(); apDungMaGiamGia(this.couponInput.value);">
                            <input type="text" name="couponInput" class="o-nhap" placeholder="Nhập mã khuyến mãi" style="text-transform: uppercase;">
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
  const rows = container.querySelectorAll(".cart-table tbody tr");
  cart.forEach((item, index) => {
    if (!item.productUnavailable) return;
    const title = rows[index]?.querySelector(".cart-item-title");
    if (title) title.textContent += item.productUnavailableReason === "stock" ? " (Vượt tồn kho: " + item.stock + ")" : " (Đã ngừng bán)";
  });
  if (cart.some((item) => item.productUnavailable)) {
    const checkoutLink = container.querySelector(".khung-tong-gio-hang a");
    if (checkoutLink) checkoutLink.outerHTML = '<button type="button" class="nut nut-chinh nut-rong nut-lon" disabled>Kiểm tra sản phẩm trước khi thanh toán</button>';
  }
}

// Khởi chạy khi tải trang giỏ hàng
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("cartPageContainer")) {
    hienThiTrangGioHang();
  }
});
