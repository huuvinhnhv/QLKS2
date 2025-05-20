const FS = require("fs")
const PATH = require("path")

const ThuMucDuLieu = "DuLieu"
const ThuMucHTML = PATH.join(ThuMucDuLieu, "HTML")
const ThuKhachSan = PATH.join(ThuMucDuLieu, "KhachSan")
const ThuMucPhong = PATH.join(ThuMucDuLieu, "Phong")

// Xử lý Lưu trữ 
function DocKhungHTML() {
    var ChuoiHTML = ""
    var DuongDan = PATH.join(ThuMucHTML, "Khung.html")
    ChuoiHTML = FS.readFileSync(DuongDan, "utf-8")
    return ChuoiHTML
}
function DocDuLieuPhong(username) {
    const duLieuKhachSan = DocDuLieuKhachSan();
    const nhanVien = duLieuKhachSan.nhanVien.find(nv => nv.maNV === username);
    const khuVucQuanLy = nhanVien?.khuVuc || [];

    const danhSachPhong = [];

    try {
        const tenCacFiles = FS.readdirSync(ThuMucPhong);
        const cacFileJson = tenCacFiles.filter(tenFile => tenFile.endsWith('.json'));

        for (const tenFile of cacFileJson) {
            const tenKhuVuc = tenFile.charAt(0); // Lấy ký tự đầu tiên

            if (khuVucQuanLy.includes(tenKhuVuc)) {
                const duongDanFile = PATH.join(ThuMucPhong, tenFile);
                const chuoiJSON = FS.readFileSync(duongDanFile, 'utf-8');
                const duLieuPhong = JSON.parse(chuoiJSON);
                danhSachPhong.push(duLieuPhong);
            }
        }

        return danhSachPhong;
    } catch (error) {
        console.error("Đã xảy ra lỗi khi đọc dữ liệu phòng từ thư mục:", ThuMucPhong, error);
        return [];
    }
}
function LocPhieuThueTheoLoaiPhong(username, loaiPhong) {
    const duLieuPhong = DocDuLieuPhong(username); // Danh sách phòng
    let danhSachPhieuThue = [];

    for (const phong of duLieuPhong) {
        // Nếu không cần lọc loại phòng, hoặc loại phòng khớp
        const canInclude =
            !loaiPhong ||
            (
                loaiPhong.tenLoaiPhong &&
                loaiPhong.sucChua &&
                phong.loaiPhong.toLowerCase() === loaiPhong.tenLoaiPhong.toLowerCase() &&
                phong.sucChua === loaiPhong.sucChua
            );

        if (canInclude && phong.phieuThuePhong && Array.isArray(phong.phieuThuePhong)) {
            for (const phieu of phong.phieuThuePhong) {
                if (!phieu.soPhong) {
                    phieu.soPhong = phong.soPhong;
                }
                danhSachPhieuThue.push(phieu);
            }
        }
    }

    // Sắp xếp theo ngày trả phòng giảm dần
    danhSachPhieuThue.sort((a, b) => {
        const ngayA = new Date(b.ngayTraPhong);
        const ngayB = new Date(a.ngayTraPhong);
        return ngayA - ngayB;
    });

    return danhSachPhieuThue;
}


function DocDuLieuKhachSan() {
    var DuongDan = PATH.join(ThuKhachSan, "KhachSan.json")
    var ChuoiJSON = FS.readFileSync(DuongDan, "utf-8")
    var Phong = JSON.parse(ChuoiJSON)
    return Phong
}
// Xử lý giao diện
function TaoMenuTiepTan(username) {
    var ChuoiHTML = `
<nav class="navbar navbar-expand-lg navbar-dark bg-primary px-3" style="min-height: 8vh;">
    <!-- Logo -->
    <a class="navbar-brand d-flex align-items-center" href="/">
        <img src="/Media/Hotel.jpg" style="width:40px;height:40px; margin-right:10px;" />
        <h4 class="mb-0 text-white">Khách sạn ABC</h4>
    </a>

    <label class="text-white mx-2">Tìm kiếm phiếu thuê:</label>
    <!-- Ô tìm kiếm -->
    <form class="form-inline mx-3 w-10" method="get" action="/timkiem">
        <input class="form-control w-100" name="tenkhachhang" type="search" placeholder="Tìm kiếm tên khách hàng" aria-label="Tìm kiếm">
    </form>
    <!-- Form filter ngày tháng năm -->
    <form class="form-inline mx-1" method="get" action="/timkiem">
        <label class="text-white mx-2">Ngày:</label>
        <input type="date" class="form-control mr-2" name="ngaytao" onchange="this.form.submit()" />
    </form>

    <!-- Form filter loại phòng -->
    <form class="form-inline mx-1" method="get" action="/timkiem">
        <label class="text-white mx-2">Loại phòng:</label>
        <select name="loaiphong" class="form-control mr-2" onchange="this.form.submit()">
            <option value="">-- Chọn loại phòng --</option>
            <option value="LP01">Phòng đơn - Tiêu chuẩn</option>
            <option value="LP02">Phòng đơn - VIP</option>
            <option value="LP03">Phòng đôi - VIP</option>
        </select>
    </form>

    <button type="button" class="btn btn-light ml-auto" data-toggle="modal" data-target="#phieuThuePhongModal">
        Thêm phiếu thuê phòng
    </button>
       
    <!-- Nút đăng nhập bên phải -->
    <div class="ml-auto">
        <a href="/dangxuat" class="text-white" >${username} - Đăng xuất</a>
    </div>
</nav>
`
    return ChuoiHTML
}

