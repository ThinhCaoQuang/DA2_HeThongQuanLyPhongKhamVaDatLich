  const { DonThuoc, DonThuocChiTiet, HoSoKhamBenh, BenhNhan, BacSi, NguoiDung } = require('../models');
const ExportService = require('../services/ExportService');

// Generate prescription code
const generateMaDonThuoc = async () => {
  const lastRecord = await DonThuoc.findOne({
    order: [['DonThuocId', 'DESC']]
  });

  const nextNumber = (lastRecord?.DonThuocId || 0) + 1;
  return `DT${String(nextNumber).padStart(4, '0')}`;
};

const DonThuocController = {
  // Get all prescriptions
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 10, hoSoId, maDonThuoc } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (hoSoId) where.HoSoId = hoSoId;
      if (maDonThuoc) where.MaDonThuoc = maDonThuoc;

      const { count, rows } = await DonThuoc.findAndCountAll({
        where,
        offset,
        limit: parseInt(limit),
        include: [
          {
            model: HoSoKhamBenh,
            attributes: ['HoSoId', 'MaHoSo', 'NgayKham'],
            include: [
              { model: BenhNhan, attributes: ['BenhNhanId', 'MaBenhNhan', 'HoTen', 'DienThoai', 'NgaySinh', 'GioiTinh'] },
              { model: BacSi, attributes: ['BacSiId', 'NguoiDungId'], include: [{ association: 'NguoiDung', attributes: ['HoTen'] }] }
            ]
          },
          { model: DonThuocChiTiet }
        ],
        order: [['CreatedAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Get all prescriptions error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Get prescription by ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const record = await DonThuoc.findOne({
        where: { DonThuocId: id },
        include: [
          {
            model: HoSoKhamBenh,
            attributes: ['HoSoId', 'MaHoSo', 'NgayKham'],
            include: [
              { model: BenhNhan, attributes: ['BenhNhanId', 'MaBenhNhan', 'HoTen', 'DienThoai', 'NgaySinh', 'GioiTinh'] },
              { model: BacSi, attributes: ['BacSiId', 'NguoiDungId'], include: [{ association: 'NguoiDung', attributes: ['HoTen'] }] }
            ]
          },
          { model: DonThuocChiTiet }
        ]
      });

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Đơn thuốc không tìm thấy'
        });
      }

      res.status(200).json({
        success: true,
        data: record
      });
    } catch (error) {
      console.error('Get prescription error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Create prescription
  create: async (req, res) => {
    try {
      const { hoSoId, chiTiet, ghiChu } = req.body;

      if (!hoSoId || !chiTiet || !Array.isArray(chiTiet) || chiTiet.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Hồ sơ khám bệnh và chi tiết đơn thuốc không được để trống'
        });
      }

      // Check if medical record exists
      const record = await HoSoKhamBenh.findByPk(hoSoId);
      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Hồ sơ khám bệnh không tìm thấy'
        });
      }

      // Check if prescription already exists for this record
      const existingPrescription = await DonThuoc.findOne({
        where: { HoSoId: hoSoId }
      });

      if (existingPrescription) {
        return res.status(409).json({
          success: false,
          message: 'Đơn thuốc cho hồ sơ khám bệnh này đã tồn tại'
        });
      }

      // Generate prescription code
      const maDonThuoc = await generateMaDonThuoc();

      // Create prescription
      const prescription = await DonThuoc.create({
        MaDonThuoc: maDonThuoc,
        HoSoId: hoSoId,
        GhiChu: ghiChu || null
      });

      // Create prescription details
      const details = await Promise.all(
        chiTiet.map(item =>
          DonThuocChiTiet.create({
            DonThuocId: prescription.DonThuocId,
            TenThuoc: item.tenThuoc,
            LieuLuong: item.lieuLuong || null,
            SoLuong: item.soLuong || null,
            DonVi: item.donVi || null,
            HuongDanSuDung: item.huongDanSuDung || null,
            ThoiGianDung: item.thoiGianDung || null
          })
        )
      );

      const result = await DonThuoc.findByPk(prescription.DonThuocId, {
        include: [DonThuocChiTiet]
      });

      res.status(201).json({
        success: true,
        message: 'Tạo đơn thuốc thành công',
        data: result
      });
    } catch (error) {
      console.error('Create prescription error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Update prescription
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { chiTiet, ghiChu } = req.body;

      const prescription = await DonThuoc.findByPk(id);

      if (!prescription) {
        return res.status(404).json({
          success: false,
          message: 'Đơn thuốc không tìm thấy'
        });
      }

      // Update prescription
      await prescription.update({
        GhiChu: ghiChu || prescription.GhiChu
      });

      // Delete old details if new ones provided
      if (chiTiet && Array.isArray(chiTiet)) {
        await DonThuocChiTiet.destroy({ where: { DonThuocId: id } });

        // Create new details
        await Promise.all(
          chiTiet.map(item =>
            DonThuocChiTiet.create({
              DonThuocId: id,
              TenThuoc: item.tenThuoc,
              LieuLuong: item.lieuLuong || null,
              SoLuong: item.soLuong || null,
              DonVi: item.donVi || null,
              HuongDanSuDung: item.huongDanSuDung || null,
              ThoiGianDung: item.thoiGianDung || null
            })
          )
        );
      }

      const result = await DonThuoc.findByPk(id, {
        include: [DonThuocChiTiet]
      });

      res.status(200).json({
        success: true,
        message: 'Cập nhật đơn thuốc thành công',
        data: result
      });
    } catch (error) {
      console.error('Update prescription error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Delete prescription
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const prescription = await DonThuoc.findByPk(id);

      if (!prescription) {
        return res.status(404).json({
          success: false,
          message: 'Đơn thuốc không tìm thấy'
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
