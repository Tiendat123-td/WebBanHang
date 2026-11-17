// PHIEN BAN DE HOC: Ten ham chinh duoc viet bang tieng Viet khong dau de de nho.
// Cach doc: doc tu tren xuong; moi ham xu ly mot cong viec.
/**
 * DatNguyenThucShop - MAIN JAVASCRIPT
 * Header effects, Navigation, Wishlist, Search, Toast, Quick View, Modals
 */

// ==========================================================================
// Initialization on DOM Load
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  khoiTaoHieuUngDauTrang();
  khoiTaoTimKiem();
  khoiTaoMenuNguoiDung();
  khoiTaoNutLenDauTrang();
  khoiTaoDangKyTinTuc();
  capNhatSoLuongHuyHieu();
  caiDatSuKienToanTrang();
});

// ==========================================================================
// Header Scroll Effect & Sticky State
// ==========================================================================
function khoiTaoHieuUngDauTrang() {
  const header = document.querySelector(".dau-trang");
  if (!header) return;

  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY > 30) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    },
    { passive: true },
  );
}

// ==========================================================================
// Mobile Off-canvas Navigation Drawer
// Header Search & Live Suggestions
// ==========================================================================
function khoiTaoTimKiem() {
  const searchInputs = document.querySelectorAll(".o-tim-kiem");
  const searchBtns = document.querySelectorAll(".nut-tim-kiem");

  searchInputs.forEach((input) => {
    const formWrapper = input.closest(".tim-kiem-dau-trang") || input.parentElement;
    let dropdown = formWrapper
      ? formWrapper.querySelector(".goi-y-tim-kiem")
      : null;

    // Xử lý khi gõ tìm kiếm live suggestion
    input.addEventListener("input", async (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (!query) {
        if (dropdown) dropdown.classList.remove("is-open");
        return;
      }

      if (!dropdown && formWrapper) {
        dropdown = document.createElement("div");
        dropdown.className = "goi-y-tim-kiem";
        formWrapper.appendChild(dropdown);
      }

      const products = await taiDanhSachSanPham();
      if (input.value.trim().toLowerCase() !== query) return;
      const normalizedQuery = chuanHoaChuoiDanhMuc(query);
      const matched = products.filter((p) =>
        chuanHoaChuoiDanhMuc(p.name).includes(normalizedQuery) ||
        chuanHoaChuoiDanhMuc(p.category).includes(normalizedQuery) ||
        chuanHoaChuoiDanhMuc(p.description).includes(normalizedQuery)
      ).slice(0, 5);

      if (matched.length > 0) {
        dropdown.innerHTML =
          matched
            .map(
              (p) => `
                    <a href="product-detail.html?id=${p.id}" class="muc-ket-qua-tim-kiem">
                        <img src="${escHtmlSanPham(p.image)}" alt="${escHtmlSanPham(p.name)}" class="anh-ket-qua-tim-kiem">
                        <div class="thong-tin-ket-qua-tim-kiem">
                            <div class="ten-ket-qua-tim-kiem">${escHtmlSanPham(p.name)}</div>
                            <div class="gia-ket-qua-tim-kiem">${dinhDangTien(p.price)}</div>
                        </div>
                    </a>
                `,
            )
            .join("") +
          `
                    <a href="products.html?search=${encodeURIComponent(query)}" class="xem-tat-ca-ket-qua">
                        Xem tất cả kết quả cho "${escHtmlSanPham(query)}" <i class="fa-solid fa-arrow-right"></i>
                    </a>
                `;
        dropdown.classList.add("is-open");
      } else {
        dropdown.innerHTML = `
                    <div style="padding: 16px; text-align: center; color: var(--color-text-muted); font-size: 0.85rem;">
                        Không tìm thấy sản phẩm phù hợp.
                    </div>
                `;
        dropdown.classList.add("is-open");
      }
    });

    // Xử lý khi nhấn Enter
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const query = input.value.trim();
        if (query) {
          window.location.href = `products.html?search=${encodeURIComponent(query)}`;
        }
      }
    });
  });

  searchBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const wrapper = btn.closest(".tim-kiem-dau-trang") || btn.parentElement;
      const input = wrapper ? wrapper.querySelector(".o-tim-kiem") : null;
      if (input && input.value.trim()) {
        window.location.href = `products.html?search=${encodeURIComponent(input.value.trim())}`;
      }
    });
  });

  // Đóng dropdown khi click ra ngoài
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".tim-kiem-dau-trang")) {
      document
        .querySelectorAll(".goi-y-tim-kiem")
        .forEach((d) => d.classList.remove("is-open"));
    }
  });
}

