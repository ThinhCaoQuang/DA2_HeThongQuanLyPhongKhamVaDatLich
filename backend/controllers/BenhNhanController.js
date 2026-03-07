const { BenhNhan, LichKham, ChuyenKhoa, BacSi } = require('../models');
const { Op } = require('sequelize');

// Generate patient code
const generateMaBenhNhan = async () => {
  const lastPatient = await BenhNhan.findOne({
    order: [['BenhNhanId', 'DESC']]
  });

  const nextNumber = (lastPatient?.BenhNhanId || 0) + 1;
  return `P${String(nextNumber).padStart(4, '0')}`;
};

const BenhNhanController = {
  // Get all patients
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (search) {
        where[Op.or] = [
          { HoTen: { [Op.like]: `%${search}%` } },
          { DienThoai: { [Op.like]: `%${search}%` } },
          { Email: { [Op.like]: `%${search}%` } },
          { MaBenhNhan: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows } = await BenhNhan.findAndCountAll({
        where,
        offset,
        limit: parseInt(limit),
        order: [['BenhNhanId', 'DESC']]
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
      console.error('Get all patients error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Get patient by ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const patient = await BenhNhan.findOne({
        where: { BenhNhanId: id },
        include: [
          {
            model: LichKham,
            attributes: ['LichKhamId', 'MaLichKham', 'ThoiGianBatDau', 'ThoiGianKetThuc', 'TrieuChung', 'TrangThai'],
            include: [
              { model: BacSi, attributes: ['BacSiId', 'NguoiDungId'] },
              { model: ChuyenKhoa, attributes: ['ChuyenKhoaId', 'TenChuyenKhoa'] }
            ]
          }
        ]
      });

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Bệnh nhân không tìm thấy'
        });
      }

      res.status(200).json({
        success: true,
        data: patient
      });
    } catch (error) {
      console.error('Get patient error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Create patient
  create: async (req, res) => {
    try {
      const { hoTen, ngaySinh, gioiTinh, dienThoai, email, diaChi, thanhPho, tieuSuBenhLy, diUng, cccd } = req.body;

      if (!hoTen || !dienThoai) {
        return res.status(400).json({
          success: false,
          message: 'Họ tên và số điện thoại không được để trống'
        });
      }

      // Generate patient code
      const maBenhNhan = await generateMaBenhNhan();

      const patient = await BenhNhan.create({
        MaBenhNhan: maBenhNhan,
        HoTen: hoTen,
        NgaySinh: ngaySinh,
        GioiTinh: gioiTinh || 'Khac',
        DienThoai: dienThoai,
        Email: email,
        DiaChi: diaChi,
        ThanhPho: thanhPho,
        TienSuBenhLy: tieuSuBenhLy,
        DiUng: diUng,
        CCCD: cccd,
        TrangThai: 'HoatDong'
      });

      res.status(201).json({
        success: true,
        message: 'Tạo bệnh nhân thành công',
        data: patient
      });
    } catch (error) {
      console.error('Create patient error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Update patient
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { hoTen, ngaySinh, gioiTinh, dienThoai, email, diaChi, thanhPho, tieuSuBenhLy, diUng, trangThai, cccd } = req.body;

      const patient = await BenhNhan.findByPk(id);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Bệnh nhân không tìm thấy'
        });
      }

      await patient.update({
        HoTen: hoTen || patient.HoTen,
        NgaySinh: ngaySinh || patient.NgaySinh,
        GioiTinh: gioiTinh || patient.GioiTinh,
        DienThoai: dienThoai || patient.DienThoai,
        Email: email || patient.Email,
        DiaChi: diaChi || patient.DiaChi,
        ThanhPho: thanhPho || patient.ThanhPho,
        TienSuBenhLy: tieuSuBenhLy !== undefined ? tieuSuBenhLy : patient.TienSuBenhLy,
        DiUng: diUng !== undefined ? diUng : patient.DiUng,
        CCCD: cccd || patient.CCCD,
        TrangThai: trangThai || patient.TrangThai
      });

      res.status(200).json({
        success: true,
        message: 'Cập nhật bệnh nhân thành công',
        data: patient
      });
    } catch (error) {
      console.error('Update patient error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Delete patient
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const patient = await BenhNhan.findByPk(id);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Bệnh nhân không tìm thấy'
        });
      }

      await patient.destroy();

      res.status(200).json({
        success: true,
        message: 'Xóa bệnh nhân thành công'
      });
    } catch (error) {
      console.error('Delete patient error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  }
};

module.exports = BenhNhanController;
