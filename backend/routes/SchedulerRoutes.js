const express = require('express');
const NotificationScheduler = require('../services/NotificationScheduler');
const AuthMiddleware = require('../middleware/AuthMiddleware');

const router = express.Router();

// Chỉ admin mới có thể chạy thủ công
router.use(AuthMiddleware.verifyToken);
router.use(AuthMiddleware.isAdmin);

// Chạy thủ công nhắc lịch (để test)
router.post('/run-manual', async (req, res) => {
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