// ==========================================================================
// User Header Menu Dropdown & Auth Sync
// ==========================================================================
function khoiTaoMenuNguoiDung() {
  const userBtn = document.querySelector(".nut-tai-khoan");
  const dropdown = document.querySelector(".menu-tai-khoan");

  if (!userBtn || !dropdown) return;

  userBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropdown.classList.toggle("is-open");
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".khung-tai-khoan")) {
      dropdown.classList.remove("is-open");
    }
  });

  hienThiTrangThaiNguoiDung();
}

function hienThiTrangThaiNguoiDung() {
  const dropdown = document.querySelector(".menu-tai-khoan");
  if (!dropdown) return;

  const currentUser = JSON.parse(
    localStorage.getItem("fashion_current_user") || "null",
  );

  if (currentUser) {
    dropdown.innerHTML = `
            <div class="account-dropdown-header">
                <div class="account-user-name">${escHtmlSanPham(currentUser.name || "Khách hàng")}</div>
                <div class="account-user-email">${escHtmlSanPham(currentUser.email || "")}</div>
            </div>
            ${currentUser.role === "admin"
              ? '<a href="admin/index.php" target="_top" class="account-dropdown-link"><i class="fa-solid fa-gauge-high"></i> Quản trị hệ thống</a>'
              : '<a href="profile.html?tab=info" target="_top" class="account-dropdown-link"><i class="fa-regular fa-user"></i> Tài khoản của tôi</a><a href="profile.html?tab=orders" target="_top" class="account-dropdown-link"><i class="fa-solid fa-box"></i> Đơn mua của tôi</a><a href="profile.html?tab=wishlist" target="_top" class="account-dropdown-link"><i class="fa-regular fa-heart"></i> Danh sách yêu thích</a>'}
            <a href="#" class="account-dropdown-link text-danger" onclick="dangXuatNguoiDung(event)">
                <i class="fa-solid fa-arrow-right-from-bracket"></i> Đăng xuất
            </a>
        `;
  } else {
    dropdown.innerHTML = `
            <div class="account-dropdown-header">
                <div class="account-user-name">Chào mừng bạn!</div>
                <div class="account-user-email">Đăng nhập để nhận ưu đãi</div>
            </div>
            <a href="login.html" target="_top" class="account-dropdown-link">
                <i class="fa-solid fa-arrow-right-to-bracket"></i> Đăng nhập
            </a>
            <a href="register.html" target="_top" class="account-dropdown-link">
                <i class="fa-regular fa-id-card"></i> Đăng ký tài khoản
            </a>
        `;
  }
}

async function dangXuatNguoiDung(e) {
  if (e) e.preventDefault();
  let cartSynced = true;
  if (typeof dongBoGioHangMayChu === "function") {
    try { cartSynced = await dongBoGioHangMayChu(); } catch (error) { cartSynced = false; }
  }
  try {
    const response = await fetch("api/auth/logout.php", { method: "POST", credentials: "same-origin" });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || "Không thể đăng xuất.");
    if (typeof danhDauDangXuatGioHang === "function") danhDauDangXuatGioHang();
    localStorage.removeItem("fashion_current_user");
    hienThiTrangThaiNguoiDung();
    hienThiThongBaoNho(cartSynced ? "Đã đăng xuất thành công." : "Đã đăng xuất; giỏ hàng chưa đồng bộ được với tài khoản.", cartSynced ? "info" : "warning");
    setTimeout(function () { window.top.location.href = "index.html"; }, 600);
  } catch (error) {
    hienThiThongBaoNho(error.message || "Không thể kết nối máy chủ để đăng xuất.", "error");
  }
}

