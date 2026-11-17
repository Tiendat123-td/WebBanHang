<?php
session_start();
require_once __DIR__ . '/../config/db.php';
$userId = (int) ($_SESSION['user']['id'] ?? 0);
if ($userId < 1) {
    header('Location: login.php');
    exit;
}
$authStmt = mysqli_prepare($conn, 'SELECT id,full_name,email,phone,role,status FROM users WHERE id=? LIMIT 1');
if (!$authStmt) {
    http_response_code(500);
    exit('Không thể xác thực phiên quản trị.');
}
mysqli_stmt_bind_param($authStmt, 'i', $userId);
if (!mysqli_stmt_execute($authStmt)) {
    mysqli_stmt_close($authStmt);
    http_response_code(500);
    exit('Không thể xác thực phiên quản trị.');
}
$adminUser = mysqli_fetch_assoc(mysqli_stmt_get_result($authStmt));
mysqli_stmt_close($authStmt);
if (!$adminUser || $adminUser['status'] !== 'active') {
    $_SESSION = [];
    session_destroy();
    header('Location: login.php');
    exit;
}
$_SESSION['user'] = [
    'id' => (int) $adminUser['id'],
    'full_name' => $adminUser['full_name'],
    'email' => $adminUser['email'],
    'phone' => $adminUser['phone'],
    'role' => $adminUser['role']
];
if ($adminUser['role'] !== 'admin') {
    header('Location: login.php');
    exit;
}
$name = htmlspecialchars($adminUser['full_name'] ?? 'Admin', ENT_QUOTES, 'UTF-8');
?>
<!doctype html>
<html lang="vi">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Quản trị | Đạt Nguyên Thức Shop</title>
    <style>
    :root {
        --brown: #633b2e;
        --cream: #f7f3ef;
        --line: #e9e1dc;
        --ink: #292421
    }

    * {
        box-sizing: border-box
    }

    body {
        margin: 0;
        background: #f6f7fb;
        color: var(--ink);
        font: 15px Arial, sans-serif
    }

    .layout {
        display: grid;
        grid-template-columns: 230px 1fr;
        min-height: 100vh
    }

    .side {
        background: #2e2522;
        color: #fff;
        padding: 25px 16px
    }

    .brand {
        font-size: 19px;
        font-weight: bold;
        margin: 0 8px 30px
    }

    .nav button {
        display: block;
        width: 100%;
        text-align: left;
        border: 0;
        background: transparent;
        color: #eee;
        padding: 13px 12px;
        border-radius: 8px;
        cursor: pointer;
        margin: 4px 0
    }

    .nav button.active,
    .nav button:hover {
        background: #633b2e
    }

    .main {
        padding: 28px;
        min-width: 0
    }

    .top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap
    }

    .top h1 {
        margin: 0 0 7px;
        font-size: 26px
    }

    .muted {
        color: #777
    }

    .cards {
        display: grid;
        grid-template-columns: repeat(4, minmax(130px, 1fr));
        gap: 14px;
        margin: 24px 0
    }

    .card,
    .panel {
        background: white;
        border: 1px solid var(--line);
        border-radius: 12px;
        padding: 18px
    }

    .card small {
        color: #777
    }

    .num {
        font-size: 27px;
        font-weight: bold;
        margin-top: 9px
    }

    .panel {
        margin-top: 18px;
        overflow: hidden
    }

    .panel-head {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
        margin-bottom: 15px
    }

    .panel h2 {
        font-size: 19px;
        margin: 0
    }

    button,
    .btn {
        border: 0;
        border-radius: 7px;
        padding: 10px 13px;
        background: var(--brown);
        color: white;
        cursor: pointer
    }

    .btn.secondary {
        background: #eee7e2;
        color: #392d28
    }

    .btn.danger {
        background: #a73535
    }

    .search {
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 7px;
        min-width: 220px
    }

    table {
        width: 100%;
        border-collapse: collapse;
        min-width: 760px
    }

    th,
    td {
        padding: 12px 10px;
        border-bottom: 1px solid #eee;
        text-align: left;
        font-size: 13px
    }

    th {
        background: #faf8f6;
        color: #5b4a43
    }

    td .btn {
        padding: 7px 9px;
        font-size: 12px;
        margin: 2px
    }

    .table-wrap {
        overflow: auto
    }

    .status {
        display: inline-block;
        padding: 5px 8px;
        border-radius: 20px;
        background: #eee;
        font-size: 12px
    }

    .modal {
        position: fixed;
        inset: 0;
        background: #0007;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 18px;
        z-index: 5
    }

    .modal.show {
        display: flex
    }

    .dialog {
        background: white;
        border-radius: 12px;
        padding: 22px;
        width: min(620px, 100%);
        max-height: 90vh;
        overflow: auto
    }

    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px
    }

    .form-grid[hidden] {
        display: none !important;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 6px
    }

    .field.full {
        grid-column: 1/-1
    }

    .field input,
    .field select,
    .field textarea {
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 7px;
        font: inherit
    }

    .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 18px
    }

    .notice {
        padding: 12px;
        border-radius: 8px;
        background: #f7f3ef;
        margin: 14px 0;
        display: none
    }

    .notice.show {
        display: block
    }

    .empty {
        padding: 30px;
        text-align: center;
        color: #777
    }

    .review-stars {
        color: #b7791f;
        letter-spacing: 1px;
        white-space: nowrap
    }

    .review-comment {
        min-width: 240px;
        max-width: 440px;
        white-space: pre-wrap
    }

    @media(max-width:850px) {
        .layout {
            grid-template-columns: 1fr
        }

        .side {
            padding: 14px
        }

        .brand {
            margin-bottom: 12px
        }

        .nav {
            display: flex;
            overflow: auto
        }

        .nav button {
            white-space: nowrap;
            width: auto
        }

        .main {
            padding: 16px
        }

        .cards {
            grid-template-columns: repeat(2, minmax(0, 1fr))
        }
    }

    @media(max-width:520px) {
        .form-grid {
            grid-template-columns: 1fr
        }

        .field.full {
            grid-column: auto
        }

        .cards {
            gap: 8px
        }

        .card {
            padding: 12px
        }
    }
    </style>
