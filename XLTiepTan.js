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

    <!-- Ô tìm kiếm -->
    <form class="form-inline mx-3 w-25" method="get" action="/timkiem">
        <input class="form-control w-100" name="tiennghi" type="search" placeholder="Tìm kiếm tên khách hàng" aria-label="Tìm kiếm">
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

    <!-- Form filter ngày tháng năm -->
    <form class="form-inline mx-1" method="get" action="/locngay">
        <label class="text-white mx-2">Ngày:</label>
        <input type="date" class="form-control mr-2" name="ngay" onchange="this.form.submit()" />
    </form>

    <!-- Dropdown chức năng -->
    <div class="dropdown ml-3">
        <button class="btn btn-light dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Chức năng
        </button>
        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
            <a class="dropdown-item" href="/phieuthue">Phiếu thuê phòng</a>
            <a class="dropdown-item" href="/danhsachkhach">Danh sách khách hàng</a>
            <a class="dropdown-item" href="/baocao">Báo cáo doanh thu</a>
        </div>
    </div>

    <!-- Nút đăng nhập bên phải -->
    <div class="ml-auto">
        <a href="/dangxuat" class="text-white" >${username} - Đăng xuất</a>
    </div>
</nav>
`
    return ChuoiHTML
}

function TaoCardHtmlPhong(thongTinPhongCoBan) {
    // Lấy thông tin từ đối tượng đầu vào, sử dụng giá trị mặc định nếu thuộc tính không tồn tại
    const soPhong = thongTinPhongCoBan.soPhong || 'N/A';
    // Định dạng đơn giá sang chuỗi tiền tệ Việt Nam (ví dụ: 500.000 VNĐ)
    const donGia = thongTinPhongCoBan.donGia ? `${thongTinPhongCoBan.donGia.toLocaleString('vi-VN')} VNĐ` : 'N/A';
    const sucChua = thongTinPhongCoBan.sucChua || 'N/A';
    const tienNghi = thongTinPhongCoBan.tienNghi || 'Đang cập nhật';
    const loaiPhong = thongTinPhongCoBan.loaiPhong || 'Không rõ';
    // Lấy tình trạng, nếu không có thì hiển thị 'Không rõ' hoặc một giá trị mặc định khác
    const tinhTrang = thongTinPhongCoBan.tinhTrang || 'Không rõ';
    const khuVuc = thongTinPhongCoBan.khuVuc || 'Không rõ';
    const tang = thongTinPhongCoBan.tang || 'Không rõ';

    // Tạo chuỗi HTML sử dụng Template Literals (ký tự backtick ``)
    // Đảm bảo Bootstrap 4 CSS đã được nhúng trong trang HTML của bạn
    const htmlString = `
<div class="col-sm-6 col-md-4 col-lg-3 mb-4">
    <div class="card h-100 shadow-sm border-primary">
        <div class="card-body">
            <h5 class="card-title text-primary font-weight-bold">
                ${soPhong} - Khu ${khuVuc}, Tầng ${tang}
            </h5>
            <h6 class="card-subtitle mb-2 text-muted">
                ${loaiPhong} | <span class="badge badge-${tinhTrang === 'Chưa sử dụng' ? 'success' : 'danger'}">${tinhTrang}</span>
            </h6>
            <ul class="list-unstyled mt-3 mb-0">
                <li><strong>Số người:</strong> ${sucChua} người</li>
                <li><strong>Giá:</strong> <span class="text-danger font-weight-bold">${donGia}</span>/ngày</li>
                <li><strong>Tiện nghi:</strong> ${tienNghi}</li>
            </ul>
        </div>
    </div>
</div>

    `;

    return htmlString;
}

function TaoHtmlTatCaCardPhong(danhSachPhongCoBan) {
    let allCardsHtml = '';
    for (const phong of danhSachPhongCoBan) {
        allCardsHtml += TaoCardHtmlPhong(phong);
    }
    const finalHtml = `
          <h3 class="text-left pt-2 pb-2">Danh sách phòng trống:</h3>
    <div class="row">${allCardsHtml}</div>`;
    return finalHtml;
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
module.exports.TaoHtmlTatCaCardPhong = TaoHtmlTatCaCardPhong;
module.exports.LayLoaiPhong = LayLoaiPhong;