// ==========================================================================
// Wishlist System (localStorage)
// ==========================================================================
function layDanhSachYeuThich() {
  try {
    const stored = JSON.parse(localStorage.getItem("fashion_wishlist") || "[]");
    return Array.isArray(stored)
      ? [...new Set(stored.map((id) => Number.parseInt(id, 10)).filter((id) => Number.isInteger(id) && id > 0))]
      : [];
  } catch (error) {
    localStorage.removeItem("fashion_wishlist");
    return [];
  }
}

function kiemTraSanPhamYeuThich(productId) {
  const wishlist = layDanhSachYeuThich();
  return wishlist.includes(parseInt(productId, 10));
}

function batTatYeuThich(productId) {
  let wishlist = layDanhSachYeuThich();
  const id = parseInt(productId, 10);
  const index = wishlist.indexOf(id);

  const product = laySanPhamTheoMa(id);
  const productName = product ? product.name : "Sản phẩm";

  if (index > -1) {
    wishlist.splice(index, 1);
    hienThiThongBaoNho(`Đã xóa "${productName}" khỏi danh sách yêu thích.`, "info");
  } else {
    wishlist.push(id);
    hienThiThongBaoNho(`Đã thêm "${productName}" vào danh sách yêu thích.`, "success");
  }

  localStorage.setItem("fashion_wishlist", JSON.stringify(wishlist));
  capNhatSoLuongHuyHieu();
  dongBoNutYeuThich();

  // Nếu đang ở trang profile tab wishlist, re-render
  if (typeof hienThiSanPhamYeuThich === "function") {
    hienThiSanPhamYeuThich();
  }
}

function dongBoNutYeuThich() {
  const wishlist = layDanhSachYeuThich();
  document.querySelectorAll(".btn-wishlist-toggle").forEach((btn) => {
    const id = parseInt(btn.getAttribute("data-id"), 10);
    if (wishlist.includes(id)) {
      btn.classList.add("dang-mo", "dang-chon");
      btn.innerHTML =
        '<i class="fa-solid fa-heart" style="color: var(--color-danger);"></i>';
    } else {
      btn.classList.remove("dang-mo", "dang-chon");
      btn.innerHTML = '<i class="fa-regular fa-heart"></i>';
    }
  });
}

// ==========================================================================
// Badges Counter Updater
// ==========================================================================
function capNhatSoLuongHuyHieu() {
  // Wishlist badge
  const wishlist = layDanhSachYeuThich();
  const wishlistCount = wishlist.length;
  document.querySelectorAll(".so-luong-yeu-thich").forEach((el) => {
    el.textContent = wishlistCount;
  });

  // Cart badge
  let cart = [];
  try {
    const storedCart = JSON.parse(localStorage.getItem("fashion_cart") || "[]");
    cart = Array.isArray(storedCart) ? storedCart : [];
  } catch (error) {
    localStorage.removeItem("fashion_cart");
  }
  const totalQty = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  document.querySelectorAll(".so-luong-gio-hang").forEach((el) => {
    el.textContent = totalQty;
  });
}

