// install npm install express

// Khai báo sử dụng thư viện hàm 
const EXPRESS = require("express")
const session = require("express-session")
const XuLyKhachHang = require("./XLKhachHang")
const XuLyTiepTan = require("./XLTiepTan")
const XuLyQuanLy = require("./XLQuanLy")
const XuLyBanGiamDoc = require("./XLBanGiamDoc")
const XuLyXacThuc = require("./XLXacThuc")

// Khai báo và khởi động Ứng dụng 
var Ung_dung = EXPRESS()

// Middleware
Ung_dung.use(EXPRESS.urlencoded({ extended: true }));
Ung_dung.use(session({
    secret: 'qwertyuiop1234567890',
    resave: false,
    saveUninitialized: true
}))

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
Ung_dung.listen(3000)

//Route
Ung_dung.get("/", XuLyXacThuc.KiemTraQuyen(), XLKhoiDong)
Ung_dung.get("/timkiem", XuLyXacThuc.KiemTraQuyen(), XLTimKiem)
Ung_dung.get("/phieuthue/:soPhong-:soPhieu", XuLyXacThuc.KiemTraQuyen(), XLXemPhieuThue)
Ung_dung.post('/dangnhap', XLDangNhap);
Ung_dung.get('/dangxuat', XuLyXacThuc.KiemTraQuyen(), XLDangXuat);
Ung_dung.get('/phieuthue/xoa/:soPhong-:soPhieu', XuLyXacThuc.KiemTraQuyen(), XLXoaPhieuThue);
Ung_dung.post('/themphieuthue', XuLyXacThuc.KiemTraQuyen(), XLThemPhieuThue);
Ung_dung.get('/thongkethuthang', XuLyXacThuc.KiemTraQuyen(), XLThongKeThuThang);
Ung_dung.get('/thongkethunam', XuLyXacThuc.KiemTraQuyen(), XLThongKeThuNam);
Ung_dung.get('/danhsachloaiphong', XuLyXacThuc.KiemTraQuyen(), XLDanhSachLoaiPhong);
Ung_dung.get('/thaydoigiathue/:maLoaiPhong', XuLyXacThuc.KiemTraQuyen(), XLThayDoiGiaThue);
Ung_dung.post('/luugia', XuLyXacThuc.KiemTraQuyen(), XLLuuGiaThueMoi);

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

