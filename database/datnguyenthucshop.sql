-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th10 08, 2026 lúc 03:40 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `datnguyenthucshop`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cart_items`
--

CREATE TABLE `cart_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `size` varchar(10) NOT NULL DEFAULT 'M',
  `quantity` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `cart_items`
--

INSERT INTO `cart_items` (`id`, `user_id`, `product_id`, `size`, `quantity`, `created_at`, `updated_at`) VALUES
(23, 3, 6, 'XL', 1, '2026-10-29 09:33:33', '2026-10-29 09:33:33'),
(24, 3, 1, 'XL', 1, '2026-10-29 09:33:33', '2026-10-29 09:33:33'),
(38, 2, 18, 'M', 1, '2026-11-08 14:38:32', '2026-11-08 14:38:32');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','hidden') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `status`, `created_at`) VALUES
(1, 'Áo', 'ao-ae66c', '', 'active', '2026-10-28 14:50:09'),
(2, 'Quần', 'qun-acb73', '', 'active', '2026-10-28 15:11:07'),
(3, 'Giày', 'gi-y-9c8db', '', 'active', '2026-11-01 12:24:11'),
(4, 'Túi xách', 't-i-x-ch-e1e8a', '', 'active', '2026-11-05 14:09:16'),
(5, 'Phụ kiện', 'ph-ki-n-d2ce0', '', 'active', '2026-11-05 14:30:58');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `coupons`
--

