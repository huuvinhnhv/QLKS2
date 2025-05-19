const FS = require("fs")
const PATH = require("path")

class XU_LY {
    // Xử lý Lưu trữ 
    static Doc_Khung_HTML() {
        var Chuoi_HTML = ""
        var Thu_muc_Du_lieu = "Dulieu"
        var Thu_muc_HTML = PATH.join(Thu_muc_Du_lieu, "HTML")
        var Duong_dan = PATH.join(Thu_muc_HTML, "Khung.html")
        Chuoi_HTML = FS.readFileSync(Duong_dan, "utf-8")
        return Chuoi_HTML
    }

    // Xử lý giao diện
    static Nhap_Ho_ten(req) {
        var Ho_ten = req.body.Th_Ho_ten
        return Ho_ten
    }
    static Tao_Chuoi_HTML_Nhap_lieu_Ho_ten(Ho_ten = "") {
        var Chuoi_HTML = `<form action='/Loi_chao' method='post'  >
                       <div class='form-group' >
                          <label for='Th_Ho_ten'>Họ tên</label>
                          <input name='Th_Ho_ten' id='Th_Ho_ten' value='${Ho_ten}'  autocomplete= "off" />
                       </div>
                       <button type='submit' class='btn btn-danger'>Đồng ý</button>
                    </form>`
        return Chuoi_HTML
    }
    static Tao_Chuoi_HTML_Loi_chao(Loi_chao) {
        var Chuoi_HTML = `<div class='alert alert-info'>${Loi_chao}</div>`
        return Chuoi_HTML
    }
    // Xử lý Nghiệp vụ
    static Tao_Loi_chao(Ho_ten) {
        var Loi_chao = "Xin chào " + Ho_ten
        return Loi_chao
    }

}

module.exports = XU_LY