// PHIEN BAN DE HOC: Ten ham chinh duoc viet bang tieng Viet khong dau de de nho.
// Cach doc: doc tu tren xuong; moi ham xu ly mot cong viec.
/**
 * DANH_SACH_SAN_PHAM DATA & REPOSITORY
 * Danh sách sản phẩm mẫu cho website Thời trang DatNguyenThucShop
 */

const DANH_SACH_SAN_PHAM = [
    // --- QUẦN ÁO NAM ---
    {
        id: 1,
        name: "Áo Polo Nam Pique Phối Bo Cổ",
        category: "ao",
        gender: "nam",
        price: 349000,
        oldPrice: 499000,
        image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Trắng", hex: "#FFFFFF" },
            { name: "Đen", hex: "#111111" },
            { name: "Xanh Navy", hex: "#1B2A4A" }
        ],
        sizes: ["M", "L", "XL", "XXL"],
        rating: 4.9,
        reviews: 142,
        badge: "SALE",
        isFeatured: true,
        isNew: false,
        isBestSeller: true,
        description: "Áo polo nam chất liệu vải cá sấu Pique cao cấp mềm mịn, thấm hút mồ hôi tối đa, mang lại cảm giác thoáng mát cả ngày. Thiết kế phối viền cổ tinh tế, phom dáng Regular Fit tôn dáng hiện đại.",
        details: "Chất liệu 95% Cotton Compact, 5% Spandex co giãn 4 chiều. Bo dệt kim cao cấp không bai nhão sau khi giặt.",
        material: "Cotton Pique cao cấp",
        stock: 35
    },
    {
        id: 2,
        name: "Áo Sơ Mi Oxford Nam Dáng Suông",
        category: "ao",
        gender: "nam",
        price: 450000,
        oldPrice: 590000,
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Xanh Nhạt", hex: "#A8C0D8" },
            { name: "Trắng Sữa", hex: "#F5F5F0" },
            { name: "Hồng Pastel", hex: "#F3C5C5" }
        ],
        sizes: ["S", "M", "L", "XL"],
        rating: 4.8,
        reviews: 98,
        badge: "NEW",
        isFeatured: true,
        isNew: true,
        isBestSeller: false,
        description: "Chiếc áo sơ mi Oxford kinh điển không thể thiếu trong tủ đồ của phái mạnh. Bề mặt vải dệt nổi đặc trưng, đứng phom và ít nhăn, phù hợp cho cả đi làm và dạo phố cuối tuần.",
        details: "Vải dệt Oxford 100% sợi bông tự nhiên đã qua xử lý giặt làm mềm. Khuy khắc laser tinh xảo.",
        material: "100% Oxford Cotton",
        stock: 24
    },
    {
        id: 3,
        name: "Áo Blazer Nam Single-Breasted Hiện Đại",
        category: "ao",
        gender: "nam",
        price: 1190000,
        oldPrice: 1550000,
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Xám Than", hex: "#333333" },
            { name: "Be Cát", hex: "#D2B48C" },
            { name: "Đen Tuyền", hex: "#111111" }
        ],
        sizes: ["M", "L", "XL"],
        rating: 5.0,
        reviews: 67,
        badge: "HOT",
        isFeatured: true,
        isNew: true,
        isBestSeller: true,
        description: "Áo Blazer thiết kế 2 nút dáng hiện đại, đệm vai mỏng tạo đường nét tự nhiên, phóng khoáng nhưng vẫn giữ trọn vẻ lịch lãm của quý ông hiện đại.",
        details: "Vải tuyết mưa pha sợi Wool tổng hợp, lót lụa habutai êm ái thoáng khí. Có 2 túi nắp và túi ngực bên trong tiện dụng.",
        material: "Wool Blend & Poly viscose",
        stock: 15
    },
    {
        id: 4,
        name: "Quần Âu Nam Slim-Fit Xếp Ly Tinh Tế",
        category: "quan",
        gender: "nam",
        price: 489000,
        oldPrice: 650000,
        image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Đen", hex: "#1A1A1A" },
            { name: "Ghi Xám", hex: "#6E727A" },
            { name: "Nâu Mocha", hex: "#4A3B32" }
        ],
        sizes: ["29", "30", "31", "32", "33"],
        rating: 4.7,
        reviews: 83,
        badge: "SALE",
        isFeatured: false,
        isNew: false,
        isBestSeller: true,
        description: "Quần âu may đo chuẩn phom với nếp ly trước sắc nét, cạp lưng có chun mở rộng thông minh giúp người mặc thoải mái vận động suốt 8 tiếng công sở.",
        details: "Vải dệt chéo chống nhăn, giữ nếp ly bền lâu sau nhiều lần giặt. Khóa kéo YKK đồng bền bỉ.",
        material: "70% Rayon, 27% Poly, 3% Spandex",
        stock: 40
    },
    {
        id: 5,
        name: "Quần Jean Nam Cổ Điển Straight-Leg",
        category: "quan",
        gender: "nam",
        price: 590000,
        oldPrice: 790000,
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Xanh Indigo", hex: "#2A3D66" },
            { name: "Xanh Nhạt Wash", hex: "#6C8CB7" }
        ],
        sizes: ["29", "30", "31", "32", "34"],
        rating: 4.8,
        reviews: 110,
        badge: null,
        isFeatured: false,
        isNew: true,
        isBestSeller: true,
        description: "Quần denim ống đứng kinh điển lấy cảm hứng từ thập niên 90. Chất vải denim 13oz dày dặn nhưng êm ái, màu wash tự nhiên đẹp mắt.",
        details: "100% Selvedge Cotton Denim, đinh tán đồng gia cố các điểm chịu lực.",
        material: "100% Cotton Denim",
        stock: 28
    },

    // --- QUẦN ÁO NỮ ---
    {
        id: 6,
        name: "Đầm Lụa Satin Cổ Đổ Quyến Rũ",
        category: "vay",
        gender: "nu",
        price: 790000,
        oldPrice: 1150000,
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Xanh Emerald", hex: "#0E4D41" },
            { name: "Đỏ Rượu Vang", hex: "#6B1D2F" },
            { name: "Vàng Champagne", hex: "#EAD6B8" }
        ],
        sizes: ["XS", "S", "M", "L"],
        rating: 4.9,
        reviews: 215,
        badge: "HOT",
        isFeatured: true,
        isNew: false,
        isBestSeller: true,
        description: "Mẫu đầm hai dây cổ đổ kinh điển làm từ chất liệu lụa Satin cao cấp bóng nhẹ sang trọng. Dáng suông rũ nhẹ tôn lên đường cong tự nhiên và nét quý phái của phái đẹp trong mọi bữa tiệc.",
        details: "Dây quai mảnh có tăng đơ điều chỉnh độ dài. Cắt may xéo thớ vải (bias-cut) tạo độ rủ mềm mại hoàn hảo.",
        material: "Lụa Satin Cao Cấp",
        stock: 20
    },
    {
        id: 7,
        name: "Áo Kiểu Voan Hoa Nữ Tay Phồng",
        category: "ao",
        gender: "nu",
        price: 389000,
        oldPrice: 520000,
        image: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1534126511673-b6899657816a?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Trắng Hoa Nhí", hex: "#FDF8F5" },
            { name: "Tím Lavender", hex: "#BFA5D6" }
        ],
        sizes: ["S", "M", "L"],
        rating: 4.8,
        reviews: 79,
        badge: "NEW",
        isFeatured: true,
        isNew: true,
        isBestSeller: false,
        description: "Chiếc áo kiểu nữ tính dịu dàng với chi tiết tay bồng xếp nếp cổ điển và họa tiết hoa nhí phong cách Pháp thơ mộng. Dễ dàng mix-match cùng chân váy chữ A hoặc quần jeans.",
        details: "Chất voan tơ cát mềm mịn kèm lớp lót trong kín đáo, không lo lộ nội y.",
        material: "Chiffon tơ tằm nhân tạo",
        stock: 32
    },
    {
        id: 8,
        name: "Chân Váy Xếp Ly Dài Midi Thời Thượng",
        category: "vay",
        gender: "nu",
        price: 469000,
        oldPrice: 620000,
        image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1577900232427-18219b9166a0?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Be Nude", hex: "#E3D3C4" },
            { name: "Đen", hex: "#111111" },
            { name: "Xanh Cốm", hex: "#8FBC8F" }
        ],
        sizes: ["S", "M", "L"],
        rating: 4.7,
        reviews: 95,
        badge: "SALE",
        isFeatured: false,
        isNew: false,
        isBestSeller: true,
        description: "Chân váy dập ly nhỏ đều tăm tắp bằng công nghệ nhiệt hiện đại, giữ form bền bỉ sau nhiều lần giặt. Chiều dài qua gối thanh lịch, uyển chuyển trong từng bước đi.",
        details: "Lưng thun co giãn êm ái, lớp lót lụa mềm mại bên trong.",
        material: "Tuyết mưa dập ly cao cấp",
        stock: 45
    },
    {
        id: 9,
        name: "Quần Ống Rộng Nữ Cạp Cao Tôn Dáng",
        category: "quan",
        gender: "nu",
        price: 499000,
        oldPrice: 680000,
        image: "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Trắng Kem", hex: "#F3EDE2" },
            { name: "Nâu Tây", hex: "#8A5A36" },
            { name: "Đen", hex: "#1A1A1A" }
        ],
        sizes: ["S", "M", "L", "XL"],
        rating: 4.9,
        reviews: 168,
        badge: "HOT",
        isFeatured: true,
        isNew: false,
        isBestSeller: true,
        description: "Chiếc quần ống suông 'hack dáng' đỉnh cao dành cho mọi cô gái. Cạp cao ôm trọn eo thon kết hợp ống rộng buông rủ tạo hiệu ứng chân dài miên man.",
        details: "Chất vải chéo Hàn có độ rủ cực tốt, không xù lông và hạn chế bám bụi.",
        material: "Vải dệt chéo Hàn Quốc",
        stock: 50
    },
    {
        id: 10,
        name: "Áo Blazer Nữ Dáng Rộng Phong Cách Hàn Quốc",
        category: "ao",
        gender: "nu",
        price: 890000,
        oldPrice: 1250000,
        image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Be Sữa", hex: "#E8DFD0" },
            { name: "Nâu Rêu", hex: "#5C5843" },
            { name: "Đen Basic", hex: "#111111" }
        ],
        sizes: ["S", "M", "L"],
        rating: 5.0,
        reviews: 134,
        badge: "NEW",
        isFeatured: true,
        isNew: true,
        isBestSeller: false,
        description: "Blazer nữ phong cách minimalist hiện đại. Cầu vai định hình vừa vặn, form suông cá tính đem lại vẻ ngoài phóng khoáng, tự tin cho các nàng năng động.",
        details: "Lót trong 2 lớp cao cấp, túi áo may chìm tiện lợi, khuy sừng đúc nguyên khối.",
        material: "Kaki tuyết mưa pha sợi tự nhiên",
        stock: 22
    },

    // --- GIÀY DÉP ---
    {
        id: 11,
        name: "Giày Sneaker Da Minimalist Trắng Unisex",
        category: "giay",
        gender: "unisex",
        price: 890000,
        oldPrice: 1200000,
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Trắng Tinh Khôi", hex: "#FFFFFF" },
            { name: "Trắng Gót Đen", hex: "#E8E8E8" }
        ],
        sizes: ["36", "37", "38", "39", "40", "41", "42", "43"],
        rating: 4.9,
        reviews: 312,
        badge: "HOT",
        isFeatured: true,
        isNew: false,
        isBestSeller: true,
        description: "Đôi sneaker da trắng tối giản kinh điển, biểu tượng của sự thanh lịch và trẻ trung. Dễ dàng kết hợp với mọi trang phục từ quần âu, jeans đến váy đầm.",
        details: "Thân giày da bò Nappa mịn cao cấp chống trầy xước, đế cao su đúc nguyên khối êm ái chống trơn trượt.",
        material: "Da bò Nappa cao cấp",
        stock: 65
    },
    {
        id: 12,
        name: "Giày Loafer Nam Da Bóng Khóa Kim Loại",
        category: "giay",
        gender: "nam",
        price: 1150000,
        oldPrice: 1600000,
        image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Đen Bóng", hex: "#111111" },
            { name: "Nâu Socola", hex: "#382218" }
        ],
        sizes: ["39", "40", "41", "42", "43"],
        rating: 4.8,
        reviews: 94,
        badge: "NEW",
        isFeatured: false,
        isNew: true,
        isBestSeller: false,
        description: "Giày lười Penny Loafer da bò bóng sang trọng, điểm xuyết thanh kim loại mạ vàng đồng tinh tế trên mui giày. Phù hợp cho quý ông công sở và các sự kiện trang trọng.",
        details: "Lót trong da cừu khử mùi êm ái, đế khâu tay Goodyear Welted siêu bền chắc.",
        material: "Da bò phủ bóng cao cấp",
        stock: 18
    },
    {
        id: 13,
        name: "Giày Cao Gót Nữ Mũi Nhọn Satin 7cm",
        category: "giay",
        gender: "nu",
        price: 690000,
        oldPrice: 950000,
        image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Đen Nhũ", hex: "#1A1A1A" },
            { name: "Nude Ánh Kim", hex: "#DEB887" },
            { name: "Đỏ Rượu", hex: "#800020" }
        ],
        sizes: ["35", "36", "37", "38", "39"],
        rating: 4.9,
        reviews: 156,
        badge: "SALE",
        isFeatured: true,
        isNew: false,
        isBestSeller: true,
        description: "Đôi cao gót kinh điển cao 7cm giúp tôn dáng đôi chân thon dài nhưng vẫn đảm bảo độ cân bằng tối ưu. Đệm lót mút cao su non êm chân suốt cả ngày dự tiệc.",
        details: "Mũi nhọn thanh thoát, đế gót kim loại chắc chắn bọc cao su chống trơn.",
        material: "Satin dệt cao cấp & Da lót trong",
        stock: 25
    },
    {
        id: 14,
        name: "Giày Chelsea Boots Da Lộn Cổ Lửng",
        category: "giay",
        gender: "unisex",
        price: 1290000,
        oldPrice: 1750000,
        image: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Nâu Da Bò", hex: "#7E481C" },
            { name: "Xám Khói", hex: "#555555" }
        ],
        sizes: ["39", "40", "41", "42", "43"],
        rating: 4.8,
        reviews: 73,
        badge: "NEW",
        isFeatured: false,
        isNew: true,
        isBestSeller: false,
        description: "Chelsea Boots phong cách Anh Quốc với chất da lộn mềm mại, bo thun hai bên hông co giãn giúp xỏ giày dễ dàng mà vẫn ôm khít cổ chân.",
        details: "Đế cao su nhiệt dẻo tăng độ bám, kháng nước nhẹ thích hợp cho thời tiết giao mùa.",
        material: "Da lộn tự nhiên (Suede Leather)",
        stock: 19
    },

    // --- TÚI XÁCH ---
    {
        id: 15,
        name: "Túi Xách Nữ Mini Da Quả Trám Khóa Vàng",
        category: "tui",
        gender: "nu",
        price: 650000,
        oldPrice: 890000,
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Đen Tinh Tế", hex: "#111111" },
            { name: "Trắng Ngà", hex: "#FDF5E6" },
            { name: "Xanh Bơ", hex: "#A8B490" }
        ],
        sizes: ["Freesize (20x13x7 cm)"],
        rating: 4.9,
        reviews: 230,
        badge: "HOT",
        isFeatured: true,
        isNew: false,
        isBestSeller: true,
        description: "Mẫu túi xách đeo chéo nhỏ gọn với họa tiết chần chỉ quả trám sang chảnh. Dây xích luồn da kim loại vàng kim chống rỉ mang lại vẻ ngoài kiêu kỳ.",
        details: "Bên trong có ngăn chính rộng rãi để vừa điện thoại pro max cùng 2 ngăn phụ đựng thẻ tiền.",
        material: "Da PU vân vi sợi cao cấp",
        stock: 40
    },
    {
        id: 16,
        name: "Túi Tote Da Đựng Laptop Công Sở Cao Cấp",
        category: "tui",
        gender: "unisex",
        price: 790000,
        oldPrice: 1100000,
        image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Nâu Da Bò", hex: "#8A492D" },
            { name: "Đen", hex: "#1A1A1A" },
            { name: "Ghi Xám", hex: "#5C6166" }
        ],
        sizes: ["Freesize (38x30x12 cm)"],
        rating: 4.8,
        reviews: 188,
        badge: "SALE",
        isFeatured: false,
        isNew: false,
        isBestSeller: true,
        description: "Chiếc túi tote da tối giản thanh lịch chứa vừa laptop 14-15 inch và tài liệu A4. Quai đeo chịu lực chắc chắn, mềm êm không gây đau vai khi mang lâu.",
        details: "Miệng túi có khóa kéo zip kín đáo an toàn, ngăn đệm lót chống sốc cho thiết bị điện tử.",
        material: "Da tổng hợp Microfiber chống xước",
        stock: 30
    },
    {
        id: 17,
        name: "Balo Thời Trang Chống Thấm Nước Minimalist",
        category: "tui",
        gender: "unisex",
        price: 590000,
        oldPrice: 850000,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Xám Đen", hex: "#222222" },
            { name: "Xanh Rêu", hex: "#3A4D39" }
        ],
        sizes: ["Freesize (42x29x14 cm)"],
        rating: 4.7,
        reviews: 62,
        badge: "NEW",
        isFeatured: false,
        isNew: true,
        isBestSeller: false,
        description: "Balo phong cách thành thị gọn nhẹ, chống nước mưa tuyệt đối. Ngăn chứa bố trí khoa học, quai đeo đệm lưới thoáng khí giảm áp lực cột sống.",
        details: "Có cổng cáp sạc USB ngoài tiện lợi và dây đai cài vali khi đi du lịch.",
        material: "Vải Oxford 900D tráng phủ TPU chống nước",
        stock: 25
    },

    // --- MŨ ---
    {
        id: 18,
        name: "Mũ Lưỡi Trai Vintage Thêu Chữ Nổi",
        category: "mu",
        gender: "unisex",
        price: 189000,
        oldPrice: 250000,
        image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Be Vintage", hex: "#D6C7A1" },
            { name: "Đen Cháy", hex: "#2B2B2B" },
            { name: "Xanh Rêu Rửa", hex: "#4A5240" }
        ],
        sizes: ["Freesize (Có khóa chỉnh)"],
        rating: 4.8,
        reviews: 140,
        badge: "HOT",
        isFeatured: false,
        isNew: false,
        isBestSeller: true,
        description: "Mũ lưỡi trai washed phong cách retro cổ điển, form mũ ôm đầu mềm mại. Chữ thêu nổi tinh tế, khóa gài kim loại điều chỉnh vừa vặn mọi cỡ đầu.",
        details: "Chất liệu 100% Cotton Twill đã qua xử lý wash mềm mại, thoáng mát.",
        material: "100% Cotton Washed",
        stock: 60
    },
    {
        id: 19,
        name: "Mũ Bucket Vành Tròn Canvas Hai Mặt",
        category: "mu",
        gender: "unisex",
        price: 210000,
        oldPrice: 290000,
        image: "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Đen / Kẻ Caro", hex: "#111111" },
            { name: "Kem / Vàng Mù Tạt", hex: "#EAD6B8" }
        ],
        sizes: ["Freesize"],
        rating: 4.7,
        reviews: 82,
        badge: "SALE",
        isFeatured: false,
        isNew: true,
        isBestSeller: false,
        description: "Mũ tai bèo vành cụp thời thượng, đội được 2 mặt đảo màu linh hoạt biến tấu phong cách. Vành mũ che nắng tốt thích hợp cho cả dã ngoại và phối đồ dạo phố.",
        details: "Vải canvas dệt dày dặn, dễ gấp gọn bỏ túi mang theo.",
        material: "Canvas Bông Tự Nhiên",
        stock: 35
    },

    // --- PHỤ KIỆN ---
    {
        id: 20,
        name: "Kính Mát Phi Công Gọng Kim Loại Mạ Vàng",
        category: "phukien",
        gender: "unisex",
        price: 450000,
        oldPrice: 650000,
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Mắt Đen Gọng Vàng", hex: "#D4AF37" },
            { name: "Mắt Trà Gọng Bạc", hex: "#C0C0C0" }
        ],
        sizes: ["Freesize"],
        rating: 4.9,
        reviews: 175,
        badge: "HOT",
        isFeatured: true,
        isNew: false,
        isBestSeller: true,
        description: "Kính râm phi công kinh điển với tròng kính phân cực chống lóa Polarized và chống tia UV400 bảo vệ mắt tối đa. Gọng kim loại thanh mảnh, đệm mũi êm ái.",
        details: "Tặng kèm hộp da cao cấp đựng kính và khăn lau microfiber chuyên dụng.",
        material: "Hợp kim Titan & Tròng Polycarbonate UV400",
        stock: 45
    },
    {
        id: 21,
        name: "Thắt Lưng Da Bò Ý Khóa Kim Tự Động",
        category: "phukien",
        gender: "nam",
        price: 390000,
        oldPrice: 550000,
        image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Đen", hex: "#111111" },
            { name: "Nâu Đậm", hex: "#42281D" }
        ],
        sizes: ["110cm", "115cm", "120cm", "125cm"],
        rating: 4.8,
        reviews: 112,
        badge: "SALE",
        isFeatured: false,
        isNew: false,
        isBestSeller: true,
        description: "Thắt lưng nam da bò nguyên tấm nhập khẩu từ Ý, xử lý thuộc thảo mộc bền bỉ không bong tróc gãy gập theo thời gian. Mặt khóa kim loại xước phay chống trầy.",
        details: "Chiều rộng bản 3.5cm chuẩn công sở. Khóa tự động tiện dụng không cần đục lỗ.",
        material: "100% Da bò nguyên tấm (Full Grain Leather)",
        stock: 50
    },
    {
        id: 22,
        name: "Đồng Hồ Tối Giản Mặt Kính Sapphire Unisex",
        category: "phukien",
        gender: "unisex",
        price: 1450000,
        oldPrice: 2100000,
        image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Mặt Trắng Dây Da Nâu", hex: "#7F4F24" },
            { name: "Mặt Đen Dây Lưới Thép", hex: "#222222" }
        ],
        sizes: ["Mặt 38mm", "Mặt 40mm"],
        rating: 5.0,
        reviews: 87,
        badge: "NEW",
        isFeatured: true,
        isNew: true,
        isBestSeller: false,
        description: "Đồng hồ thạch anh thiết kế Scandinavian tối giản tinh xảo. Mặt kính Sapphire nguyên khối chống trầy xước tuyệt đối, chống nước 5ATM an toàn khi đi mưa hay rửa tay.",
        details: "Bộ máy Quartz Miyota Nhật Bản chạy chính xác, dây da bò mềm mại ôm khít cổ tay.",
        material: "Thép không gỉ 316L & Kính Sapphire",
        stock: 12
    },
    {
        id: 23,
        name: "Khăn Lụa Vuông Quàng Cổ Họa Tiết Baroque",
        category: "phukien",
        gender: "nu",
        price: 260000,
        oldPrice: 380000,
        image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Xanh Hoàng Gia", hex: "#1A365D" },
            { name: "Vàng Đồng Họa Tiết", hex: "#C5A880" }
        ],
        sizes: ["Freesize (70x70 cm)"],
        rating: 4.8,
        reviews: 94,
        badge: null,
        isFeatured: false,
        isNew: true,
        isBestSeller: false,
        description: "Chiếc khăn lụa vuông đa năng biến hóa mọi set đồ đơn giản thành diện mạo quý cô đài các. Dùng thắt nơ cổ áo, buộc tóc hoặc quấn quai túi xách tạo điểm nhấn cuốn hút.",
        details: "Lụa tơ nhân tạo mềm trơn, bóng sáng tự nhiên, in nhiệt sắc nét không phai màu.",
        material: "Lụa Habutai cao cấp",
        stock: 30
    },
    {
        id: 24,
        name: "Áo Thun Unisex Cotton 250gsm Dáng Rộng",
        category: "ao",
        gender: "unisex",
        price: 280000,
        oldPrice: 380000,
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80"
        ],
        colors: [
            { name: "Trắng Basic", hex: "#FFFFFF" },
            { name: "Đen", hex: "#111111" },
            { name: "Xám Tiêu", hex: "#8A8D91" }
        ],
        sizes: ["S", "M", "L", "XL", "XXL"],
        rating: 4.9,
        reviews: 420,
        badge: "HOT",
        isFeatured: true,
        isNew: false,
        isBestSeller: true,
        description: "Áo thun trơn oversize chân ái cho phong cách thường nhật. Vải cotton 100% định lượng 250gsm dày dặn đứng phom, không bai dão cổ áo sau khi giặt máy.",
        details: "Cổ áo may bo dệt kim 2.5cm chắc chắn, đường may 2 kim tỉ mỉ chuẩn xuất khẩu.",
        material: "100% Heavyweight Cotton 250gsm",
        stock: 80
    }
];