CREATE TABLE `coupons` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(40) NOT NULL,
  `description` varchar(200) NOT NULL DEFAULT '',
  `discount_type` enum('percent','fixed','shipping') NOT NULL,
  `discount_value` decimal(12,2) NOT NULL DEFAULT 0.00,
  `min_order` decimal(12,2) NOT NULL DEFAULT 0.00,
  `max_discount` decimal(12,2) DEFAULT NULL,
  `usage_limit` int(10) UNSIGNED DEFAULT NULL,
  `usage_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `description`, `discount_type`, `discount_value`, `min_order`, `max_discount`, `usage_limit`, `usage_count`, `status`, `created_at`, `updated_at`) VALUES
(1, 'SALE10', 'Giảm 10% đơn hàng', 'percent', 10.00, 0.00, NULL, NULL, 3, 'active', '2026-10-28 14:48:52', '2026-10-29 09:26:09'),
(2, 'VIP20', 'Giảm 20% đơn hàng', 'percent', 20.00, 0.00, NULL, NULL, 0, 'active', '2026-10-28 14:48:52', '2026-10-28 14:48:52'),
(3, 'FREESHIP', 'Miễn phí vận chuyển', 'shipping', 0.00, 0.00, NULL, NULL, 0, 'active', '2026-10-28 14:48:52', '2026-10-28 14:48:52'),
(4, 'THANG11', 'Giảm 20%', 'percent', 20.00, 10000.00, 150000.00, 5, 1, 'active', '2026-10-29 09:40:37', '2026-10-30 14:37:53');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_code` varchar(30) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `recipient_name` varchar(120) NOT NULL,
  `recipient_phone` varchar(20) NOT NULL,
  `shipping_address` varchar(500) NOT NULL,
  `note` text DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `shipping_fee` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `coupon_id` bigint(20) UNSIGNED DEFAULT NULL,
  `coupon_code` varchar(40) DEFAULT NULL,
  `payment_method` enum('cod') NOT NULL DEFAULT 'cod',
  `payment_status` enum('unpaid','paid','refunded') NOT NULL DEFAULT 'unpaid',
  `order_status` enum('pending','confirmed','shipping','completed','cancelled') NOT NULL DEFAULT 'pending',
  `received_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`id`, `order_code`, `user_id`, `recipient_name`, `recipient_phone`, `shipping_address`, `note`, `subtotal`, `shipping_fee`, `discount`, `total`, `coupon_id`, `coupon_code`, `payment_method`, `payment_status`, `order_status`, `received_at`, `created_at`, `updated_at`) VALUES
(1, 'DTS26102832822D', 2, 'Phùng Tiến Đạt', '0939957116', '107E, Hoàng Hoa Thám , phường 2, Quận 1, Bình Dương', '', 257000.00, 30000.00, 0.00, 287000.00, NULL, NULL, 'cod', 'unpaid', 'pending', NULL, '2026-10-28 15:54:30', '2026-10-28 15:54:30'),
(2, 'DTS261028705CAB', 2, 'Phùng Tiến Đạt', '0939957116', '207 Võ Văn Kiệt, Quận 1, Bình Dương', '', 1122850.00, 0.00, 0.00, 1122850.00, NULL, NULL, 'cod', 'unpaid', 'pending', NULL, '2026-10-28 15:57:06', '2026-10-28 15:57:06'),
(3, 'DTS26102992437C', 2, 'Phùng Tiến Đạt', '0939957116', '107E, Hoàng Hoa Thám , phường 2, Quận 1, Quảng Ninh', '', 1001300.00, 0.00, 0.00, 1001300.00, NULL, NULL, 'cod', 'unpaid', 'shipping', NULL, '2026-10-29 00:40:38', '2026-10-29 09:39:38'),
(4, 'DTS2610296D8870', 2, 'Phùng Tiến Đạt', '0939957116', '107E, Hoàng Hoa Thám, Phường Long Châu, Vĩnh Long', '', 555900.00, 0.00, 55590.00, 500310.00, 1, 'SALE10', 'cod', 'paid', 'completed', '2026-10-29 08:20:59', '2026-10-29 00:52:19', '2026-10-29 01:20:59'),
(5, 'DTS261029CB9AA9', 2, 'Phùng Tiến Đạt', '0939957116', '107E, Hoàng Hoa Thám, Phường Long Châu, Vĩnh Long', '', 277950.00, 30000.00, 27795.00, 280155.00, 1, 'SALE10', 'cod', 'paid', 'completed', '2026-10-30 07:48:11', '2026-10-29 06:49:41', '2026-10-30 14:48:11'),
(6, 'DTS261029610C0C', 3, 'Trần Phước Nguyên', '0394399167', 'cây xăng số 17, Phường Long Châu, Vĩnh Long', '', 277950.00, 30000.00, 0.00, 307950.00, NULL, NULL, 'cod', 'paid', 'completed', '2026-10-29 16:14:24', '2026-10-29 09:13:14', '2026-10-29 09:14:24'),
(7, 'DTS2610297D537E', NULL, 'Khách hàng đã xóa', '', 'Thông tin giao hàng đã xóa', NULL, 252450.00, 30000.00, 25245.00, 257205.00, 1, 'SALE10', 'cod', 'paid', 'completed', '2026-10-29 16:27:42', '2026-10-29 09:26:09', '2026-11-03 09:55:11'),
(8, 'DTS261029185D13', 2, 'Phùng Tiến Đạt', '0939957116', '123,Hoàng Hoa Tháng, Long Châu, Vĩnh Long', '', 757650.00, 0.00, 0.00, 757650.00, NULL, NULL, 'cod', 'unpaid', 'pending', NULL, '2026-10-29 09:39:05', '2026-10-29 09:39:05'),
(9, 'DTS261030207A55', 5, 'Minh Thy', '0392231941', 'hahaha, lộc xuân, Đồng Nai', 'hahaha', 753100.00, 0.00, 150000.00, 603100.00, 4, 'THANG11', 'cod', 'paid', 'completed', '2026-10-30 07:38:44', '2026-10-30 14:37:53', '2026-10-30 14:38:44');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_name` varchar(200) NOT NULL,
  `size` varchar(10) NOT NULL DEFAULT 'M',
  `unit_price` decimal(12,2) NOT NULL,
  `quantity` int(10) UNSIGNED NOT NULL,
  `line_total` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `size`, `unit_price`, `quantity`, `line_total`) VALUES
