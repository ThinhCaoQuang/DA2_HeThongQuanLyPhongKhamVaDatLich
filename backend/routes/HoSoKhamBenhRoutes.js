const express = require('express');
const HoSoKhamBenhController = require('../controllers/HoSoKhamBenhController');
const AuthMiddleware = require('../middleware/AuthMiddleware');

const router = express.Router();

// All routes require authentication
router.use(AuthMiddleware.verifyToken);

// Get records (all authenticated users can view)
router.get('/', HoSoKhamBenhController.getAll);
router.get('/:id', HoSoKhamBenhController.getById);

// Create/Update/Delete - LeTan can only view, not create/edit/delete medical records
router.post('/find-or-create', AuthMiddleware.checkRole(['BacSi', 'QuanTri', 'QuanLy']), HoSoKhamBenhController.findOrCreate);
router.post('/', AuthMiddleware.checkRole(['BacSi', 'QuanTri', 'QuanLy']), HoSoKhamBenhController.create);
router.put('/:id', AuthMiddleware.checkRole(['BacSi', 'QuanTri', 'QuanLy']), HoSoKhamBenhController.update);
router.delete('/:id', AuthMiddleware.checkRole(['BacSi', 'QuanTri', 'QuanLy']), HoSoKhamBenhController.delete);

module.exports = router;
