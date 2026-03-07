const { ChuyenKhoa, BacSi } = require('../models');
const { Op } = require('sequelize');

const ChuyenKhoaController = {
  // Get all specialties
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (search) {
        where.TenChuyenKhoa = { [Op.like]: `%${search}%` };
      }

      const { count, rows } = await ChuyenKhoa.findAndCountAll({
        where,
        offset,
        limit: parseInt(limit),
        include: [
          {
            model: BacSi,
            through: { attributes: [] },
            attributes: ['BacSiId']
          }
        ],
        order: [['ChuyenKhoaId', 'DESC']]
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
      console.error('Get all specialties error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Get specialty by ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const specialty = await ChuyenKhoa.findOne({
        where: { ChuyenKhoaId: id },
        include: [
          {
            model: BacSi,
            through: { attributes: ['LaChuyenMonChinh'] }
          }
        ]
      });

      if (!specialty) {
        return res.status(404).json({
          success: false,
          message: 'Chuyên khoa không tìm thấy'
        });
      }

      res.status(200).json({
        success: true,
        data: specialty
      });
    } catch (error) {
      console.error('Get specialty error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Create specialty
  create: async (req, res) => {
    try {
      const { tenChuyenKhoa, moTa } = req.body;

      if (!tenChuyenKhoa) {
        return res.status(400).json({
          success: false,
          message: 'Tên chuyên khoa không được để trống'
        });
      }

      // Check if specialty already exists
      const existingSpecialty = await ChuyenKhoa.findOne({
        where: { TenChuyenKhoa: tenChuyenKhoa }
      });

      if (existingSpecialty) {
        return res.status(409).json({
          success: false,
          message: 'Chuyên khoa đã tồn tại'
        });
      }

      const specialty = await ChuyenKhoa.create({
        TenChuyenKhoa: tenChuyenKhoa,
        MoTa: moTa,
        TrangThai: 'HoatDong'
      });

      res.status(201).json({
        success: true,
        message: 'Tạo chuyên khoa thành công',
        data: specialty
      });
    } catch (error) {
      console.error('Create specialty error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Update specialty
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { tenChuyenKhoa, moTa, trangThai } = req.body;

      const specialty = await ChuyenKhoa.findByPk(id);

      if (!specialty) {
        return res.status(404).json({
          success: false,
          message: 'Chuyên khoa không tìm thấy'
        });
      }

      await specialty.update({
        TenChuyenKhoa: tenChuyenKhoa || specialty.TenChuyenKhoa,
        MoTa: moTa !== undefined ? moTa : specialty.MoTa,
        TrangThai: trangThai || specialty.TrangThai
      });

      res.status(200).json({
        success: true,
        message: 'Cập nhật chuyên khoa thành công',
        data: specialty
      });
    } catch (error) {
      console.error('Update specialty error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Delete specialty
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const specialty = await ChuyenKhoa.findByPk(id);

      if (!specialty) {
        return res.status(404).json({
          success: false,
          message: 'Chuyên khoa không tìm thấy'
        });
      }

      await specialty.destroy();

      res.status(200).json({
        success: true,
        message: 'Xóa chuyên khoa thành công'
      });
    } catch (error) {
      console.error('Delete specialty error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  }
};

module.exports = ChuyenKhoaController;