// Helper functions để truy xuất sản phẩm
function layTatCaSanPham() {
    return DANH_SACH_SAN_PHAM;
}

function laySanPhamTheoMa(id) {
    const numericId = parseInt(id, 10);
    return DANH_SACH_SAN_PHAM.find(p => p.id === numericId) || null;
}

function laySanPhamNoiBat(limit = 8) {
    return DANH_SACH_SAN_PHAM.filter(p => p.isFeatured).slice(0, limit);
}

function laySanPhamMoi(limit = 8) {
    return DANH_SACH_SAN_PHAM.filter(p => p.isNew || p.badge === 'NEW').slice(0, limit);
}

function laySanPhamBanChay(limit = 8) {
    return DANH_SACH_SAN_PHAM.filter(p => p.isBestSeller).slice(0, limit);
}

function laySanPhamLienQuan(productId, limit = 4) {
    const current = laySanPhamTheoMa(productId);
    if (!current) return DANH_SACH_SAN_PHAM.slice(0, limit);
    return DANH_SACH_SAN_PHAM
        .filter(p => p.id !== current.id && (p.category === current.category || p.gender === current.gender))
        .slice(0, limit);
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
    gender: 'all',
    priceRange: 'all',
    minPrice: 0,
    maxPrice: 3000000,
    sizes: [],
    colors: [],
    rating: 0,
    search: '',
    sort: 'newest',
    page: 1,
    pageSize: 8
};

