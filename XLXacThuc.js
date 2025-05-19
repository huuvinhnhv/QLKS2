
const XyLyKhachHang = require("./XLKhachHang")
const DanhSachQuyen = ["TiepTan", "QuanLi", "BanGiamDoc", "Khach"];

function KiemTraQuyen(rolesChoPhep = DanhSachQuyen) {
    return function (req, res, next) {
        const user = req.session.user;
        if (user && rolesChoPhep.includes(user.role)) {
            next(); // Có quyền thì tiếp tục
        } else {
            res.status(403).send("Bạn không có quyền truy cập.");
        }
    };
}
function KiemTraDangNhap(username, password) {
    const duLieuKhachSan = XyLyKhachHang.DocDuLieuKhachSan();
    // Dùng spread để gộp các mảng
    const danhSachNhanVien = [
        ...duLieuKhachSan.banLanhDao,
        ...duLieuKhachSan.quanLy,
        ...duLieuKhachSan.nhanVien
    ];

    const taiKhoan = danhSachNhanVien.find(tk => tk.tenDangNhap === username && tk.matKhau === password);
    return taiKhoan !== undefined;
}

module.exports.KiemTraQuyen = KiemTraQuyen;
module.exports.KiemTraDangNhap = KiemTraDangNhap;