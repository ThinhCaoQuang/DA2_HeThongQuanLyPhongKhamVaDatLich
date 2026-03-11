const express = require('express');
const BacSiController = require('../controllers/BacSiController');
const AuthMiddleware = require('../middleware/AuthMiddleware');

const router = express.Router();

// All routes require authentication
router.use(AuthMiddleware.verifyToken);

// READ operations - allowed for QuanTri, QuanLy, LeTan and BacSi
router.get('/', AuthMiddleware.checkRole(['QuanTri', 'QuanLy', 'LeTan', 'BacSi']), BacSiController.getAll);
router.get('/:id', AuthMiddleware.checkRole(['QuanTri', 'QuanLy', 'LeTan', 'BacSi']), BacSiController.getById);

// CREATE, UPDATE, DELETE operations - only for QuanTri/QuanLy
router.post('/', AuthMiddleware.checkRole(['QuanTri', 'QuanLy']), BacSiController.create);
router.put('/:id', AuthMiddleware.checkRole(['QuanTri', 'QuanLy']), BacSiController.update);
router.delete('/:id', AuthMiddleware.checkRole(['QuanTri', 'QuanLy']), BacSiController.delete);

// Add specialty to doctor - only for QuanTri/QuanLy
router.post('/:id/specialty', AuthMiddleware.checkRole(['QuanTri', 'QuanLy']), BacSiController.addSpecialty);

// Create BacSi record from existing NguoiDung account - only for QuanTri/QuanLy
router.post('/promote-to-doctor', AuthMiddleware.checkRole(['QuanTri', 'QuanLy']), BacSiController.createBacSiFromNguoiDung);

module.exports = router;
