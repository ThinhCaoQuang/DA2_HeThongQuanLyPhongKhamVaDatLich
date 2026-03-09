const {
  LichKham,
  LichLamViecBacSi,
  BacSi,
  BenhNhan,
  ChuyenKhoa,
  HoSoKhamBenh,
  NguoiDung
} = require('../models');
const { Op } = require('sequelize');
const ThongBaoController = require('./ThongBaoController');
const ExportService = require('../services/ExportService');

// Generate appointment code
const generateMaLichKham = async () => {
  const lastAppointment = await LichKham.findOne({
    order: [['LichKhamId', 'DESC']]
  });

  const nextNumber = (lastAppointment?.LichKhamId || 0) + 1;
  return `LK${String(nextNumber).padStart(4, '0')}`;
};

const LichKhamController = {
  // Get all appointments
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 10, status, benhNhanId, bacSiId } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (status) where.TrangThai = status;
      if (benhNhanId) where.BenhNhanId = benhNhanId;
      if (bacSiId) where.BacSiId = bacSiId;

      const { count, rows } = await LichKham.findAndCountAll({
        where,
        offset,
        limit: parseInt(limit),
        include: [
          { model: BenhNhan, attributes: ['BenhNhanId', 'MaBenhNhan', 'HoTen', 'DienThoai'] },
          { 
            model: BacSi,
            include: [
              { model: NguoiDung, attributes: ['NguoiDungId', 'HoTen', 'Email'] }
            ]
          },
          { model: ChuyenKhoa, attributes: ['ChuyenKhoaId', 'TenChuyenKhoa'] }
        ],
        order: [['ThoiGianBatDau', 'DESC']]
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
      console.error('Get all appointments error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Get appointment by ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const appointment = await LichKham.findOne({
        where: { LichKhamId: id },
        include: [
          { model: BenhNhan, attributes: ['BenhNhanId', 'MaBenhNhan', 'HoTen', 'DienThoai'] },
          { 
            model: BacSi,
            include: [
              { model: NguoiDung, attributes: ['NguoiDungId', 'HoTen', 'Email'] }
            ]
          },
          { model: ChuyenKhoa, attributes: ['ChuyenKhoaId', 'TenChuyenKhoa'] }
        ]
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Lịch khám không tìm thấy'
        });
      }

      res.status(200).json({
        success: true,
        data: appointment
      });
    } catch (error) {
      console.error('Get appointment error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Create appointment
  create: async (req, res) => {
    try {
      const {
        BenhNhanId,
        BacSiId,
        ChuyenKhoaId,
        ThoiGianBatDau,
        ThoiGianKetThuc,
        TrieuChung,
        GhiChu
      } = req.body;

      // Validate input
      if (!BenhNhanId || !ChuyenKhoaId || !ThoiGianBatDau) {
        return res.status(400).json({
          success: false,
          message: 'Bệnh nhân, chuyên khoa và thời gian bắt đầu không được để trống'
        });
      }

      // Check if patient exists
      const patient = await BenhNhan.findByPk(BenhNhanId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Bệnh nhân không tìm thấy'
        });
      }

      // Check if specialty exists
      const specialty = await ChuyenKhoa.findByPk(ChuyenKhoaId);
      if (!specialty) {
        return res.status(404).json({
          success: false,
          message: 'Chuyên khoa không tìm thấy'
        });
      }

      // If BacSiId provided, verify doctor exists 
      if (BacSiId) {
        const doctor = await BacSi.findByPk(BacSiId);
        if (!doctor) {
          return res.status(404).json({
            success: false,
            message: 'Bác sĩ không tìm thấy'
          });
        }

        // Kiểm tra lịch trùng cho bác sĩ
        const thoiGianBD = new Date(ThoiGianBatDau);
        const thoiGianKT = ThoiGianKetThuc ? new Date(ThoiGianKetThuc) : new Date(thoiGianBD.getTime() + 30 * 60000); // Default 30 minutes

        const conflictingAppointments = await LichKham.findAll({
          where: {
            BacSiId: BacSiId,
            TrangThai: {
              [Op.in]: ['ChoXacNhan', 'DaXacNhan']
            },
            [Op.or]: [
              {
                // Lịch mới bắt đầu trong khoảng lịch cũ
                ThoiGianBatDau: {
                  [Op.lte]: thoiGianBD
                },
                ThoiGianKetThuc: {
                  [Op.gt]: thoiGianBD
                }
              },
              {
                // Lịch mới kết thúc trong khoảng lịch cũ
                ThoiGianBatDau: {
                  [Op.lt]: thoiGianKT
                },
                ThoiGianKetThuc: {
                  [Op.gte]: thoiGianKT
                }
              },
              {
                // Lịch mới bao phủ lịch cũ
                ThoiGianBatDau: {
                  [Op.gte]: thoiGianBD
                },
                ThoiGianKetThuc: {
                  [Op.lte]: thoiGianKT
                }
              }
            ]
          }
        });

        if (conflictingAppointments.length > 0) {
          const conflictTime = new Date(conflictingAppointments[0].ThoiGianBatDau).toLocaleString('vi-VN');
          return res.status(400).json({
            success: false,
            message: `Bác sĩ đã có lịch khám trùng vào ${conflictTime}. Vui lòng chọn thời gian khác.`,
            conflictingAppointments: conflictingAppointments.map(apt => ({
              id: apt.LichKhamId,
              maLichKham: apt.MaLichKham,
              thoiGian: apt.ThoiGianBatDau
            }))
          });
        }
      }

      // Generate appointment code
      const maLichKham = await generateMaLichKham();

      // Create appointment
      const appointment = await LichKham.create({
        MaLichKham: maLichKham,
        BenhNhanId: BenhNhanId,
        BacSiId: BacSiId || null,
        ChuyenKhoaId: ChuyenKhoaId,
        ThoiGianBatDau: ThoiGianBatDau,
        ThoiGianKetThuc: ThoiGianKetThuc || null,
        TrieuChung: TrieuChung || '',
        TrangThai: 'ChoXacNhan',
        GhiChu: GhiChu,
        TaoBoi: req.user.id,
        CreatedAt: new Date()
      });

      // Fetch appointment with includes
      const createdAppointment = await LichKham.findByPk(appointment.LichKhamId, {
        include: [
          { model: BenhNhan, attributes: ['BenhNhanId', 'MaBenhNhan', 'HoTen', 'DienThoai'] },
          { 
            model: BacSi,
            include: [
              { model: NguoiDung, attributes: ['NguoiDungId', 'HoTen', 'Email'] }
            ]
          },
          { model: ChuyenKhoa, attributes: ['ChuyenKhoaId', 'TenChuyenKhoa'] }
        ]
      });

      // Tự động tạo thông báo cho bệnh nhân
      try {
        const tenBacSi = createdAppointment.BacSi?.NguoiDung?.HoTen || 'bác sĩ';
        const tenChuyenKhoa = createdAppointment.ChuyenKhoa?.TenChuyenKhoa || 'chuyên khoa';
        const thoiGian = new Date(ThoiGianBatDau).toLocaleString('vi-VN');
        
        await ThongBaoController.createNotification(
          BenhNhanId,
          appointment.LichKhamId,
          'YeuCauKham',
          'Đã tạo lịch khám mới',
          `Lịch khám ${maLichKham} của bạn đã được tạo. Thời gian: ${thoiGian} - ${tenChuyenKhoa}${BacSiId ? ` - Bác sĩ ${tenBacSi}` : ''}.`
        );

        // Tạo thông báo cho bác sĩ nếu đã chọn bác sĩ
        if (BacSiId) {
          await ThongBaoController.createNotification(
            null,
            appointment.LichKhamId,
            'YeuCauKham',
            'Lịch khám mới',
            `Bạn có lịch khám mới ${maLichKham} vào ${thoiGian}. Bệnh nhân: ${patient.HoTen}.`,
            BacSiId
          );
        }
      } catch (notifError) {
        console.error('Lỗi tạo thông báo:', notifError);
        // Không fail request nếu thông báo lỗi
      }

      res.status(201).json({
        success: true,
        message: 'Tạo lịch khám thành công',
        data: createdAppointment
      });
    } catch (error) {
      console.error('Create appointment error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Confirm appointment
  confirmAppointment: async (req, res) => {
    try {
      const { id } = req.params;
      const { bacSiId } = req.body || {};

      // Fetch appointment với include để lấy BenhNhanId
      const appointment = await LichKham.findByPk(id, {
        include: [
          { model: BenhNhan, attributes: ['BenhNhanId'] }
        ]
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Lịch khám không tìm thấy'
        });
      }

      if (appointment.TrangThai !== 'ChoXacNhan') {
        return res.status(400).json({
          success: false,
          message: 'Chỉ có thể xác nhận lịch khám ở trạng thái chờ xác nhận'
        });
      }

      const updateData = {
        TrangThai: 'DaXacNhan',
        ThoiGianXacNhan: new Date()
      };
      
      // Only set XacNhanBoi if user ID is valid
      if (req.user && req.user.id) {
        updateData.XacNhanBoi = req.user.id;
      }
      
      if (bacSiId) {
        updateData.BacSiId = bacSiId;
      }

      console.log('Confirm - Update data:', updateData);
      
      await appointment.update(updateData);

      // Tự động tạo thông báo xác nhận cho bệnh nhân
      try {
        const appointmentWithDetails = await LichKham.findByPk(id, {
          include: [
            { model: BenhNhan, attributes: ['HoTen'] },
            { model: BacSi, include: [{ model: NguoiDung, attributes: ['HoTen'] }] },
            { model: ChuyenKhoa, attributes: ['TenChuyenKhoa'] }
          ]
        });
        
        const tenBacSi = appointmentWithDetails.BacSi?.NguoiDung?.HoTen || 'bác sĩ';
        const thoiGian = new Date(appointmentWithDetails.ThoiGianBatDau).toLocaleString('vi-VN');
        
        await ThongBaoController.createNotification(
          appointmentWithDetails.BenhNhanId,
          id,
          'XacNhanLichKham',
          'Lịch khám đã được xác nhận',
          `Lịch khám ${appointmentWithDetails.MaLichKham} của bạn đã được xác nhận. Thời gian: ${thoiGian} - Bác sĩ ${tenBacSi}.`
        );
      } catch (notifError) {
        console.error('Lỗi tạo thông báo xác nhận:', notifError);
      }

      res.status(200).json({
        success: true,
        message: 'Xác nhận lịch khám thành công',
        data: appointment
      });
    } catch (error) {
      console.error('Confirm appointment error:');
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      console.error('Full error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  },

  // Cancel appointment
  cancelAppointment: async (req, res) => {
    try {
      const { id } = req.params;
      const { lyDoHuy } = req.body || {};

      const appointment = await LichKham.findByPk(id, {
        include: [
          { model: BenhNhan, attributes: ['BenhNhanId'] }
        ]
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Lịch khám không tìm thấy'
        });
      }

      if (appointment.TrangThai === 'DaHuy' || appointment.TrangThai === 'DaKham') {
        return res.status(400).json({
          success: false,
          message: 'Không thể hủy lịch khám này'
        });
      }

      const updateData = {
        TrangThai: 'DaHuy',
        LyDoHuy: lyDoHuy || '',
        ThoiGianHuy: new Date()
      };
      
      // Only set HuyBoi if user ID is valid
      if (req.user && req.user.id) {
        updateData.HuyBoi = req.user.id;
      }
      
      await appointment.update(updateData);

      // Tự động tạo thông báo hủy cho bệnh nhân
      try {
        const appointmentWithDetails = await LichKham.findByPk(id, {
          include: [
            { model: BenhNhan, attributes: ['HoTen'] },
            { model: BacSi, include: [{ model: NguoiDung, attributes: ['HoTen'] }] },
            { model: ChuyenKhoa, attributes: ['TenChuyenKhoa'] }
          ]
        });
        
        const thoiGian = new Date(appointmentWithDetails.ThoiGianBatDau).toLocaleString('vi-VN');
        const lyDoText = lyDoHuy ? ` Lý do: ${lyDoHuy}` : '';
        
        await ThongBaoController.createNotification(
          appointmentWithDetails.BenhNhanId,
          id,
          'HuyLichKham',
          'Lịch khám đã bị hủy',
          `Lịch khám ${appointmentWithDetails.MaLichKham} vào ${thoiGian} đã bị hủy.${lyDoText}`
        );

        // Thông báo cho bác sĩ nếu có
        if (appointmentWithDetails.BacSiId) {
          await ThongBaoController.createNotification(
            null,
            id,
            'HuyLichKham',
            'Lịch khám bị hủy',
            `Lịch khám ${appointmentWithDetails.MaLichKham} vào ${thoiGian} đã bị hủy. Bệnh nhân: ${appointmentWithDetails.BenhNhan?.HoTen}.${lyDoText}`,
            appointmentWithDetails.BacSiId
          );
        }
      } catch (notifError) {
        console.error('Lỗi tạo thông báo hủy:', notifError);
      }

      res.status(200).json({
        success: true,
        message: 'Hủy lịch khám thành công',
        data: appointment
      });
    } catch (error) {
      console.error('Cancel appointment error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Update appointment
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        BenhNhanId,
        BacSiId,
        ChuyenKhoaId,
        ThoiGianBatDau,
        ThoiGianKetThuc,
        TrieuChung,
        GhiChu
      } = req.body;

      const appointment = await LichKham.findByPk(id);

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Lịch khám không tìm thấy'
        });
      }

      // Only allow update for appointments not yet confirmed or completed (except QuanTri can edit any)
      if (req.user.role !== 'QuanTri' && (appointment.TrangThai === 'DaXacNhan' || appointment.TrangThai === 'DaKham')) {
        return res.status(400).json({
          success: false,
          message: 'Không thể sửa lịch khám đã xác nhận hoặc hoàn thành'
        });
      }

      await appointment.update({
        BenhNhanId: BenhNhanId || appointment.BenhNhanId,
        BacSiId: BacSiId || appointment.BacSiId,
        ChuyenKhoaId: ChuyenKhoaId || appointment.ChuyenKhoaId,
        ThoiGianBatDau: ThoiGianBatDau || appointment.ThoiGianBatDau,
        ThoiGianKetThuc: ThoiGianKetThuc || appointment.ThoiGianKetThuc,
        TrieuChung: TrieuChung !== undefined ? TrieuChung : appointment.TrieuChung,
        GhiChu: GhiChu !== undefined ? GhiChu : appointment.GhiChu,
        UpdatedAt: new Date()
      });

      // Fetch updated appointment with includes
      const updatedAppointment = await LichKham.findByPk(id, {
        include: [
          { model: BenhNhan, attributes: ['BenhNhanId', 'MaBenhNhan', 'HoTen', 'DienThoai'] },
          { 
            model: BacSi,
            include: [
              { model: NguoiDung, attributes: ['NguoiDungId', 'HoTen', 'Email'] }
            ]
          },
          { model: ChuyenKhoa, attributes: ['ChuyenKhoaId', 'TenChuyenKhoa'] }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Cập nhật lịch khám thành công',
        data: updatedAppointment
      });
    } catch (error) {
      console.error('Update appointment error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Delete appointment
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const appointment = await LichKham.findByPk(id);

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Lịch khám không tìm thấy'
        });
      }

      // Only allow deletion for appointments not yet completed
      // DaKham (completed) cannot be deleted
      // DaXacNhan, ChoXacNhan, DaHuy can be deleted
      if (appointment.TrangThai === 'DaKham') {
        return res.status(400).json({
          success: false,
          message: 'Không thể xoá lịch khám đã hoàn thành (đã khám)'
        });
      }

      await appointment.destroy();

      res.status(200).json({
        success: true,
        message: 'Xoá lịch khám thành công'
      });
    } catch (error) {
      console.error('Delete appointment error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Mark appointment as completed
  completeAppointment: async (req, res) => {
    try {
      const { id } = req.params;

      const appointment = await LichKham.findByPk(id, {
        include: [
          { model: BenhNhan, attributes: ['BenhNhanId'] }
        ]
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Lịch khám không tìm thấy'
        });
      }

      if (appointment.TrangThai !== 'DaXacNhan') {
        return res.status(400).json({
          success: false,
          message: 'Chỉ có thể đánh dấu hoàn thành lịch khám đã xác nhận'
        });
      }

      await appointment.update({
        TrangThai: 'DaKham',
        UpdatedAt: new Date()
      });

      res.status(200).json({
        success: true,
        message: 'Đánh dấu hoàn thành lịch khám thành công',
        data: appointment
      });
    } catch (error) {
      console.error('Complete appointment error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Xuất danh sách lịch khám ra Excel
  exportToExcel: async (req, res) => {
    try {
      const { status, startDate, endDate, bacSiId, chuyenKhoaId } = req.query;

      const where = {};
      if (status) where.TrangThai = status;
      if (bacSiId) where.BacSiId = bacSiId;
      if (chuyenKhoaId) where.ChuyenKhoaId = chuyenKhoaId;

      if (startDate || endDate) {
        where.ThoiGianBatDau = {};
        if (startDate) where.ThoiGianBatDau[Op.gte] = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          where.ThoiGianBatDau[Op.lte] = end;
        }
      }

      const appointments = await LichKham.findAll({
        where,
        include: [
          { model: BenhNhan, attributes: ['BenhNhanId', 'MaBenhNhan', 'HoTen', 'DienThoai'] },
          { 
            model: BacSi,
            include: [
              { model: NguoiDung, attributes: ['NguoiDungId', 'HoTen', 'Email'] }
            ]
          },
          { model: ChuyenKhoa, attributes: ['ChuyenKhoaId', 'TenChuyenKhoa'] }
        ],
        order: [['ThoiGianBatDau', 'ASC']]
      });

      const buffer = await ExportService.exportAppointmentsToExcel(appointments, { status, startDate, endDate });

      const filename = `LichKham_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      console.error('Export appointments to Excel error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi xuất file Excel',
        error: error.message
      });
    }
  }
};

module.exports = LichKhamController;
