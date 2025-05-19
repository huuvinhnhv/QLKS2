// install npm install express

// Khai báo sử dụng thư viện hàm 
const EXPRESS = require("express")
const session = require("express-session")
// const Xu_ly = require("./XL_3L_Cach_1")
const XyLyKhachHang = require("./XLKhachHang")
const XyLyTiepTan = require("./XLTiepTan")
const XyLyXacThuc = require("./XLXacThuc")
// Khai báo và khởi động Ứng dụng 
var Ung_dung = EXPRESS()
Ung_dung.use(session({
    secret: 'qwertyuiop1234567890',
    resave: false,
    saveUninitialized: true
}))
// Middleware gán mặc định vai trò 'Khach' nếu chưa đăng nhập
Ung_dung.use((req, res, next) => {
    if (!req.session.user) {
        req.session.user = {
            username: 'guest',
            role: 'Khach'
        };
    }
    next();
});


Ung_dung.use("/Media", EXPRESS.static("Media"))
Ung_dung.use(EXPRESS.urlencoded())
Ung_dung.listen(3000)

Ung_dung.get("/", XyLyXacThuc.KiemTraQuyen(), XLKhoiDong)

Ung_dung.get("/timkiem", XyLyXacThuc.KiemTraQuyen(), XLTimKiem)

Ung_dung.post('/dangnhap', (req, res) => {
    const { username, password } = req.body;
    let role = '';
    let check = XyLyXacThuc.KiemTraDangNhap(username, password);
    if (check && username.includes("BLD")) {
        role = "BanLanhDao";
    } else if (check && username.includes("QL")) {
        role = "QuanLy";
    } else if (check && username.includes("NV")) {
        role = "TiepTan";
    } else {
        role = "Khach";
        // Nếu là khách thì không đăng nhập thành công
        var MenuKhacHang = XyLyKhachHang.TaoMenuKhachHang();
        var ChuoiHTML = KhungHTML.replace("ChuoiMenu", MenuKhacHang);
        var ChuoiThongBao = `
        <div class="alert alert-danger" role="alert">
           Sai thông tin đăng nhập. Đăng nhập thất bại!
        </div>
        `;
        var DanhSachPhong = XyLyKhachHang.DocDuLieuPhong();
        var ChuoiHTMLPhong = XyLyKhachHang.TaoHtmlTatCaCardPhong(DanhSachPhong);
        ChuoiThongBao += ChuoiHTMLPhong;
        ChuoiHTML = ChuoiHTML.replace("ChuoiHTML", ChuoiThongBao); // dùng ChuoiThongBao chứ không phải chỉ ChuoiHTMLPhong
        return res.send(ChuoiHTML); // ✅ return để không chạy tiếp xuống
    }

    // Nếu đăng nhập thành công thì lưu session và chuyển hướng
    req.session.user = {
        username,
        role
    };
    res.redirect('/');
});
// Middleware xử lý route không tồn tại
Ung_dung.use((req, res, next) => {
    res.status(404).send(`
        <html>
        <head>
            <title>404 - Không tìm thấy trang</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css">
        </head>
        <body class="container text-center mt-5">
            <h1 class="display-4 text-danger">404</h1>
            <p class="lead">Trang bạn yêu cầu không tồn tại.</p>
            <a href="/" class="btn btn-primary">Quay về trang chủ</a>
        </body>
        </html>
    `);
});

// ====== Khai báo biến toàn cục
var KhungHTML = XyLyKhachHang.DocKhungHTML()
// =========Khai báo hàm xử lý Biến cố 
function XLKhoiDong(req, res) {
    const user = req.session.user || { role: "Khach" };
    if (user.role === "Khach") {
        var MenuKhacHang = XyLyKhachHang.TaoMenuKhachHang()
        ChuoiHTML = KhungHTML.replace("ChuoiMenu", MenuKhacHang)

        var DanhSachPhong = XyLyKhachHang.DocDuLieuPhong()
        var ChuoiHTMLPhong = XyLyKhachHang.TaoHtmlTatCaCardPhong(DanhSachPhong)
        ChuoiHTML = ChuoiHTML.replace("ChuoiHTML", ChuoiHTMLPhong)
        res.send(ChuoiHTML)
    } else if (user.role === "TiepTan") {
        var MenuTiepTan = XyLyTiepTan.TaoMenuTiepTan(user.username)
        ChuoiHTML = KhungHTML.replace("ChuoiMenu", MenuTiepTan)

        var DanhSachPhong = XyLyTiepTan.DocDuLieuPhong(user.username)
        var ChuoiHTMLPhong = XyLyTiepTan.TaoHtmlTatCaCardPhong(DanhSachPhong)
        ChuoiHTML = ChuoiHTML.replace("ChuoiHTML", ChuoiHTMLPhong)
        res.send(ChuoiHTML)
    }
}

function XLTimKiem(req, res) {
    const user = req.session.user || { role: "khach" };

    // Lấy các tham số tìm kiếm
    const tienNghiTim = (req.query.tiennghi || "").toLowerCase();
    const loaiPhongTim = (req.query.loaiphong || "").toLowerCase();
    const loaiPhong = XyLyKhachHang.LayLoaiPhong(loaiPhongTim);

    // Đọc danh sách phòng
    const DanhSachPhong = XyLyKhachHang.DocDuLieuPhong();

    // Lọc dữ liệu
    const DanhSachLoc = DanhSachPhong.filter(phong => {
        const matchTienNghi = tienNghiTim === "" || phong.tienNghi.toLowerCase().includes(tienNghiTim);
        const matchLoaiPhong = !loaiPhong || phong.loaiPhong.toLowerCase() === loaiPhong.tenLoaiPhong.toLowerCase() && phong.sucChua === loaiPhong.sucChua;
        return matchTienNghi && matchLoaiPhong;
    });

    // Tạo giao diện kết quả
    const Menu = XyLyKhachHang.TaoMenuKhachHang();
    let ChuoiHTML = KhungHTML.replace("ChuoiMenu", Menu);

    const ChuoiHTMLPhong = XyLyKhachHang.TaoHtmlTatCaCardPhong(DanhSachLoc);
    ChuoiHTML = ChuoiHTML.replace("ChuoiHTML", ChuoiHTMLPhong);

    res.send(ChuoiHTML);
}





