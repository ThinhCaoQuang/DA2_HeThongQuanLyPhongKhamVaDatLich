const cron = require('node-cron');
const { LichKham, BenhNhan, BacSi, NguoiDung } = require('../models');
const ThongBaoController = require('../controllers/ThongBaoController');
const { Op } = require('sequelize');

class NotificationScheduler {
  /**
   * Nhắc lịch khám cho bệnh nhân và bác sĩ
   * Chạy mỗi ngày lúc 8:00 sáng
   */
  static startDailyReminders() {
    // Chạy mỗi ngày lúc 8:00 sáng
    cron.schedule('0 8 * * *', async () => {
      console.log('Đang gửi nhắc lịch khám hàng ngày...');
      try {
        await this.sendTodayReminders();
        await this.sendTomorrowReminders();
        console.log('✓ Hoàn thành gửi nhắc lịch');
      } catch (error) {
        console.error('Lỗi gửi nhắc lịch:', error);
      }
    }, {
      timezone: "Asia/Ho_Chi_Minh"
    });

    console.log('✓ Đã khởi động scheduler nhắc lịch khám (chạy 8:00 sáng hàng ngày)');
  }

  /**
   * Gửi nhắc lịch cho các cuộc hẹn hôm nay
   */
  static async sendTodayReminders() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await LichKham.findAll({
      where: {
        ThoiGianBatDau: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        },
        TrangThai: {
          [Op.in]: ['ChoXacNhan', 'DaXacNhan']
        }
      },
      include: [
        { model: BenhNhan, attributes: ['BenhNhanId', 'HoTen'] },
        { 
          model: BacSi,
          include: [{ model: NguoiDung, attributes: ['HoTen'] }]
        }
      ]
    });

    console.log(`Tìm thấy ${appointments.length} lịch khám hôm nay`);

    for (const apt of appointments) {
      try {
        const thoiGian = new Date(apt.ThoiGianBatDau).toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        const tenBacSi = apt.BacSi?.NguoiDung?.HoTen || 'bác sĩ';

        // Nhắc bệnh nhân
        if (apt.BenhNhanId) {
          await ThongBaoController.createNotification(
            apt.BenhNhanId,
            apt.LichKhamId,
            'NhacLichKham',
            'Nhắc lịch khám hôm nay',
            `Bạn có lịch khám ${apt.MaLichKham} vào lúc ${thoiGian} hôm nay với ${tenBacSi}. Vui lòng đến đúng giờ.`
          );
        }

        // Nhắc bác sĩ
        if (apt.BacSiId) {
          await ThongBaoController.createNotification(
            null,
            apt.LichKhamId,
            'NhacLichKham',
            'Lịch khám hôm nay',
            `Bạn có lịch khám ${apt.MaLichKham} vào lúc ${thoiGian} hôm nay với bệnh nhân ${apt.BenhNhan?.HoTen}.`,
            apt.BacSiId
          );
        }

        console.log(`✓ Đã nhắc lịch ${apt.MaLichKham}`);
      } catch (error) {
        console.error(`Lỗi nhắc lịch ${apt.MaLichKham}:`, error);
      }
    }
  }

  /**
   * Gửi nhắc lịch cho các cuộc hẹn ngày mai
   */
  static async sendTomorrowReminders() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const appointments = await LichKham.findAll({
      where: {
        ThoiGianBatDau: {
          [Op.gte]: tomorrow,
          [Op.lt]: dayAfter
        },
        TrangThai: {
          [Op.in]: ['ChoXacNhan', 'DaXacNhan']
        }
      },
      include: [
        { model: BenhNhan, attributes: ['BenhNhanId', 'HoTen'] },
        { 
          model: BacSi,
          include: [{ model: NguoiDung, attributes: ['HoTen'] }]
        }
      ]
    });

    console.log(`Tìm thấy ${appointments.length} lịch khám ngày mai`);

    for (const apt of appointments) {
      try {
        const thoiGian = new Date(apt.ThoiGianBatDau).toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        const tenBacSi = apt.BacSi?.NguoiDung?.HoTen || 'bác sĩ';

        // Nhắc bệnh nhân
        if (apt.BenhNhanId) {
          await ThongBaoController.createNotification(
            apt.BenhNhanId,
            apt.LichKhamId,
            'NhacLichKham',
            'Nhắc lịch khám ngày mai',
            `Bạn có lịch khám ${apt.MaLichKham} vào lúc ${thoiGian} ngày mai với ${tenBacSi}. Đừng quên nhé!`
          );
        }

        console.log(`✓ Đã nhắc lịch ngày mai ${apt.MaLichKham}`);
      } catch (error) {
        console.error(`Lỗi nhắc lịch ngày mai ${apt.MaLichKham}:`, error);
      }
    }
  }

  /**
   * Chạy thủ công để test (gọi từ API hoặc script)
   */
  static async runManualReminders() {
    console.log('Chạy thủ công nhắc lịch...');
    await this.sendTodayReminders();
    await this.sendTomorrowReminders();
    console.log('✓ Hoàn thành nhắc lịch thủ công');
  }
}

module.exports = NotificationScheduler;