function khoiTaoTrangDanhSachSanPham() {
    const catalogGrid = document.getElementById('catalogProductsGrid');
    if (!catalogGrid) return;

    // Đọc URL parameters ban đầu
    const params = new URLSearchParams(window.location.search);
    if (params.has('category')) catalogState.category = params.get('category').toLowerCase();
    if (params.has('gender')) catalogState.gender = params.get('gender').toLowerCase();
    if (params.has('search')) catalogState.search = params.get('search').toLowerCase();
    if (params.has('sort')) catalogState.sort = params.get('sort');

    caiDatBoLocSanPham();
    apDungBoLoc();
}

function caiDatBoLocSanPham() {
    // Sync category radios / links
    const categoryInputs = document.querySelectorAll('input[name="filterCategory"]');
    categoryInputs.forEach(input => {
        if (input.value.toLowerCase() === catalogState.category) {
            input.checked = true;
        }
        input.addEventListener('change', () => {
            catalogState.category = input.value.toLowerCase();
            catalogState.page = 1;
            apDungBoLoc();
        });
    });

    // Sync gender radios
    const genderInputs = document.querySelectorAll('input[name="filterGender"]');
    genderInputs.forEach(input => {
        if (input.value.toLowerCase() === catalogState.gender) {
            input.checked = true;
        }
        input.addEventListener('change', () => {
            catalogState.gender = input.value.toLowerCase();
            catalogState.page = 1;
            apDungBoLoc();
        });
    });

    // Price ranges
    const priceInputs = document.querySelectorAll('input[name="filterPrice"]');
    priceInputs.forEach(input => {
        input.addEventListener('change', () => {
            catalogState.priceRange = input.value;
            catalogState.page = 1;
            apDungBoLoc();
        });
    });

    // Sizes checkboxes
    const sizeCheckboxes = document.querySelectorAll('input[name="filterSize"]');
    sizeCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const checkedSizes = Array.from(document.querySelectorAll('input[name="filterSize"]:checked')).map(el => el.value);
            catalogState.sizes = checkedSizes;
            catalogState.page = 1;
            apDungBoLoc();
        });
    });

    // Ratings radio
    const ratingInputs = document.querySelectorAll('input[name="filterRating"]');
    ratingInputs.forEach(r => {
        r.addEventListener('change', () => {
            catalogState.rating = parseFloat(r.value) || 0;
            catalogState.page = 1;
            apDungBoLoc();
        });
    });

    // Sort select
    const sortSelect = document.getElementById('catalogSortSelect');
    if (sortSelect) {
        if (catalogState.sort) sortSelect.value = catalogState.sort;
        sortSelect.addEventListener('change', () => {
            catalogState.sort = sortSelect.value;
            catalogState.page = 1;
            apDungBoLoc();
        });
    }

    // Reset filters button
    const resetBtn = document.getElementById('btnResetFilters');
    if (resetBtn) {
        resetBtn.addEventListener('click', datLaiBoLoc);
    }
}

