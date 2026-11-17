// Catalog dữ liệu lấy từ API công khai, nguồn chính là bảng products trong MySQL.
let DANH_SACH_SAN_PHAM = [];
let DANH_SACH_DANH_MUC = [];
let productCatalogPromise = null;
let categoryCatalogPromise = null;
let productCatalogError = null;

function chuanHoaSanPhamApi(row) {
    const basePrice = Number(row.price) || 0;
    const salePrice = row.sale_price === null || row.sale_price === '' ? null : Number(row.sale_price);
    const currentPrice = salePrice !== null && salePrice >= 0 && salePrice < basePrice ? salePrice : basePrice;
    const image = String(row.image || '');
    const stock = Number(row.stock) || 0;
    const status = String(row.status || 'active');
    const isUnavailable = stock < 1 || status === 'out_of_stock';
    return {
        id: Number(row.id),
        slug: String(row.slug || ''),
        name: String(row.name || ''),
        category: String(row.category_name || 'Chưa phân loại'),
        categorySlug: String(row.category_slug || ''),
        categoryId: Number(row.category_id) || 0,
        price: currentPrice,
        oldPrice: currentPrice < basePrice ? basePrice : null,
        image: image,
        images: image ? [image] : [],
        badge: isUnavailable ? 'HẾT HÀNG' : (currentPrice < basePrice ? 'SALE' : null),
        description: String(row.description || ''),
        stock: stock,
        status: status,
        createdAt: String(row.created_at || '')
    };
}

async function taiDanhSachSanPham(forceRefresh = false) {
    if (forceRefresh || !productCatalogPromise) {
        productCatalogPromise = fetch('api/products.php', { credentials: 'same-origin' })
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok || !data.success) throw new Error(data.message || 'Không thể tải sản phẩm.');
                DANH_SACH_SAN_PHAM = (Array.isArray(data.products) ? data.products : [])
                    .map(chuanHoaSanPhamApi)
                    .filter((product) => Number.isInteger(product.id) && product.id > 0);
                DANH_SACH_SAN_PHAM.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
                productCatalogError = null;
                return DANH_SACH_SAN_PHAM;
            })
            .catch((error) => {
                productCatalogError = error;
                DANH_SACH_SAN_PHAM = [];
                return DANH_SACH_SAN_PHAM;
            });
    }
    return productCatalogPromise;
}

async function taiDanhMucSanPham(forceRefresh = false) {
    if (forceRefresh || !categoryCatalogPromise) {
        categoryCatalogPromise = fetch('api/categories.php', { credentials: 'same-origin' })
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok || !data.success) throw new Error(data.message || 'Không thể tải danh mục.');
                DANH_SACH_DANH_MUC = Array.isArray(data.categories) ? data.categories.map((category) => ({
                    id: Number(category.id),
                    name: String(category.name || ''),
                    slug: String(category.slug || '')
                })).filter((category) => Number.isInteger(category.id) && category.id > 0) : [];
                return DANH_SACH_DANH_MUC;
            })
            .catch(() => {
                DANH_SACH_DANH_MUC = [];
                return DANH_SACH_DANH_MUC;
            });
    }
    return categoryCatalogPromise;
}

function layTatCaSanPham() {
    return DANH_SACH_SAN_PHAM;
}

function laySanPhamTheoMa(id) {
    const numericId = Number.parseInt(id, 10);
    return DANH_SACH_SAN_PHAM.find((product) => product.id === numericId) || null;
}

function laySanPhamNoiBat(limit = 8) {
    const discounted = DANH_SACH_SAN_PHAM.filter((product) => product.oldPrice > product.price);
    return (discounted.length ? discounted : DANH_SACH_SAN_PHAM).slice(0, limit);
}

function laySanPhamMoi(limit = 8) {
    return DANH_SACH_SAN_PHAM.slice(0, limit);
}

function laySanPhamBanChay(limit = 8) {
    return DANH_SACH_SAN_PHAM.slice(0, limit);
}

