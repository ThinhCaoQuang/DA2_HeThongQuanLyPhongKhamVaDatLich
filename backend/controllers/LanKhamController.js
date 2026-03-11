const { LanKham, HoSoKhamBenh, LichKham, BacSi, NguoiDung, BenhNhan, DonThuoc } = require('../models');

const generateMaLanKham = async () => {
  const last = await LanKham.findOne({ order: [['LanKhamId', 'DESC']] });
  const next = (last?.LanKhamId || 0) + 1;
  return `LK${String(next).padStart(4, '0')}`;
};

const LanKhamController = {
  // Lấy tất cả lần khám theo hồ sơ
  getByHoSo: async (req, res) => {
    try {
      const { hoSoId } = req.params;
      const list = await LanKham.findAll({
        where: { HoSoId: hoSoId },
        include: [
          { model: LichKham, attributes: ['LichKhamId', 'MaLichKham', 'ThoiGianBatDau'] },
          {
            model: BacSi,
            attributes: ['BacSiId', 'NguoiDungId'],
            include: [{ model: NguoiDung, attributes: ['HoTen'] }]
          },
          { model: DonThuoc }
        ],
        order: [['NgayKham', 'DESC']]
      });
      res.json({ success: true, data: list });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: err.message });
    }
  },

  // Tạo lần khám mới vào hồ sơ
  create: async (req, res) => {
    try {
      const { hoSoId, lichKhamId, trieuChung, chanDoan, keHoachDieuTri, ketLuan, ghiChu } = req.body;

      if (!hoSoId || !chanDoan || !trieuChung) {
        return res.status(400).json({ success: false, message: 'Hồ sơ, triệu chứng và chẩn đoán không được để trống' });
      }

      const hoSo = await HoSoKhamBenh.findByPk(hoSoId);
      if (!hoSo) {
        return res.status(404).json({ success: false, message: 'Hồ sơ không tìm thấy' });
      }

      // Nếu có lịch khám → kiểm tra trùng lặp
      if (lichKhamId) {
        const existing = await LanKham.findOne({ where: { LichKhamId: lichKhamId } });
        if (existing) {
          return res.status(409).json({
            success: false,
            message: 'Lịch khám này đã có lần khám',
            existingLanKhamId: existing.LanKhamId
          });
        }
      }

      // Lấy BacSiId từ lịch khám (nếu có)
      let bacSiId = null;
      if (lichKhamId) {
        const lichKham = await LichKham.findByPk(lichKhamId);
        bacSiId = lichKham?.BacSiId || null;
      }

      const maLanKham = await generateMaLanKham();
      const record = await LanKham.create({
        MaLanKham: maLanKham,
        HoSoId: hoSoId,
        LichKhamId: lichKhamId || null,
        BacSiId: bacSiId,
        TrieuChung: trieuChung,
        ChanDoan: chanDoan,
        KeHoachDieuTri: keHoachDieuTri || null,
        KetLuan: ketLuan || null,
        GhiChu: ghiChu || null,
        NgayKham: new Date()
      });

      res.status(201).json({ success: true, message: 'Tạo lần khám thành công', data: record });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: err.message });
    }
  },

  // Cập nhật lần khám
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { trieuChung, chanDoan, keHoachDieuTri, ketLuan, ghiChu } = req.body;

      const record = await LanKham.findByPk(id);
      if (!record) return res.status(404).json({ success: false, message: 'Lần khám không tìm thấy' });

      await record.update({
        TrieuChung: trieuChung || record.TrieuChung,
        ChanDoan: chanDoan || record.ChanDoan,
        KeHoachDieuTri: keHoachDieuTri !== undefined ? keHoachDieuTri : record.KeHoachDieuTri,
        KetLuan: ketLuan !== undefined ? ketLuan : record.KetLuan,
        GhiChu: ghiChu !== undefined ? ghiChu : record.GhiChu,
        UpdatedAt: new Date()
      });

      res.json({ success: true, message: 'Cập nhật lần khám thành công', data: record });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: err.message });
    }
  },

  // Xóa lần khám
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const record = await LanKham.findByPk(id);
      if (!record) return res.status(404).json({ success: false, message: 'Lần khám không tìm thấy' });
      await record.destroy();
      res.json({ success: true, message: 'Xóa lần khám thành công' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: err.message });
    }
  },

  // Lấy tất cả lần khám (dùng cho combobox DonThuoc)
  getAll: async (req, res) => {
    try {
      const { limit = 1000 } = req.query;
      const list = await LanKham.findAll({
        limit: parseInt(limit),
        include: [
          {
            model: HoSoKhamBenh,
            attributes: ['HoSoId', 'MaHoSo'],
            include: [{ model: BenhNhan, attributes: ['HoTen', 'MaBenhNhan'] }]
          }
        ],
        order: [['NgayKham', 'DESC']]
      });
      res.json({ success: true, data: list });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: err.message });
    }
  }
};

module.exports = LanKhamController;
