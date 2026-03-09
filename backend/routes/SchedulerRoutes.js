const express = require('express');
const NotificationScheduler = require('../services/NotificationScheduler');
const AuthMiddleware = require('../middleware/AuthMiddleware');

const router = express.Router();

// Chạy thủ công nhắc lịch (để test) - Chỉ admin
router.post('/run-manual', 
  AuthMiddleware.verifyToken,
  AuthMiddleware.checkRole(['QuanTri']),
  async (req, res) => {
  try {
    await NotificationScheduler.runManualReminders();
    res.status(200).json({
      success: true,
      message: 'Đã gửi nhắc lịch thành công'
    });
  } catch (error) {
    console.error('Manual reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi gửi nhắc lịch',
      error: error.message
    });
  }
});

module.exports = router;