(1, 1, 2, 'Áo Thun Nam Cổ Tròn Tay Xám Đậm', 'XL', 257000.00, 1, 257000.00),
(2, 2, 4, 'Áo Thun Nam Cổ Tròn Đen', 'M', 277950.00, 1, 277950.00),
(3, 2, 8, 'Quần Jeans Ống Suông Xanh Jean Đậm', 'S', 422450.00, 1, 422450.00),
(4, 2, 8, 'Quần Jeans Ống Suông Xanh Jean Đậm', 'M', 422450.00, 1, 422450.00),
(5, 3, 7, 'Quần Jeans Ống Loe Xanh Jean Nhạt', 'S', 500650.00, 2, 1001300.00),
(6, 4, 4, 'Áo Thun Nam Cổ Tròn Đen', 'M', 277950.00, 1, 277950.00),
(7, 4, 3, 'Áo Thun Nam Cổ Tròn Be', 'S', 277950.00, 1, 277950.00),
(8, 5, 4, 'Áo Thun Nam Cổ Tròn Đen', 'M', 277950.00, 1, 277950.00),
(9, 6, 3, 'Áo Thun Nam Cổ Tròn Be', 'XL', 277950.00, 1, 277950.00),
(10, 7, 1, 'Áo Thun Nam Cổ Tròn Nâu Đậm', 'XL', 252450.00, 1, 252450.00),
(11, 8, 2, 'Áo Thun Nam Cổ Tròn Tay Xám Đậm', 'M', 257000.00, 1, 257000.00),
(12, 8, 7, 'Quần Jeans Ống Loe Xanh Jean Nhạt', 'S', 500650.00, 1, 500650.00),
(13, 9, 1, 'Áo Thun Nam Cổ Tròn Nâu Đậm', 'XL', 252450.00, 1, 252450.00),
(14, 9, 7, 'Quần Jeans Ống Loe Xanh Jean Nhạt', 'S', 500650.00, 1, 500650.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `slug` varchar(220) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `sale_price` decimal(12,2) DEFAULT NULL,
  `stock_s` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `stock_m` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `stock_xl` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `image` varchar(500) DEFAULT NULL,
  `status` enum('active','hidden','out_of_stock') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `category_id`, `name`, `slug`, `description`, `price`, `sale_price`, `stock_s`, `stock_m`, `stock_xl`, `image`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'Áo Thun Nam Cổ Tròn Nâu Đậm', 'ao-thun-c-tr-on-n-au-dm-095d5', '- Thoáng mát, thoát ẩm nhanh\r\n- Đàn hồi & Giữ dáng\r\n- Tôn dáng nam tính\r\n- Phong cách năng động', 297000.00, 252450.00, 0, 0, 0, 'uploads/products/4802cf9a372cc01ade8b649b394e6920.png', 'active', '2026-10-28 14:52:25', '2026-10-30 14:37:53'),
