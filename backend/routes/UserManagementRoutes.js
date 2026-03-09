const express = require('express');
const UserManagementController = require('../controllers/UserManagementController');
const AuthMiddleware = require('../middleware/AuthMiddleware');

const router = express.Router();

// Tất cả routes đều yêu cầu role QuanTri
router.use(AuthMiddleware.verifyToken);
router.use(AuthMiddleware.checkRole(['QuanTri']));

// Lấy danh sách người dùng (có filter)
router.get('/', UserManagementController.getAllUsers);

// Lấy chi tiết 1 người dùng
router.get('/:id', UserManagementController.getUserById);

// Tạo người dùng mới
router.post('/', UserManagementController.createUser);

// Cập nhật thông tin người dùng
router.put('/:id', UserManagementController.updateUser);

// Đổi mật khẩu
router.put('/:id/change-password', UserManagementController.changePassword);

// Kích hoạt/Vô hiệu hóa tài khoản
router.put('/:id/toggle-status', UserManagementController.toggleAccountStatus);

// Xóa người dùng
router.delete('/:id', UserManagementController.deleteUser);

module.exports = router;
