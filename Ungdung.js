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
// Middleware kiểm tra xem người dùng đã đăng nhập chưa
function YeuCauDangNhap(req, res, next) {
    if (req.session.isAuthenticated) {
        // Người dùng đã đăng nhập, cho phép request đi tiếp
        next();
    } else {
        // Người dùng chưa đăng nhập, trả về lỗi 401 và thông báo
        res.status(401).send(`
        <html>
            <head>
                <title>404 - Không tìm thấy trang</title>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css">
            </head>
            <body class="container text-center mt-5">
                <h1 class="display-4 text-danger">403</h1>
                <p class="lead"> Bạn cần đăng nhập để truy cập tài nguyên này.</p>
                <a href="/" class="btn btn-primary">Quay về trang chủ</a>
            </body>
        </html>
            `);
    }
}

// Middleware kiểm tra vai trò của người dùng
// Đây là một factory function, nó trả về middleware thật sự
function YeuCauQuyen(role) {
    return (req, res, next) => {
        // Kiểm tra xem người dùng đã đăng nhập và có đúng vai trò yêu cầu không
        if (req.session.isAuthenticated && req.session.user.role === role) {
            // Người dùng có quyền, cho phép request đi tiếp
            next();
        } else {
            // Người dùng không có quyền, trả về lỗi 403 và thông báo
            res.status(403).send(`
         <html>
            <head>
                <title>404 - Không tìm thấy trang</title>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css">
            </head>
            <body class="container text-center mt-5">
                <h1 class="display-4 text-danger">403</h1>
                <p class="lead"> Bạn không có quyền truy cập tài nguyên này.</p>
                <a href="/" class="btn btn-primary">Quay về trang chủ</a>
            </body>
        </html>
               `);
        }
    };
}

Ung_dung.use("/Media", EXPRESS.static("Media"))
Ung_dung.use(EXPRESS.urlencoded())
Ung_dung.listen(3000)

Ung_dung.get("/", XyLyXacThuc.KiemTraQuyen(), XLKhoiDong)
Ung_dung.get("/timkiem", XyLyXacThuc.KiemTraQuyen(), XLTimKiem)
Ung_dung.get("/phieuthue/:soPhong-:soPhieu", XyLyXacThuc.KiemTraQuyen(), XLXemPhieuThue)
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
        const loaiPhong = XyLyTiepTan.LayLoaiPhong(""); // có thể null nếu không chọn loại phòng

        // Lọc phiếu thuê theo loại phòng (nếu có)
        const DanhSachPhieuThue = XyLyTiepTan.LocPhieuThueTheoLoaiPhong(user.username, loaiPhong);

        // Tạo giao diện
        const Menu = XyLyTiepTan.TaoMenuTiepTan(user.username);
        let ChuoiHTML = KhungHTML.replace("ChuoiMenu", Menu);
        const ChuoiHTMLPhong = XyLyTiepTan.TaoHtmlTatCaCardPhieuThue(DanhSachPhieuThue);
        ChuoiHTML = ChuoiHTML.replace("ChuoiHTML", ChuoiHTMLPhong);

        res.send(ChuoiHTML);
    }
}
function XLXemPhieuThue(req, res) {
    const { soPhong, soPhieu } = req.params;
    const user = req.session.user || { role: "Khach" };
    if (user.role !== "Khach") {
        const danhSachPhong = XyLyTiepTan.DocDuLieuPhong(user.username);
        let phieuCanXem = null;

        for (const phong of danhSachPhong) {
            if (Array.isArray(phong.phieuThuePhong)) {
                const phieu = phong.phieuThuePhong.find(p => p.soPhieu === soPhieu);
                if (phieu && phong.soPhong === soPhong) {
                    // Gắn thông tin phòng vào phiếu
                    phieu.soPhong = phong.soPhong;
                    phieu.loaiPhong = phong.loaiPhong;
                    phieu.tienNghi = phong.tienNghi;
                    phieuCanXem = phieu;
                    break;
                }
            }
        }

        if (!phieuCanXem) {
            return res.status(404).send("Không tìm thấy phiếu thuê");
        }

        // Tạo HTML chi tiết phiếu thuê
        const menu = XyLyTiepTan.TaoMenuTiepTan(user.username);
        let chuoiHTML = KhungHTML.replace("ChuoiMenu", menu);

        const chuoiChiTiet = XyLyTiepTan.TaoHtmlChiTietPhieuThue(phieuCanXem); // viết thêm hàm này
        chuoiHTML = chuoiHTML.replace("ChuoiHTML", chuoiChiTiet);

        return res.send(chuoiHTML);
    }
    res.redirect('/err');
}
function XLTimKiem(req, res) {
    const user = req.session.user || { role: "khach" };
    // Lấy các tham số tìm kiếm
    const tienNghiTim = (req.query.tiennghi || "").toLowerCase();
    const loaiPhongTim = (req.query.loaiphong || "").toLowerCase();
    const tenKhachTim = (req.query.tenkhachhang || "").toLowerCase();
    const ngayTaoTim = req.query.ngaytao || ""; // định dạng yyyy-mm-dd
    if (req.session.user.role === "Khach") {
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
    } else if (req.session.user.role === "TiepTan") {
        const loaiPhong = XyLyTiepTan.LayLoaiPhong(loaiPhongTim);
        let DanhSachPhieuThue = XyLyTiepTan.LocPhieuThueTheoLoaiPhong(user.username, loaiPhong);

        // 🔍 Lọc theo tên khách nếu có
        if (tenKhachTim) {
            DanhSachPhieuThue = DanhSachPhieuThue.filter(phieu => {
                if (!Array.isArray(phieu.khachHang)) return false;
                return phieu.khachHang.some(khach =>
                    khach.hoTen && khach.hoTen.toLowerCase().includes(tenKhachTim)
                );
            });
        }

        // 🔍 Lọc theo ngày nhận phòng nếu có
        if (ngayTaoTim) {
            DanhSachPhieuThue = DanhSachPhieuThue.filter(phieu => {
                if (!phieu.ngayTraPhong) return false;
                const ngayPhieu = new Date(phieu.ngayTraPhong);
                const ngayTim = new Date(ngayTaoTim);
                return (
                    ngayPhieu.getDate() === ngayTim.getDate() &&
                    ngayPhieu.getMonth() === ngayTim.getMonth() &&
                    ngayPhieu.getFullYear() === ngayTim.getFullYear()
                );
            });
        }

        const Menu = XyLyTiepTan.TaoMenuTiepTan(user.username);
        let ChuoiHTML = KhungHTML.replace("ChuoiMenu", Menu);
        const ChuoiHTMLPhong = XyLyTiepTan.TaoHtmlTatCaCardPhieuThue(DanhSachPhieuThue);
        ChuoiHTML = ChuoiHTML.replace("ChuoiHTML", ChuoiHTMLPhong);
        res.send(ChuoiHTML);
    }
}