function datLaiBoLoc() {
    catalogState = {
        category: 'all',
        gender: 'all',
        priceRange: 'all',
        minPrice: 0,
        maxPrice: 3000000,
        sizes: [],
        colors: [],
        rating: 0,
        search: '',
        sort: 'newest',
        page: 1,
        pageSize: 8
    };

    // Reset UI inputs
    document.querySelectorAll('input[name="filterCategory"]').forEach(i => i.checked = (i.value === 'all'));
    document.querySelectorAll('input[name="filterGender"]').forEach(i => i.checked = (i.value === 'all'));
    document.querySelectorAll('input[name="filterPrice"]').forEach(i => i.checked = (i.value === 'all'));
    document.querySelectorAll('input[name="filterSize"]').forEach(i => i.checked = false);
    document.querySelectorAll('input[name="filterRating"]').forEach(i => i.checked = (i.value === '0'));
    const sortSelect = document.getElementById('catalogSortSelect');
    if (sortSelect) sortSelect.value = 'newest';

    // Clear search param in URL
    window.history.pushState({}, '', 'products.html');

    apDungBoLoc();
    hienThiThongBaoNho('Đã đặt lại tất cả bộ lọc.', 'info');
}

function apDungBoLoc() {
    let results = [...DANH_SACH_SAN_PHAM];

    // Filter by search keyword
    if (catalogState.search) {
        const q = catalogState.search.toLowerCase();
        results = results.filter(p => 
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.gender.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
        );
    }

    // Filter by category
    if (catalogState.category && catalogState.category !== 'all') {
        results = results.filter(p => p.category.toLowerCase() === catalogState.category);
    }

    // Filter by gender
    if (catalogState.gender && catalogState.gender !== 'all') {
        results = results.filter(p => p.gender.toLowerCase() === catalogState.gender || p.gender === 'unisex');
    }

    // Filter by price range
    if (catalogState.priceRange && catalogState.priceRange !== 'all') {
        switch (catalogState.priceRange) {
            case 'under-300':
                results = results.filter(p => p.price < 300000);
                break;
            case '300-500':
                results = results.filter(p => p.price >= 300000 && p.price <= 500000);
                break;
            case '500-1000':
                results = results.filter(p => p.price > 500000 && p.price <= 1000000);
                break;
            case 'over-1000':
                results = results.filter(p => p.price > 1000000);
                break;
        }
    }

    // Filter by sizes
    if (catalogState.sizes.length > 0) {
        results = results.filter(p => p.sizes.some(s => catalogState.sizes.includes(s)));
    }

    // Filter by rating
    if (catalogState.rating > 0) {
        results = results.filter(p => p.rating >= catalogState.rating);
    }

    // Sorting
    switch (catalogState.sort) {
        case 'price-asc':
            results.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            results.sort((a, b) => b.price - a.price);
            break;
        case 'bestseller':
            results.sort((a, b) => b.reviews - a.reviews);
            break;
        case 'rating-desc':
            results.sort((a, b) => b.rating - a.rating);
            break;
        case 'newest':
        default:
            results.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.id - a.id);
            break;
    }

    hienThiKetQuaSanPham(results);
}

