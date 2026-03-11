const express = require('express');
const HoSoKhamBenhController = require('../controllers/HoSoKhamBenhController');
const AuthMiddleware = require('../middleware/AuthMiddleware');

const router = express.Router();

// All routes require authentication
router.use(AuthMiddleware.verifyToken);

// Get records
router.get('/', HoSoKhamBenhController.getAll);
router.get('/:id', HoSoKhamBenhController.getById);

// Create/Update/Delete
router.post('/find-or-create', AuthMiddleware.checkRole(['BacSi', 'QuanTri', 'QuanLy', 'LeTan']), HoSoKhamBenhController.findOrCreate);
router.post('/', AuthMiddleware.checkRole(['BacSi', 'QuanTri', 'QuanLy']), HoSoKhamBenhController.create);
router.put('/:id', AuthMiddleware.checkRole(['BacSi', 'LeTan', 'QuanTri', 'QuanLy']), HoSoKhamBenhController.update);
router.delete('/:id', AuthMiddleware.checkRole(['BacSi', 'LeTan', 'QuanTri', 'QuanLy']), HoSoKhamBenhController.delete);

module.exports = router;