function laySanPhamLienQuan(productId, limit = 4) {
    const current = laySanPhamTheoMa(productId);
    if (!current) return DANH_SACH_SAN_PHAM.slice(0, limit);
    const sameCategory = DANH_SACH_SAN_PHAM.filter((product) =>
        product.id !== current.id && current.categoryId > 0 && product.categoryId === current.categoryId
    );
    return (sameCategory.length ? sameCategory : DANH_SACH_SAN_PHAM.filter((product) => product.id !== current.id)).slice(0, limit);
}

function escHtmlSanPham(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[char]);
}

function chuanHoaChuoiDanhMuc(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Format tiền tệ VND

function dinhDangTien(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount).replace('₫', 'đ');
}

// Tính % giảm giá nếu có
function tinhPhanTramGiamGia(price, oldPrice) {
    if (!oldPrice || oldPrice <= price) return 0;
    return Math.round(((oldPrice - price) / oldPrice) * 100);
}

// ==========================================================================
// CATALOG PAGE CONTROLLER (products.html)
// ==========================================================================
let catalogState = {
    category: 'all',
    priceRange: 'all',
    search: '',
    sort: 'newest',
    page: 1,
    pageSize: 8,
    promotionOnly: false
};

async function khoiTaoTrangDanhSachSanPham() {
    const catalogGrid = document.getElementById('catalogProductsGrid');
    if (!catalogGrid) return;

    await Promise.all([taiDanhSachSanPham(), taiDanhMucSanPham()]);
    const categoryList = document.getElementById('categoryFilterOptions');
    if (categoryList) {
        categoryList.innerHTML = '<label class="nhan-bo-loc"><span class="nhan-lua-chon"><input type="radio" name="filterCategory" value="all" checked> Tất cả danh mục</span></label>' + DANH_SACH_DANH_MUC.map((category) =>
            '<label class="nhan-bo-loc"><span class="nhan-lua-chon"><input type="radio" name="filterCategory" value="' + category.id + '"> ' + escHtmlSanPham(category.name) + '</span></label>'
        ).join('');
    }

    const params = new URLSearchParams(window.location.search);
    catalogState.category = params.get('category_id') || params.get('category') || 'all';
    catalogState.search = params.get('search') || '';
    if (params.has('gender')) catalogState.search = params.get('gender') || '';
    if (params.has('sort')) catalogState.sort = params.get('sort');
    catalogState.promotionOnly = params.get('promotion') === '1';

    caiDatBoLocSanPham();
    apDungBoLoc();
}

function danhMucDuocChon(categoryValue) {
    if (catalogState.category === 'all') return categoryValue === 'all';
    if (/^\d+$/.test(catalogState.category)) return Number(categoryValue) === Number(catalogState.category);
    const query = chuanHoaChuoiDanhMuc(catalogState.category);
    const match = DANH_SACH_DANH_MUC.find((category) =>
        chuanHoaChuoiDanhMuc(category.name).includes(query) || chuanHoaChuoiDanhMuc(category.slug).includes(query)
    );
    return !!match && Number(categoryValue) === match.id;
}

function caiDatBoLocSanPham() {
    document.querySelectorAll('input[name="filterCategory"]').forEach((input) => {
        input.checked = danhMucDuocChon(input.value);
        input.addEventListener('change', () => {
            catalogState.category = input.value;
            catalogState.page = 1;
            apDungBoLoc();
        });
    });

    document.querySelectorAll('input[name="filterPrice"]').forEach((input) => {
        input.checked = input.value === 'all';
        input.addEventListener('change', () => {
            catalogState.priceRange = input.value;
            catalogState.page = 1;
            apDungBoLoc();
        });
    });

    const sortSelect = document.getElementById('catalogSortSelect');
    if (sortSelect) {
        if ([...sortSelect.options].some((option) => option.value === catalogState.sort)) sortSelect.value = catalogState.sort;
        sortSelect.addEventListener('change', () => {
            catalogState.sort = sortSelect.value;
            catalogState.page = 1;
            apDungBoLoc();
        });
    }

    const resetBtn = document.getElementById('btnResetFilters');
    if (resetBtn) resetBtn.addEventListener('click', datLaiBoLoc);
}