(2, 1, 'Áo Thun Nam Cổ Tròn Tay Xám Đậm', 'ao-thun-nam-c-tr-on-tay-x-am-dm-cb8c9', '- Thoáng mát, thoát ẩm nhanh\r\n- Đàn hồi & Giữ dáng\r\n- Tôn dáng nam tính\r\n- Phong cách năng động', 257000.00, NULL, 0, 0, 0, 'uploads/products/622aa676c675abf47c094025540c0130.png', 'active', '2026-10-28 14:58:34', '2026-10-29 09:39:05'),
(3, 1, 'Áo Thun Nam Cổ Tròn Be', 'ao-thun-nam-c-tr-on-be-ed608', '', 327000.00, 277950.00, 0, 2, 0, 'uploads/products/62f004359c6a480e3b4066b12278a139.png', 'active', '2026-10-28 15:00:26', '2026-10-29 09:13:14'),
(4, 1, 'Áo Thun Nam Cổ Tròn Đen', 'ao-thun-nam-c-tr-on-den-597a2', '', 327000.00, 277950.00, 0, 0, 0, 'uploads/products/39238385a0947145305938445e58ddd4.png', 'active', '2026-10-28 15:01:38', '2026-10-29 06:49:41'),
(5, 1, 'Áo Thun Nữ Cổ Tròn Xanh Biển Trắng', 'ao-thun-n-c-tr-on-xanh-bin-trng-72607', '', 520000.00, NULL, 0, 3, 0, 'uploads/products/067a5f4054b5a7fb84048668d5fad51c.png', 'active', '2026-10-28 15:07:41', '2026-10-28 15:07:41'),
(6, 1, 'Áo Thun Nữ Cổ Tròn Trắng', 'ao-thun-n-c-tr-on-trng-009e2', '', 600000.00, 300000.00, 0, 2, 0, 'uploads/products/63c0e2ef3ddb278948c1282f01365ac5.png', 'active', '2026-10-28 15:10:58', '2026-10-28 15:10:58'),
(7, 2, 'Quần Jeans Ống Loe Xanh Jean Nhạt', 'qun-jeans-ng-loe-xanh-jean-nht-eb267', '', 527000.00, 500650.00, 0, 4, 0, 'uploads/products/48f02b197b12aef055fdeb8cd950e089.png', 'active', '2026-10-28 15:18:17', '2026-10-30 14:37:53'),
(8, 2, 'Quần Jeans Ống Suông Xanh Jean Đậm', 'qun-jeans-ng-su-ong-8f392', '', 497000.00, 422450.00, 0, 0, 0, 'uploads/products/d0d8f935ee8a3cc238d2bc6381743b5b.png', 'active', '2026-10-28 15:20:06', '2026-10-28 15:57:06'),
(9, 3, 'Giày NAM - NỮ Chống Trơn Trượt màu Trắng', 'gi-y-sneaker-poschiano-nam-n-ch-ng-tr-n-tr-t-m-u-tr-ng-4ab5a', '', 430000.00, 314000.00, 2, 2, 0, 'uploads/products/059d1b3c82ccf633e6240083a0f201fd.jpg', 'active', '2026-11-01 12:26:45', '2026-11-08 14:31:49'),
(10, 3, 'Giày thể thao nam màu trắng', 'gi-y-th-thao-sneaker-nam-m-u-tr-ng-3df25', '', 550000.00, 399000.00, 0, 3, 0, 'uploads/products/9c9a13512d2052666308403762d7d31a.jpg', 'active', '2026-11-01 12:31:19', '2026-11-08 14:32:10'),
(11, 3, 'Giày thể thao nam Mulgati', 'gi-y-th-thao-nam-mulgati-7f961', '', 399000.00, 250000.00, 0, 3, 0, 'uploads/products/fb6be8c36358e80bce656cccfd71e51b.jpg', 'active', '2026-11-02 08:51:41', '2026-11-08 14:32:45'),
(12, 3, 'Giày thể thao nam Cartelo cá tính - Đen', 'gi-y-th-thao-nam-cartelo-c-t-nh-en-4e234', '', 479000.00, 400000.00, 0, 5, 0, 'uploads/products/fe2a699e3fc0b5114ae8c74342fc21b6.jpg', 'active', '2026-11-02 08:55:21', '2026-11-08 14:32:24'),
(13, 4, 'Túi Xách Nữ Nhỏ Top Handle Phối Charm', 't-i-x-ch-n-nh-top-handle-ph-i-charm-b1085', '', 849000.00, NULL, 0, 10, 0, 'uploads/products/16151a92538b78ebf30cba1b887ae5e5.jpg', 'active', '2026-11-05 14:10:06', '2026-11-05 14:10:06'),
(14, 4, 'Túi Xách Nữ Hộp Ô Trám Phối Charm Nơ Đỏ', 't-i-x-ch-n-h-p-tr-m-ph-i-charm-n-7adf5', '', 485000.00, NULL, 0, 10, 0, 'uploads/products/fdf3085f467297015ed5177b2fd3cfa0.jpg', 'active', '2026-11-05 14:10:59', '2026-11-05 14:10:59'),
(15, 4, 'Túi Xách Nữ Hộp Da Hạt Phối Nắp Gập Nâu', 't-i-x-ch-n-h-p-da-h-t-ph-i-n-p-g-p-n-u-02ac9', '', 475000.00, NULL, 0, 6, 0, 'uploads/products/0525544a88fd4bcd7dde3b47084aedd4.jpg', 'active', '2026-11-05 14:11:36', '2026-11-05 14:13:16'),
(16, 4, 'Túi Xách Nữ Công Sở Da PU Khóa Vàng Thanh Lịch', 't-i-x-ch-n-c-ng-s-da-pu-kh-a-v-ng-thanh-l-ch-3cde9', '', 119000.00, NULL, 0, 5, 0, 'uploads/products/7df5ef466379bfb3934d8ddbeb584bf5.jpg', 'active', '2026-11-05 14:12:42', '2026-11-05 14:12:42'),
(17, 4, 'Túi xách Nữ hình thang Shania', 't-i-x-ch-n-h-nh-thang-shania-8c9ba', '', 2690000.00, NULL, 0, 4, 0, 'uploads/products/909647552ab07f97a81b52ef0ff4985d.jpg', 'active', '2026-11-05 14:14:51', '2026-11-05 14:15:37'),
(18, 4, 'Túi Xách Nữ Stand Oil Hippo Bag #White', 't-i-x-ch-n-stand-oil-hippo-bag-white-b659e', '', 2115000.00, NULL, 0, 3, 0, 'uploads/products/762bc92dc49a5681fb75d405708ae165.jpg', 'active', '2026-11-05 14:15:30', '2026-11-08 14:37:27'),
(19, 4, 'Túi Xách Nữ Nhỏ Đeo Vai Phối Xích', 't-i-x-ch-n-nh-eo-vai-ph-i-x-ch-900bf', '', 899000.00, NULL, 0, 12, 0, 'uploads/products/5f620bde9af5bcd5a01e26b2d2a17a6f.jpg', 'active', '2026-11-05 14:16:24', '2026-11-08 14:37:16'),
(20, 5, 'Lắc tay bạc nữ lập phương đính đá tím thủy chung đẹp', 'l-c-tay-b-c-n-l-p-ph-ng-nh-t-m-th-y-chung-p-8c2fe', '', 519000.00, NULL, 0, 15, 0, 'uploads/products/ead88f9c3c211b8b4efd2ee321f61427.jpg', 'active', '2026-11-05 14:31:22', '2026-11-08 14:37:03'),
(21, 5, 'Lắc tay nữ bạc khắc tên theo yêu cầu', 'l-c-tay-n-b-c-kh-c-t-n-theo-y-u-c-u-91f5a', '', 319000.00, NULL, 0, 20, 0, 'uploads/products/9d32ca908fb2d455e3ca774c9c46793e.jpg', 'active', '2026-11-05 14:32:46', '2026-11-08 14:36:54'),
(22, 5, 'Dây Chuyền Nữ Giọt Nước Vàng', 'd-y-chuy-n-n-gi-t-n-c-v-ng-a5323', '', 3000000.00, NULL, 0, 3, 0, 'uploads/products/71d74fff6bd7a53f08ca4cdd09209499.jpg', 'active', '2026-11-05 14:33:33', '2026-11-08 14:36:10'),
(23, 5, 'Lược Cài Tóc Nữ Phồng Nơ Tiểu Thư Hàn Quốc', 'l-c-c-i-t-c-n-ph-ng-n-ti-u-th-h-n-qu-c-2895e', '', 20000.00, NULL, 0, 25, 0, 'uploads/products/df1227797ee7271601cb7458284239b8.jpg', 'active', '2026-11-05 14:34:34', '2026-11-08 14:35:57'),
(24, 5, 'Cài tóc Nữ băng đô chất xốp bản lớn màu trắng nâu sữa phong cách đơn giản', 'c-i-t-c-n-b-ng-ch-t-x-p-b-n-l-n-m-u-tr-ng-n-u-s-a-phong-c-ch-n-gi-n-b9d06', '', 25000.00, NULL, 0, 22, 0, 'uploads/products/e65835eca5677c94b759435521c57e03.jpg', 'active', '2026-11-05 14:35:24', '2026-11-08 14:35:47'),
(25, 5, 'Kính Mát Nam Nữ Đen / Đen bóng', 'k-nh-m-t-nam-n-en-en-b-ng-dc952', '', 27000.00, NULL, 0, 30, 0, 'uploads/products/622c72cec9edcab06eccf6d321016059.jpg', 'active', '2026-11-05 14:36:33', '2026-11-08 14:35:23'),
(26, 5, 'Đồng Hồ Nữ JA-925E Julius Hàn Quốc Dây Da', 'ng-h-n-ja-925e-julius-h-n-qu-c-d-y-da-87cb3', '', 789000.00, NULL, 0, 10, 0, 'uploads/products/77ef34dda1a78029ba259eb547330a7e.jpg', 'active', '2026-11-05 14:37:08', '2026-11-08 14:35:05'),
(27, 5, 'Ví Nam ngắn Retro', 'v-nam-ng-n-retro-7af47', '', 300000.00, 250000.00, 0, 9, 0, 'uploads/products/a5c47fac96b53b40c5ee6f23e5e1f933.jpg', 'active', '2026-11-05 14:38:19', '2026-11-08 14:34:52'),
(28, 1, 'Áo Polo Nam Nữ', 'o-polo-nam-n-6a18b', '', 219000.00, 140000.00, 0, 24, 0, 'uploads/products/ac459020f96793d9fdaf925ab458f23c.jpg', 'active', '2026-11-05 14:38:58', '2026-11-08 14:34:41'),
(29, 3, 'Giày Sneaker Nam', 'gi-y-sneaker-nam-5be68', '', 289000.00, 183000.00, 0, 26, 0, 'uploads/products/50e19ef26499e33225e8e3e4000bd797.jpg', 'active', '2026-11-05 14:39:43', '2026-11-08 14:34:29'),
(30, 5, 'Đồng hồ nam dây da PABLO RAEZ', 'ng-h-nam-d-y-da-pablo-raez-ba5d9', '', 450000.00, 263000.00, 0, 10, 0, 'uploads/products/7c0de5da7c0f73739ca8f629362e08c3.jpg', 'active', '2026-11-05 14:40:17', '2026-11-08 14:34:20'),
(31, 1, 'Áo sơ mi nam nữ tay dài', 'o-s-mi-nam-n-tay-d-i-75422', '', 300000.00, 206000.00, 0, 32, 0, 'uploads/products/c9760fe671fc833329e0c9c45341db6b.jpg', 'active', '2026-11-05 14:41:15', '2026-11-05 14:41:15'),
(33, 2, 'Quần Kaki nam Baggy', 'qu-n-kaki-nam-baggy-8d771', '', 195000.00, 178000.00, 0, 20, 0, 'uploads/products/a2812c533f5ec54a47c183a84a41637b.jpg', 'active', '2026-11-05 14:42:10', '2026-11-08 14:33:38'),
(34, 2, 'Quần Jean Nam', 'qu-n-jean-nam-3c37b', '', 300000.00, 209000.00, 0, 30, 0, 'uploads/products/2cae45a8aff5d0b317ec5768a17446d1.jpg', 'active', '2026-11-05 14:42:48', '2026-11-08 14:33:31'),
(35, 1, 'Áo thun nam nữ tay ngắn', 'o-thun-nam-n-tay-ng-n-6ad8a', '', 150000.00, NULL, 0, 26, 0, 'uploads/products/abdf0fadb1e350382c6517f60cad3843.jpg', 'active', '2026-11-05 14:44:04', '2026-11-08 14:33:23');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `full_name` varchar(120) NOT NULL,
  `email` varchar(190) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `status` enum('active','locked','pending') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `phone`, `password_hash`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Quản trị viên', '24004279@st.vlute.edu.vn', NULL, '$2y$10$m9JNGeogo58HWWDFC10AC.6mAng7IXVr.L6kh.ufdtmIbUJyMOUs6', 'admin', 'active', '2026-10-28 14:49:46', '2026-10-28 14:49:46'),
