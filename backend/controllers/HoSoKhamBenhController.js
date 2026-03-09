const { HoSoKhamBenh, LichKham, BenhNhan, BacSi, NguoiDung } = require('../models');
const ExportService = require('../services/ExportService');
const { Op } = require('sequelize');

// Generate medical record code
const generateMaHoSo = async () => {
  const lastRecord = await HoSoKhamBenh.findOne({
    order: [['HoSoId', 'DESC']]
  });

  const nextNumber = (lastRecord?.HoSoId || 0) + 1;
  return `HS${String(nextNumber).padStart(4, '0')}`;
};

const HoSoKhamBenhController = {
  // Get all medical records
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 10, benhNhanId, bacSiId } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (benhNhanId) where.BenhNhanId = benhNhanId;
      if (bacSiId) where.BacSiId = bacSiId;

      const { count, rows } = await HoSoKhamBenh.findAndCountAll({
        where,
        offset,
        limit: parseInt(limit),
        include: [
          { model: LichKham, attributes: ['LichKhamId', 'MaLichKham', 'ThoiGianBatDau'] },
          { model: BenhNhan, attributes: ['BenhNhanId', 'MaBenhNhan', 'HoTen'] },
          { 
            model: BacSi, 
            attributes: ['BacSiId', 'NguoiDungId'],
            include: [
              { model: NguoiDung, attributes: ['HoTen'] }
            ]
          }
        ],
        order: [['NgayKham', 'DESC']]
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
      console.error('Get all medical records error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Get medical record by ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const record = await HoSoKhamBenh.findOne({
        where: { HoSoId: id },
        include: [
          { model: LichKham },
          { model: BenhNhan },
          { 
            model: BacSi,
            include: [
              { model: NguoiDung, attributes: ['HoTen'] }
            ]
          }
        ]
      });

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Hồ sơ khám bệnh không tìm thấy'
        });
      }

      res.status(200).json({
        success: true,
        data: record
      });
    } catch (error) {
      console.error('Get medical record error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Create medical record
  create: async (req, res) => {
    try {
      const { lichKhamId, trieuChung, chanDoan, keHoachDieuTri, ketLuan, ghiChu } = req.body;

      if (!lichKhamId || !chanDoan) {
        return res.status(400).json({
          success: false,
          message: 'Lịch khám và chẩn đoán không được để trống'
        });
      }

      // Check if appointment exists and get benhNhanId, bacSiId from it
      const appointment = await LichKham.findByPk(lichKhamId);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Lịch khám không tìm thấy'
        });
      }

      // Check if record already exists for this appointment
      const existingRecord = await HoSoKhamBenh.findOne({
        where: { LichKhamId: lichKhamId }
      });

      if (existingRecord) {
        return res.status(409).json({
          success: false,
          message: 'Hồ sơ khám bệnh cho lịch khám này đã tồn tại'
        });
      }

      // Generate record code
      const maHoSo = await generateMaHoSo();

      const record = await HoSoKhamBenh.create({
        MaHoSo: maHoSo,
        LichKhamId: lichKhamId,
        BenhNhanId: appointment.BenhNhanId,
        BacSiId: appointment.BacSiId,
        TrieuChung: trieuChung || appointment.TrieuChung,
        ChanDoan: chanDoan,
        KeHoachDieuTri: keHoachDieuTri,
        KetLuan: ketLuan,
        GhiChu: ghiChu,
        NgayKham: new Date()
      });

      res.status(201).json({
        success: true,
        message: 'Tạo hồ sơ khám bệnh thành công',
        data: record
      });
    } catch (error) {
      console.error('Create medical record error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Update medical record
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { chanDoan, keHoachDieuTri, ketLuan, ghiChu } = req.body;

      const record = await HoSoKhamBenh.findByPk(id);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Hồ sơ khám bệnh không tìm thấy'
        });
      }

      await record.update({
        ChanDoan: chanDoan || record.ChanDoan,
        KeHoachDieuTri: keHoachDieuTri !== undefined ? keHoachDieuTri : record.KeHoachDieuTri,
        KetLuan: ketLuan !== undefined ? ketLuan : record.KetLuan,
        GhiChu: ghiChu !== undefined ? ghiChu : record.GhiChu,
        UpdatedAt: new Date()
      });

      res.status(200).json({
        success: true,
        message: 'Cập nhật hồ sơ khám bệnh thành công',
        data: record
      });
    } catch (error) {
      console.error('Update medical record error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Delete medical record
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const record = await HoSoKhamBenh.findByPk(id);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Hồ sơ khám bệnh không tìm thấy'
        });
      }

      await record.destroy();

      res.status(200).json({
        success: true,
        message: 'Xóa hồ sơ khám bệnh thành công'
      });
    } catch (error) {
      console.error('Delete medical record error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Xuất danh sách hồ sơ khám bệnh ra Excel
  exportToExcel: async (req, res) => {
    try {
      const { benhNhanId, bacSiId, startDate, endDate } = req.query;

      const where = {};
      if (benhNhanId) where.BenhNhanId = benhNhanId;
      if (bacSiId) where.BacSiId = bacSiId;

      if (startDate || endDate) {
        where.CreatedAt = {};
        if (startDate) where.CreatedAt[Op.gte] = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          where.CreatedAt[Op.lte] = end;
        }
      }

      const records = await HoSoKhamBenh.findAll({
        where,
        include: [
          { model: LichKham, attributes: ['LichKhamId', 'MaLichKham', 'ThoiGianBatDau'] },
          { model: BenhNhan, attributes: ['BenhNhanId', 'MaBenhNhan', 'HoTen'] },
          { 
            model: BacSi, 
            attributes: ['BacSiId', 'NguoiDungId'],
            include: [
              { model: NguoiDung, attributes: ['HoTen'] }
            ]
          }
        ],
        order: [['NgayKham', 'ASC']]
      });

      const buffer = await ExportService.exportMedicalRecordsToExcel(records, { startDate, endDate });

      const filename = `HoSoKhamBenh_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      console.error('Export medical records to Excel error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi xuất file Excel',
        error: error.message
      });
    }
  }
};

module.exports = HoSoKhamBenhController;
