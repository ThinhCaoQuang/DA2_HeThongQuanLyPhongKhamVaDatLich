const { LichLamViecBacSi, BacSi, TaiKhoan, NguoiDung } = require('../models');
const { Op } = require('sequelize');
const db = require('../config/database');

const LichLamViecBacSiController = {
  // Get all schedules
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 10, bacSiId, ngayLamViec } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (bacSiId) where.BacSiId = bacSiId;
      if (ngayLamViec) where.NgayLamViec = ngayLamViec;

      const { count, rows } = await LichLamViecBacSi.findAndCountAll({
        where,
        offset,
        limit: parseInt(limit),
        include: [
          { 
            model: BacSi, 
            attributes: ['BacSiId'],
            include: [
              { model: NguoiDung, attributes: ['NguoiDungId', 'HoTen', 'Email'] }
            ]
          }
        ],
        order: [['NgayLamViec', 'DESC'], ['CaLam', 'ASC']]
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
      console.error('Get all schedules error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Get schedule by ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const schedule = await LichLamViecBacSi.findOne({
        where: { LichLamViecId: id },
        include: [{ model: BacSi }]
      });

      if (!schedule) {
        return res.status(404).json({
          success: false,
          message: 'Lịch làm việc không tìm thấy'
        });
      }

      res.status(200).json({
        success: true,
        data: schedule
      });
    } catch (error) {
      console.error('Get schedule error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Create schedule
  create: async (req, res) => {
    try {
      let { BacSiId, NgayLamViec, CaLam, GioBatDau, GioKetThuc, SoBenhNhanToiDa } = req.body;
      
      console.log('Create request body:', req.body);
      console.log('Current user:', req.user);

      // If BacSi, force use their own BacSiId
      if (req.user.role === 'BacSi') {
        // Get TaiKhoan to find NguoiDungId
        const account = await TaiKhoan.findOne({
          where: { TaiKhoanId: req.user.id }
        });
        if (!account) {
          return res.status(404).json({
            success: false,
            message: 'Không tìm thấy tài khoản'
          });
        }
        
        const myBacSi = await BacSi.findOne({
          where: { NguoiDungId: account.NguoiDungId }
        });
        if (!myBacSi) {
          return res.status(404).json({
            success: false,
            message: 'Không tìm thấy hồ sơ bác sĩ của tài khoản này'
          });
        }
        // Force use their own BacSiId
        BacSiId = myBacSi.BacSiId;
        console.log('BacSi creating own schedule, forced BacSiId:', BacSiId);
      } else {
        // For non-BacSi, convert to integer
        BacSiId = parseInt(BacSiId);
      }

      console.log('Final fields after processing:', { BacSiId, NgayLamViec, CaLam, GioBatDau, GioKetThuc, SoBenhNhanToiDa });

      // Validate all required fields (now we've ensured BacSiId is set)
      if (!BacSiId || isNaN(BacSiId) || !NgayLamViec || !CaLam || !GioBatDau || !GioKetThuc) {
        console.log('Validation failed:', { 
          BacSiId: BacSiId && !isNaN(BacSiId), 
          NgayLamViec: !!NgayLamViec, 
          CaLam: !!CaLam, 
          GioBatDau: !!GioBatDau, 
          GioKetThuc: !!GioKetThuc 
        });
        return res.status(400).json({
          success: false,
          message: 'Bác sĩ, ngày làm việc, ca làm, giờ bắt đầu và giờ kết thúc không được để trống'
        });
      }

      // Check if doctor exists
      const doctor = await BacSi.findByPk(BacSiId);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Bác sĩ không tìm thấy'
        });
      }

      // Check for duplicate schedule
      const existingSchedule = await LichLamViecBacSi.findOne({
        where: {
          BacSiId: BacSiId,
          NgayLamViec: NgayLamViec,
          CaLam: CaLam
        }
      });

      if (existingSchedule) {
        return res.status(409).json({
          success: false,
          message: 'Lịch làm việc này đã tồn tại'
        });
      }

      const schedule = await LichLamViecBacSi.create({
        BacSiId: BacSiId,
        NgayLamViec: NgayLamViec,
        CaLam: CaLam,
        GioBatDau: GioBatDau,
        GioKetThuc: GioKetThuc,
        SoBenhNhanToiDa: SoBenhNhanToiDa || 10,
        TrangThai: 'HoatDong'
      });

      res.status(201).json({
        success: true,
        message: 'Tạo lịch làm việc thành công',
        data: schedule
      });
    } catch (error) {
      console.error('Create schedule error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Update schedule
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { BacSiId, NgayLamViec, CaLam, GioBatDau, GioKetThuc, SoBenhNhanToiDa, TrangThai } = req.body;

      console.log('Update request received:', { id, body: req.body });

      const schedule = await LichLamViecBacSi.findByPk(id);

      if (!schedule) {
        return res.status(404).json({
          success: false,
          message: 'Lịch làm việc không tìm thấy'
        });
      }

      // If BacSi (not QuanTri), can only update their own schedule
      if (req.user.role === 'BacSi') {
        const account = await TaiKhoan.findOne({
          where: { TaiKhoanId: req.user.id }
        });
        
        const myBacSi = await BacSi.findOne({
          where: { NguoiDungId: account.NguoiDungId }
        });

        if (!myBacSi || myBacSi.BacSiId !== schedule.BacSiId) {
          return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền thay đổi lịch làm việc của đồng nghiệp'
          });
        }
      }
      // QuanTri: can update any schedule (no restriction)

      console.log('Current schedule:', schedule.toJSON());

      // Always check for duplicate schedule (same doctor, date, and shift)
      // Format dates properly for comparison
      const newDate = NgayLamViec ? new Date(NgayLamViec).toISOString().split('T')[0] : new Date(schedule.NgayLamViec).toISOString().split('T')[0];
      const newBacSiId = BacSiId || schedule.BacSiId;
      const newCaLam = CaLam || schedule.CaLam;

      // Raw query to check for duplicate (exclude current record)
      const [existingSchedules] = await db.query(`
        SELECT LichLamViecId FROM LichLamViecBacSi 
        WHERE LichLamViecId != ? 
        AND BacSiId = ? 
        AND DATE(NgayLamViec) = ? 
        AND CaLam = ?
      `, {
        replacements: [id, newBacSiId, newDate, newCaLam]
      });

      console.log('Duplicate check result:', existingSchedules);

      if (existingSchedules && existingSchedules.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Lịch làm việc này đã tồn tại (cùng bác sĩ, cùng ngày, cùng ca)'
        });
      }

      const updateData = {
        BacSiId: BacSiId || schedule.BacSiId,
        NgayLamViec: NgayLamViec || schedule.NgayLamViec,
        CaLam: CaLam || schedule.CaLam,
        GioBatDau: GioBatDau || schedule.GioBatDau,
        GioKetThuc: GioKetThuc || schedule.GioKetThuc,
        SoBenhNhanToiDa: SoBenhNhanToiDa !== undefined ? SoBenhNhanToiDa : schedule.SoBenhNhanToiDa,
        TrangThai: TrangThai || schedule.TrangThai
      };

      console.log('Updating with data:', updateData);

      // Use raw UPDATE query to force database write
      await db.query(`
        UPDATE LichLamViecBacSi 
        SET BacSiId = ?, NgayLamViec = ?, CaLam = ?, GioBatDau = ?, GioKetThuc = ?, SoBenhNhanToiDa = ?, TrangThai = ?, UpdatedAt = NOW()
        WHERE LichLamViecId = ?
      `, {
        replacements: [
          updateData.BacSiId,
          updateData.NgayLamViec,
          updateData.CaLam,
          updateData.GioBatDau,
          updateData.GioKetThuc,
          updateData.SoBenhNhanToiDa,
          updateData.TrangThai,
          id
        ]
      });
      
      // Reload from database to ensure fresh data
      await schedule.reload();

      console.log('After update:', schedule.toJSON());

      res.status(200).json({
        success: true,
        message: 'Cập nhật lịch làm việc thành công',
        data: schedule
      });
    } catch (error) {
      console.error('Update schedule error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Delete schedule
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const schedule = await LichLamViecBacSi.findByPk(id);

      if (!schedule) {
        return res.status(404).json({
          success: false,
          message: 'Lịch làm việc không tìm thấy'
        });
      }

      // If BacSi (not QuanTri), can only delete their own schedule
      if (req.user.role === 'BacSi') {
        const account = await TaiKhoan.findOne({
          where: { TaiKhoanId: req.user.id }
        });
        
        const myBacSi = await BacSi.findOne({
          where: { NguoiDungId: account.NguoiDungId }
        });

        if (!myBacSi || myBacSi.BacSiId !== schedule.BacSiId) {
          return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền xóa lịch làm việc của đồng nghiệp'
          });
        }
      }
      // QuanTri: can delete any schedule (no restriction)

      await schedule.destroy();

      res.status(200).json({
        success: true,
        message: 'Xóa lịch làm việc thành công'
      });
    } catch (error) {
      console.error('Delete schedule error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  }
};

module.exports = LichLamViecBacSiController;