function hienThiKetQuaSanPham(results) {
    const grid = document.getElementById('catalogProductsGrid');
    const resultCountEl = document.getElementById('catalogResultsCount');
    const paginationEl = document.getElementById('catalogPagination');
    const activeTagsEl = document.getElementById('catalogActiveTags');

    if (!grid) return;

    if (resultCountEl) {
        resultCountEl.innerHTML = `Hiển thị <strong>${results.length}</strong> sản phẩm`;
    }

    // Render active filter badges
    if (activeTagsEl) {
        let tagsHtml = '';
        if (catalogState.search) {
            tagsHtml += `<span class="the-bo-loc">Tìm kiếm: "${catalogState.search}" <i class="fa-solid fa-xmark xoa-the-bo-loc" onclick="xoaBoLocSanPham('search')"></i></span>`;
        }
        if (catalogState.category !== 'all') {
            tagsHtml += `<span class="the-bo-loc">Danh mục: ${catalogState.category.toUpperCase()} <i class="fa-solid fa-xmark xoa-the-bo-loc" onclick="xoaBoLocSanPham('category')"></i></span>`;
        }
        if (catalogState.gender !== 'all') {
            tagsHtml += `<span class="the-bo-loc">Giới tính: ${catalogState.gender.toUpperCase()} <i class="fa-solid fa-xmark xoa-the-bo-loc" onclick="xoaBoLocSanPham('gender')"></i></span>`;
        }
        if (catalogState.priceRange !== 'all') {
            tagsHtml += `<span class="the-bo-loc">Giá: Đã lọc <i class="fa-solid fa-xmark xoa-the-bo-loc" onclick="xoaBoLocSanPham('price')"></i></span>`;
        }
        if (catalogState.sizes.length > 0) {
            tagsHtml += `<span class="the-bo-loc">Size: ${catalogState.sizes.join(', ')} <i class="fa-solid fa-xmark xoa-the-bo-loc" onclick="xoaBoLocSanPham('sizes')"></i></span>`;
        }
        if (tagsHtml) {
            tagsHtml += `<button type="button" class="nut nut-nho nut-vien" style="padding: 2px 8px; font-size: 0.75rem;" onclick="datLaiBoLoc()">Xóa tất cả</button>`;
        }
        activeTagsEl.innerHTML = tagsHtml;
    }

    if (results.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; width: 100%;">
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </div>
                    <h3 class="empty-state-title">Không tìm thấy sản phẩm phù hợp.</h3>
                    <p class="empty-state-desc">
                        Rất tiếc, chúng tôi không tìm thấy kết quả nào phù hợp với bộ lọc bạn đã chọn. Vui lòng thử tìm kiếm với tiêu chí khác.
                    </p>
                    <button type="button" class="nut nut-chinh" onclick="datLaiBoLoc()">
                        <i class="fa-solid fa-rotate-left"></i> Đặt lại bộ lọc
                    </button>
                </div>
            </div>
        `;
        if (paginationEl) paginationEl.innerHTML = '';
        return;
    }

    // Pagination slice
    const totalPages = Math.ceil(results.length / catalogState.pageSize);
    if (catalogState.page > totalPages) catalogState.page = 1;

    const startIndex = (catalogState.page - 1) * catalogState.pageSize;
    const pageItems = results.slice(startIndex, startIndex + catalogState.pageSize);

    grid.innerHTML = pageItems.map(p => hienThiTheSanPham(p)).join('');

    // Render pagination
    if (paginationEl) {
        if (totalPages <= 1) {
            paginationEl.innerHTML = '';
        } else {
            let pagHtml = `
                <button type="button" class="page-btn" ${catalogState.page === 1 ? 'disabled' : ''} onclick="chuyenTrangSanPham(${catalogState.page - 1})">
                    <i class="fa-solid fa-chevron-left"></i>
                </button>
            `;

            for (let i = 1; i <= totalPages; i++) {
                pagHtml += `
                    <button type="button" class="page-btn ${i === catalogState.page ? 'dang-chon' : ''}" onclick="chuyenTrangSanPham(${i})">
                        ${i}
                    </button>
                `;
            }

            pagHtml += `
                <button type="button" class="page-btn" ${catalogState.page === totalPages ? 'disabled' : ''} onclick="chuyenTrangSanPham(${catalogState.page + 1})">
                    <i class="fa-solid fa-chevron-right"></i>
                </button>
            `;

            paginationEl.innerHTML = pagHtml;
        }
    }
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
        document.querySelectorAll('input[name="filterCategory"]').forEach(i => i.checked = (i.value === 'all'));
    }
    if (key === 'gender') {
        catalogState.gender = 'all';
        document.querySelectorAll('input[name="filterGender"]').forEach(i => i.checked = (i.value === 'all'));
    }
    if (key === 'price') {
        catalogState.priceRange = 'all';
        document.querySelectorAll('input[name="filterPrice"]').forEach(i => i.checked = (i.value === 'all'));
    }
    if (key === 'sizes') {
        catalogState.sizes = [];
        document.querySelectorAll('input[name="filterSize"]').forEach(i => i.checked = false);
    }
    catalogState.page = 1;
    apDungBoLoc();
}

// PRODUCT DETAIL CONTROLLER (product-detail.html)
// ==========================================================================
let currentDetailState = {
    product: null,
    selectedImageIndex: 0,
    selectedColor: '',
    selectedSize: '',
    quantity: 1
};

function khoiTaoTrangChiTietSanPham() {
    const detailContainer = document.getElementById('productDetailContainer');
    if (!detailContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'), 10) || 1;

    const product = laySanPhamTheoMa(productId) || DANH_SACH_SAN_PHAM[0];
    currentDetailState.product = product;
    currentDetailState.selectedColor = product.colors[0]?.name || 'Tiêu chuẩn';
    currentDetailState.selectedSize = product.sizes[0] || 'Freesize';
    currentDetailState.quantity = 1;
    currentDetailState.selectedImageIndex = 0;

    hienThiChiTietSanPham(product);
    hienThiSanPhamLienQuan(product.id);
    khoiTaoTabSanPham();
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
        breadcrumbCategory.href = `products.html?category=${product.category}`;
    }

    const discount = tinhPhanTramGiamGia(product.price, product.oldPrice);
    const isWished = kiemTraSanPhamYeuThich(product.id);

    container.innerHTML = `
        <div class="luoi-chi-tiet-san-pham">
            <!-- Left: Gallery -->
            <div class="product-gallery">
                <div class="product-thumbnails">
                    ${product.images.map((imgUrl, idx) => `
                        <div class="thumbnail-item ${idx === 0 ? 'dang-chon' : ''}" onclick="chonAnhThuNho(${idx})">
                            <img src="${imgUrl}" alt="${product.name} ${idx + 1}">
                        </div>
                    `).join('')}
                </div>

                <div class="product-main-image-box">
                    <img id="detailMainImage" src="${product.images[0] || product.image}" alt="${product.name}">
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
                <div class="product-category-gender">${product.gender.toUpperCase()} • ${product.category.toUpperCase()}</div>
                <h1 class="product-detail-title">${product.name}</h1>

                <div class="product-meta-row">
                    <div class="sao-danh-gia">${hienThiDanhGiaSao(product.rating)}</div>
                    <span style="font-weight: 600; color: var(--color-primary);">${product.rating}</span>
                    <span>(${product.reviews} đánh giá của khách hàng)</span>
                    <span>•</span>
                    <span>Mã SP: <strong>AUR-00${product.id}</strong></span>
                </div>

                <div class="product-price-box">
                    <span class="detail-price-current">${dinhDangTien(product.price)}</span>
                    ${product.oldPrice ? `<span class="detail-price-old">${dinhDangTien(product.oldPrice)}</span>` : ''}
                    ${discount > 0 ? `<span class="nhan nhan-giam-gia">GIẢM ${discount}%</span>` : ''}
                </div>

                <p class="product-short-desc">${product.description}</p>

                <!-- Color selector -->
                <div class="product-option-block">
                    <div class="option-header">
                        <span>Màu sắc: <strong id="detailColorName">${product.colors[0]?.name || ''}</strong></span>
                    </div>
                    <div class="color-swatch-list">
                        ${product.colors.map((c, idx) => `
                            <div class="color-swatch ${idx === 0 ? 'dang-chon' : ''}" 
                                 style="background-color: ${c.hex};" 
                                 data-color="${c.name}"
                                 onclick="chonMauSanPham(this, '${c.name}')" 
                                 title="${c.name}"></div>
                        `).join('')}
                    </div>
                </div>

                <!-- Size selector -->
                <div class="product-option-block">
                    <div class="option-header">
                        <span>Kích thước: <strong id="detailSizeName">${product.sizes[0] || ''}</strong></span>
                        <span class="size-guide-link" onclick="moBangHuongDanKichThuoc()">
                            <i class="fa-solid fa-ruler-combined"></i> Hướng dẫn chọn size
                        </span>
                    </div>
                    <div class="size-selector">
                        ${product.sizes.map((s, idx) => `
                            <div class="size-pill ${idx === 0 ? 'dang-chon' : ''}" 
                                 data-size="${s}"
                                 onclick="chonKichThuocSanPham(this, '${s}')">${s}</div>
                        `).join('')}
                    </div>
                </div>

                <!-- Quantity and Actions -->
                <div class="detail-actions-group">
                    <div class="qty-control">
                        <button type="button" class="qty-btn" onclick="doiSoLuongSanPham(-1)">-</button>
                        <input type="number" id="detailQtyInput" class="qty-input" value="1" min="1" max="99" readonly>
                        <button type="button" class="qty-btn" onclick="doiSoLuongSanPham(1)">+</button>
                    </div>

                    <button type="button" class="nut nut-vien nut-lon" style="flex: 1;" onclick="themChiTietVaoGioHang()">
                        <i class="fa-solid fa-cart-shopping"></i> Thêm vào giỏ hàng
                    </button>

                    <button type="button" class="nut nut-chinh nut-lon" style="flex: 1;" onclick="muaSanPhamNgay()">
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

    // Populate Tab Contents
    const descTab = document.getElementById('tabDescription');
    if (descTab) {
        descTab.innerHTML = `
            <div style="line-height: 1.8; color: var(--color-text);">
                <h3 style="font-family: var(--font-heading); margin-bottom: 12px; font-size: 1.3rem;">Thông tin chi tiết sản phẩm</h3>
                <p style="margin-bottom: 16px;">${product.description}</p>
                <p style="margin-bottom: 16px;">${product.details}</p>
                <h4 style="font-weight: 700; margin-bottom: 8px;">Đặc điểm nổi bật:</h4>
                <ul style="list-style: disc; padding-left: 20px; display: flex; flex-direction: column; gap: 6px;">
                    <li>Thiết kế cao cấp theo xu hướng tối giản và sang trọng.</li>
                    <li>Chất liệu: <strong>${product.material}</strong> bền đẹp, thoáng mát tối ưu.</li>
                    <li>Dễ dàng phối đồ cho nhiều hoàn cảnh: đi làm, dạo phố, dự tiệc.</li>
                    <li>Đường may 2 kim tỉ mỉ, độ hoàn thiện cao cấp chuẩn xuất khẩu.</li>
                </ul>
            </div>
        `;
    }
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
    const total = currentDetailState.product.images.length;
    let nextIdx = (currentDetailState.selectedImageIndex + direction + total) % total;
    chonAnhThuNho(nextIdx);
}

function chonMauSanPham(el, name) {
    el.closest('.color-swatch-list').querySelectorAll('.color-swatch').forEach(s => s.classList.remove('dang-chon'));
    el.classList.add('dang-chon');
    currentDetailState.selectedColor = name;
    const label = document.getElementById('detailColorName');
    if (label) label.textContent = name;
}

function chonKichThuocSanPham(el, size) {
    el.closest('.size-selector').querySelectorAll('.size-pill').forEach(s => s.classList.remove('dang-chon'));
    el.classList.add('dang-chon');
    currentDetailState.selectedSize = size;
    const label = document.getElementById('detailSizeName');
    if (label) label.textContent = size;
}

function doiSoLuongSanPham(delta) {
    const input = document.getElementById('detailQtyInput');
    if (!input) return;
    let val = parseInt(input.value, 10) || 1;
    val = Math.max(1, Math.min(99, val + delta));
    input.value = val;
    currentDetailState.quantity = val;
}

function themChiTietVaoGioHang() {
    if (!currentDetailState.product) return;
    themVaoGioHang(
        currentDetailState.product.id,
        currentDetailState.quantity,
        currentDetailState.selectedColor,
        currentDetailState.selectedSize
    );
}

function muaSanPhamNgay() {
    if (!currentDetailState.product) return;
    themVaoGioHang(
        currentDetailState.product.id,
        currentDetailState.quantity,
        currentDetailState.selectedColor,
        currentDetailState.selectedSize
    );
    window.location.href = 'checkout.html';
}

function hienThiSanPhamLienQuan(currentId) {
    const container = document.getElementById('relatedProductsGrid');
    if (!container) return;

    const related = laySanPhamLienQuan(currentId, 4);
    container.innerHTML = related.map(p => hienThiTheSanPham(p)).join('');
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

function moBangHuongDanKichThuoc() {
    let backdrop = document.querySelector('#sizeGuideModal');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'sizeGuideModal';
        backdrop.className = 'modal-backdrop';
        backdrop.innerHTML = `
            <div class="modal" style="max-width: 640px;">
                <div class="modal-header">
                    <span class="modal-title">Bảng Quy Chuẩn Kích Thước (Size Guide)</span>
                    <button class="nut-dong-hop-thoai" onclick="document.querySelector('#sizeGuideModal').classList.remove('dang-mo'); document.body.style.overflow='';">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p style="font-size: 0.875rem; color: var(--color-text-muted); margin-bottom: 16px;">
                        Số đo mang tính chất tham khảo chuẩn form châu Á. Nếu bạn phân vân giữa 2 kích cỡ, hãy ưu tiên chọn kích cỡ lớn hơn để thoải mái vận động.
                    </p>
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: center;">
                        <thead>
                            <tr style="background: var(--color-bg-alt); border-bottom: 1px solid var(--color-border);">
                                <th style="padding: 10px;">Size</th>
                                <th style="padding: 10px;">Chiều cao (cm)</th>
                                <th style="padding: 10px;">Cân nặng (kg)</th>
                                <th style="padding: 10px;">Vòng ngực (cm)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom: 1px solid var(--color-border-subtle);"><td style="padding: 10px; font-weight: 700;">S</td><td>155 - 165</td><td>48 - 56</td><td>84 - 88</td></tr>
                            <tr style="border-bottom: 1px solid var(--color-border-subtle);"><td style="padding: 10px; font-weight: 700;">M</td><td>165 - 172</td><td>57 - 65</td><td>89 - 94</td></tr>
                            <tr style="border-bottom: 1px solid var(--color-border-subtle);"><td style="padding: 10px; font-weight: 700;">L</td><td>170 - 178</td><td>66 - 74</td><td>95 - 100</td></tr>
                            <tr style="border-bottom: 1px solid var(--color-border-subtle);"><td style="padding: 10px; font-weight: 700;">XL</td><td>175 - 183</td><td>75 - 82</td><td>101 - 106</td></tr>
                            <tr><td style="padding: 10px; font-weight: 700;">XXL</td><td>180 - 188</td><td>83 - 92</td><td>107 - 114</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        document.body.appendChild(backdrop);
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                backdrop.classList.remove('dang-mo');
                document.body.style.overflow = '';
            }
        });
    }

    backdrop.classList.add('dang-mo');
    document.body.style.overflow = 'hidden';
}

// Tự động kích hoạt khi ở trang products.html hoặc product-detail.html
document.addEventListener('DOMContentLoaded', () => {
    khoiTaoTrangDanhSachSanPham();
    khoiTaoTrangChiTietSanPham();
});