// ==========================================================================
// Toast Notification System
// ==========================================================================
function hienThiThongBaoNho(message, type = "success", duration = 3200) {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  let icon = "fa-check-circle";
  let title = "Thành công";

  if (type === "error") {
    icon = "fa-circle-xmark";
    title = "Thông báo";
  } else if (type === "info") {
    icon = "fa-circle-info";
    title = "Thông tin";
  } else if (type === "warning") {
    icon = "fa-triangle-exclamation";
    title = "Lưu ý";
  }

  toast.innerHTML = `
        <div class="toast-icon">
            <i class="fa-solid ${icon}"></i>
        </div>
        <div class="toast-body">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${escHtmlSanPham(message)}</div>
        </div>
        <button type="button" class="toast-close" aria-label="Close">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

  container.appendChild(toast);

  // Animation show
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  const closeToast = () => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 350);
  };

  toast.querySelector(".toast-close").addEventListener("click", closeToast);

  setTimeout(closeToast, duration);
}

// ==========================================================================
// Quick View Modal
// ==========================================================================
let quickViewSelectedSize = "";

function moXemNhanhSanPham(productId) {
  quickViewSelectedSize = "";
  const product = laySanPhamTheoMa(productId);
  if (!product) return;

  let backdrop = document.querySelector("#quickViewModal");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "quickViewModal";
    backdrop.className = "modal-backdrop";
    document.body.appendChild(backdrop);
  }

  const discount = tinhPhanTramGiamGia(product.price, product.oldPrice);
  const unavailable = Number(product.stock) < 1 || product.status === "out_of_stock";
  const discountBadge =
    discount > 0
      ? `<span class="nhan nhan-chiet-khau">-${discount}%</span>`
      : "";

  backdrop.innerHTML = `
        <div class="modal modal-quickview">
            <div class="modal-header">
                <span class="modal-title">Xem Nhanh Sản Phẩm</span>
                <button class="nut-dong-hop-thoai" onclick="dongXemNhanhSanPham()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="quickview-grid">
                    <div class="quickview-gallery">
                        <img id="qvMainImg" src="${escHtmlSanPham(product.image)}" alt="${escHtmlSanPham(product.name)}">
                    </div>
                    <div class="quickview-info">
                        <div class="product-category-gender">${escHtmlSanPham(product.category)}</div>
                        <h2 style="font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 8px;">${escHtmlSanPham(product.name)}</h2>
                        


                        <div class="size-selection" role="group" aria-label="Chọn kích cỡ sản phẩm">
                            <div class="size-selection-head">
                                <div><span class="size-selection-kicker">Kích cỡ</span><div class="size-selection-label">Chọn size</div></div>
                                <span class="size-current" id="qvSizeLabel" aria-live="polite">Chưa chọn</span>
                            </div>
                            <div class="size-options">
                                <button type="button" class="size-option" aria-pressed="false" data-size="S" aria-label="Size S, Small" onclick="chonSizeXemNhanh('S')"><span class="size-option-name">S</span><i class="size-option-check fa-solid fa-check" aria-hidden="true"></i></button>
                                <button type="button" class="size-option" aria-pressed="false" data-size="M" aria-label="Size M, Medium" onclick="chonSizeXemNhanh('M')"><span class="size-option-name">M</span><i class="size-option-check fa-solid fa-check" aria-hidden="true"></i></button>
                                <button type="button" class="size-option" aria-pressed="false" data-size="XL" aria-label="Size XL, Extra Large" onclick="chonSizeXemNhanh('XL')"><span class="size-option-name">XL</span><i class="size-option-check fa-solid fa-check" aria-hidden="true"></i></button>
                            </div>
                            <small class="size-selection-hint" id="qvSizeHint"><i class="fa-regular fa-circle-check" aria-hidden="true"></i> Chọn một kích cỡ phù hợp trước khi thêm vào giỏ.</small>
                        </div>

                        <div class="product-prices" style="margin-bottom: 16px; font-size: 1.25rem;">
                            <span class="product-price-current">${dinhDangTien(product.price)}</span>
                            ${product.oldPrice ? `<span class="product-price-old">${dinhDangTien(product.oldPrice)}</span>` : ""}
                            ${discountBadge}
                        </div>

                        <p style="font-size: 0.875rem; color: var(--color-text-muted); line-height: 1.6; margin-bottom: 18px;">
                            ${escHtmlSanPham(product.description)}
                        </p>

                        <!-- Quantity and CTA -->
                        <div style="display: flex; gap: 12px; align-items: center; margin-top: 20px;">
                            <div class="qty-control">
                                <button type="button" class="qty-btn" ${unavailable ? "disabled" : ""} onclick="doiSoLuongXemNhanh(-1)">-</button>
                                <input type="number" id="qvQtyInput" class="qty-input" value="1" min="1" max="${Math.min(99, Math.max(1, Number(product.stock) || 1))}" readonly>
                                <button type="button" class="qty-btn" ${unavailable ? "disabled" : ""} onclick="doiSoLuongXemNhanh(1)">+</button>
                            </div>
                            <button class="nut nut-chinh" style="flex: 1;" ${unavailable ? "disabled" : ""} onclick="themXemNhanhVaoGio(${product.id})">
                                <i class="fa-solid fa-cart-shopping"></i> ${unavailable ? "Hết hàng" : "Thêm vào giỏ"}
                            </button>
                            <a href="product-detail.html?id=${product.id}" class="nut nut-vien" title="Xem chi tiết đầy đủ">
                                <i class="fa-solid fa-arrow-up-right-from-square"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

  backdrop.classList.add("dang-mo");
  document.body.style.overflow = "hidden";

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) dongXemNhanhSanPham();
  });
}

