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
function DocDuLieuPhongBangMaPhong(maPhong) {
    const filePath = PATH.join(ThuMucPhong, `${maPhong}.json`);

    if (!FS.existsSync(filePath)) {
        console.error(`Không tìm thấy file phòng: ${maPhong}`);
        return null;
    }

    try {
        const data = FS.readFileSync(filePath, 'utf8');
        const phong = JSON.parse(data);
        return phong;
    } catch (err) {
        console.error('Lỗi khi đọc hoặc parse file JSON:', err);
        return null;
    }
}
function LuuPhieuThuePhong(phong, callback) {
    const filePath = PATH.join(ThuMucPhong, `${phong.soPhong}.json`);
    FS.writeFile(filePath, JSON.stringify(phong, null, 4), (err) => {
        if (err) {
            console.error('Lỗi ghi file:', err);
            return callback(err); // Gọi callback với lỗi
        }
        callback(null); // Không có lỗi
    });
}
function XoaPhieuThue(soPhong, soPhieu, callback) {
    var phong = DocDuLieuPhongBangMaPhong(soPhong);
    if (!phong) {
        console.error('Không tìm thấy phòng:', soPhong);
        return callback(false);
    }

    if (!Array.isArray(phong.phieuThuePhong)) {
        console.error('Danh sách phiếu thuê không tồn tại.');
        return callback(false);
    }

    const index = phong.phieuThuePhong.findIndex(p => p.soPhieu === soPhieu);
    if (index === -1) {
        console.error('Không tìm thấy phiếu thuê:', soPhieu);
        return callback(false);
    }

    // Xóa phiếu
    phong.phieuThuePhong.splice(index, 1);

    // Ghi lại file
    LuuPhieuThuePhong(phong, (err) => {
        if (err) {
            return callback(false);
        }
        callback(true);
    });
}

