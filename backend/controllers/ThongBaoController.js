const {
  ThongBao,
  BenhNhan,
  LichKham,
  BacSi,
  NguoiDung
} = require('../models');
const { Op } = require('sequelize');

// Generate notification code
const generateMaThongBao = async () => {
  const lastNotification = await ThongBao.findOne({
    order: [['ThongBaoId', 'DESC']]
  });

  const nextNumber = (lastNotification?.ThongBaoId || 0) + 1;
  return `TB${String(nextNumber).padStart(5, '0')}`;
};

const ThongBaoController = {
  // Get all notifications for user
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 10, daDoc } = req.query;
      const offset = (page - 1) * limit;
      
      const where = {};
      
      // Filter based on user type:
      // - BenhNhan: only show their own notifications (BenhNhanId matches)
      // - BacSi: only show notifications for them (BacSiId matches their BacSiId)
      // - LeTan/QuanTri/Admin: show all notifications (no filter)
      if (req.user?.BenhNhanId) {
        where.BenhNhanId = req.user.BenhNhanId;
      } else if (req.user?.BacSiId) {
        where.BacSiId = req.user.BacSiId;
      }
      
      if (daDoc !== undefined) {
        where.DaDoc = daDoc === 'true';
      }

      const { count, rows } = await ThongBao.findAndCountAll({
        where,
        offset,
        limit: parseInt(limit),
        include: [
          {
            model: LichKham,
            attributes: ['LichKhamId', 'MaLichKham', 'ThoiGianBatDau'],
            include: [
              { model: BacSi, attributes: ['BacSiId'] },
              { model: BenhNhan, attributes: ['BenhNhanId'] }
            ]
          }
        ],
        order: [['ThoiGianGui', 'DESC']]
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
      console.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Get notification by ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const where = { ThongBaoId: id };
      // If user is patient, only allow getting their own notifications
      if (req.user?.BenhNhanId) {
        where.BenhNhanId = req.user.BenhNhanId;
      }

      const notification = await ThongBao.findOne({
        where,
        include: [
          {
            model: LichKham,
            attributes: ['LichKhamId', 'MaLichKham', 'ThoiGianBatDau', 'TrieuChung', 'TrangThai']
          }
        ]
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông báo'
        });
      }

      res.status(200).json({
        success: true,
        data: notification
      });
    } catch (error) {
      console.error('Get notification by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Mark notification as read
  markAsRead: async (req, res) => {
    try {
      const { id } = req.params;
      
      const where = { ThongBaoId: id };
      // If user is patient, only allow marking their own notifications as read
      if (req.user?.BenhNhanId) {
        where.BenhNhanId = req.user.BenhNhanId;
      }

      const notification = await ThongBao.findOne({ where });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông báo'
        });
      }

      await notification.update({
        DaDoc: true,
        ThoiGianDoc: new Date()
      });

      res.status(200).json({
        success: true,
        message: 'Cập nhật thành công',
        data: notification
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (req, res) => {
    try {
      const where = { DaDoc: false };
      
      // If user is patient, only mark their own notifications as read
      if (req.user?.BenhNhanId) {
        where.BenhNhanId = req.user.BenhNhanId;
      }

      await ThongBao.update(
        { DaDoc: true, ThoiGianDoc: new Date() },
        { where }
      );

      res.status(200).json({
        success: true,
        message: 'Cập nhật thành công'
      });
    } catch (error) {
      console.error('Mark all as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Get unread count
  getUnreadCount: async (req, res) => {
    try {
      const where = { DaDoc: false };
      
      // If user is patient (BenhNhan), only count their own unread notifications
      // If user is doctor (BacSi), only count notifications for them
      if (req.user?.BenhNhanId) {
        where.BenhNhanId = req.user.BenhNhanId;
      } else if (req.user?.BacSiId) {
        where.BacSiId = req.user.BacSiId;
      }

      const count = await ThongBao.count({ where });

      res.status(200).json({
        success: true,
        data: { unreadCount: count }
      });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Delete notification
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      const where = { ThongBaoId: id };
      // If user is patient, only allow deleting their own notifications
      if (req.user?.BenhNhanId) {
        where.BenhNhanId = req.user.BenhNhanId;
      }

      const notification = await ThongBao.findOne({ where });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông báo'
        });
      }

      await notification.destroy();

      res.status(200).json({
        success: true,
        message: 'Xóa thành công'
      });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Internal: Create notification (không expose API)
  createNotification: async (benhnhanId, lichkhamId, loaiThongBao, tieuDe, noiDung, bacSiId = null) => {
    try {
      const maThongBao = await generateMaThongBao();

      const notification = await ThongBao.create({
        MaThongBao: maThongBao,
        BenhNhanId: benhnhanId || null,
        BacSiId: bacSiId || null,
        LichKhamId: lichkhamId,
        LoaiThongBao: loaiThongBao,
        TieuDe: tieuDe,
        NoiDung: noiDung,
        DaDoc: false,
        ThoiGianGui: new Date()
      });

      const recipient = benhnhanId ? `bệnh nhân ${benhnhanId}` : `bác sĩ ${bacSiId}`;
      console.log(`✓ Tạo thông báo: ${maThongBao} cho ${recipient}`);
      return notification;
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }
};

module.exports = ThongBaoController;
