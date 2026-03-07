const express = require('express');
const ThongBaoController = require('../controllers/ThongBaoController');
const AuthMiddleware = require('../middleware/AuthMiddleware');

const router = express.Router();

// All routes require authentication
router.use(AuthMiddleware.verifyToken);

// Specific routes must come BEFORE parameter routes (:id)
// Get unread count
router.get('/count/unread', AuthMiddleware.checkRole(['BenhNhan', 'BacSi', 'LeTan', 'QuanTri']), ThongBaoController.getUnreadCount);

// Mark all notifications as read
router.put('/read/all', AuthMiddleware.checkRole(['BenhNhan', 'BacSi', 'LeTan', 'QuanTri']), ThongBaoController.markAllAsRead);

// Get all notifications for logged-in user
router.get('/', AuthMiddleware.checkRole(['BenhNhan', 'BacSi', 'LeTan', 'QuanTri']), ThongBaoController.getAll);

// Parameter routes come LAST
// Mark single notification as read
router.put('/:id/read', AuthMiddleware.checkRole(['BenhNhan', 'BacSi', 'LeTan', 'QuanTri']), ThongBaoController.markAsRead);

// Get notification by ID
router.get('/:id', AuthMiddleware.checkRole(['BenhNhan', 'BacSi', 'LeTan', 'QuanTri']), ThongBaoController.getById);

// Delete notification
router.delete('/:id', AuthMiddleware.checkRole(['BenhNhan', 'BacSi', 'LeTan', 'QuanTri']), ThongBaoController.delete);

module.exports = router;