function datLaiBoLoc() {
    catalogState = { category: 'all', priceRange: 'all', search: '', sort: 'newest', page: 1, pageSize: 8, promotionOnly: false };
    document.querySelectorAll('input[name="filterCategory"]').forEach((input) => { input.checked = input.value === 'all'; });
    document.querySelectorAll('input[name="filterPrice"]').forEach((input) => { input.checked = input.value === 'all'; });
    const sortSelect = document.getElementById('catalogSortSelect');
    if (sortSelect) sortSelect.value = 'newest';
    window.history.pushState({}, '', 'products.html');
    apDungBoLoc();
}

function apDungBoLoc() {
    let results = [...DANH_SACH_SAN_PHAM];
    if (catalogState.search) {
        const query = chuanHoaChuoiDanhMuc(catalogState.search);
        results = results.filter((product) =>
            chuanHoaChuoiDanhMuc(product.name).includes(query) ||
            chuanHoaChuoiDanhMuc(product.category).includes(query) ||
            chuanHoaChuoiDanhMuc(product.description).includes(query)
        );
    }
    if (catalogState.category && catalogState.category !== 'all') {
        if (/^\d+$/.test(catalogState.category)) {
            results = results.filter((product) => product.categoryId === Number(catalogState.category));
        } else {
            const categoryQuery = chuanHoaChuoiDanhMuc(catalogState.category);
            results = results.filter((product) =>
                chuanHoaChuoiDanhMuc(product.category).includes(categoryQuery) ||
                chuanHoaChuoiDanhMuc(product.categorySlug).includes(categoryQuery)
            );
        }
    }
    if (catalogState.priceRange && catalogState.priceRange !== 'all') {
        switch (catalogState.priceRange) {
            case 'under-300': results = results.filter((product) => product.price < 300000); break;
            case '300-500': results = results.filter((product) => product.price >= 300000 && product.price <= 500000); break;
            case '500-1000': results = results.filter((product) => product.price > 500000 && product.price <= 1000000); break;
            case 'over-1000': results = results.filter((product) => product.price > 1000000); break;
        }
    }
    if (catalogState.promotionOnly) results = results.filter((product) => Number(product.oldPrice) > Number(product.price));
    if (catalogState.sort === 'price-asc') results.sort((a, b) => a.price - b.price);
    else if (catalogState.sort === 'price-desc') results.sort((a, b) => b.price - a.price);
    else results.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.id - a.id);
    hienThiKetQuaSanPham(results);
}