//Xử lý biến cố
function XLDangNhap(req, res) {
    const { username, password } = req.body;
    let role = '';
    let check = XuLyXacThuc.KiemTraDangNhap(username, password);
    if (check && username.includes("BGD")) {
        role = "BanGiamDoc";
    } else if (check && username.includes("QL")) {
        role = "QuanLy";
    } else if (check && username.includes("NV")) {
        role = "TiepTan";
    } else {
        role = "Khach";
        // Nếu là khách thì không đăng nhập thành công
        var MenuKhacHang = XuLyKhachHang.TaoMenuKhachHang();
        var ChuoiHTML = KhungHTML.replace("ChuoiMenu", MenuKhacHang);
        var ChuoiThongBao = `
        <div class="alert alert-danger" role="alert">
           Sai thông tin đăng nhập. Đăng nhập thất bại!
        </div>
        `;
        var DanhSachPhong = XuLyKhachHang.DocDuLieuPhong();
        var ChuoiHTMLPhong = XuLyKhachHang.TaoHtmlTatCaCardPhong(DanhSachPhong);
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
}
function XLXoaPhieuThue(req, res) {
    const { soPhong, soPhieu } = req.params;
    if (req.session.user.role !== "Khach") {
        XuLyTiepTan.XoaPhieuThue(soPhong, soPhieu, (thanhCong) => {
            if (!thanhCong) {
                return res.status(500).send('Lỗi ghi dữ liệu hoặc không tìm thấy phiếu.');
            }
            res.redirect('/');
        });
    } else {
        res.redirect('/error');
    }
}
function XLDangXuat(req, res) {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Lỗi đăng xuất.');
        }
        res.redirect('/');
    });
}
function XLThemPhieuThue(req, res) {
    if (req.session.user.role !== "Khach") {
        const { soPhong, ngayNhan, ngayTra, } = req.body;
        const hoTen = Array.isArray(req.body.hoTen) ? req.body.hoTen : [req.body.hoTen];
        const cmnd = Array.isArray(req.body.cmnd) ? req.body.cmnd : [req.body.cmnd];
        if (!soPhong || !ngayNhan || !ngayTra || !hoTen || !cmnd) {
            return res.status(400).send('Thiếu thông tin.');
        }
        var phong = XuLyTiepTan.DocDuLieuPhongBangMaPhong(soPhong);
        if (!phong) {
            return res.redirect('/error');
        }
        // Tạo số phiếu dựa trên ngày trả phòng: yyyyMMdd
        const date = new Date(ngayTra);
        const soPhieu = date.toISOString().slice(0, 10).replace(/-/g, '');
        // Tạo danh sách khách hàng
        const khachHang = hoTen.map((ten, index) => {
            if (ten && cmnd[index]) {
                return {
                    hoTen: ten.trim(),
                    cmnd: cmnd[index].trim()
                };
            }
        }).filter(Boolean);
        // Tính số ngày thuê
        const soNgay = Math.ceil((new Date(ngayTra) - new Date(ngayNhan)) / (1000 * 60 * 60 * 24));
        const tongTien = (phong.donGia || 500000) * soNgay;

        const phieuThue = {
            soPhieu,
            soPhong,
            ngayNhanPhong: ngayNhan,
            ngayTraPhong: ngayTra,
            tongTien,
            khachHang
        };
        // Gắn phiếu thuê vào phòng
        phong.phieuThuePhong = phong.phieuThuePhong || [];
        phong.phieuThuePhong.push(phieuThue);

        XuLyTiepTan.LuuPhieuThuePhong(phong, (err) => {
            if (err) {
                return res.status(500).send('Lỗi ghi dữ liệu.');
            }
            res.redirect(`/phieuthue/${phong.soPhong}-${soPhieu}`);
        });
    } else {
        return res.redirect('/error');
    }
}
function XLThongKeThuThang(req, res) {
    const thang = req.query.thang; // VD: '2025-06'
    if (!thang) {
        return res.status(400).send('Thiếu tham số tháng.');
    }

    if (req.session.user.role === "QuanLy") {

        let DanhSachPhieuThue = XuLyQuanLy.LocPhieuThueTheoLoaiPhong(req.session.user.username, "");
        const thongKe = XuLyQuanLy.ThongKeThuThang(DanhSachPhieuThue, thang);

        // Tạo giao diện
        const Menu = XuLyQuanLy.TaoMenuTiepTan(req.session.user.username);
        let ChuoiHTML = KhungHTML.replace("ChuoiMenu", Menu);
        const ChuoiHTMLThongKe = XuLyQuanLy.TaoGiaoDienThongKeThang(thongKe);
        ChuoiHTML = ChuoiHTML.replace("ChuoiHTML", ChuoiHTMLThongKe);

        res.send(ChuoiHTML);
    } else if (req.session.user.role === "BanGiamDoc") {

        let DanhSachPhieuThue = XuLyBanGiamDoc.LocPhieuThueTheoLoaiPhong(req.session.user.username, "");
        const thongKe = XuLyBanGiamDoc.ThongKeThuThang(DanhSachPhieuThue, thang);

        // Tạo giao diện
        const Menu = XuLyBanGiamDoc.TaoMenuTiepTan(req.session.user.username);
        let ChuoiHTML = KhungHTML.replace("ChuoiMenu", Menu);
        const ChuoiHTMLThongKe = XuLyBanGiamDoc.TaoGiaoDienThongKeThang(thongKe);
        ChuoiHTML = ChuoiHTML.replace("ChuoiHTML", ChuoiHTMLThongKe);

        res.send(ChuoiHTML);
    } else {
        return res.redirect('/error');
    }
}
function XLThongKeThuNam(req, res) {
    const nam = req.query.nam; // VD: '2025'
    if (!nam) {
        return res.status(400).send('Thiếu tham số tháng.');
    }

    if (req.session.user.role === "QuanLy") {

        let DanhSachPhieuThue = XuLyQuanLy.LocPhieuThueTheoLoaiPhong(req.session.user.username, "");
        const thongKe = XuLyQuanLy.ThongKeThuNam(DanhSachPhieuThue, nam);

        // Tạo giao diện
        const Menu = XuLyQuanLy.TaoMenuTiepTan(req.session.user.username);
        let ChuoiHTML = KhungHTML.replace("ChuoiMenu", Menu);
        const ChuoiHTMLThongKe = XuLyQuanLy.TaoGiaoDienThongKeNam(thongKe);
        ChuoiHTML = ChuoiHTML.replace("ChuoiHTML", ChuoiHTMLThongKe);

        res.send(ChuoiHTML);
    } if (req.session.user.role === "BanGiamDoc") {

        let DanhSachPhieuThue = XuLyBanGiamDoc.LocPhieuThueTheoLoaiPhong(req.session.user.username, "");
        const thongKe = XuLyBanGiamDoc.ThongKeThuNam(DanhSachPhieuThue, nam);

        // Tạo giao diện
        const Menu = XuLyBanGiamDoc.TaoMenuTiepTan(req.session.user.username);
        let ChuoiHTML = KhungHTML.replace("ChuoiMenu", Menu);
        const ChuoiHTMLThongKe = XuLyBanGiamDoc.TaoGiaoDienThongKeNam(thongKe);
        ChuoiHTML = ChuoiHTML.replace("ChuoiHTML", ChuoiHTMLThongKe);

        res.send(ChuoiHTML);
    } else {
        return res.redirect('/error');
    }
}
// ====== Khai báo biến toàn cục
var KhungHTML = XuLyKhachHang.DocKhungHTML()
// =========Khai báo hàm xử lý Biến cố 
function XLKhoiDong(req, res) {
    const user = req.session.user || { role: "Khach" };
    if (user.role === "Khach") {
        var MenuKhacHang = XuLyKhachHang.TaoMenuKhachHang()
        ChuoiHTML = KhungHTML.replace("ChuoiMenu", MenuKhacHang)

        var DanhSachPhong = XuLyKhachHang.DocDuLieuPhong()
        var ChuoiHTMLPhong = XuLyKhachHang.TaoHtmlTatCaCardPhong(DanhSachPhong)
        ChuoiHTML = ChuoiHTML.replace("ChuoiHTML", ChuoiHTMLPhong)
        res.send(ChuoiHTML)
    } else if (user.role === "TiepTan") {
        const loaiPhong = XuLyTiepTan.LayLoaiPhong(""); // có thể null nếu không chọn loại phòng

        // Lọc phiếu thuê theo loại phòng (nếu có)
        const DanhSachPhieuThue = XuLyTiepTan.LocPhieuThueTheoLoaiPhong(user.username, loaiPhong);

        // Tạo giao diện
        const Menu = XuLyTiepTan.TaoMenuTiepTan(user.username);
        let ChuoiHTML = KhungHTML.replace("ChuoiMenu", Menu);
        const ChuoiHTMLPhong = XuLyTiepTan.TaoHtmlTatCaCardPhieuThue(DanhSachPhieuThue);
        ChuoiHTML = ChuoiHTML.replace("ChuoiHTML", ChuoiHTMLPhong);

        res.send(ChuoiHTML);
    } else if (user.role === "QuanLy") {
        const loaiPhong = XuLyQuanLy.LayLoaiPhong(""); // có thể null nếu không chọn loại phòng

        // Lọc phiếu thuê theo loại phòng (nếu có)
        const DanhSachPhieuThue = XuLyQuanLy.LocPhieuThueTheoLoaiPhong(user.username, loaiPhong);

        // Tạo giao diện
        const Menu = XuLyQuanLy.TaoMenuTiepTan(user.username);
        let ChuoiHTML = KhungHTML.replace("ChuoiMenu", Menu);
        const ChuoiHTMLPhong = XuLyQuanLy.TaoHtmlTatCaCardPhieuThue(DanhSachPhieuThue);
        ChuoiHTML = ChuoiHTML.replace("ChuoiHTML", ChuoiHTMLPhong);

        res.send(ChuoiHTML);
    }
    else if (user.role === "BanGiamDoc") {
        const loaiPhong = XuLyBanGiamDoc.LayLoaiPhong(""); // có thể null nếu không chọn loại phòng

        // Lọc phiếu thuê theo loại phòng (nếu có)
        const DanhSachPhieuThue = XuLyBanGiamDoc.LocPhieuThueTheoLoaiPhong(user.username, loaiPhong);

        // Tạo giao diện
        const Menu = XuLyBanGiamDoc.TaoMenuTiepTan(user.username);
        let ChuoiHTML = KhungHTML.replace("ChuoiMenu", Menu);
        const ChuoiHTMLPhong = XuLyBanGiamDoc.TaoHtmlTatCaCardPhieuThue(DanhSachPhieuThue);
        ChuoiHTML = ChuoiHTML.replace("ChuoiHTML", ChuoiHTMLPhong);

        res.send(ChuoiHTML);
    }
}
function XLXemPhieuThue(req, res) {
    const { soPhong, soPhieu } = req.params;
    const user = req.session.user || { role: "Khach" };
    if (user.role === "TiepTan") {
        const danhSachPhong = XuLyTiepTan.DocDuLieuPhong(user.username);
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
        const menu = XuLyTiepTan.TaoMenuTiepTan(user.username);
        let chuoiHTML = KhungHTML.replace("ChuoiMenu", menu);

        const chuoiChiTiet = XuLyTiepTan.TaoHtmlChiTietPhieuThue(phieuCanXem); // viết thêm hàm này
        chuoiHTML = chuoiHTML.replace("ChuoiHTML", chuoiChiTiet);

        return res.send(chuoiHTML);
    } else if (user.role === "QuanLy") {
        const danhSachPhong = XuLyQuanLy.DocDuLieuPhong(user.username);
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
        const menu = XuLyQuanLy.TaoMenuTiepTan(user.username);
        let chuoiHTML = KhungHTML.replace("ChuoiMenu", menu);

        const chuoiChiTiet = XuLyQuanLy.TaoHtmlChiTietPhieuThue(phieuCanXem); // viết thêm hàm này
        chuoiHTML = chuoiHTML.replace("ChuoiHTML", chuoiChiTiet);

        return res.send(chuoiHTML);
    } else if (user.role === "BanGiamDoc") {
        const danhSachPhong = XuLyBanGiamDoc.DocDuLieuPhong(user.username);
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
        const menu = XuLyBanGiamDoc.TaoMenuTiepTan(user.username);
        let chuoiHTML = KhungHTML.replace("ChuoiMenu", menu);

        const chuoiChiTiet = XuLyBanGiamDoc.TaoHtmlChiTietPhieuThue(phieuCanXem); // viết thêm hàm này
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
        const loaiPhong = XuLyKhachHang.LayLoaiPhong(loaiPhongTim);
        // Đọc danh sách phòng
        const DanhSachPhong = XuLyKhachHang.DocDuLieuPhong();
        // Lọc dữ liệu
        const DanhSachLoc = DanhSachPhong.filter(phong => {
            const matchTienNghi = tienNghiTim === "" || phong.tienNghi.toLowerCase().includes(tienNghiTim);
            const matchLoaiPhong = !loaiPhong || phong.loaiPhong.toLowerCase() === loaiPhong.tenLoaiPhong.toLowerCase() && phong.sucChua === loaiPhong.sucChua;
            return matchTienNghi && matchLoaiPhong;
        });
        // Tạo giao diện kết quả
        const Menu = XuLyKhachHang.TaoMenuKhachHang();
        let ChuoiHTML = KhungHTML.replace("ChuoiMenu", Menu);

        const ChuoiHTMLPhong = XuLyKhachHang.TaoHtmlTatCaCardPhong(DanhSachLoc);
        ChuoiHTML = ChuoiHTML.replace("ChuoiHTML", ChuoiHTMLPhong);
        res.send(ChuoiHTML);
    } else if (req.session.user.role === "TiepTan") {
        const loaiPhong = XuLyTiepTan.LayLoaiPhong(loaiPhongTim);
        let DanhSachPhieuThue = XuLyTiepTan.LocPhieuThueTheoLoaiPhong(user.username, loaiPhong);

        // 🔍 Lọc theo tên khách nếu có
        if (tenKhachTim) {
            DanhSachPhieuThue = DanhSachPhieuThue.filter(phieu => {
                if (!Array.isArray(phieu.khachHang)) return false;
                return phieu.khachHang.some(khach =>
                    khach.hoTen && khach.hoTen.toLowerCase().includes(tenKhachTim)
                );
            });
        }
        //Lọc theo ngày nhận phòng nếu có
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
        const Menu = XuLyTiepTan.TaoMenuTiepTan(user.username);
        let ChuoiHTML = KhungHTML.replace("ChuoiMenu", Menu);
        const ChuoiHTMLPhong = XuLyTiepTan.TaoHtmlTatCaCardPhieuThue(DanhSachPhieuThue);
        ChuoiHTML = ChuoiHTML.replace("ChuoiHTML", ChuoiHTMLPhong);
        res.send(ChuoiHTML);
    } else if (req.session.user.role === "QuanLy") {
        const loaiPhong = XuLyQuanLy.LayLoaiPhong(loaiPhongTim);
        let DanhSachPhieuThue = XuLyQuanLy.LocPhieuThueTheoLoaiPhong(user.username, loaiPhong);
        // Lọc theo tên khách nếu có
        if (tenKhachTim) {
            DanhSachPhieuThue = DanhSachPhieuThue.filter(phieu => {
                if (!Array.isArray(phieu.khachHang)) return false;
                return phieu.khachHang.some(khach =>
                    khach.hoTen && khach.hoTen.toLowerCase().includes(tenKhachTim)
                );
            });
        }
        // Lọc theo ngày nhận phòng nếu có
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
        const Menu = XuLyQuanLy.TaoMenuTiepTan(user.username);
        let ChuoiHTML = KhungHTML.replace("ChuoiMenu", Menu);
        const ChuoiHTMLPhong = XuLyQuanLy.TaoHtmlTatCaCardPhieuThue(DanhSachPhieuThue);
        ChuoiHTML = ChuoiHTML.replace("ChuoiHTML", ChuoiHTMLPhong);
        res.send(ChuoiHTML);
    } else if (req.session.user.role === "BanGiamDoc") {
        const loaiPhong = XuLyBanGiamDoc.LayLoaiPhong(loaiPhongTim);
        let DanhSachPhieuThue = XuLyBanGiamDoc.LocPhieuThueTheoLoaiPhong(user.username, loaiPhong);
        //Lọc theo tên khách nếu có
        if (tenKhachTim) {
            DanhSachPhieuThue = DanhSachPhieuThue.filter(phieu => {
                if (!Array.isArray(phieu.khachHang)) return false;
                return phieu.khachHang.some(khach =>
                    khach.hoTen && khach.hoTen.toLowerCase().includes(tenKhachTim)
                );
            });
        }
        //Lọc theo ngày nhận phòng nếu có
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
        const Menu = XuLyBanGiamDoc.TaoMenuTiepTan(user.username);
        let ChuoiHTML = KhungHTML.replace("ChuoiMenu", Menu);
        const ChuoiHTMLPhong = XuLyBanGiamDoc.TaoHtmlTatCaCardPhieuThue(DanhSachPhieuThue);
        ChuoiHTML = ChuoiHTML.replace("ChuoiHTML", ChuoiHTMLPhong);
        res.send(ChuoiHTML);
    }
}

