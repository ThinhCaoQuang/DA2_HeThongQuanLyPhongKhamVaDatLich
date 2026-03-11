const { DonThuoc, DonThuocChiTiet, LanKham, HoSoKhamBenh, BenhNhan, BacSi, NguoiDung } = require('../models');
const ExportService = require('../services/ExportService');

// Generate prescription code
const generateMaDonThuoc = async () => {
  const lastRecord = await DonThuoc.findOne({
    order: [['DonThuocId', 'DESC']]
  });

  const nextNumber = (lastRecord?.DonThuocId || 0) + 1;
  return `DT${String(nextNumber).padStart(4, '0')}`;
};

// Helper include để lấy thông tin BenhNhan và BacSi qua LanKham → HoSoKhamBenh → BenhNhan
const lanKhamInclude = {
  model: LanKham,
  attributes: ['LanKhamId', 'MaLanKham', 'NgayKham', 'ChanDoan'],
  include: [
    {
      model: HoSoKhamBenh,
      attributes: ['HoSoId', 'MaHoSo'],
      include: [{ model: BenhNhan, attributes: ['BenhNhanId', 'MaBenhNhan', 'HoTen', 'DienThoai', 'NgaySinh', 'GioiTinh'] }]
    },
    { model: BacSi, attributes: ['BacSiId', 'NguoiDungId'], include: [{ model: NguoiDung, attributes: ['HoTen'] }] }
  ]
};

const DonThuocController = {
  // Get all prescriptions
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 10, lanKhamId, maDonThuoc } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (lanKhamId) where.LanKhamId = lanKhamId;
      if (maDonThuoc) where.MaDonThuoc = maDonThuoc;

      const { count, rows } = await DonThuoc.findAndCountAll({
        where,
        offset,
        limit: parseInt(limit),
        include: [lanKhamInclude, { model: DonThuocChiTiet }],
        order: [['CreatedAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: rows,
        pagination: { total: count, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(count / limit) }
      });
    } catch (error) {
      console.error('Get all prescriptions error:', error);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
  },

  // Get prescription by ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const record = await DonThuoc.findOne({
        where: { DonThuocId: id },
        include: [lanKhamInclude, { model: DonThuocChiTiet }]
      });

      if (!record) return res.status(404).json({ success: false, message: 'Đơn thuốc không tìm thấy' });
      res.status(200).json({ success: true, data: record });
    } catch (error) {
      console.error('Get prescription error:', error);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
  },

  // Create prescription
  create: async (req, res) => {
    try {
      const { lanKhamId, chiTiet, ghiChu } = req.body;

      if (!lanKhamId || !chiTiet || !Array.isArray(chiTiet) || chiTiet.length === 0) {
        return res.status(400).json({ success: false, message: 'Lần khám và chi tiết đơn thuốc không được để trống' });
      }

      const lanKham = await LanKham.findByPk(lanKhamId);
      if (!lanKham) return res.status(404).json({ success: false, message: 'Lần khám không tìm thấy' });

      const existingPrescription = await DonThuoc.findOne({ where: { LanKhamId: lanKhamId } });
      if (existingPrescription) {
        return res.status(409).json({ success: false, message: 'Đơn thuốc cho lần khám này đã tồn tại' });
      }

      const maDonThuoc = await generateMaDonThuoc();
      const prescription = await DonThuoc.create({ MaDonThuoc: maDonThuoc, LanKhamId: lanKhamId, GhiChu: ghiChu || null });

      await Promise.all(
        chiTiet.map(item => DonThuocChiTiet.create({
          DonThuocId: prescription.DonThuocId,
          TenThuoc: item.tenThuoc,
          LieuLuong: item.lieuLuong || null,
          SoLuong: item.soLuong || null,
          DonVi: item.donVi || null,
          HuongDanSuDung: item.huongDanSuDung || null,
          ThoiGianDung: item.thoiGianDung || null
        }))
      );

      const result = await DonThuoc.findByPk(prescription.DonThuocId, { include: [DonThuocChiTiet] });
      res.status(201).json({ success: true, message: 'Tạo đơn thuốc thành công', data: result });
    } catch (error) {
      console.error('Create prescription error:', error);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
  },

  // Update prescription
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { chiTiet, ghiChu } = req.body;

      const prescription = await DonThuoc.findByPk(id);
      if (!prescription) return res.status(404).json({ success: false, message: 'Đơn thuốc không tìm thấy' });

      await prescription.update({ GhiChu: ghiChu !== undefined ? ghiChu : prescription.GhiChu });

      if (chiTiet && Array.isArray(chiTiet)) {
        await DonThuocChiTiet.destroy({ where: { DonThuocId: id } });
        await Promise.all(
          chiTiet.map(item => DonThuocChiTiet.create({
            DonThuocId: id,
            TenThuoc: item.tenThuoc,
            LieuLuong: item.lieuLuong || null,
            SoLuong: item.soLuong || null,
            DonVi: item.donVi || null,
            HuongDanSuDung: item.huongDanSuDung || null,
            ThoiGianDung: item.thoiGianDung || null
          }))
        );
      }

      const result = await DonThuoc.findByPk(id, { include: [DonThuocChiTiet] });
      res.status(200).json({ success: true, message: 'Cập nhật đơn thuốc thành công', data: result });
    } catch (error) {
      console.error('Update prescription error:', error);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
  },

  // Delete prescription
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const prescription = await DonThuoc.findByPk(id);
      if (!prescription) {
        return res.status(404).json({ success: false, message: 'Đơn thuốc không tìm thấy'
        });
      }

      await prescription.destroy();

      res.status(200).json({
        success: true,
        message: 'Xóa đơn thuốc thành công'
      });
    } catch (error) {
      console.error('Delete prescription error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Xuất đơn thuốc ra PDF
  exportToPDF: async (req, res) => {
    try {
      const { id } = req.params;

      const prescription = await DonThuoc.findByPk(id, {
        include: [
          {
            model: HoSoKhamBenh,
            attributes: ['HoSoId', 'MaHoSo', 'NgayKham'],
            include: [
              { model: BenhNhan, attributes: ['BenhNhanId', 'HoTen', 'NgaySinh', 'GioiTinh', 'DienThoai'] },
              { model: BacSi, attributes: ['BacSiId'], include: [{ model: NguoiDung, attributes: ['HoTen'] }] }
            ]
          },
          { model: DonThuocChiTiet }
        ]
      });

      if (!prescription) {
        return res.status(404).json({
          success: false,
          message: 'Đơn thuốc không tìm thấy'
        });
      }

      // Chuẩn bị dữ liệu cho PDF
      const pdfData = {
        MaDonThuoc: prescription.MaDonThuoc,
        MaHoSo: prescription.HoSoKhamBenh?.MaHoSo,
        NgayKham: prescription.HoSoKhamBenh?.NgayKham,
        CreatedAt: prescription.CreatedAt,
        GhiChu: prescription.GhiChu,
        BenhNhan: prescription.HoSoKhamBenh?.BenhNhan,
        BacSi: prescription.HoSoKhamBenh?.BacSi,
        ChiTiet: prescription.DonThuocChiTiets || []
      };

      const buffer = await ExportService.exportPrescriptionToPDF(pdfData);

      const filename = `DonThuoc_${prescription.MaDonThuoc}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      console.error('Export prescription to PDF error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi xuất file PDF',
        error: error.message
      });
    }
  }
};

module.exports = DonThuocController;