function hienThiKetQuaSanPham(results) {
    const grid = document.getElementById('catalogProductsGrid');
    const resultCountEl = document.getElementById('catalogResultsCount');
    const paginationEl = document.getElementById('catalogPagination');
    const activeTagsEl = document.getElementById('catalogActiveTags');
    if (!grid) return;

    if (resultCountEl) resultCountEl.innerHTML = 'Hiển thị <strong>' + results.length + '</strong> sản phẩm';
    if (activeTagsEl) {
        let tags = '';
        if (catalogState.search) tags += '<span class="the-bo-loc">Tìm kiếm: "' + escHtmlSanPham(catalogState.search) + '" <i class="fa-solid fa-xmark xoa-the-bo-loc" onclick="xoaBoLocSanPham(\'search\')"></i></span>';
        if (catalogState.category !== 'all') {
            const category = DANH_SACH_DANH_MUC.find((item) => String(item.id) === String(catalogState.category));
            tags += '<span class="the-bo-loc">Danh mục: ' + escHtmlSanPham(category ? category.name : catalogState.category) + ' <i class="fa-solid fa-xmark xoa-the-bo-loc" onclick="xoaBoLocSanPham(\'category\')"></i></span>';
        }
        if (catalogState.priceRange !== 'all') tags += '<span class="the-bo-loc">Giá: Đã lọc <i class="fa-solid fa-xmark xoa-the-bo-loc" onclick="xoaBoLocSanPham(\'price\')"></i></span>';
        if (catalogState.promotionOnly) tags += '<span class="the-bo-loc">Đang khuyến mãi</span>';
        if (tags) tags += '<button type="button" class="nut nut-nho nut-vien" style="padding:2px 8px;font-size:.75rem" onclick="datLaiBoLoc()">Xóa tất cả</button>';
        activeTagsEl.innerHTML = tags;
    }

    if (!results.length) {
        const title = productCatalogError ? 'Chưa tải được sản phẩm.' : 'Chưa có sản phẩm phù hợp.';
        const message = productCatalogError
            ? 'Không kết nối được API sản phẩm. Hãy mở website qua Apache/PHP và kiểm tra cấu hình MySQL.'
            : (DANH_SACH_SAN_PHAM.length === 0
                ? 'Danh mục sản phẩm đang trống. Hãy thêm sản phẩm trong trang quản trị để hiển thị tại đây.'
                : 'Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.');
        grid.innerHTML = '<div style="grid-column:1/-1;width:100%"><div class="empty-state"><div class="empty-state-icon"><i class="fa-solid fa-box-open"></i></div><h3 class="empty-state-title">' + title + '</h3><p class="empty-state-desc">' + message + '</p><button type="button" class="nut nut-chinh" onclick="datLaiBoLoc()"><i class="fa-solid fa-rotate-left"></i> Đặt lại bộ lọc</button></div></div>';
        if (paginationEl) paginationEl.innerHTML = '';
        return;
    }

    const totalPages = Math.ceil(results.length / catalogState.pageSize);
    if (catalogState.page > totalPages) catalogState.page = 1;
    const startIndex = (catalogState.page - 1) * catalogState.pageSize;
    grid.innerHTML = results.slice(startIndex, startIndex + catalogState.pageSize).map((product) => hienThiTheSanPham(product)).join('');
    if (!paginationEl) return;
    if (totalPages <= 1) { paginationEl.innerHTML = ''; return; }
    let pagination = '<button type="button" class="page-btn" ' + (catalogState.page === 1 ? 'disabled' : '') + ' onclick="chuyenTrangSanPham(' + (catalogState.page - 1) + ')"><i class="fa-solid fa-chevron-left"></i></button>';
    for (let page = 1; page <= totalPages; page++) pagination += '<button type="button" class="page-btn ' + (page === catalogState.page ? 'dang-chon' : '') + '" onclick="chuyenTrangSanPham(' + page + ')">' + page + '</button>';
    pagination += '<button type="button" class="page-btn" ' + (catalogState.page === totalPages ? 'disabled' : '') + ' onclick="chuyenTrangSanPham(' + (catalogState.page + 1) + ')"><i class="fa-solid fa-chevron-right"></i></button>';
    paginationEl.innerHTML = pagination;
}

function chuyenTrangSanPham(page) {
    catalogState.page = page;
    apDungBoLoc();
    window.scrollTo({
        top: document.getElementById('catalogProductsGrid')?.offsetTop - 100 || 0,
        behavior: 'smooth'
    });
}

function xoaBoLocSanPham(key) {
    if (key === 'search') catalogState.search = '';
    if (key === 'category') {
        catalogState.category = 'all';
        document.querySelectorAll('input[name="filterCategory"]').forEach((input) => input.checked = input.value === 'all');
    }
    if (key === 'price') {
        catalogState.priceRange = 'all';
        document.querySelectorAll('input[name="filterPrice"]').forEach((input) => input.checked = input.value === 'all');
    }
    catalogState.page = 1;
    apDungBoLoc();
}

// PRODUCT DETAIL CONTROLLER (product-detail.html)
// ==========================================================================
let currentDetailState = {
    product: null,
    selectedImageIndex: 0,
    quantity: 1,
    selectedSize: ""
};

