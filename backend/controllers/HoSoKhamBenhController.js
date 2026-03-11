const { HoSoKhamBenh, LanKham, LichKham, BenhNhan, BacSi, NguoiDung, DonThuoc, DonThuocChiTiet } = require('../models');
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
  // Lấy tất cả hồ sơ (1 per bệnh nhân), kèm danh sách lần khám
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 10, benhNhanId } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (benhNhanId) where.BenhNhanId = benhNhanId;

      const { count, rows } = await HoSoKhamBenh.findAndCountAll({
        where,
        offset,
        limit: parseInt(limit),
        include: [
          { model: BenhNhan, attributes: ['BenhNhanId', 'MaBenhNhan', 'HoTen', 'NgaySinh', 'GioiTinh', 'DienThoai'] },
          {
            model: LanKham,
            include: [
              { model: LichKham, attributes: ['LichKhamId', 'MaLichKham', 'ThoiGianBatDau'] },
              {
                model: BacSi,
                attributes: ['BacSiId', 'NguoiDungId'],
                include: [{ model: NguoiDung, attributes: ['HoTen'] }]
              },
              { model: DonThuoc, include: [{ model: DonThuocChiTiet }] }
            ]
          }
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
      console.error('Get all medical records error:', error);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
  },

  // Lấy hồ sơ theo ID (kèm toàn bộ lịch sử lần khám)
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const record = await HoSoKhamBenh.findOne({
        where: { HoSoId: id },
        include: [
          { model: BenhNhan },
          {
            model: LanKham,
            include: [
              { model: LichKham },
              { model: BacSi, include: [{ model: NguoiDung, attributes: ['HoTen'] }] },
              { model: DonThuoc, include: [{ model: DonThuocChiTiet }] }
            ]
          }
        ]
      });

      if (!record) return res.status(404).json({ success: false, message: 'Hồ sơ không tìm thấy' });
      res.status(200).json({ success: true, data: record });
    } catch (error) {
      console.error('Get medical record error:', error);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
  },

  // Tạo hồ sơ mới cho bệnh nhân (1 per bệnh nhân)
  create: async (req, res) => {
    try {
      const { benhNhanId, ghiChu } = req.body;

      if (!benhNhanId) {
        return res.status(400).json({ success: false, message: 'Bệnh nhân không được để trống' });
      }

      const benhNhan = await BenhNhan.findByPk(benhNhanId);
      if (!benhNhan) return res.status(404).json({ success: false, message: 'Bệnh nhân không tìm thấy' });

      const existing = await HoSoKhamBenh.findOne({ where: { BenhNhanId: benhNhanId } });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Bệnh nhân này đã có hồ sơ khám bệnh',
          existingHoSoId: existing.HoSoId
        });
      }

      const maHoSo = await generateMaHoSo();
      const record = await HoSoKhamBenh.create({ MaHoSo: maHoSo, BenhNhanId: benhNhanId, GhiChu: ghiChu || null });
      res.status(201).json({ success: true, message: 'Tạo hồ sơ thành công', data: record });
    } catch (error) {
      console.error('Create medical record error:', error);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
  },

  // Tìm hoặc tạo hồ sơ cho bệnh nhân (workflow từ LichKhamCuaToi)
  findOrCreate: async (req, res) => {
    try {
      const { benhNhanId } = req.body;
      if (!benhNhanId) return res.status(400).json({ success: false, message: 'Thiếu benhNhanId' });

      const benhNhan = await BenhNhan.findByPk(benhNhanId);
      if (!benhNhan) return res.status(404).json({ success: false, message: 'Bệnh nhân không tìm thấy' });

      let hoSo = await HoSoKhamBenh.findOne({ where: { BenhNhanId: benhNhanId } });
      let created = false;

      if (!hoSo) {
        const maHoSo = await generateMaHoSo();
        hoSo = await HoSoKhamBenh.create({ MaHoSo: maHoSo, BenhNhanId: benhNhanId });
        created = true;
      }

      res.json({ success: true, created, data: hoSo });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
  },

  // Cập nhật ghi chú tổng quát hồ sơ
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { ghiChu } = req.body;

      const record = await HoSoKhamBenh.findByPk(id);
      if (!record) return res.status(404).json({ success: false, message: 'Hồ sơ không tìm thấy' });

      await record.update({ GhiChu: ghiChu !== undefined ? ghiChu : record.GhiChu, UpdatedAt: new Date() });
      res.status(200).json({ success: true, message: 'Cập nhật hồ sơ thành công', data: record });
    } catch (error) {
      console.error('Update medical record error:', error);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
  },

  // Xóa hồ sơ (cascade xóa tất cả lần khám)
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const record = await HoSoKhamBenh.findByPk(id);
      if (!record) return res.status(404).json({ success: false, message: 'Hồ sơ không tìm thấy' });
      await record.destroy();
      res.status(200).json({ success: true, message: 'Xóa hồ sơ thành công' });
    } catch (error) {
      console.error('Delete medical record error:', error);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
  }
};

module.exports = HoSoKhamBenhController;
