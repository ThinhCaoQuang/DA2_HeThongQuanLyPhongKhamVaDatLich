const express = require('express');
const LichKhamController = require('../controllers/LichKhamController');
const AuthMiddleware = require('../middleware/AuthMiddleware');

const router = express.Router();

// All routes require authentication
router.use(AuthMiddleware.verifyToken);

// Export (must be before /:id to avoid route conflict)
router.get('/export/excel', AuthMiddleware.checkRole(['LeTan', 'QuanTri', 'QuanLy']), LichKhamController.exportToExcel);

// CRUD operations
router.get('/', AuthMiddleware.checkRole(['LeTan', 'QuanTri', 'QuanLy', 'BacSi']), LichKhamController.getAll);
router.get('/:id', AuthMiddleware.checkRole(['LeTan', 'QuanTri', 'QuanLy', 'BacSi']), LichKhamController.getById);
router.post('/', AuthMiddleware.checkRole(['LeTan', 'QuanTri', 'QuanLy']), LichKhamController.create);
router.put('/:id', AuthMiddleware.checkRole(['LeTan', 'QuanTri', 'QuanLy']), LichKhamController.update);
router.delete('/:id', AuthMiddleware.checkRole(['LeTan', 'QuanTri', 'QuanLy']), LichKhamController.delete);

// Special operations
router.post('/:id/confirm', AuthMiddleware.checkRole(['LeTan', 'QuanTri', 'QuanLy']), LichKhamController.confirmAppointment);
router.post('/:id/cancel', AuthMiddleware.checkRole(['LeTan', 'QuanTri', 'QuanLy']), LichKhamController.cancelAppointment);
router.post('/:id/complete', AuthMiddleware.checkRole(['BacSi']), LichKhamController.completeAppointment);

module.exports = router;