async function khoiTaoTrangChiTietSanPham() {
    const detailContainer = document.getElementById('productDetailContainer');
    if (!detailContainer) return;

    await taiDanhSachSanPham();
    const productId = Number.parseInt(new URLSearchParams(window.location.search).get('id'), 10);
    const product = laySanPhamTheoMa(productId);
    if (!product) {
        const errorTitle = productCatalogError ? "Chưa tải được sản phẩm" : "Không tìm thấy sản phẩm";
        const errorMessage = productCatalogError
            ? "Không kết nối được API sản phẩm. Hãy mở website qua Apache/PHP và kiểm tra cấu hình MySQL."
            : "Sản phẩm có thể đã bị ẩn hoặc xóa khỏi cửa hàng.";
        detailContainer.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fa-solid fa-box-open"></i></div><h2 class="empty-state-title">' + errorTitle + '</h2><p class="empty-state-desc">' + errorMessage + '</p><a href="products.html" class="nut nut-chinh">Xem sản phẩm</a></div>';
        return;
    }
    currentDetailState.product = product;
    currentDetailState.quantity = 1;
    currentDetailState.selectedSize = "";
    currentDetailState.selectedImageIndex = 0;
    hienThiChiTietSanPham(product);
    hienThiSanPhamLienQuan(product.id);
    khoiTaoTabSanPham();
    taiDanhGiaSanPham(product.id);
}

