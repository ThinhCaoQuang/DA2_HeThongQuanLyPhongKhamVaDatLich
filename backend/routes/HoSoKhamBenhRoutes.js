const express = require('express');
const HoSoKhamBenhController = require('../controllers/HoSoKhamBenhController');
const AuthMiddleware = require('../middleware/AuthMiddleware');

const router = express.Router();

// All routes require authentication
router.use(AuthMiddleware.verifyToken);

// Get records (BacSi can view their own, LeTan/QuanTri can view all)
router.get('/', HoSoKhamBenhController.getAll);
router.get('/:id', HoSoKhamBenhController.getById);

// Create/Update/Delete (BacSi, LeTan, QuanTri only)
router.post('/', AuthMiddleware.checkRole(['BacSi', 'LeTan', 'QuanTri']), HoSoKhamBenhController.create);
router.put('/:id', AuthMiddleware.checkRole(['BacSi', 'LeTan', 'QuanTri']), HoSoKhamBenhController.update);
router.delete('/:id', AuthMiddleware.checkRole(['BacSi', 'LeTan', 'QuanTri']), HoSoKhamBenhController.delete);

// Export
router.get('/export/excel', AuthMiddleware.checkRole(['LeTan', 'QuanTri', 'BacSi']), HoSoKhamBenhController.exportToExcel);

module.exports = router;