function DocDuLieuPhong(username) {
    const duLieuKhachSan = DocDuLieuKhachSan();
    const nhanVien = duLieuKhachSan.quanLy.find(nv => nv.maNV === username);
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
                phieu.loaiPhong = phong.loaiPhong;
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
<nav class="fixed-top navbar navbar-expand-lg navbar-dark bg-primary px-3" style="min-height: 8vh;">
    <!-- Logo -->
    <a class="navbar-brand d-flex align-items-center" href="/">
        <img src="/Media/Hotel.jpg" style="width:40px;height:40px; margin-right:10px;" />
        <h4 class="mb-0 text-white">Khách sạn ABC</h4>
    </a>
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
        <select name="loaiphong" class="form-control mr-2" onchange="this.form.submit()">
            <option value="">-- Chọn loại phòng --</option>
            <option value="LP01">Phòng đơn - Tiêu chuẩn</option>
            <option value="LP02">Phòng đơn - VIP</option>
            <option value="LP03">Phòng đôi - VIP</option>
        </select>
    </form>

<form action="/thongkethuthang" method="get" class="d-inline-block mr-2">
    <div class="d-flex align-items-center">
      <label class="text-white mx-2">Tháng năm:</label>
        <input type="month" name="thang" required class="form-control mr-2" style="width: 120px;" />
        <button type="submit" class="btn btn-light">Thống kê tháng</button>
    </div>
</form>

<form action="/thongkethunam" method="get" class="d-inline-block">
    <div class="d-flex align-items-center">
       <label class="text-white mx-2">Năm:</label>
        <input type="number" name="nam" required min="2000" max="2100"
               class="form-control mr-2" style="width: 100px;" placeholder="Năm" />
        <button type="submit" class="btn btn-light">Thống kê năm</button>
    </div>
</form>


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

function TaoGiaoDienThongKeThang(thongKe) {
    const { thang, tongThu, chiTiet, danhSachKhuVuc } = thongKe;

    const html = `
    <div class="card mb-4 border-primary shadow-sm">
        <div class="card-header bg-primary text-white font-weight-bold text-center">
           THỐNG KÊ PHIẾU THU THÁNG
        </div>
        <div class="card-body">
            <p><strong>Khu vực quản lý:</strong> ${danhSachKhuVuc.join(', ')}</p>
            <p><strong>Tháng:</strong> ${thang}</p>
            <p><strong>Tổng thu:</strong> ${tongThu.toLocaleString()} VND</p>
            <div class="table-responsive">
                <table class="table table-bordered table-sm table-hover">
                    <thead class="thead-light">
                        <tr>
                            <th>Loại phòng</th>
                            <th>Thu</th>
                            <th>Tỷ lệ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${chiTiet.map(item => `
                            <tr>
                                <td>${item.loaiPhong}</td>
                                <td>${item.thu.toLocaleString()} VND</td>
                                <td>${item.tyLe}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    `;

    return html;
}
function TaoGiaoDienThongKeNam(thongKe) {
    const { nam, tongThu, chiTiet, danhSachKhuVuc } = thongKe;

    const html = `
    <div class="card mb-4 border-success shadow-sm">
        <div class="card-header bg-success text-white font-weight-bold text-center">
           THỐNG KÊ PHIẾU THU NĂM
        </div>
        <div class="card-body">
            <p><strong>Khu vực quản lý:</strong> ${danhSachKhuVuc.join(', ')}</p>
            <p><strong>Năm:</strong> ${nam}</p>
            <p><strong>Tổng thu:</strong> ${tongThu.toLocaleString()} VND</p>
            <div class="table-responsive">
                <table class="table table-bordered table-sm table-hover">
                    <thead class="thead-light">
                        <tr>
                            <th>Loại phòng</th>
                            <th>Thu</th>
                            <th>Tỷ lệ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${chiTiet.map(item => `
                            <tr>
                                <td>${item.loaiPhong}</td>
                                <td>${item.thu.toLocaleString()} VND</td>
                                <td>${item.tyLe}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    `;

    return html;
}

//xử lý nghiệp vụ
function ThongKeThuThang(danhSachPhieu, thang) {
    // Lọc phiếu theo tháng
    const phieuTrongThang = danhSachPhieu.filter(phieu => {
        const thangPhieu = new Date(phieu.ngayNhanPhong).getMonth() + 1;
        const namPhieu = new Date(phieu.ngayNhanPhong).getFullYear();
        return `${namPhieu}-${String(thangPhieu).padStart(2, '0')}` === thang;
    });

    // Tổng thu
    const tongThu = phieuTrongThang.reduce((sum, p) => sum + p.tongTien, 0);

    // Gom nhóm theo loại phòng
    const thuTheoLoai = {};
    for (let p of phieuTrongThang) {
        if (!thuTheoLoai[p.loaiPhong]) {
            thuTheoLoai[p.loaiPhong] = 0;
        }
        thuTheoLoai[p.loaiPhong] += p.tongTien;
    }

    // Tính tỷ lệ theo loại phòng
    const chiTiet = Object.entries(thuTheoLoai).map(([loai, thu]) => {
        const tyLe = tongThu === 0 ? 0 : ((thu / tongThu) * 100).toFixed(2);
        return { loaiPhong: loai, thu, tyLe: tyLe + '%' };
    });

    // Lấy danh sách khu vực (ví dụ: A101 => A)
    const khuVucSet = new Set();
    for (let p of phieuTrongThang) {
        if (typeof p.soPhong === 'string' && p.soPhong.length > 0) {
            khuVucSet.add(p.soPhong[0].toUpperCase());
        }
    }
    const danhSachKhuVuc = Array.from(khuVucSet).sort();

    return {
        thang,
        tongThu,
        chiTiet,
        danhSachKhuVuc
    };
}
//xử lý nghiệp vụ
function ThongKeThuNam(danhSachPhieu, nam) {
    // Lọc phiếu theo năm
    const phieuTrongNam = danhSachPhieu.filter(phieu => {
        const namPhieu = new Date(phieu.ngayNhanPhong).getFullYear();
        return namPhieu === parseInt(nam);
    });

    // Tổng thu
    const tongThu = phieuTrongNam.reduce((sum, p) => sum + p.tongTien, 0);

    // Gom nhóm theo loại phòng
    const thuTheoLoai = {};
    for (let p of phieuTrongNam) {
        if (!thuTheoLoai[p.loaiPhong]) {
            thuTheoLoai[p.loaiPhong] = 0;
        }
        thuTheoLoai[p.loaiPhong] += p.tongTien;
    }

    // Tính tỷ lệ theo loại phòng
    const chiTiet = Object.entries(thuTheoLoai).map(([loai, thu]) => {
        const tyLe = tongThu === 0 ? 0 : ((thu / tongThu) * 100).toFixed(2);
        return { loaiPhong: loai, thu, tyLe: tyLe + '%' };
    });

    // Lấy danh sách khu vực (chữ cái đầu của số phòng)
    const khuVucSet = new Set();
    for (let p of phieuTrongNam) {
        if (typeof p.soPhong === 'string' && p.soPhong.length > 0) {
            khuVucSet.add(p.soPhong[0].toUpperCase());
        }
    }
    const danhSachKhuVuc = Array.from(khuVucSet).sort();

    return {
        nam,
        tongThu,
        chiTiet,
        danhSachKhuVuc
    };
}

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
module.exports.DocDuLieuPhongBangMaPhong = DocDuLieuPhongBangMaPhong;
module.exports.LuuPhieuThuePhong = LuuPhieuThuePhong;
module.exports.XoaPhieuThue = XoaPhieuThue;
module.exports.ThongKeThuThang = ThongKeThuThang;
module.exports.ThongKeThuNam = ThongKeThuNam;
module.exports.TaoGiaoDienThongKeThang = TaoGiaoDienThongKeThang;
module.exports.TaoGiaoDienThongKeNam = TaoGiaoDienThongKeNam;