function dongXemNhanhSanPham() {
  const backdrop = document.querySelector("#quickViewModal");
  if (backdrop) {
    backdrop.classList.remove("dang-mo");
    document.body.style.overflow = "";
  }
}

function doiSoLuongXemNhanh(delta) {
  const input = document.getElementById("qvQtyInput");
  if (!input) return;
  let val = parseInt(input.value, 10) || 1;
  const max = Math.min(99, Math.max(1, parseInt(input.max, 10) || 99));
  val = Math.max(1, Math.min(max, val + delta));
  input.value = val;
}

function chonSizeXemNhanh(size) {
  if (!["S", "M", "XL"].includes(size)) return;
  quickViewSelectedSize = size;
  document.querySelectorAll("#quickViewModal .size-option").forEach((button) => {
    const selected = button.dataset.size === size;
    button.classList.toggle("dang-chon", selected);
    button.setAttribute("aria-pressed", selected ? "true" : "false");
  });
  const label = document.getElementById("qvSizeLabel");
  if (label) {
    label.textContent = "Đã chọn " + size;
    label.classList.add("dang-chon");
  }
  const hint = document.getElementById("qvSizeHint");
  if (hint) hint.innerHTML = '<i class="fa-solid fa-circle-check" aria-hidden="true"></i> Đã chọn size ' + size + '. Bạn có thể đổi lựa chọn bất cứ lúc nào.';
}

async function themXemNhanhVaoGio(productId) {
  if (!quickViewSelectedSize) {
    hienThiThongBaoNho("Vui lòng chọn size S, M hoặc XL.", "warning");
    return;
  }
  const qty = parseInt(document.getElementById("qvQtyInput")?.value, 10) || 1;
  const added = await themVaoGioHang(productId, qty, quickViewSelectedSize);
  if (added) dongXemNhanhSanPham();
}

// ==========================================================================
// Generic Confirmation Modal
// ==========================================================================
function hienThiHopThoaiXacNhan({
  title = "Xác nhận",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  onConfirm,
}) {
  let backdrop = document.querySelector("#confirmModal");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "confirmModal";
    backdrop.className = "modal-backdrop";
    document.body.appendChild(backdrop);
  }

  backdrop.innerHTML = `
        <div class="modal" style="max-width: 420px;">
            <div class="modal-header">
                <span class="modal-title">${title}</span>
                <button class="nut-dong-hop-thoai" onclick="dongHopThoaiXacNhan()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="modal-body">
                <p style="font-size: 0.95rem; color: var(--color-text); line-height: 1.5;">${message}</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="nut nut-phu nut-nho" onclick="dongHopThoaiXacNhan()">${cancelText}</button>
                <button type="button" class="nut nut-xoa nut-nho" id="confirmModalConfirmBtn">${confirmText}</button>
            </div>
        </div>
    `;

  backdrop.classList.add("dang-mo");
  document.body.style.overflow = "hidden";

  document
    .getElementById("confirmModalConfirmBtn")
    .addEventListener("click", () => {
      dongHopThoaiXacNhan();
      if (typeof onConfirm === "function") onConfirm();
    });

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) dongHopThoaiXacNhan();
  });
}

function dongHopThoaiXacNhan() {
  const backdrop = document.querySelector("#confirmModal");
  if (backdrop) {
    backdrop.classList.remove("dang-mo");
    document.body.style.overflow = "";
  }
}

