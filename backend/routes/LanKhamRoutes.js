const express = require('express');
const router = express.Router();
const LanKhamController = require('../controllers/LanKhamController');
const AuthMiddleware = require('../middleware/AuthMiddleware');

router.use(AuthMiddleware.verifyToken);

// GET /lankham - lấy tất cả (cho combobox DonThuoc)
router.get('/', LanKhamController.getAll);

// GET /lankham/hoso/:hoSoId - lấy lần khám theo hồ sơ
router.get('/hoso/:hoSoId', LanKhamController.getByHoSo);

// POST /lankham - tạo lần khám mới
router.post('/', AuthMiddleware.checkRole(['BacSi', 'QuanTri', 'QuanLy']), LanKhamController.create);

// PUT /lankham/:id - cập nhật
router.put('/:id', AuthMiddleware.checkRole(['BacSi', 'QuanTri', 'QuanLy']), LanKhamController.update);

// DELETE /lankham/:id - xóa
router.delete('/:id', AuthMiddleware.checkRole(['BacSi', 'QuanTri', 'QuanLy']), LanKhamController.delete);

module.exports = router;
