const { LichKham, BenhNhan, BacSi, HoSoKhamBenh, DonThuoc, NguoiDung } = require('../models');
const { Op } = require('sequelize');

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

      // Upcoming appointments (next 5)
      const upcomingAppointments = await LichKham.findAll({
        where: {
          ThoiGianBatDau: {
            [Op.gte]: today
          }
        },
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

      // Recent medical records
      const recentMedicalRecords = await HoSoKhamBenh.findAll({
        include: [
          {
            model: BenhNhan,
            attributes: ['BenhNhanId', 'HoTen']
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
  }
};

module.exports = DashboardController;