// ==========================================================================
// Back to Top Button
// ==========================================================================
function khoiTaoNutLenDauTrang() {
  let btn = document.querySelector(".back-to-top");
  if (!btn) {
    btn = document.createElement("button");
    btn.className = "back-to-top";
    btn.setAttribute("aria-label", "Về đầu trang");
    btn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
    document.body.appendChild(btn);
  }

  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY > 400) {
        btn.classList.add("is-visible");
      } else {
        btn.classList.remove("is-visible");
      }
    },
    { passive: true },
  );

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ==========================================================================
// Newsletter Form Handler
// ==========================================================================
function khoiTaoDangKyTinTuc() {
  const forms = document.querySelectorAll(".bieu-mau-dang-ky-tin");
  forms.forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector(".o-dang-ky-tin");
      const email = input ? input.value.trim() : "";

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        hienThiThongBaoNho("Vui lòng nhập địa chỉ email hợp lệ.", "error");
        return;
      }

      hienThiThongBaoNho("Cảm ơn bạn đã đăng ký nhận thông tin khuyến mãi!", "success");
      if (input) input.value = "";
    });
  });
}

// ==========================================================================
// Render Standard Product Card HTML
// ==========================================================================
function hienThiTheSanPham(product) {
  const id = Number(product.id);
  const discount = tinhPhanTramGiamGia(product.price, product.oldPrice);
  const isWished = kiemTraSanPhamYeuThich(id);
  const name = escHtmlSanPham(product.name);
  const category = escHtmlSanPham(product.category);
  const image = escHtmlSanPham(product.image);
  const isUnavailable = Number(product.stock) < 1 || product.status === 'out_of_stock';
  const badgeHtml = isUnavailable
    ? '<span class="nhan" style="background:#666;color:#fff">Hết hàng</span>'
    : (discount > 0 ? '<span class="nhan nhan-giam-gia">-' + discount + '%</span>' : '');
  const media = image
    ? '<img src="' + image + '" alt="' + name + '" loading="lazy">'
    : '<div class="empty-state-desc">Chưa cập nhật hình ảnh</div>';

  return '<div class="the-san-pham" data-id="' + id + '">' +
    '<div class="product-media"><a href="product-detail.html?id=' + id + '">' + media + '</a>' +
    '<div class="product-badges">' + badgeHtml + '</div>' +
    '<div class="product-quick-actions">' +
    '<button class="quick-action-btn btn-wishlist-toggle ' + (isWished ? 'dang-mo dang-chon' : '') + '" data-id="' + id + '" title="Thêm vào yêu thích" onclick="batTatYeuThich(' + id + ')">' +
    '<i class="' + (isWished ? 'fa-solid' : 'fa-regular') + ' fa-heart"' + (isWished ? ' style="color:var(--color-danger)"' : '') + '></i></button>' +
    '<button class="quick-action-btn" title="Xem nhanh" onclick="moXemNhanhSanPham(' + id + ')"><i class="fa-regular fa-eye"></i></button>' +
    '</div><div class="product-cart-overlay">' +
    (isUnavailable ? '<button class="btn-card-cart" type="button" disabled><i class="fa-solid fa-ban"></i> Hết hàng</button>' : '<button class="btn-card-cart" type="button" onclick="moXemNhanhSanPham(' + id + ')"><i class="fa-solid fa-bag-shopping"></i> Chọn size</button>') + '</div></div>' +
    '<div class="product-content"><div class="product-category-gender">' + category + '</div>' +
    '<h3 class="product-title"><a href="product-detail.html?id=' + id + '">' + name + '</a></h3>' +
    '<div class="product-prices"><span class="product-price-current">' + dinhDangTien(product.price) + '</span>' +
    (product.oldPrice ? '<span class="product-price-old">' + dinhDangTien(product.oldPrice) + '</span>' : '') +
    '</div></div></div>';
}

// Global click event bindings
function caiDatSuKienToanTrang() {
  window.addEventListener("storage", (event) => {
    if (event.key === "fashion_current_user") {
      if (!event.newValue && typeof danhDauDangXuatGioHang === "function") danhDauDangXuatGioHang();
      hienThiTrangThaiNguoiDung();
    }
    capNhatSoLuongHuyHieu();
    dongBoNutYeuThich();
  });
}