function hienThiChiTietSanPham(product) {
    const container = document.getElementById('productDetailContainer');
    if (!container) return;

    // Breadcrumbs
    const breadcrumbName = document.getElementById('breadcrumbProductName');
    const breadcrumbCategory = document.getElementById('breadcrumbCategory');
    if (breadcrumbName) breadcrumbName.textContent = product.name;
    if (breadcrumbCategory) {
        breadcrumbCategory.textContent = product.category.toUpperCase();
        breadcrumbCategory.href = product.categoryId ? `products.html?category_id=${product.categoryId}` : 'products.html';
    }

    const discount = tinhPhanTramGiamGia(product.price, product.oldPrice);
    const isUnavailable = product.stock < 1 || product.status === 'out_of_stock';
    const isWished = kiemTraSanPhamYeuThich(product.id);

    container.innerHTML = `
        <div class="luoi-chi-tiet-san-pham">
            <!-- Left: Gallery -->
            <div class="product-gallery">
                <div class="product-thumbnails">
                    ${product.images.map((imgUrl, idx) => `
                        <div class="thumbnail-item ${idx === 0 ? 'dang-chon' : ''}" onclick="chonAnhThuNho(${idx})">
                            <img src="${escHtmlSanPham(imgUrl)}" alt="${escHtmlSanPham(product.name)} ${idx + 1}">
                        </div>
                    `).join('')}
                </div>

                <div class="product-main-image-box">
                    <img id="detailMainImage" src="${escHtmlSanPham(product.images[0] || product.image)}" alt="${escHtmlSanPham(product.name)}">
                    <button type="button" class="gallery-nav-btn gallery-prev" onclick="chuyenAnhSanPham(-1)" aria-label="Previous image">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                    <button type="button" class="gallery-nav-btn gallery-next" onclick="chuyenAnhSanPham(1)" aria-label="Next image">
                        <i class="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            </div>

            <!-- Right: Product Info -->
            <div class="product-info-col">
                <div class="product-category-gender">${escHtmlSanPham(product.category)} ${isUnavailable ? '<span class="nhan" style="background:#666;color:#fff">Hết hàng</span>' : ''}</div>
                <h1 class="product-detail-title">${escHtmlSanPham(product.name)}</h1>

                <div class="product-meta-row"></div>

                <div class="product-price-box">
                    <span class="detail-price-current">${dinhDangTien(product.price)}</span>
                    ${product.oldPrice ? `<span class="detail-price-old">${dinhDangTien(product.oldPrice)}</span>` : ''}
                    ${discount > 0 ? `<span class="nhan nhan-giam-gia">GIẢM ${discount}%</span>` : ''}
                </div>

                <p class="product-short-desc">${escHtmlSanPham(product.description)}</p>

                <div class="size-selection" role="group" aria-label="Chọn kích cỡ sản phẩm">
                    <div class="size-selection-head">
                        <div><span class="size-selection-kicker">Kích cỡ</span><div class="size-selection-label">Chọn size</div></div>
                        <span class="size-current" id="detailSizeLabel" aria-live="polite">Chưa chọn</span>
                    </div>
                    <div class="size-options">
                        <button type="button" class="size-option" aria-pressed="false" data-size="S" aria-label="Size S, Small" onclick="chonSizeSanPham('S')"><span class="size-option-name">S</span><i class="size-option-check fa-solid fa-check" aria-hidden="true"></i></button>
                        <button type="button" class="size-option" aria-pressed="false" data-size="M" aria-label="Size M, Medium" onclick="chonSizeSanPham('M')"><span class="size-option-name">M</span><i class="size-option-check fa-solid fa-check" aria-hidden="true"></i></button>
                        <button type="button" class="size-option" aria-pressed="false" data-size="XL" aria-label="Size XL, Extra Large" onclick="chonSizeSanPham('XL')"><span class="size-option-name">XL</span><i class="size-option-check fa-solid fa-check" aria-hidden="true"></i></button>
                    </div>
                    <small class="size-selection-hint" id="detailSizeHint"><i class="fa-regular fa-circle-check" aria-hidden="true"></i> Chọn một kích cỡ phù hợp trước khi thêm vào giỏ.</small>
                </div>

                <!-- Quantity and Actions -->
                <div class="detail-actions-group">
                    <div class="qty-control">
                        <button type="button" class="qty-btn" ${isUnavailable ? 'disabled' : ''} onclick="doiSoLuongSanPham(-1)">-</button>
                        <input type="number" id="detailQtyInput" class="qty-input" value="1" min="1" max="99" readonly>
                        <button type="button" class="qty-btn" ${isUnavailable ? 'disabled' : ''} onclick="doiSoLuongSanPham(1)">+</button>
                    </div>

                    <button type="button" class="nut nut-vien nut-lon" style="flex: 1;" ${isUnavailable ? 'disabled' : ''} onclick="themChiTietVaoGioHang()">
                        <i class="fa-solid fa-cart-shopping"></i> ${isUnavailable ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                    </button>

                    <button type="button" class="nut nut-chinh nut-lon" style="flex: 1;" ${isUnavailable ? 'disabled' : ''} onclick="muaSanPhamNgay()">
                        <i class="fa-solid fa-bolt"></i> Mua ngay
                    </button>

                    <button type="button" class="nut nut-phu nut-bieu-tuong nut-lon btn-wishlist-toggle ${isWished ? 'dang-chon dang-mo' : ''}" 
                            data-id="${product.id}" 
                            title="Yêu thích" 
                            onclick="batTatYeuThich(${product.id})">
                        <i class="${isWished ? 'fa-solid' : 'fa-regular'} fa-heart" ${isWished ? 'style="color: var(--color-danger);"' : ''}></i>
                    </button>
                </div>

                <!-- Store Perks -->
                <div class="product-perks-box">
                    <div class="perk-line">
                        <i class="fa-solid fa-truck-fast"></i>
                        <span>Miễn phí vận chuyển cho đơn hàng từ <strong>500.000đ</strong></span>
                    </div>
                    <div class="perk-line">
                        <i class="fa-solid fa-rotate-left"></i>
                        <span>Đổi trả sản phẩm miễn phí trong vòng <strong>30 ngày</strong></span>
                    </div>
                    <div class="perk-line">
                        <i class="fa-solid fa-shield-check"></i>
                        <span>Cam kết 100% hàng chính hãng, kiểm tra trước khi nhận</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    const metaRow = container.querySelector('.product-meta-row');
    if (metaRow) metaRow.innerHTML = '<span>Mã sản phẩm: <strong>#' + product.id + '</strong></span><span>•</span><span>Tồn kho: ' + product.stock + '</span>';
    const gallery = container.querySelector('.product-gallery');
    if (gallery && !product.image) gallery.innerHTML = '<div class="product-main-image-box"><div class="empty-state-desc">Sản phẩm chưa có hình ảnh.</div></div>';
    container.querySelectorAll('.gallery-nav-btn').forEach((button) => { button.hidden = product.images.length < 2; });
    const descTab = document.getElementById('tabDescription');
    if (descTab) descTab.innerHTML = '<div style="line-height:1.8;color:var(--color-text)"><h3 style="font-family:var(--font-heading);margin-bottom:12px;font-size:1.3rem">Thông tin sản phẩm</h3><p>' + escHtmlSanPham(product.description || 'Chưa có mô tả sản phẩm.') + '</p></div>';
    const specsPane = document.getElementById('tabSpecs');
    if (specsPane) specsPane.innerHTML = '<div style="max-width:600px;line-height:1.8"><h3>Thông tin từ cửa hàng</h3><p>Danh mục: <strong>' + escHtmlSanPham(product.category) + '</strong></p><p>Giá bán: <strong>' + dinhDangTien(product.price) + '</strong></p><p>Tồn kho: <strong>' + product.stock + '</strong></p></div>';


}

function chonAnhThuNho(idx) {
    currentDetailState.selectedImageIndex = idx;
    const imgEl = document.getElementById('detailMainImage');
    if (imgEl && currentDetailState.product.images[idx]) {
        imgEl.src = currentDetailState.product.images[idx];
    }
    document.querySelectorAll('.thumbnail-item').forEach((item, index) => {
        item.classList.toggle('dang-chon', index === idx);
    });
}

function chuyenAnhSanPham(direction) {
    const total = currentDetailState.product?.images?.length || 0;
    if (total < 2) return;
    let nextIdx = (currentDetailState.selectedImageIndex + direction + total) % total;
    chonAnhThuNho(nextIdx);
}

function doiSoLuongSanPham(delta) {
    const input = document.getElementById('detailQtyInput');
    if (!input) return;
    let val = parseInt(input.value, 10) || 1;
    const maxQty = Math.max(1, Math.min(99, currentDetailState.product?.stock || 99));
    val = Math.max(1, Math.min(maxQty, val + delta));
    input.value = val;
    currentDetailState.quantity = val;
}

function chonSizeSanPham(size) {
    if (!["S", "M", "XL"].includes(size)) return;
    currentDetailState.selectedSize = size;
    document.querySelectorAll("#productDetailContainer .size-option").forEach((button) => {
        const selected = button.dataset.size === size;
        button.classList.toggle("dang-chon", selected);
        button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
    const label = document.getElementById("detailSizeLabel");
    if (label) {
        label.textContent = "Đã chọn " + size;
        label.classList.add("dang-chon");
    }
    const hint = document.getElementById("detailSizeHint");
    if (hint) hint.innerHTML = '<i class="fa-solid fa-circle-check" aria-hidden="true"></i> Đã chọn size ' + size + '. Bạn có thể đổi lựa chọn bất cứ lúc nào.';
}

async function themChiTietVaoGioHang() {
    if (!currentDetailState.product) return;
    if (!currentDetailState.selectedSize) {
        hienThiThongBaoNho("Vui lòng chọn size S, M hoặc XL.", "warning");
        return;
    }
    await themVaoGioHang(currentDetailState.product.id, currentDetailState.quantity, currentDetailState.selectedSize);
}

async function muaSanPhamNgay() {
    if (!currentDetailState.product) return;
    if (!currentDetailState.selectedSize) {
        hienThiThongBaoNho("Vui lòng chọn size S, M hoặc XL.", "warning");
        return;
    }
    const added = await themVaoGioHang(
        currentDetailState.product.id,
        currentDetailState.quantity,
        currentDetailState.selectedSize
    );
    if (added) window.location.href = 'checkout.html';
}

function hienThiSanPhamLienQuan(currentId) {
    const container = document.getElementById('relatedProductsGrid');
    if (!container) return;

    const related = laySanPhamLienQuan(currentId, 4);
    container.innerHTML = related.map(p => hienThiTheSanPham(p)).join('');
}

async function taiDanhGiaSanPham(productId) {
    const pane = document.getElementById('tabReviews');
    if (!pane || !productId) return;
    pane.innerHTML = '<p class="empty-state-desc">Đang tải đánh giá...</p>';

    try {
        const response = await fetch('api/reviews.php?product_id=' + encodeURIComponent(productId));
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || 'Không tải được đánh giá.');
        const reviews = Array.isArray(data.reviews) ? data.reviews : [];
        if (!reviews.length) {
            pane.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fa-regular fa-star"></i></div><p class="empty-state-desc">Chưa có đánh giá từ khách đã xác nhận nhận hàng.</p></div>';
            return;
        }

        const average = Number(data.average_rating) || 0;
        const averageRounded = Math.max(0, Math.min(5, Math.round(average)));
        const averageStars = '★'.repeat(averageRounded) + '☆'.repeat(5 - averageRounded);
        const reviewCards = reviews.map((review) => {
            const rating = Math.max(1, Math.min(5, Number(review.rating) || 1));
            const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
            const comment = String(review.comment || '').trim();
            const date = escHtmlSanPham(String(review.created_at || '').replace('T', ' ').slice(0, 10));
            return '<article class="product-review-card"><div class="product-review-card-head"><span class="product-review-stars" aria-label="' + rating + ' trên 5 sao">' + stars + '</span><time>' + date + '</time></div>' +
                (comment ? '<p>' + escHtmlSanPham(comment) + '</p>' : '<p class="product-review-no-comment">Khách hàng không để lại nhận xét.</p>') +
                '<span class="product-review-verified"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Đã xác nhận nhận hàng</span></article>';
        }).join('');

        pane.innerHTML = '<div class="product-reviews-summary"><strong>' + average.toFixed(1) + ' / 5</strong><span class="product-review-stars" aria-hidden="true">' + averageStars + '</span><span>' + Number(data.review_count || 0) + ' đánh giá</span></div><div class="product-review-list">' + reviewCards + '</div>';
    } catch (error) {
        pane.innerHTML = '<p class="empty-state-desc">' + escHtmlSanPham(error.message || 'Không tải được đánh giá.') + '</p>';
    }
}

async function taiDanhGiaMoiNhatTrangChu() {
    const grid = document.getElementById('recentReviewsGrid');
    if (!grid) return;
    grid.innerHTML = '<p class="empty-state-desc">Đang tải đánh giá...</p>';

    try {
        const response = await fetch('api/recent-reviews.php');
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || 'Không tải được đánh giá.');

        const reviews = Array.isArray(data.reviews) ? data.reviews : [];
        if (!reviews.length) {
            grid.innerHTML = '<div class="empty-state"><p class="empty-state-desc">Chưa có đánh giá từ khách đã xác nhận nhận hàng.</p></div>';
            return;
        }

        grid.innerHTML = reviews.map((review) => {
            const rating = Math.max(1, Math.min(5, Number(review.rating) || 1));
            const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
            const date = escHtmlSanPham(String(review.created_at || '').replace('T', ' ').slice(0, 10));
            const comment = String(review.comment || '').trim();
            const productId = Number(review.product_id) || 0;
            const productName = escHtmlSanPham(review.product_name || 'Sản phẩm');
            return '<article class="product-review-card landing-review-card">' +
                '<div class="product-review-card-head"><span class="product-review-stars" aria-label="' + rating + ' trên 5 sao">' + stars + '</span><time>' + date + '</time></div>' +
                (comment ? '<p>' + escHtmlSanPham(comment) + '</p>' : '<p class="product-review-no-comment">Khách hàng không để lại nhận xét.</p>') +
                '<span class="product-review-verified"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Đã xác nhận nhận hàng</span>' +
                '<a class="landing-review-product" href="product-detail.html?id=' + productId + '">' + productName + '<i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>' +
                '</article>';
        }).join('');
    } catch (error) {
        grid.innerHTML = '<p class="empty-state-desc">' + escHtmlSanPham(error.message || 'Không tải được đánh giá.') + '</p>';
    }
}

function khoiTaoTabSanPham() {
    const tabButtons = document.querySelectorAll('.nut-tab');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-tab');
            tabButtons.forEach(b => b.classList.remove('dang-chon'));
            document.querySelectorAll('.noi-dung-tab').forEach(p => p.classList.remove('dang-chon'));

            btn.classList.add('dang-chon');
            const targetPane = document.getElementById(targetId);
            if (targetPane) targetPane.classList.add('dang-chon');
        });
    });
}

// Tự động kích hoạt khi ở trang products.html hoặc product-detail.html
document.addEventListener('DOMContentLoaded', async () => {
    if (document.getElementById('recentReviewsGrid')) await taiDanhGiaMoiNhatTrangChu();
    if (document.getElementById('catalogProductsGrid')) await khoiTaoTrangDanhSachSanPham();
    if (document.getElementById('productDetailContainer')) await khoiTaoTrangChiTietSanPham();
});

