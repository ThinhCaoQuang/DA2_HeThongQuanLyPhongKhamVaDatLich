const { LichKham, BenhNhan, BacSi, HoSoKhamBenh, DonThuoc, NguoiDung, ChuyenKhoa } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');

const DashboardController = {
  getStatistics: async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - today.getDay());

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      // Total patients
      const totalPatients = await BenhNhan.count();

      // Total doctors
      const totalDoctors = await BacSi.count();

      // Appointments today
      const appointmentsToday = await LichKham.count({
        where: {
          ThoiGianBatDau: {
            [Op.gte]: today,
            [Op.lt]: tomorrow
          }
        }
      });

      // Appointments this week
      const appointmentsWeek = await LichKham.count({
        where: {
          ThoiGianBatDau: {
            [Op.gte]: weekStart,
            [Op.lt]: weekEnd
          }
        }
      });

      // Medical records created this month
      const monthStart = new Date(today);
      monthStart.setDate(1);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const medicalRecordsMonth = await HoSoKhamBenh.count({
        where: {
          CreatedAt: {
            [Op.gte]: monthStart,
            [Op.lt]: monthEnd
          }
        }
      });

      // Total prescriptions
      const totalPrescriptions = await DonThuoc.count();

      // Xác định BacSiId nếu user là bác sĩ
      let bacSiIdFilter = null;
      if (req.user?.role === 'BacSi') {
        const bacSi = await BacSi.findOne({ where: { NguoiDungId: req.user.id } });
        bacSiIdFilter = bacSi?.BacSiId || null;
      }

      // Upcoming appointments (next 5)
      const upcomingWhere = {
        ThoiGianBatDau: { [Op.gte]: today }
      };
      if (bacSiIdFilter) upcomingWhere.BacSiId = bacSiIdFilter;

      const upcomingAppointments = await LichKham.findAll({
        where: upcomingWhere,
        include: [
          {
            model: BenhNhan,
            attributes: ['BenhNhanId', 'HoTen', 'DienThoai']
          },
          {
            model: BacSi,
            attributes: ['BacSiId'],
            include: [
              {
                model: NguoiDung,
                attributes: ['HoTen']
              }
            ]
          }
        ],
        order: [['ThoiGianBatDau', 'ASC']],
        limit: 5
      });

      // Recent medical records (BacSi now lives in LanKham, not HoSoKhamBenh)
      const { LanKham } = require('../models');
      const recentMedicalRecords = await HoSoKhamBenh.findAll({
        include: [
          { model: BenhNhan, attributes: ['BenhNhanId', 'HoTen'] },
          {
            model: LanKham,
            separate: true,
            required: false,
            where: bacSiIdFilter ? { BacSiId: bacSiIdFilter } : undefined,
            include: [
              { model: BacSi, attributes: ['BacSiId'], include: [{ model: NguoiDung, attributes: ['HoTen'] }] }
            ],
            order: [['NgayKham', 'DESC']]
          }
        ],
        order: [['CreatedAt', 'DESC']],
        limit: 5
      });

      res.status(200).json({
        success: true,
        data: {
          stats: {
            totalPatients,
            totalDoctors,
            appointmentsToday,
            appointmentsWeek,
            medicalRecordsMonth,
            totalPrescriptions
          },
          upcomingAppointments,
          recentMedicalRecords
        }
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Thống kê tổng quan tỷ lệ hủy lịch khám
  getCancellationStatistics: async (req, res) => {
    try {
      const { startDate, endDate, period = 'month' } = req.query;

      // Default time range: last 6 months
      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate ? new Date(startDate) : new Date(end);
      if (!startDate) {
        start.setMonth(start.getMonth() - 6);
      }
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      // Tổng số lịch khám trong khoảng thời gian
      const totalAppointments = await LichKham.count({
        where: {
          CreatedAt: {
            [Op.between]: [start, end]
          }
        }
      });

      // Số lịch bị hủy
      const cancelledAppointments = await LichKham.count({
        where: {
          TrangThai: 'DaHuy',
          CreatedAt: {
            [Op.between]: [start, end]
          }
        }
      });

      // Tính phần trăm
      const cancellationRate = totalAppointments > 0 
        ? ((cancelledAppointments / totalAppointments) * 100).toFixed(2) 
        : 0;

      // Phân tích theo trạng thái
      const statusBreakdown = await LichKham.findAll({
        attributes: [
          'TrangThai',
          [sequelize.fn('COUNT', sequelize.col('LichKhamId')), 'count']
        ],
        where: {
          CreatedAt: {
            [Op.between]: [start, end]
          }
        },
        group: ['TrangThai'],
        raw: true
      });

      res.status(200).json({
        success: true,
        data: {
          period: { start, end },
          totalAppointments,
          cancelledAppointments,
          cancellationRate: parseFloat(cancellationRate),
          statusBreakdown
        }
      });
    } catch (error) {
      console.error('Get cancellation statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Xu hướng hủy lịch theo tháng
  getCancellationTrends: async (req, res) => {
    try {
      const { months = 6 } = req.query;

      const trends = [];
      const today = new Date();

      for (let i = parseInt(months) - 1; i >= 0; i--) {
        const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);

        const total = await LichKham.count({
          where: {
            CreatedAt: {
              [Op.between]: [monthStart, monthEnd]
            }
          }
        });

        const cancelled = await LichKham.count({
          where: {
            TrangThai: 'DaHuy',
            CreatedAt: {
              [Op.between]: [monthStart, monthEnd]
            }
          }
        });

        const rate = total > 0 ? ((cancelled / total) * 100).toFixed(2) : 0;

        trends.push({
          month: monthStart.toLocaleString('vi-VN', { month: 'long', year: 'numeric' }),
          monthKey: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`,
          totalAppointments: total,
          cancelledAppointments: cancelled,
          cancellationRate: parseFloat(rate)
        });
      }

      res.status(200).json({
        success: true,
        data: trends
      });
    } catch (error) {
      console.error('Get cancellation trends error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Phân tích lý do hủy phổ biến
  getCancellationReasons: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate ? new Date(startDate) : new Date(end);
      if (!startDate) {
        start.setMonth(start.getMonth() - 3);
      }
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      // Lấy tất cả lịch bị hủy có lý do
      const cancelledWithReasons = await LichKham.findAll({
        attributes: ['LyDoHuy', [sequelize.fn('COUNT', sequelize.col('LichKhamId')), 'count']],
        where: {
          TrangThai: 'DaHuy',
          LyDoHuy: {
            [Op.ne]: null,
            [Op.ne]: ''
          },
          ThoiGianHuy: {
            [Op.between]: [start, end]
          }
        },
        group: ['LyDoHuy'],
        order: [[sequelize.literal('count'), 'DESC']],
        limit: 10,
        raw: true
      });

      // Số lịch hủy không có lý do
      const cancelledWithoutReason = await LichKham.count({
        where: {
          TrangThai: 'DaHuy',
          [Op.or]: [
            { LyDoHuy: null },
            { LyDoHuy: '' }
          ],
          ThoiGianHuy: {
            [Op.between]: [start, end]
          }
        }
      });

      const totalCancelled = cancelledWithReasons.reduce((sum, item) => sum + parseInt(item.count), 0) + cancelledWithoutReason;

      res.status(200).json({
        success: true,
        data: {
          period: { start, end },
          totalCancelled,
          reasonsBreakdown: cancelledWithReasons.map(item => ({
            reason: item.LyDoHuy,
            count: parseInt(item.count),
            percentage: ((parseInt(item.count) / totalCancelled) * 100).toFixed(2)
          })),
          withoutReason: {
            count: cancelledWithoutReason,
            percentage: ((cancelledWithoutReason / totalCancelled) * 100).toFixed(2)
          }
        }
      });
    } catch (error) {
      console.error('Get cancellation reasons error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Tỷ lệ hủy theo bác sĩ
  getCancellationByDoctor: async (req, res) => {
    try {
      const { startDate, endDate, limit = 10 } = req.query;

      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate ? new Date(startDate) : new Date(end);
      if (!startDate) {
        start.setMonth(start.getMonth() - 3);
      }
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      // Lấy danh sách bác sĩ với thống kê
      const doctors = await BacSi.findAll({
        attributes: [
          'BacSiId',
          [sequelize.literal(`(
            SELECT COUNT(*) 
            FROM LichKham 
            WHERE LichKham.BacSiId = BacSi.BacSiId 
            AND LichKham.CreatedAt BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'
          )`), 'totalAppointments'],
          [sequelize.literal(`(
            SELECT COUNT(*) 
            FROM LichKham 
            WHERE LichKham.BacSiId = BacSi.BacSiId 
            AND LichKham.TrangThai = 'DaHuy'
            AND LichKham.ThoiGianHuy BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'
          )`), 'cancelledAppointments']
        ],
        include: [
          {
            model: NguoiDung,
            attributes: ['HoTen']
          },
          {
            model: ChuyenKhoa,
            attributes: ['TenChuyenKhoa']
          }
        ],
        having: sequelize.literal('totalAppointments > 0'),
        order: [[sequelize.literal('cancelledAppointments'), 'DESC']],
        limit: parseInt(limit),
        subQuery: false
      });

      const result = doctors.map(doctor => {
        const total = parseInt(doctor.get('totalAppointments')) || 0;
        const cancelled = parseInt(doctor.get('cancelledAppointments')) || 0;
        const rate = total > 0 ? ((cancelled / total) * 100).toFixed(2) : 0;

        return {
          doctorId: doctor.BacSiId,
          doctorName: doctor.NguoiDung?.HoTen || 'N/A',
          specialty: doctor.ChuyenKhoa?.TenChuyenKhoa || 'N/A',
          totalAppointments: total,
          cancelledAppointments: cancelled,
          cancellationRate: parseFloat(rate)
        };
      });

      res.status(200).json({
        success: true,
        data: {
          period: { start, end },
          doctors: result
        }
      });
    } catch (error) {
      console.error('Get cancellation by doctor error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Tỷ lệ hủy theo chuyên khoa
  getCancellationBySpecialty: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate ? new Date(startDate) : new Date(end);
      if (!startDate) {
        start.setMonth(start.getMonth() - 3);
      }
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const specialties = await ChuyenKhoa.findAll({
        attributes: [
          'ChuyenKhoaId',
          'TenChuyenKhoa',
          [sequelize.literal(`(
            SELECT COUNT(*) 
            FROM LichKham 
            WHERE LichKham.ChuyenKhoaId = ChuyenKhoa.ChuyenKhoaId 
            AND LichKham.CreatedAt BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'
          )`), 'totalAppointments'],
          [sequelize.literal(`(
            SELECT COUNT(*) 
            FROM LichKham 
            WHERE LichKham.ChuyenKhoaId = ChuyenKhoa.ChuyenKhoaId 
            AND LichKham.TrangThai = 'DaHuy'
            AND LichKham.ThoiGianHuy BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'
          )`), 'cancelledAppointments']
        ],
        having: sequelize.literal('totalAppointments > 0'),
        order: [[sequelize.literal('cancelledAppointments'), 'DESC']],
        subQuery: false
      });

      const result = specialties.map(specialty => {
        const total = parseInt(specialty.get('totalAppointments')) || 0;
        const cancelled = parseInt(specialty.get('cancelledAppointments')) || 0;
        const rate = total > 0 ? ((cancelled / total) * 100).toFixed(2) : 0;

        return {
          specialtyId: specialty.ChuyenKhoaId,
          specialtyName: specialty.TenChuyenKhoa,
          totalAppointments: total,
          cancelledAppointments: cancelled,
          cancellationRate: parseFloat(rate)
        };
      });

      res.status(200).json({
        success: true,
        data: {
          period: { start, end },
          specialties: result
        }
      });
    } catch (error) {
      console.error('Get cancellation by specialty error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  }
};

module.exports = DashboardController;