function TaoCardHtmlPhieuThue(phieu) {
    const soPhieu = phieu.soPhieu || 'N/A';
    const ngayTraPhong = phieu.ngayTraPhong || 'Chưa có';
    const soPhong = phieu.soPhong || 'Không rõ';

    return `
<div class="col-sm-6 col-md-4 col-lg-3 mb-4">
    <div class="card h-100 shadow-sm border-info">
        <div class="card-body">
            <h5 class="card-title text-info font-weight-bold">
                 <strong>Mã phòng:</strong> ${soPhong}
            </h5>
            <p class="card-text mb-1">
                <strong>Phiếu số:</strong> ${soPhieu}
            </p>
            <p class="card-text">
                <strong>Ngày tạo:</strong> ${ngayTraPhong}
            </p>
            <div class="d-flex justify-content-between">
                <a class="btn btn-primary btn-sm" href="/phieuthue/${soPhong}-${soPhieu}">
                    <i class="fa fa-eye"></i> Xem chi tiết
                </a>
                <a class="btn btn-danger btn-sm" href="/phieuthue/xoa/${soPhong}-${soPhieu}" onclick="return confirm('Bạn có chắc muốn xoá phiếu này không?');">
                    <i class="fa fa-trash"></i> Xoá
                </a>
            </div>
        </div>
    </div>
</div>
    `;
}



function TaoHtmlTatCaCardPhieuThue(danhSachPhieuThue) {
    let allCardsHtml = '';
    for (const phieu of danhSachPhieuThue) {
        allCardsHtml += TaoCardHtmlPhieuThue(phieu);
    }
    const finalHtml = `
          <h3 class="text-left pt-2 pb-2">Danh sách phiếu thuê:</h3>
    <div class="row">${allCardsHtml}</div>`;
    return finalHtml;
}

function TaoHtmlChiTietPhieuThue(phieu) {
    const ngayNhan = new Date(phieu.ngayNhanPhong).toLocaleDateString('vi-VN');
    const ngayTra = new Date(phieu.ngayTraPhong).toLocaleDateString('vi-VN');
    const khachList = phieu.khachHang?.map(k => `<li class="list-group-item">${k.hoTen} (CMND: ${k.cmnd})</li>`).join("") || "<li class='list-group-item'>Không có</li>";

    return `
    <div class="container mt-5">
        <div class="card shadow-lg border-info">
            <div class="card-header bg-info text-white">
                <h4 class="mb-0">Chi tiết phiếu thuê phòng</h4>
            </div>
            <div class="card-body">
                <div class="row mb-2">
                    <div class="col-md-6">
                        <p><strong>Mã phòng:</strong> ${phieu.soPhong}</p>
                        <p><strong>Loại phòng:</strong> ${phieu.loaiPhong}</p>
                        <p><strong>Tiện nghi:</strong> ${phieu.tienNghi}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Số phiếu:</strong> ${phieu.soPhieu}</p>
                        <p><strong>Ngày nhận phòng:</strong> ${ngayNhan}</p>
                        <p><strong>Ngày trả phòng:</strong> ${ngayTra}</p>
                        <p><strong>Tổng tiền:</strong> ${phieu.tongTien.toLocaleString()} VND</p>
                    </div>
                </div>
                <hr>
                <h5 class="text-info">Danh sách khách thuê</h5>
                <ul class="list-group mb-4">${khachList}</ul>
                <a href="/" class="btn btn-secondary">
                    <i class="fa fa-arrow-left"></i> Trở lại trang chủ
                </a>
            </div>
        </div>
    </div>
    `;
}


//xử lý nghiệp vụ
function LayTatCaCacPhong() {
    const tatCaPhongDayDu = LayTatCaCacPhong();
    const danhSachThongTinCoBan = [];
    for (const phongDayDu of tatCaPhongDayDu) {
        const thongTinCoBan = {
            soPhong: phongDayDu.soPhong,
            donGia: phongDayDu.donGia,
            sucChua: phongDayDu.sucChua,
            tienNghi: phongDayDu.tienNghi,
            loaiPhong: phongDayDu.loaiPhong,
            tinhTrang: phongDayDu.tinhTrang,
            khuVuc: phongDayDu.khuVuc,
            tang: phongDayDu.tang
        };

        if (thongTinCoBan.tinhTrang === "Chưa sử dụng") {
            danhSachThongTinCoBan.push(thongTinCoBan);
        }
        return danhSachThongTinCoBan;
    }
}
function LayLoaiPhong(maLoaiPhong) {
    const danhSachLoaiPhong = DocDuLieuKhachSan().loaiPhong;
    return danhSachLoaiPhong.find(loaiPhong =>
        loaiPhong.maPhong.toLowerCase() === maLoaiPhong.toLowerCase()
    ) || null;
}

module.exports.DocKhungHTML = DocKhungHTML;
module.exports.TaoMenuTiepTan = TaoMenuTiepTan;
module.exports.DocDuLieuPhong = DocDuLieuPhong;
module.exports.DocDuLieuKhachSan = DocDuLieuKhachSan;
module.exports.LayTatCaCacPhong = LayTatCaCacPhong;
module.exports.TaoHtmlTatCaCardPhieuThue = TaoHtmlTatCaCardPhieuThue;
module.exports.LayLoaiPhong = LayLoaiPhong;
module.exports.LocPhieuThueTheoLoaiPhong = LocPhieuThueTheoLoaiPhong;
module.exports.TaoHtmlChiTietPhieuThue = TaoHtmlChiTietPhieuThue;