function XLDanhSachLoaiPhong(req, res) {
    if (req.session.user.role === "BanGiamDoc") {
        var danhSachLoaiPhong = XuLyBanGiamDoc.LayDanhSachLoaiPhong();
        const Menu = XuLyBanGiamDoc.TaoMenuTiepTan(req.session.user.username);
        let ChuoiHTML = KhungHTML.replace("ChuoiMenu", Menu);
        const ChuoiHTMLPhong = XuLyBanGiamDoc.TaoHtmlMenuDanhSachLoaiPhong(danhSachLoaiPhong);
        ChuoiHTML = ChuoiHTML.replace("ChuoiHTML", ChuoiHTMLPhong);
        res.send(ChuoiHTML);
    } else res.redirect('/err');
}

function XLThayDoiGiaThue(req, res) {
    const maLoaiPhong = (req.params.maLoaiPhong || "").toLowerCase();
    if (req.session.user.role === "BanGiamDoc") {
        const danhSachLoaiPhong = XuLyBanGiamDoc.LayDanhSachLoaiPhong();
        const loaiPhong = danhSachLoaiPhong.find(lp => lp.maPhong.toLowerCase() === maLoaiPhong);
        if (!loaiPhong) {
            return res.send("<h3 class='text-danger'>Không tìm thấy loại phòng cần sửa!</h3>");
        }
        const Menu = XuLyBanGiamDoc.TaoMenuTiepTan(req.session.user.username);
        let ChuoiHTML = KhungHTML.replace("ChuoiMenu", Menu);
        const ChuoiHTMLPhong = XuLyBanGiamDoc.TaoHtmlSuaLoaiPhong(loaiPhong);
        ChuoiHTML = ChuoiHTML.replace("ChuoiHTML", ChuoiHTMLPhong);
        res.send(ChuoiHTML);
    } else {
        res.redirect('/err');
    }
}
function XLLuuGiaThueMoi(req, res) {
    const maLoaiPhong = (req.body.maLoaiPhong || "").toLowerCase();
    const giaThueMoi = parseInt(req.body.donGia);
    if (req.session.user.role === "BanGiamDoc") {
        XuLyBanGiamDoc.LuuGiaThueMoi(maLoaiPhong, giaThueMoi);
        res.redirect('/danhsachloaiphong');
    } else {
        res.redirect('/err');
    }
}