(2, 'Phùng Tiến Đạt', 'tiendat30112004@gmail.com', '0939957116', '$2y$10$bgEwMJutKl3lpHympxwatOuYhxqe2J6GTnzi.JOo/soLYXUV6C3C2', 'user', 'active', '2026-10-28 14:53:08', '2026-10-29 00:56:06'),
(3, 'Trần Phước Nguyên', '24004268@st.vlute.edu.vn', '0394399167', '$2y$10$SzsSqIlmlStPoJ6pYapOFuSJBQb6AmD0VXNdp/Hj/XMIq1dgtIcTG', 'user', 'active', '2026-10-29 09:10:53', '2026-10-29 09:11:20'),
(5, 'Minh Thy', 'pncmt@gmail.com', '0392231941', '$2y$12$MWenJf8ZLgCaorhOXhsJh.vmvQzC2chW986e.Y0n9KWB/CDeF//Km', 'user', 'active', '2026-10-30 14:34:20', '2026-10-30 14:34:20');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_cart_user_product_size` (`user_id`,`product_id`,`size`),
  ADD KEY `fk_cart_product` (`product_id`);

--
-- Chỉ mục cho bảng `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Chỉ mục cho bảng `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_coupons_status` (`status`);

--
-- Chỉ mục cho bảng `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_code` (`order_code`),
  ADD KEY `fk_orders_coupon` (`coupon_id`),
  ADD KEY `idx_orders_user` (`user_id`),
  ADD KEY `idx_orders_status` (`order_status`);

--
-- Chỉ mục cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_order_items_order` (`order_id`),
  ADD KEY `fk_order_items_product` (`product_id`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_products_category` (`category_id`),
  ADD KEY `idx_products_status` (`status`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT cho bảng `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `fk_cart_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
