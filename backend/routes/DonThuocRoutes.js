const express = require('express');
const DonThuocController = require('../controllers/DonThuocController');
const AuthMiddleware = require('../middleware/AuthMiddleware');

const router = express.Router();

// All routes require authentication
router.use(AuthMiddleware.verifyToken);

// Get prescriptions
router.get('/', DonThuocController.getAll);
router.get('/:id', DonThuocController.getById);

// Create/Update/Delete (BacSi, LeTan, QuanTri only)
router.post('/', AuthMiddleware.checkRole(['BacSi', 'LeTan', 'QuanTri', 'QuanLy']), DonThuocController.create);
router.put('/:id', AuthMiddleware.checkRole(['BacSi', 'LeTan', 'QuanTri', 'QuanLy']), DonThuocController.update);
router.delete('/:id', AuthMiddleware.checkRole(['BacSi', 'LeTan', 'QuanTri', 'QuanLy']), DonThuocController.delete);

// Export
router.get('/:id/export/pdf', AuthMiddleware.checkRole(['BacSi', 'LeTan', 'QuanTri', 'QuanLy']), DonThuocController.exportToPDF);

module.exports = router;