</head>

<body>
    <div class="layout">
        <aside class="side">
            <div class="brand">Đạt Nguyên Thức Shop</div>
            <div class="nav"><button class="active" data-page="dashboard">Tổng quan</button><button
                    data-page="products">Quản lý sản phẩm</button><button data-page="categories">Danh
                    mục</button><button data-page="orders">Đơn hàng</button><button data-page="users">Người
                    dùng</button><button data-page="coupons">Mã khuyến mãi</button><button data-page="reviews">Đánh giá</button></div><button style="width:100%;margin-top:25px;background:#4b403c" id="logout">Đăng
                xuất</button>
        </aside>
        <main class="main">
            <div class="top">
                <div>
                    <h1 id="pageTitle">Tổng quan</h1>
                    <div class="muted">Xin chào, <?= $name ?>. Quản lý dữ liệu cửa hàng tại đây.</div>
                </div><a class="btn secondary" href="../index.html" style="text-decoration:none">Về cửa hàng</a>
            </div>
            <div id="notice" class="notice"></div>
            <section id="dashboard">
                <div class="cards">
                    <div class="card"><small>Tài khoản khách hàng</small>
                        <div class="num" id="statUsers">—</div>
                    </div>
                    <div class="card"><small>Sản phẩm</small>
                        <div class="num" id="statProducts">—</div>
                    </div>
                    <div class="card"><small>Đơn hàng</small>
                        <div class="num" id="statOrders">—</div>
                    </div>
                    <div class="card"><small>Doanh thu hoàn tất</small>
                        <div class="num" id="statRevenue">—</div>
                    </div>
                </div>
                <div class="panel">
                    <h2>Đơn hàng mới nhất</h2>
                    <div class="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Mã đơn</th>
                                    <th>Khách hàng</th>
                                    <th>Tổng tiền</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày tạo</th>
                                </tr>
                            </thead>
                            <tbody id="recentOrders"></tbody>
                        </table>
                    </div>
                </div>
            </section>
            <section id="products" hidden>
                <div class="panel">
                    <div class="panel-head">
                        <h2>Danh sách sản phẩm</h2>
                        <div><input class="search" id="productSearch" placeholder="Tìm sản phẩm..."><button
                                id="addProduct">+ Thêm sản phẩm</button></div>
                    </div>
                    <div class="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tên sản phẩm</th>
                                    <th>Danh mục</th>
                                    <th>Giá</th>
                                    <th>Tồn kho</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody id="productRows"></tbody>
                        </table>
                    </div>
                </div>
            </section>
            <section id="categories" hidden>
                <div class="panel">
                    <div class="panel-head">
                        <h2>Danh mục sản phẩm</h2><button id="addCategory">+ Thêm danh mục</button>
                    </div>
                    <div class="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tên danh mục</th>
                                    <th>Sản phẩm</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody id="categoryRows"></tbody>
                        </table>
                    </div>
                </div>
            </section>
            <section id="coupons" hidden>
                <div class="panel">
                    <div class="panel-head">
                        <h2>Danh sách mã khuyến mãi</h2>
                        <button id="addCoupon" type="button">+ Thêm mã</button>
                    </div>
                    <div class="table-wrap">
                        <table>
                            <thead><tr><th>Mã khuyến mãi</th><th>Ưu đãi</th><th>Đơn tối thiểu</th><th>Thời hạn</th><th>Lượt dùng</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                            <tbody id="couponRows"></tbody>
                        </table>
                    </div>
                </div>
            </section>
            <section id="orders" hidden>
                <div class="panel">
                    <div class="panel-head">
                        <h2>Quản lý đơn hàng</h2><input class="search" id="orderSearch"
                            placeholder="Tìm mã đơn, tên, email...">
                    </div>
                    <div class="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Mã đơn</th>
                                    <th>Khách hàng</th>
                                    <th>Liên hệ</th>
                                    <th>Sản phẩm / size</th>
                                    <th>Tổng tiền</th>
                                    <th>Thanh toán</th>
                                    <th>Trạng thái đơn</th>
                                    <th>Cập nhật</th>
                                </tr>
                            </thead>
                            <tbody id="orderRows"></tbody>
                        </table>
                    </div>
                </div>
            </section>
            <section id="reviews" hidden>
                <div class="panel">
                    <div class="panel-head">
                        <div>
                            <h2>Đánh giá của khách hàng</h2>
                            <div id="reviewCount" class="muted">Đang tải đánh giá...</div>
                        </div>
                        <input class="search" id="reviewSearch" type="search" placeholder="Tìm sản phẩm, khách hàng, mã đơn...">
                    </div>
                    <p class="muted">Chỉ hiển thị đánh giá cho sản phẩm trong đơn hàng khách đã xác nhận nhận.</p>
                    <div class="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Mã đơn</th>
                                    <th>Sản phẩm</th>
                                    <th>Khách hàng</th>
                                    <th>Xếp hạng</th>
                                    <th>Nội dung</th>
                                    <th>Ngày đánh giá</th>
                                </tr>
                            </thead>
                            <tbody id="reviewRows"></tbody>
                        </table>
                    </div>
                </div>
            </section>
            <section id="users" hidden>
                <div class="panel">
                    <div class="panel-head">
                        <h2>Danh sách khách hàng</h2>
                        <div>
                            <input class="search" id="userSearch" type="search"
                                placeholder="Tìm tên, email, số điện thoại...">
                            <select class="search" id="userStatus" aria-label="Lọc trạng thái tài khoản">
                                <option value="all">Tất cả trạng thái</option>
                                <option value="active">Hoạt động</option>
                                <option value="locked">Đã khóa</option>
                                <option value="pending">Chờ duyệt</option>
                            </select>
                        </div>
                    </div>
                    <div class="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Khách hàng</th>
                                    <th>Điện thoại</th>
                                    <th>Đơn hàng</th>
                                    <th>Ngày tham gia</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody id="userRows"></tbody>
                        </table>
                    </div>
                    <div class="panel-head" style="margin:16px 0 0">
                        <span class="muted" id="userPageInfo">Trang 1/1</span>
                        <div>
                            <button class="btn secondary" id="prevUsers" type="button">Trước</button>
                            <button class="btn secondary" id="nextUsers" type="button">Sau</button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>
    <div class="modal" id="modal">
        <div class="dialog">
            <h2 id="modalTitle">Thêm sản phẩm</h2>
            <form id="editor"><input type="hidden" id="entityId">
                <div id="productFields" class="form-grid"><label class="field full">Tên sản phẩm<input id="pName"
                            required maxlength="200"></label><label class="field">Danh mục<select id="pCategory">
                            <option value="">Chưa phân loại</option>
                        </select></label><label class="field">Giá gốc (VNĐ)<input id="pPrice" type="number" min="0"
                            required></label><label class="field">Giá khuyến mãi<input id="pSale" type="number"
                            min="0"></label><label class="field">Tồn kho<input id="pStock" type="number" min="0"
                            value="0" required></label><label class="field full">Ảnh sản phẩm (JPG/PNG/GIF/WebP, tối đa 5 MB)<input type="file"
                            id="pImage" accept="image/*"></label><label class="field">Trạng
                        thái<select id="pStatus">
                            <option value="active">Đang bán</option>
                            <option value="hidden">Ẩn</option>
                            <option value="out_of_stock">Hết hàng</option>
                        </select></label><label class="field full">Mô tả<textarea id="pDescription"
                            rows="3"></textarea></label></div>
                <div id="categoryFields" class="form-grid" hidden><label class="field full">Tên danh mục<input
                            id="cName" maxlength="120" required></label></div>
                <div id="couponFields" class="form-grid" hidden>
                    <label class="field">Mã khuyến mãi<input id="couponCode" maxlength="40" pattern="[A-Za-z0-9_-]{3,40}" required></label>
                    <label class="field">Loại ưu đãi<select id="couponType"><option value="percent">Giảm theo phần trăm</option><option value="fixed">Giảm số tiền</option><option value="shipping">Miễn phí vận chuyển</option></select></label>
                    <label class="field full">Mô tả<input id="couponDescription" maxlength="200" placeholder="Ví dụ: Ưu đãi mùa hè"></label>
                    <label class="field" id="couponValueField">Mức giảm<input id="couponValue" type="number" min="0" step="any" required><small id="couponValueHelp" class="muted">Phần trăm từ 1 đến 100.</small></label>
                    <label class="field">Đơn tối thiểu (VNĐ)<input id="couponMinOrder" type="number" min="0" step="1000" value="0"></label>
                    <label class="field" id="couponMaxField">Giảm tối đa (VNĐ)<input id="couponMax" type="number" min="0" step="1000" placeholder="Để trống nếu không giới hạn"></label>
                    <label class="field">Giới hạn lượt dùng<input id="couponLimit" type="number" min="1" step="1" placeholder="Để trống nếu không giới hạn"></label>
                    <label class="field">Bắt đầu<input id="couponStart" type="datetime-local"></label>
                    <label class="field">Hết hạn<input id="couponEnd" type="datetime-local"></label>
                    <label class="field">Trạng thái<select id="couponStatus"><option value="active">Đang bật</option><option value="inactive">Tạm dừng</option></select></label>
                </div>
                <div class="actions"><button type="button" class="btn secondary" id="cancelModal">Hủy</button><button
                        type="submit">Lưu dữ liệu</button></div>
            </form>
        </div>
    </div>
    <script>
    const $ = id => document.getElementById(id);
    let products = [],
        categories = [],
        coupons = [],
        orders = [],
        reviews = [],
        users = [],
        userPage = 1,
        userPages = 1,
        userSearchTimer = null,
        editingType = 'product';
    const money = n => new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(Number(n) || 0);
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    } [c]));
    async function api(url, method = 'GET', data = null) {
        const opt = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        if (data) opt.body = JSON.stringify(data);
        const r = await fetch(url, opt);
        let j;
        try {
            j = await r.json()
        } catch (e) {
            throw Error('Máy chủ trả về dữ liệu không hợp lệ.')
        }
        if (!r.ok || j.success === false) throw Error(j.message || 'Có lỗi xảy ra.');
        return j
    }

    function notify(msg, error = false) {
        $('notice').textContent = msg;
        $('notice').style.background = error ? '#fde8e7' : '#f7f3ef';
        $('notice').style.display = 'block';
        $('notice').classList.add('show');
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        setTimeout(() => $('notice').classList.remove('show'), 4500)
    }

    function moneyCompact(n) {
        return money(n)
    }

    function orderStatusLabel(status) {
        const labels = {
            pending: 'Đang xử lý',
            confirmed: 'Đã xác nhận',
            shipping: 'Đang giao',
            completed: 'Hoàn tất',
            cancelled: 'Đã hủy'
        };
        return labels[status] || status || 'Không xác định';
    }

    function showPage(page) {
        document.querySelectorAll('main section').forEach(s => s.hidden = s.id !== page);
        document.querySelectorAll('.nav [data-page]').forEach(b => b.classList.toggle('active', b.dataset.page ===
            page));
        $('pageTitle').textContent = ({
            dashboard: 'Tổng quan',
            products: 'Quản lý sản phẩm',
            categories: 'Quản lý danh mục',
            orders: 'Quản lý đơn hàng',
            users: 'Quản lý người dùng',
            coupons: 'Quản lý mã khuyến mãi',
            reviews: 'Đánh giá khách hàng'
        })[page];
        if (page === 'dashboard') loadDashboard();
        if (page === 'products') loadProducts();
        if (page === 'categories') loadCategories();
        if (page === 'orders') loadOrders();
        if (page === 'users') loadUsers(true);
        if (page === 'coupons') loadCoupons();
        if (page === 'reviews') loadReviews()
    }
    document.querySelectorAll('[data-page]').forEach(b => b.onclick = () => showPage(b.dataset.page));
    async function loadDashboard() {
        try {
            const d = await api('../api/admin/dashboard.php');
            $('statUsers').textContent = d.statistics.users;
            $('statProducts').textContent = d.statistics.products;
            $('statOrders').textContent = d.statistics.orders;
            $('statRevenue').textContent = money(d.statistics.revenue || 0);
            const o = await api('../api/admin/orders.php');
            orders = o.orders;
            $('recentOrders').innerHTML = orders.slice(0, 8).map(x =>
                `<tr><td>${esc(x.order_code)}</td><td>${esc(x.recipient_name)}</td><td>${money(x.total)}</td><td>${esc(orderStatusLabel(x.order_status))}</td><td>${esc(x.created_at)}</td></tr>`
            ).join('') || '<tr><td colspan="5" class="empty">Chưa có đơn hàng.</td></tr>'
        } catch (e) {
            notify(e.message, true)
        }
    }
    function renderProductCategoryOptions() {
        const select = $('pCategory');
        const selected = select.value;
        select.innerHTML = '<option value="">Chưa phân loại</option>' + categories.map(c =>
            `<option value="${c.id}">${esc(c.name)}</option>`).join('');
        if (categories.some(c => String(c.id) === selected)) select.value = selected;
    }
    async function loadProducts() {
        try {
            products = (await api('../api/admin/products.php')).products;
            categories = (await api('../api/admin/categories.php')).categories;
            renderProductCategoryOptions();
            renderProducts()
        } catch (e) {
            notify(e.message, true)
        }
    }

    function renderProducts() {
        const q = $('productSearch').value.toLowerCase();
        const list = products.filter(p => (p.name + ' ' + (p.category_name || '')).toLowerCase().includes(q));
        $('productRows').innerHTML = list.map(p =>
            `<tr><td>${p.id}</td><td>${esc(p.name)}</td><td>${esc(p.category_name || '—')}</td><td>${money(p.sale_price !== null && p.sale_price !== '' ? p.sale_price : p.price)}</td><td>${p.stock}</td><td><span class="status">${esc(p.status)}</span></td><td><button class="btn" onclick="editProduct(${p.id})">Sửa</button><button class="btn danger" onclick="deleteProduct(${p.id})">Xóa</button></td></tr>`
        ).join('') || '<tr><td colspan="7" class="empty">Không có sản phẩm.</td></tr>'
    }
    async function loadCategories() {
        try {
            categories = (await api('../api/admin/categories.php')).categories;
            products = (await api('../api/admin/products.php')).products;
            renderProductCategoryOptions();
            $('categoryRows').innerHTML = categories.map(c =>
                `<tr><td>${c.id}</td><td>${esc(c.name)}</td><td>${c.product_count}</td><td><button class="btn" onclick="editCategory(${c.id})">Sửa</button><button class="btn danger" onclick="deleteCategory(${c.id})">Xóa</button></td></tr>`
            ).join('') || '<tr><td colspan="4" class="empty">Chưa có danh mục.</td></tr>'
        } catch (e) {
            notify(e.message, true)
        }
    }
    async function loadCoupons() {
        try {
            coupons = (await api('../api/admin/coupons.php')).coupons || [];
            renderCoupons();
        } catch (e) {
            notify(e.message, true);
        }
    }

    function renderCoupons() {
        $('couponRows').innerHTML = coupons.map(c => {
            const offer = c.discount_type === 'percent' ? 'Giảm ' + c.discount_value + '%' + (c.max_discount ? '<br><small>Tối đa ' + money(c.max_discount) + '</small>' : '') :
                c.discount_type === 'fixed' ? 'Giảm ' + money(c.discount_value) : 'Miễn phí vận chuyển';
            const period = esc(c.starts_at ? 'Từ ' + String(c.starts_at).slice(0, 16) : 'Bắt đầu ngay') + '<br>' + esc(c.expires_at ? 'Đến ' + String(c.expires_at).slice(0, 16) : 'Không hết hạn');
            const uses = c.usage_limit === null ? c.usage_count + ' lượt' : c.usage_count + '/' + c.usage_limit;
            return '<tr><td><strong>' + esc(c.code) + '</strong><br><small>' + esc(c.description || '—') + '</small></td><td>' + offer + '</td><td>' + money(c.min_order) + '</td><td>' + period + '</td><td>' + uses + '</td><td><span class="status">' + (c.status === 'active' ? 'Đang bật' : 'Tạm dừng') + '</span></td><td><button class="btn" onclick="editCoupon(' + c.id + ')">Sửa</button></td></tr>';
        }).join('') || '<tr><td colspan="7" class="empty">Chưa có mã khuyến mãi.</td></tr>';
    }

    function setCouponFormType() {
        const shipping = $('couponType').value === 'shipping';
        $('couponValueField').hidden = shipping;
        $('couponValue').disabled = shipping;
        $('couponValue').required = !shipping;
        $('couponMaxField').hidden = $('couponType').value !== 'percent';
        $('couponValueHelp').textContent = $('couponType').value === 'percent' ? 'Phần trăm từ 1 đến 100.' : 'Nhập số tiền giảm bằng VNĐ.';
    }

    $('couponType').onchange = setCouponFormType;
    $('addCoupon').onclick = () => {
        $('editor').reset();
        $('entityId').value = '';
        $('couponType').value = 'percent';
        $('couponValue').value = 10;
        $('couponMinOrder').value = 0;
        $('couponStatus').value = 'active';
        setCouponFormType();
        openModal('coupon', 'Thêm mã khuyến mãi');
    };

    window.editCoupon = id => {
        const c = coupons.find(x => Number(x.id) === Number(id));
        if (!c) return;
        $('editor').reset();
        $('entityId').value = c.id;
        $('couponCode').value = c.code;
        $('couponDescription').value = c.description || '';
        $('couponType').value = c.discount_type;
        $('couponValue').value = c.discount_value;
        $('couponMinOrder').value = c.min_order;
        $('couponMax').value = c.max_discount ?? '';
        $('couponLimit').value = c.usage_limit ?? '';
        $('couponStart').value = c.starts_at ? String(c.starts_at).replace(' ', 'T').slice(0, 16) : '';
        $('couponEnd').value = c.expires_at ? String(c.expires_at).replace(' ', 'T').slice(0, 16) : '';
        $('couponStatus').value = c.status;
        setCouponFormType();
        openModal('coupon', 'Chỉnh sửa mã ' + c.code);
    };

    async function loadReviews() {
        try {
            const data = await api('../api/admin/reviews.php');
            reviews = data.reviews || [];
            renderReviews();
        } catch (e) {
            notify(e.message, true);
        }
    }

    function renderReviews() {
        const query = $('reviewSearch').value.trim().toLocaleLowerCase();
        const list = reviews.filter(review => [
            review.order_code,
            review.product_name,
            review.customer_name,
            review.customer_email,
            review.comment
        ].some(value => String(value || '').toLocaleLowerCase().includes(query)));
        $('reviewCount').textContent = 'Hiển thị ' + list.length + ' / ' + reviews.length + ' đánh giá từ đơn hàng đã nhận.';
        $('reviewRows').innerHTML = list.map(review => {
            const rating = Math.max(0, Math.min(5, Number(review.rating) || 0));
            const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
            const comment = review.comment
                ? esc(review.comment)
                : '<span class="muted">Khách hàng không để lại nội dung.</span>';
            return '<tr><td>' + esc(review.order_code) +
                '</td><td>' + esc(review.product_name) +
                '</td><td>' + esc(review.customer_name) + '<br><small>' + esc(review.customer_email) +
                '</small></td><td><span class="review-stars" aria-hidden="true">' + stars +
                '</span><br><small>' + rating + '/5 sao</small></td><td class="review-comment">' + comment +
                '</td><td>' + esc(review.created_at) + '</td></tr>';
        }).join('') || '<tr><td colspan="6" class="empty">Chưa có đánh giá phù hợp.</td></tr>';
    }

    async function loadUsers(resetPage = false) {
        if (resetPage) userPage = 1;
        const params = new URLSearchParams({
            q: $('userSearch').value.trim(),
            status: $('userStatus').value,
            page: userPage,
            per_page: 20
        });
        try {
            const data = await api('../api/admin/users.php?' + params.toString());
            users = data.users || [];
            userPage = Number(data.pagination.page) || 1;
            userPages = Number(data.pagination.total_pages) || 1;
            $('userRows').innerHTML = users.map(user => {
                const active = user.status === 'active';
                const pending = user.status === 'pending';
                const nextStatus = active ? 'locked' : 'active';
                const statusLabel = pending ? 'Chờ duyệt' : (active ? 'Hoạt động' : 'Đã khóa');
                const actionLabel = pending ? 'Duyệt tài khoản' : (active ? 'Khóa tài khoản' : 'Mở khóa');
                const actionClass = active ? 'danger' : 'secondary';
                return '<tr><td>' + user.id + '</td><td>' + esc(user.full_name) + '<br><small>' + esc(user
                        .email) + '</small></td><td>' + esc(user.phone || '—') + '</td><td>' + user
                    .order_count + '</td><td>' + esc(user.created_at) + '</td><td><span class="status">' +
                    statusLabel + '</span></td><td><button class="btn ' + actionClass + '" data-user-id="' +
                    user.id + '" data-user-status="' + nextStatus + '">' + actionLabel +
                    '</button><button class="btn danger" data-delete-user-id="' + user.id + '">Xóa</button></td></tr>';
            }).join('') || '<tr><td colspan="7" class="empty">Không tìm thấy khách hàng.</td></tr>';
            $('userRows').querySelectorAll('[data-user-id]').forEach(button => {
                button.onclick = () => window.changeUserStatus(Number(button.dataset.userId), button.dataset
                    .userStatus);
            });
            $('userRows').querySelectorAll('[data-delete-user-id]').forEach(button => {
                button.onclick = () => window.deleteUser(Number(button.dataset.deleteUserId));
            });
            $('userPageInfo').textContent = 'Trang ' + userPage + '/' + userPages + ' · ' + data.pagination.total +
                ' khách hàng';
            $('prevUsers').disabled = userPage <= 1;
            $('nextUsers').disabled = userPage >= userPages;
        } catch (e) {
            notify(e.message, true);
        }
    }

    window.changeUserStatus = async (id, status) => {
        const user = users.find(item => Number(item.id) === id);
        const question = status === 'active' && user && user.status === 'pending' ?
            'Duyệt tài khoản này? Người dùng sẽ được phép đăng nhập.' :
            (status === 'locked' ?
                'Khóa tài khoản này? Người dùng sẽ bị đăng xuất và không thể tiếp tục sử dụng tài khoản.' :
                'Mở khóa tài khoản này?');
        if (!confirm(question)) return;
        try {
            const result = await api('../api/admin/users.php', 'PUT', {
                id,
                status
            });
            notify(result.message);
            await loadUsers(false);
        } catch (e) {
            notify(e.message, true);
        }
    };

    window.deleteUser = async id => {
        const user = users.find(item => Number(item.id) === id);
        if (!user) return;
        const question = 'Xóa tài khoản ' + user.full_name + ' (' + user.email + ')? Thông tin cá nhân, giỏ hàng và đánh giá sẽ bị xóa. Lịch sử đơn hàng vẫn được giữ lại nhưng thông tin khách nhận hàng sẽ được ẩn. Thao tác này không thể hoàn tác.';
        if (!confirm(question)) return;
        try {
            const result = await api('../api/admin/users.php', 'DELETE', { id });
            notify(result.message);
            await loadUsers(false);
            loadDashboard();
            loadOrders();
        } catch (e) {
            notify(e.message, true);
        }
    };

    async function loadOrders() {
        try {
            orders = (await api('../api/admin/orders.php')).orders;
            renderOrders()
        } catch (e) {
            notify(e.message, true)
        }
    }

    function renderOrders() {
        const q = $('orderSearch').value.toLowerCase();
        const list = orders.filter(o => (o.order_code + ' ' + o.recipient_name + ' ' + o.email + ' ' + (o.items || []).map(item => item.product_name).join(' ')).toLowerCase().includes(
            q));
        $('orderRows').innerHTML = list.map(o => {
            const itemSummary = (o.items || []).map(item => `${esc(item.product_name)} × ${Number(item.quantity) || 0} · Size ${esc(item.size || 'M')}`).join('<br>') || '—';
            return `<tr><td>${esc(o.order_code)}<br><small>${esc(o.created_at)}</small></td><td>${esc(o.recipient_name)}<br><small>${esc(o.email)}</small></td><td>${esc(o.recipient_phone)}<br><small>${esc(o.shipping_address)}</small></td><td><small>${itemSummary}</small></td><td>${money(o.total)}${o.coupon_code ? '<br><small>Mã: ' + esc(o.coupon_code) + ' · giảm ' + money(o.discount) + '</small>' : ''}</td><td><select id="pay-${o.id}"><option value="unpaid" ${o.payment_status === 'unpaid' ? 'selected' : ''}>Chưa thanh toán</option><option value="paid" ${o.payment_status === 'paid' ? 'selected' : ''}>Đã thanh toán</option><option value="refunded" ${o.payment_status === 'refunded' ? 'selected' : ''}>Đã hoàn tiền</option></select></td><td><select id="status-${o.id}">${[['pending', 'Đang xử lý'], ['confirmed', 'Đã xác nhận'], ['shipping', 'Đang giao'], ['completed', 'Hoàn tất'], ['cancelled', 'Đã hủy']].map(([v, l]) => `<option value="${v}" ${o.order_status === v ? 'selected' : ''}>${l}</option>`).join('')}</select></td><td><button class="btn" onclick="updateOrder(${o.id})">Lưu</button></td></tr>`
        }).join('') || '<tr><td colspan="8" class="empty">Không tìm thấy đơn hàng.</td></tr>'
    }

    function openModal(type, title) {
        editingType = type;
        $('modalTitle').textContent = title;
        const isProduct = type === 'product';
        const isCategory = type === 'category';
        const isCoupon = type === 'coupon';
        $('productFields').hidden = !isProduct;
        $('categoryFields').hidden = !isCategory;
        $('couponFields').hidden = !isCoupon;
        $('productFields').querySelectorAll('input, select, textarea').forEach(field => field.disabled = !isProduct);
        $('categoryFields').querySelectorAll('input, select, textarea').forEach(field => field.disabled = !isCategory);
        $('couponFields').querySelectorAll('input, select, textarea').forEach(field => field.disabled = !isCoupon);
        if (isCoupon) setCouponFormType();
        $('modal').classList.add('show')
    }
    $('cancelModal').onclick = () => $('modal').classList.remove('show');
    $('modal').onclick = e => {
        if (e.target === $('modal')) $('modal').classList.remove('show')
    };
    $('addProduct').onclick = () => {
        $('editor').reset();
        $('entityId').value = '';
        $('pStock').value = 0;
        openModal('product', 'Thêm sản phẩm')
    };
    window.editProduct = id => {
        const p = products.find(x => +x.id === id);
        if (!p) return;

        $('editor').reset();
        $('entityId').value = id;
        $('pName').value = p.name;
        $('pCategory').value = p.category_id || '';
        $('pPrice').value = p.price;
        $('pSale').value = p.sale_price ?? '';
        $('pStock').value = p.stock;

        // Không gán đường dẫn vào input type="file"
        $('pImage').value = '';

        $('pStatus').value = p.status;
        $('pDescription').value = p.description || '';

        openModal('product', 'Cập nhật sản phẩm');
    };
    window.deleteProduct = async id => {
        if (!confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) return;
        try {
            const r = await api('../api/admin/products.php', 'DELETE', {
                id
            });
            notify(r.message);
            loadProducts()
        } catch (e) {
            notify(e.message, true)
        }
    };
    $('addCategory').onclick = () => {
        $('editor').reset();
        $('entityId').value = '';
        openModal('category', 'Thêm danh mục')
    };
    window.editCategory = id => {
        const c = categories.find(x => +x.id === id);
        if (!c) return;
        $('editor').reset();
        $('entityId').value = id;
        $('cName').value = c.name;
        openModal('category', 'Cập nhật danh mục')
    };
    window.deleteCategory = async id => {
        if (!confirm('Xóa danh mục? Sản phẩm trong danh mục sẽ không bị xóa.')) return;
        try {
            const r = await api('../api/admin/categories.php', 'DELETE', {
                id
            });
            notify(r.message);
            loadCategories()
        } catch (e) {
            notify(e.message, true)
        }
    };
    $('editor').onsubmit = async e => {
        e.preventDefault();

        const id = $('entityId').value;

        try {
            let result;

            if (editingType === 'product') {
                // Lấy ảnh được chọn từ máy tính
                const fileAnh = $('pImage').files[0];

                // Tạo FormData để gửi dữ liệu và file ảnh
                const data = new FormData();

                if (id) {
                    data.append('id', Number(id));
                }

                data.append('name', $('pName').value.trim());
                data.append('category_id', $('pCategory').value);
                data.append('price', $('pPrice').value);
                data.append('sale_price', $('pSale').value);
                data.append('stock', $('pStock').value);
                data.append('status', $('pStatus').value);
                data.append('description', $('pDescription').value.trim());

                // Chỉ gửi ảnh khi người dùng chọn ảnh mới
                if (fileAnh) {
                    data.append('image', fileAnh);
                }

                // Gửi FormData lên PHP
                const url = '../api/admin/products.php';

                const response = await fetch(url, {
                    method: id ? 'POST' : 'POST',
                    body: data
                });

                result = await response.json();

                if (!response.ok || result.success === false) {
                    throw new Error(result.message || 'Lưu sản phẩm thất bại');
                }
            } else if (editingType === 'category') {
                const data = {
                    id: id ? Number(id) : undefined,
                    name: $('cName').value.trim()
                };
                result = await api('../api/admin/categories.php', id ? 'PUT' : 'POST', data);
            } else {
                const data = {
                    id: id ? Number(id) : undefined,
                    code: $('couponCode').value.trim(),
                    description: $('couponDescription').value.trim(),
                    discount_type: $('couponType').value,
                    discount_value: $('couponType').value === 'shipping' ? 0 : Number($('couponValue').value),
                    min_order: Number($('couponMinOrder').value || 0),
                    max_discount: $('couponMax').value === '' ? null : Number($('couponMax').value),
                    usage_limit: $('couponLimit').value === '' ? null : Number($('couponLimit').value),
                    starts_at: $('couponStart').value || null,
                    expires_at: $('couponEnd').value || null,
                    status: $('couponStatus').value
                };
                result = await api('../api/admin/coupons.php', id ? 'PUT' : 'POST', data);
            }

            $('modal').classList.remove('show');
            notify(result.message);

            if (editingType === 'product') {
                loadProducts();
            } else if (editingType === 'category') {
                loadCategories();
            } else {
                loadCoupons();
            }
        } catch (err) {
            notify(err.message, true);
        }
    };
    window.updateOrder = async id => {
        try {
            const r = await api('../api/admin/orders.php', 'PUT', {
                id,
                order_status: $('status-' + id).value,
                payment_status: $('pay-' + id).value
            });
            notify(r.message);
            loadOrders()
        } catch (e) {
            notify(e.message, true)
        }
    };
    $('productSearch').oninput = renderProducts;
    $('orderSearch').oninput = renderOrders;
    $('reviewSearch').oninput = renderReviews;
    $('userSearch').oninput = () => {
        clearTimeout(userSearchTimer);
        userSearchTimer = setTimeout(() => loadUsers(true), 300);
    };
    $('userStatus').onchange = () => loadUsers(true);
    $('prevUsers').onclick = () => {
        if (userPage > 1) {
            userPage--;
            loadUsers();
        }
    };
    $('nextUsers').onclick = () => {
        if (userPage < userPages) {
            userPage++;
            loadUsers();
        }
    };
    $('logout').onclick = async () => {
        try {
            await fetch('../api/auth/logout.php', {
                method: 'POST'
            })
        } finally {
            localStorage.removeItem('fashion_current_user');
            location.href = 'login.php'
        }
    };
    loadDashboard();
    </script>
</body>

</html>