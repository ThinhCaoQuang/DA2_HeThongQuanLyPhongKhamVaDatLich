const express = require('express');
const LichKhamController = require('../controllers/LichKhamController');
const AuthMiddleware = require('../middleware/AuthMiddleware');

const router = express.Router();

// All routes require authentication
router.use(AuthMiddleware.verifyToken);

// CRUD operations (LeTan, QuanTri, BacSi can read)
router.get('/', AuthMiddleware.checkRole(['LeTan', 'QuanTri', 'BacSi']), LichKhamController.getAll);
router.get('/:id', AuthMiddleware.checkRole(['LeTan', 'QuanTri', 'BacSi']), LichKhamController.getById);
router.post('/', AuthMiddleware.checkRole(['LeTan', 'QuanTri']), LichKhamController.create);
router.put('/:id', AuthMiddleware.checkRole(['LeTan', 'QuanTri']), LichKhamController.update);
router.delete('/:id', AuthMiddleware.checkRole(['LeTan', 'QuanTri']), LichKhamController.delete);

// Special operations
router.post('/:id/confirm', AuthMiddleware.checkRole(['LeTan', 'QuanTri']), LichKhamController.confirmAppointment);
router.post('/:id/cancel', AuthMiddleware.checkRole(['LeTan', 'QuanTri']), LichKhamController.cancelAppointment);
router.post('/:id/complete', AuthMiddleware.checkRole(['BacSi']), LichKhamController.completeAppointment);

// Export
router.get('/export/excel', AuthMiddleware.checkRole(['LeTan', 'QuanTri']), LichKhamController.exportToExcel);

module.exports = router;
