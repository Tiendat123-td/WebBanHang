HUONG DAN CHAY DATNGUYENTHUC SHOP - PHP + MYSQL (BAN CO BAN)

1. Mo XAMPP Control Panel, nhan Start cho Apache va MySQL.
2. Dat thu muc DatNguyenThucShop trong DocumentRoot cua Apache. Neu DocumentRoot da tro thang vao thu muc nay, mo http://localhost/.
3. Mo http://localhost/phpmyadmin, chon Import va import file database/datnguyenthucshop.sql. Neu dang dung CSDL cu, chi chay cac file migration con thieu mot lan: database/coupon_migration.sql de them ma khuyen mai, database/size_migration.sql de them size vao gio hang/don hang, va database/review_receipt_migration.sql de them xac nhan nhan hang va danh gia.
4. Mo config/db.php. Mac dinh XAMPP thuong dung host 127.0.0.1, user root, mat khau trong. Sua neu may cua ban khac.
5. Tao tai khoan admin bang cach mo http://localhost/create_admin.php mot lan.
   Email va mat khau duoc khai bao o dau file create_admin.php; script se hien thong tin khi tao thanh cong.
   Neu tai khoan da ton tai, script chi gan role admin va khong doi mat khau.
   Hay xoa create_admin.php ngay sau khi tao admin; ung dung hien chua co man hinh doi mat khau cho admin.
6. Dang ky tai khoan moi tai register.html; tai khoan dang ky luon duoc gan role user.
7. Khach hang dang nhap tai login.html. Admin dang nhap rieng tai admin/login.php; mo /admin/ de vao bang dieu khien (neu chua dang nhap se duoc chuyen den trang dang nhap admin).

CAU TRUC VA QUYEN
- config/db.php: ket noi MySQL bang MySQLi kieu thu tuc (mysqli_connect).
- api/auth/: dang ky, dang nhap, dang xuat va kiem tra session.
- api/admin/: API quan tri co kiem tra role admin.
- admin/index.php: trang thong ke don gian, chi Admin duoc vao.
- database/datnguyenthucshop.sql: tao bang users, categories, products, cart_items, coupons, orders, order_items, product_reviews.
- Role user la mac dinh khi dang ky. Khong nhan role tu form dang ky.
- Mat khau duoc ma hoa bang password_hash va kiem tra bang password_verify.
- Truy van co du lieu nhap su dung mysqli_prepare, mysqli_stmt_bind_param va mysqli_stmt_execute.

GHI CHU CHO BAO CAO
- MySQLi kieu thu tuc va prepared statement la phan mo rong co ban de ket noi CSDL an toan.
- Session PHP duoc dung de nho nguoi dung da dang nhap va kiem tra quyen.
- Khong su dung PDO, MySQLi huong doi tuong hay framework backend.
- Danh muc va san pham duoc tai tu API PHP/MySQL. Cua hang cho chon size S, M hoac XL; size duoc luu theo tung dong gio hang va don hang. Ton kho hien van dung chung theo san pham. Tai khoan khach hang dong bo gio hang va don hang voi MySQL. Yeu thich va dia chi mac dinh hien van luu trong trinh duyet.
