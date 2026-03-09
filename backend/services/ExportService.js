const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

class ExportService {
  /**
   * Xuất danh sách lịch khám ra Excel
   */
  static async exportAppointmentsToExcel(appointments, filters = {}) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Lịch Khám');

    // Thiết lập thông tin file
    workbook.creator = 'Hệ Thống Quản Lý Phòng Khám';
    workbook.created = new Date();

    // Định dạng header
    worksheet.columns = [
      { header: 'Mã Lịch', key: 'maLichKham', width: 15 },
      { header: 'Bệnh Nhân', key: 'tenBenhNhan', width: 25 },
      { header: 'Số Điện Thoại', key: 'dienThoai', width: 15 },
      { header: 'Bác Sĩ', key: 'tenBacSi', width: 25 },
      { header: 'Chuyên Khoa', key: 'chuyenKhoa', width: 20 },
      { header: 'Ngày Khám', key: 'ngayKham', width: 15 },
      { header: 'Giờ Khám', key: 'gioKham', width: 12 },
      { header: 'Triệu Chứng', key: 'trieuChung', width: 30 },
      { header: 'Trạng Thái', key: 'trangThai', width: 15 },
      { header: 'Ghi Chú', key: 'ghiChu', width: 30 }
    ];

    // Style cho header
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 25;

    // Thêm dữ liệu
    appointments.forEach(apt => {
      const thoiGian = new Date(apt.ThoiGianBatDau);
      
      worksheet.addRow({
        maLichKham: apt.MaLichKham || '-',
        tenBenhNhan: apt.BenhNhan?.HoTen || '-',
        dienThoai: apt.BenhNhan?.DienThoai || '-',
        tenBacSi: apt.BacSi?.NguoiDung?.HoTen || 'Chưa chọn',
        chuyenKhoa: apt.ChuyenKhoa?.TenChuyenKhoa || '-',
        ngayKham: thoiGian.toLocaleDateString('vi-VN'),
        gioKham: thoiGian.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        trieuChung: apt.TrieuChung || '-',
        trangThai: this.getStatusText(apt.TrangThai),
        ghiChu: apt.GhiChu || '-'
      });
    });

    // Thêm borders cho tất cả cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Thêm thông tin bộ lọc ở cuối
    if (Object.keys(filters).length > 0) {
      const lastRow = worksheet.rowCount + 2;
      worksheet.getCell(`A${lastRow}`).value = 'Bộ lọc áp dụng:';
      worksheet.getCell(`A${lastRow}`).font = { bold: true };
      
      let filterRow = lastRow + 1;
      if (filters.startDate) {
        worksheet.getCell(`A${filterRow}`).value = `Từ ngày: ${new Date(filters.startDate).toLocaleDateString('vi-VN')}`;
        filterRow++;
      }
      if (filters.endDate) {
        worksheet.getCell(`A${filterRow}`).value = `Đến ngày: ${new Date(filters.endDate).toLocaleDateString('vi-VN')}`;
        filterRow++;
      }
      if (filters.status) {
        worksheet.getCell(`A${filterRow}`).value = `Trạng thái: ${this.getStatusText(filters.status)}`;
      }
    }

    // Tạo buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  /**
   * Xuất hồ sơ khám bệnh ra Excel
   */
  static async exportMedicalRecordsToExcel(records, filters = {}) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Hồ Sơ Khám Bệnh');

    workbook.creator = 'Hệ Thống Quản Lý Phòng Khám';
    workbook.created = new Date();

