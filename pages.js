const pages = [
    {
        title: "Trang Chủ",
        href: "trangchuchinh.html",
        category: "Tổng quan",
        description: "Giới thiệu tổng quan về thành phố Cần Thơ, điểm nổi bật, hình ảnh và gợi ý khám phá.",
        keywords: ["can tho", "trang chu", "gioi thieu", "tong quan", "song nuoc", "ben ninh kieu", "cho noi"]
    },
    {
        title: "Du Lịch",
        href: "dulichtest.html",
        category: "Khám phá",
        description: "Tổng hợp các địa điểm nổi tiếng và khu du lịch sinh thái ở Cần Thơ.",
        keywords: ["du lich", "dia diem", "tham quan", "sinh thai", "my khanh", "ben ninh kieu", "cau can tho"]
    },
    {
        title: "Ẩm Thực",
        href: "doan.html",
        category: "Món ngon",
        description: "Khám phá món ăn truyền thống, món đường phố và đặc sản nổi bật của Cần Thơ.",
        keywords: ["am thuc", "mon ngon", "dac san", "banh xeo", "lau mam", "bun nuoc leo", "tra sua"]
    },
    {
        title: "Văn Hóa",
        href: "vanhoa.html",
        category: "Lễ hội",
        description: "Giới thiệu các lễ hội văn hóa tiêu biểu, bản sắc miền Tây và đời sống cộng đồng.",
        keywords: ["van hoa", "le hoi", "banh dan gian", "dua ghe ngo", "nghinh ong", "khmer"]
    },
    {
        title: "Hỗ Trợ",
        href: "contact.html",
        category: "Liên hệ",
        description: "Thông tin dự án, mục tiêu website và các kênh liên hệ hỗ trợ.",
        keywords: ["ho tro", "lien he", "gioi thieu", "email", "du an", "nhat thien", "nguyen khoa"]
    },
    {
        title: "Chợ Nổi Cái Răng",
        href: "CNCR.html",
        category: "Điểm đến chi tiết",
        description: "Trang chi tiết về Chợ nổi Cái Răng với lịch trình gợi ý, trải nghiệm và đánh giá du khách.",
        keywords: ["cho noi cai rang", "cai rang", "ghe thuyen", "lich trinh", "am thuc tren ghe", "du khach"]
    },
    {
        title: "Tài Khoản",
        href: "account.html",
        category: "Account",
        description: "Trang đăng ký và đăng nhập tài khoản người dùng ngay trên website.",
        keywords: ["tai khoan", "account", "dang ky", "dang nhap", "user", "login", "register"]
    },
    {
        title: "Diễn Đàn",
        href: "forum.html",
        category: "Cộng đồng",
        description: "Diễn đàn để bàn luận theo chủ đề, chia sẻ câu chuyện, đăng ảnh video và ghim bài viết.",
        keywords: ["dien dan", "forum", "cong dong", "ban luan", "chia se", "anh", "video", "ghim bai"]
    },
    {
        title: "Quản Trị Viên",
        href: "admin.html",
        category: "Quản trị",
        description: "Trang dành cho quản trị viên để xem danh sách tài khoản, khóa và bỏ khóa người dùng.",
        keywords: ["quan tri vien", "admin", "quan tri", "unban", "bo khoa", "ban tai khoan", "nguoi dung"]
    },
    {
        title: "Nhật Kí Du Lịch",
        href: "nhatkidulich.html",
        category: "Cá nhân",
        description: "Trang nhật kí du lịch riêng tư để tạo lịch trình, thêm ảnh video và xuất file chia sẻ.",
        keywords: ["nhat ki du lich", "travel journal", "lich trinh", "xuat file", "anh", "video", "ca nhan"]
    },
    {
        title: "Vườn Trái Cây 9 Hồng",
        href: "9hong.html",
        category: "Điểm đến chi tiết",
        description: "Trang về Vườn Trái Cây 9 Hồng",
        keywords: ["vn","tri","cy","9","hng"]
    }
    ,{
        title: "Vườn Du Lịch Sinh Thái Ba Cống",
        href: "bacong.html",
        category: "Điểm đến chi tiết",
        description: "Trang về Vườn Du Lịch Sinh Thái Ba Cống",
        keywords: ["vn","du","lch","sinh","thi","ba","cng"]
    }
    ,{
        title: "Bánh Cống",
        href: "banhcong.html",
        category: "Điểm đến chi tiết",
        description: "Trang về Bánh Cống",
        keywords: ["bnh","cng"]
    }
    ,{
        title: "Bánh Da Lợn",
        href: "banhdalon.html",
        category: "Điểm đến chi tiết",
        description: "Trang về Bánh Da Lợn",
        keywords: ["bnh","da","ln"]
    }
    ,{
        title: "Lễ hội Bánh Dân Gian Nam Bộ",
        href: "banhdangian.html",
        category: "Điểm đến chi tiết",
        description: "Trang về Lễ hội Bánh Dân Gian Nam Bộ",
        keywords: ["l","hi","bnh","dn","gian","nam","b"]
    }
    ,{
        title: "Bánh Mì Chảo",
        href: "banhmichao.html",
        category: "Điểm đến chi tiết",
        description: "Trang về Bánh Mì Chảo",
        keywords: ["bnh","m","cho"]
    }
    ,{
        title: "Bánh Pía",
        href: "banhpia.html",
        category: "Điểm đến chi tiết",
        description: "Trang về Bánh Pía",
        keywords: ["bnh","pa"]
    }
    ,{
        title: "Bánh Tét Lá Cẩm",
        href: "banhtetlacam.html",
        category: "Điểm đến chi tiết",
        description: "Trang về Bánh Tét Lá Cẩm",
        keywords: ["bnh","tt","l","cm"]
    }
    ,{
        title: "Bánh Tráng Nướng",
        href: "banhtnuong.html",
        category: "Điểm đến chi tiết",
        description: "Trang về Bánh Tráng Nướng",
        keywords: ["bnh","trng","nng"]
    }
    ,{
        title: "Bánh Xèo",
        href: "banhxeo.html",
        category: "Điểm đến chi tiết",
        description: "Trang về Bánh Xèo",
        keywords: ["bnh","xo"]
    }
    ,{
        title: "Bến Ninh Kiều",
        href: "bnk.html",
        category: "Điểm đến chi tiết",
        description: "Trang về Bến Ninh Kiều",
        keywords: ["bn","ninh","kiu"]
    }
    ,{
        title: "Bún Nước Lèo",
        href: "bunncleo.html",
        category: "Trang chi tiết",
        description: "Trang về Bún Nước Lèo",
        keywords: ["bn","nc","lo"]
    }
    ,{
        title: "Cầu Cần Thơ",
        href: "cauctho.html",
        category: "Điểm đến chi tiết",
        description: "Trang về Cầu Cần Thơ",
        keywords: ["cu","cn","th"]
    }
    ,{
        title: "Lễ hội Chol Chnam Thmay",
        href: "CholChnamThmay.html",
        category: "Điểm đến chi tiết",
        description: "Trang về Lễ hội Chol Chnam Thmay",
        keywords: ["l","hi","chol","chnam","thmay"]
    }
    ,{
        title: "Chuối Nếp Nướng",
        href: "chuoinepnuong.html",
        category: "Trang chi tiết",
        description: "Trang về Chuối Nếp Nướng",
        keywords: ["chui","np","nng"]
    }
    ,{
        title: "Chùa Ông",
        href: "co.html",
        category: "Điểm đến chi tiết",
        description: "Trang về Chùa Ông",
        keywords: ["cha","ng"]
    }
    ,{
        title: "Đền Thờ Vua Hùng",
        href: "dentho.html",
        category: "Điểm đến chi tiết",
        description: "Trang về Đền Thờ Vua Hùng",
        keywords: ["n","th","vua","hng"]
    }
    ,{
        title: "Lễ hội Đua ghe ngo",
        href: "duaghengo.html",
        category: "Điểm đến chi tiết",
        description: "Trang về Lễ hội Đua ghe ngo",
        keywords: ["l","hi","ua","ghe","ngo"]
    }
    ,{
        title: "Khu Du Lịch Sinh Thái Hoa Súng",
        href: "hoasung.html",
        category: "Điểm đến chi tiết",
        description: "Trang về Khu Du Lịch Sinh Thái Hoa Súng",
        keywords: ["khu","du","lch","sinh","thi","hoa","sng"]
    }
    ,{
        title: "Hủ Tiếu Gõ",
        href: "hutieugo.html",
        category: "Trang chi tiết",
        description: "Trang về Hủ Tiếu Gõ",
        keywords: ["h","tiu","g"]
    }
    ,{
        title: "Lễ hội Kỳ Yên Đình Bình Thủy",
        href: "kyyen.html",
        category: "Điểm đến chi tiết",
        description: "Trang về Lễ hội Kỳ Yên Đình Bình Thủy",
        keywords: ["l","hi","k","yn","nh","bnh","thy"]
    }
    ,{
        title: "Lẩu Mắm",
        href: "laumam.html",
        category: "Trang chi tiết",
        description: "Trang về Lẩu Mắm",
        keywords: ["lu","mm"]
    }
    ,{
        title: "Khu Du Lịch Sinh Thái Lung Cột Cầu",
        href: "lcc.html",
        category: "Điểm đến chi tiết",
        description: "Trang về Khu Du Lịch Sinh Thái Lung Cột Cầu",
        keywords: ["khu","du","lch","sinh","thi","lung","ct","cu"]
    }
    ,{
        title: "Lễ hội Chợ nổi Cái Răng",
        href: "lehoicncr.html",
        category: "Điểm đến chi tiết",
        description: "Trang về Lễ hội Chợ nổi Cái Răng",
        keywords: ["l","hi","ch","ni","ci","rng"]
    }
    ,{
        title: "Làng Du Lịch Mỹ Khánh",
        href: "mykhanh.html",
        category: "Trang chi tiết",
        description: "Trang về Làng Du Lịch Mỹ Khánh",
        keywords: ["lng","du","lch","m","khnh"]
    }
    ,{
        title: "Nem Nướng",
        href: "nemnuong.html",
        category: "Trang chi tiết",
        description: "Trang về Nem Nướng",
        keywords: ["nem","nng"]
    }
    ,{
        title: "Lễ hội Nghinh Ông",
        href: "nghinhong.html",
        category: "Điểm đến chi tiết",
        description: "Trang về Lễ hội Nghinh Ông",
        keywords: ["l","hi","nghinh","ng"]
    }
    ,{
        title: "Nhà Cổ Bình Thủy",
        href: "nhaco.html",
        category: "Điểm đến chi tiết",
        description: "Trang về Nhà Cổ Bình Thủy",
        keywords: ["nh","c","bnh","thy"]
    }
    ,{
        title: "Nhà thờ Chánh Tòa Cần Thơ",
        href: "nhatho.html",
        category: "Điểm đến chi tiết",
        description: "Trang về Nhà thờ Chánh Tòa Cần Thơ",
        keywords: ["nh","th","chnh","ta","cn","th"]
    }
    ,{
        title: "Ốc Nướng Tiêu",
        href: "ocnuongtieu.html",
        category: "Trang chi tiết",
        description: "Trang về Ốc Nướng Tiêu",
        keywords: ["c","nng","tiu"]
    }
    ,{
        title: "Khu Du Lịch Sinh Thái Ông Đề",
        href: "ongde.html",
        category: "Điểm đến chi tiết",
        description: "Trang về Khu Du Lịch Sinh Thái Ông Đề",
        keywords: ["khu","du","lch","sinh","thi","ng"]
    }
    ,{
        title: "Lễ hội Oóc Om Bóc",
        href: "oocomboc.html",
        category: "Điểm đến chi tiết",
        description: "Trang về Lễ hội Oóc Om Bóc",
        keywords: ["l","hi","oc","om","bc"]
    }
    ,{
        title: "Pizza Hủ Tiếu Sáu Hoài",
        href: "Pizza.html",
        category: "Trang chi tiết",
        description: "Trang về Pizza Hủ Tiếu Sáu Hoài",
        keywords: ["pizza","h","tiu","su","hoi"]
    }
    ,{
        title: "Ẩm Thực Phương Tây",
        href: "ptay.html",
        category: "Điểm đến chi tiết",
        description: "Trang về Ẩm Thực Phương Tây",
        keywords: ["m","thc","phng","ty"]
    }
    ,{
        title: "Lễ hội Sene Dolta",
        href: "senedolta.html",
        category: "Điểm đến chi tiết",
        description: "Trang về Lễ hội Sene Dolta",
        keywords: ["l","hi","sene","dolta"]
    }
    ,{
        title: "Gửi Crush - Happy Birthday! ✨",
        href: "sinhnhat.html",
        category: "Trang chi tiết",
        description: "Trang về Gửi Crush - Happy Birthday! ✨",
        keywords: ["gi","crush","happy","birthday"]
    }
    ,{
        title: "Lễ hội Trái cây Phụng Hiệp",
        href: "traicay.html",
        category: "Điểm đến chi tiết",
        description: "Trang về Lễ hội Trái cây Phụng Hiệp",
        keywords: ["l","hi","tri","cy","phng","hip"]
    }
    ,{
        title: "Trà Mãng Cầu",
        href: "tramangcau.html",
        category: "Điểm đến chi tiết",
        description: "Trang về Trà Mãng Cầu",
        keywords: ["tr","mng","cu"]
    }
    ,{
        title: "Trà Sữa",
        href: "trasua.html",
        category: "Trang chi tiết",
        description: "Trang về Trà Sữa",
        keywords: ["tr","sa"]
    }
    ,{
        title: "Thiền Viện Trúc Lâm Phương Nam",
        href: "tvtl.html",
        category: "Trang chi tiết",
        description: "Trang về Thiền Viện Trúc Lâm Phương Nam",
        keywords: ["thin","vin","trc","lm","phng","nam"]
    }
];
