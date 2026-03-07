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
router.post('/', AuthMiddleware.checkRole(['BacSi', 'LeTan', 'QuanTri']), DonThuocController.create);
router.put('/:id', AuthMiddleware.checkRole(['BacSi', 'LeTan', 'QuanTri']), DonThuocController.update);
router.delete('/:id', AuthMiddleware.checkRole(['BacSi', 'LeTan', 'QuanTri']), DonThuocController.delete);

module.exports = router;