    worksheet.columns = [
      { header: 'Mã Hồ Sơ', key: 'maHoSo', width: 15 },
      { header: 'Bệnh Nhân', key: 'tenBenhNhan', width: 25 },
      { header: 'Bác Sĩ', key: 'tenBacSi', width: 25 },
      { header: 'Ngày Khám', key: 'ngayKham', width: 15 },
      { header: 'Chẩn Đoán', key: 'chanDoan', width: 35 },
      { header: 'Kết Luận', key: 'ketLuan', width: 35 },
      { header: 'Ghi Chú', key: 'ghiChu', width: 30 }
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF28a745' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 25;

    records.forEach(record => {
      worksheet.addRow({
        maHoSo: record.MaHoSo || '-',
        tenBenhNhan: record.BenhNhan?.HoTen || '-',
        tenBacSi: record.BacSi?.NguoiDung?.HoTen || '-',
        ngayKham: new Date(record.CreatedAt).toLocaleDateString('vi-VN'),
        chanDoan: record.ChanDoan || '-',
        ketLuan: record.KetLuan || '-',
        ghiChu: record.GhiChu || '-'
      });
    });

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  /**
   * Xuất đơn thuốc ra PDF
   */
  static async exportPrescriptionToPDF(prescription) {
    let browser = null;
    
    try {
      // Tính tuổi bệnh nhân
      const calculateAge = (birthDate) => {
        if (!birthDate) return null;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        return age;
      };

      const age = calculateAge(prescription.BenhNhan?.NgaySinh);

      // Escape HTML
      const escapeHtml = (text) => {
        if (!text) return 'N/A';
        return String(text)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      };

      // Read template
      const templatePath = path.join(__dirname, '..', 'views', 'prescription-template.html');
      let htmlContent = fs.readFileSync(templatePath, 'utf8');

      // Generate medicine list HTML
      const medicineListHtml = prescription.ChiTiet && prescription.ChiTiet.length > 0 
        ? prescription.ChiTiet.map((med, idx) => `
            <div class="medicine-item">
              <div class="medicine-name">${idx + 1}. ${escapeHtml(med.TenThuoc)}${med.LieuLuong ? ' - ' + escapeHtml(med.LieuLuong) : ''}</div>
              <div class="medicine-details">
                ${med.SoLuong ? `<div><strong>Số lượng:</strong> ${escapeHtml(med.SoLuong)} ${escapeHtml(med.DonVi || 'viên')}</div>` : ''}
                ${med.HuongDanSuDung ? `<div><strong>Cách dùng:</strong> ${escapeHtml(med.HuongDanSuDung)}</div>` : ''}
                ${med.ThoiGianDung ? `<div><strong>Thời gian dùng:</strong> ${escapeHtml(med.ThoiGianDung)}</div>` : ''}
              </div>
            </div>
          `).join('')
        : '<p>Không có danh sách thuốc</p>';

      // Generate notes section
      const notesSection = prescription.GhiChu 
        ? `<div class="notes-section">
             <h2>GHI CHÚ</h2>
             <div class="notes-content">${escapeHtml(prescription.GhiChu)}</div>
           </div>`
        : '';

      // Generate signature date
      const signatureDate = `Ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`;

      // Replace template variables
      htmlContent = htmlContent
        .replace(/{{MaDonThuoc}}/g, escapeHtml(prescription.MaDonThuoc))
        .replace(/{{BenhNhanHoTen}}/g, escapeHtml(prescription.BenhNhan?.HoTen))
        .replace(/{{BenhNhanNgaySinh}}/g, prescription.BenhNhan?.NgaySinh ? new Date(prescription.BenhNhan.NgaySinh).toLocaleDateString('vi-VN') : 'N/A')
        .replace(/{{BenhNhanTuoi}}/g, age ? age + ' tuổi' : 'N/A')
        .replace(/{{BenhNhanGioiTinh}}/g, escapeHtml(prescription.BenhNhan?.GioiTinh))
        .replace(/{{BenhNhanDienThoai}}/g, escapeHtml(prescription.BenhNhan?.DienThoai))
        .replace(/{{MaHoSo}}/g, escapeHtml(prescription.MaHoSo))
        .replace(/{{NgayKham}}/g, prescription.NgayKham ? new Date(prescription.NgayKham).toLocaleDateString('vi-VN') : 'N/A')
        .replace(/{{BacSiHoTen}}/g, escapeHtml(prescription.BacSi?.NguoiDung?.HoTen))
        .replace(/{{MedicineList}}/g, medicineListHtml)
        .replace(/{{NotesSection}}/g, notesSection)
        .replace(/{{SignatureDate}}/g, signatureDate);

      // Find Chrome executable
      const findChrome = () => {
        const possiblePaths = [
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files\\Brave\\Application\\brave.exe',
          'C:\\Program Files (x86)\\Brave\\Application\\brave.exe',
          process.env.CHROME_PATH,
        ];

        for (const chromePath of possiblePaths) {
          if (chromePath && fs.existsSync(chromePath)) {
            return chromePath;
          }
        }
        
        throw new Error('Không tìm thấy Chrome/Brave browser');
      };

      browser = await puppeteer.launch({
        executablePath: findChrome(),
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      });

      const page = await browser.newPage();
      
      // Convert HTML to base64 data URL to bypass file encoding issues
      const base64Html = Buffer.from(htmlContent, 'utf8').toString('base64');
      const dataUrl = `data:text/html;charset=utf-8;base64,${base64Html}`;
      
      await page.goto(dataUrl, { 
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        printBackground: true,
        preferCSSPageSize: true
      });

      await browser.close();
      browser = null;

      return pdfBuffer;
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Cleanup on error
      if (browser) {
        try { await browser.close(); } catch (e) {}
      }
      
      throw error;
    }
  }

  /**
   * Helper: Chuyển đổi trạng thái sang tiếng Việt
   */
  static getStatusText(status) {
    const statusMap = {
      'ChoXacNhan': 'Chờ xác nhận',
      'DaXacNhan': 'Đã xác nhận',
      'DaKham': 'Đã khám',
      'DaHuy': 'Đã hủy'
    };
    return statusMap[status] || status;
  }
}

module.exports = ExportService;
